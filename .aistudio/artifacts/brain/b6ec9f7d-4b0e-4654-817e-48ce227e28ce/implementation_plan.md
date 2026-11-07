# Engineering Implementation Plan: Modal Unmounting Lifecycle Refactoring & Mounted State Verification

## Objective
Refactor the modal unmounting lifecycle across `AppContext`, `CreateModals`, and the shared modal action workflow (`useActionWorkflow`) to strictly verify the component's mounted state before invoking cleanup functions, resetting state, or transferring focus after failed API requests. This eliminates the browser console warning: `Node cannot be found in the current page`.

- **Problem**: When a GitHub API request or mutation fails (e.g., 403 Forbidden, 422 Unprocessable, network failure) while a modal is closing or transitioning, cleanup functions and state setters (`cleanup()`, `setPhase('error')`, `setErrorMsg()`, `optionsRef.current.onClose?.()`) are executed without checking if the modal component is still mounted. Furthermore, when `activeModal` in `AppContext` transitions to `null`, `AnimatePresence` unmounts the modal dialog while focus or pending timers attempt to query or update the detached DOM node.
- **Expected Result**:
  1. `CreateModals` and `AppContext` manage a verified mounted lifecycle that checks mounted status before executing any post-failure cleanup functions.
  2. `useActionWorkflow` implements an explicit `isMountedRef` check surrounding all `catch` handlers, cleanup invocations, and state updates.
  3. Active DOM focus is safely surrendered before unmounting so no detached DOM nodes trigger `Node cannot be found in the current page`.
- **Success Criteria**:
  - Failed API requests (simulated or real) never invoke cleanup or state setters on unmounted components.
  - Zero `Node cannot be found in the current page` errors during error recovery or modal dismissal.
  - All modified files strictly comply with the $\le 150$ LOC ceiling.

---

## Existing System Analysis
- **`src/AppContext.tsx` & `src/context/slices/useUISlice.ts`**:
  `closeModal()` immediately clears `activeModal: null`. It does not coordinate teardown with in-flight or failing API requests.
- **`src/components/CreateModals.tsx`**:
  Renders modal backdrop and content via `AnimatePresence`. Escape key and backdrop clicks invoke `closeModal()` directly. No mounted state guard exists around child component teardown or error callbacks.
- **`src/components/common/actionWorkflow/useActionWorkflow.ts`**:
  In lines 87–91:
  ```typescript
  } catch (err: any) {
    cleanup();
    setPhase('error');
    setErrorMsg(err?.message || 'Operation failed. Please verify input and try again.');
  }
  ```
  `cleanup()` and `setPhase` run unconditionally even if the component unmounted during the async API call.
- **`src/components/modals/RepoForm.tsx`, `BranchForm.tsx`, `PRForm.tsx`, `CommitForm.tsx`**:
  All delegate execution to `useActionWorkflow`.

---

## Verified Facts & Constraints
- **Verified Fact 1**: `Node cannot be found in the current page` occurs when cleanup handlers, timers, or focus handlers target a DOM element that was already unmounted from the document during or immediately following an async rejection.
- **Verified Fact 2**: All files in the codebase must strictly adhere to the $\le 150$ LOC rule.
- **Verified Fact 3**: The user specifically requested: *"Refactor the modal unmounting lifecycle in the AppContext/CreateModals components to prevent the 'Node cannot be found' error by verifying the component's mounted state before invoking cleanup functions after failed API requests."*

---

## Complexity Classification
**Level 2: Small Feature / Lifecycle Refactoring**
Scope spans `AppContext` / `useUISlice`, `CreateModals.tsx`, and `useActionWorkflow.ts` to ensure consistent mounted-state tracking across modal lifecycles.

---

## Architecture Design

### 1. Mounted-State Guard in `useActionWorkflow`
Introduce `isMountedRef` into `useActionWorkflow.ts`:
- Initialize `isMountedRef.current = true` on mount and set to `false` in the `useEffect` cleanup.
- In the `catch` handler for failed API requests:
  - Check `if (!isMountedRef.current) return;` before calling `setPhase('error')`, `setErrorMsg(...)`, or any error-specific callbacks.
  - Make `cleanup()` safe against detached timers by nulling refs before clearing.

### 2. Modal Unmounting Lifecycle in `CreateModals.tsx`
- Maintain an `isMountedRef` in `CreateModals.tsx`.
- Wrap `closeModal` into a safe handler `handleSafeClose` that:
  - Checks if the component is mounted.
  - Releases active element focus (`document.activeElement?.blur()`) inside a `try/catch` before initiating the exit animation.
  - Ensures cleanup functions from failed API requests do not attempt DOM queries on detached elements.
- Ensure `AnimatePresence` onExitComplete executes any deferred cleanup safely only after the node has finished animating out.

### 3. Safe Modal Teardown Coordination in `AppContext` / `useUISlice`
- In `useUISlice.ts`, add a safe modal dismiss coordinator that allows modals with in-flight or failed requests to cleanly cancel without causing race conditions or invalid unmount queries.

---

## Implementation Breakdown

### Phase 1: `useActionWorkflow.ts` Mounted-State Verification
- **File**: `/src/components/common/actionWorkflow/useActionWorkflow.ts`
- **Actions**:
  - Add `isMountedRef` initialized to `true` and cleaned up to `false`.
  - Guard `setPhase`, `setActiveStepIndex`, `setErrorMsg`, `setResultSummary`, `setCountdownRemaining`, and `cleanup` with `if (!isMountedRef.current) return;`.
  - Verify line count $\le 150$ LOC (currently 120 lines).

### Phase 2: `CreateModals.tsx` Unmounting Lifecycle & Safe Blur
- **File**: `/src/components/CreateModals.tsx`
- **Actions**:
  - Add `isMountedRef` to track mounted state.
  - Implement safe unmount handler that releases focus (`blur()`) before dismissing.
  - Pass guarded `onClose` callback to modal forms to prevent invoking cleanup after unmount.
  - Verify line count $\le 150$ LOC (currently 70 lines).

### Phase 3: `useUISlice.ts` / `AppContext.tsx` Safety Alignment
- **Files**:
  - `/src/context/slices/useUISlice.ts`
  - `/src/AppContext.tsx`
- **Actions**:
  - Ensure `closeModal` does not trigger redundant state changes if already closing.
  - Verify line counts $\le 150$ LOC.

---

## Execution Checklist
1. Update `src/components/common/actionWorkflow/useActionWorkflow.ts` with `isMountedRef` and guarded failure catch blocks.
2. Update `src/components/CreateModals.tsx` with mounted-state verification and safe focus release on unmount.
3. Verify `src/context/slices/useUISlice.ts` and `src/AppContext.tsx` alignment.
4. Execute `compile_applet` and `lint_applet` together to verify zero syntax/TypeScript errors.
5. Wait 10 seconds and test runtime console/endpoints for errors.

---

## Quality Gates & Approval Gate
- No implementation code will be written until this plan receives your explicit approval.
- Standing by for your confirmation (`Approved`, `Proceed`, or `Implement`).
