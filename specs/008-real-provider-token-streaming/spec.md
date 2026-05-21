# Feature Specification: Real Provider Token Streaming

**Feature Branch**: `008-real-provider-token-streaming`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User approved the recommendation to implement real provider token streaming for OpenAI and Anthropic first.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stream Real Mentor Output (Priority: P1)

A user running real council mode can see supported provider output arrive token by token instead of waiting for the full provider response.

**Why this priority**: The live ceremonial experience should become true for real providers, not only mock mode.

**Independent Test**: Use mocked provider SSE responses for OpenAI and Anthropic and verify normalized token events are emitted in order.

**Acceptance Scenarios**:

1. **Given** an OpenAI mentor speaks, **When** the provider streams text deltas, **Then** the runtime emits normalized mentor token events in the same order.
2. **Given** an Anthropic mentor speaks, **When** the provider streams content block deltas, **Then** the runtime emits normalized mentor token events in the same order.
3. **Given** a provider stream fails, **When** the error is handled, **Then** the user receives a safe public error without secrets.

### Council Integrity & Safety *(mandatory for council-facing features)*

- Provider-specific streaming events are normalized before reaching the UI.
- Full prompts, hidden context, secrets, and 1Password references must not appear in public events or logs.
- Streaming is a delivery mechanism, not a truth guarantee.
- No npm packages are introduced.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST build streaming requests for OpenAI Responses with streaming enabled.
- **FR-002**: System MUST build streaming requests for Anthropic Messages with streaming enabled.
- **FR-003**: System MUST parse OpenAI `response.output_text.delta` events into public text tokens.
- **FR-004**: System MUST parse Anthropic `content_block_delta` text events into public text tokens.
- **FR-005**: System MUST expose a provider-neutral async token stream API.
- **FR-006**: System MUST preserve the existing non-streaming provider path.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be vulnerability-checked, pinned in `package-lock.json`, and installed with `npm ci`.

### Key Entities

- **Provider Token Stream**: Provider-neutral async sequence of public text deltas.
- **Streaming Provider Request**: Provider request with streaming enabled and safe headers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: OpenAI mocked SSE deltas produce ordered token strings.
- **SC-002**: Anthropic mocked SSE deltas produce ordered token strings.
- **SC-003**: Streaming parser tests pass without network calls.
- **SC-004**: Full test suite remains green and dependency audit remains clean.

## Assumptions

- OpenAI and Anthropic are first; xAI and Novita streaming follow after this contract is stable.
- This slice does not perform live provider smoke tests.
