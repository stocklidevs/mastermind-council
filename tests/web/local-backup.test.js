import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLocalBackup,
  LOCAL_BACKUP_KIND,
  LOCAL_BACKUP_KEYS,
  parseLocalBackup,
  restoreLocalBackup
} from '../../src/web/local-backup.js';

test('creates a portable backup from known local storage keys', () => {
  const storage = createMemoryStorage({
    'mastermind.consultations': '[{"id":"consultation-1"}]',
    'mastermind.theme': 'dark',
    'unrelated.key': 'ignore me'
  });

  const backup = createLocalBackup(storage);

  assert.equal(backup.kind, LOCAL_BACKUP_KIND);
  assert.equal(backup.version, 1);
  assert.match(backup.exportedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(Object.keys(backup.data).sort(), ['mastermind.consultations', 'mastermind.theme']);
  assert.equal(backup.data['mastermind.consultations'], '[{"id":"consultation-1"}]');
  assert.equal(backup.data['mastermind.theme'], 'dark');
});

test('restores only approved local storage keys', () => {
  const storage = createMemoryStorage();
  const result = restoreLocalBackup(
    {
      kind: LOCAL_BACKUP_KIND,
      version: 1,
      exportedAt: '2026-05-23T00:00:00.000Z',
      data: {
        'mastermind.theme': 'light',
        'mastermind.ttsSettings': '{"enabled":true}',
        'other.key': 'nope'
      }
    },
    storage
  );

  assert.deepEqual(result.restoredKeys.sort(), ['mastermind.theme', 'mastermind.ttsSettings']);
  assert.equal(storage.getItem('mastermind.theme'), 'light');
  assert.equal(storage.getItem('mastermind.ttsSettings'), '{"enabled":true}');
  assert.equal(storage.getItem('other.key'), null);
});

test('rejects backup import when secret references contain a raw API key', () => {
  assert.throws(
    () =>
      restoreLocalBackup(
        {
          kind: LOCAL_BACKUP_KIND,
          version: 1,
          exportedAt: '2026-05-23T00:00:00.000Z',
          data: {
            'mastermind.secretReferences': '{"openai":{"reference":"sk-proj-raw-key-should-not-travel"}}'
          }
        },
        createMemoryStorage()
      ),
    /plaintext API key/i
  );
});

test('parses and validates backup files before restore', () => {
  const backup = parseLocalBackup(
    JSON.stringify({
      kind: LOCAL_BACKUP_KIND,
      version: 1,
      exportedAt: '2026-05-23T00:00:00.000Z',
      data: Object.fromEntries(LOCAL_BACKUP_KEYS.map((key) => [key, '[]']))
    })
  );

  assert.equal(backup.kind, LOCAL_BACKUP_KIND);
  assert.equal(Object.keys(backup.data).length, LOCAL_BACKUP_KEYS.length);
  assert.throws(() => parseLocalBackup('not json'), /valid JSON/i);
});

function createMemoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };
}
