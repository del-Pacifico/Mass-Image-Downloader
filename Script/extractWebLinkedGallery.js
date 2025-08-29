// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// extractWebLinkedGallery.js - Extract images from <a href="html"> with <img> thumbnail

// Immediately Invoked Function Expression (IIFE) to avoid global scope pollution
(function () {
    
    let debugLogLevelCache = 1;
    let showUserFeedbackMessagesCache = true;
    const allowedExtensions = [];
    let minGroupSizeCache = 3; // Default minimum group size for gallery detection

    // get some Extensions values from storage
    // and set the default values if not set
    // This is used to determine which image formats are allowed for gallery detection
    chrome.storage.sync.get(["debugLogLevel", "gallerySimilarityLevel", "showUserFeedbackMessages",
    "allowJPG", "allowJPEG", "allowPNG", "allowWEBP", "allowAVIF", "allowBMP", "galleryMinGroupSize"
    ], (data) => {
        debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
        const similarityThreshold = (data.gallerySimilarityLevel >= 30 && data.gallerySimilarityLevel <= 100)
            ? data.gallerySimilarityLevel
            : 70;

		showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;

        const allowJPG = data.allowJPG !== false;
        const allowJPEG = data.allowJPEG !== false;
        const allowPNG = data.allowPNG !== false;
        const allowWEBP = data.allowWEBP !== false;
        const allowAVIF = data.allowAVIF !== false;
        const allowBMP = data.allowBMP !== false;
        minGroupSizeCache = (data.galleryMinGroupSize >= 2 && data.galleryMinGroupSize <= 50)
            ? data.galleryMinGroupSize
            : 3;

        // Log for traceability
        logDebug(2, `🧰 Config → Min group size: ${minGroupSizeCache}`);    

        if (allowJPG) allowedExtensions.push("jpg");
        if (allowJPEG) allowedExtensions.push("jpeg");
        if (allowPNG) allowedExtensions.push("png");
        if (allowWEBP) allowedExtensions.push("webp");
        if (allowAVIF) allowedExtensions.push("avif");
        if (allowBMP) allowedExtensions.push("bmp");

        // Log debug information        
        logDebug(2, `📦 Allowed Extensions: ${JSON.stringify(allowedExtensions)}`);
        
        // Ensure JPG is always included if allowJPG is true
        if (!allowedExtensions.includes("jpg")) {
            logDebug(1, `⚠️ JPG not included despite allowJPG=true. Forcing inclusion...`);
            allowedExtensions.push("jpg");
        }
        logDebug(3, ``);
    
        logDebug(1, `🔗 Script injected: Extract Web-Linked Gallery`);
        logDebug(2, `🧠 Grouping threshold: ${similarityThreshold}%`);

        // Function to wait for anchors and run detection
        function waitForAnchorsAndRun(threshold, retries = 10, interval = 300) {
            let attempt = 0;

            const checker = setInterval(async () => {
                const found = document.querySelectorAll("a[href] img").length;
                logDebug(2, `🔁 Checking for gallery anchors... attempt ${attempt + 1}, found ${found}`);

                if (found > 0) {
                    clearInterval(checker);
                    logDebug(1, `🔍 Gallery anchor(s) detected. Proceeding with detection.`);
                    await runGalleryDetection(threshold);
                } else if (++attempt >= retries) {
                    clearInterval(checker);
                    logDebug(1, `⛔ No gallery anchors found after ${retries} attempts. Aborting.`);
                    showUserMessage("No gallery links detected on page. Try a different mode.", "error");
                }
            }, interval);
        }

        // Check if the document is fully loaded
        if (document.readyState === "complete") {
            waitForAnchorsAndRun(similarityThreshold);
        } else {
            window.addEventListener("load", () => {
                logDebug(1, "⏳ Waiting for full page load to detect gallery anchors...");
                waitForAnchorsAndRun(similarityThreshold);
            });
        }
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
	 * Displays a styled message to the user if enabled in settings.
	 * @param {string} text - The message to display.
	 * @param {string} [type="info"] - Message type: info or error.
	 */
	function showUserMessage(text, type = "info") {
		try {
			if (!showUserFeedbackMessagesCache) {
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
            logDebug(2, `🐛 Stack trace: ${error.stack}`);
		}
	}

    /**
    * Waits for an image to fully decode if needed.
    * @param {HTMLImageElement} img - The image element to wait for.
    * @returns {Promise<void>}
    */
    async function imageDecodeIfNeeded(img) {
        if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
            try {
                await img.decode();
            } catch (e) {
                logDebug(2, `⚠️ Image decode failed or unsupported for ${img.src}`);
                logDebug(3, `🐛 Stack trace: ${e.stack}`);
            }
        }
    }

    /**
     * Checks if a URL is a valid HTML link.
     * @param {string} url - The URL to check.
     * @return {boolean} True if the URL is a valid HTML link, false otherwise.
     * @description This function checks if a URL is a valid HTML link by:
     * 1. Validating the URL format.
     * 2. Rejecting well-known non-HTML resources (e.g., images, videos, archives).
     * 3. Accepting explicit HTML-like extensions (.html, .php, etc.).
     * 4. Accepting directory-like pages whose last segment has no dot (e.g., "/gallery/1234/").
     * It also handles edge cases like root paths and invalid URLs gracefully.
     * It logs debug information based on the user's log level settings.
     */ 
    function isHtmlLink(url) {
        // Validate input type
        if (!url || typeof url !== "string") return false;

        try {
            const parsed = new URL(url);
            const pathname = parsed.pathname.toLowerCase();

            // Reject well-known non-HTML resources
            const rejectedExtensions = /\.(jpg|jpeg|png|webp|gif|bmp|svg|ico|mp4|mp3|pdf|zip|rar|exe|bin)$/i;
            const acceptedExtensions = /\.(html?|php|asp[x]?)$/i;

            // Root path ("/" or empty) is not a detail page
            const isRoot = pathname === "/" || pathname.trim() === "";
            if (isRoot || rejectedExtensions.test(pathname)) return false;

            // Explicit HTML-like extensions are accepted
            if (acceptedExtensions.test(pathname)) return true;

            // Accept directory-like pages whose last non-empty segment has no dot
            // e.g., "/gallery/1234/" → segments ["gallery","1234"] → "1234" has no '.'
            const segments = pathname.split("/").filter(Boolean); // remove empty segments

            // Check if the last segment is a directory-like page
            if (segments.length > 0) {
                const lastSegment = segments[segments.length - 1];
                if (lastSegment && !lastSegment.includes(".")) return true;
            }

            // Otherwise, not considered an HTML page link
            return false;

        } catch (e) {
            logDebug(1, `⛔ Invalid URL while checking HTML: ${url}`);
            logDebug(2, `🐛 Stack trace: ${e.stack}`);
            return false;
        }
    }


    /**
     * Checks if a resolved URL is an external link.
     * @param {string} resolvedHref - The resolved URL to check.
     * @param {string} currentHostname - The current page's hostname.
     * @return {boolean} True if the link is external, false otherwise.
     * @description This function checks if a resolved URL is external by comparing its hostname
     * with the current page's hostname. It normalizes both hostnames to handle
     * variations like "www." and subdomains.
     * If the URL is invalid, it logs an error and treats it as external.
     */
    function isExternalLink(resolvedHref, currentHostname) {
        try {
            const urlHost = new URL(resolvedHref).hostname;

            // Normalize to handle www. and subdomains
            const stripWww = h => h.replace(/^www\./i, "").toLowerCase();
            return stripWww(urlHost) !== stripWww(currentHostname);
        } catch (err) {
            logDebug(2, `⚠️ Invalid URL while checking external link: ${resolvedHref}`);
            logDebug(3, `🐛 Stack trace: ${err.stack}`);
            return true; // treat invalid URL as external
        }
    }


    /**
     * Calculates the similarity between two URL paths.
     * @param {string} url1 - The first URL.
     * @param {string} url2 - The second URL.
     * @param {number} threshold - Similarity threshold (30–100).
     * @returns {number} Similarity percentage (0-100).
     * @description This function calculates the similarity between two URL paths.
     * It compares the characters in the paths of both URLs and returns a percentage
     * based on the number of matching characters.
     * The function uses the URL constructor to parse the URLs and extract their paths.
     * It handles errors gracefully and returns 0 if the URLs are invalid or cannot be parsed.
     * The similarity is calculated as the number of matching characters divided by the maximum length of the two paths.
     * It stops comparing at the first difference and returns the similarity as a percentage.
     */
    function calculatePathSimilarity(url1, url2, threshold) {
        try {
            const path1 = new URL(url1).pathname;
            const path2 = new URL(url2).pathname;
    
            const minLen = Math.min(path1.length, path2.length);
            let commonChars = 0;

            for (let i = 0; i < minLen; i++) {
                if (path1[i] === path2[i]) {
                    commonChars++;
                } else {
                    break;
                }
            }

            const maxLen = Math.max(path1.length, path2.length);
            const similarity = (commonChars / maxLen) * 100;

            // Extra filter: if similarity < threshold but commonChars < 3 segments → force reject
            if (similarity >= threshold && commonChars >= 3) {
                return similarity;
            }

            return 0;  // Force reject weak matches


        } catch (err) {
            logDebug(1, `❌ Error calculating similarity: ${err.message}`);
            logDebug(3, `🐛 Stack trace: ${err.stack}`);
            return 0;
        }
    }

    /**
     * Runs the gallery detection process.
     * @param {number} threshold - Similarity threshold (30–100).
     * @returns {Promise<void>}
     * @description This function detects web-linked galleries by finding <a> tags with <img> thumbnails.
     * It filters anchors by visual position, validates hrefs, and checks if the <img> tags are valid thumbnails.
     * It then groups candidates by path similarity and sends the dominant group to the background script.
     * It uses a robust visual filter to improve accuracy and handles various edge cases.
     * If no valid gallery links are found, it shows a user message and blocks further execution.
     * It also logs detailed debug information based on the user's log level settings.
     */
    async function runGalleryDetection(threshold) {
        try {

            logDebug(1, "🔗 Script injected: Extract Web-Linked Gallery");

            const results = [];

            // Telemetry counters for precise diagnostics
            let cntInvalidHref = 0;
            let cntExternal = 0;
            let cntNotHtml = 0;
            let cntDecorative = 0;
            let cntAccepted = 0;

            // 🔍 Scan all <a> elements containing <img> for gallery detection
            const anchors = Array.from(document.querySelectorAll("a[href]")).filter(a => a.querySelector("img"));
            logDebug(1, `🔍 Total <a><img> anchors scanned: ${anchors.length}`);

            logDebug(2, "🔍 BEGIN: Candidate detection and normalization...");


            // 🛠️ Normalize and validate each <a> tag
            // Loop through each anchor to process its href and <img> tag
            // 🖼️ Find the <img> tag inside the <a>
            for (const anchor of anchors) {
                try {
                    let href = anchor.getAttribute("href") || "";
                    let resolvedHref = "";

                    // Invalid href in <a>
                    try {
                        resolvedHref = new URL(href, location.href).href;
                    } catch (err) {
                        logDebug(2, `⛔ Invalid href in <a>: "${href}". Skipping anchor.`);
                        logDebug(3, `🐛 Stack trace: ${err.stack}`);
                        cntInvalidHref++;
                        continue; // do not abort whole detection, just skip this anchor
                    }

                    logDebug(3, ``);
                    logDebug(2, `🔗 Processing <a> tag: ${resolvedHref}`);

                    // Skip only if it's a true external domain
                    if (isExternalLink(resolvedHref, location.hostname)) {
                        const extHost = new URL(resolvedHref).hostname;
                        logDebug(2, `⛔ Skipped <a>: External domain detected (${extHost})`);
                        cntExternal++;
                        continue; // do not abort whole detection, just skip this anchor
                    }

                    // 🖼️ Find the <img> tag inside the <a>
                    const img = anchor.querySelector("img");

                    logDebug(3, "");
                    logDebug(2, `🔍 <a> tag href: ${href || "?"}`);
                    logDebug(2, `🔗 Processing <a> tag: ${resolvedHref || "?"}`);

                    logDebug(2, `🖼️ <img> tag found: ${img ? img.src : "No image"}`);

                    // Check if the <img> tag is valid
                    // and not a decorative image (e.g., 1x1 pixel, blank, etc.)
                    let isValidThumb = true;

                    // 🛠️ Validate <img> tag
                    if (!img) {
                        logDebug(2, `⛔ Skipped <a>: No <img> tag found.`);
                        isValidThumb = false;
                    } else if (!img.src && !img.getAttribute("data-src")) {
                        // 🛠️ Attempt to recover from <source srcset> if <img> has no src
                        const picture = img.closest("picture");
                        const source = picture ? picture.querySelector("source[srcset]") : null;

                        // If <img> has no src, try to recover it from <source>
                        if (source && source.getAttribute("srcset")) {
                            const firstSrc = source.getAttribute("srcset").split(",")[0].trim().split(" ")[0];
                            if (firstSrc) {
                                img.src = firstSrc;
                                logDebug(2, `🛠️ Recovered image src from <source>: ${img.src}`);
                            }
                        }

                        // Still missing src after fallback
                        if (!img.src) {
                            logDebug(2, `⛔ Skipped <a><img>: Missing src and data-src attributes (even after <source> fallback).`);
                            isValidThumb = false;
                        }
                    }
                    else if (img.src.startsWith("data:")) {
                        logDebug(2, `⛔ Skipped <a><img>: Data URI detected.`);
                        isValidThumb = false;
                    } else if (/1px\.|spacer|blank|sprite|icon/i.test(img.src) || img.naturalWidth <= 2 || img.naturalHeight <= 2) {
                        // 🩹 Try to replace placeholder/1px with a lazy source before discarding
                        const lazySrc =
                            img.getAttribute("data-src") ||
                            img.dataset.src ||
                            img.getAttribute("data-lazy") ||
                            img.getAttribute("data-lazy-src") ||
                            img.getAttribute("data-original");

                        if (lazySrc) {
                            try {
                                // Normalize relative lazySrc against document location
                                const resolvedLazy = new URL(lazySrc, location.href).href;
                                logDebug(2, `🩹 Placeholder detected. Switching to lazy source: ${resolvedLazy}`);
                                img.src = resolvedLazy;

                                // Ensure the image is decoded before size/usage
                                await imageDecodeIfNeeded(img);
                                logDebug(2, `✅ Placeholder replaced; using thumbnail: ${img.src}`);

                                // Keep isValidThumb = true to allow this candidate
                            } catch (lazyErr) {
                                logDebug(2, `⛔ Failed to apply lazy source: ${lazyErr.message}`);
                                logDebug(3, `🐛 Stack trace: ${lazyErr.stack}`);
                                isValidThumb = false;
                            }
                        } else {
                            logDebug(2, `⛔ Skipped <a><img>: Decorative/placeholder and no lazy source found.`);
                            isValidThumb = false;
                        }
                    } else {
                        await imageDecodeIfNeeded(img);  // ✅ Ensure image is fully loaded
                        logDebug(2, `📌 Skipping dimension check. Accepting thumbnail: ${img.src}`);
                    }
                
                    // Check if the resolved href is a valid HTML link
                    // and not an image or resource link
                    // Also check if the <img> is not decorative (e.g., 1x1 pixel, blank, etc.)
                    const isHtml = resolvedHref ? isHtmlLink(resolvedHref) : false;
                    if (isValidThumb && resolvedHref && isHtml) {

                        // If the <img> tag has no src, try to recover it from data-src
                        if (!img.src && img.dataset.src) {
                            img.src = img.dataset.src;
                            logDebug(2, `🩹 Recovered image src from data-src: ${img.src}`);
                        }

                        let ext = "";
                        try {
                            const urlObj = new URL(img.src);
                            const pathname = urlObj.pathname.split("?")[0]; // remove query params
                            const lastSegment = pathname.split("/").pop();
                            ext = (lastSegment.includes(".") ? lastSegment.split(".").pop() : "").toLowerCase();

                            if (!ext) {
                                logDebug(2, `⛔ No extension detected in thumbnail: ${img.src}`);
                            }

                        } catch (e) {
                            logDebug(2, `⛔ Invalid thumbnail image URL: ${img.src}`);
                            logDebug(3, `🐛 Stack trace: ${e.stack}`);
                        }

                        // Accept all thumbnails regardless of extension
                        if (!ext) {
                            logDebug(2, `⚠️ No extension detected in thumbnail. Accepting image: ${img.src}`);
                        } else {
                            logDebug(2, `📌 Skipping extension check. Accepting thumbnail with .${ext}`);
                        }

                        // Push the resolved href and thumbnail to results
                        logDebug(2, `✅ Valid <a><img> found!`);
                        try {
                            if (resolvedHref && img?.src) {
                                results.push({ url: resolvedHref, thumb: img.src });
                                cntAccepted++;
                            } else {
                                logDebug(2, `⛔ Skipped <a><img>: Missing href or src before pushing to results.`);
                                cntDecorative++; // treat as invalid visual
                            }
                        } catch (err) {

                            logDebug(2, `❌ Exception while pushing to results: ${err.message}`);
                            logDebug(3, `🐛 Stacktrace: ${err.stack}`);
                        }
                    } else {
                        // Distinguish non-HTML vs decorative
                        if (!isHtml && resolvedHref) {
                            cntNotHtml++;
                            logDebug(3, `⛔ Skipped non-HTML link: ${resolvedHref}`);
                        } else {
                            cntDecorative++;
                            logDebug(3, `⛔ Skipped non-visual/decorative <a><img>: ${resolvedHref || "?"}`);
                        }
                    }
                } catch (e) {
                    logDebug(1, `❌ Unexpected error while processing anchor: ${e.message}`);
                    logDebug(2, `🐛 Stack trace: ${e.stack}`);
                }
            }

            // Clear, unambiguous summary for diagnostics
            logDebug(1, `🎯 Total valid <a><img> gallery candidates: ${results.length}`);
            // Promote diagnostics to level 1 so users always see why nothing happened
            logDebug(1, `📊 Diagnostics → accepted: ${cntAccepted}, invalidHref: ${cntInvalidHref}, external: ${cntExternal}, notHtml: ${cntNotHtml}, decorative: ${cntDecorative}`);

            // 🚦 If no web-linked <a><img> images found → fall back to Visual Gallery mode
            if (results.length === 0) {
                try {
                    logDebug(1, "⛔ No <a><img> gallery links detected. Falling back to Visual Gallery mode.");
                    showUserMessage("No web-linked gallery found. Falling back to 'Extract galleries (without links)'.", "error");

                    // 🔁 Ask background to trigger Visual Gallery flow
                    try {
                        chrome.runtime.sendMessage({ action: "extractVisualGallery" }, () => {
                            logDebug(1, "📨 Fallback request sent to background: extractVisualGallery");
                        });
                    } catch (fallbackErr) {
                        logDebug(1, `❌ Failed to request Visual Gallery fallback: ${fallbackErr.message}`);
                    }

                } catch (validationError) {
                    logDebug(1, `⚠️ Cleanup error: ${validationError.message}`);
                    logDebug(2, `🐛 Stack trace: ${validationError.stack}`);
                } finally {
                    // 🔚 Block this script's execution (handover to visual mode)
                    return;
                }
            }

            // ✅ Grouping candidates by path similarity using exhaustive pair comparison
            logDebug(2, "🧠 BEGIN: Gallery grouping based on path similarity...");

            const groups = [];

            // 🔧 Determine dinamic commonPrefix
            const paths = results.map(r => new URL(r.url).pathname);
            let commonPrefix = "";

            if (paths.length > 0) {
                const refSegments = paths[0].split("/").filter(Boolean);
                for (let i = 0; i < refSegments.length; i++) {
                    const candidate = refSegments.slice(0, i+1).join("/");
                    if (paths.every(p => p.includes(candidate))) {
                        commonPrefix = `/${candidate}`;
                    } else {
                        break;
                    }
                }
            }

            // 🚦 Filter results by common prefix
            // ⬆️ Skipping commonPrefix filtering. Proceeding with full similarity analysis.
            logDebug(2, `🧠 Skipping commonPrefix filtering. Proceeding with full similarity analysis.`);

            // 🚦 Validate threshold
            for (let i = 0; i < results.length; i++) {
                const base = results[i];
                if (!base || typeof base.url !== "string" || base.url.length === 0) {
                    logDebug(2, `⚠️ Skipped base at index ${i} due to invalid url`);
                    continue;
                }

                const group = [base];

                for (let j = 0; j < results.length; j++) {
                    if (i === j) continue;

                    const compare = results[j];
                    if (!compare || typeof compare.url !== "string" || compare.url.length === 0) {
                        logDebug(2, `⚠️ Skipped compare at index ${j} due to invalid url`);
                        continue;
                    }

                    const sim = calculatePathSimilarity(base.url, compare.url, threshold);

                    logDebug(3, `🔍 Similarity between:\n   Base: ${base.url}\n   Compare: ${compare.url}\n   → ${sim.toFixed(1)}%`);

                    const seg1 = new URL(base.url).pathname.split("/").filter(Boolean);
                    const seg2 = new URL(compare.url).pathname.split("/").filter(Boolean);
                    const sameStructure = seg1.length === seg2.length &&
                        seg1[0] === seg2[0] &&
                        /^[a-zA-Z]*\d+$/.test(seg1[1] || "") &&
                        /^[a-zA-Z]*\d+$/.test(seg2[1] || "");

                    // Accept if similarity meets the threshold,
                    // or (edge-case) if structure matches AND similarity is still reasonably high
                    const allowByStructure = sameStructure && sim >= Math.max(50, threshold - 10);
                    if (sim >= threshold || allowByStructure) {
                        group.push(compare);
                    }
                }

                if (group.length > 1) {
                    groups.push(group);
                }
            }


            // ✅ Select group with highest cardinality
            let dominantGroup = [];
            groups.forEach(g => {
                if (g.length > dominantGroup.length) dominantGroup = g;
            });

            logDebug(1, `🎯 Dominant group size: ${dominantGroup.length}`);
            dominantGroup.forEach((item, i) => logDebug(2, `🔗 Group [${i+1}]: ${item.url}`));

            if (dominantGroup.length === 0) {
                logDebug(1, "⚠️ No dominant group found. Aborting.");
                showUserMessage("No dominant image group found. Try adjusting similarity or using fallback mode.", "error");
                return;
            }

            try {
                if (!dominantGroup || dominantGroup.length === 0) {
                    logDebug(1, "⛔ Dominant group is empty. Aborting message send.");
                    return;
                }
            
                const urlsToSend = dominantGroup.map(item => item.url).filter(Boolean);
            
                if (urlsToSend.length === 0) {
                    logDebug(1, "⛔ No valid URLs to send. Aborting.");
                    return;
                }

                // 🚦 Validate minimum group size
                if (dominantGroup.length < minGroupSizeCache) {
                    logDebug(1, `⛔ Not enough candidates in dominant group. Minimum required: ${minGroupSizeCache}, found ${dominantGroup.length}`);
                    showUserMessage("Not enough similar links found to form a gallery. Try another mode or tweak the settings.", "error");
                    return;
                }

                logDebug(2, `🧠 END: Gallery grouping. Dominant group size: ${dominantGroup.length}`);
            
                // Send the URLs to the background script
                logDebug(1, "📤 BEGIN: Sending gallery URLs to background...");

                // Use chrome.runtime.sendMessage to communicate with the background script
                chrome.runtime.sendMessage(
                {
                    action: "processWebLinkedGallery",
                    images: urlsToSend
                },
                (response) => {
                    // Handle response from background script
                    logDebug(2, "📤 Processing response from background script.");

                    // ✅ MV3-safe: classify ephemeral lastError and avoid alarming the user
                    const err = chrome.runtime.lastError;
                    if (err) {
                        // Identify ephemeral MV3 timing errors where the background likely processed the message
                        const msg = (err.message || "").toLowerCase();
                        const isEphemeral =
                            msg.includes("message port closed before a response was received") ||
                            msg.includes("context invalidated") ||
                            msg.includes("extension context invalidated") ||
                            msg.includes("service worker") ||
                            msg.includes("receiving end does not exist");

                        if (isEphemeral) {
                            // Soft-log only; do not show error balloon to the user
                            logDebug(2, `ℹ️ Ignoring MV3 ephemeral error: ${err.message}`);
                            // Provide positive UX because the background most likely received the message
                            showUserMessage("Gallery detected and sent for processing!", "success");
                        } else {
                            // Real error: surface it to the user
                            logDebug(1, `❌ Background communication error: ${err.message}`);
                            showUserMessage("Failed to communicate with background script. Try again.", "error");
                        }

                        logDebug(1, "📤 END: Message exchange with background completed.");
                        return; // Exit after handling lastError
                    }

                    // No lastError: trust the structured response when present
                    if (response?.success) {
                        logDebug(2, "✅ Background script confirmed gallery processing.");
                        showUserMessage("Gallery detected and sent for processing!", "success");
                    } else {
                        const errorMsg = response?.error || "Unknown response from background.";
                        logDebug(2, `⚠️ Background rejected gallery request: ${errorMsg}`);
                        showUserMessage(`Gallery not processed: ${errorMsg}`, "error");
                    }

                    logDebug(1, "📤 END: Message exchange with background completed.");
                }
            );


                logDebug(1, "📤 END: Background script notified.");

                // Show user feedback message
                logDebug(1, "✅ Web-linked gallery extraction process completed.");

            } catch (err) {
                logDebug(1, `❌ Exception while sending gallery candidates: ${err.message}`);
                logDebug(2, `🐛 Stacktrace: ${err.stack}`);
            }

        } catch (err) {
            logDebug(1, `💥 Unhandled error in gallery detection: ${err.message}`);
            logDebug(2, `🐛 Stack trace: ${err.stack}`);
            showUserMessage("Gallery detection failed due to unexpected error.", "error");
        } finally {
            // Defensive cleanup removed: "results" is block-scoped inside try and must not be referenced here.
            logDebug(1, "🔚 END: Extract Web-Linked Gallery script.");
        }      
    }
})();
