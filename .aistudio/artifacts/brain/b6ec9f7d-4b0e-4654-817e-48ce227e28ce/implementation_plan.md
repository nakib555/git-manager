# Engineering Implementation Plan: Full Administrative Control for GitHub OAuth & Token Scope Diagnostics

## Objective
Configure GitHub OAuth and Personal Access Token (PAT) generation to grant complete, exhaustive administrative control across the user's GitHub repositories, webhooks, teams, keys, and workflows. Additionally, implement real-time token scope verification using GitHub's `x-oauth-scopes` API header so the user can verify their token's exact administrative capabilities in the UI.

- **Problem**: 
  1. The user wants the application and its OAuth flow to have full administrative authority over their GitHub repositories (commits, branches, pull requests, releases, webhooks, and repository deletion).
  2. Currently, `server.ts` requests limited scopes (`repo delete_repo read:user user:email`), which misses administrative scopes like `admin:repo_hook`, `admin:org`, `admin:public_key`, `workflow`, `project`, and `write:discussion`.
  3. The PAT generation links in `OAuthSetupForm.tsx` only request a partial subset of scopes.
  4. Users currently have no visual confirmation of which permissions their active token possesses.
- **Expected Result**:
  1. `server.ts` requests the full comprehensive GitHub OAuth administrative scope suite:
     `repo delete_repo admin:repo_hook admin:org admin:public_key admin:org_hook user workflow write:discussion project`
  2. `OAuthSetupForm.tsx` provides 1-click generation for a full-administrative PAT and provides clear, pre-filled OAuth application setup parameters (Callback URL, Homepage URL, Scopes list).
  3. The app inspects the `x-oauth-scopes` HTTP header on authentication and tracks active permissions (`hasDeleteRepoScope`, `hasAdminScope`, `tokenScopes`), displaying an administrative status badge.
- **Success Criteria**:
  - Full admin scopes requested by default on OAuth authorization.
  - Token scopes validated via GitHub API response headers.
  - All modified files strictly comply with the $\le 150$ LOC ceiling.

---

## Existing System Analysis
- **`server.ts` (lines 110–115)**:
  `scope: 'repo delete_repo read:user user:email'`. Missing `admin:repo_hook`, `admin:org`, `admin:public_key`, `workflow`, `project`, `write:discussion`.
- **`src/components/modals/OAuthSetupForm.tsx`**:
  PAT generation URL requests partial scopes. The "OAuth Setup Guide" tab does not provide one-click copyable callback URLs or explicit scope requirements.
- **`src/types/appTypes.ts`**:
  `AppState` does not yet expose `tokenScopes?: string[]` or `hasAdminScope?: boolean`.
- **`src/context/slices/useAuthSlice.ts`**:
  Fetches `https://api.github.com/user` without capturing the `x-oauth-scopes` header.

---

## Verified Facts & Scope Reference
GitHub's official complete administrative scopes for OAuth & PAT:
1. `repo` — Complete control of private/public repositories (commits, code, branches, PRs, issues, deployments, status).
2. `delete_repo` — Deletion authority for repositories.
3. `admin:repo_hook` — Complete control of repository webhooks and hooks.
4. `admin:org` — Full control of organization teams and projects.
5. `admin:public_key` — Full control of SSH/GPG public keys.
6. `admin:org_hook` — Full control of organization webhooks.
7. `user` — Full control of user profile data and email addresses.
8. `workflow` — Full control of GitHub Actions workflows.
9. `write:discussion` — Full control of discussions.
10. `project` — Full control of projects.

---

## Complexity Classification
**Level 2: Small Feature / Permission Architecture Upgrade**
Encompasses backend OAuth parameters, PAT generation links, state model extension for scope diagnostics, and UI permission status feedback.

---

## Architecture Design

### 1. Exhaustive OAuth Scope Suite in `server.ts`
Update `server.ts` OAuth authorization parameter:
```typescript
const FULL_ADMIN_SCOPES = [
  'repo',
  'delete_repo',
  'admin:repo_hook',
  'admin:org',
  'admin:public_key',
  'admin:org_hook',
  'user',
  'workflow',
  'write:discussion',
  'project',
].join(' ');
```

### 2. Full Admin PAT Generation in `OAuthSetupForm.tsx`
Update the PAT creation URL to pre-check the complete administrative suite:
```
https://github.com/settings/tokens/new?scopes=repo,delete_repo,admin:repo_hook,admin:org,admin:public_key,admin:org_hook,user,workflow,write:discussion,project&description=Git%20Manager%20Full%20Admin
```

### 3. Real-Time Scope Diagnostics via `x-oauth-scopes` Header
In `useAuthSlice.ts` and `gitApiServices.ts`:
- When authenticating via `/user`, extract `res.headers.get('x-oauth-scopes')`.
- Parse into `tokenScopes: string[]`.
- Evaluate `hasDeleteRepoScope: scopes.includes('delete_repo')`.
- If connected with a token missing `delete_repo`, display an advisory notice in the modal with a 1-click upgrade button.

---

## Implementation Breakdown

### Phase 1: Server OAuth Scope Expansion
- **File**: `/server.ts`
- **Actions**: Add the full administrative scope list to `/api/auth/url` query parameters.

### Phase 2: PAT Link & OAuth Guide Enhancements
- **File**: `/src/components/modals/OAuthSetupForm.tsx`
- **Actions**:
  - Update PAT link with all admin scopes.
  - Enhance OAuth Setup Guide tab with exact copyable Callback URL and Homepage URL.
  - Maintain $\le 150$ LOC.

### Phase 3: Token Scope Diagnostics in State
- **Files**:
  - `/src/types/appTypes.ts`
  - `/src/context/slices/useAuthSlice.ts`
- **Actions**:
  - Add `tokenScopes: string[]` to `AppState`.
  - Capture and parse `x-oauth-scopes` during token validation.
  - Maintain $\le 150$ LOC.

---

## Execution Checklist
1. Update `server.ts` with full administrative scopes.
2. Update `src/components/modals/OAuthSetupForm.tsx` with full-admin PAT link and OAuth guidance.
3. Update `src/types/appTypes.ts` with `tokenScopes`.
4. Update `src/context/slices/useAuthSlice.ts` to capture and store `x-oauth-scopes`.
5. Run `compile_applet` and `lint_applet` together to verify zero syntax/build errors.
6. Wait 10 seconds and test runtime endpoints for stability.

---

## Quality Gates & Approval Gate
- No implementation code will be written until this plan receives your explicit approval.
- Standing by for your confirmation (`Approved`, `Proceed`, or `Implement`).
