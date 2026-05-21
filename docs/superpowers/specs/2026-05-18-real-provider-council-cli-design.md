# Real Provider Council CLI Design

Date: 2026-05-18

## Goal

Run a real one-round council from the local Node runtime using configured provider keys from 1Password, while preserving the speaking-stick protocol and keeping secrets out of events, logs, browser code, and saved session objects.

## Scope

This feature covers:

- A local CLI command for one real provider-backed council round.
- Mentor prompt construction from public mentor profile fields.
- Provider execution through existing smoke-tested adapters.
- Normalized contribution events with utterance, action, stance, provider/model metadata, and latency.
- Safe provider error events when a provider call fails.
- A deterministic fallback synthesis using the existing synthesis shape.

This feature does not cover:

- Browser execution of real providers.
- Multi-round provider debate.
- Real LLM synthesis as a separate provider call.
- Streaming responses.
- Persisting resolved secrets.

## Runtime Shape

The CLI command:

```powershell
npm.cmd run council:real -- "What should I focus on this week?"
```

The runtime resolves 1Password references in Node, calls each configured mentor's provider, parses a structured JSON response when possible, records safe events, and prints a readable transcript.

Provider responses should be requested as JSON:

```json
{
  "action": "stands thoughtfully",
  "utterance": "The contribution text.",
  "stance": "clarify",
  "wantsAnotherRound": false
}
```

If a provider returns plain text or malformed JSON, the runtime records the text as `utterance` and uses a safe default action and stance.

## Safety Rules

- Resolved API keys remain local process memory only.
- Session events must not contain `apiKey`, `secret`, `credential`, or resolved key-like strings.
- Errors are sanitized before entering events.
- The browser remains configuration/view only.
- The prompt must not ask for hidden chain-of-thought.

## Definition Of Done

- `npm.cmd run council:real -- --dry-run "question"` builds a real council session without network calls.
- Unit tests cover prompt construction, provider result normalization, error sanitization, and no-secret event storage.
- `npm.cmd ci --ignore-scripts` and `node --test` pass.
- A live CLI run succeeds for at least two providers, with all four attempted when available.
- README, VERSION, package files, docs, and Git history are updated.

## Observed Verification

Completed on 2026-05-18:

- `npm.cmd run council:real -- --dry-run "What should I focus on this week?"` produced a one-round local session without network calls.
- `npm.cmd run council:real -- "What should I focus on this week?"` produced live contributions from OpenAI, Claude, and xAI.
- Initial live run exposed truncated JSON; response token limits were increased and the rerun produced clean structured contributions.
- `node --test` passed with 65 tests before final docs/version updates.
