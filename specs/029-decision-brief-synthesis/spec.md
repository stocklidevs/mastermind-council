# Feature Specification: Decision Brief Synthesis

## User Story

As a user reading the council output, I want the synthesis to transform the debate into a direct decision brief, so I do not have to reread a mentor-by-mentor recap to understand the counsel.

## Requirements

- **FR-001**: The synthesis model prompt MUST ask for a direct decision brief rather than a transcript recap.
- **FR-002**: The `mainAnswer` field MUST avoid mentor names and chronological recap language; attribution belongs in `mentorGrounding`.
- **FR-003**: The parser MUST reject model synthesis outputs that recap multiple mentor positions by name even when they do not use the existing blocked verbs.
- **FR-004**: The local fallback synthesis MUST not build its `mainAnswer` by concatenating distilled mentor points.
- **FR-005**: The fallback artifact MUST still preserve source attribution through compact `mentorGrounding`.

## Success Criteria

- Tests reject a named multi-mentor recap that previously passed.
- Tests prove fallback `mainAnswer` uses a decision-brief shape and does not contain exact mentor point concatenation.
- Full test suite passes with no new dependencies.

## Out of Scope

- Changing provider transport behavior.
- Adding new UI controls.
- Persisting sessions beyond existing saved consultation behavior.
