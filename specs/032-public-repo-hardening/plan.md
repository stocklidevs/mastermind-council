# Implementation Plan: Public Repo Hardening

## Summary

Prepare the current tree for public repository presentation by adding MIT licensing, syncing package metadata, and replacing workspace-specific 1Password examples with generic placeholders.

## Technical Context

- Runtime: dependency-free Node.js ES modules.
- Target files:
  - `LICENSE`
  - `package.json`
  - `package-lock.json`
  - `README.md`
  - `src/providers/smoke-config.js`
  - docs/tests that mention generic 1Password references
- Package policy: no new dependencies.

## Implementation Tasks

- [x] Add MIT LICENSE file.
- [x] Sync `package.json` and `package-lock.json` versions with `VERSION`.
- [x] Replace personal 1Password smoke references with generic examples.
- [x] Update README license badge and license section.
- [x] Update Spec Kit pointer and public-hardening docs.
- [x] Run `npm.cmd ci --ignore-scripts`, `node --test`, and current-tree public sweep.

## Notes

- This slice cleans the current tree. It does not rewrite existing local git history.
