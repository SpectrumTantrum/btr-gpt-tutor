import type { AgentConfig, Message } from "@/lib/core/types"

export function buildDiscussionPrompt(
  agent: AgentConfig,
  topic: string,
  previousMessages: readonly Message[]
): string {
  const history = previousMessages
    .map((m) => `${m.role === "user" ? "Student" : m.role}: ${m.content}`)
    .join("\n")

  const contextSection = history.length > 0 ? `\n\nConversation so far:\n${history}` : ""

  return (
    `You are ${agent.name}, participating in a classroom discussion.\n\n` +
    `Your persona: ${agent.persona}\n\n` +
    `Topic being discussed: ${topic}${contextSection}\n\n` +
    `Respond in character as ${agent.name}. Keep your response focused, natural, and conversational. ` +
    `Build on what has been said so far and contribute meaningfully to the discussion.`
  )
}

export function buildQAPrompt(
  agent: AgentConfig,
  question: string,
  context: string
): string {
  const contextSection = context.length > 0 ? `\n\nRelevant context:\n${context}` : ""

  return (
    `You are ${agent.name}, answering a question in a classroom setting.\n\n` +
    `Your persona: ${agent.persona}\n\n` +
    `Question: ${question}${contextSection}\n\n` +
    `Respond in character as ${agent.name}. ` +
    `Provide a clear, helpful answer that reflects your persona and role.`
  )
}
