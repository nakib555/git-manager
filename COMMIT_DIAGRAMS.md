# Commit Component Layout Diagrams

This document contains high-fidelity text-based ASCII layouts of both the **Latest Commit Box (Commit Inspector)** (including the responsive Desktop Dialog and Mobile Drawer modes) and the **Historical Commit Box** (Commit Feed card).

---

## 1. Latest Commit Box (Desktop & Mobile Inspector)

### A. Desktop View Dialog (Polished Centered Pop-up)
```text
┌──────────────────────────────────────────────────────────────┐
│  [👁️] Commit Metadata                                     [X] │
│  Repository SHA and verification logs                        │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ FULL COMMIT SHA                                          │ │
│ │ e4a8b2c8b4c9ea92df4762cf1b8d23...                        │ │
│ ├────────────────────────────┬─────────────────────────────┤ │
│ │ AUTHOR                     │ TIME ELAPSED                │ │
│ │ 👤 Nakib Prince            │ 🕒 Just now                 │ │
│ └────────────────────────────┴─────────────────────────────┘ │
│                                                              │
│  COMMIT MESSAGE                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ "feat: redesign commit dialog box for mobile view"       │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ──────────────────────────────────────────────────────────── │
│  Impact Stats:                      [ +286 ] [ -42 ] (Red)   │
└──────────────────────────────────────────────────────────────┘
```

### B. Mobile Drawer View (Sliding Bottom Pane - 92vh Height)
```text
┌──────────────────────────────────────────────────────────────┐
│                        [─── Drag Handle ───]                 │
│                                                              │
│  [X] Close             Commit Inspector          [✔ VERIFIED]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ "  COMMIT MESSAGE                                        │ │
│ │    feat: redesign commit dialog box for mobile view      │ │
│ │    layout adjustments                                    │ │
│ │                                                          │ │
│ │                                            [📋 Copy Msg] │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 👤 Committed By:           │ Timestamp:                  │ │
│ │    Nakib Prince [✔]        │ 🕒 Just now                 │ │
│ │    Verified local developer│                             │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  STAGED INTEGRITY SHA-1                                      │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ e4a8b2c8b4c9ea92df476cf1b8d23c1fd89                 [📋] │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  IMPACT & STAGING DIFF                                       │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ┌──────────────────────────┐ ┌──────────────────────────┐ │ │
│ │ │ ADDITIONS                │ │ DELETIONS                │ │ │
│ │ │ +286                 [+] │ │ -42                  [-] │ │ │
│ │ └──────────────────────────┘ └──────────────────────────┘ │ │
│ │ Insertion Ratio: 87%                                     │ │
│ │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱       │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  GIT VERSION CONTROLS (Bento Control Grid)                  │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ │
│ │ [⚙️] Amend Details        │ │ [🌿] Branch Here         │ │
│ │ Edit message or lines    │ │ Create detached fork     │ │
│ └──────────────────────────┘ └──────────────────────────┘ │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ │
│ │ [🏷️] Tag Commit           │ │ [↩️] Revert Commit        │ │
│ │ Add release tag          │ │ Undo changes safely      │ │
│ └──────────────────────────┘ └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Historical Commit Box (Feed List View Card)

This component displays commits sequentially in the repository log feed.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  ●  e4a8b2c  [ Nakib Prince ] ──── 🕒 Just now                     [ ⚙️ Options ] │
├──────────────────────────────────────────────────────────────────────────────┤
│  "feat: redesign commit dialog box for mobile view layout adjustments"       │
│                                                                              │
│  Files: 📂 5 changed  •  Insertions: [ +286 ]  •  Deletions: [ -42 ]         │
├──────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Inspect Details]                                     [🌿 Branch From]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture & Responsive State Flow

- **State Providers**: Loaded dynamically from `AppContext.tsx` using `getLocalRepoDetails` to retrieve custom mock arrays containing authors, dynamic timeline metrics, line additions (`+`), deletions (`-`), and files metadata.
- **Responsive Hook**: Utilizes `useIsDesktop()` to instantly flip layout trees without hydration mismatches:
  - **`isDesktop = true`**: Desktop centered viewport modal with background blur (`backdrop-blur-md`).
  - **`isDesktop = false`**: Mobile 92vh drawer containing responsive flex alignments, extra copy action buttons, larger touch targets ($44\text{px}$ targets for copy/amend triggers), scroll-locked contents, and bottom action-sheets.
- **Copy Verification Toasts**: Triggers dynamic `setCopiedSHA` / `setCopiedMsg` states alongside standard `showToast` system confirmations with instant state updates.
