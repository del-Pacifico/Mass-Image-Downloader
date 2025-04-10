// extractGallery.js - Extract Gallery Images Functionality

console.log("[Mass image downloader]: 🧩 Extract Gallery script injected.");

import { isAllowedImageFormat, calculatePathSimilarity } from "./utils.js";

(function () {
    // 🔒 Prevent multiple simultaneous executions
    if (window.__mdi_extracting) {
        console.warn("[Mass image downloader]: ⏳ Extract process already running. Skipping duplicate execution.");
        return;
    }
    window.__mdi_extracting = true;

    let batchSize = 3; // 🔄 Max images per batch (configurable via storage)
    let minWidth = 300;
    let minHeight = 300;

    /**
     * Logs debug messages if debugging is enabled.
     * @param {string} message - The message to log.
     */
    function logDebug(message) {
        try {
            chrome.storage.sync.get(["debugLogging"], (data) => {
                if (chrome.runtime.lastError) {
                    console.warn(`[Mass image downloader]: ⚠ Error accessing debugLogging: ${chrome.runtime.lastError.message}`);
                } else if (data.debugLogging) {
                    console.log(`[Mass image downloader]: ${message}`);
                }
            });
        } catch (error) {
            console.warn(`[Mass image downloader]: ❌ Exception in logDebug: ${error.message}`);
        }
    }

    /**
     * Updates the badge count for opened images.
     * @param {number} count - The number of images processed.
     * @param {boolean} isComplete - Whether the process is finished.
     */
    function updateBadge(count, isComplete = false) {
        try {
            chrome.runtime.sendMessage({ action: "updateBadge", count, complete: isComplete });
        } catch (error) {
            console.log(`[Mass image downloader]: ❌ Failed to update badge: ${error.message}`);
        }
    }

    /**
     * Determines if a given URL is a valid image.
     * @param {string} url - The URL to check.
     * @returns {boolean} - True if the URL is an image, false otherwise.
     */


    /**
     * Displays a styled message to the user if no images are found.
     * @param {string} messageText - The message to display.
     */
    function showUserMessage(messageText) {
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log(`[Mass image downloader]: 📢 Message to user: ${messageText}`);

        try {
            const message = document.createElement("div");
            message.textContent = messageText;
            message.style.position = "fixed";
            message.style.top = "20px";
            message.style.right = "20px";
            message.style.backgroundColor = "#d9534f";
            message.style.color = "#FFFFFF";
            message.style.padding = "12px";
            message.style.borderRadius = "6px";
            message.style.fontSize = "14px";
            message.style.boxShadow = "2px 2px 8px rgba(0, 0, 0, 0.3)";
            message.style.opacity = "1";
            message.style.transition = "opacity 0.5s ease-in-out";
            message.style.zIndex = "9999";
            document.body.appendChild(message);

            setTimeout(() => {
                message.style.opacity = "0";
                setTimeout(() => message.remove(), 500);
            }, 3000);
        } catch (error) {
            console.log(`[Mass image downloader]: ❌ Error displaying user message: ${error.message}`);
        }
    }

    /**
     * Finds all anchor elements with hrefs.
     * @returns {NodeList}
     */
    function getAnchorElements() {
        try {
            return document.querySelectorAll("a[href]");
        } catch (error) {
            console.log(`[Mass image downloader]: ❌ Failed to query anchor elements: ${error.message}`);
            return [];
        }
    }

    /**
     * Tries to parse anchor element into image URL.
     * @param {HTMLElement} anchor
     * @returns {string|null}
     */
    function parseAnchorToImageUrl(anchor) {
        try {
            const href = anchor.getAttribute("href");
            if (href && isValidImageUrl(href)) {
                return href;
            } else {
                return null;
            }
        } catch (error) {
            console.log(`[Mass image downloader]: ⚠️ Error parsing anchor href: ${error.message}`);
            return null;
        }
    }

    /**
     * Removes duplicate image URLs.
     * @param {Array} urls
     * @returns {Array}
     */
    function deduplicateUrls(urls) {
        return [...new Set(urls)];
    }

    /**
     * 📦 Main entry point to extract gallery images
     */
    async function extractGalleryImages(settings) {
        console.log('[Mass image downloader]: ----------------------------------------------------');
        console.log('[Mass image downloader]: 🌄 Begin: Extract Gallery Images Process');

    // 🔍 Step 1: Collect all <img> elements and map them with size metadata
        const allImages = Array.from(document.querySelectorAll('img'))
            .map(img => ({
                url: img.src,
                width: img.naturalWidth,
                height: img.naturalHeight
            }))
            .filter(img => img.url);

        const validatedImages = [];

        for (const img of allImages) {
            try {
                const allowed = await isAllowedImageFormat(img.url);
                if (allowed) {
                    validatedImages.push(img);
                    logDebug(`✅ Image allowed: ${img.url}`);
                } else {
                    logDebug(`⛔ Skipped image: ${img.url}`);
                }
            } catch (e) {
                console.log(`[Mass image downloader]: ❌ Error validating image: ${e.message}`);
            }
        }

        if (!validatedImages.length) {
            console.log('[Mass image downloader]: ⚠️ No valid images found.');
            console.log('[Mass image downloader]: ❌ End: Extract Gallery Images Process (no input)');
            console.log('[Mass image downloader]: ----------------------------------------------------');
            return;
        }

        // 📏 Step 2: Filter images that do not meet the minimum size requirements
        const minW = settings.minWidth || 800;
        const minH = settings.minHeight || 600;

        console.log(`[Mass image downloader]: 📐 Applying minimum size filter: ${minW}x${minH}`);
        const filtered = validatedImages.filter(img => img.width >= minW && img.height >= minH);

        if (!filtered.length) {
            console.log('[Mass image downloader]: ⚠️ No images meet the minimum size requirements.');
            console.log('[Mass image downloader]: ❌ End: Extract Gallery Images Process (no matches)');
            console.log('[Mass image downloader]: ----------------------------------------------------');
            return;
        }

        // 🔗 Step 3: Group similar images using URL path similarity
        const similarityLevel = settings.pathSimilarityLevel || 90;

        console.log(`[Mass image downloader]: 🔗 Grouping similar images by path similarity >= ${similarityLevel}%`);
        const gallery = [];
        const visited = new Set();

        for (let i = 0; i < filtered.length; i++) {
            if (visited.has(i)) continue;
            const base = filtered[i];

            for (let j = i + 1; j < filtered.length; j++) {
                if (visited.has(j)) continue;

                const comparison = filtered[j];
                const similarity = calculatePathSimilarity(base.url, comparison.url);

                if (similarity >= similarityLevel) {
                    // ✅ Log matched gallery candidate with full trace
                    console.log(`[Mass image downloader]: 🖼️ Gallery image detected:`);
                    console.log(`[Mass image downloader]: └─ File: ${comparison.url.split('/').pop()}`);
                    console.log(`[Mass image downloader]: └─ URL : ${comparison.url}`);

                    gallery.push(comparison);
                    visited.add(i);
                    visited.add(j);
                    break;
                }
            }
        }

        if (!gallery.length) {
            console.log('[Mass image downloader]: ⚠️ No gallery images matched similarity criteria.');
            console.log('[Mass image downloader]: ❌ End: Extract Gallery Images Process (no gallery)');
            console.log('[Mass image downloader]: ----------------------------------------------------');
            return;
        }

        console.log(`[Mass image downloader]: ✅ Grouped gallery images: ${gallery.length}`);

        // ✉️ Step 4: Send the grouped gallery images to the background script
        console.log('[Mass image downloader]: 📤 Sending gallery to background for download/tab handling...');

        try {
            chrome.runtime.sendMessage({
                action: "openGalleryImages",
                images: gallery.map(img => img.url),
                totalImages: gallery.length,
                extractGalleryMode: settings.extractGalleryMode
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log(`[Mass image downloader]: ❌ Failed to send images: ${chrome.runtime.lastError.message}`);
                } else if (response?.success) {
                    console.log('[Mass image downloader]: ✅ Images sent to background successfully.');
                } else {
                    console.log('[Mass image downloader]: ⚠️ No response or process failed.');
                }

                console.log('[Mass image downloader]: ✅ End: Extract Gallery Images Process');
                console.log('[Mass image downloader]: ----------------------------------------------------');
            });
        } catch (err) {
            console.log(`[Mass image downloader]: ❌ Exception while sending message: ${err.message}`);
            console.log('[Mass image downloader]: ❌ End: Extract Gallery Images Process (error)');
            console.log('[Mass image downloader]: ----------------------------------------------------');
        }
    }

    /**
     * 🧩 Load configuration from chrome.storage and initiate gallery extraction.
     */
    function loadAndStart() {
        try {
            chrome.storage.sync.get(["minWidth", "minHeight", "galleryMaxImages", "pathSimilarityLevel"], (data) => {
                if (chrome.runtime.lastError) {
                    console.warn(`[Mass image downloader]: ⚠ Failed to read config: ${chrome.runtime.lastError.message}`);
                    extractGalleryImages({}); // ⛑️ Fallback with empty settings
                } else {
                    minWidth = parseInt(data.minWidth) || minWidth;
                    minHeight = parseInt(data.minHeight) || minHeight;
                    batchSize = (data.galleryMaxImages >= 1 && data.galleryMaxImages <= 10)
                        ? data.galleryMaxImages
                        : batchSize;

                    console.log(`[Mass image downloader]: 📐 Using resolution threshold: ${minWidth}x${minHeight}`);
                    console.log(`[Mass image downloader]: 🚚 Using batch size (galleryMaxImages): ${batchSize}`);
                    extractGalleryImages(data); // ✅ Pass settings as object
                }
            });
        } catch (error) {
            console.log(`[Mass image downloader]: ❌ Failed to load configuration: ${error.message}`);
            extractGalleryImages({}); // ⛑️ Fallback if exception thrown
        }
    }

    // 🚀 Start process
    loadAndStart();
})();
