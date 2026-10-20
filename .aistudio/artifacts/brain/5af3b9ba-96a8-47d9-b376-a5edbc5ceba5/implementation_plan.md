# Engineering Specification: 100% 8-Point Spatial Grid Architecture (Mobile-First) & Complete Dummy Data Eradication

---

## 1. Verified Facts & Current System Evidence

1. **Spatial Grid Adherence (Mobile Screens)**:
   - Recent phases calibrated `MobileShell`, `MobileHeader`, `BottomNav`, `ActionSheet`, `CommitDetailModal`, and `DiffViewer` to key 8pt multiples.
   - Audits revealed lingering off-grid dimensions:
     - `Repositories.tsx`: Sort sheet uses `rounded-t-xl`, `px-5` (20px), and `w-7 h-7` (28px) close button instead of `rounded-t-3xl` (24px), `px-4` (16px), and `w-9 h-9` / 48px hitboxes.
     - `CommandPalette.tsx`: Uses `rounded-xl` (12px) container, item rows lack 48px standard touch heights, search input margin uses non-standard `mr-4`.
     - `Clone.tsx`: Step indicators and tab controls use arbitrary gap sizes (`gap-2.5`, `gap-3.5`).
     - `PRsScreen.tsx` (mobile): Merge and detail drawer cards contain uneven padding (`p-3.5`) and non-8pt touch targets.
2. **Dummy Data & Synthetic Mocks Inventory**:
   - `src/components/commit/CiCdStatus.tsx`: Contains `getCiCdStatus` generating deterministic simulated pipelines with fabricated test logs (fake Vitest/Jest suites, fake ESLint errors, fake Cloud Run URL `https://ais-pre-azzk4cifz4c5f6qxuplgpd-41816522833.asia-southeast1.run.app`). When real check runs are absent, it hallucinates passes or fails instead of reporting authentic zero-state.
   - `src/mobile/screens/Clone.tsx` & `src/screens/CloneScreen.tsx`: Contains hardcoded `popularRepos` (`react`, `tailwindcss`, `vscode`, `next.js`, `bun`) with hardcoded star counters (`★224k`, `★81k`) and simulated download ZIP options.
   - `src/components/CloneModal.tsx`: Generates synthetic repository metadata using string char-code math (`starsVal = ((hash % 80) + 5).toFixed(1) + 'k'`, `forksVal`, `sizeVal`).
   - Hardcoded fallback identities: `nakib555` is hardcoded as default owner in `src/mobile/utils/gitApi.ts`, `src/mobile/components/CommitDetailModal.tsx`, `src/mobile/screens/repo/FilesScreen.tsx`, and `src/components/DesktopLayout.tsx`.
   - `src/AppContext.tsx`: Line 810 defaults owner to `'facebook'` if unresolved.

---

## 2. Assumptions & Missing Information

- **Assumptions**:
  - When no GitHub token is provided and no local repositories exist, the app should display clean, authentic empty states guiding the user to connect GitHub or clone a real repository via URL, rather than displaying fabricated repositories or fake commits.
  - When a commit has no GitHub Actions CI/CD check runs, the CI/CD inspector must cleanly declare "No CI/CD workflows or check runs found for this commit ref" with a direct link to GitHub Actions, rather than simulating fake runs.
- **Missing Information**: None. All source files, API routes, data contexts, and components have been inspected.

---

## 3. Complexity Classification

**Level 3: Large Feature & Architecture Refactoring**
Involves structural eradication of all simulated data engines, mathematical alignment of 100% of mobile and desktop UI components to the 8-point spatial system, and replacement of mock generators with honest empty and loading states.

---

## 4. Mandatory Planning Sections

### A. Objective

- **Purpose**: Fully normalize all remaining mobile interfaces to the strict 8-point spatial grid system (4px micro, 8px base, 16px gutter, 24px container, 32px/40px icon touch zone, 48px button minimum, 56px/64px header/nav), and eliminate all synthetic/dummy/mock data, hardcoded usernames (`nakib555`, `facebook`), and fake CI test simulations across the entire application.
- **Problem Statement**:
  1. The interface still features legacy dummy data: fabricated open-source repository lists, fake commit CI test logs, and synthetic star counters.
  2. Fallback strings still contain developer usernames (`nakib555`) instead of authentic user/repo contextual values or clean prompt dialogs.
  3. Secondary mobile sheets (`Repositories.tsx` sort sheet, `Clone.tsx` configuration cards, `CommandPalette.tsx`) still utilize non-8pt grid metrics (`px-5`, `w-7 h-7`, `p-3.5`).
- **Success Criteria**:
  - Zero hardcoded mock repositories, zero synthetic star/fork counters, zero fake CI log generators.
  - Authentic zero/empty states across Commits, Branches, PRs, Files, and Activity.
  - 100% of mobile interactive controls meet the $\ge 44\text{px}$–$48\text{px}$ touch target requirement.
  - All margins, paddings, gap spacings, and radii strictly adhere to multiples of 8px (with 4px/12px micro-steps).

---

### B. Existing System Analysis

1. **`src/components/commit/CiCdStatus.tsx`**:
   - `getCiCdStatus(hash)` generates fake steps: `lint-and-format`, `unit-tests`, `production-build`, `cloud-deploy`.
   - Solution: Use solely authentic check runs returned by `fetchCommitCheckRuns` (GitHub Actions check-runs API). If empty, display a clean, quiet status card stating "No GitHub Actions workflows configured".
2. **`src/mobile/screens/Clone.tsx` & `src/screens/CloneScreen.tsx`**:
   - Contains static `popularRepos` array with fake stars and description badges.
   - Solution: Replace hardcoded open-source lists with authentic "Recent Clones" or prompt for repository URL, providing clean, single-line input validation.
3. **`src/components/CloneModal.tsx`**:
   - Lines 84–98 generate fake star/fork metrics by hashing string characters.
   - Solution: Only display stars, forks, and size if returned by the live GitHub API (`fetchRealData`). If not available or unauthenticated, display clean repository name and owner without fake numbers.
4. **`src/mobile/utils/gitApi.ts` & Fallbacks**:
   - Replaces `owner || 'nakib555'` with `owner || githubUser?.login || ''`. If no owner is known, safely report repository selection required.
5. **Mobile Grid Compliance**:
   - `Repositories.tsx`: Update sort sheet to `rounded-t-3xl`, `px-4`, `min-h-[48px]` rows.
   - `Clone.tsx`: Convert form inputs and button stacks to strict 48px heights (`h-12`), 16px padding (`p-4`), and 8px gaps (`gap-2`).
   - `CommandPalette.tsx`: Update to `rounded-2xl`, 48px action rows, 16px internal gutter.

---

### C. Architecture Design: 8-Point Spatial Hierarchy

```
Metric     Tailwind        Application Scope
───────────────────────────────────────────────────────────────────────
4px        p-1, gap-1      Micro-spacing, status tags, badge gap
8px        p-2, gap-2      Base unit: icon-text gap, input label spacing
12px       p-3, gap-3      Sub-card padding, secondary button padding
16px       p-4, gap-4      Primary container gutter, modal interior, cards
24px       p-6, gap-6      Outer dialog padding, section margins, sheet radius
32px       h-8, w-8        Sub-action icon button boundaries
40px       h-10            Segmented tab pills, auxiliary input heights
48px       h-12            Primary CTA buttons, touch hitboxes, list rows
56px       h-14            Mobile header bar, navigation bar height
64px       h-16            Bottom tab bar with safe-area spacing
80px       pb-20           Scrollport bottom clearance above fixed nav
```

---

### D. Implementation Breakdown

#### Phase 1: Eradicate All Dummy Data & Simulated Mocks
- **Files**:
  - `src/components/commit/CiCdStatus.tsx`
  - `src/mobile/screens/Clone.tsx`
  - `src/screens/CloneScreen.tsx`
  - `src/components/CloneModal.tsx`
  - `src/mobile/utils/gitApi.ts`
  - `src/mobile/components/CommitDetailModal.tsx`
  - `src/mobile/screens/repo/FilesScreen.tsx`
  - `src/components/DesktopLayout.tsx`
  - `src/AppContext.tsx`
- **Actions**:
  1. Remove `getCiCdStatus` synthetic mock logs; wire CI/CD status directly to authentic GitHub check runs. If no runs exist, render an honest empty state.
  2. Remove static `popularRepos` array from `Clone.tsx` and `CloneScreen.tsx`.
  3. Remove synthetic hashing calculations for stars/forks in `CloneModal.tsx`.
  4. Replace hardcoded fallback owner `'nakib555'` and `'facebook'` with dynamic contextual owner lookup and explicit error feedback if repo is unassigned.

#### Phase 2: Mobile 8-Point Grid Normalization (Screens & Sheets)
- **Files**:
  - `src/mobile/screens/Repositories.tsx`
  - `src/mobile/screens/Clone.tsx`
  - `src/mobile/screens/repo/PRsScreen.tsx`
  - `src/mobile/screens/repo/BranchesScreen.tsx`
  - `src/components/CommandPalette.tsx`
- **Actions**:
  1. Standardize sort sheet in `Repositories.tsx` to `rounded-t-3xl`, `px-4`, and 48px touch rows.
  2. Calibrate form elements in `Clone.tsx` to 48px inputs and buttons, with 16px/24px card paddings.
  3. Ensure all drawer action buttons in `PRsScreen.tsx` adhere to 48px height with 12px/16px radii.
  4. Update `CommandPalette.tsx` dialog to `rounded-2xl` with 48px row hitboxes.

#### Phase 3: Desktop & Tablet Harmony
- Verify that changes seamlessly scale to desktop viewports without broken layouts.
- Ensure the 8pt grid overlay toggle reflects pixel-perfect alignments across breakpoints.

#### Phase 4: Quality Gate Verification
- Run `compile_applet` and `lint_applet`.
- Verify dev server health with HTTP 200 OK.

---

### E. Desktop, Tablet & Mobile Experience

- **Mobile**: Strict 48px touch targets, 16px margins, zero-cramped hitboxes, and 80px bottom safe-area scroll clearance.
- **Tablet**: Balanced 2-column or 3-column layouts with 24px gutters.
- **Desktop**: Full 1440px viewport presence, zero desert-island effect, synchronized command palette.

---

### F. Performance, Accessibility & Security

- **Performance**: Zero overhead from mock generators. Pure CSS 8pt grid layout.
- **Accessibility**: All interactive elements $\ge 44\text{px}$–$48\text{px}$, WCAG AA contrast, clear focus indicators.
- **Security**: Zero exposed tokens, real OAuth and PAT handling, authenticated GitHub REST API queries.

---

### G. Execution Checklist

1. [ ] **Phase 1: Dummy Data Removal**
   - [ ] Clean `CiCdStatus.tsx` of synthetic logs and fallback generator.
   - [ ] Clean `Clone.tsx` of static `popularRepos` and fake stars.
   - [ ] Clean `CloneScreen.tsx` of static `popularRepos`.
   - [ ] Clean `CloneModal.tsx` of char-code hashing math for stars/forks.
   - [ ] Eradicate `nakib555` and `facebook` hardcoded fallbacks across all files.
2. [ ] **Phase 2: Mobile 8-Point Grid Alignment**
   - [ ] Refactor `Repositories.tsx` sort sheet to 8pt system (`rounded-t-3xl`, `px-4`, 48px rows).
   - [ ] Refactor `Clone.tsx` forms and buttons to 48px heights and 8pt margins.
   - [ ] Standardize `CommandPalette.tsx` to 8pt grid (`rounded-2xl`, 48px items).
   - [ ] Refactor `PRsScreen.tsx` mobile detail drawer to 8pt geometry.
3. [ ] **Phase 3: Verification & Quality Gates**
   - [ ] Execute `compile_applet` (0 errors).
   - [ ] Execute `lint_applet` (0 TypeScript errors).
   - [ ] Verify dev server response.

---

## 5. Approval Gate

STOP. Waiting for user explicit approval. Only continue when approved with one of: **Approved**, **Proceed**, or **Implement**.
