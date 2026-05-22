const titleCase = (value) =>
  String(value)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const sentenceLabel = (value) => {
  const label = String(value).replaceAll('-', ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

function memberMap(session) {
  return new Map(session.members.map((member) => [member.id, member]));
}

function eventGroups(session) {
  const groups = new Map();

  for (const event of session.events) {
    if (!event.roundNumber) continue;
    if (!groups.has(event.roundNumber)) groups.set(event.roundNumber, []);
    groups.get(event.roundNumber).push(event);
  }

  return groups;
}

function contributionItem(event, members) {
  const member = members.get(event.speakerId);
  return {
    type: 'contribution',
    eventId: event.id,
    order: event.order,
    speakerId: event.speakerId,
    turnNumber: event.roundNumber,
    speakerName: member?.name ?? event.speakerId,
    speakerRole: member?.role ?? 'Council member',
    stickLabel: `Speaking stick held by ${member?.name ?? event.speakerId}`,
    utterance: event.utterance,
    action: event.action,
    stance: event.stance
  };
}

function abstentionItem(event, members) {
  const member = members.get(event.memberId);
  return {
    type: 'abstention',
    eventId: event.id,
    speakerId: event.memberId,
    speakerName: member?.name ?? event.memberId,
    speakerRole: member?.role ?? 'Council member',
    reason: event.reason
  };
}

function invalidItem(event, members) {
  const member = members.get(event.memberId);
  return {
    type: 'invalid',
    eventId: event.id,
    speakerId: event.memberId,
    speakerName: member?.name ?? event.memberId,
    speakerRole: member?.role ?? 'Council member',
    reason: event.reason
  };
}

export function validateQuestion(question) {
  if (typeof question !== 'string' || question.trim() === '') {
    return {
      valid: false,
      error: 'Bring a question to the council first.'
    };
  }

  return {
    valid: true,
    error: null,
    question: question.trim()
  };
}

export function buildSynthesisViewModel(synthesis) {
  const agreementState = sentenceLabel(synthesis.agreementState);
  return {
    agreementState,
    closureReason: sentenceLabel(synthesis.closureReason),
    mainAnswer: synthesis.mainAnswer,
    minorityViews: synthesis.minorityViews ?? [],
    assumptions: synthesis.assumptions ?? [],
    verificationGuidance: synthesis.verificationGuidance ?? [],
    tone: synthesis.agreementState === 'split-decision' ? 'warning' : 'steady'
  };
}

export function buildSessionViewModel(session) {
  const members = memberMap(session);
  const groups = eventGroups(session);

  return {
    id: session.id,
    question: session.question,
    status: titleCase(session.status),
    members: session.members.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      style: member.style,
      state: 'listening'
    })),
    rounds: session.rounds.map((round) => ({
      number: round.number,
      items: (groups.get(round.number) ?? [])
        .filter((event) =>
          ['contribution.accepted', 'agent.abstained', 'protocol.invalid-event'].includes(
            event.type
          )
        )
        .map((event) => {
          if (event.type === 'contribution.accepted') return contributionItem(event, members);
          if (event.type === 'agent.abstained') return abstentionItem(event, members);
          return invalidItem(event, members);
        })
    })),
    synthesis: session.synthesis ? buildSynthesisViewModel(session.synthesis) : null
  };
}
