#!/usr/bin/env node
// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * ONE-OFF MIGRATION (kept for the audit trail): builds the first cycle
 * file, data/requirements/2027.js, from data already in the repo.
 *
 * Rules — nothing is invented, nothing is parsed out of prose:
 *   • Only STRUCTURED fields that already carry an official source and
 *     a check date are carried across, with that source and date:
 *       admissionsTests      ← course.admissionTests (+ relations)
 *       subjectPrerequisites ← course.requirements.essential / preferred
 *       otherQualifications  ← course.apRequirement (AP's own source/date)
 *                              course.grades.hkDse (course record source)
 *     The course record's status (verified / partial) carries across too.
 *   • SAT / ACT: the US test-policy table in courseRequirements.js has
 *     no source or check date, so every SAT/ACT entry is UNVERIFIED; the
 *     US policy is kept as `recorded` for a reviewer to confirm. The
 *     admitted-student SAT/ACT ranges are not requirements and are not
 *     carried across.
 *   • English language, other requirements: no structured data exists —
 *     every entry is UNVERIFIED.
 *   • A-Level and IB data is deliberately not migrated (Phase 2).
 *
 * Refuses to overwrite an existing 2027.js (hand edits would be lost)
 * unless run with --force.
 *
 * Usage: node scripts/migrate-requirements-2027.mjs [--force]
 * ═══════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import { loadConfig, loadCourses, cyclePath, writeCycle } from './lib/requirements-io.mjs';

const CYCLE = '2027';

// Qualification-neutral names for the subject tags used in the dataset.
// (The app's own labels are qualification-specific; Phase 1 must not
// render A-Level/IB subject names.)
const SUBJECT_LABELS = {
  Mathematics_Standard: 'Mathematics',
  Mathematics_Advanced: 'Advanced mathematics',
  Computer_Science: 'Computer Science',
  Art_Design: 'Art & Design',
  Biology: 'Biology', Business: 'Business', Chemistry: 'Chemistry', Economics: 'Economics',
  English: 'English', History: 'History', Philosophy: 'Philosophy', Physics: 'Physics',
  Politics: 'Politics', Psychology: 'Psychology', Statistics: 'Statistics',
};

const US_POLICY = {
  required: 'SAT/ACT required', optional: 'Test-optional', flexible: 'Test-flexible',
  recommended: 'SAT/ACT recommended', varies: 'SAT/ACT required for some schools', blind: 'Test-blind (scores not used)',
};

/** @param {string} tag */
function subjectLabel(tag) {
  const label = SUBJECT_LABELS[/** @type {keyof typeof SUBJECT_LABELS} */ (tag)];
  if (!label) throw new Error(`No neutral label for subject tag "${tag}" — add it to SUBJECT_LABELS.`);
  return label;
}

/** @param {any} v  course.verification */
const courseSource = v => [{ url: v.source, label: 'Official source' }];

// A record verified ONLY against a page for one qualification route (an
// IB-applicants or A-Level-applicants page) confirms the requirement for
// that route, not for every applicant — so it carries across as partial.
const ROUTE_SPECIFIC_SOURCE = /(^|[/_.-])(ib|international-baccalaureate|a-?levels?|gce|alevel)([/_.-]|$)/i;

/** Status + provenance block inherited from the course's verification record. */
function fromRecord(course) {
  const v = course.verification;
  if (v.status !== 'verified' && v.status !== 'partial') return null;
  const notes = [];
  if (v.status === 'partial') notes.push('The official source could only be partly confirmed for this course — check it before relying on this.');
  if (ROUTE_SPECIFIC_SOURCE.test(v.source)) notes.push("Confirmed on the university's page for one specific qualification route — check the same applies to your qualification.");
  return {
    status: notes.length ? 'partial' : 'verified',
    sources: courseSource(v),
    lastVerified: v.checkedDate,
    ...(notes.length ? { note: notes.join(' ') } : {}),
  };
}

/** Entry from a record block, with fields in a stable, readable order. */
function entry(base, body) {
  return { status: base.status, ...body, sources: base.sources, lastVerified: base.lastVerified, ...(base.note ? { note: base.note } : {}) };
}

function admissionsTests(course) {
  const base = fromRecord(course);
  if (!base) return { status: 'unverified' };
  const tests = course.admissionTests ?? [];
  if (!tests.length) return entry(base, { none: true });
  const items = tests.map(t => course.admissionTestRelations?.[t] === 'optional-lower-offer'
    ? `${t} — optional; a good result can lower the offer`
    : `${t} — required`);
  return entry(base, { items, codes: [...tests] });
}

function subjectPrerequisites(course) {
  const base = fromRecord(course);
  if (!base) return { status: 'unverified' };
  const ess = course.requirements?.essential ?? [];
  const pref = course.requirements?.preferred ?? [];
  if (!ess.length && !pref.length) return entry(base, { none: true });
  const items = [];
  // US admission is holistic: the dataset's "essential" subjects are what
  // competitive applicants take, not hard prerequisites (same wording the
  // app already uses in its copy-requirements text).
  if (ess.length) items.push(`${course.country === 'US' ? 'Recommended for competitive applicants' : 'Required'}: ${ess.map(subjectLabel).join(', ')}`);
  if (pref.length) items.push(`Preferred: ${pref.map(subjectLabel).join(', ')}`);
  return entry(base, { items, codes: [...ess, ...pref] });
}

/** @param {any} r  an AP requirement object (or one alternative route) */
function apLines(r) {
  const lines = [];
  if (r.count != null) {
    lines.push(Array.isArray(r.grades) && r.grades.length
      ? `${r.count} AP exams at grades ${r.grades.join(', ')}`
      : `${r.count} AP exams`);
  }
  if (r.gpaMin != null) lines.push(`Minimum GPA ${r.gpaMin}`);
  if (Array.isArray(r.mustInclude) && r.mustInclude.length) lines.push(`Must include ${r.mustInclude.join(' and ')}`);
  if (Array.isArray(r.mustIncludeOneOf)) for (const set of r.mustIncludeOneOf) lines.push(`Must include one of ${set.join(' or ')}`);
  if (Array.isArray(r.excluded) && r.excluded.length) lines.push(`Not counted: ${r.excluded.join(', ')}`);
  return lines;
}

function otherQualifications(course) {
  const parts = [];
  const ap = course.apRequirement;
  if (ap && (ap.sourceStatus === 'verified' || ap.sourceStatus === 'partial') && ap.source && ap.checkedDate) {
    const lines = apLines(ap);
    (ap.alternativeRoutes ?? []).forEach((/** @type {any} */ route, /** @type {number} */ i) => {
      const r = apLines(route);
      if (r.length) lines.push(`Alternative route ${i + 1}: ${r.join('; ')}`);
    });
    const items = lines.length ? [`Advanced Placement: ${lines.join('; ')}`] : ['Advanced Placement: accepted — see note'];
    parts.push({
      status: ap.sourceStatus, items,
      sources: [{ url: ap.source, label: 'University AP guidance' }],
      lastVerified: ap.checkedDate,
      note: ap.note ?? (ap.sourceStatus === 'partial' ? 'Partly verified — the source does not state every detail.' : undefined),
    });
  }
  const dse = course.grades?.hkDse;
  const base = fromRecord(course);
  if (dse && base) parts.push(entry(base, { items: [`Hong Kong DSE: ${dse}`] }));

  if (!parts.length) return { status: 'unverified' };
  if (parts.length === 1) {
    const p = parts[0];
    if (p.note === undefined) delete p.note;
    return p;
  }
  // Several sources: the weakest status and the oldest date govern.
  const status = parts.some(p => p.status === 'partial') ? 'partial' : 'verified';
  const notes = parts.map(p => p.note).filter(Boolean);
  return {
    status,
    items: parts.flatMap(p => p.items),
    sources: parts.flatMap(p => p.sources),
    lastVerified: parts.map(p => p.lastVerified).sort()[0],
    ...(notes.length ? { note: notes.join(' ') } : {}),
  };
}

function satAct(course) {
  if (course.country === 'US' && course.usAdmissions?.test) {
    return { status: 'unverified', recorded: US_POLICY[/** @type {keyof typeof US_POLICY} */ (course.usAdmissions.test)] ?? course.usAdmissions.test };
  }
  return { status: 'unverified' };
}

function main() {
  const force = process.argv.includes('--force');
  if (fs.existsSync(cyclePath(CYCLE)) && !force) {
    console.error(`data/requirements/${CYCLE}.js already exists — refusing to overwrite hand-maintained data. Use --force to regenerate from scratch.`);
    process.exit(1);
  }
  const config = loadConfig();
  const courses = loadCourses();
  /** @type {Record<string, any>} */
  const records = {};
  for (const c of courses) {
    records[c.id] = {
      satAct: satAct(c),
      englishLanguage: { status: 'unverified' },
      admissionsTests: admissionsTests(c),
      subjectPrerequisites: subjectPrerequisites(c),
      otherQualifications: otherQualifications(c),
      otherRequirements: { status: 'unverified' },
    };
  }
  writeCycle(
    { cycle: CYCLE, label: config.cycles[CYCLE].label, courses: records },
    [
      `Altiora — admissions requirements, ${config.cycles[CYCLE].label} (${config.cycles[CYCLE].applicationPeriod}).`,
      '',
      'THE source of truth for the requirements panel on every course card.',
      'One line per requirement. Edit by hand; then run `npm run validate`',
      'and add a line to data/requirements/CHANGELOG.md. Schema and the',
      'annual update process: docs/requirements-data.md.',
      '',
      'First generated by scripts/migrate-requirements-2027.mjs from the',
      'existing course records — see that script for exactly what was',
      'carried across and why everything else starts "unverified".',
    ].join('\n'),
  );
  console.log(`Wrote data/requirements/${CYCLE}.js for ${courses.length} courses.`);
}

main();
