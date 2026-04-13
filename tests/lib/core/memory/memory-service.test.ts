import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo"
import { MemoryService } from "@/lib/core/memory/memory-service"

let dbCounter = 0

function makeDb(): TutorDatabase {
  return new TutorDatabase(`TutorDatabase-memory-service-${++dbCounter}`)
}

describe("MemoryService", () => {
  let service: MemoryService

  beforeEach(() => {
    const db = makeDb()
    const repo = new DexieMemoryRepository(db)
    service = new MemoryService(repo)
  })

  it("initializes default memory on first get", async () => {
    // Act
    const memory = await service.getOrInitMemory()

    // Assert
    expect(memory.id).toBe("memory_default")
    expect(memory.profile.learningStyle).toBe("mixed")
    expect(memory.profile.pacePreference).toBe("moderate")
    expect(memory.progress.totalSessions).toBe(0)
  })

  it("updates profile fields immutably", async () => {
    // Arrange
    await service.getOrInitMemory()

    // Act
    const updated = await service.updateProfile({
      learningStyle: "visual",
      goals: ["Master React"],
    })

    // Assert
    expect(updated.profile.learningStyle).toBe("visual")
    expect(updated.profile.goals).toEqual(["Master React"])
    expect(updated.profile.pacePreference).toBe("moderate")
  })

  it("records a completed session in progress", async () => {
    // Arrange
    await service.getOrInitMemory()

    // Act
    const updated = await service.recordSessionCompleted({
      topics: ["TypeScript"],
      messageCount: 5,
    })

    // Assert
    expect(updated.progress.totalSessions).toBe(1)
    expect(updated.progress.topicsExplored).toHaveLength(1)
    expect(updated.progress.topicsExplored[0].topic).toBe("TypeScript")
    expect(updated.progress.topicsExplored[0].sessionsCount).toBe(1)
  })

  it("increments existing topic progress", async () => {
    // Arrange
    await service.getOrInitMemory()
    await service.recordSessionCompleted({ topics: ["TypeScript"], messageCount: 3 })

    // Act
    const updated = await service.recordSessionCompleted({
      topics: ["TypeScript"],
      messageCount: 4,
    })

    // Assert
    expect(updated.progress.totalSessions).toBe(2)
    expect(updated.progress.topicsExplored).toHaveLength(1)
    expect(updated.progress.topicsExplored[0].sessionsCount).toBe(2)
  })
})
