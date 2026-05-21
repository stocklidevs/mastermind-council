# Feature Specification: Live Ceremonial Council Runtime

**Feature Branch**: `004-live-ceremonial-council-runtime`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "Create a live ceremonial council runtime where mentor output streams token by token, the speaking stick is visible as a subtle gold sacred object, the active mentor has a stick icon, mentors can act before and after speaking, mentors can ask end-of-turn clarification questions, participation remains optional per turn, and the experience stays premium, clear, subtle, and future-ready for TTS."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Watch A Live Council Speak (Priority: P1)

A user asks the council a question and sees the deliberation unfold live instead of waiting for a completed response.

**Why this priority**: Live deliberation is the main experience shift. It makes the council feel present, intelligible, and trustworthy because the user can see who is thinking, who has the stick, and what is being said as it emerges.

**Independent Test**: Start a mock live council session and verify the roster, speaking stick, transcript, and status update while the session is running.

**Acceptance Scenarios**:

1. **Given** the council is ready, **When** the user asks a valid question in live mock mode, **Then** the interface shows that the council is convening and the first round begins without waiting for the full session to complete.
2. **Given** a mentor receives the speaking stick, **When** that mentor begins speaking, **Then** the visible stick state and mentor row identify the active speaker.
3. **Given** a mentor is speaking, **When** output arrives, **Then** the mentor utterance appears incrementally token by token.
4. **Given** a mentor completes speaking, **When** the next interested mentor is available, **Then** the speaking stick moves to that mentor and the previous mentor is marked done for the turn.

---

### User Story 2 - Experience A Subtle Ceremonial Chamber (Priority: P2)

A user experiences the council as a calm, premium, ceremonial room rather than a generic chat or game-like fantasy scene.

**Why this priority**: The product promise depends on presence and care. The ceremonial layer should communicate that this is a special moment while preserving clarity and utility.

**Independent Test**: Open the council interface before and during a live session and verify that the golden speaking stick, active mentor icon, motion, contrast, and layout remain calm and readable in light and dark mode.

**Acceptance Scenarios**:

1. **Given** no mentor is speaking, **When** the council is idle, **Then** a physical golden speaking stick rests visibly at the table.
2. **Given** a mentor owns the right to speak, **When** the stick is granted, **Then** a compact stick icon appears beside that mentor and the table stick reflects active state.
3. **Given** a mentor is thinking or speaking, **When** the state changes, **Then** subtle motion or glow communicates activity without making the interface feel like a game.

---

### User Story 3 - Preserve Turn Rules And Clarification Questions (Priority: P3)

A user can observe mentors opt in or abstain per turn, speak once if interested, and collect clarification questions at the end of the turn.

**Why this priority**: The speaking-stick protocol is the core interaction rule. Clarification collection gives mentors a way to ask the user for missing information without interrupting the current speaker.

**Independent Test**: Run a mock session where at least one mentor abstains and another asks a clarification question, then verify the turn closes before questions are presented.

**Acceptance Scenarios**:

1. **Given** a new turn begins, **When** mentors evaluate participation, **Then** interested mentors enter the speaking pool and uninterested mentors are marked abstained for that turn.
2. **Given** a mentor has already spoken in the current turn, **When** that mentor remains interested, **Then** the mentor cannot receive the stick again until a later turn.
3. **Given** one or more mentors ask clarification questions, **When** the interested pool has finished speaking, **Then** the council pauses and presents the collected questions to the user.
4. **Given** no clarification is required and the council is not finished, **When** the turn closes, **Then** another turn may start until a decision or max-turn limit is reached.

### Edge Cases

- If a live session fails before any mentor speaks, the user sees a safe error state and can ask again.
- If a mentor emits no tokens, the transcript marks the mentor as unable to contribute for that turn.
- If a session is already running, a new question cannot start a second overlapping live session.
- If max turns are reached without consensus, the final counsel preserves dissent and explains the closure reason.
- If the browser loses the live connection, the interface reports that the session was interrupted without inventing missing mentor output.

### Council Integrity & Safety *(mandatory for council-facing features)*

- The feature preserves uncertainty and dissent by keeping per-mentor contributions visible and by requiring final counsel to state whether the council reached a decision, paused for clarification, or closed at max turns.
- Consensus is never represented as proof of truth; final counsel includes verification guidance when assumptions remain.
- Secrets and provider keys remain server-side. Live events must not expose API keys, resolved 1Password values, plaintext secret references, hidden prompts, or chain-of-thought.
- This slice introduces no npm packages. If future streaming or TTS packages are introduced, selected versions must be checked against a maintained vulnerability database, pinned, and installed with `npm ci`.
- High-stakes questions require visible caution and verification guidance in final counsel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a live council mode where session activity appears while the council is running.
- **FR-002**: System MUST display mentor states including idle, thinking, holding stick, speaking, done, abstained, asking clarification, and error.
- **FR-003**: System MUST render token-level mentor utterance updates as they arrive.
- **FR-004**: System MUST separate pre-speech action, spoken utterance, and post-speech action in the live transcript.
- **FR-005**: System MUST show speaking-stick ownership where it helps the user understand the live state.
- **FR-006**: System MUST show a compact gold stick indicator beside the mentor who currently owns the right to speak.
- **FR-007**: System MUST keep the visual language subtle, premium, calm, and readable rather than game-like.
- **FR-008**: System MUST allow mentors to abstain from a turn.
- **FR-009**: System MUST prevent a mentor from speaking more than once in the same turn.
- **FR-010**: System MUST collect mentor clarification questions through a turn and present them after the interested mentor pool finishes.
- **FR-011**: System MUST support a configurable max-turn limit with a default of 3 for live sessions.
- **FR-012**: System MUST leave room for future TTS by carrying voice/speech-ready state without requiring audio playback in this slice.
- **FR-013**: System MUST log live lifecycle events safely without full prompts, full outputs, secrets, or 1Password references.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be vulnerability-checked, pinned in `package-lock.json`, and installed with `npm ci`.

### Key Entities

- **Live Council Session**: A running council interaction with question, status, max turns, rounds, events, transcript, clarification questions, and final counsel.
- **Turn**: A numbered deliberation cycle containing interested mentors, abstentions, stick grants, token streams, actions, clarification questions, and closure state.
- **Mentor Activity State**: The user-visible state of a mentor during live deliberation.
- **Speaking Stick**: The ceremonial object and protocol token granting the right to speak.
- **Live Event**: A safe public runtime event emitted to the browser and logs.
- **Mentor Question**: A clarification request collected during a turn and presented to the user after the turn closes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user sees visible live activity within 500 ms of starting a mock live session on a local machine.
- **SC-002**: During a mock live session, each speaking mentor's utterance visibly updates in at least three increments before completion.
- **SC-003**: The active speaking-stick owner is identifiable in the roster and table area for 100% of stick grants.
- **SC-004**: A mock live session with abstentions and clarification questions completes without breaking the once-per-turn speaking rule.
- **SC-005**: Light and dark mode remain readable at desktop and narrow viewport widths without overlapping core text or controls.
- **SC-006**: Automated tests cover event generation, token streaming order, once-per-turn enforcement, clarification collection, and safe log payloads.

## Assumptions

- The first implementation uses mock live streaming before provider-native streaming.
- Server-sent one-way event delivery is sufficient for the first live runtime slice.
- Real provider token streaming and TTS playback are deferred.
- A larger physical table stick should return only when it has useful behavior or stronger narrative value; the current MVP uses compact ownership indicators instead.
- Default max turns for live sessions is 3.
- Clarification answers can be implemented in a later slice; this slice can pause and display collected questions.
- Abstention remains part of the council protocol.
