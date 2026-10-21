// @ts-check
// The coverage copy in app.html, index.html and llms.txt must state what the
// data holds (fix with `npm run sync-copy`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { syncCoverageCopy, coverageFacts } from '../scripts/lib/coverage-copy.mjs';
import { ROOT, loadConfig, loadCycle } from '../scripts/lib/requirements-io.mjs';

const read = (/** @type {string} */ f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

test('coverage copy matches the data (course count, countries, verification split)', () => {
  assert.deepEqual(syncCoverageCopy(false), [], 'run npm run sync-copy');
  const f = coverageFacts();
  assert.ok(f.total > 0 && f.countries.length > 0);
});

test('the verification split comes from the cycle file row statuses', () => {
  const f = coverageFacts();
  const records = Object.values(loadCycle(loadConfig().currentCycle).courses);
  const has = (/** @type {any} */ r, /** @type {string} */ s) => Object.values(r).some(e => e.status === s);
  assert.equal(f.fullyVerified, records.filter(r => !has(r, 'partial') && !has(r, 'unverified')).length);
  assert.equal(f.withPartial, records.filter(r => has(r, 'partial')).length);
  assert.equal(f.withUnverified, records.filter(r => has(r, 'unverified')).length);
  assert.ok(read('llms.txt').includes(
    `of the ${f.total} records, ${f.fullyVerified} are fully verified, ${f.withPartial} have at least one partly verified requirement `
    + `and ${f.withUnverified} have at least one requirement not yet checked; a record can be in both of the last two groups `
    + `(counted from the row statuses in data/requirements/${f.cycle}.js)`));
});

test('the landing page states the labelling claim, verbatim, on every surface', () => {
  const f = coverageFacts();
  const index = read('index.html');
  const claim = `${f.total} courses. Every requirement is labelled verified, partly verified or not yet checked.`;
  assert.equal(index.split(claim).length - 1, 4, 'meta, og, JSON-LD and hero');
  assert.ok(index.includes('Every requirement shows whether it has been checked against the university\'s own page.'));
});

test('no site file claims "verified courses" or "Every requirement checked"', () => {
  // Everything the site serves: pages, llms.txt and the browser scripts/data.
  /** @param {string} dir @returns {string[]} */
  const walk = dir => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap(d => {
    const rel = path.join(dir, d.name);
    if (d.isDirectory()) return ['node_modules', 'research', 'docs', 'tests', 'scripts'].includes(d.name) || d.name.startsWith('.') ? [] : walk(rel);
    return /\.(html|txt|js|xml)$/.test(d.name) ? [rel] : [];
  });
  const files = walk('.');
  assert.ok(files.includes('index.html') && files.includes('llms.txt'));
  for (const file of files) {
    const src = read(file);
    assert.doesNotMatch(src, /verified courses/i, file);
    assert.doesNotMatch(src, /Every requirement checked/i, file);
  }
});
