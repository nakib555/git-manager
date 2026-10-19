# Git Manager — Architecture, Deduplication & Anti-AI Design Purification Specification

**Complexity Classification**: Level 4 (Architecture, Codebase Restructuring & Design System Overhaul)  
**Status**: Pending Architecture Review & User Approval

---

## 1. Verified Evidence & Existing System Analysis

### Verified Facts (Codebase Evidence)
1. **Dead & Duplicate Files Identified**:
   - `src/screens/`: Contains legacy implementations (`Dashboard.tsx`, `Repositories.tsx`, `RepoDetails.tsx`, `Settings.tsx`, and `repodetails/BranchesScreen.tsx`, `CommitsScreen.tsx`, `FilesScreen.tsx`, `FilesTab.tsx`, `InsightsScreen.tsx`). Only `CloneScreen.tsx` and `PRsScreen.tsx` are imported by `DesktopLayout.tsx`; all other files in `src/screens` are dead duplicates of the desktop embedded views and mobile screens.
   - `src/components/Layout.tsx`: Completely unused legacy shell; only imported by the dead `src/screens/Dashboard.tsx` and `src/screens/Repositories.tsx`.
   - `src/components/PullToRefresh.tsx`: Unused legacy component superseded by `src/mobile/components/MobilePullToRefresh.tsx`.
   - File naming redundancy: Files inside `src/mobile/screens` are prefixed with `Mobile*` (`MobileDashboard.tsx`, `MobileRepositories.tsx`, `MobileClone.tsx`, etc.), diverging from the recommended production architecture (`src/mobile/screens/Dashboard.tsx`, etc.).
2. **Color Palette & Visual "AI Slop" Analysis**:
   - **Oversaturated "AI Blue"**: `--color-accent: #3B82F6` and `--primary-hover: #2563EB` along with hardcoded Tailwind blues (`#3B82F6`, `#2563EB`, `#60A5FA`) create the unmistakable generic prototype look.
   - **Random Purple Gradients**: Recharts charts in `DesktopLayout.tsx` and `MobileInsights.tsx` feature arbitrary `#7C3AED` to `#38BDF8` gradients, purple indicator badges, and the fantasy theme (`#0F0E17`, `#9B7EED`), which clashes with a technical version control tool.
   - **Pure Black & Discordant Grays**: Dark mode currently uses pure `#0A0A0B` / `#000000` / `#0F0E17` mixed with discordant warm/cool gray tones (`#71717A` zinc mixed with `#2A2A2E` dark slate, mixed with `#F8F7F4` off-white).
3. **Core Functional Systems**:
   - Authentication is managed in `AppContext.tsx` with token sanitization in `localStorage`.
   - File tree construction currently performs redundant scans in some views instead of utilizing a centralized, memoized O(1) Map builder.
   - TanStack Query is imported in `App.tsx` but underutilized across screens in favor of monolithic AppContext fetching.

### Assumptions
- Desktop layout (`DesktopLayout.tsx`) should remain functional and visually harmonious with the new unified slate design system, while sharing clean utility functions and core types with mobile.
- No third-party backend server is required; GitHub REST API v3 is the primary upstream authority with client-side localStorage caching.

### Missing Information & Clarifications
- None required to produce the comprehensive plan; all files, dependencies, and requirements are fully inspected.

---

## 2. Objective & Scope

### Purpose
Transform Git Manager into a disciplined, production-grade developer platform:
1. **Deduplication**: Prune all dead legacy screens (`src/screens/*`, `src/components/Layout.tsx`, `src/components/PullToRefresh.tsx`) and organize the mobile codebase into the recommended structure (`src/mobile/layout/`, `src/mobile/screens/`, `src/mobile/components/`, `src/mobile/hooks/`, `src/mobile/utils/`).
2. **Visual Purification (Anti-AI Slop)**:
   - Eradicate generic oversaturated blue (`#3B82F6`) in favor of a calibrated developer steel blue (`#388BFD` / `#2F81F7` dark, `#0969DA` light — matching GitHub/Linear engineering standards).
   - Eliminate random purple gradients and purple accent clutter; charts will use monochrome slate fills with high-contrast accent lines.
   - Eliminate pitch blacks (`#000000`, `#0A0A0B`) in favor of deep cohesive slate/zinc tones (`#0D1117` base, `#161B22` surface-1, `#21262D` surface-2, `#30363D` borders).
   - Unify gray temperatures into a single cohesive neutral-cool scale (`#8B949E` tertiary, `#C9D1D9` secondary, `#F0F6FC` primary).
3. **Architectural Restructuring**:
   - Build high-performance utilities: `treeBuilder.ts` (O(1) Map-based file tree), `sortRepos.ts`, `formatters.ts`.
   - Implement `Skeleton.tsx` and `EmptyState.tsx` components for consistent zero-jitter loading states.
   - Refactor mobile screens and layout into clean, memoized components.

---

## 3. Architecture & Target Directory Organization

```
src/
├── mobile/
│   ├── layout/
│   │   ├── MobileShell.tsx          # Root mobile orchestrator (Header + Nav + Viewport)
│   │   ├── MobileHeader.tsx         # Sticky 56px header with safe-area
│   │   ├── BottomNav.tsx            # Full-width 56px 5-tab bar with active indicator
│   │   └── RepoTabs.tsx             # Auto-centering 44px repository sub-tab bar
│   ├── screens/
│   │   ├── Dashboard.tsx            # Telemetry, quick stats, active commit feed
│   │   ├── Repositories.tsx         # Virtualized repository list, search & filters
│   │   ├── Clone.tsx                # Multi-step clone wizard & terminal generator
│   │   ├── Activity.tsx             # Global commit timeline with copyable SHAs
│   │   ├── Settings.tsx             # Theme switcher, PAT management, cache cleaner
│   │   └── repo/
│   │       ├── FilesScreen.tsx      # Map-based O(1) file tree & syntax highlighter
│   │       ├── CommitsScreen.tsx    # Chronological commits & diff sheet
│   │       ├── BranchesScreen.tsx   # Branch list, switch & creation
│   │       ├── PRsScreen.tsx        # Open/closed pull requests
│   │       └── InsightsScreen.tsx   # Code breakdown & velocity charts
│   ├── components/
│   │   ├── RepoCard.tsx             # Memoized repository card with metadata badges
│   │   ├── CommitCard.tsx           # Memoized commit timeline item
│   │   ├── FileTree.tsx             # Virtualized/memoized file tree node
│   │   ├── ActionSheet.tsx          # Spring-physics bottom sheet for quick actions
│   │   ├── Toast.tsx                # Collision-free top notification pill
│   │   ├── PullToRefresh.tsx        # Damped touch-spring pull-to-refresh
│   │   ├── Skeleton.tsx             # Shimmer skeleton loader
│   │   └── EmptyState.tsx           # Accessible empty state fallback
│   ├── hooks/
│   │   ├── useSafeArea.ts           # CSS env() safe-area inset observer
│   │   ├── useDebounce.ts           # Input debouncer for search
│   │   └── useTheme.ts              # System / custom theme hook
│   └── utils/
│       ├── treeBuilder.ts           # O(1) Map-based file tree constructor
│       ├── sortRepos.ts             # Deterministic sorting & filtering logic
│       └── formatters.ts            # Bytes, relative time, SHA abbreviation
├── components/                      # Shared & Desktop Components
│   ├── DesktopLayout.tsx            # Desktop workbench layout
│   ├── CommandPalette.tsx           # Global CMD+K palette
│   ├── CreateModals.tsx             # Repo & Branch creation dialogs
│   ├── Splash.tsx                   # Splash screen
│   ├── UI.tsx                       # Shared animated primitives
│   └── UnauthenticatedState.tsx     # Clean guest fallback
├── core/
│   ├── types.ts                     # Single source of truth types
│   └── AppContext.tsx               # UI State & API store
└── index.css                        # Disciplined Anti-AI Color System & Themes
```

---

## 4. Visual Purification Palette (Anti-AI Slop)

### Dark Slate Theme (Engineering Workstation Default)
- **Background**: `#0D1117` (GitHub Dark standard, soft deep slate — never `#000000` or `#0A0A0B`)
- **Surface 1 (Cards, Headers)**: `#161B22`
- **Surface 2 (Hover, Active, Inputs)**: `#21262D`
- **Surface 3 (Dividers, Elevated Popovers)**: `#30363D`
- **Border**: `#30363D` (Subtle 1px boundary, crisp contrast)
- **Text Primary**: `#F0F6FC`
- **Text Secondary**: `#C9D1D9`
- **Text Tertiary**: `#8B949E`
- **Accent (Developer Steel Blue)**: `#388BFD` (Refined, calibrated — no neon AI blue)
- **Accent Soft**: `rgba(56, 139, 253, 0.12)`
- **Success**: `#3FB950`
- **Warning**: `#D29922`
- **Danger**: `#F85149`

### Light Slate Theme (Refined Daylight Workstation)
- **Background**: `#F6F8FA`
- **Surface 1**: `#FFFFFF`
- **Surface 2**: `#EAEEF2`
- **Surface 3**: `#D0D7DE`
- **Border**: `#D0D7DE`
- **Text Primary**: `#1F2328`
- **Text Secondary**: `#656D76`
- **Text Tertiary**: `#8C959F`
- **Accent**: `#0969DA`
- **Accent Soft**: `rgba(9, 105, 218, 0.10)`

*Eliminated*:
- No `#7C3AED` purple gradients in chart fills. Replaced with single-hue monochrome stroke `#388BFD` and subtle opacity gradient `rgba(56, 139, 253, 0.12) → transparent`.
- No fantasy violet or neon gradients.

---

## 5. Implementation Breakdown

### Phase 1: Core Design System & Anti-AI Color Purification
- Update `src/index.css` with the strict GitHub/Linear-inspired dark/light slate color tokens.
- Replace all hardcoded `#3B82F6`, `#2563EB`, `#7C3AED`, `#0A0A0B`, `#121214`, `#2A2A2E` in desktop and mobile components with semantic theme variables (`bg-background`, `bg-surface-1`, `border-border`, `text-accent`, etc.).

### Phase 2: Utilities & Shared Infrastructure
- Implement `src/mobile/utils/treeBuilder.ts`: Map-based $O(N)$ single-pass tree creation instead of nested searches.
- Implement `src/mobile/utils/sortRepos.ts`: Pure sorting and filtering functions.
- Implement `src/mobile/utils/formatters.ts`: Relative time, byte formatting, SHA slicing.
- Implement `src/mobile/components/Skeleton.tsx` and `src/mobile/components/EmptyState.tsx`.

### Phase 3: Mobile Structure Optimization & Deduplication
- Re-export and organize mobile components into standard names:
  - `src/mobile/layout/BottomNav.tsx` (standardized from `MobileBottomNav.tsx`)
  - `src/mobile/layout/RepoTabs.tsx` (standardized from `MobileRepoTabs.tsx`)
  - `src/mobile/screens/Dashboard.tsx` (standardized from `MobileDashboard.tsx`)
  - `src/mobile/screens/Repositories.tsx` (standardized from `MobileRepositories.tsx`)
  - `src/mobile/screens/Clone.tsx` (standardized from `MobileClone.tsx`)
  - `src/mobile/screens/Activity.tsx` (standardized from `MobileActivity.tsx`)
  - `src/mobile/screens/Settings.tsx` (standardized from `MobileSettings.tsx`)
  - `src/mobile/screens/repo/FilesScreen.tsx`, `CommitsScreen.tsx`, `BranchesScreen.tsx`, `PRsScreen.tsx`, `InsightsScreen.tsx`
  - Update `MobileShell.tsx` to mount the restructured screens.

### Phase 4: Prune Dead Legacy Files
- Safely delete unused legacy duplicate files:
  - `src/screens/Dashboard.tsx`
  - `src/screens/Repositories.tsx`
  - `src/screens/RepoDetails.tsx`
  - `src/screens/Settings.tsx`
  - `src/screens/repodetails/BranchesScreen.tsx`
  - `src/screens/repodetails/CommitsScreen.tsx`
  - `src/screens/repodetails/FilesScreen.tsx`
  - `src/screens/repodetails/FilesTab.tsx`
  - `src/screens/repodetails/InsightsScreen.tsx`
  - `src/components/Layout.tsx`
  - `src/components/PullToRefresh.tsx`
- Ensure `DesktopLayout.tsx` references clean shared sub-screens (`PRsScreen.tsx` and `CloneScreen.tsx` or unified equivalents) without errors.

### Phase 5: Verification & Quality Gates
- Execute `compile_applet` and `lint_applet` (`tsc --noEmit`).
- Verify responsive layout across Mobile ($< 768\text{px}$), Tablet ($768\text{px}-1024\text{px}$), and Desktop ($\ge 1024\text{px}$).
- Confirm 0 dead gaps, 0 AI purple gradients, and consistent slate contrast.

---

## 6. Execution Checklist

- [ ] 1. Clean `index.css`: Replace pure black and oversaturated AI blue with Developer Dark Slate (`#0D1117`, `#161B22`, `#21262D`, `#388BFD`) and Light Slate.
- [ ] 2. Create `src/mobile/utils/treeBuilder.ts`, `sortRepos.ts`, `formatters.ts`.
- [ ] 3. Create `src/mobile/components/Skeleton.tsx` and `src/mobile/components/EmptyState.tsx`.
- [ ] 4. Restructure `src/mobile/layout/` and `src/mobile/screens/` with clean naming matching the master prompt.
- [ ] 5. Purge random purple gradients in `DesktopLayout.tsx` and mobile charts, unifying on monochrome slate + steel blue.
- [ ] 6. Delete legacy duplicate screens in `src/screens/` and obsolete `src/components/Layout.tsx`.
- [ ] 7. Compile and lint verify the entire codebase.

---

## 7. Approval Gate

In accordance with the **Master Engineering Planning Protocol**:
**Execution is paused.** No code or file edits have been made.
Please reply with **"Approved"**, **"Proceed"**, or **"Implement"** to execute this specification.
