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

> It is not intended for basic users or contributors modifying the codebase.

---

## 🧾 1.3 Version Scope and Source of Truth

This manual documents **only** the following scope:

- Extension version: **v2.08.149**
- Released and tested code from the `main` branch
- Features, settings, and behaviors present in this release

> Any behavior not present in this version is considered out of scope.

---

## 📑 Table of Contents

- [🧭 1. Introduction](#-1-introduction)
  - [🎯 1.1 Purpose of This Manual](#-11-purpose-of-this-manual)
  - [👥 1.2 Intended Audience](#-12-intended-audience)
  - [🧾 1.3 Version Scope and Source of Truth](#-13-version-scope-and-source-of-truth)

- [🧱 2. System Overview](#-2-system-overview)
  - [🧩 2.1 Main Components](#-21-main-components)
  - [🔁 2.2 High-Level Event Flow](#-22-high-level-event-flow)
  - [📦 2.3 What Runs Where](#-23-what-runs-where)

- [🗃️ 3. State and Data Model](#-3-state-and-data-model)
  - [💾 3.1 Persistent Settings](#-31-persistent-settings)
  - [🧠 3.2 In-Run Temporary State](#-32-in-run-temporary-state)
  - [🚫 3.3 What Is Not Stored](#-33-what-is-not-stored)

- [🧩 4. Feature Flows](#-4-feature-flows)
  - [📸 4.1 Bulk Image Download](#-41-bulk-image-download)
  - [🌄 4.2 Extract Images from Galleries (With Direct Links)](#-42-extract-images-from-galleries-with-direct-links)
  - [🖼️ 4.3 Extract Images from Galleries (Without Links)](#-43-extract-images-from-galleries-without-links)
  - [🔗 4.4 Extract Images from Web-Linked Galleries](#-44-extract-images-from-web-linked-galleries)
  - [🔎 4.5 View Settings (Peek)](#-45-view-settings-peek)
  - [🕵️ 4.6 Image Inspector](#-46-image-inspector)
  - [🖱️ 4.7 One-click Download Icon](#-47-one-click-download-icon)

- [⚙️ 5. Settings Deep Dive](#-5-settings-deep-dive)
  - [🧪 5.1 Performance Presets](#-51-performance-presets)
  - [📐 5.2 Global Image Size Filters](#-52-global-image-size-filters)
  - [🧾 5.3 Allowed Image Formats](#-53-allowed-image-formats)
  - [🔗 5.4 Extended Image URLs](#-54-extended-image-urls)
  - [📁 5.5 Download Folder Selection](#-55-download-folder-selection)
  - [🏷️ 5.6 Filename Customization](#-56-filename-customization)
  - [📸 5.7 Bulk Image Download Options](#-57-bulk-image-download-options)
  - [🖼️ 5.8 Gallery Options (Direct and Visual)](#-58-gallery-options-direct-and-visual)
  - [🔗 5.9 Web-Linked Gallery Options](#-59-web-linked-gallery-options)
  - [🕵️ 5.10 Image Inspector Options](#-510-image-inspector-options)
  - [🖱️ 5.11 One-click Download Icon Option](#-511-one-click-download-icon-option)
  - [📋 5.12 Clipboard Hotkeys Option](#-512-clipboard-hotkeys-option)
  - [🔎 5.13 Peek Panel Option](#-513-peek-panel-option)
  - [📢 5.14 User Feedback Messages](#-514-user-feedback-messages)
  - [🐛 5.15 Console Log Level](#-515-console-log-level)

- [⌨️ 6. Hotkeys and Commands Reference](#-6-hotkeys-and-commands-reference)
  - [🖱️ 6.1 Alt+Shift+I — One-click Download Icon](#-61-altshifti--one-click-download-icon)
  - [🕵️ 6.2 Ctrl+Shift+M — Image Inspector](#-62-ctrlshiftm--image-inspector)
  - [📋 6.3 Ctrl+Alt+P / Ctrl+Alt+S — Clipboard Prefix / Suffix](#-63-ctrlaltp--ctrlalts--clipboard-prefix--suffix)
  - [🧩 6.4 Common Limitations and Conflicts](#-64-common-limitations-and-conflicts)

- [🩺 7. Troubleshooting Without Code Changes](#-7-troubleshooting-without-code-changes)
  - [🚫 7.1 No Images Downloaded](#-71-no-images-downloaded)
  - [🎯 7.2 Unexpected Images Downloaded](#-72-unexpected-images-downloaded)
  - [🟡 7.3 Processing Appears Stuck](#-73-processing-appears-stuck)
  - [🔴 7.4 Error States and What to Collect](#-74-error-states-and-what-to-collect)
  - [📜 7.5 Using Log Level for Diagnosis](#-75-using-log-level-for-diagnosis)

- [⚡ 8. Performance and Stability](#-8-performance-and-stability)
  - [🧠 8.1 Concurrency vs Rate Limiting](#-81-concurrency-vs-rate-limiting)
  - [📦 8.2 Batch Size Guidance](#-82-batch-size-guidance)
  - [💻 8.3 Resource Impact (RAM / CPU)](#-83-resource-impact-ram--cpu)

- [🔒 9. Security and Privacy (Technical)](#-9-security-and-privacy-technical)
  - [🛡️ 9.1 Script Injection Boundaries](#-91-script-injection-boundaries)
  - [🚫 9.2 No Persistent Download History](#-92-no-persistent-download-history)
  - [🔐 9.3 Permissions Rationale](#-93-permissions-rationale)

- [📎 10. Appendices](#-10-appendices)
  - [📋 10.1 Settings Reference Table](#-101-settings-reference-table)
  - [🏷️ 10.2 Badge States Reference](#-102-badge-states-reference)
  - [🗂️ 10.3 Recommended Technical Presets](#-103-recommended-technical-presets)

---

## 🧱 2. System Overview

This section provides a **technical overview of how Mass Image Downloader is structured and operates internally**.

The goal is to help technical users understand **how components interact**, **where logic runs**, and **how actions flow through the system**, without diving into source code.

---

### 🧩 2.1 Main Components

Mass Image Downloader is composed of several clearly separated components, each with a specific responsibility.

**Popup**
- Acts as the user entry point
- Triggers features explicitly selected by the user
- Does not perform heavy logic or long-running operations

**Options Page**
- Provides configuration and feature enablement
- Stores persistent settings using browser storage
- Does not trigger downloads directly

**Content Scripts**
- Execute in the context of web pages
- Analyze page structure, images, and DOM
- Inject overlays when required (Image Inspector, One-click icon)
- Never persist data beyond the current execution

**Background / Service Worker**
- Orchestrates all download-related operations
- Applies global rules and filters
- Manages batching, concurrency, and flow control
- Controls badge state and lifecycle
- Cleans up state after each execution

> Each component is isolated by design to reduce side effects and improve stability.

---

### 🔁 2.2 High-Level Event Flow

At a high level, all operations follow the same execution pattern:

1. The user initiates an action (popup, hotkey, or UI interaction)
2. A message is sent to the background layer
3. The background validates the request and loads current settings
4. Content scripts are engaged if page analysis is required
5. Image candidates are filtered and validated
6. Downloads are executed under controlled limits
7. Visual feedback (badge and messages) is updated
8. Temporary state is cleared once the process ends

> No automatic or background-triggered actions occur without explicit user input.

---

### 📦 2.3 What Runs Where

Understanding **where logic runs** is key to troubleshooting and configuration.

**Runs in the Popup**
- User interaction handling
- Feature selection
- Lightweight validation

**Runs in Content Scripts**
- DOM inspection
- Image detection and qualification
- Overlay rendering
- Page-specific logic

**Runs in the Background**
- Download execution
- Batch and rate control
- State tracking during execution
- Badge updates and cleanup
- Error handling and recovery

This separation ensures that:
- Page analysis remains fast and contextual
- Downloads remain reliable and controlled
- UI remains responsive

> The system favors **stateless, execution-scoped logic** over persistent background activity.

---

## 🗃️ 3. State and Data Model

This section explains **how Mass Image Downloader manages state and data** during execution.

Understanding what is stored, where it is stored, and for how long is essential for:
- Predictable behavior
- Correct configuration
- Reliable troubleshooting

> The extension is designed to minimize persistence and favor **execution-scoped state**.

---

### 💾 3.1 Persistent Settings

Persistent settings are stored using the browser storage API and survive:
- Browser restarts
- Extension reloads
- System reboots

> These settings represent **user intent and configuration**, not runtime data.

Examples of persistent settings include:
- Enabled features (e.g. Image Inspector, One-click icon)
- Image size thresholds
- Allowed image formats
- Gallery and bulk limits
- Performance presets
- Filename customization rules

Persistent settings are:
- Read at the start of each operation
- Never modified implicitly by runtime behavior
- Only changed through the Options page

> No historical execution data is stored alongside settings.

---

### 🧠 3.2 In-Run Temporary State

During an active operation, the extension maintains **temporary in-memory state**.

This state exists only for the duration of the current execution flow and is used to:
- Track images already processed in the current run
- Prevent duplicate downloads within the same operation
- Coordinate batching and concurrency
- Maintain progress counters for badge updates

Characteristics of temporary state:
- Exists only while a feature is running
- Is cleared immediately after completion or failure
- Is never written to persistent storage

> Each execution starts with a clean temporary state, regardless of previous runs.

---

### 🚫 3.3 What Is Not Stored

To preserve privacy and reduce complexity, Mass Image Downloader explicitly avoids storing:

- Download history
- Image URLs from past runs
- Page URLs previously visited
- Per-site behavior profiles
- User activity timelines

> The extension does not attempt to “remember” previous executions.

This design ensures:
- No long-term tracking
- No accumulation of usage data
- Fully isolated and repeatable runs

> Every operation is treated as an independent, stateless execution.
