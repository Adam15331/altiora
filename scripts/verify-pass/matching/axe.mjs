/* global switchMode, axe */
// axe-core WCAG 2.0 A/AA on Landing, Check, Shortlist, fields/medicine (+ all <details> open),
// reducedMotion reduce, 2.5s wait; also 375px overflow and minimum text size.
import { chromium } from 'playwright-core'; import { serve } from './serve.mjs'; import fs from 'node:fs';
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const [root, portArg] = process.argv.slice(2); const port = Number(portArg);
const AXE = fs.readFileSync(process.env.AXE_PATH ?? new URL('../../../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const subs = ['Mathematics', 'Further Mathematics', 'Physics', 'Chemistry'];
const st = { profile: { stage: 'choosing', qualificationSystem: 'UK_A_Level', subjects: subs, predictedGrades: Object.fromEntries(subs.map(s => [s, 'A*'])), interests: [], candidateFields: [], achievements: [], applicationTasks: {}, statementDrafts: { q1: '', q2: '', q3: '' }, yearGroup: 'Year 12', yearsUntilApplication: 1, yearSetAt: null }, shortlist: ['uk-medicine-oxford', 'uk-medicine-ucl', 'uk-cs-cambridge'], progress: {}, meta: { firstVisit: null, lastVisit: null, hasOnboarded: true } };
const PAGES = [
  ['Landing', '/index.html', null], ['Check', '/app.html', 'check'], ['Shortlist', '/app.html', 'shortlist'], ['fields/medicine', '/fields/medicine.html', null],
];
const server = await serve(root, port);
const browser = await chromium.launch({ executablePath: EXE });
let total = 0;
for (const width of [1280, 375]) for (const [name, url, mode] of PAGES) for (const open of [false, true]) {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  await page.route(/fonts\.googleapis|fonts\.gstatic|cloudflareinsights/, r => r.abort());
  await page.addInitScript(s => { localStorage.setItem('altiora_state_v1', s); }, JSON.stringify(st));
  await page.goto(`http://localhost:${port}${url}`);
  if (mode) await page.evaluate(m => switchMode(m), mode);
  await page.waitForTimeout(2500);
  if (open) await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  await page.addScriptTag({ content: AXE });
  const res = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })).violations.map(v => `${v.id} (${v.nodes.length})`));
  const extra = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth > window.innerWidth;
    let min = 99; for (const el of document.querySelectorAll('body *')) { if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue; min = Math.min(min, parseFloat(cs.fontSize)); }
    return { overflow, min };
  });
  total += res.length;
  console.log(`${width}px ${name}${open ? ' (all panels open)' : ''}: ${res.length ? res.join(', ') : '0 violations'}; overflow=${extra.overflow}; minText=${extra.min}px`);
  await ctx.close();
}
console.log('TOTAL violations:', total);
await browser.close(); server.close();
