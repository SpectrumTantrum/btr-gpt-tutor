import { NextRequest, NextResponse } from "next/server"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { KnowledgeService } from "@/lib/core/knowledge/knowledge-service"

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================
// POST /api/knowledge/[id]/documents — ingest a document
// ============================================================

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id: kbId } = await context.params

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid multipart form data" }, { status: 400 })
  }

  const fileField = formData.get("file")
  if (!(fileField instanceof File)) {
    return NextResponse.json(
      { success: false, error: "Missing or invalid 'file' field in form data" },
      { status: 400 }
    )
  }

  try {
    const db = new TutorDatabase()
    const repo = new DexieKnowledgeRepository(db)
    const service = new KnowledgeService(repo)

    const document = await service.ingestDocument(
      kbId,
      fileField,
      fileField.name,
      fileField.type || "application/octet-stream"
    )

    return NextResponse.json({ success: true, data: document }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to ingest document"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
