    // utils.js - Utility functions for Mass Image Downloader

    console.log('[Mass image downloader]: Utility script loaded.');

    let closedTabs = new Set();
    let debugLoggingEnabled = false;

    // 🔄 Load debug setting on startup
    chrome.storage.sync.get(["debugLogging"], (data) => {
        debugLoggingEnabled = data.debugLogging || false;
    });

    /**
     * Logs messages only if debugging is enabled.
     * Always retrieves the latest setting from storage before logging.
     * @param {string} message - The message to log.
     */
    function logDebug(message) {
        chrome.storage.sync.get("debugLogging", (data) => {
            if (data.debugLogging) {
                console.log(`[Mass image downloader]: ${message}`);
            }
        });
    }

    /**
     * Updates the badge icon to reflect the current process status.
     * @param {number} count - Number of processed images.
     * @param {boolean} isComplete - True if the process is finished.
     */
    function updateBadge(count, isComplete = false) {
        if (count === 0 && !isComplete) {
            chrome.action.setBadgeText({ text: '' });
            logDebug("📢 Process started, hiding badge initially.");
        } else {
            const text = count.toString();
            chrome.action.setBadgeText({ text });

            if (isComplete) {
                logDebug(`👌 Finished processing. Total images processed: ${text}`);
                logDebug('---------------------------');
            } else {
                logDebug(`🔄 Images processed so far: ${text}`);
            }

            const backgroundColor = isComplete ? '#1E90FF' : '#4CAF50';
            const textColor = '#FFFFFF';
            chrome.action.setBadgeBackgroundColor({ color: backgroundColor });

            console.log(`[Mass image downloader]: 🚩 Badge updated to color: %c${backgroundColor}`, `background-color: ${backgroundColor}`);
            chrome.action.setBadgeTextColor({ color: textColor });

            logDebug('✔ Badge updated successfully.');
        }
    }

    /**
     * Closes a tab safely, avoiding duplicate closure attempts.
     * @param {number} tabId - The ID of the tab to close.
     * @param {function} callback - Function to execute after closure.
     */
    function closeTabSafely(tabId, callback) {
        if (closedTabs.has(tabId)) {
            logDebug(`🟡 Tab ID ${tabId} is already closed. Skipping.`);
            if (typeof callback === 'function') callback();
            return;
        }
    
        chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError) {
                logDebug(`📛 Tab ID ${tabId} no longer exists.`);
                if (typeof callback === 'function') callback();
                return;
            }
    
            chrome.tabs.remove(tabId, () => {
                if (chrome.runtime.lastError) {
                    logDebug(`❌ Failed to close tab ${tabId}: ${chrome.runtime.lastError.message}`);
                } else {
                    logDebug(`💥 Tab ID ${tabId} closed successfully.`);
                    closedTabs.add(tabId);
                }
                if (typeof callback === 'function') callback();
            });
        });
    }

    /**
     * Returns the next tab in the window after the current one.
     * @param {number} currentTabIndex - The index of the current tab.
     * @param {array} tabs - Array of all tabs in the current window.
     * @returns {object|null} - The next tab or null if none found.
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
     */
    function calculatePathSimilarity(url1, url2) {
        try {
            const path1 = new URL(url1).pathname.split('/');
            const path2 = new URL(url2).pathname.split('/');
            const minLen = Math.min(path1.length, path2.length);
            let matches = 0;
            for (let i = 0; i < minLen; i++) {
                if (path1[i] === path2[i]) matches++;
            }
            return (matches / Math.max(path1.length, path2.length)) * 100;
        } catch (err) {
            logDebug(`❌ Error calculating similarity: ${err.message}`);
            return 0;
        }
    }

    /**
     * Compares resolution between two images.
     * @param {object} img1 - First image { width, height }.
     * @param {object} img2 - Second image { width, height }.
     * @returns {boolean} - True if img2 is higher resolution than img1.
     */
    function isHigherResolution(img1, img2) {
        try {
            return (img2.width * img2.height) > (img1.width * img1.height);
        } catch (err) {
            logDebug(`❌ Error comparing resolutions: ${err.message}`);
            return false;
        }
    }

    /**
     * 🧪 Validates if the image URL matches a user-allowed file extension.
     * Formats are controlled via chrome.storage.sync options (allowJPG, allowJPEG, etc).
     * 
     * @param {string} url - The image URL to check.
     * @returns {Promise<boolean>} - Resolves to true if the image extension is allowed.
     */
    async function isAllowedImageFormat(url) {
        try {
            const { allowJPG, allowJPEG, allowPNG, allowWEBP } = await new Promise((resolve) =>
                chrome.storage.sync.get(["allowJPG", "allowJPEG", "allowPNG", "allowWEBP"], resolve)
            );

            const extension = new URL(url).pathname.toLowerCase().split('.').pop();

            if (extension === "jpg" && allowJPG) return true;
            if (extension === "jpeg" && allowJPEG) return true;
            if (extension === "png" && allowPNG) return true;
            if (extension === "webp" && allowWEBP) return true;

            logDebug(`🧯 Blocked format: .${extension} is not allowed by user settings.`);
            return false;

        } catch (err) {
            logDebug(`❌ Error validating image format for URL: ${url} - ${err.message}`);
            return false;
        }
    }


    /**
     * Builds a filename using user-selected mode.
     * Applies prefix, suffix or timestamp depending on settings.
     * @param {string} baseName - Original file name.
     * @param {string} extension - File extension with dot.
     * @returns {string} - Final filename with formatting.
     */
    function generateFilename(baseName, extension) {
        try {
            chrome.storage.sync.get(["filenameMode", "prefix", "suffix"], (data) => {
                let name = baseName;

                if (data.filenameMode === "prefix") {
                    name = `${data.prefix}_${baseName}`;
                } else if (data.filenameMode === "suffix") {
                    name = `${baseName}_${data.suffix}`;
                } else if (data.filenameMode === "both") {
                    name = `${data.prefix}_${baseName}_${data.suffix}`;
                } else if (data.filenameMode === "timestamp") {
                    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(2, 14);
                    name = `${baseName}_${timestamp}`;
                }

                return `${name}${extension}`;
            });
        } catch (err) {
            logDebug(`❌ Error generating filename: ${err.message}`);
            return `${baseName}${extension}`;
        }
    }

    /**
     * Removes invalid characters from filename components.
     * @param {string} text - User input for prefix/suffix.
     * @returns {string} - Sanitized text.
     */
    function sanitizeFilenameComponent(text) {
        try {
            return text.trim().replace(/[^a-zA-Z0-9 ]/g, '');
        } catch (err) {
            logDebug(`❌ Error sanitizing filename component: ${err.message}`);
            return '';
        }
    }

    // Export shared utility functions
    export {
        closeTabSafely,
        moveToNextTab,
        logDebug,
        updateBadge,
        calculatePathSimilarity,
        isHigherResolution,
        generateFilename,
        sanitizeFilenameComponent,
        isAllowedImageFormat
    };
    
