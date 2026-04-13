# Phase 2: Study Depth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the basic RAG tutor (Phase 1) into a full personal study platform with plugin system, web search, notebooks, quizzes, guided learning, multi-agent problem solving (Deep Solve), parallel research (Deep Research), vision solving, and data visualization.

**Architecture:** Extends the Phase 1 modular monolith. New shared core modules (plugin system, search, notebook storage) in `lib/core/`. New feature modules (quiz, guide, notebook, solve, research, visualize) in `lib/`. Each module follows the same pattern: types → storage → service → API route → store → UI → E2E test. Chat modes (Deep Solve, Deep Research, Vision Solver) extend the existing chat module via the plugin system.

**Tech Stack:** Existing Phase 1 stack + mitt (event bus for plugin system), echarts (visualization), mermaid (diagram rendering)

**Phase 1 baseline:** 42 unit tests, 7 E2E tests, 18 commits. All passing.

---

## File Structure (New/Modified Files)

```
lib/
├── core/
│   ├── types/index.ts                    # MODIFY: Add Notebook, Quiz, Guide, Plugin types
│   ├── storage/
│   │   ├── db.ts                         # MODIFY: Add notebooks, quizzes, guides tables
│   │   ├── repository.ts                 # MODIFY: Add NotebookRepository, QuizRepository, GuideRepository
│   │   ├── notebook-repo.ts              # CREATE: Dexie notebook repository
│   │   ├── quiz-repo.ts                  # CREATE: Dexie quiz repository
│   │   └── guide-repo.ts                 # CREATE: Dexie guide repository
│   ├── search/
│   │   ├── providers.ts                  # CREATE: Tavily, DuckDuckGo wrappers
│   │   └── search-service.ts             # CREATE: Unified search facade
│   └── plugin/
│       ├── registry.ts                   # CREATE: Plugin registry
│       └── built-in-tools.ts             # CREATE: RAG, web search tool definitions
├── notebook/
│   └── notebook-service.ts               # CREATE: Notebook CRUD + record management
├── quiz/
│   ├── quiz-service.ts                   # CREATE: Quiz generation + grading
│   └── prompts.ts                        # CREATE: Quiz generation/grading prompts
├── guide/
│   ├── guide-service.ts                  # CREATE: Guided learning plan + page generation
│   └── prompts.ts                        # CREATE: Guide plan/page prompts
├── chat/
│   ├── modes/
│   │   ├── deep-solve.ts                 # CREATE: Multi-agent solve pipeline
│   │   ├── deep-research.ts              # CREATE: Parallel research pipeline
│   │   └── vision-solver.ts              # CREATE: Vision-based problem solving
│   └── chat-service.ts                   # MODIFY: Add mode routing
├── store/
│   ├── notebook-store.ts                 # CREATE
│   ├── quiz-store.ts                     # CREATE
│   └── guide-store.ts                    # CREATE

app/api/
├── search/route.ts                       # CREATE
├── notebook/route.ts                     # CREATE
├── notebook/[id]/route.ts                # CREATE
├── notebook/[id]/records/route.ts        # CREATE
├── quiz/generate/route.ts                # CREATE
├── quiz/grade/route.ts                   # CREATE
├── guide/plan/route.ts                   # CREATE
├── guide/page/route.ts                   # CREATE
├── solve/route.ts                        # CREATE
└── research/route.ts                     # CREATE

app/(workspace)/guide/page.tsx            # CREATE
app/(utility)/notebook/page.tsx           # CREATE

components/
├── chat/mode-switcher.tsx                # CREATE
├── chat/vision-upload.tsx                # CREATE
├── quiz/*.tsx                            # CREATE (3 components)
├── guide/*.tsx                           # CREATE (3 components)
├── notebook/*.tsx                        # CREATE (3 components)
└── visualize/chart-renderer.tsx          # CREATE

e2e/
├── notebook.test.ts                      # CREATE
├── quiz.test.ts                          # CREATE
├── guide.test.ts                         # CREATE
└── modes.test.ts                         # CREATE
```

---

## Task 1: Extend Types for Phase 2

**Files:**
- Modify: `lib/core/types/index.ts`

- [ ] **Step 1: Add Notebook types**

Append to `lib/core/types/index.ts`:

```typescript
// ============================================================
// Notebook Types
// ============================================================

export interface Notebook {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly recordCount: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface NotebookRecord {
  readonly id: string;
  readonly notebookId: string;
  readonly title: string;
  readonly content: string;
  readonly source: "chat" | "quiz" | "guide" | "research" | "co-writer" | "manual";
  readonly sourceId?: string;
  readonly tags: readonly string[];
  readonly createdAt: number;
}
```

- [ ] **Step 2: Add Quiz types**

```typescript
// ============================================================
// Quiz Types
// ============================================================

export type QuestionType = "single_choice" | "multiple_choice" | "short_answer";

export interface QuizQuestion {
  readonly id: string;
  readonly type: QuestionType;
  readonly question: string;
  readonly options?: readonly string[];
  readonly correctAnswer: string;
  readonly explanation: string;
}

export interface Quiz {
  readonly id: string;
  readonly knowledgeBaseId: string;
  readonly title: string;
  readonly questions: readonly QuizQuestion[];
  readonly createdAt: number;
}

export interface QuizAttempt {
  readonly id: string;
  readonly quizId: string;
  readonly answers: readonly QuizAnswer[];
  readonly score: number;
  readonly totalQuestions: number;
  readonly completedAt: number;
}

export interface QuizAnswer {
  readonly questionId: string;
  readonly userAnswer: string;
  readonly isCorrect: boolean;
  readonly feedback: string;
}
```

- [ ] **Step 3: Add Guided Learning types**

```typescript
// ============================================================
// Guided Learning Types
// ============================================================

export interface GuidePlan {
  readonly id: string;
  readonly knowledgeBaseId: string;
  readonly topic: string;
  readonly steps: readonly GuideStep[];
  readonly status: "in_progress" | "completed";
  readonly currentStepIndex: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface GuideStep {
  readonly title: string;
  readonly description: string;
  readonly htmlContent?: string;
  readonly isCompleted: boolean;
}
```

- [ ] **Step 4: Add Plugin and Search types**

```typescript
// ============================================================
// Plugin Types
// ============================================================

export interface ToolDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export interface CapabilityDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly requiredTools: readonly string[];
}

export type ChatMode = "chat" | "deep_solve" | "deep_research" | "vision_solver";

// ============================================================
// Search Types
// ============================================================

export interface WebSearchResult {
  readonly title: string;
  readonly url: string;
  readonly snippet: string;
}

export interface SearchOptions {
  readonly query: string;
  readonly maxResults?: number;
  readonly provider?: string;
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/core/types/index.ts
git commit -m "feat: add types for notebooks, quizzes, guided learning, plugins, and search"
```

---

## Task 2: Plugin System

**Files:**
- Create: `lib/core/plugin/registry.ts`, `lib/core/plugin/built-in-tools.ts`
- Test: `tests/lib/core/plugin/registry.test.ts`

- [ ] **Step 1: Write registry tests**

Create `tests/lib/core/plugin/registry.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { PluginRegistry } from "@/lib/core/plugin/registry";
import type { ToolDefinition } from "@/lib/core/types";

describe("PluginRegistry", () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  it("registers and retrieves a tool", () => {
    const tool: ToolDefinition = {
      id: "web_search", name: "Web Search", description: "Search the web",
      execute: async () => [],
    };
    registry.registerTool(tool);
    expect(registry.getTool("web_search")).toBe(tool);
  });

  it("returns undefined for unregistered tool", () => {
    expect(registry.getTool("nonexistent")).toBeUndefined();
  });

  it("lists all registered tools", () => {
    const tool1: ToolDefinition = { id: "t1", name: "T1", description: "", execute: async () => null };
    const tool2: ToolDefinition = { id: "t2", name: "T2", description: "", execute: async () => null };
    registry.registerTool(tool1);
    registry.registerTool(tool2);
    const tools = registry.listTools();
    expect(tools).toHaveLength(2);
  });

  it("prevents duplicate tool registration", () => {
    const tool: ToolDefinition = { id: "t1", name: "T1", description: "", execute: async () => null };
    registry.registerTool(tool);
    expect(() => registry.registerTool(tool)).toThrow("already registered");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/core/plugin/registry.test.ts
```

- [ ] **Step 3: Implement plugin registry**

Create `lib/core/plugin/registry.ts`:

```typescript
import type { ToolDefinition, CapabilityDefinition } from "@/lib/core/types";

export class PluginRegistry {
  private readonly tools = new Map<string, ToolDefinition>();
  private readonly capabilities = new Map<string, CapabilityDefinition>();

  registerTool(tool: ToolDefinition): void {
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool "${tool.id}" is already registered`);
    }
    this.tools.set(tool.id, tool);
  }

  getTool(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  listTools(): readonly ToolDefinition[] {
    return [...this.tools.values()];
  }

  registerCapability(capability: CapabilityDefinition): void {
    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability "${capability.id}" is already registered`);
    }
    this.capabilities.set(capability.id, capability);
  }

  getCapability(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  listCapabilities(): readonly CapabilityDefinition[] {
    return [...this.capabilities.values()];
  }
}
```

- [ ] **Step 4: Create built-in tool definitions**

Create `lib/core/plugin/built-in-tools.ts`:

```typescript
import type { ToolDefinition } from "@/lib/core/types";

export function createRagTool(deps: {
  getChunks: (kbId: string) => Promise<unknown[]>;
  embedText: (text: string) => Promise<readonly number[]>;
  retrieveChunks: (embedding: readonly number[], chunks: unknown[], options: unknown) => unknown[];
}): ToolDefinition {
  return {
    id: "rag_retrieval",
    name: "RAG Retrieval",
    description: "Search knowledge base documents for relevant context",
    execute: async (params) => {
      const { query, knowledgeBaseId } = params as { query: string; knowledgeBaseId: string };
      const chunks = await deps.getChunks(knowledgeBaseId);
      const embedding = await deps.embedText(query);
      return deps.retrieveChunks(embedding, chunks, { topK: 5, minScore: 0.3 });
    },
  };
}

export function createWebSearchTool(deps: {
  search: (query: string, maxResults?: number) => Promise<unknown[]>;
}): ToolDefinition {
  return {
    id: "web_search",
    name: "Web Search",
    description: "Search the web for up-to-date information",
    execute: async (params) => {
      const { query, maxResults } = params as { query: string; maxResults?: number };
      return deps.search(query, maxResults ?? 5);
    },
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test -- tests/lib/core/plugin/registry.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/core/plugin/ tests/lib/core/plugin/
git commit -m "feat: add plugin system with tool/capability registry"
```

---

## Task 3: Web Search Integration

**Files:**
- Create: `lib/core/search/providers.ts`, `lib/core/search/search-service.ts`, `app/api/search/route.ts`
- Test: `tests/lib/core/search/search-service.test.ts`

- [ ] **Step 1: Write search service test**

Create `tests/lib/core/search/search-service.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { SearchService } from "@/lib/core/search/search-service";
import type { WebSearchResult } from "@/lib/core/types";

describe("SearchService", () => {
  it("returns results from mock provider", async () => {
    const mockResults: WebSearchResult[] = [
      { title: "Result 1", url: "https://example.com/1", snippet: "First result" },
      { title: "Result 2", url: "https://example.com/2", snippet: "Second result" },
    ];
    const mockProvider = vi.fn().mockResolvedValue(mockResults);
    const service = new SearchService({ duckduckgo: mockProvider });
    const results = await service.search({ query: "test query", provider: "duckduckgo" });
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe("Result 1");
    expect(mockProvider).toHaveBeenCalledWith("test query", 5);
  });

  it("falls back to first available provider when none specified", async () => {
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/core/search/search-service.test.ts
```

- [ ] **Step 3: Implement search service and providers**

Create `lib/core/search/search-service.ts`:

```typescript
import type { WebSearchResult, SearchOptions } from "@/lib/core/types";

export type SearchProvider = (query: string, maxResults: number) => Promise<WebSearchResult[]>;

export class SearchService {
  private readonly providers: Record<string, SearchProvider>;

  constructor(providers: Record<string, SearchProvider>) {
    this.providers = providers;
  }

  async search(options: SearchOptions): Promise<readonly WebSearchResult[]> {
    const { query, maxResults = 5, provider } = options;
    const providerName = provider ?? Object.keys(this.providers)[0];
    if (!providerName) throw new Error("No search provider available");
    const searchFn = this.providers[providerName];
    if (!searchFn) throw new Error(`Search provider "${providerName}" not found`);
    return searchFn(query, maxResults);
  }

  listProviders(): readonly string[] {
    return Object.keys(this.providers);
  }
}
```

Create `lib/core/search/providers.ts`:

```typescript
import type { WebSearchResult } from "@/lib/core/types";

export async function searchTavily(
  query: string, maxResults: number, apiKey: string
): Promise<WebSearchResult[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, query, max_results: maxResults, include_answer: false }),
  });
  if (!response.ok) throw new Error(`Tavily search failed: ${response.statusText}`);
  const data = await response.json() as { results: { title: string; url: string; content: string }[] };
  return data.results.map((r) => ({ title: r.title, url: r.url, snippet: r.content }));
}

export async function searchDuckDuckGo(
  query: string, maxResults: number
): Promise<WebSearchResult[]> {
  const encoded = encodeURIComponent(query);
  const response = await fetch(`https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`);
  if (!response.ok) throw new Error(`DuckDuckGo search failed: ${response.statusText}`);
  const data = await response.json() as {
    AbstractText?: string; AbstractURL?: string;
    RelatedTopics?: { Text?: string; FirstURL?: string }[];
  };
  const results: WebSearchResult[] = [];
  if (data.AbstractText && data.AbstractURL) {
    results.push({ title: query, url: data.AbstractURL, snippet: data.AbstractText });
  }
  if (data.RelatedTopics) {
    for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
      if (topic.Text && topic.FirstURL) {
        results.push({ title: topic.Text.slice(0, 100), url: topic.FirstURL, snippet: topic.Text });
      }
    }
  }
  return results.slice(0, maxResults);
}
```

- [ ] **Step 4: Create search API route**

Create `app/api/search/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { z } from "zod";
import { SearchService } from "@/lib/core/search/search-service";
import { searchTavily, searchDuckDuckGo } from "@/lib/core/search/providers";

const SearchSchema = z.object({
  query: z.string().min(1),
  maxResults: z.number().optional(),
  provider: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const providers: Record<string, (q: string, n: number) => Promise<unknown[]>> = {};
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) providers.tavily = (q, n) => searchTavily(q, n, tavilyKey);
  providers.duckduckgo = searchDuckDuckGo;

  const service = new SearchService(providers);
  try {
    const results = await service.search(parsed.data);
    return Response.json({ success: true, data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Search failed";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
```

- [ ] **Step 5: Run tests**

```bash
pnpm test -- tests/lib/core/search/search-service.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/core/search/ app/api/search/ tests/lib/core/search/
git commit -m "feat: add web search with Tavily and DuckDuckGo providers"
```

---

## Task 4: Notebook Storage + Service

**Files:**
- Modify: `lib/core/storage/db.ts`, `lib/core/storage/repository.ts`
- Create: `lib/core/storage/notebook-repo.ts`, `lib/notebook/notebook-service.ts`
- Test: `tests/lib/core/storage/notebook-repo.test.ts`, `tests/lib/notebook/notebook-service.test.ts`

- [ ] **Step 1: Update Dexie schema — add notebook tables to db.ts**

Add `notebooks` and `notebookRecords` table declarations to the TutorDatabase class, and add them to a new version(2) stores block:

```typescript
notebooks!: Table<Notebook, string>
notebookRecords!: Table<NotebookRecord, string>
```

Version 2 stores (keep all existing stores and add):
```typescript
notebooks: "id, name, createdAt",
notebookRecords: "id, notebookId, source, createdAt",
```

- [ ] **Step 2: Add NotebookRepository interface to repository.ts**

```typescript
export interface NotebookRepository {
  listNotebooks(): Promise<Notebook[]>;
  getNotebook(id: string): Promise<Notebook | null>;
  createNotebook(data: Omit<Notebook, "id"> & { id?: string }): Promise<Notebook>;
  updateNotebook(id: string, data: Partial<Omit<Notebook, "id">>): Promise<Notebook>;
  deleteNotebook(id: string): Promise<void>;
  addRecord(data: Omit<NotebookRecord, "id"> & { id?: string }): Promise<NotebookRecord>;
  getRecords(notebookId: string): Promise<NotebookRecord[]>;
  deleteRecord(id: string): Promise<void>;
}
```

- [ ] **Step 3: Write notebook repo tests**

Create `tests/lib/core/storage/notebook-repo.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { DexieNotebookRepository } from "@/lib/core/storage/notebook-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

describe("DexieNotebookRepository", () => {
  let repo: DexieNotebookRepository;
  let counter = 0;

  beforeEach(async () => {
    const db = new TutorDatabase(`test-notebook-${counter++}`);
    repo = new DexieNotebookRepository(db);
  });

  it("creates and retrieves a notebook", async () => {
    const nb = await repo.createNotebook({
      name: "Math Notes", description: "Calculus notes", color: "#3b82f6",
      recordCount: 0, createdAt: Date.now(), updatedAt: Date.now(),
    });
    const result = await repo.getNotebook(nb.id);
    expect(result?.name).toBe("Math Notes");
  });

  it("adds and retrieves records", async () => {
    const nb = await repo.createNotebook({
      name: "Notes", description: "", color: "#000",
      recordCount: 0, createdAt: Date.now(), updatedAt: Date.now(),
    });
    await repo.addRecord({
      notebookId: nb.id, title: "Insight 1", content: "Important fact",
      source: "chat", tags: ["math"], createdAt: Date.now(),
    });
    const records = await repo.getRecords(nb.id);
    expect(records).toHaveLength(1);
    expect(records[0].title).toBe("Insight 1");
  });

  it("deletes notebook and cascades records", async () => {
    const nb = await repo.createNotebook({
      name: "Temp", description: "", color: "#000",
      recordCount: 0, createdAt: Date.now(), updatedAt: Date.now(),
    });
    await repo.addRecord({
      notebookId: nb.id, title: "R1", content: "c",
      source: "manual", tags: [], createdAt: Date.now(),
    });
    await repo.deleteNotebook(nb.id);
    expect(await repo.getNotebook(nb.id)).toBeNull();
    expect(await repo.getRecords(nb.id)).toHaveLength(0);
  });
});
```

- [ ] **Step 4: Implement notebook repository**

Create `lib/core/storage/notebook-repo.ts`:

```typescript
import type { TutorDatabase } from "./db";
import type { Notebook, NotebookRecord } from "@/lib/core/types";
import type { NotebookRepository } from "./repository";
import { nanoid } from "nanoid";

export class DexieNotebookRepository implements NotebookRepository {
  constructor(private readonly db: TutorDatabase) {}

  async listNotebooks(): Promise<Notebook[]> {
    return this.db.notebooks.orderBy("createdAt").reverse().toArray();
  }

  async getNotebook(id: string): Promise<Notebook | null> {
    return (await this.db.notebooks.get(id)) ?? null;
  }

  async createNotebook(data: Omit<Notebook, "id"> & { id?: string }): Promise<Notebook> {
    const notebook: Notebook = { ...data, id: data.id ?? `nb_${nanoid(12)}` };
    await this.db.notebooks.add(notebook);
    return notebook;
  }

  async updateNotebook(id: string, data: Partial<Omit<Notebook, "id">>): Promise<Notebook> {
    await this.db.notebooks.update(id, data);
    const updated = await this.db.notebooks.get(id);
    if (!updated) throw new Error(`Notebook ${id} not found`);
    return updated;
  }

  async deleteNotebook(id: string): Promise<void> {
    await this.db.transaction("rw", [this.db.notebooks, this.db.notebookRecords], async () => {
      await this.db.notebookRecords.where("notebookId").equals(id).delete();
      await this.db.notebooks.delete(id);
    });
  }

  async addRecord(data: Omit<NotebookRecord, "id"> & { id?: string }): Promise<NotebookRecord> {
    const record: NotebookRecord = { ...data, id: data.id ?? `rec_${nanoid(12)}` };
    await this.db.notebookRecords.add(record);
    return record;
  }

  async getRecords(notebookId: string): Promise<NotebookRecord[]> {
    return this.db.notebookRecords.where("notebookId").equals(notebookId).toArray();
  }

  async deleteRecord(id: string): Promise<void> {
    await this.db.notebookRecords.delete(id);
  }
}
```

- [ ] **Step 5: Write notebook service tests**

Create `tests/lib/notebook/notebook-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { NotebookService } from "@/lib/notebook/notebook-service";
import { DexieNotebookRepository } from "@/lib/core/storage/notebook-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

describe("NotebookService", () => {
  let service: NotebookService;
  let counter = 0;

  beforeEach(() => {
    const db = new TutorDatabase(`test-nb-svc-${counter++}`);
    service = new NotebookService(new DexieNotebookRepository(db));
  });

  it("creates a notebook with generated id", async () => {
    const nb = await service.createNotebook({ name: "Math", color: "#3b82f6" });
    expect(nb.id).toMatch(/^nb_/);
    expect(nb.name).toBe("Math");
    expect(nb.recordCount).toBe(0);
  });

  it("saves a record to a notebook", async () => {
    const nb = await service.createNotebook({ name: "Notes", color: "#000" });
    const record = await service.saveRecord(nb.id, {
      title: "Key Insight", content: "Fourier transforms decompose signals",
      source: "chat", tags: ["signals"],
    });
    expect(record.id).toMatch(/^rec_/);
    expect(record.source).toBe("chat");
  });

  it("lists notebooks", async () => {
    await service.createNotebook({ name: "NB1", color: "#000" });
    await service.createNotebook({ name: "NB2", color: "#111" });
    const list = await service.listNotebooks();
    expect(list).toHaveLength(2);
  });
});
```

- [ ] **Step 6: Implement notebook service**

Create `lib/notebook/notebook-service.ts`:

```typescript
import type { Notebook, NotebookRecord } from "@/lib/core/types";
import type { NotebookRepository } from "@/lib/core/storage/repository";

interface CreateNotebookInput {
  readonly name: string;
  readonly color: string;
  readonly description?: string;
}

interface SaveRecordInput {
  readonly title: string;
  readonly content: string;
  readonly source: NotebookRecord["source"];
  readonly sourceId?: string;
  readonly tags?: readonly string[];
}

export class NotebookService {
  constructor(private readonly repo: NotebookRepository) {}

  async createNotebook(input: CreateNotebookInput): Promise<Notebook> {
    return this.repo.createNotebook({
      name: input.name, description: input.description ?? "",
      color: input.color, recordCount: 0,
      createdAt: Date.now(), updatedAt: Date.now(),
    });
  }

  async listNotebooks(): Promise<readonly Notebook[]> {
    return this.repo.listNotebooks();
  }

  async getNotebook(id: string): Promise<Notebook | null> {
    return this.repo.getNotebook(id);
  }

  async deleteNotebook(id: string): Promise<void> {
    return this.repo.deleteNotebook(id);
  }

  async saveRecord(notebookId: string, input: SaveRecordInput): Promise<NotebookRecord> {
    const record = await this.repo.addRecord({
      notebookId, title: input.title, content: input.content,
      source: input.source, sourceId: input.sourceId,
      tags: input.tags ? [...input.tags] : [], createdAt: Date.now(),
    });
    const notebook = await this.repo.getNotebook(notebookId);
    if (notebook) {
      await this.repo.updateNotebook(notebookId, {
        recordCount: notebook.recordCount + 1, updatedAt: Date.now(),
      });
    }
    return record;
  }

  async getRecords(notebookId: string): Promise<readonly NotebookRecord[]> {
    return this.repo.getRecords(notebookId);
  }

  async deleteRecord(notebookId: string, recordId: string): Promise<void> {
    await this.repo.deleteRecord(recordId);
    const notebook = await this.repo.getNotebook(notebookId);
    if (notebook) {
      await this.repo.updateNotebook(notebookId, {
        recordCount: Math.max(0, notebook.recordCount - 1), updatedAt: Date.now(),
      });
    }
  }
}
```

- [ ] **Step 7: Run all tests**

```bash
pnpm test
```

Expected: All existing + new tests pass.

- [ ] **Step 8: Commit**

```bash
git add lib/core/storage/ lib/notebook/ tests/
git commit -m "feat: add notebook storage and service with record management"
```

---

## Task 5: Quiz Service

**Files:**
- Modify: `lib/core/storage/db.ts`, `lib/core/storage/repository.ts`
- Create: `lib/core/storage/quiz-repo.ts`, `lib/quiz/quiz-service.ts`, `lib/quiz/prompts.ts`
- Test: `tests/lib/quiz/quiz-service.test.ts`

- [ ] **Step 1: Update DB and repository for quizzes**

Add quiz tables to db.ts and QuizRepository interface to repository.ts. Follow same pattern as notebook (version 2 upgrade, new table declarations, new interface).

Quiz tables: `quizzes: "id, knowledgeBaseId, createdAt"`, `quizAttempts: "id, quizId, completedAt"`

QuizRepository methods: createQuiz, getQuiz, listQuizzes(kbId), deleteQuiz, saveAttempt, getAttempts(quizId)

- [ ] **Step 2: Implement quiz repository**

Create `lib/core/storage/quiz-repo.ts` with DexieQuizRepository. deleteQuiz cascades to quizAttempts in a transaction.

- [ ] **Step 3: Create quiz prompts**

Create `lib/quiz/prompts.ts` with:
- `buildQuizGenerationPrompt(context, numQuestions, questionTypes)` — instructs LLM to generate JSON array of questions
- `buildGradingPrompt(question, correctAnswer, userAnswer)` — instructs LLM to grade and return JSON `{isCorrect, feedback}`

- [ ] **Step 4: Write quiz service test**

Create `tests/lib/quiz/quiz-service.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { QuizService } from "@/lib/quiz/quiz-service";
import { buildQuizGenerationPrompt, buildGradingPrompt } from "@/lib/quiz/prompts";

describe("Quiz Prompts", () => {
  it("builds generation prompt with context and config", () => {
    const prompt = buildQuizGenerationPrompt("Mitochondria is the powerhouse.", 3, ["single_choice"]);
    expect(prompt).toContain("3 quiz questions");
    expect(prompt).toContain("Mitochondria");
    expect(prompt).toContain("single_choice");
  });

  it("builds grading prompt with question and answers", () => {
    const prompt = buildGradingPrompt("What is 2+2?", "4", "5");
    expect(prompt).toContain("Correct Answer: 4");
    expect(prompt).toContain("Student Answer: 5");
  });
});

describe("QuizService", () => {
  it("saves a quiz via repository", async () => {
    const mockRepo = {
      createQuiz: vi.fn().mockImplementation(async (data) => ({ ...data, id: "quiz_test" })),
      getQuiz: vi.fn(), listQuizzes: vi.fn(), deleteQuiz: vi.fn(),
      saveAttempt: vi.fn(), getAttempts: vi.fn(),
    };
    const service = new QuizService(mockRepo);
    const quiz = await service.saveQuiz({
      knowledgeBaseId: "kb_1", title: "Biology Quiz",
      questions: [{ id: "q1", type: "single_choice", question: "What is DNA?",
        options: ["A","B","C","D"], correctAnswer: "A", explanation: "..." }],
    });
    expect(mockRepo.createQuiz).toHaveBeenCalledOnce();
    expect(quiz.title).toBe("Biology Quiz");
  });
});
```

- [ ] **Step 5: Implement quiz service**

Create `lib/quiz/quiz-service.ts` with QuizService class (takes QuizRepository). Methods: saveQuiz, getQuiz, listQuizzes, saveAttempt (calculates score from answers), getAttempts.

- [ ] **Step 6: Run tests, commit**

```bash
pnpm test -- tests/lib/quiz/
git add lib/core/storage/ lib/quiz/ tests/lib/quiz/
git commit -m "feat: add quiz storage, service, and generation prompts"
```

---

## Task 6: Guided Learning Service

**Files:**
- Modify: `lib/core/storage/db.ts`, `lib/core/storage/repository.ts`
- Create: `lib/core/storage/guide-repo.ts`, `lib/guide/guide-service.ts`, `lib/guide/prompts.ts`
- Test: `tests/lib/guide/guide-service.test.ts`

- [ ] **Step 1: Update DB and repository for guides**

Add guides table and GuideRepository interface. Table: `guides: "id, knowledgeBaseId, status, createdAt"`. Methods: createGuide, getGuide, updateGuide, listGuides(kbId), deleteGuide.

- [ ] **Step 2: Implement guide repository**

Create `lib/core/storage/guide-repo.ts` with DexieGuideRepository.

- [ ] **Step 3: Create guide prompts**

Create `lib/guide/prompts.ts` with:
- `buildPlanGenerationPrompt(topic, context)` — generate 3-5 progressive knowledge point steps as JSON
- `buildPageGenerationPrompt(stepTitle, stepDescription, context)` — generate rich HTML content page

- [ ] **Step 4: Write guide service tests**

Create `tests/lib/guide/guide-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { GuideService } from "@/lib/guide/guide-service";
import { DexieGuideRepository } from "@/lib/core/storage/guide-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

describe("GuideService", () => {
  let service: GuideService;
  let counter = 0;

  beforeEach(() => {
    const db = new TutorDatabase(`test-guide-${counter++}`);
    service = new GuideService(new DexieGuideRepository(db));
  });

  it("creates a guide plan", async () => {
    const guide = await service.createGuide({
      knowledgeBaseId: "kb_1", topic: "Linear Algebra",
      steps: [
        { title: "Vectors", description: "Intro", isCompleted: false },
        { title: "Matrices", description: "Ops", isCompleted: false },
      ],
    });
    expect(guide.id).toMatch(/^guide_/);
    expect(guide.steps).toHaveLength(2);
    expect(guide.status).toBe("in_progress");
  });

  it("advances to next step", async () => {
    const guide = await service.createGuide({
      knowledgeBaseId: "kb_1", topic: "Test",
      steps: [
        { title: "S1", description: "D1", isCompleted: false },
        { title: "S2", description: "D2", isCompleted: false },
      ],
    });
    const updated = await service.completeStep(guide.id, 0);
    expect(updated.currentStepIndex).toBe(1);
    expect(updated.steps[0].isCompleted).toBe(true);
  });

  it("marks guide completed when all steps done", async () => {
    const guide = await service.createGuide({
      knowledgeBaseId: "kb_1", topic: "Test",
      steps: [{ title: "S1", description: "D1", isCompleted: false }],
    });
    const updated = await service.completeStep(guide.id, 0);
    expect(updated.status).toBe("completed");
  });
});
```

- [ ] **Step 5: Implement guide service**

Create `lib/guide/guide-service.ts` with GuideService class. Methods: createGuide, getGuide, listGuides, completeStep (marks step completed, advances index, sets status "completed" when all done), setStepContent.

- [ ] **Step 6: Run tests, commit**

```bash
pnpm test -- tests/lib/guide/
git add lib/core/storage/ lib/guide/ tests/lib/guide/
git commit -m "feat: add guided learning storage, service, and prompts"
```

---

## Task 7: Deep Solve + Deep Research + Vision Solver Modes

**Files:**
- Create: `lib/chat/modes/deep-solve.ts`, `lib/chat/modes/deep-research.ts`, `lib/chat/modes/vision-solver.ts`
- Test: `tests/lib/chat/modes/deep-solve.test.ts`

- [ ] **Step 1: Write deep solve tests**

Create `tests/lib/chat/modes/deep-solve.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildDeepSolveStages, buildStagePrompt } from "@/lib/chat/modes/deep-solve";

describe("Deep Solve", () => {
  it("defines four stages: plan, investigate, solve, verify", () => {
    const stages = buildDeepSolveStages();
    expect(stages).toHaveLength(4);
    expect(stages.map((s) => s.name)).toEqual(["plan", "investigate", "solve", "verify"]);
  });

  it("builds plan stage prompt with problem", () => {
    const prompt = buildStagePrompt("plan", "Prove √2 is irrational", []);
    expect(prompt).toContain("√2 is irrational");
    expect(prompt).toContain("plan");
  });

  it("builds investigate prompt with prior context", () => {
    const prompt = buildStagePrompt("investigate", "Prove √2", [
      { stage: "plan", content: "Use proof by contradiction." },
    ]);
    expect(prompt).toContain("proof by contradiction");
  });

  it("builds verify prompt including solution", () => {
    const prompt = buildStagePrompt("verify", "Prove √2", [
      { stage: "plan", content: "Plan..." },
      { stage: "investigate", content: "Research..." },
      { stage: "solve", content: "The proof is..." },
    ]);
    expect(prompt).toContain("verify");
    expect(prompt).toContain("The proof is...");
  });
});
```

- [ ] **Step 2: Implement deep solve**

Create `lib/chat/modes/deep-solve.ts` exporting buildDeepSolveStages() and buildStagePrompt(stage, problem, priorResults). Four stages with specific instructions per stage.

- [ ] **Step 3: Implement deep research**

Create `lib/chat/modes/deep-research.ts` exporting buildDecompositionPrompt(topic), buildResearchPrompt(subtopic, ragResults, webResults), buildSynthesisPrompt(topic, sections).

- [ ] **Step 4: Implement vision solver**

Create `lib/chat/modes/vision-solver.ts` exporting buildVisionSolverPrompt(userMessage, hasImage).

- [ ] **Step 5: Run tests, commit**

```bash
pnpm test -- tests/lib/chat/modes/
git add lib/chat/modes/ tests/lib/chat/modes/
git commit -m "feat: add Deep Solve, Deep Research, and Vision Solver chat modes"
```

---

## Task 8: API Routes for Phase 2

**Files:**
- Create: `app/api/notebook/route.ts`, `app/api/notebook/[id]/route.ts`, `app/api/notebook/[id]/records/route.ts`, `app/api/quiz/generate/route.ts`, `app/api/quiz/grade/route.ts`, `app/api/guide/plan/route.ts`, `app/api/guide/page/route.ts`, `app/api/solve/route.ts`, `app/api/research/route.ts`
- Modify: `lib/store/chat-store.ts`

- [ ] **Step 1: Add mode to chat store**

Add `mode: ChatMode` (default "chat") and `setMode` action to `lib/store/chat-store.ts`.

- [ ] **Step 2: Create notebook API routes**

`app/api/notebook/route.ts` (GET list, POST create), `app/api/notebook/[id]/route.ts` (GET, DELETE), `app/api/notebook/[id]/records/route.ts` (GET records, POST add record). Same patterns as knowledge routes.

- [ ] **Step 3: Create quiz API routes**

`app/api/quiz/generate/route.ts` (POST — knowledgeBaseId, numQuestions, questionTypes → retrieve chunks, build prompt, call LLM, parse JSON, save quiz).

`app/api/quiz/grade/route.ts` (POST — quizId, answers → grade each, save attempt).

- [ ] **Step 4: Create guide API routes**

`app/api/guide/plan/route.ts` (POST — knowledgeBaseId, topic → retrieve chunks, build plan prompt, call LLM, parse steps, save guide).

`app/api/guide/page/route.ts` (POST — guideId, stepIndex → retrieve chunks, build page prompt, call LLM, save HTML).

- [ ] **Step 5: Create solve and research routes**

`app/api/solve/route.ts` (POST — messages, stage → build stage prompt, stream response via SSE).

`app/api/research/route.ts` (POST — topic, knowledgeBaseIds → decompose, research subtopics, synthesize, stream report).

- [ ] **Step 6: Commit**

```bash
git add app/api/ lib/store/chat-store.ts
git commit -m "feat: add API routes for notebooks, quizzes, guides, solve, and research"
```

---

## Task 9: Zustand Stores + UI Components + Pages

**Files:**
- Create: `lib/store/notebook-store.ts`, `lib/store/quiz-store.ts`, `lib/store/guide-store.ts`
- Create: All UI components (mode-switcher, notebook, quiz, guide, visualize)
- Create: `app/(workspace)/guide/page.tsx`, `app/(utility)/notebook/page.tsx`
- Modify: `app/(workspace)/chat/page.tsx`, `components/sidebar/sidebar-nav.tsx`

- [ ] **Step 1: Create 3 Zustand stores** (notebook, quiz, guide — same patterns as Phase 1 stores)

- [ ] **Step 2: Install visualization deps**

```bash
pnpm add echarts
```

- [ ] **Step 3: Create mode switcher** (`components/chat/mode-switcher.tsx`) — Tab bar with Chat, Deep Solve, Deep Research, Vision tabs

- [ ] **Step 4: Create notebook UI** — list, records viewer, save-to-notebook dialog

- [ ] **Step 5: Create quiz UI** — generator config, quiz viewer, question card

- [ ] **Step 6: Create guided learning UI** — planner, page viewer, step nav

- [ ] **Step 7: Create chart renderer** (`components/visualize/chart-renderer.tsx`) — ECharts wrapper

- [ ] **Step 8: Create pages** — guide page, notebook page

- [ ] **Step 9: Update sidebar** — add Guide, Notebook links

- [ ] **Step 10: Update chat page** — add ModeSwitcher above ChatArea

- [ ] **Step 11: Commit**

```bash
git add app/ components/ lib/store/
git commit -m "feat: add UI for mode switcher, notebooks, quizzes, guided learning, and visualize"
```

---

## Task 10: E2E Tests + Final Verification

**Files:**
- Create: `e2e/notebook.test.ts`, `e2e/quiz.test.ts`, `e2e/guide.test.ts`, `e2e/modes.test.ts`

- [ ] **Step 1: Create notebook E2E tests**

```typescript
import { test, expect } from "@playwright/test";

test("can navigate to notebook page", async ({ page }) => {
  await page.goto("/notebook");
  await expect(page.getByText(/notebook/i)).toBeVisible();
});
```

- [ ] **Step 2: Create quiz, guide, and modes E2E tests** (similar navigation + visibility checks)

- [ ] **Step 3: Run all tests**

```bash
pnpm test && pnpm test:e2e
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

- [ ] **Step 5: Manual browser verification**

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: Phase 2 complete — study depth with notebooks, quizzes, guides, solve, and research"
```

---

## Summary

Phase 2 delivers 10 tasks producing:

| Component | Tests | Description |
|-----------|-------|-------------|
| Extended types | — | Notebook, Quiz, Guide, Plugin, Search, ChatMode |
| Plugin system | 4 | Tool/capability registry |
| Web search | 4 | Tavily + DuckDuckGo with SearchService |
| Notebook storage + service | 6 | CRUD + records with cascade delete |
| Quiz service + prompts | 3 | Generation, grading, attempt tracking |
| Guided learning | 3 | Plan generation, step progression |
| Deep Solve / Research / Vision | 4 | Multi-stage solve, parallel research, vision prompts |
| API routes | — | 11 new endpoints |
| Stores + UI | — | 3 stores, mode switcher, notebooks, quizzes, guides, visualize |
| E2E tests | ~4 | Navigation + feature verification |

**Total: ~24 new unit tests + ~4 E2E tests, 11 new API endpoints, 2 new pages.**

**Next:** Phase 3 plan (Classroom Engine).
