import { NextRequest } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieClassroomRepository } from "@/lib/core/storage/classroom-repo"
import { buildHtmlExport } from "@/lib/export/html-exporter"

// ============================================================
// Validation schema
// ============================================================

const exportRequestSchema = z.object({
  classroomId: z.string().min(1),
})

// ============================================================
// POST /api/export/html — export classroom as self-contained HTML
// ============================================================

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = exportRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { classroomId } = parsed.data

  try {
    const db = new TutorDatabase()
    const repo = new DexieClassroomRepository(db)

    const classroom = await repo.getClassroom(classroomId)
    if (classroom === null) {
      return Response.json({ success: false, error: "Classroom not found" }, { status: 404 })
    }

    const html = buildHtmlExport(classroom)
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export HTML"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
