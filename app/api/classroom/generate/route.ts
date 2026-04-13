import { NextRequest } from "next/server"
import { z } from "zod"
import { nanoid } from "nanoid"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { DexieClassroomRepository } from "@/lib/core/storage/classroom-repo"
import { GenerationPipeline } from "@/lib/classroom/generation/generation-pipeline"
import { generateOutline } from "@/lib/classroom/generation/outline-generator"
import { generateScene } from "@/lib/classroom/generation/scene-generator"
import { createAgentSet } from "@/lib/classroom/orchestration/agent-config"
import type { GenerationProgress } from "@/lib/core/types"

// ============================================================
// Validation schema
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const generateRequestSchema = z.object({
  knowledgeBaseId: z.string().min(1),
  topic: z.string().min(1),
  sceneCount: z.number().int().min(1).max(20).default(5),
  llmConfig: providerConfigSchema,
})

// ============================================================
// POST /api/classroom/generate — generate a new classroom
// ============================================================

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = generateRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { knowledgeBaseId, topic, sceneCount, llmConfig } = parsed.data

  const db = new TutorDatabase()
  const knowledgeRepo = new DexieKnowledgeRepository(db)

  const kb = await knowledgeRepo.getKnowledgeBase(knowledgeBaseId)
  if (kb === null) {
    return Response.json(
      { success: false, error: "Knowledge base not found" },
      { status: 404 }
    )
  }

  const chunks = await knowledgeRepo.getChunks(knowledgeBaseId)
  const context = chunks.map((c) => c.content).join("\n\n")

  const classroomRepo = new DexieClassroomRepository(db)
  const agents = createAgentSet()
  const now = Date.now()

  const classroom = await classroomRepo.createClassroom({
    id: `cls_${nanoid()}`,
    title: topic,
    knowledgeBaseId,
    scenes: [],
    agents,
    status: "generating",
    createdAt: now,
    updatedAt: now,
  })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (progress: GenerationProgress) => {
        const event = `event: progress\ndata: ${JSON.stringify(progress)}\n\n`
        controller.enqueue(encoder.encode(event))
      }

      try {
        const pipeline = new GenerationPipeline({ generateOutline, generateScene })

        const result = await pipeline.generate({
          topic,
          context,
          sceneCount,
          classroomId: classroom.id,
          config: llmConfig,
          onProgress: sendProgress,
        })

        await classroomRepo.updateClassroom(classroom.id, {
          scenes: result.scenes,
          status: "ready",
          updatedAt: Date.now(),
        })

        const doneEvent = `event: done\ndata: ${JSON.stringify({ classroomId: classroom.id })}\n\n`
        controller.enqueue(encoder.encode(doneEvent))
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Generation failed"

        await classroomRepo.updateClassroom(classroom.id, {
          status: "error",
          updatedAt: Date.now(),
        }).catch(() => undefined)

        const errorEvent = `event: error\ndata: ${JSON.stringify({ error: message })}\n\n`
        controller.enqueue(encoder.encode(errorEvent))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
