"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import type { WhiteboardStroke, WhiteboardTool } from "@/lib/core/types"
import { WhiteboardEngine } from "@/lib/classroom/whiteboard/whiteboard-engine"

interface ActiveStroke {
  readonly id: string
  readonly tool: WhiteboardTool
  readonly points: { x: number; y: number }[]
  readonly color: string
  readonly width: number
}

interface WhiteboardCanvasProps {
  readonly engineRef: React.RefObject<WhiteboardEngine>
  readonly activeTool: WhiteboardTool
  readonly color: string
  readonly strokeWidth: number
  readonly onStrokeAdded?: (stroke: WhiteboardStroke) => void
}

export function WhiteboardCanvas({
  engineRef,
  activeTool,
  color,
  strokeWidth,
  onStrokeAdded,
}: WhiteboardCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [strokes, setStrokes] = useState<readonly WhiteboardStroke[]>([])
  const [activeStroke, setActiveStroke] = useState<ActiveStroke | null>(null)
  const isDrawing = useRef(false)

  const syncStrokes = useCallback(() => {
    const engine = engineRef.current
    if (engine) {
      setStrokes(engine.getStrokes())
    }
  }, [engineRef])

  useEffect(() => {
    syncStrokes()
  }, [syncStrokes])

  const getSVGPoint = useCallback(
    (e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } => {
      const svg = svgRef.current
      if (!svg) return { x: 0, y: 0 }

      const rect = svg.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    },
    []
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (activeTool === "clear") return
      if (activeTool === "text") return

      e.currentTarget.setPointerCapture(e.pointerId)
      isDrawing.current = true

      const point = getSVGPoint(e)
      const id = `stroke-${Date.now()}-${Math.random().toString(36).slice(2)}`

      setActiveStroke({
        id,
        tool: activeTool,
        points: [point],
        color,
        width: strokeWidth,
      })
    },
    [activeTool, color, strokeWidth, getSVGPoint]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDrawing.current || !activeStroke) return

      const point = getSVGPoint(e)
      setActiveStroke((prev) => {
        if (!prev) return null
        return { ...prev, points: [...prev.points, point] }
      })
    },
    [activeStroke, getSVGPoint]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current || !activeStroke) return

    isDrawing.current = false

    const engine = engineRef.current
    if (!engine) {
      setActiveStroke(null)
      return
    }

    if (activeStroke.tool === "eraser") {
      const eraserPoints = activeStroke.points
      const current = engine.getStrokes()
      const toRemove = new Set<string>()

      for (const stroke of current) {
        for (const ep of eraserPoints) {
          for (const sp of stroke.points) {
            const dist = Math.hypot(ep.x - sp.x, ep.y - sp.y)
            if (dist <= activeStroke.width * 4) {
              toRemove.add(stroke.id)
              break
            }
          }
          if (toRemove.has(stroke.id)) break
        }
      }

      for (const id of toRemove) {
        engine.removeStroke(id)
      }
    } else {
      const finalized: WhiteboardStroke = {
        id: activeStroke.id,
        tool: activeStroke.tool,
        points: activeStroke.points,
        color: activeStroke.color,
        width: activeStroke.width,
      }
      engine.addStroke(finalized)
      onStrokeAdded?.(finalized)
    }

    syncStrokes()
    setActiveStroke(null)
  }, [activeStroke, engineRef, onStrokeAdded, syncStrokes])

  return (
    <svg
      ref={svgRef}
      className="h-full w-full touch-none bg-white"
      style={{ cursor: activeTool === "eraser" ? "cell" : "crosshair" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {strokes.map((stroke) => (
        <StrokeElement key={stroke.id} stroke={stroke} />
      ))}
      {activeStroke && activeStroke.tool !== "eraser" && (
        <StrokeElement
          stroke={{
            id: activeStroke.id,
            tool: activeStroke.tool,
            points: activeStroke.points,
            color: activeStroke.color,
            width: activeStroke.width,
          }}
        />
      )}
      {activeStroke && activeStroke.tool === "eraser" && (
        <EraserCursor
          point={
            activeStroke.points[activeStroke.points.length - 1] ?? {
              x: 0,
              y: 0,
            }
          }
          size={activeStroke.width * 4}
        />
      )}
    </svg>
  )
}

interface StrokeElementProps {
  readonly stroke: WhiteboardStroke
}

function StrokeElement({ stroke }: StrokeElementProps) {
  if (stroke.tool === "pen") {
    return <PenStroke stroke={stroke} />
  }
  if (stroke.tool === "text") {
    return <TextStroke stroke={stroke} />
  }
  if (stroke.tool === "shape") {
    return <ShapeStroke stroke={stroke} />
  }
  return null
}

function PenStroke({ stroke }: StrokeElementProps) {
  const d = buildPathData(stroke.points)
  if (!d) return null

  return (
    <path
      d={d}
      stroke={stroke.color}
      strokeWidth={stroke.width}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

function TextStroke({ stroke }: StrokeElementProps) {
  const origin = stroke.points[0]
  if (!origin) return null

  return (
    <foreignObject x={origin.x} y={origin.y} width={300} height={60}>
      <div
        // @ts-expect-error -- xmlns is valid on foreignObject children
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          color: stroke.color,
          fontSize: `${stroke.width * 4 + 10}px`,
          whiteSpace: "pre",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {stroke.text ?? ""}
      </div>
    </foreignObject>
  )
}

function ShapeStroke({ stroke }: StrokeElementProps) {
  const start = stroke.points[0]
  const end = stroke.points[stroke.points.length - 1]

  if (!start || !end) return null

  const sharedProps = {
    stroke: stroke.color,
    strokeWidth: stroke.width,
    fill: "none",
    strokeLinecap: "round" as const,
  }

  if (stroke.shape === "rect") {
    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)
    return <rect x={x} y={y} width={width} height={height} {...sharedProps} />
  }

  if (stroke.shape === "circle") {
    const cx = (start.x + end.x) / 2
    const cy = (start.y + end.y) / 2
    const rx = Math.abs(end.x - start.x) / 2
    const ry = Math.abs(end.y - start.y) / 2
    return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...sharedProps} />
  }

  // Covers "line", "arrow", and unrecognized shapes
  return (
    <line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      {...sharedProps}
    />
  )
}

interface EraserCursorProps {
  readonly point: { x: number; y: number }
  readonly size: number
}

function EraserCursor({ point, size }: EraserCursorProps) {
  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={size / 2}
      fill="rgba(200,200,200,0.4)"
      stroke="#999"
      strokeWidth={1}
      style={{ pointerEvents: "none" }}
    />
  )
}

function buildPathData(points: readonly { x: number; y: number }[]): string {
  if (points.length === 0) return ""

  const [first, ...rest] = points
  const move = `M ${first.x} ${first.y}`
  if (rest.length === 0) return move

  const lines = rest.map((p) => `L ${p.x} ${p.y}`).join(" ")
  return `${move} ${lines}`
}
