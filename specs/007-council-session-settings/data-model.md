# Data Model: Council Session Settings

## CouncilSessionSettings

- `maxTurns`: integer between 1 and 5, default 3

## Validation Rules

- Non-numeric values normalize to default.
- Values below 1 clamp to 1.
- Values above 5 clamp to 5.
