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
    let toastMinVisibleMsCache = 2000; // Default minimum visible time for toast (ms)
    const allowedExtensions = [];
    let minGroupSizeCache = 3; // Default minimum group size for gallery detection

    const triggerSource = window.__mdiWebLinkedTriggerSource || "popup";
    logDebug(1, `🧭 Trigger source: ${triggerSource}`);

    // get some Extensions values from storage
    // and set the default values if not set
    // This is used to determine which image formats are allowed for gallery detection
    chrome.storage.sync.get(["debugLogLevel", "gallerySimilarityLevel", "showUserFeedbackMessages", "toastMinVisibleMs",
    "allowJPG", "allowJPEG", "allowPNG", "allowWEBP", "allowAVIF", "allowBMP", "galleryMinGroupSize"
    ], (data) => {
        debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
        const similarityThreshold = (data.gallerySimilarityLevel >= 30 && data.gallerySimilarityLevel <= 100)
            ? data.gallerySimilarityLevel
            : 70;

		showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;

        const rawToastMinVisibleMs = parseInt(data.toastMinVisibleMs ?? 2000, 10);
        toastMinVisibleMsCache = (!isNaN(rawToastMinVisibleMs) && rawToastMinVisibleMs >= 0 && rawToastMinVisibleMs <= 10000)
            ? rawToastMinVisibleMs
            : 2000;

        logDebug(2, `⏱️ Config → Toast minimum visible time (ms): ${toastMinVisibleMsCache}`);

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
                logDebug(2, "🚫 User feedback messages disabled. Skipping display.");
                return;
            }

            const safeText = (typeof text === "string") ? text.trim() : String(text || "").trim();
            if (!safeText) return;

            // ✅ Normalize to MID standard
            const finalText = safeText.startsWith("MID:") ? safeText : `MID: ${safeText}`;

            const baseDuration = (type === "error") ? 10000 : 5000;
            const minVisibleMs = Math.max(0, parseInt(toastMinVisibleMsCache ?? 2000, 10) || 2000);
            const effectiveDuration = Math.max(baseDuration, minVisibleMs);
            const backgroundColor = (type === "error") ? "#d9534f" : "#007EE3";

            // ✅ Toast engine: last toast wins + optional minimum visible time (prevents fast overlap)
            const TOAST_ID = "mdi-user-toast";
            const TIMER_KEY = "__mdiUserToastTimer";
            const MINUNTIL_KEY = "__mdiUserToastMinUntil";
            const DEFER_KEY = "__mdiUserToastDeferTimer";
            const PENDING_KEY = "__mdiUserToastPending";

            // ✅ Defer replacement if current toast must remain visible for the minimum time
            try {
                const now = Date.now();
                const minUntil = window[MINUNTIL_KEY] || 0;

                if (minVisibleMs > 0 && now < minUntil) {
                    window[PENDING_KEY] = { text: finalText, type };

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

            // 🧱 Defensive: DOM may not be ready
            if (!document?.body) {
                logDebug(2, "⚠️ document.body not available. Toast skipped.");
                return;
            }

            const messageElement = document.createElement("div");
            messageElement.id = TOAST_ID;
            messageElement.textContent = finalText;
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

            logDebug(2, `📢 Showing user message: "${finalText}" (${type})`);

            // ✅ Store timer id so the next toast can cancel it
            window[TIMER_KEY] = setTimeout(() => {
                messageElement.style.opacity = "0";
                setTimeout(() => {
                    try {
                        messageElement.remove();
                    } catch (removeError) {
                        logDebug(1, `⚠️ Error removing message element: ${removeError.message}`);
                    }
                }, 500);
                window[TIMER_KEY] = null;
            }, effectiveDuration);
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
     * Extracts the last meaningful path segment from a URL pathname.
     * @param {string} pathname - The pathname portion of a URL.
     * @returns {string} The last non-empty path segment.
     */
    function getLastPathSegment(pathname) {
        try {
            const segments = String(pathname || "").split("/").filter(Boolean);
            return segments.length ? segments[segments.length - 1] : "";
        } catch (err) {
            logDebug(2, `⚠️ Failed to extract last path segment: ${err.message}`);
            return "";
        }
    }

    /**
     * Normalizes a gallery slug to compare sequence-based detail pages safely.
     * Examples:
     * - "patritcy-00.html" -> "patritcy"
     * - "gallery_01.php"   -> "gallery"
     * - "set123-004.asp"   -> "set123"
     * @param {string} segment - Raw last path segment.
     * @returns {string} A normalized slug base used for structural comparison.
     */
    function normalizeGallerySlug(segment) {
        try {
            const safeSegment = String(segment || "").toLowerCase().trim();

            if (!safeSegment) return "";

            // Remove query/hash fragments if any leaked in
            const cleanSegment = safeSegment.split("#")[0].split("?")[0];

            // Remove common HTML-like extensions
            const noExt = cleanSegment.replace(/\.(html?|php|asp|aspx)$/i, "");

            // Remove trailing sequence tokens such as -01, _02, 003
            const noSequence = noExt
                .replace(/([_-]?\d{1,4})$/i, "")
                .replace(/([_-]?(page|img|image|pic|photo|set)[_-]?\d{1,4})$/i, "");

            // Normalize separators and trim leftovers
            const normalized = noSequence
                .replace(/[_-]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .trim();

            return normalized || noExt || cleanSegment;
        } catch (err) {
            logDebug(2, `⚠️ Failed to normalize gallery slug: ${err.message}`);
            return "";
        }
    }

    /**
     * Calculates a simple token overlap score between two normalized strings.
     * @param {string} a - First normalized value.
     * @param {string} b - Second normalized value.
     * @returns {number} Similarity score from 0 to 100.
     */
    function calculateTokenSimilarity(a, b) {
        try {
            const left = String(a || "").toLowerCase().split(/[-_]+/).filter(Boolean);
            const right = String(b || "").toLowerCase().split(/[-_]+/).filter(Boolean);

            if (!left.length || !right.length) return 0;

            const leftSet = new Set(left);
            const rightSet = new Set(right);

            let matches = 0;
            for (const token of leftSet) {
                if (rightSet.has(token)) matches++;
            }

            const maxSize = Math.max(leftSet.size, rightSet.size);
            return maxSize > 0 ? (matches / maxSize) * 100 : 0;
        } catch (err) {
            logDebug(2, `⚠️ Failed to calculate token similarity: ${err.message}`);
            return 0;
        }
    }

    /**
     * Checks whether two URLs follow the same structural gallery pattern.
     * @param {string} url1 - First candidate URL.
     * @param {string} url2 - Second candidate URL.
     * @returns {boolean} True when both URLs look like part of the same gallery sequence.
     */
    function isSameGalleryStructure(url1, url2) {
        try {
            const parsed1 = new URL(url1);
            const parsed2 = new URL(url2);

            if (parsed1.hostname !== parsed2.hostname) return false;

            const segments1 = parsed1.pathname.split("/").filter(Boolean);
            const segments2 = parsed2.pathname.split("/").filter(Boolean);

            if (!segments1.length || !segments2.length) return false;

            const dir1 = segments1.slice(0, -1).join("/");
            const dir2 = segments2.slice(0, -1).join("/");

            if (dir1 !== dir2) return false;

            const last1 = getLastPathSegment(parsed1.pathname);
            const last2 = getLastPathSegment(parsed2.pathname);

            const base1 = normalizeGallerySlug(last1);
            const base2 = normalizeGallerySlug(last2);

            if (!base1 || !base2) return false;

            return base1 === base2;
        } catch (err) {
            logDebug(2, `⚠️ Failed to compare gallery structure: ${err.message}`);
            return false;
        }
    }

    /**
     * Calculates similarity between two candidate URLs.
     * This version is sequence-aware and avoids false negatives on gallery detail pages.
     * @param {string} url1 - The first URL.
     * @param {string} url2 - The second URL.
     * @param {number} threshold - Similarity threshold (30–100).
     * @returns {number} Similarity percentage (0-100).
     */
    function calculatePathSimilarity(url1, url2, threshold) {
        try {
            const parsed1 = new URL(url1);
            const parsed2 = new URL(url2);

            if (parsed1.hostname !== parsed2.hostname) {
                return 0;
            }

            const segments1 = parsed1.pathname.split("/").filter(Boolean);
            const segments2 = parsed2.pathname.split("/").filter(Boolean);

            if (!segments1.length || !segments2.length) {
                return 0;
            }

            const dir1 = segments1.slice(0, -1).join("/");
            const dir2 = segments2.slice(0, -1).join("/");

            const sameDirectory = dir1 === dir2;

            const last1 = getLastPathSegment(parsed1.pathname);
            const last2 = getLastPathSegment(parsed2.pathname);

            const normalized1 = normalizeGallerySlug(last1);
            const normalized2 = normalizeGallerySlug(last2);

            const exactNormalizedMatch = normalized1 && normalized2 && normalized1 === normalized2;
            const tokenSimilarity = calculateTokenSimilarity(normalized1, normalized2);

            let score = 0;

            if (sameDirectory) score += 35;
            if (segments1.length === segments2.length) score += 10;
            if (exactNormalizedMatch) score += 55;
            else score += Math.min(55, tokenSimilarity * 0.55);

            // Clamp to 0..100
            score = Math.max(0, Math.min(100, score));

            logDebug(
                3,
                `🧪 Similarity diagnostics → dirMatch=${sameDirectory}, exactBase=${exactNormalizedMatch}, tokenSimilarity=${tokenSimilarity.toFixed(1)}%, final=${score.toFixed(1)}%`
            );

            // Return the real score. Do not force 0 here.
            return score;
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
                    showUserMessage('Web-linked gallery found no valid candidates. Falling back to "Visual gallery (no links)".', "error");

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

            /**
             * Builds similarity groups from candidate results.
             * @param {Array<{url:string, thumb:string}>} candidates - Accepted gallery candidates.
             * @param {number} similarityThreshold - Current threshold used for grouping.
             * @returns {Array<Array<{url:string, thumb:string}>>} Candidate groups.
             */
            function buildGroups(candidates, similarityThreshold) {
                const builtGroups = [];

                for (let i = 0; i < candidates.length; i++) {
                    const base = candidates[i];

                    if (!base || typeof base.url !== "string" || base.url.length === 0) {
                        logDebug(2, `⚠️ Skipped base at index ${i} due to invalid url.`);
                        continue;
                    }

                    const group = [base];
                    const seenUrls = new Set([base.url]);

                    for (let j = 0; j < candidates.length; j++) {
                        if (i === j) continue;

                        const compare = candidates[j];
                        if (!compare || typeof compare.url !== "string" || compare.url.length === 0) {
                            logDebug(2, `⚠️ Skipped compare at index ${j} due to invalid url.`);
                            continue;
                        }

                        const similarity = calculatePathSimilarity(base.url, compare.url, similarityThreshold);
                        const sameStructure = isSameGalleryStructure(base.url, compare.url);
                        const allowByStructure = sameStructure && similarity >= Math.max(45, similarityThreshold - 15);

                        logDebug(
                            3,
                            `🔍 Similarity between:\n   Base: ${base.url}\n   Compare: ${compare.url}\n   → ${similarity.toFixed(1)}% | sameStructure=${sameStructure} | allowByStructure=${allowByStructure}`
                        );

                        if ((similarity >= similarityThreshold || allowByStructure) && !seenUrls.has(compare.url)) {
                            group.push(compare);
                            seenUrls.add(compare.url);
                        }
                    }

                    if (group.length > 1) {
                        builtGroups.push(group);
                    }
                }

                return builtGroups;
            }

            /**
             * Builds structural groups as a defensive fallback when similarity grouping is too strict.
             * @param {Array<{url:string, thumb:string}>} candidates - Accepted gallery candidates.
             * @returns {Array<Array<{url:string, thumb:string}>>} Candidate groups.
             */
            function buildStructuralFallbackGroups(candidates) {
                const bucketMap = new Map();

                for (const candidate of candidates) {
                    try {
                        if (!candidate || !candidate.url) continue;

                        const parsed = new URL(candidate.url);
                        const segments = parsed.pathname.split("/").filter(Boolean);
                        const directory = segments.slice(0, -1).join("/");
                        const slugBase = normalizeGallerySlug(getLastPathSegment(parsed.pathname));

                        if (!slugBase) {
                            logDebug(2, `⚠️ Structural fallback skipped candidate without slug base: ${candidate.url}`);
                            continue;
                        }

                        const bucketKey = `${parsed.hostname}|${directory}|${slugBase}`;

                        if (!bucketMap.has(bucketKey)) {
                            bucketMap.set(bucketKey, []);
                        }

                        const bucket = bucketMap.get(bucketKey);
                        if (!bucket.some(item => item.url === candidate.url)) {
                            bucket.push(candidate);
                        }
                    } catch (err) {
                        logDebug(2, `⚠️ Structural fallback failed for candidate: ${err.message}`);
                    }
                }

                return Array.from(bucketMap.values()).filter(group => group.length > 1);
            }

            let groups = buildGroups(results, threshold);

            // ✅ Select group with highest cardinality
            let dominantGroup = [];
            groups.forEach(group => {
                if (group.length > dominantGroup.length) {
                    dominantGroup = group;
                }
            });

            logDebug(1, `🎯 Dominant group size: ${dominantGroup.length}`);
            dominantGroup.forEach((item, index) => logDebug(2, `🔗 Group [${index + 1}]: ${item.url}`));

            // 🛟 Fallback 1: Lower the threshold slightly if the first pass is too strict
            if (dominantGroup.length < minGroupSizeCache) {
                const fallbackThreshold = Math.max(45, threshold - 15);
                logDebug(1, `🛟 Primary grouping too small. Retrying with fallback threshold: ${fallbackThreshold}%`);

                groups = buildGroups(results, fallbackThreshold);
                dominantGroup = [];
                groups.forEach(group => {
                    if (group.length > dominantGroup.length) {
                        dominantGroup = group;
                    }
                });

                logDebug(1, `🧪 Fallback threshold dominant group size: ${dominantGroup.length}`);
                dominantGroup.forEach((item, index) => logDebug(2, `🔗 Fallback group [${index + 1}]: ${item.url}`));
            }

            // 🛟 Fallback 2: Structural bucket grouping when similarity is still not enough
            if (dominantGroup.length < minGroupSizeCache) {
                logDebug(1, "🛟 Similarity grouping still too small. Trying structural fallback grouping.");

                const structuralGroups = buildStructuralFallbackGroups(results);
                dominantGroup = [];
                structuralGroups.forEach(group => {
                    if (group.length > dominantGroup.length) {
                        dominantGroup = group;
                    }
                });

                logDebug(1, `🧪 Structural fallback dominant group size: ${dominantGroup.length}`);
                dominantGroup.forEach((item, index) => logDebug(2, `🔗 Structural group [${index + 1}]: ${item.url}`));
            }

            if (dominantGroup.length === 0) {
                logDebug(1, "⚠️ No dominant group found after all grouping attempts. Aborting.");
                showUserMessage("No dominant image group found. Try adjusting similarity or using another gallery mode.", "error");
                return;
            }

            try {
                if (!dominantGroup || dominantGroup.length === 0) {
                    logDebug(1, "⛔ Dominant group is empty. Aborting message send.");
                    return;
                }

                const urlsToSend = [...new Set(dominantGroup.map(item => item.url).filter(Boolean))];

                if (urlsToSend.length === 0) {
                    logDebug(1, "⛔ No valid URLs to send. Aborting.");
                    return;
                }

                // 🚦 Validate minimum group size
                if (urlsToSend.length < minGroupSizeCache) {
                    logDebug(1, `⛔ Not enough candidates in dominant group. Minimum required: ${minGroupSizeCache}, found ${urlsToSend.length}`);
                    showUserMessage("Web-linked gallery rejected. Not enough similar links to form a gallery.", "error");
                    return;
                }

                logDebug(2, "🧠 END: Gallery grouping.");
                logDebug(1, `📤 Sending ${urlsToSend.length} grouped web-linked gallery URLs to background.`);

                chrome.runtime.sendMessage({
                    action: "processWebLinkedGallery",
                    images: urlsToSend,
                    source: triggerSource
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        logDebug(1, `❌ Failed to send grouped gallery URLs: ${chrome.runtime.lastError.message}`);
                        showUserMessage("Failed to hand off the web-linked gallery to the background process.", "error");
                        return;
                    }

                    if (!response || response.success !== true) {
                        logDebug(1, `⚠️ Background process returned an unexpected response: ${JSON.stringify(response)}`);
                        showUserMessage("The web-linked gallery process could not continue in the background.", "error");
                        return;
                    }

                    logDebug(1, `✅ Web-linked gallery sent successfully. Total URLs: ${urlsToSend.length}`);
                    showUserMessage(`Web-linked gallery detected: ${urlsToSend.length} candidate pages queued.`, "success");
                });
            } catch (groupSendError) {
                logDebug(1, `❌ Failed to process dominant group: ${groupSendError.message}`);
                logDebug(2, `🐛 Stack trace: ${groupSendError.stack}`);
                showUserMessage("The grouped web-linked gallery could not be processed.", "error");
                return;
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