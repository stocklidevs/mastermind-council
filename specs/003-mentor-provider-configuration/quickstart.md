# Quickstart: Mentor Provider Configuration

This feature is planned as dependency-free local configuration UI and helpers.

## Prerequisites

- Node.js 24.11.0 or compatible current Node 24 runtime.
- No npm packages beyond the dependency-free lockfile.

Use `npm.cmd` rather than `npm` in PowerShell if execution policy blocks
`npm.ps1`.

## Observed Verification

Install from the lockfile:

```powershell
npm.cmd ci --ignore-scripts
```

Result on 2026-05-16: passed, audited 1 package, found 0 vulnerabilities.

Run automated tests:

```powershell
node --test
```

Result on 2026-05-16: passed, 37 tests.

Run the local app:

```powershell
npm.cmd run serve
```

HTTP smoke check on 2026-05-16:

- `http://localhost:4173` returned 200.
- `http://localhost:4173/public/app.js` returned 200.
- `http://localhost:4173/src/web/configuration-view.js` returned 200.

Then visually verify:

- Provider settings accept environment variable references.
- Provider settings accept `op://` 1Password references.
- Plaintext-looking keys are rejected or warned.
- Mentor editor can change provider, model, personality, speaking style, and
  participation behavior.
- Capability display distinguishes automatic, explicit, unsupported, and unknown
  caching.
- Prompt/profile preview shows stable and dynamic sections without secrets.
