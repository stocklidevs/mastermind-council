# Data Model: Mock Council Web UI

## QuestionFormState

Represents the current user input and validation state.

Fields:

- `question`: current text input.
- `error`: user-visible validation message, or `null`.
- `isRunning`: whether the UI is currently running a session.

Validation:

- `question` must contain non-whitespace text before a session can start.
- Empty question attempts must set `error` and avoid running the protocol.

## CouncilViewModel

Represents data needed to render the council roster and transcript.

Fields:

- `members`: display-ready mock council members.
- `rounds`: ordered round view models.
- `events`: ordered transcript events.
- `synthesis`: synthesis view model when a session has completed.

Validation:

- Contribution order must match protocol event order.
- Abstentions must render separately from spoken contributions.

## RoundViewModel

Represents one rendered debate round.

Fields:

- `number`: round number.
- `items`: ordered rendered transcript items for that round.

Validation:

- Each contribution item must identify its speaker and stick ownership.
- Abstention items must not appear as contributions.

## ContributionViewModel

Represents one visible council contribution.

Fields:

- `speakerName`: mock council member display name.
- `speakerRole`: mock council member role.
- `utterance`: public contribution.
- `action`: optional stage direction.
- `order`: contribution order.

Validation:

- `utterance` must be visible.
- `action`, when present, must be visually distinct from `utterance`.

## SynthesisViewModel

Represents the final answer area.

Fields:

- `agreementState`: label shown to the user.
- `closureReason`: reason the session ended.
- `mainAnswer`: primary synthesis.
- `minorityViews`: material dissent or minority views.
- `assumptions`: unresolved assumptions.
- `verificationGuidance`: recommended next checks.

Validation:

- Split decisions require visible minority views.
- Verification guidance must render when present.

