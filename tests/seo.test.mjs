// @ts-check
// Search and link-preview basics: the shared preview image on every page, sitemap dates, the fields/ and
// universities/ index pages, and the 404 page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadConfig, loadCycle } from '../scripts/lib/requirements-io.mjs';
import { SITE, SOCIAL_IMAGE, sitemapUrls } from '../scripts/lib/site-pages.mjs';
import { sitemapLastmod } from '../scripts/lib/sitemap.mjs';

const read = (/** @type {string} */ f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const htmlIn = (/** @type {string} */ dir) => fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.html')).map(f => dir ? `${dir}/${f}` : f);
const PAGES = [...htmlIn(''), ...htmlIn('courses'), ...htmlIn('universities'), ...htmlIn('fields')];
const meta = (/** @type {string} */ html, /** @type {string} */ key) =>
  html.match(new RegExp(`<meta (?:property|name)="${key.replace(/[:.]/g, '\\$&')}" content="([^"]*)"`))?.[1] ?? null;

test('og-image.png is a 1200×630 PNG', () => {
  const png = fs.readFileSync(path.join(ROOT, 'og-image.png'));
  assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG');
  assert.equal(png.readUInt32BE(16), SOCIAL_IMAGE.width);
  assert.equal(png.readUInt32BE(20), SOCIAL_IMAGE.height);
  assert.deepEqual([SOCIAL_IMAGE.width, SOCIAL_IMAGE.height], [1200, 630]);
});

test('every page carries the shared preview image and the large-picture card', () => {
  assert.ok(PAGES.length >= 418, `only ${PAGES.length} pages`);
  for (const f of PAGES) {
    const html = read(f);
    assert.equal(meta(html, 'og:image'), SOCIAL_IMAGE.url, f);
    assert.equal(meta(html, 'og:image:width'), '1200', f);
    assert.equal(meta(html, 'og:image:height'), '630', f);
    assert.equal(meta(html, 'og:image:alt'), SOCIAL_IMAGE.alt, f);
    assert.equal(meta(html, 'og:site_name'), 'Altiora', f);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image', f);
    assert.equal((html.match(/name="twitter:card"/g) ?? []).length, 1, f);
  }
});

test('the app page has a descriptive title', () => {
  const html = read('app.html');
  assert.match(html, /<title>Altiora · Check your subjects against real courses<\/title>/);
  assert.equal(meta(html, 'og:title'), 'Altiora · Check your subjects against real courses');
});

test('sitemap: <lastmod> only where the page shows a date, and it is that date', () => {
  const xml = read('sitemap.xml');
  const entries = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/g)].map(m => [m[1], m[2] ?? null]);
  assert.deepEqual(entries.map(e => e[0]), sitemapUrls());
  const expected = sitemapLastmod();
  const today = new Date().toISOString().slice(0, 10);
  for (const [url, d] of entries) {
    assert.equal(d, expected.get(url) ?? null, url);
    if (d) assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(d) && d <= today, `${url} ${d}`);
  }
  // No date on the pages that show none.
  for (const url of [`${SITE}/`, `${SITE}/app.html`, `${SITE}/fields/`, `${SITE}/fields/medicine.html`]) assert.ok(!expected.has(url), url);
  // A course page's date is the latest date any of its requirements was checked.
  const record = loadCycle(loadConfig().currentCycle).courses['uk-maths-bath'];
  const latest = Object.values(record).map((/** @type {any} */ e) => e.lastVerified).filter(Boolean).sort().at(-1);
  assert.equal(expected.get(`${SITE}/courses/uk-maths-bath.html`), latest);
  assert.equal(expected.get(`${SITE}/privacy.html`), read('privacy.html').match(/<time datetime="([^"]+)"/)?.[1]);
  assert.equal(expected.get(`${SITE}/accessibility.html`), read('accessibility.html').match(/<time datetime="([^"]+)"/)?.[1]);
  // A university's date is the latest across its courses, so never earlier than any course page it links to.
  const bath = read('universities/university-of-bath.html');
  const bathDate = expected.get(`${SITE}/universities/university-of-bath.html`) ?? '';
  assert.ok(bathDate);
  for (const m of bath.matchAll(/href="\.\.\/courses\/([a-z0-9-]+)\.html"/g)) {
    assert.ok(bathDate >= (expected.get(`${SITE}/courses/${m[1]}.html`) ?? '9999'), m[1]);
  }
  assert.ok(!xml.includes('404.html'));
});

test('fields/ and universities/ have index pages that link to every page in the directory', () => {
  for (const dir of ['fields', 'universities']) {
    const index = read(`${dir}/index.html`);
    assert.match(index, new RegExp(`<link rel="canonical" href="${SITE}/${dir}/" />`), dir);
    const linked = new Set([...index.matchAll(/<li><a href="([a-z0-9-]+\.html)">/g)].map(m => m[1]));
    const pages = htmlIn(dir).map(f => f.slice(dir.length + 1)).filter(f => f !== 'index.html');
    assert.deepEqual([...linked].sort(), pages.sort(), dir);
    assert.equal((index.match(/<h1[\s>]/g) ?? []).length, 1, dir);
  }
  assert.match(read('courses/index.html'), /<a href="\.\.\/universities\/">Browse by university<\/a>/);
});

test('404.html: kept out of search, no canonical, every link and asset root-absolute', () => {
  const html = read('404.html');
  assert.match(html, /<meta name="robots" content="noindex" \/>/);
  assert.doesNotMatch(html, /rel="canonical"|og:url/);
  assert.match(html, /<h1 class="fo__title">This page doesn’t exist<\/h1>/);
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  assert.ok(refs.length > 10);
  for (const r of refs) assert.ok(/^(\/|https:\/\/|mailto:)/.test(r), r);
  for (const target of ['/courses/', '/universities/', '/fields/', '/app.html', '/']) assert.ok(refs.includes(target), target);
});
