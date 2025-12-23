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


It is recommended to always keep your browser updated to ensure:
- Best performance
- Compatibility with new features
- Proper security behavior
