# Architecture Specification: Professional & Intentional Visual System Redesign

## Complexity Classification: Level 4 (Architecture & Design System Redesign)

---

## 1. Verified Facts, Assumptions, and Missing Information

### Verified Facts
1. **Current Color Tokens & Themes (`src/index.css`)**:
   - `[data-theme="dark"]` uses `--color-accent: #3B82F6` (neon/pure blue, explicitly forbidden) and `--primary-hover: #2563EB`.
   - `[data-theme="light"]` uses `--color-accent: #3B6FE0` (pure bright blue).
   - `[data-theme="fantasy"]` uses `--color-accent: #9B7EED` (purple/violet accent as primary brand, explicitly forbidden).
   - Legacy variables `--primary`, `--accent`, `--info` are tied directly to `#3B82F6`.
2. **Glassmorphism & Neon Glow Usage**:
   - Multiple mobile and desktop layouts rely on `backdrop-blur-md`, `backdrop-blur-lg`, `backdrop-blur-sm`, and `backdrop-blur-xs` (e.g. `src/mobile/layout/MobileHeader.tsx`, `src/mobile/layout/BottomNav.tsx`, `src/components/DesktopLayout.tsx`, `src/components/UI.tsx`, `src/screens/CloneScreen.tsx`).
   - Neon glow shadows exist (e.g., `shadow-[#3B82F6]/10`, `shadow-lg`, glowing ping animations).
3. **Pill & Shape Inconsistencies**:
   - Badges, status indicators, and buttons widely use `rounded-full` (e.g., filter chips, PR status badges, repository tags, toast notification capsules).
   - Inconsistent border radius mixes high radius (16px–24px) with pills.
4. **Typography & Font Weight Inconsistencies**:
   - Arbitrary use of `font-extrabold` (800) alongside unstyled text without clear typographic scale.
5. **Component Surface Styling**:
   - `src/components/DesktopLayout.tsx`, `src/components/UI.tsx`, `src/components/CreateModals.tsx`, `src/mobile/screens/repo/*`, `src/screens/repodetails/*` contain hardcoded `#3B82F6`, `bg-purple-500`, `text-blue-500`, and `backdrop-blur`.

### Assumptions
- The application must maintain its full Git manager capabilities (desktop multi-pane workbench and mobile viewports) while transforming into an intentional, calm, tool-like developer instrument (akin to Linear, Xcode, JetBrains, or Sublime Merge).
- All 3 theme variants should be updated to professional developer palettes (e.g., Calibrated Charcoal, Warm Paper/Architectural Gray, and Deep Graphite/Slate), completely eliminating all neon blues and purple brand accents.

### Missing Information
- None. Complete codebase audit across styling tokens, layout wrappers, and individual components has been verified via source exploration.

---

## 2. Objective

- **Purpose**: Completely eliminate all generic "AI-generated" visual artifacts (neon blue accents, glowing drop shadows, glassmorphism blur, purple brand accents, over-rounded pills, arbitrary weights) and replace them with a cohesive, calm, highly refined design system engineered for focused developer productivity.
- **Problem**: 
  - Visual system features pure blues (`#3B82F6`, `#2563EB`), purple brand accents, and translucent blurred surfaces that convey generic AI prototype aesthetics rather than a serious developer utility.
  - Inconsistent radii and lack of strict border/elevation rules undermine hierarchy and trust.
- **Success Criteria**:
  - Zero instances of pure/neon blue (`#3B82F6`, `#2563EB`, `#0EA5E9`, `#06B6D4`) and primary purple/violet brand accents.
  - Zero glassmorphism (`backdrop-blur-*`); all surfaces use solid, crisp 1px borders with calm, neutral elevation.
  - Restrained desaturated accent system (calm slate blue-gray) with high legibility.
  - Strict typography scale with consistent 400 / 500 / 600 weight usage and monospace for code/SHA/data.
  - Strict 8-point spatial rhythm with moderate border radii (4–6px badges, 6–8px buttons, 8–12px cards/modals; no decorative pill capsules).
  - Clean validation passing across TypeScript, build, and responsive checks.
- **Non-Goals**:
  - Altering underlying Git logic, commit data models, or state management contracts.

---

## 3. Existing System Analysis

### Core Surfaces & Tokens
- **`src/index.css`**: Defines CSS variables in `@theme` and `:root`. Currently exports neon blue values and glowing shadow declarations. Needs total token redesign.
- **`src/mobile/screens/Settings.tsx` & `src/AppContext.tsx`**: Theme definitions include "Deep Indigo" with `#9B7EED`. Needs refactoring to "Slate Graphite" or "Deep Obsidian" with restrained desaturated slate styling.
- **`src/components/DesktopLayout.tsx`**: Desktop shell containing header, breadcrumbs, sidebar, commits list, diff viewer, insights chart, and modal dialogues. Heavy use of hardcoded colors and pills.
- **`src/components/UI.tsx` & `src/mobile/components/*`**: Action sheets, drawers, modals, toasts using `backdrop-blur-*`, glowing borders, and rounded pills.
- **`src/components/CreateModals.tsx`**: Contains `purple-500` actions and modals.
- **`src/mobile/screens/repo/InsightsScreen.tsx`**: Chart lines hardcoded to `#3B82F6` and neon gradients.

---

## 4. Architecture Design

### 4.1 Restrained Color System
```
┌────────────────────────────────────────────────────────────────────────┐
│                        COLOR SYSTEM TOKENS                             │
├───────────────────┬────────────────────────────┬───────────────────────┤
│ Role              │ Dark (Charcoal Obsidian)   │ Light (Warm Linen)    │
├───────────────────┼────────────────────────────┼───────────────────────┤
│ Background        │ #111215 (calm off-black)   │ #F7F7F5 (warm off-white)│
│ Surface 1 (Base)  │ #18191D (cards, panels)    │ #FFFFFF (solid card)  │
│ Surface 2 (Hover) │ #202227 (subtle elevation) │ #EFEFED (hover/alt)   │
│ Surface 3 (Active)│ #282A31 (modals, dropdowns)│ #E5E5E2 (active state)│
│ Border            │ #2A2C35 (calm 1px border)  │ #DEDDD8 (calm 1px)    │
│ Border Subtle     │ #202228                    │ #E8E7E2               │
│ Text Primary      │ #ECECF1 (high contrast)    │ #1C1D21 (deep slate)  │
│ Text Secondary    │ #9898A2 (subdued)          │ #5C5E67 (neutral)     │
│ Text Tertiary     │ #686973 (metadata/dim)     │ #8A8D96 (muted)       │
│ Accent (Brand)    │ #5E7896 (slate blue-gray)  │ #3E5670 (deep slate)  │
│ Accent Soft       │ rgba(94, 120, 150, 0.12)   │ rgba(62, 86, 112, 0.08)│
│ Success           │ #3E7E55 (subdued sage)     │ #286840 (deep foliage)│
│ Danger            │ #A24B49 (brick crimson)    │ #933836 (oxide red)   │
│ Warning           │ #9C7436 (amber ochre)      │ #875F25 (raw umber)   │
└───────────────────┴────────────────────────────┴───────────────────────┘
```

### 4.2 Surfaces, Elevation & Borders
- **Elimination of Glassmorphism**: Remove all `backdrop-blur-*`. Modal scrims use solid dimming (`bg-black/60` or `bg-black/70`) without synthetic blur.
- **Subtle 1px Borders**: Depth is established via tone layering (Surface 1 on Background) bounded by crisp 1px borders (`border border-border`), avoiding heavy or colored drop shadows.
- **Low Elevation**: Drop shadows are strictly neutral:
  - Small: `0 1px 2px rgba(0, 0, 0, 0.15)`
  - Medium: `0 4px 12px rgba(0, 0, 0, 0.25)`

### 4.3 Typography Scale & Font Weights
- **Font Stack**: Geist / Inter / system font with strict weights:
  - 400 (Regular): Body, descriptions, file paths.
  - 500 (Medium): Interactive labels, buttons, navigation tabs, section headers.
  - 600 (Semibold): Page titles, branch selectors, modal headers.
- **Elimination of Arbitrary `font-extrabold` (800)**: Replace all harsh bold text with balanced 500/600 semibold weights.
- **Monospace Discipline**: Monospace (`Geist Mono`, `JetBrains Mono`, `ui-monospace`) reserved exclusively for commit hashes, branch refs, diff line numbers, and file paths.

### 4.4 Spatial Grid & Shape Hierarchy
- **Strict 8-Point Grid**: Padding and margin conform to 4px, 8px, 12px, 16px, 24px, 32px.
- **Border Radius Hierarchy**:
  - Badges / Status tags: `rounded-md` (4px – 6px) — zero pill shapes.
  - Buttons & Inputs: `rounded-md` (6px) or `rounded-lg` (8px).
  - Cards, Lists & Modals: `rounded-lg` (8px) or `rounded-xl` (12px).
  - User Avatars: Standard circular `rounded-full` (functional exception).

---

## 5. Implementation Breakdown

### Phase 1: Global Theme & Token Redesign (`src/index.css`, `src/types.ts`, `src/AppContext.tsx`)
- Rewrite CSS custom properties in `src/index.css`.
- Replace bright `#3B82F6` and `#9B7EED` with calibrated slate blue-gray `#5E7896` / `#3E5670`.
- Replace "fantasy" theme with "slate" (Deep Slate Graphite) across types, context, and storage.
- Remove all neon gradient keyframes and colored shadow variables.

### Phase 2: Core Desktop Surfaces (`src/components/DesktopLayout.tsx`, `src/components/CommandPalette.tsx`, `src/components/CloneModal.tsx`)
- Replace `backdrop-blur-md` in desktop header with solid `bg-card` and clean border.
- Replace pill badges (`rounded-full`) in repository headers, language tags, and status chips with structured `rounded-md` tags.
- Update Insights chart gradients and colors to calm slate `#5E7896` and muted sage `#3E7E55`.
- Eliminate all `text-blue-500`, `bg-[#388BFD]`, and glowing pulse animations.

### Phase 3: Modals, Toasts & Interaction Components (`src/components/UI.tsx`, `src/components/CreateModals.tsx`, `src/components/commit/DiffViewer.tsx`)
- Remove all `backdrop-blur-*` from modal overlays, action sheets, and drawers.
- Replace `purple-500` buttons and badges with the unified slate accent token.
- Replace pill toast capsules (`rounded-full`) with crisp `rounded-lg` floating notifications with solid neutral backgrounds and 1px border.
- Clean DiffViewer syntax colors to avoid harsh neon tones (`#0EA5E9` -> calm slate).

### Phase 4: Mobile Experience Redesign (`src/mobile/**`)
- `MobileHeader` & `BottomNav`: Replace translucent blur with solid `bg-surface-1` or `bg-background` and 1px border.
- `Settings.tsx`: Update theme cards to display Charcoal, Warm Linen, and Deep Slate with authentic hex swatches and descriptions.
- `CommitsScreen.tsx`, `PRsScreen.tsx`, `FilesScreen.tsx`, `InsightsScreen.tsx`: Replace all `purple-500`, neon blues, pills, and blurred sheets with the new visual standard.

### Phase 5: Verification & Quality Validation
- Verify zero occurrences of forbidden colors, glassmorphism, and arbitrary pill shapes.
- Run `compile_applet` and `lint_applet`.
- Verify light, dark, and slate themes across desktop, tablet, and mobile viewport sizes.

---

## 6. Desktop Experience
- **Layout**: Clean tool workbench with solid panes, crisp 1px division borders, and unified gray palette.
- **Navigation**: Restrained tabs and breadcrumbs with subtle hover transitions (no flashy glows).
- **Typography**: Crisp typographic hierarchy with tabular figures for commits and line numbers.
- **Empty & Loading States**: Minimalist skeleton loaders with subtle neutral shimmer (no neon or bouncy animations).

---

## 7. Tablet Experience
- **Layout**: Adaptive 2-column or collapsible navigation with touch-friendly 40px controls.
- **Surfaces**: Solid drawer and modal backdrops with crisp borders for high ambient light readability.
- **Orientation**: Fluid transitions between landscape multi-pane and portrait stacked workbench.

---

## 8. Mobile Experience
- **Header & Navigation**: Fixed header and bottom navigation using solid `bg-surface-1` with 1px border, adhering to safe-area insets (`env(safe-area-inset-top)` / `bottom`).
- **Sheets & Modals**: Solid slide-up sheets with clear handle indicator, 12px top radius, and solid dimming scrim (no glass blur).
- **Touch Targets**: Standard 44px touch targets on buttons and filters; no cramped or floating pills.

---

## 9. User Experience
- **Feeling**: Calm, precise, reliable, native, and tool-like (reminiscent of high-end developer software like Linear, Xcode, and JetBrains).
- **Clarity**: High contrast where required for reading code and diffs, while chrome and toolbars remain subordinate.
- **States**: Predictable active, hover, focused, and disabled states across all buttons and inputs.

---

## 10. Performance
- **GPU Efficiency**: Removing all `backdrop-blur-*` filters significantly reduces GPU composite workload and scrolling frame drops on mobile devices.
- **CSS Bundle**: Simplified token mapping removes redundant animation keyframes and bloated gradient utilities.

---

## 11. Accessibility (WCAG 2.1 AA)
- **Contrast**: Text primary maintains > 7:1 contrast on both dark (#ECECF1 on #111215) and light (#1C1D21 on #F7F7F5) surfaces. Secondary text maintains > 4.5:1.
- **Focus Rings**: High-contrast, non-blurry 2px solid focus rings (`focus-visible:ring-2 focus-visible:ring-accent/50`).
- **Reduced Motion**: All animations respect `prefers-reduced-motion: reduce`.

---

## 12. Security
- Pure visual presentation refactoring; no new network egress, external scripts, or storage alteration. No XSS or injection vectors introduced.

---

## 13. Compatibility Analysis
- **Theme Persistence**: Preserves `localStorage.getItem("theme")` compatibility with smooth fallback to 'dark' or 'slate'.
- **Tailwind v4 Compatibility**: Tokens mapped seamlessly into `@theme` in `src/index.css`.

---

## 14. Risks & Mitigations
- **Risk**: Missing an edge component with hardcoded hex colors.
  - *Mitigation*: Comprehensive regex audits across entire `src/` directory for `#3B82F6`, `#2563EB`, `#0EA5E9`, `purple-500`, and `backdrop-blur`.
- **Risk**: Contrast regression on light theme.
  - *Mitigation*: Manually verify token contrast values against WCAG AA standards.

---

## 15. Testing Strategy
- **Visual Inspection**: Audit every screen (Repositories, Commits, Pull Requests, Files, Branches, Insights, Settings, Modals) in Dark, Light, and Slate modes.
- **Static Verification**: Automated codebase search confirming 0 occurrences of forbidden patterns.
- **Compilation**: Full TypeScript build test (`npm run build` / `compile_applet`).

---

## 16. Deployment Strategy
- Staged atomic edits: tokens -> core desktop shell -> modals/UI -> mobile screens -> verification.
- Zero downtime; no schema or database migrations required.

---

## 17. Documentation
- Document the new color tokens, elevation rules, and typography scale in the codebase.

---

## 18. Execution Checklist
- [x] 1. Update `src/index.css` with redesigned restrained color system, neutral shadows, zero neon, and remove glassmorphism.
- [x] 2. Update theme identifiers and metadata in `src/types.ts`, `src/AppContext.tsx`, and `src/mobile/screens/Settings.tsx`.
- [x] 3. Update `src/components/DesktopLayout.tsx` to eliminate neon blues, pills, and `backdrop-blur`.
- [x] 4. Update `src/components/UI.tsx` and `src/components/CreateModals.tsx` to remove glassmorphism, glowing shadows, and purple brand accents.
- [x] 5. Update `src/components/CommandPalette.tsx`, `src/components/CloneModal.tsx`, and `src/components/commit/DiffViewer.tsx`.
- [x] 6. Update `src/mobile/layout/MobileHeader.tsx` and `src/mobile/layout/BottomNav.tsx`.
- [x] 7. Update `src/mobile/screens/repo/InsightsScreen.tsx`, `PRsScreen.tsx`, `FilesScreen.tsx`, and `CommitsScreen.tsx`.
- [x] 8. Verify entire repository has 0 instances of forbidden colors and glassmorphism.
- [x] 9. Run `compile_applet` and verify successful compilation.

---

## 19. Quality Gates
- [x] Architecture designed with evidence-based tokens.
- [x] All forbidden patterns identified and eliminated.
- [x] Zero instances of pure/neon blue (#3B82F6, #2563EB, #0EA5E9, #06B6D4) and purple brand colors.
- [x] Zero instances of backdrop-blur (all surfaces solid with subtle 1px borders).
- [x] WCAG AA contrast rules satisfied across all 3 themes (Dark Charcoal, Warm Linen, Deep Slate).
- [x] TypeScript compilation and production build verified with 0 errors.

---

## 20. Implementation Status: Complete & Verified
All architectural requirements have been implemented and verified. The interface now delivers a calm, intentional, professional developer-grade experience across desktop and mobile.
