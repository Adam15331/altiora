// @ts-check
/* Shared by the static-page generators (build-field-pages.mjs,
 * build-course-pages.mjs): HTML escaping, the page shell for the course and
 * university pages, and the one sitemap writer.
 *
 * The header lockup, analytics snippet, font links and stylesheet versions
 * are read out of app.html at build time so generated pages cannot drift
 * from the app. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT } from './requirements-io.mjs';

export const SITE = 'https://usealtiora.com';

/** Directories of generated pages, in sitemap order. */
export const PAGE_DIRS = ['fields', 'courses', 'universities'];

/** Site-information pages at the root, built by build-info-pages.mjs. */
export const INFO_PAGES = [
  { file: 'privacy.html', label: 'Privacy' },
  { file: 'terms.html', label: 'Terms' },
  { file: 'accessibility.html', label: 'Accessibility' },
];
export const SUPPORT_EMAIL = 'support@usealtiora.com';

/**
 * The site-information links every page carries in its footer.
 * @param {string} base  path from the page to the site root ('' or '../')
 * @param {{email?: boolean}} [opts]  email: false where the page already has a support link
 */
export function infoLinksHtml(base, { email = true } = {}) {
  return [...INFO_PAGES.map(p => `<a href="${base}${p.file}">${p.label}</a>`),
    ...(email ? [`<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`] : [])].join(' · ');
}

/** The footer for generated pages (styles.css: footer, .footer-meta). @param {string} base */
export function footerHtml(base) {
  return `<footer>
    <p class="footer-meta">${infoLinksHtml(base)}</p>
  </footer>`;
}

/** @param {unknown} str */
export const esc = str => String(str)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** JSON for a <script type="application/ld+json"> block ("<" cannot end the element). @param {unknown} data */
export const jsonLd = data => JSON.stringify(data).replace(/</g, '\\u003c');

/** Pieces of app.html every generated page repeats. @param {string} [root] */
export function appPieces(root = ROOT) {
  const appHtml = fs.readFileSync(path.join(root, 'app.html'), 'utf8');
  /** @param {RegExp} re @param {string} what */
  const pick = (re, what) => {
    const m = appHtml.match(re);
    if (!m) throw new Error(`Could not find ${what} in app.html.`);
    return m[1] ?? m[0];
  };
  const fontHrefs = [...appHtml.matchAll(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/g)].map(m => m[1]);
  if (!fontHrefs.length) throw new Error('Could not find the font stylesheet(s) in app.html.');
  return {
    lockup: pick(/<span class="nav__logo">([\s\S]*?)<\/span>\s*<span class="nav__tagline">/, 'the header lockup'),
    analytics: pick(/<!-- Cloudflare Web Analytics -->[\s\S]*?<!-- End Cloudflare Web Analytics -->/, 'the analytics snippet'),
    stylesV: pick(/styles\.css\?v=(\d+)/, 'styles.css version'),
    tokensV: pick(/tokens\.css\?v=(\d+)/, 'tokens.css version'),
    fontHrefs,
  };
}

/** Short content hash, used to cache-bust a stylesheet. @param {string} file @param {string} [root] */
export function fileHash(file, root = ROOT) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0, 8);
}

/**
 * A full page: one directory below the site root (courses/, universities/)
 * by default, or at the root with base ''.
 * @param {object} p
 * @param {ReturnType<typeof appPieces>} p.pieces
 * @param {string} p.generator   script path, for the "generated file" banner
 * @param {string} p.source      what the page is built from, for the banner
 * @param {string} p.title
 * @param {string} p.description
 * @param {string} p.url         canonical URL
 * @param {string} p.pagesCssV   cache-busting version for course-pages.css
 * @param {string | null} [p.accent]  field key for the accent colour
 * @param {unknown[]} [p.structuredData]  schema.org objects
 * @param {string} p.body        inner HTML of the page
 * @param {string} [p.base]      path from the page to the site root
 */
export function pageShell({ pieces, generator, source, title, description, url, pagesCssV, accent = null, structuredData = [], body, base = '../' }) {
  const accentStyle = accent
    ? ` style="--fo-accent: var(--color-cat-${esc(accent)}); --fo-accent-bg: var(--color-cat-${esc(accent)}-bg);"`
    : '';
  return `<!DOCTYPE html>
<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Built by ${generator} from ${source}. Any manual edit here is
     overwritten on the next build; change the source data instead. -->
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(url)}" />
  <link rel="icon" href="${base}favicon.png" type="image/png" sizes="32x32" />
  <link rel="icon" href="${base}favicon.svg" type="image/svg+xml" sizes="any" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta name="twitter:card" content="summary" />
${structuredData.map(d => `  <script type="application/ld+json">${jsonLd(d)}</script>`).join('\n')}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
${pieces.fontHrefs.map(h => `  <link rel="stylesheet" href="${h}" />`).join('\n')}
  <link rel="stylesheet" href="${base}tokens.css?v=${pieces.tokensV}" />
  <link rel="stylesheet" href="${base}styles.css?v=${pieces.stylesV}" />
  <link rel="stylesheet" href="${base}course-pages.css?v=${pagesCssV}" />
  ${pieces.analytics}
</head>
<body>
  <nav class="nav" aria-label="Main navigation">
    <div class="nav__inner">
      <a class="nav__brand" href="${base || './'}" aria-label="Altiora — home" title="Altiora">
        <span class="nav__logo">${pieces.lockup}</span>
        <span class="nav__tagline">Your journey, guided.</span>
      </a>
      <div class="about-wrap"><a class="about-pill" href="${base}app.html">Open the app →</a></div>
    </div>
  </nav>
  <main>
    <div class="content">
      <div class="fo cp"${accentStyle}>
${body}
      </div>
    </div>
  </main>
  ${footerHtml(base)}
</body>
</html>
`;
}

/**
 * Replace a directory's generated .html files with exactly `pages`
 * (file name → HTML), removing pages that are no longer generated.
 * @param {string} dir  directory under the site root
 * @param {Map<string, string>} pages
 * @param {string} [root]
 */
export function writePages(dir, pages, root = ROOT) {
  const out = path.join(root, dir);
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) {
    if (f.endsWith('.html') && !pages.has(f)) fs.unlinkSync(path.join(out, f));
  }
  for (const [file, html] of pages) fs.writeFileSync(path.join(out, file), html);
}

/**
 * Every public URL: the two site pages, the info pages, and each generated page on disk
 * (index.html is listed as its directory).
 * @param {string} [root]
 */
export function sitemapUrls(root = ROOT) {
  const urls = [`${SITE}/`, `${SITE}/app.html`];
  for (const { file } of INFO_PAGES) if (fs.existsSync(path.join(root, file))) urls.push(`${SITE}/${file}`);
  for (const dir of PAGE_DIRS) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    const files = fs.readdirSync(abs).filter(f => f.endsWith('.html')).sort();
    if (files.includes('index.html')) urls.push(`${SITE}/${dir}/`);
    for (const f of files) if (f !== 'index.html') urls.push(`${SITE}/${dir}/${f}`);
  }
  return urls;
}

/**
 * Rewrite sitemap.xml from the generated pages on disk. Both generators call
 * this last, so the sitemap is complete whichever one ran.
 * @param {string} [root]
 * @returns {number} how many URLs were written
 */
export function writeSitemap(root = ROOT) {
  const urls = sitemapUrls(root);
  fs.writeFileSync(path.join(root, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated by scripts/lib/site-pages.mjs (build-field-pages.mjs, build-course-pages.mjs, build-info-pages.mjs) — do not edit by hand. -->\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url>\n    <loc>${u}</loc>\n  </url>`).join('\n') + `\n</urlset>\n`);
  return urls.length;
}

/**
 * Replace the block between two HTML comment markers in a file.
 * @param {string} file  path under the site root
 * @param {string} name  marker name: <!-- name:start --> … <!-- name:end -->
 * @param {string} html
 * @param {string} [root]
 */
export function replaceMarkedBlock(file, name, html, root = ROOT) {
  const abs = path.join(root, file);
  const text = fs.readFileSync(abs, 'utf8');
  const START = `<!-- ${name}:start -->`, END = `<!-- ${name}:end -->`;
  if (!text.includes(START) || !text.includes(END)) throw new Error(`${file} is missing the ${name} markers.`);
  fs.writeFileSync(abs, text.replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => `${START}${html}${END}`));
}
