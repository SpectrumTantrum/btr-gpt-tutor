import type { SupabaseClient } from "@supabase/supabase-js"
import { nanoid } from "nanoid"
import type { KnowledgeBase, Document, Chunk } from "@/lib/core/types"
import type { KnowledgeRepository } from "@/lib/core/storage/repository"

function toKnowledgeBase(row: Record<string, unknown>): KnowledgeBase {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    embeddingModel: row.embedding_model as string,
    embeddingDimension: row.embedding_dimension as number,
    documentCount: row.document_count as number,
    chunkCount: row.chunk_count as number,
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  }
}

function toDocument(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    knowledgeBaseId: row.knowledge_base_id as string,
    name: row.name as string,
    mimeType: row.mime_type as string,
    size: row.size as number,
    chunkCount: row.chunk_count as number,
    createdAt: new Date(row.created_at as string).getTime(),
  }
}

function toChunk(row: Record<string, unknown>): Chunk {
  return {
    id: row.id as string,
    knowledgeBaseId: row.knowledge_base_id as string,
    documentId: row.document_id as string,
    content: row.content as string,
    metadata: row.metadata as Chunk["metadata"],
    embedding: row.embedding as number[] | null,
  }
}

export class SupabaseKnowledgeRepository implements KnowledgeRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    const { data, error } = await this.supabase
      .from("knowledge_bases")
      .select("*")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toKnowledgeBase)
  }

  async getKnowledgeBase(id: string): Promise<KnowledgeBase | null> {
    const { data, error } = await this.supabase
      .from("knowledge_bases")
      .select("*")
      .eq("id", id)
      .eq("user_id", this.userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? toKnowledgeBase(data) : null
  }

  async createKnowledgeBase(
    data: Omit<KnowledgeBase, "id"> & { id?: string }
  ): Promise<KnowledgeBase> {
    const row = {
      id: data.id ?? nanoid(),
      user_id: this.userId,
      name: data.name,
      description: data.description,
      embedding_model: data.embeddingModel,
      embedding_dimension: data.embeddingDimension,
      document_count: data.documentCount,
      chunk_count: data.chunkCount,
    }

    const { data: inserted, error } = await this.supabase
      .from("knowledge_bases")
      .insert(row)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toKnowledgeBase(inserted)
  }

  async updateKnowledgeBase(
    id: string,
    data: Partial<Omit<KnowledgeBase, "id">>
  ): Promise<KnowledgeBase> {
    const updates: Record<string, unknown> = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.description !== undefined) updates.description = data.description
    if (data.embeddingModel !== undefined) updates.embedding_model = data.embeddingModel
    if (data.embeddingDimension !== undefined) updates.embedding_dimension = data.embeddingDimension
    if (data.documentCount !== undefined) updates.document_count = data.documentCount
    if (data.chunkCount !== undefined) updates.chunk_count = data.chunkCount
    if (data.updatedAt !== undefined) updates.updated_at = new Date(data.updatedAt).toISOString()

    const { data: updated, error } = await this.supabase
      .from("knowledge_bases")
      .update(updates)
      .eq("id", id)
      .eq("user_id", this.userId)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toKnowledgeBase(updated)
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("knowledge_bases")
      .delete()
      .eq("id", id)
      .eq("user_id", this.userId)

    if (error) throw new Error(error.message)
  }

  async addDocument(data: Omit<Document, "id">): Promise<Document> {
    const row = {
      id: nanoid(),
      user_id: this.userId,
      knowledge_base_id: data.knowledgeBaseId,
      name: data.name,
      mime_type: data.mimeType,
      size: data.size,
      chunk_count: data.chunkCount,
    }

    const { data: inserted, error } = await this.supabase
      .from("documents")
      .insert(row)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toDocument(inserted)
  }

  async getDocuments(knowledgeBaseId: string): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from("documents")
      .select("*")
      .eq("knowledge_base_id", knowledgeBaseId)
      .eq("user_id", this.userId)
      .order("created_at", { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toDocument)
  }

  async deleteDocument(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", this.userId)

    if (error) throw new Error(error.message)
  }

  async addChunks(data: Omit<Chunk, "id">[]): Promise<Chunk[]> {
    const rows = data.map((c) => ({
      id: nanoid(),
      knowledge_base_id: c.knowledgeBaseId,
      document_id: c.documentId,
      content: c.content,
      metadata: c.metadata,
      embedding: c.embedding,
    }))

    const { data: inserted, error } = await this.supabase
      .from("chunks")
      .insert(rows)
      .select("*")

    if (error) throw new Error(error.message)
    return (inserted ?? []).map(toChunk)
  }

  async getChunks(knowledgeBaseId: string): Promise<Chunk[]> {
    const { data, error } = await this.supabase
      .from("chunks")
      .select("*")
      .eq("knowledge_base_id", knowledgeBaseId)

    if (error) throw new Error(error.message)
    return (data ?? []).map(toChunk)
  }

  async getChunksByDocument(documentId: string): Promise<Chunk[]> {
    const { data, error } = await this.supabase
      .from("chunks")
      .select("*")
      .eq("document_id", documentId)

    if (error) throw new Error(error.message)
    return (data ?? []).map(toChunk)
  }

  async updateChunkEmbedding(id: string, embedding: number[]): Promise<void> {
    const { error } = await this.supabase
      .from("chunks")
      .update({ embedding })
      .eq("id", id)

    if (error) throw new Error(error.message)
  }

  async deleteChunksByDocument(documentId: string): Promise<void> {
    const { error } = await this.supabase
      .from("chunks")
      .delete()
      .eq("document_id", documentId)

    if (error) throw new Error(error.message)
  }
}
