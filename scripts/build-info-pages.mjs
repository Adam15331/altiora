#!/usr/bin/env node
// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — build-info-pages.mjs
 *
 * Generates the site-information pages privacy.html, terms.html and
 * accessibility.html from scripts/lib/info-pages.mjs, rewrites the
 * info-links blocks in index.html and app.html (between
 * <!-- info-links:start --> and <!-- info-links:end -->), and regenerates
 * sitemap.xml.
 *
 * Usage:  node scripts/build-info-pages.mjs
 * ═══════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/requirements-io.mjs';
import { appPieces, fileHash, infoLinksHtml, replaceMarkedBlock, writeSitemap } from './lib/site-pages.mjs';
import { INFO_PAGE_CONTENT, infoPageHtml } from './lib/info-pages.mjs';

const env = { pieces: appPieces(), pagesCssV: fileHash('course-pages.css') };
const pages = INFO_PAGE_CONTENT.map(page => [page.file, infoPageHtml(page, env)]);  // build all before writing
for (const [file, html] of pages) fs.writeFileSync(path.join(ROOT, file), html);

replaceMarkedBlock('index.html', 'info-links', infoLinksHtml(''));
// app.html's footer already has its "Report an issue" mailto link.
replaceMarkedBlock('app.html', 'info-links', ` · ${infoLinksHtml('', { email: false })}`);
const urls = writeSitemap();

console.log(`Built ${pages.length} info pages, index.html and app.html footer links, sitemap.xml (${urls} URLs).`);
