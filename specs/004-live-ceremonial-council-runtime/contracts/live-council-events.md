# Contract: Live Council Events

## Endpoint

`GET /api/council/live?question=<encoded question>&mode=mock&maxTurns=3`

Streams public-safe server-sent events for one local live council session.

## Event Envelope

```json
{
  "type": "mentor.token",
  "sessionId": "live-session-1",
  "sequence": 12,
  "turnNumber": 1,
  "mentorId": "athena",
  "payload": {
    "token": "Focus "
  }
}
```

## Event Types

- `session.started`: live session accepted and running
- `turn.started`: a new turn begins
- `mentor.thinking`: mentor is deciding whether to participate or preparing to speak
- `mentor.abstained`: mentor does not join the interested pool for this turn
- `stick.granted`: mentor owns the speaking stick
- `mentor.pre_action`: mentor performs an action before speaking
- `mentor.token`: one public utterance token
- `mentor.post_action`: mentor performs an action after speaking
- `mentor.done`: mentor completed the contribution
- `mentor.question`: mentor asks a clarification question for end-of-turn collection
- `turn.awaiting_clarification`: turn ended with one or more user questions
- `turn.closed`: turn ended without immediate clarification
- `session.synthesized`: final counsel is available
- `session.error`: safe public error

## Safety

- Events must not include resolved provider secrets.
- Events must not include 1Password references.
- Events must not include full hidden prompts or chain-of-thought.
- Token events are public answer text only.

## Browser Behavior

- Update roster state from mentor activity events.
- Move visible stick from `stick.granted`.
- Append token text into the active mentor transcript item.
- Render pre-action and post-action separately from utterance text.
- Present collected clarification questions only after `turn.awaiting_clarification`.
