#!/usr/bin/env node
// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * ONE-OFF MIGRATION, Phase 2 (kept for the audit trail): adds the
 * A-Level (`aLevel`) and IB (`ib`) categories to data/requirements/2027.js
 * for every course, from the values the matching engine already reads
 * in data/courseRequirements.js. Every other category in 2027.js is left
 * exactly as it is.
 *
 * Rules — nothing is invented, nothing is parsed out of prose:
 *   • Values come only from the engine's STRUCTURED fields:
 *       A-Level ← grades.aLevels (verbatim), requirements.essential /
 *                 .preferred (subject tags, named as A-Level subjects)
 *       IB      ← grades.ib (points), grades.ibHL (Higher Level tags),
 *                 grades.ibHLNote (verbatim), requirements.essential /
 *                 .preferred (named as IB subjects)
 *     A category the engine holds nothing for is UNVERIFIED.
 *   • Status and provenance come from the course's verification record,
 *     exactly as Phase 1 did for subject prerequisites and admissions
 *     tests: verified / partial with that record's source and check date.
 *     A record verified ONLY on one qualification route's page (an IB-
 *     applicants page, an A-Level page) confirms that route: the matching
 *     category stays verified, any other qualification is partial.
 *   • NOT APPLICABLE: courses the repo records as graduate-entry (listed
 *     below with the wording that says so; the script stops if that
 *     wording is no longer in the record). School-leaving qualifications
 *     are not their entry route.
 *   • WITHHELD: IB records that quote admitted-student figures (listed
 *     below with the wording). Admitted-student figures are not
 *     requirements, so the value carrying them is not shown — the points
 *     total and/or the verbatim note — and the entry says so. The engine
 *     still reads the points total (see the Phase 2 notes in CHANGELOG.md).
 *
 * Refuses to run if 2027.js already has these categories, unless run
 * with --force (which rebuilds ONLY aLevel and ib — hand edits to those
 * two would be lost).
 *
 * Usage: node scripts/migrate-requirements-2027-qualifications.mjs [--force]
 * ═══════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import { loadCourses, loadCycle, cyclePath, writeCycle } from './lib/requirements-io.mjs';

const CYCLE = '2027';

// Subject tags → the qualification's own subject names, taken from
// data/qualificationMappings.js (the names that map to each tag) and,
// for IB Higher Level tags, from the ibHL definition at the top of
// data/courseRequirements.js.
const A_LEVEL_NAMES = {
  Mathematics_Standard: 'Mathematics',
  Mathematics_Advanced: 'Further Mathematics',
  English: 'English Literature (or English Language and Literature)',
  Art_Design: 'Art and Design',
  Computer_Science: 'Computer Science',
  Biology: 'Biology', Business: 'Business', Chemistry: 'Chemistry', Economics: 'Economics',
  History: 'History', Philosophy: 'Philosophy', Physics: 'Physics', Psychology: 'Psychology',
  Statistics: 'Statistics',
};
const IB_NAMES = {
  Mathematics_Standard: 'Mathematics',
  Mathematics_Advanced: 'Mathematics at Higher Level',
  English: 'English A',
  Art_Design: 'Visual Arts',
  Computer_Science: 'Computer Science',
  Business: 'Business Management',
  Biology: 'Biology', Chemistry: 'Chemistry', Economics: 'Economics', History: 'History',
  Philosophy: 'Philosophy', Physics: 'Physics', Psychology: 'Psychology',
  // No IB subject maps to this tag in qualificationMappings.js.
  Statistics: 'Statistics (no IB subject maps to this)',
};
// ibHL semantics, as defined in data/courseRequirements.js.
const IB_HL_NAMES = {
  Mathematics_Advanced: 'Mathematics: Analysis and Approaches',
  Mathematics_Standard: 'Mathematics (Analysis and Approaches or Applications and Interpretation)',
  Biology: 'Biology', Chemistry: 'Chemistry', Physics: 'Physics',
};

// Graduate-entry programmes, with the record wording that says THIS
// course is not undergraduate entry. (The US "pre-law track" courses are
// undergraduate degrees — their "Law is graduate-entry" note is about the
// law school afterwards — so they are deliberately not listed.)
const GRADUATE_ENTRY = {
  'ca-law-utoronto': 'Not an undergraduate-entry programme',
  'ca-law-ottawa': 'Not undergraduate entry',
  'ca-law-york': 'Not undergraduate entry',
  'ca-law-uvic': 'Not undergraduate entry',
  'ca-medicine-mcgill': 'Graduate-entry MDCM',
  'ca-medicine-dalhousie': 'MD is graduate-entry',
};
const GRADUATE_ENTRY_NOTE = 'Graduate-entry programme: admission follows prior university study, so school-leaving qualifications are not the entry route.';
// …unless the engine still holds data for that qualification: then the
// record contradicts itself, and the entry says so instead.
const GRADUATE_ENTRY_CONFLICT = 'The course record describes this as a graduate-entry programme, yet the matching engine holds school-qualification requirements for it — confirm which applies before relying on either.';

// IB records that quote admitted-student figures. Admitted-student
// figures are not requirements, so the value that carries them is not
// shown: the points total where the record says IT is the admitted
// figure, and the verbatim note wherever the note quotes one. The
// evidence is the record's own wording; the script stops if it changes.
const ADMITTED_FIGURES = {
  'hk-cs-hkust':           { evidence: '25th percentile of recent admits', withheld: ['overallScore', 'detail'] },
  'hk-engineering-hkust':  { evidence: '25th percentile of recent admits', withheld: ['overallScore', 'detail'] },
  'hk-sciences-hkust':     { evidence: '25th percentile of recent', withheld: ['overallScore', 'detail'] },
  'hk-maths-hkust':        { evidence: '25th percentile of recent admits', withheld: ['overallScore', 'detail'] },
  'hk-engineering-polyu':  { evidence: 'indicative typical admitted score', withheld: ['overallScore', 'detail'] },
  'hk-nursing-polyu':      { evidence: 'indicative typical admitted level', withheld: ['overallScore', 'detail'] },
  'hk-business-polyu':     { evidence: 'indicative typical admitted score', withheld: ['overallScore', 'detail'] },
  'hk-architecture-polyu': { evidence: 'indicative typical PolyU admitted score', withheld: ['overallScore', 'detail'] },
  'hk-cs-polyu':           { evidence: 'indicative typical admitted score', withheld: ['overallScore', 'detail'] },
  'ca-cs-waterloo':          { evidence: "admitted students' averages sit in the low-to-mid 90s", withheld: ['detail'] },
  'ca-engineering-waterloo': { evidence: 'competitive programs admit in the low-to-mid 90s', withheld: ['detail'] },
  'ca-mathematics-waterloo': { evidence: 'admitted averages are typically high-80s', withheld: ['detail'] },
  'ca-business-waterloo':    { evidence: 'admitted averages are mid-80s', withheld: ['detail'] },
  'ca-cs-sfu':               { evidence: 'admitted CS students historically average high 80s-low 90s', withheld: ['detail'] },
  'ca-business-sfu':         { evidence: 'admitted Beedie students historically average 80s or higher', withheld: ['detail'] },
  // Past-year admitted cut-offs and an unofficial competitive estimate.
  'ca-engineering-mcmaster': { evidence: '~92% realistically competitive', withheld: ['detail'] },
  'ca-engineering-calgary':  { evidence: 'Fall 2026 finalization average for Engineering was 92%', withheld: ['detail'] },
  'ca-business-calgary':     { evidence: 'Fall 2026 offers were finalized at 88.5%', withheld: ['detail'] },
};
const WITHHELD_NOTE = {
  'overallScore,detail': 'The IB points total and IB note held for this course quote admitted-student figures, which are not requirements, so they are not shown here — check the official page for the published IB requirement.',
  detail: 'The IB note held for this course quotes admitted-student figures, which are not requirements, so it is not shown here — check the official page for the published subject grades.',
};

const IB_ROUTE = /(^|[/_.-])(ib|international-baccalaureate)([/_.-]|$)/i;
const A_LEVEL_ROUTE = /(^|[/_.-])(a-?levels?|gce|alevel)([/_.-]|$)/i;
const ROUTE_LABEL = { aLevel: 'A-Level', ib: 'IB' };

/** @param {Record<string, string>} names @param {string} tag @param {string} what */
function subject(names, tag, what) {
  const name = names[tag];
  if (!name) throw new Error(`No ${what} name for subject tag "${tag}" — add it to the name table.`);
  return { name, code: tag };
}

/** Status + provenance for one qualification category, or null if the record is not verified. */
function provenance(course, /** @type {'aLevel' | 'ib'} */ route) {
  const v = course.verification;
  if (v.status !== 'verified' && v.status !== 'partial') return null;
  const notes = [];
  if (v.status === 'partial') notes.push('The official source could only be partly confirmed for this course — check it before relying on this.');
  const sourceRoute = IB_ROUTE.test(v.source) ? 'ib' : A_LEVEL_ROUTE.test(v.source) ? 'aLevel' : null;
  if (sourceRoute && sourceRoute !== route) {
    notes.push(`Confirmed on the university's page for ${sourceRoute === 'aLevel' ? 'A-Level-type' : 'IB'} applicants, not on a page for ${ROUTE_LABEL[route]} applicants — check it applies to ${ROUTE_LABEL[route]}.`);
  }
  return { status: notes.length ? 'partial' : 'verified', sources: [{ url: v.source, label: 'Official source' }], lastVerified: v.checkedDate, notes };
}

function graduateEntry(course) {
  const evidence = GRADUATE_ENTRY[course.id];
  if (!evidence) return null;
  const text = `${course.notes ?? ''} ${course.verification?.notes ?? ''}`;
  if (!text.includes(evidence)) throw new Error(`${course.id}: record no longer says "${evidence}" — re-check before marking not applicable.`);
  const p = provenance(course, 'aLevel');
  if (!p) throw new Error(`${course.id}: graduate-entry course without a verified record.`);
  return { status: 'notApplicable', accepted: 'no', sources: p.sources, lastVerified: p.lastVerified, note: GRADUATE_ENTRY_NOTE };
}

/** @param {any} p provenance @param {Record<string, any>} body */
function entry(p, body, extraNotes = /** @type {string[]} */ ([])) {
  const notes = [...extraNotes, ...p.notes];
  return { status: p.status, accepted: 'yes', ...body, sources: p.sources, lastVerified: p.lastVerified, ...(notes.length ? { note: notes.join(' ') } : {}) };
}

/** Required / preferred subjects from the engine's tags; empty lists are left out. */
function subjectLists(course, names, what) {
  const out = {};
  const ess = course.requirements?.essential ?? [];
  const pref = course.requirements?.preferred ?? [];
  if (ess.length) out.required = ess.map(t => subject(names, t, what));
  if (pref.length) out.preferred = pref.map(t => subject(names, t, what));
  return out;
}

const holdsALevel = course => !!course.grades?.aLevels;
const holdsIb = course => { const g = course.grades ?? {}; return g.ib != null || (g.ibHL ?? []).length > 0 || !!g.ibHLNote; };

/**
 * Not applicable only when the record says graduate-entry AND the engine
 * holds no school-qualification data for the course at all. If it holds
 * some, the record contradicts itself: nothing is marked not applicable,
 * held data is shown as partial and the empty category stays unverified,
 * both with the conflict noted.
 * @param {'aLevel' | 'ib'} cat
 * @returns {any} the entry
 */
function qualification(course, cat) {
  /** @type {any} */
  const fromEngine = cat === 'aLevel' ? aLevelFromEngine(course) : ibFromEngine(course);
  if (!GRADUATE_ENTRY[course.id]) return fromEngine;
  if (!holdsALevel(course) && !holdsIb(course)) return graduateEntry(course);
  graduateEntry(course); // still asserts the record's wording
  if (fromEngine.status === 'unverified') return { status: 'unverified', note: GRADUATE_ENTRY_CONFLICT };
  const { sources, lastVerified, note, ...rest } = fromEngine;
  return { ...rest, status: 'partial', sources, lastVerified, note: [GRADUATE_ENTRY_CONFLICT, note].filter(Boolean).join(' ') };
}

function aLevelFromEngine(course) {
  const offer = course.grades?.aLevels;
  if (!offer) return { status: 'unverified' };
  const p = provenance(course, 'aLevel');
  if (!p) return { status: 'unverified' };
  const subjects = subjectLists(course, A_LEVEL_NAMES, 'A-Level');
  return entry(p, { typicalOffer: offer, ...(Object.keys(subjects).length ? { subjects } : {}) });
}

function ibFromEngine(course) {
  const g = course.grades ?? {};
  const hl = g.ibHL ?? [];
  const hasData = g.ib != null || hl.length > 0 || !!g.ibHLNote;
  if (!hasData) return { status: 'unverified' };
  const p = provenance(course, 'ib');
  if (!p) return { status: 'unverified' };

  const body = {};
  const extra = [];
  const admitted = ADMITTED_FIGURES[course.id];
  if (admitted && !String(g.ibHLNote ?? '').includes(admitted.evidence)) {
    throw new Error(`${course.id}: ibHLNote no longer says "${admitted.evidence}" — re-check what is withheld.`);
  }
  const withheld = admitted?.withheld ?? [];
  if (typeof g.ib === 'number' && !withheld.includes('overallScore')) body.overallScore = g.ib;
  const subjects = subjectLists(course, IB_NAMES, 'IB');
  if (hl.length) subjects.higherLevel = hl.map(t => subject(IB_HL_NAMES, t, 'IB Higher Level'));
  if (Object.keys(subjects).length) body.subjects = subjects;
  if (g.ibHLNote && !withheld.includes('detail')) body.detail = g.ibHLNote;
  if (withheld.length) {
    body.withheld = [...withheld];
    extra.push(WITHHELD_NOTE[/** @type {keyof typeof WITHHELD_NOTE} */ (withheld.join(','))]);
  }
  return entry(p, body, extra);
}

function main() {
  const force = process.argv.includes('--force');
  if (!fs.existsSync(cyclePath(CYCLE))) throw new Error(`data/requirements/${CYCLE}.js does not exist — run the Phase 1 migration first.`);
  const cycle = loadCycle(CYCLE);
  const already = Object.values(cycle.courses).some(r => 'aLevel' in r || 'ib' in r);
  if (already && !force) {
    console.error(`data/requirements/${CYCLE}.js already has A-Level / IB entries — refusing to overwrite hand-maintained data. Use --force to rebuild those two categories.`);
    process.exit(1);
  }
  const header = fs.readFileSync(cyclePath(CYCLE), 'utf8')
    .split('\n').filter(l => /^ \*( |$)/.test(l) && !l.includes('═')).map(l => l.replace(/^ \* ?/, ''));
  const PHASE2 = 'A-Level and IB entries added by scripts/migrate-requirements-2027-qualifications.mjs.';
  if (!header.includes(PHASE2)) header.push('', PHASE2);
  for (const c of loadCourses()) {
    const rec = cycle.courses[c.id];
    if (!rec) throw new Error(`${c.id}: no record in ${CYCLE}.js`);
    rec.aLevel = qualification(c, 'aLevel');
    rec.ib = qualification(c, 'ib');
  }
  writeCycle(cycle, header.join('\n'));
  console.log(`Added A-Level and IB entries to data/requirements/${CYCLE}.js for ${Object.keys(cycle.courses).length} courses.`);
}

main();
