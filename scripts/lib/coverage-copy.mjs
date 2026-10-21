// @ts-check
/* Coverage copy (course count, destination countries, partial-record count)
 * in app.html, index.html and llms.txt — derived from the data, never typed.
 * `npm run sync-copy` rewrites the strings; tests/coverage-copy.test.mjs
 * fails if any of them disagrees with the data. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadCourses } from './requirements-io.mjs';

// Display order and names: the country filter's order (main.js COUNTRY_LABELS).
const COUNTRY_NAMES = /** @type {Record<string, string>} */ ({ UK: 'UK', US: 'US', CA: 'Canada', SG: 'Singapore', HK: 'Hong Kong', IE: 'Ireland', ES: 'Spain' });

/** Facts read from data/courseRequirements.js. */
export function coverageFacts() {
  const courses = loadCourses();
  const present = new Set(courses.map(c => c.country));
  const countries = Object.keys(COUNTRY_NAMES).filter(k => present.has(k)).map(k => COUNTRY_NAMES[k]);
  const unknown = [...present].filter(k => !(k in COUNTRY_NAMES));
  if (unknown.length) throw new Error(`coverage-copy: no display name for country code(s) ${unknown.join(', ')}`);
  return { total: courses.length, countries, partial: courses.filter(c => c.verification?.status === 'partial').length };
}

/** "A, B and C" / "A, B &amp; C". @param {string[]} xs @param {string} and */
const list = (xs, and) => xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${and} ${xs.at(-1)}`;

/** Each managed string: file, a pattern that finds it whatever its current numbers/countries, and its text from the data. */
export function managedStrings(f = coverageFacts()) {
  return [
    { file: 'app.html', re: /Covers [^·]*? &middot; \d+ courses/, text: `Covers ${list(f.countries, '&amp;')} &middot; ${f.total} courses` },
    { file: 'index.html', re: /\d+ verified courses across 5 qualification systems/g, text: `${f.total} verified courses across 5 qualification systems` },
    { file: 'index.html', re: /Built on \d+ verified courses across the [^.]*\./, text: `Built on ${f.total} verified courses across the ${list(f.countries, 'and')}.` },
    { file: 'index.html', re: /<p class="small">\d+ courses</, text: `<p class="small">${f.total} courses<` },
    { file: 'llms.txt', re: /- Universities in the [^\n]*\./, text: `- Universities in the ${list(f.countries, 'and')}.` },
    { file: 'llms.txt', re: /The dataset holds \d+ course records/, text: `The dataset holds ${f.total} course records` },
    { file: 'llms.txt', re: /\d+ of the \d+ records carry a partial verification status/, text: `${f.partial} of the ${f.total} records carry a partial verification status` },
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
