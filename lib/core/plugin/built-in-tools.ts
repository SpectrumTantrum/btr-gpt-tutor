import type { SearchResult, ToolDefinition, WebSearchResult } from "@/lib/core/types";

export interface RagToolDeps {
  readonly search: (query: string) => Promise<readonly SearchResult[]>;
}

export interface WebSearchToolDeps {
  readonly search: (query: string, maxResults?: number) => Promise<readonly WebSearchResult[]>;
}

export function createRagTool(deps: RagToolDeps): ToolDefinition {
  return {
    id: "rag_search",
    name: "Knowledge Base Search",
    description: "Search the knowledge base using semantic similarity",
    execute: async (params: Record<string, unknown>): Promise<readonly SearchResult[]> => {
      const query = String(params["query"] ?? "");
      return deps.search(query);
    },
  };
}

export function createWebSearchTool(deps: WebSearchToolDeps): ToolDefinition {
  return {
    id: "web_search",
    name: "Web Search",
    description: "Search the web for up-to-date information",
    execute: async (params: Record<string, unknown>): Promise<readonly WebSearchResult[]> => {
      const query = String(params["query"] ?? "");
      const maxResults = typeof params["maxResults"] === "number" ? params["maxResults"] : undefined;
      return deps.search(query, maxResults);
    },
  };
}
