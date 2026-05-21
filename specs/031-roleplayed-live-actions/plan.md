# Implementation Plan: Roleplayed Live Actions

## Summary

Replace hard-coded live real pre/post speaking actions with mentor-authored public stage directions, while retaining deterministic fallback actions.

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

- [x] Add failing tests for live action prompt/parse behavior.
- [x] Add failing live real runtime test for provider-authored pre/post actions.
- [x] Implement live action prompt builder and parser.
- [x] Request action text before and after streamed speech.
- [x] Preserve safe fallback actions when action generation fails.
- [x] Update VERSION, README, and AGENTS plan pointer.
- [x] Run `npm.cmd ci --ignore-scripts` and full `node --test`.

## Notes

- The action call is intentionally separate from speech streaming so the visible utterance remains token-by-token plain speech.
- The post-action prompt may include the mentor's visible utterance as public context.
