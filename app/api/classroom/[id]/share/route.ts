import { NextRequest } from "next/server"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieClassroomRepository } from "@/lib/core/storage/classroom-repo"
import { DexieSharedClassroomRepository } from "@/lib/core/storage/shared-classroom-repo"
import { generateShareToken, buildShareUrl } from "@/lib/classroom/sharing"

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================
// POST /api/classroom/[id]/share — generate a share token
// ============================================================

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params

  try {
    const db = new TutorDatabase()
    const classroomRepo = new DexieClassroomRepository(db)
    const shareRepo = new DexieSharedClassroomRepository(db)

    const classroom = await classroomRepo.getClassroom(id)
    if (classroom === null) {
      return Response.json(
        { success: false, error: "Classroom not found" },
        { status: 404 }
      )
    }

    let expiresAt: number | undefined
    let createdBy = "anonymous"

    try {
      const body: unknown = await req.json()
      if (body !== null && typeof body === "object") {
        const b = body as Record<string, unknown>
        if (typeof b.expiresAt === "number") expiresAt = b.expiresAt
        if (typeof b.createdBy === "string" && b.createdBy.length > 0) {
          createdBy = b.createdBy
        }
      }
    } catch {
      // body is optional — proceed with defaults
    }

    const token = generateShareToken()
    const baseUrl = req.nextUrl.origin
    const shareUrl = buildShareUrl(token, baseUrl)

    const share = await shareRepo.createShare({
      classroomId: id,
      token,
      createdBy,
      expiresAt,
      createdAt: Date.now(),
    })

    return Response.json({ success: true, data: { share, url: shareUrl } }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create share"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
