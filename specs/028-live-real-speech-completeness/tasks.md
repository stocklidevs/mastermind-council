# Tasks: Live Real Speech Completeness

- [x] Add failing tests for live real pre/post action events.
- [x] Add failing tests for expanded live mentor speech token budgets.
- [x] Add failing tests for expanded configured synthesis token budgets.
- [x] Emit `mentor.pre_action` after stick grant.
- [x] Emit `mentor.post_action` after streamed speech and before done.
- [x] Pass larger `maxTokens` for live real mentor speech.
- [x] Pass larger `maxTokens` for configured synthesis.
- [x] Run `npm.cmd ci --ignore-scripts` and full `node --test`.
