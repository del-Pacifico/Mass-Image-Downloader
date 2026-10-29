# 🏔️ Mass Image Downloader – Quick Start Guide

Welcome to **Mass Image Downloader** (MID). This guide will help you install the extension and complete your first successful image download in under 2 minutes. 

If you are a power user, researcher, or developer, you can skip to the [User Manual](user-manual/README.md) or [Configuration Guides](docs/configuration-guides/README.md).

---

## ⚠️ Before You Start: Browser Support & Privacy

MID is built on a strict privacy-by-design philosophy. Because Google Chrome employs user-tracking practices that conflict with this philosophy, *Google Chrome is not officially supported or QA-tested by this project.*

*Practical reality:* The extension will most likely function on Chrome. However, any use on Chrome is strictly *at your own risk and falls entirely outside our QA coverage and support scope*. 

We officially support, test, and recommend:

- **Brave** (Primary QA baseline)
- Microsoft Edge
- Opera
- Vivaldi

*Requirement:* Chromium version 93 or higher.

---

## Step 1: Get the Project

You have two options to get the extension files:

### 🗔 Windows - Option A: Download ZIP (No Git required)

1. Go to the [GitHub Releases page](https://github.com/del-Pacifico/Mass-Image-Downloader/releases).
2. Download the `Source code (zip)` of the *latest release*.
3. Extract the ZIP file to a folder on your computer (e.g., `C:\Extensions\Mass-Image-Downloader`).

### 🐧 Unix/Linux (Ubuntu, macOS, etc.) Option B: Download ZIP

1. Go to the GitHub Releases page.
2. Download the Source code (zip) of the latest release.
3. Open a terminal and navigate to your Downloads folder:

```bash
cd ~/Downloads
```

4. Extract the ZIP file

```bash
unzip Mass-Image-Downloader-*.zip -d ~/Extensions/
```

(If you don't have unzip installed, use your package manager: sudo apt install unzip on Ubuntu/Debian)

5. Verify the extraction:

```bash
ls ~/Extensions/Mass-Image-Downloader-*/manifest.json
```

### 📦 Option C: Clone via Git (For developers)

```bash
git clone https://github.com/del-Pacifico/Mass-Image-Downloader.git
cd Mass-Image-Downloader
```

---

## Step 2: Enable Developer Mode

1. Open your browser's extensions page:
   - **Brave:** `brave://extensions`
   - **Edge:** `edge://extensions`
   - **Opera:** `opera://extensions`
   - **Vivaldi:** `vivaldi://extensions`
2. In the top-right corner of the page, toggle the **Developer mode** switch to **ON**.

---

## Step 3: Install the Extension

1. On the extensions page, click the **Load unpacked** button (top-left).
2. A file picker will open. Navigate to the folder where you extracted or cloned the project.
3. Select the **root folder** (the one that contains the `manifest.json` file) and click **Select Folder**.
4. The MID icon will now appear in your extensions list.

---

## Step 4: Pin the Extension Icon

To ensure the extension is always within reach:

1. Click the **Extensions** icon (looks like a puzzle piece 🧩) in your browser's top-right toolbar.
2. Find **Mass Image Downloader** in the list.
3. Click the **Pin** icon (📌) next to it. The extension icon will now be permanently visible in your toolbar.

---

## Step 5: Your First Download (The Guaranteed Flow)

Let's download images from a webpage using the simplest method:

1. Open any webpage that contains multiple images (e.g., a blog post or a gallery).
2. **Scroll down the page at least once.** *(Note: The extension does not auto-scroll pages to respect your bandwidth and privacy. It only sees images that have been loaded into the browser).*
3. Click the **Mass Image Downloader icon** in your browser toolbar.
4. In the popup window, select **Extract Visual Gallery** (this mode finds images directly on the current page).
5. Click the **Start** button.
6. A notification will appear confirming the download. The images will be saved to your browser's default Downloads folder.

🎉 **Congratulations! You just completed your first batch download.**

---

## Step 6: One Optional Tweak (Highly Recommended)

To avoid downloading tiny icons or logos, set a minimum size limit:

1. Click the extension icon and select **Options** (or click the gear icon ⚙️).
2. Find the **Image Size** section.
3. Set **Minimum Width** to `250` and **Minimum Height** to `250`.
4. Click **Save**. 
*(Leave all other settings at their defaults for now).*

---

## 🆘 Common Issues

| Issue | Solution |
|---|---|
| **"No images found"** | Scroll down the webpage to force images to load, then try again. |
| **Downloaded to the wrong folder** | Check your browser's global download settings. Ensure "Ask where to save each file before downloading" is **disabled** for seamless bulk downloads. |
| **Shortcut keys not working** | Some websites intercept keyboard shortcuts. Try triggering the action from the extension popup instead. |
| **Using Google Chrome** | Remember: Chrome is unsupported by design. If you experience issues, please switch to Brave, Edge, Opera, or Vivaldi before reporting a bug. |

---

## 📚 Next Steps

Now that you have the basics, explore the full potential of the extension:

- 📖 [User Manual](user-manual/README.md): Learn about all download modes (Bulk, Web-Linked, Inspector).
- ⚙️ [Configuration Guides](configuration-guides/README.md): Scenario-based setups for specific needs.
- ⌨️ [Hotkeys Policy](hotkeys/hotkeys.md): Master the extension without touching the mouse.

---

## 🙋 Need Help?

1. Check the [open Issues](https://github.com/del-Pacifico/Mass-Image-Downloader/issues) to see if your problem is already known.
2. If opening a new Issue, please include: your browser name/version, the extension version (found in `manifest.json`), and the exact steps to reproduce the problem.
3. *Note:* Issues specifically related to Google Chrome behavior will be closed as "unsupported by design".