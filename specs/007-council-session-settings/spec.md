# Feature Specification: Council Session Settings

**Feature Branch**: `007-council-session-settings`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "The council should run many turns until decision or a max turn limit defined in config."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Live Council Max Turns (Priority: P1)

A user can set the maximum number of live council turns from configuration instead of relying on a hardcoded value.

**Why this priority**: Max turns is part of the deliberation contract and should be visible before multi-turn behavior becomes richer.

**Independent Test**: Change the max turns setting, start a live mock council session, and verify the request uses the selected value.

**Acceptance Scenarios**:

1. **Given** settings are open, **When** the user changes max turns, **Then** the setting is retained for the current browser session.
2. **Given** live mock council mode is selected, **When** the user asks a question, **Then** the live stream request uses the configured max turns.
3. **Given** the user enters an invalid max turns value, **When** settings render, **Then** the value is clamped to the supported range.

### Council Integrity & Safety *(mandatory for council-facing features)*

- Max turns is a closure limit, not a truth guarantee.
- Final counsel must preserve dissent when max turns closes a session.
- This slice introduces no npm packages or secrets.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a session settings area in configuration.
- **FR-002**: Users MUST be able to configure live council max turns.
- **FR-003**: System MUST clamp max turns to a safe supported range.
- **FR-004**: Live mock council requests MUST use the configured max turns value.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be vulnerability-checked, pinned in `package-lock.json`, and installed with `npm ci`.

### Key Entities

- **Council Session Settings**: Browser-held settings that affect a live council run.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can set max turns between 1 and 5.
- **SC-002**: The live mock request URL includes the selected max turns.
- **SC-003**: Automated tests cover clamping and UI wiring.

## Assumptions

- Settings remain in-memory for this slice.
- Default max turns remains 3.
