// @ts-check
/* global document, getComputedStyle -- used only inside page.evaluate (runs in the browser) */
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

const DURHAM_OXFORD = [['Durham', 'Mathematics BSc'], ['University of Oxford', 'Medicine MBChB']];

/** @param {'Year 12'|'Year 13'} year @param {object} [ctxOpts] @param {string[][]} [shortlist] */
async function student(year, ctxOpts = { viewport: { width: 1280, height: 900 } }, shortlist = DURHAM_OXFORD) {
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
  for (const [uni, course] of shortlist) {
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

// SUMMARY values, unfolded and unescaped (\, \; \\).
const summaries = (/** @type {string} */ ics) => [...ics.replace(/\r\n /g, '').matchAll(/\r\nSUMMARY:(.*)\r\n/g)]
  .map(m => m[1].replace(/\\([,;\\])/g, '$1'));

test('Year 13, Durham Maths + Oxford Medicine: STEP and the January UK deadline are still ahead; same file from Applying and This month', async () => {
  const { ctx, p, requests, errors } = await student('Year 13');
  await p.locator('.journey-bar__step', { hasText: 'Applying' }).click();
  await assert.doesNotReject(p.getByText('Your phone will ask you to confirm before anything is added.').waitFor());
  const a = await addToCalendar(p, requests);
  assert.equal(a.name, 'altiora-calendar-2026-11-15.ics');
  // October's warning (Oxford Medicine) has passed: skipped. January's (Durham) is ahead.
  assert.deepEqual(summaries(a.text), [
    'UK application deadline coming up (typically mid-January)',
    'Registration opens: STEP (typical window)', 'Registration closes: STEP (typical window)', 'STEP test window opens (typical window)']);
  assert.match(a.text, /\r\nUID:uk-deadline-january-2027@usealtiora\.com\r\nDTSTAMP:\d{8}T\d{6}Z\r\nDTSTART;VALUE=DATE:20270106\r\n/);
  assert.match(a.text, /\r\nUID:step-reg-open-2027@usealtiora\.com\r\n/);
  assert.deepEqual(a.fetched, [], 'no network request while building and opening the file');
  // Google Calendar links: one per event, nothing requested until tapped.
  const links = await p.locator('a[href^="https://calendar.google.com/calendar/render?action=TEMPLATE"]').count();
  assert.equal(links, 4);
  assert.ok(!requests.some(u => u.includes('calendar.google.com')));

  await p.click('#monthLink');
  const m = await addToCalendar(p, requests);
  assert.deepEqual(summaries(m.text), summaries(a.text));
  assert.deepEqual(m.fetched, []);
  // Neither course has readable interview data (Oxford Medicine's page is on the manual-review list): no Home entry.
  await p.reload();
  await p.locator('#panel-home .home-quick__row').waitFor();
  assert.equal(await p.locator('#panel-home [data-iv-open]').count(), 0);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('Year 12: STEP is absent (sat after offers, application year only); next summer\'s UCAT and TMUA windows', async () => {
  const { ctx, p, requests, errors } = await student('Year 12');
  await p.locator('.journey-bar__step', { hasText: 'Applying' }).click();
  const a = await addToCalendar(p, requests);
  assert.ok(!a.text.includes('STEP'));
  assert.deepEqual(summaries(a.text), [
    'Registration opens: UCAT (typical window)', 'UCAT test window opens (typical window)', 'Registration opens: TMUA (typical window)',
    'Registration closes: UCAT (typical window)', 'Registration closes: TMUA (typical window)',
    'UK application deadline coming up (typically mid-October)', 'TMUA test window opens (typical window)',
    'UK application deadline coming up (typically mid-January)']);
  assert.match(a.text, /DTSTART;VALUE=DATE:20270510/);
  assert.deepEqual(a.fetched, []);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('Year 12, a TMUA course and an ESAT course: one shared registration pair, two test-window events', async () => {
  const { ctx, p, requests, errors } = await student('Year 12', undefined,
    [['Imperial', 'Computing MEng'], ['Imperial', 'Mechanical Engineering MEng']]);
  await p.locator('.journey-bar__step', { hasText: 'Applying' }).click();
  const a = await addToCalendar(p, requests);
  assert.deepEqual(summaries(a.text), [
    'Registration opens: ESAT and TMUA (typical window)', 'Registration closes: ESAT and TMUA (typical window)',
    'ESAT test window opens (typical window)', 'TMUA test window opens (typical window)',
    'UK application deadline coming up (typically mid-January)']);
  const uids = [...a.text.matchAll(/\r\nUID:(.*)\r\n/g)].map(m => m[1]);
  assert.deepEqual(uids.slice(0, 4), ['uat-uk-reg-open-2027@usealtiora.com', 'uat-uk-reg-close-2027@usealtiora.com',
    'esat-test-window-2027@usealtiora.com', 'tmua-test-window-2027@usealtiora.com']);
  // The Google links carry the same titles.
  const texts = await p.locator('#panel-applying a[href^="https://calendar.google.com/"]')
    .evaluateAll((/** @type {any[]} */ as) => as.map(x => new URL(x.href).searchParams.get('text')));
  assert.deepEqual(texts, summaries(a.text));
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
  assert.match(decodeURIComponent(url), /^data:text\/calendar;charset=utf-8,BEGIN:VCALENDAR\r\n[\s\S]*SUMMARY:STEP test window opens \(typical window\)/);
  assert.equal(await p.locator('a[download]').count(), 0, 'no download attribute on the Apple path');
  assert.deepEqual(requests.slice(before).filter(u => /^https?:/.test(u)), []);
  await ctx.close();
});

test('Year 12, only UK courses with no admission test: sections numbered from 1, a deadline-only calendar beside the heading', async () => {
  const { ctx, p, requests, errors } = await student('Year 12', undefined,
    [['University of Oxford', 'History BA'], ['London School of Economics', 'Finance BSc']]);
  await p.locator('.journey-bar__step', { hasText: 'Applying' }).click();
  const groups = await p.locator('#applyingChecklist .applying-task-group__label').allTextContents();
  assert.deepEqual(groups.map(g => g.trim()), ['1 · Your application', '2 · Deadlines']);
  // The control sits in the heading row of "The cycle, in order".
  const row = p.locator('#panel-applying .applying-section__headrow');
  await assert.doesNotReject(row.getByRole('button', { name: 'Add to my calendar' }).waitFor());
  assert.match(await row.innerText(), /The cycle, in order/);
  const a = await addToCalendar(p, requests);
  assert.deepEqual(summaries(a.text), [
    'UK application deadline coming up (typically mid-October)',
    'UK application deadline coming up (typically mid-January)']);
  assert.match(a.text, /UID:uk-deadline-october-2027@usealtiora\.com\r\nDTSTAMP:\d{8}T\d{6}Z\r\nDTSTART;VALUE=DATE:20271008/);
  assert.match(a.text, /UID:uk-deadline-january-2028@usealtiora\.com\r\nDTSTAMP:\d{8}T\d{6}Z\r\nDTSTART;VALUE=DATE:20280106/);
  assert.deepEqual(a.fetched, []);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('Interview practice: every way in is a full-size button (44px or taller)', async () => {
  const { ctx, p, errors } = await student('Year 13', { viewport: { width: 375, height: 800 } },
    [['University of Oxford', 'Computer Science BA'], ['Durham', 'Mathematics BSc']]);
  /** @param {any} loc */
  const size = async loc => { await loc.scrollIntoViewIfNeeded(); return loc.evaluate((/** @type {any} */ e) => ({ h: e.getBoundingClientRect().height, fs: getComputedStyle(e).fontSize, text: e.innerText.trim() })); };
  await p.reload();   // a returning student opens on Home
  const home = await size(p.locator('#panel-home [data-iv-open]'));   // Oxford Computer Science has interview data
  await p.click('#storyLink');
  const story = await size(p.locator('#panel-story [data-iv-open]'));
  await p.click('#shortlistLink');
  await p.evaluate(() => document.querySelectorAll('#panel-shortlist details').forEach((/** @type {any} */ d) => { d.open = true; }));
  const card = await size(p.locator('#panel-shortlist [data-iv-practise]').first());
  for (const [where, m] of [['Home', home], ['Story', story], ['Shortlist card', card]]) {
    assert.ok(m.h >= 44, `${where}: ${m.h}px tall`);
    assert.equal(m.fs, '14px', where);
    assert.match(m.text, /^Practise interview questions/, where);
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});
