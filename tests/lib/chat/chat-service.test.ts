import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/chat/prompts";
import type { LearnerProfile, SearchResult, Chunk } from "@/lib/core/types";

describe("buildSystemPrompt", () => {
  const makeChunk = (id: string, content: string, docName: string): Chunk => ({
    id,
    knowledgeBaseId: "kb_1",
    documentId: "doc_1",
    content,
    metadata: { documentName: docName, chunkIndex: 0 },
    embedding: null,
  });

  it("includes base tutor instructions", () => {
    const prompt = buildSystemPrompt(null, []);
    expect(prompt).toContain("tutor");
  });

  it("includes learner profile when provided", () => {
    const profile: LearnerProfile = {
      knowledgeLevels: {},
      learningStyle: "visual",
      pacePreference: "thorough",
      goals: ["pass exam"],
      language: "en",
    };
    const prompt = buildSystemPrompt(profile, []);
    expect(prompt).toContain("visual");
    expect(prompt).toContain("thorough");
    expect(prompt).toContain("pass exam");
  });

  it("includes retrieved chunks with citations", () => {
    const results: SearchResult[] = [
      { chunk: makeChunk("c1", "Calculus content", "textbook.pdf"), score: 0.92 },
      { chunk: makeChunk("c2", "More math", "notes.md"), score: 0.85 },
    ];
    const prompt = buildSystemPrompt(null, results);
    expect(prompt).toContain("[Source 1: textbook.pdf]");
    expect(prompt).toContain("Calculus content");
    expect(prompt).toContain("[Source 2: notes.md]");
    expect(prompt).toContain("[Source N]");
  });
});
