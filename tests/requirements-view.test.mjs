// @ts-check
// Rendering tests for the Entry requirements panel (requirements-view.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const view = require('../requirements-view.js');

const categories = [
  { id: 'satAct', label: 'SAT / ACT' },
  { id: 'admissionsTests', label: 'Admissions tests' },
  { id: 'otherQualifications', label: 'Other qualifications' },
];
/** @type {Record<string, import('../data/requirements/config.js').RequirementEntry>} */
const record = {
  satAct: { status: 'unverified', recorded: 'SAT/ACT required' },
  admissionsTests: { status: 'verified', items: ['UCAT — required'], codes: ['UCAT'], sources: [{ url: 'https://example.ac.uk/med', label: 'Official source' }], lastVerified: '2026-08-16' },
  otherQualifications: { status: 'partial', items: ['Advanced Placement: 3 AP exams'], sources: [{ url: 'https://example.ac.uk/ap', label: 'AP guidance' }], lastVerified: '2026-08-22', note: 'Grades not stated.' },
};
/** @param {any} [over] */
const render = over => view.panelHtml({ record, categories, cycleLabel: '2027 entry', fallbackUrl: 'https://example.ac.uk/course', ...over });

test('formatDate is locale-independent', () => {
  assert.equal(view.formatDate('2026-08-16'), '16 Aug 2026');
  assert.equal(view.formatDate('2027-01-05'), '5 Jan 2027');
  assert.equal(view.formatDate('nonsense'), '');
});

test('the panel shows the admissions cycle and a verified tally', () => {
  const html = render();
  assert.match(html, /<span class="reqs__cycle">2027 entry<\/span>/);
  assert.match(html, /1 of 3 verified/);
});

test('one row per configured category, in config order', () => {
  const ids = [...render().matchAll(/data-req-category="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['satAct', 'admissionsTests', 'otherQualifications']);
});

test('a verified row shows the value, the verified date and the source link', () => {
  const row = render().split('data-req-category="admissionsTests"')[1].split('reqs__row')[0];
  assert.match(row, /<li>UCAT — required<\/li>/);
  assert.match(row, /reqs__badge--verified">Verified/);
  assert.match(row, /16 Aug 2026/);
  assert.match(row, /href="https:\/\/example\.ac\.uk\/med"[^>]*>Official source<\/a>/);
});

test('a partial row shows its note', () => {
  const row = render().split('data-req-category="otherQualifications"')[1];
  assert.match(row, /Partly verified/);
  assert.match(row, /Grades not stated\./);
});

test('an unverified row says so, shows no date, and points at the official page', () => {
  const row = render().split('data-req-category="satAct"')[1].split('data-req-category')[0];
  assert.match(row, /Not verified/);
  assert.doesNotMatch(row, /\d{1,2} [A-Z][a-z]{2} \d{4}/);
  assert.match(row, /href="https:\/\/example\.ac\.uk\/course"/);
  assert.match(row, /Previously recorded, not verified: SAT\/ACT required/);
});

test('a category with no entry at all renders as not verified', () => {
  const html = render({ record: {} });
  assert.equal((html.match(/reqs__badge--unverified/g) ?? []).length, 3);
  assert.match(html, /0 of 3 verified/);
});

test('without an official URL the unverified row still tells the student what to do', () => {
  assert.match(render({ fallbackUrl: null }), /Check with the university\./);
});

test('data is escaped', () => {
  const html = render({ record: { ...record, admissionsTests: { ...record.admissionsTests, items: ['<script>alert(1)</script>'] } } });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('entryText gives one honest line per entry', () => {
  assert.equal(view.entryText(record.admissionsTests), 'UCAT — required (verified 16 Aug 2026)');
  assert.equal(view.entryText(record.otherQualifications), 'Advanced Placement: 3 AP exams (partly verified 22 Aug 2026)');
  assert.equal(view.entryText(record.satAct), view.UNVERIFIED_TEXT);
  assert.equal(view.entryText(undefined), view.UNVERIFIED_TEXT);
});
