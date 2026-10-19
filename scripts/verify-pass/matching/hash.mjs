/* global switchMode, checkStatusFor, courses */
// Matching-hash baselines: node scripts/verify-pass/matching/hash.mjs <repo root> <port> [dump-prefix]
// sha256 (first 8 hex) of [id, status, ibHLWarning, gradeGap] for every course, per fixture,
// with the fixture seeded into localStorage altiora_state_v1. Needs playwright-core
// (npm i --no-save playwright-core) and the pre-installed Chromium.
import { chromium } from 'playwright-core'; import { serve } from './serve.mjs';
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const root = process.argv[2]; const port = Number(process.argv[3] ?? 8731); const dump = process.argv[4];
const fs = await import("node:fs");
const FIX = {
  UK: { sys: 'UK_A_Level', year: 'Year 12', subjects: ['Mathematics', 'Further Mathematics', 'Physics', 'Chemistry'], grade: 'A*' },
  IB: { sys: 'IB', year: 'Year 12', subjects: ['Mathematics: Analysis and Approaches HL', 'Physics HL', 'Chemistry HL'], grades: '38' },
  SG: { sys: 'SG_A_Level', year: 'Year 12', subjects: ['H2 Mathematics', 'H2 Physics', 'H2 Chemistry'], grade: 'A' },
  HK: { sys: 'HK_DSE', year: 'Year 12', subjects: ['Mathematics Compulsory Part', 'Mathematics Extended Part Module 2 (M2)', 'Physics', 'Chemistry'], grade: '5**' },
  US_AP: { sys: 'US_AP', year: 'Grade 11', subjects: ['AP Calculus BC', 'AP Chemistry', 'AP Biology', 'AP Physics C: Mechanics', 'AP Computer Science A', 'AP US History', 'AP Macroeconomics', 'AP English Literature and Composition', 'AP Statistics'], grade: '5' },
};
const server = await serve(root, port);
const browser = await chromium.launch({ executablePath: EXE });
const out = {};
for (const [k, f] of Object.entries(FIX)) {
  const page = await browser.newPage();
  await page.route(/fonts\.googleapis|fonts\.gstatic|cloudflareinsights/, r => r.abort());
  const predicted = f.grades ?? Object.fromEntries(f.subjects.map(s => [s, f.grade]));
  const st = { profile: { stage: 'choosing', qualificationSystem: f.sys, subjects: f.subjects, predictedGrades: predicted, interests: [], candidateFields: [], achievements: [], applicationTasks: {}, statementDrafts: { q1: '', q2: '', q3: '' }, yearGroup: f.year, yearsUntilApplication: 1, yearSetAt: null }, shortlist: [], progress: {}, meta: { firstVisit: null, lastVisit: null, hasOnboarded: true } };
  await page.addInitScript(s => { localStorage.setItem('altiora_state_v1', s); }, JSON.stringify(st));
  await page.goto(`http://localhost:${port}/app.html`);
  await page.waitForFunction(() => typeof checkStatusFor === 'function' && typeof courses !== 'undefined');
  const r = await page.evaluate(async () => {
    switchMode('check');
    await new Promise(r => setTimeout(r, 300));
    const rows = courses.map(c => { const r = checkStatusFor(c); return [c.id, r.status, r.ibHLWarning ?? null, r.gradeGap ?? null]; });
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(rows)));
    return { rows, hash: [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8), greens: rows.filter(x => x[1] === 'green').length };
  });
  if (dump) fs.writeFileSync(`${dump}-${k}.json`, JSON.stringify(r.rows)); delete r.rows; out[k] = r; await page.close();
}
console.log(JSON.stringify(out));
await browser.close(); server.close();
