# Implementation Plan: Decision Brief Synthesis

## Summary

Tighten live real synthesis so the final counsel is a synthesized decision brief instead of a repeated transcript summary.

## Technical Context

- Runtime: dependency-free Node.js ES modules.
- Target files:
  - `src/council/real-prompt.js`
  - `src/council/real-live-runtime.js`
- Tests:
  - `tests/council/real-prompt.test.js`
  - `tests/council/real-live-runtime.test.js`
- Package policy: no new dependencies.

## Implementation Tasks

- [x] Add failing prompt/parser tests for decision-brief synthesis.
- [x] Add failing runtime fallback test for non-concatenated decision brief.
- [x] Tighten synthesis prompt instructions.
- [x] Harden recap detection for multiple mentor-name references.
- [x] Rewrite fallback `mainAnswer` construction to produce a compact decision brief.
- [x] Update VERSION, README, and AGENTS plan pointer.
- [x] Run `npm.cmd ci --ignore-scripts` and full `node --test`.

## Notes

- `mentorGrounding` remains the place for named attribution.
- The fallback stays deterministic and modest; the configured synthesis model remains the preferred high-quality synthesis path.
