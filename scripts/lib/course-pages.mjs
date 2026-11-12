// @ts-check
/* Static, crawlable entry-requirements pages:
 *   courses/<course id>.html      one per course with at least one checked requirement
 *   courses/index.html            every course, by country and university
 *   universities/<slug>.html      one per university, its courses side by side
 *
 * Nothing here states a requirement. The course page embeds the same
 * "Entry requirements" panel the app shows, rendered by requirements-view.js
 * from the current cycle file, so a page says exactly what a course card
 * says: each value with its verification status, date and official source.
 * A course whose requirements are all unverified gets no page — it would
 * only say "not verified" — and is listed, unlinked, on its university page.
 * A course listed under two fields gets one page, not two copies.
 *
 * Free-text fields the engine holds without a per-statement source
 * (course.notes, universityContext.notes, university profile prose) are
 * deliberately not rendered.
 *
 * Pure: data in, HTML out. scripts/build-course-pages.mjs does the I/O. */
import { createRequire } from 'node:module';
import { SITE, esc, pageShell } from './site-pages.mjs';

const require = createRequire(import.meta.url);
/** @type {typeof import('../../requirements-view.js')} */
const view = require('../../requirements-view.js');

const GENERATOR = 'scripts/build-course-pages.mjs';
const SOURCE = 'data/courseRequirements.js and the current cycle file in data/requirements/';

// Display order and names: the app's country filter (main.js COUNTRY_LABELS).
export const COUNTRY_NAMES = /** @type {Record<string, string>} */ ({ UK: 'UK', US: 'US', CA: 'Canada', SG: 'Singapore', HK: 'Hong Kong', IE: 'Ireland', ES: 'Spain' });

/** "King's College London" → "kings-college-london". @param {string} name */
export function universitySlug(name) {
  return name.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** A course gets a page when at least one requirement has been checked. @param {Record<string, any> | null | undefined} record */
export function hasPage(record) {
  return !!record && Object.values(record).some(e => e?.status && e.status !== 'unverified');
}

/** Same rule as the app's courseOfficialUrl(): only a live http(s) source. @param {any} course */
export function officialUrl(course) {
  const src = course.verification?.source;
  const ok = (course.verification?.sourceStatus ?? 'ok') === 'ok';
  return (typeof src === 'string' && /^https?:\/\//i.test(src) && ok) ? src : null;
}

/** Grades / points held on a qualification row, or null. @param {any} entry */
function scoreOf(entry) {
  if (!entry || entry.status === 'unverified' || entry.status === 'notApplicable') return null;
  if (entry.typicalOffer) return String(entry.typicalOffer);
  if (entry.overallScore != null) return `${entry.overallScore} points`;
  return null;
}

/** A qualification row as a table cell: the value and its status, never a bare value. @param {any} entry */
function scoreCell(entry) {
  if (!entry || entry.status === 'unverified') return `<span class="cp-muted">${esc(view.STATUS_LABEL.unverified)}</span>`;
  if (entry.status === 'notApplicable') return `<span class="cp-muted">${esc(view.NOT_APPLICABLE_TEXT)}</span>`;
  const score = scoreOf(entry);
  const withheld = (entry.withheld ?? []).some((/** @type {string} */ w) => w === 'typicalOffer' || w === 'overallScore');
  const value = score ? esc(score) : `<span class="cp-muted">${esc(withheld ? view.WITHHELD_TEXT : view.NOT_RECORDED_TEXT)}</span>`;
  return `${value} <span class="reqs__badge reqs__badge--${esc(entry.status)}">${esc(view.STATUS_LABEL[/** @type {'verified'|'partial'} */ (entry.status)] ?? entry.status)}</span>`;
}

/** "5 of 8 verified" — the panel's own tally. @param {any} record @param {any[]} categories */
function tally(record, categories) {
  const verified = categories.filter(cat => record?.[cat.id]?.status === 'verified').length;
  const applicable = categories.filter(cat => record?.[cat.id]?.status !== 'notApplicable').length;
  return `${verified} of ${applicable} verified`;
}

/**
 * Everything the pages are built from, grouped and validated.
 * @param {object} d
 * @param {any[]} d.courses
 * @param {{courses: Record<string, any>}} d.cycle
 * @param {import('../../data/requirements/config.js').RequirementsConfig} d.config
 * @param {Record<string, {name: string}>} d.fieldProfiles
 * @param {Record<string, any>} [d.universityProfiles]
 */
export function buildModel({ courses, cycle, config, fieldProfiles, universityProfiles = {} }) {
  const cycleInfo = config.cycles[config.currentCycle];
  const cycleLabel = cycleInfo?.label ?? `${config.currentCycle} entry`;
  /** @type {Map<string, {name: string, slug: string, country: string, courses: any[], websiteUrl: string | null}>} */
  const universities = new Map();
  const slugs = new Map();
  const ids = new Set();
  for (const course of courses) {
    if (!/^[a-z0-9-]+$/.test(course.id)) throw new Error(`Course id "${course.id}" is not safe as a file name.`);
    if (ids.has(course.id)) throw new Error(`Duplicate course id "${course.id}".`);
    ids.add(course.id);
    if (!cycle.courses[course.id]) throw new Error(`No ${config.currentCycle} requirements record for "${course.id}".`);
    if (!fieldProfiles[course.category]) throw new Error(`Course "${course.id}" has unknown field "${course.category}".`);
    let uni = universities.get(course.university);
    if (!uni) {
      const slug = universitySlug(course.university);
      if (!slug) throw new Error(`University "${course.university}" has no usable slug.`);
      if (slugs.has(slug)) throw new Error(`Universities "${slugs.get(slug)}" and "${course.university}" share the slug "${slug}".`);
      slugs.set(slug, course.university);
      const site = universityProfiles[course.university]?.websiteUrl;
      uni = { name: course.university, slug, country: course.country, courses: [], websiteUrl: typeof site === 'string' && /^https:\/\//i.test(site) ? site : null };
      universities.set(course.university, uni);
    }
    uni.courses.push(course);
  }
  const record = (/** @type {any} */ course) => cycle.courses[course.id];
  // One course can be listed under two fields (two ids, same university,
  // name and degree). It gets one page, under the first id.
  /** @type {Map<string, any>} */
  const firstListing = new Map();
  for (const c of courses) {
    const key = JSON.stringify([c.university, c.name, c.degreeLevel ?? '']);
    if (!firstListing.has(key)) firstListing.set(key, c);
  }
  const primary = (/** @type {any} */ course) => firstListing.get(JSON.stringify([course.university, course.name, course.degreeLevel ?? '']));
  /** The course whose page shows this course, or null when there is none. */
  const pageOf = (/** @type {any} */ course) => (hasPage(record(primary(course))) ? primary(course) : null);
  const paged = courses.filter(c => pageOf(c) === c);
  // A university page needs at least one course page to link to.
  const pagedUniversities = [...universities.values()].filter(u => u.courses.some(c => pageOf(c)));
  return {
    courses, paged, record, primary, pageOf, config, cycleLabel,
    applicationPeriod: cycleInfo?.applicationPeriod ?? null,
    fieldProfiles, universities, pagedUniversities,
  };
}
/** @typedef {ReturnType<typeof buildModel>} Model */

/** Two courses at one university can share a name; the degree tells them apart. @param {Model} model @param {any} course */
function displayName(model, course) {
  const clash = model.universities.get(course.university)?.courses.some(c => c.name === course.name && model.primary(c) !== model.primary(course));
  return clash && course.degreeLevel ? `${course.name} (${course.degreeLevel})` : course.name;
}

/** @param {Model} model @param {any} course */
export function courseTitle(model, course) {
  return `${displayName(model, course)} at ${course.university}: entry requirements, ${model.cycleLabel} · Altiora`;
}

/**
 * Meta description. Quotes a grade only from a fully verified row — a search
 * snippet cannot carry a "partly verified" caveat the way the page does.
 * @param {Model} model @param {any} course
 */
export function courseDescription(model, course) {
  const rec = model.record(course);
  const bits = [];
  for (const cat of model.config.categories.filter(c => c.kind === 'qualification')) {
    const entry = rec[cat.id];
    const score = entry?.status === 'verified' ? scoreOf(entry) : null;
    if (score) bits.push(`${cat.label.replace(/ requirements$/, '')} ${score}`);
  }
  return `Entry requirements for ${displayName(model, course)} at ${course.university}, ${model.cycleLabel}` +
    `${bits.length ? `: ${bits.join(', ')}` : ''}. ` +
    'Each requirement is labelled verified, partly verified or not verified, with the date it was checked and a link to the official source.';
}

/** @param {string} file */
const courseHref = file => `../courses/${file}.html`;
/** @param {Model} model @param {any[]} list */
const courseLinks = (model, list, withUniversity = false) => `<ul class="cp-links">${list.map(c =>
  `<li><a href="${courseHref(c.id)}">${esc(displayName(model, c))}${withUniversity ? `, ${esc(c.university)}` : ''}</a></li>`).join('')}</ul>`;

/** @param {Array<{name: string, url: string}>} trail */
const breadcrumbs = trail => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: t.url })),
});

/**
 * @param {Model} model @param {any} course
 * @param {{pieces: ReturnType<typeof import('./site-pages.mjs').appPieces>, pagesCssV: string}} env
 */
export function coursePage(model, course, env) {
  const rec = model.record(course);
  const uni = /** @type {NonNullable<ReturnType<Model['universities']['get']>>} */ (model.universities.get(course.university));
  const field = model.fieldProfiles[course.category];
  const name = displayName(model, course);
  const country = COUNTRY_NAMES[course.country] ?? course.country;
  const url = `${SITE}/courses/${course.id}.html`;
  const official = officialUrl(course);
  // The app's panel, opened: a page reader should not have to expand it.
  const panel = view.panelHtml({ record: rec, categories: model.config.categories, cycleLabel: model.cycleLabel, fallbackUrl: official })
    .replace('<details class="reqs">', '<details class="reqs" open>');
  const siblings = uni.courses.filter(c => c !== course && model.pageOf(c) === c);
  const sameField = model.paged.filter(c => c !== course && c.category === course.category && c.country === course.country && c.university !== course.university);
  const period = model.applicationPeriod ? ` (the ${esc(model.applicationPeriod)})` : '';

  const body = `      <header class="fo__header">
        <span class="fo__eyebrow">Entry requirements · ${esc(model.cycleLabel)}</span>
        <h1 class="fo__title">${esc(name)} at ${esc(course.university)}</h1>
        <p class="fo__desc">What ${esc(course.university)} asks of applicants to ${esc(name)} for ${esc(model.cycleLabel)}${period}. Each requirement below is labelled verified, partly verified or not verified, with the date it was checked and a link to the official source.</p>
        <p class="cp-crumbs">${esc(country)} · <a href="../universities/${esc(uni.slug)}.html">All ${esc(course.university)} courses</a> · <a href="../fields/${esc(course.category)}.html">${esc(field.name)} field guide</a></p>
      </header>
      <section class="fo-section cp-panel">${panel}
      </section>
      <section class="fo-section">
        <h2 class="fo-section__head">Do your subjects and grades fit?</h2>
        <p class="fo-prose">Altiora is free and has no accounts. Enter your subjects and predicted grades once, and it checks them against this course and every other course it holds.</p>
        <a class="fo-btn fo-btn--primary" href="../app.html">Check your subjects against this course in the app →</a>${official ? `
        <a class="fo-btn" href="${esc(official)}" target="_blank" rel="noopener noreferrer">Official course page ↗</a>` : ''}
      </section>${siblings.length ? `
      <section class="fo-section">
        <h2 class="fo-section__head">More courses at ${esc(course.university)}</h2>
        ${courseLinks(model, siblings)}
      </section>` : ''}${sameField.length ? `
      <section class="fo-section">
        <h2 class="fo-section__head">${esc(field.name)} at other universities in ${esc(country === 'UK' || country === 'US' ? `the ${country}` : country)}</h2>
        ${courseLinks(model, sameField, true)}
      </section>` : ''}
      <p><a class="fo-back" href="./">← All courses</a></p>`;

  return pageShell({
    ...env, generator: GENERATOR, source: SOURCE, accent: course.category, url, body,
    title: courseTitle(model, course),
    description: courseDescription(model, course),
    structuredData: [breadcrumbs([
      { name: 'Altiora', url: `${SITE}/` },
      { name: 'Courses', url: `${SITE}/courses/` },
      { name: course.university, url: `${SITE}/universities/${uni.slug}.html` },
      { name, url },
    ])],
  });
}

/**
 * @param {Model} model
 * @param {NonNullable<ReturnType<Model['universities']['get']>>} uni
 * @param {{pieces: ReturnType<typeof import('./site-pages.mjs').appPieces>, pagesCssV: string}} env
 */
export function universityPage(model, uni, env) {
  const url = `${SITE}/universities/${uni.slug}.html`;
  const country = COUNTRY_NAMES[uni.country] ?? uni.country;
  const quals = model.config.categories.filter(c => c.kind === 'qualification');
  const rows = uni.courses.map(c => {
    const rec = model.record(c);
    const name = esc(displayName(model, c));
    const target = model.pageOf(c);
    if (!target) {
      return `<tr><th scope="row">${name}</th><td>${esc(model.fieldProfiles[c.category].name)}</td>` +
        `<td colspan="${quals.length + 1}"><span class="cp-muted">Not yet verified — check with the university.</span></td></tr>`;
    }
    return `<tr><th scope="row"><a href="${courseHref(target.id)}">${name}</a></th><td>${esc(model.fieldProfiles[c.category].name)}</td>` +
      quals.map(q => `<td>${scoreCell(rec[q.id])}</td>`).join('') +
      `<td class="cp-num">${esc(tally(rec, model.config.categories))}</td></tr>`;
  }).join('\n            ');
  const count = uni.courses.length;

  const body = `      <header class="fo__header">
        <span class="fo__eyebrow">Entry requirements · ${esc(model.cycleLabel)}</span>
        <h1 class="fo__title">${esc(uni.name)}</h1>
        <p class="fo__desc">Entry requirements for ${count === 1 ? 'the 1 course' : `the ${count} courses`} Altiora holds at ${esc(uni.name)}, for ${esc(model.cycleLabel)}. Each figure carries its verification status; open a course for every requirement, the date it was checked and the official source.</p>
        <p class="cp-crumbs">${esc(country)}${uni.websiteUrl ? ` · <a href="${esc(uni.websiteUrl)}" target="_blank" rel="noopener noreferrer">Official university website ↗</a>` : ''}</p>
      </header>
      <section class="fo-section">
        <div class="cp-table-wrap">
        <table class="cp-table">
          <thead><tr><th scope="col">Course</th><th scope="col">Field</th>${quals.map(q => `<th scope="col">${esc(q.label.replace(/ requirements$/, ''))}</th>`).join('')}<th scope="col">Requirements</th></tr></thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        </div>
        <p class="reqs__foot">Requirements change every year. Always confirm them on the university's official page before you apply.</p>
      </section>
      <section class="fo-section">
        <a class="fo-btn fo-btn--primary" href="../app.html">Check your subjects against these courses in the app →</a>
      </section>
      <p><a class="fo-back" href="../courses/">← All courses</a></p>`;

  return pageShell({
    ...env, generator: GENERATOR, source: SOURCE, url, body,
    title: `${uni.name}: entry requirements by course, ${model.cycleLabel} · Altiora`,
    description: `Entry requirements for ${count === 1 ? '1 course' : `${count} courses`} at ${uni.name}, ${model.cycleLabel}: A-Level and IB offers side by side, each labelled verified, partly verified or not verified, with official sources.`,
    structuredData: [breadcrumbs([
      { name: 'Altiora', url: `${SITE}/` },
      { name: 'Courses', url: `${SITE}/courses/` },
      { name: uni.name, url },
    ])],
  });
}

/**
 * courses/index.html — every course page, by country and university.
 * @param {Model} model
 * @param {{pieces: ReturnType<typeof import('./site-pages.mjs').appPieces>, pagesCssV: string}} env
 */
export function hubPage(model, env) {
  const url = `${SITE}/courses/`;
  const order = Object.keys(COUNTRY_NAMES);
  const countries = [...new Set(model.pagedUniversities.map(u => u.country))]
    .sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
  const sections = countries.map(code => {
    const unis = model.pagedUniversities.filter(u => u.country === code).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    return `      <section class="fo-section">
        <h2 class="fo-section__head">${esc(COUNTRY_NAMES[code] ?? code)}</h2>
        ${unis.map(u => `<h3 class="cp-uni"><a href="../universities/${esc(u.slug)}.html">${esc(u.name)}</a></h3>
        ${courseLinks(model, u.courses.filter(c => model.pageOf(c) === c))}`).join('\n        ')}
      </section>`;
  }).join('\n');

  const body = `      <header class="fo__header">
        <span class="fo__eyebrow">Entry requirements · ${esc(model.cycleLabel)}</span>
        <h1 class="fo__title">Entry requirements by course</h1>
        <p class="fo__desc">${model.paged.length} courses at ${model.pagedUniversities.length} universities. Every requirement is labelled verified, partly verified or not verified, with the date it was checked and a link to the official source.</p>
      </header>
${sections}
      <section class="fo-section">
        <a class="fo-btn fo-btn--primary" href="../app.html">Check your subjects against every course in the app →</a>
      </section>
      <p><a class="fo-back" href="../">← Back to Altiora</a></p>`;

  return pageShell({
    ...env, generator: GENERATOR, source: SOURCE, url, body,
    title: `University entry requirements by course, ${model.cycleLabel} · Altiora`,
    description: `Entry requirements for ${model.paged.length} courses at ${model.pagedUniversities.length} universities, ${model.cycleLabel}. Every requirement is labelled verified, partly verified or not verified, with a link to the official source.`,
    structuredData: [breadcrumbs([{ name: 'Altiora', url: `${SITE}/` }, { name: 'Courses', url }])],
  });
}

/**
 * Every generated file, in memory: directory → (file name → HTML).
 * @param {Model} model
 * @param {{pieces: ReturnType<typeof import('./site-pages.mjs').appPieces>, pagesCssV: string}} env
 */
export function buildAll(model, env) {
  const coursePages = new Map([['index.html', hubPage(model, env)]]);
  for (const c of model.paged) coursePages.set(`${c.id}.html`, coursePage(model, c, env));
  const universityPages = new Map();
  for (const u of model.pagedUniversities) universityPages.set(`${u.slug}.html`, universityPage(model, u, env));
  return { courses: coursePages, universities: universityPages };
}
