# Phase 4: Classroom Polish + Co-Writer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the classroom with SVG whiteboard, roundtable debate, interactive simulations, PBL, and immersive mode. Add the Co-Writer AI Markdown editor as a new workspace feature.

**Architecture:** Extends `lib/classroom/` with whiteboard subsystem (SVG rendering + drawing commands), new scene renderers (interactive, PBL), and roundtable orchestration mode. New `lib/co-writer/` module for AI-assisted Markdown editing. Immersive mode as a layout toggle in the classroom page.

**Tech Stack:** Existing stack (no new major dependencies)

**Phase 3 baseline:** 108 unit tests, 15 E2E tests, all passing.

---

## Task 1: Whiteboard Types + SVG Engine

**Files:**
- Modify: `lib/core/types/index.ts`
- Create: `lib/classroom/whiteboard/whiteboard-engine.ts`
- Test: `tests/lib/classroom/whiteboard/whiteboard-engine.test.ts`

7 tests: empty strokes, add pen stroke, add text, add shape, clear, remove by id, SVG path generation.

---

## Task 2: Whiteboard UI + Action Handlers

**Files:**
- Create: `components/classroom/whiteboard/whiteboard-canvas.tsx`, `components/classroom/whiteboard/whiteboard-toolbar.tsx`, `lib/classroom/action/whiteboard-handler.ts`
- Modify: `app/(workspace)/classroom/[id]/page.tsx`

---

## Task 3: Roundtable Debate Orchestrator

**Files:**
- Create: `lib/classroom/orchestration/roundtable.ts`
- Test: `tests/lib/classroom/orchestration/roundtable.test.ts`

5 tests: moderator first, rotation, wrap-around, history tracking, debate prompt.

---

## Task 4: Interactive Simulation + PBL Scene Renderers

**Files:**
- Create: `components/classroom/scene-renderers/interactive-renderer.tsx`, `components/classroom/scene-renderers/pbl-renderer.tsx`
- Modify: `lib/core/types/index.ts` (PBLData type)
- Test: `tests/lib/classroom/generation/scene-types.test.ts`

2 tests on scene type prompt differentiation.

---

## Task 5: Immersive Mode

**Files:**
- Create: `components/classroom/immersive-wrapper.tsx`
- Modify: `app/(workspace)/classroom/[id]/page.tsx`

---

## Task 6: Co-Writer Service + Prompts

**Files:**
- Modify: `lib/core/types/index.ts` (CoWriterOperation, CoWriterRequest)
- Create: `lib/co-writer/co-writer-service.ts`, `lib/co-writer/prompts.ts`
- Test: `tests/lib/co-writer/co-writer-service.test.ts`

4 tests: rewrite, expand, shorten, summarize prompts.

---

## Task 7: Co-Writer API Route + Store

**Files:**
- Create: `app/api/co-writer/route.ts`, `lib/store/co-writer-store.ts`

---

## Task 8: Co-Writer UI + Page

**Files:**
- Create: `components/co-writer/editor.tsx`, `components/co-writer/ai-toolbar.tsx`, `components/co-writer/kb-selector.tsx`
- Create: `app/(workspace)/co-writer/page.tsx`
- Modify: `components/sidebar/sidebar-nav.tsx`

---

## Task 9: E2E Tests + Final Verification + Push

**Files:**
- Create: `e2e/co-writer.test.ts`

3 E2E tests + full suite verification + push to GitHub.

---

## Summary

| Component | Tests | Description |
|-----------|-------|-------------|
| Whiteboard engine | 7 | SVG stroke management + path generation |
| Whiteboard UI | — | SVG canvas, drawing tools, action handlers |
| Roundtable debate | 5 | Multi-persona debate orchestrator |
| Interactive + PBL renderers | 2 | Sandboxed HTML sims, role-based PBL |
| Immersive mode | — | Fullscreen distraction-free classroom |
| Co-Writer prompts | 4 | Rewrite, expand, shorten, summarize |
| Co-Writer API + store | — | SSE endpoint + undo history |
| Co-Writer UI | — | Editor, AI toolbar, KB selector |
| E2E tests | ~3 | Navigation + feature verification |

**Total: ~18 new unit tests + ~3 E2E tests, 1 new API endpoint, 1 new page.**
