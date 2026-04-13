# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

btr-gpt-tutor is an AI-powered learning platform built as a Next.js 16 modular monolith. Users upload documents, build knowledge bases, and study with AI tutors that adapt to their learning profile. The system uses RAG (Retrieval-Augmented Generation) to ground AI responses in the user's own materials.

## Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test         # Vitest — run all unit tests (tests/**)
pnpm test:watch   # Vitest in watch mode
pnpm test:e2e     # Playwright E2E (e2e/**)
pnpm test:e2e:ui  # Playwright with UI

# Run a single test file (pnpm test runs ALL files; use vitest directly to filter):
pnpm vitest run tests/lib/core/storage/knowledge-repo.test.ts
```

## Architecture

### Three-Layer Design

```
Activity Modules (UI + API routes)     ← app/, components/, lib/store/
         │
   Shared Core (services + AI)         ← lib/core/, lib/chat/
         │
   Storage Layer (Dexie/IndexedDB)     ← lib/core/storage/
```

### Activity Modules

Beyond the core chat, the codebase has several feature modules — each under its own `lib/` directory with a service and prompts file:
- **Chat modes** (`lib/chat/modes/`) — `deep-solve`, `deep-research`, `vision-solver` alongside the base chat service
- **Quiz** (`lib/quiz/`) — quiz generation and evaluation
- **Guided Learning** (`lib/guide/`) — structured learning flows
- **Notebook** (`lib/notebook/`) — persistent learning notes
- **Plugin system** (`lib/core/plugin/`) — two-layer model: Tools (atomic operations) + Capabilities (orchestrated workflows), managed by `PluginRegistry`
- **Web search** (`lib/core/search/`) — Tavily and DuckDuckGo providers

### Module Boundary Rule

Code in `lib/` can import from `lib/core/` but never from a sibling module. Cross-module communication goes through Zustand stores. This keeps modules independently testable.

### Data Flow: Chat with RAG

```
User message → POST /api/chat
  → Zod validation
  → Load chunks from selected knowledge bases (Dexie)
  → Embed user query (AI SDK)
  → Cosine similarity retrieval (top-5, min 0.3 score)
  → Build system prompt with learner profile + retrieved context
  → Stream response via SSE (citations event, then text chunks, then [DONE])
```

### Storage: Repository Pattern over Dexie

All data persistence goes through repository interfaces (`lib/core/storage/repository.ts`), implemented by Dexie classes. The database schema is defined in `lib/core/storage/db.ts` (TutorDatabase). This abstraction exists to allow future migration to Supabase/Postgres without changing service code.

Tables: `knowledgeBases`, `documents`, `chunks`, `sessions`, `memory`, `settings`

### AI Provider Abstraction

LLM and embedding providers are configured at runtime via `ProviderConfig` (provider + model + apiKey + optional baseUrl). The `lib/core/ai/providers.ts` factory supports OpenAI, Anthropic, and Google via the Vercel AI SDK. Embeddings support OpenAI and Google (`lib/core/ai/embeddings.ts`).

### Knowledge Pipeline

```
Upload → Parse (text/markdown/PDF via unpdf)
  → Chunk (semantic splitting on markdown headings, sentence-level overlap)
  → Embed (batched, 20 at a time)
  → Store in Dexie with nullable embeddings
  → Retrieve via cosine similarity at query time
```

Chunking config: 1000 char max, 100 char overlap. Parser is in `lib/core/knowledge/parser.ts`, chunker in `chunker.ts`, embedder in `embedder.ts`, retriever in `retriever.ts`.

### State Management

Zustand stores in `lib/store/` — one per domain:
- `chat-store` — messages, streaming state, citations, selected KB ids
- `settings-store` — LLM + embedding provider config (persisted to localStorage via `zustand/persist`)
- `session-store` — session list, active session id
- `knowledge-store` — knowledge base list, loading state
- `memory-store` — learner memory (profile + progress)
- `notebook-store` — notebook entries
- `quiz-store` — quiz state
- `guide-store` — guided learning state

### Route Groups

- `app/(workspace)/` — main chat interface with sidebar
- `app/(utility)/` — knowledge management, settings (also with sidebar)
- `app/api/` — REST endpoints:
  - Core: `chat`, `session`, `session/[id]`, `memory`
  - Knowledge: `knowledge`, `knowledge/[id]`, `knowledge/[id]/documents`
  - Activities: `quiz/generate`, `quiz/grade`, `guide/plan`, `guide/page`, `solve`, `research`
  - Utilities: `search`, `notebook`, `notebook/[id]`, `notebook/[id]/records`

### i18n

Client-side i18next with English and Chinese locales (`lib/i18n/locales/{en,zh}.json`). Initialized in `lib/i18n/config.ts`.

### UI

shadcn/ui (base-nova style) with Tailwind CSS v4, next-themes for dark mode, Geist font. Components in `components/ui/` (shadcn primitives) and `components/{chat,sidebar,common}/` (app-specific).

## Key Types

All domain types are in `lib/core/types/index.ts`: `KnowledgeBase`, `Document`, `Chunk`, `Session`, `Message`, `Memory`, `LearnerProfile`, `LearningProgress`, `ProviderConfig`. All type properties are `readonly`.

## Environment Variables

Copy `.env.example` to `.env.local`. At minimum one LLM provider API key is needed:
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`
- `EMBEDDING_PROVIDER` (default: openai), `EMBEDDING_MODEL` (default: text-embedding-3-small)

Note: API keys are currently passed from the client-side settings store to API routes in request bodies (not from server env vars).

## Testing Gotchas

- **Dexie tests need fake-indexeddb:** Any test touching the database must `import "fake-indexeddb/auto"` as the very first import. Without it, Dexie throws because IndexedDB doesn't exist in Node.
- **Single file:** Use `pnpm vitest run <path>` — `pnpm test` always runs the full suite regardless of trailing arguments.

## ID Convention

All entity IDs use `prefix_nanoid12` format via `generateId(prefix)` in `lib/utils/id.ts`. Prefixes in use: `kb_`, `sess_`, `msg_`, `chunk_`.

## Inspiration References

The `inspiration/` directory contains cloned reference projects (DeepTutor, OpenMAIC) used for design research. These are not part of the build.

## Path Alias

`@/*` maps to the project root (not `src/`).
