# Master Engineering Plan: Robust Commits Search & Date Filtering (Desktop & Mobile)

## Complexity Classification: Level 3 (Search & Filter Engine Enhancement across Desktop & Mobile)

---

## 1. Verified Facts, Assumptions, and Missing Information

### Verified Facts
1. **Desktop Commits List (`src/components/commit/CommitList.tsx`)**:
   - Contains a search input (`searchInput`), author filter (`authorInput`), branch filter (`branchInput`), and date inputs (`since`, `until`).
   - Uses `useCommits(filters)` hook powered by `@tanstack/react-query`.
   - Date inputs (`since`, `until`) use HTML date pickers without end-of-day normalization (`until` cuts off at 00:00:00, omitting commits on that day).
   - Lacks date preset chips (Today, Last 7 Days, Last 30 Days, This Year) for rapid 1-tap filtering.
2. **Hook Engine (`src/hooks/useCommits.ts`)**:
   - When `filters.query` is present, it calls GitHub's `https://api.github.com/search/commits?q=...` with preview header. GitHub search API has strict rate-limiting (30 req/min authenticated, 10 unauthenticated) and requires authentication.
   - When search API returns 403 (Rate Limit) or 422 (Unprocessable query), it throws an unhandled error causing `isError: true` and blocks the user with a retry screen.
   - If `new Date(filters.since).toISOString()` is evaluated on an invalid string, it throws a fatal `RangeError: Invalid time value`.
   - It does not fall back to in-memory `activeCommits` from `AppContext` when the remote search endpoint fails or is rate-limited.
3. **Mobile Commits View (`src/mobile/screens/repo/CommitsScreen.tsx`)**:
   - Completely lacks any search bar, filter button, author filter, or date filters. It only maps `activeCommits` directly.
   - Mobile users cannot search commits by message, SHA, author, or date range.
4. **Data Formats in AppContext**:
   - `activeCommits` contains `{ hash, msg, author, date, timestamp, avatarUrl, stats, fullHash }`.
   - Dates in commits are ISO strings or standard date strings parseable by `new Date(c.date || c.timestamp)`.

### Assumptions
- The user requires reliable search by commit message or hash/SHA, filter by author, and search/filter by date ranges (including custom since/until dates and quick range presets).
- This capability should work seamlessly on both Desktop (`CommitList`) and Mobile (`CommitsScreen`).
- In-memory fallback is required so searches never crash when GitHub API is unauthenticated or hits rate limits.

### Missing Information
- None. All commit components and data structures have been verified with source code.

---

## 2. Objective
- **Purpose**: Fix search and filter malfunctions in commits history, add robust date filtering (presets + custom date ranges), and achieve feature parity between mobile and desktop commit history views.
- **Problem**: 
  - Date filtering cuts off same-day commits due to midnight UTC truncation.
  - Remote GitHub search API fails when unauthenticated or rate-limited without a graceful local fallback.
  - Mobile commits view has no search or date filter at all.
- **Success Criteria**:
  - Full search by message or SHA substring.
  - Author and branch filters.
  - Date filtering with:
    - Quick presets: "All", "Today", "Last 7 Days", "Last 30 Days", "This Year".
    - Custom Date Range: Start Date (`since`) and End Date (`until`) with full inclusive end-of-day comparison.
  - Resilient hybrid engine: queries remote API when available and falls back instantly to client-side filtering on `activeCommits`.
  - Seamless desktop and mobile user experience.

---

## 3. Existing System Analysis
- **`src/hooks/useCommits.ts`**:
  - Currently triggers `@tanstack/react-query`.
  - We will enhance `useCommits` to:
    1. Safely normalize date ranges (start of day for `since`, end of day 23:59:59.999 for `until`).
    2. Gracefully catch API errors (403 rate limit, 422 search syntax, offline) and seamlessly perform client-side filtering against `activeCommits`.
    3. Return matching count, paginated items, and clear active filter badges.
- **`src/components/commit/CommitList.tsx`**:
  - Add date preset buttons (`All`, `Today`, `7 Days`, `30 Days`, `This Year`, `Custom`).
  - Add active filter counters and one-click "Reset all filters".
- **`src/mobile/screens/repo/CommitsScreen.tsx`**:
  - Add mobile-optimized search bar with clear button.
  - Add filter toggle with slide-down filter drawer/panel containing:
    - Date preset pills.
    - Custom date range pickers.
    - Author filter.
    - Result count and clear filter button.

---

## 4. Architecture Design & Date Filter Logic
- **Date Range Calculation**:
  - `Today`: Start of today (00:00:00) to end of today (23:59:59.999).
  - `Last 7 Days`: 7 days ago to now.
  - `Last 30 Days`: 30 days ago to now.
  - `This Year`: Jan 1st of current year to now.
  - `Custom`: User-selected `since` (00:00:00 local) and `until` (23:59:59.999 local).
- **Client-Side Fallback Filtering Algorithm**:
  ```ts
  const matchesQuery = !query || commit.msg.toLowerCase().includes(query) || commit.hash.toLowerCase().includes(query) || commit.fullHash?.toLowerCase().includes(query);
  const matchesAuthor = !author || commit.author.toLowerCase().includes(author.toLowerCase());
  const commitTime = new Date(commit.date || commit.timestamp).getTime();
  const matchesSince = !sinceTime || commitTime >= sinceTime;
  const matchesUntil = !untilTime || commitTime <= untilTime;
  return matchesQuery && matchesAuthor && matchesSince && matchesUntil;
  ```

---

## 5. Implementation Breakdown

### Phase 1: Robust Date Handling & Fallback in `src/hooks/useCommits.ts`
- Enhance `CommitFilter` interface to support `datePreset: 'all' | 'today' | '7d' | '30d' | 'year' | 'custom'`.
- Implement robust date normalization with error guards (no `RangeError`).
- Implement client-side filtering fallback using `activeCommits` when remote API is rate-limited or fails.

### Phase 2: Enhanced Desktop Filters in `src/components/commit/CommitList.tsx`
- Add quick date preset buttons with active indicators.
- Add active filter indicator badge (e.g., "Filtered: 14 commits").
- Improve date input labels and touch-friendly controls.

### Phase 3: Mobile Search & Date Filter in `src/mobile/screens/repo/CommitsScreen.tsx`
- Integrate search input with debounce and quick clear.
- Integrate filter expansion with date presets (Today, 7D, 30D, Year, Custom), author filter, and active filter pill.
- Real-time client-side filtering matching the desktop algorithm.

### Phase 4: Verification & Validation
- Test search by message text ("initial", "fix", "update").
- Test search by partial hash ("a1b2c3d").
- Test each date preset and custom since/until ranges.
- Validate responsive layouts on mobile (375px), tablet, and desktop.
- Compile and lint applet.

---

## 6. Execution Checklist
1. [ ] Update `src/hooks/useCommits.ts` with date range normalization, preset support, and client-side fallback.
2. [ ] Update `src/components/commit/CommitList.tsx` with date presets, active badges, and clear controls.
3. [ ] Update `src/mobile/screens/repo/CommitsScreen.tsx` to include search, filter toggle, date presets, and date inputs.
4. [ ] Run `compile_applet` to ensure zero compilation errors.
5. [ ] Run `lint_applet` to verify syntax and types.

---

## 7. Approval Gate
In strict adherence to the Master Engineering Planning & Implementation Protocol, all implementation is paused until explicit approval is granted.

Please reply with **"Approved"**, **"Proceed"**, or **"Implement"** to execute the plan.
