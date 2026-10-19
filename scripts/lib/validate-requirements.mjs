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

export const STATUSES = ['verified', 'partial', 'unverified', 'notApplicable'];
const COMMON_KEYS = ['status', 'sources', 'lastVerified', 'note', 'recorded', 'sourceSnippet', 'reviewFlag'];
const LIST_KEYS = ['items', 'none', 'codes'];
// Qualification categories (A-Level, IB): structured fields, no items.
const QUAL_VALUE_KEYS = ['typicalOffer', 'overallScore', 'subjects', 'detail', 'practicalEndorsement', 'contextualOffer', 'coreNote', 'testsInterview'];
const QUAL_KEYS = ['accepted', 'withheld', ...QUAL_VALUE_KEYS];
const QUAL_TEXT_KEYS = ['typicalOffer', 'detail', 'practicalEndorsement', 'contextualOffer', 'coreNote', 'testsInterview'];
export const SUBJECT_GROUPS = ['required', 'preferred', 'excluded', 'higherLevel', 'standardLevel'];
const WITHHOLDABLE = ['typicalOffer', 'overallScore', 'detail'];
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

/** @param {unknown} s */
const isNonEmptyString = s => typeof s === 'string' && s.trim() !== '';

/**
 * Source + date (+ snippet) rules shared by every checked status
 * (verified, partial, notApplicable).
 * @param {RequirementEntry} e @param {string} where @param {string} todayIso @param {Problem[]} out
 * @param {string} [snippetsRequiredFrom]
 */
function validateProvenance(e, where, todayIso, out, snippetsRequiredFrom) {
  const err = (/** @type {string} */ message) => out.push({ level: 'error', where, message });
  if (!Array.isArray(e.sources) || e.sources.length === 0) err(`a ${e.status} entry needs at least one source`);
  else e.sources.forEach((s, i) => {
    if (!s || typeof s.url !== 'string' || !/^https?:\/\/\S+$/i.test(s.url)) err(`sources[${i}].url must be an http(s) URL`);
    if (s && 'label' in s && (typeof s.label !== 'string' || !s.label.trim())) err(`sources[${i}].label must be a non-empty string`);
  });

  if (!isIsoDate(e.lastVerified ?? '')) err('"lastVerified" must be a real date in YYYY-MM-DD form');
  else if (/** @type {string} */ (e.lastVerified) > todayIso) err(`"lastVerified" ${e.lastVerified} is in the future`);
  else if (daysBetween(/** @type {string} */ (e.lastVerified), todayIso) > STALE_AFTER_DAYS) {
    out.push({ level: 'warning', where, message: `last verified ${e.lastVerified} — over 18 months ago, re-check due` });
  }

  if ('sourceSnippet' in e) {
    const sn = e.sourceSnippet;
    const ok = isNonEmptyString(sn) || (Array.isArray(sn) && sn.length > 0 && sn.every(isNonEmptyString));
    if (!ok) err('"sourceSnippet" must be a non-empty string, or an array of them (one per source)');
    else if (Array.isArray(sn) && Array.isArray(e.sources) && sn.length !== e.sources.length) {
      err(`"sourceSnippet" has ${sn.length} quotes for ${e.sources.length} sources — give one per source, in order`);
    }
  } else if (snippetsRequiredFrom && isIsoDate(e.lastVerified ?? '') && /** @type {string} */ (e.lastVerified) >= snippetsRequiredFrom) {
    err(`checked on ${e.lastVerified} but has no "sourceSnippet" — quote the source (required from ${snippetsRequiredFrom})`);
  }
}

/**
 * The structured fields of a qualification entry (A-Level, IB).
 * @param {RequirementEntry} e @param {(m: string) => void} err
 */
function validateQualificationFields(e, err) {
  for (const k of QUAL_TEXT_KEYS) if (k in e && !isNonEmptyString(/** @type {any} */ (e)[k])) err(`"${k}" must be a non-empty string`);
  if ('overallScore' in e && !(Number.isInteger(e.overallScore) && /** @type {number} */ (e.overallScore) >= 1 && /** @type {number} */ (e.overallScore) <= 45)) {
    err('"overallScore" must be a whole number of IB points (1–45)');
  }
  if ('subjects' in e) {
    const s = e.subjects;
    if (!s || typeof s !== 'object' || Array.isArray(s)) err('"subjects" must be an object');
    else {
      for (const [group, list] of Object.entries(s)) {
        if (!SUBJECT_GROUPS.includes(group)) { err(`unknown subject group "${group}" (use ${SUBJECT_GROUPS.join(', ')})`); continue; }
        if (!Array.isArray(list) || list.length === 0) { err(`subjects.${group} must be a non-empty array (leave the group out when there are none)`); continue; }
        list.forEach((x, i) => {
          if (!x || !isNonEmptyString(x.name) || !isNonEmptyString(x.code)) err(`subjects.${group}[${i}] needs a non-empty "name" and "code"`);
        });
      }
    }
  }
  if ('withheld' in e) {
    if (!Array.isArray(e.withheld) || !e.withheld.length || !e.withheld.every(w => WITHHOLDABLE.includes(w))) {
      err(`"withheld" must be a non-empty array of ${WITHHOLDABLE.join(', ')}`);
    } else {
      for (const w of e.withheld) if (w in e) err(`"${w}" is listed as withheld but is also shown`);
      if (!isNonEmptyString(e.note)) err('an entry that withholds a value must say why in "note"');
    }
  }
}

/**
 * Validate one entry. Pushes onto `out`.
 * @param {RequirementEntry} e @param {string} where @param {string} todayIso @param {Problem[]} out
 * @param {'list' | 'qualification'} [kind]  the category's kind (default 'list')
 * @param {{snippetsRequiredFrom?: string}} [opts]
 */
export function validateEntry(e, where, todayIso, out, kind = 'list', opts = {}) {
  const err = (/** @type {string} */ message) => out.push({ level: 'error', where, message });
  if (!e || typeof e !== 'object' || Array.isArray(e)) { err('entry must be an object'); return; }
  const allowed = [...COMMON_KEYS, ...(kind === 'qualification' ? QUAL_KEYS : LIST_KEYS)];
  for (const k of Object.keys(e)) if (!allowed.includes(k)) err(`unknown field "${k}"${kind === 'qualification' && LIST_KEYS.includes(k) ? ' (qualification categories use structured fields, not items/none/codes)' : ''}`);
  if (!STATUSES.includes(e.status)) { err(`status must be one of ${STATUSES.join(', ')} (got ${JSON.stringify(e.status)})`); return; }
  if ('note' in e && !isNonEmptyString(e.note)) err('"note" must be a non-empty string');
  if ('reviewFlag' in e && !isNonEmptyString(e.reviewFlag)) err('"reviewFlag" must be a non-empty string');

  if (e.status === 'unverified') {
    // An unverified entry may not look verified: no value, no source, no date.
    for (const k of ['items', 'none', 'sources', 'lastVerified', 'codes', 'withheld', 'sourceSnippet', ...QUAL_VALUE_KEYS]) {
      if (k in e) err(`unverified entries may not carry "${k}" — verify it (and set status) or remove it`);
    }
    if ('accepted' in e && e.accepted !== 'unknown') err('an unverified entry can only say accepted: "unknown"');
    if ('recorded' in e && !isNonEmptyString(e.recorded)) err('"recorded" must be a non-empty string');
    return;
  }

  if ('recorded' in e) err('"recorded" is only for unverified entries — the verified value goes in the entry itself');

  if (e.status === 'notApplicable') {
    if (kind !== 'qualification') err('notApplicable is only for qualification categories — a list category that lists nothing uses "none": true');
    if (e.accepted !== 'no') err('a notApplicable entry must say accepted: "no"');
    for (const k of ['items', 'none', 'codes', 'withheld', ...QUAL_VALUE_KEYS]) if (k in e) err(`a notApplicable entry may not carry "${k}"`);
    if (!isNonEmptyString(e.note)) err('a notApplicable entry must say why in "note"');
    validateProvenance(e, where, todayIso, out, opts.snippetsRequiredFrom);
    return;
  }

  // verified / partial
  if (kind === 'qualification') {
    if (e.accepted !== 'yes' && e.accepted !== 'unknown') err('a verified/partial qualification entry needs accepted: "yes" or "unknown" (use notApplicable when it is not an entry route)');
    if (!QUAL_VALUE_KEYS.some(k => k in e)) err(`a verified/partial qualification entry needs at least one of ${QUAL_VALUE_KEYS.join(', ')}`);
    validateQualificationFields(e, err);
  } else {
    const hasItems = 'items' in e, hasNone = 'none' in e;
    if (hasItems === hasNone) err('needs exactly one of "items" (the requirement as published) or "none": true (source lists none)');
    if (hasItems && !isNonEmptyStringArray(e.items)) err('"items" must be a non-empty array of strings');
    if (hasNone && e.none !== true) err('"none" must be true');
    if ('codes' in e && !(Array.isArray(e.codes) && e.codes.every(c => typeof c === 'string'))) err('"codes" must be an array of strings');
  }

  validateProvenance(e, where, todayIso, out, opts.snippetsRequiredFrom);
  if (e.status === 'partial' && !isNonEmptyString(e.note)) err('a partial entry must say what is unconfirmed in "note"');
}

/** Subject codes in one group of a qualification entry. @param {RequirementEntry} e @param {string} group */
const groupCodes = (e, group) => (/** @type {any} */ (e.subjects)?.[group] ?? []).map((/** @type {any} */ s) => s.code);

/**
 * Cross-check a qualification entry against the matching engine's copy
 * of the same values in data/courseRequirements.js. Until the engine
 * reads the cycle file, the two must say the same thing.
 * @param {'aLevel' | 'ib'} catId @param {RequirementEntry} e @param {any} course
 * @returns {string[]} disagreements
 */
export function engineDisagreements(catId, e, course) {
  /** @type {string[]} */
  const out = [];
  const g = course.grades ?? {};
  const fmt = (/** @type {unknown} */ v) => JSON.stringify(v ?? null);
  const withheld = e.withheld ?? [];

  if (e.status === 'notApplicable') {
    const held = catId === 'aLevel' ? g.aLevels : (g.ib ?? (g.ibHL?.length ? g.ibHL : null) ?? g.ibHLNote);
    if (held) out.push(`marked notApplicable but the engine holds ${catId === 'aLevel' ? 'an A-Level offer' : 'IB data'} ${fmt(held)} and will match students on it — update both`);
    return out;
  }
  if (e.status === 'unverified') return out;

  /** @param {string} field @param {unknown} shown @param {unknown} engine @param {string} engineName */
  const same = (field, shown, engine, engineName) => {
    const withheldHere = withheld.includes(/** @type {any} */ (field));
    if (withheldHere) {
      if (engine == null || engine === '') out.push(`"${field}" is listed as withheld but the engine holds no ${engineName}`);
      return;
    }
    if ((shown ?? null) !== (engine ?? null)) out.push(`${field} ${fmt(shown)} disagrees with courseRequirements.js ${engineName} ${fmt(engine)} — update both`);
  };
  /** @param {string} group @param {string[]} engine @param {string} engineName */
  const sameCodes = (group, engine, engineName) => {
    const listed = groupCodes(e, group);
    if (!sameSet(listed, engine)) out.push(`subjects.${group} ${fmt(listed)} disagree with courseRequirements.js ${engineName} ${fmt(engine)} — update both`);
  };

  if (catId === 'aLevel') {
    same('typicalOffer', e.typicalOffer, g.aLevels, 'grades.aLevels');
  } else {
    same('overallScore', e.overallScore, typeof g.ib === 'number' ? g.ib : null, 'grades.ib');
    // The IB note is display text the engine does not match on: a verified
    // note may be added where the engine holds none, but must not
    // contradict one it holds.
    if (g.ibHLNote != null || withheld.includes('detail')) same('detail', e.detail, g.ibHLNote, 'grades.ibHLNote');
    sameCodes('higherLevel', g.ibHL ?? [], 'grades.ibHL');
  }
  sameCodes('required', course.requirements?.essential ?? [], 'requirements.essential');
  sameCodes('preferred', course.requirements?.preferred ?? [], 'requirements.preferred');
  return out;
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
    for (const cat of config.categories) {
      if (cat.id in rec) validateEntry(rec[cat.id], at(cid, cat.id), today, out, cat.kind ?? 'list', { snippetsRequiredFrom: config.snippetsRequiredFrom });
    }

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
      for (const q of /** @type {const} */ (['aLevel', 'ib'])) {
        const e = rec[q];
        if (e && typeof e === 'object') for (const m of engineDisagreements(q, e, course)) err(at(cid, q), m);
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
  if ('snippetsRequiredFrom' in config && !isIsoDate(config.snippetsRequiredFrom ?? '')) err('snippetsRequiredFrom must be a YYYY-MM-DD date');
  for (const [cid, info] of Object.entries(config.cycles ?? {})) {
    if (!/^\d{4}$/.test(cid)) err(`cycle id ${JSON.stringify(cid)} must be a 4-digit entry year`);
    if (!info?.label || !info?.applicationPeriod) err(`cycle ${cid} needs label and applicationPeriod`);
  }
  const ids = (config.categories ?? []).map(c => c.id);
  if (!ids.length) err('no categories defined');
  if (new Set(ids).size !== ids.length) err('duplicate category ids');
  for (const c of config.categories ?? []) if (!c.id || !c.label) err('every category needs id and label');
  for (const c of config.categories ?? []) if ('kind' in c && c.kind !== 'list' && c.kind !== 'qualification') err(`category ${c.id}: kind must be "list" or "qualification"`);
  // The matching engine reads A-Level and IB; the cross-check needs both.
  for (const [id, label] of [['aLevel', 'A-Level'], ['ib', 'IB']]) {
    const c = (config.categories ?? []).find(x => x.id === id);
    if (!c) err(`the ${label} category ("${id}") is missing — the matching engine reads ${label} data, so the requirements must cover it`);
    else if (c.kind !== 'qualification') err(`category ${id} must have kind: "qualification"`);
  }
  return out;
}
