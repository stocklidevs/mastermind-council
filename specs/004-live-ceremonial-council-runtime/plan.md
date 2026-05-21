# Implementation Plan: Live Ceremonial Council Runtime

**Branch**: `004-live-ceremonial-council-runtime` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-live-ceremonial-council-runtime/spec.md`

## Summary

Add a live ceremonial council runtime that streams mock mentor output token by token, exposes safe live lifecycle events to the browser, and upgrades the UI so the speaking stick is a visible gold ceremonial object with clear active mentor state. This first slice keeps real provider-native streaming and TTS deferred while shaping events and UI state so those features can be added later.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0; HTML and CSS for the local web UI

**Primary Dependencies**: None beyond Node.js built-ins and browser platform APIs

**Storage**: In-memory browser and server request state only for this slice

**Testing**: Node.js built-in test runner for event generation, streaming response contracts, and view-model helpers

**Target Platform**: Local desktop browser, with narrow mobile viewport support

**Project Type**: Local static web app with a small Node.js local server

**Performance Goals**: A local mock live session emits the first visible activity event within 500 ms and each speaking mentor updates in at least three visible increments

**Constraints**: No external npm packages; no real provider calls for the first streaming slice; no secrets in browser events or logs; no audio playback yet; maintain quiet strategic-room visual style

**Scale/Scope**: 3-5 mentors, one local user session at a time, default max turns of 3, mock live streaming only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec-first traceability: PASS. The plan implements `specs/004-live-ceremonial-council-runtime/spec.md`.
- Epistemic honesty: PASS. The event model preserves per-mentor output, abstentions, clarification questions, and max-turn closure.
- Secret safety: PASS. This slice uses mock live streaming and emits only public-safe events. Runtime logs must redact prompts, outputs, and secret references.
- Dependency safety: PASS. No npm dependencies are introduced. Existing dependency-free lockfile remains checked with `npm.cmd ci --ignore-scripts`.
- Testable slice: PASS. Event generation, streaming contract, UI state mapping, and transcript updates are deterministic.
- Documentation/version/git hygiene: PASS. Tasks include README/docs/VERSION updates, verification, and a clean commit.

## Project Structure

### Documentation (this feature)

```text
specs/004-live-ceremonial-council-runtime/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- live-council-events.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- council/
|   |-- live-runtime.js
|   `-- protocol.js
|-- server/
|   |-- live-council-handler.js
|   `-- runtime-logger.js
`-- web/
    `-- live-view.js

public/
|-- index.html
|-- app.js
`-- styles.css

tests/
|-- council/
|   `-- live-runtime.test.js
|-- server/
|   `-- live-council-handler.test.js
`-- web/
    `-- live-view.test.js
```

**Structure Decision**: Keep live event generation under `src/council/`, local HTTP/SSE formatting under `src/server/`, and browser-safe state/view helpers under `src/web/`. The public UI consumes only safe events.

## Complexity Tracking

No constitution violations.
