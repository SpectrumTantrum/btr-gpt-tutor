"use client"

import { useState } from "react"
import { listSoulTemplates } from "@/lib/tutorbot/soul-templates"
import type { TutorBot } from "@/lib/core/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SoulEditor } from "./soul-editor"

// ============================================================
// Constants
// ============================================================

const AVAILABLE_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "claude-3-5-sonnet-20241022",
  "claude-3-haiku-20240307",
] as const

const SOUL_TEMPLATES = listSoulTemplates()

// ============================================================
// Types
// ============================================================

interface BotConfigProps {
  open: boolean
  onClose: () => void
  onCreated: (bot: TutorBot) => void
}

// ============================================================
// Component
// ============================================================

export function BotConfig({ open, onClose, onCreated }: BotConfigProps) {
  const [name, setName] = useState("")
  const [persona, setPersona] = useState("")
  const [soulTemplateId, setSoulTemplateId] = useState<string>("")
  const [model, setModel] = useState<string>(AVAILABLE_MODELS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedSoul =
    soulTemplateId !== ""
      ? (SOUL_TEMPLATES.find((s) => s.id === soulTemplateId) ?? null)
      : null

  function handleClose() {
    setName("")
    setPersona("")
    setSoulTemplateId("")
    setModel(AVAILABLE_MODELS[0])
    setError(null)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Name is required.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/tutorbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          persona: persona.trim(),
          soulTemplateId: soulTemplateId !== "" ? soulTemplateId : undefined,
          model,
        }),
      })

      if (!response.ok) {
        const json: unknown = await response.json()
        const message =
          json !== null &&
          typeof json === "object" &&
          "error" in json &&
          typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "Failed to create bot."
        throw new Error(message)
      }

      const json: unknown = await response.json()
      if (
        json !== null &&
        typeof json === "object" &&
        "data" in json &&
        (json as { data: unknown }).data !== null
      ) {
        onCreated((json as { data: TutorBot }).data)
        handleClose()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create bot.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create TutorBot</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bot-name">Name</Label>
            <Input
              id="bot-name"
              placeholder="e.g. Math Tutor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Persona */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bot-persona">Persona</Label>
            <Textarea
              id="bot-persona"
              placeholder="Describe this bot's personality and teaching approach…"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Soul template */}
          <div className="flex flex-col gap-1.5">
            <Label>Soul Template</Label>
            <Select
              value={soulTemplateId}
              onValueChange={setSoulTemplateId}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="None (use persona only)" />
              </SelectTrigger>
              <SelectContent>
                {SOUL_TEMPLATES.map((soul) => (
                  <SelectItem key={soul.id} value={soul.id}>
                    {soul.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Soul preview */}
          {selectedSoul !== null && (
            <SoulEditor soul={selectedSoul} personaPreview={persona} />
          )}

          {/* Model */}
          <div className="flex flex-col gap-1.5">
            <Label>Model</Label>
            <Select
              value={model}
              onValueChange={setModel}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error !== null && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating…" : "Create Bot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
