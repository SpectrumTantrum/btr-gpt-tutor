"use client"

import { nanoid } from "nanoid"
import type { Citation, Message } from "@/lib/core/types"
import { useChatStore } from "@/lib/store/chat-store"
import { useSettingsStore } from "@/lib/store/settings-store"
import { MessageList } from "./message-list"
import { ChatInput } from "./chat-input"

export function ChatArea() {
  const {
    messages,
    isStreaming,
    addMessage,
    setStreaming,
    setCitations,
    selectedKnowledgeBaseIds,
  } = useChatStore()
  const { llmConfig, embeddingConfig } = useSettingsStore()

  async function handleSend(text: string) {
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    }
    addMessage(userMessage)
    setStreaming(true)

    const assistantId = nanoid()
    let accumulatedText = ""
    let citations: readonly Citation[] = []

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          knowledgeBaseIds: [...selectedKnowledgeBaseIds],
          llmConfig,
          embeddingConfig,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error(`Chat request failed: ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let nextIsCitations = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (line.startsWith("event: citations")) {
            nextIsCitations = true
          } else if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim()
            if (payload === "[DONE]") break

            try {
              const parsed: unknown = JSON.parse(payload)
              if (nextIsCitations && Array.isArray(parsed)) {
                citations = parsed as Citation[]
                setCitations(citations)
                nextIsCitations = false
              } else if (
                parsed !== null &&
                typeof parsed === "object" &&
                "text" in parsed &&
                typeof (parsed as { text: unknown }).text === "string"
              ) {
                accumulatedText += (parsed as { text: string }).text
              }
            } catch {
              // non-JSON line, skip
            }
          } else {
            nextIsCitations = false
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Chat failed"
      accumulatedText = `Error: ${message}`
    } finally {
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: accumulatedText || "No response received.",
        citations: citations.length > 0 ? citations : undefined,
        createdAt: Date.now(),
      }
      addMessage(assistantMessage)
      setStreaming(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} isDisabled={isStreaming} />
    </div>
  )
}
