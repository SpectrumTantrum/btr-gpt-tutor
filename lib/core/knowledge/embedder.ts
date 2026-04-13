import type { Chunk, ProviderConfig } from "@/lib/core/types";
import type { KnowledgeRepository } from "@/lib/core/storage/repository";
import { embedTexts } from "@/lib/core/ai/embeddings";

const BATCH_SIZE = 20;

export async function embedChunks(
  chunks: readonly Chunk[],
  config: ProviderConfig,
  repo: KnowledgeRepository,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const unembedded = chunks.filter((c) => c.embedding === null);
  for (let i = 0; i < unembedded.length; i += BATCH_SIZE) {
    const batch = unembedded.slice(i, i + BATCH_SIZE);
    const embeddings = await embedTexts(batch.map((c) => c.content), config);
    for (let j = 0; j < batch.length; j++) {
      await repo.updateChunkEmbedding(batch[j].id, embeddings[j]);
    }
    onProgress?.(Math.min(i + BATCH_SIZE, unembedded.length), unembedded.length);
  }
}
