import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieNotebookRepository } from "@/lib/core/storage/notebook-repo"
import { NotebookService } from "@/lib/notebook/notebook-service"

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================
// Validation schema
// ============================================================

const addRecordSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  source: z.enum(["chat", "quiz", "guide", "research", "co-writer", "manual"]),
  tags: z.array(z.string()).optional(),
})

// ============================================================
// GET /api/notebook/[id]/records — list records for a notebook
// ============================================================

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id: notebookId } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieNotebookRepository(db)
    const service = new NotebookService(repo)

    const records = await service.getRecords(notebookId)
    return NextResponse.json({ success: true, data: records })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get records"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// POST /api/notebook/[id]/records — add a record to notebook
// ============================================================

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id: notebookId } = await context.params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = addRecordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { title, content, source, tags } = parsed.data

  try {
    const db = new TutorDatabase()
    const repo = new DexieNotebookRepository(db)
    const service = new NotebookService(repo)

    const record = await service.saveRecord(notebookId, {
      title,
      content,
      source,
      tags: tags ?? [],
    })

    return NextResponse.json({ success: true, data: record }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add record"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
