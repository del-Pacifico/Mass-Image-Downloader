// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// options.js - Mass Image Downloader

let debugLogLevelCache = 1;

// Read once on load
chrome.storage.sync.get(["debugLogLevel"], (data) => {
    debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
});

logDebug(1, "⚡ Options script loaded.");

/**
 * Logs debug messages based on user-defined log level.
 * @param {number|string} levelOrMessage - Log level (0-3) or message string. 
 * Where 0: no log. 1: basic, 2: verbose, 3: detailed.
 * @param {...any} args - Additional arguments for message formatting.
 * @returns {void}
 * @description This function checks the user's debug log level and logs messages accordingly.
 * It retrieves the log level from chrome.storage.sync and compares it with the provided level.
 * If the user's level is greater than or equal to the provided level, it logs the message.
 * It also handles legacy or malformed calls by assuming a default log level of 1.     * 
 */
function logDebug(levelOrMessage, ...args) {
    try {
        let level = 1;
        let messageArgs = [];

        if (typeof levelOrMessage === "number" && levelOrMessage >= 1 && levelOrMessage <= 3) {
            level = levelOrMessage;
            messageArgs = args;
        } else {
            // Handle legacy or malformed calls (assume default log level 1)
            level = 1;
            messageArgs = [levelOrMessage, ...args].filter(arg => arg !== undefined);
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
 * Validates if width and height fall within acceptable image size range.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @returns {boolean} - Returns true if the dimensions are valid, false otherwise.
 * @description This function checks if the width and height are numbers and within the range of 1 to 10000.
 * It is important to ensure that we only collect images that are not too small or too large.
 **/
function isValidImageDimension(width, height) {
    return (
        !isNaN(width) && width >= 1 && width <= 10000 &&
        !isNaN(height) && height >= 1 && height <= 10000
    );
}

/**
 * Validates if text is alphanumeric with optional spaces and length >= 4
 * @param {string} text 
 * @returns {boolean}
 * @description Checks if the text is alphanumeric with optional spaces and length >= 4.
 * This is important to ensure that we only collect images that are not too small or too large.
 */
function isValidAlphanumeric(text) {
    return /^[a-zA-Z0-9 ]*$/.test(text) && text.trim().length >= 4;
}

/**
 * 
 * @description This function is called when the DOM is fully loaded.
 * It initializes the UI elements and sets up event listeners for user interactions.
 * It retrieves the current settings from chrome.storage.sync and populates the UI elements with those values.
 * It also handles the saving of settings when the user clicks the save button.
 */
document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const defaultFolderRadio = document.getElementById("defaultFolder");
    const customFolderRadio = document.getElementById("customFolder");
    const folderPathInput = document.getElementById("folderPath");
    const downloadLimitInput = document.getElementById("downloadLimit");
    const filenameModeSelect = document.getElementById("filenameMode");
    const prefixInput = document.getElementById("prefix");
    const suffixInput = document.getElementById("suffix");
    const extractGalleryModeSelect = document.getElementById("extractGalleryMode");
    const saveButton = document.getElementById("saveOptions");
    const closeButton = document.getElementById("closeOptions");
    const extensionVersion = document.getElementById("extension-version");

    const pastePrefixButton = document.getElementById("pastePrefix");
    const clearPrefixButton = document.getElementById("clearPrefix");
    const pasteSuffixButton = document.getElementById("pasteSuffix");
    const clearSuffixButton = document.getElementById("clearSuffix");

    const minWidthInput = document.getElementById("minWidth");
    const minHeightInput = document.getElementById("minHeight");

    const allowJPGCheckbox = document.getElementById("allowJPG");
    const allowJPEGCheckbox = document.getElementById("allowJPEG");
    const allowPNGCheckbox = document.getElementById("allowPNG");
    const allowWEBPCheckbox = document.getElementById("allowWEBP");
    const allowAVIFCheckbox = document.getElementById("allowAVIF");
    const allowBMPCheckbox = document.getElementById("allowBMP");

    const allowExtendedImageUrls = document.getElementById("allowExtendedImageUrls");

    const maxBulkBatchInput = document.getElementById("maxBulkBatch");
    const continueBulkLoopCheckbox = document.getElementById("continueFromLastBulkBatch");
    let galleryMaxImagesInput;
    const showUserFeedbackMessagesCheckbox = document.getElementById("showUserFeedbackMessages");
    const peekTransparencyInput = document.getElementById("peekTransparencyLevel");
    const enableClipboardHotkeysCheckbox = document.getElementById("enableClipboardHotkeys"); 
    const enableOneClickIconCheckbox = document.getElementById("chkEnableOneClickIcon");

    const maxOpenTabsInput = document.getElementById("maxOpenTabs");
    const webLinkedGalleryDelayInput = document.getElementById("webLinkedGalleryDelay");

    // 🕵️ Image Inspector (new)
    const imageInspectorEnabledCheckbox   = document.getElementById("imageInspectorEnabled");
    const imageInspectorDevModeCheckbox   = document.getElementById("imageInspectorDevMode");
    const imageInspectorCloseOnSaveCheckbox = document.getElementById("imageInspectorCloseOnSave");

    let applyingPreset = false;

    galleryMaxImagesInput = document.getElementById("galleryMaxImages");

    // Check if galleryMaxImagesInput is null or undefined
    if (!galleryMaxImagesInput) {
        logDebug(2, "⚠️ Warning: galleryMaxImages input not found in DOM.");
    } else {
        logDebug(2, "📦 galleryMaxImages input captured successfully.");
    }    

    logDebug(3, `📦 Getting UI elements references.`);

    // 🆕 Performance Presets handler
    const presetRadios = document.querySelectorAll('input[name="performancePreset"]');

    // 🔍 Detects if a setting is manually modified after applying a preset
    function markCustomPresetIfNeeded() {
        if (applyingPreset) return; // Don't trigger if user is applying preset via radio

        const customRadio = document.querySelector('input[name="performancePreset"][value="custom"]');
        if (customRadio) {
            customRadio.checked = true;
            logDebug(2, "⚙️ User modified a setting → Marking preset as 'custom'.");
        } else {
            logDebug(2, "⚠️ Unable to mark preset as custom - radio not found.");
        }
    }

    // ⚙️ Performance Preset change handler
    presetRadios.forEach((radio) => {
        
        if (!radio.checked) return;

        const preset = radio.value;
        logDebug(1, `⚙️ Performance preset selected: ${preset}`);

        try {
            applyingPreset = true; // ⬅️ New: activate protection to prevent multiple preset applications

            // Define preset configurations
            const presetConfigs = {
                low: {
                    downloadLimit: 1,
                    maxBulkBatch: 10,
                    continueFromLastBulkBatch: false,
                    filenameMode: "none",
                    prefix: "",
                    suffix: "",
                    allowJPG: true,
                    allowJPEG: true,
                    allowPNG: true,
                    allowWEBP: false,
                    allowAVIF: false,
                    allowBMP: false,
                    minWidth: 600,
                    minHeight: 400,
                    gallerySimilarityLevel: 60,
                    galleryMinGroupSize: 3,
                    galleryEnableSmartGrouping: false,
                    galleryEnableFallback: false,
                    galleryMaxImages: 1,
                    extractGalleryMode: "tab",
                    maxOpenTabs: 2,
                    webLinkedGalleryDelay: 1000
                },
                medium: {
                    downloadLimit: 2,
                    maxBulkBatch: 25,
                    continueFromLastBulkBatch: true,
                    filenameMode: "suffix",
                    prefix: "",
                    suffix: "img",
                    allowJPG: true,
                    allowJPEG: true,
                    allowPNG: true,
                    allowWEBP: true,
                    allowAVIF: true,
                    allowBMP: true,
                    minWidth: 800,
                    minHeight: 600,
                    gallerySimilarityLevel: 70,
                    galleryMinGroupSize: 4,
                    galleryEnableSmartGrouping: true,
                    galleryEnableFallback: true,
                    galleryMaxImages: 3,
                    extractGalleryMode: "tab",
                    maxOpenTabs: 4,
                    webLinkedGalleryDelay: 600
                },
                high: {
                    downloadLimit: 4,
                    maxBulkBatch: 50,
                    continueFromLastBulkBatch: true,
                    filenameMode: "both",
                    prefix: "img",
                    suffix: "hq",
                    allowJPG: true,
                    allowJPEG: true,
                    allowPNG: true,
                    allowWEBP: true,
                    allowAVIF: true,
                    allowBMP: true,
                    minWidth: 1000,
                    minHeight: 800,
                    gallerySimilarityLevel: 85,
                    galleryMinGroupSize: 5,
                    galleryEnableSmartGrouping: true,
                    galleryEnableFallback: true,
                    galleryMaxImages: 5,
                    extractGalleryMode: "immediate",
                    maxOpenTabs: 6,
                    webLinkedGalleryDelay: 300
                }
            };

            const config = presetConfigs[preset];

            if (downloadLimitInput) downloadLimitInput.value = config.downloadLimit;
            if (maxBulkBatchInput) maxBulkBatchInput.value = config.maxBulkBatch;
            if (continueBulkLoopCheckbox) continueBulkLoopCheckbox.checked = config.continueFromLastBulkBatch;

            if (filenameModeSelect) filenameModeSelect.value = config.filenameMode;
            if (prefixInput) prefixInput.value = config.prefix;
            if (suffixInput) suffixInput.value = config.suffix;
            if (allowWEBPCheckbox) allowWEBPCheckbox.checked = config.allowWEBP;

            if (minWidthInput) minWidthInput.value = config.minWidth;
            if (minHeightInput) minHeightInput.value = config.minHeight;

            const gallerySimilarityLevelElement = document.getElementById("gallerySimilarityLevel");
            const galleryMinGroupSizeElement = document.getElementById("galleryMinGroupSize");
            const galleryEnableSmartGroupingElement = document.getElementById("galleryEnableSmartGrouping");
            const galleryEnableFallbackElement = document.getElementById("galleryEnableFallback");

            if (gallerySimilarityLevelElement) gallerySimilarityLevelElement.value = config.gallerySimilarityLevel;
            if (galleryMinGroupSizeElement) galleryMinGroupSizeElement.value = config.galleryMinGroupSize;
            if (galleryEnableSmartGroupingElement) galleryEnableSmartGroupingElement.checked = config.galleryEnableSmartGrouping;
            if (galleryEnableFallbackElement) galleryEnableFallbackElement.checked = config.galleryEnableFallback;

            if (galleryMaxImagesInput) galleryMaxImagesInput.value = config.galleryMaxImages;
            if (extractGalleryModeSelect) extractGalleryModeSelect.value = config.extractGalleryMode;

            if (maxOpenTabsInput) maxOpenTabsInput.value = config.maxOpenTabs;
            if (webLinkedGalleryDelayInput) webLinkedGalleryDelayInput.value = config.webLinkedGalleryDelay;

            if (allowJPGCheckbox) allowJPGCheckbox.checked = config.allowJPG;
            if (allowJPEGCheckbox) allowJPEGCheckbox.checked = config.allowJPEG;
            if (allowPNGCheckbox) allowPNGCheckbox.checked = config.allowPNG;
            if (allowAVIFCheckbox) allowAVIFCheckbox.checked = config.allowAVIF;
            if (allowBMPCheckbox) allowBMPCheckbox.checked = config.allowBMP;
            if (allowExtendedImageUrls) { // New
                allowExtendedImageUrls.checked = config.allowExtendedImageUrls ?? false;
            }
            if (enableClipboardHotkeysCheckbox) {
                enableClipboardHotkeysCheckbox.checked = config.enableClipboardHotkeys ?? false;
                logDebug(2, "🔤 Clipboard hotkeys enabled?:", config.enableClipboardHotkeys);
            }
            if (enableOneClickIconCheckbox) {
                enableOneClickIconCheckbox.checked = config.enableOneClickIcon ?? false;
                logDebug(2, "🖱️ One-click icon enabled?:", config.enableOneClickIcon);
            }
            if (peekTransparencyInput) {
                peekTransparencyInput.value = config.peekTransparencyLevel ?? 0.8;
                logDebug(2, "🫥 Loaded peekTransparencyLevel:", peekTransparencyInput.value);
            }
            else {
                logDebug(2, "⚠️ peekTransparencyLevel input not found.");
            }
            logDebug(2, "🪟 Loaded maxOpenTabs:", config.maxOpenTabs);
            logDebug(2, "⏱️ Loaded webLinkedGalleryDelay:", config.webLinkedGalleryDelay);
            
            // 🧩 Inputs that affect performance preset
            const inputsAffectingPreset = [
                downloadLimitInput,
                maxBulkBatchInput,
                continueBulkLoopCheckbox,
                filenameModeSelect,
                prefixInput,
                suffixInput,
                allowJPGCheckbox,
                allowJPEGCheckbox,
                allowPNGCheckbox,
                allowAVIFCheckbox,
                allowBMPCheckbox,
                allowWEBPCheckbox,
                allowExtendedImageUrls,
                minWidthInput,
                minHeightInput,
                document.getElementById("gallerySimilarityLevel"),
                document.getElementById("galleryMinGroupSize"),
                document.getElementById("galleryEnableSmartGrouping"),
                document.getElementById("galleryEnableFallback"),
                galleryMaxImagesInput,
                extractGalleryModeSelect,
                maxOpenTabsInput,
                webLinkedGalleryDelayInput,
                imageInspectorEnabledCheckbox,
                imageInspectorDevModeCheckbox,
                imageInspectorCloseOnSaveCheckbox
            ];

            // 🧠 Bind change listener to inputs
            inputsAffectingPreset.forEach(input => {
                if (input) {
                    input.addEventListener("change", markCustomPresetIfNeeded);
                }
            });

            updateFilenameInputs();

            logDebug(2, `⚙️ Preset '${preset}' applied:`, config);
        } catch (err) {
            logDebug(1, `❌ Failed to apply preset '${preset}':`, err.message);
            logDebug(3, err.stack);
            showError(`Failed to apply preset '${preset}'.`);
        } finally {
            applyingPreset = false; // ⬅️ New: reset protection after applying preset
        }
    });

    // ✅ Extension version display
    extensionVersion.textContent = chrome.runtime.getManifest().version;


    // 🔁 Enable/Disable folder path input
    defaultFolderRadio.addEventListener("change", () => {
        folderPathInput.disabled = true;
        folderPathInput.value = "";
    });

    // 📁 Custom folder selected
    customFolderRadio.addEventListener("change", () => {
        folderPathInput.disabled = false;
    });

    // 🎛️ Update prefix/suffix UI based on filename mode
    filenameModeSelect.addEventListener("change", updateFilenameInputs);

    // 📋 Prefix/Suffix clipboard and clear handlers
    pastePrefixButton.addEventListener("click", () => pasteFromClipboard(prefixInput, "Prefix"));
    clearPrefixButton.addEventListener("click", () => clearInput(prefixInput, "Prefix"));
    pasteSuffixButton.addEventListener("click", () => pasteFromClipboard(suffixInput, "Suffix"));
    clearSuffixButton.addEventListener("click", () => clearInput(suffixInput, "Suffix"));

    /**
     * Loads settings from chrome.storage.sync
     * @description This function retrieves the current settings from chrome.storage.sync and populates the UI elements with those values.
     * It also handles error messages and success notifications.
     * @returns {void}
     */
    try {
        chrome.storage.sync.get([
            "downloadFolder", "customFolderPath", "downloadLimit", "debugLogLevel",
            "filenameMode", "prefix", "suffix", "extractGalleryMode",
            "minWidth", "minHeight", "galleryMaxImages",
            "maxBulkBatch", "continueFromLastBulkBatch",
            "allowJPG", "allowJPEG", "allowPNG", "allowWEBP", "allowAVIF", "allowBMP", 
            "allowExtendedImageUrls",
            "gallerySimilarityLevel", "galleryMinGroupSize",
            "galleryEnableSmartGrouping", "galleryEnableFallback",
            "showUserFeedbackMessages", "enableClipboardHotkeys",
            "maxOpenTabs", "webLinkedGalleryDelay", "peekTransparencyLevel",
            "enableOneClickIcon", "performancePreset",
            "imageInspectorEnabled", "imageInspectorDevMode", "imageInspectorCloseOnSave"
        ], (data) => {
            logDebug(1, "🔍 Settings loaded from storage.");

        // 🆕 Restore Performance Preset
        const savedPreset = data.performancePreset ?? "medium";
        const presetRadioToCheck = document.querySelector(`input[name="performancePreset"][value="${savedPreset}"]`);
        
        // Check if the radio exists before setting it
        if (presetRadioToCheck) {
            presetRadioToCheck.checked = true;
            logDebug(2, `⚙️ Restored performancePreset: ${savedPreset}`);
        } else {
            logDebug(2, "⚠️ No matching performancePreset radio found. Defaulting to medium.");
            const fallbackRadio = document.querySelector('input[name="performancePreset"][value="medium"]');
            if (fallbackRadio) fallbackRadio.checked = true;
        }

        // ⚠️ If preset is 'custom', skip auto-application of fixed preset
        if (savedPreset !== "custom") {
            logDebug(2, `⚙️ Applying preset configuration for: ${savedPreset}`);
            const applyRadio = document.querySelector(`input[name="performancePreset"][value="${savedPreset}"]`);
            if (applyRadio) applyRadio.dispatchEvent(new Event("change"));
        } else {
            logDebug(2, "⚙️ Custom preset detected, skipping auto-apply.");
        }
    
            if (chrome.runtime.lastError) {
                logDebug(1, "❌ Error loading settings:", chrome.runtime.lastError);
                showError("Failed to load extension settings.");
                return;
            }
    
            try {
                // 📁 File System Settings
                if (data.downloadFolder === "custom" && data.customFolderPath) {
                    customFolderRadio.checked = true;
                    folderPathInput.value = data.customFolderPath;
                    folderPathInput.disabled = false;
                } else {
                    defaultFolderRadio.checked = true;
                    folderPathInput.disabled = true;
                }
    
                // ⬇️ Download Limit
                if (downloadLimitInput) {
                    downloadLimitInput.value = data.downloadLimit ?? 2;
                }

                // 🐞 Debug Mode
                const debugLogLevelSelector = document.getElementById("debugLogLevel");
                if (debugLogLevelSelector) {
                    debugLogLevelSelector.value = data.debugLogLevel?.toString() ?? "0";
                    logDebug(2, "🪵 Console log level loaded:", debugLogLevelSelector.value);
                } else {
                    logDebug(2, "⚠️ Console log level selector not found.");
                }
    
                // 🏷️ Filename Settings
                if (filenameModeSelect) {
                    filenameModeSelect.value = data.filenameMode ?? "none";
                }
                // prefix
                if (prefixInput) {
                    prefixInput.value = data.prefix ?? "";
                }
                // suffix
                if (suffixInput) {
                    suffixInput.value = data.suffix ?? "";
                }

                // 🔤 Clipboard hotkey setting
                if (enableClipboardHotkeysCheckbox) {
                    enableClipboardHotkeysCheckbox.checked = data.enableClipboardHotkeys ?? false;
                    logDebug(2, "🔤 Clipboard hotkeys enabled?:", data.enableClipboardHotkeys);
                } else {
                    logDebug(2, "⚠️ Clipboard hotkey checkbox not found.");
                }   

                // 🖱️ One-click icon setting
                if (enableOneClickIconCheckbox) {
                    enableOneClickIconCheckbox.checked = data.enableOneClickIcon ?? false;
                    logDebug(2, "🖱️ One-click icon enabled?:", data.enableOneClickIcon);
                } else {
                    logDebug(2, "⚠️ One-click icon checkbox not found.");
                }

                updateFilenameInputs();
    
                // 🖼 Gallery Settings
                const galleryMaxImagesInput = document.getElementById("galleryMaxImages");
                // gallery Max Images input
                if (galleryMaxImagesInput) {
                    galleryMaxImagesInput.value = data.galleryMaxImages ?? 3;
                } else {
                    logDebug(2, "⚠️ Warning: galleryMaxImages input not found.");
                }
    
                const gallerySimilarityLevelElement = document.getElementById("gallerySimilarityLevel");
                // gallery Similarity Level input
                if (gallerySimilarityLevelElement) {
                    gallerySimilarityLevelElement.value = data.gallerySimilarityLevel ?? 70;
                } else {
                    logDebug(2, "⚠️ Warning: gallerySimilarityLevel input not found.");
                }
    
                const galleryMinGroupSizeElement = document.getElementById("galleryMinGroupSize");
                // gallery Min Group Size input
                if (galleryMinGroupSizeElement) {
                    galleryMinGroupSizeElement.value = data.galleryMinGroupSize ?? 3;
                } else {
                    logDebug(2, "⚠️ Warning: galleryMinGroupSize input not found.");
                }
    
                const galleryEnableSmartGroupingElement = document.getElementById("galleryEnableSmartGrouping");
                // gallery Smart Grouping checkbox  
                if (galleryEnableSmartGroupingElement) {
                    galleryEnableSmartGroupingElement.checked = data.galleryEnableSmartGrouping ?? false;
                } else {
                    logDebug(2, "⚠️ Warning: galleryEnableSmartGrouping checkbox not found.");
                }
    
                const galleryEnableFallbackElement = document.getElementById("galleryEnableFallback");
                // gallery Fallback checkbox
                if (galleryEnableFallbackElement) {
                    galleryEnableFallbackElement.checked = data.galleryEnableFallback ?? false;
                } else {
                    logDebug(2, "⚠️ Warning: galleryEnableFallback checkbox not found.");
                }
                
                // 📸 Download images directly or tabs
                if (extractGalleryModeSelect) {
                    extractGalleryModeSelect.value = data.extractGalleryMode ?? "immediate";
                }
    
                // 📐 Image Size Filters
                if (minWidthInput) {
                    minWidthInput.value = data.minWidth ?? 800;
                }
                if (minHeightInput) {
                    minHeightInput.value = data.minHeight ?? 600;
                }
    
                // 📄 Allowed Formats
                if (allowJPGCheckbox) {
                    allowJPGCheckbox.checked = data.allowJPG !== false;
                }
                if (allowJPEGCheckbox) {
                    allowJPEGCheckbox.checked = data.allowJPEG !== false;
                }
                if (allowPNGCheckbox) {
                    allowPNGCheckbox.checked = data.allowPNG !== false;
                }
                if (allowWEBPCheckbox) {
                    allowWEBPCheckbox.checked = data.allowWEBP !== false;
                }
                if (allowAVIFCheckbox) {
                    allowAVIFCheckbox.checked = data.allowAVIF !== false;
                }
                if (allowBMPCheckbox) {
                    allowBMPCheckbox.checked = data.allowBMP !== false;
                }

                // 🆕 Extended Image URLs setting
                if (allowExtendedImageUrls) { // New
                    allowExtendedImageUrls.checked = data.allowExtendedImageUrls ?? false;
                }   
    
                // 📸 Download images directly in tabs
                if (maxBulkBatchInput) {
                    maxBulkBatchInput.value = data.maxBulkBatch ?? 10;
                }
                if (continueBulkLoopCheckbox) {
                    continueBulkLoopCheckbox.checked = data.continueFromLastBulkBatch ?? false;
                }
                
                // 📢 Notifications
                if (showUserFeedbackMessagesCheckbox) {
                    showUserFeedbackMessagesCheckbox.checked = data.showUserFeedbackMessages ?? true; // Default: enabled
                }

                // 🔍 Peek Transparency Setting
                if (peekTransparencyInput) {
                    peekTransparencyInput.value = data.peekTransparencyLevel ?? 0.8;
                    logDebug(2, "🫥 Loaded peekTransparencyLevel:", peekTransparencyInput.value);
                } else {
                    logDebug(2, "⚠️ peekTransparencyLevel input not found.");
                }

                // 📂 Max Open Tabs
                if (maxOpenTabsInput) {
                    maxOpenTabsInput.value = data.maxOpenTabs ?? 5;
                    logDebug(2, "🪟 Loaded maxOpenTabs:", maxOpenTabsInput.value);
                } else {
                    logDebug(2, "⚠️ maxOpenTabs input not found.");
                }

                // ⏱️ Web Linked Gallery Delay
                if (webLinkedGalleryDelayInput) {
                    webLinkedGalleryDelayInput.value = data.webLinkedGalleryDelay ?? 500;
                    logDebug(2, "⏱️ Loaded webLinkedGalleryDelay:", webLinkedGalleryDelayInput.value);
                } else {
                    logDebug(2, "⚠️ webLinkedGalleryDelay input not found.");
                }

                // 🕵️ Image Inspector — defaults false
                if (imageInspectorEnabledCheckbox) {
                    imageInspectorEnabledCheckbox.checked = data.imageInspectorEnabled ?? false;
                    logDebug(2, "🕵️ imageInspectorEnabled loaded:", imageInspectorEnabledCheckbox.checked);
                }
                if (imageInspectorDevModeCheckbox) {
                    imageInspectorDevModeCheckbox.checked = data.imageInspectorDevMode ?? false;
                    logDebug(2, "🕵️ imageInspectorDevMode loaded:", imageInspectorDevModeCheckbox.checked);
                }
                if (imageInspectorCloseOnSaveCheckbox) {
                    imageInspectorCloseOnSaveCheckbox.checked = data.imageInspectorCloseOnSave ?? false;
                    logDebug(2, "🕵️ imageInspectorCloseOnSave loaded:", imageInspectorCloseOnSaveCheckbox.checked);
                }                
    
            } catch (uiError) {
                logDebug(1, "❌ Error applying settings to UI:", uiError.message);
                logDebug(3, "😫 Stack trace:", uiError.stack);
                showError("Error applying settings to interface.");
            }
        });
    } catch (err) {
        logDebug(1, "❌ Unexpected error during settings load:", err.message);
        logDebug(3, "😫 Stack trace:", err.stack);
        showError("Unexpected critical error occurred while loading settings.");
    }

    /**
     * Updates the prefix/suffix input state based on filename mode
     */
    function updateFilenameInputs() {
        const mode = filenameModeSelect.value;
        logDebug(2, `✍🏻 Applying input state for filename mode: ${mode}`);

        if (mode === "prefix") {
            prefixInput.disabled = false;
            suffixInput.value = "";
            suffixInput.disabled = true;
        } else if (mode === "suffix") {
            suffixInput.disabled = false;
            prefixInput.value = "";
            prefixInput.disabled = true;
        } else if (mode === "both") {
            prefixInput.disabled = false;
            suffixInput.disabled = false;
        } else if (mode === "timestamp") {
            prefixInput.value = "";
            suffixInput.value = "";
            prefixInput.disabled = true;
            suffixInput.disabled = true;
        } else {
            prefixInput.value = "";
            suffixInput.value = "";
            prefixInput.disabled = true;
            suffixInput.disabled = true;
        }
    }

    /**
     * Paste clipboard text into an input field
     * @param {HTMLInputElement} inputElement - The input element to paste text into.
     * @param {string} label - The label for the input element.
     * @description This function pastes text from the clipboard into the specified input element.
     * It checks if the input element is disabled before pasting.
     */
    async function pasteFromClipboard(inputElement, label) {
        if (inputElement.disabled) return;
        try {
            const text = await navigator.clipboard.readText();
            inputElement.value = text;
            logDebug(2, `📋 ${label} pasted from clipboard.`);
        } catch (err) {
            logDebug(1, `❌ Error pasting from clipboard - ${err}`);
        }
    }

    /** 
     * Clear text from input element
     * @param {HTMLInputElement} inputElement - The input element to clear.
     * @param {string} label - The label for the input element.
     * @description This function clears the text from the specified input element.
     * It checks if the input element is disabled before clearing.
     */
    function clearInput(inputElement, label) {
        if (inputElement.disabled) return;
        inputElement.value = "";
        logDebug(2, `🧹 ${label} cleared.`);
    }

    /**
     * 💾 Save button click - validate and store options
     * 
     * @description This function is called when the user clicks the save button.
     * It validates the input values and saves them to chrome.storage.sync.
     * It also handles error messages and success notifications.
     */
    saveButton.addEventListener("click", () => {
        try {
            logDebug(2, "💾 Attempting to save settings...");
    
            // 📂 Download Folder Selection
            const downloadFolder = defaultFolderRadio.checked ? "default" : "custom";
            const customFolderPath = customFolderRadio.checked && folderPathInput ? folderPathInput.value : "";
    
            // 📥 Download Limit
            const downloadLimit = downloadLimitInput ? (parseInt(downloadLimitInput.value, 10) || 1) : 1;
    
            // 🐞 Debug Mode
            const debugLogLevelSelector = document.getElementById("debugLogLevel");
            const debugLogLevel = debugLogLevelSelector ? parseInt(debugLogLevelSelector.value, 10) : 0;
    
            // 🏷️ Filename Settings
            const filenameMode = filenameModeSelect ? filenameModeSelect.value : "none";
            const prefix = prefixInput ? prefixInput.value.trim() : "";
            const suffix = suffixInput ? suffixInput.value.trim() : "";
    
            // Validate Prefix/Suffix
            if (filenameMode === "both") {
                if (!isValidAlphanumeric(prefix) || prefix.length > 30 || !isValidAlphanumeric(suffix) || suffix.length > 15) {
                    logDebug(1, "❌ Prefix/Suffix must meet character and length restrictions!");
                    showError("Prefix/Suffix must meet character and length restrictions.");
                    return;
                }
            }
    
            // 🖼 Gallery Settings
            const galleryMaxImagesInput = document.getElementById("galleryMaxImages");
            let galleryMaxImages = 3;
            if (galleryMaxImagesInput) {
                galleryMaxImages = parseInt(galleryMaxImagesInput.value, 10) || 3;
            } else {
                logDebug(2, "⚠️ Warning: galleryMaxImages input not found during save. Using fallback value 3.");
            }
    
            const gallerySimilarityLevelElement = document.getElementById("gallerySimilarityLevel");
            let gallerySimilarityLevel = 70;
            if (gallerySimilarityLevelElement) {
                gallerySimilarityLevel = parseInt(gallerySimilarityLevelElement.value, 10) || 70;
            } else {
                logDebug(2, "⚠️ Warning: gallerySimilarityLevel input not found during save. Using fallback value 70.");
            }
    
            const galleryMinGroupSizeElement = document.getElementById("galleryMinGroupSize");
            let galleryMinGroupSize = 3;
            if (galleryMinGroupSizeElement) {
                galleryMinGroupSize = parseInt(galleryMinGroupSizeElement.value, 10) || 3;
            } else {
                logDebug(2, "⚠️ Warning: galleryMinGroupSize input not found during save. Using fallback value 3.");
            }
    
            const galleryEnableSmartGroupingElement = document.getElementById("galleryEnableSmartGrouping");
            const galleryEnableSmartGrouping = galleryEnableSmartGroupingElement ? galleryEnableSmartGroupingElement.checked : false;
    
            const galleryEnableFallbackElement = document.getElementById("galleryEnableFallback");
            const galleryEnableFallback = galleryEnableFallbackElement ? galleryEnableFallbackElement.checked : false;
    
            // 📐 Image Size Filters
            const minWidth = minWidthInput ? (parseInt(minWidthInput.value, 10) || 800) : 800;
            const minHeight = minHeightInput ? (parseInt(minHeightInput.value, 10) || 600) : 600;
    
            // 📄 Allowed Formats
            const allowJPGCheckbox = document.getElementById("allowJPG");
            const allowJPEGCheckbox = document.getElementById("allowJPEG");
            const allowPNGCheckbox = document.getElementById("allowPNG");
            const allowWEBPCheckbox = document.getElementById("allowWEBP");
            const allowAVIFCheckbox = document.getElementById("allowAVIF");
            const allowBMPCheckbox = document.getElementById("allowBMP");
            const allowExtendedImageUrls = document.getElementById("allowExtendedImageUrls"); // New
    
            const allowJPG = allowJPGCheckbox ? allowJPGCheckbox.checked : false;
            const allowJPEG = allowJPEGCheckbox ? allowJPEGCheckbox.checked : false;
            const allowPNG = allowPNGCheckbox ? allowPNGCheckbox.checked : false;
            const allowWEBP = allowWEBPCheckbox ? allowWEBPCheckbox.checked : false;
            const allowAVIF = allowAVIFCheckbox ? allowAVIFCheckbox.checked : false;
            const allowBMP = allowBMPCheckbox ? allowBMPCheckbox.checked : false;
            const allowExtendedImageUrlsChecked = allowExtendedImageUrls ? allowExtendedImageUrls.checked : false; // New   
                
            // 📸 Download images directly in tabs
            const maxBulkBatch = maxBulkBatchInput ? (parseInt(maxBulkBatchInput.value, 10) || 10) : 10;
            const continueFromLastBulkBatch = continueBulkLoopCheckbox ? continueBulkLoopCheckbox.checked : false;

            // 📢 Global Settings: Notifications
            const showUserFeedbackMessages = showUserFeedbackMessagesCheckbox ? showUserFeedbackMessagesCheckbox.checked : true;

            // 🫥 Peek Transparency
            let peekTransparencyLevel = 0.8;
            if (peekTransparencyInput) {
                peekTransparencyLevel = Math.max(0.2, Math.min(1.0, parseFloat(peekTransparencyInput.value)));
                if (isNaN(peekTransparencyLevel)) peekTransparencyLevel = 0.8;
            } else {
                logDebug(2, "⚠️ peekTransparencyLevel input not found during save. Using fallback 0.8");
            }
            
            // 🆕 Get selected preset (low, medium, high)
            const selectedPresetRadio = document.querySelector('input[name="performancePreset"]:checked');
            const performancePreset = selectedPresetRadio ? selectedPresetRadio.value : "custom";
    
            // Save Settings
            chrome.storage.sync.set({
                downloadFolder,
                customFolderPath,
                downloadLimit,
                debugLogLevel,
                filenameMode,
                prefix,
                suffix,
                galleryMaxImages,
                gallerySimilarityLevel,
                galleryMinGroupSize,
                galleryEnableSmartGrouping,
                galleryEnableFallback,
                extractGalleryMode: extractGalleryModeSelect ? extractGalleryModeSelect.value : "immediate",
                minWidth,
                minHeight,
                allowJPG,
                allowJPEG,
                allowPNG,
                allowWEBP,
                allowAVIF,
                allowBMP,
                allowExtendedImageUrls: allowExtendedImageUrlsChecked, // New
                maxBulkBatch,
                continueFromLastBulkBatch,
                showUserFeedbackMessages,
                enableClipboardHotkeys: enableClipboardHotkeysCheckbox ? enableClipboardHotkeysCheckbox.checked : false,
                enableOneClickIcon: enableOneClickIconCheckbox ? enableOneClickIconCheckbox.checked : false,
                maxOpenTabs: maxOpenTabsInput ? Math.min(10, Math.max(1, parseInt(maxOpenTabsInput.value))) : 5,
                webLinkedGalleryDelay: webLinkedGalleryDelayInput ? Math.min(3000, Math.max(100, parseInt(webLinkedGalleryDelayInput.value))) : 500,
                peekTransparencyLevel, performancePreset,
                imageInspectorEnabled: imageInspectorEnabledCheckbox ? imageInspectorEnabledCheckbox.checked : false,
                imageInspectorDevMode: imageInspectorDevModeCheckbox ? imageInspectorDevModeCheckbox.checked : false,
                imageInspectorCloseOnSave: imageInspectorCloseOnSaveCheckbox ? imageInspectorCloseOnSaveCheckbox.checked : false,

            }, () => {
                if (chrome.runtime.lastError) {
                    logDebug(1, "❌ Error saving settings:", chrome.runtime.lastError);
                    showError("❌ Failed to save settings.");
                } else {
                    logDebug(1, "✅ Settings saved successfully.");
                    showSuccess("✅ Settings saved successfully!");
                }
            });
    
        } catch (saveError) {
            logDebug(1, "❌ Critical error while saving settings:", saveError.message);
            logDebug(3, "😫 Stack trace:", saveError.stack);
            showError("Critical error while saving settings.");
        }
    });

    /**
     * Show success message popup
     */
    function showSuccess(text) {
        showMessage(text, "info");
    }

    /**
     * Show error message popup
     */
    function showError(text) {
        showMessage(text, "error");
    }

    /**
     * Show styled toast message
     * @param {string} text - The message to display.
     * @param {string} type - The type of message (info, error).
     * @description This function creates a styled toast message and appends it to the body.
     * It automatically fades out after a few seconds.
     * @returns {void}
     */
    function showMessage(text, type = 'info') {
        const msg = document.createElement("div");
        const duration = type === 'error' ? 10000 : 5000;
        const backgroundColor = type === 'error' ? '#d9534f' : '#007EE3';

        logDebug(2, `📢 Message to user: ${text}`);
        msg.textContent = text;
        msg.style.position = "fixed";
        msg.style.top = "20px";
        msg.style.right = "20px";
        msg.style.backgroundColor = backgroundColor;
        msg.style.color = "#FFFFFF";
        msg.style.padding = "10px";
        msg.style.borderRadius = "5px";
        msg.style.fontSize = "14px";
        msg.style.boxShadow = "2px 2px 8px rgba(0, 0, 0, 0.2)";
        msg.style.opacity = "1";
        msg.style.transition = "opacity 0.5s ease-in-out";
        document.body.appendChild(msg);

        setTimeout(() => {
            msg.style.opacity = "0";
            setTimeout(() => msg.remove(), 500);
        }, duration);
    }

    // 🔚 Close button handler
    closeButton.addEventListener("click", () => {
        logDebug(1, "🔚 Options window closed by user.");
        window.close();
    });
});