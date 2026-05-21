# Feature Specification: Live Real Speech Completeness

## User Need

Live real mentor speech can feel cut off, and real mentors no longer show ceremonial actions before or after speaking. The live real experience must preserve full-enough public mentor answers and restore visible pre/post speech action moments.

## Functional Requirements

- **FR-001**: Live real mentor speech requests MUST use a larger token budget than the provider default used for short smoke calls.
- **FR-002**: Configured synthesis model requests MUST use a larger token budget so structured synthesis JSON is less likely to be cut off and rejected.
- **FR-003**: Live real mentors MUST emit a `mentor.pre_action` event after receiving the speaking stick and before streaming spoken tokens.
- **FR-004**: Live real mentors MUST emit a `mentor.post_action` event after streamed speech and before `mentor.done`.
- **FR-005**: Pre/post action events MUST remain public, short, ceremonial, and free of hidden reasoning.
- **FR-006**: Existing live transcript rendering MUST continue to show action fields separately from spoken text.

## Success Criteria

- Runtime tests prove live real mentors emit pre-action, token, post-action, and done events in order.
- Runtime tests prove mentor speech streams receive an expanded token budget.
- Runtime tests prove configured synthesis streams receive an expanded token budget.
- Full test suite passes.
