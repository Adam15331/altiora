#!/usr/bin/env node
// Usage: node scripts/verify-pass/verify.mjs <batch.json>
// Every quote must appear verbatim in its own source page's saved text
// (excerpts joined with "…" are checked one by one). Rows dated before
// config.snippetsRequiredFrom are "kept" rows: they may only gain a
// reviewFlag, or move verified → partial with a note. Exit 1 on failure.
import { loadConfig, loadCycle } from '../lib/requirements-io.mjs';
import { readBatch, pageText, norm, snippets } from './lib.mjs';

const batch = readBatch(process.argv[2]);
const config = loadConfig();
const cycle = loadCycle(config.currentCycle);
const cutoff = config.snippetsRequiredFrom;
const fails = [];

for (const { id, cat, entry } of batch.rows) {
  const where = `${id} › ${cat}`;
  const old = cycle.courses[id]?.[cat];
  if (!old) { fails.push(`${where}: no such row`); continue; }
  if (entry.status === 'unverified') continue;
  if ((entry.lastVerified ?? '') < cutoff) {
    // A kept row: only reviewFlag / note / verified→partial may change.
    const strip = e => JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k]) => !['reviewFlag', 'note', 'status'].includes(k))));
    if (strip(old) !== strip(entry)) fails.push(`${where}: kept row (dated ${entry.lastVerified}) changed beyond flag/note/status`);
    if (entry.status !== old.status && !(old.status === 'verified' && entry.status === 'partial')) fails.push(`${where}: kept row status ${old.status} → ${entry.status}`);
    if (entry.status === 'partial' && !entry.note) fails.push(`${where}: partial without a note`);
    continue;
  }
  const quotes = snippets(entry);
  const sources = entry.sources ?? [];
  if (!quotes.length) { fails.push(`${where}: no sourceSnippet`); continue; }
  if (quotes.length !== sources.length) { fails.push(`${where}: ${quotes.length} snippet(s) for ${sources.length} source(s)`); continue; }
  sources.forEach((s, i) => {
    const text = pageText(s.url);
    if (text == null) { fails.push(`${where}: page not fetched: ${s.url}`); return; }
    const page = norm(text);
    for (const part of quotes[i].split('…').map(norm).filter(Boolean)) {
      if (!page.includes(part)) fails.push(`${where}: not verbatim in ${s.url}: "${part.slice(0, 120)}"`);
    }
  });
}

for (const f of fails) console.error('✗ ' + f);
console.log(`${batch.rows.length} rows, ${fails.length} problem(s)`);
process.exit(fails.length ? 1 : 0);
