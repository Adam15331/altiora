#!/usr/bin/env node
// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — build-interview-data.mjs
 *
 * Builds data/interviews.js (display-only interview information) from
 * research/interviews-proposed.json. Nothing is written by hand and nothing
 * is added: every value keeps its source, accessed date and verbatim
 * sourceSnippet from the research file.
 *
 * Left out (see research/interviews.md):
 *   - evidence from any page on the research manual-review list (blocked,
 *     undated or unconfirmed pages), and Oxford Physics' teacher-only mock
 *     interview pack (EXCLUDED_SOURCES below, carried into the data file so
 *     npm run validate can prove they stay out);
 *   - the research notes (commentary, not university evidence);
 *   - records with no evidence that are not blocked (the course is covered by
 *     a university-wide record instead).
 * The Lucy Cavendish packs and Medical Schools Council material were never
 * research evidence, so there is nothing of theirs to leave out.
 *
 * Usage:  node scripts/build-interview-data.mjs
 * ═══════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/requirements-io.mjs';

const research = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/interviews-proposed.json'), 'utf8'));

/** @type {Array<{url: string, why: string}>} */
export const EXCLUDED_SOURCES = [
  ...research.manualReview.map((/** @type {{url: string, why: string}} */ m) => ({ url: m.url, why: `Research manual-review list: ${m.why}` })),
  { url: 'https://www.physics.ox.ac.uk/system/files/file_attachments/mock%20interview%20pack%20211122_0.pdf',
    why: 'Oxford Physics "Mock Interview Pack for Teachers" (2021) — headed "STUDENTS: THIS IS NOT FOR YOU".' },
];
const excluded = new Set(EXCLUDED_SOURCES.map(e => e.url));

// Whether a course interviews, from the university's own words in the
// record's evidence. "some applicants": by invitation, at the university's
// discretion or where an interviewer is available. "optional": the
// university calls it optional.
const SOME = new Set(['yale', 'harvard', 'mit', 'dartmouth', 'manchester-psychology']);
const OPTIONAL = new Set(['stanford', 'duke', 'princeton', 'rice']);

// Timing the university states, as a phrase quoted from one evidence field.
// The build fails if `quote` is not in that field's sourceSnippet.
/** @type {Record<string, {kind: 'station'|'interview', prepSeconds?: number, answerSeconds: number, field: string, quote: string}>} */
const TIMING = {
  'birmingham-medicine': { kind: 'station', prepSeconds: 120, answerSeconds: 360, field: 'format', quote: 'each station will include 2 minutes of preparation time and 6 minutes of interview time' },
  'manchester-medicine': { kind: 'station', answerSeconds: 480, field: 'numberAndLength', quote: 'The interview in each station will be eight minutes long' },
  'st-andrews-medicine': { kind: 'station', answerSeconds: 360, field: 'format', quote: 'which last about six minutes each' },
  'nottingham-pharmacy': { kind: 'station', answerSeconds: 300, field: 'format', quote: 'each around five minutes' },
  'oxford-computer-science': { kind: 'interview', answerSeconds: 1800, field: 'numberAndLength', quote: 'Each interview lasts around 30 minutes' },
  'oxford-mathematics': { kind: 'interview', answerSeconds: 1500, field: 'numberAndLength', quote: 'Each interview lasts for about 25 minutes' },
  'glasgow-medicine': { kind: 'interview', answerSeconds: 1800, field: 'numberAndLength', quote: 'The interview session will last 30 minutes in total' },
  'bristol-medicine': { kind: 'interview', answerSeconds: 1800, field: 'format', quote: 'The formal interview will last approximately 30 minutes' },
};

const EVIDENCE_FIELDS = ['format', 'numberAndLength', 'mmiStations', 'whatIsAssessed'];
/** @param {any} e */
const keep = e => e && !excluded.has(e.source);
/** @param {any} e */
const ev = e => ({ source: e.source, accessed: e.accessed, sourceSnippet: e.sourceSnippet });

/** @type {Record<string, any>} */
const records = {};
/** @type {Record<string, string[]>} */
const courses = {};
for (const r of research.records) {
  /** @type {any} */
  const out = { id: r.id, university: r.university, subject: r.subject };
  for (const f of EVIDENCE_FIELDS) out[f] = keep(r[f]) ? ev(r[f]) : null;
  out.prepAdvice = r.prepAdvice.filter(keep).map(ev);
  out.sampleQuestions = r.sampleQuestions.filter(keep).map((/** @type {any} */ q, /** @type {number} */ i) =>
    ({ id: `${r.id}#${i + 1}`, subject: q.subject, ...ev(q), question: q.question }));
  const hasEvidence = EVIDENCE_FIELDS.some(f => out[f]) || out.prepAdvice.length || out.sampleQuestions.length;
  const blocked = r.manualReview || r.interviewed.startsWith('not published');
  if (!hasEvidence && !blocked) continue;          // covered by a university-wide record
  out.unavailable = !hasEvidence;                   // blocked, nothing loadable: "check the course page"
  out.interviewed = !hasEvidence ? 'not published' : SOME.has(r.id) ? 'some applicants' : OPTIONAL.has(r.id) ? 'optional' : 'yes';
  const t = TIMING[r.id];
  if (t) {
    const snip = out[t.field]?.sourceSnippet ?? '';
    if (!snip.includes(t.quote)) throw new Error(`${r.id}: timing quote not in ${t.field}: ${t.quote}`);
    out.timing = t;
  } else out.timing = null;
  records[r.id] = out;
  // Subject records come before university-wide ones for the same course.
  const wide = /All courses|All six courses/.test(r.subject);
  for (const c of r.courseIds) (courses[c] ??= [])[wide ? 'push' : 'unshift'](r.id);
}
for (const t of Object.keys(TIMING)) if (!records[t]?.timing) throw new Error(`timing for ${t} was not applied`);

const data = { source: 'research/interviews-proposed.json', excludedSources: EXCLUDED_SOURCES, records, courses };
const body = JSON.stringify(data, null, 2);
fs.writeFileSync(path.join(ROOT, 'data/interviews.js'), `/* ═══════════════════════════════════════════════════════════════
 * Altiora — data/interviews.js   GENERATED — DO NOT EDIT BY HAND.
 * Built by scripts/build-interview-data.mjs from
 * research/interviews-proposed.json. Display only: nothing here affects a
 * verdict. Every value carries its official source, the date it was read
 * and a verbatim sourceSnippet. Checked by npm run validate.
 * ═══════════════════════════════════════════════════════════════ */
(function (/** @type {any} */ root) {
  const interviewData = ${body.replace(/\n/g, '\n  ')};
  if (typeof module !== 'undefined' && module.exports) module.exports = { interviewData };
  else root.AltioraInterviewData = interviewData;
})(typeof globalThis !== 'undefined' ? globalThis : this);
`);
const n = Object.values(records);
console.log(`Wrote data/interviews.js: ${n.length} records (${n.filter(r => r.unavailable).length} unavailable), ${Object.keys(courses).length} courses, `
  + `${n.reduce((s, r) => s + r.sampleQuestions.length, 0)} official sample questions, ${n.filter(r => r.timing).length} with stated timing.`);
