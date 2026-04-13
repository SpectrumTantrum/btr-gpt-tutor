"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Bot } from "lucide-react"
import type { TutorBot } from "@/lib/core/types"
import { getSoulTemplate } from "@/lib/tutorbot/soul-templates"
import { BotChat } from "@/components/tutorbot/bot-chat"

export default function TutorBotDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [bot, setBot] = useState<TutorBot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBot() {
      try {
        const response = await fetch(`/api/tutorbot/${id}`)
        if (!response.ok) throw new Error("Failed to load bot")
        const json: unknown = await response.json()
        if (
          json !== null &&
          typeof json === "object" &&
          "data" in json &&
          (json as { data: unknown }).data !== null
        ) {
          setBot((json as { data: TutorBot }).data)
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load bot")
      } finally {
        setIsLoading(false)
      }
    }

    void loadBot()
  }, [id])

  const soul =
    bot?.soulTemplateId !== undefined
      ? getSoulTemplate(bot.soulTemplateId)
      : null

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (error !== null || bot === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-destructive">{error ?? "Bot not found."}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/tutorbot"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>
        <Bot className="size-4 shrink-0 text-muted-foreground" />
        <h1 className="text-sm font-semibold text-foreground">{bot.name}</h1>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <BotChat botId={bot.id} botName={bot.name} />
        </div>

        {/* Bot info sidebar */}
        <div className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border p-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Model
            </span>
            <p className="text-xs text-foreground">{bot.model}</p>
          </div>

          {bot.persona && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Persona
              </span>
              <p className="text-xs text-foreground/80">{bot.persona}</p>
            </div>
          )}

          {soul !== null && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Soul
                </span>
                <p className="text-xs font-medium text-foreground">{soul.name}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Teaching Style
                </span>
                <p className="text-xs text-foreground/80">{soul.teachingStyle}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Tone
                </span>
                <p className="text-xs text-foreground/80">{soul.tone}</p>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            <p className="text-xs text-foreground">{bot.status}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
