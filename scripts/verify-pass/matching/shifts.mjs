// node shifts.mjs <grid-before.json> <grid-after.json> → markdown table of per-course shifts (SYNTHETIC grid)
import fs from 'node:fs';
const [a, b] = process.argv.slice(2).map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const per = {};
for (const p in a) for (const id in a[p]) if (a[p][id] !== b[p][id]) {
  const k = `${a[p][id]}→${b[p][id]}`;
  ((per[id] ??= {})[k] ??= []).push(p);
}
const total = Object.keys(a).length;
console.log(`| Course | Profiles changed (of ${total}) | Transitions (count) |\n|---|---:|---|`);
for (const id of Object.keys(per).sort()) {
  const t = per[id]; const n = new Set(Object.values(t).flat()).size;
  console.log(`| \`${id}\` | ${n} | ${Object.entries(t).map(([k, v]) => `${k} (${v.length})`).join(', ')} |`);
}
