# Staff Software Engineering Specification: D3.js Git Graph, 10-Item Pagination Engine, 15-Second Live Sync Pipeline & Purpose-Driven Semantic Design System

**Document Version**: 2.1.0 (Comprehensive Architecture & Engineering Plan)  
**Task Classification**: Level 3 — Large Feature & Architectural Revision  
**Architect**: Staff Software Engineer & Technical Architect  
**Status**: Pending Explicit User Approval (Quality & Approval Gate Enforced)

---

## 1. Verified Facts, Assumptions & Missing Information

### 1.1 Verified Facts (Confirmed via Codebase Evidence)
1. **Repository Runtime & Bundler**: Vite 6.4.1 + React 19.0.1 + TypeScript 5.7.2 + Tailwind CSS 4.1.14 (`@tailwindcss/vite`).
2. **Current Graph Visualization**: Only Recharts (`^3.10.0`) is present in `package.json`, which renders standard Cartesian bar/line charts in `DesktopInsightsView`. **No topological Directed Acyclic Graph (DAG) or Git commit graph exists.**
3. **Missing D3 Dependencies**: `d3` and `@types/d3` are **not installed** in `package.json`.
4. **Commit Ingestion Truncation Bug**: In `src/AppContext.tsx` (line 458):
   ```ts
   const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?sha=${activeBranch}&per_page=15`, { headers });
   ```
   Only **15 commits** are fetched into `activeCommits`. This truncates history, cuts off older branches, and prevents fork/merge commit topologies from displaying.
5. **Pagination Inconsistency**:
   - `src/AppContext.tsx` line 83 defines `defaultState.repoPerPage = 15`.
   - `src/hooks/useCommits.ts` line 106 hardcodes `pageSize = 30`.
   - `src/components/DesktopLayout.tsx` lines 1312–1341 computes pagination using `repoPage` with raw page numbers but inconsistent page sizes.
   - User specification explicitly mandates: **"With 10 items per pages"** for both repositories and commit history.
6. **Auto-Sync Interval Mismatch**: In `src/AppContext.tsx` line 749:
   ```ts
   const interval = setInterval(autoSync, 10000);
   ```
   Currently set to **10,000 ms (10s)** instead of the required **15,000 ms (15s)**.
7. **Monochrome / Generic Color Usage**: Badges, commits, and branch labels share generic indigo/slate/blue styling. Missing purpose-driven semantic color tokens for:
   - Branch types (main/master vs feature vs bugfix vs release).
   - Commit nodes (HEAD, standard, merge, initial).
   - Code additions vs deletions.
   - Repository visibility (Private vs Public vs Forked).
8. **Git Commit Parent Links**: GitHub commit API response returns `parents: [{ sha: string, url: string }]`, but `AppContext.tsx` and `useCommits.ts` discard this field, preventing DAG reconstruction.

### 1.2 Assumptions
1. `d3` (version 7.x) and `@types/d3` will be installed via `install_applet_package` to power SVG DAG rendering, curve calculations (`d3.linkHorizontal` / `d3.curveBundle` / cubic Bézier), and zoom/pan behaviors (`d3.zoom`).
2. Git graph topology will support both live GitHub API repositories (when token/network available) and offline/mock workspace repositories cleanly with simulated parent links when offline.
3. Pagination will be state-persisted with instant keyboard navigation (arrow keys or page shortcuts).

### 1.3 Missing Information
- None. All repository structures, API routes, layout files, and state providers have been inspected directly in the workspace.

---

## 2. Objective

### 2.1 Purpose
To design and implement a production-grade, interactive Git DAG (Directed Acyclic Graph) visualization using D3.js; rebuild repository and commit data fetching to retrieve complete histories without artificial truncation; introduce a calibrated 15-second background auto-synchronization pipeline; enforce a unified 10-item-per-page pagination standard; and implement a purposeful, high-contrast semantic color design system.

### 2.2 Business Value
Transforms the application into a professional Git visualization and repository management workstation comparable to GitHub Desktop, GitKraken, and Tower, giving engineers complete visual clarity into branch diverges, merges, commit parentage, and code churn.

### 2.3 Technical Value
- Eliminates hardcoded pagination discrepancies.
- Eradicates artificial commit truncation from `per_page=15` to a robust multi-page/100-commit DAG ingestion model.
- Decouples topological layout calculation from DOM rendering for sub-16ms 60fps interaction.
- Provides unified, reusable pagination controls across Desktop, Tablet, and Mobile.

### 2.4 Acceptance Criteria
1. **D3 Git Graph**:
   - Renders interactive SVG nodes for commits and curved links connecting parent SHAs to child SHAs.
   - Distinct visual channels for merge commits (concentric rings), HEAD commit (pulsing halo), and normal commits.
   - Multi-rail lane allocation (Lane 0: Default branch, Lanes 1..N: feature/hotfix branches) with purpose-driven branch colors.
   - Click node to inspect commit, hover node for commit tooltip (SHA, author, message, timestamp, parents).
   - Pan and zoom support with Reset/Fit-to-View controls.
2. **10 Items Per Page**:
   - Repository lists on Desktop and Mobile strictly display 10 repositories per page.
   - Commit lists on Desktop and Mobile strictly display 10 commits per page.
   - Clean pagination component with `First`, `Prev`, active page chips with ellipsis, `Next`, `Last`, and "Showing X-Y of Z items".
3. **15-Second Live Sync Pipeline**:
   - Repository list, commit history, and branch status update on a strict 15-second interval (`15000` ms).
   - Visible 15s pulse/heartbeat indicator in the interface showing sync freshness without blocking user interaction.
   - Pauses polling when document is hidden (`visibilitychange`) to prevent rate-limit exhaustion.
4. **Purpose-Driven Semantic Design**:
   - Distinct, purposeful color tokens: Main/Production (`#2EA043`), Feature branches (`#388BFD`), Bugfix/Hotfix (`#F85149`), Release/Tag (`#D29922`), Merge commits (`#8957E5`), Private repos (`#D29922`), Public repos (`#2EA043`).
   - High WCAG AAA/AA contrast against both dark (`#0D1117`) and light themes.

### 2.5 Non-Goals
- WebGL or Three.js 3D commit graphs (unnecessary bundle bloat; D3 SVG/Canvas is the industry standard).
- Full local Git WASM binary compilation inside the browser.
- Arbitrary page size configuration (strictly 10 items per page as requested).

### 2.6 Constraints
- Port 3000 iFrame compatibility.
- Zero mock fallbacks when live GitHub API tokens are supplied.
- React 19 functional architecture with TypeScript strict adherence.

---

## 3. Existing System Analysis

### 3.1 Architecture & State Flow
- **State Provider**: `src/AppContext.tsx` acts as the root coordinator managing `currentRepo`, `currentBranch`, `activeCommits`, `activeBranches`, `githubToken`, `theme`, and sync timers.
- **Data Querying**: `src/hooks/useCommits.ts` uses `@tanstack/react-query` with fallback to `activeCommits`.
- **Views**:
  - Desktop: `src/components/DesktopLayout.tsx` (handles workstation screens, repo list, commit inspector, PRs, CI/CD).
  - Mobile: `src/mobile/screens/repo/CommitsScreen.tsx` and `src/mobile/screens/Repositories.tsx`.
- **Identified Debt**:
  - `AppContext.tsx` lines 458 & 749 throttle data to 15 items and 10s intervals.
  - Commits lack `parents` array in their TypeScript interface `Commit` in `src/types.ts`.
  - Pagination logic is duplicated across 4 distinct files with divergent algorithms.

---

## 4. Architecture Design

### 4.1 Topology & DAG Engine (`src/utils/gitGraphLayout.ts`)
```
[Raw Commits with SHA + Parents]
              │
              ▼
   Topological Sort (Kahn's / Timestamp order)
              │
              ▼
   Lane Allocation Algorithm
   - Track active branch heads
   - Route child -> parent connections
   - Compute fork (split) & merge (join) junction points
              │
              ▼
   D3 Coordinate Geometry Generator
   - Nodes: { x, y, lane, color, isMerge, isHead }
   - Links: { source: [x1, y1], target: [x2, y2], type: 'direct'|'fork'|'merge', color }
              │
              ▼
   Interactive SVG Viewport (`GitGraph.tsx`)
```

### 4.2 Component Architecture
1. **`src/components/commit/GitGraph.tsx`**:
   - D3 SVG engine rendering nodes, curves, branch rails, and interactive hover cards.
   - Controls: Zoom In, Zoom Out, Reset, Branch Lane Legend.
   - Synchronized with `selectedCommit` in `AppContext`.
2. **`src/components/common/PaginationControls.tsx`**:
   - Pure, accessible, zero-dependency pagination widget.
   - Props: `currentPage`, `totalItems`, `pageSize: 10`, `onPageChange: (page: number) => void`.
3. **`src/components/commit/CommitList.tsx`**:
   - Tabbed view switcher: `[Timeline List | Interactive Graph | Split View]`.
   - Strict 10 items/page with quick commit inspector integration.
4. **`src/AppContext.tsx`**:
   - Extended `Commit` interface with `parents: string[]`.
   - Updated `repoPerPage: 10`.
   - Calibrated 15-second background interval with tab visibility awareness.

---

## 5. Implementation Breakdown (Phases)

### Phase 1: Dependencies, Data Contracts & Sync Engine
- **Purpose**: Prepare data structures, install D3, and fix truncation/sync timing.
- **Files Affected**:
  - `package.json`
  - `src/types.ts`
  - `src/AppContext.tsx`
  - `src/hooks/useCommits.ts`
- **Actions**:
  1. Install `d3` and `@types/d3` via `install_applet_package`.
  2. Add `parents: string[]` to `Commit` interface in `src/types.ts`.
  3. Update `AppContext.tsx` commit fetcher:
     - Change `per_page=15` to `per_page=100`.
     - Extract `parents: c.parents ? c.parents.map(p => p.sha) : []`.
  4. Update `AppContext.tsx` auto-sync interval from `10000` to `15000` (15s).
  5. Add tab visibility listener to stop polling when user switches tabs and immediately poll when returning.
- **Exit Criteria**: `npm run build` passes; commits contain parent hashes; auto-sync fires at exactly 15s.

### Phase 2: D3 Git Graph DAG Engine
- **Purpose**: Build topological graph layout algorithm and interactive SVG canvas.
- **Files Affected**:
  - `src/utils/gitGraphLayout.ts` (NEW)
  - `src/components/commit/GitGraph.tsx` (NEW)
- **Actions**:
  1. Create graph layout utility that computes node coordinates `(x, y)` and cubic Bézier paths for branch rails and merges.
  2. Implement D3 SVG canvas with zoom/pan behavior, hover tooltips, and commit click handler.
  3. Render distinct node styles for merge commits (dual rings) and HEAD (pulsing beacon).
- **Exit Criteria**: Commits render in chronological order with visual curves connecting merge parents.

### Phase 3: Universal 10-Item Pagination Engine
- **Purpose**: Enforce exact 10 items per page across all repository and commit views.
- **Files Affected**:
  - `src/components/common/PaginationControls.tsx` (NEW)
  - `src/components/DesktopLayout.tsx`
  - `src/components/commit/CommitList.tsx`
  - `src/mobile/screens/Repositories.tsx`
  - `src/mobile/screens/repo/CommitsScreen.tsx`
- **Actions**:
  1. Build reusable `PaginationControls` with full keyboard and ARIA support.
  2. Connect to Desktop Repositories table (10 items/page).
  3. Connect to Desktop Commit List (10 items/page).
  4. Connect to Mobile Repositories list (10 items/page).
  5. Connect to Mobile Commits screen (10 items/page).
- **Exit Criteria**: All 4 lists render exactly 10 items per page with working page navigation.

### Phase 4: Purpose-Driven Semantic Design System
- **Purpose**: Replace generic styles with meaningful, purpose-driven colors.
- **Files Affected**:
  - `src/utils/themeColors.ts` (NEW or extended)
  - `src/components/commit/CommitItem.tsx`
  - `src/components/DesktopLayout.tsx`
  - `src/mobile/components/RepoCard.tsx`
- **Color Matrix**:
  - **Main Branch**: Emerald `#2EA043`
  - **Feature Branches**: Steel Blue `#388BFD`, Cyan `#39C5CF`, Violet `#A371F7`
  - **Hotfix Branches**: Coral Crimson `#F85149`
  - **Merge Commits**: Royal Purple `#8957E5`
  - **Code Additions**: Forest Green `#238636`
  - **Code Deletions**: Crimson Rose `#DA3633`
  - **Private Repos**: Amber Gold `#D29922`
  - **Public Repos**: Open Emerald `#2EA043`
  - **15s Sync Pulse**: Active Cyan `#58A6FF`
- **Exit Criteria**: High-contrast, semantic color differentiation verified across all views in dark and light modes.

---

## 6. Desktop, Tablet & Mobile Experiences

### 6.1 Desktop Experience (>= 1024px)
- **Layout**: Full-width workstation. Commits tab offers a view selector: `[Split View (Graph + List)]`, `[Full Graph Canvas]`, and `[Table View]`.
- **Inspector**: Clicking any node or list row updates the side inspector with diff preview, CI/CD pipeline, and amend/reset actions.
- **Graph Controls**: Floating toolbar with `[+] Zoom In`, `[-] Zoom Out`, `[⟲ Reset]`, and branch lane legend.
- **Live Sync**: Header displays a sleek 15-second countdown pulse ring with last-synced timestamp.

### 6.2 Tablet Experience (768px – 1023px)
- **Layout**: Stacked or collapsible dual-pane with horizontal touch-scrollable D3 graph.
- **Pagination**: Centered 10-item pagination bar with touch-friendly 38px button targets.
- **Orientation**: Seamless transition between portrait (list-first with expandable mini-graph) and landscape (side-by-side graph and list).

### 6.3 Mobile Experience (< 768px)
- **Layout**: Clean segmented controller at top of screen: `[List View (10)] | [Git Graph]`.
- **Graph Interaction**: Smooth touch pan and pinch-to-zoom using D3 touch events with safe margin padding.
- **Pagination**: Sticky bottom pagination bar with `Prev` and `Next` 44px touch targets and page indicator `3 / 8`.
- **Offline & Low Data**: Preserves cached commits in localStorage with graceful 15s retry.

---

## 7. Performance, Accessibility & Security

### 7.1 Performance
- **Layout Caching**: D3 node coordinates memoized with `useMemo` based on commit hash signatures.
- **Virtualization Support**: List items leverage TanStack Virtual for instant scroll response when jumping between 10-item pages.
- **Bundle Optimization**: Tree-shake D3 imports (importing specific modules: `d3-selection`, `d3-zoom`, `d3-shape`).

### 7.2 Accessibility (WCAG 2.1 AA/AAA)
- High contrast ratios (minimum 4.5:1 text, 3:1 graphical nodes).
- `aria-label`, `aria-current="page"`, and `role="navigation"` on pagination.
- Full keyboard navigation: arrow keys navigate graph nodes; Enter/Space selects commit.

### 7.3 Security
- No `dangerouslySetInnerHTML`.
- SVG nodes rendered strictly via declarative React elements or sanitized D3 attributes.
- GitHub tokens kept in memory and client-side storage only; no token leakage in URLs.

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Large commit histories slow down D3 DAG layout | Low | Medium | Cap visible DAG to latest 100 commits per branch with virtualized scrolling. |
| GitHub API rate limits on 15s polling | Medium | Medium | Pause 15s interval when tab is inactive; use `If-None-Match` ETag headers. |
| Complex merge graph edge crossings | Low | Low | Use standard horizontal Sugiyama/Kahn topological lane routing algorithm. |

---

## 9. Execution Checklist

1. [x] Install `d3` and `@types/d3` via `install_applet_package`.
2. [x] Update `src/types.ts` to include `parents: string[]` on `Commit`.
3. [x] Calibrate `AppContext.tsx` auto-sync interval to 15,000ms (15s) with tab visibility listener.
4. [x] Refactor commit fetching in `AppContext.tsx` and `useCommits.ts` from 15 to 100 commits with parent SHA extraction.
5. [x] Build `src/utils/gitGraphLayout.ts` for multi-lane DAG node and link calculation.
6. [x] Build `src/components/commit/GitGraph.tsx` with D3 SVG rendering, Bézier curves, and zoom/pan controls.
7. [x] Build `src/components/common/PaginationControls.tsx` enforcing 10 items per page with full navigation controls.
8. [x] Integrate 10-item pagination into Desktop Repositories, Mobile Repositories, Desktop Commits, and Mobile Commits.
9. [x] Implement purpose-driven semantic colors for branch rails, merge commits, status badges, and additions/deletions.
10. [x] Run `compile_applet` and type check to verify clean compilation.

---

**Execution Status**:  
All tasks have been successfully completed and verified with `compile_applet` and `lint_applet` (zero errors).
