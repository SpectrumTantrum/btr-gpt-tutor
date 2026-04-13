"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useQuizStore } from "@/lib/store/quiz-store"
import type { QuizAttempt } from "@/lib/core/types"
import { Button } from "@/components/ui/button"
import { QuestionCard } from "./question-card"

export function QuizViewer() {
  const { quizzes, activeQuizId, currentAttempt, setCurrentAttempt } = useQuizStore()

  const quiz = quizzes.find((q) => q.id === activeQuizId) ?? null
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleAnswerChange(questionId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  async function handleSubmit() {
    if (!quiz) return
    setIsSubmitting(true)

    try {
      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id] ?? "",
      }))

      const res = await fetch(`/api/quiz/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      })

      const json: unknown = await res.json()
      if (
        json !== null &&
        typeof json === "object" &&
        "success" in json &&
        (json as { success: boolean }).success &&
        "data" in json
      ) {
        setCurrentAttempt((json as { data: QuizAttempt }).data)
        toast.success("Quiz submitted!")
      } else {
        toast.error("Failed to grade quiz")
      }
    } catch {
      toast.error("Failed to grade quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleReset() {
    setAnswers({})
    setCurrentAttempt(null)
  }

  if (!quiz) {
    return (
      <p className="text-sm text-muted-foreground mt-4">
        Generate a quiz to get started.
      </p>
    )
  }

  const isRevealed = currentAttempt !== null

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{quiz.title}</h3>
        {isRevealed && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            Retry
          </Button>
        )}
      </div>

      {isRevealed && (
        <div className="rounded-lg bg-accent/40 px-4 py-3 text-sm font-medium">
          Score: {currentAttempt.score} / {currentAttempt.totalQuestions} (
          {Math.round((currentAttempt.score / currentAttempt.totalQuestions) * 100)}%)
        </div>
      )}

      <div className="space-y-3">
        {quiz.questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            answer={answers[question.id] ?? ""}
            onAnswerChange={(ans) => handleAnswerChange(question.id, ans)}
            isRevealed={isRevealed}
          />
        ))}
      </div>

      {!isRevealed && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Submitting…" : "Submit Quiz"}
        </Button>
      )}
    </div>
  )
}
