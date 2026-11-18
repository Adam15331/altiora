// @ts-check
// Retired courses: ids that were once course records. Course ids are a
// permanent API, so a retired id can never be a course id again.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { loadConfig, loadCourses, loadCycle, loadRetiredCourses } from '../scripts/lib/requirements-io.mjs';
import { validateRetired } from '../scripts/lib/validate-requirements.mjs';

const require = createRequire(import.meta.url);
const { interviewData } = require('../data/interviews.js');
const config = loadConfig();
const courses = loadCourses();
const retired = loadRetiredCourses();
const cycles = { [config.currentCycle]: loadCycle(config.currentCycle) };
const TODAY = '2026-11-18';
const ctx = { courses, cycles, interviews: interviewData, today: TODAY };
/** @param {any} list @param {Partial<typeof ctx>} [over] */
const errors = (list, over = {}) => validateRetired(list, { ...ctx, ...over }).map(p => `${p.where}: ${p.message}`);

test('the retired list as stored passes, and every entry carries its evidence', () => {
  assert.deepEqual(errors(retired), []);
  assert.ok(retired.length >= 5);
  for (const r of retired) {
    assert.equal(r.reason, 'graduate-entry: not open to school leavers', r.id);
    assert.match(r.evidence.source, /^https:\/\//, r.id);
    assert.ok(r.evidence.sourceSnippet.length > 20, r.id);
  }
});

test('a retired id can never be a course id again', () => {
  const back = [...courses, { ...courses[0], id: retired[0].id }];
  assert.match(errors(retired, { courses: back }).join('\n'), new RegExp(`${retired[0].id}: a retired id is a course id again`));
});

test('a retired id may not keep a requirements record or an interview mapping', () => {
  const id = retired[0].id;
  const cycle = cycles[config.currentCycle];
  const withRow = { ...cycle, courses: { ...cycle.courses, [id]: cycle.courses[courses[0].id] } };
  assert.match(errors(retired, { cycles: { [config.currentCycle]: withRow } }).join('\n'), /still has a requirements record/);
  const withInterview = { ...interviewData, courses: { ...interviewData.courses, [id]: ['x'] } };
  assert.match(errors(retired, { interviews: withInterview }).join('\n'), /still mapped to interview records/);
});

test('entries are checked: duplicates, missing name, unknown reason, missing or future evidence', () => {
  const r = retired[0];
  assert.match(errors([r, r]).join('\n'), /retired twice/);
  assert.match(errors([{ ...r, name: '' }]).join('\n'), /needs "name"/);
  assert.match(errors([{ ...r, reason: 'closed' }]).join('\n'), /reason must be one of/);
  assert.match(errors([{ ...r, evidence: undefined }]).join('\n'), /needs evidence/);
  assert.match(errors([{ ...r, evidence: { ...r.evidence, sourceSnippet: ' ' } }]).join('\n'), /verbatim/);
  assert.match(errors([{ ...r, evidence: { ...r.evidence, accessed: '2099-01-01' } }]).join('\n'), /accessed/);
  assert.match(errors([{ ...r, evidence: { ...r.evidence, source: 'http://example.com' } }]).join('\n'), /https URL/);
  assert.match(errors([{ ...r, extra: 1 }]).join('\n'), /unknown key/);
});
