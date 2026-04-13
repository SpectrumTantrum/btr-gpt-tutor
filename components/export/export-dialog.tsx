"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ============================================================
// Types
// ============================================================

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  classroomId: string
}

type ExportFormat = "pptx" | "html" | "markdown"

// ============================================================
// Helpers
// ============================================================

function buildExportUrl(format: ExportFormat, classroomId: string): string {
  if (format === "pptx") return `/api/export/pptx?classroomId=${classroomId}`
  if (format === "html") return `/api/export/html?classroomId=${classroomId}`
  return `/api/export/markdown?classroomId=${classroomId}`
}

function filenameForFormat(format: ExportFormat): string {
  if (format === "pptx") return "classroom.pptx"
  if (format === "html") return "classroom.html"
  return "classroom.md"
}

// ============================================================
// Component
// ============================================================

export function ExportDialog({ open, onClose, classroomId }: ExportDialogProps) {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload(format: ExportFormat) {
    setDownloading(format)
    setError(null)

    try {
      const url = buildExportUrl(format, classroomId)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = filenameForFormat(format)
      anchor.click()
      URL.revokeObjectURL(objectUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed.")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Classroom</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pptx" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="pptx" className="flex-1">PPTX</TabsTrigger>
            <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
            <TabsTrigger value="markdown" className="flex-1">Markdown</TabsTrigger>
          </TabsList>

          <TabsContent value="pptx" className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Download all slides as a PowerPoint presentation (.pptx).
            </p>
            <Button
              onClick={() => { void handleDownload("pptx") }}
              disabled={downloading !== null}
              className="gap-2 self-start"
            >
              <Download className="size-4" />
              {downloading === "pptx" ? "Downloading…" : "Download PPTX"}
            </Button>
          </TabsContent>

          <TabsContent value="html" className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Download as a self-contained HTML file for offline viewing.
            </p>
            <Button
              onClick={() => { void handleDownload("html") }}
              disabled={downloading !== null}
              className="gap-2 self-start"
            >
              <Download className="size-4" />
              {downloading === "html" ? "Downloading…" : "Download HTML"}
            </Button>
          </TabsContent>

          <TabsContent value="markdown" className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Download scene content as Markdown — compatible with any text editor.
            </p>
            <Button
              onClick={() => { void handleDownload("markdown") }}
              disabled={downloading !== null}
              className="gap-2 self-start"
            >
              <Download className="size-4" />
              {downloading === "markdown" ? "Downloading…" : "Download Markdown"}
            </Button>
          </TabsContent>
        </Tabs>

        {error !== null && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
