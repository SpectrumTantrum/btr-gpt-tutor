import { describe, it, expect, vi } from "vitest";
import { SearchService } from "@/lib/core/search/search-service";
import type { WebSearchResult } from "@/lib/core/types";

describe("SearchService", () => {
  it("returns results from mock provider", async () => {
    const mockResults: WebSearchResult[] = [
      { title: "Result 1", url: "https://example.com/1", snippet: "First" },
      { title: "Result 2", url: "https://example.com/2", snippet: "Second" },
    ];
    const mockProvider = vi.fn().mockResolvedValue(mockResults);
    const service = new SearchService({ duckduckgo: mockProvider });
    const results = await service.search({ query: "test query", provider: "duckduckgo" });
    expect(results).toHaveLength(2);
    expect(mockProvider).toHaveBeenCalledWith("test query", 5);
  });

  it("falls back to first available provider", async () => {
    const mockProvider = vi.fn().mockResolvedValue([]);
    const service = new SearchService({ tavily: mockProvider });
    await service.search({ query: "test" });
    expect(mockProvider).toHaveBeenCalled();
  });

  it("throws when no providers available", async () => {
    const service = new SearchService({});
    await expect(service.search({ query: "test" })).rejects.toThrow("No search provider");
  });

  it("respects maxResults parameter", async () => {
    const mockProvider = vi.fn().mockResolvedValue([]);
    const service = new SearchService({ tavily: mockProvider });
    await service.search({ query: "test", maxResults: 3 });
    expect(mockProvider).toHaveBeenCalledWith("test", 3);
  });
});
