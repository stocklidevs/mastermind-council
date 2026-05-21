# Implementation Plan: Live Real Mentor Fixes

**Branch**: `018-live-real-mentor-fixes` | **Date**: 2026-05-19 | **Spec**: [spec.md](spec.md)

## Summary

Fix live real council behavior so the selected browser council reaches the server, live real prompts stream visible speech instead of JSON, and mentor edits persist locally.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0
**Primary Dependencies**: None added to the project
**Testing**: Node.js built-in test runner; Playwright interactive QA with temporary pinned local install
**Constraints**: No resolved secrets in URLs, logs, transcripts, or local persistence

## Constitution Check

- Spec-first traceability: PASS
- Epistemic honesty: PASS
- Secret safety: PASS
- Dependency safety: PASS
- Testable slice: PASS
- Documentation/version/git hygiene: PASS
