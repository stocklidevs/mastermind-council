# Implementation Plan: Deep Persona Prompt Priming

**Branch**: `012-deep-persona-prompt-priming` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

## Summary

Upgrade `buildMentorPrompt` to include deep identity fields, archetype honesty, raw-mode instructions, blind spots, and verification humility.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0
**Primary Dependencies**: None
**Storage**: N/A
**Testing**: Node.js built-in test runner
**Constraints**: No provider calls; no secrets

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
tests/council/real-prompt.test.js
```
