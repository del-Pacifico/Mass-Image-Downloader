# 🖼️ Mass Image Downloader

![Version](https://img.shields.io/badge/version-2.06.63-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Chromium%2090%2B-orange?style=flat-square&logo=googlechrome)
![GitHub community standards](https://img.shields.io/badge/community%20standards-100%25-brightgreen?style=flat-square&logo=github)

![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow?style=flat-square&logo=javascript)
![No Tracking](https://img.shields.io/badge/Privacy-No%20tracking-blueviolet?style=flat-square&logo=shield)
![Lightweight](https://img.shields.io/badge/Built-lightweight-lightgrey?style=flat-square)
![Modular Design](https://img.shields.io/badge/Architecture-Modular-informational?style=flat-square)
![ES Modules](https://img.shields.io/badge/ESM-Enabled-success?style=flat-square&logo=javascript)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen?style=flat-square&logo=github)
![Cross Platform](https://img.shields.io/badge/Compatible-Chromium%2090%2B-important?style=flat-square&logo=googlechrome)
---

## 📚 Table of Contents

- [🚀 Features](#-features)
- [🧩 How It Works](#-how-it-works)
- [⚙️ Options Available](#️-options-available)
- [🧠 Technical Design](#-technical-design)
- [💾 Installation](#-installation)
- [🔒 Privacy](#-privacy)
- [📄 License](#-license)
- [📜 Changelog](#-changelog)
- [💡 Use Cases](#-use-cases)
- [⚠️ Edge Cases & Warnings](#️-edge-cases--warnings)
- [🙌 Contributions](#-contributions)

---


**Mass Image Downloader** is a fast, lightweight, and privacy-respecting browser extension designed to simplify the process of bulk image collection. Built with performance and precision in mind, it enables you to detect, group, and download high-quality images from open tabs or galleries—quickly and efficiently.

Compatible with Chromium-based browsers like **Brave**, **Edge**, and **Chrome**, this tool is ideal for researchers, designers, archivists, and everyday users who need speed, control, and accuracy.

### 📸 Bulk Image Download
Designed for speed and minimal interaction, this mode scans rightward tabs starting from the current one to identify and download direct image URLs. Ideal for processing open tabs quickly.

### 🖼️ Extract Gallery Images
Perfect for webpages with image thumbnails that link to full-size images. This mode finds the higher-resolution version of each image, filters them, and downloads them in bulk.

### 🧭 Gallery Finder
This internal engine groups candidate images based on path similarity and resolution, ensuring only the most relevant and highest-quality images are retained for processing or download.

Whether you’re collecting inspiration, preserving content, or building datasets, Mass Image Downloader provides a clean, rule-based approach to efficient image capture.

---

## 🚀 Features

### 📸 Bulk Image Download
- Automatically detects tabs to the right of the current one containing direct image URLs.
- Applies filters for image dimensions and user-allowed file formats.
- Supports max simultaneous downloads (1–4), set in Options.
- Each valid image is downloaded and its tab is automatically closed.
- Badge counter increases per image, with green background (`#4CAF50`) during process and blue (`#1E90FF`) on completion.

### 🖼️ Extract Gallery Images
- Detects image thumbnails that link to higher-resolution image files.
- Filters linked images by extension, resolution, and minimum size.
- Groups images with similar URL paths (based on similarity threshold).
- Downloads grouped high-resolution images automatically or opens them in background tabs.
- All filtering rules and limits (like gallery max images/sec) are user-configurable.

### 🧭 Gallery Finder (Grouping Engine)
- Analyzes thumbnails and discovers groups of images based on path similarity.
- Applies resolution-based comparison to retain only the highest-quality instance.
- Operates independently or as a preprocessing stage for Extract Gallery Images.

### 🔧 Additional Functionalities
- 🔍 Auto-detects valid images from open tabs or galleries.
- 🧠 Smart filters by format (`.jpg`, `.jpeg`, `.png`, `.webp`), dimensions, and similarity.
- 📝 User-defined filename modes (prefix, suffix, both, timestamp).
- ⚙️ Options UI uses `chrome.storage.sync` to persist all user settings.
- 📊 Badge counter provides visual feedback on download progress.

---

## 🧩 How It Works

### 📸 Bulk Image Download
This mode activates when the extension icon is clicked on a tab with a direct image. It processes all tabs to the right of the active tab in the current window.

**Steps and rules applied:**
1. Filters each tab by checking if its URL points directly to an image.
2. Validates that the image:
   - Has an allowed format (JPG, JPEG, PNG, WEBP).
   - Meets the minimum width and height defined in global options.
3. Downloads the image with a dynamically generated filename (based on user-defined mode).
4. Updates the badge with green color and counter.
5. Closes the tab once the image has been processed.
6. The process continues to the next tab until:
   - No more tabs remain, or
   - The max concurrent download limit (set by user) is reached.
7. Upon completion, the badge turns blue.

**Options that affect this mode:**
- `downloadLimit`
- `minWidth`, `minHeight`
- `filenameMode`, `prefix`, `suffix`
- `allowJPG`, `allowJPEG`, `allowPNG`, `allowWEBP`

---

### 🖼️ Extract Gallery Images
Used to process image thumbnails that link to higher-resolution images within a gallery.

**Steps and rules applied:**
1. Scans the current page for `<img>` elements.
2. Detects if the image has an anchor link that leads directly to a valid image URL.
3. Validates linked images by:
   - Allowed file format.
   - Minimum width and height (after loading remotely).
   - Resolution being higher than the thumbnail.
4. Groups images if their URL paths share a minimum similarity (based on `pathSimilarityLevel`).
5. Each group yields the highest resolution variant (deduplicated).
6. Downloads the images (or optionally opens in tabs) based on mode.
7. Badge counter updates throughout the process.

**Options that affect this mode:**
- `minWidth`, `minHeight`
- `galleryMaxImages`
- `pathSimilarityLevel`
- `extractGalleryMode` (immediate vs. tab)
- File format restrictions (same as bulk)

---

### 🧭 Gallery Finder
This engine is invoked explicitly or used internally by Extract Gallery Images.

**Steps and rules applied:**
1. Takes a list of candidate images (usually thumbnails).
2. Validates each by minimum size and allowed format.
3. Calculates pairwise path similarity.
4. Groups images when similarity threshold is met.
5. From each pair/group, selects the highest-resolution image.
6. Returns list of grouped image URLs for further download or preview.

**Options that affect this mode:**
- `minWidth`, `minHeight`
- `pathSimilarityLevel`

All three modes honor global configuration to enforce deterministic filtering and uniform experience across bulk and gallery operations.

## ⚙️ Options Available

Configuration is available via the extension's Options page, accessible from the popup menu or browser extension settings. Settings are divided into **global options** and **mode-specific options**, each affecting different aspects of operation.

### 🌐 Global Options
These settings apply across all modes:
- **Download Folder**: Choose between the system default or a custom folder.
- **Allowed Formats**: Enable/disable file types: `.jpg`, `.jpeg`, `.png` or `.webp`.
- **Minimum Image Dimensions**: Only images larger than these values are processed.
- **Filename Mode**: Format downloaded filenames with prefix, suffix, both, or timestamp.
- **Prefix / Suffix**: Custom text added to filenames (based on mode).
- **Debug Logging**: Enable console logs for development and troubleshooting.

### 📸 Bulk Image Download Options
These settings influence direct-image downloads from tabs:
- **Download Limit**: Controls how many images are downloaded in parallel (1–4).

### 🖼️ Extract Gallery Images Options
These settings define how gallery-linked images are handled:
- **Extract Mode**: Choose between `immediate` download or opening each image in a background tab.
- **Gallery Max Images**: Limits the number of images processed per second (1–10).

### 🧭 Gallery Finder Options
These apply to grouping logic during gallery analysis:
- **Path Similarity Level**: Defines how similar two image URLs must be (50%–100%) to be grouped together.

All options are stored via `chrome.storage.sync` and persist across sessions, ensuring a consistent user experience.

---

## 🧠 Technical Design

Mass Image Downloader follows a modular and scalable architecture, optimized for performance, reliability, and developer maintainability. The extension is structured to meet real-world constraints around browser security, user configurability, and runtime efficiency.

### 🧩 Modular architecture
- `background.js`: Orchestrates message handling, download flow, settings retrieval, and tab control.
- `extractGallery.js`: Encapsulates gallery logic, including resolution comparison and similarity grouping.
- `utils.js`: Houses all reusable utilities, including badge updates, format validation, and safe tab closure.

### ⚙️ Runtime-optimized with native browser APIs
- Uses `chrome.tabs`, `chrome.storage.sync`, `chrome.runtime`, and `chrome.downloads` to ensure tight integration and responsiveness.
- Debounced and promise-aware flows manage async operations in tab processing and gallery extraction.

### 🧪 Pure JavaScript (ES Modules)
- Entirely built with native JS features for compatibility across Chromium 90+ environments.
- Avoids bundlers and libraries to reduce size and improve debuggability.

### 🔐 Strict permission model
- The `manifest.json` is tightly scoped.
- Permissions are granted only for tabs and downloads, limiting attack surface and respecting user privacy.

### 🎯 Deterministic rule-based filtering engine
- Filters images based on user-defined rules:
  - Minimum resolution (width x height)
  - File format inclusion (`.jpg`, `.jpeg`, `.png`, `.webp`)
  - Path similarity (%) for gallery detection

### ♻️ Stateful and recoverable execution
- User preferences are stored and restored via `chrome.storage.sync`.
- Default fallbacks ensure consistent behavior even if data is unavailable or corrupted.

### 👁️ Non-intrusive visual feedback system
- Badge displays live download count with green background (`#4CAF50`) while active, and switches to blue (`#1E90FF`) on completion.
- Minimal UI avoids dialogs or overlays.

### 🧱 Safe and deduplicated tab management
- `closeTabSafely` ensures idempotent and error-tolerant tab closure, preventing double deletions or race conditions.

### 🛠️ Diagnostics-first development philosophy
- Logs use standardized messages with emojis and phase indicators.
- Errors and edge cases are fully captured with console stack traces and guards.

---

## 💾 Installation

Mass Image Downloader is not yet available in the Chrome Web Store. In the meantime, you can install it manually from source code by following the instructions below, based on your experience level.

### 👤 For Regular Users (No Technical Skills Required)

1. Download the latest release as a ZIP file from the official GitHub repository.
2. Extract the ZIP file to a folder on your desktop or downloads directory.
3. Open Google Chrome or any Chromium-based browser.
4. Go to the Extensions page by typing `chrome://extensions/` in the address bar.
5. Enable **Developer Mode** using the toggle switch at the top right.
6. Click **Load unpacked** and select the folder where you extracted the ZIP file.
7. The extension icon should now appear in your browser toolbar. You're ready to use it!

### 🧠 For Advanced Users (Developers & Power Users)

#### 🐧 Unix-based Systems (Linux/macOS)

1. Clone the repository using Git:
   ```bash
   git clone https://github.com/sergiopalmah/mass-image-downloader.git
   ```
2. Navigate to the root directory:
   ```bash
   cd mass-image-downloader
   ```
3. Open `chrome://extensions/` in your browser.
4. Enable **Developer Mode** (top right).
5. Click **Load unpacked** and choose the root project folder.
6. Optionally, make live edits to the source files (JavaScript, HTML, CSS) and reload the extension via the browser.

#### 🪟 Windows Systems

1. Open a command prompt and run:
   ```cmd
   git clone https://github.com/sergiopalmah/mass-image-downloader.git
   ```
2. Change to the cloned directory:
   ```cmd
   cd mass-image-downloader
   ```
3. Open Google Chrome or any Chromium-based browser.
4. Go to `chrome://extensions/`.
5. Enable **Developer Mode** (top right).
6. Click **Load unpacked** and select the `mass-image-downloader` folder.
7. You can now test or modify the extension files directly.

> **Note:** Make sure you **disable** "Ask where to save each file before downloading" in your browser's download settings to allow automatic downloads.

---

## 🔒 Privacy

This extension is fully local. It does **not track, collect, or transmit** any user data. All image processing and download operations are performed **within your browser**, with no external API calls or telemetry.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 📜 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for details on recent updates.

---

## 💡 Use Cases

Here are a few examples of how Mass Image Downloader can be used in real-world workflows:

### 🎨 Design Research
Quickly collect visual inspiration, UI samples, or creative assets from design showcases or portfolios by downloading only high-resolution images.

### 📰 Media Archiving
Preserve full-quality media content from news galleries or image feeds, especially where thumbnails link to larger versions.

### 📚 Academic Research
Extract datasets of visual references or example diagrams from scientific publications or academic image collections.

### 🛍️ Product Scraping (Ethical Use)
Capture images from e-commerce galleries for product comparison or documentation purposes, respecting terms of service.

### 📁 Bulk Curation
Streamline the process of selecting and downloading specific types of images across many tabs or search results pages.

---

## ⚠️ Edge Cases & Warnings

While Mass Image Downloader is highly reliable, a few edge cases should be considered:

- **Sites using anti-download mechanisms** (e.g., CSP, lazy loading, or JavaScript-driven blobs) may prevent direct image access.
- **Images embedded via CSS or Base64** are not detected.
- If the browser’s setting “Ask where to save each file before downloading” is **enabled**, the extension **will not function**.
- In gallery mode, if `<a>` tags do not link to image files directly, they will be ignored.
- Very large galleries (100+ images) may briefly slow down tab rendering or UI feedback.
- The extension only processes tabs in the **same window** as the active tab.

---

## 🙌 Contributions

Contributions are welcome! Please open an issue or submit a pull request.

For questions, suggestions, or feedback, feel free to reach out or open a GitHub discussion.

