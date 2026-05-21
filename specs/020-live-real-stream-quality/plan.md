# Implementation Plan: Live Real Stream Quality

**Branch**: `020-live-real-stream-quality` | **Date**: 2026-05-19 | **Spec**: [spec.md](spec.md)

## Summary

Improve live real stream fidelity by supporting OpenAI-compatible chat streams, treating infrastructure failures as errors rather than abstentions, avoiding silent done states, and synthesizing from actual visible mentor output.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0
**Primary Dependencies**: None added to the project
**Testing**: Node.js built-in test runner
**Constraints**: No resolved secrets in URLs, logs, transcripts, local persistence, or browser state

## Constitution Check

- Spec-first traceability: PASS
- Epistemic honesty: PASS
- Secret safety: PASS
- Dependency safety: PASS
- Testable slice: PASS
- Documentation/version/git hygiene: PASS
