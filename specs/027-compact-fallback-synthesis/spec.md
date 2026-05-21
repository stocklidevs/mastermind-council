# Feature Specification: Compact Fallback Synthesis

## User Need

When the configured synthesis model is unavailable, rejected, or returns a recap-shaped artifact, the app falls back to local synthesis. That fallback must still feel like synthesis. It must not dump the full mentor transcript into the main answer, minority views, or mentor grounding.

## Functional Requirements

- **FR-001**: Fallback synthesis MUST produce a compact public answer instead of concatenating mentor utterances.
- **FR-002**: Fallback synthesis MUST label itself clearly as fallback output.
- **FR-003**: Fallback mentor grounding MUST preserve named source attribution with short distilled points, not full transcript passages.
- **FR-004**: Fallback minority views MUST remain concise and must not repeat full mentor speeches.
- **FR-005**: Fallback synthesis MUST keep the existing secret safety guarantees.
- **FR-006**: The synthesis model label in the UI MUST use the provider's human-readable name when available.

## Success Criteria

- Regression tests prove fallback `mainAnswer` does not include `Mentor:` transcript blocks.
- Regression tests prove fallback sections stay compact even when mentor output is long.
- Focused live real runtime tests pass.
- Full test suite passes.
