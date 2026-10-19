// @ts-check
// Phase 2 — A-Level and IB requirements: the real 2027 data against the
// matching engine's copy, the schema and validation rules for
// qualification entries, and the panel's A-Level / IB states.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { loadConfig, loadCourses, loadCycle } from '../scripts/lib/requirements-io.mjs';
import { validateEntry, validateCycle, validateConfig, engineDisagreements } from '../scripts/lib/validate-requirements.mjs';
import { carryEntry } from '../scripts/lib/cycles.mjs';

const require = createRequire(import.meta.url);
const view = require('../requirements-view.js');
const config = loadConfig();
const courses = loadCourses();
const byId = new Map(courses.map(c => [c.id, c]));
const cycle = loadCycle('2027');
const TODAY = '2026-10-19';
const SRC = [{ url: 'https://www.example.ac.uk/course', label: 'Official source' }];

/** Copy of an object without one key. @param {any} o @param {string} k */
const omit = (o, k) => Object.fromEntries(Object.entries(o).filter(([key]) => key !== k));

/** @param {any} entry @param {'list' | 'qualification'} [kind] */
function entryErrors(entry, kind = 'qualification') {
  /** @type {any[]} */ const out = [];
  validateEntry(entry, 'x', TODAY, out, kind);
  return out.filter(p => p.level === 'error').map(p => p.message);
}

// ── The real data ────────────────────────────────────────────────

test('every course has an A-Level and an IB entry with a status', () => {
  for (const c of courses) {
    for (const cat of ['aLevel', 'ib']) {
      const e = cycle.courses[c.id]?.[cat];
      assert.ok(e && ['verified', 'partial', 'unverified', 'notApplicable'].includes(e.status), `${c.id} › ${cat}`);
    }
  }
});

test('A-Level and IB entries agree with the matching engine for all 320 courses', () => {
  for (const c of courses) {
    for (const cat of /** @type {const} */ (['aLevel', 'ib'])) {
      assert.deepEqual(engineDisagreements(cat, cycle.courses[c.id][cat], c), [], `${c.id} › ${cat}`);
    }
  }
});

test('every A-Level offer and IB score the engine holds is surfaced, or explicitly withheld', () => {
  for (const c of courses) {
    const a = cycle.courses[c.id].aLevel, ib = cycle.courses[c.id].ib;
    if (c.grades.aLevels && a.status !== 'unverified') assert.equal(a.typicalOffer, c.grades.aLevels, c.id);
    if (typeof c.grades.ib === 'number' && ib.status !== 'unverified') {
      assert.ok(ib.overallScore === c.grades.ib || ib.withheld?.includes('overallScore'), c.id);
    }
  }
});

// Rows checked in the US verification pass (on or after snippetsRequiredFrom)
// come from official pages with quoted snippets — see us-verification.test.mjs.
// The migration rules below apply to every other row.
/** @param {any} e */
const fromPass = e => (e.lastVerified ?? '') >= /** @type {string} */ (config.snippetsRequiredFrom);

test('a row is verified only on a verified course record, with that record\'s source and date', () => {
  for (const c of courses) {
    for (const cat of ['aLevel', 'ib']) {
      const e = cycle.courses[c.id][cat];
      if (e.status === 'unverified' || fromPass(e)) continue;
      assert.equal(e.sources?.[0]?.url, c.verification.source, `${c.id} › ${cat}`);
      assert.equal(e.lastVerified, c.verification.checkedDate, `${c.id} › ${cat}`);
      if (c.verification.status === 'partial') assert.notEqual(e.status, 'verified', `${c.id} › ${cat}`);
    }
  }
});

test('the 7 courses verified on an IB applicants page have a verified IB row; SUTD (A-Level page) does not', () => {
  for (const id of ['ca-cs-mcgill', 'ca-maths-mcgill', 'ca-engineering-mcgill', 'ca-economics-mcgill', 'ca-cs-waterloo', 'ca-mathematics-waterloo', 'ca-engineering-dalhousie']) {
    assert.equal(cycle.courses[id].ib.status, 'verified', id);
    assert.equal(cycle.courses[id].admissionsTests.status, 'partial', `${id}: Phase 1 rows unchanged`);
  }
  assert.equal(cycle.courses['sg-engineering-sutd'].ib.status, 'partial');
  assert.match(cycle.courses['sg-engineering-sutd'].ib.note ?? '', /not on a page for IB applicants/);
});

test('graduate-entry courses are not applicable — unless the engine holds data for them', () => {
  for (const id of ['ca-law-utoronto', 'ca-law-ottawa', 'ca-law-york', 'ca-law-uvic']) {
    for (const cat of ['aLevel', 'ib']) {
      const e = cycle.courses[id][cat];
      assert.equal(e.status, 'notApplicable', `${id} › ${cat}`);
      assert.equal(e.accepted, 'no');
    }
  }
  // Undergraduate "pre-law track" degrees: their "Law is graduate-entry" note
  // is about the law school afterwards, so A-Level / IB are not "not applicable".
  for (const id of ['us-law-harvard', 'us-law-yale', 'us-law-georgetown']) {
    for (const cat of ['aLevel', 'ib']) assert.notEqual(cycle.courses[id][cat].status, 'notApplicable', `${id} › ${cat}`);
  }
  // The record says graduate-entry but the engine holds IB Higher Level subjects:
  // the conflict is shown, nothing is marked not applicable.
  for (const id of ['ca-medicine-mcgill', 'ca-medicine-dalhousie']) {
    assert.equal(cycle.courses[id].ib.status, 'partial');
    assert.equal(cycle.courses[id].aLevel.status, 'unverified');
    assert.match(cycle.courses[id].ib.note ?? '', /graduate-entry/);
  }
});

test('no admitted-student figure is shown as an A-Level or IB requirement', () => {
  for (const [id, rec] of Object.entries(cycle.courses)) {
    for (const cat of ['aLevel', 'ib']) {
      const e = rec[cat];
      // A figure attached to admitted students ("25th percentile of recent
      // admits", "admitted averages are mid-80s"). Qualitative remarks with
      // no figure ("admitted averages are far higher") are not ranges.
      const figure = /percentile|admitted (score|level)|admit[^.;]*?\b\d{2}(s|%)?\b|historically average|average[^.;]*\b\d{2}(\.\d)?(s|%)|finali[sz]ed at/i;
      for (const k of ['typicalOffer', 'detail']) assert.doesNotMatch(String(e[k] ?? ''), figure, `${id} › ${cat} › ${k}`);
      if (e.withheld) assert.match(e.note ?? '', /admitted-student figures/, `${id} › ${cat}: withheld values are explained`);
    }
  }
});

test('nothing is marked accepted without data: rows with no engine data are unverified, unless checked on an official page', () => {
  for (const c of courses) {
    const g = c.grades, a = cycle.courses[c.id].aLevel, ib = cycle.courses[c.id].ib;
    if (!g.aLevels && !fromPass(a)) assert.ok(['unverified', 'notApplicable'].includes(a.status), c.id);
    if (g.ib == null && !(g.ibHL ?? []).length && !g.ibHLNote && !fromPass(ib)) assert.ok(['unverified', 'notApplicable'].includes(ib.status), c.id);
    // A pass row never claims acceptance the source does not state outright.
    for (const e of [a, ib]) if (fromPass(e) && e.status !== 'unverified') assert.ok(e.sourceSnippet, c.id);
  }
});

// ── Schema and validation rules ──────────────────────────────────

const VERIFIED_AL = { status: 'verified', accepted: 'yes', typicalOffer: 'A*AA', subjects: { required: [{ name: 'Chemistry', code: 'Chemistry' }] }, sources: SRC, lastVerified: '2026-08-16' };

test('a complete verified qualification entry passes', () => {
  assert.deepEqual(entryErrors(VERIFIED_AL), []);
  assert.deepEqual(entryErrors({ status: 'verified', accepted: 'yes', overallScore: 39, detail: '766 at HL', sources: SRC, lastVerified: '2026-08-16' }), []);
});

test('a qualification entry without a source, with a future date, or with no value fails', () => {
  assert.match(entryErrors(omit(VERIFIED_AL, 'sources')).join(), /at least one source/);
  assert.match(entryErrors({ ...VERIFIED_AL, lastVerified: '2027-01-01' }).join(), /in the future/);
  assert.match(entryErrors(omit(VERIFIED_AL, 'lastVerified')).join(), /lastVerified/);
  assert.match(entryErrors({ status: 'verified', accepted: 'yes', sources: SRC, lastVerified: '2026-08-16' }).join(), /needs at least one of/);
  assert.match(entryErrors({ ...VERIFIED_AL, accepted: 'no' }).join(), /accepted: "yes" or "unknown"/);
});

test('qualification entries use structured fields, list entries keep items', () => {
  assert.match(entryErrors({ ...VERIFIED_AL, items: ['A*AA'] }).join(), /unknown field "items".*structured fields/);
  assert.match(entryErrors({ status: 'verified', items: ['x'], typicalOffer: 'A*AA', sources: SRC, lastVerified: '2026-08-16' }, 'list').join(), /unknown field "typicalOffer"/);
});

test('field shapes are checked', () => {
  assert.match(entryErrors({ ...VERIFIED_AL, overallScore: 52 }).join(), /overallScore/);
  assert.match(entryErrors({ ...VERIFIED_AL, overallScore: 38.5 }).join(), /overallScore/);
  assert.match(entryErrors({ ...VERIFIED_AL, subjects: { mandatory: [{ name: 'x', code: 'x' }] } }).join(), /unknown subject group "mandatory"/);
  assert.match(entryErrors({ ...VERIFIED_AL, subjects: { required: [] } }).join(), /non-empty array/);
  assert.match(entryErrors({ ...VERIFIED_AL, subjects: { required: [{ name: 'Chemistry' }] } }).join(), /"name" and "code"/);
  assert.match(entryErrors({ ...VERIFIED_AL, typicalOffer: ' ' }).join(), /"typicalOffer" must be a non-empty string/);
});

test('a withheld value must not also be shown, and needs a note', () => {
  assert.match(entryErrors({ ...VERIFIED_AL, withheld: ['typicalOffer'] }).join(), /also shown/);
  const noOffer = omit(VERIFIED_AL, 'typicalOffer');
  assert.match(entryErrors({ ...noOffer, withheld: ['typicalOffer'] }).join(), /must say why/);
  assert.deepEqual(entryErrors({ ...noOffer, withheld: ['typicalOffer'], note: 'Admitted-student figure.' }), []);
  assert.match(entryErrors({ ...noOffer, withheld: ['subjects'], note: 'x' }).join(), /"withheld" must be/);
});

test('not applicable needs accepted "no", a source, a date and a reason — and no values', () => {
  const na = { status: 'notApplicable', accepted: 'no', sources: SRC, lastVerified: '2026-08-16', note: 'Graduate-entry programme.' };
  assert.deepEqual(entryErrors(na), []);
  assert.match(entryErrors({ ...na, note: undefined }).join(), /must say why/);
  assert.match(entryErrors({ ...na, accepted: 'yes' }).join(), /accepted: "no"/);
  assert.match(entryErrors({ ...na, typicalOffer: 'AAA' }).join(), /may not carry "typicalOffer"/);
  assert.match(entryErrors(omit(na, 'sources')).join(), /at least one source/);
  assert.match(entryErrors(na, 'list').join(), /only for qualification categories/);
});

test('an unverified qualification entry carries no values', () => {
  assert.deepEqual(entryErrors({ status: 'unverified' }), []);
  assert.deepEqual(entryErrors({ status: 'unverified', accepted: 'unknown', note: 'Conflict.' }), []);
  assert.match(entryErrors({ status: 'unverified', typicalOffer: 'AAA' }).join(), /may not carry "typicalOffer"/);
  assert.match(entryErrors({ status: 'unverified', accepted: 'yes' }).join(), /accepted: "unknown"/);
});

test('values that disagree with the matching engine are reported', () => {
  const course = { grades: { aLevels: 'A*AA', ib: 39, ibHL: ['Chemistry'], ibHLNote: '766 at HL' }, requirements: { essential: ['Chemistry'], preferred: [] } };
  assert.deepEqual(engineDisagreements('aLevel', /** @type {any} */ (VERIFIED_AL), course), []);
  assert.match(engineDisagreements('aLevel', /** @type {any} */ ({ ...VERIFIED_AL, typicalOffer: 'AAA' }), course).join(), /typicalOffer "AAA" disagrees with courseRequirements\.js grades\.aLevels "A\*AA"/);
  assert.match(engineDisagreements('aLevel', /** @type {any} */ ({ ...VERIFIED_AL, subjects: undefined }), course).join(), /subjects\.required/);
  const ib = { status: 'verified', accepted: 'yes', overallScore: 39, detail: '766 at HL', subjects: { required: [{ name: 'Chemistry', code: 'Chemistry' }], higherLevel: [{ name: 'Chemistry', code: 'Chemistry' }] }, sources: SRC, lastVerified: '2026-08-16' };
  assert.deepEqual(engineDisagreements('ib', /** @type {any} */ (ib), course), []);
  assert.match(engineDisagreements('ib', /** @type {any} */ ({ ...ib, overallScore: 38 }), course).join(), /overallScore 38 disagrees/);
  assert.match(engineDisagreements('ib', /** @type {any} */ ({ ...ib, subjects: { required: ib.subjects.required } }), course).join(), /subjects\.higherLevel/);
  // A withheld score is fine only while the engine actually holds one.
  const noScore = omit(ib, 'overallScore');
  assert.deepEqual(engineDisagreements('ib', /** @type {any} */ ({ ...noScore, withheld: ['overallScore'] }), course), []);
  assert.match(engineDisagreements('ib', /** @type {any} */ ({ ...noScore, withheld: ['overallScore'] }), { ...course, grades: { ...course.grades, ib: null } }).join(), /withheld but the engine holds no/);
  // Not applicable while the engine would still match students on an offer.
  assert.match(engineDisagreements('aLevel', /** @type {any} */ ({ status: 'notApplicable', accepted: 'no', sources: SRC, lastVerified: '2026-08-16', note: 'x' }), course).join(), /marked notApplicable but the engine holds/);
});

test('the validator fails a cycle whose A-Level row disagrees with the engine', () => {
  const id = 'uk-medicine-oxford';
  const broken = { ...cycle, courses: { ...cycle.courses, [id]: { ...cycle.courses[id], aLevel: { ...cycle.courses[id].aLevel, typicalOffer: 'AAA' } } } };
  const errors = validateCycle(broken, { config, courses, today: TODAY }).filter(p => p.level === 'error');
  assert.equal(errors.length, 1);
  assert.match(errors[0].where, /uk-medicine-oxford › aLevel/);
});

test('the validator fails a course with no A-Level or IB entry, and a config without the categories', () => {
  const id = 'uk-medicine-oxford';
  const missing = { ...cycle, courses: { ...cycle.courses, [id]: omit(cycle.courses[id], 'ib') } };
  assert.match(validateCycle(missing, { config, courses, today: TODAY }).map(p => `${p.where}: ${p.message}`).join(), /uk-medicine-oxford › ib: missing required category/);
  const noIb = { ...config, categories: config.categories.filter(c => c.id !== 'ib') };
  assert.match(validateConfig(noIb).map(p => p.message).join(), /IB category \("ib"\) is missing/);
  assert.deepEqual(validateConfig(config), []);
  assert.ok(byId.size === 320);
});

test('new cycle: A-Level, IB and not-applicable rows draft as unverified, keeping the old value', () => {
  const al = carryEntry(cycle.courses['uk-medicine-oxford'].aLevel, '2027 entry');
  assert.deepEqual(Object.keys(al), ['status', 'recorded']);
  assert.equal(al.status, 'unverified');
  assert.match(al.recorded ?? '', /^A\*AA; Required subjects: Chemistry, Biology; Preferred subjects: Physics \(2027 entry, verified 23 Jun 2026\)$/);
  const na = carryEntry(cycle.courses['ca-law-york'].ib, '2027 entry');
  assert.equal(na.status, 'unverified');
  assert.match(na.recorded ?? '', /^Not applicable — .*\(2027 entry, checked \d+ [A-Z][a-z]{2} 2026\)$/);
});

// ── The panel ────────────────────────────────────────────────────

const qualCats = config.categories.filter(c => c.kind === 'qualification');
/** @param {any} record */
const panel = record => view.panelHtml({ record, categories: qualCats, cycleLabel: '2027 entry', fallbackUrl: 'https://example.ac.uk/course' });
/** @param {string} html @param {string} cat */
const row = (html, cat) => html.split(`data-req-category="${cat}"`)[1].split('data-req-category')[0];

test('an A-Level row shows grades and subjects as a definition list, with badge, date and source', () => {
  const r = row(panel(cycle.courses['uk-medicine-oxford']), 'aLevel');
  assert.match(r, /<dl class="reqs__facts">/);
  assert.match(r, /<dt>Grades<\/dt><dd>A\*AA<\/dd>/);
  assert.match(r, /<dt>Required subjects<\/dt><dd>Chemistry, Biology<\/dd>/);
  assert.match(r, /<dt>Preferred subjects<\/dt><dd>Physics<\/dd>/);
  assert.match(r, /reqs__badge--verified">Verified/);
  assert.match(r, /23 Jun 2026/);
  assert.match(r, /href="https:\/\/www\.medsci\.ox\.ac\.uk\/[^"]*"[^>]*>Official source<\/a>/);
});

test('an IB row shows the overall score, Higher Level subjects and subject grades', () => {
  const r = row(panel(cycle.courses['uk-medicine-oxford']), 'ib');
  assert.match(r, /<dt>Overall score<\/dt><dd>39 points<\/dd>/);
  assert.match(r, /<dt>Higher Level<\/dt><dd>Chemistry, Biology<\/dd>/);
  assert.match(r, /<dt>Details<\/dt><dd>766 at HL<\/dd>/);
});

test('a missing score reads "Not recorded"; a withheld one reads "Not shown" with the reason', () => {
  const mcgill = row(panel(cycle.courses['ca-cs-mcgill']), 'ib');
  assert.match(mcgill, /<dt>Overall score<\/dt><dd class="reqs__fact-empty">Not recorded<\/dd>/);
  const hkust = row(panel(cycle.courses['hk-cs-hkust']), 'ib');
  assert.match(hkust, /<dt>Overall score<\/dt><dd class="reqs__fact-empty">Not shown — see note<\/dd>/);
  assert.match(hkust, /<dt>Details<\/dt><dd class="reqs__fact-empty">Not shown — see note<\/dd>/);
  assert.match(hkust, /admitted-student figures/);
  assert.doesNotMatch(hkust, /percentile/);
});

test('a not-applicable row says so with its own badge, and is left out of the verified tally', () => {
  const html = panel(cycle.courses['ca-law-york']);
  assert.match(row(html, 'aLevel'), /Not an entry route for this course/);
  assert.match(row(html, 'aLevel'), /reqs__badge--notApplicable">Not applicable/);
  assert.match(row(html, 'aLevel'), /Graduate-entry programme/);
  assert.match(html, /0 of 0 verified/);
  assert.match(panel(cycle.courses['uk-medicine-oxford']), /2 of 2 verified/);
});

test('an A-Level / IB row with no data is "Not verified" and points at the official page', () => {
  const r = row(panel(cycle.courses['us-cs-mit']), 'aLevel');
  assert.match(r, /reqs__badge--unverified">Not verified/);
  assert.match(r, /href="https:\/\/example\.ac\.uk\/course"/);
  assert.doesNotMatch(r, /reqs__facts/);
});

test('entryText gives one honest line for A-Level, IB and not-applicable rows', () => {
  assert.equal(view.entryText(cycle.courses['uk-medicine-oxford'].aLevel), 'A*AA; Required subjects: Chemistry, Biology; Preferred subjects: Physics (verified 23 Jun 2026)');
  assert.match(view.entryText(cycle.courses['uk-medicine-oxford'].ib), /^39 points; .*Higher Level: Chemistry, Biology; Details: 766 at HL \(verified 23 Jun 2026\)$/);
  assert.match(view.entryText(cycle.courses['ca-law-york'].aLevel), /^Not applicable — Graduate-entry programme.* \(checked \d+ [A-Z][a-z]{2} 2026\)$/);
  assert.equal(view.entryText(cycle.courses['us-cs-mit'].ib), view.UNVERIFIED_TEXT);
});

test('A-Level / IB data is escaped', () => {
  const html = panel({ aLevel: { ...VERIFIED_AL, typicalOffer: '<img src=x onerror=alert(1)>' } });
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
});
