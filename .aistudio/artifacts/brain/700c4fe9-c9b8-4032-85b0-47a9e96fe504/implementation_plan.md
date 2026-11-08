# Master Engineering Specification: UI/AI Animation & Design Unslop Overhaul
## ProDoc Git Manager System Architecture & Micro-Interaction Engineering

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters were confirmed in Phase 1 interactive clarification:
> - **Scope of Overhaul**: Full application across desktop workbench, mobile touch shell, command palette, repository browser, commit lists, modals, and the Universal File Preview engine.
> - **Motion Curve Strategy**: Strict crisp cubic-bezier ease-out timing (`cubic-bezier(0.16, 1, 0.3, 1)`) for data tables and everyday utilitarian controls (zero bouncy rubber-banding on everyday utilitarian work), paired with subtle tactile compression (`scale(0.97)`) on button presses and interactive triggers.
> - **Accessibility & Reduced Motion**: Complete `prefers-reduced-motion` compliance across CSS utilities and JavaScript animation hooks (`useAnime.ts`, `Motion`), with instant zero-motion mode toggle support in application settings.

---

### 1. Verified Facts, Assumptions & Missing Information

#### Verified Facts (Codebase Evidence)
- **Animation Tooling**:
  - `animejs: ^4.5.0` and `@types/animejs: ^4.0.0` are installed and integrated via `src/hooks/useAnime.ts` with `useAnime`, `useStaggerList`, and `checkPrefersReducedMotion`.
  - `motion: ^12.23.24` (Motion for React) is installed and active in modal transitions (`AnimatePresence`, `motion.div`).
  - CSS animations in `src/index.css`: `@keyframes float`, `@keyframes fadeUp`, `@keyframes shimmer`, `.tabular-nums`.
- **UI Components & Workbenches**:
  - Desktop: `DesktopLayout.tsx`, `DesktopTopBar.tsx`, `DesktopSidebar.tsx`, `DesktopFilesView.tsx`, `DesktopCommitsView.tsx`, `DesktopDashboard.tsx`, `DesktopPRsView.tsx`, `DesktopBranchesView.tsx`.
  - Mobile: `MobileShell.tsx`, `MobileHeader.tsx`, `BottomNav.tsx`, `FileViewerModal.tsx`, `CommitCard.tsx`, `RepoCard.tsx`, `ActionSheet.tsx`.
  - Universal Preview: `UniversalFilePreview.tsx`, `PreviewToolbar.tsx`, `PreviewMetadataHeader.tsx`, `PreviewRouter.tsx`, with image, document, spreadsheet, code, archive, audio, video, font, 3D, and hex renderers.
  - Modals & Global Overlays: `CommandPalette.tsx`, `ZipSyncModal.tsx`, `CreateModals.tsx`, `DeleteFileConfirmModal.tsx`, `Toast.tsx`.

#### Assumptions
- Performance budget: All micro-interactions must execute within a 150ms–250ms latency budget to avoid interaction fatigue.
- Hardware baseline: Smooth 60fps/120fps GPU compositor performance on standard mobile phones and laptop displays without triggering layout reflows or battery drain.

#### Missing Information & Handled Gracefully
- Some legacy components still use hardcoded margin offsets or nested rounded corners where inner radius was not calculated mathematically ($r_{inner} = r_{outer} - padding$). These will be systematically aligned to the 8-point spatial grid system.

---

### 2. Objective

- **Purpose**: Systematically apply the 20 Animation Best Practices and 20 Anti-Slop Design Principles across every screen, interaction trigger, list cascade, modal, and data view in Git Manager.
- **Problem**: Modern web applications frequently fall into "AI slop" traps (decorative pill badges, arbitrary gradients, inconsistent nested radii, lack of tactile feedback, jittery non-tabular numbers, and jarring pop-ins).
- **Business & Technical Value**: Upgrades Git Manager into a premier, world-class developer workstation with tactile physical resistance, fluid 30ms staggered cascades, zero-clutter typography, WCAG AA contrast, and zero layout thrashing.
- **Success Criteria**:
  - 100% of button clicks, triggers, and list items have tactile active compression (`active:scale-[0.97]`).
  - List views (commits, file trees, repositories, PRs) cascade smoothly with a 30ms stagger interval.
  - Dropdowns, tooltips, and popovers scale smoothly from 0.95 with 150ms–250ms duration, and exits are 20% faster than entrances.
  - All numbers in data grids, metrics, time stamps, and file sizes enforce `tabular-nums` alignment.
  - Nested container curves strictly follow the geometric law: $r_{inner} = r_{outer} - padding$.
  - Zero filler badges, no code-comment titles, no fake status dots, and no unstyled italicized text.
- **Non-Goals**: Adding decorative cartoon animations, heavy 3D particle canvas backgrounds, or bouncy rubber-band springs on utilitarian tables and code editors.

---

### 3. Existing System Analysis

- **Strengths**: The application already possesses clean light engineering tokens (`--color-background: #F7F7F5`, `--color-surface-1: #FFFFFF`, `--color-border: #DEDDD8`, `--color-accent: #3E5670`). It has Anime.js 4 and Motion 12 ready in dependencies.
- **Areas for Anti-Slop & Motion Upgrades**:
  1. *Button Press Feedback*: Many desktop and mobile buttons lack the physical `active:scale-[0.97]` tactile resistance.
  2. *List Stagger Cascades*: Commits, files, and repos currently render instantly or with uniform fadeUp rather than a choreographed 30ms cascade.
  3. *Nested Radius Alignment*: Several card containers use `rounded-2xl` with inner items also using `rounded-2xl` instead of calculated $r_{inner} = r_{outer} - padding$.
  4. *Dropdown & Popover Origins*: Command palette and dropdowns scale from 0 or fade linearly instead of scaling gracefully from `0.95` with ease-out deceleration.
  5. *Exit Durations*: Exits in several modals use identical durations to entrances instead of 20% shorter snappy dismissals.
  6. *Success Pulse Confirmation*: Copy buttons, branch creation, file deletion, and commit actions should provide a quiet, tactile confirmation pulse rather than a static text flip.
  7. *Headline Balance*: Headlines in headers and dialogs should enforce `text-wrap: balance` to eliminate orphan words.

---

### 4. Architecture Design: The 20 Animations & 20 Anti-Slop Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ProDoc Design & Motion Architecture                  │
├───────────────────────────────────┬────────────────────────────────────┤
│   20 Animation Principles Engine  │   20 Anti-Slop Design Principles   │
├───────────────────────────────────┼────────────────────────────────────┤
│ 1. Ease-out for entrances (180ms) │ 1. Delete filler badges            │
│ 2. Dropdowns at 150–250ms         │ 2. Drop redundant labels           │
│ 3. Stagger list rows by 30ms      │ 3. Unitalicize random words        │
│ 4. Scale to 0.97 on press         │ 4. Monospace strictly for code/data│
│ 5. Stretch moving knobs 12%       │ 5. Cohesive token design system    │
│ 6. Stagger details settling       │ 6. Real working product previews   │
│ 7. Subtle arcs for movement       │ 7. Strong focal hierarchy          │
│ 8. Pulse to confirm success       │ 8. Group with spacing, not boxes   │
│ 9. Ease-in-out for layout moves   │ 9. Concrete, specific headlines    │
│ 10. Popovers start at 0.95 scale  │ 10. High-contrast primary CTA      │
│ 11. Enter from trigger origin     │ 11. Single accent color budget     │
│ 12. Exit to trigger origin        │ 12. Unified Lucide icon geometry   │
│ 13. Zero bounce on utilitarian UI │ 13. Strip neon & noisy gradients   │
│ 14. Freeze tween while held       │ 14. r_inner = r_outer - padding    │
│ 15. Exits 20% faster than enters  │ 15. WCAG AA 4.5:1 text contrast    │
│ 16. Overlap old & new states      │ 16. text-wrap: balance on headings │
│ 17. Precise overflow masks        │ 17. Optical alignment by eye       │
│ 18. Crossfade icons smoothly      │ 18. Tabular figures (tabular-nums) │
│ 19. Bounded scroll limits         │ 19. Precision skeleton loaders     │
│ 20. Shared layoutId morphing      │ 20. Motion reserved for feedback   │
└───────────────────────────────────┴────────────────────────────────────┘
```

#### Shared CSS Utilities & Motion Tokens (`src/index.css`)
```css
/* Tactile Press Physics */
.btn-tactile {
  transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, border-color 0.15s ease;
}
.btn-tactile:active {
  transform: scale(0.97);
}

/* Snappy 150-250ms Dropdown & Popover Deceleration */
.popover-enter {
  animation: popoverEnter 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: top center;
}
.popover-exit {
  animation: popoverExit 0.14s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes popoverEnter {
  from { opacity: 0; transform: scale(0.95) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes popoverExit {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.96) translateY(-2px); }
}

/* 30ms Stagger Cascade Animation */
.cascade-item {
  animation: cascadeSlide 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes cascadeSlide {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Success Confirmation Pulse */
@keyframes successPulse {
  0% { transform: scale(1); }
  40% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
.animate-success-pulse {
  animation: successPulse 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

### 5. Implementation Breakdown

#### Phase 1: Global Motion Tokens, Tactile Press & Anti-Slop Foundations
- **Purpose**: Define reusable CSS classes, timing curves, popover scale origins, and reduced-motion overrides in `src/index.css`.
- **Files Affected**:
  - `src/index.css`
  - `src/hooks/useAnime.ts`
- **Expected Result**: Standardized `.btn-tactile` (`scale(0.97)`), `.popover-enter` (0.95 scale start), `.cascade-item` (30ms intervals), and mathematical radius standards.

#### Phase 2: Command Palette, Modals & Global Overlays
- **Purpose**: Upgrade `CommandPalette.tsx`, `DeleteFileConfirmModal.tsx`, `ZipSyncModal.tsx`, and `Toast.tsx`.
- **Files Affected**:
  - `src/components/CommandPalette.tsx`
  - `src/components/ui/Toast.tsx`
  - `src/components/modals/DeleteFileConfirmModal.tsx`
- **Expected Result**: Popovers and dialogs enter from scale 0.95 with smooth ease-out deceleration, dismiss 20% faster, and success actions trigger tactile pulses.

#### Phase 3: Desktop Workbench & Navigation Overhaul
- **Purpose**: Apply tactile buttons, 30ms list cascades, mathematical nested radii, unboxed typography, and headline balance across desktop views.
- **Files Affected**:
  - `src/features/desktop/components/DesktopSidebar.tsx`
  - `src/features/desktop/components/DesktopTopBar.tsx`
  - `src/features/desktop/screens/DesktopFilesView.tsx`
  - `src/features/desktop/screens/DesktopCommitsView.tsx`
  - `src/features/desktop/screens/DesktopRepoWorkspace.tsx`
- **Expected Result**: High-density desktop workspace with zero bouncy rubber-banding on data tables, clean whitespace grouping, and crisp button presses.

#### Phase 4: Universal File Preview Engine Micro-Interactions
- **Purpose**: Enhance toolbar controls, image pan/zoom canvas, audio waveform scrubbing, video speed switches, and hex inspection with tactile feedback and loading states.
- **Files Affected**:
  - `src/features/preview/components/PreviewToolbar.tsx`
  - `src/features/preview/components/PreviewMetadataHeader.tsx`
  - `src/features/preview/renderers/image/ImageControls.tsx`
  - `src/features/preview/renderers/media/AudioPreview.tsx`
  - `src/features/preview/renderers/fallback/HexDumpPreview.tsx`
- **Expected Result**: Universal Preview engine responds instantly with smooth 150ms transitions, tactile zoom buttons, and clean tabular numerals.

#### Phase 5: Mobile Touch Ergonomics & Sheet Polish
- **Purpose**: Apply 44px+ hitboxes, thumb-zone ergonomics, bottom sheet slide-up transitions, and tactile icon crossfades to mobile components.
- **Files Affected**:
  - `src/mobile/layout/MobileHeader.tsx`
  - `src/mobile/layout/BottomNav.tsx`
  - `src/mobile/screens/repo/files/FileViewerModal.tsx`
- **Expected Result**: Smooth mobile experience with pull-to-refresh rubber banding, sheet dismissals that are 20% faster, and unslop typography.

---

### 6. Desktop, Tablet & Mobile Experience

- **Desktop (1440px Baseline)**:
  - Strict utilitarian ease-out curves on data grids, file trees, and diff viewers.
  - Buttons depress by 3% (`scale(0.97)`) on click with 120ms release.
  - Command palette reveals with 180ms ease-out from 0.95 scale and dismisses in 140ms.
  - All metrics, line counts, byte sizes, and timestamps format with `tabular-nums`.
- **Tablet (768px–1024px)**:
  - Responsive drawer animations with touch drag feedback.
  - Adaptive 30ms list cascades for commit logs and branches.
- **Mobile (375px–430px)**:
  - Bottom navigation tabs with tactile press compression and subtle active dot indicator.
  - Modal sheets slide up with spring damping (28, stiffness 300) and collapse into trigger origins on close.
  - Sticky surfaces capped strictly at $\le 15\%$ of viewport height.

---

### 7. Performance & Accessibility Safeguards

- **Performance**:
  - Compositor-Only Animations: Strictly animate `transform` and `opacity`. Never animate `width`, `height`, `margin`, or `left`.
  - Stagger Limiting: Maximum 15 items in animated cascade batches to prevent CPU spikes on large repos.
  - Clean Memory: Revoke all animation listeners and object URLs on unmount.
- **Accessibility**:
  - Full `prefers-reduced-motion` compliance: When enabled, all durations and delays become `0ms` instantly.
  - WCAG AA Contrast: Foreground text maintains at least 4.5:1 ratio against surfaces.
  - No hue-only signaling: Every state pairs color with a distinct icon or text label.

---

### 8. Testing & Validation Strategy

1. **Compilation & Typing**: `compile_applet` and `lint_applet` together with zero TypeScript or syntax errors.
2. **Animation Timing Audit**:
   - Verify dropdowns and popovers open within 150ms–250ms and exit 20% faster.
   - Verify list rows cascade at 30ms intervals.
   - Verify tactile press compression (`scale(0.97)`) on buttons.
3. **Anti-Slop Audit**:
   - Verify no filler badges or decorative comment headers exist.
   - Verify nested radii follow $r_{inner} = r_{outer} - padding$.
   - Verify numbers in tables and metrics use `tabular-nums`.
4. **10-Second Post-Build Runtime Audit**: Dev server response and console error inspection.

---

### 9. Execution Checklist

- [ ] 1. Add standardized motion tokens, timing curves (`cubic-bezier(0.16, 1, 0.3, 1)`), `.btn-tactile`, popover animations, and mathematical radius rules to `src/index.css`.
- [ ] 2. Enhance `src/hooks/useAnime.ts` with instant 30ms stagger cascade helpers and reduced-motion fallback.
- [ ] 3. Upgrade `src/components/CommandPalette.tsx` with 0.95 scale entrance, 20% faster exit, and tactile item selection.
- [ ] 4. Upgrade `src/components/ui/Toast.tsx` with ease-out reveal, success pulse, and snappy dismissal.
- [ ] 5. Upgrade `src/components/modals/DeleteFileConfirmModal.tsx` and action modals with tactile buttons and mathematical nested radii.
- [ ] 6. Polish `src/features/desktop/components/DesktopTopBar.tsx` and `DesktopSidebar.tsx` with unboxed metadata and tactile nav triggers.
- [ ] 7. Polish `src/features/desktop/screens/DesktopFilesView.tsx` with 30ms file tree cascade and balanced headlines.
- [ ] 8. Polish `src/features/desktop/screens/DesktopCommitsView.tsx` with tabular numbers, 30ms commit row staggers, and unslop typography.
- [ ] 9. Polish `src/features/preview/components/PreviewToolbar.tsx` and `PreviewMetadataHeader.tsx` with tactile buttons and success copy pulse.
- [ ] 10. Polish `src/features/preview/renderers/image/ImageControls.tsx` with squash-and-stretch controls and tactile zoom.
- [ ] 11. Polish mobile `BottomNav.tsx`, `MobileHeader.tsx`, and `FileViewerModal.tsx` with touch ergonomics and 20% faster exits.
- [ ] 12. Run `compile_applet` and `lint_applet` together to verify zero build or lint issues.
- [ ] 13. Wait 10 seconds and verify clean console logs without errors.

---

### Quality Gates

- [x] Architecture adheres strictly to all 20 Animation Best Practices and 20 Anti-Slop Rules.
- [x] Utilitarian screens and code/diff editors remain spring-free (no fatigue/bounce).
- [x] WCAG AA contrast and prefers-reduced-motion fully preserved.
- [x] Zero breaking changes to git repository operations or preview decoding.

---

### Approval Gate

> [!NOTE]
> In accordance with the Master Engineering Planning & Implementation Protocol, all implementation is paused at this gate.
> Awaiting explicit approval ("Approved", "Proceed", or "Implement") before writing code.
