# Implementation Plan: Real Provider Preamble Questions

**Branch**: `015-real-provider-preamble` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

## Summary

Add a real-provider preamble prompt pass before live real turn 1. Supported streaming mentors may return public clarification questions. If any question exists, emit the same preamble awaiting events as live mock and pause.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0
**Primary Dependencies**: None
**Storage**: Streaming event state only
**Testing**: Node.js built-in test runner with mocked provider streams
**Constraints**: No new packages; no live provider calls; no secrets in events/logs

## Constitution Check

- Spec-first traceability: PASS
- Epistemic honesty: PASS
- Secret safety: PASS
- Dependency safety: PASS
- Testable slice: PASS
- Documentation/version/git hygiene: PASS

## Project Structure

```text
src/council/real-prompt.js
src/council/real-live-runtime.js
src/server/live-council-handler.js
tests/council/real-prompt.test.js
tests/council/real-live-runtime.test.js
tests/server/live-council-handler.test.js
```
