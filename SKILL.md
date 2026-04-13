# SKILL.md — btr-gpt-tutor

> Operational reference for AI agents (nanoclaw, nanobot, etc.) to autonomously operate
> the btr-gpt-tutor platform. This file is the single source of truth for API contracts,
> CLI usage, and environment configuration.

---

## Project Description

**btr-gpt-tutor** is an AI-powered learning platform built on Next.js 16. Users upload documents,
build knowledge bases, and study with AI tutors that adapt to their learning profile via
RAG (Retrieval-Augmented Generation). The system supports multiple activity modules:
chat, quizzes, guided learning, notebooks, co-writing, research, TutorBots, and classroom
plan generation — all grounded in the user's own materials stored in browser-local IndexedDB (Dexie).

Architecture: three-layer modular monolith — Activity Modules → Shared Core → Storage (Dexie).

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local
# Add at least one LLM provider API key (see Environment Variables below)

# 3. Start dev server
pnpm dev         # http://localhost:3000
```

---

## CLI Commands

```bash
pnpm dev          # Start Next.js dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm test         # Vitest — run all unit tests (tests/**)
pnpm test:watch   # Vitest in watch mode
pnpm test:e2e     # Playwright E2E tests (e2e/**)
pnpm test:e2e:ui  # Playwright with interactive UI
```

### In-App CLI (nanoclaw integration)

The project exposes a programmatic CLI runner at `lib/cli/main.ts`. Commands:

| Command    | Description                              | Example                               |
|------------|------------------------------------------|---------------------------------------|
| `chat`     | Send a chat message in a session         | `chat --session=sess_abc "explain X"` |
| `kb`       | Manage knowledge bases (list/create/del) | `kb list`, `kb create --name="Math"`  |
| `bot`      | Manage TutorBots (list/create/chat)      | `bot list`, `bot chat bot_abc "Hi"`   |
| `session`  | Manage sessions (list/create/get)        | `session list`, `session create`      |
| `memory`   | Read/update learner memory               | `memory get`, `memory update`         |

---

## API Endpoints

All endpoints return the standard envelope:
```json
{ "success": true, "data": <payload> }
{ "success": false, "error": "<message>" }
```

### Chat

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Stream a chat completion (SSE). Body: `{ message, sessionId, knowledgeBaseIds[], llmConfig, embeddingConfig }` |

### Sessions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/session` | List all sessions |
| POST | `/api/session` | Create a new session |
| GET | `/api/session/[id]` | Get session with messages |
| DELETE | `/api/session/[id]` | Delete session |

### Knowledge

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/knowledge` | List all knowledge bases |
| POST | `/api/knowledge` | Create knowledge base |
| GET | `/api/knowledge/[id]` | Get knowledge base |
| DELETE | `/api/knowledge/[id]` | Delete knowledge base |
| POST | `/api/knowledge/[id]/documents` | Upload and ingest document |

### Memory

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/memory` | Get learner memory (profile + progress) |
| POST | `/api/memory` | Update learner memory |

### Quiz

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/quiz/generate` | Generate quiz questions from KB chunks |
| POST | `/api/quiz/grade` | Grade a completed quiz |

### Guide (Guided Learning)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/guide/plan` | Generate a structured learning plan |
| POST | `/api/guide/page` | Generate a learning page within a plan |

### Notebook

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notebook` | List notebooks |
| POST | `/api/notebook` | Create notebook |
| GET | `/api/notebook/[id]` | Get notebook |
| GET | `/api/notebook/[id]/records` | Get notebook records |
| POST | `/api/notebook/[id]/records` | Add record to notebook |

### Co-Writer

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/co-writer` | AI co-writing completion (streaming SSE) |

### TutorBot

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tutorbot` | List all bots |
| POST | `/api/tutorbot` | Create a new bot. Body: `{ name, persona, soulTemplateId?, model?, llmConfig }` |
| GET | `/api/tutorbot/[id]` | Get bot |
| PUT | `/api/tutorbot/[id]` | Update bot |
| DELETE | `/api/tutorbot/[id]` | Delete bot |
| POST | `/api/tutorbot/[id]/chat` | Stream a chat with a specific bot (SSE) |

### Export

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/export/html` | Export classroom plan as HTML |
| POST | `/api/export/pptx` | Export classroom plan as PPTX (base64) |

### Classroom

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/classroom` | Generate a classroom lesson plan |

### Search

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/search` | Web search (Tavily / DuckDuckGo) |

### Solve

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/solve` | Deep solve mode — step-by-step problem solving |

### Research

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/research` | Deep research mode — multi-step research synthesis |

### Media / TTS

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/media/tts` | Text-to-speech synthesis |

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# LLM Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Embedding (optional — defaults to openai / text-embedding-3-small)
EMBEDDING_PROVIDER=openai          # openai | google
EMBEDDING_MODEL=text-embedding-3-small

# Web search (optional — enables /api/search)
TAVILY_API_KEY=tvly-...

# TTS (optional — enables /api/media/tts)
OPENAI_TTS_KEY=sk-...
```

> Note: API keys are forwarded client-side in request bodies via the settings store,
> so server env vars are optional. Configure them as secrets when running server-side
> key injection (recommended for production).

---

## Supported LLM Providers and Models

| Provider  | Models |
|-----------|--------|
| OpenAI    | `gpt-4o`, `gpt-4o-mini`, `o4-mini` |
| Anthropic | `claude-sonnet-4-6`, `claude-haiku-4-5` |
| Google    | `gemini-2.5-flash`, `gemini-2.5-pro` |

Embedding models: `text-embedding-3-small`, `text-embedding-3-large` (OpenAI), `text-embedding-004` (Google).

---

## TutorBot Soul Templates

Pre-built persona templates available via `lib/tutorbot/soul-templates.ts`:

| ID | Name | Teaching Style |
|----|------|---------------|
| `socratic` | Socratic Mentor | Question-driven dialogue |
| `coach` | Motivational Coach | Encouraging, goal-oriented |
| `professor` | Academic Professor | Rigorous, structured lectures |
| `tutor` | Friendly Tutor | Conversational, patient |

---

## Storage

All data is stored client-side in **IndexedDB** via Dexie (`lib/core/storage/db.ts`).

Tables: `knowledgeBases`, `documents`, `chunks`, `sessions`, `memory`, `settings`, `tutorBots`

No backend database is required for local operation.

---

## Nanoclaw Integration

The project exposes a channel-based heartbeat system at `lib/tutorbot/channels/` and
`lib/tutorbot/heartbeat.ts` for nanoclaw agent integration. Agents can:

1. Subscribe to events via the channel system
2. Invoke CLI commands programmatically via `lib/cli/main.ts`
3. Call REST API endpoints directly using the base URL

For autonomous operation, agents should:
- Set `llmConfig` in POST body (provider + model + apiKey) — no server-side key setup needed
- Use session IDs to maintain conversation context across requests
- Poll `/api/session/[id]` to read message history

---

## Testing

```bash
pnpm test         # 156 unit tests (Vitest)
pnpm test:e2e     # ~19 E2E tests (Playwright, requires pnpm dev running or auto-started)
```

Test structure:
- Unit tests: `tests/lib/**/*.test.ts`
- E2E tests: `e2e/**/*.test.ts`
- Fake IndexedDB required for Dexie tests: `import "fake-indexeddb/auto"`
