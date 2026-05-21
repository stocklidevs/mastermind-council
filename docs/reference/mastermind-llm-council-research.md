# Mastermind LLM Council - Research Notes

Created: 2026-05-16  
Purpose: consolidate early research artifacts for a "mastermind council" app where multiple LLM agents deliberate, debate, and synthesize guidance for a user.

## Project Thesis

The proposed app sits at the intersection of:

- Multi-agent LLM debate: multiple model instances or different models critique, revise, and synthesize answers.
- Expert-panel consensus methods: structured rounds, facilitation, convergence criteria, and graceful handling of persistent disagreement.
- Conversational product design: a visible council chamber where the user can observe deliberation, not just receive a final answer.
- Secret management and model-provider configuration: safe API-key handling, ideally with 1Password as an optional integration.
- Spec-driven development: use Spec Kit or a compatible spec-first workflow so the product is shaped before implementation.

The differentiating idea is not merely "ask several LLMs and merge the answers." It is a ritualized deliberation system: agents have defined temperaments, can abstain, must acquire speaking rights, cannot monopolize a turn, and may express visible action cues alongside their spoken contribution.

## Conceptual Inspirations

### Mastermind Groups

The "master mind" group concept is most directly associated with Napoleon Hill, especially *The Law of Success* and *Think and Grow Rich*. Hill describes power emerging from coordinated knowledge and harmony among multiple minds. This maps well to a council product where multiple agents are selected because they bring complementary styles, domains, or epistemic habits.

Wallace D. Wattles' *The Science of Getting Rich* is adjacent but not the clearest source for the mastermind-group idea. Wattles emphasizes creative rather than competitive action, a clear mental image, gratitude, and acting "in the certain way." Those themes can still inform product tone: the council should feel constructive, generative, and oriented toward useful action rather than adversarial point-scoring.

Useful references:

- Project Gutenberg: *The Science of Getting Rich* by Wallace D. Wattles - https://www.gutenberg.org/ebooks/59844
- Background on *Think and Grow Rich* and its "Master Mind" principle - https://en.wikipedia.org/wiki/Think_and_Grow_Rich
- Mastermind group overview - https://en.wikipedia.org/wiki/Mastermind_group

### Greek-Style Deliberation

The proposed "stick on the table" is a strong interaction metaphor. It gives the app a visible procedure:

- A round begins.
- Each agent decides whether it wants to speak.
- Eligible agents compete or are selected for the stick.
- The stick holder speaks once.
- The stick returns to the table.
- Agents who have already spoken in the round cannot speak again until the next round.
- The round ends when no eligible agent wants to speak.

This could make the debate legible to the user and reduce chaotic multi-agent chatter. It also creates a product identity: the user watches a council deliberate according to rules, not a flat list of bot completions.

## LLM Debate And Multi-Agent Research

### Multiagent Debate Can Improve Reasoning, But It Is Not Magic

Du et al. introduced a multi-agent debate setup where several model instances propose answers, critique each other over rounds, and converge toward a final answer. Their findings suggest debate can improve factuality and reasoning, and they explicitly note that the approach can combine different models, not just multiple copies of the same model.

Reference:

- "Improving Factuality and Reasoning in Language Models through Multiagent Debate" - https://arxiv.org/abs/2305.14325
- Project page - https://composable-models.github.io/llm_debate/

Implication for this app:

- Debate should be a structured process with rounds, not just parallel generation.
- The system should preserve dissent and evidence, because convergence alone is not proof of truth.
- Different model providers and personalities are a feature, not a complication.

### AutoGen And Multi-Agent Conversation Frameworks

Microsoft's AutoGen work shows a general framework for LLM applications built around agents that can converse with each other, use tools, include human input, and coordinate multi-step tasks. AutoGen is relevant as prior art even if the project does not use it directly.

Reference:

- Microsoft Research: "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation" - https://www.microsoft.com/en-us/research/publication/autogen-enabling-next-gen-llm-applications-via-multi-agent-conversation-framework/
- AutoGen project publications - https://www.microsoft.com/en-us/research/project/autogen/publications/

Implication for this app:

- Treat "agent" as more than a prompt. Each council member needs identity, model/provider config, permissions, and turn behavior.
- A human-in-the-loop path is important. The user may interrupt, redirect, ask for clarification, or call for synthesis.
- Agent orchestration should be its own backend concern, separate from the chat UI.

### Karpathy's LLM Council

Andrej Karpathy's `llm-council` repo is direct product-adjacent prior art. It is a local web app that sends a user question to multiple LLMs through OpenRouter, shows their first responses, asks models to review and rank each other's work with identities anonymized, and then has a designated Chairman model synthesize a final answer.

Reference:

- Karpathy `llm-council` GitHub repo - https://github.com/karpathy/llm-council

Karpathy's flow:

1. First opinions: all council models answer the user query independently.
2. Review: each model sees the other responses anonymously and ranks them for accuracy and insight.
3. Final response: a Chairman model compiles the responses and reviews into one final answer.

Implication for this app:

- This validates the core demand: people want a multi-model council, not just a single assistant.
- Anonymous review is a strong anti-bias mechanism and should be considered for our debate rounds.
- The proposed speaking-stick design can go beyond Karpathy's implementation by making deliberation multi-round, observable, embodied, and governed by turn-taking rules.
- The Chairman/moderator role should be constrained. It should synthesize, preserve dissent, and identify uncertainty rather than acting as an unchecked sole decision-maker.

### Recent Work Warns Against Naive Consensus

Several newer papers question whether consensus-driven multi-agent debate reliably improves truth. Reported failure modes include majority pressure, sycophantic conformity, persuasive but wrong agents, destabilization of correct reasoning, and consensus collapse where a correct minority answer is discarded.

References:

- "Can LLM Agents Really Debate? A Controlled Study of Multi-Agent Debate in Logical Reasoning" - https://arxiv.org/abs/2511.07784
- "The Cost of Consensus: Isolated Self-Correction Prevails Over Unguided Homogeneous Multi-Agent Debate" - https://arxiv.org/abs/2605.00914
- "When collaboration fails: persuasion driven adversarial influence in multi agent large language model debate" - https://www.nature.com/articles/s41598-026-42705-7
- "Free-MAD: Consensus-Free Multi-Agent Debate" - https://arxiv.org/abs/2509.11035
- "From Debate to Decision: Conformal Social Choice for Safe Multi-Agent Deliberation" - https://arxiv.org/abs/2604.07667

Implication for this app:

- Do not make consensus the only success condition.
- The final answer should be allowed to say: "The council does not fully agree."
- Include a synthesis format with majority view, minority report, confidence, unresolved assumptions, and recommended next test.
- Consider a neutral moderator or judge agent, but do not let it erase dissent.
- Use evidence checks, source requests, or external tools for factual/high-stakes questions.

## Consensus And Deliberation Methods Outside LLMs

### Delphi Method

The Delphi method is a structured expert-consensus process using multiple rounds, feedback, and a facilitator. It is especially useful when evidence is scarce or contested. Variants such as real-time Delphi show that feedback can be shown continuously rather than in slow survey rounds.

References:

- "How to use the nominal group and Delphi techniques" - https://link.springer.com/article/10.1007/s11096-016-0257-x
- "Consensus in the Delphi method: What makes a decision change?" - https://www.sciencedirect.com/science/article/pii/S004016252031310X
- Delphi method overview - https://en.wikipedia.org/wiki/Delphi_method

Implication for this app:

- A council session can borrow Delphi mechanics: independent first answers, structured feedback, revision rounds, and facilitator-led synthesis.
- The UI could show movement between positions across rounds.
- Consensus should be measured, not assumed. For example: unanimous, rough consensus, split decision, or unresolved.

### Nominal Group Technique

Nominal Group Technique emphasizes individual idea generation before group discussion and ranking. This is a strong antidote to early anchoring or majority pressure.

Implication for this app:

- First round should often be "silent independent drafting" before agents see each other's answers.
- Later rounds can reveal answers and allow critique.
- This gives the product a better epistemic foundation than starting with open debate immediately.

## Proposed Debate Mechanics To Explore Later

### Turn Lifecycle

Potential state machine:

1. User asks a question.
2. Moderator classifies the task: creative, strategic, factual, emotional, technical, ethical, etc.
3. Agents privately decide whether to participate and optionally produce an initial stance.
4. A round opens and the stick becomes available.
5. Participating agents request the stick.
6. The arbiter grants the stick based on fairness, relevance, urgency, or randomized order.
7. The speaker emits:
   - public answer contribution
   - optional action/stage direction
   - stance metadata
   - confidence
   - whether it wants another round
8. The round ends when all willing agents have spoken once or no agent requests the stick.
9. Moderator checks for convergence, contradiction, and missing evidence.
10. Repeat, synthesize, or close with a decision format.

### Closing Conditions

Possible ways to close a discussion:

- Consensus: all agents endorse the same conclusion.
- Rough consensus: no major objection remains, but caveats exist.
- Time/round cap: after N rounds, synthesize the best available view.
- User-directed stop: user asks for the final answer now.
- Moderator stop: debate is looping or degrading.
- Evidence stop: factual question requires outside verification before further debate.
- Split decision: final answer includes competing schools of thought.

### The "Action Field"

The action field is promising if kept tasteful and structured. It can make the council feel embodied and memorable without exposing hidden reasoning.

Suggested schema:

```json
{
  "speaker_id": "athena",
  "action": "leans forward, measured but firm",
  "utterance": "The missing question is not what you should do first, but what feedback loop will teach you fastest.",
  "stance": "prioritize experimentation",
  "confidence": 0.72
}
```

Design cautions:

- Keep actions short and bounded.
- Avoid theatrical noise overwhelming the answer.
- Let users disable stage directions.
- Treat action as public expression, not hidden chain-of-thought.

## Product Architecture Implications

Early conceptual components:

- Council configuration: agents, names, roles, providers, model IDs, temperature, tools, speaking style.
- Secret management: API keys from environment variables, local encrypted store, or 1Password integration.
- Session orchestration: turns, rounds, stick ownership, eligibility, abstention, moderation, stopping rules.
- Transcript model: user messages, agent utterances, action fields, stances, round summaries, final synthesis.
- UI: user chat area, council chamber/debate stream, current stick holder, agent roster, synthesis panel, configuration screen.
- Safety and reliability: rate limits, retries, token budgeting, provider failure handling, audit logs.

## 1Password Integration

1Password CLI supports secret references that can load secrets into environment variables, config files, and scripts without hardcoding plaintext secrets. This is likely the best optional integration path for a developer-focused local app.

References:

- 1Password CLI secret references - https://developer.1password.com/docs/cli/secret-references/
- 1Password developer overview - https://1password.com/developers

Possible product approach:

- Baseline: support environment variables like `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.
- Optional: allow config values to be 1Password secret references such as `op://vault/item/field`.
- Runtime: resolve via the `op` CLI only when enabled and available.
- UX: configuration screen can validate whether `op` is installed and signed in, but should not display resolved secrets.

Security principles:

- Never persist resolved provider keys in plaintext.
- Redact secrets from logs and transcripts.
- Keep provider-key access server-side or local-backend-side, not browser-side.
- Support per-agent provider configuration without duplicating secret values.

## npm Dependency Safety

If the frontend or local web app uses npm, package adoption should be treated as
a supply-chain security decision. The project constitution requires npm package
versions to be checked against a maintained vulnerability database before
adoption, pinned through a committed lockfile, and installed reproducibly with
`npm ci`.

Useful references:

- npm audit docs - https://docs.npmjs.com/cli/v11/commands/npm-audit/
- OSV.dev vulnerability database - https://osv.dev/

Recommended baseline:

- Before adopting a package, check the exact package version with `npm audit`,
  OSV.dev, or an equivalent maintained vulnerability database.
- Commit `package-lock.json` with exact resolved versions.
- Use `npm ci` for local verification and CI installation once the lockfile
  exists.
- Use `npm install` only when intentionally changing dependencies or refreshing
  the lockfile.
- Review package changes before commit, especially install scripts and new
  transitive dependencies.

## Spec Kit Relevance

GitHub Spec Kit is a toolkit for Spec-Driven Development. Its process is roughly: Spec -> Plan -> Tasks -> Implement. This fits the project well because the app has several risky conceptual areas: orchestration rules, UI metaphor, secret handling, provider abstraction, and debate stopping criteria.

References:

- Official Spec Kit docs - https://github.github.com/spec-kit/index.html
- Official GitHub repository - https://github.com/github/spec-kit

Recommended use:

- Start with a product constitution describing epistemic values: preserve dissent, cite uncertainty, avoid false consensus, protect secrets.
- Create the first feature spec around "single council session with local mock agents" before real provider integrations.
- Add real LLM provider integrations only after the turn protocol and transcript model are proven.

## Open Questions For Product Design

- Is the app primarily for personal strategy/coaching, technical problem solving, creative ideation, or all of these?
- Should the initial version run locally only, or be web-hosted?
- Should agents be predefined archetypes, user-created, or both?
- Should debate be visible live as it unfolds, or streamed in summarized chunks?
- How strict should the Greek speaking-stick metaphor be when a model has something urgent to correct?
- Should the final synthesis be written by a moderator agent, by a deterministic rule, or by a selected council member?
- How should the app handle high-stakes domains such as medical, legal, or financial advice?
- What should happen when one provider fails mid-session?

## Early Recommendation

Build the first version as a local-first web app with a mock-agent debate engine before wiring real provider APIs. The MVP should prove:

- the speaking-stick protocol is understandable,
- agents can abstain or participate,
- a transcript can preserve debate structure,
- the final synthesis can include dissent,
- configuration can model provider/API-key setup without exposing secrets.

Only after that should the app integrate live providers and 1Password resolution. This order protects the most original part of the product: the council deliberation experience.
