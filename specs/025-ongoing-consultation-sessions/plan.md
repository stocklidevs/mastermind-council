# Implementation Plan: Ongoing Consultation Sessions

## Summary

Turn the current recent-session history into a reusable consultation system. A consultation should preserve the public relationship with a council across multiple exchanges, allow later retrieval, and support follow-up questions with the same mentors and synthesis configuration.

## Technical Context

- Runtime: dependency-free Node.js ES modules.
- UI: static local web app using browser storage for settings, presets, and session history.
- Initial storage: browser `localStorage`, matching existing local-first patterns.
- Test runner: built-in `node --test`.
- Package policy: no new packages unless validated, pinned, and installed with `npm ci`.

## Proposed Data Model

- `consultationId`: stable local id.
- `title`: user-editable or generated from the first question.
- `createdAt` / `updatedAt`.
- `mode`: mock, live mock, live real, or real.
- `members`: public mentor roster with provider/model ids but no secrets.
- `sessionSettings`: max turns, preamble setting, synthesis provider/model.
- `exchanges`: ordered list of question, clarification answers, transcript items, synthesis artifact, status, and timestamps.

## Implementation Tasks

- [ ] Add consultation storage helpers for create, save, list, load, update, delete, and sanitize.
- [ ] Add tests proving consultation records redact secrets, `op://` references, and resolved credentials.
- [ ] Extend live view state so a follow-up question can include prior public transcript and latest synthesis.
- [ ] Extend live council request handling to accept prior public context safely.
- [ ] Add UI controls to save the current consultation, open saved consultations, and continue one with a follow-up question.
- [ ] Show the active synthesis provider/model near the synthesis panel with a settings shortcut.
- [ ] Update session history UI so completed one-off sessions and ongoing consultations do not conflict.
- [ ] Add tests for retrieving a saved consultation and appending a follow-up exchange.
- [ ] Update README and version metadata when implemented.
- [ ] Run `npm.cmd ci --ignore-scripts` and `node --test`.

## Open Design Notes

- The initial implementation should stay local-only through `localStorage`.
- A later slice can add export/import or local file persistence for long-term consulting archives.
- Follow-up context must be public summaries and visible transcript only, never hidden chain-of-thought or raw provider payloads.

## Implementation Notes

- Consultations are saved in browser `localStorage` under `mastermind.consultations`.
- Opening a consultation restores the saved public mentor roster, runtime mode, and session settings.
- Continuing a consultation sends prior public questions and latest synthesis summaries into the next council prompt while keeping the saved follow-up question readable.
- Recent one-off sessions remain separate from saved consultations.
