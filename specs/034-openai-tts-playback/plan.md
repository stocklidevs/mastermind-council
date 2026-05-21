# Implementation Plan: OpenAI TTS Playback

**Branch**: `034-openai-tts-playback` | **Date**: 2026-05-21 | **Spec**: [spec.md](spec.md)

## Summary

Add OpenAI text-to-speech playback for completed live mentor utterances. The browser keeps the existing token-by-token transcript stream, then queues audio requests to a local Node endpoint after `mentor.done`. The endpoint resolves the OpenAI key server-side through environment variables or 1Password references and returns generated audio without exposing secrets.

## Technical Context

**Language/Version**: JavaScript on Node.js 24.11.0; browser HTML/CSS/JS.

**Primary Dependencies**: None beyond Node.js and browser platform APIs.

**Storage**: Local browser storage for voice playback preferences and mentor voice metadata. No resolved secrets are stored.

**Testing**: Node.js built-in test runner.

**Constraints**: No new npm dependencies; use `npm.cmd ci --ignore-scripts`; preserve secret safety; audio generation must not alter visible mentor text.

## Implementation Tasks

- Add OpenAI TTS provider helpers for voice list, validation, speech request construction, and mentor-aware instructions.
- Add a local `/api/tts/openai` endpoint that resolves OpenAI secrets server-side and returns audio bytes.
- Add Session settings for TTS enablement, default voice, speed, and stop playback.
- Add mentor voice controls for OpenAI voice selection and per-mentor enablement.
- Queue audio playback after live `mentor.done` events using completed utterance text.
- Update docs, version files, and tests.

## Verification

- `npm.cmd ci --ignore-scripts`
- `node --test`
