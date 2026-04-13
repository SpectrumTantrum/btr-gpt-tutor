import { generateText } from "ai"
import { createLanguageModel } from "@/lib/core/ai/providers"
import type { OutlineItem, ProviderConfig } from "@/lib/core/types"
import { buildOutlinePrompt } from "./prompts"

/**
 * Calls the LLM with an outline prompt and parses the JSON response
 * into an array of OutlineItems.
 */
export async function generateOutline(
  topic: string,
  context: string,
  sceneCount: number,
  config: ProviderConfig,
): Promise<readonly OutlineItem[]> {
  const model = createLanguageModel(config)
  const prompt = buildOutlinePrompt(topic, context, sceneCount)

  const result = await generateText({
    model,
    messages: [{ role: "user", content: prompt }],
  })

  const parsed: unknown = JSON.parse(result.text)

  if (!Array.isArray(parsed)) {
    throw new Error("Outline generation returned unexpected shape: expected a JSON array")
  }

  return parsed as OutlineItem[]
}
