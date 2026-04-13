import { nanoid } from "nanoid"
import type { KnowledgeBase, Document, Chunk } from "@/lib/core/types"
import type { KnowledgeRepository } from "@/lib/core/storage/repository"
import type { TutorDatabase } from "@/lib/core/storage/db"

export class DexieKnowledgeRepository implements KnowledgeRepository {
  constructor(private readonly db: TutorDatabase) {}

  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    return this.db.knowledgeBases.toArray()
  }

  async getKnowledgeBase(id: string): Promise<KnowledgeBase | null> {
    const kb = await this.db.knowledgeBases.get(id)
    return kb ?? null
  }

  async createKnowledgeBase(data: Omit<KnowledgeBase, "id"> & { id?: string }): Promise<KnowledgeBase> {
    const kb: KnowledgeBase = { ...data, id: data.id ?? nanoid() }
    await this.db.knowledgeBases.add(kb)
    return kb
  }

  async updateKnowledgeBase(
    id: string,
    data: Partial<Omit<KnowledgeBase, "id">>
  ): Promise<KnowledgeBase> {
    await this.db.knowledgeBases.update(id, data)
    const updated = await this.db.knowledgeBases.get(id)
    if (!updated) throw new Error(`KnowledgeBase ${id} not found`)
    return updated
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.knowledgeBases, this.db.documents, this.db.chunks],
      async () => {
        const docIds = await this.db.documents
          .where("knowledgeBaseId")
          .equals(id)
          .primaryKeys()

        await this.db.chunks.where("knowledgeBaseId").equals(id).delete()
        await this.db.documents.bulkDelete(docIds as string[])
        await this.db.knowledgeBases.delete(id)
      }
    )
  }

  async addDocument(data: Omit<Document, "id">): Promise<Document> {
    const doc: Document = { ...data, id: nanoid() }
    await this.db.documents.add(doc)
    return doc
  }

  async getDocuments(knowledgeBaseId: string): Promise<Document[]> {
    return this.db.documents.where("knowledgeBaseId").equals(knowledgeBaseId).toArray()
  }

  async deleteDocument(id: string): Promise<void> {
    await this.db.documents.delete(id)
  }

  async addChunks(data: Omit<Chunk, "id">[]): Promise<Chunk[]> {
    const chunks: Chunk[] = data.map((c) => ({ ...c, id: nanoid() }))
    await this.db.chunks.bulkAdd(chunks)
    return chunks
  }

  async getChunks(knowledgeBaseId: string): Promise<Chunk[]> {
    return this.db.chunks.where("knowledgeBaseId").equals(knowledgeBaseId).toArray()
  }

  async getChunksByDocument(documentId: string): Promise<Chunk[]> {
    return this.db.chunks.where("documentId").equals(documentId).toArray()
  }

  async updateChunkEmbedding(id: string, embedding: number[]): Promise<void> {
    await this.db.chunks.update(id, { embedding })
  }

  async deleteChunksByDocument(documentId: string): Promise<void> {
    await this.db.chunks.where("documentId").equals(documentId).delete()
  }
}
