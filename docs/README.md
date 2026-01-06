# 🏔️ Mass Image Downloader – Documentation Hub v2.08.149

**Version:** `v2.08.149`  
**Branch:** `main`  
**Status**: `Documentation entry point and navigation guide`

---

## 📘 Welcome to the Documentation

This directory contains the **complete documentation set** for **Mass Image Downloader**.

Each document serves a **distinct purpose** and is written for a **specific type of reader or goal**.  
This file acts as the **entry point and launcher**, allowing direct navigation to the correct document.

---

## 📑 Table of Contents

- [📘 Welcome to the Documentation](#-welcome-to-the-documentation)
- [🧭 How the Documentation Is Organized](#-how-the-documentation-is-organized)
- [📚 Available Documents](#-available-documents)
  - [👤 User Manual (Basic)](#-user-manual-basic)
  - [⚙️ Configuration Guides](#-configuration-guides)
  - [🧠 Technical User Manual](#-technical-user-manual)
  - [⌨️ Hotkeys & Keyboard Shortcuts Policy](#-hotkeys--keyboard-shortcuts-policy)
  - [🏔️ Advanced Manual](#-advanced-manual)
- [🧭 Which Document Should I Read First?](#-which-document-should-i-read-first)
- [🗂️ Backlog & Development Flow](#-backlog--development-flow)
- [🧾 Version Scope and Consistency](#-version-scope-and-consistency)
- [🧭 Final Guidance](#-final-guidance)

---

## 🧭 How the Documentation Is Organized

The documentation is intentionally split into **independent manuals**, each answering a different question:

- *How do I use it?*
- *How do I configure it?*
- *How does it work internally?*
- *Why was it designed this way?*

Each document is self-contained and avoids overlap.

---

## 📚 Available Documents

### 👤 User Manual (Basic)

**Purpose:**  
Learn how to use the extension from a user perspective.

**Read this if:**
- You are new to Mass Image Downloader
- You want to understand available features
- You need basic usage instructions

📄 **Open document:**  
➡️ [User Manual (Basic)](https://github.com/del-Pacifico/Mass-Image-Downloader/blob/main/docs/user-manual/README.md)

---

### ⚙️ Configuration Guides

**Purpose:**  
Configure the extension to achieve **specific, real-world results** using step-by-step instructions.

**Read this if:**
- You want recommended settings for a specific scenario
- You need predictable, reproducible behavior
- You are tuning performance or stability
- You are troubleshooting configuration issues

📄 **Open document:**  
➡️ [Configuration Guides](https://github.com/del-Pacifico/Mass-Image-Downloader/blob/main/docs/configuration-guides/configuration-guides.md)

---

### 🧑‍🔧 Technical User Manual

**Purpose:**  
Explain **how the extension works internally**, including execution flow, state handling, and feature interaction.

**Read this if:**
- You want to understand internal behavior
- You are debugging unexpected outcomes
- You are reviewing technical design choices
- You plan to contribute or extend the project

📄 **Open document:**  
➡️ [Technical User Manual](https://github.com/del-Pacifico/Mass-Image-Downloader/blob/main/docs/technical-manual/README.md)

---

## ⌨️ Hotkeys & Keyboard Shortcuts Policy

This section defines the **official keyboard shortcut policy** for Mass Image Downloader.

It documents:
- Reserved hotkeys that must remain unchanged
- Rules and constraints for introducing new shortcuts
- Conflict avoidance strategies across Chromium browsers
- Fallback behavior when hotkeys are unavailable

👉 **Source of truth:**  
- **[Hotkey Policy](hotkeys/hotkeys.md)**

---

### 👨🏻‍💻 Advanced Manual

**Purpose:**  
Explain **why the system behaves the way it does**, covering design rationale, trade-offs, boundaries, and edge cases.

**Read this if:**
- You want to understand non-obvious behavior
- You are evaluating design decisions
- You are assessing feasibility of changes or feature requests
- You are returning to the project after time away

📄 **Open document:**  
➡️ [Advanced Manual](https://github.com/del-Pacifico/Mass-Image-Downloader/blob/main/docs/advanced-manual/README.md)

---

## 🧭 Which Document Should I Read First?

Use this quick guide:

- **First-time user** → [User Manual (Basic)](https://github.com/del-Pacifico/Mass-Image-Downloader/blob/main/docs/user-manual/README.md)
- **Want to configure something specific** → [Configuration Guides](https://github.com/del-Pacifico/Mass-Image-Downloader/blob/main/docs/configuration-guides/configuration-guides.md)
- **Want to understand internals** → [Technical User Manual](https://github.com/del-Pacifico/Mass-Image-Downloader/blob/main/docs/technical-manual/README.md)
- **Want to understand design decisions and limits** → [Advanced Manual](https://github.com/del-Pacifico/Mass-Image-Downloader/blob/main/docs/advanced-manual/README.md)

---

## 🧭 Backlog & Development Flow

This repository follows a clear separation between **ideas**, **planned work**, and **execution**.

### 💡 Ideas & Early Proposals
- **Location:** GitHub Discussions
- Used for:
  - Early ideas and brainstorming
  - Open-ended proposals
  - Design questions and feedback
- Discussions are exploratory and **do not represent commitments**.

> Ideas may be promoted to Issues once they are clear and actionable.

---

### 🗂️ Development Backlog
- **Location:** GitHub Issues
- The backlog consists of Issues labeled with:
  - `type:*` (classification)
  - optional `priority:*`
  - and without a final resolution status

> Issues represent **actionable work** that can be scheduled and implemented.

---

### 🚧 Work in Progress
- **Location:** GitHub Issues + Pull Requests
- An Issue enters active development when:
  - It is assigned or explicitly picked up
  - A related Pull Request is opened

> Pull Requests are the unit of execution and must reference their corresponding Issue.

---

### 📦 Delivered Work
- **Location:** Merged Pull Requests + `CHANGELOG.md`
- A change is considered delivered when:
  - The Pull Request is merged
  - The change is documented in the changelog (for user-facing behavior)

> If a change is not in the changelog, it is not considered officially shipped.

---

> This structure helps keep the project predictable, transparent, and easy to maintain.

---

## 🧾 Version Scope and Consistency

All documents in this directory apply strictly to:

- **Extension version:** `v2.08.149`
- **Branch:** `main`

If observed behavior differs from the documentation:
- Verify the extension version
- Confirm you are on the correct branch
- Check whether experimental or deprecated settings are enabled

---

## 🧭 Final Guidance

Mass Image Downloader is designed to be:
- Predictable
- Explicit
- User-controlled
- Stable under real-world conditions

The documentation reflects these principles.

Choose the document that matches your goal, and you will find **clear boundaries, explicit guidance, and no hidden assumptions**.

---

Thank you for using **Mass Image Downloader**.

This Documentation entry point and navigation guide is part of an ongoing documentation effort and may evolve as the extension grows.

Made with ❤️ by **Del-Pacifico**
