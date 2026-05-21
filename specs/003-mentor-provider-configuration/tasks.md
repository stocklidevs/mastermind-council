# Tasks: Mentor Provider Configuration

**Input**: Design documents from `specs/003-mentor-provider-configuration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/configuration-ui.md, quickstart.md

**Tests**: Automated tests are required for secret-reference validation, provider/model metadata, mentor configuration, cache capability display, and prompt preview helpers.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create configuration modules and preserve dependency-free baseline.

- [x] T001 Verify `package-lock.json` has no dependencies and `npm.cmd ci --ignore-scripts` passes
- [x] T002 [P] Create `src/config/` directory for configuration helpers
- [x] T003 [P] Create `tests/config/` directory for configuration tests
- [x] T004 [P] Create `src/web/configuration-view.js` for configuration UI view models
- [x] T005 [P] Create `tests/web/configuration-view.test.js` for UI configuration helper tests

---

## Phase 2: Foundational Metadata

**Purpose**: Define provider/model/caching metadata shared by all stories.

- [x] T006 [P] Add failing provider metadata tests in `tests/config/provider-metadata.test.js`
- [x] T007 [P] Add failing mentor config defaults tests in `tests/config/mentor-config.test.js`
- [x] T008 Implement curated provider/model/cache metadata in `src/config/provider-metadata.js`
- [x] T009 Implement default mentor profiles in `src/config/mentor-config.js`
- [x] T010 Export configuration helpers from `src/index.js`

**Checkpoint**: Metadata foundation is ready.

---

## Phase 3: User Story 1 - Configure Provider Secrets (Priority: P1) MVP

**Goal**: Users can configure safe environment or 1Password secret references without exposing resolved secrets.

**Independent Test**: Create environment and 1Password references and verify display is safe/redacted; plaintext-looking keys warn or reject.

### Tests for User Story 1

- [x] T011 [P] [US1] Add failing environment reference validation test in `tests/config/secret-references.test.js`
- [x] T012 [P] [US1] Add failing 1Password `op://` reference validation test in `tests/config/secret-references.test.js`
- [x] T013 [P] [US1] Add failing plaintext-looking key rejection/warning test in `tests/config/secret-references.test.js`
- [x] T014 [P] [US1] Add failing safe display label test in `tests/config/secret-references.test.js`

### Implementation for User Story 1

- [x] T015 [US1] Implement secret reference validation in `src/config/secret-references.js`
- [x] T016 [US1] Implement redacted/safe display formatting in `src/config/secret-references.js`
- [x] T017 [US1] Add provider secret settings view-model helpers in `src/web/configuration-view.js`
- [x] T018 [US1] Add provider settings UI section in `public/index.html`
- [x] T019 [US1] Wire provider secret settings interactions in `public/app.js`
- [x] T020 [US1] Style provider settings and warning states in `public/styles.css`
- [x] T021 [US1] Run `node --test tests/config/secret-references.test.js` and confirm US1 tests pass

**Checkpoint**: Provider secret reference setup is independently testable.

---

## Phase 4: User Story 2 - Choose Provider And Model Per Mentor (Priority: P2)

**Goal**: Users can assign provider/model per mentor and see capability metadata.

**Independent Test**: Edit two mentors with different provider/model selections and verify each reflects its own model and cache/voice capability state.

### Tests for User Story 2

- [x] T022 [P] [US2] Add failing test for model list scoped by provider in `tests/config/provider-metadata.test.js`
- [x] T023 [P] [US2] Add failing test for mentor provider/model update in `tests/config/mentor-config.test.js`
- [x] T024 [P] [US2] Add failing capability display view-model test in `tests/web/configuration-view.test.js`

### Implementation for User Story 2

- [x] T025 [US2] Implement provider-scoped model lookup in `src/config/provider-metadata.js`
- [x] T026 [US2] Implement mentor provider/model update helpers in `src/config/mentor-config.js`
- [x] T027 [US2] Render mentor provider/model controls in `public/app.js`
- [x] T028 [US2] Style provider/model capability display in `public/styles.css`
- [x] T029 [US2] Run `node --test tests/config/provider-metadata.test.js tests/config/mentor-config.test.js tests/web/configuration-view.test.js`

**Checkpoint**: Provider/model selection works per mentor.

---

## Phase 5: User Story 3 - Edit Mentor Characteristics (Priority: P3)

**Goal**: Users can edit mentor identity, personality, style, participation behavior, and future voice metadata.

**Independent Test**: Edit a mentor and verify roster/config preview reflect the updated values without secrets.

### Tests for User Story 3

- [x] T030 [P] [US3] Add failing mentor characteristic update test in `tests/config/mentor-config.test.js`
- [x] T031 [P] [US3] Add failing voice metadata preservation test in `tests/config/mentor-config.test.js`
- [x] T032 [P] [US3] Add failing prompt/profile preview test in `tests/web/configuration-view.test.js`

### Implementation for User Story 3

- [x] T033 [US3] Implement mentor characteristic update helpers in `src/config/mentor-config.js`
- [x] T034 [US3] Implement prompt/profile preview helper in `src/web/configuration-view.js`
- [x] T035 [US3] Render mentor editor controls in `public/app.js`
- [x] T036 [US3] Render mentor prompt/profile preview in `public/app.js`
- [x] T037 [US3] Style mentor editor and preview in `public/styles.css`
- [x] T038 [US3] Run `node --test tests/config/mentor-config.test.js tests/web/configuration-view.test.js`

**Checkpoint**: Mentor characteristics are editable and previewable.

---

## Phase 6: User Story 4 - Configure Prompt/Input Caching Safely (Priority: P4)

**Goal**: Users can see caching support only where provider/model metadata supports it and understand stable vs dynamic prompt sections.

**Independent Test**: Select automatic, explicit, unsupported, and unknown models and verify caching state is represented accurately.

### Tests for User Story 4

- [x] T039 [P] [US4] Add failing cache capability state tests in `tests/config/provider-metadata.test.js`
- [x] T040 [P] [US4] Add failing cache candidate preview test in `tests/web/configuration-view.test.js`
- [x] T041 [P] [US4] Add failing unsupported/unknown cache disablement test in `tests/web/configuration-view.test.js`

### Implementation for User Story 4

- [x] T042 [US4] Implement cache capability display helpers in `src/web/configuration-view.js`
- [x] T043 [US4] Render cache capability and stable/dynamic sections in `public/app.js`
- [x] T044 [US4] Style cache capability states in `public/styles.css`
- [x] T045 [US4] Run `node --test` and confirm all automated tests pass

**Checkpoint**: Cache capability is visible without overpromising support.

---

## Phase 7: Polish & Verification

**Purpose**: Complete docs, versioning, browser smoke checks, and repository hygiene.

- [x] T046 [P] Update `README.md` with configuration feature notes
- [x] T047 [P] Update `specs/003-mentor-provider-configuration/quickstart.md` with observed verification results
- [x] T048 [P] Update `VERSION` and `package.json` for the completed configuration slice
- [x] T049 Run `npm.cmd ci --ignore-scripts` and `node --test`
- [x] T050 Run `npm.cmd run serve` and smoke-check configuration UI manually
- [x] T051 Inspect `git status --short` and ensure only intended files are changed
- [x] T052 Create final clean Git commit for the completed spec

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational Metadata (Phase 2)**: Depends on Setup and blocks all stories.
- **US1 (Phase 3)**: Can start after metadata foundation.
- **US2 (Phase 4)**: Depends on provider/model metadata.
- **US3 (Phase 5)**: Depends on mentor profile helpers.
- **US4 (Phase 6)**: Depends on provider/model metadata and prompt/profile preview.
- **Polish (Phase 7)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1**: Required MVP for safe provider setup.
- **US2**: Required before real provider execution.
- **US3**: Required for meaningful mentor identity.
- **US4**: Required before caching can be used safely in provider execution.

### Within Each User Story

- Write failing tests first.
- Implement minimal helpers to pass.
- Wire UI after helper tests are green.
- Preserve prior story tests before moving forward.

---

## Parallel Opportunities

- T002, T003, T004, and T005 can run in parallel.
- T006 and T007 can run in parallel.
- Test-writing tasks within each story can run in parallel because they target different assertions.
- README, quickstart, and version updates can run in parallel during polish.

---

## Implementation Strategy

### MVP First

1. Complete setup and provider/model metadata.
2. Implement secret-reference configuration (US1).
3. Implement provider/model selection per mentor (US2).
4. Add mentor characteristic editing (US3).
5. Add caching capability display (US4).

### Final Verification

Run:

```powershell
npm.cmd ci --ignore-scripts
node --test
npm.cmd run serve
```

Then smoke-check that no plaintext secrets appear and caching states are shown as capabilities.

