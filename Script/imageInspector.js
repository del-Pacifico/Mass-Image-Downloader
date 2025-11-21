/* -----------------------------------------------------------------------------
 * Mass Image Downloader - Image Inspector (Content Script)
 * Version: 2.08.140-UxFix (Shadow DOM parity, scroll, header icon, DevMode gating, small buttons)
 * -----------------------------------------------------------------------------
 * - UX/CSS: Panel con Shadow DOM replicando estilos de Options.
 * - Scroll restaurado (estructura .root + .scroll).
 * - Icono de cabecera con chrome.runtime.getURL().
 * - Bloque "Mode: Developer" solo si iiDevMode === true.
 * - Botones compactos (.btn-sm) y botón cerrar "✖" únicamente.
 * - Reglas de negocio SIN cambios.
 * --------------------------------------------------------------------------- */

// Runtime (storage-synced) 
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
let parentPointerEnterHandler = null;

let overlayRemovalTimer = null;
let debugLogLevelCache = 1;

// Config & storage sync 
async function initConfig() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get([
        "imageInspectorEnabled",
        "imageInspectorDevMode",
        "imageInspectorCloseOnSave",
        "showUserFeedbackMessages",
		    "debugLogLevel"
      ], (data) => {
        iiEnabledFromOptions = data.imageInspectorEnabled === true;
        iiDevMode = data.imageInspectorDevMode === true;
        iiCloseOnSave = data.imageInspectorCloseOnSave === true;
        
        const level = parseInt(data.debugLogLevel ?? 0);
		    showUserFeedbackMessagesCache = data.showUserFeedbackMessages ?? true;

        if (!isNaN(level)) debugLogLevelCache = level;

        logDebug(1, "🕵️ Image Inspector settings loaded:", {
          iiEnabledFromOptions, iiDevMode, iiCloseOnSave, showUserFeedbackMessagesCache, debugLogLevelCache
        });
        resolve();
      });
    } catch (err) {
      logDebug(1, "❌ initConfig failed:", err?.message || err);
      resolve();
    }
  });
}

// Debug logging (with cached level) 
function logDebug(levelOfLog, ...args) {
    try {
        let level = 1;
        let messageArgs = [];

        if (typeof levelOfLog === "number" && levelOfLog >= 1 && levelOfLog <= 3) {
            level = levelOfLog;
            messageArgs = args;
        } else {
            // Handle legacy or malformed calls (assume default log level 1)
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

// Initialization, then set up listeners. 
// Await config load before adding event listeners.
// This prevents race conditions where user toggles before config is loaded.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;

  if ("imageInspectorEnabled" in changes) {
    iiEnabledFromOptions = changes.imageInspectorEnabled.newValue === true;
    logDebug(1, "🕵️ imageInspectorEnabled →", iiEnabledFromOptions);
    if (!iiEnabledFromOptions && iiActiveInPage) {
      teardownImageInspector("disabled-in-options");
      showUserMsgSafe("🕵️ Image Inspector disabled in Options.", "info");
    }
  }
  if ("imageInspectorDevMode" in changes) {
    iiDevMode = changes.imageInspectorDevMode.newValue === true;
    logDebug(2, "👨🏻‍💻 imageInspectorDevMode →", iiDevMode);
    try { refreshDevBlockIfOpen(); } catch (_) {}
  }
  if ("imageInspectorCloseOnSave" in changes) {
    iiCloseOnSave = changes.imageInspectorCloseOnSave.newValue === true;
    logDebug(2, "🔄 imageInspectorCloseOnSave →", iiCloseOnSave);
  }
  if ("showUserFeedbackMessages" in changes) {
    showUserFeedbackMessagesCache = changes.showUserFeedbackMessages.newValue !== false;
    logDebug(2, "🔄 showUserFeedbackMessages →", showUserFeedbackMessagesCache);
  }
});

// Display toast-style user message (non-blocking, auto-dismiss)
// type: "info" | "error". Default: "info", blue background.
// "error" shows red background and longer duration.
function showUserMsgSafe(text, type = "info") {
  try {
    if (!showUserFeedbackMessagesCache) return;
    const msg = document.createElement("div");
    const duration = type === "error" ? 10000 : 3000;
    const backgroundColor = type === "error" ? "#d9534f" : "#007EE3";
    msg.textContent = "Mass image downloader: " + text;
    msg.style.position = "fixed";
    msg.style.top = "20px";
    msg.style.right = "20px";
    msg.style.backgroundColor = backgroundColor;
    msg.style.color = "#FFFFFF";
    msg.style.padding = "10px";
    msg.style.borderRadius = "5px";
    msg.style.fontSize = "13px";
    msg.style.boxShadow = "2px 2px 8px rgba(0,0,0,0.3)";
    msg.style.opacity = "1";
    msg.style.transition = "opacity 0.5s ease-in-out";
    msg.style.zIndex = "2147483647";
    document.body.appendChild(msg);
    setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => { try { msg.remove(); } catch (_) {} }, 500);
    }, duration);
  } catch (err) {
    logDebug(1, "❌ Failed to show user message:", err?.message || err);
  }
}

// Hotkey handling 
// Ctrl+Shift+M to toggle image inspector.
function onKeyDown(evt) {
  try {
    if (!evt || evt.repeat) return;
    const isCtrlShiftM = (evt.ctrlKey || evt.metaKey) && evt.shiftKey && (evt.key === "M" || evt.key === "m");
    if (!isCtrlShiftM) return;
    evt.preventDefault();
    evt.stopPropagation();

    // Toggle inspector
    toggleInspectorViaHotkey();
  } catch (err) {
    logDebug(1, "❌ onKeyDown error:", err?.message || err);
  }
}

// Attach keydown listener
// (use capture to ensure we get it before page scripts)
function toggleInspectorViaHotkey() {
  if (!iiEnabledFromOptions) {
    logDebug(1, "🔔 INFO 🕵️ Image Inspector is disabled in Options.");
    showUserMsgSafe("🕵️ Image Inspector is disabled in Options.", "info");
    return;
  }
  // Toggle activation
  if (!iiActiveInPage) {
    activateImageInspector();
    showUserMsgSafe("🟢 Image Inspector enabled.", "info");
  } else {
    teardownImageInspector("user-toggle-off");
    showUserMsgSafe("🔴 Image Inspector disabled.", "info");
  }
}

// Inspector activation/teardown 
// (on-demand via hotkey)
function activateImageInspector() {
  // Avoid double-activation
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
      // if throttled, skip
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

// Teardown inspector, removing overlays and panel
function teardownImageInspector(reason) {
  if (!iiActiveInPage) return;
  iiActiveInPage = false;

  removeOverlay();
  removeInspectorPanel();
  try { document.removeEventListener("mouseover", mouseOverHandler, true); } catch (_) {}
  document.documentElement.style.cursor = "auto";

  logDebug(1, `🧹 Inspector teardown. Reason: ${reason}`);
}

// Find valid image from event target, excluding panel images
function findValidImgFromEvent(ev) {
  if (!ev || !ev.target) return null;
  const t = ev.target;
  if (t instanceof HTMLImageElement && t.isConnected && t.width > 0 && t.height > 0) {
    if (inspectorPanelRoot && inspectorPanelRoot.contains(t)) return null;
    return t;
  }
  return null;
}

// Track last mouse position for overlay removal logic
document.addEventListener("mousemove", (e) => {
  window._mdi_lastMouseX = e.clientX;
  window._mdi_lastMouseY = e.clientY;
}, { passive: true, capture: true });

// Check if pointer is still within overlay composite
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

// Overlay removal scheduling, with throttling
function clearOverlayRemovalTimer() {
  if (overlayRemovalTimer) { clearTimeout(overlayRemovalTimer); overlayRemovalTimer = null; }
}

// Schedule overlay removal after short delay, checking pointer position
function scheduleOverlayRemoval() {
  clearOverlayRemovalTimer();
  overlayRemovalTimer = setTimeout(() => {
    try { if (isPointerStillWithinComposite()) return; removeOverlay(); }
    catch (_) { removeOverlay(); }
  }, 60);
}

// Overlay handling, show/hide
function showOverlayForImage(img) {
  try {
    const parent = img.closest("figure, a, .Image, .TPost, .Objf, .Auto") || img.parentElement || img;

    if (overlayEl && overlayParent === parent && overlayTargetImg === img) return;

    removeOverlay();

    overlayTargetImg = img;
    overlayParent = parent;

    const cs = window.getComputedStyle(parent);
    const restorePosition = (cs.position === "static");
    if (restorePosition) {
      parent._mdi_prevPos = parent.style.position;
      parent.style.position = "relative";
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Image info");
    btn.setAttribute("role", "button");
    btn.textContent = "🕵️";
    btn.title = "[Mass image downloader]: Click to open the Image Inspector panel.";
    btn.style.position = "absolute";
    btn.style.top = "6px";
    btn.style.right = "6px";
    btn.style.fontSize = "10px";
    btn.style.lineHeight = "12px";
    btn.style.padding = "2px 4px";
    btn.style.borderRadius = "4px";
    btn.style.background = "rgba(255,255,255,0.95)";
    btn.style.color = "#121b3e";
    btn.style.border = "1px solid #4f5984";
    btn.style.boxShadow = "0 1px 4px rgba(0,0,0,0.25)";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "2147483646";
    btn.style.transform = "scale(1)";
    btn.style.transition = "transform .12s ease, opacity .12s ease";

    btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.08)"; });
    btn.addEventListener("mouseleave", () => { btn.style.transform = "scale(1)"; });
    btn.addEventListener("mousedown", (e) => { e.stopPropagation(); }, true);
    btn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      openInspectorPanelForImage(img);
    });

    parent.appendChild(btn);
    overlayEl = btn;
    overlayEl._mdi_restorePositionParent = restorePosition ? parent : null;

    parentPointerEnterHandler = () => { clearOverlayRemovalTimer(); };
    parentPointerLeaveHandler = () => { scheduleOverlayRemoval(); };
    overlayPointerEnterHandler = () => { clearOverlayRemovalTimer(); };
    overlayPointerLeaveHandler = () => { scheduleOverlayRemoval(); };

    parent.addEventListener("pointerenter", parentPointerEnterHandler, true);
    parent.addEventListener("pointerleave", parentPointerLeaveHandler, true);
    overlayEl.addEventListener("pointerenter", overlayPointerEnterHandler, true);
    overlayEl.addEventListener("pointerleave", overlayPointerLeaveHandler, true);
  } catch (err) {
    logDebug(1, "❌ showOverlayForImage:", err?.message || err);
  }
}

// Remove overlay and cleanup, restoring parent position if needed
function removeOverlay() {
  clearOverlayRemovalTimer();
  try {
    if (overlayParent && parentPointerEnterHandler) overlayParent.removeEventListener("pointerenter", parentPointerEnterHandler, true);
    if (overlayParent && parentPointerLeaveHandler) overlayParent.removeEventListener("pointerleave", parentPointerLeaveHandler, true);
    if (overlayEl && overlayPointerEnterHandler) overlayEl.removeEventListener("pointerenter", overlayPointerEnterHandler, true);
    if (overlayEl && overlayPointerLeaveHandler) overlayEl.removeEventListener("pointerleave", overlayPointerLeaveHandler, true);
  } catch (_) {}
  try {
    if (overlayEl && overlayEl._mdi_restorePositionParent && overlayParent) {
      overlayParent.style.position = overlayParent._mdi_prevPos || "";
      delete overlayParent._mdi_prevPos;
    }
  } catch (_) {}
  try { overlayEl && overlayEl.remove(); } catch (_) {}
  overlayEl = null; overlayTargetImg = null; overlayParent = null;
  parentPointerLeaveHandler = null; overlayPointerEnterHandler = null; overlayPointerLeaveHandler = null; parentPointerEnterHandler = null;
}

// Open inspector panel for given image
function openInspectorPanelForImage(img) {
  try {
    removeInspectorPanel();

    // Host fijo (mínimo inline)
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

    // block mouse events to underlying page
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
      button {
        padding: 10px;
        font-size: 10px;
        font-weight: bold;
        background-color: #007EE3;
        border: 2px solid #768591;
        color: #FFFFFF;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      button:hover {
        background-color: #768591;
        border-color: #007EE3;
        color: #FFFFFF;
      }
      .btn-sm {
        padding: 6px 10px;
        font-size: 10px;
        font-weight: bold;
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

    // Header
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

    // Description (1-2 lines)
    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = "Inspect a single image. Review metadata, preview safely, then open or save it using your global rules.";

    // Close button, compact "✖"
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✖";
    closeBtn.className = "btn-sm";
    closeBtn.style.alignSelf = "flex-start";
    closeBtn.style.marginBottom = "8px";
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      removeInspectorPanel();
      showUserMsgSafe("🔚 Inspector panel closed.", "info");
    });

    // Scroller
    const scroll = document.createElement("div");
    scroll.className = "scroll";

    // Image metadata extraction
    const src = String(img.currentSrc || img.src || "");
    const pageUrl = String(location.href);
    const titleAttr = img.getAttribute("title") || "[ No title ]";
    const altAttr = img.getAttribute("alt") || "[ No description ]";
    const ftype = inferFileType(src);
    const naturalDim = `${img.naturalWidth || img.width} × ${img.naturalHeight || img.height}px`;
    const rect = img.getBoundingClientRect();
    const renderedDim = `${Math.round(rect.width)} × ${Math.round(rect.height)}px`;

    // Helper to add a labeled row
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

    // Visible Metadata
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

    // Developer info container (optional, only if iiDevMode is true)
    let devWrap = null;
    let devNodeTypeVal = null;
    let devFullUrlVal = null;
    let devCorsVal = null;

    // Developer Metadata
    if (iiDevMode) {
      devWrap = document.createElement("div");
      devWrap.className = "global-options-wrapper";
      const s2Title = document.createElement("h2");
      s2Title.textContent = "Mode: Developer";
      devWrap.appendChild(s2Title);

      devNodeTypeVal = addRow(devWrap, "Node type", img.tagName);
      devFullUrlVal = addRow(devWrap, "Full URL (raw)", src);
      devCorsVal = addRow(devWrap, "CORS", "N/A");
      // devWrap will be appended later in the desired order.
    }

    // Navigation list: all relevant images in the page (for prev/next browsing)
    const allImages = Array.from(document.querySelectorAll("img"));
    const navigationList = allImages.filter((node) => {
      try {
        if (!node || !node.src) return false;
        // Basic size filter to avoid tiny icons
        const w = Number(node.naturalWidth || node.width || 0);
        const h = Number(node.naturalHeight || node.height || 0);
        return w >= 50 && h >= 50;
      } catch (_) {
        return false;
      }
    });

    let navigationIndex = -1;
    if (navigationList.length > 0) {
      const directIndex = navigationList.indexOf(img);
      navigationIndex = directIndex >= 0 ? directIndex : 0;
    }

    // Preview
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
    zoomInBtn.title = "Zoom in";
    zoomInBtn.className = "btn-sm";

    const zoomOutBtn = document.createElement("button");
    zoomOutBtn.textContent = "–";
    zoomOutBtn.title = "Zoom out";
    zoomOutBtn.className = "btn-sm";

    const zoomResetBtn = document.createElement("button");
    zoomResetBtn.textContent = "⛶";
    zoomResetBtn.title = "Original size";
    zoomResetBtn.className = "btn-sm";

    // NEW — Navigation buttons (following EXACT same pattern)
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "⬅️";
    prevBtn.title = "Previous image";
    prevBtn.className = "btn-sm";

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "➡️";
    nextBtn.title = "Next image";
    nextBtn.className = "btn-sm";

    // Order: ZoomIn / ZoomOut / Reset / Prev / Next
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
    openBtn.title = "Open image in new tab";
    openBtn.className = "btn-sm";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾";
    saveBtn.title = "Save image using your global download rules";
    saveBtn.className = "btn-sm";
    
    rowActions.appendChild(openBtn);
    rowActions.appendChild(saveBtn);
    actionsGroup.appendChild(rowActions);

    s3Wrap.appendChild(previewGroup);
    s3Wrap.appendChild(zoomGroup);
    s3Wrap.appendChild(actionsGroup);

    // Update metadata function
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

    // Update developer info function
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

    // Navigation button handlers
    function navigateBy(delta) {
      if (!navigationList || navigationList.length === 0) {
        showUserMsgSafe("ℹ️ No other images found to navigate.", "info");
        logDebug(2, "ℹ️ Image Inspector: empty navigationList.");
        return;
      }

      const total = navigationList.length;
      if (total <= 0) return;

      // Defensive: avoid infinite loops in case of all broken nodes
      let attempts = 0;

      // Cycle until a valid image is found or all have been tried
      while (attempts < total) {
        navigationIndex = (navigationIndex + delta + total) % total;
        const target = navigationList[navigationIndex];

        // Check validity
        if (target && target.src) {
          const newSrc = String(target.currentSrc || target.src || "");
          previewImg.src = newSrc;

          updateMetadataForImage(target);
          updateDeveloperForImage(target);

          // Reset zoom to original size via the same behavior used by the button
          try {
            if (typeof zoomResetBtn !== "undefined" && zoomResetBtn) {
              zoomResetBtn.click();
            }
          } catch (zoomErr) {
            logDebug(2, "⚠️ Could not trigger zoom reset on navigation:", zoomErr?.message || zoomErr);
          }

          logDebug(2, "🧭 Image Inspector navigation: moved to index", navigationIndex);
          return;
        }

        attempts++;
      }

      // If we reached here, no valid image was found
      showUserMsgSafe("⚠️ Could not navigate to another valid image.", "error");
      logDebug(1, "⚠ Image Inspector: no valid images found during navigation.");
    }

    // Mounting order
    shadow.appendChild(css);
    root.appendChild(header);
    root.appendChild(desc);
    root.appendChild(closeBtn);

    const scrollContainer = scroll; // Alias for clarity

    // New order: Preview → Metadata → Developer (if enabled)
    scrollContainer.appendChild(s3Wrap);
    scrollContainer.appendChild(s1Wrap);

    // Developer block (if enabled)
    if (devWrap) {
      scrollContainer.appendChild(devWrap);
    }

    root.appendChild(scrollContainer);
    shadow.appendChild(root);

    document.body.appendChild(host);
    inspectorPanelRoot = host;

    showUserMsgSafe("🕵️ Inspector panel opened.", "info");

    // Actions: open/save
    openBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      tryOpenImageInNewTab(src);
    });

    // Save action
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      trySaveImage(src);
    });

    // Navigation: previous image
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      navigateBy(-1);
    });

    // Navigation: next image
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      navigateBy(+1);
    });

    // Zoom/Pan
    attachZoomPanBehavior({ frame, previewImg, zoomHint, zoomInBtn, zoomOutBtn, zoomResetBtn });

  } catch (err) {
    logDebug(1, "❌ openInspectorPanelForImage:", err?.message || err);
    logDebug(3, `🐛 Stacktrace: ${err.stack}`);
  }
}

// Remove inspector panel if open
function removeInspectorPanel() {
  if (!inspectorPanelRoot) return;
  try { inspectorPanelRoot.remove(); } catch (_) {}
  inspectorPanelRoot = null;
}

// Refresh Dev Block if open (after iiDevMode change)
function refreshDevBlockIfOpen() {
  if (inspectorPanelRoot && overlayTargetImg) {
    const img = overlayTargetImg;
    removeInspectorPanel();
    openInspectorPanelForImage(img);
  }
}

// Open image in new tab, with URL scheme check
function tryOpenImageInNewTab(url) {
  try {
    if (!/^https?:\/\//i.test(url)) {
      showUserMsgSafe("❌ Unable to open image (invalid URL scheme).", "error");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    showUserMsgSafe("🔗 Image opened in new tab.", "info");
  } catch (err) {
    showUserMsgSafe("❌ Unable to open image.", "error");
    logDebug(1, "❌ tryOpenImageInNewTab:", err?.message || err);
    logDebug(3, `🐛 Stacktrace: ${err.stack}`);
  }
}

// Robust handling aligned with fallbackSave, using showUserMsgSafe + logDebug.
function trySaveImage(url) {
  try {
    chrome.runtime.sendMessage(
      { action: "imageInspectorSaveImage", imageUrl: url, source: "imageInspector" },
      (resp) => {

        // 1) Messaging error (MV3 may report port-close errors even after handling)
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message || "";
          logDebug(1, "❌ trySaveImage lastError:", msg);

          // Some MV3 errors are benign: the background may have processed the request
          // but the response channel was closed before we got a payload.
          if (msg.includes("The message port closed before a response was received")) {
            logDebug(2, "ℹ️ Non-fatal messaging error; assuming download started correctly.");
            handleSaveSuccess();
            return;
          }

          // For other errors, keep a clear user-facing error.
          showUserMsgSafe("❌ Could not start download.", "error");
          return;
        }

        // 2) Explicit success:true
        if (resp && resp.success === true) {
          handleSaveSuccess();
          return;
        }

        // 3) Explicit success:false
        if (resp && resp.success === false) {
          const errMsg = resp.errorMessage ? String(resp.errorMessage) : "Could not start download.";
          showUserMsgSafe("❌ " + errMsg, "error");
          logDebug(1, "⚠ trySaveImage explicit failure:", resp);
          return;
        }

        // 4) No explicit response → assume success
        // Many handlers start download but do not return payload.
        // We do not show error; assume background started it.
        logDebug(2, "ℹ️ No explicit response from background; assuming download started.");
        handleSaveSuccess();
      }
    );
  } catch (err) {
    // Only catch truly unexpected exceptions in the content script.
    showUserMsgSafe("❌ Could not start download.", "error");
    logDebug(1, "❌ trySaveImage error:", err?.message || err);
    logDebug(3, `🐛 Stacktrace: ${err.stack}`);
  }
}

// Robust fallbackSave (no false negatives on silent success)
// Updated to use the dedicated Image Inspector action and avoid cross-flow interference.
function fallbackSave(url) {
  try {
    // Send imageInspectorSaveImage message to background
    chrome.runtime.sendMessage(
      { action: "imageInspectorSaveImage", imageUrl: url, source: "imageInspector-fallback" },
      (resp2) => {

        // 1) Messaging error
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message || "";
          logDebug(1, "❌ fallbackSave lastError:", msg);

          // Same rationale as trySaveImage: avoid false negatives on benign MV3 errors.
          if (msg.includes("The message port closed before a response was received")) {
            logDebug(2, "ℹ️ Non-fatal messaging error in fallback; assuming download started correctly.");
            handleSaveSuccess();
            return;
          }

          showUserMsgSafe("❌ Could not start download.", "error");
          return;
        }

        // 2) Explicit response with success:true → success
        if (resp2 && resp2.success === true) {
          handleSaveSuccess();
          return;
        }

        // 3) Explicit response with success:false -> display the error message from background
        if (resp2 && resp2.success === false) {
          const errMsg = resp2.errorMessage ? String(resp2.errorMessage) : "Could not start download.";
          showUserMsgSafe("❌ " + errMsg, "error");
          logDebug(1, "⚠ fallback download explicit failure:", resp2);
          return;
        }

        // 4) No explicit response → assume success
        // many handlers start download but do not return payload.
        // we do not show error; assume background started it.
        logDebug(2, "ℹ️ No explicit response from background; assuming download started.");
        handleSaveSuccess();
      }
    );
  } catch (err) {
    showUserMsgSafe("❌ Could not start download.", "error");
    logDebug(1, "❌ fallbackSave error:", err?.message || err);
    logDebug(3, `🐛 Stacktrace: ${err.stack}`);
  }
}

// Handle post-save success actions (UI-only for the inspector panel).
// Tab closing is handled exclusively in background.js based on imageInspectorCloseOnSave.
function handleSaveSuccess() {
  try {
    showUserMsgSafe("✅ Image saved successfully.", "info");
    logDebug(2, "✅ Image Inspector: save success reported to user (tab closing handled in background).");
  } catch (err) {
    logDebug(1, "❌ handleSaveSuccess error:", err?.message || err);
  }
}

// Infer file type from URL extension, with basic mapping
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

// Zoom/Pan helper, attached to preview image
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.25;

// Attach zoom and pan behavior to preview image
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

  // Initial measurement
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

  // Clamping helpers
  function clampZoom(z) { return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z)); }
  
  // Clamp offsets to prevent empty space in frame
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

  // Update zoom label
  function updateZoomLabel() {
    if (zoomHint) {
      zoomHint.textContent = `Zoom: ${currentZoom.toFixed(2)}× (min ${ZOOM_MIN.toFixed(2)}×, max ${ZOOM_MAX.toFixed(2)}×) — drag to pan when zoomed in`;
    }
  }

  // Apply transform
  function applyTransform() {
    previewImg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${currentZoom})`;
  }

  // Apply zoom changes
  function applyZoom() {
    clampOffsets();
    applyTransform();
    updateZoomLabel();
    const pannable = currentZoom > 1 && (baseImgW * currentZoom > frameW + 1 || baseImgH * currentZoom > frameH + 1);
    previewImg.style.cursor = pannable ? "grab" : "default";
  }

  // Zoom by delta
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

  // Reset zoom to original size (1.0, no offsets)
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      currentZoom = 1.0;
      offsetX = 0;
      offsetY = 0;
      applyZoom(); // Reuses existing logic: label update + cursor state + clamping
    });
  }

  // Mouse events
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

  // Mouse move
  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    offsetX = startOffsetX + dx;
    offsetY = startOffsetY + dy;
    clampOffsets();
    applyTransform();
  }

  // Mouse up / leave
  function onMouseUpLeave() {
    if (!isDragging) return;
    isDragging = false;
    const pannable = currentZoom > 1;
    previewImg.style.cursor = pannable ? "grab" : "default";
  }

  // Touch events
  function getTouchPoint(ev) {
    if (!ev.touches || ev.touches.length === 0) return null;
    const t = ev.touches[0];
    return { x: t.clientX, y: t.clientY };
  }

  // Touch start
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

  // Touch move
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

  // Touch end / cancel
  function onTouchEndCancel() {
    if (!isDragging) return;
    isDragging = false;
  }

  // Event listeners
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

  // Re-measure on image load and window resize
  if (previewImg && !previewImg.complete) {
    previewImg.addEventListener("load", () => { measureBaseGeometry(); applyZoom(); }, { once: true });
  }
  window.addEventListener("resize", () => { measureBaseGeometry(); applyZoom(); }, { passive: true });
}

// Boot script, initialize config and attach keydown listener
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
