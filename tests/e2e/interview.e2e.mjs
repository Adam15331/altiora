// @ts-check
/* global localStorage -- used only inside addInitScript (runs in the browser) */
// End-to-end: the practice view for a course whose university does not call it an interview uses the
// university's own term (Toronto Engineering: "Personal Profile") in its title and headings.
// Run: npm i --no-save playwright-core && npm run test:e2e
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(process.env.ALTIORA_ROOT || fileURLToPath(new URL('../..', import.meta.url)));
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
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

test('Toronto Engineering: practice view titled with the university\'s term, never "interview" in its headings', async () => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
  await ctx.route('**/*', (/** @type {any} */ r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  const p = await ctx.newPage();
  const state = { profile: { stage: 'building', qualificationSystem: 'UK_A_Level', subjects: ['Mathematics', 'Physics'], predictedGrades: {}, interests: [], candidateFields: [], achievements: [], applicationTasks: {}, statementDrafts: { q1: '', q2: '', q3: '' }, yearGroup: 'Year 12', yearsUntilApplication: 1, yearSetAt: new Date().toISOString() }, shortlist: ['ca-engineering-utoronto'], progress: {}, meta: { hasOnboarded: true } };
  await p.addInitScript((/** @type {string} */ s) => localStorage.setItem('altiora_state_v1', s), JSON.stringify(state));
  await p.goto(`${base}/app.html`);
  await p.click('#shortlistLink');
  await p.locator('#panel-shortlist details').first().evaluate((/** @type {any} */ d) => { d.open = true; });
  await p.getByRole('button', { name: 'Practise for the Personal Profile' }).click();
  const title = (await p.locator('#panel-interview h1').innerText()).trim();
  assert.equal(title, 'Personal Profile practice');
  const headings = await p.locator('#panel-interview h1, #panel-interview h2, #panel-interview h3').allInnerTexts();
  for (const h of headings) assert.doesNotMatch(h, /interview/i, h);
  assert.ok(headings.includes('How the Personal Profile works'), JSON.stringify(headings));
  assert.match(await p.locator('#panel-interview .applying__sub').innerText(), /^Practise for the Personal Profile\./);
  await ctx.close();
});
