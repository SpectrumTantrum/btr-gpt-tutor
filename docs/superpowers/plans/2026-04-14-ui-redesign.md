# UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the academic parchment UI with a modern Teal Sage + Coral palette, two-pane sidebar (icon rail + context panel + main), Inter/JetBrains Mono typography, and 10 additional shadcn/ui components.

**Architecture:** Pure presentational migration. No feature logic, data model, API, or test framework changes. Token swap in `app/globals.css`, new custom components under `components/sidebar/` + `components/app-shell.tsx` + `components/page-header.tsx`, migrate workspace and utility layouts to a single unified `AppShell`.

**Tech Stack:** Next.js 16 + Tailwind 4 + shadcn/ui + Zustand. Add Inter + JetBrains Mono via `next/font/google`. Add 10 shadcn components.

**Spec:** `docs/superpowers/specs/2026-04-14-ui-redesign-design.md`.

**Baseline:** 166 unit tests, 22 E2E tests, all passing.

---

## Task 1: Install New Fonts + shadcn Components

- [ ] **Step 1: Install 10 new shadcn components**

Run: `pnpm dlx shadcn@latest add sidebar avatar tooltip dropdown-menu sheet popover command skeleton breadcrumb sonner`

Expected: 10 new files under `components/ui/`. If `sonner.tsx` already exists, shadcn will overwrite.

- [ ] **Step 2: Swap fonts in app/layout.tsx**

Replace `app/layout.tsx` entirely:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "btr-gpt-tutor",
  description: "AI-powered learning platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
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

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx components/ui/ package.json pnpm-lock.yaml
git commit -m "feat(ui): install 10 new shadcn components and swap to Inter + JetBrains Mono"
```

---

## Task 2: Swap Globals.css Theme Tokens

Rewrite `app/globals.css` with the Teal Sage + Coral palette. Full replacement including: all light-mode tokens (`--primary` teal, `--accent` coral, `--background` mint, `--foreground` deep pine), all dark-mode tokens, sidebar tokens (`--sidebar` teal gradient), context panel tokens (`--context-panel`, `--context-active`), `@theme inline` block mapping tokens, base styles, and utility classes (`.eyebrow`, `.display`, `.caption`, `.reading-column`, `.teal-gradient`, `.card-shadow`). Remove all academic utilities (`.academic-body`, `.rule-fleuron`, `.footnote-marker`, drop-cap) and the Glass theme. Exact token values are in spec §3.

- [ ] **Step 1: Replace globals.css** — use the full CSS from spec §3.1, §3.2, §4.3.
- [ ] **Step 2: Verify** — `pnpm build && pnpm test` — all 166 tests pass, build succeeds.
- [ ] **Step 3: Commit** — `git add app/globals.css && git commit -m "feat(ui): swap globals.css to Teal Sage + Coral palette"`

---

## Task 3: Build IconRail Component

- [ ] **Step 1: Write E2E test first** at `e2e/icon-rail.test.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("icon rail is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("complementary", { name: /primary navigation/i })).toBeVisible();
});

test("icon rail has all 9 nav items", async ({ page }) => {
  await page.goto("/");
  const rail = page.getByRole("complementary", { name: /primary navigation/i });
  for (const label of ["Home", "Chat", "Classroom", "Knowledge", "Co-Writer", "Guide", "Notebook", "TutorBot", "Settings"]) {
    await expect(rail.getByRole("link", { name: label })).toBeVisible();
  }
});

test("clicking a nav icon navigates to the page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("complementary", { name: /primary navigation/i }).getByRole("link", { name: "Chat" }).click();
  await expect(page).toHaveURL(/\/chat/);
});
```

- [ ] **Step 2: Create `components/sidebar/icon-rail.tsx`** — teal gradient column (56px wide) with brand mark + 8 nav icons + spacer + Settings + UserAvatarButton. Uses shadcn `Tooltip` for hover labels. Active state = white/20 pill. Import `usePathname`, Lucide icons (Home, MessageSquare, GraduationCap, BookOpen, PenLine, Compass, NotebookPen, Bot, Settings).

- [ ] **Step 3: Create `components/sidebar/user-avatar-button.tsx`** — shadcn `Avatar` with fallback (first letter of email), coral background, 32px circle. Reads from `useAuthStore`.

- [ ] **Step 4: Commit** — `git add components/sidebar/icon-rail.tsx components/sidebar/user-avatar-button.tsx e2e/icon-rail.test.ts && git commit -m "feat(ui): add IconRail with tooltips and user avatar"`

---

## Task 4: Build ContextPanel + Section Primitives

- [ ] **Step 1: Create `components/sidebar/context-panel-section.tsx`** — reusable wrapper with title + optional "+" create button + scrollable children. Uses shadcn `Button` size sm.

- [ ] **Step 2: Create `components/sidebar/context-panel.tsx`** — 240px aside with `--context-panel` background. Uses `usePathname` to route to the right section: Home / Chat / Classroom / Knowledge / Co-Writer / Guide / Notebook / TutorBot / Settings. Each section function returns a `<ContextPanelSection>` with appropriate content. Hidden on mobile (`hidden md:block`).

- [ ] **Step 3: Commit** — `git add components/sidebar/ && git commit -m "feat(ui): add ContextPanel with section-aware routing"`

---

## Task 5: Build Section-Specific List Components

- [ ] **Step 1: Create `components/sidebar/sessions-list.tsx`** — groups chat sessions by date (Today / Yesterday / Earlier). Fetches from `/api/session`. Uses `useSessionStore`. Active session has `--context-active` background + 2px teal left border. Shows shadcn `Skeleton` when loading.

- [ ] **Step 2: Create `components/sidebar/knowledge-list.tsx`** — list of knowledge bases from `useKnowledgeStore` fetching `/api/knowledge`. Each item shows name + doc/chunk counts. Shadcn `Skeleton` for loading.

- [ ] **Step 3: Create `components/sidebar/classrooms-list.tsx`** — fetches `/api/classroom`, local state, shows classroom title + scene count + status. `Skeleton` for loading.

- [ ] **Step 4: Wire into ContextPanel** — update `context-panel.tsx` to import and use list components inside `ChatSection`, `KnowledgeSection`, `ClassroomSection`. Pass `onCreate` handlers that route to the respective main page.

- [ ] **Step 5: Commit** — `git add components/sidebar/ && git commit -m "feat(ui): add SessionsList, KnowledgeList, ClassroomsList for context panel"`

---

## Task 6: Build AppShell + PageHeader

- [ ] **Step 1: Create `components/app-shell.tsx`** — wraps children with IconRail + ContextPanel + main:

```tsx
import { IconRail } from "@/components/sidebar/icon-rail";
import { ContextPanel } from "@/components/sidebar/context-panel";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <IconRail />
      <ContextPanel />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/page-header.tsx`** — `eyebrow + title + actions` primitive. Title 22px Inter 600. Eyebrow uppercase 10px with tracking. Action slot at the right.

- [ ] **Step 3: Commit** — `git add components/app-shell.tsx components/page-header.tsx && git commit -m "feat(ui): add AppShell layout wrapper and PageHeader primitive"`

---

## Task 7: Migrate Workspace + Utility Layouts to AppShell

- [ ] **Step 1: Replace `app/(workspace)/layout.tsx`:**

```tsx
import { AppShell } from "@/components/app-shell";
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 2: Replace `app/(utility)/layout.tsx`** with the same pattern (AppShell wrapper).

- [ ] **Step 3: Verify dev server** — run `pnpm dev`, open `http://localhost:3000`. Expected: icon rail on left, context panel showing Home section, main workspace in center.

- [ ] **Step 4: Commit** — `git add app/(workspace)/layout.tsx app/(utility)/layout.tsx && git commit -m "feat(ui): migrate workspace + utility layouts to AppShell"`

---

## Task 8: Build Command Palette (⌘K)

- [ ] **Step 1: Create `lib/hooks/use-command-palette.ts`** — hook managing open state + keydown listener for ⌘K / Ctrl+K.

- [ ] **Step 2: Create `components/command-palette.tsx`** — uses shadcn `CommandDialog` with a single "Navigate" group listing all 9 primary routes. Clicking an item calls `router.push(path)` and closes the dialog.

- [ ] **Step 3: Mount in AppShell** — update `components/app-shell.tsx` to include `<CommandPalette />` at the end of the wrapper.

- [ ] **Step 4: Commit** — `git add components/command-palette.tsx lib/hooks/use-command-palette.ts components/app-shell.tsx && git commit -m "feat(ui): add ⌘K command palette with navigation shortcuts"`

---

## Task 9: Delete Old Sidebar Component

- [ ] **Step 1: Delete** — `git rm components/sidebar/sidebar-nav.tsx`
- [ ] **Step 2: Verify no remaining imports** — `grep -r "sidebar-nav\|SidebarNav" app/ components/ lib/ 2>/dev/null || echo "clean"` → expect "clean" (or nothing)
- [ ] **Step 3: Commit** — `git commit -m "refactor(ui): remove old sidebar-nav (replaced by IconRail + ContextPanel)"`

---

## Task 10: Wire User Avatar Dropdown

- [ ] **Step 1: Update `components/sidebar/user-avatar-button.tsx`** to wrap the avatar in shadcn `DropdownMenu`. Items:
  - Label (user email or "Personal Mode")
  - Separator
  - "Settings" → routes to /settings
  - "Sign out" (only if `isMultiUserMode()` returns true) → calls `supabase.auth.signOut()`, `clearUser()`, routes to /login

- [ ] **Step 2: Commit** — `git add components/sidebar/user-avatar-button.tsx && git commit -m "feat(ui): wire user avatar to dropdown with settings and sign-out"`

---

## Task 11: Update E2E Tests for New Structure

- [ ] **Step 1: Replace `e2e/smoke.test.ts`** with 3 tests: (1) home page title, (2) icon rail shows all 9 nav links, (3) context panel visible on desktop (1280x800).

- [ ] **Step 2: Replace `e2e/navigation.test.ts`** with 3 tests that click icon rail nav items (scoped to `complementary[name="primary navigation"]`) and verify URL changes.

- [ ] **Step 3: Verify other tests still pass** — run `pnpm test:e2e e2e/notebook.test.ts e2e/guide.test.ts e2e/classroom.test.ts e2e/tutorbot.test.ts e2e/co-writer.test.ts`. They use `getByRole("main")` already and should work unchanged.

- [ ] **Step 4: Create `e2e/command-palette.test.ts`** with 2 tests: (1) ⌘K / Ctrl+K opens the palette (input visible), (2) clicking "Chat" option navigates to `/chat`.

- [ ] **Step 5: Run all E2E** — `pnpm test:e2e`. Fix any failures by aligning component to spec, not by loosening tests.

- [ ] **Step 6: Commit** — `git add e2e/ && git commit -m "test(ui): update E2E tests for IconRail + ContextPanel + command palette"`

---

## Task 12: Final Verification + Push

- [ ] **Step 1: Full test suite** — `pnpm test && pnpm test:e2e`. Expected: 166 unit tests + ~27 E2E tests all pass.
- [ ] **Step 2: Production build** — `pnpm build`. Expected: no new warnings.
- [ ] **Step 3: Manual verification** — `pnpm dev`, check: teal gradient icon rail, context panel section changes per route, cards have teal-tinted shadow, ⌘K opens palette, user avatar opens dropdown, dark mode toggle works.
- [ ] **Step 4: Final commit** — `git add -A && git commit -m "chore(ui): complete redesign"`
- [ ] **Step 5: Push** — `git push origin main`

---

## Summary

| Task | Deliverable |
|------|-------------|
| 1 | Inter + JetBrains Mono fonts + 10 new shadcn components |
| 2 | globals.css token swap (Teal Sage + Coral) |
| 3 | IconRail + UserAvatarButton (3 E2E tests) |
| 4 | ContextPanel + ContextPanelSection |
| 5 | SessionsList + KnowledgeList + ClassroomsList |
| 6 | AppShell + PageHeader |
| 7 | Migrate workspace + utility layouts |
| 8 | Command Palette (⌘K) (2 E2E tests) |
| 9 | Delete old sidebar-nav |
| 10 | User avatar dropdown |
| 11 | Update E2E tests (smoke, navigation, command-palette) |
| 12 | Final verify + push |

**Total: ~5 new E2E tests, 12 new components, 1 deleted, globals.css fully replaced, 2 layouts migrated. All 166 unit tests untouched.**
