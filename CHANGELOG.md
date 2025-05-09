# 📦 Changelog - Mass Image Downloader

All notable changes to this project will be documented in this file.
This project follows [Semantic Versioning](https://semver.org/).

---

## [2.07.139] - 2025-05-09

### 🗂 Overview

Version 2.07.139 introduces a major leap forward in both functionality and usability. This release focuses on power-user features, advanced image grouping logic, and an overall more resilient, flexible architecture.

Key highlights include:

- 🆕 A brand new extraction mode for web-linked gallery pages (`<a href="page.html"><img>`), including dynamic tab opening and in-page image icon injection.
- 🧠 Smart and fallback grouping for visual galleries, with user-defined similarity thresholds and group size enforcement.
- 📋 Global clipboard hotkeys for quick filename customization (`Ctrl+Alt+P` / `Ctrl+Alt+S`).
- 🔁 Flow renaming and internal modular refactors for consistency and separation of concerns.
- 📦 Fully enforced rate limits per second for gallery processing.
- 🧪 Detailed logging and runtime diagnostics with configurable debug levels.
- 💬 New visual user feedback messages and real-time status updates.
- 🎨 Refined UI/UX for both the popup and options page, including dynamic icons and color consistency.
- 📄 Full documentation rewrite, better onboarding, and a license migration from MIT to MPL-2.0.

This version prepares the foundation for scalable future improvements while preserving performance, privacy, and user control.

### ✨ Added

- **🖱️ Download Icon Injection over Images**  
  When using the *Web-Linked Gallery* extraction mode in `tab` mode, each opened page now displays a floating download icon directly over each valid image. This allows for manual selection and download of individual images.

- **📋 Clipboard Hotkeys**  
  Introduced `Ctrl+Alt+P` and `Ctrl+Alt+S` hotkeys that allow users to paste a prefix or suffix from the clipboard directly into the extension’s settings. The input is sanitized, validated, saved to storage, and acknowledged with a visual confirmation.

- **🔗 New Mode: Extract Web-Linked Galleries**  
  This new flow detects `<a href="page.html"><img>` structures, opens the linked pages in background tabs, and scans them for downloadable high-resolution images.

- **🧠 Smart Grouping Engine**  
  Visual galleries now group images using configurable path similarity thresholds. The user defines the minimum similarity percentage (default 70%) and minimum group size. Only the dominant group is processed.

- **🛟 Fallback Grouping**  
  If Smart Grouping fails to find a dominant group, the system automatically retries with a lower similarity threshold (e.g., 60%, 50%, etc.) until a match is found or minimum is reached.

- **📦 Per-Second Rate Limiting**  
  A new option `galleryMaxImages` allows users to define how many images per second are processed during gallery extraction (default: 3). Helps manage performance and avoid blocking.

- **📁 Download Folder Control**  
  The user may now choose between the system default download folder and a custom folder path (validated). Custom folders must exist or will be auto-created inside the system downloads directory.

- **📐 Advanced Image Filters**  
  Options for minimum image width and height now apply across all extraction flows, preventing invalid or placeholder downloads.

- **📋 User Feedback Messages**  
  Visual notifications (toast style) appear for success, progress, or error events during interaction. This behavior can be toggled on or off.

- **🧪 Log Levels**  
  New debug levels (0 to 3) control verbosity of console logs:
  - `0`: No logs
  - `1`: Core events
  - `2`: Verbose with warnings
  - `3`: Full trace, grouping logic, errors

- **📎 Toolbar Pinning Guide**  
  README now explains how to pin the extension icon in Brave, Chrome, or Edge.

### 🔁 Changed / Renamed

- **🧩 Flow Renaming and Reorganization**
  - `Bulk Image Download` → `Download Images in Open Tabs`
  - `Extract Gallery Images` → split into:
    - `Extract Galleries (with links)`
    - `Extract Galleries (without links)`
  - `Gallery Finder` → functionality merged into both extractors as Smart Grouping logic

- **UI Updates**
  - `popup.html` and `options.html` now show the extension icon beside the main title
  - New color palette applied
  - Descriptions improved with examples and default values

- **Settings Page Overhaul**
  - All options grouped under: File System, Clipboard Hotkeys, Galleries, Image Size, Notifications, Debugging
  - Includes grouped settings per extraction flow
  - Tooltips and field-level info texts added for clarity

- **Badge Behavior Improved**
  - Green while downloads are active
  - Blue only after all batches are done
  - Counter now persists across batch iterations

- **Naming Logic**
  - Now supports `prefix`, `suffix`, `both`, `timestamp`, or `none`
  - Input fields support clipboard paste and clear actions
  - Filename conflicts resolved using `conflictAction: 'uniquify'`

- **Validation Logic Enhanced**
  - All image candidates validated using `HEAD` and `createImageBitmap()` before download
  - Invalid dimensions, formats, or duplicates are skipped with detailed logs

### 🐛 Fixed

- **🧾 Filename Issue**  
  Bug where `finalName` was `undefined` due to missing async `await` in `generateFilename(...)` resolved.

- **🟢 Badge Counter Reset**  
  Resolved issue where the badge would reset or turn blue too early between batches.

- **📤 Duplicates in Bulk Mode**  
  Now filters out already-processed or unsupported images before download begins.

- **🔁 Infinite Retry Prevention**  
  Gallery fallback logic now aborts cleanly when fallback threshold is too low or no group found.

- **📋 Clipboard Hotkey Failures**  
  Errors due to "Extension context invalidated" now handled gracefully with logs.

- **🖼 Image Skip Conditions**  
  Improved detection of images with no `naturalWidth`, placeholder images, or missing attributes.

- **🧪 Options UI Issues**  
  Fixed cases where changes weren't applied immediately due to race conditions or storage errors.

### 📄 Documentation & License

- **README.md Completely Rewritten**
  - New sections: `Technical Design`, `Advanced Usage`, `Installation`, `Recommended Setup`, and `Toolbar Pinning`
  - All flows explained step-by-step
  - Visual feedback, download logic, badge colors and grouping fully documented

- **LICENSE**
  - Changed from MIT to Mozilla Public License 2.0 (MPL-2.0)
  - Source files include required MPL 2.0 headers
  - License section updated in manifest and README

- **CHANGELOG**
  - Now follows semantic format with `Added`, `Changed`, `Fixed`, `Docs`
  - Emojis indicate scope of each change

---

## [2.06.64] - 2025-04-14

### 🚀 Overview

This release focuses on stability, clarity, and functional consistency within the **Bulk Image Download** module. Several key behaviors have been improved, including badge accuracy, batch handling logic, and URL validation.

### ✨ Added

- **Batch Processing Control**: Introduced support for the `Max Images Per Batch` option within Bulk Image Download.
- **Looping Behavior**: Added `Continue from where it left off` toggle, allowing repeated batch cycles until all valid image tabs are processed.
- **Total Accumulator**: Implemented `totalProcessed` accumulator across batches to maintain badge consistency and track global progress.

### 🔁 Changed

- **Badge Handling Logic**:
  - Badge remains green during all active downloads.
  - Badge turns blue only once all images are processed (no longer per batch).
  - Counter is no longer reset between batches.

- **Download Flow**:
  - `handleStartDownload(...)` and `processValidTabs(...)` were refactored to separate batch logic from global flow control.
  - Parameters were added to support incremental downloads and badge updates with full continuity.

### 🛠 Fixed

- **Incorrect badge reset behavior** on each batch cycle.
- **Premature blue coloring** of badge before process completion.
- **Missing function reference**: Removed `isValidImageUrl` export and import which caused module load failure.
- **Redundant URL checks**: Ensured that only direct image URLs are evaluated using `isDirectImageUrl(...)` before validating format.

### 🧼 Code Quality

- Preserved original structure, logs, and formatting conventions.
- All logs and comments adhere to descriptive and traceable formats (`begin...end`).
- Inline documentation updated to match new parameters and control flow.

---

### 📄 Documentation Updates – README.md

#### ✅ Modified

- Updated the **version badge** to reflect the current version `2.06.64`.
- Rewrote the entire **Bulk Image Download** sections across:
  - `### 📸 Bulk Image Download`
  - `## 🚀 Features`
  - `## 🧩 How It Works`
  - `## ⚙️ Options Available`
- Adjusted descriptions to reflect:
  - Batch-based download flow.
  - Accumulative badge counter behavior.
  - Real-time feedback with green/blue badge logic.
  - Support for looped downloads with `Continue from where it left off`.

#### ➕ Added

- **New section:** `💡 Recommended Configurations`
  - Provides preconfigured settings for Low, Medium, and High performance systems.
  - Offers practical guidance on setting simultaneous downloads, batch size, and looping.
  - Helps users balance performance vs stability based on their machine specs.

---

## [2.06.63] - 2025-04-10

### 🚀 Enhancements

- **Bulk Image Download**
  - Badge now updates incrementally after each successful image download.
  - Badge background color is green (`#4CAF50`) during download, and switches to blue (`#1E90FF`) after completion.
  - Improved tab closure handling with safe callback validation (`closeTabSafely`).

### 🐛 Bug Fixes

- **Redundant Option Removed**
  - Removed `Image Preference` dropdown from the Options UI and associated logic. This field was redundant, as high-resolution filtering is inherently enforced in the Extract Gallery Images process.
- **Bulk Image Download**
  - Fixed `Assignment to constant variable` runtime error when parsing filenames.
  - Fixed `callback is not a function` error when calling `closeTabSafely()` without a callback.
- **Extract Gallery Images**
  - Ensured correct enforcement of all image selection rules: file format, minimum resolution, URL path similarity, and user-defined dimension thresholds.

### 🧰 Technical Improvements

- Improved consistency and structure of developer logging via `[Mass image downloader]:` prefix.
- Standardized access to DOM elements in options.js using descriptive variable bindings.
