# Feature Specification: Frontier Model Catalog

## User Story

As a user configuring a mentor, I want current frontier model options in the built-in provider catalog, so I can assign newer OpenAI, Anthropic, and xAI models without creating custom entries manually.

## Requirements

- **FR-001**: The OpenAI built-in provider MUST include GPT-5.5 using model id `gpt-5.5`.
- **FR-002**: The Anthropic built-in provider MUST include Claude Sonnet 4.6 using model id `claude-sonnet-4-6`.
- **FR-003**: The xAI built-in provider MUST include Grok 4 using model id `grok-4`.
- **FR-004**: New built-in model ids MUST remain unique within each provider.
- **FR-005**: Cache capability labels MUST remain conservative and explicit for each new model option.

## Success Criteria

- Provider catalog tests can retrieve the three new model ids.
- Full test suite passes with no new dependencies.

## References

- OpenAI model catalog lists GPT-5.5 with model id `gpt-5.5`.
- Anthropic model ID docs describe 4.6+ dateless model ids, including `claude-sonnet-4-6`.
- xAI Grok 4 docs list `grok-4` as an available model name.
