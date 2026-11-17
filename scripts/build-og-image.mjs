#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
 * Altiora — build-og-image.mjs
 *
 * Renders og-image.png (1200×630), the picture shown when a link to any
 * Altiora page is shared (WhatsApp, iMessage, Instagram, LinkedIn, X…).
 * Every word on it is the landing page's own: the header lockup (read out of
 * app.html), the hero eyebrow and the hero headline (read out of index.html).
 * Colours are tokens.css values; fonts are the site's own.
 *
 * Dev tooling only — run after changing the lockup or the hero copy:
 *   npm i --no-save playwright-core && node scripts/build-og-image.mjs
 * CHROMIUM_PATH overrides the browser binary. Needs fonts.googleapis.com;
 * fails rather than render with fallback fonts.
 * ═══════════════════════════════════════════════════════════════ */
/* global document */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const tokens = fs.readFileSync(path.join(ROOT, 'tokens.css'), 'utf8');
/** @param {string} text @param {RegExp} re @param {string} what */
const pick = (text, re, what) => { const m = text.match(re); if (!m) throw new Error(`Could not find ${what}.`); return m[1]; };
const lockup = pick(app, /<span class="nav__logo">([\s\S]*?)<\/span>/, 'the header lockup in app.html');
const fonts = pick(app, /<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/, 'the font stylesheet in app.html');
const eyebrow = pick(index, /<p class="mono hero__eyebrow">([\s\S]*?)<\/p>/, 'the hero eyebrow in index.html')
  .replace(/<span class="dot">·<\/span>/g, '  ·  ').replace(/<[^>]+>/g, '');
const headline = pick(index, /<header class="hero"[\s\S]*?<h1>([\s\S]*?)<\/h1>/, 'the hero headline in index.html');
/** @param {string} name */
const token = name => pick(tokens, new RegExp(`${name}:\\s*(#[0-9A-Fa-f]{6})`), `${name} in tokens.css`);
const bg = token('--ce-bg'), ink = token('--ce-ink'), accent = token('--ce-accent');

const W = 1200, H = 630;
const html = `<!DOCTYPE html><html><head><link rel="stylesheet" href="${fonts}">
<style>
  html, body { margin: 0; }
  body { width: ${W}px; height: ${H}px; box-sizing: border-box; padding: 72px 80px; background: ${bg}; color: ${ink};
    display: flex; flex-direction: column; justify-content: space-between; font-family: 'Hanken Grotesk', sans-serif; }
  .logo svg { height: 64px !important; width: auto; }
  .eyebrow { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 22px; letter-spacing: .08em; text-transform: uppercase; opacity: .72; margin: 0 0 22px; }
  h1 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 84px; line-height: 1.04; letter-spacing: -.02em; margin: 0; max-width: 20ch; text-wrap: balance; }
  .foot { display: flex; align-items: center; gap: 18px; font-family: 'Space Mono', monospace; font-size: 26px; font-weight: 700; }
  .bar { width: 64px; height: 14px; background: ${accent}; }
</style></head><body>
  <div class="logo">${lockup}</div>
  <div><p class="eyebrow">${eyebrow}</p><h1>${headline}</h1></div>
  <div class="foot"><span class="bar"></span>usealtiora.com</div>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const missing = await page.evaluate(() => ['800 84px "Bricolage Grotesque"', '700 26px "Space Mono"']
  .filter(f => !document.fonts.check(f)));
if (missing.length) throw new Error(`Fonts did not load: ${missing.join(', ')}`);
const overflow = await page.evaluate(() => document.body.scrollHeight > document.body.clientHeight || document.body.scrollWidth > document.body.clientWidth);
if (overflow) throw new Error('The text does not fit the image.');
await page.screenshot({ path: path.join(ROOT, 'og-image.png') });
await browser.close();
console.log(`og-image.png  ${W}×${H}  "${headline}"`);
