# Feature Specification: Mock Council Protocol

**Feature Branch**: `001-mock-council-protocol`

**Created**: 2026-05-16

**Status**: Draft

**Input**: User description: "Define the MVP council session protocol using mock agents. A user submits a question, configurable mock council members independently decide whether to participate in each round, eligible agents claim a single speaking stick one at a time, no agent can speak twice in the same round, each contribution includes a public utterance and optional short action field, rounds continue until no eligible agent wants to speak or a stopping condition is reached, and the session ends with a synthesis that can preserve consensus, rough consensus, split decision, dissent, assumptions, and next-step verification guidance."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run A Mock Council Session (Priority: P1)

A user submits a question to a predefined mock council and receives a complete
session transcript showing which mock agents participated, who held the speaking
stick, what each agent said, and how the session closed.

**Why this priority**: This is the smallest useful proof of the product. It
validates that the council is a structured deliberation system, not a list of
parallel answers.

**Independent Test**: Can be tested by submitting one question to a mock council
and verifying that the resulting transcript contains at least one round, valid
speaking-stick ownership, agent contributions, and a final synthesis.

**Acceptance Scenarios**:

1. **Given** a mock council with multiple configured members, **When** the user
   submits a question, **Then** the session starts and records the user's
   question as the session prompt.
2. **Given** a session round with eligible participants, **When** an agent is
   granted the speaking stick, **Then** only that agent contributes until the
   stick is released.
3. **Given** an agent has already spoken in the current round, **When** the same
   agent attempts to speak again, **Then** the contribution is rejected for that
   round.
4. **Given** the council reaches a stopping condition, **When** the session
   closes, **Then** the user receives a final synthesis with the closure reason.

---

### User Story 2 - Preserve Visible Council Dynamics (Priority: P2)

A user can see which agents wanted to participate, which agents abstained, the
order in which agents spoke, and each speaker's short action field when present.

**Why this priority**: The app's identity depends on visible deliberation. The
speaking stick, abstention, and action fields make the council legible and
distinctive.

**Independent Test**: Can be tested by running a mock session where at least one
agent participates, one abstains, and one contribution includes an action field;
the transcript must expose all three events.

**Acceptance Scenarios**:

1. **Given** a mock agent decides not to contribute in a round, **When** the
   round transcript is displayed, **Then** the abstention is visible without
   creating a speaking contribution.
2. **Given** an agent contribution includes an action field, **When** the
   contribution appears in the transcript, **Then** the action appears as a short
   public stage direction separate from the utterance.
3. **Given** multiple agents request the speaking stick in a round, **When** the
   round completes, **Then** the transcript preserves the actual speaking order.

---

### User Story 3 - Receive Honest Synthesis (Priority: P3)

A user receives a final synthesis that distinguishes consensus, rough consensus,
split decision, dissent, assumptions, and recommended next-step verification.

**Why this priority**: The product must avoid false certainty. A good final
answer is allowed to say that the council does not fully agree.

**Independent Test**: Can be tested by using mock agents with conflicting
positions and verifying that the final synthesis preserves the disagreement
instead of flattening it into a single confident answer.

**Acceptance Scenarios**:

1. **Given** all participating agents support the same conclusion, **When** the
   session closes, **Then** the synthesis labels the outcome as consensus.
2. **Given** agents disagree on a material point, **When** the session closes,
   **Then** the synthesis includes the dominant view and a minority or dissenting
   view.
3. **Given** the session stops because of a round cap or lack of further
   participation, **When** the synthesis is produced, **Then** it names the
   closure reason and any unresolved assumptions.

---

### Edge Cases

- All mock agents abstain in the first round.
- Only one mock agent wants to participate.
- A mock agent attempts to claim the speaking stick twice in the same round.
- Two or more mock agents request the speaking stick at the same decision point.
- A contribution is missing an utterance.
- An action field is too long or attempts to include hidden reasoning.
- The council reaches the maximum round count without consensus.
- Conflicting mock positions cannot be honestly reconciled.

### Council Integrity & Safety *(mandatory for council-facing features)*

- The feature preserves uncertainty by requiring the final synthesis to include
  closure reason, assumptions, and unresolved disagreement when present.
- The feature prevents consensus from being presented as proof of truth by
  distinguishing consensus from rough consensus and split decision.
- No provider keys or real model secrets are involved in this mock-agent slice.
  Future provider-backed versions must keep secrets out of browser code, logs,
  transcripts, screenshots, and plaintext persistence.
- No npm packages are introduced by this feature spec. If a later plan uses npm
  for implementation, selected package versions must be checked against npm
  audit, OSV.dev, or an equivalent maintained vulnerability database before
  adoption.
- High-stakes prompts must produce synthesis language that includes uncertainty,
  scope limits, and a recommendation to verify with appropriate primary sources
  or professionals.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a user to submit a question to a mock council
  session.
- **FR-002**: System MUST support a configurable set of mock council members
  with names, roles, speaking styles, and deterministic mock behaviors.
- **FR-003**: System MUST start each session with a first round after the user
  submits a question.
- **FR-004**: System MUST allow each mock council member to decide whether to
  participate or abstain in each round.
- **FR-005**: System MUST maintain a single speaking stick that can be held by
  no more than one agent at a time.
- **FR-006**: System MUST prevent an agent from contributing more than once in
  the same round.
- **FR-007**: System MUST record each accepted contribution with speaker,
  utterance, optional action field, round number, and speaking order.
- **FR-008**: System MUST reject contributions that have no public utterance.
- **FR-009**: System MUST keep action fields short and separate from utterances.
- **FR-010**: System MUST end a round when all willing eligible agents have
  spoken or no eligible agent requests the speaking stick.
- **FR-011**: System MUST close the session through at least one supported
  stopping condition: consensus, rough consensus, split decision, no further
  participation, maximum rounds, or user stop.
- **FR-012**: System MUST produce a final synthesis that includes closure reason,
  main answer, dissent or minority view when present, assumptions, and next-step
  verification guidance.
- **FR-013**: System MUST produce a transcript that preserves the sequence of
  rounds, abstentions, stick grants, contributions, and synthesis.
- **FR-014**: System MUST make invalid protocol events visible to verification
  rather than silently accepting them.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs,
  transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final
  synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be
  vulnerability-checked, pinned in `package-lock.json`, and installed with
  `npm ci`.

### Key Entities

- **Council Member**: A mock participant with a name, role, speaking style,
  participation behavior, and contribution behavior.
- **Council Session**: A complete deliberation started from one user question
  and ending in one final synthesis.
- **Round**: One cycle in which each willing eligible agent may speak at most
  once.
- **Speaking Stick**: The exclusive right to contribute at a point in a round.
- **Contribution**: A public statement from one agent, optionally paired with a
  short action field.
- **Abstention**: A visible decision by an agent not to contribute in a round.
- **Synthesis**: The final user-facing result of the council session, including
  agreement state and unresolved issues.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a deterministic mock session with three participating agents,
  100% of accepted contributions are associated with exactly one speaking-stick
  grant.
- **SC-002**: In every completed round, 0 agents contribute more than once.
- **SC-003**: A mock session with one abstaining agent visibly records the
  abstention in the transcript.
- **SC-004**: A mock session with conflicting agent positions produces a final
  synthesis that includes both a main view and a dissenting or minority view.
- **SC-005**: A mock session that reaches the maximum round count closes with a
  synthesis that names the round cap as the closure reason.
- **SC-006**: A reviewer can inspect one session transcript and reconstruct the
  order of rounds, stick grants, accepted contributions, abstentions, and final
  synthesis without relying on hidden state.

## Assumptions

- The first slice uses mock agents only; no real LLM provider calls are required.
- Mock agent behavior can be deterministic so protocol verification is reliable.
- The first protocol may run without persistence beyond the produced transcript.
- The first synthesis can be generated from mock positions and protocol state,
  without claiming factual authority.
- User stop is a supported closure reason even if the first UI for invoking it
  is deferred to a later interface spec.
