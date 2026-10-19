#!/usr/bin/env node
// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Annual update — start the next admissions cycle.
 *
 *   npm run new-cycle -- 2028
 *     Drafts data/requirements/2028.js from the current cycle with EVERY
 *     entry reset to unverified (the old value kept as `recorded`), and
 *     registers 2028 in config.cycles. The site keeps showing the current
 *     cycle while reviewers verify the draft.
 *
 *   npm run new-cycle -- 2028 --make-current
 *     Switches the site to 2028: sets config.currentCycle and points
 *     app.html's <script> at 2028.js. Run when the draft is reviewed.
 *
 * Old cycle files are never deleted — they stay as the record of what
 * was published for that year.
 * ═══════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CONFIG_PATH, loadConfig, loadCycle, cyclePath, writeCycle, today } from './lib/requirements-io.mjs';
import { carryForward, cycleInfo } from './lib/cycles.mjs';

/** @param {string} m @returns {never} */
function die(m) { console.error(m); process.exit(1); }

const args = process.argv.slice(2);
const year = args.find(a => /^\d{4}$/.test(a)) ?? die('Usage: npm run new-cycle -- <year> [--make-current]   e.g. npm run new-cycle -- 2028');
const makeCurrent = args.includes('--make-current');

const config = loadConfig();
let configSrc = fs.readFileSync(CONFIG_PATH, 'utf8');
const changelog = path.join(ROOT, 'data', 'requirements', 'CHANGELOG.md');

if (!makeCurrent) {
  if (config.cycles[year]) die(`Cycle ${year} already exists in config.cycles.`);
  if (fs.existsSync(cyclePath(year))) die(`data/requirements/${year}.js already exists.`);
  if (Number(year) <= Number(config.currentCycle)) die(`New cycle ${year} must be later than the current cycle ${config.currentCycle}.`);
  const draft = carryForward(loadCycle(config.currentCycle), year);
  const info = cycleInfo(year);
  // Register the cycle in config (insert after the last entry of `cycles: {`).
  const re = /(cycles: \{\n(?:\s+'\d{4}': \{[^\n]*\},\n)+)/;
  if (!re.test(configSrc)) die('Could not find the cycles block in data/requirements/config.js — add the cycle by hand.');
  configSrc = configSrc.replace(re, m => `${m}      '${year}': { label: '${info.label}', applicationPeriod: '${info.applicationPeriod}' },\n`);
  fs.writeFileSync(CONFIG_PATH, configSrc);
  writeCycle(draft, [
    `Altiora — admissions requirements, ${info.label} (${info.applicationPeriod}).`,
    '',
    `DRAFT started ${today()} from the ${config.cycles[config.currentCycle].label} data by`,
    '`npm run new-cycle`. Every entry starts unverified; the previous value is',
    'kept as "recorded". Verify each against the official source, then run',
    '`npm run validate` and `npm run report`. Schema: docs/requirements-data.md.',
  ].join('\n'));
  fs.appendFileSync(changelog, `\n## ${today()} — ${info.label} draft started\n\n- Created \`data/requirements/${year}.js\` from ${config.cycles[config.currentCycle].label}; every entry reset to unverified, previous values kept as \`recorded\`.\n`);
  console.log(`Drafted data/requirements/${year}.js and registered ${year} in config. The site still shows ${config.currentCycle}.`);
  console.log(`Next: verify entries, then \`npm run new-cycle -- ${year} --make-current\`.`);
} else {
  if (!config.cycles[year] || !fs.existsSync(cyclePath(year))) die(`Cycle ${year} has no draft yet — run \`npm run new-cycle -- ${year}\` first.`);
  const prev = config.currentCycle;
  configSrc = configSrc.replace(/currentCycle: '\d{4}'/, `currentCycle: '${year}'`);
  fs.writeFileSync(CONFIG_PATH, configSrc);
  const appPath = path.join(ROOT, 'app.html');
  const app = fs.readFileSync(appPath, 'utf8');
  const tag = /src="data\/requirements\/\d{4}\.js\?v=\d+"/;
  if (!tag.test(app)) die('Could not find the cycle <script> tag in app.html.');
  fs.writeFileSync(appPath, app.replace(tag, `src="data/requirements/${year}.js?v=1"`));
  fs.appendFileSync(changelog, `\n## ${today()} — site switched to ${config.cycles[year].label}\n\n- \`currentCycle\` ${prev} → ${year}; app.html now loads \`data/requirements/${year}.js\`. ${config.cycles[prev].label} data kept for reference.\n`);
  console.log(`Site now shows ${config.cycles[year].label}. Run \`npm run report\` and \`npm run check\`.`);
}
