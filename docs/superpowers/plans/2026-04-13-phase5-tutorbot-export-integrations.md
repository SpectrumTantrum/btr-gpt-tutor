# Phase 5: TutorBot + Export + Integrations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add autonomous TutorBot agents with personality and heartbeat, PPTX/HTML/Markdown export, CLI interface, and multi-channel bot presence via nanoclaw (nanobot ecosystem).

**Architecture:** New `lib/tutorbot/` module for autonomous agent engine (soul templates, workspace, heartbeat, skills). New `lib/export/` module for PPTX/HTML/Markdown export. CLI entry point via `lib/cli/`. Multi-channel integration uses nanoclaw (HKUDS/nanobot) instead of OpenClaw.

**Tech Stack:** Existing stack + pptxgenjs (PPTX export), file-saver (client download), jszip (HTML bundling)

**Phase 4 baseline:** 126 unit tests, 17 E2E tests, all passing.

**Note:** Uses nanoclaw (from HKUDS/nanobot ecosystem) for messaging integrations, NOT OpenClaw.

---

## Task 1: TutorBot Types + Storage

Modify: `lib/core/types/index.ts`, `lib/core/storage/db.ts`, `lib/core/storage/repository.ts`
Create: `lib/core/storage/tutorbot-repo.ts`
Test: `tests/lib/core/storage/tutorbot-repo.test.ts`

Add types: TutorBot, SoulTemplate, TutorBotStatus, BotSkill, HeartbeatConfig. Add Dexie table + TutorBotRepository with CRUD + TDD (4 tests).

---

## Task 2: TutorBot Engine + Soul System

Create: `lib/tutorbot/tutorbot-engine.ts`, `lib/tutorbot/soul-templates.ts`, `lib/tutorbot/prompts.ts`
Test: `tests/lib/tutorbot/tutorbot-engine.test.ts`

TutorBotEngine: create bot, load soul, generate response with personality. Built-in soul templates (Socratic, Encouraging, Rigorous). 5 tests.

---

## Task 3: TutorBot Heartbeat + Skills

Create: `lib/tutorbot/heartbeat.ts`, `lib/tutorbot/skill-loader.ts`
Test: `tests/lib/tutorbot/heartbeat.test.ts`

Heartbeat: scheduled check-ins via setInterval. Skill loader: reads skill definitions, registers as bot capabilities. 4 tests.

---

## Task 4: Export Module — PPTX

Create: `lib/export/pptx-exporter.ts`
Test: `tests/lib/export/pptx-exporter.test.ts`

Install pptxgenjs + file-saver. Export classroom scenes to PPTX slides. 3 tests.

---

## Task 5: Export Module — HTML + Markdown

Create: `lib/export/html-exporter.ts`, `lib/export/markdown-exporter.ts`
Test: `tests/lib/export/html-exporter.test.ts`

HTML: bundle scenes as self-contained HTML page. Markdown: export notebooks/research/co-writer as .md. 3 tests.

---

## Task 6: CLI Entry Point

Create: `lib/cli/main.ts`, `lib/cli/commands/chat.ts`, `lib/cli/commands/kb.ts`, `lib/cli/commands/bot.ts`, `lib/cli/commands/session.ts`, `lib/cli/commands/memory.ts`
Test: `tests/lib/cli/main.test.ts`

CLI with subcommands: chat (REPL), run (one-shot), kb (CRUD), bot (CRUD), session (list/open), memory (show/clear). Dual output (rich/json). 4 tests.

---

## Task 7: Nanoclaw Integration (Multi-Channel)

Create: `lib/tutorbot/channels/nanoclaw-adapter.ts`, `lib/tutorbot/channels/types.ts`
Test: `tests/lib/tutorbot/channels/nanoclaw-adapter.test.ts`

Channel adapter interface for nanoclaw/nanobot. Supports Telegram, Discord, Slack, Feishu. 3 tests.

---

## Task 8: API Routes + Stores

Create: `app/api/tutorbot/route.ts`, `app/api/tutorbot/[id]/route.ts`, `app/api/tutorbot/[id]/chat/route.ts`, `app/api/export/pptx/route.ts`, `app/api/export/html/route.ts`, `lib/store/tutorbot-store.ts`

TutorBot CRUD + chat endpoints. Export endpoints for PPTX/HTML download.

---

## Task 9: TutorBot UI + Export UI + Pages

Create: `components/tutorbot/bot-list.tsx`, `components/tutorbot/bot-chat.tsx`, `components/tutorbot/soul-editor.tsx`, `components/tutorbot/bot-config.tsx`, `components/export/export-dialog.tsx`
Create: `app/(workspace)/tutorbot/page.tsx`, `app/(workspace)/tutorbot/[id]/page.tsx`
Modify: `components/sidebar/sidebar-nav.tsx`, classroom page (add export button)

---

## Task 10: SKILL.md + Project Config

Create: `SKILL.md` at project root — enables AI agents to operate btr-gpt-tutor autonomously.

---

## Task 11: E2E Tests + Final Verification + Push

Create: `e2e/tutorbot.test.ts`, `e2e/export.test.ts`

E2E tests for TutorBot page and export. Full suite verification + push to GitHub.

---

## Summary

| Component | Tests | Description |
|-----------|-------|-------------|
| TutorBot storage | 4 | Dexie repo for bots |
| TutorBot engine + souls | 5 | Autonomous agent with personality |
| Heartbeat + skills | 4 | Scheduled check-ins, learnable abilities |
| PPTX export | 3 | Classroom to PowerPoint |
| HTML + MD export | 3 | Self-contained HTML + Markdown |
| CLI | 4 | REPL + one-shot + management |
| Nanoclaw channels | 3 | Multi-channel adapter |
| API routes + stores | — | 5 endpoints + TutorBot store |
| UI | — | Bot list, chat, soul editor, export dialog |
| E2E | ~3 | TutorBot + export navigation |

**Total: ~26 new unit tests + ~3 E2E tests, 5 new API endpoints, 2 new pages.**
