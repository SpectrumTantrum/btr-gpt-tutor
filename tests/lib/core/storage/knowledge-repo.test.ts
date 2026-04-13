import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import type { KnowledgeBase, Document, Chunk } from "@/lib/core/types"

let dbCounter = 0

function makeKB(overrides: Partial<KnowledgeBase> = {}): Omit<KnowledgeBase, "id"> {
  return {
    name: "Test KB",
    description: "A test knowledge base",
    embeddingModel: "text-embedding-3-small",
    embeddingDimension: 1536,
    documentCount: 0,
    chunkCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

function makeDocument(knowledgeBaseId: string): Omit<Document, "id"> {
  return {
    knowledgeBaseId,
    name: "test.pdf",
    mimeType: "application/pdf",
    size: 1024,
    chunkCount: 0,
    createdAt: Date.now(),
  }
}

function makeChunk(knowledgeBaseId: string, documentId: string): Omit<Chunk, "id"> {
  return {
    knowledgeBaseId,
    documentId,
    content: "This is a chunk of content.",
    metadata: {
      documentName: "test.pdf",
      chunkIndex: 0,
    },
    embedding: null,
  }
}

describe("DexieKnowledgeRepository", () => {
  let db: TutorDatabase
  let repo: DexieKnowledgeRepository

  beforeEach(() => {
    db = new TutorDatabase(`TutorDatabase-kb-${++dbCounter}`)
    repo = new DexieKnowledgeRepository(db)
  })

  it("creates and retrieves a knowledge base", async () => {
    // Arrange
    const kbData = makeKB()

    // Act
    const created = await repo.createKnowledgeBase(kbData)
    const retrieved = await repo.getKnowledgeBase(created.id)

    // Assert
    expect(retrieved).not.toBeNull()
    expect(retrieved!.id).toBe(created.id)
    expect(retrieved!.name).toBe(kbData.name)
    expect(retrieved!.embeddingModel).toBe(kbData.embeddingModel)
  })

  it("lists all knowledge bases", async () => {
    // Arrange
    await repo.createKnowledgeBase(makeKB({ name: "KB One" }))
    await repo.createKnowledgeBase(makeKB({ name: "KB Two" }))

    // Act
    const all = await repo.listKnowledgeBases()

    // Assert
    expect(all).toHaveLength(2)
    const names = all.map((kb) => kb.name)
    expect(names).toContain("KB One")
    expect(names).toContain("KB Two")
  })

  it("deletes a KB and cascades to documents and chunks", async () => {
    // Arrange
    const kb = await repo.createKnowledgeBase(makeKB())
    const doc = await repo.addDocument(makeDocument(kb.id))
    await repo.addChunks([makeChunk(kb.id, doc.id), makeChunk(kb.id, doc.id)])

    // Act
    await repo.deleteKnowledgeBase(kb.id)

    // Assert
    const retrieved = await repo.getKnowledgeBase(kb.id)
    expect(retrieved).toBeNull()

    const docs = await repo.getDocuments(kb.id)
    expect(docs).toHaveLength(0)

    const chunks = await repo.getChunks(kb.id)
    expect(chunks).toHaveLength(0)
  })

  it("adds and retrieves chunks with embeddings", async () => {
    // Arrange
    const kb = await repo.createKnowledgeBase(makeKB())
    const doc = await repo.addDocument(makeDocument(kb.id))
    const chunkData = makeChunk(kb.id, doc.id)

    // Act
    const [added] = await repo.addChunks([chunkData])
    const embedding = [0.1, 0.2, 0.3]
    await repo.updateChunkEmbedding(added.id, embedding)

    const chunks = await repo.getChunks(kb.id)

    // Assert
    expect(chunks).toHaveLength(1)
    expect(chunks[0].content).toBe(chunkData.content)
    expect(chunks[0].embedding).toEqual(embedding)
  })
})
