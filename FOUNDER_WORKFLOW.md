e# Founder’s Workflow (Visual, No-Terminal Guide)

This is your simple, repeatable process to manage Wondertone inside VS Code using buttons and panels (no complex commands).

---

## What each tool is
- VS Code: Your workshop (edit files, see changes, commit, push).
- GitHub: Your cloud backup (stores branches and commits; where PRs live).
- Vercel: Your live host (auto-deploys when you push to the configured branch, usually “main”).

---

## Daily quick-start checklist
1) Open the repo in VS Code
- File → Open Folder… → select the project folder.

2) Create a safe workspace (new branch)
- Bottom-left status bar: click the branch name → “Create new branch…”
- Name it (example: feat/bundle-trim) → confirm “Switch to new branch”.

3) Make changes and preview differences
- Before saving: press Cmd+Shift+P → “File: Compare Active File with Saved” for side-by-side before/after.
- After saving: open Source Control (left sidebar icon) → click a changed file to see a side-by-side diff.
- Tip: Use the inline diff toggle button on the diff tab if you prefer single-column view.

4) Run the app (without terminal)
- Explorer panel → “NPM Scripts” → expand:
  - dev → click the play icon to start the dev server (opens your app in the browser).
  - build → builds production files.
  - build:analyze → builds and opens a bundle size treemap (dist/stats.html).
  - deps:check → scans for unused dependencies (review results in the Output/Terminal panel).

5) Save your work (commit)
- Source Control panel:
  - Stage files: click the + next to each file, or the + next to “Changes” to stage all.
  - Type a short message (e.g., “fix: reduce bundle size by pruning unused Radix deps”).
  - Click the checkmark (Commit).

6) Back up to GitHub (push/sync)
- Source Control panel:
  - First time on a new branch: click “Publish Branch”.
  - Afterwards: click “Sync Changes” to push new commits.

7) Open a Pull Request (optional, visual)
- Install “GitHub Pull Requests and Issues” extension:
  - Click the GitHub icon in the Activity Bar → “Create Pull Request”.
  - Or open GitHub in the browser and click “Compare & pull request”.

---

## Visual diffs: quick reference
- Unsaved edits: Cmd+Shift+P → “File: Compare Active File with Saved”.
- Saved edits: Source Control → click a file under “Changes” to open the diff view.
- Color key in editor gutter:
  - Green = added, Blue = modified, Red = removed.

---

## Branching strategy (keep main stable)
- Create a branch per task:
  - feat/<thing>, fix/<issue>, chore/<maintenance>, docs/<docs-change>.
- Commit small, meaningful changes frequently.
- Merge to main via Pull Requests.

---

## Bundle size workflow (visual)
- Run “build:analyze” from NPM Scripts.
- When the treemap opens (dist/stats.html):
  - Look for large boxes (big libraries).
  - If a library looks unused, search for its imports in VS Code (Cmd+Shift+F) before removing.
- After removing a dependency, run “build:analyze” again to confirm the drop.

---

## Dependency cleanup (visual)
- Run “deps:check” from NPM Scripts.
- Review the output list of “unused” packages.
- Before removing, verify usage with VS Code search (Cmd+Shift+F).
- Remove via package.json (right-click → Open Preview → edit) then Source Control → commit.

---

## Handling merge conflicts (when they happen)
- VS Code will show conflict markers in files.
- Use the in-editor buttons:
  - “Accept Current Change” (your version),
  - “Accept Incoming Change” (remote version),
  - or “Accept Both Changes”.
- Save, then commit to finish.

---

## Roll back safely
- Source Control → click a file → use “Timeline” to view history and restore a previous version.
- For whole-commit rollback: Install “GitLens” → open the Repository view → right-click a commit → Revert.

---

## Keeping this guide handy
- Open this file → right-click the tab → Pin.
- Optional: Add a link from README.md to this file.
- Keep this as your first tab daily.

---

## Quick tips
- Use Problems panel (bottom) for errors/warnings; click an item to jump to the file.
- Rename branches from the status bar (click branch name → “Rename”).
- Use Split Editor (Cmd+\) to compare files side-by-side quickly.

You’ve got this—keep each change small, review visually, commit often, push to GitHub, and verify on Vercel when merging to main.