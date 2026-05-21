# Implementation Plan: Frontier Model Catalog

## Summary

Add GPT-5.5, Claude Sonnet 4.6, and Grok 4 to the built-in provider model catalog.

## Technical Context

- Runtime: dependency-free Node.js ES modules.
- Target file: `src/config/provider-catalog.js`.
- Tests: `tests/config/provider-metadata.test.js`.
- Package policy: no new dependencies.

## Implementation Tasks

- [x] Add failing metadata tests for GPT-5.5, Claude Sonnet 4.6, and Grok 4.
- [x] Add the three built-in model entries with conservative cache metadata.
- [x] Update VERSION, README, and AGENTS plan pointer.
- [x] Run `npm.cmd ci --ignore-scripts` and full `node --test`.

## Notes

- The app does not probe provider availability during catalog rendering.
- New model ids are based on provider documentation checked on 2026-05-20.
