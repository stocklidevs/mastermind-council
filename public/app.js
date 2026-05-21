import {
  addCustomModel,
  addCustomProvider,
  applyCouncilPreset,
  applyUserCouncilPreset,
  createCouncilSession,
  createClarificationResumeEvents,
  createDefaultMentors,
  createProviderCatalogState,
  createUserCouncilPreset,
  deleteUserCouncilPreset,
  getEffectiveProviders,
  getModelsForProvider,
  providers,
  runCouncilSession,
  saveUserCouncilPreset,
  updateMentorCharacteristics,
  updateMentorModel,
  validateCustomProviderDraft
} from '/src/index.js';
import { buildSessionViewModel, validateQuestion } from '/src/web/render.js';
import { getScenario } from '/src/web/scenarios.js';
import {
  buildMentorConfigurationViewModel,
  buildPromptProfilePreview,
  buildCouncilPresetSettingsViewModel,
  buildSecretSettingsViewModel,
  buildSessionHistoryViewModel,
  buildSessionSettingsViewModel,
  buildSettingsDrawerViewModel
} from '/src/web/configuration-view.js';
import {
  appendConsultationExchange,
  clearSessionHistory,
  createConsultationRecord,
  createSessionHistoryRecord,
  getSavedConsultations,
  saveSessionHistoryRecord
} from '/src/web/session-history.js';
import {
  applyLiveCouncilEvent,
  buildClarificationResumeContext,
  createLiveCouncilViewState,
  validateClarificationAnswer
} from '/src/web/live-view.js';

const form = document.querySelector('#question-form');
const input = document.querySelector('#question-input');
const error = document.querySelector('#question-error');
const runtimeMode = document.querySelector('#runtime-mode');
const roster = document.querySelector('#council-roster');
const transcript = document.querySelector('#transcript');
const synthesis = document.querySelector('#synthesis');
const status = document.querySelector('#session-status');
const stickStatus = document.querySelector('#stick-status');
const mobileStickStatus = document.querySelector('#mobile-stick-status');
const synthesisModelLabel = document.querySelector('#synthesis-model-label');
const workspaceTabs = [...document.querySelectorAll('[data-workspace-tab]')];
const workspacePanels = [...document.querySelectorAll('[data-workspace-panel]')];
const themeToggle = document.querySelector('#theme-toggle');
const settingsToggle = document.querySelector('#settings-toggle');
const settingsClose = document.querySelector('#settings-close');
const settingsDrawer = document.querySelector('#settings-drawer');
const drawerTabs = document.querySelector('#drawer-tabs');
const drawerContent = document.querySelector('#drawer-content');

const scenario = getScenario('dissent');
const USER_PRESETS_STORAGE_KEY = 'mastermind.userCouncilPresets';
const SESSION_HISTORY_STORAGE_KEY = 'mastermind.sessionHistory';
const CONSULTATIONS_STORAGE_KEY = 'mastermind.consultations';
const CURRENT_MENTORS_STORAGE_KEY = 'mastermind.currentMentors';
const LEGACY_MODEL_IDS = {
  'anthropic:claude-sonnet-4': 'claude-sonnet-4-20250514'
};
let catalogState = createProviderCatalogState();
let mentors = loadCurrentMentors();
let userPresets = loadUserPresets();
let sessionHistory = loadSessionHistory();
let consultations = loadConsultations();
let activeConsultationId = null;
let lastSessionExchange = null;
let pendingUserQuestion = null;
let selectedMentorId = mentors[0].id;
let activeDrawerTab = 'mentors';
let selectedModelProviderId = 'openai';
let providerDraftErrors = {};
let sessionSettings = buildSessionSettingsViewModel({
  maxTurns: 3,
  preambleEnabled: true,
  synthesisProviderId: 'openai',
  synthesisModelId: 'gpt-4.1'
});
let activePresetId = 'custom';
let liveSource = null;
let liveState = null;
let liveEvents = [];
let transcriptShouldAutoScroll = true;
const LIVE_EVENT_TYPES = [
  'session.started',
  'preamble.started',
  'turn.started',
  'mentor.thinking',
  'mentor.interested',
  'mentor.abstained',
  'stick.granted',
  'mentor.pre_action',
  'mentor.token',
  'mentor.post_action',
  'mentor.question',
  'mentor.done',
  'clarification.answered',
  'preamble.awaiting_clarification',
  'turn.awaiting_clarification',
  'turn.closed',
  'session.awaiting_clarification',
  'session.synthesized',
  'session.error',
  'mentor.error'
];
const secretReferences = Object.fromEntries(
  providers.map((provider) => [
    provider.id,
    {
      providerId: provider.id,
      mode: 'environment',
      reference: provider.secretLabel ?? ''
    }
  ])
);

function effectiveProviders() {
  return getEffectiveProviders(catalogState);
}

function loadUserPresets() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USER_PRESETS_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistUserPresets() {
  localStorage.setItem(USER_PRESETS_STORAGE_KEY, JSON.stringify(userPresets));
}

function loadSessionHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_HISTORY_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSessionHistory() {
  localStorage.setItem(SESSION_HISTORY_STORAGE_KEY, JSON.stringify(sessionHistory));
}

function loadConsultations() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONSULTATIONS_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistConsultations() {
  localStorage.setItem(CONSULTATIONS_STORAGE_KEY, JSON.stringify(consultations));
}

function loadCurrentMentors() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CURRENT_MENTORS_STORAGE_KEY) ?? 'null');
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.map(migrateMentorModelIds) : createDefaultMentors();
  } catch {
    return createDefaultMentors();
  }
}

function migrateMentorModelIds(mentor) {
  const legacyKey = `${mentor.providerId}:${mentor.modelId}`;
  return LEGACY_MODEL_IDS[legacyKey] ? { ...mentor, modelId: LEGACY_MODEL_IDS[legacyKey] } : mentor;
}

function persistMentors() {
  localStorage.setItem(CURRENT_MENTORS_STORAGE_KEY, JSON.stringify(mentors));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderRoster(members, activeSpeakerId) {
  roster.innerHTML = members
    .map((member) => {
      const active = member.id === activeSpeakerId || member.hasStick;
      const providerLabel = member.providerName ? `${member.providerName} / ${member.modelName}` : member.role;
      const state = member.state ? formatMentorState(member.state) : active ? 'Holding stick' : 'Listening';
      return `
        <article class="mentor-row ${active ? 'is-active' : ''} ${member.state ? `state-${escapeHtml(member.state)}` : ''}">
          <div class="voice-dot" aria-hidden="true"></div>
          <div>
            <h3>${escapeHtml(member.name)}</h3>
            <p>${escapeHtml(member.role)} - ${escapeHtml(providerLabel)}</p>
          </div>
          <span class="mentor-state">${member.hasStick ? '<span class="stick-icon" aria-hidden="true"></span>' : ''}${escapeHtml(
            state
          )}</span>
        </article>
      `;
    })
    .join('');
}

function formatMentorState(state) {
  const labels = {
    idle: 'Listening',
    thinking: 'Thinking',
    holding_stick: 'Holding stick',
    speaking: 'Speaking',
    done: 'Done',
    abstained: 'Abstained',
    asking_clarification: 'Questioning',
    error: 'Error'
  };
  return labels[state] ?? state;
}

function renderDrawer() {
  const view = buildSettingsDrawerViewModel({ activeTab: activeDrawerTab });
  drawerTabs.innerHTML = view.tabs
    .map(
      (tab) => `
        <button type="button" data-drawer-tab="${escapeHtml(tab.id)}" class="${
          tab.active ? 'is-active' : ''
        }">${escapeHtml(tab.label)}</button>
      `
    )
    .join('');

  const renderers = {
    mentors: renderMentorEditor,
    providers: renderProviderSettings,
    models: renderModelSettings,
    prompt: renderPromptPreview,
    session: renderSessionSettings
  };
  drawerContent.innerHTML = renderers[activeDrawerTab]();
}

function renderSessionSettings() {
  const view = buildSessionSettingsViewModel(sessionSettings);
  const presetView = buildCouncilPresetSettingsViewModel({ activePresetId, userPresets });
  const historyView = buildSessionHistoryViewModel(sessionHistory);
  const savedConsultations = getSavedConsultations(consultations, 8);
  const catalog = effectiveProviders();
  const synthesisProvider = catalog.find((provider) => provider.id === view.synthesisProviderId) ?? catalog[0];
  const synthesisModels = getModelsForProvider(synthesisProvider.id, catalog);
  const synthesisModelId = synthesisModels.some((model) => model.id === view.synthesisModelId)
    ? view.synthesisModelId
    : synthesisModels[0]?.id ?? view.synthesisModelId;
  sessionSettings = {
    ...view,
    synthesisProviderId: synthesisProvider.id,
    synthesisModelId
  };
  const options = [
    ...presetView.presets,
    ...presetView.userPresets
  ];
  return `
    <section class="drawer-section session-settings">
      <div class="panel-heading">
        <p class="eyebrow">Session</p>
        <h2>Deliberation limits</h2>
      </div>
      <label class="drawer-control">
        <span>Max turns</span>
        <input
          type="number"
          min="${view.minTurns}"
          max="${view.maxAllowedTurns}"
          value="${view.maxTurns}"
          data-session-max-turns
        />
      </label>
      <p class="drawer-note">The council closes with dissent preserved if it reaches this limit.</p>
      <label class="drawer-control toggle-control">
        <span>Preamble clarification</span>
        <input
          type="checkbox"
          ${view.preambleEnabled ? 'checked' : ''}
          data-session-preamble-enabled
        />
      </label>
      <p class="drawer-note">When enabled, mentors may ask clarifying questions before the first turn.</p>
      <div class="synthesis-settings">
        <h3>Synthesis model</h3>
        <label class="drawer-control">
          <span>Provider</span>
          <select data-session-synthesis-provider>
            ${catalog
              .map(
                (provider) =>
                  `<option value="${escapeHtml(provider.id)}" ${
                    provider.id === synthesisProvider.id ? 'selected' : ''
                  }>${escapeHtml(provider.name)}</option>`
              )
              .join('')}
          </select>
        </label>
        <label class="drawer-control">
          <span>Model</span>
          <select data-session-synthesis-model>
            ${synthesisModels
              .map(
                (model) =>
                  `<option value="${escapeHtml(model.id)}" ${model.id === synthesisModelId ? 'selected' : ''}>${escapeHtml(
                    model.displayName
                  )}</option>`
              )
              .join('')}
          </select>
        </label>
        <p class="drawer-note">This model receives the visible transcript and writes the final synthesis.</p>
      </div>
      <div class="preset-settings">
        <h3>Council type</h3>
        <label class="drawer-control">
          <span>Preset</span>
          <select data-council-preset>
            <option value="custom" ${activePresetId === 'custom' ? 'selected' : ''}>Custom current council</option>
            ${options
              .map(
                (preset) =>
                  `<option value="${escapeHtml(preset.id)}" ${preset.active ? 'selected' : ''}>${escapeHtml(
                    preset.name
                  )}</option>`
              )
              .join('')}
          </select>
        </label>
        <form class="drawer-form preset-save-form" data-save-council-preset>
          <h3>Save current council</h3>
          <label>
            <span>Preset name</span>
            <input name="presetName" placeholder="My strategy room" />
          </label>
          <button type="submit">Save council</button>
        </form>
        <div class="preset-list">
          ${options
            .map(
              (preset) => `
                <article class="preset-row ${preset.active ? 'is-active' : ''}">
                  <div>
                    <h4>${escapeHtml(preset.name)}</h4>
                    <p>${escapeHtml(preset.description)}</p>
                  </div>
                  <div class="preset-actions">
                    <span>${preset.mentorCount} mentors</span>
                    ${
                      preset.source === 'user'
                        ? `<button type="button" data-delete-council-preset="${escapeHtml(preset.id)}">Delete</button>`
                        : ''
                    }
                  </div>
                </article>
              `
            )
            .join('')}
        </div>
      </div>
      <div class="session-history">
        <div class="history-heading">
          <h3>Saved consultations</h3>
          <button type="button" data-save-consultation ${lastSessionExchange ? '' : 'disabled'}>Save current</button>
        </div>
        <div class="history-list">
          ${
            savedConsultations.length
              ? savedConsultations
                  .map(
                    (record) => `
                      <article class="history-row ${record.id === activeConsultationId ? 'is-active' : ''}">
                        <h4>${escapeHtml(record.title)}</h4>
                        <p>${escapeHtml(record.mode)} - ${record.exchanges?.length ?? 0} exchanges - ${escapeHtml(record.updatedAt)}</p>
                        <div class="preset-actions">
                          <button type="button" data-open-consultation="${escapeHtml(record.id)}">Open</button>
                          <button type="button" data-delete-consultation="${escapeHtml(record.id)}">Delete</button>
                        </div>
                      </article>
                    `
                  )
                  .join('')
              : '<p class="drawer-note">Saved consultations will appear here.</p>'
          }
        </div>
      </div>
      <div class="session-history">
        <div class="history-heading">
          <h3>Recent sessions</h3>
          <button type="button" data-clear-session-history>Clear</button>
        </div>
        <div class="history-list">
          ${
            historyView.sessions.length
              ? historyView.sessions
                  .map(
                    (record) => `
                      <article class="history-row">
                        <h4>${escapeHtml(record.question)}</h4>
                        <p>${escapeHtml(record.mode)} - ${escapeHtml(record.createdAt)}</p>
                      </article>
                    `
                  )
                  .join('')
              : '<p class="drawer-note">Completed sessions will appear here.</p>'
          }
        </div>
      </div>
    </section>
  `;
}

function renderProviderSettings() {
  return `
    <section class="drawer-section provider-settings">
      <div class="panel-heading">
        <p class="eyebrow">Providers</p>
        <h2>Catalog and keys</h2>
      </div>
      <div class="provider-list">
        ${effectiveProviders().map(renderProviderRow).join('')}
      </div>
      <form class="drawer-form" data-custom-provider-form>
        <h3>Add provider</h3>
        ${renderDraftInput('id', 'Provider id', 'together')}
        ${renderDraftInput('name', 'Name', 'Together AI')}
        ${renderDraftInput('baseUrl', 'Base URL', 'https://api.example.com/v1')}
        ${renderDraftInput('secretLabel', 'Environment label', 'TOGETHER_API_KEY')}
        ${renderDraftInput('modelId', 'First model id', 'model-name')}
        <button type="submit">Add provider</button>
      </form>
    </section>
  `;
}

function renderProviderRow(provider) {
  const reference = ensureSecretReference(provider);
  const view = buildSecretSettingsViewModel(reference);
  return `
    <article class="provider-row">
      <div>
        <h3>${escapeHtml(provider.name)}</h3>
        <p>${escapeHtml(provider.kind)} - ${escapeHtml(provider.apiStyle)}</p>
        ${provider.baseUrl ? `<small>${escapeHtml(provider.baseUrl)}</small>` : ''}
      </div>
      ${
        provider.id === 'local'
          ? '<small class="secret-display">No secret required</small>'
          : `
            <label>
              <span>Secret mode</span>
              <select data-secret-mode="${escapeHtml(provider.id)}">
                <option value="environment" ${reference.mode === 'environment' ? 'selected' : ''}>Environment</option>
                <option value="one-password" ${reference.mode === 'one-password' ? 'selected' : ''}>1Password</option>
              </select>
            </label>
            <label>
              <span>Secret reference</span>
              <input
                data-secret-reference="${escapeHtml(provider.id)}"
                value="${escapeHtml(reference.reference)}"
                placeholder="${escapeHtml(provider.secretLabel ?? 'op://Vault/Item/field')}"
              />
            </label>
            <small class="${view.valid ? 'secret-display' : 'secret-warning'}">${escapeHtml(
              view.warning ?? view.safeDisplay
            )}</small>
          `
      }
    </article>
  `;
}

function renderDraftInput(field, label, placeholder) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input name="${escapeHtml(field)}" placeholder="${escapeHtml(placeholder)}" />
      ${providerDraftErrors[field] ? `<small class="secret-warning">${escapeHtml(providerDraftErrors[field])}</small>` : ''}
    </label>
  `;
}

function renderModelSettings() {
  const catalog = effectiveProviders();
  const provider = catalog.find((item) => item.id === selectedModelProviderId) ?? catalog[0];
  selectedModelProviderId = provider.id;
  return `
    <section class="drawer-section model-settings">
      <div class="panel-heading">
        <p class="eyebrow">Models</p>
        <h2>Provider models</h2>
      </div>
      <label class="drawer-control">
        <span>Provider</span>
        <select data-model-provider>
          ${catalog
            .map(
              (item) =>
                `<option value="${escapeHtml(item.id)}" ${item.id === provider.id ? 'selected' : ''}>${escapeHtml(
                  item.name
                )}</option>`
            )
            .join('')}
        </select>
      </label>
      <div class="model-list">
        ${provider.models
          .map(
            (model) => `
              <article class="model-row">
                <div>
                  <h3>${escapeHtml(model.displayName)}</h3>
                  <p>${escapeHtml(model.id)}</p>
                </div>
                <span class="cache-pill ${escapeHtml(model.cacheCapability.state)}">${escapeHtml(
                  model.cacheCapability.userLabel
                )}</span>
              </article>
            `
          )
          .join('')}
      </div>
      ${
        provider.kind === 'custom'
          ? `
            <form class="drawer-form" data-custom-model-form>
              <h3>Add model</h3>
              <label>
                <span>Model id</span>
                <input name="id" placeholder="llama-3.3-70b-versatile" />
              </label>
              <label>
                <span>Display name</span>
                <input name="displayName" placeholder="Llama 3.3 70B" />
              </label>
              <label>
                <span>Cache capability</span>
                <select name="cacheState">
                  <option value="unknown">Unknown</option>
                  <option value="automatic">Automatic</option>
                  <option value="explicit">Explicit</option>
                  <option value="unsupported">Unsupported</option>
                </select>
              </label>
              <button type="submit">Add model</button>
            </form>
          `
          : '<p class="drawer-note">Built-in preset models are managed by the app metadata.</p>'
      }
    </section>
  `;
}

function renderMentorEditor() {
  const catalog = effectiveProviders();
  const mentor = mentors.find((item) => item.id === selectedMentorId) ?? mentors[0];
  const view = buildMentorConfigurationViewModel(mentor, catalog);
  const models = getModelsForProvider(mentor.providerId, catalog);
  return `
    <section class="drawer-section mentor-editor">
      <div class="panel-heading">
        <p class="eyebrow">Mentors</p>
        <h2>Profiles</h2>
      </div>
      <div class="mentor-tabs">
        ${mentors
          .map(
            (item) => `
              <button type="button" data-select-mentor="${escapeHtml(item.id)}" class="${
                item.id === mentor.id ? 'is-selected' : ''
              }">${escapeHtml(item.name)}</button>
            `
          )
          .join('')}
      </div>
      <div class="mentor-fields">
        ${renderTextInput('name', 'Name', mentor.name)}
        ${renderTextInput('role', 'Role', mentor.role)}
        ${renderTextInput('personality', 'Personality', mentor.personality)}
        ${renderTextInput('speakingStyle', 'Speaking style', mentor.speakingStyle)}
        ${renderTextInput('participationBehavior', 'Participation', mentor.participationBehavior)}
        <div class="identity-fields">
          <h3>Deep identity</h3>
          ${renderIdentityInput('biography', 'Biography', mentor.identity?.biography)}
          ${renderIdentityInput('operatingPrinciples', 'Operating principles', mentor.identity?.operatingPrinciples)}
          ${renderIdentityInput('strengths', 'Strengths', mentor.identity?.strengths)}
          ${renderIdentityInput('blindSpots', 'Blind spots', mentor.identity?.blindSpots)}
          ${renderIdentityInput('debateStyle', 'Debate style', mentor.identity?.debateStyle)}
          ${renderIdentityInput('preferredQuestions', 'Preferred questions', mentor.identity?.preferredQuestions)}
          ${renderIdentityInput('ritualPresence', 'Ritual presence', mentor.identity?.ritualPresence)}
        </div>
        <label>
          <span>Provider</span>
          <select data-mentor-provider>
            ${catalog
              .map(
                (provider) =>
                  `<option value="${escapeHtml(provider.id)}" ${
                    provider.id === mentor.providerId ? 'selected' : ''
                  }>${escapeHtml(provider.name)}</option>`
              )
              .join('')}
          </select>
        </label>
        <label>
          <span>Model</span>
          <select data-mentor-model>
            ${models
              .map(
                (model) =>
                  `<option value="${escapeHtml(model.id)}" ${
                    model.id === mentor.modelId ? 'selected' : ''
                  }>${escapeHtml(model.displayName)}</option>`
              )
              .join('')}
          </select>
        </label>
        <div class="cache-card">
          <span class="cache-pill ${escapeHtml(view.cache.state)}">${escapeHtml(view.cache.label)}</span>
          <p>${escapeHtml(view.cache.verificationPath)}</p>
        </div>
        <div class="voice-note">Voice later: ${escapeHtml(mentor.voice.voiceLabel)} - ${escapeHtml(mentor.voice.tone)}</div>
      </div>
    </section>
  `;
}

function renderTextInput(field, label, value) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input data-mentor-field="${escapeHtml(field)}" value="${escapeHtml(value)}" />
    </label>
  `;
}

function renderIdentityInput(field, label, value) {
  const displayValue = Array.isArray(value) ? value.join('; ') : value ?? '';
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <textarea data-mentor-identity="${escapeHtml(field)}" rows="2">${escapeHtml(displayValue)}</textarea>
    </label>
  `;
}

function renderPromptPreview() {
  const catalog = effectiveProviders();
  const mentor = mentors.find((item) => item.id === selectedMentorId) ?? mentors[0];
  const preview = buildPromptProfilePreview(mentor, catalog);
  return `
    <section class="drawer-section prompt-preview">
      <div class="panel-heading">
        <p class="eyebrow">Prompt</p>
        <h2>Cache plan</h2>
      </div>
      <div class="preview-columns">
        <section>
          <h3>Stable</h3>
          ${preview.stableSections
            .map(
              (section) => `
                <p><strong>${escapeHtml(section.label)}</strong><br />${escapeHtml(section.value)}</p>
              `
            )
            .join('')}
        </section>
        <section>
          <h3>Dynamic</h3>
          <ul>
            ${preview.dynamicSections.map((section) => `<li>${escapeHtml(section)}</li>`).join('')}
          </ul>
        </section>
      </div>
    </section>
  `;
}

function renderConfiguration() {
  renderRoster(mentors.map((mentor) => buildMentorConfigurationViewModel(mentor, effectiveProviders())));
  renderSynthesisModelLabel();
  renderDrawer();
}

function renderSynthesisModelLabel() {
  const catalog = effectiveProviders();
  const provider = catalog.find((item) => item.id === sessionSettings.synthesisProviderId);
  const model = getModelsForProvider(sessionSettings.synthesisProviderId, catalog).find(
    (item) => item.id === sessionSettings.synthesisModelId
  );
  const providerLabel = provider?.displayName ?? provider?.name ?? sessionSettings.synthesisProviderId;
  const modelLabel = model?.displayName ?? sessionSettings.synthesisModelId;
  synthesisModelLabel.textContent = `Synthesis by ${providerLabel} / ${modelLabel}`;
}

function activateWorkspacePanel(panelId) {
  workspaceTabs.forEach((tab) => {
    const isActive = tab.dataset.workspaceTab === panelId;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  workspacePanels.forEach((panel) => {
    panel.classList.toggle('is-active-panel', panel.dataset.workspacePanel === panelId);
  });
}

function scrollTranscriptIfNeeded() {
  if (!transcriptShouldAutoScroll) return;
  transcript.scrollTop = transcript.scrollHeight;
}

function updateSelectedMentor(updater) {
  const catalog = effectiveProviders();
  mentors = mentors.map((mentor) => (mentor.id === selectedMentorId ? updater(mentor, catalog) : mentor));
  activePresetId = 'custom';
  persistMentors();
  renderConfiguration();
}

function ensureSecretReference(provider) {
  if (!secretReferences[provider.id]) {
    secretReferences[provider.id] = {
      providerId: provider.id,
      mode: 'environment',
      reference: provider.secretLabel ?? ''
    };
  }
  return secretReferences[provider.id];
}

function councilMembersForSession() {
  return mentors.map((mentor) => {
    const scenarioMember = scenario.members.find((member) => member.id === mentor.id);
    return {
      ...scenarioMember,
      id: mentor.id,
      name: mentor.name,
      role: mentor.role,
      style: mentor.speakingStyle,
      behavior: scenarioMember?.behavior ?? {
        stance: 'configured',
        utterances: [`As ${mentor.role}, I would inspect the question through ${mentor.personality}.`]
      }
    };
  });
}

function publicMentorsForLiveRequest() {
  return mentors.map((mentor) => ({
    id: mentor.id,
    name: mentor.name,
    role: mentor.role,
    providerId: mentor.providerId,
    modelId: mentor.modelId,
    personality: mentor.personality,
    speakingStyle: mentor.speakingStyle,
    participationBehavior: mentor.participationBehavior,
    personaMode: mentor.personaMode,
    identity: mentor.identity,
    voice: mentor.voice
  }));
}

function renderTranscript(viewModel) {
  transcript.classList.remove('empty-state');
  transcript.innerHTML = viewModel.rounds
    .map(
      (round) => `
        <section class="round">
          <header>Round ${round.number}</header>
          <div class="round-items">
            ${round.items.map(renderTranscriptItem).join('')}
          </div>
        </section>
      `
    )
    .join('');
}

function renderTranscriptItem(item) {
  if (item.type === 'abstention') {
    return `
      <article class="event-item abstention">
        <div class="event-meta">${escapeHtml(item.speakerName)} abstained</div>
        <p>${escapeHtml(item.reason)}</p>
      </article>
    `;
  }

  if (item.type === 'invalid') {
    return `
      <article class="event-item invalid">
        <div class="event-meta">Protocol guardrail</div>
        <p>${escapeHtml(item.speakerName)}: ${escapeHtml(item.reason)}</p>
      </article>
    `;
  }

  return `
    <article class="event-item contribution">
      <div class="event-meta">
        <span>${escapeHtml(item.stickLabel)}</span>
        <span>${escapeHtml(item.speakerRole)}</span>
      </div>
      <h3>${escapeHtml(item.speakerName)}</h3>
      ${item.preAction ? `<p class="action-note">${escapeHtml(item.preAction)}</p>` : ''}
      ${item.action ? `<p class="action-note">${escapeHtml(item.action)}</p>` : ''}
      <p>${escapeHtml(item.utterance)}</p>
      ${item.postAction ? `<p class="action-note after">${escapeHtml(item.postAction)}</p>` : ''}
    </article>
  `;
}

function renderLiveTranscript(state) {
  transcript.classList.remove('empty-state');
  transcript.innerHTML = state.rounds.length
    ? state.rounds
        .map(
          (round) => `
            <section class="round">
              <header>Turn ${round.number}</header>
              <div class="round-items">
                ${round.items.map(renderTranscriptItem).join('')}
              </div>
            </section>
          `
        )
        .join('')
    : '<section class="round"><header>Opening</header><div class="round-items"></div></section>';
  scrollTranscriptIfNeeded();
}

function renderLiveSynthesis(state) {
  synthesis.classList.remove('empty-state');
  if (state.status === 'awaiting_clarification') {
    synthesis.innerHTML = `
      <section class="clarification-panel">
        <h3>Clarification requested</h3>
        <ul>
          ${state.clarificationQuestions
            .map((question) => `<li><strong>${escapeHtml(question.mentorName)}</strong>: ${escapeHtml(question.question)}</li>`)
            .join('')}
        </ul>
        <form data-clarification-form class="clarification-form">
          <label for="clarification-answer">Answer the council</label>
          <textarea
            id="clarification-answer"
            name="answer"
            rows="4"
            placeholder="Respond to the council's questions in one answer."
          ></textarea>
          <button type="submit">Return answer</button>
          <p class="form-error" data-clarification-error role="status"></p>
        </form>
      </section>
    `;
    return;
  }

  if (!state.synthesis) {
    synthesis.innerHTML = '<p>The council is still listening for the shape of the answer.</p>';
    return;
  }

  synthesis.innerHTML = `
    <div class="agreement provisional">
      <span>${escapeHtml(state.synthesis.agreementState)}</span>
      <small>Closed by ${escapeHtml(state.synthesis.closureReason)}</small>
    </div>
    <section>
      <h3>Main answer</h3>
      <p>${escapeHtml(state.synthesis.mainAnswer)}</p>
    </section>
    ${renderListSection('Next actions', state.synthesis.nextActions)}
    ${renderListSection('Minority view', state.synthesis.minorityViews)}
    ${renderListSection('Assumptions', state.synthesis.assumptions)}
    ${renderGroundingSection(state.synthesis.mentorGrounding)}
    ${renderListSection('Unresolved questions', state.synthesis.unresolvedQuestions)}
    ${renderListSection('Verification guidance', state.synthesis.verificationGuidance)}
  `;
}

function renderLiveState(state) {
  renderRoster(state.mentors, state.stick.ownerMentorId);
  renderLiveTranscript(state);
  renderLiveSynthesis(state);
  stickStatus.textContent = state.stick.label;
  mobileStickStatus.textContent = state.stick.label;
}

async function applyLiveEvents(events, { delayMs = 18 } = {}) {
  for (const event of events) {
    liveEvents.push(event);
    liveState = applyLiveCouncilEvent(liveState, event);
    renderLiveState(liveState);
    if (event.type === 'mentor.token') {
      status.textContent = `${event.payload.mentorName} is speaking`;
    }
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

function renderSynthesis(model) {
  synthesis.classList.remove('empty-state');
  synthesis.innerHTML = `
    <div class="agreement ${model.tone}">
      <span>${escapeHtml(model.agreementState)}</span>
      <small>Closed by ${escapeHtml(model.closureReason)}</small>
    </div>
    <section>
      <h3>Main answer</h3>
      <p>${escapeHtml(model.mainAnswer)}</p>
    </section>
    ${renderListSection('Next actions', model.nextActions)}
    ${renderListSection('Minority view', model.minorityViews)}
    ${renderListSection('Assumptions', model.assumptions)}
    ${renderGroundingSection(model.mentorGrounding)}
    ${renderListSection('Unresolved questions', model.unresolvedQuestions)}
    ${renderListSection('Verification guidance', model.verificationGuidance)}
  `;
}

function renderListSection(title, items) {
  if (!items?.length) return '';
  return `
    <section>
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderGroundingSection(items) {
  if (!items?.length) return '';
  return `
    <section>
      <h3>Mentor grounding</h3>
      <ul>
        ${items
          .map((item) => `<li><strong>${escapeHtml(item.mentorName)}</strong>: ${escapeHtml(item.point)}</li>`)
          .join('')}
      </ul>
    </section>
  `;
}

async function runRealSession(question) {
  status.textContent = 'Calling real council';
  const response = await fetch('/api/council/real', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? 'real-council-failed');
  }
  const model = buildSessionViewModel(payload.session);
  const firstContribution = model.rounds
    .flatMap((round) => round.items)
    .find((item) => item.type === 'contribution');

  renderRoster(model.members, firstContribution?.speakerId);
  renderTranscript(model);
  renderSynthesis(model.synthesis);
  saveSessionHistoryFromViewModel(model, 'real');
  status.textContent = 'Real session complete';
  const stickLabel = firstContribution?.stickLabel ?? 'Speaking stick rests on the table.';
  stickStatus.textContent = stickLabel;
  mobileStickStatus.textContent = stickLabel;
}

function runLiveMockSession(question) {
  if (liveSource) {
    liveSource.close();
  }

  status.textContent = 'Council awakening';
  error.textContent = '';
  liveState = createLiveCouncilViewState(mentors, { originalQuestion: question });
  liveEvents = [];
  renderLiveState(liveState);

  const liveMode = runtimeMode.value === 'live-real' ? 'real' : 'mock';
  const liveMembers = encodeURIComponent(JSON.stringify(publicMentorsForLiveRequest()));
  const url = `/api/council/live?mode=${liveMode}&maxTurns=${sessionSettings.maxTurns}&preambleEnabled=${
    sessionSettings.preambleEnabled ? '1' : '0'
  }&synthesisProviderId=${encodeURIComponent(sessionSettings.synthesisProviderId)}&synthesisModelId=${encodeURIComponent(
    sessionSettings.synthesisModelId
  )}&members=${liveMembers}&question=${encodeURIComponent(
    question
  )}`;
  liveSource = new EventSource(url);
  attachLiveSourceHandlers(liveSource);
}

function attachLiveSourceHandlers(source, { onComplete, onAwaitingClarification, onError } = {}) {
  for (const type of LIVE_EVENT_TYPES) {
    source.addEventListener(type, (message) => {
      const event = JSON.parse(message.data);
      liveEvents.push(event);
      liveState = applyLiveCouncilEvent(liveState, event);
      renderLiveState(liveState);

      if (event.type === 'session.synthesized') {
        status.textContent = 'Live session complete';
        saveSessionHistoryFromLiveState(liveState, runtimeMode.value);
        source.close();
        liveSource = null;
        onComplete?.(event);
      } else if (event.type === 'turn.awaiting_clarification' || event.type === 'preamble.awaiting_clarification') {
        status.textContent = 'Awaiting clarification';
        source.close();
        liveSource = null;
        onAwaitingClarification?.(event);
      } else if (event.type === 'mentor.token') {
        status.textContent = `${event.payload.mentorName} is speaking`;
      } else if (event.type === 'mentor.thinking') {
        status.textContent = `${event.payload.mentorName} is thinking`;
      } else if (event.type === 'session.error') {
        status.textContent = 'Live session failed';
        error.textContent = event.payload?.reason ?? 'The live council stream failed.';
        source.close();
        liveSource = null;
        onError?.(new Error(error.textContent));
      }
    });
  }

  source.onerror = () => {
    if (!liveSource) return;
    status.textContent = 'Live session interrupted';
    error.textContent = 'The live council stream was interrupted.';
    source.close();
    liveSource = null;
    onError?.(new Error(error.textContent));
  };
}

function runLiveRealClarificationResume(context) {
  if (liveSource) {
    liveSource.close();
    liveSource = null;
  }

  return new Promise((resolve, reject) => {
    const liveMembers = encodeURIComponent(JSON.stringify(publicMentorsForLiveRequest()));
    const url = `/api/council/live?mode=real&maxTurns=${sessionSettings.maxTurns}&preambleEnabled=0&synthesisProviderId=${encodeURIComponent(
      sessionSettings.synthesisProviderId
    )}&synthesisModelId=${encodeURIComponent(sessionSettings.synthesisModelId)}&members=${liveMembers}&clarificationAnswer=${encodeURIComponent(
      context.clarificationAnswer
    )}&question=${encodeURIComponent(context.originalQuestion)}`;
    liveSource = new EventSource(url);
    attachLiveSourceHandlers(liveSource, {
      onComplete: resolve,
      onAwaitingClarification: resolve,
      onError: reject
    });
  });
}

function runMockSession(question) {
  status.textContent = 'Convening';
  const session = runCouncilSession(
    createCouncilSession({
      question,
      members: councilMembersForSession()
    })
  );
  const model = buildSessionViewModel(session);
  const firstContribution = model.rounds
    .flatMap((round) => round.items)
    .find((item) => item.type === 'contribution');

  renderRoster(model.members, firstContribution?.speakerId);
  renderTranscript(model);
  renderSynthesis(model.synthesis);
  saveSessionHistoryFromViewModel(model, 'mock');
  status.textContent = 'Session complete';
  const stickLabel = firstContribution?.stickLabel ?? 'Speaking stick rests on the table.';
  stickStatus.textContent = stickLabel;
  mobileStickStatus.textContent = stickLabel;
}

function saveSessionHistoryFromViewModel(model, mode) {
  const visibleQuestion = pendingUserQuestion ?? model.question;
  lastSessionExchange = {
    question: visibleQuestion,
    transcript: model.rounds.flatMap((round) => round.items),
    synthesis: model.synthesis
  };
  const record = createSessionHistoryRecord({
    question: visibleQuestion,
    mode,
    mentors,
    transcript: model.rounds.flatMap((round) => round.items),
    synthesis: model.synthesis
  });
  sessionHistory = saveSessionHistoryRecord(sessionHistory, record);
  persistSessionHistory();
  saveOrAppendActiveConsultation(mode, lastSessionExchange);
}

function saveSessionHistoryFromLiveState(state, mode) {
  const visibleQuestion = pendingUserQuestion ?? state.originalQuestion;
  lastSessionExchange = {
    question: visibleQuestion,
    transcript: state.rounds.flatMap((round) => round.items),
    synthesis: state.synthesis
  };
  const record = createSessionHistoryRecord({
    question: visibleQuestion,
    mode,
    mentors,
    transcript: state.rounds.flatMap((round) => round.items),
    synthesis: state.synthesis
  });
  sessionHistory = saveSessionHistoryRecord(sessionHistory, record);
  persistSessionHistory();
  saveOrAppendActiveConsultation(mode, lastSessionExchange);
}

function saveOrAppendActiveConsultation(mode, exchange) {
  if (!activeConsultationId) return;
  consultations = consultations.map((record) =>
    record.id === activeConsultationId
      ? appendConsultationExchange(
          {
            ...record,
            mentors,
            sessionSettings,
            mode
          },
          exchange
        )
      : record
  );
  persistConsultations();
  renderDrawer();
}

function saveCurrentConsultation() {
  if (!lastSessionExchange) return;
  if (activeConsultationId) {
    saveOrAppendActiveConsultation(runtimeMode.value, lastSessionExchange);
    return;
  }
  const record = createConsultationRecord({
    title: lastSessionExchange.question,
    mode: runtimeMode.value,
    mentors,
    sessionSettings,
    exchange: lastSessionExchange
  });
  consultations = getSavedConsultations([record, ...consultations], 20);
  activeConsultationId = record.id;
  persistConsultations();
  renderDrawer();
}

function openConsultation(id) {
  const record = consultations.find((item) => item.id === id);
  if (!record) return;
  activeConsultationId = record.id;
  mentors = record.mentors?.length ? record.mentors.map(migrateMentorModelIds) : mentors;
  selectedMentorId = mentors[0]?.id ?? selectedMentorId;
  sessionSettings = buildSessionSettingsViewModel(record.sessionSettings ?? sessionSettings);
  runtimeMode.value = record.mode ?? runtimeMode.value;
  const lastExchange = record.exchanges?.at(-1);
  lastSessionExchange = lastExchange
    ? {
        question: lastExchange.question,
        transcript: lastExchange.transcript ?? [],
        synthesis: lastExchange.synthesis
      }
    : null;
  input.value = '';
  input.placeholder = `Follow up on: ${record.title}`;
  status.textContent = `Consultation loaded: ${record.title}`;
  persistMentors();
  renderConfiguration();
}

function deleteConsultation(id) {
  consultations = consultations.filter((item) => item.id !== id);
  if (activeConsultationId === id) activeConsultationId = null;
  persistConsultations();
  renderDrawer();
}

function buildFollowUpQuestion(question) {
  const consultation = consultations.find((item) => item.id === activeConsultationId);
  if (!consultation?.exchanges?.length) return question;
  const prior = consultation.exchanges
    .map(
      (exchange, index) =>
        `Exchange ${index + 1}: User asked "${exchange.question}". Latest synthesis: ${
          exchange.synthesis?.mainAnswer ?? 'No synthesis recorded.'
        }`
    )
    .join('\n');
  return `This is a follow-up in an ongoing consultation. Use only this public prior context:\n${prior}\n\nFollow-up question: ${question}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const validation = validateQuestion(input.value);
  if (!validation.valid) {
    error.textContent = validation.error;
    return;
  }

  error.textContent = '';
  try {
    pendingUserQuestion = validation.question;
    const questionForCouncil = buildFollowUpQuestion(validation.question);
    if (runtimeMode.value === 'real') {
      await runRealSession(questionForCouncil);
    } else if (runtimeMode.value === 'live-mock' || runtimeMode.value === 'live-real') {
      runLiveMockSession(questionForCouncil);
    } else {
      runMockSession(questionForCouncil);
    }
  } catch (runError) {
    status.textContent = 'Session failed';
    error.textContent = runError.message;
  } finally {
    pendingUserQuestion = null;
  }
});

synthesis.addEventListener('submit', async (event) => {
  if (event.target.dataset.clarificationForm === undefined) return;
  event.preventDefault();
  const formData = new FormData(event.target);
  const answer = formData.get('answer');
  const validation = validateClarificationAnswer(answer);
  const clarificationError = event.target.querySelector('[data-clarification-error]');

  if (!validation.valid) {
    clarificationError.textContent = 'Please answer the council before it resumes.';
    return;
  }

  try {
    const context = buildClarificationResumeContext(liveState, validation.answer);
    status.textContent = 'Council resumes';
    if (runtimeMode.value === 'live-real') {
      await runLiveRealClarificationResume(context);
    } else {
      const events = createClarificationResumeEvents({
        sessionId: liveEvents[0]?.sessionId ?? 'live-session-resume',
        originalQuestion: context.originalQuestion,
        members: councilMembersForSession(),
        priorEvents: liveEvents,
        clarificationQuestions: context.clarificationQuestions,
        answer: context.clarificationAnswer,
        nextTurnNumber: context.nextTurnNumber
      });
      await applyLiveEvents(events);
      status.textContent = 'Live session complete';
      if (liveState.status === 'synthesized') saveSessionHistoryFromLiveState(liveState, runtimeMode.value);
    }
  } catch (resumeError) {
    clarificationError.textContent = resumeError.message;
  }
});

themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  themeToggle.textContent = next === 'dark' ? 'Light' : 'Dark';
});

settingsToggle.addEventListener('click', () => {
  settingsDrawer.hidden = false;
  settingsDrawer.classList.add('is-open');
});

settingsClose.addEventListener('click', () => {
  settingsDrawer.classList.remove('is-open');
  settingsDrawer.hidden = true;
});

drawerTabs.addEventListener('click', (event) => {
  const tab = event.target.dataset.drawerTab;
  if (!tab) return;
  activeDrawerTab = tab;
  renderDrawer();
});

workspaceTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activateWorkspacePanel(tab.dataset.workspaceTab);
  });
});

transcript.addEventListener('scroll', () => {
  const distanceFromBottom = transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight;
  transcriptShouldAutoScroll = distanceFromBottom < 80;
});

drawerContent.addEventListener('input', (event) => {
  if (event.target.dataset.sessionMaxTurns !== undefined) {
    sessionSettings = buildSessionSettingsViewModel({
      ...sessionSettings,
      maxTurns: event.target.value
    });
    event.target.value = sessionSettings.maxTurns;
    return;
  }

  if (event.target.dataset.sessionPreambleEnabled !== undefined) {
    sessionSettings = buildSessionSettingsViewModel({
      ...sessionSettings,
      preambleEnabled: event.target.checked
    });
    return;
  }

  if (event.target.dataset.sessionSynthesisProvider !== undefined) {
    const catalog = effectiveProviders();
    const providerId = event.target.value;
    const firstModel = getModelsForProvider(providerId, catalog)[0]?.id ?? '';
    sessionSettings = buildSessionSettingsViewModel({
      ...sessionSettings,
      synthesisProviderId: providerId,
      synthesisModelId: firstModel
    });
    renderSynthesisModelLabel();
    renderDrawer();
    return;
  }

  if (event.target.dataset.sessionSynthesisModel !== undefined) {
    sessionSettings = buildSessionSettingsViewModel({
      ...sessionSettings,
      synthesisModelId: event.target.value
    });
    renderSynthesisModelLabel();
    return;
  }

  if (event.target.dataset.councilPreset !== undefined) {
    activePresetId = event.target.value;
    if (activePresetId.startsWith('user-')) {
      mentors = applyUserCouncilPreset(userPresets, activePresetId);
      selectedMentorId = mentors[0].id;
    } else if (activePresetId !== 'custom') {
      mentors = applyCouncilPreset(activePresetId);
      selectedMentorId = mentors[0].id;
    }
    persistMentors();
    renderConfiguration();
    return;
  }

  const providerId = event.target.dataset.secretReference;
  if (providerId) {
    secretReferences[providerId] = {
      ...secretReferences[providerId],
      reference: event.target.value
    };
    renderDrawer();
    return;
  }

  const field = event.target.dataset.mentorField;
  if (field) {
    updateSelectedMentor((mentor) => updateMentorCharacteristics(mentor, { [field]: event.target.value }));
    return;
  }

  const identityField = event.target.dataset.mentorIdentity;
  if (!identityField) return;
  updateSelectedMentor((mentor) =>
    updateMentorCharacteristics(mentor, {
      identity: {
        [identityField]: parseIdentityValue(identityField, event.target.value)
      }
    })
  );
});

function parseIdentityValue(field, value) {
  const listFields = ['operatingPrinciples', 'strengths', 'blindSpots', 'preferredQuestions'];
  if (!listFields.includes(field)) return value;
  return String(value)
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
}

drawerContent.addEventListener('change', (event) => {
  const secretProviderId = event.target.dataset.secretMode;
  if (secretProviderId) {
    secretReferences[secretProviderId] = {
      ...secretReferences[secretProviderId],
      mode: event.target.value
    };
    renderDrawer();
    return;
  }

  if (event.target.dataset.modelProvider !== undefined) {
    selectedModelProviderId = event.target.value;
    renderDrawer();
    return;
  }

  if (event.target.dataset.mentorProvider !== undefined) {
    updateSelectedMentor((mentor, catalog) => {
      const providerId = event.target.value;
      const [model] = getModelsForProvider(providerId, catalog);
      return updateMentorModel(mentor, { providerId, modelId: model.id }, catalog);
    });
  }

  if (event.target.dataset.mentorModel !== undefined) {
    updateSelectedMentor((mentor, catalog) =>
      updateMentorModel(mentor, { providerId: mentor.providerId, modelId: event.target.value }, catalog)
    );
  }
});

drawerContent.addEventListener('click', (event) => {
  if (event.target.dataset.clearSessionHistory !== undefined) {
    sessionHistory = clearSessionHistory();
    persistSessionHistory();
    renderDrawer();
    return;
  }

  const openConsultationId = event.target.dataset.openConsultation;
  if (openConsultationId) {
    openConsultation(openConsultationId);
    return;
  }

  const deleteConsultationId = event.target.dataset.deleteConsultation;
  if (deleteConsultationId) {
    deleteConsultation(deleteConsultationId);
    return;
  }

  if (event.target.dataset.saveConsultation !== undefined) {
    saveCurrentConsultation();
    return;
  }

  const presetId = event.target.dataset.deleteCouncilPreset;
  if (presetId) {
    userPresets = deleteUserCouncilPreset(userPresets, presetId);
    persistUserPresets();
    if (activePresetId === presetId) activePresetId = 'custom';
    renderConfiguration();
    return;
  }

  const mentorId = event.target.dataset.selectMentor;
  if (!mentorId) return;
  selectedMentorId = mentorId;
  renderDrawer();
});

drawerContent.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());

  if (event.target.dataset.saveCouncilPreset !== undefined) {
    const preset = createUserCouncilPreset({ name: data.presetName, mentors });
    userPresets = saveUserCouncilPreset(userPresets, preset);
    persistUserPresets();
    activePresetId = preset.id;
    persistMentors();
    renderConfiguration();
    return;
  }

  if (event.target.dataset.customProviderForm !== undefined) {
    const validation = validateCustomProviderDraft(catalogState, data);
    providerDraftErrors = validation.errors;
    if (validation.valid) {
      catalogState = addCustomProvider(catalogState, data);
      selectedModelProviderId = data.id.toLowerCase();
      providerDraftErrors = {};
    }
    renderConfiguration();
    return;
  }

  if (event.target.dataset.customModelForm !== undefined) {
    catalogState = addCustomModel(catalogState, selectedModelProviderId, data);
    renderConfiguration();
  }
});

activateWorkspacePanel('deliberation');
renderConfiguration();
