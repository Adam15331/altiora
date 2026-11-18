// @ts-check
/* global localStorage, sessionStorage, AltioraState, switchMode -- used only inside page.evaluate / addInitScript (run in the browser) */
// End-to-end: a saved plan that still holds retired course ids (and one id that was never a course).
// Every count reads the same function (savedCourseState in main.js): only courses on Altiora are counted;
// the Shortlist names the retired ones once, and Dismiss removes them from the saved plan; the restore
// dialog counts them as "no longer available"; the made-up id is hidden, not counted, and left in storage.
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

const YORK = 'Law JD (Osgoode Hall), York University (graduate-entry: not open to school leavers)';
const MCGILL_MED = 'Medicine MDCM, McGill University (graduate-entry: not open to school leavers)';

/** @param {string[]} shortlist */
async function open(shortlist) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, acceptDownloads: true });
  await ctx.route('**/*', (/** @type {any} */ r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  const st = { profile: { stage: 'building', qualificationSystem: 'UK_A_Level', subjects: ['Mathematics', 'Physics'], predictedGrades: { Mathematics: 'A', Physics: 'A' }, interests: [], candidateFields: [], achievements: [], applicationTasks: {}, statementDrafts: { q1: '', q2: '', q3: '' }, yearGroup: 'Year 12', yearsUntilApplication: 1, yearSetAt: new Date().toISOString() }, shortlist, progress: {}, meta: { hasOnboarded: true } };
  const p = await ctx.newPage();
  // Seed once: a reload must read what the page itself saved.
  await p.addInitScript((/** @type {string} */ s) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('altiora_state_v1', s); } }, JSON.stringify(st));
  await p.goto(`${base}/app.html`);
  await p.locator('#workspace:not(.hidden)').waitFor();
  return { ctx, p };
}
const stored = async (/** @type {any} */ p) => p.evaluate(() => JSON.parse(localStorage.getItem('altiora_state_v1') ?? '{}').shortlist);

test('two retired ids, one course, one made-up id: one count everywhere, a notice, Dismiss, CSV and restore', async () => {
  const { ctx, p } = await open(['ca-law-york', 'uk-cs-oxford', 'made-up-course', 'ca-medicine-mcgill']);
  // Stage bar, Home button, Home line: the one course on Altiora.
  assert.equal(await p.locator('#shortlistCount').innerText(), '1');
  // @ts-ignore -- browser globals
  await p.evaluate(() => switchMode('home'));
  assert.equal((await p.locator('#panel-home .home-quick__btn[data-go-tool="shortlist"]').innerText()).trim(), '🔖 My Shortlist (1)');
  assert.match((await p.locator('#panel-home').innerText()).replace(/\s+/g, ' '), /1 course across 1 university in 1 country\./);

  // The restore dialog, from a file saved now: courses plus retired ones, the retired ones named as such.
  await p.click('#profileIndicatorBtn');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#backupExportBtn')]);
  const planFile = await dl.path();
  await p.click('#profileIndicatorBtn');
  const [chooser] = await Promise.all([p.waitForEvent('filechooser'), p.click('#backupImportBtn')]);
  await chooser.setFiles(planFile);
  await p.locator('#planDialog[open]').waitFor();
  const row = p.locator('#planDialog .plan-dialog__list div', { hasText: 'Shortlist' });
  assert.equal((await row.locator('dd').innerText()).trim(), '3 courses (2 no longer available)');
  await p.click('#planDialog [data-plan-cancel]');

  // The Shortlist: one card, and the notice naming both retired courses.
  await p.click('#shortlistLink');
  await p.locator('#panel-shortlist:not(.hidden)').waitFor();
  const notice = p.locator('#panel-shortlist [data-retired-notice]');
  assert.equal((await notice.locator('p').first().innerText()).trim(), '2 courses on your list are no longer on Altiora:');
  assert.deepEqual(await notice.locator('[data-retired-course]').allInnerTexts(), [YORK, MCGILL_MED]);
  assert.equal(await p.locator('#panel-shortlist .results-group__grid > *').count(), 1);

  // CSV: the one course only.
  const [csv] = await Promise.all([p.waitForEvent('download'), p.click('#exportCsvBtn')]);
  const rows = (await readFile(await csv.path(), 'utf8')).replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  assert.equal(rows.length, 2, rows.join('\n'));
  assert.match(rows[1], /University of Oxford/);
  assert.doesNotMatch(rows.join('\n'), /York University|McGill|made-up/);

  // Dismiss: the retired ids leave the saved plan; the made-up id stays; the notice is gone for good.
  await notice.getByRole('button', { name: 'Dismiss' }).click();
  assert.equal(await notice.count(), 0);
  assert.deepEqual(await stored(p), ['uk-cs-oxford', 'made-up-course']);
  assert.equal(await p.locator('#shortlistCount').innerText(), '1');
  await p.reload();
  await p.locator('#workspace:not(.hidden)').waitFor();
  await p.click('#shortlistLink');
  await p.locator('#panel-shortlist:not(.hidden)').waitFor();
  assert.equal(await p.locator('#panel-shortlist [data-retired-notice]').count(), 0);
  assert.equal(await p.locator('#shortlistCount').innerText(), '1');
  await ctx.close();
});

test('one retired id: the notice is one sentence; with no course left the empty state shows under it', async () => {
  const { ctx, p } = await open(['ca-law-york']);
  assert.equal(await p.locator('#shortlistCount').innerText(), '0');
  await p.click('#shortlistLink');
  await p.locator('#panel-shortlist:not(.hidden)').waitFor();
  const notice = p.locator('#panel-shortlist [data-retired-notice]');
  assert.equal((await notice.locator('p').innerText()).trim(), `1 course on your list is no longer on Altiora: ${YORK}`);
  assert.equal(await notice.locator('[data-retired-course]').count(), 0);
  assert.equal(await p.locator('#panel-shortlist .shortlist-empty').count(), 1);
  await notice.getByRole('button', { name: 'Dismiss' }).click();
  assert.deepEqual(await stored(p), []);
  assert.equal(await p.locator('#panel-shortlist [data-retired-notice]').count(), 0);
  await ctx.close();
});

test('saving a course from a card updates the stage-bar count and Home through the subscription', async () => {
  const { ctx, p } = await open(['uk-cs-oxford']);
  // @ts-ignore -- browser globals
  await p.evaluate(() => switchMode('home'));
  // @ts-ignore -- browser globals
  await p.evaluate(() => AltioraState.addToShortlist('uk-maths-oxford'));
  assert.equal(await p.locator('#shortlistCount').innerText(), '2');
  assert.equal((await p.locator('#panel-home .home-quick__btn[data-go-tool="shortlist"]').innerText()).trim(), '🔖 My Shortlist (2)');
  await ctx.close();
});
