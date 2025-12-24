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

---

## 🧭 1. Introduction

The Advanced Manual provides a **deep, design-oriented perspective** on Mass Image Downloader.

While the User Manual explains *how to use* the extension and the Technical User Manual explains *how it works*, this document explains **why it is designed the way it is**, what trade-offs were made, and which boundaries are intentional.

This manual is not required for daily usage.  
It exists to support **advanced understanding, long-term maintenance, and informed decision-making**.

---

### 🎯 1.1 Purpose of This Manual

The purpose of the Advanced Manual is to:

- Explain architectural and design decisions
- Make trade-offs explicit and transparent
- Document edge cases and failure modes
- Clarify intentional limitations and non-goals
- Help advanced users predict system behavior before execution

> This document favors **clarity over simplicity** and **reasoning over instructions**.

---

### 👥 1.2 Intended Audience

This manual is intended for:

- Advanced and power users
- QA engineers performing deep validation
- Maintainers and long-term contributors
- Reviewers analyzing stability and behavior
- Future maintainers revisiting design context

It assumes familiarity with:
- All features described in the User Manual
- Execution flows documented in the Technical User Manual
- Browser extension concepts (content scripts, background processes)

---

### 🧾 1.3 Version Scope and Assumptions

This document applies exclusively to:

- **Extension version:** `v2.08.149`
- **Branch:** `main`

Assumptions:
- All referenced behavior matches the released version
- No experimental or unreleased features are considered
- Deprecated logic and previous implementations are intentionally ignored

> If future versions diverge, this document must be reviewed and updated accordingly.

---

## 🧠 2. Core Design Principles

This section explains the **foundational principles** that guide the architecture and behavior of Mass Image Downloader.

These principles are not accidental; they are deliberate constraints that shape every feature and limit what the extension does — and does not do.

Understanding these principles helps explain many design decisions that may otherwise seem restrictive.

---

### 👆 2.1 Explicit User-Triggered Execution

All operations in Mass Image Downloader are **explicitly initiated by the user**.

There are no:
- Background jobs
- Automatic scans
- Scheduled tasks
- Passive listeners performing work

Every execution begins with a clear user action, such as:
- Clicking a feature in the popup
- Pressing a hotkey
- Interacting with an injected UI element

This design:
- Prevents unexpected downloads
- Avoids resource usage without user intent
- Makes behavior predictable and debuggable

> The extension never acts autonomously.

---

### 🧩 2.2 Atomic, Isolated Feature Design

Each feature is designed as an **atomic execution unit**.

This means:
- Features do not depend on the internal state of other features
- Temporary state is not shared across executions
- Failures in one feature do not corrupt others

Examples:
- Bulk Image Download does not reuse gallery state
- Image Inspector runs independently of batch logic
- One-click Download Icon does not inherit gallery limits

Atomicity improves:
- Reliability
- Debuggability
- Long-term maintainability

---

### 🚫 2.3 No Background Polling or Persistent Jobs

Mass Image Downloader intentionally avoids:
- Background polling
- Long-lived timers
- Persistent asynchronous jobs

Reasons:
- Browser extensions have strict lifecycle constraints
- Persistent jobs increase memory usage and instability
- Silent background behavior violates user expectations

> All background activity exists **only during active execution** and is terminated immediately afterward.

---

### 🔐 2.4 Privacy-by-Design and Minimal Persistence

Privacy is enforced through **absence of storage**, not policy.

Key rules:
- No download history is stored
- No page URLs are persisted
- No behavioral profiling exists
- No execution metrics are retained

Only user configuration is persisted.

This ensures:
- Zero long-term tracking
- No data accumulation over time
- Predictable, stateless behavior

> The extension treats each execution as disposable and isolated.

---

## ⚖️ 3. Trade-offs and Engineering Decisions

Every feature in Mass Image Downloader reflects **explicit engineering trade-offs**.

This section makes those trade-offs visible, explaining why certain choices were favored and what is intentionally sacrificed as a result.

There are no “free” decisions — each gain comes with a cost.

---

### 🚀 3.1 Speed vs Accuracy

One of the most visible trade-offs is between **execution speed** and **image selection accuracy**.

Faster configurations:
- Use lower similarity thresholds
- Allow smaller image sizes
- Favor direct URL extraction

More accurate configurations:
- Enforce stricter size thresholds
- Use similarity grouping
- Limit batch size and concurrency

Design choice:
- The system defaults favor **accuracy over speed**
- Speed can be increased deliberately by relaxing constraints

> This prevents accidental over-download of low-value or decorative images.

---

### 🧵 3.2 Concurrency vs Stability

Concurrency improves throughput but directly impacts browser stability.

High concurrency:
- Opens more tabs simultaneously
- Increases memory and CPU usage
- Risks site throttling or crashes

Low concurrency:
- Reduces system pressure
- Improves predictability
- Increases total execution time

Design choice:
- Concurrency is always bounded
- There is no “unlimited” mode
- Rate limiting complements concurrency to smooth execution

> Stability is prioritized over raw performance.

---

### 🧠 3.3 Automation vs Manual Control

The extension deliberately offers **both automated and manual flows**.

Automated flows:
- Bulk Image Download
- Gallery extraction modes

Manual flows:
- Image Inspector
- One-click Download Icon

Design choice:
- Automation handles common, repeatable patterns
- Manual tools exist for precision and verification

> This avoids forcing automation in scenarios where human judgment is required.

---

### 📊 3.4 Global Rules vs Feature-Specific Rules

Global rules simplify consistency but reduce flexibility.

Examples of global rules:
- Minimum image size
- Allowed formats
- Filename conventions

Feature-specific rules:
- Gallery similarity thresholds
- Web-linked gallery concurrency
- Bulk batch limits

Design choice:
- Global rules define a baseline contract
- Feature-specific rules refine behavior locally

> This balance prevents configuration explosion while preserving control.

---

## 🔗 4. Cross-Feature Interactions

Although features in Mass Image Downloader are designed to be atomic, they are **not isolated in perception**.

Some elements intentionally act as **shared signals** or **shared references**, allowing users to understand system state across different execution modes.

This section explains how features interact indirectly and what assumptions can safely be made.

---

### 🏷️ 4.1 Badge State as a Shared Signal

The extension badge acts as a **global execution indicator**.

Key characteristics:
- Badge state reflects the **current active execution**, not a specific feature
- Only one execution flow is active at a time
- Badge color and counter are reset at the start of each operation

Implications:
- Badge behavior is consistent across features
- Users can rely on badge color to infer system state
- Feature-specific details are intentionally abstracted away

Design choice:
- The badge communicates *status*, not *context*
- Detailed context belongs in logs or Peek

---

### 🔎 4.2 Peek as the Runtime Source of Truth

The Peek panel is the **authoritative view of effective configuration** at runtime.

Important properties:
- Peek reflects settings as loaded by the background layer
- It does not display unsaved UI state
- It updates dynamically when settings change

Cross-feature relevance:
- All features consume the same global configuration snapshot
- Peek provides a single point of verification regardless of feature used

Design choice:
- One runtime truth prevents configuration ambiguity
- Peek is informational, not interactive

---

### ⚙️ 4.3 Global Settings Impact Across Features

Some settings intentionally affect **multiple features simultaneously**.

Examples:
- Minimum image size applies to all extraction modes
- Allowed formats affect every download path
- Filename rules are enforced globally

Consequences:
- Changing a global setting may alter behavior in unexpected places
- Feature-level tuning must respect global constraints

Design choice:
- Shared rules enforce consistency
- Users must reason globally, not per feature

---

### 🧠 4.4 Temporary State Reuse and Isolation

Temporary state is **execution-scoped**, not feature-scoped.

Rules:
- State exists only during a single execution
- No state survives between executions
- State is not reused across features

This ensures:
- Predictable behavior
- No hidden coupling between features
- Clean restarts for every action

Design choice:
- Isolation over convenience
- Repeatability over optimization

---

## 🧪 5. Edge Cases and Failure Modes

This section documents **non-ideal, real-world scenarios** where behavior may differ from expectations, even when the extension is functioning correctly.

These cases are not bugs by default; they are **environmental or structural edge cases** that require informed interpretation.

---

### 🖼️ 5.1 Inconsistent Gallery Structures

Not all galleries follow predictable or uniform patterns.

Common issues:
- Mixed thumbnail and full-size images in the same container
- Decorative images sharing similar paths with real content
- Galleries split across multiple DOM hierarchies

Effects:
- Similarity grouping may fail to converge
- Some valid images may be excluded intentionally
- Noise reduction may appear overly aggressive

Design response:
- Favor false negatives over false positives
- Require minimum group size to qualify a gallery

> This prevents accidental mass downloads of irrelevant assets.

---

### ⏳ 5.2 Lazy Loading and Deferred Images

Many modern sites load images dynamically based on scroll position or user interaction.

Challenges:
- Images may not exist in the DOM at execution time
- Placeholder elements may appear instead of real images
- Resolution may be unknown until fully loaded

Design response:
- The extension does not auto-scroll pages
- Only fully realized images are considered
- Users may need to scroll manually before execution

> This avoids intrusive behavior and unintended page manipulation.

---

### 🔁 5.3 Duplicate Images with Different URLs

Some sites serve identical images under different URLs.

Examples:
- Cache-busting query parameters
- CDN aliases
- Resolution variants pointing to the same binary

Behavior:
- Duplicate detection operates within a single execution
- Cross-execution deduplication is intentionally absent

Design response:
- Avoid persistent hashing or fingerprinting
- Preserve privacy and simplicity

> Duplicates across runs are considered acceptable.

---

### ⌨️ 5.4 Hotkey Capture and Site Interference

Certain websites intercept keyboard shortcuts for their own functionality.

Consequences:
- Hotkeys may not trigger the extension
- Behavior may vary between sites

Design response:
- No attempt is made to override site handlers
- Hotkeys operate only when the page allows propagation

> Users may need to rely on popup-triggered features in such cases.

---

### 🧩 5.5 Extension and Browser Conflicts

Other extensions or browser features may interfere.

Examples:
- Ad blockers modifying DOM structure
- Script blockers preventing content scripts
- Privacy tools restricting tab access

Behavior:
- Feature execution may silently skip targets
- No explicit error may be shown

Design response:
- Fail safely without crashing
- Require manual investigation via logs

> Conflicts are treated as environmental limitations, not extension failures.

---

## 🚫 6. Anti-Patterns and Misuse Scenarios

This section describes **common configuration and usage patterns that appear valid but lead to poor results**.

These scenarios are not bugs. They are consequences of misaligned expectations or overly aggressive tuning.

Understanding what **not** to do is as important as knowing what to do.

---

### ⚠️ 6.1 Over-Aggressive Thresholds

Setting extremely high minimum image dimensions or similarity thresholds often leads to confusion.

Typical symptoms:
- No images are downloaded
- Galleries appear empty
- Image Inspector never qualifies candidates

Why this happens:
- Many real-world images are smaller than expected
- Thumbnails and previews may not meet strict criteria

Design stance:
- Thresholds are filters, not guarantees
- Conservative values are safer than extreme ones

> Users should increase thresholds incrementally and validate results.

---

### 📈 6.2 Extreme Concurrency and Batch Values

Maximizing concurrency and batch size may seem desirable for speed.

Common outcomes:
- Browser slowdown or freezes
- Tabs failing to load completely
- Incomplete or aborted extractions

Why this happens:
- Browsers are not designed for uncontrolled parallelism
- Network and memory contention increase non-linearly

Design stance:
- Bounded concurrency is intentional
- Stability is favored over peak throughput

> Aggressive values should be used only on powerful systems and known sites.

---

### 🧪 6.3 Misinterpreting Presets

Presets are often misunderstood as performance modes.

Incorrect assumptions:
- “High” means always better
- Presets adapt dynamically to the site
- Presets override all other settings

Reality:
- Presets apply predefined values once
- Manual changes switch the system to Custom mode
- Presets do not react to runtime conditions

Design stance:
- Presets are starting points, not automation

> Users should verify effective settings via Peek after selecting a preset.

---

### 🔀 6.4 Mixing Incompatible Modes

Running incompatible features sequentially without resetting expectations can lead to confusion.

Examples:
- Expecting gallery grouping rules to apply to Bulk Image Download
- Assuming manual tools inherit batch behavior
- Mixing visual gallery logic with direct image tabs

Design stance:
- Each feature has a clear, limited scope
- Behavior does not implicitly carry over between modes

> Users should select the feature that matches the page type and goal.

