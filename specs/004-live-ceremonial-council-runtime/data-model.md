# Data Model: Live Ceremonial Council Runtime

## LiveCouncilSession

- `id`: stable session id
- `question`: user question
- `status`: `idle`, `running`, `awaiting_clarification`, `synthesized`, `error`
- `maxTurns`: configured maximum turn count
- `turns`: ordered `LiveTurn` list
- `events`: ordered `LiveCouncilEvent` list
- `clarificationQuestions`: questions collected during the current or final turn
- `synthesis`: final counsel when available

## LiveTurn

- `number`: one-based turn number
- `status`: `open`, `awaiting_clarification`, `closed`
- `interestedMentorIds`: mentors participating in the turn
- `abstainedMentorIds`: mentors not participating in the turn
- `spokenMentorIds`: mentors who have already used the stick
- `contributions`: ordered mentor contributions
- `clarificationQuestions`: questions collected during the turn

## MentorActivityState

- `mentorId`: mentor identifier
- `state`: `idle`, `thinking`, `holding_stick`, `speaking`, `done`, `abstained`, `asking_clarification`, `error`
- `turnNumber`: current turn when applicable
- `hasStick`: whether the mentor owns the speaking stick
- `speechState`: `none`, `pre_action`, `speaking`, `post_action`, `complete`

## LiveContribution

- `mentorId`: speaker identifier
- `turnNumber`: turn number
- `preAction`: optional action before speaking
- `tokens`: ordered public utterance tokens
- `postAction`: optional action after speaking
- `utterance`: final reconstructed public answer
- `stance`: optional contribution stance
- `clarificationQuestion`: optional user-facing question

## LiveCouncilEvent

- `type`: public event type
- `sessionId`: session identifier
- `sequence`: monotonically increasing event sequence
- `turnNumber`: turn number when applicable
- `mentorId`: mentor identifier when applicable
- `payload`: event-specific public data

## SpeakingStickState

- `ownerMentorId`: mentor holding the stick, or null
- `label`: short user-facing state
- `isActive`: whether the stick is currently granted
- `turnNumber`: active turn when applicable

## Validation Rules

- A mentor cannot receive the stick twice in the same turn.
- Token events must belong to the mentor currently holding the stick.
- Pre-action events precede token events for a contribution.
- Post-action events follow all token events for a contribution.
- Clarification questions are presented only after the interested mentor pool finishes.
- Events must not contain API keys, resolved secrets, `op://` references, hidden prompts, or chain-of-thought.
