# Implementation Plan: Live Real Speech Completeness

## Summary

Restore ceremonial live real mentor actions and reduce cut-off real mentor/synthesis outputs by increasing stream token budgets for live speech and synthesis calls.

## Technical Context

- Runtime: dependency-free Node.js ES modules.
- Target file: `src/council/real-live-runtime.js`.
- Tests: `tests/council/real-live-runtime.test.js`.
- Package policy: no new dependencies.

## Implementation Tasks

- [x] Add failing tests for live real pre/post action events.
- [x] Add failing tests for expanded live mentor speech token budgets.
- [x] Add failing tests for expanded configured synthesis token budgets.
- [x] Emit `mentor.pre_action` after stick grant.
- [x] Emit `mentor.post_action` after streamed speech and before done.
- [x] Pass larger `maxTokens` for live real mentor speech.
- [x] Pass larger `maxTokens` for configured synthesis.
- [x] Run `npm.cmd ci --ignore-scripts` and full `node --test`.

## Notes

- This does not guarantee providers will never stop early, but it removes the app-side 220-token ceiling from real mentor and synthesis calls.
- Action text is locally generated and public-safe so the mentor can still stream plain visible speech.
