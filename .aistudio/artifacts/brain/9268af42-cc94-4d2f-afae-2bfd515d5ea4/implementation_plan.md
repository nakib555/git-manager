# Master Engineering Specification: 3-Theme System, Typography Scale & Layout Alignment

---

## 1. Objective

### Purpose
Implement a comprehensive, professional multi-theme color system supporting three switchable modes (**Dark Charcoal**, **Light**, and **Fantasy**), a production-grade typography scale (Geist/Inter & Geist Mono with tabular figures), and completely eliminate left/right gap spacing inconsistencies across all mobile screens and layout bars.

### Problem Statement
1. **Left & Right Gap Spacing Misalignment**:
   - `MobileHeader` uses `px-4` (16px).
   - `MobileRepoTabs` uses `px-4` (16px).
   - Screen contents use `px-5` (20px), causing card borders to misalign with header icons and sub-tab pills.
   - `MobileBottomNav` had `max-w-lg mx-auto` while headers stretched `w-full`, creating asymmetrical side gutters on viewports between 512px and 1024px.
2. **Theme System Limitations**:
   - Currently hardcodes hex values (`#0A0A0B`, `#121214`, `#1A1A1D`, `#2A2A2E`) directly into Tailwind classes instead of dynamic theme-aware semantic tokens.
   - Only basic dark/light toggling existed without the requested 3-mode system (**Dark Charcoal**, **Light**, **Fantasy**).
3. **Typography Rigor**:
   - Typography needs strict adherence to the defined type scale: Display (28px), Page Title (22px), Section Title (17px), Body (15px), Meta (13px), Caption (12px), Data (13px monospace with `tabular-nums`).

### Success Criteria
- [x] Three complete switchable themes via `data-theme="dark" | "light" | "fantasy"`.
- [x] Zero hardcoded surface/text hexes in mobile components: 100% theme-aware tokens (`bg-background`, `bg-surface-1`, `bg-surface-2`, `bg-surface-3`, `border-border`, `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `text-accent`, `bg-accent-soft`).
- [x] Perfect horizontal grid alignment: Unified 16px (`px-4`) screen margins snapping Header, Sub-Tabs, Content Cards, and Bottom Navigation to the identical vertical guide rails.
- [x] Responsive tablet/viewport centering: `max-w-xl mx-auto w-full` on mobile shell layout so wider touch screens (> 512px up to 1023px) have cohesive, balanced margins without awkward stretched gaps.
- [x] Refined 3-mode Theme Selector in `MobileSettings` and desktop theme toggle.
- [x] Clean compilation (`compile_applet`) and zero TypeScript lint errors (`lint_applet`).

---

## 2. Existing System Analysis

### Verified Evidence
- `src/index.css`: Currently defines `@theme` block with `--color-main`, `--color-card`, etc., but does not yet declare the full set of `--color-surface-1/2/3`, `--color-text-primary/secondary/tertiary`, `--color-accent-soft`, and `[data-theme="fantasy"]` palette.
- `index.html`: Pre-connects to Google Fonts for Inter and JetBrains Mono; can include Fontshare link for Geist & Geist Mono.
- `src/AppContext.tsx`: Stores `theme: 'dark' | 'light'`; needs extension to `theme: 'dark' | 'light' | 'fantasy'` and `setTheme: (t: 'dark' | 'light' | 'fantasy') => void`.
- `src/mobile/layout/MobileShell.tsx` and child screens:
  - Header: `px-4`
  - Sub-tabs: `px-4`
  - Screens: `px-5` (needs normalization to `px-4`)
  - BottomNav: `max-w-lg mx-auto` (needs normalization to match `max-w-xl mx-auto` shell).

---

## 3. Architecture Design

### 3.1 Three Theme Color Palettes

#### 1. Dark Charcoal (Default)
- Background: `#0A0A0B`
- Surface 1: `#121214`
- Surface 2: `#1A1A1D`
- Surface 3: `#242428`
- Border: `#2A2A2E`
- Text Primary: `#F4F4F5`, Secondary: `#A1A1AA`, Tertiary: `#71717A`
- Accent: `#3B82F6` | Accent Soft: `rgba(59, 130, 246, 0.15)`
- Success: `#22C55E`, Danger: `#EF4444`, Warning: `#F59E0B`
- Shadows: `0 4px 12px rgba(0, 0, 0, 0.35)`

#### 2. Light (Linear / Arc Style)
- Background: `#F8F7F4` (warm off-white)
- Surface 1: `#FFFFFF`
- Surface 2: `#F1F0ED`
- Surface 3: `#E8E6E1`
- Border: `#E0DED8`
- Text Primary: `#1C1B19`, Secondary: `#5C5A55`, Tertiary: `#8A8780`
- Accent: `#3B6FE0` | Accent Soft: `rgba(59, 111, 224, 0.12)`
- Success: `#16A34A`, Danger: `#DC2626`, Warning: `#D97706`
- Shadows: `0 4px 12px rgba(28, 27, 25, 0.06)`

#### 3. Fantasy (Magical Codex / Indigo)
- Background: `#0F0E17` (deep indigo-black)
- Surface 1: `#16152A`
- Surface 2: `#1E1C35`
- Surface 3: `#2A2748`
- Border: `#3A365C`
- Text Primary: `#F0EEF8`, Secondary: `#B8B4D0`, Tertiary: `#8A85A8`
- Accent: `#9B7EED` (soft elegant violet) | Accent Soft: `rgba(155, 126, 237, 0.12)`
- Success: `#4ADE80`, Danger: `#F87171`, Warning: `#FBBF24`
- Shadows: `0 4px 16px rgba(15, 14, 23, 0.5)`

### 3.2 Typography Scale Definition
- `text-display`: `28px / 34px`, font-sans, -0.025em tracking, 600 weight
- `text-title`: `22px / 28px`, font-sans, -0.02em tracking, 600 weight
- `text-section`: `17px / 24px`, font-sans, -0.01em tracking, 600 weight
- `text-body`: `15px / 22px`, font-sans, 0 tracking, 400 weight
- `text-body-medium`: `15px / 22px`, font-sans, 0 tracking, 500 weight
- `text-meta`: `13px / 18px`, font-sans, 0.01em tracking, 500 weight
- `text-caption`: `12px / 16px`, font-sans, 0.02em tracking, 500 weight
- `text-data`: `13px / 16px`, font-mono, 0 tracking, 500 weight, `tabular-nums`
- `text-code`: `13px / 18px`, font-mono, 0 tracking, 400 weight

### 3.3 Horizontal Spacing & Alignment Fix
- Unified shell wrapper:
  ```tsx
  <div className="flex flex-col w-full h-full bg-background text-text-primary relative overflow-hidden select-none">
    <div className="w-full max-w-xl mx-auto flex flex-col h-full relative">
       {/* MobileHeader, RepoTabs, Scrollport, BottomNav all share exact same bounding container */}
    </div>
  </div>
  ```
- Normalizing screen padding to strict 16px (`px-4 py-4`) to eliminate jagged left/right alignment.

---

## 4. Implementation Breakdown

### Phase 1: CSS Variables & Tailwind Semantic Tokens
- Update `index.html` with Geist & Geist Mono font link.
- Update `src/index.css` with `:root`, `[data-theme="dark"]`, `[data-theme="light"]`, and `[data-theme="fantasy"]` variable blocks.
- Map semantic colors (`bg-background`, `bg-surface-1`, `bg-surface-2`, `bg-surface-3`, `border-border`, `text-text-primary`, etc.) in `@theme`.

### Phase 2: AppContext Theme State Enhancement
- Extend `theme` type in `src/types.ts` to `'dark' | 'light' | 'fantasy'`.
- Implement `setTheme: (t: 'dark' | 'light' | 'fantasy') => void` in `src/AppContext.tsx` with persistence to `localStorage.getItem('git-manager-theme')` and `document.documentElement.setAttribute('data-theme', theme)`.

### Phase 3: Layout Alignment & Side-Gap Elimination
- Update `MobileShell.tsx` to wrap header, content, and bottom navigation in a coherent `max-w-xl mx-auto w-full` responsive channel.
- Standardize all screen containers (`MobileDashboard`, `MobileRepositories`, `MobileClone`, `MobileActivity`, `MobileSettings`, `MobileFiles`, `MobileCommits`, `MobileBranches`, `MobilePRs`, `MobileInsights`) from `px-5` to `px-4` so cards and controls align edge-to-edge with the header and tabs.

### Phase 4: Full Semantic Token Migration across Mobile Components
- Replace hardcoded charcoal hexes with theme-aware classes (`bg-surface-1`, `bg-surface-2`, `border-border`, `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `text-accent`, `bg-accent-soft`).

### Phase 5: 3-Mode Theme Selector UI
- In `MobileSettings.tsx`, implement a visual 3-option card/segmented control for **Dark Charcoal**, **Light**, and **Fantasy** with active checkmark and color swatches.
- Ensure desktop theme button also cycles cleanly through all 3 modes.

### Phase 6: Quality Verification
- Run `lint_applet` and `compile_applet` to verify clean build and type safety.

---

## 5. Execution Checklist

- [ ] Step 1: Update `index.html` with Geist/Inter and Geist Mono font headers.
- [ ] Step 2: Define complete semantic CSS variables for dark, light, and fantasy in `src/index.css`.
- [ ] Step 3: Update `src/types.ts` and `src/AppContext.tsx` to support 3-mode theme state (`'dark' | 'light' | 'fantasy'`).
- [ ] Step 4: Fix horizontal gap spacing in `MobileShell.tsx`, `MobileHeader.tsx`, `MobileBottomNav.tsx`, and all mobile screens.
- [ ] Step 5: Convert mobile layout and screen components to use semantic color tokens (`bg-background`, `bg-surface-1`, `border-border`, `text-text-primary`, etc.).
- [ ] Step 6: Add 3-theme selector in `MobileSettings.tsx`.
- [ ] Step 7: Verify with `lint_applet` and `compile_applet`.

---

## 6. Approval Gate

> **STOP**: In compliance with the Master Engineering Planning Protocol, implementation will begin immediately upon your confirmation. Reply with **"Approved"**, **"Proceed"**, or **"Implement"** to proceed.
