// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// 📄 clipboardHotkeys.js

/**
* This script listens for global keyboard shortcuts (Ctrl+Shift+P/S) to set prefixes and suffixes for image downloads using clipboard text.
* It uses the Clipboard API to read text from the clipboard and stores it in Chrome's storage.
* It also provides user feedback messages and handles errors gracefully.
* The script is designed to be run in the context of a web page and uses the Chrome extension APIs for storage and permissions.
* It is important to note that this script should be run in the context of a web page, not in the background script or popup script of a Chrome extension.
* The script uses the Clipboard API to read text from the clipboard and stores it in Chrome's storage using chrome.storage.sync.set.
* It also provides user feedback messages using a custom showUserMessage function that creates a temporary message element on the page.
* The script is designed to be run in the context of a web page and uses the Chrome extension APIs for storage and permissions.
*/
(async () => {

    let debugLogLevelCache = 1;
    let showUserFeedbackMessagesCache = true;
    let toastMinVisibleMsCache = 2000; // Default: 2000ms
    let enableClipboardHotkeysCache = false;
    let filenameModeCache = 'none';

    // ✅ Initialize config from chrome.storage.sync
    /**
     * Initializes configuration settings from chrome.storage.sync.
     * @returns {Promise<void>} Resolves when configuration is loaded.
     * @description
     * This function retrieves configuration settings from chrome.storage.sync.
     * It fetches the debug log level, user feedback message preference, clipboard hotkeys setting, and filename mode.
     * If any of these settings are not found, it assigns default values.   
     * It also handles errors gracefully and logs debug messages based on the user's log level.
     * This function is useful for initializing the script's configuration before any other operations.
     * It ensures that the script has the necessary settings to function correctly.
     * It is called immediately when the script is loaded to ensure that the configuration is ready before any other operations.
     */
    async function initConfig() {
        return new Promise((resolve) => {
            if (!chrome.storage || !chrome.storage.sync) {
                logDebug(1, "❌ chrome.storage.sync is not available in this context.");
                return resolve();
            }

            chrome.storage.sync.get(
                ["debugLogLevel", "showUserFeedbackMessages", "toastMinVisibleMs", "enableClipboardHotkeys", "filenameMode"],
                (data) => {
                    try {
                        debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
                        showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;

                        const rawToastMinVisibleMs = parseInt(data.toastMinVisibleMs ?? 2000, 10);
                        toastMinVisibleMsCache = (!isNaN(rawToastMinVisibleMs) && rawToastMinVisibleMs >= 0 && rawToastMinVisibleMs <= 10000)
                            ? rawToastMinVisibleMs
                            : 2000;

                        enableClipboardHotkeysCache = data.enableClipboardHotkeys ?? false;
                        filenameModeCache = data.filenameMode ?? "none";
                    } catch (err) {
                        logDebug(1, "❌ Failed to assign config values:", err.message);
                    }
                    resolve();
                }
            );
        });
    }

    // ✅ Initialize config
    await initConfig();

    // 🔄 Keep local config in sync with settings changes (MV3 friendly)
    if (chrome?.storage?.onChanged) {
        chrome.storage.onChanged.addListener((changes, area) => {
            try {
                if (area !== "sync") return;
                
                // log all user config changes at options
                logDebug(2, "🔄 Settings updated (sync). Applying changes...");

                // update debugLogLevelCache if changed
                if (changes.debugLogLevel) {
                    const oldValue = debugLogLevelCache;
                    debugLogLevelCache = parseInt(changes.debugLogLevel.newValue ?? 1);
                    logDebug(2, `🔄 debugLogLevel updated: ${oldValue} → ${debugLogLevelCache}`);
                }

                // update showUserFeedbackMessagesCache if changed
                if (changes.showUserFeedbackMessages) {
                    const oldValue = showUserFeedbackMessagesCache;
                    showUserFeedbackMessagesCache = changes.showUserFeedbackMessages.newValue ?? true;
                    logDebug(2, `🔄 showUserFeedbackMessages updated: ${oldValue} → ${showUserFeedbackMessagesCache}`);
                }

                // update toastMinVisibleMsCache if changed
                if (changes.toastMinVisibleMs) {
                    const oldValue = toastMinVisibleMsCache;
                    const raw = parseInt(changes.toastMinVisibleMs.newValue ?? 2000, 10);
                    toastMinVisibleMsCache = (!isNaN(raw) && raw >= 0 && raw <= 10000) ? raw : 2000;
                    logDebug(2, `🔄 toastMinVisibleMs updated: ${oldValue} → ${toastMinVisibleMsCache}`);
                }

                // update enableClipboardHotkeysCache if changed
                if (changes.enableClipboardHotkeys) {
                    const oldValue = enableClipboardHotkeysCache;
                    enableClipboardHotkeysCache = changes.enableClipboardHotkeys.newValue ?? false;
                    logDebug(2, `🔄 enableClipboardHotkeys updated: ${oldValue} → ${enableClipboardHotkeysCache}`);
                }

                // update filenameModeCache if changed
                if (changes.filenameMode) {
                    const oldValue = filenameModeCache;
                    filenameModeCache = changes.filenameMode.newValue ?? "none";
                    logDebug(2, `🔄 filenameMode updated: ${oldValue} → ${filenameModeCache}`);
                }

            } catch (err) {
                logDebug(2, "⚠️ storage.onChanged handler failed:", err.message);
            }
        });
    }
    
    // ✅ Check if the script is already loaded
    logDebug(1, '📋 ClipboardHotkeys script loaded.');

    if (window.__mdi_clipboardHotkeysInitialized) {
        logDebug(1, '⏳ ClipboardHotkeys already initialized. Skipping duplicate initialization.');
        return;
    }

    // 🔒 Set running state to prevent multiple executions    
    window.__mdi_clipboardHotkeysInitialized = true;

    /**
     * Logs debug messages based on user-defined log level.
     *  @param {number|string} levelOrMessage - Log level (0-3) or message string. 
     * Where 0: no log. 1: basic, 2: verbose, 3: detailed.
     * @param {...any} args - Additional arguments for message formatting.
     * @returns {void}
     * @description This function checks the user's debug log level and logs messages accordingly.
     * It retrieves the log level from chrome.storage.sync and compares it with the provided level.
     * If the user's level is greater than or equal to the provided level, it logs the message.
     * It also handles legacy or malformed calls by assuming a default log level of 1.     * 
     */
    function logDebug(levelOrMessage, ...args) {
        try {
            let level = 1;
            let messageArgs = [];
    
            if (typeof levelOrMessage === "number" && levelOrMessage >= 1 && levelOrMessage <= 3) {
                level = levelOrMessage;
                messageArgs = args;
            } else {
                // Handle legacy or malformed calls (assume default log level 1)
                level = 1;
                messageArgs = [levelOrMessage, ...args].filter(arg => arg !== undefined);
            }
    
            try {
                if (level <= debugLogLevelCache) {
                    console.log("[Mass image downloader]:", ...messageArgs);
                }
            } catch (levelError) {
                console.log("[Mass image downloader]: ❌ Error checking cached log level:", levelError.message);
                console.log("[Mass image downloader]: ❌ Stacktrace: ", levelError.stack);
            }

        } catch (outerError) {
            console.log("[Mass image downloader]: ❌ Logging failed:", outerError.message);
            console.log

        }
    }

    /**
     * Displays a temporary user message on the page.
     * @param {string} text - The message text to display.
     * @param {"info"|"success"|"error"} type - The type of message, which affects styling and duration.
     * @returns {void}
     * @description This function creates a temporary message element on the page to provide feedback to the user.
     * It checks if user feedback messages are enabled in the configuration before displaying the message.
     * The message is styled based on the type (info, success, error) and automatically disappears after a certain duration.
     * It also implements a "last toast wins" behavior to ensure that messages do not overlap and that the most recent message is shown.
     * This function is useful for providing feedback to the user about the success or failure of operations, especially those triggered by keyboard shortcuts.
     * It enhances the user experience by giving immediate visual feedback without relying on console logs or alerts.
     */
    function showUserMessage(text, type = "info") {
        try {

            // ✅ Check if the user has enabled user feedback messages
            if (!showUserFeedbackMessagesCache) {
                logDebug(2, "🛑 User feedback messages are disabled. Skipping message display.");
                return;
            }

            if (!text || typeof text !== "string") return;

            // ✅ Minimum visible time (configurable): reuse global setting.
            const TOAST_MIN_GAP_MS = Math.max(0, parseInt(toastMinVisibleMsCache ?? 2000, 10) || 2000);

            // ✅ "Last toast wins" state (global per page)
            const state = window.__mdiToastState || (window.__mdiToastState = {
                lastShownAt: 0,
                pending: null,
                pendingTimer: null,
                hideTimer: null
            });

            // Always overwrite pending with the latest request
            state.pending = { text, type };

            // If a pending timer exists, cancel it (last wins)
            if (state.pendingTimer) {
                clearTimeout(state.pendingTimer);
                state.pendingTimer = null;
            }

            const now = Date.now();
            const elapsed = now - (state.lastShownAt || 0);
            const waitMs = Math.max(0, TOAST_MIN_GAP_MS - elapsed);

            state.pendingTimer = setTimeout(() => {
                try {
                    const next = state.pending;
                    state.pending = null;

                    if (!next || !next.text) return;

                    // Remove previous toast (no overlap)
                    const existing = document.getElementById("__mdi_user_toast");
                    if (existing) existing.remove();

                    // Cancel previous hide timer
                    if (state.hideTimer) {
                        clearTimeout(state.hideTimer);
                        state.hideTimer = null;
                    }

                    logDebug(2, `🗨️ Showing user message: [${next.type}] ${next.text}`);

                    const duration = next.type === "error" ? 10000 : 5000;
                    const backgroundColor = next.type === "error" ? "#d9534f" : "#007EE3";

                    const msg = document.createElement("div");
                    msg.id = "__mdi_user_toast";
                    const finalText = (typeof next.text === "string" && next.text.trim().startsWith("MID:"))
                        ? next.text.trim()
                        : `MID: ${next.text}`;
                    msg.textContent = finalText;
                    msg.style.position = "fixed";
                    msg.style.top = "20px";
                    msg.style.right = "20px";
                    msg.style.backgroundColor = backgroundColor;
                    msg.style.color = "#fff";
                    msg.style.padding = "10px";
                    msg.style.borderRadius = "5px";
                    msg.style.zIndex = "9999";
                    msg.style.fontSize = "14px";
                    msg.style.boxShadow = "2px 2px 6px rgba(0,0,0,0.3)";
                    msg.style.transition = "opacity 0.4s ease-in-out";
                    msg.style.opacity = "1";

                    document.body.appendChild(msg);

                    // Mark shown timestamp (for the min-gap rule)
                    state.lastShownAt = Date.now();

                    state.hideTimer = setTimeout(() => {
                        msg.style.opacity = "0";
                        setTimeout(() => {
                            try { msg.remove(); } catch (_) {}
                        }, 400);
                    }, duration);

                } catch (innerErr) {
                    logDebug(1, "❌ showUserMessage (render) failed:", innerErr.message);
                    logDebug(2, "🐛 Stacktrace:", innerErr.stack);
                }
            }, waitMs);

        } catch (err) {
            logDebug(1, "❌ Failed to show user message:", err.message);
            logDebug(2, "🐛 Stacktrace:", err.stack);
        }
    }

    /**
     * Receives toast requests from background.js and displays them in-page.
     * MV3 service workers have no DOM, so user feedback must be rendered from a content script.
     */
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (!message || typeof message !== "object") return;
            if (message.action !== "mdiUserToast") return;

            const text = (typeof message.text === "string") ? message.text : "";
            const type = (typeof message.type === "string") ? message.type : "info";

            if (!text) {
                try { sendResponse({ ok: false, reason: "empty_text" }); } catch (_) {}
                return;
            }

            showUserMessage(text, type);

            // ✅ Reply immediately to avoid MV3 "message port closed" warnings.
            try { sendResponse({ ok: true }); } catch (_) {}
            return;
        } catch (err) {
            logDebug(1, "❌ mdiUserToast handler failed:", err.message);
            logDebug(2, "🐛 Stacktrace:", err.stack);

            try { sendResponse({ ok: false, error: err.message }); } catch (_) {}
            return;
        }
    });

    
    /**
     * Removes invalid characters from filename components.
     * @param {string} text - Raw input for prefix/suffix.
     * @param {number} maxLen - Max length allowed (30 for prefix, 15 for suffix).
     * @returns {string} - Sanitized and trimmed text.
     */
    function sanitizeFilenameComponent(text, maxLen = 30) {
        try {
            let clean = text.trim().replace(/[^a-zA-Z0-9 ]/g, '');
            return clean.length > maxLen ? clean.slice(0, maxLen) : clean;
        } catch (err) {
            logDebug(1, `❌ Error sanitizing filename component: ${err.message}`);
            return '';
        }
    }

    /**
     * Sanitizes clipboard text and stores as prefix or suffix.
     * @param {string} rawText 
     * @param {string} type - "prefix" or "suffix"
     */
    function saveClipboardAs(type, rawText) {
        try {

            const maxLen = type === 'prefix' ? 30 : 15;
            const sanitized = sanitizeFilenameComponent(rawText, maxLen);

            if (sanitized.length < 4) {
                showUserMessage(`❌ ${type.charAt(0).toUpperCase() + type.slice(1)} too short. Minimum 4 characters.`, 'error');
                return;
            }

            // 🔍 Validate filenameMode from cached config
            const mode = filenameModeCache;
            const isPrefixAllowed = (type === "prefix" && (mode === "prefix" || mode === "both"));
            const isSuffixAllowed = (type === "suffix" && (mode === "suffix" || mode === "both"));

            logDebug(2, `📄 Filename mode is '${mode}'. Prefix allowed: ${isPrefixAllowed}, Suffix allowed: ${isSuffixAllowed}`);

            if (!(isPrefixAllowed || isSuffixAllowed)) {
                logDebug(1, `⚠️ Attempted to set ${type} while filenameMode is '${mode}'. Operation ignored.`);
                showUserMessage(`⚠️ Enable ${type} mode in settings first.`, 'info');
                return;
            }

            const update = {};
            update[type] = sanitized;
            // ✅ Check if the prefix/suffix is already set to the same value
            try {
                if (!chrome?.storage?.sync || !chrome?.runtime) {
                    throw new Error("Chrome storage API or runtime is unavailable.");
                }

                chrome.storage.sync.set(update, () => {
                    queueMicrotask(() => {
                        try {
                            if (chrome.runtime.lastError) {
                                throw new Error(chrome.runtime.lastError.message);
                            }

                            logDebug(1, `✅ ${type} saved:`, sanitized);
                            showUserMessage(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} set to: ${sanitized}`, 'success');
                        } catch (callbackErr) {
                            logDebug(1, `❌ Failed to save ${type}:`, callbackErr.message);
                            showUserMessage(`❌ Failed to save ${type}.`, 'error');
                        }
                    });
                });
            } catch (outerErr) {
                logDebug(1, `❌ Exception saving ${type}:`, outerErr.message);
                logDebug(2, `❌ Stacktrace saving ${type}: `, outerErr.stack);
                showUserMessage(`❌ Error saving ${type}. Context may be invalid.`, 'error');
            }
        } catch (err) {
            logDebug(1, `❌ Exception saving ${type}:`, err.message);
            logDebug(2, `❌ Stacktrace saving ${type}: `, err.stack);
        }
    }

    /**
     * Handles clipboard read and dispatches to save logic.
     * @param {"prefix"|"suffix"} type 
     * @returns {Promise<void>}
     * @description This function reads text from the clipboard and saves it as a prefix or suffix.
     * It uses the Clipboard API to read text and handles errors gracefully.
     * It also checks for permissions and shows user feedback messages.
     * This function is useful for allowing users to set prefixes or suffixes for image downloads using clipboard text.
     * It is triggered by keyboard shortcuts (Ctrl+Shift+P/S).
     */
    async function handleClipboardAssign(type) {
        try {
            // ✅ Check if the Clipboard API is available and the document is ready
            // This is important because the Clipboard API is not available in all contexts (e.g., background scripts).
            // The document.readyState check ensures that the document is fully loaded before accessing the clipboard.
            // If the Clipboard API is not available or the document is not ready, we show an error message to the user.
            if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function' ||
                (document.readyState !== 'interactive' && document.readyState !== 'complete')) {
                logDebug(1, '❌ Clipboard API not available or document not ready.');
                logDebug(3, `📄 Document readyState: ${document.readyState}`);
            
                // Show a user-friendly message indicating the issue
                // This is important because the Clipboard API is not available in all contexts (e.g., background scripts).
                const reason = (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function')
                    ? 'Clipboard API not supported in this context.'
                    : 'Clipboard not accessible. Site may restrict clipboard API.';
            
                showUserMessage(`❌ Clipboard read failed: ${reason}`, 'error');
                return;
            }
            
    
            // ✅ Check if the user has granted permission to read the clipboard
            // This is important because the Clipboard API requires user permission to read the clipboard.
            // The permissions.query method checks if the user has granted permission to read the clipboard.
            // If the permission is denied, we show an error message to the user.
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' });
    
                // If the permission is denied, we show an error message to the user.
                // This is important because the Clipboard API requires user permission to read the clipboard.
                // If the permission is granted, we proceed to read the clipboard.
                // If the permission is prompt, we show a message to the user to grant permission.
                if (permissionStatus.state === 'denied') {
                    logDebug(1, '⛔ Clipboard access denied by browser or site permissions.');
                    showUserMessage('❌ Clipboard access is denied by the site.', 'error');
                    return;
                }
            } catch (permError) {
                logDebug(2, `⚠️ Could not query clipboard permissions: ${permError.message}`);
                // If the permission fails, we continue as usual for compatibility.
            }
    
            let text = '';
            try {
                text = await navigator.clipboard.readText();
            } catch (readError) {
                logDebug(1, `❌ Clipboard read failed: ${readError.message}`);
                logDebug(2, `❌ Stacktrace: ${readError.stack}`)
                showUserMessage('❌ Clipboard access failed or was interrupted.', 'error');
                return;
            }
            if (!text || typeof text !== 'string') {
                showUserMessage('❌ Clipboard is empty or inaccessible.', 'error');
                return;
            }
    
            saveClipboardAs(type, text);
        } catch (err) {
            logDebug(1, `❌ Clipboard read failed: ${err.message}`);
            logDebug(2, '❌ Stacktrace: ', err.stack)
            showUserMessage('❌ Could not access clipboard.', 'error');
        }
    }
    

    /**
     * Keydown listener to detect Ctrl+Shift+P/S and dispatch.
     */
    window.addEventListener('keydown', (event) => {
        if (!event.ctrlKey || !event.altKey) return;
        if (event.code !== 'KeyP' && event.code !== 'KeyS') return;

        // ✅ Check if feature is enabled by user
        try {
            if (typeof enableClipboardHotkeysCache === 'undefined') {
                logDebug(1, '❌ Clipboard hotkeys config not yet initialized.');
                return;
            }

            if (!enableClipboardHotkeysCache) return;

            event.preventDefault();
            const actionType = event.code === 'KeyP' ? 'prefix' : 'suffix';
            logDebug(2, `🧩 Clipboard hotkey triggered: ${actionType.toUpperCase()}`);
            handleClipboardAssign(actionType);

        } catch (err) {
            logDebug(1, '❌ Error checking clipboard hotkeys feature:', err.message);
            logDebug(2, '❌ Stacktrace: ', err.stack);
        }

    });

    /**
     * Keydown listener to detect Alt+Shift+W (Web-linked galleries).
     * This is NOT a chrome.commands hotkey due to MV3 command limits.
     */
    window.addEventListener('keydown', (event) => {
        try {
            // Ignore hotkeys while typing
            const target = event.target;
            const isTypingContext =
                target &&
                (target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable);

            if (isTypingContext) return;

            // Alt + Shift + W
            if (!event.altKey || !event.shiftKey) return;
            if (event.code !== "KeyW") return;

            event.preventDefault();
            event.stopPropagation();

            logDebug(1, "⌨️ Hotkey triggered: Extract Web-linked galleries (Alt+Shift+W)");

            // 🔍 Dispatch message to background to inject extractor
            chrome.runtime.sendMessage(
                { action: "injectWebLinkedGalleryExtractor", source: "hotkey" },
                () => {
                    // Silent by design; extractor + background handle UX.
                }
            );
        } catch (err) {
            logDebug(1, `❌ Hotkey handler failed (Alt+Shift+W): ${err.message}`);
        }
    });

})();    