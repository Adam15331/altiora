// @ts-check
/* Validation rules for admissions-requirement cycle files. Pure: takes
 * data in, returns problems out — shared by `npm run validate` and the
 * unit tests. */

/** @typedef {import('../../data/requirements/config.js').RequirementsConfig} RequirementsConfig */
/** @typedef {import('../../data/requirements/config.js').RequirementCycle} RequirementCycle */
/** @typedef {import('../../data/requirements/config.js').RequirementEntry} RequirementEntry */

/**
 * @typedef {object} Problem
 * @property {'error' | 'warning'} level
 * @property {string} where    e.g. "2027 › uk-maths-bristol › admissionsTests"
 * @property {string} message
 */

export const STATUSES = ['verified', 'partial', 'unverified'];
const ENTRY_KEYS = ['status', 'items', 'none', 'codes', 'sources', 'lastVerified', 'note', 'recorded'];
const STALE_AFTER_DAYS = 548; // ~18 months: warn, don't fail — a re-check is due.

/** @param {string} s */
export function isIsoDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** @param {string} a @param {string} b  days from a to b */
function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/** @param {unknown} xs */
const isNonEmptyStringArray = xs => Array.isArray(xs) && xs.length > 0 && xs.every(x => typeof x === 'string' && x.trim() !== '');

/** Same members regardless of order. @param {string[]} a @param {string[]} b */
const sameSet = (a, b) => a.length === b.length && [...a].sort().join('\u0000') === [...b].sort().join('\u0000');

/**
 * Validate one entry. Pushes onto `out`.
 * @param {RequirementEntry} e @param {string} where @param {string} todayIso @param {Problem[]} out
 */
export function validateEntry(e, where, todayIso, out) {
  const err = (/** @type {string} */ message) => out.push({ level: 'error', where, message });
  if (!e || typeof e !== 'object' || Array.isArray(e)) { err('entry must be an object'); return; }
  for (const k of Object.keys(e)) if (!ENTRY_KEYS.includes(k)) err(`unknown field "${k}"`);
  if (!STATUSES.includes(e.status)) { err(`status must be one of ${STATUSES.join(', ')} (got ${JSON.stringify(e.status)})`); return; }

  if (e.status === 'unverified') {
    // An unverified entry may not look verified: no value, no source, no date.
    for (const k of ['items', 'none', 'sources', 'lastVerified', 'codes']) {
      if (k in e) err(`unverified entries may not carry "${k}" — verify it (and set status) or remove it`);
    }
    if ('recorded' in e && (typeof e.recorded !== 'string' || !e.recorded.trim())) err('"recorded" must be a non-empty string');
    if ('note' in e && (typeof e.note !== 'string' || !e.note.trim())) err('"note" must be a non-empty string');
    return;
  }

  // verified / partial
  if ('recorded' in e) err('"recorded" is only for unverified entries — the verified value goes in "items"');
  const hasItems = 'items' in e, hasNone = 'none' in e;
  if (hasItems === hasNone) err('needs exactly one of "items" (the requirement as published) or "none": true (source lists none)');
  if (hasItems && !isNonEmptyStringArray(e.items)) err('"items" must be a non-empty array of strings');
  if (hasNone && e.none !== true) err('"none" must be true');
  if ('codes' in e && !(Array.isArray(e.codes) && e.codes.every(c => typeof c === 'string'))) err('"codes" must be an array of strings');

  if (!Array.isArray(e.sources) || e.sources.length === 0) err('a verified/partial entry needs at least one source');
  else e.sources.forEach((s, i) => {
    if (!s || typeof s.url !== 'string' || !/^https?:\/\/\S+$/i.test(s.url)) err(`sources[${i}].url must be an http(s) URL`);
    if (s && 'label' in s && (typeof s.label !== 'string' || !s.label.trim())) err(`sources[${i}].label must be a non-empty string`);
  });

  if (!isIsoDate(e.lastVerified ?? '')) err('"lastVerified" must be a real date in YYYY-MM-DD form');
  else if (/** @type {string} */ (e.lastVerified) > todayIso) err(`"lastVerified" ${e.lastVerified} is in the future`);
  else if (daysBetween(/** @type {string} */ (e.lastVerified), todayIso) > STALE_AFTER_DAYS) {
    out.push({ level: 'warning', where, message: `last verified ${e.lastVerified} — over 18 months ago, re-check due` });
  }

  if (e.status === 'partial' && !(typeof e.note === 'string' && e.note.trim())) err('a partial entry must say what is unconfirmed in "note"');
  if ('note' in e && (typeof e.note !== 'string' || !e.note.trim())) err('"note" must be a non-empty string');
}

/**
 * Validate a cycle file.
 * @param {RequirementCycle} cycle
 * @param {object} ctx
 * @param {RequirementsConfig} ctx.config
 * @param {any[]} ctx.courses     the course dataset (data/courseRequirements.js)
 * @param {string} ctx.today      YYYY-MM-DD
 * @returns {Problem[]}
 */
export function validateCycle(cycle, { config, courses, today }) {
  /** @type {Problem[]} */
  const out = [];
  const id = cycle?.cycle;
  const at = (/** @type {string[]} */ ...p) => [id ?? '?', ...p].join(' › ');
  const err = (/** @type {string} */ where, /** @type {string} */ message) => out.push({ level: 'error', where, message });

  if (typeof id !== 'string' || !config.cycles[id]) { err(at(), `cycle id ${JSON.stringify(id)} is not listed in config.cycles`); return out; }
  if (cycle.label !== config.cycles[id].label) err(at(), `label ${JSON.stringify(cycle.label)} does not match config label ${JSON.stringify(config.cycles[id].label)}`);
  if (!cycle.courses || typeof cycle.courses !== 'object') { err(at(), 'missing "courses" object'); return out; }

  const isCurrent = id === config.currentCycle;
  const catIds = config.categories.map(c => c.id);
  const byId = new Map(courses.map(c => [c.id, c]));

  // Coverage: the CURRENT cycle must describe every course on the site.
  // Older cycles are historical and may legitimately differ.
  if (isCurrent) {
    for (const c of courses) if (!(c.id in cycle.courses)) err(at(c.id), 'course has no requirements record in the current cycle');
    for (const cid of Object.keys(cycle.courses)) if (!byId.has(cid)) err(at(cid), 'record for a course id that does not exist in data/courseRequirements.js');
  }

  for (const [cid, rec] of Object.entries(cycle.courses)) {
    if (!rec || typeof rec !== 'object') { err(at(cid), 'record must be an object'); continue; }
    for (const cat of catIds) if (!(cat in rec)) err(at(cid, cat), 'missing required category');
    for (const cat of Object.keys(rec)) if (!catIds.includes(cat)) err(at(cid, cat), 'unknown category (add it to config.categories first)');
    for (const cat of catIds) if (cat in rec) validateEntry(rec[cat], at(cid, cat), today, out);

    // Cross-check against the matching engine's copy (current cycle only):
    // until the engine reads this file, both must say the same thing.
    const course = byId.get(cid);
    if (isCurrent && course) {
      const tests = rec.admissionsTests;
      if (tests && tests.status !== 'unverified') {
        const listed = tests.none ? [] : (tests.codes ?? []);
        if (!sameSet(listed, course.admissionTests ?? [])) {
          err(at(cid, 'admissionsTests'), `tests ${JSON.stringify(listed)} disagree with courseRequirements.js admissionTests ${JSON.stringify(course.admissionTests ?? [])} — update both`);
        }
      }
      const subj = rec.subjectPrerequisites;
      if (subj && subj.status !== 'unverified') {
        const listed = subj.none ? [] : (subj.codes ?? []);
        const engine = [...(course.requirements?.essential ?? []), ...(course.requirements?.preferred ?? [])];
        if (!sameSet(listed, engine)) {
          err(at(cid, 'subjectPrerequisites'), `subjects ${JSON.stringify(listed)} disagree with courseRequirements.js essential+preferred ${JSON.stringify(engine)} — update both`);
        }
      }
    }
  }
  return out;
}

/**
 * Validate the config itself.
 * @param {RequirementsConfig} config
 * @returns {Problem[]}
 */
export function validateConfig(config) {
  /** @type {Problem[]} */
  const out = [];
  const err = (/** @type {string} */ message) => out.push({ level: 'error', where: 'config', message });
  if (!config.cycles || !config.cycles[config.currentCycle]) err(`currentCycle ${JSON.stringify(config.currentCycle)} is not in config.cycles`);
  for (const [cid, info] of Object.entries(config.cycles ?? {})) {
    if (!/^\d{4}$/.test(cid)) err(`cycle id ${JSON.stringify(cid)} must be a 4-digit entry year`);
    if (!info?.label || !info?.applicationPeriod) err(`cycle ${cid} needs label and applicationPeriod`);
  }
  const ids = (config.categories ?? []).map(c => c.id);
  if (!ids.length) err('no categories defined');
  if (new Set(ids).size !== ids.length) err('duplicate category ids');
  for (const c of config.categories ?? []) if (!c.id || !c.label) err('every category needs id and label');
  return out;
}
