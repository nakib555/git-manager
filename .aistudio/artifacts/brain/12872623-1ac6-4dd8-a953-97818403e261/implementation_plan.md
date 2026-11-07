# Master Engineering Specification: Inline Lazy Loading & Verified Result Handling for Action Dialogs

A professional, unified inline execution, lazy loading, and verified result feedback system across all action and mutation dialogs in Git Manager.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed in Phase 1:
> 
> - **Progress Representation**: Multi-step progress tracker with live verification status (e.g., Validating Payload → Mutating Git Tree → Verifying Branch State → Done).
> - **Completion Behavior**: Displays a verified success card containing contextual resource metadata and summary badges, followed by an animated 2-second auto-close countdown (with manual "Close Now" or "View Resource" options).
> - **Feature Scope**: Covers every action modal across the system:
>   1. Repository Creation (`RepoForm` in `CreateModals.tsx`)
>   2. Branch Creation (`BranchForm` in `CreateModals.tsx`)
>   3. Commit Creation (`CommitForm` in `CreateModals.tsx`)
>   4. Pull Request Creation (`PRForm` in `CreateModals.tsx`)
>   5. Repository Deletion (`DeleteRepoModal.tsx` & `DeleteRepoStatusView.tsx`)
>   6. Branch Checkout, Deletion & Merge (`BranchDetailModal.tsx` & `DesktopBranchesView.tsx`)
>   7. Commit Restore & Revert (`CommitRestoreSheet.tsx` & `CommitRestoreStatusCard.tsx`)
>   8. Mobile File Editor Commit Sheet (`CommitSheet.tsx`)

---

## 1. Verified Evidence & Initial Triage

### Verified Facts
1. **Existing Modals**: `CreateModals.tsx` currently wraps `RepoForm`, `BranchForm`, `PRForm`, and `CommitForm`. Currently, each form triggers an asynchronous mutation in `AppContext.tsx` (`createLocalRepo`, `createLocalBranch`, `createLocalPR`, `createLocalCommit`), but the modal immediately closes upon click without showing in-dialog loading progress.
2. **Existing Status Cards**: `DeleteRepoStatusView.tsx` and `CommitRestoreStatusCard.tsx` contain basic localized status renderings, but they use disjointed UI components and lack the multi-step verification pipeline requested by the user.
3. **Branch Actions**: `BranchDetailModal.tsx` and `DesktopBranchesView.tsx` contain deletion and checkout buttons with only basic text changes (`"Deleting..."`, `"Checking out..."`), lacking structured inline verification cards.
4. **Design System & Theme**: The app utilizes Tailwind CSS v4 with custom semantic variables (`--color-background`, `--color-surface-1`, `--color-surface-2`, `--color-border`, `--color-accent`, `--color-success`, `--color-danger`). All new dialog states must adhere to the 8-point spatial system, zero-pill typography, and 60-30-10 color budget.
5. **LOC Constraint**: The codebase enforces modular file architectures under 150 LOC per file.

### Assumptions
1. When creating a resource offline (without GitHub token), the local tree mutation and catalog indexing complete in 400ms–800ms; adding an orchestrated multi-step verification sequence (minimum 600ms–900ms) provides transparent feedback without causing perceived lag.
2. When connected to GitHub via OAuth token, real REST API roundtrips take 500ms–2500ms; the multi-step verification tracker will smoothly transition steps based on real Promise milestones.

### Missing Information & Clarifications
- All critical user preferences were resolved during Phase 1 interactive clarification.

---

## 2. Complexity Classification
- **Level 3 (Large Feature / System-wide UX Infrastructure)**: Standardizes dialog submission workflows across 8 major modal components, establishes a centralized action verification pipeline, provides rich feedback states, and guarantees zero breaking changes.

---

## 3. Objective & Technical Requirements

### Purpose & Problem Statement
Currently, several modal actions close instantly or display simple spinner text upon submission. If a network issue, permission error, or Git tree conflict occurs, the user is left disoriented or forced to check global toasts. 

### Expected Results & Acceptance Criteria
1. **Zero Premature Modal Dismissal**: Modals remain open during action execution.
2. **Reusable Verification Engine**: A shared `<ActionVerificationTracker />` component supporting standard step sequences:
   - `validating` (checking parameters, formatting Git refs)
   - `executing` (sending payload to GitHub API or local Git engine)
   - `verifying` (reading back updated HEAD, commit SHA, or branch list)
   - `success` (verified outcome with summary metadata badges)
   - `error` (inline failure diagnostics with Retry and Edit Form buttons)
3. **Success Card with Summary Badges**:
   - Resource icon and title (e.g. `feature/user-auth` or `commit 7a3f8c1`)
   - Unboxed metadata with typographic separators (`·`) per anti-slop guidelines
   - 2-second animated circular/linear countdown before auto-dismiss
   - "Dismiss Now" button for instant closure
4. **Failure Resilience**: If an error occurs, the user can inspect the exact error reason and click "Back to Form" to amend their input without losing typed form state.

---

## 4. Architecture Design & Component Hierarchy

### System Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Action Feature Dialog                           │
│  (RepoForm / BranchForm / CommitForm / PRForm / Delete / Restore)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             useActionWorkflow(options) Hook            │
       │  • status: 'idle' | 'validating' | 'executing' |       │
       │            'verifying' | 'success' | 'error'           │
       │  • currentStepIndex: 0..N                              │
       │  • errorDetails?: string                               │
       │  • resultMetadata?: ActionSummaryData                  │
       │  • execute(mutationFn, steps)                          │
       │  • autoCloseCountdown: 2s (active during 'success')    │
       └────────────────────────────┬───────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────┐
│     Form Inputs / Controls    │               │  ActionVerification   │
│       (when status === idle)  │               │        Tracker        │
└───────────────────────────────┘               │  (when status !== idle)│
                                                └───────────┬───────────┘
                                                            │
                       ┌────────────────────────────────────┴────────────────────────────────────┐
                       ▼                                                                         ▼
┌──────────────────────────────────────────────┐                         ┌──────────────────────────────────────────────┐
│          Progress Step Indicator             │                         │             Verified Result Card             │
│  • Step 1: Validating payload & Git refs     │                         │  • CheckCircle2 & Status Badge               │
│  • Step 2: Executing mutation engine         │                         │  • Summary Badges (SHA, Branch, Author)      │
│  • Step 3: Verifying workspace & tree state  │                         │  • 2s Countdown Bar + "Close Now"            │
└──────────────────────────────────────────────┘                         └──────────────────────────────────────────────┘
```

### Component Breakdown & Folder Organization
1. `src/components/common/actionWorkflow/types.ts`: Workflow status types, step definitions, and summary payload interfaces.
2. `src/components/common/actionWorkflow/useActionWorkflow.ts`: State machine hook managing step progression, fake/real timing orchestration, error handling, and 2-second auto-close timer with cancelation support.
3. `src/components/common/actionWorkflow/ActionVerificationTracker.tsx`: The primary container rendering the active step tracker, live verification status, success card, or error recovery card.
4. `src/components/common/actionWorkflow/ActionStepList.tsx`: Visual step items with pending, active (spinning pulse), and completed (emerald check) states.
5. `src/components/common/actionWorkflow/ActionSuccessCard.tsx`: The verified result view with summary metadata, unboxed badges, and auto-close countdown.
6. `src/components/common/actionWorkflow/ActionErrorCard.tsx`: Diagnostic failure view with error details and "Amend & Retry" action.

---

## 5. Implementation Breakdown

### Phase 1: Workflow Infrastructure & Types
- Create `types.ts` defining `WorkflowStep`, `WorkflowStatus`, and `ActionResultSummary`.
- Build `useActionWorkflow.ts` hook with standard transition orchestration:
  - Step transitions with guaranteed minimum visual clarity (prevents flashing).
  - Configurable auto-close timer (default 2000ms).
  - Full cleanup on unmount.

### Phase 2: Action Verification UI Components
- Build `ActionStepList.tsx`: Clean tabular typography, subtle progress connectors, and status icons.
- Build `ActionSuccessCard.tsx`: Verified checkmark, resource pill-free metadata, and smooth countdown bar.
- Build `ActionErrorCard.tsx`: Clear error messaging with retry and back-to-edit actions.
- Build `ActionVerificationTracker.tsx`: Combines the above with smooth Motion transitions.

### Phase 3: Integration into Creation Modals (`CreateModals.tsx`)
- Update `RepoForm.tsx`: Wire `useActionWorkflow` for repo creation (Validating Name -> Initializing Repo -> Verifying Local Catalog -> Success).
- Update `BranchForm.tsx`: Wire `useActionWorkflow` for branch creation (Validating Ref -> Creating Branch -> Indexing Tree -> Success).
- Update `CommitForm.tsx`: Wire `useActionWorkflow` for commit creation (Staging Files -> Generating Tree SHA -> Verifying HEAD -> Success).
- Update `PRForm.tsx`: Wire `useActionWorkflow` for PR creation (Validating Branches -> Opening PR -> Verifying Base Comparison -> Success).
- Update `CreateModals.tsx` to respect workflow execution (prevent accidental backdrop closing while executing).

### Phase 4: Integration into Action & Management Modals
- Update `DeleteRepoModal.tsx` & `DeleteRepoStatusView.tsx`: Integrate multi-step purge verification with 2s verified dismissal.
- Update `BranchDetailModal.tsx` & `DesktopBranchesView.tsx`: Wrap branch delete and checkout actions in the verification tracker.
- Update `CommitRestoreSheet.tsx`: Align existing restore/revert status cards with the unified verification specification.

---

## 6. Responsive Experience & Viewport Support

### Desktop Experience (>= 1024px)
- Centered dialogs with backdrop blur (`backdrop-blur-xs`), subtle borders (`border-border`), and spring entrance animations.
- Inline workflow replaces form content within the existing modal box without resizing or jumping.
- Keyboard navigation: Escape is blocked while `status === 'executing'` or `'validating'`, and enabled during `'success'` or `'error'` to quickly dismiss.

### Tablet Experience (768px - 1023px)
- Symmetrical padding (`p-6`), touch-friendly button targets (minimum 44px height).
- Clean horizontal alignment of step indicators and result badges.

### Mobile Experience (< 768px)
- Bottom-sheet presentation or compact centered dialogs with `pb-[env(safe-area-inset-bottom,0px)]`.
- Touch-friendly 48px action buttons for "Close Now" and "Retry".
- Single-line summary badges with overflow ellipsis and truncation.

---

## 7. Performance & Accessibility

### Performance
- Zero layout recalculation thrashing: Animates only `transform` and `opacity`.
- Timers cleanly cleared via React `useEffect` cleanups to prevent memory leaks or state updates after unmount.
- Code split into modular sub-150 LOC components.

### Accessibility (WCAG AA)
- `aria-live="polite"` on status updates so screen readers announce step progress.
- `role="status"` on the verification tracker and `role="alert"` on error diagnostics.
- Contrast ratios >= 4.5:1 on all text elements across light, slate, and dark workstation themes.
- Respects `prefers-reduced-motion` for all spinner animations and step transitions.

---

## 8. Security & Compatibility Analysis
- Input validation occurs prior to mutation step execution.
- No sensitive tokens or secrets are rendered in summary badges.
- Fully backward compatible with offline mock state and live GitHub OAuth mode.

---

## 9. Testing & Verification Strategy
1. **Compilation & Type Check**: Run `tsc --noEmit` and Vite build to guarantee zero TypeScript or bundle issues.
2. **Behavioral Testing**:
   - Verify Repo Creation displays Validating -> Creating -> Verifying -> Success -> Auto-closes after 2s.
   - Verify Branch Creation with custom prefix displays live steps and summary badge.
   - Verify Commit Form (both offline mode and real GitHub mode) displays verified SHA result.
   - Verify PR Form displays comparison summary and auto-closes smoothly.
   - Verify Delete Repo modal accurately executes countdown and verified status view.
   - Verify Commit Restore sheet runs step verification and auto-closes after 2s.
3. **Error Recovery Testing**: Simulate invalid inputs/errors and verify "Back to Form" preserves state.

---

## 10. Execution Checklist
- [ ] Create `src/components/common/actionWorkflow/types.ts`
- [ ] Create `src/components/common/actionWorkflow/useActionWorkflow.ts`
- [ ] Create `src/components/common/actionWorkflow/ActionStepList.tsx`
- [ ] Create `src/components/common/actionWorkflow/ActionSuccessCard.tsx`
- [ ] Create `src/components/common/actionWorkflow/ActionErrorCard.tsx`
- [ ] Create `src/components/common/actionWorkflow/ActionVerificationTracker.tsx`
- [ ] Integrate into `src/components/modals/RepoForm.tsx`
- [ ] Integrate into `src/components/modals/BranchForm.tsx`
- [ ] Integrate into `src/components/modals/CommitForm.tsx`
- [ ] Integrate into `src/components/modals/PRForm.tsx`
- [ ] Refactor `src/components/CreateModals.tsx` to handle workflow locking
- [ ] Standardize `src/components/DeleteRepoModal.tsx` and `DeleteRepoStatusView.tsx`
- [ ] Standardize `src/mobile/screens/repo/branches/BranchDetailModal.tsx`
- [ ] Standardize `src/features/desktop/screens/DesktopBranchesView.tsx`
- [ ] Standardize `src/mobile/components/CommitRestoreSheet.tsx`
- [ ] Run `compile_applet` and `lint_applet` verification
