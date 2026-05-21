# Implementation Plan: PDF Consultation Export

## Summary

Add dependency-free PDF export through browser print-to-PDF for current completed sessions and saved consultations.

## Technical Context

- Runtime: dependency-free browser/Node ES modules.
- Target files:
  - `src/web/pdf-export.js`
  - `public/app.js`
  - `public/styles.css`
  - `tests/web/pdf-export.test.js`
  - `tests/web/static-configuration-ui.test.js`
- Package policy: no new dependencies.

## Implementation Tasks

- [x] Add failing tests for printable consultation export HTML.
- [x] Add failing static UI tests for current/saved export controls.
- [x] Implement printable PDF export HTML helper.
- [x] Add current session and saved consultation export buttons.
- [x] Wire browser print window export with blocked-window error handling.
- [x] Update VERSION, README, and active Spec Kit pointer.
- [x] Run `npm.cmd ci --ignore-scripts` and full `node --test`.

## Notes

- The first version uses `window.print()` so the user can choose "Save as PDF" in the browser print dialog.
- No provider secrets or hidden provider payloads are included in the export record.
