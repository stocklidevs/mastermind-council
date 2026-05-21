# Implementation Plan: Council Session Settings

**Branch**: `007-council-session-settings` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

## Summary

Add a small session settings tab for live council max turns and wire live mock requests to use it.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0; HTML/CSS
**Primary Dependencies**: None
**Storage**: In-memory browser state
**Testing**: Node.js built-in test runner
**Target Platform**: Local desktop browser
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
src/web/configuration-view.js
public/app.js
tests/web/configuration-view.test.js
tests/web/static-configuration-ui.test.js
```
