// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// popup.js

let debugLogLevelCache = 1;

chrome.storage.sync.get(["debugLogLevel"], (data) => {
    debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
});

logDebug(1, '[Mass image downloader]: ⚡ Popup script loaded.');

/**
 * Logs debug messages based on user-defined log level.
 *  @param {number|string} levelOrMessage - Log level (0-3) or message string. 
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
 * Displays a styled feedback message to the user if enabled in settings.
 * - 5 seconds for success/progress messages.
 * - 10 seconds for error messages.
 * - Only visible if "showUserFeedbackMessages" setting is enabled.
 * @param {string} text - The message text to display.
 * @param {string} type - Type of message ("info", "success", "error").
 * @returns {void}
 * @description This function creates a styled message element and appends it to the document body.
 */
function showUserMessage(text, type = "info") {
    try {
        if (!configCache.showUserFeedbackMessages) {
            logDebug(2, `🚫 User feedback messages disabled. Skipping display.`);
            return;
        }

        const duration = (type === "error") ? 10000 : 5000;
        const backgroundColor = (type === "error") ? "#d9534f" : "#007EE3";

        const messageElement = document.createElement("div");
        messageElement.textContent = "Mass image downloader: " + text;
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

        setTimeout(() => {
            messageElement.style.opacity = "0";
            setTimeout(() => {
                try {
                    messageElement.remove();
                } catch (removeError) {
                    logDebug(1, `⚠️ Error removing message element: ${removeError.message}`);
                }
            }, 500);
        }, duration);

    } catch (error) {
        logDebug(1, `❌ Error displaying user message: ${error.message}`);
        logDebug(3, `❌ Stacktrace: ${error.stack}`);
    }
}

/** 
 * @description This script handles the popup functionality of the Mass Image Downloader extension.
 * It initializes event listeners for buttons and links in the popup, including the start download button,
 * extract gallery button, and settings link.
 * It also retrieves the extension version from the manifest and injects scripts into the active tab.
 */
document.addEventListener("DOMContentLoaded", () => {
    const bulkDownloadButton = document.getElementById("bulk-download");
    const extractLinkedGalleryButton = document.getElementById("extract-linked-gallery");
    const extractVisualGalleryButton = document.getElementById("extract-visual-gallery");
    const settingsLink = document.getElementById("settings");
    const versionElement = document.getElementById("extension-version");
    const extractWebLinkedGalleryButton = document.getElementById("extract-web-linked-gallery");

    // ✅ Load extension version from manifest.json
    if (chrome.runtime.getManifest && versionElement) {
        versionElement.textContent = chrome.runtime.getManifest().version;
        logDebug(`🟢 Loaded extension version: ${versionElement.textContent}`);
    } else {
        logDebug("🔴 Could not load extension version.");
    }

    // ✅ Bulk Image Download
    if (bulkDownloadButton) {
        bulkDownloadButton.addEventListener("click", () => {
            logDebug("📸 Extract images directly in tabs started.");

            chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
                if (activeTabs.length > 0) {
                    chrome.runtime.sendMessage(
                        { action: "bulkDownload", activeTabIndex: activeTabs[0].index },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                logDebug(`🔥 ${chrome.runtime.lastError.message}`);
                            } else if (response?.success) {
                                logDebug("✅ Bulk download initiated.");
                            } else {
                                logDebug("💣 Error initiating bulk download:", response?.error || "Unknown error.");
                            }
                        }
                    );
                } else {
                    logDebug("💣 No active tab found.");
                }
            });
        });
    } else {
        logDebug("🔴 Error - 'bulk-download' button not found.");
    }

    // ✅ Extract Linked Gallery
    if (extractLinkedGalleryButton) {
        extractLinkedGalleryButton.addEventListener("click", () => {
            logDebug("🌄 Extract Linked Gallery started.");

            // ✅ Injects extractLinkedGallery.js script
            // This script will be injected into the active tab to extract images from galleries with direct links.
            chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
                if (activeTabs.length === 0) {
                    logDebug("🔴 No active tab found.");
                    showUserMessage("No active tab found to extract images.", "error");
                    return;
                }

                const tabId = activeTabs[0].id;

                if (chrome.scripting && chrome.scripting.executeScript) {
                    chrome.scripting.executeScript({
                        target: { tabId },
                        files: ["Script/extractLinkedGallery.js"]
                    })
                    .then(() => {
                        logDebug("💉 Extract Linked Gallery script injected.");
                    })
                    .catch((error) => {
                        logDebug("💣 Error injecting Extract Linked Gallery script:", error);
                    });
                } else {
                    logDebug("🔥 chrome.scripting.executeScript is not available.");
                }
            });
        });
    } else {
        logDebug("🔴 Error - 'extract-linked-gallery' button not found.");
    }

    // ✅ Extract Visual Gallery Feature
    if (extractVisualGalleryButton) {
        extractVisualGalleryButton.addEventListener("click", () => {
            logDebug("🔎 Extract Visual Gallery started.");

            // ✅ Injects extractVisualGallery.js script
            // This script will be injected into the active tab to extract images from galleries without direct links.
            chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
                if (activeTabs.length === 0) {
                    logDebug("🔴 No active tab found.");
                    return;
                }

                const tabId = activeTabs[0].id;

                if (chrome.scripting && chrome.scripting.executeScript) {
                    chrome.scripting.executeScript({
                        target: { tabId },
                        files: ["Script/extractVisualGallery.js"]
                    })
                    .then(() => {
                        logDebug("💉 Extract Visual Gallery script injected successfully.");
                    })
                    .catch((error) => {
                        logDebug("💣 Error injecting Extract Visual Gallery script:", error);
                    });
                } else {
                    logDebug("🔥 chrome.scripting.executeScript is not available.");
                }
            });

        });
    } else {
        logDebug("🔴 Error - 'extract-visual-gallery' button not found.");
    }

    // ✅ Extract Web-Linked Gallery Feature
    if (extractWebLinkedGalleryButton) {
        extractWebLinkedGalleryButton.addEventListener("click", () => {
            logDebug(1, "🔗 Extract Web-Linked Gallery started.");

            chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
                if (activeTabs.length === 0) {
                    logDebug(1, "🔴 No active tab found.");
                    return;
                }

                const tabId = activeTabs[0].id;

                if (chrome.scripting && chrome.scripting.executeScript) {
                    chrome.scripting.executeScript({
                        target: { tabId },
                        files: ["Script/extractWebLinkedGallery.js"]
                    })
                    .then(() => {
                        logDebug(1, "💉 Extract Web-Linked Gallery script injected successfully.");
                    })
                    .catch((error) => {
                        logDebug(1, "💣 Error injecting Extract Web-Linked Gallery script:", error);
                    });
                } else {
                    logDebug(1, "🔥 chrome.scripting.executeScript is not available.");
                }
            });
        });
    } else {
        logDebug(1, "🔴 Error - 'extract-web-linked-gallery' button not found.");
    }

    // ✅ Open options page when settings link is clicked
    if (settingsLink) {
        settingsLink.addEventListener("click", () => {
            chrome.runtime.openOptionsPage();
            logDebug("👷 Opening settings page.");
        });
    } else {
        logDebug("🔴 Error - 'settings' link not found.");
    }    // ✅ View Settings (Peek) button
    const peekButton = document.getElementById("btn-peek");
	
	if (peekButton) {
		peekButton.addEventListener("click", () => {
			logDebug("🔍 Opening peek settings overlay from popup.");

			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				if (!tabs.length || !tabs[0].id) {
					logDebug("❌ No active tab found to send peek message.");
					return;
				}

				const activeTab = tabs[0];
                const tabId = activeTab.id;

                // Defensive check on URL scheme
                if (/^(chrome|chrome-extension|edge):\/\//.test(activeTab.url) || activeTab.url === 'about:blank') {
                    logDebug("⚠️ Settings Peek not allowed on restricted page:", activeTab.url);
                    chrome.scripting.executeScript({
                        target: { tabId },
                        func: () => alert("Settings Peek is not available on this page.")
                    });
                    return;
                }

                chrome.scripting.executeScript({
                    target: { tabId },
                    files: ["Script/settingsPeek.js"]
                }).then(() => {
					logDebug("💉 settingsPeek.js injected into active tab.");

					// Small delay to ensure the script is fully injected and ready
					setTimeout(() => {
						chrome.tabs.sendMessage(tabId, { action: "open-peek-overlay" }, (response) => {
							if (chrome.runtime.lastError) {
								logDebug("❌ Failed to send message after injection:", chrome.runtime.lastError.message);
							} else {
								logDebug("📤 Message sent to injected settingsPeek.js content script.");
							}
						});
					}, 100);
				}).catch((err) => {
					logDebug("❌ Failed to inject settingsPeek.js:", err.message);
				});
			});
		});
	} else {
		logDebug("🔴 Error - 'btn-peek' button not found.");
	}

});
