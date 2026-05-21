# Real Provider Council CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local CLI that runs one real provider-backed council round.

**Architecture:** Keep provider execution in Node. Build prompts in `src/council/real-prompt.js`, normalize provider calls in `src/providers/generate.js`, orchestrate one round in `src/council/real-runtime.js`, and print via `scripts/council-real.js`.

**Tech Stack:** Node.js ES modules, built-in `node:test`, built-in `fetch`, 1Password CLI.

---

## Tasks

- [ ] Add prompt builder tests and implement `src/council/real-prompt.js`.
- [ ] Add provider generation tests and implement `src/providers/generate.js`.
- [ ] Add real runtime tests and implement `src/council/real-runtime.js`.
- [ ] Add CLI script `scripts/council-real.js` and `council:real` npm script.
- [ ] Run dry-run and live provider-backed CLI verification.
- [ ] Update README, VERSION, package files, design doc verification, and commit.
