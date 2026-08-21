# 🏔️ Mass Image Downloader – Contributing Guide

Thank you for your interest in contributing to **Mass Image Downloader**!
This guide provides everything you need to know to start contributing effectively and collaboratively.

---

## 📥 How to Contribute

### Choose the Right Channel

- Use **Discussions** for:
  - Early ideas, open questions, design exploration, or support conversations.
  - Proposals that still need scope definition or community feedback.
  - **Once a discussion reaches a clear scope and agreed framework, it is promoted to an Issue.**

- Use **Issues** for:
  - Actionable bugs (confirmed and reproducible).
  - Approved feature requests (with clear scope and expected behavior).
  - Edge cases, investigations, and documentation problems.
  - **Issues can also be opened directly** without a prior discussion when the problem is well-defined and does not require exploratory conversation.

- Use **Pull Requests** only for:
  - Focused changes linked to an **existing Issue** or **approved Discussion**.
  - **All PRs must reference a related Issue or Discussion** that clearly defines the scope, expected behavior, and acceptance criteria.
  - PRs without a linked Issue or approved Discussion will not be reviewed and will be closed.
  - The PR description must include the issue number, a summary of changes, and QA validation results.

---

### 💪🏼 Browser Support and QA Baseline

Mass Image Downloader targets QA-validated Chromium-based browsers compatible with Manifest V3.

The project QA baseline is:

- **Brave**: primary QA browser; current QA confirms the documented flows and shortcuts operate as expected.
- **Vivaldi**: supported and QA-tested; current QA confirms the documented flows and shortcuts operate as expected.
- **Microsoft Edge**: supported and QA-tested; current QA confirms the documented flows operate as expected, but some extension shortcuts may require manual assignment in the browser shortcut manager.
- **Opera One**: supported and QA-tested; current QA confirms the documented flows operate as expected, but some browser/profile shortcut conflicts may limit specific shortcuts.

#### ⛔ Browsers outside the current project QA baseline

🚨 Atention: The following browsers are outside the current project QA baseline:

- **Browsers not listed above**: may work, but are not treated as validated unless explicitly added to the QA baseline.
- **Firefox and non-Chromium browsers**: out of scope because the extension is built for Chromium Manifest V3 APIs.

Shortcut-specific behavior belongs in `docs/hotkeys/hotkeys.md`, not in this contribution guide.

Bug reports from non-baseline Chromium browsers are accepted when they include enough evidence to determine whether the defect is in the extension, browser behavior, permissions, shortcut handling, site-specific behavior, or an unsupported runtime.

---

### 🌟 Suggest a Feature

Before opening a feature request, make sure the request describes a user need or workflow improvement, not only an implementation idea.

Recommended flow:

1. Describe the problem or workflow gap.
2. Explain who benefits and in which scenarios.
3. Describe the expected behavior from a user perspective.
4. Identify the affected area:
   - popup;
   - Options;
   - Settings Peek;
   - Image Inspector;
   - One-click;
   - Bulk;
   - galleries;
   - hotkeys;
   - documentation.
5. Note any constraints or trade-offs, such as browser behavior, MV3 limits, performance, privacy, permissions, or UI complexity.
6. Add examples, mockups, screenshots, or comparable workflows when useful.
7. Open a GitHub issue and choose the feature-request option when the proposal is actionable.

Use GitHub Discussions first for early ideas, broad design questions, or proposals that still need scope definition. A discussion can later be promoted to an issue once the expected behavior and scope are clear.

--- 

### 🐛 Report a Bug

Before opening a bug report, confirm that the behavior is a reproducible defect and not only an unclear observation, browser shortcut conflict, site-specific edge case, or configuration question.

Recommended flow:

1. Confirm you are using the expected extension version.
2. Reproduce the behavior in a clean, focused scenario.
3. Check whether the same behavior happens after refreshing the affected tab or reloading the extension.
4. Capture the environment:
   - browser and version;
   - Chromium version when available;
   - extension version;
   - operating system;
   - installation mode.
5. Capture the relevant settings snapshot, preferably from Settings Peek.
6. Collect evidence:
   - exact steps to reproduce;
   - expected behavior;
   - actual behavior;
   - page URL or URL pattern when relevant;
   - console logs filtered by `[Mass image downloader]`;
   - screenshots or recordings when visual behavior is involved.
7. Open a GitHub issue and choose the bug-report option when the problem is reproducible.

Use one issue per defect. If the behavior is unclear or hard to classify, open an investigation instead of forcing it into a bug report.

---

### 🧩 Edge Cases

Edge cases are narrow, reproducible scenarios that affect a limited set of users, pages, or configurations. They are often visual, layout-related, or triggered by specific site behaviors.

**When to open an Edge Case issue:**

- The behavior is reproducible but does not block the main functionality.
- The impact is limited to specific page structures, browser versions, or user settings.
- The issue requires investigation but is not a critical regression.

**How to handle Edge Cases:**

1. Use the `[EdgeCase]` prefix in the issue title.
2. Provide the exact conditions needed to reproduce the behavior.
3. Include the browser, Chromium version, and extension version.
4. Attach screenshots or screen recordings when the issue is visual.
5. Mark with `priority: low` or `priority: medium` depending on severity.

**Example Edge Cases already documented:**

- `[EdgeCase] Inspector overlay offset in nested responsive layouts`
- `[EdgeCase] SyntaxError: 'SUPPORTED_IMAGE_EXTENSIONS' already declared on direct image pages`

**Edge cases are treated after confirmed bugs and feature work, but they are still part of the project backlog and will be addressed in future releases.**

---

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

### 👀 Pull Request Review Process

After you submit a pull request, the review process begins. This section explains what to expect and how to collaborate effectively.

**What to expect:**

- A maintainer will review your PR within a reasonable time frame.
- The reviewer will check:
  - Alignment with the linked Issue or Discussion.
  - Code quality, style, and adherence to project standards.
  - Behavior and regression risks.
  - Documentation updates when applicable.
- You may receive comments, suggestions, or requests for changes.

**How to respond:**

- Address each comment with a focused commit (or reply clarifying why no change is needed).
- Re‑run local validation (`npm run check` and `npm test`) after making significant changes.
- Push additional commits to the same branch; the PR will update automatically.
- Keep the PR description up‑to‑date if the scope changes during review.

**When the PR is approved:**

- A maintainer will merge the PR into `dev` once all checks pass (CI, validation, and review approval).
- The PR will be included in the next release following the `dev → main → tag` flow.

**PRs without a linked Issue or approved Discussion will not be reviewed and will be closed.**

---

### 📝 Markdown Format for All Posts

All contributions to the repository — including issue descriptions, comments, discussion posts, pull request descriptions, and review comments — must be written in **Markdown** format.

This ensures consistency, readability, and proper rendering of code blocks, lists, links, and other structured content across GitHub’s interface.

**Guidelines:**

- Use Markdown for all user‑facing and developer‑facing communication on GitHub.
- Write in **professional American English**, but keep the tone approachable and clear.
- Use emojis sparingly; they are allowed in titles, section headers, and logs, but avoid them in the middle of technical explanations or user‑facing toast messages.
- Code blocks must specify the language (e.g., ` ```javascript `, ` ```bash `, ` ```json `).
- Keep paragraphs concise and use bullet points for lists when appropriate.
- When replying to issues or PRs, quote relevant parts of the original message using Markdown blockquotes (`> `) when needed for clarity.
- For longer technical explanations, use collapsible sections (`<details>` / `<summary>`) only when it helps to keep the main message readable.

This rule applies to all project members, including administrators, maintainers, and collaborators. It helps maintain a professional and consistent record of all discussions and decisions.

---

## 🏗️ Development Flow

All development must follow this branch and release flow:

```text
feature/chore branch -> dev -> main -> tag/release
```

- Create feature, chore, fix, refactor, documentation, and tooling branches from `dev`.
- Open pull requests back into `dev` for review and validation.
- Merge `dev` into `main` only as part of the release process.
- Create tags and GitHub releases only from `main`.
- Keep changes focused and avoid mixing unrelated work in the same branch or pull request.

---

### 🥷🏼 Incremental Commit and Push Discipline

During active development, `each validated atomic change` **must be committed and pushed** to the current working branch as soon as it is complete.

**Why this matters:**

- Maintains a **granular, traceable history** of every improvement or fix.
- Makes it easier to **revert specific changes** if a problem is detected.
- Helps other contributors **understand the evolution** of the codebase.
- Reduces the risk of **large, unreviewable commits** that mix unrelated changes.
- Aligns with the project's **atomic change philosophy**: one commit = one logical change.

Use this workflow for every `focused improvement`, `bug fix`, `documentation` correction, or `test update`:

1. Keep the change scoped to the active `issue`, `discussion`, or approved `pull request` objective.
2. Review the `working tree` before staging.
3. Stage `only` the files that belong to the completed atomic change.
4. Run the relevant `local validation` before committing when the change can affect behavior or repository checks:

```bash
npm run check
npm test
```

**Important**: The test results must be included as a comment in the associated Issue or Pull Request. This provides transparency and allows reviewers to confirm that the change does not introduce regressions. Example:

```bash
✅ Local validation passed:
- npm run check → all checks passed
- npm test → 3 tests passed, 0 failed
```

5. Commit with a clear conventional prefix such as `fix:`, `docs:`, `chore:`, `refactor:`, or `test:`.
6. `Push the commit` to the `current feature`, `fix`, `chore`, `documentation`, or tooling branch immediately.

🚫 **Do not:**

- Batch unrelated changes into a single commit.
- Push directly to `dev` or `main` during normal development.

✅ **Always:**

- Use **Pull Requests** as the **only** mechanism to promote work into `dev` and `main`.
- Keep each commit `focused` on a `single`, `atomic` change.
- Reference the `related Issue` or `Discussion` in the `PR description`.

Example:

```bash
git status --short
git add -- scripts/clipboardHotkeys.js
npm run check
npm test
git commit -m "fix: handle invalidated clipboard hotkey context"
git push -u origin fix/rehydrate-content-script-state
```

In this example, the commit contains `only` the clipboard hotkey recovery fix and is pushed to the `active fix branch`. A separate documentation correction or unrelated refactor should use `its own focused commit`.

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
- **Do not add external libraries**; the extension must remain pure JavaScript.
- Keep modules focused: prefer **1 file = 1 concern**.
- Prefer existing project helpers and patterns before adding new abstractions.
- Add `JSDoc` or a concise header comment to every new or changed function, including purpose, parameters, and return value when applicable.
- Write `comments` in clear, concise English. Comments should explain intent, edge cases, or non-obvious behavior.
- Keep `logging` consistent with the project format: `[Mass image downloader]: emoji + message`.
- Use `logDebug()` where available instead of direct `console.log()`.
- User-facing recovery messages must also be logged with the final rendered message text:

  ```js
  logDebug(2, `📢 Showing user message: "${finalText}" (${type})`);
  ```

- Avoid false-positive logs. **Do not log success** unless the action actually completed or the flow has a documented safe-success condition.
- Keep user-facing messages professional, concise, and actionable.

---

## 🎨 UI Feedback and Visual Standards

The extension must keep a consistent visual language across popup UI, Options, Settings Peek, Image Inspector, One-click overlays, tooltips, injected panels, and content-script toasts.

### Core Palette

Use the established project palette:

<table>
  <thead>
    <tr>
      <th>Role</th>
      <th>Color</th>
      <th>Swatch</th>
      <th>Usage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Primary action / info / success</td>
      <td><code>#007EE3</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#007EE3;border:1px solid #768591;"></span></td>
      <td>Primary buttons, informational toasts, successful completion toasts, neutral user feedback.</td>
    </tr>
    <tr>
      <td>Secondary accent / border / hover</td>
      <td><code>#768591</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#768591;border:1px solid #768591;"></span></td>
      <td>Control borders, hover states, secondary UI accents.</td>
    </tr>
    <tr>
      <td>Light surface</td>
      <td><code>#F8F8F8</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#F8F8F8;border:1px solid #768591;"></span></td>
      <td>Panel backgrounds, icon button backgrounds, light control surfaces.</td>
    </tr>
    <tr>
      <td>Panel surface</td>
      <td><code>#FFFFFF</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#FFFFFF;border:1px solid #768591;"></span></td>
      <td>Option groups, cards, table cells, and readable panel content areas.</td>
    </tr>
    <tr>
      <td>Text on colored surfaces</td>
      <td><code>#FFFFFF</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#FFFFFF;border:1px solid #768591;"></span></td>
      <td>Toast text and button text on colored backgrounds.</td>
    </tr>
    <tr>
      <td>Secondary text</td>
      <td><code>#6C757D</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#6C757D;border:1px solid #768591;"></span></td>
      <td>Descriptions, helper text, muted labels, and secondary comments.</td>
    </tr>
    <tr>
      <td>Body text</td>
      <td><code>#3f3f3f</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#3f3f3f;border:1px solid #768591;"></span></td>
      <td>Readable table values, regular panel text, and metadata content.</td>
    </tr>
    <tr>
      <td>Subtle separators</td>
      <td><code>#D0D0D0</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#D0D0D0;border:1px solid #768591;"></span></td>
      <td>Panel borders, table separators, and low-emphasis dividers.</td>
    </tr>
    <tr>
      <td>Error / recovery required</td>
      <td><code>#d9534f</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#d9534f;border:1px solid #768591;"></span></td>
      <td>Error toasts, blocked actions, invalid settings, and refresh-required recovery messages.</td>
    </tr>
    <tr>
      <td>Dark tooltip surface</td>
      <td><code>#121b3e</code></td>
      <td><span style="display:inline-block;width:72px;height:18px;background:#121b3e;border:1px solid #768591;"></span></td>
      <td>Tooltip backgrounds and dark inspector accents already used by existing components.</td>
    </tr>
  </tbody>
</table>

Do not introduce new status colors, such as green success tones, unless the project palette is explicitly expanded in this table and the related UI helpers are updated consistently.

---

### Toasts

Toast colors must be consistent across all scripts.

Use:

- Info, success, neutral completion, and safe-success messages: `#007EE3`.
- Errors, blocked actions, invalid settings, and refresh-required recovery messages: `#d9534f`.
- Toast text: `#FFFFFF`.

The semantic message type (`info`, `success`, `error`) may still be used for logs, duration, or flow meaning, but it must not introduce colors outside the project palette.

Every visible toast or user-facing recovery message must also be logged with the final rendered text:

```js
logDebug(2, `📢 Showing user message: "${finalText}" (${type})`);
```

Avoid false-positive success messages. Only show success when the action actually completed or when the flow has a documented safe-success condition.

---

### Buttons and Controls

Buttons should reuse the existing control palette:

- Primary button background: `#007EE3`.
- Hover or secondary accent: `#768591`.
- Light controls or icon backgrounds: `#F8F8F8`.
- Button text on colored backgrounds: `#FFFFFF`.

Icon-only controls should keep the same visual treatment used by the existing One-click and Image Inspector controls.

---

### Panels and Tables

Settings, Options, Peek, and Inspector panels should remain readable and utilitarian:

- Prefer light panel backgrounds already used by the extension, especially `#F8F8F8`.
- Use restrained borders and separators based on the existing gray/blue-gray palette.
- Tables should prioritize scanability: clear row separation, stable alignment, and no decorative color overload.
- Status or result tables should not introduce new color families unless the palette is formally expanded.

---

### Tooltips

Tooltips should use the existing dark surface style already present in the extension:

- Dark tooltip background: `#121b3e`.
- Light text: `#FFFFFF`.
- Compact padding and restrained border styling.
- No decorative color families outside the documented palette.

---

### Scope

This standard applies to:

- popup UI
- Options UI
- Settings Peek
- Image Inspector
- One-click overlay
- gallery and bulk toasts
- content-script recovery messages
- future user-facing panels, tables, tooltips, and injected controls

---

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

For `YAML-only` metadata files, use the same project-name-first format in the visible `name`, `title`, or equivalent display field when such a field exists. Issue title templates such as `[Bug]` or `[Docs]` may keep their operational prefix format.

This standard applies to root `documentation`, `manuals`, `guides`, `policies`, `changelogs`, `contribution` documents, and GitHub `issue` or `pull request` templates when practical.

---

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

- Keep changes `modular`, focused, and testable.
- Keep the `PR scope` aligned with the issue or approved discussion. Avoid unrelated refactors.
- Preserve existing `business rules` unless the issue explicitly requires changing them.
- **Do not alter**: URL validation, gallery heuristics, download naming rules, hotkey names, or browser behavior assumptions as side effects.
- `Handle errors` professionally with clear recovery paths.
- Report recoverable failures through `logs` and, when user action is needed, through user-facing messages (`toast`).
- `Continue operating` whenever safe. *Unhandled catastrophic failures are not acceptable*.
- **Avoid unnecessary**: CPU, memory, filesystem, tab-management, or batch-processing bottlenecks.
- `Rehydrate cached settings` only when the local snapshot is stale, incomplete, or required for the current flow.
- Keep `background refreshes` scoped to the settings required by that flow.
- Follow the `MV3 runtime resilience rules` for `content scripts`, `hotkeys`, `background handoffs`, and `long-lived tabs`.
- **Update relevant documentation** when: behavior, recovery paths, browser support, hotkeys, settings, or known limitations change.
- `Always run local validation` before opening or updating a `pull request`:

  ```bash
  npm run check
  npm test
  ```

### 🎯 Minimal Technical Footprint (Zero Over-Engineering)

- **Solve the actual problem**: Address the specific issue described, not hypothetical future scenarios or unreported edge cases.
- **Prefer surgical fixes**: Favor minimal, targeted changes over architectural rewrites unless the issue explicitly requires refactoring.
- **Avoid speculative abstractions**: Do not introduce state machines, event brokers, or wrapper layers to prevent theoretical edge cases that lack evidence.
- **Reject premature optimization**: Do not add caching, memoization, or lazy loading without profiling evidence of a bottleneck.
- **Measure before abstracting**: If a pattern appears in two places, solve both directly. Wait for three or more occurrences before creating a shared helper.
- **Document rejected approaches**: When closing a PR or branch due to over-engineering, archive the SHA in the issue for archaeological reference.

#### 🌍 Global Scope Fixes (80/20 Rule)

- **Solve globally, not locally**: Bug fixes and edge case solutions must work across all websites, frameworks, and CMSs (WordPress, Drupal, React, static sites, etc.)
- **Avoid CMS-specific selectors**: Do not hardcode CSS classes, HTML structures, or patterns specific to one framework or content management system
- **Prefer universal heuristics**: Use physical/mathematical approaches (bounding boxes, pointer coordinates, DOM traversal) over pattern-matching specific CMS implementations
- **CMS-agnostic validation**: If a solution only works for WordPress galleries, it's not a complete fix—it's a workaround that will fail on the next framework
- **Test the 80%**: Focus on solutions that cover 80% of real-world cases through universal principles, not 100% through brittle, site-specific rules

---

### 🩹 Bugfix Scope Discipline

Bugfix work follows the same `development standards`, `best practices`, `validation requirements`, and `branch flow` defined in this guide.

Bugfixes must use the repository flow:

```text
feature/chore/fix branch -> dev -> main -> tag/release
```

Bugfix work `must stay focused` on the confirmed defect and must not introduce unnecessary bottlenecks, broad refactors, or unrelated behavioral changes.

Before changing code:

- Identify the exact `failing behavior`.
- Identify the `expected behavior`.
- Identify the `affected flow`, `module`, and `trigger condition`.
- Confirm whether the issue is a `defect`, `browser limitation`, site-specific `edge case`, or `expected behavior`.
- Prefer the `smallest correction` that restores the expected behavior.

During implementation:

- Follow the `project code standards` and `development rules`.
- Keep the `correction scoped` to the `confirmed defect`.
- Do not `broaden` the fix into unrelated refactors or feature work.
- Do not `change` neighboring workflows unless the defect proves they share the same root cause.
- Do not `alter` `URL validation`, `gallery heuristics`, `naming rules`, `hotkey mappings`, `browser support` assumptions, or `UI behavior` as side effects.
- Preserve `existing successful flows` and `documented fallback behavior`.
- Avoid `adding new operational` bottlenecks unless they are required to correct the defect and are bounded, documented, and validated.
- Update `CHANGELOG.md` for every user-visible or behavior-relevant bugfix.

After implementation:

- Run the relevant validation commands.

```bash
npm run check
npm test
```

- Re-test the `failing scenario`.
- Re-test the `closest related flows` that could be affected.
- Record `residual limitations` or follow-up investigations separately instead of hiding them inside the bugfix.

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

This project encourages the responsible use of AI tools to assist development, but **all contributions remain subject to manual review** and project standards.

AI tools may assist in **code generation**, **documentation**, **formatting**, or **security best practices**. However, they are a support tool, not a substitute for developer expertise.

**Developer responsibilities when using AI tools:**

- Act as the **architect** of the solution — define the overall design, flow, and integration points.
- **Validate AI-generated code** against project standards, including JSDoc, logging, error handling, and visual consistency.
- **Test the generated code** in the supported browsers and confirm that **no regressions are introduced**.
- **Clearly disclose AI assistance** in the PR description, including which tool(s) were used and which parts of the code, documentation, or tests were AI‑assisted.

**Example disclosure:**
> This PR includes code generated with the assistance of [Tool Name] for the following parts: [specific functions or files]. The code was reviewed, validated, and integrated by the author. [Tool Name] was also used to format the documentation and generate test stubs.

**General guidelines:**

- Feel free to use AI tools to enhance your productivity.
- **Do not share proprietary or sensitive data** with AI tools when generating code or suggestions.
- **All contributions are reviewed manually** to ensure clarity, accuracy, performance, and compliance with the project's standards.

We support responsible and transparent use of AI to accelerate development, without compromising quality or authorship clarity.

---

## 💬 Need Help?

Feel free to [start a discussion](https://github.com/del-Pacifico/mass-image-downloader/discussions) or open an issue with your question. We’re happy to assist!

> Contributions with the project, of all kinds are welcome — from typo fixes to major features. Let’s build something great and useful together! 🚀
