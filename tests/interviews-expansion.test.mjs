// @ts-check
// The interview expansion (research/interviews-expansion-proposed.json): what loads, what is held back,
// the new record fields, the validator rules and the five card states.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, loadCourses } from '../scripts/lib/requirements-io.mjs';
import { validateInterviews } from '../scripts/lib/validate-interviews.mjs';

const require = createRequire(import.meta.url);
const { interviewData: D } = require('../data/interviews.js');
const V = require('../interview-view.js');
const expansion = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/interviews-expansion-proposed.json'), 'utf8'));
const courses = loadCourses();
const clone = (/** @type {any} */ x) => JSON.parse(JSON.stringify(x));
const errors = (/** @type {any} */ d) => validateInterviews(d, { courses, today: new Date().toISOString().slice(0, 10) }).filter(p => p.level === 'error').map(p => p.message).join(' | ');
const view = (/** @type {string} */ id) => /** @type {any} */ (V.forCourse(D, id));
const card = (/** @type {string} */ id) => V.sectionHtml(view(id), { practise: true, fallbackUrl: 'https://example.ac.uk/c' });
// Visible text only (attributes such as data-req-category="interview" are markup, not words on screen).
const text = (/** @type {string} */ html) => html.replace(/<\/(p|dt|dd|div|li|button)>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

test('route-limited: "Interviews some applicants: <route>" with a source link, no practice button', () => {
  const html = card('hk-cs-cuhk');
  assert.equal(view('hk-cs-cuhk').kind, 'route');
  assert.match(text(html), /Interviews some applicants: JUPAS applicants Source/);
  assert.equal((html.match(/Interviews some applicants/g) ?? []).length, 1);   // the same route is not repeated
  assert.match(html, /<a class="reqs__link" href="https:\/\/[^"]+"[^>]*>Source<\/a>/);
  assert.doesNotMatch(html, /data-iv-practise|Practise/);
  assert.equal(V.interviews(view('hk-cs-cuhk')), false);
  assert.match(text(card('uk-cs-glasgow')), /Interviews some applicants: entry into Year 2 in any subject/);
  assert.match(text(card('ie-medicine-trinity')), /Interviews some applicants: mature applicants/);
});

test('university term: the university\'s word, never "interview"; practice labelled with the term', () => {
  for (const [id, term] of [['ca-engineering-utoronto', 'Personal Profile'], ['ca-business-queens', 'Supplementary Application'],
    ['ca-engineering-mcmaster', 'supplementary application'], ['sg-engineering-sutd', 'conversation session']]) {
    const v = view(id);
    assert.equal(v.kind, 'term', id);
    const html = card(id);
    // Our own words (labels, button) never say interview; quoted text is the university's and is not reworded.
    const ours = text(html).replace(/“[^”]*”/g, '');
    assert.doesNotMatch(ours, /interview/i, id);
    assert.ok(html.includes(`Practise for the ${term}</button>`), id);
    assert.equal(V.interviews(v), true, id);
  }
  assert.match(card('ca-engineering-utoronto'), /<dt class="reqs__label">Personal Profile<\/dt>/);
});

test('"no": "<University> states it does not interview for this course." with the source link', () => {
  const html = card('uk-economics-lse');
  assert.equal(view('uk-economics-lse').kind, 'no');
  assert.match(text(html), /^Interview London School of Economics states it does not interview for this course\. Source$/);
  assert.equal(V.interviews(view('uk-economics-lse')), false);
});

test('third-party only: "No university interview. Accepts an interview through <provider>." with source links', () => {
  assert.match(text(card('us-cs-caltech')), /No university interview\. Accepts an interview through InitialView\. Source/);
  assert.match(text(card('us-cs-cmu')), /through InitialView or Vericant\./);
  assert.match(text(card('us-cs-gatech')), /through InitialView and Vericant\./);
  assert.equal(V.interviews(view('us-cs-caltech')), false);
});

test('not published and manual review keep the existing wording and never imply there is no interview', () => {
  for (const id of ['hk-maths-hkust', 'hk-sciences-hkust', 'ca-engineering-waterloo', 'us-business-emory', 'us-cs-notredame', 'hk-business-hku', 'uk-cs-ucl']) {
    const html = card(id);
    assert.equal(view(id).kind, 'unavailable', id);
    assert.ok(text(html).includes("Interview details aren't available from the university's site yet. Check the course page."), id);
    assert.doesNotMatch(html, /does not interview|No university interview|Interviews some applicants/, id);
  }
});

test('held back: HKUST Science/Maths are not "no"; Notre Dame, Emory, Waterloo and the HKU Business FAQ are manual review', () => {
  const ids = (/** @type {string} */ c) => D.courses[c] ?? [];
  for (const c of ['hk-maths-hkust', 'hk-sciences-hkust']) assert.ok(ids(c).every((/** @type {string} */ r) => D.records[r].interviewed !== 'no'), c);
  const shown = JSON.stringify(Object.values(D.records).filter((/** @type {any} */ r) => !r.unavailable));
  for (const u of ['University of Notre Dame', 'Emory University', 'University of Waterloo']) assert.ok(!shown.includes(`"university":"${u}"`), u);
  assert.ok(!shown.includes('ug.hkubs.hku.hk'));
  const excluded = new Set(D.excludedSources.map((/** @type {any} */ e) => e.url));
  assert.ok(excluded.has('https://ug.hkubs.hku.hk/admission/faq/jupas-applicants'));
});

test('nothing loads for the five graduate-entry courses', () => {
  for (const n of expansion.notOpenToSchoolLeavers) for (const c of n.courseIds) assert.equal(D.courses[c], undefined, c);
});

test('practice (Home, Story, card buttons) counts only all-applicant and university-term records', () => {
  const kinds = Object.keys(D.courses).filter(c => V.interviews(V.forCourse(D, c))).map(c => view(c).kind);
  assert.ok(kinds.length > 66);
  assert.deepEqual([...new Set(kinds)].sort(), ['all', 'term']);
});

test('validator: "no" needs the statement; term and provider must be in the quotes; one new field at most', () => {
  const mutate = (/** @type {(d: any) => void} */ f) => { const d = clone(D); f(d); return errors(d); };
  const no = /** @type {any} */ (Object.values(D.records).find((/** @type {any} */ r) => r.interviewed === 'no' && !r.thirdPartyOnly));
  const tp = /** @type {any} */ (Object.values(D.records).find((/** @type {any} */ r) => r.thirdPartyOnly));
  assert.equal(errors(D), '');
  assert.match(mutate(d => { d.records[no.id].statement = []; }), /"no" needs the university's statement/);
  assert.match(mutate(d => { d.records[no.id].statement[0].sourceSnippet = ''; }), /verbatim sourceSnippet/);
  assert.match(mutate(d => { delete d.records[no.id].statement[0].accessed; }), /accessed date/);
  assert.match(mutate(d => { d.records[no.id].statement[0].source = 'http://x'; }), /https source/);
  assert.match(mutate(d => { d.records['utoronto-engineering'].universityTerm = 'Video Thing'; }), /not in the record's quotes/);
  assert.match(mutate(d => { d.records[tp.id].thirdPartyOnly = 'Acme Interviews'; }), /not named in the record's quotes/);
  assert.match(mutate(d => { d.records['cuhk-cs'].universityTerm = 'JS4412'; }), /only one of appliesTo, universityTerm, thirdPartyOnly/);
  assert.match(mutate(d => { d.records['cuhk-cs'].appliesTo = ''; }), /appliesTo must be a non-empty string/);
});
