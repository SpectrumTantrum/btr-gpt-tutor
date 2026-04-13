import { describe, it, expect, vi } from "vitest"

// Mock isMultiUserMode before importing the factory
vi.mock("@/lib/core/auth/middleware", () => ({
  isMultiUserMode: vi.fn().mockReturnValue(false),
}))

// Provide fake-indexeddb so Dexie can work in Node environment
import "fake-indexeddb/auto"

import { createRepositories } from "@/lib/core/storage/repository-factory"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { DexieSessionRepository } from "@/lib/core/storage/session-repo"
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo"
import { DexieNotebookRepository } from "@/lib/core/storage/notebook-repo"
import { DexieClassroomRepository } from "@/lib/core/storage/classroom-repo"
import { DexieTutorBotRepository } from "@/lib/core/storage/tutorbot-repo"

describe("createRepositories", () => {
  it("createRepositories returns a repository set in personal mode (no Supabase env)", () => {
    // Arrange — isMultiUserMode is mocked to return false (personal mode)

    // Act
    const repos = createRepositories()

    // Assert
    expect(repos).toBeDefined()
  })

  it("returned set has all 6 repository properties", () => {
    // Arrange & Act
    const repos = createRepositories()

    // Assert
    expect(repos).toHaveProperty("knowledge")
    expect(repos).toHaveProperty("session")
    expect(repos).toHaveProperty("memory")
    expect(repos).toHaveProperty("notebook")
    expect(repos).toHaveProperty("classroom")
    expect(repos).toHaveProperty("tutorbot")
  })

  it("all repos are instances of their Dexie implementations", () => {
    // Arrange & Act
    const repos = createRepositories()

    // Assert
    expect(repos.knowledge).toBeInstanceOf(DexieKnowledgeRepository)
    expect(repos.session).toBeInstanceOf(DexieSessionRepository)
    expect(repos.memory).toBeInstanceOf(DexieMemoryRepository)
    expect(repos.notebook).toBeInstanceOf(DexieNotebookRepository)
    expect(repos.classroom).toBeInstanceOf(DexieClassroomRepository)
    expect(repos.tutorbot).toBeInstanceOf(DexieTutorBotRepository)
  })
})
