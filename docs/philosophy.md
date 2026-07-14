# 🏔️ Mass Image Downloader – Project Philosophy

Mass Image Downloader is more than a tool for downloading images. It is a **well‑structured software engineering project** guided by a clear set of principles that shape every line of code, every design decision, and every contribution.

---

## 🎯 Core Principles

### 1. Reliability Above All

The extension is built to **keep working even under adverse conditions**:

- Automatic recovery after extension reloads (configuration rehydration, toast reinjection from the background).
- Explicit handling of invalidated context errors in Manifest V3.
- Retry with backoff for script injection into frames that are not ready yet.
- No assumption that page content or browser state is stable – continuous validation.

### 2. Granular User Control

The user is at the centre of the experience:

- Dozens of configurable options: image formats, naming modes, download limits, gallery grouping, similarity thresholds, etc.
- Multiple extraction flows adapted to different page types (bulk, visual, linked, web-linked).
- Clear visual feedback (toasts) with the option to disable it if preferred.

### 3. Performance and Efficiency

The extension is optimised not to overload the browser:

- Concurrency control for downloads and tab opening.
- Early filtering of small images (HEAD requests).
- Configuration caching to avoid unnecessary storage access.
- Rate limiting for gallery processing to prevent blocking.

### 4. Security and Privacy

Browser limits and minimal permissions are respected:

- No code injection into restricted pages (chrome://, edge://, about:blank).
- URL normalisation to remove tracking parameters (when allowed).
- No storage of sensitive user data.
- Logs do not expose private information.

### 5. Transparency and Debuggability

Development and operation are traceable:

- Four‑level logging system (0–3) for easy diagnosis.
- Clear, professional, and actionable user messages (prefixed with `MID:`).
- Automated validation (`npm run check`, `npm test`) and detailed contribution guidelines.

### 6. Quality and Maintainability

The code is designed to last and evolve:

- Strict modularity (1 file = 1 responsibility).
- Consistent coding standards (JSDoc, emoji‑based logs, naming conventions).
- Controlled branch flow (`feature/chore → dev → main → tag`).
- Automated tests and compliance checks.
- Exhaustive documentation and contribution guides.

### 7. Open Collaboration and Ethics

Community participation is actively encouraged:

- Transparent use of AI tools (Copilot, ChatGPT, etc.) with explicit declaration.
- Clear policies for bugs, features, investigations, and edge cases.
- Rigorous labelling system to prioritise and classify work.
- Peer review and codeowners.

---

## 🎯 In Summary

Mass Image Downloader is not just a tool – it is a **project that values robustness, user control, performance, security, quality, and community**. Every contribution, big or small, helps maintain these principles and improve the experience for everyone.

> *“Build something reliable, give users the control they need, and keep the code clean and collaborative.”* – That is the spirit of Mass Image Downloader.