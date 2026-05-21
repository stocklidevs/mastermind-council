# Quickstart: Live Ceremonial Council Runtime

## Install

```powershell
npm.cmd ci --ignore-scripts
```

## Test

```powershell
node --test
```

## Run The Local App

```powershell
npm.cmd run serve
```

Open `http://localhost:4173`.

## Exercise The Live Mock Council

1. Select `Live mock council` from the council mode selector.
2. Ask a question.
3. Confirm that the roster shows mentor thinking/speaking/done state.
4. Confirm that the gold speaking stick is visible and assigned to the active mentor.
5. Confirm that mentor output appears incrementally token by token.
6. Confirm that pre-speech and post-speech actions render separately from utterance text.

## Direct Event Stream Smoke

Open this URL while the server is running:

```text
http://localhost:4173/api/council/live?mode=mock&question=What%20should%20I%20focus%20on%3F&maxTurns=1
```

The response should stream `text/event-stream` records with public event payloads.
