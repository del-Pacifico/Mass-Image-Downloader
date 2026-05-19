# 📦 Changelog - Mass Image Downloader

This project follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

- QA was completed on Microsoft Edge 148.0.3967.54 and Opera One 131.0.5877.24 with no failures reported in flows, downloads, hotkeys, or configuration behavior.

---

## [2.8.184] - 2026-05-19

### 📄 Documentation

- Reworked the root `README.md` into a compact repository entry point.
- Preserved the previous long-form README as `docs/project-overview-extended.md`.
- Added the preview image reference to the compact README.
- Updated the documentation hub to link to the extended project overview.
- Removed partial Chrome and Edge testing badges from README documents.
- Restored footer badges in the compact README and replaced the `Code Atomic` badge with a modular coding badge.
- Added `Support the Project` and `Acknowledgements` sections to the compact README.
- Removed hardcoded current-version text from README documents; version validation now points to the GitHub Release badge, GitHub tags/releases, the root `VERSION` file, and `manifest.json`.
- Documented the official contribution flow: feature/chore branch -> `dev` -> `main` -> tag/release.
- Added development rules for modularity, testability, error handling, edge-case handling, performance awareness, and professional English in comments, logs, and user-facing messages.
- Added label taxonomy requirements for Issues, Pull Requests, and Discussions.
- Updated Pull Request, Issue Template, and Release Checklist guidance to enforce branch flow and descriptive repository labels.

### 🧪 Validation

- Added Node.js-based extension compliance checks for manifest validity, declared paths, version alignment, command limits, required permissions, and JavaScript syntax.
- Added `npm run check` and `npm test` commands for contributors.
- Added GitHub Actions workflow to run extension validation and compliance tests on PRs targeting `dev` and pushes to `dev` or `main`.
- Added case-sensitive validation for extension script references.
- Consolidated the extension runtime JavaScript under `scripts/` and normalized all extension script references accordingly.
- Added the MPL license header and inline guidance comments to the validation helper for consistency with the rest of the repository.
- Extracted shared Image Inspector download helpers into `scripts/utils.js` to reduce repetition in the background message handler without changing behavior.

---

## [2.08.182] - 2026-04-28

### 🚀 Overview

This release aligns the repository state with the published `v2.08.182` tag and keeps `main` as the stable release branch.

### 🔁 Changed

- Synchronized `dev` and `main` for the `v2.08.182` release flow.
- Confirmed the release version through the root `VERSION` file and `manifest.json`.

### 🧹 Maintenance

- Added repository hygiene exclusions for local logs and old version folders.
- Preserved the standard release path: feature/chore branch → `dev` → `main` → tag/release.

---

## [2.08.181] - 2026-03-12

### 🚀 Overview

This release focuses on **stability, consistency, and user feedback normalization** across all extension workflows.  
The internal toast engine has been standardized to ensure consistent messaging, minimum visibility timing, and predictable behavior across Bulk downloads, gallery extractors, Image Inspector, and manual download flows.

In addition, several runtime issues were corrected during QA validation of the new notification system.

---

### ✨ Added

- **Configurable Toast Minimum Visible Time**
  - New option allowing users to define how long toast notifications remain visible before replacement.

- **Deferred Toast Queue**
  - Implemented logic to prevent overlapping notifications when multiple events occur rapidly.

- **Canonical MID Toast Format**
  - Introduced standardized user feedback message format:
  
  ```html
  MID: <Functionality> started
  MID: <Functionality>: found N image(s)
  MID: <Functionality> completed
  ```

- **Settings Peek Integration**
  - Toast configuration values are now visible in the Settings Peek overlay.

---

### 🔁 Changed

- **Unified User Notification System**
  - All extension workflows now use the same toast engine implemented in `utils.js`.

- **Standardized Feedback Messages**
  - All user-facing messages follow the `MID:` prefix format.

- **Consistent Naming Across Flows**
  - Bulk download
  - Gallery (direct links)
  - Gallery (visual / no links)
  - Gallery (web-linked)
  - One-click download icon
  - Settings peek

- **Removed emoji usage in user notifications**
  - Emojis remain only in developer logs.

---

### 🐛 Fixed

- **Bulk Image Download crash**
  - Fixed `downloadedTotal is not defined` runtime error in `background.js`.

- **Incorrect Bulk image count**
  - Fixed use of `validatedUrls.length` on a `Set`, replaced with `validTabs.length`.

- **Visual Gallery incorrect success message**
  - Fixed condition where success toast appeared even when `chrome.runtime.lastError` occurred.

- **Toast timing inconsistency**
  - Fixed flows that ignored the configured minimum visible time.

- **Overlapping toast notifications**
  - Fixed race condition causing multiple notifications to stack.

- Fixed reliability issues in the **Web-linked Gallery extraction workflow (Alt+Shift+W)**:
  - improved grouping logic for sequential gallery pages
  - added fallback when similarity detection is too strict
  - ensured consistent handoff to the background extraction process

- Fixed false user-facing error message:
  - `MID: Failed to hand off the web-linked gallery to the background process`
  - caused by ephemeral **MV3 callback errors** during successful handoff

- Fixed duplicated default initialization of `enableClipboardHotkeys` in the background settings

### Improved

- Background service worker now **loads and logs the setting**:
  
  `Toast Minimum Visible Time (ms)`

  improving traceability of toast configuration during startup.

- Improved internal consistency of gallery messaging and runtime validation during QA testing.

### Internal

- Cleanup of configuration initialization logic.
- Minor stability improvements discovered during QA validation of **v2.08.180**.

---

### 🧹 Maintenance

- Version bump to **v2.08.178** during toast normalization stage.
- Version bump to **v2.08.179** after successful QA validation.
- Code cleanup across:
  - `imageInspector.js`
  - `injectSaveIcon.js`
  - `extractLinkedGallery.js`
  - `extractVisualGallery.js`
  - `extractWebLinkedGallery.js`
  - `clipboardHotkeys.js`

---

### 📄 Documentation

- Updated internal changelog to include the **toast engine normalization cycle**.
- Improved developer logs and traceability for notification events.

---

## [Unreleased] - 2025-12-12

### 🧩 Governance & Tooling

#### Added
- Introduced a fully standardized issue reporting system using GitHub Issue Forms (YAML) for:
  - Bug reports
  - Hotfixes (production-critical issues)
  - Investigations (pre-triage analysis)
  - Edge cases (non-blocking, context-dependent behavior)
  - Performance & stability reports
  - Documentation issues
- Added dedicated Issue Forms for:
  - Performance / Stability reporting
  - Documentation-related issues
- Added a centralized README for issue templates describing when to use each report type.

#### Changed
- Migrated legacy Markdown-based issue templates to structured Issue Forms where appropriate.
- Refined the Feature Request template to improve clarity, scope definition, and alignment with project principles.
- Normalized `.github/ISSUE_TEMPLATE/config.yml` contact links and security reporting entry.

#### Removed
- Removed deprecated Markdown issue templates after successful migration:
  - `bug_report.md`
  - `hotfix.md`
  - `investigation.md`

#### Notes
- Feature requests intentionally remain Markdown-based to preserve flexibility and exploratory discussion.
- Security vulnerabilities continue to be handled exclusively via the Security Policy and not through public issues.

---

## [2.08.149] - 2025-12-04

### 🚀 Overview

Polish and stability improvements to **Image Inspector Mode**, fixing tooltip behavior, unified icon styling, improved visibility on initial render, and correcting minor inconsistencies discovered while testing on real websites. One syntax error found in field tests was also resolved. A new edge case (`InspectorOverlayOffset`) has been documented for future treatment.

### ✨ Added

- Added a new documented edge case: **InspectorOverlayOffset**  
  (overlay misalignment in responsive, nested figure layouts). Pending treatment along with other inspector edge cases.

- Added guidance in README on how to inspect **Image Inspector logs** via DevTools Console, including how to filter inspector-specific events.

### 🔁 Changed

- Unified all **Image Inspector icons** (✖, ✚, –, ⛶, ⬅️, ➡️, 🔗, 💾, 🕵️) to follow the same hover and background color behavior used by the One-click Download icon.  
- Ensured icons render with consistent size and contrast on initial load (no more “blank until hover”).  
- Updated tooltips inside Image Inspector to a **custom tooltip element** using the extension color palette with proper fade-out behavior.  
- Improved alignment and centering of inspector icons using safer layout rules (`inline-flex`, centered alignment), eliminating the 1–2 px drift reported in some layouts.  
- README updated with revised Image Inspector documentation, visual behavior notes, tooltip usage, and clarity around Inspector logging.

### 🐛 Bug Fixes

- **injectSaveIcon.js**: Fixed duplicate declaration error  
  `Uncaught SyntaxError: Identifier 'debugLogLevelCache' has already been declared`  
  by removing redundant initialization and reusing the shared cache.

- **Image Inspector**: Fixed “sticky tooltip” issue where tooltips persisted after mouse leave due to conflicting lifecycle events inside Shadow DOM.

- **Image Inspector**: Fixed missing icon visibility on initial render (icons appearing white until hover).

- **Image Inspector**: Corrected minor positional drift in Inspector toolbar icons due to nested absolute-position stacking.

### 📄 Documentation

- Added new edge case: **InspectorOverlayOffset**, grouped with pending inspector edge cases (`NestedFigureResponsiveImg` and `DirectImageOverlayPosition`).  
- Expanded Image Inspector explanation in README:  
  - Icon behavior & sizing  
  - Tooltip improvements  
  - How to view inspector-level logs via DevTools  
  - Prefix/Suffix persistence note when reloading configuration via Peek Settings

### 🧹 Maintenance

- Removed redundant `mouseleave` listeners in `injectSaveIcon.js`.  
- Simplified icon hover logic across inspector and manual flows, improving atomicity and reducing DOM churn.  
- Defensive default handling for `allowExtendedImageUrls` to prevent `ReferenceError` in content scripts.  
- Cleaned small internal comments and aligned variable naming consistency in inspector helpers.

---

## [2.08.149] - 2025-01-28

All notable changes between **2.08.128** and **2.08.149** are listed here.

### ✨ Added

- **Image Inspector Mode** (F1–F3.1c):  
  Standalone image inspection layer activated with **Ctrl+Shift+M**, providing a non-intrusive, client-side way to inspect, preview, zoom, navigate and save single images directly from any webpage.
- **🕵️ Hover Overlay**:  
  Lightweight, dynamic overlay over valid images using event delegation. Zero layout shifts.
- **Inspector Panel (Peek-Styled)**:  
  Right-docked panel built using Shadow DOM, matching the Peek Settings UI (colors, spacing, fonts, border-radius).
- **Preview Frame (220px)**:  
  Includes ✚ Zoom In, – Zoom Out, and **⛶ Original Size** reset button with drag-to-pan support.
- **Image Navigation**:  
  Added **⬅️ Previous** and **➡️ Next** to cycle through all images in the page.  
  Updates preview, metadata and developer mode dynamically.
- **Dynamic Metadata & Developer Refresh**:  
  Structured two-column layout for displaying image dimensions, MIME, URL, description, title, and node attributes.
- **Dedicated Save Flow** (`imageInspectorSaveImage`):  
  Inspector now saves using its own background action with independent success/error handling.
- **User Feedback Integration**:  
  All success/error/info messages routed through `showUserMsgSafe()` and respect user preference.

---

### 🔁 Changed

- **Panel Layout**:  
  Sections reordered to: **Preview → Visible Metadata → Developer** (if enabled).
- **Button Placement (UX)**:  
  Prev/Next buttons moved next to **✚ / – / ⛶** to unify all visual controls in one row.
- **Actions Row Simplified**:  
  Now includes only: **🔗 Open full image** and **💾 Save image**.
- **Save Logic Separation**:  
  Removed legacy use of `manualDownloadImage`/`downloadImage` from Inspector and replaced with dedicated action.
- **Logging Consistency**:  
  All console output uses `logDebug(level, ...)` and respects global `debugLogLevel`.

---

### 🐛 Fixed

- **False "Could not start download" error**:  
  Correct handling of MV3 `"message port closed"` behavior; Inspector now treats it as silent success when appropriate.
- **Panel close behavior**:  
  Inspector panel no longer attempts to close tabs; tab shutdown is now handled exclusively in background.js.
- **Navigation safety**:  
  Reset zoom automatically on image change via `zoomResetBtn.click()`.

---

### 🧹 Maintenance

- **Cleanup on disable**:  
  `teardownImageInspector()` fully clears DOM overlays, listeners, shadow roots and cursor changes.
- **Option Live Sync**:  
  Inspector listens for changes to: enabled state, dev mode, close-on-save, feedback messages and debug level.
- **Privacy rules enforced**:  
  Local/blob/data URLs are hidden in metadata for security.

---

### 📄 Documentation

- Added detailed developer notes related to:
  - Image Inspector Mode lifecycle (activation, overlay, panel).
  - Zoom/pan behavior and boundaries.
  - Navigation system and metadata refresh logic.
  - Known edge cases:
    - **NestedFigureResponsiveImg**
    - **DirectImageOverlayPosition**

---

## [Unreleased] - 2015-09-19

### Added

- **Docs/Templates:** Added `.github/ISSUE_TEMPLATE/hotfix.md` for production hotfix tracking.
- **Docs/Templates:** Added `.github/ISSUE_TEMPLATE/release_checklist.md` to standardize release validation steps.

### Changed

- **Docs/Templates:** Updated `.github/ISSUE_TEMPLATE/feature_request.md` with improved structure and clarity.

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
