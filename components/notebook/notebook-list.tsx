"use client"

import { Plus } from "lucide-react"
import { useNotebookStore } from "@/lib/store/notebook-store"
import type { Notebook } from "@/lib/core/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface NotebookListProps {
  onCreateClick: () => void
}

export function NotebookList({ onCreateClick }: NotebookListProps) {
  const { notebooks, activeNotebookId, setActiveNotebook } = useNotebookStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notebooks</h2>
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="size-4 mr-1.5" />
          New Notebook
        </Button>
      </div>

      {notebooks.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No notebooks yet. Create one to start saving notes.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notebooks.map((notebook: Notebook) => (
          <Card
            key={notebook.id}
            className={cn(
              "cursor-pointer transition-colors hover:border-ring",
              activeNotebookId === notebook.id && "border-ring bg-accent/30"
            )}
            onClick={() => setActiveNotebook(notebook.id)}
          >
            <CardHeader className="flex flex-row items-center gap-3 pb-2 pt-4 px-4">
              <span
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: notebook.color }}
                aria-hidden
              />
              <CardTitle className="text-sm font-medium leading-tight">
                {notebook.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {notebook.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {notebook.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {notebook.recordCount} record{notebook.recordCount !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
