# Implementation Plan: Clarification Resume Flow

**Branch**: `005-clarification-resume-flow` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-clarification-resume-flow/spec.md`

## Summary

Complete the live mock clarification loop. When mentor questions pause a turn, the browser shows a compact clarification form, validates the user's answer, and resumes the live mock council with that answer as public context in a new turn.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0; HTML and CSS for the local web UI

**Primary Dependencies**: None beyond Node.js built-ins and browser platform APIs

**Storage**: In-memory browser state only for this slice

**Testing**: Node.js built-in test runner for context building, event generation, and view-state helpers

**Target Platform**: Local desktop browser, with narrow mobile viewport support

**Project Type**: Local static web app with a small Node.js local server

**Performance Goals**: A clarification answer resumes a live mock session within 500 ms locally

**Constraints**: No npm packages; mock-only resume; no persistence; no secrets in browser events/logs; no real provider resume yet

**Scale/Scope**: One live local session, 3-5 mentors, one clarification answer per pause for this slice

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec-first traceability: PASS. This plan implements `specs/005-clarification-resume-flow/spec.md`.
- Epistemic honesty: PASS. Clarification is user context, not proof; final counsel must state that it was incorporated.
- Secret safety: PASS. No provider calls or secrets are introduced.
- Dependency safety: PASS. No npm dependencies are introduced; verification still uses `npm.cmd ci --ignore-scripts`.
- Testable slice: PASS. Validation, event generation, turn advancement, and UI rendering are deterministic.
- Documentation/version/git hygiene: PASS. Tasks include README, VERSION, verification, and commit.

## Project Structure

### Documentation (this feature)

```text
specs/005-clarification-resume-flow/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- clarification-resume.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- council/
|   `-- live-runtime.js
`-- web/
    `-- live-view.js

public/
|-- app.js
`-- styles.css

tests/
|-- council/
|   `-- live-runtime.test.js
`-- web/
    `-- live-view.test.js
```

**Structure Decision**: Extend the existing live mock runtime and browser view-state reducer instead of adding persistence or a new server endpoint.

## Complexity Tracking

No constitution violations.
