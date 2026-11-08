# Master Engineering Specification: Ascending Sorting for Repositories & Commit History

---

## 1. Verified Facts, Assumptions & Missing Information

### Verified Facts
1. **Repository Sorting Architecture**:
   - `src/context/contextUtils.ts` currently initializes `repoSortDirection: 'desc'`.
   - `src/mobile/utils/sortRepos.ts` contains `filterAndSortRepos` which supports `sortDirection: 'asc' | 'desc'`. When `'asc'`, it negates the comparison (`-comparison`), correctly sorting names A-Z and updated dates oldest-first.
   - `src/features/desktop/screens/DesktopRepositories.tsx` currently bypasses `filterAndSortRepos`, performing only a raw un-sorted filter on `githubRepos`.
   - `src/mobile/screens/repositories/useRepositoriesState.ts` already calls `filterAndSortRepos`, but inherits the default `'desc'` direction.
   - `src/mobile/screens/repositories/RepoSortSheet.tsx` offers ascending/descending toggle options, but defaults to descending.

2. **Commit History Architecture**:
   - `src/hooks/useCommits.ts` explicitly sorts fetched and cached commits in descending order at lines 60-64 (`tB - tA`).
   - `src/mobile/screens/repo/CommitsScreen.tsx` displays `filteredCommits` using `activeCommits`, which are ordered descending by default without a sort direction toggle.
   - `src/components/commit/CommitList.tsx` renders commits via `useCommits`, inheriting the descending order.
   - `src/features/desktop/screens/DesktopCommitsView.tsx` defines `isHead` as `commitToInspect === activeCommits[0]`, which assumes the first element is the newest commit.
   - `src/components/commit/GitGraph.tsx` renders the D3 DAG layout based on the commit array order.

### Assumptions
1. When sorting repository listings in an **ascending manner**, the default sort direction becomes `asc` (e.g., A to Z alphabetically by repository name, or oldest updated date first when sorted by activity), with users retaining the capability to toggle to `desc`.
2. When sorting commit history in an **ascending manner**, commits should appear in chronological order (oldest commit at the top/start progressing forward in time to the newest commit/HEAD at the end), matching chronological timeline reading, with an explicit Sort Direction toggle (Ascending / Descending) available in both desktop and mobile header toolbars.

### Missing Information
- None. All components, hooks, utilities, and state interfaces are fully accessible and verified in the codebase.

---

## 2. Complexity Classification
- **Level 3: Large Feature / Cross-Cutting Workflow**
  - Spans global state management (`AppState`, `AppContext`, `contextUtils`), multiple screens (`DesktopRepositories`, `DesktopCommitsView`, `CommitsScreen`, `CommitList`), shared utilities (`sortRepos.ts`, `commitFilterUtils.ts`, `useCommits.ts`), and D3 visualization layouts.

---

## 3. Objective

### Purpose
To reconfigure the Git Manager repository and commit history views to list items in an **ascending manner** by default, providing chronological commit tracking (from initial commit toward HEAD) and ascending repository organization, with interactive controls allowing instant switching between ascending and descending perspectives.

### Problem Statement
- Repositories default to descending order (`repoSortDirection: 'desc'`), and the desktop repository explorer does not apply sorting at all.
- Commits are hardcoded to sort descending (`tB - tA`), preventing chronological timeline exploration and making it difficult to follow a repository's evolution from inception forward.
- Neither desktop nor mobile commit headers offer a sort direction toggle.

### Success & Acceptance Criteria
- [ ] `repoSortDirection` in `getInitialDefaultState()` defaults to `'asc'`.
- [ ] `DesktopRepositories.tsx` utilizes `filterAndSortRepos` and includes an Ascending/Descending sort direction toggle button.
- [ ] `useCommits.ts` accepts `sortDirection?: 'asc' | 'desc'` in `CommitFilter` (defaulting to `'asc'`), sorting items chronologically (`tA - tB`).
- [ ] `DesktopCommitsView.tsx` and `CommitListHeader.tsx` feature an interactive Sort Direction button (Ascending ⬆️ / Descending ⬇️) with visual indicator.
- [ ] `CommitsScreen.tsx` (Mobile) and `CommitsFilterDrawer.tsx` support ascending order by default with a quick-toggle chip in `CommitsQuickChips.tsx`.
- [ ] `isHead` logic in `DesktopCommitsView.tsx` and `CommitDetailActions.tsx` accurately identifies the actual HEAD commit regardless of list sort direction.
- [ ] D3 `GitGraph.tsx` renders smoothly in ascending chronological layout.

---

## 4. Existing System Analysis

### Current Commit Sorting Pipeline
```
Remote / Local Commits
       │
       ▼
useCommits.ts (hardcoded: items.sort((a,b) => tB - tA) [DESCENDING])
       │
       ▼
CommitList.tsx / DesktopCommitsView.tsx / CommitsScreen.tsx (Newest First)
```

### Current Repository Sorting Pipeline
```
contextUtils.ts (repoSortDirection: 'desc')
       │
       ├─► Mobile: useRepositoriesState.ts -> filterAndSortRepos(..., sortDirection: 'desc')
       └─► Desktop: DesktopRepositories.tsx -> raw unsorted filter
```

---

## 5. Architectural Design

### Unified Ascending Pipeline
```
┌─────────────────────────────────────────────────────────────┐
│                       Global State                          │
│  - repoSortDirection: 'asc' (default)                       │
│  - commitSortDirection: 'asc' (default)                     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│    Repository Exploration    ││    Commit History Timeline   │
│ - DesktopRepositories:       ││ - useCommits:               │
│   Uses filterAndSortRepos    ││   Sorts tA - tB when 'asc'  │
│   Asc/Desc Toggle in Bar     ││ - CommitsScreen:            │
│ - Mobile Repositories:       ││   Sorts chronological 'asc' │
│   RepoSortSheet defaults     ││ - CommitListHeader:         │
│   to Ascending               ││   Asc/Desc Toggle Button    │
└──────────────────────────────┘└─────────────────────────────┘
```

### Key Technical Decisions
1. **Dynamic HEAD Resolution**:
   - Rather than assuming `activeCommits[0]` is HEAD, compute `headCommit` by inspecting the commit with the latest timestamp or matching the branch reference tip. This guarantees commit inspection, HEAD deletion dialogs, and parent diff comparisons function correctly whether sorted ascending or descending.
2. **Persistence**:
   - Maintain sort direction preferences in state and sync with local storage if desired (`gm_repo_sort_dir`, `gm_commit_sort_dir`).
3. **Graph Consistency**:
   - `computeGitGraphLayout` handles commit chains based on parent-child hashes. Passing the ascending array or ensuring root-to-leaf topological consistency ensures edge rendering remains crisp.

---

## 6. Implementation Breakdown (Phased)

### Phase 1: Repository Ascending Pipeline
- **Files**:
  - `src/context/contextUtils.ts`: Update default `repoSortDirection: 'asc'`.
  - `src/features/desktop/screens/DesktopRepositories.tsx`: Connect `filterAndSortRepos`, add `repoSortDirection` and `setRepoSortDirection`, add sort toggle button in the filter bar.
  - `src/mobile/screens/repositories/RepoSortSheet.tsx`: Ensure 'asc' is the active default option.

### Phase 2: Commit Sorting Engine & Types
- **Files**:
  - `src/features/commit/utils/commitFilterUtils.ts`: Add `sortDirection?: 'asc' | 'desc'` to `CommitFilter`. Update `filterLocalCommits` to sort by `sortDirection` (default `'asc'`).
  - `src/hooks/useCommits.ts`: Sort items chronologically based on `filters.sortDirection || 'asc'`.

### Phase 3: Desktop Commit View & Header Controls
- **Files**:
  - `src/features/commit/components/CommitListHeader.tsx`: Add Ascending/Descending sort direction button with icon and label.
  - `src/components/commit/CommitList.tsx`: Wire `sortDirection` into `filters` and state.
  - `src/features/desktop/screens/DesktopCommitsView.tsx`: Dynamically resolve `headCommit` and `parentCommit` using timestamp comparison so HEAD deletion and diff viewers remain rock solid.

### Phase 4: Mobile Commits Screen & Drawers
- **Files**:
  - `src/mobile/screens/repo/CommitsScreen.tsx`: Add `sortDirection` state (default `'asc'`), apply ascending sort to `filteredCommits`, update HEAD detection.
  - `src/mobile/screens/repo/commits/CommitsQuickChips.tsx`: Add quick sort toggle button (`Oldest First (Asc)` / `Newest First (Desc)`).
  - `src/mobile/screens/repo/commits/CommitsFilterDrawer.tsx`: Add explicit Sort Direction radio/button selector.

---

## 7. Responsive Experience Specification

### Desktop Experience
- **Repository View**: A clear Sort Order toggle button (`A-Z / Ascending` / `Z-A / Descending`) beside the type filter segment.
- **Commit History**: A sort toggle button in `CommitListHeader` showing an arrow up/down icon (`ArrowUpAZ`, `ArrowDownZA`, or `ArrowUp` with `Ascending` tooltip). Clicking reverses the timeline seamlessly without reloading.

### Tablet Experience
- Fluid toolbar layout where sort toggles collapse into icon buttons with clear tooltips. Touch targets maintained at 44px minimum.

### Mobile Experience
- Quick Chip row in `CommitsScreen` features a dedicated sort toggle pill.
- Filter drawer contains a high-contrast segmented control: `Chronological (Asc)` vs `Reverse Chronological (Desc)`.

---

## 8. Performance, Accessibility & Security

- **Performance**: Sorting is performed via native array sorts with numeric timestamp caches; negligible overhead on lists up to 10,000 items. Memoized via `useMemo`.
- **Accessibility**: All sort buttons include proper `aria-label`, `title`, and `aria-pressed` attributes. Focus rings comply with WCAG 2.1 AA.
- **Security**: Pure client-side array sorting; no input injection or eval vectors.

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| `activeCommits[0]` assumed to be HEAD in commit detail/delete views | Medium | High | Replace hardcoded `[0]` index with dynamic `headCommit` locator: `[...activeCommits].sort((a,b) => tB - tA)[0]`. |
| Git Graph edge inversions | Low | Medium | Verify `computeGitGraphLayout` handles chronologically ascending lists cleanly; reverse internally for DAG top-down layout if needed. |

---

## 10. Execution Checklist (No code execution until approval)

1. [ ] Update initial state in `contextUtils.ts` to set `repoSortDirection: 'asc'`.
2. [ ] Integrate `filterAndSortRepos` and an interactive sort direction toggle in `DesktopRepositories.tsx`.
3. [ ] Extend `CommitFilter` with `sortDirection: 'asc' | 'desc'` in `commitFilterUtils.ts` and update `filterLocalCommits`.
4. [ ] Update `useCommits.ts` to respect `sortDirection` (defaulting to `'asc'`).
5. [ ] Add sort toggle button to `CommitListHeader.tsx` and wire through `CommitList.tsx`.
6. [ ] Update HEAD resolution in `DesktopCommitsView.tsx` and `CommitDetailActions.tsx` to be direction-agnostic.
7. [ ] Add sort controls to mobile `CommitsScreen.tsx`, `CommitsQuickChips.tsx`, and `CommitsFilterDrawer.tsx`.
8. [ ] Execute `compile_applet` and `lint_applet` together, restart dev server, wait 10s and test console/HTTP status.

---

## 11. Approval Gate

> [!CAUTION]
> **Awaiting explicit user approval before performing any code generation or modifications.**
> Please reply with **Approved**, **Proceed**, or **Implement** to start implementation.
