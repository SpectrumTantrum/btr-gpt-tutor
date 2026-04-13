import { NextRequest } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieTutorBotRepository } from "@/lib/core/storage/tutorbot-repo"

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================
// Validation schema
// ============================================================

const updateBotSchema = z.object({
  name: z.string().min(1).optional(),
  persona: z.string().min(1).optional(),
  soulTemplateId: z.string().optional(),
  model: z.string().min(1).optional(),
  memoryContext: z.string().optional(),
  status: z.enum(["active", "stopped", "error"]).optional(),
})

// ============================================================
// GET /api/tutorbot/[id] — fetch a single bot
// ============================================================

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieTutorBotRepository(db)

    const bot = await repo.getBot(id)
    if (bot === null) {
      return Response.json({ success: false, error: "TutorBot not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: bot })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get bot"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// PUT /api/tutorbot/[id] — update bot fields
// ============================================================

export async function PUT(
  req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = updateBotSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const db = new TutorDatabase()
    const repo = new DexieTutorBotRepository(db)

    const existing = await repo.getBot(id)
    if (existing === null) {
      return Response.json({ success: false, error: "TutorBot not found" }, { status: 404 })
    }

    const updated = await repo.updateBot(id, {
      ...parsed.data,
      updatedAt: Date.now(),
    })
    return Response.json({ success: true, data: updated })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update bot"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// DELETE /api/tutorbot/[id] — remove a bot
// ============================================================

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieTutorBotRepository(db)

    await repo.deleteBot(id)
    return new Response(null, { status: 204 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete bot"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
