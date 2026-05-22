# Mastermind

![Tests](https://img.shields.io/badge/tests-178%20passing-brightgreen)
![Version](https://img.shields.io/badge/version-0.25.8-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Spec Driven](https://img.shields.io/badge/spec--driven-Spec%20Kit-purple)

Mastermind is an early-stage local-first web app concept for consulting a council of LLM mentors. Instead of asking one model for one answer, the app will let multiple council members deliberate through structured rounds, claim a shared speaking stick, abstain when they have nothing useful to add, preserve dissent, and synthesize a final response for the user.

The product goal is a council that feels ceremonial but useful: a place where different model strengths, personalities, and reasoning styles can illuminate a question from several angles without pretending that consensus is always truth.

## Status

This repository is in early implementation mode. Spec Kit has been initialized for Codex skills, the dependency-free mock council protocol core is implemented, the first local static web UI is available, configuration lives in a settings drawer with a flexible provider catalog, local provider smoke tests can resolve 1Password references, and the web UI can call safe local real-provider and live mock council runtimes with structured diagnostic logs.

Current artifacts:

- [Statement of Work](docs/sow.md)
- [Research Notes](docs/reference/mastermind-llm-council-research.md)
- [Version](VERSION)
- [Spec Kit Constitution](.specify/memory/constitution.md)
- [Mock Council Protocol Spec](specs/001-mock-council-protocol/spec.md)
- [Mock Council Protocol Plan](specs/001-mock-council-protocol/plan.md)
- [Mock Council Protocol Tasks](specs/001-mock-council-protocol/tasks.md)
- [Mock Council Web UI Spec](specs/002-mock-council-web-ui/spec.md)
- [Mock Council Web UI Plan](specs/002-mock-council-web-ui/plan.md)
- [Mock Council Web UI Tasks](specs/002-mock-council-web-ui/tasks.md)
- [Mentor Provider Configuration Spec](specs/003-mentor-provider-configuration/spec.md)
- [Mentor Provider Configuration Plan](specs/003-mentor-provider-configuration/plan.md)
- [Mentor Provider Configuration Tasks](specs/003-mentor-provider-configuration/tasks.md)
- [Settings Drawer Provider Catalog Design](docs/superpowers/specs/2026-05-17-settings-drawer-provider-catalog-design.md)
- [Settings Drawer Provider Catalog Plan](docs/superpowers/plans/2026-05-18-settings-drawer-provider-catalog.md)
- [Local Provider Smoke Tests Design](docs/superpowers/specs/2026-05-18-local-provider-smoke-tests-design.md)
- [Local Provider Smoke Tests Plan](docs/superpowers/plans/2026-05-18-local-provider-smoke-tests.md)
- [Real Provider Council CLI Design](docs/superpowers/specs/2026-05-18-real-provider-council-cli-design.md)
- [Real Provider Council CLI Plan](docs/superpowers/plans/2026-05-18-real-provider-council-cli.md)
- [Local Web Runtime Bridge Design](docs/superpowers/specs/2026-05-18-local-web-runtime-bridge-design.md)
- [Local Web Runtime Bridge Plan](docs/superpowers/plans/2026-05-18-local-web-runtime-bridge.md)
- [Live Council Experience Notes](docs/superpowers/specs/2026-05-18-live-council-experience-notes.md)
- [Live Ceremonial Council Runtime Spec](specs/004-live-ceremonial-council-runtime/spec.md)
- [Live Ceremonial Council Runtime Plan](specs/004-live-ceremonial-council-runtime/plan.md)
- [Live Ceremonial Council Runtime Tasks](specs/004-live-ceremonial-council-runtime/tasks.md)
- [Clarification Resume Flow Spec](specs/005-clarification-resume-flow/spec.md)
- [Clarification Resume Flow Plan](specs/005-clarification-resume-flow/plan.md)
- [Clarification Resume Flow Tasks](specs/005-clarification-resume-flow/tasks.md)
- [Deep Mentor Profiles Spec](specs/006-deep-mentor-profiles/spec.md)
- [Deep Mentor Profiles Plan](specs/006-deep-mentor-profiles/plan.md)
- [Deep Mentor Profiles Tasks](specs/006-deep-mentor-profiles/tasks.md)
- [Council Session Settings Spec](specs/007-council-session-settings/spec.md)
- [Council Session Settings Plan](specs/007-council-session-settings/plan.md)
- [Council Session Settings Tasks](specs/007-council-session-settings/tasks.md)
- [Real Provider Token Streaming Spec](specs/008-real-provider-token-streaming/spec.md)
- [Real Provider Token Streaming Plan](specs/008-real-provider-token-streaming/plan.md)
- [Real Provider Token Streaming Tasks](specs/008-real-provider-token-streaming/tasks.md)
- [Real Streaming Live Council Spec](specs/009-real-streaming-live-council/spec.md)
- [Real Streaming Live Council Plan](specs/009-real-streaming-live-council/plan.md)
- [Real Streaming Live Council Tasks](specs/009-real-streaming-live-council/tasks.md)
- [Real Streaming Smoke Validation Spec](specs/010-real-streaming-smoke-validation/spec.md)
- [Real Streaming Smoke Validation Plan](specs/010-real-streaming-smoke-validation/plan.md)
- [Real Streaming Smoke Validation Tasks](specs/010-real-streaming-smoke-validation/tasks.md)
- [Council Archetype Presets Spec](specs/011-council-archetype-presets/spec.md)
- [Council Archetype Presets Plan](specs/011-council-archetype-presets/plan.md)
- [Council Archetype Presets Tasks](specs/011-council-archetype-presets/tasks.md)
- [Deep Persona Prompt Priming Spec](specs/012-deep-persona-prompt-priming/spec.md)
- [Deep Persona Prompt Priming Plan](specs/012-deep-persona-prompt-priming/plan.md)
- [Deep Persona Prompt Priming Tasks](specs/012-deep-persona-prompt-priming/tasks.md)
- [Preamble Clarification Phase Spec](specs/013-preamble-clarification-phase/spec.md)
- [Preamble Clarification Phase Plan](specs/013-preamble-clarification-phase/plan.md)
- [Preamble Clarification Phase Tasks](specs/013-preamble-clarification-phase/tasks.md)
- [Configurable Preamble Spec](specs/014-configurable-preamble/spec.md)
- [Configurable Preamble Plan](specs/014-configurable-preamble/plan.md)
- [Configurable Preamble Tasks](specs/014-configurable-preamble/tasks.md)
- [Real Provider Preamble Questions Spec](specs/015-real-provider-preamble/spec.md)
- [Real Provider Preamble Questions Plan](specs/015-real-provider-preamble/plan.md)
- [Real Provider Preamble Questions Tasks](specs/015-real-provider-preamble/tasks.md)
- [User Council Presets Spec](specs/016-user-council-presets/spec.md)
- [User Council Presets Plan](specs/016-user-council-presets/plan.md)
- [User Council Presets Tasks](specs/016-user-council-presets/tasks.md)
- [Local Session History Spec](specs/017-local-session-history/spec.md)
- [Local Session History Plan](specs/017-local-session-history/plan.md)
- [Local Session History Tasks](specs/017-local-session-history/tasks.md)
- [Live Real Mentor Fixes Spec](specs/018-live-real-mentor-fixes/spec.md)
- [Live Real Mentor Fixes Plan](specs/018-live-real-mentor-fixes/plan.md)
- [Live Real Mentor Fixes Tasks](specs/018-live-real-mentor-fixes/tasks.md)
- [Live Real Clarification Resume Spec](specs/019-live-real-clarification-resume/spec.md)
- [Live Real Clarification Resume Plan](specs/019-live-real-clarification-resume/plan.md)
- [Live Real Clarification Resume Tasks](specs/019-live-real-clarification-resume/tasks.md)
- [Live Real Stream Quality Spec](specs/020-live-real-stream-quality/spec.md)
- [Live Real Stream Quality Plan](specs/020-live-real-stream-quality/plan.md)
- [Live Real Stream Quality Tasks](specs/020-live-real-stream-quality/tasks.md)
- [Anthropic Model ID Fix Spec](specs/021-anthropic-model-id-fix/spec.md)
- [Anthropic Model ID Fix Plan](specs/021-anthropic-model-id-fix/plan.md)
- [Anthropic Model ID Fix Tasks](specs/021-anthropic-model-id-fix/tasks.md)
- [Real Live Deliberation And Synthesis Spec](specs/022-real-live-deliberation-synthesis/spec.md)
- [Real Live Deliberation And Synthesis Plan](specs/022-real-live-deliberation-synthesis/plan.md)
- [Real Live Deliberation And Synthesis Tasks](specs/022-real-live-deliberation-synthesis/tasks.md)
- [Council Synthesis Artifact Spec](specs/023-council-synthesis-artifact/spec.md)
- [Council Synthesis Artifact Plan](specs/023-council-synthesis-artifact/plan.md)
- [Council Synthesis Artifact Tasks](specs/023-council-synthesis-artifact/tasks.md)
- [Synthesis Quality Guardrails Spec](specs/024-synthesis-quality-guardrails/spec.md)
- [Synthesis Quality Guardrails Plan](specs/024-synthesis-quality-guardrails/plan.md)
- [Synthesis Quality Guardrails Tasks](specs/024-synthesis-quality-guardrails/tasks.md)
- [Ongoing Consultation Sessions Spec](specs/025-ongoing-consultation-sessions/spec.md)
- [Ongoing Consultation Sessions Plan](specs/025-ongoing-consultation-sessions/plan.md)
- [Ongoing Consultation Sessions Tasks](specs/025-ongoing-consultation-sessions/tasks.md)
- [Workspace Layout And Persistent Panels Spec](specs/026-workspace-layout-persistent-panels/spec.md)
- [Workspace Layout And Persistent Panels Plan](specs/026-workspace-layout-persistent-panels/plan.md)
- [Workspace Layout And Persistent Panels Tasks](specs/026-workspace-layout-persistent-panels/tasks.md)
- [Compact Fallback Synthesis Spec](specs/027-compact-fallback-synthesis/spec.md)
- [Compact Fallback Synthesis Plan](specs/027-compact-fallback-synthesis/plan.md)
- [Compact Fallback Synthesis Tasks](specs/027-compact-fallback-synthesis/tasks.md)
- [Live Real Speech Completeness Spec](specs/028-live-real-speech-completeness/spec.md)
- [Live Real Speech Completeness Plan](specs/028-live-real-speech-completeness/plan.md)
- [Live Real Speech Completeness Tasks](specs/028-live-real-speech-completeness/tasks.md)
- [Decision Brief Synthesis Spec](specs/029-decision-brief-synthesis/spec.md)
- [Decision Brief Synthesis Plan](specs/029-decision-brief-synthesis/plan.md)
- [Decision Brief Synthesis Tasks](specs/029-decision-brief-synthesis/tasks.md)
- [Frontier Model Catalog Spec](specs/030-frontier-model-catalog/spec.md)
- [Frontier Model Catalog Plan](specs/030-frontier-model-catalog/plan.md)
- [Frontier Model Catalog Tasks](specs/030-frontier-model-catalog/tasks.md)
- [Roleplayed Live Actions Spec](specs/031-roleplayed-live-actions/spec.md)
- [Roleplayed Live Actions Plan](specs/031-roleplayed-live-actions/plan.md)
- [Roleplayed Live Actions Tasks](specs/031-roleplayed-live-actions/tasks.md)
- [Public Repo Hardening Spec](specs/032-public-repo-hardening/spec.md)
- [Public Repo Hardening Plan](specs/032-public-repo-hardening/plan.md)
- [Public Repo Hardening Tasks](specs/032-public-repo-hardening/tasks.md)
- [PDF Consultation Export Spec](specs/033-pdf-consultation-export/spec.md)
- [PDF Consultation Export Plan](specs/033-pdf-consultation-export/plan.md)
- [PDF Consultation Export Tasks](specs/033-pdf-consultation-export/tasks.md)
- [OpenAI TTS Playback Spec](specs/034-openai-tts-playback/spec.md)
- [OpenAI TTS Playback Plan](specs/034-openai-tts-playback/plan.md)
- [OpenAI TTS Playback Tasks](specs/034-openai-tts-playback/tasks.md)

## Core Ideas

- A user asks a question to a council of LLM agents.
- Each agent can participate, abstain, or stay silent in a round.
- Only the agent holding the speaking stick can speak.
- An agent cannot speak twice in the same round.
- Agent contributions are public answers, not hidden chain-of-thought.
- Short action or stage-direction fields can make the council feel embodied.
- The final synthesis can preserve disagreement through majority views, minority reports, caveats, and next-step recommendations.

## Project Rules

- Specs come before implementation.
- The constitution is the governing source for product and workflow principles.
- Secrets must never be committed, logged, exposed in the browser, or persisted in plaintext.
- If npm is used, package versions must be vulnerability-checked, lockfile-pinned, and installed with `npm ci`.
- 1Password integration is optional, not a hard dependency.
- Consensus is not treated as proof of truth.
- Every completed spec should update the version file, documentation, README when relevant, and Git history.

See [docs/sow.md](docs/sow.md) for the full scope of work, requirements, definition of done, and initial work packages.

## Planned Capabilities

- Spec Kit driven development workflow.
- Mock-agent council protocol for the MVP.
- Local web UI with chat, council chamber, speaking-stick state, transcript, and final synthesis.
- Configurable council members with names, roles, personalities, providers, models, and behavior settings.
- Settings drawer for mentors, providers, models, and prompt/cache preview.
- Provider catalog with built-in OpenAI, Anthropic, Gemini, OpenRouter, xAI, Groq, local mock, and custom OpenAI-compatible providers.
- Optional 1Password CLI secret references for API keys.
- Local provider smoke tests for Claude, xAI, OpenAI, and Novita using 1Password references.
- Local real-provider council CLI and web runtime bridge for one OpenAI, Claude, xAI, and Novita council round.
- Safe structured runtime logs for real-provider web requests and provider calls.
- Live mock council mode with server-sent events, token-by-token mentor output, compact ceremonial stick ownership, mentor activity states, pre/post speaking actions, abstentions, and end-of-turn clarification questions.
- Clarification resume flow where the user answers collected mentor questions and the live mock council continues with that answer as context.
- Deep mentor profiles with biography, operating principles, strengths, blind spots, debate style, preferred questions, ritual presence, and a local draft helper for later AI-assisted mentor creation.
- Session settings tab for configurable live mock max turns, clamped from 1 to 5.
- Provider-neutral token streaming foundation for OpenAI Responses and Anthropic Messages using mocked SSE tests.
- Live real council mode that streams supported OpenAI and Anthropic mentors into the live council event path, while safely skipping unsupported streaming providers.
- Provider streaming smoke command for controlled OpenAI and Anthropic transport validation.
- Council archetype presets for philosophy, science, economics, personal growth, strategy, and raw analysis.
- Deep persona prompt priming that injects archetype/raw mode guidance, biographies, principles, strengths, blind spots, debate style, preferred questions, and ritual presence into mentor prompts without requesting private chain-of-thought.
- Preamble clarification phase where live mock mentors can ask initial questions before turn 1 and resume into the first debate turn after the user answers.
- Default-on session setting to disable preamble clarification when the user wants the council to begin deliberating immediately.
- Real-provider preamble question pass for supported live streaming mentors, using a public structured clarification contract before turn 1.
- Local saved council presets so users can save, restore, and delete named mentor rosters without storing resolved secrets.
- Local public-safe session history for completed mock, real, and live sessions, shown in Session settings with a clear-history action.
- Live real mode now uses the selected council roster, streams visible mentor speech instead of JSON, and persists current mentor edits locally.
- Live real clarification answers now resume through the real provider streaming path instead of the local mock resume script.
- Live real mode supports OpenAI-compatible chat streaming providers, treats provider/runtime limitations as errors rather than mentor abstentions, avoids silent done states, and synthesizes from visible streamed mentor contributions.
- Anthropic mentors now use the documented Claude Sonnet 4 API model id, and saved local rosters migrate the legacy shorthand id before live real requests.
- Live real sessions now use per-turn mentor interest decisions, can continue up to the configured max turns, and can assign a provider/model to write the final synthesis from the visible transcript.
- Council synthesis is now a structured artifact with next actions, unresolved questions, mentor grounding, confidence, and validation against transcript concatenation.
- Synthesis quality guardrails now reject mentor-by-mentor recap outputs, preserve artifact fields, and render action, grounding, and unresolved-question sections.
- Ongoing consultation sessions can now be saved locally, reopened, and continued with follow-up questions using the same mentors and synthesis settings.
- Workspace layout now keeps council state, transcript, and synthesis in persistent panel regions, adds mobile workspace tabs, and shows the active synthesis model near the counsel.
- Fallback synthesis now distills visible mentor contributions into a compact local artifact instead of dumping the transcript when model synthesis is unavailable or rejected.
- Live real mentors now emit public pre/post speaking actions again, and live mentor/synthesis provider calls use larger token budgets to reduce cut-off output.
- Synthesis now asks for a decision brief, rejects multi-mentor recap text in the main answer, and keeps named attribution inside grounding.
- Built-in provider catalogs now include GPT-5.5, Claude Sonnet 4.6, and Grok 4 as selectable mentor and synthesis model options.
- Live real mentors now generate persona-aware pre/post speaking stage directions through their provider/model, with safe local fallback text.
- Public repository metadata now includes an MIT license, synced package version, and generic 1Password smoke-test examples.
- Council discussions can now be exported through a browser print-to-PDF view for the latest completed session or saved consultations.
- OpenAI TTS playback can now be enabled from Session settings, with global and per-mentor voice selection, server-side secret resolution, and queued audio for completed live mentor utterances.
- OpenAI TTS playback is now on by default for fresh sessions, while the Session settings toggle still lets you turn it off.
- TTS requests now emit safe server lifecycle logs, and the UI surfaces when voice playback is off instead of silently skipping queued mentor speech.
- Live real sessions now pass the provider secret references configured in the drawer through a short-lived local config id, and mentor tiles show the sanitized error reason when a provider cannot speak.
- Provider secret settings now persist locally, and the Providers tab includes a 1Password defaults helper for applying generic provider key names across configured providers.
- Local-only 1Password defaults can now be restored from ignored `public/local-secret-defaults.json`, so public Git history stays generic while a personal machine can keep its real vault, account, and item names working.
- The local 1Password defaults loader now fetches the file from the served `/public/` path, so startup restores provider references instead of leaving stale generic references in place.
- The top-right session status now illuminates with a left-to-right sweep while a council is initiating, then settles once live activity, completion, or failure takes over.
- 1Password secret resolution now carries the account domain through `op read --account`, matching the local team account used by the Mastermind API key items.
- Prompt/input cache capability display for provider/model combinations that support it.
- Saved sessions and council presets.

## Spec Kit Workflow

Spec Kit is initialized with:

- integration: Codex
- mode: skills
- scripts: PowerShell
- branch numbering: sequential

Use the project-local Spec Kit skills in this order:

1. `$speckit-constitution` - establish project principles from the SOW.
2. `$speckit-specify` - create a feature specification.
3. `$speckit-clarify` - optional ambiguity pass before planning.
4. `$speckit-plan` - create the technical implementation plan.
5. `$speckit-tasks` - generate implementation tasks.
6. `$speckit-analyze` - optional consistency check before implementation.
7. `$speckit-implement` - execute the approved tasks.

## Development

The current implemented slice is a dependency-free Node.js protocol core plus a static local web UI.

Install from the committed lockfile:

```powershell
npm.cmd ci --ignore-scripts
```

Run tests:

```powershell
node --test
```

Run the local mock council web UI:

```powershell
npm.cmd run serve
```

Then open `http://localhost:4173`.

Use the council mode selector to choose `Mock council`, `Live mock council`, `Live real council`, or `Real council`. Real council calls the local Node endpoint at `/api/council/real`; keys still resolve only in Node. Live mock and live real council call `/api/council/live` and stream public-safe server-sent events.

When the local server handles real council requests, it emits JSON-line diagnostic events to stdout. These logs include request, provider start, provider completion, and provider error events with mentor/provider/model identifiers, latency, contribution length, and session ids. Secrets and `op://` references are never written to the logs.

Live mock council mode streams mentor lifecycle and token events. The UI uses those events to show who is thinking, who holds the compact gold speaking stick indicator, who is speaking, which mentors abstained, and whether the council paused for clarification. When clarification is requested, the user can answer all mentor questions in one response and the mock council resumes with that answer as added context.

Live mock and supported live real sessions can also pause during a preamble before turn 1 when mentors need clarifying context. The same answer panel is used, and the resumed council starts its first debate turn from the clarified context. In live real mode, the clarification answer is sent back through the server-sent real provider stream, preserving the existing transcript and appending real mentor tokens. This preamble is enabled by default and can be disabled from Session settings.

OpenAI voice playback is optional and enabled by default for fresh sessions. You can turn it off from Session settings, choose a default OpenAI voice and speed, and optionally override the OpenAI voice per mentor in Mentors settings. The UI streams text first; after a mentor finishes speaking, the local Node server calls `/api/tts/openai` with the completed public utterance and returns AI-generated audio. The OpenAI key is resolved server-side from the configured environment variable or 1Password reference and is never stored in the browser.

Provider API keys can be set from the Providers tab. Use the 1Password defaults helper with your vault and optional account domain to apply references such as `op://Your Vault/OpenAI API Key/credential`, `op://Your Vault/Anthropic API Key/credential`, and `op://Your Vault/xAI API Key/credential` across configured providers. The references and account domain are stored locally in the browser; resolved keys remain server-side only.

For a private local machine, copy `public/local-secret-defaults.example.json` to `public/local-secret-defaults.json` and put your real vault, account, and item names there. That file is ignored by Git. When present, the app loads it on startup and restores the local 1Password references that should be used by the Providers tab.

Run local provider smoke checks:

```powershell
npm.cmd run provider:smoke -- --dry-run
```

Run streaming provider smoke checks for OpenAI and Anthropic:

```powershell
npm.cmd run provider:stream-smoke -- --dry-run
```

To make one tiny live streaming request to each supported streaming provider:

```powershell
npm.cmd run provider:stream-smoke
```

To send one tiny live request to each configured provider:

```powershell
npm.cmd run provider:smoke
```

Smoke output prints provider status and short response previews only. It never prints resolved API keys.

Run a local real-provider council round:

```powershell
npm.cmd run council:real -- "What should I focus on this week?"
```

Use dry-run mode to exercise the runtime without provider calls:

```powershell
npm.cmd run council:real -- --dry-run "What should I focus on this week?"
```

PowerShell on this machine blocks `npm.ps1`, so use `npm.cmd` for npm commands.

Expected early workflow:

1. Define project constitution and feature specs.
2. Plan the smallest vertical MVP slice.
3. Implement the council protocol with mock agents. Done for the first protocol core.
4. Add the web UI. First local static UI is implemented.
5. Add mentor/provider configuration. Done for safe secret references, provider/model selection, mentor characteristics, and cache capability display.
6. Move configuration into a settings drawer and add flexible provider catalog. Done for built-ins and custom OpenAI-compatible providers.
7. Add local 1Password secret resolution and provider smoke tests. Done for Claude, xAI, OpenAI, and Novita.
8. Integrate real providers into the council deliberation runtime. Done for a local one-round CLI.
9. Connect the local real-provider runtime to the web experience through a safe local server. Done with `POST /api/council/real` and the web mode selector.
10. Add the first live ceremonial runtime. Done for mock server-sent events, token streaming, activity state, visible speaking stick, and clarification pause.
11. Add clarification answer and resume. Done for mock sessions with one user answer, resumed token streaming, and clarified final counsel.
12. Deepen mentor identities. Done for editable public identity fields and safe prompt preview.
13. Add session settings. Done for configurable live mock max turns.
14. Add real provider token streaming foundation. Done for OpenAI and Anthropic request builders, SSE parsers, and provider-neutral token streams.
15. Connect real provider streaming into the live council. Done for OpenAI and Anthropic live mode with safe unsupported-provider handling.
16. Add real streaming smoke validation. Done for OpenAI and Anthropic streaming smoke CLI.
17. Add council archetype presets. Done for six local preset rosters and settings selection.
18. Add deep persona prompt priming. Done for archetype honesty rules, raw analysis mode, and rich identity blocks in real-provider mentor prompts.
19. Add preamble clarification phase. Done for live mock pre-turn questions, user answer pause, and turn-1 resume.
20. Add configurable preamble. Done for a default-on Session toggle and live mock request/runtime handling.
21. Add real-provider preamble questions. Done for supported live real mentors with structured public question prompts and disabled-setting handling.
22. Add user council presets. Done for local save, restore, delete, and cloned mentor rosters.
23. Add local session history. Done for public-safe completed session records, recent-session listing, and clearing.
24. Add ongoing consultation sessions. Planned for saving, retrieving, and continuing council conversations with follow-up questions.
25. Improve workspace layout. Planned for persistent council/synthesis panels, independent transcript scrolling, and responsive workspace navigation.
26. Compact fallback synthesis. Done for local fallback distillation when model synthesis is unavailable or rejected.
27. Restore live real speech completeness. Done for real mentor pre/post actions and larger live real token budgets.
28. Improve synthesis into a decision brief. Done for stricter prompt instructions, recap rejection, and non-concatenated fallback counsel.
29. Add frontier model catalog entries. Done for GPT-5.5, Claude Sonnet 4.6, and Grok 4.
30. Add roleplayed live actions. Done for provider-authored pre/post live real stage directions with fallback safety.
31. Harden public repository metadata. Done for MIT licensing, synced package metadata, and generic smoke-test secret references.
32. Add PDF consultation export. Done for print-to-PDF export of current and saved council discussions.
33. Add OpenAI TTS playback. Done for configurable AI voice playback of completed live mentor utterances.

## License

Mastermind is released under the [MIT License](LICENSE).
