#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
 * Altiora — build-og-image.mjs
 *
 * Renders og-image.png (1200×630), the picture shown when a link to any
 * Altiora page is shared (WhatsApp, iMessage, Instagram, LinkedIn, X…).
 * It is the logo mark alone (favicon.svg, the single source of the mark),
 * what it draws (the A and its bar) centred on the mark's own canvas
 * colour. No words.
 *
 * Crop-safe: some apps show only the central square of the picture, so the
 * mark sits well inside the central 630×630. The build fails if anything
 * that is not canvas falls outside the central SAFE×SAFE square.
 *
 * Dev tooling only — run after changing favicon.svg:
 *   npm i --no-save playwright-core && node scripts/build-og-image.mjs
 * CHROMIUM_PATH overrides the browser binary. After a change, bump
 * SOCIAL_IMAGE.version in scripts/lib/site-pages.mjs (and the two
 * hand-written copies in index.html and app.html) so apps fetch the new file.
 * ═══════════════════════════════════════════════════════════════ */
/* global document, Image */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svg = fs.readFileSync(path.join(ROOT, 'favicon.svg'), 'utf8');
// The canvas colour is the mark's own tile fill (tokens.css --ce-bg).
const canvas = /<rect[^>]*fill="(#[0-9A-Fa-f]{6})"/.exec(svg)?.[1];
if (!canvas) throw new Error('Could not read the tile colour from favicon.svg.');
const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const W = 1200, H = 630;
const MARK = 360;   // the mark's tile; its ink and bar fill the middle ~64% × ~79% of it
const SAFE = 450;   // everything drawn must fall inside the central SAFE×SAFE square (90px clear of a 630 crop)

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(`<!DOCTYPE html><html><body style="margin:0;width:${W}px;height:${H}px;display:grid;place-items:center;background:${canvas}">
  <img src="${dataUri}" width="${MARK}" height="${MARK}" alt=""></body></html>`);
await page.waitForFunction(() => document.images[0].complete && document.images[0].naturalWidth > 0);
// Bounding box of every pixel that is not the canvas colour.
const box = await page.evaluate(async ({ W, H, uri, bg, MARK }) => {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = /** @type {CanvasRenderingContext2D} */ (c.getContext('2d'));
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const img = new Image(); img.src = uri; await img.decode();
  g.drawImage(img, (W - MARK) / 2, (H - MARK) / 2, MARK, MARK);
  const d = g.getImageData(0, 0, W, H).data;
  const [r0, g0, b0] = [d[0], d[1], d[2]];
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (Math.abs(d[i] - r0) + Math.abs(d[i + 1] - g0) + Math.abs(d[i + 2] - b0) > 6) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return { x0, y0, x1, y1 };
}, { W, H, uri: dataUri, bg: canvas, MARK });
if (box.x1 < 0) throw new Error('The mark did not render.');
const safe = { x0: (W - SAFE) / 2, y0: (H - SAFE) / 2, x1: (W + SAFE) / 2, y1: (H + SAFE) / 2 };
if (box.x0 < safe.x0 || box.y0 < safe.y0 || box.x1 > safe.x1 || box.y1 > safe.y1) {
  throw new Error(`The mark (${JSON.stringify(box)}) is outside the central ${SAFE}×${SAFE} square.`);
}
// Centre what is drawn (the tile has more room above the A than below the bar), then re-check.
const dx = Math.round((W - (box.x0 + box.x1 + 1)) / 2), dy = Math.round((H - (box.y0 + box.y1 + 1)) / 2);
await page.evaluate(({ dx, dy }) => { document.images[0].style.transform = `translate(${dx}px, ${dy}px)`; }, { dx, dy });
box.x0 += dx; box.x1 += dx; box.y0 += dy; box.y1 += dy;
if (box.x0 < safe.x0 || box.y0 < safe.y0 || box.x1 > safe.x1 || box.y1 > safe.y1) throw new Error('The centred mark is outside the safe square.');
await page.screenshot({ path: path.join(ROOT, 'og-image.png') });
await browser.close();
console.log(`og-image.png  ${W}×${H}  mark spans x ${box.x0}–${box.x1}, y ${box.y0}–${box.y1}; `
  + `margin inside a central 630×630 crop: ${Math.min(box.x0 - (W - 630) / 2, (W + 630) / 2 - box.x1)}px sides, ${Math.min(box.y0, H - box.y1)}px top/bottom`);
