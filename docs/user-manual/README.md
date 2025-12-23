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
