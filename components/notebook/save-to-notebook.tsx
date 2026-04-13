"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useNotebookStore } from "@/lib/store/notebook-store"
import type { NotebookRecord } from "@/lib/core/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SaveToNotebookProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTitle?: string
  content: string
  source: NotebookRecord["source"]
  sourceId?: string
}

export function SaveToNotebook({
  open,
  onOpenChange,
  defaultTitle = "",
  content,
  source,
  sourceId,
}: SaveToNotebookProps) {
  const { notebooks, addRecord } = useNotebookStore()
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>("")
  const [title, setTitle] = useState(defaultTitle)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!selectedNotebookId || !title.trim()) return
    setIsSaving(true)

    try {
      const res = await fetch(`/api/notebook/${selectedNotebookId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          source,
          sourceId,
        }),
      })

      const json: unknown = await res.json()
      if (
        json !== null &&
        typeof json === "object" &&
        "success" in json &&
        (json as { success: boolean }).success &&
        "data" in json
      ) {
        addRecord((json as { data: NotebookRecord }).data)
        toast.success("Saved to notebook")
        onOpenChange(false)
      } else {
        toast.error("Failed to save record")
      }
    } catch {
      toast.error("Failed to save record")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Notebook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="notebook-select">Notebook</Label>
            <Select value={selectedNotebookId} onValueChange={setSelectedNotebookId}>
              <SelectTrigger id="notebook-select" className="w-full">
                <SelectValue placeholder="Select a notebook…" />
              </SelectTrigger>
              <SelectContent>
                {notebooks.map((nb) => (
                  <SelectItem key={nb.id} value={nb.id}>
                    {nb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="record-title">Title</Label>
            <Input
              id="record-title"
              placeholder="Record title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !selectedNotebookId || !title.trim()}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
