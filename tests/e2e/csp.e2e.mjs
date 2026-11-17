// @ts-check
/* global document, localStorage, sessionStorage, window -- used only inside page.evaluate / addInitScript (run in the browser) */
// End-to-end: the Content-Security-Policy every page carries blocks nothing the site does. A
// securitypolicyviolation listener is installed before any page script runs; each flow below is driven
// with real clicks and must finish with zero violations. The same run records every third-party host
// a page asks for (expected: the Cloudflare Web Analytics beacon only) and checks "Erase my plan from
// this device" end to end.
// Run: npm i --no-save playwright-core && npm run test:e2e
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(process.env.ALTIORA_ROOT || fileURLToPath(new URL('../..', import.meta.url)));
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
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

const BEACON_HOSTS = ['static.cloudflareinsights.com', 'cloudflareinsights.com'];

/**
 * A browser context that enforces the pages' own policy (no bypass), reports every violation to Node,
 * and logs every request that leaves the site. The beacon script is answered locally with an empty
 * file, so nothing reaches Cloudflare from a test run; any other outside host is refused and recorded.
 */
async function harness(/** @type {object} */ opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, ...opts });
  /** @type {Array<{directive: string, blocked: string, page: string, sample: string}>} */
  const violations = [];
  /** @type {Record<string, number>} */
  const thirdParty = {};
  /** @type {string[]} */
  const fontFiles = [];
  await ctx.exposeBinding('__cspViolation', (_src, /** @type {any} */ v) => { violations.push(v); });
  await ctx.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', e => {
      /** @type {any} */ (window).__cspViolation({ directive: e.effectiveDirective, blocked: e.blockedURI, page: e.documentURI, sample: e.sample });
    });
  });
  await ctx.route('**/*', (/** @type {any} */ r) => {
    const url = new URL(r.request().url());
    if (url.origin === base) { if (url.pathname.endsWith('.woff2')) fontFiles.push(url.pathname); return r.continue(); }
    thirdParty[url.hostname] = (thirdParty[url.hostname] ?? 0) + 1;
    if (url.hostname === 'static.cloudflareinsights.com') return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    return r.abort();
  });
  const p = await ctx.newPage();
  /** @type {string[]} */
  const consoleCsp = [];
  p.on('console', (/** @type {any} */ m) => { if (/Content Security Policy/i.test(m.text())) consoleCsp.push(m.text()); });
  /** @type {string[]} */
  const pageErrors = [];
  p.on('pageerror', (/** @type {any} */ e) => pageErrors.push(String(e.message)));
  return { ctx, p, violations, consoleCsp, pageErrors, thirdParty, fontFiles };
}

test('no Content-Security-Policy violation in any flow; the only outside host is the Cloudflare beacon', async () => {
  const h = await harness();
  const { p } = h;
  /** @type {Array<[string, number]>} */
  const perFlow = [];
  let seen = 0;
  const flow = async (/** @type {string} */ name, /** @type {() => Promise<void>} */ run) => {
    await run();
    await p.waitForTimeout(150);                       // let any late violation event arrive
    const n = h.violations.length + h.consoleCsp.length - seen;
    seen = h.violations.length + h.consoleCsp.length;
    perFlow.push([name, n]);
  };
  const openProfile = async () => { await p.click('#profileIndicatorBtn'); await p.locator('#profileMenu:not(.hidden)').waitFor(); };

  // A fixed date early in the application year, so the calendar has events to export whenever this runs.
  await p.clock.setFixedTime(new Date('2026-09-15T09:00:00'));
  await flow('onboarding', async () => {
    await p.goto(`${base}/app.html`);
    await p.locator('.stage-card', { hasText: 'UK A-Levels' }).click();
    await p.locator('.stage-card', { hasText: 'Year 13' }).click();
    await p.click('#stageProposalAccept');
    for (const s of ['Mathematics', 'Further Mathematics', 'Physics']) {
      await p.locator('#subjectOnboardSlot label.subject-chip', { has: p.locator(`input[value="${s}"]`) }).click();
    }
    await p.click('#subjectOnboardContinue');
  });
  await flow('Check Combination', async () => {
    await p.getByRole('button', { name: /See the \d+ courses your subjects fit/ }).click();
    await p.locator('#panel-check .course-card').first().waitFor();
  });
  await flow('shortlist and CSV export', async () => {
    await p.fill('#resultSearchInput', 'University of Oxford');
    await p.locator('.course-card', { hasText: 'Computer Science' }).filter({ hasText: 'University of Oxford' }).locator('.save-btn').first().click();
    await p.fill('#resultSearchInput', '');
    await p.click('#shortlistLink');
    await p.locator('#panel-shortlist .course-card').first().waitFor();
    const [csv] = await Promise.all([p.waitForEvent('download'), p.click('#exportCsvBtn')]);
    assert.match(csv.suggestedFilename(), /\.csv$/);
    await p.locator('#panel-shortlist details').first().evaluate((/** @type {any} */ d) => { d.open = true; });
  });
  await flow('My Story entry', async () => {
    await p.click('#storyLink');
    await p.click('#achvAddBtn');
    await p.selectOption('#achvType', { label: 'Club or society' });
    await p.click('#achvTitle');
    await p.keyboard.type('Robotics club');
    await p.click('#achvSaveBtn');
    await p.locator('#achvList', { hasText: 'Robotics club' }).waitFor();
  });
  await flow('statement draft and review', async () => {
    await p.locator('textarea.stmt__ta').first().click();
    await p.keyboard.type('I became curious about systems at the robotics club.');
    await p.getByRole('button', { name: 'Review my statement' }).click();
    await p.locator('[data-stmt-review-out]').waitFor();
    assert.ok((await p.locator('[data-stmt-review-out]').innerText()).trim().length > 0);
  });
  await flow('interview practice', async () => {
    await p.click('#shortlistLink');
    await p.locator('#panel-shortlist details').first().evaluate((/** @type {any} */ d) => { d.open = true; });
    await p.locator('#panel-shortlist [data-iv-practise]').first().click();
    await p.locator('#panel-interview h1').waitFor();
  });
  await flow('This month', async () => {
    await p.click('#monthLink');
    await p.locator('#panel-month:not(.hidden)').waitFor();
  });
  await flow('add to calendar', async () => {
    await p.locator('.journey-bar__step', { hasText: 'Applying' }).click();
    const [ics] = await Promise.all([p.waitForEvent('download'), p.locator('#panel-applying').getByRole('button', { name: 'Add to my calendar' }).first().click()]);
    assert.match(ics.suggestedFilename(), /\.ics$/);
  });
  await flow('Counselor Summary', async () => {
    await p.click('#shortlistLink');
    await p.locator('#panel-shortlist [data-open-summary]').first().click();
    await p.locator('#panel-summary:not(.hidden)').waitFor();
  });
  let planFile = '';
  await flow('save plan', async () => {
    await openProfile();
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#backupExportBtn')]);
    assert.match(dl.suggestedFilename(), /^altiora-plan-\d{4}-\d{2}-\d{2}\.json$/);
    planFile = await dl.path();
  });
  await flow('restore plan', async () => {
    await openProfile();
    const [chooser] = await Promise.all([p.waitForEvent('filechooser'), p.click('#backupImportBtn')]);
    await chooser.setFiles(planFile);
    await p.locator('#planDialog[open]').waitFor();
    assert.equal(await p.locator('#planDialogTitle').innerText(), 'Restore this plan?');
    assert.equal(await p.locator('#planDialog [data-plan-confirm]').innerText(), 'Replace my plan');
    await Promise.all([p.waitForEvent('load'), p.click('#planDialog [data-plan-confirm]')]);
    await p.locator('#workspace:not(.hidden)').waitFor();
    assert.deepEqual(await p.evaluate(() => JSON.parse(localStorage.getItem('altiora_state_v1') ?? '{}').shortlist), ['uk-cs-oxford']);
  });
  await flow('erase plan', async () => {
    await p.evaluate(() => sessionStorage.setItem('openStrengthsMode', 'true'));   // the marker must go too
    await openProfile();
    // Below the restore item, in the same group; the note says when to use it.
    assert.deepEqual(await p.locator('#profileMenu [aria-label="Save, restore or erase your plan"] button').allInnerTexts(),
      ['Save my plan to a file', 'Restore my plan from a file', 'Erase my plan from this device']);
    assert.equal(await p.locator('#profileMenu .profile-menu__note').innerText(),
      'Your whole plan in one file on your device. Nothing is uploaded. On a shared or school computer, erase your plan when you finish.');
    await p.click('#planEraseBtn');
    await p.locator('#planDialog[open]').waitFor();
    assert.equal(await p.locator('#planDialogTitle').innerText(), 'Erase your plan from this device?');
    assert.equal((await p.locator('#planDialogBody').innerText()).trim(),
      'This removes everything Altiora has saved in this browser: your subjects, grades, shortlist, story and statement drafts. It can’t be undone. Save your plan to a file first if you want to keep it.');
    assert.deepEqual(await p.locator('#planDialog .plan-dialog__actions button:visible').allInnerTexts(), ['Cancel', 'Erase everything']);
    assert.equal(await p.evaluate(() => document.activeElement?.hasAttribute('data-plan-cancel')), true, 'focus starts on Cancel');
    // Cancel changes nothing.
    await p.click('#planDialog [data-plan-cancel]');
    assert.deepEqual(await p.evaluate(() => JSON.parse(localStorage.getItem('altiora_state_v1') ?? '{}').shortlist), ['uk-cs-oxford']);
    // A restore confirmation opened afterwards is a restore again, not an erase.
    await openProfile();
    await p.click('#planEraseBtn');
    await p.locator('#planDialog[open]').waitFor();
    await Promise.all([p.waitForEvent('load'), p.click('#planDialog [data-plan-confirm]')]);
    await p.locator('#systemSelect:not(.hidden)').waitFor();                         // fresh onboarding
    assert.equal(new URL(p.url()).pathname + new URL(p.url()).search, '/app.html');
    const after = await p.evaluate(() => ({ state: JSON.parse(localStorage.getItem('altiora_state_v1') ?? 'null'), keys: Object.keys(localStorage), marker: sessionStorage.getItem('openStrengthsMode') }));
    assert.equal(after.marker, null);
    assert.deepEqual(after.keys.filter(k => k !== 'altiora_state_v1'), []);
    // What is there now is the fresh first-visit record the new page load wrote: nothing of the plan.
    assert.deepEqual([after.state.shortlist, after.state.profile.subjects, after.state.profile.achievements, after.state.profile.qualificationSystem, after.state.meta.hasOnboarded],
      [[], [], [], null, false]);
    assert.deepEqual(after.state.profile.statementDrafts, { q1: '', q2: '', q3: '' });
  });
  await flow('/app.html?mode=strengths', async () => {
    await p.goto(`${base}/app.html?mode=strengths`);
    await p.locator('#systemSelect:not(.hidden)').waitFor();
    assert.equal(await p.evaluate(() => sessionStorage.getItem('openStrengthsMode')), 'true');   // set by strengths-param.js, as the inline script did
  });
  await flow('index.html About pill', async () => {
    await p.goto(`${base}/index.html`);
    await p.click('#aboutPill');
    assert.equal(await p.locator('#aboutPanel').evaluate((/** @type {any} */ e) => e.classList.contains('open')), true);
    assert.equal(await p.getAttribute('#aboutPill', 'aria-expanded'), 'true');
    await p.keyboard.press('Escape');
    assert.equal(await p.locator('#aboutPanel').evaluate((/** @type {any} */ e) => e.classList.contains('open')), false);
  });
  for (const [name, url] of [['course page', '/courses/uk-maths-bath.html'], ['university page', '/universities/university-of-bath.html'], ['404.html', '/404.html']]) {
    await flow(name, async () => {
      await p.goto(`${base}${url}`);
      await p.locator('h1').first().waitFor();
      await p.evaluate(() => document.fonts.ready);
    });
  }

  for (const [name, n] of perFlow) console.log(`CSP violations — ${name}: ${n}`);
  console.log(`Third-party hosts requested: ${JSON.stringify(h.thirdParty)}`);
  assert.deepEqual(h.violations, [], 'securitypolicyviolation events');
  assert.deepEqual(h.consoleCsp, [], 'console CSP errors');
  assert.deepEqual(h.pageErrors, [], 'page errors');
  assert.equal(perFlow.length, 17);
  for (const host of Object.keys(h.thirdParty)) assert.ok(BEACON_HOSTS.includes(host), `unexpected third-party host ${host}`);
  assert.ok(h.thirdParty['static.cloudflareinsights.com'] >= 1, 'the beacon script was requested (and allowed by the policy)');
  await h.ctx.close();
});

test('the listener works: an inline script injected into a page is refused and reported', async () => {
  const h = await harness();
  await h.p.goto(`${base}/app.html`);
  await h.p.evaluate(() => {
    const s = document.createElement('script');
    s.textContent = 'window.__inlineRan = true;';
    document.head.appendChild(s);
    const b = document.createElement('button');
    b.setAttribute('onclick', 'window.__handlerRan = true');
    document.body.appendChild(b);
    b.click();
  });
  await h.p.waitForTimeout(200);
  assert.deepEqual(await h.p.evaluate(() => [/** @type {any} */ (window).__inlineRan, /** @type {any} */ (window).__handlerRan]), [undefined, undefined]);
  assert.ok(h.violations.length >= 2, JSON.stringify(h.violations));
  assert.ok(h.violations.every(v => /^script-src/.test(v.directive)));
  await h.ctx.close();
});

test('all nine font weights load from /fonts on app.html and index.html, and from nowhere else', async () => {
  const FACES = ['600 16px "Bricolage Grotesque"', '700 16px "Bricolage Grotesque"', '800 16px "Bricolage Grotesque"',
    '400 16px "Hanken Grotesk"', '500 16px "Hanken Grotesk"', '600 16px "Hanken Grotesk"', '700 16px "Hanken Grotesk"',
    '400 16px "Space Mono"', '700 16px "Space Mono"'];
  for (const url of ['/app.html', '/index.html']) {
    const h = await harness();
    await h.p.goto(`${base}${url}`);
    const loaded = await h.p.evaluate(async faces => {
      const out = [];
      for (const f of faces) { const got = await document.fonts.load(f, 'Altiora'); out.push([f, got.length, got.every(x => x.status === 'loaded')]); }
      return out;
    }, FACES);
    for (const [face, n, ok] of loaded) assert.ok(n >= 1 && ok, `${url}: ${face} did not load`);
    assert.ok(h.fontFiles.length >= 9, `${url}: ${h.fontFiles.length} font files fetched`);
    for (const f of h.fontFiles) assert.match(f, /^\/fonts\/[a-z-]+-latin(-ext)?-\d{3}-normal\.woff2$/);
    console.log(`Third-party hosts requested by ${url}: ${JSON.stringify(h.thirdParty)}`);
    for (const host of Object.keys(h.thirdParty)) assert.ok(BEACON_HOSTS.includes(host), `${url}: unexpected host ${host}`);
    assert.deepEqual(h.violations, []);
    await h.ctx.close();
  }
});
