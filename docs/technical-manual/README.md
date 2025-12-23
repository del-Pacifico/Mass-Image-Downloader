# 🏔️ Mass Image Downloader – Technical User Manual

**Version:** `v2.08.149`  
**Branch:** `main`  
**Status:** Active – Source of truth aligned with released and tested code

---

## 🧭 1. Introduction

This Technical User Manual provides a technical-operational view of **Mass Image Downloader**.

It is intended for users who already understand how to use the extension and want to understand **how it works internally**, how features interact, and how configuration options influence behavior — without modifying source code.

This document is strictly aligned with **version v2.08.149**.  
Any previous versions, behaviors, or references are considered deprecated and intentionally excluded.

---

## 🎯 1.1 Purpose of This Manual

The purpose of this manual is to:

- Explain internal feature flows at a technical level
- Describe how settings influence execution across features
- Clarify state handling and execution boundaries
- Enable effective troubleshooting without code changes
- Serve as a reliable reference for power users, QA, and integrators

---

## 👥 1.2 Intended Audience

This manual is intended for:

- Power users
- Technical users
- QA engineers and testers
- Integrators and reviewers familiar with browser-based tools

It is not intended for basic users or contributors modifying the codebase.

---

## 🧾 1.3 Version Scope and Source of Truth

This manual documents **only** the following scope:

- Extension version: **v2.08.149**
- Released and tested code from the `main` branch
- Features, settings, and behaviors present in this release

Any behavior not present in this version is considered out of scope.

---

## 📑 Table of Contents

- 🧭 1. Introduction
  - 🎯 1.1 Purpose of This Manual
  - 👥 1.2 Intended Audience
  - 🧾 1.3 Version Scope and Source of Truth

- 🧱 2. System Overview
  - 🧩 2.1 Main Components
  - 🔁 2.2 High-Level Event Flow
  - 📦 2.3 What Runs Where

- 🗃️ 3. State and Data Model
  - 💾 3.1 Persistent Settings
  - 🧠 3.2 In-Run Temporary State
  - 🚫 3.3 What Is Not Stored

- 🧩 4. Feature Flows
  - 📸 4.1 Bulk Image Download
  - 🌄 4.2 Extract Images from Galleries (With Direct Links)
  - 🖼️ 4.3 Extract Images from Galleries (Without Links)
  - 🔗 4.4 Extract Images from Web-Linked Galleries
  - 🔎 4.5 View Settings (Peek)
  - 🕵️ 4.6 Image Inspector
  - 🖱️ 4.7 One-click Download Icon

- ⚙️ 5. Settings Deep Dive
  - 🧪 5.1 Performance Presets
  - 📐 5.2 Global Image Size Filters
  - 🧾 5.3 Allowed Image Formats
  - 🔗 5.4 Extended Image URLs
  - 📁 5.5 Download Folder Selection
  - 🏷️ 5.6 Filename Customization
  - 📸 5.7 Bulk Image Download Options
  - 🖼️ 5.8 Gallery Options (Direct and Visual)
  - 🔗 5.9 Web-Linked Gallery Options
  - 🕵️ 5.10 Image Inspector Options
  - 🖱️ 5.11 One-click Download Icon Option
  - 📋 5.12 Clipboard Hotkeys Option
  - 🔎 5.13 Peek Panel Option
  - 📢 5.14 User Feedback Messages
  - 🐛 5.15 Console Log Level

- ⌨️ 6. Hotkeys and Commands Reference
  - 🖱️ 6.1 Alt+Shift+I — One-click Download Icon
  - 🕵️ 6.2 Ctrl+Shift+M — Image Inspector
  - 📋 6.3 Ctrl+Alt+P / Ctrl+Alt+S — Clipboard Prefix / Suffix
  - 🧩 6.4 Common Limitations and Conflicts

- 🩺 7. Troubleshooting Without Code Changes
  - 🚫 7.1 No Images Downloaded
  - 🎯 7.2 Unexpected Images Downloaded
  - 🟡 7.3 Processing Appears Stuck
  - 🔴 7.4 Error States and What to Collect
  - 📜 7.5 Using Log Level for Diagnosis

- ⚡ 8. Performance and Stability
  - 🧠 8.1 Concurrency vs Rate Limiting
  - 📦 8.2 Batch Size Guidance
  - 💻 8.3 Resource Impact (RAM / CPU)

- 🔒 9. Security and Privacy (Technical)
  - 🛡️ 9.1 Script Injection Boundaries
  - 🚫 9.2 No Persistent Download History
  - 🔐 9.3 Permissions Rationale

- 📎 10. Appendices
  - 📋 10.1 Settings Reference Table
  - 🏷️ 10.2 Badge States Reference
  - 🗂️ 10.3 Recommended Technical Presets
