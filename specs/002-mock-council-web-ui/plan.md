# Implementation Plan: Mock Council Web UI

**Branch**: `002-mock-council-web-ui` | **Date**: 2026-05-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-mock-council-web-ui/spec.md`

## Summary

Build a local MVP web page that wraps the existing mock council protocol core.
The page lets a user enter a question, run a predefined mock council session,
observe rounds, speaking-stick ownership, abstentions, action fields, and
contributions, and review a final synthesis that preserves agreement state,
dissent, assumptions, and verification guidance.

The technical approach is a dependency-free static app served locally with
Node.js. The implementation must not introduce real LLM providers, API keys,
persistence, accounts, hosted behavior, or external npm packages.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0; HTML and CSS for the web UI

**Primary Dependencies**: None beyond Node.js built-ins and browser platform APIs

**Storage**: In-memory browser state only; no persistence in this slice

**Testing**: Node.js built-in test runner for rendering helpers; browser/manual
verification for the local UI workflow

**Target Platform**: Local desktop browser, with narrow mobile viewport support

**Project Type**: Static local web app using existing protocol core

**Performance Goals**: User sees a completed mock council result within 10
seconds after submitting a question

**Constraints**: No external npm packages; no real provider API calls; no
secrets; no accounts; no persistence; visual implementation must follow an
approved design concept before coding

**Scale/Scope**: One local user, one session at a time, predefined mock council
scenarios, desktop and mobile-readable layouts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec-first traceability: PASS. This plan implements only
  `specs/002-mock-council-web-ui/spec.md`.
- Epistemic honesty: PASS. The synthesis panel must label agreement state,
  closure reason, dissent/minority views, assumptions, and verification guidance.
- Secret safety: PASS. This slice introduces no provider configuration or
  secret entry UI.
- Dependency safety: PASS. No npm dependencies are introduced. Existing lockfile
  remains dependency-free and installs must use `npm.cmd ci --ignore-scripts`.
- Testable slice: PASS. Rendering helpers can be tested with Node; the UI
  workflow can be verified in a local browser.
- Documentation/version/git hygiene: PASS. Tasks include README, quickstart,
  VERSION, verification, and commit updates.

## Project Structure

### Documentation (this feature)

```text
specs/002-mock-council-web-ui/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- ui-contract.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
public/
|-- index.html
|-- styles.css
`-- app.js

src/
|-- council/
|   |-- mock-agents.js
|   |-- protocol.js
|   `-- synthesis.js
|-- web/
|   |-- render.js
|   `-- scenarios.js
`-- index.js

tests/
|-- council/
|   |-- protocol.test.js
|   `-- synthesis.test.js
|-- fixtures/
|   `-- mock-councils.js
`-- web/
    `-- render.test.js
```

**Structure Decision**: Keep protocol logic in `src/council/` and add
web-specific rendering/scenario helpers in `src/web/`. The browser entry lives
in `public/` so the first UI can run as a static local app without a framework
or bundler.

## Complexity Tracking

No constitution violations.

