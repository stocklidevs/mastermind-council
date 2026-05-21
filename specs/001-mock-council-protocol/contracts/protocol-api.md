# Contract: Mock Council Protocol API

This contract describes the public behavior expected from the protocol core. It
is not a network API.

## createCouncilSession(input)

Creates a pending council session.

Input:

```json
{
  "question": "What should I do first?",
  "members": [
    {
      "id": "athena",
      "name": "Athena",
      "role": "Strategist",
      "style": "measured and direct",
      "behavior": "strategy"
    }
  ],
  "options": {
    "maxRounds": 5
  }
}
```

Output:

```json
{
  "id": "session-1",
  "status": "pending",
  "question": "What should I do first?",
  "events": []
}
```

Rules:

- Reject an empty question.
- Reject duplicate member IDs.
- Default `maxRounds` to 5 when not supplied.

## runCouncilSession(session)

Runs the mock council session until a stopping condition is reached.

Output:

```json
{
  "status": "closed",
  "rounds": [],
  "events": [],
  "synthesis": {
    "agreementState": "split-decision",
    "closureReason": "split-decision",
    "mainAnswer": "Start with the smallest reversible test.",
    "minorityViews": [
      "One member recommends clarifying values before testing."
    ],
    "assumptions": [
      "The user wants a practical next action."
    ],
    "verificationGuidance": [
      "Review the result after one real-world experiment."
    ]
  }
}
```

Rules:

- Grant the speaking stick to only one eligible member at a time.
- Reject repeat speakers within a round.
- Record abstentions as visible events.
- Close when no eligible member wants to speak or `maxRounds` is reached.
- Preserve dissent in synthesis when mock stances conflict.

## Transcript Event Types

Required event types:

- `session.started`
- `round.started`
- `agent.abstained`
- `stick.granted`
- `contribution.accepted`
- `protocol.invalid-event`
- `round.closed`
- `session.synthesized`

Each event must include:

- `type`
- `sessionId`
- `sequence`
- `timestamp` or deterministic sequence-only substitute for tests

