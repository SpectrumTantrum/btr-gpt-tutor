import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo"
import { MemoryService } from "@/lib/core/memory/memory-service"
import { streamChat } from "@/lib/chat/chat-service"

// ============================================================
// Validation schema
// ============================================================

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  createdAt: z.number(),
})

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1),
  knowledgeBaseIds: z.array(z.string()),
  llmConfig: providerConfigSchema,
  embeddingConfig: providerConfigSchema,
})

// ============================================================
// POST /api/chat
// ============================================================

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = chatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { messages, knowledgeBaseIds, llmConfig, embeddingConfig } = parsed.data

  // Load chunks from all knowledge bases
  const db = new TutorDatabase()
  const knowledgeRepo = new DexieKnowledgeRepository(db)
  const memoryRepo = new DexieMemoryRepository(db)
  const memoryService = new MemoryService(memoryRepo)

  const chunksArrays = await Promise.all(
    knowledgeBaseIds.map((id) => knowledgeRepo.getChunks(id))
  )
  const chunks = chunksArrays.flat()

  const memory = await memoryService.getOrInitMemory()

  let chatResponse: Awaited<ReturnType<typeof streamChat>>
  try {
    chatResponse = await streamChat({
      messages,
      llmConfig,
      embeddingConfig,
      chunks,
      profile: memory.profile,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }

  const { textStream, citations } = chatResponse

  // Return SSE stream: citations event, then text chunks, then [DONE]
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Emit citations event first
      const citationsEvent =
        `event: citations\ndata: ${JSON.stringify(citations)}\n\n`
      controller.enqueue(encoder.encode(citationsEvent))

      // Stream text chunks
      try {
        for await (const chunk of textStream) {
          const dataEvent = `data: ${JSON.stringify({ text: chunk })}\n\n`
          controller.enqueue(encoder.encode(dataEvent))
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Stream error"
        const errorEvent = `event: error\ndata: ${JSON.stringify({ error: message })}\n\n`
        controller.enqueue(encoder.encode(errorEvent))
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
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
