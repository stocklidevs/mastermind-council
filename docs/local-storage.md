# Local Storage

Mastermind is local-first for user-owned council state. The browser stores only public session data, UI preferences, provider catalog metadata, and secret references such as environment-variable names or 1Password item references.

Stored browser sections:

- `mastermind.consultations`: saved council consultations and follow-up exchanges.
- `mastermind.sessionHistory`: recent completed session summaries.
- `mastermind.userCouncilPresets`: user-saved mentor rosters.
- `mastermind.currentMentors`: the active mentor roster and model assignments.
- `mastermind.providerCatalog`: custom OpenAI-compatible providers and models.
- `mastermind.secretReferences`: environment or 1Password references used by the local Node server to resolve API keys.
- `mastermind.ttsSettings`: OpenAI TTS enablement, voice, model, and speed.
- `mastermind.theme`: light or dark mode preference.

The Session settings tab can export and import these sections as a JSON backup. Backup import ignores unknown keys and only restores approved Mastermind storage keys. The backup guard rejects plaintext API-key-looking secret references; use 1Password references or environment-variable names instead.

Resolved API keys should remain server-side only. Do not place raw provider keys in localStorage, `public/local-secret-defaults.json`, exported backups, screenshots, logs, or Git history.

The local web server binds to `127.0.0.1` and protects secret-backed endpoints with a per-process local access token. `public/local-secret-defaults.json` remains the private machine-local defaults file, but it is read through `/api/local-secret-defaults` and is blocked from static file serving.
