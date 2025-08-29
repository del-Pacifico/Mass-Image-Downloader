// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// peekOptions.js - Read-only configuration viewer for Mass Image Downloader

(() => {
    let configCache = {};
    let debugLogLevelCache = 1;
    let showUserFeedbackMessagesCache = true;

    // Check if the script is running in a Chrome extension context
    document.addEventListener("DOMContentLoaded", async () => {
        try {
            await initConfig();
            applyTransparency();
            renderSettings();
            bindCopyJsonButton();
            setVersion();
        } catch (err) {
            logDebug(1, "❌ Unhandled error in initialization:", err.message);
            logDebug(2, "Stacktrace: ", err.stack);
        }
    });

    // Listen for changes in chrome.storage
    // and update the cached config accordingly
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "sync") {
            for (const key in changes) {
                if (configCache.hasOwnProperty(key)) {
                    configCache[key] = changes[key].newValue;
                    logDebug(2, `🔄 Live update: ${key} changed to ${JSON.stringify(changes[key].newValue)}`);

                    // 🖼️ If the transparency setting changed, apply it immediately
                    if (key === 'peekTransparencyLevel') {
                        applyTransparency();
                    }
                }
            }
            renderSettings(); // re-render UI with updated values
        }
    });

    /**
     * Retrieves all settings from chrome.storage and caches them.
     */
    async function initConfig() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, (data) => {
                try {
                    configCache = data || {};
                    debugLogLevelCache = parseInt(configCache.debugLogLevel ?? 1);
                    showUserFeedbackMessagesCache = configCache.showUserFeedbackMessages ?? true;

                    logDebug(1, "📦 Config loaded.");
                    logDebug(2, "🧾 Cached config:", configCache);
                    resolve();
                } catch (err) {
                    logDebug(1, "❌ Failed to cache configuration:", err.message);
                    logDebug(2, "Stacktrace: ", err.stack);
                    resolve();
                }
            });
        });
    }

    /**
     * Applies background transparency using 'peekTransparencyLevel'.
     */
    function applyTransparency() {
        try {
            const level = parseFloat(configCache.peekTransparencyLevel);
            const alpha = isNaN(level) || level < 0.2 || level > 1.0 ? 0.8 : level;
            document.body.style.backgroundColor = `rgba(248, 248, 248, ${alpha})`;
            logDebug(2, `🫥 Applied transparency level: ${alpha}`);
        } catch (err) {
            logDebug(1, `❌ Error applying transparency: ${err.message}`);
            logDebug(2, "Stacktrace: ", err.stack);
        }
    }

    /**
     * Renders all cached configuration values in read-only format.
     */
    function renderSettings() {
        const container = document.getElementById("settings-container");

        if (!container) {
            logDebug(1, "❌ settings-container not found.");
            return;
        }

        // Clear container if re-rendering
        container.innerHTML = '';

        const sections = getSectionDefinitions();

        for (const [sectionTitle, keys] of Object.entries(sections)) {
            const wrapper = document.createElement("div");
            wrapper.className = "global-options-wrapper";

            const title = document.createElement("h2");
            title.textContent = sectionTitle;
            wrapper.appendChild(title);

            for (const [key, label] of Object.entries(keys)) {
                const group = document.createElement("div");
                group.className = "option-group";

                const lbl = document.createElement("label");
                lbl.textContent = `${label}:`;
                group.appendChild(lbl);

                const val = document.createElement("p");
                val.className = "info-text";
                val.textContent = formatValue(configCache[key]);

                group.appendChild(val);
                wrapper.appendChild(group);
            }

            container.appendChild(wrapper);
        }

        logDebug(1, "✅ Settings rendered successfully.");
    }

    /**
     * Converts a raw value to a readable format.
     */
    function formatValue(val) {
        if (typeof val === "boolean") return val ? "Enabled" : "Disabled";
        
        // If it's a number, return it directly
        // If it's a string, check for specific known values

        if (typeof val === "string") {
            switch (val) {
                case "prefix": return "Prefix mode";
                case "suffix": return "Suffix mode";
                case "both": return "Prefix + Suffix";
                case "timestamp": return "Timestamped";
                case "tab": return "Open in tab";
                case "immediate": return "Download immediately";
                case "custom": return "Custom (user modified)";
            }
        }
        return val ?? "(not set)";
    }

    /**
     * Defines display grouping for configuration keys.
     */
    function getSectionDefinitions() {
        return {
            "📁 File system": {
                downloadFolder: "Download Folder",
                customFolderPath: "Custom Folder Path",
                filenameMode: "Filename Mode",
                prefix: "Prefix",
                suffix: "Suffix",
                allowJPG: "Allow JPG",
                allowJPEG: "Allow JPEG",
                allowPNG: "Allow PNG",
                allowWEBP: "Allow WEBP",
                allowAVIF: "Allow AVIF",
                allowBMP: "Allow BMP"
            },
            "🐦 Allow extended image URLs":{
                allowExtendedImageUrls: "Allow extended image URLs (e.g., Twitter/X :large, :orig)"
            },
            "📋 Clipboard Hotkeys": {
                enableClipboardHotkeys: "Enable Clipboard Hotkeys",
                enableOneClickIcon: "One-click Download Icon"
            },
            "🖼️ Galleries": {
                gallerySimilarityLevel: "Gallery Similarity Level",
                galleryMinGroupSize: "Minimum Group Size",
                galleryEnableSmartGrouping: "Enable Smart Grouping",
                galleryEnableFallback: "Enable Fallback Grouping",
                extractGalleryMode: "Extract Gallery Mode",
                galleryMaxImages: "Max Images per Second"
            },
            "📐 Image size": {
                minWidth: "Minimum Width",
                minHeight: "Minimum Height"
            },
            "📢 Notifications": {
                showUserFeedbackMessages: "Show User Feedback Messages",
                peekTransparencyLevel: "Peek Transparency Level"
            },
            "🐛 Debugging": {
                debugLogLevel: "Debug Log Level"
            },
            "📸 Download in tabs": {
                maxBulkBatch: "Max Bulk Batch",
                continueFromLastBulkBatch: "Continue From Last Batch"
            },
            "🔗 Web-Linked Gallery": {
                maxOpenTabs: "Max Open Tabs",
                webLinkedGalleryDelay: "Linked Gallery Delay (ms)"
            },
            "⚙️ Performance Preset": {
                performancePreset: "Performance Preset"
            }
        };
    }

    /**
     * Sets extension version number in the footer.
     */
    function setVersion() {
        try {
            const versionEl = document.getElementById("extension-version");
            if (chrome.runtime.getManifest && versionEl) {
                versionEl.textContent = chrome.runtime.getManifest().version;
                logDebug(1, `🟢 Extension version: ${versionEl.textContent}`);
            }
        } catch (err) {
            logDebug(1, `❌ Failed to set extension version: ${err.message}`);
            logDebug(2, "Stacktrace: ", err.stack);
        }
    }

    /**
     * Binds clipboard copy functionality to button.
     */
    function bindCopyJsonButton() {
        const btn = document.getElementById("copy-json");
        if (!btn) {
            logDebug(1, "❌ copy-json button not found.");
            return;
        }

        btn.addEventListener("click", () => {
            try {
                const json = JSON.stringify(configCache, null, 2);

                if (!navigator.clipboard) {
                    showMessage("❌ Clipboard API not supported", "error");
                    return;
                }

                navigator.clipboard.writeText(json)
                    .then(() => {
                        showMessage("✅ Settings copied to clipboard");
                        logDebug(1, "📋 Configuration copied.");
                    })
                    .catch(err => {
                        showMessage("❌ Copy failed: " + err.message, "error");
                        logDebug(1, "❌ Clipboard copy error:", err.message);
                    });

            } catch (err) {
                showMessage("❌ Unexpected error during copy", "error");
                logDebug(1, "❌ Exception during JSON copy:", err.message);
                logDebug(2, "Stacktrace: ", err.stack);
            }
        });
    }

    /**
     * Shows user feedback messages visually.
     */
    function showMessage(text, type = "info") {
        try {
            const msg = document.createElement("div");
            const duration = type === "error" ? 10000 : 5000;
            const backgroundColor = type === "error" ? "#d9534f" : "#007EE3";

            msg.textContent = "Mass image downloader: " + text;
            msg.style.position = "fixed";
            msg.style.top = "20px";
            msg.style.right = "20px";
            msg.style.backgroundColor = backgroundColor;
            msg.style.color = "#FFFFFF";
            msg.style.padding = "10px";
            msg.style.borderRadius = "5px";
            msg.style.fontSize = "13px";
            msg.style.boxShadow = "2px 2px 8px rgba(0, 0, 0, 0.3)";
            msg.style.opacity = "1";
            msg.style.transition = "opacity 0.5s ease-in-out";
            msg.style.zIndex = "9999";

            document.body.appendChild(msg);

            setTimeout(() => {
                msg.style.opacity = "0";
                setTimeout(() => {
                    try { msg.remove(); } catch {}
                }, 500);
            }, duration);
        } catch (err) {
            logDebug(1, "❌ Failed to show message:", err.message);
            logDebug(2, "Stacktrace: ", err.stack);
        }
    }

    /**
     * Logs debug messages to console.
     */
    function logDebug(levelOrMessage, ...args) {
        try {
            let level = 1;
            let messageArgs = [];

            if (typeof levelOrMessage === "number" && levelOrMessage >= 1 && levelOrMessage <= 3) {
                level = levelOrMessage;
                messageArgs = args;
            } else {
                level = 1;
                messageArgs = [levelOrMessage, ...args].filter(arg => arg !== undefined);
            }

            if (debugLogLevelCache >= level) {
                console.log("[Mass image downloader]:", ...messageArgs);
            }
        } catch (err) {
            console.log("[Mass image downloader]: ❌ Logging failed:", err.message);
            console.log("[Mass image downloader]: Stacktrace:", err.stack);
        }
    }
})();
