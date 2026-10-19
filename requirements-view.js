// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — requirements-view.js
 *
 * Renders a course's admissions requirements for the current cycle as
 * a structured panel (one row per category, each with its verification
 * status, last-verified date and source links). Pure: data in, HTML
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

  const STATUS_LABEL = { verified: 'Verified', partial: 'Partly verified', unverified: 'Not verified' };
  const NONE_TEXT = 'None listed on the official source';
  const UNVERIFIED_TEXT = 'Not verified — check the official source';

  /** @param {RequirementEntry['status']} status */
  function badgeHtml(status) {
    return `<span class="reqs__badge reqs__badge--${esc(status)}">${esc(STATUS_LABEL[status] ?? status)}</span>`;
  }

  /** @param {string} url */
  const isUrl = url => typeof url === 'string' && /^https?:\/\//i.test(url);

  /**
   * One category row.
   * @param {RequirementCategory} category
   * @param {RequirementEntry | undefined} entry
   * @param {string | null} fallbackUrl  official page to point unverified rows at
   */
  function rowHtml(category, entry, fallbackUrl) {
    const status = entry?.status ?? 'unverified';
    let body;
    if (!entry || status === 'unverified') {
      const check = fallbackUrl && isUrl(fallbackUrl)
        ? `Check the <a class="reqs__link" href="${esc(fallbackUrl)}" target="_blank" rel="noopener noreferrer">official course page</a>.`
        : 'Check with the university.';
      body = `
        <p class="reqs__meta">${badgeHtml('unverified')}</p>
        <p class="reqs__text reqs__text--muted">${check}</p>
        ${entry?.recorded ? `<p class="reqs__recorded">Previously recorded, not verified: ${esc(entry.recorded)}</p>` : ''}
        ${entry?.note ? `<p class="reqs__note">${esc(entry.note)}</p>` : ''}`;
    } else {
      const value = entry.none
        ? `<p class="reqs__text">${NONE_TEXT}</p>`
        : `<ul class="reqs__items">${(entry.items ?? []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
      const sources = (entry.sources ?? []).filter(s => isUrl(s.url)).map(s =>
        `<a class="reqs__link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label || 'Source')}</a>`).join(' · ');
      body = `
        ${value}
        <p class="reqs__meta">${badgeHtml(status)}<span class="reqs__date">${esc(formatDate(entry.lastVerified ?? ''))}</span>${sources ? `<span class="reqs__sources">${sources}</span>` : ''}</p>
        ${entry.note ? `<p class="reqs__note">${esc(entry.note)}</p>` : ''}`;
    }
    return `
      <div class="reqs__row reqs__row--${esc(status)}" data-req-category="${esc(category.id)}">
        <dt class="reqs__label">${esc(category.label)}</dt>
        <dd class="reqs__value">${body}</dd>
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
    return `
    <details class="reqs">
      <summary class="reqs__summary">
        <span class="reqs__title">Entry requirements</span>
        <span class="reqs__cycle">${esc(cycleLabel)}</span>
        <span class="reqs__tally">${verified} of ${categories.length} verified</span>
      </summary>
      <dl class="reqs__list">${rows}</dl>
      <p class="reqs__foot">Requirements change every year. Always confirm them on the university's official page before you apply.</p>
    </details>`;
  }

  /**
   * One-line plain text for an entry (CSV export, copy-to-clipboard).
   * @param {RequirementEntry | undefined} entry
   */
  function entryText(entry) {
    if (!entry || entry.status === 'unverified') return UNVERIFIED_TEXT;
    const value = entry.none ? NONE_TEXT : (entry.items ?? []).join('; ');
    const status = entry.status === 'partial' ? 'partly verified' : 'verified';
    return `${value} (${status} ${formatDate(entry.lastVerified ?? '')})`;
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

  const api = { panelHtml, entryText, recordFor, formatDate, STATUS_LABEL, NONE_TEXT, UNVERIFIED_TEXT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AltioraRequirementsView = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
