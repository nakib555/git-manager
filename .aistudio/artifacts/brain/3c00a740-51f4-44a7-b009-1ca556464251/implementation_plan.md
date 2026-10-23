# Existing Repositories Animated Browser & Mode Transition Specification

## Objective

### Purpose
Introduce an animated, dual-mode intake workflow to the Clone & Download interface:
1. **Split Mode Toggle**: Allow developers to toggle seamlessly between **"Browse Existing Repositories"** and **"Enter Link / Custom URL"**.
2. **Animated Transition List**: Present existing repositories (both already cloned on the local device and available in the user's GitHub account) in an interactive card list with fluid layout transitions.
3. **Rich Metadata on Cards**: Each repository card clearly displays its **On-Device Status Badge**, **Last Synced Timestamp**, primary language, stars, and quick-action trigger buttons (**Select & Configure**, **Direct Sync**, **Export ZIP**, and **Explore Tree**).
4. **Smooth Slide Transition**: Tapping any repository smoothly slides into the pre-filled Clone, Sync, and Download tabbed action view with zero manual link typing.

### Problem
Users previously had to copy/paste repository URLs manually or rely on a horizontal carousel with minimal metadata. Tapping an existing repository was not intuitive, and switching between a global link workflow and an existing repository management workflow lacked clear spatial transitions and status visibility.

### Business & Technical Value
- **Zero-Friction Intake**: Developers can manage, sync, or download existing projects with one tap without copying URLs.
- **Immediate Device Visibility**: Instant visual distinction between repositories saved locally on device versus cloud-only repositories.
- **Fluid Motion Architecture**: High-fidelity motion transitions between list browsing and action configuration adhering to the 8-point spatial grid system.

### Acceptance Criteria
- [x] Top split toggle between **"Browse Existing Repos"** and **"Enter Link / URL"** with smooth animated indicator pill.
- [x] Search and filter bar for the existing repository list (Filter by All, On Device, Cloud Only).
- [x] Fluid transition animation (`motion.div` slide and fade) when selecting a repository to populate the 3-tab configuration engine.
- [x] Each card displays: Title, description, language dot, on-device indicator badge with last synced time, and direct quick action shortcuts.
- [x] "Back to Repositories" button when in action view to return to the list effortlessly.
- [x] Strict adherence to 8-point spatial tokens, WCAG AA contrast, and zero layout shift.

---

## Verified Facts & System Analysis

### Verified Facts
1. `src/mobile/screens/Clone.tsx` and `src/components/CloneModal.tsx` currently host the 3-tab engine (**Clone & Sync**, **Export Archive**, and **Selective Download**).
2. `src/mobile/utils/deviceSync.ts` provides `getDeviceSyncedRepos()`, `checkDeviceRepoExists()`, and `syncDeviceRepo()`.
3. `useAppContext()` provides `githubRepos`, `githubUser`, `recentClones`, `currentRepo`, and `showToast`.
4. `motion/react` is installed and available for fluid shared-layout transitions and directional slide animations.

---

## Complexity Classification
**Level 2: Small/Medium Feature**
Enhances the Clone screen and modal with a dual-mode segmented switcher, animated repository list view, filtering, and smooth slide transitions into the pre-configured action tabs.

---

## Architecture Design

### ASCII Component & Transition Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLONE & DOWNLOAD SUITE                          │
├────────────────────────────────────────────────────────────────────────┤
│ MODE SWITCHER (Segmented Pill):                                        │
│  [ (●) Browse Existing Repos (8) ]   [ ( ) Enter Custom Link ]         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ MODE A: BROWSE EXISTING REPOSITORIES                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [🔍 Search repos by name or language...]   [All | On Device (3)]  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ ┌──────────────────────────────────────────────────────────────┐ │  │
│  │ │ 📦 git-manager                          [● ON DEVICE]        │ │  │
│  │ │ TypeScript · ⭐ 142 · Synced 18m ago                        │ │  │
│  │ │ Local: /Documents/Projects/git-manager                       │ │  │
│  │ │ [ Sync Now ]  [ Export ZIP ]  [ Configure & Select ──> ]     │ │  │
│  │ └──────────────────────────────────────────────────────────────┘ │  │
│  │ ┌──────────────────────────────────────────────────────────────┐ │  │
│  │ │ 📦 hyper-term                           [Cloud Only]         │ │  │
│  │ │ Rust · ⭐ 89 · Remote origin                                  │ │  │
│  │ │ [ Clone to Device ]  [ Export ZIP ]  [ Configure ──> ]       │ │  │
│  │ └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                       │
│                       [Tap Repo / Slide]                               │
│                                ▼                                       │
│ MODE B: CONFIGURE ACTIONS (Pre-filled Repository)                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ < Back to Repositories List                                      │  │
│  │ Active Repo: nakib555/git-manager (Synced 18m ago)               │  │
│  │ Tabs: [ Clone & Sync ]   [ Export Archive ]   [ Selective (Tree)]│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### State & Motion Strategy
1. **Intake Mode State**: `sourceMode: 'browse' | 'custom_url'`.
2. **Transition Animation**:
   - Switching between `browse` and `custom_url` uses `AnimatePresence mode="wait"` with subtle directional slide (`x: 20 -> 0`, `opacity: 0 -> 1`).
   - Selecting a repository from the list initiates a forward slide into the configuration tab sheet with preloaded metadata (`selectedRepo`).
   - A sticky header back button (`< Browse Repositories`) allows smooth return to the list.
3. **Repository Aggregator**: Merges `githubRepos` with on-device synced repositories (`getDeviceSyncedRepos()`) and `recentClones` to remove duplicates and accurately display local status.

---

## 8-Point Spatial Grid System

- **Mode Switcher**: `h-11`, `p-1`, `rounded-xl`, `gap-1`.
- **Repo Cards**: `p-4`, `rounded-2xl`, `space-y-3`, border `border-border/80`, hover `hover:border-accent/40`.
- **Badges**: `text-[10px] font-mono py-0.5 px-2 rounded-full`.
- **Action Buttons**: `min-h-[36px]`, `px-3`, `rounded-xl`, `gap-1.5`.

---

## Implementation Breakdown

### Phase 1: Repository Aggregation & Filter Engine
- Combine local device repositories and remote GitHub repositories into a unified list.
- Provide real-time search and filter tabs (`All`, `On Device`, `Remote`).

### Phase 2: Mobile Clone Screen Implementation (`src/mobile/screens/Clone.tsx`)
- Add the dual-mode segmented switcher (`Browse Existing` vs `Enter Link`).
- Build the rich animated card list with on-device status pills, last synced counters, and direct quick-action buttons.
- Connect the smooth slide transition when clicking a card to prefill the 3 action tabs.

### Phase 3: Desktop Modal Harmonization (`src/components/CloneModal.tsx`)
- Implement the matching mode switcher and transition list in the desktop modal.

---

## Quality Gates & Verification
1. `tsc --noEmit` via `lint_applet` must pass with zero errors.
2. `compile_applet` must build successfully.
3. Smooth 60fps transitions verified with no layout jumping.

---

## Approval Gate
In accordance with the Master Engineering Planning & Implementation Protocol:
**Awaiting your review and explicit approval.** Please reply with **"Approved"**, **"Proceed"**, or **"Implement"** to begin implementation.
