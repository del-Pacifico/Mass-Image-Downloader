// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// extractLinkedGallery.js - Extract Linked Gallery Functionality

/**
 * @file extractLinkedGallery.js
 * @description This script extracts linked images from the current webpage and sends them to the background script for further processing.
 * It scans for anchor elements containing images, validates their URLs, and filters them based on user-defined settings.
 * It also provides user feedback messages and handles errors gracefully.
 * 
 */
(function () {

    let currentLogLevel = 1; // Default log level
    let showUserFeedbackMessagesCache = true;
 
    logDebug(1, "⚓ Extract Linked Gallery script injected.");

    // 🔒 Prevent multiple simultaneous executions
    if (window.__mdi_extractLinkedGalleryRunning) {
        logDebug(1, "⏳ Extract Linked Gallery process already running. Skipping duplicate execution.");
        return;
    }
    // 🔒 Set running state to prevent multiple executions
    window.__mdi_extractLinkedGalleryRunning = true;

    let galleryRateLimit = 3; // Max images per second (configurable via storage)
    let minWidth = 300;
    let minHeight = 300;

    /**
     * Show user feedback messages on the screen.
     * @param {string} text - The message to display.
     * @param {string} [type="info"] - The type of message (info, error).
     * @description
     * This function creates a message element and displays it on the screen for a specified duration.
     * It uses a fixed position and styles to make the message visually distinct.
     * The message fades out after the duration and is removed from the DOM.
     */
    function showUserMessage(text, type = "info") {
        try {
            // 🔒 Check if user feedback messages are enabled
            if (!showUserFeedbackMessagesCache) {
                logDebug(1, `🚫 User feedback messages disabled. Skipping display.`);
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

            logDebug(2, `📢 Showing user message: "${text}" (${type})`);

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
     * Logs debug messages to the console based on the current log level.
     * @param {number|string} levelOrMessage - The log level (1-3) or message to log. 0: No log, 1: Basic, 2: Verbose, 3: Detailed.
     * @param {...any} args - Additional arguments to log.
     * @description
     * This function checks the current log level and logs messages to the console accordingly.
     * It supports different log levels (1-3) and can log multiple arguments.
     * If the log level is not valid, it defaults to level 1.
     * It also handles errors gracefully and logs them to the console.
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
    
            if (level <= currentLogLevel) {
                console.log("[Mass image downloader]:", ...messageArgs);
            }
        } catch (outerError) {
            console.log("[Mass image downloader]: ❌ Logging failed:", outerError.message);
        }
    }
    
    /**
     * Updates the badge count for opened images.
     * @param {number} count - The number of images processed.
     * @param {boolean} isComplete - Whether the process is finished.
     * @description
     * This function sends a message to the background script to update the badge count.
     * It handles errors gracefully and logs them to the console.
     * If the badge update fails, it logs the error message.
     */
    function updateBadge(count, isComplete = false) {
        try {
            chrome.runtime.sendMessage({ action: "updateBadge", count, complete: isComplete });
        } catch (error) {
            logDebug(1, `❌ Failed to update badge: ${error.message}`);
        }
    }

    /**
     * Checks if the given URL points to an image with an allowed format based on user settings.
     *
     * @async
     * @function isAllowedImageFormat
     * @param {string} url - The URL of the image to validate.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the image format is allowed, otherwise `false`.
     * @description
     * This function extracts the file extension from the provided URL and compares it against
     * a list of allowed image formats retrieved from Chrome's synchronized storage. The allowed
     * formats are determined by user settings for JPG, JPEG, PNG, and WEBP.
     *
     */
    function isAllowedImageFormat(url, settings) {
        try {
            const extension = new URL(url).pathname.toLowerCase().split('.').pop();

            if (extension === "jpg" && settings.allowJPG) return true;
            if (extension === "jpeg" && settings.allowJPEG) return true;
            if (extension === "png" && settings.allowPNG) return true;
            if (extension === "webp" && settings.allowWEBP) return true;

            return allowedExtensions.includes(extension);
        } catch (err) {
            logDebug(1, `❌ Error validating image format: ${err.message}`);
            return false;
        }
    }
    
    /**
     * 🖼️ Check if the URL is a direct image URL (e.g., ends with .jpg, .png, etc.).
     *    - Ignores query strings and fragments via URL.pathname.
     *    - Trims any trailing slashes.
     *    - Logs functional breakdown at level 2.
     */
    function isDirectImageUrl(url) {
        try {
            const parsed = new URL(url);
            // Trim trailing slashes from the pathname
            const pathname = parsed.pathname.replace(/\/+$/g, "");
            
            // Test extension against allowed image formats
            const valid = /\.(jpe?g|png|webp|avif|bmp)$/i.test(pathname);
            
            // Functional debug breakdown
            logDebug(2,
                `🔍 DirectImageURL check | URL: "${url}" | ` +
                `Pathname: "${pathname}" | Valid: ${valid}`
            );
            
            return valid;
        } catch (err) {
            logDebug(1, `❌ Error in isDirectImageUrl: ${err.message}`);
            return false;
        }
    }


    /**
     * 📦 Main entry point to Extract Linked Gallery 
     * @param {*} settings - User settings for image extraction 
     * @returns {Promise<void>} - A promise that resolves when the extraction process is complete.
     * @description
     * This function scans the document for anchor elements containing images, validates their URLs,
     * and sends the valid image URLs to the background script for further processing. 
     */
    async function extractLinkedGalley(settings) {
        logDebug(3, '----------------------------------------------------');
        logDebug(1, '🌄 Begin: Extract Linked Gallery process');
        logDebug(3, '----------------------------------------------------');
        
		// 📌 Step 1: Find anchor <a> with internal <img>
		const anchors = Array.from(document.querySelectorAll('a[href]'));
		const webGalleryCandidates = [];

		for (const anchor of anchors) {
			const href = anchor.getAttribute("href");
			const img = anchor.querySelector("img");

			if (!href || !img) continue;

			try {
				const resolvedHref = new URL(href, window.location.href).href;
				const src = img.getAttribute("src")?.trim() || "";

				// ✅ Step 1.1: Skip only if src is truly empty or 1x1 pixel pattern
				if (!src || /1x1|spacer.gif|pixel.gif|\.ico$/i.test(src)) {
					logDebug(2, `⛔ Skipped <a><img>: Decorative or transparent src (${src})`);
					continue;
				}

				// ✅ Step 1.2: Validate that href is a direct image URL
				const isImageLink = await isDirectImageUrl(resolvedHref);
				if (!isImageLink) {
                    //logDebug(2, `🔎 Validating extension against settings: ${resolvedHref}`);
					logDebug(2, `⛔ Skipped <a><img>: Link points to non-image (likely HTML): ${resolvedHref}`);
					continue;
				}
				
				// 🎯 Step 1.3: Skip if already collected
				if (webGalleryCandidates.includes(resolvedHref)) continue;

				webGalleryCandidates.push(resolvedHref);
				logDebug(2, `✅ Accepted web-linked gallery: ${resolvedHref}`);
			} catch (err) {
				logDebug(1, `⚠️ Failed to process anchor: ${err.message}`);
			}
		}

		// 🚦 Block execution if no valid candidates collected
		if (!webGalleryCandidates.length) {
			try {
				logDebug(1, "⛔ No valid web-linked image anchors found.");
				logDebug(2, "💡 Tip: Try 'Extract Visual Gallery' if images are not inside links.");
				showUserMessage("No gallery links found. Try 'Extract galleries (without links)' instead.", "error");

				// 🧹 Defensive memory cleanup
				if (Array.isArray(webGalleryCandidates)) webGalleryCandidates.length = 0;

			} catch (validationError) {
				logDebug(1, `⚠️ Cleanup error: ${validationError.message}`);
			} finally {
				// 🔓 Allow future extractions
				window.__mdi_extractLinkedGalleryRunning = false;
			}

			return;
		}
		
		// ✅ Use the validated and accepted gallery URLs
		const gallery = Array.isArray(webGalleryCandidates) ? [...webGalleryCandidates] : [];

		// 🚦 Stop execution if the final gallery is empty
		if (!gallery.length) {
			try {
				logDebug(1, "⛔ No valid image links found to process.");
				logDebug(2, "💡 Tip: The page may not contain valid web-linked images.");
				showUserMessage("No valid gallery images found. Try another extractor mode.", "error");

				// 🧹 Defensive cleanup
				if (Array.isArray(webGalleryCandidates)) webGalleryCandidates.length = 0;

			} catch (cleanupError) {
				logDebug(1, `⚠️ Cleanup error: ${cleanupError.message}`);
			} finally {
				// 🔓 Unlock flag for next attempt
				window.__mdi_extractLinkedGalleryRunning = false;
			}

			return;
		}

        // ✉️ Step 3: Send the grouped gallery images to the background script
        logDebug(1, '📤 Sending gallery to background for download/tab handling...');

        // 🔒 Step 3.1: Check for duplicates and limit the number of images sent
        try {
            if (!gallery.length) {
                logDebug(1, '⚠️ No valid images available to extract.');
                return;
            }
            
            // ✅ Ensure we deduplicate gallery URLs properly
			// 🔁 Previous version expected {url: "..."} objects. We're now working with direct string URLs.
			const uniqueGalleryUrls = [...new Set(gallery)];

            // 🔒 Step 3.1: Check for duplicates and limit the number of images sent
            chrome.runtime.sendMessage({
                action: "extractLinkedGallery",
                payload: {
                    images: uniqueGalleryUrls,
                    totalImages: uniqueGalleryUrls.length,
                    options: {
                        galleryMaxImages: galleryRateLimit,
                        extractGalleryMode: settings.extractGalleryMode
                    }
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    logDebug(2, `❌ Failed to send images: ${chrome.runtime.lastError.message}`);
                } else if (response?.success) {
                    logDebug(2, '✅ Images sent to background successfully.');
                } else {
                    logDebug(1, '⚠️ No response or process failed.');
                }
            
                logDebug(2, '✅ End: Extract Linked Gallery Process');
                logDebug(3, '----------------------------------------------------');
            
                // 🔒 Step 3.2: Reset running state
                window.__mdi_extractLinkedGalleryRunning = false;
            });         
        } catch (err) {
            logDebug(1, `❌ Exception while sending message: ${err.message}`);
            logDebug(2, '❌ End: Extract Linked Gallery Process (error)');
            logDebug(3, '----------------------------------------------------');

            // 🔒 Step 3.3: Reset running state
            window.__mdi_extractLinkedGalleryRunning = false;
        }
    }

    /**
     * 🧩 Load configuration from chrome.storage and initiate gallery extraction.
     * @description
     * This function retrieves the minimum width, height, and gallery rate limit from Chrome's storage.
     * If the values are invalid, it falls back to default values. It then calls the `extractLinkedGalley` function
     */
    function loadAndStart() {
        logDebug(1, '🔄 Loading configuration and starting extraction process...');
        chrome.storage.sync.get([
            "minWidth", "minHeight", "galleryMaxImages",
            "debugLogLevel", "allowJPG", "allowJPEG", "allowPNG", "allowWEBP", "allowAVIF", "allowBMP",
            "showUserFeedbackMessages"
        ], (data) => {
        
            // 🔒 Error handling for storage access
            if (chrome.runtime.lastError) {
                logDebug(2, `⚠ Failed to read config: ${chrome.runtime.lastError.message}`);
                showUserMessage("⚠ Could not load gallery settings.", "error");
                extractLinkedGalley({}); // fallback
                return;
            }
        
            try {
                currentLogLevel = parseInt(data.debugLogLevel ?? 1);
                minWidth = parseInt(data.minWidth) || minWidth;
                minHeight = parseInt(data.minHeight) || minHeight;
                galleryRateLimit = (data.galleryMaxImages >= 1 && data.galleryMaxImages <= 10)
                    ? data.galleryMaxImages
                    : galleryRateLimit;

                showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;    
        
                logDebug(2, `📐 Using resolution threshold: ${minWidth}x${minHeight}`);
                logDebug(2, `⚡ Using gallery rate limit (images/sec): ${galleryRateLimit}`);
                try {
                    const settings = {
                        minWidth: parseInt(data.minWidth ?? 300),
                        minHeight: parseInt(data.minHeight ?? 500),
                        galleryMaxImages: parseInt(data.galleryMaxImages ?? 5),
                        allowJPG: data.allowJPG !== false,
                        allowJPEG: data.allowJPEG !== false,
                        allowPNG: data.allowPNG !== false,
                        allowWEBP: data.allowWEBP !== false,
                        allowAVIF: data.allowAVIF !== false,
                        allowBMP: data.allowBMP !== false,
                        extractGalleryMode: data.extractGalleryMode ?? 'tab'
                    };
                    // 🖼️ Start the extraction process with the loaded settings                    
                    extractLinkedGalley(settings);                    
                } catch (e) {
                    logDebug(1, '❌ Unhandled exception in extractLinkedGalley:', e.message);
                    logDebug(2, `❌ Stacktrace: ${e.stack}`);
                    showUserMessage("⚠ Unexpected error during image extraction.", "error");
                }                
            } catch (error) {
                logDebug(1, `❌ Error applying gallery settings: ${error.message}`);
                showUserMessage("⚠ Invalid gallery settings.", "error");
                extractLinkedGalley({});
            }
        });
    }

    // 🚀 Start process
    loadAndStart();
})();
