# Feature Specification: Council Synthesis Artifact

**Feature Branch**: `023-council-synthesis-artifact`

**Created**: 2026-05-19

**Status**: Complete

**Input**: User requested that the synthesis aspect of the flow become a first-class artifact instead of a thin final answer.

## Requirements

- **FR-001**: The synthesis prompt MUST request a Council Synthesis Artifact, not a concatenation of mentor answers.
- **FR-002**: The artifact MUST include main answer, agreement state, minority views, assumptions, next actions, unresolved questions, mentor grounding, confidence, and verification guidance.
- **FR-003**: The parser MUST preserve rich artifact fields from model output.
- **FR-004**: The parser MUST reject obvious transcript concatenation and use the safe fallback synthesis instead.
- **FR-005**: The live synthesis UI MUST render next actions, mentor grounding, unresolved questions, assumptions, dissent, and verification guidance when present.
- **FR-006**: The fallback synthesis MUST include public-safe grounding and quality metadata.
- **FR-007**: No resolved secrets or 1Password references may appear in synthesis prompts, artifacts, browser output, logs, or tests.

## Verification

- Focused tests cover synthesis prompt contract, artifact parsing, concatenation rejection, runtime artifact fields, server streaming, and static browser wiring.
- Full `node --test` passes.
