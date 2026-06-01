# ⌨️ Hotkey Policy

Mass Image Downloader provides keyboard shortcuts as optional entry points for advanced workflows.
The following hotkeys are currently implemented and supported as of the latest stable version:

## 🧭 Principles

- Hotkeys are optional and never the only way to trigger a feature
- Popup and context menu actions act as fallbacks when available
- Backward compatibility is mandatory

## 🔒 Existing Hotkeys (Stable)

The following shortcuts are reserved and must not change:

- Ctrl + Alt + P — Set filename prefix (only if prefix is available)
- Ctrl + Alt + S — Set filename suffix (only if suffix is available)
- Ctrl + Shift + M — Image Inspector panel (toggle)
- Alt + Shift + I — One-click Download Icon (manual image overlay)

## ⚡Active Core Hotkeys (Current)

The following hotkeys are currently implemented and supported:

- Alt + Shift + D — Bulk Image Download
- Alt + Shift + G — Extract images from galleries (direct links)
- Alt + Shift + V — Extract images from galleries (visual / no direct links)
- Alt + Shift + W — Extract images from galleries (web-linked)
- Alt + Shift + S — View Settings (Peek panel toggle)

## 🪄 Existing shortcut table

| Shortcut | Action | Notes |
|---|---|---|
| **Alt + Shift + D** | Bulk Image Download | Scans open tabs and downloads valid image targets |
| **Alt + Shift + G** | Extract galleries (direct links) | Best for galleries where thumbnails point directly to image files |
| **Alt + Shift + V** | Extract galleries (visual / no direct links) | Best for inline image galleries without dedicated anchors |
| **Alt + Shift + W** | Extract galleries (web-linked) | Opens linked detail pages and processes them as gallery candidates |
| **Alt + Shift + I** | Toggle the one-click download icon | Manual curation flow for quick image saving |
| **Alt + Shift + S** | Toggle Settings Peek | Opens the read-only configuration overlay |
| **Ctrl + Shift + M** | Toggle Image Inspector Mode | Opens the inspector workflow for image review, metadata, zoom, and save |
| **Ctrl + Alt + P** | Set filename prefix from clipboard | Requires clipboard hotkeys enabled |
| **Ctrl + Alt + S** | Set filename suffix from clipboard | Requires clipboard hotkeys enabled |

### 📝 Note on Bulk Download Hotkey

Although `Alt + Shift + B` follows the preferred mnemonic pattern, some Chromium-based browsers
(notably Brave) may not auto-assign this shortcut from the manifest.

For this reason, Bulk Image Download uses:

- **Alt + Shift + D** (Download)

> This improves default compatibility while remaining easy to remember.

## 📐 Rules for New Hotkeys

- Preferred pattern: `Alt + Shift + <Key>`
- Avoid `Ctrl`-based combinations for new actions
- Avoid OS- or browser-reserved shortcuts
- Avoid locale-dependent keys

## 🎛️ User Control

Users can customize or disable shortcuts using the browser’s extension shortcut settings.

> The extension does not attempt to override or enforce user-defined shortcuts.

## 🧱 Technical Constraints (Manifest V3)

Due to Manifest V3 limitations:

- A maximum of **4 commands** can be declared using `chrome.commands`
- Additional hotkeys may need to be handled via `keydown` listeners in content scripts
- Not all suggested shortcuts are auto-assigned by the browser

If a shortcut appears as **Not set**, users can assign it manually via:

- **`chrome://extensions/shortcuts`**
- **`edge://extensions/shortcuts`**
- **`opera://extensions/shortcuts`**
- **`brave://extensions/shortcuts`**

If the browser keeps a shortcut as **Not set** after reload, the binding must be assigned manually in that browser's shortcut manager. This is a browser/profile-level shortcut mapping issue, not a feature failure.

### Browser compatibility note

`Ctrl + Shift + M` for Image Inspector is confirmed to work in Brave and Edge.
In Opera, the same shortcut may be intercepted or blocked by the browser/profile before it reaches the content script.
If that happens, the hotkey does not reach the `keydown` handler and the inspector will not toggle.

## 🧰 Fallback Behavior

If a shortcut is unavailable or not triggered:

- The feature remains accessible via UI or context menu
- A developer log may be emitted for debugging
