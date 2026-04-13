import { NextRequest } from "next/server"
import { z } from "zod"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieTutorBotRepository } from "@/lib/core/storage/tutorbot-repo"
import { TutorBotEngine } from "@/lib/tutorbot/tutorbot-engine"

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================
// Validation schema
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const chatRequestSchema = z.object({
  message: z.string().min(1),
  llmConfig: providerConfigSchema,
})

// ============================================================
// POST /api/tutorbot/[id]/chat — stream bot response via SSE
// ============================================================

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = chatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { message, llmConfig } = parsed.data

  const db = new TutorDatabase()
  const repo = new DexieTutorBotRepository(db)

  const bot = await repo.getBot(id)
  if (bot === null) {
    return Response.json({ success: false, error: "TutorBot not found" }, { status: 404 })
  }

  const engine = new TutorBotEngine(repo, llmConfig)

  let streamResult: Awaited<ReturnType<typeof engine.streamBotResponse>>
  try {
    streamResult = await engine.streamBotResponse(id, message, bot.memoryContext)
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Failed to start stream"
    return Response.json({ success: false, error: errMessage }, { status: 500 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.textStream) {
          const event = `data: ${JSON.stringify({ text: chunk })}\n\n`
          controller.enqueue(encoder.encode(event))
        }
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "Stream error"
        const errorEvent = `event: error\ndata: ${JSON.stringify({ error: errMessage })}\n\n`
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
