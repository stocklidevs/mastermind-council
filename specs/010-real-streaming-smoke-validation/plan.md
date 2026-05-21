# Implementation Plan: Real Streaming Smoke Validation

**Branch**: `010-real-streaming-smoke-validation` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

## Summary

Add a small CLI smoke command for OpenAI and Anthropic provider token streaming. Support dry-run and mocked tests, then run one controlled live smoke.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0
**Primary Dependencies**: None
**Storage**: N/A
**Testing**: Node.js built-in test runner
**Target Platform**: Local CLI
**Project Type**: Local web app tooling
**Constraints**: No npm packages; no secrets in output; tiny provider calls only when explicitly run live

## Constitution Check

- Spec-first traceability: PASS
- Epistemic honesty: PASS
- Secret safety: PASS
- Dependency safety: PASS
- Testable slice: PASS
- Documentation/version/git hygiene: PASS

## Project Structure

```text
scripts/provider-stream-smoke.js
src/providers/streaming-smoke.js
tests/providers/streaming-smoke.test.js
```
