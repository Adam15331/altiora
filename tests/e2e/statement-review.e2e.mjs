// @ts-check
// End-to-end: "Review my statement" the way a student uses it. A fresh
// browser profile; only clicks and typing — nothing is written into saved
// state directly. Sets up a UK A-Level Year 13 profile, shortlists a UK
// course, adds two story entries through "+ Add to your story", TYPES three
// answers, and presses "Review my statement".
//
// Not part of `npm test` (it needs a browser). Run:
//   npm i --no-save playwright-core
//   npm run test:e2e
// Env: ALTIORA_ROOT  site folder to serve (default: this checkout)
//      CHROMIUM_PATH Chromium binary (default: /opt/pw-browsers/chromium)
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

/** @type {import('node:http').Server} */ let server;
/** @type {any} */ let browser;
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
  const pkg = 'playwright-core';                      // installed with --no-save; not a dependency
  const { chromium } = await import(pkg);
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await new Promise(r => server.close(() => r(undefined)));
});

/** A fresh profile, set up through the real onboarding and Story UI. */
async function studentWithStory() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Hermetic: only the local site loads (no fonts or analytics).
  await ctx.route('**/*', (/** @type {any} */ r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  const p = await ctx.newPage();
  /** @type {string[]} */ const errors = [];
  p.on('pageerror', (/** @type {Error} */ e) => errors.push(e.message));
  await p.goto(`${base}/app.html`);
  await p.locator('.stage-card', { hasText: 'UK A-Levels' }).click();
  await p.locator('.stage-card', { hasText: 'Year 13' }).click();
  await p.click('#stageProposalAccept');
  for (const s of ['Mathematics', 'Physics', 'Computer Science']) {
    await p.locator('#subjectOnboardSlot label.subject-chip', { has: p.locator(`input[value="${s}"]`) }).click();
  }
  await p.click('#subjectOnboardContinue');
  await p.getByRole('button', { name: /See the \d+ courses your subjects fit/ }).click();
  await p.locator('.filter-btn', { hasText: 'UK' }).click();
  await p.locator('.save-btn:visible').first().click();         // a UK course on the shortlist
  await p.click('#storyLink');
  for (const [title, type] of [['Robotics club', 'Club or society'], ['Hospital volunteering', 'Volunteering / Community']]) {
    await p.click('#achvAddBtn');
    await p.selectOption('#achvType', { label: type });
    await p.click('#achvTitle');
    await p.keyboard.type(title);
    await p.click('#achvSaveBtn');
  }
  return { ctx, p, errors };
}

/** @param {any} p @param {string[]} answers */
async function typeAnswers(p, answers) {
  const boxes = p.locator('textarea.stmt__ta');
  for (const [i, text] of answers.entries()) {
    await boxes.nth(i).click();
    await p.keyboard.type(text);
  }
}

/** Press Review and read one check's lines from the rendered panel. @param {any} p */
async function pressReview(p) {
  await p.getByRole('button', { name: 'Review my statement' }).click();
  const out = p.locator('[data-stmt-review-out]');
  /** @param {string} head */
  const lines = head => out.locator('.stmt-review__check', { has: p.locator('.stmt-review__head', { hasText: head }) })
    .locator('li').allInnerTexts();
  return {
    shared: await lines('The same experience in more than one answer'),
    repeated: await lines('Repeated wording'),
    unused: await lines('Story entries you haven’t used'),
  };
}

test('typed drafts: all three findings appear — immediately, after 5 seconds, and after a reload', async () => {
  const { ctx, p, errors } = await studentWithStory();
  await typeAnswers(p, [
    'I became curious about systems at the robotics club, where I learned to break a problem into small testable steps every week.',
    'In mathematics lessons I learned to break a problem into small testable steps whenever a proof got hard.',
    'Outside lessons I ran weekly sessions at the robotics club for younger pupils.',
  ]);
  const expected = {
    shared: ['“Robotics club” appears in answers 1 and 3. UCAS reads all three answers as one statement.'],
    repeated: ['The same wording appears in answers 1 and 2: “I learned to break a problem into small testable steps”.'],
    unused: ['You haven’t written about “Hospital volunteering” yet.'],
  };
  assert.deepEqual(await pressReview(p), expected, 'pressed immediately after typing');
  await p.waitForTimeout(5000);
  assert.deepEqual(await pressReview(p), expected, 'pressed after waiting 5 seconds');
  await p.reload();
  await p.click('#storyLink');
  assert.deepEqual(await pressReview(p), expected, 'pressed after reloading the page');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('a clean typed draft: "Nothing found." for all three content checks', async () => {
  const { ctx, p, errors } = await studentWithStory();
  await typeAnswers(p, [
    'Robotics club is where I first saw engineering as a way of thinking.',
    'Further Maths gave me the tools to model motion.',
    'Hospital volunteering showed me how systems serve people.',
  ]);
  assert.deepEqual(await pressReview(p),
    { shared: ['Nothing found.'], repeated: ['Nothing found.'], unused: ['Nothing found.'] });
  assert.deepEqual(errors, []);
  await ctx.close();
});
