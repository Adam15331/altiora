// @ts-check
/* Pure helpers for starting a new admissions cycle. */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
/** @type {typeof import('../../requirements-view.js')} */
const view = require('../../requirements-view.js');

/** @typedef {import('../../data/requirements/config.js').RequirementCycle} RequirementCycle */
/** @typedef {import('../../data/requirements/config.js').RequirementEntry} RequirementEntry */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** @param {string} iso */
const fmt = iso => { const [y, m, d] = iso.split('-'); return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`; };

/** "2028" → { label: "2028 entry", applicationPeriod: "2027–28 application cycle" } @param {string} year */
export function cycleInfo(year) {
  const y = Number(year);
  return { label: `${y} entry`, applicationPeriod: `${y - 1}–${String(y).slice(2)} application cycle` };
}

/**
 * Carry one entry into a new cycle: nothing stays verified (requirements
 * change yearly) — and nothing stays "not applicable" — but the previous
 * value is kept as `recorded` so the reviewer — and the student, clearly
 * labelled — can see what it was. Qualification entries (A-Level, IB)
 * carry their structured fields as one line, e.g. "A*AA; Required
 * subjects: Chemistry".
 * @param {RequirementEntry} e @param {string} fromLabel
 * @returns {RequirementEntry}
 */
export function carryEntry(e, fromLabel) {
  if (!e || e.status === 'unverified') return e?.recorded ? { status: 'unverified', recorded: e.recorded } : { status: 'unverified' };
  const value = e.none ? 'none listed' : view.entryValue(e);
  const checked = e.status === 'notApplicable' ? 'checked' : 'verified';
  return { status: 'unverified', recorded: `${value} (${fromLabel}, ${checked} ${fmt(/** @type {string} */ (e.lastVerified))})` };
}

/**
 * @param {RequirementCycle} prev @param {string} year
 * @returns {RequirementCycle}
 */
export function carryForward(prev, year) {
  /** @type {RequirementCycle['courses']} */
  const courses = {};
  for (const [id, rec] of Object.entries(prev.courses)) {
    courses[id] = Object.fromEntries(Object.entries(rec).map(([cat, e]) => [cat, carryEntry(e, prev.label)]));
  }
  return { cycle: year, label: cycleInfo(year).label, carriedFrom: prev.cycle, courses };
}
