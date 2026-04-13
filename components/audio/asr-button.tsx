"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface AsrButtonProps {
  onTranscript: (text: string) => void
  className?: string
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList
}

type SpeechRecognitionResultList = {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

type SpeechRecognitionResult = {
  readonly isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

type SpeechRecognitionAlternative = {
  readonly transcript: string
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

export function AsrButton({ onTranscript, className }: AsrButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  function isSupportedBrowser(): boolean {
    return (
      typeof window !== "undefined" &&
      (!!window.SpeechRecognition || !!window.webkitSpeechRecognition)
    )
  }

  function handleToggle() {
    if (!isSupportedBrowser()) return

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0]
      if (result?.isFinal) {
        const transcript = result[0]?.transcript ?? ""
        if (transcript.trim()) {
          onTranscript(transcript.trim())
        }
      }
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  const supported = isSupportedBrowser()

  return (
    <button
      onClick={handleToggle}
      disabled={!supported}
      aria-label={isRecording ? "Stop recording" : "Start voice input"}
      title={!supported ? "Speech recognition not supported in this browser" : undefined}
      className={cn(
        "relative flex items-center justify-center rounded-full p-2 transition-colors",
        isRecording
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          : "border border-border bg-card text-foreground hover:bg-accent",
        !supported && "cursor-not-allowed opacity-40",
        className
      )}
    >
      {isRecording ? (
        <>
          <MicOff className="size-4" />
          <span className="absolute -right-0.5 -top-0.5 size-2.5 animate-pulse rounded-full bg-red-500 ring-2 ring-background" />
        </>
      ) : (
        <Mic className="size-4" />
      )}
    </button>
  )
}
