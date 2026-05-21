# Feature Specification: Local Session History

**Feature Branch**: `017-local-session-history`

**Created**: 2026-05-18

**Status**: Draft

**Input**: Add session persistence for transcripts, council choices, questions, clarifications, and final counsel.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save Completed Sessions (Priority: P1)

When a session completes, the app saves a local public-safe summary with the question, mode, mentors, transcript, and synthesis.

**Independent Test**: Create a session record and verify it contains public transcript data but no secret-looking values.

### User Story 2 - Review Recent Sessions (Priority: P1)

The user can see recent saved sessions from the Session settings drawer.

**Independent Test**: Build a session history view model and verify recent records are listed newest-first.

## Requirements *(mandatory)*

- **FR-001**: Completed sessions MUST be saved locally.
- **FR-002**: Saved session records MUST include question, mode, mentor names, transcript items, synthesis, and creation time.
- **FR-003**: The app MUST list recent saved sessions in Session settings.
- **FR-004**: Users MUST be able to clear local saved sessions.
- **FR-SEC**: Saved records MUST NOT include resolved API keys, secret references, or raw provider credentials.

## Success Criteria *(mandatory)*

- **SC-001**: Tests cover create, save, list, clear, and secret redaction.
- **SC-002**: Static UI tests confirm local history controls are wired.

## Assumptions

- This slice stores history in browser localStorage.
- Full replay/loading a previous session into the main transcript is future work.
