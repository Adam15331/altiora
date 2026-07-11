#!/usr/bin/env node
/**
 * Link health sweep for Altiora's verification sources.
 *
 * Requests every course's verification.source URL (and every university
 * websiteUrl), following redirects, and classifies each:
 *
 *   OK          2xx landing on a real page (not just the domain root)
 *   REDIRECTED  2xx but the deep link landed on the domain root / homepage
 *   DEAD        HTTP 404/410, DNS failure, or timeout
 *   UNREACHABLE could not be verified from THIS machine (proxy/CDN block,
 *               403/429 bot-walls, TLS interception, 5xx) — deliberately a
 *               separate class: an unreachable link is NOT marked checked.
 *
 * Usage (from the repo root, Node 18+):
 *   node scripts/check-links.mjs             # report only (default)
 *   node scripts/check-links.mjs --write     # also write sourceStatus into
 *                                            # data/courseRequirements.js
 *   node scripts/check-links.mjs --only us-  # limit to course ids matching
 *
 * --write updates each swept course's courseVerification entry:
 *   - DEAD        -> sourceStatus: "dead"
 *   - REDIRECTED  -> sourceStatus: "redirected"
 *   - OK          -> removes any existing sourceStatus (client default 'ok')
 *   - UNREACHABLE -> leaves the entry untouched (never marked as checked)
 * The client (cardMoreHtml) hides the official-page link for dead/redirected
 * sources and falls back to the university website.
 *
 * Safety valve: --write aborts when more than 20% of requests were
 * UNREACHABLE — that pattern means the sweep ran from a blocked network
 * (e.g. a sandbox proxy) and its results would be noise, not signal.
 *
 * NOT shipped to the client; this folder is tooling only. A ready-to-enable
 * monthly GitHub Action lives next to this file (link-health.yml) — move it
 * to .github/workflows/ to turn it on.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data', 'courseRequirements.js');
const UNIS = path.join(ROOT, 'data', 'university-profiles.js');

const require = createRequire(import.meta.url);
const { courses, courseVerification } = require(DATA);
let universityProfiles = {};
try { universityProfiles = require(UNIS).universityProfiles ?? require(UNIS); } catch { /* optional */ }

const WRITE = process.argv.includes('--write');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

const TIMEOUT_MS = 20000;
const CONCURRENCY = 8;
// Some university sites bot-wall the default fetch UA; look like a browser.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function probe(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      redirect: 'follow',
      signal: ctl.signal,
      headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' },
    });
    // Some servers reject HEAD-less GETs oddly; a 405 on GET is a bot-wall.
    const finalUrl = new URL(res.url);
    const origUrl  = new URL(url);
    if (res.status === 404 || res.status === 410) return { cls: 'DEAD', detail: `HTTP ${res.status}` };
    if (res.ok) {
      const origDeep  = origUrl.pathname.replace(/\/+$/, '') !== '';
      const finalRoot = finalUrl.pathname.replace(/\/+$/, '') === '';
      if (origDeep && finalRoot) return { cls: 'REDIRECTED', detail: `landed on ${finalUrl.origin}/` };
      return { cls: 'OK', detail: `HTTP ${res.status}` };
    }
    // 403/429/5xx and friends: can't distinguish a bot-wall from a broken
    // page from here — never mark these as checked.
    return { cls: 'UNREACHABLE', detail: `HTTP ${res.status}` };
  } catch (err) {
    const msg = String(err?.cause?.code ?? err?.name ?? err);
    if (/ENOTFOUND|EAI_AGAIN/.test(msg)) return { cls: 'DEAD', detail: `DNS: ${msg}` };
    if (/AbortError/.test(msg))          return { cls: 'DEAD', detail: 'timeout' };
    // Connection resets / proxy refusals are the blocked-network signature.
    return { cls: 'UNREACHABLE', detail: msg };
  } finally {
    clearTimeout(timer);
  }
}

async function sweep(items) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) {
      const item = items[i++];
      const r = await probe(item.url);
      out.push({ ...item, ...r });
      process.stderr.write(`\r${out.length}/${items.length}`);
    }
  }));
  process.stderr.write('\n');
  return out;
}

// ── Collect targets ──────────────────────────────────────────────
const courseTargets = courses
  .filter(c => !ONLY || c.id.includes(ONLY))
  .map(c => ({ kind: 'course', id: c.id, url: courseVerification[c.id]?.source }))
  .filter(t => typeof t.url === 'string' && /^https?:\/\//i.test(t.url));

const uniTargets = Object.entries(universityProfiles)
  .filter(([, p]) => p?.websiteUrl)
  .map(([name, p]) => ({ kind: 'university', id: name, url: p.websiteUrl }));

console.log(`Sweeping ${courseTargets.length} course sources + ${uniTargets.length} university sites…`);
const results = await sweep([...courseTargets, ...uniTargets]);

// ── Report ───────────────────────────────────────────────────────
const byCls = { OK: [], REDIRECTED: [], DEAD: [], UNREACHABLE: [] };
results.forEach(r => byCls[r.cls].push(r));
console.log(`\nOK ${byCls.OK.length} · REDIRECTED ${byCls.REDIRECTED.length} · DEAD ${byCls.DEAD.length} · UNREACHABLE ${byCls.UNREACHABLE.length}`);
for (const cls of ['DEAD', 'REDIRECTED', 'UNREACHABLE']) {
  if (!byCls[cls].length) continue;
  console.log(`\n${cls}:`);
  byCls[cls].forEach(r => console.log(`  [${r.kind}] ${r.id}\n    ${r.url} — ${r.detail}`));
}

// ── Write-back (courses only) ────────────────────────────────────
if (WRITE) {
  const total = results.length;
  const unreachablePct = total ? (byCls.UNREACHABLE.length / total) * 100 : 100;
  if (unreachablePct > 20) {
    console.error(`\n--write ABORTED: ${unreachablePct.toFixed(0)}% of requests were UNREACHABLE — ` +
      `this network cannot verify these links (blocked/proxied). Nothing was written.`);
    process.exit(2);
  }
  let src = readFileSync(DATA, 'utf8');
  let wrote = 0;
  for (const r of results.filter(x => x.kind === 'course')) {
    const entryRe = new RegExp(`("${r.id}":\\s*\\{[^\\n]*?)(\\s*checkedDate:)`);
    // Strip any existing flag first, then add the new one for non-OK.
    src = src.replace(entryRe, (m, head, tail) =>
      head.replace(/sourceStatus: "[a-z]+",\s*/, '') + tail);
    if (r.cls === 'DEAD' || r.cls === 'REDIRECTED') {
      src = src.replace(entryRe, (m, head, tail) =>
        `${head} sourceStatus: "${r.cls.toLowerCase()}",${tail}`);
      wrote++;
    }
  }
  writeFileSync(DATA, src);
  console.log(`\nWrote sourceStatus for ${wrote} non-OK course sources into data/courseRequirements.js`);
  console.log('(OK courses carry no flag — the client defaults to "ok". Bump the courseRequirements version in app.html.)');
}

process.exit(byCls.DEAD.length ? 1 : 0);
