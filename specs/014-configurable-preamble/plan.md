# Implementation Plan: Configurable Preamble

**Branch**: `014-configurable-preamble` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

## Summary

Add a default-on session setting that controls whether live mock sessions honor mentor preamble questions before turn 1.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0
**Primary Dependencies**: None
**Storage**: Browser in-memory settings only
**Testing**: Node.js built-in test runner
**Constraints**: No new packages; no provider calls; no secrets

## Constitution Check

- Spec-first traceability: PASS
- Epistemic honesty: PASS
- Secret safety: PASS
- Dependency safety: PASS
- Testable slice: PASS
- Documentation/version/git hygiene: PASS

## Project Structure

```text
src/council/live-runtime.js
src/server/live-council-handler.js
src/web/configuration-view.js
public/app.js
tests/council/live-runtime.test.js
tests/server/live-council-handler.test.js
tests/web/configuration-view.test.js
```
