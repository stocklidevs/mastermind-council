#!/usr/bin/env node
import { findOnePasswordCli, resolveOnePasswordReference } from '../src/secrets/one-password.js';
import { runRealCouncilRound } from '../src/council/real-runtime.js';
import { createRealMentors } from '../src/council/real-mentors.js';
import { getProviderSmokeTargets } from '../src/providers/smoke-config.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const question = args.filter((arg) => arg !== '--dry-run').join(' ').trim();

if (!question) {
  console.error('Usage: npm.cmd run council:real -- [--dry-run] "question"');
  process.exit(1);
}

const providerTargets = getProviderSmokeTargets();
const mentors = createRealMentors(providerTargets);
const cli = dryRun ? { ok: true, path: 'dry-run' } : await findOnePasswordCli();
if (!cli.ok) {
  console.error(`1Password CLI unavailable: ${cli.error}`);
  process.exit(1);
}

const session = await runRealCouncilRound({
  question,
  mentors,
  providerTargets,
  resolveSecret: async (reference) => {
    if (dryRun) return { ok: true, getSecret: () => 'dry-run-secret' };
    return resolveOnePasswordReference(reference, { opPath: cli.path });
  },
  generateText: dryRun ? dryRunGenerateText : undefined
});

printSession(session, { dryRun });

async function dryRunGenerateText({ mentor }) {
  return {
    ok: true,
    providerId: mentor.providerId,
    model: mentor.modelId,
    latencyMs: 0,
    text: JSON.stringify({
      action: `${mentor.name} studies the question`,
      utterance: `${mentor.name} would contribute a ${mentor.role.toLowerCase()} perspective.`,
      stance: mentor.role.toLowerCase(),
      wantsAnotherRound: false
    })
  };
}

function printSession(session, { dryRun }) {
  console.log(`Mastermind real council${dryRun ? ' dry run' : ''}`);
  console.log(`Question: ${session.question}`);
  console.log('');

  for (const round of session.rounds) {
    console.log(`Round ${round.number}`);
    for (const contribution of round.contributions) {
      const mentor = session.members.find((member) => member.id === contribution.speakerId);
      console.log(`- ${mentor?.name ?? contribution.speakerId} (${contribution.providerId}/${contribution.modelId})`);
      console.log(`  action: ${contribution.action}`);
      console.log(`  ${contribution.utterance}`);
    }
  }

  const errors = session.events.filter((event) => event.type === 'provider.error');
  for (const error of errors) {
    const mentor = session.members.find((member) => member.id === error.memberId);
    console.log(`- ${mentor?.name ?? error.memberId} provider error: ${error.reason}`);
  }

  console.log('');
  console.log(`Synthesis: ${session.synthesis.mainAnswer}`);
}
