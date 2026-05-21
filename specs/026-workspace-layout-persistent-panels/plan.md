# Implementation Plan: Workspace Layout And Persistent Panels

## Summary

Convert the app from a page-scrolling three-column document into a viewport-based consultation workspace. The council roster, deliberation transcript, and synthesis should each have stable places, with independent scroll behavior and responsive alternatives for smaller screens.

## Technical Context

- UI: static HTML/CSS/JS in `public/`.
- Runtime: existing server-sent live events and static render helpers.
- Tests: built-in `node --test` static UI checks, with Playwright available for visual validation when implementation begins.
- Package policy: no new dependencies unless validated, pinned, and installed with `npm ci`.

## Proposed Design

- Desktop:
  - Make `.app-shell` and `.workspace` viewport-height aware.
  - Keep the top bar compact.
  - Give council, transcript, and synthesis panels stable heights.
  - Let each panel own its internal scroll.
  - Keep the transcript header/stick status sticky inside the deliberation column.
  - Keep the question/follow-up input pinned at the top or bottom of the deliberation column.
- Tablet/mobile:
  - Replace the cramped three-column grid with workspace tabs or a segmented control.
  - Preserve a compact persistent status row showing session status and current stick owner.
  - Ensure the active panel scrolls independently.
- Synthesis:
  - Add visible synthesis provider/model metadata near the synthesis heading.
  - Preserve the pending state while deliberation is active.

## Implementation Tasks

- [ ] Add static UI tests for persistent workspace layout hooks and synthesis model display.
- [ ] Add or update responsive CSS for viewport-height workspace panels.
- [ ] Make council roster, transcript, and synthesis use independent scroll containers.
- [ ] Keep stick status/current speaker visible during long transcript scrolling.
- [ ] Keep question/follow-up input conveniently reachable.
- [ ] Add synthesis provider/model metadata near the synthesis panel.
- [ ] Add mobile/tablet workspace navigation for Council, Deliberation, and Synthesis.
- [ ] Add Playwright visual validation for desktop and mobile if the dev server is used.
- [ ] Update README and version metadata when implemented.
- [ ] Run `npm.cmd ci --ignore-scripts` and `node --test`.

## Risks

- Nested scroll regions can feel awkward if heights are not constrained carefully.
- Sticky elements can overlap transcript content if spacing is not tested across breakpoints.
- Mobile tabs must not hide live progress without a compact global status cue.

## Validation Notes

- Static UI tests cover the persistent panel hooks, independent scroll containers, responsive workspace tabs, and synthesis model label.
- Browser validation was attempted against the local dev server, but the bundled Playwright package in this environment is missing `playwright-core`; rerun visual QA after Playwright is available.
