# Quickstart: Preamble Clarification Phase

Run focused tests:

```powershell
node --test tests\council\live-runtime.test.js tests\web\live-view.test.js
```

Run all tests:

```powershell
node --test
```

Manual smoke:

```powershell
npm.cmd run serve
```

Open `http://localhost:4173`, ask a live mock question, answer the council clarification prompt, and confirm debate starts after the answer.
