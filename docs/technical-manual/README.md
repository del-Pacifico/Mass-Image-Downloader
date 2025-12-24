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

---

## 🧩 4. Feature Flows

This section describes **how each major feature operates internally**, focusing on execution flow, decision points, and interactions between components.

Each feature is explained independently, but all of them follow the same core principles:
- Explicit user-triggered execution
- Centralized orchestration in the background layer
- Temporary, execution-scoped state
- Consistent application of global rules and filters

---

### 📸 4.1 Bulk Image Download

Bulk Image Download is designed to process **multiple open tabs that already display images directly**.

This feature does not analyze page structure. Instead, it operates on the assumption that:
- Each target tab represents a single image
- The image is already loaded or accessible in the tab context

---

#### 🚀 4.1.1 Trigger and Preconditions

The flow starts when the user selects **Bulk Image Download** from the popup.

Preconditions:
- At least one browser tab is open
- Target tabs contain direct image content (not HTML pages)
- The extension has permission to access the active window tabs

Before processing begins, the background layer:
- Loads current persistent settings
- Initializes a clean temporary state
- Resets badge counters and visual feedback

---

#### 🔎 4.1.2 Selection and Validation Rules

For each candidate tab, the background process applies validation rules:

- The URL must resolve to a supported image format
- The image must meet minimum width and height thresholds
- Extended image URLs are normalized if enabled
- Previously processed images within the same run are skipped

> Tabs that fail validation are ignored without stopping the overall process.

---

#### 📥 4.1.3 Download and Tab Handling

Validated images are downloaded using controlled batching.

Key behaviors:
- Downloads are grouped according to the configured batch size
- Concurrency limits are enforced to prevent browser overload
- Optional automatic tab closing is applied after successful download

If a download fails:
- The error is recorded in the current execution context
- The process continues with remaining tabs

---

#### 🏷️ 4.1.4 Badge and Feedback Behavior

During Bulk Image Download:
- 🟢 Green badge indicates active processing
- The badge counter reflects progress
- 🔵 Blue badge is shown when all tabs are processed

On partial failures:
- Errors are reported via user feedback messages
- The badge still transitions to completion if the flow finishes

> No badge state persists after the operation ends.

---

### 🌄 4.2 Extract Images from Galleries (With Direct Links)

This feature targets galleries where **thumbnail elements link directly to image files**.

Unlike Bulk Image Download, this flow analyzes page structure to discover image links, but it does **not** need to open additional pages.

---

#### 🔗 4.2.1 Link-Based Extraction Logic

The flow starts when the user selects **Extract Images from Galleries (With Direct Links)**.

The content script:
- Scans the page for anchor (`<a>`) elements
- Identifies links pointing directly to image resources
- Normalizes URLs when extended image URLs are enabled

> Only links that resolve directly to image files are considered.

---

#### 🎛️ 4.2.2 Filtering and Qualification Rules

Before an image is accepted, the following checks are applied:

- File extension matches an allowed image format
- Image dimensions meet minimum width and height thresholds
- Duplicate URLs within the same execution are skipped
- Similarity grouping rules are applied if enabled

These rules ensure that:
- Thumbnails and decorative images are ignored
- Only meaningful gallery images are processed

---

#### 🧠 4.2.3 Background Orchestration

Once candidate image URLs are collected, control is handed to the background layer.

The background process:
- Applies global and gallery-specific limits
- Enforces rate limits and concurrency rules
- Tracks per-run processed images
- Updates badge state and progress counters

> The gallery is treated as a single logical execution unit.

---

#### 🏷️ 4.2.4 Completion and Feedback

During execution:
- 🟢 Green badge indicates active extraction
- The badge counter reflects processed images

On completion:
- 🔵 Blue badge indicates a successful finish
- Temporary state is discarded

If no valid images are found:
- The process exits cleanly
- No downloads occur
- Informational feedback may be shown to the user

---

### 🖼️ 4.3 Extract Images from Galleries (Without Links)

This feature targets **visual galleries** where images are displayed directly on the page and **do not link to image files**.

In this flow, the extension relies on **DOM inspection and visual qualification**, rather than link traversal.

---

#### 👁️ 4.3.1 Visual Detection Logic

The flow starts when the user selects **Extract Images from Galleries (Without Links)**.

The content script:
- Scans the DOM for `<img>` elements
- Evaluates only images that are visible and fully loaded
- Ignores images that are likely decorative (icons, UI assets)

> No navigation or page opening is performed in this mode.

---

#### 🎯 4.3.2 Image Qualification Rules

Each detected image is validated using the following criteria:

- Minimum width and height thresholds
- Allowed image formats
- Extended image URL normalization (if enabled)
- Duplicate detection within the same execution

> Images that do not meet all criteria are excluded silently.

---

#### 🧠 4.3.3 Similarity Grouping and Selection

When enabled, similarity grouping is applied to reduce noise.

This logic:
- Groups images based on structural and path similarity
- Requires a minimum group size to qualify as a gallery
- Optionally applies fallback grouping when patterns are inconsistent

> Only images belonging to a qualified group are passed to the download phase.

---

#### 🏷️ 4.3.4 Execution and Feedback

Once images are selected:
- The background layer enforces gallery limits and rate controls
- Downloads are executed in a controlled sequence
- 🟢 Green badge indicates active processing
- 🔵 Blue badge indicates completion

If no qualifying images are found:
- The process exits without error
- No downloads occur
- Temporary state is cleared immediately

---

### 🔗 4.4 Extract Images from Web-Linked Galleries

This feature targets galleries where **thumbnails link to HTML pages**, and the actual images are embedded inside those pages.

In this flow, the extension must **navigate linked pages**, identify the best image available, **inject a download icon over that image**, and then complete the download process.

---

#### 🧭 4.4.1 Page-Opening Strategy

The flow starts when the user selects **Extract Images from Web-Linked Galleries**.

The content script:
- Scans the gallery page for anchor (`<a>`) elements
- Filters links that point to HTML pages (not direct image files)
- Builds a list of candidate page URLs

The background layer then:
- Opens linked pages in background tabs
- Applies a controlled fan-out strategy
- Ensures the original gallery page remains unaffected

> Pages are opened only as part of the active execution and are never reused.

---

#### ⏱️ 4.4.2 Concurrency and Delay Control

To protect browser stability and avoid site throttling, this flow applies strict controls:

- A maximum number of tabs can be opened concurrently
- A configurable delay is applied between tab openings
- Limits are enforced globally for the duration of the run

If limits are reached:
- Remaining pages are queued
- Processing resumes as tabs complete and close

> This ensures predictable behavior even on large galleries.

---

#### 🖼️ 4.4.3 Image Detection and Download Icon Injection

Once a linked page is fully loaded, the content script:

- Scans the page for image candidates
- Applies size, format, and resolution validation
- Selects the best image available on the page
- **Injects a visible download icon directly over the selected image** (💾)

This injected icon:
- Is part of the extension package
- Is scoped only to the current page
- Allows a clear visual confirmation of the selected image
- Acts as the trigger for the download action

> The icon is injected only during the active execution and is removed when the page is closed.

---

#### 📥 4.4.4 Download Trigger and Background Handling

When the download icon is activated:

- A message is sent to the background layer
- Global rules and filename settings are applied
- The image is downloaded under controlled limits

> Only one image per linked page is downloaded.

---

#### 🏷️ 4.4.5 Execution, Cleanup, and Feedback

During execution:
- 🟢 Green badge indicates active processing
- The badge counter reflects completed page extractions

After a successful download:
- The temporary tab is closed automatically
- Injected UI elements are removed
- Temporary state for that page is cleared

On completion:
- 🔵 Blue badge indicates a clean finish
- All temporary tabs are closed
- No execution state is retained

If no valid images are found on a page:
- No icon is injected
- The page is closed
- Processing continues with remaining links

---

#### ⚙️ 4.4.6 One-click Download Icon Options and Behavior

The behavior of the injected download icon is controlled by the **One-click Download Icon** settings.

> This feature is **disabled by default** and only becomes active when explicitly enabled by the user.

##### Enable One-click download icon (via hotkey)

When this option is enabled:

- The extension listens for the **Alt+Shift+I** keyboard shortcut
- Pressing the shortcut triggers image analysis on the current page
- If a valid image is detected, the download icon is injected over it (💾)

If this option is disabled:
- The hotkey has no effect
- No icon is injected
- The page remains untouched

---

##### Image Eligibility Rules

The download icon is injected **only if all standard validation rules are met**:

- The image meets the minimum width and height thresholds
- The image format is allowed
- Extended image URLs are normalized if enabled
- The image is not considered decorative or low-value

If no image meets these criteria:
- No icon is injected
- No background download is triggered

---

##### Scope and Lifetime of the Icon

The injected icon (💾):

- Exists only on the current page
- Is removed when the page is closed or reloaded
- Does not persist across navigations
- Does not modify the underlying image or page content

> The icon is purely a **temporary interaction overlay**.

---

##### Relationship with Web-Linked Gallery Flow

In the **Web-Linked Galleries** feature:

- The same icon injection logic is reused
- Each opened page is treated independently
- Only one icon (and one image) is processed per page

> This ensures consistency between manual one-click usage and automated gallery extraction.

---

### 🔎 4.5 View Settings (Peek)

View Settings (Peek) provides a **read-only, lightweight view of the current effective configuration**.

Its purpose is to allow technical users to **quickly verify active settings** without navigating to the full Options page or interrupting an ongoing workflow.

---

#### 👁️ 4.5.1 What Peek Shows

Peek displays a **read-only snapshot** of the current configuration stored by the extension and currently available at runtime.

The UI is organized into grouped sections and includes:

- **📁 File system**
  - Download folder mode (default vs custom)
  - Custom folder path (if configured)
  - Filename mode (prefix / suffix / both / timestamp)
  - Current prefix and suffix values
  - Allowed formats (toggles), including:
  - JPG, JPEG, PNG, WEBP, AVIF, BMP

- **🐦 Allow extended image URLs**
  - Whether extended image URL variants are allowed (for example, platform-specific variants like `:large` / `:orig`)

- **📋 Clipboard Hotkeys**
  - Clipboard hotkeys enablement
  - One-click Download Icon enablement (feature flag visibility inside Peek)

- **🕵️ Image Inspector Mode**
  - Image Inspector enablement
  - Toggle hotkey (displayed as a read-only value in Peek)
  - Developer Mode toggle
  - Close-on-save toggle (when applicable)

- **🖼️ Galleries**
  - Similarity level (threshold)
  - Minimum group size
  - Smart grouping toggle
  - Fallback grouping toggle
  - Extract gallery mode (when applicable)
  - Gallery max images rate/limit value (as displayed in Peek)

- **📐 Image size**
  - Minimum width
  - Minimum height

- **📢 Notifications**
  - User feedback messages toggle
  - Peek panel transparency level

- **🐛 Debugging**
  - Console log level (debug verbosity)

- **📸 Download in tabs**
  - Max bulk batch size
  - Continue from last batch toggle

- **🔗 Web-Linked Gallery**
  - Max open tabs (concurrency limit)
  - Linked gallery delay (milliseconds)

- **⚙️ Performance Preset**
  - Current preset value (as stored in settings)

Additionally, Peek includes:
- A **“📋 Copy as JSON”** button to copy the full settings snapshot to the clipboard
- The **extension version** shown in the footer

Peek also supports live refresh behavior:
- If settings change while Peek is open, the displayed values update automatically (read-only).

---

#### 🧠 4.5.2 Read-Only and Non-Intrusive Design

Peek is intentionally designed as:

- Read-only
- Non-editable
- Non-blocking

This means:
- No settings can be changed from Peek
- No execution state is modified
- No downloads or background actions are triggered

> Peek does not write to storage and does not alter runtime behavior.

---

#### 🎚️ 4.5.3 Transparency and Visibility Controls

The Peek panel supports a configurable transparency level.

This allows users to:
- Inspect settings while still seeing the underlying page
- Adjust readability without losing page context

> Transparency affects only the visual presentation and has no impact on logic or performance.

---

#### 🧭 4.5.4 When to Use Peek

Peek is especially useful when:

- Verifying configuration before starting a large operation
- Confirming which settings are active after switching presets
- Diagnosing why a feature behaves differently than expected
- Preparing accurate bug reports or support questions

> Peek acts as a **technical confirmation tool**, bridging the gap between UI configuration and runtime behavior.

---

### 🕵️ 4.6 Image Inspector

Image Inspector is a **manual, image-focused inspection and download tool** designed for precision use cases.

Unlike automated gallery or bulk flows, Image Inspector allows the user to **explicitly inspect, validate, and download a single image** directly from the page.

---

#### 🧷 4.6.1 Activation and Overlay Behavior

Image Inspector is activated when the feature is enabled in Settings and the user presses the associated hotkey (Ctrl+Shift+M).

Once active:

- The extension enters an inspection mode scoped to the current page
- Hovering over images highlights eligible candidates
- Only images that pass standard validation rules are considered

The overlay:
- Is injected dynamically
- Does not alter the underlying page content
- Is removed when the mode is exited or the page changes

> Image Inspector never runs automatically and requires explicit user action.

---

#### 🔍 4.6.2 Image Qualification and Metadata Display

For each inspected image, the overlay evaluates and may display:

- Image resolution (width × height)
- File format
- Source URL (normalized if extended URLs are enabled)
- Whether the image meets minimum size requirements

When **Developer Mode** is enabled, additional technical metadata may be shown to assist debugging and verification.

> This information allows users to confirm that the selected image is the intended target before downloading.

---

#### 📥 4.6.3 Download Action and Optional Auto-Close

When the user confirms the download action:

- A message is sent to the background layer
- Global filename and folder rules are applied
- The image is downloaded under standard constraints

If the **Close page after saving image** option is enabled:
- The current tab is closed automatically after a successful download

If disabled:
- The page remains open
- No additional actions are taken

---

#### 🏷️ 4.6.4 Badge and Feedback Behavior

During Image Inspector operations:

- 🟢 Green badge indicates an active download
- The badge counter may reflect the single download event
- 🔵 Blue badge indicates completion

If an image does not qualify:
- No download occurs
- Informational feedback may be shown
- No badge state is persisted

> Image Inspector operations are fully isolated from other features and do not reuse execution state.

---

### 🖱️ 4.7 One-click Download Icon

The One-click Download Icon feature provides a **fast, keyboard-driven way to download the best image on the current page**.

It is designed for situations where the user wants a quick action without entering Image Inspector mode or running gallery/bulk flows.

---

#### ⌨️ 4.7.1 Activation and Enablement

This feature is **disabled by default** and must be explicitly enabled in Settings.

When enabled:

- The extension listens for the **Alt+Shift+I** hotkey
- Pressing the hotkey triggers an immediate analysis of the current page
- If a valid image is found, a floating download icon is injected over it (💾)

If the option is disabled:
- The hotkey has no effect
- No icon is injected
- The page remains unchanged

> The feature operates only on the active tab.

---

#### 🧠 4.7.2 Best Image Selection Rules

When the hotkey is pressed, the content script evaluates image candidates on the page.

The selection logic applies the same global validation rules used by other features:

- Minimum width and height thresholds
- Allowed image formats
- Extended image URL normalization (if enabled)
- Exclusion of decorative or low-value images

Among all valid candidates, the image with the **highest effective resolution** is selected.

> Only one image is selected per activation.

---

#### 🖼️ 4.7.3 Icon Injection and User Interaction

Once the best image is identified:

- A floating download icon is injected directly over the image
- The icon is clearly visible and clickable
- No page navigation or reload is performed

The icon:
- Is part of the extension package
- Is scoped to the current page
- Does not modify the image or page layout
- Is removed when the page is reloaded, closed, or after the download completes

---

#### 📥 4.7.4 Download Trigger and Completion

When the user clicks the injected icon:

- A download request is sent to the background layer
- Filename rules and folder settings are applied
- The image is downloaded under standard limits

On successful completion:
- The icon is removed
- 🟢 Green badge may briefly indicate activity
- 🔵 Blue badge indicates completion

If no valid image is found:
- No icon is injected
- No download is triggered
- Informational feedback may be shown

> Each activation is independent and does not reuse state from previous runs.

---

## ⚙️ 5. Settings Deep Dive

This section provides a **technical interpretation of all configuration options**, explaining how each setting affects execution, which features it impacts, and when it should (or should not) be changed.

The goal is to help technical users **configure behavior intentionally**, avoid conflicting options, and understand side effects—without reading source code.

---

### 🧪 5.1 Performance Presets

Performance presets are **macro configurations** that adjust multiple internal limits at once.

Available presets:
- **Low**
- **Medium**
- **High**
- **Custom** (automatically selected when manual changes are made)

Presets influence:
- Batch sizes
- Concurrency limits
- Gallery processing rates
- Web-linked gallery fan-out behavior

Notes:
- Presets do not lock values; users can still fine-tune settings
- Selecting a preset overwrites previously customized values
- The **Custom** preset indicates a user-defined configuration

> Use presets as a starting point, not as a permanent constraint.

---

### 📐 5.2 Global Image Size Filters

These settings define the **minimum acceptable image dimensions**:

- Minimum width (px)
- Minimum height (px)

They apply globally to:
- Bulk Image Download
- All gallery extraction modes
- Image Inspector
- One-click Download Icon

Effects:
- Images below thresholds are ignored silently
- Overly strict values may result in no downloads
- Lower values increase noise and risk of decorative images

> These are the most common cause of “nothing downloads” scenarios.

---

### 🧾 5.3 Allowed Image Formats

This setting controls which image formats are eligible for processing.

Typical formats include:
- JPG / JPEG
- PNG
- WEBP
- AVIF
- BMP

Behavior:
- Format checks are applied before any download attempt
- Disabled formats are skipped early to reduce overhead

Recommendation:
- Keep commonly used formats enabled
- Enable AVIF only if target sites are known to use it

---

### 🔗 5.4 Extended Image URLs

When enabled, this option allows normalization of **platform-specific image URL variants**.

Effects:
- Handles URLs with modifiers such as `:large` or `:orig`
- Improves compatibility with certain platforms
- May increase the number of valid candidates

This option affects:
- Bulk Image Download
- Gallery extraction
- Image Inspector
- One-click Download Icon

> Disable it if targeting traditional, static image galleries.

---

### 📁 5.5 Download Folder Selection

Controls where downloaded images are saved.

Options:
- Default system download folder
- Custom folder path

Behavior:
- Folder selection is applied by the background layer
- Invalid or unavailable paths fall back to system defaults
- No folder discovery or auto-creation logic is performed

> Folder changes apply immediately to new operations.

---

### 🏷️ 5.6 Filename Customization

Filename customization affects **how downloaded files are named**.

Modes:
- None
- Prefix
- Suffix
- Both
- Timestamp

Rules:
- Naming is applied consistently across all features
- Clipboard hotkeys can inject prefix/suffix values dynamically
- Existing files are never overwritten; names are adjusted automatically

> Use consistent naming rules when collecting large datasets.

---

### 📸 5.7 Bulk Image Download Options

These settings apply only to **Bulk Image Download**.

Key options:
- Maximum images per batch
- Continue from last batch

Effects:
- Smaller batches reduce memory pressure
- Larger batches improve throughput on strong systems
- Resume behavior allows recovery from interruptions

> These options do not affect gallery-based features.

---

### 🖼️ 5.8 Gallery Options (Direct and Visual)

These options affect both:
- Galleries with direct links
- Visual galleries without links

Key settings:
- Similarity threshold
- Minimum group size
- Smart grouping enablement
- Fallback grouping enablement
- Gallery processing rate/limit

Effects:
- Higher similarity thresholds reduce false positives
- Minimum group size prevents accidental grouping
- Fallback grouping increases tolerance for inconsistent structures

> Misconfiguration here may result in either too many or too few images.

---

### 🔗 5.9 Web-Linked Gallery Options

These settings apply exclusively to **web-linked galleries**.

Key options:
- Maximum number of open tabs
- Delay between tab openings

Effects:
- Limits browser load
- Prevents site throttling
- Controls execution predictability

> Lower values improve stability; higher values improve speed.

---

### 🕵️ 5.10 Image Inspector Options

Image Inspector settings control manual inspection behavior.

Options include:
- Enable/disable Image Inspector
- Developer Mode
- Close page after saving image

Developer Mode:
- Exposes additional metadata
- Intended for debugging and verification
- Does not alter download logic

---

### 🖱️ 5.11 One-click Download Icon Option

Controls the availability of the **Alt+Shift+I** hotkey.

When enabled:
- Hotkey triggers best-image analysis
- Download icon may be injected if a valid image is found

When disabled:
- No page analysis occurs
- No UI elements are injected

> This option affects both manual usage and automated web-linked gallery flows.

---

### 📋 5.12 Clipboard Hotkeys Option

Enables keyboard shortcuts for applying filename rules.

Hotkeys:
- Ctrl+Alt+P — set prefix
- Ctrl+Alt+S — set suffix

Rules:
- Clipboard content must be available
- Corresponding filename mode must be active
- Hotkeys operate only on the active tab

---

### 🔎 5.13 Peek Panel Option

Controls visual aspects of the Peek panel.

Option:
- Transparency level

Behavior:
- Affects readability only
- Has no impact on logic or performance
- Applies immediately

---

### 📢 5.14 User Feedback Messages

Controls whether on-screen messages are displayed.

When enabled:
- Success, error, and info messages are shown
- Messages auto-dismiss after a short time

> Disabling messages reduces UI noise but may obscure errors.

---

### 🐛 5.15 Console Log Level

Controls the verbosity of console output.

Levels:
- 0 — Silent
- 1 — Basic
- 2 — Verbose
- 3 — Detailed

Higher levels:
- Provide more diagnostic information
- May impact performance slightly
- Are recommended only during troubleshooting

---

## ⌨️ 6. Hotkeys and Commands Reference

This section documents **all keyboard shortcuts and commands available in version v2.08.149**, including their scope, prerequisites, and limitations.

Hotkeys are **opt-in** features: they work only when the corresponding option is enabled in Settings.

---

### 🖱️ 6.1 Alt+Shift+I — One-click Download Icon

**Purpose:**  
Trigger a fast, single-image download on the current page.

**Prerequisites:**
- One-click Download Icon feature enabled in Settings

**Behavior:**
- Analyzes the current page for valid image candidates
- Selects the best image based on resolution and global rules
- Injects a floating download icon over the selected image
- Clicking the icon triggers the download

**Scope and limitations:**
- Operates only on the active tab
- Injects UI elements temporarily
- No effect if no valid image is found

---

### 🕵️ 6.2 Ctrl+Shift+M — Image Inspector

**Purpose:**  
Toggle Image Inspector mode for manual image inspection and download.

**Prerequisites:**
- Image Inspector feature enabled in Settings

**Behavior:**
- Activates inspection mode on the current page
- Highlights eligible images on hover
- Displays metadata overlays for validation
- Allows explicit, single-image download

**Scope and limitations:**
- Does not run automatically
- Operates only on the active tab
- Exits when toggled off or when the page changes

---

### 📋 6.3 Ctrl+Alt+P / Ctrl+Alt+S — Clipboard Prefix / Suffix

**Purpose:**  
Quickly apply filename customization rules using clipboard content.

**Prerequisites:**
- Clipboard Hotkeys enabled in Settings
- Corresponding filename mode active (prefix, suffix, or both)

**Behavior:**
- Ctrl+Alt+P sets clipboard content as filename prefix
- Ctrl+Alt+S sets clipboard content as filename suffix

**Scope and limitations:**
- Operates only on the active tab
- Clipboard content must be accessible
- No effect if filename customization is disabled

---

### 🧩 6.4 Common Limitations and Conflicts

General considerations for hotkeys:

- Hotkeys may conflict with browser or OS shortcuts
- Some websites intercept key combinations
- Hotkeys do not work inside browser UI elements (address bar, devtools)
- Feature-specific enablement is always required

If a hotkey does not respond:
- Verify the feature is enabled
- Ensure focus is on the page content
- Check for OS or browser-level conflicts

---

## 🩺 7. Troubleshooting Without Code Changes

This section explains **how to diagnose and resolve common issues** using configuration, visual feedback, and logs — without modifying source code.

The troubleshooting approach is based on observing behavior, validating assumptions, and narrowing the execution scope.

---

### 🚫 7.1 No Images Downloaded

This is the most common reported scenario.

Checklist:
- Verify minimum width and height are not overly restrictive
- Confirm at least one allowed image format is enabled
- Ensure the selected feature matches the page type:
  - Bulk Image Download → direct image tabs
  - Gallery modes → HTML pages with images
- Check that extended image URLs are enabled when targeting platforms that use them

> If no validation rule is satisfied, the extension exits cleanly without downloads.

---

### 🎯 7.2 Unexpected Images Downloaded

This typically indicates **loose filtering or grouping settings**.

Review:
- Minimum image size thresholds
- Similarity threshold (too low increases noise)
- Minimum group size for galleries
- Allowed formats (disable formats you do not want)

> Lower thresholds favor completeness; higher thresholds favor precision.

---

### 🟡 7.3 Processing Appears Stuck

If the badge remains green longer than expected:

- Large galleries may still be processing
- Web-linked galleries may be respecting delay and concurrency limits
- Some pages may be slow to load or block scripts

Actions:
- Wait for the badge to transition to blue
- Check console logs for progress updates
- Reduce concurrency and batch sizes if needed

> The extension does not deadlock; all flows have completion paths.

---

### 🔴 7.4 Error States and What to Collect

When errors occur, collect the following before reporting:

- Extension version (`v2.08.149`)
- Feature used
- Target website URL
- Console log output (log level ≥ 2 recommended)
- Screenshot of the Peek panel

> This information allows reproducible diagnosis without guessing.

---

### 📜 7.5 Using Log Level for Diagnosis

Console log level controls diagnostic verbosity.

Recommendations:
- Level 0–1 for normal usage
- Level 2 for issue reproduction
- Level 3 only for deep analysis

Logs are:
- Printed to the browser console
- Not stored persistently
- Cleared automatically between runs

> Higher log levels may slightly impact performance but greatly improve visibility.

---

## ⚡ 8. Performance and Stability

This section explains **how performance-related settings and internal safeguards work together** to keep Mass Image Downloader responsive, predictable, and stable under different workloads.

The extension is designed to favor **controlled execution** over maximum throughput.

---

### 🧠 8.1 Concurrency vs Rate Limiting

Concurrency and rate limiting are two complementary mechanisms.

**Concurrency**
- Controls how many operations (downloads or tabs) run at the same time
- Affects browser memory and CPU usage directly

**Rate limiting**
- Controls how quickly new operations are started
- Introduces intentional delays between actions

Key principles:
- High concurrency without delays can overwhelm the browser
- Low concurrency with no delay may underutilize resources
- Balanced values provide the best stability

> Web-linked galleries rely heavily on both mechanisms.

---

### 📦 8.2 Batch Size Guidance

Batch size controls how many images are processed together in a single cycle.

Guidelines:
- Small batch sizes improve stability and responsiveness
- Large batch sizes improve throughput on powerful systems
- Extremely large batches may delay badge updates and feedback

Batch size affects:
- Bulk Image Download
- Gallery extraction flows

It does not affect:
- Image Inspector
- One-click Download Icon

---

### 💻 8.3 Resource Impact (RAM / CPU)

Mass Image Downloader is designed to minimize long-lived resource usage.

Resource usage characteristics:
- Memory usage is temporary and execution-scoped
- CPU usage spikes only during active processing
- No background polling or idle loops exist

Factors that increase resource usage:
- Large galleries
- High concurrency settings
- Aggressive similarity grouping
- High log verbosity

Once an operation completes:
- Temporary state is cleared
- Opened tabs are closed
- Resource usage returns to baseline

> This design prevents cumulative performance degradation over time.

---

## 🔒 9. Security and Privacy (Technical)

This section explains the **security boundaries, privacy guarantees, and intentional limitations** of Mass Image Downloader from a technical perspective.

The extension is designed to be **transparent, non-invasive, and execution-scoped**.

---

### 🛡️ 9.1 Script Injection Boundaries

Mass Image Downloader injects scripts **only when required** and strictly within its functional scope.

Key principles:
- No third-party scripts are loaded
- No external code is fetched or executed
- All injected scripts are bundled with the extension
- Injection occurs only on user-triggered actions

Injected scripts are used exclusively for:
- DOM inspection
- Image qualification
- Temporary UI overlays (icons, inspectors)

> No scripts persist beyond the lifetime of the page.

---

### 🚫 9.2 No Persistent Download History

The extension does **not maintain a history of downloaded images**.

Behavior:
- URLs are tracked only during the current execution
- Duplicate detection applies only within a single run
- No data is written to storage about completed downloads

After an operation finishes:
- All temporary execution data is discarded
- No records remain for future sessions

This ensures:
- No long-term tracking
- No usage profiling
- Full privacy by design

---

### 🔐 9.3 Permissions Rationale

Each permission requested by the extension has a clear technical purpose.

Common permission categories include:
- Tab access — required to inspect and manage active pages
- Downloads — required to save images to disk
- Storage — required to persist user configuration

Principles:
- No permission is requested without a functional reason
- Permissions are not escalated dynamically
- Features fail safely if permissions are unavailable

Mass Image Downloader does not request:
- Network access to external services
- Access to user credentials
- Access to browsing history

---

## 📎 10. Appendices

This section provides **reference material and consolidated views** intended to support the rest of the Technical User Manual.

The appendices do not introduce new behavior; they summarize and contextualize existing functionality.

---

### 📋 10.1 Settings Reference Table

This appendix summarizes all configurable options and their scope.

Settings are grouped by functional area:
- Global image filters
- Gallery processing
- Bulk download behavior
- Web-linked gallery controls
- File system and naming
- Feature enablement flags
- Debugging and visibility

The authoritative source for defaults and ranges remains the **Options page**, but this table serves as a quick technical reference when reviewing behavior.

---

### 🏷️ 10.2 Badge States Reference

Mass Image Downloader uses badge color and counters to convey execution state.

Badge states:
- 🟢 **Green** — active processing in progress
- 🔵 **Blue** — execution completed successfully

Additional badge colors may appear in feature-specific contexts:
- 🟡 **Yellow** — transitional or attention-required state (feature-scoped)
- 🔴 **Red** — error or aborted state (feature-scoped)

Yellow and red badges are not global indicators and are limited to specific flows where applicable.

> Badge state is reset after each execution.

---

### 🗂️ 10.3 Recommended Technical Presets

The following guidance can be used as a starting point for technical users:

- **Stable preset**
  - Low concurrency
  - Moderate batch size
  - Conservative gallery limits

- **Balanced preset**
  - Medium concurrency
  - Default batch size
  - Standard gallery grouping

- **Aggressive preset**
  - High concurrency
  - Large batch size
  - Relaxed grouping thresholds

Preset selection should always consider:
- System capabilities
- Target website behavior
- Browser stability

> There is no universally optimal configuration.
