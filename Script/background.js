    // # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
    // # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
    // #
    // # Original Author: Sergio Palma Hidalgo
    // # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
    // # Copyright (c) 2025 Sergio Palma Hidalgo
    // # All rights reserved.

    // background.js - Mass Image Downloader (Robust & Complete)

    // 🔧 Check if running in Chrome and log version
    if (chrome.runtime.getManifest) {
        logDebug(1, `🧩 Running version ${chrome.runtime.getManifest().version}`);
    }

    /**
     * ✅ Import utility functions relative to manifest root (for ES module support)
     * @description This function imports utility functions from the utils.js file.
     * It includes functions for updating the badge, closing tabs, logging debug messages,
     * calculating path similarity, generating filenames, sanitizing filename components,
     * checking direct image URLs, and checking allowed image formats.
     * @returns {void}
     */
    import {
        updateBadge,
        setBadgeProcessing,
        setBadgeFinished,
        closeTabSafely,
        logDebug,
        calculatePathSimilarity,
        generateFilename,
        normalizeImageUrl,
        sanitizeFilenameComponent,
        isDirectImageUrl,
        isAllowedImageFormat,
        initConfigCache
    } from "./utils.js";

    // 🔧 Gate configuration for utils/configCache
    // NOTE: Keep this Promise reference to await it before any filename/path build.
    const configReady = initConfigCache().then(() => {
        logDebug(1, "📦 Background configuration initialized.");
    });

    // 🔒 Enforce final filename/path for every download
    // Reason: Chromium/servers can override suggested names; this listener cements our choice.
    const pendingDownloadPaths = new Map(); // key: download URL, value: desired relative path

    // 🧠 Listen for download requests to enforce filename/path
    chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
        try {
            const desired = pendingDownloadPaths.get(item.url);
            if (desired && typeof desired === "string") {
                // ✅ Force the filename (subfolder under default Downloads dir is allowed)
                suggest({ filename: desired, conflictAction: "uniquify" });
                pendingDownloadPaths.delete(item.url);
                logDebug(2, `🔒 Filename enforced by listener: ${desired}`);
            } else {
                // Use Chrome's suggestion if we did not schedule one
                suggest();
            }
        } catch (err) {
            // Fallback: never block the download
            try { suggest(); } catch (_) {}
            logDebug(1, `⚠️ onDeterminingFilename error: ${err.message}`);
            logDebug(2, `🐛 Stack trace: ${err.stack}`);
        }
    });


    // [Mass image downloader]: 🔧 Global settings variables
    let downloadFolder = "default";
    let customFolderPath = "";
    let downloadLimit = 2;
    let debugLogLevel = 0;
    let filenameMode = "none";
    let prefix = "";
    let suffix = "";
    let extractGalleryMode = "tab";
    let minWidth = 800;
    let minHeight = 600;
    let galleryMaxImages = 3;
    let galleryMinGroupSize = 3;
    let galleryEnableSmartGrouping = false;
    let galleryEnableFallback = false;
    let maxBulkBatch = 0;
    let continueBulkLoop = false;
    let gallerySimilarityLevel = 70;
    let allowJPG = false;
    let allowJPEG = false;
    let allowPNG = false;
    let allowWEBP = false;
    let allowAVIF = false;
    let allowBMP = false;
    let allowExtendedImageUrls = false; // 🖼️ Allow extended image URLs (e.g., Twitter/X :large, :orig)
    let showUserFeedbackMessages = false;
    let enableClipboardHotkeys = false;
    let maxOpenTabs = 5; // 🔗 Max concurrent tabs for Web-Linked Gallery
    let webLinkedGalleryDelay = 500;
    let peekTransparencyLevel = 0.8; // 🖼️ Transparency level for the peek overlay
    let enableOneClickIcon = false; // 🖱️ Enable One-click download icon
    let performancePreset = "medium"; // 📊 Performance preset (default to medium)

    /** 
     * One-time settings gate. Ensures options are loaded before first use.
     * This Promise resolves once chrome.storage.sync values are read and assigned.
     */
    const settingsReady = new Promise((resolve) => {
        // Only read what is needed for path building; add more keys if required
        chrome.storage.sync.get(
            ["downloadFolder", "customFolderPath"],
            (data) => {
                try {
                    if (typeof data.downloadFolder === "string") {
                        downloadFolder = data.downloadFolder;
                    }
                    if (typeof data.customFolderPath === "string") {
                        customFolderPath = data.customFolderPath;
                    }
                } catch (e) {
                    // [Mass Image Downloader]: ⚠️ Fallback to defaults on parsing errors
                    logDebug(1, `❌ Error reading settings: ${e.message}`);
                    logDebug(2, `🐛 Stack trace: ${e.stack}`);
                } finally {
                    resolve();
                }
            }
        );
    });

    // 🧪 Chromium version validation (Chrome >= 93 required)
    try {
        const userAgent = navigator.userAgent;
        const isChromium = /Chrome|Chromium|Edg|Brave/i.test(userAgent);
        const chromeVersionMatch = userAgent.match(/Chrom(?:e|ium)\/([0-9]+)/i);
        const version = chromeVersionMatch ? parseInt(chromeVersionMatch[1]) : 0;

        if (!isChromium || version < 93) {
            console.warn("[Mass image downloader]: ⚠️ Unsupported browser or version. Requires Chromium v93+.");

            // Optional notification to user
            chrome.notifications?.create({
                type: "basic",
                iconUrl: "ico/emoji_48x48.png",
                title: "Compatibility Warning",
                message: "This extension requires a Chromium-based browser (v93+). Some features may not work."
            }, () => {
                if (chrome.runtime.lastError)
                    console.warn("[Mass image downloader]: ⚠️ Notification failed:", chrome.runtime.lastError.message);
            });
        }

        // 🧹 Defensive cleanup: clear local variables explicitly
        // (no need to delete anything from 'window' in a service worker)
        // userAgent, chromeVersionMatch, version are local and go out of scope naturally

    } catch (validationError) {
        console.warn("[Mass image downloader]: ❌ Browser compatibility check failed:", validationError.message);
        console.warn("[Mass image downloader]: ⚠️ Please use a Chromium-based browser (v93+) for best experience.");
        console.warn("[Mass image downloader]: ⚠️ Some features may not work as expected.");
        console.warn(`[Mass image downloader]: ❌ Error details: ${validationError.stack}`);

        chrome.notifications?.create({
            type: "basic",
            iconUrl: "ico/emoji_48x48.png",
            title: "Compatibility Warning",
            message: "This extension requires a Chromium-based browser (v93+). Some features may not work."
        }, () => {
            if (chrome.runtime.lastError)
                console.warn("[Mass image downloader]: ⚠️ Notification failed:", chrome.runtime.lastError.message);
        });
    }


    /**
     * ✅ Apply default settings when the extension is installed for the first time.
     * @description This function is called when the extension is installed for the first time.
     * It sets the default settings in chrome.storage.sync and logs the default settings to the console.
     */
    chrome.runtime.onInstalled.addListener((details) => {
        if (details.reason === "install") {
            logDebug(1, '📌 First-time installation detected. Applying default settings...');
            chrome.storage.sync.set({
                downloadFolder: "default",
                allowJPG: true,
                allowJPEG: true,
                allowPNG: true,
                allowWEBP: false,
                allowAVIF: false,
                allowBMP: false,
                allowExtendedImageUrls: false, // 🖼️ Allow extended image URLs (e.g., Twitter/X :large, :orig)
                downloadLimit: 1,
                filenameMode: "none",
                debugLogLevel: 1,
                extractGalleryMode: "tab",
                minWidth: 800,
                minHeight: 600,
                galleryMaxImages: 3,
                maxBulkBatch: 20,
                continueFromLastBulkBatch: false,
                prefix: "",
                suffix: "",
                enableClipboardHotkeys,
                gallerySimilarityLevel: 70,
                galleryEnableSmartGrouping: false,
                galleryEnableFallback: false,
                galleryMinGroupSize: 3,
                customFolderPath: "",
                showUserFeedbackMessages: false,
                enableClipboardHotkeys: false,
                maxOpenTabs: 5, // 🔗 Max concurrent tabs for Web-Linked Gallery
                webLinkedGalleryDelay: 500, // 🕒 Delay between opening tabs for Web-Linked Gallery
                peekTransparencyLevel: 0.8, // 🖼️ Transparency level for the peek overlay
                enableOneClickIcon: false, // 🖱️ Enable One-click download icon
                performancePreset: "medium" // 📊 Performance preset (default to medium)
            }, () => {
                logDebug(3, '------------------------------');
                logDebug(1, '✅ Default settings applied successfully.');
                logDebug(3, '');
                // 🌍 Global settings
                logDebug(3, '🌍 Global settings:');

                // 📁 File system
                logDebug(3, '   📁 Download Folder');
                logDebug(3, '   Stored Download Folder: default');
                logDebug(3, '   Custom Folder Path: ');
                logDebug(3, '   📄 Allowed Image Formats:');
                logDebug(3, '      allow JPG?  true');
                logDebug(3, '      allow JPEG? true');
                logDebug(3, '      allow PNG?  true');
                logDebug(3, '      allow WEBP? false');
                logDebug(3, '      allow AVIF? false');
                logDebug(3, '      allow BMP?  false');
                logDebug(3, '   🐦 Allow extended image URLs? false');
                logDebug(3, '   📜 Filename Mode: none');
                logDebug(3, '      🔤 Prefix: ""');
                logDebug(3, '      🔡 Suffix: ""');

                // 📋 Clipboard hotkeys
                logDebug(3, '   📋 Clipboard hotkeys: false');
                logDebug(3, '   🖱️ One-click Download Icon: false');
                logDebug(3, '   📌 Max Simultaneous Downloads: 1');

                // 🧠 Galleries
                logDebug(3, '   🧠 Gallery Grouping');
                logDebug(3, '      🧠 Gallery similarity level: 70%');
                logDebug(3, '      📦 Minimum group size: 3');
                logDebug(3, '      🤖 Smart grouping enabled: false');
                logDebug(3, '      🛟 Fallback grouping enabled: false');
                logDebug(3, '    🖼 Extract Gallery Mode: tab');
                logDebug(3, '    ⚡ Gallery Max Images/sec: 3');
                
                // 📐 Image size
                logDebug(3, '   📐 Image size filters');
                logDebug(3, '      📏 Minimum Image Width: 800');
                logDebug(3, '      📐 Minimum Image Height: 600');
                // 📢 Global Settings: Notifications
                logDebug(3, '   📢 User feedback messages: false');
                logDebug(3, '   📃 Peek panel transparency: 0.8');

                // 🐛 Debugging
                logDebug(3, '   🐛 Debug logging level: 1 (shows key events)');
                // 📸 Bulk Image Download

                logDebug(3, '📸 Bulk Image Download functionality');
                logDebug(3, '   📌 Max image per batch: 0');
                logDebug(3, '   🔁 Continue bulk loop: false');
                logDebug(3, '🔗 Web-Linked Gallery Settings');
                logDebug(3, '   🔗 Max concurrent tabs: 5');
                logDebug(3, '   🕒 Delay between opening tabs: 500ms');
                // ⚙️ Performance preset
                logDebug(3, '⚙️ Performance Preset: medium');

                logDebug(3, '');
                logDebug(3, '✅ Default settings loaded and confirmed.');
                logDebug(3, '------------------------------');
            });
        }
    });

    /**
     * ✅ Load settings from chrome.storage.sync on startup
     * @description This function loads settings from chrome.storage.sync and applies them to the extension.
     */
    function loadSettings() {
        chrome.storage.sync.get([
            "downloadFolder", "customFolderPath", "downloadLimit", "debugLogLevel",
            "filenameMode", "prefix", "suffix", "extractGalleryMode",
            "minWidth", "minHeight",
            "galleryMaxImages",
            "maxBulkBatch", "continueFromLastBulkBatch",
            "allowJPG", "allowJPEG", "allowPNG", "allowWEBP", "gallerySimilarityLevel",
            "allowAVIF", "allowBMP", "allowExtendedImageUrls",
            "galleryMinGroupSize",
            "galleryEnableSmartGrouping",
            "galleryEnableFallback",
            "showUserFeedbackMessages",
            "enableClipboardHotkeys",
            "maxOpenTabs", "webLinkedGalleryDelay",
            "peekTransparencyLevel", "enableOneClickIcon",
            "performancePreset"
        ], (data) => {

            if (chrome.runtime.lastError) {
                logDebug(1, `❌ Failed to load settings: ${chrome.runtime.lastError.message}`);
                return;

            } else if (!data || typeof data !== "object") {
                logDebug(1, "❌ No settings received from storage or unexpected format.");
                return;
            }


            downloadFolder = data.downloadFolder || "default";
            customFolderPath = data.customFolderPath?.replace(/[<>:"/\\|?*]+/g, '') || "";
            downloadLimit = (data.downloadLimit >= 1 && data.downloadLimit <= 15) ? data.downloadLimit : 2;
            debugLogLevel = (typeof data.debugLogLevel === 'number' && [0, 1, 2, 3].includes(data.debugLogLevel))
            ? data.debugLogLevel
            : 1;
            filenameMode = data.filenameMode || "none";
            prefix = sanitizeFilenameComponent(data.prefix || "");
            suffix = sanitizeFilenameComponent(data.suffix || "");
            extractGalleryMode = data.extractGalleryMode || "tab";
            minWidth = data.minWidth || 800;
            minHeight = data.minHeight || 600;
            galleryMaxImages = (data.galleryMaxImages >= 1 && data.galleryMaxImages <= 10) ? data.galleryMaxImages : 3;
            maxBulkBatch = (data.maxBulkBatch >= 0 && data.maxBulkBatch <= 100) ? data.maxBulkBatch : 0;
            continueBulkLoop = data.continueFromLastBulkBatch || false;
            gallerySimilarityLevel = (data.gallerySimilarityLevel >= 30 && data.gallerySimilarityLevel <= 100)
            ? data.gallerySimilarityLevel
            : 70;

            galleryMinGroupSize = (data.galleryMinGroupSize >= 2 && data.galleryMinGroupSize <= 50)
            ? data.galleryMinGroupSize
            : 3;

            galleryEnableSmartGrouping = !!data.galleryEnableSmartGrouping;
            galleryEnableFallback = !!data.galleryEnableFallback;

            allowJPG = data.allowJPG !== false;
            allowJPEG = data.allowJPEG !== false;
            allowPNG = data.allowPNG !== false;
            allowWEBP = data.allowWEBP !== false;
            allowAVIF = data.allowAVIF !== false;
            allowBMP = data.allowBMP !== false;
            allowExtendedImageUrls = data.allowExtendedImageUrls !== false; // 🖼️ Allow extended image URLs (e.g., Twitter/X :large, :orig)

            showUserFeedbackMessages = data.showUserFeedbackMessages || false;
            enableClipboardHotkeys = data.enableClipboardHotkeys || false;
            enableOneClickIcon = data.enableOneClickIcon || false;

            maxOpenTabs = (data.maxOpenTabs >= 1 && data.maxOpenTabs <= 10) ? data.maxOpenTabs : 5;
            peekTransparencyLevel = (data.peekTransparencyLevel >= 0 && data.peekTransparencyLevel <= 1)
            ? data.peekTransparencyLevel
            : 0.8;
            performancePreset = data.performancePreset || "medium";
            // Display current settings by console
            logDebug(3, '------------------------------');
            logDebug(1, '🔄 Retrieving settings from storage...');
            logDebug('');
            // 🌍 Global settings
            logDebug(2, '🌍 Global settings.');
            // 📁 File system
            logDebug(3, '   📁 Download Folder');
            logDebug(3, `   Stored Download Folder: ${downloadFolder}`);
            logDebug(3, `   Custom Folder Path: ${customFolderPath}`);
            logDebug(3, '   📄 Allowed Image Formats:');
            logDebug(3, `      allow JPG?  ${allowJPG}`);
            logDebug(3, `      allow JPEG? ${allowJPEG}`);
            logDebug(3, `      allow PNG?  ${allowPNG}`);
            logDebug(3, `      allow WEBP? ${allowWEBP}`);
            logDebug(3, `      allow AVIF? ${allowAVIF}`);
            logDebug(3, `      allow BMP?  ${allowBMP}`);
            
            logDebug(3, `   📜 Filename Mode: ${filenameMode}`);
            logDebug(3, `      🔤 Prefix: ${prefix}`);
            logDebug(3, `      🔡 Suffix: ${suffix}`);
            
            logDebug(3, `   🐦 Allow extended image URLs: ${allowExtendedImageUrls}`);

            // 🌍 Clipboard hotkeys
            logDebug(2, '   📋 Clipboard hotkeys.');
            logDebug(3, `      📋 Clipboard hotkeys: ${enableClipboardHotkeys}`);
            logDebug(3, `      🖱️ One-click Download Icon: ${enableOneClickIcon}`);
            logDebug(3, `   📌 Max Simultaneous Downloads: ${downloadLimit}`);

            // 🌍 Galleries
            logDebug(2, '   🧠 Galleries.');
            logDebug(3, '     ☁️ Gallery Grouping');
            logDebug(3, `       🧠 Gallery similarity level: ${gallerySimilarityLevel}%`);
            logDebug(3, `       📦 Minimum group size: ${galleryMinGroupSize}`);
            logDebug(3, `       🤖 Smart grouping enabled: ${galleryEnableSmartGrouping}`);
            logDebug(3, `       🛟 Fallback grouping enabled: ${galleryEnableFallback}`);
            logDebug(3, `     🖼 Extract Gallery Mode: ${extractGalleryMode}`);
            logDebug(3, `     ⚡ Gallery Max Images/sec: ${galleryMaxImages}`);

            // 📐 Image size
            logDebug(2, '   ✅ Image size filters.');
            logDebug(3, `      📏 Minimum Image Width: ${minWidth}`);
            logDebug(3, `      📐 Minimum Image Height: ${minHeight}`);

            // 📢 Global Settings: Notifications
            logDebug(2, '   📢 User feedback messages.');
            logDebug(3, `       📢 User feedback messages: ${showUserFeedbackMessages}`);
            logDebug(3, `       📃 Peek panel transparency: ${peekTransparencyLevel}`);

            // 🐛 Debugging
            logDebug(2, '   🐜 Debugging.');
            logDebug(3, `       🐛 Debug logging level: ${debugLogLevel}`);

            // 📸 Bulk Image Download
            logDebug(3, '📸 Bulk Image Download functionality');
            logDebug(3, `   📌 Max image per batch: ${maxBulkBatch}`);
            logDebug(3, `   🔁 Continue bulk loop: ${continueBulkLoop}`);

            // 🔗 Web-Linked Gallery Settings
            logDebug(3, '🔗 Web-Linked Gallery Settings');
            logDebug(3, `   🔗 Max concurrent tabs: ${maxOpenTabs}`);
            logDebug(3, `   ⏱️ Delay between tabs (Web-Linked Gallery): ${webLinkedGalleryDelay} ms`);

            // ⚙️ Performance preset
            logDebug(3, '⚙️ Performance Preset: ' + performancePreset);

            logDebug(3, '');
            logDebug(2, '✅ Settings loaded and applied.');
            logDebug(3, '------------------------------');
        });
    }

loadSettings();

/**
 * * 🔄 Listen for live updates to chrome.storage.sync and apply them immediately
 * * @description This function listens for changes in chrome.storage.sync and updates the settings variables accordingly.
 * * It logs the changes to the console for debugging purposes.
 */
chrome.storage.onChanged.addListener((changes) => {
    const updatedDetails = [];
    logDebug(1, '🔄 Detected live update of settings');

    for (const key in changes) {
        const newValue = changes[key].newValue;
        const oldValue = changes[key].oldValue;

        switch (key) {
            case "downloadFolder": downloadFolder = newValue; break;
            case "customFolderPath": customFolderPath = newValue.replace(/[<>:"/\\|?*]+/g, ''); break;
            case "downloadLimit": downloadLimit = newValue; break;
            case "debugLogLevel":
            debugLogLevel = (typeof newValue === 'number' && [0,1,2,3].includes(newValue))
                ? newValue
                : 0;
            break;
            case "filenameMode": filenameMode = newValue; break;
            case "prefix": prefix = sanitizeFilenameComponent(newValue); break;
            case "suffix": suffix = sanitizeFilenameComponent(newValue); break;
            case "extractGalleryMode": extractGalleryMode = newValue; break;
            case "minWidth": minWidth = newValue; break;
            case "minHeight": minHeight = newValue; break;
            case "galleryMaxImages": galleryMaxImages = newValue; break;
            case "maxBulkBatch": maxBulkBatch = newValue; break;
            case "continueFromLastBulkBatch": continueBulkLoop = newValue; break;
            case "allowJPG": allowJPG = newValue; break;
            case "allowJPEG": allowJPEG = newValue; break;
            case "allowPNG": allowPNG = newValue; break;
            case "allowWEBP": allowWEBP = newValue; break;
            case "allowAVIF": allowAVIF = newValue; break;
            case "allowBMP": allowBMP = newValue; break;
            case "allowExtendedImageUrls": allowExtendedImageUrls = newValue; break; // 🖼️ Allow extended image URLs (e.g., Twitter/X :large, :orig)

            case "gallerySimilarityLevel": gallerySimilarityLevel = newValue; break;
            case "galleryMinGroupSize": galleryMinGroupSize = newValue; break;
            case "galleryEnableSmartGrouping": galleryEnableSmartGrouping = newValue; break;
            case "galleryEnableFallback": galleryEnableFallback = newValue; break;
            case "showUserFeedbackMessages": showUserFeedbackMessages = newValue; break;
            case "enableClipboardHotkeys": enableClipboardHotkeys = newValue; break;
            case "maxOpenTabs": maxOpenTabs = newValue; break;
            case "webLinkedGalleryDelay": webLinkedGalleryDelay = newValue; break;
            case "peekTransparencyLevel": peekTransparencyLevel = newValue; break;
            case "enableOneClickIcon": enableOneClickIcon = newValue; break;
            case "performancePreset": performancePreset = newValue; break;
            default: logDebug(2, `⚠️ Unknown setting changed: ${key}`); break;
        }

        updatedDetails.push(`${key}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
    }

    logDebug(2, `🆕 Settings updated in memory:\n 📌 ${updatedDetails.join('\n - ')}`);
    logDebug(3, '');
});

/**
 * 🧠 Utility: Validates a message before handling
 * @param {*} message - The message object to validate.
 * @returns {boolean} - Returns true if the message is valid, false otherwise.
 * @description This function checks if the message is an object and has a valid action property.
 */
function validateMessage(message) {
    return message && typeof message === 'object' && typeof message.action === 'string';
}

/**
 * 🧠 Utility: Sends response safely
 * @param {function} sendResponse - The callback function to send the response.
 * @param {object} payload - The payload to send in the response.
 * @returns {void}
 * @description This function attempts to send a response using the sendResponse callback.
 */
function respondSafe(sendResponse, payload) {
    try {
        sendResponse(payload);
    } catch (err) {
        logDebug(1, '⚠️ sendResponse failed:', err.message);
    }
}

/**
 *
 */
/**
 * 📩 Main message handler for core extension functionalities
 * 🧠 Listen for messages from the popup or content scripts
 * @param {object} message - The message object sent from the popup or content script.
 * @param {object} sender - The sender object containing information about the sender.
 * @param {function} sendResponse - The callback function to send the response.
 * @description This function listens for messages from the popup or content scripts and handles them accordingly.
 */
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    try {

        let injectionsCompleted = 0;

        if (!validateMessage(message)) return false;
        logDebug(1, `🚀 Received message: ${message.action}`);
        logDebug(2, '🧪 Full message received: ', JSON.stringify(message));
        logDebug(3, '');

        // ✅ Check if message has action property
        if (!message || !message.action) {
            logDebug(2, '⚠️ Message received without action. Ignored.');
            return;
        } else {
            logDebug(2, '✅ Message received with action: ' + message.action);
        }

        // ✅ Handle bulk download action
        // Flow: 1 - Download images directly in tabs
        if (message.action === 'bulkDownload') {
            logDebug(1, '📷 Initiating Bulk Image Download flow.');
            
            // Show processing indicator before starting analysis
            setBadgeProcessing();

            try {
                // ✅ No need to check sender.tab.id for bulkDownload
                handleBulkDownload(message, sendResponse);
            } catch (e) {
                logDebug(1, '❌ Critical error before processing bulkDownload: ' + e.message);
                logDebug(1, '🐛 Stacktrace: ', e.stack);
                respondSafe(sendResponse, { success: false, error: e.message });
            }
            return true;
        }

        // ✅ Handle gallery extraction (linked images)
        // Flow: 2 - Extract images from galleries (with direct links)
        if (message.action === 'extractLinkedGallery') {
            logDebug(1, '🌄 Extract Linked Gallery flow started.');
            
            // Show processing indicator before starting analysis
            setBadgeProcessing();
            try {
                if (!message.payload || typeof message.payload !== 'object') {
                    throw new Error('Payload is missing or not an object');
                }
                if (!message.payload.options || typeof message.payload.options !== 'object') {
                    throw new Error('Missing or invalid options in payload');
                }
                const tabId = sender.tab?.id;
                if (!tabId) throw new Error('Invalid sender tab ID');

                // ✅ Validate payload properties
                handleExtractLinkedGallery(message.payload, sendResponse)
                .then((result) => respondSafe(sendResponse, result))
                .catch((error) => {
                  logDebug(1, '❌ Error in Linked Gallery flow: ' + error.message);
                  logDebug(2, `🐛 Stacktrace: ${error.stack}`);
                  respondSafe(sendResponse, { success: false, error: error.message });
                });
            } catch (e) {
                logDebug(1, '❌ Critical error before processing extractLinkedGallery: ' + e.message);
                logDebug(2, '🐛 Stacktrace: ', e.stack);
                respondSafe(sendResponse, { success: false, error: e.message });
            }
            return true;
        }

        // ✅ Handle gallery extraction (visual detection)
        // Flow: 3 - Extract images from galleries (without links)
        if (message.action === 'extractVisualGallery') {
            logDebug(2, '🖼️ BEGIN: Extract Visual Gallery flow started.');
            
            // Show processing indicator before starting analysis
            setBadgeProcessing();

            try {
                if (!message.payload || typeof message.payload !== 'object') {
                    throw new Error('Payload is missing or not an object');
                }
                if (!message.payload.options || typeof message.payload.options !== 'object') {
                    throw new Error('Missing or invalid options in payload');
                }
                if (!message.payload.baseUrl || typeof message.payload.baseUrl !== 'string') {
                    throw new Error('Missing or invalid baseUrl in payload');
                }
                const tabId = sender.tab?.id;
                if (!tabId) throw new Error('Invalid sender tab ID');

                handleExtractVisualGallery(message.payload, sendResponse);
                logDebug(2, '✅ END: Bulk download process completed.');
                return true;

            } catch (e) {
                logDebug(1, '❌ Critical error before processing extractVisualGallery: ' + e.message);
                logDebug(1, '🐛 Stacktrace: ', e.stack);
                respondSafe(sendResponse, { success: false, error: e.message });
            }
            return true;
        }

        // ✅ Handle Web-Linked Gallery extraction
        // Flow: 4 - Extract images from web-linked galleries
        if (message.action === 'processWebLinkedGallery') {
            logDebug(1, '🔗 BEGIN: Extract Web-Linked Gallery (background handler)');
            
            // Show processing indicator before starting analysis
            setBadgeProcessing();
            
            logDebug(3, '');

            try {
                
                const timing = logTimingStart("processWebLinkedGallery");
                
                const candidates = message.images;
                if (!Array.isArray(candidates) || candidates.length === 0) {
                    throw new Error("Missing or invalid image candidates.");
                }

                const urls = candidates.filter(url => typeof url === 'string' && url.startsWith('http'));
                const total = urls.length;
                const concurrencyLimit = Math.max(1, Math.min(10, maxOpenTabs));
                let opened = 0;
                let index = 0;

                logDebug(2, `📦 Candidates: ${total}`);
                logDebug(2, `🔄 Max concurrent tabs: ${concurrencyLimit}`);
                logDebug(3, '');

                // 🧠 Validate URLs
                // This will filter out any invalid URLs
                async function openNextTabsControlled() {
                    try {
                        const delayBetweenTabs = Math.max(100, Math.min(3000, webLinkedGalleryDelay));
                        logDebug(1, `🔗 BEGIN: Opening ${total} tabs...`);
                        logDebug(2, `⏱️ Delay between openings: ${delayBetweenTabs} ms`);
                        logDebug(3, '');
                        updateBadge(0); // 🟢 Initialize badge in green

                        // ✅ Capture base tab index once
                        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                        const baseTabIndex = (activeTab && typeof activeTab.index === 'number') ? activeTab.index : 0;
                        logDebug(2, `🧭 Base tab index: ${baseTabIndex}`);

                        let activeOpenings = 0;
                        let tabsOpened = 0;

                        // 🧠 Recursive function to open tabs with controlled concurrency
                        function tryOpenNext() {
                            // 🧠 Check if we have reached the end of the list
                            if (index >= total) {
                                if (activeOpenings === 0) {
                                    logDebug(1, `🏁 All tabs opened successfully.`);
                                    logDebug(1, "💾 End: Finished injecting save icon script into tabs");
                                    updateBadge(tabsOpened, true);
                                    respondSafe(sendResponse, { success: true });
                                }
                                return;
                            }

                            // 🧠 Check if we can open more tabs
                            if (activeOpenings < concurrencyLimit) {
                                const currentUrl = urls[index];
                                const targetIndex = baseTabIndex + 1 + tabsOpened; // 🔧 Corrige dirección (hacia la derecha)

                                // 🧠 Validate URL format
                                chrome.tabs.create({ url: currentUrl, active: false, index: targetIndex }, (tab) => {
                                    if (chrome.runtime.lastError) {
                                        if (chrome.runtime.lastError.message.includes('429')) {
                                            logDebug(1, `⚠️ Rate limit hit (429). Delaying retry.`);
                                            setTimeout(tryOpenNext, delayBetweenTabs * 2);
                                        } else {
                                            logDebug(1, `🧟 Failed to open tab: ${chrome.runtime.lastError.message}`);
                                            setTimeout(tryOpenNext, delayBetweenTabs);
                                        }
                                    } else {
                                        tabsOpened++;
                                        updateBadge(tabsOpened);
                                        logDebug(2, `✅ Opened tab ${index + 1} of ${total}: ${currentUrl}`);

                                        // 🚀 NEW: Inject save icon if option enabled
                                        if (enableOneClickIcon) {
                                            chrome.scripting.executeScript({
                                                target: { tabId: tab.id },
                                                files: ["script/injectSaveIcon.js"]
                                            }, () => {
                                                if (chrome.runtime.lastError) {
                                                    logDebug(1, `❌ Failed to inject save icon: ${chrome.runtime.lastError.message}`);
                                                } else {
                                                    logDebug(2, `💾 Save icon injected into tabId ${tab.id}`);
                                                }
                                            });
                                        }

                                        setTimeout(tryOpenNext, delayBetweenTabs);
                                    }
                                    activeOpenings--;
                                });


                                index++;
                                activeOpenings++;
                            } else {
                                setTimeout(tryOpenNext, delayBetweenTabs);
                            }
                        }

                        tryOpenNext();

                    } catch (err) {
                        logDebug(1, `❌ Exception in openNextTabsControlled: ${err.message}`);
                        respondSafe(sendResponse, { success: false, error: err.message });
                    }
                }

                // 🧠 Start opening tabs with controlled concurrency
                logDebug(1, `💉 Begin: Injecting save icon script into tabs`);
                openNextTabsControlled();
                
                // respondSafe(sendResponse, { success: true });
            } catch (err) {
                logDebug(1, `❌ Error in Web-Linked Gallery flow: ${err.message}`);
                logDebug
                respondSafe(sendResponse, { success: false, error: err.message });
            }

            return true;
        }

        // ✅ Handle manual image download from 💾 overlay
        if (message.action === 'manualDownloadImage') {
            logDebug(3, '');
            logDebug(1, '💾 BEGIN: Manual image download requested.');

            setBadgeProcessing();
                    
            try {
                const imageUrl = message.imageUrl;
                if (!imageUrl || typeof imageUrl !== 'string') {
                    throw new Error("Invalid image URL received.");
                }

                const allowExtended = allowExtendedImageUrls ?? false;
                const extendedSuffixPattern = /(\.(jpe?g|jpeg|png|webp|bmp|avif))(:[a-zA-Z0-9]{2,10})$/i;
                const hasExtendedSuffix = extendedSuffixPattern.test(imageUrl);

                let urlForDownload;
                if (allowExtended && hasExtendedSuffix) {
                    urlForDownload = normalizeImageUrl(imageUrl);
                    logDebug(2, `🔵 [Manual] Extended suffix detected and allowed. Using normalized URL: ${urlForDownload}`);
                } else {
                    urlForDownload = imageUrl;
                    logDebug(2, `🟢 [Manual] No extended suffix detected or not allowed. Using original URL.`);
                }

                logDebug(2, `🔗 Processing URL: ${urlForDownload}`);

                const urlObj = new URL(urlForDownload);
                let baseName = urlObj.pathname.split('/').pop() || 'image';
                let extension = '';
                if (baseName.includes('.')) {
                    const lastDot = baseName.lastIndexOf('.');
                    extension = baseName.slice(lastDot);
                    baseName = baseName.slice(0, lastDot);
                }

                // ✅ Wait for BOTH: storage (folder) and utils/configCache (naming)
                await Promise.all([configReady, settingsReady]);

                (async () => {
                    try {
                        // Generate final filename with prefix/suffix/timestamp (from utils/configCache)
                        const finalName = await generateFilename(baseName, extension);

                        // Normalize custom subfolder (relative under default Downloads)
                        const safeFolder = (downloadFolder === 'custom' && typeof customFolderPath === 'string' && customFolderPath.trim())
                            ? customFolderPath.trim().replace(/\\/g, '/').replace(/\/+$/, '')
                            : '';

                        const finalPath = safeFolder ? `${safeFolder}/${finalName}` : finalName;
                        logDebug(2, `📁 Saving folder/file (requested): ${finalPath}`);

                        // 🔒 Register the desired filename so the listener can enforce it
                        pendingDownloadPaths.set(urlForDownload, finalPath);

                        chrome.downloads.download({
                            url: urlForDownload,
                            // filename is still passed (harmless); listener will enforce it anyway
                            filename: finalPath,
                            conflictAction: 'uniquify'
                        }, (downloadId) => {
                            if (downloadId) {
                                // ACK early to keep message port healthy in MV3
                                respondSafe(sendResponse, { success: true });

                                try {
                                    chrome.downloads.search({ id: downloadId }, (items) => {
                                        const resolved = items && items[0] ? items[0].filename : finalPath;
                                        logDebug(1, '💾 Manual image download (resolved path): ', resolved);
                                    });
                                } catch (auditErr) {
                                    logDebug(1, `⚠️ Could not audit saved path: ${auditErr.message}`);
                                    logDebug(3, `🐛 Stacktrace: ${auditErr.stack}`);
                                }

                                const tabId = sender?.tab?.id;
                                if (tabId) {
                                    setBadgeFinished();
                                    closeTabSafely(tabId);
                                    logDebug(2, '💾 END: Manual image download.');
                                    logDebug(3, '');
                                }
                            } else {
                                logDebug(1, `❌ Manual download failed for: ${urlForDownload}`);
                                respondSafe(sendResponse, { success: false, error: "Download failed" });
                                // Cleanup on failure
                                pendingDownloadPaths.delete(urlForDownload);
                            }
                        });
                    } catch (err) {
                        logDebug(1, `❌ Failed to prepare manual download: ${err.message}`);
                        logDebug(3, `🐛 Stacktrace: ${err.stack}`);
                        respondSafe(sendResponse, { success: false, error: err.message });
                    }
                })();

            } catch (e) {
                logDebug(1, `❌ Error handling manual download: ${e.message}`);
                logDebug(3, `🐛 Stacktrace: ${e.stack}`);
                respondSafe(sendResponse, { success: false, error: e.message });
            }

            return true;
        }



        respondSafe(sendResponse, { success: false, error: "Unknown action." });

    } catch (error) {
        logDebug(1, `❌ Unhandled error in message handler: ${error.message}`);
        logDebug(3, '🐛 Stacktrace: ', error.stack);
        sendResponse({ success: false, error: "Internal error occurred in background script." });
    }
});

// 🎯 Command listener: One-click download icon (injects floating download icon if enabled)
chrome.commands.onCommand.addListener(async (command) => {
    try {
        if (command !== "open-oneclick-icon") {
            logDebug(1, `⚠️ Unknown command received: "${command}"`);
            logDebug(2, "💡 Unknown hotkey. Please verify 'commands' in manifest.json and feature toggle in options.");
            return;
        }

        logDebug(1, "🖱️ Hotkey 'open-oneclick-icon' triggered.");
            
        // Show processing indicator before starting analysis
        setBadgeProcessing();
            

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.id) {
            logDebug(1, "⛔ No active tab found. Cannot inject One-click icon.");
            return;
        }

        // 🧠 Check if the One-click download icon is enabled in options
        const result = await new Promise((resolve, reject) => {
            try {
                chrome.storage.sync.get("enableOneClickIcon", (data) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(data);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });

        if (!result.enableOneClickIcon) {
            logDebug(1, "⚠️ One-click download icon is disabled in options. Injection aborted.");
            return;
        }

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["script/injectSaveIcon.js"]
        });

        logDebug(1, "✅ One-click download icon injected successfully.");
    } catch (error) {
        logDebug(1, `❌ Failed to inject One-click icon: ${error.message}`);
        logDebug(2, `🐛 Stacktrace: ${error.stack}`);
    }
});

/**
 * 📸 Handle Download images directly in tabs
 * @param {object} message - The message object sent from the popup or content script.
 * @param {function} sendResponse - The callback function to send the response.
 * @description This function handles the bulk image download functionality by filtering valid image tabs and processing them in batches.
 * It also updates the badge with the number of images downloaded and shows notifications for success or error messages.
 * @returns {void}
 */
async function handleBulkDownload(message, sendResponse) {
    logDebug(3, '------------------------------------');

    const validatedUrls = new Set();
    let totalProcessed = 0;
    let batchIndex = 0;

    // 🕒 Start timing metric
    const timing = logTimingStart("Download images directly in tabs");

    // 🚦 Continue bulk loop flag
    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        
        const activeTabIndex = message.activeTabIndex;
        
        // TODO: sometimes this objet (filteredTabs) is 0! Why?
        const filteredTabs = tabs.filter(tab => tab.index >= activeTabIndex);
        const validTabs = [];

        logDebug(2, '🔎 BEGIN: Filtering image tabs...');
        logDebug(3, ' ');

        // 🧠 Filter tabs to find valid image URLs
        for (const tab of filteredTabs) {
            try {
                logDebug(3, `🕵 Checking tab id: ${tab.id}`);
                logDebug(3, `⏳ Is a direct image URL?: ${tab.url}`);

                const allowExtended = allowExtendedImageUrls ?? false;
                const extendedSuffixPattern = /(\.(jpe?g|jpeg|png|webp|bmp|avif))(:[a-zA-Z0-9]{2,10})$/i;
                const hasExtendedSuffix = extendedSuffixPattern.test(tab.url);

                let urlForValidation;
                if (allowExtended && hasExtendedSuffix) {
                    urlForValidation = normalizeImageUrl(tab.url); // Use clean version to validate
                    logDebug(2, `🔵 Validating normalized URL for image: ${urlForValidation}`);
                } else {
                    urlForValidation = tab.url;
                    logDebug(3, `🟢 Validating original URL for image: ${urlForValidation}`);
                }

                const isDirectImage = await isDirectImageUrl(urlForValidation);
                if (!isDirectImage) {
                    logDebug(2, `😒 Not an allowed image format!`);
                    logDebug(2, '⏩ Skipping this tab...');
                    logDebug(3, '');
                    continue;
                }

                logDebug(2, '✅ Valid image found!');
                logDebug(3, '');
                validTabs.push(tab);
            } catch (err) {
                logDebug(1, `❌ Error validating tab URL: ${err.message}`);
            }
        }


        logDebug(2, `🔎 END: ${validTabs.length} valid image tabs found`);
        logDebug(3, '------------------------------------');
        logDebug(3, '');
		
		// 🚦 Block if no valid tabs found for download
		if (validTabs.length === 0) {
			try {
				logDebug(1, "⛔ No valid image tabs detected. Aborting download process.");
				logDebug(2, "💡 Tip: Try using 'Extract Gallery' or 'Web-Linked Gallery' instead.");

				if (showUserFeedbackMessages) {
					showUserMessage("No valid images found in tabs. Use gallery extraction instead.", "error");
				}

				// 🧹 Clean up visual badge and internal counters
				updateBadge(0, true); // 🔵 Paint blue (final)
				validatedUrls.clear(); // Defensive cleanup

			} catch (validationError) {
				logDebug(1, `⚠️ Validation error: ${validationError.message}`);
			} finally {
				respondSafe(sendResponse, {
					success: false,
					downloads: 0,
					error: "No valid tabs for download."
				});
			}

			return;
		}

        // 🧪 Prepare batches
        let remainingTabs = [...validTabs];

        // 🧠 BEGIN: Batch cycle
        function processNextBatch() {
            if (remainingTabs.length === 0) {
                logDebug(1, '🛑 No remaining tabs. Ending process.');
                updateBadge(totalProcessed, true); // 🔵 Final badge
                respondSafe(sendResponse, { success: true, downloads: totalProcessed });
                return;
            }

            const currentBatch = (maxBulkBatch > 0)
                ? remainingTabs.slice(0, maxBulkBatch)
                : [...remainingTabs];

            remainingTabs = remainingTabs.slice(currentBatch.length);

            logDebug(2, `🔄 BEGIN: Batch #${++batchIndex} | Processing ${currentBatch.length} image tab(s)...`);

            // ✅ Process the current batch of valid tabs
            processValidTabs(currentBatch, (downloadsInBatch) => {
                // ✅ Update badge with total downloads so far
                if (typeof downloadsInBatch === 'number' && !isNaN(downloadsInBatch)) {
                    totalProcessed += downloadsInBatch;
                } else {
                    logDebug(2, `⚠️ Warning: downloadsInBatch is invalid (${downloadsInBatch}). Defaulting to 0.`);
                }

                logDebug(2, `🔴 END: Batch #${batchIndex} complete. Downloads so far: ${totalProcessed}`);

                if (continueBulkLoop && remainingTabs.length > 0) {
                    logDebug(3, ``);
                    logDebug(2, '🔁 Continue enabled. Next batch queued...');
                    processNextBatch();
                } else {
                    logDebug(1, '🏁 All batches processed. Finalizing badge...');
                    logDebug(2, `🔵 Final badge: ${totalProcessed} images downloaded.`);

                    logDebug(3, '');
                    updateBadge(totalProcessed, true); // 🔵 Paint blue at the real end
    	
                    // 🕒 End timing metric
                    logTimingEnd(timing);

                    // 🧹 Clean up memory references
                    validatedUrls.clear();
                    remainingTabs.length = 0;

                    logDebug(2, '🧹 Memory cleanup: validatedUrls and remainingTabs cleared');

                    respondSafe(sendResponse, { success: true, downloads: totalProcessed });

                }
            }, validatedUrls, batchIndex === 1, totalProcessed, timing);
        }

        processNextBatch();
    });
}


/**
 * 🔄 Process valid tabs for downloading
 * @param {Tab[]} validTabs - Direct image tabs to download
 * @param {function} onComplete - Callback when batch finishes
 * @param {Set} validatedUrls - Set of already processed URLs
 * @param {boolean} resetBadge - If true, resets badge (only in first batch)
 * @param {number} totalProcessed - Total images downloaded so far
 * @description This function processes valid tabs for downloading images. It validates the image size, generates a filename, and initiates the download.
 * It also handles the download limit and updates the badge with the number of images downloaded.
 * @returns {void}
 */
async function processValidTabs(validTabs, onComplete, validatedUrls, resetBadge = true, totalProcessed = 0) {
    let activeDownloads = 0;
    let completedTabs = 0;
    const totalTabs = validTabs.length;
    let successfulDownloads = 0;
    const queue = [...validTabs];

    if (resetBadge && totalProcessed === 0) updateBadge(0);

    // 🧠 Function to generate a unique filename based on the URL
    const tryNext = () => {
        if (activeDownloads >= downloadLimit || queue.length === 0) return;
        const tab = queue.shift();
        processTab(tab);
    };

    // Process batch of tabs
    async function processTab(tab) {
        let url; // Declare early so it's visible in all inner scopes
        try {
            // 🧭 Route for normal and extended URLs
            const allowExtended = allowExtendedImageUrls ?? false;
            const extendedSuffixPattern = /(\.(jpe?g|jpeg|png|webp|bmp|avif))(:[a-zA-Z0-9]{2,10})$/i;
            const hasExtendedSuffix = extendedSuffixPattern.test(tab.url);

            let chosenUrlString;

            if (allowExtended && hasExtendedSuffix) {
                // 🕵 Extended suffix present and allowed: normalize
                chosenUrlString = normalizeImageUrl(tab.url);
                logDebug(2, `🕵 Extended suffix detected and allowed.`);
                logDebug(3, `🔴 Original URL: ${tab.url}`);
                logDebug(3, `🟢 Normalized URL: ${chosenUrlString}`);
            } else {
                // 🕵 Normal URL or option not enabled: use as is
                chosenUrlString = tab.url;
                logDebug(3, `🕵 No extended suffix detected or not allowed. Using original URL.`);
                logDebug(3, `🟢 Original URL: ${chosenUrlString}`);
            }

            url = new URL(chosenUrlString);

            logDebug(3, ``);
            logDebug(2, `🛠️ BEGIN: Processing tab id: ${tab.id}`);
            logDebug(1, `🕵 Validating Url ${url.href}`);

            // ✅ Check if URL is already validated
            if (validatedUrls.has(url.href)) {
                logDebug(2, `🔁 Duplicate URL skipped`);
                logDebug(3, `🛠️ END: Tab id ${tab.id}`);
                completedTabs++;
                if (completedTabs === totalTabs) {
                    onComplete(successfulDownloads);
                } else {
                    tryNext();
                }
                return;
            }

            validatedUrls.add(url.href);

            try {
                // 🔍 Use normalized URL for fetch and validation
                const response = await fetch(url.href, { mode: 'cors' });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const blob = await response.blob();
                const bitmap = await createImageBitmap(blob);
                const width = bitmap.width;
                const height = bitmap.height;

                logDebug(3, `📏 Image dimensions: ${width}x${height}`);

                if (width < minWidth || height < minHeight) {
                    logDebug(2, `📉 Image too small. Skipping.`);
                    completedTabs++;
                    if (completedTabs === totalTabs) onComplete(successfulDownloads);
                    tryNext();
                    return;
                }

                const parts = url.pathname.split('/');
                const lastPart = parts.pop();
                const baseName = lastPart.split('.')[0] || 'image';
                const extension = '.' + (lastPart.split('.').pop() || 'jpg');

                // ✅ Wait for BOTH: storage (folder) and utils/configCache (naming)
                await Promise.all([settingsReady, configReady]);

                // ✅ Generate final filename based on user settings (prefix/suffix/timestamp)
                const finalName = await generateFilename(baseName, extension);

                activeDownloads++;

                // ⏳ Set a timeout to catch potential download stalls
                const timeout = setTimeout(() => {
                    activeDownloads--;
                    const failedUrl = url ? url.href : '[unknown]';
                    logDebug(1, `⏰ Timeout: download stalled for ${failedUrl}`);

                    completedTabs++;
                    if (completedTabs === totalTabs) onComplete(successfulDownloads);
                    else tryNext();
                }, 15000); // 15 seconds safety timeout

                // 📁 Determine full path based on user settings (with robust normalization)
                let finalPath;
                try {
                    const isCustom = (downloadFolder === 'custom' && typeof customFolderPath === 'string' && customFolderPath.trim());
                    if (isCustom) {
                        const safeFolder = customFolderPath
                            .trim()
                            .replace(/\\/g, '/')
                            .replace(/^\/+|\/+$/g, ''); // strip leading/trailing slashes
                        finalPath = safeFolder ? `${safeFolder}/${finalName}` : finalName;
                        logDebug(3, `📁 Using custom folder path: ${finalPath}`);
                    } else {
                        finalPath = finalName;
                        logDebug(3, `📁 Using default download folder`);
                    }
                } catch (err) {
                    logDebug(1, `❌ Error building download path: ${err.message}`);
                    logDebug(2, `🐛 Stacktrace: ${err.stack}`);
                    finalPath = finalName;
                }

                // 🔒 Register desired path so the onDeterminingFilename listener can enforce it
                pendingDownloadPaths.set(url.href, finalPath);

                // 🚀 Begin the download process with normalized URL
                chrome.downloads.download({
                    url: url.href, // normalized (no :large)
                    // filename is still passed; listener will enforce it anyway
                    filename: finalPath,
                    conflictAction: 'uniquify'
                }, (downloadId) => {
                    clearTimeout(timeout); // ✅ Clear timeout on response
                    activeDownloads--;

                    // ✅ Check if download was successful
                    if (downloadId) {
                        logDebug(1, `✅ Download started: ${finalPath}`);
                        successfulDownloads++;
                        updateBadge(totalProcessed + successfulDownloads);

                        // ✅ Close the tab and move to next
                        closeTabSafely(tab.id, () => {
                            completedTabs++;
                            if (completedTabs === totalTabs) onComplete(successfulDownloads);
                            else tryNext();
                        });

                    } else {
                        logDebug(1, `❌ Download failed for Url.`);
                        completedTabs++;
                        if (completedTabs === totalTabs) onComplete(successfulDownloads);
                        else tryNext();

                        // 🔄 Cleanup on failure
                        pendingDownloadPaths.delete(url.href);
                    }
                });

            } catch (err) {
                logDebug(1, `❌ Failed to validate or download image (Failed to fetch image. This may be due to CORS policy, server unavailability or network issue): ${err.message}`);
                logDebug(2, `🐛 Stacktrace: ${err.stack}`);
                completedTabs++;
                if (completedTabs === totalTabs) onComplete(successfulDownloads);
                else tryNext();
            }

        } catch (err) {
            logDebug(1, `❌ Error processing tab: ${err.message}`);
            logDebug(2, `🐛 Stacktrace: ${err.stack}`);
            completedTabs++;
            if (completedTabs === totalTabs) onComplete(successfulDownloads);
            else tryNext();
        }
    }

    tryNext();
}

/**
 * 🌄 Handle Extract images from galleries (with direct links)
 * @param {object} message - The message object sent from the popup or content script.
 * @param {function} sendResponse - The callback function to send the response.
 * @description This function handles the extraction of gallery images by filtering valid image URLs and processing them in batches.
 * It also updates the badge with the number of images downloaded and shows notifications for success or error messages.
 * @returns {void}
 */
async function handleExtractLinkedGallery(message, sendResponse) {
    logDebug(3, '--------------------------------------------------');
    logDebug(2, '🌄 BEGIN: Extract images from galleries (with direct links) functionality');
    logDebug(3, '--------------------------------------------------');

    const timing = logTimingStart("Extract images from galleries (with direct links)");
    const { images, totalImages } = message || {};

    // 🧠 Grouping gallery candidates by path similarity (80% threshold)
    logDebug(2, '🧠 Grouping gallery candidates by path similarity...');

    const threshold = gallerySimilarityLevel || 80; // Default threshold
    const similarityMap = {};
    let dominantGroup = [];

    logDebug(2, `📥 Configuration Mode: ${extractGalleryMode}`);
    logDebug(2, `📥 Max images per second: ${galleryMaxImages}`);
    logDebug(3, '');

    // 🧠 Validate galleryEnableSmartGrouping and images input || Safe limit
    const MAX_GROUPING_CANDIDATES = 100;

    // 🧠 Validate images input
    if (galleryEnableSmartGrouping && Array.isArray(images) && images.length <= MAX_GROUPING_CANDIDATES) {
        logDebug(2, `🤖 BEGIN: Smart grouping enabled. ${images.length} candidates within safe limit (${MAX_GROUPING_CANDIDATES}).`);

        for (let i = 0; i < images.length; i++) {
            for (let j = i + 1; j < images.length; j++) {
                const similarity = calculatePathSimilarity(images[i], images[j]);
                logDebug(2, `🕵 Similarity between image ${i} and ${j}: ${similarity}%`);
                // 🧠 Check if similarity meets the threshold

                if (similarity >= threshold) {
                    if (!similarityMap[images[i]]) similarityMap[images[i]] = [];
                    similarityMap[images[i]].push(images[j]);
                }
            }
        }
    } else if (galleryEnableSmartGrouping && images.length > MAX_GROUPING_CANDIDATES) {
        logDebug(1, `⚠️ Smart grouping skipped: too many candidates (${images.length} > ${MAX_GROUPING_CANDIDATES}). Using all detected images.`);
        dominantGroup = [...images];

    } else {
        logDebug(2, '🚀 Smart grouping disabled. Using all detected images.');
        dominantGroup = [...images];
    }

    try{

        // 🧪 Check if galleryMinGroupSize is defined
        if (typeof galleryMinGroupSize === "undefined") {
            logDebug(1, '⚠️ Warning: galleryMinGroupSize is undefined. Applying fallback value 3.');
            galleryMinGroupSize = 3;
        }

        // 🧪 Check if dominant group is valid
        if (dominantGroup.length < galleryMinGroupSize) {
            logDebug(1, `⚠️ Group too small (${dominantGroup.length} < ${galleryMinGroupSize})`);

            // 🛟 Fallback to path similarity level (30% threshold)
            if (!galleryEnableFallback) {
                logDebug(1, '⛔ Fallback disabled. Aborting.');
                logDebug(3, '--------------------------------------------------');
                respondSafe(sendResponse, { success: false, error: 'Group too small and fallback disabled' });
                return;
            }

            // 🛟 Retry with fallback threshold
            const fallbackThreshold = Math.max(gallerySimilarityLevel - 10, 30);
            logDebug(3, `🛟 Retrying with fallback threshold: ${fallbackThreshold}%`);

            const fallbackMap = {};
            // 🧪 Calculate path similarity for fallback grouping
            for (let i = 0; i < images.length; i++) {
                for (let j = i + 1; j < images.length; j++) {
                    const similarity = calculatePathSimilarity(images[i], images[j]);
                    if (similarity >= fallbackThreshold) {
                        if (!fallbackMap[images[i]]) fallbackMap[images[i]] = [];
                        fallbackMap[images[i]].push(images[j]);
                    }
                }
            }

            dominantGroup = [];
            // 🧪 Identify dominant group from fallback map
            for (const [baseImage, group] of Object.entries(fallbackMap)) {
                const groupCandidate = [baseImage, ...group];
                if (groupCandidate.length > dominantGroup.length) {
                    dominantGroup = groupCandidate;
                }
            }

            // 🧪 Log fallback group
            if (dominantGroup.length < galleryMinGroupSize) {
                logDebug(1, '❌ Fallback failed. Group still too small.');
                logDebug(3, '--------------------------------------------------');
                respondSafe(sendResponse, { success: false, error: 'Fallback group too small' });
                return;
            } else {
                logDebug(1, `✅ Fallback group accepted. Size: ${dominantGroup.length}`);
            }
        }
    }catch (error) {
        logDebug(1, `⚠️ Error during group size validation: ${error.message}`);
        logDebug(2, `🐛 Stacktrace: ${error.stack}`);
        logDebug(3, '--------------------------------------------------');
        respondSafe(sendResponse, { success: false, error: 'Error during group size validation' });
        return;
    }

    // 🧪 Filter out invalid images from the dominant group
    if (!dominantGroup.length) {
        logDebug(2, '⚠️ No valid similarity group found. Skipping.');
        logDebug(3, '--------------------------------------------------');
        respondSafe(sendResponse, { success: false, error: 'No valid group by similarity' });
        return;
    }

    // 🧪 Filter out duplicates from the dominant group
    if (!Array.isArray(images) || images.length === 0 || !totalImages) {
        logDebug(2, '⚠️ No images provided for extraction.');
        logDebug(3, '--------------------------------------------------');
        logDebug(3, '');
        respondSafe(sendResponse, { success: false, error: 'No images to extract' });
        return;
    }

    updateBadge(0);
    let imagesProcessed = 0;
    const parsedDelayLimit = parseInt(message.options?.galleryMaxImages);

    const delay = (parsedDelayLimit >= 1 && parsedDelayLimit <= 10)
        ? 1000 / parsedDelayLimit
        : 1000 / galleryMaxImages;

    logDebug(2, `⏱️ Gallery download delay calculated: ${Math.round(delay)} ms per image`);
    logDebug(3, '--------------------------------------------------');
    logDebug(3, '');

    /**
     * * 🧠 Update badge with current progress
     * * @param {number} count - Number of images processed
     * * @param {boolean} isFinal - If true, set badge to blue
     * * @returns {void}
     */
    function onGalleryProgress() {
        imagesProcessed++;
        updateBadge(imagesProcessed);
        logDebug(2, `🔄 Progress: ${imagesProcessed} of ${totalImages}`);
        logDebug(3, '');

        if (imagesProcessed === totalImages) {
            updateBadge(imagesProcessed, true);
            logDebug(1, '✅ END: All gallery images processed.');
            logDebug(3, '--------------------------------------------------');
            logDebug(3, '');
        }
    }

    // 🧠 Download concurrency queue (respects downloadLimit)
    let activeDownloads = 0;
    const downloadQueue = [];

    // 🧠 Enqueue download tasks
    async function enqueueDownload(task) {
        return new Promise(resolve => {
            downloadQueue.push(() => task().then(resolve));
            processDownloadQueue();
        });
    }

    // 20250621 Smid - Not working - replaced by processImagesSequentially(...)
    // chrome.tabs.create is not optimized with Index
    // 🧠 Process images in batches with controlled concurrency
    async function openTabsInBatches(imageUrls, limit, onProgress) {

        let index = 0;
        const total = imageUrls.length;

        async function worker() {
            while (index < total) {
                const currentIndex = index++;
                const url = imageUrls[currentIndex];

                try {
                    await new Promise((resolve) => {
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            const activeTab = tabs[0];
                            const insertionIndex = activeTab ? activeTab.index + currentIndex + 1 : undefined;

                            const createProperties = { url, active: false };
                            if (typeof insertionIndex === 'number') {
                                createProperties.index = insertionIndex;
                            }

                            chrome.tabs.create(createProperties, () => {
                                logDebug(2, `🆕 Tab opened at index ${createProperties.index ?? 'default'} | URL: ${url}`);
                                onProgress();
                                resolve();
                            });
                        });
                    });
                } catch (err) {
                    logDebug(1, `[Mass image downloader]: ❌ Failed to open tab: ${url} | ${err.message}`);
                }
            }
        }

        const workers = [];
        for (let i = 0; i < limit; i++) {
            workers.push(worker());
        }

        await Promise.all(workers);
    }

    /**
     * * 🧠 Process the download queue
     */
    function processDownloadQueue() {
        while (activeDownloads < downloadLimit && downloadQueue.length > 0) {
            const next = downloadQueue.shift();
            activeDownloads++;
            next().finally(() => {
                activeDownloads--;
                processDownloadQueue();
            });
        }
    }

    // 🧠 Sequential processor with rate limiting
    async function processImagesSequentially(images, delayMs) {

        // ✅ One-time capture of the initial tab index
        let baseTabIndex = 0;
        let imagesOpened = 0;

        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0 && typeof tabs[0].index === 'number') {
                baseTabIndex = tabs[0].index;
                logDebug(2, `🧭 Initial tab index captured: ${baseTabIndex}`);
            } else {
                logDebug(1, `⚠️ Could not determine initial tab index. Defaulting to 0`);
            }
        } catch (tabErr) {
            logDebug(1, `❌ Failed to retrieve initial tab index: ${tabErr.message}`);
        }

        // ✅ Process each image URL in the gallery
        for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i];

            await new Promise(resolve => setTimeout(resolve, delayMs)); // 🕒 Delay between each image

            try {
                logDebug(3, '--------------------------------------------------');
                logDebug(2, `🔍 BEGIN: Processing gallery image index ${i}`);
                logDebug(2, `📷 Is a direct image URL?: ${imageUrl}`);

                // ✅ Step 1: Validate direct image URL
                // 🧪 Validate that the URL is a string
                if (typeof imageUrl !== 'string') {
                    logDebug(1, `⛔ Skipped (image URL is not a string): ${imageUrl}`);
                    logDebug(3, '--------------------------------------------------');
                    logDebug(3, '');
                    onGalleryProgress();
                    continue;
                }

                // 🔍 Check if it is a direct image with allowed format
                const isDirect = await isDirectImageUrl(imageUrl);

                if (!isDirect) {
                    logDebug(1, '⛔ Skipped (not a valid direct image or disallowed format).');
                    logDebug(3, '--------------------------------------------------');
                    logDebug(3, '');
                    onGalleryProgress();
                    continue;
                }

                // ✅ Step 2: Validate allowed image format
                const isAllowed = await isAllowedImageFormat(imageUrl);
                if (!isAllowed) {
                    logDebug(1, '⛔ Disallowed image format (skipped).');
                    logDebug(3, '--------------------------------------------------');
                    logDebug(3, '');
                    onGalleryProgress();
                    continue;
                }

                // ✅ Step 3: Extract gallery mode (tab or immediate)
                let mode = (typeof extractGalleryMode === 'string')
                ? extractGalleryMode.trim().toLowerCase()
                : 'tab';

                if (mode === 'tab') {
                    logDebug(1, '🔗 Mode is set to "tab". Opening image in new tab...');
                    logDebug(2, `🔗 URL: ${imageUrl}`);

                    // ✅ Use fixed base index captured once
                    const targetIndex = baseTabIndex + imagesOpened;

                    // ✅ Open image in new tab 
                    chrome.tabs.create({ url: imageUrl, active: false, index: targetIndex }, () => {
                        // ✅ Notifies gallery progress
                        onGalleryProgress(); 
                        logDebug(1, '🔚 END: Image opened in tab.');
                        logDebug(2, `📍 Tab opened at index: ${targetIndex}`);
                        logDebug(3, '--------------------------------------------------');
                    });
                    imagesOpened++;
                    continue;
                }


                // ✅ Step 4: Extract file name and extension robustly
                let fileName = 'image';
                let extension = '';
                try {
                    // Trim any trailing slashes so "/photo.jpg/" becomes "/photo.jpg"
                    const rawPath = new URL(imageUrl).pathname.replace(/\/+$/g, "");
                    // The segment after the last "/" is our raw name
                    const rawName = rawPath.split('/').pop() || '';

                    if (rawName.includes('.')) {
                        const lastDot = rawName.lastIndexOf('.');
                        fileName = rawName.slice(0, lastDot);
                        extension = rawName.slice(lastDot);
                    } else if (rawName) {
                        // No dot but a valid name
                        fileName = rawName;
                    }
                } catch (err) {
                    logDebug(1, `❌ Error extracting filename: ${err.message}`);
                }

                // ✅ Step 5: Generate final path (wait settings+config, then normalize folder)
                // Wait for BOTH: storage-backed folder and utils/configCache-based naming
                await Promise.all([settingsReady, configReady]);

                // Generate final filename after settings/config are ready
                const finalName = await generateFilename(fileName, extension);

                // Normalize custom folder and avoid leading/trailing slashes
                const safeFolder = (downloadFolder === 'custom' && typeof customFolderPath === 'string')
                    ? customFolderPath
                        .trim()
                        .replace(/\\/g, '/')
                        .replace(/^\/+|\/+$/g, '') // strip both ends
                    : '';

                const finalPath = safeFolder ? `${safeFolder}/${finalName}` : finalName;
                logDebug(2, `📁 Final name/path: ${finalPath}`);

                // ✅ Step 6: Download image using controlled queue
                if (mode === 'immediate') {
                    await enqueueDownload(async () => {
                        logDebug(3, '--------------------------------------------------');
                        logDebug(2, `📥 BEGIN: Download process for image index ${i}`);

                        try {
                            // ✅ Attempt early size validation using HEAD
                            let skipDownload = false;
                            try {
                                const headResp = await fetch(imageUrl, { method: 'HEAD' });
                                const contentLength = parseInt(headResp.headers.get('Content-Length'), 10);
                                if (!isNaN(contentLength) && contentLength < 20000) {
                                    logDebug(2, `⛔ Skipped: File too small by header (${contentLength} bytes)`);
                                    skipDownload = true;
                                }
                            } catch (headError) {
                                logDebug(2, `⚠️ HEAD request failed: ${headError.message}`);
                            }

                            if (skipDownload) {
                                logDebug(1, '🔚 END: Skipped by HEAD check');
                                logDebug(3, '--------------------------------------------------');
                                logDebug(3, '');
                                onGalleryProgress();
                                return;
                            }

                            // ✅ Fallback: Full size validation with bitmap
                            const response = await fetch(imageUrl);
                            const blob = await response.blob();
                            const bitmap = await createImageBitmap(blob);

                            if (bitmap.width < minWidth || bitmap.height < minHeight) {
                                logDebug(2, `⛔ Skipped (too small): (${bitmap.width}x${bitmap.height})`);
                                logDebug(1, '🔚 END: Skipped image index');
                                logDebug(3, '--------------------------------------------------');
                                logDebug(3, '');
                                onGalleryProgress();
                                return;
                            }

                            // 🔒 Register desired filename so the onDeterminingFilename listener can enforce it
                            pendingDownloadPaths.set(imageUrl, finalPath);

                            // ✅ Begin download (listener will enforce finalPath regardless of server headers)
                            await new Promise(resolve => {
                                chrome.downloads.download({
                                    url: imageUrl,
                                    filename: finalPath,           // still passed; listener enforces it
                                    conflictAction: 'uniquify'
                                }, (downloadId) => {
                                    if (downloadId) {
                                        logDebug(1, `💾 Downloaded: ${finalName}`);
                                    } else {
                                        logDebug(1, '❌ Download failed.');
                                        // Cleanup the map on failure
                                        pendingDownloadPaths.delete(imageUrl);
                                    }

                                    logDebug(2, `🔚 END: Download process for image index ${i}`);
                                    logDebug(3, '--------------------------------------------------');
                                    logDebug(3, '');

                                    onGalleryProgress();
                                    resolve();
                                });
                            });
                        } catch (err) {
                            logDebug(1, `❌ Error downloading image index: ${err.message}`);
                            logDebug(2, `🐛 Stacktrace: ${err.stack}`);
                            logDebug(2, '🔚 END: Download process for image index.');
                            logDebug(3, '--------------------------------------------------');
                            logDebug(3, '');
                            onGalleryProgress();
                        }
                    });
                }

            } catch (error) {
                logDebug(1, `⚠️ Error processing image index: ${error.message}`);
                logDebug(2, `🐛 Stacktrace: ${error.stack}`);
                logDebug(2, '🔚 END: Image index.');
                logDebug(3, '--------------------------------------------------');
                logDebug(3, '');
                onGalleryProgress();
            }
        }
    }
	
    // 🧠 Start new optimized loop
    await processImagesSequentially(dominantGroup, delay);

    //  🕒 End timing metric
    logTimingEnd(timing);

    respondSafe(sendResponse, { success: true });
}


/*
 * 🌄 Handle Extract images from galleries (without links)
 * @param {object} message - The message object sent from the popup or content script.
 * @param {function} sendResponse - The callback function to send the response.
 * @description This function handles the extraction of gallery images without links by validating image URLs, processing them in batches, and downloading them. 
 * It also updates the badge with the number of images downloaded and shows notifications for success or error messages.
 * 
*/
async function handleExtractVisualGallery(message, sendResponse) {
    logDebug(3, '---------------------------------------------------------------');
    logDebug(1, '🖼️ Extract images from galleries (without links) functionality - optimized flow');
    logDebug(3, '---------------------------------------------------------------');

    const timing = logTimingStart("Extract images from galleries (without links)");

    try {
        if (!message.images || !Array.isArray(message.images)) {
            logDebug(1, '❌ No images array received from content script.');
            respondSafe(sendResponse, { success: false, error: 'Invalid images list received.' });
            return;
        }

        const validatedImages = [];
        for (let i = 0; i < message.images.length; i++) {
            const img = message.images[i];
            const url = img.url;
            const width = img.width;
            const height = img.height;

            if (!url || typeof url !== 'string') continue;

            logDebug(2, `🕵 Validating image/Url: ${i + 1} | ${url}`);

            const isAllowed = await isAllowedImageFormat(url);
            if (!isAllowed) {
                logDebug(2, `⛔ Skipped (disallowed format).`);
                continue;
            }

            if (width < minWidth || height < minHeight) {
                logDebug(2, `⛔ Skipped (too small: ${width}x${height}).`);
                continue;
            }

            validatedImages.push(img);
            logDebug(2, `✅ Accepted!`);
        }

        if (validatedImages.length === 0) {
            logDebug(1, '⚠️ No valid images after filtering.');
            respondSafe(sendResponse, { success: false, error: 'No valid images to download.' });
            return;
        }

        updateBadge(0, false);
        let totalDownloaded = 0;

        const processNext = () => {
            // 🧪 Check if there are no more images to process
            if (validatedImages.length === 0) {
                updateBadge(totalDownloaded, true);
                logDebug(1, `🏁 Completed: ${totalDownloaded} images downloaded.`);
                logTimingEnd(timing);
                respondSafe(sendResponse, { success: true, downloads: totalDownloaded });
                return;
            }

            const next = validatedImages.shift();

            try {
                const urlObj = new URL(next.url);
                const pathname = urlObj.pathname;
                const extension = pathname.split('.').pop() || 'jpg';
                let baseName = pathname.split('/').pop() || 'image';

                // 🧪 Ensure baseName is sanitized: remove any leading/trailing slashes and normalize
                if (baseName.includes('.')) {
                    baseName = baseName.substring(0, baseName.lastIndexOf('.'));
                }

                const sanitizedBase = sanitizeFilenameComponent(baseName);

                // ✅ Always wait for BOTH settings (folder) and config (naming) before building filenames/paths
                (async () => {
                    try {
                        // Gate: ensure storage-backed folder and configCache-based naming are ready
                        await Promise.all([settingsReady, configReady]);

                        // Generate final filename after gates (prefix/suffix/timestamp are now reliable)
                        const finalName = await generateFilename(sanitizedBase, '.' + extension);

                        // Normalize custom subfolder: trim, normalize slashes, and strip leading/trailing slashes
                        const safeFolder = (downloadFolder === 'custom' && typeof customFolderPath === 'string' && customFolderPath.trim())
                            ? customFolderPath.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
                            : '';

                        const finalPath = safeFolder ? `${safeFolder}/${finalName}` : finalName;

                        logDebug(2, `📥 Downloading image: ${next.url}`);
                        logDebug(2, `📁 Final name/path: ${finalPath}`);

                        // 🔒 Register desired filename so onDeterminingFilename can enforce it against server overrides
                        pendingDownloadPaths.set(next.url, finalPath);

                        // Start the download; listener will enforce finalPath regardless of server headers
                        chrome.downloads.download({
                            url: next.url,
                            // filename is still passed; harmless as the listener will enforce it anyway
                            filename: finalPath,
                            conflictAction: 'uniquify'
                        }, (downloadId) => {
                            // ✅ Check if download was successful
                            if (chrome.runtime.lastError) {
                                logDebug(1, `❌ Download failed: ${chrome.runtime.lastError.message}`);
                                // Cleanup mapping on failure
                                pendingDownloadPaths.delete(next.url);
                            } else {
                                totalDownloaded++;
                                updateBadge(totalDownloaded, false);
                                logDebug(2, `⬇️ Downloaded: ${next.url}`);
                            }
                            processNext();
                        });
                    } catch (err) {
                        logDebug(1, `❌ Filename/path preparation failed: ${err.message}`);
                        logDebug(2, `🐛 Stacktrace: ${err.stack}`);
                        processNext();
                    }
                })();
            } catch (err) {
                logDebug(1, `❌ Error processing image: ${err.message}`);
                logDebug(2, `🐛 Stacktrace: ${err.stack}`);
                processNext();
            }
        };

        processNext();

    } catch (err) {
        logDebug(1, `❌ Exception in ExtractVisualGallery: ${err.message}`);
        logDebug(2, `🐛 Stacktrace: ${err.stack}`);
        respondSafe(sendResponse, { success: false, error: err.message });
    }
}

/**
 * Returns current timestamp formatted as HHh:MMm:SSs.
 * @returns {string}
 */
function getTimeStampString() {
    try {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        return `${h}h:${m}m:${s}s`;
    } catch (err) {
        logDebug(1, `❌ Error generating current time string: ${err.message}`);
        logDebug(3, `🐛 Stacktrace: ${err.stack}`);
        return '--:--:--';
    }
}

/**
 * Calculates elapsed time in HHh:MMm:SSs format.
 * @param {number} start - Start timestamp in milliseconds.
 * @param {number} end - End timestamp in milliseconds.
 * @returns {string}
 */
function calculateElapsedTime(start, end) {
    try {
        const delta = Math.max(0, end - start);
        const seconds = Math.floor((delta / 1000) % 60);
        const minutes = Math.floor((delta / (1000 * 60)) % 60);
        const hours = Math.floor(delta / (1000 * 60 * 60));
        return `${hours}h:${minutes}m:${seconds}s`;
    } catch (err) {
        logDebug(1, `❌ Error calculating elapsed time: ${err.message}`);
        logDebug(3, `🐛 Stacktrace: ${err.stack}`);
        return '--:--:--';
    }
}

/**
 * Logs the start of a download process.
 * @param {string} flowName - A short name describing the flow (e.g., "bulkDownload").
 * @returns {{flowName: string, startTime: number}} - Object with timestamp and name.
 */
function logTimingStart(flowName) {
    try {
        const startTime = Date.now();
        const readableTime = getTimeStampString();
        logDebug(1, `🕓 Start of ${flowName} process [time: ${readableTime}]`);
        return { flowName, startTime };
    } catch (err) {
        logDebug(1, `❌ Error logging timing start: ${err.message}`);
        logDebug(3, `🐛 Stacktrace: ${err.stack}`);
        return { flowName, startTime: Date.now() };
    }
}

/**
 * Logs the end of a download process and its total duration.
 * @param {{flowName: string, startTime: number}} timing - Object returned from logTimingStart.
 */
function logTimingEnd(timing) {
    try {
        const endTime = Date.now();
        const endReadable = getTimeStampString();
        const elapsed = calculateElapsedTime(timing.startTime, endTime);

        logDebug(1, `🏁 End of ${timing.flowName} process [time: ${endReadable}]`);
        logDebug(1, `⌛ ${timing.flowName} process took ${elapsed}`);
    } catch (err) {
        logDebug(1, `❌ Error logging timing end: ${err.message}`);
        logDebug(3, `🐛 Stacktrace: ${err.stack}`);
    }
}
