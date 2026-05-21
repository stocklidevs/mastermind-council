#!/usr/bin/env node
import { findOnePasswordCli, resolveOnePasswordReference } from '../src/secrets/one-password.js';
import { createStreamingSmokeTargets, runStreamingSmokeTarget } from '../src/providers/streaming-smoke.js';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const onlyArg = process.argv.slice(2).find((arg) => arg.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length) : null;

const targets = createStreamingSmokeTargets({ only });
if (targets.length === 0) {
  console.log('No supported streaming smoke targets selected.');
  process.exitCode = 1;
} else if (dryRun) {
  for (const target of targets) {
    const result = await runStreamingSmokeTarget(target, { dryRun });
    console.log(`${result.providerName}: ready (${result.model})`);
  }
} else {
  const cli = await findOnePasswordCli();
  if (!cli.ok) {
    console.log(`1Password CLI unavailable: ${cli.error}`);
    process.exitCode = 1;
  } else {
    console.log(`1Password CLI: ${cli.path}${cli.version ? ` (${cli.version})` : ''}`);
    for (const target of targets) {
      const result = await runStreamingSmokeTarget(target, {
        resolveSecret: (reference) => resolveOnePasswordReference(reference, { opPath: cli.path })
      });

      if (result.ok) {
        console.log(
          `${result.providerName}: ok ${result.tokenCount} tokens ${result.latencyMs}ms - ${result.preview}`
        );
      } else {
        console.log(
          `${result.providerName}: failed ${result.tokenCount} tokens ${result.latencyMs}ms - ${result.error}`
        );
        process.exitCode = 1;
      }
    }
  }
}
