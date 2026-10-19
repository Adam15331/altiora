// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — requirements-view.js
 *
 * Renders a course's admissions requirements for the current cycle as
 * a structured panel: one card per category, tinted by its verification
 * status, with the requirement as a list and a footer carrying the
 * status badge, last-verified date and source links. Qualification
 * categories (A-Level, IB) render their structured fields — grades or
 * points, subjects, detail — as a small definition list in the row. Pure: data in, HTML
 * out — no requirement value or category label lives here; they come
 * from data/requirements/config.js and the cycle data files.
 *
 * Browser: classic script, exposes `AltioraRequirementsView`.
 * Node (tests): module.exports.
 * ═══════════════════════════════════════════════════════════════ */

/** @typedef {import('./data/requirements/config.js').RequirementsConfig} RequirementsConfig */
/** @typedef {import('./data/requirements/config.js').RequirementEntry} RequirementEntry */
/** @typedef {import('./data/requirements/config.js').CourseRequirementRecord} CourseRequirementRecord */
/** @typedef {import('./data/requirements/config.js').RequirementCategory} RequirementCategory */

(function (/** @type {any} */ root) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /** @param {unknown} s */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /** "2026-08-16" → "16 Aug 2026" (locale-independent, so output is stable). @param {string} iso */
  function formatDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : '';
  }

  const STATUS_LABEL = { verified: 'Verified', partial: 'Partly verified', unverified: 'Not verified', notApplicable: 'Not applicable' };
  const NONE_TEXT = 'None listed on the official source';
  const UNVERIFIED_TEXT = 'Not verified — check the official source';
  const NOT_APPLICABLE_TEXT = 'Not an entry route for this course';
  const NOT_RECORDED_TEXT = 'Not recorded';
  const WITHHELD_TEXT = 'Not shown — see note';

  // Structured fields of a qualification entry, in display order.
  /** @type {Array<[keyof RequirementEntry | string, string]>} */
  const SUBJECT_FACTS = [
    ['required', 'Required subjects'],
    ['preferred', 'Preferred subjects'],
    ['higherLevel', 'Higher Level'],
    ['standardLevel', 'Standard Level'],
    ['excluded', 'Not accepted'],
  ];
  /** @type {Array<[keyof RequirementEntry, string]>} */
  const TEXT_FACTS = [
    ['ucasTariff', 'UCAS points'],
    ['detail', 'Details'],
    ['practicalEndorsement', 'Practical endorsement'],
    ['contextualOffer', 'Contextual offer'],
    ['coreNote', 'TOK / EE / CAS'],
    ['testsInterview', 'Tests / interview'],
  ];

  /** @param {RequirementEntry['status']} status */
  function badgeHtml(status) {
    return `<span class="reqs__badge reqs__badge--${esc(status)}">${esc(STATUS_LABEL[status] ?? status)}</span>`;
  }

  /** @param {string} url */
  const isUrl = url => typeof url === 'string' && /^https?:\/\//i.test(url);

  /** @param {RequirementEntry} entry */
  function sourcesHtml(entry) {
    return (entry.sources ?? []).filter(s => isUrl(s.url)).map(s =>
      `<a class="reqs__link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label || 'Source')}</a>`).join(' · ');
  }

  /** Card footer: badge, date and sources for a checked entry. @param {RequirementEntry} entry */
  function metaHtml(entry) {
    const sources = sourcesHtml(entry);
    return `<div class="reqs__meta">${badgeHtml(entry.status)}<span class="reqs__date">${esc(formatDate(entry.lastVerified ?? ''))}</span>${sources ? `<span class="reqs__sources">${sources}</span>` : ''}</div>`;
  }

  /** Split on "; " outside parentheses, so "(min 720 RW; 650 M)" stays whole. @param {string} s */
  function splitTopLevel(s) {
    const parts = [];
    let depth = 0, start = 0;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      else if (ch === ';' && s[i + 1] === ' ' && depth === 0) { parts.push(s.slice(start, i)); start = i + 2; }
    }
    parts.push(s.slice(start));
    return parts.map(x => x.trim()).filter(Boolean);
  }

  /**
   * One requirement item. Presentation only — the words are the data's:
   * a short "Label: value" item shows its label in bold, and a value that
   * lists several things ("IELTS 7.5; TOEFL 102; …") becomes a sub-list.
   * @param {string} item
   */
  function itemHtml(item) {
    const m = /^([^:;()]{2,48}): (.+)$/s.exec(item);
    if (!m) return `<li>${esc(item)}</li>`;
    const [, label, value] = m;
    const parts = splitTopLevel(value);
    const body = parts.length > 1
      ? `<ul class="reqs__sublist">${parts.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
      : ` ${esc(value)}`;
    return `<li><span class="reqs__item-label">${esc(label)}:</span>${body}</li>`;
  }

  /** @param {string} label @param {string} valueHtml @param {boolean} [muted] */
  const factHtml = (label, valueHtml, muted = false) =>
    `<div class="reqs__fact"><dt>${esc(label)}</dt><dd${muted ? ' class="reqs__fact-empty"' : ''}>${valueHtml}</dd></div>`;

  /**
   * The grade / points line: the held value, or an explicit "not recorded"
   * / "not shown" — absent data never renders as if it were a value.
   * @param {RequirementCategory} category @param {RequirementEntry} entry
   */
  function scoreFact(category, entry) {
    const label = category.scoreLabel ?? 'Grades';
    if (entry.typicalOffer) return factHtml(label, esc(entry.typicalOffer));
    if (entry.overallScore != null) return factHtml(label, `${esc(entry.overallScore)} points`);
    const withheld = (entry.withheld ?? []).some(w => w === 'typicalOffer' || w === 'overallScore');
    return factHtml(label, withheld ? WITHHELD_TEXT : NOT_RECORDED_TEXT, true);
  }

  /** @param {RequirementCategory} category @param {RequirementEntry} entry */
  function qualificationFactsHtml(category, entry) {
    const facts = [scoreFact(category, entry)];
    const subjects = /** @type {Record<string, Array<{name: string}>>} */ (entry.subjects ?? {});
    for (const [group, label] of SUBJECT_FACTS) {
      const list = subjects[/** @type {string} */ (group)];
      if (list?.length) facts.push(factHtml(label, esc(list.map(x => x.name).join(', '))));
    }
    for (const [key, label] of TEXT_FACTS) {
      const v = entry[key];
      if (typeof v === 'string' && v) facts.push(factHtml(label, esc(v)));
      else if (key === 'detail' && entry.withheld?.includes('detail')) facts.push(factHtml(label, WITHHELD_TEXT, true));
    }
    return `<dl class="reqs__facts">${facts.join('')}</dl>`;
  }

  /**
   * One category row.
   * @param {RequirementCategory} category
   * @param {RequirementEntry | undefined} entry
   * @param {string | null} fallbackUrl  official page to point unverified rows at
   */
  function rowHtml(category, entry, fallbackUrl) {
    const status = entry?.status ?? 'unverified';
    const note = entry?.note ? `<p class="reqs__note">${esc(entry.note)}</p>` : '';
    let content, footer;
    if (!entry || status === 'unverified') {
      const check = fallbackUrl && isUrl(fallbackUrl)
        ? `Check the <a class="reqs__link" href="${esc(fallbackUrl)}" target="_blank" rel="noopener noreferrer">official course page</a>.`
        : 'Check with the university.';
      content = `
          <p class="reqs__text reqs__text--muted">${check}</p>
          ${entry?.recorded ? `<p class="reqs__recorded">Previously recorded, not verified: ${esc(entry.recorded)}</p>` : ''}`;
      footer = `<div class="reqs__meta">${badgeHtml('unverified')}</div>`;
    } else if (status === 'notApplicable') {
      content = `<p class="reqs__text">${NOT_APPLICABLE_TEXT}</p>`;
      footer = metaHtml(entry);
    } else {
      content = category.kind === 'qualification'
        ? qualificationFactsHtml(category, entry)
        : entry.none
          ? `<p class="reqs__text">${NONE_TEXT}</p>`
          : `<ul class="reqs__items">${(entry.items ?? []).map(itemHtml).join('')}</ul>`;
      footer = metaHtml(entry);
    }
    return `
      <div class="reqs__row reqs__row--${esc(status)}" data-req-category="${esc(category.id)}">
        <dt class="reqs__label">${esc(category.label)}</dt>
        <dd class="reqs__value">
          <div class="reqs__body">${content}
          ${note}</div>
          ${footer}
        </dd>
      </div>`;
  }

  /**
   * The full panel.
   * @param {object} p
   * @param {CourseRequirementRecord | null | undefined} p.record
   * @param {RequirementCategory[]} p.categories
   * @param {string} p.cycleLabel        e.g. "2027 entry"
   * @param {string | null} [p.fallbackUrl]
   */
  function panelHtml({ record, categories, cycleLabel, fallbackUrl = null }) {
    const rows = categories.map(cat => rowHtml(cat, record?.[cat.id], fallbackUrl)).join('');
    const verified = categories.filter(cat => record?.[cat.id]?.status === 'verified').length;
    // A qualification that is not an entry route has nothing to verify.
    const applicable = categories.filter(cat => record?.[cat.id]?.status !== 'notApplicable').length;
    return `
    <details class="reqs">
      <summary class="reqs__summary">
        <span class="reqs__title">Entry requirements</span>
        <span class="reqs__cycle">${esc(cycleLabel)}</span>
        <span class="reqs__tally">${verified} of ${applicable} verified</span>
      </summary>
      <dl class="reqs__list">${rows}</dl>
      <p class="reqs__foot">Requirements change every year. Always confirm them on the university's official page before you apply.</p>
    </details>`;
  }

  /**
   * The value of a checked entry as one line, without its status (shared
   * by entryText and the new-cycle carry-forward).
   * @param {RequirementEntry} entry
   */
  function entryValue(entry) {
    if (entry.status === 'notApplicable') return `Not applicable — ${entry.note ?? NOT_APPLICABLE_TEXT}`;
    if (entry.none) return NONE_TEXT;
    if (entry.items) return entry.items.join('; ');
    const parts = [];
    if (entry.typicalOffer) parts.push(entry.typicalOffer);
    if (entry.overallScore != null) parts.push(`${entry.overallScore} points`);
    const subjects = /** @type {Record<string, Array<{name: string}>>} */ (entry.subjects ?? {});
    for (const [group, label] of SUBJECT_FACTS) {
      const list = subjects[/** @type {string} */ (group)];
      if (list?.length) parts.push(`${label}: ${list.map(x => x.name).join(', ')}`);
    }
    for (const [key, label] of TEXT_FACTS) {
      const v = entry[key];
      if (typeof v === 'string' && v) parts.push(`${label}: ${v}`);
    }
    return parts.join('; ') || (entry.accepted === 'yes' ? 'Accepted' : '');
  }

  /**
   * One-line plain text for an entry (CSV export, copy-to-clipboard).
   * @param {RequirementEntry | undefined} entry
   */
  function entryText(entry) {
    if (!entry || entry.status === 'unverified') return UNVERIFIED_TEXT;
    const status = entry.status === 'partial' ? 'partly verified' : entry.status === 'notApplicable' ? 'checked' : 'verified';
    return `${entryValue(entry)} (${status} ${formatDate(entry.lastVerified ?? '')})`;
  }

  /**
   * Look up a course's record in a cycle registry.
   * @param {Record<string, {courses: Record<string, CourseRequirementRecord>}>} cycles
   * @param {string} cycleId @param {string} courseId
   * @returns {CourseRequirementRecord | null}
   */
  function recordFor(cycles, cycleId, courseId) {
    return cycles?.[cycleId]?.courses?.[courseId] ?? null;
  }

  const api = { panelHtml, entryText, entryValue, recordFor, formatDate, STATUS_LABEL, NONE_TEXT, UNVERIFIED_TEXT, NOT_APPLICABLE_TEXT, NOT_RECORDED_TEXT, WITHHELD_TEXT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AltioraRequirementsView = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
