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

---

## 📸 2. Bulk Image Download

This section covers **Bulk Image Download** configurations, designed to process **direct image URLs opened in browser tabs**.

The guides in this section focus on:
- Predictable behavior
- Safe defaults
- Controlled performance
- Minimal failure risk

> Start with the **baseline configuration** before attempting more aggressive setups.

---

### ✅ 2.1 Reliable & Safe Bulk Image Download (Recommended Baseline)

#### 🎯 Goal

Download images from open tabs **reliably and safely**, with minimal system impact and predictable results.

This configuration prioritizes:
- Stability over speed
- Low failure rate
- Clear progress feedback
- Safe tab handling

---

#### 🧭 When to Use This

Use this configuration when:

- You are a first-time user
- You are processing important or irreplaceable images
- Your system has average or unknown performance characteristics
- You want to validate that Bulk Image Download works correctly

> This is the **recommended starting point** for all users.

---

#### 📋 Prerequisites

Before applying this configuration:

- Tabs to the **right of the active tab** contain direct image URLs  
  (e.g. `.jpg`, `.jpeg`, `.png`, `.webp`)
- Browser setting **“Ask where to save each file before downloading”** is disabled
- No other download-heavy tasks are running

---

#### ⚙️ Step-by-Step Configuration

> Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ✅  
  - WEBP ✅
- Minimum width: `300`
- Minimum height: `300`

**Bulk Image Download Settings**
- Max simultaneous downloads: `1`
- Max images per batch: `10`
- Continue from where it left off: ❌ Disabled

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(empty)*

> Do not modify any other settings for this baseline.

---

#### ✅ Expected Result

When you activate **Bulk Image Download**:

- Images are downloaded **one at a time**
- Each tab is closed **only after a successful download**
- The badge counter:
  - Turns **green** during the process
  - Increments after each image
  - Turns **blue** only when all downloads are complete
- The browser remains responsive throughout the process

---

#### ⚠️ Common Mistakes

- Enabling high concurrency too early
- Increasing batch size before validating behavior
- Using this mode on non-image tabs
- Mixing this setup with gallery-based configurations

> If no images are downloaded, verify that the tabs contain **direct image URLs**.

---

#### ⚡ Performance & Stability Notes

- This configuration is intentionally conservative
- Download speed is slower, but failure risk is minimal
- Suitable for:
  - Most laptops and desktops
  - Long-running sessions
  - Background usage

Once this setup works correctly, you can safely move to more aggressive configurations.

---

➡️ Next: **High-Speed Bulk Download on Powerful Machines**

---

### ⚡ 2.2 High-Speed Bulk Download on Powerful Machines

#### 🎯 Goal

Download large numbers of images **as fast as possible** using **controlled parallelism**, while maintaining predictable behavior.

This configuration is designed to **maximize throughput** on systems with:
- Fast CPUs
- SSD storage
- Stable, high-bandwidth internet connections

---

#### 🧭 When to Use This

Use this configuration when:

- You have already validated Bulk Image Download using the baseline setup
- Your system handles multiple downloads without UI lag
- You need to process **many image tabs quickly**
- Occasional retry or failure is acceptable

> This setup is **not recommended** for first-time users.

---

#### 📋 Prerequisites

Before applying this configuration:

- The baseline Bulk Image Download configuration works correctly
- Tabs contain **direct image URLs only**
- Your browser remains responsive during multiple parallel downloads
- You are not running other download-intensive applications

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ✅  
  - WEBP ✅
- Minimum width: `300`
- Minimum height: `300`

**Bulk Image Download Settings**
- Max simultaneous downloads: `4`
- Max images per batch: `50`
- Continue from where it left off: ✅ Enabled

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(optional, user preference)*

> Avoid changing unrelated settings.

---

#### ✅ Expected Result

When you activate **Bulk Image Download**:

- Multiple images download **in parallel**
- Tabs close rapidly after successful downloads
- The badge counter:
  - Turns **green** during the entire process
  - Increments continuously across batches
  - Turns **blue** only after all images are processed
- Total processing time is significantly reduced

---

#### ⚠️ Common Mistakes

- Using this setup on low-memory or older systems
- Combining high concurrency with very large batch sizes on unstable networks
- Assuming higher speed always equals better reliability

> If downloads stall or fail intermittently, reduce concurrency first.

---

#### ⚡ Performance & Stability Notes

- This configuration prioritizes speed over safety margins
- Browser responsiveness may briefly degrade on very large tab sets
- Ideal for:
  - Desktop workstations
  - Short, intensive download sessions
  - Controlled environments

> If instability appears, fall back to the **baseline configuration** or reduce parallel downloads.

---

➡️ Next: **Conservative Bulk Download for Low-Resource Systems**

---

### 🐢 2.3 Conservative Bulk Download for Low-Resource Systems

#### 🎯 Goal

Download images **safely on low-resource or constrained systems**, minimizing CPU, memory, and disk pressure.

This configuration prioritizes:
- Maximum stability
- Minimal browser impact
- Predictable, slow-but-safe execution

---

#### 🧭 When to Use This

Use this configuration when:

- You are using an older computer or low-power device
- Your system has limited RAM
- The browser becomes unresponsive during downloads
- You experience random download failures or tab crashes
- You are running multiple applications in parallel

> This setup is ideal for **long-running, unattended sessions**.

---

#### 📋 Prerequisites

Before applying this configuration:

- Tabs contain **direct image URLs**
- No heavy background tasks are running
- You accept slower overall download speed in exchange for stability

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ✅  
  - WEBP ❌ *(optional, disable if memory is very limited)*
- Minimum width: `300`
- Minimum height: `300`

**Bulk Image Download Settings**
- Max simultaneous downloads: `1`
- Max images per batch: `5`
- Continue from where it left off: ❌ Disabled

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(empty)*

> Do not enable additional features while using this configuration.

---

#### ✅ Expected Result

When you activate **Bulk Image Download**:

- Images download **strictly one at a time**
- Tabs close slowly and safely after each successful download
- The badge counter:
  - Turns **green** during the process
  - Increments steadily
  - Turns **blue** only after completion
- Browser responsiveness remains stable

---

#### ⚠️ Common Mistakes

- Increasing batch size to “speed things up”
- Enabling parallel downloads on constrained hardware
- Using this setup on very large tab sets without supervision

> If performance issues persist, further reduce batch size or close unnecessary tabs.

---

#### ⚡ Performance & Stability Notes

- This is the **safest Bulk Image Download configuration**
- Download speed is intentionally slow
- Best suited for:
  - Older laptops
  - Virtual machines
  - Remote desktop environments
  - Systems under heavy load

> For faster results, upgrade hardware or move to the baseline configuration once stability is confirmed.

---

➡️ End of **Bulk Image Download** configurations.

---

## 🖼️ 3. Extract Gallery Images (With Direct Links)

This section covers configurations for **galleries where thumbnails link directly to high-resolution image files**.

These guides focus on:
- Clean image extraction
- Resolution-aware filtering
- Predictable grouping behavior
- Safe handling of medium to large galleries

Before using these configurations, ensure that the gallery thumbnails link **directly to image files** (not to HTML pages).

---

### 📥 3.1 Clean Gallery Extraction (Immediate Download)

#### 🎯 Goal

Extract and download **only the best-quality images** from a gallery **immediately**, without opening additional tabs.

This configuration prioritizes:
- Accuracy over speed
- Clean results
- Minimal browser disruption

---

#### 🧭 When to Use This

Use this configuration when:

- Gallery thumbnails link directly to image files
- You want **automatic download** without visual inspection
- You trust the gallery structure
- You want a clean, deduplicated image set

> This is the **recommended baseline** for direct-link galleries.

---

#### 📋 Prerequisites

Before applying this configuration:

- Thumbnails use `<a>` tags pointing directly to image URLs
- High-resolution images are larger than thumbnails
- The gallery does not require JavaScript navigation to load images

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ✅  
  - WEBP ✅
- Minimum width: `800`
- Minimum height: `600`

**Extract Gallery Images Settings**
- Extract mode: `Immediate`
- Gallery max images: `10`

**Gallery Finder Settings**
- Path similarity level: `80%`

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(optional)*

> Avoid modifying unrelated settings.

---

#### ✅ Expected Result

When you activate **Extract Gallery Images**:

- Thumbnails are scanned and validated
- Images are grouped by URL similarity
- Only the **highest-resolution image per group** is retained
- Images download immediately without opening tabs
- The badge counter updates progressively and completes cleanly

---

#### ⚠️ Common Mistakes

- Using this configuration on galleries that link to HTML pages
- Setting minimum dimensions too high
- Lowering similarity threshold excessively
- Expecting visual confirmation before download

> If no images are downloaded, verify that the links point directly to image files.

---

#### ⚡ Performance & Stability Notes

- Immediate mode is fast and efficient
- Suitable for:
  - Well-structured galleries
  - Medium-sized image sets
  - Automated workflows
- For uncertain galleries, consider the tab-based extraction mode

---

➡️ Next: **Gallery Extraction Using Background Tabs**

---

### 🗂️ 3.2 Gallery Extraction Using Background Tabs

#### 🎯 Goal

Extract images from direct-link galleries while **opening each target image in a background tab before downloading**, allowing for safer handling of uncertain or dynamic galleries.

This configuration prioritizes:
- Higher compatibility with complex sites
- Safer extraction when images are modified at load time
- Reduced risk of missing the true high-resolution asset

---

#### 🧭 When to Use This

Use this configuration when:

- The immediate download mode yields incomplete or low-quality images
- The final image is rendered or altered after the page loads
- You want a safer extraction path without manual interaction
- The gallery structure is partially inconsistent

> This setup trades speed for **higher extraction reliability**.

---

#### 📋 Prerequisites

Before applying this configuration:

- Thumbnails link directly to image URLs
- The site allows background tab loading
- Your system can handle opening multiple tabs temporarily

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ✅  
  - WEBP ✅
- Minimum width: `800`
- Minimum height: `600`

**Extract Gallery Images Settings**
- Extract mode: `Open in background tab`
- Gallery max images: `5`

**Gallery Finder Settings**
- Path similarity level: `80%`

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(optional)*

> Avoid increasing gallery limits before validating stability.

---

#### ✅ Expected Result

When you activate **Extract Gallery Images**:

- Each candidate image opens in a background tab
- The final rendered image is evaluated
- Only the highest-resolution valid image is downloaded
- Background tabs close automatically after download
- The badge counter reflects cumulative progress

---

#### ⚠️ Common Mistakes

- Using high gallery limits on slow systems
- Combining background-tab mode with aggressive concurrency
- Assuming this mode is faster than immediate download

> If tabs remain open or downloads stall, reduce the gallery limit.

---

#### ⚡ Performance & Stability Notes

- Background-tab mode is more resilient on complex sites
- Temporary tab usage increases memory pressure
- Best suited for:
  - Dynamic or script-heavy galleries
  - Medium-sized collections
  - Situations where correctness matters more than speed

> For maximum speed on simple galleries, prefer **Immediate Download** mode.

---

➡️ Next: **Handling Large Linked Galleries Safely**

---

### 🛡️ 3.3 Handling Large Linked Galleries Safely

#### 🎯 Goal

Extract images from **large direct-link galleries** while maintaining **browser stability**, avoiding tab storms, memory spikes, and incomplete downloads.

This configuration prioritizes:
- Controlled throughput
- Predictable memory usage
- Graceful progress on large datasets

---

#### 🧭 When to Use This

Use this configuration when:

- Galleries contain **dozens or hundreds** of thumbnails
- Immediate or background-tab modes cause instability
- You need to process large collections **reliably**, even if slower
- The site structure is consistent but volume is high

> This setup is optimized for **scale**, not speed.

---

#### 📋 Prerequisites

Before applying this configuration:

- Thumbnails link directly to image files
- You have validated extraction on smaller galleries
- You are willing to process the gallery incrementally

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ✅  
  - WEBP ✅
- Minimum width: `1000`
- Minimum height: `800`

**Extract Gallery Images Settings**
- Extract mode: `Open in background tab`
- Gallery max images: `3`

**Gallery Finder Settings**
- Path similarity level: `85%`

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(recommended for dataset identification)*

> Do not increase limits during the first run.

---

#### ✅ Expected Result

When you activate **Extract Gallery Images**:

- Images are processed **in small, controlled groups**
- Background tabs open and close gradually
- Memory usage remains stable
- High-resolution images are extracted without duplication
- The badge counter progresses steadily until completion

---

#### ⚠️ Common Mistakes

- Setting gallery limits too high “to speed things up”
- Lowering similarity threshold on large galleries
- Running multiple extraction modes simultaneously

> If the browser slows down, stop the process and reduce limits further.

---

#### ⚡ Performance & Stability Notes

- This is the **safest configuration for large galleries**
- Total processing time is longer but predictable
- Ideal for:
  - Dataset building
  - Archival workflows
  - Research-oriented extraction
  - Long unattended runs

> Once stability is confirmed, you may cautiously increase limits.

---

➡️ End of **Extract Gallery Images (With Direct Links)** configurations.

---

## 🖼️ 4. Extract Gallery Images (Without Links)

This section covers configurations for **visual galleries where thumbnails do NOT link directly to image files**.

In these scenarios, images are typically:
- Rendered inline
- Loaded lazily
- Embedded without `<a>` tags
- Mixed with non-gallery content

> These guides focus on **visual detection, strict filtering, and noise reduction**.

---

### 🔍 4.1 Visual Gallery Detection with Size Filtering

#### 🎯 Goal

Detect and download **only meaningful, high-quality images** from visual galleries **without direct links**, while ignoring UI icons, ads, and decorative elements.

This configuration prioritizes:
- Precision over quantity
- Strong noise filtering
- Clean, usable results

---

#### 🧭 When to Use This

Use this configuration when:

- The gallery displays large images inline
- Thumbnails do not link to image URLs
- Pages contain many non-gallery images
- Immediate gallery extraction yields too much noise

> This is the **recommended baseline** for visual-only galleries.

---

#### 📋 Prerequisites

Before applying this configuration:

- Images are visible directly on the page
- Images are not loaded as CSS backgrounds
- The page does not require scrolling to reveal hidden images

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ✅  
  - WEBP ❌ *(optional, disable if page contains many icons)*
- Minimum width: `600`
- Minimum height: `400`

**Extract Gallery Images Settings**
- Extract mode: `Immediate`
- Gallery max images: `10`

**Gallery Finder Settings**
- Path similarity level: `75%`

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(optional)*

> Avoid lowering minimum dimensions unless necessary.

---

#### ✅ Expected Result

When you activate **Extract Gallery Images**:

- Inline images are scanned visually
- Small decorative images are ignored
- Only images meeting size requirements are selected
- Downloads occur immediately without opening tabs
- The result set is focused and relevant

---

#### ⚠️ Common Mistakes

- Setting minimum dimensions too low
- Expecting detection of CSS background images
- Using this mode on pages with heavy lazy loading
- Assuming all visible images are part of a gallery

> If too many images are detected, increase minimum dimensions.

---

#### ⚡ Performance & Stability Notes

- Visual detection is more CPU-intensive than link-based extraction
- Best suited for:
  - Clean, image-centric pages
  - Medium-sized visual galleries
- For complex layouts, results may vary

> For pages with mixed content, use the next configuration.

---

➡️ Next: **Improving Results on Mixed-Content Pages**

---

### 🧪 4.2 Improving Results on Mixed-Content Pages

#### 🎯 Goal

Improve image extraction results on **pages that mix gallery images with UI elements, ads, icons, and unrelated media**, ensuring that only **relevant, high-quality images** are downloaded.

This configuration prioritizes:
- Aggressive noise reduction
- Strict relevance filtering
- Predictable results on cluttered pages

---

#### 🧭 When to Use This

Use this configuration when:

- Pages contain many small or decorative images
- Navigation icons or ads are being downloaded unintentionally
- Visual gallery detection produces too many false positives
- You are working with blogs, forums, or content-heavy layouts

> This setup is designed for **messy, real-world pages**.

---

#### 📋 Prerequisites

Before applying this configuration:

- Images are rendered inline (not CSS backgrounds)
- The main gallery images are significantly larger than UI elements
- You accept that some borderline images may be skipped

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ❌ *(disable to reduce icons and UI noise)*  
  - WEBP ❌
- Minimum width: `900`
- Minimum height: `600`

**Extract Gallery Images Settings**
- Extract mode: `Immediate`
- Gallery max images: `8`

**Gallery Finder Settings**
- Path similarity level: `80%`

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(recommended to identify source)*

> Avoid enabling additional formats unless required.

---

#### ✅ Expected Result

When you activate **Extract Gallery Images**:

- UI elements and icons are aggressively filtered out
- Only large, content-relevant images are selected
- Downloads occur immediately
- The resulting image set is smaller but higher quality
- Manual cleanup after download is minimized

---

#### ⚠️ Common Mistakes

- Lowering minimum dimensions “to catch everything”
- Enabling PNG/WEBP on pages heavy with UI graphics
- Expecting perfect results on highly dynamic layouts

> If important images are missing, slightly reduce minimum dimensions.

---

#### ⚡ Performance & Stability Notes

- Strict filtering reduces total processing work
- Ideal for:
  - Blogs
  - News sites
  - Forums
  - Documentation pages with embedded images
- Not suitable for:
  - Artistic portfolios with small images
  - Thumbnail-only layouts

> For cleaner pages, revert to the baseline visual gallery configuration.

---

➡️ End of **Extract Gallery Images (Without Links)** configurations.

---

## 🌐 5. Web-Linked Galleries

This section covers configurations for **web-linked galleries**, where thumbnails link to **HTML detail pages** instead of directly to image files.

In these scenarios:
- Thumbnails point to intermediate pages
- The final image is discovered after navigation
- Concurrency and fan-out must be controlled carefully

> These guides focus on **controlled navigation, correctness, and stability**.

---

### 🔗 5.1 Extracting Images from HTML Detail Pages

#### 🎯 Goal

Extract high-resolution images from galleries where each thumbnail opens a **separate HTML page** that contains the final image.

This configuration prioritizes:
- Correct image resolution
- Controlled tab creation
- Predictable navigation behavior

---

#### 🧭 When to Use This

Use this configuration when:

- Thumbnails link to HTML pages, not image files
- The final image appears inside a detail or viewer page
- Immediate or direct-link gallery extraction yields no results
- You need accurate extraction over raw speed

> This is the **baseline configuration** for web-linked galleries.

---

#### 📋 Prerequisites

Before applying this configuration:

- Detail pages load the final image without user interaction
- The site allows background tab loading
- You are not blocked by login walls or captchas
- JavaScript execution is not required to trigger image loading

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ✅  
  - WEBP ❌ *(optional, disable to reduce noise)*
- Minimum width: `1000`
- Minimum height: `800`

**Web-Linked Gallery Settings**
- Max concurrent pages: `3`

**Gallery Finder Settings**
- Path similarity level: `80%`

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(recommended for dataset grouping)*

> Do not increase concurrency before validating results.

---

#### ✅ Expected Result

When you activate **Extract Web-Linked Galleries**:

- Thumbnail links are collected
- Detail pages open gradually in background tabs
- The final image is detected and validated
- Only the highest-resolution image is downloaded
- Background tabs close automatically after completion
- The badge counter reflects cumulative progress

---

#### ⚠️ Common Mistakes

- Using high concurrency on slow or script-heavy sites
- Attempting this mode on galleries with direct image links
- Expecting extraction when images load only after user interaction

> If pages remain open or no images are found, reduce concurrency first.

---

#### ⚡ Performance & Stability Notes

- Web-linked extraction is inherently slower
- Controlled fan-out prevents browser overload
- Best suited for:
  - Art platforms
  - Photo communities
  - Portfolio sites
- Not recommended for very large galleries without prior testing

---

➡️ Next: **Controlling Fan-Out and Concurrency**

---

### 🧵 5.2 Controlling Fan-Out and Concurrency

#### 🎯 Goal

Safely extract images from **large or complex web-linked galleries** by **strictly controlling fan-out and concurrency**, preventing browser overload, stalled tabs, or incomplete downloads.

This configuration prioritizes:
- Stability over speed
- Controlled resource usage
- Predictable long-running behavior

---

#### 🧭 When to Use This

Use this configuration when:

- Galleries contain **many thumbnails linking to HTML pages**
- Opening too many tabs causes slowdown or crashes
- The site is script-heavy or slow to respond
- You need to process large collections **incrementally and safely**

> This setup is designed for **scale under constraints**.

---

#### 📋 Prerequisites

Before applying this configuration:

- The baseline web-linked gallery extraction works correctly
- Detail pages load images reliably without manual interaction
- You are prepared for longer execution times

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Global Settings**
- Allowed formats:  
  - JPG ✅  
  - JPEG ✅  
  - PNG ❌ *(disable to reduce non-content images)*  
  - WEBP ❌
- Minimum width: `1200`
- Minimum height: `900`

**Web-Linked Gallery Settings**
- Max concurrent pages: `1`

**Gallery Finder Settings**
- Path similarity level: `85%`

**Filename Settings**
- Filename mode: `Original`
- Prefix / Suffix: *(recommended for dataset or batch identification)*

> Do not raise concurrency during the first run.

---

#### ✅ Expected Result

When you activate **Extract Web-Linked Galleries**:

- Only one detail page opens at a time
- Memory usage remains stable
- Images are downloaded sequentially
- Tabs open and close predictably
- The badge counter increments steadily until completion

---

#### ⚠️ Common Mistakes

- Increasing concurrency to “speed things up”
- Running multiple extraction modes simultaneously
- Using this setup on small galleries where it adds unnecessary overhead

> If progress appears slow, remember that this configuration is optimized for **reliability**, not speed.

---

#### ⚡ Performance & Stability Notes

- This is the **safest configuration for large web-linked galleries**
- Total runtime may be long but predictable
- Ideal for:
  - Research datasets
  - Archival workflows
  - Long unattended sessions
- Not suitable for time-critical extraction

> For smaller galleries, revert to the baseline web-linked configuration.

---

➡️ End of **Web-Linked Galleries** configurations.

---

## 📁 6. Filename Strategies

This section covers **filename configuration strategies** to ensure downloaded images are:
- Easy to identify
- Consistently named
- Safe for filesystem usage
- Suitable for datasets, archives, or long-term storage

> These guides focus on **clarity, traceability, and scale**, not aesthetics.

---

### 🏷️ 6.1 Clean Filenames with Prefixes and Suffixes

#### 🎯 Goal

Generate **clean, descriptive filenames** by adding controlled prefixes and/or suffixes to downloaded images.

This configuration prioritizes:
- Dataset organization
- Source identification
- Collision avoidance
- Human-readable filenames

---

#### 🧭 When to Use This

Use this configuration when:

- Downloading images from multiple sources
- Building datasets that must remain identifiable
- You want to group images by project, site, or batch
- Default filenames are ambiguous or repetitive

> This setup is suitable for **most structured workflows**.

---

#### 📋 Prerequisites

Before applying this configuration:

- You understand how filenames are generated by the source site
- You want consistent naming across downloads
- You do not require timestamps for uniqueness

---

#### ⚙️ Step-by-Step Configuration

Open the **Options** page and apply the following values:

**Filename Settings**
- Filename mode:  
  - `Prefix` **or**  
  - `Suffix` **or**  
  - `Both`
- Prefix:  
  - Example: `projectA`
- Suffix:  
  - Example: `gallery01`

**Global Settings**
- Filename sanitization: *(enabled by default)*

> Avoid using special characters in prefixes or suffixes.

---

#### ✅ Expected Result

When images are downloaded:

- Filenames follow a consistent pattern, for example:
  - `projectA_originalname.jpg`
  - `originalname_gallery01.png`
  - `projectA_originalname_gallery01.webp`
- Filenames remain readable and filesystem-safe
- Accidental overwrites are avoided by incremental naming

---

#### ⚠️ Common Mistakes

- Using long or verbose prefixes
- Including spaces or special characters
- Changing naming strategy mid-run
- Expecting prefixes to replace original filenames

> If filenames become cluttered, simplify the prefix or suffix.

---

#### ⚡ Performance & Stability Notes

- Filename customization has **no performance impact**
- Recommended for:
  - Research datasets
  - Archival projects
  - Multi-source collections
- Safe to combine with all extraction modes

---

➡️ Next: **Timestamp-Based Naming for Large Collections**
