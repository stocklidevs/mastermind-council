# Tasks: OpenAI TTS Playback

- [x] Add failing provider tests for OpenAI TTS request construction, voice validation, and mentor-aware instructions.
- [x] Add failing server tests for environment and 1Password secret resolution without key leakage.
- [x] Add failing static UI tests for TTS settings and playback hooks.
- [x] Implement OpenAI TTS provider helper.
- [x] Implement `/api/tts/openai` server endpoint.
- [x] Add Session settings for TTS enablement, voice, speed, and stop.
- [x] Add mentor-level OpenAI voice and enablement controls.
- [x] Queue completed live mentor utterances for OpenAI audio playback.
- [x] Update README, VERSION, package metadata, and Spec Kit pointers.
- [x] Run dependency install verification and full test suite.
- [x] Fix live real secret configuration handoff and expose sanitized mentor error reasons.
- [x] Persist provider secret references and add a 1Password defaults helper for all configured providers.
- [x] Pass the configured 1Password account domain through live council and TTS secret resolution.
