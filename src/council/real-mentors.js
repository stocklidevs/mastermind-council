import { createDefaultMentors } from '../config/mentor-config.js';

export function createRealMentors(providerTargets) {
  const [athena, socrates, hephaestus] = createDefaultMentors();
  return [
    { ...athena, providerId: 'openai', modelId: providerTargets.find((item) => item.id === 'openai').model },
    {
      ...socrates,
      providerId: 'anthropic',
      modelId: providerTargets.find((item) => item.id === 'anthropic').model
    },
    {
      ...hephaestus,
      id: 'daedalus',
      name: 'Daedalus',
      role: 'Systems Builder',
      providerId: 'xai',
      modelId: providerTargets.find((item) => item.id === 'xai').model
    },
    {
      ...hephaestus,
      id: 'hypatia',
      name: 'Hypatia',
      role: 'Pattern Analyst',
      personality: 'analytical, synthetic, and attentive to hidden structure',
      speakingStyle: 'clear and integrative',
      participationBehavior: 'speaks when patterns, tradeoffs, or missing dimensions need naming',
      providerId: 'novita',
      modelId: providerTargets.find((item) => item.id === 'novita').model
    }
  ];
}
