# Git Manager — Architecture, Design, & UI/UX Deep Dive

---

## 1. System Overview & Design Philosophy

Git Manager is a developer-centric workstation client built as a progressive, responsive web application. It operates across two primary form-factors:
- **Desktop Version**: A high-density, multi-pane workbench optimized for wide viewports ($>1024\text{px}$) with keyboard shortcuts (`Cmd+K`), split-pane inspectors, and syntax-highlighted code editors.
- **Mobile Version**: A gesture-driven interface designed with thumb-zone reachability, pull-to-refresh interactions, bottom navigation, and compact spatial hierarchies.

### The 8-Point Spatial Grid Architecture
Every UI element strictly adheres to the 8-point geometric grid:
- **Base Grid**: $8\text{px}$ unit spacing (`gap-2` = $8\text{px}$, `gap-4` = $16\text{px}$, `p-6` = $24\text{px}$, `mb-8` = $32\text{px}$).
- **Half Grid**: $4\text{px}$ micro-offsets (`p-1` = $4\text{px}$, `py-1.5` = $6\text{px}$).
- **Standard Component Heights**:
  - Compact chips & badges: $32\text{px}$
  - Interactive inputs & buttons: $40\text{px}$ – $44\text{px}$
  - Primary call-to-action buttons: $48\text{px}$
  - Header & Top navigation bars: $56\text{px}$ – $64\text{px}$

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION                                 |
|                                                                                       |
|  +-------------------------+    +-----------------------+    +---------------------+  |
|  |     Desktop Layout      |    |     Mobile Layout     |    |   Command Palette   |  |
|  |   (Three-Pane Studio)   |    |  (BottomNav + Header) |    |      (Cmd/Ctrl+K)   |  |
|  +------------+------------+    +-----------+-----------+    +----------+----------+  |
|               |                             |                           |             |
|               +----------------------+------+---------------------------+             |
|                                      |                                                |
|                        +-------------v-------------+                                  |
|                        |      AppContext Core      |                                  |
|                        |  State, Events, Actions   |                                  |
|                        +-------------+-------------+                                  |
|                                      |                                                |
|       +------------------------------+------------------------------+                 |
|       |                              |                              |                 |
|  +----v--------------------+   +-----v--------------------+   +-----v---------------+ |
|  |  Client-Side Store      |   | High-Performance Trees   |   | Service Worker PWA  | |
|  | LocalStorage + Caches   |   | O(1) Map Indexing        |   | Auto-Upgrade Engine | |
|  +-------------------------+   +--------------------------+   +---------------------+ |
|                                      |                                                |
+--------------------------------------|------------------------------------------------+
                                       |
                                HTTP / REST / SSE
                                       |
+--------------------------------------v------------------------------------------------+
|                                 SERVER & APIs                                         |
|                                                                                       |
|  +-------------------------+   +--------------------------+   +---------------------+ |
|  |     Express Backend     |   |   Server-Sent Events     |   | GitHub REST API v3  | |
|  | (/api/auth, /api/repos) |   |    (/api/events SSE)     |   |   (Repos, Trees)    | |
|  +-------------------------+   +--------------------------+   +---------------------+ |
+---------------------------------------------------------------------------------------+
```

---

## 3. Working Functions in Deep Detail

### A. Authentication & Session Management
1. **GitHub OAuth Flow**:
   - Client calls `/api/auth/url` to retrieve the signed GitHub authorization redirect URL.
   - User grants permission in GitHub; redirected to `/auth/callback`.
   - The server exchanges the authorization code for an OAuth access token and issues a window message `OAUTH_AUTH_SUCCESS`.
   - `AppContext` receives the token via `window.addEventListener('message')`, securely stores it in `localStorage`, and updates `githubToken`.
2. **Personal Access Token (PAT) Fallback**:
   - Users without custom OAuth app credentials can input a GitHub PAT (`ghp_...` or `github_pat_...`).
   - Token is immediately validated via `/api.github.com/user` with custom headers (`Accept: application/vnd.github.v3+json`).
3. **Offline & Fallback Mode**:
   - If unauthenticated, the app loads curated open-source repositories (`facebook/react`, `tailwindlabs/tailwindcss`, `microsoft/vscode`) to maintain full functionality.

---

### B. Repository Search & Multi-Dimension Sorting Engine
The search engine employs a two-tier strategy that resolves GitHub API rate limits and HTTP 422 errors:

```
[User Types Query]
        |
        v
+-------------------------------+
|  Check Scope Configuration    |
+---------------+---------------+
                |
     +----------+----------+
     |                     |
     v                     v
[Personal Scope]     [Global Scope]
     |                     |
     |                     +---> Validate query != empty
     |                     |     Sanitize qualifiers (language, forks)
     |                     |     Format: https://api.github.com/search/repositories?q=...
     |                     |     Dispatch to GitHub API with error-catch boundary
     |
     +---> Instant Client-Side Indexing
           Search matching (name, desc, owner, language)
           Type Filter: Public | Private | Forks | Sources
           Language Filter: TS, JS, Python, Go, Rust, etc.
           Sort:
             - Last Updated (pushed_at timestamp)
             - Star Count (stargazers_count)
             - Fork Count (forks_count)
             - Alphabetical Name (localeCompare)
             - Primary Language
           Direction: Descending (v) vs Ascending (^)
           Slice Pagination: (page - 1) * perPage -> page * perPage
```

---

### C. File Tree & Code Viewer Engine ($O(1)$ Performance)
- **The Freezing Fix**: Previously, repositories with thousands of files traversed paths using nested $O(N^2)$ `.find()` lookups. 
- **The Modern Implementation**:
  1. `buildFastTree()` uses an in-memory `Map<string, TreeNode>` index.
  2. Directories are created once in $O(1)$ and referenced instantly.
  3. Nodes are sorted with folders grouped at the top, followed by alphabetical files.
  4. Tree items default to collapsed state; subtrees are lazily evaluated only when clicked.
  5. Content decoding uses a safe UTF-8 base64 stream parser that handles binary and multibyte characters without throwing DOM exceptions.

---

### D. Version Control Engine (Commits, Branches, PRs)
- **Commit Management**: Create local commits, amend messages, edit previous commits, delete commits, or restore files back to any historical SHA.
- **Branch Operations**: Switch active branches with local checkout emulation, create branches from `HEAD`, and delete branches with confirmation modals.
- **Pull Request Flow**: View open/merged/closed PRs, inspect unified diffs, review file changes, and trigger simulated merge strategies (`merge`, `squash`, or `rebase`).

---

## 4. Desktop UI/UX Architecture & Layout Breakdown

### Desktop Wireframe Diagram

```
+----------------------------------------------------------------------------------------------------+
|  [Logo] Git Manager    |  [Search / Cmd+K Palette]                |  [+ New Repo] [Theme] [User]   |
+------------------------+------------------------------------------+--------------------------------+
| SIDEBAR                | MAIN WORKSPACE                                                            |
|                        |                                                                           |
| [Home / Dashboard]     | +-----------------------------------------------------------------------+ |
| [Repositories] (Active)| | Breadcrumb / Scope Switcher:  [Personal Repos]  [Global GitHub]       | |
| [Clone Repository]     | +-----------------------------------+-----------------------------------+ |
| [Activity Logs]        | | LEFT PANE: NAVIGATOR              | RIGHT PANE: DETAIL INSPECTOR      | |
| [Settings]             | |                                   |                                   | |
|                        | | [Search Input...............]     | [Selected Repo Header]            | |
| --- WORKSPACE TABS --- | | [Filter: All | Pub | Priv | Fork] | [Open] [Clone] [Webhooks]         | |
| Commits                | | [Sort: Updated v] [Asc/Desc]      |                                   | |
| Pull Requests          | | --------------------------------- | Description & Metrics Grid        | |
| Branches               | | [x] react                         | [Stars: 220k] [Forks: 45k]        | |
| Files                  | | [ ] tailwindcss                   |                                   | |
| Insights               | | [ ] vscode                        | Recent Commits Timeline           | |
|                        | | [ ] personal-project              | CI/CD Pipeline Status Badge       | |
|                        | |                                   | Language Distribution Bar         | |
|                        | | --------------------------------- |                                   | |
| [Status: Station OK]   | | < Page 1 of 4 >                   | Quick Terminal Commands Snippet   | |
+------------------------+-------------------------------------+-----------------------------------+ |
```

### Desktop UX Specifics:
1. **Left Sidebar (`aside`)**:
   - Width: $288\text{px}$ (expanded) or $80\text{px}$ (collapsed via `PanelLeftClose`).
   - Profile card displaying GitHub avatar, user bio, follower counts, and connection status.
   - Context-aware navigation tabs showing repository sub-screens when a workspace is open.
2. **Top Header Bar**:
   - Interactive command palette launcher with keyboard badge indicator (`Cmd+K`).
   - Quick action buttons: `+ New Repo`, `Clone Repo`, and Theme mode toggle.
3. **Three-Pane Repositories Explorer**:
   - **Left Column**: High-performance virtualized repo list with live search, scope pills, and sorting dropdown.
   - **Right Column**: Comprehensive repository inspector with action buttons, clone command generators, language progress bars, and commit timelines.
4. **Code Inspector**:
   - Syntax-highlighted code viewer using Prism with dark/light themes.
   - Path breadcrumbs with instant copy and fullscreen toggle.

---

## 5. Mobile UI/UX Architecture & Layout Breakdown

### Mobile Wireframe Diagram

```
+-----------------------------------+
| [=]  Repositories        [Search] |  <-- Mobile Header (56px)
+-----------------------------------+
| [Personal Repos]  [Global GitHub] |  <-- Scope Toggle Pills
| [Search Input...................] |  <-- 44px Touch Target Search
| [All] [Public] [Private] [Forks]  |  <-- Horizontal Filter Scroll
+-----------------------------------+
| (Pull-Down Indicator: Refreshed)  |  <-- Pull-To-Refresh Spring Engine
|                                   |
| +-------------------------------+ |
| | [Folder] react-app            | |  <-- Virtualized Cards
| | Frontend workspace client     | |
| | [* 1.2k]  [^ 340]  [TS]       | |
| +-------------------------------+ |
| | [Folder] backend-api          | |
| | Express REST service          | |
| | [* 450]   [^ 82]   [Node]     | |
| +-------------------------------+ |
|                                   |
| +-------------------------------+ |
| | < Prev   Page 1 of 3   Next > | |  <-- Standard 8-Grid Pagination
| +-------------------------------+ |
+-----------------------------------+
| [Home]  [Repos]  [Clone]  [More]  |  <-- BottomNav (56px, Safe-Area)
+-----------------------------------+
```

### Mobile UX Specifics:
1. **Floating Top-Center Toast System**:
   - Placed at `top-4 left-1/2 -translate-x-1/2` with safe-area padding.
   - Never occludes the bottom navigation or pagination footer.
   - Semantic color-coding:
     - Error: Red outline + `AlertCircle`
     - Success: Emerald outline + `CheckCircle2`
     - Info: Indigo outline + `Info`
2. **Pull-to-Refresh Gesture Engine**:
   - Damped physics resistance (`resistance = 0.5`, threshold $70\text{px}$).
   - Smooth rotation spring animation with automatic data reload.
3. **RepoTabs Horizontal Slider**:
   - Smoothly auto-centers the active tab into the viewport on selection.
   - Animated layout underline indicator tracking tab switches.
4. **Bottom Navigation Bar**:
   - Height: $56\text{px} + \text{safe-area-inset-bottom}$.
   - Distinct tactile icons with active pill backgrounds (`bg-primary/10`).
   - Integrated floating action sheet trigger for rapid branch and PR creation.

---

## 6. Comprehensive Component Mapping

| File Path | Primary Function | Desktop UX Role | Mobile UX Role |
| :--- | :--- | :--- | :--- |
| `src/AppContext.tsx` | Global State & API Engine | Centralized state provider | Centralized state provider |
| `src/types.ts` | TypeScript Interfaces | Strict type definitions | Strict type definitions |
| `src/components/DesktopLayout.tsx` | Desktop Studio Shell | 3-pane workstation & split layout | N/A (Desktop only) |
| `src/components/Layout.tsx` | Mobile Shell & Navigation | N/A | Header, BottomNav, RepoTabs |
| `src/components/PullToRefresh.tsx` | Touch Gesture Handler | Scroll container | Touch pull-down sync |
| `src/components/CommandPalette.tsx` | Quick Actions Search | `Cmd+K` keyboard launcher | Accessible via header search |
| `src/components/UI.tsx` | Reusable Micro-Components | ActionSheet, Top-Center Toast | ActionSheet, Top-Center Toast |
| `src/screens/Dashboard.tsx` | Analytics & Overview | Embedded in studio center | Mobile home screen |
| `src/screens/Repositories.tsx` | Repository Browser | Mobile/responsive browser | Search, sort, filters, pagination |
| `src/screens/CloneScreen.tsx` | Repo Clone & Download | High-density clone workstation | 3-step mobile wizard |
| `src/screens/repodetails/FilesScreen.tsx` | Fast File Tree & Viewer | Integrated code explorer | Mobile tree with syntax view |
| `src/screens/repodetails/CommitsScreen.tsx` | Commit History & Amending | Visual commit branch graph | Card-based commit log list |
| `src/screens/repodetails/PRsScreen.tsx` | Pull Request Manager | Split diff reviewer | Mobile pull request cards |
| `src/screens/repodetails/BranchesScreen.tsx` | Branch Management | Table with branch actions | Touch-friendly branch listing |
| `src/screens/repodetails/InsightsScreen.tsx` | Activity & Charts | Recharts graphs & language pie | Mobile chart widgets |
| `src/screens/Settings.tsx` | User & App Preferences | Desktop settings cards | List-grouped settings menu |
