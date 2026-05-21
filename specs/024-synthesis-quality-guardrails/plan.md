# Implementation Plan: Synthesis Quality Guardrails

## Summary

Tighten the final council synthesis path so model-generated summaries are judged as artifacts, not merely valid JSON. The slice strengthens the synthesis prompt, expands the parsed artifact shape, rejects transcript-like outputs, and renders the useful artifact fields in the chamber.

## Technical Context

- Runtime: dependency-free Node.js ES modules.
- UI: static HTML/CSS/JS served by the local Node server.
- Test runner: built-in `node --test`.
- Package policy: no new npm packages; keep the lockfile pinned and validate with `npm ci --ignore-scripts`.

## Changes

- Update `src/council/real-prompt.js` with a stronger synthesis artifact prompt and richer parser normalization.
- Add parser guardrails for transcript concatenation and mentor-by-mentor recap patterns.
- Pass transcript context into live configured synthesis parsing.
- Extend fallback synthesis artifacts with next actions, unresolved questions, mentor grounding, confidence, and quality source.
- Render next actions, mentor grounding, and unresolved questions in `public/app.js`.
- Add targeted regression tests for parsing, fallback behavior, runtime synthesis, and UI wiring.

## Verification

- `node --test tests\council\real-prompt.test.js tests\council\real-live-runtime.test.js tests\server\live-council-handler.test.js tests\web\static-configuration-ui.test.js`
- `npm.cmd ci --ignore-scripts`
- `node --test`
