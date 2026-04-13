import "fake-indexeddb/auto"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { listSoulTemplates, getSoulTemplate } from "@/lib/tutorbot/soul-templates"
import { buildBotSystemPrompt } from "@/lib/tutorbot/prompts"
import { TutorBotEngine } from "@/lib/tutorbot/tutorbot-engine"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieTutorBotRepository } from "@/lib/core/storage/tutorbot-repo"
import type { TutorBot, SoulTemplate, ProviderConfig } from "@/lib/core/types"

// ============================================================
// Helpers
// ============================================================

let dbCounter = 0

function makeBot(overrides: Partial<TutorBot> = {}): TutorBot {
  const now = Date.now()
  return {
    id: "bot_test",
    name: "Ada",
    persona: "A patient and encouraging tutor.",
    status: "stopped",
    model: "claude-sonnet-4-6",
    skills: [],
    heartbeat: { enabled: false, intervalMs: 60000, message: "Still here!" },
    memoryContext: "",
    channels: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

const FAKE_PROVIDER_CONFIG: ProviderConfig = {
  provider: "openai",
  model: "gpt-4o",
  apiKey: "test-key",
}

// ============================================================
// Tests
// ============================================================

describe("Soul Templates", () => {
  it("lists 3 built-in soul templates", () => {
    // Arrange + Act
    const templates = listSoulTemplates()

    // Assert
    expect(templates).toHaveLength(3)
    const ids = templates.map((t) => t.id)
    expect(ids).toContain("SOCRATIC")
    expect(ids).toContain("ENCOURAGING")
    expect(ids).toContain("RIGOROUS")
  })
})

describe("buildBotSystemPrompt", () => {
  it("builds system prompt including persona and soul", () => {
    // Arrange
    const bot = makeBot({ persona: "A rigorous professor." })
    const soul = getSoulTemplate("RIGOROUS")

    // Act
    const prompt = buildBotSystemPrompt(bot, soul, "")

    // Assert
    expect(prompt).toContain("A rigorous professor.")
    expect(soul).not.toBeNull()
    expect(prompt).toContain(soul!.teachingStyle)
    expect(prompt).toContain(soul!.tone)
  })

  it("builds system prompt without soul (just persona)", () => {
    // Arrange
    const bot = makeBot({ persona: "A friendly helper." })

    // Act
    const prompt = buildBotSystemPrompt(bot, null, "")

    // Assert
    expect(prompt).toContain("A friendly helper.")
  })

  it("builds system prompt with memory context", () => {
    // Arrange
    const bot = makeBot({ persona: "A tutor." })
    const memoryContext = "Learner is intermediate in Python."

    // Act
    const prompt = buildBotSystemPrompt(bot, null, memoryContext)

    // Assert
    expect(prompt).toContain("Learner is intermediate in Python.")
  })
})

describe("TutorBotEngine", () => {
  let engine: TutorBotEngine

  beforeEach(() => {
    const db = new TutorDatabase(`TutorDatabase-engine-${++dbCounter}`)
    const repo = new DexieTutorBotRepository(db)
    engine = new TutorBotEngine(repo, FAKE_PROVIDER_CONFIG)
  })

  it("creates a bot via engine with id prefix bot_", async () => {
    // Arrange
    const input = {
      name: "Socrates",
      persona: "Uses questions to guide discovery.",
    }

    // Act
    const bot = await engine.createBot(input)

    // Assert
    expect(bot.id).toMatch(/^bot_/)
    expect(bot.name).toBe("Socrates")
    expect(bot.persona).toBe("Uses questions to guide discovery.")
    expect(bot.status).toBe("stopped")
  })
})
