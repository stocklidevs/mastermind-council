# Settings Drawer And Provider Catalog Design

Date: 2026-05-17

## Goal

Move configuration out of the main council chamber and make provider management flexible enough for built-in providers, xAI, Groq, and user-defined OpenAI-compatible providers.

The main app should remain focused on the council ritual: ask a question, observe deliberation, and read the synthesis. Configuration should be available when needed without occupying the center of the experience.

## Scope

This feature covers:

- A top-level menu button that opens a settings drawer.
- Drawer tabs for council mentors, providers, models, and prompt/cache preview.
- Built-in provider presets.
- Custom provider creation and editing.
- Custom model creation and editing.
- Safe secret-reference handling for built-in and custom providers.
- Cache capability metadata for built-in and custom models.

This feature does not cover:

- Real provider API execution.
- Live model discovery from provider APIs.
- Resolving or testing actual secrets.
- Persisting configuration beyond the current local browser session unless a later storage feature is specified.
- Voice playback.

## Recommended Approach

Use a single right-side settings drawer with internal tabs.

This keeps the council chamber visible while the user edits configuration, avoids a heavy settings page too early, and gives us room for forms that will grow over time. The drawer can later become a full settings route if configuration outgrows the static app.

## Navigation

The top bar should include a compact settings/menu button. When clicked, it opens a right-side drawer.

Drawer tabs:

- **Mentors**: edit mentor identity, role, personality, speaking style, participation behavior, voice-ready metadata, provider, and model.
- **Providers**: view built-in providers, add custom providers, edit custom provider labels/base URLs/secret references.
- **Models**: manage model IDs for providers, including custom models.
- **Prompt**: preview stable and dynamic prompt sections and cache capability.

The drawer should be dismissible with a close button and by returning focus to the council chamber. Dark mode remains in the top bar.

## Provider Catalog

Providers should be represented as catalog entries rather than a fixed hard-coded list only.

Provider fields:

- `id`: stable provider slug.
- `name`: display name.
- `kind`: `built-in` or `custom`.
- `apiStyle`: initially `openai-compatible`, `native`, or `local`.
- `baseUrl`: optional API base URL.
- `secretLabel`: suggested environment variable name.
- `secretReference`: safe environment or 1Password reference.
- `models`: provider-owned model entries.
- `notes`: user-facing setup notes.

Built-in providers should include at least:

- OpenAI
- Anthropic
- Google Gemini
- OpenRouter
- xAI
- Groq
- Local Mock

Custom providers should initially target OpenAI-compatible APIs, because that covers many providers without committing to custom SDK behavior. If a provider later needs native request behavior, it can become a specialized adapter in a future provider execution feature.

Built-in provider presets should not be mutated directly in a way that blocks future metadata updates. User edits should be represented as local configuration/override data.

## Model Catalog

Models belong to providers.

Model fields:

- `id`: provider-facing model identifier.
- `displayName`: readable label.
- `providerId`: owning provider.
- `source`: `preset` or `custom`.
- `cacheCapability`: automatic, explicit, unsupported, or unknown.
- `voiceReadiness`: supported, unsupported, or unknown.
- `notes`: optional caveats.

Custom providers must allow at least one model ID. Custom models should default to unknown caching and unknown voice readiness until the user marks otherwise.

## Secret Handling

The existing secret-reference rules remain mandatory:

- Environment references store environment variable names, not key values.
- 1Password references store `op://` references, not resolved values.
- Plaintext-looking API keys are rejected or warned.
- Resolved secrets are never shown in browser UI, logs, transcripts, screenshots, or plaintext files.

The UI should label secret reference fields clearly enough that users understand they are entering a pointer, not a secret value.

## Data Flow

The app should split provider metadata into three concepts:

- Built-in presets: curated defaults shipped with the app.
- User provider settings: safe references and local provider overrides.
- Effective catalog: the merged view used by mentor/model selectors.

Mentor configuration should consume only the effective catalog. It should not need to know whether a provider is built-in or custom except for display affordances.

## Error Handling

The UI should handle these cases:

- Custom provider ID is empty or duplicates an existing provider.
- Custom provider has no model.
- Custom model ID is empty or duplicates another model for the provider.
- Secret reference looks like a plaintext key.
- Mentor selection points to a provider/model that no longer exists.
- Provider cache support is unknown.

When possible, invalid data should produce inline validation messages and preserve the user's draft input.

## Testing

Automated tests should cover:

- Built-in provider catalog contains expected presets including xAI and Groq.
- Custom provider creation validates unique IDs and required fields.
- Custom model creation validates unique model IDs per provider.
- Effective catalog merges built-ins and custom providers.
- Mentor model selection works with custom providers.
- Settings drawer landmarks and tabs render in the static UI.
- Secret validation still rejects plaintext-looking keys for custom providers.
- Unknown cache capability disables cache promises for custom providers/models.

Manual smoke checks should cover:

- Opening and closing the drawer.
- Switching tabs.
- Adding a custom provider and model.
- Assigning a mentor to that custom model.
- Seeing prompt/cache preview update without exposing secrets.

## Definition Of Done

- Configuration no longer occupies the main council chamber by default.
- Settings drawer exposes mentor, provider, model, and prompt/cache sections.
- xAI and Groq are available as built-in provider presets.
- Users can add a custom OpenAI-compatible provider with at least one model.
- Mentors can select built-in or custom providers/models.
- Secret references remain safe and redacted.
- Tests, README, feature docs, VERSION, and Git history are updated.

## Observed Verification

Completed on 2026-05-18:

- `npm.cmd ci --ignore-scripts` passed and reported 0 vulnerabilities.
- `node --test` passed with 44 tests.
- HTTP smoke checks returned 200 for `http://localhost:4173`, `/public/app.js`, and `/src/web/configuration-view.js`.
