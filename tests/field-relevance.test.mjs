// @ts-check
// Field relevance for Law. Altiora's list of "core" Law subjects is its own expectation, not something
// the universities' pages state, so it may hold a Law course back from a strong match but never call it
// "not a match", and the line on the card asks the student to check instead of asserting what Law expects.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, loadConfig, loadCourses, loadCycle } from '../scripts/lib/requirements-io.mjs';

const read = (/** @type {string} */ f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const tracked = (/** @type {string[]} */ ...globs) => execFileSync('git', ['ls-files', '-co', '--exclude-standard', ...globs], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(f => f && fs.existsSync(path.join(ROOT, f)));

test('"expect strong humanities" appears nowhere in user-facing copy', () => {
  // Every page, every script and data file the site serves, and the generators that write the pages.
  const files = tracked('*.html', '*.js', '*.css', '*.webmanifest', 'scripts/lib/*.mjs', 'scripts/build-*.mjs').filter(f => !/^(tests|node_modules|research|docs)\//.test(f));
  assert.ok(files.length > 440, `only ${files.length} files`);
  assert.ok(files.includes('main.js') && files.includes('app.html') && files.includes('courses/uk-law-warwick.html'));
  for (const f of files) {
    const text = read(f);
    assert.doesNotMatch(text, /expect strong humanities/i, f);
    assert.doesNotMatch(text, /Law-track courses expect/i, f);
  }
});

test('Law: the card line asks the student to check, and the guard can never give red', () => {
  const main = read('main.js');
  const reasons = /const FIELD_CORE_REASON = \{([\s\S]*?)\n\};/.exec(main)?.[1] ?? '';
  assert.match(reasons, /\n {2}law: {10}'Check whether this course prefers particular subjects\.',\n/);
  // No other line in the table makes a claim about Law or the humanities.
  assert.equal((reasons.match(/\blaw\b/gi) ?? []).length, 1);
  assert.doesNotMatch(reasons, /humanit/i);
  // The guard: red only when the field is not advisory-only, and Law is advisory-only.
  assert.match(main, /const FIELD_CORE_ADVISORY_ONLY = new Set\(\['law'\]\);/);
  assert.match(main, /status: fr\.satisfied === 0 && !FIELD_CORE_ADVISORY_ONLY\.has\(course\.category\) \? 'red' : 'amber',/);
  assert.equal((main.match(/fr\.satisfied === 0/g) ?? []).length, 1);   // the one place the guard can say red
});

test('Trinity Law: the subject row is unverified (its source is silent), with the reason on file', () => {
  const row = loadCycle(loadConfig().currentCycle).courses['ie-law-trinity'].subjectPrerequisites;
  assert.equal(row.status, 'unverified');
  for (const k of ['none', 'items', 'codes', 'sources', 'lastVerified', 'sourceSnippet']) assert.ok(!(k in row), `unverified row still carries ${k}`);
  assert.match(row.reviewFlag ?? '', /^The source is silent on required subjects\./);
  assert.match(row.note ?? '', /^Not verified: /);
  const course = loadCourses().find(c => c.id === 'ie-law-trinity');
  assert.ok(course && !course.noSubjectRequirements);
});

test('Glasgow Law: no "no subjects required" flag; the note gives the requirement in the source\'s own words', () => {
  const course = loadCourses().find(c => c.id === 'uk-law-glasgow');
  assert.ok(course && !course.noSubjectRequirements);
  const row = loadCycle(loadConfig().currentCycle).courses['uk-law-glasgow'].subjectPrerequisites;
  const snippets = [row.sourceSnippet].flat().join(' ');
  const quoted = [...(row.note ?? '').matchAll(/“([^”]+)”/g)].map(m => m[1]);
  assert.deepEqual(quoted, ['Additional Requirement: A-level Humanities at A', 'Additional Requirement: GCSE English at B', 'Arts, Humanity or Modern Language (All considered Humanities subjects)']);
  for (const q of quoted) assert.ok(snippets.includes(q), `not in the source snippet: ${q}`);
});
