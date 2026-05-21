# Runtime Logging Design

## Goal

Add safe, structured server-side logs for the local real-provider council runtime so a developer can inspect how a web council request operated after a run.

## Scope

- Log each accepted real council request with dry-run state, question length, and provider count.
- Log rejected requests without echoing full user input.
- Log each provider call start with session, round, mentor, provider, and model metadata.
- Log each provider call completion with latency and contribution length.
- Log provider failures with non-secret error messages.
- Keep tests quiet by allowing callers to inject a silent logger.

## Safety Rules

- Do not log API keys.
- Do not log resolved 1Password secret values.
- Do not log raw `op://` secret references.
- Do not log full prompts or full provider outputs.
- Prefer JSON lines so logs can later be filtered or shipped to a local viewer.

## Deferred

- Browser-visible activity timeline.
- Server-sent events or streaming transport.
- Per-token live mentor output.
- Multi-turn deliberation state.
- Mentor-to-user question interrupts.

These are captured in the live council experience notes for the next interactive runtime slice.
