/* global switchMode, axe */
// axe-core WCAG 2.0 A/AA over every view in VIEWS below; also overflow at 375px and minimum text size.
//   node scripts/verify-pass/matching/axe.mjs <root> <port> build    every view at 375px, details open (per build)
//   node scripts/verify-pass/matching/axe.mjs <root> <port> release  1280 + 375px, details closed and open (before release; default)
// Env: CHROMIUM_PATH, SWEEP_WORKERS (default 4), VIEWS (name filter), VERBOSE=1. Exits 1 on any failure.
// The site's own fonts (served from /fonts) are loaded, so overflow and text size are checked with real metrics.
// The sweep injects axe-core and evaluates its guards, both of which the pages' Content-Security-Policy would
// refuse, so its browser contexts bypass the policy (tests/e2e/csp.e2e.mjs is what checks the policy).
// reducedMotion reduce; each run waits for the page to settle (no DOM change for 300ms, max 3s).
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
  ['Erase-plan dialog', '/app.html', st, 'home', async (/** @type {any} */ p) => { await p.click('#profileIndicatorBtn'); await p.click('#planEraseBtn'); await p.locator('#planDialog[open]').waitFor(); },
    'document.getElementById("planDialog").open && document.getElementById("planDialogTitle").textContent.startsWith("Erase your plan")'],
  ['Fields popover', '/app.html', st, 'home', async (/** @type {any} */ p) => p.click('#fieldsLink'), visible('#fieldsMenu')],
  ['About popover', '/app.html', st, 'home', async (/** @type {any} */ p) => p.click('#aboutPill'), `document.getElementById('aboutPanel').classList.contains('open') && ${visible('#aboutPanel')}`],
  // Generated pages
  ['courses/index', '/courses/index.html', null, null, null, page()],
  ['course page (uk-maths-durham)', '/courses/uk-maths-durham.html', null, null, null, page()],
  ['university page (durham-university)', '/universities/durham-university.html', null, null, null, page()],
  ['universities/index', '/universities/index.html', null, null, null, page()],
  ['404', '/404.html', null, null, null, page()],
  ...fs.readdirSync(new URL('../../../fields/', import.meta.url)).filter(f => f.endsWith('.html')).sort()
    .map(f => [`fields/${f.replace('.html', '')}`, `/fields/${f}`, null, null, null, page()]),
  ['privacy', '/privacy.html', null, null, null, page()],
  ['terms', '/terms.html', null, null, null, page()],
  ['accessibility', '/accessibility.html', null, null, null, page()],
];

const only = process.env.VIEWS ? new RegExp(process.env.VIEWS, 'i') : null;   // optional filter by view name
// Which set: 'build' (every view at 375px, details open — run on every build)
// or 'release' (1280 and 375px, details closed and open — run before release).
const SET = process.argv[4] ?? process.env.SWEEP_SET ?? 'release';
if (!['build', 'release'].includes(SET)) throw new Error(`Unknown set "${SET}": use build or release`);
const WIDTHS = SET === 'build' ? [375] : [1280, 375];
const OPENS = SET === 'build' ? [true] : [false, true];
const WORKERS = Number(process.env.SWEEP_WORKERS ?? 4);   // runs in parallel, each in its own browser context

// Settled: no DOM change for 300ms (capped at 3s), and web fonts done. Replaces a fixed 2.5s wait.
/** @param {import('playwright-core').Page} page */
const settle = page => page.evaluate(() => new Promise(resolve => {
  let quiet;
  const done = () => { obs.disconnect(); clearTimeout(quiet); clearTimeout(cap); document.fonts.ready.then(() => resolve(undefined)); };
  const obs = new MutationObserver(() => { clearTimeout(quiet); quiet = setTimeout(done, 300); });
  obs.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  quiet = setTimeout(done, 300);
  const cap = setTimeout(done, 3000);
}));

/** One run → its output line and its failure count. */
async function run(/** @type {any} */ browser, /** @type {number} */ width, /** @type {any[]} */ view, /** @type {boolean} */ open) {
  const [name, url, state, mode, setup, guard] = view;
  const label = `${width}px ${name}${open ? ' (all panels open)' : ''}`;
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width, height: 900 }, acceptDownloads: true, bypassCSP: true });
  try {
    const page = await ctx.newPage();
    await page.route(/cloudflareinsights/, r => r.abort());
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
    await settle(page);
    try {
      if (setup) { await setup(page); await settle(page); }
    } catch (e) { return { line: `${label}: SETUP FAILED (${String(/** @type {Error} */ (e).message).split('\n')[0]})`, fails: 1 }; }
    // Guard: a view that isn't on screen is a failed check, not a pass.
    if (!await page.evaluate(g => !!(0, eval)(g), guard)) return { line: `${label}: VIEW NOT SHOWN`, fails: 1 };
    const fonts = process.env.VERBOSE ? await page.evaluate(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')))].join('/'); }) : '';
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
    return {
      line: `${label}: ${res.length ? res.join(', ') : '0 violations'}; overflow=${extra.overflow}; minText=${extra.min}px${fonts ? `; fonts=${fonts}` : ''}`,
      fails: res.length + (extra.overflow && width === 375 ? 1 : 0) + (extra.min < 12 ? 1 : 0),
    };
  } finally { await ctx.close(); }
}

const started = Date.now();
const server = await serve(root, port);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? EXE });
const jobs = [];
for (const width of WIDTHS) for (const view of VIEWS) for (const open of OPENS) if (!only || only.test(view[0])) jobs.push([width, view, open]);
/** @type {Array<{line: string, fails: number}>} */
const results = new Array(jobs.length);
let next = 0;
await Promise.all(Array.from({ length: Math.max(1, WORKERS) }, async () => {
  while (next < jobs.length) { const i = next++; const [w, v, o] = jobs[i]; results[i] = await run(browser, w, v, o); }
}));
results.forEach(r => console.log(r.line));   // printed in the fixed order, whatever finished first
const total = results.reduce((n, r) => n + r.fails, 0);
console.log(`TOTAL violations: ${total} (${SET} set: ${jobs.length} runs, ${VIEWS.length} views, ${WORKERS} workers, ${Math.round((Date.now() - started) / 1000)}s)`);
await browser.close(); server.close();
process.exitCode = total ? 1 : 0;
