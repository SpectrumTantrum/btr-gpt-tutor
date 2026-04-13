import type { KnowledgeBase, Document, Chunk } from "@/lib/core/types";
import type { KnowledgeRepository } from "@/lib/core/storage/repository";
import { generateId } from "@/lib/utils/id";
import { parseDocument } from "@/lib/core/knowledge/parser";
import { chunkText } from "@/lib/core/knowledge/chunker";

const MAX_CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

export interface CreateKnowledgeBaseInput {
  name: string;
  description: string;
  embeddingModel: string;
  embeddingDimension: number;
}

export class KnowledgeService {
  constructor(private readonly repo: KnowledgeRepository) {}

  async createKnowledgeBase(input: CreateKnowledgeBaseInput): Promise<KnowledgeBase> {
    const now = Date.now();
    return this.repo.createKnowledgeBase({
      id: generateId("kb"),
      name: input.name,
      description: input.description,
      embeddingModel: input.embeddingModel,
      embeddingDimension: input.embeddingDimension,
      documentCount: 0,
      chunkCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    return this.repo.listKnowledgeBases();
  }

  async getKnowledgeBase(id: string): Promise<KnowledgeBase | null> {
    return this.repo.getKnowledgeBase(id);
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    return this.repo.deleteKnowledgeBase(id);
  }

  async ingestDocument(
    kbId: string,
    content: Blob,
    name: string,
    mimeType: string
  ): Promise<Document> {
    const parsed = await parseDocument(content, name, mimeType);
    const textChunks = chunkText(parsed.text, {
      maxChunkSize: MAX_CHUNK_SIZE,
      overlap: CHUNK_OVERLAP,
    });

    const doc = await this.repo.addDocument({
      knowledgeBaseId: kbId,
      name,
      mimeType,
      size: content.size,
      chunkCount: textChunks.length,
      createdAt: Date.now(),
    });

    const chunkData = textChunks.map((tc) => ({
      id: generateId("chunk"),
      knowledgeBaseId: kbId,
      documentId: doc.id,
      content: tc.content,
      metadata: {
        documentName: name,
        headingHierarchy: tc.headings.length > 0 ? tc.headings : undefined,
        chunkIndex: tc.index,
      },
      embedding: null as null,
    }));

    // addChunks generates its own ids via nanoid — pass without id
    const chunksToAdd = chunkData.map(({ id: _id, ...rest }) => rest);
    await this.repo.addChunks(chunksToAdd);

    const kb = await this.repo.getKnowledgeBase(kbId);
    if (kb !== null) {
      await this.repo.updateKnowledgeBase(kbId, {
        documentCount: kb.documentCount + 1,
        chunkCount: kb.chunkCount + textChunks.length,
        updatedAt: Date.now(),
      });
    }

    return doc;
  }

  async getChunks(kbId: string): Promise<Chunk[]> {
    return this.repo.getChunks(kbId);
  }
}
