# Data Model: Real Streaming Smoke Validation

## StreamingSmokeResult

- `providerName`
- `model`
- `ok`
- `tokenCount`
- `preview`
- `latencyMs`
- `error`

## Validation Rules

- Preview is truncated.
- Secrets and `op://` references are redacted.
