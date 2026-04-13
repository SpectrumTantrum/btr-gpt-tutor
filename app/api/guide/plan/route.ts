import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { DexieGuideRepository } from "@/lib/core/storage/guide-repo"
import { GuideService } from "@/lib/guide/guide-service"
import { generate } from "@/lib/core/ai/llm"
import type { GuideStep } from "@/lib/core/types"

// ============================================================
// Validation schema
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const guidePlanSchema = z.object({
  knowledgeBaseId: z.string().min(1),
  topic: z.string().min(1),
  llmConfig: providerConfigSchema,
})

// ============================================================
// Prompt builder
// ============================================================

function buildPlanPrompt(
  topic: string,
  chunks: readonly { content: string }[]
): string {
  const context = chunks
    .slice(0, 15)
    .map((c, i) => `[Source ${i + 1}]\n${c.content}`)
    .join("\n\n")

  return `You are a curriculum designer. Using the provided source material, create a structured learning plan for the following topic.

Topic: ${topic}

Source material:
${context}

Return your answer as a valid JSON array only, with no additional text. Each element represents one learning step and must have:
- "title": a short title for this step
- "description": a 1-2 sentence description of what the learner will cover in this step

Aim for 4 to 6 steps that progress logically from foundational to advanced.

Example:
[
  { "title": "Introduction", "description": "Overview of the topic and why it matters." },
  { "title": "Core concepts", "description": "Key definitions and foundational ideas." }
]`
}

// ============================================================
// POST /api/guide/plan
// ============================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = guidePlanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { knowledgeBaseId, topic, llmConfig } = parsed.data

  try {
    const db = new TutorDatabase()
    const knowledgeRepo = new DexieKnowledgeRepository(db)
    const guideRepo = new DexieGuideRepository(db)
    const guideService = new GuideService(guideRepo)

    const chunks = await knowledgeRepo.getChunks(knowledgeBaseId)
    if (chunks.length === 0) {
      return NextResponse.json(
        { success: false, error: "Knowledge base has no chunks to build a guide from" },
        { status: 422 }
      )
    }

    const prompt = buildPlanPrompt(topic, chunks)

    const result = await generate({
      config: llmConfig,
      messages: [{ role: "user", content: prompt }],
    })

    let steps: Omit<GuideStep, "isCompleted">[]
    try {
      const raw = result.text.trim()
      const jsonStart = raw.indexOf("[")
      const jsonEnd = raw.lastIndexOf("]")
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON array found in LLM response")
      }
      steps = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as Omit<GuideStep, "isCompleted">[]
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to parse guide steps from LLM response" },
        { status: 502 }
      )
    }

    const guide = await guideService.createGuide({ knowledgeBaseId, topic, steps })

    return NextResponse.json({ success: true, data: guide }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create guide plan"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
