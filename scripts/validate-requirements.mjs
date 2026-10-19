#!/usr/bin/env node
// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * npm run validate — fails (exit 1) if any admissions-requirement data
 * is malformed: a course with no record or a missing category, a
 * verified entry without a source or date, a future date, an unknown
 * status, or a current-cycle entry that disagrees with the matching
 * engine's copy in data/courseRequirements.js. Warnings (stale checks)
 * are printed but do not fail.
 * ═══════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadConfig, loadCourses, loadCycle, cyclePath, today } from './lib/requirements-io.mjs';
import { buildReport, REPORT_PATH } from './requirements-report.mjs';
import { validateConfig, validateCycle } from './lib/validate-requirements.mjs';

const config = loadConfig();
const courses = loadCourses();
const todayIso = today();

/** @type {import('./lib/validate-requirements.mjs').Problem[]} */
const problems = [...validateConfig(config)];
for (const cycleId of Object.keys(config.cycles ?? {})) {
  if (!fs.existsSync(cyclePath(cycleId))) {
    problems.push({ level: 'error', where: cycleId, message: `config lists cycle ${cycleId} but data/requirements/${cycleId}.js does not exist` });
    continue;
  }
  problems.push(...validateCycle(loadCycle(cycleId), { config, courses, today: todayIso }));
}

// The site must load the CURRENT cycle's data file.
const appHtml = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
if (!appHtml.includes(`src="data/requirements/${config.currentCycle}.js`)) {
  problems.push({ level: 'error', where: 'app.html', message: `does not load data/requirements/${config.currentCycle}.js (the current cycle) — run npm run new-cycle, or fix the <script> tag` });
}

// The committed review list must match the data it describes.
if (!fs.existsSync(REPORT_PATH) || fs.readFileSync(REPORT_PATH, 'utf8') !== buildReport()) {
  problems.push({ level: 'error', where: 'docs/requirements-review.md', message: 'out of date with the data — run `npm run report` and commit the result' });
}

const errors = problems.filter(p => p.level === 'error');
const warnings = problems.filter(p => p.level === 'warning');
for (const p of warnings) console.warn(`warning  ${p.where}: ${p.message}`);
for (const p of errors) console.error(`error    ${p.where}: ${p.message}`);

const cycles = Object.keys(config.cycles).join(', ');
if (errors.length) {
  console.error(`\n✗ Requirements data invalid: ${errors.length} error(s), ${warnings.length} warning(s) across cycle(s) ${cycles}.`);
  process.exit(1);
}
console.log(`✓ Requirements data valid — cycle(s) ${cycles}, ${courses.length} courses × ${config.categories.length} categories, ${warnings.length} warning(s).`);
