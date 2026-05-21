# Feature Specification: Deep Persona Prompt Priming

**Feature Branch**: `012-deep-persona-prompt-priming`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User wants personas to be much deeper and prime models into their best-performing council state.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prime Mentors With Deep Identity (Priority: P1)

A real mentor prompt includes deep public identity fields so the model can speak from a stronger, more specific council role.

**Why this priority**: Presets and deep identity fields only matter if they reach the provider prompt safely and clearly.

**Independent Test**: Build a mentor prompt and verify it contains biography, principles, strengths, blind spots, debate style, preferred questions, ritual presence, and historical-archetype honesty.

### Council Integrity & Safety *(mandatory for council-facing features)*

- Prompts must say historical profiles are inspired archetypes, not literal simulations.
- Blind spots must be included to avoid false authority.
- Public contribution rules and no-chain-of-thought requirements remain.
- No secrets are included.

## Requirements *(mandatory)*

- **FR-001**: Real mentor prompts MUST include deep identity fields when present.
- **FR-002**: Prompts MUST include a non-literal-archetype instruction for archetype personas.
- **FR-003**: Prompts MUST include raw-mode instructions for raw analysis mentors.
- **FR-004**: Prompts MUST include blind spots and verification humility.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final synthesis that combines multiple council contributions.

## Success Criteria *(mandatory)*

- **SC-001**: Prompt tests cover archetype and raw modes.
- **SC-002**: Prompt output contains identity fields and no secret-looking values.

## Assumptions

- This slice changes prompt construction only; provider calls are not run.
