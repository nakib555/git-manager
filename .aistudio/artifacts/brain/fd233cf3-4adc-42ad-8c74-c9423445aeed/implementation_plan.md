# Master Engineering Plan: Full Admin-Level Authority & Admin Commands

## User Review & Critical Decisions

> [!IMPORTANT]
> The goal of this specification is to make all actions, permissions, and commands operate at **Admin Level**:
> 1. **Permission Authority Condition ("cnd")**: Elevate repository permission checks (`isRepositoryOwnedByUser`) beyond username string-matching to recognize GitHub App and OAuth admin/push permissions (`permissions.admin`, `permissions.push`), organization memberships, and an Admin Authority Override. This unlocks editing, file/folder deletion, branch deletion, and repository deletion across all administered repositories.
> 2. **Admin-Level Commands ("cmd")**: Enrich the Command Palette (`useCommandPaletteItems.ts`) with dedicated administrative commands: Delete Repository, Delete Active File/Folder, Force Reset Branch, Amend Commit, Create Protected Tag, and Purge Storage Caches.
> 3. **Admin Visual Hierarchy**: Replace restrictive "Read-only" warnings with clear "Admin Authority" indicators whenever admin permissions are detected.

---

## 1. Objective

### Purpose
To unlock full administrative control across the Git Manager workbench so that every file, commit, branch, pull request, and repository management action executes with full admin authority without being artificially blocked by client-side single-owner name checks.

### Problem
- `isRepositoryOwnedByUser` currently compares `repoOwner === userLogin`. For organization repositories (e.g., `my-org/my-repo`) or collaborator repositories where the user has administrative or push rights (`permissions.admin === true` or `permissions.push === true`), the app incorrectly classifies the repository as "Read-only (Global)", blocking file edits, file deletions, and branch operations.
- GitHub Apps and PATs with fine-grained admin permissions don't always populate the legacy `x-oauth-scopes` header with `delete_repo`, causing repository deletion checks to fail even when the user has administration authority.
- The Command Palette lacks quick administrative actions (e.g. direct delete commands, branch resets, cache purges).

### Business & Technical Value
- **Enterprise Collaboration**: Enables seamless administration of team and organization repositories.
- **Power User Experience**: Direct keyboard-driven administrative actions via Command Palette (`Ctrl/Cmd + K`).
- **Security & Integrity**: Accurately respects real GitHub API permission flags (`permissions.admin`, `permissions.push`) rather than naive string matching.

### Success & Acceptance Criteria
- [ ] `isRepositoryOwnedByUser` evaluates true if `permissions.admin === true`, `permissions.push === true`, `repo.isLocal === true`, or `repoOwner === userLogin`.
- [ ] Added global `adminModeOverride` state toggle in `AppContext` allowing power users to force administrative authority.
- [ ] Repositories with admin rights display `Admin Authority` badge instead of `Read-only (Global)`.
- [ ] Command Palette features a dedicated **Admin** category with commands:
  - `Admin: Delete Current Repository`
  - `Admin: Delete Current File / Folder`
  - `Admin: Reset Branch to Commit`
  - `Admin: Amend Latest Commit`
  - `Admin: Purge Local Storage & Caches`
  - `Admin: Toggle Admin Mode Override`
- [ ] All file editing, file/folder batch deletion, and branch deletion operations work smoothly across both personal and organization-owned repositories.

---

## 2. Existing System Analysis

### Architecture & Components
- **`src/mobile/utils/repoOwnership.ts`**: Currently only returns true if `userLower === ownerLower`. Completely ignores `matched.permissions.admin` and `matched.permissions.push` returned by GitHub REST API (`GET /user/repos` or `GET /repos/{owner}/{repo}`).
- **`src/context/slices/useRepoSlice.ts`**: Blocks repo deletion if `!state.hasDeleteRepoScope`, which fails for GitHub Apps that use fine-grained Administration Read/Write permissions instead of legacy OAuth scopes.
- **`src/features/desktop/screens/DesktopFilesView.tsx` & `src/mobile/screens/repo/FilesScreen.tsx`**: Uses `isOwner` to disable file editing and deletion triggers.
- **`src/components/palette/useCommandPaletteItems.ts`**: Only offers generic navigation, new repo, and theme toggle actions.

---

## 3. Architecture Design

### ASCII Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   GitHub API / App Token / PAT                         │
│   (Returns repo object with permissions: { admin: true, push: true })   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Admin Authority Resolver                             │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │   isRepositoryOwnedByUser(repo, user, reposList)               │   │
│   │   - Owner matches userLogin?                        --> ADMIN  │   │
│   │   - repo.permissions.admin === true?                --> ADMIN  │   │
│   │   - repo.permissions.push === true?                 --> ADMIN  │   │
│   │   - adminModeOverride === true?                     --> ADMIN  │   │
│   │   - repo.isLocal === true?                          --> ADMIN  │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────────────┐   ┌───────────────────────────────────┐
│     Workbench UI & Workspaces        │   │       Command Palette (Cmd+K)     │
│ - "Admin Authority" Badge            │   │ - Admin: Delete Repository        │
│ - Unrestricted File/Folder Deletion  │   │ - Admin: Delete Current File/Dir  │
│ - Full Branch Deletion & Commits     │   │ - Admin: Reset Branch to Commit   │
│ - Repository Administration Dialog   │   │ - Admin: Purge Storage Caches     │
└──────────────────────────────────────┘   └───────────────────────────────────┘
```

### Key Changes
1. **`src/mobile/utils/repoOwnership.ts`**:
   - Upgrade `isRepositoryOwnedByUser` to inspect `matched?.permissions?.admin` and `matched?.permissions?.push`.
   - Support `adminOverride?: boolean` parameter.
2. **`src/types/appTypes.ts` & `src/AppContext.tsx`**:
   - Add `adminModeOverride: boolean` and `toggleAdminMode: () => void`.
3. **`src/components/palette/useCommandPaletteItems.ts`**:
   - Add the full suite of **Admin Commands**.
4. **`src/features/desktop/screens/DesktopFilesView.tsx` & `src/mobile/screens/repo/files/FileViewerModalHeader.tsx`**:
   - Render `Admin Authority` badge for admin/push repositories.
5. **`src/context/slices/useRepoSlice.ts`**:
   - Allow repo deletion if user has `permissions.admin === true` or is the repo owner or has admin override.

---

## 4. Implementation Breakdown

### Phase 1: Permission Engine Upgrade
- Update `src/mobile/utils/repoOwnership.ts` to check GitHub repository permission flags (`admin`, `push`, `maintain`) and optional admin override.
- Update `useRepoSlice.ts` to recognize GitHub App admin permissions for repository operations.

### Phase 2: Global Admin State & Toggle
- Add `adminModeOverride` state to `useUISlice.ts` and expose it through `AppContext`.
- Add an Admin Mode toggle in Desktop and Mobile Settings.

### Phase 3: Admin Commands in Command Palette
- Add admin actions to `src/components/palette/useCommandPaletteItems.ts`:
  - Delete repo, delete file, reset branch, amend commit, purge cache, toggle admin mode.

### Phase 4: UI Admin Indicators & Polish
- Update `DesktopFilesView.tsx` and `FileViewerModalHeader.tsx` to display an `Admin Authority` badge.

---

## 5. Execution Checklist

- [ ] **Step 1**: Upgrade `repoOwnership.ts` to evaluate `permissions.admin` and `permissions.push`.
- [ ] **Step 2**: Add `adminModeOverride` and `toggleAdminMode` in `useUISlice.ts` and `AppContext.tsx`.
- [ ] **Step 3**: Update `useRepoSlice.ts` repo deletion guard to allow admin-level deletions.
- [ ] **Step 4**: Inject Admin Commands into `useCommandPaletteItems.ts`.
- [ ] **Step 5**: Display `Admin Authority` badge in `DesktopFilesView.tsx` and `FileViewerModalHeader.tsx`.
- [ ] **Step 6**: Verify with `compile_applet` and `lint_applet`.
- [ ] **Step 7**: Dev server verification and console inspection.

---

## 6. Approval Gate

Following the Master Engineering Protocol:
**STOP.** No implementation code has been modified. Awaiting your explicit approval (`Approved`, `Proceed`, or `Implement`) to execute this plan.
