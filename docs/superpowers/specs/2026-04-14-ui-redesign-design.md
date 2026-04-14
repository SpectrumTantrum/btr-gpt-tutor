# btr-gpt-tutor UI Redesign — Design Specification

Replace the current "academic parchment" UI (ivory + oxblood, Georgia serif, drop caps, paper grain) with a fresh modern UI that combines DeepTutor's information architecture with OpenMAIC's polish, on a new Teal Sage + Coral palette built on shadcn/ui.

## 1. Vision

**One-line:** A calm, confident AI learning workspace — DeepTutor's focused structure, OpenMAIC's polished feel, with a palette that belongs to btr-gpt-tutor alone.

**Why redesign:**
- Current academic theme feels heavy and "old book." Users report it as "not very good."
- Sidebar only shows nav; there's no room for sessions, KBs, or classrooms. Context is buried.
- shadcn/ui polish is hidden under the custom academic layer.

**What changes:**
- Palette: Teal Sage gradient + Coral accent + Mint background + Deep Pine foreground.
- Typography: Inter (UI) + JetBrains Mono (code). No serif body. Drop cap removed.
- Layout: Two-pane sidebar — icon rail (56px) + context panel (240px) + main workspace.
- Context panel: section-aware — Chat shows sessions, Knowledge shows KBs, Classroom shows lessons, etc.
- Components: lean harder on shadcn/ui's built-ins (add 10 more components).

**What stays:**
- Modular monolith architecture (6 phases, 166 unit tests, 22 E2E tests) is untouched.
- All feature modules, API routes, stores, and data models are unchanged.
- Tailwind 4 + shadcn/ui foundation is kept; we swap palette tokens, not the stack.

## 2. Layout Architecture

### 2.1 Three Zones

```
┌──────┬──────────────┬─────────────────────────────────────┐
│ Icon │   Context    │                                     │
│ Rail │    Panel     │         Main Workspace              │
│ 56px │    240px     │            (flex-1)                 │
└──────┴──────────────┴─────────────────────────────────────┘
```

### 2.2 Icon Rail (56px)

- Teal gradient background (`#0d7a6f → #14a394` top-to-bottom).
- Always visible on desktop; collapses into a Sheet on mobile.
- Brand mark at top (32px rounded-8 white square with "b").
- 9 nav icons: Home, Chat, Classroom, Knowledge, Co-Writer, Guide, Notebook, TutorBot, Settings.
- Each icon: 36x36 rounded-8. Active item = `rgba(255,255,255,0.18)` pill background. Inactive = `rgba(255,255,255,0.7)`.
- Tooltip on hover shows label (shadcn `Tooltip`).
- User avatar at bottom (32px coral circle with initial).

### 2.3 Context Panel (240px)

- Background `#fcfdfc`. Right border `1px solid #e3ebe8`.
- Top row: section title + primary action (teal `+` button for new).
- Section-aware content:
  - **Home** → Quick actions + recent activity
  - **Chat** → Sessions grouped by date (Today, Yesterday, Earlier this week)
  - **Classroom** → Generated lessons
  - **Knowledge** → KB list with doc counts
  - **Co-Writer** → Saved drafts
  - **Guide** → Active guided plans
  - **Notebook** → Notebooks grid
  - **TutorBot** → Bot roster
  - **Settings** → Settings sections nav
- Active item: `#e8f4f1` background + `2px solid #0d7a6f` left border.
- `ScrollArea` for overflow. `Skeleton` for loading.

### 2.4 Main Workspace

- Background `#f4f7f6` (Mint).
- White cards with teal-tinted shadow: `0 1px 3px rgba(13,122,111,0.06), 0 1px 2px rgba(13,122,111,0.04)`.
- Page header: eyebrow + title (22px, Inter 600) + action bar.
- `Breadcrumb` above header when nested (`Classroom › My Lesson › Scene 3`).
- Padding: `24px 32px` default, tighter in dense views.

## 3. Color System

### 3.1 Light Mode Tokens

| Token | Value | Role |
|-------|-------|------|
| `--primary` | `oklch(0.52 0.11 178)` ≈ `#0d7a6f` | Brand, primary buttons, active state |
| `--primary-gradient-end` | `oklch(0.65 0.10 178)` ≈ `#14a394` | Icon rail gradient stop |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--accent` | `oklch(0.72 0.19 40)` ≈ `#ff7a59` | Live, user avatar, alerts |
| `--accent-foreground` | `#ffffff` | Text on accent |
| `--background` | `oklch(0.975 0.005 175)` ≈ `#f4f7f6` | App canvas (Mint) |
| `--card` | `#ffffff` | Content card |
| `--card-foreground` | `oklch(0.22 0.02 175)` ≈ `#1a2624` | Body text (Deep Pine) |
| `--muted` | `oklch(0.94 0.01 175)` ≈ `#e8f0ed` | Subtle fill |
| `--muted-foreground` | `oklch(0.52 0.02 175)` ≈ `#6b8a85` | Captions, eyebrows |
| `--border` | `oklch(0.90 0.01 175)` ≈ `#d4dfdc` | Hairlines |
| `--ring` | `oklch(0.52 0.11 178 / 0.45)` | Focus outline |
| `--sidebar` | `linear-gradient(180deg, #0d7a6f, #14a394)` | Icon rail (background-image) |
| `--sidebar-foreground` | `rgba(255,255,255,0.7)` | Rail icon color |
| `--sidebar-accent` | `rgba(255,255,255,0.18)` | Rail active pill |
| `--sidebar-accent-foreground` | `#ffffff` | Rail active icon |
| `--context-panel` | `#fcfdfc` | Context panel background |
| `--context-active` | `#e8f4f1` | Active item in context panel |

### 3.2 Dark Mode

| Token | Value | Role |
|-------|-------|------|
| `--background` | `oklch(0.17 0.01 175)` ≈ `#0e1614` | App canvas |
| `--card` | `oklch(0.21 0.01 175)` ≈ `#152420` | Card surface |
| `--card-foreground` | `oklch(0.95 0.005 175)` ≈ `#eaf2ef` | Body text |
| `--primary` | `oklch(0.68 0.12 178)` ≈ `#2dbfac` | Brighter teal |
| `--accent` | `oklch(0.72 0.19 40)` ≈ `#ff7a59` | Coral (unchanged) |
| `--border` | `oklch(0.30 0.01 175)` ≈ `#2b3835` | Hairlines |

Icon rail in dark mode: `#0a524a → #0d7a6f`. Context panel `#121d1a`.

### 3.3 Removed

All existing theme tokens (academic parchment, Glass) are replaced. The `.glass` class, `--paper-grain` SVG, drop-cap, fleuron, and footnote-marker utilities are deleted.

## 4. Typography

### 4.1 Fonts

- **Body UI:** Inter (variable, 400/500/600/700) via `next/font/google`.
- **Code:** JetBrains Mono (variable, 400/500) via `next/font/google`.
- **Math:** KaTeX (unchanged).
- **Removed:** Georgia serif, `--font-serif`, all drop cap selectors.

### 4.2 Scale

| Name | Family | Weight | Size | Line-height | Tracking | Usage |
|------|--------|--------|------|-------------|----------|-------|
| Display | Inter | 700 | 32px | 1.2 | -0.02em | Hero titles, onboarding |
| H1 | Inter | 600 | 22px | 1.3 | -0.01em | Page titles |
| H2 | Inter | 600 | 16px | 1.4 | 0 | Section headings |
| H3 | Inter | 500 | 14px | 1.4 | 0 | Card titles |
| Body | Inter | 400 | 13.5px | 1.55 | 0 | Paragraphs, chat |
| Small | Inter | 400 | 12px | 1.5 | 0 | Metadata |
| Eyebrow | Inter | 500 | 10px | 1.2 | 0.12em | Uppercase labels |
| Caption | Inter | 400 | 11px | 1.4 | 0 | Timestamps |
| Mono | JetBrains Mono | 400 | 12.5px | 1.5 | 0 | Code, formulas, IDs |

### 4.3 Utility Classes (app/globals.css)

Add in `@layer utilities`:
- `.eyebrow` — Eyebrow scale + uppercase
- `.display` — Display scale
- `.caption` — Caption scale
- `.reading-column` — `max-width: 38rem; margin-inline: auto;` (kept for long-form views)

Remove: `.academic-body`, `.rule-fleuron`, `.footnote-marker`, drop-cap selectors.

## 5. Component System

### 5.1 Existing shadcn Components (Keep, 11)

`badge`, `button`, `card`, `dialog`, `input`, `label`, `scroll-area`, `select`, `separator`, `tabs`, `textarea`. All pick up new palette automatically via CSS variables.

### 5.2 New shadcn Components (Add, 10)

Install via `pnpm dlx shadcn@latest add <name>`:

| Component | Usage |
|-----------|-------|
| `sidebar` | Core of icon rail. `collapsible="icon"` supported. Themed via `--sidebar-*`. |
| `avatar` | User + agent avatars |
| `tooltip` | Icon rail hover labels |
| `dropdown-menu` | User menu, message actions |
| `sheet` | Mobile sidebar drawer |
| `popover` | Citation previews |
| `command` | ⌘K palette |
| `skeleton` | Loading placeholders |
| `breadcrumb` | Nested route trail |
| `sonner` | Toast notifications (confirm current install) |

### 5.3 Custom Components (Build)

| Component | File | Composed From |
|-----------|------|---------------|
| `IconRail` | `components/sidebar/icon-rail.tsx` | shadcn `Sidebar collapsible="icon"` + `Tooltip` |
| `ContextPanel` | `components/sidebar/context-panel.tsx` | `ScrollArea` + section child |
| `ContextPanelSection` | `components/sidebar/context-panel-section.tsx` | Title + action + list wrapper |
| `SessionsList` | `components/sidebar/sessions-list.tsx` | Date-grouped session list |
| `KnowledgeList` | `components/sidebar/knowledge-list.tsx` | KB list |
| `ClassroomsList` | `components/sidebar/classrooms-list.tsx` | Lessons list |
| `AppShell` | `components/app-shell.tsx` | Wraps rail + panel + main |
| `PageHeader` | `components/page-header.tsx` | Eyebrow + title + actions |
| `CommandPalette` | `components/command-palette.tsx` | `Command` wrapper with global search |

### 5.4 Components to Remove / Simplify

- `components/sidebar/sidebar-nav.tsx` — replaced by `IconRail` + `ContextPanel`.
- `app/(workspace)/layout.tsx` and `app/(utility)/layout.tsx` — merged; `AppShell` handles both.
- Academic-specific CSS utilities (drop caps, fleuron, footnote marker) — deleted.

## 6. Responsive Behavior

- **≥1024px:** Icon rail + context panel + main, all visible.
- **768–1023px:** Rail visible, context panel auto-collapses to `48px` (active indicator only). Click to expand.
- **<768px:** Both collapsed. Hamburger opens `Sheet` with rail; section tap opens context panel inline.

## 7. Motion & Interaction

- Transitions: 150ms `cubic-bezier(0.4, 0, 0.2, 1)` for hover/active; 200ms for panel expand.
- Focus ring: 2px teal @ 45% opacity + 2px offset. Keyboard-only (`:focus-visible`).
- Active press: scale to 0.98 briefly.
- Loading: `Skeleton` components. Streaming text keeps streamdown with a teal cursor.
- Respects `prefers-reduced-motion`.

## 8. Accessibility

- All icon-only buttons have `aria-label` + `Tooltip`.
- Contrast: body text ≥4.5:1 against background; active pill ≥3:1.
- Keyboard nav: `Tab` rail → panel → main. `⌘K` opens command palette.
- Dark mode via `next-themes` respecting `prefers-color-scheme`.

## 9. Migration Strategy

Pure presentational migration — no feature logic touched. Order:

1. **Token swap** (globals.css) — new palette. All existing shadcn components rethemed automatically.
2. **Font swap** — Inter + JetBrains Mono via `next/font`.
3. **Add shadcn components** — 10 new via CLI.
4. **Build AppShell** — new layout with IconRail + ContextPanel + main.
5. **Build context panel sections** — SessionsList, KnowledgeList, etc.
6. **Migrate pages** — each page uses `AppShell` + `PageHeader`.
7. **Delete academic utilities** — drop cap, fleuron, paper grain, `.glass`.
8. **Update E2E selectors** — tests that relied on specific sidebar text update.

Each step is an independently shippable commit.

## 10. Out of Scope

- No feature logic changes (Chat, Classroom, Quiz, Guide remain identical).
- No data model or API changes.
- No testing framework changes.
- No new i18n languages.
- No logo beyond the "b" wordmark.
- No marketing site.

## 11. Success Criteria

- All 166 unit tests still pass.
- All existing E2E tests pass (after selector updates).
- New E2E tests verify: icon rail visible, context panel section switches correctly, `⌘K` palette opens, dark mode toggle works.
- Lighthouse accessibility ≥ 95.
- Build succeeds with no new warnings.
- Every feature reachable through the new UI.
