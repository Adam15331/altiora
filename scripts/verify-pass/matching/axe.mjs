/* global switchMode, axe */
// axe-core WCAG 2.0 A/AA over every view in VIEWS below, at 1280px and 375px, each twice (as shown, then
// with every <details> open); reducedMotion reduce, 2.5s wait; also overflow and minimum text size.
// App views get a saved state whose year is stamped as set "now" in the page (no new-school-year prompt),
// except where a view says otherwise. On-demand surfaces are opened with real clicks. Every view has a
// guard: if what it is meant to check is not on screen, the run fails ("VIEW NOT SHOWN").
import { chromium } from 'playwright-core'; import { serve } from './serve.mjs'; import fs from 'node:fs';
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const [root, portArg] = process.argv.slice(2); const port = Number(portArg);
const AXE = fs.readFileSync(process.env.AXE_PATH ?? new URL('../../../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const subs = ['Mathematics', 'Further Mathematics', 'Physics', 'Chemistry'];
const NOW = 'NOW';   // yearSetAt sentinel: replaced in the page with the page's own current time
const st = { profile: { stage: 'choosing', qualificationSystem: 'UK_A_Level', subjects: subs, predictedGrades: Object.fromEntries(subs.map(s => [s, 'A*'])), interests: [], candidateFields: [], achievements: [], applicationTasks: {}, statementDrafts: { q1: '', q2: '', q3: '' }, yearGroup: 'Year 12', yearsUntilApplication: 1, yearSetAt: NOW }, shortlist: ['uk-medicine-oxford', 'uk-medicine-ucl', 'uk-cs-cambridge'], progress: {}, meta: { firstVisit: null, lastVisit: null, hasOnboarded: true } };
const with_ = (/** @type {any} */ profile, /** @type {any} */ rest = {}) => ({ ...st, ...rest, profile: { ...st.profile, ...profile } });
const Y13 = with_({ stage: 'applying', yearGroup: 'Year 13', yearsUntilApplication: 0 });
const Y13_EMPTY = with_({ stage: 'applying', yearGroup: 'Year 13', yearsUntilApplication: 0 }, { shortlist: [] });
const STALE_YEAR = with_({ yearSetAt: '2020-06-01T00:00:00.000Z' });   // set before this school year began

// ── Guards: is the surface this view checks actually on screen? ──
const visible = (/** @type {string} */ sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)});
  return !!el && el.getClientRects().length > 0 && !el.closest('.hidden') && getComputedStyle(el).visibility !== 'hidden'; })()`;
const appView = (/** @type {string} */ mode) => `${visible('#workspace')} && !${visible('#yearSelect')} && ${visible(`#panel-${mode}`)}`;
const page = () => 'document.querySelector("h1, main") !== null';

// ── Setups: real clicks only. ──
/** @param {any} p */
const onboardTo = (/** @type {number} */ step) => async (p) => {
  if (step >= 1) await p.locator('#systemSelect .stage-card', { hasText: 'UK A-Levels' }).click();
  if (step >= 2) await p.locator('#yearSelect .stage-card', { hasText: 'Year 13' }).click();
  if (step >= 3) await p.click('#stageProposalAccept');
};
/** @param {any} p */
const statementReview = async (p) => {
  await p.locator('textarea.stmt__ta').first().click();
  await p.keyboard.type('I became curious about systems at the robotics club.');
  await p.getByRole('button', { name: 'Review my statement' }).click();
};
/** @param {any} p */
const restoreDialog = async (p) => {
  const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Save my plan to a file' }).click()]);
  const file = await dl.path();
  const [chooser] = await Promise.all([p.waitForEvent('filechooser'), p.getByRole('button', { name: 'Restore my plan from a file' }).click()]);
  await chooser.setFiles(file);
  await p.locator('#planDialog[open]').waitFor();
};

// [name, url, state (null = fresh browser), app mode, setup, guard]
const VIEWS = [
  ['Landing', '/index.html', null, null, null, page()],
  ['Home', '/app.html', st, 'home', null, appView('home')],
  ['Check', '/app.html', st, 'check', null, appView('check')],
  ['Shortlist', '/app.html', st, 'shortlist', null, appView('shortlist')],
  ['This month', '/app.html', st, 'month', null, appView('month')],
  ['Story', '/app.html', st, 'story', null, appView('story')],
  ['Interview practice', '/app.html', st, 'interview', null, appView('interview')],
  ['Applying (Year 12 preview)', '/app.html', st, 'applying', null, appView('applying')],
  // App modes
  ['Plan', '/app.html', st, 'plan', null, appView('plan')],
  ['Reverse', '/app.html', st, 'reverse', null, appView('reverse')],
  ['Strengths', '/app.html', st, 'strengths', null, appView('strengths')],
  ['Counsellor summary', '/app.html', st, 'summary', null, appView('summary')],
  // Applying, other states
  ['Applying (Year 13, live checklist)', '/app.html', Y13, 'applying', null, `${appView('applying')} && ${visible('#panel-applying input.applying-task__box')}`],
  ['Applying (empty shortlist)', '/app.html', Y13_EMPTY, 'applying', null, `${appView('applying')} && ${visible('#panel-applying .applying-empty')}`],
  // Onboarding (fresh browser, real clicks)
  ['Onboarding: qualification', '/app.html', null, null, onboardTo(0), visible('#systemSelect')],
  ['Onboarding: year', '/app.html', null, null, onboardTo(1), visible('#yearSelect')],
  ['Onboarding: stage proposal', '/app.html', null, null, onboardTo(2), visible('#stageProposal')],
  ['Onboarding: subject picker', '/app.html', null, null, onboardTo(3), visible('#subjectOnboard')],
  ['New-school-year prompt', '/app.html', STALE_YEAR, null, null, `${visible('#yearSelect')} && /still your year group/.test(document.getElementById('yearSelectHeading').textContent)`],
  // On-demand surfaces (real clicks)
  ['Statement review panel', '/app.html', st, 'story', statementReview, visible('[data-stmt-review-out]')],
  ['Story-entry form', '/app.html', st, 'story', async (/** @type {any} */ p) => p.click('#achvAddBtn'), visible('#achvForm')],
  ['Restore-plan dialog', '/app.html', st, 'story', restoreDialog, 'document.getElementById("planDialog").open'],
  ['Profile popover', '/app.html', st, 'home', async (/** @type {any} */ p) => p.click('#profileIndicatorBtn'), visible('#profileMenu')],
  ['Fields popover', '/app.html', st, 'home', async (/** @type {any} */ p) => p.click('#fieldsLink'), visible('#fieldsMenu')],
  ['About popover', '/app.html', st, 'home', async (/** @type {any} */ p) => p.click('#aboutPill'), `document.getElementById('aboutPanel').classList.contains('open') && ${visible('#aboutPanel')}`],
  // Generated pages
  ['courses/index', '/courses/index.html', null, null, null, page()],
  ['course page (uk-maths-durham)', '/courses/uk-maths-durham.html', null, null, null, page()],
  ['university page (durham-university)', '/universities/durham-university.html', null, null, null, page()],
  ...fs.readdirSync(new URL('../../../fields/', import.meta.url)).filter(f => f.endsWith('.html')).sort()
    .map(f => [`fields/${f.replace('.html', '')}`, `/fields/${f}`, null, null, null, page()]),
  ['privacy', '/privacy.html', null, null, null, page()],
  ['terms', '/terms.html', null, null, null, page()],
  ['accessibility', '/accessibility.html', null, null, null, page()],
];

const only = process.env.VIEWS ? new RegExp(process.env.VIEWS, 'i') : null;   // optional filter by view name
const started = Date.now();
const server = await serve(root, port);
const browser = await chromium.launch({ executablePath: EXE });
let total = 0, runs = 0;
for (const width of [1280, 375]) for (const [name, url, state, mode, setup, guard] of VIEWS) for (const open of [false, true]) {
  if (only && !only.test(name)) continue;
  runs++;
  const label = `${width}px ${name}${open ? ' (all panels open)' : ''}`;
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  // FONTS=1 loads the real web fonts (for overflow checks with their metrics).
  await page.route(process.env.FONTS ? /cloudflareinsights/ : /fonts\.googleapis|fonts\.gstatic|cloudflareinsights/, r => r.abort());
  if (state) {
    await page.addInitScript(s => {
      const saved = JSON.parse(s);
      if (saved.profile.yearSetAt === 'NOW') saved.profile.yearSetAt = new Date().toISOString();
      if (!sessionStorage.getItem('axe_seeded')) {   // seed once: a reload (e.g. after restore) keeps the app's own state
        localStorage.setItem('altiora_state_v1', JSON.stringify(saved));
        sessionStorage.setItem('axe_seeded', '1');
      }
    }, JSON.stringify(state));
  }
  await page.goto(`http://localhost:${port}${url}`);
  if (mode) await page.evaluate(m => switchMode(m), mode);
  await page.waitForTimeout(2500);
  try {
    if (setup) { await setup(page); await page.waitForTimeout(800); }
  } catch (e) { total++; console.log(`${label}: SETUP FAILED (${String(e.message).split('\n')[0]})`); await ctx.close(); continue; }
  // Guard: a view that isn't on screen is a failed check, not a pass.
  if (!await page.evaluate(g => !!(0, eval)(g), guard)) { total++; console.log(`${label}: VIEW NOT SHOWN`); await ctx.close(); continue; }
  const fonts = process.env.FONTS ? await page.evaluate(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')))].join('/'); }) : '';
  if (open) await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  await page.addScriptTag({ content: AXE });
  const res = await page.evaluate(async (verbose) => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })).violations
    .map(v => verbose
      ? `${v.id} (${v.nodes.length})\n${v.nodes.map(n => `      ${n.target.join(' ')} — ${(n.any[0] || n.all[0] || n.none[0])?.message ?? n.failureSummary}`).join('\n')}`
      : `${v.id} (${v.nodes.length})`), !!process.env.VERBOSE);
  const extra = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth > window.innerWidth;
    let min = 99; for (const el of document.querySelectorAll('body *')) { if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue; min = Math.min(min, parseFloat(cs.fontSize)); }
    return { overflow, min };
  });
  total += res.length + (extra.overflow && width === 375 ? 1 : 0) + (extra.min < 12 ? 1 : 0);
  console.log(`${label}: ${res.length ? res.join(', ') : '0 violations'}; overflow=${extra.overflow}; minText=${extra.min}px${fonts ? `; fonts=${fonts}` : ''}`);
  await ctx.close();
}
console.log(`TOTAL violations: ${total} (${runs} runs, ${VIEWS.length} views, ${Math.round((Date.now() - started) / 1000)}s)`);
await browser.close(); server.close();
