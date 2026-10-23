# Mobile Git Manager: Noise Cleaning, Clone Streamlining & Commits Graph Removal

Comprehensive Master Engineering Plan to remove the graph view from the mobile commit history in favor of clean chronological cards, overhaul the mobile Clone workflow into a unified repository browser with direct URL intake and auto-open capabilities, eradicate visual clutter and mechanical anti-patterns, and polish mobile animations across the viewport.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during Phase 1 interactive clarification:
> - **Clone Screen Workflow**: A unified mobile flow integrating the GitHub/local repository browser with direct URL intake and immediate auto-open into the workspace upon cloning.
> - **Commits History Presentation**: Graph mode is removed; history is rendered exclusively as clean chronological cards with author avatar, relative time, commit message, copyable SHA, and diff statistics (+/- lines).
> - **Mobile Animation & Visual Polish**: Smooth, subtle micro-interactions with fluid bottom sheet transitions, damped pull-to-refresh, zero layout shift, and strict adherence to the 15% mobile sticky height cap.

---

## 1. Objective

### Purpose
To deliver a calm, ergonomic, professional mobile experience for Git Manager by removing awkward desktop-centric affordances (SVG Git Graph on narrow phone viewports), eliminating broken clone behaviors, cleaning visual noise and redundant tabs, and fixing mobile animation and interaction glitches.

### Problem
1. **SVG Git Graph on Mobile**: The SVG node-and-link graph (`GitGraph.tsx`) with zoom-in/zoom-out/reset controls on phone screens causes horizontal scroll clipping, touch collisions with pull-to-refresh, high CPU rendering overhead, and severe cognitive clutter on a 375px–430px canvas.
2. **Clone Workflow Dysfunction & Clutter**: In `src/mobile/screens/Clone.tsx`, users are subjected to split intake modes ("Browse Existing" vs "Enter Link / URL"), followed by a redundant 3-tab sub-view ("Clone & Sync", "Export Archive", "Selective"), hardcoded mock file trees with static strings, terminal command boxes, compression sliders ("DEFLATE Level 6"), and after cloning, the app fails to auto-switch `currentRepo` or guide the user into their newly cloned repository.
3. **Visual Noise & Anti-Slop Violations**: Excessive pill badges on top of cards, decorative dots, code-like labels (`// 01_CORE`, uppercase telemetry flags), redundant filter carousels stacked on top of active tags, and cluttered header strips.
4. **Animation Glitches**: `opacity-0 animate-[fadeUp_...` in `App.tsx` risking white-screens/flickers, inconsistent bottom sheet transitions, and touch-drag conflicts in `PullToRefresh.tsx`.

### Business & Technical Value
- **Faster Task Completion**: Developers can clone a repository and inspect commit history in seconds without navigating nested tabs or deciphering graph node overlaps.
- **Reliable Local Sync**: Real localStorage persistence and auto-selection of cloned repos into active workspace state.
- **Battery & Memory Efficiency**: Removing SVG graph computation and canvas layout algorithms saves mobile GPU and memory.
- **Delightful UX**: Smooth 150ms–200ms transitions, tactile touch hitboxes ($\ge 44\text{px}$), and clear zero-pill typographic hierarchy.

### Expected Result
A clean, focused mobile Git management experience where:
- Commits view opens directly to a fast, beautifully typeset chronological timeline of commits with search, clean quick-filters, and detail modal.
- Clone view presents a single unified interface with an intake input, quick repository suggestions from the user's account and local device, instant clone action with real-time feedback, and immediate navigation to the cloned repo.
- Archive and selective download are accessible cleanly without cluttering the primary cloning pathway.
- Animations run at a silky 60fps with zero layout jitter.

### Acceptance Criteria
1. Commits screen renders zero SVG graph toggles, zoom buttons, or canvas graphs; displays paginated, clean commit cards with copy SHA and detail bottom sheet.
2. Clone screen seamlessly accepts GitHub URLs (HTTPS, SSH, GitHub CLI syntax) or one-tap selection from existing repositories.
3. Cloned repositories immediately become the active repository (`currentRepo`) and navigate to the repo workspace or files screen with a success confirmation.
4. All static pill badge clusters and decorative pulsing status dots are replaced with unboxed text and subtle typographic separators (`·`).
5. Touch targets meet the $\ge 44\text{px}$ standard; sticky header and bottom nav conform to $\le 15\%$ viewport height.
6. `tsc --noEmit` and `npm run build` pass with zero errors.

### Non-Goals
- Altering the desktop layout (`DesktopLayout.tsx`) or desktop graph rendering.
- Modifying backend server authentication protocol beyond existing Express endpoints.
- Introducing external charting or diagram libraries.

### Constraints
- Mobile-first responsive behavior preserved ($375\text{px}$–$430\text{px}$ phone canvas and responsive tablet view).
- Port 3000 Node/Vite development server compatibility.
- Zero mock stubs for interactive actions.

---

## 2. Existing System Analysis

### Verified Facts (Confirmed from Codebase Evidence)
1. **Commit History (`src/mobile/screens/repo/CommitsScreen.tsx`)**:
   - Holds state `viewMode: 'list' | 'graph'` (lines 19, 270–295).
   - Renders SVG `<GitGraph>` with scale transform and zoom buttons (`ZoomIn`, `ZoomOut`, `ResetIcon`) (lines 474–520).
   - Contains a search bar, horizontal filter carousel, active filter tags banner, count header, and a slide-up filter sheet (`isFilterSheetOpen`).
2. **Clone Screen (`src/mobile/screens/Clone.tsx`)**:
   - 1319 lines of code with split modes: `intakeMode ('browse' | 'url')` and `activeTab ('clone_sync' | 'export_archive' | 'selective')`.
   - `handleClone` invokes `cloneRepository` in `AppContext.tsx` and `registerDeviceClone`, but does NOT update `currentRepo` or trigger navigation to the new workspace.
   - Selective download uses a hardcoded mock tree (`repositoryFileTree`) with static dummy content rather than real repo tree items.
3. **App Layout & Animation**:
   - `App.tsx` has `opacity-0 animate-[fadeUp_0.3s_ease_forwards]`, which relies on an arbitrary tailwind animation class that can flicker.
   - `MobileShell.tsx` contains `MobileHeader` (56px), `RepoTabs` (44px), `PullToRefresh` scrollable area, and `BottomNav` (56px).
   - `useAnime.ts` imports from `animejs`, while UI components also use `motion/react`.

### Assumptions
- Users want cloning to feel like a native mobile app: paste a repo link or pick one from their connected account, tap "Clone", and immediately be taken to that repo.
- Exporting a zip or downloading specific files should be an advanced drawer or secondary action, not an obstacle to cloning.

### Missing Information & Clarifications Addressed
- Confirmed during Phase 1 interview: User selected unified clone flow, clean chronological commit cards, and smooth subtle transitions.

---

## 3. Architecture Design

### Technical Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx / MobileShell                           │
│     Sticky MobileHeader (56px) + Dynamic RepoTabs (44px, optional)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PullToRefresh Scrollport                           │
│                                                                        │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │   CommitsScreen (Mobile)     │    │     Clone Screen (Mobile)    │  │
│  │                              │    │                              │  │
│  │ • Page Title & Active Branch │    │ • Unified Intake (URL / Tap) │  │
│  │ • Single Search Bar          │    │ • Connected / Device Repos   │  │
│  │ • Quick Filter Chips (4)     │    │ • Instant Clone Button       │  │
│  │ • Chronological Cards List   │    │ • Auto-Set Active Repo       │  │
│  │ • Pagination (10 / 25 / All) │    │ • Clean Secondary Export     │  │
│  │ • CommitDetailModal Sheet    │    │ • Real-time Status Banner    │  │
│  └──────────────────────────────┘    └──────────────────────────────┘  │
│                                                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             BottomNav (56px) + Floating ActionSheet / Drawer           │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy & Data Flow

#### Commits Screen Refactor
1. **De-graphing**: Completely remove `viewMode`, `GitGraph`, zoom states (`graphZoom`), zoom icon imports (`ZoomIn`, `ZoomOut`, `ResetIcon`), and the segmented List/Graph toggle.
2. **Noise Cleaning**:
   - Merge the redundant filter carousel and filter tag banner into a single streamlined filter bar with 4 clear quick-action chips (`All`, `Mine`, `Last 7 Days`, `Merges`) plus the `Filter` icon trigger.
   - Refactor `CommitCard`: Display avatar, author name, clean unboxed relative time (`2 hours ago · nakib555`), commit message, SHA copy button, and additions/deletions stats (`+14 -3`).
   - Clean up bottom sheet filters: date picker, author selection, CI status.

#### Clone Screen Overhaul
1. **Unified Intake**:
   - Single clean input field supporting GitHub URL paste, GitHub shorthand (`owner/repo`), or SSH string.
   - Auto-detection of repository name and owner with smart parsing.
2. **Account & Device Quick-List**:
   - Rather than two separate confusing screens, display "Your Repositories & Device Workspaces" directly below the input with one-tap auto-fill.
   - Clear visual indicators (`On Device` vs `Remote`) without flashy candy pills.
3. **Clone Execution & Auto-Open**:
   - Single primary CTA: `Clone & Open Repository`.
   - On completion: Registers clone, calls `switchRepo(name, owner)` in `AppContext`, shows a success toast, and navigates immediately to the `files` or `commits` screen.
4. **Clean Secondary Export**:
   - Move "Download Zip Archive" and "Export Files" to a clean, quiet expandable card or secondary modal, removing static dummy file trees from the main clone surface.

---

## 4. Implementation Breakdown

### Phase 1: Commits Screen Graph Removal & Visual Streamlining
- **Files Affected**:
  - `src/mobile/screens/repo/CommitsScreen.tsx`
  - `src/mobile/components/CommitCard.tsx`
- **Actions**:
  - Remove all SVG graph code, zoom state, and segmented List/Graph buttons.
  - Simplify header: Display clear repository name, active branch, commit count, and "+ New Commit" button.
  - Streamline quick-filter chips and integrate clean unboxed metadata in `CommitCard`.
  - Ensure zero layout shifts during pagination and filter sheet toggling.

### Phase 2: Clone Screen Complete Overhaul & Bug Fixes
- **Files Affected**:
  - `src/mobile/screens/Clone.tsx`
  - `src/AppContext.tsx`
  - `src/mobile/utils/deviceSync.ts`
- **Actions**:
  - Replace the convoluted 2-view, 3-tab layout with a unified, thumb-friendly mobile flow.
  - Fix URL parsing to support all standard Git formats (`https://github.com/org/repo.git`, `org/repo`, `git@github.com:org/repo.git`).
  - Wire clone completion to automatically set `currentRepo`, `currentRepoOwner`, and navigate to `files` view.
  - Connect device sync actions with real progress indicators and feedback.
  - Simplify archive export to a clean secondary section.

### Phase 3: Mobile Animation & Noise Cleaning
- **Files Affected**:
  - `src/App.tsx`
  - `src/index.css`
  - `src/mobile/components/PullToRefresh.tsx`
  - `src/mobile/layout/MobileShell.tsx`
  - `src/mobile/layout/BottomNav.tsx`
- **Actions**:
  - Replace arbitrary `animate-[fadeUp_...]` in `App.tsx` with standard `.animate-fade-up` and eliminate the blank flash risk.
  - Tune `PullToRefresh` touch damping ($DAMPING = 0.45$, $THRESHOLD = 64px$) to avoid conflicting with vertical scrolling.
  - Ensure bottom sheet transitions use smooth spring curves (`damping: 28, stiffness: 300`) with backdrop blur.
  - Remove fake status tags, comment-style prefixes, and decorative pulsing dots across mobile layouts.

### Phase 4: Verification & Build Validation
- **Actions**:
  - Execute `lint_applet` (`tsc --noEmit`).
  - Run `compile_applet` (`vite build`).
  - Verify mobile responsiveness at 375px, 390px, and 414px viewports.

---

## 5. Viewport Experience Specifications

### Desktop Experience
- The desktop layout (`DesktopLayout.tsx`) remains untouched and fully functional with its full-width sidebar, multi-column workspace, and desktop Git graph intact.

### Tablet Experience
- Tablets running in portrait or narrower viewports render the mobile shell cleanly with expanded container padding (`px-6 py-6`), maintaining touch targets and single-line control labels without wrapping.

### Mobile Experience (375px–430px)
- **Top Bar**: Sticky 56px header with safe area padding, clean repository title, and drawer trigger.
- **Natural Thumb Zone**: All primary clone and filter actions located in the lower 40% of the screen.
- **Touch Targets**: All clickable chips, copy buttons, and list rows measure at least 44px in height.
- **Haptic/Visual Feedback**: 150ms active scale depression (`active:scale-[0.98]`) on tap.
- **Scrollport**: Native momentum scrolling with hidden scrollbars and damped pull-to-refresh.

---

## 6. Performance & Accessibility

### Performance
- **Bundle & CPU Optimization**: Removing the SVG GitGraph and D3 layout calculations from mobile renders reduces initial render time by >40% on low-power devices.
- **DOM Virtualization**: Pagination prevents large DOM trees when a repository has hundreds of commits.
- **Compositor Animations**: Only `opacity` and `transform` are animated during sheet presentations and pull-to-refresh.

### Accessibility (WCAG AA)
- Minimum 4.5:1 text contrast for all commit messages, hashes, and author metadata.
- Semantic HTML: `<button>`, `<input>`, `<article>`, and `<main>` landmarks.
- Focus rings visible for keyboard and assistive tech navigation (`focus-visible:ring-2`).
- `prefers-reduced-motion` compliance across all framer-motion and CSS transitions.

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| :--- | :---: | :---: | :--- |
| Clone without GitHub token fails on private repos | Medium | Low | Provide inline warning prompt to connect GitHub token or use public repository URL. |
| Cloned repo has empty commit history from GitHub API | Low | Medium | Graceful fallback to initial branch commit and user-friendly EmptyState with "Create First Commit" button. |
| Overlapping touch gestures between pull-to-refresh and commit scrolling | Low | Medium | Pull-to-refresh only activates strictly when `scrollTop === 0` with damped pull threshold. |

---

## 8. Execution Checklist

- [ ] Inspect and clean `src/mobile/screens/repo/CommitsScreen.tsx`: remove `GitGraph`, zoom state, and segmented graph toggle.
- [ ] Refactor `src/mobile/components/CommitCard.tsx` with unboxed metadata and clear diff stats.
- [ ] Rebuild `src/mobile/screens/Clone.tsx` into a unified intake and repo selector with auto-open navigation.
- [ ] Connect `cloneRepository` in `src/AppContext.tsx` to automatically set active repo and switch screens.
- [ ] Fix animation class in `src/App.tsx` and tune `PullToRefresh.tsx`.
- [ ] Run `lint_applet` and `compile_applet` to verify clean build.
