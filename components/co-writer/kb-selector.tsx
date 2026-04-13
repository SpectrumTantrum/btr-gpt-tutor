"use client"

import { useEffect } from "react"
import { useCoWriterStore } from "@/lib/store/co-writer-store"
import { useKnowledgeStore } from "@/lib/store/knowledge-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { KnowledgeBase } from "@/lib/core/types"

const NO_KB_VALUE = "none"

export function KbSelector() {
  const knowledgeBaseId = useCoWriterStore((s) => s.knowledgeBaseId)
  const setKnowledgeBaseId = useCoWriterStore((s) => s.setKnowledgeBaseId)
  const { knowledgeBases, isLoading, setKnowledgeBases, setLoading } = useKnowledgeStore()

  useEffect(() => {
    if (knowledgeBases.length > 0) return

    setLoading(true)
    fetch("/api/knowledge")
      .then((res) => res.json())
      .then((json: unknown) => {
        if (
          json !== null &&
          typeof json === "object" &&
          "success" in json &&
          (json as { success: boolean }).success &&
          "data" in json &&
          Array.isArray((json as { data: unknown }).data)
        ) {
          setKnowledgeBases((json as { data: KnowledgeBase[] }).data)
        }
      })
      .catch(() => {
        // Non-fatal: selector will show empty state
      })
      .finally(() => setLoading(false))
  }, [knowledgeBases.length, setKnowledgeBases, setLoading])

  function handleChange(val: string) {
    setKnowledgeBaseId(val === NO_KB_VALUE ? null : val)
  }

  return (
    <Select
      value={knowledgeBaseId ?? NO_KB_VALUE}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-52" aria-label="Select knowledge base">
        <SelectValue placeholder="No KB context" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_KB_VALUE}>No KB context</SelectItem>
        {isLoading ? (
          <SelectItem value="__loading__" disabled>
            Loading…
          </SelectItem>
        ) : (
          knowledgeBases.map((kb) => (
            <SelectItem key={kb.id} value={kb.id}>
              {kb.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
