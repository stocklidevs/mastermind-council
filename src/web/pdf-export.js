export function buildCurrentConsultationExport({ mode, mentors = [], sessionSettings = {}, exchange } = {}) {
  const createdAt = new Date().toISOString();
  return {
    title: exchange?.question || 'Mastermind consultation',
    mode,
    createdAt,
    updatedAt: createdAt,
    mentors: mentors.map(publicMentor),
    sessionSettings: publicSessionSettings(sessionSettings),
    exchanges: exchange ? [publicExchange(exchange, createdAt)] : []
  };
}

export function buildConsultationPdfHtml(record = {}) {
  const title = record.title || record.exchanges?.[0]?.question || 'Mastermind consultation';
  const updatedAt = record.updatedAt || record.createdAt || new Date().toISOString();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - Mastermind Export</title>
  <style>${printCss()}</style>
</head>
<body>
  <main class="export-print">
    <header class="export-header">
      <p class="eyebrow">Mastermind council export</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(record.mode || 'session')} - ${escapeHtml(formatDate(updatedAt))}</p>
      <button type="button" class="print-button" onclick="window.print()">Save as PDF</button>
    </header>
    ${renderMentors(record.mentors)}
    ${(record.exchanges ?? []).map(renderExchange).join('')}
  </main>
</body>
</html>`;
}

function publicMentor(mentor) {
  return {
    name: mentor.name,
    role: mentor.role,
    providerId: mentor.providerId,
    modelId: mentor.modelId
  };
}

function publicSessionSettings(settings) {
  return {
    maxTurns: settings.maxTurns,
    synthesisProviderId: settings.synthesisProviderId,
    synthesisModelId: settings.synthesisModelId
  };
}

function publicExchange(exchange, createdAt) {
  return {
    question: exchange.question,
    createdAt: exchange.createdAt || createdAt,
    transcript: exchange.transcript ?? [],
    synthesis: exchange.synthesis ?? null
  };
}

function renderMentors(mentors = []) {
  if (!mentors.length) return '';
  return `
    <section class="export-section">
      <h2>Council</h2>
      <ul class="mentor-list">
        ${mentors
          .map(
            (mentor) =>
              `<li><strong>${escapeHtml(mentor.name)}</strong> - ${escapeHtml(mentor.role)}${renderModelLabel(mentor)}</li>`
          )
          .join('')}
      </ul>
    </section>`;
}

function renderModelLabel(mentor) {
  const provider = mentor.providerId ? ` / ${mentor.providerId}` : '';
  const model = mentor.modelId ? ` ${mentor.modelId}` : '';
  return provider || model ? `<span>${escapeHtml(`${provider}${model}`)}</span>` : '';
}

function renderExchange(exchange, index) {
  return `
    <section class="exchange">
      <h2>Exchange ${index + 1}</h2>
      <section class="export-section">
        <h3>Question</h3>
        <p>${escapeHtml(exchange.question)}</p>
      </section>
      ${renderTranscript(exchange.transcript)}
      ${renderSynthesis(exchange.synthesis)}
    </section>`;
}

function renderTranscript(items = []) {
  if (!items.length) return '';
  return `
    <section class="export-section">
      <h3>Deliberation</h3>
      ${items.map(renderTranscriptItem).join('')}
    </section>`;
}

function renderTranscriptItem(item) {
  const speaker = item.speakerName || item.mentorName || item.speaker || 'Council';
  const utterance = item.utterance || item.text || item.reason || '';
  return `
    <article class="transcript-item">
      <h4>${escapeHtml(speaker)}</h4>
      ${item.preAction ? `<p class="stage">${escapeHtml(item.preAction)}</p>` : ''}
      ${item.action ? `<p class="stage">${escapeHtml(item.action)}</p>` : ''}
      ${utterance ? `<p>${escapeHtml(utterance)}</p>` : ''}
      ${item.postAction ? `<p class="stage after">${escapeHtml(item.postAction)}</p>` : ''}
    </article>`;
}

function renderSynthesis(synthesis) {
  if (!synthesis) return '';
  return `
    <section class="export-section synthesis-export">
      <h3>Synthesis</h3>
      ${synthesis.agreementState ? `<p class="state">${escapeHtml(synthesis.agreementState)}</p>` : ''}
      ${synthesis.mainAnswer ? `<p>${escapeHtml(synthesis.mainAnswer)}</p>` : ''}
      ${renderList('Next actions', synthesis.nextActions)}
      ${renderList('Minority view', synthesis.minorityViews)}
      ${renderList('Assumptions', synthesis.assumptions)}
      ${renderGrounding(synthesis.mentorGrounding)}
      ${renderList('Unresolved questions', synthesis.unresolvedQuestions)}
      ${renderList('Verification guidance', synthesis.verificationGuidance)}
    </section>`;
}

function renderList(title, items = []) {
  if (!items.length) return '';
  return `
    <section>
      <h4>${escapeHtml(title)}</h4>
      <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </section>`;
}

function renderGrounding(items = []) {
  if (!items.length) return '';
  return `
    <section>
      <h4>Mentor grounding</h4>
      <ul>
        ${items
          .map((item) => `<li><strong>${escapeHtml(item.mentorName)}</strong>: ${escapeHtml(item.point)}</li>`)
          .join('')}
      </ul>
    </section>`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function printCss() {
  return `
    body {
      margin: 0;
      color: #1b1d1f;
      background: #f7f4ee;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    .export-print {
      max-width: 820px;
      margin: 0 auto;
      padding: 34px;
      background: #fffdf8;
    }
    .export-header,
    .export-section,
    .transcript-item {
      border: 1px solid #ddd4c6;
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 16px;
      break-inside: avoid;
    }
    .eyebrow {
      color: #9d7a3d;
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1, h2, h3, h4, p {
      margin-top: 0;
    }
    h1 {
      font-size: 1.8rem;
    }
    h2 {
      margin-top: 24px;
    }
    .mentor-list,
    ul {
      padding-left: 20px;
    }
    .mentor-list span,
    .stage,
    .state {
      color: #6d7378;
    }
    .stage {
      font-style: italic;
    }
    .after {
      margin-bottom: 0;
    }
    .print-button {
      border: 1px solid #9d7a3d;
      border-radius: 6px;
      padding: 8px 12px;
      color: #fffaf0;
      background: #9d7a3d;
      cursor: pointer;
      font-weight: 800;
    }
    @media print {
      body {
        background: #fff;
      }
      .export-print {
        max-width: none;
        padding: 0;
      }
      .print-button {
        display: none;
      }
    }
  `;
}
