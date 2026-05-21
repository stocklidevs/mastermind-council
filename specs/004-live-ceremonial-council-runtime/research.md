# Research: Live Ceremonial Council Runtime

## Decision: Use Server-Sent Events For First Live Stream

**Rationale**: The browser only needs one-way session updates from the local server for this slice. Server-sent events support incremental text/event delivery with browser-native `EventSource`, simple reconnection semantics, and no extra dependency.

**Alternatives considered**:

- WebSockets: more flexible for bidirectional interaction, but unnecessary until live user interruption or collaborative sessions are introduced.
- Chunked JSON over fetch: possible, but requires more custom parsing in the browser.
- Polling: simpler, but fails the live token experience and creates awkward state reconciliation.

## Decision: Implement Mock Token Streaming Before Provider-Native Streaming

**Rationale**: The interaction model, transcript updates, activity state, and speaking-stick visuals can be validated without live provider variability, cost, rate limits, or provider-specific streaming APIs.

**Alternatives considered**:

- Provider-native streaming first: would demonstrate real model output sooner but increases scope across four provider APIs.
- Simulated browser-only streaming: useful for UI animation, but does not validate server-to-browser event contracts.

## Decision: Emit Public-Safe Event Types

**Rationale**: The same event stream can drive UI, logs, tests, and later provider integration when events avoid secrets, hidden prompts, and full diagnostic internals.

**Alternatives considered**:

- Reusing internal protocol events directly: risks exposing fields that are safe in memory but not public UI.
- Emitting only transcript text: too little information to show thinking, stick owner, abstentions, clarification state, and future TTS state.

## Decision: Keep TTS Deferred But Shape Speech-Ready Events

**Rationale**: Future voice support needs stable mentor ids, speech state, pre/post actions, and token timing. This can be modeled now without playing audio.

**Alternatives considered**:

- Add audio now: too much scope and introduces provider/package decisions.
- Ignore voice until later: likely causes event and UI contracts to be redesigned.

## Decision: Keep Ceremonial Visuals Subtle

**Rationale**: The user wants a sacred, premium room with Apple-like care, not a game environment. Motion should clarify status and create presence without overwhelming the work.

**Alternatives considered**:

- Mythic or fantasy-heavy visuals: too game-like for the intended strategic tool.
- Pure utilitarian dashboard: clear but misses the product's emotional and ritual dimension.
