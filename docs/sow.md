# Statement of Work

Created: 2026-05-16

## End Goal

Build a local-first web app where a user can ask a question to a council of LLM mentors. The council deliberates visibly through structured rounds, using a speaking-stick protocol, agent personalities, abstention, critique, synthesis, and graceful disagreement handling. The final answer should feel like the result of a thoughtful council, not a bland merged response.

The app should eventually support multiple LLM providers, configurable council members, optional 1Password secret resolution, saved sessions, and a polished debate UI.

## Core Product Requirements

1. The user can ask the council a question.
2. Multiple council members can participate, abstain, or remain silent per round.
3. Only one agent can speak at a time by holding the speaking stick.
4. An agent cannot speak twice in the same round.
5. Agents produce public contributions, not hidden chain-of-thought.
6. Agents may include short action/stage directions.
7. The debate can close by consensus, rough consensus, split decision, round cap, moderator decision, or user stop.
8. Final synthesis preserves dissent when disagreement matters.
9. Council members are configurable by name, role, personality, provider, model, and behavior.
10. API keys are never exposed in the browser or persisted in plaintext.
11. 1Password is supported as an optional secret source, not a hard dependency.
12. The UI lets the user both converse with the council and observe the council's debate.
13. The system is spec-driven: every meaningful feature starts with a spec, plan, tasks, implementation, verification, docs, version update, and commit.

## Non-Goals For Early Versions

- No hosted SaaS account system at first.
- No billing, teams, sharing, or public council marketplace.
- No claim that council consensus equals truth.
- No autonomous high-stakes advice execution.
- No complex tool/plugin ecosystem until the core deliberation loop is excellent.

## Definition Of Done

For each feature/spec:

1. Spec exists and is reviewed.
2. Implementation matches the spec.
3. Tests or verification steps pass.
4. README is updated when user-facing behavior, setup, architecture, or commands change.
5. Relevant docs are updated.
6. Version file is updated.
7. Changelog or release notes are updated if we add one.
8. Work is committed with a clear message.
9. No secrets, generated junk, or unrelated changes are committed.

For the MVP:

1. A user can run the app locally.
2. A user can configure at least mock council members.
3. A user can submit a prompt and watch a structured council session.
4. The speaking-stick protocol is visible and enforced.
5. The final answer includes synthesis and dissent handling.
6. The project has a README with setup, architecture, commands, and GitHub badges.
7. The project has a version file.
8. The project has docs for product rules, architecture, and provider/secret handling.
9. The repo has a clean initial commit history.

## Project Rules

- The council must be epistemically honest: uncertainty and disagreement are first-class outputs.
- The product should feel ceremonial but useful. The speaking stick is not decoration; it is the core interaction rule.
- The moderator/chairman must synthesize, not erase dissent.
- Secrets stay out of frontend code, logs, commits, transcripts, and screenshots.
- If npm is used, package versions are validated against a maintained vulnerability database, pinned in `package-lock.json`, and installed with `npm ci`.
- Specs come before implementation.
- Small vertical slices beat broad unfinished scaffolding.
- Every completed spec updates version, docs, README, and commit.
- When research changes the product direction, the reference docs get updated.
- When a decision is made, capture it in docs so autonomous work can continue without asking the same question again.

## README Badge Set

Start with badges for:

- build status
- test status
- version
- license
- spec-driven development
- frontend framework once chosen
- backend framework once chosen

Example categories, not final badge URLs yet:

```md
![Build](...)
![Tests](...)
![Version](...)
![License](...)
![Spec Driven](...)
```

## Proposed Initial Work Packages

1. Project charter and rules
   Define end goal, values, scope, non-goals, done criteria, autonomy rules.

2. Spec Kit setup
   Initialize spec-driven workflow and project structure.

3. MVP council protocol
   Mock-agent debate engine, rounds, speaking stick, abstention, transcript model.

4. MVP web UI
   Chat area, council chamber, stick holder, agent roster, debate transcript, final synthesis.

5. Configuration
   Council member setup, provider/model configuration, safe secret references.

6. Real provider integration
   OpenRouter or direct providers, retries, streaming, provider errors.

7. 1Password integration
   Optional `op://` references, validation, redaction, setup docs.

8. Persistence
   Saved sessions, transcripts, council presets.

## Repository Note

The workspace was not a Git repository when this document was created. Git was initialized afterward, and the initial project-definition files were committed. Spec Kit was then initialized with Codex skills and PowerShell scripts. The project constitution was ratified as the governing source for future specs and implementation work.
