# Engineering Plan: Fix Action Dialog Failures & Normalize Dynamic Timestamps Across App

Resolves critical failures in action dialog workflows (Create Repo, Create Branch, Create PR, Commit, Delete Repo, Branch Switch/Delete, and Commit Restore/Rewind) and normalizes dynamic relative timestamps across all repository lists, commit timelines, and activity feeds.

---

## 1. Verified Evidence & Root Cause Analysis

### Verified Facts
1. **Unstable Workflow Callback Re-creation**:
   - In `src/components/common/actionWorkflow/useActionWorkflow.ts` (line 83), the dependency array contains `[actionFnWrapper(onSuccess, onClose, autoCloseDelay, cleanup)]`. Because `actionFnWrapper` returns a new array reference on every render, the `execute` callback is recreated on every single render cycle, creating race conditions during async state transitions.
2. **False Success on Unsuccessful Actions**:
   - In `useActionWorkflow.ts` (lines 52–55), the verification logic evaluates:
     ```ts
     const summary: ActionResultSummary = (typeof actionResult === 'object' && actionResult !== null)
       ? actionResult as ActionResultSummary
       : { title: 'Action Verified', subtitle: 'Repository successfully updated.' };
     ```
     When an action function returns `false` (such as `saveAndCommitFile` or `deleteRepo` returning `false` on authorization failure or missing target), `actionResult === false` is NOT an object. Instead of treating this as an error, `useActionWorkflow` falls back to the default success summary and marks the phase as `'success'`, falsely declaring success to the user.
3. **Error Swallowing in Context Slices**:
   - In `src/context/slices/useCommitSlice.ts`: `createLocalCommit` catches exceptions internally, displays an error toast, and returns `undefined`. When invoked via `onExecute` in `CommitForm.tsx`, `useActionWorkflow` receives an unrejected promise and concludes the commit succeeded.
   - In `src/context/slices/useBranchSlice.ts`: `createLocalBranch` and `deleteBranch` catch errors or detect invalid constraints (e.g. duplicate branch name, attempting to delete protected or active branch), show a toast, and return `undefined` rather than throwing an explicit error.
4. **Premature Modal Unmount Race in `BranchesScreen.tsx`**:
   - In `src/mobile/screens/repo/BranchesScreen.tsx` (lines 37 & 56), `handleSwitch` and `handleDelete` call `setSelectedBranch(null)` immediately inside the execution block. This instantly unmounts `BranchDetailModal` while `switchWorkflow` or `deleteWorkflow` is actively transitioning between `executing` and `verifying`, preventing the user from ever seeing the inline progress tracker, verified result, or 2-second auto-close countdown.
5. **Timestamp Parsing Degenerating to `NaNd ago`**:
   - In `src/context/contextUtils.ts` (line 4), `formatTime(dateStr)` does `const date = new Date(dateStr)`. When `dateStr` is a relative label such as `"2 hours ago"` or `"yesterday"` (common in demo commits and cached snapshots), `new Date("2 hours ago")` evaluates to `Invalid Date` (`NaN`), causing `Math.floor(NaN / 24)` to return `NaN` and the UI to display `"NaNd ago"`.
6. **Inconsistent and Static Timestamp Fields Across Views**:
   - In `src/components/commit/CommitItem.tsx` (lines 50 & 82), the component directly renders `{commit.time}` without running a relative formatter.
   - In `src/mobile/components/CommitCard.tsx` (line 75), it calls `formatRelativeTime(commit.date)`, but commit items commonly store `commit.timestamp` or `commit.time`, leaving `commit.date` undefined and falling back to `"recently"`.
   - In `src/mobile/utils/formatters.ts`, `formatRelativeTime` abruptly bypasses calculation if a string ends with `"ago"`, freezing static demo dates indefinitely.

### Assumptions
- All mutation dialogs (`CreateModals` for repo/branch/pr/commit, `DeleteRepoModal`, `BranchDetailModal`, `DesktopDeleteBranchModal`, and `CommitRestoreSheet`) must use the unified `useActionWorkflow` engine.
- Modal closures upon successful completion must be managed cleanly by `useActionWorkflow` via its `autoCloseDelay` timer or manual `onDismissNow`, rather than being aborted synchronously by parent event handlers.
- Dynamic timestamps should format relative durations concisely (e.g. `just now`, `5s ago`, `2m ago`, `3h ago`, `4d ago`, `2mo ago`, `1y ago`), handling ISO strings, numeric timestamps, and fallback strings cleanly without ever producing `NaN`.

### Missing Information & Clarifications
- None; the clarifying question confirmed that all mutation dialogs under error/edge conditions and dynamic relative timestamps across repositories, commits, and activity must be addressed.

---

## 2. Complexity Classification
- **Level 2 / 3 (Subsystem Fortification & Cross-App Consistency)**: Touches core async mutation workflow state engine, context error propagation, parent modal lifecycle orchestration, and application-wide timestamp normalization.

---

## 3. Objective

### Purpose
Eliminate workflow failures, false positives, and unmount race conditions in all action dialogs, and ensure every timestamp across the application displays an accurate, dynamic relative time with zero `NaN` occurrences.

### Problem Statement
Users encountering action errors (such as attempting to delete an active branch, committing with missing repo, or network rejection) either see false success cards or have the modal vanish instantly due to premature unmounting. Concurrently, commits and repository cards show stale or broken timestamps (`NaNd ago` or static strings).

### Business & Technical Value
- Provides rock-solid engineering reliability: action dialogs only report success when the backend or state slice genuinely verifies the change.
- Errors in action dialogs are gracefully caught and displayed within the inline error card with retry and back-to-edit capabilities.
- Timestamps become reliable, standardized, and dynamic across mobile, tablet, and desktop views.

### Acceptance Criteria
1. **Robust Action Workflow State Engine**:
   - `useActionWorkflow` must maintain callback references via `useRef` to prevent unneeded recreation of `execute`.
   - `useActionWorkflow` must strictly treat `actionResult === false` as an error and transition to `'error'`.
   - Slice functions (`useCommitSlice`, `useBranchSlice`, `useRepoSlice`) must throw clear error messages or return explicit booleans rather than swallowing errors into silent `undefined` returns.
2. **Coordinated Dialog Lifecycle**:
   - `BranchesScreen.tsx` must not call `setSelectedBranch(null)` immediately inside `onSwitch` / `onDelete`. Modal dismissal must occur only when the action dialog completes its countdown or when the user explicitly taps dismiss/close.
   - `DesktopDeleteBranchModal.tsx` and `DesktopBranchesView.tsx` must properly propagate errors if deleting protected/active branches.
3. **Unified Dynamic Relative Timestamps**:
   - `formatRelativeTime` in `src/mobile/utils/formatters.ts` must parse ISO dates, unix timestamps (seconds or ms), and gracefully resolve fallback strings, producing clean dynamic output (`just now`, `12s ago`, `4m ago`, `2h ago`, `3d ago`).
   - `formatTime` in `src/context/contextUtils.ts` must be a direct alias to the robust `formatRelativeTime`, eliminating the `NaNd ago` calculation bug.
   - `CommitItem.tsx`, `CommitCard.tsx`, `CommitRestorePreviewCard.tsx`, `BranchModalTabs.tsx`, `DesktopRepoCard.tsx`, `PRDetailCommits.tsx`, and `FileViewerTabs.tsx` must pass `commit.timestamp || commit.date || commit.time` into `formatRelativeTime`.
4. **Architectural Constraints**:
   - All modified files must strictly adhere to the $\le 150$ LOC ceiling.
   - Anti-AI slop: clean unboxed metadata with `·` separators, tabular-nums font formatting, and zero pill-soup.

---

## 4. Existing System Analysis

### Architecture & Affected Components
- `src/components/common/actionWorkflow/useActionWorkflow.ts` (115 lines): Core hook managing workflow phases (`idle` -> `validating` -> `executing` -> `verifying` -> `success` / `error`).
- `src/context/slices/useCommitSlice.ts` (154 lines): Handles local & GitHub commits, file commits, commit rollbacks. Needs error re-throwing on failure so callers know the operation failed.
- `src/context/slices/useBranchSlice.ts` (82 lines): Handles branch creation & deletion. Needs error throwing on protected branch or duplicate ref errors.
- `src/mobile/screens/repo/BranchesScreen.tsx` (147 lines): Renders active branches and opens `BranchDetailModal`. Currently prematurely unmounts the modal on action execution.
- `src/mobile/utils/formatters.ts` (122 lines): Core formatting utilities. Needs robust timestamp parsing supporting ISO, unix seconds, unix milliseconds, and smart relative fallback.
- `src/context/contextUtils.ts` (119 lines): Contains broken `formatTime` function susceptible to `NaN`.
- `src/components/commit/CommitItem.tsx` (106 lines): Commit renderer in timeline. Renders `{commit.time}` directly.
- `src/mobile/components/CommitCard.tsx` (143 lines): Commit card on mobile. Calls `formatRelativeTime(commit.date)`.

---

## 5. Architecture Design

### Data Flow & Error Handling Strategy
```
User initiates action (e.g. New Branch, Delete Repo, Commit, Restore)
                     │
                     ▼
       ┌───────────────────────────────┐
       │   useActionWorkflow.execute   │
       └──────────────┬────────────────┘
                      │
     ┌────────────────┴────────────────┐
     ▼                                 ▼
Phase: 'validating' (280ms)      Invariants checked
     │
     ▼
Phase: 'executing'               Invokes actionFn()
     │                           - Calls slice / GitHub API
     │                           - Throws Error OR returns false on failure
     │                           - Returns ActionResultSummary on success
     ├─────────────────────────────────┐
     │ (Throws or returns false)       │ (Resolved summary / true)
     ▼                                 ▼
Phase: 'error'                   Phase: 'verifying' (260ms)
- Displays ActionErrorCard             │
- Shows precise error message          ▼
- Offers 'Back to edit' &        Phase: 'success'
  'Try again' buttons            - Displays ActionSuccessCard with badges
                                 - Starts auto-close countdown (2s)
                                 - Calls options.onClose() on expiry
```

### Key Architectural Safeguards
1. **Ref-Stabilized Options**: Store `options` in `useRef(options)` inside `useActionWorkflow` to eliminate unstable recreation of `execute` and prevent stale closures over `onSuccess` and `onClose`.
2. **Strict Boolean & Throw Checks**:
   ```ts
   const actionResult = await actionFn();
   if (actionResult === false) {
     throw new Error('Operation was rejected or could not be completed.');
   }
   ```
3. **Modal Lifecycle Separation**:
   - In `BranchesScreen.tsx`, `handleSwitch` and `handleDelete` only invoke the slice operations. They do NOT close the modal directly.
   - The modal is closed by `BranchDetailModal` via `useActionWorkflow`'s `onClose` callback only after the 2-second verified success state or when the user clicks dismiss.
4. **Resilient Dynamic Relative Time Formatter**:
   - Supports:
     1. ISO 8601 strings (`2026-11-03T08:15:00Z`)
     2. Unix timestamps in milliseconds (`1730621700000`)
     3. Unix timestamps in seconds (`1730621700`)
     4. Date objects (`new Date()`)
     5. Strings containing relative markers (calculates from companion `timestamp` if present, or validates format)
   - Guaranteed output format:
     - `< 10s` -> `just now`
     - `< 60s` -> `${s}s ago`
     - `< 60m` -> `${m}m ago`
     - `< 24h` -> `${h}h ago`
     - `< 30d` -> `${d}d ago`
     - `< 12mo` -> `${mo}mo ago`
     - `>= 12mo` -> `${y}y ago`
   - NEVER returns `NaNd ago` or unformatted raw epoch strings.

---

## 6. Implementation Breakdown

### Phase 1: Workflow Engine Hardening (`useActionWorkflow.ts`)
- **Files**: `src/components/common/actionWorkflow/useActionWorkflow.ts` ($\le 150$ LOC).
- **Changes**:
  - Replace `actionFnWrapper` with stable `optionsRef`.
  - Add explicit rejection when `actionResult === false`.
  - Clean up countdown timers reliably on unmount or reset.
- **Validation**: Ensure `execute` reference remains stable between renders; simulate action rejection to verify transition to `'error'`.

### Phase 2: Slice Error Propagation & Dialog Alignment
- **Files**:
  - `src/context/slices/useBranchSlice.ts` ($\le 150$ LOC)
  - `src/context/slices/useCommitSlice.ts` ($\le 150$ LOC)
  - `src/mobile/screens/repo/BranchesScreen.tsx` ($\le 150$ LOC)
  - `src/features/desktop/screens/DesktopBranchesView.tsx` ($\le 150$ LOC)
- **Changes**:
  - In `useBranchSlice.ts`: Throw descriptive errors on duplicate branch names, protected branch deletion, or active branch deletion.
  - In `useCommitSlice.ts`: Throw error when `!state.currentRepo` or when GitHub/local commit execution fails.
  - In `BranchesScreen.tsx`: Remove synchronous `setSelectedBranch(null)` from `handleSwitch` and `handleDelete` so `BranchDetailModal` displays verification progress and auto-closes gracefully.
- **Validation**: Test deleting active branch (shows inline error instead of crashing or disappearing); test successful branch creation/switch (shows full verification flow).

### Phase 3: Timestamp Engine Standardization
- **Files**:
  - `src/mobile/utils/formatters.ts` ($\le 150$ LOC)
  - `src/context/contextUtils.ts` ($\le 150$ LOC)
  - `src/components/commit/CommitItem.tsx` ($\le 150$ LOC)
  - `src/mobile/components/CommitCard.tsx` ($\le 150$ LOC)
- **Changes**:
  - Update `formatRelativeTime` to comprehensively parse dates and avoid returning static bypasses when actual timestamp data is present.
  - Change `formatTime` in `contextUtils.ts` to delegate directly to `formatRelativeTime`.
  - Update `CommitItem.tsx` and `CommitCard.tsx` to pass `commit.timestamp || commit.date || commit.time` through `formatRelativeTime`.
- **Validation**: Inspect commit items and repo cards to ensure all timestamps display dynamic relative formats (`5m ago`, `2h ago`, `3d ago`) with no `NaN`.

---

## 7. Device Experience

### Desktop Experience
- Dialogs display centered modal dialogs with smooth scaling and clear backdrop blur.
- Timestamps render in unboxed monospace tabular-nums with muted contrast for high readability.
- Multi-step verification tracker displays distinct validation, execution, and verification phases with real-time spinners and status checkmarks.

### Tablet Experience
- Adapts dialog widths responsively (`max-w-md sm:max-w-lg`) with centered overlay placement.
- Preserves ample touch targets ($\ge 44\times 44\text{px}$) on close, retry, and back-to-edit action buttons.

### Mobile Experience
- Bottom sheets animate from viewport bottom with proper safe-area bottom inset padding (`pb-[env(safe-area-inset-bottom,0px)]`).
- Auto-close countdown (2s) clearly communicates verification with animated countdown badge and immediate "Dismiss now" action.
- Relative timestamps remain compact (`2m ago`, `5h ago`) to prevent wrapping onto multiple lines.

---

## 8. Non-Functional Requirements & Quality Gates

### Performance
- Storing `options` in `useRef` eliminates unnecessary re-renders of modal dialogs during typing or background sync.
- Timestamps are calculated purely in-memory with negligible CPU overhead.

### Accessibility (a11y)
- Live region announcements for workflow state transitions (`validating`, `executing`, `verifying`, `success`, `error`).
- Action retry and back-to-edit buttons have full keyboard navigation support (`Enter`, `Space`, `Escape`).
- Clear contrast adhering to WCAG 2.1 AA.

### Security
- Ownership checks remain strictly enforced prior to executing any code edits or commits.
- All branch names and commit messages are sanitized before dispatch.

---

## 9. Execution Checklist
1. [ ] Update `src/components/common/actionWorkflow/useActionWorkflow.ts` to stabilize options via ref, handle `false` results as errors, and prevent unmount timer leaks ($\le 150$ LOC).
2. [ ] Update `src/context/slices/useBranchSlice.ts` to throw descriptive errors on invalid branch operations ($\le 150$ LOC).
3. [ ] Update `src/context/slices/useCommitSlice.ts` to propagate execution errors properly ($\le 150$ LOC).
4. [ ] Update `src/mobile/screens/repo/BranchesScreen.tsx` to remove premature `setSelectedBranch(null)` calls, letting `useActionWorkflow` handle dismissal on completion ($\le 150$ LOC).
5. [ ] Update `src/features/desktop/screens/DesktopBranchesView.tsx` to handle error propagation in desktop delete branch flow ($\le 150$ LOC).
6. [ ] Update `src/mobile/utils/formatters.ts` to implement robust dynamic relative time formatting with zero `NaN` possibilities ($\le 150$ LOC).
7. [ ] Update `src/context/contextUtils.ts` so `formatTime` delegates to `formatRelativeTime` ($\le 150$ LOC).
8. [ ] Update `src/components/commit/CommitItem.tsx` and `src/mobile/components/CommitCard.tsx` to format commit timestamps dynamically ($\le 150$ LOC each).
9. [ ] Run `compile_applet` and `lint_applet` together to verify zero syntax or typing errors.
10. [ ] Execute application verification check (10-second wait and error monitoring).

---

## 10. Approval Gate
Awaiting user confirmation to proceed with implementation.
