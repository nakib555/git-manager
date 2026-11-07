# Engineering Plan: Fix All Dialog Box Action Failures & GitHub OAuth Integration

Addresses the root cause of why file edits appear to work while dialog box actions (Create Repo, Create Branch, Create PR, Commit, Delete Repo) fail even when connected or reconnected. Fixes the silent fallback discrepancy, resolves the demo repo trap (`octodev/nexus-web-engine`), standardizes GitHub Authorization headers, dynamically populates real remote branches in dialogs, and provides an inline re-authentication prompt.

---

## 1. Verified Evidence: Why File Edits Work While Dialogs Fail

### The Core Architectural Discrepancy
1. **Why File Edits Work (`saveAndCommitFile`)**:
   - In `src/context/slices/commitSliceServices.ts` (lines 124–131):
     ```typescript
     if (githubToken && owner && owner !== 'local-user') {
       try {
         const res = await pushFileToGitHub(owner, repo, cleanPath, content, fullMsg, branch, githubToken);
         return { isRemote: true, sha: shortSha };
       } catch (err: any) {
         // Remote push failed, proceed to local save with warning
       }
     }
     // Slices proceed to local save in localStorage and return success!
     return { isRemote: false, sha: localHash, updatedCommits: updated };
     ```
   - When a user edits a file in `useMobileFileEditor.ts`, `saveAndCommitFile` is called. Even if GitHub returns a 401, 403, or 404 error, the file editor's underlying service **silently catches the error**, saves the file to browser `localStorage`, and returns `{ success: true }`. The editor closes happily, making file edits appear completely functional.
2. **Why Dialog Box Actions Fail (`useActionWorkflow`)**:
   - In contrast, all modal dialogs (`RepoForm`, `BranchForm`, `PRForm`, `CommitForm`, `DeleteRepoModal`) run through `useActionWorkflow`.
   - In `useCommitSlice.ts` (`createLocalCommit`), `useBranchSlice.ts` (`createLocalBranch`), and `useRepoSlice.ts` (`deleteRepo`), when GitHub API requests fail, they throw an unhandled error or return `false`.
   - `useActionWorkflow` catches the exception and immediately transitions the dialog to `phase: 'error'`, displaying the red `ActionErrorCard`.
3. **The "Connected / Reconnected" Demo Repo Trap**:
   - In `src/context/slices/useAuthSlice.ts` (lines 44–54):
     ```typescript
     if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
       const token = event.data.token;
       localStorage.setItem("githubToken", token);
       setState((prev) => ({ ...prev, githubToken: token }));
       showToast("Successfully connected to GitHub", "success");
     }
     ```
   - Notice that upon OAuth completion, **`fetchGitHubData(token)` is never invoked** and `currentRepo` / `currentRepoOwner` are never updated to the user's account!
   - Because initial state defaults to `currentRepo = "nexus-web-engine"` and `currentRepoOwner = "octodev"`, the user remains on `octodev`'s demo repository even while their GitHub token is active.
   - When the user opens a dialog to create a branch, commit, or PR, the app attempts to execute against `https://api.github.com/repos/octodev/nexus-web-engine/...`. GitHub naturally returns **404 Not Found** or **403 Forbidden** because the user does not own `octodev`'s repo!
4. **Header Discrepancy Between File Edit & Dialog Services**:
   - In `gitCommitFileService.ts` (used by file edit), line 11:
     `token.startsWith('Bearer ') || token.startsWith('token ') ? token : 'token ' + token`
   - In `gitMutationServices.ts` (used by branch creation) and `gitPrMutationServices.ts` (used by PR creation):
     Hardcoded `Authorization: Bearer ${token}`.
   - GitHub's REST API for Git Database endpoints (`/git/refs`) rejects classic Personal Access Tokens (`ghp_...`) when prefixed with `Bearer` instead of `token`.
5. **Phantom Demo Branch References in PR Dialog**:
   - `PRForm.tsx` defaults its comparison dropdowns to `activeBranches`, which contains demo branches (`develop`, `feature/analytics`) from `DEMO_BRANCHES`.
   - If the user creates a PR comparing `develop` to `main` on their real GitHub repo, GitHub responds with `422 Unprocessable Entity` ("head ref does not exist") because `develop` only exists in client mock state.

---

## 2. Objective

### Purpose
Make all dialog box actions (Create Repo, Create Branch, Create PR, Commit, Delete Repo) function seamlessly with GitHub, eliminate the demo repo trap upon OAuth login/reconnection, ensure all API mutation calls use valid auth schemes, populate genuine remote branches, and present actionable error resolution with one-click re-authentication.

### Success Criteria
1. Re-authenticating or connecting via OAuth (`/auth/callback` popup) automatically updates the user's profile and switches the workspace to their owned GitHub repositories instead of leaving them stranded on `octodev/nexus-web-engine`.
2. All mutation endpoints (`createRemoteGitHubBranch`, `createRemoteGitHubPR`, `createRemoteGitHubRepo`, `deleteRemoteGitHubRepo`, `pushFileToGitHub`) use robust header formatting:
   `token.startsWith('Bearer ') || token.startsWith('token ') ? token : (token.startsWith('ghp_') ? 'token ' + token : 'Bearer ' + token)`.
3. In `findBaseSha`, if `refs/heads/main` or `master` is missing, the service inspects the user's actual active branch (`currentBranch`) and default branch from GitHub metadata.
4. When in a demo repository or unowned repo, dialogs clearly inform the user: *"You are viewing demo repo 'nexus-web-engine'. Select or create your own repository to push live GitHub changes."*
5. In `ActionErrorCard`, if an action fails due to credentials or permissions (HTTP 401/403), an inline "Re-authenticate GitHub" button is rendered, allowing the user to refresh their session without losing form inputs.

---

## 3. Architecture & Data Flow

```
User authenticates (OAuth Popup or Token Paste)
                       │
                       ▼
             useAuthSlice Handler
  1. Stores token in localStorage & state
  2. Fetches real authenticated profile (user.login)
  3. Loads user's live repositories
  4. Auto-switches currentRepo & currentRepoOwner to user's first repo
                       │
                       ▼
          Workspace Context Synchronized
         (e.g., nakib555/git-manager instead of octodev/nexus-web-engine)
                       │
                       ▼
User opens Action Dialog (Branch, PR, Commit, Repo, Delete)
                       │
                       ▼
            useActionWorkflow.execute()
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   GitHub Token Active?       No Token / Offline?
          │                         │
          ▼                         ▼
Send request with normalized       Execute local mutation cleanly
auth headers & valid ref SHA       in localStorage and state
          │                         │
    ┌─────┴─────┐                   ▼
    ▼           ▼             Phase: 'success'
 HTTP 200/201  HTTP 401/403/422
    │           │
    ▼           ▼
Phase:        Phase: 'error'
'success'     ActionErrorCard:
Auto-close    - Display exact GitHub error
in 2s         - [Edit Form]
              - [Retry Operation]
              - [Re-authenticate GitHub]
```

---

## 4. Implementation Breakdown

### Phase 1: Post-Auth State Resynchronization & Demo Trap Eradication
- **Files**:
  - `src/context/slices/useAuthSlice.ts` ($\le 150$ LOC)
  - `src/context/slices/repoSliceServices.ts` ($\le 150$ LOC)
- **Changes**:
  - In `useAuthSlice.ts`: Change OAuth popup to `window.open(url, 'github_oauth_popup', 'width=600,height=700')`.
  - When `OAUTH_AUTH_SUCCESS` is received: Immediately call `fetchGitHubData(token, false, 1, '')` to pull the user's real GitHub account and repositories.
  - In `repoSliceServices.ts`: Ensure that if `currentRepoOwner === 'octodev'` or `currentRepo === 'nexus-web-engine'`, the workspace immediately switches to the authenticated user's first GitHub repo.
  - In `setManualToken`: Also guarantee automatic switch away from demo repositories.

### Phase 2: Mutation Service Header & Ref Hardening
- **Files**:
  - `src/context/gitMutationServices.ts` ($\le 150$ LOC)
  - `src/context/gitPrMutationServices.ts` ($\le 150$ LOC)
  - `src/context/gitCommitFileService.ts` ($\le 150$ LOC)
- **Changes**:
  - Standardize Authorization header across all mutation functions:
    `token.startsWith('Bearer ') || token.startsWith('token ') ? token : (token.startsWith('ghp_') ? 'token ' + token : 'Bearer ' + token)`.
  - Update `findBaseSha` to check:
    1. Active branch ref: `git/ref/heads/${currentBranch}`
    2. Default branch ref: `git/ref/heads/main`
    3. Alternate branch ref: `git/ref/heads/master`
    4. Latest commit: `commits?per_page=1`
  - Ensure 401 and 403 status codes are not swallowed in `findBaseSha` so authentication failures are clearly reported.

### Phase 3: Dialog Slices & Form Alignment
- **Files**:
  - `src/context/slices/useRepoSlice.ts` ($\le 150$ LOC)
  - `src/context/slices/useBranchSlice.ts` ($\le 150$ LOC)
  - `src/context/slices/usePRSlice.ts` ($\le 150$ LOC)
  - `src/context/slices/useCommitSlice.ts` ($\le 150$ LOC)
  - `src/components/modals/PRForm.tsx` ($\le 150$ LOC)
  - `src/components/modals/CommitForm.tsx` ($\le 150$ LOC)
- **Changes**:
  - Add explicit repo ownership guard: If the user attempts a mutation on `octodev/nexus-web-engine` while logged in, throw: `"Please select one of your own repositories to perform this action on GitHub."`
  - In `PRForm.tsx`: Filter `activeBranches` to only include branches present on the active repository.
  - In `CommitForm.tsx`: Populate `currentBranch` accurately and ensure `pushFileToGitHub` uses the verified branch ref.

### Phase 4: ActionErrorCard Re-Authentication Action
- **Files**:
  - `src/components/common/actionWorkflow/ActionErrorCard.tsx` ($\le 150$ LOC)
  - `src/components/common/actionWorkflow/ActionVerificationTracker.tsx` ($\le 150$ LOC)
- **Changes**:
  - Detect auth-related errors (`401`, `Bad credentials`, `unauthorized`, `permission denied`, `demo repository`).
  - Render a distinct "Re-authenticate with GitHub" button that launches `connectGitHub()` without resetting user inputs.

---

## 5. Execution Checklist
1. [ ] Update `src/context/slices/useAuthSlice.ts` to implement `window.open` popup flow and trigger `fetchGitHubData` on OAuth success ($\le 150$ LOC).
2. [ ] Update `src/context/slices/repoSliceServices.ts` to switch `currentRepo` and `currentRepoOwner` to the user's repositories upon login ($\le 150$ LOC).
3. [ ] Update `src/context/gitMutationServices.ts` and `gitPrMutationServices.ts` to standardize Authorization headers and enhance `findBaseSha` ($\le 150$ LOC each).
4. [ ] Update `src/context/slices/useRepoSlice.ts`, `useBranchSlice.ts`, and `usePRSlice.ts` to properly handle and rethrow mutation errors ($\le 150$ LOC each).
5. [ ] Update `src/components/common/actionWorkflow/ActionErrorCard.tsx` and `ActionVerificationTracker.tsx` to provide an inline Re-authenticate action ($\le 150$ LOC each).
6. [ ] Update `src/components/modals/PRForm.tsx` and `CommitForm.tsx` for real branch and ref mapping ($\le 150$ LOC each).
7. [ ] Run `compile_applet` and `lint_applet` together to verify zero compile or typing errors.
8. [ ] Execute verification check (10-second wait and error monitoring).

---

## 6. Approval Gate
Awaiting user confirmation to proceed with implementation.
