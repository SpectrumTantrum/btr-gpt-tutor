"use client"

import { useState, type KeyboardEvent } from "react"
import { ArrowRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  onSend: (text: string) => void
  isDisabled?: boolean
}

export function ChatInput({ onSend, isDisabled = false }: ChatInputProps) {
  const [value, setValue] = useState("")

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || isDisabled) return
    onSend(trimmed)
    setValue("")
  }

  const canSubmit = Boolean(value.trim()) && !isDisabled

  return (
    <div className="border-t border-border bg-card/40 backdrop-blur-sm">
      <div className="reading-column px-6 py-5 sm:px-10">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="eyebrow">Inquiry</span>
          <span className="font-sans text-[0.6875rem] text-muted-foreground/70">
            ⏎ to submit · ⇧⏎ for newline
          </span>
        </div>
        <div className="flex items-end gap-3 border-t border-border/60 pt-3">
          <Textarea
            placeholder="Inquire of the text…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            rows={1}
            className="min-h-[44px] max-h-[200px] resize-none flex-1 border-0 bg-transparent px-0 font-serif text-[1rem] leading-relaxed shadow-none focus-visible:ring-0 placeholder:italic placeholder:text-muted-foreground/60"
          />
          <Button
            variant="ghost"
            onClick={submit}
            disabled={!canSubmit}
            aria-label="Submit inquiry"
            className="group h-9 gap-1.5 rounded-none border-b border-foreground/60 bg-transparent px-2 font-sans text-[0.75rem] uppercase tracking-[0.16em] text-foreground hover:border-primary hover:bg-transparent hover:text-primary disabled:border-transparent disabled:text-muted-foreground/40"
          >
            Submit
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
