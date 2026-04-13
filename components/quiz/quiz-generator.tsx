"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useKnowledgeStore } from "@/lib/store/knowledge-store"
import { useQuizStore } from "@/lib/store/quiz-store"
import type { Quiz, QuestionType } from "@/lib/core/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const NUM_QUESTION_OPTIONS = [3, 5, 10] as const
type NumQuestions = (typeof NUM_QUESTION_OPTIONS)[number]

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "short_answer", label: "Short Answer" },
]

export function QuizGenerator() {
  const { knowledgeBases } = useKnowledgeStore()
  const { addQuiz, setActiveQuiz } = useQuizStore()

  const [selectedKbId, setSelectedKbId] = useState<string>("")
  const [numQuestions, setNumQuestions] = useState<NumQuestions>(5)
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["single_choice"])
  const [isGenerating, setIsGenerating] = useState(false)

  function toggleType(type: QuestionType) {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.length > 1
          ? prev.filter((t) => t !== type)
          : prev
        : [...prev, type]
    )
  }

  async function handleGenerate() {
    if (!selectedKbId) return
    setIsGenerating(true)

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledgeBaseId: selectedKbId,
          numQuestions,
          questionTypes: selectedTypes,
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
        const quiz = (json as { data: Quiz }).data
        addQuiz(quiz)
        setActiveQuiz(quiz.id)
        toast.success("Quiz generated!")
      } else {
        toast.error("Failed to generate quiz")
      }
    } catch {
      toast.error("Failed to generate quiz")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Generate Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="space-y-1.5">
          <Label>Number of Questions</Label>
          <div className="flex gap-2">
            {NUM_QUESTION_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setNumQuestions(n)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  numQuestions === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-ring"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Question Types</Label>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleType(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedTypes.includes(value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-ring"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedKbId}
          className="w-full"
        >
          {isGenerating ? "Generating…" : "Generate Quiz"}
        </Button>
      </CardContent>
    </Card>
  )
}
