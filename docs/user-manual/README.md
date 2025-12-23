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
