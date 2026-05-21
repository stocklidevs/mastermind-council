# Feature Specification: Deep Mentor Profiles

**Feature Branch**: `006-deep-mentor-profiles`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "Mentors should have much more background, personality, depth, and ritual presence. Later we can use AI to build such mentors."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure A Deeper Mentor Identity (Priority: P1)

A user can define a mentor beyond simple role and personality fields, including biography, principles, strengths, blind spots, debate style, and ritual presence.

**Why this priority**: The product depends on mentors feeling like distinctive higher intelligences rather than interchangeable model wrappers.

**Independent Test**: Edit a mentor profile and verify the deeper identity fields appear in configuration and prompt preview.

**Acceptance Scenarios**:

1. **Given** a mentor profile is open, **When** the user edits deep identity fields, **Then** the mentor configuration updates without changing provider secrets.
2. **Given** prompt preview is open, **When** a mentor has deep identity fields, **Then** the stable profile preview includes those fields.

### User Story 2 - Prepare For AI-Assisted Mentor Creation (Priority: P2)

A user can see the shape of a future mentor builder without calling providers yet.

**Why this priority**: The app should be ready for AI-generated mentor identities while keeping this slice local and safe.

**Independent Test**: Generate a local mentor identity draft from deterministic inputs and verify it is safe, editable, and provider-independent.

**Acceptance Scenarios**:

1. **Given** a user provides a mentor name and archetype, **When** a draft is generated locally, **Then** the draft includes deep identity fields.
2. **Given** a draft is generated, **When** the user applies it, **Then** it updates only public mentor identity fields.

### Edge Cases

- Empty optional identity fields should not break prompt previews.
- Deep identity fields must not include secrets or provider keys.
- A mentor can remain simple if the user does not want ritual depth.

### Council Integrity & Safety *(mandatory for council-facing features)*

- Deep profile fields influence style and framing, not truth guarantees.
- Mentor strengths and blind spots are both visible to preserve uncertainty.
- No secrets, provider keys, hidden prompts, or chain-of-thought appear in identity fields.
- This slice introduces no npm packages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support mentor biography, operating principles, strengths, blind spots, debate style, preferred questions, and ritual presence fields.
- **FR-002**: System MUST include deep identity fields in safe prompt/profile preview.
- **FR-003**: System MUST allow deep identity fields to be edited from the mentor settings UI.
- **FR-004**: System MUST provide a deterministic local mentor identity draft helper for future AI-assisted creation.
- **FR-005**: System MUST keep generated drafts provider-independent and secret-free.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be vulnerability-checked, pinned in `package-lock.json`, and installed with `npm ci`.

### Key Entities

- **Deep Mentor Identity**: Public biography, principles, strengths, blind spots, debate style, preferred questions, and ritual presence.
- **Mentor Draft**: Deterministic local draft that can later be replaced by provider-assisted generation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Each default mentor includes at least five deep identity fields.
- **SC-002**: Prompt preview includes deep identity fields without exposing secrets.
- **SC-003**: A user can edit deep identity fields from the settings drawer.
- **SC-004**: Automated tests cover default identities, updates, prompt preview, and local draft generation.

## Assumptions

- AI-assisted mentor generation is deferred; this slice adds the local data shape and deterministic draft helper.
- Deep identity fields are public prompt context and should be user-editable.
