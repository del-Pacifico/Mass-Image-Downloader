 
// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/sergiopalmah/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// extractVisualGallery.js - Extract Visual Gallery Functionality

(function () {

    let debugLogLevelCache = 1;
    let minWidth = 300;
    let minHeight = 500;

    // Get user settings from chrome.storage.sync
    // and set default values if not found
    chrome.storage.sync.get(["debugLogLevel", "minimumImageWidth", "minimumImageHeight", "galleryMaxImages"], (data) => {
        const level = parseInt(data.debugLogLevel ?? 0);
        if (!isNaN(level)) debugLogLevelCache = level;
    
        minWidth = parseInt(data.minimumImageWidth) || 300;
        minHeight = parseInt(data.minimumImageHeight) || 500;
        const galleryMaxImages = parseInt(data.galleryMaxImages) || 3;
    
        logDebug(1, `🌠 Extract Visual Gallery script injected.`);
        extractImagesFromPage(galleryMaxImages);
    });
    

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

    /**
     * Validates if an image is standalone (not inside an <a> link).
     * @param {HTMLElement} imgElement
     * @returns {boolean}
     * @description Checks if the image is a standalone image by traversing up the DOM tree.
     * If it finds an <a> tag, it returns false. Otherwise, it returns true.
     * This is important to ensure that we only collect images that are not linked to other pages.
     */
    function extractVisualGallery(imgElement) {
        let parent = imgElement.parentElement;
        while (parent) {
            if (parent.tagName && parent.tagName.toLowerCase() === "a") {
                return false;
            }
            parent = parent.parentElement;
        }
        return true;
    }

    /**
     * Extracts images from the current page and sends them to the background script.
     * @returns {void}
     * @description This function searches for images on the page, validates them, and sends the valid images to the background script.
     * It uses the extractVisualGallery function to check if the image is standalone.
     * It also handles the case where multiple executions are attempted simultaneously by setting a flag.
     * The function logs the process and results to the console for debugging purposes.
     * @throws {Error} If an error occurs during the image extraction process.
     */
    async function extractImagesFromPage(galleryMaxImages) {
        // 🔒 Prevent multiple simultaneous executions
        if (window.__mdi_extractVisualGalleryRunning) {
            logDebug(1, "⏳ Extract Visual Gallery already running. Skipping duplicate execution.");
            return;
        }
    
        // Set a flag to prevent multiple executions
        window.__mdi_extractVisualGalleryRunning = true;  

        try {
            const imagesFound = [];

            // Collect all images on the page
            logDebug(2, '🔍 Searching for images...');
            logDebug(3, '');

            const allImages = [...new Set(document.images)];

            logDebug(2, `🔎 Total raw images found: ${allImages.length}`);
            logDebug(3, '----------------------------------------');
            logDebug(3, '');

            for (let i = 0; i < allImages.length; i++) {
                const img = allImages[i];
                const url = img.src;

                logDebug(2, `🕵 Checking url: ${url}`);
                logDebug(3, '');

                if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
                    // 🧪 Attempt to preload image manually to recover dimensions
                    try {
                        logDebug(2, `🔄 Attempt to preload image manually to recover dimensions...`);
                        const preloaded = new Image();
                        preloaded.src = img.src;
                        await new Promise((resolve, reject) => {
                            preloaded.onload = resolve;
                            preloaded.onerror = reject;
                        });
                
                        if (preloaded.naturalWidth === 0 || preloaded.naturalHeight === 0) {
                            logDebug(2, `⛔ Image Skipped (forced load failed: 0x0)`);
                            continue;
                        }
                
                        // Use dimensions from preloaded image
                        img.naturalWidth = preloaded.naturalWidth;
                        img.naturalHeight = preloaded.naturalHeight;
                    } catch (err) {
                        logDebug(2, `⛔ Image Skipped (manual preload failed)`);
                        continue;
                    }
                }
                
                if (!url) {
                    logDebug(2, '⛔ Image Skipped (missing src)');
                    continue;
                }

                // Validate: Must be standalone (not inside <a>)
                if (!extractVisualGallery(img)) {
                    logDebug(2, '⛔ Image Skipped (inside <a> link)');
                    continue;
                }

                // Validate: Must meet minimum dimensions
                const width = img.naturalWidth;
                const height = img.naturalHeight;

                // Validate with minWidth and minHeight
                if (width < minWidth || height < minHeight) {
                    logDebug(2, `⛔ Image Skipped (too small: ${width}x${height}, min: ${minWidth}x${minHeight})`);
                    continue;
                }

                // ✅ Passed all checks
                imagesFound.push({ url, width, height });
                logDebug(2, `✅ Image accepted`);

            }

            if (imagesFound.length === 0) {
                logDebug(1, '⚠️ No standalone images found.');
                logDebug(3, '----------------------------------------');
                // Reset the flag to allow future executions
                window.__mdi_extractVisualGalleryRunning = false;
                return;
            }

            logDebug(3, '');
            logDebug(3, '----------------------------------------');
            logDebug(1, `🎯 Visual gallery images collected: ${imagesFound.length}`);
            logDebug(2, '📤 Sending images to background script...');

            try {
                chrome.runtime.sendMessage({
                    action: "extractVisualGallery",
                    payload: {
                        images: imagesFound,
                        baseUrl: window.location.href,
                        options: {
                            minWidth,
                            minHeight,
                            galleryMaxImages
                        }
                    }
                }, (response) => {                              
                    if (chrome.runtime.lastError) {
                        logDebug(1, `❌ Error sending images: ${chrome.runtime.lastError.message}`);
                    } else if (response?.success) {
                        logDebug(1, "✅ Images sent to background successfully.");
                    } else {
                        logDebug(2, "⚠️ No response or process failed.");
                    }
                    logDebug(3, '----------------------------------------');
                    logDebug(3, '');
                });
            } catch (sendError) {
                logDebug(1, `❌ SendMessage exception: ${sendError.message}`);
                logDebug(2, `🐛 Stacktrace: ${sendError.stack}`);
                logDebug(3, '----------------------------------------');
                logDebug(3, '');
            }
        } catch (error) {
            logDebug(1, `❌ Exception during gallery finding: ${error.message}`);
            logDebug(2, `🐛 Stacktrace: ${error.stack}`);
            logDebug(3, '----------------------------------------');
            logDebug(3, '');
        } finally {
            // Reset the flag no matter what
            window.__mdi_extractVisualGalleryRunning = false;
        }
    }
})();
