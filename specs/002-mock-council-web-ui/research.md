# Research: Mock Council Web UI

## Decision: Static Dependency-Free Web App

Build the first UI as static HTML, CSS, and browser JavaScript served locally.

**Rationale**: The feature only needs to prove the visible council workflow.
Avoiding external packages keeps dependency risk low, preserves the current
zero-dependency lockfile, and lets the team focus on interaction clarity.

**Alternatives considered**:

- React + Vite: useful for later complexity, but requires package adoption and
  vulnerability validation before the MVP UI has proven its shape.
- Server-rendered app: unnecessary because no persistence, accounts, providers,
  or backend behavior are required.
- Single generated transcript page: too static; the user must enter a question
  and run a live local mock session.

## Decision: Rendering Helpers In `src/web/`

Create pure rendering and view-model helpers in `src/web/`, then use the browser
entry script to bind those helpers to the DOM.

**Rationale**: Pure helpers are testable with Node's built-in test runner,
keeping most UI logic verifiable without a browser automation dependency.

**Alternatives considered**:

- Put all UI logic in `public/app.js`: faster initially, but harder to test and
  likely to become tangled.
- Introduce a component framework: too much package surface for this slice.

## Decision: Design Concept Gate Before Coding Visual UI

Before implementing `public/index.html` and CSS, create or approve a concrete
visual concept for the primary screen.

**Rationale**: The frontend app-builder guidance requires a design concept for a
new visually driven app surface. The concept prevents drifting into a generic
chat UI and gives the speaking-stick ritual a clear visual grammar.

**Alternatives considered**:

- Implement directly from text requirements: faster, but weaker visual outcome.
- Defer design until after a functional prototype: risks rework because layout
  and component hierarchy are central to this feature.

## Decision: Browser Verification Plus Node Tests

Use Node tests for rendering helpers and browser verification for the live local
workflow.

**Rationale**: The acceptance criteria include mobile readability and visual
workflow behavior that need browser inspection, while helper functions remain
cheap and deterministic to test.

**Alternatives considered**:

- Browser-only verification: misses repeatable unit coverage for rendering
  transformations.
- Node-only verification: cannot catch layout, viewport, or interaction issues.

