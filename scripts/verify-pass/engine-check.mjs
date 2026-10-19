#!/usr/bin/env node
// Usage: node scripts/verify-pass/engine-check.mjs <batch.json>
// Applies the batch in memory and runs the repo validator over the result
// (schema, provenance and the engine lock). Writes nothing. Exit 1 on error.
import { loadConfig, loadCourses, loadCycle, today } from '../lib/requirements-io.mjs';
import { validateCycle } from '../lib/validate-requirements.mjs';
import { readBatch } from './lib.mjs';

const batch = readBatch(process.argv[2]);
const config = loadConfig();
const cycle = loadCycle(config.currentCycle);
for (const { id, cat, entry } of batch.rows) cycle.courses[id][cat] = entry;
const ids = new Set(batch.rows.map(r => r.id));
const errs = validateCycle(cycle, { config, courses: loadCourses(), today: today() })
  .filter(p => p.level === 'error' && [...ids].some(id => p.where.includes(id)));
for (const p of errs) console.error(`✗ ${p.where}: ${p.message}`);
console.log(`${batch.rows.length} rows, ${errs.length} validator error(s)`);
process.exit(errs.length ? 1 : 0);
