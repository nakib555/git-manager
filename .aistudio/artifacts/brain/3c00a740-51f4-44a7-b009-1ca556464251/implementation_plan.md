# Engineering Implementation Plan: Redesign & Restructure Commit Details Modal

## Verified Facts & Assumptions

### Verified Facts
1. **Source Design Reference (`ai_studio_code__17__e8a55dbb.html`)**:
   - Features a clean, high-precision bottom sheet modal (`max-h-[90vh]`) with a top drag pill (`w-10 h-1 bg-slate-300 rounded-full`).
   - Header: Commit circular glyph, title "Commit Detail", short SHA pill (`bg-slate-100 font-mono text-[11px]`), author and relative time subtitle, and circular dismiss button.
   - Segmented Tab Bar: Segmented pill container (`p-0.5 rounded-xl`) with 3 tabs:
     1. **Overview** (with icon, message card with Copy button, structured multiline body, and full metadata table with Author avatar, Committed Date, Full SHA, Parent Commit pill).
     2. **Diffs (N)** (with changed files counter `+N / -N`, interactive changed file list with ADD/MOD badges and line stats, followed by a unified diff code viewer displaying line changes).
     3. **CI/CD (N)** (with status dot indicator, refresh button, overall check banner e.g. "Some Checks Failed" or "All Checks Passed", and detailed workflow run cards with job status, failure reason, and logs viewer).
   - Sticky Bottom Action Bar:
     - "Copy SHA" button (`flex-1 py-2.5 rounded-xl`)
     - "Branch Here" primary button (`flex-[1.5] py-2.5 rounded-xl font-semibold`) with inline branch creation flow
     - "Tag Commit" button (`p-2.5 rounded-xl`) with tag input creation dialog
2. **Current Implementation (`src/mobile/components/CommitDetailModal.tsx`)**:
   - Currently implements tabs and diff viewer but uses a differing visual structure, lacks the exact segmented header rhythm, and doesn't feature the full interactive file list with live diff switching below and the three-button action bar layout.
3. **User Clarifications**:
   - Tab ordering: Overview, Diffs (with counts), CI/CD (with status dot).
   - Diffs: Interactive file list with live diff preview switching underneath.
   - Actions: Full action trio with Copy SHA, Branch Here (with inline creation modal), and Tag Commit.

### Assumptions
- All existing repository operations (`createBranchAtCommit`, `createTagAtCommit`, `fetchCommitDetailsSafe`) are wired through `AppContext.tsx` and can be invoked seamlessly.
- Colors will map cleanly to the app's established design tokens (`--color-background`, `--color-surface-1`, `--color-surface-2`, `--color-border`, `--color-accent`) to ensure seamless support for both Dark and Light themes.

### Missing Information
- None. Requirements, tokens, and design specifications are fully grounded.

---

## Objective

### Purpose
Redesign and restructure `src/mobile/components/CommitDetailModal.tsx` to strictly mirror the visual hierarchy, tab navigation, interactive diff inspect capabilities, and action footer of the provided reference design (`ai_studio_code__17__e8a55dbb.html`).

### Problem
The current commit detail modal diverges from the user's preferred design reference in structural organization, tab sequencing, diff selection ergonomics, and action footer button composition.

### Business & Technical Value
- **Developer Inspection Ergonomics**: Quick scanning of commit messages, author metadata, file changes, and CI/CD results in one seamless mobile drawer.
- **Instant Workspace Actions**: Immediate branching and tagging directly from any historic commit.
- **Consistent Theme Adaptation**: Full fidelity across both Dark Charcoal (`#0B0F19`) and Light (`#F7F7F5`) modes.

### Success Criteria & Acceptance Criteria
1. **Modal Header & Drag Handle**: Rounded drag pill, circular commit icon, "Commit Detail" title, short SHA pill badge, relative time + author, and circular close button.
2. **Segmented Control**: 3 tabs with active pill styling:
   - `Overview`
   - `Diffs ({count})`
   - `CI/CD ({count})` with status dot
3. **Overview Tab**:
   - Message block with uppercase `MESSAGE` label and one-tap `Copy` button.
   - Title line + multiline bullet/paragraph breakdown.
   - Metadata card with 4 rows: Author (with avatar badge), Committed Date, Full SHA (truncated font-mono), and Parent Commit (clickable pill).
4. **Diffs Tab**:
   - Header with `CHANGED FILES` tracking label and total `+add / -del` counts.
   - Scrollable list of changed files with `ADD`/`MOD`/`DEL` badges, paths, and line count changes.
   - Live selection: Tapping any file in the list immediately loads its unified diff into the code preview window below.
   - Code preview window: Unified diff display with header, hunk headers (`@@ ... @@`), green additions, and red strike-through deletions.
5. **CI/CD Tab**:
   - Header with `GITHUB ACTIONS & CI STATUS` and `Refresh` button.
   - Status banner reflecting overall outcome (success/failure/in-progress).
   - Check run list items with status icons, duration/status text, and `Logs` viewer.
6. **Sticky Action Footer**:
   - Button 1: `Copy SHA` with copy icon.
   - Button 2: `Branch Here` with branch icon, opening an inline input sheet or prompt to create and switch to a new branch.
   - Button 3: `Tag Commit` icon button opening inline tag creation.
7. **Build & Quality**: Zero TypeScript or lint errors.

---

## Existing System Analysis
- `src/mobile/components/CommitDetailModal.tsx`:
  - Contains props `commit` and `onClose`.
  - Connects to `fetchCommitDetailsSafe` which fetches real or synthesized commit diffs and check runs.
  - Can be cleanly refactored without breaking any external contracts in `CommitsScreen.tsx`, `Dashboard.tsx`, or `Activity.tsx`.

---

## Architecture Design

### Component Breakdown
```
CommitDetailModal
├── Backdrop Overlay (bg-black/60, tap-outside-to-close)
└── Bottom Sheet (<motion.div> with spring slide)
    ├── Drag Handle (w-10 h-1 bg-border-accent/80 rounded-full)
    ├── Header (Commit Glyph, Title, SHA badge, Author·Time, Close Button)
    ├── Segmented Tab Bar (Overview, Diffs (N), CI/CD (N))
    ├── Tab Content Scrollport (flex-1 overflow-y-auto p-4)
    │   ├── Overview Tab (Message Box + Metadata Table)
    │   ├── Diffs Tab (Stats Header + File Item Selector + Unified Diff Code Box)
    │   └── CI/CD Tab (Status Banner + Check Runs + Log Viewer)
    └── Sticky Footer (Copy SHA, Branch Here, Tag Commit)
```

### Action Bar Workflow
- **Branch Here**: Tapping opens an inline input overlay within the modal allowing the user to enter `feature/my-branch` and tap "Create Branch", triggering `createBranchAtCommit(commit.hash, branchName)`.
- **Tag Commit**: Tapping opens an inline tag prompt for `v1.2.0`, triggering `createTagAtCommit(commit.hash, tagName)`.

---

## Implementation Breakdown

### Phase 1: Header, Navigation & Segmented Control Restructuring
- Update the modal layout, top drag pill, header row, and segmented tab selector (`Overview`, `Diffs (N)`, `CI/CD (N)`).
- Ensure active tab indicator uses `bg-surface-1 text-text-primary shadow-xs font-semibold`.

### Phase 2: Overview Tab Restructuring
- Restructure the commit message block with copy button, bold title, and parsed multiline bullet details.
- Restructure the metadata table into the 4 clean rows with author badge, formatted date, truncated full SHA, and parent commit button.

### Phase 3: Interactive Diffs Tab Restructuring
- Build the changed file list where each item displays its change type pill (`ADD` / `MOD` / `DEL`), filename, and `+N / -N` numbers.
- Wire selection state so tapping a file updates `selectedDiffIndex`.
- Style the unified diff code viewer with header bar (`filename` + `UNIFIED DIFF` pill) and formatted diff lines with line-through for deletions and green highlighting for additions.

### Phase 4: CI/CD Tab Restructuring
- Build the GitHub Actions header, refresh button with spinner, status banner (Passed / Failed), and run cards with Logs action.

### Phase 5: Sticky Action Bar & Inline Dialogs
- Implement the 3-button footer: `Copy SHA`, `Branch Here`, and `Tag Commit`.
- Add inline branch and tag input sheets for seamless mobile operation.

### Phase 6: Quality Verification
- Run `lint_applet` and `compile_applet`.

---

## Desktop, Tablet & Mobile Experience
- **Mobile**: Strict 44px+ touch targets on all buttons and file items; smooth spring open/close with `motion/react`.
- **Tablet**: Centered bottom sheet with maximum width constraint (`max-w-md mx-auto`) and backdrop blur.

---

## Accessibility & Security
- Modal has `role="dialog"`, `aria-modal="true"`, and `aria-label="Commit Details"`.
- Keyboard dismissable via Escape key.
- Safe branch and tag name validation.

---

## Risks & Mitigation
- **Risk**: Long commit messages or large diff files causing layout blowout.
  - **Mitigation**: Constrained scrollable diff viewer with horizontal scroll and `line-clamp` on previews.

---

## Execution Checklist
1. [ ] Restructure `src/mobile/components/CommitDetailModal.tsx` layout and header.
2. [ ] Implement Overview, Diffs, and CI/CD tab contents according to example 17.
3. [ ] Implement interactive file list with live diff viewer switching.
4. [ ] Implement sticky action trio with inline Branch Here and Tag Commit dialogues.
5. [ ] Run `lint_applet` and `compile_applet` to verify compilation.

---

## Approval Gate
Awaiting user confirmation ("Approved", "Proceed", or "Implement") prior to executing code modifications.
