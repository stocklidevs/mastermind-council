# Feature Specification: Clarification Resume Flow

**Feature Branch**: `005-clarification-resume-flow`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "When mentors ask follow-up questions, the user should be able to answer after the turn finishes. Multiple mentors can add their own clarification questions. The council then resumes with the user's answer as added context."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Answer Council Clarifications (Priority: P1)

A user sees the council pause after a turn, reviews all mentor clarification questions, and answers the council in one response.

**Why this priority**: Clarification questions currently pause the council but do not let the user continue. Answering them completes the first useful feedback loop.

**Independent Test**: Run a live mock council session that pauses for clarification, submit an answer, and verify that the answer is recorded and the council resumes.

**Acceptance Scenarios**:

1. **Given** one or more mentors asked clarification questions, **When** the turn ends, **Then** the user sees all questions grouped as a single clarification request.
2. **Given** the clarification request is visible, **When** the user enters an answer, **Then** the council accepts that answer as new context.
3. **Given** the user submits a blank clarification answer, **When** the answer is validated, **Then** the council remains paused and shows a visible validation message.

---

### User Story 2 - Resume Deliberation With Added Context (Priority: P2)

After the user answers, the council starts a new turn that considers the clarification answer.

**Why this priority**: The answer must materially affect the next turn; otherwise the clarification flow is cosmetic.

**Independent Test**: Submit a clarification answer and verify that resumed mentor output references the answer context and that the turn number advances.

**Acceptance Scenarios**:

1. **Given** the council is awaiting clarification, **When** the user submits an answer, **Then** a new live turn begins.
2. **Given** the resumed turn begins, **When** mentors speak, **Then** the live transcript includes the resumed turn and mentor output can incorporate the user's clarification answer.
3. **Given** the resumed turn completes without more questions, **When** the session synthesizes, **Then** final counsel identifies that clarification was incorporated.

### Edge Cases

- If the stream is interrupted while awaiting clarification, the user should not lose the visible mentor questions.
- If a user answer is submitted while the council is not awaiting clarification, the app should reject it.
- If resumed deliberation reaches max turns, the final counsel should preserve any unresolved assumptions.

### Council Integrity & Safety *(mandatory for council-facing features)*

- Mentor questions remain public, attributable, and collected at turn end.
- The user's clarification answer is treated as user-provided context, not verified truth.
- The final counsel must not claim that clarification guarantees correctness.
- No secrets, provider keys, hidden prompts, or chain-of-thought appear in clarification events, transcripts, logs, or browser code.
- This slice introduces no npm packages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display collected mentor clarification questions after the turn ends.
- **FR-002**: Users MUST be able to answer all collected clarification questions with one response.
- **FR-003**: System MUST validate that the clarification answer is not blank.
- **FR-004**: System MUST resume live mock deliberation after a valid clarification answer.
- **FR-005**: Resumed deliberation MUST include the original question, prior contributions, mentor questions, and user clarification answer as public context.
- **FR-006**: System MUST advance the turn number when deliberation resumes.
- **FR-007**: System MUST avoid duplicate overlapping live streams during clarification resume.
- **FR-008**: Final counsel after resume MUST state that clarification was incorporated.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be vulnerability-checked, pinned in `package-lock.json`, and installed with `npm ci`.

### Key Entities

- **Clarification Request**: The collected set of mentor questions that pauses the council.
- **Clarification Answer**: The user's response to the collected questions.
- **Resume Context**: Original question, prior public events, collected mentor questions, and the clarification answer.
- **Resumed Turn**: A new live turn that follows a clarification answer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A paused live mock session presents all collected mentor questions in one panel.
- **SC-002**: A valid clarification answer resumes the council within 500 ms locally.
- **SC-003**: The resumed transcript includes a new turn number and token-streamed mentor output.
- **SC-004**: Blank clarification answers are rejected with a visible message.
- **SC-005**: Automated tests cover clarification validation, resume event generation, turn advancement, and UI state updates.

## Assumptions

- The first resume implementation is browser-held and mock-only.
- The user answers all mentor questions in one response.
- The resumed live mock runtime can use deterministic mock mentor output that references the clarification answer.
- Persisted sessions remain out of scope.
