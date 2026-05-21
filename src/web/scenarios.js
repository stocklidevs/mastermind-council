const basicCouncil = [
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
      utterances: ['Name the assumption before acting on it.'],
      preambleQuestions: ['What outcome would make this question feel fully answered?']
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

const abstentionCouncil = [
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

const dissentCouncil = [
  {
    id: 'athena',
    name: 'Athena',
    role: 'Strategist',
    style: 'measured',
    behavior: {
      stance: 'experiment',
      utterances: ['Run a small experiment first.'],
      actions: ['sets a brass marker beside the question']
    }
  },
  {
    id: 'socrates',
    name: 'Socrates',
    role: 'Questioner',
    style: 'probing',
    behavior: {
      stance: 'clarify',
      utterances: ['Clarify the question before experimenting.'],
      preambleQuestions: ['What constraint or context should the council know before giving counsel?']
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
  },
  {
    id: 'hermes',
    name: 'Hermes',
    role: 'Messenger',
    style: 'brief',
    behavior: {
      abstainRounds: [1],
      abstainReason: 'No distinct point to add.'
    }
  }
];

const duplicateAttemptCouncil = [
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

export const scenarios = {
  balanced: {
    id: 'balanced',
    name: 'Balanced council',
    members: basicCouncil
  },
  abstention: {
    id: 'abstention',
    name: 'Visible abstention',
    members: abstentionCouncil
  },
  dissent: {
    id: 'dissent',
    name: 'Split decision',
    members: dissentCouncil
  },
  invalid: {
    id: 'invalid',
    name: 'Protocol guardrail',
    members: duplicateAttemptCouncil
  }
};

export function getScenario(id = 'dissent') {
  return scenarios[id] ?? scenarios.dissent;
}
