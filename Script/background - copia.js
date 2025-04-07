// background.js - Mass Image Downloader background script

console.log('[Mass image downloader]: Background script loaded successfully.');

// Display extension version at startup
chrome.runtime.getManifest && console.log(`[Mass image downloader]: Running version ${chrome.runtime.getManifest().version}`);

import { updateBadge, closeTabSafely, isValidImageUrl, moveToNextTab } from "./utils.js";

// Global settings variables
let downloadFolder = "default";
let customFolderPath = "";
let downloadLimit = 2;
let debugLoggingEnabled = false;
let galleryImagesOpened = 0; // Counter for Extract Gallery Images feature
let filenameMode = "none";
let prefix = "";
let suffix = "";
let extractGalleryMode = "tab"; // ✅ Default: Open in new tab before downloading
let minImageWidth = 800; // ✅ Default minimum width for gallery finder
let minImageHeight = 600; // ✅ Default minimum height for gallery finder
let pathSimilarityLevel = 90; // ✅ Default similarity level (percentage)
let preferHigherResolution = true; // ✅ Default: prefer higher resolution

/**
 * ✅ Apply default settings when the extension is installed for the first time.
 */
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        console.log("[Mass image downloader]: 📌 First-time installation detected. Applying default settings...");

        chrome.storage.sync.set({
            // ✅ Global Settings
            downloadFolder: "default",
            allowJPG: true,
            allowJPEG: true,
            allowPNG: true,
            allowWEBP: false, // ❌ WEBP format disabled by default
            downloadLimit: 1,
            filenameMode: "none",
            debugLogging: false,

            // ✅ Extract Gallery Images Settings
            extractGalleryMode: "tab", // 📥 Default: Open in new tab before downloading

            // ✅ Gallery Finder Settings (new feature)
            minImageWidth: 800,
            minImageHeight: 600,
            pathSimilarityLevel: 90,
            preferHigherResolution: true,
        }, () => {
            console.log("[Mass image downloader]: ✅ Default settings applied successfully.");
        });
    }
});

/**
 * ✅ Loads settings from storage when the service worker starts.
 * - Retrieves all configuration settings from storage.
 * - Sets default values if any are missing or invalid.
 */
function loadSettings() {
    chrome.storage.sync.get([
        "downloadFolder", "customFolderPath", "downloadLimit", "debugLogging",
        "filenameMode", "prefix", "suffix", "extractGalleryMode",
        "minImageWidth", "minImageHeight", "pathSimilarityLevel", "preferHigherResolution"
    ], (data) => {
        // ✅ Load global settings
        debugLoggingEnabled = data.debugLogging || false;
        filenameMode = data.filenameMode || "none";
        prefix = sanitizeFilenameComponent(data.prefix || "");
        suffix = sanitizeFilenameComponent(data.suffix || "");
        extractGalleryMode = data.extractGalleryMode || "tab";

        // ✅ Load gallery finder settings
        minImageWidth = data.minImageWidth || 800;
        minImageHeight = data.minImageHeight || 600;
        pathSimilarityLevel = data.pathSimilarityLevel || 90;
        preferHigherResolution = data.preferHigherResolution !== undefined ? data.preferHigherResolution : true;

        // ✅ Load download settings
        downloadFolder = data.downloadFolder || "default";
        customFolderPath = data.customFolderPath ? data.customFolderPath.replace(/[<>:"/\\|?*]+/g, '') : "";
        downloadLimit = data.downloadLimit && data.downloadLimit >= 1 && data.downloadLimit <= 15 ? data.downloadLimit : 2;

        console.log('[Mass image downloader]: ------------------------------');
        console.log('[Mass image downloader]: 🔄 Retrieving settings from storage...');
        console.log(`[Mass image downloader]: 📁 Stored Download Folder: ${downloadFolder}`);
        console.log(`[Mass image downloader]: 📂 Stored Custom Folder Path: ${customFolderPath}`);
        console.log(`[Mass image downloader]: 📌 Stored Download Limit: ${downloadLimit}`);
        console.log(`[Mass image downloader]: 🛠 Debug Logging Enabled: ${debugLoggingEnabled}`);
        console.log(`[Mass image downloader]: 📜 Filename Mode: ${filenameMode}`);
        console.log(`[Mass image downloader]: 🔤 Prefix: ${prefix}`);
        console.log(`[Mass image downloader]: 🔡 Suffix: ${suffix}`);
        console.log(`[Mass image downloader]: 🖼 Extract Gallery Mode: ${extractGalleryMode}`);
        console.log(`[Mass image downloader]: 📏 Minimum Image Width: ${minImageWidth}`);
        console.log(`[Mass image downloader]: 📐 Minimum Image Height: ${minImageHeight}`);
        console.log(`[Mass image downloader]: 📝 Path Similarity Level: ${pathSimilarityLevel}%`);
        console.log(`[Mass image downloader]: 📸 Prefer Higher Resolution: ${preferHigherResolution}`);
        console.log('[Mass image downloader]: ------------------------------');
    });
}

// ✅ Load settings at startup
loadSettings();

/**
 * ✅ Listen for real-time changes in settings and updates dynamically.
 * - Updates global variables when the settings change.
 * - Logs the updated settings for debugging purposes.
 */
chrome.storage.onChanged.addListener((changes) => {
    console.log('[Mass image downloader]: ------------------------------');
    console.log('[Mass image downloader]: 🔄 Detected real-time settings update.');

    for (const key in changes) {
        const newValue = changes[key].newValue;
        console.log(`[Mass image downloader]: ✔ Setting updated: ${key} = ${JSON.stringify(newValue)}`);

        switch (key) {
            case "downloadFolder":
                downloadFolder = newValue;
                break;
            case "customFolderPath":
                customFolderPath = newValue.replace(/[<>:"/\\|?*]+/g, '');
                break;
            case "downloadLimit":
                downloadLimit = newValue;
                break;
            case "debugLogging":
                debugLoggingEnabled = newValue;
                break;
            case "filenameMode":
                filenameMode = newValue;
                break;
            case "prefix":
                prefix = sanitizeFilenameComponent(newValue);
                break;
            case "suffix":
                suffix = sanitizeFilenameComponent(newValue);
                break;
            case "extractGalleryMode":
                extractGalleryMode = newValue;
                break;
            case "minImageWidth":
                minImageWidth = newValue;
                break;
            case "minImageHeight":
                minImageHeight = newValue;
                break;
            case "pathSimilarityLevel":
                pathSimilarityLevel = newValue;
                break;
            case "preferHigherResolution":
                preferHigherResolution = newValue;
                break;
        }
    }
    console.log('[Mass image downloader]: ------------------------------');
});

/**
 * ✅ Sanitize filename components (prefix/suffix).
 * - Removes leading and trailing spaces.
 * - Allows spaces within the text.
 * - Restricts to alphanumeric characters and spaces.
 */
function sanitizeFilenameComponent(text) {
    return text.trim().replace(/[^a-zA-Z0-9 ]/g, ''); // Allows spaces inside but removes special characters.
}
/**
 * Handles incoming messages from the popup UI and extractGallery.js.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`[Mass image downloader]: 🚀 Received message: ${message.action}`);
    console.log('[Mass image downloader]: ');

    // ✅ Bulk Image Download Functionality
    if (message.action === 'startDownload') {
        console.log('[Mass image downloader]: ------------------------------------');
        console.log('[Mass image downloader]: 📸 Bulk Image Download Functionality');
        console.log('[Mass image downloader]: ------------------------------------');
        console.log('[Mass image downloader]: 📥 Download process started');
        console.log('[Mass image downloader]: ------------------------------------');
        console.log('[Mass image downloader]:  ');

        let successfulDownloads = 0;
        updateBadge(0);

        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            const activeTabIndex = message.activeTabIndex;
            const filteredTabs = tabs.filter(tab => tab.index >= activeTabIndex);
            let activeDownloads = 0;
            let tabIndex = 0;

            function startNextDownload() {
                if (tabIndex >= filteredTabs.length && activeDownloads === 0) {
                    console.log('[Mass image downloader]: ✅ Done: Finished processing all tabs.');
                    updateBadge(successfulDownloads, true);
                    sendResponse({ success: true, downloads: successfulDownloads });
                    return;
                }

                if (activeDownloads < downloadLimit && tabIndex < filteredTabs.length) {
                    const tab = filteredTabs[tabIndex++];
                    console.log('[Mass image downloader]: ---------------------------------------------');
                    console.log(`[Mass image downloader]: ▶ Tab id: ${tab.id} process begins`);
                    console.log(`[Mass image downloader]: 🔗 Processing URL: ${tab.url}`);

                    try {
                        const url = new URL(tab.url);
                        if (isValidImageUrl(url.href)) {
                            let fileName = url.pathname.split('/').pop();
                            let fileExtension = "";
                            
                            // Extract file extension if present
                            if (fileName.includes('.')) {
                                const lastDotIndex = fileName.lastIndexOf('.');
                                fileExtension = fileName.substring(lastDotIndex);
                                fileName = fileName.substring(0, lastDotIndex);
                            }

                            // Apply prefix/suffix formatting
                            if (filenameMode === "prefix") {
                                fileName = `${prefix}_${fileName}`;
                            } else if (filenameMode === "suffix") {
                                fileName = `${fileName}_${suffix}`;
                            } else if (filenameMode === "both") {
                                fileName = `${prefix}_${fileName}_${suffix}`;
                            } else if (filenameMode === "timestamp") {
                                const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(2, 14);
                                fileName = `${fileName}_${timestamp}`;
                            }

                            const sanitizedFilename = `${fileName}${fileExtension}`;

                            console.log(`[Mass image downloader]: 📂 Using filename format: ${sanitizedFilename} (Mode: ${filenameMode})`);

                            const targetPath = downloadFolder === "custom" && customFolderPath
                                ? `${customFolderPath.replace(/\\/g, '/')}/${sanitizedFilename}`
                                : sanitizedFilename;

                            activeDownloads++;
                            chrome.downloads.download({
                                url: tab.url,
                                filename: targetPath,
                                conflictAction: 'uniquify'
                            }, (downloadId) => {
                                if (downloadId) {
                                    successfulDownloads++;
                                    console.log(`[Mass image downloader]: ✅ Image ${sanitizedFilename} downloaded successfully!`);
                                    closeTabSafely(tab.id, () => {
                                        updateBadge(successfulDownloads);
                                        console.log('[Mass image downloader]: ---------------------------------------------');
                                        console.log('[Mass image downloader]:                                               ');
                                        activeDownloads--;
                                        startNextDownload();
                                    });
                                } else {
                                    console.log(`[Mass image downloader]: ❌ Failed to download. Skipped.`);
                                    activeDownloads--;
                                    startNextDownload();
                                }
                            });
                        } else {
                            console.log(`[Mass image downloader]: 🚫 Not an image URL: Skipped...`);
                            startNextDownload();
                        }
                    } catch (error) {
                        console.log(`[Mass image downloader]: ⚠️ Error processing tab ${tab.index}: ${error.message}`);
                        startNextDownload();
                    }
                }
            }

            startNextDownload();
        });

        return true;
    }

    // ✅ Extract Gallery Images Functionality
    if (message.action === "openGalleryImages") {
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log('[Mass image downloader]: 🌄 Extract gallery images Functionality');
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log('[Mass image downloader]: 📥 Download process started');
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log(`[Mass image downloader]:  `);

        let imagesOpened = 0;
        galleryImagesOpened = 0;

        message.images.forEach((imageUrl, index) => {
            setTimeout(() => {
                console.log('[Mass image downloader]: ------------------------------------');
                console.log(`[Mass image downloader]: ⚠️ Checking if the URL at index ${index} is a valid image: ${imageUrl}`);

                // ✅ Image URL validation before proceeding
                if (!isValidImageUrl(imageUrl)) {
                    console.log(`[Mass image downloader]: 🚫 Invalid image URL (skipped): ${imageUrl}`);
                    return;
                }

                let fileName = new URL(imageUrl).pathname.split('/').pop();
                let fileExtension = "";

                // ✅ Extract file extension
                if (fileName.includes('.')) {
                    const lastDotIndex = fileName.lastIndexOf('.');
                    fileExtension = fileName.substring(lastDotIndex);
                    fileName = fileName.substring(0, lastDotIndex);
                }

                // ✅ Apply filename format based on user settings
                if (filenameMode === "prefix") {
                    fileName = `${prefix}_${fileName}`;
                } else if (filenameMode === "suffix") {
                    fileName = `${fileName}_${suffix}`;
                } else if (filenameMode === "both") {
                    fileName = `${prefix}_${fileName}_${suffix}`;
                } else if (filenameMode === "timestamp") {
                    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(2, 14);
                    fileName = `${fileName}_${timestamp}`;
                }

                const sanitizedFilename = `${fileName}${fileExtension}`;

                // ✅ Validate image URL directly in background.js
                function isValidImageUrl(url) {
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
                    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
                }

                // ✅ Determine the correct download folder
                const targetPath = downloadFolder === "custom" && customFolderPath
                    ? `${customFolderPath.replace(/\\/g, '/')}/${sanitizedFilename}`
                    : sanitizedFilename;

                if (extractGalleryMode === "immediate") {
                    // ✅ Download the image immediately
                    console.log('[Mass image downloader]: ------------------------------------');
                    console.log(`[Mass image downloader]: 📥 Downloading gallery image immediately: ${sanitizedFilename}`);
                    chrome.downloads.download({ url: imageUrl, filename: targetPath }, () => {
                        galleryImagesOpened++;
                        updateBadge(galleryImagesOpened);
                        console.log(`[Mass image downloader]: ✅ Gallery image downloaded: ${sanitizedFilename}`);

                        if (index === message.images.length - 1) {
                            console.log("[Mass image downloader]: ✅ All images have been downloaded immediately.");
                            updateBadge(galleryImagesOpened, true);
                            console.log("[Mass image downloader]: 🏁 Extract Gallery Images process completed successfully.");
                        }
                    });
                } else {
                    // ✅ Open image in a new tab before downloading
                    console.log('[Mass image downloader]: ------------------------------------');
                    console.log(`[Mass image downloader]: 🔗 Opening new tab for gallery image: ${imageUrl}`);
                    chrome.tabs.create({ url: imageUrl, active: false }, (tab) => {
                        imagesOpened++;
                        galleryImagesOpened++;
                        updateBadge(galleryImagesOpened);
                        console.log(`[Mass image downloader]: 📂 Opened image ${index + 1}/${message.images.length}: ${imageUrl}`);

                        if (index === message.images.length - 1) {
                            console.log("[Mass image downloader]: ✅ All images have been opened.");
                            updateBadge(galleryImagesOpened, true);
                            console.log("[Mass image downloader]: 🏁 Extract Gallery Images process completed successfully.");
                        }
                    });
                }
            }, index * 500);
        });

        sendResponse({ success: true });
        return true;
    }

    // ✅ Helper function to calculate path similarity between two URLs
    function calculatePathSimilarity(url1, url2) {
        const path1 = new URL(url1).pathname;
        const path2 = new URL(url2).pathname;

        const segments1 = path1.split('/');
        const segments2 = path2.split('/');

        const minLength = Math.min(segments1.length, segments2.length);
        let similarSegments = 0;

        for (let i = 0; i < minLength; i++) {
            if (segments1[i] === segments2[i]) {
                similarSegments++;
            }
        }

        const similarityPercentage = (similarSegments / Math.max(segments1.length, segments2.length)) * 100;
        return similarityPercentage;
    }

    // ✅ Helper function to choose higher resolution image
    function isHigherResolution(img1, img2) {
        return (img1.width * img1.height) > (img2.width * img2.height);
    }

    // ✅ Gallery Finder functionality
    if (message.action === "startGalleryFinder") {
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log('[Mass image downloader]: 🖼️ Gallery Finder Functionality');
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log('[Mass image downloader]: 📥 Finding images in gallery');
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log(`[Mass image downloader]: Using settings: Min Width: ${galleryFinderSettings.minWidth}, Min Height: ${galleryFinderSettings.minHeight}, Path Similarity: ${galleryFinderSettings.pathSimilarity}, Prefer High Resolution: ${galleryFinderSettings.preferHighResolution}`);

        // Variables to store potential gallery images
        let potentialGalleryImages = [];
        let galleryImages = [];
        
        // Filter images based on size and URL validity
        message.images.forEach((img) => {
            try {
                const imageUrl = new URL(img.url);

                if (!isValidImageUrl(imageUrl.href)) {
                    console.log(`[Mass image downloader]: 🚫 Invalid image URL (skipped): ${imageUrl.href}`);
                    console.log('[Mass image downloader]: ----------------------------------------');
                    console.log(`[Mass image downloader]:  `);
                    return;
                }

                if (img.width >= galleryFinderSettings.minWidth && img.height >= galleryFinderSettings.minHeight) {
                    potentialGalleryImages.push(img);
                    console.log(`[Mass image downloader]: ✅ Valid image candidate: ${imageUrl.href} (Width: ${img.width}, Height: ${img.height})`);
                    console.log('[Mass image downloader]: ----------------------------------------');
                    console.log(`[Mass image downloader]:  `);
                } else {
                    console.log(`[Mass image downloader]: ❌ Image size too small (skipped): ${imageUrl.href} (Width: ${img.width}, Height: ${img.height})`);
                    console.log('[Mass image downloader]: ----------------------------------------');
                    console.log(`[Mass image downloader]:  `);
                }
            } catch (err) {
                console.log(`[Mass image downloader]: ⚠️ Error processing image URL - ${err.message}`);
                console.log('[Mass image downloader]: ----------------------------------------');
                console.log(`[Mass image downloader]:  `);
            }
        });

        // Group similar images based on path similarity
        potentialGalleryImages.forEach((img1) => {
            let similarGroup = [img1];
            potentialGalleryImages.forEach((img2) => {
                if (img1 !== img2) {
                    const similarity = calculatePathSimilarity(img1.url, img2.url);
                    if (similarity >= galleryFinderSettings.pathSimilarity) {
                        if (galleryFinderSettings.preferHighResolution) {
                            if (isHigherResolution(img2, img1)) {
                                similarGroup = [img2];
                            }
                        } else {
                            similarGroup.push(img2);
                        }
                    }
                }
            });
            galleryImages.push(...similarGroup);
        });

        console.log(`[Mass image downloader]: 🖼️ Gallery Finder found ${galleryImages.length} images that match the criteria.`);
        console.log(`[Mass image downloader]:  `);
        

        // ✅ Process each image based on the gallery mode (immediate or tab)
        galleryImages.forEach((img, index) => {
            setTimeout(() => {
                const fileName = new URL(img.url).pathname.split('/').pop();
                const targetPath = downloadFolder === "custom" && customFolderPath
                    ? `${customFolderPath.replace(/\\/g, '/')}/${fileName}`
                    : fileName;

                if (extractGalleryMode === "immediate") {
                    console.log(`[Mass image downloader]: 📥 Downloading gallery image immediately: ${fileName}`);
                    chrome.downloads.download({ url: img.url, filename: targetPath }, (downloadId) => {
                        if (downloadId) {
                            console.log(`[Mass image downloader]: ✅ Image ${fileName} downloaded successfully!`);
                            console.log('[Mass image downloader]: ----------------------------------------');
                            console.log(`[Mass image downloader]:  `);
                        } else {
                            console.log(`[Mass image downloader]: ❌ Failed to download image: ${fileName}`);
                            console.log('[Mass image downloader]: ----------------------------------------');
                            console.log(`[Mass image downloader]:  `);
                        }
                    });
                } else {
                    console.log(`[Mass image downloader]: 🔗 Opening new tab for gallery image: ${img.url}`);
                    chrome.tabs.create({ url: img.url, active: false }, (tab) => {
                        console.log(`[Mass image downloader]: 📂 Opened image tab: ${img.url}`);
                    });
                    console.log('[Mass image downloader]: ----------------------------------------');
                    console.log(`[Mass image downloader]:  `);
                }
            }, index * 300);
        });

        console.log("[Mass image downloader]: ✅ Gallery Finder process completed.");
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log(`[Mass image downloader]:  `);
        
        sendResponse({ success: true });
        return true;
    }


sendResponse({ success: false, error: "Unknown action." });
});
