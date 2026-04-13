# btr-gpt-tutor — Design Specification

A unified AI learning platform combining OpenMAIC's immersive multi-agent classroom experience with DeepTutor's personalized study tools. Users upload documents, build knowledge bases, attend AI-led classroom lessons generated from their materials, and study with persistent memory that adapts to their level and progress.

## 1. Vision

**One-line:** Learn alongside AI in class, then study with AI one-on-one — all in one unified workspace powered by your own documents.

**Core loop:** Upload documents → Build knowledge base → Attend AI classroom lessons generated from those docs → Study, quiz, research, write alongside AI → Memory tracks your progress → Everything gets smarter.

**Key differentiator:** No hard boundary between "classroom" and "study." The user fluidly switches between activities within a single session, and context (conversation history, knowledge base references, memory profile) carries forward across every transition.

## 2. Architecture

### 2.1 Approach: Incremental Assembly (Modular Monolith)

A single Next.js application with clean internal module boundaries. Features are built and shipped incrementally — each phase produces a usable product. No microservices, no separate backend.

### 2.2 Three Layers

**Activity Modules (top)** — Self-contained features that own their own store slices, API routes, and UI components:
- Chat (regular, Deep Solve, Deep Research, Vision Solver, Visualize)
- Classroom (generation, slides, whiteboard, orchestration, playback, discussion)
- Study Tools (Quiz, Co-Writer, Guided Learning, TutorBot, Math Animator, Notebooks)

**Shared Core (middle)** — The foundation all modules plug into:
- Knowledge Layer — document upload, parsing, chunking, embedding, vector store, RAG retrieval
- Memory Layer — learner profile + learning progress, post-session LLM update
- Session Layer — conversation history, attached KBs, activity trail, artifact tracking
- LLM Layer — multi-provider abstraction via AI SDK (OpenAI, Anthropic, Google, DeepSeek, Qwen, MiniMax, Grok, GLM, SiliconFlow, Doubao, Ollama, OpenRouter, custom)
- Embedding Layer — multi-provider embeddings with dimension configuration and mismatch detection
- Search Layer — web search (Tavily, Brave, Jina, SearXNG, DuckDuckGo, Perplexity) + academic paper search
- Media Layer — TTS (OpenAI, Azure, ElevenLabs, GLM, Qwen, MiniMax), ASR (OpenAI, Qwen), image generation (Seedream, Qwen, MiniMax, Grok), video generation (Seedance, Kling, Veo, Sora, MiniMax, Grok)
- Storage Layer — repository pattern abstracting IndexedDB (personal) or Supabase/Postgres (multi-user)
- Plugin System — two-layer model: Tools (atomic operations) + Capabilities (orchestrated workflows)
- Platform — i18n (EN, ZH + extensible), dark mode + themes (Glass, etc.), keyboard shortcuts, access code guard → full auth, settings panel

**Storage Layer (bottom)** — Abstracted via repository interfaces. Phase 1 uses Dexie/IndexedDB. Phase 6 swaps to Supabase (Postgres + pgvector + Auth + S3). Module code never touches storage directly.

### 2.3 Module Boundary Rule

Each module in `lib/` can import from `lib/core/` but never from another module. Cross-module communication goes through the Zustand store or the event bus (mitt). This keeps modules independently testable and replaceable.

## 3. Knowledge Layer (Foundation)

The document-first knowledge layer is the architectural centerpiece. Every activity draws from it.

### 3.1 Document Processing Pipeline

```
Upload → Parse → Chunk → Embed → Store → Retrieve
```

**Parsing:**

| Format | Parser | Handles |
|--------|--------|---------|
| PDF | unpdf (built-in) + MinerU (optional, for complex layouts/OCR) | Text, tables, formulas, figures |
| Markdown | Native parser | Headers, code, math (KaTeX) |
| TXT | Plain text splitter | Paragraph-aware chunking |
| PPTX | pptxtojson | Slide text, notes, structure |

**Chunking:** Semantic splitting with configurable overlap. Preserves heading hierarchy and code block boundaries.

**Embedding:** Multi-provider via AI SDK. Configurable per knowledge base (model, dimensions). Mismatch detection warns when querying a KB with a different embedding model than it was built with.

**Vector Store:** In-memory cosine similarity over Dexie-stored embeddings for local use (scales to ~50k chunks). Swappable to pgvector for cloud deployment.

### 3.2 Knowledge Base Management

- Named collections (e.g., "Linear Algebra", "ML Papers")
- Incremental document addition — add more files anytime
- Per-KB embedding configuration
- Search and preview chunks within a KB
- Attach KBs to any activity (chat session, classroom, quiz)

### 3.3 Notebooks

- Color-coded categorized learning records
- Save insights from any activity (chat, quiz, guided learning, research, co-writer)
- Import/export Markdown
- Notebook records feed back into RAG context
- Question Notebook for unified quiz review with bookmarks and categories

### 3.4 How Knowledge Feeds Activities

- **Chat:** Query → retrieve relevant chunks → inject as context → LLM generates grounded answer with citations
- **Classroom Generation:** Outline generator reads full doc structure → scene generator pulls relevant chunks per slide/quiz/simulation
- **Quiz:** Generate questions grounded in knowledge base content with validation and duplicate prevention
- **Guided Learning:** Structure learning plans from document topics, generate interactive pages per knowledge point
- **Deep Research:** Combine RAG retrieval with web and academic paper search for comprehensive cited reports
- **Co-Writer:** Pull context from KB when rewriting, expanding, or summarizing text

## 4. Memory & Session Layer

### 4.1 Persistent Memory (Two Dimensions)

**Learner Profile:**
- Knowledge level per subject
- Learning style preferences (visual, verbal, hands-on)
- Pace preference (fast overview vs. thorough deep-dive)
- Language and communication style
- Goals ("preparing for exam", "hobby exploration")

**Learning Progress:**
- Topics explored and mastery level
- Classrooms attended and completion status
- Quiz performance history and weak areas
- Time spent per subject
- Key insights and breakthroughs noted

### 4.2 Memory Update Cycle

1. Session ends (user closes or starts a new one)
2. Background job summarizes the session: topics covered, quiz results, insights gained
3. LLM updates learner profile and learning progress based on session summary
4. Updated memory available for all future sessions and activities

### 4.3 How Memory Flows Into Activities

- **Chat:** Adapts explanations to user's knowledge level and learning style
- **Classroom Generation:** Adjusts lesson difficulty, pacing, and example types based on profile and prior coverage
- **Quiz:** Targets weak areas; avoids re-testing demonstrated mastery
- **TutorBot:** Each bot inherits shared memory but maintains its own relationship context

### 4.4 Session Model

A session is a continuous learning context holding:
- Conversation history across activity switches
- Attached knowledge bases (which KBs are active for RAG)
- Activity trail (what the user did in order)
- Artifacts (generated classrooms, quiz results, co-writer documents, research reports)

Sessions are persistent — pause and resume anytime. Fluid activity switching: the user never "leaves" to switch modes. Context carries forward across every transition.

## 5. Feature Modules

### 5.1 Chat Module

**Modes (shared thread, switch freely):**
- **Chat** — Fluid conversation with RAG retrieval, web search, code execution, brainstorming, deep reasoning, paper search. Tools are decoupled — user decides which to enable.
- **Deep Solve** — Multi-agent problem solving: plan → investigate → solve → verify. Source citations at every step.
- **Deep Research** — Decompose topic → parallel research agents across RAG, web, academic papers → fully cited report.
- **Vision Solver** — Upload photo of a problem → AI solves it with visual reasoning.
- **Visualize** — Chart.js/SVG rendering pipeline + Mermaid diagram support within chat.

**Rendering:** Rich markdown with KaTeX math, Shiki code highlighting, Mermaid diagrams, streaming via streamdown.

### 5.2 Classroom Module

**Lesson Generation:**
- Two-stage pipeline: outline generation → scene content generation
- Generates from knowledge base documents (document-first) or topic description
- Scene types: slides, quizzes, interactive HTML simulations, project-based learning (PBL)

**Multi-Agent Orchestration:**
- LangGraph state machine managing agent turns
- Director graph controls who speaks when
- AI teacher + AI classmates with configurable personas
- Agent avatars with visual identity and info bar

**Interaction Modes:**
- Classroom Discussion — agents proactively discuss; user can jump in or get called on
- Roundtable Debate — multiple agents with different personas debate with whiteboard illustrations
- Q&A Mode — free-form questions; AI responds with slides, diagrams, or whiteboard drawings

**Slide Renderer:**
- Canvas-based editor with element types: text, image, shape, table, chart, LaTeX formulas
- ProseMirror rich text editing within slides
- Spotlight and laser pointer effects

**Whiteboard:**
- SVG-based drawing surface
- Agents draw in real time: equations step by step, flowcharts, diagrams, shapes, charts

**Playback Engine:**
- State machine: idle → playing → live
- Controls classroom flow, timing, transitions
- Immersive mode (fullscreen distraction-free)

**Action Engine:**
- 28+ action types: speech, whiteboard draw/text/shape/chart, spotlight, laser pointer, animations, transitions
- Orchestrated execution tied to playback state

**Voice:**
- TTS narration with multiple providers and customizable voices
- ASR speech recognition for talking to AI teachers

### 5.3 Quiz Module

- Generate quizzes from knowledge base with validation
- Question types: single choice, multiple choice, short answer
- AI grading with detailed feedback
- Duplicate prevention with generation history
- Question Notebook: unified review with bookmarks, categories, follow-up discussion on wrong answers
- Performance tracking feeds into memory (weak areas noted)

### 5.4 Co-Writer Module

- Full-featured Markdown editor with AI as first-class collaborator
- Select text → rewrite, expand, shorten — with KB and web context
- Non-destructive editing with full undo/redo
- Save to notebooks, export as Markdown
- ProseMirror-based editor (reused from classroom slides)

### 5.5 Guided Learning Module

- AI designs 3–5 progressive knowledge points from user materials
- Each point becomes a rich visual HTML page with explanations, diagrams, examples
- Contextual Q&A alongside each step for deeper exploration
- Progress summary upon completion
- Persistent sessions — pause, resume, revisit any step

### 5.6 TutorBot Module

- Autonomous persistent agents, each with independent workspace
- Soul templates: define personality, tone, teaching philosophy (Socratic, encouraging, rigorous, or custom)
- Proactive heartbeat: study check-ins, review reminders, scheduled tasks — tutor initiates, not just responds
- Full tool access: RAG, code execution, web search, academic papers, deep reasoning, brainstorming
- Skill learning: add skill files to a bot's workspace to teach new abilities
- Multi-channel presence: Telegram, Discord, Slack, Feishu, WeChat Work, DingTalk, Email
- Team & sub-agents: spawn background sub-agents or orchestrate multi-agent teams within a bot

### 5.7 Math Animator Module

- Turn mathematical concepts into visual animations and storyboards
- Manim-powered rendering (optional Python microservice — the one exception to the TypeScript monolith)
- Retry manager for robust generation
- Visual review pipeline

### 5.8 Export Module

- PPTX: editable slides with images, charts, LaTeX formulas (MathML→OMML conversion via workspace package)
- HTML: self-contained interactive web pages with simulations
- Markdown: from co-writer, notebooks, research reports

### 5.9 CLI Module

- Interactive REPL with live mode switching
- One-shot capability execution from terminal
- Knowledge base lifecycle management (create, add, search, delete)
- Session, memory, notebook management
- TutorBot management (create, start, stop)
- Dual output: rich terminal rendering for humans, structured JSON for AI agents and pipelines
- SKILL.md at project root for autonomous AI agent operation

### 5.10 OpenClaw Integration

- Generate classrooms from Feishu, Slack, Discord, Telegram, WhatsApp via AI assistant
- Hosted mode (access code) and self-hosted mode
- Async job submission + polling
- Skill installed via ClawHub

## 6. Tech Stack

### 6.1 Framework & Runtime

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| React | React 19 |
| Language | TypeScript 5 (strict) |
| Runtime | Node.js >= 20 |
| Package Manager | pnpm 10 (workspace support) |

### 6.2 AI & LLM

| Purpose | Choice |
|---------|--------|
| LLM Abstraction | Vercel AI SDK 6 (@ai-sdk/*) |
| Agent Orchestration | LangGraph JS 1.1 (@langchain/langgraph) |
| Provider SDKs | @ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google + openai SDK (compat endpoints) |
| Validation | Zod 4 |

### 6.3 UI & Styling

| Purpose | Choice |
|---------|--------|
| CSS | Tailwind CSS 4 |
| Component Library | shadcn/ui + Radix UI primitives |
| Icons | Lucide React |
| Animations | Motion (Framer Motion 12) |
| Theming | next-themes |
| Toasts | Sonner |

### 6.4 Data & Storage

| Purpose | Choice |
|---------|--------|
| State Management | Zustand 5 |
| Immutable Updates | Immer 11 |
| Local DB | Dexie 4 (IndexedDB) |
| Vector Search (local) | In-memory cosine similarity over Dexie-stored embeddings |
| Cloud DB (Phase 6) | Supabase (Postgres + pgvector + Auth + Storage) |

### 6.5 Content & Rendering

| Purpose | Choice |
|---------|--------|
| Math Rendering | KaTeX + Temml |
| Code Highlighting | Shiki 3 |
| Rich Text Editor | ProseMirror |
| Charts | ECharts 6 |
| PDF Parsing | unpdf + MinerU (optional) |
| PPTX Parsing | pptxtojson |
| PPTX Export | pptxgenjs (customized workspace package) |
| MathML→OMML | mathml2omml (workspace package) |
| Streaming Markdown | streamdown |
| JSON Repair | jsonrepair + partial-json |

### 6.6 Utilities & Infrastructure

| Purpose | Choice |
|---------|--------|
| i18n | i18next + react-i18next |
| ID Generation | nanoid |
| Event Bus | mitt |
| Utilities | lodash (selective), clsx, tailwind-merge |
| Image Processing | sharp, @napi-rs/canvas |
| File Export | file-saver, jszip |
| Testing | Vitest (unit/integration) + Playwright (E2E) |
| Linting | ESLint 9 + Prettier |
| Containerization | Docker + docker-compose |

## 7. Project Structure

```
btr-gpt-tutor/
├── app/                              # Next.js App Router
│   ├── api/                          # All API routes
│   │   ├── chat/                     # Chat streaming (all modes)
│   │   ├── knowledge/                # KB CRUD, upload, search, embed
│   │   ├── classroom/                # Generation pipeline, playback
│   │   │   ├── generate/             # Outline + scene generation
│   │   │   ├── generate-classroom/   # Async job submission + polling
│   │   │   └── chat/                 # Multi-agent discussion (SSE)
│   │   ├── quiz/                     # Quiz generation, grading
│   │   ├── guide/                    # Guided learning plans + pages
│   │   ├── research/                 # Deep research pipeline
│   │   ├── solve/                    # Deep solve multi-agent
│   │   ├── co-writer/                # AI edit operations
│   │   ├── tutorbot/                 # Bot CRUD, heartbeat, channels
│   │   ├── notebook/                 # Notebook CRUD, records
│   │   ├── memory/                   # Profile + progress read/update
│   │   ├── session/                  # Session CRUD, history
│   │   ├── media/                    # TTS, ASR, image gen, video gen
│   │   ├── search/                   # Web search, academic papers
│   │   ├── export/                   # PPTX, HTML, Markdown export
│   │   └── parse/                    # PDF, PPTX, Markdown parsing
│   ├── (workspace)/                  # Workspace layout group
│   │   ├── page.tsx                  # Home — KB overview + quick actions
│   │   ├── chat/                     # Chat page (all modes)
│   │   ├── classroom/[id]/           # Classroom playback page
│   │   ├── co-writer/                # Co-Writer editor page
│   │   ├── guide/                    # Guided learning page
│   │   ├── tutorbot/                 # TutorBot management + chat
│   │   └── layout.tsx                # Sidebar + workspace chrome
│   ├── (utility)/                    # Utility layout group
│   │   ├── knowledge/                # KB management page
│   │   ├── notebook/                 # Notebook browser page
│   │   ├── memory/                   # Memory viewer page
│   │   ├── settings/                 # Settings page
│   │   └── layout.tsx                # Utility chrome
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles + Tailwind
│
├── lib/                              # Core business logic
│   ├── core/                         # Shared core
│   │   ├── knowledge/                # Parse → chunk → embed → retrieve
│   │   ├── memory/                   # Profile + progress management
│   │   ├── session/                  # Session lifecycle + context
│   │   ├── ai/                       # LLM providers, streaming, embeddings
│   │   ├── storage/                  # Repository interfaces + Dexie impl
│   │   ├── search/                   # Web search + academic papers
│   │   ├── media/                    # TTS, ASR, image, video providers
│   │   ├── plugin/                   # Tool + capability registration
│   │   └── types/                    # Shared TypeScript types
│   ├── chat/                         # Chat module logic
│   ├── classroom/                    # Classroom module logic
│   │   ├── generation/               # Outline + scene generation pipeline
│   │   ├── orchestration/            # LangGraph multi-agent director
│   │   ├── playback/                 # Playback state machine
│   │   ├── action/                   # Action execution engine
│   │   ├── api/                      # Stage API facade
│   │   └── prompts/                  # Generation + discussion prompts
│   ├── quiz/                         # Quiz module logic
│   ├── guide/                        # Guided learning logic
│   ├── co-writer/                    # Co-writer AI operations
│   ├── tutorbot/                     # TutorBot engine, souls, heartbeat
│   ├── notebook/                     # Notebook logic
│   ├── export/                       # PPTX, HTML, Markdown export
│   ├── audio/                        # TTS + ASR provider wrappers
│   ├── i18n/                         # Internationalization
│   ├── hooks/                        # React custom hooks
│   ├── store/                        # Zustand stores (sliced per module)
│   └── utils/                        # Shared utilities
│
├── components/                       # React UI components
│   ├── ui/                           # Base primitives (shadcn/ui)
│   ├── chat/                         # Chat area, mode switcher, tools
│   ├── classroom/                    # Slide renderer, scene renderers
│   │   ├── slide-renderer/           # Canvas editor + element renderers
│   │   ├── scene-renderers/          # Quiz, interactive, PBL renderers
│   │   ├── whiteboard/               # SVG whiteboard
│   │   └── agent/                    # Agent avatar, config, info bar
│   ├── quiz/                         # Quiz viewer, config, Q notebook
│   ├── guide/                        # Guided learning pages + nav
│   ├── co-writer/                    # Markdown editor + AI toolbar
│   ├── tutorbot/                     # Bot list, chat, soul editor
│   ├── knowledge/                    # KB manager, upload, search
│   ├── notebook/                     # Notebook browser, record viewer
│   ├── memory/                       # Profile + progress viewer
│   ├── settings/                     # Provider config, TTS, ASR, media
│   ├── sidebar/                      # Navigation sidebar
│   ├── audio/                        # Audio player, recorder, controls
│   ├── generation/                   # Lesson generation toolbar
│   └── common/                       # Markdown renderer, modals, etc.
│
├── packages/                         # Workspace packages
│   ├── pptxgenjs/                    # Customized PPTX generation
│   └── mathml2omml/                  # MathML → Office Math conversion
│
├── configs/                          # Shared constants
├── public/                           # Static assets
├── e2e/                              # Playwright E2E tests
├── tests/                            # Vitest unit/integration tests
├── scripts/                          # Build, setup, dev scripts
└── skills/                           # OpenClaw / SKILL.md integration
```

## 8. Build Phases

### Phase 1: Foundation + Knowledge + Chat
**Delivers:** A smart RAG-powered tutor

- Next.js 16 scaffold + Tailwind 4 + shadcn/ui
- LLM provider abstraction (AI SDK)
- Knowledge layer: upload → parse → chunk → embed → vector store (Dexie)
- Chat with RAG retrieval + streaming + citations
- Memory layer: learner profile + learning progress
- Session persistence
- Storage layer: repository pattern over IndexedDB
- Settings panel (provider config, model selection)
- Dark mode + i18n skeleton

### Phase 2: Study Depth
**Delivers:** Full personal study platform

- Deep Solve mode (multi-agent problem solving)
- Deep Research mode (parallel agents → cited report)
- Quiz generation + AI grading + Question Notebook
- Guided Learning (learning plans → interactive pages → Q&A)
- Notebooks (color-coded, categorized, save from any activity)
- Web search integration (Tavily, Brave, DuckDuckGo, etc.)
- Vision Solver
- Visualize (Chart.js/SVG/Mermaid)
- Plugin system (tools + capabilities)

### Phase 3: Classroom Engine
**Delivers:** AI-led classroom from your documents

- Lesson generation pipeline (outline → scenes) from KB documents
- Canvas-based slide renderer
- Multi-agent orchestration (LangGraph director graph)
- Playback engine (state machine)
- Action engine (speech, whiteboard basics, spotlight, laser)
- Classroom discussion + Q&A mode
- TTS narration (multi-provider)
- ASR speech recognition
- Agent avatars and persona config

### Phase 4: Classroom Polish + Co-Writer
**Delivers:** Rich immersive classroom + writing tool

- SVG whiteboard (real-time agent drawing)
- Roundtable debate
- Interactive HTML simulations
- Project-Based Learning (PBL)
- Immersive mode
- Co-Writer module (AI Markdown editor)
- ProseMirror rich text editing for slides

### Phase 5: TutorBot + Export + Integrations
**Delivers:** Autonomous tutors + full ecosystem

- TutorBot (soul templates, workspace, heartbeat, skills, teams)
- Multi-channel presence (Telegram, Discord, Slack, Feishu, etc.)
- PPTX export (editable slides with LaTeX→OMML)
- HTML export (self-contained interactive pages)
- Markdown export
- Math Animator (optional Python microservice)
- Image + video generation
- CLI interface (REPL + one-shot + JSON + SKILL.md)
- OpenClaw integration

### Phase 6: Multi-User + Polish
**Delivers:** Platform-ready

- Auth system (access code → full user accounts)
- Storage migration (IndexedDB → Supabase/Postgres + S3)
- Multi-user data isolation
- Shareable classrooms
- Performance optimization
- Additional themes
- Extended i18n (8+ languages)

## 9. User Model

**Phase 1–5:** Personal, single-user. Runs locally or self-hosted. No auth required. Data lives on the user's machine via IndexedDB.

**Phase 6:** Multi-user platform. Auth via Supabase. User accounts, data isolation, shareable content. Deployable for schools, teams, or SaaS.

The repository pattern in the storage layer ensures this transition requires zero changes to module code — only the storage implementation is swapped.

## 10. Inspiration Projects

### OpenMAIC (Open Multi-Agent Interactive Classroom)
- **Source:** `inspiration/OpenMAIC/`
- **License:** AGPL-3.0
- **Contributes:** Classroom engine (slides, whiteboard, playback, action system, multi-agent orchestration), lesson generation pipeline, TTS/ASR, media generation, PPTX/HTML export, OpenClaw integration
- **Tech reuse:** Next.js 16, AI SDK, LangGraph JS, Zustand, Dexie, ProseMirror, ECharts, KaTeX, Shiki, pptxgenjs, mathml2omml

### DeepTutor (Agent-Native Personalized Tutoring)
- **Source:** `inspiration/DeepTutor/`
- **License:** Apache-2.0
- **Contributes:** RAG knowledge base, persistent memory, chat modes (Deep Solve, Deep Research), quiz generation, guided learning, co-writer, TutorBot, notebooks, CLI, plugin system, session management
- **Tech reuse:** Concepts and patterns reimplemented in TypeScript (original is Python)
