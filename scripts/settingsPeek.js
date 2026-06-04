// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// settingsPeek.js - Injects peekOptions.html in a right-side overlay panel on user command

if (!window.__mdi_settingsPeekInjected) {
  window.__mdi_settingsPeekInjected = true;

    // configCache stores all options from storage and allows future extensions
    // such as peekTransparencyLevel, showUserFeedbackMessages, etc.
    let configCache = {};
    let debugLogLevelCache = 1;
    const CONFIG_CACHE_STALE_MS = 60000;
    const SETTINGS_PEEK_ACTIVE_TOKEN_ATTR = "data-mdi-settings-peek-active-token";
    const settingsPeekInstanceToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let configLastHydratedAt = 0;
    let configHydrationInFlight = null;

    // Initialize config and listener after storage loads
    (async function () {
        markSettingsPeekInstanceActive();
        logStartup();
        await initConfig();
        registerMessageListener();

    })();

    /**
     * Debug log to confirm script loaded into tab
     */
    function logStartup() {
        console.log("[Mass image downloader]: 🧪 settingsPeek.js loaded into page.");
    }

    /**
     * Initializes configCache and debugLogLevelCache from storage
     */
    async function initConfig() {
        return new Promise((resolve) => {
            try {
                chrome.storage.sync.get(null, (data) => {
                    // Check for runtime error
                    if (chrome.runtime.lastError) {
                        logDebug(1, `❌ Failed to load config: ${chrome.runtime.lastError.message}`);
                        return resolve();
                    }

                    configCache = data ?? {};
                    debugLogLevelCache = parseInt(configCache.debugLogLevel ?? 1);
                    configLastHydratedAt = Date.now();
                    logDebug(1, "⚙️ Debug level loaded:", debugLogLevelCache);
                    resolve();
                });
            } catch (err) {
                logDebug(1, `❌ Exception loading config: ${err.message}`);
                resolve();
            }
        });
    }

    /**
     * Checks whether the Settings Peek config snapshot is complete enough to open the panel.
     * @returns {boolean} True when the local snapshot is initialized and fresh.
     */
    function isPeekConfigUsable() {
        if (!configLastHydratedAt) return false;
        if ((Date.now() - configLastHydratedAt) > CONFIG_CACHE_STALE_MS) return false;
        return configCache && typeof configCache === "object";
    }

    /**
     * Rehydrates Settings Peek config only when the local snapshot is stale or incomplete.
     * @param {string} contextLabel - Short label used in debug logs.
     * @returns {Promise<boolean>} True when a storage refresh was performed.
     */
    async function ensurePeekConfigFresh(contextLabel = "Settings Peek") {
        if (isPeekConfigUsable()) {
            return false;
        }

        if (!configHydrationInFlight) {
            logDebug(2, `🔄 Rehydrating Settings Peek config for ${contextLabel}.`);
            configHydrationInFlight = initConfig()
                .catch((err) => {
                    logDebug(1, `❌ Settings Peek config rehydration failed for ${contextLabel}: ${err.message}`);
                    logDebug(2, `🐛 Stack trace: ${err.stack}`);
                    throw err;
                })
                .finally(() => {
                    configHydrationInFlight = null;
                });
        }

        await configHydrationInFlight;
        return true;
    }

    /**
     * Registers message listener after config initialized
     */
    function registerMessageListener() {
        // Listen for messages from background or popup scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            try {
                // Handle "open-peek-overlay" action
                if (message?.action === "open-peek-overlay") {
                    logDebug(1, "📨 Message received: open-peek-overlay");
                    togglePeekPanel();
                }
            } catch (err) {
                logDebug(1, `❌ Failed to handle message in settingsPeek.js: ${err.message}`);
                logDebug(2, `🐛 Stack trace: ${err.stack}`);
            }
        });

        logDebug(1, "🧭 Message listener registered.");
    }

    // ⌨️ Hotkey: Toggle Settings Peek panel (Alt + Shift + S)
    document.addEventListener("keydown", settingsPeekHotkeyHandler, true);

    /**
     * Handles the Settings Peek hotkey and releases stale listeners after extension reloads.
     * @param {KeyboardEvent} e - Browser keydown event.
     * @returns {void}
     */
    function settingsPeekHotkeyHandler(e) {
        try {
            const target = e.target;

            // Ignore hotkey while typing in input/textarea/contenteditable
            const isTypingContext =
                target &&
                (target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable);

            // If typing, ignore hotkey
            if (isTypingContext) return;

            const key = String(e.key || "").toLowerCase();

            // Check for Alt + Shift + S → View Settings (Peek)
            if (e.altKey && e.shiftKey && key === "s") {
                if (!isExtensionContextUsable()) {
                    if (isSupersededSettingsPeekInstance()) {
                        logDebug(2, "ℹ️ Stale Settings Peek listener ignored because a newer instance is active.");
                        return;
                    }

                    showSettingsPeekRefreshMessage();
                    logDebug(1, "⚠️ Settings Peek hotkey ignored because the extension context is invalidated.");
                    return;
                }

                markSettingsPeekInstanceActive();
                e.preventDefault();
                e.stopPropagation();

                logDebug(1, "⌨️ Hotkey triggered: View Settings (Peek) (Alt+Shift+S)");

                // Reuse the existing entry point
                togglePeekPanel();
            }

        } catch (err) {
            logDebug(1, `❌ Peek hotkey handler failed: ${err.message}`);
            logDebug(2, `🐛 Stack trace: ${err.stack}`);
        }
    }

    /**
     * Checks whether this content script still has a valid extension runtime context.
     * @returns {boolean} True when extension runtime APIs can still be used safely.
     */
    function isExtensionContextUsable() {
        try {
            return Boolean(chrome?.runtime?.id && chrome.runtime.getURL("html/peekOptions.html"));
        } catch (err) {
            return false;
        }
    }

    /**
     * Marks this content-script instance as the active Settings Peek handler for the page.
     * @returns {void}
     */
    function markSettingsPeekInstanceActive() {
        try {
            document.documentElement?.setAttribute(SETTINGS_PEEK_ACTIVE_TOKEN_ATTR, settingsPeekInstanceToken);
        } catch (_) {}
    }

    /**
     * Checks whether another Settings Peek instance has become active after this one.
     * @returns {boolean} True when this listener should stay silent.
     */
    function isSupersededSettingsPeekInstance() {
        try {
            const activeToken = document.documentElement?.getAttribute(SETTINGS_PEEK_ACTIVE_TOKEN_ATTR);
            return Boolean(activeToken && activeToken !== settingsPeekInstanceToken);
        } catch (_) {
            return false;
        }
    }

    /**
     * Shows the standard recovery message for Settings Peek after extension reloads.
     * @returns {void}
     */
    function showSettingsPeekRefreshMessage() {
        showPeekRecoveryMessage("MID: Settings Peek needs this tab to be refreshed after the extension was reloaded.", "error");
    }

    /**
     * Shows a small page-side recovery message when the extension runtime context was invalidated.
     * @param {string} text - Message to show to the user.
     * @param {"info"|"success"|"error"} type - Visual message type.
     * @returns {void}
     */
    function showPeekRecoveryMessage(text, type = "info") {
        try {
            const container = document.body || document.documentElement;
            if (!container) return;

            const toastType = ["info", "success", "error"].includes(type) ? type : "info";
            let toast = document.getElementById("__mdi_peekRecoveryToast");
            if (!toast) {
                toast = document.createElement("div");
                toast.id = "__mdi_peekRecoveryToast";
                toast.setAttribute("role", "status");
                toast.setAttribute("aria-live", "polite");
                container.appendChild(toast);
            }

            const finalText = /^MID:/i.test(text) ? text : `MID: ${text}`;
            logDebug(2, `📢 Showing user message: "${finalText}" (${toastType})`);

            toast.textContent = finalText;
            toast.style.cssText = [
                "position:fixed",
                "top:18px",
                "right:18px",
                "max-width:360px",
                "padding:12px 14px",
                "border-radius:6px",
                "font:13px/1.35 Arial, sans-serif",
                "color:#fff",
                `background:${toastType === "error" ? "#d9534f" : "#007EE3"}`,
                "box-shadow:0 4px 14px rgba(0,0,0,.22)",
                "z-index:2147483647",
                "opacity:1",
                "transition:opacity .2s ease",
                "white-space:normal",
                "word-break:break-word"
            ].join(";");

            clearTimeout(window.__mdiPeekRecoveryToastTimer);
            window.__mdiPeekRecoveryToastTimer = setTimeout(() => {
                toast.style.opacity = "0";
                setTimeout(() => toast.remove(), 250);
            }, 7000);
        } catch (err) {
            logDebug(1, `❌ Failed to show Settings Peek recovery message: ${err.message}`);
        }
    }

    /**
     * Toggles the Peek panel on/off.
     * If the panel already exists, it will be removed.
     * Otherwise, it will be injected.
     */
    async function togglePeekPanel() {
        try {
            markSettingsPeekInstanceActive();

            const existing = document.getElementById("__mdi_peekOverlay");
            // If panel exists, remove it
            if (existing) {
                existing.remove();
                logDebug(1, "✅ Peek panel closed (toggle).");
                return;
            }

            await ensurePeekConfigFresh("panel toggle");

            // Otherwise, inject it
            const didOpen = injectPeekPanel();
            if (didOpen) {
                logDebug(1, "✅ Peek panel opened (toggle).");
            }

        } catch (err) {
            if (/Extension context invalidated/i.test(err.message || "")) {
                showSettingsPeekRefreshMessage();
            }

            logDebug(1, `❌ Failed to toggle Peek panel: ${err.message}`);
            logDebug(2, `🐛 Stack trace: ${err.stack}`);
        }
    }


    /**
     * Injects the peek panel overlay if it is not already present.
     * @returns {boolean} True when the panel is present or was injected successfully.
     */
    function injectPeekPanel() {
        try {
            if (document.getElementById("__mdi_peekOverlay")) {
                logDebug(2, "🟡 Peek overlay already visible. Ignoring.");
                return true;
            }

            const overlay = document.createElement("div");
            overlay.id = "__mdi_peekOverlay";
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.right = "0";
            overlay.style.width = "25%";
            overlay.style.height = "100%";
            overlay.style.zIndex = "2147483647";
            overlay.style.borderLeft = "1px solid #ccc";
            overlay.style.boxShadow = "0 0 12px rgba(0,0,0,0.4)";
            overlay.style.backgroundColor = "#F8F8F8";

            const closeButton = document.createElement("button");
            closeButton.textContent = "×";
            closeButton.title = "Close Settings Peek";
            closeButton.style.position = "absolute";
            closeButton.style.top = "10px";
            closeButton.style.right = "14px";
            closeButton.style.zIndex = "2147483648";
            closeButton.style.fontSize = "14px";
            closeButton.style.padding = "6px 10px";
            closeButton.style.border = "2px solid #768591";
            closeButton.style.borderRadius = "4px";
            closeButton.style.backgroundColor = "#007EE3";
            closeButton.style.color = "#FFFFFF";
            closeButton.style.cursor = "pointer";
            closeButton.style.transition = "all 0.3s ease";

            closeButton.addEventListener("mouseenter", () => {
                closeButton.style.backgroundColor = "#768591";
                closeButton.style.borderColor = "#007EE3";
                closeButton.style.color = "#FFFFFF";
            });

            closeButton.addEventListener("mouseleave", () => {
                closeButton.style.backgroundColor = "#007EE3";
                closeButton.style.borderColor = "#768591";
                closeButton.style.color = "#FFFFFF";
            });

            closeButton.addEventListener("click", removePeekPanel);

            const iframe = document.createElement("iframe");
            iframe.src = chrome.runtime.getURL("html/peekOptions.html");
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";

            overlay.appendChild(closeButton);
            overlay.appendChild(iframe);
            document.body.appendChild(overlay);

            // 🆕 Send performancePreset to iframe after load
            iframe.onload = () => {
                try {
                    const preset = configCache.performancePreset ?? "medium";
                    iframe.contentWindow.postMessage({ action: "set-performance-preset", value: preset }, "*");
                    logDebug(1, `📤 Sent performancePreset to Peek: '${preset}'`);
                } catch (err) {
                    logDebug(1, `❌ Failed to post performancePreset to iframe:`, err.message);
                }
            };

            document.addEventListener("keydown", escKeyHandler);
            logDebug(1, "🪟 Peek overlay injected into page.");
            return true;
        } catch (err) {
            if (/Extension context invalidated/i.test(err.message || "")) {
                showSettingsPeekRefreshMessage();
            }

            logDebug(1, `❌ Error injecting peek overlay: ${err.message}`);
            logDebug(2, `🐛 Stack trace: ${err.stack}`);
            return false;
        }
    }

    /**
     * Removes the overlay and related event listeners
     */
    function removePeekPanel() {
        try {
            const overlay = document.getElementById("__mdi_peekOverlay");
            if (overlay) {
                overlay.remove();
                logDebug(1, "❌ Peek overlay removed.");
            }
            document.removeEventListener("keydown", escKeyHandler);
        } catch (err) {
            logDebug(1, `❌ Failed to remove overlay: ${err.message}`);
            logDebug(2, `🐛 Stack trace: ${err.stack}`);
        }
    }

    /**
     * Handles Escape key to close the overlay
     */
    function escKeyHandler(event) {
        try {
            if (event.key === "Escape") {
                logDebug(2, "🔚 Escape key pressed. Removing overlay.");
                removePeekPanel();
            }
        } catch (err) {
            logDebug(1, `❌ Escape key handler error: ${err.message}`);
            logDebug(2, `🐛 Stack trace: ${err.stack}`);
        }
    }

    /**
     * Log messages with consistent format and fallback
     */
    function logDebug(levelOrMessage, ...args) {
        try {
            const level = debugLogLevelCache ?? 1;
            const msgArgs = typeof levelOrMessage === "number"
                ? args
                : [levelOrMessage, ...args];

            const debugLevel = typeof levelOrMessage === "number" ? levelOrMessage : 1;
            if (level >= debugLevel) {
                console.log("[Mass image downloader]:", ...msgArgs);
            }
        } catch (err) {
            console.log("[Mass image downloader]: ❌ Logging failed in settingsPeek.js:", err.message);
        }
    }
}
