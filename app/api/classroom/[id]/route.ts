import { NextRequest } from "next/server"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieClassroomRepository } from "@/lib/core/storage/classroom-repo"

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================
// GET /api/classroom/[id] — fetch a single classroom
// ============================================================

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieClassroomRepository(db)

    const classroom = await repo.getClassroom(id)
    if (classroom === null) {
      return Response.json(
        { success: false, error: "Classroom not found" },
        { status: 404 }
      )
    }

    return Response.json({ success: true, data: classroom })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get classroom"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// DELETE /api/classroom/[id] — remove a classroom
// ============================================================

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const repo = new DexieClassroomRepository(db)

    await repo.deleteClassroom(id)
    return new Response(null, { status: 204 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete classroom"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
