import { NextRequest } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieTutorBotRepository } from "@/lib/core/storage/tutorbot-repo"
import { TutorBotEngine } from "@/lib/tutorbot/tutorbot-engine"

// ============================================================
// Validation schemas
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const createBotRequestSchema = z.object({
  name: z.string().min(1),
  persona: z.string().min(1),
  soulTemplateId: z.string().optional(),
  model: z.string().optional(),
  llmConfig: providerConfigSchema,
})

// ============================================================
// GET /api/tutorbot — list all bots
// ============================================================

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    const db = new TutorDatabase()
    const repo = new DexieTutorBotRepository(db)
    const bots = await repo.listBots()
    return Response.json({ success: true, data: bots })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list bots"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// POST /api/tutorbot — create a bot
// ============================================================

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = createBotRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, persona, soulTemplateId, model, llmConfig } = parsed.data

  try {
    const db = new TutorDatabase()
    const repo = new DexieTutorBotRepository(db)
    const engine = new TutorBotEngine(repo, llmConfig)

    const bot = await engine.createBot({ name, persona, soulTemplateId, model })
    return Response.json({ success: true, data: bot }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create bot"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
