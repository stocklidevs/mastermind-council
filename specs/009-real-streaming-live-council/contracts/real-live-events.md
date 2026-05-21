# Contract: Real Live Events

`GET /api/council/live?mode=real&question=<encoded>&maxTurns=1`

Events reuse the existing live stream envelope:

- `session.started`
- `turn.started`
- `mentor.thinking`
- `stick.granted`
- `mentor.token`
- `mentor.done`
- `mentor.abstained`
- `mentor.error`
- `turn.closed`
- `session.synthesized`
