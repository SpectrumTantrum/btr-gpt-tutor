import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieTutorBotRepository } from "@/lib/core/storage/tutorbot-repo"
import type { TutorBot, BotSkill, HeartbeatConfig } from "@/lib/core/types"

let dbCounter = 0

function makeHeartbeat(overrides: Partial<HeartbeatConfig> = {}): HeartbeatConfig {
  return {
    enabled: false,
    intervalMs: 60000,
    message: "Still here!",
    ...overrides,
  }
}

function makeSkill(id = "skill_001"): BotSkill {
  return {
    id,
    name: "Socratic Questioning",
    description: "Guides the learner with questions rather than answers.",
    instructions: "Ask clarifying questions before providing explanations.",
  }
}

function makeBot(
  overrides: Partial<Omit<TutorBot, "id">> = {}
): Omit<TutorBot, "id"> & { id?: string } {
  return {
    name: "Ada",
    persona: "A patient and encouraging tutor.",
    status: "stopped",
    model: "claude-sonnet-4-6",
    skills: [],
    heartbeat: makeHeartbeat(),
    memoryContext: "",
    channels: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

describe("DexieTutorBotRepository", () => {
  let db: TutorDatabase
  let repo: DexieTutorBotRepository

  beforeEach(() => {
    db = new TutorDatabase(`TutorDatabase-bot-${++dbCounter}`)
    repo = new DexieTutorBotRepository(db)
  })

  it("creates and retrieves a bot (id starts with bot_)", async () => {
    // Arrange
    const data = makeBot({ name: "Socrates" })

    // Act
    const created = await repo.createBot(data)
    const retrieved = await repo.getBot(created.id)

    // Assert
    expect(retrieved).not.toBeNull()
    expect(retrieved!.id).toBe(created.id)
    expect(retrieved!.id).toMatch(/^bot_/)
    expect(retrieved!.name).toBe("Socrates")
    expect(retrieved!.status).toBe("stopped")
    expect(retrieved!.model).toBe("claude-sonnet-4-6")
    expect(retrieved!.skills).toEqual([])
    expect(retrieved!.channels).toEqual([])
  })

  it("updates bot status", async () => {
    // Arrange
    const bot = await repo.createBot(makeBot())

    // Act
    const updated = await repo.updateBot(bot.id, {
      status: "active",
      updatedAt: Date.now(),
    })

    // Assert
    expect(updated.id).toBe(bot.id)
    expect(updated.status).toBe("active")
    expect(updated.name).toBe(bot.name)
  })

  it("lists all bots", async () => {
    // Arrange
    await repo.createBot(makeBot({ name: "Bot Alpha" }))
    await repo.createBot(makeBot({ name: "Bot Beta" }))
    await repo.createBot(makeBot({ name: "Bot Gamma" }))

    // Act
    const bots = await repo.listBots()

    // Assert
    expect(bots).toHaveLength(3)
    const names = bots.map((b) => b.name)
    expect(names).toContain("Bot Alpha")
    expect(names).toContain("Bot Beta")
    expect(names).toContain("Bot Gamma")
  })

  it("deletes a bot", async () => {
    // Arrange
    const bot = await repo.createBot(makeBot())

    // Act
    await repo.deleteBot(bot.id)
    const retrieved = await repo.getBot(bot.id)

    // Assert
    expect(retrieved).toBeNull()
  })
})
