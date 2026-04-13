"use client"

import { useState } from "react"
import { Pen, Type, Shapes, Eraser, Trash2 } from "lucide-react"
import type { WhiteboardTool } from "@/lib/core/types"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ffffff",
] as const

const STROKE_WIDTHS = [2, 4, 8] as const

interface ToolButton {
  readonly tool: WhiteboardTool
  readonly label: string
  readonly icon: React.ReactNode
}

const TOOL_BUTTONS: readonly ToolButton[] = [
  { tool: "pen", label: "Pen", icon: <Pen className="size-4" /> },
  { tool: "text", label: "Text", icon: <Type className="size-4" /> },
  { tool: "shape", label: "Shape", icon: <Shapes className="size-4" /> },
  { tool: "eraser", label: "Eraser", icon: <Eraser className="size-4" /> },
  { tool: "clear", label: "Clear", icon: <Trash2 className="size-4" /> },
]

interface WhiteboardToolbarProps {
  readonly onToolChange: (tool: WhiteboardTool) => void
  readonly onColorChange: (color: string) => void
  readonly onWidthChange: (width: number) => void
  readonly onClear: () => void
}

export function WhiteboardToolbar({
  onToolChange,
  onColorChange,
  onWidthChange,
  onClear,
}: WhiteboardToolbarProps) {
  const [activeTool, setActiveTool] = useState<WhiteboardTool>("pen")
  const [activeColor, setActiveColor] = useState<string>("#000000")
  const [activeWidth, setActiveWidth] = useState<number>(4)

  const handleToolClick = (tool: WhiteboardTool) => {
    if (tool === "clear") {
      onClear()
      return
    }
    setActiveTool(tool)
    onToolChange(tool)
  }

  const handleColorClick = (color: string) => {
    setActiveColor(color)
    onColorChange(color)
  }

  const handleWidthClick = (width: number) => {
    setActiveWidth(width)
    onWidthChange(width)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-2 shadow-sm">
      {/* Tool buttons */}
      <div className="flex flex-col gap-1">
        {TOOL_BUTTONS.map(({ tool, label, icon }) => (
          <button
            key={tool}
            onClick={() => handleToolClick(tool)}
            aria-label={label}
            title={label}
            className={cn(
              "flex items-center justify-center rounded-md p-2 transition-colors",
              activeTool === tool && tool !== "clear"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-foreground"
            )}
          >
            {icon}
          </button>
        ))}
      </div>

      <hr className="border-border" />

      {/* Color picker */}
      <div className="flex flex-col gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            aria-label={`Color ${color}`}
            title={color}
            className={cn(
              "size-6 rounded-full border-2 transition-transform hover:scale-110",
              activeColor === color
                ? "border-primary scale-110"
                : "border-transparent"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <hr className="border-border" />

      {/* Stroke width */}
      <div className="flex flex-col items-center gap-2">
        {STROKE_WIDTHS.map((width) => (
          <button
            key={width}
            onClick={() => handleWidthClick(width)}
            aria-label={`Stroke width ${width}`}
            title={`Width ${width}`}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded transition-colors",
              activeWidth === width ? "bg-primary/20" : "hover:bg-accent"
            )}
          >
            <span
              className="block rounded-full bg-foreground"
              style={{ width: width + 4, height: width + 4 }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
