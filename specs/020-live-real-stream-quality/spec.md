# Feature Specification: Live Real Stream Quality

**Feature Branch**: `020-live-real-stream-quality`

**Created**: 2026-05-19

**Status**: Complete

**Input**: User observed a live real exchange where Power Realist was marked done without speaking, Operations Commander appeared to abstain because `streaming-provider-not-supported`, and the main answer was too generic to be useful.

## Requirements

- **FR-001**: A mentor MUST NOT be marked done when its provider stream produces no visible answer text.
- **FR-002**: Infrastructure limitations MUST be represented as provider/runtime errors, not mentor abstentions.
- **FR-003**: Live real mode MUST support OpenAI-compatible chat streaming providers such as xAI, Groq, and Novita when configured with a streaming-compatible endpoint.
- **FR-004**: The live real final answer MUST summarize visible streamed mentor contributions instead of returning a generic completion sentence.
- **FR-005**: When no visible mentor text is produced, the final answer MUST clearly say so and list public-safe provider/runtime issues.
- **FR-006**: Runtime and transcript output MUST continue to avoid resolved secrets and 1Password references.

## Verification

- Focused tests cover OpenAI-compatible chat streaming, empty stream handling, unsupported provider errors, stick release on mentor errors, and contribution-based synthesis.
- Full `node --test` passes.
