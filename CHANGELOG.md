# 📦 Changelog - Mass Image Downloader

All notable changes to this project will be documented in this file.
This project follows [Semantic Versioning](https://semver.org/).

---

# Changelog

## [2.06.64] - 2024-04-14

### 🚀 Overview
This release focuses on stability, clarity, and functional consistency within the **Bulk Image Download** module. Several key behaviors have been improved, including badge accuracy, batch handling logic, and URL validation.

---

### ✨ Added

- **Batch Processing Control**: Introduced support for the `Max Images Per Batch` option within Bulk Image Download.
- **Looping Behavior**: Added `Continue from where it left off` toggle, allowing repeated batch cycles until all valid image tabs are processed.
- **Total Accumulator**: Implemented `totalProcessed` accumulator across batches to maintain badge consistency and track global progress.

---

### 🔁 Changed

- **Badge Handling Logic**:
  - Badge remains green during all active downloads.
  - Badge turns blue only once all images are processed (no longer per batch).
  - Counter is no longer reset between batches.

- **Download Flow**:
  - `handleStartDownload(...)` and `processValidTabs(...)` were refactored to separate batch logic from global flow control.
  - Parameters were added to support incremental downloads and badge updates with full continuity.

---

### 🛠 Fixed

- **Incorrect badge reset behavior** on each batch cycle.
- **Premature blue coloring** of badge before process completion.
- **Missing function reference**: Removed `isValidImageUrl` export and import which caused module load failure.
- **Redundant URL checks**: Ensured that only direct image URLs are evaluated using `isDirectImageUrl(...)` before validating format.

---

### 🧼 Code Quality

- Preserved original structure, logs, and formatting conventions.
- All logs and comments adhere to descriptive and traceable formats (`begin...end`).
- Inline documentation updated to match new parameters and control flow.

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

---