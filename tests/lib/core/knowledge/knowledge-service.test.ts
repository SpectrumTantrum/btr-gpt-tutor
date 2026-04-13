import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { KnowledgeService } from "@/lib/core/knowledge/knowledge-service"

let dbCounter = 0

describe("KnowledgeService", () => {
  let repo: DexieKnowledgeRepository
  let service: KnowledgeService

  beforeEach(() => {
    const db = new TutorDatabase(`TutorDatabase-svc-${++dbCounter}`)
    repo = new DexieKnowledgeRepository(db)
    service = new KnowledgeService(repo)
  })

  it("creates a knowledge base with correct defaults", async () => {
    // Arrange
    const input = {
      name: "My KB",
      description: "Test description",
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
    }

    // Act
    const kb = await service.createKnowledgeBase(input)

    // Assert
    expect(kb.id).toMatch(/^kb_/)
    expect(kb.name).toBe(input.name)
    expect(kb.description).toBe(input.description)
    expect(kb.embeddingModel).toBe(input.embeddingModel)
    expect(kb.embeddingDimension).toBe(input.embeddingDimension)
    expect(kb.documentCount).toBe(0)
    expect(kb.chunkCount).toBe(0)
    expect(kb.createdAt).toBeGreaterThan(0)
    expect(kb.updatedAt).toBeGreaterThan(0)
  })

  it("lists knowledge bases", async () => {
    // Arrange
    await service.createKnowledgeBase({
      name: "KB Alpha",
      description: "",
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
    })
    await service.createKnowledgeBase({
      name: "KB Beta",
      description: "",
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
    })

    // Act
    const list = await service.listKnowledgeBases()

    // Assert
    expect(list).toHaveLength(2)
    const names = list.map((kb) => kb.name)
    expect(names).toContain("KB Alpha")
    expect(names).toContain("KB Beta")
  })

  it("ingests a text document into chunks with null embeddings initially", async () => {
    // Arrange
    const kb = await service.createKnowledgeBase({
      name: "Ingestion KB",
      description: "",
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
    })
    const text = "This is the first sentence. This is the second sentence. This is the third sentence."
    const blob = new Blob([text], { type: "text/plain" })

    // Act
    const doc = await service.ingestDocument(kb.id, blob, "test.txt", "text/plain")

    // Assert — document created
    expect(doc.id).toBeDefined()
    expect(doc.knowledgeBaseId).toBe(kb.id)
    expect(doc.name).toBe("test.txt")
    expect(doc.mimeType).toBe("text/plain")
    expect(doc.chunkCount).toBeGreaterThan(0)

    // Assert — chunks created with null embeddings
    const chunks = await service.getChunks(kb.id)
    expect(chunks.length).toBeGreaterThan(0)
    for (const chunk of chunks) {
      expect(chunk.embedding).toBeNull()
      expect(chunk.knowledgeBaseId).toBe(kb.id)
      expect(chunk.documentId).toBe(doc.id)
    }

    // Assert — KB counts updated
    const updatedKb = await service.getKnowledgeBase(kb.id)
    expect(updatedKb!.documentCount).toBe(1)
    expect(updatedKb!.chunkCount).toBe(chunks.length)
  })
})
