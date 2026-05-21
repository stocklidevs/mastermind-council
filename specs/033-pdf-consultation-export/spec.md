# Feature Specification: PDF Consultation Export

## User Story

As a user, I want to export a council discussion to PDF, so I can keep, share, or review the counsel outside the local app.

## Requirements

- **FR-001**: The Session drawer MUST expose PDF export for the latest completed session when one exists.
- **FR-002**: Saved consultations MUST expose PDF export beside open/delete actions.
- **FR-003**: PDF export MUST include the consultation title, date, mode, mentors, transcript, public stage actions, synthesis, next actions, dissent, assumptions, unresolved questions, verification guidance, and mentor grounding when available.
- **FR-004**: PDF export MUST use the browser print dialog and require no new npm dependency.
- **FR-005**: Exported HTML MUST escape user/council content before rendering.
- **FR-006**: If the browser blocks the export window, the app MUST show a visible error.

## Success Criteria

- Static UI tests prove current and saved consultation export controls are wired.
- Export helper tests prove printable HTML includes transcript/synthesis content and escapes unsafe text.
- Full test suite passes with no new dependencies.

## Out of Scope

- One-click binary PDF generation.
- Server-side PDF rendering.
- Export import/restore roundtrip.
