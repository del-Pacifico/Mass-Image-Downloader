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
        // ⏱️ Minimum time a toast stays visible before it can be replaced.
        // Range: 0..10000, Default: 2000
        toastMinVisibleMs: 2000,
        allowJPG: true,
        allowJPEG: true,
        allowPNG: true,
        allowWEBP: true,
        allowAVIF: false, // Default to false for compatibility
        allowBMP: false, // Default to false for compatibility
        allowTwitterXQueryParams: false,
        allowRedditCdnQueryParams: false,
        allowParameterizedCdnUrls: false,
        allowWrappedImageUrls: false,
        allowExtendedImageUrls: false, // Legacy compatibility flag, derived from the granular extended URL settings
        minWidth: 800,
        minHeight: 600,
        filenameMode: "none",
        prefix: "",
        suffix: ""
    };

    async function initConfigCache() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([
                "debugLogLevel", "showUserFeedbackMessages", "toastMinVisibleMs",
                "minWidth", "minHeight",
                "allowJPG", "allowJPEG", "allowPNG", "allowWEBP", "allowAVIF", "allowBMP", 
                "filenameMode", "prefix", "suffix", "downloadFolder", "customFolderPath",
                "allowTwitterXQueryParams",
                "allowRedditCdnQueryParams",
                "allowParameterizedCdnUrls",
                "allowWrappedImageUrls",
                "allowExtendedImageUrls" // Legacy compatibility flag for older saved settings
            ], (data) => {
                configCache.debugLogLevel = parseInt(data.debugLogLevel ?? 1);
                configCache.showUserFeedbackMessages = data.showUserFeedbackMessages ?? true;
                const rawToastMinVisibleMs = parseInt(data.toastMinVisibleMs ?? 2000, 10);
                configCache.toastMinVisibleMs = (!isNaN(rawToastMinVisibleMs) && rawToastMinVisibleMs >= 0 && rawToastMinVisibleMs <= 10000)
                    ? rawToastMinVisibleMs
                    : 2000;
                configCache.allowJPG = data.allowJPG !== false;
                configCache.allowJPEG = data.allowJPEG !== false;
                configCache.allowPNG = data.allowPNG !== false;
                configCache.allowWEBP = data.allowWEBP !== false;
                configCache.allowAVIF = data.allowAVIF !== false;
                configCache.allowBMP = data.allowBMP !== false;
                const hasGranularExtendedFlags = [
                    "allowTwitterXQueryParams",
                    "allowRedditCdnQueryParams",
                    "allowParameterizedCdnUrls",
                    "allowWrappedImageUrls"
                ].some((key) => Object.prototype.hasOwnProperty.call(data, key));
                const legacyExtendedUrlsEnabled = data.allowExtendedImageUrls === true;

                configCache.allowTwitterXQueryParams = hasGranularExtendedFlags
                    ? data.allowTwitterXQueryParams === true
                    : legacyExtendedUrlsEnabled;
                configCache.allowRedditCdnQueryParams = hasGranularExtendedFlags
                    ? data.allowRedditCdnQueryParams === true
                    : legacyExtendedUrlsEnabled;
                configCache.allowParameterizedCdnUrls = hasGranularExtendedFlags
                    ? data.allowParameterizedCdnUrls === true
                    : legacyExtendedUrlsEnabled;
                configCache.allowWrappedImageUrls = hasGranularExtendedFlags
                    ? data.allowWrappedImageUrls === true
                    : legacyExtendedUrlsEnabled;
                configCache.allowExtendedImageUrls = hasGranularExtendedFlags
                    ? [
                        configCache.allowTwitterXQueryParams,
                        configCache.allowRedditCdnQueryParams,
                        configCache.allowParameterizedCdnUrls,
                        configCache.allowWrappedImageUrls
                    ].some(Boolean)
                    : legacyExtendedUrlsEnabled; // Backward-compatible derived flag
                configCache.filenameMode = data.filenameMode ?? "none";
                configCache.prefix = data.prefix ?? "";
                configCache.suffix = data.suffix ?? "";
                configCache.downloadFolder = data.downloadFolder ?? "default";
                configCache.customFolderPath = data.customFolderPath ?? "";
                configCache.minWidth = parseInt(data.minWidth ?? 800);
                configCache.minHeight = parseInt(data.minHeight ?? 600);
                resolve();
            });
        });
    }

    const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".bmp"];

    const EXTENDED_IMAGE_URL_FLAG_KEYS = [
        "allowTwitterXQueryParams",
        "allowRedditCdnQueryParams",
        "allowParameterizedCdnUrls",
        "allowWrappedImageUrls"
    ];

    function escapeRegex(text) {
        return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function getAllowedImageExtensions() {
        const enabledExtensions = [];
        if (configCache.allowJPG) enabledExtensions.push(".jpg");
        if (configCache.allowJPEG) enabledExtensions.push(".jpeg");
        if (configCache.allowPNG) enabledExtensions.push(".png");
        if (configCache.allowWEBP) enabledExtensions.push(".webp");
        if (configCache.allowAVIF) enabledExtensions.push(".avif");
        if (configCache.allowBMP) enabledExtensions.push(".bmp");
        return enabledExtensions;
    }

    function hasEnabledExtendedImageUrlSupport() {
        return EXTENDED_IMAGE_URL_FLAG_KEYS.some((key) => configCache[key] === true);
    }

    function getSupportedImageExtensionPattern() {
        return SUPPORTED_IMAGE_EXTENSIONS
            .map((extension) => escapeRegex(extension.slice(1)))
            .join("|");
    }

    function isSupportedImageExtension(extension) {
        if (typeof extension !== "string" || !extension.trim()) {
            return false;
        }

        const normalizedExtension = extension.trim().toLowerCase();
        return SUPPORTED_IMAGE_EXTENSIONS.some((item) => item.toLowerCase() === normalizedExtension);
    }

    function syncExtendedImageUrlFlagsFromStorageChanges(changes) {
        const hasGranularChange = EXTENDED_IMAGE_URL_FLAG_KEYS.some((key) => changes[key]);
        const legacyChange = changes.allowExtendedImageUrls;

        if (hasGranularChange) {
            EXTENDED_IMAGE_URL_FLAG_KEYS.forEach((key) => {
                if (changes[key]) {
                    configCache[key] = changes[key].newValue === true;
                }
            });
            configCache.allowExtendedImageUrls = EXTENDED_IMAGE_URL_FLAG_KEYS.some((key) => configCache[key] === true);
            logDebug(2, `🔄 Extended image URL support updated in cache: ${configCache.allowExtendedImageUrls}`);
            return;
        }

        if (legacyChange) {
            const legacyEnabled = legacyChange.newValue === true;
            EXTENDED_IMAGE_URL_FLAG_KEYS.forEach((key) => {
                configCache[key] = legacyEnabled;
            });
            configCache.allowExtendedImageUrls = legacyEnabled;
            logDebug(2, `🔄 Legacy extended image URL support updated in cache: ${configCache.allowExtendedImageUrls}`);
        }
    }

    // 🧠 Track closed tabs to prevent double-closure
    const closedTabs = new Set();

    logDebug(1, '⚡ Utility script loaded.');

    // 🧠 Listen to live updates to keep configCache in sync with changes from clipboardHotkeys.js
    if (typeof chrome !== "undefined" && chrome?.storage?.onChanged) {
        chrome.storage.onChanged.addListener((changes) => {
            
            // if prefix changed, update cache and log
            if (changes.prefix) {
                configCache.prefix = changes.prefix.newValue ?? '';
                logDebug(2, `🔄 Prefix updated in cache: "${configCache.prefix}"`);
            }

            // if suffix changed, update cache and log
            if (changes.suffix) {
                configCache.suffix = changes.suffix.newValue ?? '';
                logDebug(2, `🔄 Suffix updated in cache: "${configCache.suffix}"`);
            }

            // if filenameMode changed, update cache and log
            if (changes.filenameMode) {
                // 🛠️ Patch: sync filenameMode so generateFilename sees new mode immediately
                configCache.filenameMode = changes.filenameMode.newValue ?? 'none';
                logDebug(2, `🔄 Filename mode updated in cache: "${configCache.filenameMode}"`);
            }

            // if debugLogLevel changed, update cache and log
            if (changes.debugLogLevel) {
                const oldLevel = configCache.debugLogLevel;
                configCache.debugLogLevel = parseInt(changes.debugLogLevel.newValue ?? 1);
                logDebug(1, `🪵 Debug level changed: ${oldLevel} → ${configCache.debugLogLevel}`);
            }

            // if minWidth changed, update cache and log
            if (changes.minWidth) {
                const oldValue = configCache.minWidth;
                configCache.minWidth = parseInt(changes.minWidth.newValue ?? 800);
                logDebug(2, `🔄 Min width updated in cache: ${oldValue} → ${configCache.minWidth}`);
            }

            // if minHeight changed, update cache and log
            if (changes.minHeight) {
                const oldValue = configCache.minHeight;
                configCache.minHeight = parseInt(changes.minHeight.newValue ?? 600);
                logDebug(2, `🔄 Min height updated in cache: ${oldValue} → ${configCache.minHeight}`);
            }

            // if showUserFeedbackMessages changed, update cache and log
            if (changes.showUserFeedbackMessages) {
                const oldValue = configCache.showUserFeedbackMessages;
                configCache.showUserFeedbackMessages = changes.showUserFeedbackMessages.newValue ?? true;
                logDebug(2, `🔄 showUserFeedbackMessages updated in cache: ${oldValue} → ${configCache.showUserFeedbackMessages}`);
            }

            // if toastMinVisibleMs changed, update cache and log
            if (changes.toastMinVisibleMs) {
                const oldValue = configCache.toastMinVisibleMs;
                const raw = parseInt(changes.toastMinVisibleMs.newValue ?? 2000, 10);
                const safe = (!isNaN(raw) && raw >= 0 && raw <= 10000) ? raw : 2000;
                configCache.toastMinVisibleMs = safe;
                logDebug(2, `🔄 toastMinVisibleMs updated in cache: ${oldValue} → ${configCache.toastMinVisibleMs}`);
            }

            if (
                changes.allowTwitterXQueryParams ||
                changes.allowRedditCdnQueryParams ||
                changes.allowParameterizedCdnUrls ||
                changes.allowWrappedImageUrls ||
                changes.allowExtendedImageUrls
            ) {
                syncExtendedImageUrlFlagsFromStorageChanges(changes);
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

    function getImageUrlParts(url) {
        try {
            const parsed = new URL(url);
            const pathname = parsed.pathname.replace(/\/+$/g, "");
            const lastSegment = pathname.split("/").pop() || "image";
            const pathExtPattern = getSupportedImageExtensionPattern();
            const pathExtMatch = lastSegment.match(
                new RegExp(`^(.*?)(\\.(?:${pathExtPattern}))(:[a-zA-Z0-9]{2,10})?$`, "i")
            );
            const queryFormat = String(
                parsed.searchParams.get("format")
                || parsed.searchParams.get("ext")
                || parsed.searchParams.get("type")
                || ""
            ).trim().toLowerCase();

            let baseName = lastSegment;
            let extension = "";
            let hasExtendedSuffix = false;

            if (pathExtMatch) {
                baseName = pathExtMatch[1] || "image";
                extension = pathExtMatch[2].toLowerCase();
                hasExtendedSuffix = Boolean(pathExtMatch[4]);
            } else if (queryFormat) {
                const normalized = queryFormat.startsWith(".") ? queryFormat : `.${queryFormat}`;
                if (isSupportedImageExtension(normalized)) {
                    extension = normalized;
                }
            }

            return {
                pathname,
                lastSegment,
                baseName,
                extension,
                hasPathExtension: Boolean(pathExtMatch),
                hasExtendedSuffix
            };
        } catch (err) {
            logDebug(1, `❌ Error parsing image URL parts: ${err.message}`);
            return {
                pathname: "",
                lastSegment: "image",
                baseName: "image",
                extension: "",
                hasPathExtension: false,
                hasExtendedSuffix: false
            };
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

            const { pathname, lastSegment, extension, hasPathExtension, hasExtendedSuffix } = getImageUrlParts(url);
            const allowedExts = getAllowedImageExtensions();
            const allowedExtSet = new Set(allowedExts.map((ext) => ext.toLowerCase()));

            // ⛔ Reject if path is empty after trimming
            if (!pathname) {
                logDebug(2, `🚫 Invalid path (empty after trim): ${parsed.pathname}`);
                return false;
            }

           let isValid = false;

           if (hasPathExtension) {
               // Accept extensions with optional :suffix (e.g., .jpg:large, .png:orig)
               isValid = allowedExts.some((ext) => {
                   const escapedExt = escapeRegex(ext);
                   const pattern = hasExtendedSuffix && hasEnabledExtendedImageUrlSupport()
                       ? new RegExp(`${escapedExt}(:[a-zA-Z0-9]{2,10})?$`, "i")
                       : new RegExp(`${escapedExt}$`, "i");
                   return pattern.test(lastSegment);
               });
               logDebug(2, `🔎 Path-based image URL validation for "${lastSegment}": ${isValid}`);
           } else if (extension) {
               isValid = allowedExtSet.has(extension.toLowerCase());
               logDebug(2, `🔎 Query-based image URL validation for "${pathname}": ${isValid}`);
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
            const allowExtended = configCache.allowExtendedImageUrls ?? hasEnabledExtendedImageUrlSupport();
            if (!allowExtended) return url;
            // Remove suffix (e.g., .jpg:large → .jpg)
            const extensionPattern = getSupportedImageExtensionPattern();
            return url.replace(new RegExp(`(\\.(?:${extensionPattern}))(:[a-zA-Z0-9]{2,10})$`, "i"), "$1");
        } catch (err) {
            logDebug(1, `❌ Error in normalizeImageUrl: ${err.message}`);
            return url;
        }
    }

    /**
     * Extracts the file base name and extension from a URL path.
     * @param {string} url - Absolute URL pointing to the target image.
     * @returns {{ baseName: string, extension: string }}
     */
    function splitUrlFileName(url) {
        try {
            const { baseName, extension } = getImageUrlParts(url);
            return { baseName, extension };
        } catch (err) {
            logDebug(1, `❌ Error splitting URL file name: ${err.message}`);
            return { baseName: "image", extension: "" };
        }
    }

    /**
     * Builds a download path from an optional folder and a final file name.
     * @param {string} folderPath - Optional custom folder path.
     * @param {string} finalName - Final file name already generated.
     * @returns {string}
     */
    function buildDownloadPath(folderPath, finalName) {
        try {
            const safeFolder = (typeof folderPath === "string" && folderPath.trim())
                ? folderPath.trim().replace(/\\/g, "/").replace(/\/+$/, "")
                : "";

            return safeFolder ? `${safeFolder}/${finalName}` : finalName;
        } catch (err) {
            logDebug(1, `❌ Error building download path: ${err.message}`);
            return finalName;
        }
    }

    // 🧠 Generate final filename based on naming preferences (prefix, suffix, timestamp, etc.)
    // 🔒 This function does NOT handle folder paths. The caller must append them if needed.
    async function generateFilename(baseName, extension) {
        try {
            const { filenameMode, prefix, suffix } = configCache;
            let name = baseName;

            logDebug(3, '');
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
     * Displays a temporary toast message to the user.
     * @param {string} text - The message to display.
     * @param {string} type - The type of message ('info' or 'error') which determines styling and duration.
     * @returns {void}
     * @description This function creates a toast message element and appends it to the document body.
     * The message will automatically fade out and be removed after a certain duration (5 seconds for info, 10 seconds for error).
     * If multiple messages are triggered in quick succession, the previous message will be removed and its timer cleared to ensure only one message is visible at a time.
     * The function also checks user settings to determine if feedback messages should be shown and logs the display of messages for debugging purposes.
     */ 
    function showUserMessage(text, type = "info") {
        try {
            if (!configCache.showUserFeedbackMessages) {
                logDebug(2, `🚫 User feedback messages disabled. Skipping display.`);
                return;
            }

            // 🧠 Determine duration and styling based on message type
            const baseDuration = (type === "error") ? 10000 : 5000;
            const backgroundColor = (type === "error") ? "#d9534f" : "#007EE3";

            // ✅ Toast engine: last toast wins + optional minimum visible time (prevents fast overlap)
            const TOAST_ID = "mdi-user-toast";
            const TIMER_KEY = "__mdiUserToastTimer";
            const MINUNTIL_KEY = "__mdiUserToastMinUntil";
            const DEFER_KEY = "__mdiUserToastDeferTimer";
            const PENDING_KEY = "__mdiUserToastPending";

            // 🧠 Ensure minimum visible time is respected: if a toast is already visible and the new toast arrives, defer it until the current one has been visible for at least the minimum time. This prevents toasts from being replaced too quickly and ensures users have enough time to read messages.
            const minVisibleMs = Math.max(0, parseInt(configCache.toastMinVisibleMs ?? 2000, 10) || 2000);
            const effectiveDuration = Math.max(baseDuration, minVisibleMs);

            // ✅ If a toast is already visible and we must keep it for a minimum time,
            // defer the replacement and keep only the latest pending toast.
            try {
                const now = Date.now();
                const minUntil = window[MINUNTIL_KEY] || 0;

                // If we're within the minimum visible window, defer the new toast and
                // store it as pending (overwriting any previous pending toast)
                // If the minimum visible time has already passed, we can proceed to show the new toast immediately
                // 🧠 This ensures that toasts are visible for at least the minimum time, while still allowing new messages to replace old ones without queuing up multiple timers.
                if (minVisibleMs > 0 && now < minUntil) {
                    window[PENDING_KEY] = { text, type };

                    // Clear any existing defer timer to ensure only the latest pending toast will be shown after the current one expires
                    if (window[DEFER_KEY]) {
                        clearTimeout(window[DEFER_KEY]);
                        window[DEFER_KEY] = null;
                    }

                    // Set a new defer timer to show the pending toast as soon as the current minimum visible window expires
                    window[DEFER_KEY] = setTimeout(() => {
                        const pending = window[PENDING_KEY];
                        window[PENDING_KEY] = null;
                        window[DEFER_KEY] = null;

                        // If there's a pending toast, show it immediately (it will also reset the minimum visible window)
                        if (pending && pending.text) {
                            showUserMessage(pending.text, pending.type || "info");
                        }
                    }, Math.max(0, minUntil - now));

                    return;
                }
            } catch (_) {}

            // ✅ Last toast wins: remove previous toast + cancel previous timer
            try {
                const existing = document.getElementById(TOAST_ID);
                if (existing) existing.remove();

                if (window[TIMER_KEY]) {
                    clearTimeout(window[TIMER_KEY]);
                    window[TIMER_KEY] = null;
                }
            } catch (_) {}

            // ✅ Mark the minimum visible window for the newly shown toast
            try {
                window[MINUNTIL_KEY] = Date.now() + minVisibleMs;
            } catch (_) {}

            const messageElement = document.createElement("div");
            messageElement.id = TOAST_ID;
            
            // ✅ Normalize text: if it already starts with "MID:", keep as is (allows for custom formatting), 
            // otherwise prepend "MID: " for consistency
            const normalizedText = (typeof text === "string" && text.trim().startsWith("MID:"))
                ? text.trim()
                : `MID: ${String(text || "").trim()}`;
            messageElement.textContent = normalizedText;

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

            // ✅ Store timer id so the next toast can cancel it
            window[TIMER_KEY] = setTimeout(() => {
                messageElement.style.opacity = "0";
                setTimeout(() => {
                    try {
                        messageElement.remove();
                    } catch (removeError) {
                        logDebug(1, `⚠️ Error removing message element: ${removeError.message}`);
                    }
                }, 500); // Match CSS transition: opacity 0.5s
                window[TIMER_KEY] = null;
            }, effectiveDuration);

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
            const { pathname, lastSegment, extension, hasPathExtension, hasExtendedSuffix } = getImageUrlParts(url);
            const allowedExts = getAllowedImageExtensions();
            const allowedExtSet = new Set(allowedExts.map((ext) => ext.toLowerCase()));

            const isValid = hasPathExtension
                ? allowedExts.some((ext) => {
                    const escapedExt = escapeRegex(ext);
                    const pattern = hasExtendedSuffix && hasEnabledExtendedImageUrlSupport()
                        ? new RegExp(`${escapedExt}(:[a-zA-Z0-9]{2,10})?$`, "i")
                        : new RegExp(`${escapedExt}$`, "i");
                    return pattern.test(lastSegment);
                })
                : allowedExtSet.has(extension.toLowerCase());

            if (isValid) {
                logDebug(2, `✅ "${lastSegment}" accepted by allowed image formats.`);
            } else {
                logDebug(2, `⛔ "${lastSegment}" not allowed by image formats.`);
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
        splitUrlFileName,
        buildDownloadPath,
        isDirectImageUrl,
        isAllowedImageFormat,
        showUserMessage,
        initConfigCache,
        setBadgeError
    };
    
