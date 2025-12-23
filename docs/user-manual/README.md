# 🏔️ Mass Image Downloader – User Manual (Basic)

**Applies to version:** `v2.08.149`  
**Branch:** `main`

This manual is intended for end users and explains how to install, configure, and use **Mass Image Downloader** effectively, without requiring technical knowledge.

---

## 📑 Table of Contents

- [🧭 1. Introduction](#-1-introduction)
  - [🏔️ 1.1 What is Mass Image Downloader](#-11-what-is-mass-image-downloader)
  - [👤 1.2 Who This Manual Is For](#-12-who-this-manual-is-for)
  - [🌐 1.3 Supported Browsers](#-13-supported-browsers)

- [📦 2. Installation](#-2-installation)
  - [⬇️ 2.1 Downloading the Extension from GitHub](#-21-downloading-the-extension-from-github)
  - [🧩 2.2 Installing the Extension in the Browser](#-22-installing-the-extension-in-the-browser)
  - [⚙️ 2.3 Required Browser Settings](#-23-required-browser-settings)

- [🪟 3. Popup Overview](#-3-popup-overview)
  - [🔓 3.1 Opening the Extension Popup](#-31-opening-the-extension-popup)
  - [🧭 3.2 Overview of the Popup Layout](#-32-overview-of-the-popup-layout)
  - [🎯 3.3 How to Use the Popup Safely](#-33-how-to-use-the-popup-safely)

- [🧩 4. Available Features (Overview)](#-4-available-features-overview)
  - [📸 4.1 Bulk Image Download](#-41-bulk-image-download)
  - [🌄 4.2 Extract Images from Galleries (With Direct Links)](#-42-extract-images-from-galleries-with-direct-links)
  - [🖼️ 4.3 Extract Images from Galleries (Without Links)](#-43-extract-images-from-galleries-without-links)
  - [🔗 4.4 Extract Images from Web-Linked Galleries](#-44-extract-images-from-web-linked-galleries)
  - [🔎 4.5 View Settings (Peek)](#-45-view-settings-peek)
  - [🕵️ 4.6 Image Inspector](#-46-image-inspector)

- [📸 5. Bulk Image Download](#-5-bulk-image-download)
  - [❓ 5.1 What Bulk Image Download Does](#-51-what-bulk-image-download-does)
  - [🕒 5.2 When to Use Bulk Image Download](#-52-when-to-use-bulk-image-download)
  - [🪜 5.3 Step-by-Step Usage](#-53-step-by-step-usage)
  - [🔄 5.4 What Happens During the Process](#-54-what-happens-during-the-process)
  - [✅ 5.5 Expected Results](#-55-expected-results)

- [🌄 6. Extract Images from Galleries (With Direct Links)](#-6-extract-images-from-galleries-with-direct-links)
  - [🔗 6.1 What This Mode Is For](#-61-what-this-mode-is-for)
  - [🧪 6.2 Typical Gallery Example](#-62-typical-gallery-example)
  - [🪜 6.3 Step-by-Step Usage](#-63-step-by-step-usage)
  - [🧠 6.4 How Images Are Selected](#-64-how-images-are-selected)
  - [📥 6.5 Expected Results](#-65-expected-results)

- [🖼️ 7. Extract Images from Galleries (Without Links)](#-7-extract-images-from-galleries-without-links)
  - [👁️ 7.1 What Is a Visual Gallery](#-71-what-is-a-visual-gallery)
  - [🧭 7.2 When to Use This Mode](#-72-when-to-use-this-mode)
  - [🪜 7.3 Step-by-Step Usage](#-73-step-by-step-usage)
  - [🎯 7.4 How Images Are Chosen](#-74-how-images-are-chosen)
  - [✅ 7.5 Expected Results](#-75-expected-results)

- [🔗 8. Extract Images from Web-Linked Galleries](#-8-extract-images-from-web-linked-galleries)
  - [🌐 8.1 What Are Web-Linked Galleries](#-81-what-are-web-linked-galleries)
  - [🧭 8.2 When to Use This Mode](#-82-when-to-use-this-mode)
  - [🪜 8.3 Step-by-Step Usage](#-83-step-by-step-usage)
  - [📥 8.4 Expected Results](#-84-expected-results)

- [⚙️ 9. Settings (User View)](#-9-settings-user-view)
  - [🔓 9.1 Accessing the Settings Page](#-91-accessing-the-settings-page)
  - [🌍 9.2 Global Settings Explained](#-92-global-settings-explained)
  - [📸 9.3 Bulk Image Download Settings](#-93-bulk-image-download-settings)
  - [🖼️ 9.4 Gallery Extraction Settings](#-94-gallery-extraction-settings)
  - [⭐ 9.5 Recommended Default Values](#-95-recommended-default-values)

- [🏷️ 10. Badge and Visual Feedback](#-10-badge-and-visual-feedback)
  - [🔢 10.1 Badge Counter Meaning](#-101-badge-counter-meaning)
  - [🎨 10.2 Badge Colors](#-102-badge-colors)
  - [💬 10.3 User Feedback Messages](#-103-user-feedback-messages)

- [💡 11. Common Use Cases](#-11-common-use-cases)
  - [🎨 11.1 Design and Creative Research](#-111-design-and-creative-research)
  - [🗄️ 11.2 Media and Content Archiving](#-112-media-and-content-archiving)
  - [🎓 11.3 Academic and Research Use](#-113-academic-and-research-use)
  - [🛍️ 11.4 Product and Catalog Browsing](#-114-product-and-catalog-browsing)

- [⚠️ 12. Best Practices and Warnings](#-12-best-practices-and-warnings)
  - [✅ 12.1 Best Practices for Reliable Downloads](#-121-best-practices-for-reliable-downloads)
  - [🚫 12.2 Known Limitations](#-122-known-limitations)
  - [❗ 12.3 Common Mistakes to Avoid](#-123-common-mistakes-to-avoid)

- [🔒 13. Privacy and Data Handling](#-13-privacy-and-data-handling)
  - [🏠 13.1 Local-Only Operation](#-131-local-only-operation)
  - [🚫 13.2 Data Collection Policy](#-132-data-collection-policy)

- [🆘 14. Getting Help and Providing Feedback](#-14-getting-help-and-providing-feedback)
  - [💬 14.1 Where to Ask Questions](#-141-where-to-ask-questions)
  - [🐞 14.2 Reporting Issues](#-142-reporting-issues)

---

## 🧭 1. Introduction

### 🏔️ 1.1 What is Mass Image Downloader

**Mass Image Downloader** is a browser extension designed to help you **download multiple images efficiently from web pages**, without doing repetitive manual work.

Instead of saving images one by one, the extension allows you to:

- Download images from multiple open tabs at once
- Extract images from galleries and collections
- Automatically filter images by size and format
- Save images directly to your local download folder

The extension works entirely **inside your browser** and focuses on being fast, predictable, and respectful of your workflow.

It is especially useful when dealing with websites that contain:
- Large image collections
- Product catalogs
- Photo galleries
- Research or reference material

---

### 👤 1.2 Who This Manual Is For

This **User Manual (Basic)** is written for:

- General users with no technical background
- Designers, illustrators, and creative professionals
- Researchers, students, and educators
- Anyone who needs to collect images efficiently for legitimate use

You **do not need** to understand how the extension is built internally.
This manual focuses on:
- What each feature does
- When to use it
- How to use it safely and correctly

If you are looking for deeper technical explanations or internal behavior details, those are covered in separate manuals.

---

### 🌐 1.3 Supported Browsers

Mass Image Downloader works on **Chromium-based browsers**.

Supported browsers include:

- Google Chrome
- Microsoft Edge
- Brave
- Other Chromium-based browsers

**Minimum supported browser version:**  
Chromium 93 or newer

If you are using an older browser version, some features may not work correctly or may not be available.

---

## 📦 2. Installation

This section explains how to download and install **Mass Image Downloader** manually from GitHub, and how to prepare your browser for correct operation.

---

### ⬇️ 2.1 Downloading the Extension from GitHub

Mass Image Downloader is distributed as **open-source software** through GitHub.

To download it:

1. Open the project repository on GitHub.
2. Go to the **Releases** section.
3. Locate the release that matches the version indicated at the top of this manual.
4. Download the source code package (ZIP file).
5. Extract the ZIP file to a folder on your computer.

Choose a permanent location for this folder.  
Do not delete or move it after installation, as the browser will reference it.

---

### 🧩 2.2 Installing the Extension in the Browser

Mass Image Downloader is installed using the **“Load unpacked”** method available in Chromium-based browsers.

Follow these steps:

1. Open your browser.
2. Navigate to the Extensions page:
   - In the address bar, type `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the folder where you extracted the extension files.
6. Confirm the selection.

Once installed, the extension icon should appear in your browser toolbar.

If you do not see the icon:
- Click the Extensions menu (puzzle icon)
- Pin **Mass Image Downloader** to the toolbar

---

### ⚙️ 2.3 Required Browser Settings

To ensure smooth and automatic downloads, a few browser settings are recommended.

#### Disable “Ask where to save each file”

This setting prevents the browser from asking for confirmation on every download.

To disable it:

1. Open browser **Settings**.
2. Go to **Downloads**.
3. Turn **off** the option:
   - “Ask where to save each file before downloading”

This allows the extension to download images automatically without interruptions.

---

#### Recommended Settings Summary

For best results, ensure that:

- Developer mode is enabled
- The extension folder remains unchanged
- Automatic downloads are allowed
- The browser is updated to a supported version

Once installation is complete, you are ready to start using the extension.

---

## 🪟 3. Popup Overview

The popup is the **main control panel** of Mass Image Downloader.  
From here, you can access all available features and start download processes.

Understanding the popup layout will help you choose the right action and avoid unexpected behavior.

---

### 🔓 3.1 Opening the Extension Popup

To open the popup:

1. Locate the 🏔️ **Mass Image Downloader** icon in your browser toolbar.
2. Click the icon once.

The popup will appear immediately and display the available actions.

If you do not see the icon:
- Click the Extensions menu (🧩 puzzle icon)
- Pin 🏔️ **Mass Image Downloader** to the toolbar for easier access

---

### 🧭 3.2 Overview of the Popup Layout

The popup is designed to be **simple and action-focused**.

Inside the popup, you will typically find:

- Action buttons to start different download modes
- Short labels describing each feature
- Access to settings and auxiliary tools

Each button represents a **specific feature** of the extension.
You do not need to configure anything before clicking a button if default settings are in place.

---

### 🎯 3.3 How to Use the Popup Safely

Before starting a download process, keep these recommendations in mind:

- Make sure the current tab contains relevant content
- Avoid clicking multiple actions at the same time
- Allow the process to finish before starting a new one
- Do not close the browser while downloads are running

The popup does not show progress bars.
Instead, progress and status are communicated through:
- The extension badge
- Visual feedback messages (when enabled)

More details about these indicators are explained later in this manual.


It is recommended to always keep your browser updated to ensure:
- Best performance
- Compatibility with new features
- Proper security behavior

---

## 🧩 4. Available Features (Overview)

Mass Image Downloader provides several features designed to handle different image extraction scenarios.

This section gives a **high-level overview** of each feature, helping you understand:
- What each feature is for
- When to use it
- What kind of results to expect

Detailed step-by-step instructions are provided in later sections.

---

### 📸 4.1 Bulk Image Download

This feature allows you to **download images from multiple open tabs at once**.

It scans the currently open browser tabs, identifies valid images, and downloads them automatically based on your settings.

Use this feature when:
- You have several tabs open, each containing an image
- You want to save images quickly without opening them one by one

---

### 🌄 4.2 Extract Images from Galleries (With Direct Links)

This feature is designed for galleries where **thumbnails link directly to image files**.

The extension follows those links and downloads the images efficiently, without opening unnecessary pages.

Use this feature when:
- Clicking a thumbnail opens the image directly
- The gallery consists of linked image files

---

### 🖼️ 4.3 Extract Images from Galleries (Without Links)

This feature works with **visual galleries** where images are displayed directly on the page, without direct links.

The extension analyzes the page and selects images that match size and format criteria.

Use this feature when:
- Images are shown inline on the page
- There are no direct links to image files

---

### 🔗 4.4 Extract Images from Web-Linked Galleries

This feature handles galleries where **thumbnails link to separate web pages**, not directly to images.

The extension opens those pages automatically, detects the best image available, and downloads it.

Use this feature when:
- Clicking a thumbnail opens a new page with the image
- The image is loaded dynamically or embedded in content pages

---

### 🔎 4.5 View Settings (Peek)

This feature allows you to **quickly view your current settings** without opening the full settings page.

It helps you verify:
- Active configuration values
- Limits and filters currently in use

Use this feature when:
- You want to double-check settings before starting a download
- You need quick confirmation without interrupting your workflow

---

### 🕵️ 4.6 Image Inspector

The Image Inspector allows you to **manually inspect and download a specific image** from the current page.

It provides a focused view of image details and gives you full control over the download action.

Use this feature when:
- You want to download a single image
- You need to verify image details before saving
- Automatic extraction is not suitable for the page

---

## 📸 5. Bulk Image Download

Bulk Image Download is designed to help you **download images from multiple open tabs automatically**, without manual intervention.

This feature is fast, efficient, and ideal when working with many image pages at the same time.

---

### ❓ 5.1 What Bulk Image Download Does

When you start Bulk Image Download, the extension:

- Scans all currently open browser tabs
- Identifies tabs that contain valid image content
- Applies size and format filters
- Downloads the images automatically
- Closes tabs when the process finishes (depending on configuration)

The process runs in the background and requires no further interaction once started.

---

### 🕒 5.2 When to Use Bulk Image Download

Use this feature when:

- You have many tabs open, each displaying an image
- You want to save images quickly and consistently
- Images are already loaded in their own tabs
- Manual saving would be slow or repetitive

Typical scenarios include:
- Browsing image search results
- Reviewing product images in separate tabs
- Collecting reference material

---

### 🪜 5.3 Step-by-Step Usage

To use Bulk Image Download:

1. Open all tabs that contain the images you want to save.
2. Make sure each tab displays a valid image.
3. Open the 🏔️ **Mass Image Downloader** popup.
4. Click 📸 **Bulk Image Download**.
5. Wait while the extension processes the tabs.

No confirmation dialogs are required if browser download settings are correctly configured.

---

### 🔄 5.4 What Happens During the Process

While the process is running:

- Tabs are evaluated one by one
- Images are downloaded in batches
- Progress is shown using the extension badge
- Tabs may close automatically after successful download

The browser remains usable during this time, but it is recommended not to interfere until the process completes.

---

### ✅ 5.5 Expected Results

After completion:

- Images are saved in your default download folder
- File names are generated automatically to avoid overwriting
- The extension badge updates to reflect completion

If no valid images are found, no downloads will occur.

This behavior is normal and indicates that the open tabs did not meet the required criteria.

---

## 🌄 6. Extract Images from Galleries (With Direct Links)

This feature is optimized for galleries where **thumbnails link directly to image files** (for example, clicking a thumbnail opens the image itself).

It provides a fast and reliable way to download images without opening unnecessary pages.

---

### 🔗 6.1 What This Mode Is For

Use this mode when:

- Thumbnails are wrapped in links pointing directly to image files
- Clicking a thumbnail opens the image (not an intermediate page)
- The gallery structure is simple and consistent

In these cases, the extension can follow the links and download images efficiently.

---

### 🧪 6.2 Typical Gallery Example

A typical supported gallery looks like this:

- A grid of thumbnails
- Each thumbnail is clickable
- The link behind each thumbnail points directly to an image file (JPG, PNG, WEBP, etc.)

This structure is common in image boards, media libraries, and product galleries.

---

### 🪜 6.3 Step-by-Step Usage

To extract images from a gallery with direct links:

1. Open the web page that contains the gallery.
2. Ensure the thumbnails link directly to image files.
3. Open the **Mass Image Downloader** popup.
4. Select **Extract Images from Galleries (With Direct Links)**.
5. Wait while the extension processes the gallery.

The process runs automatically and does not require further input.

---

### 🧠 6.4 How Images Are Selected

During extraction, the extension:

- Follows the links associated with gallery thumbnails
- Filters images based on size and format rules
- Skips images that do not meet the criteria

Only valid images are selected and downloaded.

---

### 📥 6.5 Expected Results

After completion:

- Images are downloaded to your default download folder
- Files are named automatically to avoid duplicates
- No additional pages remain open

If the gallery does not contain valid direct image links, no images will be downloaded.

---

## 🖼️ 7. Extract Images from Galleries (Without Links)

This feature is designed for **visual galleries** where images are displayed directly on the page and **do not link to image files**.

Instead of following links, the extension analyzes the page content and selects images based on visual and size criteria.

---

### 👁️ 7.1 What Is a Visual Gallery

A visual gallery typically has the following characteristics:

- Images are displayed inline on the page
- Thumbnails are not clickable, or clicking them does not open the image file
- Images may be part of a layout, grid, or article content

This type of gallery is common in blogs, portfolios, news sites, and modern web layouts.

---

### 🧭 7.2 When to Use This Mode

Use this feature when:

- There are no direct links to image files
- Images are embedded directly in the page
- Other gallery extraction modes do not detect images correctly

This mode is especially useful when the page relies on layout-based image presentation.

---

### 🪜 7.3 Step-by-Step Usage

To extract images from a visual gallery:

1. Open the page that contains the gallery.
2. Ensure the images are visible and fully loaded.
3. Open the **Mass Image Downloader** popup.
4. Select **Extract Images from Galleries (Without Links)**.
5. Wait while the extension analyzes the page.

The extraction process runs automatically.

---

### 🎯 7.4 How Images Are Chosen

During analysis, the extension:

- Scans all visible images on the page
- Applies minimum size and format rules
- Ignores icons, logos, and decorative images

Only images that meet the criteria are selected for download.

---

### ✅ 7.5 Expected Results

After completion:

- Valid images are downloaded to your default download folder
- Files are named automatically
- No extra tabs are opened

If no images meet the criteria, no downloads will occur.
This indicates that the images on the page are too small or do not match the filters.

---

## 🔗 8. Extract Images from Web-Linked Galleries

This feature is designed for galleries where **thumbnails link to separate web pages**, not directly to image files.

In these cases, the image you want is usually embedded inside a content page.  
The extension automatically opens those pages, finds the best image available, and downloads it.

---

### 🌐 8.1 What Are Web-Linked Galleries

A web-linked gallery typically works like this:

- A page shows a list or grid of thumbnails
- Each thumbnail links to a **detail page**
- The actual image is displayed inside that page, often with additional content

This structure is common in:
- Photography websites
- Art portfolios
- Media platforms
- Product or item detail pages

---

### 🧭 8.2 When to Use This Mode

Use this feature when:

- Clicking a thumbnail opens a new page
- The image is not directly downloadable from the gallery view
- Other gallery modes do not extract images correctly

This mode is especially useful for modern websites that separate previews from content pages.

---

### 🪜 8.3 Step-by-Step Usage

To extract images from web-linked galleries:

1. Open the page that contains the gallery.
2. Ensure that thumbnails link to content pages.
3. Open the **Mass Image Downloader** popup.
4. Select **Extract Images from Web-Linked Galleries**.
5. Wait while the extension processes the gallery.

The extension will automatically:
- Open linked pages in the background
- Detect the main image
- Download it based on your settings

---

### 📥 8.4 Expected Results

After completion:

- Images are downloaded to your default download folder
- Temporary tabs opened during the process are closed automatically
- File names are generated to avoid duplicates

If no images are downloaded, it usually means that the linked pages do not contain valid images matching the configured criteria.

---

## ⚙️ 9. Settings (User View)

The Settings page lets you control **what counts as a “valid image”**, how fast the extension works, and how downloads are named and saved.

If something is not downloading as expected, the answer is usually here.

---

### 🔓 9.1 Accessing the Settings Page

1. Open the **Mass Image Downloader** popup.
2. Click **Settings**.
3. A new tab opens with the full configuration panel.
4. Click **💾 Save Settings** when you are done.

Tip: You can keep the settings tab open while testing different sites.

---

### ⚙️ 9.2 Performance Presets (Recommended Starting Point)

Before changing individual options, choose a preset:

- **Low Spec** — safer for older laptops (slow, minimal parallel work)
- **Medium Spec** — balanced default for most computers
- **High Spec** — fastest, more parallel work (requires more RAM/CPU)
- **Custom (auto-set)** — activates automatically when you manually tweak any option

Presets update multiple settings at once (batching, concurrency, filters, gallery behavior).  
If you are unsure: start with **Medium Spec**.

---

### 📁 9.3 File System (Where and What Gets Saved)

#### Choose Download Folder
- **Default system folder** (recommended): downloads go to your browser/system Downloads folder.
- **Custom folder**: enables a text field where you provide a folder path.

Notes:
- If you use a custom folder, keep it stable (do not rename/move it frequently).
- If you see downloads going to an unexpected place, double-check which radio is selected.

#### Allowed Image Formats
Select which formats are considered valid:
- **JPG / JPEG / PNG / WEBP** (commonly used)
- **AVIF / BMP** (optional)

Recommendation:
- Keep JPG/JPEG/PNG enabled for the best compatibility.
- Enable AVIF only if you know your target sites provide AVIF images.

#### Allow extended image URLs
Enable this if you download from sites that use URL modifiers like `:large` or `:orig` (for example Twitter/X or Pixiv).
If you mainly download from “classic” galleries, you can keep it off.

---

### 🏷️ 9.4 Filename Customization (Prefix / Suffix / Timestamp)

Use this to keep your downloads organized.

Modes:
- **None**: keep original naming (recommended to start)
- **Prefix**: adds text before the filename
- **Suffix**: adds text after the filename
- **Both**: adds both prefix and suffix
- **Timestamp**: adds a timestamp to reduce naming collisions

Examples:
- Prefix: `project_001.jpg`
- Suffix: `001_reference.jpg`
- Timestamp: `001_20251223-153012.jpg`

Tip:
- Use short, readable values (e.g., `ref`, `moodboard`, `catalog`).
- Use the clipboard buttons (📋 / ❌) to paste or clear quickly.

---

### 📐 9.5 Image Size Filters (Most Common Reason for “No Downloads”)

These two values define the minimum size an image must have to be downloaded:

- **Minimum Image Width (px)** (default: 800)
- **Minimum Image Height (px)** (default: 600)

If nothing downloads:
1. Lower the minimum width/height slightly
2. Save settings
3. Retry on the same page

Recommendations:
- For high-quality photos: keep defaults or increase them
- For smaller galleries or older sites: lower them carefully

Avoid setting them too low, or you may download icons, logos, and decorative images.

---

### 🖼️ 9.6 Galleries (Direct Links + Without Links)

These settings affect all gallery extraction modes.

#### Gallery Image Handling
Choose what happens after gallery images are detected:
- **Download immediately**: fastest, downloads in the background
- **Open in new tab before downloading**: more visual and controlled (slower), useful when sites load images dynamically

#### Max images per second
Limits how fast gallery images are processed:
- Range: **1 to 10**
- Default: **3**

Recommendations:
- Lower values (1–2) if a site is sensitive or your PC is slower
- Higher values (4–6) if the site is stable and your PC is strong

#### Similarity Grouping (Optional, but Useful)
These options help the extension detect “which images belong together” as a gallery:

- **Gallery Similarity Level (%)** (30–100, default: 70)
  - Higher = stricter grouping (fewer, more related images)
  - Lower = more permissive grouping (more images, higher risk of unrelated results)

- **Minimum Group Size** (2–50, default: 3)
  - How many similar images must exist before a group is considered a real gallery

- **Enable smart similarity grouping**
  - Recommended when gallery pages contain many thumbnails and repeated patterns

- **Enable fallback grouping**
  - Helpful when sites have inconsistent URL patterns (tries again with a more permissive grouping)

Practical guidance:
- If you get too few images: slightly lower similarity or enable fallback
- If you get unrelated images: increase similarity and/or increase minimum group size

---

### 🔗 9.7 Web-Linked Galleries (Thumbnails Open a Page)

These settings matter when thumbnails link to HTML pages (not direct image files).

#### Max open tabs per gallery
Controls how many linked pages can be opened in parallel:
- Range: **1 to 10**
- Default: **5**

Recommendations:
- Use 2–4 on slower machines
- Use 5–8 on stronger machines
- If your browser becomes slow, lower this first

#### Delay between tab openings (ms)
Controls how quickly pages are opened:
- Range: **100 to 3000 ms**
- Default: **500 ms**

Recommendations:
- Increase delay if a website blocks or rate-limits you
- Decrease delay only if the site is stable and responsive

---

### 📸 9.8 Bulk Image Download (Tabs)

These settings apply to Bulk Image Download.

#### Max images per batch
Controls how many images/tabs are processed at once:
- Range: **1 to 50**
- Recommended: 10–25 for most systems

If your browser freezes or becomes unresponsive, reduce this value.

#### Continue from where it left off
When enabled, the extension tries to resume after interruptions or skipped items.
Enable it for long sessions.

---

### 🔎 9.9 View Settings (Peek)

Peek allows you to quickly review your current configuration without opening the full Settings page.

#### Peek panel transparency
- Range: **0.2 to 1.0**
- Default: **0.8**

Higher values improve readability. Lower values allow more background visibility.

Note:
- In the current version, Peek is accessed from the extension interface.
- There is no dedicated keyboard shortcut for Peek in this release.

---

### 🖱️ 9.10 One-click Download Icon

The One-click Download Icon allows you to quickly download the **best image detected on the current page** using a keyboard shortcut.

#### How it works
- When activated, a small 💾 icon is injected over the highest-resolution valid image.
- Clicking the icon sends the image to the background downloader.
- All standard rules apply (minimum size, allowed formats, extended URLs).

#### How to enable
1. Open **Settings**
2. Go to **One-click Download Icon**
3. Enable **“Enable One-click download icon (via hotkey)”**
4. Save settings

#### Keyboard shortcut
- **Alt+Shift+I** — injects the one-click download icon

Notes:
- This shortcut works **only if the option is enabled**
- If no valid images are detected, the icon will not appear
- This feature is ideal for downloading a single image quickly without using galleries or bulk modes

---

### 📋 9.11 Clipboard Hotkeys (Optional)

Clipboard hotkeys allow you to quickly apply naming rules using text already copied to your clipboard.

#### How it works
When enabled, the extension reads the clipboard content and applies it as a prefix or suffix.

#### How to enable
1. Open **Settings**
2. Go to **Clipboard Hotkeys**
3. Enable **“Enable clipboard shortcuts for prefix/suffix”**
4. Save settings

#### Keyboard shortcuts
- **Ctrl+Alt+P** — set prefix from clipboard (when prefix mode is active)
- **Ctrl+Alt+S** — set suffix from clipboard (when suffix mode is active)

Notes:
- These shortcuts only work on the active tab
- The corresponding filename mode (prefix/suffix/both) must be selected

---

### 📢 9.12 Notifications

#### Show user feedback messages
When enabled, the extension shows visual messages for:
- Success
- Progress
- Errors

Recommendation:
- Keep this enabled while learning the tool
- Disable it only if you want a quieter UI

---

### 🐛 9.13 Debugging (Optional)

#### Console log level (0–3)
Controls how much information is written to the browser console.

For basic users:
- Keep it at **1 (Basic)**

For troubleshooting:
- Increase to **2 (Verbose)** and retry your action
- Use **3 (Detailed)** only if you are comfortable reading technical logs

---

## 🏷️ 10. Badge and Visual Feedback

Mass Image Downloader provides **visual feedback** to help you understand the current state of a download process.

This feedback is designed to be simple, non-intrusive, and easy to recognize at a glance.

---

## 🏷️ 10. Badge and Visual Feedback

Mass Image Downloader uses the extension badge to provide **quick visual feedback** about what the extension is doing.

The badge helps you understand the current state of a process without opening logs or settings.

---

### 🔢 10.1 Badge Counter Meaning

The number shown on the extension icon represents **progress information**.

Depending on the feature, the counter may indicate:

- How many images have been processed
- How many images have been downloaded so far

The counter updates automatically during active operations.

---

### 🎨 10.2 Badge Colors Explained

The badge color indicates the **current state** of the extension.

#### 🟢 Green — Active / In Progress
- The extension is actively processing images
- Downloads are running normally
- This is the most common state during operations

This state is used globally across features.

---

#### 🔵 Blue — Completed
- The process finished successfully
- All images were processed or downloaded
- No further action is required

This state is used globally and indicates a clean completion.

---

#### 🟡 Yellow — Processing / Preparing
- The extension is preparing data or analyzing content
- This may appear briefly before downloads begin

Note:
- This state exists but is currently used only in specific flows
- Not all features display this state yet

---

#### 🔴 Red — Error
- An error occurred during processing
- The operation could not complete as expected

Note:
- Error badge support exists but is not yet applied consistently across all features
- In some cases, errors are shown only as on-screen messages

---

### 💬 10.3 User Feedback Messages

When enabled in Settings, the extension shows **on-screen messages** to provide additional feedback.

These messages may inform you about:

- Successful downloads
- Errors or invalid images
- Disabled features or missing permissions

Messages appear temporarily and disappear automatically.

---

### 🧭 10.4 What to Do If the Badge Looks Unexpected

If something does not look right:

- 🟢 Badge but no downloads  
  → The flow is currently processing images, implementing the options, and downloading.

- 🔵 Badge appears immediately  
  → The process is now complete.

- 🟡 Badge stays too long  
  → The page may be heavy or slow to analyze

- 🔴 Badge appears  
  → Check on-screen messages for details

The badge is a guide. Settings and page content determine the final result.


- No badge activity at all  
  → Ensure you selected the correct feature and that the extension is enabled

Visual feedback is meant to guide you, but settings always determine the final behavior.

---

## 💡 11. Common Use Cases

This section describes **real-world scenarios** where Mass Image Downloader is especially useful.

These examples can help you decide **which feature to use** and **how to configure it** depending on your goal.

---

### 🎨 11.1 Design and Creative Research

Designers and creative professionals often need to collect visual references quickly.

Typical use cases include:
- Mood boards
- Color and style exploration
- Visual inspiration for layouts or illustrations

Recommended features:
- 📸 Bulk Image Download (when images are already open in tabs)
- 🌄 Gallery extraction with direct links (for image boards and portfolios)

Recommended tips:
- Increase minimum image size to avoid thumbnails
- Use filename prefixes to organize by project or theme

---

### 🗄️ 11.2 Media and Content Archiving

When archiving visual content for later use, consistency and completeness matter.

Typical use cases include:
- Saving product images
- Archiving documentation visuals
- Collecting reference material

Recommended features:
- 🌄 Galleries with direct links
- 🔗 Web-linked galleries

Recommended tips:
- Enable similarity grouping to avoid duplicates
- Limit max images per gallery to keep archives manageable

---

### 🎓 11.3 Academic and Research Use

Researchers and students often need to collect images as **reference material**, not for redistribution.

Typical use cases include:
- Historical image references
- Diagrams and figures
- Visual examples for analysis

Recommended features:
- 🖼️ Visual gallery extraction
- 🕵️ Image Inspector (for careful, single-image selection)

Recommended tips:
- Keep image size filters moderate
- Disable automatic tab closing when reviewing content

---

### 🛍️ 11.4 Product and Catalog Browsing

When browsing catalogs or listings, images are often distributed across many pages.

Typical use cases include:
- Product comparison
- Market research
- Feature and design analysis

Recommended features:
- 🔗 Web-linked gallery extraction
- 📸 Bulk Image Download (for product images opened in tabs)

Recommended tips:
- Limit parallel tabs for web-linked galleries
- Increase delay between tab openings on slower sites

---

## ⚠️ 12. Best Practices and Warnings

This section highlights **recommended practices** and **important warnings** to help you use Mass Image Downloader effectively and safely.

Following these guidelines will reduce errors and improve results.

---

### ✅ 12.1 Best Practices for Reliable Downloads

To get consistent and predictable results:

- Start with **default settings** and adjust gradually
- Test features on a small page before large extractions
- Let one process finish before starting another
- Keep your browser updated to a supported version
- Use gallery-specific modes instead of Bulk Download when possible

For best performance:
- Close unnecessary tabs
- Avoid running multiple heavy browser extensions at the same time
- Reduce batch sizes on slower machines

---

### 🚫 12.2 Known Limitations

Mass Image Downloader operates **within browser limitations**.

Be aware of the following:

- Some websites load images dynamically and may require visual gallery modes
- Very strict image size filters may result in no downloads
- Some sites limit how quickly pages can be opened
- Browser security policies may prevent access to certain image sources

These behaviors are expected and not errors.

---

### ❗ 12.3 Common Mistakes to Avoid

Avoid these frequent mistakes:

- Using Bulk Image Download on pages that are not image tabs
- Forgetting to enable required settings (such as automatic downloads)
- Running multiple extraction modes simultaneously
- Assuming every page structure is supported

If something does not work:
1. Stop the current process
2. Review settings
3. Retry with adjusted values

Patience and small adjustments usually solve most issues.
