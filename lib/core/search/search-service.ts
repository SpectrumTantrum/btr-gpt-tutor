import type { WebSearchResult, SearchOptions } from "../types";

// ============================================================
// Provider type
// ============================================================

export type SearchProvider = (
  query: string,
  maxResults: number
) => Promise<WebSearchResult[]>;

export type ProviderMap = Record<string, SearchProvider>;

// ============================================================
// Constants
// ============================================================

const DEFAULT_MAX_RESULTS = 5;

// ============================================================
// SearchService
// ============================================================

export class SearchService {
  private readonly providers: ProviderMap;

  constructor(providers: ProviderMap) {
    this.providers = providers;
  }

  async search(options: SearchOptions): Promise<WebSearchResult[]> {
    const { query, maxResults = DEFAULT_MAX_RESULTS, provider } = options;

    const resolved = this.resolveProvider(provider);

    return resolved(query, maxResults);
  }

  private resolveProvider(providerName?: string): SearchProvider {
    const keys = Object.keys(this.providers);

    if (keys.length === 0) {
      throw new Error("No search provider available");
    }

    if (providerName !== undefined) {
      const found = this.providers[providerName];
      if (found === undefined) {
        throw new Error(`Search provider not found: ${providerName}`);
      }
      return found;
    }

    // Fall back to first available provider
    return this.providers[keys[0]];
  }
}
