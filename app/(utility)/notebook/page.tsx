"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useNotebookStore } from "@/lib/store/notebook-store"
import type { Notebook } from "@/lib/core/types"
import { NotebookList } from "@/components/notebook/notebook-list"
import { NotebookRecords } from "@/components/notebook/notebook-records"
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

export default function NotebookPage() {
  const { setNotebooks, addNotebook } = useNotebookStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    async function fetchNotebooks() {
      try {
        const res = await fetch("/api/notebook")
        const json: unknown = await res.json()
        if (
          json !== null &&
          typeof json === "object" &&
          "success" in json &&
          (json as { success: boolean }).success &&
          "data" in json
        ) {
          setNotebooks((json as { data: Notebook[] }).data)
        }
      } catch {
        toast.error("Failed to load notebooks")
      }
    }
    fetchNotebooks()
  }, [setNotebooks])

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    setIsCreating(true)

    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: newDescription.trim() }),
      })
      const json: unknown = await res.json()
      if (
        json !== null &&
        typeof json === "object" &&
        "success" in json &&
        (json as { success: boolean }).success &&
        "data" in json
      ) {
        addNotebook((json as { data: Notebook }).data)
        toast.success(`Created "${name}"`)
        setNewName("")
        setNewDescription("")
        setIsCreateOpen(false)
      } else {
        toast.error("Failed to create notebook")
      }
    } catch {
      toast.error("Failed to create notebook")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <NotebookList onCreateClick={() => setIsCreateOpen(true)} />
      <NotebookRecords />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Notebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nb-name">Name</Label>
              <Input
                id="nb-name"
                placeholder="e.g. Biology Notes"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nb-desc">Description (optional)</Label>
              <Input
                id="nb-desc"
                placeholder="Short description…"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !newName.trim()}
            >
              {isCreating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
