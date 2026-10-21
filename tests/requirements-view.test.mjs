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

test('each category is a status card: list items with label lead-ins, footer after the note', () => {
  /** @type {any} */
  const english = { status: 'verified', items: ['Required if English is not your first language', 'Minimum scores: IELTS 7.5; TOEFL iBT 102 (taken before Jan 2026; 5 after); Duolingo <135>'], sources: [{ url: 'https://example.edu/eng', label: 'English' }], lastVerified: '2026-10-19', note: 'Official results only.' };
  const html = view.panelHtml({ record: { englishLanguage: english }, categories: [{ id: 'englishLanguage', label: 'English language' }], cycleLabel: '2027 entry' });
  assert.match(html, /class="reqs__row reqs__row--verified"/);
  assert.match(html, /<li>Required if English is not your first language<\/li>/);
  assert.match(html, /<span class="reqs__item-label">Minimum scores:<\/span><ul class="reqs__sublist">/);
  // Split only on top-level "; " — the parenthesised one stays whole — and escaped.
  const subs = [...html.matchAll(/<ul class="reqs__sublist">(.*?)<\/ul>/gs)][0][1].match(/<li>.*?<\/li>/g);
  assert.deepEqual(subs, ['<li>IELTS 7.5</li>', '<li>TOEFL iBT 102 (taken before Jan 2026; 5 after)</li>', '<li>Duolingo &lt;135&gt;</li>']);
  // The note sits in the card body; badge, date and source are the card's footer.
  assert.ok(html.indexOf('reqs__note') < html.indexOf('class="reqs__meta"'));
  assert.match(html, /<div class="reqs__meta"><span class="reqs__badge reqs__badge--verified">Verified<\/span><span class="reqs__date">19 Oct 2026<\/span>/);
  // The one-line text (CSV / copy) is unchanged by the card layout.
  assert.equal(view.entryText(/** @type {any} */ (english)), 'Required if English is not your first language; Minimum scores: IELTS 7.5; TOEFL iBT 102 (taken before Jan 2026; 5 after); Duolingo <135> (verified 19 Oct 2026)');
});

test('courseVerificationStatus: verified only when no row is partial or unverified', () => {
  const v = { status: 'verified' }, p = { status: 'partial' }, u = { status: 'unverified' }, na = { status: 'notApplicable' };
  const s = (/** @type {any} */ r) => view.courseVerificationStatus(r);
  assert.equal(s({ a: v, b: na }), 'verified');
  assert.equal(s({ a: v, b: p }), 'partial');
  assert.equal(s({ a: v, b: u }), 'partial');
  assert.equal(s({ a: u, b: u }), 'unverified');
  assert.equal(s(null), 'unverified');
});
