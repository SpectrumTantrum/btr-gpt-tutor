import type { Chunk, SearchResult } from "@/lib/core/types";
import { cosineSimilarity } from "@/lib/utils/cosine-similarity";

export interface RetrieveOptions {
  readonly topK: number;
  readonly minScore?: number;
}

export function retrieveChunks(
  queryEmbedding: readonly number[],
  chunks: readonly Chunk[],
  options: RetrieveOptions,
): readonly SearchResult[] {
  const { topK, minScore = 0 } = options;
  const scored: SearchResult[] = [];

  for (const chunk of chunks) {
    if (!chunk.embedding || chunk.embedding.length === 0) continue;
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    if (score >= minScore) scored.push({ chunk, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
