#!/usr/bin/env node
// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — build-info-pages.mjs
 *
 * Generates the site-information pages privacy.html, terms.html and
 * accessibility.html from scripts/lib/info-pages.mjs, and 404.html (the page
 * GitHub Pages serves for any address that does not exist), rewrites the
 * info-links blocks in index.html and app.html (between
 * <!-- info-links:start --> and <!-- info-links:end -->), and regenerates
 * sitemap.xml.
 *
 * Usage:  node scripts/build-info-pages.mjs
 * ═══════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/requirements-io.mjs';
import { appPieces, fileHash, infoLinksHtml, pageShell, replaceMarkedBlock } from './lib/site-pages.mjs';
import { writeSitemap } from './lib/sitemap.mjs';
import { INFO_PAGE_CONTENT, infoPageHtml } from './lib/info-pages.mjs';

const env = { pieces: appPieces(), pagesCssV: fileHash('course-pages.css') };
const pages = INFO_PAGE_CONTENT.map(page => [page.file, infoPageHtml(page, env)]);  // build all before writing
// 404.html is served at whatever address was missing, at any depth, so every link and asset is root-absolute
// ('/'). It has no address of its own (no canonical) and stays out of search results and the sitemap.
pages.push(['404.html', pageShell({
  ...env, base: '/', url: null, noindex: true,
  generator: 'scripts/build-info-pages.mjs', source: 'scripts/build-info-pages.mjs',
  title: 'Page not found · Altiora',
  description: 'This page does not exist. Find entry requirements by course or university, read the field guides, or open the app.',
  body: `      <header class="fo__header">
        <span class="fo__eyebrow">Page not found</span>
        <h1 class="fo__title">This page doesn’t exist</h1>
        <p class="fo__desc">The link may be mistyped, or the page may have moved. One of these will get you where you were going:</p>
      </header>
      <section class="fo-section">
        <ul class="cp-links">
          <li><a href="/courses/">Entry requirements by course</a></li>
          <li><a href="/universities/">Entry requirements by university</a></li>
          <li><a href="/fields/">Field guides</a></li>
        </ul>
      </section>
      <section class="fo-section">
        <a class="fo-btn fo-btn--primary" href="/app.html">Open the app →</a>
      </section>
      <p><a class="fo-back" href="/">← Back to Altiora</a></p>`,
})]);
for (const [file, html] of pages) fs.writeFileSync(path.join(ROOT, file), html);

replaceMarkedBlock('index.html', 'info-links', infoLinksHtml(''));
// app.html's footer already has its "Report an issue" mailto link.
replaceMarkedBlock('app.html', 'info-links', ` · ${infoLinksHtml('', { email: false })}`);
const urls = writeSitemap();

console.log(`Built ${pages.length - 1} info pages, 404.html, index.html and app.html footer links, sitemap.xml (${urls} URLs).`);
