# Research: Mock Council Protocol

## Decision: Dependency-Free Node.js Core

Use modern JavaScript on Node.js 24.11.0 with no external npm packages for the
first protocol slice.

**Rationale**: The feature is primarily a deterministic state machine. Node is
already available locally, its built-in test runner is sufficient for protocol
tests, and avoiding dependencies satisfies the new npm supply-chain rule without
slowing the first slice.

**Alternatives considered**:

- TypeScript: stronger static checks, but requires adding and validating npm
  packages before the protocol behavior is proven.
- Python: good for modeling, but the eventual product is a web app and Node
  keeps the first slice closer to likely frontend integration.
- Frontend-first implementation: visually tempting, but it risks making the
  speaking stick a UI decoration before the rules are enforceable.

## Decision: Deterministic Mock Agents

Represent mock agents as configured behavior profiles that decide participation
and contributions from session state.

**Rationale**: Deterministic agents make protocol invariants testable. They also
let us simulate consensus, dissent, abstention, and round caps without paying
for model calls or handling provider variability.

**Alternatives considered**:

- Random mock agents: useful for demos, weaker for repeatable tests.
- Real LLM agents immediately: too much provider, secret, and cost surface for
  the first protocol slice.
- Static transcript fixtures only: easy to test, but does not prove the engine
  enforces round and stick rules.

## Decision: Event-Based Transcript

Record session history as explicit public events: session started, round
started, agent abstained, stick granted, contribution accepted, invalid event,
round ended, and session synthesized.

**Rationale**: The SOW requires users and reviewers to observe the council
debate. An event transcript makes ordering, stick ownership, abstentions, and
closure reason inspectable without hidden state.

**Alternatives considered**:

- Store only final messages: simpler but loses deliberation structure.
- Store nested round objects only: readable, but weaker for reconstructing exact
  event order and invalid protocol attempts.

## Decision: Synthesis Preserves Agreement State

The synthesis result includes agreement state, closure reason, main answer,
minority views, assumptions, and next-step verification guidance.

**Rationale**: This directly implements the constitution's epistemic honesty
principle and prevents the MVP from training itself around false consensus.

**Alternatives considered**:

- Single final answer only: too flat for this product.
- Moderator-only freeform text: expressive, but harder to verify against the
  core protocol requirements.

