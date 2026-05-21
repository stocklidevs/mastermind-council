function stanceCounts(contributions) {
  const counts = new Map();

  for (const contribution of contributions) {
    if (!contribution.stance) continue;
    counts.set(contribution.stance, (counts.get(contribution.stance) ?? 0) + 1);
  }

  return counts;
}

function dominantStance(counts) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function synthesizeSession(session, closureReason) {
  const contributions = session.rounds.flatMap((round) => round.contributions);
  const counts = stanceCounts(contributions);
  const dominant = dominantStance(counts);
  const distinctStances = [...counts.keys()];
  const minorityViews = distinctStances
    .filter((stance) => stance !== dominant)
    .map((stance) => {
      const contribution = contributions.find((item) => item.stance === stance);
      return `${stance}: ${contribution?.utterance ?? 'Minority view preserved.'}`;
    });

  let agreementState = 'unresolved';
  if (closureReason === 'max-rounds') {
    agreementState = distinctStances.length > 1 ? 'split-decision' : 'unresolved';
  } else if (distinctStances.length <= 1 && contributions.length > 0) {
    agreementState = 'consensus';
  } else if (minorityViews.length > 0) {
    agreementState = 'split-decision';
  } else if (contributions.length > 0) {
    agreementState = 'rough-consensus';
  }

  const resolvedClosureReason =
    closureReason === 'no-further-participation' && agreementState !== 'unresolved'
      ? agreementState
      : closureReason;

  return {
    agreementState,
    closureReason: resolvedClosureReason,
    mainAnswer: contributions[0]?.utterance ?? 'The council did not produce a contribution.',
    minorityViews,
    assumptions:
      closureReason === 'max-rounds'
        ? ['Unresolved assumptions remain because the round limit was reached.']
        : ['The synthesis is based on deterministic mock council behavior.'],
    verificationGuidance: [
      'Review the transcript and verify important claims before acting.'
    ]
  };
}
