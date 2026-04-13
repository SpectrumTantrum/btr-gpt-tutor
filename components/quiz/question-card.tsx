"use client"

import type { QuizQuestion } from "@/lib/core/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  question: QuizQuestion
  answer: string
  onAnswerChange: (answer: string) => void
  isRevealed: boolean
}

export function QuestionCard({
  question,
  answer,
  onAnswerChange,
  isRevealed,
}: QuestionCardProps) {
  const isMultiple = question.type === "multiple_choice"
  const isShortAnswer = question.type === "short_answer"

  function handleOptionToggle(option: string) {
    if (!isMultiple) {
      onAnswerChange(option)
      return
    }
    const current = answer ? answer.split("|||") : []
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option]
    onAnswerChange(updated.join("|||"))
  }

  function isOptionSelected(option: string): boolean {
    if (isMultiple) {
      return answer ? answer.split("|||").includes(option) : false
    }
    return answer === option
  }

  function getOptionClass(option: string): string {
    if (!isRevealed) {
      return isOptionSelected(option)
        ? "border-primary bg-primary/10 text-foreground"
        : "border-border text-muted-foreground hover:border-ring"
    }
    if (option === question.correctAnswer) {
      return "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
    }
    if (isOptionSelected(option) && option !== question.correctAnswer) {
      return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
    }
    return "border-border text-muted-foreground opacity-60"
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium leading-relaxed">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isShortAnswer ? (
          <Input
            placeholder="Your answer…"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={isRevealed}
          />
        ) : (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => !isRevealed && handleOptionToggle(option)}
                disabled={isRevealed}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md border text-sm transition-colors",
                  getOptionClass(option)
                )}
              >
                <span className="mr-2 text-xs">
                  {isMultiple
                    ? isOptionSelected(option) ? "☑" : "☐"
                    : isOptionSelected(option) ? "●" : "○"}
                </span>
                {option}
              </button>
            ))}
          </div>
        )}

        {isRevealed && (
          <div className="mt-3 pt-3 border-t space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Correct answer:</p>
            <p className="text-sm text-foreground">{question.correctAnswer}</p>
            {question.explanation && (
              <>
                <p className="text-xs font-medium text-muted-foreground mt-2">Explanation:</p>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
