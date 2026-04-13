"use client"

import { useEffect, useRef } from "react"
import type { Message } from "@/lib/core/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./message-bubble"

interface MessageListProps {
  messages: readonly Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Ask a question about your documents to get started.
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 px-4 py-4">
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
