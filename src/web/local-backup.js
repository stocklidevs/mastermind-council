export const LOCAL_BACKUP_KIND = 'mastermind.local-backup';
export const LOCAL_BACKUP_VERSION = 1;
export const LOCAL_BACKUP_KEYS = [
  'mastermind.userCouncilPresets',
  'mastermind.sessionHistory',
  'mastermind.consultations',
  'mastermind.currentMentors',
  'mastermind.providerCatalog',
  'mastermind.secretReferences',
  'mastermind.ttsSettings',
  'mastermind.theme'
];

const RAW_SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{8,}\b/i,
  /\bAIza[A-Za-z0-9_-]{20,}\b/,
  /\bxai-[A-Za-z0-9_-]{12,}\b/i
];

export function createLocalBackup(storage = globalThis.localStorage) {
  const data = {};
  for (const key of LOCAL_BACKUP_KEYS) {
    const value = storage.getItem(key);
    if (value === null) continue;
    assertSafeStoredValue(key, value);
    data[key] = value;
  }
  return {
    kind: LOCAL_BACKUP_KIND,
    version: LOCAL_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data
  };
}

export function parseLocalBackup(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Backup file must contain valid JSON.');
  }
  return validateLocalBackup(parsed);
}

export function restoreLocalBackup(backup, storage = globalThis.localStorage) {
  const normalized = validateLocalBackup(backup);
  const restoredKeys = [];
  for (const [key, value] of Object.entries(normalized.data)) {
    if (!LOCAL_BACKUP_KEYS.includes(key)) continue;
    storage.setItem(key, value);
    restoredKeys.push(key);
  }
  return { restoredKeys };
}

function validateLocalBackup(backup) {
  if (!backup || typeof backup !== 'object') throw new Error('Backup file is not a Mastermind backup.');
  if (backup.kind !== LOCAL_BACKUP_KIND) throw new Error('Backup file is not a Mastermind backup.');
  if (backup.version !== LOCAL_BACKUP_VERSION) throw new Error('Backup version is not supported.');
  if (!backup.data || typeof backup.data !== 'object' || Array.isArray(backup.data)) {
    throw new Error('Backup data is missing or invalid.');
  }

  const data = {};
  for (const [key, value] of Object.entries(backup.data)) {
    if (!LOCAL_BACKUP_KEYS.includes(key)) continue;
    if (typeof value !== 'string') throw new Error(`Backup value for ${key} must be a string.`);
    assertSafeStoredValue(key, value);
    data[key] = value;
  }
  return { ...backup, data };
}

function assertSafeStoredValue(key, value) {
  if (key !== 'mastermind.secretReferences') return;
  if (RAW_SECRET_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new Error('Local backup cannot include a plaintext API key. Use 1Password or environment references first.');
  }
}
