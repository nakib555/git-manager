# Engineering Plan: Comprehensive Functional Repair, Animated Confirmation Loaders & Safe-Area Padding

## Verified Facts
1. **Broken / Stubbed Functions in App Context**:
   - `createBranchAtCommit` and `createTagAtCommit` in `useCommitSlice.ts` (lines 136–137) return stubbed error toasts: `"Creating branch at commit is not supported."` and `"Creating tags is not supported."` when users submit branch/tag names in `CommitBranchTagInputs.tsx`.
   - `createLocalRepo`, `createLocalBranch`, `createLocalPR`, and `updateLocalPRStatus` currently fail with immediate rejection toasts when `githubToken` is absent or unauthenticated, instead of seamlessly creating or updating local resources in `localStorage` (`localRepos`, `local_details_<repo>_*`).
   - `amendLatestCommit` and `resetBranchToCommit` are stubbed out with toasts rather than updating the working state and commit log.
2. **Missing Mobile Safe-Area Insets**:
   - Several mobile bottom sheets (`CommitDetailModal.tsx`, `CommitsDeleteHeadDialog.tsx`, `CreateModals.tsx`, `DeleteRepoModal.tsx`, `EditorDiscardDialog.tsx`, `CloneQrCodeModal.tsx`, `ZipSyncModal.tsx`, `DirectoryTreeModal.tsx`) use hardcoded padding without `pb-[calc(env(safe-area-inset-bottom,0px)+16px)]` or `paddingBottom: 'env(safe-area-inset-bottom)'`, causing buttons and action footers to be partially obscured by iOS/Android gesture navigation bars.
3. **Confirmation & Loading States**:
   - Destructive or significant Git mutations (repository deletion, HEAD commit deletion, PR merge/close, commit restore/revert, file editor discard) either execute instantly with a plain spinner or lack visual confirmation countdown/progress states.
4. **File Length Constraints**:
   - All files must strictly maintain the `<= 150` lines-of-code ceiling.

## Assumptions
- When connected to GitHub with a valid token, functions execute remote REST API calls (`/repos/{owner}/{repo}/git/refs`, `/repos/{owner}/{repo}/pulls`, etc.).
- When in demo mode or unauthenticated, all functions should function 100% locally by persisting to `localStorage` and updating the in-memory React state, providing a fully functional playground.
- Confirmation modals should feature a distinctive circular countdown or pulse transition loader to prevent accidental clicks on high-impact actions.

## Missing Information
- None. Requirements and operation lists clarified via user inputs.

## Complexity Classification
- **Level 3 (Large Feature / System-Wide Architecture & Flow Repair)**

---

## Objective
- **Purpose**:
  1. Fix every non-working function in the Git Manager application so all workflows (Repo creation, Branch creation, Branch at Commit, Tag at Commit, Commit creation, PR opening, PR merging/closing, file saving, file discarding, commit deleting, and commit restoring) work reliably in both offline/local mode and authenticated GitHub mode.
  2. Implement interactive confirmation loaders with visual progress and countdown states for all 5 requested operations (Delete repository, Delete HEAD commit, Merge/close PR, Revert/restore commit, Discard file changes).
  3. Enforce `padding-bottom: env(safe-area-inset-bottom)` across all mobile bottom sheet containers to eliminate home indicator clipping on mobile devices.

---

## Existing System Analysis
- `src/context/slices/useCommitSlice.ts`:
  - Contains stubbed `createBranchAtCommit` and `createTagAtCommit`.
  - Can call GitHub REST API `POST /repos/{owner}/{repo}/git/refs` when authenticated (`refs/heads/{branch}` or `refs/tags/{tag}` at given SHA) and update local branch/tag arrays in localStorage when offline.
- `src/context/slices/useRepoSlice.ts`:
  - `createLocalRepo`: Currently rejects without token. Can create local repo in `localStorage.setItem('localRepos')` with initial README, commits, and branches.
- `src/context/slices/useBranchSlice.ts`:
  - `createLocalBranch`: Currently rejects without token. Can create local branch in `local_details_<repo>_branches`.
- `src/context/slices/usePRSlice.ts`:
  - `createLocalPR` & `updateLocalPRStatus`: Currently reject without token. Can create and transition PR statuses in `local_details_<repo>_prs`.
- `src/components/ui/` / Confirmation Loaders:
  - We will introduce a reusable, lightweight `<ActionConfirmationLoader />` or integrate animated radial countdown bars into confirmation dialogs.

---

## Architecture Design

### 1. Unified Dual-Mode Execution (GitHub + Offline Fallback)
```
[User Action] 
     │
     ▼
[Check Authentication: state.githubToken && state.currentRepoOwner]
     ├── (Authenticated) ──> Call GitHub REST API ──> Sync Repo Details
     └── (Offline / Demo) ──> Update localStorage ──> Update React State & Toast
```
- **Branch at Commit SHA**:
  - Remote: `POST /repos/{owner}/{repo}/git/refs` with `ref: 'refs/heads/' + name`, `sha`.
  - Local: Push `{ name, isDefault: false, commitHash: sha }` to `local_details_<repo>_branches`.
- **Tag at Commit SHA**:
  - Remote: `POST /repos/{owner}/{repo}/git/refs` with `ref: 'refs/tags/' + name`, `sha`.
  - Local: Store tags in `local_details_<repo>_tags` and update commit tags.
- **Repository Creation**:
  - Remote: `POST /user/repos`.
  - Local: Create `{ id, name, owner: { login: 'local-user' }, description, language, ... }` in `localRepos`.
- **Branch Creation**:
  - Remote: Create branch from current branch tip.
  - Local: Append branch to `local_details_<repo>_branches`.
- **Pull Request Creation & Merge**:
  - Remote: `POST /repos/{owner}/{repo}/pulls`, `PUT /repos/{owner}/{repo}/pulls/{number}/merge`.
  - Local: Append PR to `local_details_<repo>_prs` with statuses `'Open' | 'Merged' | 'Closed'`.

### 2. Animated Confirmation Loaders
For all 5 confirmed high-impact actions:
1. **Delete Repository**: Animated 3-second hold/countdown loader or verification transition.
2. **Delete HEAD Commit**: Rollback transition spinner with step-down animation.
3. **Merge / Close PR**: Interactive merging state with status badge transition.
4. **Revert / Restore Commit**: Multi-step progress bar ("Analyzing diffs" -> "Applying patch" -> "Committed").
5. **Discard File Edits**: Clean confirmation barrier with tactile action.

### 3. Safe-Area Padding Enforcement
In every mobile bottom sheet container:
- CSS class: `pb-[calc(env(safe-area-inset-bottom,0px)+16px)]` or inline style `paddingBottom: 'max(16px, env(safe-area-inset-bottom))'`.
- Applies to: `CommitDetailModal`, `CommitsDeleteHeadDialog`, `CreateModals`, `DeleteRepoModal`, `EditorDiscardDialog`, `CloneQrCodeModal`, `ZipSyncModal`, `DirectoryTreeModal`, and `CommitRestoreSheet`.

---

## Implementation Breakdown

### Phase 1: Context & Slice Functional Repair
- Update `useCommitSlice.ts` to implement real `createBranchAtCommit` and `createTagAtCommit` (both for remote GitHub API and local persistence).
- Update `useRepoSlice.ts` to support offline repository creation.
- Update `useBranchSlice.ts` to support offline branch creation.
- Update `usePRSlice.ts` to support offline PR creation and state updates.

### Phase 2: Confirmation Loaders
- Create `src/components/ui/ConfirmationCountdownButton.tsx` (reusable button with animated progress ring/bar for high-impact actions).
- Integrate confirmation loaders into:
  - `DeleteRepoModal.tsx`
  - `CommitsDeleteHeadDialog.tsx`
  - `CommitRestoreFooter.tsx`
  - `EditorDiscardDialog.tsx`
  - `src/features/pr/components/` (PR merge/close controls)

### Phase 3: Mobile Bottom Sheet Safe-Area Inset Hardening
- Audit and add `pb-[calc(env(safe-area-inset-bottom,0px)+16px)]` to all 9 mobile bottom sheet dialog containers.

### Phase 4: Verification
- Verify line counts (<= 150 LOC per file).
- Run `compile_applet` and `lint_applet`.
- Restart dev server and verify HTTP 200 after 10-second stabilization.

---

## Approval Gate
In accordance with protocol, no file modifications will be made until you review and approve this plan.
Reply with **"Approved"**, **"Proceed"**, or **"Implement"** to begin execution.
