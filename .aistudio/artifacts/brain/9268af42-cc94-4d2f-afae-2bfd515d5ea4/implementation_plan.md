# Master Engineering Plan: Repository Search Fix, Advanced Sorting & Layout Restructuring

## 1. Objective
### Purpose
Resolve the GitHub search API `422 Validation Failed` runtime error, introduce a configurable repository search system with scope toggling (Personal repositories vs. Global GitHub search), comprehensive sorting and filtering across all kinds and types (Updated, Stars, Forks, Alphabetical Name, Programming Language), fix layout crampedness and pagination spacing, and modernize the toast notification component to avoid UI occlusion.

### Problem Statement
1. **GitHub Search API 422 Validation Failed**: In `AppContext.tsx`, searching user repositories calls `https://api.github.com/search/repositories?q=user:${username}+${encodeURIComponent(searchQuery)}...`. When query inputs are structured with raw qualifiers or lack necessary term formatting, GitHub's search query parser rejects the request with HTTP 422 Unprocessable Entity ("Validation Failed"). Furthermore, GitHub Search API has strict rate limits (30 req/min for authenticated, 10 for unauthenticated) and qualifier rules that do not include private repos unless authenticated with specific token scopes.
2. **Cramped Layout & Pagination Overlap**: In `Repositories.tsx`, container height is hardcoded to `h-[calc(100vh-130px)]` nested inside `PullToRefresh`'s `overflow-y-auto`, causing pagination buttons to collide, numbers (`4 1 2 ... 4`) to overlap, and text to truncate improperly.
3. **Occluding Toast with Misleading Icon**: The current `Toast` in `src/components/UI.tsx` is fixed at `bottom-[90px]` right on top of the pagination footer, and renders a green `CheckCircle2` checkmark even for fatal API errors.
4. **Lack of Multi-Dimension Sorting & Configuration**: Users currently only have basic client-side 'All'/'Private'/'Public' pill filters, with no ability to sort by Stars, Forks, Language, Name, or Updated date, nor toggle between searching personal repositories versus global GitHub.

### Success Criteria
- Zero 422 validation errors when searching repositories; graceful fallback to client-side multi-field filtering on personal repositories and valid qualifier syntax for global searches.
- Configuration panel for Repository Search:
  - Search Scope Toggle: "Personal Repositories" vs "Global GitHub".
  - Sort By: Last Updated, Stars Count, Forks Count, Repository Name (A-Z), and Primary Language.
  - Sort Order: Descending vs Ascending.
  - Type Filter: All, Public, Private, Forks, Sources.
  - Language Filter: All, TypeScript, JavaScript, Python, Go, Rust, Java, HTML, CSS, etc.
- Pagination spacing and layout restructured according to the 8-point spatial system: clean responsive buttons, proper hit targets (min 36x36px), no overlapping text or cramped controls.
- Toast notifications relocated to floating top-center with distinct semantic colorways and icons (Error = Red with `AlertCircle`, Success = Green with `CheckCircle2`, Info = Indigo with `Info`).

---

## 2. Evidence-First System Analysis

### Verified Facts (Confirmed from Codebase)
1. **Search Endpoint**: `AppContext.tsx` lines 288-305 construct:
   ```ts
   const searchUrl = `https://api.github.com/search/repositories?q=user:${username}+${encodeURIComponent(searchQuery)}&sort=updated&per_page=${perPage}&page=${page}`;
   ```
   GitHub's search API fails if `user:${username}` has syntax issues, if query terms contain unhandled qualifiers, or if the search string is formatted with `+` instead of sanitized URL parameters.
2. **Personal Repos Availability**: When a user is logged in, their repositories are fetched via `https://api.github.com/user/repos` (which returns both public and private repos). When searching personal repos, client-side indexing over cached and paginated repos is instantaneous, zero-latency, rate-limit immune, and supports private repos reliably.
3. **Layout Overlap**: `Repositories.tsx` line 116 uses `h-[calc(100vh-130px)] max-h-[1000px]` inside `PullToRefresh.tsx` line 125 (`className="flex-1 overflow-y-auto ... px-5 pb-5"`). This dual nested scroll container causes layout recalculation bugs and forces pagination footer to collide with viewport boundaries.
4. **Toast Occlusion**: `UI.tsx` line 105 places Toast at `bottom-[90px] left-1/2 -translate-x-1/2`, exactly where the pagination footer rests, and hardcodes a green `CheckCircle2` icon.

### Assumptions
- Users searching their own repositories prioritize immediate results without triggering GitHub API rate limits.
- When users toggle "Global GitHub Search", they expect to query the full public GitHub repository index using safe, sanitized search parameters.

### Missing Information
- None. The root causes and visual layout artifacts in `Screenshot_2026_1018_121931.jpg` have been verified against the codebase.

---

## 3. Complexity Classification
- **Level 3 (Large Feature / Architectural Fix)**: Involves state management overhaul in `AppContext.tsx`, UI redesign and restructuring in `Repositories.tsx` and `DesktopLayout.tsx`, advanced sorting algorithms, and component modernization in `UI.tsx`.

---

## 4. Architecture & Technical Design

### Data Flow & Search Architecture
1. **Repository Search Configuration**:
   - `searchScope`: `'personal' | 'global'` (Default: `'personal'`).
   - `sortBy`: `'updated' | 'stars' | 'forks' | 'name' | 'language'` (Default: `'updated'`).
   - `sortDirection`: `'desc' | 'asc'` (Default: `'desc'`).
   - `typeFilter`: `'all' | 'public' | 'private' | 'forks' | 'sources'` (Default: `'all'`).
   - `languageFilter`: string (Default: `'all'`).
2. **Execution Strategy**:
   - **Personal Scope**: Searches and sorts across the user's connected and local repositories client-side. Sanitizes search text with fuzzy token matching across `name`, `description`, `owner`, and `language`. Zero GitHub API rate-limit cost, full private repo support, zero network lag.
   - **Global Scope**: Queries `https://api.github.com/search/repositories` using sanitized parameters:
     ```ts
     const cleanTerm = searchQuery.trim();
     const queryParts: string[] = [cleanTerm];
     if (languageFilter !== 'all') queryParts.push(`language:${languageFilter}`);
     if (typeFilter === 'forks') queryParts.push('fork:only');
     else if (typeFilter === 'sources') queryParts.push('fork:false');
     const q = queryParts.join(' ');
     const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=${apiSort}&order=${sortDirection}&per_page=${perPage}&page=${page}`;
     ```
   - Catches 422 errors and rate-limiting gracefully, presenting clear guidance rather than raw unformatted strings.
3. **Layout & 8-Point Spatial Hierarchy**:
   - Remove dual nested scrolling constraints.
   - Establish dedicated header area: Search Input (40px) + Scope Switcher + Configuration Drawer Toggle.
   - Expandable Configuration Bar: Sort By dropdown/chips, Sort Direction toggle, Type filter, and Language selector.
   - Responsive virtualized list with standard 16px bottom gap.
   - Pagination Bar: Clean 36px interactive touch targets, clear `Page X of Y` indicator, adaptive pagination window to prevent mobile wrapping.
4. **Toast Notification Engine**:
   - Relocate to top-center: `top-4 left-1/2 -translate-x-1/2`.
   - Polymorphic variants:
     - `error`: Red border, light red background, `AlertCircle` icon.
     - `success`: Emerald border, emerald background, `CheckCircle2` icon.
     - `info`: Indigo border, indigo background, `Info` icon.
   - Added `z-[300]` with subtle drop shadow and non-blocking layout presence.

---

## 5. Implementation Phases & Breakdown

### Phase 1: State Management & GitHub Search Hardening (`src/AppContext.tsx`)
- Add search and sort state configuration to `AppContext`:
  - `repoSearchScope`, `setRepoSearchScope`
  - `repoSortBy`, `setRepoSortBy`
  - `repoSortDirection`, `setRepoSortDirection`
  - `repoTypeFilter`, `setRepoTypeFilter`
  - `repoLanguageFilter`, `setRepoLanguageFilter`
- Re-architect `fetchGitHubRepos` to eliminate 422 validation errors.
- Implement robust query sanitation and client-side sorting for personal repositories.
- Support typed toast messages: `showToast(message, type?: 'info' | 'success' | 'error')`.

### Phase 2: Repository Screen Layout & Configuration Panel (`src/screens/Repositories.tsx`)
- Add Search Scope Switcher (Personal vs Global GitHub).
- Build Sort & Filter Configuration Bar:
  - Sort dimensions: Last Updated, Stars, Forks, Name, Language.
  - Direction: Descending vs Ascending.
  - Types: All, Public, Private, Forks, Sources.
  - Languages: Dynamic extraction from repository list.
- Fix pagination footer layout:
  - Eliminate cramped numbers and overflowing rows.
  - Dynamic page window calculation (`1 ... 3 4 5 ... 12`).
  - Strict 8-point grid heights (`h-9 w-9` buttons, 16px gap).
- Fix height constraints so scrolling feels fluid and native.

### Phase 3: Desktop Repository Synchronization (`src/components/DesktopLayout.tsx`)
- Reflect the new search scope, multi-dimension sorting, and filters inside the Desktop repository management view.
- Ensure desktop filter controls and pagination align with desktop sidebar and table layouts.

### Phase 4: Toast System Modernization (`src/components/UI.tsx`)
- Move `Toast` from bottom-90px to top-center (`top-5 z-[300]`).
- Render semantic icons (`AlertCircle` for error, `CheckCircle2` for success, `Info` for info).
- Add max-width and text truncation protection to prevent awkward pill wrapping.

---

## 6. Responsive & Multi-Platform Experience

### Mobile Experience (Portrait & Landscape)
- Single-row search input with scope pill toggle.
- Collapsible "Filters & Sort" drawer to preserve vertical space for repositories.
- Pagination bar with compact step navigation (`< Page 1/4 >` on small screens, expanded on wider phones).
- Top-anchored toast with safe-area inset support (`top-[max(1.25rem,env(safe-area-inset-top))]`).

### Tablet & Desktop Experience
- Expanded horizontal configuration toolbar.
- Direct-access sort selector dropdown and quick filters.
- Responsive multi-column grid layout for repository cards.

---

## 7. Accessibility, Security & Quality Gates
- **WCAG 2.1 AA**: Minimum touch target of 36x36px for pagination, 4.5:1 text contrast on badges.
- **Keyboard Navigation**: Full tab index and arrow key navigation for sort dropdowns and pagination buttons.
- **Security**: Strict query sanitization preventing parameter injection or malformed URI components to external APIs.
- **Zero Breaking Changes**: Existing repo cloning, commit tracking, and branch switching remain fully compatible.

---

## 8. Verification & Rollback Strategy
- **Verification**: Run `npm run lint` (`tsc --noEmit`) and `compile_applet` (`npm run build`) to ensure zero type errors and build cleanliness.
- **Rollback**: Every change is modular and atomic within `AppContext.tsx`, `Repositories.tsx`, and `UI.tsx`.
