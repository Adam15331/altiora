#!/usr/bin/env node
// @ts-check
/* Syntax-checks EVERY JavaScript file in the repo with `node --check`,
 * including the legacy browser files ESLint does not cover. */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/requirements-io.mjs';

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    if (d.name === 'node_modules' || d.name.startsWith('.')) return [];
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : /\.(m?js)$/.test(d.name) ? [p] : [];
  });
}

let failed = 0;
const files = walk(ROOT);
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { failed++; console.error(`✗ ${path.relative(ROOT, f)}\n${/** @type {any} */ (e).stderr}`); }
}
if (failed) { console.error(`${failed} file(s) failed the syntax check.`); process.exit(1); }
console.log(`✓ Syntax OK — ${files.length} JavaScript files.`);
