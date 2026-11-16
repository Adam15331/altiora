// @ts-check
/* Validation of data/interviews.js (display-only interview information).
 * Every evidence value must carry an official https source, the ISO date it
 * was read (not in the future) and a non-empty verbatim sourceSnippet — the
 * same provenance rule requirement rows follow. Also checks the course map,
 * the interviewed values, the stated timings (their quote must be in the
 * snippet they cite) and that no excluded source is used.
 * Every record that states something — an interview, a route, a university
 * term, a third-party provider or "no" — needs evidence with provenance;
 * only unavailable ("not published") records carry none. */
import { isIsoDate } from './validate-requirements.mjs';

/** @typedef {{level: 'error'|'warning', where: string, message: string}} Problem */

export const INTERVIEWED = ['yes', 'some applicants', 'optional', 'no', 'not published'];
const EVIDENCE_FIELDS = ['format', 'numberAndLength', 'mmiStations', 'whatIsAssessed'];
const STALE_DAYS = 548;   // ~18 months, as for requirement rows

/** @param {string} a @param {string} b */
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

/**
 * @param {any} data  interviewData
 * @param {{courses: Array<{id: string}>, today: string}} ctx
 * @returns {Problem[]}
 */
export function validateInterviews(data, { courses, today }) {
  /** @type {Problem[]} */
  const out = [];
  const err = (/** @type {string} */ where, /** @type {string} */ message) => out.push({ level: 'error', where, message });
  if (!data || typeof data !== 'object' || !data.records || !data.courses) {
    err('data/interviews.js', 'missing records or courses');
    return out;
  }
  const excluded = new Set((data.excludedSources ?? []).map((/** @type {any} */ e) => e.url));
  const known = new Set(courses.map(c => c.id));

  /** @param {any} e @param {string} where */
  const evidence = (e, where) => {
    if (!e || typeof e !== 'object') { err(where, 'evidence must be an object'); return; }
    if (typeof e.source !== 'string' || !/^https:\/\/[^\s]+$/.test(e.source)) err(where, 'needs an https source URL');
    if (!isIsoDate(e.accessed)) err(where, 'needs an accessed date (YYYY-MM-DD)');
    else if (e.accessed > today) err(where, `accessed date ${e.accessed} is in the future`);
    else if (daysBetween(e.accessed, today) > STALE_DAYS) out.push({ level: 'warning', where, message: `read on ${e.accessed}, over 18 months ago — re-check the source` });
    if (typeof e.sourceSnippet !== 'string' || !e.sourceSnippet.trim()) err(where, 'needs a verbatim sourceSnippet');
    if (excluded.has(e.source)) err(where, `uses an excluded source: ${e.source}`);
  };

  const used = new Set();
  const qids = new Set();
  for (const [id, r] of Object.entries(data.records)) {
    const where = `interviews ${id}`;
    if (r.id !== id) err(where, 'record id does not match its key');
    if (!INTERVIEWED.includes(r.interviewed)) err(where, `interviewed must be one of: ${INTERVIEWED.join(', ')}`);
    for (const f of EVIDENCE_FIELDS) if (r[f] !== null) evidence(r[f], `${where} ${f}`);
    if (!Array.isArray(r.prepAdvice) || !Array.isArray(r.sampleQuestions)) { err(where, 'prepAdvice and sampleQuestions must be arrays'); continue; }
    r.prepAdvice.forEach((/** @type {any} */ e, /** @type {number} */ i) => evidence(e, `${where} prepAdvice[${i}]`));
    r.sampleQuestions.forEach((/** @type {any} */ q, /** @type {number} */ i) => {
      evidence(q, `${where} sampleQuestions[${i}]`);
      if (q.question !== q.sourceSnippet) err(`${where} sampleQuestions[${i}]`, 'question must be the verbatim sourceSnippet');
      if (!q.id || qids.has(q.id)) err(`${where} sampleQuestions[${i}]`, 'needs a unique id');
      qids.add(q.id);
    });
    if (r.statement !== undefined) {
      if (!Array.isArray(r.statement)) err(where, 'statement must be an array of evidence');
      else r.statement.forEach((/** @type {any} */ e, /** @type {number} */ i) => evidence(e, `${where} statement[${i}]`));
    }
    const statement = Array.isArray(r.statement) ? r.statement : [];
    const hasEvidence = EVIDENCE_FIELDS.some(f => r[f]) || r.prepAdvice.length > 0 || r.sampleQuestions.length > 0 || statement.length > 0;
    if (r.unavailable && hasEvidence) err(where, 'unavailable records must carry no evidence');
    if (r.unavailable && r.interviewed !== 'not published') err(where, 'unavailable records must be "not published"');
    if (!r.unavailable && !hasEvidence) err(where, 'a record that states an interview needs evidence');
    // "No": the university's own statement is required, as source + accessed + verbatim snippet.
    if (r.interviewed === 'no' && !statement.length) err(where, '"no" needs the university\'s statement (statement[])');
    if (r.interviewed !== 'no' && statement.length) err(where, 'statement[] is only for "no" records');
    // New fields: route, the university's own term, third-party provider. Words must come from the quotes.
    const snippets = [...EVIDENCE_FIELDS.map(f => r[f]?.sourceSnippet), ...r.prepAdvice.map((/** @type {any} */ e) => e.sourceSnippet), ...statement.map((/** @type {any} */ e) => e.sourceSnippet)].filter(Boolean).join(' ');
    const set = ['appliesTo', 'universityTerm', 'thirdPartyOnly'].filter(k => r[k] !== undefined && r[k] !== null);
    if (set.length > 1) err(where, `only one of appliesTo, universityTerm, thirdPartyOnly may be set (has ${set.join(', ')})`);
    for (const k of set) if (typeof r[k] !== 'string' || !r[k].trim()) err(where, `${k} must be a non-empty string`);
    if (set.length && r.unavailable) err(where, 'unavailable records carry no route, term or provider');
    if (typeof r.universityTerm === 'string' && !snippets.includes(r.universityTerm)) err(where, `universityTerm "${r.universityTerm}" is not in the record's quotes`);
    if (typeof r.thirdPartyOnly === 'string') {
      if (r.interviewed !== 'no') err(where, 'thirdPartyOnly records are interviewed "no" (no university interview)');
      for (const name of r.thirdPartyOnly.split(/ or | and /)) if (!snippets.includes(name)) err(where, `provider "${name}" is not named in the record's quotes`);
    }
    if ((r.appliesTo || r.universityTerm) && r.interviewed !== 'yes') err(where, 'route and term records are interviewed "yes"');
    if (r.timing) {
      const t = r.timing;
      const snip = r[t.field]?.sourceSnippet;
      if (typeof snip !== 'string' || !snip.includes(t.quote)) err(`${where} timing`, `quote is not in the ${t.field} snippet`);
      if (!Number.isInteger(t.answerSeconds) || t.answerSeconds <= 0) err(`${where} timing`, 'answerSeconds must be a positive whole number');
      if (t.prepSeconds !== undefined && (!Number.isInteger(t.prepSeconds) || t.prepSeconds <= 0)) err(`${where} timing`, 'prepSeconds must be a positive whole number');
      if (!['station', 'interview'].includes(t.kind)) err(`${where} timing`, 'kind must be station or interview');
    }
  }
  for (const [courseId, ids] of Object.entries(data.courses)) {
    if (!known.has(courseId)) err(`interviews courses.${courseId}`, 'not a course id in data/courseRequirements.js');
    if (!Array.isArray(ids) || !ids.length) { err(`interviews courses.${courseId}`, 'needs at least one record id'); continue; }
    for (const id of ids) {
      if (!data.records[id]) err(`interviews courses.${courseId}`, `unknown record ${id}`);
      used.add(id);
    }
  }
  for (const id of Object.keys(data.records)) if (!used.has(id)) err(`interviews ${id}`, 'record is not used by any course');
  return out;
}
