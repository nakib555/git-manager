# Master Engineering Plan: Real-Time Auto-Updating Data & Desktop-Mobile Functional Parity (COMPLETED)

## Complexity Classification: Level 3 (Large Feature & System Synchronization Engine)

---

## 1. Verified Facts & Root Cause Resolution

1. **Auto-Update Engine Breakdown in AppContext.tsx (Resolved)**:
   - Refactored the background sync interval using a stable `stateRef` pattern. This completely eliminates dependency array churn caused by `state.githubRepos` generating new references, allowing the 10-second auto-sync interval to run without interruptions or resets.
   - Removed the token-only restriction on background polling: guest and public exploration modes now auto-synchronize repository details and fallback caches in real time.
   - Added a `visibilitychange` listener that triggers immediate synchronization whenever the user returns to or focuses the browser tab.

2. **Critical GitHub API Endpoints Bugs (Resolved)**:
   - Fixed `createLocalCommit`: Replaced invalid `/git/trees/HEAD...` URL with the correct GitHub Contents API endpoint `https://api.github.com/repos/${owner}/${repo}/contents/${path}`.
   - Added offline/local commit fallback so commits created in guest or offline mode save to `localStorage`, increment session commit counts, and broadcast live update events across all open screens.

3. **Desktop vs. Mobile Functional Parity (Completed)**:
   - **Pull Requests Screen (`src/mobile/screens/repo/PRsScreen.tsx`)**: Upgraded from a static toast notification to a full-featured PR review workstation. Mobile users can now inspect pull requests, read descriptions, review commit lists, inspect file diffs with syntax highlighting, and perform Merge (Merge Commit or Squash & Merge) with optional source branch deletion, or Close/Reopen PRs.
   - **Commits Screen (`src/mobile/screens/repo/CommitsScreen.tsx`)**: Added a direct "+ New Commit" button triggering the commit modal.
   - **ActionSheet (`src/mobile/components/ActionSheet.tsx`)**: Added the "Commit Changes" action when inside an active repository.
   - **Clone Screen (`src/mobile/screens/Clone.tsx`)**: Added popular open-source repositories quick-pick (`react`, `tailwindcss`, `vscode`, `next.js`, `bun`), clone depth options, and a direct "Download Repository as ZIP Archive" action via `/api/github/download`.
   - **Repository Owner Fallback (`src/mobile/screens/Repositories.tsx`)**: Passed `repo.owner?.login` into `openRepo` to prevent cross-repository owner misalignment.
   - **Activity Feed (`src/mobile/screens/Activity.tsx`) & Dashboard**: Added 15-second background auto-sync so newly pushed commits and remote GitHub events appear automatically without manual interaction.

---

## 2. Execution Checklist Status

- [x] Refactor auto-update polling loop in `src/AppContext.tsx` using `useRef` to eliminate dependency cycles.
- [x] Fix GitHub commit creation API endpoint in `src/AppContext.tsx` (`/contents/${path}`).
- [x] Pass `repo.owner?.login` into `openRepo` in `src/mobile/screens/Repositories.tsx`.
- [x] Add "+ New Commit" button to `src/mobile/screens/repo/CommitsScreen.tsx`.
- [x] Add "Commit Changes" action to `src/mobile/components/ActionSheet.tsx`.
- [x] Upgrade `src/mobile/screens/repo/PRsScreen.tsx` with full PR detail viewer, diffs, and merge controls.
- [x] Upgrade `src/mobile/screens/Clone.tsx` with popular repos quick-pick and real zip download.
- [x] Add auto-refresh polling subscription to `src/mobile/screens/Activity.tsx` and `DesktopDashboard`.
- [x] Execute `lint_applet` (Passed cleanly, 0 errors).
- [x] Execute `compile_applet` (Passed cleanly, 0 errors).
- [x] Restart dev server.
