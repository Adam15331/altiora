// @ts-check
// Interview information (data/interviews.js), its validator, the display
// module (interview-view.js) and the saved practice marks (state.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { ROOT, loadCourses } from '../scripts/lib/requirements-io.mjs';
import { validateInterviews } from '../scripts/lib/validate-interviews.mjs';

const require = createRequire(import.meta.url);
const { interviewData } = require('../data/interviews.js');
const V = require('../interview-view.js');
const research = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/interviews-proposed.json'), 'utf8'));
const courses = loadCourses();
const clone = (/** @type {any} */ x) => JSON.parse(JSON.stringify(x));
const errors = (/** @type {any} */ d) => validateInterviews(d, { courses, today: '2026-11-14' }).filter(p => p.level === 'error');
const FIELDS = ['format', 'numberAndLength', 'mmiStations', 'whatIsAssessed'];
/** @param {any} r */
const evidenceOf = r => [...FIELDS.map(f => r[f]).filter(Boolean), ...r.prepAdvice, ...r.sampleQuestions];

test('the interview data validates', () => {
  assert.deepEqual(errors(interviewData), []);
});

test('every loaded value is a research item, unchanged, with source, accessed and verbatim snippet', () => {
  const researchEvidence = research.records.flatMap((/** @type {any} */ r) => evidenceOf(r))
    .map((/** @type {any} */ e) => JSON.stringify([e.source, e.accessed, e.sourceSnippet]));
  const loaded = Object.values(interviewData.records).flatMap(evidenceOf);
  assert.ok(loaded.length > 0);
  for (const e of loaded) {
    assert.ok(e.source && e.accessed && e.sourceSnippet, JSON.stringify(e).slice(0, 80));
    assert.ok(researchEvidence.includes(JSON.stringify([e.source, e.accessed, e.sourceSnippet])), `not from the research: ${e.source}`);
  }
  for (const q of Object.values(interviewData.records).flatMap((/** @type {any} */ r) => r.sampleQuestions)) assert.equal(q.question, q.sourceSnippet);
});

test('everything the research excluded stays out', () => {
  const text = JSON.stringify(interviewData.records);
  for (const banned of ['physics.ox.ac.uk', 'lucy.cam.ac.uk', 'Medical Schools Council', 'medschools.ac.uk', 'eng.ox.ac.uk/media']) assert.ok(!text.includes(banned), banned);
  for (const m of research.manualReview) assert.ok(!text.includes(`"source":"${m.url}"`), m.url);
  assert.ok(interviewData.excludedSources.some((/** @type {any} */ e) => e.url.includes('mock%20interview%20pack')));
});

test('the validator rejects missing provenance, reworded questions, excluded sources and unsupported timing', () => {
  const mutate = (/** @type {(d: any) => void} */ f) => { const d = clone(interviewData); f(d); return errors(d).map(e => e.message).join(' | '); };
  const man = (/** @type {any} */ d) => d.records['manchester-medicine'];
  assert.match(mutate(d => { man(d).format.source = ''; }), /https source/);
  assert.match(mutate(d => { delete man(d).format.accessed; }), /accessed date/);
  assert.match(mutate(d => { man(d).format.accessed = '2099-01-01'; }), /in the future/);
  assert.match(mutate(d => { man(d).format.sourceSnippet = ' '; }), /verbatim sourceSnippet/);
  assert.match(mutate(d => { man(d).sampleQuestions[0].question = 'Why medicine?'; }), /verbatim sourceSnippet/);
  assert.match(mutate(d => { man(d).format.source = d.excludedSources[0].url; }), /excluded source/);
  assert.match(mutate(d => { man(d).timing.quote = 'ten minutes'; }), /quote is not in/);
  assert.match(mutate(d => { d.courses['uk-nonexistent-course'] = ['manchester-medicine']; }), /not a course id/);
  assert.match(mutate(d => { d.records['imperial-medicine'].prepAdvice = [man(d).prepAdvice[0]]; }), /unavailable records must carry no evidence/);
  assert.match(mutate(d => { man(d).interviewed = 'probably'; }), /interviewed must be one of/);
});

test('stated timings are quoted from the university', () => {
  const timed = Object.values(interviewData.records).filter((/** @type {any} */ r) => r.timing);
  assert.equal(timed.length, 8);
  for (const r of /** @type {any[]} */ (timed)) assert.ok(r[r.timing.field].sourceSnippet.includes(r.timing.quote), r.id);
  assert.deepEqual(interviewData.records['birmingham-medicine'].timing, {
    kind: 'station', prepSeconds: 120, answerSeconds: 360, field: 'format',
    quote: 'each station will include 2 minutes of preparation time and 6 minutes of interview time',
  });
});

test('a blocked university shows the "not available" line, never "no interview"', () => {
  const v = V.forCourse(interviewData, 'uk-medicine-imperial');
  assert.equal(v?.available, false);
  const html = V.sectionHtml(v, { fallbackUrl: 'https://example.ac.uk/course' });
  assert.ok(html.includes("Interview details aren't available from the university's site yet."));
  assert.match(html, /Check the <a [^>]*href="https:\/\/example\.ac\.uk\/course"[^>]*>course page<\/a>\./);
  assert.doesNotMatch(html, /no interview|not interviewed|Interviewed<\/dt><dd>No/i);
});

test('the card section shows interviewed, format, length and advice, each linked to its source', () => {
  const html = V.sectionHtml(V.forCourse(interviewData, 'uk-medicine-manchester'), { practise: true });
  assert.match(html, /Interviewed<\/dt><dd>Yes/);
  for (const label of ['Format', 'Number and length', 'How to prepare']) assert.ok(html.includes(`<dt>${label}</dt>`), label);
  assert.ok(html.includes('href="https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/"'));
  assert.ok(html.includes('data-iv-practise="uk-medicine-manchester"'));
});

test('the only prompt Altiora writes is the story template', () => {
  assert.equal(V.storyPrompt('Robotics club'), 'Talk about “Robotics club”: what you did, and what it showed about you.');
  const src = fs.readFileSync(path.join(ROOT, 'interview-view.js'), 'utf8') + fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
  // No question-shaped strings in the practice code besides the template.
  const ivCode = src.slice(src.indexOf('INTERVIEW PRACTICE'), src.indexOf('function wireInterviewPractice'));
  const questions = [...ivCode.matchAll(/['`"]([^'`"\n]{12,}\?)['`"]/g)].map(m => m[1]);
  assert.deepEqual(questions, []);
});

test('published maths shows as plain text only when it reads without typesetting', () => {
  assert.deepEqual(V.plainText(String.raw`Find the smallest number ending in \(6\), \(k < n\) and \(7~1~9\).`), { readable: true, lines: ['Find the smallest number ending in 6, k < n and 7 1 9.'] });
  assert.equal(V.plainText(String.raw`pick \( \lfloor \frac{n}{2} \rfloor \) numbers`).readable, false);
  assert.equal(V.plainText(String.raw`\(a_1, \ldots, a_8\)`).readable, false);
  assert.deepEqual(V.plainText('First paragraph. / Second paragraph.').lines, ['First paragraph.', 'Second paragraph.']);
});

test('practised marks are saved in the plan and survive save → clear → restore', () => {
  /** @param {Record<string, string>} initial */
  const load = (initial = {}) => {
    const store = new Map(Object.entries(initial));
    /** @type {any} */
    const ctx = { window: { localStorage: { getItem: (/** @type {string} */ k) => store.get(k) ?? null, setItem: (/** @type {string} */ k, /** @type {string} */ v) => store.set(k, v), removeItem: (/** @type {string} */ k) => store.delete(k) } }, TextEncoder, console };
    vm.createContext(ctx);
    vm.runInContext(`${fs.readFileSync(path.join(ROOT, 'state.js'), 'utf8')}\nthis.S = AltioraState;`, ctx);
    return ctx.S;
  };
  const a = load();
  a.setInterviewPractised('q:manchester-medicine#1', true);
  a.setInterviewPractised('story:abc', true);
  a.setInterviewPractised('story:abc', false);
  const file = JSON.stringify(a.exportBackup());
  const b = load();
  assert.equal(b.isInterviewPractised('q:manchester-medicine#1'), false);
  assert.equal(b.importBackup(file).ok, true);
  assert.equal(b.isInterviewPractised('q:manchester-medicine#1'), true);
  assert.equal(b.isInterviewPractised('story:abc'), false);
  // Older saves without the key hydrate to an empty map.
  const old = load({ altiora_state_v1: JSON.stringify({ profile: { subjects: [] }, shortlist: [] }) });
  assert.deepEqual(JSON.parse(JSON.stringify(old.getProfile().interviewPractice)), {});
});
