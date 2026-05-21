# Feature Specification: Mock Council Web UI

**Feature Branch**: `002-mock-council-web-ui`

**Created**: 2026-05-16

**Status**: Draft

**Input**: User description: "Create the MVP local web interface for the mock council protocol. A user can open the app locally, enter a question, run the existing mock council protocol, observe the council debate as structured rounds with speaking-stick ownership, abstentions, action fields, and contributions, and read the final synthesis with agreement state, dissent, assumptions, and verification guidance. The UI should use the already implemented mock protocol core and must not introduce real LLM providers, API keys, persistence, accounts, or hosted SaaS behavior."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask The Mock Council From A Web Page (Priority: P1)

A user opens the local app, enters a question, starts a council session, and
receives a visible transcript plus final synthesis from the existing mock
protocol core.

**Why this priority**: This turns the protocol core into the first usable app
experience while preserving the local-first MVP boundary.

**Independent Test**: Can be tested by opening the local page, entering a
question, starting the session, and verifying that a transcript and synthesis
appear without entering API keys or connecting to a provider.

**Acceptance Scenarios**:

1. **Given** the local app is open, **When** the user enters a non-empty question
   and starts the council, **Then** the page displays a completed mock council
   session.
2. **Given** the question input is empty, **When** the user tries to start the
   council, **Then** the page asks for a question and does not run a session.
3. **Given** a session completes, **When** the user inspects the page, **Then**
   the final synthesis includes agreement state, closure reason, main answer,
   assumptions, and verification guidance.

---

### User Story 2 - Observe Speaking-Stick Debate (Priority: P2)

A user can visually follow the structured deliberation: rounds, stick grants,
speakers, abstentions, action fields, and contribution order.

**Why this priority**: The speaking-stick ritual is the product's core identity.
The UI must make the protocol legible instead of hiding it behind a single final
answer.

**Independent Test**: Can be tested by running a mock council that includes at
least one abstention and one action field, then verifying that the transcript
shows both alongside ordered contributions.

**Acceptance Scenarios**:

1. **Given** the mock protocol grants the speaking stick to an agent, **When**
   the transcript renders, **Then** the stick holder is visible for that
   contribution.
2. **Given** an agent abstains, **When** the transcript renders, **Then** the
   abstention is visible without appearing as a spoken contribution.
3. **Given** a contribution includes an action field, **When** it renders,
   **Then** the action is visually distinct from the utterance.

---

### User Story 3 - Review Dissent And Safety Cues (Priority: P3)

A user can distinguish consensus from disagreement and can see minority views,
unresolved assumptions, and verification guidance when relevant.

**Why this priority**: The project constitution requires epistemic honesty. The
first UI must not flatten a split decision into a false consensus.

**Independent Test**: Can be tested by running a dissenting mock council scenario
and verifying that the synthesis area shows both the main view and minority view.

**Acceptance Scenarios**:

1. **Given** the mock protocol returns a split decision, **When** the synthesis
   renders, **Then** the UI labels it as a split decision.
2. **Given** the synthesis includes minority views, **When** the user reviews
   the result, **Then** those views are visible in a dedicated area.
3. **Given** the synthesis includes verification guidance, **When** the result
   renders, **Then** the guidance is visible near the final answer.

---

### Edge Cases

- Empty or whitespace-only question.
- Very long user question.
- Mock session with all agents abstaining.
- Mock session with an invalid protocol event.
- Mock session with no minority views.
- Mock session with a split decision and multiple assumptions.
- User starts another session after one has already completed.
- Browser viewport is narrow enough for mobile layout.

### Council Integrity & Safety *(mandatory for council-facing features)*

- The UI must label agreement state and closure reason rather than implying that
  every final answer is a consensus.
- The UI must render minority views and assumptions when the protocol provides
  them.
- This feature must not request, store, display, or validate real provider API
  keys.
- If npm packages are introduced during implementation, exact selected versions
  must be checked against npm audit, OSV.dev, or an equivalent maintained
  vulnerability database before adoption, pinned in `package-lock.json`, and
  installed with `npm ci`.
- High-stakes user questions must still show verification guidance supplied by
  the synthesis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a local web page where the user can enter a
  question for the mock council.
- **FR-002**: System MUST prevent empty or whitespace-only questions from
  starting a council session.
- **FR-003**: System MUST run the existing mock council protocol core after the
  user starts a valid session.
- **FR-004**: System MUST render session rounds in order.
- **FR-005**: System MUST render speaking-stick grant events or equivalent
  speaker ownership for each contribution.
- **FR-006**: System MUST render accepted contributions with speaker name,
  role, utterance, and optional action field.
- **FR-007**: System MUST render abstentions separately from spoken
  contributions.
- **FR-008**: System MUST render invalid protocol events when they occur.
- **FR-009**: System MUST render final synthesis with agreement state, closure
  reason, main answer, minority views when present, assumptions, and
  verification guidance.
- **FR-010**: System MUST allow the user to run a new mock session after a
  previous session completes.
- **FR-011**: System MUST remain usable on desktop and narrow mobile viewports.
- **FR-012**: System MUST NOT introduce provider setup, API-key entry,
  persistence, account creation, or hosted SaaS behavior.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs,
  transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final
  synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be
  vulnerability-checked, pinned in `package-lock.json`, and installed with
  `npm ci`.

### Key Entities

- **Question Form**: User input and start action for a mock council session.
- **Council Roster**: Visible list of mock council members and roles.
- **Debate Transcript**: Ordered visual representation of rounds, abstentions,
  stick ownership, contributions, and invalid protocol events.
- **Contribution Card**: One rendered agent contribution with action and
  utterance separated.
- **Synthesis Panel**: Final answer area showing agreement state, closure
  reason, dissent, assumptions, and verification guidance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open the local page, enter a valid question, and see a
  completed mock council result in under 10 seconds.
- **SC-002**: 100% of contribution renderings show the speaker name and preserve
  the protocol speaking order.
- **SC-003**: A mock abstention scenario displays at least one abstention outside
  the spoken contribution list.
- **SC-004**: A split-decision scenario displays the split-decision label and at
  least one minority view.
- **SC-005**: An empty question does not run the protocol and displays a
  user-visible validation message.
- **SC-006**: The page remains readable and interactive at a mobile-width
  viewport.

## Assumptions

- The feature uses the existing mock protocol core from feature 001.
- The first UI can use predefined mock council scenarios rather than a full
  council configuration screen.
- No session persistence is required for this slice.
- No real LLM providers or secrets are involved.
- Visual polish matters, but the core acceptance target is a usable local MVP
  rather than a finished brand system.
