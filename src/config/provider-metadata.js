import { builtInProviders } from './provider-catalog.js';

export const providers = builtInProviders;

export function getProvider(providerId, catalog = providers) {
  return catalog.find((provider) => provider.id === providerId);
}

export function getModelsForProvider(providerId, catalog = providers) {
  return getProvider(providerId, catalog)?.models ?? [];
}

export function getModel(providerId, modelId, catalog = providers) {
  return getModelsForProvider(providerId, catalog).find((model) => model.id === modelId);
}
