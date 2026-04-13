"use client"

import { useGuideStore } from "@/lib/store/guide-store"

export function GuidePageViewer() {
  const { guides, activeGuideId } = useGuideStore()

  const guide = guides.find((g) => g.id === activeGuideId) ?? null

  if (!guide) {
    return (
      <p className="text-sm text-muted-foreground mt-4">
        Generate a learning plan to get started.
      </p>
    )
  }

  const step = guide.steps[guide.currentStepIndex] ?? null

  if (!step) {
    return (
      <p className="text-sm text-muted-foreground mt-4">
        No step available.
      </p>
    )
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-background overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-base font-semibold">{step.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Step {guide.currentStepIndex + 1} of {guide.steps.length}
        </p>
      </div>
      <div className="px-6 py-5">
        {step.htmlContent ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            // Content is generated server-side from trusted KB sources
            dangerouslySetInnerHTML={{ __html: step.htmlContent }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{step.description}</p>
        )}
      </div>
    </div>
  )
}
