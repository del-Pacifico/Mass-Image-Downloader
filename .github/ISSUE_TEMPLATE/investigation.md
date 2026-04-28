# 👨🏼‍🔬 Investigation Template

**Purpose**: Track unclear or ambiguous behaviors that require technical analysis before being classified as a bug, edge case, feature request, or known limitation.

**Usage Scope**:

- Use this template when behavior is observable but the root cause is unknown.
- This is not a bug report; it is a diagnostic artifact.
- Every investigation must end with a clear classification decision.

## Summary

Describe briefly what was observed and why it is not yet clear how to classify it.  
Write factual information only. Do not include assumptions or conclusions.

## Observed Behavior

Describe exactly what happens.

Include:

- What occurs
- When it occurs
- Frequency (always, intermittent, after idle, site-specific)

## Expected Behavior

Describe what should ideally happen based on documentation, UX conventions, or prior behavior.

## Environment

Fill in all applicable fields:

- Extension version:
- Browser and version:
- Chromium version:
- Operating system:
- Installation mode (Unpacked / Store):

## Relevant Settings Snapshot

Prefer values as shown in **Peek Settings**.

Fill in:

- Image Inspector enabled:
- Image Inspector Dev Mode:
- Close-on-save enabled:
- Show user feedback messages:
- Debug log level (0–3):
- Other relevant options:

## Reproduction Notes

Indicate reproducibility:

- Reproducible: Yes / No / Partially
- Reproduction confidence: High / Medium / Low

### Steps Attempted

List the steps that were tried.

- Step 1:
- Step 2:
- Step 3:

> If reproduction is unreliable, explain what varies between attempts.

## Evidence

### URLs or URL Patterns

Provide example URLs or patterns where the behavior occurs.

```text
https://example.com/gallery/*
```

### Console Logs

Filtered by `[Mass image downloader]`.

```text
[Mass image downloader]: ...
```

### Screenshots or Recordings

Attach visual evidence if available.

## Working Hypotheses

Identify potential causes. Select all that apply or add notes.

- Site-specific DOM or CSS structure
- Responsive layout or transformed ancestor
- Full-document image view
- MV3 lifecycle (service worker sleep / wake)
- Timing or race condition
- storage.sync cache refresh
- Event listener lifecycle or teardown
- Browser-specific behavior
- Unknown / requires deeper analysis

## Investigation Tasks

- Reproduce on a second site
- Capture logs with debug level 2–3
- Compare behavior before and after opening Peek Settings
- Identify responsible module or file
- Determine final classification

## Proposed Outcome

Once investigation concludes, choose one:

- Convert to Bug Report
- Convert to Edge Case
- Convert to Feature Request
- Document as known limitation
- Close with explanation

## Notes

Add final technical observations, references to related PRs or issues, or follow-up recommendations.

> **Invariant**: No investigation issue should be closed without a clear classification outcome.
