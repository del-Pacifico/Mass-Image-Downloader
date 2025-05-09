# 🖼️ Mass Image Downloader

![Version](https://img.shields.io/badge/version-2.07.139-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MPL--2.0-green?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Chromium%2090%2B-orange?style=flat-square&logo=googlechrome)
![GitHub community standards](https://img.shields.io/badge/community%20standards-100%25-brightgreen?style=flat-square&logo=github)

---

## 📚 Table of Contents

- [🚀 Features](#-features)
- [⚙️ Options Available](#️-options-available)
- [🧩 How It Works](#-how-it-works)
- [🧠 Technical Design](#-technical-design)
- [💾 Installation](#-installation)
- [📌 Show Extension Icon in Toolbar](#-show-extension-icon-in-toolbar)
- [💡 Recommended Setup](#-recommended-setup)
- [🔒 Privacy](#-privacy)
- [📄 License](#-license)
- [📜 Changelog](#-changelog)
- [💡 Use Cases](#-use-cases)
- [🧠 Advanced Usage & Developer Tips](#-advanced-usage--developer-tips)
- [⚠️ Edge Cases & Warnings](#️-edge-cases--warnings)
- [🙌 Contributions](#-contributions)

---

**Mass Image Downloader** is a high-performance, privacy-first browser extension built to streamline the process of bulk image extraction and download. Whether you're a designer, researcher, archivist, or content curator, this tool gives you precision and control at scale.

Designed for Chromium-based browsers like **Chrome**, **Edge**, and **Brave**, it combines intelligent image grouping, customizable filtering, and a frictionless user experience—without sacrificing speed or transparency.

> 🚀 Modular. 🔍 Accurate. 🧠 Smart.  
> Built for users who care about efficiency, clarity, and results.

---

## 🚀 Features

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

## ⚙️ Options Available

Mass Image Downloader offers a wide range of customizable settings. Options are persisted using `chrome.storage.sync`, meaning your preferences are retained across sessions and devices (if signed in).

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

## 🧩 How It Works

This extension offers multiple ways to detect, group, and download images depending on how the target page is structured. Below are all supported modes, what they do, and how they behave in different scenarios:

---

### 📸 Download Images in Open Tabs

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

### 📋 Clipboard Hotkeys

This utility mode lets you assign the current clipboard text as a filename **prefix** or **suffix** using keyboard shortcuts.

**Key Combos:**

- `Ctrl + Alt + P`: Assigns clipboard content as **prefix**.
- `Ctrl + Alt + S`: Assigns clipboard content as **suffix**.

**Behavior:**

1. Validates the clipboard input (alphanumeric only, trimmed, max length).
2. Saves it to extension settings (persisted via `chrome.storage.sync`).
3. Shows a toast message confirming success or explaining the error.

> ✂️ Great for naming groups of images consistently before triggering a download.

Each of these flows is independent, and can be used as needed based on the structure of the page you're browsing. You can launch them from the extension's popup window using the respective buttons.

---

## 🧠 Technical Design

Mass Image Downloader follows a modular, resilient, and scalable architecture designed for performance, privacy, and maintainability.

### 🧩 Modular Architecture

| File                    | Purpose                                                                 |
|-------------------------|-------------------------------------------------------------------------|
| `background.js`         | Orchestrates core logic: downloading, grouping, messaging, state        |
| `popup.js`              | Triggers flows via buttons and injects scripts                          |
| `options.js / .html`    | Loads, displays, validates and saves settings                           |
| `extract*.js`           | Each handles a different extraction mode (linked, visual, web-linked)   |
| `clipboardHotkeys.js`   | Manages global hotkeys for setting prefix/suffix                        |
| `utils.js`              | Logging, badge updates, validation, filename generation, messages       |

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
  - `✅` Success
  - `❌` Error
  - `🔄` Iteration
  - `⚠️` Warning

### 🔒 Safe, Non-Intrusive Design

- Fully local: no telemetry, tracking, or analytics.
- Failsafe tab closing logic with deduplication.
- Robust image validation (via `HEAD` + `ImageBitmap`).

### 📦 File-Naming Strategy

- Dynamic names using `prefix`, `suffix`, `timestamp`, or base name.
- Prevents overwrites using `conflictAction: 'uniquify'`.

---

## 💾 Installation

Mass Image Downloader is not yet published in the Chrome Web Store.  
You can install it manually using the source code provided in the GitHub repository.

---

### 👤 For Regular Users (No technical skills required)

1. Visit the [GitHub repository](https://github.com/sergiopalmah/Mass-Image-Downloader).
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
git clone https://github.com/sergiopalmah/Mass-Image-Downloader.git
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
git clone https://github.com/sergiopalmah/Mass-Image-Downloader.git
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

This extension is fully local. No data is collected or transmitted.  
No external APIs are used. Settings are stored via `chrome.storage.sync`.

---

## 📄 License

This project is licensed under the [Mozilla Public License v. 2.0](https://www.mozilla.org/MPL/2.0/).

---

## 📜 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for full release history.

---

## 💡 Use Cases

- 📚 Academic scraping for diagrams or charts.
- 🎨 Visual collection from design portfolios.
- 🗞️ Archiving high-res media images.
- 🛍️ Product scraping for comparisons (ethically).
- 📁 Image curation from multiple search results.

---

## 🧠 Advanced Usage & Developer Tips

Mass Image Downloader includes several diagnostic and debug tools for advanced users and contributors. Below are some tips and features available when working under the hood:

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
git clone https://github.com/sergiopalmah/Mass-Image-Downloader.git
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
- "Ask where to save" must be disabled in browser.
- Some galleries need proper `<a>` links to be detected.
- Massive galleries may slow down page briefly.
- Only works in same window where extension is triggered.

---

## 🙌 Contributions

New feaures? Issues? Throubleshooting? PRs welcome. Open an issue or discussion for feedback.

---

![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow?style=flat-square&logo=javascript)
![No Tracking](https://img.shields.io/badge/Privacy-No%20tracking-blueviolet?style=flat-square&logo=shield)
![Lightweight](https://img.shields.io/badge/Built-lightweight-lightgrey?style=flat-square)
![Modular Design](https://img.shields.io/badge/Architecture-Modular-informational?style=flat-square)
![ES Modules](https://img.shields.io/badge/ESM-Enabled-success?style=flat-square&logo=javascript)
![Cross Platform](https://img.shields.io/badge/Compatible-Chromium%2090%2B-important?style=flat-square&logo=googlechrome)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen?style=flat-square&logo=github)
