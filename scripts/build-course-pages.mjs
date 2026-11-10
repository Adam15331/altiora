#!/usr/bin/env node
// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — build-course-pages.mjs
 *
 * Generates the static, crawlable entry-requirements pages:
 *   courses/<course id>.html, courses/index.html, universities/<slug>.html
 * from data/courseRequirements.js and the current cycle file in
 * data/requirements/, then regenerates sitemap.xml and the course-links
 * block in index.html (between <!-- course-links:start --> and
 * <!-- course-links:end -->).
 *
 * The pages state nothing of their own: each embeds the app's Entry
 * requirements panel (requirements-view.js). See scripts/lib/course-pages.mjs.
 *
 * Everything is built in memory first; nothing is written if any page fails.
 *
 * Usage:  node scripts/build-course-pages.mjs
 * ═══════════════════════════════════════════════════════════════ */
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT, loadConfig, loadCourses, loadCycle } from './lib/requirements-io.mjs';
import { appPieces, fileHash, writePages, writeSitemap, replaceMarkedBlock } from './lib/site-pages.mjs';
import { buildModel, buildAll } from './lib/course-pages.mjs';

const require = createRequire(import.meta.url);
const { fieldProfiles } = require(path.join(ROOT, 'data/fieldProfiles.js'));
const { universityProfiles } = require(path.join(ROOT, 'data/university-profiles.js'));

const config = loadConfig();
const model = buildModel({ courses: loadCourses(), cycle: loadCycle(config.currentCycle), config, fieldProfiles, universityProfiles });
const pages = buildAll(model, { pieces: appPieces(), pagesCssV: fileHash('course-pages.css') });

writePages('courses', pages.courses);
writePages('universities', pages.universities);
replaceMarkedBlock('index.html', 'course-links',
  `<p class="step__desc"><a class="step__link" href="courses/">Browse entry requirements for ${model.paged.length} courses at ${model.pagedUniversities.length} universities</a>.</p>`);
const urls = writeSitemap();

console.log(`Built ${pages.courses.size - 1} course pages, courses/index.html, ${pages.universities.size} university pages, sitemap.xml (${urls} URLs), index.html course links.`);
