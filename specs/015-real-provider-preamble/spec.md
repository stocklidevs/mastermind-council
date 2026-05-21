# Feature Specification: Real Provider Preamble Questions

**Feature Branch**: `015-real-provider-preamble`

**Created**: 2026-05-18

**Status**: Draft

**Input**: Implement real-provider awareness for the default-on configurable preamble phase.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real Mentors Ask Before Deliberating (Priority: P1)

When live real council mode starts with preamble enabled, supported streaming mentors can ask concise public clarifying questions before turn 1.

**Independent Test**: Mock supported real providers returning preamble JSON and verify preamble question events are emitted before any turn starts.

### User Story 2 - Real Mentors Skip Preamble When Disabled (Priority: P1)

When the user disables preamble clarification, live real council mode begins the first turn without preamble question calls.

**Independent Test**: Run live real events with preamble disabled and verify turn 1 begins immediately.

## Requirements *(mandatory)*

- **FR-001**: Live real council mode MUST honor the same preamble enabled setting as live mock mode.
- **FR-002**: Real-provider preamble prompts MUST request concise public clarification questions only, not private chain-of-thought.
- **FR-003**: If one or more real mentors ask preamble questions, the live real session MUST pause before turn 1.
- **FR-004**: If no real mentor asks a preamble question, the live real session MUST proceed to turn 1.
- **FR-005**: Unsupported streaming providers MUST not block supported mentors from asking preamble questions.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.

## Success Criteria *(mandatory)*

- **SC-001**: Tests confirm real preamble questions pause before turn 1.
- **SC-002**: Tests confirm disabled preamble proceeds to turn 1.
- **SC-003**: Tests confirm secret references and keys are not emitted in preamble events.

## Assumptions

- This slice does not call live provider APIs during tests.
- Preamble provider responses use a small structured JSON contract.
