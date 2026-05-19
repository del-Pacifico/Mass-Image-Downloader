# Mass Image Downloader

![Chromium 93+](https://img.shields.io/badge/Chromium-93%2B-4285F4?logo=google-chrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-FF9800)
![GitHub Release](https://img.shields.io/github/v/release/del-Pacifico/Mass-Image-Downloader?display_name=tag)
![Chrome](https://img.shields.io/badge/Chrome-Not%20Fully%20Tested-9E9E9E?logo=google-chrome&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-Not%20Fully%20Tested-9E9E9E?logo=microsoft-edge&logoColor=white)
![Brave](https://img.shields.io/badge/Brave-Tested-FB542B?logo=brave&logoColor=white)
![License](https://img.shields.io/badge/license-MPL--2.0-green?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![GitHub community standards](https://img.shields.io/badge/community%20standards-100%25-brightgreen?style=flat-square&logo=github)

<p align="center">
  <img src="assets/Mass-Image-Downloader-preview08.png" alt="Mass Image Downloader preview" width="900">
</p>

Mass Image Downloader is a Chromium Manifest V3 extension for collecting and downloading images at scale from open tabs, single pages, and multi-page galleries while keeping results filtered, named, and reproducible.

## Features

- Bulk image download across open tabs.
- Gallery extraction for direct links, visual galleries, and web-linked gallery pages.
- Format and dimension filters for JPG/JPEG, PNG, WEBP, AVIF, and BMP.
- Deterministic filename modes using prefix, suffix, both, or timestamp.
- One-click manual save overlay for selective curation.
- Image Inspector mode with preview, metadata, navigation, and save controls.
- Clipboard hotkeys for dataset labeling.
- Toast notifications, badge states, debug levels, pacing, batching, and concurrency controls.

## Installation

1. Clone or download this repository.
2. Open a Chromium-based browser and go to the extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
3. Enable Developer Mode.
4. Select **Load unpacked**.
5. Choose the repository root folder.

## Quick Start

1. Pin the extension icon.
2. Open the popup and choose a download mode.
3. Configure formats, size filters, naming, pacing, and gallery limits from the Options page.
4. Run the workflow from the popup or with the configured keyboard shortcuts.

## Documentation

- [Documentation Hub](docs/README.md) - entry point for all manuals.
- [User Manual](docs/user-manual/README.md) - basic usage and workflows.
- [Configuration Guides](docs/configuration-guides/configuration-guides.md) - scenario-based setup.
- [Technical Manual](docs/technical-manual/README.md) - internal behavior and execution flow.
- [Advanced Manual](docs/advanced-manual/README.md) - design rationale, trade-offs, and edge cases.
- [Extended Project Overview](docs/project-overview-extended.md) - the previous long-form README preserved as a reference.
- [Hotkeys Policy](docs/hotkeys/hotkeys.md) - official shortcut policy.

## Requirements

- Chromium-based browser.
- Minimum Chromium version: `93`.
- Manifest version: `3`.
- Tested primarily on Brave.

## Version

Current project version: `2.08.182`.

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Contributing

Contributions should follow the project flow: feature or chore branch, PR to `dev`, merge to `main`, then tag/release.

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

## License

Mass Image Downloader is licensed under the [Mozilla Public License 2.0](LICENSE).
