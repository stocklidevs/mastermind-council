# Quickstart: Mock Council Web UI

This feature is planned as a static local web app with no external dependencies.

## Prerequisites

- Node.js 24.11.0 or compatible current Node 24 runtime.
- No npm packages beyond the existing dependency-free lockfile.

On this Windows workspace, use `npm.cmd` rather than `npm` in PowerShell if
execution policy blocks `npm.ps1`.

## Expected Verification After Implementation

Install from the lockfile:

```powershell
npm.cmd ci --ignore-scripts
```

Run automated tests:

```powershell
node --test
```

Serve the app locally:

```powershell
npm.cmd run serve
```

Then open the printed local URL in the browser and verify:

- A non-empty question runs a mock council session.
- An empty question shows validation and does not run.
- The transcript displays rounds, speaking-stick contributions, abstentions,
  and action fields.
- The synthesis displays agreement state, closure reason, minority views when
  present, assumptions, and verification guidance.
- The page remains usable on a narrow mobile viewport.

Observed on 2026-05-16:

- `npm.cmd ci --ignore-scripts` passed with 0 vulnerabilities.
- `node --test` passed 17 tests.
- Static assets responded over the local server.
- Full browser visual QA still needs to be completed in a user-visible browser,
  because the sandboxed headless Edge process did not produce usable screenshots.
