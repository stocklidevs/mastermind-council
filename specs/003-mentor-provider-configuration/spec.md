# Feature Specification: Mentor Provider Configuration

**Feature Branch**: `003-mentor-provider-configuration`

**Created**: 2026-05-16

**Status**: Draft

**Input**: User description: "Create configuration for real council mentors before provider execution. Users need to understand how to set up API keys, optionally using 1Password secret references; choose a provider and model for each mentor; edit mentor characteristics such as name, role, personality, speaking style, participation behavior, and voice-ready metadata; and enable provider input/prompt caching for LLM providers and model configurations that support it. The feature must not expose secrets in browser code, logs, transcripts, screenshots, or plaintext persistence. Configuration should make unsupported caching visible instead of pretending every provider supports it."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Provider Secrets (Priority: P1)

A user can see how provider API keys are configured and choose between
environment variables and optional 1Password secret references without the app
ever displaying resolved secret values.

**Why this priority**: Real model execution cannot be safe until secret handling
is explicit, understandable, and redacted by default.

**Independent Test**: Can be tested by creating a provider configuration using
an environment variable name and a 1Password-style `op://` reference, then
verifying that the UI stores/displays only references and never a resolved key.

**Acceptance Scenarios**:

1. **Given** the user opens provider settings, **When** they choose environment
   variable mode, **Then** the app asks for an environment variable name rather
   than a plaintext key.
2. **Given** the user chooses 1Password mode, **When** they enter an `op://`
   secret reference, **Then** the app stores the reference and displays it in a
   redacted/safe form.
3. **Given** a provider secret reference is configured, **When** the user views
   the configuration later, **Then** no resolved secret value is visible.

---

### User Story 2 - Choose Provider And Model Per Mentor (Priority: P2)

A user can assign each mentor to a provider and model, while seeing provider
capabilities such as prompt caching support and voice-readiness metadata.

**Why this priority**: The mastermind value depends on intentional mentor
composition. Different mentors may need different models.

**Independent Test**: Can be tested by editing two mentors so they use different
provider/model selections and verifying that each mentor card reflects its own
configuration.

**Acceptance Scenarios**:

1. **Given** a mentor is being edited, **When** the user chooses a provider,
   **Then** the available model list is scoped to that provider.
2. **Given** a model is selected, **When** the model has known capabilities,
   **Then** the UI shows whether prompt caching and future voice support are
   supported, unsupported, or unknown.
3. **Given** different mentors use different providers, **When** the council
   roster is displayed, **Then** each mentor preserves its own provider/model
   selection.

---

### User Story 3 - Edit Mentor Characteristics (Priority: P3)

A user can edit mentor identity and behavior: name, role, personality, speaking
style, participation behavior, and voice-ready metadata.

**Why this priority**: Mentors should feel intentionally designed, not just
anonymous model slots.

**Independent Test**: Can be tested by editing a mentor's identity and style,
then verifying that the council roster and generated prompt profile reflect the
updated values.

**Acceptance Scenarios**:

1. **Given** a mentor profile is open, **When** the user edits name, role, and
   speaking style, **Then** the saved mentor shows those values in the roster.
2. **Given** the user edits personality and participation behavior, **When** the
   mentor prompt profile is previewed, **Then** those traits appear as public
   configuration, not hidden reasoning.
3. **Given** voice metadata is edited, **When** the mentor is displayed, **Then**
   the metadata is preserved for future voice features without requiring voice
   playback in this slice.

---

### User Story 4 - Configure Prompt/Input Caching Safely (Priority: P4)

A user can enable caching only for provider/model combinations that support it
and can understand what part of the mentor prompt is intended to be cacheable.

**Why this priority**: Long-lived mentor instructions are ideal cache candidates,
but provider support differs and incorrect configuration can create false cost
expectations.

**Independent Test**: Can be tested by selecting a caching-capable provider/model
and a non-capable provider/model, verifying that caching controls enable only
when supported and that unsupported states are visible.

**Acceptance Scenarios**:

1. **Given** a model supports automatic input caching, **When** the mentor has a
   long reusable instruction prefix, **Then** the UI marks caching as automatic
   and shows usage reporting as the expected verification path.
2. **Given** a model supports explicit prompt caching, **When** caching is
   enabled, **Then** the UI identifies which mentor prompt sections are stable
   cache candidates.
3. **Given** a model has unsupported or unknown caching capability, **When** the
   user views caching settings, **Then** caching controls are disabled or marked
   unknown rather than presented as guaranteed savings.

---

### Edge Cases

- Provider has no configured secret reference.
- 1Password CLI is not installed or not signed in.
- User enters a plaintext-looking API key instead of a reference.
- Model capability is unknown or stale.
- Provider supports caching but the selected model does not.
- Provider supports automatic caching but exposes no explicit cache-control
  field.
- Provider supports explicit caching but the mentor prompt has no stable
  cacheable section.
- User edits a mentor in a way that would invalidate a previously cached prefix.
- User duplicates a mentor with the same provider/model but different
  personality.
- Future voice metadata is set but no voice provider exists yet.

### Council Integrity & Safety *(mandatory for council-facing features)*

- Mentor configuration must never expose hidden chain-of-thought. Personality,
  style, and behavior are public configuration.
- Secret references must be stored and displayed safely; resolved secrets must
  never be shown in browser code, logs, transcripts, screenshots, or plaintext
  persistence.
- Caching must be represented as provider/model capability metadata with
  supported, unsupported, automatic, explicit, and unknown states.
- If npm packages are introduced during implementation, selected package
  versions must be checked against npm audit, OSV.dev, or an equivalent
  maintained vulnerability database before adoption, pinned in
  `package-lock.json`, and installed with `npm ci`.
- High-stakes advice behavior remains governed by the council synthesis rules;
  mentor personality cannot remove uncertainty or verification guidance.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a configuration area for provider secret
  references.
- **FR-002**: System MUST support environment-variable secret references.
- **FR-003**: System MUST support optional 1Password `op://` secret references.
- **FR-004**: System MUST reject or warn on plaintext-looking API keys entered
  into reference fields.
- **FR-005**: System MUST display configured secrets only as references or
  redacted labels, never as resolved values.
- **FR-006**: System MUST allow each mentor to choose a provider.
- **FR-007**: System MUST allow each mentor to choose a model from the selected
  provider's model list.
- **FR-008**: System MUST allow editing mentor name, role, personality,
  speaking style, and participation behavior.
- **FR-009**: System MUST allow storing voice-ready metadata for future mentor
  voice features without requiring voice playback.
- **FR-010**: System MUST expose provider/model capability metadata for prompt
  or input caching.
- **FR-011**: System MUST distinguish automatic caching, explicit caching,
  unsupported caching, and unknown caching capability.
- **FR-012**: System MUST disable or clearly mark caching controls when the
  selected provider/model does not support known caching.
- **FR-013**: System MUST identify stable mentor prompt sections as cache
  candidates when explicit caching is supported.
- **FR-014**: System MUST preserve dynamic user question and round-specific
  debate context outside stable cache candidates.
- **FR-015**: System MUST provide a mentor prompt/profile preview that shows
  public configured characteristics without exposing hidden reasoning or
  secrets.
- **FR-SEC**: System MUST NOT expose secrets in browser code, logs,
  transcripts, screenshots, or plaintext persistence.
- **FR-EPI**: System MUST preserve material uncertainty or dissent in any final
  synthesis that combines multiple council contributions.
- **FR-NPM**: If npm packages are introduced, selected package versions MUST be
  vulnerability-checked, pinned in `package-lock.json`, and installed with
  `npm ci`.

### Key Entities

- **Provider Configuration**: Provider name, secret reference mode, safe secret
  reference, and provider capability metadata.
- **Model Configuration**: Model identifier, display name, provider, caching
  capability, context notes, and voice-readiness metadata.
- **Mentor Profile**: Mentor name, role, personality, speaking style,
  participation behavior, provider/model selection, and voice metadata.
- **Secret Reference**: Safe pointer to a secret source, such as environment
  variable name or 1Password `op://` reference.
- **Caching Capability**: Provider/model-specific support state for automatic,
  explicit, unsupported, or unknown input/prompt caching.
- **Prompt Profile Preview**: User-visible preview of stable mentor instructions
  and dynamic sections used to reason about caching boundaries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can configure a mentor with provider, model, and edited
  characteristics in under 3 minutes.
- **SC-002**: 100% of secret displays show references or redacted labels, not
  resolved secret values.
- **SC-003**: A caching-capable model shows a caching state and cache candidate
  explanation.
- **SC-004**: An unsupported or unknown caching model does not present caching
  as guaranteed.
- **SC-005**: A mentor prompt/profile preview includes edited public traits and
  excludes secrets.
- **SC-006**: Future voice metadata can be saved and displayed without adding
  voice playback behavior.

## Assumptions

- This feature plans configuration only; actual provider execution can be a
  later feature.
- Provider/model lists may begin as curated static metadata before live provider
  discovery exists.
- 1Password support is optional and represented by `op://` references until a
  later runtime integration resolves them.
- Prompt/input caching differs by provider and model; the app should model
  capability and intent rather than guaranteeing savings.
- Initial caching candidates are stable mentor system/profile instructions, not
  dynamic user questions or debate turns.
