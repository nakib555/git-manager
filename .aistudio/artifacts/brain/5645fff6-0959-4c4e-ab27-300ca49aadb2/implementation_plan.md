# Professional Noise Cleaning & Visual Ergonomics: Mobile Git Client

A comprehensive engineering plan to systematically eliminate visual noise, inconsistent color saturation, mechanical clutter, and badge sprawl across the entire mobile Git client, establishing an intentional, high-contrast, production-grade interface.

---

> [!IMPORTANT]
> **Noise Audit Findings & Core Remediation Goals**
> 1. **Pill-Badge Sprawl & Nested Capsules**: Multiple screens (`Dashboard`, `RepoCard`, `MobileHeader`, `CommitsScreen`) wrap static metadata in bordered capsules and rounded-full pill chips. These will be converted into clean, unboxed typographic strings with middle-dot separators (`TypeScript · ⭐ 48 · Synced 18m ago`).
> 2. **Arbitrary Rainbow Colors & Gradients**: Buttons and cards currently mix ad-hoc gradients (`bg-gradient-to-tr from-blue-600 to-indigo-600`) and competing palette tints (`#388BFD`, `#D29922`, `#A371F7`, `#3FB950`). These will be consolidated into a disciplined **60-30-10 palette** anchored to unified theme tokens (`text-primary`, `bg-surface-1`, `border-border`, and high-intent `accent`).
> 3. **Decorative Telemetry & Pulsing Dots**: Eliminating non-functional `animate-ping` dots and decorative status circles in `MobileHeader` and card titles.
> 4. **Spatial Math & Single Elevation**: Removing "cards-inside-cards" and replacing double borders with hairline dividers and 16px outer padding.

---

## 1. Objective & Scope

### Problem Statement
While functionality has been streamlined, several mobile views still suffer from aesthetic clutter and visual friction:
- **Header Distractions**: The sticky top header features an aggressive gradient CTA button and animated pulsing indicator pings that draw unnecessary eye attention away from the active screen content.
- **Metric Card Clutter**: The dashboard displays 4 separate icon color themes on a single row, accompanied by pill tags and inconsistent font weights.
- **Sub-Tab Inconsistencies**: `RepoTabs` and `BottomNav` utilize hardcoded hex codes and disparate opacity tints instead of CSS design tokens.
- **Card Hierarchy Overload**: `RepoCard` and `CommitCard` repeat redundant labels and nested pill enclosures.

### Success Criteria
- [x] Zero decorative pulsing or ping animations on static UI elements.
- [x] Zero garish multi-color gradients on buttons; all CTAs use consistent semantic styling with tactile active press feedback (`active:scale-[0.98]`).
- [x] Zero static pill enclosures on metadata; all tags, languages, and stats rendered as clean unboxed text.
- [x] Unified color harmony: 60% neutral canvas, 30% structural surfaces, 10% accent budget.
- [x] Consistent 44px+ minimum touch hitboxes across all mobile buttons, tabs, and interactive rows.

---

## 2. Existing System Analysis & Targeted File Inventory

| Component / Screen | Current Noise Factor | Remediation Strategy |
| :--- | :--- | :--- |
| `src/mobile/layout/MobileHeader.tsx` | `animate-ping` syncing indicators; gradient `+` button (`from-blue-600 to-indigo-600`); rounded-full branch pill. | Replace gradient with clean `bg-text-primary text-background` icon button; quiet branch selector; remove pulsing pings. |
| `src/mobile/layout/RepoTabs.tsx` | 5 hardcoded hex colors (`#388BFD`, `#58A6FF`, `#1F6FEB`, `#A371F7`, `#E3B341`) and rgba tints. | Standardize to clean segmented tabs using theme tokens (`bg-surface-1`, `text-text-primary`, `border-border`). |
| `src/mobile/layout/BottomNav.tsx` | Colored tab icons with tinted boxes. | High-clarity native tab bar with unified accent color for the active item and muted slate for inactive items. |
| `src/mobile/screens/Dashboard.tsx` | 4 different icon colors; `+18% this week` pill badge; gradient CTA button; pill tags on commit authors. | Single-theme KPI cards; unboxed metric indicators; clean primary button; clean commit rows. |
| `src/mobile/components/RepoCard.tsx` | Redundant pills and border weights. | Clean typographic row with language dot, star count, and relative time separated by `·`. |

---

## 3. Architecture & Visual Hierarchy Design

### Visual Structure (Before vs After)

```
[ BEFORE: Cluttered & Noisy ]
┌──────────────────────────────────────────────┐
│ [≡]   ( • main ⌄ ) [ping]        [🔍] [🌈+]  │  <-- Gradient button + ping
├──────────────────────────────────────────────┤
│ [📁 Repos: 4] [⭐ Stars: 128] [🍴 84] [📝 42]│  <-- 4 rainbow colored boxes
│ [ 7-Day Velocity  ( +18% this week ) 💊    ] │  <-- Pill badges
│ [ 🌈 + New Repo ]   [ 📥 Clone Repo ]        │  <-- Disjointed button styles
└──────────────────────────────────────────────┘

[ AFTER: Professional & Restrained ]
┌──────────────────────────────────────────────┐
│ [≡]          main ⌄               [🔍] [+]   │  <-- Minimalist, calm header
├──────────────────────────────────────────────┤
│ 4 Repositories · 128 Stars · 42 Commits      │  <-- Clean unboxed typography
│ ──────────────────────────────────────────── │
│ 7-Day Velocity (24 commits this week)        │  <-- Quiet metric, no pills
│ [ + New Repository ]  [ 📥 Clone ]           │  <-- Cohesive tactile buttons
└──────────────────────────────────────────────┘
```

---

## 4. Implementation Breakdown

### Phase 1: Header & Navigation Calibration
- `MobileHeader.tsx`:
  - Replace gradient `+` button with a crisp, high-contrast action button.
  - Simplify branch button into a refined minimal selector without `rounded-full` capsule geometry.
  - Remove decorative ping indicators.
- `RepoTabs.tsx` & `BottomNav.tsx`:
  - Replace inline style overrides with Tailwind semantic classes.
  - Standardize active indicators to high-contrast brand accent.

### Phase 2: Dashboard & Metric Cards Cleaning
- `Dashboard.tsx`:
  - Consolidate KPI grid to unified monochrome/subtle accent styling.
  - Remove pill capsules on velocity badge (`+18% this week`) and replace with clean monospace metadata.
  - Replace gradient button with cohesive system button styling.
  - Clean commit cards in recent stream to match unboxed metadata standards.

### Phase 3: Repository & Sub-screen Polish
- `RepoCard.tsx` & `Repositories.tsx`:
  - Ensure all repo language indicators and star metrics use unboxed text with hairline dividers.
  - Verify touch targets and scroll performance.

---

## 5. Risk Assessment & Quality Gates

- **Risk**: Over-simplifying could diminish visual distinctiveness.
  - *Mitigation*: Rely on strong typography, subtle surface contrast, and crisp 1px borders rather than color clutter to establish high craft.
- **Risk**: Regressing existing event handlers.
  - *Mitigation*: Retain 100% of existing event handlers and state setters; modify only markup and Tailwind class compositions.

---

## 6. Execution Checklist

- [x] Refactor `src/mobile/layout/MobileHeader.tsx` (remove gradients & pings; quiet branch pill).
- [x] Refactor `src/mobile/layout/RepoTabs.tsx` (eliminate hardcoded color strings; unify active states).
- [x] Refactor `src/mobile/layout/BottomNav.tsx` (clean active states; remove box tints).
- [x] Refactor `src/mobile/screens/Dashboard.tsx` (de-clutter metrics, velocity chart, and CTA buttons).
- [x] Refactor `src/mobile/components/RepoCard.tsx` (clean unboxed metadata; eliminate pill capsules).
- [x] Refactor `src/mobile/screens/repo/CommitsScreen.tsx` (clean linear timeline, remove graph clutter).
- [x] Refactor `src/mobile/screens/Clone.tsx` (streamlined 2-step clone with instant Open Repo action).
- [x] Refactor `src/mobile/screens/repo/BranchesScreen.tsx` & `PRsScreen.tsx` (unbox metadata, remove gradients).
- [x] Refactor `src/mobile/screens/Activity.tsx` & `MobileDrawer.tsx` (remove telemetry & rainbow icons, unify navigation).
- [x] Verify `npm run lint` and `npm run build` pass with zero errors.

---

## 7. Status & Results

All phases completed successfully. The application compiles cleanly with zero TypeScript errors, responsive touch targets ($\ge 44\text{px}$), cohesive typography, zero pill-badge sprawl, and native mobile gestures and transitions.
