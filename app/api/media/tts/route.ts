import { NextRequest } from "next/server"
import { z } from "zod"
import { generateSpeech } from "@/lib/core/media/tts-providers"

// ============================================================
// Validation schema
// ============================================================

const TTS_MAX_CHARS = 4096

const ttsRequestSchema = z.object({
  text: z.string().min(1).max(TTS_MAX_CHARS),
  voiceId: z.string().optional(),
})

// ============================================================
// POST /api/media/tts — synthesize speech from text
// ============================================================

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = ttsRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { text, voiceId } = parsed.data

  const apiKey = process.env.TTS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json(
      { success: false, error: "TTS API key not configured" },
      { status: 500 }
    )
  }

  try {
    const audioBuffer = await generateSpeech(text, apiKey, { voiceId })

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "TTS generation failed"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
