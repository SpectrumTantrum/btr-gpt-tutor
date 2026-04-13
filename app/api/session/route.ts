import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieSessionRepository } from "@/lib/core/storage/session-repo"
import { SessionService } from "@/lib/core/session/session-service"

// ============================================================
// Validation schema
// ============================================================

const createSessionSchema = z.object({
  knowledgeBaseIds: z.array(z.string()),
  title: z.string().optional(),
})

// ============================================================
// GET /api/session — list all sessions
// ============================================================

export async function GET(): Promise<NextResponse> {
  try {
    const db = new TutorDatabase()
    const repo = new DexieSessionRepository(db)
    const service = new SessionService(repo)

    const sessions = await service.listSessions()
    return NextResponse.json({ success: true, data: sessions })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list sessions"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// POST /api/session — create a session
// ============================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = createSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { knowledgeBaseIds, title } = parsed.data

  try {
    const db = new TutorDatabase()
    const repo = new DexieSessionRepository(db)
    const service = new SessionService(repo)

    const session = await service.createSession({ knowledgeBaseIds, title })
    return NextResponse.json({ success: true, data: session }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create session"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
