# Implementation Plan: Mock Council Protocol

**Branch**: `001-mock-council-protocol` | **Date**: 2026-05-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-mock-council-protocol/spec.md`

## Summary

Build the first protocol slice as a local, deterministic mock council engine.
The implementation will accept a user question, run configured mock council
members through round-based participation decisions, enforce exclusive
speaking-stick ownership, prevent repeat speakers within a round, record
abstentions and contributions, and produce an honest final synthesis.

The technical approach is a dependency-free Node.js core module with tests that
exercise the protocol state machine directly. No real LLM providers, browser UI,
network calls, persistence, or npm package dependencies are introduced in this
slice.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0

**Primary Dependencies**: None beyond Node.js built-ins

**Storage**: In-memory session objects only; no persistence in this slice

**Testing**: Node.js built-in test runner

**Target Platform**: Local developer machine

**Project Type**: Single-project protocol core

**Performance Goals**: A deterministic mock session with up to 7 council
members and 5 rounds completes in under 1 second on a local machine

**Constraints**: No external npm packages; no real provider API calls; no
secrets; transcript must be reconstructable from public session events

**Scale/Scope**: One user question, one mock council session at a time, up to 7
mock council members, up to 5 rounds by default

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec-first traceability: PASS. This plan implements only
  `specs/001-mock-council-protocol/spec.md`.
- Epistemic honesty: PASS. Synthesis contract includes closure reason,
  assumptions, uncertainty, and dissent/minority views.
- Secret safety: PASS. This slice uses mock agents only and introduces no
  provider keys or real model credentials.
- Dependency safety: PASS. No npm dependencies are introduced. If package files
  are added for scripts, they must contain no dependency entries and installs
  must use `npm ci` after lockfile creation.
- Testable slice: PASS. Protocol invariants map directly to automated tests.
- Documentation/version/git hygiene: PASS. Tasks will include README/docs,
  VERSION, verification, and commit updates.

## Project Structure

### Documentation (this feature)

```text
specs/001-mock-council-protocol/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- protocol-api.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- council/
|   |-- mock-agents.js
|   |-- protocol.js
|   `-- synthesis.js
`-- index.js

tests/
|-- council/
|   |-- protocol.test.js
|   `-- synthesis.test.js
`-- fixtures/
    `-- mock-councils.js
```

**Structure Decision**: Use a single-project structure. The protocol core is
small and has no frontend/backend split yet. Future web UI specs can wrap this
core rather than mixing UI concerns into the deliberation engine.

## Complexity Tracking

No constitution violations.

