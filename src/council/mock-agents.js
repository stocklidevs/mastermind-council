export function shouldAbstain(member, roundNumber) {
  return member.behavior?.abstainRounds?.includes(roundNumber) ?? false;
}

export function getAbstainReason(member) {
  return member.behavior?.abstainReason ?? 'No contribution this round.';
}

export function createContribution(member, roundNumber) {
  const utterances = member.behavior?.utterances ?? [];
  const actions = member.behavior?.actions ?? [];

  return {
    speakerId: member.id,
    roundNumber,
    utterance: utterances[roundNumber - 1] ?? utterances[0] ?? '',
    action: actions[roundNumber - 1] ?? actions[0],
    stance: member.behavior?.stance
  };
}

export function wantsAnotherRound(member) {
  return Boolean(member.behavior?.wantsMoreRounds);
}

export function attemptsRepeatInRound(member) {
  return Boolean(member.behavior?.repeatInRound);
}
