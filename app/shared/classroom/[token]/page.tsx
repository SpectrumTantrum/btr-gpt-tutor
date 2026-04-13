"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Classroom, Scene, SharedClassroom } from "@/lib/core/types"
import { SlideCanvas } from "@/components/classroom/slide-renderer/slide-canvas"
import { SceneNav } from "@/components/classroom/scene-nav"

interface SharedClassroomPayload {
  share: SharedClassroom
  classroom: Classroom
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SharedClassroomPayload }

export default function SharedClassroomPage() {
  const { token } = useParams<{ token: string }>()
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" })
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/shared/classroom/${token}`)
        const json: unknown = await res.json()

        if (!res.ok) {
          const errMsg =
            json !== null &&
            typeof json === "object" &&
            "error" in json &&
            typeof (json as { error: unknown }).error === "string"
              ? (json as { error: string }).error
              : "Failed to load shared classroom"
          setLoadState({ status: "error", message: errMsg })
          return
        }

        if (
          json !== null &&
          typeof json === "object" &&
          "data" in json &&
          (json as { data: unknown }).data !== null
        ) {
          const data = (json as { data: SharedClassroomPayload }).data
          setLoadState({ status: "ready", data })
        }
      } catch {
        setLoadState({ status: "error", message: "Failed to load shared classroom" })
      }
    }

    void load()
  }, [token])

  if (loadState.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading classroom…</p>
      </div>
    )
  }

  if (loadState.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-destructive">{loadState.message}</p>
      </div>
    )
  }

  const { classroom } = loadState.data
  const currentScene: Scene | undefined = classroom.scenes[currentSceneIndex]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">{classroom.title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Read-only shared view</p>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        {currentScene?.slide ? (
          <SlideCanvas slide={currentScene.slide} />
        ) : (
          <div
            className="flex w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20"
            style={{ aspectRatio: "16/9" }}
          >
            <p className="text-sm text-muted-foreground">
              {currentScene?.title ?? "No slide"}
            </p>
          </div>
        )}

        {currentScene?.narration && (
          <p className="rounded-md bg-muted/30 px-4 py-3 text-sm text-foreground">
            {currentScene.narration}
          </p>
        )}

        <SceneNav
          scenes={classroom.scenes}
          currentIndex={currentSceneIndex}
          onSelect={setCurrentSceneIndex}
        />
      </main>
    </div>
  )
}
