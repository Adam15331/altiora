// @ts-check
// The coverage copy in app.html, index.html and llms.txt must state what the
// data holds (fix with `npm run sync-copy`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { syncCoverageCopy, coverageFacts } from '../scripts/lib/coverage-copy.mjs';
import { ROOT, loadConfig, loadCycle } from '../scripts/lib/requirements-io.mjs';

test('coverage copy matches the data (course count, countries, partial count)', () => {
  assert.deepEqual(syncCoverageCopy(false), [], 'run npm run sync-copy');
  const f = coverageFacts();
  assert.ok(f.total > 0 && f.countries.length > 0);
});

test('verification counts come from the cycle file row statuses', () => {
  const f = coverageFacts();
  const records = Object.values(loadCycle(loadConfig().currentCycle).courses);
  const open = records.filter(r => Object.values(r).some(e => e.status === 'partial' || e.status === 'unverified')).length;
  assert.equal(f.partial, open);
  assert.equal(f.fullyVerified + f.partial, records.length);
  const llms = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
  assert.ok(llms.includes(`${f.partial} of the ${f.total} records carry a partial verification status (read from the row statuses in data/requirements/${f.cycle}.js`));
});

test('the landing page says "checked against official pages", never "verified courses"', () => {
  const f = coverageFacts();
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const phrase = `${f.total} courses, each checked against the university's official pages, across`;
  assert.equal(index.split(phrase).length - 1, 4, 'meta, og, JSON-LD and hero');
  for (const file of ['index.html', 'app.html', 'llms.txt']) {
    assert.doesNotMatch(fs.readFileSync(path.join(ROOT, file), 'utf8'), /\d+ verified courses/, file);
  }
});
