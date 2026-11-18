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
  assert.match(text(card('ie-medicine-trinity')), /Interviews some applicants: mature applicants Source/);
  assert.match(text(card('sg-cs-ntu')), /Interviews some applicants: aptitude-based admissions scheme Source/);
  // NTU's international-qualifications line could not be backed by one quote: not shown.
  assert.doesNotMatch(text(card('sg-cs-ntu')), /Gao Kao|Indonesia/);
});

test('route quote mode: "Interviews some applicants. <University> says:" and the quote that names the route, in full', () => {
  const QUOTE = ['bath-mathematics', 'bath-qualification-route-uk-accounting-bath', 'bath-qualification-route-uk-cs-bath',
    'bath-qualification-route-uk-economics-bath', 'bath-qualification-route-uk-engineering-bath', 'glasgow-year2-entry',
    'michigan-engineering', 'nus-all', 'unc-business'];
  const routes = /** @type {any[]} */ (Object.values(D.records).filter((/** @type {any} */ r) => r.appliesTo));
  assert.deepEqual(routes.filter(r => r.routeDisplay === 'quote').map(r => r.id).sort(), QUOTE);
  for (const r of routes) assert.ok(r.routeDisplay === 'quote' || r.routeDisplay === 'label', r.id);
  // Each quote-mode course: the quote, verbatim, from the record's own quote that holds the route wording —
  // the whole of it, or the record's one or two sub-quotes (two joined by " … ").
  for (const [courseId, recordId] of [['uk-maths-bath', 'bath-mathematics'], ['uk-cs-bath', 'bath-qualification-route-uk-cs-bath'],
    ['uk-economics-bath', 'bath-qualification-route-uk-economics-bath'], ['uk-engineering-bath', 'bath-qualification-route-uk-engineering-bath'],
    ['uk-accounting-bath', 'bath-qualification-route-uk-accounting-bath'], ['uk-cs-glasgow', 'glasgow-year2-entry'],
    ['us-engineering-michigan', 'michigan-engineering'], ['sg-economics-nus', 'nus-all'], ['us-business-unc', 'unc-business']]) {
    const r = D.records[recordId];
    const q = V.routeQuote(r);
    assert.ok(q && q.sourceSnippet.includes(r.appliesTo), recordId);
    const html = card(courseId);
    const shown = html.replace(/&amp;/g, '&');
    const quoted = r.routeQuoteParts ? r.routeQuoteParts.join(' … ') : q.sourceSnippet;
    for (const part of r.routeQuoteParts ?? []) assert.ok(q.sourceSnippet.includes(part), `${recordId}: sub-quote is in the quote the Source link points to`);
    assert.ok(shown.includes(`Interviews some applicants. ${r.university} says: “${quoted}” <span class="reqs__meta-inline"><a class="reqs__link" href="${q.source}"`), courseId);
    assert.doesNotMatch(text(html), /Interviews some applicants:/, courseId);   // no label line as well
    assert.doesNotMatch(html, /data-iv-practise|Practise/, courseId);
    assert.equal(html.includes(' … '), (r.routeQuoteParts ?? []).length === 2, courseId);   // an ellipsis only between two sub-quotes
  }
  // Sub-quotes: Glasgow shows its one sentence, UNC its sentence and the requirement, exactly as the university wrote them.
  assert.deepEqual(routes.filter(r => r.routeQuoteParts).map(r => [r.id, r.routeQuoteParts.length]), [['glasgow-year2-entry', 1], ['unc-business', 2]]);
  assert.match(text(card('uk-law-glasgow')), /^Interview Interviews some applicants\. University of Glasgow says: “You may also be interviewed if you’re applying for entry into Year 2 in any subject\.” Source$/);
  assert.match(text(card('us-business-unc')), /^Interview Interviews some applicants\. UNC Chapel Hill says: “If you are an admitted transfer student or current UNC student who has completed your first year, you are encouraged to apply to the Undergraduate Business Program\. … Video interview” Source$/);
  assert.doesNotMatch(text(card('uk-cs-glasgow')), /Dentistry|Community Development/);
  assert.match(text(card('uk-maths-bath')), /^Interview Interviews some applicants\. University of Bath says: “Very exceptionally we may invite you to an interview if you have circumstances we cannot assess from an application alone\.” Source$/);
  // A course with a label-mode route and a quote-mode route shows both, once each.
  const both = text(card('sg-cs-nus'));
  assert.match(both, /Interviews some applicants: Aptitude-Based Admissions \(ABA\) scheme Source/);
  assert.match(both, /Interviews some applicants\. National University of Singapore says: “As part of the University’s holistic assessment, some faculties might also require/);
  assert.equal((both.match(/Interviews some applicants/g) ?? []).length, 2);
});

test('every route label is backed by a quote on its record: the label itself, or its key term', () => {
  const routes = Object.values(D.records).filter((/** @type {any} */ r) => r.appliesTo);
  assert.ok(routes.length >= 30);
  for (const r of /** @type {any[]} */ (routes)) {
    const quotes = [...['format', 'numberAndLength', 'mmiStations', 'whatIsAssessed'].map(f => r[f]?.sourceSnippet), ...r.prepAdvice.map((/** @type {any} */ e) => e.sourceSnippet), ...(r.appliesToEvidence ?? []).map((/** @type {any} */ e) => e.sourceSnippet)].filter(Boolean).join(' ');
    assert.ok(quotes.includes(r.appliesTo) || (r.appliesToKey && r.appliesTo.includes(r.appliesToKey) && quotes.includes(r.appliesToKey)), r.id);
  }
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
  for (const id of ['hk-maths-hkust', 'hk-sciences-hkust', 'ca-engineering-waterloo', 'us-business-emory', 'us-cs-notredame', 'hk-business-hku', 'uk-cs-ucl', 'ca-medicine-mcmaster']) {
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
  // Route wording must be quoted: an invented route, or a key term that is not in the quotes, is rejected.
  assert.match(mutate(d => { d.records['glasgow-year2-entry'].appliesTo = 'Year 9 pupils'; }), /appliesTo "Year 9 pupils" \(or its key term\) is not in the record's quotes/);
  assert.match(mutate(d => { d.records['cuhk-cs'].appliesToKey = 'Band A'; }), /appliesToKey "Band A" must be part of appliesTo/);
  assert.match(mutate(d => { delete d.records['cuhk-cs'].routeDisplay; }), /routeDisplay must be "label" or "quote" on a route record/);
  assert.match(mutate(d => { d.records['cuhk-cs'].routeDisplay = 'full'; }), /routeDisplay must be "label" or "quote"/);
  assert.match(mutate(d => { d.records['hku-law'].routeDisplay = 'label'; }), /routeDisplay is only for route-limited records/);
  // cuhk-cs is backed by its key term only ("JUPAS"): no quote holds "JUPAS applicants", so it cannot be quoted.
  assert.match(mutate(d => { d.records['cuhk-cs'].routeDisplay = 'quote'; }), /routeDisplay "quote" needs a quote that contains the full route wording "JUPAS applicants"/);
  // Sub-quotes: exact substrings of the record's own evidence, at most two, quote mode only.
  const G = 'glasgow-year2-entry', U = 'unc-business';
  assert.equal(mutate(() => {}), '');
  assert.match(mutate(d => { d.records[G].routeQuoteParts[0] = d.records[G].routeQuoteParts[0].replace('you’re', "you're"); }), /sub-quote is not an exact part of the record's evidence/);
  assert.match(mutate(d => { d.records[G].routeQuoteParts[0] = d.records[G].routeQuoteParts[0].replace('Year 2', 'Year 3'); }), /sub-quote is not an exact part of the record's evidence/);
  assert.match(mutate(d => { d.records[U].routeQuoteParts[1] = 'Video Interview'; }), /sub-quote is not an exact part of the record's evidence: “Video Interview”/);
  assert.match(mutate(d => { d.records[U].routeQuoteParts[0] += '.'; }), /sub-quote is not an exact part/);   // one character added
  assert.match(mutate(d => { d.records[U].routeQuoteParts.push('Resume'); }), /routeQuoteParts holds 3 sub-quotes; at most two are allowed/);
  assert.match(mutate(d => { d.records[U].routeQuoteParts = []; }), /routeQuoteParts must hold one or two sub-quotes/);
  assert.match(mutate(d => { d.records[U].routeQuoteParts.reverse(); }), /the two sub-quotes must come from the same quote, the second after the first/);
  assert.match(mutate(d => { d.records[U].routeQuoteParts = ['Video interview']; }), /a sub-quote must contain the full route wording/);
  assert.match(mutate(d => { d.records['cuhk-all'].routeQuoteParts = ['JUPAS applicants']; }), /routeQuoteParts is only for a route record shown in quote mode/);
  assert.match(mutate(d => { d.records['hku-law'].routeQuoteParts = ['x']; }), /routeQuoteParts is only for a route record shown in quote mode/);
  // A sub-quote borrowed from another record's evidence is refused too.
  assert.match(mutate(d => { d.records[G].routeQuoteParts = [d.records['bath-mathematics'].appliesToEvidence[0].sourceSnippet]; }), /sub-quote is not an exact part of the record's evidence/);
  assert.match(mutate(d => { delete d.records['cuhk-cs'].appliesToEvidence; }), /is not in the record's quotes/);
  assert.match(mutate(d => { d.records['cuhk-cs'].appliesToEvidence[0].accessed = ''; }), /accessed date/);
});
