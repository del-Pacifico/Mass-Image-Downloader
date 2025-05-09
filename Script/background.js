 
// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/sergiopalmah/Mass-Image-Downloader
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
    closeTabSafely,
    logDebug,
    calculatePathSimilarity,
    generateFilename,
    sanitizeFilenameComponent,
    isDirectImageUrl,
    isAllowedImageFormat,
    initConfigCache
} from "./utils.js";

(async () => {
    await initConfigCache();
    logDebug(1, "📦 Background configuration initialized.");
})();

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
let showUserFeedbackMessages = false;
let enableClipboardHotkeys = false;
let maxOpenTabs = 5; // 🔗 Max concurrent tabs for Web-Linked Gallery
let webLinkedGalleryDelay = 500;

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
                webLinkedGalleryDelay: 500 // 🕒 Delay between opening tabs for Web-Linked Gallery
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
                logDebug(3, '   📜 Filename Mode: none');
                logDebug(3, '      🔤 Prefix: ""');
                logDebug(3, '      🔡 Suffix: ""');
                // 📋 Clipboard hotkeys
                logDebug(3, '   📋 Clipboard hotkeys: false');
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
                // 🐛 Debugging
                logDebug(3, '   🐛 Debug logging level: 1 (shows key events)');
                // 📸 Bulk Image Download
                logDebug(3, '📸 Bulk Image Download functionality');
                logDebug(3, '   📌 Max image per batch: 0');
                logDebug(3, '   🔁 Continue bulk loop: false');
                logDebug(3, '🔗 Web-Linked Gallery Settings');
                logDebug(3, '   🔗 Max concurrent tabs: 5');
                logDebug(3, '   🕒 Delay between opening tabs: 500ms');
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
            "galleryMinGroupSize",
            "galleryEnableSmartGrouping",
            "galleryEnableFallback",
            "showUserFeedbackMessages",
            "enableClipboardHotkeys",
            "maxOpenTabs", "webLinkedGalleryDelay"
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
            showUserFeedbackMessages = data.showUserFeedbackMessages || false;
            enableClipboardHotkeys = data.enableClipboardHotkeys || false;

            maxOpenTabs = (data.maxOpenTabs >= 1 && data.maxOpenTabs <= 10) ? data.maxOpenTabs : 5;
            
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
            logDebug(3, `   📜 Filename Mode: ${filenameMode}`);
            logDebug(3, `      🔤 Prefix: ${prefix}`);
            logDebug(3, `      🔡 Suffix: ${suffix}`);
            // 🌍 Clipboard hotkeys
            logDebug(2, '   📋 Clipboard hotkeys.');
            logDebug(3, `      📋 Clipboard hotkeys: ${enableClipboardHotkeys}`);
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
            // 🐛 Debugging
            logDebug(2, '   🐜 Debugging.');
            logDebug(3, `       🐛 Debug logging level: ${debugLogLevel}`);
            // 📸 Bulk Image Download
            logDebug(3, '📸 Bulk Image Download functionality');
            logDebug(3, `   📌 Max image per batch: ${maxBulkBatch}`);
            logDebug(3, `   🔁 Continue bulk loop: ${continueBulkLoop}`);
            logDebug(3, '🔗 Web-Linked Gallery Settings');
            logDebug(3, `   🔗 Max concurrent tabs: ${maxOpenTabs}`);
            logDebug(3, `   ⏱️ Delay between tabs (Web-Linked Gallery): ${webLinkedGalleryDelay} ms`);
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
            case "gallerySimilarityLevel": gallerySimilarityLevel = newValue; break;  
            case "galleryMinGroupSize": galleryMinGroupSize = newValue; break;
            case "galleryEnableSmartGrouping": galleryEnableSmartGrouping = newValue; break;
            case "galleryEnableFallback": galleryEnableFallback = newValue; break;
            case "showUserFeedbackMessages": showUserFeedbackMessages = newValue; break;
            case "enableClipboardHotkeys": enableClipboardHotkeys = newValue; break;
            case "maxOpenTabs": maxOpenTabs = newValue; break;
            case "webLinkedGalleryDelay": webLinkedGalleryDelay = newValue; break;            
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        
        let injectionsCompleted = 0;

        if (!validateMessage(message)) return false;
        logDebug(2, '🧪 Full message received: ', JSON.stringify(message));
        logDebug(1, `🚀 Received message: ${message.action}`);
        logDebug(3, '');

        // ✅ Check if message has action property
        if (!message || !message.action) {
            logDebug(2, '⚠️ Message received without action. Ignored.');
            return;
        } else {
            logDebug(1, '✅ Message received with action: ' + message.action);
        }

        // ✅ Handle bulk download action
        if (message.action === 'bulkDownload') {
            logDebug(1, '📷 Initiating Bulk Image Download flow.');
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
        if (message.action === 'extractLinkedGallery') {
            logDebug(1, '🌄 Extract Linked Gallery flow started.');
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
                logDebug(1, '🐛 Stacktrace: ', e.stack);
                respondSafe(sendResponse, { success: false, error: e.message });
            }
            return true;
        }

        // ✅ Handle gallery extraction (visual detection)
        if (message.action === 'extractVisualGallery') {
            logDebug(1, '🖼️ Extract Visual Gallery flow started.');
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
                return true;
                
            } catch (e) {
                logDebug(1, '❌ Critical error before processing extractVisualGallery: ' + e.message);
                logDebug(1, '🐛 Stacktrace: ', e.stack);
                respondSafe(sendResponse, { success: false, error: e.message });
            }
            return true;
        }

        // ✅ Handle Web-Linked Gallery extraction
        if (message.action === 'processWebLinkedGallery') {
            logDebug(1, '🔗 BEGIN: Extract Web-Linked Gallery (background handler)');
            logDebug(3, '');
        
            try {
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

                // 🧠 Function to open tabs with controlled concurrency
                async function openNextTabsControlled() {
                    try {
                        const delayBetweenTabs = Math.max(100, Math.min(3000, webLinkedGalleryDelay));
                        let tabsOpened = 0;
                        logDebug(1, `🔗 BEGIN: Opening ${total} tabs...`);
                        logDebug(2, `⏱️ Using delay between tab openings: ${delayBetweenTabs} ms`);
                        logDebug(3, '');
                        updateBadge(0); // 🟢 Start badge in green
                
                        while (index < total) {
                            try {
                                if (opened < concurrencyLimit) {
                                    const currentUrl = urls[index++];
                                    logDebug(2, `🔗 Opening tab ${index} of ${total}`);
                                    logDebug(2, `📦 Opening URL: ${currentUrl}`);
                                    logDebug(3, '');
                                    opened++;
                                    tabsOpened++;
                
                                    chrome.tabs.create({ url: currentUrl, active: false }, (tab) => {
                                        if (chrome.runtime.lastError) {
                                            logDebug(1, `🧟 Failed to open tab: ${chrome.runtime.lastError.message}`);
                                        } else {
                                            logDebug(2, `🧭 Opened tab: ${currentUrl}`);
                                            updateBadge(tabsOpened);
                                            logDebug(3, '');

                                            // 💉 Inject save icon script after tab opens
                                            if (tab && tab.id) {
                                                chrome.scripting.executeScript({
                                                    target: { tabId: tab.id },
                                                    files: ["script/injectSaveIcon.js"]
                                                }).then(() => {

                                                    logDebug(2, `💉 Injected save icon script into tab ${tab.id}`);
                                                    logDebug(3, '');

                                                    injectionsCompleted++;
                                                    if (injectionsCompleted === total) {
                                                        logDebug(1, `💉 All save icon scripts injected into ${injectionsCompleted} tab(s).`);
                                                        logDebug(1, '✅ END: Extract Web-Linked Gallery!');
                                                    }
                                                }).catch((injectErr) => {
                                                    logDebug(1, `❌ Failed to inject save icon: ${injectErr.message}`);
                                                });
                                            } else {
                                                logDebug(1, `❌ Cannot inject script: Invalid tab object`);
                                            }
                                        }
                                        opened--;
                                    });
                                    await new Promise(resolve => setTimeout(resolve, delayBetweenTabs));
                                } else {
                                    await new Promise(resolve => setTimeout(resolve, 100));
                                }
                            } catch (innerError) {
                                logDebug(1, `🧟 Error during tab opening loop: ${innerError.message}`);
                                logDebug(2, `🐛 Stacktrace: ${innerError.stack}`);
                            }
                        }
                
                        const waitUntilAllClosed = setInterval(() => {
                            if (opened === 0) {
                                clearInterval(waitUntilAllClosed);
                                logDebug(1, '✅ All tabs from Web-Linked Gallery opened.');
                                updateBadge(tabsOpened, true); // 🔵 Paint blue
                                respondSafe(sendResponse, { success: true });
                            }
                        }, 100);
                    } catch (outerError) {
                        logDebug(1, `❌ Critical error in openNextTabsControlled(): ${outerError.message}`);
                        logDebug(2, `🐛 Stacktrace: ${outerError.stack}`);
                        respondSafe(sendResponse, { success: false, error: outerError.message });
                    }
                }
        
                openNextTabsControlled();
                respondSafe(sendResponse, { success: true });
            } catch (err) {
                logDebug(1, `❌ Error in Web-Linked Gallery flow: ${err.message}`);
                logDebug
                respondSafe(sendResponse, { success: false, error: err.message });
            }
        
            return true;
        }

        // ✅ Handle manual image download from 💾 overlay
        if (message.action === 'manualDownloadImage') {
            logDebug(1, '💾 Manual image download requested.');
            logDebug(3, '------------------------------------');

            try {
                const imageUrl = message.imageUrl;
                if (!imageUrl || typeof imageUrl !== 'string') {
                    throw new Error("Invalid image URL received.");
                }

                const urlObj = new URL(imageUrl);
                let baseName = urlObj.pathname.split('/').pop() || 'image';
                let extension = '';
                if (baseName.includes('.')) {
                    const lastDot = baseName.lastIndexOf('.');
                    extension = baseName.slice(lastDot);
                    baseName = baseName.slice(0, lastDot);
                }

                generateFilename(baseName, extension).then((finalName) => {
                    const finalPath = (downloadFolder === 'custom' && customFolderPath)
                        ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                        : finalName;

                    logDebug(2, `📁 Saving to: ${finalPath}`);

                    chrome.downloads.download({
                        url: imageUrl,
                        filename: finalPath,
                        conflictAction: 'uniquify'
                    }, (downloadId) => {
                        if (downloadId) {
                            logDebug(1, '💾 Manual image download success.');
                            // Close the sender tab if possible
                            const tabId = sender?.tab?.id;
                            if (tabId) {
                                closeTabSafely(tabId);
                            }
                            respondSafe(sendResponse, { success: true });
                        } else {
                            logDebug(1, `❌ Manual download failed for: ${imageUrl}`);
                            respondSafe(sendResponse, { success: false, error: "Download failed" });
                        }
                    });
                }).catch((err) => {
                    logDebug(1, `❌ Failed to generate filename: ${err.message}`);
                    respondSafe(sendResponse, { success: false, error: err.message });
                });
            } catch (e) {
                logDebug(1, `❌ Error handling manual download: ${e.message}`);
                respondSafe(sendResponse, { success: false, error: e.message });
            }

            return true;
        }

        respondSafe(sendResponse, { success: false, error: "Unknown action." });

    } catch (error) {
        logDebug(1, `❌ Unhandled error in message handler: ${error.message}`);
        logDebug(2, '🐛 Stacktrace: ', error.stack); 
        sendResponse({ success: false, error: "Internal error occurred in background script." });
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
    logDebug(1, '📸 Download images directly in tabs functionality');
    logDebug(3, '------------------------------------');
    logDebug(2, '📥 BEGIN: Download process started');
    logDebug(3, '');

    const validatedUrls = new Set();
    let totalProcessed = 0;
    let batchIndex = 0;

    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        const activeTabIndex = message.activeTabIndex;
        // TODO: sometimes this objet (filteredTabs) is 0! Why?
        const filteredTabs = tabs.filter(tab => tab.index >= activeTabIndex);
        const validTabs = [];

        logDebug(2, '🔎 BEGIN: Filtering image tabs...');
        logDebug(3, ' ');

        for (const tab of filteredTabs) {
            try {
                logDebug(3, `🕵 Checking tab id: ${tab.id}`);
                logDebug(3, `⏳ Is a direct image URL?: ${tab.url}`);
        
                // ✅ Pre-filter: Only check URLs that appear to be direct images
                const isDirect = await isDirectImageUrl(tab.url);
                logDebug(3, `🔎 isDirectImageUrl returned: ${typeof isDirect} (${isDirect})`);

                if (!isDirect) {
                    logDebug(2, '❌ Not a direct image URL.');
                    logDebug(2, '⏩ Skipping this tab...');
                    logDebug(3, '');
                    continue;
                }
        
                const isAllowed = await isAllowedImageFormat(tab.url);
        
                if (!isAllowed) {
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
                    logDebug(2, '🔁 Continue enabled. Next batch queued...');
                    processNextBatch();
                } else {
                    logDebug(1, '🏁 All batches processed. Finalizing badge...');
                    updateBadge(totalProcessed, true); // 🔵 Paint blue at the real end
                    respondSafe(sendResponse, { success: true, downloads: totalProcessed });
                }
            }, validatedUrls, batchIndex === 1, totalProcessed);
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

    // ✅ Reset badge ONLY if it's the very first batch
    if (resetBadge && totalProcessed === 0) updateBadge(0);

    // ✅ Function to process each tab
    async function processTab(tab) {
        try {
            const url = new URL(tab.url);
            logDebug(2, `🛠️ BEGIN: Processing tab id: ${tab.id}`);

            if (validatedUrls.has(url.href)) {
                logDebug(2, `🔁 Duplicate URL skipped: ${url.href}`);
                logDebug(3, `🛠️ END: Tab id ${tab.id}`);
                logDebug(3, '------------------------------------');
                logDebug(3, '');
                return onCompleteDownload();
            }

            validatedUrls.add(url.href);

            // 🧪 Validate image size using Content-Length (header-based) before full fetch
            try {
                const headResponse = await fetch(url.href, { method: 'HEAD' });
                const contentLength = parseInt(headResponse.headers.get('Content-Length'), 10);

                if (!isNaN(contentLength) && contentLength < 20000) {
                    logDebug(2, `⛔ Skipped: File too small by header (${contentLength} bytes)`);
                    logDebug(3, `🛠️ END: Tab id ${tab.id}`);
                    logDebug(3, '------------------------------------');
                    logDebug(3, '');
                    return onCompleteDownload();
                }
            } catch (headError) {
                logDebug(2, `⚠️ Could not determine size via HEAD request: ${headError.message}`);
                // Continue with normal fetch as fallback
            }

            // 🧪 Fallback: Validate image size using createImageBitmap
            fetch(url.href)
                .then(response => response.blob())
                .then(blob => createImageBitmap(blob))
                .then(async (bitmap) => {
                    logDebug(3, '');
                    logDebug(3, `📏 BEGIN: Validating image size (tab id ${tab.id})`);
                    logDebug(3, `📌 Image name: ${url.pathname.split('/').pop()}`);

                    if (bitmap.width < minWidth || bitmap.height < minHeight) {
                        logDebug(2, `⛔ Skipped: Image too small (${bitmap.width}x${bitmap.height})`);
                        logDebug(2, `🔎 Required minimum: ${minWidth}x${minHeight}`);
                        logDebug(3, `📏 END: Validation failed`);
                        logDebug(3, `🛠️ END: Tab id ${tab.id}`);
                        logDebug(3, '------------------------------------');
                        logDebug(3, '');
                        return onCompleteDownload();
                    }

                    // 🧱 Extract file name and extension
                    let fileName = url.pathname.split('/').pop() || 'image';
                    let extension = '';
                    if (fileName.includes('.')) {
                        const lastDot = fileName.lastIndexOf('.');
                        extension = fileName.slice(lastDot);
                        fileName = fileName.slice(0, lastDot);
                    }

                    logDebug(1, `💾 BEGIN: Downloading`);
                    const finalName = await generateFilename(fileName, extension);
                    const finalPath = (downloadFolder === 'custom' && customFolderPath)
                        ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                        : finalName;

                    logDebug(2, `📁 Path + final File: ${finalPath}`);
                    chrome.downloads.download({
                        url: url.href,
                        filename: finalPath,
                        conflictAction: 'uniquify'
                    }, (downloadId) => {
                        if (downloadId) {
                            logDebug(2, '💾 Download success.');
                            successfulDownloads++;
                            updateBadge(successfulDownloads + totalProcessed); // ✅ Cumulative badge (green)
                            logDebug(3, `🆗 Downloaded images: ${successfulDownloads}`);
                            closeTabSafely(tab.id);
                        } else {
                            logDebug(1, `❌ Failed to download: ${url.href}`);
                        }

                        logDebug(2, `🛠️ END: Tab id ${tab.id}`);
                        logDebug(3, '------------------------------------');
                        logDebug(3, '');
                        onCompleteDownload();
                    });
                })
                .catch(err => {
                    logDebug(1, `❌ Error validating image: ${err.message}`);
                    logDebug(1, `🐛 Stacktrace: ${err.stack}`);
                    logDebug(2, `🛠️ END: Tab id ${tab.id}`);
                    logDebug(3, '------------------------------------');
                    logDebug(3, '');
                    onCompleteDownload();
                });
        } catch (error) {
            logDebug(1, `⚠️ Exception in tab processing: ${error.message}`);
            logDebug(1, `🐛 Stacktrace: ${error.stack}`);
            logDebug(2, `🛠️ END: Tab id ${tab.id}`);
            logDebug(3, '------------------------------------');
            logDebug(3, '');
            onCompleteDownload();
        }
    }

    // ✅ Callback for when a download is completed
    function onCompleteDownload() {
        activeDownloads--;
        completedTabs++;

        if (completedTabs === totalTabs && activeDownloads === 0) {
            logDebug(1, '✅ All image tabs processed in batch');
            logDebug(1, '📥 END: Batch download completed');
            logDebug(3, '------------------------------------');
            onComplete(successfulDownloads); // ✅ Return number of downloads to main loop
        } else {
            processQueue();
        }
    }

    // ✅ Function to process the queue of tabs
    function processQueue() {
        try {
            // ✅ Process queue using Promise-based concurrency control
            while (activeDownloads < downloadLimit && queueIndex < totalTabs) {
                const tab = validTabs[queueIndex++];
                activeDownloads++;

                // 🧠 Execute tab processing in controlled parallel batch
                (async () => {
                    await processTab(tab); // onCompleteDownload() will handle counters
                })().catch((err) => {
                    logDebug(1, `❌ Error in async tab processing: ${err.message}`);
                    logDebug(2, `🐛 Stacktrace: ${err.stack}`);
                });
            }
        } catch (queueError) {
            logDebug(1, `❌ Error in processQueue: ${queueError.message}`);
            logDebug(3, '------------------------------------');
            logDebug(3, '');
        }
    }

    // ✅ Pointer for managing current tab index in download queue
    let queueIndex = 0;
    processQueue();
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
    logDebug(1, '🌄 BEGIN: Extract images from galleries (with direct links) functionality');
    logDebug(3, '--------------------------------------------------');

    const { images, totalImages } = message || {};

    // 🧠 Grouping gallery candidates by path similarity (80% threshold)
    logDebug(2, '🧠 Grouping gallery candidates by path similarity...');
    
    const threshold = gallerySimilarityLevel || 80; // Default threshold
    const similarityMap = {};
    let dominantGroup = [];

    logDebug(2, `📥 Configuration Mode: ${extractGalleryMode}`);
    logDebug(2, `📥 Max images per second: ${galleryMaxImages}`);

    // 🧪 Check if smart grouping is enabled
    if (galleryEnableSmartGrouping) {
        logDebug(2, '🤖 Smart grouping enabled. Calculating path similarity...');
            
        // 🧪 Calculate path similarity between images
        for (let i = 0; i < images.length; i++) {
            // Skip if already processed
            for (let j = i + 1; j < images.length; j++) {
                const similarity = calculatePathSimilarity(images[i], images[j]);

                logDebug(2, '❓ Level of similarity between:');
                logDebug(2, `Image a:  ${images[i]}`);
                logDebug(2, `Image b:  ${images[j]}`);
                logDebug(2, `Similarity: ${similarity}%`);
                logDebug(2, `Threshold: ${threshold}%`);

                // 🧪 Check if similarity is above threshold
                if (similarity >= threshold) {
                    // 🧪 Group images by similarity
                    if (!similarityMap[images[i]]) similarityMap[images[i]] = [];
                    similarityMap[images[i]].push(images[j]);
                }
            }
        }

        // 🧪 Identify dominant group
        for (const [baseImage, group] of Object.entries(similarityMap)) {
            const currentGroup = [baseImage, ...group];
            if (currentGroup.length > dominantGroup.length) {
                dominantGroup = currentGroup;
            }
        }

        logDebug(3, `🧩 Total groups evaluated: ${Object.keys(similarityMap).length}`);
        // 🧪 Log dominant group
        if (dominantGroup.length > 0) {
            const leader = dominantGroup[0];
            logDebug(3, `🎯 Group leader (base image): ${leader}`);
            logDebug(1, `✅ Dominant group size: ${dominantGroup.length} image(s)`);
        }  
        else {
            logDebug(1, '⚠️ No valid similarity group found.');
        }
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

    /**
     * 🧠 Open tabs in batches with delay
     * @param {string[]} imageUrls - Array of image URLs to open
     * @param {number} limit - Number of tabs to open in parallel
     * @param {function} onProgress - Callback function to update progress
     * @param {number} delay - Delay in milliseconds between each tab opening
     * @returns {Promise<void>}
     * @description This function opens tabs in batches with a specified limit and delay between each tab opening.
     * It uses async/await to handle the asynchronous nature of tab creation and respects the download limit.
     * It also handles errors gracefully and logs them to the console.
     * 
     */
    async function openTabsInBatches(imageUrls, limit, onProgress, delay) {
        let index = 0;
        const total = imageUrls.length;

        logDebug(2, `🔄 Opening ${total} image URLs in batches of ${limit}...`);
        async function worker() {
            while (index < total) {
                const currentIndex = index++;
                const url = imageUrls[currentIndex];
        
                try {
                    await new Promise(resolve => {
                        chrome.tabs.create({ url, active: false }, () => {
                            onProgress();
                            resolve();
                        });
                    });
        
                    // 🕒 Respect per-image delay
                    // 🧪 Check if delay is a number and within range
                    await new Promise(resolve => setTimeout(resolve, delay));
                } catch (err) {
                    console.error(`[Mass image downloader]: ❌ Failed to open tab: ${url}`);
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
                logDebug(3, `🔎 isDirectImageUrl returned: ${typeof isDirect} (${isDirect})`);

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
                    chrome.tabs.create({ url: imageUrl, active: false }, () => {
                        onGalleryProgress();
                        logDebug(1, '🔚 END: Image opened in tab.');
                        logDebug(3, '--------------------------------------------------');
                    });
                    continue;
                }

                // ✅ Step 4: Extract file name and extension
                let fileName = new URL(imageUrl).pathname.split('/').pop() || 'image';
                let extension = '';
                if (fileName.includes('.')) {
                    const lastDot = fileName.lastIndexOf('.');
                    extension = fileName.slice(lastDot);
                    fileName = fileName.slice(0, lastDot);
                }

                // ✅ Step 5: Generate final path
                const finalName = await generateFilename(fileName, extension);
                const finalPath = (downloadFolder === 'custom' && customFolderPath)
                    ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                    : finalName;

                // ✅ Step 6: Download image using controlled queue
                if (mode === 'immediate') {
                    await enqueueDownload(async () => {
                        logDebug(3, '--------------------------------------------------');
                        logDebug(2, `📥 BEGIN: Download process for image index ${i}`);
                        logDebug(2, `⌛ Processing image URL: ${imageUrl}`);

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
                                onGalleryProgress();
                                return;
                            }

                            // ✅ Begin download
                            await new Promise(resolve => {
                                chrome.downloads.download({ url: imageUrl, filename: finalPath }, (downloadId) => {
                                    if (downloadId) {
                                        logDebug(2, `💾 Downloaded: ${finalName}`);
                                    } else {
                                        logDebug(1, '❌ Download failed.');
                                    }

                                    logDebug(1, `🔚 END: Download process for image index ${i}`);
                                    logDebug(3, '--------------------------------------------------');
                                    onGalleryProgress();
                                    resolve();
                                });
                            });
                        } catch (err) {
                            logDebug(1, `❌ Error downloading image index: ${err.message}`);
                            logDebug(2, `🐛 Stacktrace: ${err.stack}`);
                            logDebug(2, '🔚 END: Download process for image index.');
                            logDebug(3, '--------------------------------------------------');
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


    respondSafe(sendResponse, { success: true });
}

/**
 * 🖼️ Handle Extract images from galleries (without links)
 * @param {object} message - The message object sent from the popup or content script.
 * @param {function} sendResponse - The callback function to send the response.
 * @description This function handles the gallery finder functionality by validating and filtering images based on size and format.
 * It also groups images by path similarity and validates the group size before proceeding with the download.
 * @returns {void}
 */
async function handleExtractVisualGallery(message, sendResponse) {
    logDebug(3, '---------------------------------------------------------------');
    logDebug(1, '🖼️ Extract images from galleries (without links) functionality');
    logDebug(3, '---------------------------------------------------------------');

    try {
        // 🧠 Validate incoming message
        if (!message.images || !Array.isArray(message.images)) {
            logDebug(1, '❌ No images array received from content script.');
            respondSafe(sendResponse, { success: false, error: 'Invalid images list received.' });
            return;
        }

        const potentialImages = message.images;
        logDebug(2, `🔎 Total images received for processing: ${potentialImages.length}`);
        logDebug(3, '--------------------------------------------------');
        logDebug(2, `📥 Configuration Mode: ${extractGalleryMode}`);
        logDebug(2, `📥 Max images per second: ${galleryMaxImages}`);

        // 🧠 Calculate delay based on galleryMaxImages
        let userDefinedLimit = parseInt(message.options?.galleryMaxImages);
        if (isNaN(userDefinedLimit) || userDefinedLimit < 1 || userDefinedLimit > 10) {
            userDefinedLimit = galleryMaxImages;
        }
        const delay = Math.floor(1000 / userDefinedLimit);
        logDebug(2, `⏱️ Visual gallery download delay: ${delay} ms per image`);
        logDebug(3, '--------------------------------------------------');

        const validatedImages = [];

        // 🧹 Begin strict filtering
        logDebug(1, '🧹 Begin filtering');
        logDebug(3, '----------------------------------------');
        logDebug(3, '');
        for (let i = 0; i < potentialImages.length; i++) {
            const img = potentialImages[i];
            const url = img.url || '';
            const width = img.width || 0;
            const height = img.height || 0;

            logDebug(2, `🖼️ Validating image ${i + 1}: ${url}`);

            // ✅ Pre-filter: Only check URLs that appear to be direct images
            const isDirect = await isDirectImageUrl(url);
            logDebug(3, `🔎 isDirectImageUrl returned: ${typeof isDirect} (${isDirect})`);

            if (!isDirect) {
                logDebug(2, '⛔ Skipped (not a direct image URL).');
                logDebug(3, '');
                continue;
            }

            // ✅ Check if image format is allowed
            const isAllowedFormat = await isAllowedImageFormat(url);
            if (!isAllowedFormat) {
                logDebug(2, '⛔ Skipped (disallowed image format).');
                logDebug(3, '');
                continue;
            }

            // ✅ Check if image size is valid
            if (width < minWidth || height < minHeight) {
                logDebug(2, `⛔ Skipped (too small - ${width}x${height}).`);
                logDebug(3, ' ');
                continue;
            }

            // ✅ Check if image is already processed
            validatedImages.push({ url, width, height });
            logDebug(2, '✅ Image accepted.');
            logDebug(3, ' ');
        }

        // 🧹 End strict filtering
        if (validatedImages.length === 0) {
            logDebug(2, '⚠️ No valid images after validation.');
            logDebug(3, '----------------------------------------');
            respondSafe(sendResponse, { success: false, error: 'No valid gallery images found.' });
            return;
        }

        logDebug(1, `🎯 Valid images ready for grouping: ${validatedImages.length}`);
        logDebug(3, '----------------------------------------');

        // 🧠 Begin grouping by path similarity
        const groups = {};
        const similarityThreshold = gallerySimilarityLevel || 70;
        const visited = new Set();

        logDebug(2, '🧠 Grouping images by path similarity...');
        
        // 🧪 Calculate path similarity between images
        for (let i = 0; i < validatedImages.length; i++) {
            if (visited.has(i)) continue;
            const base = validatedImages[i];

            // 🧪 Check if already processed
            for (let j = i + 1; j < validatedImages.length; j++) {
                if (visited.has(j)) continue;

                const similarity = calculatePathSimilarity(base.url, validatedImages[j].url);

                logDebug(2, `🔍 Similarity between [${i}] and [${j}]: ${similarity}%`);

                // 
                if (similarity >= similarityThreshold) {
                    if (!groups[base.url]) groups[base.url] = [];
                    groups[base.url].push(validatedImages[j]);
                    visited.add(j);
                }
            }
            visited.add(i);
        }

        // 🧠 Identify dominant group
        let dominantGroup = [];
        // 🧪 Check if groups are valid
        for (const baseImage in groups) {
            // 🧪 Check if baseImage is a valid URL
            const group = [validatedImages.find(img => img.url === baseImage), ...groups[baseImage]];
            if (group.length > dominantGroup.length) {
                dominantGroup = group;
            }
        }

        logDebug(3, '');
        logDebug(2, `🧩 Dominant group size: ${dominantGroup.length}`);
        logDebug(3, ' ');

        // 🚦 Validate group size
        if (dominantGroup.length < galleryMinGroupSize) {
            logDebug(2, `⚠️ Dominant group too small (${dominantGroup.length} < ${galleryMinGroupSize}).`);
            logDebug(3, ' ');

            if (!galleryEnableFallback) {
                logDebug(1, '⛔ Fallback disabled. Aborting process.');
                logDebug(3, '----------------------------------------');
                respondSafe(sendResponse, { success: false, error: 'Group too small and fallback disabled.' });
                return;
            }

            // 🛟 Retry with fallback threshold
            logDebug(2, '🛟 Retrying with fallback threshold...');
            const fallbackThreshold = Math.max(similarityThreshold - 10, 30);
            const fallbackGroups = {};
            visited.clear();

            // 🧪 Calculate path similarity for fallback grouping
            for (let i = 0; i < validatedImages.length; i++) {
                if (visited.has(i)) continue;
                const base = validatedImages[i];

                // 🧪 Check if already processed
                for (let j = i + 1; j < validatedImages.length; j++) {
                    if (visited.has(j)) continue;

                    const similarity = calculatePathSimilarity(base.url, validatedImages[j].url);

                    // 🧪 Check if similarity is above fallback threshold
                    if (similarity >= fallbackThreshold) {
                        if (!fallbackGroups[base.url]) fallbackGroups[base.url] = [];
                        fallbackGroups[base.url].push(validatedImages[j]);
                        visited.add(j);
                    }
                }
                visited.add(i);
            }

            dominantGroup = [];
            for (const baseImage in fallbackGroups) {
                const group = [baseImage, ...fallbackGroups[baseImage]];
                if (group.length > dominantGroup.length) {
                    dominantGroup = group;
                }
            }

            // 🧪 Log fallback group
            if (dominantGroup.length < galleryMinGroupSize) {
                logDebug(1, '❌ Fallback failed. Group still too small.');
                logDebug(3, '----------------------------------------');
                respondSafe(sendResponse, { success: false, error: 'Fallback group too small.' });
                return;
            }

            logDebug(2, `✅ Fallback group accepted. Size: ${dominantGroup.length}`);
        }

        // 🚀 Process final group (open tabs or download)
        logDebug(1, '🚀 Processing dominant group images...');
        logDebug(3, '');
        
        // 🚀 Processing dominant group images with badge and filename customization
        let badgeCount = 0;
        updateBadge(badgeCount, false); // Initialize badge (green)

    // 🖼️ Download or open images based on mode
    let galleryFinished = false;     
    if (extractGalleryMode === 'tab') {
        logDebug(1, `🧭 Opening ${dominantGroup.length} image(s) in tabs (limit ${downloadLimit})...`);

        await openTabsInBatches(dominantGroup, downloadLimit, () => {
            badgeCount++;
            logDebug(2, '📦 Updating Badge');
            updateBadge(badgeCount, false);
            logDebug(2, '🔗 Opened in tab');
            logDebug(3, '');
        }, delay);
    } else if (extractGalleryMode === 'immediate') {
   
        // 🚀 Download images immediately
        for (const image of dominantGroup) {
            await new Promise(resolve => setTimeout(resolve, delay)); // ⏱️ Apply per-image delay
        
            logDebug(2, `✅ Processing image: ${image.url}`);
            try {
                const urlObj = new URL(image.url);
                let baseName = urlObj.pathname.split('/').pop() || 'image';
                let extension = '';
                if (baseName.includes('.')) {
                    const lastDot = baseName.lastIndexOf('.');
                    extension = baseName.slice(lastDot);
                    baseName = baseName.slice(0, lastDot);
                }
        
                const finalName = await generateFilename(baseName, extension);
                const finalPath = (downloadFolder === 'custom' && customFolderPath)
                    ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                    : finalName;
        
                logDebug(2, `📁 Saving folder/file: ${finalPath}`);
                logDebug(3, '');
        
                // 🖼️ Download immediately 
                chrome.downloads.download({
                    url: image.url,
                    filename: finalPath,
                    conflictAction: 'uniquify'
                }, (downloadId) => {
                    if (downloadId) {
                        badgeCount++;
                        logDebug(3, '📦 Updating Badge');
                        // Update badge with current count
                        if (!galleryFinished) {
                            updateBadge(badgeCount);
                        }
                        logDebug(1, '💾 Downloaded');
                        logDebug(3, '');
                    } else {
                        logDebug(1, '❌ Download failed');
                    }
                });
            } catch (downloadError) {
                logDebug(1, `❌ Error during download setup: ${downloadError.message}`);
                logDebug(2, `🐛 Stacktrace: ${downloadError.stack}`);
            }
        }
    }

    // 🧹 Finalization after all images
    setTimeout(() => {
        logDebug(3, '📦 Updating Badge');
        galleryFinished = true;
        updateBadge(badgeCount, true); // Mark badge as complete (blue)        
        logDebug(2, `🏁 Gallery Finder finished processing ${badgeCount} images.`);
        logDebug(3, '----------------------------------------');
        respondSafe(sendResponse, { success: true });
    }, 2000);
    } catch (error) {
        logDebug(1, `❌ Critical error during Gallery Finder: ${error.message}`);
        logDebug(2, `🐛 Stacktrace: ${error.stack}`);
        logDebug(3, '----------------------------------------');
        respondSafe(sendResponse, { success: false, error: 'Critical error during Gallery Finder.' });
    }
}


