# 20-Principle Professional Design System Integration

A systematic, production-grade design and interaction upgrade embedding all 20 specified design principles across typography, layout stability, color theory, motion dynamics, and responsive touch ergonomics throughout Git Manager.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Decisions from Phase 1 Alignment:**
> - **Scope & Depth**: Full systematic upgrade across typography, layout, animations, and components (rather than isolated cosmetic touches).
> - **Placement Strategy**: The 20 principles are naturally embedded into the live user interfaces (workbench, commit graph, file tree, diff viewer, command palette, and mobile drawer) as core design architecture rather than an artificial demo screen.

---

### 1. Overview & Core Concept

- **What It Does**: Upgrades Git Manager from a functional utility to an executive-grade engineering workstation by systematically applying 20 foundational design principles. This includes perceptual color calibration via OKLCH color tokens, strict optical centering for modal dialogs and empty states, layout-shift prevention with geometry-locked skeletons, origin-aware and interruptible motion transitions, balanced line-lengths and x-height typography, progressive disclosure in diff and PR inspectors, and minimum 44×44px touch ergonomics with safe-area protection.
- **Target Audience**: Software engineers, technical leads, and open-source contributors managing Git repositories across desktop workstations, tablets, and mobile devices.
- **Key Value**: Delivers zero layout shifting, frictionless scanning of tabular data and code diffs, balanced visual rhythm, and tactile confidence on every device.

---

### 2. User Experience & Visual Design

The 20 design principles are mapped directly to interface layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        20 DESIGN PRINCIPLES MAP                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. TYPOGRAPHY & MEASURE                                                │
│    • Kerning & Tracking: Optical tracking for caps & mono hashes       │
│    • x-Height & Leading: 1.5–1.7 line height for optimal legibility   │
│    • Tabular Numbers: font-variant-numeric: tabular-nums for metrics   │
│    • Line Length: 45–75ch measure on code previews & markdown prose    │
│    • Widow Elimination: text-wrap: balance & pretty on headers/copy   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. SPATIAL MATH & PERCEPTION                                           │
│    • Optical Centre: -4% vertical elevation for dialogs & empty states │
│    • OKLCH Color Space: Perceptually uniform diffs, tags, lane colors  │
│    • Layout Shift Elimination: Reserved bounding boxes & skeletons     │
│    • Safe Area: env(safe-area-inset-*) bounds on mobile viewports      │
├────────────────────────────────────────────────────────────────────────┤
│ 3. MOTION & INTERACTION DYNAMICS                                       │
│    • Origin-Aware Animation: Modals expand from trigger coordinates    │
│    • Interruptible Animation: Spring physics with velocity inheritance │
│    • Stagger: 35ms cascading entrances on commit & repo feeds          │
│    • Shared Element Transition: Morphing cards to workspace headers    │
│    • Optimistic Updates: Instant branch, star & commit staging         │
├────────────────────────────────────────────────────────────────────────┤
│ 4. ERGONOMICS & COMPONENT ARCHITECTURE                                 │
│    • Touch Targets: Strictly >= 44x44px hitboxes for mobile controls   │
│    • Affordances: Elevated surfaces, tactile scale depression          │
│    • Combobox: Unified searchable branch & repo selector               │
│    • Progressive Disclosure: Contextual accordion metadata drawers     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Application Matrix

1. **Kerning & Tracking (`tracking-tight`, `tracking-wide`, `tracking-wider`)**:
   - Headers and display titles receive refined negative tracking (`-0.015em`) to eliminate visual gaps between capital pairs.
   - Micro-labels, monospace commit SHAs, and uppercase badges receive deliberate letter spacing (`tracking-wider`, `+0.05em`) to ensure character boundaries stay crisp at small sizes.
2. **Optical Centre**:
   - Modals (`CloneModal`, `ZipSyncModal`, `BranchDetailModal`, `DeleteRepoModal`), command palettes, and `EmptyState` centerpoints are shifted upwards from 50% to ~44% of the viewport height, aligning with human visual perception.
3. **Tabular Numbers (`tabular-nums`)**:
   - All commit counts, file byte sizes, line numbers in gutters, timestamps, and commit graph lane coordinates use `font-mono tabular-nums` to eliminate horizontal text jitter when switching files or filtering.
4. **Layout Shift Elimination**:
   - Every skeleton loader, file tree node, and branch option maintains identical outer dimensions (`h-8-control` = 40px, `h-8-compact` = 32px) so data transitions cause zero cumulative layout shift (CLS = 0).
5. **x-Height & Leading (`leading-relaxed`, `leading-normal`)**:
   - Body prose and commit messages use typefaces with generous x-height (`Plus Jakarta Sans`), balanced with `leading-relaxed` (1.625) to prevent baseline collision.
6. **Optimistic Updates**:
   - Staging files, switching branches, and toggling repository filters immediately apply to client state with subtle pending indicators, gracefully rolling back if network calls fail.
7. **Touch Target ($\ge 44\times 44\text{px}$)**:
   - All mobile bottom navigation icons, tree toggle buttons, branch chips, action buttons, and modal close targets enforce a minimum 44px hitbox via `min-h-[44px] min-w-[44px]` or pseudo-element hit areas (`after:absolute after:-inset-2`).
8. **Origin-Aware Animation**:
   - Dialogs, mobile action sheets, and command palette results originate with directional scale and transform from the triggering button or coordinate.
9. **OKLCH Color Space Tokens**:
   - Color variables in `index.css` are calibrated using perceptual lightness and chroma (`oklch(0.65 0.18 142)` for additions, `oklch(0.58 0.22 25)` for deletions, `oklch(0.48 0.08 245)` for primary workstation slate), ensuring uniform perceived brightness between light and dark themes.
10. **Widow Elimination (`text-wrap: balance`, `text-wrap: pretty`)**:
    - Applied across all headers, commit descriptions, and modal explainer texts so single dangling words are automatically balanced across lines.
11. **Safe Area (`env(safe-area-inset-*)`)**:
    - Bottom sheets, mobile headers, and sticky action toolbars use standard CSS env variables to ensure hardware notches, home bars, and dynamic islands never clip active elements.
12. **Stagger Motion**:
    - Commit feeds, repository lists, and tree nodes render with a subtle 30–40ms stagger animation on mount to guide the user's eye naturally down the viewport.
13. **Line Length (45–75 Characters)**:
    - Code viewer diffs, commit messages, and markdown documentation containers enforce `max-w-prose` (65ch) constraints for comfortable reading without eye fatigue.
14. **Affordance**:
    - Interactive buttons feature subtle surface depth, hover glow, border elevation, and tactile depression (`active:scale-[0.98] transition-transform`).
15. **Combobox Pattern**:
    - Branch and repository selection employs a hybrid searchable input with keyboard arrow navigation, enter-to-select, and focus-trapped dropdowns.
16. **Interruptible Animation**:
    - Motion animations use spring physics (`damping: 26, stiffness: 280, mass: 0.8`) with velocity preservation so user clicks during animations immediately redirect rather than locking the UI.
17. **Progressive Disclosure**:
    - Deep commit metadata, extended author stats, diff file trees, and advanced clone options hide behind clean expandable disclosure panels to keep default views clutter-free.
18. **Shared Element Transition**:
    - Smooth layout ID transitions between repository card headers, active branch badges, and detail workbench tabs.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: CSS & Theme Token Modernization**:
  - *Chosen*: Introduce OKLCH perceptual tokens alongside standard Tailwind classes in `src/index.css` and use native CSS `text-wrap: balance` and `font-variant-numeric: tabular-nums`.
  - *Why*: Delivers instant, cross-app visual refinement with zero bundle overhead and flawless hardware-accelerated rendering.
- **Decision 2: Tactile Button & Touch Target Refactor**:
  - *Chosen*: Standardize interactive buttons and controls to the 8-point spatial grid (`h-8-control: 40px`, mobile hitboxes `44px`) with `btn-tactile` active scaling.
  - *Why*: Eliminates accidental miss-taps on mobile devices while preserving high data density on desktop displays.
- **Decision 3: Spring Physics Over Duration Transitions**:
  - *Chosen*: Replace fixed-duration ease curves in `motion/react` with spring-based interruptible transitions.
  - *Why*: Prevents animations from feeling robotic or sluggish when the user rapidly interacts or cancels actions.

---

### 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GIT MANAGER WORKSTATION                         │
├────────────────────────────────────┬───────────────────────────────────┤
│ DESKTOP SIDEBAR & WORKBENCH        │ MOBILE SHELL & DRAWER             │
│ • Optical tracking on nav links    │ • Safe area insets (bottom/top)   │
│ • Tabular numbers on repo badges   │ • 44px touch targets on tabs      │
│ • Tactile press affordances        │ • Origin-aware bottom sheets      │
├────────────────────────────────────┴───────────────────────────────────┤
│ REPOSITORY WORKSPACE & REPO DETAILS                                    │
│ • Combobox branch picker with keyboard arrow navigation                │
│ • Progressive disclosure metadata accordions (CiCd, PR reviews)        │
│ • Line-length bounded code viewer (max-w-prose / 75ch measure)         │
│ • Tabular numerals across diff gutters, line counters & graph lanes    │
│ • OKLCH-calibrated diff additions (+emerald) and deletions (-rose)     │
├────────────────────────────────────────────────────────────────────────┤
│ CLONE & ARCHIVE WORKBENCH                                              │
│ • Zero layout shift: Fixed geometry skeleton placeholders              │
│ • Non-clickable single branch card with balanced microcopy             │
│ • Staggered file tree nodes with hierarchical cascading checkboxes     │
│ • Optimistic archive packaging and feedback toasts                     │
└────────────────────────────────────────────────────────────────────────┘
```

#### File Implementation Plan:
1. `src/index.css`:
   - Declare OKLCH perceptual color tokens, `tabular-nums`, `text-wrap: balance`, optical tracking utilities (`tracking-tight`, `tracking-wide`), and safe-area responsive variables.
2. `src/components/UI.tsx` & `src/components/ui/ActionSheet.tsx`:
   - Add optical centering offset (`-4%` translate-y) and tactile press affordances (`active:scale-[0.98]`).
3. `src/features/clone/components/CloneBranchDepthInputs.tsx` & `src/features/clone/components/CloneFormInputs.tsx`:
   - Enhance the branch dropdown into a searchable combobox with keyboard arrow support and 44px touch target ergonomics.
4. `src/features/desktop/screens/DesktopFilesView.tsx` & `src/mobile/screens/repo/FilesScreen.tsx`:
   - Enforce line-length constraints, tabular line numbers, and progressive disclosure for file metadata.
5. `src/features/desktop/screens/DesktopCommitsView.tsx` & `src/components/commit/CommitItem.tsx`:
   - Add staggered entrance animations, balanced commit titles, and tabular stats.
6. `src/mobile/layout/BottomNav.tsx` & `src/mobile/layout/MobileShell.tsx`:
   - Verify safe-area constraints and minimum 44px hitboxes for all navigation icons.
