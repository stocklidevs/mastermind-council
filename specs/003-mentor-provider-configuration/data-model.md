# Data Model: Mentor Provider Configuration

## SecretReference

Safe pointer to a provider credential.

Fields:

- `mode`: `environment` or `one-password`.
- `reference`: environment variable name or `op://` reference.
- `label`: safe display label.

Validation:

- Environment mode requires a valid environment variable-style name.
- 1Password mode requires an `op://` reference.
- Plaintext-looking API keys must trigger a warning or rejection.
- Resolved secret values are never stored in this model.

## ProviderMetadata

Describes provider-level configuration behavior.

Fields:

- `id`: stable provider ID.
- `name`: display name.
- `secretReference`: configured secret reference, if present.
- `models`: supported curated models.
- `notes`: user-facing setup notes.

Validation:

- Provider ID must be unique.
- Model IDs must be unique within provider.

## ModelMetadata

Describes a selectable model.

Fields:

- `id`: provider model identifier.
- `displayName`: readable model name.
- `providerId`: owning provider.
- `cacheCapability`: caching capability metadata.
- `voiceReadiness`: `supported`, `unsupported`, or `unknown`.
- `notes`: caveats or model-specific setup information.

Validation:

- `cacheCapability.state` must be `automatic`, `explicit`, `unsupported`, or
  `unknown`.
- Explicit caching requires a description of cache candidate sections.

## CacheCapability

Describes prompt/input caching behavior.

Fields:

- `state`: `automatic`, `explicit`, `unsupported`, or `unknown`.
- `userLabel`: display label.
- `verificationPath`: how the user can confirm caching later.
- `cacheCandidateSections`: stable mentor sections that may be cached.
- `dynamicSections`: sections that must remain outside cache candidates.

Validation:

- Unsupported and unknown states must not expose enable controls.
- Dynamic sections must include user question and debate state.

## MentorProfile

Editable council mentor configuration.

Fields:

- `id`: stable mentor ID.
- `name`: display name.
- `role`: council role.
- `personality`: public personality description.
- `speakingStyle`: public style guidance.
- `participationBehavior`: how the mentor decides to speak or abstain.
- `providerId`: selected provider.
- `modelId`: selected model.
- `voice`: voice-ready metadata.

Validation:

- Name, role, provider, and model are required.
- Selected model must belong to selected provider.
- Personality and style are public configuration, not hidden reasoning.

## VoiceMetadata

Future-ready voice fields.

Fields:

- `voiceLabel`: preferred voice descriptor.
- `pace`: slow, balanced, or brisk.
- `tone`: calm, direct, warm, analytical, or custom label.
- `enabledLater`: boolean marker for future voice support.

Validation:

- Voice metadata can be stored even when no voice provider is configured.

## PromptProfilePreview

User-visible preview of mentor prompt/profile sections.

Fields:

- `stableSections`: mentor identity, role, personality, speaking style,
  participation behavior.
- `dynamicSections`: user question, current round, prior contributions, closure
  request.
- `cacheNotes`: provider/model-specific cache explanation.

Validation:

- Preview must not include secrets.
- Preview must not imply hidden chain-of-thought access.

