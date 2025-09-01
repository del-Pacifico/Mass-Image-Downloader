# 📦 Changelog - Mass Image Downloader

This project follows [Semantic Versioning](https://semver.org/).

---

## [2.08.127] - 2025-08-28

All notable changes between **2.07.159** and **2.08.127** are listed here.  

### ✨ Added

- **One-click download icon** (hotkey **Alt+Shift+I**): injects a floating download button over the highlighted image in the current page. Clicking the icon immediately downloads the image following the configured rules (minimum resolution, allowed formats, filename mode with prefix/suffix).
- **Extract Web-linked Galleries** (new flow).
- **Allow extended image URLs** (`:large`, `:orig`, etc. for Twitter/X, Pixiv).
- **Support for AVIF and BMP** image formats.

---

### 🔁 Changed

- **Popup UI** updated with a modern color palette.
- **Options** reorganized into clear sections (Galleries, Image Size, File System) with explicit defaults and ranges.
- **Badge color logic clarified and stabilized**:
  - **Green** (white numbers) → active bulk downloads.
  - **Yellow** → manual downloads in progress.
  - **Blue** → all downloads completed.
- **Minimum Chromium version requirement enforced**: v93+.
- README: removed the branch badge snippet to avoid stale branch indicators (no longer displayed on any branch).

---

### 🐛 Fixed

- **Async filename bug** in Bulk Download (resolved `undefined finalName` caused by async generation).
- **Badge reset issue** in Bulk Download (counter now accumulates properly and avoids early “Done” state).
- **Service Worker memory usage** optimized to prevent prolonged RAM consumption.

---

### 🧹 Maintenance

- **utils.js**
  - `logDebug` refactored with improved error handling and legacy support.
  - `closeTabSafely` enhanced using a `Set` to prevent duplicate closures.
  - Functions standardized with JSDoc comments and consistent formatting.
- **background.js**
  - Redundant validations removed and batch logic consolidated.
  - Listeners wrapped with `try/catch` for stability.
- **options.js**
  - Default values handling improved (e.g., `galleryMaxImages`).
  - Console logs standardized with `[Mass image downloader]` prefix.
- **General**
  - Code refactored for clarity and maintainability across modules.
  - Deleted `.github/workflows/branch-badge.yml` and removed the stray `.github/workflow/` folder. Discontinued the branch-badge automation. (No impact on extension runtime.)

---

### 📄 Documentation

- **README** updated to reflect:
  - Bulk Image Download improvements and stable badge behavior.
  - New/clarified gallery options and thresholds (`galleryMaxImages`, `gallerySimilarityLevel`).
  - Minimum Chromium version requirement (v93).
  - README: removed all references to `.gif` (feature set does not support GIF).
  - README: kept allowed formats strictly aligned with implementation — JPG/JPEG, PNG, WEBP, AVIF, BMP.
- - Updated **CONTRIBUTING.md**:
  - Removed outdated “Resources” section (no wiki available yet).
  - Added new **AI-Assisted Contributions** policy, clarifying responsible use of Copilot, ChatGPT, Gemini, and DeepSeek.
- **Issue templates**:
  - Fixed front-matter in `bug_report.md` and `feature_request.md` by replacing `description:` with required `about:` field (resolves GitHub error “About can't be blank”).
  - Cleaned `.github/ISSUE_TEMPLATE/config.yml` by removing invalid `issue_templates` section and leaving only valid `blank_issues_enabled` and `contact_links`.

---

## 🛠 Pull Request: Add CODEOWNERS file

### 🗂 CODEOWNERS Overview

This update introduces a `.github/CODEOWNERS` file that assigns `@sergiopalmah` as the designated Code Owner for the entire repository.

This change ensures that Pull Requests can be self-approved when necessary, while keeping branch protection rules active and compliant with GitHub's organizational workflows.

---

### 🛠 Maintenance

- **Added `.github/CODEOWNERS` file**  
  Declares `@sergiopalmah` as the repository's sole Code Owner.  
  Enables self-approval of Pull Requests under branch protection rules, while maintaining audit and control policies.

---

## [2.07.159] - 2025-05-18

### 🗂 Overview

This release focuses on robustness, fault-tolerance, and fine-grained control across all major workflows: **Bulk Image Download**, **Extract Visual Gallery**, and **Extract Linked Gallery**. Several enhancements improve script injection reliability, clipboard usage, image filtering performance, and badge update tracking. Logging across modules has been heavily enriched to support diagnostics and edge case transparency.

**Key highlights include:**

- 🔒 **Script execution protection**: Prevents gallery scripts from running multiple times simultaneously in the same tab.
- 🧠 **Smarter image validation**: Filters small or invalid images early via HEAD request and format validation, reducing processing time and memory use.
- 🚀 **Download rate control**: Uses dynamic delays and concurrency limits to ensure smooth and fast bulk downloading without overwhelming the browser.
- 📦 **Enhanced filename handling**: Applies consistent prefix/suffix/timestamp rules with character sanitization for cleaner file organization.
- 🧰 **Improved diagnostics with fine-grained logging**: Offers detailed logs by phase, including validations, downloads, errors, and badge updates.
- 👁️ **New View Settings (peek) mode**: Allows users to review current extension settings in a read-only view without navigating to the full Options page.
- 📘 **New documentation sections**: Shortcuts & Commands, Runtime Behavior, Peek Settings Mode, Use Cases, Donations, and Related Projects.

Several enhancements improve script injection reliability, clipboard usage, image filtering performance, and badge update tracking. Logging across modules has been heavily enriched to support diagnostics and edge case transparency.

---

### ✨ Added

- **Execution lock for gallery scripts**  
  Introduced runtime flags (`window.__mdi_extractVisualGalleryRunning`, `__mdi_extractLinkedGalleryRunning`) to avoid duplicated script execution within the same tab context.

- **Advanced clipboard support & fallback handling**  
  - Integrated permission checks for `navigator.permissions.query({ name: 'clipboard-read' })` and `document.readyState` validation before reading clipboard content.
  - Displays user feedback for unsupported or denied clipboard API contexts.

- **Pre-download HEAD request for image size validation**  
  Downloads are skipped early if `Content-Length` indicates a file smaller than 20 KB—avoiding unnecessary bandwidth and bitmap creation attempts.

- **Download concurrency queue with delay control**  
  Sequential processing of images now respects the user-defined `galleryMaxImages` rate (1–10) using dynamic delays in `handleExtractLinkedGallery` and `handleExtractVisualGallery`.

- **🆕 New "View Settings (peek)" functionality**  
  A keyboard shortcut (Ctrl+Shift+Y) or internal trigger now allows users to open a read-only summary of current configuration.  
  Useful for quickly verifying settings (e.g., prefix, suffix, filename mode, batch size) without modifying them or leaving the active tab.
  This mode is non-intrusive and does not affect the current workflow.
  The settings are displayed in a modal overlay with a close button.
  The modal is styled to match the extension's theme and includes a close button.

- **New "Extension Shortcuts & Commands" section in README**  
  Lists all available and planned hotkeys, including prefix/suffix clipboard shortcuts and performance presets.

- **New "Behavior When Navigating or Closing the Page" section**  
  Documents runtime behavior for all flows if the tab is closed or navigated away from.

- **New "Peek Settings Mode" section**  
  Describes the read-only settings overlay injected into tabs for quick reference.

- **New "Support the Project" and donation section**  
  Added PayPal link and messaging inviting user support.

- **New "Related Projects" section**  
  Includes link and description for the Unicode to PNG companion project.
  This project allows users to convert Unicode characters into PNG images, which can be useful for various applications, such as creating custom icons or graphics.
  The project is open-source and available on GitHub, encouraging collaboration and contributions from the community.  

---

### 🔁 Changed

- **Filename generation logic**  
  `generateFilename(...)` was reinforced to sanitize and apply formatting rules based on prefix/suffix/timestamp reliably and consistently across all modes.

- **User feedback message display**  
  Visual toast messages (`showUserMessage`) now include:
  - Background color based on message type (`#007EE3` or `#d9534f`)
  - Duration variation (`5s` for info/success, `10s` for errors)
  - Exception guards on DOM manipulation for display and removal

- **Log verbosity with debug levels (1–3)**  
  All scripts (`background.js`, `popup.js`, `options.js`, `utils.js`, etc.) implement fine-grained `logDebug(...)` calls categorized by:
  - Phase markers (BEGIN/END)
  - Validation steps
  - Download status
  - Errors and fallbacks
  - Final completion

- **Badge behavior fully restructured**  
  - Badge remains green (`#4CAF50`) during any ongoing download or gallery image processing.
  - Badge switches to blue (`#1E90FF`) only when all processing steps are completed (even across batches or delayed loops).
  - `updateBadge(...)` now includes text color control and cumulative update tracking.

- **README.md: structure and clarity improvements**  
  Overview rewritten with a more commercial and engaging tone. Typos corrected, redundant content removed, and content reorganized for better flow.

- **Clipboard Hotkeys documentation reorganized**  
  Moved full description to Options section and replaced duplicate in How It Works with a concise reference link.

- **Use Cases section rewritten**  
  Now includes marketing-focused use cases for researchers, designers, developers, and data engineers.

---

### ⚙️ Performance

- **Download concurrency and queue processing redesigned**  
  Introduced a rate-limited download queue to handle image downloads with precise concurrency control.  
  This eliminates blocking behavior and improves throughput in high-volume galleries (`galleryMaxImages` respected consistently).

- **HEAD-based early rejection for small images**  
  Added a lightweight HEAD request before bitmap decoding to discard images under ~20 KB.  
  Prevents costly `createImageBitmap(...)` calls and reduces unnecessary memory usage.

- **Script execution flags prevent redundancy**  
  Gallery scripts (`extractLinkedGallery.js`, `extractVisualGallery.js`) now use runtime flags to avoid duplicate injection and execution, particularly when clicking buttons multiple times or during rapid toggles.

- **Badge logic no longer blocks UI feedback**  
  The badge update function was refactored to allow asynchronous, cumulative updates without interrupting image processing logic.

---

### 🐛 Fixed

- **Image filtering with fallback**  
  - Enhanced path similarity fallback logic when dominant group is too small.
  - Automatically retries with lower threshold (–10%) if `galleryEnableFallback` is enabled.

- **`isAllowedImageFormat(...)` fallback correction**  
  In `extractLinkedGallery.js`, a safeguard fallback was added in case extension-based logic fails—reducing false negatives.

- **Silent download errors during clipboard injection**  
  Errors triggered by invalid clipboard context are now fully caught and logged, with user feedback shown conditionally if enabled.

- **Custom folder path sanitization**  
  `customFolderPath` values are cleaned via regex to avoid illegal filesystem characters before generating download paths.

- **Edge case tab validation**  
  Tabs missing valid image URLs, extensions, or resolution now trigger complete debug logs without interrupting the flow.

- **Uncaught `sendResponse` failures**  
  All asynchronous message handlers now safely wrap `sendResponse(...)` with `respondSafe(...)` to avoid runtime exceptions.

---

### 📁 Repository & Project Structure

- **Repository namespace updated**  
  The official repository location has moved from  
  `https://github.com/sergiopalmah/mass-image-downloader`  
  to  
  `https://github.com/del-Pacifico/mass-image-downloader`  

  All related repositories are now maintained under the GitHub organization **Del-Pacifico** for long-term collaborative development and community contributions.
  The original repository will remain available for historical reference.

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
