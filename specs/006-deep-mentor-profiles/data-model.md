# Data Model: Deep Mentor Profiles

## DeepMentorIdentity

- `biography`: public backstory and intellectual posture
- `operatingPrinciples`: guiding principles
- `strengths`: domains or behaviors where the mentor excels
- `blindSpots`: known limitations
- `debateStyle`: how the mentor contributes in council
- `preferredQuestions`: questions the mentor tends to ask
- `ritualPresence`: subtle ceremonial presence

## MentorDraft

- `name`
- `role`
- `archetype`
- `identity`

## Validation Rules

- Fields are public profile content and must not include secrets.
- Empty fields are allowed but omitted from prompt preview when empty.
