#!/usr/bin/env node
// Usage: node scripts/verify-pass/apply.mjs <batch.json> <changes-out.json>
// Writes the batch rows into the current cycle file (canonical layout via
// writeCycle, keeping the file's header) and saves [{id, cat, old, new}]
// for changelog.mjs.
import fs from 'node:fs';
import { loadConfig, loadCycle, cyclePath, writeCycle } from '../lib/requirements-io.mjs';
import { readBatch } from './lib.mjs';

const [file, out] = process.argv.slice(2);
const batch = readBatch(file);
const config = loadConfig();
const cycle = loadCycle(config.currentCycle);
const src = fs.readFileSync(cyclePath(config.currentCycle), 'utf8');
const header = (src.match(/^\/\* ═+\n([\s\S]*?)\n \* ═+ \*\//)?.[1] ?? '')
  .split('\n').map(l => l.replace(/^ \* ?/, '')).join('\n');
const changes = [];
for (const { id, cat, entry } of batch.rows) {
  const old = cycle.courses[id][cat];
  if (JSON.stringify(old) === JSON.stringify(entry)) continue;
  changes.push({ id, cat, old, new: entry });
  cycle.courses[id][cat] = entry;
}
writeCycle(cycle, header);
fs.writeFileSync(out, JSON.stringify(changes, null, 2));
console.log(`applied ${changes.length} changed row(s)`);
