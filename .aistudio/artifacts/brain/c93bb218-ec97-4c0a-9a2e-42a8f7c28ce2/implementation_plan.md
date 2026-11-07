# Master Engineering Specification: Delete & Restore Lazy Loading, Success/Failure Verification States, & Center-Floating QR Modal

## Executive Summary
This engineering specification details the implementation of:
1. **Interactive Lazy Loading & Result Verification in Delete & Restore Features**:
   - When a user triggers any delete action (Delete Repository, Delete HEAD Commit, Delete Branch) or restore action (Revert Commit, Snapshot Restore):
     - An **inline progress/lazy loader** activates immediately inside the dialog/button, disabling duplicate triggers and showing step-by-step progress feedback.
     - Upon completion, the result is verified:
       - **On Success**: Displays a beautifully formatted confirmation card (with success icon, summary of affected references, and automatic background data synchronization across repositories, branches, and commits).
       - **On Failure**: Displays a beautifully formatted failure notice (with danger badge, specific error cause, and an actionable retry button).
2. **Transfer to Mobile QR Modal Center-Floating Conversion**:
   - Converts `CloneQrCodeModal.tsx` from a mobile bottom sheet (`items-end`, `rounded-t-3xl`, drag handle) into a **center-floating modal** (`items-center justify-center p-4`, `rounded-2xl`, spring scale-and-fade animation) across all screen sizes.

---

## Verified Facts & System Evidence

1. **Delete & Restore Target Components**:
   - **Delete Repository**: `src/components/DeleteRepoModal.tsx` (129 LOC)
     - Currently executes `executeDelete` which calls `deleteRepo(repoName, owner)` from `AppContext`.
     - Sets `isDeleting` state but immediately closes on success or fails silently without a persistent in-modal success/failure feedback card.
   - **Delete HEAD Commit**: `src/mobile/screens/repo/commits/CommitsDeleteHeadDialog.tsx` (119 LOC)
     - Calls `onConfirm` and renders `RollbackTransitionLoader` with 3 steps.
     - Lacks post-completion verification summary card before dismissing.
   - **Restore / Revert Commit**: `src/mobile/components/CommitRestoreSheet.tsx` (147 LOC)
     - Calls `restoreFilesToCommit` or `revertCommit`.
     - Lacks inline step-by-step lazy loader during execution and post-execution success/failure card.
   - **Delete Branch**: `src/mobile/screens/repo/branches/BranchDetailModal.tsx` & `BranchModalFooter.tsx` (53 LOC)
     - Calls `deleteBranch` with `isDeleting` state.
2. **Transfer to Mobile QR Code Target**:
   - `src/features/clone/components/CloneQrCodeModal.tsx` (95 LOC):
     - Line 37: `flex items-end sm:items-center justify-center p-0 sm:p-4`
     - Line 49: `initial={{ y: '100%', opacity: 0.8 }}`
     - Line 53: `rounded-t-3xl sm:rounded-2xl`
     - Line 57: Contains mobile drag handle `<div className="w-10 h-1 bg-border rounded-full mx-auto -mt-2 mb-2 sm:hidden shrink-0" />`.
3. **Data Refresh Triggers**:
   - `fetchRepoDetails`, `setRefreshTrigger`, and slice state updates already exist in `AppContext` to synchronize lists.
4. **Architectural Standard**:
   - Every file must strictly remain `<= 150 LOC`.

---

## Assumptions
- During the lazy loading phase, action buttons are disabled to prevent duplicate submissions or race conditions.
- When an operation succeeds, the dialog displays an inline success confirmation card for ~1.5s (or with a "Done" button) and triggers data refresh before dismissing.
- When an operation fails, the dialog stays open, displays a clear red failure alert with the error message from the Git service, and offers a "Try Again" or "Cancel" option.
- The Transfer to Mobile QR Code box should float dead-center on mobile screens just like desktop, with a smooth spring scale transition.

---

## Missing Information & Clarifications
- All requirements are fully established from existing component patterns and user specifications. No external dependencies required.

---

## Complexity Classification
**Level 3: Large Feature / Transactional UX State Machine & Modal Polish**
- Enhances async transaction states across all delete and restore features with loading, success, and error branches.
- Centers and polishes the QR code transfer modal.

---

## Objective
- **Problem**:
  1. Users clicking Delete or Restore often experience an abrupt dialog close without seeing clear confirmation that data was safely committed, or they get stranded if a remote Git network request fails.
  2. The Transfer to Mobile QR modal anchors to the bottom on mobile screens rather than floating in the center.
- **Success Criteria**:
  1. Clear inline lazy-loading spinner and progress message appears when clicking Delete or Restore.
  2. Action result is verified:
     - On success: formatted confirmation message with checkmark, details of what was changed, and automatic data refresh.
     - On failure: formatted error alert with danger badge, clear cause, and retry button.
  3. Transfer to Mobile QR modal is centered on all viewports (`items-center justify-center p-4`), with drag handles removed and spring scale animation.
  4. All modified files strictly comply with the `<= 150 LOC` limit.

---

## Architecture Design

### Transaction State Machine for Delete & Restore:
```
┌─────────────────┐
│     IDLE        │ (User reviews impact bullets & types confirmation)
└────────┬────────┘
         │ Click Action Button
         ▼
┌─────────────────┐
│   EXECUTING     │ (Inline lazy loader, progress steps, disabled buttons)
└────────┬────────┘
         ├─────────────────────────────────────┐
         ▼ (Promise resolves / success === true)▼ (Promise rejects / error)
┌───────────────────────────────┐     ┌───────────────────────────────┐
│     SUCCESS CONFIRMATION      │     │      FAILURE NOTICE           │
│ - Green Checkmark badge       │     │ - Red ShieldAlert badge       │
│ - Plain English summary:      │     │ - Plain English reason        │
│   "Repository successfully    │     │ - "Action Failed"             │
│    deleted & data refreshed"  │     │ - [Try Again] / [Cancel]      │
│ - Auto-dismiss after 1.5s     │     └───────────────────────────────┘
└───────────────────────────────┘
```

### QR Code Center Floating Design:
```
┌────────────────────────────────────────────────────────┐
│ Screen Viewport (Mobile & Desktop)                     │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │ Center-Floating Card (max-w-sm rounded-2xl)    │   │
│   │ [Header: Transfer to Mobile + Close Button]    │   │
│   │ [High-Contrast White QR Box (180px)]           │   │
│   │ [Guidance: Scan with mobile camera to clone]   │   │
│   │ [URL Box with 1-Click Copy Button]             │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## Implementation Breakdown & Phases

### Phase 1: Convert Transfer to Mobile QR Modal to Center-Floating
- File: `src/features/clone/components/CloneQrCodeModal.tsx` (95 LOC)
- Replace `items-end sm:items-center p-0 sm:p-4` with `items-center justify-center p-4 sm:p-6`.
- Remove mobile drag handle pill.
- Replace `initial={{ y: '100%', opacity: 0.8 }}` with `initial={{ opacity: 0, scale: 0.94, y: 8 }}`.
- Apply uniform `rounded-2xl border border-border`.

### Phase 2: Add Lazy Loading, Success Confirmation, and Failure Notice to Delete Repository Modal
- File: `src/components/DeleteRepoModal.tsx`
- State: `status: 'idle' | 'deleting' | 'success' | 'error'`, `errorMessage: string`.
- When clicking delete:
  - Transition to `'deleting'` with inline animated loader and status message: `"Deleting repository and cleaning up Git references..."`.
  - On success: transition to `'success'`, show `"✓ Repository Successfully Deleted"`, trigger `fetchRepoDetails` / refresh, and close after 1.4s.
  - On error: transition to `'error'`, display styled failure card with `"✕ Deletion Failed"`, error message, and a `"Try Again"` button.

### Phase 3: Add Verification Confirmation to Delete HEAD Commit Dialog
- File: `src/mobile/screens/repo/commits/CommitsDeleteHeadDialog.tsx`
- State: `actionStatus: 'idle' | 'deleting' | 'success' | 'error'`.
- On confirm:
  - Run rollback step progress loader.
  - On success: render clean success card: `"✓ HEAD Commit Successfully Rewound"`, `"Active branch pointer updated to parent commit"`, and refresh data before closing.
  - On error: render clear error card with retry option.

### Phase 4: Add Lazy Loading & Success/Failure Feedback to Commit Restore Sheet
- File: `src/mobile/components/CommitRestoreSheet.tsx`
- State: `restoreStatus: 'idle' | 'loading' | 'success' | 'error'`.
- On restore/revert submit:
  - Show inline progress bar with `"Applying commit inverse diff..."`.
  - On success: show `"✓ Commit Revert Successful"`, `"New commit created forward in history"`, refresh data, and close.
  - On error: show `"✕ Operation Failed"`, error reason, and retry button.

### Phase 5: Verification & Quality Gates
- Check LOC on all modified files (`<= 150 LOC`).
- Co-execute `compile_applet` and `lint_applet`.
- Perform 10-second stability check and test endpoints with curl.

---

## Execution Checklist

- [ ] Check out Phase 1: Center-float `src/features/clone/components/CloneQrCodeModal.tsx`
- [ ] Check out Phase 2: Upgrade `src/components/DeleteRepoModal.tsx` with lazy loading & success/error states
- [ ] Check out Phase 3: Upgrade `src/mobile/screens/repo/commits/CommitsDeleteHeadDialog.tsx` with result verification
- [ ] Check out Phase 4: Upgrade `src/mobile/components/CommitRestoreSheet.tsx` with lazy loading & result feedback
- [ ] Check out Phase 5: Check line counts (`<= 150 LOC`)
- [ ] Check out Phase 6: Run `compile_applet` and `lint_applet`
- [ ] Check out Phase 7: Run 10s stability check and endpoint testing
