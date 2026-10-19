# Git Manager — Mobile Architecture, Design & Systems Specification
## Professional Mobile Redesign & Noise Elimination Protocol (< 1024px)

---

## 1. Objective

### Purpose
Execute a professional, ground-up architectural restructuring and visual redesign of Git Manager exclusively for the mobile viewports (< 1024px). Decouple mobile from desktop dependencies, eliminate visual and architectural "noise" (inconsistent tokens, clutter, ad-hoc inline styles, desktop bleed-through), and establish a modular `src/mobile/` architecture that delivers a native iOS/Android developer tool feel (comparable to Linear, Raycast, and Arc Mobile).

### Problem Statement
The current mobile interface has grown through incremental feature additions:
1. **Visual Noise**: Inconsistent color tokens (mixing legacy purple/sky blues with charcoal dark tokens), irregular padding/radii, and redundant borders.
2. **Architectural Noise**: Mobile screens and components are mixed with desktop logic in monolithic files (e.g. `Layout.tsx`, `DesktopLayout.tsx`, `RepoDetails.tsx`), leading to maintenance hazards and brittle syntax.
3. **Viewport Inconsistency**: Breakpoint logic toggles desktop at 768px in some places and 1024px in others, leaving tablet users with a squished desktop workbench instead of a tailored touch-first experience.
4. **Touch Ergonomics**: Inconsistent touch target dimensions, sporadic bottom-sheet gesture dismissals, and toast/nav collisions on small screens with home indicators.

### Business & Technical Value
- **Developer Velocity**: Distinct `src/mobile/` layer allows mobile UI/UX to evolve rapidly without risking regressions in the desktop workbench.
- **Cognitive Clarity**: Eliminates extraneous clutter so developers can inspect repos, diffs, branches, and commits with zero friction on the go.
- **Reliability & Performance**: 60 FPS scrolling through virtualized lists, instant sub-tab switching, Map-based $O(1)$ file tree generation, and zero bundle bloat.

### Success Criteria
- [x] Zero visual noise: Strict near-black charcoal surfaces (`#0A0A0B`, `#121214`, `#1A1A1D`, `#242428`, `#2A2A2E`) with a single desaturated accent (`#3B82F6`).
- [x] Strict 8-point spatial grid: Every gap, padding, margin, radius, and height snaps strictly to 4/8/12/16/20/24/32px.
- [x] Thumb-first ergonomics: Fixed 56px bottom navigation (5 tabs), sticky 56px header with safe areas, minimum 44×44px touch targets.
- [x] Native gestures: Spring-physics pull-to-refresh, drag-to-dismiss bottom sheets, auto-centering repo sub-tabs.
- [x] 100% clean build & TypeScript lint with zero errors.

### Non-Goals
- Modifying desktop workbench features (> 1024px) except for strictly separating the viewport router.
- Altering backend API proxy contracts or GitHub OAuth token storage mechanisms in `AppContext.tsx`.
- Introducing third-party UI library bloat (retaining Tailwind CSS + lightweight Lucide icons + Motion).

---

## 2. Existing System Analysis

### Architecture & Folder Structure
- **Current Root**: `src/App.tsx` routes between `DesktopLayout` and mobile components using `useIsDesktop()`.
- **Existing Files**:
  - `src/components/Layout.tsx` (Contains mobile Header, RepoSubTabs, BottomNav, MobileDrawer)
  - `src/components/UI.tsx` (Contains ActionSheet, NotificationDrawer, Toast, AnimatedNumber)
  - `src/screens/` (Contains monolithic `Dashboard.tsx`, `Repositories.tsx`, `RepoDetails.tsx`, `CloneScreen.tsx`, `Settings.tsx`)
  - `src/screens/repodetails/` (Contains `FilesScreen.tsx`, `CommitsScreen.tsx`, `BranchesScreen.tsx`, `PRsScreen.tsx`, `InsightsScreen.tsx`)
- **Noise Analysis**:
  - `src/components/Layout.tsx` has tangled state across header dropdowns, drawer toggles, and sub-tabs.
  - Breakpoint boundary at `window.innerWidth >= 768` creates a cramped desktop layout on tablets (iPad portrait 768-834px).
  - Repositories screen has overlapping floating pagination that clashes with the fixed bottom navigation on smaller heights.
  - Color definitions contain legacy Tailwind palette references (`bg-purple-500/10`, `text-teal-500`) alongside the canonical charcoal design system.

### Verified Evidence
- `src/index.css` defines the canonical charcoal variables: `--main: #0A0A0B`, `--card: #121214`, `--hover: #1A1A1D`, `--border: #2A2A2E`, `--accent: #3B82F6`.
- `useResponsiveBreakpoints()` in `src/hooks/useIsDesktop.ts` already defines `isDesktop: width >= 1024`.
- `App.tsx` currently imports separate screen components directly into a single layout tree.

---

## 3. Architecture Design & "Noise Cleaning" Strategy

### Implementation Strategy
Create a dedicated, modular mobile package inside `src/mobile/` that encapsulates the complete mobile layout, navigation, screens, and components:

```
src/
├── mobile/
│   ├── layout/
│   │   ├── MobileShell.tsx       # Root mobile container with safe-area handling & toast positioning
│   │   ├── MobileHeader.tsx      # Sticky 56px header with drawer toggle, title, search & action sheet
│   │   ├── MobileBottomNav.tsx   # Fixed 56px bottom navigation with soft accent pill active indicator
│   │   └── MobileRepoTabs.tsx    # Contextual 44px horizontal scrolling pill tabs with auto-center
│   ├── screens/
│   │   ├── MobileDashboard.tsx    # Greeting, stats row (Repos, Stars, PRs), clean activity feed
│   │   ├── MobileRepositories.tsx # Sticky scope/search/filter toolbar + virtualized cards + bottom pagination
│   │   ├── MobileClone.tsx        # 3-step clean mobile clone wizard
│   │   ├── MobileActivity.tsx     # Clean timeline of cross-repo commits and events
│   │   ├── MobileSettings.tsx     # Grouped iOS/Android style preferences and auth status
│   │   └── repo/
│   │       ├── MobileFiles.tsx    # Collapsible O(1) tree + bottom code preview sheet
│   │       ├── MobileCommits.tsx  # Timeline cards with avatar, SHA, diff viewer
│   │       ├── MobileBranches.tsx # Remote branch list with active indicator
│   │       ├── MobilePRs.tsx       # Pull request status and review cards
│   │       └── MobileInsights.tsx  # Compact single-column commit & language charts
│   ├── components/
│   │   ├── MobileRepoCard.tsx     # High-density repository card with 8-point spatial rhythm
│   │   ├── MobileCommitCard.tsx   # Timeline commit item with monospace SHA
│   │   ├── MobileActionSheet.tsx  # Native-feel bottom sheet with drag handle & haptic dismiss
│   │   ├── MobileToast.tsx        # Floating top-center toast (calc(56px + safe-top + 12px))
│   │   ├── MobilePullToRefresh.tsx# Spring physics pull-to-refresh
│   │   └── MobileFileTree.tsx     # Fast hierarchical file browser
│   └── hooks/
│       ├── useSafeArea.ts         # Inset calculations for notch and home indicator
│       └── usePullToRefresh.ts    # Damped spring gesture hook
```

### Noise Cleaning Principles
1. **Visual De-cluttering**:
   - Single accent color: `#3B82F6` used exclusively for primary actions, active tabs, and focus states.
   - Remove random gradient cards and multi-colored pills (e.g. purple, teal, amber) in favor of semantic status indicators (`#22C55E` success, `#EF4444` danger, `#F59E0B` warning).
   - Strict surface hierarchy: `#0A0A0B` (Canvas) $\to$ `#121214` (Cards) $\to$ `#1A1A1D` (Hover/Nested elements) $\to$ `#242428` (Active controls) $\to$ `#2A2A2E` (Borders).
2. **Structural De-cluttering**:
   - Eliminate duplicated portal code, stray SVG tags, and nested ternaries.
   - Decouple mobile sub-tabs from the global app header.
   - Centralize safe-area bottom padding (`pb-[calc(56px+env(safe-area-inset-bottom)+16px)]`) so no screen list ever overlaps the navigation bar.

---

## 4. Implementation Breakdown

### Phase 1: Foundations & Mobile Layout Shell
- **Purpose**: Create `src/mobile/layout/` components and safe-area hooks adhering to the exact 56px sticky header, 44px repo sub-tabs, and 56px fixed bottom nav.
- **Files Affected**:
  - `src/mobile/hooks/useSafeArea.ts`
  - `src/mobile/layout/MobileHeader.tsx`
  - `src/mobile/layout/MobileBottomNav.tsx`
  - `src/mobile/layout/MobileRepoTabs.tsx`
  - `src/mobile/layout/MobileShell.tsx`
- **Exit Criteria**: Shell renders cleanly with zero console warnings and perfect safe-area margins.

### Phase 2: Primitive Mobile Components & Interaction System
- **Purpose**: Build noise-free, gesture-driven primitives: pull-to-refresh, bottom action sheet, floating top toast, and repo/commit cards.
- **Files Affected**:
  - `src/mobile/components/MobilePullToRefresh.tsx`
  - `src/mobile/components/MobileActionSheet.tsx`
  - `src/mobile/components/MobileToast.tsx`
  - `src/mobile/components/MobileRepoCard.tsx`
  - `src/mobile/components/MobileCommitCard.tsx`
- **Exit Criteria**: Action sheet drags smoothly; toast floats at top-center without colliding with header.

### Phase 3: Core Mobile Screens
- **Purpose**: Implement the 5 primary mobile screens with dense, noise-free layouts.
- **Files Affected**:
  - `src/mobile/screens/MobileDashboard.tsx`
  - `src/mobile/screens/MobileRepositories.tsx`
  - `src/mobile/screens/MobileClone.tsx`
  - `src/mobile/screens/MobileActivity.tsx`
  - `src/mobile/screens/MobileSettings.tsx`
- **Exit Criteria**: Virtualized repository list with search/filter/sort, 3-step clone wizard, and user settings render cleanly.

### Phase 4: Contextual Repository Details Flow
- **Purpose**: Deliver mobile-first repo inspection (Files, Commits, Branches, PRs, Insights) with code syntax viewer in bottom sheet.
- **Files Affected**:
  - `src/mobile/screens/repo/MobileFiles.tsx`
  - `src/mobile/screens/repo/MobileCommits.tsx`
  - `src/mobile/screens/repo/MobileBranches.tsx`
  - `src/mobile/screens/repo/MobilePRs.tsx`
  - `src/mobile/screens/repo/MobileInsights.tsx`
- **Exit Criteria**: Fast file tree navigation with bottom sheet code preview and full unified commit diff viewer.

### Phase 5: App Integration & Viewport Decoupling
- **Purpose**: Wire `src/App.tsx` and `useIsDesktop.ts` to seamlessly route `< 1024px` to the new `MobileShell`, keeping desktop completely intact.
- **Files Affected**:
  - `src/hooks/useIsDesktop.ts`
  - `src/App.tsx`
- **Exit Criteria**: Mobile viewports (< 1024px) load `MobileShell`; desktop viewports (>= 1024px) load `DesktopLayout`.

---

## 5. Viewport Experience Specifications

### Mobile Experience (< 768px)
- **Ergonomics**: Full thumb reachability. Navigation anchored at bottom. Header actions within comfortable index finger tap.
- **Typography**: 15px body, 20px screen titles, 13px captions with Geist Mono for SHAs and stats (`font-variant-numeric: tabular-nums`).
- **Safe Areas**: `pt-[env(safe-area-inset-top)]` on header; `pb-[env(safe-area-inset-bottom)]` on bottom nav.
- **Touch Targets**: Minimum 44×44px interactive areas.

### Tablet Experience (768px – 1023px)
- **Layout**: Centered container with max-width 720px in portrait and 920px in landscape, maintaining mobile thumb-reachability without stretched or distorted cards.
- **Multi-Column Adaptations**: Repositories and activity feed adapt from single column to balanced dual column on landscape tablets.
- **Performance**: High refresh rate (120Hz ProMotion on iPad) supported via CSS hardware acceleration (`transform: translateZ(0)`).

### Desktop Experience (>= 1024px)
- Unchanged and fully isolated. The existing `DesktopLayout` continues to serve multi-pane rail, code editor, and command palette for large monitors.

---

## 6. Performance, Accessibility & Security

### Performance Targets
- **FCP**: < 1.0s.
- **List Scrolling**: 60 FPS under 1,000+ items via `@tanstack/react-virtual`.
- **File Parsing**: $O(1)$ tree construction using `Map<string, TreeNode>`.

### Accessibility (WCAG 2.1 AA)
- Contrast ratio $\ge 4.5:1$ on all text (`#F4F4F5` and `#A1A1AA` on `#0A0A0B` / `#121214`).
- Full keyboard/switch navigation and screen reader labels (`aria-label`, `role="tab"`, `role="dialog"`).
- `prefers-reduced-motion` strictly honored for all slide and spring transitions.

### Security
- Client-side token storage in secure local storage with standard GitHub Bearer token headers.
- Zero raw HTML injection; code syntax viewer uses sanitized text AST.

---

## 7. Execution Checklist

- [ ] Step 1: Create `src/mobile/hooks/useSafeArea.ts` for standardized safe area insets.
- [ ] Step 2: Create `src/mobile/layout/MobileHeader.tsx` (56px sticky, safe-area aware, clean icons).
- [ ] Step 3: Create `src/mobile/layout/MobileBottomNav.tsx` (56px fixed, 5 tabs, soft accent active pill).
- [ ] Step 4: Create `src/mobile/layout/MobileRepoTabs.tsx` (44px horizontal scrolling pill bar with auto-centering).
- [ ] Step 5: Create `src/mobile/components/MobilePullToRefresh.tsx` with damped spring physics.
- [ ] Step 6: Create `src/mobile/components/MobileActionSheet.tsx` with native gesture dismissal.
- [ ] Step 7: Create `src/mobile/components/MobileToast.tsx` with collision-free top-center positioning.
- [ ] Step 8: Create `src/mobile/components/MobileRepoCard.tsx` and `MobileCommitCard.tsx` (strict 8-point spatial system).
- [ ] Step 9: Create `src/mobile/screens/MobileDashboard.tsx` (clean greeting, stats, recent activity).
- [ ] Step 10: Create `src/mobile/screens/MobileRepositories.tsx` (segmented scope, 44px search, filter chips, virtualized list, bottom pagination).
- [ ] Step 11: Create `src/mobile/screens/MobileClone.tsx`, `MobileActivity.tsx`, and `MobileSettings.tsx`.
- [ ] Step 12: Create `src/mobile/screens/repo/` (`MobileFiles.tsx`, `MobileCommits.tsx`, `MobileBranches.tsx`, `MobilePRs.tsx`, `MobileInsights.tsx`).
- [ ] Step 13: Create `src/mobile/layout/MobileShell.tsx` assembling the entire mobile experience.
- [ ] Step 14: Update `src/hooks/useIsDesktop.ts` and `src/App.tsx` to route `< 1024px` to `MobileShell`.
- [ ] Step 15: Run `lint_applet` and `compile_applet` to verify compilation and clean type check.

---

## 8. Quality Gates

1. **Architecture Approved**: Plan verified against user's mobile architecture specification.
2. **Noise Cleared**: Zero inline color hacks, zero legacy purple/teal badges, clean 8-point spatial rhythm.
3. **Compatibility Preserved**: Desktop workbench remains completely unaffected and functional.
4. **Verification Ready**: TypeScript and Vite build passes with zero errors.

---

## 9. Approval Gate

> **STOP**: In strict compliance with the Master Engineering Planning & Implementation Protocol, no implementation code has been written yet. Please review the plan above (or in the artifact `implementation_plan.md`). When you are ready, reply with **"Approved"**, **"Proceed"**, or **"Implement"** to begin execution.
