# 🏔️ Mass Image Downloader

![Version](https://img.shields.io/badge/version-2.07.159-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MPL--2.0-green?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Chromium%2090%2B-orange?style=flat-square&logo=googlechrome)
![GitHub community standards](https://img.shields.io/badge/community%20standards-100%25-brightgreen?style=flat-square&logo=github)
![Made with ❤️ by del-Pacifico](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20by%20del--Pacifico-orange?style=flat-square)
![Star this project](https://img.shields.io/github/stars/del-Pacifico/Mass-Image-Downloader?style=flat-square&logo=github)
![Donate](https://img.shields.io/badge/Donate-via%20PayPal-blue?style=flat-square&logo=paypal)

---

## 📚 Table of Contents

- [🚀 Features](#-features)
- [⚙️ Options Available](#️-options-available)
- [🎹 Extension Shortcuts & Commands](#-extension-shortcuts--commands)
- [🧩 How It Works](#-how-it-works)
- [🧠 Technical Design](#-technical-design)
- [🔄 Behavior When Navigating or Closing the Page](#-behavior-when-navigating-or-closing-the-page)
- [👁️ Peek Settings Mode](#️-peek-settings-mode)
- [💾 Installation](#-installation)
- [📌 Show Extension Icon in Toolbar](#-show-extension-icon-in-toolbar)
- [💡 Recommended Setup](#-recommended-setup)
- [🔒 Privacy](#-privacy)
- [📄 License](#-license)
- [📜 Changelog](#-changelog)
- [💡 Use Cases](#-use-cases)
- [🧠 Advanced Usage & Developer Tips](#-advanced-usage--developer-tips)
- [⚠️ Edge Cases & Warnings](#️-edge-cases--warnings)
- [🔗 Related Projects](#-related-projects)
- [💖 Support the Project](#-support-the-project)
- [🙌 Contributions](#-contributions)

---

**Mass Image Downloader** is your personal image capture powerhouse—designed for speed, precision, and privacy.

From visual research and UX inspiration to product scraping or digital archiving, this extension helps you download exactly what you need, faster than ever.

Built for **Chrome**, **Edge**, and **Brave**, it automates the tedious while giving you full control over formats, sizes, filenames, and gallery structures.

> 🖼️ Built for scale. Powered by clarity. Trusted by pros.  
> Your image workflow, streamlined.
> 🚀 Loved by power users. Built for efficiency. Always improving.

---

### ✨ Key highlights in version 2.07.159

- 📸 Download images from open tabs directly.
- 🌄 Extract high-res images from galleries with direct image links.
- 🖼️ Extract gallery images visually without links, using DOM analysis.
- 🔗 Extract images from web-linked pages (`<a href="page.html"><img>`).
- 📋 Use keyboard shortcuts to set filename prefix/suffix via clipboard.
- 🧠 Smart and fallback grouping by path similarity.
- 📐 Customizable filters by image format, size, and resolution.
- 🎯 Configurable download paths and filename strategies.
- 🧪 Visual feedback via badges and toast messages.
- 💬 Rich logs for developers via `chrome.storage.sync` debug level.

---

## 🚀 Features

- 📸 Download images from open tabs directly.
- 🌄 Extract high-res images from galleries with direct image links.
- 🖼️ Extract gallery images visually without links, using DOM analysis.
- 🔗 Extract images from web-linked pages (`<a href="page.html"><img>`).
- 📋 Use keyboard shortcuts to set filename prefix/suffix via clipboard.
- 👁️ Peek current settings without leaving the active tab.
- 🧠 Smart and fallback grouping by path similarity.
- 📐 Customizable filters by image format, size, and resolution.
- 🎯 Configurable download paths and filename strategies.
- 🧪 Visual feedback via badges and toast messages.
- 💬 Rich logs for developers via `chrome.storage.sync` debug level.

---

## ⚙️ Options Available

Mass Image Downloader offers a wide range of customizable settings. Options are persisted using `chrome.storage.sync`, meaning your preferences are retained across sessions and devices (if signed in).

> Full breakdown of options is available in the **Options Page** of the extension.

Includes:

- 📁 Download folder (default or custom)
- 🖼️ Allowed image formats
- 📐 Minimum width & height filters
- ✍️ Filename mode (prefix, suffix, timestamp)
- 📋 Clipboard hotkeys (Ctrl+Alt+P / S)
- 💬 Visual feedback toggle
- 🧠 Smart grouping and fallback logic
- ⚡ Rate limit for gallery processing
- 🔢 Batch size and concurrency controls
- 🔍 Debug log level (0–3)

---

### 🌐 Global Options

These options apply across all modes of operation.

- **Download Folder**  
  Choose between:
  - `Default`: Uses the system's default downloads folder.
  - `Custom`: Allows you to specify a valid absolute path. Used only if supported by your OS and browser.
  
  > 📁 If "Custom" is selected, a sanitized folder path is applied.

- **Allowed Formats**  
  Enable or disable which image types are considered valid:
  - `.jpg`, `.jpeg`, `.png`, `.webp`
  
  > 🧪 Only these formats are evaluated during extraction and validation.

- **Minimum Image Dimensions**  
  Set a threshold to avoid downloading small or low-quality images:
  - Width and height must both be met.
  
  > 📐 Typical values: `300x500`, `800x600`. Applies to all flows.

- **Filename Mode**  
  Determines how filenames are generated before saving:
  - `None`: Leaves the original filename untouched.
  - `Prefix`: Adds custom text before the filename.
  - `Suffix`: Adds custom text after the filename (before the extension).
  - `Both`: Adds both prefix and suffix.
  - `Timestamp`: Adds a UTC timestamp after the base filename.

- **Prefix / Suffix**  
  Custom text used in the naming logic. Input is sanitized to avoid invalid characters. Stored globally.

- **Clipboard Hotkeys**  
  Enable or disable keyboard shortcuts to set prefix/suffix via clipboard content:
  - `Ctrl + Alt + P`: Sets the clipboard text as prefix.
  - `Ctrl + Alt + S`: Sets the clipboard text as suffix.
  
  > 🔐 Clipboard input is trimmed, validated (alphanumeric), and saved.

- **User Feedback Messages**  
  Toggle whether visual messages appear on screen:
  - Success or progress messages: shown for 5 seconds.
  - Errors: shown for 10 seconds.
  
  > 💬 Messages appear as small, non-intrusive overlays.

- **Debug Log Level**  
  Controls verbosity of developer logs printed to the console:
  - `0`: Silent
  - `1`: Basic
  - `2`: Verbose
  - `3`: Detailed with stack traces and grouping
  
  > 🐞 Useful for troubleshooting or development.

---

### 📸 Options: Download Images in Open Tabs

These settings control the behavior of the tab-scanning download flow.

- **Download Limit**  
  Maximum number of simultaneous downloads at any time.
  - Allowed range: `1–4`
  
  > ⚖️ Higher values may increase speed but also memory usage.

- **Max Images Per Batch**  
  How many image tabs are processed in each batch. Affects badge counting and flow pacing.
  
- **Continue from Last Batch**  
  When enabled, the extension will continue processing subsequent batches automatically until no valid image tabs remain.

> 🧪 Badge turns green during download, and blue when all batches are complete.

---

### 🌄 Options: Extract Gallery (with links)

Settings for galleries where `<a>` links point directly to image files (e.g., thumbnails linking to high-res versions).

- **Extract Mode**  
  - `immediate`: Downloads begin directly in the background.
  - `tab`: Opens each image in a hidden tab (useful for preview-based workflows).

- **Gallery Max Images**  
  Limits the number of images processed per second to avoid overload. Typical range: `1–10`.

> ⚡ Controls the flow rate of extraction to prevent performance issues.

---

### 🖼️ Options: Extract Gallery (without links)

Same as above, but also includes grouping logic.

- **Enable Smart Grouping**  
  Automatically clusters related images based on URL path similarity.
  
- **Similarity Threshold (`gallerySimilarityLevel`)**  
  A percentage (e.g., `70`) used to determine grouping strength.
  
- **Enable Fallback Grouping**  
  If Smart Grouping fails to find a dominant group, retries with a lower threshold (down to `30%`).

- **Minimum Group Size (`galleryMinGroupSize`)**  
  Rejects any group with fewer than X images to avoid irrelevant results.

> 🧠 Designed to isolate coherent sets from noisy image collections.

---

### 🔗 Options: Web-Linked Galleries

Specialized options for when `<a>` tags link to another page instead of a direct image.

- **Extract Mode**  
  Behaves just like the other extract modes:
  - `immediate`: Begins download upon entry.
  - `tab`: Opens target pages and allows user to pick with injected download icons.

- **Batch Opening Limit**  
  Limits how many target pages are opened in parallel.
  - Respects system/browser limitations.

> 🧩 Pages are scanned using `injectSaveIcon.js`, which places a clickable icon over each valid image.
> 🖱️ Clicking the icon downloads the image using your configured filename options.
> 🔗 Ideal for photo series spread across paginated content (e.g., blog-style image sets).
> 🖼️ The icon is only shown for images that:

  - Are visible in the viewport
  - Meet the minimum size (e.g., `300x500`)
  - Have an allowed format (`.jpg`, `.jpeg`, `.png`, `.webp`)

> 🖱️ Clicking the icon immediately downloads the image using your configured filename options.

---

### 📋 Clipboard Hotkeys Overview

These hotkeys let you assign filename elements using clipboard content.

- `Ctrl + Alt + P`: Assign clipboard as prefix.
- `Ctrl + Alt + S`: Assign clipboard as suffix.
- Clipboard input is sanitized (alphanumeric only).
- Applies across all download flows.

> ✂️ Helpful for labeling sets without needing to open the Options page.
> 🔑 Hotkeys are global and work even when the extension popup is closed.
> 🖱️ Clipboard content is trimmed and validated before use.
> 🧠 Use these shortcuts to quickly set up filenames before starting a download.
> 🧩 This feature is part of the internal flow and does not require manual activation. It allows the user to pick specific images visually without triggering full automation.
> 🔗 Ideal for photo series spread across paginated content (e.g., blog-style image sets).
> 🧠 Use this when dealing with Pinterest-like pages, or lazy-loaded image walls.

---

## 🎹 Extension Shortcuts & Commands

Mass Image Downloader includes several keyboard shortcuts for fast access to internal actions.  
All shortcuts can be triggered while browsing, and do not require the popup to be open.

| Key Combination      | Action                                      | Scope       |
|----------------------|---------------------------------------------|-------------|
| `Ctrl + Alt + P`     | Set clipboard text as filename **prefix**   | Global      |
| `Ctrl + Alt + S`     | Set clipboard text as filename **suffix**   | Global      |
| `Ctrl + Alt + 1`     | Apply **Low Spec** configuration preset     | Global *(planned)* |
| `Ctrl + Alt + 2`     | Apply **Medium Spec** configuration preset  | Global *(planned)* |
| `Ctrl + Alt + 3`     | Apply **High Spec** configuration preset    | Global *(planned)* |

> ⚙️ You can enable or disable these from the Options Page.  
> ⏳ Future updates will include additional hotkeys for quick mode switching and preview toggles.

---

## 🧩 How It Works

This extension offers multiple ways to detect, group, and download images depending on how the target page is structured. Below are all supported modes, what they do, and how they behave in different scenarios:

---

### 📸 Download Images (Open Tabs)

This mode scans tabs to the right of the currently active one and looks for direct image URLs (e.g., ending in `.jpg`, `.png`, etc.).

**Steps:**

1. Identifies all open tabs in the same window starting from the current one.
2. Filters for valid image URLs based on format and dimension rules.
3. Downloads each image using your configured filename mode (prefix, suffix, etc.).
4. Closes the tab once the image is downloaded successfully.
5. Continues through batches, respecting the max per batch and download limit options.
6. Updates a badge counter (green while active, blue when done).

> 💡 Best for downloading images already open in multiple tabs — ideal for batch capture from Google Images, Reddit, or gallery views.

---

### 🌄 Extract Galleries (with direct links)

This mode targets image thumbnails that are wrapped in an anchor (`<a>`) element, where the `href` leads directly to an image file.

**Steps:**

1. Scans the current page for `<a><img></a>` patterns.
2. Extracts the `href` URL and validates it against user settings (format, resolution).
3. Applies path-based grouping logic (if enabled), using similarity thresholds.
4. Downloads images directly or opens them in background tabs, depending on your `Extract Mode` setting (`immediate` or `tab`).
5. Updates the badge counter and displays progress messages.

> 🔍 Ideal for structured galleries where clicking a thumbnail loads a high-res image.

---

### 🖼️ Extract Galleries (without links)

This mode works on pages where images are not linked, but are presented directly within the page's DOM (e.g., `<img>` without a parent `<a>`). It's useful for modern galleries using JavaScript rendering.

**Steps:**

1. Scans the DOM for `<img>` tags that aren't inside clickable anchors.
2. Validates the source URL format and visible image dimensions.
3. Groups related images by comparing the similarity of their paths.
4. If Smart Grouping is enabled, it finds the largest cohesive set (dominant group).
5. If the group is too small, Fallback Mode retries grouping with a lower threshold.
6. Processes the final group either via tab opening or immediate download.
7. Badge counter and logs reflect progress.

> 🧠 Use this when dealing with Pinterest-like pages, or lazy-loaded image walls.

---

### 🔗 Extract Web-Linked Galleries

This advanced mode detects when a thumbnail is wrapped in a link to another page (not an image), e.g., `<a href="gallery1.html"><img src="thumb.jpg" />`.

**Steps:**

1. Identifies all `<a><img></a>` combinations where the `href` points to a webpage.
2. Opens each linked page in a background tab (respecting concurrency limits).
3. Once loaded, those pages are scanned using the same image extraction logic.
4. Final images are downloaded or opened, just like in other modes.
5. Each step is logged for debugging, and the badge reflects cumulative progress.

#### 🖱️ On-Page Download Button (Injected Icon)

When using **Web-Linked Galleries**, the extension opens each gallery page in a background tab. Once those pages are fully loaded, a floating download icon is injected over each valid image that meets the minimum resolution and format criteria.

**Behavior:**

- The icon 💾 is positioned in the top-right corner of each qualifying image.
- Clicking the icon immediately downloads the image using your configured filename options.
- Downloaded files follow the same naming rules (prefix/suffix/timestamp).
- The icon is only shown for images that:
  - Are visible in the viewport
  - Meet the minimum size (e.g., 300x500)
  - Have an allowed format (`.jpg`, `.jpeg`, `.png`, `.webp`)

> 🧩 This feature is part of the internal flow and does not require manual activation. It allows the user to pick specific images visually without triggering full automation.
> 🔗 Ideal for photo series spread across paginated content (e.g., blog-style image sets).

---

### 👁️ Peek Settings Mode

Opens a clean, read-only overlay displaying all active settings:

1. Filename mode
2. Prefix/suffix
3. Format filters
4. Download path
5. Gallery limits
6. Clipboard hotkey state
7. Useful for quickly reviewing current configuration before triggering actions.
8. No navigation required — opens directly in current tab.
9. Works independently of the Options page.

> 🔎 Accessed internally from popup or via injected trigger.
> ✨ Ideal for quickly reviewing your current settings without opening the Options page.

---

### 📋 Clipboard Hotkeys

Quickly apply clipboard text as a filename prefix or suffix:

- `Ctrl + Alt + P` → Set as prefix  
- `Ctrl + Alt + S` → Set as suffix

> For validation rules and behavior details, see [Clipboard Hotkeys Overview](#-clipboard-hotkeys-overview).

---

## 🧠 Technical Design

Mass Image Downloader follows a modular, resilient, and scalable architecture designed for performance, privacy, and maintainability.

### 🧩 Modular Architecture

| File                    | Purpose                                                                 |
|-------------------------|-------------------------------------------------------------------------|
| `background.js`         | Core controller: download logic, batching, messaging, gallery handling |
| `popup.js`              | Launches actions, shows version, injects scripts                        |
| `options.js`            | Loads, saves, and validates configuration options                       |
| `options.html`          | Main configuration UI                                                   |
| `settingsPeek.js`       | Handles state detection to display peek overlay                        |
| `peekOptions.js`        | Injected overlay displaying current settings                            |
| `peekOptions.html`      | Read-only view for live configuration snapshot                         |
| `extractLinkedGallery.js` | Handles `<a><img>` galleries pointing to direct images              |
| `extractVisualGallery.js`| Handles direct `<img>` DOM images on-page                             |
| `extractWebLinked.js`   | Manages `<a>` links to HTML pages that contain galleries               |
| `injectSaveIcon.js`     | Adds floating save icons to qualifying images in linked pages          |
| `clipboardHotkeys.js`   | Listens for clipboard hotkey triggers to apply prefix/suffix           |
| `utils.js`              | Shared helpers: logging, badge control, file naming, validation        |

### Optimizations

- HEAD requests avoid downloading small or invalid images.
- Dynamic badge updates with visual state tracking.
- Configurable delays (`galleryMaxImages/sec`) for throttling.
- `respondSafe()` ensures message replies never fail silently.
- Tabs closed using `closeTabSafely()` with deduplication guards.
- Logs grouped by emojis and levels (See 🧪 Logging and Diagnostics for details).  
- Uses `chrome.runtime.sendMessage` for inter-script communication.
- Uses `chrome.scripting.executeScript` for injecting content scripts.
- Uses `chrome.downloads.download` for file saving.
- Uses `chrome.storage.sync` for settings persistence.
- Uses `chrome.tabs.query` for tab management.
- Uses `chrome.runtime.onMessage` for event handling.
- Uses `chrome.runtime.onInstalled` for initialization.

---

### ⚙️ Browser-native APIs

- Uses `chrome.storage.sync`, `chrome.tabs`, `chrome.downloads`, `chrome.runtime`, and `chrome.scripting`.
- No external libraries or network requests.
- Asynchronous logic with error handling, fallback modes, and dynamic concurrency.

### 🎛 Runtime Flexibility

- Smart filtering by:
  - File extension (`.jpg`, `.jpeg`, `.png`, `.webp`)
  - Minimum resolution (width/height)
  - Path similarity threshold (for grouping)
- Switches between `immediate` download and background `tab` mode.

### 🧪 Logging and Diagnostics

- Configurable log levels (0–3) from options page.
- Logs every step with emoji-based indicators:
  - `✅` success  
  - `❌` error  
  - `⚠️` warning  
  - `🔄` loop  
  - `🧠` grouping

### 🔒 Safe, Non-Intrusive Design

- Fully local: no telemetry, tracking, or analytics.
- Failsafe tab closing logic with deduplication.
- Robust image validation (via `HEAD` + `ImageBitmap`).

### 📦 File-Naming Strategy

- Dynamic names using `prefix`, `suffix`, `timestamp`, or base name.
- Prevents overwrites using `conflictAction: 'uniquify'`.

---

## 🔄 Behavior When Navigating or Closing the Page

This section describes how the extension behaves when the user navigates away from a page or closes a tab while one of the image-processing functionalities is running. Understanding this behavior is crucial for ensuring reliable and uninterrupted operation during downloads and gallery extractions.

---

### 1. 🧩 Extract Images from Galleries (with Direct Links)

- **Script involved**: `extractLinkedGallery.js` (runs as a content script)

- **How it works**: This script scans the current page for `<a>` tags that point to other HTML pages containing images. Once these are found, the image URLs are sent to `background.js`, which then opens new tabs to process each one.
- **Behavior on tab change or closure**: ✅ **Safe**
  - After sending the message to background, the entire process continues independently of the original tab. Downloads and processing occur in newly opened tabs.

---

### 2. 🧩 Extract Images from Galleries (with Direct Image Links)

- **Script involved**: `extractVisualGallery.js` (runs as a content script)

- **How it works**: This script looks for all `<img>` elements within the current DOM and filters them based on size and configuration. It then sends the validated image list to `background.js` for downloading.
- **Behavior on tab change or closure**: ⚠️ **Potentially Interrupted**
  - If the user navigates to a different page or closes the tab **before the image list is sent**, the operation will fail. This is because content scripts are destroyed when the page unloads, so any logic still running will be lost.

---

### 3. 🧩 Bulk Image Download

- **Script involved**: `background.js` (invoked directly via extension popup or click)

- **How it works**: This feature detects whether the current tab points directly to an image or qualifies for batch processing, and proceeds to download accordingly.
- **Behavior on tab change or closure**: ✅ **Safe**
  - The full flow is executed in `background.js`, which is persistent and independent from the content of the current tab. Even if the tab is closed, downloads proceed without issue.

---

### 4. 🧩 Clipboard Hotkeys (Prefix/Suffix Assignment)

- **Script involved**: `clipboardHotkeys.js` (content script injected into all pages)

- **How it works**: The user can press `Ctrl+Alt+P` or `Ctrl+Alt+S` to assign a prefix or suffix from the clipboard. This is stored in `chrome.storage.sync` and used later when naming downloaded images.
- **Behavior on tab change or closure**: ✅ **Safe**
  - The action is immediate and only involves storage updates. There is no ongoing process to interrupt, so it works regardless of navigation.

---

### 🧾 Comparison Summary

What happens if a tab is closed while a feature is running?  
The outcome depends on which process is active. Here's a summary:

| Flow                                | Safe if tab closes? | Notes |
|-------------------------------------|----------------------|-------|
| Bulk download (tabs)                | ✅ Yes               | Runs fully in background. |
| Extract gallery (with links)        | ✅ Yes               | After sending to background. |
| Extract gallery (without links)     | ⚠️ Partial          | Tab must remain until images are sent. |
| Web-linked gallery (icon injected)  | ✅ Yes               | Icons are placed in background tab. |
| Clipboard hotkeys                   | ✅ Yes               | Settings saved immediately. |
| Peek Settings                       | ✅ Yes               | Read-only overlay. No process involved. |

---

### ✅ Final Notes

To ensure a successful experience:

- **Avoid closing or navigating** during gallery extraction from the current page (direct `<img>` galleries).
- **No issues will occur** when using features triggered via popup or those that delegate processing to the background.

---

## 💾 Installation

Mass Image Downloader is not yet published in the Chrome Web Store.  
You can install it manually using the source code provided in the GitHub repository.

---

### 👤 For Regular Users (No technical skills required)

1. Visit the [GitHub repository](https://github.com/del-Pacifico/Mass-Image-Downloader).
2. Click on the green **`Code`** button and select **`Download ZIP`**.
3. Extract the ZIP file to a folder on your desktop or preferred location.
4. Open your browser and navigate to:

   ```
   chrome://extensions/
   ```

5. Enable **Developer Mode** by toggling the switch in the top-right corner.
6. Click **Load unpacked** and select the folder you just extracted.

> ✅ **The extension icon should now appear in your browser toolbar.**  
> 🔒 **Important:** Make sure to disable  
> **“Ask where to save each file before downloading”** in your browser settings.

---

### 🧠 For Advanced Users (Git & Dev Tools)

You can clone the repository and work directly with the source files.

#### 🐧 Linux / macOS

```bash
git clone https://github.com/del-Pacifico/Mass-Image-Downloader.git
cd Mass-Image-Downloader
```

Then:

1. Open your browser and go to:

   ```
   chrome://extensions/
   ```

2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the cloned folder.

> 🧪 You can now edit `.js`, `.html`, and `.css` files freely. Reload the extension after changes to test them.

---

#### 🪟 Windows Systems

```cmd
git clone https://github.com/del-Pacifico/Mass-Image-Downloader.git
cd Mass-Image-Downloader
```

Then:

1. Open **Chrome** or **Edge** and go to:

   ```
   chrome://extensions/
   ```

2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the cloned folder.

> 🛠 Use a code editor like [Visual Studio Code](https://code.visualstudio.com/) or [Notepad++](https://notepad-plus-plus.org/) to modify and test the extension files locally.

---

## 📌 Show Extension Icon in Toolbar

After installing the extension in **Brave**, **Chrome**, or **Edge**, the icon may not appear automatically in the toolbar. To pin it:

1. Click the puzzle piece icon (🧩) on the top-right of the browser.
2. Find **Mass Image Downloader** in the list of installed extensions.
3. Click the **📌 pin icon** next to it to keep it visible at all times.

> ✅ This ensures quick access to popup features, including direct downloads and gallery extraction.

---

## 💡 Recommended Setup

| Profile    | Simultaneous Downloads | Batch Size | Loop Enabled | Best For                      |
|------------|------------------------|------------|---------------|-------------------------------|
| 🟢 Low     | 1                      | 10         | ❌             | Old PCs, slow connections     |
| 🟡 Medium  | 2                      | 25         | ✅             | Most modern users             |
| 🔵 High    | 4                      | 50         | ✅             | High-spec machines            |

### 🕵 Usage Recommendations

To ensure smooth performance and optimal results when using Mass Image Downloader, we recommend adjusting the extension's options based on your system resources and workflow. Below are some common usage profiles and tips:

---

#### 🟢 Low-Spec Machines (older PCs or limited resources)

- **Simultaneous Downloads**: `1`
- **Max Images Per Batch**: `5–10`
- **Continue from Last Batch**: `Disabled`
- **Gallery Max Images/sec**: `1–2`
- **Disable Smart Grouping** to reduce memory overhead.
- **Avoid opening multiple extraction flows at once**.

> 🔒 Tip: Start with small galleries or image sets and increase gradually.

---

#### 🟡 Medium-Spec Machines (standard laptops or desktops)

- **Simultaneous Downloads**: `2`
- **Max Images Per Batch**: `25`
- **Continue from Last Batch**: `Enabled`
- **Gallery Max Images/sec**: `3–5`
- **Enable Smart Grouping** if using visual galleries.
- Use **Prefix/Suffix** to organize files better.

> ✅ Best balance between performance and download speed.

---

#### 🔵 High-Performance Systems (modern PCs with SSDs, strong bandwidth)

- **Simultaneous Downloads**: `4`
- **Max Images Per Batch**: `50` or more
- **Continue from Last Batch**: `Enabled`
- **Gallery Max Images/sec**: `5–10`
- **Enable Smart Grouping** and **Fallback Mode** for high-precision clustering.
- Activate **Clipboard Hotkeys** for quick prefix/suffix setting.

> ⚡ Great for mass downloading and high-resolution archives.

---

#### 🔎 General Optimization Tips

- **Set minimum dimensions** (e.g., `minWidth: 300`, `minHeight: 500`) to avoid low-quality images.
- **Use gallery similarity threshold** (`gallerySimilarityLevel`) around `70–80%` for relevant grouping.
- **Enable "immediate" mode** for direct download, or **"tab" mode** for visual preview before saving.
- Keep **Developer Tools console open** to monitor logs if debugging or diagnosing issues.
- **Avoid overlapping extraction modes** (e.g., don’t trigger both linked and visual galleries at once).

> 🧠 Adjust options progressively based on the type of site and image layout you're working with.

#### Notes

- A higher batch size allows faster completion but may cause visible lag or browser delays if your system is under heavy load.
- Enabling "Continue from where it left off" ensures all images are eventually processed, even in batches.
- Reducing the simultaneous download limit may help avoid failed downloads on unstable connections.

---

## 🔒 Privacy

This extension is fully local. No telemetry. No tracking. No data is collected or transmitted.  
No external APIs are used. Settings are stored via `chrome.storage.sync`.

---

## 📄 License

This project is licensed under the [Mozilla Public License v. 2.0](https://www.mozilla.org/MPL/2.0/).

---

## 📜 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for full release history.

---

## 💡 Use Cases

Whether you're a digital professional or casual user, Mass Image Downloader adapts to multiple workflows:

- 📚 **Academic and research scraping**  
  Extract figures, diagrams, or scientific images from journals and data repositories for study or analysis.

- 🖼️ **Art and portfolio archiving**  
  Collect high-resolution artwork from online portfolios, Behance, ArtStation, or DeviantArt in batch mode.

- 🛍️ **Ecommerce product comparison**  
  Bulk download product images for internal cataloging, competitor analysis, or sourcing purposes.

- 🧠 **UI/UX inspiration harvesting**  
  Curate collections of interface samples, icon sets, or component ideas from design sites like Dribbble or Awwwards.

- 📷 **Media and press kit backup**  
  Archive photosets, press releases, or campaign visuals from brand pages or media centers.

- 🧩 **Blog series and paginated content**  
  Seamlessly follow image trails across paginated blog posts or user galleries and download all assets at once.

- 🔍 **Visual investigation and OSINT**  
  Capture photo evidence, memes, or screenshots for archiving in investigations or social listening tasks.

- 🔬 **Dataset preparation for AI/ML**  
  Aggregate diverse image sources to feed computer vision pipelines or custom image classifiers.

- 🖥️ **Web development and testing**  
  Download assets for local development, testing, or quality assurance of web applications.

> 🚀 Power users can customize everything from file naming to concurrency and download limits, enabling granular control for large-scale tasks.

---

## 🧠 Advanced Usage & Developer Tips

Mass Image Downloader includes several diagnostic and debug tools for advanced users and contributors. Below are some tips and features available when working under the hood:

1. Open console (`Ctrl+Shift+I`) to see detailed logs.
2. Adjust debug level (0–3) from Options.
3. Prefix/suffix via clipboard helps batch renaming.
4. Use fallback logic when galleries are irregular.
5. Grouping uses path similarity (%) → tweak it from the Options page as needed.

---

### 🐞 Enable Console Debug Logging

You can control how much information the extension logs to the console via the **Debug Log Level** option in the settings panel:

| Level | Description                      |
|-------|----------------------------------|
| 0     | Silent (no logs)                 |
| 1     | Basic flow logs                  |
| 2     | Verbose (warnings, milestones)   |
| 3     | Detailed logs with stack traces  |

> 🔍 Logs will appear in the **Developer Tools console** (`Ctrl+Shift+I` → Console tab) under `[Mass image downloader]:`.

---

### 🧪 View Live Flow Details

Most actions log internal steps with emojis:

- `✅` Success indicators
- `❌` Errors and exceptions
- `🔄` Loops and iteration state
- `📦` Batch status
- `🧠` Grouping calculations
- `⚠️` Warnings or validation skips

This helps track:

- Why an image was skipped
- When grouping fails
- When fallback modes are triggered

---

### 🖼️ Test Image Thresholds

To test size validation, try adjusting:

- **Min Width** / **Min Height**
- Use pages with mixed image resolutions (e.g., Unsplash thumbnails vs originals)
- Watch for messages like: `⛔ Skipped (too small - 240x180)`

---

### 🧬 Simulate Gallery Extraction Failures

To force fallback grouping and test robustness:

1. Set **Smart Grouping = Enabled**
2. Set **Similarity Threshold = 90%**
3. Use a gallery with inconsistent URL patterns
4. Observe fallback logic activating (`🛟 Retrying with fallback threshold...`)

> 🧪 Useful for testing robustness of fallback logic during gallery inconsistencies.

---

### 📦 Inspect Badge Behavior

The badge updates:

- 🟢 Green: Active downloads
- 🔵 Blue: Completed
- Hidden: When idle

Open the console and track:

```plaintext
✅ Badge updated successfully.
🔄 Images processed so far: 7
👌 Finished processing. Total images processed: 14
```

---

### 💻 Contribute or Extend

To explore the source code:

```bash
git clone https://github.com/del-Pacifico/Mass-Image-Downloader.git
cd Mass-Image-Downloader
```

You can modify:
- UI: `popup.html`, `options.html`
- Logic: `background.js`, `extract*.js`
- Utilities: `utils.js`
- Logging: `logDebug(...)` in `utils.js`

Then reload the extension via `chrome://extensions/` → **Reload**.

> 🧠 All files are ES Modules. No bundler or transpiler is required.

---

## ⚠️ Edge Cases & Warnings

- CSP or lazy-loading sites may prevent downloads.
- Base64/CSS images not supported.
- Important: Make sure the browser setting “Ask where to save each file before downloading” is disabled.

> ✍🏻 Disable “Ask where to save each file before downloading” in browser settings.

- Some galleries without direct links may require manual download via icon.
- Massive galleries (>100 images) may momentarily slow the UI.
- Use throttling to avoid overloading weak machines.
- Only works in same window where extension is triggered.

---

## 🔗 Related Projects

Looking for other powerful tools?

- 🧙‍♂️ [Unicode to PNG](https://github.com/del-Pacifico/unicode-to-png)  
  A Python utility to convert Unicode emoji into PNG files using system fonts.  
  Ideal for emoji asset generation, custom packs, or UI prototyping.

---

## 💖 Support the Project

**Mass Image Downloader** is a free and open-source tool maintained during personal time.  
If it has helped you save time or improve your workflow, consider supporting its continued development:

- 💸 [Donate via PayPal](https://paypal.me/spalmah?country.x=CL&locale.x=es_XC)

> 🙏 Every bit of support is truly appreciated.  
> 💬 Feel free to reach out with questions, ideas, or feedback — your input matters!

---

## 🙌 Contributions

Suggestions, new features, issues, troubleshooting or PRs are welcome! Open an issue or discussion for feedback.
Project is now maintained under:  
[github.com/del-Pacifico/Mass-Image-Downloader](https://github.com/del-Pacifico/Mass-Image-Downloader)

---

![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow?style=flat-square&logo=javascript)
![No Tracking](https://img.shields.io/badge/Privacy-No%20tracking-blueviolet?style=flat-square&logo=shield)
![Lightweight](https://img.shields.io/badge/Built-lightweight-lightgrey?style=flat-square)
![Modular Design](https://img.shields.io/badge/Architecture-Modular-informational?style=flat-square)
![ES Modules](https://img.shields.io/badge/ESM-Enabled-success?style=flat-square&logo=javascript)
![Cross Platform](https://img.shields.io/badge/Compatible-Chromium%2090%2B-important?style=flat-square&logo=googlechrome)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen?style=flat-square&logo=github)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?style=flat-square)
