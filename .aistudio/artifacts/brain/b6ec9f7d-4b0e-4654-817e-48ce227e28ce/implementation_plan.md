# Engineering Implementation Plan: Comprehensive Dashboard Functionality & Metrics Fix

## Objective
Fix the desktop and mobile dashboards so that all metrics, timeframe toggles, charts, repository navigation, search filtering, and quick actions work accurately and responsively with live GitHub data.

- **Problem**:
  1. **Zero / Inaccurate Metric Counters**: `DesktopDashboard.tsx` attempts to aggregate commits and PRs exclusively by reading `localStorage` keys for each repository name. For newly connected or un-cached repositories, this returns 0 even when `activeCommits` or `activePRs` are loaded in memory.
  2. **Static & Unresponsive Activity Chart**: The timeframe selector (`Day` / `Week` / `Month`) in `DesktopDashboard.tsx` does not alter chart intervals or data points. It remains statically mapped to Monday–Sunday days.
  3. **Broken Global Search**: `DesktopDashboard` accepts `globalSearch` prop from `DesktopLayout`, but ignores it completely. Searching from the top bar does not filter the dashboard's repository cards.
  4. **Incorrect Owner Resolution on Navigation**: Clicking a repository in the dashboard invokes `openRepo(repo.name)` without passing `repo.owner?.login`, causing organization and team repositories to fail detail resolution.
  5. **Missing Empty & Quick Action States**: When a user has no repositories or no commits, the dashboard displays empty blank containers without clear guidance or quick actions (Create Repo, Clone Repo).
- **Expected Result**:
  1. Metrics accurately reflect live repository data: Total Repositories, Total Stars, Active & Cached Commits, Open/Closed Pull Requests, and Session Activity.
  2. The Activity Chart dynamically adapts its labels and data points when switching between `Day` (hourly buckets), `Week` (day-of-week buckets), and `Month` (4-week progression).
  3. `globalSearch` filters dashboard repositories in real-time.
  4. Repository cards pass `repo.owner?.login` into `openRepo(repo.name, repo.owner?.login)` and provide visual indicators for the active repository.
  5. Empty states provide one-click buttons to create or clone repositories.
- **Success Criteria**:
  - Timeframe toggle changes chart x-axis and volume curves smoothly.
  - Commits and stars accurately reflect the active workspace and repository counts.
  - Search query filters repositories in real time.
  - All modified files strictly comply with the $\le 150$ LOC ceiling.

---

## Existing System Analysis
- **`src/features/desktop/screens/DesktopDashboard.tsx` (141 LOC)**:
  - Lines 11–30: Scans `localStorage` for `local_details_${repo.name}_commits`, ignoring `activeCommits` and `activePRs`.
  - Lines 36–44: Fixed 7-day array regardless of `timeframe` state.
  - Line 7: `globalSearch` prop is declared but never referenced in filtering.
  - Line 121: `openRepo(repo.name)` misses second `owner` parameter.
- **`src/features/desktop/screens/DesktopDashboardChart.tsx` (70 LOC)**:
  - Renders Recharts AreaChart with gradient fills, but needs clean formatting for variable timeframes (hours, days, weeks).
- **`src/mobile/screens/Dashboard.tsx` (93 LOC)**:
  - Functions cleanly but can share the refined velocity calculation.

---

## Verified Facts & Scope
- **Verified Fact 1**: `githubRepos` contains the full array of user repositories fetched from GitHub REST API (`stargazers_count`, `forks_count`, `name`, `owner`, `language`, `description`).
- **Verified Fact 2**: `activeCommits` and `activePRs` in `useAppContext()` contain live, parsed GitHub nodes for the current active repository.
- **Verified Fact 3**: All files must strictly respect the $\le 150$ LOC rule.

---

## Complexity Classification
**Level 2: Small Feature / Dashboard UX & Data Pipeline Fix**
Covers data aggregation in `DesktopDashboard.tsx`, dynamic data generation in `DesktopDashboardChart.tsx`, and search filter integration.

---

## Architecture Design

### 1. Robust Multi-Source Metric Aggregation
Combine memory state with cached storage:
- `totalCommits`: Sum of `activeCommits.length` (for currently selected repo) + cached commit lengths for other repos + `sessionCommitsCount`.
- `totalPRs`: Sum of `activePRs.length` + cached PRs.
- `totalStars`: Sum of `stargazers_count` across all `githubRepos`.
- `totalForks`: Sum of `forks_count` across all `githubRepos`.

### 2. Timeframe-Adaptive Chart Data Generation
Define dynamic generation functions based on `timeframe`:
- **`Day`**: 6 hourly intervals (`00:00`, `04:00`, `08:00`, `12:00`, `16:00`, `20:00`) showing intraday velocity.
- **`Week`**: 7 daily intervals (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`) showing weekly distribution.
- **`Month`**: 4 weekly intervals (`Week 1`, `Week 2`, `Week 3`, `Week 4`) showing monthly aggregate trends.

### 3. Real-Time Global Search Filtering
Filter `githubRepos` by `globalSearch`:
```typescript
const filteredRepos = githubRepos.filter(r => 
  !globalSearch || 
  r.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
  (r.description && r.description.toLowerCase().includes(globalSearch.toLowerCase()))
);
```

### 4. Rich Quick Actions & Safe Navigation
- Pass `openRepo(repo.name, repo.owner?.login || githubUser?.login)`.
- If `filteredRepos.length === 0`: render an interactive empty state with "Create Repository" (`openModal('repo')`) and "Clone Repository" (`navigate('clone')`).

---

## Implementation Breakdown

### Phase 1: `DesktopDashboard.tsx` Data Pipeline & Navigation
- **File**: `/src/features/desktop/screens/DesktopDashboard.tsx`
- **Actions**:
  - Incorporate `activeCommits`, `activePRs`, `currentRepo`, and `openModal` from `useAppContext()`.
  - Filter repositories using `globalSearch`.
  - Implement dynamic timeframe chart data generator.
  - Pass correct `owner` into `openRepo`.
  - Add quick action buttons and empty states.
  - Verify line count $\le 150$ LOC.

### Phase 2: `DesktopDashboardChart.tsx` Refinements
- **File**: `/src/features/desktop/screens/DesktopDashboardChart.tsx`
- **Actions**:
  - Ensure tooltips, grid lines, and axis formatting gracefully handle 4, 6, and 7 data-point sets.
  - Verify line count $\le 150$ LOC.

---

## Execution Checklist
1. Refactor `src/features/desktop/screens/DesktopDashboard.tsx` with dynamic timeframe data, search filtering, and metric aggregation.
2. Verify `src/features/desktop/screens/DesktopDashboardChart.tsx` responsive rendering.
3. Co-execute `compile_applet` and `lint_applet` together to verify zero syntax/build errors.
4. Restart dev server, wait 10 seconds, and test endpoints.

---

## Quality Gates & Approval Gate
- No code changes will be made until this plan receives your explicit approval.
- Standing by for your confirmation (`Approved`, `Proceed`, or `Implement`).
