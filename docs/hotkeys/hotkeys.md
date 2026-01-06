# ⌨️ Hotkey Policy

Mass Image Downloader provides keyboard shortcuts as optional entry points for advanced workflows.

## Principles

- Hotkeys are optional and never the only way to trigger a feature
- Popup and context menu actions always act as fallbacks
- Backward compatibility is mandatory

## Existing Hotkeys (Stable)

The following shortcuts are reserved and must not change:

- Ctrl + Shift + P — Set filename prefix (when prefix is available)
- Ctrl + Shift + S — Set filename suffix (when suffix is available)
- Ctrl + Shift + M — Image Inspector
- Alt + Shift + I — One-click Download Icon (manual image download overlay)

## Rules for New Hotkeys

- Preferred pattern: `Alt + Shift + <Key>`
- Avoid `Ctrl`-based combinations for new actions
- Avoid OS- or browser-reserved shortcuts
- Avoid locale-dependent keys

## User Control

Users can customize or disable shortcuts using the browser’s extension shortcut settings.

The extension does not attempt to override user-defined shortcuts.

## Fallback Behavior

If a shortcut is unavailable or not triggered:
- The feature remains accessible via UI or context menu
- A developer log may be emitted for debugging

---

Related to: #41
