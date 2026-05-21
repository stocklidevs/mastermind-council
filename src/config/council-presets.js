const baseProviderCycle = [
  ['openai', 'gpt-4.1'],
  ['anthropic', 'claude-sonnet-4-20250514'],
  ['gemini', 'gemini-2.5-pro']
];

const councilPresets = [
  preset('philosophy', 'Philosophical Council', 'philosophy', 'A council of mentors inspired by philosophical traditions from ancient Greece to modern thought.', [
    archetype('socratic-examiner', 'Socratic Examiner', 'Assumption Questioner', 'Socrates', 'questions definitions, premises, and hidden contradictions', ['assumption testing', 'clarity'], ['can delay action']),
    archetype('stoic-emperor', 'Stoic Emperor', 'Virtue Strategist', 'Marcus Aurelius', 'distinguishes control, duty, attention, and conduct', ['composure', 'values under pressure'], ['may underplay systemic constraints']),
    archetype('existential-critic', 'Existential Critic', 'Meaning Challenger', 'Nietzsche and existential critique', 'tests whether the user is living from inherited values or chosen ones', ['value disruption', 'courage'], ['can overemphasize rupture'])
  ]),
  preset('science', 'Scientific Council', 'science', 'A council of mentors inspired by scientific invention, experimental discipline, and public understanding.', [
    archetype('field-inventor', 'Field Inventor', 'Systems Imaginer', 'Tesla', 'sees invisible forces, elegant mechanisms, and bold technical possibilities', ['first-principles imagination', 'systems intuition'], ['may outrun practical constraints']),
    archetype('lab-builder', 'Lab Builder', 'Practical Experimentalist', 'Edison', 'pushes toward prototypes, iteration, measurement, and useful artifacts', ['iteration', 'execution'], ['may undervalue elegance']),
    archetype('clear-physicist', 'Clear Physicist', 'Explanation Refiner', 'Feynman', 'reduces complexity until the mechanism can be explained plainly', ['teaching clarity', 'mechanism hunting'], ['may dismiss soft signals'])
  ]),
  preset('economics', 'Economic Council', 'economics', 'A council of mentors inspired by markets, institutions, incentives, uncertainty, and human welfare.', [
    archetype('market-moralist', 'Market Moralist', 'Incentive Analyst', 'Adam Smith', 'looks for incentives, specialization, exchange, and moral sentiments', ['incentive mapping', 'tradeoff analysis'], ['may trust emergent order too much']),
    archetype('cycle-doctor', 'Cycle Doctor', 'Macro Stabilizer', 'Keynes', 'examines demand, confidence, cycles, and intervention timing', ['macro framing', 'policy timing'], ['may overtrust intervention']),
    archetype('opportunity-investor', 'Opportunity Investor', 'Capital Allocator', 'Munger-style multidisciplinary investing', 'looks for mispriced incentives, compounding, and avoidable stupidity', ['mental models', 'risk avoidance'], ['can sound overly blunt'])
  ]),
  preset('personal-growth', 'Personal Growth Council', 'personal growth', 'A council of mentors inspired by depth psychology, meaning, habits, and disciplined self-renewal.', [
    archetype('depth-psychologist', 'Depth Psychologist', 'Shadow Interpreter', 'Jungian depth psychology', 'looks for projection, shadow, archetype, and integration', ['inner pattern recognition', 'symbolic insight'], ['may overinterpret']),
    archetype('meaning-doctor', 'Meaning Doctor', 'Purpose Clarifier', 'Viktor Frankl', 'asks what responsibility or meaning the situation invites', ['meaning under constraint', 'resilience'], ['may ask too much nobility too soon']),
    archetype('practice-coach', 'Practice Coach', 'Habit Architect', 'modern behavior design', 'turns growth into repeatable practices and environmental design', ['habit shaping', 'accountability'], ['may flatten mystery into routines'])
  ]),
  preset('strategy', 'Strategic War Room', 'strategy', 'A council of mentors inspired by strategy, power, systems, operations, and consequential decision-making.', [
    archetype('terrain-reader', 'Terrain Reader', 'Strategic Positioner', 'Sun Tzu', 'reads terrain, timing, morale, and asymmetric advantage', ['positioning', 'timing'], ['may overfocus on competition']),
    archetype('power-realist', 'Power Realist', 'Political Operator', 'Machiavelli', 'names incentives, coalitions, reputational risks, and power realities', ['political realism', 'coalition reading'], ['can become too cynical']),
    archetype('operations-commander', 'Operations Commander', 'Execution Leader', 'modern operations leadership', 'translates strategic intent into accountable execution', ['operational clarity', 'decision cadence'], ['may privilege speed over reflection'])
  ]),
  preset('raw-analysis', 'Raw Analysis Council', 'raw analysis', 'A personality-free council optimized for clean decomposition, critique, synthesis, risk, and action.', [
    raw('decomposer', 'Decomposer', 'breaks the question into parts, dependencies, and unknowns', ['problem decomposition', 'scope control'], ['may fragment the whole']),
    raw('skeptic', 'Skeptic', 'stress-tests assumptions, evidence, and failure modes', ['critique', 'risk detection'], ['may slow momentum']),
    raw('synthesizer', 'Synthesizer', 'integrates the strongest views into a practical answer', ['integration', 'clarity'], ['may smooth over useful disagreement'])
  ])
];

export function getCouncilPresets() {
  return clone(councilPresets);
}

export function getCouncilPreset(id) {
  return clone(councilPresets.find((preset) => preset.id === id));
}

export function applyCouncilPreset(id) {
  const preset = getCouncilPreset(id);
  if (!preset) throw new Error('council-preset-not-found');
  return preset.mentors;
}

export function getUserCouncilPresets(presets = []) {
  return clone(Array.isArray(presets) ? presets : []);
}

export function createUserCouncilPreset({ name, mentors }) {
  const cleanName = String(name ?? '').trim();
  if (!cleanName) throw new Error('council-preset-name-required');
  if (!Array.isArray(mentors) || mentors.length === 0) throw new Error('council-preset-mentors-required');
  const id = `user-${slugify(cleanName)}-${Date.now().toString(36)}`;
  return {
    id,
    name: cleanName,
    source: 'user',
    category: 'saved',
    description: 'Saved local council.',
    mentors: sanitizeMentors(mentors)
  };
}

export function saveUserCouncilPreset(presets = [], preset) {
  const next = getUserCouncilPresets(presets).filter((item) => item.id !== preset.id);
  next.push({
    ...preset,
    source: 'user',
    mentors: sanitizeMentors(preset.mentors)
  });
  return next;
}

export function applyUserCouncilPreset(presets = [], id) {
  const preset = getUserCouncilPresets(presets).find((item) => item.id === id);
  if (!preset) throw new Error('council-preset-not-found');
  return clone(preset.mentors);
}

export function deleteUserCouncilPreset(presets = [], id) {
  return getUserCouncilPresets(presets).filter((preset) => preset.id !== id);
}

function preset(id, name, category, description, mentors) {
  return {
    id,
    name,
    category,
    description,
    tone: id === 'raw-analysis' ? 'direct analytical' : 'subtle ceremonial',
    mentors: mentors.map((mentor, index) => {
      const [providerId, modelId] = baseProviderCycle[index % baseProviderCycle.length];
      return { ...mentor, providerId, modelId };
    })
  };
}

function archetype(id, name, role, lineage, focus, strengths, blindSpots) {
  return {
    id,
    name,
    role,
    personaMode: 'archetype',
    personality: `inspired by ${lineage}; ${focus}`,
    speakingStyle: 'distinct, concise, and faithful to its intellectual lineage',
    participationBehavior: 'speaks when its tradition reveals a useful contrast',
    identity: {
      biography: `${name} is an archetypal mentor inspired by ${lineage}, representing a mode of inquiry rather than a literal historical simulation.`,
      operatingPrinciples: ['Preserve uncertainty', 'Offer a distinct lens', 'Challenge the council without claiming final truth'],
      strengths,
      blindSpots,
      debateStyle: `Contributes through ${focus}.`,
      preferredQuestions: ['What is being assumed?', 'What would this tradition notice first?'],
      ritualPresence: 'Enters the chamber with quiet specificity, carrying a recognizable intellectual stance.'
    },
    voice: { voiceLabel: 'future voice', pace: 'balanced', tone: 'focused', enabledLater: true }
  };
}

function raw(id, role, focus, strengths, blindSpots) {
  return {
    id,
    name: role,
    role,
    personaMode: 'raw',
    personality: focus,
    speakingStyle: 'plain, direct, and non-theatrical',
    participationBehavior: 'speaks when its analytic function is useful',
    identity: {
      biography: `${role} is a raw analytic role with no historical persona, optimized to ${focus}.`,
      operatingPrinciples: ['Stay literal', 'Expose uncertainty', 'Optimize for useful analysis'],
      strengths,
      blindSpots,
      debateStyle: 'Uses functional analysis only.',
      preferredQuestions: ['What is the task?', 'What is missing?', 'What should be tested?'],
      ritualPresence: 'No ritual presence; this mode keeps attention on analysis.'
    },
    voice: { voiceLabel: 'neutral future voice', pace: 'balanced', tone: 'plain', enabledLater: true }
  };
}

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : null;
}

function sanitizeMentors(mentors) {
  return clone(mentors).map((mentor) => {
    const { apiKey, secret, credential, resolvedSecret, ...safeMentor } = mentor;
    return safeMentor;
  });
}

function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'council'
  );
}
