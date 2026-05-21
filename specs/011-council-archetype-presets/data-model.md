# Data Model: Council Archetype Presets

## CouncilPreset

- `id`
- `name`
- `category`
- `description`
- `tone`
- `mentors`

## PresetMentor

- existing mentor fields
- `identity`
- `personaMode`: `archetype` or `raw`

## Validation Rules

- Preset ids are unique.
- Mentor ids are unique within a preset.
- Every mentor has strengths and blind spots.
