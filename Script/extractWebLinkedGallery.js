// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// extractWebLinkedGallery.js - Extract images from <a href="html"> with <img> thumbnail

(function () {
    
    let debugLogLevelCache = 1;

    // Get user-defined log level and similarity threshold from storage

    chrome.storage.sync.get(["debugLogLevel", "gallerySimilarityLevel"], (data) => {
        debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
        const similarityThreshold = (data.gallerySimilarityLevel >= 30 && data.gallerySimilarityLevel <= 100)
            ? data.gallerySimilarityLevel
            : 70;
    
        logDebug(1, `🔗 Script injected: Extract Web-Linked Gallery`);
        logDebug(2, `🧠 Grouping threshold: ${similarityThreshold}%`);
    
        runGalleryDetection(similarityThreshold);
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
     * Checks if a URL is a valid HTML link.
     * @param {string} url - The URL to check.
     * @returns {boolean} True if the URL is a valid HTML link, false otherwise.
     * @description This function checks if a given URL is a valid HTML link.
     * It uses the URL constructor to parse the URL and checks if it has a valid pathname.
     * The URL must end with .html, .htm, .php, .asp, .aspx, or .jsp.
     * It also ensures that the URL is not the domain root (i.e., it should not be empty or just "/").
     * If the URL is invalid or cannot be parsed, it logs an error message and returns false. 
     * It handles errors gracefully and returns false if the URL is invalid.
     */
    function isHtmlLink(url) {
        if (!url || typeof url !== "string") return false;
    
        try {
            const parsed = new URL(url);
            const pathname = parsed.pathname;
    
            const isValidExtension = /\.(html?|php|aspx?|jsp)(\?.*)?$/i.test(pathname);
            const isFolderLike = pathname.endsWith("/") && pathname.split("/").length > 2;
            const isRoot = pathname === "/" || pathname.trim() === "";

            // Is the URL a folder-like structure? Or a valid web page?
            if (isFolderLike && !isValidExtension) {
                logDebug(2, `📂 Accepted folder-style URL without extension: ${url}`);
            }

            return (isValidExtension || isFolderLike) && !isRoot;

        } catch (e) {
            logDebug(2, `⛔ Invalid URL while checking HTML: ${url}`);
            return false;
        }
    }


    /**
     * Calculates the similarity between two URL paths.
     * @param {string} url1 - The first URL.
     * @param {string} url2 - The second URL.
     * @returns {number} Similarity percentage (0-100).
     * @description This function calculates the similarity between two URL paths.
     * It compares the characters in the paths of both URLs and returns a percentage
     * based on the number of matching characters.
     * The function uses the URL constructor to parse the URLs and extract their paths.
     * It handles errors gracefully and returns 0 if the URLs are invalid or cannot be parsed.
     * The similarity is calculated as the number of matching characters divided by the maximum length of the two paths.
     * It stops comparing at the first difference and returns the similarity as a percentage.
     */
    function calculatePathSimilarity(url1, url2) {
        try {
            const path1 = new URL(url1).pathname;
            const path2 = new URL(url2).pathname;
    
            const minLen = Math.min(path1.length, path2.length);
            let commonChars = 0;
    
            for (let i = 0; i < minLen; i++) {
                if (path1[i] === path2[i]) {
                    commonChars++;
                } else {
                    break; // stop at first difference
                }
            }
    
            const maxLen = Math.max(path1.length, path2.length);
            return (commonChars / maxLen) * 100;
        } catch (err) {
            logDebug(1, `❌ Error calculating similarity: ${err.message}`);
            logDebug(3, `😫 Stack trace: ${err.stack}`);
            return 0;
        }
    }

    /**
     * 🔍 Main gallery detection logic (Web-Linked Galleries)
     * @param {number} threshold - Path similarity threshold (30–100)
     */
    function runGalleryDetection(threshold) {
        logDebug(1, "🔗 Script injected: Extract Web-Linked Gallery");

        const results = [];

        const anchors = document.querySelectorAll("a[href]");
        anchors.forEach(anchor => {
            const href = anchor.getAttribute("href");
            const resolvedHref = href ? new URL(href, window.location.href).href : null;
            const img = anchor.querySelector("img");
        
            // Check if the <a> tag has a valid href and contains an <img> tag
            const isValidThumb = (
                img &&
                img.src &&
                !img.src.startsWith("data:") &&
                !/1px\.|spacer|blank|sprite|icon/i.test(img.src) &&
                img.naturalWidth > 10 &&
                img.naturalHeight > 10
            );
        
            // Check if the resolved href is a valid HTML link
            // and not an image or resource link
            // Also check if the <img> is not decorative (e.g., 1x1 pixel, blank, etc.)
            if (isValidThumb && resolvedHref && isHtmlLink(resolvedHref)) {
                results.push({
                    url: resolvedHref,
                    thumb: img.src
                });
        
                logDebug(2, `✅ Candidate found: ${resolvedHref}`);
            } else {
                logDebug(3, `⛔ Skipped non-visual or decorative <a><img>: ${resolvedHref || "?"}`);
            }
        });

        logDebug(1, `🎯 Total web-linked <a><img> candidates: ${results.length}`);

        if (results.length === 0) return;

        // ✅ Grouping candidates by path similarity using exhaustive pair comparison
        const groups = [];

        // Check if the results array is empty
        for (let i = 0; i < results.length; i++) {
            const base = results[i];
            const group = [base];

            // Skip if the base URL is already in a group
            for (let j = 0; j < results.length; j++) {
                if (i === j) continue;

                const compare = results[j];
                const sim = calculatePathSimilarity(base.url, compare.url);

                logDebug(3, `🔍 Similarity between:\n   Base: ${base.url}\n   Compare: ${compare.url}\n   → ${sim.toFixed(1)}%`);

                if (sim >= threshold) {
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
        
            // Send the URLs to the background script
            logDebug(1, `📨 Sending ${urlsToSend.length} URLs to background script...`);
            chrome.runtime.sendMessage({
                action: "processWebLinkedGallery",
                images: urlsToSend
            }, (response) => {
                if (chrome.runtime.lastError) {
                    logDebug(1, `❌ Failed to send candidates to background: ${chrome.runtime.lastError.message}`);
                } else if (response?.success) {
                    logDebug(1, "📨 Web-linked gallery candidates sent successfully.");
                } else {
                    logDebug(1, `⚠️ Background response error: ${response?.error || "Unknown error"}`);
                }
            });
        } catch (err) {
            logDebug(1, `❌ Exception while sending gallery candidates: ${err.message}`);
            logDebug(2, `🐛 Stacktrace: ${err.stack}`);
        }
        
    }
})();
