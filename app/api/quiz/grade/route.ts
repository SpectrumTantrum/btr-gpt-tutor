import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieQuizRepository } from "@/lib/core/storage/quiz-repo"
import { QuizService } from "@/lib/quiz/quiz-service"
import { generate } from "@/lib/core/ai/llm"
import type { QuizAnswer, QuizQuestion, ProviderConfig } from "@/lib/core/types"

// ============================================================
// Validation schema
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const gradeQuizSchema = z.object({
  quizId: z.string().min(1),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        userAnswer: z.string(),
      })
    )
    .min(1),
  llmConfig: providerConfigSchema,
})

// ============================================================
// Grading helpers
// ============================================================

function gradeChoiceAnswer(question: QuizQuestion, userAnswer: string): QuizAnswer {
  const isCorrect =
    userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
  return {
    questionId: question.id,
    userAnswer,
    isCorrect,
    feedback: isCorrect
      ? `Correct! ${question.explanation}`
      : `Incorrect. The correct answer is: ${question.correctAnswer}. ${question.explanation}`,
  }
}

async function gradeShortAnswer(
  question: QuizQuestion,
  userAnswer: string,
  llmConfig: ProviderConfig
): Promise<QuizAnswer> {
  const prompt = `You are a quiz grader. Evaluate the student's short answer against the expected answer.

Question: ${question.question}
Expected answer: ${question.correctAnswer}
Student's answer: ${userAnswer}

Respond with a JSON object only (no other text):
{
  "isCorrect": true or false,
  "feedback": "brief explanation of the grade"
}`

  try {
    const result = await generate({
      config: llmConfig,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = result.text.trim()
    const jsonStart = raw.indexOf("{")
    const jsonEnd = raw.lastIndexOf("}")
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON object in response")

    const gradeResult = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as {
      isCorrect: boolean
      feedback: string
    }

    return {
      questionId: question.id,
      userAnswer,
      isCorrect: Boolean(gradeResult.isCorrect),
      feedback: gradeResult.feedback ?? question.explanation,
    }
  } catch {
    return {
      questionId: question.id,
      userAnswer,
      isCorrect: false,
      feedback: `Could not auto-grade. Expected: ${question.correctAnswer}. ${question.explanation}`,
    }
  }
}

// ============================================================
// POST /api/quiz/grade
// ============================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = gradeQuizSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { quizId, answers, llmConfig } = parsed.data

  try {
    const db = new TutorDatabase()
    const quizRepo = new DexieQuizRepository(db)
    const quizService = new QuizService(quizRepo)

    const quiz = await quizService.getQuiz(quizId)
    if (quiz === null) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 })
    }

    const gradedAnswers: QuizAnswer[] = await Promise.all(
      answers.map(async ({ questionId, userAnswer }) => {
        const question = quiz.questions.find((q) => q.id === questionId)
        if (question === undefined) {
          return {
            questionId,
            userAnswer,
            isCorrect: false,
            feedback: "Question not found in quiz",
          } satisfies QuizAnswer
        }

        if (question.type === "short_answer") {
          return gradeShortAnswer(question, userAnswer, llmConfig)
        }

        return gradeChoiceAnswer(question, userAnswer)
      })
    )

    const attempt = await quizService.saveAttempt(quizId, gradedAnswers)

    return NextResponse.json({ success: true, data: attempt }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to grade quiz"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
