# Git Manager Codebase Modularization & Architecture Specification

## Executive Summary
Comprehensive Level 4 Architectural Transformation and Modular Restructuring for **Git Manager**. This revised specification guarantees **Zero Feature Loss**: every single interactive capability, offline Git workflow, ZIP synchronization engine, D3 graphical visualizer, GitHub REST integration, and responsive layout pattern across both Desktop and Mobile experiences is cataloged, mapped, and strictly preserved. Every component, hook, state slice, and utility file is decomposed to strictly comply with the **maximum 150 lines-of-code (LOC)** ceiling, enforcing strict PascalCase component naming and camelCase hook/utility naming.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural decisions below have been confirmed through Phase 1 elicitation and user feedback:

- **Zero Feature Loss Guarantee**: Every single feature, button, modal, dropdown, diff viewer, filter chip, sort option, and offline sync capability present in the current codebase is retained with 100% working event handlers. Nothing will be pruned, simplified into mock placeholders, or omitted.
- **Confirmed Architecture**: **Feature-based + Device-based + Reusable Architecture**. Code is divided into clean domain modules (`auth`, `repos`, `commits`, `branches`, `prs`, `files`, `sync`, `cicd`, `clone`, `activity`, `settings`), with clear separation between target devices (`desktop/`, `mobile/`) and shared atomic UI/services (`components/ui/`, `services/`, `utils/`).
- **Confirmed Line Ceiling**: **Strict <= 150 Lines per File**. Applied systematically to all UI components, custom hooks, state slices, context providers, models, engines, and utilities.
- **Confirmed Naming Convention**: **PascalCase** for React components (e.g., `CommitGraphCanvas.tsx`, `RepoCardHeader.tsx`) and **camelCase** for hooks, utilities, and state reducers (e.g., `useCommitHistory.ts`, `zipSyncEngine.ts`).
- **Zero Regression Principle**: 100% backwards compatibility with existing GitHub REST API authentication, localStorage persistence keys (`local_details_*`), D3 commit graph layout, and Monaco syntax highlighting.

---

## 1. Feature Preservation Matrix (Zero Feature Loss Guarantee)

This matrix maps every existing subsystem to its new modular location under the <=150 LOC ceiling, guaranteeing no feature omission:

| Existing Feature Subsystem | Current Monolithic Location | New Modular Architecture (<150 LOC) | Preserved Capabilities |
| :--- | :--- | :--- | :--- |
| **1. GitHub Auth & User Session** | `src/AppContext.tsx`, `UnauthenticatedState.tsx` | `src/features/auth/hooks/useGitHubAuth.ts`<br>`src/features/auth/components/UnauthenticatedState.tsx`<br>`src/context/slices/authSlice.ts` | OAuth/PAT authentication, user avatar/handle display, offline/guest mode fallback, rate limit tracking, safe disconnect/token wipe. |
| **2. Repository Index & CRUD** | `src/AppContext.tsx`, `Repositories.tsx`, `RepoCard.tsx` | `src/features/repos/components/RepoCard.tsx`<br>`src/features/repos/components/RepoFilterBar.tsx`<br>`src/features/repos/components/RepoSortSheet.tsx`<br>`src/features/repos/desktop/DesktopRepoList.tsx`<br>`src/features/repos/mobile/MobileRepoScreen.tsx` | Personal vs Global scope switcher, debounced search, filter chips (All, Public, Private, Forks, Sources), 4 sort modes (asc/desc), pagination with custom page sizes (10, 25, 50, all). |
| **3. GitHub Danger Zone Delete** | `DeleteRepoModal.tsx`, `DesktopLayout.tsx`, `AppContext.tsx` | `src/features/repos/components/DeleteRepoModal.tsx`<br>`src/context/slices/repoSlice.ts` | Exact name confirmation input (`owner/repo`), remote GitHub `DELETE /repos/{owner}/{repo}` with 403 `delete_repo` scope handling, local storage eviction, active workspace auto-fallback navigation. |
| **4. D3 Commit Graph & Visualizer** | `src/components/commit/GitGraph.tsx`, `gitGraphLayout.ts` | `src/features/commits/components/CommitGraphCanvas.tsx`<br>`src/features/commits/components/CommitGraphSvg.tsx`<br>`src/features/commits/utils/gitGraphLayout.ts`<br>`src/features/commits/utils/gitGraphNodes.ts` | D3/SVG curved branch lines, multi-branch lanes, author avatars, merge nodes, interactive node selection, Anime.js micro-interactions. |
| **5. Commit Staging & History** | `CommitList.tsx`, `CommitsScreen.tsx`, `CreateModals.tsx` | `src/features/commits/components/CommitItem.tsx`<br>`src/features/commits/components/CommitFilterToolbar.tsx`<br>`src/features/commits/components/CreateCommitModal.tsx`<br>`src/features/commits/desktop/DesktopCommitList.tsx`<br>`src/features/commits/mobile/MobileCommitsScreen.tsx` | Commit search, branch filter, date grouping, custom commit creation modal with file staging/unstaging and branch targeting. |
| **6. Commit Detail & File Diffs** | `CommitDetailModal.tsx`, `DiffViewer.tsx` | `src/features/commits/modal/CommitDetailModal.tsx`<br>`src/features/commits/modal/CommitDetailHeader.tsx`<br>`src/features/commits/modal/CommitDetailStats.tsx`<br>`src/features/commits/modal/CommitDetailFileList.tsx`<br>`src/features/commits/modal/CommitFileDiffView.tsx` | Full commit metadata, parent SHA, author avatar, additions/deletions stats, multi-file collapsible diff accordions. |
| **7. Commit Rollback & Restore** | `CommitRestoreSheet.tsx` | `src/features/commits/components/CommitRestoreSheet.tsx`<br>`src/features/commits/hooks/useCommitRestore.ts` | Reset hard, reset soft, checkout commit, revert commit with safety confirmation sheet. |
| **8. Branch Operations** | `CreateModals.tsx`, `BranchesScreen.tsx`, `MobileHeader.tsx` | `src/features/branches/components/BranchItem.tsx`<br>`src/features/branches/components/BranchDropdown.tsx`<br>`src/features/branches/components/CreateBranchModal.tsx`<br>`src/features/branches/desktop/DesktopBranchesPane.tsx`<br>`src/features/branches/mobile/MobileBranchesScreen.tsx` | Default branch badge (`main`/`master`), commit count, branch switcher dropdown in header, branch creation modal with source branch selector and name validation. |
| **9. Pull Requests (PRs)** | `PRsScreen.tsx`, `CreateModals.tsx` | `src/features/prs/components/PRItem.tsx`<br>`src/features/prs/components/PRFilterToolbar.tsx`<br>`src/features/prs/components/CreatePRModal.tsx`<br>`src/features/prs/desktop/DesktopPRList.tsx`<br>`src/features/prs/mobile/MobilePRsScreen.tsx` | Open/Closed/Merged filters, author details, branch badges, mergeability status, create PR modal with base/compare branches. |
| **10. File Tree & Code Viewer** | `FilesScreen.tsx`, `MobileFileEditor.tsx`, `MonacoDiffViewer.tsx`, `CodeGutterBar.tsx` | `src/features/files/components/FileTreeNode.tsx`<br>`src/features/files/components/FileBreadcrumbBar.tsx`<br>`src/features/files/components/FileViewerHeader.tsx`<br>`src/features/files/components/FileViewerContent.tsx`<br>`src/features/files/components/MonacoDiffViewer.tsx`<br>`src/features/files/mobile/MobileFileEditor.tsx` | Hierarchical recursive tree, file line counts & byte sizes in numbers, icon-only mobile header (no text eating space), syntax highlighting, line gutter, file editing with in-app commit sheet. |
| **11. ZIP Sync Wizard & Engine** | `ZipSyncModal.tsx`, `zipSyncEngine.ts`, `VisualRootTreePicker.tsx`, `ZipAlignmentBar.tsx` | `src/features/sync/components/ZipSyncModal.tsx`<br>`src/features/sync/components/ZipSyncStepUpload.tsx`<br>`src/features/sync/components/ZipSyncStepRoots.tsx`<br>`src/features/sync/components/ZipSyncStepDiffs.tsx`<br>`src/features/sync/components/ZipSyncStepConflicts.tsx`<br>`src/features/sync/components/VisualRootTreePicker.tsx`<br>`src/features/sync/services/zipSyncEngine.ts`<br>`src/features/sync/services/zipConflictAnalyzer.ts` | Multi-step wizard: upload, root auto-detection with visual tree picker, 3-way diff alignment, interactive conflict resolver (repo version vs ZIP version), commit staged ZIP changes to branch, ZIP export. |
| **12. Workspace Clone Engine** | `CloneScreen.tsx`, `Clone.tsx`, `CloneModal.tsx` | `src/features/clone/components/CloneUrlTab.tsx`<br>`src/features/clone/components/CloneGithubTab.tsx`<br>`src/features/clone/components/CloneZipTab.tsx`<br>`src/features/clone/components/CloneModal.tsx`<br>`src/features/clone/desktop/DesktopCloneScreen.tsx`<br>`src/features/clone/mobile/MobileCloneScreen.tsx` | 3 clone modes: Git URL clone (HTTPS/SSH), GitHub personal/starred clone, local ZIP archive import with extraction progress. |
| **13. CI/CD Pipeline Simulator** | `CiCdStatus.tsx` | `src/features/cicd/components/CiCdPipelineList.tsx`<br>`src/features/cicd/components/CiCdStageGraph.tsx`<br>`src/features/cicd/components/CiCdLogViewer.tsx`<br>`src/features/cicd/CiCdStatus.tsx` | Simulated pipeline runs (build, test, lint, deploy), duration timers, status icons, live terminal logs per stage. |
| **14. Command Palette & Navigation** | `CommandPalette.tsx`, `MobileDrawer.tsx`, `BottomNav.tsx`, `ActionSheet.tsx` | `src/components/layout/CommandPalette.tsx`<br>`src/components/layout/MobileDrawer.tsx`<br>`src/components/layout/MobileBottomNav.tsx`<br>`src/components/layout/MobileActionSheet.tsx` | `Cmd+K` keyboard palette, fuzzy search across repos/branches/files/actions, slide-out drawer, bottom nav bar, quick action sheet with active repo danger zone. |
| **15. Settings & Themes** | `Settings.tsx` | `src/features/settings/components/ThemeSelector.tsx`<br>`src/features/settings/components/StorageManager.tsx`<br>`src/features/settings/SettingsScreen.tsx` | 3 calibrated themes (Dark Charcoal, Warm Linen, Deep Slate), purge localStorage cache, clear simulated commits, telemetry & version info. |

---

## 2. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        src/App.tsx (Root Coordinator)                  │
│     ┌────────────────────────────────────────────────────────────┐     │
│     │        AppProvider (Composite Facade / Domain Slices)      │     │
│     │  authSlice · repoSlice · commitSlice · branchSlice · ...   │     │
│     └──────────────────────────────┬─────────────────────────────┘     │
│                                    │                                   │
│            ┌───────────────────────┴───────────────────────┐           │
│            ▼                                               ▼           │
│  useIsDesktop() == true                          useIsDesktop() == false│
│  ┌─────────────────────────┐                     ┌───────────────────┐ │
│  │ DesktopWorkspaceLayout  │                     │  MobileShell      │ │
│  │ ├─ DesktopHeader        │                     │  ├─ MobileHeader  │ │
│  │ ├─ DesktopSidebar       │                     │  ├─ RepoTabs      │ │
│  │ └─ Split Workspace Pane │                     │  ├─ PullToRefresh │ │
│  │    ├─ RepoList / Commits│                     │  ├─ Mobile Screens│ │
│  │    └─ Diff / FileViewer │                     │  └─ BottomNav     │ │
│  └─────────┬───────────────┘                     └─────────┬─────────┘ │
│            │                                               │           │
│            ▼                                               ▼           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Feature Domain Modules                       │  │
│  │  auth/ · repos/ · commits/ · branches/ · prs/ · files/ · sync/  │  │
│  │  cicd/ · clone/ · settings/ · dashboard/ · activity/             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   Shared Primitives & Utilities                  │  │
│  │  components/ui/ · hooks/ · services/ · types/ · utils/          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Strict 150-Line-per-File Decomposition Plan

Every target file is designed to comfortably sit between 40 and 140 lines of code.

### A. Context & State Decomposition (`src/context/`)
1. `src/context/AppContext.tsx` (~115 LOC): Master facade exposing `useAppContext()`. Combines slice hooks into the unified context object for 100% backwards compatibility with all components.
2. `src/context/slices/authSlice.ts` (~135 LOC): Handles `githubUser`, `githubToken`, `connectGitHub`, `disconnectGitHub`, and rate limits.
3. `src/context/slices/repoSlice.ts` (~140 LOC): Handles `githubRepos`, `currentRepo`, `openRepo`, `deleteRepo`, and repo caching.
4. `src/context/slices/branchSlice.ts` (~125 LOC): Handles `currentBranch`, `activeBranches`, `switchBranch`, and branch creation.
5. `src/context/slices/commitSlice.ts` (~140 LOC): Handles `commits`, `stagedFiles`, `addCommit`, `rollbackCommit`, and graph nodes.
6. `src/context/slices/prSlice.ts` (~130 LOC): Handles `pullRequests`, `createPR`, and PR filters.
7. `src/context/slices/fileSlice.ts` (~135 LOC): Handles `fileTree`, `activeFile`, `fileContent`, and editing state.
8. `src/context/slices/syncSlice.ts` (~130 LOC): Handles `isZipSyncOpen`, `zipSyncData`, and conflict resolution states.
9. `src/context/slices/uiSlice.ts` (~120 LOC): Handles `currentScreen`, `modals`, `theme`, `toasts`, and `commandPalette`.
10. `src/context/slices/paginationSlice.ts` (~110 LOC): Handles pagination, search queries, scope, and sorting.

### B. Shared UI Primitives (`src/components/ui/`)
1. `Button.tsx` (~85 LOC): Standard, secondary, ghost, danger buttons.
2. `Modal.tsx` (~110 LOC): Accessible dialog wrapper with backdrop, escape key, focus trapping.
3. `Input.tsx` (~75 LOC): Text inputs with search icon, clear button, error state.
4. `Dropdown.tsx` (~100 LOC): Floating popover dropdown with animation.
5. `EmptyState.tsx` (~95 LOC): Polished empty state with icons and primary/secondary CTAs.
6. `Skeleton.tsx` (~110 LOC): Loading skeletons matching table/card geometry.
7. `InlineErrorCard.tsx` (~105 LOC): Inline error notice with retry triggers.
8. `PaginationControls.tsx` (~135 LOC): Pagination bar with custom page size selector.
9. `Toast.tsx` (~80 LOC): Floating status toast messages.

### C. Feature Modules (`src/features/`)
Each domain houses its components, custom hooks, and screen wrappers, ensuring complete isolation and SRP:
- **`features/repos/`**: `RepoCard.tsx` (115 LOC), `RepoCardHeader.tsx` (75 LOC), `RepoCardMeta.tsx` (85 LOC), `RepoFilterBar.tsx` (105 LOC), `RepoSortSheet.tsx` (125 LOC), `DeleteRepoModal.tsx` (135 LOC), `CreateRepoModal.tsx` (120 LOC), `DesktopRepoList.tsx` (115 LOC), `DesktopRepoDetailPane.tsx` (135 LOC), `MobileRepoScreen.tsx` (125 LOC).
- **`features/commits/`**: `CommitItem.tsx` (105 LOC), `CommitGraphCanvas.tsx` (135 LOC), `CommitGraphSvg.tsx` (130 LOC), `CommitDetailModal.tsx` (95 LOC), `CommitDetailHeader.tsx` (85 LOC), `CommitDetailStats.tsx` (80 LOC), `CommitDetailFileList.tsx` (115 LOC), `CommitRestoreSheet.tsx` (135 LOC), `CreateCommitModal.tsx` (125 LOC), `DesktopCommitList.tsx` (125 LOC), `MobileCommitsScreen.tsx` (135 LOC).
- **`features/files/`**: `FileTreeNode.tsx` (105 LOC), `FileBreadcrumbBar.tsx` (80 LOC), `FileViewerHeader.tsx` (90 LOC), `FileViewerContent.tsx` (125 LOC), `MonacoDiffViewer.tsx` (135 LOC), `MobileFileEditor.tsx` (130 LOC), `DesktopFileBrowser.tsx` (125 LOC), `MobileFilesScreen.tsx` (135 LOC).
- **`features/sync/`**: `ZipSyncModal.tsx` (105 LOC), `ZipSyncStepUpload.tsx` (95 LOC), `ZipSyncStepRoots.tsx` (125 LOC), `ZipSyncStepDiffs.tsx` (135 LOC), `ZipSyncStepConflicts.tsx` (135 LOC), `VisualRootTreePicker.tsx` (135 LOC), `ZipAlignmentBar.tsx` (120 LOC), `zipSyncEngine.ts` (135 LOC), `zipConflictAnalyzer.ts` (125 LOC), `zipTreeExtractor.ts` (115 LOC), `zipExportService.ts` (105 LOC).
- **`features/clone/`**: `CloneUrlTab.tsx` (125 LOC), `CloneGithubTab.tsx` (135 LOC), `CloneZipTab.tsx` (125 LOC), `CloneModal.tsx` (115 LOC), `DesktopCloneScreen.tsx` (135 LOC), `MobileCloneScreen.tsx` (135 LOC).
- **`features/branches/`**, **`features/prs/`**, **`features/cicd/`**, **`features/dashboard/`**, **`features/settings/`**, **`features/activity/`**: All decomposed cleanly into sub-components under 150 LOC.

---

## 4. Implementation Phasing & Validation Gates

### Phase 1: Foundation, Types & Services Modularization
- Split `src/types.ts` into specialized type files (`repoTypes.ts`, `commitTypes.ts`, `syncTypes.ts`, `contextTypes.ts`).
- Extract atomic UI primitives (`Button`, `Modal`, `EmptyState`, `Skeleton`, `PaginationControls`) into `src/components/ui/`.
- Modularize utilities (`formatters`, `treeBuilder`, `sortRepos`, `deviceSync`) and services (`gitApi`, `storageService`).
- **Validation Gate**: Verify TypeScript compilation (`tsc --noEmit`).

### Phase 2: State Store Slicing (`AppContext.tsx` -> Domain Slices)
- Create slices under `src/context/slices/` for auth, repos, commits, branches, PRs, files, sync, UI, and pagination.
- Recompose `AppContext.tsx` as a high-performance facade matching 100% of the existing `AppContextType` signature.
- **Validation Gate**: Verify zero breaking changes for existing components accessing `useAppContext()`.

### Phase 3: Desktop Monolith Decomposition (`DesktopLayout.tsx` & Desktop Screens)
- Break down `DesktopLayout.tsx` (2,931 LOC) into `DesktopHeader`, `DesktopSidebar`, and modular feature panes in `src/features/*/desktop/`.
- Modularize desktop `CloneScreen.tsx` (1,496 LOC) into tabbed sub-components (`CloneUrlTab`, `CloneGithubTab`, `CloneZipTab`).
- **Validation Gate**: Verify desktop layout, 3-column split view, commit inspector, and diff viewer.

### Phase 4: Mobile Screens & Modals Decomposition
- Decompose `ZipSyncModal.tsx` (1,052 LOC) into step-by-step wizard components.
- Decompose `CommitDetailModal.tsx` (1,043 LOC) into header, stats, and diff sub-components.
- Decompose `CreateModals.tsx` (548 LOC) into individual modals (`CreateRepoModal`, `CreateBranchModal`, etc.).
- Modularize mobile screens (`CommitsScreen`, `FilesScreen`, `PRsScreen`, `BranchesScreen`, `Clone`).
- **Validation Gate**: Verify touch gestures, pull-to-refresh, bottom navigation, drawer, and action sheets.

### Phase 5: Audit, Verification & Stability
- Automated line count check: Run `find src -name "*.ts" -o -name "*.tsx" | xargs wc -l` to verify 100% of files are <= 150 lines.
- Run `lint_applet` (`tsc --noEmit`) to verify 0 type errors.
- Run `compile_applet` / `npm run build` to verify clean production build.
- Dev server stability check: Restart server, wait 10s, verify HTTP 200 OK and clean console.

---

## 5. Execution Checklist

- [ ] Phase 1: Split `types.ts` into specialized type modules (<= 150 LOC each).
- [ ] Phase 1: Extract atomic UI components (`Button`, `Modal`, `Input`, `EmptyState`, etc.) into `src/components/ui/`.
- [ ] Phase 1: Modularize shared utilities (`formatters`, `treeBuilder`, `sortRepos`, `deviceSync`, `zipEngine`).
- [ ] Phase 2: Split `AppContext.tsx` into domain state slices under `src/context/slices/`.
- [ ] Phase 2: Wire `AppContext` facade preserving all existing hooks and consumers.
- [ ] Phase 3: Split `DesktopLayout.tsx` into `DesktopHeader`, `DesktopSidebar`, and feature desktop panes.
- [ ] Phase 3: Modularize desktop `CloneScreen.tsx` into tab sub-components.
- [ ] Phase 4: Split `ZipSyncModal.tsx` into step-by-step wizard components (<= 150 LOC each).
- [ ] Phase 4: Split `CommitDetailModal.tsx` into header, stats, and diff sub-components.
- [ ] Phase 4: Split `CreateModals.tsx` into individual modal components.
- [ ] Phase 4: Modularize mobile screens (`CommitsScreen`, `FilesScreen`, `PRsScreen`, `BranchesScreen`, `Clone`).
- [ ] Phase 5: Run automated line count audit to verify all files are <= 150 LOC.
- [ ] Phase 5: Run `lint_applet` (`tsc --noEmit`) and verify 0 type errors.
- [ ] Phase 5: Run `compile_applet` / `npm run build` and verify clean build.
- [ ] Phase 5: Restart dev server, wait 10s, and verify HTTP 200 OK with zero console errors.
