"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Clock } from "lucide-react"
import type { Classroom } from "@/lib/core/types"
import { GenerationToolbar } from "@/components/classroom/generation-toolbar"
import { useClassroomStore } from "@/lib/store/classroom-store"
import { cn } from "@/lib/utils"

export default function ClassroomPage() {
  const router = useRouter()
  const setGenerationProgress = useClassroomStore((s) => s.setGenerationProgress)
  const setIsGenerating = useClassroomStore((s) => s.setIsGenerating)

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClassrooms = useCallback(async () => {
    try {
      const response = await fetch("/api/classroom")
      if (!response.ok) throw new Error("Failed to load classrooms")
      const json: unknown = await response.json()
      if (
        json !== null &&
        typeof json === "object" &&
        "data" in json &&
        Array.isArray((json as { data: unknown }).data)
      ) {
        setClassrooms((json as { data: Classroom[] }).data)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load classrooms")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchClassrooms()
  }, [fetchClassrooms])

  async function handleGenerate(
    topic: string,
    knowledgeBaseId: string,
    sceneCount: number
  ) {
    setIsGenerating(true)
    setGenerationProgress({
      phase: "outline",
      current: 0,
      total: sceneCount,
      message: "Generating outline…",
    })

    try {
      const response = await fetch("/api/classroom/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, knowledgeBaseId, sceneCount }),
      })

      if (!response.ok) throw new Error("Generation failed")

      const json: unknown = await response.json()
      if (
        json !== null &&
        typeof json === "object" &&
        "data" in json &&
        (json as { data: unknown }).data !== null &&
        typeof (json as { data: unknown }).data === "object" &&
        "id" in (json as { data: { id: unknown } }).data
      ) {
        const classroomId = (json as { data: { id: string } }).data.id
        setGenerationProgress({
          phase: "complete",
          current: sceneCount,
          total: sceneCount,
          message: "Done!",
        })
        router.push(`/classroom/${classroomId}`)
      }
    } catch (err: unknown) {
      setGenerationProgress({
        phase: "error",
        current: 0,
        total: 0,
        message: err instanceof Error ? err.message : "Generation failed",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Classroom</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate interactive AI-powered lessons from your knowledge bases.
        </p>
      </div>

      <GenerationToolbar onGenerate={handleGenerate} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Your Lessons</h2>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!isLoading && !error && classrooms.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
            <BookOpen className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No classrooms yet. Generate one above.
            </p>
          </div>
        )}

        {classrooms.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classrooms.map((classroom) => (
              <Link
                key={classroom.id}
                href={`/classroom/${classroom.id}`}
                className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
                    {classroom.title}
                  </h3>
                  <StatusBadge status={classroom.status} />
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="size-3" />
                  <span>{classroom.scenes.length} scenes</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{formatDate(classroom.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Classroom["status"] }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
        status === "ready" &&
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        status === "generating" &&
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        status === "error" &&
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      )}
    >
      {status}
    </span>
  )
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
