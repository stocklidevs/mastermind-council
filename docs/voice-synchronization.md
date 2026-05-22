# Voice Synchronization

Mastermind voice playback now uses a progressive chunk pipeline for live council sessions.

## Current Approach

- Live mentor tokens continue rendering immediately in the transcript.
- A browser-side speech buffer collects tokens until a natural sentence boundary is reached.
- When a boundary is ready, the app starts the OpenAI TTS request for that segment while the mentor keeps streaming text.
- Audio jobs are prefetched in the background and played in transcript order.
- The active mentor tile shows animated speaker waves, and the active transcript card receives a subtle voice-active state with the segment currently being read.
- `mentor.done` flushes any remaining unsent speech so short or final fragments are still voiced.

## Why This Shape

This gives the council a much tighter text/voice experience without requiring word-level timestamps or a full realtime audio model. It also keeps the visible transcript as the source of truth: the app only voices text that has already appeared in the transcript.

## Boundaries

- Synchronization is currently segment-level, not word-level.
- TTS requests still use the configured OpenAI speech endpoint and local secret resolution.
- Audio generation can run ahead of playback, but playback remains ordered so mentor speech does not overlap incoherently.
- A later realtime audio slice can replace this with stream-format audio or Web Audio scheduling if finer synchronization becomes important.
