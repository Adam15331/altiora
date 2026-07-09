/* ═══════════════════════════════════════════════════════════════
 * ASK ALTIORA — minimal real-AI proving feature (Stage 1).
 *
 * A question box on the Applying view. The browser never talks to the AI
 * provider and never sees an API key: it POSTs {question, context} to our
 * own Netlify edge function (/api/ask), which holds the key server-side
 * and streams back sanitized text deltas as Server-Sent Events.
 *
 * Grounding: alongside the question we send the student's own profile
 * (system, subjects, grades, kept fields, shortlist) plus the relevant
 * verified course data, selected here from the already-loaded dataset.
 * The system prompt (server-side, can't be stripped by a client) forbids
 * the model from inventing requirements/deadlines/statistics beyond it.
 * ═══════════════════════════════════════════════════════════════ */

// Where the relay lives. Same-origin /api/ask when the app is hosted on
// Netlify (recommended). If the static site stays on GitHub Pages, set the
// Netlify site URL here (or define window.ALTIORA_AI_ENDPOINT before this
// script) so Pages can call the function cross-origin.
const ASK_NETLIFY_SITE = ''; // e.g. 'https://altiora.netlify.app'

function askEndpoint() {
  if (typeof window.ALTIORA_AI_ENDPOINT === 'string') return window.ALTIORA_AI_ENDPOINT;
  const h = location.hostname;
  const isStaticMirror = location.protocol === 'file:' || h.endsWith('.github.io');
  if (isStaticMirror) return ASK_NETLIFY_SITE ? ASK_NETLIFY_SITE + '/api/ask' : null;
  return '/api/ask';
}

/* ── Grounding context (client-side selection, server-side rules) ── */

// Compact projection of a course row — just what grounded answers need.
function askCourseRow(c) {
  return {
    name: c.name,
    university: c.university,
    country: c.country,
    degreeLevel: c.degreeLevel,
    field: (typeof CATEGORY_LABEL_MAP !== 'undefined' && CATEGORY_LABEL_MAP[c.category]) || c.category,
    typicalGrades: {
      aLevels: c.grades?.aLevels ?? null,
      ib: c.grades?.ib ?? null,
      sgALevels: c.grades?.sgALevels ?? null,
      hkDse: c.grades?.hkDse ?? null,
      ibHigherLevelSubjects: c.grades?.ibHL?.length ? c.grades.ibHL : null,
    },
    subjectsRequired: c.requirements?.essential ?? [],
    subjectsPreferred: c.requirements?.preferred ?? [],
    admissionTests: Array.isArray(c.admissionTests) ? c.admissionTests : [],
    ranking: c.universityContext?.tier ?? null,
    verification: c.verification?.status ?? 'unverified',
    notes: c.notes ? String(c.notes).slice(0, 300) : null,
  };
}

// Courses the question plausibly refers to: any 4+ letter word from a
// university/course name appearing in the question, or an exact acronym
// (MIT, UCL, NUS…) appearing as an uppercase token.
const ASK_STOPWORDS = new Set(['university', 'college', 'school', 'institute', 'with', 'studies', 'bachelor', 'national']);

function askMatchCourses(question, exclude) {
  if (typeof courses === 'undefined') return [];
  const q = ' ' + question.toLowerCase() + ' ';
  const qTokens = new Set(question.split(/[^A-Za-z]+/).filter(Boolean));
  const seen = new Set();
  const out = [];
  for (const c of courses) {
    if (exclude.has(c.id)) continue;
    const uni = `${c.university} ${c.name}`;
    const words = uni.toLowerCase().split(/[^a-z]+/)
      .filter(w => w.length >= 4 && !ASK_STOPWORDS.has(w));
    const acronyms = uni.split(/[^A-Za-z]+/).filter(w => w.length >= 2 && w === w.toUpperCase());
    const hit = words.find(w => q.includes(w)) || acronyms.find(a => qTokens.has(a));
    if (hit) {
      const key = c.university + '|' + c.category;
      if (!seen.has(key)) { seen.add(key); out.push(c); }
    }
  }
  return out;
}

function buildAskContext(question) {
  const profile = (typeof AltioraState !== 'undefined') ? AltioraState.getProfile() : {};
  const candidateFields = (typeof AltioraState !== 'undefined') ? AltioraState.getCandidateFields() : [];
  const shortlistIds = (typeof AltioraState !== 'undefined') ? AltioraState.getShortlist() : [];

  const shortlistCourses = shortlistIds
    .map(id => (typeof courses !== 'undefined') ? courses.find(c => c.id === id) : null)
    .filter(Boolean);

  const excluded = new Set(shortlistCourses.map(c => c.id));
  const matched = askMatchCourses(question, excluded);

  // Shortlist always included; question-matched fill the remaining budget.
  const MAX_COURSES = 20;
  const rows = shortlistCourses.slice(0, MAX_COURSES).map(askCourseRow);
  for (const c of matched) {
    if (rows.length >= MAX_COURSES) break;
    rows.push(askCourseRow(c));
  }

  const fieldLabels = candidateFields.map(id =>
    (typeof CATEGORY_LABEL_MAP !== 'undefined' && CATEGORY_LABEL_MAP[id]) || id);

  return {
    student: {
      qualificationSystem: profile.qualificationSystem || null,
      subjects: Array.isArray(profile.subjects) ? profile.subjects : [],
      predictedGrades: profile.predictedGrades || null,
      stage: profile.stage || null,
      fieldsKept: fieldLabels,
      shortlistCount: shortlistIds.length,
    },
    courses: rows,
    dataNote: rows.length
      ? 'Courses above are from Altiora’s verified dataset (verification field per course).'
      : 'No matching course data was found for this question in Altiora’s dataset.',
  };
}

/* ── UI ─────────────────────────────────────────────────────────── */

// Markup injected by renderApplyingPanel (re-rendered freely; events are
// delegated at the document level so nothing needs re-wiring).
function askAltioraHtml() {
  return `
    <section class="applying-section ask-altiora" aria-label="Ask Altiora">
      <h2 class="applying-section__head">Ask Altiora</h2>
      <p class="ask-altiora__sub">Ask anything about your subjects, courses, or applications —
        answers use your own profile and Altiora&rsquo;s verified course data.</p>
      <div class="ask-altiora__box">
        <textarea id="askInput" class="ask-altiora__input" rows="2" maxlength="2000"
          placeholder="e.g. Given my subjects and grades, is Imperial realistic?"></textarea>
        <button type="button" id="askSend" class="fo-btn fo-btn--primary ask-altiora__send">Ask →</button>
      </div>
      <div id="askAnswer" class="ask-altiora__answer hidden" aria-live="polite"></div>
      <p class="ask-altiora__disclaimer">AI guidance based on your profile and Altiora&rsquo;s verified data —
        it can make mistakes and it isn&rsquo;t a guarantee. Always confirm requirements and deadlines with the
        university&rsquo;s official pages.</p>
    </section>`;
}

let _askBusy = false;
let _askAbort = null;

async function askAltiora() {
  const input  = document.getElementById('askInput');
  const answer = document.getElementById('askAnswer');
  const send   = document.getElementById('askSend');
  if (!input || !answer || _askBusy) return;

  const question = input.value.trim();
  if (!question) { input.focus(); return; }

  const endpoint = askEndpoint();
  answer.classList.remove('hidden');

  if (!endpoint) {
    answer.textContent = 'The AI assistant isn’t available on this copy of Altiora yet.';
    return;
  }

  _askBusy = true;
  _askAbort = new AbortController();
  if (send) { send.disabled = true; send.textContent = 'Thinking…'; }
  answer.textContent = '';
  answer.classList.add('ask-altiora__answer--streaming');

  let gotText = false;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context: buildAskContext(question) }),
      signal: _askAbort.signal,
    });
    if (!res.ok || !res.body) throw new Error('bad response');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line.startsWith('data:')) continue;
        let evt;
        try { evt = JSON.parse(line.slice(5).trim()); } catch { continue; }
        // If the panel re-rendered mid-stream, the answer node is orphaned —
        // stop cleanly rather than writing into a detached element.
        if (!document.getElementById('askAnswer')) { _askAbort.abort(); return; }
        if (evt.t) {
          gotText = true;
          answer.textContent += evt.t;
        } else if (evt.error) {
          answer.textContent = gotText ? answer.textContent + '\n\n' + evt.error : evt.error;
        }
      }
    }
  } catch (err) {
    if (err?.name !== 'AbortError' && !gotText) {
      answer.textContent = 'Sorry — the assistant couldn’t be reached. Check your connection and try again.';
    }
  } finally {
    _askBusy = false;
    answer.classList.remove('ask-altiora__answer--streaming');
    const sendNow = document.getElementById('askSend');
    if (sendNow) { sendNow.disabled = false; sendNow.textContent = 'Ask →'; }
  }
}

// Delegated wiring — survives every innerHTML re-render of the panel.
document.addEventListener('click', (e) => {
  if (e.target.closest && e.target.closest('#askSend')) askAltiora();
});
document.addEventListener('keydown', (e) => {
  if (e.target?.id === 'askInput' && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    askAltiora();
  }
});
