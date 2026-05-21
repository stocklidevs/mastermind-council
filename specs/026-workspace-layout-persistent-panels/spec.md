# Feature Specification: Workspace Layout And Persistent Panels

## User Need

The current council workspace uses the page itself as the scroll container. When the transcript grows, the council roster and synthesis panel scroll out of view, forcing the user to lose sight of who is participating, who has the stick, and what the final counsel says. The experience should feel like a focused strategic room where council state, live deliberation, and synthesis remain in relationship.

## Functional Requirements

- **FR-001**: The workspace MUST keep the council roster visible while the deliberation transcript grows on desktop-size screens.
- **FR-002**: The workspace MUST keep the synthesis panel visible or immediately reachable while the deliberation transcript grows on desktop-size screens.
- **FR-003**: The transcript MUST use its own scroll area so long mentor output does not push council state and synthesis out of view.
- **FR-004**: The current stick owner, mentor activity state, and live speaking/thinking status MUST remain visible during active deliberation.
- **FR-005**: The question/follow-up input SHOULD remain conveniently reachable without requiring the user to scroll past the full transcript.
- **FR-006**: The synthesis panel MUST show a useful pending state during deliberation and a structured final artifact after synthesis.
- **FR-007**: The synthesis panel SHOULD display the active synthesis provider/model and provide a clear route to change it.
- **FR-008**: On tablet and mobile widths, the app MUST avoid cramped three-column layouts and SHOULD provide a tabbed or segmented workspace for Council, Deliberation, and Synthesis.
- **FR-009**: Live transcript auto-scroll SHOULD follow new mentor tokens unless the user has intentionally scrolled up to inspect prior output.
- **FR-010**: The revised layout MUST preserve the subtle, premium, Apple-like aesthetic and avoid game-like visual clutter.
- **FR-011**: The revised layout MUST support light and dark mode without text overlap, hidden controls, or unusable scroll regions.

## Success Criteria

- A long live council exchange can be read while the council roster and synthesis remain visible on desktop.
- The transcript can scroll independently without moving the top-level workspace out of context.
- The current stick/speaker state remains visible during token streaming.
- Mobile and narrow viewports provide an intentional navigation pattern instead of squeezed panels.
- Browser/UI tests or static checks cover the layout affordances and key responsive selectors.

## Out Of Scope

- Rewriting mentor orchestration or synthesis behavior.
- Adding server-side persistence.
- Changing provider/model configuration semantics beyond making the synthesis model easier to see.
