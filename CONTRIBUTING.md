# Contributing

Thanks for taking an interest in Mastermind. The project is still early, so the best contributions are small, focused, and easy to verify.

## Local Setup

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run serve
node --test
```

PowerShell may block `npm.ps1`, so the examples use `npm.cmd`.

## Development Rules

- Keep provider secrets out of git. Use environment variables, 1Password references, or the ignored `public/local-secret-defaults.json` file.
- Do not commit logs, generated PDFs, local sessions, screenshots containing private discussions, or resolved API keys.
- Use the existing zero-dependency Node/browser architecture unless a new dependency is clearly justified.
- Pin dependency versions through `package-lock.json`; install with `npm.cmd ci --ignore-scripts`.
- Add focused tests for behavior changes.
- Update `README.md`, relevant docs, and `VERSION` when user-facing behavior changes.

## Pull Requests

Before opening a PR, run:

```powershell
npm.cmd ci --ignore-scripts
node --test
```

Include a short description of the change, the tests you ran, and any privacy or provider-secret considerations.
