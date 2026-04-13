"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useKnowledgeStore } from "@/lib/store/knowledge-store"
import { useGuideStore } from "@/lib/store/guide-store"
import type { GuidePlan } from "@/lib/core/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function GuidePlanner() {
  const { knowledgeBases } = useKnowledgeStore()
  const { addGuide, setActiveGuide } = useGuideStore()

  const [topic, setTopic] = useState("")
  const [selectedKbId, setSelectedKbId] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleGenerate() {
    const trimmedTopic = topic.trim()
    if (!trimmedTopic || !selectedKbId) return
    setIsGenerating(true)

    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmedTopic, knowledgeBaseId: selectedKbId }),
      })

      const json: unknown = await res.json()
      if (
        json !== null &&
        typeof json === "object" &&
        "success" in json &&
        (json as { success: boolean }).success &&
        "data" in json
      ) {
        const guide = (json as { data: GuidePlan }).data
        addGuide(guide)
        setActiveGuide(guide.id)
        toast.success("Learning plan generated!")
      } else {
        toast.error("Failed to generate plan")
      }
    } catch {
      toast.error("Failed to generate plan")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Generate Learning Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="guide-topic">Topic</Label>
          <Input
            id="guide-topic"
            placeholder="e.g. Introduction to Neural Networks"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Knowledge Base</Label>
          <Select value={selectedKbId} onValueChange={setSelectedKbId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a knowledge base…" />
            </SelectTrigger>
            <SelectContent>
              {knowledgeBases.map((kb) => (
                <SelectItem key={kb.id} value={kb.id}>
                  {kb.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim() || !selectedKbId}
          className="w-full"
        >
          {isGenerating ? "Generating…" : "Generate Plan"}
        </Button>
      </CardContent>
    </Card>
  )
}
