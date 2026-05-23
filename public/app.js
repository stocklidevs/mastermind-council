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
import { buildConsultationPdfHtml, buildCurrentConsultationExport } from '/src/web/pdf-export.js';
import { createLocalBackup, parseLocalBackup, restoreLocalBackup } from '/src/web/local-backup.js';
import {
  applyLocalSecretDefaults,
  buildOnePasswordReferenceFromDefaults,
  normalizeLocalSecretDefaults
} from '/src/config/local-secret-defaults.js';
import { createSpeechChunks, createStreamingSpeechBuffer } from '/src/web/tts-playback.js';

const form = document.querySelector('#question-form');
const input = document.querySelector('#question-input');
const error = document.querySelector('#question-error');
const runtimeMode = { value: 'live-real' };
const roster = document.querySelector('#council-roster');
const transcript = document.querySelector('#transcript');
const synthesis = document.querySelector('#synthesis');
const status = document.querySelector('#session-status');
const voiceResume = document.querySelector('#voice-resume');
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
const PROVIDER_CATALOG_STORAGE_KEY = 'mastermind.providerCatalog';
const SECRET_REFERENCES_STORAGE_KEY = 'mastermind.secretReferences';
const TTS_SETTINGS_STORAGE_KEY = 'mastermind.ttsSettings';
const THEME_STORAGE_KEY = 'mastermind.theme';
const ONE_PASSWORD_ACCOUNT = '';
const OPENAI_TTS_VOICES = [
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'fable',
  'nova',
  'onyx',
  'sage',
  'shimmer',
  'verse',
  'marin',
  'cedar'
];
const LEGACY_MODEL_IDS = {
  'anthropic:claude-sonnet-4': 'claude-sonnet-4-20250514'
};
let catalogState = loadProviderCatalogState();
let mentors = loadCurrentMentors();
let ttsSettings = loadTtsSettings();
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
let speechQueue = [];
let speechIsPlaying = false;
let activeAudio = null;
let activeSpeechMentorId = null;
let activeSpeechTurnNumber = null;
let activeSpeechText = '';
let blockedSpeechPlayback = null;
let streamingSpeechBuffers = new Map();
let localSecretDefaults = null;
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
let secretReferences = loadSecretReferences();

function setSessionStatus(label, { initiating = false } = {}) {
  status.textContent = label;
  status.classList.toggle('is-initiating', initiating);
}

function logTtsClient(event, fields = {}) {
  console.info('[mastermind:tts]', event, fields);
}

function setVoiceResumeVisible(visible) {
  voiceResume.hidden = !visible;
}

function loadThemePreference() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : 'light';
  } catch {
    return 'light';
  }
}

function applyThemePreference(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

function persistThemePreference(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function effectiveProviders() {
  return getEffectiveProviders(catalogState);
}

function loadProviderCatalogState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROVIDER_CATALOG_STORAGE_KEY) ?? 'null');
    return createProviderCatalogState({
      customProviders: Array.isArray(parsed?.customProviders) ? parsed.customProviders : []
    });
  } catch {
    return createProviderCatalogState();
  }
}

function persistProviderCatalogState() {
  localStorage.setItem(PROVIDER_CATALOG_STORAGE_KEY, JSON.stringify(catalogState));
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

function defaultSecretReferences() {
  return Object.fromEntries(
    effectiveProviders().map((provider) => [
      provider.id,
      {
        providerId: provider.id,
        mode: 'environment',
        reference: provider.secretLabel ?? '',
        account: ''
      }
    ])
  );
}

function loadSecretReferences() {
  const defaults = defaultSecretReferences();
  try {
    const parsed = JSON.parse(localStorage.getItem(SECRET_REFERENCES_STORAGE_KEY) ?? '{}');
    if (!parsed || typeof parsed !== 'object') return defaults;
    return Object.fromEntries(
      Object.entries(defaults).map(([providerId, fallback]) => {
        const saved = parsed[providerId];
        return [
          providerId,
          {
            providerId,
            mode: saved?.mode === 'one-password' ? 'one-password' : 'environment',
            reference: String(saved?.reference ?? fallback.reference),
            account: String(saved?.account ?? fallback.account ?? '')
          }
        ];
      })
    );
  } catch {
    return defaults;
  }
}

function persistSecretReferences() {
  localStorage.setItem(SECRET_REFERENCES_STORAGE_KEY, JSON.stringify(secretReferences));
}

async function hydrateLocalSecretDefaults() {
  try {
    const response = await fetch('/public/local-secret-defaults.json', { cache: 'no-store' });
    if (!response.ok) return;
    localSecretDefaults = normalizeLocalSecretDefaults(await response.json());
    if (!localSecretDefaults) return;
    secretReferences = applyLocalSecretDefaults(secretReferences, effectiveProviders(), localSecretDefaults);
    persistSecretReferences();
    renderConfiguration();
  } catch {
    localSecretDefaults = null;
  }
}

function loadTtsSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TTS_SETTINGS_STORAGE_KEY) ?? 'null');
    return {
      enabled: parsed?.enabled !== false,
      model: parsed?.model || 'gpt-4o-mini-tts',
      voice: OPENAI_TTS_VOICES.includes(parsed?.voice) ? parsed.voice : 'marin',
      speed: Number.isFinite(Number(parsed?.speed)) ? Number(parsed.speed) : 1
    };
  } catch {
    return { enabled: true, model: 'gpt-4o-mini-tts', voice: 'marin', speed: 1 };
  }
}

function persistTtsSettings() {
  localStorage.setItem(TTS_SETTINGS_STORAGE_KEY, JSON.stringify(ttsSettings));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderRichText(value) {
  const lines = String(value ?? '').replaceAll('\r\n', '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    if (!lines[index].trim()) {
      index += 1;
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      const tableLines = [lines[index], lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }
      blocks.push(renderMarkdownTable(tableLines));
      continue;
    }

    const listMatch = parseListLine(lines[index]);
    if (listMatch) {
      const ordered = listMatch.ordered;
      const items = [];
      while (index < lines.length) {
        const item = parseListLine(lines[index]);
        if (!item || item.ordered !== ordered) break;
        items.push(item.text);
        index += 1;
      }
      const tag = ordered ? 'ol' : 'ul';
      blocks.push(`<${tag}>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !parseListLine(lines[index]) &&
      !isMarkdownTableStart(lines, index)
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
  }

  return `<div class="rich-text">${blocks.join('')}</div>`;
}

function renderInlineMarkdown(value) {
  const codeSnippets = [];
  let text = escapeHtml(value).replace(/`([^`]+)`/g, (_match, code) => {
    const marker = `@@CODE${codeSnippets.length}@@`;
    codeSnippets.push(`<code>${code}</code>`);
    return marker;
  });
  text = text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return codeSnippets.reduce((output, snippet, index) => output.replace(`@@CODE${index}@@`, snippet), text);
}

function parseListLine(line) {
  const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
  if (unordered) return { ordered: false, text: unordered[1] };
  const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
  if (ordered) return { ordered: true, text: ordered[1] };
  return null;
}

function isMarkdownTableStart(lines, index) {
  return Boolean(
    lines[index]?.includes('|') &&
      lines[index + 1] &&
      /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1])
  );
}

function renderMarkdownTable(lines) {
  const headers = splitMarkdownTableRow(lines[0]);
  const rows = lines.slice(2).map(splitMarkdownTableRow).filter((row) => row.length);
  return `
    <div class="rich-table-wrap">
      <table>
        <thead><tr>${headers.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows
            .map((row) => `<tr>${headers.map((_header, index) => `<td>${renderInlineMarkdown(row[index] ?? '')}</td>`).join('')}</tr>`)
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function splitMarkdownTableRow(line) {
  return String(line ?? '')
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function renderRoster(members, activeSpeakerId) {
  roster.innerHTML = members
    .map((member) => {
      const active = member.id === activeSpeakerId || member.hasStick;
      const providerLabel = member.providerName ? `${member.providerName} / ${member.modelName}` : member.role;
      const state = member.state ? formatMentorState(member.state) : active ? 'Holding stick' : 'Listening';
      const detail = member.error ? ` - ${member.error}` : '';
      return `
        <article class="mentor-row ${active ? 'is-active' : ''} ${
          member.state ? `state-${escapeHtml(member.state)}` : ''
        }" data-mentor-id="${escapeHtml(member.id)}">
          <div class="voice-dot" aria-hidden="true"></div>
          <div>
            <h3>${escapeHtml(member.name)}</h3>
            <p>${escapeHtml(member.role)} - ${escapeHtml(providerLabel)}${escapeHtml(detail)}</p>
          </div>
          <span class="mentor-state">${
            member.hasStick ? '<span class="stick-icon" aria-hidden="true"></span>' : ''
          }${renderSpeakerIndicator(member)}${escapeHtml(state)}</span>
        </article>
      `;
    })
    .join('');
}

function renderSpeakerIndicator(member) {
  const voiceEnabled = isMentorVoiceEnabled(member.id);
  const playing = voiceEnabled && activeSpeechMentorId === member.id;
  const label = voiceEnabled
    ? playing
      ? `${member.name} voice playing`
      : `${member.name} voice enabled`
    : `${member.name} voice muted`;
  return `
    <span class="speaker-indicator ${voiceEnabled ? '' : 'is-muted'} ${playing ? 'is-playing' : ''}" aria-label="${escapeHtml(
      label
    )}" title="${escapeHtml(label)}">
      <span class="speaker-body" aria-hidden="true"></span>
      <span class="speaker-wave wave-one" aria-hidden="true"></span>
      <span class="speaker-wave wave-two" aria-hidden="true"></span>
      <span class="speaker-mute" aria-hidden="true"></span>
    </span>
  `;
}

function isMentorVoiceEnabled(mentorId) {
  const mentor = mentors.find((item) => item.id === mentorId);
  return ttsSettings.enabled && mentor?.voice?.ttsEnabled !== false;
}

function updateRosterVoiceIndicators() {
  roster.querySelectorAll('.mentor-row').forEach((row) => {
    const mentorId = row.dataset.mentorId;
    const indicator = row.querySelector('.speaker-indicator');
    if (!indicator || !mentorId) return;
    const voiceEnabled = isMentorVoiceEnabled(mentorId);
    const playing = voiceEnabled && activeSpeechMentorId === mentorId;
    indicator.classList.toggle('is-muted', !voiceEnabled);
    indicator.classList.toggle('is-playing', playing);
  });
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
      <div class="tts-settings">
        <h3>Voice playback</h3>
        <label class="drawer-control toggle-control">
          <span>OpenAI TTS</span>
          <input
            type="checkbox"
            ${ttsSettings.enabled ? 'checked' : ''}
            data-session-tts-enabled
          />
        </label>
        <label class="drawer-control">
          <span>Default voice</span>
          <select data-session-tts-voice>
            ${OPENAI_TTS_VOICES.map(
              (voice) => `<option value="${escapeHtml(voice)}" ${voice === ttsSettings.voice ? 'selected' : ''}>${escapeHtml(voice)}</option>`
            ).join('')}
          </select>
        </label>
        <label class="drawer-control">
          <span>Speed</span>
          <input
            type="number"
            min="0.25"
            max="4"
            step="0.05"
            value="${escapeHtml(ttsSettings.speed)}"
            data-session-tts-speed
          />
        </label>
        <button type="button" data-stop-tts>Stop voice</button>
        <p class="drawer-note voice-status">OpenAI voices are AI-generated. Audio is requested only when voice playback is enabled.</p>
      </div>
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
          <div class="history-actions">
            <button type="button" data-save-consultation ${lastSessionExchange ? '' : 'disabled'}>Save current</button>
            <button type="button" data-export-current-consultation ${lastSessionExchange ? '' : 'disabled'}>Export PDF</button>
          </div>
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
                          <button type="button" data-export-consultation="${escapeHtml(record.id)}">Export PDF</button>
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
      <div class="session-history local-backup">
        <div class="history-heading">
          <h3>Local backup</h3>
          <div class="history-actions">
            <button type="button" data-export-local-backup>Export JSON</button>
            <button type="button" data-import-local-backup>Import JSON</button>
          </div>
        </div>
        <input type="file" accept="application/json,.json" data-local-backup-file hidden />
        <p class="drawer-note">Backs up saved consultations, presets, mentors, custom providers, voice settings, theme, and secret references. Resolved API keys are never included.</p>
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
        <form class="drawer-form secret-preset-form" data-apply-mastermind-secret-preset>
          <h3>1Password defaults</h3>
          <label>
            <span>Vault</span>
            <input name="vaultName" value="${escapeHtml(localSecretDefaults?.vaultName ?? 'Your Vault')}" />
          </label>
          <label>
            <span>Account</span>
            <input name="accountName" placeholder="your-team.1password.com" value="${escapeHtml(
              localSecretDefaults?.accountName ?? ONE_PASSWORD_ACCOUNT
            )}" />
          </label>
          <button type="submit">Apply Mastermind key names</button>
          <p class="drawer-note">Sets every non-local provider to 1Password using local defaults when present, otherwise public-safe generic key names.</p>
        </form>
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
        <div class="voice-note">
          Voice: ${escapeHtml(mentor.voice.voiceLabel)} - ${escapeHtml(mentor.voice.tone)}
        </div>
        <label>
          <span>OpenAI voice</span>
          <select data-mentor-voice="openAiVoice">
            ${OPENAI_TTS_VOICES.map(
              (voice) =>
                `<option value="${escapeHtml(voice)}" ${
                  voice === (mentor.voice?.openAiVoice ?? ttsSettings.voice) ? 'selected' : ''
                }>${escapeHtml(voice)}</option>`
            ).join('')}
          </select>
        </label>
        <label class="drawer-control toggle-control">
          <span>Use voice for this mentor</span>
          <input type="checkbox" ${mentor.voice?.ttsEnabled === false ? '' : 'checked'} data-mentor-voice-toggle />
        </label>
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

  const voiceActive = isTranscriptItemSpeaking(item);
  return `
    <article class="event-item contribution ${voiceActive ? 'is-voice-active' : ''}">
      <div class="event-meta">
        <span>${escapeHtml(item.stickLabel)}</span>
        <span>${escapeHtml(item.speakerRole)}</span>
      </div>
      <h3>${escapeHtml(item.speakerName)}</h3>
      ${item.preAction ? `<p class="action-note">${escapeHtml(item.preAction)}</p>` : ''}
      ${item.action ? `<p class="action-note">${escapeHtml(item.action)}</p>` : ''}
      ${item.utterance ? renderRichText(item.utterance) : ''}
      ${voiceActive ? `<p class="voice-reading">${escapeHtml(activeSpeechText)}</p>` : ''}
      ${item.postAction ? `<p class="action-note after">${escapeHtml(item.postAction)}</p>` : ''}
    </article>
  `;
}

function isTranscriptItemSpeaking(item) {
  const itemSpeakerId = item.speakerId ?? item.mentorId;
  const itemTurnNumber = item.turnNumber ?? item.roundNumber ?? null;
  return Boolean(
    activeSpeechMentorId &&
      activeSpeechText &&
      itemSpeakerId === activeSpeechMentorId &&
      (activeSpeechTurnNumber === null || itemTurnNumber === null || itemTurnNumber === activeSpeechTurnNumber)
  );
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

function buildMastermindOnePasswordReference(provider, vaultName) {
  return buildOnePasswordReferenceFromDefaults(provider, {
    ...localSecretDefaults,
    vaultName: String(vaultName ?? localSecretDefaults?.vaultName ?? 'Your Vault').trim() || 'Your Vault'
  });
}

function queueMentorSpeech(event) {
  if (event.type === 'mentor.token') {
    const segments = streamingSpeechBufferForEvent(event).append(event.payload?.token ?? '');
    queueSpeechSegments({
      mentorId: event.mentorId,
      turnNumber: event.turnNumber,
      segments,
      mentorName: event.payload?.mentorName,
      mentorRole: event.payload?.mentorRole,
      streaming: true
    });
    return;
  }

  if (event.type !== 'mentor.done') return;
  const flushed = flushStreamingSpeechBuffer(event);
  if (flushed.hadBuffer) {
    queueSpeechSegments({
      mentorId: event.mentorId,
      turnNumber: event.turnNumber,
      segments: flushed.segments,
      mentorName: event.payload?.mentorName,
      streaming: true
    });
    return;
  }

  const contribution = findLatestContribution(event.mentorId, event.turnNumber);
  queueSpeechContribution({
    mentorId: event.mentorId,
    turnNumber: event.turnNumber,
    input: contribution?.utterance,
    mentorName: event.payload?.mentorName ?? contribution?.speakerName,
    mentorRole: contribution?.speakerRole
  });
}

function queueTranscriptSpeech(model) {
  const contributions = model.rounds
    .flatMap((round) => round.items)
    .filter((item) => item.type === 'contribution');
  for (const contribution of contributions) {
    queueSpeechContribution({
      mentorId: contribution.speakerId,
      turnNumber: contribution.turnNumber,
      input: contribution.utterance,
      mentorName: contribution.speakerName,
      mentorRole: contribution.speakerRole
    });
  }
}

function queueSpeechContribution({ mentorId, turnNumber = null, input, mentorName, mentorRole }) {
  queueSpeechSegments({
    mentorId,
    turnNumber,
    segments: createSpeechChunks(String(input ?? '').trim()),
    mentorName,
    mentorRole
  });
}

function queueSpeechSegments({ mentorId, turnNumber = null, segments, mentorName, mentorRole, streaming = false }) {
  if (!ttsSettings.enabled) {
    setSessionStatus('Voice playback is off');
    return;
  }
  const mentor = mentors.find((item) => item.id === mentorId);
  if (mentor?.voice?.ttsEnabled === false) return;
  const chunks = segments.map((segment) => String(segment ?? '').trim()).filter(Boolean);
  if (!chunks.length) return;
  logTtsClient('queued', {
    mentorId,
    chunks: chunks.length,
    streaming,
    inputLength: chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  });
  speechQueue.push(
    ...chunks.map((chunk, index) => ({
      mentorId,
      turnNumber,
      input: chunk,
      mentorName: mentor?.name ?? mentorName ?? 'Mentor',
      mentorRole: mentor?.role ?? mentorRole ?? 'Council mentor',
      mentorVoice: mentor?.voice ?? {},
      voice: mentor?.voice?.openAiVoice ?? ttsSettings.voice,
      model: ttsSettings.model,
      speed: ttsSettings.speed,
      partNumber: index + 1,
      partCount: streaming ? null : chunks.length,
      streaming
    }))
  );
  for (const item of speechQueue) {
    item.audioPromise ??= prepareSpeechAudio(item);
  }
  void playNextSpeech();
}

function streamingSpeechBufferForEvent(event) {
  const key = speechBufferKey(event);
  if (!streamingSpeechBuffers.has(key)) {
    streamingSpeechBuffers.set(key, createStreamingSpeechBuffer());
  }
  return streamingSpeechBuffers.get(key);
}

function flushStreamingSpeechBuffer(event) {
  const key = speechBufferKey(event);
  const buffer = streamingSpeechBuffers.get(key);
  if (!buffer) return { hadBuffer: false, segments: [] };
  streamingSpeechBuffers.delete(key);
  return { hadBuffer: true, segments: buffer.flush() };
}

function speechBufferKey(event) {
  return `${event.sessionId ?? 'session'}:${event.turnNumber ?? 'turn'}:${event.mentorId ?? 'mentor'}`;
}

function findLatestContribution(mentorId, turnNumber) {
  const round = liveState?.rounds?.find((item) => item.number === turnNumber) ?? liveState?.rounds?.at(-1);
  return round?.items
    ?.filter((item) => item.type === 'contribution' && (item.speakerId ?? item.mentorId) === mentorId)
    .at(-1);
}

async function playNextSpeech() {
  if (speechIsPlaying || blockedSpeechPlayback || speechQueue.length === 0) return;
  speechIsPlaying = true;
  const item = speechQueue.shift();
  let audioUrl = '';
  let blockedCurrentPlayback = false;
  try {
    const partLabel = item.partCount > 1 ? ` (${item.partNumber}/${item.partCount})` : '';
    setSessionStatus(`Generating voice for ${item.mentorName}${partLabel}`);
    setVoiceResumeVisible(false);
    const audioResult = await (item.audioPromise ?? prepareSpeechAudio(item));
    if (!audioResult.ok) throw new Error(audioResult.error);
    audioUrl = URL.createObjectURL(audioResult.blob);
    activeAudio = new Audio(audioUrl);
    activeSpeechMentorId = item.mentorId;
    activeSpeechTurnNumber = item.turnNumber ?? null;
    activeSpeechText = item.input;
    refreshSpeechPlaybackUi();
    setSessionStatus(`${item.mentorName} voice playing${partLabel}`);
    await playActiveAudio(activeAudio);
    logTtsClient('played', {
      mentorId: item.mentorId,
      partNumber: item.partNumber,
      partCount: item.partCount
    });
  } catch (voiceError) {
    if (isPlaybackBlocked(voiceError) && activeAudio && audioUrl) {
      blockedCurrentPlayback = true;
      blockedSpeechPlayback = { item, audio: activeAudio, audioUrl };
      setVoiceResumeVisible(true);
      setSessionStatus('Voice ready - click Enable voice');
      logTtsClient('playback_blocked', {
        mentorId: item.mentorId,
        reason: voiceError.name || voiceError.message
      });
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setSessionStatus(`Voice unavailable: ${voiceError.message}`);
    logTtsClient('error', {
      mentorId: item.mentorId,
      reason: voiceError.message
    });
  } finally {
    if (!blockedCurrentPlayback) {
      activeAudio = null;
      activeSpeechMentorId = null;
      activeSpeechTurnNumber = null;
      activeSpeechText = '';
      refreshSpeechPlaybackUi();
    }
    speechIsPlaying = false;
    if (!blockedSpeechPlayback && speechQueue.length > 0) {
      void playNextSpeech();
    }
  }
}

async function prepareSpeechAudio(item) {
  try {
    logTtsClient('request', {
      mentorId: item.mentorId,
      partNumber: item.partNumber,
      partCount: item.partCount,
      streaming: item.streaming,
      inputLength: item.input.length,
      voice: item.voice,
      model: item.model
    });
    const response = await fetch('/api/tts/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: item.input,
        voice: item.voice,
        model: item.model,
        speed: item.speed,
        mentorName: item.mentorName,
        mentorRole: item.mentorRole,
        mentorVoice: item.mentorVoice,
        secret: publicOpenAiSecretReference()
      })
    });
    if (!response.ok) {
      throw new Error((await safeJsonError(response)) ?? 'voice-request-failed');
    }
    const blob = await response.blob();
    logTtsClient('response', {
      mentorId: item.mentorId,
      partNumber: item.partNumber,
      partCount: item.partCount,
      streaming: item.streaming,
      bytes: blob.size,
      contentType: blob.type
    });
    return { ok: true, blob };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function refreshSpeechPlaybackUi() {
  updateRosterVoiceIndicators();
  if (liveState) {
    renderLiveTranscript(liveState);
  }
}

async function playActiveAudio(audio) {
  await audio.play();
  await new Promise((resolve) => {
    audio.addEventListener('ended', resolve, { once: true });
    audio.addEventListener('error', resolve, { once: true });
  });
}

function isPlaybackBlocked(error) {
  return error?.name === 'NotAllowedError' || /notallowed|user.*interact|gesture|autoplay/i.test(error?.message ?? '');
}

async function resumeBlockedSpeechPlayback() {
  const blocked = blockedSpeechPlayback;
  if (!blocked) {
    setVoiceResumeVisible(false);
    void playNextSpeech();
    return;
  }

  blockedSpeechPlayback = null;
  setVoiceResumeVisible(false);
  speechIsPlaying = true;
  activeAudio = blocked.audio;
  activeSpeechMentorId = blocked.item.mentorId;
  activeSpeechTurnNumber = blocked.item.turnNumber ?? null;
  activeSpeechText = blocked.item.input;
  refreshSpeechPlaybackUi();
  try {
    const partLabel = blocked.item.partCount > 1 ? ` (${blocked.item.partNumber}/${blocked.item.partCount})` : '';
    setSessionStatus(`${blocked.item.mentorName} voice playing${partLabel}`);
    logTtsClient('resume_click', {
      mentorId: blocked.item.mentorId,
      partNumber: blocked.item.partNumber,
      partCount: blocked.item.partCount
    });
    await playActiveAudio(blocked.audio);
    URL.revokeObjectURL(blocked.audioUrl);
    logTtsClient('played_after_resume', {
      mentorId: blocked.item.mentorId,
      partNumber: blocked.item.partNumber,
      partCount: blocked.item.partCount
    });
  } catch (voiceError) {
    URL.revokeObjectURL(blocked.audioUrl);
    setSessionStatus(`Voice unavailable: ${voiceError.message}`);
    logTtsClient('resume_error', {
      mentorId: blocked.item.mentorId,
      reason: voiceError.message
    });
  } finally {
    activeAudio = null;
    activeSpeechMentorId = null;
    activeSpeechTurnNumber = null;
    activeSpeechText = '';
    refreshSpeechPlaybackUi();
    speechIsPlaying = false;
    if (speechQueue.length > 0) {
      void playNextSpeech();
    }
  }
}

function stopTtsPlayback() {
  speechQueue = [];
  streamingSpeechBuffers.clear();
  if (blockedSpeechPlayback) {
    URL.revokeObjectURL(blockedSpeechPlayback.audioUrl);
    blockedSpeechPlayback = null;
  }
  setVoiceResumeVisible(false);
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  speechIsPlaying = false;
  activeSpeechMentorId = null;
  activeSpeechTurnNumber = null;
  activeSpeechText = '';
  refreshSpeechPlaybackUi();
  setSessionStatus('Voice stopped');
}

function publicOpenAiSecretReference() {
  const reference = secretReferences.openai ?? {
    providerId: 'openai',
    mode: 'environment',
    reference: 'OPENAI_API_KEY'
  };
  return {
    mode: reference.mode,
    reference: reference.reference || 'OPENAI_API_KEY',
    account: reference.account || ''
  };
}

async function safeJsonError(response) {
  try {
    const payload = await response.json();
    return payload.error;
  } catch {
    return null;
  }
}

async function applyLiveEvents(events, { delayMs = 18 } = {}) {
  for (const event of events) {
    liveEvents.push(event);
    liveState = applyLiveCouncilEvent(liveState, event);
    renderLiveState(liveState);
    queueMentorSpeech(event);
    if (event.type === 'mentor.token') {
      setSessionStatus(`${event.payload.mentorName} is speaking`);
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
  setSessionStatus('Calling real council', { initiating: true });
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
  setSessionStatus('Real session complete');
  queueTranscriptSpeech(model);
  const stickLabel = firstContribution?.stickLabel ?? 'Speaking stick rests on the table.';
  stickStatus.textContent = stickLabel;
  mobileStickStatus.textContent = stickLabel;
}

async function runLiveMockSession(question) {
  if (liveSource) {
    liveSource.close();
  }

  setSessionStatus('Council awakening', { initiating: true });
  error.textContent = '';
  liveState = createLiveCouncilViewState(mentors, { originalQuestion: question });
  liveEvents = [];
  renderLiveState(liveState);

  const liveMode = runtimeMode.value === 'live-real' ? 'real' : 'mock';
  const configId = liveMode === 'real' ? await createLiveConfigId() : '';
  const liveMembers = encodeURIComponent(JSON.stringify(publicMentorsForLiveRequest()));
  const url = `/api/council/live?mode=${liveMode}&maxTurns=${sessionSettings.maxTurns}&preambleEnabled=${
    sessionSettings.preambleEnabled ? '1' : '0'
  }&synthesisProviderId=${encodeURIComponent(sessionSettings.synthesisProviderId)}&synthesisModelId=${encodeURIComponent(
    sessionSettings.synthesisModelId
  )}${configId ? `&configId=${encodeURIComponent(configId)}` : ''}&members=${liveMembers}&question=${encodeURIComponent(
    question
  )}`;
  liveSource = new EventSource(url);
  attachLiveSourceHandlers(liveSource);
}

async function createLiveConfigId() {
  const response = await fetch('/api/council/live-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secretReferences })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? 'live-config-failed');
  }
  return payload.configId;
}

function attachLiveSourceHandlers(source, { onComplete, onAwaitingClarification, onError } = {}) {
  for (const type of LIVE_EVENT_TYPES) {
    source.addEventListener(type, (message) => {
      const event = JSON.parse(message.data);
      liveEvents.push(event);
      liveState = applyLiveCouncilEvent(liveState, event);
      renderLiveState(liveState);
      queueMentorSpeech(event);
      status.classList.remove('is-initiating');

      if (event.type === 'session.synthesized') {
        setSessionStatus('Live session complete');
        saveSessionHistoryFromLiveState(liveState, runtimeMode.value);
        source.close();
        liveSource = null;
        onComplete?.(event);
      } else if (event.type === 'turn.awaiting_clarification' || event.type === 'preamble.awaiting_clarification') {
        setSessionStatus('Awaiting clarification');
        source.close();
        liveSource = null;
        onAwaitingClarification?.(event);
      } else if (event.type === 'mentor.token') {
        setSessionStatus(`${event.payload.mentorName} is speaking`);
      } else if (event.type === 'mentor.thinking') {
        setSessionStatus(`${event.payload.mentorName} is thinking`);
      } else if (event.type === 'session.error') {
        setSessionStatus('Live session failed');
        error.textContent = event.payload?.reason ?? 'The live council stream failed.';
        source.close();
        liveSource = null;
        onError?.(new Error(error.textContent));
      }
    });
  }

  source.onerror = () => {
    if (!liveSource) return;
    setSessionStatus('Live session interrupted');
    error.textContent = 'The live council stream was interrupted.';
    source.close();
    liveSource = null;
    onError?.(new Error(error.textContent));
  };
}

async function runLiveRealClarificationResume(context) {
  if (liveSource) {
    liveSource.close();
    liveSource = null;
  }

  const configId = await createLiveConfigId();
  return new Promise((resolve, reject) => {
    const liveMembers = encodeURIComponent(JSON.stringify(publicMentorsForLiveRequest()));
    const url = `/api/council/live?mode=real&maxTurns=${sessionSettings.maxTurns}&preambleEnabled=0&synthesisProviderId=${encodeURIComponent(
      sessionSettings.synthesisProviderId
    )}&synthesisModelId=${encodeURIComponent(sessionSettings.synthesisModelId)}&configId=${encodeURIComponent(
      configId
    )}&members=${liveMembers}&clarificationAnswer=${encodeURIComponent(
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
  setSessionStatus('Convening', { initiating: true });
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
  setSessionStatus('Session complete');
  queueTranscriptSpeech(model);
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
  setSessionStatus(`Consultation loaded: ${record.title}`);
  persistMentors();
  renderConfiguration();
}

function deleteConsultation(id) {
  consultations = consultations.filter((item) => item.id !== id);
  if (activeConsultationId === id) activeConsultationId = null;
  persistConsultations();
  renderDrawer();
}

function exportConsultationPdf(record) {
  const exportWindow = window.open('', '_blank');
  if (!exportWindow) {
    error.textContent = 'The browser blocked the PDF export window.';
    return;
  }
  exportWindow.document.open();
  exportWindow.document.write(buildConsultationPdfHtml(record));
  exportWindow.document.close();
  exportWindow.focus();
  exportWindow.setTimeout(() => exportWindow.print(), 150);
}

function exportCurrentConsultationPdf() {
  if (!lastSessionExchange) return;
  exportConsultationPdf(
    buildCurrentConsultationExport({
      mode: runtimeMode.value,
      mentors,
      sessionSettings,
      exchange: lastSessionExchange
    })
  );
}

function exportLocalBackup() {
  try {
    const backup = createLocalBackup(localStorage);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `mastermind-local-backup-${date}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setSessionStatus('Local backup exported');
  } catch (backupError) {
    setSessionStatus('Local backup blocked');
    error.textContent = backupError.message;
  }
}

async function importLocalBackup(file) {
  if (!file) return;
  try {
    const backup = parseLocalBackup(await file.text());
    const result = restoreLocalBackup(backup, localStorage);
    reloadLocalStateFromStorage();
    setSessionStatus(`Local backup imported (${result.restoredKeys.length} sections)`);
    error.textContent = '';
  } catch (backupError) {
    setSessionStatus('Local backup failed');
    error.textContent = backupError.message;
  }
}

function reloadLocalStateFromStorage() {
  catalogState = loadProviderCatalogState();
  mentors = loadCurrentMentors();
  ttsSettings = loadTtsSettings();
  userPresets = loadUserPresets();
  sessionHistory = loadSessionHistory();
  consultations = loadConsultations();
  secretReferences = loadSecretReferences();
  selectedMentorId = mentors.some((mentor) => mentor.id === selectedMentorId) ? selectedMentorId : mentors[0]?.id;
  applyThemePreference(loadThemePreference());
  renderConfiguration();
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
    await runLiveMockSession(questionForCouncil);
  } catch (runError) {
    setSessionStatus('Session failed');
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
    setSessionStatus('Council resumes', { initiating: true });
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
      setSessionStatus('Live session complete');
      if (liveState.status === 'synthesized') saveSessionHistoryFromLiveState(liveState, runtimeMode.value);
    }
  } catch (resumeError) {
    clarificationError.textContent = resumeError.message;
  }
});

themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyThemePreference(next);
  persistThemePreference(next);
});

voiceResume.addEventListener('click', () => {
  void resumeBlockedSpeechPlayback();
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

  if (event.target.dataset.sessionTtsEnabled !== undefined) {
    ttsSettings = {
      ...ttsSettings,
      enabled: event.target.checked
    };
    persistTtsSettings();
    renderConfiguration();
    return;
  }

  if (event.target.dataset.sessionTtsSpeed !== undefined) {
    ttsSettings = {
      ...ttsSettings,
      speed: Math.min(4, Math.max(0.25, Number(event.target.value) || 1))
    };
    event.target.value = ttsSettings.speed;
    persistTtsSettings();
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
      reference: event.target.value,
      account: secretReferences[providerId]?.account ?? ''
    };
    persistSecretReferences();
    renderDrawer();
    return;
  }

  const field = event.target.dataset.mentorField;
  if (field) {
    updateSelectedMentor((mentor) => updateMentorCharacteristics(mentor, { [field]: event.target.value }));
    return;
  }

  const voiceField = event.target.dataset.mentorVoice;
  if (voiceField) {
    updateSelectedMentor((mentor) =>
      updateMentorCharacteristics(mentor, {
        voice: {
          [voiceField]: event.target.value
        }
      })
    );
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
  if (event.target.dataset.localBackupFile !== undefined) {
    void importLocalBackup(event.target.files?.[0]);
    event.target.value = '';
    return;
  }

  const secretProviderId = event.target.dataset.secretMode;
  if (secretProviderId) {
    secretReferences[secretProviderId] = {
      ...secretReferences[secretProviderId],
      mode: event.target.value,
      account: event.target.value === 'one-password' ? secretReferences[secretProviderId]?.account || ONE_PASSWORD_ACCOUNT : ''
    };
    persistSecretReferences();
    renderDrawer();
    return;
  }

  if (event.target.dataset.modelProvider !== undefined) {
    selectedModelProviderId = event.target.value;
    renderDrawer();
    return;
  }

  if (event.target.dataset.sessionTtsVoice !== undefined) {
    ttsSettings = {
      ...ttsSettings,
      voice: event.target.value
    };
    persistTtsSettings();
    return;
  }

  const voiceField = event.target.dataset.mentorVoice;
  if (voiceField) {
    updateSelectedMentor((mentor) =>
      updateMentorCharacteristics(mentor, {
        voice: {
          [voiceField]: event.target.value
        }
      })
    );
    return;
  }

  if (event.target.dataset.mentorVoiceToggle !== undefined) {
    updateSelectedMentor((mentor) =>
      updateMentorCharacteristics(mentor, {
        voice: {
          ttsEnabled: event.target.checked
        }
      })
    );
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
  if (event.target.dataset.exportLocalBackup !== undefined) {
    exportLocalBackup();
    return;
  }

  if (event.target.dataset.importLocalBackup !== undefined) {
    drawerContent.querySelector('[data-local-backup-file]')?.click();
    return;
  }

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

  if (event.target.dataset.stopTts !== undefined) {
    stopTtsPlayback();
    return;
  }

  if (event.target.dataset.exportCurrentConsultation !== undefined) {
    exportCurrentConsultationPdf();
    return;
  }

  const exportConsultationId = event.target.dataset.exportConsultation;
  if (exportConsultationId) {
    const record = consultations.find((item) => item.id === exportConsultationId);
    if (record) exportConsultationPdf(record);
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

  if (event.target.dataset.applyMastermindSecretPreset !== undefined) {
    const vaultName = data.vaultName;
    const defaults = normalizeLocalSecretDefaults({
      ...localSecretDefaults,
      vaultName,
      accountName: data.accountName || localSecretDefaults?.accountName || ONE_PASSWORD_ACCOUNT
    });
    for (const provider of effectiveProviders()) {
      if (provider.id === 'local' || !provider.secretLabel) continue;
      secretReferences[provider.id] = {
        providerId: provider.id,
        mode: 'one-password',
        reference: buildOnePasswordReferenceFromDefaults(provider, defaults),
        account: defaults?.accountName || ONE_PASSWORD_ACCOUNT
      };
    }
    persistSecretReferences();
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
      persistProviderCatalogState();
    }
    renderConfiguration();
    return;
  }

  if (event.target.dataset.customModelForm !== undefined) {
    catalogState = addCustomModel(catalogState, selectedModelProviderId, data);
    persistProviderCatalogState();
    renderConfiguration();
  }
});

applyThemePreference(loadThemePreference());
activateWorkspacePanel('deliberation');
renderConfiguration();
void hydrateLocalSecretDefaults();
