"use client"

import { useEffect, useState, useCallback } from "react"
import type { TutorBot } from "@/lib/core/types"
import { useTutorBotStore } from "@/lib/store/tutorbot-store"
import { BotList } from "@/components/tutorbot/bot-list"
import { BotConfig } from "@/components/tutorbot/bot-config"

export default function TutorBotPage() {
  const { bots, setBots, addBot } = useTutorBotStore()
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBots = useCallback(async () => {
    try {
      const response = await fetch("/api/tutorbot")
      if (!response.ok) throw new Error("Failed to load bots")
      const json: unknown = await response.json()
      if (
        json !== null &&
        typeof json === "object" &&
        "data" in json &&
        Array.isArray((json as { data: unknown }).data)
      ) {
        setBots((json as { data: TutorBot[] }).data)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bots")
    } finally {
      setIsLoading(false)
    }
  }, [setBots])

  useEffect(() => {
    void fetchBots()
  }, [fetchBots])

  function handleBotCreated(bot: TutorBot) {
    addBot(bot)
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">TutorBot</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and chat with AI tutors powered by soul templates.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {error !== null && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!isLoading && (
        <BotList bots={bots} onCreateClick={() => setIsConfigOpen(true)} />
      )}

      <BotConfig
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onCreated={handleBotCreated}
      />
    </div>
  )
}
