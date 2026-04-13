"use client"

import type { SoulTemplate } from "@/lib/core/types"
import { Separator } from "@/components/ui/separator"

// ============================================================
// Types
// ============================================================

interface SoulEditorProps {
  soul: SoulTemplate
  personaPreview: string
}

// ============================================================
// Component
// ============================================================

export function SoulEditor({ soul, personaPreview }: SoulEditorProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs">
      <p className="font-semibold text-foreground">{soul.name}</p>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Teaching Style
        </span>
        <p className="text-foreground/80">{soul.teachingStyle}</p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Tone
        </span>
        <p className="text-foreground/80">{soul.tone}</p>
      </div>

      {personaPreview.trim() !== "" && (
        <>
          <Separator />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Persona Preview
            </span>
            <p className="italic text-foreground/70">{personaPreview.trim()}</p>
          </div>
        </>
      )}
    </div>
  )
}
