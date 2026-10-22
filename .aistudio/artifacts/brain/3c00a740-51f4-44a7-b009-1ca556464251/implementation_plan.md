# Engineering Specification: Full-System 8-Point Spatial Architecture & UI Overhaul (Git Manager Pro)

## Protocol Compliance Notice
This engineering plan is drafted in strict adherence to the **Master Engineering Planning & Implementation Protocol (Evidence-First)** and the **Universal Frontend Design Constitution** (`/skills/system_skills/frontend_design/SKILL.md`). In accordance with the protocol's Highest Priority Instruction and Approval Gate, no implementation code, source edits, or patches have been executed prior to plan submission.

---

## 1. Verified Facts, Assumptions, and Missing Information

### Verified Facts
1. **Design System & Spatial Baseline (`Git Manager Pro — 8-Point Spatial System`)**:
   - Canvas: `#0B0F19` (Dark Workstation), Surfaces: Surface-1 `#131B2E`, Surface-2 `#1C263E`, Surface-3 `#263454`.
   - Hairline Borders: Border Subtle `#212E4A`, Border Accent `#31446E`.
   - Git Semantic Entities: Add `#3FB950`, Del `#F85149`, Mod `#388BFD`, Branch `#58A6FF`, Merge `#A371F7`, Warn `#D29922`.
   - Strict 8-Point Spatial Grid: 4px (`1`), 8px (`2`), 12px (`3`), 16px (`4`), 20px (`5`), 24px (`6`), 32px (`8`), 40px (`10`), 44px (`11` min touch target), 48px (`12`), 56px (`14` bar height), 64px (`16`).
   - Fonts: `Plus Jakarta Sans` for UI display and sans prose; `JetBrains Mono` for SHAs, code, diffs, and tabular telemetry.
2. **Commit Detail Modal Blueprint**:
   - Header with `VERIFIED` pill badge (`bg-git-add/15 text-git-add border border-git-add/30`), short SHA chip, and relative author time.
   - Quantitative Visual Churn Bar with proportional delta progress bar (`+7,576` / `-18`) and changed files count.
   - Segmented 3-tab navigation (`Overview`, `Diffs`, `CI/CD`).
   - Overview Tab: Full message box with copy action, visual **Branch Lineage & Ancestry tree** (Parent SHA -> Current SHA with HEAD tag -> Target Branch `refs/heads/main`), and metadata grid (Committed At, GPG Key RSA-4096).
   - Diffs Tab: Changed files horizontal chip scroller with `ADD`/`MOD` badges, syntax-highlighted unified diff block (`+` in green, `-` in red, `@@` in accent, line numbers).
   - CI/CD Tab: Multi-step pipeline visualizer (Lint & Typecheck, Vitest Unit Suite, Cloudflare Worker Deploy) with durations and log inspection.
   - Sticky Footer: Copy Short SHA, "Branch From Here" action, and Cherry Pick action.
3. **Application Structure**:
   - Desktop view mounted on viewports $\ge 1024\text{px}$ (`src/components/DesktopLayout.tsx`).
   - Mobile view mounted on viewports $< 1024\text{px}$ (`src/mobile/layout/MobileShell.tsx`).
   - Shared `AppContext.tsx` providing real GitHub API data and local workspace state.

### Assumptions
- The application will standardize its theme tokens on the 8-point spatial workstation palette (`#0B0F19` canvas, `#131B2E` / `#1C263E` / `#263454` surfaces) while continuing to provide smooth optical light-mode compensation.

### Missing Information
- None. Complete component trees, styling files, and design examples have been audited.

---

## 2. Complexity Classification
- **Level 4 (Architecture & Whole-System UI Redesign)**: Re-architects global design tokens, spatial typography, desktop workbench layout, and mobile components into a unified, high-contrast developer studio tool.

---

## 3. Objective

### Purpose
Scale the high-contrast developer aesthetic and strict 8-point spatial foundation of the `Git Manager Pro` reference across the entire application (both Desktop and Mobile).

### Problem
- While the mobile commit screens reflect the new 8-point spatial rhythm, other views (Desktop layout, Sidebar, Repositories, Dashboard, Settings) require complete visual alignment to eliminate token divergence, card-in-card nesting, and mismatched fonts.

### Success & Acceptance Criteria
1. **Global Tokens & Fonts**:
   - Index HTML loads `Plus Jakarta Sans` alongside `JetBrains Mono`.
   - Global CSS (`src/index.css`) standardizes on `#0B0F19` canvas, `#131B2E` surface-1, `#1C263E` surface-2, `#263454` surface-3, `#212E4A` border-subtle, and `#31446E` border-accent.
   - 8-point spatial spacing classes and `.grid-8pt-pattern` subtle overlay support.
2. **Commit Detail Sheet & Modal**:
   - Implements the complete verified commit inspection structure across both Mobile and Desktop commit viewports.
3. **Desktop Workbench Harmonization**:
   - 56px top header conforming to the 3-zone contract with active branch chip halo.
   - Sidebar with 44px navigation targets and clean active indicators.
   - Repositories split-pane with unified 8pt spatial padding.
   - Dashboard KPI metric cards and velocity charts using canonical tokens.
4. **Verification**: 100% clean TypeScript linting (`lint_applet`) and compilation (`compile_applet`).

---

## 4. Existing System Analysis

### Architecture & File Tree
- `index.html`: Entry point for web fonts and metadata.
- `src/index.css`: Tailwind CSS v4 variables and utility classes.
- `src/components/DesktopLayout.tsx`: Top header, sidebar navigation, dashboard, repositories explorer, code viewer.
- `src/mobile/components/CommitDetailModal.tsx`: Commit detail bottom sheet.
- `src/mobile/screens/repo/CommitsScreen.tsx`: Mobile commit history and filter sheet.
- `src/mobile/screens/Clone.tsx`: 3-card repository cloning flow.
- `src/mobile/layout/MobileShell.tsx` & `MobileHeader.tsx`: Mobile viewport shell.

---

## 5. Architecture Design

```
┌─────────────────────────────────────────────────────────────┐
│                       Global Styling                         │
│  - Fonts: Plus Jakarta Sans + JetBrains Mono                │
│  - Palette: Canvas #0B0F19, Surface 1 #131B2E, S-2 #1C263E  │
│  - Borders: Subtle #212E4A, Accent #31446E                  │
│  - 8-Point Spatial System (4, 8, 12, 16, 24, 32, 44, 56px)   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│        Desktop Layout        ││         Mobile Shell         │
│  - 56px Header (3-Zone)      ││  - 56px Header + Branch Chip │
│  - 260px Sidebar Navigation  ││  - 44px Purpose Sub-Tabs     │
│  - Repositories Explorer     ││  - Commits (List / Graph)    │
│  - Dashboard 4-KPI Strip     ││  - Filter Bottom Sheet       │
│  - Commit Velocity AreaChart ││  - Clone (3 Numbered Cards)  │
│  - Unified Commit Diff View  ││  - 56px BottomNav (5 tabs)   │
└──────────────┬───────────────┘└──────────────┬───────────────┘
               │                              │
               └──────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             Commit Detail Inspection Engine                 │
│  - Verified Badge + Short SHA Copy + Author Meta            │
│  - Quantitative Visual Churn Bar (+7,576 / -18)             │
│  - Tab 1: Overview & Branch Lineage Ancestry Tree           │
│  - Tab 2: Syntax Diff Viewer with File Switcher Chips       │
│  - Tab 3: Multi-Stage CI/CD Pipeline Visualizer             │
│  - Sticky Footer Action Bar (Copy, Branch Here, Cherry Pick)│
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Breakdown & Phases

### Phase 1: Global Font & CSS Spatial Token Normalization
- **Files**: `index.html`, `src/index.css`
- **Actions**:
  - Add Google Fonts link for `Plus Jakarta Sans:wght@400;500;600;700;800` in `index.html`.
  - Update `src/index.css` with the 8-point spatial tokens:
    - `--color-background: #0B0F19`
    - `--color-surface-1: #131B2E`
    - `--color-surface-2: #1C263E`
    - `--color-surface-3: #263454`
    - `--color-border: #212E4A`
    - `--color-border-accent: #31446E`
    - Git semantic variables: `--color-addition: #3FB950`, `--color-deletion: #F85149`, `--color-accent: #58A6FF`.
    - Spacing classes (`.h-8-control`, `.h-8-bar`, etc.) and `.grid-8pt-pattern`.

### Phase 2: Desktop Layout Architecture Alignment
- **Files**: `src/components/DesktopLayout.tsx`
- **Actions**:
  - Top header: 56px height, active branch chip with glowing halo, search command launcher (`⌘K`), 15s live sync indicator, clone and new repo actions.
  - Sidebar: 260px width, 44px navigation items with active indicators.
  - Repositories Explorer: Align split-pane cards, search bar, and language distribution bar to the 8pt grid.
  - Dashboard: Polish the 4-column KPI strip and Velocity AreaChart with the dark workstation palette.

### Phase 3: Commit Detail Inspection Engine Harmonization
- **Files**: `src/mobile/components/CommitDetailModal.tsx`, `src/components/commit/DiffViewer.tsx`
- **Actions**:
  - Ensure the Commit Detail Modal strictly implements all visual features from Attachment 3:
    - Verified pill badge with checkmark.
    - Quantitative churn bar with proportional progress width.
    - Branch Lineage tree with Parent SHA, Current SHA with HEAD tag, and target branch.
    - Syntax diff viewer with line numbers, green `+`, red `-`, and blue `@@`.
    - CI/CD pipeline multi-step visualizer.
    - Footer action bar (Copy SHA, Branch Here, Cherry Pick).

### Phase 4: Verification & Quality Assurance
- **Actions**: Run `lint_applet` and `compile_applet` to confirm 0 errors and complete fidelity.

---

## 7. Desktop Experience
- **Layout**: Full-width workstation canvas ($1440\text{px}$ baseline), single-level card elevation, hairline borders (`border-[#212E4A]`).
- **Typography**: Display titles in Plus Jakarta Sans Bold, telemetry and code in JetBrains Mono with `tabular-nums`.
- **Interactions**: 100–200ms transitions, command palette trigger (`⌘K`), 1-click clone copy.

---

## 8. Tablet & Mobile Experience
- **Touch Ergonomics**: Minimum 44px touch targets on all tabs, buttons, and radio controls.
- **Navigation Rhythm**: 56px sticky top bar, 44px sub-tabs, 56px fixed bottom nav.
- **Bottom Sheets**: Hardware-accelerated slide transitions (`cubic-bezier(0.2, 0.9, 0.25, 1)`), drag grips, and backdrop blur.

---

## 9. Performance & Accessibility
- **Performance**: Zero layout animation; compositor-only transforms for bottom sheets; memoized commit filtering.
- **Accessibility**: WCAG AA color contrast (4.5:1 text), visible focus rings (`focus-visible`), aria labels on all icon buttons, tabular numerals for screen readers.

---

## 10. Execution Checklist
- [ ] 1. Add `Plus Jakarta Sans` Google Font in `index.html`.
- [ ] 2. Update `src/index.css` with 8-point spatial tokens, dark workstation palette (`#0B0F19`, `#131B2E`, `#1C263E`), and `.grid-8pt-pattern`.
- [ ] 3. Refactor `src/components/DesktopLayout.tsx` header, sidebar, dashboard, and repositories view to align with the 8-point spatial system.
- [ ] 4. Polish `src/mobile/components/CommitDetailModal.tsx` to match the verified design blueprint.
- [ ] 5. Run `lint_applet` and `compile_applet`.

---

## 11. Approval Gate
In strict compliance with the Master Engineering Planning & Implementation Protocol:
**STOPPING HERE FOR USER APPROVAL.**
No implementation code will be written or edited until you reply with `Approved`, `Proceed`, or `Implement`.
