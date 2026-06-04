# 🏔️ Mass Image Downloader – Contributing Guide

Thank you for your interest in contributing to **Mass Image Downloader**!
This guide provides everything you need to know to start contributing effectively and collaboratively.

---

## 📥 How to Contribute

### 🐛 Report a Bug

- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include steps to reproduce, screenshots, and console output if possible

### 🌟 Suggest a Feature

- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Explain your use case and what benefit it adds

### 🛠 Submit a Code Contribution

1. Fork the repository
2. Clone your fork locally using HTTPS or SSH
   ```bash
   git clone https://github.com/<your-user>/Mass-Image-Downloader.git
   ```
   ```bash
   git clone git@github.com:<your-user>/Mass-Image-Downloader.git
   ```
3. Add the upstream repository and update `dev`
   ```bash
   cd Mass-Image-Downloader
   git remote add upstream https://github.com/del-Pacifico/Mass-Image-Downloader.git
   git fetch upstream
   git checkout dev
   git pull --ff-only upstream dev
   ```
4. Create a new branch from `dev`
   ```bash
   git checkout -b feature/your-description
   ```
5. Make your changes following the coding style and structure
6. Test your changes locally
   ```bash
   npm run check
   npm test
   ```
7. Push your branch and submit a pull request to `dev` using the [PR Template](.github/PULL_REQUEST_TEMPLATE.md)

---

## 🧭 Development Flow

All development must follow this branch and release flow:

```text
feature/chore branch -> dev -> main -> tag/release
```

- Create feature, chore, fix, refactor, documentation, and tooling branches from `dev`.
- Open pull requests back into `dev` for review and validation.
- Merge `dev` into `main` only as part of the release process.
- Create tags and GitHub releases only from `main`.
- Keep changes focused and avoid mixing unrelated work in the same branch or pull request.

### Incremental Commit and Push Discipline

During active development, each validated atomic change should be committed and pushed to the current working branch as soon as it is complete.

Use this workflow for every focused improvement, bug fix, documentation correction, or test update:

1. Keep the change scoped to the active issue, discussion, or approved pull request objective.
2. Review the working tree before staging.
3. Stage only the files that belong to the completed atomic change.
4. Run the relevant local validation before committing when the change can affect behavior or repository checks:
   ```bash
   npm run check
   npm test
   ```
5. Commit with a clear conventional prefix such as `fix:`, `docs:`, `chore:`, `refactor:`, or `test:`.
6. Push the commit to the current feature, fix, chore, documentation, or tooling branch immediately.

Do not batch unrelated changes into a single commit. Do not push directly to `dev` or `main` during normal development. Pull requests remain the mechanism for promoting work back into `dev`.

Example:

```bash
git status --short
git add -- scripts/clipboardHotkeys.js
npm run check
npm test
git commit -m "fix: handle invalidated clipboard hotkey context"
git push -u origin fix/rehydrate-content-script-state
```

In this example, the commit contains only the clipboard hotkey recovery fix and is pushed to the active fix branch. A separate documentation correction or unrelated refactor should use its own focused commit.

---

## 🏷️ Issue Title Prefixes

All issues must start with a bracketed prefix that clearly identifies the nature of the report.

Use one of the following prefixes:

- `[Bug]` for confirmed defects that break or degrade expected behavior.
- `[Investigation]` for unclear, hard-to-reproduce, or not-yet-classified problems.
- `[EdgeCase]` for narrow, reproducible cases with limited impact, often visual or layout-related.
- `[Enhancement]` for functional or UX improvements that are not regressions.
- `[Docs]` for documentation-only work.
- `[Chore]` for maintenance, tooling, CI, repo cleanup, or non-functional refactors.
- `[Question]` for support requests or open questions that are not yet actionable work.

Examples:

- `[Bug] Valid X/Twitter image URLs with query parameters are rejected`
- `[Investigation] Align One-click icon with shared validation`
- `[EdgeCase] Inspector overlay offset in nested responsive layouts`

---

## 📐 Code Standards

Code changes must follow these standards:

- Use **JavaScript ES6+**.
- Do not add external libraries; the extension must remain pure JavaScript.
- Keep modules focused: prefer **1 file = 1 concern**.
- Prefer existing project helpers and patterns before adding new abstractions.
- Add JSDoc or a concise header comment to every new or changed function, including purpose, parameters, and return value when applicable.
- Write comments in clear, concise English. Comments should explain intent, edge cases, or non-obvious behavior.
- Keep logging consistent with the project format: `[Mass image downloader]: emoji + message`.
- Use `logDebug()` where available instead of direct `console.log()`.
- User-facing recovery messages must also be logged with the final rendered message text:
  ```js
  logDebug(2, `📢 Showing user message: "${finalText}" (${type})`);
  ```
- Avoid false-positive logs. Do not log success unless the action actually completed or the flow has a documented safe-success condition.
- Keep user-facing messages professional, concise, and actionable.

## 📚 Documentation Standards

All project documentation should use a project-name-first visible title.

For regular Markdown documentation, the first line should be:

```text
# 🏔️ Mass Image Downloader – <Document Title>
```

For Markdown files with YAML frontmatter, keep the frontmatter first and place the visible H1 immediately after the closing `---`:

```markdown
---
name: 🏔️ Mass Image Downloader – Bug Report
about: Report a reproducible bug
---

# 🏔️ Mass Image Downloader – Bug Report
```

For YAML-only metadata files, use the same project-name-first format in the visible `name`, `title`, or equivalent display field when such a field exists. Issue title templates such as `[Bug]` or `[Docs]` may keep their operational prefix format.

This standard applies to root documentation, manuals, guides, policies, changelogs, contribution documents, and GitHub issue or pull request templates when practical.

## 🧪 Local Validation

Run these checks before opening a pull request:

```bash
npm run check
npm test
```

- `npm run check` validates `manifest.json`, declared extension paths, version alignment across `manifest.json`, `VERSION`, and `package.json`, command limits, required permissions, and JavaScript syntax.
- `npm test` runs the Node.js compliance tests used by CI.

The same checks run in GitHub Actions for pull requests targeting `dev`.

---

## 🧑‍💻 Development Rules

Contributions must follow the project's development rules:

- Keep changes modular, focused, and testable.
- Keep the PR scope aligned with the issue or approved discussion. Avoid unrelated refactors.
- Preserve existing business rules unless the issue explicitly requires changing them.
- Do not alter URL validation, gallery heuristics, download naming rules, hotkey names, or browser behavior assumptions as side effects.
- Handle errors professionally with clear recovery paths.
- Report recoverable failures through logs and, when user action is needed, through user-facing messages.
- Continue operating whenever safe. Unhandled catastrophic failures are not acceptable.
- Avoid unnecessary CPU, memory, filesystem, tab-management, or batch-processing bottlenecks.
- Rehydrate cached settings only when the local snapshot is stale, incomplete, or required for the current flow.
- Keep background refreshes scoped to the settings required by that flow.
- Follow the MV3 runtime resilience rules for content scripts, hotkeys, background handoffs, and long-lived tabs.
- Update relevant documentation when behavior, recovery paths, browser support, hotkeys, settings, or known limitations change.
- Run local validation before opening or updating a pull request:
  ```bash
  npm run check
  npm test
  ```

---

## 🧩 MV3 Runtime Resilience Rules

Browser-extension changes must account for Manifest V3 lifecycle behavior, especially when workflows involve content scripts, hotkeys, popup/background handoff, or `chrome.runtime.sendMessage`.

When implementing or refactoring extension workflows:

- Distinguish whether the entry point is **background-owned** (`chrome.commands`, popup-triggered background injection, service-worker orchestration) or **page-side** (`keydown` listeners or already-injected content scripts).
- Assume long-lived tabs may contain content scripts injected before an extension reload. Those scripts can still receive DOM events, but their extension context may be invalidated.
- Handle `Extension context invalidated` explicitly when a page-side script can no longer call extension APIs.
- Provide a clear user-facing recovery path when safe recovery is not possible, usually asking the user to refresh the affected tab.
- Do not leave recoverable MV3 lifecycle failures as console-only errors.
- Do not show false success messages after failed injection, failed handoff, or invalidated runtime access.
- Rehydrate cached settings only when the local snapshot is stale, incomplete, or required for the current flow.
- Keep background refreshes scoped to the settings required by that flow.
- Preserve existing business logic unless the issue explicitly requires changing it. Do not alter URL validation, gallery heuristics, download naming rules, or hotkey names as a side effect of lifecycle fixes.
- Any visible toast/user feedback must also be logged with the final rendered text, using the project format:
  ```js
  logDebug(2, `📢 Showing user message: "${finalText}" (${type})`);
  ```
- If the change introduces or documents browser-specific behavior, shortcut conflicts, MV3 recovery behavior, or long-lived tab limitations, update the relevant documentation.

---

## 🏷️ Labeling Rules

All issues, pull requests, and discussions must use the necessary descriptive labels from the repository label set.

Use labels to describe:

- Work type: `type:*`
- Affected area: `scope:*`
- Priority or lifecycle state: `priority:*`, `status:*`, `needs:*`, or `dev:*`
- Behavior impact when relevant: `behavior:*`

Recommended minimums:

- Issues: `type:*` + `scope:*` + `priority:*` or `needs:*` + `status:*`
- Pull requests: `type:*` + `scope:*` + `behavior:*` when applicable + `dev:*` or `status:*`
- Release work: `type: release` + `scope: release` + the appropriate release status label
- Documentation or repository maintenance: `type: documentation` or `type: chore` + `scope: repo-maintenance`
- Investigations: `type: investigation` + `needs: triage` or `needs: reproduction`
- Performance work: `type: performance` + the affected `scope:*` + a priority label

Discussions should use the correct category and descriptive labels when available. If a discussion is promoted to an issue, the new issue must be labeled before it is considered ready for planning.

---

## 🤖 AI-Assisted Contributions 

This project partially uses tools based on artificial intelligence (AI) for assistance, such as: 

- Codex CLI
- Copilot 
- ChatGPT 
- Gemini 
- Deepseek 

AI tools may assist in code generation, documentation, formatting, or security best practices. 
However, **all contributions are reviewed manually** to ensure clarity, accuracy, performance, and compliance with the project's standards. 

If you contribute to this repository: 

- Feel free to use AI tools to enhance your productivity. 
- Please **disclose clearly** in your pull request description if the contribution was AI-assisted. 
- Ensure that **no proprietary or sensitive data is shared** with AI tools when generating code or suggestions. 

We support responsible and transparent use of AI to accelerate development, without compromising quality or authorship clarity. 

---

## 💬 Need Help?

Feel free to [start a discussion](https://github.com/del-Pacifico/mass-image-downloader/discussions) or open an issue with your question. We’re happy to assist!

> Contributions of all kinds are welcome — from typo fixes to major features. Let’s build something great together! 🚀
