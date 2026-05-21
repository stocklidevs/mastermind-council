# Contract: Mentor Provider Configuration UI

This contract describes the visible behavior of the configuration surface.

## Provider Secret Settings

Required fields:

- Provider.
- Secret mode: environment variable or 1Password reference.
- Secret reference value.
- Safe display label.

Rules:

- Environment mode accepts names such as `OPENAI_API_KEY`.
- 1Password mode accepts references beginning with `op://`.
- Plaintext-looking API keys must show a warning or be rejected.
- Resolved secret values must never be displayed.

## Mentor Editor

Required fields:

- Name.
- Role.
- Personality.
- Speaking style.
- Participation behavior.
- Provider.
- Model.
- Voice metadata.

Rules:

- Changing provider updates the selectable model list.
- Changing model updates capability display.
- Saved mentors display provider/model selection in the roster.

## Caching Capability Display

Required states:

- Automatic caching.
- Explicit caching.
- Unsupported caching.
- Unknown caching.

Rules:

- Automatic caching explains that usage reporting is the verification path.
- Explicit caching identifies stable cache candidate sections.
- Unsupported or unknown caching disables enablement controls.
- Dynamic user question and debate context are never presented as stable cache
  candidates.

## Prompt/Profile Preview

Required sections:

- Stable mentor profile.
- Dynamic session sections.
- Cache notes.

Rules:

- Preview includes public mentor characteristics.
- Preview excludes secrets.
- Preview must not expose or request hidden reasoning.

