#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
 * Altiora — build-app-icons.mjs
 *
 * Renders the home-screen icons from favicon.svg (the single source of the
 * mark) with headless Chromium:
 *   icons/icon-192.png           manifest, purpose "any"   (transparent corners)
 *   icons/icon-512.png           manifest, purpose "any"   (transparent corners)
 *   icons/icon-maskable-512.png  manifest, purpose "maskable": full-bleed canvas,
 *                                mark scaled into the central safe zone so a
 *                                circular or squircle mask never clips it
 *   apple-touch-icon.png         180×180, opaque (iOS rounds the corners itself
 *                                and paints transparency black)
 *
 * Dev tooling only — run after changing favicon.svg:
 *   npm i --no-save playwright-core && node scripts/build-app-icons.mjs
 * CHROMIUM_PATH overrides the browser binary.
 * ═══════════════════════════════════════════════════════════════ */
/* global document */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svg = fs.readFileSync(path.join(ROOT, 'favicon.svg'), 'utf8');
// The canvas colour is the tile's own fill (tokens.css --ce-bg).
const canvas = /<rect[^>]*fill="(#[0-9A-Fa-f]{6})"/.exec(svg)?.[1];
if (!canvas) throw new Error('Could not read the tile colour from favicon.svg.');
const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

// scale: the mark's size as a fraction of the icon; opaque: paint the canvas.
const ICONS = [
  { file: 'icons/icon-192.png', size: 192, scale: 1, opaque: false },
  { file: 'icons/icon-512.png', size: 512, scale: 1, opaque: false },
  { file: 'icons/icon-maskable-512.png', size: 512, scale: 0.72, opaque: true },
  { file: 'apple-touch-icon.png', size: 180, scale: 0.86, opaque: true },
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const { file, size, scale, opaque } of ICONS) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${opaque ? canvas : 'transparent'}">
    <img src="${dataUri}" width="${Math.round(size * scale)}" height="${Math.round(size * scale)}" alt=""></body></html>`);
  await page.waitForFunction(() => document.images[0].complete);
  await page.screenshot({ path: path.join(ROOT, file), omitBackground: !opaque });
  console.log(`${file}  ${size}×${size}${opaque ? ' opaque' : ''}`);
}
await browser.close();
