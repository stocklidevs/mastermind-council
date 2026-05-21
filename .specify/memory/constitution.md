<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- III. Secure Secret Handling -> III. Secure Secret And Dependency Handling
Added sections:
- npm Supply Chain Requirements under Product Constraints
Removed sections:
- none
Templates requiring updates:
- .specify/templates/plan-template.md: updated
- .specify/templates/spec-template.md: updated
- .specify/templates/tasks-template.md: updated
Follow-up TODOs: none
-->

# Mastermind Constitution

## Core Principles

### I. Spec-First Autonomy

Every meaningful feature MUST begin with a Spec Kit specification before
implementation. Plans, tasks, and code changes MUST trace back to the active
spec. When a product decision is made, it MUST be captured in project docs so
autonomous work can continue without re-asking settled questions.

Rationale: the project is intended to support autonomous development, and that
only works if intent, constraints, and decisions are durable.

### II. Epistemic Honesty And Dissent

The product MUST treat uncertainty and disagreement as first-class outputs.
Council consensus MUST NOT be represented as proof of truth. Features that
synthesize council output MUST preserve material dissent through caveats,
minority reports, unresolved assumptions, or recommended verification steps.

Rationale: multi-agent debate can improve answers, but naive consensus can also
hide wrong assumptions or erase a correct minority view.

### III. Secure Secret And Dependency Handling

Secrets MUST NOT be committed, logged, exposed to browser code, written to
transcripts, included in screenshots, or persisted in plaintext. Provider keys
MUST be resolved server-side or local-backend-side. 1Password integration MUST
remain optional, and any resolved secret value MUST be redacted from user-facing
or diagnostic output.

If npm is used, package versions MUST be pinned through a committed lockfile,
validated against a vulnerability database before adoption, and installed with
`npm ci` for reproducible builds. `npm install` MAY be used only to intentionally
change dependencies or refresh the lockfile, and the resulting package changes
MUST be reviewed before commit.

Rationale: the app will coordinate multiple LLM providers, and provider API
keys are among the highest-risk project assets. Frontend dependency supply
chains can also execute install-time code and must be treated as a security
boundary.

### IV. Testable Vertical Slices

Work MUST be delivered in small, independently testable slices. Each spec MUST
define acceptance criteria and verification steps before implementation. Tests
SHOULD be automated whenever the behavior can be exercised deterministically;
manual verification MAY be used for early visual or exploratory flows but MUST
be documented.

Rationale: the core council protocol is novel, so small slices reduce ambiguity
and keep behavior demonstrable as the product grows.

### V. Documentation, Versioning, And Git Hygiene

Every completed spec MUST update relevant documentation, update the VERSION file,
update README content when user-facing behavior or setup changes, and end with a
clean Git commit. Commits MUST exclude secrets, generated junk, unrelated edits,
and unresolved placeholder text.

Rationale: durable docs and clean history are what let future autonomous work
build on prior decisions instead of rediscovering them.

## Product Constraints

- The app is local-first until a later spec explicitly introduces hosted
  accounts or multi-user infrastructure.
- The speaking stick is a core interaction rule, not decorative UI.
- An agent that has spoken in a round MUST NOT speak again in that same round.
- Agents MUST produce public contributions, not hidden chain-of-thought.
- Stage-direction/action fields MUST be short, optional, and user-disableable.
- The moderator/chairman MUST synthesize and clarify, not erase dissent.
- High-stakes domains such as medical, legal, or financial advice MUST include
  uncertainty, scope limits, and a recommendation to verify with appropriate
  professionals or primary sources.
- npm package adoption MUST include a vulnerability check using npm audit data,
  OSV.dev data, or an equivalent maintained vulnerability database.
- npm package versions MUST be pinned in `package-lock.json`; wildcard or broad
  dependency ranges are not sufficient as the reproducibility control.
- Local and CI installs for npm projects MUST use `npm ci` once the lockfile is
  established.

## Development Workflow

1. Start from the SOW, reference research, and constitution.
2. Use `$speckit-specify` for each meaningful feature.
3. Use `$speckit-clarify` when requirements contain unresolved ambiguity.
4. Use `$speckit-plan` only after the spec is coherent.
5. Use `$speckit-tasks` to generate independently testable work.
6. Use `$speckit-analyze` before implementation when artifacts become complex.
7. Implement only the approved slice.
8. Verify behavior with tests or documented manual checks.
9. Update docs, README when relevant, and VERSION.
10. Commit the completed slice with a clear message.

## Governance

This constitution supersedes conflicting workflow habits, generated templates,
and informal preferences. Amendments MUST document the reason for change,
update dependent templates when rules change, and use semantic versioning:

- MAJOR: removes or redefines a core principle.
- MINOR: adds a principle or materially expands governance.
- PATCH: clarifies wording without changing obligations.

Compliance MUST be checked during planning, task generation, implementation,
and pre-completion verification. If a feature needs to violate a principle, the
plan MUST document the violation, why it is necessary, and the simpler
alternative that was rejected.

**Version**: 1.1.0 | **Ratified**: 2026-05-16 | **Last Amended**: 2026-05-16
