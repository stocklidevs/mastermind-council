# Implementation Plan: Real Streaming Live Council

**Branch**: `009-real-streaming-live-council` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

## Summary

Wire OpenAI and Anthropic provider token streaming into the existing live council event stream. Add a real streaming browser mode, keep unsupported providers safe, and verify with mocked provider streams only.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0
**Primary Dependencies**: None
**Storage**: In-memory request state
**Testing**: Node.js built-in test runner
**Target Platform**: Local Node server and browser
**Project Type**: Local web app
**Constraints**: No npm packages; no live provider calls; secrets remain server-side

## Constitution Check

- Spec-first traceability: PASS
- Epistemic honesty: PASS
- Secret safety: PASS
- Dependency safety: PASS
- Testable slice: PASS
- Documentation/version/git hygiene: PASS

## Project Structure

```text
src/council/real-live-runtime.js
src/server/live-council-handler.js
public/app.js
tests/council/real-live-runtime.test.js
tests/server/live-council-handler.test.js
```
