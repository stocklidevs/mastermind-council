# Tasks: Live Ceremonial Council Runtime

**Input**: Design documents from `specs/004-live-ceremonial-council-runtime/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Automated tests are required for event generation, server event formatting, browser view state helpers, and existing regression coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup

- [x] T001 Confirm active feature pointer in `.specify/feature.json`
- [x] T002 Update `AGENTS.md` to point to `specs/004-live-ceremonial-council-runtime/plan.md`
- [x] T003 Confirm no npm packages are required for this slice

## Phase 2: Foundational

- [x] T004 [P] Add failing live runtime tests in `tests/council/live-runtime.test.js`
- [x] T005 [P] Add failing server SSE tests in `tests/server/live-council-handler.test.js`
- [x] T006 [P] Add failing live view-model tests in `tests/web/live-view.test.js`
- [x] T007 Implement public event generation in `src/council/live-runtime.js`
- [x] T008 Implement safe SSE formatting in `src/server/live-council-handler.js`
- [x] T009 Export live runtime and view helpers from `src/index.js` as needed

## Phase 3: User Story 1 - Watch A Live Council Speak (P1)

- [x] T010 [US1] Add `/api/council/live` route in `scripts/serve-static.js`
- [x] T011 [US1] Add live mock mode option in `public/index.html`
- [x] T012 [US1] Update `public/app.js` to consume server-sent events and render token updates incrementally
- [x] T013 [US1] Verify active mentor state, token order, and completion state with automated tests

## Phase 4: User Story 2 - Experience A Subtle Ceremonial Chamber (P2)

- [x] T014 [US2] Add compact active mentor stick indicator instead of non-functional table stick markup in `public/index.html`
- [x] T015 [US2] Style active mentor stick icon, thinking glow, and dark mode refinements in `public/styles.css`
- [x] T016 [US2] Verify light/dark and narrow viewport layout with static UI coverage and local endpoint smoke; browser automation was attempted but unavailable because the bundled Playwright install is missing `playwright-core`

## Phase 5: User Story 3 - Preserve Turn Rules And Clarification Questions (P3)

- [x] T017 [US3] Model interested mentor pool, abstentions, once-per-turn stick grants, and end-of-turn clarification events in `src/council/live-runtime.js`
- [x] T018 [US3] Render abstentions and collected clarification questions in `public/app.js`
- [x] T019 [US3] Verify max-turn and clarification pause behavior with automated tests

## Phase 6: Polish

- [x] T020 Update `README.md` with live mock council usage
- [x] T021 Update `VERSION`, `package.json`, and `package-lock.json`
- [x] T022 Run `npm.cmd ci --ignore-scripts`
- [x] T023 Run `node --test`
- [x] T024 Run local server smoke for `/api/council/live`
- [x] T025 Commit the completed Spec 004 slice

## Dependencies & Execution Order

- Setup and foundational tests come first.
- Runtime and server event contracts block browser integration.
- UI styling can proceed after event-driven DOM states exist.
- Documentation, versioning, and commit happen after verification.

## Implementation Strategy

Deliver the MVP first: mock live SSE, token rendering, stick ownership, and clear mentor states. Then add end-of-turn clarification rendering and visual polish before final verification.
