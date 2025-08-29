// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// extractVisualGallery.js - Extract Visual Gallery Functionality

(function () {

    let debugLogLevelCache = 1;
    let minWidth = 300;
    let minHeight = 500;
	let showUserFeedbackMessagesCache = true;

    let allowJPG = true;
    let allowJPEG = true;
    let allowPNG = true;
    let allowWEBP = true;
    let allowAVIF = true;
    let allowBMP = true;

    // Get user settings from chrome.storage.sync
    // and set default values if not found
    chrome.storage.sync.get([
		"minWidth", "minHeight", "galleryMaxImages",
		"debugLogLevel", 
        "allowJPG", "allowJPEG", "allowPNG", "allowWEBP", "allowAVIF", "allowBMP",
		"showUserFeedbackMessages"
	], (data) => {

        const level = parseInt(data.debugLogLevel ?? 0);
		showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;

        if (!isNaN(level)) debugLogLevelCache = level;
    
        minWidth = parseInt(data.minWidth) || 300;
        minHeight = parseInt(data.minHeight) || 500;
        const galleryMaxImages = parseInt(data.galleryMaxImages) || 3;

        // 🧠 Format filters declared globally to be available in extractImagesFromPage
        allowJPG = data.allowJPG !== false;
        allowJPEG = data.allowJPEG !== false;
        allowPNG = data.allowPNG !== false;
        allowWEBP = data.allowWEBP !== false;
        allowAVIF = data.allowAVIF !== false;
        allowBMP = data.allowBMP !== false;

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
	 * Displays a styled message to the user if feedback is enabled.
	 * @param {string} text - The message text to display.
	 * @param {string} [type="info"] - Type: info or error.
	 */
	function showUserMessage(text, type = "info") {
		try {
			if (!showUserFeedbackMessagesCache) {
				logDebug(2, "🚫 User feedback messages disabled.");
				return;
			}

			const duration = type === "error" ? 10000 : 5000;
			const bg = type === "error" ? "#d9534f" : "#007EE3";

			const msg = document.createElement("div");
			msg.textContent = text;
			msg.style = `
				position:fixed; top:20px; right:20px;
				background:${bg}; color:#fff; padding:12px;
				border-radius:6px; font-size:14px;
				box-shadow:2px 2px 8px rgba(0,0,0,0.3);
				opacity:1; transition:opacity 0.5s ease-in-out;
				z-index:9999;
			`;
			document.body.appendChild(msg);

			logDebug(2, `📢 Showing user message: "${text}" (${type})`);

			setTimeout(() => {
				msg.style.opacity = "0";
				setTimeout(() => {
					try { msg.remove(); } catch (e) { logDebug(1, `⚠️ Failed to remove message: ${e.message}`); }
				}, 500);
			}, duration);
		} catch (e) {
			logDebug(1, `❌ showUserMessage error: ${e.message}`);
		}
	}
	

	/**
	 * Validates if an image should be considered standalone or gallery-related.
	 * Allows <a> links only if the href is on the same domain (to support modals/thumbnails).
	 * @param {HTMLImageElement} imgElement 
	 * @returns {boolean}
	 */
	function extractVisualGallery(imgElement) {
		try {
			let parent = imgElement.parentElement;
			while (parent) {
                if (parent.tagName?.toLowerCase() === "a") {
                    // ⛔ Reject all images inside links regardless of href origin
                    return false;
                }
				parent = parent.parentElement;
			}
			return true;
		} catch (e) {
			console.log("[Mass image downloader]: ❌ extractVisualGallery() failed:", e.message);
			return false;
		}
	}

    /**
     * Extracts images from the current page, validating dimensions and uniqueness.
     * It collects images that are not inside <a> links and meet the minimum size requirements.
     * This function is designed to run only once per page load to avoid duplicates.
     * @param {number} galleryMaxImages - Maximum number of images to collect.
     * @returns {Promise<void>} 
     * @description
     * This function scans all images on the page, checking if they are standalone (not inside <a> links),
     * validates their dimensions, and collects them into an array.
     * It handles preloading images to ensure dimensions are accurate, and filters out images that do not meet
     * the minimum size requirements.
     * If no valid images are found, it shows a user message suggesting to use the "Extract Web-Linked Gallery" option.
     * It also sends the collected images to the background script for further processing.     * 
     */
    async function extractImagesFromPage(galleryMaxImages) {
        if (window.__mdi_extractVisualGalleryRunning) {
            logDebug(1, "⏳ Extract Visual Gallery already running. Skipping duplicate execution.");
            return;
        }

        window.__mdi_extractVisualGalleryRunning = true;

        try {
            const imagesFound = [];
            const allImages = [...new Set(document.images)];

            logDebug(2, '🔍 Searching for images...');
            logDebug(2, `📊 Total raw images found: ${allImages.length}`);
            logDebug(3, '----------------------------------------');

            for (let i = 0; i < allImages.length; i++) {
                let img = allImages[i];
                let url = img?.src || '';

                // Validate by extension
                let ext = '';
                try {
                    const urlObj = new URL(url);
                    ext = urlObj.pathname.split('.').pop()?.toLowerCase() || '';
                } catch (e) {
                    logDebug(2, `⛔ Invalid image URL, skipped: ${url}`);
                    continue;
                }

                const allowedExts = [];
                if (allowJPG) allowedExts.push('jpg');
                if (allowJPEG) allowedExts.push('jpeg');
                if (allowPNG) allowedExts.push('png');
                if (allowWEBP) allowedExts.push('webp');
                if (allowAVIF) allowedExts.push('avif');
                if (allowBMP) allowedExts.push('bmp');

                if (!allowedExts.includes(ext)) {
                    logDebug(2, `⛔ Image Skipped (unsupported extension: .${ext})`);
                    continue;
                }

                try {
                    logDebug(2, `🕵 Checking url: ${url}`);

                    // ⛔ Discard immediately if inside <a>
                    if (!extractVisualGallery(img)) {
                        logDebug(2, '⛔ Image Skipped (inside <a> link)');
                        continue;
                    }

                    // Validate presence and dimension
                    if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
                        try {
                            logDebug(2, `🔄 Attempt to preload image manually to recover dimensions...`);
                            const preloaded = new Image();
                            preloaded.src = url;

                            // Wait for the image to load
                            await new Promise((resolve, reject) => {
                                preloaded.onload = resolve;
                                preloaded.onerror = reject;
                            });

                            // Check if the preloaded image has valid dimensions
                            if (preloaded.naturalWidth === 0 || preloaded.naturalHeight === 0) {
                                logDebug(2, `⛔ Image Skipped (forced load failed: 0x0)`);
                                continue;
                            }

                            // Copy dimensions
                            img.naturalWidth = preloaded.naturalWidth;
                            img.naturalHeight = preloaded.naturalHeight;

                            // 💡 Cleanup preload
                            preloaded.src = '';
                        } catch (err) {
                            logDebug(2, `⛔ Image Skipped (manual preload failed)`);
                            continue;
                        }
                    }

                    if (!url) {
                        logDebug(2, '⛔ Image Skipped (missing src)');
                        continue;
                    }

                    const width = img.naturalWidth;
                    const height = img.naturalHeight;

                    // Is a valid dimension?
                    if (width < minWidth || height < minHeight) {
                        logDebug(2, `⛔ Image Skipped (too small: ${width}x${height}, min: ${minWidth}x${minHeight})`);
                        continue;
                    }

                    // ✅ Passed all checks
                    imagesFound.push({ url, width, height });
                    logDebug(2, `✅ Image accepted`);
                } catch (imgErr) {
                    logDebug(1, `❌ Error processing image index ${i}: ${imgErr.message}`);
                } finally {
                    // 🔄 Cleanup reference
                    img = null;
                }
            }

            if (imagesFound.length === 0) {
                try {
                    logDebug(1, '⛔ No valid standalone images found on this page.');
                    logDebug(2, '💡 Tip: Use "Extract Web-Linked Gallery" instead.');
                    showUserMessage("No images found. Try 'Extract Web-Linked Gallery' instead.", "error");

                    if (Array.isArray(imagesFound)) imagesFound.length = 0;
                } catch (cleanupError) {
                    logDebug(1, `⚠️ Error during validation cleanup: ${cleanupError.message}`);
                } finally {
                    window.__mdi_extractVisualGalleryRunning = false;
                }
                return;
            }

            logDebug(3, '----------------------------------------');
            logDebug(1, `🎯 Visual gallery images collected: ${imagesFound.length}`);
            logDebug(2, '📤 Sending images to background script...');

            try {
                // Send the images to the background script
                chrome.runtime.sendMessage({
                    action: "extractVisualGallery",
                    payload: {
                        images: imagesFound,
                        baseUrl: window.location.href,
                        options: { minWidth, minHeight, galleryMaxImages }
                    }
                }, (response) => {
                    // Check for errors in the response
                    if (chrome.runtime.lastError) {
                        logDebug(1, `❌ Error sending images: ${chrome.runtime.lastError.message}`);
                    } else if (response?.success) {
                        logDebug(1, "✅ Images sent to background successfully.");
                    } else {
                        logDebug(2, "⚠️ No response or process failed.");
                    }
                    logDebug(3, '----------------------------------------');
                });
            } catch (sendError) {
                logDebug(1, `❌ SendMessage exception: ${sendError.message}`);
                logDebug(2, `🐛 Stacktrace: ${sendError.stack}`);
            }
        } catch (error) {
            logDebug(1, `❌ Exception during gallery finding: ${error.message}`);
            logDebug(2, `🐛 Stacktrace: ${error.stack}`);
        } finally {
            window.__mdi_extractVisualGalleryRunning = false;
        }
    }

})();
