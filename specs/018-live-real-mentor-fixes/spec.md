# Feature Specification: Live Real Mentor Fixes

**Feature Branch**: `018-live-real-mentor-fixes`

**Created**: 2026-05-19

**Status**: Complete

**Input**: User reported live real output looked like prompts/JSON instead of answers, Economics still used Athena in clarifying questions, and mentor model edits should persist.

## Requirements

- **FR-001**: Live real sessions MUST use the currently selected mentor roster, including selected council preset and model choices.
- **FR-002**: Live real mentor output MUST stream visible spoken answers rather than the structured JSON contract used by non-live real council calls.
- **FR-003**: Mentor provider/model/characteristic edits MUST persist locally across reloads.
- **FR-004**: Fixes MUST preserve secret safety and avoid sending resolved API keys to the browser or logs.

## Verification

- Focused tests cover live prompt shape, requested live real mentors, and local mentor persistence wiring.
- Full `node --test` passes.
- Playwright interactive QA confirms Economics roster is sent to live real mode, visible answer text appears in transcript, and edited provider/model values persist in localStorage.
