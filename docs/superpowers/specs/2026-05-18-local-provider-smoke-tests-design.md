# Local Provider Smoke Tests Design

Date: 2026-05-18

## Goal

Add a local-only smoke test path that resolves 1Password secret references in Node, calls selected providers with tiny prompts, and reports only safe success/failure metadata.

## Scope

This feature covers:

- 1Password CLI discovery and secret reference resolution.
- Default local smoke references for Claude, xAI, OpenAI, and Novita.
- Provider smoke adapters for Anthropic Messages, OpenAI Responses, and OpenAI-compatible chat completions.
- A command-line smoke test script.
- Redacted output that never prints API keys.

This feature does not cover:

- Browser-side secret resolution.
- Full council execution with real providers.
- Persisting resolved secrets.
- Streaming responses.
- Provider-specific pricing, usage, or caching verification.

## References

- OpenAI Responses API: `POST https://api.openai.com/v1/responses`
- Anthropic Messages API: `POST https://api.anthropic.com/v1/messages`, `anthropic-version: 2023-06-01`
- xAI Chat Completions API: OpenAI-compatible base URL `https://api.x.ai/v1`
- Novita OpenAI-compatible endpoint: `https://api.novita.ai/openai/v1/chat/completions`
- 1Password references:
  - `op://Example Vault/Anthropic API Key/credential`
  - `op://Example Vault/xAI API Key/credential`
  - `op://Example Vault/OpenAI API Key/credential`
  - `op://Example Vault/Novita API Key/credential`

## Safety Rules

- Resolved secret values stay in local process memory only.
- Smoke output includes provider, model, status, latency, and short response preview.
- Smoke output never includes raw secret references if doing so would reveal values; `op://` references may be shown because they are pointers, not secrets.
- Errors are sanitized before display.
- Browser code must continue to store references only.

## Definition Of Done

- `npm.cmd run provider:smoke -- --dry-run` validates configuration without network calls.
- Resolver tests prove secret values are not included in result objects.
- Adapter tests prove request shapes and response parsing.
- `npm.cmd ci --ignore-scripts` and `node --test` pass.
- README, VERSION, package files, and Git history are updated.

## Observed Verification

Completed on 2026-05-18:

- `npm.cmd run provider:smoke -- --dry-run` resolved Claude, xAI, OpenAI, and Novita 1Password references without printing secrets.
- `npm.cmd run provider:smoke` returned 200 for Claude, xAI, OpenAI, and Novita using one tiny prompt each.
- `node --test` passed with 55 tests before final docs/version updates.
