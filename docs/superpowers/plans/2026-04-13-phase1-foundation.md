# Phase 1: Foundation + Knowledge + Chat — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working RAG-powered AI tutor — upload documents, build knowledge bases, chat with AI that references your materials, with persistent memory and sessions.

**Architecture:** Next.js 16 modular monolith. Shared core (knowledge, memory, session, LLM, storage) in `lib/core/`. Chat module in `lib/chat/`. Storage via repository pattern over Dexie/IndexedDB. State management with Zustand 5.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Vercel AI SDK 6, Zustand 5, Immer 11, Dexie 4, Zod 4, KaTeX, Shiki 3, Vitest, nanoid

**Spec:** `docs/superpowers/specs/2026-04-13-btr-gpt-tutor-design.md` — Phase 1 scope (section 8).

**Scope note:** This is Phase 1 of 6. Phases 2–6 get their own plans after Phase 1 ships. This phase delivers: project scaffold, storage layer, LLM abstraction, document parsing, knowledge layer (chunk/embed/retrieve), knowledge base management, session management, memory layer, chat with RAG, and essential UI (chat, KB management, settings, sidebar, dark mode, i18n skeleton).

---

## File Structure

```
btr-gpt-tutor/
├── app/
│   ├── layout.tsx                         # Root layout: providers, themes, i18n
│   ├── globals.css                        # Tailwind 4 + global styles
│   ├── (workspace)/
│   │   ├── layout.tsx                     # Workspace layout with sidebar
│   │   ├── page.tsx                       # Home: KB overview + quick actions
│   │   └── chat/
│   │       └── page.tsx                   # Chat page
│   ├── (utility)/
│   │   ├── layout.tsx                     # Utility layout
│   │   ├── knowledge/
│   │   │   └── page.tsx                   # KB management page
│   │   └── settings/
│   │       └── page.tsx                   # Settings page
│   └── api/
│       ├── chat/
│       │   └── route.ts                   # Chat streaming endpoint (POST)
│       ├── knowledge/
│       │   ├── route.ts                   # KB list (GET) + create (POST)
│       │   ├── [id]/
│       │   │   ├── route.ts              # KB get (GET) + delete (DELETE)
│       │   │   └── documents/
│       │   │       └── route.ts          # Upload docs to KB (POST)
│       │   ├── search/
│       │   │   └── route.ts              # Vector search (POST)
│       │   └── embed/
│       │       └── route.ts              # Trigger embedding job (POST)
│       ├── memory/
│       │   └── route.ts                   # Memory get (GET) + update (PUT)
│       ├── session/
│       │   ├── route.ts                   # Session list (GET) + create (POST)
│       │   └── [id]/
│       │       └── route.ts              # Session get (GET) + update (PUT) + delete (DELETE)
│       └── parse/
│           └── route.ts                   # Document parsing endpoint (POST)
│
├── lib/
│   ├── core/
│   │   ├── types/
│   │   │   └── index.ts                   # All shared types (KB, Session, Memory, Message, etc.)
│   │   ├── storage/
│   │   │   ├── repository.ts              # Repository interfaces
│   │   │   ├── db.ts                      # Dexie database schema
│   │   │   ├── knowledge-repo.ts          # KB repository (Dexie impl)
│   │   │   ├── session-repo.ts            # Session repository (Dexie impl)
│   │   │   └── memory-repo.ts             # Memory repository (Dexie impl)
│   │   ├── ai/
│   │   │   ├── providers.ts               # Provider registry + config
│   │   │   ├── llm.ts                     # LLM abstraction (text generation)
│   │   │   └── embeddings.ts              # Embedding abstraction
│   │   ├── knowledge/
│   │   │   ├── parser.ts                  # Document parsing (PDF, MD, TXT)
│   │   │   ├── chunker.ts                 # Semantic chunking with overlap
│   │   │   ├── embedder.ts                # Chunk → vector embedding pipeline
│   │   │   ├── retriever.ts               # Cosine similarity vector search
│   │   │   └── knowledge-service.ts       # KB lifecycle management
│   │   ├── memory/
│   │   │   └── memory-service.ts          # Profile + progress management
│   │   └── session/
│   │       └── session-service.ts         # Session lifecycle + context
│   ├── chat/
│   │   ├── chat-service.ts                # Chat logic with RAG + memory
│   │   └── prompts.ts                     # System prompts for chat mode
│   ├── store/
│   │   ├── chat-store.ts                  # Chat UI state
│   │   ├── knowledge-store.ts             # KB UI state
│   │   ├── session-store.ts               # Session UI state
│   │   ├── memory-store.ts                # Memory UI state
│   │   └── settings-store.ts              # Settings UI state
│   ├── hooks/
│   │   ├── use-chat.ts                    # Chat hook (wraps AI SDK useChat)
│   │   └── use-theme.ts                   # Theme toggle hook
│   ├── i18n/
│   │   ├── config.ts                      # i18next setup
│   │   └── locales/
│   │       ├── en.json                    # English strings
│   │       └── zh.json                    # Chinese strings
│   └── utils/
│       ├── cosine-similarity.ts           # Vector math
│       └── id.ts                          # nanoid wrapper
│
├── components/
│   ├── ui/                                # shadcn/ui primitives (button, input, card, dialog, etc.)
│   ├── chat/
│   │   ├── chat-area.tsx                  # Main chat interface container
│   │   ├── message-list.tsx               # Scrollable message display
│   │   ├── message-bubble.tsx             # Single message with markdown
│   │   ├── chat-input.tsx                 # Message input with KB selector
│   │   └── citation-badge.tsx             # Inline citation reference
│   ├── knowledge/
│   │   ├── kb-list.tsx                    # Knowledge base cards
│   │   ├── kb-create-dialog.tsx           # Create KB dialog
│   │   ├── kb-upload.tsx                  # Document upload dropzone
│   │   └── kb-search.tsx                  # Search within a KB
│   ├── settings/
│   │   └── provider-config.tsx            # LLM + embedding provider form
│   ├── sidebar/
│   │   └── sidebar-nav.tsx                # Navigation sidebar
│   ├── common/
│   │   └── markdown-renderer.tsx          # Rich markdown (KaTeX + Shiki)
│   └── providers/
│       └── app-providers.tsx              # Zustand + theme + i18n providers
│
├── configs/
│   └── providers.ts                       # Default provider configurations
│
├── tests/
│   ├── lib/
│   │   ├── core/
│   │   │   ├── storage/
│   │   │   │   ├── knowledge-repo.test.ts
│   │   │   │   ├── session-repo.test.ts
│   │   │   │   └── memory-repo.test.ts
│   │   │   ├── knowledge/
│   │   │   │   ├── parser.test.ts
│   │   │   │   ├── chunker.test.ts
│   │   │   │   ├── retriever.test.ts
│   │   │   │   └── knowledge-service.test.ts
│   │   │   ├── memory/
│   │   │   │   └── memory-service.test.ts
│   │   │   └── session/
│   │   │       └── session-service.test.ts
│   │   └── chat/
│   │       └── chat-service.test.ts
│   └── utils/
│       └── cosine-similarity.test.ts
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .env.example
├── .env.local                             # (gitignored) user's actual keys
├── .gitignore
└── vitest.config.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/globals.css`, `app/(workspace)/layout.tsx`, `app/(workspace)/page.tsx`, `.env.example`, `.gitignore`, `vitest.config.ts`

- [ ] **Step 1: Initialize Next.js project with pnpm**

```bash
cd /Users/torres/Developer/coding-projects/btr-gpt-tutor
pnpm init
```

Update `package.json`:

```json
{
  "name": "btr-gpt-tutor",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Install core dependencies**

```bash
pnpm add next@latest react@latest react-dom@latest typescript@latest @types/node @types/react @types/react-dom
pnpm add tailwindcss@latest @tailwindcss/postcss postcss
pnpm add zustand immer
pnpm add dexie
pnpm add nanoid
pnpm add zod
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
pnpm add next-themes sonner
pnpm add lucide-react clsx tailwind-merge class-variance-authority
pnpm add i18next react-i18next i18next-resources-to-backend
pnpm add katex shiki streamdown
pnpm add unpdf
pnpm add -D vitest @vitejs/plugin-react eslint prettier
```

- [ ] **Step 3: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create Next.js + PostCSS config**

Create `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
```

Create `postcss.config.mjs`:

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 5: Create global CSS with Tailwind 4**

Create `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-destructive: var(--destructive);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}

:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --border: #e2e8f0;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --destructive: #ef4444;
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --border: #1e293b;
  --card: #0f172a;
  --card-foreground: #fafafa;
  --destructive: #dc2626;
  --accent: #1e293b;
  --accent-foreground: #f8fafc;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 6: Create root layout**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "btr-gpt-tutor",
  description: "AI-powered learning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Create workspace layout and home page placeholders**

Create `app/(workspace)/layout.tsx`:

```tsx
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r border-border bg-muted/30 p-4">
        <h1 className="text-lg font-bold">btr-gpt-tutor</h1>
        <nav className="mt-6 space-y-1">
          <a href="/" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Home</a>
          <a href="/chat" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Chat</a>
          <a href="/knowledge" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Knowledge</a>
          <a href="/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

Create `app/(workspace)/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">Welcome to btr-gpt-tutor</h2>
      <p className="mt-2 text-muted-foreground">
        Upload documents, build knowledge bases, and learn with AI.
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Create environment and config files**

Create `.env.example`:

```env
# LLM Provider (configure at least one)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=

# Embedding (defaults to LLM provider if not set)
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
```

Create `.gitignore`:

```
node_modules/
.next/
.env.local
*.tsbuildinfo
```

- [ ] **Step 9: Create Vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 10: Verify scaffold runs**

```bash
pnpm dev
```

Expected: Next.js dev server starts, home page renders at http://localhost:3000.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 project with Tailwind 4, shadcn/ui deps, and workspace layout"
```

---

## Task 2: Shared Types

**Files:**
- Create: `lib/core/types/index.ts`

- [ ] **Step 1: Define all shared types for Phase 1**

Create `lib/core/types/index.ts`:

```typescript
export interface KnowledgeBase {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly embeddingModel: string;
  readonly embeddingDimension: number;
  readonly documentCount: number;
  readonly chunkCount: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface Document {
  readonly id: string;
  readonly knowledgeBaseId: string;
  readonly name: string;
  readonly mimeType: string;
  readonly size: number;
  readonly chunkCount: number;
  readonly createdAt: number;
}

export interface Chunk {
  readonly id: string;
  readonly knowledgeBaseId: string;
  readonly documentId: string;
  readonly content: string;
  readonly metadata: ChunkMetadata;
  readonly embedding: readonly number[] | null;
}

export interface ChunkMetadata {
  readonly documentName: string;
  readonly pageNumber?: number;
  readonly headingHierarchy?: readonly string[];
  readonly chunkIndex: number;
}

export interface SearchResult {
  readonly chunk: Chunk;
  readonly score: number;
}

export interface Session {
  readonly id: string;
  readonly title: string;
  readonly knowledgeBaseIds: readonly string[];
  readonly messages: readonly Message[];
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface Message {
  readonly id: string;
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
  readonly citations?: readonly Citation[];
  readonly createdAt: number;
}

export interface Citation {
  readonly chunkId: string;
  readonly documentName: string;
  readonly content: string;
  readonly score: number;
}

export interface LearnerProfile {
  readonly knowledgeLevels: Readonly<Record<string, "beginner" | "intermediate" | "advanced">>;
  readonly learningStyle: "visual" | "verbal" | "hands-on" | "mixed";
  readonly pacePreference: "fast" | "moderate" | "thorough";
  readonly goals: readonly string[];
  readonly language: string;
}

export interface LearningProgress {
  readonly topicsExplored: readonly TopicProgress[];
  readonly totalSessions: number;
  readonly totalMessages: number;
  readonly lastActiveAt: number;
}

export interface TopicProgress {
  readonly topic: string;
  readonly mastery: "exploring" | "familiar" | "proficient";
  readonly sessionsCount: number;
  readonly lastStudiedAt: number;
}

export interface Memory {
  readonly id: string;
  readonly profile: LearnerProfile;
  readonly progress: LearningProgress;
  readonly updatedAt: number;
}

export interface ProviderConfig {
  readonly provider: string;
  readonly model: string;
  readonly apiKey: string;
  readonly baseUrl?: string;
}

export interface AppSettings {
  readonly llm: ProviderConfig;
  readonly embedding: ProviderConfig;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/core/types/index.ts
git commit -m "feat: define shared types for KB, session, memory, and settings"
```

---

## Task 3: Utility Functions

**Files:**
- Create: `lib/utils/id.ts`, `lib/utils/cosine-similarity.ts`
- Test: `tests/utils/cosine-similarity.test.ts`

- [ ] **Step 1: Write cosine similarity test**

Create `tests/utils/cosine-similarity.test.ts`:

```typescript
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
    const expected = 0.6 * 0.8 + 0.8 * 0.6; // 0.96
    expect(cosineSimilarity(a, b)).toBeCloseTo(expected);
  });

  it("throws on mismatched dimensions", () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow("dimension");
  });

  it("returns 0 for zero vectors", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/utils/cosine-similarity.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement cosine similarity**

Create `lib/utils/cosine-similarity.ts`:

```typescript
export function cosineSimilarity(
  a: readonly number[],
  b: readonly number[]
): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vector dimension mismatch: ${a.length} vs ${b.length}`
    );
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}
```

- [ ] **Step 4: Create ID utility**

Create `lib/utils/id.ts`:

```typescript
import { nanoid } from "nanoid";

export function generateId(prefix?: string): string {
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}` : id;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm test -- tests/utils/cosine-similarity.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/utils/ tests/utils/
git commit -m "feat: add cosine similarity and ID generation utilities"
```

---

## Task 4: Storage Layer — Dexie Database + Repository Interfaces

**Files:**
- Create: `lib/core/storage/repository.ts`, `lib/core/storage/db.ts`, `lib/core/storage/knowledge-repo.ts`, `lib/core/storage/session-repo.ts`, `lib/core/storage/memory-repo.ts`
- Test: `tests/lib/core/storage/knowledge-repo.test.ts`, `tests/lib/core/storage/session-repo.test.ts`, `tests/lib/core/storage/memory-repo.test.ts`

- [ ] **Step 1: Define repository interfaces**

Create `lib/core/storage/repository.ts`:

```typescript
import type {
  KnowledgeBase,
  Document,
  Chunk,
  Session,
  Message,
  Memory,
  AppSettings,
} from "@/lib/core/types";

export interface KnowledgeRepository {
  listKnowledgeBases(): Promise<readonly KnowledgeBase[]>;
  getKnowledgeBase(id: string): Promise<KnowledgeBase | undefined>;
  createKnowledgeBase(kb: KnowledgeBase): Promise<void>;
  updateKnowledgeBase(id: string, updates: Partial<KnowledgeBase>): Promise<void>;
  deleteKnowledgeBase(id: string): Promise<void>;

  addDocument(doc: Document): Promise<void>;
  getDocuments(knowledgeBaseId: string): Promise<readonly Document[]>;
  deleteDocument(id: string): Promise<void>;

  addChunks(chunks: readonly Chunk[]): Promise<void>;
  getChunks(knowledgeBaseId: string): Promise<readonly Chunk[]>;
  getChunksByDocument(documentId: string): Promise<readonly Chunk[]>;
  updateChunkEmbedding(chunkId: string, embedding: readonly number[]): Promise<void>;
  deleteChunksByDocument(documentId: string): Promise<void>;
}

export interface SessionRepository {
  listSessions(): Promise<readonly Session[]>;
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: Session): Promise<void>;
  updateSession(id: string, updates: Partial<Session>): Promise<void>;
  deleteSession(id: string): Promise<void>;
  addMessage(sessionId: string, message: Message): Promise<void>;
}

export interface MemoryRepository {
  getMemory(): Promise<Memory | undefined>;
  saveMemory(memory: Memory): Promise<void>;
}

export interface SettingsRepository {
  getSettings(): Promise<AppSettings | undefined>;
  saveSettings(settings: AppSettings): Promise<void>;
}
```

- [ ] **Step 2: Create Dexie database schema**

Create `lib/core/storage/db.ts`:

```typescript
import Dexie, { type Table } from "dexie";
import type {
  KnowledgeBase,
  Document,
  Chunk,
  Session,
  Memory,
  AppSettings,
} from "@/lib/core/types";

export class TutorDatabase extends Dexie {
  knowledgeBases!: Table<KnowledgeBase, string>;
  documents!: Table<Document, string>;
  chunks!: Table<Chunk, string>;
  sessions!: Table<Session, string>;
  memory!: Table<Memory, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super("btr-gpt-tutor");

    this.version(1).stores({
      knowledgeBases: "id, name, createdAt",
      documents: "id, knowledgeBaseId, createdAt",
      chunks: "id, knowledgeBaseId, documentId",
      sessions: "id, updatedAt",
      memory: "id",
      settings: "++id",
    });
  }
}

export const db = new TutorDatabase();
```

- [ ] **Step 3: Write knowledge repository test**

Create `tests/lib/core/storage/knowledge-repo.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo";
import { TutorDatabase } from "@/lib/core/storage/db";
import type { KnowledgeBase, Document, Chunk } from "@/lib/core/types";

describe("DexieKnowledgeRepository", () => {
  let db: TutorDatabase;
  let repo: DexieKnowledgeRepository;

  const makeKb = (overrides?: Partial<KnowledgeBase>): KnowledgeBase => ({
    id: "kb_test1",
    name: "Test KB",
    description: "A test knowledge base",
    embeddingModel: "text-embedding-3-small",
    embeddingDimension: 1536,
    documentCount: 0,
    chunkCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  beforeEach(async () => {
    db = new TutorDatabase();
    await db.delete();
    await db.open();
    repo = new DexieKnowledgeRepository(db);
  });

  it("creates and retrieves a knowledge base", async () => {
    const kb = makeKb();
    await repo.createKnowledgeBase(kb);

    const result = await repo.getKnowledgeBase("kb_test1");
    expect(result).toEqual(kb);
  });

  it("lists all knowledge bases", async () => {
    await repo.createKnowledgeBase(makeKb({ id: "kb_1", name: "KB 1" }));
    await repo.createKnowledgeBase(makeKb({ id: "kb_2", name: "KB 2" }));

    const list = await repo.listKnowledgeBases();
    expect(list).toHaveLength(2);
  });

  it("deletes a knowledge base and its documents and chunks", async () => {
    const kb = makeKb();
    await repo.createKnowledgeBase(kb);
    await repo.addDocument({
      id: "doc_1",
      knowledgeBaseId: "kb_test1",
      name: "test.pdf",
      mimeType: "application/pdf",
      size: 1000,
      chunkCount: 1,
      createdAt: Date.now(),
    });
    await repo.addChunks([{
      id: "chunk_1",
      knowledgeBaseId: "kb_test1",
      documentId: "doc_1",
      content: "test content",
      metadata: { documentName: "test.pdf", chunkIndex: 0 },
      embedding: null,
    }]);

    await repo.deleteKnowledgeBase("kb_test1");

    expect(await repo.getKnowledgeBase("kb_test1")).toBeUndefined();
    expect(await repo.getDocuments("kb_test1")).toHaveLength(0);
    expect(await repo.getChunks("kb_test1")).toHaveLength(0);
  });

  it("adds and retrieves chunks with embeddings", async () => {
    const kb = makeKb();
    await repo.createKnowledgeBase(kb);

    const chunk: Chunk = {
      id: "chunk_1",
      knowledgeBaseId: "kb_test1",
      documentId: "doc_1",
      content: "Hello world",
      metadata: { documentName: "test.txt", chunkIndex: 0 },
      embedding: null,
    };
    await repo.addChunks([chunk]);
    await repo.updateChunkEmbedding("chunk_1", [0.1, 0.2, 0.3]);

    const chunks = await repo.getChunks("kb_test1");
    expect(chunks).toHaveLength(1);
    expect(chunks[0].embedding).toEqual([0.1, 0.2, 0.3]);
  });
});
```

- [ ] **Step 4: Install fake-indexeddb for testing**

```bash
pnpm add -D fake-indexeddb
```

- [ ] **Step 5: Run test to verify it fails**

```bash
pnpm test -- tests/lib/core/storage/knowledge-repo.test.ts
```

Expected: FAIL — module `knowledge-repo` not found.

- [ ] **Step 6: Implement knowledge repository**

Create `lib/core/storage/knowledge-repo.ts`:

```typescript
import type { TutorDatabase } from "./db";
import type { KnowledgeBase, Document, Chunk } from "@/lib/core/types";
import type { KnowledgeRepository } from "./repository";

export class DexieKnowledgeRepository implements KnowledgeRepository {
  constructor(private readonly db: TutorDatabase) {}

  async listKnowledgeBases(): Promise<readonly KnowledgeBase[]> {
    return this.db.knowledgeBases.orderBy("createdAt").reverse().toArray();
  }

  async getKnowledgeBase(id: string): Promise<KnowledgeBase | undefined> {
    return this.db.knowledgeBases.get(id);
  }

  async createKnowledgeBase(kb: KnowledgeBase): Promise<void> {
    await this.db.knowledgeBases.add(kb);
  }

  async updateKnowledgeBase(
    id: string,
    updates: Partial<KnowledgeBase>
  ): Promise<void> {
    await this.db.knowledgeBases.update(id, updates);
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.knowledgeBases, this.db.documents, this.db.chunks],
      async () => {
        await this.db.chunks.where("knowledgeBaseId").equals(id).delete();
        await this.db.documents.where("knowledgeBaseId").equals(id).delete();
        await this.db.knowledgeBases.delete(id);
      }
    );
  }

  async addDocument(doc: Document): Promise<void> {
    await this.db.documents.add(doc);
  }

  async getDocuments(knowledgeBaseId: string): Promise<readonly Document[]> {
    return this.db.documents
      .where("knowledgeBaseId")
      .equals(knowledgeBaseId)
      .toArray();
  }

  async deleteDocument(id: string): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.documents, this.db.chunks],
      async () => {
        await this.db.chunks.where("documentId").equals(id).delete();
        await this.db.documents.delete(id);
      }
    );
  }

  async addChunks(chunks: readonly Chunk[]): Promise<void> {
    await this.db.chunks.bulkAdd([...chunks]);
  }

  async getChunks(knowledgeBaseId: string): Promise<readonly Chunk[]> {
    return this.db.chunks
      .where("knowledgeBaseId")
      .equals(knowledgeBaseId)
      .toArray();
  }

  async getChunksByDocument(documentId: string): Promise<readonly Chunk[]> {
    return this.db.chunks.where("documentId").equals(documentId).toArray();
  }

  async updateChunkEmbedding(
    chunkId: string,
    embedding: readonly number[]
  ): Promise<void> {
    await this.db.chunks.update(chunkId, { embedding: [...embedding] });
  }

  async deleteChunksByDocument(documentId: string): Promise<void> {
    await this.db.chunks.where("documentId").equals(documentId).delete();
  }
}
```

- [ ] **Step 7: Run test to verify it passes**

```bash
pnpm test -- tests/lib/core/storage/knowledge-repo.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 8: Write and implement session repository**

Create `tests/lib/core/storage/session-repo.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { DexieSessionRepository } from "@/lib/core/storage/session-repo";
import { TutorDatabase } from "@/lib/core/storage/db";
import type { Session, Message } from "@/lib/core/types";

describe("DexieSessionRepository", () => {
  let db: TutorDatabase;
  let repo: DexieSessionRepository;

  const makeSession = (overrides?: Partial<Session>): Session => ({
    id: "sess_1",
    title: "Test Session",
    knowledgeBaseIds: [],
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  beforeEach(async () => {
    db = new TutorDatabase();
    await db.delete();
    await db.open();
    repo = new DexieSessionRepository(db);
  });

  it("creates and retrieves a session", async () => {
    const session = makeSession();
    await repo.createSession(session);

    const result = await repo.getSession("sess_1");
    expect(result).toEqual(session);
  });

  it("adds a message to a session", async () => {
    await repo.createSession(makeSession());

    const message: Message = {
      id: "msg_1",
      role: "user",
      content: "Hello",
      createdAt: Date.now(),
    };
    await repo.addMessage("sess_1", message);

    const session = await repo.getSession("sess_1");
    expect(session?.messages).toHaveLength(1);
    expect(session?.messages[0].content).toBe("Hello");
  });

  it("lists sessions ordered by updatedAt descending", async () => {
    await repo.createSession(makeSession({ id: "s1", updatedAt: 100 }));
    await repo.createSession(makeSession({ id: "s2", updatedAt: 200 }));

    const list = await repo.listSessions();
    expect(list[0].id).toBe("s2");
    expect(list[1].id).toBe("s1");
  });

  it("deletes a session", async () => {
    await repo.createSession(makeSession());
    await repo.deleteSession("sess_1");

    expect(await repo.getSession("sess_1")).toBeUndefined();
  });
});
```

Create `lib/core/storage/session-repo.ts`:

```typescript
import type { TutorDatabase } from "./db";
import type { Session, Message } from "@/lib/core/types";
import type { SessionRepository } from "./repository";

export class DexieSessionRepository implements SessionRepository {
  constructor(private readonly db: TutorDatabase) {}

  async listSessions(): Promise<readonly Session[]> {
    return this.db.sessions.orderBy("updatedAt").reverse().toArray();
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.db.sessions.get(id);
  }

  async createSession(session: Session): Promise<void> {
    await this.db.sessions.add(session);
  }

  async updateSession(
    id: string,
    updates: Partial<Session>
  ): Promise<void> {
    await this.db.sessions.update(id, updates);
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.sessions.delete(id);
  }

  async addMessage(sessionId: string, message: Message): Promise<void> {
    const session = await this.db.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    await this.db.sessions.update(sessionId, {
      messages: [...session.messages, message],
      updatedAt: Date.now(),
    });
  }
}
```

- [ ] **Step 9: Write and implement memory repository**

Create `tests/lib/core/storage/memory-repo.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo";
import { TutorDatabase } from "@/lib/core/storage/db";
import type { Memory } from "@/lib/core/types";

describe("DexieMemoryRepository", () => {
  let db: TutorDatabase;
  let repo: DexieMemoryRepository;

  const makeMemory = (): Memory => ({
    id: "memory_default",
    profile: {
      knowledgeLevels: {},
      learningStyle: "mixed",
      pacePreference: "moderate",
      goals: [],
      language: "en",
    },
    progress: {
      topicsExplored: [],
      totalSessions: 0,
      totalMessages: 0,
      lastActiveAt: Date.now(),
    },
    updatedAt: Date.now(),
  });

  beforeEach(async () => {
    db = new TutorDatabase();
    await db.delete();
    await db.open();
    repo = new DexieMemoryRepository(db);
  });

  it("returns undefined when no memory exists", async () => {
    expect(await repo.getMemory()).toBeUndefined();
  });

  it("saves and retrieves memory", async () => {
    const memory = makeMemory();
    await repo.saveMemory(memory);

    const result = await repo.getMemory();
    expect(result?.profile.learningStyle).toBe("mixed");
  });

  it("overwrites existing memory on save", async () => {
    await repo.saveMemory(makeMemory());

    const updated: Memory = {
      ...makeMemory(),
      profile: {
        ...makeMemory().profile,
        learningStyle: "visual",
      },
    };
    await repo.saveMemory(updated);

    const result = await repo.getMemory();
    expect(result?.profile.learningStyle).toBe("visual");
  });
});
```

Create `lib/core/storage/memory-repo.ts`:

```typescript
import type { TutorDatabase } from "./db";
import type { Memory } from "@/lib/core/types";
import type { MemoryRepository } from "./repository";

const MEMORY_ID = "memory_default";

export class DexieMemoryRepository implements MemoryRepository {
  constructor(private readonly db: TutorDatabase) {}

  async getMemory(): Promise<Memory | undefined> {
    return this.db.memory.get(MEMORY_ID);
  }

  async saveMemory(memory: Memory): Promise<void> {
    await this.db.memory.put({ ...memory, id: MEMORY_ID });
  }
}
```

- [ ] **Step 10: Run all storage tests**

```bash
pnpm test -- tests/lib/core/storage/
```

Expected: All tests PASS (knowledge: 4, session: 4, memory: 3 = 11 total).

- [ ] **Step 11: Commit**

```bash
git add lib/core/storage/ tests/lib/core/storage/
git commit -m "feat: add storage layer with Dexie repos for KB, session, and memory"
```

---

## Task 5: LLM Provider Abstraction

**Files:**
- Create: `lib/core/ai/providers.ts`, `lib/core/ai/llm.ts`, `lib/core/ai/embeddings.ts`, `configs/providers.ts`

- [ ] **Step 1: Create provider configuration**

Create `configs/providers.ts`:

```typescript
export interface ProviderDefinition {
  readonly id: string;
  readonly name: string;
  readonly requiresApiKey: boolean;
  readonly defaultBaseUrl?: string;
  readonly models: readonly string[];
  readonly embeddingModels?: readonly string[];
}

export const PROVIDERS: readonly ProviderDefinition[] = [
  {
    id: "openai",
    name: "OpenAI",
    requiresApiKey: true,
    models: ["gpt-4o", "gpt-4o-mini", "o4-mini"],
    embeddingModels: ["text-embedding-3-small", "text-embedding-3-large"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    requiresApiKey: true,
    models: ["claude-sonnet-4-6", "claude-haiku-4-5"],
  },
  {
    id: "google",
    name: "Google",
    requiresApiKey: true,
    models: ["gemini-2.5-flash", "gemini-2.5-pro"],
    embeddingModels: ["text-embedding-004"],
  },
] as const;

export function getProviderDefinition(
  id: string
): ProviderDefinition | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
```

- [ ] **Step 2: Create LLM abstraction**

Create `lib/core/ai/providers.ts`:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { ProviderConfig } from "@/lib/core/types";

export function createLanguageModel(config: ProviderConfig) {
  switch (config.provider) {
    case "openai": {
      const provider = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });
      return provider(config.model);
    }
    case "anthropic": {
      const provider = createAnthropic({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });
      return provider(config.model);
    }
    case "google": {
      const provider = createGoogleGenerativeAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });
      return provider(config.model);
    }
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
```

Create `lib/core/ai/llm.ts`:

```typescript
import { streamText, generateText } from "ai";
import { createLanguageModel } from "./providers";
import type { ProviderConfig } from "@/lib/core/types";

export interface GenerateOptions {
  readonly config: ProviderConfig;
  readonly system?: string;
  readonly messages: readonly { role: "user" | "assistant"; content: string }[];
}

export async function generate(options: GenerateOptions) {
  const model = createLanguageModel(options.config);

  return generateText({
    model,
    system: options.system,
    messages: [...options.messages],
  });
}

export function stream(options: GenerateOptions) {
  const model = createLanguageModel(options.config);

  return streamText({
    model,
    system: options.system,
    messages: [...options.messages],
  });
}
```

- [ ] **Step 3: Create embedding abstraction**

Create `lib/core/ai/embeddings.ts`:

```typescript
import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { ProviderConfig } from "@/lib/core/types";

function createEmbeddingModel(config: ProviderConfig) {
  switch (config.provider) {
    case "openai": {
      const provider = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });
      return provider.embedding(config.model);
    }
    case "google": {
      const provider = createGoogleGenerativeAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });
      return provider.textEmbeddingModel(config.model);
    }
    default:
      throw new Error(
        `Embedding not supported for provider: ${config.provider}`
      );
  }
}

export async function embedText(
  text: string,
  config: ProviderConfig
): Promise<readonly number[]> {
  const model = createEmbeddingModel(config);
  const { embedding } = await embed({ model, value: text });
  return embedding;
}

export async function embedTexts(
  texts: readonly string[],
  config: ProviderConfig
): Promise<readonly (readonly number[])[]> {
  const model = createEmbeddingModel(config);
  const { embeddings } = await embedMany({ model, values: [...texts] });
  return embeddings;
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/core/ai/ configs/
git commit -m "feat: add LLM and embedding provider abstraction via AI SDK"
```

---

## Task 6: Document Parsing

**Files:**
- Create: `lib/core/knowledge/parser.ts`
- Test: `tests/lib/core/knowledge/parser.test.ts`

- [ ] **Step 1: Write parser tests**

Create `tests/lib/core/knowledge/parser.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseDocument } from "@/lib/core/knowledge/parser";

describe("parseDocument", () => {
  it("parses plain text content", async () => {
    const content = new Blob(["Hello world\n\nThis is a test."], {
      type: "text/plain",
    });
    const result = await parseDocument(content, "test.txt", "text/plain");

    expect(result.text).toBe("Hello world\n\nThis is a test.");
    expect(result.metadata.name).toBe("test.txt");
  });

  it("parses markdown content preserving structure", async () => {
    const md = "# Title\n\nParagraph one.\n\n## Section\n\nParagraph two.";
    const content = new Blob([md], { type: "text/markdown" });
    const result = await parseDocument(content, "doc.md", "text/markdown");

    expect(result.text).toContain("# Title");
    expect(result.text).toContain("## Section");
  });

  it("throws on unsupported mime type", async () => {
    const content = new Blob(["data"], { type: "application/zip" });

    await expect(
      parseDocument(content, "file.zip", "application/zip")
    ).rejects.toThrow("Unsupported");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/core/knowledge/parser.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement document parser**

Create `lib/core/knowledge/parser.ts`:

```typescript
export interface ParsedDocument {
  readonly text: string;
  readonly metadata: {
    readonly name: string;
    readonly mimeType: string;
    readonly pageCount?: number;
  };
}

const SUPPORTED_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/pdf",
]);

export async function parseDocument(
  content: Blob,
  name: string,
  mimeType: string
): Promise<ParsedDocument> {
  const normalizedType = mimeType.toLowerCase();

  if (!SUPPORTED_TYPES.has(normalizedType)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  switch (normalizedType) {
    case "text/plain":
    case "text/markdown":
      return parseTextFile(content, name, normalizedType);
    case "application/pdf":
      return parsePdfFile(content, name);
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

async function parseTextFile(
  content: Blob,
  name: string,
  mimeType: string
): Promise<ParsedDocument> {
  const text = await content.text();
  return {
    text,
    metadata: { name, mimeType },
  };
}

async function parsePdfFile(
  content: Blob,
  name: string
): Promise<ParsedDocument> {
  const { extractText } = await import("unpdf");
  const buffer = await content.arrayBuffer();
  const { text, totalPages } = await extractText(new Uint8Array(buffer));

  return {
    text,
    metadata: {
      name,
      mimeType: "application/pdf",
      pageCount: totalPages,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- tests/lib/core/knowledge/parser.test.ts
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/core/knowledge/parser.ts tests/lib/core/knowledge/parser.test.ts
git commit -m "feat: add document parser for TXT, Markdown, and PDF"
```

---

## Task 7: Semantic Chunking

**Files:**
- Create: `lib/core/knowledge/chunker.ts`
- Test: `tests/lib/core/knowledge/chunker.test.ts`

- [ ] **Step 1: Write chunker tests**

Create `tests/lib/core/knowledge/chunker.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { chunkText } from "@/lib/core/knowledge/chunker";

describe("chunkText", () => {
  it("returns single chunk for short text", () => {
    const chunks = chunkText("Short text.", { maxChunkSize: 500, overlap: 50 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe("Short text.");
  });

  it("splits long text into multiple chunks", () => {
    const paragraphs = Array.from(
      { length: 10 },
      (_, i) => `Paragraph ${i}. ${"Lorem ipsum ".repeat(20)}`
    ).join("\n\n");

    const chunks = chunkText(paragraphs, {
      maxChunkSize: 200,
      overlap: 30,
    });

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(250); // some flex for word boundaries
    }
  });

  it("preserves heading hierarchy in metadata", () => {
    const text = "# Chapter 1\n\n## Section A\n\nContent under section A.\n\n## Section B\n\nContent under section B.";
    const chunks = chunkText(text, { maxChunkSize: 80, overlap: 0 });

    const sectionBChunk = chunks.find((c) =>
      c.content.includes("Content under section B")
    );
    expect(sectionBChunk?.headings).toContain("Chapter 1");
    expect(sectionBChunk?.headings).toContain("Section B");
  });

  it("includes overlap between consecutive chunks", () => {
    const text = "First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence. Sixth sentence. Seventh sentence. Eighth sentence.";
    const chunks = chunkText(text, { maxChunkSize: 60, overlap: 20 });

    if (chunks.length >= 2) {
      const end1 = chunks[0].content.slice(-20);
      const start2 = chunks[1].content.slice(0, 40);
      // Overlap means some text from end of chunk 1 appears in start of chunk 2
      expect(start2).toContain(end1.trim().split(" ").pop());
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/core/knowledge/chunker.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement chunker**

Create `lib/core/knowledge/chunker.ts`:

```typescript
export interface ChunkOptions {
  readonly maxChunkSize: number;
  readonly overlap: number;
}

export interface TextChunk {
  readonly content: string;
  readonly headings: readonly string[];
  readonly index: number;
}

const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;

export function chunkText(
  text: string,
  options: ChunkOptions
): readonly TextChunk[] {
  const { maxChunkSize, overlap } = options;
  const lines = text.split("\n");

  const sections = splitIntoSections(lines);
  const chunks: TextChunk[] = [];
  let chunkIndex = 0;

  for (const section of sections) {
    const sectionText = section.lines.join("\n").trim();
    if (sectionText.length === 0) continue;

    if (sectionText.length <= maxChunkSize) {
      chunks.push({
        content: sectionText,
        headings: [...section.headings],
        index: chunkIndex++,
      });
    } else {
      const subChunks = splitBySize(sectionText, maxChunkSize, overlap);
      for (const sub of subChunks) {
        chunks.push({
          content: sub,
          headings: [...section.headings],
          index: chunkIndex++,
        });
      }
    }
  }

  return chunks;
}

interface Section {
  readonly headings: string[];
  readonly lines: string[];
}

function splitIntoSections(lines: readonly string[]): readonly Section[] {
  const sections: Section[] = [];
  const currentHeadings: string[] = [];
  let currentLines: string[] = [];

  for (const line of lines) {
    const match = HEADING_REGEX.exec(line);
    if (match) {
      if (currentLines.length > 0) {
        sections.push({
          headings: [...currentHeadings],
          lines: [...currentLines],
        });
        currentLines = [];
      }

      const level = match[1].length;
      while (currentHeadings.length >= level) {
        currentHeadings.pop();
      }
      currentHeadings.push(match[2]);
      currentLines.push(line);
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    sections.push({
      headings: [...currentHeadings],
      lines: [...currentLines],
    });
  }

  return sections;
}

function splitBySize(
  text: string,
  maxSize: number,
  overlap: number
): readonly string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  let overlapBuffer = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length + 1 > maxSize && current.length > 0) {
      chunks.push(current.trim());
      overlapBuffer = current.slice(-overlap);
      current = overlapBuffer + " " + sentence;
    } else {
      current = current.length === 0 ? sentence : current + " " + sentence;
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- tests/lib/core/knowledge/chunker.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/core/knowledge/chunker.ts tests/lib/core/knowledge/chunker.test.ts
git commit -m "feat: add semantic chunking with heading hierarchy and overlap"
```

---

## Task 8: Vector Retrieval

**Files:**
- Create: `lib/core/knowledge/retriever.ts`
- Test: `tests/lib/core/knowledge/retriever.test.ts`

- [ ] **Step 1: Write retriever tests**

Create `tests/lib/core/knowledge/retriever.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { retrieveChunks } from "@/lib/core/knowledge/retriever";
import type { Chunk } from "@/lib/core/types";

describe("retrieveChunks", () => {
  const makeChunk = (id: string, embedding: number[]): Chunk => ({
    id,
    knowledgeBaseId: "kb_1",
    documentId: "doc_1",
    content: `Content for ${id}`,
    metadata: { documentName: "test.txt", chunkIndex: 0 },
    embedding,
  });

  it("returns chunks ranked by cosine similarity", () => {
    const queryEmbedding = [1, 0, 0];
    const chunks = [
      makeChunk("c1", [1, 0, 0]),    // perfect match
      makeChunk("c2", [0, 1, 0]),    // orthogonal
      makeChunk("c3", [0.9, 0.1, 0]), // close match
    ];

    const results = retrieveChunks(queryEmbedding, chunks, { topK: 3 });

    expect(results).toHaveLength(3);
    expect(results[0].chunk.id).toBe("c1");
    expect(results[1].chunk.id).toBe("c3");
    expect(results[2].chunk.id).toBe("c2");
    expect(results[0].score).toBeCloseTo(1.0);
  });

  it("respects topK limit", () => {
    const chunks = [
      makeChunk("c1", [1, 0]),
      makeChunk("c2", [0.5, 0.5]),
      makeChunk("c3", [0, 1]),
    ];

    const results = retrieveChunks([1, 0], chunks, { topK: 2 });
    expect(results).toHaveLength(2);
  });

  it("respects minScore threshold", () => {
    const chunks = [
      makeChunk("c1", [1, 0]),    // score ~1.0
      makeChunk("c2", [0, 1]),    // score ~0.0
    ];

    const results = retrieveChunks([1, 0], chunks, {
      topK: 10,
      minScore: 0.5,
    });

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/core/knowledge/retriever.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement retriever**

Create `lib/core/knowledge/retriever.ts`:

```typescript
import type { Chunk, SearchResult } from "@/lib/core/types";
import { cosineSimilarity } from "@/lib/utils/cosine-similarity";

export interface RetrieveOptions {
  readonly topK: number;
  readonly minScore?: number;
}

export function retrieveChunks(
  queryEmbedding: readonly number[],
  chunks: readonly Chunk[],
  options: RetrieveOptions
): readonly SearchResult[] {
  const { topK, minScore = 0 } = options;

  const scored: SearchResult[] = [];

  for (const chunk of chunks) {
    if (!chunk.embedding || chunk.embedding.length === 0) continue;

    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    if (score >= minScore) {
      scored.push({ chunk, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- tests/lib/core/knowledge/retriever.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/core/knowledge/retriever.ts tests/lib/core/knowledge/retriever.test.ts
git commit -m "feat: add vector retrieval with cosine similarity ranking"
```

---

## Task 9: Knowledge Service

**Files:**
- Create: `lib/core/knowledge/knowledge-service.ts`, `lib/core/knowledge/embedder.ts`
- Test: `tests/lib/core/knowledge/knowledge-service.test.ts`

- [ ] **Step 1: Create embedder pipeline**

Create `lib/core/knowledge/embedder.ts`:

```typescript
import type { Chunk } from "@/lib/core/types";
import type { ProviderConfig } from "@/lib/core/types";
import type { KnowledgeRepository } from "@/lib/core/storage/repository";
import { embedTexts } from "@/lib/core/ai/embeddings";

export async function embedChunks(
  chunks: readonly Chunk[],
  config: ProviderConfig,
  repo: KnowledgeRepository,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const unembedded = chunks.filter((c) => c.embedding === null);
  const batchSize = 20;

  for (let i = 0; i < unembedded.length; i += batchSize) {
    const batch = unembedded.slice(i, i + batchSize);
    const texts = batch.map((c) => c.content);

    const embeddings = await embedTexts(texts, config);

    for (let j = 0; j < batch.length; j++) {
      await repo.updateChunkEmbedding(batch[j].id, embeddings[j]);
    }

    onProgress?.(Math.min(i + batchSize, unembedded.length), unembedded.length);
  }
}
```

- [ ] **Step 2: Write knowledge service test**

Create `tests/lib/core/knowledge/knowledge-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { KnowledgeService } from "@/lib/core/knowledge/knowledge-service";
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

describe("KnowledgeService", () => {
  let db: TutorDatabase;
  let repo: DexieKnowledgeRepository;
  let service: KnowledgeService;

  beforeEach(async () => {
    db = new TutorDatabase();
    await db.delete();
    await db.open();
    repo = new DexieKnowledgeRepository(db);
    service = new KnowledgeService(repo);
  });

  it("creates a knowledge base with correct defaults", async () => {
    const kb = await service.createKnowledgeBase({
      name: "Test KB",
      description: "A test",
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
    });

    expect(kb.name).toBe("Test KB");
    expect(kb.documentCount).toBe(0);
    expect(kb.chunkCount).toBe(0);
    expect(kb.id).toBeTruthy();
  });

  it("ingests a text document into chunks", async () => {
    const kb = await service.createKnowledgeBase({
      name: "Test KB",
      description: "A test",
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
    });

    const text = "First paragraph with enough content to be meaningful.\n\nSecond paragraph with additional details and context.";
    const blob = new Blob([text], { type: "text/plain" });

    await service.ingestDocument(kb.id, blob, "test.txt", "text/plain");

    const docs = await repo.getDocuments(kb.id);
    expect(docs).toHaveLength(1);
    expect(docs[0].name).toBe("test.txt");

    const chunks = await repo.getChunks(kb.id);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].embedding).toBeNull(); // not yet embedded
  });

  it("lists knowledge bases", async () => {
    await service.createKnowledgeBase({
      name: "KB 1",
      description: "",
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
    });
    await service.createKnowledgeBase({
      name: "KB 2",
      description: "",
      embeddingModel: "text-embedding-3-small",
      embeddingDimension: 1536,
    });

    const list = await service.listKnowledgeBases();
    expect(list).toHaveLength(2);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm test -- tests/lib/core/knowledge/knowledge-service.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement knowledge service**

Create `lib/core/knowledge/knowledge-service.ts`:

```typescript
import type { KnowledgeBase, Document, Chunk } from "@/lib/core/types";
import type { KnowledgeRepository } from "@/lib/core/storage/repository";
import { parseDocument } from "./parser";
import { chunkText } from "./chunker";
import { generateId } from "@/lib/utils/id";

interface CreateKnowledgeBaseInput {
  readonly name: string;
  readonly description: string;
  readonly embeddingModel: string;
  readonly embeddingDimension: number;
}

export class KnowledgeService {
  constructor(private readonly repo: KnowledgeRepository) {}

  async createKnowledgeBase(
    input: CreateKnowledgeBaseInput
  ): Promise<KnowledgeBase> {
    const kb: KnowledgeBase = {
      id: generateId("kb"),
      name: input.name,
      description: input.description,
      embeddingModel: input.embeddingModel,
      embeddingDimension: input.embeddingDimension,
      documentCount: 0,
      chunkCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.repo.createKnowledgeBase(kb);
    return kb;
  }

  async listKnowledgeBases(): Promise<readonly KnowledgeBase[]> {
    return this.repo.listKnowledgeBases();
  }

  async getKnowledgeBase(id: string): Promise<KnowledgeBase | undefined> {
    return this.repo.getKnowledgeBase(id);
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    return this.repo.deleteKnowledgeBase(id);
  }

  async ingestDocument(
    knowledgeBaseId: string,
    content: Blob,
    name: string,
    mimeType: string
  ): Promise<Document> {
    const parsed = await parseDocument(content, name, mimeType);

    const textChunks = chunkText(parsed.text, {
      maxChunkSize: 1000,
      overlap: 100,
    });

    const docId = generateId("doc");
    const doc: Document = {
      id: docId,
      knowledgeBaseId,
      name,
      mimeType,
      size: content.size,
      chunkCount: textChunks.length,
      createdAt: Date.now(),
    };

    const chunks: Chunk[] = textChunks.map((tc) => ({
      id: generateId("chunk"),
      knowledgeBaseId,
      documentId: docId,
      content: tc.content,
      metadata: {
        documentName: name,
        headingHierarchy: tc.headings,
        chunkIndex: tc.index,
      },
      embedding: null,
    }));

    await this.repo.addDocument(doc);
    await this.repo.addChunks(chunks);

    const kb = await this.repo.getKnowledgeBase(knowledgeBaseId);
    if (kb) {
      await this.repo.updateKnowledgeBase(knowledgeBaseId, {
        documentCount: kb.documentCount + 1,
        chunkCount: kb.chunkCount + textChunks.length,
        updatedAt: Date.now(),
      });
    }

    return doc;
  }

  async getChunks(knowledgeBaseId: string): Promise<readonly Chunk[]> {
    return this.repo.getChunks(knowledgeBaseId);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm test -- tests/lib/core/knowledge/knowledge-service.test.ts
```

Expected: All 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/core/knowledge/ tests/lib/core/knowledge/
git commit -m "feat: add knowledge service with document ingestion and chunking pipeline"
```

---

## Task 10: Session Service

**Files:**
- Create: `lib/core/session/session-service.ts`
- Test: `tests/lib/core/session/session-service.test.ts`

- [ ] **Step 1: Write session service test**

Create `tests/lib/core/session/session-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { SessionService } from "@/lib/core/session/session-service";
import { DexieSessionRepository } from "@/lib/core/storage/session-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

describe("SessionService", () => {
  let db: TutorDatabase;
  let service: SessionService;

  beforeEach(async () => {
    db = new TutorDatabase();
    await db.delete();
    await db.open();
    service = new SessionService(new DexieSessionRepository(db));
  });

  it("creates a session with default title", async () => {
    const session = await service.createSession({ knowledgeBaseIds: ["kb_1"] });

    expect(session.title).toBe("New Session");
    expect(session.knowledgeBaseIds).toEqual(["kb_1"]);
    expect(session.messages).toHaveLength(0);
  });

  it("adds a user message and retrieves it", async () => {
    const session = await service.createSession({ knowledgeBaseIds: [] });
    await service.addUserMessage(session.id, "Hello AI");

    const updated = await service.getSession(session.id);
    expect(updated?.messages).toHaveLength(1);
    expect(updated?.messages[0].role).toBe("user");
    expect(updated?.messages[0].content).toBe("Hello AI");
  });

  it("adds an assistant message with citations", async () => {
    const session = await service.createSession({ knowledgeBaseIds: [] });
    await service.addAssistantMessage(session.id, "Here is the answer.", [
      {
        chunkId: "chunk_1",
        documentName: "textbook.pdf",
        content: "Source text",
        score: 0.95,
      },
    ]);

    const updated = await service.getSession(session.id);
    expect(updated?.messages).toHaveLength(1);
    expect(updated?.messages[0].citations).toHaveLength(1);
  });

  it("lists sessions", async () => {
    await service.createSession({ knowledgeBaseIds: [] });
    await service.createSession({ knowledgeBaseIds: [] });

    const list = await service.listSessions();
    expect(list).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/core/session/session-service.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement session service**

Create `lib/core/session/session-service.ts`:

```typescript
import type { Session, Message, Citation } from "@/lib/core/types";
import type { SessionRepository } from "@/lib/core/storage/repository";
import { generateId } from "@/lib/utils/id";

interface CreateSessionInput {
  readonly knowledgeBaseIds: readonly string[];
  readonly title?: string;
}

export class SessionService {
  constructor(private readonly repo: SessionRepository) {}

  async createSession(input: CreateSessionInput): Promise<Session> {
    const session: Session = {
      id: generateId("sess"),
      title: input.title ?? "New Session",
      knowledgeBaseIds: [...input.knowledgeBaseIds],
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.repo.createSession(session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.repo.getSession(id);
  }

  async listSessions(): Promise<readonly Session[]> {
    return this.repo.listSessions();
  }

  async deleteSession(id: string): Promise<void> {
    return this.repo.deleteSession(id);
  }

  async addUserMessage(sessionId: string, content: string): Promise<Message> {
    const message: Message = {
      id: generateId("msg"),
      role: "user",
      content,
      createdAt: Date.now(),
    };

    await this.repo.addMessage(sessionId, message);
    return message;
  }

  async addAssistantMessage(
    sessionId: string,
    content: string,
    citations?: readonly Citation[]
  ): Promise<Message> {
    const message: Message = {
      id: generateId("msg"),
      role: "assistant",
      content,
      citations: citations ? [...citations] : undefined,
      createdAt: Date.now(),
    };

    await this.repo.addMessage(sessionId, message);
    return message;
  }

  async updateTitle(sessionId: string, title: string): Promise<void> {
    await this.repo.updateSession(sessionId, { title, updatedAt: Date.now() });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- tests/lib/core/session/session-service.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/core/session/ tests/lib/core/session/
git commit -m "feat: add session service with message management"
```

---

## Task 11: Memory Service

**Files:**
- Create: `lib/core/memory/memory-service.ts`
- Test: `tests/lib/core/memory/memory-service.test.ts`

- [ ] **Step 1: Write memory service test**

Create `tests/lib/core/memory/memory-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { MemoryService } from "@/lib/core/memory/memory-service";
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

describe("MemoryService", () => {
  let db: TutorDatabase;
  let service: MemoryService;

  beforeEach(async () => {
    db = new TutorDatabase();
    await db.delete();
    await db.open();
    service = new MemoryService(new DexieMemoryRepository(db));
  });

  it("initializes default memory on first get", async () => {
    const memory = await service.getOrInitMemory();

    expect(memory.profile.learningStyle).toBe("mixed");
    expect(memory.profile.pacePreference).toBe("moderate");
    expect(memory.progress.totalSessions).toBe(0);
  });

  it("updates profile fields immutably", async () => {
    await service.getOrInitMemory();

    await service.updateProfile({
      learningStyle: "visual",
      goals: ["pass linear algebra exam"],
    });

    const memory = await service.getOrInitMemory();
    expect(memory.profile.learningStyle).toBe("visual");
    expect(memory.profile.goals).toContain("pass linear algebra exam");
    expect(memory.profile.pacePreference).toBe("moderate"); // unchanged
  });

  it("records a completed session in progress", async () => {
    await service.getOrInitMemory();

    await service.recordSessionCompleted({
      topics: ["calculus"],
      messageCount: 15,
    });

    const memory = await service.getOrInitMemory();
    expect(memory.progress.totalSessions).toBe(1);
    expect(memory.progress.totalMessages).toBe(15);
    expect(memory.progress.topicsExplored).toHaveLength(1);
    expect(memory.progress.topicsExplored[0].topic).toBe("calculus");
  });

  it("increments existing topic progress", async () => {
    await service.getOrInitMemory();

    await service.recordSessionCompleted({ topics: ["calculus"], messageCount: 5 });
    await service.recordSessionCompleted({ topics: ["calculus"], messageCount: 10 });

    const memory = await service.getOrInitMemory();
    expect(memory.progress.totalSessions).toBe(2);
    expect(memory.progress.topicsExplored).toHaveLength(1);
    expect(memory.progress.topicsExplored[0].sessionsCount).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/core/memory/memory-service.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement memory service**

Create `lib/core/memory/memory-service.ts`:

```typescript
import type {
  Memory,
  LearnerProfile,
  LearningProgress,
  TopicProgress,
} from "@/lib/core/types";
import type { MemoryRepository } from "@/lib/core/storage/repository";

const DEFAULT_PROFILE: LearnerProfile = {
  knowledgeLevels: {},
  learningStyle: "mixed",
  pacePreference: "moderate",
  goals: [],
  language: "en",
};

const DEFAULT_PROGRESS: LearningProgress = {
  topicsExplored: [],
  totalSessions: 0,
  totalMessages: 0,
  lastActiveAt: Date.now(),
};

interface SessionRecord {
  readonly topics: readonly string[];
  readonly messageCount: number;
}

export class MemoryService {
  constructor(private readonly repo: MemoryRepository) {}

  async getOrInitMemory(): Promise<Memory> {
    const existing = await this.repo.getMemory();
    if (existing) return existing;

    const memory: Memory = {
      id: "memory_default",
      profile: DEFAULT_PROFILE,
      progress: DEFAULT_PROGRESS,
      updatedAt: Date.now(),
    };

    await this.repo.saveMemory(memory);
    return memory;
  }

  async updateProfile(
    updates: Partial<LearnerProfile>
  ): Promise<Memory> {
    const current = await this.getOrInitMemory();

    const updated: Memory = {
      ...current,
      profile: { ...current.profile, ...updates },
      updatedAt: Date.now(),
    };

    await this.repo.saveMemory(updated);
    return updated;
  }

  async recordSessionCompleted(record: SessionRecord): Promise<Memory> {
    const current = await this.getOrInitMemory();
    const now = Date.now();

    const topicsMap = new Map<string, TopicProgress>(
      current.progress.topicsExplored.map((t) => [t.topic, t])
    );

    for (const topic of record.topics) {
      const existing = topicsMap.get(topic);
      if (existing) {
        topicsMap.set(topic, {
          ...existing,
          sessionsCount: existing.sessionsCount + 1,
          lastStudiedAt: now,
        });
      } else {
        topicsMap.set(topic, {
          topic,
          mastery: "exploring",
          sessionsCount: 1,
          lastStudiedAt: now,
        });
      }
    }

    const updated: Memory = {
      ...current,
      progress: {
        topicsExplored: [...topicsMap.values()],
        totalSessions: current.progress.totalSessions + 1,
        totalMessages: current.progress.totalMessages + record.messageCount,
        lastActiveAt: now,
      },
      updatedAt: now,
    };

    await this.repo.saveMemory(updated);
    return updated;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- tests/lib/core/memory/memory-service.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/core/memory/ tests/lib/core/memory/
git commit -m "feat: add memory service with learner profile and progress tracking"
```

---

## Task 12: Chat Service with RAG

**Files:**
- Create: `lib/chat/chat-service.ts`, `lib/chat/prompts.ts`
- Test: `tests/lib/chat/chat-service.test.ts`

- [ ] **Step 1: Create chat system prompts**

Create `lib/chat/prompts.ts`:

```typescript
import type { LearnerProfile, SearchResult } from "@/lib/core/types";

export function buildSystemPrompt(
  profile: LearnerProfile | null,
  retrievedChunks: readonly SearchResult[]
): string {
  const parts: string[] = [
    "You are a knowledgeable, patient AI tutor. Your role is to help the user learn effectively by explaining concepts clearly, answering questions thoroughly, and adapting to their level.",
  ];

  if (profile) {
    parts.push(
      `\nLearner profile:\n- Learning style: ${profile.learningStyle}\n- Pace preference: ${profile.pacePreference}\n- Goals: ${profile.goals.length > 0 ? profile.goals.join(", ") : "not specified"}`
    );
  }

  if (retrievedChunks.length > 0) {
    parts.push("\nRelevant context from the user's knowledge base:");
    for (let i = 0; i < retrievedChunks.length; i++) {
      const { chunk, score } = retrievedChunks[i];
      parts.push(
        `\n[Source ${i + 1}: ${chunk.metadata.documentName}] (relevance: ${score.toFixed(2)})\n${chunk.content}`
      );
    }
    parts.push(
      "\nWhen using information from the sources above, cite them as [Source N]. If the sources don't contain relevant information for the question, rely on your general knowledge but mention that."
    );
  }

  return parts.join("\n");
}
```

- [ ] **Step 2: Write chat service test**

Create `tests/lib/chat/chat-service.test.ts`:

```typescript
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
    expect(prompt).toContain("AI tutor");
    expect(prompt).toContain("learn effectively");
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
    expect(prompt).toContain("cite them as [Source N]");
  });
});
```

- [ ] **Step 3: Run test to verify it passes**

```bash
pnpm test -- tests/lib/chat/chat-service.test.ts
```

Expected: All 3 tests PASS (prompts are pure functions, no mocking needed).

- [ ] **Step 4: Create chat service**

Create `lib/chat/chat-service.ts`:

```typescript
import { streamText } from "ai";
import { createLanguageModel } from "@/lib/core/ai/providers";
import { embedText } from "@/lib/core/ai/embeddings";
import { retrieveChunks } from "@/lib/core/knowledge/retriever";
import { buildSystemPrompt } from "./prompts";
import type {
  ProviderConfig,
  Message,
  SearchResult,
  Chunk,
} from "@/lib/core/types";
import type { LearnerProfile } from "@/lib/core/types";

export interface ChatRequest {
  readonly messages: readonly Message[];
  readonly llmConfig: ProviderConfig;
  readonly embeddingConfig: ProviderConfig;
  readonly chunks: readonly Chunk[];
  readonly profile: LearnerProfile | null;
}

export interface ChatResponse {
  readonly textStream: ReadableStream<string>;
  readonly citations: readonly SearchResult[];
}

export async function streamChat(request: ChatRequest): Promise<ChatResponse> {
  const { messages, llmConfig, embeddingConfig, chunks, profile } = request;

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  let retrievedChunks: readonly SearchResult[] = [];

  if (lastUserMessage && chunks.length > 0) {
    const queryEmbedding = await embedText(
      lastUserMessage.content,
      embeddingConfig
    );
    retrievedChunks = retrieveChunks(queryEmbedding, chunks, {
      topK: 5,
      minScore: 0.3,
    });
  }

  const systemPrompt = buildSystemPrompt(profile, retrievedChunks);
  const model = createLanguageModel(llmConfig);

  const aiMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const result = streamText({
    model,
    system: systemPrompt,
    messages: aiMessages,
  });

  return {
    textStream: result.textStream,
    citations: retrievedChunks,
  };
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/chat/ tests/lib/chat/
git commit -m "feat: add chat service with RAG retrieval and citation-aware prompts"
```

---

## Task 13: API Routes

**Files:**
- Create: `app/api/chat/route.ts`, `app/api/knowledge/route.ts`, `app/api/knowledge/[id]/route.ts`, `app/api/knowledge/[id]/documents/route.ts`, `app/api/knowledge/search/route.ts`, `app/api/knowledge/embed/route.ts`, `app/api/session/route.ts`, `app/api/session/[id]/route.ts`, `app/api/memory/route.ts`

- [ ] **Step 1: Create chat streaming API route**

Create `app/api/chat/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { z } from "zod";
import { streamChat } from "@/lib/chat/chat-service";
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo";
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo";
import { TutorDatabase } from "@/lib/core/storage/db";
import { MemoryService } from "@/lib/core/memory/memory-service";
import type { Message, ProviderConfig } from "@/lib/core/types";

const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
      citations: z.array(z.any()).optional(),
      createdAt: z.number(),
    })
  ),
  knowledgeBaseIds: z.array(z.string()),
  llmConfig: z.object({
    provider: z.string(),
    model: z.string(),
    apiKey: z.string(),
    baseUrl: z.string().optional(),
  }),
  embeddingConfig: z.object({
    provider: z.string(),
    model: z.string(),
    apiKey: z.string(),
    baseUrl: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = ChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { messages, knowledgeBaseIds, llmConfig, embeddingConfig } = parsed.data;

  const db = new TutorDatabase();
  const kbRepo = new DexieKnowledgeRepository(db);
  const memoryService = new MemoryService(new DexieMemoryRepository(db));

  const allChunks = (
    await Promise.all(knowledgeBaseIds.map((id) => kbRepo.getChunks(id)))
  ).flat();

  const memory = await memoryService.getOrInitMemory();

  const { textStream, citations } = await streamChat({
    messages: messages as Message[],
    llmConfig: llmConfig as ProviderConfig,
    embeddingConfig: embeddingConfig as ProviderConfig,
    chunks: allChunks,
    profile: memory.profile,
  });

  const encoder = new TextEncoder();
  const citationsHeader = JSON.stringify(
    citations.map((c) => ({
      chunkId: c.chunk.id,
      documentName: c.chunk.metadata.documentName,
      content: c.chunk.content.slice(0, 200),
      score: c.score,
    }))
  );

  const responseStream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "citations", citations: citationsHeader })}\n\n`)
      );

      const reader = textStream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "text", text: value })}\n\n`)
        );
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 2: Create knowledge base CRUD routes**

Create `app/api/knowledge/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { z } from "zod";
import { KnowledgeService } from "@/lib/core/knowledge/knowledge-service";
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

const CreateKbSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  embeddingModel: z.string().default("text-embedding-3-small"),
  embeddingDimension: z.number().default(1536),
});

function getService() {
  return new KnowledgeService(new DexieKnowledgeRepository(new TutorDatabase()));
}

export async function GET() {
  const list = await getService().listKnowledgeBases();
  return Response.json(list);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateKbSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const kb = await getService().createKnowledgeBase(parsed.data);
  return Response.json(kb, { status: 201 });
}
```

Create `app/api/knowledge/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { KnowledgeService } from "@/lib/core/knowledge/knowledge-service";
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

function getService() {
  return new KnowledgeService(new DexieKnowledgeRepository(new TutorDatabase()));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const kb = await getService().getKnowledgeBase(id);
  if (!kb) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(kb);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await getService().deleteKnowledgeBase(id);
  return new Response(null, { status: 204 });
}
```

Create `app/api/knowledge/[id]/documents/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { KnowledgeService } from "@/lib/core/knowledge/knowledge-service";
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

function getService() {
  return new KnowledgeService(new DexieKnowledgeRepository(new TutorDatabase()));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const doc = await getService().ingestDocument(
    id,
    file,
    file.name,
    file.type
  );

  return Response.json(doc, { status: 201 });
}
```

- [ ] **Step 3: Create session and memory routes**

Create `app/api/session/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { z } from "zod";
import { SessionService } from "@/lib/core/session/session-service";
import { DexieSessionRepository } from "@/lib/core/storage/session-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

const CreateSessionSchema = z.object({
  knowledgeBaseIds: z.array(z.string()).default([]),
  title: z.string().optional(),
});

function getService() {
  return new SessionService(new DexieSessionRepository(new TutorDatabase()));
}

export async function GET() {
  const list = await getService().listSessions();
  return Response.json(list);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateSessionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const session = await getService().createSession(parsed.data);
  return Response.json(session, { status: 201 });
}
```

Create `app/api/session/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { SessionService } from "@/lib/core/session/session-service";
import { DexieSessionRepository } from "@/lib/core/storage/session-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

function getService() {
  return new SessionService(new DexieSessionRepository(new TutorDatabase()));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getService().getSession(id);
  if (!session) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(session);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await getService().deleteSession(id);
  return new Response(null, { status: 204 });
}
```

Create `app/api/memory/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { MemoryService } from "@/lib/core/memory/memory-service";
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo";
import { TutorDatabase } from "@/lib/core/storage/db";

function getService() {
  return new MemoryService(new DexieMemoryRepository(new TutorDatabase()));
}

export async function GET() {
  const memory = await getService().getOrInitMemory();
  return Response.json(memory);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const service = getService();

  if (body.profile) {
    await service.updateProfile(body.profile);
  }

  const memory = await service.getOrInitMemory();
  return Response.json(memory);
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/
git commit -m "feat: add API routes for chat streaming, KB management, sessions, and memory"
```

---

## Task 14: Zustand Stores

**Files:**
- Create: `lib/store/settings-store.ts`, `lib/store/knowledge-store.ts`, `lib/store/session-store.ts`, `lib/store/chat-store.ts`, `lib/store/memory-store.ts`

- [ ] **Step 1: Create settings store**

Create `lib/store/settings-store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProviderConfig } from "@/lib/core/types";

interface SettingsState {
  readonly llmConfig: ProviderConfig;
  readonly embeddingConfig: ProviderConfig;
  readonly setLlmConfig: (config: ProviderConfig) => void;
  readonly setEmbeddingConfig: (config: ProviderConfig) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      llmConfig: {
        provider: "openai",
        model: "gpt-4o-mini",
        apiKey: "",
      },
      embeddingConfig: {
        provider: "openai",
        model: "text-embedding-3-small",
        apiKey: "",
      },
      setLlmConfig: (config) => set({ llmConfig: config }),
      setEmbeddingConfig: (config) => set({ embeddingConfig: config }),
    }),
    { name: "btr-settings" }
  )
);
```

- [ ] **Step 2: Create knowledge store**

Create `lib/store/knowledge-store.ts`:

```typescript
import { create } from "zustand";
import type { KnowledgeBase } from "@/lib/core/types";

interface KnowledgeState {
  readonly knowledgeBases: readonly KnowledgeBase[];
  readonly isLoading: boolean;
  readonly setKnowledgeBases: (kbs: readonly KnowledgeBase[]) => void;
  readonly addKnowledgeBase: (kb: KnowledgeBase) => void;
  readonly removeKnowledgeBase: (id: string) => void;
  readonly setLoading: (loading: boolean) => void;
}

export const useKnowledgeStore = create<KnowledgeState>()((set) => ({
  knowledgeBases: [],
  isLoading: false,
  setKnowledgeBases: (kbs) => set({ knowledgeBases: kbs }),
  addKnowledgeBase: (kb) =>
    set((state) => ({ knowledgeBases: [...state.knowledgeBases, kb] })),
  removeKnowledgeBase: (id) =>
    set((state) => ({
      knowledgeBases: state.knowledgeBases.filter((kb) => kb.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

- [ ] **Step 3: Create session store**

Create `lib/store/session-store.ts`:

```typescript
import { create } from "zustand";
import type { Session } from "@/lib/core/types";

interface SessionState {
  readonly sessions: readonly Session[];
  readonly activeSessionId: string | null;
  readonly setSessions: (sessions: readonly Session[]) => void;
  readonly setActiveSession: (id: string | null) => void;
  readonly addSession: (session: Session) => void;
  readonly removeSession: (id: string) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessions: [],
  activeSessionId: null,
  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
    })),
}));
```

- [ ] **Step 4: Create chat store**

Create `lib/store/chat-store.ts`:

```typescript
import { create } from "zustand";
import type { Message, Citation } from "@/lib/core/types";

interface ChatState {
  readonly messages: readonly Message[];
  readonly isStreaming: boolean;
  readonly currentCitations: readonly Citation[];
  readonly selectedKnowledgeBaseIds: readonly string[];
  readonly setMessages: (messages: readonly Message[]) => void;
  readonly addMessage: (message: Message) => void;
  readonly setStreaming: (streaming: boolean) => void;
  readonly setCitations: (citations: readonly Citation[]) => void;
  readonly setSelectedKbs: (ids: readonly string[]) => void;
  readonly clearChat: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  isStreaming: false,
  currentCitations: [],
  selectedKnowledgeBaseIds: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setCitations: (currentCitations) => set({ currentCitations }),
  setSelectedKbs: (selectedKnowledgeBaseIds) =>
    set({ selectedKnowledgeBaseIds }),
  clearChat: () =>
    set({ messages: [], currentCitations: [], isStreaming: false }),
}));
```

- [ ] **Step 5: Create memory store**

Create `lib/store/memory-store.ts`:

```typescript
import { create } from "zustand";
import type { Memory } from "@/lib/core/types";

interface MemoryState {
  readonly memory: Memory | null;
  readonly setMemory: (memory: Memory) => void;
}

export const useMemoryStore = create<MemoryState>()((set) => ({
  memory: null,
  setMemory: (memory) => set({ memory }),
}));
```

- [ ] **Step 6: Commit**

```bash
git add lib/store/
git commit -m "feat: add Zustand stores for settings, KB, session, chat, and memory"
```

---

## Task 15: UI Components — Chat, Knowledge, Settings, Sidebar

This task creates all the UI components for Phase 1. Since UI components are harder to TDD, the approach is: build components, then verify manually in the browser.

**Files:**
- Create: All files under `components/chat/`, `components/knowledge/`, `components/settings/`, `components/sidebar/`, `components/common/`, `components/providers/`
- Create: All page files under `app/(workspace)/chat/`, `app/(utility)/knowledge/`, `app/(utility)/settings/`, `app/(utility)/layout.tsx`

- [ ] **Step 1: Install shadcn/ui components**

```bash
pnpm dlx shadcn@latest init --defaults
pnpm dlx shadcn@latest add button input card dialog label select textarea tabs scroll-area badge separator dropdown-menu
```

- [ ] **Step 2: Create markdown renderer**

Create `components/common/markdown-renderer.tsx`:

```tsx
"use client";

import { memo } from "react";

interface MarkdownRendererProps {
  readonly content: string;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  // Phase 1: simple rendering. Shiki + KaTeX added in later tasks.
  const html = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
    />
  );
});
```

- [ ] **Step 3: Create sidebar navigation**

Create `components/sidebar/sidebar-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, BookOpen, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-muted/30">
      <div className="p-4">
        <h1 className="text-lg font-bold">btr-gpt-tutor</h1>
        <p className="text-xs text-muted-foreground">AI Learning Platform</p>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

Create `lib/utils/cn.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Create chat UI components**

Create `components/chat/message-bubble.tsx`:

```tsx
"use client";

import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import type { Message } from "@/lib/core/types";
import { cn } from "@/lib/utils/cn";

interface MessageBubbleProps {
  readonly message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <MarkdownRenderer content={message.content} />
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.citations.map((c, i) => (
              <Badge key={c.chunkId} variant="secondary" className="text-xs">
                Source {i + 1}: {c.documentName}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

Create `components/chat/message-list.tsx`:

```tsx
"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import type { Message } from "@/lib/core/types";

interface MessageListProps {
  readonly messages: readonly Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Start a conversation. Ask about your uploaded documents.
          </p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
```

Create `components/chat/chat-input.tsx`:

```tsx
"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  readonly onSend: (message: string) => void;
  readonly isStreaming: boolean;
}

export function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed.length === 0 || isStreaming) return;
    onSend(trimmed);
    setInput("");
  }, [input, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="border-t border-border p-4">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your documents..."
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={input.trim().length === 0 || isStreaming}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

Create `components/chat/chat-area.tsx`:

```tsx
"use client";

import { useCallback } from "react";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { generateId } from "@/lib/utils/id";
import type { Message, Citation } from "@/lib/core/types";

export function ChatArea() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const addMessage = useChatStore((s) => s.addMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const selectedKbs = useChatStore((s) => s.selectedKnowledgeBaseIds);
  const llmConfig = useSettingsStore((s) => s.llmConfig);
  const embeddingConfig = useSettingsStore((s) => s.embeddingConfig);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: generateId("msg"),
        role: "user",
        content,
        createdAt: Date.now(),
      };

      addMessage(userMessage);
      setStreaming(true);

      const allMessages = [...messages, userMessage];

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            knowledgeBaseIds: selectedKbs,
            llmConfig,
            embeddingConfig,
          }),
        });

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let assistantContent = "";
        let citations: Citation[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            const parsed = JSON.parse(data);
            if (parsed.type === "citations") {
              citations = JSON.parse(parsed.citations);
            } else if (parsed.type === "text") {
              assistantContent += parsed.text;
            }
          }
        }

        const assistantMessage: Message = {
          id: generateId("msg"),
          role: "assistant",
          content: assistantContent,
          citations,
          createdAt: Date.now(),
        };

        addMessage(assistantMessage);
      } finally {
        setStreaming(false);
      }
    },
    [messages, selectedKbs, llmConfig, embeddingConfig, addMessage, setStreaming]
  );

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} isStreaming={isStreaming} />
    </div>
  );
}
```

- [ ] **Step 5: Create chat page**

Create `app/(workspace)/chat/page.tsx`:

```tsx
import { ChatArea } from "@/components/chat/chat-area";

export default function ChatPage() {
  return (
    <div className="h-full">
      <ChatArea />
    </div>
  );
}
```

- [ ] **Step 6: Create knowledge management page**

Create `app/(utility)/layout.tsx`:

```tsx
import { SidebarNav } from "@/components/sidebar/sidebar-nav";

export default function UtilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SidebarNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

Create `app/(utility)/knowledge/page.tsx`:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload } from "lucide-react";
import { useKnowledgeStore } from "@/lib/store/knowledge-store";
import type { KnowledgeBase } from "@/lib/core/types";

export default function KnowledgePage() {
  const { knowledgeBases, setKnowledgeBases, setLoading } = useKnowledgeStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/knowledge")
      .then((r) => r.json())
      .then((data) => setKnowledgeBases(data))
      .finally(() => setLoading(false));
  }, [setKnowledgeBases, setLoading]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    const response = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const kb: KnowledgeBase = await response.json();
    useKnowledgeStore.getState().addKnowledgeBase(kb);
    setNewName("");
    setShowCreate(false);
  }, [newName]);

  const handleUpload = useCallback(async (kbId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await fetch(`/api/knowledge/${kbId}/documents`, {
      method: "POST",
      body: formData,
    });
    // Refresh KB list
    const data = await fetch("/api/knowledge").then((r) => r.json());
    setKnowledgeBases(data);
  }, [setKnowledgeBases]);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    useKnowledgeStore.getState().removeKnowledgeBase(id);
  }, []);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Knowledge Bases</h2>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4 mb-6">
          <Label>Name</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Linear Algebra"
            />
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {knowledgeBases.map((kb) => (
          <Card key={kb.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{kb.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {kb.documentCount} documents · {kb.chunkCount} chunks
                </p>
              </div>
              <div className="flex gap-2">
                <label>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.md,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(kb.id, file);
                    }}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span><Upload className="h-3 w-3 mr-1" /> Upload</span>
                  </Button>
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(kb.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {knowledgeBases.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No knowledge bases yet. Create one and upload your documents.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create settings page**

Create `app/(utility)/settings/page.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/lib/store/settings-store";
import { PROVIDERS } from "@/configs/providers";
import { toast } from "sonner";

export default function SettingsPage() {
  const { llmConfig, embeddingConfig, setLlmConfig, setEmbeddingConfig } =
    useSettingsStore();

  const llmProvider = PROVIDERS.find((p) => p.id === llmConfig.provider);
  const embeddingProviders = PROVIDERS.filter((p) => p.embeddingModels);

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">LLM Provider</h3>

        <div className="space-y-2">
          <Label>Provider</Label>
          <Select
            value={llmConfig.provider}
            onValueChange={(provider) => {
              const def = PROVIDERS.find((p) => p.id === provider);
              setLlmConfig({
                ...llmConfig,
                provider,
                model: def?.models[0] ?? "",
              });
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Model</Label>
          <Select
            value={llmConfig.model}
            onValueChange={(model) => setLlmConfig({ ...llmConfig, model })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {llmProvider?.models.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>API Key</Label>
          <Input
            type="password"
            value={llmConfig.apiKey}
            onChange={(e) =>
              setLlmConfig({ ...llmConfig, apiKey: e.target.value })
            }
            placeholder="sk-..."
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Embedding Provider</h3>

        <div className="space-y-2">
          <Label>Provider</Label>
          <Select
            value={embeddingConfig.provider}
            onValueChange={(provider) => {
              const def = embeddingProviders.find((p) => p.id === provider);
              setEmbeddingConfig({
                ...embeddingConfig,
                provider,
                model: def?.embeddingModels?.[0] ?? "",
              });
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {embeddingProviders.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>API Key</Label>
          <Input
            type="password"
            value={embeddingConfig.apiKey}
            onChange={(e) =>
              setEmbeddingConfig({ ...embeddingConfig, apiKey: e.target.value })
            }
            placeholder="sk-..."
          />
        </div>
      </Card>

      <Button onClick={() => toast.success("Settings saved")}>
        Save Settings
      </Button>
    </div>
  );
}
```

- [ ] **Step 8: Update workspace layout with proper sidebar**

Update `app/(workspace)/layout.tsx`:

```tsx
import { SidebarNav } from "@/components/sidebar/sidebar-nav";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SidebarNav />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
```

- [ ] **Step 9: Verify in browser**

```bash
pnpm dev
```

Verify at http://localhost:3000:
- Home page renders with sidebar navigation
- `/chat` shows chat interface with input box
- `/knowledge` shows KB management (create, upload, delete)
- `/settings` shows provider configuration
- Dark mode toggle works
- Navigation links are highlighted correctly

- [ ] **Step 10: Commit**

```bash
git add app/ components/ lib/store/ lib/utils/cn.ts lib/hooks/ configs/
git commit -m "feat: add UI for chat, knowledge management, settings, and sidebar navigation"
```

---

## Task 16: i18n Skeleton + Dark Mode

**Files:**
- Create: `lib/i18n/config.ts`, `lib/i18n/locales/en.json`, `lib/i18n/locales/zh.json`, `lib/hooks/use-theme.ts`

- [ ] **Step 1: Create i18n config**

Create `lib/i18n/config.ts`:

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
```

Create `lib/i18n/locales/en.json`:

```json
{
  "app": {
    "name": "btr-gpt-tutor",
    "tagline": "AI Learning Platform"
  },
  "nav": {
    "home": "Home",
    "chat": "Chat",
    "knowledge": "Knowledge",
    "settings": "Settings"
  },
  "chat": {
    "placeholder": "Ask about your documents...",
    "empty": "Start a conversation. Ask about your uploaded documents."
  },
  "knowledge": {
    "title": "Knowledge Bases",
    "empty": "No knowledge bases yet. Create one and upload your documents.",
    "create": "New",
    "upload": "Upload",
    "documents": "documents",
    "chunks": "chunks"
  },
  "settings": {
    "title": "Settings",
    "llm": "LLM Provider",
    "embedding": "Embedding Provider",
    "provider": "Provider",
    "model": "Model",
    "apiKey": "API Key",
    "save": "Save Settings"
  }
}
```

Create `lib/i18n/locales/zh.json`:

```json
{
  "app": {
    "name": "btr-gpt-tutor",
    "tagline": "AI 学习平台"
  },
  "nav": {
    "home": "首页",
    "chat": "对话",
    "knowledge": "知识库",
    "settings": "设置"
  },
  "chat": {
    "placeholder": "询问你的文档内容...",
    "empty": "开始对话，询问你上传的文档内容。"
  },
  "knowledge": {
    "title": "知识库",
    "empty": "暂无知识库。创建一个并上传你的文档。",
    "create": "新建",
    "upload": "上传",
    "documents": "文档",
    "chunks": "块"
  },
  "settings": {
    "title": "设置",
    "llm": "语言模型",
    "embedding": "向量模型",
    "provider": "服务商",
    "model": "模型",
    "apiKey": "API 密钥",
    "save": "保存设置"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/i18n/ lib/hooks/
git commit -m "feat: add i18n skeleton with English and Chinese locales"
```

---

## Task 17: Run Full Test Suite + Final Verification

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: All tests pass:
- `cosine-similarity.test.ts` — 6 tests
- `knowledge-repo.test.ts` — 4 tests
- `session-repo.test.ts` — 4 tests
- `memory-repo.test.ts` — 3 tests
- `parser.test.ts` — 3 tests
- `chunker.test.ts` — 4 tests
- `retriever.test.ts` — 4 tests
- `knowledge-service.test.ts` — 3 tests
- `session-service.test.ts` — 4 tests
- `memory-service.test.ts` — 4 tests
- `chat-service.test.ts` — 3 tests

Total: ~42 tests, all passing.

- [ ] **Step 2: Verify build succeeds**

```bash
pnpm build
```

Expected: Build completes with no errors.

- [ ] **Step 3: Manual browser verification**

```bash
pnpm dev
```

Verify:
1. Home page loads at `/`
2. Chat page at `/chat` — send a message (requires API key in settings)
3. Knowledge page at `/knowledge` — create KB, upload a TXT file
4. Settings at `/settings` — configure OpenAI API key
5. Dark mode works (toggle via system preference)
6. Sidebar navigation highlights active page

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: Phase 1 complete — foundation, knowledge layer, chat with RAG, memory, sessions"
```

---

## Summary

Phase 1 delivers 17 tasks producing:

| Component | Tests | Status |
|-----------|-------|--------|
| Cosine similarity | 6 | Core utility for vector search |
| Storage layer (3 repos) | 11 | Dexie-backed with repository pattern |
| LLM + embedding abstraction | — | AI SDK multi-provider (OpenAI, Anthropic, Google) |
| Document parser | 3 | PDF, Markdown, TXT |
| Semantic chunker | 4 | Heading-aware with overlap |
| Vector retriever | 4 | Cosine similarity ranking with topK + minScore |
| Knowledge service | 3 | KB lifecycle + document ingestion pipeline |
| Session service | 4 | Session CRUD + message management |
| Memory service | 4 | Learner profile + progress tracking |
| Chat service | 3 | RAG-enhanced chat with citations |
| API routes | — | 9 endpoints for chat, KB, session, memory |
| UI | — | Chat, KB management, settings, sidebar, dark mode |
| i18n | — | English + Chinese skeleton |

**Total: ~42 unit tests, 9 API endpoints, 4 pages, full working RAG-powered tutor.**

**Next:** Phase 2 plan (Deep Solve, Deep Research, Quiz, Guided Learning, Notebooks, Web Search, Vision Solver, Visualize, Plugin System).
