# Public Release Checklist

Use this before pushing Mastermind to a public GitHub repository.

## Verified

- `npm.cmd ci --ignore-scripts` completes from the committed lockfile.
- `node --test` passes.
- `npm audit` reports no known vulnerabilities for the current dependency tree.
- The current tree does not track `.env`, logs, generated PDFs, local sessions, or `public/local-secret-defaults.json`.
- Current-tree scans do not contain private 1Password account, vault, or item names.
- Commit-history scans were reviewed for private strings and key-shaped values.
- Key-shaped strings found in history are intentional test fixtures, not real provider keys.
- README screenshots are committed under `docs/screenshots/` and referenced with relative HTML image tags.

## Before Publishing

- Create the GitHub repository as public only after this checklist remains green.
- Review repository visibility, issue settings, and private vulnerability reporting settings on GitHub.
- Add repository topics such as `llm`, `local-first`, `ai-council`, `onepassword`, `openai`, and `tts`.
- Confirm no browser localStorage backup or exported consultation file is staged.
- Rotate any provider key that was ever pasted into a public place.
