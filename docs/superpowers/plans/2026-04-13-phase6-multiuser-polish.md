# Phase 6: Multi-User + Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make btr-gpt-tutor platform-ready with auth, Supabase storage, multi-user isolation, shareable classrooms, themes, and extended i18n.

**Architecture:** Supabase for auth + Postgres + pgvector + file storage. New repository implementations swap in via the existing repository pattern. Auth middleware protects API routes. Shareable classrooms via public link tokens.

**Tech Stack:** Existing stack + @supabase/supabase-js, @supabase/ssr

**Phase 5 baseline:** 156 unit tests, 19 E2E tests, all passing.

---

## Task 1: Supabase Setup + Auth

Install deps, add auth types, create Supabase client, auth middleware (3 tests).

## Task 2: Auth UI + Login Page

Login page, user menu, auth store.

## Task 3: Supabase Database Schema

SQL migration with all tables, user_id FK, RLS policies.

## Task 4: Supabase Repository Implementations

All repo interfaces implemented with Supabase client. Repository factory for Dexie/Supabase swap (3 tests).

## Task 5: Shareable Classrooms

Share tokens, public viewer page (3 tests).

## Task 6: Themes + Extended i18n

Glass theme, 5 language locale files, theme/language selectors.

## Task 7: API Route Auth Protection

Auth middleware on all mutation routes.

## Task 8: E2E Tests + Final Verification + Push

Auth + sharing E2E, full suite, push to GitHub.

---

## Summary

~12 new unit tests + ~3 E2E tests. Platform-ready.
