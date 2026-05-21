# Feature Specification: Configurable Preamble

**Feature Branch**: `014-configurable-preamble`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User wants the preamble clarification phase to be configurable and enabled by default.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Default Thoughtful Preamble (Priority: P1)

The council uses preamble clarification by default when mentors have preamble questions.

**Independent Test**: Build session settings with no explicit preference and verify preamble clarification is enabled.

### User Story 2 - Skip Preamble When Disabled (Priority: P1)

The user can disable the preamble phase and have live mock deliberation begin immediately at turn 1.

**Independent Test**: Start a live mock session with preamble questions and the setting disabled; verify no preamble events are emitted and turn 1 starts.

## Requirements *(mandatory)*

- **FR-001**: Session settings MUST expose a preamble clarification toggle.
- **FR-002**: Preamble clarification MUST be enabled by default.
- **FR-003**: When disabled, configured mentor preamble questions MUST be ignored for that session.
- **FR-004**: Turn-level clarification behavior MUST remain available even when preamble is disabled.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.

## Success Criteria *(mandatory)*

- **SC-001**: Tests confirm default enabled behavior.
- **SC-002**: Tests confirm disabled sessions skip preamble and begin turn 1.

## Assumptions

- This setting applies to live mock preamble behavior in this slice.
