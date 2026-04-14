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
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="reading-column text-center">
          <div className="eyebrow text-primary/70">btr · gpt · tutor</div>
          <h1 className="mt-5 font-serif text-4xl font-normal leading-tight tracking-tight text-foreground">
            Pose a question.
          </h1>
          <p className="mt-3 font-serif italic text-lg text-muted-foreground">
            The corpus awaits your inquiry.
          </p>
          <div className="mt-10 rule-fleuron">
            <span>§</span>
          </div>
          <p className="mt-6 font-sans text-[0.8125rem] leading-relaxed text-muted-foreground/90">
            Select a knowledge base from the sidebar, then ask anything.
            Responses are grounded in your uploaded materials and annotated
            with numbered sources.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="px-6 py-16 sm:px-10 md:py-20">
        <div className="flex flex-col gap-16">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </ScrollArea>
  )
}
