// @ts-check
// The generated course / university pages (scripts/lib/course-pages.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { loadConfig, loadCourses, loadCycle } from '../scripts/lib/requirements-io.mjs';
import { appPieces, INFO_PAGES } from '../scripts/lib/site-pages.mjs';
import { buildModel, buildAll, hasPage, universitySlug, courseDescription, coursePage } from '../scripts/lib/course-pages.mjs';

const require = createRequire(import.meta.url);
const view = require('../requirements-view.js');
const { fieldProfiles } = require('../data/fieldProfiles.js');

const config = loadConfig();
const data = { courses: loadCourses(), cycle: loadCycle(config.currentCycle), config, fieldProfiles };
const env = { pieces: appPieces(), pagesCssV: 'test' };
const model = buildModel(data);
const pages = buildAll(model, env);

test('universitySlug is a safe file name', () => {
  assert.equal(universitySlug("King's College London"), 'kings-college-london');
  assert.equal(universitySlug('Université de Montréal'), 'universite-de-montreal');
});

test('a course gets a page only when a requirement has been checked', () => {
  assert.equal(hasPage({ a: { status: 'unverified' }, b: { status: 'unverified' } }), false);
  assert.equal(hasPage({ a: { status: 'unverified' }, b: { status: 'partial' } }), true);
  assert.equal(hasPage(null), false);
  for (const c of data.courses) {
    assert.equal(pages.courses.has(`${c.id}.html`), model.pageOf(c) === c, c.id);
    if (model.primary(c) === c) assert.equal(model.pageOf(c) === c, hasPage(data.cycle.courses[c.id]), c.id);
  }
});

test('every course page embeds exactly the panel the app renders', () => {
  for (const c of model.paged) {
    const html = /** @type {string} */ (pages.courses.get(`${c.id}.html`));
    const panel = view.panelHtml({
      record: data.cycle.courses[c.id], categories: config.categories, cycleLabel: model.cycleLabel,
      fallbackUrl: /^https?:\/\//i.test(c.verification?.source ?? '') && (c.verification?.sourceStatus ?? 'ok') === 'ok' ? c.verification.source : null,
    }).replace('<details class="reqs">', '<details class="reqs" open>');
    assert.ok(html.includes(panel), c.id);
  }
});

test('the meta description quotes a grade only from a fully verified row', () => {
  const course = { id: 'x-test', name: 'Testing BSc', university: 'Test University', country: 'UK', category: Object.keys(fieldProfiles)[0] };
  const unverified = Object.fromEntries(config.categories.map(c => [c.id, { status: 'unverified' }]));
  /** @param {any} rows */
  const describe = rows => {
    const m = buildModel({ ...data, courses: [course], cycle: { courses: { 'x-test': { ...unverified, ...rows } } } });
    return courseDescription(m, course);
  };
  const src = { sources: [{ url: 'https://example.ac.uk', label: 'Official source' }], lastVerified: '2026-10-19' };
  assert.match(describe({ aLevel: { status: 'verified', accepted: 'yes', typicalOffer: 'A*AA', ...src } }), /A-Level A\*AA/);
  assert.doesNotMatch(describe({ aLevel: { status: 'partial', accepted: 'yes', typicalOffer: 'A*AA', note: 'n', ...src } }), /A\*AA/);
  assert.match(describe({ ib: { status: 'verified', accepted: 'yes', overallScore: 39, ...src } }), /IB 39 points/);
});

test('unsourced free text is never rendered', () => {
  const course = { id: 'x-test', name: 'Testing BSc', university: 'Test University', country: 'UK', category: Object.keys(fieldProfiles)[0],
    notes: 'ZZ-COURSE-NOTE', universityContext: { notes: 'ZZ-UNI-NOTE' }, verification: { source: 'https://example.ac.uk/c', notes: 'ZZ-VERIFICATION-NOTE' } };
  const rec = Object.fromEntries(config.categories.map(c => [c.id, { status: 'unverified' }]));
  rec.satAct = /** @type {any} */ ({ status: 'verified', none: true, sources: [{ url: 'https://example.ac.uk', label: 'Official source' }], lastVerified: '2026-10-19' });
  const m = buildModel({ ...data, courses: [course], cycle: { courses: { 'x-test': rec } } });
  assert.doesNotMatch(coursePage(m, course, env), /ZZ-/);
});

test('titles and canonical URLs are unique, and every internal link resolves', () => {
  const titles = new Set(), files = new Set();
  for (const [dir, map] of Object.entries(pages)) for (const f of map.keys()) files.add(`${dir}/${f}`);
  for (const f of Object.keys(fieldProfiles)) files.add(`fields/${f}.html`);
  for (const { file } of INFO_PAGES) files.add(file);
  for (const [dir, map] of Object.entries(pages)) {
    for (const [file, html] of map) {
      const title = /<title>(.*?)<\/title>/.exec(html)?.[1];
      assert.ok(title && !titles.has(title), `duplicate or missing title: ${dir}/${file}`);
      titles.add(title);
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
      assert.equal(canonical, `https://usealtiora.com/${dir}/${file === 'index.html' ? '' : file}`);
      for (const [, href] of html.matchAll(/<a [^>]*href="(\.\.?\/[^"#?]*)/g)) {
        const target = new URL(href, `https://x/${dir}/${file}`).pathname.slice(1);
        if (target === '' || target === 'app.html') continue;
        assert.ok(files.has(target.endsWith('/') ? `${target}index.html` : target), `${dir}/${file} links to missing ${href}`);
      }
    }
  }
});
