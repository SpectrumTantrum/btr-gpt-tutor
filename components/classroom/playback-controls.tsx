"use client"

import { Play, Pause, Square, ChevronLeft, ChevronRight } from "lucide-react"
import { useClassroomStore } from "@/lib/store/classroom-store"
import { cn } from "@/lib/utils"

interface PlaybackControlsProps {
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onPrev: () => void
  onNext: () => void
}

export function PlaybackControls({
  onPlay,
  onPause,
  onStop,
  onPrev,
  onNext,
}: PlaybackControlsProps) {
  const playbackStatus = useClassroomStore((s) => s.playbackStatus)

  const isPlaying = playbackStatus?.state === "playing"
  const isIdle = !playbackStatus || playbackStatus.state === "idle"
  const isFirst = !playbackStatus || playbackStatus.currentSceneIndex === 0
  const isLast =
    !playbackStatus ||
    playbackStatus.currentSceneIndex >= playbackStatus.totalScenes - 1

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isFirst ? undefined : onPrev}
        disabled={isFirst}
        aria-label="Previous scene"
        className={cn(
          "rounded-md p-2 transition-colors",
          isFirst
            ? "cursor-not-allowed text-muted-foreground"
            : "hover:bg-accent text-foreground"
        )}
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="rounded-md bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
      </button>

      <button
        onClick={onStop}
        disabled={isIdle}
        aria-label="Stop"
        className={cn(
          "rounded-md p-2 transition-colors",
          isIdle
            ? "cursor-not-allowed text-muted-foreground"
            : "hover:bg-accent text-foreground"
        )}
      >
        <Square className="size-5" />
      </button>

      <button
        onClick={isLast ? undefined : onNext}
        disabled={isLast}
        aria-label="Next scene"
        className={cn(
          "rounded-md p-2 transition-colors",
          isLast
            ? "cursor-not-allowed text-muted-foreground"
            : "hover:bg-accent text-foreground"
        )}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
