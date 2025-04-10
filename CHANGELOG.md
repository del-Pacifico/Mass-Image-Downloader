# 📦 Changelog - Mass Image Downloader

All notable changes to this project will be documented in this file.
This project follows [Semantic Versioning](https://semver.org/).

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

> Next release: ...

