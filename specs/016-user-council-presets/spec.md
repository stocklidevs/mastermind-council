# Feature Specification: User Council Presets

**Feature Branch**: `016-user-council-presets`

**Created**: 2026-05-18

**Status**: Draft

**Input**: Let users save, clone, edit, and restore council presets.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save Current Council (Priority: P1)

A user can save the currently configured council as a named local preset.

**Independent Test**: Save a preset from a mentor list and verify the saved preset contains cloned mentor public configuration.

### User Story 2 - Restore Saved Council (Priority: P1)

A user can select a saved preset later and restore its mentors.

**Independent Test**: Apply a saved preset and verify changing the restored mentors does not mutate the saved preset.

### User Story 3 - Delete Saved Council (Priority: P2)

A user can remove a saved local preset.

**Independent Test**: Delete a saved preset and verify it no longer appears in the preset list.

## Requirements *(mandatory)*

- **FR-001**: Users MUST be able to save the current council as a local preset with a non-empty name.
- **FR-002**: Saved presets MUST be listed alongside built-in presets without overwriting built-ins.
- **FR-003**: Applying a saved preset MUST clone mentor data.
- **FR-004**: Users MUST be able to delete saved presets.
- **FR-005**: Saved presets MUST NOT include resolved API keys or secret values.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.

## Success Criteria *(mandatory)*

- **SC-001**: Tests cover save, apply, clone, and delete behavior.
- **SC-002**: Static UI tests confirm save/delete controls exist.

## Assumptions

- This slice uses browser local storage for saved presets.
- Import/export and cross-device sync are future work.
