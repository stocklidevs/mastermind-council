#!/usr/bin/env node
import { findOnePasswordCli, resolveOnePasswordReference } from '../src/secrets/one-password.js';
import { getProviderSmokeTargets } from '../src/providers/smoke-config.js';
import { runProviderSmoke } from '../src/providers/smoke-adapters.js';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const onlyArg = process.argv.slice(2).find((arg) => arg.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length) : null;

const cli = await findOnePasswordCli();
if (!cli.ok) {
  console.log(`1Password CLI unavailable: ${cli.error}`);
  process.exitCode = 1;
} else {
  console.log(`1Password CLI: ${cli.path}${cli.version ? ` (${cli.version})` : ''}`);
  const targets = getProviderSmokeTargets({ only });

  for (const target of targets) {
    const resolved = await resolveOnePasswordReference(target.secretReference, { opPath: cli.path });
    if (!resolved.ok) {
      console.log(`${target.name}: secret failed - ${resolved.error}`);
      process.exitCode = 1;
      continue;
    }

    if (dryRun) {
      console.log(`${target.name}: ready (${target.model})`);
      continue;
    }

    const result = await runProviderSmoke({
      ...target,
      apiKey: resolved.getSecret()
    });
    if (result.ok) {
      console.log(`${result.providerName}: ok ${result.status} ${result.latencyMs}ms - ${result.preview}`);
    } else {
      console.log(`${result.providerName}: failed ${result.status ?? 'n/a'} ${result.latencyMs}ms - ${result.error}`);
      process.exitCode = 1;
    }
  }
}
