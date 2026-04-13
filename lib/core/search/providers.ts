import type { WebSearchResult } from "../types";

// ============================================================
// Constants
// ============================================================

const TAVILY_API_URL = "https://api.tavily.com/search";
const DUCKDUCKGO_API_URL = "https://api.duckduckgo.com/";

// ============================================================
// Tavily provider
// ============================================================

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

export async function searchTavily(
  query: string,
  maxResults: number,
  apiKey: string
): Promise<WebSearchResult[]> {
  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, max_results: maxResults }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as TavilyResponse;

  return data.results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content,
  }));
}

// ============================================================
// DuckDuckGo provider
// ============================================================

interface DuckDuckGoTopic {
  Text?: string;
  FirstURL?: string;
}

interface DuckDuckGoResponse {
  RelatedTopics: DuckDuckGoTopic[];
}

export async function searchDuckDuckGo(
  query: string,
  maxResults: number
): Promise<WebSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    no_html: "1",
    no_redirect: "1",
  });

  const response = await fetch(`${DUCKDUCKGO_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`DuckDuckGo search failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as DuckDuckGoResponse;

  return data.RelatedTopics.slice(0, maxResults)
    .filter(
      (t): t is DuckDuckGoTopic & { Text: string; FirstURL: string } =>
        typeof t.Text === "string" && typeof t.FirstURL === "string"
    )
    .map((t) => ({
      title: t.Text.split(" - ")[0] ?? t.Text,
      url: t.FirstURL,
      snippet: t.Text,
    }));
}
