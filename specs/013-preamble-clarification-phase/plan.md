# Implementation Plan: Preamble Clarification Phase

**Branch**: `013-preamble-clarification-phase` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

## Summary

Add a preamble clarification phase to the live mock council runtime and view state so mentors can ask initial questions before turn 1, pause the council, and resume into turn 1 after the user answers.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0
**Primary Dependencies**: None
**Storage**: In-memory browser/server event state only
**Testing**: Node.js built-in test runner
**Constraints**: No new npm packages; no provider calls; no secrets

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
src/web/live-view.js
src/web/scenarios.js
public/app.js
tests/council/live-runtime.test.js
tests/web/live-view.test.js
```
