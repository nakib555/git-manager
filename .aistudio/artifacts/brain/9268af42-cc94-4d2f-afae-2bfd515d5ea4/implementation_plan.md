# Git Manager: Clean Developer Studio Redesign & Restructuring Plan

Comprehensive engineering and architectural specification to elevate Git Manager into a modern, high-performance, and visually refined developer studio workbench across desktop, tablet, and mobile form factors.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and design choices were confirmed by the user during interactive clarification and form the foundation of this redesign:
>
> 1. **Visual Aesthetic Direction**: **Clean Developer Studio** — neutral zinc canvas (`#09090b` dark, `#fafafa` light), refined indigo accents (`#6366f1` / `#4f46e5`), crisp typographic hierarchy, and anti-slop visual restraint.
> 2. **Layout Architecture**: **Modern Split-View Git Workbench** — collapsible dual/triple-pane workspace, persistent top breadcrumbs and branch switcher, high-density data tables, and deep interactive code and diff inspector.
> 3. **Smoothing Focus Areas**:
>    - Navigation and repository overview with quick switcher and instant multi-criteria filters.
>    - Repository details: interactive file tree explorer, syntax-highlighted diff viewer, and commit timeline.
>    - Git operations: branch switcher, commit staging and creator, and pull request workflow.
>    - Micro-interactions: 120fps fluid view transitions, keyboard shortcuts (`Cmd/Ctrl+K`, `Escape`, `Arrow` navigation), and responsive touch gestures.

---

## 1. Objective & Scope

### Purpose
Transform Git Manager from a prototype-like interface with inconsistent badges, artificial telemetry dots, and disjointed mobile/desktop layouts into a cohesive, production-grade developer workbench that feels on par with GitHub Desktop, Linear, and VS Code Web.

### Complexity Classification
**Level 4 — Architectural Redesign & Systems Restructure**

### Problem Statement
- Visual inconsistencies: arbitrary purple accents, floating cards with competing elevations, and decorative pulsing dots that violate UI design principles.
- Spatial tension: mobile and desktop codebases share state but have diverged presentation patterns, leading to awkward transitions and redundant components.
- Navigation friction: switching repositories or branches requires navigating multiple levels of screens rather than seamless in-place switching.
- Inspection depth: commit inspection, diffs, and file tree browsing lack standard developer shortcuts and keyboard accessibility.

### Expected Result & Success Criteria
- **Visual Polish**: Strict 60-30-10 color discipline with zinc neutrals and indigo accents. Zero fake status indicators or pill badge sandwiches.
- **Unified Workbench**: Responsive 3-pane workbench on desktop (collapsible rail + list/tree + deep inspector), adaptive 2-pane on tablet, and fluid bottom-sheet navigation on mobile.
- **High-Performance Rendering**: Virtualized repository and commit lists (`@tanstack/react-virtual`), zero layout shifts, and sub-100ms micro-interactions.
- **Accessibility & Contrast**: 100% WCAG AA compliance with visible focus rings (`focus-visible`) and complete keyboard navigation.

---

## 2. Existing System Analysis & Evidence-First Audit

### Verified Facts
- **Stack**: Vite 6, React 19, TypeScript 5.8, Tailwind CSS 4 with `@theme`, Express backend on port 3000 running `vite.middlewares` via `tsx server.ts`.
- **Libraries**: `@tanstack/react-query`, `@tanstack/react-virtual`, `motion` (Framer Motion v12), `recharts`, `react-syntax-highlighter`, `lucide-react`, `jszip`.
- **State Architecture**: `AppContext.tsx` provides centralized state management (`AppState`, `AppContextType`) managing GitHub auth tokens, user profiles, repository pagination, local commit/PR/branch mutations, and active tabs.
- **Screen Inventory**:
  - `Dashboard`: activity graphs with Recharts, summary statistics, recent activity.
  - `Repositories`: repository list, search, pagination, public/private filters.
  - `RepoDetails`: sub-screens for `files` (file tree), `commits` (timeline), `branches`, `insights`, `prs`, and `clone`.
  - `Settings`: token configuration, theme switcher, cache management.
- **Desktop vs. Mobile**: Handled via `useIsDesktop` hook rendering either `DesktopLayout` or mobile `Header + RepoTabs + Screen + BottomNav`.

### Technical Debt & Anti-Patterns Identified
- **Anti-Slop Violations**: Footer pinned status bar with fake `v2.4.1` and `Developer Station OK` pulsing green dot (`bg-emerald-500 animate-pulse`).
- **Pill Badge Overuse**: Multiple pill badges on cards (`Private`, `Public`, language badges, date badges) creating visual clutter instead of clean inline typographic metadata.
- **Inconsistent Theme Tokens**: Hardcoded purple `#7C3AED` and scattered Tailwind classes instead of unified CSS variable-backed design tokens.
- **Dead/Spurious Controls**: Some header icons and search elements lack full keyboard wiring or deep integration.

---

## 3. Architecture & Visual Design

### Visual Identity & Theme Tokens
The theme is anchored in **Clean Developer Studio** aesthetics:
- **Canvas (60%)**: 
  - Dark: Deep Obsidian / Zinc 950 (`#09090b`), Canvas Surface (`#121217`)
  - Light: Clean Canvas (`#fafafa`), Card Surface (`#ffffff`)
- **Structure & Borders (30%)**:
  - Hairline borders: `rgba(255, 255, 255, 0.08)` in dark, `rgba(0, 0, 0, 0.08)` in light
  - Muted typography: Zinc 400 (`#a1a1aa`) in dark, Zinc 500 (`#71717a`) in light
  - Data numbers and code hashes: Monospace with tabular numerals (`tabular-nums font-mono`)
- **Accent Budget (10%)**:
  - Primary Accent: Refined Indigo (`#6366f1` dark / `#4f46e5` light)
  - Success/Nominal: Emerald (`#10b981`)
  - Warning: Amber (`#f59e0b`)
  - Danger: Rose/Crimson (`#f43f5e`)

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          GLOBAL APP SHELL                              │
│   Cmd/Ctrl+K Quick Command Palette · Global Search · Toast Container   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          │                                                   │
┌─────────▼──────────────┐                         ┌──────────▼──────────────┐
│     DESKTOP / TABLET   │                         │      MOBILE SHELL       │
│  Collapsible Workbench │                         │ Fluid Viewport + Sheets │
├────────────────────────┤                         ├─────────────────────────┤
│ ┌──────┬──────┬──────┐ │                         │ ┌─────────────────────┐ │
│ │ Rail │ List │ Detail│ │                         │ │ Clean 3-Zone Header │ │
│ │  Nav │ View │ Insp.│ │                         │ ├─────────────────────┤ │
│ └──────┴──────┴──────┘ │                         │ │ Active Screen View  │ │
│                        │                         │ ├─────────────────────┤ │
│                        │                         │ │ Modern Bottom Nav   │ │
│                        │                         │ └─────────────────────┘ │
└─────────┬──────────────┘                         └──────────┬──────────────┘
          │                                                   │
          └─────────────────────────┬─────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    CENTRALIZED APPLICATION STATE                       │
│    GitHub Token / Auth · Active Repository & Branch · Virtualizer      │
│     Real REST / Fallback Seed Data · Local Mutation Optimism           │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy & Structural Refactoring
1. **`src/index.css` & Theme**:
   - Reconfigure CSS variables to Clean Developer Studio (`--main`, `--card`, `--hover`, `--border`, `--primary`, `--text-main`, `--text-muted`).
   - Clean tabular numerals and monospace formatting.
2. **`DesktopLayout.tsx`**:
   - Restructure into a true modular 3-pane workbench:
     - **Pane 1 (Navigation Rail, 240px)**: Collapsible sidebar with brand wordmark, repository quick-picker dropdown, workspace sections, and user account status.
     - **Pane 2 (Explorer / List, 360px-440px)**: Dynamic high-density list (repositories, commit history, file tree, PR list) with search and status filters.
     - **Pane 3 (Deep Inspector, flex-1)**: Focused detail viewer (code diff with syntax highlighting, file preview, PR conversation and merge checks, insights analytics).
   - Eliminate fake telemetry tickers and pulsing dots.
3. **`Layout.tsx` & Mobile Screens**:
   - Align mobile header with the Top Bar contract (clean title, repository breadcrumb, single primary CTA).
   - Streamlined segmented controls replacing garish pill tags.
   - Smooth animated sheet modals for quick actions.
4. **`Repositories.tsx` & `RepoDetails.tsx`**:
   - Unboxed metadata (`TypeScript · 2.4k stars · updated 2h ago`) with typographic separators.
   - Consistent empty states with clear calls to action.
   - Fast file tree navigator with clean directory expansion and file icons.
5. **Git Operations & Modals (`CreateModals.tsx`)**:
   - Polished modal dialogs with autofocus, validation messages, and smooth entrance/exit transitions.

---

## 4. Platform Experience Specifications

### Desktop Experience (1440px+)
- **Layout**: Fixed-height viewport (`h-screen overflow-hidden`) with 3-pane grid.
- **Keyboard Navigation**:
  - `Cmd+K` / `Ctrl+K`: Opens quick jump / repo command palette.
  - `Esc`: Closes modals, drawers, or clears active search.
  - `↑` / `↓` arrow keys: Navigate repository or commit list items.
- **Inspector**: Side-by-side or unified diff viewer with split line numbers, syntax highlighting, and commit metadata banner.

### Tablet Experience (768px – 1024px)
- **Landscape**: 2-pane split (collapsible list + inspector). Navigation rail collapses to compact icon strip (64px).
- **Portrait**: Fluid primary view with slide-over inspector drawer for commit diffs and file details.
- **Touch Targets**: Minimum 44px tap targets for all interactive controls.

### Mobile Experience (<768px)
- **Navigation**: Clean top bar with contextual breadcrumbs and a bottom bar adhering to the 15% viewport height cap.
- **Gestures**: Pull-to-refresh on repositories and activity feeds, swipe-to-back on repo details.
- **Input & Safe Areas**: Native iOS/Android safe area padding (`pb-safe`), auto-scroll into view on input focus.

---

## 5. Technical Implementation Breakdown

### Phase 1: Design System & Token Foundation
- **Files**: `src/index.css`, `src/types.ts`
- **Actions**:
  - Define zinc and indigo color tokens in `@theme`.
  - Enforce `font-mono` and `tabular-nums` for hashes, counts, and dates.
  - Remove deprecated inline color styles.
- **Validation**: Visual check of theme switching and contrast compliance.

### Phase 2: Desktop Split-View Workbench Restructuring
- **Files**: `src/components/DesktopLayout.tsx`, `src/components/commit/DiffViewer.tsx`
- **Actions**:
  - Re-architect desktop into 3-pane responsive workbench.
  - Remove all anti-slop elements (pulsing status dots, fake version tags, fake telemetry).
  - Modernize commit list and diff inspector with syntax highlighting and clear split metadata.
- **Validation**: Check desktop viewport rendering, resizing, and virtual scrolling.

### Phase 3: Mobile & Tablet Smoothing & Unification
- **Files**: `src/components/Layout.tsx`, `src/screens/Repositories.tsx`, `src/screens/RepoDetails.tsx`, `src/screens/Dashboard.tsx`
- **Actions**:
  - Replace pill badge sandwiches with unboxed typographic metadata.
  - Smooth repository search and filter bar.
  - Refactor file explorer with collapsible folder hierarchy and breadcrumb navigation.
- **Validation**: Test mobile responsive widths (375px, 414px) and tablet orientations.

### Phase 4: Git Operations & Modal Polish
- **Files**: `src/components/CreateModals.tsx`, `src/components/UnauthenticatedState.tsx`
- **Actions**:
  - Redesign creation modals (Repository, Branch, Commit, PR, Clone, PAT Setup).
  - Add form validation indicators and keyboard escape handlers.
- **Validation**: Execute simulated branch creation, commit creation, and PAT entry.

### Phase 5: Verification & Accessibility Audit
- **Actions**:
  - Run `compile_applet` and `lint_applet`.
  - Verify WCAG AA color contrast and zero console warnings.
- **Validation**: Zero build errors, zero runtime exceptions.

---

## 6. Execution Checklist

- [ ] Update `src/index.css` with Clean Developer Studio zinc/indigo design tokens and typography rules.
- [ ] Refactor `src/components/DesktopLayout.tsx` into a modern 3-pane workbench and eliminate fake status indicators.
- [ ] Upgrade `src/components/commit/DiffViewer.tsx` and commit timeline with refined styling and tabular numerals.
- [ ] Streamline `src/components/Layout.tsx` top bar and bottom navigation to adhere to the Top Bar contract.
- [ ] Restructure `src/screens/Repositories.tsx` with unboxed metadata, clean sorting, and zero-pill discipline.
- [ ] Smooth `src/screens/repodetails/FilesScreen.tsx` and `CommitsScreen.tsx` with breadcrumbs and keyboard accessibility.
- [ ] Polish `src/components/CreateModals.tsx` and `UnauthenticatedState.tsx` for consistent aesthetic finish.
- [ ] Compile and verify entire application build via `compile_applet` and `lint_applet`.
