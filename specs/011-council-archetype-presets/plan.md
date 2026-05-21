# Implementation Plan: Council Archetype Presets

**Branch**: `011-council-archetype-presets` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

## Summary

Add local council preset catalog and settings UI selector for philosophy, science, economics, personal growth, strategy, and raw analysis rosters.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0; HTML/CSS
**Primary Dependencies**: None
**Storage**: In-memory browser state
**Testing**: Node.js built-in test runner
**Target Platform**: Local browser
**Project Type**: Local static web app
**Constraints**: No npm packages; no provider calls

## Constitution Check

- Spec-first traceability: PASS
- Epistemic honesty: PASS
- Secret safety: PASS
- Dependency safety: PASS
- Testable slice: PASS
- Documentation/version/git hygiene: PASS

## Project Structure

```text
src/config/council-presets.js
src/web/configuration-view.js
public/app.js
tests/config/council-presets.test.js
tests/web/configuration-view.test.js
```
