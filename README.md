# ??? Mass Image Downloader

**Mass Image Downloader** is a fast, lightweight, and privacy-respecting browser extension designed to simplify the process of bulk image collection. Built with performance and precision in mind, it enables you to detect, group, and download high-quality images from open tabs or galleries—quickly and efficiently.

Compatible with Chromium-based browsers like **Brave**, **Edge**, and **Chrome**, this tool is ideal for researchers, designers, archivists, and everyday users who need speed, control, and accuracy.

### ?? Bulk Image Download
Designed for speed and minimal interaction, this mode scans rightward tabs starting from the current one to identify and download direct image URLs. Ideal for processing open tabs quickly.

### ??? Extract Gallery Images
Perfect for webpages with image thumbnails that link to full-size images. This mode finds the higher-resolution version of each image, filters them, and downloads them in bulk.

### ?? Gallery Finder
This internal engine groups candidate images based on path similarity and resolution, ensuring only the most relevant and highest-quality images are retained for processing or download.

Whether you’re collecting inspiration, preserving content, or building datasets, Mass Image Downloader provides a clean, rule-based approach to efficient image capture.

---

## ?? Features

### ?? Bulk Image Download
- Automatically detects tabs to the right of the current one containing direct image URLs.
- Applies filters for image dimensions and user-allowed file formats.
- Supports max simultaneous downloads (1–4), set in Options.
- Each valid image is downloaded and its tab is automatically closed.
- Badge counter increases per image, with green background (`#4CAF50`) during process and blue (`#1E90FF`) on completion.

### ??? Extract Gallery Images
- Detects image thumbnails that link to higher-resolution image files.
- Filters linked images by extension, resolution, and minimum size.
- Groups images with similar URL paths (based on similarity threshold).
- Downloads grouped high-resolution images automatically or opens them in background tabs.
- All filtering rules and limits (like gallery max images/sec) are user-configurable.

### ?? Gallery Finder (Grouping Engine)
- Analyzes thumbnails and discovers groups of images based on path similarity.
- Applies resolution-based comparison to retain only the highest-quality instance.
- Operates independently or as a preprocessing stage for Extract Gallery Images.

### ?? Additional Functionalities
- ?? Auto-detects valid images from open tabs or galleries.
- ?? Smart filters by format (`.jpg`, `.jpeg`, `.png`, `.webp`), dimensions, and similarity.
- ??? User-defined filename modes (prefix, suffix, both, timestamp).
- ?? Options UI uses `chrome.storage.sync` to persist all user settings.
- ?? Badge counter provides visual feedback on download progress.

---

## ?? How It Works

### ?? Bulk Image Download
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

### ??? Extract Gallery Images
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

### ?? Gallery Finder
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

---

## ?? Options Available

Configuration is available via the extension's Options page, accessible from the popup menu or browser extension settings. Settings are divided into **global options** and **mode-specific options**, each affecting different aspects of operation.

### ?? Global Options
These settings apply across all modes:
- **Download Folder**: Choose between the system default or a custom folder.
- **Allowed Formats**: Enable/disable file types: `.jpg`, `.jpeg`, `.png`, `.webp`.
- **Minimum Image Dimensions**: Only images larger than these values are processed.
- **Filename Mode**: Format downloaded filenames with prefix, suffix, both, or timestamp.
- **Prefix / Suffix**: Custom text added to filenames (based on mode).
- **Debug Logging**: Enable console logs for development and troubleshooting.

### ?? Bulk Image Download Options
These settings influence direct-image downloads from tabs:
- **Download Limit**: Controls how many images are downloaded in parallel (1–4).

### ??? Extract Gallery Images Options
These settings define how gallery-linked images are handled:
- **Extract Mode**: Choose between `immediate` download or opening each image in a background tab.
- **Gallery Max Images**: Limits the number of images processed per second (1–10).

### ?? Gallery Finder Options
These apply to grouping logic during gallery analysis:
- **Path Similarity Level**: Defines how similar two image URLs must be (50%–100%) to be grouped together.

All options are stored via `chrome.storage.sync` and persist across sessions, ensuring a consistent user experience.

---

## ?? Technical Design

Mass Image Downloader follows a modular and scalable architecture, optimized for performance, reliability, and developer maintainability. The extension is structured to meet real-world constraints around browser security, user configurability, and runtime efficiency. Key architectural pillars include:

- ?? **Modular architecture**: The codebase is divided into clearly scoped modules:
  - `background.js`: Orchestrates message handling, download flow, settings retrieval, and tab control.
  - `extractGallery.js`: Encapsulates gallery logic, including resolution comparison and similarity grouping.
  - `utils.js`: Houses all reusable utilities, including badge updates, format validation, and safe tab closure.

- ?? **Runtime-optimized with native browser APIs**:
  - Uses `chrome.tabs`, `chrome.storage.sync`, `chrome.runtime`, and `chrome.downloads` to ensure tight integration and responsiveness.
  - Debounced and promise-aware flows are used to manage async operations in tab processing and gallery extraction.

- ?? **Pure JavaScript (ES Modules)**: Entirely built with native JS features for compatibility across Chromium 90+ environments. Avoids bundlers and libraries to reduce size and improve debuggability.

- ?? **Strict permission model**: The `manifest.json` is tightly scoped. Permissions are granted only for tabs and downloads, limiting attack surface and respecting user privacy.

- ?? **Deterministic rule-based filtering engine**: Instead of heuristic or AI-based guessing, the system enforces image validation through user-defined filters:
  - Minimum resolution (width x height)
  - File format inclusion (`.jpg`, `.jpeg`, `.png`, `.webp`)
  - Path similarity (%) for gallery detection

- ?? **Stateful and recoverable execution**:
  - All user preferences are stored and restored from `chrome.storage.sync`, enabling persistent configuration across sessions.
  - Default fallbacks ensure consistent behavior even if data is unavailable or corrupted.

- ?? **Non-intrusive visual feedback system**:
  - Badge displays live download count with green background (`#4CAF50`) while active, switching to blue (`#1E90FF`) on completion.
  - Minimal UI avoids popup dialogs or overlays, ensuring a frictionless experience.

- ?? **Safe and deduplicated tab management**:
  - The method `closeTabSafely` ensures idempotent and error-tolerant tab closure, preventing double deletions or race conditions in concurrent workflows.

- ?? **Diagnostics-first development philosophy**:
  - Developer logs use standardized, prefixed messages with clear phase demarcation (BEGIN/END) for traceability.
  - Errors and edge cases are fully captured with console stack traces and validation guards.

This technical design provides a balance between simplicity for users and control for developers, making the extension efficient, extensible, and robust across a wide range of use cases.

---

## ?? Installation

### From GitHub
1. Clone this repository.
2. Open `chrome://extensions/` in your Chromium browser.
3. Enable "Developer Mode".
4. Click **Load unpacked** and select the extension root folder.

### From Chrome Web Store *(Coming Soon)*
> Extension will be published to the Chrome Web Store.

---

## ?? License

This project is licensed under the [MIT License](LICENSE).

---

## ?? Changelog

See [CHANGELOG.md](./CHANGELOG.md) for details on recent updates.

---

## ?? Use Cases

Here are a few examples of how Mass Image Downloader can be used in real-world workflows:

### ?? Design Research
Quickly collect visual inspiration, UI samples, or creative assets from design showcases or portfolios by downloading only high-resolution images.

### ?? Media Archiving
Preserve full-quality media content from news galleries or image feeds, especially where thumbnails link to larger versions.

### ?? Academic Research
Extract datasets of visual references or example diagrams from scientific publications or academic image collections.

### ??? Product Scraping (Ethical Use)
Capture images from e-commerce galleries for product comparison or documentation purposes, respecting terms of service.

### ?? Bulk Curation
Streamline the process of selecting and downloading specific types of images across many tabs or search results pages.

---

## ?? Contributions

Contributions are welcome! Please open an issue or submit a pull request.

For questions, suggestions, or feedback, feel free to reach out or open a GitHub discussion.

