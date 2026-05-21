# Implementation Plan: Mentor Provider Configuration

**Branch**: `003-mentor-provider-configuration` | **Date**: 2026-05-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-mentor-provider-configuration/spec.md`

## Summary

Add a configuration layer for council mentors before real provider execution.
Users can configure safe secret references, choose provider/model per mentor,
edit mentor characteristics, preview public mentor prompt/profile content, and
see prompt/input caching capability for selected provider/model combinations.

The first implementation remains local and dependency-free. It adds static
provider/model metadata, validation and view-model helpers, and UI surfaces in
the existing quiet strategy room app. It does not resolve secrets, call providers,
or persist plaintext secrets.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0; HTML and CSS for the local web UI

**Primary Dependencies**: None beyond Node.js built-ins and browser platform APIs

**Storage**: In-memory browser state only for this slice

**Testing**: Node.js built-in test runner for config validation, metadata, and view-model helpers

**Target Platform**: Local desktop browser, with narrow mobile viewport support

**Project Type**: Static local web app extending the existing mock council UI

**Performance Goals**: A user can edit a mentor configuration and see the safe
preview update in under 1 second locally

**Constraints**: No external npm packages; no provider API calls; no resolved
secret values in browser output; no persistence; no 1Password CLI execution yet;
cache support is metadata only

**Scale/Scope**: Curated provider/model metadata for initial configuration,
3-5 mentors, one local user session at a time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec-first traceability: PASS. This plan implements only
  `specs/003-mentor-provider-configuration/spec.md`.
- Epistemic honesty: PASS. Mentor traits cannot disable synthesis uncertainty or
  dissent rules; caching is shown as capability, not guaranteed savings.
- Secret safety: PASS. This slice stores and displays references only; it never
  resolves provider secrets.
- Dependency safety: PASS. No npm dependencies are introduced. Existing lockfile
  remains dependency-free and installs must use `npm.cmd ci --ignore-scripts`.
- Testable slice: PASS. Secret-reference validation, provider/model selection,
  caching capability display, and prompt preview are deterministic.
- Documentation/version/git hygiene: PASS. Tasks include README, quickstart,
  VERSION/package update, verification, and commit updates.

## Project Structure

### Documentation (this feature)

```text
specs/003-mentor-provider-configuration/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- configuration-ui.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- config/
|   |-- provider-metadata.js
|   |-- mentor-config.js
|   `-- secret-references.js
|-- web/
|   |-- render.js
|   |-- scenarios.js
|   `-- configuration-view.js
`-- index.js

public/
|-- index.html
|-- app.js
`-- styles.css

tests/
|-- config/
|   |-- mentor-config.test.js
|   |-- provider-metadata.test.js
|   `-- secret-references.test.js
`-- web/
    `-- configuration-view.test.js
```

**Structure Decision**: Keep reusable configuration rules under `src/config/`
and web-specific rendering/view-model helpers under `src/web/`. The browser UI
continues to import safe local modules and never handles resolved secrets.

## Complexity Tracking

No constitution violations.

