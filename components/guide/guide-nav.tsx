"use client"

import { Check } from "lucide-react"
import { useGuideStore } from "@/lib/store/guide-store"
import { cn } from "@/lib/utils"

export function GuideNav() {
  const { guides, activeGuideId, updateGuide } = useGuideStore()

  const guide = guides.find((g) => g.id === activeGuideId) ?? null

  if (!guide) return null

  function handleStepClick(index: number) {
    if (!guide) return
    updateGuide(guide.id, { currentStepIndex: index })
  }

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Steps
      </p>
      {guide.steps.map((step, index) => {
        const isActive = guide.currentStepIndex === index
        const isCompleted = step.isCompleted

        return (
          <button
            key={index}
            onClick={() => handleStepClick(index)}
            className={cn(
              "w-full flex items-start gap-2.5 rounded-md px-3 py-2 text-sm text-left transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border text-xs",
                isCompleted
                  ? "border-green-500 bg-green-500 text-white"
                  : isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border"
              )}
            >
              {isCompleted ? (
                <Check className="size-2.5" />
              ) : (
                <span className="text-[10px] leading-none">{index + 1}</span>
              )}
            </span>
            <span className="leading-snug">{step.title}</span>
          </button>
        )
      })}
    </nav>
  )
}
