import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo"
import type { Memory } from "@/lib/core/types"

let dbCounter = 0

function makeMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: "memory_default",
    profile: {
      knowledgeLevels: {},
      learningStyle: "mixed",
      pacePreference: "moderate",
      goals: ["Learn TypeScript"],
      language: "en",
    },
    progress: {
      topicsExplored: [],
      totalSessions: 0,
      totalMessages: 0,
      lastActiveAt: Date.now(),
    },
    updatedAt: Date.now(),
    ...overrides,
  }
}

describe("DexieMemoryRepository", () => {
  let db: TutorDatabase
  let repo: DexieMemoryRepository

  beforeEach(() => {
    db = new TutorDatabase(`TutorDatabase-memory-${++dbCounter}`)
    repo = new DexieMemoryRepository(db)
  })

  it("returns undefined when no memory exists", async () => {
    // Act
    const result = await repo.getMemory()

    // Assert
    expect(result).toBeUndefined()
  })

  it("saves and retrieves memory", async () => {
    // Arrange
    const memory = makeMemory()

    // Act
    await repo.saveMemory(memory)
    const retrieved = await repo.getMemory()

    // Assert
    expect(retrieved).not.toBeUndefined()
    expect(retrieved!.id).toBe("memory_default")
    expect(retrieved!.profile.learningStyle).toBe("mixed")
    expect(retrieved!.profile.goals).toEqual(["Learn TypeScript"])
  })

  it("overwrites existing memory on save", async () => {
    // Arrange
    const initial = makeMemory({ updatedAt: 1000 })
    await repo.saveMemory(initial)

    const updated = makeMemory({
      updatedAt: 2000,
      profile: {
        ...initial.profile,
        learningStyle: "visual",
      },
    })

    // Act
    await repo.saveMemory(updated)
    const retrieved = await repo.getMemory()

    // Assert
    expect(retrieved!.profile.learningStyle).toBe("visual")
    expect(retrieved!.updatedAt).toBe(2000)
  })
})
