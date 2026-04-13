import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieNotebookRepository } from "@/lib/core/storage/notebook-repo"
import { NotebookService } from "@/lib/notebook/notebook-service"

// ============================================================
// Validation schema
// ============================================================

const createNotebookSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  description: z.string().optional(),
})

// ============================================================
// GET /api/notebook — list all notebooks
// ============================================================

export async function GET(): Promise<NextResponse> {
  try {
    const db = new TutorDatabase()
    const repo = new DexieNotebookRepository(db)
    const service = new NotebookService(repo)

    const notebooks = await service.listNotebooks()
    return NextResponse.json({ success: true, data: notebooks })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list notebooks"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// POST /api/notebook — create a notebook
// ============================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = createNotebookSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, color, description } = parsed.data

  try {
    const db = new TutorDatabase()
    const repo = new DexieNotebookRepository(db)
    const service = new NotebookService(repo)

    const notebook = await service.createNotebook({
      name,
      color,
      description: description ?? "",
    })

    return NextResponse.json({ success: true, data: notebook }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create notebook"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
