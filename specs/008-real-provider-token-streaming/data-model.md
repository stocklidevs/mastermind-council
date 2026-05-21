# Data Model: Real Provider Token Streaming

## ProviderStreamChunk

- `type`: `token`, `done`, or `error`
- `text`: token text when type is `token`
- `providerId`
- `model`

## StreamingProviderRequest

- `url`
- `options`
- `parseEvent`

## Validation Rules

- Only public generated text is emitted as tokens.
- Errors are sanitized before leaving provider code.
