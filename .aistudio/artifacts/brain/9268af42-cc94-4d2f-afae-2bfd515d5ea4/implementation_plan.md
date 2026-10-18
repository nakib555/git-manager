# Master Engineering Specification: Premium Mobile Interface Redesign for Git Manager

## 1. Objective
### Purpose
Deliver a native-grade mobile experience for **Git Manager** on screens $< 1024\text{px}$. Redesign the mobile interface from the ground up to feel like a modern, focused iOS/Android developer tool (similar to Linear Mobile, Raycast, and GitHub Mobile) rather than a desktop viewport scaled down.

### Problem
While desktop functionality is robust, the mobile interface needs a dedicated design system that guarantees thumb-first ergonomics, dense yet readable information architecture, near-black charcoal surfaces with subtle depth, strict touch target compliance ($\ge 44\times 44\text{px}$), and native sliding bottom sheets for sorting, filtering, and code inspection.

### Business & Technical Value
- **Developer Workflow on the Go**: Rapid triage of repositories, browsing recent commits, reviewing PR status, inspecting file changes, and switching branches from a smartphone with one-handed thumb interaction.
- **Visual Polish**: Replaces generic aesthetics with the specified charcoal color system (`#0A0A0B`, `#121214`, `#1A1A1D`, `#242428`, `#2A2A2E`, `#3B82F6`), high-contrast typographic hierarchy (Geist & Geist Mono), and soft, consistent lighting.
- **Safe-Area Ergonomics**: Guarantees zero clipping or obscured elements across iPhone Dynamic Island, home indicators (`env(safe-area-inset-bottom)`), and Android navigation bars.

### Success & Acceptance Criteria
1. **Strict Color Implementation**:
   - Background: `#0A0A0B`
   - Surface Level 1: `#121214`
   - Surface Level 2: `#1A1A1D`
   - Surface Level 3: `#242428`
   - Border: `#2A2A2E`
   - Text hierarchy: `#F4F4F5` (Primary), `#A1A1AA` (Secondary), `#71717A` (Tertiary)
   - Accent: `#3B82F6` (Desaturated professional blue)
   - Semantic alerts: `#22C55E` (Success), `#EF4444` (Danger), `#F59E0B` (Warning)
2. **Typography & Numbers**:
   - Inter / Geist as primary UI font; JetBrains Mono / Geist Mono for hashes, numbers, code, and paths.
   - Screen titles at 20px / 600 weight; section headers at 16px / 600 weight; body at 15px / 400 weight; captions at 12–13px / 500 weight with tabular figures for numbers.
3. **Spatial Scale & Touch Targets**:
   - Standard 20px horizontal screen margins (`px-5`).
   - Cards have 16px internal padding (`p-4`) with 12px radius (`rounded-xl`).
   - All interactive controls (buttons, inputs, tabs, chips) meet or exceed $44\times 44\text{px}$ touch targets.
   - Native bottom sheets have 20px top radius (`rounded-t-[20px]`) and tactile drag handles.
4. **Layout Structure (Every Screen)**:
   - Sticky Header: 56px height + `safe-area-top` (Menu left, contextual title center with branch selector, Search & Plus right).
   - Repo Sub-Tabs (inside repo): Horizontal scrollable pills with solid `#3B82F6` accent active state.
   - Main Scrollport: Pull-to-refresh with generous bottom padding (`pb-[calc(56px+env(safe-area-inset-bottom)+16px)]`).
   - Fixed BottomNav: 56px height + `safe-area-inset-bottom` featuring 5 tabs (Home, Repos, Clone, Activity, Settings) with soft accent pill background (`bg-[#3B82F6]/10`).
   - Floating Toast: Positioned at `top-16 left-1/2 -translate-x-1/2 z-[300]` (below header, never colliding with bottom navigation).

---

## 2. Existing System Analysis & Verification

### Verified Facts
- `src/App.tsx` routes between `DesktopLayout` and mobile screens based on `useIsDesktop()` (`window.innerWidth >= 1024`).
- Mobile layout currently mounts `<Header />`, `<RepoTabs />`, `<PullToRefresh>`, active screen component, `<BottomNav />`, `<ActionSheet />`, `<NotificationDrawer />`, and `<Toast />`.
- `src/index.css` defines CSS variables for `--main`, `--card`, `--hover`, `--border`, etc. Updating these variables establishes the exact charcoal palette system-wide.
- `src/screens/Repositories.tsx` handles personal and global search, multi-dimension sorting, type filters, and virtualized pagination.
- `src/screens/repodetails/FilesScreen.tsx` uses Git tree recursion to show repo files.
- `src/screens/repodetails/CommitsScreen.tsx` renders commit history and diffs.

---

## 3. Architecture & UI/UX Design

### 3.1 Color & Surface Hierarchy

```
+-------------------------------------------------------------------------+
| Level 0: App Canvas Background (#0A0A0B)                                |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Level 1: Cards, Sticky Header, BottomNav (#121214, Border: #2A2A2E)|  |
|  |                                                                   |  |
|  |  +-------------------------------------------------------------+  |  |
|  |  | Level 2: Inputs, Segmented Controls, Inactive Chips (#1A1A1D)|  |  |
|  |  |                                                             |  |  |
|  |  |  +-------------------------------------------------------+  |  |  |
|  |  |  | Level 3: Nested Hover, Badges, Drag Handles (#242428)  |  |  |  |
|  |  |  +-------------------------------------------------------+  |  |  |
|  |  +-------------------------------------------------------------+  |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

### 3.2 Mobile Header & Navigation Architecture
- **Header**: Height $56\text{px} + \text{safe-area-top}$.
  - Left: Hamburger menu ($44\times 44\text{px}$ touch target) triggering account & notification drawer.
  - Center: Contextual Title (e.g. `Repositories`, `facebook/react`, or branch dropdown with chevrons).
  - Right: Search button ($44\times 44\text{px}$) + Quick Action Plus (+) button ($44\times 44\text{px}$).
- **Repo Sub-Tabs**:
  - Horizontal scrolling container (`no-scrollbar`) containing `Files`, `Commits`, `Branches`, `PRs`, and `Insights`.
  - Inactive pill: `#1A1A1D` surface with `#A1A1AA` text.
  - Active pill: Solid `#3B82F6` accent background with pure `#FFFFFF` bold text.
- **Bottom Navigation**:
  - Height $56\text{px} + \text{safe-area-inset-bottom}$.
  - 5 Destinations: `Home` (`dash`), `Repos` (`repos`), `Clone` (`clone`), `Activity` (`commits`), `Settings` (`settings`).
  - Active indicator: Soft rounded pill (`bg-[#3B82F6]/10 text-[#3B82F6]`) with filled icon variant.

---

## 4. Key Screens Mobile Specification

### 4.1 Repositories Screen
- **Sticky Controls Strip**:
  - Segmented control: `Personal` | `Global` (Height 40px, `#1A1A1D` background, `#242428` active slider).
  - Search input: 44px height, `#1A1A1D` surface, 10px radius, left search icon, right clear (X) button, and debounce indicator.
  - Quick filter chips: Horizontal scrolling pills (`All`, `Public`, `Private`, `Forks`, `Sources`).
  - Sort button: 44px square / compact button with badge opening the **Sort & Filter Bottom Sheet**.
- **Repository Card**:
  - Surface: `#121214` with `#2A2A2E` border, 12px radius, 16px internal padding.
  - Row 1: `owner/repo-name` in 16px semibold `#F4F4F5` + Visibility badge (`Public` in `#22C55E/10`, `Private` in `#EF4444/10`).
  - Row 2: Description in 14px `#A1A1AA` (max 2 lines, line-clamp-2).
  - Row 3: Meta items: Star count with amber icon, Fork count with blue icon, Language badge with colored dot, relative push time (`2h ago`) in tabular figures.
- **Bottom List Pagination**:
  - Fixed inside list flow below repository cards (not floating).
  - Previous / Next buttons ($44\times 44\text{px}$) with windowed page numbers (`1 .. 4 5 6 .. 12`).

### 4.2 Repository Detail — Files Tab & Code Bottom Sheet
- Breadcrumb bar at top with tap-to-navigate ancestor folders.
- Hierarchical tree: Folders first, files second, alphabetical order.
- Folder rows: Tap toggles folder open/close with rotating chevron.
- File rows: Icon by file extension (TS, JS, CSS, JSON, MD, etc.) + filename + humanized file size.
- **Code Bottom Sheet**:
  - Triggered by tapping any file.
  - Header: Filename, language tag, Copy Code button ($44\text{px}$ target with copy feedback), Close (X) button.
  - Body: Prism syntax-highlighted code with monospace font and line numbers, smooth momentum scrolling.

### 4.3 Commits Tab & Diff Inspector
- Vertical timeline with subtle `#2A2A2E` connector line.
- Commit Card: Author avatar ($32\times 32\text{px}$), commit message in 14px `#F4F4F5`, relative timestamp in 12px `#71717A`, and short SHA in Geist Mono (`font-mono text-xs`).
- Tap action: Opens full commit details modal / bottom sheet showing commit metadata, files changed count, additions (+ green) / deletions (- red), and unified diff viewer.

### 4.4 Action Sheet (Native Bottom Sheet)
- Drag handle: 36px wide, 4px high, `#2A2A2E` surface, centered.
- 20px top border radius (`rounded-t-[20px]`).
- Clean list of items: New Repository, Clone Repository, Create Branch, Create Pull Request.
- Destructive action: Red icon and text at bottom.
- 48px height per action row with active opacity feedback.

### 4.5 Dashboard / Home Screen
- Header greeting: "Welcome back, {User}" with user avatar badge.
- Compact stats grid: 3-column / 2-column layout displaying Repositories, Synced Commits, and Pull Requests with tabular numbers.
- Recent Activity Feed: List of recent git events and pushes.
- Quick Actions: Shortcuts to Clone, New Repo, and Explore.

---

## 5. Implementation Phases

### Phase 1: CSS Theme Tokens & Foundations (`src/index.css`)
- Inject exact charcoal color variables into `:root` and `.dark-theme`.
- Define surface levels: `--surface-1: #121214`, `--surface-2: #1A1A1D`, `--surface-3: #242428`, `--border-subtle: #2A2A2E`.
- Define text colors: `--text-primary: #F4F4F5`, `--text-secondary: #A1A1AA`, `--text-tertiary: #71717A`.
- Define accent and semantic tokens: `--accent: #3B82F6`, `--success: #22C55E`, `--danger: #EF4444`, `--warning: #F59E0B`.

### Phase 2: Global Mobile Navigation & Overlays (`Layout.tsx`, `UI.tsx`)
- Redesign `<Header />`: 56px sticky bar with safe-area padding, 44px buttons, branch dropdown chevron.
- Redesign `<RepoTabs />`: Horizontal scrolling pill strip with solid `#3B82F6` active pill and auto-scroll center.
- Redesign `<BottomNav />`: 56px bar with safe-area padding, 5 tabs with soft `#3B82F6/10` active pill and filled icons.
- Redesign `<ActionSheet />`: Sliding bottom sheet with drag handle, 20px top radius, 48px touch rows.
- Redesign `<Toast />`: Floating top-center pill at `top-16`, semantic color schemes.

### Phase 3: Screen Redesigns
- Redesign `src/screens/Repositories.tsx`: 44px search input, segmented control, filter chips, repo cards, sliding sort bottom sheet, non-floating pagination.
- Redesign `src/screens/Dashboard.tsx`: Greeting, stats row, activity feed, quick action buttons.
- Redesign `src/screens/repodetails/FilesScreen.tsx`: Breadcrumb, folders-first tree, sliding bottom sheet for file code preview with syntax highlighting and copy button.
- Redesign `src/screens/repodetails/CommitsScreen.tsx`: Vertical timeline, connector lines, commit cards, diff viewer sheet.
- Redesign `src/screens/repodetails/BranchesScreen.tsx` & `PRsScreen.tsx`: Charcoal cards and 44px touch targets.

### Phase 4: Build Verification & Quality Review
- Run `npm run lint` (`tsc --noEmit`).
- Run `npm run build` (`vite build`).

---

## 6. Execution Checklist
- [ ] 1. Update `src/index.css` with exact charcoal color variables and typography.
- [ ] 2. Update `src/components/Layout.tsx` for 56px Header, RepoTabs, and BottomNav.
- [ ] 3. Update `src/components/UI.tsx` for ActionSheet, SortBottomSheet, and floating Toast.
- [ ] 4. Update `src/screens/Repositories.tsx` with sticky controls, cards, and sort sheet.
- [ ] 5. Update `src/screens/Dashboard.tsx` with stats, greeting, and activity feed.
- [ ] 6. Update `src/screens/repodetails/FilesScreen.tsx` with breadcrumbs, tree, and code preview bottom sheet.
- [ ] 7. Update `src/screens/repodetails/CommitsScreen.tsx` with timeline and diff sheet.
- [ ] 8. Verify build compilation and absence of lint errors.
