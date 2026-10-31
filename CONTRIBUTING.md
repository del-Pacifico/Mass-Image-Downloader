# 🏔️ Mass Image Downloader – Contributing Guide

Thank you for your interest in contributing to **Mass Image Downloader**! This guide provides everything you need to know to start contributing effectively and collaboratively.

> ⚠️ **Note:** This project operates under a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

---

## 📋 Quick Navigation

- [🏁 Getting Started](#-getting-started)
- [🤝 How to Contribute (Channels & Flow)](#-how-to-contribute-channels--flow)
- [📝 Reporting & Proposing](#-reporting--proposing)
- [⚙️ Development Workflow](#️-development-workflow)
- [💻 Code & Architecture Standards](#-code--architecture-standards)
- [🎨 UI, Documentation & Formatting Standards](#-ui-documentation--formatting-standards)
- [✅ Validation & Support](#-validation--support)

---

## 🏁 Getting Started

### ✅ Pre-requisites

Before you start contributing, make sure you have:

- Node.js (LTS version recommended) and npm installed.
- A Chromium-based browser for local QA:
  - **Brave** (primary QA browser — preferred)
  - **Vivaldi, Microsoft Edge, or Opera One** (supported alternatives)
- Basic familiarity with Chrome Extension Manifest V3 architecture.
- Understanding of the project's [core philosophy](docs/philosophy.md) — required reading before your first contribution.

### 💻 Development Environment Setup

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/<your-user>/Mass-Image-Downloader.git
   # or via SSH: git clone git@github.com:<your-user>/Mass-Image-Downloader.git
   ```

3. **Add the upstream repository** and update `dev`:

   ```bash
   cd Mass-Image-Downloader
   git remote add upstream https://github.com/del-Pacifico/Mass-Image-Downloader.git
   git fetch upstream
   git checkout dev
   git pull --ff-only upstream dev
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Load in browser**: Go to `brave://extensions` → Enable Developer Mode → Load unpacked → Select the project root folder.

### 🎯 Project Philosophy

Mass Image Downloader is guided by seven core principles that shape every decision:

1. **Reliability Above All** — The extension keeps working under adverse conditions.
2. **Granular User Control** — Users have dozens of configurable options.
3. **Performance and Efficiency** — Minimal browser overhead.
4. **Security and Privacy** — Minimal permissions, no sensitive data storage.
5. **Transparency and Debuggability** — Four-level logging and clear user messages.
6. **Quality and Maintainability** — Strict modularity and exhaustive documentation.
7. **Open Collaboration and Ethics** — Transparent processes and peer review.

📖 Read the full philosophy in [`docs/philosophy.md`](docs/philosophy.md).

### 🗂️ Repository Structure

Familiarize yourself with the codebase layout:

```text
Mass-Image-Downloader/
 ├── .github/           # GitHub templates (CODEOWNERS, Issues, PR templates, etc.)
 ├── assets/            # Static assets (images, icons)
 ├── docs/              # Project documentation (philosophy, hotkeys, guides, roadmap)
 ├── html/              # HTML files (popup, options, content scripts)
 ├── ico/               # Icon files for the extension
 ├── scripts/           # Core extension logic (content scripts, background, helpers)
 ├── tests/             # Node.js compliance and unit tests
 ├── .gitignore         # Git ignore rules
 ├── CHANGELOG.md       # Release history
 ├── CODE_OF_CONDUCT.md # Community code of conduct
 ├── CONTRIBUTING.md    # Contribution guidelines (this file)
 ├── LICENSE            # License summary (MPL 2.0)
 ├── manifest.json      # Extension manifest (MV3)
 ├── package.json       # Node dependencies and scripts
 ├── README.md          # Project overview and quick start
 ├── SECURITY.md        # Security policy and vulnerability reporting
 └── VERSION            # Current version string
```

*Key rule: Keep modules focused — prefer 1 file = 1 concern.*

### 👥 Team Roles

| Role | GitHub Handle | Responsibility |
| --- | --- | --- |
| **Founder & Maintainer** | `sergiopalmah` | Project direction, roadmap, final PR approval, merges to `main`, release management. Sole code owner per `CODEOWNERS`. |
| **Senior Collaborator** | `agentsmid` | Code implementation, local QA (automated + manual), atomic commits and pushes. |
| **Community Contributors** | You! | Bug reports, feature proposals, documentation improvements, code contributions via PR. |

*Note: All contributions — regardless of source — are reviewed manually before merge. There are no automatic approvals.*

---

## 🤝 How to Contribute (Channels & Flow)

### 📌 Common Contribution Scenarios

- **"I want to report a bug"** → Use the `[Bug]` issue template.
- **"I want to suggest a feature"** → Open a GitHub Discussion first. Once scoped, it becomes a `[Feature]` issue.
- **"I want to fix a typo or docs"** → Create a `docs/*` PR directly to `dev`.
- **"I have a question"** → Use GitHub Discussions or the `[Question]` issue template.

### Choose the Right Channel

- **Use Discussions for:** Early ideas, open questions, design exploration, or support conversations. Once a discussion reaches a clear scope, it is promoted to an Issue.
- **Use Issues for:** Actionable bugs (confirmed and reproducible), approved feature requests, edge cases, investigations, and documentation problems.
- **Use Pull Requests only for:** Focused changes linked to an existing Issue or approved Discussion. PRs without a linked Issue/Discussion will be closed.

### 💪🏼 Browser Support and QA Baseline

**Mass Image Downloader** targets QA-validated Chromium-based browsers compatible with Manifest V3.

- **Brave:** Primary QA browser.
- **Vivaldi, Microsoft Edge, Opera One:** Supported and QA-tested (some shortcut conflicts may require manual assignment).

### ⛔ Browsers Outside the Current QA Baseline

🚨 **Attention:**

- **Google Chrome:** Not officially supported or QA-tested due to user-tracking practices conflicting with our privacy-by-design philosophy. It will most likely function, but any use is strictly **at your own risk and falls entirely outside our QA coverage and support scope**.
- **Firefox / Non-Chromium:** Out of scope (built for MV3 APIs).

---

## 📝 Reporting & Proposing

### 🌟 Suggest a Feature

1. Describe the `problem` or `workflow gap`.
2. Explain `who benefits` and in `which scenarios`.
3. Describe the `expected behavior` from a user perspective.
4. Identify the `affected area` (Popup, Options, Inspector, Bulk, Galleries, Hotkeys, etc.).
5. Note any `constraints` or `trade-offs` (MV3 limits, performance, privacy).
6. Open a GitHub Discussion first, then an Issue when actionable.

### 🐛 Report a Bug

1. Confirm you are using the expected `extension version`.
2. `Reproduce the behavior` in a clean, focused scenario.
3. Capture the environment: Browser/Chromium version, OS, extension version.
4. Capture the `relevant settings snapshot` (via Settings Peek).
5. Collect `eada`: Exact steps, expected vs. actual behavior, URL pattern, console logs filtered by `[Mass image downloader]`, and screenshots.
6. Open a `[Bug]` issue. *Use one issue per defect.*

#### 📝 Example: Good vs. Bad Bug Report

**✅ Good Issue:**

```text
[Bug] Web-linked Gallery opens user profile pages instead of gallery images on Reddit
Browser: Brave 1.69, Chromium 129
Extension: 2.8.187
Steps: 
1) Open Reddit gallery with default avatars
2) Run Alt+Shift+W
3) Observe 8 /user/ tabs open
Expected: Only image detail pages should open
Actual: Default avatar URLs (redditstatic.com/avatars/...) are admitted as candidates
Logs: [Mass image downloader]: ⛔ grouped 8 candidates under /user/...
```

**❌ Bad Issue:**

```text
[Bug] Web-linked gallery is broken
It doesn't work on Reddit. Please fix.
```

*Why it's bad: No version, no steps, no logs, no expected behavior. Cannot be triaged.*


### 🧩 Edge Cases

Edge cases are narrow, reproducible scenarios that affect a limited set of users, pages, or configurations (e.g., visual quirks, specific DOM structures).

- Use the `[EdgeCase]` prefix in the issue title.
- Provide the exact conditions needed to reproduce.
- Mark with `priority: low` or `priority: medium`.

#### 📝 Example: Good Edge Case Report

**✅ Good:**

```text
[EdgeCase] Inspector overlay offset on full-viewport images at 110% zoom
Browser: Edge 129
Condition: Image inside <figure> with CSS transform: scale(1.1)
Impact: Visual only — overlay appears 8px below the true top-right corner
Expected: Overlay anchored to image bounding rect
Actual: Overlay anchored to wrapper rect
```

### 🔐 Security Vulnerability Reporting

If you discover a security vulnerability, **do not open a public issue**. Report it privately via [GitHub Security Advisories](https://github.com/del-Pacifico/Mass-Image-Downloader/security/advisories/new) or contact the maintainer directly.

---

### 💬 How to Give Constructive Feedback

To keep the project predictable and respectful of everyone's time, please follow these guidelines when interacting with Issues, PRs, and Discussions:

- **For code (PR reviews):** Use the PR review comments. Be specific, point to the line, and explain *why* a change is needed based on the project's philosophy or standards.
- **For behavior/bugs:** Always quote the exact steps and console logs filtered by `[Mass image downloader]`. Avoid vague reports like "it doesn't work" or "something is broken".
- **For ideas:** Use GitHub Discussions first. Do not open an Issue to ask "Why don't you add feature X?" — that is an exploratory conversation, not an actionable defect.

**Good feedback:** "The overlay in `imageInspector.js` line 142 doesn't clear on window blur, which leaves a ghost panel on ArtStation lightboxes. Logs show the `mouseover` listener stays attached."

**Bad feedback:** "The inspector is buggy on some sites."

---

## ⚙️ Development Workflow

All development must follow this branch and release flow:
`feature/chore/fix branch` → `dev` → `main` → `tag/release`

### 🌿 Branch and Commit Conventions

**Branch Naming:** `<type>/<issue-number>-<short-description>`

- Types: `feature`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`
- Example: `fix/77-minimal-overlay-orphan`

**Commit Messages:** Follow Conventional Commits.

- Format: `<type>(<scope>): <description> (#<issue-number>)`
- Example: `fix(image-inspector): prevent orphaned overlays on blur (#77)`
- Rules: Present tense, imperative mood, no capitalization at start, no period at end.

#### 📝 Example: Good vs. Bad Commit & PR

**✅ Good commit:**

```text
fix(image-inspector): prevent orphaned overlays on blur (#77)
```

**✅ Good PR title:**

```text
fix(overlay): remove orphaned host on blur (#77)
```

**❌ Bad commit:**

```text
updated stuff and fixed some things
```

**❌ Bad PR title:**

```text
Fix inspector bug
```

> *Why it matters: `Conventional Commits` enable automated changelogs, clean `git log`, and fast triage. Vague titles force the maintainer to read the diff to understand scope.*

### 🥷🏼 Incremental Commit and Push Discipline

During active development, **each validated atomic change** must be committed and pushed to the current working branch as soon as it is complete.

- Keep the change scoped to the active issue/PR objective.
- Stage **only** the files that belong to the completed atomic change.
- Run local validation (`npm run check`, `npm test`) before committing.
- Push immediately. *Do not batch unrelated changes into a single commit.*

### 🏷️ Issue Title Prefixes & Labeling Rules

**Title Prefixes:** `[Bug]`, `[Investigation]`, `[EdgeCase]`, `[Enhancement]`, `[Docs]`, `[Chore]`, `[Question]`.

#### Label Taxonomy:

- **Work type:** `type: bug`, `type: feature`, `type: documentation`, `type: chore`, etc.
- **Affected area:** `scope: ui`, `scope: background`, `scope: gallery`, etc.
- **Priority/Lifecycle:** `priority: critical`, `priority: normal`, `status: backlog`, `status: in-progress`, `needs: triage`.

### 👀 Pull Request Review Process

1. A maintainer will review your PR, checking alignment with the linked Issue, code quality, behavior risks, and documentation updates.
2. You may receive comments or requests for changes. Address each with a focused commit.
3. Re-run local validation after making significant changes.
4. Once approved, the maintainer will merge the PR into `dev`, and it will be included in the next release (`dev` → `main` → `tag`).

### 🗓️ Release Planning

Planned work is tracked in [`docs/ROADMAP.md`](docs/ROADMAP.md). Before starting, check the Roadmap to see if the issue is scheduled. If not, open a Discussion first.

---

### ✅ Definition of Done

An Issue or PR is considered **ready for review** when:

- [ ] The change is scoped to a single confirmed defect or approved feature (per Bugfix Scope Discipline).
- [ ] `npm run check` and `npm test` pass locally.
- [ ] The CHANGELOG.md entry is drafted (for user-facing changes).
- [ ] Documentation is updated if behavior, options, or hotkeys changed.
- [ ] The PR description includes: linked Issue, summary, affected modules, and QA evidence (logs or screenshots).
- [ ] No unrelated refactors or "while I'm here" changes are mixed in.

---

## 💻 Code & Architecture Standards

### 📐 Code Standards

- Use JavaScript ES6+. **Do not add external libraries.**
- Keep modules focused: prefer 1 file = 1 concern.
- Add `JSDoc` or a concise header comment to every new/changed function.
- Keep logging consistent: `[Mass image downloader]: emoji + message`. Use `logDebug()` instead of `console.log()`.

### 🎯 Minimal Technical Footprint (Zero Over-Engineering)

- Solve the actual problem, not hypothetical future scenarios.
- Prefer surgical fixes over architectural rewrites.
- Avoid speculative abstractions (state machines, event brokers) without evidence.
- Reject premature optimization. Measure before abstracting.

### 🌍 Global Scope Fixes (80/20 Rule)

- Solve globally, not locally. Fixes must work across all websites, frameworks, and CMSs.
- Avoid CMS-specific selectors or hardcoded HTML structures.
- Prefer universal heuristics (bounding boxes, pointer coordinates) over pattern-matching.

### 🩹 Bugfix Scope Discipline

- Bugfix work must stay focused on the confirmed defect.
- Do not broaden the fix into unrelated refactors or feature work.
- Do not alter URL validation, gallery heuristics, naming rules, or hotkey mappings as side effects.

### 🧩 MV3 Runtime Resilience Rules

- Distinguish whether the entry point is background-owned or page-side.
- Assume long-lived tabs may contain content scripts injected before an extension reload (context may be invalidated).
- Handle `Extension context invalidated` explicitly. Provide a clear user-facing recovery path (e.g., asking the user to refresh the tab).
- Do not leave recoverable MV3 lifecycle failures as console-only errors.

### 🤖 AI-Assisted Contributions

AI tools may assist in code generation, documentation, or formatting, but all contributions remain subject to manual review.

- **Developer responsibilities:** Act as the architect, validate AI-generated code against project standards, test in supported browsers, and **clearly disclose AI assistance** in the PR description (e.g., "This PR includes code generated with the assistance of [Tool Name] for [specific functions]. The code was reviewed and validated by the author.").

#### 📝 Example: AI Disclosure in PR Description

```text
This PR includes code generated with the assistance of GitHub Copilot for:
- The `unwrapImageUrl()` helper in `scripts/utils.js`
- JSDoc comments in `scripts/bulk.js`

The code was reviewed, validated against project standards, and tested locally 
on Brave 1.69 and Edge 129 by the author.
```

---

## 📄 UI, Documentation & Formatting Standards

### 📐 UI Feedback and Visual Standards

The extension must keep a consistent visual language across all surfaces.

- **Core Palette:** Primary `#007EE3`, Secondary `#768591`, Light Surface `#F8F8F8`, Error `#d9534f`, Dark Tooltip `#121b3e`.
- **Toasts:** Info/Success = `#007EE3`, Errors/Recovery = `#d9534f`. Text = `#FFFFFF`.
- **Buttons & Controls:** Reuse existing control palette. No decorative color overload.

### 📚 Documentation Standards

- All project documentation should use a project-name-first visible title.
- First line of regular Markdown docs: `# 🏔️ Mass Image Downloader – <Document Title>`
- For YAML frontmatter, keep frontmatter first, place visible H1 immediately after `---`.

### 📏 Markdown Formatting Rules (CRITICAL)

All contributions to the repository (issues, comments, PRs, docs) must be written in Markdown. To ensure proper rendering across GitHub's interface:

- **Always close code blocks:** Every opening code block tag (e.g., ` ```javascript`, ` ```bash`, ` ```json`, ` ```text`) **must be properly closed** with its corresponding closing triple backticks (` ``` `). 

> ⚠️ Failing to close these tags *will break the Markdown layout for the entire post or issue*.

- Write in professional American English.
- Use emojis sparingly (allowed in titles/headers/logs, avoid in technical explanations).
- Quote relevant parts using blockquotes (`>`) when replying.

### 📜 License Header

Mass Image Downloader is licensed under the Mozilla Public License 2.0. Every source code file (`.js`, `.mjs`, `.html`) must include the following header at the top:

```javascript
// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.
// [filename] - Mass Image Downloader
```

---

### 🚫 Common Mistakes to Avoid

Based on past reviews, these are the most frequent issues that delay PR merges:

1. **Mixing fixes with refactors.** A bugfix PR must not include "while I'm here" cleanups. Split them.
2. **Skipping local validation.** PRs that fail `npm run check` or `npm test` are returned without review.
3. **Vague PR descriptions.** "Fixed the bug" is not enough. Link the Issue, describe scope, attach logs.
4. **Touching unrelated files.** If your PR touches `utils.js` but the Issue is about `popup.html`, explain why in the description.
5. **Forgetting the CHANGELOG.** User-facing changes without a CHANGELOG entry are not considered shipped.
6. **Opening Issues for questions.** Use GitHub Discussions first. Issues are for actionable work.

---

## ✅ Validation & Support

### 🧪 Local Validation

Run these checks before opening a pull request:

```bash
npm run check
npm test
```

- `npm run check` validates `manifest.json`, declared paths, version alignment, command limits, required permissions, and JS syntax.
- `npm test` runs the Node.js compliance tests used by CI.
*Important: Test results must be included as a comment in the associated Issue or PR.*

### 💬 Need Help?

- **For usage questions:** [GitHub Discussions](https://github.com/del-Pacifico/Mass-Image-Downloader/discussions)
- **For bug reports:** Use the `[Bug]` issue template.
- **For contribution help:** Comment on the issue or tag `@sergiopalmah`.

Contributions of all kinds are welcome — from typo fixes to major features. Let's build something great and useful together! 🚀
