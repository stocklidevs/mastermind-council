# Feature Specification: Ongoing Consultation Sessions

## User Need

The user wants the council to behave like an ongoing advisory relationship, not a single disposable exchange. After a council answers an initial question, the user must be able to save the consultation, reopen it later, and continue with follow-up questions using the same mentors and prior public context.

## Functional Requirements

- **FR-001**: The app MUST save a full consultation session, including the initial question, follow-up questions, visible mentor transcript, clarifications, synthesis artifacts, council roster, mentor provider/model choices, synthesis provider/model choice, and session settings.
- **FR-002**: Saved sessions MUST be retrievable from the local UI and presented with enough metadata for the user to recognize the consultation.
- **FR-003**: The user MUST be able to continue a saved session by asking a follow-up question to the same council.
- **FR-004**: Continued sessions MUST provide mentors with public prior context, including previous user questions, visible mentor answers, clarifications, and the latest synthesis artifact.
- **FR-005**: Continued sessions MUST append a new exchange to the same consultation timeline rather than replacing the original session.
- **FR-006**: Each follow-up exchange MUST produce a new synthesis artifact while preserving access to earlier synthesis artifacts.
- **FR-007**: Saved sessions MUST remain local-first for the initial implementation and MUST NOT persist resolved API keys, `op://` references, plaintext credentials, private chain-of-thought, or hidden provider payloads.
- **FR-008**: The UI SHOULD make the configured synthesis provider/model visible near the final synthesis and provide a direct path to change it.

## Success Criteria

- A completed live session can be saved, reopened, and continued with a follow-up question.
- A continued session sends the same mentor roster and current synthesis model settings into the next council run.
- The prior public transcript and synthesis are available to the runtime as context.
- Session storage tests prove secrets and credential references are redacted.
- UI tests prove saved sessions can be listed, opened, and continued.
