// background.js - Mass Image Downloader (Robust & Complete)

console.log('[Mass image downloader]: Background script loaded successfully.');
if (chrome.runtime.getManifest) {
    console.log(`[Mass image downloader]: Running version ${chrome.runtime.getManifest().version}`);
}

// ✅ Import utility functions relative to manifest root (for ES module support)
import {
    updateBadge,
    closeTabSafely,
    logDebug,
    calculatePathSimilarity,
    isHigherResolution,
    generateFilename,
    sanitizeFilenameComponent,
    isDirectImageUrl,
    isAllowedImageFormat
} from "./utils.js";

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
let galleryMaxImages = 3;
let maxBulkBatch = 0;
let continueBulkLoop = false;
let allowJPG = false;
let allowJPEG = false;
let allowPNG = false;
let allowWEBP = false;

    /**
     * ✅ Apply default settings when the extension is installed for the first time.
     */
    chrome.runtime.onInstalled.addListener((details) => {
        if (details.reason === "install") {
            console.log('[Mass image downloader]: 📌 First-time installation detected. Applying default settings...');
            chrome.storage.sync.set({
                downloadFolder: "default",
                allowJPG: true,
                allowJPEG: true,
                allowPNG: true,
                allowWEBP: false,
                downloadLimit: 1,
                filenameMode: "none",
                debugLogging: false,
                extractGalleryMode: "tab",
                minWidth: 800,
                minHeight: 600,
                pathSimilarityLevel: 90,
                galleryMaxImages: 3,
                maxBulkBatch: 0,
                continueFromLastBulkBatch: false,
                prefix: "",
                suffix: ""
            }, () => {
                console.log('[Mass image downloader]: ✅ Default settings applied successfully.');
                console.log('[Mass image downloader]: 🌍 Default values set:');
                console.log('[Mass image downloader]:    📁 Download Folder: default');
                console.log('[Mass image downloader]:        📁 Stored download Folder: default');
                console.log('[Mass image downloader]:        📂 Custom Folder Path: ');
                console.log('[Mass image downloader]:    📄 Allowed Image Formats:');
                console.log('[Mass image downloader]:       allowJPG:  true');
                console.log('[Mass image downloader]:       allowJPEG: true');
                console.log('[Mass image downloader]:       allowPNG:  true');
                console.log('[Mass image downloader]:       allowWEBP: false');
                console.log('[Mass image downloader]:    📜 Filename Mode: none');
                console.log('[Mass image downloader]:        🔤 Prefix: ""');
                console.log('[Mass image downloader]:        🔡 Suffix: ""');
                console.log('[Mass image downloader]:    📌 Max Simultaneous Downloads: 1');
                console.log('[Mass image downloader]:    🖼 Extract Gallery Mode: tab');
                console.log('[Mass image downloader]:    📏 Minimum Image Width: 800');
                console.log('[Mass image downloader]:    📐 Minimum Image Height: 600');
                console.log('[Mass image downloader]:    🐛 Debug Logging Enabled: false');
                console.log('[Mass image downloader]: 📸 Bulk Image Download functionality');
                console.log('[Mass image downloader]:    📌 Max image per batch: 0');
                console.log('[Mass image downloader]:    🔁 Continue bulk loop: false')
                console.log('[Mass image downloader]: 🌄 Extract Gallery Images functionality');
                console.log('[Mass image downloader]:    ⚡ Gallery Max Images/sec: 3');
                console.log('[Mass image downloader]: 🔎 Gallery Finder functionality');
                console.log('[Mass image downloader]:    📝 Path Similarity Level: 90%');
            });
        }
    });

    /**
     * ✅ Load settings from chrome.storage.sync on startup
     */
    function loadSettings() {
        chrome.storage.sync.get([
            "downloadFolder", "customFolderPath", "downloadLimit", "debugLogging",
            "filenameMode", "prefix", "suffix", "extractGalleryMode",
            "minWidth", "minHeight", "pathSimilarityLevel",
            "galleryMaxImages",
            "maxBulkBatch", "continueFromLastBulkBatch",
            "allowJPG", "allowJPEG", "allowPNG", "allowWEBP"
        ], (data) => {
            if (chrome.runtime.lastError) {
                console.log(`[Mass image downloader]: ❌ Failed to load settings: ${chrome.runtime.lastError.message}`);
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
            galleryMaxImages = (data.galleryMaxImages >= 1 && data.galleryMaxImages <= 10) ? data.galleryMaxImages : 3;
            maxBulkBatch = (data.maxBulkBatch >= 0 && data.maxBulkBatch <= 100) ? data.maxBulkBatch : 0;
            continueBulkLoop = data.continueFromLastBulkBatch || false;

            const allowJPG = data.allowJPG !== false;
            const allowJPEG = data.allowJPEG !== false;
            const allowPNG = data.allowPNG !== false;
            const allowWEBP = data.allowWEBP !== false;

            console.log('[Mass image downloader]: ------------------------------');
            console.log('[Mass image downloader]: 🔄 Retrieving settings from storage...');
            console.log('[Mass image downloader]: ');
            console.log('[Mass image downloader]: 🌍 Global settings:');
            console.log('[Mass image downloader]:    📁 Download Folder');
            console.log(`[Mass image downloader]:    Stored Download Folder: ${downloadFolder}`);
            console.log(`[Mass image downloader]:    Custom Folder Path: ${customFolderPath}`);
            console.log('[Mass image downloader]:    📄 Allowed Image Formats:');
            console.log(`[Mass image downloader]:       allow JPG?  ${allowJPG}`);
            console.log(`[Mass image downloader]:       allow JPEG? ${allowJPEG}`);
            console.log(`[Mass image downloader]:       allow PNG?  ${allowPNG}`);
            console.log(`[Mass image downloader]:       allow WEBP? ${allowWEBP}`);
            console.log(`[Mass image downloader]:    📜 Filename Mode: ${filenameMode}`);
            console.log(`[Mass image downloader]:       🔤 Prefix: ${prefix}`);
            console.log(`[Mass image downloader]:       🔡 Suffix: ${suffix}`);
            console.log(`[Mass image downloader]:    📌 Max Simultaneous Downloads: ${downloadLimit}`);
            console.log(`[Mass image downloader]:    🖼 Extract Gallery Mode: ${extractGalleryMode}`);
            console.log(`[Mass image downloader]:    📏 Minimum Image Width: ${minWidth}`);
            console.log(`[Mass image downloader]:    📐 Minimum Image Height: ${minHeight}`);
            console.log(`[Mass image downloader]:    🐛 Debug Logging Enabled: ${debugLoggingEnabled}`);
            console.log('[Mass image downloader]: 📸 Bulk Image Download functionality');
            console.log(`[Mass image downloader]:    📌 Max image per batch: ${maxBulkBatch}`);
            console.log(`[Mass image downloader]:    🔁 Continue bulk loop: ${continueBulkLoop}`)
            console.log('[Mass image downloader]: 🌄 Extract Gallery Images functionality');
            console.log(`[Mass image downloader]:    ⚡ Gallery Max Images/sec: ${galleryMaxImages}`); 
            console.log('[Mass image downloader]: 🔎 Gallery Finder functionality');
            console.log(`[Mass image downloader]:    📝 Path Similarity Level: ${pathSimilarityLevel}%`);         
            console.log('[Mass image downloader]: ');
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
            case "galleryMaxImages": galleryMaxImages = newValue; break;
            case "maxBulkBatch": maxBulkBatch = newValue; break;
            case "continueFromLastBulkBatch": continueBulkLoop = newValue; break;
            case "allowJPG": allowJPG = newValue; break;
            case "allowJPEG": allowJPEG = newValue; break;
            case "allowPNG": allowPNG = newValue; break;
            case "allowWEBP": allowWEBP = newValue; break;            
                        
        }
        
        updatedDetails.push(`${key}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
    }
    
    console.log(`[Mass image downloader]: ✅ Settings updated in memory:\n - ${updatedDetails.join('\n - ')}`);
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
 * 📩 Main message handler for core extension functionalities
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!validateMessage(message)) return false;
    console.log(`[Mass image downloader]: 🚀 Received message: ${message.action}`);
    console.log('[Mass image downloader]: ');

    // ✅ Bulk Image Download Functionality
    if (message.action === 'startDownload') {
        handleStartDownload(message, sendResponse);
        return true;
    }

    // 🌄 Extract Gallery Images Functionality
    if (message.action === 'openGalleryImages') {
        handleOpenGalleryImages(message, sendResponse);
        return true;
    }

    // 🖼️ Gallery Finder Functionality
    if (message.action === 'startGalleryFinder') {
        handleStartGalleryFinder(message, sendResponse);
        return true;
    }

    respondSafe(sendResponse, { success: false, error: "Unknown action." });
});

/**
 * 🚀 Handle bulk image download process
 */
async function handleStartDownload(message, sendResponse) {
    console.log('[Mass image downloader]: ------------------------------------');
    console.log('[Mass image downloader]: 📸 Bulk Image Download Functionality');
    console.log('[Mass image downloader]: ------------------------------------');
    console.log('[Mass image downloader]: 📥 BEGIN: Download process started');
    console.log('[Mass image downloader]:');

    const validatedUrls = new Set();
    let totalProcessed = 0;
    let batchIndex = 0;

    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        const activeTabIndex = message.activeTabIndex;
        const filteredTabs = tabs.filter(tab => tab.index >= activeTabIndex);
        const validTabs = [];

        console.log('[Mass image downloader]: 🔎 BEGIN: Filtering image tabs...');

        for (const tab of filteredTabs) {
            try {
                console.log(`[Mass image downloader]: 🕵 Checking tab id: ${tab.id}`);
                console.log(`[Mass image downloader]: ⏳ Is a direct image URL?: ${tab.url}`);
        
                // ✅ Pre-filter: Only check URLs that appear to be direct images
                if (!isDirectImageUrl(tab.url)) {
                    console.log('[Mass image downloader]: ❌ Not a direct image URL.');
                    console.log('[Mass image downloader]: ⏩ Skipping this tab...');
                    console.log('[Mass image downloader]:');
                    continue;
                }
        
                const isAllowed = await isAllowedImageFormat(tab.url);
        
                if (!isAllowed) {
                    console.log(`[Mass image downloader]: 😒 Not an allowed image format!`);
                    console.log('[Mass image downloader]: ⏩ Skipping this tab...');
                    console.log('[Mass image downloader]:');
                    continue;
                }
        
                console.log('[Mass image downloader]: ✅ Valid image found!');
                console.log('[Mass image downloader]:');
                validTabs.push(tab);
            } catch (err) {
                console.log(`[Mass image downloader]: ❌ Error validating tab URL: ${err.message}`);
            }
        }
        

        console.log(`[Mass image downloader]: 🔎 END: ${validTabs.length} valid image tabs found`);
        console.log('[Mass image downloader]: ------------------------------------');
        console.log('[Mass image downloader]:');

        // 🧪 Prepare batches
        let remainingTabs = [...validTabs];

        // 🧠 BEGIN: Batch cycle
        function processNextBatch() {
            if (remainingTabs.length === 0) {
                console.log('[Mass image downloader]: 🛑 No remaining tabs. Ending process.');
                updateBadge(totalProcessed, true); // 🔵 Final badge
                respondSafe(sendResponse, { success: true, downloads: totalProcessed });
                return;
            }

            const currentBatch = (maxBulkBatch > 0)
                ? remainingTabs.slice(0, maxBulkBatch)
                : [...remainingTabs];

            remainingTabs = remainingTabs.slice(currentBatch.length);

            console.log(`[Mass image downloader]: 🔄 BEGIN: Batch #${++batchIndex} | Processing ${currentBatch.length} image tab(s)...`);

            processValidTabs(currentBatch, (downloadsInBatch) => {
                totalProcessed += downloadsInBatch;
                console.log(`[Mass image downloader]: 🔴 END: Batch #${batchIndex} complete. Downloads so far: ${totalProcessed}`);

                if (continueBulkLoop && remainingTabs.length > 0) {
                    console.log('[Mass image downloader]: 🔁 Continue enabled. Next batch queued...');
                    processNextBatch();
                } else {
                    console.log('[Mass image downloader]: 🏁 All batches processed. Finalizing badge...');
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
 */
async function processValidTabs(validTabs, onComplete, validatedUrls, resetBadge = true, totalProcessed = 0) {
    let activeDownloads = 0;
    let completedTabs = 0;
    const totalTabs = validTabs.length;
    let successfulDownloads = 0;

    // ✅ Reset badge ONLY if it's the very first batch
    if (resetBadge && totalProcessed === 0) updateBadge(0);

    function processTab(tab) {
        try {
            const url = new URL(tab.url);
            console.log(`[Mass image downloader]: 🛠️ BEGIN: Processing tab id: ${tab.id}`);

            if (validatedUrls.has(url.href)) {
                console.log(`[Mass image downloader]: 🔁 Duplicate URL skipped: ${url.href}`);
                console.log(`[Mass image downloader]: 🛠️ END: Tab id ${tab.id}`);
                console.log('[Mass image downloader]: ------------------------------------');
                console.log('[Mass image downloader]:');
                return onCompleteDownload();
            }

            validatedUrls.add(url.href);

            fetch(url.href)
                .then(response => response.blob())
                .then(blob => createImageBitmap(blob))
                .then(async (bitmap) => {
                    console.log('[Mass image downloader]:');
                    console.log(`[Mass image downloader]: 📏 BEGIN: Validating image size (tab id ${tab.id})`);

                    if (bitmap.width < minWidth || bitmap.height < minHeight) {
                        console.log(`[Mass image downloader]: ⛔ Skipped: Image too small (${bitmap.width}x${bitmap.height})`);
                        console.log(`[Mass image downloader]: 🔎 Required minimum: ${minWidth}x${minHeight}`);
                    	console.log(`[Mass image downloader]: 📏 END: Validation failed`);
                    	console.log(`[Mass image downloader]: 🛠️ END: Tab id ${tab.id}`);
                    	console.log('[Mass image downloader]: ------------------------------------');
                    	console.log('[Mass image downloader]:');
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

		            console.log(`[Mass image downloader]: 💾 BEGIN: Downloading`);
                    const finalName = await generateFilename(fileName, extension);
                    const finalPath = (downloadFolder === 'custom' && customFolderPath)
                        ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                        : finalName;

		            console.log(`[Mass image downloader]: 📁 Path + final File: ${finalPath}`);	
                    chrome.downloads.download({
                        url: url.href,
                        filename: finalPath,
                        conflictAction: 'uniquify'
                    }, (downloadId) => {
                        if (downloadId) {
			                console.log('[Mass image downloader]: 💾 Download success.');
                            successfulDownloads++;
                            updateBadge(successfulDownloads + totalProcessed); // ✅ Cumulative badge (green)
			                console.log(`[Mass image downloader]: 🆗 Downloaded images: ${successfulDownloads}`);
                            closeTabSafely(tab.id);
                        } else {
                            console.log(`[Mass image downloader]: ❌ Failed to download: ${url.href}`);
                        }
        
                        console.log(`[Mass image downloader]: 🛠️ END: Tab id ${tab.id}`);
                        console.log('[Mass image downloader]: ------------------------------------');
                        console.log('[Mass image downloader]:');                        
                        onCompleteDownload();		    
                    });
                })
                .catch(err => {
                    console.log(`[Mass image downloader]: ❌ Error validating image: ${err.message}`);
                    console.log(`[Mass image downloader]: 🐛 Stacktrace: ${err.stack}`);
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
            onCompleteDownload();
        }
    }

    function onCompleteDownload() {
        activeDownloads--;
        completedTabs++;

        if (completedTabs === totalTabs && activeDownloads === 0) {
            console.log('[Mass image downloader]: ✅ All image tabs processed in batch');
            console.log('[Mass image downloader]: 📥 END: Batch download completed');
            console.log('[Mass image downloader]: ------------------------------------');
            onComplete(successfulDownloads); // ✅ Return number of downloads to main loop
        } else {
            processQueue();
        }
    }

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

    // ✅ Pointer for managing current tab index in download queue
    let queueIndex = 0;
    processQueue();
}


/**
 * 🌄 Handle gallery images extraction
 */
async function handleOpenGalleryImages(message, sendResponse) {
    console.log('[Mass image downloader]: --------------------------------------------------');
    console.log('[Mass image downloader]: 🌄 BEGIN: Extract Gallery Images Functionality');
    console.log('[Mass image downloader]: --------------------------------------------------');

    const { images, totalImages } = message;

    if (!Array.isArray(images) || images.length === 0 || !totalImages) {
        console.log('[Mass image downloader]: ⚠️ No images provided for extraction.');
        console.log('[Mass image downloader]: --------------------------------------------------');
        console.log('[Mass image downloader]:');
        respondSafe(sendResponse, { success: false, error: 'No images to extract' });
        return;
    }

    updateBadge(0);
    let imagesProcessed = 0;
    const delay = 1000 / galleryMaxImages;

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

    await Promise.all(images.map(async (imageUrl, index) => {
        await new Promise(resolve => setTimeout(resolve, index * delay));
        
        try {
            console.log('[Mass image downloader]: --------------------------------------------------');
            console.log(`[Mass image downloader]: 🔍 BEGIN: Processing gallery image index ${index}`);
            console.log(`[Mass image downloader]: 📷 Is a direct image URL?: ${imageUrl}`);

            // ✅ validate URL before processing
            if (!isDirectImageUrl(imageUrl)) {
                console.log('[Mass image downloader]: ⛔ Skipped (not valid image).');
                console.log('[Mass image downloader]: --------------------------------------------------');
                console.log('[Mass image downloader]:');
                onGalleryProgress();
                return;
            }

            const isAllowed = await isAllowedImageFormat(imageUrl);
            if (!isAllowed) {
                console.log('[Mass image downloader]: ⛔ Disallowed image format (skipped).');
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

            const finalName = await generateFilename(fileName, extension);
            const finalPath = (downloadFolder === 'custom' && customFolderPath)
                ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                : finalName;

            if (extractGalleryMode === 'immediate') {
                await new Promise(resolve => {
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
                        resolve();
                    });
                });
            } else {
                await new Promise(resolve => {
                    chrome.tabs.create({ url: imageUrl, active: false }, () => {
                        console.log(`[Mass image downloader]: 🔗 Opened in new tab: ${imageUrl}`);
                        console.log(`[Mass image downloader]: 🔚 END: Image index ${index}`);
                        console.log('[Mass image downloader]: --------------------------------------------------');
                        console.log('[Mass image downloader]:');
                        onGalleryProgress();
                        resolve();
                    });
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
    }));

    respondSafe(sendResponse, { success: true });
}

/**
 * 🖼️ Handle gallery finder functionality
 */
async function handleStartGalleryFinder(message, sendResponse) {
    console.log('[Mass image downloader]: ----------------------------------------');
    console.log('[Mass image downloader]: 🖼️ Gallery Finder Functionality');
    console.log('[Mass image downloader]: ----------------------------------------');
    console.log('[Mass image downloader]: 🔍 Scanning and grouping images...');

    if (!Array.isArray(message.images)) {
        console.log('[Mass image downloader]: ⚠️ No image array received.');
        respondSafe(sendResponse, { success: false, error: 'Invalid image list' });
        return;
    }

    try {
        const potential = [];
        const validationPromises = message.images.map(async (img, index) => {
            try {
                console.log(`[Mass image downloader]: 🕵 Checking URL: ${img.src}`);
                if (!isDirectImageUrl(img.src)) {
                    console.log('[Mass image downloader]: ⛔ Invalid image skipped.');
                    return;
                }
                
                const allowed = await isAllowedImageFormat(img.url);

                if (validUrl && allowed && img.width >= minWidth && img.height >= minHeight) {
                    potential.push(img);
                    logDebug('[Mass image downloader]: ✅ Passed');
                } else {
                    logDebug('[Mass image downloader]: ⛔ Rejected (invalid or size)');
                }
            } catch (e) {
                console.log(`[Mass image downloader]: ❌ Error validating image: ${e.message}`);
            }
        });

        await Promise.all(validationPromises);

        if (potential.length === 0) {
            console.log('[Mass image downloader]: ⚠️ No valid gallery candidates found.');
            respondSafe(sendResponse, { success: false, error: 'No valid gallery images' });
            return;
        }

        const galleryImages = [];
        const visited = new Set();

        for (let i = 0; i < potential.length; i++) {
            if (visited.has(i)) continue;
            const base = potential[i];

            for (let j = i + 1; j < potential.length; j++) {
                if (visited.has(j)) continue;

                const similarity = calculatePathSimilarity(base.url, potential[j].url);

                if (similarity >= pathSimilarityLevel) {
                    // 🔄 Always select the image with higher resolution between the matched pair
                    const selected = isHigherResolution(potential[j], base) ? potential[j] : base;
                
                    galleryImages.push(selected);
                    visited.add(i);
                    visited.add(j);
                
                    console.log(`[Mass image downloader]: 🧩 Grouped images [${i}, ${j}] → Similarity: ${similarity}%`);
                    break;
                }
            }
        }

	if (galleryImages.length === 0) {
	    console.log('[Mass image downloader]: ⚠️ No gallery images matched similarity criteria.');
	    respondSafe(sendResponse, { success: false, error: 'No grouped gallery images' });
	    return;
	}

	// 🧩 Optional: log grouped gallery result
	if (galleryImages.length > 0) {
	    console.log(`[Mass image downloader]: 🎯 Gallery grouping result: ${galleryImages.length} image(s) selected.`);
	}

        updateBadge(0);

        await processGalleryImages(galleryImages);
        respondSafe(sendResponse, { success: true, count: galleryImages.length });
    } catch (error) {
        console.log(`[Mass image downloader]: ❌ Error in gallery finder: ${error.message}`);
        respondSafe(sendResponse, { success: false, error: error.message });
    }
}

/**
 * 🚀 Process grouped gallery images
 */
async function processGalleryImages(galleryImages) {
    await Promise.all(galleryImages.map(async (img, index) => {
        await new Promise(resolve => setTimeout(resolve, index * 300));
        
        try {
            const url = img.url;
            const file = url.split('/').pop() || 'image';
            const ext = file.includes('.') ? file.slice(file.lastIndexOf('.')) : '';
            const name = file.replace(ext, '');
            const finalName = await generateFilename(name, ext);
            const targetPath = (downloadFolder === 'custom' && customFolderPath)
                ? `${customFolderPath.replace(/\\/g, '/')}/${finalName}`
                : finalName;

            if (extractGalleryMode === 'immediate') {
                console.log(`[Mass image downloader]: 🕑 Downloading: ${finalName}`);
                await new Promise(resolve => {
                    chrome.downloads.download({ url, filename: targetPath }, (downloadId) => {
                        if (downloadId) {
                            console.log(`[Mass image downloader]: 💾 Downloaded: ${finalName}`);
                        } else {
                            console.log(`[Mass image downloader]: ❌ Failed: ${finalName}`);
                        }
                        updateBadge(index + 1);
                        resolve();
                    });
                });
            } else {
                console.log(`[Mass image downloader]: 🔗 Opening in new tab: ${url}`);
                await new Promise(resolve => {
                    chrome.tabs.create({ url, active: false }, () => {
                        updateBadge(index + 1);
                        resolve();
                    });
                });
            }

            if (index === galleryImages.length - 1) {
                updateBadge(galleryImages.length, true);
                console.log('[Mass image downloader]: 🏁 All gallery images processed.');
            }
        } catch (err) {
            console.log(`[Mass image downloader]: ❌ Error processing image index ${index}: ${err.message}`);
            console.log(`[Mass image downloader]: 🐛 Stacktrace: ${err.stack}`);
        }
    }));
}