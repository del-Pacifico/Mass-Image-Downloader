---
name: "Release checklist"
about: Track items required to ship a release
title: "release: vX.Y.Z"
labels: ["type: release"]
assignees: []
---

## Flow

- Official flow: feature/chore branch → dev → main → tag/release

## Version

- Target version: vX.Y.Z
- Branch: dev → main
- Required labels: `type: release`, `scope: release`, and the appropriate release status label

## Readiness

- [ ] All feature/bugfix PRs merged into `dev`
- [ ] CI green in `dev` (extension validation / compliance tests)
- [ ] `npm run check` passes
- [ ] `npm test` passes
- [ ] Changelog updated (Added/Changed/Fixed/Removed)
- [ ] README/docs adjusted if behavior changed
- [ ] SemVer respected (breaking changes bump MAJOR)

## Release PR (dev → main)

- [ ] Create PR with clear overview & rollback plan
- [ ] Ensure branch is up to date
- [ ] 1 approval (not last pusher)
- [ ] Merge strategy: **Squash & merge**
- [ ] Tag `vX.Y.Z` on `main`

## Post-Release

- [ ] Publish artifacts (if any)
- [ ] Create GitHub Release notes
- [ ] Sync `main → dev`
- [ ] Open follow-up issues (tech debt, docs, etc.)
