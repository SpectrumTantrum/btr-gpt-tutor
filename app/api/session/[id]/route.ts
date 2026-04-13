import { NextRequest, NextResponse } from "next/server"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieSessionRepository } from "@/lib/core/storage/session-repo"
import { SessionService } from "@/lib/core/session/session-service"

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================
// GET /api/session/[id] — get single session
// ============================================================

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieSessionRepository(db)
    const service = new SessionService(repo)

    const session = await service.getSession(id)
    if (session === null) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: session })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get session"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// DELETE /api/session/[id] — delete session
// ============================================================

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieSessionRepository(db)
    const service = new SessionService(repo)

    await service.deleteSession(id)
    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete session"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
