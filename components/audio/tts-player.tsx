"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Loader2 } from "lucide-react"

interface TtsPlayerProps {
  text: string
}

export function TtsPlayer({ text }: TtsPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)

  useEffect(() => {
    return () => {
      sourceNodeRef.current?.stop()
      audioContextRef.current?.close()
    }
  }, [])

  async function handlePlay() {
    if (isLoading || isPlaying) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/media/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      sourceNodeRef.current = source

      source.onended = () => {
        setIsPlaying(false)
        audioContext.close()
      }

      source.start()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }

  function handlePause() {
    sourceNodeRef.current?.stop()
    sourceNodeRef.current = null
    setIsPlaying(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={isLoading || !text}
        aria-label={isPlaying ? "Pause narration" : "Play narration"}
        className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
        <span>{isPlaying ? "Pause" : "Play Narration"}</span>
      </button>
    </div>
  )
}
