// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// utils.js - Utility functions for Mass Image Downloader

    const configCache = {
        debugLogLevel: 1,
        showUserFeedbackMessages: true,
        allowJPG: true,
        allowJPEG: true,
        allowPNG: true,
        allowWEBP: true,
        allowAVIF: false, // Default to false for compatibility
        allowBMP: false, // Default to false for compatibility
        filenameMode: "none",
        prefix: "",
        suffix: ""
    };

    async function initConfigCache() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([
                "debugLogLevel", "showUserFeedbackMessages",
                "allowJPG", "allowJPEG", "allowPNG", "allowWEBP", "allowAVIF", "allowBMP", 
                "filenameMode", "prefix", "suffix", "downloadFolder", "customFolderPath",
                "allowExtendedImageUrls" // 🖼️ Allow extended image URLs (e.g., Twitter/X :large, :orig)
            ], (data) => {
                configCache.debugLogLevel = parseInt(data.debugLogLevel ?? 1);
                configCache.showUserFeedbackMessages = data.showUserFeedbackMessages ?? true;
                configCache.allowJPG = data.allowJPG !== false;
                configCache.allowJPEG = data.allowJPEG !== false;
                configCache.allowPNG = data.allowPNG !== false;
                configCache.allowWEBP = data.allowWEBP !== false;
                configCache.allowAVIF = data.allowAVIF !== false;
                configCache.allowBMP = data.allowBMP !== false;
                configCache.allowExtendedImageUrls = data.allowExtendedImageUrls !== false; // 🖼️ Allow extended image URLs (e.g., Twitter/X :large, :orig)
                configCache.filenameMode = data.filenameMode ?? "none";
                configCache.prefix = data.prefix ?? "";
                configCache.suffix = data.suffix ?? "";
                configCache.downloadFolder = data.downloadFolder ?? "default";
                configCache.customFolderPath = data.customFolderPath ?? "";
                resolve();
            });
        });
    }
    
    // 🧠 Track closed tabs to prevent double-closure
    const closedTabs = new Set();

    logDebug(1, '⚡ Utility script loaded.');

    // 🧠 Listen to live updates to keep configCache in sync with changes from clipboardHotkeys.js
    if (chrome?.storage?.onChanged) {
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.prefix) {
                configCache.prefix = changes.prefix.newValue ?? '';
                logDebug(2, `🔄 Prefix updated in cache: "${configCache.prefix}"`);
            }
            if (changes.suffix) {
                configCache.suffix = changes.suffix.newValue ?? '';
                logDebug(2, `🔄 Suffix updated in cache: "${configCache.suffix}"`);
            }

            if (changes.filenameMode) {
                // 🛠️ Patch: sync filenameMode so generateFilename sees new mode immediately
                configCache.filenameMode = changes.filenameMode.newValue ?? 'none';
                logDebug(2, `🔄 Filename mode updated in cache: "${configCache.filenameMode}"`);
            }

            if (changes.debugLogLevel) {
                const oldLevel = configCache.debugLogLevel;
                configCache.debugLogLevel = parseInt(changes.debugLogLevel.newValue ?? 1);
                logDebug(1, `🪵 Debug level changed: ${oldLevel} → ${configCache.debugLogLevel}`);
            }
        });
    }

    /**
     * Logs debug messages based on user-defined log level.
     *  @param {number|string} levelOfLog - Log level (0-3) or message string. 
     * Where 0: no log. 1: basic, 2: verbose, 3: detailed.
     * @param {...any} args - Additional arguments for message formatting.
     * @returns {void}
     * @description This function checks the user's debug log level and logs messages accordingly.
     * It retrieves the log level from chrome.storage.sync and compares it with the provided level.
     * If the user's level is greater than or equal to the provided level, it logs the message.
     * It also handles legacy or malformed calls by assuming a default log level of 1.     * 
     */
    function logDebug(levelOfLog, ...args) {
        try {
            let debugLogLevelCache =  configCache.debugLogLevel;
            let level = 1;
            let messageArgs = [];
            if (typeof levelOfLog === "number" && levelOfLog >= 1 && levelOfLog <= 3) {
                level = levelOfLog;
                messageArgs = args;
            } else {
                // Handle legacy or malformed calls (assume default log level 1)
                level = 1;
                messageArgs = [levelOfLog, ...args].filter(arg => arg !== undefined);
            }

            try {
                if (level <= debugLogLevelCache) {
                    console.log("[Mass image downloader]:", ...messageArgs);
                }
            } catch (levelError) {
                console.log("[Mass image downloader]: ❌ Error checking cached log level:", levelError.message);
            }

        } catch (outerError) {
            console.log("[Mass image downloader]: ❌ Logging failed:", outerError.message);
        }
    }

    // ✅ Unified image validation for direct download scenarios
    function isImageAllowed(url, img) {
        try {
            // 🔍 Check if URL is a direct image link
            if (!isDirectImageUrl(url)) {
            logDebug(2, `❌ Rejected: Not a direct image URL.`);
            return false;
            }

            // 🔍 Validate against allowed image formats
            if (!isAllowedImageFormat(url)) {
            logDebug(2, `❌ Rejected: Image format not allowed.`);
            return false;
            }

            // 🔍 AVIF restriction
            if (!configCache.allowAVIF && url.toLowerCase().endsWith('.avif')) {
            logDebug(2, `❌ Rejected: AVIF format disabled by user.`);
            return false;
            }

            // 🔍 WebP restriction
            if (!configCache.allowWEBP && url.toLowerCase().endsWith('.webp')) {
            logDebug(2, `❌ Rejected: WebP format disabled by user.`);
            return false;
            }

            // 🔍 Validate dimensions
            const width = img?.naturalWidth || 0;
            const height = img?.naturalHeight || 0;

            if (width < configCache.minWidth || height < configCache.minHeight) {
            logDebug(2, `❌ Rejected: Image too small (${width}x${height}).`);
            logDebug(2, `✅ Minimum dimensions: ${configCache.minWidth}x${configCache.minHeight}`);
            return false;
            }

            // ✅ All checks passed
            return true;
        } catch (error) {
            logDebug(1, `🐛 Error in isImageAllowed: ${error.message}`);
            logDebug(3, `🐛 Stacktrace: ${error.stack}`);
            return false;
        }
    }


    /**
     * Updates the badge icon to reflect the current process status.
     * @param {number} count - Number of processed images.
     * @param {boolean} isComplete - True if the process is finished.
     * @returns {void}
     * @description This function updates the badge text and color based on the number of processed images.
     * If the count is 0 and isComplete is false, it hides the badge.
     * If isComplete is true, it sets the badge text to the total count and changes the color to blue.
     * If isComplete is false, it sets the badge text to the current count and changes the color to green.
     * It also logs the status to the console for debugging purposes.
     */
    function updateBadge(count, isComplete = false) {
        try {
            if (count === 0 && !isComplete) {
                chrome.action.setBadgeText({ text: '' });
                logDebug(2, "🧼 Process started, hiding badge initially.");
            } else {
                const text = count.toString();
                chrome.action.setBadgeText({ text });

                if (isComplete) {
                    logDebug(2, `🏁 Finished processing. Total images/url processed: ${text}`);
                    logDebug(3, '---------------------------');
                } else {
                    logDebug(3, `🔄 Processed so far: ${text}`);
                }

                const backgroundColor = isComplete ? '#1E90FF' : '#4CAF50';
                const textColor = '#FFFFFF';
                chrome.action.setBadgeBackgroundColor({ color: backgroundColor });

                if (backgroundColor === '#1E90FF') {
                    logDebug(3, `😎 Badge updated to color: 🔵`);
                } else {
                    logDebug(3, `👷 Badge updated to color: 🟢`);
                }

                chrome.action.setBadgeTextColor({ color: textColor });
                logDebug(3, '✅ Badge updated successfully.');
            }
        } catch (err) {
            logDebug(1, `❌ Failed to update badge: ${err.message}`);
        }
    }

    // 🟡 Sets the badge to indicate processing state
    /* Sets the badge text to '...' and background color to gold.
     * This indicates that the extension is currently processing images.
     * @returns {void}
     * @description This function is used to visually indicate that the extension is busy processing images.
     * It sets the badge text to '...' and changes the background color to gold.
     * It is typically called when the extension starts processing images or URLs.
    */
    function setBadgeProcessing() {
        try {
            // set badge text to '...' and text color to black 
            const textColor = '#000000'; 
            chrome.action.setBadgeText({ text: '...' });
            chrome.action.setBadgeTextColor({ color: textColor });

            // Set badge background color to gold
            // 🟡 Gold color for processing state
            chrome.action.setBadgeBackgroundColor({ color: '#FFD700' }); // Gold for processing
            logDebug(1, `⏳ Badge set to processing state (...) with color: 🟡`);
        } catch (err) {
            logDebug(1, `❌ Failed to set processing badge: ${err.message}`);
            logDebug(3, `❌ Stacktrace: ${err.stack}`);
        }
    }

    // 🔵 Sets the badge to indicate completion state
    /* Sets the badge text to 'Done' and background color to blue.
        * This indicates that the extension has finished processing images.
        * @returns {void}
        * @description This function is used to visually indicate that the extension has completed processing images or URLs.
        * It sets the badge text to 'Done' and changes the background color to blue.
        * It is typically called when the extension finishes processing all images or URLs.
    */ 
    function setBadgeFinished() {
        try {
            // set badge text to '...' and text color to black 
            const textColor = '#ffffff'; 
            chrome.action.setBadgeText({ text: 'Done' });
            chrome.action.setBadgeTextColor({ color: textColor });

            // Set badge background color to Blue (1E90FF)
            chrome.action.setBadgeBackgroundColor({ color: '#1E90FF' }); 
            logDebug(1, `🏁 Badge set to finished state (Done) with color: 🔵`);
        } catch (err) {
            logDebug(1, `❌ Failed to set processing badge: ${err.message}`);
            logDebug(3, `❌ Stacktrace: ${err.stack}`);
        }
    }

    // New helper: setBadgeError
    // Purpose: Show a clear "error" state on the extension badge (red background, white text).
    function setBadgeError() {
        try {
            if (!chrome || !chrome.action || typeof chrome.action.setBadgeText !== "function") {
                logDebug(1, "⚠️ setBadgeError - chrome.action is not available.");
                return;
            }

            // Set red background
            chrome.action.setBadgeBackgroundColor({ color: "#FF0000" }, () => {
                if (chrome.runtime.lastError) {
                    logDebug(1, `⚠️ setBadgeError backgroundColor error: ${chrome.runtime.lastError.message}`);
                }
            });

            // Short "Err" label with white text
            chrome.action.setBadgeText({ text: "Err" }, () => {
                if (chrome.runtime.lastError) {
                    logDebug(1, `⚠️ setBadgeError text error: ${chrome.runtime.lastError.message}`);
                }
            });
        } catch (err) {
            logDebug(1, `❌ setBadgeError unexpected error: ${err.message}`);
        }
    }

    /**
     * Closes a tab safely, avoiding duplicate closure attempts.
     * @param {number} tabId - The ID of the tab to close.
     * @param {function} callback - Function to execute after closure.
     * @returns {void}
     * @description This function checks if the tab is already closed using a Set to track closed tabs.
     * If the tab is already closed, it skips the closure and calls the callback function.
     * If the tab is still open, it attempts to close it and adds the tab ID to the Set.
     * It also handles errors and logs the status to the console for debugging purposes.
     */
    function closeTabSafely(tabId, callback) {
        if (closedTabs.has(tabId)) {
            logDebug(2, `🟡 Tab ID ${tabId} is already closed. Skipping.`);
            if (typeof callback === 'function') callback();
            return;
        }
    
        chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError) {
                logDebug(1, `📛 Tab ID ${tabId} no longer exists.`);
                if (typeof callback === 'function') callback();
                return;
            }
    
            chrome.tabs.remove(tabId, () => {
                if (chrome.runtime.lastError) {
                    logDebug(1,`❌ Failed to close tab ${tabId}: ${chrome.runtime.lastError.message}`);
                } else {
                    logDebug(2, `💥 Tab ID ${tabId} closed successfully.`);
                    closedTabs.add(tabId);
                }
                if (typeof callback === 'function') callback();
            });
        });
    }

    /**
     * // Currently unused
     * Returns the next tab in the window after the current one.
     * @param {number} currentTabIndex - The index of the current tab.
     * @param {array} tabs - Array of all tabs in the current window.
     * @returns {object|null} - The next tab or null if none found.
     * @description This function iterates through the array of tabs and returns the first tab with an index greater than the current tab index.
     * If no such tab is found, it returns null.
     */
    function moveToNextTab(currentTabIndex, tabs) {
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].index > currentTabIndex) {
                return tabs[i];
            }
        }
        return null;
    }

    /**
     * Calculates the similarity between two URL paths.
     * Used for grouping gallery images with common patterns.
     * @param {string} url1 - First image URL.
     * @param {string} url2 - Second image URL.
     * @returns {number} - Similarity percentage (0 to 100).
     * @description This function compares the path segments of two URLs and calculates the percentage of matching segments.
     * It splits the URLs into segments using '/' as a delimiter and counts the number of matching segments.
     * It returns the similarity percentage based on the total number of segments in the longer path.
     */
    function calculatePathSimilarity(url1, url2) {
        try {
            const path1 = new URL(url1).pathname.split('/');
            const path2 = new URL(url2).pathname.split('/');

            // Normalize paths by removing empty segments
            const minLen = Math.min(path1.length, path2.length);
            let matches = 0;
            // Count matching segments in the path
            for (let i = 0; i < minLen; i++) {
                if (path1[i] === path2[i]) matches++;
            }
            return (matches / Math.max(path1.length, path2.length)) * 100;
        } catch (err) {
            logDebug(1, `❌ Error calculating similarity: ${err.message}`);
            logDebug(3, `❌ Stacktrace: ${err.stack}`);
            return 0;
        }
    }

    // 🔍 Checks if a URL points directly to an image, considering user-defined formats.
    //        Trims any trailing slashes from the path before validation.
    async function isDirectImageUrl(url) {
        try {
            // 🛡️ Defensive check: URL must be a valid, non-empty string
            if (typeof url !== 'string' || url.trim() === '') {
                logDebug(2, `🚫 Invalid input: URL must be a non-empty string. Received: ${typeof url} → ${JSON.stringify(url)}`);
                return false;
            }

            let parsed;
            try {
                parsed = new URL(url);
            } catch (urlError) {
                logDebug(1, `⚠️ Failed to construct URL object: ${urlError.message}`);
                return false;
            }

            // Remove trailing slashes so "/photo.jpg/" passes validation
            let pathname = parsed.pathname.toLowerCase().replace(/\/+$/g, "");

            // ⛔ Reject if path is empty after trimming
            if (!pathname) {
                logDebug(2, `🚫 Invalid path (empty after trim): ${parsed.pathname}`);
                return false;
            }

            // ✅ Load allowed image extensions from user settings
            const allowedExts = [];
            if (configCache.allowJPG)  allowedExts.push('.jpg');
            if (configCache.allowJPEG) allowedExts.push('.jpeg');
            if (configCache.allowPNG)  allowedExts.push('.png');
            if (configCache.allowWEBP) allowedExts.push('.webp');
            if (configCache.allowAVIF) allowedExts.push('.avif');
            if (configCache.allowBMP)  allowedExts.push('.bmp');

            // 🔍 Extract the file name from the trimmed path
            const segments = pathname.split('/');
            const filename = segments.pop();
            if (!filename || !filename.includes('.')) {
                logDebug(2, `🚫 No valid filename found in path: ${pathname}`);
                return false;
            }

            /*
            // ✅ Validate extension against allowed formats
            const isValid = allowedExts.some(ext => filename.endsWith(ext));
            logDebug(3, `✨ "${filename}" ends with a valid image URL: ${isValid}`);

            return isValid;
            */

           let isValid = false;

           // 🔍 Check if extended image URLs are allowed
           if (configCache.allowExtendedImageUrls) {
               // Accept extensions with optional :suffix (e.g., .jpg:large, .png:orig)
               isValid = allowedExts.some(ext => {
                   // Allow up to 10 alphanumeric characters after a colon (e.g., :large, :orig, :small, etc.)
                   const pattern = new RegExp(`${ext}(:[a-zA-Z0-9]{2,10})?$`, 'i');
                   return pattern.test(filename);
               });
               logDebug(2, `🔎 Extended image URL support enabled. "${filename}" matches extended pattern: ${isValid}`);
           } else {
               // Strict extension check (must end with the extension)
               isValid = allowedExts.some(ext => filename.endsWith(ext));
               logDebug(3, `🔎 Extended image URL support disabled. "${filename}" ends with a valid extension: ${isValid}`);
           }

           return isValid;

        } catch (err) {
            logDebug(1, `⚠️ Error in isDirectImageUrl: ${err.message}`);
            return false;
        }
    }

    // 📂 Validate that folder is safe and relative
    function isValidRelativeFolder(folder) {
        const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
        if (!folder || typeof folder !== 'string') return false;
        if (folder.length > 64) return false;
        if (folder.startsWith('/') || folder.includes('..') || folder.endsWith('.') || folder.endsWith('/')) return false;
        return !invalidChars.test(folder.trim());
    }
    
    /**
     * Normalizes image URLs by removing known Twitter/X-style suffixes (e.g. :large, :orig) if allowed in settings.
     * @param {string} url - The original image URL.
     * @returns {string} - The normalized image URL.
     */
    function normalizeImageUrl(url) {
        try {
            const allowExtended = configCache.allowExtendedImageUrls ?? false;
            if (!allowExtended) return url;
            // Remove suffix (e.g., .jpg:large → .jpg)
            return url.replace(/(\.(jpe?g|jpeg|png|webp|bmp|avif))(:[a-zA-Z0-9]{2,10})$/i, '.$2');
        } catch (err) {
            logDebug(1, `❌ Error in normalizeImageUrl: ${err.message}`);
            return url;
        }
    }

    // 🧠 Generate final filename based on naming preferences (prefix, suffix, timestamp, etc.)
    // 🔒 This function does NOT handle folder paths. The caller must append them if needed.
    async function generateFilename(baseName, extension) {
        try {
            const { filenameMode, prefix, suffix } = configCache;
            let name = baseName;

            logDebug(3, `🧪 File name mode: ${filenameMode}`);
            logDebug(3, `📄 Original Name: ${baseName}`);

            switch (filenameMode) {
                case "prefix":
                    if (prefix && prefix.trim()) {
                        name = `${prefix}_${baseName}`;
                        logDebug(3, `🧼 Using Prefix`);
                    } else {
                        logDebug(2, `⚠️ Prefix mode selected but prefix is empty. Using base name.`);
                    }
                    break;

                case "suffix":
                    if (suffix && suffix.trim()) {
                        name = `${baseName}_${suffix}`;
                        logDebug(3, `🧼 Using Suffix`);
                    } else {
                        logDebug(2, `⚠️ Suffix mode selected but suffix is empty. Using base name.`);
                    }
                    break;

                case "both":
                    if (prefix && prefix.trim() && suffix && suffix.trim()) {
                        name = `${prefix}_${baseName}_${suffix}`;
                        logDebug(3, `🧼 Using Both`);
                    } else {
                        logDebug(2, `⚠️ Both mode selected but prefix or suffix empty. Using base name.`);
                    }
                    break;

                case "timestamp":
                    const timestamp = new Date()
                        .toISOString()
                        .replace(/[-T:.Z]/g, '')
                        .slice(2, 14);
                    name = `${baseName}_${timestamp}`;
                    logDebug(3, `🧼 Using TimeStamp`);
                    break;

                default:
                    logDebug(3, `🧼 Filename mode '${filenameMode}' or empty prefix/suffix. Using base name.`);
            }

            const finalName = `${name}${extension}`;
            logDebug(3, `✍🏻 Final name (no path): ${finalName}`);
            return finalName;

        } catch (err) {
            logDebug(1, `❌ Error generating filename: ${err.message}`);
            logDebug(3, '-----------------------------------------------');
            return `${baseName}${extension}`;
        }
    }

    /**
     * Removes invalid characters from filename components.
     * @param {string} text - Raw input for prefix/suffix.
     * @param {number} maxLen - Max length allowed (30 for prefix, 15 for suffix).
     * @returns {string} - Sanitized and trimmed text.
     */
    export function sanitizeFilenameComponent(text, maxLen = 30) {
        try {
            let clean = text.trim().replace(/[^a-zA-Z0-9 ]/g, '');
            return clean.length > maxLen ? clean.slice(0, maxLen) : clean;
        } catch (err) {
            logDebug(1, `❌ Error sanitizing filename component: ${err.message}`);
            return '';
        }
    }

    /**
     * Displays a styled feedback message to the user if enabled in settings.
     * - 5 seconds for success/progress messages.
     * - 10 seconds for error messages.
     * - Only visible if "showUserFeedbackMessages" setting is enabled.
     * @param {string} text - The message text to display.
     * @param {string} type - Type of message ("info", "success", "error").
     * @returns {void}
     * @description This function creates a styled message element and appends it to the document body.
     */
    function showUserMessage(text, type = "info") {
        try {
            if (!configCache.showUserFeedbackMessages) {
                logDebug(2, `🚫 User feedback messages disabled. Skipping display.`);
                return;
            }

            const duration = (type === "error") ? 10000 : 5000;
            const backgroundColor = (type === "error") ? "#d9534f" : "#007EE3";

            const messageElement = document.createElement("div");
            messageElement.textContent = "Mass image downloader: " + text;
            messageElement.style.position = "fixed";
            messageElement.style.top = "20px";
            messageElement.style.right = "20px";
            messageElement.style.backgroundColor = backgroundColor;
            messageElement.style.color = "#FFFFFF";
            messageElement.style.padding = "12px";
            messageElement.style.borderRadius = "6px";
            messageElement.style.fontSize = "14px";
            messageElement.style.boxShadow = "2px 2px 8px rgba(0, 0, 0, 0.3)";
            messageElement.style.opacity = "1";
            messageElement.style.transition = "opacity 0.5s ease-in-out";
            messageElement.style.zIndex = "9999";
            document.body.appendChild(messageElement);

            logDebug(3, `📢 Showing user message: "${text}" (${type})`);

            setTimeout(() => {
                messageElement.style.opacity = "0";
                setTimeout(() => {
                    try {
                        messageElement.remove();
                    } catch (removeError) {
                        logDebug(1, `⚠️ Error removing message element: ${removeError.message}`);
                    }
                }, 500);
            }, duration);

        } catch (error) {
            logDebug(1, `❌ Error displaying user message: ${error.message}`);
            logDebug(3, `❌ Stacktrace: ${error.stack}`);
        }
    }

    /**
     * Checks if the given URL has an allowed image format based on user settings.
     * Trims any trailing slashes before validation.
     */
    async function isAllowedImageFormat(url) {
        try {
            const parsed = new URL(url);
            // Remove trailing slashes so "/photo.png/" passes validation
            const pathname = parsed.pathname.toLowerCase().replace(/\/+$/g, "");

            const allowedExts = [];
            if (configCache.allowJPG)  allowedExts.push('.jpg');
            if (configCache.allowJPEG) allowedExts.push('.jpeg');
            if (configCache.allowPNG)  allowedExts.push('.png');
            if (configCache.allowWEBP) allowedExts.push('.webp');
            if (configCache.allowAVIF) allowedExts.push('.avif');
            if (configCache.allowBMP)  allowedExts.push('.bmp');

            const isValid = allowedExts.some(ext => pathname.endsWith(ext));
            if (isValid) {
                logDebug(2, `✅ "${pathname.split('/').pop()}" accepted by allowed image formats.`);
            } else {
                logDebug(2, `⛔ "${pathname.split('/').pop()}" not allowed by image formats.`);
            }
            return isValid;
        } catch (err) {
            logDebug(1, `❌ Error in isAllowedImageFormat: ${err.message}`);
            return false;
        }
    }

    // Export shared utility functions
    export {
        closeTabSafely,
        logDebug,
        updateBadge,
        setBadgeProcessing,
        setBadgeFinished,
        calculatePathSimilarity,
        generateFilename,
        normalizeImageUrl,
        isDirectImageUrl,
        isAllowedImageFormat,
        showUserMessage,
        initConfigCache,
        setBadgeError
    };
    