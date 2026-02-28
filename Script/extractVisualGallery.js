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
    let toastMinVisibleMsCache = 2000; // Default minimum visible time for toast (ms)

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
		"showUserFeedbackMessages", "toastMinVisibleMs"
	], (data) => {

        const level = parseInt(data.debugLogLevel ?? 0);
		showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;

        const rawToastMinVisibleMs = parseInt(data.toastMinVisibleMs ?? 2000, 10);
        toastMinVisibleMsCache = (!isNaN(rawToastMinVisibleMs) && rawToastMinVisibleMs >= 0 && rawToastMinVisibleMs <= 10000)
            ? rawToastMinVisibleMs
            : 2000;

        logDebug(2, `⏱️ Config → Toast minimum visible time (ms): ${toastMinVisibleMsCache}`);

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
     * Displays a temporary user message on the page.
     * @param {string} text - The message text to display.
     * @param {'info'|'success'|'error'} type - The type of message, which determines styling and duration.
     * @returns {void}
     * @description This function creates a temporary message element on the page to provide feedback to the user.
     * It checks if the user has enabled feedback messages before displaying anything.
     * The message is styled based on the type (info, success, error) and automatically disappears after a certain duration.
     * If a new message is shown while another is still visible, the previous one is removed immediately to ensure that only one message is displayed at a time.
     * This function is useful for providing feedback to the user about actions taken, such as successfully setting a prefix/suffix or encountering an error.
     */
	function showUserMessage(text, type = "info") {
		try {
			if (!showUserFeedbackMessagesCache) {
				logDebug(2, "🚫 User feedback messages disabled.");
				return;
			}

			const baseDuration = type === "error" ? 10000 : 5000;
            const minVisibleMs = Math.max(0, parseInt(toastMinVisibleMsCache ?? 2000, 10) || 2000);
            const effectiveDuration = Math.max(baseDuration, minVisibleMs);
            const bg = type === "error" ? "#d9534f" : "#007EE3";

			// ✅ Last toast wins: remove previous toast + cancel previous timer
            const TOAST_ID = "mdi-user-toast";
            const TIMER_KEY = "__mdiUserToastTimer";

            // ⏱️ Minimum visible time: defer replacement inside the min window (last pending toast wins)
            const MINUNTIL_KEY = "__mdiUserToastMinUntil";
            const DEFER_KEY = "__mdiUserToastDeferTimer";
            const PENDING_KEY = "__mdiUserToastPending";

            try {
                const now = Date.now();
                const minUntil = window[MINUNTIL_KEY] || 0;

                if (minVisibleMs > 0 && now < minUntil) {
                    window[PENDING_KEY] = { text, type };

                    if (window[DEFER_KEY]) {
                        clearTimeout(window[DEFER_KEY]);
                        window[DEFER_KEY] = null;
                    }

                    window[DEFER_KEY] = setTimeout(() => {
                        const pending = window[PENDING_KEY];
                        window[PENDING_KEY] = null;
                        window[DEFER_KEY] = null;

                        if (pending && pending.text) {
                            showUserMessage(pending.text, pending.type || "info");
                        }
                    }, Math.max(0, minUntil - now));

                    return;
                }
            } catch (_) {}

            try {
                const existing = document.getElementById(TOAST_ID);
                if (existing) existing.remove();

                if (window[TIMER_KEY]) {
                    clearTimeout(window[TIMER_KEY]);
                    window[TIMER_KEY] = null;
                }
            } catch (_) {}

			const msg = document.createElement("div");
			msg.id = TOAST_ID;
			const finalText = (typeof text === "string" && text.trim().startsWith("MID:")) ? text.trim() : `MID: ${text}`;
            msg.textContent = finalText;
			msg.style = `
				position:fixed; top:20px; right:20px;
				background:${bg}; color:#fff; padding:12px;
				border-radius:6px; font-size:14px;
				box-shadow:2px 2px 8px rgba(0,0,0,0.3);
				opacity:1; transition:opacity 0.5s ease-in-out;
				z-index:9999;
			`;

			logDebug(2, `📢 Showing user message: "${text}" (${type})`);

			// ⏱️ Mark minimum visible window start (before append to avoid ultra-fast overwrite)
            try {
                window[MINUNTIL_KEY] = Date.now() + minVisibleMs;
            } catch (_) {}

            document.body.appendChild(msg);

			// ✅ Store timer id so the next toast can cancel it
			window[TIMER_KEY] = setTimeout(() => {
				msg.style.opacity = "0";
				setTimeout(() => {
					try { msg.remove(); } catch (e) { logDebug(1, `⚠️ Failed to remove message: ${e.message}`); }
				}, 500);
				window[TIMER_KEY] = null;
			}, effectiveDuration);
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
        showUserMessage("Visual Gallery - start", "info");

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
            showUserMessage(`Visual Gallery - analyzing / send to download (${imagesFound.length} images)`, "info");

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
                        showUserMessage("Visual Gallery - done (error) - 0 images downloaded | 0 pages opened", "error");
                    } else if (response?.success) {
                        logDebug(1, "✅ Images sent to background successfully.");
                        showUserMessage(`Visual Gallery - done - 0 images downloaded | 0 pages opened`, "success");
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
