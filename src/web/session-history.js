const SECRET_PATTERNS = [/op:\/\/[^\s"]+/g, /\bsk-[A-Za-z0-9_-]{4,}\b/g, /\b[A-Za-z0-9_-]{32,}\b/g];

export function createSessionHistoryRecord({
  question,
  mode,
  mentors = [],
  transcript = [],
  synthesis = null,
  createdAt = new Date().toISOString()
} = {}) {
  return {
    id: `session-${Date.parse(createdAt) || Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question: redact(question),
    mode: redact(mode),
    createdAt,
    mentors: mentors.map((mentor) => ({
      name: redact(mentor.name),
      role: redact(mentor.role)
    })),
    transcript: transcript.map((item) => sanitizeRecord(item)),
    synthesis: synthesis ? sanitizeRecord(synthesis) : null
  };
}

export function saveSessionHistoryRecord(records = [], record, limit = 20) {
  return [sanitizeRecord(record), ...records.filter((item) => item.id !== record.id)].slice(0, limit);
}

export function getRecentSessionHistory(records = [], limit = 10) {
  return [...records]
    .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
    .slice(0, limit)
    .map((record) => sanitizeRecord(record));
}

export function clearSessionHistory() {
  return [];
}

export function createConsultationRecord({
  title,
  mode = 'mock',
  mentors = [],
  sessionSettings = {},
  exchange = {},
  createdAt = new Date().toISOString()
} = {}) {
  const firstQuestion = exchange.question || title || 'Untitled consultation';
  return sanitizeRecord({
    id: `consultation-${Date.parse(createdAt) || Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title || firstQuestion,
    mode,
    createdAt,
    updatedAt: createdAt,
    mentors: mentors.map(publicMentor),
    sessionSettings,
    exchanges: [createConsultationExchange(exchange, createdAt)]
  });
}

export function appendConsultationExchange(consultation, exchange = {}) {
  const createdAt = exchange.createdAt ?? new Date().toISOString();
  return sanitizeRecord({
    ...consultation,
    updatedAt: createdAt,
    exchanges: [...(consultation.exchanges ?? []), createConsultationExchange(exchange, createdAt)]
  });
}

export function getSavedConsultations(records = [], limit = 10) {
  const unique = new Map();
  for (const record of records) {
    if (record?.id) unique.set(record.id, sanitizeRecord(record));
  }
  return [...unique.values()]
    .sort((a, b) => String(b.updatedAt ?? b.createdAt ?? '').localeCompare(String(a.updatedAt ?? a.createdAt ?? '')))
    .slice(0, limit);
}

function createConsultationExchange({ question = '', transcript = [], synthesis = null, clarificationAnswers = [], createdAt } = {}, fallbackDate) {
  return sanitizeRecord({
    question,
    createdAt: createdAt ?? fallbackDate,
    clarificationAnswers,
    transcript,
    synthesis
  });
}

function publicMentor(mentor) {
  return {
    id: redact(mentor.id),
    name: redact(mentor.name),
    role: redact(mentor.role),
    providerId: redact(mentor.providerId),
    modelId: redact(mentor.modelId)
  };
}

function sanitizeRecord(value) {
  if (Array.isArray(value)) return value.map(sanitizeRecord);
  if (!value || typeof value !== 'object') return redact(value);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !/apiKey|secret|credential|resolved/i.test(key))
      .map(([key, item]) => [key, sanitizeRecord(item)])
  );
}

function redact(value) {
  let text = String(value ?? '');
  if (/^(session|consultation)-\d+-[a-z0-9]+$/i.test(text)) return text;
  for (const pattern of SECRET_PATTERNS) {
    text = text.replaceAll(pattern, '[redacted]');
  }
  return text;
}
