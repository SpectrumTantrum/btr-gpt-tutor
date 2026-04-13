"use client"

import { useEffect, useCallback, useState } from "react"
import { Download, Undo2, BookmarkPlus } from "lucide-react"
import { Editor } from "@/components/co-writer/editor"
import { AiToolbar } from "@/components/co-writer/ai-toolbar"
import { KbSelector } from "@/components/co-writer/kb-selector"
import { SaveToNotebook } from "@/components/notebook/save-to-notebook"
import { Button } from "@/components/ui/button"
import { useCoWriterStore } from "@/lib/store/co-writer-store"

export default function CoWriterPage() {
  const content = useCoWriterStore((s) => s.content)
  const history = useCoWriterStore((s) => s.history)
  const undo = useCoWriterStore((s) => s.undo)
  const selectedText = useCoWriterStore((s) => s.selectedText)

  const [saveOpen, setSaveOpen] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
    },
    [undo]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  function handleExport() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "document.md"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const canUndo = history.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Co-Writer</span>
          <KbSelector />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUndo}
            onClick={undo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo last AI edit"
          >
            <Undo2 className="size-4" />
            <span className="ml-1.5 hidden sm:inline">Undo</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            disabled={!content.trim()}
            onClick={() => setSaveOpen(true)}
            aria-label="Save to notebook"
          >
            <BookmarkPlus className="size-4" />
            <span className="ml-1.5 hidden sm:inline">Save to Notebook</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            disabled={!content.trim()}
            onClick={handleExport}
            aria-label="Export as Markdown"
          >
            <Download className="size-4" />
            <span className="ml-1.5 hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      {/* Editor area with floating AI toolbar */}
      <div className="relative flex-1 overflow-hidden">
        <Editor className="absolute inset-0" />

        {selectedText && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <AiToolbar />
          </div>
        )}
      </div>

      {/* Save to Notebook dialog */}
      <SaveToNotebook
        open={saveOpen}
        onOpenChange={setSaveOpen}
        defaultTitle="Co-Writer Document"
        content={content}
        source="co-writer"
      />
    </div>
  )
}
