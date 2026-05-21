# Research: Clarification Resume Flow

## Decision: One Answer For All Mentor Questions

**Rationale**: Multiple mentor questions can be answered as one reflective response, avoiding a rigid questionnaire and preserving the ceremonial council feel.

**Alternatives considered**:

- Separate answer per mentor: more structured but too heavy for the first interaction.
- Auto-answer or skip questions: would undercut the purpose of asking the user.

## Decision: Browser-Held Resume Context For MVP

**Rationale**: The current app is local-first and in-memory. Holding the previous live event state in the browser keeps the slice small and testable.

**Alternatives considered**:

- Server-side session store: better for refresh/reconnect but adds persistence scope.
- Encoding full context in the URL: brittle and exposes too much in browser history.

## Decision: Mock Resume Before Real Provider Resume

**Rationale**: Mock resume validates the product loop without provider-specific streaming APIs or cost.

**Alternatives considered**:

- Real-provider resume now: desirable later, but it depends on provider-native streaming and prompt context handling.
