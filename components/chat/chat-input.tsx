"use client"

import { useState, type KeyboardEvent } from "react"
import { Send } from "lucide-react"
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

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="flex items-end gap-2">
        <Textarea
          placeholder="Ask about your documents… (Shift+Enter for newline)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          rows={1}
          className="min-h-[40px] max-h-[160px] resize-none flex-1"
        />
        <Button
          size="icon"
          onClick={submit}
          disabled={isDisabled || !value.trim()}
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
