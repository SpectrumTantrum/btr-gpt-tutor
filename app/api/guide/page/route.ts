import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { DexieGuideRepository } from "@/lib/core/storage/guide-repo"
import { GuideService } from "@/lib/guide/guide-service"
import { generate } from "@/lib/core/ai/llm"

// ============================================================
// Validation schema
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const guidePageSchema = z.object({
  guideId: z.string().min(1),
  stepIndex: z.number().int().min(0),
  llmConfig: providerConfigSchema,
})

// ============================================================
// Prompt builder
// ============================================================

function buildPagePrompt(
  topic: string,
  stepTitle: string,
  stepDescription: string,
  chunks: readonly { content: string }[]
): string {
  const context = chunks
    .slice(0, 15)
    .map((c, i) => `[Source ${i + 1}]\n${c.content}`)
    .join("\n\n")

  return `You are an expert tutor writing educational content in HTML. Write a detailed, well-structured HTML page for one step of a learning guide.

Overall topic: ${topic}
Step title: ${stepTitle}
Step description: ${stepDescription}

Source material:
${context}

Requirements:
- Return only the HTML body content (no <html>, <head>, or <body> tags)
- Use semantic HTML: <h2> for main heading, <h3> for sub-headings, <p> for paragraphs, <ul>/<ol> for lists
- Include examples and explanations grounded in the source material
- Do not fabricate facts not present in the source material
- Keep it focused on this step only, approximately 300-600 words`
}

// ============================================================
// POST /api/guide/page
// ============================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = guidePageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { guideId, stepIndex, llmConfig } = parsed.data

  try {
    const db = new TutorDatabase()
    const knowledgeRepo = new DexieKnowledgeRepository(db)
    const guideRepo = new DexieGuideRepository(db)
    const guideService = new GuideService(guideRepo)

    const guide = await guideService.getGuide(guideId)
    if (guide === null) {
      return NextResponse.json({ success: false, error: "Guide not found" }, { status: 404 })
    }

    const step = guide.steps[stepIndex]
    if (step === undefined) {
      return NextResponse.json(
        { success: false, error: `Step index ${stepIndex} does not exist in this guide` },
        { status: 422 }
      )
    }

    const chunks = await knowledgeRepo.getChunks(guide.knowledgeBaseId)

    const prompt = buildPagePrompt(guide.topic, step.title, step.description, chunks)

    const result = await generate({
      config: llmConfig,
      messages: [{ role: "user", content: prompt }],
    })

    const htmlContent = result.text.trim()

    const updatedGuide = await guideService.setStepContent(guideId, stepIndex, htmlContent)

    return NextResponse.json({ success: true, data: updatedGuide })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate guide page"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
