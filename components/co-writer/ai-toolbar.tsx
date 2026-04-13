"use client"

import { useCallback } from "react"
import { RefreshCw, Expand, Minimize2, FileText } from "lucide-react"
import { useCoWriterStore } from "@/lib/store/co-writer-store"
import { useSettingsStore } from "@/lib/store/settings-store"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { CoWriterOperation } from "@/lib/core/types"

interface OperationConfig {
  readonly op: CoWriterOperation
  readonly label: string
  readonly icon: React.ComponentType<{ className?: string }>
}

const OPERATIONS: readonly OperationConfig[] = [
  { op: "rewrite", label: "Rewrite", icon: RefreshCw },
  { op: "expand", label: "Expand", icon: Expand },
  { op: "shorten", label: "Shorten", icon: Minimize2 },
  { op: "summarize", label: "Summarize", icon: FileText },
]

export function AiToolbar() {
  const selectedText = useCoWriterStore((s) => s.selectedText)
  const content = useCoWriterStore((s) => s.content)
  const knowledgeBaseId = useCoWriterStore((s) => s.knowledgeBaseId)
  const isStreaming = useCoWriterStore((s) => s.isStreaming)
  const pushHistory = useCoWriterStore((s) => s.pushHistory)
  const setIsStreaming = useCoWriterStore((s) => s.setIsStreaming)
  const replaceSelection = useCoWriterStore((s) => s.replaceSelection)
  const llmConfig = useSettingsStore((s) => s.llmConfig)
  const embeddingConfig = useSettingsStore((s) => s.embeddingConfig)

  const handleOperation = useCallback(
    async (operation: CoWriterOperation) => {
      if (!selectedText || isStreaming) return

      pushHistory(content)
      setIsStreaming(true)

      let accumulated = ""

      try {
        const res = await fetch("/api/co-writer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedText,
            operation,
            fullContent: content,
            knowledgeBaseId: knowledgeBaseId ?? undefined,
            llmConfig,
            embeddingConfig,
          }),
        })

        if (!res.ok || !res.body) {
          toast.error("Co-writer request failed")
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const rawText = decoder.decode(value, { stream: true })
          for (const line of rawText.split("\n")) {
            if (!line.startsWith("data: ")) continue
            const payload = line.slice(6).trim()
            if (payload === "[DONE]") break
            try {
              const parsed: unknown = JSON.parse(payload)
              if (
                parsed !== null &&
                typeof parsed === "object" &&
                "text" in parsed &&
                typeof (parsed as { text: unknown }).text === "string"
              ) {
                accumulated += (parsed as { text: string }).text
                replaceSelection(accumulated)
              }
            } catch {
              // Ignore malformed SSE frames
            }
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Co-writer failed"
        toast.error(message)
      } finally {
        setIsStreaming(false)
      }
    },
    [
      selectedText,
      content,
      knowledgeBaseId,
      isStreaming,
      llmConfig,
      embeddingConfig,
      pushHistory,
      setIsStreaming,
      replaceSelection,
    ]
  )

  if (!selectedText) return null

  return (
    <div
      role="toolbar"
      aria-label="AI writing actions"
      className="flex items-center gap-1 rounded-lg border border-border bg-popover px-2 py-1.5 shadow-md"
    >
      {OPERATIONS.map(({ op, label, icon: Icon }) => (
        <Button
          key={op}
          variant="ghost"
          size="sm"
          disabled={isStreaming}
          onClick={() => handleOperation(op)}
          className="gap-1.5 text-xs h-7 px-2"
        >
          <Icon className="size-3.5" />
          {label}
        </Button>
      ))}
    </div>
  )
}
