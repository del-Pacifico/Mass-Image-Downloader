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

    // Initialize config and listener after storage loads
    (async function () {
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
                    if (chrome.runtime.lastError) {
                        logDebug(1, `❌ Failed to load config: ${chrome.runtime.lastError.message}`);
                        logDebug(2, `🐛 Stack trace: ${err.stack}`);
                        return resolve();
                    }

                    configCache = data ?? {};
                    debugLogLevelCache = parseInt(configCache.debugLogLevel ?? 1);
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
     * Registers message listener after config initialized
     */
    function registerMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            try {
                if (message?.action === "open-peek-overlay") {
                    logDebug(1, "📨 Message received: open-peek-overlay");
                    injectPeekPanel();
                }
            } catch (err) {
                logDebug(1, `❌ Failed to handle message in settingsPeek.js: ${err.message}`);
                logDebug(2, `🐛 Stack trace: ${err.stack}`);
            }
        });

        logDebug(1, "🧭 Message listener registered.");
    }

    // ⌨️ Hotkey: Toggle Settings Peek panel (Alt + Shift + S)
    document.addEventListener("keydown", (e) => {
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

            // Check for Alt + Shift + S
            if (e.altKey && e.shiftKey && key === "s") {
                e.preventDefault();
                e.stopPropagation();

                logDebug(1, "⌨️ Hotkey triggered: View Settings (Peek) (Alt+Shift+S)");

                // Reuse the existing entry point
                injectPeekPanel();
            }
        } catch (err) {
            logDebug(1, `❌ Peek hotkey handler failed: ${err.message}`);
            logDebug(2, `🐛 Stack trace: ${err.stack}`);
        }
    }, true);


    /**
     * Injects the peek panel overlay if it is not already present
     */
    function injectPeekPanel() {
        try {
            if (document.getElementById("__mdi_peekOverlay")) {
                logDebug(2, "🟡 Peek overlay already visible. Ignoring.");
                return;
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
        } catch (err) {
            logDebug(1, `❌ Error injecting peek overlay: ${err.message}`);
            logDebug(2, `🐛 Stack trace: ${err.stack}`);
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