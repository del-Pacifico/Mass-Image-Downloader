 
// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/sergiopalmah/Mass-Image-Downloader
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
        filenameMode: "none",
        prefix: "",
        suffix: ""
    };

    async function initConfigCache() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([
                "debugLogLevel", "showUserFeedbackMessages",
                "allowJPG", "allowJPEG", "allowPNG", "allowWEBP",
                "filenameMode", "prefix", "suffix"
            ], (data) => {
                configCache.debugLogLevel = parseInt(data.debugLogLevel ?? 1);
                configCache.showUserFeedbackMessages = data.showUserFeedbackMessages ?? true;
                configCache.allowJPG = data.allowJPG !== false;
                configCache.allowJPEG = data.allowJPEG !== false;
                configCache.allowPNG = data.allowPNG !== false;
                configCache.allowWEBP = data.allowWEBP !== false;
                configCache.filenameMode = data.filenameMode ?? "none";
                configCache.prefix = data.prefix ?? "";
                configCache.suffix = data.suffix ?? "";
                resolve();
            });
        });
    }
    
    // 🧠 Track closed tabs to prevent double-closure
    const closedTabs = new Set();

    logDebug(1, '⚡ Utility script loaded.');


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

            //console.log(`[Mass image downloader]: ------------------------------------------------------------------`);
            //console.log(`[Mass image downloader]: levelOfLog: ${levelOfLog} | level: ${level} | debugLogLevelCache: ${debugLogLevelCache}`);
            //console.log(`[Mass image downloader]: ------------------------------------------------------------------`);
    
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
        if (count === 0 && !isComplete) {
            chrome.action.setBadgeText({ text: '' });
            logDebug(2, "📢 Process started, hiding badge initially.");
        } else {
            const text = count.toString();
            chrome.action.setBadgeText({ text });

            if (isComplete) {
                logDebug(2, `👌 Finished processing. Total images/url processed: ${text}`);
                logDebug('---------------------------');
            } else {
                logDebug(3, `🔄 Processed so far: ${text}`);
            }

            const backgroundColor = isComplete ? '#1E90FF' : '#4CAF50';
            const textColor = '#FFFFFF';
            chrome.action.setBadgeBackgroundColor({ color: backgroundColor });
            
            if (backgroundColor === '#1E90FF') {
                logDebug(3, `🚩 Badge updated to color: 🔵`);
            }
            else {
                logDebug(3, `🚩 Badge updated to color: 🟢`);
            }
            chrome.action.setBadgeTextColor({ color: textColor });

            logDebug(3, '✅ Badge updated successfully.');
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
            return 0;
        }
    }

    // 🔍 Checks if a URL points directly to an image, considering user-defined formats
    async function isDirectImageUrl(url) {
        try {
            const parsed = new URL(url);
            const pathname = parsed.pathname.toLowerCase();

            // ⛔ Reject empty paths or directories
            if (!pathname || pathname.endsWith('/')) {
                logDebug(2, `🚫 Invalid path (empty or ends with '/'): ${pathname}`);
                return false;
            }

            // ✅ Load allowed image extensions from user settings
            const allowedExts = [];
            if (configCache.allowJPG) allowedExts.push('.jpg');
            if (configCache.allowJPEG) allowedExts.push('.jpeg');
            if (configCache.allowPNG) allowedExts.push('.png');
            if (configCache.allowWEBP) allowedExts.push('.webp');

            // 🔍 Extract the file name from the path
            const segments = pathname.split('/');
            const filename = segments.pop();
            if (!filename || !filename.includes('.')) {
                logDebug(2, `🚫 No valid filename found in path: ${pathname}`);
                return false;
            }

            // ✅ Validate extension against allowed formats
            const isValid = allowedExts.some(ext => filename.endsWith(ext));
            logDebug(3, `🧪 Validating "${filename}" against allowed formats: ${isValid}`);
            return isValid;
        } catch (err) {
            logDebug(1, `⚠️ Error in isDirectImageUrl: ${err.message}`);
            return false;
        }
    }

    /**
     * Builds a filename using user-selected mode.
     * Applies prefix, suffix or timestamp depending on settings.
     * @param {string} baseName - Original file name.
     * @param {string} extension - File extension with dot.
     * @returns {Promise<string>} - Final filename with formatting.
     * @description This function generates a filename based on user settings for prefix, suffix, or timestamp.
     */
    async function generateFilename(baseName, extension) {
        try {

            const { filenameMode, prefix, suffix } = configCache;

            let name = baseName;
            
            logDebug(3, `🧪 Prefix mode: ${filenameMode}`);
            logDebug(3, `🧪 Original Name: ${baseName}`);

            if (filenameMode === "prefix") {
                name = `${prefix}_${baseName}`;
            } else if (filenameMode === "suffix") {
                name = `${baseName}_${suffix}`;
            } else if (filenameMode === "both") {
                name = `${prefix}_${baseName}_${suffix}`;
            } else if (filenameMode === "timestamp") {
                const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(2, 14);
                name = `${baseName}_${timestamp}`;
            }

            logDebug(3, `🧪 Final name: ${name}`);
            return `${name}${extension}`;
        } catch (err) {
            logDebug(1, `❌ Error generating filename: ${err.message}`);
            logDebug(2, '-----------------------------------------------');
            return `${baseName}${extension}`;
        }
    }


    /**
     * Removes invalid characters from filename components.
     * @param {string} text - User input for prefix/suffix.
     * @returns {string} - Sanitized text.
     * @description This function sanitizes the input text by removing invalid characters and trimming whitespace.
     * It uses a regular expression to replace any character that is not alphanumeric or a space with an empty string.
     * If an error occurs during the process, it logs the error message and returns an empty string.
     */
    function sanitizeFilenameComponent(text) {
        try {
            return text.trim().replace(/[^a-zA-Z0-9 ]/g, '');
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
            messageElement.textContent = text;
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
        }
    }

    /**
     * Checks if the given URL has an allowed image format based on user settings.
     * @param {string} url - The URL to check.
     * @returns {Promise<boolean>} - True if the image format is allowed.
     * @description This function checks whether the file extension of the provided URL
     * matches any of the formats allowed in user settings.
     */
    async function isAllowedImageFormat(url) {
        try {
            const parsed = new URL(url);
            const pathname = parsed.pathname.toLowerCase();

            const allowedExts = [];
            if (configCache.allowJPG) allowedExts.push('.jpg');
            if (configCache.allowJPEG) allowedExts.push('.jpeg');
            if (configCache.allowPNG) allowedExts.push('.png');
            if (configCache.allowWEBP) allowedExts.push('.webp');

            const isValid = allowedExts.some(ext => pathname.endsWith(ext));
            logDebug(3, `🧪 Checking format for "${pathname}": ${isValid}`);
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
        calculatePathSimilarity,
        generateFilename,
        sanitizeFilenameComponent,
        isDirectImageUrl,
        isAllowedImageFormat,
        showUserMessage,
        initConfigCache
    };
    
