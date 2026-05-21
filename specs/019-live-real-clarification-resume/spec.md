# Feature Specification: Live Real Clarification Resume

**Feature Branch**: `019-live-real-clarification-resume`

**Created**: 2026-05-19

**Status**: Complete

**Input**: User observed that after answering a live real preamble clarification, the transcript showed canned mock resume text such as mentors "receiving the clarified context" instead of real mentor answers.

## Requirements

- **FR-001**: When a live real council pauses for clarification, the user's answer MUST resume through the real provider streaming path, not the mock clarification event generator.
- **FR-002**: The resumed real-provider prompt MUST include the original question and the user's clarification in a visible, public-safe context section.
- **FR-003**: The browser MUST preserve the existing live transcript and append resumed real-provider events after the clarification answer.
- **FR-004**: The live real resume request MUST continue sending only public mentor configuration and must never include resolved secrets.
- **FR-005**: Regression tests MUST prove the mock resume phrase is not emitted by the live real clarification path.

## Verification

- Focused tests cover real runtime clarification resume prompts, server query handling, and browser wiring for `runLiveRealClarificationResume`.
- Full `node --test` passes.
- Playwright interactive QA verifies the browser submits `clarificationAnswer`, appends real streamed tokens, and does not display the previous canned clarification-resume text.
