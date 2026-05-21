# Research: Mentor Provider Configuration

## Decision: Configuration Before Provider Execution

Implement provider, model, mentor, secret-reference, and cache metadata
configuration without making real provider calls.

**Rationale**: Safe configuration must exist before execution. This lets the UI
teach users where API keys belong, how model selection works, and what caching
means without risking secret exposure or provider-specific runtime errors.

**Alternatives considered**:

- Implement provider calls immediately: rejected because secret handling and
  provider capability metadata are not in place yet.
- Only document configuration without UI: rejected because users explicitly need
  to know how to set up keys, models, and mentor traits inside the product.

## Decision: Secret References Only

Support environment variable names and optional 1Password `op://` references as
safe pointers. Do not resolve secrets in this feature.

**Rationale**: The constitution requires secrets never appear in browser code,
logs, transcripts, screenshots, or plaintext persistence. References let users
configure intent without exposing values.

**Alternatives considered**:

- Plaintext API-key input: rejected for this project.
- Immediate 1Password CLI integration: useful later, but this feature can model
  references first and defer runtime resolution to provider execution.

## Decision: Static Provider/Model Metadata

Begin with curated static metadata for providers, models, caching capability,
and voice-readiness fields.

**Rationale**: Static metadata is deterministic, testable, and dependency-free.
Live provider discovery can come later after provider execution exists.

**Alternatives considered**:

- Fetch provider model catalogs at runtime: rejected because it introduces
  network behavior and provider-specific auth concerns too early.
- Freeform model text only: rejected because caching capability and provider
  constraints need structured metadata.

## Decision: Cache Support As Capability Metadata

Represent caching as automatic, explicit, unsupported, or unknown per
provider/model.

**Rationale**: Current provider behavior differs. OpenAI prompt caching is
automatic and reports cached input tokens in usage. Anthropic supports explicit
cache-control breakpoints. Gemini supports explicit context caching. OpenRouter
exposes provider-dependent prompt caching and routing behavior. A universal
"enable cache" switch would be misleading.

**References**:

- OpenAI prompt caching: https://platform.openai.com/docs/guides/prompt-caching
- Anthropic prompt caching: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- Gemini context caching: https://ai.google.dev/gemini-api/docs/caching
- OpenRouter prompt caching: https://openrouter.ai/docs/features/prompt-caching

**Alternatives considered**:

- Always-on cache toggle: rejected because it overpromises support.
- No cache planning until provider execution: rejected because mentor prompt
  structure should separate stable profile instructions from dynamic debate
  context early.

## Decision: Stable Mentor Profile As Cache Candidate

Treat stable mentor identity, role, personality, speaking style, and behavioral
rules as cache candidates. Treat user questions, current round state, prior
contributions, and final synthesis instructions as dynamic by default.

**Rationale**: Stable prefixes are the useful caching target. Dynamic debate
state changes per session or turn and can reduce cache hit reliability if mixed
into cacheable content.

**Alternatives considered**:

- Cache the full prompt: rejected because dynamic content changes frequently.
- Cache only provider-level system instructions: too narrow for mentor-specific
  profiles.

