// @ts-check
// IB HL requirement matching (ib-hl.js): HL Maths AA satisfies a
// Mathematics_Standard HL requirement; Mathematics_Standard never satisfies
// a Mathematics_Advanced (AA-only) one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { ROOT, loadCourses } from '../scripts/lib/requirements-io.mjs';

const require = createRequire(import.meta.url);
const { missingHLTags } = require('../ib-hl.js');

/** The tag the site gives an IB subject (data/qualificationMappings.js). @param {string} name */
function ibTag(name) {
  const ctx = vm.createContext({});
  vm.runInContext(`${fs.readFileSync(path.join(ROOT, 'data/qualificationMappings.js'), 'utf8')}\nglobalThis.m = qualificationMappings;`, ctx);
  return ctx.m.IB.subjects[name];
}

test('HL Maths AA satisfies a Mathematics_Standard HL requirement', () => {
  const aa = ibTag('Mathematics: Analysis and Approaches HL');
  assert.equal(aa, 'Mathematics_Advanced');
  assert.deepEqual(missingHLTags(['Mathematics_Standard'], [aa]), []);
  assert.deepEqual(missingHLTags(['Mathematics_Standard', 'Physics'], [aa, 'Physics']), []);
  assert.deepEqual(missingHLTags(['Mathematics_Standard', 'Physics'], [aa]), ['Physics']);
  for (const c of loadCourses().filter(x => (x.grades?.ibHL ?? []).includes('Mathematics_Standard'))) {
    assert.ok(!missingHLTags(c.grades.ibHL, [aa, 'Physics', 'Chemistry']).includes('Mathematics_Standard'), c.id);
  }
});

test('Mathematics_Standard does not satisfy a Mathematics_Advanced (AA-only) HL requirement', () => {
  assert.deepEqual(missingHLTags(['Mathematics_Advanced'], ['Mathematics_Standard']), ['Mathematics_Advanced']);
  assert.deepEqual(missingHLTags(['Mathematics_Advanced'], []), ['Mathematics_Advanced']);
  assert.deepEqual(missingHLTags(['Mathematics_Advanced'], ['Mathematics_Advanced']), []);
  assert.deepEqual(missingHLTags(['Mathematics_Standard'], ['Physics']), ['Mathematics_Standard']);
});
