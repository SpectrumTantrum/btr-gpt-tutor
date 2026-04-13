import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo"
import { MemoryService } from "@/lib/core/memory/memory-service"

// ============================================================
// Validation schema
// ============================================================

const learnerProfileSchema = z.object({
  knowledgeLevels: z.record(z.enum(["beginner", "intermediate", "advanced"])).optional(),
  learningStyle: z.enum(["visual", "verbal", "hands-on", "mixed"]).optional(),
  pacePreference: z.enum(["fast", "moderate", "thorough"]).optional(),
  goals: z.array(z.string()).optional(),
  language: z.string().optional(),
})

const updateMemorySchema = z.object({
  profile: learnerProfileSchema,
})

// ============================================================
// GET /api/memory — get or initialize memory
// ============================================================

export async function GET(): Promise<NextResponse> {
  try {
    const db = new TutorDatabase()
    const repo = new DexieMemoryRepository(db)
    const service = new MemoryService(repo)

    const memory = await service.getOrInitMemory()
    return NextResponse.json({ success: true, data: memory })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get memory"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// PUT /api/memory — update learner profile
// ============================================================

export async function PUT(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = updateMemorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const db = new TutorDatabase()
    const repo = new DexieMemoryRepository(db)
    const service = new MemoryService(repo)

    const memory = await service.updateProfile(parsed.data.profile)
    return NextResponse.json({ success: true, data: memory })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update memory"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
