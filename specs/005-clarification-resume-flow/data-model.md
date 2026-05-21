# Data Model: Clarification Resume Flow

## ClarificationRequest

- `turnNumber`: turn that produced the request
- `questions`: mentor-attributed question list
- `status`: `awaiting_answer`, `answered`

## ClarificationAnswer

- `text`: user answer
- `createdAt`: local timestamp when submitted
- `questionCount`: number of mentor questions answered

## ResumeContext

- `originalQuestion`: first user question
- `nextTurnNumber`: turn number to start after clarification
- `clarificationQuestions`: mentor questions
- `clarificationAnswer`: user answer
- `priorSummary`: public summary of prior live transcript

## Validation Rules

- Clarification answer text must not be blank.
- Resume can only occur while the live view state is awaiting clarification.
- Resumed turn number must be greater than the clarification turn number.
- Resume context must contain only public transcript and user-provided content.
