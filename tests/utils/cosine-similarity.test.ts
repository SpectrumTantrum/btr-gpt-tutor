import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "@/lib/utils/cosine-similarity";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0);
  });
  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0.0);
  });
  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0);
  });
  it("handles normalized vectors correctly", () => {
    const a = [0.6, 0.8];
    const b = [0.8, 0.6];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0.96);
  });
  it("throws on mismatched dimensions", () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow("dimension");
  });
  it("returns 0 for zero vectors", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});
