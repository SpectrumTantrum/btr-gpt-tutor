"use client"

import { useCallback, useRef } from "react"
import { useCoWriterStore } from "@/lib/store/co-writer-store"
import { cn } from "@/lib/utils"

interface EditorProps {
  className?: string
}

export function Editor({ className }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const content = useCoWriterStore((s) => s.content)
  const setContent = useCoWriterStore((s) => s.setContent)
  const setSelection = useCoWriterStore((s) => s.setSelection)
  const clearSelection = useCoWriterStore((s) => s.clearSelection)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value)
    },
    [setContent]
  )

  const handleSelect = useCallback(
    (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const selected = el.value.slice(start, end)

      if (selected.length > 0) {
        setSelection(selected, start, end)
      } else {
        clearSelection()
      }
    },
    [setSelection, clearSelection]
  )

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      onSelect={handleSelect}
      onMouseUp={handleSelect}
      onKeyUp={handleSelect}
      spellCheck
      placeholder="Start writing in Markdown…"
      aria-label="Markdown editor"
      className={cn(
        "w-full h-full resize-none bg-background text-foreground",
        "font-mono text-sm leading-relaxed",
        "p-4 outline-none focus:outline-none",
        "placeholder:text-muted-foreground",
        className
      )}
    />
  )
}
