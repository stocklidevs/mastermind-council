const SECRET_KEYS = new Set(['apikey', 'secret', 'credential', 'token', 'authorization', 'reference']);

export function createRuntimeLogger({ write = console.log } = {}) {
  return {
    info(event, fields = {}) {
      write(JSON.stringify(sanitizeLogRecord({ level: 'info', event, ...fields })));
    },
    warn(event, fields = {}) {
      write(JSON.stringify(sanitizeLogRecord({ level: 'warn', event, ...fields })));
    },
    error(event, fields = {}) {
      write(JSON.stringify(sanitizeLogRecord({ level: 'error', event, ...fields })));
    }
  };
}

export function sanitizeLogRecord(record) {
  return sanitizeValue(record);
}

function sanitizeValue(value, key = '') {
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        SECRET_KEYS.has(entryKey.toLowerCase()) ? '[redacted]' : sanitizeValue(entryValue, entryKey)
      ])
    );
  }
  if (typeof value !== 'string') return value;
  if (SECRET_KEYS.has(key.toLowerCase())) return '[redacted]';
  return value
    .replaceAll(/op:\/\/[^"\s]+(?:\s[^"\s]+)*\/[^"\s]+/g, '[redacted-reference]')
    .replaceAll(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, '[redacted-secret]')
    .replaceAll(/\b(xai-[A-Za-z0-9_-]{8,})\b/g, '[redacted-secret]');
}
