// @ts-check
// Unit tests for the requirements validator — each rule against small fixtures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEntry, validateCycle, validateConfig, isIsoDate } from '../scripts/lib/validate-requirements.mjs';

const TODAY = '2026-10-19';
const SRC = [{ url: 'https://www.example.ac.uk/course', label: 'Official source' }];

/** @param {any} entry */
function entryErrors(entry, today = TODAY) {
  /** @type {any[]} */ const out = [];
  validateEntry(entry, 'x', today, out);
  return out.filter(p => p.level === 'error').map(p => p.message);
}

test('isIsoDate accepts real dates and rejects impossible ones', () => {
  assert.equal(isIsoDate('2026-08-16'), true);
  assert.equal(isIsoDate('2026-02-30'), false);
  assert.equal(isIsoDate('16/08/2026'), false);
  assert.equal(isIsoDate(''), false);
});

test('a complete verified entry passes', () => {
  assert.deepEqual(entryErrors({ status: 'verified', items: ['UCAT — required'], sources: SRC, lastVerified: '2026-08-16' }), []);
  assert.deepEqual(entryErrors({ status: 'verified', none: true, sources: SRC, lastVerified: '2026-08-16' }), []);
});

test('a verified entry without a source or date fails', () => {
  assert.match(entryErrors({ status: 'verified', items: ['x'], lastVerified: '2026-08-16' }).join(), /at least one source/);
  assert.match(entryErrors({ status: 'verified', items: ['x'], sources: SRC }).join(), /lastVerified/);
  assert.match(entryErrors({ status: 'verified', items: ['x'], sources: [{ url: 'not-a-url' }], lastVerified: '2026-08-16' }).join(), /http\(s\) URL/);
});

test('a future verification date fails', () => {
  assert.match(entryErrors({ status: 'verified', items: ['x'], sources: SRC, lastVerified: '2027-01-01' }).join(), /in the future/);
});

test('a verified entry needs exactly one of items / none', () => {
  assert.match(entryErrors({ status: 'verified', sources: SRC, lastVerified: '2026-08-16' }).join(), /exactly one of/);
  assert.match(entryErrors({ status: 'verified', items: ['x'], none: true, sources: SRC, lastVerified: '2026-08-16' }).join(), /exactly one of/);
  assert.match(entryErrors({ status: 'verified', items: [], sources: SRC, lastVerified: '2026-08-16' }).join(), /non-empty array/);
});

test('a partial entry must say what is unconfirmed', () => {
  assert.match(entryErrors({ status: 'partial', items: ['x'], sources: SRC, lastVerified: '2026-08-16' }).join(), /partial entry must say/);
  assert.deepEqual(entryErrors({ status: 'partial', items: ['x'], sources: SRC, lastVerified: '2026-08-16', note: 'Grades not stated.' }), []);
});

test('an unverified entry may not look verified', () => {
  assert.deepEqual(entryErrors({ status: 'unverified' }), []);
  assert.deepEqual(entryErrors({ status: 'unverified', recorded: 'SAT/ACT required' }), []);
  for (const k of ['items', 'none', 'sources', 'lastVerified', 'codes']) {
    const e = { status: 'unverified', [k]: k === 'none' ? true : k === 'lastVerified' ? '2026-08-16' : ['x'] };
    assert.match(entryErrors(e).join(), new RegExp(`may not carry "${k}"`));
  }
});

test('unknown status and unknown fields fail', () => {
  assert.match(entryErrors({ status: 'probably' }).join(), /status must be one of/);
  assert.match(entryErrors({ status: 'unverified', value: 'x' }).join(), /unknown field "value"/);
});

test('a stale verification date warns but does not fail', () => {
  /** @type {any[]} */ const out = [];
  validateEntry({ status: 'verified', items: ['x'], sources: SRC, lastVerified: '2024-01-01' }, 'x', TODAY, out);
  assert.equal(out.filter(p => p.level === 'error').length, 0);
  assert.equal(out.filter(p => p.level === 'warning').length, 1);
});

// ── Cycle-level rules ────────────────────────────────────────────
const config = {
  currentCycle: '2027',
  cycles: { '2027': { label: '2027 entry', applicationPeriod: '2026–27 application cycle' } },
  categories: [{ id: 'satAct', label: 'SAT / ACT' }, { id: 'admissionsTests', label: 'Admissions tests' }],
};
const courses = [
  { id: 'a', admissionTests: ['UCAT'], requirements: { essential: [], preferred: [] } },
  { id: 'b', admissionTests: [], requirements: { essential: [], preferred: [] } },
];
const good = () => ({
  cycle: '2027', label: '2027 entry',
  courses: {
    a: { satAct: { status: 'unverified' }, admissionsTests: { status: 'verified', items: ['UCAT — required'], codes: ['UCAT'], sources: SRC, lastVerified: '2026-08-16' } },
    b: { satAct: { status: 'unverified' }, admissionsTests: { status: 'verified', none: true, sources: SRC, lastVerified: '2026-08-16' } },
  },
});
/** @param {any} cycle */
const cycleErrors = cycle => validateCycle(cycle, { config, courses, today: TODAY }).filter(p => p.level === 'error').map(p => `${p.where}: ${p.message}`);

test('a complete cycle passes', () => {
  assert.deepEqual(cycleErrors(good()), []);
});

test('a course missing from the current cycle fails', () => {
  const c = good(); delete /** @type {any} */ (c.courses).b;
  assert.match(cycleErrors(c).join(), /b: course has no requirements record/);
});

test('a record missing a category fails', () => {
  const c = good(); delete /** @type {any} */ (c.courses.a).satAct;
  assert.match(cycleErrors(c).join(), /a › satAct: missing required category/);
});

test('an unknown category fails', () => {
  const c = good(); /** @type {any} */ (c.courses.a).aLevel = { status: 'unverified' };
  assert.match(cycleErrors(c).join(), /unknown category/);
});

test('admissions tests that disagree with the course dataset fail', () => {
  const c = good(); c.courses.a.admissionsTests.codes = ['LNAT'];
  assert.match(cycleErrors(c).join(), /disagree with courseRequirements\.js/);
});

test('a cycle not listed in config fails', () => {
  assert.match(cycleErrors({ ...good(), cycle: '2031' }).join(), /not listed in config\.cycles/);
});

test('validateConfig catches a current cycle with no entry', () => {
  assert.match(validateConfig({ ...config, currentCycle: '2028' }).map(p => p.message).join(), /currentCycle "2028"/);
});
