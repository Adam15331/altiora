// @ts-check
/* global localStorage, courses, checkStatusFor, switchMode -- used only inside page.evaluate / addInitScript (run in the browser: top-level names of main.js and the data files) */
// End-to-end: a student with no humanities subject. A Law course that names no required subject is never
// "not a match" because of Altiora's own idea of Law's core subjects, in any qualification system, and
// its card asks the student to check instead of saying what Law expects.
// Run: npm i --no-save playwright-core && npm run test:e2e
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(process.env.ALTIORA_ROOT || fileURLToPath(new URL('../..', import.meta.url)));
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
/** @type {import('node:http').Server} */ let server;
/** @type {any} */ let browser;
let base = '';
before(async () => {
  server = createServer(async (req, res) => {
    const p = normalize(decodeURIComponent(new URL(req.url || '/', 'http://x').pathname)).replace(/^([/\\])+/, '');
    try { const body = await readFile(join(ROOT, p || 'index.html')); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(body); }
    catch { res.writeHead(404); res.end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', () => r(undefined)));
  const addr = server.address();
  base = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`;
  const pkg = 'playwright-core';
  browser = await (await import(pkg)).chromium.launch({ executablePath: CHROMIUM });
});
after(async () => { await browser?.close(); await new Promise(r => server.close(() => r(undefined))); });

// The matching-hash fixtures (scripts/verify-pass/matching/hash.mjs) that hold no humanities subject.
const FIXTURES = /** @type {Record<string, {sys: string, year: string, subjects: string[], grade?: string, grades?: string}>} */ ({
  UK: { sys: 'UK_A_Level', year: 'Year 12', subjects: ['Mathematics', 'Further Mathematics', 'Physics', 'Chemistry'], grade: 'A*' },
  IB: { sys: 'IB', year: 'Year 12', subjects: ['Mathematics: Analysis and Approaches HL', 'Physics HL', 'Chemistry HL'], grades: '38' },
  SG: { sys: 'SG_A_Level', year: 'Year 12', subjects: ['H2 Mathematics', 'H2 Physics', 'H2 Chemistry'], grade: 'A' },
  HK: { sys: 'HK_DSE', year: 'Year 12', subjects: ['Mathematics Compulsory Part', 'Mathematics Extended Part Module 2 (M2)', 'Physics', 'Chemistry'], grade: '5**' },
});

/** @param {any} ctx @param {typeof FIXTURES[string]} f */
async function open(ctx, f) {
  const predicted = f.grades ?? Object.fromEntries(f.subjects.map(s => [s, f.grade]));
  const st = { profile: { stage: 'building', qualificationSystem: f.sys, subjects: f.subjects, predictedGrades: predicted, interests: [], candidateFields: [], achievements: [], applicationTasks: {}, statementDrafts: { q1: '', q2: '', q3: '' }, yearGroup: f.year, yearsUntilApplication: 1, yearSetAt: new Date().toISOString() }, shortlist: [], progress: {}, meta: { hasOnboarded: true } };
  await ctx.route('**/*', (/** @type {any} */ r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  const p = await ctx.newPage();
  await p.addInitScript((/** @type {string} */ s) => localStorage.setItem('altiora_state_v1', s), JSON.stringify(st));
  await p.goto(`${base}/app.html`);
  // @ts-ignore -- browser globals
  await p.waitForFunction(() => typeof checkStatusFor === 'function' && typeof courses !== 'undefined');
  // @ts-ignore -- browser globals
  await p.evaluate(() => switchMode('check'));
  await p.locator('#panel-check .course-card').first().waitFor();
  return p;
}

test('no humanities subject: a Law course with no required subject is never red, in every system', async () => {
  for (const [name, f] of Object.entries(FIXTURES)) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await open(ctx, f);
    // @ts-ignore -- browser globals
    const rows = await p.evaluate(() => courses.filter((/** @type {any} */ c) => c.category === 'law')
      // @ts-ignore -- browser globals
      .map((/** @type {any} */ c) => ({ id: c.id, essential: c.requirements.essential ?? [], status: checkStatusFor(c).status })));
    assert.ok(rows.length >= 26, `${name}: ${rows.length} Law courses`);
    const open_ = rows.filter((/** @type {any} */ r) => !r.essential.length);
    assert.ok(open_.length >= 21, `${name}: ${open_.length} Law courses with no required subject`);
    for (const r of open_) assert.notEqual(r.status, 'red', `${name}: ${r.id} is red`);
    // A Law course that DOES require a subject the student lacks is still red: that is the course's rule, not the guard.
    for (const r of rows.filter((/** @type {any} */ r) => r.essential.length)) assert.equal(r.status, 'red', `${name}: ${r.id}`);
    await ctx.close();
  }
});

test('the Law card asks the student to check; no card says what Law "expects"', async () => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const p = await open(ctx, FIXTURES.UK);
  await p.fill('#resultSearchInput', 'University of Warwick');
  const card = p.locator('#panel-check .course-card:not(.hidden)', { hasText: 'Law LLB' }).filter({ hasText: 'University of Warwick' }).first();
  await card.waitFor();
  assert.equal((await card.locator('.card-field-core').innerText()).trim(), 'Check whether this course prefers particular subjects.');
  assert.match(await card.innerText(), /^\s*Possible/i);
  await p.fill('#resultSearchInput', '');
  // Every card on the page, hidden ones included.
  const all = await p.locator('#panel-check').evaluate((/** @type {any} */ el) => el.textContent);
  assert.doesNotMatch(all, /expect strong humanities|Law-track/i);
  await ctx.close();
});
