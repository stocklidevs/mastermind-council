# Local Provider Smoke Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local-only 1Password secret resolution and provider smoke tests for Claude, xAI, OpenAI, and Novita.

**Architecture:** Use dependency-free Node modules. Keep secret resolution in `src/secrets`, provider calls in `src/providers`, and CLI orchestration in `scripts/provider-smoke.js`.

**Tech Stack:** Node.js ES modules, built-in `node:test`, built-in `fetch`, 1Password CLI.

---

## Tasks

- [ ] Add failing tests for 1Password command discovery and safe secret resolution.
- [ ] Implement `src/secrets/one-password.js`.
- [ ] Add failing tests for provider smoke request builders/parsers.
- [ ] Implement `src/providers/smoke-adapters.js`.
- [ ] Add failing tests for smoke configuration defaults.
- [ ] Implement `src/providers/smoke-config.js`.
- [ ] Add CLI script `scripts/provider-smoke.js` and `provider:smoke` npm script.
- [ ] Update README, VERSION, package files, and design doc verification.
- [ ] Run `npm.cmd ci --ignore-scripts`, `node --test`, and dry-run smoke command.
- [ ] Commit the completed slice.
