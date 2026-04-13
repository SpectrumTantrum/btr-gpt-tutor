"use client"

import Link from "next/link"
import { Bot, Plus } from "lucide-react"
import type { TutorBot } from "@/lib/core/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ============================================================
// Types
// ============================================================

interface BotListProps {
  bots: readonly TutorBot[]
  onCreateClick: () => void
}

// ============================================================
// Status badge
// ============================================================

function StatusBadge({ status }: { status: TutorBot["status"] }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
        status === "active" &&
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        status === "stopped" &&
          "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
        status === "error" &&
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      )}
    >
      {status}
    </span>
  )
}

// ============================================================
// Component
// ============================================================

export function BotList({ bots, onCreateClick }: BotListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Your Bots</h2>
        <Button size="sm" onClick={onCreateClick} className="gap-1.5">
          <Plus className="size-3.5" />
          New Bot
        </Button>
      </div>

      {bots.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <Bot className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No bots yet. Create one above.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <Link
              key={bot.id}
              href={`/tutorbot/${bot.id}`}
              className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Bot className="size-4 shrink-0 text-muted-foreground" />
                  <h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {bot.name}
                  </h3>
                </div>
                <StatusBadge status={bot.status} />
              </div>

              {bot.persona && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {bot.persona}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
