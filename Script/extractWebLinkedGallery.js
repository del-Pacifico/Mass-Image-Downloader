// # This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// # If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/
// #
// # Original Author: Sergio Palma Hidalgo
// # Project URL: https://github.com/del-Pacifico/Mass-Image-Downloader
// # Copyright (c) 2025 Sergio
// # All rights reserved.

/*
[Mass image downloader]: 🧩 Image Inspector Mode
Phase: F1 + F2 Step 2b + F3 + F3.1 + F3.1b (UX aligned to Peek + hardened error handling)

What this content script does:
- Toggle Image Inspector Mode with Ctrl+Shift+M.
- While active:
  - Cursor becomes 'help' on page content.
  - On hover over <img>, show ℹ️ overlay (top-right of the image’s bounding parent).
  - Clicking ℹ️ opens a right-docked panel ("Mass Image Downloader — Image Inspector").
- Panel content order (aligned to Peek UX):
  1) Mode: Visible Metadata  (two-column table)
  2) Mode: Developer         (two-column table, gated by imageInspectorDevMode)
  3) Preview (selected image)
  4) Actions (buttons identical to Peek's primary style): 🔗 Open | 💾 Save
- Panel is excluded from inspection: no ℹ️ inside panel; cursor inside panel is normal.
- Uses global showMessage(text, type?) for user toasts (same function as Peek). Types: "info" (default) | "error".
- Reads options from chrome.storage.sync: debugLogLevel, imageInspectorEnabled, imageInspectorDevMode.
- HEAD requests are abortable (3s timeout). Privacy-first: never expose blob:/data:/file: URLs.

Hardening (F3.1b):
- Defensive clearTimeout on OFF/detach.
- Panel creation/render wrapped in try/catch with user feedback.
- Overlay lifecycle guarded with isConnected checks and try/catch.
- HEAD result unified with HEAD_EMPTY defaults.
- New-tab popup block detection message.
- Save action surfaces background errorMessage if present.
*/

(() => {
    "use strict";

    // ------------------------------------------------------------
    // 0) Internal state / cached config
    // ------------------------------------------------------------

    let debugLogLevelCache = 1;
    const configCache = {
        imageInspectorEnabled: true,   // feature flag from Options (default true)
        imageInspectorDevMode: false,  // developer fields in panel
        throttleMs: 100                // hover throttle window
    };

    let isModeActive = false;
    let hoverTimer = null;

    const OVERLAY_CLASS  = "mid-inspector-overlay";
    const OVERLAY_ATTR   = "data-mid-inspector";
    const RELATIVE_CLASS = "mid-inspector-rel";

    let inspectorPanelEl = null;
    let inspectorEscListenerBound = false;
    const INSPECTOR_PANEL_ID = "__mdi_imageInspectorPanel";

    const HEAD_EMPTY = Object.freeze({
        mime: "unknown",
        sizeText: "unknown",
        headState: "blocked",
        cacheCtl: "",
        etag: "",
        diag: ""
    });

    // ------------------------------------------------------------
    // 1) Logging helper (project-style)
    // ------------------------------------------------------------

    /*
    logDebug(levelOrMsg, ...args)

    Behavior:
    - If first arg is a number between 1 and 3, that's the required log level.
    - Otherwise we default to level 1.
    - We only log if that level <= debugLogLevelCache.
    */
    function logDebug(levelOrMsg, ...args) {
        try {
            let level = 1;
            let payload = [];

            if (typeof levelOrMsg === "number" && levelOrMsg >= 1 && levelOrMsg <= 3) {
                level = levelOrMsg;
                payload = args;
            } else {
                level = 1;
                payload = [levelOrMsg, ...args];
            }

            if (level <= debugLogLevelCache) {
                console.log("[Mass image downloader]:", ...payload);
            }
        } catch (err) {
            console.log("[Mass image downloader]: ❌ Logging error:", err?.message || err);
        }
    }

    // ------------------------------------------------------------
    // 2) Config bootstrap + live sync
    // ------------------------------------------------------------

    function initConfigForImageInspector(cb) {
        try {
            chrome.storage.sync.get(
                ["debugLogLevel", "imageInspectorEnabled", "imageInspectorDevMode"],
                (data) => {
                    debugLogLevelCache = parseInt(data.debugLogLevel ?? 1);
                    configCache.imageInspectorEnabled = (data.imageInspectorEnabled !== false); // default true
                    configCache.imageInspectorDevMode = (data.imageInspectorDevMode === true);  // default false

                    logDebug(
                        1,
                        "🧩 Image Inspector Mode config loaded:",
                        JSON.stringify({
                            debugLogLevel: debugLogLevelCache,
                            imageInspectorEnabled: configCache.imageInspectorEnabled,
                            imageInspectorDevMode: configCache.imageInspectorDevMode
                        })
                    );

                    if (typeof cb === "function") cb();
                }
            );
        } catch (err) {
            console.log(
                "[Mass image downloader]: ❌ Failed to init Image Inspector config:",
                err?.message || err
            );
            if (typeof cb === "function") cb();
        }
    }

    if (chrome?.storage?.onChanged) {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== "sync") return;

            if (changes.debugLogLevel) {
                debugLogLevelCache = parseInt(changes.debugLogLevel.newValue ?? 1);
                logDebug(2, "🔄 debugLogLevel updated:", debugLogLevelCache);
            }

            if (changes.imageInspectorEnabled) {
                const newEnabled = (changes.imageInspectorEnabled.newValue !== false);
                configCache.imageInspectorEnabled = newEnabled;
                logDebug(2, "🔄 imageInspectorEnabled updated:", newEnabled);

                if (!newEnabled && isModeActive) {
                    toggleInspector("options-change", true /*forceOff*/);
                }
            }

            if (changes.imageInspectorDevMode) {
                configCache.imageInspectorDevMode = (changes.imageInspectorDevMode.newValue === true);
                logDebug(2, "🔄 imageInspectorDevMode updated:", configCache.imageInspectorDevMode);
                tryToggleDevSectionVisibility();
            }
        });
    }

    // ------------------------------------------------------------
    // 3) User messaging (reuse Peek's showMessage)
    // ------------------------------------------------------------

    /*
    showMessage(text, type?) is expected to exist globally (as in Peek).
    type: "info" (default) | "error"
    If not present, we fall back to console log to avoid hard crashes.
    */
    function safeShowMessage(text, type = "info") {
        try {
            if (typeof window.showMessage === "function") {
                window.showMessage(text, type);
            } else {
                console.log("[Mass image downloader]: 🔔", type.toUpperCase(), text);
            }
        } catch (err) {
            console.log("[Mass image downloader]: ❌ showMessage failed:", err?.message || err);
        }
    }

    // ------------------------------------------------------------
    // 4) Overlay lifecycle helpers
    // ------------------------------------------------------------

    function isImgElement(node) {
        return node && node.tagName === "IMG";
    }

    // Standard path: position overlay relative to the image's parent
    function ensureRelativeParent(img) {
        const parent = img.parentElement;
        if (!parent) return null;

        const computed = window.getComputedStyle(parent);
        if (computed.position === "static") {
            parent.dataset.midOriginalPosition = parent.style.position || "";
            parent.classList.add(RELATIVE_CLASS);
            parent.style.position = "relative";
        }

        return parent;
    }

    function restoreParentPosition(img) {
        const parent = img?.parentElement;
        if (!parent) return;

        if (parent.classList.contains(RELATIVE_CLASS)) {
            const original = parent.dataset.midOriginalPosition || "";
            parent.style.position = original;
            parent.classList.remove(RELATIVE_CLASS);
            delete parent.dataset.midOriginalPosition;
        }
    }

    function createOverlayButton(imgEl) {
        const btn = document.createElement("button");
        btn.setAttribute(OVERLAY_ATTR, "info");
        btn.className = OVERLAY_CLASS;
        btn.type = "button";
        btn.title = "Image info";
        btn.setAttribute("aria-label", "Image info");

        btn.style.position = "absolute";
        btn.style.top = "6px";
        btn.style.right = "6px";
        btn.style.zIndex = "2147483647";
        btn.style.border = "none";
        btn.style.padding = "0";
        btn.style.margin = "0";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "18px";
        btn.style.lineHeight = "1";
        btn.style.background = "transparent";
        btn.style.filter = "drop-shadow(0 1px 1px rgba(0,0,0,0.25))";
        btn.style.userSelect = "none";
        btn.style.transition = "transform .12s ease, opacity .12s ease";
        btn.style.transform = "scale(0.9)";
        btn.style.opacity = "0.0";

        btn.textContent = "ℹ️";

        requestAnimationFrame(() => {
            btn.style.transform = "scale(1)";
            btn.style.opacity = "1";
        });

        btn.addEventListener(
            "click",
            (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                logDebug(1, "ℹ️ Inspector icon clicked. Opening panel for this image.");
                openInspectorPanelForImage(imgEl);
            },
            { capture: true }
        );

        return btn;
    }

    function removeOverlayFor(img) {
        try {
            if (!img || !img.parentElement || !img.isConnected) return;
            const parent = img.parentElement;
            const overlay = parent.querySelector(`.${OVERLAY_CLASS}[${OVERLAY_ATTR}="info"]`);
            if (overlay) overlay.remove();
            restoreParentPosition(img);
        } catch (err) {
            logDebug(1, "⚠ Failed to remove overlay:", err?.message || err);
        }
    }

    function removeAllOverlays() {
        try {
            document
                .querySelectorAll(`.${OVERLAY_CLASS}[${OVERLAY_ATTR}="info"]`)
                .forEach((btn) => { try { btn.remove(); } catch (_) {} });

            document.querySelectorAll(`.${RELATIVE_CLASS}`).forEach((parentEl) => {
                try {
                    const original = parentEl.dataset.midOriginalPosition || "";
                    parentEl.style.position = original;
                    parentEl.classList.remove(RELATIVE_CLASS);
                    delete parentEl.dataset.midOriginalPosition;
                } catch (_) {}
            });
        } catch (err) {
            logDebug(1, "⚠ Failed to remove all overlays:", err?.message || err);
        }
    }

    // ------------------------------------------------------------
    // 5) Panel shell (position, header, close)
    // ------------------------------------------------------------

    function buildInspectorPanelElement() {
        try {
            let panel = document.getElementById(INSPECTOR_PANEL_ID);
            if (panel) return panel;

            if (!document || !document.body) {
                logDebug(1, "⚠ Document body is not available for panel.");
                safeShowMessage("❌ Unable to render Image Inspector panel", "error");
                return null;
            }

            panel = document.createElement("div");
            panel.id = INSPECTOR_PANEL_ID;

            // Shell: fixed dock on the right, matches Peek positioning spirit
            panel.style.position = "fixed";
            panel.style.top = "0";
            panel.style.right = "0";
            panel.style.width = "25%";
            panel.style.height = "100%";
            panel.style.zIndex = "2147483647";
            panel.style.backgroundColor = "#F8F8F8";
            panel.style.borderLeft = "1px solid #ccc";
            panel.style.boxShadow = "0 0 12px rgba(0,0,0,0.4)";
            panel.style.display = "flex";
            panel.style.flexDirection = "column";
            panel.style.fontFamily = "sans-serif";
            panel.style.cursor = "default"; // do not inherit 'help' inside panel

            // Header (title + close)
            const header = document.createElement("div");
            header.style.display = "flex";
            header.style.alignItems = "center";
            header.style.justifyContent = "space-between";
            header.style.padding = "10px 12px";
            header.style.backgroundColor = "#F8F8F8";
            header.style.borderBottom = "1px solid #ccc";

            const titleEl = document.createElement("div");
            titleEl.textContent = "Mass Image Downloader — Image Inspector";
            titleEl.style.fontSize = "14px";
            titleEl.style.fontWeight = "600";
            titleEl.style.color = "#121b3e";

            const closeBtn = document.createElement("button");
            closeBtn.textContent = "×";
            closeBtn.title = "Close";
            closeBtn.setAttribute("aria-label", "Close panel");
            // Style identical to Peek's primary button (like "Close settings peek"):
            closeBtn.style.fontWeight = "bold";
            closeBtn.style.fontSize = "14px";
            closeBtn.style.lineHeight = "14px";
            closeBtn.style.width = "24px";
            closeBtn.style.height = "24px";
            closeBtn.style.borderRadius = "4px";
            closeBtn.style.border = "2px solid #768591";
            closeBtn.style.backgroundColor = "#007EE3";
            closeBtn.style.color = "#fff";
            closeBtn.style.cursor = "pointer";
            closeBtn.style.display = "flex";
            closeBtn.style.alignItems = "center";
            closeBtn.style.justifyContent = "center";

            closeBtn.addEventListener("mouseenter", () => {
                closeBtn.style.backgroundColor = "#fff";
                closeBtn.style.color = "#007EE3";
            });
            closeBtn.addEventListener("mouseleave", () => {
                closeBtn.style.backgroundColor = "#007EE3";
                closeBtn.style.color = "#fff";
            });
            closeBtn.addEventListener("click", (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                removeInspectorPanel();
            });

            header.appendChild(titleEl);
            header.appendChild(closeBtn);

            const body = document.createElement("div");
            body.id = "__mdi_imageInspectorContent";
            body.style.flex = "1 1 auto";
            body.style.overflowY = "auto";
            body.style.padding = "12px";
            body.style.fontSize = "12px";
            body.style.lineHeight = "1.4";
            body.style.color = "#121b3e";
            body.textContent = "No image selected yet.";

            panel.appendChild(header);
            panel.appendChild(body);

            document.body.appendChild(panel);
            inspectorPanelEl = panel;

            bindInspectorEscToClose();
            return panel;
        } catch (err) {
            logDebug(1, "❌ Failed to build inspector panel:", err?.message || err);
            safeShowMessage("❌ Unable to render Image Inspector panel", "error");
            return null;
        }
    }

    function bindInspectorEscToClose() {
        if (inspectorEscListenerBound) return;
        inspectorEscListenerBound = true;
        document.addEventListener("keydown", escKeyHandlerForInspector, true);
    }

    function unbindInspectorEscToClose() {
        if (!inspectorEscListenerBound) return;
        inspectorEscListenerBound = false;
        document.removeEventListener("keydown", escKeyHandlerForInspector, true);
    }

    function escKeyHandlerForInspector(e) {
        if (e.key === "Escape") {
            removeInspectorPanel();
        }
    }

    function removeInspectorPanel() {
        try {
            const panel = document.getElementById(INSPECTOR_PANEL_ID);
            if (panel && panel.parentNode) {
                panel.parentNode.removeChild(panel);
            }
            // Placeholder for future internal refs cleanup
        } catch (err) {
            logDebug(1, "⚠ Failed to remove inspector panel:", err?.message || err);
        }
        inspectorPanelEl = null;
        unbindInspectorEscToClose();
    }

    function tryToggleDevSectionVisibility() {
        const devGroup = document.getElementById("__mdi_devGroup");
        if (!devGroup) return;
        devGroup.style.display = configCache.imageInspectorDevMode ? "" : "none";
    }

    // ------------------------------------------------------------
    // 6) Metadata helpers
    // ------------------------------------------------------------

    function collectBasicImageMeta(imgEl) {
        let rawSrc = "";
        try {
            rawSrc = imgEl.currentSrc || imgEl.src || "";
        } catch (_) {
            rawSrc = "";
        }

        let urlObj = null;
        let isLocalOrEmbedded = false;
        let host = "";
        let fileName = "";
        let ext = "";

        if (rawSrc) {
            try {
                urlObj = new URL(rawSrc);
                if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
                    host = urlObj.host || "";
                    const pathParts = urlObj.pathname.split("/");
                    fileName = pathParts[pathParts.length - 1] || "";
                    fileName = fileName.split("?")[0].split("&")[0];
                    const dotIdx = fileName.lastIndexOf(".");
                    if (dotIdx !== -1 && dotIdx < fileName.length - 1) {
                        ext = fileName.slice(dotIdx + 1).toLowerCase(); // "jpg" (no dot)
                    }
                } else {
                    isLocalOrEmbedded = true;
                }
            } catch (_) {
                isLocalOrEmbedded = true;
            }
        }

        const width = imgEl.naturalWidth || 0;
        const height = imgEl.naturalHeight || 0;

        // On-page rect
        const r = imgEl.getBoundingClientRect();
        const onW = Math.max(0, Math.round(r.width));
        const onH = Math.max(0, Math.round(r.height));
        let percentTxt = "(N/A)";
        if (width > 0 && height > 0 && onW > 0 && onH > 0) {
            const naturalArea = width * height;
            const renderArea  = onW * onH;
            const percent = Math.round((renderArea / naturalArea) * 100);
            percentTxt = `${percent}%`;
        }

        // Title candidates (img.title -> figcaption)
        let titleText = (imgEl.title || "").trim();
        if (!titleText) {
            try {
                const fig = imgEl.closest("figure");
                if (fig) {
                    const cap = fig.querySelector("figcaption");
                    if (cap) titleText = (cap.textContent || "").trim();
                }
            } catch (_) { /* ignore */ }
        }
        if (!titleText) titleText = "[ No title ]";

        // Description from alt
        let descText = (imgEl.alt || "").trim();
        if (!descText) descText = "[ No description ]";

        return {
            src: rawSrc,
            isLocalOrEmbedded,
            host,
            fileName,
            ext,             // without dot, e.g. "jpg"
            width, height,   // natural
            onW, onH,        // rendered
            percentTxt,      // "(N/A)" or "65%"
            titleText,
            descText
        };
    }

    async function fetchHeadInfoWithTimeout(url) {
        let isHttp = false;
        try {
            const u = new URL(url);
            isHttp = (u.protocol === "http:" || u.protocol === "https:");
        } catch (_) {
            return { ...HEAD_EMPTY, headState: "blocked", diag: "bad url" };
        }
        if (!isHttp) return { ...HEAD_EMPTY, headState: "blocked", diag: "non-http(s)" };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            try { controller.abort(); } catch (_) {}
        }, 3000);

        try {
            const response = await fetch(url, { method: "HEAD", mode: "cors", signal: controller.signal });

            clearTimeout(timeoutId);

            const mime = response.headers.get("Content-Type") || "unknown";
            const lenRaw = response.headers.get("Content-Length");
            const cacheCtl = response.headers.get("Cache-Control") || "";
            const etag = response.headers.get("ETag") || "";

            let sizeText = "unknown";
            if (lenRaw && !isNaN(parseInt(lenRaw, 10))) {
                const bytes = parseInt(lenRaw, 10);
                if (bytes < 1024) {
                    sizeText = bytes + " B";
                } else if (bytes < 1024 * 1024) {
                    const kb = (bytes / 1024).toFixed(1);
                    sizeText = kb + " KB";
                } else {
                    const mb = (bytes / (1024 * 1024)).toFixed(2);
                    sizeText = mb + " MB";
                }
            }

            return { mime, sizeText, headState: "ok", cacheCtl, etag, diag: "" };
        } catch (err) {
            clearTimeout(timeoutId);
            logDebug(1, "⚠ HEAD request failed or timed out:", err?.message || err);
            return { ...HEAD_EMPTY, headState: "timeout", diag: (err?.message || "timeout") };
        }
    }

    // ------------------------------------------------------------
    // 7) Panel render (Peek-style) + actions
    // ------------------------------------------------------------

    function escHtml(s) {
        return String(s ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function primaryBtnStyle(btn) {
        // Identical to Peek's primary button (like "Close settings peek")
        btn.style.padding = "8px 10px";
        btn.style.borderRadius = "4px";
        btn.style.border = "2px solid #768591";
        btn.style.backgroundColor = "#007EE3";
        btn.style.color = "#fff";
        btn.style.fontSize = "12px";
        btn.style.cursor = "pointer";
        btn.addEventListener("mouseenter", () => {
            btn.style.backgroundColor = "#fff";
            btn.style.color = "#007EE3";
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.backgroundColor = "#007EE3";
            btn.style.color = "#fff";
        });
    }

    function twoColRow(label, valueHtml) {
        return `
            <tr>
                <td style="vertical-align:top; padding:6px 8px; font-weight:600; width:40%;">${label}</td>
                <td style="vertical-align:top; padding:6px 8px; word-break:break-all;">${valueHtml}</td>
            </tr>
        `;
    }

    async function openInspectorPanelForImage(imgEl) {
        const panel = buildInspectorPanelElement();
        if (!panel) {
            logDebug(1, "⚠ Panel could not be created. Aborting render.");
            safeShowMessage("❌ Image Inspector is not available on this page", "error");
            return;
        }

        const contentEl = document.getElementById("__mdi_imageInspectorContent");
        if (!contentEl) {
            logDebug(1, "⚠ Panel content element not found.");
            safeShowMessage("❌ Failed to render inspector content", "error");
            return;
        }

        // Intro text (under title)
        const introHtml = `
            <div style="margin: 6px 0 10px 0; color:#121b3e;">
                Inspect any image on this page. This panel shows safe, visible metadata and developer-level details.
                Use it to quickly verify source, size, and how the image is rendered.
            </div>
        `;

        // Collect basic (safe) metadata
        const basic = collectBasicImageMeta(imgEl);

        // HEAD info (http/https only)
        let head = { ...HEAD_EMPTY };
        try {
            head = await fetchHeadInfoWithTimeout(basic.src);
        } catch (err) {
            logDebug(1, "⚠ Failed to get HEAD info:", err?.message || err);
        }

        // Visible Metadata table
        const fileTypeHtml = `
            ${basic.ext ? escHtml(basic.ext) : "(unknown)"}${
                head.mime && head.mime !== "unknown" ? `  |  <strong>MIME-Type:</strong> ${escHtml(head.mime)}` : ""
            }
        `;

        const dimsHtml = `
            ${basic.width} × ${basic.height} px
            <span style="color:#768591;"> | On page:</span>
            ${basic.onW} × ${basic.onH} px
            <span style="color:#768591;"> (${basic.percentTxt})</span>
        `;

        const descHtml  = escHtml(basic.descText);
        const titleHtml = escHtml(basic.titleText);

        let imageUrlHtml = "";
        if (basic.isLocalOrEmbedded) {
            imageUrlHtml = `<span style="color:#768591;">⚠ Local or embedded source — full URL hidden for privacy.</span>`;
        } else {
            imageUrlHtml = `${escHtml(basic.src)}`;
        }

        const pageUrlHtml = escHtml(location.href);

        const visibleTableHtml = `
            <table style="width:100%; border-collapse:collapse; border:1px solid #ddd;">
                ${twoColRow("File type", fileTypeHtml)}
                ${twoColRow("Dimensions", dimsHtml)}
                ${twoColRow("Description", descHtml)}
                ${twoColRow("Title", titleHtml)}
                ${twoColRow("Image URL", imageUrlHtml)}
                ${twoColRow("Page URL", pageUrlHtml)}
            </table>
        `;

        // Developer Mode table (gated)
        const currentSrcHtml = escHtml(imgEl.currentSrc || "");
        const srcsetRaw = (imgEl.getAttribute("srcset") || "").trim();
        const sizesRaw  = (imgEl.getAttribute("sizes")  || "").trim();
        const srcsetShort = srcsetRaw.length > 180 ? (escHtml(srcsetRaw.slice(0, 180)) + "…") : escHtml(srcsetRaw);
        const sizesShort  = sizesRaw.length  > 180 ? (escHtml(sizesRaw.slice(0, 180))  + "…") : escHtml(sizesRaw);

        const attrs = [];
        const pushAttr = (n) => {
            const v = imgEl.getAttribute(n);
            if (v !== null && v !== undefined && v !== "") {
                attrs.push(`${n}="${escHtml(v)}"`);
            }
        };
        pushAttr("loading");
        pushAttr("decoding");
        pushAttr("fetchpriority");
        pushAttr("crossorigin");

        const nodeAttrsHtml = `IMG${attrs.length ? " " + attrs.join(" ") : ""}`;

        let cssObjFit = "—", cssDisplay = "—", cssVisibility = "—";
        try {
            const cs = getComputedStyle(imgEl);
            cssObjFit     = cs.objectFit || "—";
            cssDisplay    = cs.display || "—";
            cssVisibility = cs.visibility || "—";
        } catch (_) {}

        const hostCorsHtml = basic.isLocalOrEmbedded
            ? "(local/embedded)"
            : `${escHtml(basic.host || "(unknown host)")} — HEAD: ${escHtml(head.headState)}`;

        const devTableHtml = `
            <table style="width:100%; border-collapse:collapse; border:1px solid #ddd;">
                ${twoColRow("Node & attributes", nodeAttrsHtml)}
                ${twoColRow("Source set", srcsetShort || "—")}
                ${twoColRow("Sizes", sizesShort || "—")}
                ${twoColRow("Current source", currentSrcHtml || "—")}
                ${twoColRow("Natural vs device", \`natural: ${basic.width}×${basic.height} px | devicePixelRatio: \${window.devicePixelRatio || 1}\`)}
                ${twoColRow("Rendered CSS", \`object-fit: ${escHtml(cssObjFit)} | display: ${escHtml(cssDisplay)} | visibility: ${escHtml(cssVisibility)}\`)}
                ${twoColRow("Host & CORS", hostCorsHtml)}
                ${twoColRow("Content-Length", head.sizeText || "unknown")}
                ${head.cacheCtl ? twoColRow("Cache-Control", escHtml(head.cacheCtl)) : ""}
                ${head.etag ? twoColRow("ETag", escHtml(head.etag)) : ""}
                ${twoColRow("Diagnostics", head.diag ? escHtml(head.diag) : "—")}
            </table>
        `;

        // Preview block (after metadata)
        const previewHtml = `
            <div class="option-group">
                <h3>Preview</h3>
                <div>
                    <img src="${escHtml(basic.src)}" alt=""
                        style="max-width:100%; max-height:180px;
                               border:1px solid #ccc; border-radius:4px;
                               object-fit:contain; cursor:zoom-in;
                               transition:transform .15s ease;"
                        onmouseover="this.style.transform='scale(1.2)';"
                        onmouseout="this.style.transform='scale(1)';"
                    />
                </div>
            </div>
        `;

        // Actions (buttons with emojis, Peek style)
        const actionsHtml = `
            <div class="option-group">
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button id="__mdi_btnOpenFull"></button>
                    <button id="__mdi_btnSaveImage"></button>
                </div>
                <div style="margin-top:6px; color:#768591; font-size:11px;">
                    (Actions respect global rules. Some URLs like blob:/data:/file: cannot be opened directly in a new tab.)
                </div>
            </div>
        `;

        const html = `
            <div class="global-options-wrapper">
                ${introHtml}

                <div class="option-group">
                    <h3>Mode: Visible Metadata</h3>
                    <p>Plain, safe and user-facing data about the selected image.</p>
                    ${visibleTableHtml}
                </div>

                <div class="option-group" id="__mdi_devGroup" style="${configCache.imageInspectorDevMode ? "" : "display:none;"}">
                    <h3>Mode: Developer</h3>
                    <p>Technical fields that help diagnose rendering and source behavior.</p>
                    ${devTableHtml}
                </div>

                ${previewHtml}
                ${actionsHtml}
            </div>
        `;

        try {
            contentEl.innerHTML = html;
        } catch (err) {
            logDebug(1, "❌ Failed to render panel content:", err?.message || err);
            safeShowMessage("❌ Failed to render inspector content", "error");
            return;
        }

        // Buttons: apply Peek primary style & wire handlers (with emojis in labels)
        const btnOpen = document.getElementById("__mdi_btnOpenFull");
        const btnSave = document.getElementById("__mdi_btnSaveImage");
        if (btnOpen) {
            btnOpen.textContent = "🔗 Open full image in new tab";
            primaryBtnStyle(btnOpen);
            btnOpen.addEventListener("click", (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                tryOpenInNewTab(basic.src);
            });
        }
        if (btnSave) {
            btnSave.textContent = "💾 Save image";
            primaryBtnStyle(btnSave);
            btnSave.addEventListener("click", (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                trySaveImage(basic.src);
            });
        }

        tryToggleDevSectionVisibility();
    }

    // ------------------------------------------------------------
    // 8) Actions
    // ------------------------------------------------------------

    function isHttpUrl(url) {
        try {
            const u = new URL(url);
            return (u.protocol === "http:" || u.protocol === "https:");
        } catch (_) {
            return false;
        }
    }

    function tryOpenInNewTab(url) {
        if (!url) {
            safeShowMessage("❌ No URL available for this image.", "error");
            return;
        }
        if (!isHttpUrl(url)) {
            safeShowMessage("ℹ️ This source cannot be opened directly in a new tab.");
            return;
        }
        try {
            const w = window.open(url, "_blank", "noopener");
            if (!w) {
                safeShowMessage("ℹ️ The browser blocked the new tab. Please allow pop-ups for this site.");
                logDebug(1, "⚠ window.open returned null (likely blocked).");
                return;
            }
            safeShowMessage("🔗 Opened image in a new tab.");
            logDebug(1, "🧭 Opened image in new tab:", url);
        } catch (err) {
            safeShowMessage("❌ Failed to open image in a new tab.", "error");
            logDebug(1, "❌ Failed to open image in new tab:", err?.message || err);
        }
    }

    function trySaveImage(url) {
        if (!url) {
            safeShowMessage("❌ No URL available to save.", "error");
            return;
        }
        try {
            chrome.runtime.sendMessage(
                { action: "manualDownloadImage", imageUrl: url },
                (resp) => {
                    if (chrome.runtime.lastError) {
                        logDebug(1, "❌ Runtime message error:", chrome.runtime.lastError.message);
                        safeShowMessage("❌ Could not trigger download (runtime error).", "error");
                        return;
                    }
                    if (resp && resp.success) {
                        safeShowMessage("💾 Image download started.");
                        logDebug(1, "💾 Download requested successfully.");
                    } else {
                        const errMsg = (resp && resp.errorMessage) ? String(resp.errorMessage) : "Could not start download.";
                        safeShowMessage("❌ " + errMsg, "error");
                        logDebug(1, "⚠ Download request did not succeed.", resp);
                    }
                }
            );
        } catch (err) {
            safeShowMessage("❌ Failed to request download.", "error");
            logDebug(1, "❌ Failed to request download:", err?.message || err);
        }
    }

    // ------------------------------------------------------------
    // 9) Hover handling with throttle (panel excluded)
    // ------------------------------------------------------------

    function onMouseOver(e) {
        if (!isModeActive) return;

        const target = e.target;
        if (!isImgElement(target)) return;

        // Ignore any <img> inside our own panel
        if (target.closest("#" + INSPECTOR_PANEL_ID)) return;

        try { clearTimeout(hoverTimer); } catch (_) {}
        hoverTimer = setTimeout(() => {
            if (!isModeActive) return;
            if (!isImgElement(target)) return;
            if (!target.isConnected) return;
            if (target.closest("#" + INSPECTOR_PANEL_ID)) return;

            const parent = ensureRelativeParent(target);
            if (!parent || !parent.isConnected) return;

            const already = parent.querySelector(`.${OVERLAY_CLASS}[${OVERLAY_ATTR}="info"]`);
            if (already) return;

            const overlayBtn = createOverlayButton(target);
            parent.appendChild(overlayBtn);
        }, configCache.throttleMs);
    }

    function onMouseOut(e) {
        if (!isModeActive) return;

        const from = e.target;
        if (!isImgElement(from)) return;
        if (from.closest("#" + INSPECTOR_PANEL_ID)) return;

        const to = e.relatedTarget;
        if (to && to.classList && to.classList.contains(OVERLAY_CLASS)) return;

        removeOverlayFor(from);
    }

    // ------------------------------------------------------------
    // 10) Mode toggling
    // ------------------------------------------------------------

    function setHelpCursor(active) {
        try {
            document.documentElement.style.cursor = active ? "help" : "";
        } catch (_) {}
    }

    function attachListeners() {
        document.addEventListener("mouseover", onMouseOver, true);
        document.addEventListener("mouseout", onMouseOut, true);
        logDebug(1, "🔗 Image Inspector listeners attached.");
    }

    function detachListeners() {
        document.removeEventListener("mouseover", onMouseOver, true);
        document.removeEventListener("mouseout", onMouseOut, true);
        // Defensive: ensure throttled hover won't fire after detach
        try { clearTimeout(hoverTimer); } catch (_) {}
        hoverTimer = null;
        logDebug(1, "🧹 Image Inspector listeners detached.");
    }

    /*
    toggleInspector(by, forceOff)
    - by: "hotkey" | "options-change"
    - forceOff: if true → always turn mode off
    */
    function toggleInspector(by = "hotkey", forceOff = false) {
        if (!configCache.imageInspectorEnabled) {
            logDebug(1, "🚫 Image Inspector Mode is disabled from Options. Toggle ignored.");
            safeShowMessage("ℹ️ Image Inspector is disabled in Options.");
            return;
        }

        isModeActive = forceOff ? false : !isModeActive;

        if (isModeActive) {
            setHelpCursor(true);
            attachListeners();
            logDebug(1, `🧠 Image Inspector Mode ENABLED via ${by}.`);
            safeShowMessage("✅ Image Inspector enabled");
        } else {
            detachListeners();
            removeAllOverlays();
            removeInspectorPanel();
            // Defensive: clear any pending hover timer on mode OFF
            try { clearTimeout(hoverTimer); } catch (_) {}
            hoverTimer = null;
            setHelpCursor(false);
            logDebug(1, `🧠 Image Inspector Mode DISABLED via ${by}.`);
            safeShowMessage("ℹ️ Image Inspector disabled");
        }
    }

    // ------------------------------------------------------------
    // 11) Hotkey & lifecycle
    // ------------------------------------------------------------

    function onKeyDown(e) {
        try {
            const isToggleCombo =
                e.code === "KeyM" &&
                e.ctrlKey &&
                e.shiftKey &&
                !e.altKey &&
                !e.metaKey;

            if (!isToggleCombo) return;

            e.preventDefault();
            e.stopPropagation();
            toggleInspector("hotkey");
        } catch (_) {}
    }

    function init() {
        initConfigForImageInspector(() => {
            try {
                window.addEventListener("keydown", onKeyDown, true);
                logDebug(1, "⚡ Image Inspector content script loaded (F3.1b). Use Ctrl+Shift+M to toggle.");
            } catch (err) {
                console.log(
                    "[Mass image downloader]: 💥 Failed to initialize Image Inspector Mode (F3.1b):",
                    err?.message || err
                );
            }
        });
    }

    init();

    window.addEventListener("unload", () => {
        try {
            if (isModeActive) {
                detachListeners();
                removeAllOverlays();
                removeInspectorPanel();
                setHelpCursor(false);
            }
            window.removeEventListener("keydown", onKeyDown, true);
        } catch (_) {}
    });
})();
