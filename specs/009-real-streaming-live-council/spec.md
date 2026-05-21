# Feature Specification: Real Streaming Live Council

**Feature Branch**: `009-real-streaming-live-council`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User approved connecting the real provider token streaming foundation into the live council path.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run A Real Streaming Council (Priority: P1)

A user can select a real streaming council mode and watch supported real providers stream mentor output into the same live transcript experience used by mock mode.

**Why this priority**: The live council becomes materially real when supported provider tokens reach the chamber incrementally.

**Independent Test**: Use mocked secret resolution and mocked provider token streams to verify OpenAI and Anthropic mentors emit `mentor.token` events in the live event stream.

**Acceptance Scenarios**:

1. **Given** real streaming mode is selected, **When** the live endpoint receives a valid question, **Then** the stream starts with public session and turn events.
2. **Given** OpenAI and Anthropic mentors are configured, **When** mocked provider streams emit deltas, **Then** the browser receives normalized `mentor.token` events in order.
3. **Given** unsupported providers are still configured, **When** real streaming runs, **Then** unsupported providers abstain or emit a safe unsupported-provider event rather than blocking the session.

### Council Integrity & Safety *(mandatory for council-facing features)*

- Provider secrets stay server-side.
- Public events include mentor identity, activity state, public tokens, and safe errors only.
- Provider-specific deltas are normalized before reaching the UI.
- This slice uses tests with mocked providers; no live calls are required.
- No npm packages are introduced.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support `mode=real` on the live council stream endpoint.
- **FR-002**: System MUST resolve provider secrets server-side for real streaming mode.
- **FR-003**: System MUST stream OpenAI and Anthropic mentor tokens as normalized live council events.
- **FR-004**: System MUST safely skip or report unsupported streaming providers.
- **FR-005**: Browser UI MUST offer a real streaming council mode.
- **FR-006**: Existing mock live mode MUST continue to work.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be vulnerability-checked, pinned in `package-lock.json`, and installed with `npm ci`.

### Key Entities

- **Real Live Stream Session**: A live council session backed by real provider token streams.
- **Supported Streaming Provider**: A provider with an implemented streaming adapter.
- **Unsupported Streaming Provider Event**: Safe public event explaining why a mentor could not stream.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mocked OpenAI and Anthropic provider streams produce visible normalized live events.
- **SC-002**: Unsupported provider mentors do not prevent supported mentors from streaming.
- **SC-003**: Tests prove no `op://` references or API-key-looking secrets appear in stream output.
- **SC-004**: Full test suite remains green and dependency audit remains clean.

## Assumptions

- OpenAI and Anthropic stream first.
- xAI and Novita remain unsupported in this slice until OpenAI-compatible streaming is specified.
- Live provider smoke is deferred.
