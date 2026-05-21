import { randomUUID } from 'node:crypto';

export function createLiveConfigStore({ ttlMs = 10 * 60 * 1000, now = () => Date.now() } = {}) {
  const records = new Map();
  return {
    save(config) {
      const id = randomUUID();
      records.set(id, {
        config,
        expiresAt: now() + ttlMs
      });
      return id;
    },
    get(id) {
      const record = records.get(id);
      if (!record) return null;
      if (record.expiresAt < now()) {
        records.delete(id);
        return null;
      }
      return record.config;
    }
  };
}
