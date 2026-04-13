import type { ClassroomAction } from "@/lib/core/types"
import type { ActionHandler } from "./action-types"
import type { WhiteboardEngine } from "@/lib/classroom/whiteboard/whiteboard-engine"
import type { WhiteboardStroke, WhiteboardTool } from "@/lib/core/types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPointArray(
  value: unknown
): value is { x: number; y: number }[] {
  if (!Array.isArray(value)) return false
  return value.every(
    (p) =>
      isRecord(p) &&
      typeof (p as Record<string, unknown>).x === "number" &&
      typeof (p as Record<string, unknown>).y === "number"
  )
}

const VALID_TOOLS: readonly WhiteboardTool[] = [
  "pen",
  "text",
  "shape",
  "eraser",
  "clear",
]

function parseStrokeFromData(
  data: Record<string, unknown>
): WhiteboardStroke | null {
  const { id, tool, points, color, width } = data

  if (
    typeof id !== "string" ||
    typeof tool !== "string" ||
    !isPointArray(points) ||
    typeof color !== "string" ||
    typeof width !== "number"
  ) {
    return null
  }

  if (!VALID_TOOLS.includes(tool as WhiteboardTool)) return null

  const stroke: WhiteboardStroke = {
    id,
    tool: tool as WhiteboardTool,
    points,
    color,
    width,
    text: typeof data.text === "string" ? data.text : undefined,
    shape:
      data.shape === "rect" ||
      data.shape === "circle" ||
      data.shape === "arrow" ||
      data.shape === "line"
        ? (data.shape as WhiteboardStroke["shape"])
        : undefined,
  }

  return stroke
}

export class WhiteboardDrawHandler implements ActionHandler {
  readonly type = "whiteboard_draw"

  constructor(private readonly engine: WhiteboardEngine) {}

  async execute(action: ClassroomAction): Promise<void> {
    if (!isRecord(action.data)) return

    const stroke = parseStrokeFromData(action.data)
    if (!stroke) return

    this.engine.addStroke(stroke)
  }
}

export class WhiteboardTextHandler implements ActionHandler {
  readonly type = "whiteboard_text"

  constructor(private readonly engine: WhiteboardEngine) {}

  async execute(action: ClassroomAction): Promise<void> {
    if (!isRecord(action.data)) return

    const { x, y, text, color, width } = action.data

    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof text !== "string" ||
      typeof color !== "string" ||
      typeof width !== "number"
    ) {
      return
    }

    const id =
      typeof action.data.id === "string" ? action.data.id : `text-${action.id}`

    const stroke: WhiteboardStroke = {
      id,
      tool: "text",
      points: [{ x, y }],
      color,
      width,
      text,
    }

    this.engine.addStroke(stroke)
  }
}

export class WhiteboardClearHandler implements ActionHandler {
  readonly type = "whiteboard_clear"

  constructor(private readonly engine: WhiteboardEngine) {}

  async execute(_action: ClassroomAction): Promise<void> {
    this.engine.clear()
  }
}
