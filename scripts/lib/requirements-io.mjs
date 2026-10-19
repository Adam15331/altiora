// @ts-check
/* Shared I/O for the admissions-requirements tooling: load the config,
 * the course dataset and cycle files; write cycle files in the one
 * canonical, diff-friendly layout (one requirement per line). */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const REQ_DIR = path.join(ROOT, 'data', 'requirements');
export const CONFIG_PATH = path.join(REQ_DIR, 'config.js');

/** @typedef {import('../../data/requirements/config.js').RequirementsConfig} RequirementsConfig */
/** @typedef {import('../../data/requirements/config.js').RequirementCycle} RequirementCycle */
/** @typedef {import('../../data/requirements/config.js').RequirementEntry} RequirementEntry */

/** Fresh (uncached) require, so scripts that rewrite a file and re-read it see the new content. */
function freshRequire(p) {
  delete require.cache[require.resolve(p)];
  return require(p);
}

/** @returns {RequirementsConfig} */
export function loadConfig() {
  return freshRequire(CONFIG_PATH);
}

/** @returns {any[]} the course dataset (data/courseRequirements.js) */
export function loadCourses() {
  return freshRequire(path.join(ROOT, 'data', 'courseRequirements.js')).courses;
}

/** @param {string} cycleId */
export function cyclePath(cycleId) {
  return path.join(REQ_DIR, `${cycleId}.js`);
}

/** @param {string} cycleId @returns {RequirementCycle} */
export function loadCycle(cycleId) {
  const p = cyclePath(cycleId);
  if (!fs.existsSync(p)) throw new Error(`No data file for cycle ${cycleId} (expected ${path.relative(ROOT, p)}).`);
  return freshRequire(p);
}

/**
 * Serialise a cycle as a classic-script data file: registers itself on
 * globalThis.AltioraRequirementCycles in the browser, module.exports in
 * Node. One requirement entry per line keeps yearly diffs reviewable.
 * @param {RequirementCycle} cycle
 * @param {string[]} categoryOrder
 * @param {string} header  comment lines (without comment markers)
 */
export function serializeCycle(cycle, categoryOrder, header) {
  const { courses, ...meta } = cycle;
  const lines = [];
  lines.push('/* ═══════════════════════════════════════════════════════════════');
  for (const h of header.split('\n')) lines.push(` * ${h}`.trimEnd());
  lines.push(' * ═══════════════════════════════════════════════════════════════ */');
  lines.push('(function (root) {');
  lines.push(`  const cycle = ${JSON.stringify(meta).replace(/}$/, ',')} "courses": {`);
  const ids = Object.keys(courses);
  ids.forEach((id, i) => {
    lines.push(`    ${JSON.stringify(id)}: {`);
    const rec = courses[id];
    const cats = [...categoryOrder, ...Object.keys(rec).filter(k => !categoryOrder.includes(k))];
    cats.filter(k => k in rec).forEach((cat, j, arr) => {
      lines.push(`      ${JSON.stringify(cat)}: ${JSON.stringify(rec[cat])}${j < arr.length - 1 ? ',' : ''}`);
    });
    lines.push(`    }${i < ids.length - 1 ? ',' : ''}`);
  });
  lines.push('  } };');
  lines.push("  if (typeof module !== 'undefined' && module.exports) module.exports = cycle;");
  lines.push('  else (root.AltioraRequirementCycles = root.AltioraRequirementCycles || {})[cycle.cycle] = cycle;');
  lines.push("})(typeof globalThis !== 'undefined' ? globalThis : this);");
  return lines.join('\n') + '\n';
}

/** @param {RequirementCycle} cycle @param {string} header */
export function writeCycle(cycle, header) {
  const config = loadConfig();
  fs.writeFileSync(cyclePath(cycle.cycle), serializeCycle(cycle, config.categories.map(c => c.id), header));
}

/** Today's date as YYYY-MM-DD (UTC). Overridable for tests/CI via REQUIREMENTS_TODAY. */
export function today() {
  return process.env.REQUIREMENTS_TODAY || new Date().toISOString().slice(0, 10);
}
