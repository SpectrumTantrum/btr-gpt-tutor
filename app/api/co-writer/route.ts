import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { embedText } from "@/lib/core/ai/embeddings"
import { retrieveChunks } from "@/lib/core/knowledge/retriever"
import { streamCoWriterEdit } from "@/lib/co-writer/co-writer-service"

// ============================================================
// Validation schema
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const coWriterRequestSchema = z.object({
  selectedText: z.string().min(1),
  operation: z.enum(["rewrite", "expand", "shorten", "summarize"]),
  fullContent: z.string(),
  knowledgeBaseId: z.string().optional(),
  llmConfig: providerConfigSchema,
  embeddingConfig: providerConfigSchema.optional(),
})

// ============================================================
// POST /api/co-writer
// ============================================================

const TOP_K_CHUNKS = 5

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = coWriterRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { selectedText, operation, fullContent, knowledgeBaseId, llmConfig, embeddingConfig } =
    parsed.data

  const request = { selectedText, operation, fullContent, knowledgeBaseId }

  // Build optional KB context via semantic retrieval
  let context: string | undefined

  if (knowledgeBaseId && embeddingConfig) {
    try {
      const db = new TutorDatabase()
      const knowledgeRepo = new DexieKnowledgeRepository(db)

      const [chunks, queryEmbedding] = await Promise.all([
        knowledgeRepo.getChunks(knowledgeBaseId),
        embedText(selectedText, embeddingConfig),
      ])

      const results = retrieveChunks(queryEmbedding, chunks, {
        topK: TOP_K_CHUNKS,
        minScore: 0.1,
      })

      if (results.length > 0) {
        context = results.map((r) => r.chunk.content).join("\n\n")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "KB retrieval failed"
      return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
  }

  // Stream the co-writer edit
  let editStream: ReturnType<typeof streamCoWriterEdit>
  try {
    editStream = streamCoWriterEdit(request, context, llmConfig)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Co-writer failed to start"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of editStream.textStream) {
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
