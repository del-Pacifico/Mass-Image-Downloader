# 🏔️ Mass Image Downloader – Advanced Manual

**Version:** `v2.08.149`  
**Branch:** `main`  
**Status:** Design rationale, edge cases, and cross-feature analysis

---

## 📑 Table of Contents

- [🧭 1. Introduction](#-1-introduction)
  - [🎯 1.1 Purpose of This Manual](#-11-purpose-of-this-manual)
  - [👥 1.2 Intended Audience](#-12-intended-audience)
  - [🧾 1.3 Version Scope and Assumptions](#-13-version-scope-and-assumptions)

- [🧠 2. Core Design Principles](#-2-core-design-principles)
  - [👆 2.1 Explicit User-Triggered Execution](#-21-explicit-user-triggered-execution)
  - [🧩 2.2 Atomic, Isolated Feature Design](#-22-atomic-isolated-feature-design)
  - [🚫 2.3 No Background Polling or Persistent Jobs](#-23-no-background-polling-or-persistent-jobs)
  - [🔐 2.4 Privacy-by-Design and Minimal Persistence](#-24-privacy-by-design-and-minimal-persistence)

- [⚖️ 3. Trade-offs and Engineering Decisions](#-3-trade-offs-and-engineering-decisions)
  - [🚀 3.1 Speed vs Accuracy](#-31-speed-vs-accuracy)
  - [🧵 3.2 Concurrency vs Stability](#-32-concurrency-vs-stability)
  - [🧠 3.3 Automation vs Manual Control](#-33-automation-vs-manual-control)
  - [📊 3.4 Global Rules vs Feature-Specific Rules](#-34-global-rules-vs-feature-specific-rules)

- [🔗 4. Cross-Feature Interactions](#-4-cross-feature-interactions)
  - [🏷️ 4.1 Badge State as a Shared Signal](#-41-badge-state-as-a-shared-signal)
  - [🔎 4.2 Peek as the Runtime Source of Truth](#-42-peek-as-the-runtime-source-of-truth)
  - [⚙️ 4.3 Global Settings Impact Across Features](#-43-global-settings-impact-across-features)
  - [🧠 4.4 Temporary State Reuse and Isolation](#-44-temporary-state-reuse-and-isolation)

- [🧪 5. Edge Cases and Failure Modes](#-5-edge-cases-and-failure-modes)
  - [🖼️ 5.1 Inconsistent Gallery Structures](#-51-inconsistent-gallery-structures)
  - [⏳ 5.2 Lazy Loading and Deferred Images](#-52-lazy-loading-and-deferred-images)
  - [🔁 5.3 Duplicate Images with Different URLs](#-53-duplicate-images-with-different-urls)
  - [⌨️ 5.4 Hotkey Capture and Site Interference](#-54-hotkey-capture-and-site-interference)
  - [🧩 5.5 Extension and Browser Conflicts](#-55-extension-and-browser-conflicts)

- [🚫 6. Anti-Patterns and Misuse Scenarios](#-6-anti-patterns-and-misuse-scenarios)
  - [⚠️ 6.1 Over-Aggressive Thresholds](#-61-over-aggressive-thresholds)
  - [📈 6.2 Extreme Concurrency and Batch Values](#-62-extreme-concurrency-and-batch-values)
  - [🧪 6.3 Misinterpreting Presets](#-63-misinterpreting-presets)
  - [🔀 6.4 Mixing Incompatible Modes](#-64-mixing-incompatible-modes)

- [🧭 7. System Boundaries and Non-Goals](#-7-system-boundaries-and-non-goals)
  - [🚫 7.1 Features Explicitly Out of Scope](#-71-features-explicitly-out-of-scope)
  - [🔒 7.2 Intentional Limitations](#-72-intentional-limitations)
  - [🧱 7.3 Constraints Imposed by Browser Architecture](#-73-constraints-imposed-by-browser-architecture)

- [🔮 8. Evolution Considerations](#-8-evolution-considerations)
  - [📦 8.1 Backward Compatibility Constraints](#-81-backward-compatibility-constraints)
  - [🧠 8.2 Design Decisions That Affect Future Features](#-82-design-decisions-that-affect-future-features)
  - [🧪 8.3 Areas Intentionally Left Flexible](#-83-areas-intentionally-left-flexible)

- [🧾 9. Final Notes](#-9-final-notes)
