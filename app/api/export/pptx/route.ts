import { NextRequest } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieClassroomRepository } from "@/lib/core/storage/classroom-repo"
import { buildPptxData } from "@/lib/export/pptx-exporter"

// ============================================================
// Validation schema
// ============================================================

const exportRequestSchema = z.object({
  classroomId: z.string().min(1),
})

// ============================================================
// POST /api/export/pptx — export classroom as PPTX data
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

    const pptxData = buildPptxData(classroom)
    return Response.json({ success: true, data: pptxData })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export PPTX data"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
