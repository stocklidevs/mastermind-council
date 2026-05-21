# Live Council Experience Notes

Date: 2026-05-18

These notes capture feedback from the first web real-council trial.

## Observations

- The UI needs a clear activity cue while the real council is working.
- The cue should indicate who has the speaking stick and whether that mentor is thinking or talking.
- Mentor output should appear live as each mentor finishes, rather than waiting for the whole turn to complete.
- Live mentor output should stream token-by-token, not only as whole completed mentor messages.
- A mentor can perform an action before speaking and another action after speaking.
- Mentors need a mechanism to ask the user clarifying questions.
- The council should support multiple turns until it reaches a decision or hits a configurable max-turn limit.
- The speaking stick should be visible as a ceremonial object, not only as state text.
- The stick should feel like a gold artifact with sacred or godly power.
- A smaller stick icon should appear beside the mentor who currently owns the right to speak.
- The experience should feel ceremonial, complete, and special: the user is entering a sacred moment with higher intelligences, not just opening a chat window.
- Mentors need deeper background, stronger personalities, and more specific voices than the initial mock council.
- The product should support AI-assisted mentor creation so a user can generate rich mentor identities, histories, temperaments, domains, constraints, and speaking styles.

## Likely Next Slice

Build a live council event stream:

- Server emits safe lifecycle events: round started, stick granted, mentor thinking, mentor answered, mentor question, provider error, synthesis complete.
- Server emits token-level output events for each speaking mentor.
- Browser renders mentor utterances incrementally as tokens arrive.
- Browser renders pre-speech and post-speech mentor actions separately from utterance text.
- UI shows animated activity state per mentor.
- UI renders the physical golden speaking stick and assigns a compact stick icon to the active mentor.
- UI tone leans ceremonial and sacred while preserving clarity, calm, and usability.
- Runtime supports a configurable turn limit.
- A mentor question pauses the council and lets the user answer before continuing.
- Mentor configuration grows from surface traits into deep biographies, operating principles, debate style, preferred questions, strengths, blind spots, and ritual presence.
- A later mentor-builder workflow can use AI to draft or refine these identities.
- Runtime and UI should leave room for future text-to-speech: token streaming, mentor voice metadata, speech state, and action timing should not assume text-only output forever.

## Product Decisions

- Visual direction: subtle sacred strategy room, not game-like fantasy. The experience should feel top notch, precise, calm, and carefully detailed, with Apple-like attention to clarity, spacing, motion, and state changes.
- Mentor questions: clarification requests should collect through the current turn rather than interrupting immediately. Multiple mentors can add their own clarifying questions from different angles, then the council pauses at the end of the turn for the user response.
- Participation: abstention remains active. At the start of each turn, each mentor can choose whether to join the interested mentor pool. Only mentors in that pool compete for the speaking stick, and each interested mentor can speak once before the turn closes.
- Turn loop: after the interested mentor pool has spoken, the council either asks accumulated clarification questions, starts another turn, reaches a decision, or closes at the configured max-turn limit.

This should be specified separately from logging because it changes the product interaction model.
