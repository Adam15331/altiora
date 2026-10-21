// @ts-check
/* Coverage copy (course count, destination countries, verification counts)
 * in app.html, index.html and llms.txt — derived from the data, never typed.
 * Verification counts come from the row statuses in the current cycle file
 * (data/requirements/<cycle>.js), not from courseRequirements.js.
 * `npm run sync-copy` rewrites the strings; tests/coverage-copy.test.mjs
 * fails if any of them disagrees with the data. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, loadCourses, loadConfig, loadCycle } from './requirements-io.mjs';

const require = createRequire(import.meta.url);
/** @type {typeof import('../../requirements-view.js')} */
const view = require('../../requirements-view.js');

// Display order and names: the country filter's order (main.js COUNTRY_LABELS).
const COUNTRY_NAMES = /** @type {Record<string, string>} */ ({ UK: 'UK', US: 'US', CA: 'Canada', SG: 'Singapore', HK: 'Hong Kong', IE: 'Ireland', ES: 'Spain' });

/**
 * Verification counts from the current cycle's row statuses. A course is
 * fully verified only when none of its rows is partial or unverified
 * (requirements-view.js courseVerificationStatus, which the course cards
 * use too). A course can have both partial and unverified rows.
 */
export function verificationFacts() {
  const config = loadConfig();
  const records = Object.values(loadCycle(config.currentCycle).courses);
  const has = (/** @type {any} */ r, /** @type {string} */ s) => Object.values(r).some(e => e.status === s);
  return {
    cycle: config.currentCycle,
    fullyVerified: records.filter(r => view.courseVerificationStatus(r) === 'verified').length,
    withPartial: records.filter(r => has(r, 'partial')).length,
    withUnverified: records.filter(r => has(r, 'unverified')).length,
  };
}

/** Facts read from data/courseRequirements.js and the current cycle file. */
export function coverageFacts() {
  const courses = loadCourses();
  const present = new Set(courses.map(c => c.country));
  const countries = Object.keys(COUNTRY_NAMES).filter(k => present.has(k)).map(k => COUNTRY_NAMES[k]);
  const unknown = [...present].filter(k => !(k in COUNTRY_NAMES));
  if (unknown.length) throw new Error(`coverage-copy: no display name for country code(s) ${unknown.join(', ')}`);
  const v = verificationFacts();
  return { total: courses.length, countries, ...v };
}

const LABELLED = 'Every requirement is labelled verified, partly verified or not yet checked.';

/** "A, B and C" / "A, B &amp; C". @param {string[]} xs @param {string} and */
const list = (xs, and) => xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${and} ${xs.at(-1)}`;

/** Each managed string: file, a pattern that finds it whatever its current numbers/countries, and its text from the data. */
export function managedStrings(f = coverageFacts()) {
  return [
    { file: 'app.html', re: /Covers [^·]*? &middot; \d+ courses/, text: `Covers ${list(f.countries, '&amp;')} &middot; ${f.total} courses` },
    { file: 'index.html', re: /\d+ courses\. Every requirement is labelled verified, partly verified or not yet checked\./g, text: `${f.total} courses. ${LABELLED}` },
    { file: 'index.html', re: /<p class="small">\d+ courses</, text: `<p class="small">${f.total} courses<` },
    { file: 'llms.txt', re: /- Universities in the [^\n]*\./, text: `- Universities in the ${list(f.countries, 'and')}.` },
    { file: 'llms.txt', re: /The dataset holds \d+ course records/, text: `The dataset holds ${f.total} course records` },
    { file: 'llms.txt', re: /of the \d+ records, \d+ are fully verified, [^\n]*?\(counted from the row statuses in data\/requirements\/\d+\.js\)/, text: `of the ${f.total} records, ${f.fullyVerified} are fully verified, ${f.withPartial} have at least one partly verified requirement and ${f.withUnverified} have at least one requirement not yet checked; a record can be in both of the last two groups (counted from the row statuses in data/requirements/${f.cycle}.js)` },
  ];
}

/** Rewrite (write=true) or check every managed string. Returns the strings that differ. */
export function syncCoverageCopy(write = false) {
  const stale = [];
  for (const m of managedStrings()) {
    const p = path.join(ROOT, m.file);
    const src = fs.readFileSync(p, 'utf8');
    const found = src.match(m.re);
    if (!found) throw new Error(`coverage-copy: pattern not found in ${m.file}: ${m.re}`);
    if (found.some(x => x !== m.text)) {
      stale.push({ file: m.file, was: found[0], now: m.text });
      if (write) fs.writeFileSync(p, src.replace(m.re, m.text));
    }
  }
  return stale;
}
