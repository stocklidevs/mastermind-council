# Design Notes: Quiet Strategic Room

Approved concept: 2026-05-16

Concept image:
`C:\Users\pstoc\.codex\generated_images\019e30e6-2300-7831-910b-cc58c257b99e\ig_0ad001f11a69808a016a089c647a0481938daea02d0ce5b938.png`

## Direction

The first UI should feel like a quiet strategic room: calm, deliberate,
intelligent, spacious, and useful. The ritual is visible through structure rather
than theatrical decoration.

## Layout

- Top bar: product name, current session state, compact light/dark theme toggle.
- Left rail: council roster with mentor name, role, presence state, and a small
  future-ready voice indicator slot.
- Center: deliberation transcript grouped by rounds, with speaking-stick state
  attached to contributions.
- Right panel: synthesis with agreement state, closure reason, main answer,
  minority views, assumptions, and verification guidance.
- Question input: prominent but calm, phrased around bringing a question to the
  council rather than generic chat.

## Light Theme Tokens

- Background: warm white.
- Surface: soft neutral white.
- Muted surface: pale slate.
- Text: dark ink.
- Muted text: slate gray.
- Border: low-contrast warm gray.
- Accent: muted brass/olive for speaking stick and active mentor state.
- Warning/split decision: restrained amber.

## Dark Theme Tokens

- Background: deep charcoal.
- Surface: dark graphite.
- Muted surface: blue-gray charcoal.
- Text: soft gray-white.
- Muted text: cool gray.
- Border: low-contrast graphite.
- Accent: warm brass.
- Warning/split decision: muted amber.

## Component Inventory

- App shell with three-column desktop layout and stacked mobile layout.
- Council member row with states: listening, holding stick, spoken, abstained.
- Voice placeholder dot/ring reserved for future speech activity.
- Round section with quiet heading and ordered events.
- Contribution item with speaker metadata, speaking-stick label, action note,
  and utterance.
- Abstention item visually distinct from contribution.
- Invalid event item visible but subdued.
- Synthesis panel with agreement badge, answer block, minority views,
  assumptions, and verification guidance.
- Theme toggle.

## Rules

- No giant avatars.
- No glowing gradients, decorative orbs, or cyberpunk treatment.
- No marketing hero.
- No real provider/API-key UI in this slice.
- Action fields are short, italic, and secondary to utterances.
- Dissent and assumptions remain visible.
- Dark mode uses the same layout and components as light mode; only tokens
  change.

