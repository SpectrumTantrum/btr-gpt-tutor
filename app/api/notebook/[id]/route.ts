import { NextRequest, NextResponse } from "next/server"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieNotebookRepository } from "@/lib/core/storage/notebook-repo"
import { NotebookService } from "@/lib/notebook/notebook-service"

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================
// GET /api/notebook/[id] — get single notebook
// ============================================================

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieNotebookRepository(db)
    const service = new NotebookService(repo)

    const notebook = await service.getNotebook(id)
    if (notebook === null) {
      return NextResponse.json({ success: false, error: "Notebook not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: notebook })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get notebook"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// DELETE /api/notebook/[id] — delete notebook and its records
// ============================================================

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieNotebookRepository(db)
    const service = new NotebookService(repo)

    await service.deleteNotebook(id)
    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete notebook"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
