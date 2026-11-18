// @ts-check
/* global document, localStorage, sessionStorage, window, getComputedStyle -- used only inside page.evaluate / addInitScript (run in the browser) */
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
    assert.equal(await p.evaluate(() => sessionStorage.getItem('openStrengthsMode')), null);     // set by strengths-param.js, read and removed by main.js on this same load
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

const RETURNING = () => ({ profile: { stage: 'building', qualificationSystem: 'UK_A_Level', subjects: ['Mathematics', 'Physics'], predictedGrades: {}, interests: [], candidateFields: [], achievements: [], applicationTasks: {}, statementDrafts: { q1: '', q2: '', q3: '' }, yearGroup: 'Year 12', yearsUntilApplication: 1, yearSetAt: new Date().toISOString() }, shortlist: ['uk-cs-oxford'], progress: {}, meta: { hasOnboarded: true } });
/** Seed a saved plan once (a later reload keeps whatever the site itself saved). @param {any} ctx */
const seed = (ctx, state = RETURNING()) => ctx.addInitScript((/** @type {string} */ s) => {
  if (!sessionStorage.getItem('e2e_seeded')) { localStorage.setItem('altiora_state_v1', s); sessionStorage.setItem('e2e_seeded', '1'); }
}, JSON.stringify(state));

/** What is on screen, the saved stage and the journey bar's current step. @param {any} p */
const where = (p) => p.evaluate(() => {
  const raw = localStorage.getItem('altiora_state_v1');
  const showing = Array.from(document.querySelectorAll('#systemSelect, #yearSelect, #stageProposal, #subjectOnboard, [id^="panel-"]'))
    .filter(e => e.getClientRects().length && !e.closest('.hidden')).map(e => e.id).join(',');
  const current = Array.from(document.querySelectorAll('.journey-bar__step')).filter(e => e.getClientRects().length).find(e => e.getAttribute('aria-current'));
  return { showing, stage: raw ? JSON.parse(raw).profile.stage : undefined, bar: current ? (current.textContent ?? '').replace(/\s+/g, ' ').trim() : null };
});
/** The saved plan without the visit timestamp every page load refreshes. @param {any} p */
const plan = (p) => p.evaluate(() => { const s = JSON.parse(localStorage.getItem('altiora_state_v1') ?? '{}'); delete s.meta.lastVisit; return JSON.stringify(s); });

test('the strengths link opens the view and never writes the stage: returning students', async () => {
  for (const [stage, years, yearGroup, bar] of /** @type {Array<[string, number, string, string]>} */ ([['building', 1, 'Year 12', '3Building list'], ['applying', 0, 'Year 13', '4Applying'], ['choosing', 2, 'Year 11', '2Choosing subjects']])) {
    const h = await harness();
    // predictedGrades null is the site's own "none entered" value (an empty map is rewritten to it shortly after any load).
    const state = RETURNING(); Object.assign(state.profile, { stage, yearsUntilApplication: years, yearGroup, predictedGrades: null });
    await seed(h.ctx, state);
    const { p } = h;
    // Before the click: an ordinary visit.
    await p.goto(`${base}/app.html`);
    await p.locator('#panel-home:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'panel-home', stage, bar }, `${stage}: before`);
    const before = await plan(p);
    // Through the link: the strengths view on this first load; stage, journey bar and the whole plan as they were.
    await p.goto(`${base}/app.html?mode=strengths`);
    await p.locator('#panel-strengths:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'panel-strengths', stage, bar }, `${stage}: first load`);
    assert.equal(await plan(p), before, `${stage}: plan unchanged on first load`);
    assert.equal(await p.evaluate(() => sessionStorage.getItem('openStrengthsMode')), null);
    // A reload with the link still in the address: the same.
    await p.reload();
    await p.locator('#panel-strengths:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'panel-strengths', stage, bar }, `${stage}: reload`);
    assert.equal(await plan(p), before, `${stage}: plan unchanged after reload`);
    // A plain visit afterwards: Home.
    await p.goto(`${base}/app.html`);
    await p.locator('#panel-home:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'panel-home', stage, bar }, `${stage}: plain visit`);
    assert.equal(await plan(p), before, `${stage}: plan unchanged on a plain visit`);
    assert.deepEqual([h.violations, h.pageErrors], [[], []]);
    await h.ctx.close();
  }
});

test('the strengths link: a new student gets onboarding in full, keeps the stage they accept, and lands on the strengths view', async () => {
  // What a plain first visit saves (an empty record with visit times): the link must save nothing more.
  const plainCtx = await harness();
  await plainCtx.p.goto(`${base}/app.html`);
  await plainCtx.p.locator('#systemSelect:not(.hidden)').waitFor();
  const strip = (/** @type {string} */ raw) => { const s = JSON.parse(raw); delete s.meta.lastVisit; delete s.meta.firstVisit; return JSON.stringify(s); };
  const plainSaved = strip(await plainCtx.p.evaluate(() => localStorage.getItem('altiora_state_v1') ?? '{}'));
  await plainCtx.ctx.close();

  for (const [year, stage, bar, proposal] of [['Year 12', 'building', '3Building list', /we'll start you at Building your university list/], ['Year 13', 'applying', '4Applying', /we'll start you at Applying/], ['Year 10', 'exploring', '1Exploring fields', /Exploring/]]) {
    const h = await harness();
    const { p } = h;
    // First load: the first onboarding question; nothing saved beyond what any first visit saves.
    await p.goto(`${base}/app.html?mode=strengths`);
    await p.locator('#systemSelect:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'systemSelect', stage: null, bar: null }, `${year}: first load`);
    assert.equal(strip(await p.evaluate(() => localStorage.getItem('altiora_state_v1') ?? '{}')), plainSaved, `${year}: the link saved nothing`);
    assert.equal(await p.evaluate(() => sessionStorage.getItem('openStrengthsMode')), null);
    // Qualification, then year: still no stage.
    await p.locator('.stage-card', { hasText: 'UK A-Levels' }).click();
    await p.locator('#yearSelect:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'yearSelect', stage: null, bar: null }, `${year}: after qualification`);
    await p.locator('.stage-card', { hasText: year }).click();
    // The proposal, as for any new student.
    await p.locator('#stageProposal:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'stageProposal', stage: null, bar: null }, `${year}: proposal`);
    assert.match(await p.locator('#stageProposalReason').innerText(), /** @type {RegExp} */ (proposal), `${year}`);
    await p.click('#stageProposalAccept');
    // The saved stage is the one accepted. Late years get the subject step; then the strengths view.
    if (year !== 'Year 10') {
      await p.locator('#subjectOnboard:not(.hidden)').waitFor();
      assert.deepEqual(await where(p), { showing: 'subjectOnboard', stage, bar: null }, `${year}: subject step`);
      await p.locator('#subjectOnboardSlot label.subject-chip', { has: p.locator('input[value="Mathematics"]') }).click();
      await p.click('#subjectOnboardContinue');
    }
    await p.locator('#panel-strengths:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'panel-strengths', stage, bar }, `${year}: after onboarding`);
    const saved = await plan(p);
    // Reload with the link still in the address: the strengths view, nothing changed.
    await p.reload();
    await p.locator('#panel-strengths:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'panel-strengths', stage, bar }, `${year}: reload`);
    assert.equal(await plan(p), saved, `${year}: plan unchanged after reload`);
    // A plain visit afterwards: Home.
    await p.goto(`${base}/app.html`);
    await p.locator('#panel-home:not(.hidden)').waitFor();
    assert.deepEqual(await where(p), { showing: 'panel-home', stage, bar }, `${year}: plain visit`);
    assert.equal(await plan(p), saved);
    assert.deepEqual([h.violations, h.pageErrors], [[], []]);
    await h.ctx.close();
  }
  // Without the link, onboarding still ends on the stage's own tool (Year 12: Check Combination).
  const n = await harness();
  await n.p.goto(`${base}/app.html`);
  await n.p.locator('.stage-card', { hasText: 'UK A-Levels' }).click();
  await n.p.locator('.stage-card', { hasText: 'Year 12' }).click();
  await n.p.click('#stageProposalAccept');
  await n.p.click('#subjectOnboardSkip');
  await n.p.locator('#panel-check:not(.hidden)').waitFor();
  assert.deepEqual(await where(n.p), { showing: 'panel-check', stage: 'building', bar: '3Building list' });
  await n.ctx.close();
});

test('restore: a file with an unknown stage is refused in the dialog, the plan is untouched and every section still loads', async () => {
  const { writeFile, mkdtemp } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { createHash } = await import('node:crypto');
  const dir = await mkdtemp(join(tmpdir(), 'altiora-plan-'));
  const fileFor = async (/** @type {string} */ name, /** @type {any} */ state) => {
    const raw = JSON.stringify(state);
    const f = join(dir, name);
    await writeFile(f, JSON.stringify({ app: 'altiora', kind: 'plan', schemaVersion: 2, exportedAt: new Date().toISOString(), data: { altiora_state_v1: raw }, checksum: { algorithm: 'SHA-256', value: createHash('sha256').update(raw).digest('hex') } }));
    return f;
  };
  const bad = RETURNING(); bad.profile.stage = 'nonsense'; bad.shortlist = ['uk-maths-bath'];
  const badSystem = RETURNING(); badSystem.profile.qualificationSystem = 'NL_VWO';
  const good = RETURNING(); good.shortlist = ['uk-maths-bath', 'uk-cs-oxford'];
  const h = await harness();
  await seed(h.ctx);
  const { p } = h;
  await p.goto(`${base}/app.html`);
  const stored = () => p.evaluate(() => { const s = JSON.parse(localStorage.getItem('altiora_state_v1') ?? '{}'); return [s.profile.stage, s.profile.qualificationSystem, s.shortlist]; });
  const pick = async (/** @type {string} */ file) => {
    await p.click('#profileIndicatorBtn');
    const [chooser] = await Promise.all([p.waitForEvent('filechooser'), p.click('#backupImportBtn')]);
    await chooser.setFiles(file);
    await p.locator('#planDialog[open]').waitFor();
  };
  for (const f of [await fileFor('bad-stage.json', bad), await fileFor('bad-system.json', badSystem)]) {
    await pick(f);
    assert.equal(await p.locator('#planDialogTitle').innerText(), 'This file can’t be restored');
    assert.equal((await p.locator('#planDialogBody').innerText()).trim(), 'That file names a stage or qualification that Altiora doesn’t have, so it can’t be restored. Nothing has been changed.');
    assert.equal(await p.locator('#planDialog [data-plan-confirm]').isVisible(), false);       // nothing to confirm
    await p.click('#planDialog [data-plan-cancel]');
    assert.deepEqual(await stored(), ['building', 'UK_A_Level', ['uk-cs-oxford']]);
  }
  // Every section still loads, before and after a reload.
  const MODES = ['home', 'check', 'shortlist', 'month', 'story', 'interview', 'applying', 'plan', 'reverse', 'strengths', 'summary'];
  for (const round of ['now', 'after reload']) {
    if (round === 'after reload') await p.reload();
    for (const m of MODES) {
      await p.evaluate(mode => /** @type {any} */ (window).switchMode(mode), m);
      await p.locator(`#panel-${m}:not(.hidden)`).waitFor({ timeout: 5000 });
    }
  }
  assert.deepEqual(await stored(), ['building', 'UK_A_Level', ['uk-cs-oxford']]);
  // A valid file still restores.
  await pick(await fileFor('good.json', good));
  assert.equal(await p.locator('#planDialogTitle').innerText(), 'Restore this plan?');
  await Promise.all([p.waitForEvent('load'), p.click('#planDialog [data-plan-confirm]')]);
  await p.locator('#workspace:not(.hidden)').waitFor();
  assert.deepEqual(await stored(), ['building', 'UK_A_Level', ['uk-maths-bath', 'uk-cs-oxford']]);
  assert.deepEqual([h.violations, h.pageErrors], [[], []]);
  await h.ctx.close();
});

test('profile menu: all of it, padding included, is inside the viewport at 375px and at desktop width', async () => {
  for (const width of [375, 320, 1280]) {
    const h = await harness({ viewport: { width, height: 800 } });
    await seed(h.ctx);
    await h.p.goto(`${base}/app.html`);
    await h.p.evaluate(() => document.fonts.ready);
    await h.p.click('#profileIndicatorBtn');
    await h.p.locator('#profileMenu:not(.hidden)').waitFor();
    const m = await h.p.evaluate(() => {
      const menu = /** @type {HTMLElement} */ (document.getElementById('profileMenu'));
      const r = menu.getBoundingClientRect();
      const inner = Array.from(menu.querySelectorAll('button, .profile-menu__label, .profile-menu__note')).map(e => e.getBoundingClientRect());
      return { left: r.left, right: r.right, vw: document.documentElement.clientWidth, scrollW: document.documentElement.scrollWidth,
        innerLeft: Math.min(...inner.map(x => x.left)), innerRight: Math.max(...inner.map(x => x.right)), padLeft: parseFloat(getComputedStyle(menu).paddingLeft) };
    });
    console.log(`Profile menu at ${width}px: left ${m.left}, right ${m.right} of 0–${m.vw}; contents ${m.innerLeft}–${m.innerRight}`);
    assert.ok(m.left >= 0 && m.right <= m.vw, `${width}px: menu spans ${m.left}–${m.right} of ${m.vw}`);
    assert.ok(m.innerLeft >= m.left + m.padLeft - 0.5, `${width}px: padding intact`);
    assert.equal(m.scrollW, m.vw, `${width}px: no sideways scroll`);
    assert.deepEqual(h.violations, []);
    await h.ctx.close();
  }
});
