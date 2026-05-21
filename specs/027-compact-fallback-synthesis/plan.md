# Implementation Plan: Compact Fallback Synthesis

## Summary

Replace transcript-dump fallback synthesis with a compact local distillation path. This fixes the confusing state where the UI claimed to show synthesis but actually displayed full mentor outputs across several sections.

## Technical Context

- Runtime: dependency-free Node.js ES modules.
- Target file: `src/council/real-live-runtime.js`.
- UI label file: `public/app.js`.
- Tests: built-in `node --test`.

## Implementation Tasks

- [x] Add failing runtime regression coverage for fallback transcript dumping.
- [x] Change fallback `mainAnswer` to a compact synthesized summary.
- [x] Change fallback `minorityViews` to concise preserved angles.
- [x] Change fallback `mentorGrounding` to short distilled source points.
- [x] Rename fallback agreement state to make fallback behavior visible.
- [x] Use provider human-readable names in the synthesis model label.
- [x] Run focused live-runtime and UI static tests.
- [x] Run `npm.cmd ci --ignore-scripts` and full `node --test`.

## Validation Notes

- The configured synthesis model remains the preferred path.
- This slice improves the failure/rejection path so users still receive a compact artifact when model synthesis cannot be used.
