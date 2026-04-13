import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieSessionRepository } from "@/lib/core/storage/session-repo"
import type { Session, Message } from "@/lib/core/types"

let dbCounter = 0

function makeSession(overrides: Partial<Session> = {}): Omit<Session, "id"> {
  const now = Date.now()
  return {
    title: "Test Session",
    knowledgeBaseIds: [],
    messages: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function makeMessage(overrides: Partial<Message> = {}): Omit<Message, "id"> {
  return {
    role: "user",
    content: "Hello, world!",
    createdAt: Date.now(),
    ...overrides,
  }
}

describe("DexieSessionRepository", () => {
  let db: TutorDatabase
  let repo: DexieSessionRepository

  beforeEach(() => {
    db = new TutorDatabase(`TutorDatabase-session-${++dbCounter}`)
    repo = new DexieSessionRepository(db)
  })

  it("creates and retrieves a session", async () => {
    // Arrange
    const sessionData = makeSession({ title: "My Session" })

    // Act
    const created = await repo.createSession(sessionData)
    const retrieved = await repo.getSession(created.id)

    // Assert
    expect(retrieved).not.toBeNull()
    expect(retrieved!.id).toBe(created.id)
    expect(retrieved!.title).toBe("My Session")
    expect(retrieved!.messages).toHaveLength(0)
  })

  it("adds a message to a session and updates updatedAt", async () => {
    // Arrange
    const before = Date.now()
    const session = await repo.createSession(makeSession())
    const msgData = makeMessage({ content: "First message", role: "user" })

    // Act
    await repo.addMessage(session.id, msgData)
    const retrieved = await repo.getSession(session.id)

    // Assert
    expect(retrieved).not.toBeNull()
    expect(retrieved!.messages).toHaveLength(1)
    expect(retrieved!.messages[0].content).toBe("First message")
    expect(retrieved!.messages[0].role).toBe("user")
    expect(retrieved!.updatedAt).toBeGreaterThanOrEqual(before)
  })

  it("lists sessions ordered by updatedAt descending", async () => {
    // Arrange — staggered updatedAt so ordering is deterministic
    const older = await repo.createSession(makeSession({ updatedAt: 1000, title: "Older" }))
    const newer = await repo.createSession(makeSession({ updatedAt: 2000, title: "Newer" }))

    // Act
    const all = await repo.listSessions()

    // Assert
    expect(all).toHaveLength(2)
    expect(all[0].id).toBe(newer.id)
    expect(all[1].id).toBe(older.id)
  })

  it("deletes a session", async () => {
    // Arrange
    const session = await repo.createSession(makeSession())

    // Act
    await repo.deleteSession(session.id)
    const retrieved = await repo.getSession(session.id)

    // Assert
    expect(retrieved).toBeNull()
  })
})
