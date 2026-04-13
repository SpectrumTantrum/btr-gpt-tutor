import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { stream } from "@/lib/core/ai/llm"
import { buildStagePrompt } from "@/lib/chat/modes/deep-solve"
import type { StageResult } from "@/lib/chat/modes/deep-solve"

// ============================================================
// Validation schema
// ============================================================

const providerConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
})

const stageResultSchema = z.object({
  stage: z.string().min(1),
  content: z.string(),
})

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  createdAt: z.number(),
})

const solveSchema = z.object({
  messages: z.array(messageSchema),
  stage: z.string().min(1),
  problem: z.string().min(1),
  priorResults: z.array(stageResultSchema),
  llmConfig: providerConfigSchema,
})

// ============================================================
// POST /api/solve — stream a deep-solve stage response via SSE
// ============================================================

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = solveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { stage, problem, priorResults, llmConfig } = parsed.data

  const stagePrompt = buildStagePrompt(stage, problem, priorResults as StageResult[])

  let streamResult: ReturnType<typeof stream>
  try {
    streamResult = stream({
      config: llmConfig,
      messages: [{ role: "user", content: stagePrompt }],
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start stream"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.textStream) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Stream error"
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`)
        )
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
