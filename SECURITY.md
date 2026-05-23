# Security Policy

Mastermind is a local-first app that can call external LLM providers through user-configured secrets. Treat provider keys, 1Password references, saved sessions, exports, and logs as sensitive.

## Supported Versions

Security fixes target the current `main` branch while the project is pre-1.0.

## Reporting a Vulnerability

Please do not open a public issue containing secrets, API keys, private 1Password metadata, saved consultations, or exploit details.

For now, report vulnerabilities privately to the repository owner. If GitHub private vulnerability reporting is enabled for the public repository, use that channel.

## Secret Handling Expectations

- Never commit raw API keys.
- Never commit `public/local-secret-defaults.json`.
- Never commit `.env` files.
- Use `.env.example` for placeholder variable names only.
- Prefer 1Password references or environment variable names over plaintext values.
- Rotate any provider key that was ever pasted into an issue, log, screenshot, export, or commit.
