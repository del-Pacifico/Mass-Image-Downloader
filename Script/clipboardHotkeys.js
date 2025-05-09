 
// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/sergiopalmah/Mass-Image-Downloader
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
    let enableClipboardHotkeysCache = false;

    async function initConfig() {
        return new Promise((resolve) => {
            if (!chrome.storage || !chrome.storage.sync) {
                logDebug(1, "❌ chrome.storage.sync is not available in this context.");
                return resolve();
            }

            chrome.storage.sync.get(
                ["debugLogLevel", "showUserFeedbackMessages", "enableClipboardHotkeys"],
                (data) => {
                    try {
                        debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
                        showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;
                        enableClipboardHotkeysCache = data.enableClipboardHotkeys ?? false;
                    } catch (err) {
                        logDebug(1, "❌ Failed to assign config values:", err.message);
                    }
                    resolve();
                }
            );
        });
    }

    await initConfig();

    if (!chrome.storage || !chrome.storage.sync) {
        logDebug(1, "❌ chrome.storage.sync is not available in this context.");
        return resolve(); // continuar sin romper ejecución
    }

    chrome.storage.sync.get(
        ["debugLogLevel", "showUserFeedbackMessages", "enableClipboardHotkeys"],
        (data) => {
            debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
            showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;
            enableClipboardHotkeysCache = data.enableClipboardHotkeys ?? false;
            resolve();
        }
    );
    
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
     * Shows a visual message to the user.
     * @param {string} text 
     * @param {string} type - "info", "success", "error"
     */
    function showUserMessage(text, type = 'info') {
        try {
            
            // ✅ Check if the user has enabled user feedback messages
            if (!showUserFeedbackMessagesCache) {
                logDebug(2, '🛑 User feedback messages are disabled. Skipping message display.');
                return;
            }
                
            logDebug(2, `🗨️ Showing user message: [${type}] ${text}`);

            const duration = type === 'error' ? 10000 : 5000;
            const backgroundColor = type === 'error' ? '#d9534f' : '#007EE3';

            const msg = document.createElement('div');
            msg.textContent = text;
            msg.style.position = 'fixed';
            msg.style.top = '20px';
            msg.style.right = '20px';
            msg.style.backgroundColor = backgroundColor;
            msg.style.color = '#fff';
            msg.style.padding = '10px';
            msg.style.borderRadius = '5px';
            msg.style.zIndex = '9999';
            msg.style.fontSize = '14px';
            msg.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.3)';
            msg.style.transition = 'opacity 0.4s ease-in-out';
            msg.style.opacity = '1';
            document.body.appendChild(msg);

            setTimeout(() => {
                msg.style.opacity = '0';
                setTimeout(() => msg.remove(), 400);
            }, duration);

        } catch (err) {
            logDebug(1, '❌ Failed to show user message:', err.message);
            logDebug(2, '❌ Stacktrace:', err.stack);
        }
    }

    /**
     * Sanitizes clipboard text and stores as prefix or suffix.
     * @param {string} rawText 
     * @param {string} type - "prefix" or "suffix"
     */
    function saveClipboardAs(type, rawText) {
        try {
            let sanitized = rawText.trim().replace(/[^a-zA-Z0-9 ]/g, '');

            if (sanitized.length < 4) {
                showUserMessage(`❌ ${type.charAt(0).toUpperCase() + type.slice(1)} too short. Minimum 4 characters.`, 'error');
                return;
            }

            const maxLen = type === 'prefix' ? 30 : 15;
            if (sanitized.length > maxLen) sanitized = sanitized.slice(0, maxLen);

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
})();    
