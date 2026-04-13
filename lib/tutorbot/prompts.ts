import type { TutorBot, SoulTemplate } from "@/lib/core/types"

// ============================================================
// Prompt Builders
// ============================================================

function buildPersonaSection(bot: TutorBot): string {
  return `## Bot Persona\n${bot.persona}`
}

function buildSoulSection(soul: SoulTemplate): string {
  return `## Teaching Style\n${soul.teachingStyle}\n\n## Tone\n${soul.tone}`
}

function buildMemorySection(memoryContext: string): string {
  return `## Learner Context\n${memoryContext}`
}

export function buildBotSystemPrompt(
  bot: TutorBot,
  soul: SoulTemplate | null,
  memoryContext: string,
): string {
  const parts: string[] = [buildPersonaSection(bot)]

  if (soul !== null) {
    parts.push(buildSoulSection(soul))
  }

  if (memoryContext.trim().length > 0) {
    parts.push(buildMemorySection(memoryContext))
  }

  return parts.join("\n\n")
}
