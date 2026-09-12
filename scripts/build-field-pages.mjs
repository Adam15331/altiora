#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
 * Altiora — build-field-pages.mjs
 *
 * Generates one static, crawlable HTML page per field profile:
 *   data/fieldProfiles.js  →  fields/<key>.html
 * and regenerates sitemap.xml plus the field-links block in index.html
 * (between <!-- field-links:start --> and <!-- field-links:end -->).
 *
 * The profile prose is NOT transformed: paragraphs split on "\n\n" and the
 * **bold lead-in** convention is rendered exactly as main.js renders it in
 * the app's Field Overview. Nothing is summarised, rewritten or added.
 * fieldRoadmaps (reading lists, competitions, projects) are not rendered.
 *
 * The header lockup and the analytics snippet are read out of app.html at
 * build time so the pages can never drift from the app.
 *
 * Fails loudly (non-zero exit, nothing written) if any profile is missing a
 * field the template expects.
 *
 * Usage:  node scripts/build-field-pages.mjs
 * ═══════════════════════════════════════════════════════════════ */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'data/fieldProfiles.js';
const SCRIPT = 'scripts/build-field-pages.mjs';
const SITE = 'https://usealtiora.com';
const OUT_DIR = path.join(ROOT, 'fields');

const { fieldProfiles } = require(path.join(ROOT, SRC));

/* ── Helpers copied from main.js so rendering is identical ─────────── */
const esc = str => String(str)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Escaping FIRST, then the **bold lead-in** convention — same as fieldProfileHtml().
const paras = txt => String(txt).split('\n\n').map(p =>
  `<p class="fo-prose">${esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`).join('');

/* ── Shape check: fail loudly, never emit a half page ──────────────── */
const REQUIRED = [
  ['name', 'string'], ['whatItIs', 'string'], ['dayInTheLife', 'string'],
  ['degreeVsSchool', 'string'], ['whoThrives', 'string'],
  ['branches', 'array'], ['misconceptions', 'array'],
  ['careers.paths', 'array'], ['careers.honestNote', 'string'],
];
function assertShape(key, fp) {
  for (const [field, type] of REQUIRED) {
    const v = field.split('.').reduce((o, k) => (o == null ? undefined : o[k]), fp);
    const ok = type === 'array' ? Array.isArray(v) && v.length > 0 : typeof v === type && v.trim().length > 0;
    if (!ok) throw new Error(`Profile "${key}" is missing or empty field "${field}" (expected ${type}).`);
  }
  fp.branches.forEach((b, i) => { if (!b?.name || !b?.blurb) throw new Error(`Profile "${key}": branches[${i}] needs name and blurb.`); });
  fp.misconceptions.forEach((m, i) => { if (!m?.myth || !m?.reality) throw new Error(`Profile "${key}": misconceptions[${i}] needs myth and reality.`); });
}

/* ── Pieces read from the live app so nothing drifts ──────────────── */
const appHtml = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
const pick = (re, what) => {
  const m = appHtml.match(re);
  if (!m) throw new Error(`Could not find ${what} in app.html.`);
  return m[1] ?? m[0];
};
const lockup = pick(/<span class="nav__logo">([\s\S]*?)<\/span>\s*<span class="nav__tagline">/, 'the header lockup');
const analytics = pick(/<!-- Cloudflare Web Analytics -->[\s\S]*?<!-- End Cloudflare Web Analytics -->/, 'the analytics snippet');
const stylesV = pick(/styles\.css\?v=(\d+)/, 'styles.css version');
const tokensV = pick(/tokens\.css\?v=(\d+)/, 'tokens.css version');
const fontsHref = pick(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/, 'the font stylesheet');

/* ── Meta description: whole sentences from the profile's first paragraph,
 *    up to ~160 characters. Sentence boundaries only — never a rewrite. ── */
function describe(fp) {
  const first = String(fp.whatItIs).split('\n\n')[0].replace(/\*\*/g, '');
  const sentences = first.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [first];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > 160 && out) break;
    out += s;
  }
  return out.trim();
}

const FO_HEAD_ACCENTS = ['fo-accent-yellow', 'fo-accent-coral', 'fo-accent-sage', 'fo-accent-lavender'];

function pageHtml(key, fp) {
  const url = `${SITE}/fields/${key}.html`;
  const title = `${fp.name} · Altiora`;
  const description = describe(fp);
  const branches = fp.branches.map(b =>
    `<div class="fo-branch"><strong>${esc(b.name)}.</strong> ${esc(b.blurb)}</div>`).join('');
  const myths = fp.misconceptions.map(m => `
    <div class="fo-myth">
      <p class="fo-myth__myth"><span class="fo-myth__label">People think</span>${esc(m.myth)}</p>
      <p class="fo-myth__reality"><span class="fo-myth__label">Actually</span>${esc(m.reality)}</p>
    </div>`).join('');
  const paths = `<ul class="fo-leads">${fp.careers.paths.map(p => `<li class="fo-lead">${esc(p)}</li>`).join('')}</ul>`;
  const compares = (fp.oftenComparedWith ?? []).map(c => {
    const other = fieldProfiles[c.fieldId];
    if (!other) throw new Error(`Profile "${key}": oftenComparedWith points at unknown field "${c.fieldId}".`);
    return `
      <a class="fo-compare" href="${esc(c.fieldId)}.html">
        <span class="fo-compare__title">${esc(fp.name)} vs ${esc(other.name)}</span>
        <span class="fo-compare__body">${esc(c.howToThinkAboutIt)}</span>
        <span class="fo-compare__go">Read about ${esc(other.name)} →</span>
      </a>`;
  }).join('');

  // Same sections, same headings, same order as the app's Field Overview.
  const sections = [
    { head: 'What it actually is',              body: paras(fp.whatItIs) },
    { head: 'Where it branches',                body: branches },
    { head: 'A day in the life',                body: paras(fp.dayInTheLife) },
    { head: 'The degree vs the school subject', body: paras(fp.degreeVsSchool) },
    { head: "Who thrives — and who doesn't",    body: paras(fp.whoThrives) },
    { head: 'Misconceptions',                   body: myths },
    { head: 'Where it leads',                   body: `${paths}${paras(fp.careers.honestNote)}` },
  ];
  if (compares) sections.push({ head: 'Often compared with', body: `<div class="fo-compares">${compares}</div>` });
  const sectionsHtml = sections.map((s, i) =>
    `<section class="fo-section"><h2 class="fo-section__head ${FO_HEAD_ACCENTS[i % FO_HEAD_ACCENTS.length]}">${esc(s.head)}</h2>${s.body}</section>`
  ).join('\n      ');

  return `<!DOCTYPE html>
<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Built by ${SCRIPT} from ${SRC}. Any manual edit here is overwritten on
     the next build; change the source profile instead. -->
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" href="../favicon.png" type="image/png" sizes="32x32" />
  <link rel="icon" href="../favicon.svg" type="image/svg+xml" sizes="any" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta name="twitter:card" content="summary" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${fontsHref}" />
  <link rel="stylesheet" href="../tokens.css?v=${tokensV}" />
  <link rel="stylesheet" href="../styles.css?v=${stylesV}" />
  ${analytics}
</head>
<body>
  <nav class="nav" aria-label="Main navigation">
    <div class="nav__inner">
      <a class="nav__brand" href="../" aria-label="Altiora — home" title="Altiora">
        <span class="nav__logo">${lockup}</span>
        <span class="nav__tagline">Your journey, guided.</span>
      </a>
      <div class="about-wrap"><a class="about-pill" href="../app.html">Open the app →</a></div>
    </div>
  </nav>
  <main>
    <div class="content">
      <div class="fo" style="--fo-accent: var(--color-cat-${esc(key)}); --fo-accent-bg: var(--color-cat-${esc(key)}-bg);">
      <header class="fo__header">
        <span class="fo__eyebrow">Field guide</span>
        <h1 class="fo__title">${esc(fp.name)}</h1>
      </header>
      ${sectionsHtml}
      <section class="fo-section">
        <a class="fo-btn fo-btn--primary" href="../app.html">Check your subjects against real courses in the app →</a>
      </section>
      <p><a class="fo-back" href="../">← Back to Altiora</a></p>
      </div>
    </div>
  </main>
</body>
</html>
`;
}

/* ── Build everything in memory first; write only when all pages built ── */
const keys = Object.keys(fieldProfiles);
const pages = new Map();
for (const key of keys) {
  assertShape(key, fieldProfiles[key]);
  pages.set(key, pageHtml(key, fieldProfiles[key]));
}

fs.mkdirSync(OUT_DIR, { recursive: true });
// Remove stale pages for profiles that no longer exist.
for (const f of fs.readdirSync(OUT_DIR)) {
  if (f.endsWith('.html') && !pages.has(f.replace(/\.html$/, ''))) fs.unlinkSync(path.join(OUT_DIR, f));
}
for (const [key, html] of pages) fs.writeFileSync(path.join(OUT_DIR, `${key}.html`), html);

/* ── sitemap.xml: the two site pages plus every field page ────────── */
const urls = [`${SITE}/`, `${SITE}/app.html`, ...keys.map(k => `${SITE}/fields/${k}.html`)];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated by ${SCRIPT} — do not edit by hand. -->\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url>\n    <loc>${u}</loc>\n  </url>`).join('\n') + `\n</urlset>\n`);

/* ── index.html: the field-links block between the markers ────────── */
const indexPath = path.join(ROOT, 'index.html');
const index = fs.readFileSync(indexPath, 'utf8');
const START = '<!-- field-links:start -->', END = '<!-- field-links:end -->';
if (!index.includes(START) || !index.includes(END)) throw new Error('index.html is missing the field-links markers.');
const links = keys.map(k => `<a class="step__link" href="fields/${k}.html">${esc(fieldProfiles[k].name)}</a>`).join(' · ');
const block = `${START}<p class="step__desc">Read the guides: ${links}.</p>${END}`;
fs.writeFileSync(indexPath, index.replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => block));

console.log(`Built ${pages.size} field pages, sitemap.xml (${urls.length} URLs), index.html field links.`);
