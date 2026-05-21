# Feature Specification: Roleplayed Live Actions

## User Story

As a user watching the council, I want each real mentor's pre/post speaking actions to be authored in that mentor's persona, so the ceremony feels alive instead of hard-coded.

## Requirements

- **FR-001**: Live real mentors MUST request short public pre-speaking and post-speaking stage directions from the mentor's configured provider/model when possible.
- **FR-002**: Stage directions MUST stay separate from spoken `mentor.token` output.
- **FR-003**: Stage direction prompts MUST use public persona and ritual context only, without requesting hidden reasoning.
- **FR-004**: If the provider returns invalid, empty, or failed action text, the runtime MUST fall back to safe local ceremonial action text.
- **FR-005**: Stage direction text MUST be sanitized and length-limited before being emitted.

## Success Criteria

- Tests prove live real pre/post actions can come from provider output.
- Tests prove spoken tokens do not include action text.
- Full test suite passes with no new dependencies.

## Out of Scope

- TTS behavior.
- Rich animation or avatar generation.
- UI layout changes.
