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
        initConfigCache,
        setBadgeError
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
    // 🕵️ Image Inspector – Global flags (default false; set on install and loadSettings)
    let imageInspectorEnabled = false;              // Hotkey toggle allowed?
    let imageInspectorDeveloperMode = false;        // Show dev-only fields in panel?
    let imageInspectorCloseOnSave = false;          // Close tab after save?

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
     * 🕒 Small async delay helper
     * @param {number} ms
     * @returns {Promise<void>}
     */
    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
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
                performancePreset: "medium", // 📊 Performance preset (default to medium)                
                // 🕵️ Image Inspector defaults
                imageInspectorEnabled: false,
                imageInspectorDeveloperMode: false,
                imageInspectorCloseOnSave: false
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

                // 🕵️ Inspector Panel
                logDebug(3, '   🕵️ Image Inspector Panel');
                logDebug(3, '      📐 Enable Image Inspector Mode (hotkey toggle): false');
                logDebug(3, '      🛠️ Developer Mode: false');
                logDebug(3, '      ❌ Close Panel After Save: false');

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
            "performancePreset",
            "imageInspectorEnabled", "imageInspectorDeveloperMode", 
            "imageInspectorCloseOnSave"
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
            // 🕵️ Image Inspector settings
            imageInspectorEnabled = !!data.imageInspectorEnabled;
            imageInspectorDeveloperMode = !!data.imageInspectorDeveloperMode;
            imageInspectorCloseOnSave = !!data.imageInspectorCloseOnSave;
            
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
            
            // 🕵️ Inspector Panel
            logDebug(2, '   🕵️ Image Inspector Panel.');
            logDebug(3, `      📐 Enable Image Inspector Mode (hotkey toggle): ${imageInspectorEnabled}`);
            logDebug(3, `      🛠️ Developer Mode: ${imageInspectorDeveloperMode}`);
            logDebug(3, `      ❌ Close tab After Save: ${imageInspectorCloseOnSave}`);
            

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

            // 🕵️ Image Inspector settings
            case "imageInspectorEnabled": imageInspectorEnabled = !!newValue; break;
            case "imageInspectorDeveloperMode": imageInspectorDeveloperMode = !!newValue; break;
            case "imageInspectorCloseOnSave": imageInspectorCloseOnSave = !!newValue; break;

            default: logDebug(2, `⚠️ Unknown setting changed: ${key}`); break;
        }

        updatedDetails.push(`Key changed: ${key}: From ${JSON.stringify(oldValue)} → To ${JSON.stringify(newValue)}`);
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
 * Sends a user toast to the sender tab (content script).
 * MV3 service workers have no DOM, so UI feedback must be rendered in-page.
 * @param {number} tabId
 * @param {string} text
 * @param {"info"|"success"|"error"} type
 */
function sendUserToastToTab(tabId, text, type = "info") {
    try {
        if (!tabId || typeof tabId !== "number") return;
        if (!text || typeof text !== "string") return;

        // 🔒 Respect user setting: do not show UI feedback if disabled
        if (!showUserFeedbackMessages) {
            logDebug(2, "🚫 User feedback messages disabled. Toast skipped.");
            return;
        }

        // Fire-and-forget message (no response expected)
        chrome.tabs.sendMessage(
            tabId,
            {
                action: "mdiUserToast",
                text,
                type
            },
            () => {
                // ✅ MV3: prevent "Receiving end does not exist" from surfacing as an uncaught error
                if (chrome.runtime.lastError) {
                    logDebug(2, `⚠️ Toast send skipped: ${chrome.runtime.lastError.message}`);
                }
            }
        );
    } catch (err) {
        logDebug(2, `⚠️ sendUserToastToTab failed: ${err.message}`);
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
                // ✅ Accept both message formats:
                // - Popup style: { action, payload: {...} }
                // - Content script / hotkey style: { action, images, totalImages, ... }
                const request = (message && typeof message.payload === "object" && message.payload)
                    ? message.payload
                    : message;

                const tabId = sender?.tab?.id;

                // ✅ Hotkeys always originate from a tab (MV3 ephemeral port)
                if (typeof tabId !== "number") {
                    throw new Error("Invalid sender tab ID (extractLinkedGallery).");
                }

                const candidateCount = Array.isArray(request.images) ? request.images.length : 0;

                // ✅ MV3: Immediate ACK to avoid "message port closed" warnings
                respondSafe(sendResponse, { success: true, ack: true });

                // ✅ User feedback (respects showUserFeedbackMessages internally)
                sendUserToastToTab(tabId, "MID: Gallery (linked / direct) started. Scanning page...", "info");

                if (candidateCount > 0) {
                    sendUserToastToTab(tabId, `MID: Gallery (linked / direct): found ${candidateCount} image(s). Downloading...`, "info");
                }

                // ✅ QA marker
                logDebug(1, `[Mass Image Downloader]: 🧾 START (async): handleExtractLinkedGallery() scheduled (tabId=${tabId})`);

                // ✅ Run asynchronously (do NOT rely on sendResponse after ACK)
                Promise.resolve()
                    .then(() => handleExtractLinkedGallery(request, (payload) => {
                        try {
                            const ok = !!(payload && payload.success);
                            logDebug(1, `[Mass Image Downloader]: 🧾 END (async): handleExtractLinkedGallery() completed (tabId=${tabId}) -> success=${ok}`);

                            // if payload is successful, show number of images downloaded; otherwise show error message
                            if (ok) {
                                const n = (payload && typeof payload.downloads === "number") ? payload.downloads : 0;
                                sendUserToastToTab(tabId, `MID: Gallery (linked / direct): completed. Downloaded: ${n} image(s).`, "success");
                            } else {
                                const errText = (payload && payload.error) ? payload.error : "Unknown error";
                                sendUserToastToTab(tabId, `MID: Gallery (linked / direct) failed: ${errText}`, "error");
                            }
                        } catch (toastErr) {
                            logDebug(2, `⚠️ Completion toast failed: ${toastErr.message}`);
                        }
                    }))
                    .catch((err) => {
                        const errMsg = (err && err.message) ? err.message : String(err);
                        logDebug(1, `❌ Linked Gallery async failure: ${errMsg}`);
                        logDebug(2, `🐛 Stacktrace: ${(err && err.stack) ? err.stack : "n/a"}`);
                        sendUserToastToTab(tabId, `MID: Gallery (linked / direct) failed: ${errMsg}`, "error");
                    });

                // ✅ We already ACKed synchronously
                return false;

            } catch (e) {
                logDebug(1, `❌ Critical error before processing extractLinkedGallery: ${e.message}`);
                logDebug(2, `🐛 Stacktrace: ${(e && e.stack) ? e.stack : "n/a"}`);
                respondSafe(sendResponse, { success: false, error: e.message });
                return true;
            }
        }


        // ✅ Handle gallery extraction (visual detection)
        // Flow: 3 - Extract images from galleries (without links)
        if (message.action === "extractVisualGallery") {
            logDebug(2, "🖼️ BEGIN: Extract Visual Gallery flow started.");

            // Show processing indicator before starting analysis
            setBadgeProcessing();

            try {
                // ✅ Accept both message formats:
                // - Legacy/content: { action, images: [...] }
                // - Payload style:  { action, payload: { images: [...] } }
                const request = (message && typeof message.payload === "object" && message.payload)
                    ? message.payload
                    : message;

                const tabId = sender?.tab?.id;
                const isTabOrigin = (typeof tabId === "number");

                const candidateCount = Array.isArray(request.images) ? request.images.length : 0;

                // ✅ MV3 hotkey/tab origin: ACK immediately to avoid "message port closed" warnings
                if (isTabOrigin) {
                    respondSafe(sendResponse, { success: true, ack: true });

                    // ✅ Minimal UX feedback (standardization comes in next phase)
                    sendUserToastToTab(tabId, `MID: Gallery (visual / no links) started. Scanning page...`, "info");
                    if (candidateCount > 0) {
                        sendUserToastToTab(tabId, `MID: Gallery (visual / no links): found ${candidateCount} image(s). Downloading...`, "info");
                    }

                    Promise.resolve()
                        .then(() => handleExtractVisualGallery(request, (payload) => {
                            const ok = !!(payload && payload.success);
                            const n = (payload && typeof payload.downloads === "number") ? payload.downloads : 0;

                            if (ok) {
                                sendUserToastToTab(tabId, `MID: Gallery (visual / no links): completed. Downloaded: ${n} image(s).`, "success");
                            } else {
                                const errText = (payload && payload.error) ? payload.error : "Unknown error";
                                sendUserToastToTab(tabId, `MID: Gallery (visual / no links): failed. ${errText}`, "error");
                            }
                        }))
                        .catch((err) => {
                            const errMsg = (err && err.message) ? err.message : String(err);
                            logDebug(1, `❌ Visual Gallery async failure: ${errMsg}`);
                            sendUserToastToTab(tabId, `MID: Gallery (visual / no links): failed. ${errMsg}`, "error");
                        });

                    return false; // ✅ Already ACKed synchronously
                }

                // ✅ Popup/extension origin: keep async response behavior
                Promise.resolve()
                    .then(() => handleExtractVisualGallery(request, sendResponse))
                    .catch((err) => {
                        const errMsg = (err && err.message) ? err.message : String(err);
                        logDebug(1, `❌ Error in Visual Gallery flow (popup origin): ${errMsg}`);
                        respondSafe(sendResponse, { success: false, error: errMsg });
                    });

                return true;

            } catch (e) {
                logDebug(1, `❌ Critical error before processing extractVisualGallery: ${e.message}`);
                logDebug(2, `🐛 Stacktrace: ${(e && e.stack) ? e.stack : "n/a"}`);
                respondSafe(sendResponse, { success: false, error: e.message });
                return true;
            }
        }

        // ✅ Inject Web-Linked Gallery extractor (triggered via Alt+Shift+W content hotkey)
        // Flow: 3.5 - Inject extractWebLinkedGallery.js via hotkey
        if (message.action === "injectWebLinkedGalleryExtractor") {
            logDebug(1, "🔗 BEGIN: Inject extractWebLinkedGallery.js (hotkey entry)");

            try {
                const tabId = sender?.tab?.id;
                if (!tabId) {
                    throw new Error("Invalid sender tab ID (injectWebLinkedGalleryExtractor).");
                }

                // Optional: mark trigger source for the injected script
                await chrome.scripting.executeScript({
                    target: { tabId },
                    func: (src) => { window.__mdiWebLinkedTriggerSource = src; },
                    args: [message.source || "hotkey"]
                });

                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ["script/extractWebLinkedGallery.js"]
                });

                logDebug(1, "✅ END: extractWebLinkedGallery.js injected successfully.");
                respondSafe(sendResponse, { success: true });
                return true;

            } catch (e) {
                logDebug(1, `❌ Failed to inject extractWebLinkedGallery.js: ${e.message}`);
                respondSafe(sendResponse, { success: false, error: e.message });
                return true;
            }
        }

        // ✅ Handle Web-Linked Gallery extraction
        // Flow: 4 - Extract images from web-linked galleries
        if (message.action === 'processWebLinkedGallery') {
            logDebug(1, '🔗 BEGIN: Extract Web-Linked Gallery (background handler)');
            
            // Show processing indicator before starting analysis
            setBadgeProcessing();
            
            logDebug(3, '');

            // ✅ Toast target (tab-origin)
            const tabId = sender?.tab?.id;
            const isTabOrigin = (typeof tabId === "number");

            // ✅ UX: Start toast (web-linked)
            if (isTabOrigin) {
                sendUserToastToTab(tabId, "MID: Web-linked gallery started. Scanning page...", "info");
            }

            try {
                
                const timing = logTimingStart("processWebLinkedGallery");
                
                const candidates = message.images;
                if (!Array.isArray(candidates) || candidates.length === 0) {
                    throw new Error("Missing or invalid image candidates.");
                }

                const urls = candidates.filter(url => typeof url === 'string' && url.startsWith('http'));
                const total = urls.length;

                // ✅ UX: b) MID: Web-linked Gallery - analyzing / send to download
                if (isTabOrigin) {
                    sendUserToastToTab(tabId, `MID: Web-linked gallery: found ${total} page(s). Opening...`, "info");
                }

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
                        // ⏱️ Global rate limiter to enforce real spacing between tab openings (anti-429)
                        let nextOpenAt = 0;

                        // 🧠 Recursive function to open tabs with controlled concurrency
                        function tryOpenNext() {
                            // 🧠 Check if we have reached the end of the list
                            if (index >= total) {
                                if (activeOpenings === 0) {
                                    logDebug(1, `🏁 All tabs opened successfully.`);
                                    logDebug(1, "💾 End: Finished injecting save icon script into tabs");
                                    updateBadge(tabsOpened, true);

                                    // ✅ if tab-origin, show completion toast with count
                                    if (index >= total) {
                                        // ✅ UX: Completed toast (web-linked)
                                        if (activeOpenings === 0) {
                                            logDebug(1, `🏁 All tabs opened successfully.`);
                                            logDebug(1, "💾 End: Finished injecting save icon script into tabs");
                                            updateBadge(tabsOpened, true);

                                            // ✅ UX: c) MID: Web-linked Gallery - done - n images downloaded | n pages opened
                                            if (isTabOrigin) {
                                                sendUserToastToTab(
                                                    tabId,
                                                    `MID: Web-linked gallery completed. Opened: ${tabsOpened} tab(s).`,
                                                    "success"
                                                );
                                            }

                                            respondSafe(sendResponse, { success: true });
                                        }
                                        return;
                                    }

                                }
                                return;
                            }

                            // 🧠 Check if we can open more tabs
                            if (activeOpenings < concurrencyLimit) {
                                const currentUrl = urls[index];
                                const targetIndex = baseTabIndex + 1 + tabsOpened; // 🔧 Corrige dirección (hacia la derecha)

                                // 🧠 Validate URL format
                                // ⏱️ Enforce real spacing between openings (anti-burst / anti-429)
                                const now = Date.now();
                                const baseDelay = delayBetweenTabs;
                                const jitterMax = Math.min(250, Math.floor(baseDelay * 0.25));
                                const jitter = jitterMax > 0 ? Math.floor(Math.random() * (jitterMax + 1)) : 0;
                                const scheduledAt = Math.max(now, nextOpenAt);
                                const waitMs = Math.max(0, scheduledAt - now) + jitter;
                                nextOpenAt = scheduledAt + baseDelay;

                                if (waitMs > 0) {
                                    logDebug(3, `⏱️ Rate limiter: waiting ${waitMs} ms before opening next tab...`);
                                }

                                setTimeout(() => {
                                    chrome.tabs.create({ url: currentUrl, active: false, index: targetIndex }, (tab) => {
                                        if (chrome.runtime.lastError) {
                                            const errMsg = chrome.runtime.lastError.message || "";
                                            if (errMsg.includes('429')) {
                                                logDebug(1, `⚠️ Rate limit hit (429). Applying backoff.`);
                                                // Push the next opening further to reduce bursts against the same host
                                                nextOpenAt = Math.max(nextOpenAt, Date.now() + (baseDelay * 2));
                                                setTimeout(tryOpenNext, baseDelay * 2);
                                            } else {
                                                logDebug(1, `🧟 Failed to open tab: ${errMsg}`);
                                                // Continue immediately; the rate limiter will enforce spacing
                                                setTimeout(tryOpenNext, 0);
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

                                            // Continue immediately; the rate limiter will enforce spacing
                                            setTimeout(tryOpenNext, 0);
                                        }
                                        activeOpenings--;
                                    });
                                }, waitMs);

                                index++;
                                activeOpenings++;
                            } else {
                                setTimeout(tryOpenNext, delayBetweenTabs);
                            }
                        }

                        tryOpenNext();

                    } catch (err) {
                        const errMsg = (err && err.message) ? err.message : String(err);
                        logDebug(1, `❌ Exception in openNextTabsControlled: ${errMsg}`);

                        // ✅ UX: Failed toast (web-linked)
                        if (isTabOrigin) {
                            sendUserToastToTab(tabId, `MID: Web-linked gallery failed: ${errMsg}`, "error");
                        }

                        respondSafe(sendResponse, { success: false, error: errMsg });
                    }
                }

                // 🧠 Start opening tabs with controlled concurrency
                logDebug(1, `💉 Begin: Injecting save icon script into tabs`);
                openNextTabsControlled();
                
                // respondSafe(sendResponse, { success: true });
            } catch (err) {
                const errMsg = (err && err.message) ? err.message : String(err);
                logDebug(1, `❌ Error in Web-Linked Gallery flow: ${errMsg}`);
                logDebug(2, `🐛 Stacktrace: ${(err && err.stack) ? err.stack : "n/a"}`);

                // ✅ UX: Failed toast (web-linked)
                if (isTabOrigin) {
                    sendUserToastToTab(tabId, `MID: Gallery (web-linked): failed. ${errMsg}`, "error");
                }

                respondSafe(sendResponse, { success: false, error: errMsg });
            }

            return true;
        }

        // ✅ Handle Image Inspector save (single image, inspector panel)
        if (message.action === 'imageInspectorSaveImage') {
            logDebug(3, '');
            logDebug(1, '🕵️ BEGIN: Image Inspector save requested.');

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
                    logDebug(2, `🔵 Extended suffix detected and allowed. Using normalized URL: ${urlForDownload}`);
                } else {
                    urlForDownload = imageUrl;
                    logDebug(2, `🟢 No extended suffix detected or not allowed. Using original URL.`);
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
                        logDebug(2, `Saving folder/file (requested): ${finalPath}`);

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
                                        logDebug(1, '🕵️ Image Inspector download (resolved path): ', resolved);
                                    });
                                } catch (auditErr) {
                                    logDebug(1, `⚠️ Could not audit saved path: ${auditErr.message}`);
                                    logDebug(3, `🐛 Stacktrace: ${auditErr.stack}`);
                                }

                                // ✅ Badge: 1 image processed (green) and then finished (blue)
                                try {
                                    updateBadge(1, false); // green with count=1
                                    setTimeout(() => {
                                        try {
                                            updateBadge(1, true); // blue with final count
                                        } catch (badgeEndErr) {
                                            logDebug(1, `⚠️ Badge finalize error: ${badgeEndErr.message}`);
                                        }
                                    }, 300);
                                } catch (badgeErr) {
                                    logDebug(1, `⚠️ Badge update error: ${badgeErr.message}`);
                                }

                                const tabId = sender?.tab?.id;
                                if (tabId) {
                                    if (imageInspectorCloseOnSave === true) {
                                        closeTabSafely(tabId, () => {
                                            logDebug(1, `💥 tab ${tabId} closed after save (per option).`);
                                        });
                                    } else {
                                        logDebug(2, "ℹ️ tab retained after save (option disabled).");
                                    }
                                } else {
                                    logDebug(2, "ℹ️ no sender tabId, nothing to close.");
                                }

                                logDebug(2, '🕵️ END: Image Inspector save.');
                                logDebug(3, '');
                            } else {
                                logDebug(1, `❌ Image Inspector download failed for: ${urlForDownload}`);
                                setBadgeError();
                                respondSafe(sendResponse, { success: false, error: "Download failed" });
                                // Cleanup on failure
                                pendingDownloadPaths.delete(urlForDownload);
                            }
                        });
                    } catch (err) {
                        logDebug(1, `❌ Failed to prepare Image Inspector download: ${err.message}`);
                        logDebug(3, `🐛 Stacktrace: ${err.stack}`);
                        setBadgeError();
                        respondSafe(sendResponse, { success: false, error: err.message });
                    }
                })();

            } catch (e) {
                logDebug(1, `❌ Error handling Image Inspector save: ${e.message}`);
                logDebug(3, `🐛 Stacktrace: ${e.stack}`);
                setBadgeError();
                respondSafe(sendResponse, { success: false, error: e.message });
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

// 🎯 Command listener: MV3 hotkeys (core actions + one-click icon)
chrome.commands.onCommand.addListener(async (command) => {
    try {
        logDebug(2, `⌨️ Command received: "${command}"`);

        // Keep legacy behavior intact: One-click icon
        if (command === "open-oneclick-icon") {
            await handleOneClickIconHotkey();
            return;
        }

        // New core action hotkeys (Issue #42)
        switch (command) {
            case "hotkey-bulk-download":
                await handleBulkDownloadHotkey();
                return;

            case "hotkey-extract-gallery-direct":
                await handleExtractLinkedGalleryHotkey();
                return;

            case "hotkey-extract-gallery-visual":
                await handleExtractVisualGalleryHotkey();
                return;
            
            default:
                logDebug(1, `⚠️ Unknown command received: "${command}"`);
                logDebug(2, "💡 Verify 'commands' in manifest.json. Unknown hotkey ignored.");
                return;
        }

    } catch (error) {
        logDebug(1, `❌ Failed while handling command "${command}": ${error.message}`);
        logDebug(3, `🐛 Stacktrace: ${error.stack}`);
    }
});

/**
 * 🧠 Utility: Get active tab safely
 * @returns {Promise<chrome.tabs.Tab|null>}
 * @description This function retrieves the currently active tab in a safe manner, handling potential errors.
 * It uses lastFocusedWindow to improve reliability in MV3 command contexts.
 **/
async function getActiveTabSafe() {
    try {
        // ✅ MV3-safe: commands can fire when "currentWindow" is not what you think.
        let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        // 🔁 Fallback: lastFocusedWindow can still be empty in edge focus cases
        if (!tabs || tabs.length === 0) {
            tabs = await chrome.tabs.query({ active: true });
        }

        // 🧠 Validate result
        if (!tabs || tabs.length === 0) {
            logDebug(1, "⛔ No active tab found (hotkey handler).");
            return null;
        }

        return tabs[0];
        
    } catch (err) {
        logDebug(1, `❌ Failed to query active tab: ${err.message}`);
        logDebug(3, `🐛 Stacktrace: ${err.stack}`);
        return null;
    }
}

/**
 * Blocks restricted pages where content scripts cannot be injected.
 * Mirrors the defensive check used in popup.js.
 * @param {string} url
 * @returns {boolean}
 */
function isRestrictedPageUrl(url) {
    try {
        if (!url || typeof url !== "string") return true;
        return /^(chrome|chrome-extension|edge):\/\//.test(url) || url === "about:blank";
    } catch (err) {
        // Fail closed (safer): treat unknown URL as restricted
        return true;
    }
}

/**
 * Injects a script file into a tab in a defensive manner.
 * @param {number} tabId
 * @param {string} filePath
 * @param {string} contextLabel
 * @returns {Promise<boolean>}
 */
async function injectScriptFileSafe(tabId, filePath, contextLabel) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: [filePath]
        });

        logDebug(1, `✅ Script injected successfully (${contextLabel}): ${filePath}`);
        return true;

    } catch (err) {
        logDebug(1, `❌ Script injection failed (${contextLabel}): ${err.message}`);
        logDebug(3, `🐛 Stacktrace: ${err.stack}`);
        return false;
    }
}

/**
 * Hotkey handler: One-click download icon.
 * This is the existing behavior extracted into its own function for clarity.
 * @returns {Promise<void>}
 */
async function handleOneClickIconHotkey() {
    try {
        logDebug(1, "🖱️ Hotkey 'open-oneclick-icon' triggered.");

        // Show processing indicator before starting analysis
        setBadgeProcessing();

        const tab = await getActiveTabSafe();
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

        const injected = await injectScriptFileSafe(tab.id, "script/injectSaveIcon.js", "one-click-icon");
        if (!injected) return;

        logDebug(1, "✅ One-click download icon injected successfully.");
    } catch (error) {
        logDebug(1, `❌ Failed to inject One-click icon: ${error.message}`);
        logDebug(2, `🐛 Stacktrace: ${error.stack}`);
    }
}

/**
 * Hotkey handler: Bulk Image Download.
 * Reuses the existing background flow by calling handleBulkDownload(...) with the active tab index.
 * @returns {Promise<void>}
 */
async function handleBulkDownloadHotkey() {
    const tab = await getActiveTabSafe();
    if (!tab) return;

    logDebug(1, "⌨️ Hotkey triggered: Bulk Image Download.");

    // 🔔 UX: immediate feedback so it doesn't look "stuck"
    sendUserToastToTab(tab.id, "Bulk download started. Scanning tabs...", "info");

    // Reuse the existing handler. It expects message.activeTabIndex.
    try {
        await handleBulkDownload({ activeTabIndex: tab.index, toastTabId: tab.id }, () => {});
    } catch (err) {
        logDebug(1, `❌ Bulk hotkey failed: ${err.message}`);
        logDebug(3, `🐛 Stacktrace: ${err.stack}`);
        sendUserToastToTab(tab.id, `Bulk download failed: ${err.message}`, "error");
    }
}

/**
 * Hotkey handler: Extract Gallery Images (direct links).
 * Mirrors popup.js behavior by injecting extractLinkedGallery.js into the active tab.
 * @returns {Promise<void>}
 */
async function handleExtractLinkedGalleryHotkey() {
    const tab = await getActiveTabSafe();
    if (!tab || !tab.id) return;

    logDebug(1, "⌨️ Hotkey triggered: Extract Gallery (direct links).");

    if (isRestrictedPageUrl(tab.url)) {
        logDebug(1, `⚠️ Linked gallery extraction blocked on restricted page: ${tab.url}`);
        return;
    }

    await injectScriptFileSafe(tab.id, "script/extractLinkedGallery.js", "extract-linked-gallery");
}

/**
 * Hotkey handler: Extract Gallery Images (visual / no links).
 * Mirrors popup.js behavior by injecting extractVisualGallery.js into the active tab.
 * @returns {Promise<void>}
 */
async function handleExtractVisualGalleryHotkey() {
    // 🧠 Get active tab
    const tab = await getActiveTabSafe();
    if (!tab || !tab.id) return;

    logDebug(1, "⌨️ Hotkey triggered: Extract Gallery (visual / no links).");

    if (isRestrictedPageUrl(tab.url)) {
        logDebug(1, `⚠️ Visual gallery extraction blocked on restricted page: ${tab.url}`);
        return;
    }

    await injectScriptFileSafe(tab.id, "script/extractVisualGallery.js", "extract-visual-gallery");
}

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

        // 🚦 Show initial toast with count of valid images found (or error if none)
        if (message && typeof message.toastTabId === "number") {
            if (validTabs.length === 0) {
                sendUserToastToTab(message.toastTabId, "Bulk download: no valid images found.", "error");
            } else {
                sendUserToastToTab(
                    message.toastTabId,
                    `Bulk download: found ${validTabs.length} image(s). Downloading...`,
                    "info"
                );
            }
        }

		
		// 🚦 Block if no valid tabs found for download
		if (validTabs.length === 0) {
			try {
				logDebug(1, "⛔ No valid image tabs detected. Aborting download process.");
				logDebug(2, "💡 Tip: Try using 'Extract Gallery' or 'Web-Linked Gallery' instead.");

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
            // 🚦 Check if we have processed all batches
            if (remainingTabs.length === 0) {
                logDebug(1, '🛑 No remaining tabs. Ending process.');
                updateBadge(totalProcessed, true); // 🔵 Final badge

                // 🕒 End timing metric
                if (message && typeof message.toastTabId === "number") {
                    // 🧠 Show final toast with total count
                    sendUserToastToTab(
                        message.toastTabId,
                        `Bulk download completed. Downloaded: ${totalProcessed}`,
                        "success"
                    );
                }

                // 🕒 End timing metric
                logTimingEnd(timing);

                // 🧹 Clean up memory references
                validatedUrls.clear();
                remainingTabs.length = 0;

                logDebug(2, '🧹 Memory cleanup: validatedUrls and remainingTabs cleared');

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

                    // 🔔 UX: completion toast (only for hotkey flow that provides toastTabId)
                    if (message && typeof message.toastTabId === "number") {
                        sendUserToastToTab(
                            message.toastTabId,
                            `Bulk download completed. Downloaded: ${totalProcessed}`,
                            "success"
                        );
                    }

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
 * ✅ Download a single image URL using the same naming + filename enforcement strategy
 * used across the extension (pendingDownloadPaths + onDeterminingFilename).
 * @param {string} imageUrl - The image URL to download
 * @param {string} sourceTag - Optional source label for logging context
 * @returns {Promise<number>} Resolves with downloadId
 */
async function downloadImageFromUrl(imageUrl, sourceTag = "unknown") {
    // ✅ Basic input validation
    if (!imageUrl || typeof imageUrl !== "string") {
        throw new Error("Invalid imageUrl (downloadImageFromUrl).");
    }

    // ✅ Ensure both settings (folder) and naming rules are ready
    await Promise.all([settingsReady, configReady]);

    // ✅ Normalize URL if the extension allows extended image suffixes (optional behavior)
    let urlForDownload = imageUrl;
    try {
        const allowExtended = allowExtendedImageUrls ?? false;
        const extendedSuffixPattern = /(\.(jpe?g|jpeg|png|webp|bmp|avif))(:[a-zA-Z0-9]{2,10})$/i;
        const hasExtendedSuffix = extendedSuffixPattern.test(imageUrl);

        if (allowExtended && hasExtendedSuffix) {
            urlForDownload = normalizeImageUrl(imageUrl);
            logDebug(3, `🔵 [${sourceTag}] Extended suffix normalized for download: ${urlForDownload}`);
        }
    } catch (e) {
        logDebug(2, `⚠️ [${sourceTag}] URL normalization warning: ${e.message}`);
    }

    // ✅ Derive base filename + extension from URL path
    let baseName = "image";
    let extension = ".jpg";

    try {
        const urlObj = new URL(urlForDownload);
        const parts = urlObj.pathname.split("/");
        const lastPart = parts.pop() || "image.jpg";

        if (lastPart.includes(".")) {
            const lastDot = lastPart.lastIndexOf(".");
            baseName = lastPart.slice(0, lastDot) || "image";
            extension = lastPart.slice(lastDot) || ".jpg";
        } else {
            baseName = lastPart || "image";
            extension = ".jpg";
        }
    } catch (e) {
        logDebug(2, `⚠️ [${sourceTag}] URL parse warning, using fallback filename: ${e.message}`);
    }

    // ✅ Generate final filename based on prefix/suffix/timestamp rules
    const finalName = await generateFilename(baseName, extension);

    // ✅ Build final download path based on folder mode
    let finalPath;
    try {
        const isCustom = (downloadFolder === "custom" && typeof customFolderPath === "string" && customFolderPath.trim());
        if (isCustom) {
            const safeFolder = customFolderPath
                .trim()
                .replace(/\\/g, "/")
                .replace(/^\/+|\/+$/g, ""); // strip leading/trailing slashes

            finalPath = safeFolder ? `${safeFolder}/${finalName}` : finalName;
            logDebug(3, `📁 [${sourceTag}] Using custom folder path: ${finalPath}`);
        } else {
            finalPath = finalName;
            logDebug(3, `📁 [${sourceTag}] Using default download folder`);
        }
    } catch (e) {
        logDebug(1, `❌ [${sourceTag}] Error building download path: ${e.message}`);
        finalPath = finalName;
    }

    // 🔒 Register desired path so the onDeterminingFilename listener can enforce it
    pendingDownloadPaths.set(urlForDownload, finalPath);

    // ⏳ Safety timeout (same spirit as bulk flow)
    const stallTimeoutMs = 15000;

    return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            pendingDownloadPaths.delete(urlForDownload);
            reject(new Error(`Timeout: download stalled for ${urlForDownload}`));
        }, stallTimeoutMs);

        chrome.downloads.download({
            url: urlForDownload,
            // filename is still passed; listener will enforce it anyway
            filename: finalPath,
            conflictAction: "uniquify"
        }, (downloadId) => {
            clearTimeout(timeout);

            if (chrome.runtime.lastError) {
                pendingDownloadPaths.delete(urlForDownload);
                reject(new Error(chrome.runtime.lastError.message || "chrome.downloads.download failed"));
                return;
            }

            if (!downloadId) {
                pendingDownloadPaths.delete(urlForDownload);
                reject(new Error("Download failed (no downloadId returned)."));
                return;
            }

            logDebug(2, `✅ [${sourceTag}] Download started: ${finalPath}`);
            resolve(downloadId);
        });
    });
}


/**
 * 🌄 Handle Extracting linked gallery images (with direct links)
 * @description This function processes the images extracted from a gallery with direct links. It groups them by path similarity, applies the configured thresholds, and initiates downloads for the dominant group.
 * It also handles the timing metrics and ensures that the response is sent back to the sender appropriately.
 * @param {object} message - The message object containing the images and total count.
 * @param {function} sendResponse - The callback function to send the response back to the sender.
 * @returns {void}
 */
async function handleExtractLinkedGallery(message, sendResponse) {
    logDebug(3, '--------------------------------------------------');
    logDebug(2, '🌄 BEGIN: Extract images from galleries (with direct links) functionality');
    logDebug(3, '--------------------------------------------------');

    const timing = logTimingStart("Extract images from galleries (with direct links)");
    const { images, totalImages } = message || {};

    let didTimingEnd = false;

    // ✅ Ensure sendResponse is called at most once per invocation
    let hasResponded = false;
    function respondOnce(payload) {
        try {
            if (hasResponded) return;
            hasResponded = true;
            respondSafe(sendResponse, payload);
        } catch (err) {
            logDebug(2, `⚠️ respondOnce failed: ${err.message}`);
        }
    }

    // 🧠 Download concurrency (declared early so finally{} can always access them)
    let activeDownloads = 0;
    let downloadQueue = [];
    let downloadedCount = 0;

    // 🧠 Grouping gallery candidates by path similarity (80% threshold)
    logDebug(2, '🧠 Grouping gallery candidates by path similarity...');
    logDebug(3, '---------------------------');
    logDebug(3, '');

    const threshold = gallerySimilarityLevel || 80; // Default threshold
    const similarityMap = {};
    let dominantGroup = [];

    try {
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

            // ✅ Build dominantGroup from similarityMap (largest cluster)
            // Note: similarityMap keys are the "base" URLs, values are arrays of similar URLs.
            if (galleryEnableSmartGrouping && Array.isArray(images) && images.length <= MAX_GROUPING_CANDIDATES) {
                let bestGroup = [];
                for (const baseUrl in similarityMap) {
                    const group = [baseUrl, ...(similarityMap[baseUrl] || [])];

                    // Deduplicate within the group defensively
                    const uniqueGroup = [...new Set(group)];

                    if (uniqueGroup.length > bestGroup.length) {
                        bestGroup = uniqueGroup;
                    }
                }

                // If we found a best group, use it; otherwise keep dominantGroup empty for validation below
                dominantGroup = bestGroup;

                logDebug(1, `🧩 Dominant group computed from similarityMap: ${dominantGroup.length} image(s).`);
                logDebug(3, '');
            }

            // 🧠 Select dominant group from similarityMap using primary threshold
            logDebug(2, '🧠 Selecting dominant group from similarity map (primary threshold)...');

            // 🧠 Iterate through similarityMap to find the largest group of similar images
            for (const key in similarityMap) {
                // 🧪 Defensive check: ensure similarityMap[key] is an array
                const group = Array.from(new Set([key, ...(similarityMap[key] || [])]));
                const groupSize = group.length;

                // 🧪 Check if group meets minimum size requirement
                if (groupSize > dominantGroup.length) {
                    dominantGroup = group;
                }
            }

            logDebug(2, `🧠 Primary dominant group size: ${dominantGroup.length}`);


        } else if (galleryEnableSmartGrouping && images && images.length > MAX_GROUPING_CANDIDATES) {
            logDebug(1, `⚠️ Smart grouping skipped: too many candidates (${images.length} > ${MAX_GROUPING_CANDIDATES}). Using all detected images.`);
            dominantGroup = [...images];

        } else {
            logDebug(2, '🚀 Smart grouping disabled. Using all detected images.');
            dominantGroup = [...images];
        }

        // 🧪 Check if galleryMinGroupSize is defined
        if (typeof galleryMinGroupSize === "undefined") {
            logDebug(1, '⚠️ Warning: galleryMinGroupSize is undefined. Applying fallback value 3.');
            galleryMinGroupSize = 3;
        }

        // 🧪 Check if dominant group is valid
        if (!dominantGroup || !Array.isArray(dominantGroup)) {
            logDebug(1, '❌ Error: dominantGroup is not a valid array.');
            if (!didTimingEnd) { logTimingEnd(timing); didTimingEnd = true; }
            respondOnce({ success: false, error: 'No valid group by similarity' });
            return;
        }

        // 🧪 Final validation: ensure group meets minimum size
        if (dominantGroup.length < galleryMinGroupSize) {
            logDebug(1, `⚠️ Dominant group too small: ${dominantGroup.length} < ${galleryMinGroupSize}`);

            // 🧪 Check if fallback is enabled
            if (!galleryEnableFallback) {
                logDebug(1, '🚫 Similarity fallback disabled. Aborting.');
                if (!didTimingEnd) { logTimingEnd(timing); didTimingEnd = true; }
                
                // 🔔 UX: user must know the flow stopped
                if (message && message.toastTabId) {
                    
                    sendUserToastToTab(
                        message.toastTabId,
                        `MID: Gallery (linked / direct) stopped. Dominant group too small (${dominantGroup.length} < ${galleryMinGroupSize}).`,
                        "error"
                    );
                }

                respondOnce({ success: false, error: 'Group too small and fallback disabled' });
                return;
            }

            // 🛟 Retry with fallback threshold
            const fallbackThreshold = Math.max((gallerySimilarityLevel || 70) - 10, 30);
            logDebug(1, `🛟 Retrying dominant group detection with fallback threshold: ${fallbackThreshold}%`);
            
            // 🔔 UX: inform user we are applying fallback grouping
            if (message && message.toastTabId) {
                sendUserToastToTab(
                    message.toastTabId,
                    `MID: Gallery (linked / direct): fallback grouping applied (${fallbackThreshold}%). Continuing...`,
                    "info"
                );
            }

            dominantGroup = [];

            // 🧠 Rebuild similarity map with fallback threshold
            for (const key in similarityMap) {
                const group = [key, ...(similarityMap[key] || [])];
                const groupSize = group.length;
                if (groupSize >= galleryMinGroupSize && groupSize > dominantGroup.length) {
                    dominantGroup = group;
                }
            }

            // 🧪 Final check on fallback group
            if (dominantGroup.length < galleryMinGroupSize) {
                logDebug(1, `❌ Fallback group still too small: ${dominantGroup.length} < ${galleryMinGroupSize}`);
                if (!didTimingEnd) { logTimingEnd(timing); didTimingEnd = true; }
                respondOnce({ success: false, error: 'Fallback group too small' });
                return;
            }

            logDebug(1, `✅ Fallback dominant group accepted: ${dominantGroup.length} images`);
        }

        // 🧪 Edge case: no images
        if (!Array.isArray(images) || images.length === 0) {
            logDebug(1, '⚠️ No images received for Extract Linked Gallery.');
            if (!didTimingEnd) { logTimingEnd(timing); didTimingEnd = true; }
            respondOnce({ success: false, error: 'No images to extract' });
            return;
        }

        // ✅ Badge start
        updateBadge(0, false);

        // ✅ Rate limiting / delay
        // ✅ galleryMaxImages is treated as "images per second" (rate). Convert to ms delay.
        const rate = Math.max(0, parseInt(galleryMaxImages || 0, 10));
        const delay = (rate > 0) ? Math.round(1000 / rate) : 0;

        // 🧠 Progress tracking
        let processedCount = 0;
        
        // 🧠 Progress callback to update badge and check for completion
        function onGalleryProgress() {
            processedCount++;

            // ✅ Keep badge incremental during processing (green),
            // and only paint blue at the real end.
            updateBadge(processedCount, false);

            // ✅ Check if all images are processed (using totalImages from message if available, otherwise fallback to dominantGroup length)
            if (processedCount >= (totalImages || dominantGroup.length)) {
                logDebug(2, `✅ END: All gallery images processed.`);
                logDebug(3, '--------------------------------------------------');
                logDebug(3, '');

                updateBadge(processedCount, true); // 🔵 final badge
            }
        }

        // 🧠 Enqueue download tasks
        // Note: we enqueue all tasks immediately but control execution with activeDownloads and processQueue to respect concurrency limits.
        // This allows us to maintain a single progress callback (onGalleryProgress) that is called as soon as each download task finishes, regardless of the concurrency level.
        // This design also simplifies the logic for handling the delay between launches, as we can apply it directly in the task function without needing to manage separate timers for each image.
        // The downloadQueue is a simple array of async functions that we will execute respecting the concurrency limit defined by downloadLimit.
        // Each task will call onGalleryProgress() when it finishes, allowing us to update the badge and check for completion in a consistent way.
        function enqueueDownload(task) {
            return new Promise((resolve) => {
                downloadQueue.push(async () => {
                    activeDownloads++;
                    try {
                        await task();
                    } catch (err) {
                        // ✅ Never block the queue, but do log unexpected task failures
                        const msg = (err && err.message) ? err.message : String(err);
                        logDebug(1, `⚠️ Queue task failed: ${msg}`);
                        logDebug(2, `🐛 Stacktrace: ${(err && err.stack) ? err.stack : "n/a"}`);
                    } finally {
                        activeDownloads--;
                        resolve();
                    }
                });
            });
        }

        // 🧠 Run queue respecting downloadLimit
        // Note: this function will keep running until all tasks are processed and activeDownloads is 0, ensuring that we wait for all downloads to finish before allowing the main flow to complete.
        // The inner while loop checks if we can start new tasks based on the concurrency limit, and the outer loop ensures we keep checking until everything is done.
        // The sleep(50) is a small delay to prevent a tight loop that could consume CPU unnecessarily while waiting for downloads to complete or for the queue to have new tasks.
        // This design allows us to maintain a responsive and efficient processing of the download tasks while respecting the user-configured concurrency limits.
        // By using a queue and controlling the execution with activeDownloads, we can ensure that we never exceed the allowed number of concurrent downloads, while still processing all tasks in a timely manner.
        async function processQueue() {
            // ✅ Respect global downloadLimit setting (clamped 1..4)
            const effectiveLimit = Math.max(1, Math.min(4, parseInt(downloadLimit || 1, 10)));

            while (downloadQueue.length > 0 || activeDownloads > 0) {
                while (downloadQueue.length > 0 && activeDownloads < effectiveLimit) {
                    const next = downloadQueue.shift();
                    if (next) next();
                }
                await sleep(50);
            }
        }

        // 🧠 Main loop
        async function processImagesSequentially(urls, delayMs) {
            for (let i = 0; i < urls.length; i++) {
                try {
                    const imgUrl = urls[i];
                    if (!imgUrl) {
                        onGalleryProgress();
                        continue;
                    }

                    // Respect delay between launches (if configured)
                    if (delayMs > 0) await sleep(delayMs);

                    enqueueDownload(async () => {
                        let ok = false;

                        try {
                            await downloadImageFromUrl(imgUrl, "linkedGallery");
                            ok = true;
                        } catch (err) {
                            logDebug(1, `⚠️ Download task failed: ${err.message}`);
                        } finally {
                            if (ok) downloadedCount++;
                            onGalleryProgress();
                        }
                    });


                } catch (error) {
                    logDebug(1, `⚠️ Error processing image index: ${error.message}`);
                    logDebug(2, `🐛 Stacktrace: ${error.stack}`);
                    logDebug(2, '🔚 END: Image index.');
                    logDebug(3, '--------------------------------------------------');
                    logDebug(3, '');
                    onGalleryProgress();
                }
            }

            logDebug(1, `🚚 Queue ready. Pending tasks: ${downloadQueue.length}. Starting processQueue()...`);
            await processQueue();
        }

        logDebug(3, '---------------------------');
        logDebug(2, `🚀 Starting downloads. Queue size: ${Array.isArray(dominantGroup) ? dominantGroup.length : 0}`);
        logDebug(3, '---------------------------');
        logDebug(3, '');

        // 🧠 Start processing
        await processImagesSequentially(dominantGroup, delay);

        // ✅ Success response (completionResponder in the caller will translate to toast)
        respondOnce({ success: true, downloads: downloadedCount });

    } catch (e) {
        const errMsg = (e && e.message) ? e.message : String(e);
        logDebug(1, `❌ Extract Linked Gallery unexpected failure: ${errMsg}`);
        logDebug(2, `🐛 Stacktrace: ${(e && e.stack) ? e.stack : "n/a"}`);
        respondOnce({ success: false, error: errMsg });

    } finally {
        // 🧹 Defensive cleanup: release references to reduce memory pressure (MV3 SW longevity)
        try {
            if (Array.isArray(dominantGroup)) dominantGroup.length = 0;
            if (Array.isArray(downloadQueue)) downloadQueue.length = 0;
            activeDownloads = 0;

            if (message && Array.isArray(message.images)) message.images.length = 0;

            logDebug(2, "🧹 Memory cleanup: dominantGroup/downloadQueue/message.images cleared");
        } catch (cleanupErr) {
            logDebug(3, `⚠️ Linked Gallery cleanup warning: ${cleanupErr.message}`);
        }

        // 🕒 End timing metric (defensive: avoid double-end)
        try {
            if (!didTimingEnd) {
                logTimingEnd(timing);
                didTimingEnd = true;
            }
        } catch (timingErr) {
            logDebug(3, `⚠️ Timing end warning: ${timingErr.message}`);
        }
    }
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