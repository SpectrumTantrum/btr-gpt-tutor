"use client"

import { useState, useRef, useEffect } from "react"
import { nanoid } from "nanoid"
import { Bot } from "lucide-react"
import type { Message } from "@/lib/core/types"
import { MessageList } from "@/components/chat/message-list"
import { ChatInput } from "@/components/chat/chat-input"

// ============================================================
// Types
// ============================================================

interface BotChatProps {
  botId: string
  botName: string
}

// ============================================================
// Component
// ============================================================

export function BotChat({ botId, botName }: BotChatProps) {
  const [messages, setMessages] = useState<readonly Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  function addMessage(message: Message) {
    setMessages((prev) => [...prev, message])
  }

  function updateLastAssistantContent(content: string) {
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== "assistant") return prev
      return [...prev.slice(0, -1), { ...last, content }]
    })
  }

  async function handleSend(text: string) {
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    }
    addMessage(userMessage)
    setIsStreaming(true)

    const placeholder: Message = {
      id: nanoid(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    }
    addMessage(placeholder)

    const controller = new AbortController()
    abortRef.current = controller

    let accumulatedText = ""

    try {
      const response = await fetch(`/api/tutorbot/${botId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`Chat request failed: ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
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
              accumulatedText += (parsed as { text: string }).text
              updateLastAssistantContent(accumulatedText)
            }
          } catch {
            // non-JSON SSE line, skip
          }
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return
      const errorText = err instanceof Error ? err.message : "Chat failed"
      updateLastAssistantContent(`Error: ${errorText}`)
    } finally {
      if (accumulatedText === "") {
        updateLastAssistantContent("No response received.")
      }
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Bot header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bot className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{botName}</span>
        {isStreaming && (
          <span className="ml-auto animate-pulse text-xs text-muted-foreground">
            Thinking…
          </span>
        )}
      </div>

      <MessageList messages={messages} />
      <ChatInput
        onSend={(t) => { void handleSend(t) }}
        isDisabled={isStreaming}
      />
    </div>
  )
}
