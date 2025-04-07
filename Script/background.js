// background.js - Mass Image Downloader (Robust & Complete)

console.log('[Mass image downloader]: Background script loaded successfully.');
if (chrome.runtime.getManifest) {
    console.log(`[Mass image downloader]: Running version ${chrome.runtime.getManifest().version}`);
}

import { updateBadge, closeTabSafely, isValidImageUrl, moveToNextTab } from "./utils.js";

// [Mass image downloader]: 🔧 Global settings variables
let downloadFolder = "default";
let customFolderPath = "";
let downloadLimit = 2;
let debugLoggingEnabled = false;
let filenameMode = "none";
let prefix = "";
let suffix = "";
let extractGalleryMode = "tab";
let minWidth = 800;
let minHeight = 600;
let pathSimilarityLevel = 90;
let preferHigherResolution = true;
let galleryMaxImages = 3; // ⭐ New: max images per second for gallery extraction

/**
 * ✅ Apply default settings when the extension is installed for the first time.
 */
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        console.log("[Mass image downloader]: 📌 First-time installation detected. Applying default settings...");
        chrome.storage.sync.set({
            downloadFolder: "default",
            allowJPG: true,
            allowJPEG: true,
            allowPNG: true,
            allowWEBP: false,
            downloadLimit: 1,
            filenameMode: "none",
            debugLogging: false,
            
	        // ✅ Extract Gallery Images Settings
	        extractGalleryMode: "tab",
            
	        // ✅ Gallery Finder Settings (new feature)
	        minWidth: 800,
            minHeight: 600,
            pathSimilarityLevel: 90,
            preferHigherResolution: true,
            galleryMaxImages: 3 // ⭐ Default value
        }, () => {
            console.log("[Mass image downloader]: ✅ Default settings applied successfully.");
        });
    }
});

/**
 * 🔎 Sanitize filename components (prefix/suffix)
 */
function sanitizeFilenameComponent(text) {
    return text.trim().replace(/[^a-zA-Z0-9 ]/g, '');
}

/**
 * ✅ Load settings from chrome.storage.sync on startup
 */
function loadSettings() {
    chrome.storage.sync.get([
        "downloadFolder", "customFolderPath", "downloadLimit", "debugLogging",
        "filenameMode", "prefix", "suffix", "extractGalleryMode",
        "minWidth", "minHeight", "pathSimilarityLevel",
        "preferHigherResolution", "galleryMaxImages"
    ], (data) => {
        if (chrome.runtime.lastError) {
            console.log("[Mass image downloader]: ❌ Failed to load settings:", chrome.runtime.lastError.message);
            return;
        }
        downloadFolder = data.downloadFolder || "default";
        customFolderPath = data.customFolderPath?.replace(/[<>:"/\\|?*]+/g, '') || "";
        downloadLimit = (data.downloadLimit >= 1 && data.downloadLimit <= 15) ? data.downloadLimit : 2;
        debugLoggingEnabled = data.debugLogging || false;
        filenameMode = data.filenameMode || "none";
        prefix = sanitizeFilenameComponent(data.prefix || "");
        suffix = sanitizeFilenameComponent(data.suffix || "");
        extractGalleryMode = data.extractGalleryMode || "tab";
        minWidth = data.minWidth || 800;
        minHeight = data.minHeight || 600;
        pathSimilarityLevel = data.pathSimilarityLevel || 90;
        preferHigherResolution = data.preferHigherResolution !== undefined ? data.preferHigherResolution : true;
        galleryMaxImages = (data.galleryMaxImages >= 1 && data.galleryMaxImages <= 10) ? data.galleryMaxImages : 3;

        console.log('[Mass image downloader]: ------------------------------');
        console.log('[Mass image downloader]: 🔄 Retrieving settings from storage...');
        console.log('[Mass image downloader]:  ');
        console.log('[Mass image downloader]: 🌍 Global settings:');
        console.log('[Mass image downloader]:  📁 Download Folder');
        console.log(`[Mass image downloader]:    Stored Download Folder: ${downloadFolder}`);
        console.log(`[Mass image downloader]:    Custom Folder Path: ${customFolderPath}`);
        console.log('[Mass image downloader]:  📄 Allowed Image Formats:');
        console.log(`[Mass image downloader]:  📜 Filename Mode: ${filenameMode}`);
        console.log(`[Mass image downloader]:  🔤 Prefix: ${prefix}`);
        console.log(`[Mass image downloader]:  🔡 Suffix: ${suffix}`);
        console.log(`[Mass image downloader]:  📌 Stored Download Limit: ${downloadLimit}`);
        console.log(`[Mass image downloader]:  🖼 Extract Gallery Mode: ${extractGalleryMode}`);
        console.log(`[Mass image downloader]:  📏 Minimum Image Width: ${minWidth}`);
        console.log(`[Mass image downloader]:  📐 Minimum Image Height: ${minHeight}`);
        console.log(`[Mass image downloader]:  🐛 Debug Logging Enabled: ${debugLoggingEnabled}`);
        console.log('[Mass image downloader]: 📸 Bulk Image Download functionality');  
        console.log(`[Mass image downloader]:  ⚡ Gallery Max Images/sec: ${galleryMaxImages}`); 
        console.log('[Mass image downloader]: 📸 Extract Gallery Images functionality');       
        console.log(`[Mass image downloader]:  📝 Path Similarity Level: ${pathSimilarityLevel}%`);
        console.log(`[Mass image downloader]:  ⛅ Prefer Higher Resolution: ${preferHigherResolution}`);
        console.log('[Mass image downloader]:  ');
        console.log('[Mass image downloader]: ✅ Settings loaded and applied.');
        console.log('[Mass image downloader]: ------------------------------');
    });
}

loadSettings();

/**
 * 🔄 Listen for live updates to chrome.storage.sync and apply them immediately
 */
chrome.storage.onChanged.addListener((changes) => {
    const updatedDetails = [];
    console.log('[Mass image downloader]: 🔄 Detected live update of settings');
    for (const key in changes) {
        const newValue = changes[key].newValue;
        const oldValue = changes[key].oldValue;
        switch (key) {
            case "downloadFolder": downloadFolder = newValue; break;
            case "customFolderPath": customFolderPath = newValue.replace(/[<>:"/\\|?*]+/g, ''); break;
            case "downloadLimit": downloadLimit = newValue; break;
            case "debugLogging": debugLoggingEnabled = newValue; break;
            case "filenameMode": filenameMode = newValue; break;
            case "prefix": prefix = sanitizeFilenameComponent(newValue); break;
            case "suffix": suffix = sanitizeFilenameComponent(newValue); break;
            case "extractGalleryMode": extractGalleryMode = newValue; break;
            case "minWidth": minWidth = newValue; break;
            case "minHeight": minHeight = newValue; break;
            case "pathSimilarityLevel": pathSimilarityLevel = newValue; break;
            case "preferHigherResolution": preferHigherResolution = newValue; break;
            case "galleryMaxImages": galleryMaxImages = newValue; break;
        }
        updatedDetails.push(`${key}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
    }
    console.log(`[Mass image downloader]: ✅ Settings updated in memory:\n - ${updatedDetails.join("\n - ")}`);
});

/**
 * 🧠 Utility: Validates a message before handling
 */
function validateMessage(message) {
    return message && typeof message === 'object' && typeof message.action === 'string';
}

/**
 * 🧠 Utility: Sends response safely
 */
function respondSafe(sendResponse, payload) {
    try {
        sendResponse(payload);
    } catch (err) {
        console.log('[Mass image downloader]: ⚠️ sendResponse failed:', err.message);
    }
}

/**
 * 🧠 Utility: Generates a filename with mode applied (prefix, suffix, timestamp)
 */
function generateFilename(baseName, extension) {
    if (filenameMode === "prefix") {
        baseName = `${prefix}_${baseName}`;
    } else if (filenameMode === "suffix") {
        baseName = `${baseName}_${suffix}`;
    } else if (filenameMode === "both") {
        baseName = `${prefix}_${baseName}_${suffix}`;
    } else if (filenameMode === "timestamp") {
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(2, 14);
        baseName = `${baseName}_${timestamp}`;
    }
    return `${baseName}${extension}`;
}

/**
 * 📏 Calculates similarity between two URL paths
 */
function calculatePathSimilarity(url1, url2) {
    const path1 = new URL(url1).pathname.split('/');
    const path2 = new URL(url2).pathname.split('/');
    const minLen = Math.min(path1.length, path2.length);
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
        if (path1[i] === path2[i]) matches++;
    }
    return (matches / Math.max(path1.length, path2.length)) * 100;
}

/**
 * 🔍 Determines if img2 has higher resolution than img1
 */
function isHigherResolution(img1, img2) {
    return (img2.width * img2.height) > (img1.width * img1.height);
}
// background.js - Mass Image Downloader (Robust & Complete)

/**
 * 📩 Main message handler for core extension functionalities
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!validateMessage(message)) return false;
    console.log(`[Mass image downloader]: 🚀 Received message: ${message.action}`);
    console.log('[Mass image downloader]: ');


    // 📦 Process control flag for Bulk Image Download
    let downloadProcessFinished = false;

    // ✅ Bulk Image Download Functionality
    if (message.action === 'startDownload') {
        console.log('[Mass image downloader]: ------------------------------------');
        console.log('[Mass image downloader]: 📸 Bulk Image Download Functionality');
        console.log('[Mass image downloader]: ------------------------------------');
        console.log('[Mass image downloader]: 📥 BEGIN: Download process started');
        console.log('[Mass image downloader]:');

        let successfulDownloads = 0;
        updateBadge(0);
        downloadProcessFinished = false;

        // 🧠 Cache to avoid downloading duplicate image URLs
        const validatedUrls = new Set();

        /**
         * 📋 Step 1: Get all tabs and filter from current active tab
         */
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            const activeTabIndex = message.activeTabIndex;
            const filteredTabs = tabs.filter(tab => tab.index >= activeTabIndex);

            /**
             * 🔍 Step 2: Validate which tabs have direct image URLs
             */
            console.log('[Mass image downloader]: 🔎 BEGIN: Filtering image tabs...');
            const validTabs = filteredTabs.filter(tab => {
                const isValid = isValidImageUrl(tab.url);
                console.log(`[Mass image downloader]: 🟡 Checking tab id: ${tab.id}`);
                if (!isValid) {
                    console.log(`[Mass image downloader]: ❌ Not a valid image: ${tab.url}`);
                    console.log('[Mass image downloader]:');
                } else {
                    console.log(`[Mass image downloader]: ✅ Valid image found: ${tab.url}`);
                    console.log('[Mass image downloader]:');
                }
                return isValid;
            });
            console.log(`[Mass image downloader]: 🔎 END: ${validTabs.length} valid image tabs found`);
            console.log('[Mass image downloader]: ------------------------------------');
            console.log('[Mass image downloader]:');

            let activeDownloads = 0;
            let completedTabs = 0;
            const totalTabs = validTabs.length;

            /**
             * 🚀 Step 3: Process each tab one by one
             */
            function processTab(tab) {
                try {
                    const url = new URL(tab.url);
                    console.log(`[Mass image downloader]: 🛠️ BEGIN: Processing tab id: ${tab.id}`);

                    // 🚫 Skip duplicated URLs
                    if (validatedUrls.has(url.href)) {
                        console.log(`[Mass image downloader]: 🔁 Duplicate URL skipped: ${url.href}`);
                        console.log(`[Mass image downloader]: 🛠️ END: Tab id ${tab.id}`);
                        console.log('[Mass image downloader]: ------------------------------------');
                        console.log('[Mass image downloader]:');
                        onComplete();
                        return;
                    }

                    validatedUrls.add(url.href);

                    /**
                     * 📏 Step 4: Validate image dimensions
                     */
                    fetch(url.href)
                        .then(response => response.blob())
                        .then(blob => createImageBitmap(blob))
                        .then(bitmap => {
                            console.log(`[Mass image downloader]: 📏 BEGIN: Validating image size (tab id ${tab.id})`);

                            if (bitmap.width < minWidth || bitmap.height < minHeight) {
                                console.log(`[Mass image downloader]: ⛔ Skipped: Image too small (${bitmap.width}x${bitmap.height})`);
                                console.log(`[Mass image downloader]: 🔎 Required minimum: ${minWidth}x${minHeight}`);
                                console.log(`[Mass image downloader]: 📏 END: Validation failed`);
                                console.log(`[Mass image downloader]: 🛠️ END: Tab id ${tab.id}`);
                                console.log('[Mass image downloader]: ------------------------------------');
                                console.log('[Mass image downloader]:');
                                onComplete();
                                return;
                            }

                            let fileName = url.pathname.split('/').pop() || 'image';
                            let extension = '';
                            if (fileName.includes('.')) {
                                const lastDot = fileName.lastIndexOf('.');
                                extension = fileName.slice(lastDot);
                                fileName = fileName.slice(0, lastDot);
                            }

                            // 🧠 Apply prefix/suffix/filename mode
                            const finalName = generateFilename(fileName, extension);
                            const finalPath = (downloadFolder === 'custom' && customFolderPath)
                                ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                                : finalName;

                            /**
                             * 💾 Step 5: Download image
                             */
                            console.log(`[Mass image downloader]: 💾 BEGIN: Downloading "${finalName}"`);
                            chrome.downloads.download({ url: url.href, filename: finalPath, conflictAction: 'uniquify' }, (downloadId) => {
                                if (downloadId) {
                                    console.log(`[Mass image downloader]: 👍 Image name: ${finalName}`);
                                    console.log(`[Mass image downloader]: 💾 Download success`);
                                    successfulDownloads++;
                                    console.log(`[Mass image downloader]: 🆗 Downloaded images: ${successfulDownloads}`);
                                    closeTabSafely(tab.id, () => {
                                        if (!downloadProcessFinished) updateBadge(successfulDownloads);
                                    });
                                    console.log(`[Mass image downloader]: 💾 END: Download complete`);
                                    console.log('[Mass image downloader]: ------------------------------------');
                                    console.log('[Mass image downloader]:');
                                } else {
                                    console.log(`[Mass image downloader]: ❌ Failed to download: ${url.href}`);
                                    console.log('[Mass image downloader]: ------------------------------------');
                                    console.log('[Mass image downloader]:');
                                }
                                console.log(`[Mass image downloader]: 🛠️ END: Tab id ${tab.id}`);
                                console.log('[Mass image downloader]: ------------------------------------');
                                console.log('[Mass image downloader]:');
                                onComplete();
                            });
                        })
                        .catch(err => {
                            console.log(`[Mass image downloader]: ❌ Error validating image: ${err.message}`);
                            console.log(`[Mass image downloader]: 🛠️ END: Tab id ${tab.id}`);
                            console.log('[Mass image downloader]: ------------------------------------');
                            console.log('[Mass image downloader]:');
                            onComplete();
                        });
                } catch (error) {
                    console.log(`[Mass image downloader]: ⚠️ Exception in tab processing: ${error.message}`);
                    console.log(`[Mass image downloader]: 🐛 Stacktrace: ${error.stack}`);
                    console.log(`[Mass image downloader]: 🛠️ END: Tab id ${tab.id}`);
                    console.log('[Mass image downloader]: ------------------------------------');
                    console.log('[Mass image downloader]:');
                    onComplete();
                }
            }

            /**
             * 📊 Step 6: Mark each tab processed and proceed
             */
            function onComplete() {
                activeDownloads--;
                completedTabs++;
                if (completedTabs === totalTabs && activeDownloads === 0) {
                    console.log('[Mass image downloader]: ✅ All image tabs processed successfully');
                    console.log('[Mass image downloader]: 📥 END: Download process completed');
                    console.log('[Mass image downloader]: ------------------------------------');
                    console.log('[Mass image downloader]:');
                    downloadProcessFinished = true;
                    updateBadge(successfulDownloads, true);
                    respondSafe(sendResponse, { success: true, downloads: successfulDownloads });
                } else {
                    processQueue();
                }
            }

            /**
             * 🧵 Step 7: Queue manager for parallel downloads
             */
            let queueIndex = 0;
            function processQueue() {
                try {
                    while (activeDownloads < downloadLimit && queueIndex < totalTabs) {
                        const tab = validTabs[queueIndex++];
                        activeDownloads++;
                        processTab(tab);
                    }
                } catch (queueError) {
                    console.log(`[Mass image downloader]: ❌ Error in processQueue: ${queueError.message}`);
                    console.log('[Mass image downloader]: ------------------------------------');
                    console.log('[Mass image downloader]:');
                }
            }

            // 🚀 Start processing image download queue
            processQueue();
        });

        return true;
    }


    /**
     * 🌄 Extract Gallery Images Functionality
     * ---------------------------------------------------------------
     * This handler receives image URLs from extractGallery.js, validates 
     * them, and either downloads them directly or opens them in new tabs 
     * depending on extractGalleryMode setting.
     */
    if (message.action === 'openGalleryImages') {
        console.log('[Mass image downloader]: --------------------------------------------------');
        console.log('[Mass image downloader]: 🌄 BEGIN: Extract Gallery Images Functionality');
        console.log('[Mass image downloader]: --------------------------------------------------');

        const { images, totalImages } = message;

        // 🧪 Validate received image array
        if (!Array.isArray(images) || images.length === 0) {
            console.log('[Mass image downloader]: ⚠️ No images provided for extraction.');
            console.log('[Mass image downloader]: --------------------------------------------------');
            console.log('[Mass image downloader]:');
            respondSafe(sendResponse, { success: false, error: 'No images to extract' });
            return true;
        }

        // 🔢 Reset badge counter and initialize progress tracking
        updateBadge(0);
        let imagesProcessed = 0;
        const delay = 1000 / galleryMaxImages;

        /**
         * 🧠 Updates progress in the badge and detects completion
         */
        function onGalleryProgress() {
            imagesProcessed++;
            updateBadge(imagesProcessed);
            console.log(`[Mass image downloader]: 🔄 Progress: ${imagesProcessed} of ${totalImages}`);

            if (imagesProcessed === totalImages) {
                updateBadge(imagesProcessed, true);
                console.log('[Mass image downloader]: ✅ END: All gallery images processed.');
                console.log('[Mass image downloader]: --------------------------------------------------');
                console.log('[Mass image downloader]: ');
            }
        }

        /**
         * 🧪 Process each image URL with delay based on galleryMaxImages
         */
        images.forEach((imageUrl, index) => {
            setTimeout(() => {
                try {
                    console.log('[Mass image downloader]: --------------------------------------------------');
                    console.log(`[Mass image downloader]: 🔍 BEGIN: Processing gallery image index ${index}`);
                    console.log(`[Mass image downloader]: 📷 Image URL: ${imageUrl}`);

                    if (!isValidImageUrl(imageUrl)) {
                        console.log(`[Mass image downloader]: 🚫 Invalid image URL (skipped): ${imageUrl}`);
                        console.log('[Mass image downloader]: --------------------------------------------------');
                        console.log('[Mass image downloader]:');
                        onGalleryProgress();
                        return;
                    }

                    const urlObj = new URL(imageUrl);
                    let fileName = urlObj.pathname.split('/').pop() || 'image';
                    let extension = '';
                    if (fileName.includes('.')) {
                        const lastDot = fileName.lastIndexOf('.');
                        extension = fileName.slice(lastDot);
                        fileName = fileName.slice(0, lastDot);
                    }

                    const finalName = generateFilename(fileName, extension);
                    const finalPath = (downloadFolder === 'custom' && customFolderPath)
                        ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                        : finalName;

                    // ⚙️ Process based on configured mode (immediate or open tab)
                    if (extractGalleryMode === 'immediate') {
                        chrome.downloads.download({ url: imageUrl, filename: finalPath }, (downloadId) => {
                            if (downloadId) {
                                console.log(`[Mass image downloader]: 💾 Downloaded: ${finalName}`);
                            } else {
                                console.log(`[Mass image downloader]: ❌ Download failed for: ${imageUrl}`);
                            }
                            console.log(`[Mass image downloader]: 🔚 END: Image index ${index}`);
                            console.log('[Mass image downloader]: --------------------------------------------------');
                            console.log('[Mass image downloader]:');
                            onGalleryProgress();
                        });
                    } else {
                        chrome.tabs.create({ url: imageUrl, active: false }, () => {
                            console.log(`[Mass image downloader]: 🔗 Opened in new tab: ${imageUrl}`);
                            console.log(`[Mass image downloader]: 🔚 END: Image index ${index}`);
                            console.log('[Mass image downloader]: --------------------------------------------------');
                            console.log('[Mass image downloader]:');
                            onGalleryProgress();
                        });
                    }

                } catch (error) {
                    console.log(`[Mass image downloader]: ⚠️ Error processing image index ${index}: ${error.message}`);
                    console.log(`[Mass image downloader]: 🐛 Stacktrace: ${error.stack}`);
                    console.log(`[Mass image downloader]: 🔚 END: Image index ${index}`);
                    console.log('[Mass image downloader]: --------------------------------------------------');
                    console.log('[Mass image downloader]:');
                    onGalleryProgress();
                }
            }, index * delay);
        });

        sendResponse({ success: true });
        return true;
    }


    
    // ✅ Gallery Finder functionality
    if (message.action === 'startGalleryFinder') {
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log('[Mass image downloader]: 🖼️ Gallery Finder Functionality');
        console.log('[Mass image downloader]: ----------------------------------------');
        console.log('[Mass image downloader]: 🔍 Scanning and grouping images...');

        if (!Array.isArray(message.images)) {
            console.log('[Mass image downloader]: ⚠️ No image array received.');
            respondSafe(sendResponse, { success: false, error: 'Invalid image list' });
            return true;
        }

        // 🗂 Step 1: Filter potential gallery images
        const potential = message.images.filter(img => {
            return isValidImageUrl(img.url)
                && img.width >= minWidth
                && img.height >= minHeight;
        });

        if (potential.length === 0) {
            console.log('[Mass image downloader]: ⚠️ No valid gallery candidates found.');
            respondSafe(sendResponse, { success: false, error: 'No valid gallery images' });
            return true;
        }

        // 🧠 Step 2: Group similar images
        const galleryImages = [];
        const visited = new Set();

        for (let i = 0; i < potential.length; i++) {
            if (visited.has(i)) continue;
            let base = potential[i];

            for (let j = i + 1; j < potential.length; j++) {
                if (visited.has(j)) continue;
                const similarity = calculatePathSimilarity(base.url, potential[j].url);

                if (similarity >= pathSimilarityLevel) {
                    const selected = preferHigherResolution
                        ? (isHigherResolution(potential[j], base) ? potential[j] : base)
                        : base;
                    galleryImages.push(selected);
                    visited.add(i);
                    visited.add(j);
                    break;
                }
            }
        }

        if (galleryImages.length === 0) {
            console.log('[Mass image downloader]: ⚠️ No gallery images matched similarity criteria.');
            respondSafe(sendResponse, { success: false, error: 'No grouped gallery images' });
            return true;
        }

        // reset badge
        updateBadge(0);
        
        // 🚀 Step 3: Process grouped gallery images
        galleryImages.forEach((img, index) => {
            const url = img.url;
            const file = url.split('/').pop() || 'image';
            const ext = file.includes('.') ? file.slice(file.lastIndexOf('.')) : '';
            const name = file.replace(ext, '');
            const finalName = generateFilename(name, ext);
            const targetPath = (downloadFolder === 'custom' && customFolderPath)
                ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                : finalName;

            setTimeout(() => {
                if (extractGalleryMode === 'immediate') {
                    console.log(`[Mass image downloader]: 🕑 Downloading: ${finalName}`);
                    chrome.downloads.download({ url, filename: targetPath }, (downloadId) => {
                        if (downloadId) {
                            console.log(`[Mass image downloader]: 💾 Downloaded: ${finalName}`);
                            updateBadge(index + 1);
                            if(index === galleryImages.length - 1) {
                                updateBadge(galleryImages.length, true);
                                console.log('[Mass image downloader]: 🏁 All gallery images downloaded.');
                            }
                        } else {
                            console.log(`[Mass image downloader]: ❌ Failed: ${finalName}`);
                        }
                    });
                } else {
                    console.log(`[Mass image downloader]: 🔗 Opening in new tab: ${url}`);
                    chrome.tabs.create({ url, active: false });
                    updateBadge(index + 1);
                    if(index === galleryImages.length - 1)
                    {
                        updateBadge(galleryImages.length, true);
                        console.log('[Mass image downloader]: 🏁 All gallery images downloaded.');
                    }
                }
            }, index * 300);
        });

        respondSafe(sendResponse, { success: true, count: galleryImages.length });
        return true;
    }


sendResponse({ success: false, error: "Unknown action." });
});
