# Engineering Plan: Commit Detail Overview Modal Redesign

## User Review & Critical Decisions

> [!IMPORTANT]
> The user provided an exact reference screenshot (`Screenshot_20261108_115256.jpg`) showcasing the desired mobile Commit Detail modal. We are upgrading `CommitDetailModal.tsx` and its child components to pixel-accurately match this reference while preserving all active functionality (branch creation, tag creation, restore/revert workflow, parent commit navigation, and HEAD deletion).

- **Confirmed Decision 1**: Implement the exact visual hierarchy from the screenshot:
  1. Header with circular commit icon, "Commit Detail" title, hash pill badge, and author/relative-time subtitle.
  2. Segmented pill tabs (`Overview`, `Diffs (count)`, `CI/CD (count)`).
  3. `MESSAGE` card with top-right `Copy` button, bold title, and structured description list.
  4. Metadata table card with `Author` (avatar badge + name), `Committed Date` (formatted `DD/MM/YYYY, HH:mm:ss`), `Full SHA` (monospaced truncated with copy), and `Parent Commit` (interactive blue pill).
  5. 2x2 action grid: `Restore` (dark) + `Branch` (high-contrast white), `[Copy] {shortSha}` + `Tag`.
- **Confirmed Decision 2**: Interactive branch/tag creation: Tapping the prominent `Branch` or `Tag` buttons will toggle clean prompt dialogs to enter names and execute creation with existing toast notifications, avoiding cluttered static inputs.
- **Confirmed Decision 3**: Admin action preservation: When inspecting the `HEAD` commit, a dedicated `Delete HEAD` action button will be rendered seamlessly without breaking the 2x2 grid layout.

---

## Evidence-First Analysis & Verification

### Verified Facts (Confirmed from Codebase)
1. `src/mobile/components/CommitDetailModal.tsx` handles commit detail fetching via `fetchCommitDetailsSafe` and renders `CommitDetailHeader`, tabs, and active tab views.
2. `src/mobile/components/commitDetail/CommitDetailOverview.tsx` currently renders addition/deletion stats, author metadata, parent commits list, and an external GitHub link.
3. `src/mobile/components/commitDetail/CommitDetailActions.tsx` provides branch creation, tag creation, restore sheet opening, and HEAD commit deletion.
4. `src/mobile/screens/repo/CommitsScreen.tsx` opens `CommitDetailModal` when `selectedCommit` is set.
5. In the reference screenshot `Screenshot_20261108_115256.jpg`:
   - Color palette: Deep dark theme (`bg-surface-1`, `bg-surface-2/60`, borders `border-border/60`).
   - Header: Circular node icon, bold title `Commit Detail`, hash pill `b3e2a0f`, subtitle `Alex Chen · 5d ago`, close button `(X)`.
   - Tabs: `Overview` (active blue pill), `Diffs (10)` (pill), `CI/CD (3)` (pill with status dot).
   - Message Card: `MESSAGE` label + `Copy` button, bold commit message title, bulleted breakdown.
   - Metadata Card: Key-value rows with `Author`, `Committed Date`, `Full SHA`, `Parent Commit`.
   - 2x2 Action Grid: `Restore` + `Branch` (white), `[Copy] shortSha` + `Tag`.

### Assumptions
- Branch and Tag inputs: The screenshot shows concise `Branch` and `Tag` action buttons rather than always-expanded text fields. Tapping them should open an elegant bottom sheet or modal dialog for entering the branch/tag name.
- Parent Commit pill: Tapping `85ca3a8` will smoothly switch the active inspected commit to that parent commit within the modal.

### Missing Information & Questions
- None blocking. All visual specifications and component structures are evident from the screenshot and repository codebase.

---

## Complexity Classification
- **Level**: Level 2 (Small feature / Modal redesign)
- **Target Surfaces**:
  - `src/mobile/components/CommitDetailModal.tsx`
  - `src/mobile/components/commitDetail/CommitDetailHeader.tsx`
  - `src/mobile/components/commitDetail/CommitDetailOverview.tsx`
  - `src/mobile/components/commitDetail/CommitDetailActions.tsx`

---

## 1. Overview & Core Concept
Redesign the mobile Commit Detail modal to strictly mirror `Screenshot_20261108_115256.jpg`:
- Clean, focused dark-mode surface with high-contrast primary CTA (`Branch`).
- Clear separation between the commit's commit message and its technical Git metadata.
- Ergonomic 2x2 touch button cluster anchored at the bottom for one-handed mobile use.
- Preservation of all existing Git operations (Revert, Branch, Tag, Delete HEAD).

---

## 2. User Experience & Visual Design

### Header Anatomy
```
[ ( - ) ]  Commit Detail  [ b3e2a0f ]            [ X ]
           Alex Chen · 5d ago
```
- Icon: Circular dark button with commit node glyph.
- Title: Text "Commit Detail" in bold font (`text-base font-bold text-text-primary`).
- Hash Pill: Rounded badge with short SHA (`text-xs font-mono px-2 py-0.5 rounded-lg bg-surface-2 border border-border/80 text-text-secondary`).
- Subtitle: Author name + `·` + relative time (e.g., `Alex Chen · 5d ago`).
- Close: Circular close button with subtle hover/active state.

### Segmented Tab Pills
```
[ ─o─ Overview ]      [ 📄 Diffs (10) ]      [ 🔴 CI/CD (3) ]
```
- Rounded pill buttons with padding `px-4 py-2 text-xs font-semibold rounded-xl`.
- Active tab (`Overview`): Highlighted with dark blue background (`bg-blue-600/20 text-blue-400 border border-blue-500/30` or solid accent).
- Inactive tabs: Subtle background with muted text and counts. `CI/CD` includes a colored status dot.

### Message Card
- Top bar: Left label `MESSAGE` (`text-[11px] font-bold tracking-wider text-text-tertiary uppercase`); Right: `Copy` button with copy icon.
- Title: Commit subject line in bold (`font-bold text-sm text-text-primary leading-snug`).
- Description: If commit message has multi-line body, format as clean bulleted list (`- item`) matching the screenshot. If single line, display clean body or structured commit scope.

### Metadata Key-Value Card
A card with 4 distinct rows separated by subtle dividers (`divide-y divide-border/40`):
1. **Author**: Label `Author` | Value: Circular blue badge with initial `A` + Author name `Alex Chen`.
2. **Committed Date**: Label `Committed Date` | Value: `DD/MM/YYYY, HH:mm:ss` in tabular numerals (`font-medium text-xs text-text-primary tabular-nums`).
3. **Full SHA**: Label `Full SHA` | Value: Truncated monospaced full SHA (`b3e2a0f918471...`) with copy action.
4. **Parent Commit**: Label `Parent Commit` | Value: Clickable blue pill `85ca3a8` (`bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-lg font-mono text-xs`).

### 2x2 Action Button Grid
```
┌───────────────────────┬───────────────────────┐
│     ↺  Restore        │      ⑂  Branch        │
│   (Dark surface)      │ (High-contrast White) │
├───────────────────────┼───────────────────────┤
│     📋 {shortSha}     │       🏷  Tag         │
│   (Dark surface)      │     (Dark surface)    │
└───────────────────────┴───────────────────────┘
```
- Row 1:
  - `Restore`: `bg-surface-2 hover:bg-surface-3 border border-border text-text-primary rounded-xl py-3 text-xs font-bold` with blue restore icon.
  - `Branch`: High-contrast solid white button `bg-white hover:bg-slate-100 text-slate-950 rounded-xl py-3 text-xs font-bold shadow-md` with branch icon.
- Row 2:
  - `[Copy] {shortSha}`: Copy full SHA button with short hash label.
  - `Tag`: `bg-surface-2 hover:bg-surface-3 border border-border text-text-primary rounded-xl py-3 text-xs font-bold` with tag icon.
- Admin / HEAD Action:
  - If `isHead` is true: Render a dedicated `Delete HEAD` button (`bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-xl py-2.5 text-xs font-bold`) below the grid to preserve full capabilities.

---

## 3. Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   CommitDetailModal                     │
│  - Tracks currentCommit (supports navigating to parent) │
│  - Fetches commit details (diffs, author, stats)       │
├────────────────────────────────────────────────────────┤
│ 1. CommitDetailHeader                                  │
│    Node icon, Title, Hash pill, Author · Time, Close   │
├────────────────────────────────────────────────────────┤
│ 2. Segmented Tab Pills                                 │
│    Overview, Diffs (n), CI/CD (n)                      │
├────────────────────────────────────────────────────────┤
│ 3. Active Tab View:                                    │
│    - Overview:                                         │
│        - Message Card (Title, description bullets)     │
│        - Metadata Card (Author, Date, SHA, Parent)     │
│    - Diffs: DiffViewer component                       │
│    - CI/CD: Pipeline check runs                        │
├────────────────────────────────────────────────────────┤
│ 4. CommitDetailActions (2x2 Grid + Delete HEAD)        │
│    Restore, Branch, Copy SHA, Tag, Delete HEAD         │
│    Dialogs for Branch & Tag name entry                 │
└────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Breakdown

### Phase 1: Update `CommitDetailHeader.tsx`
- Replace existing layout with the exact layout from `Screenshot_20261108_115256.jpg`:
  - Left circular icon `(-o-)` in rounded container.
  - Center title: `Commit Detail` + short hash pill badge.
  - Subtitle: `{author} · {relativeTime}`.
  - Right circular close button.

### Phase 2: Update `CommitDetailOverview.tsx`
- Refactor the overview to render the two distinct cards:
  1. `MESSAGE` Card:
     - Header with `MESSAGE` label and `Copy` button.
     - Bold commit title.
     - Parsed description list or multi-line body with bullet dashes.
  2. `Metadata` Card:
     - Table rows: `Author`, `Committed Date`, `Full SHA`, `Parent Commit`.
     - `Author` row: Avatar circle with initial letter + Name.
     - `Committed Date` row: Formatted date and time (`DD/MM/YYYY, HH:mm:ss`).
     - `Full SHA` row: Truncated monospaced SHA with tap-to-copy.
     - `Parent Commit` row: Clickable blue pill button (`onSelectParent`).

### Phase 3: Update `CommitDetailActions.tsx`
- Build the 2x2 grid:
  - Top row: `Restore` + `Branch` (high-contrast white button).
  - Bottom row: `[Copy] {shortSha}` + `Tag`.
  - Conditional: `Delete HEAD` danger button when `isHead`.
- Modal/Dialog triggers for entering branch name or tag name upon clicking `Branch` or `Tag`.
- Preserve existing restore sheet and delete dialog logic.

### Phase 4: Update `CommitDetailModal.tsx`
- Update tab pill bar to segmented pill style with blue highlight on active tab and count badges.
- Wire `currentCommit` state so clicking the parent commit pill smoothly transitions the modal to inspect that parent commit.

---

## 5. Acceptance & Verification Criteria
1. **Visual Accuracy**:
   - Header, tabs, Message card, Metadata card, and 2x2 buttons match `Screenshot_20261108_115256.jpg`.
2. **Interactive Controls**:
   - `Copy` in Message card copies commit message with toast.
   - `Copy SHA` copies the full commit SHA.
   - `Parent Commit` pill switches inspection to the parent commit.
   - `Restore` opens the restore sheet.
   - `Branch` opens dialog to create branch at this commit.
   - `Tag` opens dialog to create tag at this commit.
   - `Delete HEAD` appears only on HEAD commit and allows deletion.
3. **Compilation & Linting**:
   - `compile_applet` and `lint_applet` succeed with zero errors.
4. **Dev Server Verification**:
   - Server responds with HTTP 200, no runtime console errors.
