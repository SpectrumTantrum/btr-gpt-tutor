"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { useClassroomStore } from "@/lib/store/classroom-store"

interface ImmersiveWrapperProps {
  readonly children: React.ReactNode
  readonly onToggleImmersive: () => void
}

export function ImmersiveWrapper({
  children,
  onToggleImmersive,
}: ImmersiveWrapperProps) {
  const isImmersive = useClassroomStore(
    (s) => s.playbackStatus?.isImmersive ?? false
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      const isInputField = tag === "input" || tag === "textarea"

      if (e.key === "Escape" && isImmersive) {
        onToggleImmersive()
        return
      }

      if (e.key === "f" && !isInputField && !e.metaKey && !e.ctrlKey) {
        onToggleImmersive()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isImmersive, onToggleImmersive])

  if (!isImmersive) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <button
        onClick={onToggleImmersive}
        aria-label="Exit immersive mode"
        className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-5" />
      </button>
      {children}
    </div>
  )
}
