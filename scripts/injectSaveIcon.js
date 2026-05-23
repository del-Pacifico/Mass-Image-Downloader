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

const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".bmp"];
const EXTENDED_IMAGE_URL_FLAG_KEYS = [
    "allowTwitterXQueryParams",
    "allowRedditCdnQueryParams",
    "allowParameterizedCdnUrls",
    "allowWrappedImageUrls"
];

/**
 * Escapes a string for safe use inside a RegExp pattern.
 * @param {string} text - Raw text to escape.
 * @returns {string} Escaped text.
 */
function escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Returns the image extensions currently enabled in Options.
 * @returns {string[]} Enabled extensions with leading dots.
 */
function getAllowedImageExtensions() {
    const allowedExts = [];
    if (configCache.allowJPG) allowedExts.push(".jpg");
    if (configCache.allowJPEG) allowedExts.push(".jpeg");
    if (configCache.allowPNG) allowedExts.push(".png");
    if (configCache.allowWEBP) allowedExts.push(".webp");
    if (configCache.allowAVIF) allowedExts.push(".avif");
    if (configCache.allowBMP) allowedExts.push(".bmp");
    return allowedExts;
}

/**
 * Checks whether any extended image URL rule is enabled in Options.
 * @returns {boolean} True when at least one extended URL checkbox is enabled.
 */
function hasEnabledExtendedImageUrlSupport() {
    return EXTENDED_IMAGE_URL_FLAG_KEYS.some((key) => configCache[key] === true);
}

/**
 * Splits an image URL into filename and extension parts.
 * @param {string} url - Absolute URL to inspect.
 * @returns {{
 *   pathname: string,
 *   lastSegment: string,
 *   baseName: string,
 *   extension: string,
 *   hasPathExtension: boolean,
 *   hasExtendedSuffix: boolean
 * }} Parsed URL parts used by the one-click flow.
 */
function getImageUrlParts(url) {
    try {
        const parsed = new URL(url, location.href);
        const pathname = parsed.pathname.replace(/\/+$/g, "");
        const lastSegment = pathname.split("/").pop() || "image";
        const extensionPattern = SUPPORTED_IMAGE_EXTENSIONS.map((ext) => escapeRegex(ext.slice(1))).join("|");
        const pathExtMatch = lastSegment.match(new RegExp(`^(.*?)(\\.(?:${extensionPattern}))(:[a-zA-Z0-9]{2,10})?$`, "i"));
        const queryFormat = String(
            parsed.searchParams.get("format")
            || parsed.searchParams.get("ext")
            || parsed.searchParams.get("type")
            || ""
        ).trim().toLowerCase();

        let baseName = lastSegment;
        let extension = "";
        let hasExtendedSuffix = false;

        if (pathExtMatch) {
            baseName = pathExtMatch[1] || "image";
            extension = pathExtMatch[2].toLowerCase();
            hasExtendedSuffix = Boolean(pathExtMatch[4]);
        } else if (queryFormat) {
            const normalized = queryFormat.startsWith(".") ? queryFormat : `.${queryFormat}`;
            if (SUPPORTED_IMAGE_EXTENSIONS.some((ext) => ext.toLowerCase() === normalized.toLowerCase())) {
                extension = normalized;
            }
        }

        return {
            pathname,
            lastSegment,
            baseName,
            extension,
            hasPathExtension: Boolean(pathExtMatch),
            hasExtendedSuffix
        };
    } catch (_) {
        return {
            pathname: "",
            lastSegment: "image",
            baseName: "image",
            extension: "",
            hasPathExtension: false,
            hasExtendedSuffix: false
        };
    }
}

/**
 * Validates a direct image source against the enabled formats and extended rules.
 * @param {string} url - URL to validate.
 * @param {string[]} allowedExts - Enabled image extensions from Options.
 * @param {boolean} allowExtended - Whether extended suffix handling is enabled.
 * @returns {{
 *   isValid: boolean,
 *   normalizedUrl: string,
 *   pathname: string,
 *   lastSegment: string,
 *   baseName: string,
 *   extension: string,
 *   hasPathExtension: boolean,
 *   hasExtendedSuffix: boolean
 * }} Validation result and parsed URL parts.
 */
function isAllowedImageSource(url, allowedExts, allowExtended) {
    const info = getImageUrlParts(url);
    let normalizedUrl = url;

    if (allowExtended && info.hasPathExtension && info.hasExtendedSuffix) {
        const extensionPattern = SUPPORTED_IMAGE_EXTENSIONS.map((ext) => escapeRegex(ext.slice(1))).join("|");
        normalizedUrl = url.replace(new RegExp(`(\\.(?:${extensionPattern}))(:[a-zA-Z0-9]{2,10})$`, "i"), "$1");
    }

    let isValid = false;
    if (info.hasPathExtension) {
        isValid = allowedExts.some(ext => {
            const pattern = info.hasExtendedSuffix && allowExtended
                ? new RegExp(`${ext}(:[a-zA-Z0-9]{2,10})?$`, 'i')
                : new RegExp(`${ext}$`, 'i');
            return pattern.test(info.lastSegment);
        });
    } else if (info.extension) {
        isValid = allowedExts.includes(info.extension.toLowerCase());
    }

    return { isValid, normalizedUrl, ...info };
}

// Local tooltip helper for the one-click icon.
// Shows a small bubble above the icon instead of relying on native title behavior.
function attachTooltipForIcon(element, text) {
    try {
        if (!element || !text) return;

        element.setAttribute("aria-label", text);
        element.removeAttribute("title");

        let tooltipEl = null;

        const show = () => {
            try {
                const rect = element.getBoundingClientRect();
                const top = Math.max(4, rect.top - 28);

                tooltipEl = document.createElement("div");
                tooltipEl.textContent = text;
                tooltipEl.style.position = "fixed";
                tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
                tooltipEl.style.top = `${top}px`;
                tooltipEl.style.transform = "translateX(-50%)";
                tooltipEl.style.backgroundColor = "rgba(18,27,62,0.95)";
                tooltipEl.style.color = "#FFFFFF";
                tooltipEl.style.padding = "4px 8px";
                tooltipEl.style.borderRadius = "4px";
                tooltipEl.style.fontSize = "11px";
                tooltipEl.style.whiteSpace = "nowrap";
                tooltipEl.style.pointerEvents = "none";
                tooltipEl.style.zIndex = "9999";
                document.body.appendChild(tooltipEl);
            } catch (_) {}
        };

        const hide = () => {
            try {
                if (tooltipEl) tooltipEl.remove();
            } catch (_) {}
            tooltipEl = null;
        };

        element.addEventListener("mouseenter", show);
        element.addEventListener("mouseleave", hide);
        element.addEventListener("focus", show);
        element.addEventListener("blur", hide);
    } catch (err) {
        logDebug(2, `⚠️ attachTooltipForIcon failed: ${err.message}`);
    }
}

// 🔧 Local config cache for injectSaveIcon.js
// Avoid re-declaration across multiple injections in the same page.
if (typeof configCache === 'undefined') {
    // Create the cache only once in the global scope (non-strict content scripts)
    configCache = {
        minWidth: 800,
        minHeight: 600,
        allowedExts: [],
        showUserFeedbackMessages: false,
        toastMinVisibleMs: 2000, // Default: 2000ms
        allowExtendedImageUrls: false,
        allowTwitterXQueryParams: false,
        allowRedditCdnQueryParams: false,
        allowParameterizedCdnUrls: false,
        allowWrappedImageUrls: false,
        enableOneClickIcon: false
    };
}

// 🔧 Initialize local config for this script only
/**
 * Loads the local configuration cache for the one-click overlay.
 * @param {Function} callback - Called once configuration is ready and the feature is enabled.
 * @returns {void}
 */
function initConfigForInjectSaveIcon(callback) {
    chrome.storage.sync.get(
        ["debugLogLevel", "minWidth", "minHeight", "allowJPG", "allowJPEG", 
            "allowPNG", "allowWEBP", "allowAVIF", "allowBMP", "enableOneClickIcon", 
            "showUserFeedbackMessages", "toastMinVisibleMs",
            "allowTwitterXQueryParams", "allowRedditCdnQueryParams",
            "allowParameterizedCdnUrls", "allowWrappedImageUrls",
            "allowExtendedImageUrls"],
        (data) => {
            debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);

            configCache.minWidth = parseInt(data.minWidth) || 800;
            configCache.minHeight = parseInt(data.minHeight) || 600;

            configCache.allowedExts = [];
            if (data.allowJPG) configCache.allowedExts.push('.jpg');
            if (data.allowJPEG) configCache.allowedExts.push('.jpeg');
            if (data.allowPNG) configCache.allowedExts.push('.png');
            if (data.allowWEBP) configCache.allowedExts.push('.webp');
            if (data.allowAVIF) configCache.allowedExts.push('.avif');
            if (data.allowBMP) configCache.allowedExts.push('.bmp');
            if (data.showUserFeedbackMessages) configCache.showUserFeedbackMessages = true;
            else configCache.showUserFeedbackMessages = false;

            const rawToastMinVisibleMs = parseInt(data.toastMinVisibleMs ?? 2000, 10);
            configCache.toastMinVisibleMs = (!isNaN(rawToastMinVisibleMs) && rawToastMinVisibleMs >= 0 && rawToastMinVisibleMs <= 10000)
                ? rawToastMinVisibleMs
                : 2000;

            const hasGranularExtendedFlags = EXTENDED_IMAGE_URL_FLAG_KEYS.some((key) => Object.prototype.hasOwnProperty.call(data, key));
            const legacyExtendedUrlsEnabled = data.allowExtendedImageUrls === true;

            configCache.allowTwitterXQueryParams = hasGranularExtendedFlags
                ? data.allowTwitterXQueryParams === true
                : legacyExtendedUrlsEnabled;
            configCache.allowRedditCdnQueryParams = hasGranularExtendedFlags
                ? data.allowRedditCdnQueryParams === true
                : legacyExtendedUrlsEnabled;
            configCache.allowParameterizedCdnUrls = hasGranularExtendedFlags
                ? data.allowParameterizedCdnUrls === true
                : legacyExtendedUrlsEnabled;
            configCache.allowWrappedImageUrls = hasGranularExtendedFlags
                ? data.allowWrappedImageUrls === true
                : legacyExtendedUrlsEnabled;
            configCache.allowExtendedImageUrls = hasGranularExtendedFlags
                ? EXTENDED_IMAGE_URL_FLAG_KEYS.some((key) => configCache[key] === true)
                : legacyExtendedUrlsEnabled;
            if (data.enableOneClickIcon) configCache.enableOneClickIcon = true;
            else configCache.enableOneClickIcon = false;

            logDebug(2, "⚙️ Config loaded:", configCache);

            const isEnabled = data.enableOneClickIcon ?? false;
            if (!isEnabled) {
                logDebug(1, "⚠️ One-click download icon is disabled. Aborting injection.");
                return;
            }

            callback();
        }
    );
}

// 🔧 Inject the save icon over the highest-resolution visible image
(function injectOneClickIcon() {
    try {
            initConfigForInjectSaveIcon(() => {
                if (document.readyState === 'complete') {
                    detectContextAndProceed();
                } else {
                    window.addEventListener('load', () => {
                        logDebug(1, '⏳ Full page load detected. Detecting context...');
                        detectContextAndProceed();
                    });
                }
            });
    } catch (err) {
        logDebug(1, `❌ Exception in injectSaveIcon.js: ${err.message}`);
    }
})();

// 🧠 New function to detect execution context
/**
 * Chooses the correct injection path based on the current document type.
 * @returns {void}
 */
function detectContextAndProceed() {
    try {
        const contentType = document.contentType || '';
        
        logDebug(1, "🔍 Detecting context based on document.contentType...");
        logDebug(2, `💡 Context detected: document.contentType = ${contentType}`);

        if (contentType.startsWith("image/")) {
            logDebug(1, "🖼️ Direct image URL detected. (window.location.href mode)");

            const url = window.location.href;

            try {
                const allowedExts = configCache.allowedExts || [];
                const allowExtended = hasEnabledExtendedImageUrlSupport();
                const { isValid, normalizedUrl } = isAllowedImageSource(url, allowedExts, allowExtended);

                if (!isValid) {
                    logDebug(1, `❌ Direct image URL does not match allowed formats: ${url}`);
                    showUserMessage("No valid image found on this page.", "error");
                    return;
                }

                logDebug(2, `✅ Direct image URL accepted: ${url}`);

                // 🧩 Use unified function for icon injection (top-right for direct image)
                createAndShowSaveIcon(url, normalizedUrl, "fixed");

            } catch (err) {
                logDebug(1, `❌ Error validating direct image URL: ${err.message}`);
                logDebug(3, `🐛 StackTrace: ${err.stack}`);
                showUserMessage("An error occurred while processing this image.", "error");
            }

            return;
        } else {
            logDebug(1, "🌐 HTML page detected. Proceeding with current image overlay logic.");
            proceedWithInjection();
        }
    } catch (err) {
        logDebug(1, `❌ Error detecting context: ${err.message}`);
    }
}

/**
 * Creates and injects the 💾 save icon for a given image URL.
 * Handles styling, positioning, hover effects and click behavior.
 * 
 * @param {string} targetUrl - The image URL to download.
 * @param {string} normalizedUrl - Normalized version of the URL (if Allow extended URLs is enabled).
 * @param {string} position - "absolute" or "fixed".
 * @param {object} positionOptions - { top: number, left: number } when position === "absolute".
 */
function createAndShowSaveIcon(targetUrl, normalizedUrl, position = "fixed", positionOptions = {}) {
    try {
        const icon = document.createElement("div");
        icon.textContent = "💾";
        attachTooltipForIcon(icon, "[Mass image downloader]: Save this image (based on rules)");
        icon.style.position = position;
        icon.style.zIndex = "9999";
        icon.style.fontSize = "14px";
        icon.style.backgroundColor = "#F8F8F8";
        icon.style.color = "#FFFFFF";
        icon.style.border = "3px solid #768591";
        icon.style.borderRadius = "6px";
        icon.style.padding = "2px 8px";
        icon.style.cursor = "pointer";
        icon.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
        icon.style.transition = "all 0.2s ease-in-out";

        // Position the icon based on the provided options
        if (position === "absolute" && positionOptions.top !== undefined && positionOptions.left !== undefined) {
            icon.style.top = `${positionOptions.top}px`;
            icon.style.left = `${positionOptions.left}px`;
        } else {
            // Default position for fixed placement
            icon.style.top = "10px";
            icon.style.right = "10px";
        }

        // Add hover effects
        icon.addEventListener("mouseenter", () => {
            icon.style.backgroundColor = "#4f5984";
        });

        // Remove hover effects when mouse leaves
        icon.addEventListener("mouseleave", () => {
            icon.style.backgroundColor = "#F8F8F8";
        });

        // Add click event to send message to background script
        icon.addEventListener("click", (event) => {
            logDebug(1, "💾 Save icon clicked. Sending image to background.");
            try {
                // Prevent any page-side handlers from hijacking the click
                event?.preventDefault?.();
                event?.stopPropagation?.();

                // Send the image URL to the background script for download
                chrome.runtime.sendMessage({
                    action: "manualDownloadImage",
                    imageUrl: targetUrl,
                    normalizedImageUrl: normalizedUrl
                }, (response) => {
                    // Robust handling of MV3 ephemeral errors
                    const err = chrome.runtime.lastError;
                    if (err) {
                        const msg = (err.message || "").toLowerCase();
                        const isEphemeral =
                            msg.includes("message port closed before a response was received") ||
                            msg.includes("context invalidated") ||
                            msg.includes("extension context invalidated") ||
                            msg.includes("service worker") ||
                            msg.includes("receiving end does not exist");

                        if (isEphemeral) {
                            // Non-fatal timing issue: background likely received the message anyway
                            logDebug(2, `ℹ️ Ignoring MV3 ephemeral error: ${err.message}`);
                            showUserMessage("Downloading image!", "info");
                            return;
                        }

                        // Real error: notify the user
                        logDebug(1, `❌ Messaging error: ${err.message}`);
                        logDebug(3, `🐛 StackTrace: ${err.stack || "no stack"}`);
                        showUserMessage("Extension context error. Please refresh this tab and try again.", "error");
                        return;
                    }

                    // No lastError: trust the response when provided
                    if (response?.success === false) {
                        showUserMessage("Failed to send image for download. Try refreshing tab.", "error");
                        return;
                    }

                    // Default optimistic feedback
                    showUserMessage("Downloading image!", "success");
                });
            } catch (err) {
                // Synchronous failure in messaging API (rare)
                logDebug(1, `❌ Critical error sending message: ${err.message}`);
                logDebug(3, `🐛 StackTrace: ${err.stack}`);
                showUserMessage("Extension context error. Please refresh this tab and try again.", "error");
            }
        });


        document.body.appendChild(icon);
        logDebug(2, "💾 Save icon injected successfully.");
    } catch (err) {
        logDebug(1, `❌ Exception in createAndShowSaveIcon: ${err.message}`);
        logDebug(3, `🐛 StackTrace: ${err.stack}`);
    }
}

// 🔧 Function to proceed with the image evaluation and icon injection
/**
 * Scans visible images and injects the save icon onto the best candidate.
 * @returns {void}
 */
function proceedWithInjection() {
    try {
        logDebug(1, "💾 Script injected: injectSaveIcon.js (optimized)");

        // 🔧 Check if the user has allowed extended image URLs
        const candidates = Array.from(document.querySelectorAll("img")).map(img => {
            const src = img.src || "";
            // ✅ Visibility and size checks
            const visible = img.naturalWidth > 0 && img.naturalHeight > 0 &&
                img.offsetWidth > 0 && img.offsetHeight > 0 &&
                !src.startsWith("data:") &&
                !src.includes("sprite") &&
                !src.includes("icon");

            const hasMinSize = img.naturalWidth >= configCache.minWidth && img.naturalHeight >= configCache.minHeight;

            // ✅ Advanced logic: normal vs extended suffix
            const allowExtended = hasEnabledExtendedImageUrlSupport();
            const { isValid: isAllowedFormat, normalizedUrl: normalizedSrc } = isAllowedImageSource(src, configCache.allowedExts || [], allowExtended);
            return visible && hasMinSize && isAllowedFormat
                ? { img, originalSrc: src, normalizedSrc }
                : null;
        }).filter(Boolean);

        if (candidates.length === 0) {
            logDebug(1, "❌ No valid image candidates found after filtering.");
            showUserMessage("No valid images found on this page. Please try another tab or refresh.", "error");
            return;
        }

        const bestImage = candidates.reduce((max, current) => {
        const maxRes = max.img.naturalWidth * max.img.naturalHeight;
        const currRes = current.img.naturalWidth * current.img.naturalHeight;
        return currRes > maxRes ? current : max;
    });

    if (!bestImage || !bestImage.img || !bestImage.originalSrc) {
        logDebug(1, "❌ No dominant image found after filtering.");
        return;
    }

    logDebug(2, `✅ Image selected for 💾 overlay: ${bestImage.originalSrc}`);
    logDebug(2, `📐 Resolution: ${bestImage.img.naturalWidth}x${bestImage.img.naturalHeight}`);

    const rect = bestImage.img.getBoundingClientRect();
    const positionOptions = {
        top: window.scrollY + rect.top + 6,
        left: window.scrollX + rect.left + bestImage.img.width - 42
    };

    createAndShowSaveIcon(
        bestImage.originalSrc,
        bestImage.normalizedSrc,
        "absolute",
        positionOptions
    );


    } catch (err) {
        logDebug(1, `❌ Exception in proceedWithInjection: ${err.message}`);
        logDebug(3, `🐛 StackTrace: ${err.stack}`);
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
        // Display messages only if user feedback is enabled
        if (!configCache.showUserFeedbackMessages) {
            logDebug(2, `🚫 User feedback messages disabled. Skipping display.`);
            return;
        }

        const baseDuration = (type === "error") ? 10000 : 5000;
        const minVisibleMs = Math.max(0, parseInt(configCache.toastMinVisibleMs ?? 2000, 10) || 2000);
        const effectiveDuration = Math.max(baseDuration, minVisibleMs);

        // Define toast color explicitly for this flow.
        // Error uses red, success uses green, info/default uses blue.
        const backgroundColor =
            type === "error"
                ? "#d9534f"
                : (type === "success" ? "#28a745" : "#007EE3");

        // ✅ Last toast wins: remove previous toast + cancel previous timer
        const TOAST_ID = "mdi-user-toast";
        const TIMER_KEY = "__mdiUserToastTimer";
        const MINUNTIL_KEY = "__mdiUserToastMinUntil";
        const DEFER_KEY = "__mdiUserToastDeferTimer";
        const PENDING_KEY = "__mdiUserToastPending";

        // Defer replacement inside minimum visible window (last pending wins)
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

        // Last toast wins
        try {
            const existing = document.getElementById(TOAST_ID);
            if (existing) existing.remove();

            if (window[TIMER_KEY]) {
                clearTimeout(window[TIMER_KEY]);
                window[TIMER_KEY] = null;
            }
        } catch (_) {}

        try { window[MINUNTIL_KEY] = Date.now() + minVisibleMs; } catch (_) {}

        const messageElement = document.createElement("div");
        messageElement.id = TOAST_ID;
        
        // ✅ Ensure consistent "MID: " prefix for all messages, but avoid duplication if already present
        const finalText = (typeof text === "string" && text.trim().startsWith("MID:")) ? text.trim() : `MID: ${text}`;
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

        logDebug(3, `📢 Showing user message: "${text}" (${type})`);

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
        logDebug(3, `❌ Stacktrace: ${error.stack}`);
    }
}
