import { describe, it, expect } from "vitest";
import { retrieveChunks } from "@/lib/core/knowledge/retriever";
import type { Chunk } from "@/lib/core/types";

describe("retrieveChunks", () => {
  const makeChunk = (id: string, embedding: number[]): Chunk => ({
    id, knowledgeBaseId: "kb_1", documentId: "doc_1",
    content: `Content for ${id}`,
    metadata: { documentName: "test.txt", chunkIndex: 0 },
    embedding,
  });

  it("returns chunks ranked by cosine similarity", () => {
    const chunks = [
      makeChunk("c1", [1, 0, 0]),
      makeChunk("c2", [0, 1, 0]),
      makeChunk("c3", [0.9, 0.1, 0]),
    ];
    const results = retrieveChunks([1, 0, 0], chunks, { topK: 3 });
    expect(results).toHaveLength(3);
    expect(results[0].chunk.id).toBe("c1");
    expect(results[1].chunk.id).toBe("c3");
    expect(results[0].score).toBeCloseTo(1.0);
  });

  it("respects topK limit", () => {
    const chunks = [makeChunk("c1", [1, 0]), makeChunk("c2", [0.5, 0.5]), makeChunk("c3", [0, 1])];
    const results = retrieveChunks([1, 0], chunks, { topK: 2 });
    expect(results).toHaveLength(2);
  });

  it("respects minScore threshold", () => {
    const chunks = [makeChunk("c1", [1, 0]), makeChunk("c2", [0, 1])];
    const results = retrieveChunks([1, 0], chunks, { topK: 10, minScore: 0.5 });
    expect(results).toHaveLength(1);
    expect(results[0].chunk.id).toBe("c1");
  });

  it("skips chunks without embeddings", () => {
    const chunks = [
      makeChunk("c1", [1, 0]),
      { ...makeChunk("c2", []), embedding: null } as unknown as Chunk,
    ];
    const results = retrieveChunks([1, 0], chunks, { topK: 10 });
    expect(results).toHaveLength(1);
  });
});
