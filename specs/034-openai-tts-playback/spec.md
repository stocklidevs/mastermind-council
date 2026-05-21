# Feature Specification: OpenAI TTS Playback

**Feature Branch**: `034-openai-tts-playback`
**Created**: 2026-05-21
**Status**: Implemented
**Input**: User requested OpenAI text-to-speech for mentor speech, configurable from the app settings, using the existing OpenAI key flow.

## Requirements

- **FR-001**: Users MUST be able to enable or disable OpenAI voice playback from Session settings.
- **FR-002**: The app MUST use the existing OpenAI secret reference path and MUST NOT expose resolved API keys in browser code, logs, request bodies, transcripts, or persisted local state.
- **FR-003**: Live visible mentor speech MUST continue streaming token-by-token; TTS audio MUST be requested only after a mentor completes a speaking contribution.
- **FR-004**: Users MUST be able to select an OpenAI built-in voice globally and override the voice per mentor.
- **FR-005**: Mentor voice requests MUST include public mentor voice metadata so OpenAI TTS can shape tone and pacing without adding hidden reasoning or changing the visible utterance.
- **FR-006**: The UI MUST disclose that voice playback uses AI-generated audio.
- **FR-007**: Users MUST be able to stop queued/current voice playback.
- **FR-008**: Provider failures MUST be surfaced as a voice-unavailable status without breaking the council transcript or synthesis flow.

## Acceptance Criteria

- Session settings show an OpenAI TTS toggle, default voice, speed, and stop control.
- Mentor settings show per-mentor OpenAI voice and enabled controls.
- The browser sends completed mentor utterances to `/api/tts/openai` only when TTS is enabled.
- Server tests prove OpenAI speech requests sanitize secrets and support environment or 1Password references.
- Provider tests prove OpenAI voice validation, request construction, and mentor-aware speech instructions.

## Out of Scope

- Realtime speech-to-speech conversation.
- TTS for synthesis text.
- Non-OpenAI TTS providers.
- Voice cloning or custom voice consent flows.
