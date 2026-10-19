#!/usr/bin/env node
// Usage: node scripts/verify-pass/engine-migrate.mjs <mapping.json> [--dry-run] [--skip-kinds=k1,k2] [--only=id1,id2] [--changelog="<title>"]
//
// Applies a reviewed engine-migration mapping in lockstep:
//   1. data/courseRequirements.js — the course's requirements.essential /
//      .preferred, grades.aLevels / .ib / .ibHL / .ibHLNote and
//      admissionTests lines are rewritten in place (same one-line layout),
//      and its courseVerification entry gets the new source, date and a
//      note of what changed;
//   2. data/requirements/<cycle>.js — each listed row gets its patch
//      (status, set, unset, note, reviewFlag).
// Every change's `old` must equal the engine's current value, or nothing
// is written. Run `npm run check` afterwards: the validator's engine lock
// proves the two files agree.
//
// Mapping: an array of { id, changes[], rows{}, keep[], reviewerNotes } —
// see docs/engine-migration-2027.md.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadConfig, loadCourses, loadCycle, cyclePath, writeCycle, today } from '../lib/requirements-io.mjs';

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const dry = args.includes('--dry-run');
const skipKinds = new Set((args.find(a => a.startsWith('--skip-kinds=')) ?? '').split('=')[1]?.split(',').filter(Boolean) ?? []);
const changelogTitle = (args.find(a => a.startsWith('--changelog=')) ?? '').slice('--changelog='.length);
const only = new Set((args.find(a => a.startsWith('--only=')) ?? '').split('=')[1]?.split(',').filter(Boolean) ?? []);
if (!file) { console.error('usage: engine-migrate.mjs <mapping.json> [--dry-run] [--skip-kinds=…] [--only=…]'); process.exit(2); }

const ENGINE_PATH = path.join(ROOT, 'data', 'courseRequirements.js');
const FIELDS = ['requirements.essential', 'requirements.preferred', 'grades.aLevels', 'grades.ib', 'grades.ibHL', 'grades.ibHLNote', 'admissionTests'];
const mapping = JSON.parse(fs.readFileSync(file, 'utf8')).filter(m => !only.size || only.has(m.id));
const config = loadConfig();
const cycle = loadCycle(config.currentCycle);
const courses = loadCourses();
const date = today();
let src = fs.readFileSync(ENGINE_PATH, 'utf8');

const get = (course, field) => field.split('.').reduce((o, k) => o?.[k], course);
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const errors = [];
const log = [];
const entries = [];

/** Rewrite one `key: value` inside a one-line object literal, adding it if absent. */
function setProp(line, key, value, compact) {
  const v = Array.isArray(value)
    ? `[${value.map(x => JSON.stringify(x)).join(compact ? ',' : ', ')}]`
    : JSON.stringify(value);
  const re = new RegExp(`(\\b${key}: )(\\[[^\\]]*\\]|"(?:[^"\\\\]|\\\\.)*"|-?\\d+|null)`);
  if (re.test(line)) return line.replace(re, (_m, p) => p + v);
  if (value == null) return line;
  return line.replace(/ \},?(\s*(\/\/.*)?)$/, m => `, ${key}: ${v}${m}`);
}

for (const m of mapping) {
  const course = courses.find(c => c.id === m.id);
  if (!course) { errors.push(`${m.id}: no such course`); continue; }
  const changes = (m.changes ?? []).filter(c => !skipKinds.has(c.kind));
  if (changes.length !== (m.changes ?? []).length && Object.keys(m.rows ?? {}).length) {
    errors.push(`${m.id}: --skip-kinds would drop changes its row patches assume — re-review this course instead`);
    continue;
  }

  // ── 1. engine lines ────────────────────────────────────────────
  const start = src.indexOf(`id: "${m.id}"`);
  if (start < 0) { errors.push(`${m.id}: id not found in courseRequirements.js`); continue; }
  const next = src.indexOf('\n    id: "', start + 1);
  const end = next < 0 ? src.indexOf('\n];', start) : next;
  let block = src.slice(start, end);
  for (const c of changes) {
    if (!FIELDS.includes(c.field)) { errors.push(`${m.id}: unsupported field ${c.field}`); continue; }
    if (!same(get(course, c.field), c.old)) { errors.push(`${m.id}: ${c.field} is ${JSON.stringify(get(course, c.field))}, mapping says old ${JSON.stringify(c.old)}`); continue; }
    if (!c.url || !c.quote) { errors.push(`${m.id}: ${c.field} change has no url/quote`); continue; }
    const [obj, key] = c.field.includes('.') ? c.field.split('.') : [null, c.field];
    const lineRe = new RegExp(`^    ${obj ?? key}: .*$`, 'm');
    const raw = block.match(lineRe)?.[0];
    if (!raw) { errors.push(`${m.id}: no ${obj ?? key} line`); continue; }
    // Three legacy lines declare `ibHLNote: null , ibHLNote: "…"`; JS keeps
    // the last, so dropping the dead null first changes nothing at runtime.
    const line = raw.replace(/ibHLNote: null , (?=ibHLNote: )/, '');
    block = block.replace(raw, line);
    if (key && (line.match(new RegExp(`\\b${key}: `, 'g')) ?? []).length > 1) { errors.push(`${m.id}: ${c.field} is declared twice on its line`); continue; }
    const updated = obj
      ? setProp(line, key, c.new, line.includes('","') || obj === 'requirements')
      : line.replace(/\[[^\]]*\]/, `[${c.new.map(x => JSON.stringify(x)).join(', ')}]`);
    block = block.replace(line, updated);
    log.push(`${m.id} · ${c.field}: ${JSON.stringify(c.old)} → ${JSON.stringify(c.new)} (${c.kind})`);
    entries.push(`- \`${m.id}\` · engine \`${c.field}\`: ${fmt(c.old)} → ${fmt(c.new)} (${[].concat(c.kind).join(', ')}). Source: ${c.url}\n  > ${c.quote}`);
  }
  src = src.slice(0, start) + block + src.slice(end);

  // ── verification metadata ─────────────────────────────────────
  if (changes.length) {
    const vRe = new RegExp(`^  ${JSON.stringify(m.id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: \\{ status: "(\\w+)", source: ("(?:[^"\\\\]|\\\\.)*"), checkedDate: "([\\d-]+)", notes: ("(?:[^"\\\\]|\\\\.)*") \\},$`, 'm');
    const vm = src.match(vRe);
    const stillPartial = ['aLevel', 'ib', 'subjectPrerequisites', 'admissionsTests'].some(cat => (m.rows?.[cat]?.status ?? cycle.courses[m.id][cat].status) !== 'verified');
    const what = changes.map(c => `${c.field.replace(/^\w+\./, '')} ${fmt(c.old)}→${fmt(c.new)}`).join('; ');
    const note = `2027 ENTRY (checked ${date}, engine migrated to the official 2027-entry values): ${what}.${stillPartial ? ' Some 2027 requirements are not expressible in the engine and stay partial in data/requirements/' + config.currentCycle + '.js.' : ''}`;
    const entry = (status, source, notes) => `  ${JSON.stringify(m.id)}: { status: "${status}", source: ${JSON.stringify(source)}, checkedDate: "${date}", notes: ${JSON.stringify(notes)} },`;
    if (vm) {
      src = src.replace(vm[0], entry(stillPartial ? 'partial' : 'verified', changes[0].url, `${note} EARLIER (${vm[3]}, ${JSON.parse(vm[2])}): ${JSON.parse(vm[4])}`));
    } else {
      errors.push(`${m.id}: no one-line courseVerification entry to update`);
    }
  }

  // ── 2. panel rows ─────────────────────────────────────────────
  for (const [cat, p] of Object.entries(m.rows ?? {})) {
    const row = cycle.courses[m.id]?.[cat];
    if (!row) { errors.push(`${m.id} › ${cat}: no row`); continue; }
    const next = { ...row };
    if (p.status) next.status = p.status;
    for (const [k, v] of Object.entries(p.set ?? {})) setPath(next, k, v);
    for (const k of p.unset ?? []) unsetPath(next, k);
    if ('note' in p) { if (p.note == null) delete next.note; else next.note = p.note; }
    if ('reviewFlag' in p) { if (p.reviewFlag == null) delete next.reviewFlag; else next.reviewFlag = p.reviewFlag; }
    if (/Official \(2027 entry\)/.test(next.note ?? '') && next.status === 'verified') errors.push(`${m.id} › ${cat}: verified but the note still reports a disagreement`);
    if (!same(row, next)) {
      log.push(`${m.id} › ${cat}: ${row.status} → ${next.status}`);
      entries.push(`- \`${m.id}\` · ${cat}: row ${row.status} → ${next.status}${next.reviewFlag ? ' (owner flag kept)' : ''}.`);
    }
    cycle.courses[m.id][cat] = next;
  }
}

/** Set / delete a possibly dotted path ("subjects.preferred"); copies the objects it walks through. */
function setPath(obj, key, value) {
  const ks = key.split('.');
  let o = obj;
  for (const k of ks.slice(0, -1)) { o[k] = { ...(o[k] ?? {}) }; o = o[k]; }
  o[ks.at(-1)] = value;
}
function unsetPath(obj, key) {
  const ks = key.split('.');
  let o = obj;
  for (const k of ks.slice(0, -1)) { if (!o[k]) return; o[k] = { ...o[k] }; o = o[k]; }
  delete o[ks.at(-1)];
  // An emptied subjects group or object is dropped rather than left as [] / {}.
  if (ks.length > 1 && Object.keys(o).length === 0) unsetPath(obj, ks.slice(0, -1).join('.'));
}

function fmt(v) { return Array.isArray(v) ? `[${v.join(', ')}]` : v == null ? 'none' : String(v); }

if (errors.length) {
  for (const e of errors) console.error('✗ ' + e);
  console.error(`${errors.length} error(s) — nothing written.`);
  process.exit(1);
}
for (const l of log) console.log(l);
if (dry) { console.log(`dry run: ${log.length} change(s), nothing written.`); process.exit(0); }

fs.writeFileSync(ENGINE_PATH, src);
const cyc = fs.readFileSync(cyclePath(config.currentCycle), 'utf8');
const header = (cyc.match(/^\/\* ═+\n([\s\S]*?)\n \* ═+ \*\//)?.[1] ?? '').split('\n').map(l => l.replace(/^ \* ?/, '')).join('\n');
writeCycle(cycle, header);
if (changelogTitle && entries.length) {
  const label = config.cycles[config.currentCycle]?.label ?? config.currentCycle;
  fs.appendFileSync(path.join(path.dirname(cyclePath(config.currentCycle)), 'CHANGELOG.md'),
    `\n## ${date} — ${label} — ${changelogTitle}\n\n${entries.join('\n')}\n`);
}
console.log(`wrote ${log.length} change(s).`);
