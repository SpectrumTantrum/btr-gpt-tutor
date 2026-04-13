import { NextRequest, NextResponse } from "next/server"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { KnowledgeService } from "@/lib/core/knowledge/knowledge-service"

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================
// GET /api/knowledge/[id] — get single knowledge base
// ============================================================

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieKnowledgeRepository(db)
    const service = new KnowledgeService(repo)

    const kb = await service.getKnowledgeBase(id)
    if (kb === null) {
      return NextResponse.json({ success: false, error: "Knowledge base not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: kb })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get knowledge base"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// DELETE /api/knowledge/[id] — delete knowledge base
// ============================================================

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieKnowledgeRepository(db)
    const service = new KnowledgeService(repo)

    await service.deleteKnowledgeBase(id)
    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete knowledge base"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
