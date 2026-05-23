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
  const nextExchange = createConsultationExchange(exchange, createdAt);
  const existingExchanges = consultation.exchanges ?? [];
  const exchanges = existingExchanges.some((item) => item.id && item.id === nextExchange.id)
    ? existingExchanges
    : [...existingExchanges, nextExchange];
  return sanitizeRecord({
    ...consultation,
    updatedAt: createdAt,
    exchanges
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

export function buildConsultationFollowUpPrompt(consultation, question, { maxExchanges = 4, maxTranscriptItems = 5 } = {}) {
  const exchanges = Array.isArray(consultation?.exchanges) ? consultation.exchanges.slice(-maxExchanges) : [];
  if (!exchanges.length) return String(question ?? '').trim();

  const prior = exchanges
    .map((exchange, index) => {
      const transcript = (exchange.transcript ?? [])
        .filter((item) => item?.type === 'contribution' && item.utterance)
        .slice(0, maxTranscriptItems)
        .map((item) => `  - ${item.speakerName ?? 'Mentor'}: ${compactText(item.utterance, 700)}`)
        .join('\n');
      const synthesis = exchange.synthesis
        ? [
            `  - Synthesis: ${compactText(exchange.synthesis.mainAnswer, 900)}`,
            ...(exchange.synthesis.nextActions?.length
              ? [`  - Next actions: ${exchange.synthesis.nextActions.map((item) => compactText(item, 180)).join('; ')}`]
              : []),
            ...(exchange.synthesis.unresolvedQuestions?.length
              ? [
                  `  - Unresolved questions: ${exchange.synthesis.unresolvedQuestions
                    .map((item) => compactText(item, 180))
                    .join('; ')}`
                ]
              : [])
          ].join('\n')
        : '  - Synthesis: No synthesis recorded.';
      return [
        `Exchange ${index + 1}:`,
        `  - User question: ${compactText(exchange.question, 500)}`,
        transcript ? `  - Visible mentor contributions:\n${transcript}` : '  - Visible mentor contributions: None recorded.',
        synthesis
      ].join('\n');
    })
    .join('\n\n');

  return [
    'This is a follow-up in an ongoing consultation with the same council.',
    'Use only the public prior context below. Do not invent hidden discussion, private chain-of-thought, or unavailable facts.',
    'Treat the new question as the current task, while preserving useful continuity from earlier exchanges.',
    '',
    prior,
    '',
    `Follow-up question: ${String(question ?? '').trim()}`
  ].join('\n');
}

function createConsultationExchange(
  { id, question = '', transcript = [], synthesis = null, clarificationAnswers = [], createdAt } = {},
  fallbackDate
) {
  return sanitizeRecord({
    id: id || `exchange-${Date.parse(createdAt ?? fallbackDate) || Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    personality: redact(mentor.personality),
    speakingStyle: redact(mentor.speakingStyle),
    participationBehavior: redact(mentor.participationBehavior),
    identity: sanitizeRecord(mentor.identity ?? {}),
    voice: sanitizeRecord(mentor.voice ?? {}),
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

function compactText(value, limit) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 1)).trim()}...`;
}
