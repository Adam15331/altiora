// @ts-check
// The UK verification pass: UCAS tariff points, the AP engine-lock on
// Other qualifications, and — over the real data — that every UK row
// checked in the pass is official-sourced, quoted and free of
// admitted-student figures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { loadConfig, loadCourses, loadCycle } from '../scripts/lib/requirements-io.mjs';
import { validateEntry, validateCycle } from '../scripts/lib/validate-requirements.mjs';
import { apItem } from '../scripts/lib/engine-values.mjs';

const require = createRequire(import.meta.url);
const view = require('../requirements-view.js');
const config = loadConfig();
const courses = loadCourses();
const cycle = loadCycle(config.currentCycle);
const TODAY = '2026-10-19';
const SRC = [{ url: 'https://www.example.ac.uk/course', label: 'Official source' }];

/** @param {any} entry */
function errors(entry) {
  /** @type {any[]} */ const out = [];
  validateEntry(entry, 'x', TODAY, out, 'qualification', { snippetsRequiredFrom: '2026-10-19' });
  return out.filter(p => p.level === 'error').map(p => p.message);
}

test('ucasTariff: a non-empty string on qualification rows, shown as "UCAS points"', () => {
  /** @type {any} */
  const e = { status: 'verified', accepted: 'yes', typicalOffer: 'AAB', ucasTariff: '136 UCAS points', sources: SRC, lastVerified: '2026-10-19', sourceSnippet: 'AAB or 136 UCAS points' };
  assert.deepEqual(errors(e), []);
  assert.match(errors({ ...e, ucasTariff: ' ' }).join(), /"ucasTariff" must be a non-empty string/);
  // A row may carry tariff points alone.
  const tariffOnly = Object.fromEntries(Object.entries(e).filter(([k]) => k !== 'typicalOffer'));
  assert.deepEqual(errors(tariffOnly), []);
  const html = view.panelHtml({ record: { aLevel: e }, categories: config.categories.filter(c => c.id === 'aLevel'), cycleLabel: '2027 entry' });
  assert.match(html, /<dt>UCAS points<\/dt><dd>136 UCAS points<\/dd>/);
  assert.match(view.entryText(e), /^AAB; UCAS points: 136 UCAS points \(verified 19 Oct 2026\)$/);
});

test('AP engine-lock: a checked Other-qualifications row must keep the engine\'s AP line', () => {
  const course = courses.find(c => apItem(c));
  assert.ok(course, 'a course with an engine-held AP requirement exists');
  const id = /** @type {any} */ (course).id;
  const line = /** @type {string} */ (apItem(course));
  assert.ok((cycle.courses[id].otherQualifications.items ?? []).includes(line), 'current data keeps it');
  const dropped = { ...cycle, courses: { ...cycle.courses, [id]: { ...cycle.courses[id], otherQualifications: { ...cycle.courses[id].otherQualifications, items: ['Advanced Placement: something else'] } } } };
  const errs = validateCycle(dropped, { config, courses, today: TODAY }).filter(p => p.level === 'error');
  assert.equal(errs.length, 1);
  assert.match(errs[0].message, /engine's AP requirement .* is missing/);
  // Not verified rows are not held to it.
  const unverified = { ...cycle, courses: { ...cycle.courses, [id]: { ...cycle.courses[id], otherQualifications: { status: 'unverified', note: 'Blocked.' } } } };
  assert.deepEqual(validateCycle(unverified, { config, courses, today: TODAY }).filter(p => p.level === 'error'), []);
});

// ── The real data ────────────────────────────────────────────────

const uk = courses.filter(c => c.country === 'UK');
const passEntries = uk.flatMap(c => Object.entries(cycle.courses[c.id])
  .filter(([, e]) => e.status !== 'unverified' && (e.lastVerified ?? '') >= /** @type {string} */ (config.snippetsRequiredFrom))
  .map(([cat, e]) => ({ id: c.id, cat, e })));

test('every UK row checked in the pass cites an official https source and quotes it', () => {
  const official = /\.ac\.uk$/;
  for (const { id, cat, e } of passEntries) {
    assert.ok(e.sourceSnippet, `${id} › ${cat}: snippet`);
    for (const s of e.sources ?? []) {
      const host = new URL(s.url).hostname;
      assert.ok(s.url.startsWith('https://') && official.test(host), `${id} › ${cat}: ${s.url} is not an official university source`);
    }
  }
});

test('no admitted-student figure is stated as a UK requirement', () => {
  const figure = /successful applicants (typically )?(achieved|had|have)|average (offer|grades?) of (admitted|successful)|median|percentile|of (our )?entrants (achieved|had)/i;
  for (const { id, cat, e } of passEntries) {
    for (const v of [...(e.items ?? []), e.typicalOffer ?? '', e.ucasTariff ?? '', e.detail ?? '']) assert.doesNotMatch(v, figure, `${id} › ${cat}: ${v}`);
  }
});

test('noSubjectRequirements: only on courses whose verified, quoted row states no required subjects', () => {
  const flagged = courses.filter(c => c.noSubjectRequirements);
  assert.deepEqual(flagged.map(c => c.id).sort(), ['uk-law-cambridge', 'uk-law-exeter', 'uk-law-kcl', 'uk-law-lse', 'uk-law-oxford', 'uk-nursing-kcl']);
  const id = 'uk-law-cambridge';
  const course = /** @type {any} */ (courses.find(c => c.id === id));
  const ok = validateCycle(cycle, { config, courses, today: TODAY }).filter(p => p.level === 'error');
  assert.deepEqual(ok, []);
  // A flag next to a required subject, or without a verified row, fails.
  const withSubject = courses.map(c => c.id === id ? { ...course, requirements: { ...course.requirements, essential: ['History'] } } : c);
  const unverified = { ...cycle, courses: { ...cycle.courses, [id]: { ...cycle.courses[id], subjectPrerequisites: { status: 'unverified', note: 'x' } } } };
  /** @type {[any, any[]][]} */
  const cases = [[cycle, withSubject], [unverified, courses]];
  for (const [cyc, cs] of cases) {
    const errs = validateCycle(cyc, { config, courses: cs, today: TODAY }).filter(p => p.level === 'error').map(p => p.message).join();
    assert.match(errs, /noSubjectRequirements needs/);
  }
});
