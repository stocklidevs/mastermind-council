# Implementation Plan: Anthropic Model ID Fix

**Branch**: `021-anthropic-model-id-fix` | **Date**: 2026-05-19 | **Spec**: [spec.md](spec.md)

## Summary

Correct the Anthropic model id used by default mentors and presets from the shorthand `claude-sonnet-4` to the documented API id `claude-sonnet-4-20250514`, and migrate previously saved local mentor rosters at load time.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0
**Primary Dependencies**: None added to the project
**Testing**: Node.js built-in test runner
**Reference**: Anthropic model documentation lists Claude Sonnet 4 API model id as `claude-sonnet-4-20250514`
**Constraints**: No resolved secrets in URLs, logs, transcripts, local persistence, or browser state

## Constitution Check

- Spec-first traceability: PASS
- Epistemic honesty: PASS
- Secret safety: PASS
- Dependency safety: PASS
- Testable slice: PASS
- Documentation/version/git hygiene: PASS
