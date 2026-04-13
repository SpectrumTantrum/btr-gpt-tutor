import { streamText } from "ai"
import type { AgentConfig, Message, ProviderConfig } from "@/lib/core/types"
import { createLanguageModel } from "@/lib/core/ai/providers"
import { buildDiscussionPrompt, buildQAPrompt } from "@/lib/classroom/prompts/discussion-prompts"

export function streamAgentResponse(
  agent: AgentConfig,
  topic: string,
  previousMessages: readonly Message[],
  config: ProviderConfig
) {
  const model = createLanguageModel(config)
  const prompt = buildDiscussionPrompt(agent, topic, previousMessages)

  return streamText({
    model,
    prompt,
  })
}

export function streamQAResponse(
  agent: AgentConfig,
  question: string,
  context: string,
  config: ProviderConfig
) {
  const model = createLanguageModel(config)
  const prompt = buildQAPrompt(agent, question, context)

  return streamText({
    model,
    prompt,
  })
}
