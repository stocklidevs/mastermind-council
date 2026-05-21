# Contract: Mock Council Web UI

This contract describes the user-visible behavior of the local web UI.

## Initial Page

Required visible elements:

- Product name or app title.
- Question input.
- Start council action.
- Mock council roster.
- Empty transcript/synthesis state.

Rules:

- The page must not ask for API keys.
- The page must not mention provider configuration.
- The primary workflow must be visible without navigating to another page.

## Start Council Interaction

Input:

```json
{
  "question": "What should I do first?"
}
```

Expected behavior:

- If the question is empty, show a validation message.
- If the question is valid, run the mock protocol core.
- Replace any previous transcript with the new session result.

## Transcript Rendering

Required item types:

- Round heading.
- Speaking-stick contribution.
- Abstention.
- Invalid protocol event.

Contribution display must include:

- Speaker name.
- Speaker role.
- Optional action field when provided.
- Utterance.

## Synthesis Rendering

Required fields:

- Agreement state.
- Closure reason.
- Main answer.
- Minority views when present.
- Assumptions.
- Verification guidance.

Rules:

- Split decisions must be labeled as split decisions.
- Minority views must not be hidden inside the main answer.
- Verification guidance must remain visible near the final answer.

## Responsive Behavior

Desktop:

- Question form, roster, transcript, and synthesis must be readable in one
  coherent workflow.

Mobile:

- Content may stack vertically.
- No text or controls may overflow horizontally.
- The user must still be able to enter a question, start a session, and read the
  synthesis.

