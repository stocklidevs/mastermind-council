# Feature Specification: Anthropic Model ID Fix

**Feature Branch**: `021-anthropic-model-id-fix`

**Created**: 2026-05-19

**Status**: Complete

**Input**: User asked to investigate the Power Realist issue after a live real exchange showed the mentor completed without visible speech.

## Requirements

- **FR-001**: Anthropic mentor defaults MUST use a documented Anthropic API model id.
- **FR-002**: Council presets that assign Anthropic to a mentor MUST use the same valid model id.
- **FR-003**: Existing local browser mentor rosters using the old Anthropic id MUST migrate in memory before live real requests are sent.
- **FR-004**: The fix MUST preserve secret safety and avoid provider calls during automated verification.

## Verification

- Focused tests cover provider metadata, default mentor config, configuration view-models, live real runtime, live server handler, and streaming providers.
- Full `node --test` passes.
