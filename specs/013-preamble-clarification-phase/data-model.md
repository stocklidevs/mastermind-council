# Data Model: Preamble Clarification Phase

## Preamble Question

- `mentorId`: mentor asking the question
- `mentorName`: public mentor name
- `question`: public clarification question
- `phase`: `preamble`

## Preamble Awaiting State

- `status`: `awaiting_clarification`
- `clarificationTurnNumber`: `0`
- `clarificationQuestions`: list of public preamble questions

## Resume Context

- `originalQuestion`: user's initial question
- `clarificationAnswer`: user's answer
- `nextTurnNumber`: `1` when resuming from preamble
