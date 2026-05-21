export const basicCouncil = [
  {
    id: 'athena',
    name: 'Athena',
    role: 'Strategist',
    style: 'measured',
    behavior: {
      stance: 'experiment',
      utterances: ['Start with the smallest reversible test.'],
      actions: ['leans forward with calm focus']
    }
  },
  {
    id: 'socrates',
    name: 'Socrates',
    role: 'Questioner',
    style: 'probing',
    behavior: {
      stance: 'experiment',
      utterances: ['Name the assumption before acting on it.']
    }
  },
  {
    id: 'hephaestus',
    name: 'Hephaestus',
    role: 'Builder',
    style: 'practical',
    behavior: {
      stance: 'experiment',
      utterances: ['Make the first version small enough to inspect.']
    }
  }
];

export const abstentionCouncil = [
  basicCouncil[0],
  {
    id: 'hermes',
    name: 'Hermes',
    role: 'Messenger',
    style: 'brief',
    behavior: {
      abstainRounds: [1],
      abstainReason: 'No distinct point to add.'
    }
  },
  basicCouncil[1]
];

export const duplicateAttemptCouncil = [
  {
    id: 'ares',
    name: 'Ares',
    role: 'Challenger',
    style: 'forceful',
    behavior: {
      stance: 'act-now',
      utterances: ['Move before doubt becomes delay.'],
      repeatInRound: true
    }
  }
];

export const dissentCouncil = [
  {
    id: 'athena',
    name: 'Athena',
    role: 'Strategist',
    style: 'measured',
    behavior: {
      stance: 'experiment',
      utterances: ['Run a small experiment first.']
    }
  },
  {
    id: 'socrates',
    name: 'Socrates',
    role: 'Questioner',
    style: 'probing',
    behavior: {
      stance: 'clarify',
      utterances: ['Clarify the question before experimenting.']
    }
  },
  {
    id: 'hephaestus',
    name: 'Hephaestus',
    role: 'Builder',
    style: 'practical',
    behavior: {
      stance: 'experiment',
      utterances: ['Build the smallest practical test.']
    }
  }
];

export const roundCapCouncil = [
  {
    id: 'daedalus',
    name: 'Daedalus',
    role: 'Architect',
    style: 'systematic',
    behavior: {
      stance: 'iterate',
      utterances: ['The next round still has unresolved design risk.'],
      wantsMoreRounds: true
    }
  }
];
