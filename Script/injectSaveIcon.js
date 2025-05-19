// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// injectSaveIcon.js - Overlay save icon 💾 over highest-resolution visible image

/**
 * Logs debug messages based on user-defined log level.
 * @param {number|string} levelOfLog - Log level (0-3) or message string. 
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

let debugLogLevelCache = 1;   

window.addEventListener("load", () => {
    try {

        chrome.storage.sync.get(["debugLogLevel"], (data) => {
            debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
        });
    

        logDebug(1, "💾 Script injected: injectSaveIcon.js");

        const candidates = Array.from(document.querySelectorAll("img")).filter(img =>
            img.naturalWidth > 0 &&
            img.naturalHeight > 0 &&
            img.offsetWidth > 0 &&
            img.offsetHeight > 0 &&
            img.src &&
            !img.src.startsWith("data:") &&
            !img.src.includes("sprite") &&
            !img.src.includes("icon")
        );

        if (candidates.length === 0) {
            logDebug(1, "❌ No visible image candidates found.");
            return;
        }

        const bestImage = candidates.reduce((max, current) => {
            const maxRes = max.naturalWidth * max.naturalHeight;
            const currRes = current.naturalWidth * current.naturalHeight;
            return currRes > maxRes ? current : max;
        });

        if (!bestImage || !bestImage.src) {
            logDebug(1, "❌ No dominant image found.");
            return;
        }

        logDebug(2, `✅ Image selected for 💾 overlay: ${bestImage.src}`);
        logDebug(2, `📐 Resolution: ${bestImage.naturalWidth}x${bestImage.naturalHeight}`);

        const icon = document.createElement("div");
        icon.textContent = "💾";
        icon.title = "Mass image downloader: Save this image";
        icon.style.position = "absolute";
        icon.style.zIndex = "9999";
        icon.style.fontSize = "14px";
        icon.style.backgroundColor = "#F8F8F8";              // primary base color
        icon.style.color = "#FFFFFF";                        // clear text over blue
        icon.style.border = "2px solid #768591";           // consistent border with main button
        icon.style.borderRadius = "6px";                     // more in line with inputs and buttons
        icon.style.padding = "2px 8px";                      // improved width
        icon.style.cursor = "pointer";
        icon.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
        icon.style.transition = "all 0.2s ease-in-out";

        const rect = bestImage.getBoundingClientRect();
        icon.style.top = `${window.scrollY + rect.top + 6}px`;
        icon.style.left = `${window.scrollX + rect.left + bestImage.width - 42}px`;

        icon.addEventListener("click", () => {
            logDebug(1, "💾 Save icon clicked. Sending image to background.");
            chrome.runtime.sendMessage({
                action: "manualDownloadImage",
                imageUrl: bestImage.src
            });
        });

        document.body.appendChild(icon);

        icon.addEventListener("mouseenter", () => {
            icon.style.backgroundColor = "#4f5984";
        });

        // Add mouseleave event listener to reset background color
        icon.addEventListener("mouseleave", () => {
            icon.style.backgroundColor = "#F8F8F8";
        });

    } catch (err) {
        logDebug(1, `❌ Exception in injectSaveIcon.js: ${err.message}`);
        logDebug(2, `🐛 Stacktrace: ${err.stack}`);
    }
});
