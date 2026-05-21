# Contract: Clarification Resume

## Browser Action

`submitClarificationAnswer(answerText)`

## Input

```json
{
  "answerText": "The hidden constraint is that I only have two hours this week."
}
```

## Validation Errors

- `clarification-answer-required`: answer is blank
- `clarification-not-awaited`: council is not paused for clarification

## Resumed Events

The app appends public live events to the existing browser-held session:

- `clarification.answered`
- `turn.started`
- `mentor.thinking`
- `stick.granted`
- `mentor.pre_action`
- `mentor.token`
- `mentor.post_action`
- `mentor.done`
- `turn.closed`
- `session.synthesized`

## Safety

- The answer is user-provided public context.
- Resume events do not include secrets, hidden prompts, or chain-of-thought.
