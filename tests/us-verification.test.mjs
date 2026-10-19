// @ts-check
// The US verification pass: source snippets on newly checked entries,
// owner flags, the IB-note rule, and — over the real data — that every US
// row checked in the pass is official-sourced and quoted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig, loadCourses, loadCycle } from '../scripts/lib/requirements-io.mjs';
import { validateEntry, validateConfig, engineDisagreements } from '../scripts/lib/validate-requirements.mjs';

const config = loadConfig();
const courses = loadCourses();
const cycle = loadCycle(config.currentCycle);
const TODAY = '2026-10-19';
const FROM = '2026-10-19';
const SRC = [{ url: 'https://admissions.example.edu/testing', label: 'Testing policy' }];

/** @param {any} entry @param {'list' | 'qualification'} [kind] */
function errors(entry, kind = 'list') {
  /** @type {any[]} */ const out = [];
  validateEntry(entry, 'x', TODAY, out, kind, { snippetsRequiredFrom: FROM });
  return out.filter(p => p.level === 'error').map(p => p.message);
}

test('an entry checked on or after snippetsRequiredFrom must quote its source', () => {
  const e = { status: 'verified', items: ['SAT or ACT required'], sources: SRC, lastVerified: '2026-10-19' };
  assert.match(errors(e).join(), /no "sourceSnippet"/);
  assert.deepEqual(errors({ ...e, sourceSnippet: 'All first-year applicants must include scores from the ACT or SAT.' }), []);
  // Checked before the rule existed: grandfathered.
  assert.deepEqual(errors({ ...e, lastVerified: '2026-08-16' }), []);
  // "None listed" and not-applicable rows need one too.
  assert.match(errors({ status: 'verified', none: true, sources: SRC, lastVerified: '2026-10-19' }).join(), /no "sourceSnippet"/);
  assert.match(errors({ status: 'notApplicable', accepted: 'no', sources: SRC, lastVerified: '2026-10-19', note: 'x' }, 'qualification').join(), /no "sourceSnippet"/);
});

test('snippet shape: a string, or one quote per source', () => {
  const e = { status: 'verified', items: ['x'], sources: [...SRC, { url: 'https://admissions.example.edu/apply' }], lastVerified: '2026-10-19' };
  assert.deepEqual(errors({ ...e, sourceSnippet: ['quote one', 'quote two'] }), []);
  assert.match(errors({ ...e, sourceSnippet: ['quote one'] }).join(), /1 quotes for 2 sources/);
  assert.match(errors({ ...e, sourceSnippet: ' ' }).join(), /non-empty string/);
  assert.match(errors({ ...e, sourceSnippet: [] }).join(), /non-empty string/);
});

test('an unverified entry may not carry a snippet; any entry may carry an owner flag', () => {
  assert.match(errors({ status: 'unverified', sourceSnippet: 'x' }).join(), /may not carry "sourceSnippet"/);
  assert.deepEqual(errors({ status: 'unverified', note: 'https://admissions.example.edu returned 403 on 2026-10-19.', reviewFlag: 'Check the engine.' }), []);
  assert.match(errors({ status: 'unverified', reviewFlag: '' }).join(), /reviewFlag/);
});

test('validateConfig checks snippetsRequiredFrom', () => {
  assert.deepEqual(validateConfig(config), []);
  assert.match(validateConfig({ ...config, snippetsRequiredFrom: 'soon' }).map(p => p.message).join(), /snippetsRequiredFrom/);
});

test('a verified IB note may be added where the engine holds none, but must match one it holds', () => {
  const e = { status: 'verified', accepted: 'unknown', detail: 'IB scores may be self-reported but are not required.', sources: SRC, lastVerified: '2026-10-19', sourceSnippet: 'x' };
  const empty = { grades: { ib: null, ibHL: [], ibHLNote: null }, requirements: { essential: [], preferred: [] } };
  assert.deepEqual(engineDisagreements('ib', /** @type {any} */ (e), empty), []);
  const held = { ...empty, grades: { ...empty.grades, ibHLNote: '766 at HL' } };
  assert.match(engineDisagreements('ib', /** @type {any} */ (e), held).join(), /detail .* disagrees/);
});

// ── The real data ────────────────────────────────────────────────

const us = courses.filter(c => c.country === 'US');
const passEntries = us.flatMap(c => Object.entries(cycle.courses[c.id])
  .filter(([, e]) => e.status !== 'unverified' && (e.lastVerified ?? '') >= /** @type {string} */ (config.snippetsRequiredFrom))
  .map(([cat, e]) => ({ id: c.id, cat, e })));

test('every US row checked in the pass cites an official https source and quotes it', () => {
  // Official university domains (or the admissions sites they run), never aggregators.
  const official = /\.edu$|^mitadmissions\.org$/;
  for (const { id, cat, e } of passEntries) {
    assert.ok(e.sourceSnippet, `${id} › ${cat}: snippet`);
    for (const s of e.sources ?? []) {
      const host = new URL(s.url).hostname;
      assert.ok(s.url.startsWith('https://') && official.test(host), `${id} › ${cat}: ${s.url} is not an official university source`);
    }
  }
});

test('no admitted-student figure is stated as a US requirement', () => {
  const figure = /middle[ -]50|25th|75th|percentile|admitted students?'? (scores?|averages?)|most competitive applicants (typically )?(earn|have)/i;
  for (const { id, cat, e } of passEntries) {
    for (const item of e.items ?? []) assert.doesNotMatch(item, figure, `${id} › ${cat}: ${item}`);
  }
});

test('Yale: SAT/ACT is verified as required, and the stale engine policy is flagged for the owner', () => {
  for (const id of us.filter(c => c.university === 'Yale University').map(c => c.id)) {
    const sat = cycle.courses[id].satAct;
    assert.equal(sat.status, 'verified', id);
    assert.match((sat.items ?? []).join(' '), /ACT or SAT/);
    assert.match(String(sat.sourceSnippet), /must include scores from the ACT or SAT/);
    assert.match(sat.reviewFlag ?? '', /test-flexible|"flexible"/i);
  }
});
