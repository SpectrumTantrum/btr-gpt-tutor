"use client"

import { useChatStore } from "@/lib/store/chat-store"
import type { ChatMode } from "@/lib/core/types"
import { cn } from "@/lib/utils"

interface ModeOption {
  value: ChatMode
  label: string
}

const MODE_OPTIONS: readonly ModeOption[] = [
  { value: "chat", label: "Chat" },
  { value: "deep_solve", label: "Deep Solve" },
  { value: "deep_research", label: "Deep Research" },
  { value: "vision_solver", label: "Vision" },
] as const

export function ModeSwitcher() {
  const { mode, setMode } = useChatStore()

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-full w-fit">
      {MODE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => setMode(option.value)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
            mode === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={mode === option.value}
          data-active={mode === option.value ? "true" : "false"}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
