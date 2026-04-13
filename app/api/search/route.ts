import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SearchService } from "@/lib/core/search/search-service";
import { searchTavily, searchDuckDuckGo } from "@/lib/core/search/providers";
import type { ProviderMap } from "@/lib/core/search/search-service";

// ============================================================
// Validation schema
// ============================================================

const searchRequestSchema = z.object({
  query: z.string().min(1),
  maxResults: z.number().int().min(1).max(20).optional(),
  provider: z.enum(["tavily", "duckduckgo"]).optional(),
});

// ============================================================
// POST /api/search
// ============================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = searchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { query, maxResults, provider } = parsed.data;

  const providers = buildProviders();

  if (Object.keys(providers).length === 0) {
    return NextResponse.json(
      { success: false, error: "No search providers configured" },
      { status: 503 }
    );
  }

  const service = new SearchService(providers);

  try {
    const results = await service.search({ query, maxResults, provider });
    return NextResponse.json({ success: true, data: results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ============================================================
// Provider factory — reads from env vars at request time
// ============================================================

function buildProviders(): ProviderMap {
  const providers: ProviderMap = {};

  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) {
    providers.tavily = (query, maxResults) => searchTavily(query, maxResults, tavilyKey);
  }

  if (process.env.DUCKDUCKGO_ENABLED === "true") {
    providers.duckduckgo = searchDuckDuckGo;
  }

  return providers;
}
