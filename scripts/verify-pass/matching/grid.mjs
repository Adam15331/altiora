/* global switchMode, checkStatusFor, courses */
// SYNTHETIC profile grid — made-up student profiles, not real data.
// Usage: node scripts/verify-pass/matching/grid.mjs <root> <port> <out.json>  → { profileName: { courseId: status } }
import { chromium } from 'playwright-core'; import { serve } from './serve.mjs'; import fs from 'node:fs';
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const [root, portArg, outFile] = process.argv.slice(2); const port = Number(portArg);
const AL = { sci: ['Mathematics', 'Chemistry', 'Biology'], phys: ['Mathematics', 'Physics', 'Chemistry'], fm: ['Mathematics', 'Further Mathematics', 'Physics'], cs: ['Mathematics', 'Further Mathematics', 'Computer Science'], econ: ['Mathematics', 'Economics', 'History'], hum: ['History', 'English Literature', 'Politics'] };
const GR = { 'A*A*A*': ['A*', 'A*', 'A*'], 'A*A*A': ['A*', 'A*', 'A'], 'A*AA': ['A*', 'A', 'A'], AAA: ['A', 'A', 'A'], AAB: ['A', 'A', 'B'] };
const IB = { sci: ['Chemistry HL', 'Biology HL', 'Mathematics: Analysis and Approaches SL'], phys: ['Mathematics: Analysis and Approaches HL', 'Physics HL', 'Chemistry HL'], ai: ['Mathematics: Applications and Interpretation HL', 'Physics HL', 'Economics HL'], hum: ['History HL', 'English A: Literature HL', 'Economics HL'] };
const P = {};
for (const [sk, subs] of Object.entries(AL)) for (const [gk, g] of Object.entries(GR)) P[`AL ${sk} ${gk}`] = { sys: 'UK_A_Level', subjects: subs, grades: Object.fromEntries(subs.map((s, i) => [s, g[i]])) };
for (const [sk, subs] of Object.entries(IB)) for (const pts of ['34', '36', '38', '40', '42']) P[`IB ${sk} ${pts}`] = { sys: 'IB', subjects: subs, grades: pts };
const server = await serve(root, port);
const browser = await chromium.launch({ executablePath: EXE });
const out = {};
for (const [name, f] of Object.entries(P)) {
  const page = await browser.newPage();
  await page.route(/fonts\.googleapis|fonts\.gstatic|cloudflareinsights/, r => r.abort());
  const st = { profile: { stage: 'choosing', qualificationSystem: f.sys, subjects: f.subjects, predictedGrades: f.grades, interests: [], candidateFields: [], achievements: [], applicationTasks: {}, statementDrafts: { q1: '', q2: '', q3: '' }, yearGroup: 'Year 12', yearsUntilApplication: 1, yearSetAt: null }, shortlist: [], progress: {}, meta: { firstVisit: null, lastVisit: null, hasOnboarded: true } };
  await page.addInitScript(s => { localStorage.setItem('altiora_state_v1', s); }, JSON.stringify(st));
  await page.goto(`http://localhost:${port}/app.html`);
  await page.waitForFunction(() => typeof checkStatusFor === 'function' && typeof courses !== 'undefined');
  out[name] = await page.evaluate(async () => { switchMode('check'); await new Promise(r => setTimeout(r, 300)); return Object.fromEntries(courses.filter(c => c.country === 'UK').map(c => [c.id, checkStatusFor(c).status])); });
  await page.close();
}
fs.writeFileSync(outFile, JSON.stringify(out));
console.log(Object.keys(out).length, 'profiles');
await browser.close(); server.close();
