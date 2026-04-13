"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import type { Classroom } from "@/lib/core/types"
import { Button } from "@/components/ui/button"
import { ExportDialog } from "@/components/export/export-dialog"
import { useClassroomStore } from "@/lib/store/classroom-store"
import { PlaybackEngine } from "@/lib/classroom/playback/playback-engine"
import { SlideCanvas } from "@/components/classroom/slide-renderer/slide-canvas"
import { PlaybackControls } from "@/components/classroom/playback-controls"
import { SceneNav } from "@/components/classroom/scene-nav"
import { AgentInfoBar } from "@/components/classroom/agent-info-bar"
import { DiscussionPanel } from "@/components/classroom/discussion-panel"
import { TtsPlayer } from "@/components/audio/tts-player"
import { AsrButton } from "@/components/audio/asr-button"
import { ImmersiveWrapper } from "@/components/classroom/immersive-wrapper"

export default function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const engineRef = useRef<PlaybackEngine | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const classroom = useClassroomStore((s) => s.classroom)
  const currentScene = useClassroomStore((s) => s.currentScene)
  const playbackStatus = useClassroomStore((s) => s.playbackStatus)
  const addDiscussionMessage = useClassroomStore((s) => s.addDiscussionMessage)
  const setClassroom = useClassroomStore((s) => s.setClassroom)
  const setCurrentScene = useClassroomStore((s) => s.setCurrentScene)
  const setPlaybackStatus = useClassroomStore((s) => s.setPlaybackStatus)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/classroom/${id}`)
        if (!response.ok) throw new Error("Failed to load classroom")
        const json: unknown = await response.json()
        if (
          json !== null &&
          typeof json === "object" &&
          "data" in json &&
          (json as { data: unknown }).data !== null
        ) {
          const data = (json as { data: Classroom }).data
          setClassroom(data)
          const engine = new PlaybackEngine(data.scenes.length)
          engineRef.current = engine
          setPlaybackStatus(engine.getStatus())
          setCurrentScene(data.scenes[0] ?? null)
        }
      } catch {
        // empty state shown below
      }
    }

    void load()

    return () => {
      setClassroom(null)
      setCurrentScene(null)
      setPlaybackStatus(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function dispatchPlayback(
    eventType: "play" | "pause" | "stop" | "next_scene" | "prev_scene"
  ) {
    const engine = engineRef.current
    const cls = classroom
    if (!engine || !cls) return

    engine.dispatch({ type: eventType })
    const status = engine.getStatus()
    setPlaybackStatus(status)
    const scene = cls.scenes[status.currentSceneIndex]
    if (scene) setCurrentScene(scene)
  }

  function dispatchToggleImmersive() {
    const engine = engineRef.current
    if (!engine) return
    engine.dispatch({ type: "toggle_immersive" })
    setPlaybackStatus(engine.getStatus())
  }

  function handleGotoScene(index: number) {
    const engine = engineRef.current
    const cls = classroom
    if (!engine || !cls) return

    engine.dispatch({ type: "goto_scene", index })
    const status = engine.getStatus()
    setPlaybackStatus(status)
    const scene = cls.scenes[index]
    if (scene) setCurrentScene(scene)
  }

  const handleDiscussionSend = useCallback(
    (text: string) => {
      addDiscussionMessage({ agentId: "user", agentName: "You", content: text })
    },
    [addDiscussionMessage]
  )

  const handleTranscript = useCallback(
    (transcript: string) => {
      addDiscussionMessage({ agentId: "user", agentName: "You", content: transcript })
    },
    [addDiscussionMessage]
  )

  const isPlaying = playbackStatus?.state === "playing"
  const currentAgentId = currentScene?.actions[0]?.agentId
  const currentAgent =
    classroom?.agents.find((a) => a.id === currentAgentId) ??
    classroom?.agents[0] ??
    null

  if (!classroom) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading classroom…</p>
      </div>
    )
  }

  return (
    <ImmersiveWrapper onToggleImmersive={dispatchToggleImmersive}>
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/classroom"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>
        <h1 className="text-sm font-semibold text-foreground">{classroom.title}</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsExportOpen(true)}
          className="ml-auto gap-1.5"
        >
          <Download className="size-3.5" />
          Export
        </Button>
      </div>

      <ExportDialog
        open={isExportOpen}
        classroomId={id}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: slide + controls */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
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

          <AgentInfoBar agent={currentAgent} isActive={isPlaying} />

          <div className="flex items-center justify-between gap-3">
            <PlaybackControls
              onPlay={() => dispatchPlayback("play")}
              onPause={() => dispatchPlayback("pause")}
              onStop={() => dispatchPlayback("stop")}
              onPrev={() => dispatchPlayback("prev_scene")}
              onNext={() => dispatchPlayback("next_scene")}
            />
            {currentScene?.narration && (
              <TtsPlayer text={currentScene.narration} />
            )}
          </div>

          <SceneNav
            scenes={classroom.scenes}
            currentIndex={playbackStatus?.currentSceneIndex ?? 0}
            onSelect={handleGotoScene}
          />
        </div>

        {/* Right: discussion */}
        <div className="flex w-80 shrink-0 flex-col gap-2 border-l border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Voice input</span>
            <AsrButton onTranscript={handleTranscript} />
          </div>
          <div className="flex-1 overflow-hidden">
            <DiscussionPanel onSend={handleDiscussionSend} />
          </div>
        </div>
      </div>
    </div>
    </ImmersiveWrapper>
  )
}
