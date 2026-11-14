# 🏔️ Mass Image Downloader – Accessibility Statement

**Mass Image Downloader** is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

## 🧭 Conformance Status

The extension strives to conform with the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level, adapted to the specific context of browser extensions and Manifest V3 architecture.

## ⌨️ Keyboard Navigation

The extension is designed to be fully operable via keyboard for users who cannot use a mouse.

- **Global Hotkeys:** All major workflows can be triggered without touching the mouse:
  - `Alt + Shift + D`: Bulk Image Download.
  - `Alt + Shift + V`: Extract Visual Gallery.
  - `Alt + Shift + G`: Extract Gallery (Direct Links).
  - `Alt + Shift + W`: Extract Web-linked Gallery.
  - `Alt + Shift + I`: Toggle One-click Download Icon.
  - `Ctrl + Shift + M`: Toggle Image Inspector Mode.
  - `Alt + Shift + S`: Toggle Settings Peek.
- **Popup & Options UI:** All interactive elements (buttons, inputs, toggles) in the extension popup and the Options page are reachable and operable using the `Tab`, `Shift+Tab`, `Space`, and `Enter` keys.
- **Focus Indicators:** Visible focus rings are maintained on all interactive controls to help keyboard users track their position.

## ️ 🕵️ Image Inspector & Shadow DOM

The Image Inspector panel is built using the **Shadow DOM** to prevent style leakage and ensure consistent rendering. 

- **Screen Readers:** While Shadow DOM provides strong encapsulation, we ensure that the host element and interactive controls (zoom, navigation, save) include appropriate `aria-label` attributes to convey their purpose to assistive technologies.
- **Preview & Metadata:** The image preview and metadata sections update dynamically. We rely on standard HTML semantics within the shadow root to ensure structural clarity.

## ⚪ Visual Design & Contrast

The extension adheres to a strict, documented color palette to ensure readability and clear distinction between states:

- **Primary Actions & Info:** `#007EE3` (Blue)
- **Errors & Recovery:** `#d9534f` (Red)
- **Text on Colored Surfaces:** `#FFFFFF` (White)
- **Body Text:** `#3f3f3f` (Dark Gray)

This palette is chosen to provide sufficient contrast ratios against both light (`#F8F8F8`) and dark surfaces, accommodating users with low vision or color blindness.

##  🗣️ Feedback & Notifications

- **Toast Notifications:** Visual toasts provide real-time feedback (success, error, progress). 
- **Auditory/Screen Reader Fallback:** While toasts are primarily visual, the extension logs all user-facing messages to the browser console with the prefix `[Mass image downloader]:`, allowing advanced users or assistive tools monitoring the console to track progress.

## 📄 Feedback & Reporting

We welcome your feedback on the accessibility of Mass Image Downloader. Your input helps us build a more inclusive tool for everyone.

### 🐛 Reporting Accessibility Issues

If you encounter an accessibility barrier or have suggestions for improvement:

1. **Open a Bug Report Issue** on GitHub using the `[Bug]` template.
2. **Clearly state** in the issue description that it is an **accessibility issue**.
3. **Specify the assistive technology** you are using (e.g., NVDA, JAWS, VoiceOver, TalkBack, keyboard-only navigation).
4. **Include your browser version** and extension version (found in `manifest.json`).
5. **Provide reproducible steps** and, if possible, screenshots or screen recordings.

We will review your report and work to provide an accessible alternative or fix the issue in a future release.

### 🔍 Reviewing Proposed Features & Enhancements

We believe accessibility should be considered from the start, not as an afterthought. You can actively participate in shaping the extension's accessibility by reviewing and validating proposed features:

#### 🛠️ Check Open Issues

- Visit our **[GitHub Issues](https://github.com/del-Pacifico/Mass-Image-Downloader/issues)** page.
- Look for issues labeled with `type: feature` or `type: enhancement`.
- Filter by the `scope: accessibility` label (when available) to find accessibility-related proposals.
- **Comment on issues** to share your perspective, especially if a proposed feature might impact users with disabilities.

#### 💬 Participate in Discussions

- Visit our **[GitHub Discussions](https://github.com/del-Pacifico/Mass-Image-Downloader/discussions)** page.
- Browse the **"Ideas"** category for early-stage proposals.
- **Share your feedback** on how proposed features could be made more accessible.
- **Suggest alternatives** if a proposed approach might create barriers for certain users.

#### ✅ Validate Accessibility in Pre-Release Testing

- When new features are announced in Discussions or marked as `status: ready-for-qa` in Issues, we encourage users who rely on assistive technologies to **test early builds** (when available).
- Report your findings using the Bug Report template above.
- Your validation helps us catch accessibility issues before they reach the stable release.

### 🤝 Collaboration & Transparency

All accessibility-related work is tracked publicly:

- **Completed fixes** are documented in the [CHANGELOG.md](CHANGELOG.md) under the `Fixed` section.
- **Planned improvements** are listed in the [docs/ROADMAP.md](docs/ROADMAP.md) with explicit scope and QA gates.
- **Design decisions** and trade-offs are explained in the [docs/advanced-manual/README.md](docs/advanced-manual/README.md).

> We are committed to transparency and will always credit contributors who help identify and resolve accessibility issues.
