# Feature Specification: Real Live Deliberation And Synthesis

**Feature Branch**: `022-real-live-deliberation-synthesis`

**Created**: 2026-05-19

**Status**: Complete

**Input**: User observed that the live real summary was only concatenated mentor answers and asked how more than one turn is currently created.

## Requirements

- **FR-001**: Live real sessions MUST use the configured max turns rather than always stopping after one debate turn.
- **FR-002**: Before each live real turn, each mentor MUST make a public participation decision: claim the stick or abstain for this turn.
- **FR-003**: A new live real turn MUST open only when at least one mentor expresses interest to contribute, question, or respond.
- **FR-004**: Each interested mentor MUST speak at most once in a turn.
- **FR-005**: The session MUST close when no mentor expresses further interest or when max turns is reached.
- **FR-006**: The final synthesis MUST be produced by a configurable provider/model when available.
- **FR-007**: If the configured synthesis model is unavailable, the runtime MUST fall back to a public-safe local synthesis.
- **FR-008**: The browser Session settings MUST expose synthesis provider/model selection and send it to live real sessions.
- **FR-009**: No resolved secrets or 1Password references may appear in browser output, URLs, transcripts, logs, or test output.

## Verification

- Focused tests cover multi-turn interest, configured synthesis model calls, server forwarding, Session settings view-models, and browser request wiring.
- Full `node --test` passes.
