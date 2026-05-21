# 🤝 Contributing Guide – Mass Image Downloader

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
2. Create a new branch from `dev`
   ```bash
   git checkout -b feature/your-description
   ```
3. Make your changes following the coding style and structure
4. Test your changes locally
   ```bash
   npm run check
   npm test
   ```
5. Submit a pull request using the [PR Template](.github/PULL_REQUEST_TEMPLATE.md)

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

- Use **JavaScript ES6+**
- No external libraries — all code must remain in pure JS
- Follow modular principles (1 file = 1 concern)
- Keep logging consistent: `[Mass image downloader]: emoji + message` (use `logDebug()` from `utils.js`)
- Comment blocks using clear, concise English

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

- Use JavaScript and browser-extension best practices for clear, maintainable code.
- Keep changes modular, focused, and testable.
- Handle errors professionally with clear recovery paths.
- Account for edge cases, report failures through logs or user-facing messages as appropriate, and continue operating whenever safe. Unhandled catastrophic failures are not acceptable.
- Avoid bottlenecks in CPU, memory, filesystem, and batch-processing paths.
- Write code comments, logs, and user-facing messages in professional, approachable English.

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
