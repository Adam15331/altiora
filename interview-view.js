// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — interview-view.js
 *
 * Display of interview information (data/interviews.js) and the inputs of
 * Interview practice. Pure: data in, HTML / text out. Nothing here changes
 * any verdict.
 *
 * Every statement shown is the university's own words (a verbatim
 * sourceSnippet) with its source link. The only practice prompts are the
 * universities' published sample questions and ONE fixed template built
 * from the student's own story entry titles (storyPrompt).
 *
 * Browser: classic script, exposes `AltioraInterviewView`.
 * Node (tests): module.exports.
 * ═══════════════════════════════════════════════════════════════ */

(function (/** @type {any} */ root) {
  /** @param {unknown} s */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  /** @param {string} iso */
  const formatDate = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : ''; };

  const INTERVIEWED_LABEL = /** @type {Record<string, string>} */ ({
    yes: 'Yes', 'some applicants': 'Some applicants', optional: 'Optional', 'not published': 'Not published',
  });
  const UNAVAILABLE_TEXT = "Interview details aren't available from the university's site yet.";
  const EMPTY_PRACTICE_TEXT = 'Add some entries to your story to practise talking about them.';
  const PLAIN_TIMER_LABEL = "Practice timer (not the university's format)";
  const PLAIN_TIMER_SECONDS = 120;

  /** The ONLY prompt Altiora writes: the student's own entry, by title. @param {string} title */
  const storyPrompt = title => `Talk about “${title}”: what you did, and what it showed about you.`;

  /**
   * What a record says, for display:
   *   all — an interview, for any applicant (possibly by shortlist)
   *   term — recorded responses or a session the university does not call an interview (universityTerm)
   *   route — an interview for one route or group only (appliesTo)
   *   third-party — no university interview; accepts one through a provider (thirdPartyOnly)
   *   no — the university states it does not interview
   *   unavailable — not published / blocked
   * @param {any} r
   */
  const kindOf = r => (r.unavailable ? 'unavailable' : r.interviewed === 'no' ? (r.thirdPartyOnly ? 'third-party' : 'no')
    : r.appliesTo ? 'route' : r.universityTerm ? 'term' : 'all');
  const KIND_ORDER = ['all', 'term', 'route', 'third-party', 'no', 'unavailable'];

  /**
   * Everything known about one course's interview, merged across its records
   * (the subject record first, then any university-wide one). Only records of
   * the course's leading kind (KIND_ORDER) are merged, so an all-applicant
   * interview is never mixed with a route-limited one.
   * @param {any} data @param {string} courseId
   */
  function forCourse(data, courseId) {
    const ids = data?.courses?.[courseId];
    if (!ids) return null;
    const recs = ids.map((/** @type {string} */ id) => data.records[id]).filter(Boolean);
    const kind = KIND_ORDER.find(k => recs.some((/** @type {any} */ r) => kindOf(r) === k)) ?? 'unavailable';
    const avail = recs.filter((/** @type {any} */ r) => kindOf(r) === kind && kind !== 'unavailable');
    /** @param {string} f */
    const all = f => avail.map((/** @type {any} */ r) => r[f]).filter(Boolean);
    return {
      courseId,
      university: recs[0]?.university ?? '',
      kind,
      universityTerm: avail[0]?.universityTerm ?? null,
      // One line per distinct route (a subject record and a university-wide one often name the same route).
      // The Source link on a route line is the quote that names the route (appliesToEvidence) when there is one.
      // Quote mode (routeDisplay 'quote') shows that quote in full instead of the label; its link is the quote's.
      // routeQuoteParts (one or two exact parts of the quote) are shown instead of the whole, two joined by " … ".
      routes: kind === 'route' ? avail.map((/** @type {any} */ r) => {
        const quote = r.routeDisplay === 'quote' ? routeQuote(r) : null;
        const parts = quote && Array.isArray(r.routeQuoteParts) && r.routeQuoteParts.length ? r.routeQuoteParts.join(' … ') : null;
        return { appliesTo: r.appliesTo, university: r.university, quote: parts ?? quote?.sourceSnippet ?? null,
          source: quote?.source ?? r.appliesToEvidence?.[0]?.source ?? firstSource(r) };
      })
        .filter((/** @type {any} */ x, /** @type {number} */ i, /** @type {any[]} */ a) => a.findIndex(y => y.appliesTo === x.appliesTo) === i) : [],
      provider: avail[0]?.thirdPartyOnly ?? null,
      statementSources: [...new Set(avail.flatMap((/** @type {any} */ r) => [...(r.statement ?? []), ...(kind === 'third-party' ? [r.format, r.whatIsAssessed] : [])]
        .filter(Boolean).map((/** @type {any} */ e) => e.source)))],
      available: avail.length > 0,
      interviewed: avail[0]?.interviewed ?? 'not published',
      format: all('format'),
      stations: all('mmiStations'),
      length: all('numberAndLength'),
      assessed: all('whatIsAssessed'),
      prep: avail.flatMap((/** @type {any} */ r) => r.prepAdvice),
      // `university` on a question is who published it, as the practice view
      // shows after "Published by" (publishedBy in the data; the university
      // itself when absent).
      questions: avail.flatMap((/** @type {any} */ r) => r.sampleQuestions.map((/** @type {any} */ q) => ({ ...q, university: q.publishedBy ?? r.university }))),
      timing: avail.find((/** @type {any} */ r) => r.timing)?.timing ?? null,
      timingRecord: avail.find((/** @type {any} */ r) => r.timing) ?? null,
    };
  }

  /**
   * The quote that names a record's route: the first of its quotes (route evidence first) that contains the
   * full route wording. Null if none does (the validator requires one for quote mode).
   * @param {any} r
   */
  function routeQuote(r) {
    const quotes = [...(r.appliesToEvidence ?? []), ...['format', 'numberAndLength', 'mmiStations', 'whatIsAssessed'].map(f => r[f]), ...(r.prepAdvice ?? [])];
    return quotes.find(e => e && typeof e.sourceSnippet === 'string' && typeof r.appliesTo === 'string' && e.sourceSnippet.includes(r.appliesTo)) ?? null;
  }

  /** The first source a record quotes. @param {any} r */
  function firstSource(r) {
    const e = ['format', 'numberAndLength', 'mmiStations', 'whatIsAssessed'].map(f => r[f]).find(Boolean) ?? r.prepAdvice?.[0] ?? r.statement?.[0];
    return e?.source ?? null;
  }

  /**
   * Does the student have something to practise for at this course? Only an
   * all-applicant interview, or recorded responses under the university's own
   * term — never a route-limited, third-party, "no" or unavailable record.
   * @param {any} v
   */
  const interviews = v => !!v && v.available && (v.kind === 'all' || v.kind === 'term') && v.interviewed !== 'not published';

  /** A small "Source" link. @param {string} url */
  const sourceLink = url => `<a class="reqs__link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Source</a>`;
  /** @param {string[]} urls */
  const sourceLinks = urls => urls.map(sourceLink).join(' · ');
  /** "Personal Profile" stays as written; "conversation session" → "Conversation session". @param {string} t */
  const capFirst = t => t.charAt(0).toUpperCase() + t.slice(1);

  /** A quoted statement with its source link and the date it was read. @param {any} e */
  function quoteHtml(e) {
    const lines = String(e.sourceSnippet).split(' / ').map(esc).join('<br>');
    return `<li>“${lines}” <span class="reqs__meta-inline"><a class="reqs__link" href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">Source</a> · <span class="reqs__date">${esc(formatDate(e.accessed))}</span></span></li>`;
  }
  /** @param {string} label @param {any[]} items */
  const factList = (label, items) => items.length
    ? `<div class="reqs__fact"><dt>${esc(label)}</dt><dd><ul class="reqs__items">${items.map(quoteHtml).join('')}</ul></dd></div>` : '';

  /**
   * The Interview row for a course card's Entry requirements panel.
   * @param {any} v  forCourse(...) result
   * @param {{fallbackUrl?: string|null, practise?: boolean}} [opts]
   */
  function sectionHtml(v, { fallbackUrl = null, practise = false } = {}) {
    if (!v) return '';
    let body;
    let label = 'Interview';
    if (v.kind === 'route') {
      // Route-limited: who is interviewed, in the university's words. No practice.
      // Label mode names the route; quote mode gives the university's sentence in full (never shortened).
      body = v.routes.map((/** @type {any} */ r) => r.quote
        ? `<p class="reqs__text">Interviews some applicants. ${esc(r.university)} says: “${String(r.quote).split(' / ').map(esc).join('<br>')}” <span class="reqs__meta-inline">${r.source ? sourceLink(r.source) : ''}</span></p>`
        : `<p class="reqs__text">Interviews some applicants: ${esc(r.appliesTo)} <span class="reqs__meta-inline">${r.source ? sourceLink(r.source) : ''}</span></p>`).join('');
    } else if (v.kind === 'no') {
      body = `<p class="reqs__text">${esc(v.university)} states it does not interview for this course. <span class="reqs__meta-inline">${sourceLinks(v.statementSources)}</span></p>`;
    } else if (v.kind === 'third-party') {
      body = `<p class="reqs__text">No university interview. Accepts an interview through ${esc(v.provider)}. <span class="reqs__meta-inline">${sourceLinks(v.statementSources)}</span></p>`;
    } else if (v.kind === 'term') {
      // The university's own word, never "interview".
      label = capFirst(v.universityTerm);
      body = `<dl class="reqs__facts">
            ${factList('Format', v.format)}
            ${factList('Stations', v.stations)}
            ${factList('Number and length', v.length)}
            ${factList('How to prepare', v.prep)}
          </dl>${practise && interviews(v) ? `
          <button type="button" class="home-next__btn iv-practise-link" data-iv-practise="${esc(v.courseId)}">Practise for the ${esc(v.universityTerm)}</button>` : ''}`;
    } else if (!v.available) {
      // Never implies there is no interview: we could not read the university's page.
      const check = fallbackUrl && /^https?:\/\//i.test(fallbackUrl)
        ? `Check the <a class="reqs__link" href="${esc(fallbackUrl)}" target="_blank" rel="noopener noreferrer">course page</a>.`
        : 'Check the course page.';
      body = `<p class="reqs__text reqs__text--muted">${esc(UNAVAILABLE_TEXT)} ${check}</p>`;
    } else {
      body = `<dl class="reqs__facts">
            <div class="reqs__fact"><dt>Interviewed</dt><dd>${esc(INTERVIEWED_LABEL[v.interviewed] ?? v.interviewed)}</dd></div>
            ${factList('Format', v.format)}
            ${factList('Stations', v.stations)}
            ${factList('Number and length', v.length)}
            ${factList('How to prepare', v.prep)}
          </dl>${practise && interviews(v) ? `
          <button type="button" class="home-next__btn iv-practise-link" data-iv-practise="${esc(v.courseId)}">Practise interview questions</button>` : ''}`;
    }
    return `
      <div class="reqs__row reqs__row--interview" data-req-category="interview">
        <dt class="reqs__label">${esc(label)}</dt>
        <dd class="reqs__value">
          <div class="reqs__body">${body}</div>
        </dd>
      </div>`;
  }

  /**
   * Plain text of a published question for display. Text is never reworded:
   * simple inline maths (\(n\), \(7~1~9\), \(k < n\)) shows its characters,
   * with the LaTeX delimiters dropped. If any maths needs real typesetting
   * (\frac, \sqrt, subscripts…), `readable` is false and the view links to
   * the source page instead. " / " (a paragraph break in the data) becomes a
   * line break.
   * @param {string} question
   */
  function plainText(question) {
    let readable = true;
    const text = String(question).replace(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g, (_m, a, b) => {
      const inner = String(a ?? b).replace(/~/g, ' ').replace(/\s+/g, ' ').trim();
      if (!/^[A-Za-z0-9 +\-=<>.,()]*$/.test(inner)) readable = false;
      return inner;
    });
    if (/\\[a-zA-Z]/.test(text)) readable = false;
    return { readable, lines: text.split(' / ') };
  }

  /** @param {number} s */
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const api = {
    forCourse, interviews, kindOf, routeQuote, sectionHtml, storyPrompt, plainText, mmss, formatDate,
    INTERVIEWED_LABEL, UNAVAILABLE_TEXT, EMPTY_PRACTICE_TEXT, PLAIN_TIMER_LABEL, PLAIN_TIMER_SECONDS,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AltioraInterviewView = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
