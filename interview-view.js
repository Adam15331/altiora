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
   * Everything known about one course's interview, merged across its records
   * (the subject record first, then any university-wide one).
   * @param {any} data @param {string} courseId
   */
  function forCourse(data, courseId) {
    const ids = data?.courses?.[courseId];
    if (!ids) return null;
    const recs = ids.map((/** @type {string} */ id) => data.records[id]).filter(Boolean);
    const avail = recs.filter((/** @type {any} */ r) => !r.unavailable);
    /** @param {string} f */
    const all = f => avail.map((/** @type {any} */ r) => r[f]).filter(Boolean);
    return {
      courseId,
      university: recs[0]?.university ?? '',
      available: avail.length > 0,
      interviewed: avail[0]?.interviewed ?? 'not published',
      format: all('format'),
      stations: all('mmiStations'),
      length: all('numberAndLength'),
      assessed: all('whatIsAssessed'),
      prep: avail.flatMap((/** @type {any} */ r) => r.prepAdvice),
      questions: avail.flatMap((/** @type {any} */ r) => r.sampleQuestions.map((/** @type {any} */ q) => ({ ...q, university: r.university }))),
      timing: avail.find((/** @type {any} */ r) => r.timing)?.timing ?? null,
      timingRecord: avail.find((/** @type {any} */ r) => r.timing) ?? null,
    };
  }

  /** Does the student have something to practise for at this course? @param {any} v */
  const interviews = v => !!v && v.available && v.interviewed !== 'not published';

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
    if (!v.available) {
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
          <button type="button" class="applying-task__link iv-practise-link" data-iv-practise="${esc(v.courseId)}">Practise for this interview →</button>` : ''}`;
    }
    return `
      <div class="reqs__row reqs__row--interview" data-req-category="interview">
        <dt class="reqs__label">Interview</dt>
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
    forCourse, interviews, sectionHtml, storyPrompt, plainText, mmss, formatDate,
    INTERVIEWED_LABEL, UNAVAILABLE_TEXT, EMPTY_PRACTICE_TEXT, PLAIN_TIMER_LABEL, PLAIN_TIMER_SECONDS,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AltioraInterviewView = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
