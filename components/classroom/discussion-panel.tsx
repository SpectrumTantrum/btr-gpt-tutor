"use client"

import { useRef, useEffect, useState } from "react"
import { Send } from "lucide-react"
import { useClassroomStore } from "@/lib/store/classroom-store"

interface DiscussionPanelProps {
  onSend?: (text: string) => void
}

export function DiscussionPanel({ onSend }: DiscussionPanelProps) {
  const discussionMessages = useClassroomStore((s) => s.discussionMessages)
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [discussionMessages])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return
    onSend?.(trimmed)
    setInput("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-2">
        <h2 className="text-sm font-semibold text-foreground">Discussion</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {discussionMessages.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No messages yet
          </p>
        ) : (
          discussionMessages.map((msg, index) => (
            <div key={index} className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-primary">
                {msg.agentName}
              </span>
              <p className="text-sm leading-relaxed text-foreground">
                {msg.content}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            rows={2}
            className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
            className="self-end rounded-md bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
