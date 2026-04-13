"use client"

import { useNotebookStore } from "@/lib/store/notebook-store"
import type { NotebookRecord } from "@/lib/core/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SOURCE_LABEL: Record<NotebookRecord["source"], string> = {
  chat: "Chat",
  quiz: "Quiz",
  guide: "Guide",
  research: "Research",
  "co-writer": "Co-Writer",
  manual: "Manual",
}

export function NotebookRecords() {
  const { records, activeNotebookId } = useNotebookStore()

  const filtered = activeNotebookId
    ? records.filter((r) => r.notebookId === activeNotebookId)
    : records

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground mt-4">
        {activeNotebookId
          ? "No records in this notebook yet."
          : "Select a notebook to view its records."}
      </p>
    )
  }

  return (
    <div className="space-y-3 mt-4">
      {filtered.map((record: NotebookRecord) => (
        <Card key={record.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium leading-tight">
              {record.title}
            </CardTitle>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {SOURCE_LABEL[record.source]}
            </Badge>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {record.content}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
