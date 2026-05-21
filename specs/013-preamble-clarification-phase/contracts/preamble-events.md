# Contract: Preamble Clarification Events

## `preamble.started`

Emitted after `session.started` when preamble questions are configured.

## `mentor.question`

May be emitted with `phase: "preamble"` before any debate turn.

## `preamble.awaiting_clarification`

Payload:

```json
{
  "phase": "preamble",
  "questions": [
    {
      "mentorId": "socrates",
      "mentorName": "Socrates",
      "question": "What constraint is unnamed?"
    }
  ]
}
```

## Resume

When prior events contain `preamble.awaiting_clarification`, `createClarificationResumeEvents` starts the resumed debate at turn 1.
