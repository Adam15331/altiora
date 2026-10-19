#!/usr/bin/env node
// Usage: node scripts/verify-pass/changelog.mjs <changes.json> "<title>"
// Appends one CHANGELOG.md section: per changed row old → new, the URL(s),
// the check date and the quoted snippet.
import fs from 'node:fs';
import path from 'node:path';
import { REQ_DIR, loadConfig, today } from '../lib/requirements-io.mjs';
import { snippets } from './lib.mjs';

const [file, title] = process.argv.slice(2);
const changes = JSON.parse(fs.readFileSync(file, 'utf8'));
const config = loadConfig();
const label = config.cycles[config.currentCycle]?.label ?? config.currentCycle;
const catLabel = Object.fromEntries(config.categories.map(c => [c.id, c.label]));

function summary(e) {
  if (!e) return '—';
  const v = e.items?.join('; ') ?? (e.none ? 'None listed' : [e.typicalOffer, e.overallScore != null ? `${e.overallScore} points` : null, e.detail].filter(Boolean).join('; '));
  return `${e.status}${v ? `: ${v}` : ''}`;
}

const lines = [``, `## ${today()} — ${label} — ${title}`, ``];
for (const c of changes) {
  lines.push(`- \`${c.id}\` · ${catLabel[c.cat] ?? c.cat}: ${summary(c.old)} → ${summary(c.new)}.`);
  const urls = (c.new.sources ?? []).map(s => s.url);
  if (urls.length) lines.push(`  Source: ${urls.join(', ')} (checked ${c.new.lastVerified}).`);
  for (const q of snippets(c.new)) lines.push(`  > ${q}`);
  if (c.new.reviewFlag && c.new.reviewFlag !== c.old?.reviewFlag) lines.push(`  Owner flag: ${c.new.reviewFlag}`);
}
fs.appendFileSync(path.join(REQ_DIR, 'CHANGELOG.md'), lines.join('\n') + '\n');
console.log(`changelog: ${changes.length} row(s)`);
