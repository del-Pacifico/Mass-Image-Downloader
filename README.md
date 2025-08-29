# Mass Image Downloader

![Chromium 93+](https://img.shields.io/badge/Chromium-93%2B-4285F4?logo=google-chrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-FF9800)
<!--BRANCH_BADGE_START-->
![Branch: dev](https://img.shields.io/badge/Branch-dev-6a1b9a)
<!--BRANCH_BADGE_END-->
![Version 2.08.127](https://img.shields.io/badge/Version-2.08.127-1976d2)
![Chrome](https://img.shields.io/badge/Chrome-Supported-4285F4?logo=google-chrome&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-Supported-0078D7?logo=microsoft-edge&logoColor=white)
![Brave](https://img.shields.io/badge/Brave-Supported-FB542B?logo=brave&logoColor=white)
<!--Standards-->
![License](https://img.shields.io/badge/license-MPL--2.0-green?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![GitHub community standards](https://img.shields.io/badge/community%20standards-100%25-brightgreen?style=flat-square&logo=github)
![Star this project](https://img.shields.io/github/stars/del-Pacifico/Mass-Image-Downloader?style=flat-square&logo=github)

![Made with ❤️ by del-Pacifico](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20by%20del--Pacifico-orange?style=flat-square)

---

## 📚 Table of Contents

- [Mass Image Downloader](#mass-image-downloader)
  - [📚 Table of Contents](#-table-of-contents)
- [Mass Image Downloader](#mass-image-downloader-1)
  - [🌐 Overview](#-overview)
  - [🚀 Highlights in this release (v2.08.127)](#-highlights-in-this-release-v208127)
  - [✨ Features](#-features)
  - [🧩 Installation (Developer Mode / Unpacked)](#-installation-developer-mode--unpacked)
    - [Steps (Chrome / Edge / Brave)](#steps-chrome--edge--brave)
    - [Notes](#notes)
  - [🧩 How it works](#-how-it-works)
    - [1) 📸 Bulk Image Download](#1--bulk-image-download)
    - [2) 🌄 Galleries (with direct links)](#2--galleries-with-direct-links)
    - [3) 🖼️ Galleries (without links)](#3-️-galleries-without-links)
    - [4) 🔗 Web-linked galleries](#4--web-linked-galleries)
    - [Manual \& hotkey workflows](#manual--hotkey-workflows)
    - [Grouping \& bounding (why it matters)](#grouping--bounding-why-it-matters)
    - [Why pacing exists (and how to tune it)](#why-pacing-exists-and-how-to-tune-it)
    - [Quick self-tests (no special toggles required)](#quick-self-tests-no-special-toggles-required)
  - [🧭 Behavior on tab navigation \& page close](#-behavior-on-tab-navigation--page-close)
    - [👉 Practical guidance](#-practical-guidance)
  - [🛠️ Extension Options](#️-extension-options)
    - [🌍 Global Settings](#-global-settings)
      - [📁 File system](#-file-system)
      - [📋 Clipboard Hotkeys](#-clipboard-hotkeys)
      - [🖱️ One-click Download Icon](#️-one-click-download-icon)
      - [🖼️ Galleries](#️-galleries)
        - [📐 Image size](#-image-size)
    - [📢 Notifications](#-notifications)
    - [🐛 Debugging](#-debugging)
    - [📸 Download images directly in tabs Settings](#-download-images-directly-in-tabs-settings)
    - [🔗 Web-Linked Gallery Settings](#-web-linked-gallery-settings)
    - [⚙️ Performance Presets](#️-performance-presets)
    - [🔧 Default Values](#-default-values)
  - [🚀 Usage (Quick Start)](#-usage-quick-start)
    - [1) Install \& pin the toolbar icon](#1-install--pin-the-toolbar-icon)
    - [2) Open the popup \& choose a mode](#2-open-the-popup--choose-a-mode)
    - [3) Configure once (Options)](#3-configure-once-options)
    - [4) Run the flow](#4-run-the-flow)
    - [5) Manual \& hotkeys (curation)](#5-manual--hotkeys-curation)
    - [6) Throughput \& stability](#6-throughput--stability)
    - [7) Quick troubleshooting](#7-quick-troubleshooting)
  - [✅ Requirements](#-requirements)
  - [🧠 Technical design](#-technical-design)
    - [Architecture overview](#architecture-overview)
    - [File-by-file map](#file-by-file-map)
    - [Downloads pipeline (end-to-end)](#downloads-pipeline-end-to-end)
    - [Gallery engines (page-structure aware)](#gallery-engines-page-structure-aware)
    - [Similarity \& bounding](#similarity--bounding)
    - [Performance \& resilience](#performance--resilience)
  - [👷 Optimizations](#-optimizations)
    - [Throughput \& pacing](#throughput--pacing)
    - [Workload bounding](#workload-bounding)
    - [Signal quality (less noise, better results)](#signal-quality-less-noise-better-results)
    - [I/O reliability](#io-reliability)
    - [MV3 lifecycle \& memory](#mv3-lifecycle--memory)
    - [Error handling \& resilience](#error-handling--resilience)
    - [Feedback loops](#feedback-loops)
  - [🔌 Browser-native APIs](#-browser-native-apis)
  - [🎛 Runtime Flexibility](#-runtime-flexibility)
    - [Formats \& URL rules](#formats--url-rules)
    - [Size filters](#size-filters)
    - [Gallery shaping](#gallery-shaping)
    - [Pacing \& stability](#pacing--stability)
    - [Naming \& labeling](#naming--labeling)
    - [Feedback \& diagnostics](#feedback--diagnostics)
  - [🔧 Recommended setup](#-recommended-setup)
  - [🧪 Advanced / Developer tips](#-advanced--developer-tips)
    - [View live flow details](#view-live-flow-details)
    - [Test image thresholds (quick sanity check)](#test-image-thresholds-quick-sanity-check)
    - [Simulate extraction failures (for diagnosis)](#simulate-extraction-failures-for-diagnosis)
    - [Reproduce issues reliably](#reproduce-issues-reliably)
    - [Stable Service Worker (MV3) habits](#stable-service-worker-mv3-habits)
    - [Logging levels (0–3)](#logging-levels-03)
  - [⌨️ Extension Shortcuts \& Commands](#️-extension-shortcuts--commands)
  - [👁️ Peek Settings Mode](#️-peek-settings-mode)
  - [🧰 Use cases](#-use-cases)
  - [⚠️ Edge cases \& warnings](#️-edge-cases--warnings)
  - [🔗 Related Projects](#-related-projects)
  - [💖 Support the Project](#-support-the-project)
  - [📄 License](#-license)
  - [🙌 Contributions](#-contributions)
    - [How to contribute](#how-to-contribute)
    - [Quick path to a solid PR](#quick-path-to-a-solid-pr)
  - [📝 Changelog](#-changelog)
  - [🔒 Privacy](#-privacy)
  - [📜 Usage Policy](#-usage-policy)

---

# Mass Image Downloader

## 🌐 Overview

Mass Image Downloader is a Chromium (MV3) extension that helps you **collect and download images at scale**—from single pages, multi-page galleries, or across open tabs—while keeping results high-quality and reproducible.

**Core goals**

- ⚡ **Speed** with control: bulk/tab scanning, gallery extractors (direct/visual/web-linked), and manual one-click saving.
- 👌 **Quality** by design: filters for minimum size, allowed formats (PNG, JPG/JPEG, WEBP, GIF, AVIF, BMP), and path-similarity grouping to reduce duplicates.
- 👨‍🔬 **Reproducibility**: deterministic file naming (prefix/suffix/timestamp) and optional clipboard hotkeys for dataset labeling.
- 💪 **Stability**: pacing (max images per second), per-gallery caps, batching under MV3, and clear visual feedback (badge: green/yellow/blue).

**Who it’s for**

- Power users, researchers, curators, QA teams, and dataset builders who need **reliable bulk image workflows** with fine-grained controls.

**Environment**

- Chromium-based browsers: Google Chrome, Microsoft Edge, Brave  
- Minimum Chromium version: **93+** · Manifest: **V3**

---

## 🚀 Highlights in this release (v2.08.127)

- **New mode:** Extract **Web-linked Galleries** (opens linked HTML pages with bounded concurrency and extracts the best valid image from each).
- **New option:** **Allow extended image URLs** — accepts suffixes like `:large`, `:orig` (Twitter/X, Pixiv) as valid media.
- **New formats:** **AVIF** and **BMP** added to the allowed formats list.
- **Badge stability clarified:**  
  - 🟢 **Green** (white numbers) → bulk downloads in progress  
  - 🟡 **Yellow** → manual downloads in progress  
  - 🔵 **Blue** → all downloads completed
- **Options reorganized:** clearer sections (Galleries, Image Size, File System/URL, Naming, Performance, Diagnostics).
- **Throughput controls improved:** smoother gallery pacing with **Max images per second**.
- **Bulk reliability fixes:** resolved async filename (`undefined finalName`) and premature “Done” state; cumulative counter preserved.
- **Service Worker hygiene:** reduced memory footprint and safer listeners under MV3.
- **Minimum environment enforced:** Chromium **93+** (MV3).

---

## ✨ Features

- 🔢 **Multiple extraction modes**
  - **Bulk Image Download** — scan open tabs and collect valid image URLs with global filters and batching.
  - **Galleries (with direct links)** — thumbnails anchor directly to media files (fastest path).
  - **Galleries (without links)** — large images are displayed inline; the extractor filters by size/format.
  - **Web-linked galleries** — thumbnails lead to HTML detail pages; the extractor opens them with bounded fan-out and picks the best image.

- 🎯 **Gallery Image Handling (immediate/tab)**
  - **Download immediately** — saves the resolved image without intermediate UI.
  - **Open in new tab before downloading** — opens each target in a background tab for manual verification, then you can save.
  > Choose “tab” when sites render the final image only after JS or when you want to visually confirm the target.

- 🖐️ **Manual download overlay (hotkey)**
  - **Alt+Shift+I** — toggles a small **download icon** over the focused image; click to save instantly (no popup).
  > Ideal for curation: review the page visually and cherry-pick just a handful of items.

- 📋 **Clipboard labeling (hotkeys)**
  - **Ctrl+Alt+P** — set **filename prefix** from clipboard.  
  - **Ctrl+Alt+S** — set **filename suffix** from clipboard.
  > Great for dataset runs: copy a label/tag once and apply it to all subsequent files.

- 📶 **Throughput & pacing for galleries**
  - **Max images per second** — smooths extraction on heavy pages to avoid site throttling and CPU spikes.
  > Start with 2–3 and increase gradually. If a site is strict, lower it.

- 🔄️ **Concurrency (open-tab fan-out)**
  - **Max open tabs per gallery** (download concurrency limit) — caps how many background tabs are opened simultaneously in “tab” mode.
  > Keeps memory predictable and avoids a “tab storm” while still parallelizing work.

- 🎰 **Similarity & per-gallery bounding**
  - **Path-similarity threshold** — clusters related variants and cuts duplicates/resized copies.
  - **Max images per gallery** — limits how many items each gallery contributes.
  > Clean grouping first; downloading then deleting is slower and noisier.

- 📑 **Resume bulk sessions**
  - **Continue from where it left off** — resumes the next bulk batch from the last processed tab/page.
  > Useful for long multi-tab sessions or when you paused mid-way.

- 📝 **Deterministic file-naming**
  - Modes: **none / prefix / suffix / both / timestamp**.
  - Enforced via `downloads.onDeterminingFilename` to keep names stable and reproducible.

- 📌 **Dimension & format filters**
  - **Minimum width & height** — both must be met to qualify.
  - **Allowed formats** — enable only what you want processed.
  > If expected images are skipped, check real pixel sizes in DevTools (CSS can scale visuals).

- 💬 **User feedback & diagnostics**
  - **Badge states** — Green (bulk), Yellow (manual), Blue (done) for quick progress cues.
  - **Notifications / Toasts** — optional in-page messages for success/errors.
  - **Debug log levels (0–3)** — from silent to detailed traces, all prefixed with `[Mass image downloader]:`.

---

## 🧩 Installation (Developer Mode / Unpacked)

This repository can be loaded **unpacked** and is **fully operational**—ideal for debugging, forking, and submitting pull requests.

### Steps (Chrome / Edge / Brave)

1) Open `chrome://extensions/` (or `edge://extensions/`, `brave://extensions/`).  
2) Enable **Developer mode** (top-right toggle).  
3) Click **Load unpacked** and select the project folder (the one containing `manifest.json`).  
4) Pin the extension icon to the toolbar for quick access and visible badge states.

> The **unpacked** build runs the same core code paths as a packaged release, so you can reproduce issues and verify fixes before opening a PR.

### Notes

- **Permissions prompts**: the extension requests only the MV3 APIs needed for its features (tabs, downloads, storage, scripting, clipboardRead).  
- **Enterprise restrictions**: managed environments may limit the Downloads API or filename handling—check your admin policies.  
- **Chrome Web Store**: a store release is planned; for now, Developer Mode is the recommended way to use and test the extension.

---

## 🧩 How it works

Mass Image Downloader adapts to different page structures. You can either **download immediately** or **open targets in background tabs** (to verify visually before saving). The badge shows progress in real time: **green** (bulk in progress), **yellow** (manual in progress), **blue** (done).

### 1) 📸 Bulk Image Download

- **Scope:** scans your open tabs (configurable direction/scope) and collects valid image URLs.
- **Pipeline:** read settings → discover candidates → validate (size/format/URL) → build deterministic filenames → download in batches → audit completion.
- **Resume runs:** if enabled, **Continue from where it left off** restarts the next batch from the last processed tab.
- **Why it’s fast:** no DOM scraping per se; it works from tab URLs and direct media targets.

### 2) 🌄 Galleries (with direct links)

- **Structure:** thumbnails wrapped by anchors pointing **directly** to media files  
  `(<a href="*.jpg|png|webp|gif|avif|bmp"><img ...></a>)`.
- **Behavior:** picks the best valid target per item (usually the full-size link), applies filters, and downloads.
- **Immediate vs Tab mode:**
  - **Immediate download:** fastest path; saves directly.
  - **Open in tabs first:** opens each target in a background tab, so you can confirm it’s truly the high-res image before saving.

### 3) 🖼️ Galleries (without links)

- **Structure:** large images are shown **inline** as `<img>`; no dedicated link page.
- **Behavior:** collects visible `<img>` that meet **both** min width/height and allowed formats; optional grouping by path similarity reduces duplicates/resized variants.
- **Throughput:** governed by **Max images per second** to avoid CPU/network spikes.

### 4) 🔗 Web-linked galleries

- **Structure:** thumbnails link to **HTML pages** (not directly to media) like  
  `(<a href="/detail/123.html"><img ...></a>)`.
- **Behavior:** opens each detail page with **bounded fan-out** and extracts the best valid image found inside.
- **Controls for stability:**
  - **Max open tabs per gallery:** caps simultaneous background tabs to avoid a “tab storm”.
  - **Delay between tab openings (ms):** spreads out the fan-out to be kinder to the site and your CPU.
  - **Max images per second:** throttles extraction pace.

### Manual & hotkey workflows

- **Alt+Shift+I** — toggles a small **download icon** (💾) over the focused image; click to save instantly (no popup).
- **Ctrl+Alt+P / Ctrl+Alt+S** — set filename **prefix/suffix** from the clipboard for quick, consistent labeling across a batch.

> Tip: For curation, combine **prefix/suffix** labels with **Alt+Shift+I** and save only the images you want.

### Grouping & bounding (why it matters)

- **Path similarity threshold:** clusters “near-duplicate” URLs so resized/cached variants don’t flood your dataset.
- **Max images per gallery:** prevents a single gallery from dominating the run and keeps memory predictable.

### Why pacing exists (and how to tune it)

- **Max images per second** protects you from server-side throttling and transient blocks on strict sites.
- **Max open tabs per gallery + Delay between tab openings** control how aggressively “tab mode” fans out.

> Start conservative (e.g., 2–3 images/sec, a small tab cap, and a short delay), then ramp up as you verify stability.

### Quick self-tests (no special toggles required)

- **🖼 Test image thresholds:** open DevTools → inspect candidate images → check **naturalWidth/Height**; adjust min size until you see the expected items accepted/skipped.
- **🧬 “Simulate” extraction failures (for diagnosis):** temporarily **raise** min dimensions or **disable** a format to force skips; observe logs at level 1–2 to confirm the reason (size/format/URL). Restore normal values afterward.

---

## 🧭 Behavior on tab navigation & page close

Different modes have different resilience when you switch tabs, navigate away, or close pages during a run. Use this matrix to decide when it’s safe to multitask.

| Mode | Safe on tab switch? | Safe on page close? | Notes |
|---|---|---|---|
| **Bulk Image Download** | ✅ Yes | ✅ Yes | Runs from the background; progress continues while you browse elsewhere. Works best with “Continue from where it left off” for long sessions. |
| **Galleries (with direct links)** | ✅ Yes | ✅ Yes | Targets direct media URLs; resilient to focus changes. Immediate-download mode is fully background-safe. |
| **Galleries (without links)** | ⚠️ Partial | ❌ No | Relies on the current DOM. Navigating away or closing the page can interrupt discovery/validation of `<img>` elements. Prefer to keep the tab visible until the badge turns **blue**. |
| **Web-linked galleries** | ✅ Yes | ⚠️ Partial | Opens detail pages in background tabs with bounded fan-out. If you close those background tabs early, extraction for those items is canceled. Use **Max open tabs per gallery** and **Delay between tab openings** to keep it stable. |

### 👉 Practical guidance

- **Prefer “Open in tabs first”** when sites render the final image only after client-side scripts, or when you want to **visually confirm** each target before saving.
- **For long runs (bulk)** enable **Continue from where it left off** so subsequent runs resume from the last processed tab/page.
- **Tune pacing** for “tab” mode using:
  - **Max open tabs per gallery** — limits concurrent background tabs to prevent a tab storm.
  - **Delay between tab openings (ms)** — spreads fan-out to be gentler on the site and your CPU.
  - **Max images per second** — throttles extractor rate to avoid server-side rate limits.
- **Watch the badge**:  
  - **Green** (white numbers) → bulk in progress  
  - **Yellow** → manual in progress (e.g., Alt+Shift+I overlay flow)  
  - **Blue** → all done (safe to close everything)

---

## 🛠️ Extension Options

All settings are stored in `chrome.storage.sync` and applied across flows. This section lists every configurable control and explains *why* it exists.

### 🌍 Global Settings

This section describes global options that affect how the extension discovers, filters, names, and saves images across all modes.

#### 📁 File system

Controls where files are saved, which formats are accepted, whether extended URLs are valid, and how filenames are constructed.

- **Choose Download Folder** (Default system folder / Custom folder)  
  Select where files are saved. “Custom” defines a subfolder under your default Downloads directory to keep datasets organized per project.  
  Applies to: All modes.  
  **Notes:** Disable the browser prompt “Ask where to save each file before downloading” for uninterrupted bulk runs.

- **Allowed Image Formats** (JPG, JPEG, PNG, WEBP, AVIF, BMP)  
  Toggle which formats are accepted. Skips unwanted or non-decodable assets early for faster, cleaner results.  
  Applies to: All modes.  
  **Notes:** AVIF/BMP depend on browser support; if items are skipped, verify decoding capability and toggles.

- **Allow extended image URLs** (accept Twitter/X `:large`, `:orig`, etc. as valid images)  
  Accept platform-specific suffix variants as valid image URLs so you can capture higher-resolution versions when available.  
  Applies to: All modes.  
  **Notes:** This does not upscale images; it only accepts variant links when the site provides them.

- **Filename Customization** (Mode: none / prefix / suffix / both / timestamp; with Prefix/Suffix inputs)  
  Build deterministic, reproducible filenames. Use prefix/suffix for labeled batches or timestamp to avoid collisions.  
  Applies to: All modes.  
  **Notes:** Keep names filesystem-safe (avoid slashes, wildcards, control characters).

#### 📋 Clipboard Hotkeys

Enables quick, consistent labeling of files by setting prefix/suffix from the clipboard.

- **Enable clipboard shortcuts for prefix/suffix**  
  Set naming labels from the clipboard using keyboard shortcuts—copy once, apply across the batch.  
  Applies to: All modes (naming only).  
  Hotkeys: `Ctrl + Alt + P` → set **Prefix**, `Ctrl + Alt + S` → set **Suffix**  
  **Notes:** Requires this toggle enabled; operates in the active tab context.

#### 🖱️ One-click Download Icon

Provides a manual, no-popup workflow to save the focused image instantly via hotkey.

- **Enable One-click download icon (via hotkey)**  
  Toggle a small overlay on the focused image and save instantly—no popup needed; perfect for manual curation.  
  Applies to: Any page with valid images (manual/curation workflows).  
  Hotkey: `Alt + Shift + I`  
  **Notes:** Respects your size/format rules; ideal when cherry-picking an image from a page.

#### 🖼️ Galleries

Global options that shape how gallery extractors group, select, and pace items.

- **Gallery Similarity Level (%)**  
  Set the path-based similarity threshold to cluster related items and reduce duplicates/resized variants.  
  Applies to: Gallery extractors (with/without links).  
  **Notes:** Raise to group more aggressively (fewer duplicates); lower if legitimate variants are being split.

- **Minimum Group Size**  
  Define how many items a cluster must have to count as a valid gallery. Prevents noise from tiny or accidental groups.  
  Applies to: Gallery extractors.

- **Enable smart similarity grouping**  
  Turn on heuristic grouping to handle real-world, messy URL patterns more robustly.  
  Applies to: Gallery extractors.  
  **Notes:** Works as a first-pass strategy before selection.

- **Enable fallback grouping**  
  Run a secondary, more permissive grouping when no dominant pattern is found. Helps salvage legitimate sets on tricky sites.  
  Applies to: Gallery extractors.

- **Gallery Image Handling** (Download immediately / Open in new tab before downloading)  
  Choose how to process each selected target after grouping. “Immediate” is fastest; “Open in new tab” lets you visually confirm before saving.  
  Applies to: Gallery extractors.  
  **Notes:** Use tab mode when pages render the final image only after client-side scripts.

- **Max images per second**  
  Throttle the gallery extractor pace to avoid site-side rate limits and CPU spikes.  
  Applies to: Gallery extractors (with/without links, immediate or tab mode).  
  **Notes:** Start with 2–3 and increase gradually; reduce if a site is strict.

##### 📐 Image size

Size thresholds to exclude assets that are too small for your use case.

- **Minimum Image Width (px)**  
  Reject images below this width.  
  Applies to: All modes.

- **Minimum Image Height (px)**  
  Reject images below this height.  
  Applies to: All modes.  
  **Notes:** Both dimensions must be met. Check `naturalWidth/Height` in DevTools—CSS can scale visuals without changing bitmap size.

### 📢 Notifications

Controls in-page toasts and the visibility of the read-only Peek overlay.

- **Show user feedback messages**  
  Display lightweight in-page toasts for success/progress/errors during runs.  
  Applies to: All modes.  
  **Notes:** Turn off for headless-style bulk sessions; turn on while calibrating filters.

- **Peek panel transparency (0.2 – 1.0)**  
  Control the opacity of the read-only **Peek** overlay to keep the page visible underneath.  
  Applies to: Peek Settings Mode (UI only).  
  **Notes:** Typical comfortable values: 0.7–0.9.

### 🐛 Debugging

Adjusts logging verbosity to diagnose filtering, grouping, and download behaviors.

- **Console log level**  
  Control verbosity of console logs: 0 (silent), 1 (basic, recommended), 2 (verbose), 3 (detailed).  
  Applies to: All modes.  
  **Notes:** More logs = more overhead. Use 0–1 daily; raise to 2–3 only for troubleshooting. Logs are prefixed with `[Mass image downloader]:`.

### 📸 Download images directly in tabs Settings

Options that only affect the **Download images directly in tabs** flow (bulk across tabs with batching).

- **Max images per batch**  
  Define how many images are processed per batch to keep the MV3 Service Worker responsive and memory stable.  
  Applies to: Download images directly in tabs.  
  **Notes:** Larger batches finish faster but can be heavier; tune to your system.

- **Continue from where it left off**  
  Resume the next bulk batch from the last processed tab/page.  
  Applies to: Download images directly in tabs.  
  **Notes:** Useful for very long multi-tab sessions or when you need to pause mid-run.

### 🔗 Web-Linked Gallery Settings

Options that only affect the **Extract Web-Linked Galleries** flow (thumbnails link to HTML detail pages).

- **Max open tabs per gallery**  
  Cap how many detail pages open concurrently to prevent tab storms.  
  Applies to: Web-linked galleries (tab mode).  
  **Notes:** Typical balanced values are around 4–6 concurrent tabs.

- **Delay between tab openings (ms)**  
  Add spacing between opening new tabs so strict sites are less likely to throttle or soft-block you.  
  Applies to: Web-linked galleries (tab mode).  
  **Notes:** A starting point of ~300–800 ms works well; increase if the site is sensitive.

### ⚙️ Performance Presets

One-click profiles that auto-configure multiple options for your machine and target sites.

- **Low Spec Configuration**  
  Conservative settings for older hardware or very strict sites: lower images/sec, smaller batches, fewer concurrent tabs, higher similarity, and higher minimum size.  
  Applies to: Auto-configures multiple options at once.

- **Medium Spec Configuration**  
  Balanced defaults for most machines and pages: moderate images/sec and batch sizes, smart grouping enabled, broad formats.  
  Applies to: Auto-configures multiple options at once.

- **High Spec Configuration**  
  Aggressive throughput for powerful machines: higher images/sec, larger batches, more concurrent tabs, permissive fallback grouping, shorter tab delays.  
  Applies to: Auto-configures multiple options at once.

- **Custom (auto-set)**  
  Automatically selected when you tweak any setting after choosing a preset, reflecting your bespoke configuration.  
  Applies to: Preset status only.  
  **Notes:** Not directly selectable; it appears once you diverge from a preset.

### 🔧 Default Values

Unless changed in the Options page, these defaults apply globally:

- **Minimum Image Dimensions:** width = 800, height = 600  
- **Allowed Formats:** JPG, JPEG, PNG (WEBP, AVIF, BMP disabled by default)  
- **Download Limit (simultaneous):** 1  
- **Max Images Per Batch (Bulk Download):** 0 (unlimited)  
- **Extract Gallery Mode:** `tab`  
- **Gallery Max Images (per second):** 3  
- **Gallery Similarity Level:** 70%  
- **Gallery Minimum Group Size:** 3  
- **Filename Mode:** none (prefix/suffix empty)  
- **User Feedback Messages:** disabled  

> Note: Both width and height thresholds must be met. Some flows (Bulk vs Gallery) apply these defaults slightly differently, but the global values remain consistent.

---

## 🚀 Usage (Quick Start)

### 1) Install & pin the toolbar icon

- Load the extension in **Developer Mode** (unpacked) and pin the icon so the badge (green/yellow/blue) is always visible.

### 2) Open the popup & choose a mode

- Pick the flow that matches the page structure:
  - **Bulk Image Download** — scan open tabs with global filters and batching.
  - **Galleries (with direct links)** — thumbnails link directly to media files.
  - **Galleries (without links)** — large images are inline `<img>` elements.
  - **Web-linked galleries** — thumbnails lead to **HTML detail pages**.

> Tip: If “with direct links” finds little, try **Web-linked galleries**.

### 3) Configure once (Options)

- **File system:** folder, allowed formats, extended URLs, filename mode (prefix/suffix/timestamp).
- **Galleries:** similarity level, min group size, smart/fallback grouping, **image handling** (immediate/tab), **max images per second**.
- **Image size:** minimum width/height (both must be met).
- **Notifications & Debug:** toasts on/off, log level 0–3.
- **Web-linked:** limit **max open tabs per gallery** and set **delay between openings** (ms).
- **Bulk tabs flow:** set **max images per batch** and **continue from where it left off**.

> Use **Peek Settings** before long runs to verify active thresholds and pacing.

### 4) Run the flow

- Navigate to a page (or a set of tabs), start the chosen mode, and watch the badge:
  - **Green** (white numbers) → bulk in progress
  - **Yellow** → manual/curation in progress
  - **Blue** → all done

### 5) Manual & hotkeys (curation)

- **Alt + Shift + I** — toggle the **one-click download icon** over the focused image and save instantly (no popup).
- **Ctrl + Alt + P / S** — set **filename prefix / suffix** from the clipboard to label a batch.

> Perfect for cherry-picking a few images while keeping names consistent.

### 6) Throughput & stability

- Start conservative: **2–3 images/sec**, modest **max open tabs**, short **tab-open delay**.
- Increase gradually. If a site becomes flaky, throttle down and add a longer delay.
- For huge tab sets, enable **continue from where it left off** to resume later.

### 7) Quick troubleshooting

- Raise **log level** to 1–2 and check the Console for `[Mass image downloader]: …` messages (why an item was skipped, grouping decisions, download outcomes).
- **Filter extension logs quickly** in DevTools:
  1) Open **DevTools → Console** (F12 or Ctrl/Cmd + Shift + I).  
  2) Set the level dropdown to **All levels**.  
  3) In the **Console filter** box (top of the console), type:
 
      ```
     [Mass image downloader]
     ```
     This shows only messages emitted by the extension.
     - Optional: enable the **regex** toggle and use:
       ```
       ^\[Mass image downloader\]
       ```
       to match logs that **start** with the prefix.
       
  4) You can also press **Ctrl/Cmd + F** to find occurrences in the visible output.
  5) Tip: enable **Preserve log** to keep messages across page reloads.
- If results look small, inspect `naturalWidth/Height` in DevTools (CSS can upscale visuals).
- If a platform uses `:large` / `:orig`, enable **Allow extended image URLs**.
- For login-gated pages, keep the session authenticated; try **Web-linked galleries** if direct modes miss items.

---

## ✅ Requirements

- **Browsers**  
  Chromium-based: Google Chrome, Microsoft Edge, Brave

- **Engine & Platform**  
  Minimum Chromium version: **93+** · Manifest: **V3**

- **Operating Systems**  
  Windows, macOS, Linux

- **Permissions**  
  `tabs`, `downloads`, `storage`, `scripting`, `clipboardRead`

- **Host permissions**  
  `<all_urls>` (needed to analyze and collect images across sites)

- **Recommended browser setting**  
  🚨 Disable **“Ask where to save each file before downloading”** for uninterrupted bulk downloads

- **Notes**  
  - Enterprise/managed browsers may restrict the Downloads API or filename handling  
  - Custom subfolders are sanitized and resolved under the default Downloads directory  
  - AVIF/BMP availability depends on browser/OS support

---

## 🧠 Technical design

This section outlines the architecture, core flows, and the responsibilities of each module so contributors can navigate the codebase with confidence.

### Architecture overview

- **Service Worker (MV3)** — `background.js` orchestrates flows, validates environment (Chromium ≥ 93), loads settings, manages downloads, and audits completion.  
- **Content scripts** — `extractLinkedGallery.js` and `extractVisualGallery.js` inspect page DOMs, discover candidates (URLs or `<img>`), and report back to the Service Worker.  
- **UI surfaces** — `popup.html/js` trigger flows and expose entry points; `options.html/js` persist configuration via `chrome.storage.sync`; **Peek** pages offer read-only visibility of the active config.  
- **Utilities** — `utils.js` centralizes URL/format/size validation, deterministic naming, badge/notifications, and small robustness helpers.

### File-by-file map

| File | Role | Key responsibilities | Main APIs / Events |
|---|---|---|---|
| `manifest.json` | MV3 manifest | Declares permissions, host permissions, background SW, action icon, commands | — |
| `background.js` | Orchestrator (Service Worker) | Load settings; version guard; receive messages; enforce deterministic filenames; kick off downloads; audit via `downloads.search`; update badge | `chrome.runtime.*`, `chrome.action.*`, `chrome.downloads.*`, `chrome.tabs.*`, `chrome.storage.*` |
| `utils.js` | Utilities | Validate URL/format/dimensions; normalize paths; build filenames (prefix/suffix/timestamp); badge updates; toasts; defensive helpers | `chrome.action.*`, `chrome.storage.*` |
| `extractLinkedGallery.js` | Gallery extractor (with direct links) | Find anchors to media files; apply rules; group by similarity; send candidates to SW | `chrome.runtime.sendMessage` |
| `extractVisualGallery.js` | Gallery extractor (without direct links) | Collect visible `<img>` that meet thresholds; optional grouping; send candidates to SW | `chrome.runtime.sendMessage` |
| `popup.html` | Popup UI | Entry points to Bulk / Galleries / Web-linked / Settings / Peek | — |
| `popup.js` | Popup logic | Wire UI actions to background flows; open Options/Peek | `chrome.runtime.*`, `chrome.tabs.*` |
| `options.html` | Options UI | Structured settings (Global, Galleries, Size, FS/URL/Naming, Notifications, Debug) | — |
| `options.js` | Options logic | Read/write `chrome.storage.sync`; apply defaults; validate ranges; toggle formats/extended URLs; preset management | `chrome.storage.sync` |
| `clipboardHotkeys.js` | Clipboard hotkeys | Set prefix/suffix from clipboard (P/S) | `clipboardRead`, `chrome.runtime.*` |
| `peekOptions.html` | Peek UI | Read-only settings overlay (transparency configurable) | — |
| `peekOptions.js` | Peek UI logic | Fetch and render current settings; refresh; open/close | `chrome.storage.sync`, `chrome.runtime.*` |
| `settingsPeek.js` | Peek helpers | Format values for display (thresholds, toggles, formats) | `chrome.runtime.*` |
| `README.md` | Documentation | User/developer docs | — |
| `CHANGELOG.md` | Release notes | Added / Changed / Fixed / Maintenance | — |

### Downloads pipeline (end-to-end)

1. **Collect** candidates (content scripts or bulk tab scanner).  
2. **Validate** early (format/size/URL; extended URL suffixes if enabled).  
3. **Name** deterministically (prefix/suffix/timestamp; sanitized).  
4. **Download** via `chrome.downloads.download`.  
5. **Enforce** final path with `downloads.onDeterminingFilename`.  
6. **Audit** outcomes using `downloads.search`.  
7. **Signal** progress with the badge (green/yellow/blue).

### Gallery engines (page-structure aware)

- **Direct links:** anchors point to media files → pick optimal target → save.  
- **Without links:** large inline `<img>` → filter by size/format → optional grouping.  
- **Web-linked:** anchors point to HTML pages → open with bounded fan-out → extract best image.

### Similarity & bounding

- **Path similarity threshold** clusters variants and reduces duplicates.  
- **Minimum group size** avoids noise from tiny clusters.  
- **Max images per gallery** prevents a single source from dominating.

### Performance & resilience

- **Max images per second** throttles gallery throughput to avoid rate limits.  
- **Batching** keeps the MV3 Service Worker responsive in bulk flows.  
- **Bounded fan-out** (max open tabs + delay) prevents tab storms in web-linked mode.  
- **Defensive messaging** and guarded listeners handle MV3 lifecycle quirks gracefully.

---

## 👷 Optimizations

Practical techniques used by the extension to stay fast, predictable, and resilient in real sites.

### Throughput & pacing

- **Max images per second** smooths gallery extraction to avoid CPU spikes and site-side throttling.
- **Bounded fan-out** in Web-linked mode (max open tabs + delay between openings) prevents tab storms while keeping good parallelism.
- **Batching** in the “Download images directly in tabs” flow keeps the MV3 Service Worker responsive.

> Start conservative (e.g., 2–3 images/sec, small tab cap, short delay) and ramp up as stability allows.

### Workload bounding

- **Max images per gallery** prevents a single page from dominating a run.
- **Minimum group size** discards tiny, noisy clusters.

> Bounding memory and network upfront is cheaper than downloading then deleting.

### Signal quality (less noise, better results)

- **Gallery similarity level** clusters related variants; fewer duplicates/resized copies get through.
- **Extended image URLs** (optional) accept suffix variants like `:large`, `:orig` when platforms expose higher-res assets.

> Clean grouping first; it reduces wasted work and de-dup effort later.

### I/O reliability

- **Deterministic file naming** (`downloads.onDeterminingFilename`) guarantees stable names/paths (prefix/suffix/timestamp).
- **Post-download auditing** (`downloads.search`) double-checks completion and catches edge cases.

> Deterministic outputs make datasets reproducible and easier to resume mid-run.

### MV3 lifecycle & memory

- Short-lived structures, guarded timers, and minimal retained closures reduce RAM drift.
- Batches and short bursts align with the **sleepy** MV3 Service Worker model.

> Designing for bursty work avoids stalls and zombie listeners.

### Error handling & resilience

- Defensive message passing (content ↔ background) with `try/catch` around transient MV3 `lastError`.
- Safe tab closure de-duplicates requests and avoids churn on success/failure paths.

> Clear failure modes mean faster retries and easier diagnostics.

### Feedback loops

- **Badge colors** (green/yellow/blue) reflect real progress; optional **toasts** reduce guesswork.
- **Console log levels (0–3)** let you dial in the right visibility for normal use vs. debugging.

> Keep logs at 0–1 daily; raise to 2–3 only while investigating.

---

## 🔌 Browser-native APIs

A minimal, well-scoped MV3 surface to stay compatible, performant, and secure.

- **chrome.downloads**  
  - `downloads.download` — trigger file saves with requested filenames/paths.  
  - `downloads.onDeterminingFilename` — enforce deterministic names (prefix/suffix/timestamp) and subpaths.  
  - `downloads.search` — audit completed downloads to confirm outcomes and catch edge cases.  
  Applies to: All modes.

- **chrome.tabs**  
  - Open background tabs for **Web-linked** extraction; orchestrate multi-tab scans.  
  - Read tab state and coordinate safe cleanup.  
  Applies to: Bulk flow and Web-linked galleries.

- **chrome.action**  
  - Update the toolbar badge (text/color) to reflect progress: green (bulk), yellow (manual), blue (done).  
  Applies to: All modes.

- **chrome.runtime**  
  - Message bus between content scripts and the Service Worker.  
  - Handle lifecycle events and transient `lastError`.  
  Applies to: All modes.

- **chrome.storage.sync**  
  - Persist options (formats, thresholds, naming, pacing) across sessions and UIs.  
  - Source of truth for **Peek**.  
  Applies to: All modes.

- **chrome.scripting**  
  - Controlled content injection where needed under MV3 constraints.  
  Applies to: Content-side helpers.

- **clipboardRead (permission)**  
  - Enable clipboard-based hotkeys to set filename prefix/suffix.  
  Applies to: Manual/labeling workflows.

**Notes:**  

- Host permissions are broad to enable discovery, but logic rejects non-media endpoints and HTML in the wrong flow.  
- Message passing and critical listeners are wrapped defensively to avoid leaks under MV3’s sleep/wake lifecycle.

---

## 🎛 Runtime Flexibility

Adapt behavior to the site, your machine, and your workflow—without touching code.

### Formats & URL rules

- **Allowed formats:** PNG, JPG, JPEG, WEBP, GIF, AVIF, BMP (toggles per format).  
  Applies to: All modes.  
  **Notes:** Disabling unused formats speeds validation. AVIF/BMP require browser support.

- **Allow extended image URLs:** accept suffix variants like `:large`, `:orig` (Twitter/X, Pixiv).  
  Applies to: All modes.  
  **Notes:** Doesn’t upscale; only recognizes valid high-res variants when platforms provide them.

### Size filters

- **Minimum width / height:** both must be met to qualify.  
  Applies to: All modes.  
  **Notes:** If expected images are skipped, check `naturalWidth/Height` in DevTools—CSS can scale visuals.

### Gallery shaping

- **Gallery similarity level (%):** clusters near-duplicates by path likeness.  
  Applies to: Gallery extractors.  
  **Notes:** Raise to group more aggressively; lower if legitimate variants get split.

- **Minimum group size:** ignores tiny/noisy clusters.  
  Applies to: Gallery extractors.

### Pacing & stability

- **Max images per second:** smooths gallery extraction to avoid rate limits and CPU spikes.  
  Applies to: Gallery extractors.  
  **Notes:** Start at 2–3; increase gradually.

- **Max open tabs per gallery / Delay between openings (ms):** bounds fan-out in Web-linked mode.  
  Applies to: Web-linked galleries.  
  **Notes:** Prevents tab storms; add delay for stricter sites.

- **Max images per batch / Continue from where it left off:** keeps bulk tab runs predictable and resumable.  
  Applies to: Download images directly in tabs.

### Naming & labeling

- **Filename mode:** none / prefix / suffix / both / timestamp.  
  Applies to: All modes.  
  **Notes:** Prefix/suffix for labeled datasets; timestamp to avoid collisions.

- **Clipboard hotkeys (P/S):** copy once, label the whole batch.  
  Applies to: Naming only.  
  **Notes:** `Ctrl+Alt+P` (Prefix), `Ctrl+Alt+S` (Suffix).

### Feedback & diagnostics

- **Badge colors:** green (bulk), yellow (manual), blue (done).  
  Applies to: All modes.

- **Toasts & log level (0–3):** tune visibility vs. overhead.  
  Applies to: All modes.  
  **Notes:** Keep logs at 0–1 daily; raise to 2–3 for troubleshooting (filter in Console by typing `[Mass image downloader]`).

---

## 🔧 Recommended setup

Pick a starting profile that matches your machine and the strictness of target sites. You can always tune individual options afterward (or apply a **Performance Preset** from Options).

| Profile | Max images/sec (galleries) | Max open tabs per gallery | Delay between openings (ms) | Max images per batch (bulk tabs) | Gallery similarity level | Log level | Toasts | Typical use |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| **Low (lightweight / strict sites)** | 2 | 3–4 | 600–1000 | 10–15 | 85–90% | 1 | On | Older hardware, metered networks, or sites with aggressive throttling |
| **Medium (default)** | 3–5 | 5–6 | 300–800 | 20–30 | 75–85% | 1 | On | General browsing, forums, image boards, typical galleries |
| **High (powerful / local testing)** | 6–10 | 7–10 | 150–400 | 40–60 | 65–75% | 0–1 | Off | Fast machines, stable sites, short sessions where you can monitor |

**Notes**

- Start conservative and **increase gradually**. If failures or rate limits appear, reduce **Max images/sec** and/or increase **Delay**.
- High similarity levels (e.g., 85–90%) group more aggressively (fewer duplicates) but can split legitimate variants on messy sites. Lower it on heterogeneous galleries.
- For very large tab sets, keep **Max images per batch** moderate and enable **Continue from where it left off** to resume later without rework.
- If you’re curating manually, enable the **One-click download icon** and use **Alt+Shift+I**, plus clipboard hotkeys (`Ctrl+Alt+P` / `Ctrl+Alt+S`) for consistent labeling.

---

## 🧪 Advanced / Developer tips

Legend: Practical guidance for diagnostics, testing, and contributions. Use these workflows to understand why items are skipped, validate pacing/grouping, and collect solid evidence for issues or PRs.

### View live flow details

- Open **DevTools → Console** (F12 or Ctrl/Cmd + Shift + I) and set **log level** to 1–2 in Options.
- Filter extension logs quickly:
  1) Set the Console level dropdown to **All levels**.  
  2) In the **Console filter** box, type:

     ```
     [Mass image downloader]
     ```
     Optional (regex on):
     ```
     ^\[Mass image downloader\]
     ```
- Example messages:
```

[Mass image downloader]: ✅ accepted URL https://.../full.jpg (800x1200, jpg)
[Mass image downloader]: ⏩ grouped 6 candidates under /gallery/2025/...
[Mass image downloader]: ⛔ skipped (too small) 240x240 < min 300x500
[Mass image downloader]: ⛔ skipped (format not allowed) avif
[Mass image downloader]: 💤 throttling (max 3 img/s), scheduling next batch...
```

### Test image thresholds (quick sanity check)

- Inspect a candidate image in DevTools Elements panel and check:
- `naturalWidth`, `naturalHeight`
- Tune **Minimum width/height** until your intended items are accepted and small assets are filtered out.
- If visuals look large but are rejected, CSS may be upscaling; rely on *natural* dimensions.

### Simulate extraction failures (for diagnosis)

- Temporarily **raise** min dimensions or **disable** a format to force predictable skips.
- Watch Console (log level 1–2) to confirm skip reasons (size/format/URL).
- Restore normal values after validating behavior.

### Reproduce issues reliably

- Prefer the **unpacked** build (Developer Mode).
- Start small: a single page or a tiny gallery; then scale throughput (images/sec) gradually.
- Capture:
- Page URL(s) and the chosen **mode** (Bulk / Galleries with/without links / Web-linked).
- **Options** snapshot (use **Peek Settings**).
- Console excerpts (log level 1–2) showing the failure or skip reason.

### Stable Service Worker (MV3) habits

- Keep **runs short** (batching) to avoid long-lived workers.
- Avoid closing tabs opened by Web-linked mode until the badge turns **blue**.
- If a site is strict, reduce **Max images per second**, add **Delay between tab openings**, and limit **Max open tabs per gallery**.

### Logging levels (0–3)

| Level | Purpose | Typical use |
|---:|---|---|
| 0 | Silent | Day-to-day usage with minimal overhead |
| 1 | Basic flow | Recommended default; milestones and high-level skip reasons |
| 2 | Verbose | Diagnostics; warnings and more detailed state transitions |
| 3 | Detailed | Deep debugging; full traces around grouping, filtering, downloads |

---

## ⌨️ Extension Shortcuts & Commands

Keyboard shortcuts speed up labeling and manual saves. If a shortcut conflicts with your OS or other apps, you can remap it in browser/OS settings.

| Shortcut | Action | Notes |
|---|---|---|
| **Alt + Shift + I** | Toggle the **one-click download icon** over the focused image and save instantly (no popup) | Great for manual curation; respects your size/format rules |
| **Ctrl + Alt + P** | Set filename **Prefix** from clipboard | Enable **Clipboard Hotkeys** in Options |
| **Ctrl + Alt + S** | Set filename **Suffix** from clipboard | Enable **Clipboard Hotkeys** in Options |

**Tips**

- Copy a label once (e.g., “datasetA”) and press **Ctrl+Alt+P** to apply it as a prefix for the whole batch (result: “datasetA_”).
- Use **Alt+Shift+I** to cherry-pick an image from a page without opening the popup.

---

## 👁️ Peek Settings Mode

A read-only overlay that shows your **active configuration** at a glance—perfect before long runs or when reporting issues.

**Purpose**  
Confirm exactly which thresholds, formats, and pacing rules are in effect without leaving the page you’re analyzing.

**How to open**  

- From the extension **popup**, click **Peek** (or the corresponding link/button in the UI).

**What you’ll see**  

- **Allowed formats**: PNG, JPG, JPEG, WEBP, AVIF, BMP  
- **Allow extended image URLs**: on/off (e.g., `:large`, `:orig`)  
- **Image size**: Minimum width & height (both must be met)  
- **Galleries**: Similarity level (%), Minimum group size, Smart/Fallback grouping  
- **Handling**: Gallery Image Handling (Immediate / Open in new tab)  
- **Throughput**: Max images per second  
- **Web-linked**: Max open tabs per gallery, Delay between openings (ms)  
- **Bulk tabs**: Max images per batch, Continue from where it left off  
- **Naming**: Filename mode (none/prefix/suffix/both/timestamp), current Prefix/Suffix  
- **UI & logs**: Show user feedback messages, Console log level (0–3)  
- **Peek panel transparency**: current opacity (0.2–1.0)

**Notes**  

- Peek is **read-only**. Change values in **Options**, then reopen Peek to verify.  
- Use higher **Console log level** (1–2) when taking screenshots of Peek for bug reports or PRs.  
- Adjust **Peek panel transparency** in Options to keep the page visible underneath while you audit settings.

---

## 🧰 Use cases

Real-world scenarios where Mass Image Downloader shines. Each example highlights the mode(s) and options that typically work best.

- **OSINT & open research**  
  Collect evidence-quality images from forums and public sources with strict size/format filters.  
  Recommended: **Web-linked galleries** (when thumbnails lead to detail pages) or **Galleries (with direct links)**.  
  Options to tune: **Minimum width/height**, **Allowed formats**, **Max images per second**, **Similarity level**.

- **AI/ML dataset building**  
  Produce reproducible corpora with deterministic filenames and consistent labeling.  
  Recommended: **Bulk Image Download** across topic tabs + **Clipboard Hotkeys** for `prefix/suffix`.  
  Options to tune: **Filename mode** (prefix/suffix/timestamp), **Allowed formats**, **Similarity level**, **Max images per batch**.

- **E-commerce & product sourcing**  
  Grab clean product shots from category or search pages; verify detail pages when needed.  
  Recommended: **Galleries (with direct links)** for grids; **Web-linked galleries** when full-res appears only on item pages.  
  Options to tune: **Open in new tab before downloading**, **Max open tabs per gallery**, **Delay between openings (ms)**.

- **UX/UI inspiration boards**  
  Save reference images across multiple design galleries and blogs with pacing that won’t trip rate limits.  
  Recommended: **Bulk Image Download** (multi-tab) + **Galleries (without links)** for inline images.  
  Options to tune: **Max images per second**, **Minimum width/height**, **Similarity level**.

- **Blogging & archives (paginated)**  
  Extract images from index pages where each post links to a separate HTML page.  
  Recommended: **Web-linked galleries** with bounded fan-out.  
  Options to tune: **Max open tabs per gallery**, **Delay between openings (ms)**, **Allowed formats**.

- **QA & web testing**  
  Validate that expected image variants (formats/sizes) are present across breakpoints.  
  Recommended: **Galleries (without links)** to capture inline `<img>` variants.  
  Options to tune: **Minimum width/height**, **Allowed formats**, **Log level 1–2** for clear skip reasons.

- **Personal curation / moodboards**  
  Cherry-pick a handful of images from visually dense pages without opening the popup.  
  Recommended: **One-click Download Icon** via **Alt+Shift+I**.  
  Options to tune: **Filename mode** (prefix/suffix), **Allowed formats**, **Minimum width/height**.

- **Academic & classroom use**  
  Build small, well-labeled sets for lectures or exercises—fast and reproducible.  
  Recommended: **Bulk Image Download** + **Clipboard Hotkeys**.  
  Options to tune: **Prefix/Suffix**, **Timestamp**, **Similarity level**, **Toasts** for quick feedback.

> 🚀 Power users can customize everything from file naming to concurrency and download limits, enabling granular control for large-scale tasks.

---

## ⚠️ Edge cases & warnings

Situations and caveats that can affect extraction/downloading. Review this list when results don’t match expectations or before filing a bug.

- **Login-gated / paywalled content**  
  Background downloads may fail or return placeholders; keep the session authenticated and retry.

- **Lazy-loaded / infinite scroll galleries**  
  Ensure the page has loaded enough content before extraction; scroll if needed.

- **Cross-origin iframes**  
  Images inside third-party iframes can be invisible to content scripts.

- **Dynamic blobs / data URIs**  
  Only network-reachable images are downloadable; if direct extraction yields few results, try **Web-linked galleries**.

- **Extended URL suffixes**  
  `:large`, `:orig` work only when **Allow extended image URLs** is enabled and the platform supports them.

- **Minimum size filters**  
  Both width and height must meet thresholds; CSS scaling can be misleading—check real pixel sizes in DevTools.

- **Format toggles**  
  AVIF/BMP depend on browser support; if candidates are skipped, verify decoding support and toggles.

- **Rate limits / transient blocks**  
  Lower **Max images per second** on strict sites; add **Delay between tab openings (ms)** and reduce **Max open tabs per gallery**.

- **File naming collisions**  
  Deterministic naming reduces conflicts; external renamers or OS locks can delay writes—badge turns **blue** only after completion.

- **MV3 lifecycle**  
  The Service Worker sleeps between events; long runs are split into batches by design.

- **Non-standard markup**  
  If direct/visual modes miss items, try **Web-linked galleries** as an alternative.

> Can’t resolve your issue? You’re welcome to open a Pull Request (PR) so the team can review and patch it. See more details on crafting a good PR in **[🙌 Contributions](#-contributions)**.

---

## 🔗 Related Projects

Looking for complementary tools from the same org or ecosystem?

- **[🧙‍♂️Unicode to PNG](https://github.com/del-Pacifico/unicode-to-png)** — A small **Python** utility to convert Unicode emoji into PNG files using system fonts.  
  Ideal for generating emoji assets, custom packs, or UI prototyping.

---

## 💖 Support the Project

**Mass Image Downloader** is free and open-source, maintained in personal time.  
If it saves you hours or makes your workflow smoother, consider supporting ongoing development:

- 💸 [Donate via PayPal](https://paypal.me/spalmah?country.x=CL&locale.x=es_XC)

> 🙏 Every bit of support is truly appreciated.  
> 💬 Feel free to reach out with questions, ideas, or feedback — your input matters!

---

## 📄 License

This project is licensed under the [Mozilla Public License v. 2.0](https://www.mozilla.org/MPL/2.0/).

---

## 🙌 Contributions

We welcome contributions of all kinds — bug fixes, features, documentation, and tests.  
This project targets **Chromium 93+** and **Manifest V3**, with code written in **JavaScript** only.

### How to contribute

1) **Fork** the repository and create a branch from **`dev`**  
   - `feature/<short-name>` for features  
   - `bugfix/<short-name>` for fixes  
   - `docs/<short-name>` for documentation updates
2) **Develop & test** locally (unpacked build)  
   - Load via `chrome://extensions` → **Developer Mode** → **Load unpacked**  
   - Reproduce scenarios: Bulk / Galleries (with/without links) / Web-linked  
   - Use **Debug log level 1–2** and **Peek Settings** to capture evidence
3) **Coding standards**  
   - MV3-compatible JavaScript; defensive `try/catch` around async/message edges  
   - Console logs **prefixed** with: `[Mass image downloader]: <emoji> <message>` (use function logDebug in utils.js)  
   - Comments in **English**, concise and actionable  
   - Shared helpers live in `utils.js`  
   - Keep UI copy consistent with existing style
4) **PR checklist**  
   - Update **CHANGELOG.md** (Added / Changed / Fixed / Maintenance), if applicable  
   - Update **README.md** when behavior, options, or requirements change  
   - Bump `manifest.json` version if warranted  
   - Include reproducible steps (URL pattern, chosen mode, expected vs. actual)  
   - Attach Console excerpts (log level 1–2) and, if possible, short clips for UI changes
5) **Open the PR**  
   - Target branch: **`dev`**  
   - Link related issues, describe scope, edge cases, and trade-offs  
   - Prefer small, focused PRs for faster review and merge

### Quick path to a solid PR

> 1) **Fork** and branch off **`dev`** (`feature/<name>` or `bugfix/<name>`).  
> 2) **Reproduce** the problem with a minimal, deterministic scenario (URL pattern, steps, expected vs. actual).  
> 3) **Implement** the fix following project style: JS-only (MV3), defensive errors, logs prefixed with `[Mass image downloader]:`.  
> 4) **Verify** locally (unpacked) with Debug log **level 1–2**; attach before/after Console snippets.  
> 5) **Update** docs if behavior/options change, and add a concise entry in **CHANGELOG.md**.  
> 6) **Open the PR**, link issues, and note any edge cases considered.

---

## 📝 Changelog

See the full release notes in **[CHANGELOG.md](./CHANGELOG.md)**.  
Current version: **v2.08.127**.

---

## 🔒 Privacy

This extension runs **locally** in your browser. It does **not** send browsing data or downloaded images to external servers, does **not** include telemetry or tracking, and stores configuration in **`chrome.storage.sync`**.  No data is collected or transmitted.

Requested permissions are limited to the features described in this README (tabs, downloads, storage, scripting, clipboardRead).  
Host permissions (`<all_urls>`) are required to discover and validate images across sites; filtering happens client-side.

**Notes**

- Some formats (e.g., AVIF) depend on your browser/OS; no external decoder services are used.  
- The optional **Peek** overlay is read-only and displays locally stored settings only.

---

## 📜 Usage Policy

This project is offered for legitimate, responsible use. By using it, you agree to:

- **Respect site terms** — Follow the target website’s Terms of Service and applicable laws (including copyright).  
- **Be gentle with servers** — Use pacing controls (Max images per second, Max open tabs per gallery, Delay between openings) to avoid undue load.  
- **Handle personal data carefully** — If pages contain personal or sensitive images, ensure you have a lawful basis to download and store them.  
- **Own your outputs** — You are responsible for how you use downloaded content and for complying with any licensing or attribution requirements.  
- **No warranty** — The software is provided “as is” under the MPL-2.0 license; the authors are not liable for misuse or resulting damages.

**Good citizen tips**

- Start with conservative throughput and increase gradually.  
- Prefer “Open in new tab before downloading” when you need visual confirmation or when sites render the final image via client-side scripts.  
- Use deterministic naming (prefix/suffix/timestamp) to keep datasets auditable and reproducible.

---

<!-- Badges (Footer) -->
![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow?style=flat-square&logo=javascript)
![No Tracking](https://img.shields.io/badge/Privacy-No%20tracking-blueviolet?style=flat-square&logo=shield)
![Lightweight](https://img.shields.io/badge/Built-lightweight-lightgrey?style=flat-square)
![Modular Design](https://img.shields.io/badge/Architecture-Modular-informational?style=flat-square)
![ES Modules](https://img.shields.io/badge/ESM-Enabled-success?style=flat-square&logo=javascript)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen?style=flat-square&logo=github)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?style=flat-square)
