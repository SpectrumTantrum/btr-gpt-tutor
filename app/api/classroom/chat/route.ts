import { NextRequest } from "next/server"
import { z } from "zod"
import { streamAgentResponse, streamQAResponse } from "@/lib/classroom/orchestration/discussion"

// ============================================================
// Validation schemas
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const agentConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["teacher", "student", "moderator"]),
  persona: z.string().min(1),
  avatarUrl: z.string().optional(),
  voiceId: z.string().optional(),
})

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  createdAt: z.number(),
})

const chatRequestSchema = z.object({
  mode: z.enum(["discussion", "qa"]),
  agent: agentConfigSchema,
  topic: z.string().min(1),
  message: z.string().optional(),
  context: z.string().optional(),
  previousMessages: z.array(messageSchema),
  llmConfig: providerConfigSchema,
})

// ============================================================
// POST /api/classroom/chat — stream agent or Q&A response
// ============================================================

export async function POST(req: NextRequest): Promise<Response> {
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

  const { mode, agent, topic, message, context, previousMessages, llmConfig } = parsed.data

  let streamResult: ReturnType<typeof streamAgentResponse>

  if (mode === "discussion") {
    streamResult = streamAgentResponse(agent, topic, previousMessages, llmConfig)
  } else {
    if (!message) {
      return Response.json(
        { success: false, error: "message is required for qa mode" },
        { status: 400 }
      )
    }
    streamResult = streamQAResponse(agent, message, context ?? "", llmConfig)
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
