# Feature Specification: Real Streaming Smoke Validation

**Feature Branch**: `010-real-streaming-smoke-validation`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User approved running a controlled live smoke for real provider token streaming.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validate Real Streaming Providers (Priority: P1)

A developer can run a controlled smoke command that validates OpenAI and Anthropic streaming with real 1Password-resolved keys.

**Why this priority**: Real streaming is now wired into the app, but mocked tests do not prove provider streaming works against actual APIs.

**Independent Test**: Run the smoke command in dry-run mode and live mode for OpenAI and Anthropic.

**Acceptance Scenarios**:

1. **Given** dry-run mode, **When** the smoke command runs, **Then** it validates target selection without resolving secrets or calling providers.
2. **Given** live mode, **When** OpenAI and Anthropic keys resolve, **Then** the command streams a tiny response from each supported provider.
3. **Given** a provider fails, **When** the command reports the error, **Then** no API key or `op://` reference appears in output.

### Council Integrity & Safety *(mandatory for council-facing features)*

- The smoke command validates transport only; it does not claim answer correctness.
- The command must not print resolved API keys.
- The command must keep token limits small.
- No npm packages are introduced.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a CLI command for provider streaming smoke validation.
- **FR-002**: The command MUST default to OpenAI and Anthropic only.
- **FR-003**: The command MUST support `--dry-run`.
- **FR-004**: The command MUST print provider name, model, token count, and preview.
- **FR-005**: The command MUST redact secrets and 1Password references from output.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be vulnerability-checked, pinned in `package-lock.json`, and installed with `npm ci`.

### Key Entities

- **Streaming Smoke Target**: Supported provider target used for smoke validation.
- **Streaming Smoke Result**: Provider status, token count, latency, and short safe preview.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dry-run smoke reports OpenAI and Anthropic readiness.
- **SC-002**: Live smoke reports at least one streamed token for OpenAI and Anthropic.
- **SC-003**: Automated tests cover dry-run output and mocked live streaming output.
- **SC-004**: Full test suite remains green and dependency audit remains clean.

## Assumptions

- The user has already approved one controlled live smoke.
- xAI and Novita remain out of scope for this smoke.
