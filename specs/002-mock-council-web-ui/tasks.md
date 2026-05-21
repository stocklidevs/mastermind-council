# Tasks: Mock Council Web UI

**Input**: Design documents from `specs/002-mock-council-web-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contract.md, quickstart.md

**Tests**: Automated tests are required for rendering helpers. Browser verification
is required for the live local workflow and responsive layout.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare static UI structure and preserve the dependency-free npm baseline.

- [x] T001 Verify `package.json` scripts still use dependency-free Node commands
- [x] T002 Verify `package-lock.json` has no dependencies and `npm.cmd ci --ignore-scripts` passes
- [x] T003 [P] Create `public/` directory for static app files
- [x] T004 [P] Create `src/web/` directory for UI view-model helpers
- [x] T005 [P] Create `tests/web/` directory for rendering helper tests

---

## Phase 2: Design Gate And Foundation

**Purpose**: Establish the visual direction and shared view-model helpers before user story work.

**CRITICAL**: No UI implementation work begins until the design concept is generated or approved.

- [x] T006 Generate or obtain approved primary-screen design concept for the council UI
- [x] T007 Document design tokens, layout regions, and component inventory in `specs/002-mock-council-web-ui/design-notes.md`
- [x] T008 [P] Create predefined web scenarios in `src/web/scenarios.js`
- [x] T009 [P] Create pure transcript/synthesis view-model helpers in `src/web/render.js`
- [x] T010 Create static app shell files `public/index.html`, `public/styles.css`, and `public/app.js`

**Checkpoint**: Design and shared helpers are ready.

---

## Phase 3: User Story 1 - Ask The Mock Council From A Web Page (Priority: P1) MVP

**Goal**: A user can enter a question, run the existing mock council protocol, and see transcript plus synthesis.

**Independent Test**: Open the local page, enter a question, start the session, and verify that transcript and synthesis appear without API keys or providers.

### Tests for User Story 1

- [x] T011 [P] [US1] Add failing render helper test for empty question validation in `tests/web/render.test.js`
- [x] T012 [P] [US1] Add failing render helper test for mapping a completed session into transcript and synthesis view models in `tests/web/render.test.js`

### Implementation for User Story 1

- [x] T013 [US1] Implement question validation helper in `src/web/render.js`
- [x] T014 [US1] Implement session-to-view-model mapping in `src/web/render.js`
- [x] T015 [US1] Wire question form and run button in `public/app.js`
- [x] T016 [US1] Render initial app shell and synthesis area in `public/index.html`
- [x] T017 [US1] Add base layout styles in `public/styles.css`
- [x] T018 [US1] Run `node --test tests/web/render.test.js` and confirm US1 tests pass

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Observe Speaking-Stick Debate (Priority: P2)

**Goal**: A user can visually follow rounds, stick ownership, speakers, abstentions, action fields, and contribution order.

**Independent Test**: Run a mock session with an abstention and an action field, then verify both render distinctly in the ordered transcript.

### Tests for User Story 2

- [x] T019 [P] [US2] Add failing test for contribution order and speaker labels in `tests/web/render.test.js`
- [x] T020 [P] [US2] Add failing test for abstention view-model items in `tests/web/render.test.js`
- [x] T021 [P] [US2] Add failing test for action fields separated from utterances in `tests/web/render.test.js`

### Implementation for User Story 2

- [x] T022 [US2] Implement round transcript item mapping in `src/web/render.js`
- [x] T023 [US2] Render roster and transcript rounds in `public/app.js`
- [x] T024 [US2] Style speaking-stick, contribution, abstention, and action states in `public/styles.css`
- [x] T025 [US2] Run `node --test tests/web/render.test.js` and confirm US1 and US2 tests pass

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Review Dissent And Safety Cues (Priority: P3)

**Goal**: A user can distinguish consensus from split decision and see minority views, assumptions, and verification guidance.

**Independent Test**: Run a dissenting mock scenario and verify that the synthesis panel labels the split decision and shows minority views.

### Tests for User Story 3

- [x] T026 [P] [US3] Add failing synthesis view-model test for split-decision label in `tests/web/render.test.js`
- [x] T027 [P] [US3] Add failing synthesis view-model test for minority views, assumptions, and guidance in `tests/web/render.test.js`

### Implementation for User Story 3

- [x] T028 [US3] Implement synthesis view-model mapping in `src/web/render.js`
- [x] T029 [US3] Render agreement state, closure reason, minority views, assumptions, and guidance in `public/app.js`
- [x] T030 [US3] Style synthesis states and safety cues in `public/styles.css`
- [x] T031 [US3] Run `node --test` and confirm all automated tests pass

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Browser Verification & Polish

**Purpose**: Verify the actual local web app, responsive layout, docs, versioning, and Git hygiene.

- [x] T032 Create `scripts/serve-static.js` to serve `public/` locally without dependencies
- [x] T033 Run local static server with `node scripts/serve-static.js`
- [x] T034 Verify desktop workflow in browser: non-empty question runs session and renders transcript/synthesis
- [x] T035 Verify empty question validation in browser
- [x] T036 Verify mobile-width layout in browser with no horizontal overflow
- [x] T037 [P] Update `README.md` with local web UI run command
- [x] T038 [P] Update `specs/002-mock-council-web-ui/quickstart.md` with observed verification results
- [x] T039 [P] Update `VERSION` and `package.json` for the completed UI slice
- [x] T040 Run `npm.cmd ci --ignore-scripts` and `node --test` for final verification
- [x] T041 Inspect `git status --short` and ensure only intended files are changed
- [x] T042 Create final clean Git commit for the completed spec

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Design Gate And Foundation (Phase 2)**: Depends on Setup and blocks UI implementation.
- **User Story 1 (Phase 3)**: Depends on Foundation.
- **User Story 2 (Phase 4)**: Depends on US1 rendering shell.
- **User Story 3 (Phase 5)**: Depends on US1 synthesis area.
- **Browser Verification & Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1**: Required MVP slice.
- **US2**: Builds on US1 transcript rendering but remains independently testable through view-model tests.
- **US3**: Builds on US1 synthesis rendering and verifies epistemic honesty.

### Within Each User Story

- Write failing tests first for helper behavior.
- Implement minimal helper logic to pass.
- Wire the browser UI after the helper behavior is green.
- Preserve prior story tests before moving forward.

---

## Parallel Opportunities

- T003, T004, and T005 can run in parallel.
- T008 and T009 can run in parallel after the design notes are started.
- Test-writing tasks within each story can run in parallel because they assert different mapping behavior.
- README, quickstart, and version updates can run in parallel during polish.

---

## Parallel Example: User Story 2

```text
Task: "Add failing test for contribution order and speaker labels in tests/web/render.test.js"
Task: "Add failing test for abstention view-model items in tests/web/render.test.js"
Task: "Add failing test for action fields separated from utterances in tests/web/render.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete setup.
2. Complete design gate and foundation.
3. Write failing US1 rendering tests.
4. Implement question validation and session mapping.
5. Wire the form and base rendering.
6. Verify US1 independently.

### Incremental Delivery

1. US1 makes the page usable.
2. US2 makes the debate ritual observable.
3. US3 makes dissent and safety cues visible.
4. Browser polish validates desktop and mobile behavior.

### Final Verification

Run:

```powershell
npm.cmd ci --ignore-scripts
node --test
node scripts/serve-static.js
```

Then verify the local page in a browser at desktop and mobile widths.
