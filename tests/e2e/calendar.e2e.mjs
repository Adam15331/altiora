// @ts-check
// End-to-end: "Add to my calendar" the way a student uses it. A fresh
// profile set up by clicks only; Durham Mathematics and Oxford Medicine
// shortlisted from the course list; the button pressed in Applying and in
// This month. The page clock is fixed at 15 November 2026 so the expected
// dates do not drift.
//
// Run: npm i --no-save playwright-core && npm run test:e2e
// Env: ALTIORA_ROOT (site folder, default this checkout), CHROMIUM_PATH.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(process.env.ALTIORA_ROOT || fileURLToPath(new URL('../..', import.meta.url)));
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const TODAY = new Date('2026-11-15T12:00:00Z');

/** @type {import('node:http').Server} */ let server;
/** @type {any} */ let browser;
/** @type {any} */ let devices;
let base = '';

before(async () => {
  server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url || '/', 'http://x').pathname)).replace(/^([/\\])+/, '');
    try {
      const body = await readFile(join(ROOT, path || 'index.html'));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404); res.end();
    }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', () => r(undefined)));
  const addr = server.address();
  base = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`;
  const pkg = 'playwright-core';
  const pw = await import(pkg);
  devices = pw.devices;
  browser = await pw.chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await new Promise(r => server.close(() => r(undefined)));
});

/** @param {'Year 12'|'Year 13'} year @param {object} [ctxOpts] */
async function student(year, ctxOpts = { viewport: { width: 1280, height: 900 } }) {
  const ctx = await browser.newContext({ ...ctxOpts, acceptDownloads: true });
  /** @type {string[]} */ const requests = [];
  ctx.on('request', (/** @type {any} */ r) => requests.push(r.url()));
  await ctx.route('**/*', (/** @type {any} */ r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  const p = await ctx.newPage();
  await p.clock.setFixedTime(TODAY);
  /** @type {string[]} */ const errors = [];
  p.on('pageerror', (/** @type {Error} */ e) => errors.push(e.message));
  await p.goto(`${base}/app.html`);
  await p.locator('.stage-card', { hasText: 'UK A-Levels' }).click();
  await p.locator('.stage-card', { hasText: year }).click();
  await p.click('#stageProposalAccept');
  for (const s of ['Mathematics', 'Further Mathematics', 'Chemistry', 'Biology']) {
    await p.locator('#subjectOnboardSlot label.subject-chip', { has: p.locator(`input[value="${s}"]`) }).click();
  }
  await p.click('#subjectOnboardContinue');
  if (year === 'Year 13') await p.getByRole('button', { name: /See the \d+ courses your subjects fit/ }).click();
  for (const [uni, course] of [['Durham', 'Mathematics BSc'], ['University of Oxford', 'Medicine MBChB']]) {
    await p.fill('#resultSearchInput', uni);
    await p.locator('.course-card', { hasText: course }).filter({ hasText: uni }).locator('.save-btn').first().click();
  }
  await p.fill('#resultSearchInput', '');
  return { ctx, p, requests, errors };
}

/** Press "Add to my calendar" in a panel and read the downloaded file. @param {any} p @param {string[]} requests */
async function addToCalendar(p, requests) {
  const before = requests.length;
  const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Add to my calendar' }).click()]);
  const text = await readFile(await dl.path(), 'utf8');
  const fetched = requests.slice(before).filter(u => !u.startsWith('blob:') && !u.startsWith('data:'));
  return { name: dl.suggestedFilename(), text, fetched };
}

const summaries = (/** @type {string} */ ics) => [...ics.replace(/\r\n /g, '').matchAll(/\r\nSUMMARY:(.*)\r\n/g)].map(m => m[1]);

test('Year 13, Durham Maths + Oxford Medicine: only STEP is still ahead; same file from Applying and This month', async () => {
  const { ctx, p, requests, errors } = await student('Year 13');
  await p.locator('.journey-bar__step', { hasText: 'Applying' }).click();
  await assert.doesNotReject(p.getByText('Your phone will ask you to confirm before anything is added.').waitFor());
  const a = await addToCalendar(p, requests);
  assert.equal(a.name, 'altiora-calendar-2026-11-15.ics');
  assert.deepEqual(summaries(a.text), [
    'Registration opens: STEP (typical window)', 'Registration closes: STEP (typical window)', 'Sit STEP (typical window)']);
  assert.deepEqual(a.fetched, [], 'no network request while building and opening the file');
  // Google Calendar links: one per event, nothing requested until tapped.
  const links = await p.locator('a[href^="https://calendar.google.com/calendar/render?action=TEMPLATE"]').count();
  assert.equal(links, 3);
  assert.ok(!requests.some(u => u.includes('calendar.google.com')));

  await p.click('#monthLink');
  const m = await addToCalendar(p, requests);
  assert.deepEqual(summaries(m.text), summaries(a.text));
  assert.deepEqual(m.fetched, []);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('Year 12: STEP is absent (sat after offers, application year only); next summer\'s UCAT and TMUA windows', async () => {
  const { ctx, p, requests, errors } = await student('Year 12');
  await p.locator('.journey-bar__step', { hasText: 'Applying' }).click();
  const a = await addToCalendar(p, requests);
  assert.ok(!a.text.includes('STEP'));
  assert.deepEqual(summaries(a.text), [
    'Registration opens: UCAT (typical window)', 'Sit UCAT (typical window)', 'Registration opens: TMUA (typical window)',
    'Registration closes: UCAT (typical window)', 'Registration closes: TMUA (typical window)', 'Sit TMUA (typical window)']);
  assert.match(a.text, /DTSTART;VALUE=DATE:20270510/);
  assert.deepEqual(a.fetched, []);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('iPhone: the Apple path navigates to a text/calendar data: URL — no download attribute, no network', async () => {
  const { ctx, p, requests } = await student('Year 13', { ...devices['iPhone 13'] });
  await p.locator('.journey-bar__step', { hasText: 'Applying' }).click();
  // Chromium (this test's engine) cannot show text/calendar, so the data:
  // navigation ends as a download of that same URL; real Safari is what
  // hands it to Calendar. The download's URL is the evidence of the path.
  /** @type {any[]} */ const downloads = [];
  p.on('download', (/** @type {any} */ d) => downloads.push(d));
  const before = requests.length;
  await p.getByRole('button', { name: 'Add to my calendar' }).click({ noWaitAfter: true, timeout: 5000 });
  await p.waitForTimeout(1500);
  assert.equal(downloads.length, 1);
  const url = downloads[0].url();
  assert.match(decodeURIComponent(url), /^data:text\/calendar;charset=utf-8,BEGIN:VCALENDAR\r\n[\s\S]*SUMMARY:Sit STEP \(typical window\)/);
  assert.equal(await p.locator('a[download]').count(), 0, 'no download attribute on the Apple path');
  assert.deepEqual(requests.slice(before).filter(u => /^https?:/.test(u)), []);
  await ctx.close();
});
