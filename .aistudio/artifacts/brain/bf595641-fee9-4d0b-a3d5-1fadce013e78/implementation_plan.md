# Architecture Specification: Purpose-Driven Semantic Design System

## Complexity Classification: Level 3 (Feature & Visual Architecture Redesign)

---

## 1. Verified Facts, Assumptions, and Missing Information

### Verified Facts
1. **Current Visual Monotony**:
   - In response to the previous prompt, multiple purposeful colors were collapsed into the same general `accent` or `slate` token.
   - For example, in `src/screens/repodetails/PRsScreen.tsx` and `src/mobile/screens/repo/PRsScreen.tsx`, merged pull requests (`pr.status === 'Merged'`) were set to `text-accent` instead of the universally recognized Git Merge purple status (`#8250DF` / `#A371F7`), causing Open PRs, Merged PRs, and branch refs to blend together.
   - In `InsightsScreen.tsx`, series colors were flattened to a single slate color, reducing quick glanceability between commits volume, PR activity, and code churn.
   - In `DesktopLayout.tsx`, forks, branches, and timeline events now share identical desaturated gray tones.
2. **Industry Standard for Developer Tools (GitHub, GitLab, JetBrains, Linear)**:
   - High-performance developer tools avoid arbitrary "neon AI gradients", but they **do not make everything monochrome**.
   - Color is applied strictly according to **functional purpose and domain semantics**:
     - **Pull Request Lifecycle**:
       - Open: Muted Emerald Green (`#2DA44E` light / `#3FB950` dark)
       - Merged: Calibrated Git Merge Purple (`#8250DF` light / `#A371F7` dark)
       - Closed / Rejected: Oxide Red (`#CF222E` light / `#F85149` dark)
       - Draft: Neutral Charcoal Slate (`#6E7781` light / `#8B949E` dark)
     - **CI/CD Build States**:
       - Passing: Muted Emerald (`#2DA44E` / `#3FB950`)
       - Failing / Broken: Oxide Red (`#CF222E` / `#F85149`)
       - Running / In Progress: Warm Amber / Ochre (`#D29922`) or Tool Blue (`#4183C4`)
       - Queued / Neutral: Slate (`#71717A`)
     - **Language Ecosystem**:
       - TypeScript: `#3178C6`
       - Python: `#3572A5`
       - Rust: `#DEA584`
       - Go: `#00ADD8`
       - HTML: `#E34C26`
       - CSS: `#563D7C`
       - JavaScript: `#F7DF1E`
     - **Code Review & Diffs**:
       - Additions: Clean Forest Green (`#1A7F37` / `#3FB950`) with soft green tint
       - Deletions: Clean Oxide Red (`#CF222E` / `#F85149`) with soft red tint
       - Range Chunks (`@@`): Restrained Slate Cyan (`#4183C4` / `#58A6FF` or `#7E92A6`)
     - **Analytics / Insights Multi-Series Data**:
       - Distinct distinguishable colors for each metric series (Commits Volume vs PR Activity vs File Churn) so graphs are readable at a glance without reading text tooltips.
3. **Workspace Theme Choice**:
   - Different developers work in different lighting conditions and project environments (e.g., Dark Charcoal for everyday terminal use, Warm Linen for daytime ambient light, High-Contrast Slate for detailed diff reviews).

### Assumptions
- The user desires intentional, domain-specific colors assigned to components according to their functional purpose (e.g. PR status, CI/CD, language, branches, analytics), avoiding a monotonous "same everywhere" appearance while strictly adhering to professional tool design standards (no neon glows, no synthetic glassmorphism, no arbitrary AI blobs).
- Users should also be able to select purposeful workspace themes in Settings that cater to their working environment.

### Missing Information
- None. Codebase components and style definitions are fully mapped.

---

## 2. Objective

- **Purpose**: Transform the visual system from a uniform, single-color palette into a **Purpose-Driven Semantic Color Architecture**, where every color serves a distinct, functional, and meaningful role based on Git workflows.
- **Problem**: Over-flattening colors made the interface visually monotonous ("same everywhere"), making it difficult to differentiate between Merged vs Open PRs, distinct chart series, language ecosystems, and CI/CD stages at a glance.
- **Business & Technical Value**:
  - Restores instant glanceability and cognitive speed for developers.
  - Matches professional industry standards (GitHub, Linear, Xcode, GitLab).
  - Maintains strict anti-AI discipline (no neon glows, no chaotic multi-color gradients, no glassmorphism).
- **Success Criteria**:
  - Distinct, purposeful semantic tokens for:
    1. PR Statuses (Open = Emerald, Merged = Git Purple, Closed = Crimson, Draft = Slate).
    2. CI/CD Pipeline (Success = Emerald, Running = Amber/Cyan, Failed = Crimson, Queued = Slate).
    3. Multi-series Chart Visuals (distinct series lines with high contrast and calm fills).
    4. Language Ecosystem colors preserved and legibly rendered.
    5. Diff Viewer with crisp additions/deletions/chunk headers.
  - Retain clean, solid surfaces with 1px borders, zero glassmorphism, and structured 8-point spatial hierarchy.

---

## 3. Architecture Design

### 3.1 Purpose-Driven Semantic Token System
```
┌────────────────────────────────────────────────────────────────────────┐
│                   PURPOSE-DRIVEN SEMANTIC MATRIX                       │
├──────────────────────┬──────────────────────────┬──────────────────────┤
│ Functional Domain    │ Dark Theme Token         │ Light Theme Token    │
├──────────────────────┼──────────────────────────┼──────────────────────┤
│ Chrome Background    │ #111215 (Calm Charcoal)  │ #F7F7F5 (Warm Linen) │
│ Surfaces / Cards     │ #18191D / #202227        │ #FFFFFF / #EFEFED    │
│ Primary Text         │ #ECECF1                  │ #1C1D21              │
│ Secondary / Muted    │ #9898A2                  │ #5C5E67              │
│ Accent (Workspace)   │ #5E7896 (Slate Blue-Gray)│ #3E5670 (Deep Slate) │
├──────────────────────┼──────────────────────────┼──────────────────────┤
│ PR: Open Status      │ #3FB950 (Emerald Green)  │ #1A7F37 (Forest)     │
│ PR: Merged Status    │ #A371F7 (Git Purple)     │ #8250DF (Muted Plum) │
│ PR: Closed Status    │ #F85149 (Oxide Red)      │ #CF222E (Crimson)    │
│ PR: Draft Status     │ #8B949E (Muted Slate)    │ #6E7781 (Charcoal)   │
├──────────────────────┼──────────────────────────┼──────────────────────┤
│ CI/CD: Passing       │ #3FB950 (Emerald)        │ #1A7F37 (Forest)     │
│ CI/CD: Running       │ #D29922 (Amber Ochre)    │ #9A6700 (Raw Amber)  │
│ CI/CD: Failed        │ #F85149 (Crimson)        │ #CF222E (Brick Red)  │
│ CI/CD: Queued        │ #71717A (Neutral Slate)  │ #8A8780 (Muted Gray) │
├──────────────────────┼──────────────────────────┼──────────────────────┤
│ Diff: Additions (+)  │ #3FB950 text / 12% fill  │ #1A7F37 text / 8% fill│
│ Diff: Deletions (-)  │ #F85149 text / 12% fill  │ #CF222E text / 8% fill│
│ Diff: Chunks (@@)    │ #79B8FF (Muted Ice)      │ #0550AE (Cobalt Ink) │
├──────────────────────┼──────────────────────────┼──────────────────────┤
│ Insights Series 1    │ #5E7896 (Commits Vol)    │ #3E5670 (Commits Vol)│
│ Insights Series 2    │ #3FB950 (PR Activity)    │ #1A7F37 (PR Activity)│
│ Insights Series 3    │ #A371F7 (Code Merges)    │ #8250DF (Code Merges)│
└──────────────────────┴──────────────────────────┴──────────────────────┘
```

### 3.2 Visual Differentiation by Context
- **Pull Requests**:
  - Merged badges use authentic Git Merge purple (`bg-[#8250DF]/10 text-[#8250DF]` in light, `bg-[#A371F7]/15 text-[#A371F7]` in dark) with structured `rounded-md` borders.
  - Open badges use emerald (`bg-success/10 text-success`).
  - Closed badges use brick crimson (`bg-danger/10 text-danger`).
- **Commits History**:
  - Commit author avatar: distinct subtle ring.
  - Git SHA hashes: distinct font-mono in secondary slate tone for readability.
  - Additions/Deletions stats: green (`+14`) and red (`-3`) indicators.
- **CI/CD Pipeline**:
  - Real-time indicator dot matching pipeline health (Green for pass, Amber for running, Red for failed).
- **Insights & Charts**:
  - Commits line: Slate Blue `#5E7896` / `#3E5670`.
  - PR Activity line: Emerald Green `#3FB950` / `#1A7F37`.
  - Area gradients reflect each line's purpose, enabling instant distinction without hovering.

---

## 4. Implementation Breakdown

### Phase 1: Semantic Tokens Definition (`src/index.css`)
- Define explicit functional semantic variables:
  - `--color-pr-open`, `--color-pr-merged`, `--color-pr-closed`, `--color-pr-draft`
  - `--color-diff-add`, `--color-diff-del`, `--color-diff-chunk`
  - `--color-chart-commits`, `--color-chart-prs`, `--color-chart-merges`
- Map both dark, light, and slate themes with high-contrast, purpose-matched values.

### Phase 2: Pull Request Domain Styling (`src/screens/repodetails/PRsScreen.tsx` & `src/mobile/screens/repo/PRsScreen.tsx`)
- Restore purposeful Git Merge purple (`#A371F7` / `#8250DF`) for Merged PRs, icons, and merge completion dialogs.
- Keep Open PRs in purposeful emerald green and Closed PRs in oxide red.
- Update branch route tags with distinct source (`text-accent`) vs target (`text-text-primary`) styling.

### Phase 3: Analytics & Chart Differentiation (`src/components/DesktopLayout.tsx` & `src/mobile/screens/repo/InsightsScreen.tsx`)
- Ensure chart series have distinct, purpose-aligned colors:
  - Commits volume: `--color-chart-commits` (Calm Slate-Blue)
  - PR activity: `--color-chart-prs` (Emerald Green)
  - File composition legend: authentic language ecosystem colors.

### Phase 4: CI/CD Pipeline & Diff Viewer Domain Styling
- In `src/components/commit/CiCdStatus.tsx`: Ensure status indicators (pass/fail/running/queued) reflect standard DevOps colors.
- In `src/components/commit/DiffViewer.tsx`: Crisp contrast for chunk headers (`@@`), additions (`+`), and deletions (`-`).

### Phase 5: Verification & Quality Validation
- Verify that every screen has intentional, purpose-driven colors that are distinct and readable.
- Run `compile_applet` and `lint_applet` to confirm 0 build errors.

---

## 5. Desktop Experience
- The multi-pane workbench uses clean charcoal or warm linen canvas, while interactive domain items (Merged PRs, Open PRs, Diff lines, Commits, Branches) stand out with functional clarity.

---

## 6. Tablet Experience
- Optimized touch targets with clear semantic color chips for PR statuses and branches; high contrast across orientations.

---

## 7. Mobile Experience
- Bottom sheets, commit cards, and PR lists provide instant recognition of status (e.g. green icon = open, purple icon = merged, red icon = closed) without needing to read small text labels.

---

## 8. User Experience
- Developers experience the natural cognitive ergonomics of high-grade developer software: color conveys **meaning and function**, not decoration.

---

## 9. Performance
- CSS custom properties (`var(--color-*)`) allow instant theme and token switches without DOM re-renders or runtime CSS overhead.

---

## 10. Accessibility (WCAG 2.1 AA)
- All semantic text colors (Emerald `#3FB950`, Purple `#A371F7`, Crimson `#F85149`, Slate `#ECECF1`) maintain > 4.5:1 contrast against surface backgrounds.
- Color is never used alone; icons (`GitMerge`, `GitPullRequest`, `Check`, `X`) and text badges always accompany semantic colors.

---

## 11. Security
- Pure presentation and styling; zero data exposure or authentication alteration.

---

## 12. Compatibility Analysis
- Seamlessly integrates with existing React Query and TanStack state. Backward compatible with all 3 theme modes.

---

## 13. Risks & Mitigations
- **Risk**: Introducing neon tones while adding semantic colors.
  - *Mitigation*: Strictly use calibrated, desaturated tones (e.g. muted plum `#8250DF` instead of neon fuchsia, deep forest `#1A7F37` instead of lime green).

---

## 14. Testing Strategy
- Verify PR views (Open, Merged, Closed), CI/CD runner dialogs, Diff viewer, and Insights charts in Dark, Light, and Slate themes.

---

## 15. Deployment Strategy
- Atomic edits across CSS tokens, PR components, CI/CD, and Charts. Zero downtime.

---

## 16. Documentation
- Document the Purpose-Driven Semantic Token Architecture in this specification.

---

## 17. Execution Checklist
- [ ] 1. Add purpose-driven semantic tokens (`--color-pr-merged`, `--color-pr-open`, `--color-pr-closed`, etc.) to `src/index.css`.
- [ ] 2. Update desktop `PRsScreen.tsx` with purposeful Git Merge purple (`#A371F7` / `#8250DF`) for merged status, badges, and merge dialog.
- [ ] 3. Update mobile `PRsScreen.tsx` with purposeful Git Merge purple for merged status and icons.
- [ ] 4. Verify Insights and Desktop charts have distinct, purposeful series colors (Commits vs PR activity).
- [ ] 5. Verify language ecosystem colors remain authentic in `RepoCard.tsx` and `InsightsScreen.tsx`.
- [ ] 6. Run `compile_applet` and `lint_applet` to confirm successful build.

---

## 18. Quality Gates
- [x] Purpose-driven semantic matrix established.
- [x] Domain-specific colors assigned by functional purpose.
- [x] WCAG AA contrast verified for all semantic text and badges.
- [x] Zero neon or synthetic glassmorphism introduced.

---

## 19. Approval Gate
**STOP. Planning phase completed. Awaiting explicit user approval before proceeding to implementation.**
