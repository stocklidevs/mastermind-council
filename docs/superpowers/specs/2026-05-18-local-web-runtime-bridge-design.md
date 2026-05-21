# Local Web Runtime Bridge Design

Date: 2026-05-18

## Goal

Let the static web UI run the local real-provider council through a Node endpoint while keeping API keys and 1Password references out of browser code and responses.

## Scope

This feature covers:

- `POST /api/council/real` on the local Node server.
- Safe request validation for a user question.
- Real council execution in Node using the existing runtime.
- Optional `dryRun` request mode for no-network UI/runtime checks.
- Web UI mode toggle between mock and real council.
- Browser rendering of returned safe session events.

This feature does not cover:

- Remote deployment or authentication.
- Browser-side 1Password resolution.
- Multi-round real council.
- Streaming real-time transcript updates.

## Safety Rules

- Browser requests contain only a question and mode flags.
- Server responses contain safe session objects only.
- No resolved secrets or `op://` references are sent to the browser.
- Provider failures become safe transcript/status events.

## Definition Of Done

- Unit tests cover route validation, dry-run response shape, and no-secret/no-reference response payloads.
- Static UI tests cover the real/mock mode toggle and `fetch('/api/council/real')` wiring.
- `npm.cmd ci --ignore-scripts` and `node --test` pass.
- HTTP dry-run smoke check passes locally.
- README, VERSION, package files, docs, and Git history are updated.

## Observed Verification

Completed on 2026-05-18:

- `node --test` passed with 71 tests.
- HTTP dry-run smoke check for `POST /api/council/real` returned 200.
- The dry-run response contained neither `op://` references nor the dry-run secret marker.
