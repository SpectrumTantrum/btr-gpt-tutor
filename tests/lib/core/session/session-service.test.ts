import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieSessionRepository } from "@/lib/core/storage/session-repo"
import { SessionService } from "@/lib/core/session/session-service"

let dbCounter = 0

describe("SessionService", () => {
  let db: TutorDatabase
  let repo: DexieSessionRepository
  let service: SessionService

  beforeEach(() => {
    db = new TutorDatabase(`TutorDatabase-session-service-${++dbCounter}`)
    repo = new DexieSessionRepository(db)
    service = new SessionService(repo)
  })

  it("creates a session with default title 'New Session' and empty messages", async () => {
    // Arrange & Act
    const session = await service.createSession({ knowledgeBaseIds: ["kb_1"] })

    // Assert
    expect(session.id).toMatch(/^sess_/)
    expect(session.title).toBe("New Session")
    expect(session.messages).toHaveLength(0)
    expect(session.knowledgeBaseIds).toEqual(["kb_1"])
  })

  it("adds a user message and retrieves it with role 'user' and correct content", async () => {
    // Arrange
    const session = await service.createSession({ knowledgeBaseIds: [] })

    // Act
    const updated = await service.addUserMessage(session.id, "Hello from user")
    const retrieved = await service.getSession(session.id)

    // Assert
    expect(updated.messages).toHaveLength(1)
    const msg = updated.messages[0]
    expect(msg.id).toMatch(/^msg_/)
    expect(msg.role).toBe("user")
    expect(msg.content).toBe("Hello from user")
    expect(typeof msg.createdAt).toBe("number")
    expect(retrieved).not.toBeNull()
    expect(retrieved!.messages).toHaveLength(1)
  })

  it("adds an assistant message with citations", async () => {
    // Arrange
    const session = await service.createSession({ knowledgeBaseIds: [] })
    const citations = [
      {
        chunkId: "chunk_1",
        documentName: "doc.pdf",
        content: "relevant excerpt",
        score: 0.95,
      },
    ]

    // Act
    const updated = await service.addAssistantMessage(
      session.id,
      "Here is the answer",
      citations
    )

    // Assert
    expect(updated.messages).toHaveLength(1)
    const msg = updated.messages[0]
    expect(msg.id).toMatch(/^msg_/)
    expect(msg.role).toBe("assistant")
    expect(msg.content).toBe("Here is the answer")
    expect(msg.citations).toHaveLength(1)
    expect(msg.citations![0].chunkId).toBe("chunk_1")
    expect(msg.citations![0].score).toBe(0.95)
  })

  it("lists sessions", async () => {
    // Arrange
    await service.createSession({ knowledgeBaseIds: [], title: "Session A" })
    await service.createSession({ knowledgeBaseIds: [], title: "Session B" })

    // Act
    const sessions = await service.listSessions()

    // Assert
    expect(sessions).toHaveLength(2)
    const titles = sessions.map((s) => s.title)
    expect(titles).toContain("Session A")
    expect(titles).toContain("Session B")
  })
})
