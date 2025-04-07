// options.js - Mass Image Downloader

console.log("[Mass image downloader]: ⚙️ Options script loaded.");

/**
 * Logs debug messages with consistent format if debugging is enabled.
 * @param {string} message - The message to log.
 */
function logDebug(message) {
    const debugLogging = document.getElementById("debugLogging")?.checked;
    if (debugLogging) {
        console.log(`[Mass image downloader ]: ${message}`);
    }
}

/**
 * Validates if width and height fall within acceptable image size range.
 * @param {number} width 
 * @param {number} height 
 * @returns {boolean}
 */
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
 */
function isValidAlphanumeric(text) {
    return /^[a-zA-Z0-9 ]*$/.test(text) && text.trim().length >= 4;
}

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const defaultFolderRadio = document.getElementById("defaultFolder");
    const customFolderRadio = document.getElementById("customFolder");
    const folderPathInput = document.getElementById("folderPath");
    const downloadLimitInput = document.getElementById("downloadLimit");
    const debugLoggingCheckbox = document.getElementById("debugLogging");
    const filenameModeSelect = document.getElementById("filenameMode");
    const prefixInput = document.getElementById("prefix");
    const suffixInput = document.getElementById("suffix");
    const extractGalleryModeSelect = document.getElementById("extractGalleryMode"); // ✅ Corrected ID
    const saveButton = document.getElementById("saveOptions");
    const closeButton = document.getElementById("closeOptions");
    const extensionVersion = document.getElementById("extension-version");

    const pastePrefixButton = document.getElementById("pastePrefix");
    const clearPrefixButton = document.getElementById("clearPrefix");
    const pasteSuffixButton = document.getElementById("pasteSuffix");
    const clearSuffixButton = document.getElementById("clearSuffix");

    const minWidthInput = document.getElementById("minWidth");
    const minHeightInput = document.getElementById("minHeight");
    const pathSimilarityInput = document.getElementById("pathSimilarityLevel");
    const preferHighResCheckbox = document.getElementById("preferHighRes");
    const galleryMaxImagesInput = document.getElementById("galleryMaxImages");

    console.log(`[Mass image downloader]: 📦 Getting UI elements references.`);

    extensionVersion.textContent = chrome.runtime.getManifest().version;

    /**
     * Enable or disable folder path input
     */
    defaultFolderRadio.addEventListener("change", () => {
        folderPathInput.disabled = true;
        folderPathInput.value = "";
    });

    customFolderRadio.addEventListener("change", () => {
        folderPathInput.disabled = false;
    });

    /**
     * Updates UI for filename mode selection
     */
    filenameModeSelect.addEventListener("change", () => {
        try {
            const mode = filenameModeSelect.value;
            console.log(`[Mass image downloader]: ✨ Updating UI for filename mode selection: ${mode}`);
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
        } catch (e) {
            console.log("[Mass image downloader]: ❌ Error updating filename inputs: " + e.message);
        }
    });

    /**
     * Clipboard paste support for prefix/suffix
     */
    async function pasteFromClipboard(inputElement, label) {
        if (inputElement.disabled) return;
        try {
            const text = await navigator.clipboard.readText();
            inputElement.value = text;
            console.log(`[Mass image downloader]: 📋 ${label} pasted from clipboard.`);
        } catch (err) {
            console.log(`[Mass image downloader]: ❌ Error pasting from clipboard - ${err}`);
        }
    }

    /**
     * Clear field values from input
     */
    function clearInput(inputElement, label) {
        if (inputElement.disabled) return;
        inputElement.value = "";
        console.log(`[Mass image downloader]: 🧹 ${label} cleared.`);
    }

    pastePrefixButton.addEventListener("click", () => pasteFromClipboard(prefixInput, "Prefix"));
    clearPrefixButton.addEventListener("click", () => clearInput(prefixInput, "Prefix"));
    pasteSuffixButton.addEventListener("click", () => pasteFromClipboard(suffixInput, "Suffix"));
    clearSuffixButton.addEventListener("click", () => clearInput(suffixInput, "Suffix"));

    /**
     * Load settings from chrome storage
     */
    try {
        chrome.storage.sync.get([
            "downloadFolder", "customFolderPath", "downloadLimit", "debugLogging",
            "filenameMode", "prefix", "suffix", "extractGalleryMode",
            "minWidth", "minHeight", "pathSimilarityLevel", "preferHighRes", "galleryMaxImages"
        ], (data) => {
            console.log("[Mass image downloader]: 🔍 Settings loaded from storage.");

            if (chrome.runtime.lastError) {
                console.error("[Mass image downloader]: ❌ Error loading settings:", chrome.runtime.lastError);
                return;
            }

            if (data.downloadFolder === "custom" && data.customFolderPath) {
                customFolderRadio.checked = true;
                folderPathInput.value = data.customFolderPath;
                folderPathInput.disabled = false;
            } else {
                defaultFolderRadio.checked = true;
                folderPathInput.disabled = true;
            }

            downloadLimitInput.value = data.downloadLimit || 2;
            debugLoggingCheckbox.checked = data.debugLogging || false;
            filenameModeSelect.value = data.filenameMode || "none";
            prefixInput.value = data.prefix || "";
            suffixInput.value = data.suffix || "";
            extractGalleryModeSelect.value = data.extractGalleryMode || "immediate";

            minWidthInput.value = data.minWidth || 800;
            minHeightInput.value = data.minHeight || 600;
            pathSimilarityInput.value = data.pathSimilarityLevel || 80;
            preferHighResCheckbox.checked = data.preferHighRes ?? true;
            galleryMaxImagesInput.value = data.galleryMaxImages || 3;

            // ✅ Fix: Apply field enable/disable states after loading filename mode
            updateFilenameInputs();
        });
    } catch (err) {
        console.error("[Mass image downloader]: ❌ Unexpected error during load:", err);
    }
    
    /**
 * Update the enabled/disabled state of prefix/suffix inputs based on the selected filename mode
 */
function updateFilenameInputs() {
    const mode = filenameModeSelect.value;
    logDebug(`🎛 Applying input state for filename mode: ${mode}`);

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
     * Save button click - validate and store options
     */
    saveButton.addEventListener("click", () => {
        try {
            const selectedFolder = customFolderRadio.checked ? "custom" : "default";
            const folderPath = customFolderRadio.checked ? folderPathInput.value.trim() : "";
            const downloadLimit = parseInt(downloadLimitInput.value, 10);
            const debugLogging = debugLoggingCheckbox.checked;
            const filenameMode = filenameModeSelect.value;
            const prefix = prefixInput.value.trim();
            const suffix = suffixInput.value.trim();
            const extractGalleryMode = extractGalleryModeSelect.value;
            const galleryMaxImages = parseInt(galleryMaxImagesInput.value, 10);

            const minWidth = parseInt(minWidthInput.value, 10);
            const minHeight = parseInt(minHeightInput.value, 10);
            const pathSimilarityLevel = parseInt(pathSimilarityInput.value, 10);
            const preferHighRes = preferHighResCheckbox.checked;

            if (selectedFolder === "custom" && folderPath === "") {
                showError("Custom folder path cannot be empty.");
                return;
            }

            if (isNaN(downloadLimit) || downloadLimit < 1 || downloadLimit > 15) {
                showError("Download limit must be between 1 and 15.");
                return;
            }

            if (isNaN(galleryMaxImages) || galleryMaxImages < 1 || galleryMaxImages > 10) {
                showError("Max images per second must be between 1 and 10.");
                return;
            }

            if (filenameMode === "prefix" && (!isValidAlphanumeric(prefix) || prefix.length > 30)) {
                showError("Prefix must be alphanumeric, allow spaces, and be 4-30 characters.");
                return;
            }

            if (filenameMode === "suffix" && (!isValidAlphanumeric(suffix) || suffix.length > 15)) {
                showError("Suffix must be alphanumeric, allow spaces, and be 4-15 characters.");
                return;
            }

            if (filenameMode === "both" &&
                ((!isValidAlphanumeric(prefix) || prefix.length > 30) ||
                 (!isValidAlphanumeric(suffix) || suffix.length > 15))) {
                showError("Prefix/Suffix must meet character and length restrictions.");
                return;
            }

            if (filenameMode === "timestamp" && (prefix || suffix)) {
                showError("Timestamp mode should not include prefix or suffix.");
                return;
            }

            if (!isValidImageDimension(minWidth, minHeight)) {
                showError("Minimum image dimensions must be between 1 and 10000.");
                return;
            }

            if (isNaN(pathSimilarityLevel) || pathSimilarityLevel < 50 || pathSimilarityLevel > 100) {
                showError("Path similarity must be between 50 and 100.");
                return;
            }

            console.log("[Mass image downloader]: 💾 Saving validated settings to storage...");

            chrome.storage.sync.set({
                downloadFolder: selectedFolder,
                customFolderPath: folderPath,
                downloadLimit,
                debugLogging,
                filenameMode,
                prefix: ["prefix", "both"].includes(filenameMode) ? prefix : "",
                suffix: ["suffix", "both"].includes(filenameMode) ? suffix : "",
                extractGalleryMode,
                minWidth,
                minHeight,
                pathSimilarityLevel,
                preferHighRes,
                galleryMaxImages
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("[Mass image downloader]: ❌ Failed to save settings:", chrome.runtime.lastError);
                    showError("Failed to save settings.");
                    return;
                }

                console.log("[Mass image downloader]: ✅ Settings saved successfully.");
                showSuccess("Settings Saved!");
            });
        } catch (err) {
            console.error("[Mass image downloader]: ❌ Unexpected error during save:", err);
            showError("Unexpected error occurred while saving.");
        }
    });

    /**
     * Show success message popup
     */
    function showSuccess(text) {
        showMessage(text, "#007EE3");
    }

    /**
     * Show error message popup
     */
    function showError(text) {
        showMessage(text, "#FF0000");
    }

    /**
     * Show styled toast message
     */
    function showMessage(text, color) {
        const msg = document.createElement("div");
        console.log(`[Mass image downloader]: 📢 Message to user: ${text}`);
        msg.textContent = text;
        msg.style.position = "fixed";
        msg.style.top = "20px";
        msg.style.right = "20px";
        msg.style.backgroundColor = color;
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
        }, 3000);
    }

    /** Close options window */
    closeButton.addEventListener("click", () => {
        console.log("[Mass image downloader]: 🔚 Options window closed by user.");
        window.close();
    });
});
