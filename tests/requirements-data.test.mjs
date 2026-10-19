// @ts-check
// Tests over the REAL data: the current cycle is complete and traceable,
// Phase 1 scope holds (no A-Level / IB), the site loads the right files,
// and the annual carry-forward produces a valid draft.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadConfig, loadCourses, loadCycle } from '../scripts/lib/requirements-io.mjs';
import { validateCycle, validateConfig } from '../scripts/lib/validate-requirements.mjs';
import { carryForward, cycleInfo } from '../scripts/lib/cycles.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const view = require('../requirements-view.js');
const config = loadConfig();
const courses = loadCourses();
const cycle = loadCycle(config.currentCycle);
const TODAY = new Date().toISOString().slice(0, 10);

test('the config is valid and names the current cycle', () => {
  assert.deepEqual(validateConfig(config), []);
  assert.ok(config.cycles[config.currentCycle].label.includes(config.currentCycle));
});

test('the current cycle validates with no errors', () => {
  const errors = validateCycle(cycle, { config, courses, today: TODAY }).filter(p => p.level === 'error');
  assert.deepEqual(errors, []);
});

test('every course has every Phase 1 category', () => {
  for (const c of courses) {
    for (const cat of config.categories) assert.ok(cycle.courses[c.id]?.[cat.id], `${c.id} › ${cat.id}`);
  }
});

test('every verified or partial requirement has a source and a last-verified date', () => {
  for (const [id, rec] of Object.entries(cycle.courses)) {
    for (const [cat, e] of Object.entries(rec)) {
      if (e.status === 'unverified') continue;
      assert.ok(e.sources?.length && /^https?:\/\//.test(e.sources[0].url), `${id} › ${cat}: source`);
      assert.match(e.lastVerified ?? '', /^\d{4}-\d{2}-\d{2}$/, `${id} › ${cat}: date`);
    }
  }
});

test('Phase 1 scope: no A-Level or IB category, label or row', () => {
  const qual = /a-?level|\bib\b|baccalaureate/i;
  for (const cat of config.categories) {
    assert.doesNotMatch(cat.id, qual);
    assert.doesNotMatch(cat.label, qual);
  }
  const html = view.panelHtml({ record: cycle.courses[courses[0].id], categories: config.categories, cycleLabel: 'x' });
  for (const m of html.matchAll(/<dt class="reqs__label">([^<]*)<\/dt>/g)) assert.doesNotMatch(m[1], qual);
});

test('the site loads config, the current cycle and the renderer before main.js', () => {
  const app = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
  const at = (/** @type {string} */ s) => { const i = app.indexOf(s); assert.ok(i >= 0, `app.html loads ${s}`); return i; };
  const cfg = at('src="data/requirements/config.js');
  const data = at(`src="data/requirements/${config.currentCycle}.js`);
  const viewAt = at('src="requirements-view.js');
  const main = at('src="main.js');
  assert.ok(cfg < data && data < main && viewAt < main);
});

test('starting a new cycle resets everything to unverified and still validates', () => {
  const next = String(Number(config.currentCycle) + 1);
  const draft = carryForward(cycle, next);
  assert.equal(draft.cycle, next);
  assert.equal(draft.carriedFrom, config.currentCycle);
  const statuses = new Set(Object.values(draft.courses).flatMap(r => Object.values(r).map(e => e.status)));
  assert.deepEqual([...statuses], ['unverified']);
  // A previously verified value is kept for the reviewer, labelled with its old cycle.
  const someVerifiedId = Object.keys(cycle.courses).find(id => cycle.courses[id].admissionsTests.status === 'verified');
  assert.match(draft.courses[/** @type {string} */ (someVerifiedId)].admissionsTests.recorded ?? '', new RegExp(`${config.cycles[config.currentCycle].label}, verified`));
  // Valid as an additional (non-current) cycle.
  const cfg2 = { ...config, cycles: { ...config.cycles, [next]: cycleInfo(next) } };
  assert.deepEqual(validateCycle(draft, { config: cfg2, courses, today: TODAY }).filter(p => p.level === 'error'), []);
});
