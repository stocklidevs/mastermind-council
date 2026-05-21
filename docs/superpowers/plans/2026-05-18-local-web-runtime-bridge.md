# Local Web Runtime Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe local HTTP endpoint and UI toggle for running real council sessions from the browser.

**Architecture:** Extract the server into a testable `createAppServer()`, add `src/server/real-council-handler.js` for API logic, and let `public/app.js` call `/api/council/real` when real mode is selected.

**Tech Stack:** Node.js ES modules, built-in `node:test`, static browser JavaScript, existing real council runtime.

---

## Tasks

- [ ] Add failing tests for real council API request handling.
- [ ] Implement `src/server/real-council-handler.js`.
- [ ] Refactor `scripts/serve-static.js` to export `createAppServer()` and route `/api/council/real`.
- [ ] Add failing static UI tests for mock/real mode toggle and API fetch wiring.
- [ ] Update `public/index.html`, `public/app.js`, and `public/styles.css`.
- [ ] Update docs/version, run verification, and commit.
