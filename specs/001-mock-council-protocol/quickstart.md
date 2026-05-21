# Quickstart: Mock Council Protocol

This feature is planned as a dependency-free Node.js protocol core.

## Prerequisites

- Node.js 24.11.0 or compatible current Node 24 runtime.
- No npm packages are required for this slice.

On this Windows workspace, use `npm.cmd` rather than `npm` in PowerShell if
execution policy blocks `npm.ps1`.

## Expected Verification After Implementation

Run the protocol tests:

```powershell
npm.cmd ci --ignore-scripts
node --test
```

Expected results:

- A deterministic mock session closes successfully.
- No agent speaks twice in the same round.
- Each contribution is tied to a speaking-stick grant.
- Abstentions are visible in the transcript.
- Conflicting mock positions produce synthesis with dissent.
- Round-cap closure names unresolved assumptions.

Observed on 2026-05-16:

- `npm.cmd ci --ignore-scripts` passed with 0 vulnerabilities.
- `node --test` passed 10 tests.

## Manual Smoke Scenario

After implementation, run or inspect a sample session with:

- 3 mock council members.
- 1 user question.
- At least 1 abstention.
- At least 1 action field.
- At least 1 dissenting stance.

The transcript should allow a reviewer to reconstruct the full order of rounds,
stick grants, contributions, abstentions, invalid protocol events if any, and
final synthesis.
