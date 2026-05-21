# Data Model: Real Streaming Live Council

## RealLiveCouncilEvent

- `type`
- `sessionId`
- `sequence`
- `turnNumber`
- `mentorId`
- `payload`

## SupportedProvider

- `id`
- `adapter`
- `model`
- `secretReference`

## Validation Rules

- Token events must contain public generated text only.
- Unsupported providers emit safe public errors or abstentions.
- Secrets and secret references are redacted from every event.
