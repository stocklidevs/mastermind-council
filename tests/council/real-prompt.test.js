import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPreamblePrompt,
  buildLiveActionPrompt,
  buildSynthesisPrompt,
  buildLiveMentorPrompt,
  buildMentorPrompt,
  parsePreambleQuestion,
  parseLiveAction,
  parseSynthesisResult,
  parseMentorContribution
} from '../../src/council/real-prompt.js';
import { createDefaultMentors } from '../../src/config/mentor-config.js';

test('builds public mentor prompt with structured response contract', () => {
  const [mentor] = createDefaultMentors();
  const prompt = buildMentorPrompt({
    mentor,
    question: 'What should I focus on this week?',
    priorContributions: []
  });

  assert.match(prompt, /Athena/);
  assert.match(prompt, /Strategist/);
  assert.match(prompt, /JSON/);
  assert.match(prompt, /action/);
  assert.match(prompt, /utterance/);
  assert.doesNotMatch(prompt, /chain-of-thought/i);
  assert.doesNotMatch(prompt, /API_KEY|credential|secret/i);
});

test('includes prior contribution summary as dynamic context', () => {
  const [mentor] = createDefaultMentors();
  const prompt = buildMentorPrompt({
    mentor,
    question: 'What should I focus on this week?',
    priorContributions: [{ speakerName: 'Socrates', utterance: 'Clarify the assumption.' }]
  });

  assert.match(prompt, /Socrates: Clarify the assumption/);
});

test('includes deep archetype identity and honesty rules in mentor prompt', () => {
  const prompt = buildMentorPrompt({
    mentor: {
      name: 'Socratic Examiner',
      role: 'Assumption Questioner',
      personality: 'inspired by Socrates',
      speakingStyle: 'probing',
      participationBehavior: 'speaks when assumptions need testing',
      personaMode: 'archetype',
      identity: {
        biography: 'An archetypal mentor inspired by Socrates.',
        operatingPrinciples: ['Interrogate premises', 'Preserve uncertainty'],
        strengths: ['assumption testing'],
        blindSpots: ['can delay action'],
        debateStyle: 'Questions the premise.',
        preferredQuestions: ['What is assumed?'],
        ritualPresence: 'Leans back before speaking.'
      }
    },
    question: 'What should I do?'
  });

  assert.match(prompt, /not a literal historical simulation/i);
  assert.match(prompt, /Biography: An archetypal mentor inspired by Socrates/);
  assert.match(prompt, /Blind spots: can delay action/);
  assert.match(prompt, /Preferred questions: What is assumed/);
  assert.match(prompt, /Preserve uncertainty/);
});

test('includes raw analysis mode instructions in mentor prompt', () => {
  const prompt = buildMentorPrompt({
    mentor: {
      name: 'Decomposer',
      role: 'Decomposer',
      personality: 'breaks the question into parts',
      speakingStyle: 'plain',
      participationBehavior: 'speaks when decomposition helps',
      personaMode: 'raw',
      identity: {
        biography: 'A raw analytic role.',
        strengths: ['decomposition'],
        blindSpots: ['can fragment the whole']
      }
    },
    question: 'What should I do?'
  });

  assert.match(prompt, /raw analysis mode/i);
  assert.match(prompt, /avoid persona theater/i);
  assert.match(prompt, /Blind spots: can fragment the whole/);
});

test('builds public preamble prompt with structured question contract', () => {
  const [mentor] = createDefaultMentors();
  const prompt = buildPreamblePrompt({
    mentor,
    question: 'Should I launch now?'
  });

  assert.match(prompt, /preamble clarification/i);
  assert.match(prompt, /Return only valid JSON/i);
  assert.match(prompt, /needsClarification/);
  assert.match(prompt, /clarifyingQuestion/);
  assert.doesNotMatch(prompt, /chain-of-thought/i);
  assert.doesNotMatch(prompt, /API_KEY|credential|secret/i);
});

test('builds live mentor prompt for visible utterance streaming', () => {
  const [mentor] = createDefaultMentors();
  const prompt = buildLiveMentorPrompt({
    mentor,
    question: 'Should I launch now?',
    priorContributions: []
  });

  assert.match(prompt, /streaming live council/i);
  assert.match(prompt, /Return only the words the user should see/i);
  assert.doesNotMatch(prompt, /valid JSON/i);
  assert.doesNotMatch(prompt, /utterance/);
});

test('builds live action prompt for public roleplayed stage directions', () => {
  const [mentor] = createDefaultMentors();
  const prompt = buildLiveActionPrompt({
    mentor,
    question: 'Should I launch now?',
    phase: 'pre',
    priorContributions: []
  });

  assert.match(prompt, /visible stage direction/i);
  assert.match(prompt, /before speaking/i);
  assert.match(prompt, /Return only valid JSON/i);
  assert.match(prompt, /action/);
  assert.doesNotMatch(prompt, /hidden reasoning|chain-of-thought/i);
});

test('builds synthesis prompt with artifact contract and grounding rules', () => {
  const prompt = buildSynthesisPrompt({
    question: 'What business should I build?',
    transcript: [
      { turnNumber: 1, speakerName: 'Market Moralist', utterance: 'Find repeated pain with budget.' },
      { turnNumber: 1, speakerName: 'Power Realist', utterance: 'Sell where urgency already exists.' }
    ],
    infrastructureIssues: ['Operations Commander: provider-stream-empty-output']
  });

  assert.match(prompt, /Council Synthesis Artifact/i);
  assert.match(prompt, /not a concatenation/i);
  assert.match(prompt, /decision brief/i);
  assert.match(prompt, /mainAnswer must not mention mentor names/i);
  assert.match(prompt, /mentorGrounding/);
  assert.match(prompt, /nextActions/);
  assert.match(prompt, /unresolvedQuestions/);
  assert.match(prompt, /Market Moralist/);
  assert.doesNotMatch(prompt, /chain-of-thought/i);
});

test('rejects synthesis that recaps several mentors by name with softer language', () => {
  const fallback = {
    mainAnswer: 'Fallback synthesis.',
    agreementState: 'Fallback',
    minorityViews: [],
    assumptions: [],
    verificationGuidance: [],
    nextActions: [],
    unresolvedQuestions: [],
    mentorGrounding: [],
    confidence: 'low',
    synthesisQuality: 'fallback'
  };
  const transcript = [
    { speakerName: 'Depth Psychologist', utterance: 'Bind curiosity to real community pain.' },
    { speakerName: 'Practice Coach', utterance: 'Make paid user contact the first daily action.' },
    { speakerName: 'Meaning Doctor', utterance: 'Let constraints clarify responsibility.' }
  ];

  const artifact = parseSynthesisResult(
    JSON.stringify({
      mainAnswer:
        'Depth Psychologist emphasizes integrating curiosity with service. Practice Coach focuses on daily paid conversations. Meaning Doctor frames constraints as responsibility.',
      agreementState: 'Done'
    }),
    fallback,
    { transcript }
  );

  assert.equal(artifact, fallback);
});

test('parses rich synthesis artifact fields', () => {
  const fallback = {
    mainAnswer: 'Fallback.',
    agreementState: 'Fallback',
    minorityViews: [],
    assumptions: [],
    verificationGuidance: [],
    nextActions: [],
    unresolvedQuestions: [],
    mentorGrounding: [],
    confidence: 'low',
    synthesisQuality: 'fallback'
  };
  const artifact = parseSynthesisResult(
    JSON.stringify({
      mainAnswer: 'Build a boring recurring workflow product for a painful niche.',
      agreementState: 'Provisional alignment',
      minorityViews: ['Power Realist warns distribution is the bottleneck.'],
      assumptions: ['500 buyers can be reached directly.'],
      nextActions: ['Interview 20 operators this week.'],
      unresolvedQuestions: ['Which niche has urgent budget?'],
      mentorGrounding: [
        { mentorName: 'Market Moralist', point: 'Validated willingness to pay.' },
        { mentorName: 'Power Realist', point: 'Warned about distribution power.' }
      ],
      confidence: 'medium',
      verificationGuidance: ['Do not build before pre-selling.']
    }),
    fallback
  );

  assert.equal(artifact.mainAnswer, 'Build a boring recurring workflow product for a painful niche.');
  assert.equal(artifact.nextActions[0], 'Interview 20 operators this week.');
  assert.equal(artifact.unresolvedQuestions[0], 'Which niche has urgent budget?');
  assert.equal(artifact.mentorGrounding[1].mentorName, 'Power Realist');
  assert.equal(artifact.confidence, 'medium');
  assert.equal(artifact.synthesisQuality, 'model');
});

test('rejects synthesis that only concatenates mentor answers', () => {
  const fallback = {
    mainAnswer: 'Fallback synthesis.',
    agreementState: 'Fallback',
    minorityViews: [],
    assumptions: [],
    verificationGuidance: [],
    nextActions: [],
    unresolvedQuestions: [],
    mentorGrounding: [],
    confidence: 'low',
    synthesisQuality: 'fallback'
  };
  const transcript = [
    { speakerName: 'Market Moralist', utterance: 'Find repeated pain with budget.' },
    { speakerName: 'Power Realist', utterance: 'Sell where urgency already exists.' }
  ];

  const artifact = parseSynthesisResult(
    '{"mainAnswer":"Market Moralist: Find repeated pain with budget. Power Realist: Sell where urgency already exists.","agreementState":"Done"}',
    fallback,
    { transcript }
  );

  assert.equal(artifact, fallback);
});

test('rejects synthesis that only recaps mentor-by-mentor positions', () => {
  const fallback = {
    mainAnswer: 'Fallback synthesis.',
    agreementState: 'Fallback',
    minorityViews: [],
    assumptions: [],
    verificationGuidance: [],
    nextActions: [],
    unresolvedQuestions: [],
    mentorGrounding: [],
    confidence: 'low',
    synthesisQuality: 'fallback'
  };
  const transcript = [
    { speakerName: 'Market Moralist', utterance: 'Find repeated pain with budget.' },
    { speakerName: 'Power Realist', utterance: 'Sell where urgency already exists.' }
  ];

  const artifact = parseSynthesisResult(
    '{"mainAnswer":"Market Moralist says find repeated pain with budget. Power Realist says distribution is the bottleneck.","agreementState":"Done"}',
    fallback,
    { transcript }
  );

  assert.equal(artifact, fallback);
});

test('parses structured preamble question safely', () => {
  assert.deepEqual(
    parsePreambleQuestion('{"needsClarification":true,"clarifyingQuestion":"What constraint matters most?"}'),
    { needsClarification: true, clarifyingQuestion: 'What constraint matters most?' }
  );
  assert.deepEqual(
    parsePreambleQuestion('{"needsClarification":false,"clarifyingQuestion":"Ignore me"}'),
    { needsClarification: false, clarifyingQuestion: '' }
  );
});

test('parses structured mentor contribution JSON', () => {
  const contribution = parseMentorContribution(
    '{"action":"leans forward","utterance":"Run the smallest test.","stance":"experiment","wantsAnotherRound":false}'
  );

  assert.equal(contribution.action, 'leans forward');
  assert.equal(contribution.utterance, 'Run the smallest test.');
  assert.equal(contribution.stance, 'experiment');
  assert.equal(contribution.wantsAnotherRound, false);
});

test('parses and limits live roleplayed action text', () => {
  const action = parseLiveAction(
    JSON.stringify({
      action:
        'Athena rests one hand near the gold stick, lets the room settle, and gives the question a grave, measured look before speaking with calm force.'
    }),
    'fallback action'
  );

  assert.match(action, /^Athena rests one hand/);
  assert.ok(action.length <= 160);
  assert.equal(parseLiveAction('not json', 'fallback action'), 'fallback action');
});

test('falls back safely for plain text provider output', () => {
  const contribution = parseMentorContribution('Start by naming the assumption.');

  assert.equal(contribution.action, 'remains composed');
  assert.equal(contribution.utterance, 'Start by naming the assumption.');
  assert.equal(contribution.stance, 'contribute');
});
