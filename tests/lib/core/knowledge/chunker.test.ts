import { describe, it, expect } from "vitest";
import { chunkText } from "@/lib/core/knowledge/chunker";

describe("chunkText", () => {
  it("returns single chunk for short text", () => {
    const chunks = chunkText("Short text.", { maxChunkSize: 500, overlap: 50 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe("Short text.");
  });

  it("splits long text into multiple chunks", () => {
    const paragraphs = Array.from({ length: 10 }, (_, i) => `Paragraph ${i}. ${"Lorem ipsum ".repeat(20)}`).join("\n\n");
    const chunks = chunkText(paragraphs, { maxChunkSize: 200, overlap: 30 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(300);
    }
  });

  it("preserves heading hierarchy in metadata", () => {
    const text = "# Chapter 1\n\n## Section A\n\nContent under section A.\n\n## Section B\n\nContent under section B.";
    const chunks = chunkText(text, { maxChunkSize: 80, overlap: 0 });
    const sectionBChunk = chunks.find((c) => c.content.includes("Content under section B"));
    expect(sectionBChunk?.headings).toContain("Chapter 1");
    expect(sectionBChunk?.headings).toContain("Section B");
  });

  it("includes overlap between consecutive chunks", () => {
    const text = "First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence. Sixth sentence. Seventh sentence. Eighth sentence.";
    const chunks = chunkText(text, { maxChunkSize: 60, overlap: 20 });
    if (chunks.length >= 2) {
      const end1 = chunks[0].content.slice(-20);
      const start2 = chunks[1].content.slice(0, 40);
      expect(start2).toContain(end1.trim().split(" ").pop());
    }
  });
});
