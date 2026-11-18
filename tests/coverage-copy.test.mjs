// @ts-check
// The coverage copy in app.html, index.html and llms.txt must state what the
// data holds (fix with `npm run sync-copy`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { syncCoverageCopy, coverageFacts, distinctCourseCount } from '../scripts/lib/coverage-copy.mjs';
import { ROOT, loadConfig, loadCourses, loadCycle } from '../scripts/lib/requirements-io.mjs';

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
    `of the ${f.records} records, ${f.fullyVerified} are fully verified, ${f.withPartial} have at least one partly verified requirement `
    + `and ${f.withUnverified} have at least one requirement not yet checked; a record can be in both of the last two groups `
    + `(counted from the row statuses in data/requirements/${f.cycle}.js)`));
});

test('the landing page states the labelling claim, verbatim, in its link previews', () => {
  const f = coverageFacts();
  const index = read('index.html');
  const claim = `${f.total} courses. Every requirement is labelled verified, partly verified or not yet checked.`;
  assert.equal(index.split(claim).length - 1, 3, 'meta description, og:description and JSON-LD');
});

test('the hero states the current course count and the per-requirement check', () => {
  const f = coverageFacts();
  const hero = /<p class="hero__sub">From &ldquo;no idea what to study&rdquo;[^<]*<\/p>/.exec(read('index.html'))?.[0] ?? '';
  assert.equal(hero, `<p class="hero__sub">From &ldquo;no idea what to study&rdquo; to a finished application plan, across ${f.total} courses. `
    + 'Every requirement shows whether it has been checked against the university&rsquo;s own page.</p>');
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

test('"N courses" counts distinct courses: one course listed under two fields counts once', () => {
  const courses = loadCourses();
  const f = coverageFacts();
  assert.equal(f.records, courses.length);
  assert.equal(f.total, distinctCourseCount(courses));
  // Trinity's BESS is listed under Economics and under Business: two records, one course.
  const bess = courses.filter(c => c.university === 'Trinity College Dublin' && /BESS/.test(c.name));
  assert.equal(bess.length, 2);
  assert.equal(distinctCourseCount(bess), 1);
  assert.equal(f.total, f.records - 1);
  assert.ok(read('llms.txt').includes(`The dataset holds ${f.records} course records for ${f.total} courses: a course listed under two fields has a record under each`));
  // University pages use the same count.
  const trinity = courses.filter(c => c.university === 'Trinity College Dublin');
  assert.match(read('universities/trinity-college-dublin.html'), new RegExp(`Entry requirements for the ${distinctCourseCount(trinity)} courses Altiora holds at Trinity College Dublin`));
  assert.match(read('universities/index.html'), new RegExp(`Trinity College Dublin</a> <span class="cp-muted">· ${distinctCourseCount(trinity)} courses<`));
});

test('the landing browse link and courses/index.html say "N course pages", the number of pages built', () => {
  const pages = fs.readdirSync(path.join(ROOT, 'courses')).filter(f => f.endsWith('.html') && f !== 'index.html').length;
  assert.ok(pages > 0);
  assert.ok(read('index.html').includes(`Browse entry requirements on ${pages} course pages at `));
  const idx = read('courses/index.html');
  assert.ok(idx.includes(`<p class="fo__desc">${pages} course pages at `));
  assert.ok(idx.includes(`content="Entry requirements on ${pages} course pages at `));
  assert.doesNotMatch(idx + read('index.html'), /\d+ courses at \d+ universities/);
});
