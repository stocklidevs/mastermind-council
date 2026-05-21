# Tasks: Mock Council Protocol

**Input**: Design documents from `specs/001-mock-council-protocol/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/protocol-api.md, quickstart.md

**Tests**: Automated tests are required for this feature because the protocol is
deterministic and all core invariants can be exercised without external services.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish a dependency-free Node.js project shell for protocol tests.

- [x] T001 Create `package.json` with module type and scripts for `node --test`
- [x] T002 Create empty lockfile workflow by running `npm.cmd install --package-lock-only --ignore-scripts` and verify no dependencies are added in `package-lock.json`
- [x] T003 Verify reproducible install with `npm.cmd ci --ignore-scripts`
- [x] T004 [P] Create source directories `src/council/` and `tests/council/`
- [x] T005 [P] Create fixture directory `tests/fixtures/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared entities and fixtures that all user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 [P] Create mock council fixtures in `tests/fixtures/mock-councils.js`
- [x] T007 [P] Create protocol entity constructors and validation helpers in `src/council/protocol.js`
- [x] T008 [P] Create mock agent behavior helpers in `src/council/mock-agents.js`
- [x] T009 Create public module exports in `src/index.js`
- [x] T010 Add shared test helpers for session assertions in `tests/council/protocol.test.js`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Run A Mock Council Session (Priority: P1) MVP

**Goal**: A user can submit a question and receive a complete mock council transcript with valid speaking-stick ownership.

**Independent Test**: Submit one question to a mock council and verify at least one round, valid stick ownership, accepted contributions, and final synthesis.

### Tests for User Story 1

- [x] T011 [P] [US1] Add failing test for session creation from a user question in `tests/council/protocol.test.js`
- [x] T012 [P] [US1] Add failing test that each accepted contribution has exactly one prior stick grant in `tests/council/protocol.test.js`
- [x] T013 [P] [US1] Add failing test that an agent cannot speak twice in one round in `tests/council/protocol.test.js`
- [x] T014 [P] [US1] Add failing test that a session closes with synthesis and closure reason in `tests/council/protocol.test.js`

### Implementation for User Story 1

- [x] T015 [US1] Implement `createCouncilSession` in `src/council/protocol.js`
- [x] T016 [US1] Implement round start, speaking-stick grant, contribution acceptance, and stick release in `src/council/protocol.js`
- [x] T017 [US1] Implement repeat-speaker rejection and invalid event recording in `src/council/protocol.js`
- [x] T018 [US1] Implement `runCouncilSession` closure flow in `src/council/protocol.js`
- [x] T019 [US1] Export session API from `src/index.js`
- [x] T020 [US1] Run `node --test tests/council/protocol.test.js` and confirm US1 tests pass

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Preserve Visible Council Dynamics (Priority: P2)

**Goal**: The transcript exposes participation decisions, abstentions, speaking order, and short action fields.

**Independent Test**: Run a mock session where one agent participates, one abstains, and one contribution includes an action field; verify all are visible in order.

### Tests for User Story 2

- [x] T021 [P] [US2] Add failing test for visible abstention events in `tests/council/protocol.test.js`
- [x] T022 [P] [US2] Add failing test for action fields being separate from utterances in `tests/council/protocol.test.js`
- [x] T023 [P] [US2] Add failing test for preserving speaking order across multiple stick grants in `tests/council/protocol.test.js`

### Implementation for User Story 2

- [x] T024 [US2] Implement abstention event recording in `src/council/protocol.js`
- [x] T025 [US2] Implement action field validation and transcript serialization in `src/council/protocol.js`
- [x] T026 [US2] Implement deterministic multi-agent participation order in `src/council/mock-agents.js`
- [x] T027 [US2] Run `node --test tests/council/protocol.test.js` and confirm US1 and US2 tests pass

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Receive Honest Synthesis (Priority: P3)

**Goal**: The final synthesis preserves consensus state, dissent, assumptions, closure reason, and verification guidance.

**Independent Test**: Run mock sessions with consensus, dissent, and max-round closure; verify each synthesis labels the outcome honestly.

### Tests for User Story 3

- [x] T028 [P] [US3] Add failing consensus synthesis test in `tests/council/synthesis.test.js`
- [x] T029 [P] [US3] Add failing split-decision synthesis test with minority view in `tests/council/synthesis.test.js`
- [x] T030 [P] [US3] Add failing max-round closure synthesis test with unresolved assumptions in `tests/council/synthesis.test.js`

### Implementation for User Story 3

- [x] T031 [US3] Implement synthesis agreement-state detection in `src/council/synthesis.js`
- [x] T032 [US3] Implement minority view and assumption extraction in `src/council/synthesis.js`
- [x] T033 [US3] Integrate synthesis creation into `runCouncilSession` in `src/council/protocol.js`
- [x] T034 [US3] Export synthesis helpers from `src/index.js`
- [x] T035 [US3] Run `node --test` and confirm all protocol and synthesis tests pass

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete documentation, versioning, verification, and repository hygiene.

- [x] T036 [P] Update `README.md` with setup and test commands for the protocol core
- [x] T037 [P] Update `specs/001-mock-council-protocol/quickstart.md` with actual commands and observed verification result
- [x] T038 [P] Update `VERSION` for the completed implementation slice
- [x] T039 Run `npm.cmd ci --ignore-scripts` and `node --test` for final verification
- [x] T040 Inspect `git status --short` and ensure only intended files are changed
- [x] T041 Create final clean Git commit for the completed spec

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational phase.
- **User Story 2 (Phase 4)**: Depends on Foundational phase; can be implemented after US1 for simpler validation.
- **User Story 3 (Phase 5)**: Depends on Foundational phase; integrates with US1 session closure.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1**: Required MVP slice.
- **US2**: Builds on transcript behavior from US1 but remains independently testable.
- **US3**: Builds on session closure from US1 and can be verified with separate synthesis tests.

### Within Each User Story

- Write failing tests first.
- Implement the minimal behavior needed to pass those tests.
- Re-run the story-specific test command.
- Preserve prior story tests before moving forward.

---

## Parallel Opportunities

- T004 and T005 can run in parallel after T001-T003.
- T006, T007, and T008 can run in parallel after project structure exists.
- Test-writing tasks within each story can run in parallel because they target distinct assertions.
- README, quickstart, and VERSION updates can run in parallel during polish.

---

## Parallel Example: User Story 1

```text
Task: "Add failing test for session creation from a user question in tests/council/protocol.test.js"
Task: "Add failing test that each accepted contribution has exactly one prior stick grant in tests/council/protocol.test.js"
Task: "Add failing test that an agent cannot speak twice in one round in tests/council/protocol.test.js"
Task: "Add failing test that a session closes with synthesis and closure reason in tests/council/protocol.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup.
2. Complete Foundational tasks.
3. Write and run failing US1 tests.
4. Implement US1 protocol behavior.
5. Verify US1 independently.

### Incremental Delivery

1. US1 proves the core session and speaking-stick protocol.
2. US2 adds visible council dynamics: abstentions, actions, speaking order.
3. US3 adds epistemically honest synthesis.
4. Polish updates docs, version, and final verification.

### Final Verification

Run:

```powershell
npm.cmd ci --ignore-scripts
node --test
```

Both commands must pass before the implementation slice is considered complete.
