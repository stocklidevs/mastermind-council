# Data Model: Mock Council Protocol

## CouncilMember

Represents one configured mock participant.

Fields:

- `id`: stable unique identifier.
- `name`: display name.
- `role`: council role or archetype.
- `style`: short speaking style descriptor.
- `behavior`: deterministic participation/contribution behavior profile.

Validation:

- `id` must be unique within a council.
- `name` and `role` must be non-empty.
- `behavior` must be callable or resolvable by the protocol engine.

## CouncilSession

Represents one complete deliberation for one user question.

Fields:

- `id`: stable session identifier.
- `question`: user-submitted prompt.
- `members`: configured council members.
- `rounds`: ordered list of rounds.
- `events`: ordered public transcript events.
- `synthesis`: final synthesis once closed.
- `status`: `pending`, `running`, or `closed`.

Validation:

- `question` must be non-empty.
- A session must have at least one council member.
- A closed session must have a synthesis.

## Round

Represents one cycle where each willing eligible member may speak once.

Fields:

- `number`: 1-based round number.
- `spokenMemberIds`: members who have contributed this round.
- `abstainedMemberIds`: members who abstained this round.
- `contributions`: accepted contributions in speaking order.
- `status`: `open` or `closed`.

Validation:

- A member ID cannot appear more than once in `spokenMemberIds`.
- A closed round cannot accept new contributions.

## SpeakingStick

Represents exclusive speaking rights.

Fields:

- `holderId`: current holder, or `null` when on the table.
- `roundNumber`: round where the stick is active.

Validation:

- Only one holder is allowed at a time.
- A member who has already spoken in the round cannot receive the stick again.

## Contribution

Represents one public statement from one council member.

Fields:

- `speakerId`: council member ID.
- `roundNumber`: round where the contribution occurred.
- `order`: speaking order within the session.
- `utterance`: public contribution text.
- `action`: optional short stage direction.
- `stance`: optional concise position label.

Validation:

- `utterance` must be non-empty.
- `action`, when present, must be short and must not contain hidden reasoning.

## Abstention

Represents a visible decision not to speak in a round.

Fields:

- `memberId`: abstaining council member.
- `roundNumber`: round where abstention occurred.
- `reason`: optional public reason.

Validation:

- Abstention does not grant speaking rights.
- A member may abstain only once per round.

## Synthesis

Represents the final user-facing result.

Fields:

- `agreementState`: `consensus`, `rough-consensus`, `split-decision`, or
  `unresolved`.
- `closureReason`: `consensus`, `rough-consensus`, `split-decision`,
  `no-further-participation`, `max-rounds`, or `user-stop`.
- `mainAnswer`: concise final answer.
- `minorityViews`: material dissenting views.
- `assumptions`: unresolved assumptions.
- `verificationGuidance`: next checks or sources the user should use.

Validation:

- `closureReason` is required.
- Material disagreement requires at least one `minorityViews` entry.
- `max-rounds` closure must say what remains unresolved.

## State Transitions

```text
pending -> running -> closed

round open -> stick granted -> contribution accepted -> stick released
round open -> abstention recorded
round open -> round closed
session running -> synthesis created -> session closed
```

