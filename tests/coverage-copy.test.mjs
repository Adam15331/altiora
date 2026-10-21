// @ts-check
// The coverage copy in app.html, index.html and llms.txt must state what the
// data holds (fix with `npm run sync-copy`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { syncCoverageCopy, coverageFacts } from '../scripts/lib/coverage-copy.mjs';

test('coverage copy matches the data (course count, countries, partial count)', () => {
  assert.deepEqual(syncCoverageCopy(false), [], 'run npm run sync-copy');
  const f = coverageFacts();
  assert.ok(f.total > 0 && f.countries.length > 0);
});
