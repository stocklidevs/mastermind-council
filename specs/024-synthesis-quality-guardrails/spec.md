# Feature Specification: Synthesis Quality Guardrails

## User Need

The council discussion can be interesting while the final synthesis still fails to synthesize. The synthesis must become a decision-quality artifact instead of a concatenation or mentor-by-mentor recap.

## Functional Requirements

- **FR-001**: The synthesis prompt MUST request a Council Synthesis Artifact with a public final answer, agreement state, minority views, assumptions, next actions, unresolved questions, mentor grounding, confidence, and verification guidance.
- **FR-002**: The synthesis prompt MUST explicitly forbid transcript concatenation, mentor-by-mentor recap, private chain-of-thought, and invented consensus.
- **FR-003**: The synthesis parser MUST preserve rich artifact fields returned by the configured synthesis model.
- **FR-004**: The synthesis parser MUST reject obvious transcript concatenation and recap-shaped outputs, including multiple mentor-name colon blocks and multiple "mentor says/argues/suggests" patterns.
- **FR-005**: Rejected synthesis output MUST fall back to the local safe synthesis artifact rather than displaying a low-quality recap as the final answer.
- **FR-006**: The web UI MUST display artifact sections for next actions, mentor grounding, and unresolved questions when present.
- **FR-007**: Synthesis artifacts MUST remain public-safe and never expose secrets, API key references, or private reasoning.

## Success Criteria

- Focused synthesis tests prove rich artifacts parse successfully.
- Regression tests prove concatenated and recap-shaped summaries are rejected.
- Runtime tests prove configured synthesis model output keeps next-action fields.
- Static UI tests prove the new artifact sections are wired into the page.
