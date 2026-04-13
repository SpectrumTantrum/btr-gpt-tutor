import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { generate, stream } from "@/lib/core/ai/llm"
import {
  buildDecompositionPrompt,
  buildResearchPrompt,
  buildSynthesisPrompt,
} from "@/lib/chat/modes/deep-research"

// ============================================================
// Validation schema
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const researchSchema = z.object({
  topic: z.string().min(1),
  knowledgeBaseIds: z.array(z.string()).min(1),
  llmConfig: providerConfigSchema,
  embeddingConfig: providerConfigSchema,
})

// ============================================================
// Keyword-based RAG retrieval
// ============================================================

function retrieveRelevantChunks(
  chunks: readonly { content: string }[],
  query: string,
  maxChunks = 5
): string[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3)

  const scored = chunks.map((chunk) => {
    const lower = chunk.content.toLowerCase()
    const score = queryTerms.reduce(
      (acc, term) => acc + (lower.includes(term) ? 1 : 0),
      0
    )
    return { content: chunk.content, score }
  })

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map((c) => c.content)
}

// ============================================================
// POST /api/research — decompose, research per subtopic, synthesize via SSE
// ============================================================

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = researchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { topic, knowledgeBaseIds, llmConfig } = parsed.data

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const emitText = (text: string) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))

      const emitError = (message: string) =>
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`)
        )

      try {
        // Step 1: Load all chunks from selected knowledge bases
        const db = new TutorDatabase()
        const knowledgeRepo = new DexieKnowledgeRepository(db)

        const chunkArrays = await Promise.all(
          knowledgeBaseIds.map((id) => knowledgeRepo.getChunks(id))
        )
        const allChunks = chunkArrays.flat()

        // Step 2: Decompose topic into subtopics via LLM
        const decompositionResult = await generate({
          config: llmConfig,
          messages: [{ role: "user", content: buildDecompositionPrompt(topic) }],
        })

        let subtopics: { title: string; query: string }[]
        try {
          const raw = decompositionResult.text.trim()
          const jsonStart = raw.indexOf("[")
          const jsonEnd = raw.lastIndexOf("]")
          if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("No JSON array in decomposition response")
          }
          subtopics = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as {
            title: string
            query: string
          }[]
        } catch {
          emitError("Failed to parse subtopics from LLM response")
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
          return
        }

        // Step 3: Research each subtopic with RAG chunks
        const sections: string[] = []

        for (const subtopic of subtopics) {
          const ragResults = retrieveRelevantChunks(allChunks, subtopic.query)
          const researchPrompt = buildResearchPrompt(subtopic.title, ragResults, [])

          const sectionResult = await generate({
            config: llmConfig,
            messages: [{ role: "user", content: researchPrompt }],
          })

          sections.push(sectionResult.text.trim())
        }

        // Step 4: Synthesize sections and stream the final report
        const synthesisPrompt = buildSynthesisPrompt(topic, sections)

        const streamResult = stream({
          config: llmConfig,
          messages: [{ role: "user", content: synthesisPrompt }],
        })

        for await (const chunk of streamResult.textStream) {
          emitText(chunk)
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Research pipeline failed"
        emitError(message)
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
