"use client"

import { useState } from "react"
import { Wand2 } from "lucide-react"
import { useKnowledgeStore } from "@/lib/store/knowledge-store"
import { useClassroomStore } from "@/lib/store/classroom-store"

const MIN_SCENES = 3
const MAX_SCENES = 10
const DEFAULT_SCENES = 5

interface GenerationToolbarProps {
  onGenerate: (topic: string, knowledgeBaseId: string, sceneCount: number) => void
}

export function GenerationToolbar({ onGenerate }: GenerationToolbarProps) {
  const knowledgeBases = useKnowledgeStore((s) => s.knowledgeBases)
  const generationProgress = useClassroomStore((s) => s.generationProgress)
  const isGenerating = useClassroomStore((s) => s.isGenerating)

  const [topic, setTopic] = useState("")
  const [selectedKbId, setSelectedKbId] = useState("")
  const [sceneCount, setSceneCount] = useState(DEFAULT_SCENES)

  const progressPercent =
    generationProgress && generationProgress.total > 0
      ? Math.round((generationProgress.current / generationProgress.total) * 100)
      : 0

  function handleGenerate() {
    if (!topic.trim() || !selectedKbId || isGenerating) return
    onGenerate(topic.trim(), selectedKbId, sceneCount)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Generate Classroom</h2>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="gen-topic" className="mb-1 block text-xs text-muted-foreground">
            Topic
          </label>
          <input
            id="gen-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Introduction to Photosynthesis"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="w-full sm:w-48">
          <label htmlFor="gen-kb" className="mb-1 block text-xs text-muted-foreground">
            Knowledge Base
          </label>
          <select
            id="gen-kb"
            value={selectedKbId}
            onChange={(e) => setSelectedKbId(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select KB…</option>
            {knowledgeBases.map((kb) => (
              <option key={kb.id} value={kb.id}>
                {kb.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-40">
          <label htmlFor="gen-scenes" className="mb-1 block text-xs text-muted-foreground">
            Scenes: {sceneCount}
          </label>
          <input
            id="gen-scenes"
            type="range"
            min={MIN_SCENES}
            max={MAX_SCENES}
            value={sceneCount}
            onChange={(e) => setSceneCount(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || !selectedKbId || isGenerating}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wand2 className="size-4" />
          {isGenerating ? "Generating…" : "Generate"}
        </button>
      </div>

      {isGenerating && generationProgress && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{generationProgress.message}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
