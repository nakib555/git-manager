# MASTER PROMPT: PREMIUM MOBILE GIT MANAGER REDESIGN
## 8-Point Grid System · High-End UI/UX · Fluid Motion · Production-Quality Implementation

### 1. YOUR ROLE

Act as a principal product designer, senior mobile UI/UX engineer, design systems architect, interaction designer, and frontend performance engineer.

Completely redesign the existing mobile Git repository management application shown in the provided reference video.

Deliver a cohesive, premium, production-quality interface that feels like a carefully designed developer tool—not a generic dashboard, not a reskinned template, and not a collection of unrelated cards.

The final product must be visually sophisticated, easy to understand on a phone, technically consistent, responsive, accessible, and smooth during every major interaction.

**Primary objectives:**
- Apply a strict 8-point spacing system.
- Improve information hierarchy and screen density.
- Make repository navigation intuitive.
- Redesign commit history, commit details, diffs, code viewing, file browsing, and repository controls.
- Introduce fluid, purposeful transitions and micro-interactions.
- Preserve existing functionality, data, routes, and working integrations.
- Avoid unnecessary complexity, oversized UI elements, excessive whitespace, and decorative animations.

Do not start by writing code. First inspect the existing application and establish a redesign plan.

---

### 2. FIRST: AUDIT THE EXISTING APPLICATION

Analyze the supplied video, existing source code, project structure, current dependencies, and available functionality.

Identify and document the current behavior of:

1. Repository selector and active repository.
2. Top application toolbar and navigation drawer.
3. Files, Commits, Branches, and Pull Requests sections.
4. Commit history in list and graph modes.
5. Search, filtering, sorting, and date-range controls.
6. Commit detail sheets and commit metadata.
7. Changed-file lists and addition/deletion statistics.
8. Code diff viewer, syntax highlighting, and line numbers.
9. File history and file metadata.
10. Repository directory tree and file selection.
11. Bottom navigation and any other existing screens.
12. Loading states, empty states, errors, and offline behavior.
13. Existing gestures, buttons, contextual menus, and modal behavior.

Create a functionality inventory before implementation.

For each feature, classify it as:
- Working and must be preserved.
- Working but needs redesign.
- Incomplete and requires repair.
- Unknown and requires verification.

Do not invent existing functionality. Do not remove useful capabilities simply to simplify the design.

If the source code is available, inspect the actual implementation rather than relying exclusively on screenshots.

---

### 3. DESIGN PHILOSOPHY

Build a premium developer experience inspired by the information clarity of GitHub, the precision of Linear, the restraint of Raycast, and the readability of modern code editors.

Use these references for design principles only. Do not copy their interfaces directly.

The design should feel:
- Precise and engineering-focused.
- Calm, professional, and trustworthy.
- Compact without becoming cramped.
- Visually consistent across every screen.
- Fast to scan with one hand.
- Comfortable during long code-review sessions.
- Modern through typography, subtle surfaces, and meaningful motion.

Avoid:
- Excessive rounded cards.
- Large decorative gradients.
- Unnecessary glassmorphism.
- Random spacing values.
- Excessive shadows.
- Too many accent colors.
- Giant headings on utility screens.
- Tiny, unreadable code.
- Too many pill-shaped controls.
- Animated elements that delay essential tasks.
- Redesigning every screen independently without a shared system.

Prioritize developer productivity over decoration.

---

### 4. STRICT 8-POINT GRID SYSTEM

Establish an 8-point spacing scale and use it throughout the application.

| Token | Value | Typical usage |
|---|---:|---|
| space-0 | 0 px | No spacing |
| space-1 | 4 px | Fine optical adjustments |
| space-2 | 8 px | Tight internal spacing |
| space-3 | 12 px | Compact control spacing |
| space-4 | 16 px | Standard padding |
| space-5 | 24 px | Section spacing |
| space-6 | 32 px | Major separation |
| space-7 | 40 px | Large section spacing |
| space-8 | 48 px | Major layout separation |
| space-9 | 64 px | Exceptional large gaps |

Use multiples of 8 as the default structural rhythm. Use 4 px subdivisions only when necessary for compact controls, optical alignment, icons, and dense developer data.

#### Layout rules
- Default mobile content gutter: 16 px.
- Compact-screen gutter: 12 px only when the viewport requires it.
- Standard component internal padding: 12–16 px.
- Standard spacing between related controls: 8 px.
- Standard spacing between major sections: 24 px.
- Align icons, text, and controls to consistent grid positions.
- Make modals, sticky action bars, and bottom navigation share predictable alignment.
- Account for status bars, display cutouts, gesture areas, and keyboard insets.
- Do not force excessive whitespace into code-heavy screens.

#### Responsive grid
For a phone approximately 360–430 px wide:
- Use a single primary content column.
- Preserve 12–16 px horizontal gutters.
- Prevent horizontal overflow in ordinary interface elements.
- Allow controlled horizontal scrolling for code, diffs, and other inherently wide content.
- Keep important actions reachable with one hand.
- Reflow secondary metadata instead of shrinking everything to unreadable sizes.

For tablets and larger screens:
- Expand the content region intelligently.
- Introduce a persistent navigation rail or sidebar when useful.
- Use two-pane layouts for repository browsing and file details when space permits.
- Keep line lengths and code-review layouts readable.

Never scale a mobile screen mechanically to fill a desktop viewport.

---

### 5. DESIGN SYSTEM AND TOKENS

Create a centralized design-token system. All shared components must consume the same tokens.

#### Typography
- Display: 28–32 px, reserved for meaningful overview screens.
- Page heading: 22–24 px.
- Section heading: 16–18 px.
- Body: 14–16 px.
- Secondary text: 12–13 px.
- Compact metadata: 11–12 px, where legible.
- Code: 12–14 px, with a monospace font and appropriate line height.
- Button labels: 13–14 px.
- Commit hashes: monospace, with truncation and copy access.

Use Inter or the project's existing equivalent. Use JetBrains Mono or an appropriate system monospace font for source code and hashes.

#### Color system
Create semantic tokens rather than scattering hexadecimal values across components.

Suggested light theme:
- App background: #F6F7F9.
- Primary surface: #FFFFFF.
- Secondary surface: #F0F2F5.
- Primary text: #17202B.
- Secondary text: #667085.
- Border: #E4E7EC.
- Primary accent: #2563EB.
- Success/addition: #15803D.
- Danger/deletion: #DC2626.
- Warning: #B45309.
- Focus indicator: a clearly visible accessible accent.

Treat these values as starting points. Validate contrast and adapt them to the existing product identity.

#### Dark theme
Create a complete dark theme, not a simple inversion:
- Deep neutral application backgrounds.
- Distinct but restrained elevated surfaces.
- Readable secondary text.
- Subtle separators.
- Carefully calibrated syntax colors.
- Clearly differentiated added and deleted lines.
- Consistent focus, selected, hover, and pressed states.

Persist theme preference only through the application's existing supported settings mechanism.

#### Surfaces and borders
- Use subtle borders to define structure.
- Apply shadows sparingly to floating surfaces and overlays.
- Use consistent corner-radius tokens: approximately 8, 12, and 16 px for different component levels.
- Reserve larger radii for bottom sheets and prominent overlays.
- Do not wrap every line of information in a separate card.

#### Iconography
Use one consistent icon family, such as Lucide.
- Standard icons: approximately 18–20 px.
- Compact toolbar icons: 18–20 px.
- Prominent actions: 20–22 px.
- Maintain consistent stroke weight.
- Pair ambiguous icons with labels or accessible names.
- Avoid mixing emoji, filled icons, and unrelated outline styles in core navigation.

---

### 6. REDESIGN THE APPLICATION SHELL

Build a consistent application shell across all major screens.

#### Top application bar
Include:
- Navigation drawer or back action, depending on context.
- Compact repository selector.
- Repository or branch context when useful.
- Search access.
- One prominent contextual action where appropriate.

The toolbar must not become crowded. Use approximately 48–56 px for the main toolbar height, excluding system insets. Keep touch targets comfortably large even when icon artwork is compact.

#### Primary navigation
Preserve Files, Commits, Branches, and Pull Requests destinations where supported.

Design compact segmented navigation or clearly labeled tabs:
- Strong selected state.
- Consistent tab widths and alignment.
- No layout jumps during tab changes.
- Smooth indicator movement.
- Horizontal scrolling only when required.
- Persistent navigation state where appropriate.

Do not duplicate primary navigation in multiple places.

#### Bottom navigation
Retain existing destinations if they are part of the established information architecture.
- Respect Android gesture navigation and system insets.
- Keep labels readable.
- Use a restrained active indicator.
- Avoid covering scrollable content.
- Keep navigation stable while content changes.
- Hide or adapt it only when a focused full-screen workflow benefits from doing so.

---

### 7. COMMIT HISTORY: COMPLETE REDESIGN

Optimize commit history for fast scanning and precise interaction.

#### Screen hierarchy
1. Compact repository and branch context.
2. Primary repository tabs.
3. Commits heading and count if available.
4. Search field and filter access.
5. List/graph view selector.
6. Scrollable history.
7. Contextual actions and pagination or loading behavior.

Avoid unnecessary vertical gaps.

#### Commit list item
Display when available:
- Commit message.
- Author or contributor.
- Relative timestamp.
- Short commit hash.
- Branch or reference labels where useful.
- Changed-file or change-statistic information if supported.

Hierarchy:
- Commit message: strongest.
- Author and time: secondary.
- Hash and additional metadata: tertiary.
- Actions: visible on demand or through a contextual menu.

Long messages must wrap or truncate predictably, with access to the full message.

Make the appropriate row interactive, but keep copy, overflow, and other individual actions independently accessible.

#### Commit graph
- Use a consistent coordinate and spacing system.
- Draw clean vertical and curved branch connections.
- Use distinct but restrained branch colors.
- Align nodes with corresponding commit rows.
- Support multiple branches and merges.
- Maintain readable connections during scrolling.
- Avoid graph lines that misrepresent repository history.
- Animate newly loaded graph elements subtly without changing commit identity or order.

The graph must represent real data. Never fabricate branch relationships.

#### List/graph transition
- Preserve branch selection and filters.
- Avoid resetting scroll position unnecessarily.
- Maintain stable commit ordering.
- Use a subtle crossfade or short transform.
- Prevent flashing or duplicate rows.
- Respect reduced-motion preferences.

---

### 8. SEARCH, FILTERS, AND SORTING

#### Search
- Search by commit message or other fields the application actually supports.
- Provide an obvious clear action.
- Use a clear focused state.
- Preserve the query while navigating where appropriate.
- Debounce remote requests if necessary.
- Cancel or disregard stale asynchronous responses.
- Display loading, no-results, and error states.
- Avoid unnecessary requests for every keystroke.

#### Filter sheet
Use a polished bottom sheet or dedicated screen, depending on complexity.

Group supported options such as:
- Author.
- Branch.
- Date range.
- Commit type or status, if supported.
- Other existing filters.

Include clear Apply and Reset actions where appropriate.

The filter sheet should enter smoothly, support accessible dismissal, avoid accidental dismissal during selection, keep applied filter state visible, and show active filter counts when meaningful.

Never show filter options that the backend cannot apply.

---

### 9. COMMIT DETAIL SHEET

Rebuild the commit detail experience as a structured sheet or detail screen.

#### Header
Include:
- Commit identifier and short hash.
- Commit message.
- Author and timestamp.
- Close or back action.
- Optional overflow menu.

#### Summary
Show meaningful statistics when available:
- Files changed.
- Insertions.
- Deletions.
- Parent commit.
- Branch or reference context.

Use compact statistic groups rather than oversized metric cards.

#### Changed-file list
Each entry should include:
- File path.
- File type icon or label.
- Added-line count.
- Deleted-line count.
- Expand/collapse or open-file action.

Requirements:
- Distinguish modified, added, deleted, and renamed files when supported.
- Truncate long paths intelligently.
- Provide access to the full path.
- Keep counts aligned.
- Avoid overly saturated green and red backgrounds.
- Preserve file ordering returned by the application unless sorting already exists.

#### Bottom action bar
Preserve existing actions such as copying a patch, opening a branch, or copying a commit hash where supported.

Use a compact, safe-area-aware action bar. Label important actions and prevent the bar from covering content.

For destructive actions, use a clear confirmation step where appropriate.

---

### 10. CODE DIFF VIEWER

Treat code review as a first-class experience.

#### Visual structure
Build a high-readability code viewer with:
- Monospace typography.
- Stable line numbers.
- Syntax highlighting.
- Added and deleted line indicators.
- Clear file headers.
- Optional diff context controls if supported.
- Horizontal overflow strategy for long lines.
- Suitable light and dark themes.

#### Diff presentation
- Added lines: subtle green-tinted background.
- Deleted lines: subtle red-tinted background.
- Unchanged lines: neutral surface.
- Hunk headers: visually distinct but restrained.

Avoid intensely colored screens.

Maintain accurate line alignment between old and new versions where supported.

Support:
- Copying selected code where technically possible.
- Copying a file path.
- Navigating between changed files.
- Expanding or collapsing file sections.
- Displaying loading and unavailable-diff states.
- Preserving the selected file during navigation.

Do not fake syntax highlighting or present placeholder content as a real diff.

#### Long code and small screens
- Keep code readable.
- Allow horizontal scrolling for long lines.
- Avoid scaling code down to fit the viewport.
- Keep line numbers aligned.
- Prevent the whole application from scrolling horizontally.
- Provide sufficient space for selection and copying.
- Preserve vertical scrolling performance on large diffs.

---

### 11. FILE BROWSER AND FILE DETAILS

#### File browser
Use a clean hierarchical list with:
- Folder and file icons.
- Indentation based on nesting depth.
- Expand/collapse controls.
- File names.
- Optional contextual metadata.
- Clear selected states.
- Search and path navigation where supported.

Requirements:
- Do not make hierarchy excessively indented on narrow screens.
- Preserve directory expansion state when practical.
- Prevent long filenames from breaking the layout.
- Avoid rendering huge repositories in a way that causes scrolling lag.
- Use virtualization if justified by repository size and architecture.

#### File detail view
Organize available tabs, such as Code, History, Info, and other supported actions.

Use compact tabs with a smooth active indicator.

Code view:
- Readable syntax highlighting.
- Stable line numbers.
- Copy actions where supported.

History view:
- Chronological file-specific commits.
- Author, timestamp, and message.
- Loading and empty states.

Info view:
- Path.
- Language.
- File size.
- Line count.
- Other real metadata supplied by the application.

Do not display invented metadata.

---

### 12. MOTION DESIGN SYSTEM

Motion must improve orientation, continuity, feedback, and perceived responsiveness.

Use a centralized motion-token system.

#### Timing tokens

| Motion | Duration |
|---|---:|
| Micro-interaction | 100–140 ms |
| Hover or pressed feedback | 100–160 ms |
| Tab or content transition | 180–240 ms |
| Modal or bottom-sheet entrance | 240–320 ms |
| Complex shared transition | 250–350 ms |

These are starting values. Adjust based on device performance and interaction context.

#### Easing
- Gentle ease-out for entrances.
- Balanced ease-in-out for transitions between states.
- Short, responsive curves for pressed states.
- Spring motion only when it improves naturalness without distracting bounce.

Avoid excessive overshoot, elastic movement, and long decorative animations.

#### Required interactions

**A. Tab switching**
Animate the selected indicator and transition content without unnecessary layout jumps. Keep navigation responsive.

**B. Commit detail opening**
Use a smooth bottom-sheet entrance or contextual transition. Dim the background subtly. Support swipe-to-dismiss only when it does not conflict with scrolling or other gestures.

**C. Filter sheet**
Animate the sheet and backdrop together. Restore focus and selection state correctly.

**D. Expandable file sections**
Animate height and opacity carefully. Avoid large reflows and preserve scroll position.

**E. Buttons**
Provide immediate pressed feedback using subtle opacity, scale, or background changes. Never delay the action to complete an animation.

**F. Loading states**
Use restrained skeleton placeholders resembling actual content. Avoid skeletons when data is already available. Never use endless decorative spinners after a failure.

**G. Search**
Animate focus and clear actions subtly. Keep typing responsive and avoid moving the entire screen unnecessarily.

**H. Toasts and notifications**
Enter and exit smoothly. Remain readable, avoid blocking critical actions, and use appropriate success, warning, and error states.

**I. Pull-to-refresh**
Preserve existing behavior if supported. Provide meaningful visual feedback and prevent gesture conflicts.

#### Reduced motion
Respect the operating system's reduced-motion preference.

When enabled:
- Remove unnecessary movement.
- Replace large transforms with short fades or immediate changes.
- Disable decorative looping animations.
- Keep all functionality available.

#### Animation quality requirements
- No flashing or white-screen transitions.
- No layout shifts caused by overlays.
- No duplicated content during transitions.
- No stuck backdrops.
- No broken scroll positions.
- No touch interactions blocked by invisible overlays.
- No animation that prevents rapid repeated actions.
- No animation that hides loading or error feedback.

---

### 13. MICRO-INTERACTIONS AND FEEDBACK

Every interactive component must communicate its state.

Implement appropriate states for:
- Default.
- Hover, where applicable.
- Pressed.
- Focused.
- Selected.
- Disabled.
- Loading.
- Success.
- Error.

For repository actions:
- Provide feedback after copying a hash or file path.
- Confirm success only after actual success.
- Explain why a failed operation could not complete.
- Prevent duplicate submissions while an operation is in progress.
- Keep destructive actions distinguishable from ordinary navigation.

Avoid fake success messages.

---

### 14. TECHNICAL IMPLEMENTATION

First detect the existing stack and work within it unless migration is demonstrably necessary.

Do not rewrite a working project into a different framework just for stylistic preference.

If the project uses React:
- Reuse established routing and application state.
- Build reusable, composable components.
- Centralize tokens and shared styles.
- Avoid duplicated screen-specific implementations.
- Preserve working integrations.
- Use semantic HTML and accessible interaction patterns.
- Keep expensive rendering out of unnecessary update cycles.

Use existing animation dependencies where suitable. If introducing a library, justify bundle size and compatibility. Prefer lightweight CSS transitions for simple interactions and an established animation library for genuinely complex coordinated motion.

If the project is a native mobile application, use its native layout, animation, and navigation conventions.

#### Architecture
Create shared components for:
- Application toolbar.
- Repository selector.
- Navigation tabs.
- Commit row.
- Commit graph.
- Search field.
- Filter sheet.
- Changed-file row.
- Code diff viewer.
- File tree.
- Bottom navigation.
- Toast and feedback messages.
- Loading, empty, and error states.

Use consistent prop interfaces and data contracts.

Separate presentation, business logic, repository data access, navigation, animation behavior, and theme/design tokens.

Preserve the current backend and API contracts unless an identified defect requires a carefully scoped change.

Do not hardcode demo data into production screens. Do not replace functioning repository operations with visual-only mock buttons.

---

### 15. ACCESSIBILITY AND TOUCH DESIGN

Design for real mobile use:
- Use approximately 44–48 px minimum interactive target dimensions where practical.
- Do not confuse icon dimensions with touch-target dimensions.
- Ensure keyboard focus is visible.
- Maintain sufficient text and icon contrast.
- Provide accessible labels for icon-only controls.
- Support screen readers.
- Preserve text scaling where feasible.
- Avoid communicating changes using color alone.
- Make dialogs and sheets keyboard-accessible where relevant.
- Return focus appropriately when overlays close.
- Prevent keyboard overlap with focused inputs.
- Respect safe areas and gesture-navigation regions.

Test compact and larger phones.

---

### 16. PERFORMANCE REQUIREMENTS

A premium interface must remain fast with large repositories.

Prioritize:
- Stable component identity and keys.
- Efficient list rendering.
- Virtualization for sufficiently large lists.
- Lazy loading of expensive content.
- Efficient syntax highlighting.
- Avoiding repeated parsing of unchanged code.
- Avoiding unnecessary re-renders.
- Correct cancellation or handling of stale requests.
- Smooth scrolling during long histories and diffs.
- Minimal unnecessary dependencies.

Do not animate hundreds of complex elements simultaneously. Avoid expensive blur, giant shadows, and repeated layout-triggering animations.

Measure actual performance instead of claiming 60 or 120 FPS without testing.

---

### 17. IMPLEMENTATION WORKFLOW

Execute the redesign in phases.

**Phase 1 — Audit**
Inspect the video, project structure, dependencies, routes, screens, and functionality. Identify constraints and regressions to avoid.

**Phase 2 — Design specification**
Define spacing, typography, colors, radii, elevations, and motion tokens. Map every existing screen to the new design.

**Phase 3 — Foundation**
Implement theme tokens, application shell, navigation, responsive layouts, and safe-area behavior. Verify the grid.

**Phase 4 — Repository navigation**
Implement Files, Commits, Branches, and Pull Requests navigation where supported. Preserve data and route behavior.

**Phase 5 — Commit history**
Redesign commit rows, graph mode, search, filters, and history states. Validate long messages and dense data.

**Phase 6 — Commit details and diffs**
Implement commit details, changed-file summaries, syntax highlighting, and diff interactions. Verify line alignment and large-file behavior.

**Phase 7 — File explorer**
Redesign directory navigation, file details, history, and metadata. Validate nested directories and long filenames.

**Phase 8 — Motion**
Add transitions after layouts and states are stable. Tune easing and duration on target devices. Implement reduced-motion behavior.

**Phase 9 — Quality assurance**
Run linting, type checking, tests, and production builds where supported. Resolve regressions.

**Phase 10 — Final polish**
Inspect screenshots from all major screens. Fix spacing, alignment, clipping, and contrast. Test themes, responsive layouts, and motion. Deliver a summary of completed work and known limitations.

Do not stop after creating a static mockup if the task is to redesign the actual application.

---

### 18. ACCEPTANCE TESTS

**Visual consistency**
- [ ] Spacing follows the defined 8-point system.
- [ ] Typography is consistent.
- [ ] Shared components use common tokens.
- [ ] No accidental horizontal overflow exists.
- [ ] Code and metadata remain readable.

**Functionality**
- [ ] Existing navigation still works.
- [ ] Commit history remains accurate.
- [ ] List and graph modes work.
- [ ] Search and filters behave correctly.
- [ ] Commit details show real data.
- [ ] Changed-file lists and diffs remain accurate.
- [ ] File navigation and metadata work.
- [ ] Existing repository actions are preserved.

**Motion**
- [ ] Tab transitions are smooth.
- [ ] Sheets open and close correctly.
- [ ] Expandable content does not break layouts.
- [ ] Motion does not block interaction.
- [ ] Reduced-motion preferences are respected.

**Quality**
- [ ] Light and dark themes are checked.
- [ ] Loading, empty, and error states are covered.
- [ ] Long commit messages and file paths are tested.
- [ ] Large histories and diffs are tested.
- [ ] No new critical console, type-checking, or build errors remain.
- [ ] Existing behavior has not regressed.

---

### 19. FINAL DELIVERABLES

Deliver:
1. A fully redesigned implementation using the existing project architecture where possible.
2. A documented 8-point design-token system.
3. Reusable UI components.
4. A consistent motion and transition system.
5. Redesigned repository navigation, commit history, commit details, diff viewing, and file browsing.
6. Responsive light and dark themes where supported.
7. Accessible interaction states.
8. Functional loading, empty, error, and success feedback.
9. A tested build and a list of remaining limitations.
10. A concise explanation of major design decisions and files changed.

### FINAL INSTRUCTION

Prioritize clarity, alignment, developer productivity, functional correctness, and smooth interaction over decorative effects.

Analyze first. Plan second. Implement third. Test continuously. Polish last.

**The final result should feel like a premium mobile developer product built by an experienced product-design team, with a disciplined 8-point grid and motion that feels natural, immediate, and purposeful.**
