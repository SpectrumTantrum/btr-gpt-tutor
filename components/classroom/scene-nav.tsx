"use client"

import type { Scene } from "@/lib/core/types"
import { cn } from "@/lib/utils"

interface SceneNavProps {
  scenes: readonly Scene[]
  currentIndex: number
  onSelect: (index: number) => void
}

export function SceneNav({ scenes, currentIndex, onSelect }: SceneNavProps) {
  return (
    <nav
      aria-label="Scene navigation"
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
    >
      {scenes.map((scene, index) => (
        <button
          key={scene.id}
          onClick={() => onSelect(index)}
          aria-label={`Go to scene ${index + 1}: ${scene.title}`}
          aria-current={index === currentIndex ? "true" : undefined}
          className={cn(
            "flex min-w-[120px] flex-col items-start gap-1 rounded-md border px-3 py-2 text-left text-xs transition-colors shrink-0",
            index === currentIndex
              ? "border-primary bg-primary/10 font-medium text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          <span className="font-mono text-[10px] opacity-60">{index + 1}</span>
          <span className="line-clamp-2 leading-tight">{scene.title}</span>
          <span className="capitalize text-[10px] opacity-50">{scene.type}</span>
        </button>
      ))}
    </nav>
  )
}
