# Feature Specification: Council Archetype Presets

**Feature Branch**: `011-council-archetype-presets`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User wants prefilled mastermind group types including philosophy, science, economics, personal growth, and raw model analysis.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose A Council Type (Priority: P1)

A user can choose a predefined council type that swaps in an appropriate roster of mentors.

**Why this priority**: Presets make the app feel expansive and make the council concept understandable without manually editing every mentor.

**Independent Test**: Select a preset and verify the mentor roster updates with the expected category and deep identity fields.

**Acceptance Scenarios**:

1. **Given** settings are open, **When** the user selects Philosophy, **Then** the roster uses philosophy-inspired mentor profiles.
2. **Given** settings are open, **When** the user selects Raw Analysis, **Then** the roster uses role-based analytic mentors without historical persona styling.

### Council Integrity & Safety *(mandatory for council-facing features)*

- Historical profiles are framed as inspired intellectual archetypes, not literal simulations.
- Raw mode avoids persona theater and focuses on analytic roles.
- Presets must include blind spots and uncertainty-preserving fields.
- This slice introduces no npm packages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define council presets for philosophy, science, economics, personal growth, strategy, and raw analysis.
- **FR-002**: Preset mentors MUST include deep identity fields.
- **FR-003**: Historical presets MUST be framed as inspired archetypes, not literal historical figures.
- **FR-004**: Raw analysis mode MUST use functional analytic roles without ceremonial persona claims.
- **FR-005**: Users MUST be able to apply a preset from the settings UI.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final synthesis that combines multiple council contributions.

### Key Entities

- **Council Preset**: Named category, description, tone, and mentor roster.
- **Preset Mentor**: Public mentor configuration with deep identity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least six council presets are available.
- **SC-002**: Every preset has at least three mentors.
- **SC-003**: Every preset mentor includes strengths and blind spots.
- **SC-004**: Automated tests cover preset catalog uniqueness and UI application.

## Assumptions

- Presets are local deterministic data.
- Provider/model assignment reuses existing configured defaults where possible.
