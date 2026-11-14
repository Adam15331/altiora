// @ts-check
// The site-information pages (scripts/lib/info-pages.mjs) and the footer
// that links to them. The privacy policy makes factual claims about the
// code; the checks below fail if the code stops matching them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../scripts/lib/requirements-io.mjs';
import { appPieces, infoLinksHtml, INFO_PAGES, SUPPORT_EMAIL, sitemapUrls, SITE } from '../scripts/lib/site-pages.mjs';
import { INFO_PAGE_CONTENT, infoPageHtml, OPERATOR, LOCATION, LAST_UPDATED } from '../scripts/lib/info-pages.mjs';

const read = (/** @type {string} */ f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const env = { pieces: appPieces(), pagesCssV: 'test' };
const built = Object.fromEntries(INFO_PAGE_CONTENT.map(p => [p.file, infoPageHtml(p, env)]));
// Site code that runs in the browser (data files hold no behaviour).
const SITE_CODE = ['main.js', 'state.js', 'requirements-view.js', 'statement-review.js', 'ib-hl.js', 'app.html', 'index.html'];

test('the committed info pages are up to date with their source', () => {
  for (const p of INFO_PAGE_CONTENT) {
    const onDisk = read(p.file).replace(/course-pages\.css\?v=[0-9a-f]+/, 'course-pages.css?v=test');
    assert.equal(onDisk, built[p.file], `${p.file} is stale — run node scripts/build-info-pages.mjs`);
  }
});

test('each info page names the operator, the contact and the date', () => {
  for (const p of INFO_PAGE_CONTENT.filter(x => x.file !== 'accessibility.html')) {
    assert.match(built[p.file], new RegExp(`${OPERATOR}, in ${LOCATION}`), p.file);
  }
  for (const html of Object.values(built)) {
    assert.match(html, new RegExp(`mailto:${SUPPORT_EMAIL}`));
    assert.match(html, new RegExp(`<time datetime="${LAST_UPDATED.iso}">`));
    assert.doesNotMatch(html.replace(/<[^>]+>/g, ' '), /tel:|\+\d{1,3}[\s-]?\d{2,}|\(\d{2,4}\)\s?\d{3}/, 'no phone number');
  }
});

test('privacy facts: no cookies are set anywhere in the site code', () => {
  for (const f of SITE_CODE) assert.doesNotMatch(read(f), /document\.cookie\s*=|cookieStore/, f);
});

test('privacy facts: the site code sends nothing off the device itself', () => {
  for (const f of SITE_CODE) {
    assert.doesNotMatch(read(f), /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|<form[^>]*action=/, f);
  }
});

test('privacy facts: the storage keys the policy names are the only ones', () => {
  const state = read('state.js');
  assert.match(state, /const STORAGE_KEY = 'altiora_state_v1';/);
  assert.match(state, /const OWNED_KEYS = \[STORAGE_KEY\];/);
  assert.match(built['privacy.html'], /altiora_state_v1/);
  const sessionKeys = new Set();
  for (const f of SITE_CODE) for (const m of read(f).matchAll(/sessionStorage\.setItem\('([^']+)'/g)) sessionKeys.add(m[1]);
  assert.deepEqual([...sessionKeys], ['openStrengthsMode']);
  for (const f of SITE_CODE) assert.doesNotMatch(read(f), /indexedDB|caches\.open|serviceWorker\.register/, f);
});

test('privacy facts: the only third-party hosts loaded are Google Fonts and Cloudflare', () => {
  const pages = ['index.html', 'app.html', 'privacy.html', 'fields/medicine.html', 'courses/uk-medicine-oxford.html'];
  for (const f of pages) {
    const hosts = new Set([...read(f).matchAll(/<(?:script|link)[^>]+(?:src|href)=["']https:\/\/([^/"']+)/g)].map(m => m[1]));
    hosts.delete('usealtiora.com');  // canonical / og:url
    for (const h of hosts) assert.ok(['fonts.googleapis.com', 'fonts.gstatic.com', 'static.cloudflareinsights.com'].includes(h), `${f} loads ${h}`);
  }
});

test('every page type links to the three info pages in its footer', () => {
  const pages = { 'index.html': '', 'app.html': '', 'privacy.html': '', 'fields/medicine.html': '../', 'courses/uk-medicine-oxford.html': '../', 'courses/index.html': '../', 'universities/university-of-oxford.html': '../' };
  for (const [f, base] of Object.entries(pages)) {
    const footer = /<footer[^>]*>([\s\S]*?)<\/footer>\s*(?:<!--[\s\S]*?-->\s*)?(?:<div id="toast"|<script|<\/body>)/.exec(read(f))?.[1] ?? '';
    for (const p of INFO_PAGES) assert.ok(footer.includes(`href="${base}${p.file}"`), `${f} footer links ${p.file}`);
  }
  assert.ok(read('index.html').includes(infoLinksHtml('')));
});

test('the sitemap lists the info pages', () => {
  const xml = read('sitemap.xml');
  for (const p of INFO_PAGES) assert.ok(xml.includes(`<loc>${SITE}/${p.file}</loc>`), p.file);
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]), sitemapUrls());
});
