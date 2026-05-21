# Tasks: Clarification Resume Flow

**Input**: Design documents from `specs/005-clarification-resume-flow/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Automated tests are required for validation, resumed events, and UI state.

## Phase 1: Setup

- [x] T001 Create Spec 005 artifacts
- [x] T002 Point `.specify/feature.json` and `AGENTS.md` at Spec 005
- [x] T003 Confirm no npm packages are required

## Phase 2: Foundational

- [x] T004 Add failing resume event tests in `tests/council/live-runtime.test.js`
- [x] T005 Add failing clarification state tests in `tests/web/live-view.test.js`
- [x] T006 Implement resume event generation in `src/council/live-runtime.js`
- [x] T007 Implement clarification validation/state helpers in `src/web/live-view.js`

## Phase 3: User Story 1 - Answer Council Clarifications

- [x] T008 Render clarification form in `public/app.js`
- [x] T009 Validate blank clarification answers with visible UI feedback
- [x] T010 Style clarification panel in `public/styles.css`

## Phase 4: User Story 2 - Resume Deliberation With Added Context

- [x] T011 Append resumed events to the existing live browser state
- [x] T012 Render resumed turn and final counsel after answer submission
- [x] T013 Verify turn advancement and incorporated clarification text

## Phase 5: Polish

- [x] T014 Update `README.md`
- [x] T015 Update `VERSION`, `package.json`, and `package-lock.json`
- [x] T016 Run `npm.cmd ci --ignore-scripts`
- [x] T017 Run `node --test`
- [x] T018 Run local live endpoint smoke; browser automation remains unavailable because the bundled Playwright install is missing `playwright-core`
- [ ] T019 Commit the completed Spec 005 slice
