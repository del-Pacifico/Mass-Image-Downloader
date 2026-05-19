# 🧭 Issue Templates Guide

This directory contains the **official issue templates** for **Mass Image Downloader**.  
Each template is designed to capture the *right level of detail* for a specific type of report, helping maintainers triage issues efficiently and respond accurately.

Please choose the template that best matches your situation.

---

## 🐞 Bug Report
**Use when:**  
You encounter a **reproducible problem** that breaks or degrades expected functionality.

**Examples:**
- Downloads fail or stop unexpectedly
- A feature no longer works as designed
- A regression (something that used to work)

**Template:** `bug_report.yml`

---

## 🚑 Hotfix (Production)
**Use when:**  
A **critical production issue** requires an immediate fix and fast release.

**Examples:**
- Core functionality broken for many users
- Data loss or corruption risk
- Severe regressions impacting production usage

**Template:** `hotfix.yml`

> ⚠️ Hotfixes are intentionally scoped for speed and safety.  
> Refactors, cleanups, and documentation updates are out of scope.

---

## 🧩 Edge Case Report
**Use when:**  
The behavior is **non-blocking**, but differs under specific conditions such as layout, DOM structure, or browser context.

**Examples:**
- Visual quirks or minor UX degradations
- Behavior that depends on responsive layouts or scroll containers
- Known limitations that do not break core flows

**Template:** `edge_case.yml`

---

## 🕵️ Investigation
**Use when:**  
The issue is **unclear, hard to reproduce, or not yet classified**.

This template is ideal when you need to gather evidence before deciding whether the issue is a:
- Bug
- Edge case
- Feature request
- Performance or stability concern

**Template:** `investigation.yml`

---

## ⚙️ Performance / Stability Report
**Use when:**  
You observe **performance degradation or stability issues** over time.

**Examples:**
- High memory or CPU usage
- UI slowdowns or browser freezes
- Issues related to MV3 service worker lifecycle
- Long-running sessions causing degradation

**Template:** `performance_stability.yml`

---

## 📚 Documentation Issue
**Use when:**  
You find problems in the documentation.

**Examples:**
- Typos or unclear wording
- Broken links or anchors
- Outdated instructions or version mismatches
- Missing or incomplete sections

**Template:** `documentation.yml`

---

## ✨ Feature Request
**Use when:**  
You want to propose a **new feature or enhancement**.

**Examples:**
- New extraction modes
- UX improvements
- Configuration options or presets
- Performance optimizations as a feature

**Template:** `feature_request.md`

---

## 🔒 Security Issues
**Do NOT open a public issue for security vulnerabilities.**

Please follow the instructions in our **Security Policy** instead:
- https://github.com/del-Pacifico/Mass-Image-Downloader/security/policy

---

## 💬 Questions & Open Discussions
For questions, ideas, or exploratory conversations that don’t yet translate into an actionable issue, please use **Discussions**:
- https://github.com/del-Pacifico/Mass-Image-Downloader/discussions

---

## 📝 General Notes
- Use **one issue per problem**.
- Choose the **most specific template available**.
- Clear, objective, and reproducible reports help everyone.
- Issues, Pull Requests, and Discussions must use descriptive labels from the repository label set.
- During triage, apply labels that describe:
  - `type:*` for classification
  - `scope:*` for the affected module or workflow
  - `priority:*` for scheduling weight
  - `needs:*` when information is missing
  - `status:*` or `dev:*` for lifecycle state
  - `behavior:*` when runtime behavior or compatibility impact is relevant
- Discussions should use the correct category and descriptive labels when available. If promoted to an issue, the new issue must be labeled before it is considered ready for planning.

Thank you for helping improve **Mass Image Downloader** 🚀
