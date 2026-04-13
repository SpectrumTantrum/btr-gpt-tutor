import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { KnowledgeService } from "@/lib/core/knowledge/knowledge-service"

// ============================================================
// Validation schema
// ============================================================

const createKnowledgeBaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  embeddingModel: z.string().optional(),
  embeddingDimension: z.number().int().positive().optional(),
})

const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"
const DEFAULT_EMBEDDING_DIMENSION = 1536

// ============================================================
// GET /api/knowledge — list all knowledge bases
// ============================================================

export async function GET(): Promise<NextResponse> {
  try {
    const db = new TutorDatabase()
    const repo = new DexieKnowledgeRepository(db)
    const service = new KnowledgeService(repo)

    const knowledgeBases = await service.listKnowledgeBases()
    return NextResponse.json({ success: true, data: knowledgeBases })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list knowledge bases"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ============================================================
// POST /api/knowledge — create a knowledge base
// ============================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = createKnowledgeBaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, description, embeddingModel, embeddingDimension } = parsed.data

  try {
    const db = new TutorDatabase()
    const repo = new DexieKnowledgeRepository(db)
    const service = new KnowledgeService(repo)

    const kb = await service.createKnowledgeBase({
      name,
      description: description ?? "",
      embeddingModel: embeddingModel ?? DEFAULT_EMBEDDING_MODEL,
      embeddingDimension: embeddingDimension ?? DEFAULT_EMBEDDING_DIMENSION,
    })

    return NextResponse.json({ success: true, data: kb }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create knowledge base"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
