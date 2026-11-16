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

// Who published each sample question, as shown after "Published by". The
// Oxford Computer Science tutor's posts are on the department's domain and
// linked from its admissions page, but are not a department page.
const TUTOR_POSTS = 'https://www.cs.ox.ac.uk/people/varun.kanade/';
const TUTOR_LABEL = "an Oxford Computer Science tutor, linked from the department's admissions page";
/** @param {any} q @param {string} university */
const publisherOf = (q, university) => (q.source.startsWith(TUTOR_POSTS) ? TUTOR_LABEL : university);

// A preparation quote that ends with a colon introduces a list the quote
// does not contain, so on its own it points at nothing. Such quotes are left
// out (and reported).
/** @param {any} e */
const introducesMissingList = e => /:\s*$/.test(e.sourceSnippet);
/** @type {Array<{record: string, source: string, sourceSnippet: string}>} */
const removedPrep = [];
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
  out.prepAdvice = r.prepAdvice.filter(keep).filter((/** @type {any} */ e) => {
    if (!introducesMissingList(e)) return true;
    removedPrep.push({ record: r.id, source: e.source, sourceSnippet: e.sourceSnippet });
    return false;
  }).map(ev);
  out.sampleQuestions = r.sampleQuestions.filter(keep).map((/** @type {any} */ q, /** @type {number} */ i) =>
    ({ id: `${r.id}#${i + 1}`, subject: q.subject, publishedBy: publisherOf(q, r.university), ...ev(q), question: q.question }));
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

// ═══════════════════════════════════════════════════════════════
// Expansion: research/interviews-expansion-proposed.json, loaded by the
// decisions in research/interviews-expansion.md §7. Added AFTER the records
// above, which are not touched (new fields appear only on new records):
//   appliesTo      — set when the interview is for one route/group only, in
//                    the university's words (the card says "Interviews some
//                    applicants: …", no practice button)
//   universityTerm — what the university calls it when it does not call it an
//                    interview (the card uses this word, never "interview")
//   thirdPartyOnly — no university interview; the provider as the university
//                    names it (the name must be in a quote)
//   statement[]    — for interviewed "no": the university's own statement
// ═══════════════════════════════════════════════════════════════
const expansion = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/interviews-expansion-proposed.json'), 'utf8'));

// Route-limited records: the route, from the record's own page.
const ROUTE = {
  'cuhk-all': 'JUPAS applicants', 'cuhk-business': 'JUPAS candidates', 'cuhk-cs': 'JUPAS applicants',
  'cuhk-engineering': 'JUPAS applicants', 'cuhk-economics': 'JUPAS applicants', 'cuhk-law': 'JUPAS applicants',
  'cuhk-architecture': 'JUPAS applicants', 'hkust-all': 'applicants with international qualifications',
  'hkust-engineering': 'JUPAS applicants', 'hkust-quantfin': 'JUPAS applicants',
  'polyu-business': 'JUPAS applicants', 'polyu-engineering': 'JUPAS applicants', 'polyu-architecture': 'JUPAS applicants',
  'polyu-computing': 'JUPAS applicants', 'polyu-nursing': 'JUPAS applicants',
  'cityu-cs': 'JUPAS Applicants', 'cityu-business-marketing': 'JUPAS applicants', 'cityu-business-global-business': 'JUPAS applicants',
  'mcgill-medicine': 'CEGEP students', 'mcgill-law': 'CEGEP candidates',
  'tcd-medicine': 'mature applicants', 'tcd-psychology-mature': 'mature applicants', 'tcd-mature-all': 'mature applicants',
  'nus-computing': 'Aptitude-Based Admissions (ABA) scheme', 'nus-all': 'some faculties',
  'ntu-aba-all': 'Aptitude-based Admissions', 'ntu-intl-selected-qualifications': 'selected candidates (Indonesia, PRC Gao Kao, Taiwan GSAT and Vietnam qualifications)',
  'bath-qualification-route': 'studying certain qualifications, such as an Access to HE or T Level',
  'bath-mathematics': 'very exceptionally, if you have circumstances we cannot assess from an application alone',
  'glasgow-year2-entry': 'entry into Year 2 in any subject',
  'michigan-engineering': 'some applicants to the College of Engineering',
  'unc-business': 'admitted transfer student or current UNC student who has completed your first year',
};
// Recorded responses (or a session) the university does not call an interview.
const TERM = { 'utoronto-engineering': 'Personal Profile', 'queens-commerce': 'Supplementary Application',
  'mcmaster-engineering-cs': 'supplementary application', 'sutd-all': 'conversation session' };
// All-applicant records (an interview, possibly by shortlist, for any applicant).
const ALL = ['hku-law', 'hku-architecture', 'cuhk-medicine', 'ubc-commerce', 'western-ivey-aeo', 'york-schulich-bba',
  'berkeley-business', 'nus-medicine', 'ntu-medicine'];
// Not loaded (report §7 / load decisions): to manual review instead.
const HOLD = {
  'Waterloo': 'University of Waterloo — official pages conflict on whether the Engineering interview is optional.',
  'Notre Dame': 'University of Notre Dame — its "no interview" FAQ carries a 2017 footer.',
  'Emory': 'Emory University — its FAQ says no evaluative interviews but also mentions an Alumni Interview program.',
};
const HOLD_RECORDS = { 'hku-business': 'HKU Business School JUPAS FAQ — the quote could not be re-fetched (connection reset).',
  'ntu-business-alevel': 'NTU Business A-level PDF (2019–2020 profiles) — needs a human check.' };
// HKUST Science and Maths: "no" was inferred from a list that leaves them out, so they load as "not published".
const NOT_PUBLISHED = { 'hkust-science-maths': { university: 'HKUST', courseIds: ['hk-sciences-hkust', 'hk-maths-hkust'] } };
const GRADUATE_ENTRY = new Set(expansion.notOpenToSchoolLeavers.flatMap((/** @type {any} */ n) => n.courseIds));

const held = (/** @type {string} */ university) => Object.keys(HOLD).find(k => university.includes(k));
const npCourses = new Set(Object.values(NOT_PUBLISHED).flatMap(n => n.courseIds));
const manualCourses = /** @type {Record<string, {university: string, why: string, courseIds: Set<string>, urls: Set<string>}>} */ ({});
const toManual = (/** @type {string} */ university, /** @type {string} */ why, /** @type {string[]} */ ids, /** @type {string[]} */ urls) => {
  const m = (manualCourses[university] ??= { university, why, courseIds: new Set(), urls: new Set() });
  ids.forEach(c => m.courseIds.add(c)); urls.forEach(u => m.urls.add(u));
};
const evOf = (/** @type {any} */ r) => [...EVIDENCE_FIELDS.map(f => r[f]).filter(Boolean), ...(r.prepAdvice ?? []), ...(r.sampleQuestions ?? [])];
const expSlug = (/** @type {string} */ s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** @type {Record<string, any>} */
const newRecords = {};
const addNew = (/** @type {any} */ r) => {
  if (records[r.id] || newRecords[r.id]) throw new Error(`expansion record id already used: ${r.id}`);
  for (const c of r.courseIds) {
    if (courses[c]) throw new Error(`${c} already has an interview record; the expansion only adds courses without one`);
    if (GRADUATE_ENTRY.has(c)) throw new Error(`${c} is graduate-entry; nothing is loaded for it`);
  }
  newRecords[r.id] = r;
};

// 1. Interview records: all applicants, route-limited, university term.
for (const r of expansion.records) {
  const hasEv = evOf(r).length > 0;
  if (!hasEv) continue;                                  // blocked placeholders: step 4
  if (HOLD_RECORDS[r.id]) { toManual(r.university, HOLD_RECORDS[r.id], r.courseIds, evOf(r).map(e => e.source)); continue; }
  const h = held(r.university);
  if (h) { toManual(r.university, HOLD[h], r.courseIds, evOf(r).map(e => e.source)); continue; }
  const kind = ROUTE[r.id] ? 'route' : TERM[r.id] ? 'term' : ALL.includes(r.id) ? 'all' : null;
  if (!kind) throw new Error(`expansion record ${r.id} has no load decision`);
  /** @type {any} */
  const out = { id: r.id, university: r.university, subject: r.subject };
  for (const f of EVIDENCE_FIELDS) out[f] = r[f] ? ev(r[f]) : null;
  out.prepAdvice = r.prepAdvice.filter((/** @type {any} */ e) => {
    if (!introducesMissingList(e)) return true;
    removedPrep.push({ record: r.id, source: e.source, sourceSnippet: e.sourceSnippet });
    return false;
  }).map(ev);
  out.sampleQuestions = r.sampleQuestions.map((/** @type {any} */ q, /** @type {number} */ i) =>
    // The question is itself the verbatim snippet (checked verbatim on the page in the research).
    ({ id: `${r.id}#${i + 1}`, subject: q.subject, publishedBy: r.university, source: q.source, accessed: q.accessed, sourceSnippet: q.question, question: q.question }));
  out.unavailable = false;
  out.interviewed = 'yes';
  out.timing = null;
  if (kind === 'route') out.appliesTo = ROUTE[r.id];
  if (kind === 'term') out.universityTerm = TERM[r.id];
  out.courseIds = r.courseIds.filter((/** @type {string} */ c) => !npCourses.has(c));
  addNew(out);
}
// 2. Third-party only: no university interview; the provider as named in a quote.
const PROVIDER = { 'Carnegie Mellon University': 'InitialView or Vericant', 'Washington University in St. Louis': 'InitialView or Vericant',
  'Georgia Tech': 'InitialView and Vericant' };
const thirdPartyCourses = new Set();
for (const t of expansion.thirdPartyInterviewOnly) {
  const h = held(t.university);
  const statements = expansion.statedNoInterview.filter((/** @type {any} */ s) => s.university === t.university);
  if (h) { toManual(t.university, HOLD[h], t.courseIds, [...t.evidence, ...statements].map((/** @type {any} */ e) => e.source)); continue; }
  const provider = PROVIDER[t.university] ?? 'InitialView';
  t.courseIds.forEach((/** @type {string} */ c) => thirdPartyCourses.add(c));
  addNew({ id: `${expSlug(t.university)}-third-party`, university: t.university, subject: 'All listed courses',
    format: ev(t.evidence[0]), numberAndLength: null, mmiStations: null, whatIsAssessed: t.evidence[1] ? ev(t.evidence[1]) : null,
    prepAdvice: [], sampleQuestions: [], unavailable: false, interviewed: 'no', timing: null,
    thirdPartyOnly: provider, statement: statements.map(ev), courseIds: t.courseIds });
}
// 3. "States no interview" (courses not already loaded as third-party only).
/** @type {Record<string, number>} */
const noCount = {};
for (const s of expansion.statedNoInterview) {
  const h = held(s.university);
  const ids = s.courseIds.filter((/** @type {string} */ c) => !thirdPartyCourses.has(c) && !npCourses.has(c));
  if (!ids.length) continue;
  if (h) { toManual(s.university, HOLD[h], ids, [s.source]); continue; }
  const n = (noCount[s.university] = (noCount[s.university] ?? 0) + 1);
  addNew({ id: `${expSlug(s.university)}-no-${n}`, university: s.university, subject: 'Courses named in the statement',
    format: null, numberAndLength: null, mmiStations: null, whatIsAssessed: null, prepAdvice: [], sampleQuestions: [],
    unavailable: false, interviewed: 'no', timing: null, statement: [ev(s)], courseIds: ids });
}
// 4. Manual review: the research's blocked-site placeholders, plus everything held above. Not published.
for (const r of expansion.records.filter((/** @type {any} */ r) => evOf(r).length === 0)) {
  toManual(r.university, `Blocked: ${String(r.notes ?? '').replace(/^Blocked:\s*/, '')}`, r.courseIds, []);
}
for (const m of Object.values(manualCourses)) {
  const ids = [...m.courseIds].filter(c => !Object.values(newRecords).some(r => r.courseIds.includes(c)));
  if (!ids.length) continue;
  addNew({ id: `${expSlug(m.university)}-manual-review`, university: m.university, subject: 'Courses on the manual-review list',
    format: null, numberAndLength: null, mmiStations: null, whatIsAssessed: null, prepAdvice: [], sampleQuestions: [],
    unavailable: true, interviewed: 'not published', timing: null, courseIds: ids });
}
// 5. Not published (inferred "no" not loaded).
for (const [id, n] of Object.entries(NOT_PUBLISHED)) {
  addNew({ id, university: n.university, subject: 'Courses with nothing published', format: null, numberAndLength: null,
    mmiStations: null, whatIsAssessed: null, prepAdvice: [], sampleQuestions: [], unavailable: true,
    interviewed: 'not published', timing: null, courseIds: n.courseIds });
}
// Wire the new records in. Subject records before university-wide ones for the same course, as above.
for (const r of Object.values(newRecords)) {
  const { courseIds, ...rec } = r;
  records[r.id] = rec;
  const wide = /All courses|All listed courses|^Courses /.test(r.subject) || courseIds.length > 2;
  for (const c of courseIds) (courses[c] ??= [])[wide ? 'push' : 'unshift'](r.id);
}
// Everything held or blocked becomes an excluded source, so the validator proves none of it is shown.
const EXPANSION_EXCLUDED = [
  ...expansion.manualReview.filter((/** @type {any} */ m) => !m.carriedOver).map((/** @type {any} */ m) => ({ url: m.url, why: `Expansion manual-review list: ${m.why}` })),
  ...Object.values(manualCourses).flatMap(m => [...m.urls].map(url => ({ url, why: `Expansion, held for manual review: ${m.why}` }))),
];
const seenUrl = new Set(EXCLUDED_SOURCES.map(e => e.url));
for (const e of EXPANSION_EXCLUDED) if (!seenUrl.has(e.url)) { seenUrl.add(e.url); EXCLUDED_SOURCES.push(e); }
export const EXPANSION_MANUAL_REVIEW = Object.values(manualCourses).map(m => ({ university: m.university, why: m.why, courseIds: [...m.courseIds], urls: [...m.urls] }));

const data = { source: 'research/interviews-proposed.json + research/interviews-expansion-proposed.json', excludedSources: EXCLUDED_SOURCES, records, courses };
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
for (const x of removedPrep) console.log(`Left out (preparation quote ends with a colon): ${x.record} — “${x.sourceSnippet}” ${x.source}`);
console.log(`Wrote data/interviews.js: ${n.length} records (${n.filter(r => r.unavailable).length} unavailable), ${Object.keys(courses).length} courses, `
  + `${n.reduce((s, r) => s + r.sampleQuestions.length, 0)} official sample questions, ${n.filter(r => r.timing).length} with stated timing.`);
