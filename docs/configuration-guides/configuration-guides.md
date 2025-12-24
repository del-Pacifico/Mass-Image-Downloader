# 🏔️ Mass Image Downloader – Configuration Guides  

**Version:** `v2.08.149`  
**Branch:** `main`  
**Status**: Step-by-step configuration, outcome-driven usage

---
## 📑 Table of Contents

- [🧭 1. Introduction](#-1-introduction)
  - [🎯 1.1 Purpose of This Document](#-11-purpose-of-this-document)
  - [🧭 1.2 How This Document Is Organized](#-12-how-this-document-is-organized)
  - [📌 1.3 What This Document Is — and Is Not](#-13-what-this-document-is--and-is-not)
  - [🔗 1.4 Relationship With Other Manuals](#-14-relationship-with-other-manuals)
  - [🧩 1.5 Guide Structure](#-15-guide-structure)
  - [🚀 1.6 How to Use These Guides Effectively](#-16-how-to-use-these-guides-effectively)

- [📸 2. Bulk Image Download](#-2-bulk-image-download)
  - [✅ 2.1 Reliable & Safe Bulk Image Download (Recommended Baseline)](#-21-reliable--safe-bulk-image-download-recommended-baseline)
  - [⚡ 2.2 High-Speed Bulk Download on Powerful Machines](#-22-high-speed-bulk-download-on-powerful-machines)
  - [🐢 2.3 Conservative Bulk Download for Low-Resource Systems](#-23-conservative-bulk-download-for-low-resource-systems)

- [🖼️ 3. Extract Gallery Images (With Direct Links)](#-3-extract-gallery-images-with-direct-links)
  - [📥 3.1 Clean Gallery Extraction (Immediate Download)](#-31-clean-gallery-extraction-immediate-download)
  - [🗂️ 3.2 Gallery Extraction Using Background Tabs](#-32-gallery-extraction-using-background-tabs)
  - [🛡️ 3.3 Handling Large Linked Galleries Safely](#-33-handling-large-linked-galleries-safely)

- [🖼️ 4. Extract Gallery Images (Without Links)](#-4-extract-gallery-images-without-links)
  - [🔍 4.1 Visual Gallery Detection with Size Filtering](#-41-visual-gallery-detection-with-size-filtering)
  - [🧪 4.2 Improving Results on Mixed-Content Pages](#-42-improving-results-on-mixed-content-pages)

- [🌐 5. Web-Linked Galleries](#-5-web-linked-galleries)
  - [🔗 5.1 Extracting Images from HTML Detail Pages](#-51-extracting-images-from-html-detail-pages)
  - [🧵 5.2 Controlling Fan-Out and Concurrency](#-52-controlling-fan-out-and-concurrency)

- [📁 6. Filename Strategies](#-6-filename-strategies)
  - [🏷️ 6.1 Clean Filenames with Prefixes and Suffixes](#-61-clean-filenames-with-prefixes-and-suffixes)
  - [⏱️ 6.2 Timestamp-Based Naming for Large Collections](#-62-timestamp-based-naming-for-large-collections)

- [⚡ 7. Performance & Stability](#-7-performance--stability)
  - [⚖️ 7.1 Speed vs Stability: Choosing the Right Limits](#-71-speed-vs-stability-choosing-the-right-limits)
  - [💻 7.2 Recommended Configurations by System Profile](#-72-recommended-configurations-by-system-profile)

- [🐛 8. Debugging & Diagnostics](#-8-debugging--diagnostics)
  - [🧪 8.1 Using Debug Logs to Diagnose Configuration Issues](#-81-using-debug-logs-to-diagnose-configuration-issues)
  - [🚫 8.2 Understanding “No Images Found” Scenarios](#-82-understanding-no-images-found-scenarios)

- [🧾 9. Final Notes](#-9-final-notes)
---

## 🧭 1. Introduction

This document serves as the **practical configuration companion** for **Mass Image Downloader**.

Unlike technical or design-focused manuals, this guide is entirely focused on **how to configure the extension to achieve concrete, reproducible results** in real-world scenarios.

---

### 🎯 1.1 Purpose of This Document

The purpose of this document is to provide **step-by-step, outcome-driven configuration guides**.

Each guide is written to answer the question:

> *What exact configuration do I need to achieve this result?*

The focus is on **predictability, safety, and clarity**, not on internal mechanics.

---

### 🧭 1.2 How This Document Is Organized

This document is organized into **independent configuration scenarios**, grouped by feature domain.

Each section:
- Targets a single, well-defined goal
- Uses explicit option values
- Avoids ambiguity or “it depends” guidance
- Can be followed in isolation

---

### 📌 1.3 What This Document Is — and Is Not

#### ✅ This document **is**:
- A configuration handbook
- A practical, step-by-step guide
- Outcome-oriented and reproducible
- Safe to apply in daily usage

#### ❌ This document **is not**:
- A technical reference
- An architectural explanation
- A source code guide
- A replacement for UI tooltips

---

### 🔗 1.4 Relationship With Other Manuals

This document complements, but does not overlap with:

- **Technical User Manual** — explains *how the extension works internally*
- **Advanced Manual** — explains *design rationale, edge cases, and cross-feature behavior*

> If your goal is **configuration**, stay here.  
> If your goal is **understanding internals or design decisions**, consult the other manuals.

---

### 🧩 1.5 Guide Structure

Every configuration guide follows the same mandatory structure:

- **Goal**
- **When to Use This**
- **Prerequisites**
- **Step-by-Step Configuration**
- **Expected Result**
- **Common Mistakes**
- **Performance & Stability Notes**

> No sections are skipped.  
> No additional sections are introduced unless explicitly stated.

---

### 🚀 1.6 How to Use These Guides Effectively

- Start with the **Bulk Image Download baseline guide**
- Apply **one guide at a time**
- Avoid mixing configurations from different guides unless stated
- Validate results before moving to higher-performance setups

---

➡️ The next section begins with the **recommended baseline configuration** for most users.
