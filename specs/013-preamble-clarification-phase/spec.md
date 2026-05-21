# Feature Specification: Preamble Clarification Phase

**Feature Branch**: `013-preamble-clarification-phase`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User wants a preamble session where the council can ask clarifying questions before deliberating, and multiple mentors can add their own angle to the initial clarification need.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask Before Deliberating (Priority: P1)

Before the first debate turn, mentors can inspect the user's question and ask clarifying questions as a preamble instead of immediately presenting advice.

**Why this priority**: The council should feel thoughtful and investigative, not like a group rushing to answer an underdefined question.

**Independent Test**: Start a live mock session with mentors that have preamble questions and verify preamble question events are emitted before any debate turn begins.

### User Story 2 - Resume From Preamble Answer (Priority: P1)

After the user answers the preamble questions, the council starts the first debate turn using the clarified context.

**Why this priority**: Clarification must be a productive pause, not a dead end.

**Independent Test**: Resume a session paused during preamble and verify the next event starts turn 1, then produces mentor token output and synthesis.

### Council Integrity & Safety *(mandatory for council-facing features)*

- The preamble is public and visible; it must not expose private chain-of-thought.
- Multiple mentors may ask questions in the same preamble.
- The council must not also deliberate before the user answers when preamble clarification is requested.
- No secrets are included in events, transcript, or logs.

## Requirements *(mandatory)*

- **FR-001**: Live mock sessions MUST support a preamble phase before turn 1.
- **FR-002**: Mentors with configured preamble questions MUST emit visible mentor question events during preamble.
- **FR-003**: If any preamble questions are asked, the session MUST pause for user clarification before any turn starts.
- **FR-004**: Resuming from a preamble clarification MUST start debate at turn 1.
- **FR-005**: The UI view state MUST display preamble questions through the existing clarification answer mechanism.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve uncertainty and avoid presenting clarification as consensus.

## Success Criteria *(mandatory)*

- **SC-001**: Tests confirm preamble questions occur before turn events.
- **SC-002**: Tests confirm preamble resume starts at turn 1.
- **SC-003**: Existing turn-level clarification behavior remains unchanged.

## Assumptions

- This slice targets live mock runtime and UI state only.
- Real-provider preamble prompting will be a later slice after the event contract is stable.
