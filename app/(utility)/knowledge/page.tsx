"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import type { KnowledgeBase } from "@/lib/core/types"
import { useKnowledgeStore } from "@/lib/store/knowledge-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function KnowledgePage() {
  const {
    knowledgeBases,
    isLoading,
    setKnowledgeBases,
    addKnowledgeBase,
    removeKnowledgeBase,
    setLoading,
  } = useKnowledgeStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchKbs() {
      setLoading(true)
      try {
        const res = await fetch("/api/knowledge")
        const json: unknown = await res.json()
        if (
          json !== null &&
          typeof json === "object" &&
          "success" in json &&
          (json as { success: boolean }).success &&
          "data" in json
        ) {
          setKnowledgeBases((json as { data: KnowledgeBase[] }).data)
        }
      } catch {
        toast.error("Failed to load knowledge bases")
      } finally {
        setLoading(false)
      }
    }
    fetchKbs()
  }, [setKnowledgeBases, setLoading])

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    setIsCreating(true)
    try {
      const res = await fetch("/api/knowledge", {
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
        addKnowledgeBase((json as { data: KnowledgeBase }).data)
        toast.success(`Created "${name}"`)
        setNewName("")
        setNewDescription("")
        setIsCreateOpen(false)
      } else {
        toast.error("Failed to create knowledge base")
      }
    } catch {
      toast.error("Failed to create knowledge base")
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(kb: KnowledgeBase) {
    try {
      await fetch(`/api/knowledge/${kb.id}`, { method: "DELETE" })
      removeKnowledgeBase(kb.id)
      toast.success(`Deleted "${kb.name}"`)
    } catch {
      toast.error("Failed to delete knowledge base")
    }
  }

  async function handleUpload(kb: KnowledgeBase, file: File) {
    setUploadingId(kb.id)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch(`/api/knowledge/${kb.id}/documents`, {
        method: "POST",
        body: form,
      })
      if (res.ok) {
        toast.success(`Uploaded "${file.name}" to "${kb.name}"`)
      } else {
        toast.error("Upload failed")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Knowledge Bases</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4 mr-2" />
          New Knowledge Base
        </Button>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-sm">Loading…</p>
      )}

      {!isLoading && knowledgeBases.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No knowledge bases yet. Create one to get started.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {knowledgeBases.map((kb) => (
          <Card key={kb.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold leading-tight">
                {kb.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => handleDelete(kb)}
                aria-label={`Delete ${kb.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {kb.description && (
                <p className="text-sm text-muted-foreground">{kb.description}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{kb.documentCount} docs</Badge>
                <Badge variant="secondary">{kb.chunkCount} chunks</Badge>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingId === kb.id}
                  asChild
                >
                  <span>
                    <Upload className="size-3.5 mr-1.5" />
                    {uploadingId === kb.id ? "Uploading…" : "Upload File"}
                  </span>
                </Button>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.txt,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(kb, file)
                    e.target.value = ""
                  }}
                />
              </label>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Knowledge Base</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="kb-name">Name</Label>
              <Input
                id="kb-name"
                placeholder="e.g. Biology Notes"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kb-desc">Description (optional)</Label>
              <Input
                id="kb-desc"
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
            <Button onClick={handleCreate} disabled={isCreating || !newName.trim()}>
              {isCreating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
