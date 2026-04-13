import { NextRequest } from "next/server"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieClassroomRepository } from "@/lib/core/storage/classroom-repo"
import { DexieSharedClassroomRepository } from "@/lib/core/storage/shared-classroom-repo"
import { isShareExpired } from "@/lib/classroom/sharing"

type RouteContext = { params: Promise<{ token: string }> }

// ============================================================
// GET /api/shared/classroom/[token] — public, no auth required
// ============================================================

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { token } = await context.params

  try {
    const db = new TutorDatabase()
    const shareRepo = new DexieSharedClassroomRepository(db)
    const classroomRepo = new DexieClassroomRepository(db)

    const share = await shareRepo.getShareByToken(token)
    if (share === null) {
      return Response.json(
        { success: false, error: "Share not found" },
        { status: 404 }
      )
    }

    if (isShareExpired(share)) {
      return Response.json(
        { success: false, error: "Share link has expired" },
        { status: 410 }
      )
    }

    const classroom = await classroomRepo.getClassroom(share.classroomId)
    if (classroom === null) {
      return Response.json(
        { success: false, error: "Classroom not found" },
        { status: 404 }
      )
    }

    return Response.json({ success: true, data: { share, classroom } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load shared classroom"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
