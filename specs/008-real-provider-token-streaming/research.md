# Research: Real Provider Token Streaming

## Decision: Normalize Provider SSE To Plain Text Deltas

**Rationale**: OpenAI and Anthropic expose different streaming event names. The rest of Mastermind should consume provider-neutral public text deltas.

**Sources**:

- OpenAI Responses streaming emits `response.output_text.delta` events when `stream` is true.
- Anthropic Messages streaming emits `content_block_delta` events for text deltas.

## Decision: Test With Mocked Streams Only

**Rationale**: The parser and request contract can be validated without spending provider calls or exposing secrets.
