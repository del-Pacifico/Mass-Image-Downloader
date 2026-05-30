// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio Palma Hidalgo
// # All rights reserved.

// Image Inspector content script.
// Shows a hover overlay and opens a sidebar panel for inspecting images.

// Runtime state (storage-synced)
let iiEnabledFromOptions = false;
let iiActiveInPage = false;
let iiDevMode = false;
let iiCloseOnSave = false;
let showUserFeedbackMessagesCache = true;

let inspectorPanelRoot = null;
let overlayEl = null;
let overlayTargetImg = null;
let overlayParent = null;

let mouseOverHandler = null;
let keyDownHandler = null;

const OVERLAY_THROTTLE_MS = 100;
let lastOverlayTs = 0;

let parentPointerLeaveHandler = null;
let overlayPointerEnterHandler = null;
let overlayPointerLeaveHandler = null;
let overlayPointerCancelHandler = null;
let parentPointerEnterHandler = null;
let overlayInteractionLocked = false;
let overlayTriggerButton = null;
let overlayPositionRaf = null;
let overlayScrollHandler = null;
let overlayResizeHandler = null;

let overlayRemovalTimer = null;
let debugLogLevelCache = 1;
let currentInspectorImage = null;
let currentInspectorSrc = "";

let toastMinVisibleMsCache = 2000; // Range: 0..10000. Default: 2000.
const INSPECTOR_DEFAULT_MIN_WIDTH = 800;
const INSPECTOR_DEFAULT_MIN_HEIGHT = 600;
let inspectorMinWidthCache = INSPECTOR_DEFAULT_MIN_WIDTH;
let inspectorMinHeightCache = INSPECTOR_DEFAULT_MIN_HEIGHT;
const INSPECTOR_IMAGE_WRAPPER_SELECTOR = "figure, picture, .Image, .Logo";
const INSPECTOR_OVERLAY_BUTTON_MIN_SIZE = 40;
const INSPECTOR_OVERLAY_ANCHOR_PADDING = 8;
const INSPECTOR_OVERLAY_OFFSET = 8;
const INSPECTOR_OVERLAY_HOST_SIZE = INSPECTOR_OVERLAY_BUTTON_MIN_SIZE + INSPECTOR_OVERLAY_ANCHOR_PADDING * 2;

// Config and storage sync
async function initConfig() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get([
        "imageInspectorEnabled",
        "imageInspectorDevMode",
        "imageInspectorCloseOnSave",
        "showUserFeedbackMessages",
        "toastMinVisibleMs",
        "minWidth",
        "minHeight",
		    "debugLogLevel"
      ], (data) => {
        iiEnabledFromOptions = data.imageInspectorEnabled === true;
        iiDevMode = data.imageInspectorDevMode === true;
        iiCloseOnSave = data.imageInspectorCloseOnSave === true;
        
        const level = parseInt(data.debugLogLevel ?? 0);
		    showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;
        const rawToastMinVisibleMs = parseInt(data.toastMinVisibleMs ?? 2000, 10);
        toastMinVisibleMsCache = (!isNaN(rawToastMinVisibleMs) && rawToastMinVisibleMs >= 0 && rawToastMinVisibleMs <= 10000)
          ? rawToastMinVisibleMs
          : 2000;
        const rawMinWidth = parseInt(data.minWidth ?? INSPECTOR_DEFAULT_MIN_WIDTH, 10);
        const rawMinHeight = parseInt(data.minHeight ?? INSPECTOR_DEFAULT_MIN_HEIGHT, 10);
        inspectorMinWidthCache = (!isNaN(rawMinWidth) && rawMinWidth >= 1 && rawMinWidth <= 10000)
          ? rawMinWidth
          : INSPECTOR_DEFAULT_MIN_WIDTH;
        inspectorMinHeightCache = (!isNaN(rawMinHeight) && rawMinHeight >= 1 && rawMinHeight <= 10000)
          ? rawMinHeight
          : INSPECTOR_DEFAULT_MIN_HEIGHT;

        if (!isNaN(level)) debugLogLevelCache = level;

        logDebug(1, "🕵️ Image Inspector settings loaded:", {
          iiEnabledFromOptions,
          iiDevMode,
          iiCloseOnSave,
          showUserFeedbackMessagesCache,
          debugLogLevelCache,
          imageSize: {
            minWidth: inspectorMinWidthCache,
            minHeight: inspectorMinHeightCache
          }
        });
        logDebug(3, "🧪 [II trace] initConfig() image size cache:", {
          minWidth: inspectorMinWidthCache,
          minHeight: inspectorMinHeightCache
        });
        resolve();
      });
    } catch (err) {
      logDebug(1, "❌ initConfig failed:", err?.message || err);
      resolve();
    }
  });
}

/**
 * Logs messages with support for levels and legacy calls.
 * @param {number|string} levelOfLog - Log level (1-3) or message text.
 * @param {...any} args - Additional log arguments.
 * @returns {void}
 */
function logDebug(levelOfLog, ...args) {
    try {
        let level = 1;
        let messageArgs = [];

        if (typeof levelOfLog === "number" && levelOfLog >= 1 && levelOfLog <= 3) {
            level = levelOfLog;
            messageArgs = args;
        } else {
            // Legacy or malformed call.
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

// Initialize config before listeners to avoid race conditions.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;

  // Enable/disable toggle
  if ("imageInspectorEnabled" in changes) {
    iiEnabledFromOptions = changes.imageInspectorEnabled.newValue === true;
    logDebug(1, "🕵️ imageInspectorEnabled →", iiEnabledFromOptions);
    if (!iiEnabledFromOptions && iiActiveInPage) {
      teardownImageInspector("disabled-in-options");
      showUserMsgSafe("Image Inspector disabled in Options.", "info");
    }
  }

  // Developer mode toggle
  if ("imageInspectorDevMode" in changes) {
    iiDevMode = changes.imageInspectorDevMode.newValue === true;
    logDebug(2, "👨🏻‍💻 imageInspectorDevMode →", iiDevMode);
    try { refreshDevBlockIfOpen(); } catch (_) {}
  }

  // Close-on-save toggle
  if ("imageInspectorCloseOnSave" in changes) {
    iiCloseOnSave = changes.imageInspectorCloseOnSave.newValue === true;
    logDebug(2, "🔄 imageInspectorCloseOnSave →", iiCloseOnSave);
  }

  // User feedback toggle
  if ("showUserFeedbackMessages" in changes) {
    showUserFeedbackMessagesCache = changes.showUserFeedbackMessages.newValue !== false;
    logDebug(2, "🔄 showUserFeedbackMessages →", showUserFeedbackMessagesCache);
  }

  // Toast duration setting
  if ("showUserFeedbackMessages" in changes) {
    showUserFeedbackMessagesCache = changes.showUserFeedbackMessages.newValue !== false;
    logDebug(2, "🔄 showUserFeedbackMessages →", showUserFeedbackMessagesCache);
  }

  if ("minWidth" in changes) {
    const oldValue = inspectorMinWidthCache;
    const nextValue = parseInt(changes.minWidth.newValue ?? INSPECTOR_DEFAULT_MIN_WIDTH, 10);
    inspectorMinWidthCache = (!isNaN(nextValue) && nextValue >= 1 && nextValue <= 10000)
      ? nextValue
      : INSPECTOR_DEFAULT_MIN_WIDTH;
    logDebug(2, "📐 minWidth →", oldValue, "=>", inspectorMinWidthCache);
    logDebug(3, "🧪 [II trace] Image size minWidth cache updated:", {
      previous: oldValue,
      current: inspectorMinWidthCache
    });
  }

  if ("minHeight" in changes) {
    const oldValue = inspectorMinHeightCache;
    const nextValue = parseInt(changes.minHeight.newValue ?? INSPECTOR_DEFAULT_MIN_HEIGHT, 10);
    inspectorMinHeightCache = (!isNaN(nextValue) && nextValue >= 1 && nextValue <= 10000)
      ? nextValue
      : INSPECTOR_DEFAULT_MIN_HEIGHT;
    logDebug(2, "📐 minHeight →", oldValue, "=>", inspectorMinHeightCache);
    logDebug(3, "🧪 [II trace] Image size minHeight cache updated:", {
      previous: oldValue,
      current: inspectorMinHeightCache
    });
  }

});

/**
 * Shows a non-blocking toast message.
 * @param {string} text - Message text.
 * @param {string} [type="info"] - Message type.
 * @returns {void}
 */
function showUserMsgSafe(text, type = "info") {
  try {
    if (!showUserFeedbackMessagesCache) return;

    const safeText = (typeof text === "string") ? text.trim() : String(text || "").trim();
    if (!safeText) return;

    const finalText = safeText.startsWith("MID:") ? safeText : `MID: ${safeText}`;

    const baseDuration = (type === "error") ? 10000 : 5000;
    const minVisibleMs = Math.max(0, parseInt(toastMinVisibleMsCache ?? 2000, 10) || 2000);
    const effectiveDuration = Math.max(baseDuration, minVisibleMs);
    const backgroundColor = (type === "error") ? "#d9534f" : "#007EE3";

    const TOAST_ID = "mdi-user-toast";
    const TIMER_KEY = "__mdiUserToastTimer";
    const MINUNTIL_KEY = "__mdiUserToastMinUntil";
    const DEFER_KEY = "__mdiUserToastDeferTimer";
    const PENDING_KEY = "__mdiUserToastPending";

    // Defer replacement during the minimum visible window.
    try {
      const now = Date.now();
      const minUntil = window[MINUNTIL_KEY] || 0;

      if (minVisibleMs > 0 && now < minUntil) {
        window[PENDING_KEY] = { text: finalText, type };

        if (window[DEFER_KEY]) {
          clearTimeout(window[DEFER_KEY]);
          window[DEFER_KEY] = null;
        }

        window[DEFER_KEY] = setTimeout(() => {
          const pending = window[PENDING_KEY];
          window[PENDING_KEY] = null;
          window[DEFER_KEY] = null;

          if (pending && pending.text) {
            showUserMsgSafe(pending.text, pending.type || "info");
          }
        }, Math.max(0, minUntil - now));

        return;
      }
    } catch (_) {}

    // Replace any existing toast.
    try {
      const existing = document.getElementById(TOAST_ID);
      if (existing) existing.remove();

      if (window[TIMER_KEY]) {
        clearTimeout(window[TIMER_KEY]);
        window[TIMER_KEY] = null;
      }
    } catch (_) {}

    // Mark the minimum visible window.
    try { window[MINUNTIL_KEY] = Date.now() + minVisibleMs; } catch (_) {}

    if (!document?.body) return;

    const msg = document.createElement("div");
    msg.id = TOAST_ID;
    msg.textContent = finalText;

    msg.style.position = "fixed";
    msg.style.top = "20px";
    msg.style.right = "20px";
    msg.style.backgroundColor = backgroundColor;
    msg.style.color = "#FFFFFF";
    msg.style.padding = "12px";
    msg.style.borderRadius = "6px";
    msg.style.fontSize = "14px";
    msg.style.boxShadow = "2px 2px 8px rgba(0, 0, 0, 0.3)";
    msg.style.opacity = "1";
    msg.style.transition = "opacity 0.5s ease-in-out";
    msg.style.zIndex = "2147483647";

    document.body.appendChild(msg);

    window[TIMER_KEY] = setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => { try { msg.remove(); } catch (_) {} }, 500);
      window[TIMER_KEY] = null;
    }, effectiveDuration);

  } catch (err) {
    logDebug(1, "❌ Failed to show user message:", err?.message || err);
  }
}

// Tooltip helper with a fixed-position bubble.
function attachTooltip(element, text) {
  try {
    if (!element || !text) return;

    // Keep the accessible label and remove the native title.
    element.setAttribute("aria-label", text);
    element.removeAttribute("title");

    let tooltipEl = null;

    const showTooltip = () => {
      try {
        // Remove any previous tooltip.
        if (tooltipEl && tooltipEl.remove) {
          try { tooltipEl.remove(); } catch (_) {}
          tooltipEl = null;
        }

        const rect = element.getBoundingClientRect();
        const top = Math.max(4, rect.top - 28); // a bit above the icon

        tooltipEl = document.createElement("div");
        tooltipEl.textContent = text;
        tooltipEl.style.position = "fixed";
        tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.transform = "translateX(-50%)";
        tooltipEl.style.backgroundColor = "#121b3e";
        tooltipEl.style.color = "#f4f4f4";
        tooltipEl.style.padding = "4px 8px";
        tooltipEl.style.borderRadius = "4px";
        tooltipEl.style.fontSize = "11px";
        tooltipEl.style.whiteSpace = "nowrap";
        tooltipEl.style.pointerEvents = "none";
        tooltipEl.style.border = "1px solid #4f5984";
        tooltipEl.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.35)";
        tooltipEl.style.zIndex = "2147483647";
        document.body.appendChild(tooltipEl);
      } catch (_) {
        // Best effort only.
      }
    };

    const hideTooltip = () => {
      try {
        if (tooltipEl) tooltipEl.remove();
      } catch (_) {}
      tooltipEl = null;
    };

    element.addEventListener("mouseenter", showTooltip);
    element.addEventListener("mouseleave", hideTooltip);
    element.addEventListener("focus", showTooltip);
    element.addEventListener("blur", hideTooltip);
  } catch (err) {
    logDebug(2, "⚠️ attachTooltip failed:", err?.message || err);
  }
}

// Hotkey handling.
function onKeyDown(evt) {
  try {
    if (!evt || evt.repeat) return;
    const isCtrlOrMeta = Boolean(evt.ctrlKey || evt.metaKey);
    const isShift = Boolean(evt.shiftKey);
    const keyLabel = typeof evt.key === "string" ? evt.key : "";
    const isCtrlShiftM = isCtrlOrMeta && isShift && (keyLabel === "M" || keyLabel === "m");

    if (isCtrlOrMeta && isShift) {
      logDebug(3, "🧪 [II trace] onKeyDown() candidate:", {
        key: keyLabel,
        code: evt.code,
        ctrlKey: evt.ctrlKey,
        metaKey: evt.metaKey,
        shiftKey: evt.shiftKey,
        altKey: evt.altKey,
        repeat: evt.repeat,
        target: evt.target?.tagName || "[unknown]"
      });
    }

    if (!isCtrlShiftM) return;

    logDebug(2, "🧪 [II trace] onKeyDown() matched Ctrl+Shift+M");
    evt.preventDefault();
    evt.stopPropagation();

    // Toggle the inspector.
    toggleInspectorViaHotkey();
  } catch (err) {
    logDebug(1, "❌ onKeyDown error:", err?.message || err);
  }
}

// Attach the keydown listener in capture phase.
function toggleInspectorViaHotkey() {
  logDebug(3, "🧪 [II trace] toggleInspectorViaHotkey() entry:", {
    enabled: iiEnabledFromOptions,
    active: iiActiveInPage
  });

  if (!iiEnabledFromOptions) {
    logDebug(1, "🔔 INFO 🕵️ Image Inspector is disabled in Options.");
    showUserMsgSafe("Image Inspector is disabled in Options.", "info");
    return;
  }
  // Toggle activation.
  if (!iiActiveInPage) {
    logDebug(3, "🧪 [II trace] toggleInspectorViaHotkey() activating inspector");
    activateImageInspector();
    showUserMsgSafe("Image Inspector enabled.", "info");
  } else {
    logDebug(3, "🧪 [II trace] toggleInspectorViaHotkey() tearing down inspector");
    teardownImageInspector("user-toggle-off");
    showUserMsgSafe("Image Inspector disabled.", "info");
  }
}

// Inspector activation and teardown.
function activateImageInspector() {
  // Prevent double activation.
  if (iiActiveInPage) return;
  iiActiveInPage = true;

  document.documentElement.style.cursor = "help";

  mouseOverHandler = (ev) => {
    try {
      if (!iiActiveInPage) return;
      if (inspectorPanelRoot && inspectorPanelRoot.contains(ev.target)) return;
      const img = findValidImgFromEvent(ev);
      if (!img) return;
      const now = Date.now();
      // Throttled.
      if (now - lastOverlayTs < OVERLAY_THROTTLE_MS) return;
      lastOverlayTs = now;
      showOverlayForImage(img);
    } catch (err) {
      logDebug(1, "❌ mouseOverHandler:", err?.message || err);
    }
  };
  document.addEventListener("mouseover", mouseOverHandler, true);

  logDebug(1, "🧩 Image Inspector activated.");
}

// Teardown the inspector.
function teardownImageInspector(reason) {
  if (!iiActiveInPage) return;
  iiActiveInPage = false;

  removeOverlay();
  removeInspectorPanel();
  try { document.removeEventListener("mouseover", mouseOverHandler, true); } catch (_) {}
  document.documentElement.style.cursor = "auto";

  logDebug(1, `🧹 Inspector teardown. Reason: ${reason}`);
}

/**
 * Checks whether an image is eligible for the inspector.
 * @param {HTMLImageElement} node - Candidate image node.
 * @returns {boolean}
 */
function isValidInspectorImageNode(node) {
  try {
    if (!(node instanceof HTMLImageElement)) return false;
    if (!node.isConnected) return false;
    if (inspectorPanelRoot && inspectorPanelRoot.contains(node)) return false;

    const width = Number(node.naturalWidth || 0);
    const height = Number(node.naturalHeight || 0);
    const minWidth = Number(inspectorMinWidthCache || INSPECTOR_DEFAULT_MIN_WIDTH);
    const minHeight = Number(inspectorMinHeightCache || INSPECTOR_DEFAULT_MIN_HEIGHT);
    const hasBitmap = width > 0 && height > 0;
    const accepted = hasBitmap && width >= minWidth && height >= minHeight;
    logDebug(3, "🧪 [II trace] isValidInspectorImageNode() size check:", {
      src: node.currentSrc || node.src || "",
      width,
      height,
      minWidth,
      minHeight,
      hasBitmap,
      accepted
    });
    return accepted;
  } catch (_) {
    return false;
  }
}

/**
 * Checks whether a node belongs to the inspector UI.
 * @param {Node|Element|null} node - Node to inspect.
 * @returns {boolean}
 */
function isInspectorUiNode(node) {
  try {
    if (!(node instanceof Element)) return false;
    if (inspectorPanelRoot && inspectorPanelRoot.contains(node)) return true;
    if (overlayEl && (overlayEl === node || overlayEl.contains(node))) return true;
    return false;
  } catch (_) {
    return false;
  }
}

/**
 * Returns the element stack under the pointer.
 * @param {MouseEvent} ev - Pointer event from the page.
 * @returns {Element[]}
 */
function getInspectorPointerStack(ev) {
  try {
    if (!ev || !Number.isFinite(ev.clientX) || !Number.isFinite(ev.clientY)) return [];
    return Array.from(document.elementsFromPoint(ev.clientX, ev.clientY) || [])
      .filter((node) => node instanceof Element && !isInspectorUiNode(node));
  } catch (_) {
    return [];
  }
}

/**
 * Resolves the nearest allowed wrapper from a pointer stack.
 * @param {Element[]} stack - Elements under the pointer.
 * @returns {Element|null}
 */
function getInspectorWrapperFromStack(stack) {
  try {
    if (!Array.isArray(stack)) return null;
    for (const node of stack) {
      if (!(node instanceof Element)) continue;
      const wrapper = node.matches?.(INSPECTOR_IMAGE_WRAPPER_SELECTOR)
        ? node
        : node.closest?.(INSPECTOR_IMAGE_WRAPPER_SELECTOR);
      if (wrapper && !isInspectorUiNode(wrapper)) return wrapper;
    }
    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Resolves the overlay parent for a target image.
 * @param {HTMLImageElement} img - Target image.
 * @returns {Element|null}
 */
function getInspectorOverlayParent(img) {
  try {
    if (!(img instanceof Element)) return null;
    return img.closest(INSPECTOR_IMAGE_WRAPPER_SELECTOR) || img.parentElement || img;
  } catch (_) {
    return img?.parentElement || img || null;
  }
}

/**
 * Picks the best image candidate inside a wrapper element.
 * @param {Element} container - Candidate wrapper.
 * @returns {HTMLImageElement|null}
 */
function pickBestInspectorImage(container) {
  try {
    if (!(container instanceof Element)) return null;
    if (container instanceof HTMLImageElement) {
      const ok = isValidInspectorImageNode(container);
      return ok ? container : null;
    }

    if (!container.matches?.(INSPECTOR_IMAGE_WRAPPER_SELECTOR)) {
      return null;
    }

    if (!container.querySelectorAll) return null;

    const candidates = Array.from(container.querySelectorAll("img"))
      .filter(isValidInspectorImageNode)
      .sort((a, b) => {
        const aScore = Number(a.naturalWidth || a.width || 0) * Number(a.naturalHeight || a.height || 0);
        const bScore = Number(b.naturalWidth || b.width || 0) * Number(b.naturalHeight || b.height || 0);
        return bScore - aScore;
      });

    const chosen = candidates.length > 0 ? candidates[0] : null;
    return chosen;
  } catch (_) {
    return null;
  }
}

/**
 * Resolves a valid image from the hover target.
 * @param {MouseEvent} ev - Pointer event from the page.
 * @returns {HTMLImageElement|null}
 */
function findValidImgFromEvent(ev) {
  try {
    if (!ev || !ev.target) return null;

    const t = ev.target;
    if (isInspectorUiNode(t)) return null;
    if (t instanceof HTMLBodyElement || t instanceof HTMLHtmlElement) return null;

    const pointerStack = getInspectorPointerStack(ev);

    const stackImage = pointerStack.find((node) => node instanceof HTMLImageElement && isValidInspectorImageNode(node));
    if (stackImage) return stackImage;

    if (isValidInspectorImageNode(t)) return t;

    if (!(t instanceof Element)) return null;

    const wrapper = getInspectorWrapperFromStack(pointerStack) || t.closest?.(INSPECTOR_IMAGE_WRAPPER_SELECTOR) || null;
    if (wrapper && !(inspectorPanelRoot && inspectorPanelRoot.contains(wrapper))) {
      const wrapperImg = pickBestInspectorImage(wrapper);
      if (wrapperImg) return wrapperImg;
    }

    return null;
  } catch (_) {
    return null;
  }
}

// Track the last mouse position for overlay removal.
document.addEventListener("mousemove", (e) => {
  window._mdi_lastMouseX = e.clientX;
  window._mdi_lastMouseY = e.clientY;
}, { passive: true, capture: true });

// Check whether the pointer is still within the overlay composite.
function isPointerStillWithinComposite() {
  const within = (node) => {
    try {
      if (!node) return false;
      const r = node.getBoundingClientRect();
      const x = window._mdi_lastMouseX ?? -1;
      const y = window._mdi_lastMouseY ?? -1;
      return (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
    } catch (_) { return false; }
  };
  return within(overlayParent) || within(overlayEl) || within(overlayTargetImg);
}

// Overlay removal timer control.
function clearOverlayRemovalTimer() {
  if (overlayRemovalTimer) {
    clearTimeout(overlayRemovalTimer);
    overlayRemovalTimer = null;
  }
}

// Schedule overlay removal after a short delay.
function scheduleOverlayRemoval() {
  clearOverlayRemovalTimer();
  if (overlayInteractionLocked) {
    return;
  }
  overlayRemovalTimer = setTimeout(() => {
    try { if (isPointerStillWithinComposite()) return; removeOverlay(); }
    catch (_) { removeOverlay(); }
  }, 60);
}

function clearOverlayPositionRaf() {
  if (overlayPositionRaf != null) {
    try {
      cancelAnimationFrame(overlayPositionRaf);
    } catch (_) {}
    overlayPositionRaf = null;
  }
}

function updateOverlayPosition() {
  if (!overlayEl || !overlayTriggerButton || !overlayParent || !overlayTargetImg) return;
  try {
    const rect = overlayTargetImg.getBoundingClientRect();
    const hostLeft = Math.max(0, Math.round(rect.right - INSPECTOR_OVERLAY_HOST_SIZE - INSPECTOR_OVERLAY_OFFSET));
    const hostTop = Math.max(0, Math.round(rect.top + INSPECTOR_OVERLAY_OFFSET));
    const hostWidth = Math.max(INSPECTOR_OVERLAY_HOST_SIZE, Math.round(rect.width));
    const hostHeight = Math.max(INSPECTOR_OVERLAY_HOST_SIZE, Math.round(rect.height));

    overlayEl.style.left = `${hostLeft}px`;
    overlayEl.style.top = `${hostTop}px`;
    overlayEl.style.width = `${INSPECTOR_OVERLAY_HOST_SIZE}px`;
    overlayEl.style.height = `${INSPECTOR_OVERLAY_HOST_SIZE}px`;
    overlayEl.style.pointerEvents = "none";

    overlayTriggerButton.style.left = "0";
    overlayTriggerButton.style.top = "0";
    overlayTriggerButton.style.right = "auto";
    overlayTriggerButton.style.bottom = "auto";
    overlayTriggerButton.style.width = "100%";
    overlayTriggerButton.style.height = "100%";
  } catch (err) {
    logDebug(2, "⚠️ overlay position update failed:", err?.message || err);
  }
}

function scheduleOverlayPositionUpdate() {
  if (!overlayEl || !overlayTriggerButton) return;
  clearOverlayPositionRaf();
  overlayPositionRaf = requestAnimationFrame(() => {
    overlayPositionRaf = null;
    updateOverlayPosition();
  });
}

// Overlay show and hide.
function showOverlayForImage(img) {
  try {
    logDebug(3, "🧪 [II trace] showOverlayForImage() called with:", img?.currentSrc || img?.src || "[no-src]");
    const parent = getInspectorOverlayParent(img);

    if (overlayEl && overlayParent === parent && overlayTargetImg === img) return;

    removeOverlay();

    overlayTargetImg = img;
    overlayParent = parent;
    overlayInteractionLocked = false;
    logDebug(3, "🧪 [II trace] showOverlayForImage() resolved parent:", parent?.tagName || "[none]", parent?.className || "");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Image info");
    btn.setAttribute("role", "button");
    btn.textContent = "🕵️";
    // Tooltip.
    attachTooltip(
      btn,
      "[Mass image downloader]: Open this image in the Image Inspector panel by clicking on it."
    );
    
    btn.style.position = "absolute";
    btn.style.top = "6px";
    btn.style.right = "6px";
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.minWidth = `${INSPECTOR_OVERLAY_BUTTON_MIN_SIZE}px`;
    btn.style.minHeight = `${INSPECTOR_OVERLAY_BUTTON_MIN_SIZE}px`;
    btn.style.padding = "6px 10px";
    btn.style.boxSizing = "border-box";
    btn.style.fontSize = "16px";
    btn.style.lineHeight = "1";
    btn.style.borderRadius = "8px";
    btn.style.backgroundColor = "#F8F8F8";
    btn.style.color = "#FFFFFF";
    btn.style.border = "2px solid #768591";
    btn.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "2147483646";
    btn.style.transition = "all 0.2s ease-in-out";
    btn.style.userSelect = "none";
    btn.style.touchAction = "manipulation";

    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "0";
    host.style.top = "0";
    host.style.width = `${INSPECTOR_OVERLAY_HOST_SIZE}px`;
    host.style.height = `${INSPECTOR_OVERLAY_HOST_SIZE}px`;
    host.style.boxSizing = "border-box";
    host.style.display = "block";
    host.style.zIndex = "2147483646";
    host.style.background = "transparent";
    host.style.pointerEvents = "none";
    host.style.overflow = "visible";
    host.setAttribute("role", "presentation");
    host.setAttribute("aria-hidden", "true");

    btn.style.position = "absolute";
    btn.style.left = "0";
    btn.style.top = "0";
    btn.style.right = "auto";
    btn.style.bottom = "auto";
    btn.style.width = "100%";
    btn.style.height = "100%";
    btn.style.minWidth = "0";
    btn.style.minHeight = "0";
    btn.style.padding = "0";
    btn.style.pointerEvents = "auto";
    btn.style.boxSizing = "border-box";

    host.appendChild(btn);

    // Hover behavior.
    btn.addEventListener("pointerdown", (e) => {
      logDebug(3, "🧪 [II trace] overlay button pointerdown:", e.type, overlayTargetImg?.currentSrc || overlayTargetImg?.src || "[no-src]");
      overlayInteractionLocked = true;
      clearOverlayRemovalTimer();
      e.stopPropagation();
    }, true);
    btn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      logDebug(3, "🧪 [II trace] overlay button click:", overlayTargetImg?.currentSrc || overlayTargetImg?.src || "[no-src]");
      overlayInteractionLocked = false;
      openInspectorPanelForImage(img);
    });

    document.body.appendChild(host);
    overlayEl = host;
    overlayTriggerButton = btn;

    parentPointerEnterHandler = () => {
      clearOverlayRemovalTimer();
    };
    parentPointerLeaveHandler = () => {
      scheduleOverlayRemoval();
    };
    overlayPointerEnterHandler = () => {
      clearOverlayRemovalTimer();
    };
    overlayPointerLeaveHandler = () => {
      scheduleOverlayRemoval();
    };

    parent.addEventListener("pointerenter", parentPointerEnterHandler, true);
    parent.addEventListener("pointerleave", parentPointerLeaveHandler, true);
    overlayTriggerButton.addEventListener("pointerenter", overlayPointerEnterHandler, true);
    overlayTriggerButton.addEventListener("pointerleave", overlayPointerLeaveHandler, true);
    overlayPointerCancelHandler = () => {
      overlayInteractionLocked = false;
    };
    overlayTriggerButton.addEventListener("pointercancel", overlayPointerCancelHandler, true);
    overlayScrollHandler = () => { scheduleOverlayPositionUpdate(); };
    overlayResizeHandler = () => { scheduleOverlayPositionUpdate(); };
    window.addEventListener("scroll", overlayScrollHandler, true);
    window.addEventListener("resize", overlayResizeHandler, true);
    try {
      scheduleOverlayPositionUpdate();
      const parentRect = parent.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const btnStyle = window.getComputedStyle(btn);
      const hostStyle = window.getComputedStyle(host);
      const parentStyle = window.getComputedStyle(parent);
      const probeX = Math.round(hostRect.left + Math.max(1, hostRect.width / 2));
      const probeY = Math.round(hostRect.top + Math.max(1, hostRect.height / 2));
      const probeNode = document.elementFromPoint(probeX, probeY);
      const probeStack = document.elementsFromPoint(probeX, probeY).slice(0, 6).map((node) => ({
        tag: node?.tagName || node?.nodeName || "[unknown]",
        className: node?.className || "",
        id: node?.id || ""
      }));
      logDebug(3, "🧪 [II trace] overlay mount metrics:", {
        probe: { x: probeX, y: probeY },
        probeNode: {
          tag: probeNode?.tagName || probeNode?.nodeName || "[none]",
          className: probeNode?.className || "",
          id: probeNode?.id || ""
        },
        probeStack,
        parentRect: {
          left: Math.round(parentRect.left),
          top: Math.round(parentRect.top),
          right: Math.round(parentRect.right),
          bottom: Math.round(parentRect.bottom),
          width: Math.round(parentRect.width),
          height: Math.round(parentRect.height)
        },
        hostRect: {
          left: Math.round(hostRect.left),
          top: Math.round(hostRect.top),
          right: Math.round(hostRect.right),
          bottom: Math.round(hostRect.bottom),
          width: Math.round(hostRect.width),
          height: Math.round(hostRect.height)
        },
        btnRect: {
          left: Math.round(btnRect.left),
          top: Math.round(btnRect.top),
          right: Math.round(btnRect.right),
          bottom: Math.round(btnRect.bottom),
          width: Math.round(btnRect.width),
          height: Math.round(btnRect.height)
        },
        btnPointerEvents: btnStyle.pointerEvents,
        hostPointerEvents: hostStyle.pointerEvents,
        parentOverflow: parentStyle.overflow,
        parentPosition: parentStyle.position,
        btnPosition: btnStyle.position,
        btnZIndex: btnStyle.zIndex
      });
    } catch (metricsErr) {
      logDebug(2, "⚠️ overlay metrics unavailable:", metricsErr?.message || metricsErr);
    }
    logDebug(3, "🧪 [II trace] overlay mounted:", overlayTargetImg?.currentSrc || overlayTargetImg?.src || "[no-src]");
  } catch (err) {
    logDebug(1, "❌ showOverlayForImage:", err?.message || err);
  }
}

// Remove the overlay and restore the state if needed.
function removeOverlay() {
  clearOverlayRemovalTimer();
  clearOverlayPositionRaf();
  logDebug(3, "🧪 [II trace] removeOverlay() called");
  try {
    if (overlayParent && parentPointerEnterHandler) overlayParent.removeEventListener("pointerenter", parentPointerEnterHandler, true);
    if (overlayParent && parentPointerLeaveHandler) overlayParent.removeEventListener("pointerleave", parentPointerLeaveHandler, true);
    if (overlayTriggerButton && overlayPointerEnterHandler) overlayTriggerButton.removeEventListener("pointerenter", overlayPointerEnterHandler, true);
    if (overlayTriggerButton && overlayPointerLeaveHandler) overlayTriggerButton.removeEventListener("pointerleave", overlayPointerLeaveHandler, true);
    if (overlayTriggerButton && overlayPointerCancelHandler) overlayTriggerButton.removeEventListener("pointercancel", overlayPointerCancelHandler, true);
    if (overlayScrollHandler) window.removeEventListener("scroll", overlayScrollHandler, true);
    if (overlayResizeHandler) window.removeEventListener("resize", overlayResizeHandler, true);
  } catch (_) {}
  try {
    if (overlayEl) overlayEl.remove();
  } catch (_) {}
  overlayEl = null; overlayTargetImg = null; overlayParent = null;
  parentPointerLeaveHandler = null; overlayPointerEnterHandler = null; overlayPointerLeaveHandler = null; parentPointerEnterHandler = null;
  overlayTriggerButton = null;
  overlayPointerCancelHandler = null;
  overlayScrollHandler = null;
  overlayResizeHandler = null;
  overlayInteractionLocked = false;
  logDebug(3, "🧪 [II trace] overlay cleared");
}

// Open the inspector panel for a given image.
function openInspectorPanelForImage(img) {
  try {
    removeInspectorPanel();

    // Fixed host container.
    const host = document.createElement("div");
    host.id = "__mdi_inspectorHost";
    host.style.position = "fixed";
    host.style.top = "0";
    host.style.right = "0";
    host.style.width = "25%";
    host.style.minWidth = "320px";
    host.style.height = "100vh";
    host.style.zIndex = "2147483647";
    host.style.borderLeft = "1px solid #D0D0D0";
    host.style.background = "#FFFFFF";
    host.style.boxShadow = "-2px 0 8px rgba(0,0,0,0.2)";
    host.style.overflow = "hidden";
    host.style.cursor = "default";

    // Block pointer events from reaching the page.
    try { host.addEventListener("mouseover", (ev) => ev.stopPropagation(), true); } catch (_) {}
    try { host.addEventListener("mouseout", (ev) => ev.stopPropagation(), true); } catch (_) {}

    const shadow = host.attachShadow({ mode: "open" });

    const css = document.createElement("style");
    css.textContent = `
      *, *::before, *::after { box-sizing: border-box; }
      :host { all: initial; }
      .root { 
        font-family: Arial, sans-serif;
        background-color: #FFFFFF;
        color: #768591;
        margin: 0;
        padding: 10px;
        width: 100%;
        height: 100%;
        position: relative;
        display: flex; 
        flex-direction: column;
        overflow: hidden;
      }
      h1 {
        font-size: 16px;
        text-align: center;
        margin: 0 0 12px 0;
        color: #007EE3;
      }
      h2 {
        font-size: 14px;
        margin-top: 12px;
        color: #007EE3;
      }
      .description {
        font-size: 10px;
        color: #6C757D;
        margin: 0 0 8px 0;
      }
      .title-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .title-header h1 { margin: 0; font-size: 16px; color: #007EE3; }
      .scroll {
        flex: 1 1 auto;
        overflow-y: auto;
        padding-right: 6px;
      }
      .global-options-wrapper {
        width: 100%;
        padding: 10px;
        margin-bottom: 12px;
        box-sizing: border-box;
        background-color: #F8F8F8;
        border: 1px solid #D0D0D0;
        border-radius: 8px;
        overflow: hidden;
      }
      .option-group {
        margin-bottom: 10px;
        padding: 10px;
        background-color: #F8F8F8;
        border: 1px solid #D0D0D0;
        border-radius: 6px;
        width: 100%;
        max-width: 100%;
        overflow-wrap: break-word;
        word-break: break-word;
        box-shadow: 1px 1px 6px rgba(0,0,0,0.1);
      }
      label {
        display: block;
        margin-bottom: 4px;
        font-weight: bold;
        color: #768591;
      }
      .info-text {
        font-size: 10px;
        color: #768591;
        margin-top: 4px;
        opacity: 0.8;
        white-space: pre-wrap;
      }
      button, .icon-btn {
        padding: 4px 8px;
        margin-left: 4px;
        border-radius: 4px;
        border: 1px solid #768591;
        background-color: #F8F8F8;
        color: #FFFFFF;
        cursor: pointer;
        font-size: 12px;
      }

      button:hover {
          background-color: #4f5984;   
          color: #f4f4f4;              
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
      }
      .btn-sm {
        /* Fixed square size for icon buttons */
        width: 26px;
        height: 26px;
        min-width: 26px;
        min-height: 26px;

        /* Center emoji exactly inside the square */
        display: inline-flex;
        align-items: center;
        justify-content: center;

        /* Icon visual scale */
        font-size: 18px;
        line-height: 1;

        /* No extra offset around the glyph */
        padding: 0;
        box-sizing: border-box;
      }
      .icon-btn {
        width: 24px;
        height: 24px;
        font-size: 16px;
        border-radius: 4px;
        color: #4f5984; 
      }
      .icon-btn:hover {
        background-color: #4f5984;
        border-color: #768591;
        color: #FFFFFF;
      }
      .row {
        display: flex; 
        gap: 8px;
        flex-wrap: wrap;
      }
      .preview-frame {
        position: relative;
        width: 100%;
        height: 220px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #fff;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .preview-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transform: translate(0px, 0px) scale(1);
        transform-origin: center center;
        transition: transform .06s linear;
        user-select: none;
        -webkit-user-drag: none;
        cursor: default;
      }
      .zoom-hint {
        margin-top: 4px;
        font-size: 10px;
        color: #768591;
      }
    `;

    const root = document.createElement("div");
    root.className = "root";

    // Header.
    const header = document.createElement("div");
    header.className = "title-header";
    const icon = document.createElement("img");
    try { icon.src = chrome.runtime.getURL("ico/emoji_32x32.png"); }
    catch (_) { icon.src = ""; }
    icon.width = 20; icon.height = 20; icon.alt = "Extension Icon";
    const h1 = document.createElement("h1");
    h1.textContent = "Mass Image Downloader - Image Inspector";
    header.appendChild(icon);
    header.appendChild(h1);

    // Description.
    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = "Inspect a single image. Review metadata, preview safely, then open or save it using your global rules.";

    // Compact close button.
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✖";
    closeBtn.className = "btn-sm icon-btn";
    attachTooltip(closeBtn, "Close Image Inspector");
    closeBtn.style.alignSelf = "flex-start";
    closeBtn.style.marginBottom = "8px";
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      removeInspectorPanel();
      showUserMsgSafe("Inspector panel closed.", "info");
    });

    // Scroller.
    const scroll = document.createElement("div");
    scroll.className = "scroll";

    // Image metadata.
    const src = String(img.currentSrc || img.src || "");
    const pageUrl = String(location.href);
    const titleAttr = img.getAttribute("title") || "[ No title ]";
    const altAttr = img.getAttribute("alt") || "[ No description ]";
    const ftype = inferFileType(src);
    const naturalDim = `${img.naturalWidth || img.width} × ${img.naturalHeight || img.height}px`;
    const rect = img.getBoundingClientRect();
    const renderedDim = `${Math.round(rect.width)} × ${Math.round(rect.height)}px`;

    currentInspectorImage = img;
    currentInspectorSrc = src;

    // Helper to add a labeled row.
    const addRow = (wrapper, labelText, valueText) => {
      const group = document.createElement("div");
      group.className = "option-group";
      const lbl = document.createElement("label");
      lbl.textContent = labelText + ":";
      const val = document.createElement("p");
      val.className = "info-text";
      val.textContent = valueText;
      group.appendChild(lbl);
      group.appendChild(val);
      wrapper.appendChild(group);
      return val; // Return value node so we can update it later
    };

    // Visible metadata.
    const s1Wrap = document.createElement("div");
    s1Wrap.className = "global-options-wrapper";
    const s1Title = document.createElement("h2");
    s1Title.textContent = "Mode: Visible Metadata";
    s1Wrap.appendChild(s1Title);

    const metaFileTypeVal = addRow(s1Wrap, "File type", `${ftype.ext} | MIME-Type: ${ftype.mime}`);
    const metaDimensionsVal = addRow(s1Wrap, "Dimensions", `${naturalDim} | On page: ${renderedDim}`);
    const metaDescriptionVal = addRow(s1Wrap, "Description", altAttr);
    const metaTitleVal = addRow(s1Wrap, "Title", titleAttr);
    const metaImageUrlVal = addRow(s1Wrap, "Image URL", src);
    const metaPageUrlVal = addRow(s1Wrap, "Page URL", pageUrl);

    // Optional developer metadata.
    let devWrap = null;
    let devNodeTypeVal = null;
    let devFullUrlVal = null;
    let devCorsVal = null;

    // Developer metadata.
    if (iiDevMode) {
      devWrap = document.createElement("div");
      devWrap.className = "global-options-wrapper";
      const s2Title = document.createElement("h2");
      s2Title.textContent = "Mode: Developer";
      devWrap.appendChild(s2Title);

      devNodeTypeVal = addRow(devWrap, "Node type", img.tagName);
      devFullUrlVal = addRow(devWrap, "Full URL (raw)", src);
      devCorsVal = addRow(devWrap, "CORS", "N/A");
      // Append later to preserve the layout order.
    }

    // Navigation list for prev/next browsing.
    const allImages = Array.from(document.querySelectorAll("img"));
    const navigationList = allImages.filter((node) => {
      try {
        if (!node || !node.src) return false;
        return isValidInspectorImageNode(node);
      } catch (_) {
        return false;
      }
    });

    let navigationIndex = -1;
    if (navigationList.length > 0) {
      const directIndex = navigationList.indexOf(img);
      navigationIndex = directIndex >= 0 ? directIndex : 0;
    }

    // Preview.
    const s3Wrap = document.createElement("div");
    s3Wrap.className = "global-options-wrapper";
    const s3Title = document.createElement("h2");
    s3Title.textContent = "Preview";
    s3Wrap.appendChild(s3Title);

    const previewGroup = document.createElement("div");
    previewGroup.className = "option-group";

    const frame = document.createElement("div");
    frame.className = "preview-frame";

    const previewImg = document.createElement("img");
    previewImg.className = "preview-img";
    previewImg.src = src;
    previewImg.alt = "";

    frame.appendChild(previewImg);
    previewGroup.appendChild(frame);

    const zoomGroup = document.createElement("div");
    zoomGroup.className = "option-group";
    const rowZoom = document.createElement("div");
    rowZoom.className = "row";

    const zoomInBtn = document.createElement("button");
    zoomInBtn.textContent = "✚";
    zoomInBtn.className = "btn-sm icon-btn";
    attachTooltip(zoomInBtn, "Zoom in");

    const zoomOutBtn = document.createElement("button");
    zoomOutBtn.textContent = "–";
    zoomOutBtn.className = "btn-sm icon-btn";
    attachTooltip(zoomOutBtn, "Zoom out");

    const zoomResetBtn = document.createElement("button");
    zoomResetBtn.textContent = "⛶";
    zoomResetBtn.className = "btn-sm icon-btn";
    attachTooltip(zoomResetBtn, "Original size");

    // Navigation buttons.
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "⬅️";
    attachTooltip(prevBtn, "Previous image");
    prevBtn.className = "btn-sm icon-btn";

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "➡️";
    attachTooltip(nextBtn, "Next image");
    nextBtn.className = "btn-sm icon-btn";

    // Order: Zoom in, zoom out, reset, prev, next.
    rowZoom.appendChild(zoomInBtn);
    rowZoom.appendChild(zoomOutBtn);
    rowZoom.appendChild(zoomResetBtn);
    rowZoom.appendChild(prevBtn);
    rowZoom.appendChild(nextBtn);
    zoomGroup.appendChild(rowZoom);

    const zoomHint = document.createElement("div");
    zoomHint.className = "zoom-hint";
    zoomHint.textContent = "Zoom: 1.00× (min 0.50×, max 3.00×) — drag to pan when zoomed in";
    zoomGroup.appendChild(zoomHint);

    const actionsGroup = document.createElement("div");
    actionsGroup.className = "option-group";
    
    const rowActions = document.createElement("div");
    rowActions.className = "row";
    
    const openBtn = document.createElement("button");
    openBtn.textContent = "🔗";
    attachTooltip(openBtn, "Open image in new tab");
    openBtn.className = "btn-sm icon-btn";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾";
    attachTooltip(saveBtn, "Save image using your global download rules");
    saveBtn.className = "btn-sm icon-btn";
    
    rowActions.appendChild(openBtn);
    rowActions.appendChild(saveBtn);
    actionsGroup.appendChild(rowActions);

    s3Wrap.appendChild(previewGroup);
    s3Wrap.appendChild(zoomGroup);
    s3Wrap.appendChild(actionsGroup);

    // Update metadata.
    function updateMetadataForImage(targetImg) {
      try {
        if (!targetImg) return;
        const currentSrc = String(targetImg.currentSrc || targetImg.src || "");
        const f = inferFileType(currentSrc);
        const nDim = `${targetImg.naturalWidth || targetImg.width} × ${targetImg.naturalHeight || targetImg.height}px`;
        const rectNow = targetImg.getBoundingClientRect();
        const rDim = `${Math.round(rectNow.width)} × ${Math.round(rectNow.height)}px`;
        const altNow = targetImg.getAttribute("alt") || "[ No description ]";
        const titleNow = targetImg.getAttribute("title") || "[ No title ]";

        if (metaFileTypeVal) metaFileTypeVal.textContent = `${f.ext} | MIME-Type: ${f.mime}`;
        if (metaDimensionsVal) metaDimensionsVal.textContent = `${nDim} | On page: ${rDim}`;
        if (metaDescriptionVal) metaDescriptionVal.textContent = altNow;
        if (metaTitleVal) metaTitleVal.textContent = titleNow;
        if (metaImageUrlVal) metaImageUrlVal.textContent = currentSrc;
        if (metaPageUrlVal) metaPageUrlVal.textContent = pageUrl;
      } catch (err) {
        logDebug(1, "❌ updateMetadataForImage error:", err?.message || err);
      }
    }

    // Update developer metadata.
    function updateDeveloperForImage(targetImg) {
      if (!iiDevMode || !devWrap) return;
      try {
        const currentSrc = String(targetImg?.currentSrc || targetImg?.src || "");
        if (devNodeTypeVal) devNodeTypeVal.textContent = targetImg ? targetImg.tagName : "[ N/A ]";
        if (devFullUrlVal) devFullUrlVal.textContent = currentSrc || "[ N/A ]";
        if (devCorsVal) devCorsVal.textContent = "N/A";
      } catch (err) {
        logDebug(1, "❌ updateDeveloperForImage error:", err?.message || err);
      }
    }

    // Keep the preview and selection in sync.
    function setActiveInspectorImage(targetImg, resetZoom = false) {
      try {
        if (!targetImg) return;

        currentInspectorImage = targetImg;
        currentInspectorSrc = String(targetImg.currentSrc || targetImg.src || "");

        if (previewImg) {
          previewImg.src = currentInspectorSrc;
          previewImg.alt = "";
        }

        updateMetadataForImage(targetImg);
        updateDeveloperForImage(targetImg);

        if (resetZoom) {
          try {
            if (typeof zoomResetBtn !== "undefined" && zoomResetBtn) {
              zoomResetBtn.click();
            }
          } catch (zoomErr) {
            logDebug(2, "⚠️ Could not trigger zoom reset on navigation:", zoomErr?.message || zoomErr);
          }
        }
      } catch (err) {
        logDebug(1, "❌ setActiveInspectorImage error:", err?.message || err);
      }
    }

    // Navigation handlers.
    function navigateBy(delta) {
      if (!navigationList || navigationList.length === 0) {
        showUserMsgSafe("No other images found to navigate.", "info");
        logDebug(2, "ℹ️ Image Inspector: empty navigationList.");
        return;
      }

      const total = navigationList.length;
      if (total <= 0) return;

      // Avoid infinite loops.
      let attempts = 0;

      // Cycle until a valid image is found.
      while (attempts < total) {
        navigationIndex = (navigationIndex + delta + total) % total;
        const target = navigationList[navigationIndex];

        // Check validity.
        if (target && target.src) {
          setActiveInspectorImage(target, true);

          logDebug(2, "🧭 Image Inspector navigation: moved to index", navigationIndex);
          return;
        }

        attempts++;
      }

      // No valid image found.
      showUserMsgSafe("Could not navigate to another valid image.", "error");
      logDebug(1, "⚠ Image Inspector: no valid images found during navigation.");
    }

    // Mount panel sections.
    shadow.appendChild(css);
    root.appendChild(header);
    root.appendChild(desc);
    root.appendChild(closeBtn);

    const scrollContainer = scroll; // Alias for clarity

    // Render sections in the desired order.
    scrollContainer.appendChild(s3Wrap);
    scrollContainer.appendChild(s1Wrap);

    // Developer block.
    if (devWrap) {
      scrollContainer.appendChild(devWrap);
    }

    root.appendChild(scrollContainer);
    shadow.appendChild(root);

    document.body.appendChild(host);
    inspectorPanelRoot = host;

    showUserMsgSafe("Inspector panel opened.", "info");

    // Open/save actions.
    openBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      tryOpenImageInNewTab(currentInspectorSrc);
    });

    // Save action.
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      trySaveImage(currentInspectorSrc);
    });

    // Previous image.
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      navigateBy(-1);
    });

    // Next image.
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      navigateBy(+1);
    });

    // Zoom and pan.
    attachZoomPanBehavior({ frame, previewImg, zoomHint, zoomInBtn, zoomOutBtn, zoomResetBtn });

    // Sync the initial selection.
    setActiveInspectorImage(img, false);

  } catch (err) {
    logDebug(1, "❌ openInspectorPanelForImage:", err?.message || err);
    logDebug(3, `🐛 Stacktrace: ${err.stack}`);
  }
}

// Remove the inspector panel.
function removeInspectorPanel() {
  if (!inspectorPanelRoot) return;
  try { inspectorPanelRoot.remove(); } catch (_) {}
  inspectorPanelRoot = null;
  currentInspectorImage = null;
  currentInspectorSrc = "";
}

// Refresh the developer block if open.
function refreshDevBlockIfOpen() {
  if (inspectorPanelRoot && (currentInspectorImage || overlayTargetImg)) {
    const img = currentInspectorImage || overlayTargetImg;
    removeInspectorPanel();
    openInspectorPanelForImage(img);
  }
}

/**
 * Opens the current image in a new tab.
 * @param {string} url - Image URL.
 * @returns {void}
 */
function tryOpenImageInNewTab(url) {
  try {
    if (!/^https?:\/\//i.test(url)) {
      showUserMsgSafe("Unable to open image (invalid URL scheme).", "error");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    showUserMsgSafe("Image opened in new tab.", "info");
  } catch (err) {
    showUserMsgSafe("Unable to open image.", "error");
    logDebug(1, "❌ tryOpenImageInNewTab:", err?.message || err);
    logDebug(3, `🐛 Stacktrace: ${err.stack}`);
  }
}

/**
 * Requests the background script to save the current image.
 * @param {string} url - Image URL.
 * @returns {void}
 */
function trySaveImage(url) {
  try {
    chrome.runtime.sendMessage(
      { action: "imageInspectorSaveImage", imageUrl: url, source: "imageInspector" },
      (resp) => {

        // 1) Messaging error.
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message || "";
          logDebug(1, "❌ trySaveImage lastError:", msg);

          // Treat the port-close error as non-fatal.
          if (msg.includes("The message port closed before a response was received")) {
            logDebug(2, "ℹ️ Non-fatal messaging error; assuming download started correctly.");
            handleSaveSuccess();
            return;
          }

          // Keep a clear user-facing error for other failures.
          showUserMsgSafe("Could not start download.", "error");
          return;
        }

        // 2) Explicit success.
        if (resp && resp.success === true) {
          handleSaveSuccess();
          return;
        }

        // 3) Explicit failure.
        if (resp && resp.success === false) {
          const errMsg = resp.errorMessage ? String(resp.errorMessage) : "Could not start download.";
          showUserMsgSafe(" " + errMsg, "error");
          logDebug(1, "⚠ trySaveImage explicit failure:", resp);
          return;
        }

        // 4) No explicit response; assume success.
        logDebug(2, "ℹ️ No explicit response from background; assuming download started.");
        handleSaveSuccess();
      }
    );
  } catch (err) {
    showUserMsgSafe("Could not start download.", "error");
    logDebug(1, "❌ trySaveImage error:", err?.message || err);
    logDebug(3, `🐛 Stacktrace: ${err.stack}`);
  }
}

/**
 * Fallback save path for silent-success handlers.
 * @param {string} url - Image URL.
 * @returns {void}
 */
function fallbackSave(url) {
  try {
    chrome.runtime.sendMessage(
      { action: "imageInspectorSaveImage", imageUrl: url, source: "imageInspector-fallback" },
      (resp2) => {

        // 1) Messaging error.
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message || "";
          logDebug(1, "❌ fallbackSave lastError:", msg);

          // Treat the port-close error as non-fatal.
          if (msg.includes("The message port closed before a response was received")) {
            logDebug(2, "ℹ️ Non-fatal messaging error in fallback; assuming download started correctly.");
            handleSaveSuccess();
            return;
          }

          showUserMsgSafe("Could not start download.", "error");
          return;
        }

        // 2) Explicit success.
        if (resp2 && resp2.success === true) {
          handleSaveSuccess();
          return;
        }

        // 3) Explicit failure.
        if (resp2 && resp2.success === false) {
          const errMsg = resp2.errorMessage ? String(resp2.errorMessage) : "Could not start download.";
          showUserMsgSafe(" " + errMsg, "error");
          logDebug(1, "⚠ fallback download explicit failure:", resp2);
          return;
        }

        // 4) No explicit response; assume success.
        logDebug(2, "ℹ️ No explicit response from background; assuming download started.");
        handleSaveSuccess();
      }
    );
  } catch (err) {
    showUserMsgSafe("Could not start download.", "error");
    logDebug(1, "❌ fallbackSave error:", err?.message || err);
    logDebug(3, `🐛 Stacktrace: ${err.stack}`);
  }
}

/**
 * Handles post-save success actions in the panel.
 * @returns {void}
 */
function handleSaveSuccess() {
  try {
    showUserMsgSafe("Image saved successfully.", "info");
    logDebug(2, "✅ Image Inspector: save success reported to user (tab closing handled in background).");
  } catch (err) {
    logDebug(1, "❌ handleSaveSuccess error:", err?.message || err);
  }
}

/**
 * Infers a file type from a URL.
 * @param {string} url - Image URL.
 * @returns {{ext: string, mime: string}}
 */
function inferFileType(url) {
  try {
    const u = new URL(url, location.href);
    const pathname = u.pathname || "";
    const ext = (pathname.split(".").pop() || "").toLowerCase();
    const mime = (ext === "jpg" || ext === "jpeg") ? "image/jpeg" :
                 (ext === "png") ? "image/png" :
                 (ext === "webp") ? "image/webp" :
                 (ext === "bmp") ? "image/bmp" :
                 (ext === "svg") ? "image/svg+xml" :
                 "image/*";
    return { ext: ext || "unknown", mime };
  } catch (_) {
    return { ext: "unknown", mime: "image/*" };
  }
}

// Zoom and pan helpers for the preview image.
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.25;

/**
 * Attaches zoom and pan behavior to the preview image.
 * @param {object} params - Zoom and pan elements.
 * @returns {void}
 */
function attachZoomPanBehavior({ frame, previewImg, zoomHint, zoomInBtn, zoomOutBtn, zoomResetBtn }) {
  let currentZoom = 1.0;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;
  let baseImgW = 0;
  let baseImgH = 0;
  let frameW = 0;
  let frameH = 0;

  // Initial measurement.
  function measureBaseGeometry() {
    if (!previewImg || !frame) return;
    const prev = previewImg.style.transform;
    previewImg.style.transform = "translate(0px, 0px) scale(1)";
    const fr = frame.getBoundingClientRect();
    const ir = previewImg.getBoundingClientRect();
    frameW = Math.max(0, Math.round(fr.width));
    frameH = Math.max(0, Math.round(fr.height));
    baseImgW = Math.max(0, Math.round(ir.width));
    baseImgH = Math.max(0, Math.round(ir.height));
    previewImg.style.transform = prev;
  }

  // Clamping helpers.
  function clampZoom(z) { return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z)); }
  
  // Clamp offsets to the frame bounds.
  function clampOffsets() {
    if (!frameW || !frameH || !baseImgW || !baseImgH) return;
    const scaledW = baseImgW * currentZoom;
    const scaledH = baseImgH * currentZoom;
    const maxOffsetX = Math.max(0, (scaledW - frameW) / 2);
    const maxOffsetY = Math.max(0, (scaledH - frameH) / 2);
    if (offsetX >  maxOffsetX) offsetX =  maxOffsetX;
    if (offsetX < -maxOffsetX) offsetX = -maxOffsetX;
    if (offsetY >  maxOffsetY) offsetY =  maxOffsetY;
    if (offsetY < -maxOffsetY) offsetY = -maxOffsetY;
  }

  // Update the zoom label.
  function updateZoomLabel() {
    if (zoomHint) {
      zoomHint.textContent = `Zoom: ${currentZoom.toFixed(2)}× (min ${ZOOM_MIN.toFixed(2)}×, max ${ZOOM_MAX.toFixed(2)}×) — drag to pan when zoomed in`;
    }
  }

  // Apply transform.
  function applyTransform() {
    previewImg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${currentZoom})`;
  }

  // Apply zoom changes.
  function applyZoom() {
    clampOffsets();
    applyTransform();
    updateZoomLabel();
    const pannable = currentZoom > 1 && (baseImgW * currentZoom > frameW + 1 || baseImgH * currentZoom > frameH + 1);
    previewImg.style.cursor = pannable ? "grab" : "default";
  }

  // Zoom by delta.
  function zoomBy(delta) {
    const nz = clampZoom(currentZoom + delta);
    if (nz === currentZoom) return;
    currentZoom = nz;
    applyZoom();
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      zoomBy(+ZOOM_STEP);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      zoomBy(-ZOOM_STEP);
    });
  }

  // Reset zoom to the original size.
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      currentZoom = 1.0;
      offsetX = 0;
      offsetY = 0;
    applyZoom();
  });
  }

  // Mouse events.
  function onMouseDown(e) {
    const pannable = currentZoom > 1;
    if (!pannable) return;
    isDragging = true;
    previewImg.style.cursor = "grabbing";
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startOffsetX = offsetX;
    startOffsetY = offsetY;
    e.preventDefault(); e.stopPropagation();
  }

  // Mouse move.
  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    offsetX = startOffsetX + dx;
    offsetY = startOffsetY + dy;
    clampOffsets();
    applyTransform();
  }

  // Mouse up or leave.
  function onMouseUpLeave() {
    if (!isDragging) return;
    isDragging = false;
    const pannable = currentZoom > 1;
    previewImg.style.cursor = pannable ? "grab" : "default";
  }

  // Touch events.
  function getTouchPoint(ev) {
    if (!ev.touches || ev.touches.length === 0) return null;
    const t = ev.touches[0];
    return { x: t.clientX, y: t.clientY };
  }

  // Touch start.
  function onTouchStart(ev) {
    const pannable = currentZoom > 1;
    if (!pannable) return;
    const p = getTouchPoint(ev);
    if (!p) return;
    isDragging = true;
    dragStartX = p.x; dragStartY = p.y;
    startOffsetX = offsetX; startOffsetY = offsetY;
    ev.preventDefault(); ev.stopPropagation();
  }

  // Touch move.
  function onTouchMove(ev) {
    if (!isDragging) return;
    const p = getTouchPoint(ev);
    if (!p) return;
    const dx = p.x - dragStartX;
    const dy = p.y - dragStartY;
    offsetX = startOffsetX + dx;
    offsetY = startOffsetY + dy;
    clampOffsets();
    applyTransform();
    ev.preventDefault(); ev.stopPropagation();
  }

  // Touch end or cancel.
  function onTouchEndCancel() {
    if (!isDragging) return;
    isDragging = false;
  }

  // Event listeners.
  frame.addEventListener("mousedown", onMouseDown, { passive: false });
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("mouseup", onMouseUpLeave, { passive: true });
  frame.addEventListener("mouseleave", onMouseUpLeave, { passive: true });
  frame.addEventListener("touchstart", onTouchStart, { passive: false });
  frame.addEventListener("touchmove", onTouchMove, { passive: false });
  frame.addEventListener("touchend", onTouchEndCancel, { passive: true });
  frame.addEventListener("touchcancel", onTouchEndCancel, { passive: true });

  measureBaseGeometry();
  applyZoom();

  // Re-measure on load and resize.
  if (previewImg && !previewImg.complete) {
    previewImg.addEventListener("load", () => { measureBaseGeometry(); applyZoom(); }, { once: true });
  }
  window.addEventListener("resize", () => { measureBaseGeometry(); applyZoom(); }, { passive: true });
}

// Boot the script, load config, and attach listeners.
(async function boot() {
  try {
    await initConfig();
    keyDownHandler = onKeyDown;
    window.addEventListener("keydown", keyDownHandler, true);
    logDebug(1, "🧩 Image Inspector content script ready.");
  } catch (err) {
    logDebug(1, "❌ boot error:", err?.message || err);
  }
})();
