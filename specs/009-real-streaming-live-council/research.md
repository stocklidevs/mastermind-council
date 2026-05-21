# Research: Real Streaming Live Council

## Decision: Add Real Streaming As A Mode On Existing Live Endpoint

**Rationale**: The UI already consumes normalized live council events. Reusing `/api/council/live` avoids a second browser pipeline.

## Decision: Stream Supported Providers And Skip Unsupported Ones

**Rationale**: OpenAI and Anthropic are implemented. xAI and Novita can follow as OpenAI-compatible streaming after this path is proven.
