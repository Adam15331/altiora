#!/usr/bin/env node
// Usage: node scripts/verify-pass/summary.mjs <COUNTRY>
// Status counts per category for one country. ✓* = verified but dated
// before config.snippetsRequiredFrom (kept, not re-checked in the pass).
import { loadConfig, loadCourses, loadCycle } from '../lib/requirements-io.mjs';

const country = process.argv[2] ?? 'UK';
const config = loadConfig();
const cycle = loadCycle(config.currentCycle);
const courses = loadCourses().filter(c => c.country === country);
const cut = config.snippetsRequiredFrom;
console.log(`${country}: ${courses.length} courses\n`);
console.log('| Category | ✓ | ✓* | ◐ | ✗ | n/a |\n|---|---:|---:|---:|---:|---:|');
for (const cat of config.categories) {
  const n = { v: 0, k: 0, p: 0, u: 0, na: 0 };
  for (const c of courses) {
    const e = cycle.courses[c.id][cat.id];
    if (e.status === 'verified') (e.lastVerified >= cut ? n.v++ : n.k++);
    else if (e.status === 'partial') n.p++;
    else if (e.status === 'notApplicable') n.na++;
    else n.u++;
  }
  console.log(`| ${cat.label} | ${n.v} | ${n.k} | ${n.p} | ${n.u} | ${n.na} |`);
}
