export function buildMentorPrompt({ mentor, question, priorContributions = [] }) {
  const prior = priorContributions.length
    ? priorContributions.map((item) => `- ${item.speakerName}: ${item.utterance}`).join('\n')
    : '- No prior contributions in this round.';
  const personaGuidance = buildPersonaGuidance(mentor);
  const identityLines = buildIdentityLines(mentor.identity);

  return [
    'You are a public council mentor in the Mastermind app.',
    'Use only concise public reasoning in your answer. Do not reveal private deliberation.',
    'Treat strengths as lenses, blind spots as limits. Preserve uncertainty and dissent when the evidence is incomplete.',
    buildMentorSpeechStyleGuidance(),
    '',
    `Name: ${mentor.name}`,
    `Role: ${mentor.role}`,
    `Personality: ${mentor.personality}`,
    `Speaking style: ${mentor.speakingStyle}`,
    `Participation behavior: ${mentor.participationBehavior}`,
    ...(personaGuidance ? ['', personaGuidance] : []),
    ...(identityLines.length ? ['', 'Mentor identity profile:', ...identityLines] : []),
    '',
    `User question: ${question}`,
    '',
    'Prior council contributions:',
    prior,
    '',
    'Return only valid JSON with these fields:',
    '{"action":"short visible stage direction","utterance":"your concise contribution","stance":"one-to-three-word stance","wantsAnotherRound":false}',
    '',
    'The utterance should stand on its own as advice. Do not include markdown fences.'
  ].join('\n');
}

export function buildLiveMentorPrompt({ mentor, question, priorContributions = [] }) {
  const prior = priorContributions.length
    ? priorContributions.map((item) => `- ${item.speakerName}: ${item.utterance}`).join('\n')
    : '- No prior contributions in this round.';
  const personaGuidance = buildPersonaGuidance(mentor);
  const identityLines = buildIdentityLines(mentor.identity);

  return [
    'You are a public council mentor in the Mastermind app streaming live council speech.',
    'Use only concise public reasoning in your answer. Do not reveal private deliberation.',
    'Treat strengths as lenses, blind spots as limits. Preserve uncertainty and dissent when the evidence is incomplete.',
    buildMentorSpeechStyleGuidance(),
    '',
    `Name: ${mentor.name}`,
    `Role: ${mentor.role}`,
    `Personality: ${mentor.personality ?? ''}`,
    `Speaking style: ${mentor.speakingStyle ?? ''}`,
    `Participation behavior: ${mentor.participationBehavior ?? ''}`,
    ...(personaGuidance ? ['', personaGuidance] : []),
    ...(identityLines.length ? ['', 'Mentor identity profile:', ...identityLines] : []),
    '',
    `User question: ${question}`,
    '',
    'Prior council contributions:',
    prior,
    '',
    'Return only the words the user should see as your spoken contribution.',
    'Do not return JSON, markdown fences, labels, hidden reasoning, or stage directions.'
  ].join('\n');
}

function buildMentorSpeechStyleGuidance() {
  return [
    'Speak as the mentor, not as an LLM, chatbot, consultant template, or generic chat assistant.',
    'Write mostly in natural paragraphs with a human oral cadence, as if speaking across the council table.',
    'Avoid bullet lists, numbered lists, section headings, tables, and framework dumps unless the user explicitly asks for a checklist or comparison.',
    'Prefer one or two developed insights with concrete counsel over many shallow list items.',
    'Do not sound like a generic chat assistant: avoid phrases like "Here are", "Certainly", "As an AI", and "In conclusion".'
  ].join('\n');
}

export function buildLiveActionPrompt({ mentor, question, phase, priorContributions = [], utterance = '' }) {
  const prior = priorContributions.length
    ? priorContributions.map((item) => `- ${item.speakerName}: ${item.utterance}`).join('\n')
    : '- No prior visible contributions.';
  const personaGuidance = buildPersonaGuidance(mentor);
  const identityLines = buildIdentityLines(mentor.identity);
  const phaseText = phase === 'post' ? 'after speaking' : 'before speaking';
  const utteranceContext = utterance ? ['Visible utterance just spoken:', safeText(utterance)] : [];

  return [
    'You are writing a short visible stage direction for a public Mastermind council mentor.',
    `Write what this mentor does ${phaseText}.`,
    'Make it subtle, ceremonial, persona-aware, and concrete. Avoid game-like spectacle.',
    'Do not expose private deliberation or internal reasoning.',
    '',
    `Name: ${mentor.name}`,
    `Role: ${mentor.role}`,
    `Personality: ${mentor.personality ?? ''}`,
    `Speaking style: ${mentor.speakingStyle ?? ''}`,
    ...(personaGuidance ? ['', personaGuidance] : []),
    ...(identityLines.length ? ['', 'Mentor identity profile:', ...identityLines] : []),
    '',
    `User question: ${question}`,
    '',
    'Prior visible council contributions:',
    prior,
    ...(utteranceContext.length ? ['', ...utteranceContext] : []),
    '',
    'Return only valid JSON with this field:',
    '{"action":"one short visible stage direction, 8 to 24 words"}',
    '',
    'Do not include markdown fences, speaker labels, dialogue, or the mentor answer.'
  ].join('\n');
}

export function buildParticipationPrompt({ mentor, question, turnNumber, transcript = [] }) {
  const transcriptText = transcript.length
    ? transcript.map((item) => `Turn ${item.turnNumber} - ${item.speakerName}: ${item.utterance}`).join('\n')
    : '- No prior visible contributions.';
  const personaGuidance = buildPersonaGuidance(mentor);

  return [
    'You are making a public participation decision for a live Mastermind council.',
    'Decide if this mentor should claim the speaking stick this turn.',
    'Use only public criteria. Do not reveal private deliberation.',
    '',
    `Name: ${mentor.name}`,
    `Role: ${mentor.role}`,
    `Participation behavior: ${mentor.participationBehavior ?? ''}`,
    ...(personaGuidance ? ['', personaGuidance] : []),
    '',
    `Turn number: ${turnNumber}`,
    `User question: ${question}`,
    '',
    'Visible transcript so far:',
    transcriptText,
    '',
    'Return only valid JSON with these fields:',
    '{"wantsToSpeak":true,"intent":"contribute|question|respond|abstain","reason":"one concise public reason"}',
    '',
    'Choose wantsToSpeak=true only when this mentor has a distinct contribution, challenge, question, or response.'
  ].join('\n');
}

export function buildSynthesisPrompt({ question, transcript = [], infrastructureIssues = [] }) {
  const transcriptText = transcript.length
    ? transcript.map((item) => `Turn ${item.turnNumber} - ${item.speakerName}: ${item.utterance}`).join('\n')
    : '- No visible mentor contributions.';
  const issuesText = infrastructureIssues.length ? infrastructureIssues.map((item) => `- ${item}`).join('\n') : '- None.';

  return [
    'You are the synthesis model for the Mastermind council.',
    'Create a Council Synthesis Artifact.',
    'Create a true public decision brief, not a concatenation of mentor answers.',
    'Write the mainAnswer as direct counsel to the user: decision, rationale, important tension, and first move.',
    'The mainAnswer must not mention mentor names, list speakers, or follow transcript order.',
    'Ground key points in named mentor contributions only inside mentorGrounding, without inventing consensus.',
    'Preserve useful dissent, name assumptions, give practical next actions, and surface unresolved questions.',
    'Do not reveal private deliberation or hidden reasoning.',
    '',
    `User question: ${question}`,
    '',
    'Visible council transcript:',
    transcriptText,
    '',
    'Provider/runtime issues:',
    issuesText,
    '',
    'Return only valid JSON with these fields:',
    '{"mainAnswer":"concise decision brief for the user, without mentor names","agreementState":"short state","minorityViews":["optional dissent"],"assumptions":["key assumptions"],"nextActions":["specific next action"],"unresolvedQuestions":["important open question"],"mentorGrounding":[{"mentorName":"mentor name","point":"point grounded in transcript"}],"confidence":"low|medium|high","verificationGuidance":["how user should verify"]}',
    '',
    'Do not include markdown fences.'
  ].join('\n');
}

export function buildPreamblePrompt({ mentor, question }) {
  const personaGuidance = buildPersonaGuidance(mentor);
  const identityLines = buildIdentityLines(mentor.identity);

  return [
    'You are a public council mentor in the Mastermind app during preamble clarification.',
    'Decide whether the user question needs one concise public clarifying question before deliberation begins.',
    'Use only public reasoning cues. Do not reveal private deliberation.',
    '',
    `Name: ${mentor.name}`,
    `Role: ${mentor.role}`,
    `Personality: ${mentor.personality ?? ''}`,
    ...(personaGuidance ? ['', personaGuidance] : []),
    ...(identityLines.length ? ['', 'Mentor identity profile:', ...identityLines] : []),
    '',
    `User question: ${question}`,
    '',
    'Return only valid JSON with these fields:',
    '{"needsClarification":true,"clarifyingQuestion":"one concise public question, or empty string"}',
    '',
    'Ask only if the missing information would materially change the counsel. Do not include markdown fences.'
  ].join('\n');
}

export function parseParticipationDecision(output) {
  const parsed = parseJsonObject(String(output ?? '').trim());
  if (!parsed) {
    return { wantsToSpeak: true, intent: 'contribute', reason: 'default visible contribution' };
  }

  const intent = safeText(parsed.intent) || (parsed.wantsToSpeak === false ? 'abstain' : 'contribute');
  return {
    wantsToSpeak: parsed.wantsToSpeak !== false,
    intent,
    reason: safeText(parsed.reason) || (parsed.wantsToSpeak === false ? 'No distinct contribution this turn.' : 'Useful contribution.')
  };
}

export function parseSynthesisResult(output, fallback, { transcript = [] } = {}) {
  const parsed = parseJsonObject(String(output ?? '').trim());
  if (!parsed) return fallback;
  const artifact = {
    ...fallback,
    mainAnswer: safeText(parsed.mainAnswer) || fallback.mainAnswer,
    agreementState: safeText(parsed.agreementState) || fallback.agreementState,
    minorityViews: normalizeStringArray(parsed.minorityViews, fallback.minorityViews),
    assumptions: normalizeStringArray(parsed.assumptions, fallback.assumptions),
    nextActions: normalizeStringArray(parsed.nextActions, fallback.nextActions),
    unresolvedQuestions: normalizeStringArray(parsed.unresolvedQuestions, fallback.unresolvedQuestions),
    mentorGrounding: normalizeGrounding(parsed.mentorGrounding, fallback.mentorGrounding),
    confidence: normalizeConfidence(parsed.confidence, fallback.confidence),
    verificationGuidance: normalizeStringArray(parsed.verificationGuidance, fallback.verificationGuidance),
    synthesisQuality: 'model'
  };

  return looksLikeConcatenation(artifact.mainAnswer, transcript) ? fallback : artifact;
}

export function parsePreambleQuestion(output) {
  const parsed = parseJsonObject(String(output ?? '').trim());
  const needsClarification = parsed?.needsClarification === true;
  const clarifyingQuestion = needsClarification ? safeText(parsed?.clarifyingQuestion) : '';
  return {
    needsClarification: Boolean(needsClarification && clarifyingQuestion),
    clarifyingQuestion
  };
}

function normalizeStringArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value.map(safeText).filter(Boolean);
  return normalized.length ? normalized : fallback;
}

function normalizeGrounding(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => ({
      mentorName: safeText(item?.mentorName),
      point: safeText(item?.point)
    }))
    .filter((item) => item.mentorName && item.point);
  return normalized.length ? normalized : fallback;
}

function normalizeConfidence(value, fallback = 'low') {
  const confidence = safeText(value).toLowerCase();
  return ['low', 'medium', 'high'].includes(confidence) ? confidence : fallback;
}

function looksLikeConcatenation(mainAnswer, transcript) {
  if (!Array.isArray(transcript) || transcript.length < 2) return false;
  const answer = safeText(mainAnswer).toLowerCase();
  const mentionedNames = transcript.filter((item) => {
    const speakerName = escapeRegExp(safeText(item.speakerName).toLowerCase());
    return speakerName && new RegExp(`\\b${speakerName}\\b`).test(answer);
  }).length;
  const matchingNames = transcript.filter((item) => answer.includes(`${safeText(item.speakerName).toLowerCase()}:`)).length;
  const matchingUtterances = transcript.filter((item) => answer.includes(safeText(item.utterance).toLowerCase())).length;
  const recapNames = transcript.filter((item) => {
    const speakerName = escapeRegExp(safeText(item.speakerName).toLowerCase());
    if (!speakerName) return false;
    return new RegExp(
      `\\b${speakerName}\\b\\s+(says|said|argues|argued|believes|suggests|recommends|notes|warns|adds|points out|emphasizes|focuses|frames|invites|proposes|highlights|observes|stresses)\\b`
    ).test(answer);
  }).length;
  return mentionedNames >= 2 || matchingNames >= 2 || matchingUtterances >= 2 || recapNames >= 2;
}

export function parseLiveAction(output, fallback) {
  const parsed = parseJsonObject(String(output ?? '').trim());
  const action = safeText(parsed?.action);
  if (!action) return fallback;
  return truncateText(action, 160);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPersonaGuidance(mentor) {
  if (mentor.personaMode === 'raw') {
    return 'Persona mode: raw analysis mode. Stay as an analytic role, avoid persona theater, and prioritize clear question analysis over character performance.';
  }

  if (mentor.personaMode === 'archetype') {
    return 'Persona mode: archetype. You are not a literal historical simulation; embody the useful intellectual pattern without claiming to be the person or inventing biographical authority.';
  }

  return '';
}

function buildIdentityLines(identity = {}) {
  return [
    formatIdentityLine('Biography', identity.biography),
    formatIdentityLine('Operating principles', identity.operatingPrinciples),
    formatIdentityLine('Strengths', identity.strengths),
    formatIdentityLine('Blind spots', identity.blindSpots),
    formatIdentityLine('Debate style', identity.debateStyle),
    formatIdentityLine('Preferred questions', identity.preferredQuestions),
    formatIdentityLine('Ritual presence', identity.ritualPresence)
  ].filter(Boolean);
}

function formatIdentityLine(label, value) {
  const text = Array.isArray(value) ? value.map(safeText).filter(Boolean).join('; ') : safeText(value);
  return text ? `${label}: ${text}` : '';
}

export function parseMentorContribution(output) {
  const value = String(output ?? '').trim();
  const parsed = parseJsonObject(value);
  if (!parsed) {
    return normalizeContribution({ utterance: value });
  }
  return normalizeContribution(parsed);
}

function parseJsonObject(value) {
  try {
    return JSON.parse(stripCodeFence(value));
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function stripCodeFence(value) {
  return value.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
}

function normalizeContribution(contribution) {
  return {
    action: safeText(contribution.action) || 'remains composed',
    utterance: safeText(contribution.utterance) || safeText(contribution.text) || 'I have no distinct contribution.',
    stance: safeText(contribution.stance) || 'contribute',
    wantsAnotherRound: contribution.wantsAnotherRound === true
  };
}

function safeText(value) {
  return String(value ?? '').replaceAll(/\s+/g, ' ').trim();
}

function truncateText(text, limit) {
  if (text.length <= limit) return text;
  const slice = text.slice(0, limit - 1);
  const lastSpace = slice.lastIndexOf(' ');
  return `${slice.slice(0, lastSpace > 60 ? lastSpace : limit - 1).trim()}.`;
}
