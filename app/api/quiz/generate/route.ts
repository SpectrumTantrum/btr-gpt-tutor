import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { DexieQuizRepository } from "@/lib/core/storage/quiz-repo"
import { QuizService } from "@/lib/quiz/quiz-service"
import { generate } from "@/lib/core/ai/llm"
import type { QuizQuestion } from "@/lib/core/types"

// ============================================================
// Validation schema
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const generateQuizSchema = z.object({
  knowledgeBaseId: z.string().min(1),
  numQuestions: z.number().int().min(1).max(20),
  questionTypes: z.array(z.enum(["single_choice", "multiple_choice", "short_answer"])).min(1),
  llmConfig: providerConfigSchema,
})

// ============================================================
// Prompt builder
// ============================================================

function buildQuizPrompt(
  chunks: readonly { content: string }[],
  numQuestions: number,
  questionTypes: readonly string[]
): string {
  const context = chunks
    .slice(0, 20)
    .map((c, i) => `[Source ${i + 1}]\n${c.content}`)
    .join("\n\n")

  const typeList = questionTypes.join(", ")

  return `You are a quiz generator. Using only the provided source material, create ${numQuestions} quiz question(s) of the following type(s): ${typeList}.

Source material:
${context}

Return your answer as a valid JSON array only, with no additional text. Each element must have:
- "id": a unique string (e.g. "q1", "q2")
- "type": one of ${typeList}
- "question": the question text
- "options": array of answer strings (required for single_choice and multiple_choice; omit for short_answer)
- "correctAnswer": the correct answer string (for choice types, must match one of the options exactly)
- "explanation": a brief explanation of why the answer is correct

Example:
[
  {
    "id": "q1",
    "type": "single_choice",
    "question": "What is X?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Because..."
  }
]`
}

// ============================================================
// POST /api/quiz/generate
// ============================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = generateQuizSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { knowledgeBaseId, numQuestions, questionTypes, llmConfig } = parsed.data

  try {
    const db = new TutorDatabase()
    const knowledgeRepo = new DexieKnowledgeRepository(db)
    const quizRepo = new DexieQuizRepository(db)
    const quizService = new QuizService(quizRepo)

    const chunks = await knowledgeRepo.getChunks(knowledgeBaseId)
    if (chunks.length === 0) {
      return NextResponse.json(
        { success: false, error: "Knowledge base has no chunks to generate a quiz from" },
        { status: 422 }
      )
    }

    const prompt = buildQuizPrompt(chunks, numQuestions, questionTypes)

    const result = await generate({
      config: llmConfig,
      messages: [{ role: "user", content: prompt }],
    })

    let questions: QuizQuestion[]
    try {
      const raw = result.text.trim()
      const jsonStart = raw.indexOf("[")
      const jsonEnd = raw.lastIndexOf("]")
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON array found in LLM response")
      }
      questions = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as QuizQuestion[]
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to parse quiz questions from LLM response" },
        { status: 502 }
      )
    }

    const kb = await knowledgeRepo.getKnowledgeBase(knowledgeBaseId)
    const title = `Quiz: ${kb?.name ?? knowledgeBaseId}`

    const quiz = await quizService.saveQuiz({
      knowledgeBaseId,
      title,
      questions,
      createdAt: Date.now(),
    })

    return NextResponse.json({ success: true, data: quiz }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate quiz"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
