# Phase 3: Classroom Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the immersive AI-led classroom — generate lessons from documents, present slides with voice narration, multi-agent discussion, and real-time user participation.

**Architecture:** New `lib/classroom/` module with five subsystems: generation pipeline (outline→scenes), slide renderer (HTML-based with element components), playback engine (state machine), action engine (executes speech/navigation/effects), and multi-agent orchestration (turn-based director). TTS/ASR providers added to `lib/core/media/`. Classroom data stored in Dexie via repository pattern. All subsystems communicate through Zustand store + mitt event bus.

**Tech Stack:** Existing stack + mitt (event bus)

**Phase 2 baseline:** 70 unit tests, 13 E2E tests, all passing.

---

## Task 1: Classroom Types

**Files:**
- Modify: `lib/core/types/index.ts`

- [ ] **Step 1: Add Classroom, Scene, Slide, Agent, Action types**

Append to `lib/core/types/index.ts`: Classroom, Scene, SlideData, SlideElement, SlideElementType, AgentConfig, ActionType, ClassroomAction, OutlineItem, GenerationProgress interfaces and types.

- [ ] **Step 2: Verify existing tests pass**
- [ ] **Step 3: Commit**

---

## Task 2: Classroom Storage

**Files:**
- Modify: `lib/core/storage/db.ts`, `lib/core/storage/repository.ts`
- Create: `lib/core/storage/classroom-repo.ts`
- Test: `tests/lib/core/storage/classroom-repo.test.ts`

4 tests: create/retrieve, update status+scenes, list, delete.

---

## Task 3: Generation Prompts + Outline Generator

**Files:**
- Create: `lib/classroom/generation/prompts.ts`, `lib/classroom/generation/outline-generator.ts`
- Test: `tests/lib/classroom/generation/outline-generator.test.ts`

4 tests on pure prompt functions.

---

## Task 4: Scene Generator + Generation Pipeline

**Files:**
- Create: `lib/classroom/generation/scene-generator.ts`, `lib/classroom/generation/generation-pipeline.ts`
- Test: `tests/lib/classroom/generation/generation-pipeline.test.ts`

2 tests: progress reporting, scene return.

---

## Task 5: Playback Engine

**Files:**
- Create: `lib/classroom/playback/types.ts`, `lib/classroom/playback/playback-engine.ts`
- Test: `tests/lib/classroom/playback/playback-engine.test.ts`

10 tests covering all state transitions.

---

## Task 6: Action Engine

**Files:**
- Create: `lib/classroom/action/action-types.ts`, `lib/classroom/action/action-engine.ts`
- Test: `tests/lib/classroom/action/action-engine.test.ts`

4 tests: handler dispatch, callbacks, sequence, missing handler.

---

## Task 7: Agent System + Multi-Agent Director

**Files:**
- Create: `lib/classroom/orchestration/agent-config.ts`, `lib/classroom/orchestration/director.ts`, `lib/classroom/orchestration/discussion.ts`, `lib/classroom/prompts/discussion-prompts.ts`
- Test: `tests/lib/classroom/orchestration/director.test.ts`

6 tests: first speaker, rotation, wrap-around, set speaker, list agents, identify teacher.

---

## Task 8: TTS + ASR Providers

**Files:**
- Create: `lib/core/media/tts-providers.ts`, `lib/core/media/asr-providers.ts`
- Test: `tests/lib/core/media/tts-providers.test.ts`

3 tests: request body, default voice, provider parsing.

---

## Task 9: API Routes + Zustand Store

**Files:**
- Create: `app/api/classroom/generate/route.ts`, `app/api/classroom/[id]/route.ts`, `app/api/classroom/chat/route.ts`, `app/api/media/tts/route.ts`, `lib/store/classroom-store.ts`

---

## Task 10: UI Components + Classroom Page

**Files:**
- Create: slide renderer components, playback controls, scene nav, agent components, discussion panel, generation toolbar, audio components, classroom page
- Modify: sidebar nav

---

## Task 11: E2E Tests + Final Verification

**Files:**
- Create: `e2e/classroom.test.ts`

2 E2E tests + full suite verification + push to GitHub.

---

## Summary

| Component | Tests | Description |
|-----------|-------|-------------|
| Classroom types | — | Classroom, Scene, SlideData, AgentConfig, ClassroomAction |
| Classroom storage | 4 | Dexie repository with CRUD |
| Generation prompts | 4 | Outline, scene, narration prompts |
| Generation pipeline | 2 | Outline → scene with progress |
| Playback engine | 10 | State machine |
| Action engine | 4 | Handler dispatch + sequence |
| Agent system | 6 | Director + discussion |
| TTS/ASR | 3 | OpenAI TTS + browser ASR |
| API routes | — | 4 endpoints |
| UI + E2E | 2 | Slide renderer, controls, discussion |

**Total: ~33 new unit tests + ~2 E2E tests.**
