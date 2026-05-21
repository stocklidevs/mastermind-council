# Settings Drawer Provider Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move configuration into a settings drawer and support built-in plus custom providers/models.

**Architecture:** Keep the static app dependency-free. Split provider catalog behavior into pure config helpers, expose effective catalog view models to the browser UI, then move the existing configuration panels into a tabbed drawer.

**Tech Stack:** Node.js ES modules, built-in `node:test`, static HTML/CSS/JavaScript, existing Spec Kit docs.

---

## File Structure

- `src/config/provider-catalog.js`: Pure helpers for built-in presets, custom providers, custom models, effective catalog merging, validation, and selection-safe fallback.
- `src/config/provider-metadata.js`: Continue exporting the built-in provider presets for backward compatibility.
- `src/config/mentor-config.js`: Allow mentor model updates against an effective provider catalog.
- `src/web/configuration-view.js`: Build drawer tab, provider, model, cache, and prompt view models.
- `src/index.js`: Export new catalog helpers.
- `public/index.html`: Add settings menu button and drawer landmarks; remove always-visible configuration block from the chamber.
- `public/app.js`: Manage drawer open/close, tabs, custom provider/model drafts, and mentor selection.
- `public/styles.css`: Style drawer, tabs, provider/model lists, validation states, and responsive behavior.
- `tests/config/provider-catalog.test.js`: Catalog behavior tests.
- `tests/config/mentor-config.test.js`: Custom provider mentor assignment test.
- `tests/web/configuration-view.test.js`: Drawer/effective catalog view-model tests.
- `tests/web/static-configuration-ui.test.js`: Static drawer landmark tests.
- `README.md`, `VERSION`, `package.json`, `package-lock.json`: Release notes and version bump.

## Task 1: Provider Catalog Helpers

**Files:**
- Create: `tests/config/provider-catalog.test.js`
- Create: `src/config/provider-catalog.js`
- Modify: `src/config/provider-metadata.js`
- Modify: `src/index.js`

- [ ] **Step 1: Write the failing tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addCustomModel,
  addCustomProvider,
  builtInProviders,
  createProviderCatalogState,
  getEffectiveProviders,
  validateCustomProviderDraft
} from '../../src/config/provider-catalog.js';

test('built-in catalog includes xAI and Groq presets', () => {
  assert.ok(builtInProviders.some((provider) => provider.id === 'xai'));
  assert.ok(builtInProviders.some((provider) => provider.id === 'groq'));
});

test('adds a custom OpenAI-compatible provider with a default unknown cache model', () => {
  const state = createProviderCatalogState();
  const updated = addCustomProvider(state, {
    id: 'together',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    secretLabel: 'TOGETHER_API_KEY',
    modelId: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8'
  });

  const provider = getEffectiveProviders(updated).find((item) => item.id === 'together');
  assert.equal(provider.kind, 'custom');
  assert.equal(provider.apiStyle, 'openai-compatible');
  assert.equal(provider.models[0].cacheCapability.state, 'unknown');
});

test('rejects duplicate custom provider ids', () => {
  const state = createProviderCatalogState();
  const result = validateCustomProviderDraft(state, {
    id: 'openai',
    name: 'Other OpenAI',
    baseUrl: 'https://example.test/v1',
    modelId: 'model'
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.id, /already exists/i);
});

test('adds custom models uniquely within a provider', () => {
  const state = addCustomProvider(createProviderCatalogState(), {
    id: 'local-gateway',
    name: 'Local Gateway',
    baseUrl: 'http://localhost:8080/v1',
    modelId: 'first-model'
  });
  const updated = addCustomModel(state, 'local-gateway', {
    id: 'second-model',
    displayName: 'Second Model',
    cacheState: 'unsupported'
  });

  const provider = getEffectiveProviders(updated).find((item) => item.id === 'local-gateway');
  assert.deepEqual(provider.models.map((model) => model.id), ['first-model', 'second-model']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/config/provider-catalog.test.js`

Expected: FAIL with module-not-found for `src/config/provider-catalog.js`.

- [ ] **Step 3: Implement the catalog helper**

Create `src/config/provider-catalog.js` with exported built-ins, validation, add, and merge helpers. Include built-ins for OpenAI, Anthropic, Gemini, OpenRouter, xAI, Groq, and Local Mock. Custom providers default to `apiStyle: 'openai-compatible'`; custom models default to unknown cache capability.

- [ ] **Step 4: Wire exports and backward-compatible metadata**

Update `src/config/provider-metadata.js` to export `providers` from `builtInProviders` and keep `getProvider`, `getModelsForProvider`, and `getModel` behavior. Export catalog helpers from `src/index.js`.

- [ ] **Step 5: Run tests**

Run: `node --test tests/config/provider-catalog.test.js tests/config/provider-metadata.test.js`

Expected: PASS.

## Task 2: Mentor Selection With Effective Catalog

**Files:**
- Modify: `tests/config/mentor-config.test.js`
- Modify: `src/config/mentor-config.js`

- [ ] **Step 1: Write the failing test**

Add this test:

```js
test('updates mentor model using a custom provider catalog', () => {
  const [mentor] = createDefaultMentors();
  const catalogState = addCustomProvider(createProviderCatalogState(), {
    id: 'x-router',
    name: 'Experimental Router',
    baseUrl: 'https://router.example/v1',
    modelId: 'router-large'
  });

  const updated = updateMentorModel(
    mentor,
    { providerId: 'x-router', modelId: 'router-large' },
    getEffectiveProviders(catalogState)
  );

  assert.equal(updated.providerId, 'x-router');
  assert.equal(updated.modelId, 'router-large');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/config/mentor-config.test.js`

Expected: FAIL because `updateMentorModel` does not accept an effective catalog argument yet.

- [ ] **Step 3: Implement catalog-aware update**

Update `updateMentorModel(mentor, selection, catalog = providers)` to validate against the supplied catalog.

- [ ] **Step 4: Run tests**

Run: `node --test tests/config/mentor-config.test.js`

Expected: PASS.

## Task 3: Drawer View Models

**Files:**
- Modify: `tests/web/configuration-view.test.js`
- Modify: `src/web/configuration-view.js`

- [ ] **Step 1: Write failing tests**

Add tests for `buildSettingsDrawerViewModel` and custom provider/model capability display:

```js
test('builds settings drawer tabs with active tab state', () => {
  const view = buildSettingsDrawerViewModel({ activeTab: 'providers' });

  assert.deepEqual(view.tabs.map((tab) => tab.id), ['mentors', 'providers', 'models', 'prompt']);
  assert.equal(view.tabs.find((tab) => tab.id === 'providers').active, true);
});

test('builds mentor view model from an effective custom provider catalog', () => {
  const catalogState = addCustomProvider(createProviderCatalogState(), {
    id: 'groq-custom',
    name: 'Groq Lab',
    baseUrl: 'https://api.groq.com/openai/v1',
    modelId: 'llama-3.3-70b-versatile'
  });
  const [mentor] = createDefaultMentors();
  const updated = updateMentorModel(
    mentor,
    { providerId: 'groq-custom', modelId: 'llama-3.3-70b-versatile' },
    getEffectiveProviders(catalogState)
  );

  const view = buildMentorConfigurationViewModel(updated, getEffectiveProviders(catalogState));

  assert.equal(view.providerName, 'Groq Lab');
  assert.equal(view.modelName, 'llama-3.3-70b-versatile');
  assert.equal(view.cache.state, 'unknown');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/web/configuration-view.test.js`

Expected: FAIL because drawer view model and catalog argument support do not exist.

- [ ] **Step 3: Implement view models**

Add `buildSettingsDrawerViewModel({ activeTab })`. Update mentor and prompt preview builders to accept `catalog = providers`.

- [ ] **Step 4: Run tests**

Run: `node --test tests/web/configuration-view.test.js`

Expected: PASS.

## Task 4: Static UI Drawer

**Files:**
- Modify: `tests/web/static-configuration-ui.test.js`
- Modify: `public/index.html`
- Modify: `public/app.js`
- Modify: `public/styles.css`

- [ ] **Step 1: Write failing static UI tests**

Assert the page has `#settings-toggle`, `#settings-drawer`, drawer tabs, and no always-visible `configuration-panel` in the chamber.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/web/static-configuration-ui.test.js`

Expected: FAIL because drawer landmarks do not exist.

- [ ] **Step 3: Implement drawer markup and app state**

Move provider settings, mentor editor, and prompt preview rendering into `#settings-drawer`. Add tabs for mentors, providers, models, and prompt. Add custom provider and model forms powered by catalog helper functions.

- [ ] **Step 4: Implement drawer styling**

Style the drawer as a right-side panel with tab buttons, validation messages, responsive full-width mobile layout, and dark-mode compatible surfaces.

- [ ] **Step 5: Run tests**

Run: `node --test tests/web/static-configuration-ui.test.js`

Expected: PASS.

## Task 5: Docs, Version, Verification, Commit

**Files:**
- Modify: `README.md`
- Modify: `VERSION`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `docs/superpowers/specs/2026-05-17-settings-drawer-provider-catalog-design.md`

- [ ] **Step 1: Update docs and version**

Bump version to `0.4.0`. Update README status and planned/current capabilities to mention settings drawer and flexible provider catalog. Add observed verification results to the design doc.

- [ ] **Step 2: Run dependency and test verification**

Run:

```powershell
npm.cmd ci --ignore-scripts
node --test
```

Expected: `npm.cmd ci` reports 0 vulnerabilities and `node --test` passes all tests.

- [ ] **Step 3: Run HTTP smoke check**

Run:

```powershell
npm.cmd run serve
```

Then verify `http://localhost:4173`, `/public/app.js`, and `/src/web/configuration-view.js` return 200.

- [ ] **Step 4: Commit**

Run:

```powershell
git add -A
git commit -m "Add settings drawer provider catalog"
```

Expected: clean commit and `git status --short` empty.

## Self-Review

- Spec coverage: Drawer navigation, built-in xAI/Groq, custom providers/models, secret reference safety, cache metadata, mentor assignment, docs/version/commit are covered.
- Placeholder scan: No TBD/TODO placeholders are present.
- Type consistency: Provider fields use `id`, `name`, `kind`, `apiStyle`, `baseUrl`, `secretLabel`, `models`; model fields use `id`, `displayName`, `providerId`, `source`, `cacheCapability`, `voiceReadiness`, `notes`.
