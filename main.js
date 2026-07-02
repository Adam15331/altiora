/* ═══════════════════════════════════════════════════════════════
 * Altiora — main.js
 *
 * Three modes:
 *   "check"   – pick subjects → instant GREEN / AMBER / RED classification
 *   "reverse" – search a degree → see required subjects per qualification system
 *   "plan"    – pick a subject area → see which subjects to take
 *
 * Data dependencies (loaded before this script):
 *   qualificationMappings  – data/qualificationMappings.js
 *   courses                – data/courseRequirements.js
 * ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Data load guard ───────────────────────────────────────────
 * Checked at parse time so init() and render functions can bail
 * immediately if a required data script failed to load.
 * ─────────────────────────────────────────────────────────────── */
const dataLoadError =
  typeof qualificationMappings === 'undefined' ||
  typeof courses               === 'undefined';

/* ─── State ─────────────────────────────────────────────────────
 * Single source of truth. Read everywhere; mutate only in named
 * handler functions so the render path stays predictable.
 * ─────────────────────────────────────────────────────────────── */
const state = {
  mode:               'strengths',
  checkSystem:        '',   // set from profile.qualificationSystem after onboarding
  reverseSystem:      '',
  planCategory:       '',
  planSystem:         '',
  selectedSubjects:   [],
  selectedTags:       new Set(),
  countryFilter:      'All',
  selectedCategories: new Set(),
  searchQuery:        '',
  resultSearch:       '',   // free-text filter on Check results (uni / course name)
  predictedGrade:     null,
  exploreField:       null,   // { category, name } when arriving from Start with Strengths
};

/* ─── Constants ─────────────────────────────────────────────────── */
const COUNTRY_FLAGS  = { UK:'🇬🇧', US:'🇺🇸', CA:'🇨🇦', SG:'🇸🇬', HK:'🇭🇰' };
const COUNTRY_LABELS = { UK:'UK',  US:'US',  CA:'Canada', SG:'Singapore', HK:'Hong Kong' };

// Minimum number of subjects required before results can show as GREEN.
// Below this threshold results are capped at AMBER — no university admits on 1-2 subjects alone.
const MIN_SUBJECTS = {
  UK_A_Level:   3,
  IB:           5,
  US_AP:        4,
  SG_A_Level:   3,
  HK_DSE:       6,
};

const CATEGORIES = [
  { id: 'medicine',      label: 'Medicine',            icon: '🏥' },
  { id: 'cs',           label: 'Computer Science',     icon: '💻' },
  { id: 'engineering',  label: 'Engineering',          icon: '⚙️' },
  { id: 'economics',    label: 'Economics & Finance',  icon: '📊' },
  { id: 'law',          label: 'Law',                  icon: '⚖️' },
  { id: 'business',     label: 'Business',             icon: '🏢' },
  { id: 'sciences',     label: 'Natural Sciences',     icon: '🔬' },
  { id: 'psychology',   label: 'Psychology & Social',  icon: '🧠' },
  { id: 'architecture', label: 'Architecture',         icon: '🏛️' },
  { id: 'mathematics',  label: 'Mathematics',           icon: '∑' },
];

const STATUS = {
  green: { label:'Strong match', badgeCls:'badge--success', icon:'✓', cardCls:'course-card--green' },
  amber: { label:'Possible',     badgeCls:'badge--warning', icon:'◑', cardCls:'course-card--amber' },
  red:   { label:'Out of reach',         badgeCls:'badge--error',   icon:'✗', cardCls:'course-card--red'   },
  grey:  { label:'Grade threshold high', badgeCls:'badge--grey',    icon:'◯', cardCls:'course-card--grey'  },
};
const STATUS_SORT = { green:0, amber:1, grey:2, red:3 };

const TIER_LABELS = {
  'world-top-10':     'World Top 10',
  'world-top-50':     'World Top 50',
  'world-top-100':    'World Top 100',
  'national-top-10':  'National Top 10',
  'national-top-25':  'National Top 25',
  'national-top-50':  'National Top 50',
  'national-leading': 'National University',
  'regional':         'Regional University',
};

const SYSTEM_GRADE_KEY = {
  UK_A_Level: 'aLevels',
  IB:         'ib',
  US_AP:      'ap',
  SG_A_Level: 'sgALevels',
  HK_DSE:     'hkDse',
};

const CATEGORY_LABEL_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

// Short display labels for universal tags used in IB HL chips
const HL_TAG_LABELS = {
  'Mathematics_Advanced': 'Maths HL',
  'Mathematics_Standard': 'Maths',
  'Chemistry':            'Chemistry',
  'Biology':              'Biology',
  'Physics':              'Physics',
  'Computer_Science':     'Computer Science',
  'Economics':            'Economics',
  'English':              'English',
  'History':              'History',
  // IB-specific long names
  'Mathematics: Analysis and Approaches HL':         'Maths AA HL',
  'Mathematics: Applications and Interpretation HL': 'Maths AI HL',
  'Mathematics: Analysis and Approaches SL':         'Maths AA SL',
  'Mathematics: Applications and Interpretation SL': 'Maths AI SL',
  'Computer Science HL':   'CS HL',
  'Economics HL':          'Econ HL',
  'Physics HL':            'Physics HL',
  'Chemistry HL':          'Chem HL',
  'Biology HL':            'Bio HL',
  'History HL':            'History HL',
  'Psychology HL':         'Psych HL',
  'Philosophy HL':         'Phil HL',
  'Business Management HL':'Business HL',
  'Visual Arts HL':        'Art HL',
};
function hlTagLabel(tag) {
  return HL_TAG_LABELS[tag] ?? tag.replace(/_/g, ' ');
}

/* ─── DOM shortcuts ──────────────────────────────────────────────── */
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ═══════════════════════════════════════════════════════════════
 * REVERSE-MAP UTILITIES
 * Build tag → [local subject names] per system; pick the best
 * representative name for display.
 * ═══════════════════════════════════════════════════════════════ */

const _rMapCache = {};

function getReverseMap(systemKey) {
  if (_rMapCache[systemKey]) return _rMapCache[systemKey];
  const src = qualificationMappings[systemKey]?.subjects ?? {};
  const map = {};
  for (const [name, tag] of Object.entries(src)) (map[tag] ??= []).push(name);
  _rMapCache[systemKey] = map;
  return map;
}

/**
 * Score subjects for display preference (higher = show first).
 *   2  – HL / H2 / AP  (standard advanced form)
 *   1  – neutral / no level marker
 *   0  – SL / H1
 *  -1  – "Further *"  (supplementary enrichment, not standalone)
 */
function subjectDisplayScore(name) {
  if (/\bFurther\b/.test(name))                                    return -1;
  if (/ HL$/.test(name) || /^H2 /.test(name) || /^AP /.test(name)) return  2;
  if (/ SL$/.test(name) || /^H1 /.test(name))                      return  0;
  return 1;
}

/**
 * Translate a universal tag to the best local subject name.
 * Sort: score DESC → length DESC (longer = more specific) → alpha ASC.
 */
function tagToLocal(tag, systemKey) {
  if (!systemKey) return readableTag(tag);
  const options = getReverseMap(systemKey)[tag];
  if (!options?.length) return readableTag(tag);
  return [...options].sort((a, b) => {
    const byScore = subjectDisplayScore(b) - subjectDisplayScore(a);
    if (byScore !== 0) return byScore;
    const byLen = b.length - a.length;
    return byLen !== 0 ? byLen : a.localeCompare(b);
  })[0];
}

// Qualifier words that describe a level/tier rather than the subject itself.
// When a tag ends with one of these, it's wrapped in parentheses for clarity.
const _TAG_QUALIFIERS = new Set(['Advanced', 'Standard', 'Higher', 'Basic', 'Core', 'Extended', 'Foundation', 'HL', 'SL']);

function readableTag(tag) {
  const parts = tag.split('_');
  const last  = parts[parts.length - 1];
  if (parts.length > 1 && _TAG_QUALIFIERS.has(last)) {
    return `${parts.slice(0, -1).join(' ')} (${last})`;
  }
  return parts.join(' ');
}

function humanTag(tag) { return tag.replace(/_/g, ' '); }

/* ─── Subject display normalisation (system + field aware) ───────
 * Two subtleties handled here, consistently across every screen:
 *  1) Maths variant — quantitative fields need the RIGOROUS maths in
 *     each system (IB Analysis & Approaches not Applications; AP Calc BC;
 *     SG H2; HK Extended Module), never the lighter applied variant.
 *  2) Maths levels — Mathematics_Standard/Advanced are two separate
 *     A-levels in the UK, but the SAME subject at two levels elsewhere
 *     (IB SL/HL, AP AB/BC, SG H1/H2, HK core/M2). They must never show
 *     as two subjects in a system where that is impossible.
 * ─────────────────────────────────────────────────────────────── */
const MATHS_STD = 'Mathematics_Standard';
const MATHS_ADV = 'Mathematics_Advanced';
const COLLAPSED_MATHS_LABEL = 'Mathematics (Advanced preferred)';

// Fields whose maths requirement must resolve to the rigorous variant.
const QUANTITATIVE_CATEGORIES = new Set(['engineering', 'cs', 'mathematics', 'sciences', 'economics']);
function isQuantitativeCategory(cat) { return QUANTITATIVE_CATEGORIES.has(cat); }

// Per-system maths subjects. `std` = standard level, `stdRigorous` =
// the variant a quantitative field needs at standard level, `adv` =
// advanced/rigorous level. `separate` = Advanced is a genuinely separate
// subject taken ALONGSIDE Standard (UK only); elsewhere the two are one
// subject at different levels and must collapse.
const MATHS_RESOLUTION = {
  UK_A_Level: { std: 'Mathematics', stdRigorous: 'Mathematics', adv: 'Further Mathematics', separate: true },
  IB:         { std: 'Mathematics: Analysis and Approaches SL', stdRigorous: 'Mathematics: Analysis and Approaches SL', adv: 'Mathematics: Analysis and Approaches HL', separate: false },
  US_AP:      { std: 'AP Calculus AB', stdRigorous: 'AP Calculus BC', adv: 'AP Calculus BC', separate: false },
  SG_A_Level: { std: 'H1 Mathematics', stdRigorous: 'H2 Mathematics', adv: 'H2 Mathematics', separate: false },
  HK_DSE:     { std: 'Mathematics Compulsory Part', stdRigorous: 'Mathematics Extended Part Module 2 (M2)', adv: 'Mathematics Extended Part Module 2 (M2)', separate: false },
};

// Does this system take Advanced maths as a separate subject (vs a level)?
function mathsAdvancedIsSeparate(system) {
  if (!system) return true;                 // generic: "Maths + Further Maths"
  return !!(MATHS_RESOLUTION[system]?.separate);
}

// Resolve a maths tag to a subject name for a system + quant context.
function mathsSubjectName(tag, system, isQuant) {
  if (!system) return tag === MATHS_ADV ? 'Further Mathematics' : 'Mathematics';
  const r = MATHS_RESOLUTION[system];
  if (!r) return tagToLocal(tag, system);
  if (tag === MATHS_ADV) return r.adv;
  return isQuant ? r.stdRigorous : r.std;
}

// Display label for a single subject tag, system + quant aware. Generic
// names (no HL/SL/AA/AI/H1-H2) when no system is selected.
function subjectTagLabel(tag, system, isQuant = false) {
  if (tag === MATHS_STD || tag === MATHS_ADV) return mathsSubjectName(tag, system, isQuant);
  if (system) return tagToLocal(tag, system);
  return readableTag(tag);
}

// Does a tag have a real subject in the selected system? Maths tags always
// resolve (MATHS_RESOLUTION); other tags must exist in the system's subject
// list — so we never recommend e.g. Psychology to a HK DSE student.
function tagExistsInSystem(tag, system) {
  if (!system) return true;
  if (tag === MATHS_STD || tag === MATHS_ADV) return true;
  return !!getReverseMap(system)[tag]?.length;
}

// Split a subject name into its base and level rank, generally across
// systems: IB "X SL/HL", Singapore "H1/H2/H3 X". Used to collapse the
// SAME base subject appearing at two levels in one list (impossible — a
// student takes a subject at one level). Distinct subjects (e.g. UK
// Mathematics vs Further Mathematics) have different bases and are kept.
function subjectBaseAndLevel(name) {
  let m = name.match(/^(.*\S)\s+(SL|HL)$/);
  if (m) return { base: m[1], rank: m[2] === 'HL' ? 2 : 1 };
  m = name.match(/^H([123])\s+(.*)$/);
  if (m) return { base: m[2], rank: Number(m[1]) };
  return { base: name, rank: 0 };
}

// Collapse any base subject that appears at multiple levels to a single
// entry, keeping the highest level. Order of first appearance preserved.
function collapseSameBaseLevels(labels) {
  const best = new Map();
  const order = [];
  for (const l of labels) {
    const { base, rank } = subjectBaseAndLevel(l);
    if (!best.has(base)) { best.set(base, { label: l, rank }); order.push(base); }
    else if (rank > best.get(base).rank) best.set(base, { label: l, rank });
  }
  return order.map(b => best.get(b).label);
}

// Labels for a REQUIREMENT LIST: the maths pair always becomes ONE entry
// (you take one maths choice). Subjects not offered in the system are
// dropped, and any base subject at two levels is collapsed.
function requirementLabels(tags, system, isQuant) {
  tags = tags.filter(t => tagExistsInSystem(t, system));
  const hasStd = tags.includes(MATHS_STD), hasAdv = tags.includes(MATHS_ADV);
  const out = [], seen = new Set();
  const add = l => { if (l && !seen.has(l)) { seen.add(l); out.push(l); } };
  let mathsDone = false;
  for (const t of tags) {
    if (t === MATHS_STD || t === MATHS_ADV) {
      if (mathsDone) continue;
      mathsDone = true;
      if (hasStd && hasAdv && mathsAdvancedIsSeparate(system)) {
        add(COLLAPSED_MATHS_LABEL);                               // "Mathematics (Advanced preferred)"
      } else {
        add(mathsSubjectName(hasAdv ? MATHS_ADV : MATHS_STD, system, isQuant));
      }
      continue;
    }
    add(subjectTagLabel(t, system, isQuant));
  }
  return collapseSameBaseLevels(out);
}

// Labels for a COMBINATION: the maths pair stays two subjects only where
// the system treats them as separate (UK); elsewhere it collapses to one.
// Subjects not offered in the system are dropped, and any base subject at
// two levels is collapsed — so a combo never shows the same subject twice.
function comboLabels(combo, system, isQuant) {
  combo = combo.filter(t => tagExistsInSystem(t, system));
  const hasStd = combo.includes(MATHS_STD), hasAdv = combo.includes(MATHS_ADV);
  const both = hasStd && hasAdv;
  const out = [], seen = new Set();
  const add = l => { if (l && !seen.has(l)) { seen.add(l); out.push(l); } };
  let mathsDone = false;
  for (const t of combo) {
    if (t === MATHS_STD || t === MATHS_ADV) {
      if (mathsDone) continue;
      mathsDone = true;
      if (both && mathsAdvancedIsSeparate(system)) {
        add(mathsSubjectName(MATHS_STD, system, isQuant));
        add(mathsSubjectName(MATHS_ADV, system, isQuant));
      } else {
        add(mathsSubjectName(both || hasAdv ? MATHS_ADV : MATHS_STD, system, isQuant));
      }
      continue;
    }
    add(subjectTagLabel(t, system, isQuant));
  }
  return collapseSameBaseLevels(out);
}

// For combination GENERATION: Advanced implies Standard in the matching
// logic, so a combo containing Advanced also carries Standard.
function normaliseComboTags(tags) {
  const out = [...tags];
  if (out.includes(MATHS_ADV) && !out.includes(MATHS_STD)) out.push(MATHS_STD);
  return [...new Set(out)];
}

/* ─── Field-level requirement aggregation ───────────────────────
 * What a TYPICAL course in a field needs — not the union of every
 * outlier. Maths (Standard/Advanced) is treated as ONE subject so its
 * level split doesn't fragment the share. Returns tag lists.
 *  core    – essential in a majority (>50%) of the field's courses
 *  helpful – appears (essential or preferred) in >50%, not core
 *  outliers- some courses have essential subjects outside the above
 *  poolTags- the meaningful subjects, used to build combinations
 * ─────────────────────────────────────────────────────────────── */
function fieldSubjectTags(category) {
  const cc = (typeof courses !== 'undefined' ? courses : []).filter(c => c.category === category);
  const n = cc.length || 1;

  const essCount = {}, anyCount = {};
  let mathsEss = 0, mathsAny = 0, advEss = 0, advAny = 0;
  cc.forEach(c => {
    const ess = c.requirements?.essential ?? [];
    const pref = c.requirements?.preferred ?? [];
    const anyAll = [...ess, ...pref];
    new Set(ess.filter(t => t !== MATHS_STD && t !== MATHS_ADV)).forEach(t => essCount[t] = (essCount[t] || 0) + 1);
    new Set(anyAll.filter(t => t !== MATHS_STD && t !== MATHS_ADV)).forEach(t => anyCount[t] = (anyCount[t] || 0) + 1);
    if (ess.includes(MATHS_STD) || ess.includes(MATHS_ADV)) mathsEss++;
    if (anyAll.includes(MATHS_STD) || anyAll.includes(MATHS_ADV)) mathsAny++;
    if (ess.includes(MATHS_ADV)) advEss++;
    if (anyAll.includes(MATHS_ADV)) advAny++;
  });

  const core = [], helpful = [];
  let outliers = false;

  // Maths placement (collapsed across levels).
  const mathsAdvanced = advEss / n > 0.7 || advAny / n > 0.5;
  if (mathsEss / n > 0.5) {
    core.push(MATHS_STD);
    if (advEss / n > 0.7) core.push(MATHS_ADV);
    else if (advAny / n > 0.5) helpful.push(MATHS_ADV);
  } else if (mathsAny / n > 0.5) {
    helpful.push(MATHS_STD);
    if (advAny / n > 0.5) helpful.push(MATHS_ADV);
  }

  // Non-maths subjects.
  new Set([...Object.keys(essCount), ...Object.keys(anyCount)]).forEach(t => {
    const essShare = (essCount[t] || 0) / n, anyShare = (anyCount[t] || 0) / n;
    if (essShare > 0.5) core.push(t);
    else if (anyShare > 0.5) helpful.push(t);
    else if ((essCount[t] || 0) > 0) outliers = true;
  });

  const byCount = (a, b) => (anyCount[b] ?? 0) - (anyCount[a] ?? 0);
  core.sort(byCount);
  helpful.sort(byCount);
  return { core, helpful, outliers, mathsAdvanced, poolTags: [...new Set([...core, ...helpful])] };
}

/* ─── Further Maths → Maths auto-imply ──────────────────────────
 * UK A-Level: "Further Mathematics" is a separate A-level that must
 * be taken alongside "Mathematics". Auto-select Maths when Further
 * Maths is chosen.
 * SG A-Level: "H2 Further Mathematics" requires "H2 Mathematics".
 * IB: not needed — HL and SL maths are mutually exclusive; the tag
 * engine already handles this via deriveTagsFromSubjects.
 * ─────────────────────────────────────────────────────────────── */
const MATHS_IMPLY = {
  UK_A_Level: { advanced: 'Further Mathematics',   standard: 'Mathematics'    },
  SG_A_Level: { advanced: 'H2 Further Mathematics', standard: 'H2 Mathematics' },
};

// IB mutual-exclusion groups.
// Each entry is { label, subjects[] }. When a user selects a subject that
// belongs to a group, any other already-selected subject in the same group
// is automatically deselected.
// Language B: each language is its own group so you can take French B + German B,
// but not French B HL + French B SL simultaneously.
const IB_MUTUAL_EXCLUSION_GROUPS = [
  {
    label: 'Mathematics',
    subjects: [
      'Mathematics: Analysis and Approaches HL',
      'Mathematics: Analysis and Approaches SL',
      'Mathematics: Applications and Interpretation HL',
      'Mathematics: Applications and Interpretation SL',
      'Mathematics HL',
      'Mathematics SL',
      'Mathematical Studies SL',
      'Further Mathematics HL',
    ],
  },
  {
    label: 'Language A',
    subjects: [
      'Language A: Literature HL',
      'Language A: Literature SL',
      'Language A: Language and Literature HL',
      'Language A: Language and Literature SL',
      'English A: Literature HL',
      'English A: Literature SL',
      'English A: Language and Literature HL',
      'English A: Language and Literature SL',
      'French A: Literature HL',
      'French A: Literature SL',
      'French A: Language and Literature HL',
      'French A: Language and Literature SL',
      'German A: Literature HL',
      'German A: Literature SL',
      'German A: Language and Literature HL',
      'German A: Language and Literature SL',
      'Spanish A: Literature HL',
      'Spanish A: Literature SL',
      'Spanish A: Language and Literature HL',
      'Spanish A: Language and Literature SL',
      'Mandarin A: Literature HL',
      'Mandarin A: Literature SL',
      'Mandarin A: Language and Literature HL',
      'Mandarin A: Language and Literature SL',
    ],
  },
  // Language B: one group per language (can mix French B + German B, but not HL + SL of same)
  { label: 'French B',   subjects: ['French B HL',   'French B SL']   },
  { label: 'German B',   subjects: ['German B HL',   'German B SL']   },
  { label: 'Spanish B',  subjects: ['Spanish B HL',  'Spanish B SL']  },
  { label: 'Mandarin B', subjects: ['Mandarin B HL', 'Mandarin B SL'] },
  { label: 'Chinese B',  subjects: ['Chinese B HL',  'Chinese B SL']  },
  // Sciences: same subject at different levels conflicts
  { label: 'Biology',   subjects: ['Biology HL',   'Biology SL']   },
  { label: 'Chemistry', subjects: ['Chemistry HL', 'Chemistry SL'] },
  { label: 'Physics',   subjects: ['Physics HL',   'Physics SL']   },
];

/* ═══════════════════════════════════════════════════════════════
 * TAG DERIVATION
 * ═══════════════════════════════════════════════════════════════ */

// Store selected subjects with their level information
let selectedSubjectsWithLevel = new Map(); // subjectName -> { tag, isHL }

function deriveTagsFromSubjects(subjects, systemKey) {
  const forward = qualificationMappings[systemKey]?.subjects ?? {};
  const tags = new Set();
  selectedSubjectsWithLevel.clear();

  for (const name of subjects) {
    const tag = forward[name];
    if (tag) {
      tags.add(tag);
      // Detect HL level for IB subjects
      const isHL = systemKey === 'IB' && (name.includes(' HL') || name.includes('Higher Level'));
      selectedSubjectsWithLevel.set(name, { tag, isHL });
    }
  }

  // Advanced maths always satisfies a standard maths requirement
  if (tags.has('Mathematics_Advanced')) tags.add('Mathematics_Standard');
  return tags;
}

/* ═══════════════════════════════════════════════════════════════
 * EMPTY STATE — MODE A SUGGESTIONS
 * ═══════════════════════════════════════════════════════════════ */

const EMPTY_SUGGESTIONS = {
  UK_A_Level: [
    { label: 'Maths + Chemistry + Biology',        subjects: ['Mathematics','Chemistry','Biology'] },
    { label: 'Maths + Further Maths + Physics',    subjects: ['Mathematics','Further Mathematics','Physics'] },
    { label: 'History + Economics + Politics',     subjects: ['History','Economics','Politics'] },
  ],
  IB: [
    { label: 'Maths AA HL + Chemistry HL + Biology HL',  subjects: ['Mathematics: Analysis and Approaches HL','Chemistry HL','Biology HL'] },
    { label: 'Maths AA HL + Physics HL + CS HL',         subjects: ['Mathematics: Analysis and Approaches HL','Physics HL','Computer Science HL'] },
    { label: 'History HL + Economics HL + Politics HL',  subjects: ['History HL','Economics HL','Global Politics HL'] },
  ],
  US_AP: [
    { label: 'Calc BC + Chemistry + Biology',            subjects: ['AP Calculus BC','AP Chemistry','AP Biology'] },
    { label: 'Calc BC + Physics C + CS A',               subjects: ['AP Calculus BC','AP Physics C: Mechanics','AP Computer Science A'] },
    { label: 'US History + Macroeconomics + English Lit',subjects: ['AP US History','AP Macroeconomics','AP English Literature and Composition'] },
  ],
  SG_A_Level: [
    { label: 'H2 Maths + H2 Chemistry + H2 Biology',        subjects: ['H2 Mathematics','H2 Chemistry','H2 Biology'] },
    { label: 'H2 Maths + H2 Physics + H2 Further Maths',    subjects: ['H2 Mathematics','H2 Physics','H2 Further Mathematics'] },
    { label: 'H2 Economics + H2 History + H2 Geography',    subjects: ['H2 Economics','H2 History','H2 Geography'] },
  ],
  HK_DSE: [
    { label: 'Maths + Chemistry + Biology',                  subjects: ['Mathematics Compulsory Part','Chemistry','Biology'] },
    { label: 'Maths M2 + Physics + Chemistry',               subjects: ['Mathematics Extended Part Module 2 (M2)','Physics','Chemistry'] },
    { label: 'Economics + History + Geography',              subjects: ['Economics','History','Geography'] },
  ],
};

let _subjectDebounce = null;
// Tracks whether Check results are currently on screen, so we smooth-scroll to
// them only on their first appearance after an empty state, not every toggle.
let _checkResultsSeen = false;

// Field-relevant combinations for the active field, translated to the
// selected system. Returns null if no field filter, no system, or none
// of the field's combinations are valid for that system.
function fieldEmptySuggestions(category, system) {
  const combos = FIELD_COMBO_TAGS[category];
  if (!combos || !system) return null;
  const isQuant = isQuantitativeCategory(category);
  const rmap = getReverseMap(system);
  const seen = new Set();
  const out = [];
  for (const tags of combos) {
    if (!tags.every(t => rmap[t]?.length)) continue;       // every subject must exist here
    // System/quant-aware labels (rigorous maths; one maths entry where
    // the system has levels rather than a separate Further Maths subject).
    const subjects = comboLabels(tags, system, isQuant);
    const key = [...subjects].sort().join('|');
    if (seen.has(key)) continue;                            // dedupe identical sets
    seen.add(key);
    out.push({ label: subjects.join(' + '), subjects });
  }
  return out.length ? out : null;
}

// AP admissions context for a field, derived from its US courses' apContext.
// AP has no fixed subject count — competitiveness is about how many rigorous,
// field-aligned APs you take. Returns the field-relevant APs and the typical
// competitive count range (min across tiers → recommended at the top schools).
function apFieldGuidance(category) {
  const us = courses.filter(c => c.country === 'US' && c.category === category && c.apContext);
  if (!us.length) return null;
  const subs = us[0].apContext.recommendedSubjects ?? [];
  const mins = us.map(c => c.apContext.minCompetitiveAPs).filter(n => typeof n === 'number');
  const recs = us.map(c => c.apContext.recommendedAPs).filter(n => typeof n === 'number');
  if (!mins.length) return null;
  return {
    subjects: subs,
    minLow:  Math.min(...mins),
    recHigh: Math.max(...(recs.length ? recs : mins)),
  };
}

// Shared AP guidance panel (Check empty-state + Subject Planner). Reframes AP
// away from the "pick N subjects" model: count matters, and the specific APs
// should align with the intended major. Informational — the student still
// selects their actual APs in the picker.
function apGuidancePanelHtml(category) {
  const g = category ? apFieldGuidance(category) : null;
  const fieldLabel = category ? (CATEGORY_LABEL_MAP[category] ?? category) : null;
  const countMsg = g
    ? `Competitive US applicants typically take <strong>${g.minLow}–${g.recHigh}+ APs</strong> aligned to their intended major — the most selective schools expect <strong>${g.recHigh}+</strong>.`
    : `There's no fixed number of APs. Competitive US applicants take many — often 7–12 — aligned to their intended major.`;
  const fieldLine = (g && fieldLabel && g.subjects.length)
    ? `<p class="ap-guidance__line">APs that align with <strong>${esc(fieldLabel)}</strong>:</p>`
    : '';
  const chips = (g && g.subjects.length)
    ? `<div class="ap-guidance__chips">${g.subjects.map(s => `<span class="ap-guidance__chip">${esc(s)}</span>`).join('')}</div>`
    : '';
  return `
    <div class="ap-guidance">
      <p class="ap-guidance__lead">🇺🇸 US admissions is holistic — but AP <em>rigour and count</em> are real factors. ${countMsg}</p>
      ${fieldLine}
      ${chips}
      <p class="ap-guidance__foot">Add more rigorous APs across subjects (maths, sciences, humanities) to strengthen your application — a handful of APs is rarely enough on its own for the most selective schools.</p>
    </div>`;
}

function renderCheckEmptyState() {
  const el = $('checkEmptyState');
  if (!el) return;
  const show = !!state.checkSystem && state.selectedSubjects.length === 0;
  el.classList.toggle('hidden', !show);
  if (!show) return;

  const ef = state.exploreField;

  // AP doesn't have a fixed subject count, so don't present "3-subject
  // combinations" as a complete answer. Show count + field-aligned guidance.
  if (state.checkSystem === 'US_AP') {
    const apCat = ef ? ef.category : null;
    const builtKey = `US_AP|${apCat ?? ''}`;
    if (el.dataset.builtFor === builtKey) return;
    el.dataset.builtFor = builtKey;
    el.innerHTML = `
      <div class="check-empty-state__inner">
        <div class="check-empty-state__icon" aria-hidden="true">🎯</div>
        <p class="check-empty-state__heading">Select your APs above to see matching courses</p>
        ${apGuidancePanelHtml(apCat)}
      </div>`;
    return;
  }

  const fieldSugg = ef ? fieldEmptySuggestions(ef.category, state.checkSystem) : null;
  // Rebuild when the system OR the active field changes.
  const builtKey = `${state.checkSystem}|${fieldSugg ? ef.category : ''}`;
  if (el.dataset.builtFor === builtKey) return;
  el.dataset.builtFor = builtKey;

  const suggestions = fieldSugg ?? (EMPTY_SUGGESTIONS[state.checkSystem] ?? EMPTY_SUGGESTIONS.UK_A_Level);
  const sysLabel = qualificationMappings[state.checkSystem]?.systemLabel ?? state.checkSystem;
  const subText = fieldSugg
    ? `Strong ${esc(sysLabel)} combinations for ${esc(ef.name)}:`
    : `Not sure where to start? Try one of these ${esc(sysLabel)} combinations:`;
  el.innerHTML = `
    <div class="check-empty-state__inner">
      <div class="check-empty-state__icon" aria-hidden="true">🎯</div>
      <p class="check-empty-state__heading">Select your subjects above to see matching courses</p>
      <p class="check-empty-state__sub">${subText}</p>
      <div class="check-empty-state__suggestions">
        ${suggestions.map(s =>
          `<button type="button" class="suggestion-btn" data-subjects="${esc(JSON.stringify(s.subjects))}">Try: ${esc(s.label)}</button>`
        ).join('')}
      </div>
    </div>
  `;
  el.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targets = JSON.parse(btn.dataset.subjects);
      $$('#subjectPicker input:checked').forEach(cb => { cb.checked = false; });
      $$('#subjectPicker input').forEach(cb => {
        if (targets.includes(cb.value)) cb.checked = true;
      });
      onSubjectToggle();
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
 * GRADE-AWARE HELPERS
 * ═══════════════════════════════════════════════════════════════ */

const A_LEVEL_RANK = { 'A*': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0 };
const AP_TO_LETTER  = { '5': 'A*', '4': 'A', '3': 'B', '2': 'C', '1': 'D' };
const DSE_RANK      = { '5**': 7, '5*': 6, '5': 5, '4': 4, '3': 3, '2': 2, '1': 1 };

function parseALevelGrades(str) {
  return (str ?? '').match(/A\*|[A-E]/g) ?? [];
}

function parseDseGrades(str) {
  return (str ?? '').match(/5\*\*|5\*|[1-5]/g) ?? [];
}

function isGradeAboveStudent(course, system, studentGrade) {
  if (!studentGrade) return false;
  if (system === 'UK_A_Level') {
    const gradeStr = course.grades?.aLevels;
    if (!gradeStr) return false;
    const grades = parseALevelGrades(gradeStr);
    const top3 = grades.slice(0, 3);
    if (studentGrade === 'A*') return false;
    if (studentGrade === 'A')  return top3.some(g => g === 'A*');
    if (studentGrade === 'B')  return top3.every(g => A_LEVEL_RANK[g] >= A_LEVEL_RANK['A']);
    if (studentGrade === 'C')  return top3.some(g => A_LEVEL_RANK[g] >= A_LEVEL_RANK['A']);
    if (studentGrade === 'D')  return top3.some(g => A_LEVEL_RANK[g] >= A_LEVEL_RANK['B']);
    return false;
  }
  if (system === 'IB') {
    // grades.ib is an integer points total (e.g. 39); US/holistic courses
    // and others without a published total have ib === null → not above.
    const ibVal = course.grades?.ib;
    if (ibVal == null) return false;
    const studentPts = parseInt(studentGrade, 10);
    if (isNaN(studentPts)) return false;
    const need = typeof ibVal === 'number'
      ? ibVal
      : parseInt(String(ibVal).match(/\d+/)?.[0], 10);
    if (isNaN(need)) return false;
    return studentPts < need;
  }
  if (system === 'US_AP') {
    const apStr = course.grades?.ap;
    if (!apStr) return false;
    const digits = apStr.match(/[1-5]/g);
    if (!digits?.length) return false;
    const minScore = Math.min(...digits.map(Number));
    const courseMinLetter = AP_TO_LETTER[String(minScore)];
    return A_LEVEL_RANK[studentGrade] < A_LEVEL_RANK[courseMinLetter];
  }
  if (system === 'SG_A_Level') {
    const sgStr = course.grades?.sgALevels;
    if (!sgStr) return false;
    const grades = parseALevelGrades(sgStr);
    if (!grades.length) return false;
    const minRank = Math.min(...grades.map(g => A_LEVEL_RANK[g] ?? 0));
    return A_LEVEL_RANK[studentGrade] < minRank;
  }
  if (system === 'HK_DSE') {
    const dseStr = course.grades?.hkDse;
    if (!dseStr) return false;
    const grades = parseDseGrades(dseStr);
    if (!grades.length) return false;
    const minRank = Math.min(...grades.map(g => DSE_RANK[g] ?? 0));
    return (DSE_RANK[studentGrade] ?? 0) < minRank;
  }
  return false;
}

// For a grey course (predicted grade below the typical offer), describe the
// gap as { have, need } strings in the active qualification system, e.g.
// { have: "A*", need: "A*A*A" } or { have: "37 points", need: "39 points" }.
function gradeGapInfo(course, system, studentGrade) {
  if (!studentGrade) return null;
  const need = course.grades?.[SYSTEM_GRADE_KEY[system]] ?? null;
  if (!need) return null;
  if (system === 'IB') return { have: `${studentGrade} points`, need: `${need} points` };
  return { have: String(studentGrade), need: String(need) };
}

const GRADE_CONVERSION_HINTS = {
  IB:         'IB 38 points ≈ A*AA at A-Level. Check university websites for specific conversion policies.',
  US_AP:      'AP 5 ≈ A* at A-Level. US universities use holistic review – grades are one factor.',
  SG_A_Level: 'Singapore A-Level grades are roughly equivalent to UK A-Levels. Confirm with each university.',
  HK_DSE:     'DSE 5** ≈ A*; 5 ≈ A. Conversions vary – always verify.',
};

function buildGradeInput(systemKey) {
  const section = $('gradeInputSection');
  if (!section) return;
  state.predictedGrade = null;
  if (!systemKey) { section.classList.add('hidden'); section.innerHTML = ''; return; }

  const tooltipText = "Grades affect which courses show as strong matches — it's a guide, not a hard filter.";
  const hint        = 'Affects which courses show as strong matches';

  // Rough cross-system conversion guidance (UK A-Level is the baseline, so
  // it has no hint). Always advise verifying with each university.
  const conversionHint = GRADE_CONVERSION_HINTS[systemKey]
    ? `<p class="grade-conversion-hint">${esc(GRADE_CONVERSION_HINTS[systemKey])}</p>`
    : '';

  const header = `
      <div class="grade-input-header">
        <span class="control-label">Your predicted grades</span>
        <span class="grade-input-tooltip" aria-label="${esc(tooltipText)}" tabindex="0" title="${esc(tooltipText)}">ⓘ</span>
        <span class="picker-hint-inline">${hint}</span>
      </div>`;
  // Leaving the input blank is itself "skip" → subject-only matching.
  const footer = `
      ${conversionHint}
      <p class="grade-input-help">Optional — leave blank to skip and match on subjects alone.</p>`;

  // Per-system grade body + a wiring callback. Everything else is shared.
  let bodyHtml = '';
  let wire     = null;

  if (systemKey === 'UK_A_Level') {
    bodyHtml = `
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeSelectALevel">Average predicted grade across your A-Level subjects</label>
        <div class="select-wrap">
          <select id="gradeSelectALevel" class="grade-select">
            <option value="">— Leave blank —</option>
            <option value="A*">A* (predicting mostly A*s)</option>
            <option value="A">A (predicting mostly As)</option>
            <option value="B">B (predicting mostly Bs)</option>
            <option value="C">C (predicting mostly Cs)</option>
            <option value="D">D (predicting mostly Ds)</option>
          </select>
        </div>
      </div>`;
    wire = () => wireSelectGrade('gradeSelectALevel');
  } else if (systemKey === 'IB') {
    bodyHtml = `
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeInputIB">Predicted IB total points (24–45)</label>
        <input type="number" id="gradeInputIB" class="grade-number-input" min="24" max="45" placeholder="e.g. 38" autocomplete="off"/>
      </div>`;
    wire = () => {
      $('gradeInputIB').addEventListener('input', e => {
        const v = parseInt(e.target.value, 10);
        state.predictedGrade = (!isNaN(v) && v >= 24 && v <= 45) ? String(v) : null;
        renderCheckResults();
      });
    };
  } else if (systemKey === 'US_AP') {
    bodyHtml = `
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeSelectAP">Average predicted AP score across your exams</label>
        <div class="select-wrap">
          <select id="gradeSelectAP" class="grade-select">
            <option value="">— Leave blank —</option>
            <option value="A*">5 (A*) — predicting mostly 5s</option>
            <option value="A">4 (A) — predicting mostly 4s</option>
            <option value="B">3 (B) — predicting mostly 3s</option>
            <option value="C">2 (C) — predicting mostly 2s</option>
            <option value="D">1 (D) — predicting mostly 1s</option>
          </select>
        </div>
      </div>`;
    wire = () => wireSelectGrade('gradeSelectAP');
  } else if (systemKey === 'SG_A_Level') {
    bodyHtml = `
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeSelectSG">Average predicted grade across your H2 subjects</label>
        <div class="select-wrap">
          <select id="gradeSelectSG" class="grade-select">
            <option value="">— Leave blank —</option>
            <option value="A">A — predicting mostly As</option>
            <option value="B">B — predicting mostly Bs</option>
            <option value="C">C — predicting mostly Cs</option>
            <option value="D">D — predicting mostly Ds</option>
            <option value="E">E — predicting mostly Es</option>
          </select>
        </div>
      </div>`;
    wire = () => wireSelectGrade('gradeSelectSG');
  } else if (systemKey === 'HK_DSE') {
    bodyHtml = `
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeSelectDSE">Average predicted level across your elective subjects</label>
        <div class="select-wrap">
          <select id="gradeSelectDSE" class="grade-select">
            <option value="">— Leave blank —</option>
            <option value="5**">5** — predicting mostly 5**s</option>
            <option value="5*">5* — predicting mostly 5*s</option>
            <option value="5">5 — predicting mostly 5s</option>
            <option value="4">4 — predicting mostly 4s</option>
            <option value="3">3 — predicting mostly 3s</option>
            <option value="2">2 — predicting mostly 2s</option>
            <option value="1">1 — predicting mostly 1s</option>
          </select>
        </div>
      </div>`;
    wire = () => wireSelectGrade('gradeSelectDSE');
  } else {
    section.classList.add('hidden');
    section.innerHTML = '';
    return;
  }

  section.innerHTML = header + bodyHtml + footer;
  section.classList.remove('hidden');
  wire();
}

// Shared wiring for the select-based grade inputs (all systems except IB).
// Leaving the select on its blank option = no grade = subject-only matching.
function wireSelectGrade(selectId) {
  $(selectId).addEventListener('change', e => {
    state.predictedGrade = e.target.value || null;
    renderCheckResults();
  });
}

/* ═══════════════════════════════════════════════════════════════
 * ELIGIBILITY ENGINE
 * ═══════════════════════════════════════════════════════════════ */

// ── Field-relevance core subjects ────────────────────────────────
// Holistic admissions (and minimal essential[] requirements) must NOT mean
// "everything matches everything". For every field there are CORE subjects a
// credible applicant is expected to have. Each entry is a list of GROUPS;
// a group is satisfied if the student has ANY tag in it. Tags cover all
// systems (e.g. AP US Government maps to 'Sociology', Calculus BC →
// Mathematics_Advanced, Calculus AB → Mathematics_Standard).
const MATHS_TAGS = [MATHS_STD, MATHS_ADV];
const CORE_FIELD_GROUPS = {
  mathematics:  [ MATHS_TAGS ],
  engineering:  [ MATHS_TAGS, ['Physics'] ],
  cs:           [ MATHS_TAGS, ['Computer_Science', 'Physics'] ],
  sciences:     [ ['Chemistry', 'Biology', 'Physics', ...MATHS_TAGS] ],
  medicine:     [ ['Chemistry'], ['Biology'] ],
  economics:    [ [...MATHS_TAGS, 'Statistics', 'Economics'] ],
  business:     [ [...MATHS_TAGS, 'Statistics', 'Economics', 'Business'] ],
  law:          [ ['English', 'English_Language', 'History', 'Politics', 'Philosophy', 'Sociology'] ],
  psychology:   [ ['Psychology', 'Biology', 'Chemistry', 'Physics', ...MATHS_TAGS, 'Statistics'] ],
  architecture: [ [...MATHS_TAGS, 'Art_Design', 'Physics'] ],
};

// Field-tailored reason shown when a course is demoted for lacking core subjects.
const FIELD_CORE_REASON = {
  mathematics:  'Maths degrees expect strong calculus preparation.',
  engineering:  'Engineering expects calculus and physics.',
  cs:           'Computer Science expects calculus and a computing or physics background.',
  sciences:     'Science courses expect relevant sciences (e.g. biology, chemistry or physics).',
  medicine:     'Medicine-track courses expect biology and chemistry.',
  economics:    'Economics expects strong quantitative preparation (calculus or statistics).',
  business:     'Business courses expect quantitative preparation (calculus or statistics).',
  law:          'Law-track courses expect strong humanities (e.g. English, history or government).',
  psychology:   'Psychology expects relevant science or quantitative subjects.',
  architecture: 'Architecture expects maths and a design or art subject.',
};

// How many of a field's core subject GROUPS the student satisfies.
function fieldRelevance(category, userTags) {
  const groups = CORE_FIELD_GROUPS[category];
  if (!groups || !groups.length) return null;
  let satisfied = 0;
  for (const g of groups) if (g.some(t => userTags.has(t))) satisfied++;
  return { satisfied, total: groups.length, category };
}

function classify(course, userTags) {
  const { essential = [], preferred = [] } = course.requirements;
  const missingEssential = essential.filter(t => !userTags.has(t));
  if (missingEssential.length) return { status:'red', missingEssential, missingPreferred:[] };
  const missingPreferred = preferred.filter(t => !userTags.has(t));
  let status = missingPreferred.length ? 'amber' : 'green';

  // Field-relevance guard: only when the course didn't gate this student out
  // on subjects (base GREEN). A course with no hard subject requirements must
  // still require the field's CORE subjects before counting as a STRONG match
  // — otherwise holistic/empty-requirement courses (e.g. US) match everyone.
  if (status === 'green') {
    const fr = fieldRelevance(course.category, userTags);
    if (fr && fr.satisfied < fr.total) {
      // None of the field's core subjects → weak (not a match); some but not
      // all → possible. Never strong without the expected core preparation.
      return {
        status: fr.satisfied === 0 ? 'red' : 'amber',
        missingEssential: [],
        missingPreferred,
        fieldCore: fr,
      };
    }
  }
  return { status, missingEssential:[], missingPreferred };
}

/* ═══════════════════════════════════════════════════════════════
 * TOAST NOTIFICATION
 * ═══════════════════════════════════════════════════════════════ */

let _toastTimer = null;

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('toast--visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('toast--visible'), 2400);
}

/* ═══════════════════════════════════════════════════════════════
 * LOADING SPINNER
 * ═══════════════════════════════════════════════════════════════ */

const SPINNER_MIN_MS = 150;
let _spinnerEl    = null;
let _spinnerStart = 0;
let _spinnerTimer = null;

// Inserts a spinner as the element immediately before containerId in the DOM.
// Placing it outside the container means container.innerHTML = '' won't destroy it.
function showLoadingSpinner(containerId) {
  clearTimeout(_spinnerTimer);
  _spinnerStart = Date.now();
  if (_spinnerEl) return;           // already visible — just reset the timer above
  _spinnerEl = document.createElement('div');
  _spinnerEl.className = 'loading-spinner';
  _spinnerEl.setAttribute('aria-hidden', 'true');
  $(containerId)?.before(_spinnerEl);
}

function hideLoadingSpinner() {
  if (!_spinnerEl) return;
  const remaining = SPINNER_MIN_MS - (Date.now() - _spinnerStart);
  clearTimeout(_spinnerTimer);
  if (remaining > 0) {
    _spinnerTimer = setTimeout(() => { _spinnerEl?.remove(); _spinnerEl = null; }, remaining);
  } else {
    _spinnerEl.remove();
    _spinnerEl = null;
  }
}

/* ═══════════════════════════════════════════════════════════════
 * MODE TOGGLE
 * ═══════════════════════════════════════════════════════════════ */

function switchMode(mode) {
  state.mode = mode;
  logEvent('mode_switch', { mode });

  // Highlight the active tool in the stage sub-nav
  $$('.stage-tool').forEach(btn => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('stage-tool--active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });

  $('panel-check')             .classList.toggle('hidden', mode !== 'check');
  $('panel-reverse')           .classList.toggle('hidden', mode !== 'reverse');
  $('panel-plan')              .classList.toggle('hidden', mode !== 'plan');
  $('panel-strengths')         .classList.toggle('hidden', mode !== 'strengths');
  $('panel-applying')          .classList.toggle('hidden', mode !== 'applying');
  $('panel-shortlist')         .classList.toggle('hidden', mode !== 'shortlist');
  $('panel-home')              .classList.toggle('hidden', mode !== 'home');
  $('panel-field-overview')    .classList.toggle('hidden', mode !== 'field-overview');

  // The shortlist and home are cross-stage views, not stage tools —
  // highlight their own controls rather than a stage-tool button.
  $('shortlistLink')?.classList.toggle('shortlist-link--active', mode === 'shortlist');
  $('homeLink')?.classList.toggle('home-link--active', mode === 'home');

  if (mode === 'strengths' && $('strengthsGrid').children.length === 0) {
    renderStrengthsGrid();
  }
  if (mode === 'plan') {
    // Candidate fields pinned in Stage 1 arrive pre-selected: render on entry
    // (renderPlanResults syncs the grid and no-ops when nothing is selected).
    renderPlanResults();
  }
  if (mode === 'applying') {
    renderApplyingPanel();
  }
  if (mode === 'shortlist') {
    renderShortlist();
  }
  if (mode === 'home') {
    renderWorkspaceHome();
  }
}

/* ═══════════════════════════════════════════════════════════════
 * JOURNEY STAGES
 * Each stage has one PRIMARY tool (shown by default) plus SECONDARY
 * tools surfaced as lighter sub-nav links — replacing the old bar of
 * co-equal tabs. The stage is persisted via AltioraState.
 * ═══════════════════════════════════════════════════════════════ */

const STAGES = {
  exploring: { name: 'Exploring options',          primary: 'strengths', secondary: ['plan'] },
  choosing:  { name: 'Choosing my subjects',       primary: 'plan',      secondary: ['check'] },
  building:  { name: 'Building my university list', primary: 'check',     secondary: ['reverse'] },
  applying:  { name: 'Applying',                    primary: 'applying',  secondary: [] },
};

const MODE_LABELS = {
  strengths:            'Start with Strengths',
  plan:                 'Subject Planner',
  reverse:              'Course Finder',
  check:                'Check Combination',
  applying:             'Application Tools',
};

const DEFAULT_STAGE = 'exploring';

// Short labels for the qualification system indicator/menu. The system is a
// first-class profile property (set once in onboarding) that drives every
// system-dependent display — never silently assumed per tool.
const SYSTEM_SHORT_LABELS = {
  UK_A_Level: 'A-Levels',
  IB:         'IB',
  US_AP:      'US APs',
  SG_A_Level: 'Singapore A-Levels',
  HK_DSE:     'Hong Kong DSE',
};

// Stage chosen during onboarding, held until the system step completes.
let _pendingStage = null;

// Show the full-screen stage-selection screen (onboarding / re-pick).
function showStageSelect() {
  closeStageMenu();
  $('workspace').classList.add('hidden');
  $('systemSelect').classList.add('hidden');
  $('stageSelect').classList.remove('hidden');
}

// Show the full-screen qualification-system selection screen (onboarding /
// the one-time prompt for old saves missing a system).
function showSystemSelect() {
  closeStageMenu();
  $('workspace').classList.add('hidden');
  $('stageSelect').classList.add('hidden');
  $('systemSelect').classList.remove('hidden');
}

// Reveal the workspace and set up the stage chrome (indicator + sub-nav)
// for a stage, without choosing which view to show.
function applyStageChrome(stage) {
  if (!STAGES[stage]) stage = DEFAULT_STAGE;
  $('stageSelect').classList.add('hidden');
  $('systemSelect').classList.add('hidden');
  $('workspace').classList.remove('hidden');
  closeStageMenu();
  closeSystemMenu();
  $('stageIndicatorName').textContent = STAGES[stage].name;
  $$('#stageMenu .stage-menu__item').forEach(item =>
    item.classList.toggle('stage-menu__item--current', item.dataset.stage === stage)
  );
  updateSystemIndicator(AltioraState.getProfile().qualificationSystem);
  renderStageToolNav(stage);
}

// Reflect the active system in the global indicator + menu.
function updateSystemIndicator(sys) {
  const el = $('systemIndicatorName');
  if (el) el.textContent = SYSTEM_SHORT_LABELS[sys] ?? '—';
  $$('#systemMenu .stage-menu__item').forEach(item =>
    item.classList.toggle('stage-menu__item--current', item.dataset.system === sys)
  );
}

// Route into a stage and open its primary tool (resume / fresh entry).
function routeToStage(stage) {
  if (!STAGES[stage]) stage = DEFAULT_STAGE;
  applyStageChrome(stage);
  switchMode(STAGES[stage].primary);
  logEvent('stage_route', { stage });
}

// Returning-user landing: workspace home for the saved stage.
function showWorkspaceHome() {
  const stage = AltioraState.getProfile().stage || DEFAULT_STAGE;
  applyStageChrome(stage);
  switchMode('home');
  logEvent('workspace_home', { stage });
}

// The "Altiora" wordmark is the single home control (replacing the old house
// icon + "← Home" link). Safe from any state, including onboarding where the
// workspace isn't built yet.
function goHome() {
  const onboarded = AltioraState.getState().meta.hasOnboarded;
  const hasSystem = !!AltioraState.getProfile().qualificationSystem;
  if (onboarded && hasSystem)      showWorkspaceHome();   // → workspace dashboard
  else if (onboarded)              showSystemSelect();    // old save, no system yet
  else                             showStageSelect();     // still onboarding
}

// Persist the chosen stage, then route there. Entering ANY stage requires a
// qualification system; if none is set yet (new user, or the homepage CTA),
// divert to the system step first and resume once it's chosen.
function enterStage(stage) {
  if (!STAGES[stage]) stage = DEFAULT_STAGE;
  AltioraState.setStage(stage);
  logEvent('stage_select', { stage });
  const sys = AltioraState.getProfile().qualificationSystem;
  if (!sys) { _pendingStage = stage; showSystemSelect(); return; }
  AltioraState.setOnboarded(true);
  routeToStage(stage);
}

// Onboarding system pick (or the one-time prompt for old saves). Stores the
// system, applies it everywhere, marks onboarded, then continues the journey.
function chooseSystem(sys) {
  if (!qualificationMappings[sys]) return;
  AltioraState.setProfile({ qualificationSystem: sys });
  applyProfileSystem(sys);
  AltioraState.setOnboarded(true);
  updateSystemIndicator(sys);
  logEvent('system_select', { system: sys });
  const stage = _pendingStage || AltioraState.getProfile().stage || DEFAULT_STAGE;
  if (_pendingStage) { _pendingStage = null; routeToStage(stage); }
  else { _isReturningUser = true; applyStageChrome(stage); switchMode('home'); } // returning user who lacked a system
}

// The single global control: change the qualification system everywhere.
// Persists to the profile, re-applies to every tool, and re-renders the
// current view in the new system.
function changeSystem(sys) {
  if (!qualificationMappings[sys] || sys === AltioraState.getProfile().qualificationSystem) {
    closeSystemMenu(); return;
  }
  AltioraState.setProfile({ qualificationSystem: sys });
  applyProfileSystem(sys);
  updateSystemIndicator(sys);
  closeSystemMenu();
  logEvent('system_change', { system: sys });
  rerenderCurrentView();
  showToast(`Now showing everything in ${SYSTEM_SHORT_LABELS[sys] ?? sys}`);
}

// Apply the profile system to all tool state + dropdowns and rebuild the
// (system-specific) subject picker. Does NOT persist or wipe profile.subjects.
function applyProfileSystem(sys) {
  if (!qualificationMappings[sys]) return;
  state.checkSystem   = sys;
  state.reverseSystem = sys;
  state.planSystem    = sys;
  state.selectedSubjects = [];
  state.selectedTags     = new Set();
  state.predictedGrade   = null;
  selectedSubjectsWithLevel.clear();
  ['checkSystemSelect', 'reverseSystemSelect', 'planSystemSelect'].forEach(id => {
    const el = $(id); if (el) el.value = sys;
  });
  buildSubjectPicker(sys);                 // builds the subject picker + grade input
  $('checkResultsSection')?.classList.add('hidden');
  const emptyEl = $('checkEmptyState');
  if (emptyEl) delete emptyEl.dataset.builtFor;
}

// Re-render whatever view is currently active (after a system change).
function rerenderCurrentView() {
  switch (state.mode) {
    case 'check':   renderCheckEmptyState(); if (state.selectedSubjects.length) renderCheckResults(); break;
    case 'plan':    renderPlanResults(); break;   // guards internally on selected fields
    case 'reverse': if (state.searchQuery) renderReverseResults(); break;
    case 'field-overview': if (state.exploreField?.fieldId) renderFieldOverview(state.exploreField.fieldId); break;
    case 'home':     renderWorkspaceHome(); break;
    case 'applying': renderApplyingPanel(); break;
    // strengths: system-agnostic grid — nothing to re-render
  }
}

/* ─── System indicator dropdown (global system control) ────────── */
function openSystemMenu() {
  $('systemMenu')?.classList.remove('hidden');
  $('systemIndicatorBtn')?.setAttribute('aria-expanded', 'true');
}
function closeSystemMenu() {
  $('systemMenu')?.classList.add('hidden');
  $('systemIndicatorBtn')?.setAttribute('aria-expanded', 'false');
}
function toggleSystemMenu() {
  if ($('systemMenu')?.classList.contains('hidden')) openSystemMenu();
  else closeSystemMenu();
}

// Build the per-stage tool sub-nav: primary tool front and centre,
// secondary tools as lighter links. Every tool is free.
function renderStageToolNav(stage) {
  if (!STAGES[stage]) stage = DEFAULT_STAGE;
  const cfg = STAGES[stage];
  const nav = $('stageToolNav');
  if (!nav) return;

  const tools = [cfg.primary, ...cfg.secondary];
  nav.innerHTML = tools.map((mode, i) => {
    const cls = `stage-tool${i === 0 ? ' stage-tool--primary' : ''}`;
    return `<button class="${cls}" data-mode="${mode}">${esc(MODE_LABELS[mode] || mode)}</button>`;
  }).join('');

  $$('#stageToolNav .stage-tool').forEach(btn =>
    btn.addEventListener('click', () => switchMode(btn.dataset.mode))
  );
}

// Minimal, honest Applying view: the saved shortlist + a what's-next
// checklist derived from it + an intentional roadmap note. No dead end.
function renderApplyingPanel() {
  const panel = $('panel-applying');
  if (!panel) return;
  const ids = (typeof AltioraState !== 'undefined') ? AltioraState.getShortlist() : [];
  const savedCourses = ids
    .map(id => (typeof courses !== 'undefined') ? courses.find(c => c.id === id) : null)
    .filter(Boolean);

  const roadmap = `
    <div class="applying-note" role="note">
      <p><strong>What's coming.</strong> More application tools — personal statement help,
      interview prep, and deadline tracking — are on the way. For now, use your shortlist to
      keep your applications organised.</p>
    </div>`;

  if (!savedCourses.length) {
    panel.innerHTML = `
      <div class="applying">
        <header class="applying__header">
          <h1 class="applying__title">Applying</h1>
          <p class="applying__sub">Save courses you're applying to, and we'll help you keep them organised here.</p>
        </header>
        <div class="applying-empty">
          <p>Your shortlist is empty. Save the courses you're applying to, and they'll show up here with a checklist of what's next.</p>
          <button class="home-next__btn home-next__btn--primary" data-go-applying>Find courses to apply to →</button>
        </div>
        ${roadmap}
      </div>`;
    panel.querySelector('[data-go-applying]')?.addEventListener('click', () => switchMode('check'));
    return;
  }

  // Admission tests required across the saved courses (deduped), ordered by
  // when registration typically opens — the order the student must act in.
  const tests = [...new Set(savedCourses.flatMap(c => Array.isArray(c.admissionTests) ? c.admissionTests : []))];
  const testInfoFor = t => (typeof admissionTestInfo !== 'undefined') ? admissionTestInfo[t] : null;
  tests.sort((a, b) => (testInfoFor(a)?.regOpensMonth ?? 98) - (testInfoFor(b)?.regOpensMonth ?? 98) || a.localeCompare(b));

  const testItems = tests.map(t => {
    const info = testInfoFor(t);
    if (!info) {
      return `<li><strong>${esc(t)}</strong> — check the official site for registration and test dates.</li>`;
    }
    return `<li>
      <strong>${esc(info.name)}</strong> <span class="applying-test-full">(${esc(info.fullName)})</span> —
      registration ${esc(info.typicalRegistrationWindow)}; test ${esc(info.typicalTestWindow)}.
      <a class="applying-test-link" href="${esc(info.officialUrl)}" target="_blank" rel="noopener noreferrer">Official site →</a>
      ${info.notes ? `<span class="applying-test-note">${esc(info.notes)}</span>` : ''}
    </li>`;
  }).join('');

  const testsSection = tests.length
    ? `<li><strong>Register for your admission tests</strong> — in the order registration opens:
         <ul class="applying-test-list">${testItems}</ul></li>`
    : `<li><strong>No admission tests</strong> required across your saved courses.</li>`;

  panel.innerHTML = `
    <div class="applying">
      <header class="applying__header">
        <h1 class="applying__title">Applying</h1>
        <p class="applying__sub">Your shortlist: <strong>${savedCourses.length}</strong> course${savedCourses.length === 1 ? '' : 's'}.</p>
      </header>

      <section class="applying-section">
        <h2 class="applying-section__head">What's next</h2>
        <ul class="applying-checklist">
          ${testsSection}
          <li>Check <strong>UCAS</strong> and the universities' own deadlines for each of your courses.</li>
          <li>Make sure your personal statement reflects these courses.</li>
        </ul>
      </section>

      <section class="applying-section">
        <h2 class="applying-section__head">Your shortlist</h2>
        <div id="applyingShortlistGrid" class="results-group__grid"></div>
        <button class="home-card__link" data-go-shortlist>View full shortlist →</button>
      </section>

      ${roadmap}
    </div>`;

  const studentTags = (state.selectedTags && state.selectedTags.size) ? state.selectedTags : tagsFromProfile();
  const hasSubjects = studentTags.size > 0;
  const grid = panel.querySelector('#applyingShortlistGrid');
  savedCourses.forEach(c => grid.appendChild(buildShortlistCard(c, studentTags, hasSubjects)));
  panel.querySelector('[data-go-shortlist]')?.addEventListener('click', () => switchMode('shortlist'));
}

/* ─── Stage indicator dropdown (switch stage anytime) ──────────── */
function openStageMenu() {
  $('stageMenu')?.classList.remove('hidden');
  $('stageIndicatorBtn')?.setAttribute('aria-expanded', 'true');
}
function closeStageMenu() {
  $('stageMenu')?.classList.add('hidden');
  $('stageIndicatorBtn')?.setAttribute('aria-expanded', 'false');
}
function toggleStageMenu() {
  if ($('stageMenu')?.classList.contains('hidden')) openStageMenu();
  else closeStageMenu();
}

/* ═══════════════════════════════════════════════════════════════
 * SAVED SHORTLIST
 * Save/bookmark buttons on course cards toggle membership in the
 * AltioraState shortlist (persisted to localStorage). The shortlist
 * view reuses the card visual system and shows live insights.
 * ═══════════════════════════════════════════════════════════════ */

const ICON_BOOKMARK_OUTLINE = `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5h10a1 1 0 0 1 1 1V17l-6-3.5L4 17V4.5a1 1 0 0 1 1-1z"/></svg>`;
const ICON_BOOKMARK_FILLED  = `<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5h10a1 1 0 0 1 1 1V17l-6-3.5L4 17V4.5a1 1 0 0 1 1-1z"/></svg>`;

// HTML for a save/bookmark toggle reflecting current shortlist state.
function saveButtonHtml(courseId) {
  const saved = AltioraState.isInShortlist(courseId);
  return `<button class="save-btn${saved ? ' save-btn--saved' : ''}" type="button"
      data-save-course="${esc(courseId)}" aria-pressed="${saved}"
      aria-label="${saved ? 'Remove from shortlist' : 'Save to shortlist'}">
      <span class="save-btn__icon" aria-hidden="true">${saved ? ICON_BOOKMARK_FILLED : ICON_BOOKMARK_OUTLINE}</span>
      <span class="save-btn__label">${saved ? 'Saved' : 'Save'}</span>
    </button>`;
}

function setSaveButtonState(btn, saved) {
  btn.classList.toggle('save-btn--saved', saved);
  btn.setAttribute('aria-pressed', String(saved));
  btn.setAttribute('aria-label', saved ? 'Remove from shortlist' : 'Save to shortlist');
  const icon  = btn.querySelector('.save-btn__icon');
  const label = btn.querySelector('.save-btn__label');
  if (icon)  icon.innerHTML  = saved ? ICON_BOOKMARK_FILLED : ICON_BOOKMARK_OUTLINE;
  if (label) label.textContent = saved ? 'Saved' : 'Save';
}

// Course ids are simple slugs ([a-z0-9-]), so they are safe to embed in
// an attribute selector without escaping. Updates every visible button
// for the course (a course can appear in more than one place).
function syncSaveButtons(courseId) {
  const saved = AltioraState.isInShortlist(courseId);
  document.querySelectorAll(`.save-btn[data-save-course="${courseId}"]`)
    .forEach(btn => setSaveButtonState(btn, saved));
}

// Toggle a course in the shortlist and keep all dependent UI in sync.
function toggleShortlist(courseId) {
  const willSave = !AltioraState.isInShortlist(courseId);
  if (willSave) {
    AltioraState.addToShortlist(courseId);
    showToast('Saved to your shortlist');
  } else {
    AltioraState.removeFromShortlist(courseId);
    showToast('Removed from your shortlist');
  }
  logEvent(willSave ? 'shortlist_add' : 'shortlist_remove', { courseId });
  syncSaveButtons(courseId);
  updateShortlistCount();
  if (state.mode === 'shortlist') renderShortlist();
  if (state.mode === 'applying')  renderApplyingPanel();
}

// Attach the click handler to a save button inside a freshly-built card.
function wireSaveButton(cardEl) {
  const btn = cardEl.querySelector('.save-btn[data-save-course]');
  if (!btn) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    toggleShortlist(btn.dataset.saveCourse);
  });
}

// Update the "My Shortlist (n)" count in the stage bar.
function updateShortlistCount() {
  const el = $('shortlistCount');
  if (el) el.textContent = String(AltioraState.getShortlist().length);
}

/* ─── Shortlist view ──────────────────────────────────────────── */

// Download the saved courses as a CSV file (client-side, no backend).
function exportShortlistToCSV() {
  const saved = AltioraState.getShortlist().map(id => courses.find(c => c.id === id)).filter(Boolean);
  if (!saved.length) { showToast('No saved courses to export'); return; }

  const headers = ['Course Name', 'University', 'Country', 'Degree Level', 'Category', 'Admission Tests', 'Typical Grades'];
  const cell = v => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const gradesOf = c => {
    const parts = [];
    if (c.grades?.aLevels) parts.push(`A-Level ${c.grades.aLevels}`);
    if (typeof c.grades?.ib === 'number') parts.push(`IB ${c.grades.ib}`);
    if (c.grades?.sgALevels) parts.push(`SG ${c.grades.sgALevels}`);
    if (c.grades?.hkDse) parts.push(`DSE ${c.grades.hkDse}`);
    // US: holistic, no grade cutoff — give the indicative admitted range.
    if (c.country === 'US' && c.usAdmissions) {
      const r = usAdmitRange(c.usAdmissions);
      parts.push(r ? `${r} (indicative)` : usAdmitPolicyLabel(c.usAdmissions.test));
    }
    return parts.join('; ');
  };

  const rows = saved.map(c => [
    c.name,
    c.university,
    COUNTRY_LABELS[c.country] ?? c.country,
    c.degreeLevel ?? '',
    CATEGORY_LABEL_MAP[c.category] ?? c.category,
    Array.isArray(c.admissionTests) ? c.admissionTests.join('; ') : '',
    gradesOf(c),
  ].map(cell).join(','));

  // Leading BOM so Excel reads UTF-8 (and the ≈/£ etc.) correctly.
  const csv  = '﻿' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'altiora-shortlist.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  logEvent('shortlist_export_csv', { count: saved.length });
}

// Pure tag derivation from the saved profile (subjects + system). Unlike
// deriveTagsFromSubjects it has NO side effects, so it's safe to call when
// rendering the shortlist without disturbing live Check Combination state.
function tagsFromProfile() {
  const tags = new Set();
  if (typeof AltioraState === 'undefined') return tags;
  const p = AltioraState.getProfile();
  const forward = qualificationMappings[p.qualificationSystem]?.subjects ?? {};
  (Array.isArray(p.subjects) ? p.subjects : []).forEach(name => {
    const t = forward[name];
    if (t) tags.add(t);
  });
  return tags;
}

function renderShortlist() {
  const panel = $('panel-shortlist');
  if (!panel) return;

  const ids   = AltioraState.getShortlist();
  const saved = ids.map(id => courses.find(c => c.id === id)).filter(Boolean);

  if (!saved.length) {
    panel.innerHTML = `
      <div class="empty-state shortlist-empty">
        <div class="empty-state__icon">🔖</div>
        <p>You haven't saved any courses yet.</p>
        <p class="mt-8">When you find courses you're interested in, save them here to build your list.</p>
      </div>`;
    return;
  }

  panel.innerHTML =
    `<div class="shortlist-toolbar">
       <button id="exportCsvBtn" class="export-csv-btn" type="button">⬇ Export CSV</button>
     </div>`
    + buildShortlistInsightsHtml(saved)
    + `<div id="shortlistGroups"></div>`;
  panel.querySelector('#exportCsvBtn')?.addEventListener('click', exportShortlistToCSV);

  // Student's subject tags for the match badge: prefer the live Check
  // Combination selection, else fall back to the saved profile (pure
  // derivation — never touches the live selectedSubjectsWithLevel state).
  const studentTags = (state.selectedTags && state.selectedTags.size)
    ? state.selectedTags
    : tagsFromProfile();
  const hasSubjects = studentTags.size > 0;

  // Group saved courses by country, sorted by country label then university.
  const byCountry = {};
  saved.forEach(c => (byCountry[c.country] ||= []).push(c));
  const order = Object.keys(byCountry)
    .sort((a, b) => (COUNTRY_LABELS[a] ?? a).localeCompare(COUNTRY_LABELS[b] ?? b));

  const wrap = panel.querySelector('#shortlistGroups');
  order.forEach(country => {
    const list = byCountry[country].sort((a, b) => a.university.localeCompare(b.university));
    const group = document.createElement('section');
    group.className = 'results-group';
    const header = document.createElement('h2');
    header.className = 'results-group__header';
    header.innerHTML = `${COUNTRY_FLAGS[country] ?? ''} ${esc(COUNTRY_LABELS[country] ?? country)} <span style="font-weight:400;opacity:.65">(${list.length})</span>`;
    group.appendChild(header);
    const grid = document.createElement('div');
    grid.className = 'results-group__grid';
    list.forEach(c => grid.appendChild(buildShortlistCard(c, studentTags, hasSubjects)));
    group.appendChild(grid);
    wrap.appendChild(group);
  });
}

// Balance verdict: the shape of the list plus one line of counselor
// advice. Factual and kind — about the LIST's shape, never the student.
function buildBalanceVerdictHtml(saved) {
  const { counts, hasGrades } = shortlistVerdicts(saved);
  const classified = counts.reach + counts.match + counts.safety;
  const countsBits = [
    `${counts.reach} ${counts.reach === 1 ? 'reach' : 'reaches'}`,
    `${counts.match} ${counts.match === 1 ? 'match' : 'matches'}`,
    `${counts.safety} ${counts.safety === 1 ? 'safety' : 'safeties'}`,
  ];
  if (counts.unknown > 0 && classified > 0) countsBits.push(`${counts.unknown} unclassified`);

  let advice;
  if (classified === 0) {
    advice = hasGrades
      ? 'These courses can’t be classified against your grades — check each course’s requirements directly.'
      : 'Add predicted grades in Check Combination to see whether your list is balanced.';
  } else if (counts.safety === 0 && counts.reach > 0) {
    advice = 'Every course here is competitive — add 1–2 safer choices so you’re covered.';
  } else if (counts.reach === 0) {
    advice = 'Nothing ambitious here — you have room to aim higher.';
  } else {
    advice = 'Good spread — ambitious choices anchored by safer ones.';
  }

  const countsLine = classified > 0
    ? `<span class="shortlist-balance__counts">Your list: ${countsBits.join(' · ')}</span>`
    : `<span class="shortlist-balance__counts">Your list: ${saved.length} course${saved.length === 1 ? '' : 's'}, unclassified</span>`;
  return `
    <p class="shortlist-balance">
      ${countsLine}
      <span class="shortlist-balance__advice">${advice}</span>
    </p>`;
}

// Live, factual insights computed from the saved courses.
function buildShortlistInsightsHtml(saved) {
  const unis      = new Set(saved.map(c => c.university));
  const countries = new Set(saved.map(c => c.country));
  const plural    = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  // Admission tests with per-test course counts (not blindly deduplicated),
  // most-required first.
  const testCounts = {};
  saved.forEach(c => (Array.isArray(c.admissionTests) ? c.admissionTests : [])
    .forEach(t => { testCounts[t] = (testCounts[t] ?? 0) + 1; }));
  const testEntries = Object.entries(testCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const testsHtml = testEntries.length
    ? testEntries.map(([t, n]) =>
        `<span class="shortlist-insight-tag">${esc(t)} (${n} course${n === 1 ? '' : 's'})</span>`).join(' ')
    : `<span class="text-secondary">None across your saved courses</span>`;

  // Registration windows for the tests on the list (static verified data).
  const regBits = testEntries
    .map(([t]) => (typeof admissionTestInfo !== 'undefined') ? admissionTestInfo[t] : null)
    .filter(Boolean)
    .map(i => `${esc(i.name)} ${esc(i.regShort)}`);
  const regLine = regBits.length
    ? `<li><span class="shortlist-insight-label">Registration windows:</span> <span class="shortlist-reg-windows">${regBits.join(' · ')}</span></li>`
    : '';

  // Grade ranges computed per qualification system (mixed systems → one row each).
  const gradeRows = shortlistGradeRange(saved);
  let gradeHtml = '';
  if (gradeRows.length === 1) {
    const r = gradeRows[0];
    gradeHtml = `<li><span class="shortlist-insight-label">Grade range:</span> <strong>${esc(r.label)}: ${esc(r.range)}</strong></li>`;
  } else if (gradeRows.length > 1) {
    gradeHtml = `<li><span class="shortlist-insight-label">Grade ranges:</span>
        <ul class="shortlist-grade-rows">
          ${gradeRows.map(r => `<li><strong>${esc(r.label)}:</strong> ${esc(r.range)}</li>`).join('')}
        </ul></li>`;
  }

  return `
    <div class="shortlist-insights">
      <h2 class="shortlist-insights__title">Your shortlist at a glance</h2>
      ${buildBalanceVerdictHtml(saved)}
      <ul class="shortlist-insights__list">
        <li><strong>${plural(saved.length, 'course', 'courses')}</strong> saved across
            <strong>${plural(unis.size, 'university', 'universities')}</strong> in
            <strong>${plural(countries.size, 'country', 'countries')}</strong></li>
        <li><span class="shortlist-insight-label">Admission tests you'll need:</span> ${testsHtml}</li>
        ${regLine}
        ${gradeHtml}
      </ul>
    </div>`;
}

// Grade spread across saved courses, computed SEPARATELY per qualification
// system so mixed shortlists report e.g. "IB: 38–40" and "A-Level: A*AA–AAA"
// rather than collapsing systems into one misleading range. Returns an array
// of { label, range }, one entry per system that has data.
function shortlistGradeRange(saved) {
  const rows = [];

  // IB — numeric points.
  const ib = saved.map(c => c.grades?.ib).filter(v => typeof v === 'number' && !isNaN(v));
  if (ib.length) {
    const lo = Math.min(...ib), hi = Math.max(...ib);
    rows.push({ label: 'IB', range: lo === hi ? `${lo} points` : `${lo}–${hi} points` });
  }

  // Letter-grade offers (A-Level & Singapore A-Level share the same format),
  // ranked by offer strength.
  for (const [key, label] of [['aLevels', 'A-Level'], ['sgALevels', 'Singapore A-Level']]) {
    const offers = saved.map(c => c.grades?.[key]).filter(Boolean);
    if (offers.length) {
      // Strongest offer first, e.g. "A*AA–AAA".
      const ranked = offers.slice().sort((a, b) => aLevelOfferStrength(b) - aLevelOfferStrength(a));
      const strongest = ranked[0], weakest = ranked[ranked.length - 1];
      rows.push({ label, range: strongest === weakest ? strongest : `${strongest}–${weakest}` });
    }
  }

  // HK DSE / AP — list the distinct spread (no reliable cross-grade ranking).
  for (const [key, label] of [['hkDse', 'HK DSE'], ['ap', 'AP']]) {
    const vals = saved.map(c => c.grades?.[key]).filter(Boolean);
    if (vals.length) {
      const uniq = [...new Set(vals)].sort();
      rows.push({ label, range: uniq.length === 1 ? uniq[0] : `${uniq[0]}–${uniq[uniq.length - 1]}` });
    }
  }

  return rows;
}

// Total rank of the top three A-Level grades, for ordering offers.
function aLevelOfferStrength(str) {
  return parseALevelGrades(str).slice(0, 3)
    .reduce((sum, g) => sum + (A_LEVEL_RANK[g] ?? 0), 0);
}

/* ═══════════════════════════════════════════════════════════════
 * REACH / MATCH / SAFETY — shortlist verdicts.
 * Classifies a saved course against the student's predicted grades in
 * their own system, reusing the same machinery as Check Combination
 * (isGradeAboveStudent, the grade parsers, apContext). UNKNOWN is the
 * honest answer whenever the signal is thin — never force a bucket.
 * ═══════════════════════════════════════════════════════════════ */

const VERDICT_META = {
  reach:  { label: 'Reach',  cls: 'reach'  },
  match:  { label: 'Match',  cls: 'match'  },
  safety: { label: 'Safety', cls: 'safety' },
};

function shortlistVerdict(course, system, predictedGrade, profile) {
  // Elite-tier holistic US courses are reaches for everyone — honest.
  if (course.country === 'US' && course.universityContext?.tier === 'world-top-10') return 'reach';

  if (system === 'US_AP') {
    if (course.country === 'US') {
      // Holistic: competitiveness leans on AP count vs the course's bar
      // (the existing apContext model). Never a "safety" — holistic
      // admission is never comfortably safe.
      const apCount = profile?.subjects?.length || 0;
      const ctx = course.apContext;
      if (!ctx || !apCount || typeof ctx.minCompetitiveAPs !== 'number') return 'unknown';
      return apCount < ctx.minCompetitiveAPs ? 'reach' : 'match';
    }
    if (!predictedGrade) return 'unknown';
    const apStr = course.grades?.ap;
    if (!apStr) return 'unknown';
    if (isGradeAboveStudent(course, system, predictedGrade)) return 'reach';
    const digits = apStr.match(/[1-5]/g);
    if (!digits?.length) return 'unknown';
    const needLetter = AP_TO_LETTER[String(Math.max(...digits.map(Number)))];
    return (A_LEVEL_RANK[predictedGrade] ?? 0) > (A_LEVEL_RANK[needLetter] ?? 0) ? 'safety' : 'match';
  }

  if (!predictedGrade) return 'unknown';

  if (system === 'UK_A_Level' || system === 'SG_A_Level') {
    const gradeStr = course.grades?.[SYSTEM_GRADE_KEY[system]];
    if (!gradeStr) return 'unknown';
    if (isGradeAboveStudent(course, system, predictedGrade)) return 'reach';
    const top3 = parseALevelGrades(gradeStr).slice(0, 3);
    if (!top3.length) return 'unknown';
    const maxNeed = Math.max(...top3.map(g => A_LEVEL_RANK[g] ?? 0));
    // A full grade above the offer's TOP grade = comfortably below your level.
    return (A_LEVEL_RANK[predictedGrade] ?? 0) > maxNeed ? 'safety' : 'match';
  }

  if (system === 'IB') {
    const ibVal = course.grades?.ib;
    const need = typeof ibVal === 'number' ? ibVal : parseInt(String(ibVal ?? '').match(/\d+/)?.[0], 10);
    if (isNaN(need)) return 'unknown';
    const pts = parseInt(predictedGrade, 10);
    if (isNaN(pts)) return 'unknown';
    if (pts < need) return 'reach';
    // Respect the HL logic where we have live HL selections (the same
    // signal Check Combination uses): a required HL the student isn't
    // taking makes the course a reach regardless of points.
    const reqHL = course.grades?.ibHL ?? [];
    if (reqHL.length && typeof selectedSubjectsWithLevel !== 'undefined' && selectedSubjectsWithLevel.size) {
      const haveHL = new Set([...selectedSubjectsWithLevel.values()].filter(x => x.isHL).map(x => x.tag));
      if (reqHL.some(t => !haveHL.has(t))) return 'reach';
    }
    return pts >= need + 3 ? 'safety' : 'match';
  }

  if (system === 'HK_DSE') {
    const dseStr = course.grades?.hkDse;
    if (!dseStr) return 'unknown';
    if (isGradeAboveStudent(course, system, predictedGrade)) return 'reach';
    const grades = parseDseGrades(dseStr);
    if (!grades.length) return 'unknown';
    const maxNeed = Math.max(...grades.map(g => DSE_RANK[g] ?? 0));
    return (DSE_RANK[predictedGrade] ?? 0) > maxNeed ? 'safety' : 'match';
  }

  return 'unknown';
}

// Verdicts for the whole saved list, from the persisted profile.
function shortlistVerdicts(saved) {
  const profile = (typeof AltioraState !== 'undefined') ? AltioraState.getProfile() : {};
  const system  = profile.qualificationSystem;
  const grade   = profile.predictedGrades || null;
  const byId = new Map();
  const counts = { reach: 0, match: 0, safety: 0, unknown: 0 };
  saved.forEach(c => {
    const v = system ? shortlistVerdict(c, system, grade, profile) : 'unknown';
    byId.set(c.id, v);
    counts[v]++;
  });
  return { byId, counts, hasGrades: !!grade, system };
}

// One-line timing fragment for an admission test (static verified data).
function testTimingLineHtml(testId) {
  const info = (typeof admissionTestInfo !== 'undefined') ? admissionTestInfo[testId] : null;
  if (!info) return '';
  return `<p class="card-test-timing">${esc(info.name)} — registration ${esc(info.typicalRegistrationWindow)}; test ${esc(info.typicalTestWindow)} → <a href="${esc(info.officialUrl)}" target="_blank" rel="noopener noreferrer">official site</a></p>`;
}

// A saved-course card: same visual system and info as a result card, plus a
// GREEN/AMBER/RED match badge (target / possible / stretch) and a Remove
// action. The badge needs the student's subjects; when none are known it
// shows a neutral prompt rather than a misleading status.
function buildShortlistCard(course, studentTags, hasSubjects) {
  const flag      = COUNTRY_FLAGS[course.country] ?? '';
  const country   = COUNTRY_LABELS[course.country] ?? course.country;
  const catLabel  = CATEGORY_LABEL_MAP[course.category] ?? course.category;
  const tierLabel = course.universityContext?.tier ? (TIER_LABELS[course.universityContext.tier] ?? null) : null;
  const tests     = Array.isArray(course.admissionTests) ? course.admissionTests : [];

  let badgeHtml;
  if (hasSubjects) {
    const { status } = classify(course, studentTags);
    const cfg = STATUS[status];
    badgeHtml = `<div class="card-status card-status--${status}">${cfg.icon} ${esc(cfg.label)}</div>`;
  } else {
    badgeHtml = `<div class="card-status card-status--none">Pick your subjects to see your match</div>`;
  }

  // Reach/match/safety against the student's predicted grades. UNKNOWN
  // renders nothing — an honest absence, never a forced bucket.
  const profile = (typeof AltioraState !== 'undefined') ? AltioraState.getProfile() : {};
  const verdict = profile.qualificationSystem
    ? shortlistVerdict(course, profile.qualificationSystem, profile.predictedGrades || null, profile)
    : 'unknown';
  const vMeta = VERDICT_META[verdict];
  const verdictHtml = vMeta
    ? `<span class="shortlist-verdict shortlist-verdict--${vMeta.cls}">${esc(vMeta.label)}</span>`
    : '';

  const card = document.createElement('div');
  card.className = 'course-card course-card--saved';
  card.setAttribute('role', 'listitem');
  card.dataset.category = course.category ?? '';
  card.innerHTML = `
    <div class="card-status-row">${badgeHtml}${verdictHtml}</div>
    <div class="card-header">
      <div class="card-title-group">
        <span class="card-flag" aria-hidden="true">${flag}</span>
        <div class="card-titles">
          <div class="card-name">${esc(course.name)}</div>
          <div class="card-uni">${esc(course.university)}</div>
          ${tierLabel ? `<div class="card-tier">${esc(tierLabel)}</div>` : ''}
        </div>
      </div>
      <button class="remove-btn" type="button" data-remove-course="${esc(course.id)}"
        aria-label="Remove ${esc(course.name)} from shortlist">✕ Remove</button>
    </div>
    <div class="card-meta">
      <span>${flag}&thinsp;${esc(country)}</span>
      <span class="card-meta-sep">·</span>
      <span>${esc(course.degreeLevel)}</span>
      <span class="card-meta-sep">·</span>
      <span class="card-cat-badge">${esc(catLabel)}</span>
    </div>
    ${tests.length ? `
      <div class="card-admission-tests">
        ${tests.map(t => `<span class="admission-test-tag">${esc(t)} required</span>`).join('')}
      </div>
      ${tests.map(testTimingLineHtml).join('')}` : ''}
    ${(course.verification?.status ?? 'unverified') !== 'verified'
      ? `<p class="card-unverified">⚠ Requirements not yet verified — confirm with the university.</p>`
      : ''}
  `;
  card.querySelector('.remove-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleShortlist(course.id);   // course is saved → this removes it
  });
  return card;
}

/* ═══════════════════════════════════════════════════════════════
 * WORKSPACE HOME  (returning-user home base)
 * Calm landing for returning users: where they are, one clear next
 * step, a live summary, and quick access to their tools.
 * ═══════════════════════════════════════════════════════════════ */

const STAGE_SUMMARY = {
  exploring: 'discovering what you might want to study.',
  choosing:  'choosing the subjects that keep your options open.',
  building:  'building your list of courses to apply to.',
  applying:  'working on your applications.',
};

// True only when the user was already onboarded at page load (i.e. returning
// from a previous session). A freshly-onboarded first-timer stays false, so
// the workspace home greets them as new rather than "Welcome back".
let _isReturningUser = false;

// Write-through: mirror the live Check-Combination selections into the
// persisted profile so the workspace home reflects them on return.
function syncProfileFromCheck() {
  if (typeof AltioraState === 'undefined') return;
  AltioraState.setProfile({
    qualificationSystem: state.checkSystem || null,
    subjects:            Array.isArray(state.selectedSubjects) ? state.selectedSubjects.slice() : [],
    predictedGrades:     state.predictedGrade || null,
  });
}

// The single guiding action for the current stage + state. Returns a
// sentence plus an ordered list of { tool, label } actions (first is
// primary). This is the heart of the workspace home.
function computeNextStep(stage, profile, shortlistCount) {
  const hasSubjects  = (profile.subjects?.length  || 0) > 0;
  const hasInterests = (profile.interests?.length || 0) > 0;

  let base;
  switch (stage) {
    case 'exploring':
      base = {
        text: (hasInterests || hasSubjects)
          ? 'Keep exploring the degree paths that fit you.'
          : 'Discover what fits you.',
        actions: [{ tool: 'strengths', label: 'Start with Strengths' }],
      };
      break;
    case 'choosing':
      base = {
        text: hasSubjects
          ? 'Refine the subjects that keep your options open.'
          : 'Plan your subjects.',
        actions: [{ tool: 'plan', label: 'Subject Planner' }],
      };
      break;
    case 'building':
      base = !shortlistCount
        ? { text: 'Find courses you qualify for.', actions: [{ tool: 'check', label: 'Check Combination' }] }
        : {
            text: `You have ${shortlistCount} saved course${shortlistCount === 1 ? '' : 's'}. Review your list or find more.`,
            actions: [
              { tool: 'shortlist', label: 'Review your shortlist' },
              { tool: 'check',     label: 'Find more courses' },
            ],
          };
      break;
    case 'applying':
      base = {
        text: shortlistCount
          ? `Work on applications for your ${shortlistCount} saved course${shortlistCount === 1 ? '' : 's'}.`
          : 'Save the courses you want to apply to, then work on your applications.',
        actions: shortlistCount
          ? [{ tool: 'applying', label: 'Open application tools' }, { tool: 'shortlist', label: 'View shortlist' }]
          : [{ tool: 'check', label: 'Find courses to apply to' }],
      };
      break;
    default:
      base = { text: 'Pick up where you left off.', actions: [] };
  }

  return base;
}

function renderWorkspaceHome() {
  const panel = $('panel-home');
  if (!panel) return;

  const profile = AltioraState.getProfile();
  const stage   = profile.stage || DEFAULT_STAGE;
  const cfg     = STAGES[stage] || STAGES[DEFAULT_STAGE];
  const saved   = AltioraState.getShortlist();
  const next    = computeNextStep(stage, profile, saved.length);

  const sysLabel = profile.qualificationSystem
    ? (qualificationMappings[profile.qualificationSystem]?.systemLabel ?? profile.qualificationSystem)
    : null;
  const subjects = Array.isArray(profile.subjects) ? profile.subjects : [];
  const grades   = profile.predictedGrades || null;
  const candidateLabels = plannerFields().map(id => CATEGORY_LABEL_MAP[id] ?? id);

  // Next-step buttons (first = primary)
  const actionBtns = next.actions.map((a, i) =>
    `<button class="home-next__btn${i === 0 ? ' home-next__btn--primary' : ''}" data-go-tool="${esc(a.tool)}">${esc(a.label)} →</button>`
  ).join('');

  // Quick-access stage tools (primary first, then secondary)
  const toolBtns = [cfg.primary, ...cfg.secondary].map((mode, i) =>
    `<button class="home-quick__btn${i === 0 ? ' home-quick__btn--primary' : ''}" data-go-tool="${esc(mode)}">${esc(MODE_LABELS[mode] || mode)}</button>`
  ).join('');

  // Shortlist mini-summary
  const savedCourses = saved.map(id => courses.find(c => c.id === id)).filter(Boolean);
  let shortlistHtml;
  if (savedCourses.length) {
    const unis      = new Set(savedCourses.map(c => c.university));
    const countries = new Set(savedCourses.map(c => c.country));
    shortlistHtml = `<p><strong>${savedCourses.length}</strong> course${savedCourses.length === 1 ? '' : 's'} across
      <strong>${unis.size}</strong> universit${unis.size === 1 ? 'y' : 'ies'} in
      <strong>${countries.size}</strong> countr${countries.size === 1 ? 'y' : 'ies'}.</p>`;
  } else {
    shortlistHtml = `<p class="home-card__muted">No courses saved yet.</p>`;
  }

  const muted = txt => `<span class="home-card__muted">${esc(txt)}</span>`;

  panel.innerHTML = `
    <div class="home">
      <header class="home__header">
        <h1 class="home__welcome">${_isReturningUser ? 'Welcome back.' : "You're all set."}</h1>
        <p class="home__stage">You're in the <strong>${esc(cfg.name)}</strong> stage — ${_isReturningUser ? esc(STAGE_SUMMARY[stage] ?? '') : "here's your next step."}</p>
      </header>

      <section class="home-next" aria-label="Your next step">
        <span class="home-next__eyebrow">Your next step</span>
        <p class="home-next__text">${esc(next.text)}</p>
        <div class="home-next__actions">${actionBtns}</div>
      </section>

      <div class="home-cards">
        <section class="home-card">
          <h2 class="home-card__title">Your profile</h2>
          <dl class="home-card__dl">
            <div><dt>Qualification</dt><dd>${sysLabel ? esc(sysLabel) : muted('Not set yet')}</dd></div>
            <div><dt>Your fields</dt><dd>${candidateLabels.length ? esc(candidateLabels.join(' · ')) : muted('None kept yet')}</dd></div>
            <div><dt>Subjects</dt><dd>${subjects.length ? esc(subjects.join(', ')) : muted('None selected yet')}</dd></div>
            <div><dt>Predicted grades</dt><dd>${grades ? esc(grades) : muted('Not set yet')}</dd></div>
          </dl>
          <button class="home-card__link" data-go-tool="check">Update profile →</button>
          <button class="home-card__link" data-go-tool="plan">Manage your fields →</button>
        </section>

        <section class="home-card">
          <h2 class="home-card__title">Your shortlist</h2>
          ${shortlistHtml}
          <button class="home-card__link" data-go-tool="shortlist">View shortlist →</button>
        </section>
      </div>

      <section class="home-quick" aria-label="Quick access">
        <span class="home-quick__label">Quick access</span>
        <div class="home-quick__row">
          ${toolBtns}
          <button class="home-quick__btn" data-go-tool="shortlist">🔖 My Shortlist (${saved.length})</button>
          <button class="home-quick__btn" data-change-stage>Change stage</button>
        </div>
      </section>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════
 * SYSTEM DROPDOWNS
 * ═══════════════════════════════════════════════════════════════ */

function populateSystemSelects() {
  // The qualification system is a single global property, set in onboarding and
  // changed only via the nav "System: X ▾" control. No in-body system dropdowns
  // exist on any tool screen, so there is nothing to populate here. Kept as a
  // guarded no-op in case a per-tool select is ever reintroduced.
  const optHtml = Object.entries(qualificationMappings)
    .map(([k, sys]) => `<option value="${k}">${esc(sys.systemLabel)}</option>`)
    .join('');
  ['checkSystemSelect', 'reverseSystemSelect', 'planSystemSelect'].forEach(id => {
    const el = $(id); if (el) el.innerHTML = optHtml;
  });
}

/* ═══════════════════════════════════════════════════════════════
 * SUBJECT PICKER  (check mode)
 * ═══════════════════════════════════════════════════════════════ */

function buildSubjectPicker(systemKey) {
  const section = $('subjectPickerSection');
  const picker  = $('subjectPicker');
  $('subjectFilterInput').value = '';

  // The IB maths-help banner lives outside #subjectPicker; clear any stale one
  // before (re)building so it never lingers across a system change.
  $('ibMathsHelp')?.remove();

  if (!systemKey) {
    section.classList.add('hidden');
    picker.innerHTML = '';
    $('categoryPickerSection').classList.add('hidden');
    buildGradeInput('');
    return;
  }

  const subjects = Object.keys(qualificationMappings[systemKey]?.subjects ?? {});
  const frag = document.createDocumentFragment();
  subjects.forEach(name => {
    const label = document.createElement('label');
    label.className = 'subject-chip';
    label.innerHTML = `<input type="checkbox" value="${esc(name)}"><span>${esc(name)}</span><span class="auto-indicator hidden" aria-hidden="true"> ↻</span>`;
    label.querySelector('input').addEventListener('change', onSubjectToggle);
    frag.appendChild(label);
  });

  picker.innerHTML = '';
  picker.appendChild(frag);
  section.classList.remove('hidden');

  // IB students may take only one mathematics course — surface a persistent
  // help banner below the picker (the easily-missed toast wasn't enough).
  if (systemKey === 'IB') {
    const help = document.createElement('div');
    help.id = 'ibMathsHelp';
    help.className = 'ib-maths-help';
    help.textContent = 'ℹ️ IB students take only one mathematics course. Choose the level (HL/SL) that suits your target course.';
    picker.insertAdjacentElement('afterend', help);
  }

  // Reset category state when the system changes.
  selectedSubjectsWithLevel.clear();
  hideMathsWarningBanner();
  state.selectedCategories.clear();
  $$('#categoryPicker .category-chip').forEach(b => b.classList.remove('active'));
  $('categoryPickerSection').classList.add('hidden');

  // Preserve an active field-exploration filter across the system change
  // (the chip/category reset above would otherwise drop it) and refresh
  // the context banner so its "pick a system" prompt updates.
  applyExploreFieldFilter();
  renderExploreContextBanner();

  buildGradeInput(systemKey);
  syncSubjectCount();
  renderCheckEmptyState();
}

/* ═══════════════════════════════════════════════════════════════
 * CATEGORY PICKER  (course interest filter)
 * ═══════════════════════════════════════════════════════════════ */

function buildCategoryPicker() {
  const picker = $('categoryPicker');
  const frag = document.createDocumentFragment();
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-chip';
    btn.dataset.category = cat.id;
    btn.innerHTML = `<span class="category-chip__icon" aria-hidden="true">${cat.icon}</span>${esc(cat.label)}`;
    btn.addEventListener('click', () => {
      if (state.selectedCategories.has(cat.id)) {
        state.selectedCategories.delete(cat.id);
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        state.selectedCategories.add(cat.id);
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }
      renderCheckResults();
    });
    btn.setAttribute('aria-pressed', 'false');
    frag.appendChild(btn);
  });
  picker.appendChild(frag);
}

// Purely informational: standard Maths is auto-added (and locked) whenever
// Further Maths is selected, so the banner just explains what happened.
function showMathsWarningBanner(imply) {
  if ($('mathsWarningBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'mathsWarningBanner';
  banner.className = 'maths-warning-banner';
  banner.innerHTML =
    `<span class="maths-warning-banner__msg">ℹ️ ${esc(imply.standard)} is required alongside ${esc(imply.advanced)} — we've added it for you.</span>`;
  const pickerSection = $('subjectPickerSection');
  pickerSection.parentNode.insertBefore(banner, pickerSection);
}

function hideMathsWarningBanner() {
  const banner = $('mathsWarningBanner');
  if (banner) banner.remove();
}

// When an IB maths choice replaces a previously-selected one, confirm the
// switch in the persistent help banner (it auto-reverts to the default hint).
let _ibMathsHelpTimer = null;
function updateIbMathsHelp(subjectName) {
  const help = $('ibMathsHelp');
  if (!help) return;
  const DEFAULT = 'ℹ️ IB students take only one mathematics course. Choose the level (HL/SL) that suits your target course.';
  help.textContent = `✓ Switched to ${subjectName} – only one maths allowed.`;
  help.classList.add('ib-maths-help--confirm');
  clearTimeout(_ibMathsHelpTimer);
  _ibMathsHelpTimer = setTimeout(() => {
    const el = $('ibMathsHelp');
    if (el) { el.textContent = DEFAULT; el.classList.remove('ib-maths-help--confirm'); }
  }, 4000);
}

// Returns the exclusion group entry the subject belongs to, or null.
// Only active for the IB system.
function getExclusionGroup(subjectName, systemKey) {
  if (systemKey !== 'IB') return null;
  return IB_MUTUAL_EXCLUSION_GROUPS.find(g => g.subjects.includes(subjectName)) ?? null;
}

function onSubjectToggle(e = null) {
  const changedValue = e?.target?.value ?? null;
  const wasChecked   = e?.target?.checked ?? null;
  const imply        = MATHS_IMPLY[state.checkSystem];

  // IB mutual exclusivity: when a subject is checked, uncheck any other subject
  // in the same exclusion group and notify the user. Track whether the switch
  // was within the Mathematics group so we can update the IB maths help text.
  let mathsSwitchedTo = null;
  if (changedValue && wasChecked === true) {
    const group = getExclusionGroup(changedValue, state.checkSystem);
    if (group) {
      $$('#subjectPicker input:checked').forEach(input => {
        if (input.value !== changedValue && group.subjects.includes(input.value)) {
          input.checked = false;
          if (group.label === 'Mathematics') mathsSwitchedTo = changedValue;
          else showToast(`Only one ${group.label} subject allowed. Switched to ${changedValue}.`);
        }
      });
    }
  }
  if (mathsSwitchedTo) updateIbMathsHelp(mathsSwitchedTo);

  // Read current checkbox state from DOM.
  state.selectedSubjects = Array.from($$('#subjectPicker input:checked')).map(c => c.value);

  // Auto-imply: Further Maths cannot stand alone, so standard Maths is forced
  // on and locked (disabled) for as long as Further Maths is selected. When
  // Further Maths is dropped, standard Maths is unlocked again.
  const autoAdded = new Set();
  if (imply) {
    const stdInput = Array.from($$('#subjectPicker input')).find(i => i.value === imply.standard);
    const hasAdv   = state.selectedSubjects.includes(imply.advanced);
    if (stdInput) {
      if (hasAdv) {
        if (!stdInput.checked) {
          stdInput.checked = true;
          state.selectedSubjects.push(imply.standard);
        }
        stdInput.disabled = true;
        stdInput.closest('.subject-chip')?.classList.add('subject-chip--locked');
        autoAdded.add(imply.standard);
      } else {
        stdInput.disabled = false;
        stdInput.closest('.subject-chip')?.classList.remove('subject-chip--locked');
      }
    }
  }

  state.selectedTags = deriveTagsFromSubjects(state.selectedSubjects, state.checkSystem);

  if (changedValue) {
    logEvent('subject_toggle', {
      system:   state.checkSystem,
      subject:  changedValue,
      selected: wasChecked === true,
      count:    state.selectedSubjects.length,
    });
  }

  $$('#subjectPicker .subject-chip').forEach(chip => {
    const input     = chip.querySelector('input');
    const indicator = chip.querySelector('.auto-indicator');
    chip.classList.toggle('selected', input.checked);
    chip.classList.toggle('chip--auto-added', autoAdded.has(input.value));
    if (indicator) {
      if (autoAdded.has(input.value)) {
        indicator.classList.remove('hidden');
        if (imply) indicator.title = `Added automatically because you selected ${imply.advanced}`;
      } else if (!input.checked) {
        indicator.classList.add('hidden');
      }
    }
  });

  if (imply && state.selectedSubjects.includes(imply.advanced)) showMathsWarningBanner(imply);
  else hideMathsWarningBanner();

  syncSubjectCount();
  $('categoryPickerSection').classList.toggle('hidden', state.selectedSubjects.length === 0);
  renderCheckEmptyState();
  clearTimeout(_subjectDebounce);
  if (state.selectedSubjects.length > 0) showLoadingSpinner('courseGrid');
  _subjectDebounce = setTimeout(renderCheckResults, 100);
}

function syncSubjectCount() {
  const n = state.selectedSubjects.length;
  $('subjectCountBadge').textContent = n === 0 ? 'none selected' : `${n} selected`;
  $('clearSubjectsBtn')?.classList.toggle('hidden', n === 0);
}

// Uncheck every subject and reset to the empty state — a one-click "start over".
function clearAllSubjects() {
  $$('#subjectPicker input:checked').forEach(cb => { cb.checked = false; });
  // onSubjectToggle re-derives state, re-enables any locked Maths chip, hides
  // the results, updates the count, and re-renders the empty state.
  onSubjectToggle();
}

$('subjectFilterInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  $$('#subjectPicker .subject-chip').forEach(chip => {
    chip.classList.toggle('hidden', !!q && !chip.querySelector('span').textContent.toLowerCase().includes(q));
  });
});

$('clearSubjectsBtn')?.addEventListener('click', clearAllSubjects);

/* ═══════════════════════════════════════════════════════════════
 * COUNTRY FILTER BAR
 * ═══════════════════════════════════════════════════════════════ */

function buildCountryFilterBar() {
  const bar = $('countryFilterBar');
  [['All','All'], ...Object.entries(COUNTRY_LABELS)].forEach(([key, label]) => {
    const btn = document.createElement('button');
    btn.className = `filter-btn${key === 'All' ? ' active' : ''}`;
    btn.dataset.country = key;
    btn.textContent = (COUNTRY_FLAGS[key] ? COUNTRY_FLAGS[key] + ' ' : '') + label;
    btn.addEventListener('click', () => {
      state.countryFilter = key;
      $$('#countryFilterBar .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCheckResults();
    });
    bar.appendChild(btn);
  });
}

/* ═══════════════════════════════════════════════════════════════
 * SUMMARY BAR
 * "You've selected 4 subjects → 8 open · 12 possible · 22 closed"
 * + segmented progress bar
 * ═══════════════════════════════════════════════════════════════ */

function renderSummaryBar(subjectCount, counts, total) {
  const bar = $('summaryBar');

  const gPct  = total ? (counts.green / total * 100) : 0;
  const aPct  = total ? (counts.amber / total * 100) : 0;
  const grPct = total ? (counts.grey  / total * 100) : 0;
  const rPct  = total ? (counts.red   / total * 100) : 0;

  const greySummary = counts.grey
    ? `<span class="summary-dot">·</span><a href="#results-group-grey" class="summary-link summary-link--grey">${counts.grey} grade threshold high</a>`
    : '';

  bar.innerHTML = `
    <div class="results-new-summary">
      Your subjects match <strong>${total}</strong> course${total !== 1 ? 's' : ''} —
      <a href="#results-group-green" class="summary-link summary-link--green">${counts.green} strong match${counts.green !== 1 ? 'es' : ''}</a>
      <span class="summary-dot">·</span>
      <a href="#results-group-amber" class="summary-link summary-link--amber">${counts.amber} possible</a>
      ${greySummary}
      <span class="summary-dot">·</span>
      <a href="#results-group-red" class="summary-link summary-link--red">${counts.red} out of reach</a>
    </div>
    <div class="summary-progress" role="img" aria-label="Course eligibility: ${counts.green} strong matches, ${counts.amber} possible, ${counts.grey} grade threshold high, ${counts.red} out of reach">
      <div class="summary-seg summary-seg--green" style="width:${gPct.toFixed(2)}%"></div>
      <div class="summary-seg summary-seg--amber" style="width:${aPct.toFixed(2)}%"></div>
      <div class="summary-seg summary-seg--grey"  style="width:${grPct.toFixed(2)}%"></div>
      <div class="summary-seg summary-seg--red"   style="width:${rPct.toFixed(2)}%"></div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════
 * CHECK MODE — RESULTS
 * ═══════════════════════════════════════════════════════════════ */

// Lightweight, instant client-side filter on the already-rendered result
// cards by university OR course name. Runs on top of the country filter
// (cards are already country/category-filtered when built) — no re-render,
// no spinner. Re-applied after every render so it survives country switches.
function applyResultSearch(rawQuery) {
  const grid = $('courseGrid');
  if (!grid) return;
  const q = (rawQuery ?? '').trim().toLowerCase();
  let shown = 0;

  grid.querySelectorAll('.results-group').forEach(sec => {
    let anyMatch = false;
    sec.querySelectorAll('.course-card').forEach(card => {
      const match = !q || (card.dataset.search || '').includes(q);
      card.classList.toggle('hidden', !match);
      if (match) { anyMatch = true; shown++; }
    });
    // Hide a whole group when none of its cards match the search.
    sec.classList.toggle('hidden', !anyMatch);
    // The "out of reach" group is collapsed behind a toggle; while a search
    // is active, reveal its grid so matches there are visible, then restore.
    const innerGrid = sec.querySelector('.results-group__grid');
    const toggle    = sec.querySelector('.results-group__toggle');
    if (innerGrid && toggle) {
      if (q) {
        innerGrid.hidden = false;
        toggle.classList.add('hidden');
      } else {
        innerGrid.hidden = true;
        toggle.classList.remove('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // No-match empty state (reused element, appended once).
  let empty = grid.querySelector('.results-search-empty');
  if (q && shown === 0) {
    if (!empty) {
      empty = document.createElement('p');
      empty.className = 'results-search-empty';
      grid.appendChild(empty);
    }
    empty.textContent = `No matches for "${rawQuery.trim()}" — try a different university or course name.`;
    empty.classList.remove('hidden');
  } else if (empty) {
    empty.classList.add('hidden');
  }
}

function renderCheckResults() {
  if (dataLoadError) return;
  const section = $('checkResultsSection');

  // Mirror the live Check selections into the persisted profile so the
  // workspace home reflects them (runs before the early return so it
  // also captures grade-only and cleared-subject changes).
  syncProfileFromCheck();

  if (state.selectedSubjects.length === 0) {
    section.classList.add('hidden');
    _checkResultsSeen = false;   // reset so results scroll into view again next time
    return;
  }
  const firstAppearance = !_checkResultsSeen;
  _checkResultsSeen = true;
  section.classList.remove('hidden');
  showLoadingSpinner('courseGrid');

  // Yield one frame so the spinner paints before synchronous classification work.
  requestAnimationFrame(() => {
  // Guard the whole synchronous render: if anything throws, the spinner must
  // still be cleared (otherwise it hangs forever) and the error surfaced.
  try {

  const minNeeded = MIN_SUBJECTS[state.checkSystem] ?? 3;
  const tooFew    = state.selectedSubjects.length < minNeeded;

  // Grades never affect the subject-based match status: strong subjects always
  // show GREEN. Entering a grade additionally greys out courses whose typical
  // offer is above the student (see isGradeAboveStudent below); leaving it
  // blank simply matches on subjects alone.

  // Remove any existing banners before re-rendering
  section.querySelectorAll('.subject-count-warning').forEach(el => el.remove());

  if (tooFew) {
    const warn = document.createElement('p');
    warn.className = 'subject-count-warning';
    warn.textContent = state.checkSystem === 'HK_DSE'
      ? 'DSE students typically need 4 core subjects + 2 electives (6 subjects total). Select more subjects for accurate results.'
      : state.checkSystem === 'US_AP'
      ? 'Competitive US applicants take several rigorous APs (often 7+), aligned to their major. Add more APs to see a fuller picture — results below are indicative only.'
      : `Universities require a full subject combination — please select at least ${minNeeded} subjects to see accurate results. Results below are indicative only.`;
    $('summaryBar').before(warn);
  }

  const pool = courses
    .filter(c => state.countryFilter === 'All' || c.country === state.countryFilter)
    .filter(c => state.selectedCategories.size === 0 || state.selectedCategories.has(c.category));

  const apCount = state.selectedSubjects.length;
  const byStatus = { green: [], amber: [], grey: [], red: [] };
  pool.forEach(course => {
    const result = classify(course, state.selectedTags);
    if (tooFew && result.status === 'green') result.status = 'amber';
    // AP: a strong subject match alone doesn't make a few-AP profile a STRONG
    // match for selective US schools — competitiveness depends on AP count.
    // Hold back GREEN to POSSIBLE when below the course's competitive AP bar.
    if (state.checkSystem === 'US_AP' && course.country === 'US' && course.apContext
        && result.status === 'green'
        && apCount < course.apContext.minCompetitiveAPs) {
      result.status = 'amber';
      result.apCountShort = { have: apCount, need: course.apContext.minCompetitiveAPs };
    }
    if (state.predictedGrade && (result.status === 'green' || result.status === 'amber')) {
      if (isGradeAboveStudent(course, state.checkSystem, state.predictedGrade)) {
        result.status = 'grey';
        result.gradeGap = gradeGapInfo(course, state.checkSystem, state.predictedGrade);
      }
    }
    if (state.checkSystem === 'IB' && (result.status === 'green' || result.status === 'amber')) {
      const requiredHLTags = course.grades?.ibHL ?? [];
      if (requiredHLTags.length > 0) {
        // Get student's HL subjects as tags
        const studentHLTags = Array.from(selectedSubjectsWithLevel.values())
          .filter(item => item.isHL === true)
          .map(item => item.tag);

        // Find which required HL tags are missing
        const missingHL = requiredHLTags.filter(tag => !studentHLTags.includes(tag));

        // Only downgrade and warn for ACTUAL missing HL subjects this course
        // lists. Courses with no ibHL requirements get no HL warning at all —
        // no blanket "expect 3 HLs" message and no GREEN→AMBER demotion.
        if (missingHL.length > 0) {
          if (result.status === 'green') result.status = 'amber';
          result.ibHLWarning = missingHL;
        } else {
          result.ibHLWarning = null;
        }
      } else {
        result.ibHLWarning = null;
      }
    }
    byStatus[result.status].push({ course, result });
  });

  // Sort each group by university name
  ['green', 'amber', 'grey', 'red'].forEach(s =>
    byStatus[s].sort((a, b) => a.course.university.localeCompare(b.course.university))
  );

  const counts = { green: byStatus.green.length, amber: byStatus.amber.length, grey: byStatus.grey.length, red: byStatus.red.length };
  const total  = counts.green + counts.amber + counts.grey + counts.red;

  renderSummaryBar(state.selectedSubjects.length, counts, total);

  const greyBadge = counts.grey ? `<span class="badge badge--grey">◯&thinsp;${counts.grey}</span>` : '';
  $('resultSummaryBadges').innerHTML = `
    <span class="badge badge--success">✓&thinsp;${counts.green}</span>
    <span class="badge badge--warning">◑&thinsp;${counts.amber}</span>
    ${greyBadge}
    <span class="badge badge--error">✗&thinsp;${counts.red}</span>
    <span class="badge badge--neutral">${total} shown</span>
  `;

  const container = $('courseGrid');
  container.innerHTML = '';
  let cardIndex = 0;

  if (byStatus.green.length) {
    container.appendChild(buildGroup('green', 'Strong matches', byStatus.green, cardIndex));
    cardIndex += byStatus.green.length;
  }
  if (byStatus.amber.length) {
    container.appendChild(buildGroup('amber', 'Possible', byStatus.amber, cardIndex));
    cardIndex += byStatus.amber.length;
  }
  if (byStatus.grey.length) {
    // Visible by default (no collapse) — subject matches where the predicted
    // grade is below the typical offer. Each card shows the grade gap.
    container.appendChild(buildGroup('grey', 'Subject match, but grade threshold is high', byStatus.grey, cardIndex));
    cardIndex += byStatus.grey.length;
  }
  if (byStatus.red.length) {
    container.appendChild(buildGroup('red', 'Out of reach', byStatus.red, cardIndex, true));
  }

  // Re-apply the in-results search filter (the grid was just rebuilt, e.g.
  // after a country-filter switch) so the typed query stays in effect.
  if (state.resultSearch) applyResultSearch(state.resultSearch);

  // On the first appearance of results (a new user's first selection), bring
  // them into view so it's obvious something happened. Not on later toggles.
  if (firstAppearance) {
    requestAnimationFrame(() =>
      section.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  } catch (err) {
    // Never leave the spinner spinning: surface the error and show a safe
    // empty state instead of an indefinite loading state.
    console.error('renderCheckResults failed:', err);
    const container = $('courseGrid');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⚠️</div>
          <p>Something went wrong rendering your results.</p>
          <p class="mt-8">Try adjusting your subjects, grades, or country filter.</p>
        </div>`;
    }
  } finally {
    hideLoadingSpinner();
  }
  }); // end requestAnimationFrame
}

function buildGroup(status, headerText, items, startIndex, collapsed = false) {
  const section = document.createElement('section');
  section.id        = `results-group-${status}`;
  section.className = 'results-group';

  const groupIcons = {
    green: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M7 10l2 2 4-4"/></svg>`,
    amber: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3a7 7 0 0 1 0 14V3z"/><circle cx="10" cy="10" r="7"/></svg>`,
    red:   `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M8 8l4 4M12 8l-4 4"/></svg>`,
  };
  const header = document.createElement('h2');
  header.className   = `results-group__header results-group__header--${status}`;
  header.innerHTML   = `${groupIcons[status]} ${headerText} <span style="font-weight:400;opacity:.65">(${items.length})</span>`;
  section.appendChild(header);

  const cardsDiv = document.createElement('div');
  cardsDiv.className = 'results-group__grid';

  items.forEach(({ course, result }, i) => {
    const card = buildCheckCard(course, result);
    card.style.setProperty('--card-delay', `${Math.min(startIndex + i, 16) * 0.035}s`);
    cardsDiv.appendChild(card);
  });

  if (collapsed) {
    cardsDiv.hidden = true;
    const toggle = document.createElement('button');
    toggle.type      = 'button';
    toggle.className = 'results-group__toggle';
    const chevSvg = `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l5 5 5-5"/></svg>`;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `${chevSvg} Show ${items.length} out-of-reach courses`;
    toggle.addEventListener('click', () => {
      const nowOpen = cardsDiv.hidden;
      cardsDiv.hidden = !nowOpen;
      toggle.setAttribute('aria-expanded', String(nowOpen));
      toggle.innerHTML = nowOpen
        ? `${chevSvg} Hide out-of-reach courses`
        : `${chevSvg} Show ${items.length} out-of-reach courses`;
    });
    section.appendChild(toggle);
    section.appendChild(cardsDiv);
  } else {
    section.appendChild(cardsDiv);
  }

  return section;
}

function buildCheckCard(course, result) {
  const { status, missingEssential, missingPreferred } = result;
  const cfg     = STATUS[status];
  const sys     = state.checkSystem;
  const flag    = COUNTRY_FLAGS[course.country] ?? '';
  const country = COUNTRY_LABELS[course.country] ?? course.country;

  // Grade string for the active qualification system
  const gradeKey = SYSTEM_GRADE_KEY[sys];
  const gradeStr = gradeKey ? (course.grades?.[gradeKey] ?? null) : null;

  // Readable category label
  const catLabel = CATEGORY_LABEL_MAP[course.category] ?? course.category;

  // Tier label (null = don't show)
  const tierLabel = course.universityContext?.tier ? (TIER_LABELS[course.universityContext.tier] ?? null) : null;

  // Admission tests
  const tests = Array.isArray(course.admissionTests) ? course.admissionTests : [];

  const isQuant = isQuantitativeCategory(course.category);
  const missingTagsHtml = tags =>
    requirementLabels(tags, sys, isQuant).map(l => `<span class="missing-tag">${esc(l)}</span>`).join(', ');

  let footerHtml = '';
  if (status === 'red' && missingEssential.length) {
    footerHtml = `
      <p class="card-missing card-missing--red">
        <span class="missing-prefix">Needs:</span>
        ${missingTagsHtml(missingEssential)}
      </p>`;
  } else if (status === 'amber' && missingPreferred.length) {
    const topSubject = subjectTagLabel(missingPreferred[0], sys, isQuant);
    const extras     = missingPreferred.length > 1
      ? ` <span style="color:var(--text-faint);font-weight:400"> + ${missingPreferred.length - 1} more</span>`
      : '';
    footerHtml = `
      <p class="card-tip">
        <span class="card-tip__icon">💡</span>
        Add <strong>${esc(topSubject)}</strong> to open more doors${extras}
      </p>`;
  }

  // Field-relevance reason — why a holistic/no-requirement course was held
  // back from STRONG because the student lacks the field's core subjects.
  let fieldCoreHtml = '';
  if (result.fieldCore && FIELD_CORE_REASON[result.fieldCore.category]) {
    fieldCoreHtml = `<p class="card-field-core">${esc(FIELD_CORE_REASON[result.fieldCore.category])}</p>`;
  }

  // ── AP context UI ────────────────────────────────────────────
  let apWarningHtml = '';
  let apNoteHtml    = '';
  let apRecsHtml    = '';
  if (sys === 'US_AP' && course.country === 'US' && course.apContext) {
    const ctx     = course.apContext;
    const apCount = state.selectedSubjects.length;
    apNoteHtml = `<p class="card-ap-note">${esc(ctx.note)}</p>`;
    if (apCount < ctx.minCompetitiveAPs) {
      const apTooltip = 'US universities consider essays, projects, and extracurriculars equally with AP scores';
      const mostCompetitive = (ctx.recommendedAPs && ctx.recommendedAPs > ctx.minCompetitiveAPs)
        ? `; the most competitive have ${ctx.recommendedAPs}+`
        : '';
      apWarningHtml = `
      <div class="card-admission-tests">
        <span class="admission-test-tag admission-test-tag--ap-note">Competitive applicants often have ${ctx.minCompetitiveAPs}+ APs${mostCompetitive} · ${apCount} selected — holistic review means exceptions are common <button type="button" class="ap-info-btn" aria-label="${esc(apTooltip)}" title="${esc(apTooltip)}">ⓘ</button></span>
      </div>`;
    }
    if (ctx.recommendedSubjects?.length) {
      apRecsHtml = `<p class="card-ap-recs">Recommended APs for this field: ${ctx.recommendedSubjects.map(s => esc(s)).join(', ')}</p>`;
    }
  }

  // ── US admissions context (holistic; indicative SAT/ACT range) ────
  // US degrees have no published grade/IB cutoff, so instead of a grade
  // line we show the current test policy plus an INDICATIVE admitted
  // middle-50% range, clearly labelled as a guide rather than a cutoff.
  let usAdmitHtml = '';
  if (course.country === 'US' && course.usAdmissions) {
    const a = course.usAdmissions;
    const policyLabel = {
      required:    'SAT/ACT required',
      optional:    'Test-optional',
      flexible:    'Test-flexible (SAT/ACT/AP/IB)',
      recommended: 'SAT/ACT recommended',
      varies:      'SAT/ACT required for some schools',
      blind:       'Test-blind — scores not used',
    }[a.test] ?? a.test;
    const rangeParts = [];
    if (a.sat) rangeParts.push(`SAT ${a.sat}`);
    if (a.act) rangeParts.push(`ACT ${a.act}`);
    const rangeHtml = rangeParts.length
      ? `<div class="card-us-admit__range">Typical admitted range (indicative, not a cutoff): ${rangeParts.map(esc).join(' · ')}</div>`
      : (a.test === 'blind'
          ? `<div class="card-us-admit__range">SAT/ACT are not considered in admission.</div>`
          : '');
    usAdmitHtml = `
      <div class="card-us-admit">
        <span class="card-us-admit__policy">🇺🇸 Holistic admissions — no fixed cutoff · ${esc(policyLabel)}</span>
        ${rangeHtml}
      </div>`;
  }

  // ── IB HL chips ───────────────────────────────────────────────
  let ibHlHtml = '';
  if (sys === 'IB') {
    const ibHL     = course.grades?.ibHL     ?? [];
    const ibHLNote = course.grades?.ibHLNote ?? null;
    if (ibHL.length || ibHLNote) {
      const hlChip   = ibHL.length
        ? `<span class="card-ib-chip">HL: ${ibHL.map(t => esc(hlTagLabel(t))).join(' · ')}</span>`
        : '';
      const noteChip = ibHLNote
        ? `<span class="card-ib-chip card-ib-chip--note">${esc(ibHLNote)}</span>`
        : '';
      ibHlHtml = `<div class="card-ib-hl">${hlChip}${noteChip}</div>`;
    }
    if (result.ibHLWarning && result.ibHLWarning.length > 0) {
      const tagWarnings = result.ibHLWarning.filter(w => !w.includes(' '));
      const msgWarnings = result.ibHLWarning.filter(w =>  w.includes(' '));
      const parts = [];
      if (tagWarnings.length > 0) {
        const subjects = tagWarnings.map(t => esc(hlTagLabel(t))).join(', ');
        parts.push(`Check HL requirements — ${subjects} need to be at Higher Level`);
      }
      parts.push(...msgWarnings.map(m => esc(m)));
      ibHlHtml += `<p class="card-ib-hl-warn">⚠️ ${parts.join('. ')}</p>`;
    }
  }

  const profile = (typeof universityProfiles !== 'undefined') ? (universityProfiles[course.university] ?? null) : null;

  // ── Requirement-data verification caveat ──────────────────────
  // If these grades/tests haven't been checked against a published
  // source, say so plainly rather than presenting them as confirmed.
  const verifyStatus = course.verification?.status ?? 'unverified';
  const unverifiedHtml = (verifyStatus !== 'verified' && (gradeStr || tests.length))
    ? `<p class="card-unverified">⚠ ${verifyStatus === 'partial'
        ? 'Some requirements not yet verified'
        : 'Requirements not yet verified'} — confirm with the university before relying on these.</p>`
    : '';

  const card = document.createElement('div');
  card.className = `course-card ${cfg.cardCls}`;
  card.setAttribute('role', 'listitem');
  card.dataset.category = course.category ?? '';
  // Lowercased haystack for the in-results search filter (uni + course name).
  card.dataset.search = `${course.university} ${course.name}`.toLowerCase();

  // Status label icons (SVG, Notion-style)
  const statusIcons = {
    green: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M7 10l2 2 4-4"/></svg>`,
    amber: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3a7 7 0 0 1 0 14V3z"/><circle cx="10" cy="10" r="7"/></svg>`,
    red:   `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M8 8l4 4M12 8l-4 4"/></svg>`,
    grey:  `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5L18.5 17H1.5L10 2.5z"/><path d="M10 8v4M10 14.5v.5"/></svg>`,
  };
  const graduationIcon = `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l7-4 7 4-7 4-7-4z"/><path d="M7 10v3.5c0 1.5 1.3 2 3 2s3-.5 3-2V10"/><path d="M17 8v4"/></svg>`;
  const chevronIcon    = `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l5 5 5-5"/></svg>`;
  const externalIcon   = `<svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4h5v5M15 4l-7 7M9 5H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-4"/></svg>`;

  let uniInfoHtml = '';
  if (profile) {
    const tagLine  = profile.tagline         ? `<p class="card-uni-tagline">${esc(profile.tagline)}</p>` : '';
    const noteLine = profile.internationalNote? `<p class="card-uni-note">${esc(profile.internationalNote)}</p>` : '';
    const webLink  = profile.websiteUrl
      ? `<a class="card-uni-link" href="${esc(profile.websiteUrl)}" target="_blank" rel="noopener noreferrer">${externalIcon} Visit website</a>`
      : '';
    const cityPart = profile.city ? ` · ${esc(profile.city)}` : '';
    uniInfoHtml = `
      <details class="card-uni-info">
        <summary>About this university${cityPart} ${chevronIcon}</summary>
        <div class="card-uni-info__body">${tagLine}${noteLine}${webLink}</div>
      </details>`;
  } else if (course.universityContext?.notes) {
    uniInfoHtml = `
      <details class="card-uni-info">
        <summary>About this university ${chevronIcon}</summary>
        <div class="card-uni-info__body"><p class="card-uni-info__notes">${esc(course.universityContext.notes)}</p></div>
      </details>`;
  }

  card.innerHTML = `
    <div class="card-status card-status--${status}">${statusIcons[status]} ${cfg.label}</div>
    <div class="card-header">
      <div class="card-title-group">
        <span class="card-flag" aria-hidden="true">${flag}</span>
        <div class="card-titles">
          <div class="card-name">${esc(course.name)}</div>
          <div class="card-uni">${graduationIcon} ${esc(course.university)}</div>
          ${tierLabel ? `<div class="card-tier">${esc(tierLabel)}</div>` : ''}
        </div>
      </div>
      ${saveButtonHtml(course.id)}
    </div>
    <div class="card-meta">
      <span>${flag}&thinsp;${esc(country)}</span>
      <span class="card-meta-sep">·</span>
      <span>${esc(course.degreeLevel)}</span>
      <span class="card-meta-sep">·</span>
      <span class="card-cat-badge">${esc(catLabel)}</span>
    </div>
    ${gradeStr ? `<div class="card-grades">${esc(sys === 'IB' ? `${gradeStr} IB points` : gradeStr)}</div>` : ''}
    ${(status === 'grey' && result.gradeGap) ? `<p class="card-grade-gap">⚠️ You have ${esc(result.gradeGap.have)}, course asks for ${esc(result.gradeGap.need)}</p>` : ''}
    ${fieldCoreHtml}
    ${usAdmitHtml}
    ${ibHlHtml}
    ${apWarningHtml}
    ${tests.length ? `
      <div class="card-admission-tests">
        ${tests.map(t => `<span class="admission-test-tag">${esc(t)} required</span>`).join('')}
      </div>` : ''}
    ${apNoteHtml}
    ${apRecsHtml}
    ${unverifiedHtml}
    ${footerHtml}
    ${uniInfoHtml}
  `;
  wireSaveButton(card);
  return card;
}

/* ═══════════════════════════════════════════════════════════════
 * REVERSE MODE — RESULTS
 * ═══════════════════════════════════════════════════════════════ */

$('courseSearchInput').addEventListener('input', e => {
  state.searchQuery = e.target.value.trim();
  renderReverseResults();
});

function renderReverseResults() {
  if (dataLoadError) return;
  const section = $('reverseResultsSection');
  const q = state.searchQuery.toLowerCase();

  if (!q) {
    section.innerHTML = '<p class="search-hint">Start typing to find courses…</p>';
    return;
  }

  const matched = courses.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.university.toLowerCase().includes(q) ||
    (COUNTRY_LABELS[c.country] ?? '').toLowerCase().includes(q)
  );

  logEvent('course_search', { query: state.searchQuery, result_count: matched.length });

  if (!matched.length) {
    section.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <p>No courses matched <strong>"${esc(state.searchQuery)}"</strong>.</p>
        <p class="mt-8">Try a broader term like <em>Medicine</em>, <em>Engineering</em>, or a university name.</p>
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  matched.forEach((course, i) => {
    const card = buildReverseCard(course);
    card.style.setProperty('--card-delay', `${Math.min(i, 12) * 0.04}s`);
    frag.appendChild(card);
  });
  section.innerHTML = '';
  section.appendChild(frag);
}

function buildReverseCard(course) {
  const sys     = state.reverseSystem;
  const flag    = COUNTRY_FLAGS[course.country] ?? '';
  const country = COUNTRY_LABELS[course.country] ?? course.country;
  const { essential = [], preferred = [], useful = [] } = course.requirements;

  const isQuant = isQuantitativeCategory(course.category);
  const tagPills = tags => {
    if (!tags.length) return '<span class="text-secondary" style="font-size:13px">None specified</span>';
    return requirementLabels(tags, sys, isQuant).map(l => `<span class="subject-tag">${esc(l)}</span>`).join('');
  };

  const rows = [
    { label:'Required', cls:'req-essential', tags: essential },
    ...(preferred.length ? [{ label:'Preferred', cls:'req-preferred', tags: preferred }] : []),
    ...(useful.length    ? [{ label:'Useful',    cls:'req-useful',    tags: useful    }] : []),
  ];

  const card = document.createElement('div');
  card.className = 'reverse-card';
  card.innerHTML = `
    <div class="card-header">
      <div class="card-title-group">
        <span class="card-flag" aria-hidden="true">${flag}</span>
        <div class="card-titles">
          <div class="card-name">${esc(course.name)}</div>
          <div class="card-uni">${esc(course.university)}</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
        <span class="badge badge--neutral">${esc(course.degreeLevel)}</span>
        <span class="badge badge--neutral">${flag}&thinsp;${esc(country)}</span>
      </div>
    </div>
    <div class="reverse-reqs">
      ${rows.map(row => `
        <div class="req-row">
          <span class="req-label ${row.cls}">${row.label}</span>
          <div class="req-tags">${tagPills(row.tags)}</div>
        </div>`).join('')}
    </div>
    ${course.notes ? `<p class="reverse-notes">${esc(course.notes)}</p>` : ''}
    <div class="reverse-card-footer">
      ${saveButtonHtml(course.id)}
      <button class="copy-btn" type="button" aria-label="Copy requirements for ${esc(course.name)} to clipboard">
        ⎘&ensp;Copy requirements
      </button>
    </div>
  `;

  wireSaveButton(card);

  // Copy-to-clipboard handler — timerId is scoped per card instance.
  let copyTimerId = null;
  card.querySelector('.copy-btn').addEventListener('click', e => {
    e.stopPropagation();
    const btn = e.currentTarget;
    if (btn.classList.contains('copying')) return;
    btn.classList.add('copying');
    const text = buildRequirementsText(course);

    const onSuccess = () => {
      card.querySelector('.copy-fallback')?.classList.add('hidden');
      btn.textContent = '✓  Copied!';
      btn.classList.add('copy-btn--done');
      showToast('Requirements copied to clipboard');
      clearTimeout(copyTimerId);
      copyTimerId = setTimeout(() => {
        btn.innerHTML = '⎘&ensp;Copy requirements';
        btn.classList.remove('copy-btn--done', 'copying');
      }, 2200);
    };

    const onFailure = () => {
      // Try the legacy execCommand path; if that also fails, surface a
      // pre-selected textarea so the user can copy manually with Ctrl/⌘+C.
      if (legacyCopyText(text)) { onSuccess(); return; }
      btn.classList.remove('copying');
      showManualCopyBox(card, text);
      showToast('Couldn’t copy automatically — the text is selected below, press Ctrl+C (⌘C on Mac).');
    };

    // navigator.clipboard can be undefined (insecure context / old browsers),
    // in which case the call throws synchronously rather than rejecting.
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(onFailure);
      } else {
        onFailure();
      }
    } catch (_) {
      onFailure();
    }
  });

  return card;
}

// Legacy clipboard path for browsers/contexts where the async Clipboard API is
// unavailable or blocked. Returns true on success.
function legacyCopyText(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

// Last-resort fallback: reveal a read-only textarea pre-filled and selected so
// the user can copy manually. Reused (one per card) across repeated clicks.
function showManualCopyBox(card, text) {
  let box = card.querySelector('.copy-fallback');
  if (!box) {
    box = document.createElement('textarea');
    box.className = 'copy-fallback';
    box.setAttribute('readonly', '');
    box.setAttribute('aria-label', 'Course requirements — select all and copy');
    box.rows = 5;
    card.querySelector('.reverse-card-footer').after(box);
  }
  box.value = text;
  box.classList.remove('hidden');
  box.focus();
  box.select();
}

// US holistic-admissions helpers (shared by copy-text and CSV export).
function usAdmitPolicyLabel(test) {
  return {
    required:    'SAT/ACT required',
    optional:    'test-optional',
    flexible:    'test-flexible (SAT/ACT/AP/IB)',
    recommended: 'SAT/ACT recommended',
    varies:      'SAT/ACT required for some schools',
    blind:       'test-blind (scores not used)',
  }[test] ?? test;
}
function usAdmitRange(a) {
  const p = [];
  if (a.sat) p.push(`SAT ${a.sat}`);
  if (a.act) p.push(`ACT ${a.act}`);
  return p.join(', ');
}

/**
 * Build a plain-text representation of a course's requirements,
 * with tags translated to the active reverse system.
 */
function buildRequirementsText(course) {
  const sys     = state.reverseSystem;
  const country = COUNTRY_LABELS[course.country] ?? course.country;
  const fmt     = tags => requirementLabels(tags, sys, isQuantitativeCategory(course.category)).join(', ');
  const { essential = [], preferred = [], useful = [] } = course.requirements;

  // US admissions is holistic — there are no hard subject requirements, so
  // label the essential line accordingly instead of the misleading "Required".
  const essentialLabel = course.country === 'US'
    ? 'Recommended for competitive applicants:'
    : 'Required:';

  // US admissions context: holistic with no grade cutoff — surface the
  // current test policy and indicative admitted SAT/ACT range as a guide.
  let usAdmitLines = [];
  if (course.country === 'US' && course.usAdmissions) {
    const a = course.usAdmissions;
    const r = usAdmitRange(a);
    usAdmitLines = ['', `Admissions: holistic, no fixed cutoff — ${usAdmitPolicyLabel(a.test)}.`,
      ...(r ? [`Typical admitted range (indicative, not a cutoff): ${r}.`] : [])];
  }

  const lines = [
    `${course.name}`,
    `${course.university} · ${country} · ${course.degreeLevel}`,
    '',
    `${essentialLabel} ${essential.length ? fmt(essential) : 'None specified'}`,
    ...(preferred.length ? [`Preferred: ${fmt(preferred)}`] : []),
    ...(useful.length    ? [`Useful:    ${fmt(useful)}`]    : []),
    ...usAdmitLines,
    ...(course.notes     ? ['', `Notes: ${course.notes}`]   : []),
  ];

  return lines.join('\n');
}

/* ═══════════════════════════════════════════════════════════════
 * SUBJECT PLANNER (Mode C)
 * ═══════════════════════════════════════════════════════════════ */

const CATEGORY_ICONS = {
  medicine:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"/><path d="M10 7v6M7 10h6"/></svg>`,
  cs:           `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7l-3 3 3 3M14 7l3 3-3 3M11 5l-2 10"/></svg>`,
  engineering:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5a2 2 0 0 0-2.8 0L5 12.2V15h2.8l7.2-7.2A2 2 0 0 0 15 5z"/><path d="M11.5 6.5l2 2"/></svg>`,
  economics:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14l4-4 3 3 5-6"/><path d="M14 7h3v3"/></svg>`,
  law:          `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3v14M5 6l5-3 5 3"/><path d="M4 10l2 4H2l2-4zM14 10l2 4h-4l2-4z"/></svg>`,
  business:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="1.5"/><path d="M7 7V6a3 3 0 0 1 6 0v1"/><path d="M2 11h16"/></svg>`,
  sciences:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v7L4.5 15.5A1 1 0 0 0 5.4 17h9.2a1 1 0 0 0 .9-1.5L12 10V3"/><path d="M7 3h6"/></svg>`,
  mathematics:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12M10 4v12M5 5l10 10M15 5L5 15"/></svg>`,
  psychology:   `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3a5 5 0 0 1 4.5 7.2L17 17H3l2.5-6.8A5 5 0 0 1 10 3z"/><path d="M8 13h4"/></svg>`,
  architecture: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h14M5 17V9l5-5 5 5v8"/><path d="M9 17v-4h2v4"/></svg>`,
};

/* ═══════════════════════════════════════════════════════════════
 * CANDIDATE FIELDS — the durable output of the exploring stage.
 * profile.candidateFields (max 3 category ids) is the single source
 * of truth: pinned from Strengths / Field Overview, selected directly
 * in the Subject Planner, and shown on the workspace home.
 * ═══════════════════════════════════════════════════════════════ */

// Short field names for badges and per-field counts on combination rows.
const PLAN_FIELD_SHORT = {
  medicine: 'Medicine', cs: 'CS', engineering: 'Engineering',
  economics: 'Economics', law: 'Law', business: 'Business',
  sciences: 'Sciences', psychology: 'Psychology',
  architecture: 'Architecture', mathematics: 'Maths',
};
const planFieldShort = id => PLAN_FIELD_SHORT[id] ?? CATEGORY_LABEL_MAP[id] ?? id;

// The planner's selected fields — always read fresh from the profile.
function plannerFields() {
  if (typeof AltioraState === 'undefined') return [];
  return AltioraState.getCandidateFields().filter(id => CATEGORY_LABEL_MAP[id]).slice(0, 3);
}

// Toggle a field pin from anywhere (strengths card, field overview,
// planner grid). Returns true if the set changed.
function togglePinnedField(catId, { silent = false } = {}) {
  const label = CATEGORY_LABEL_MAP[catId] ?? catId;
  const pinned = AltioraState.getCandidateFields().includes(catId);
  if (pinned) {
    AltioraState.removeCandidateField(catId);
    if (!silent) showToast(`${label} removed from your fields.`);
    logEvent('candidate_field_remove', { field: catId });
    return true;
  }
  if (!AltioraState.addCandidateField(catId)) {
    showToast(`You can keep up to ${AltioraState.MAX_CANDIDATE_FIELDS} fields — remove one to add ${label}.`);
    return false;
  }
  if (!silent) showToast(`${label} added to your fields (${AltioraState.getCandidateFields().length}/${AltioraState.MAX_CANDIDATE_FIELDS}).`);
  logEvent('candidate_field_add', { field: catId });
  return true;
}

// Reflect the pinned set on the planner's field grid.
function syncPlanGridSelection() {
  const set = new Set(plannerFields());
  $$('#planCategoryGrid .plan-cat-card').forEach(c => {
    const on = set.has(c.dataset.category);
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', String(on));
  });
}

function buildPlanCategoryGrid() {
  const grid = $('planCategoryGrid');
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plan-cat-card';
    btn.dataset.category = cat.id;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `
      <span class="plan-cat-card__icon" aria-hidden="true">${CATEGORY_ICONS[cat.id] ?? cat.icon}</span>
      <span class="plan-cat-card__label">${esc(cat.label)}</span>
    `;
    btn.addEventListener('click', () => {
      // Multi-select: the grid toggles membership of profile.candidateFields.
      if (!togglePinnedField(cat.id, { silent: true })) return;   // cap hit — toast shown
      $('planResults').classList.add('hidden');
      renderPlanResults();
    });
    grid.appendChild(btn);
  });
}

function getCombinations(arr, size) {
  if (size === 1) return arr.map(x => [x]);
  const out = [];
  for (let i = 0; i <= arr.length - size; i++) {
    getCombinations(arr.slice(i + 1), size - 1).forEach(rest => out.push([arr[i], ...rest]));
  }
  return out;
}

// Rank subject combinations for a category by how many of its courses
// they unlock (green then amber), reading live from the course data.
// Shared by Subject Planner and the Field Overview screen. Returns
// [{ combo: tags[], green, amber }], strongest first.
function rankCategoryCombinations(category, limit = 5) {
  const catCourses = courses.filter(c => c.category === category);
  if (!catCourses.length) return [];

  // Build combos only from the field's MEANINGFUL subjects (core +
  // helpful), so outlier requirements (e.g. Biology for general
  // Engineering) never form a recommended combination.
  const topTags = fieldSubjectTags(category).poolTags.slice(0, 6);
  if (!topTags.length) return [];

  // Generate candidate combos of 2–3 subjects, normalise the maths pair
  // (Advanced implies Standard, so "Further Maths" reads as "Maths +
  // Further Maths"), drop anything beyond 3 subjects (not a realistic
  // choice), and dedupe identical tag sets.
  const byKey = new Map();
  for (let size = 2; size <= 3; size++) {
    for (const raw of getCombinations(topTags, size)) {
      const tags = normaliseComboTags(raw);
      if (tags.length > 3) continue;
      const key = [...tags].sort().join('|');
      if (!byKey.has(key)) byKey.set(key, tags);
    }
  }

  // Score each combo: which courses it opens (green/amber), as a set.
  const scored = [...byKey.values()].map(tags => {
    const tagSet = new Set(tags);
    const opened = new Set();
    let green = 0, amber = 0;
    catCourses.forEach(course => {
      const r = classify(course, tagSet);
      if (r.status === 'green') { green++; opened.add(course.id); }
      else if (r.status === 'amber') { amber++; opened.add(course.id); }
    });
    return { tags, green, amber, total: green + amber };
  }).filter(s => s.total > 0);

  // Drop redundant supersets: if combo B's tags are a superset of a simpler
  // combo A and they open the same number of courses, B's extra subject
  // adds nothing — keep only the simpler, genuinely-distinct A.
  const kept = scored.filter(b =>
    !scored.some(a =>
      a !== b &&
      a.tags.length < b.tags.length &&
      a.tags.every(t => b.tags.includes(t)) &&
      a.total === b.total
    )
  );

  // Order each combo's subjects for display: Maths, then Further Maths,
  // then the rest.
  const order = t => t === MATHS_STD ? 0 : t === MATHS_ADV ? 1 : 2;
  return kept
    .sort((a, b) => b.green - a.green || b.amber - a.amber)
    .map(({ tags, green, amber }) => ({ combo: [...tags].sort((x, y) => order(x) - order(y)), green, amber }))
    .slice(0, limit);
}

// Dedupe ranked combos by how they DISPLAY in a given system — e.g. in
// AP/SG the standard and advanced maths resolve to the same subject, so
// two tag-combos can render identically; keep the strongest of each.
function combosForDisplay(category, system, isQuant, limit) {
  const seen = new Set();
  const out = [];
  for (const c of rankCategoryCombinations(category, 16)) {
    // Skip combos that rely on a subject not offered in this system.
    if (!c.combo.every(t => tagExistsInSystem(t, system))) continue;
    const key = comboLabels(c.combo, system, isQuant).join(' + ');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════
 * MULTI-FIELD COMBINATION RANKING — "The Gate".
 * Rank subject combinations by how many doors they keep open ACROSS
 * ALL the student's candidate fields, not within one. A combination's
 * value = fields covered first (a set that zeroes one of your fields
 * is worse than one that keeps all alive), then the sum of per-field
 * coverage FRACTIONS (so a small field like Architecture isn't drowned
 * out by a big one), then fewer subjects. Combinations may use up to 4
 * subjects — keeping several fields open sometimes genuinely needs 4,
 * and the UI says so honestly rather than pretending 3 always works.
 * ═══════════════════════════════════════════════════════════════ */

// Per-field opened-course counts for a tag set (green/amber via classify —
// the same "subject requirements satisfied" metric used everywhere).
function perFieldOpened(perField, tagSet) {
  return perField.map(f => {
    let opened = 0;
    f.courses.forEach(c => {
      const s = classify(c, tagSet).status;
      if (s === 'green' || s === 'amber') opened++;
    });
    return { cat: f.cat, opened, total: f.courses.length };
  });
}

function rankMultiFieldCombinations(cats, limit = 16) {
  const perField = cats.map(cat => ({
    cat,
    courses: courses.filter(c => c.category === cat),
    pool: fieldSubjectTags(cat).poolTags.slice(0, 6),
  }));

  // Pooled candidate tags: subjects serving MORE of the fields first,
  // then by how highly each field ranks them. Cap the pool so the
  // combination space stays tractable.
  const tagStat = new Map();
  perField.forEach(f => f.pool.forEach((t, i) => {
    const s = tagStat.get(t) || { fields: 0, rank: 0 };
    s.fields++; s.rank += i;
    tagStat.set(t, s);
  }));
  const pool = [...tagStat.keys()]
    .sort((a, b) => tagStat.get(b).fields - tagStat.get(a).fields
                 || tagStat.get(a).rank - tagStat.get(b).rank)
    .slice(0, 10);
  if (!pool.length) return { combos: [], allCovered3: false, allCovered4: false };

  // Candidate combos of 2–4 subjects (normalised: Further Maths implies
  // Maths), deduped by tag set.
  const byKey = new Map();
  for (let size = 2; size <= 4; size++) {
    for (const raw of getCombinations(pool, size)) {
      const tags = normaliseComboTags(raw);
      if (tags.length > 4) continue;
      const key = [...tags].sort().join('|');
      if (!byKey.has(key)) byKey.set(key, tags);
    }
  }

  const nFields = cats.length;
  const scored = [...byKey.values()].map(tags => {
    const per = perFieldOpened(perField, new Set(tags));
    const covered = per.filter(p => p.opened > 0).length;
    const frac = per.reduce((s, p) => s + (p.total ? p.opened / p.total : 0), 0);
    return { tags, per, covered, frac };
  }).filter(s => s.covered > 0);

  // A field only counts as genuinely KEPT OPEN when the combo achieves at
  // least half of the best per-field coverage any combination in the pool
  // reaches — "≥1 course ambers through" is not a kept door. This is what
  // makes the low-overlap conflict message computed rather than manufactured.
  const bestSolo = {};
  cats.forEach(cat => { bestSolo[cat] = 0; });
  scored.forEach(s => s.per.forEach(p => { if (p.opened > bestSolo[p.cat]) bestSolo[p.cat] = p.opened; }));
  const wellKeptCount = s => s.per.filter(p => bestSolo[p.cat] === 0 || (p.opened > 0 && p.opened >= bestSolo[p.cat] / 2)).length;
  scored.forEach(s => { s.wellKept = wellKeptCount(s); });

  const allKept3 = scored.some(s => s.wellKept === nFields && s.tags.length <= 3);
  const allKept4 = scored.some(s => s.wellKept === nFields && s.tags.length <= 4);

  // Prune supersets that add nothing over a strictly smaller combo.
  const kept = scored.filter(b =>
    !scored.some(a =>
      a !== b && a.tags.length < b.tags.length &&
      a.tags.every(t => b.tags.includes(t)) &&
      a.wellKept >= b.wellKept && a.covered >= b.covered && a.frac >= b.frac - 1e-9
    )
  );

  const order = t => t === MATHS_STD ? 0 : t === MATHS_ADV ? 1 : 2;
  const combos = kept
    .sort((a, b) => b.wellKept - a.wellKept || b.covered - a.covered || b.frac - a.frac || a.tags.length - b.tags.length)
    .map(({ tags, per, covered, wellKept }) => ({ combo: [...tags].sort((x, y) => order(x) - order(y)), per, covered, wellKept }))
    .slice(0, limit);

  return { combos, allCovered3: allKept3, allCovered4: allKept4, perField };
}

// System-display dedupe for multi-field combos (mirrors combosForDisplay).
function multiCombosForDisplay(cats, system, isQuant, limit) {
  const ranked = rankMultiFieldCombinations(cats, 24);
  const seen = new Set();
  const out = [];
  for (const c of ranked.combos) {
    if (!c.combo.every(t => tagExistsInSystem(t, system))) continue;
    const key = comboLabels(c.combo, system, isQuant).join(' + ');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= limit) break;
  }
  return { combos: out, allCovered3: ranked.allCovered3, allCovered4: ranked.allCovered4, perField: ranked.perField };
}

// Display parts for a combo where each part knows which TAGS disappear if
// the student drops that subject (dropping Maths also drops Further Maths;
// dropping Further Maths keeps Maths). Labels resolve via the same shared
// helpers as comboLabels so the two never disagree on naming.
function comboLabelParts(combo, system, isQuant) {
  const inSys = combo.filter(t => tagExistsInSystem(t, system));
  const hasStd = inSys.includes(MATHS_STD), hasAdv = inSys.includes(MATHS_ADV);
  const mathsTags = inSys.filter(t => t === MATHS_STD || t === MATHS_ADV);
  const parts = [];
  const seen = new Set();
  let mathsDone = false;
  for (const t of inSys) {
    if (t === MATHS_STD || t === MATHS_ADV) {
      if (mathsDone) continue;
      mathsDone = true;
      if (hasStd && hasAdv && mathsAdvancedIsSeparate(system)) {
        parts.push({ label: mathsSubjectName(MATHS_STD, system, isQuant), dropTags: [MATHS_STD, MATHS_ADV] });
        parts.push({ label: mathsSubjectName(MATHS_ADV, system, isQuant), dropTags: [MATHS_ADV] });
      } else {
        parts.push({ label: mathsSubjectName(hasAdv ? MATHS_ADV : MATHS_STD, system, isQuant), dropTags: mathsTags });
      }
      continue;
    }
    const label = subjectTagLabel(t, system, isQuant);
    if (label && !seen.has(label)) { seen.add(label); parts.push({ label, dropTags: [t] }); }
  }
  return parts;
}

// Subjects that must be taken TOGETHER for most of a field's courses.
const PLAN_PAIR_RULES = {
  medicine:     [['Chemistry', 'Biology']],
  engineering:  [['Mathematics_Advanced', 'Physics']],
  cs:           [],
  economics:    [['Mathematics_Standard', 'Economics']],
  sciences:     [['Chemistry', 'Biology'], ['Chemistry', 'Mathematics_Advanced']],
  mathematics:  [],
  law:          [],
  psychology:   [['Psychology', 'Biology']],
  architecture: [['Art_Design', 'Mathematics_Standard']],
  business:     [['Mathematics_Standard', 'Economics']],
};

// Dispatcher: the planner optimises across the student's candidate fields.
// One field → the established single-field view (unchanged behaviour).
// Two or three → cross-field optimisation with door-closing warnings.
function renderPlanResults() {
  if (dataLoadError) return;
  // System is a single global property — read it from the profile rather than
  // any in-body selector (the nav control is the only selector).
  if (!state.planSystem) state.planSystem = AltioraState.getProfile().qualificationSystem;
  syncPlanGridSelection();
  if (!state.planSystem) return;

  const fields = plannerFields();
  if (fields.length === 0) {
    $('planResults').classList.add('hidden');
    return;
  }
  if (fields.length === 1) renderSingleFieldPlan(fields[0]);
  else renderMultiFieldPlan(fields);
}

function renderSingleFieldPlan(category) {
  const catCourses = courses.filter(c => c.category === category);
  if (!catCourses.length) {
    $('planEssentials').innerHTML   = '<p class="search-hint">No courses found for this area.</p>';
    $('planCombinations').innerHTML = '';
    $('planResults').classList.remove('hidden');
    return;
  }

  const catLabel = CATEGORY_LABEL_MAP[category] ?? category;

  /* ── Section A: essential subject tags, sorted by frequency ── */
  const tagFreq = {};
  catCourses.forEach(c =>
    (c.requirements.essential ?? []).forEach(t => { tagFreq[t] = (tagFreq[t] ?? 0) + 1; })
  );
  const sortedTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]);

  // Collect ibHL tags commonly required for this category (for IB HL badges)
  const ibHLTagsForCategory = new Set();
  if (state.planSystem === 'IB') {
    catCourses.forEach(c => {
      if (c.country !== 'US') (c.grades?.ibHL ?? []).forEach(t => ibHLTagsForCategory.add(t));
    });
  }

  // Field-level requirements: what a MAJORITY of courses need (maths
  // collapsed across levels), with system + quant-aware labels.
  const isQuant = isQuantitativeCategory(category);
  const ft = fieldSubjectTags(category);
  const essCount = {};
  catCourses.forEach(c => new Set(c.requirements.essential ?? []).forEach(t => { essCount[t] = (essCount[t] ?? 0) + 1; }));
  const mathsEssN = catCourses.filter(c => (c.requirements.essential ?? []).some(t => t === MATHS_STD || t === MATHS_ADV)).length;

  if (ft.core.length === 0) {
    $('planEssentials').innerHTML = `
      <h3 class="plan-section-head">Essential subjects</h3>
      <p class="plan-section-sub">No specific subject requirements — ${esc(catLabel)} courses are broadly open.</p>`;
  } else {
    const entries = [];
    let mathsDone = false;
    ft.core.forEach(t => {
      if (t === MATHS_STD || t === MATHS_ADV) {
        if (mathsDone) return;
        mathsDone = true;
        const label = requirementLabels(ft.core.filter(x => x === MATHS_STD || x === MATHS_ADV), state.planSystem, isQuant)[0];
        entries.push({ tag: t, label, count: mathsEssN });
      } else {
        entries.push({ tag: t, label: subjectTagLabel(t, state.planSystem, isQuant), count: essCount[t] ?? 0 });
      }
    });
    const chipsHtml = entries.map(({ tag, label, count }) => {
      const hlBadge = ibHLTagsForCategory.has(tag) ? `<span class="plan-subject-chip__hl">HL</span>` : '';
      return `
      <div class="plan-subject-chip">
        <span class="plan-subject-chip__name">${esc(label)}${hlBadge}</span>
        <span class="plan-subject-chip__count">required by ${count} course${count !== 1 ? 's' : ''}</span>
      </div>`;
    }).join('');
    const note = ft.outliers
      ? `<p class="plan-section-sub plan-section-note">Some specialised courses (e.g. niche or interdisciplinary degrees) have different requirements — check individual courses.</p>`
      : '';
    $('planEssentials').innerHTML = `
      <h3 class="plan-section-head">Essential subjects</h3>
      <p class="plan-section-sub">Subjects that a majority of ${esc(catLabel)} courses require.</p>
      <div class="plan-essentials-grid">${chipsHtml}</div>
      ${note}
    `;
  }

  /* ── Section 1.5: Critical pairs ── */
  const tagPresence = new Set(sortedTags.map(([t]) => t));
  const validPairs = (PLAN_PAIR_RULES[category] ?? [])
    .filter(pair => pair.every(t => tagPresence.has(t)));

  if (validPairs.length > 0) {
    const pairsHtml = validPairs.map(pair =>
      `<div class="plan-subject-chip">
         <span class="plan-subject-chip__name">${esc(comboLabels(pair, state.planSystem, isQuant).join(' + '))}</span>
         <span class="plan-subject-chip__count">required together for most courses</span>
       </div>`
    ).join('');
    $('planCriticalPairs').innerHTML = `
      <h3 class="plan-section-head" style="margin-top: var(--space-8);">Critical pairs</h3>
      <p class="plan-section-sub">Most ${esc(catLabel)} courses require both subjects, not just one. Plan to take them together.</p>
      <div class="plan-essentials-grid">${pairsHtml}</div>
    `;
  } else {
    $('planCriticalPairs').innerHTML = '';
  }

  /* ── Section B: top subject combinations (or AP guidance) ── */
  // AP has no fixed-count combination model — replace the ranked 3–5 subject
  // combos with field-aligned AP guidance driven by apContext.
  if (state.planSystem === 'US_AP') {
    $('planCombinations').innerHTML = `
      <h3 class="plan-section-head">Building a strong AP profile for ${esc(catLabel)}</h3>
      <p class="plan-section-sub">AP admission isn't about a fixed set of subjects — it's about taking enough rigorous, field-aligned APs.</p>
      ${apGuidancePanelHtml(category)}`;
    $('planResults').classList.remove('hidden');
    requestAnimationFrame(() =>
      $('planResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    return;
  }

  const top5 = combosForDisplay(category, state.planSystem, isQuant, 5);

  if (top5.length === 0) {
    $('planCombinations').innerHTML = '';
  } else {
    // Subjects-only screen: report a single, plain course count — how many
    // courses this combination satisfies the SUBJECT requirements for
    // (green + amber from classify; red = missing an essential subject). The
    // grade-aware GREEN/AMBER/RED split lives only in Check Combination.
    const rowsHtml = top5.map(({ combo, green, amber }) => {
      const opens = green + amber;
      const tags = comboLabels(combo, state.planSystem, isQuant).map(l => `<span class="plan-combo-tag">${esc(l)}</span>`).join('');
      return `
        <div class="plan-combo-row" tabindex="0" role="button"
             aria-label="Apply this subject combination in Check Combination mode"
             data-tags="${esc(JSON.stringify(combo))}">
          ${tags}
          <span class="plan-combo-arrow" aria-hidden="true">→</span>
          <div class="plan-combo-results">
            <span class="badge badge--neutral">opens ${opens} course${opens !== 1 ? 's' : ''}</span>
          </div>
        </div>`;
    }).join('');

    $('planCombinations').innerHTML = `
      <h3 class="plan-section-head">Subject combinations that open the most doors</h3>
      <p class="plan-section-sub">Combinations ranked by how many ${esc(catLabel)} courses become accessible. Click any row to try it in Check Combination.</p>
      <div class="plan-combo-list">${rowsHtml}</div>
    `;

    $$('#planCombinations .plan-combo-row').forEach(row => {
      const go = () => switchToPlanCombo(JSON.parse(row.dataset.tags), state.planSystem);
      row.addEventListener('click', go);
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  $('planResults').classList.remove('hidden');
  requestAnimationFrame(() =>
    $('planResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  );
}

/* ═══════════════════════════════════════════════════════════════
 * MULTI-FIELD PLAN — the Gate view.
 * "I'm torn between these fields: what combination keeps them ALL
 * open, and what do I lose if I drop X?"
 * ═══════════════════════════════════════════════════════════════ */

// The consequence of dropping one subject from a combination, per field.
// Factual and calm: the numbers, then the consequence.
function dropAnalysisHtml(comboTags, dropTags, label, cats) {
  const perField = cats.map(cat => ({ cat, courses: courses.filter(c => c.category === cat) }));
  const before = perFieldOpened(perField, new Set(comboTags));
  const after  = perFieldOpened(perField, new Set(comboTags.filter(t => !dropTags.includes(t))));
  const bits = before.map((b, i) => {
    const a = after[i];
    const zeroed = b.opened > 0 && a.opened === 0;
    return `<span class="plan-drop-field${zeroed ? ' plan-combo-field--zero' : ''}">${esc(planFieldShort(b.cat))} ${b.opened} → ${a.opened}</span>`;
  }).join('<span class="plan-combo-fieldsep" aria-hidden="true">·</span>');
  const closed = before.filter((b, i) => b.opened > 0 && after[i].opened === 0).length;
  const closure = closed > 0
    ? ` <strong class="plan-drop-closure">— effectively closes ${closed} of your ${cats.length} fields.</strong>`
    : '.';
  return `<span class="plan-drop-lead">Without ${esc(label)}:</span> ${bits}${closure}`;
}

function renderMultiFieldPlan(cats) {
  const sys = state.planSystem;
  const isQuant = cats.some(isQuantitativeCategory);
  const nFields = cats.length;
  const allPhrase = nFields === 2 ? 'both' : `all ${nFields}`;
  const fieldNames = cats.map(c => CATEGORY_LABEL_MAP[c] ?? c);
  const allCourses = cats.flatMap(cat => courses.filter(c => c.category === cat));
  const totalCourses = allCourses.length;

  /* ── Essential subjects: per-field cores, intersection-aware ── */
  // One entry per subject (maths collapsed across levels), knowing which
  // of the selected fields treat it as core.
  const entryMap = new Map();
  cats.forEach(cat => {
    const ft = fieldSubjectTags(cat);
    ft.core.forEach(t => {
      const isMaths = (t === MATHS_STD || t === MATHS_ADV);
      const key = isMaths ? 'MATHS' : t;
      let e = entryMap.get(key);
      if (!e) { e = { key, isMaths, coreMathsTags: new Set(), fields: new Set() }; entryMap.set(key, e); }
      e.fields.add(cat);
      if (isMaths) e.coreMathsTags.add(t);
    });
  });

  // IB HL badge pool across the selected fields' courses.
  const hlTags = new Set();
  if (sys === 'IB') {
    allCourses.forEach(c => { if (c.country !== 'US') (c.grades?.ibHL ?? []).forEach(t => hlTags.add(t)); });
  }

  const requiredBy = e => allCourses.filter(c => {
    const ess = c.requirements?.essential ?? [];
    return e.isMaths ? (ess.includes(MATHS_STD) || ess.includes(MATHS_ADV)) : ess.includes(e.key);
  }).length;

  const entries = [...entryMap.values()]
    .map(e => ({ ...e, count: requiredBy(e) }))
    .sort((a, b) => b.fields.size - a.fields.size || b.count - a.count);

  if (entries.length === 0) {
    $('planEssentials').innerHTML = `
      <h3 class="plan-section-head">Essential subjects across your fields</h3>
      <p class="plan-section-sub">No specific subject requirements — ${esc(fieldNames.join(', '))} courses are broadly open.</p>`;
  } else {
    const chipsHtml = entries.map(e => {
      const label = e.isMaths
        ? requirementLabels([...e.coreMathsTags], sys, isQuant)[0]
        : subjectTagLabel(e.key, sys, isQuant);
      const hlBadge = (e.isMaths ? (hlTags.has(MATHS_ADV) || hlTags.has(MATHS_STD)) : hlTags.has(e.key))
        ? `<span class="plan-subject-chip__hl">HL</span>` : '';
      const coversAll = e.fields.size === nFields;
      const coverText = coversAll
        ? (nFields === 2 ? 'covers both of your fields' : `covers all ${nFields} of your fields`)
        : [...e.fields].map(planFieldShort).join(' + ');
      // Door-closing line: only where the closure is real and computed.
      const closure = totalCourses && (e.count / totalCourses) >= 0.5
        ? ` — <span class="plan-chip-closure">dropping it closes most doors</span>`
        : '';
      return `
      <div class="plan-subject-chip plan-subject-chip--multi">
        <span class="plan-subject-chip__name">${esc(label)}${hlBadge}</span>
        <span class="plan-chip-covers${coversAll ? ' plan-chip-covers--all' : ''}">${esc(coverText)}</span>
        <span class="plan-subject-chip__count">required by ${e.count} of ${totalCourses} courses across your fields${closure}</span>
      </div>`;
    }).join('');
    $('planEssentials').innerHTML = `
      <h3 class="plan-section-head">Essential subjects across your fields</h3>
      <p class="plan-section-sub">What a majority of courses in each field require — subjects serving several of your fields are your anchor choices.</p>
      <div class="plan-essentials-grid">${chipsHtml}</div>`;
  }

  /* ── Critical pairs, badged per field ── */
  const pairsHtml = cats.flatMap(cat => {
    const present = new Set();
    courses.filter(c => c.category === cat)
      .forEach(c => (c.requirements?.essential ?? []).forEach(t => present.add(t)));
    return (PLAN_PAIR_RULES[cat] ?? [])
      .filter(pair => pair.every(t => present.has(t)))
      .map(pair => `
        <div class="plan-subject-chip">
          <span class="plan-subject-chip__name">${esc(comboLabels(pair, sys, isQuant).join(' + '))}</span>
          <span class="plan-field-badge">${esc(planFieldShort(cat))}</span>
          <span class="plan-subject-chip__count">required together for most courses</span>
        </div>`);
  }).join('');
  $('planCriticalPairs').innerHTML = pairsHtml ? `
    <h3 class="plan-section-head" style="margin-top: var(--space-8);">Critical pairs</h3>
    <p class="plan-section-sub">These subjects are needed together, not just one of them.</p>
    <div class="plan-essentials-grid">${pairsHtml}</div>` : '';

  /* ── AP: multi-field profile guidance (no "pick 3" model) ── */
  if (sys === 'US_AP') {
    const guidances = cats.map(cat => ({ cat, g: apFieldGuidance(cat) }));
    const withG = guidances.filter(x => x.g && x.g.subjects.length);
    let sharedHtml = '';
    if (withG.length === cats.length && nFields > 1) {
      const shared = withG.map(x => new Set(x.g.subjects))
        .reduce((acc, s) => new Set([...acc].filter(v => s.has(v))));
      if (shared.size) {
        sharedHtml = `
          <p class="ap-guidance__line"><span class="plan-chip-covers plan-chip-covers--all">APs that serve ${nFields === 2 ? 'both' : 'all'} of your fields</span></p>
          <div class="ap-guidance__chips">${[...shared].map(s => `<span class="ap-guidance__chip">${esc(s)}</span>`).join('')}</div>`;
      }
    }
    $('planCombinations').innerHTML = `
      <h3 class="plan-section-head">Building a strong AP profile for your fields</h3>
      <p class="plan-section-sub">AP admission isn't about a fixed set of subjects — build enough rigorous APs aligned with the fields you're considering.</p>
      ${sharedHtml}
      ${cats.map(cat => `
        <div class="plan-ap-field">
          <span class="plan-field-badge">${esc(CATEGORY_LABEL_MAP[cat] ?? cat)}</span>
          ${apGuidancePanelHtml(cat)}
        </div>`).join('')}`;
    $('planResults').classList.remove('hidden');
    requestAnimationFrame(() =>
      $('planResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    return;
  }

  /* ── Combinations ranked by cross-field coverage ── */
  const { combos, allCovered3, allCovered4 } = multiCombosForDisplay(cats, sys, isQuant, 5);

  // Honest conflict messaging — computed, never manufactured.
  let conflictHtml = '';
  if (combos.length && !allCovered4) {
    conflictHtml = `
      <div class="plan-conflict">
        <strong>These fields share few subjects.</strong> No combination of up to 4 subjects keeps
        ${allPhrase} open — keeping them all alive means a hard choice. Here's the best compromise:
      </div>`;
  } else if (combos.length && !allCovered3) {
    conflictHtml = `
      <div class="plan-conflict">
        <strong>These fields share few subjects</strong> — keeping ${allPhrase} open needs
        4 subjects, or a hard choice. Here's the best compromise:
      </div>`;
  }

  if (!combos.length) {
    $('planCombinations').innerHTML = `
      <h3 class="plan-section-head">Combinations that keep your fields open</h3>
      <p class="plan-section-sub">No standout combinations — these fields are flexible on subjects.</p>`;
  } else {
    const rowsHtml = combos.map(({ combo, per }) => {
      const parts = comboLabelParts(combo, sys, isQuant);
      const tagsHtml = parts.map(p => `
        <button type="button" class="plan-combo-tag plan-combo-tag--drop"
                data-drop="${esc(JSON.stringify(p.dropTags))}" data-droplabel="${esc(p.label)}"
                title="What if I drop ${esc(p.label)}?"
                aria-label="What changes without ${esc(p.label)}?">${esc(p.label)}</button>`).join('');
      const fieldsHtml = per.map((p, i) =>
        `<span class="plan-combo-field${p.opened === 0 ? ' plan-combo-field--zero' : ''}">${esc(planFieldShort(p.cat))}: ${p.opened}${i === 0 ? ' courses' : ''}</span>`
      ).join('<span class="plan-combo-fieldsep" aria-hidden="true">·</span>');
      return `
        <div class="plan-combo-row plan-combo-row--multi" tabindex="0" role="button"
             aria-label="Apply this subject combination in Check Combination mode. Or activate a subject to see what dropping it would cost."
             data-tags="${esc(JSON.stringify(combo))}">
          <div class="plan-combo-main">
            ${tagsHtml}
            <span class="plan-combo-arrow" aria-hidden="true">→</span>
            <div class="plan-combo-results plan-combo-fields">${fieldsHtml}</div>
          </div>
          <div class="plan-combo-drop hidden" aria-live="polite"></div>
        </div>`;
    }).join('');

    $('planCombinations').innerHTML = `
      <h3 class="plan-section-head">Combinations that keep your fields open</h3>
      <p class="plan-section-sub">Ranked by how many courses stay open across ${esc(fieldNames.join(', '))}.
      Click a row to try it in Check Combination — or click a subject to see what dropping it would cost.</p>
      ${conflictHtml}
      <div class="plan-combo-list">${rowsHtml}</div>`;

    $$('#planCombinations .plan-combo-row').forEach(row => {
      const go = () => switchToPlanCombo(JSON.parse(row.dataset.tags), sys);
      row.addEventListener('click', go);
      row.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === row) { e.preventDefault(); go(); }
      });
      const panel = row.querySelector('.plan-combo-drop');
      row.querySelectorAll('.plan-combo-tag--drop').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();   // a drop-inspection must never navigate away
          const label = btn.dataset.droplabel;
          if (panel.dataset.for === label && !panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            panel.dataset.for = '';
            return;
          }
          panel.dataset.for = label;
          panel.innerHTML = dropAnalysisHtml(
            JSON.parse(row.dataset.tags), JSON.parse(btn.dataset.drop), label, cats);
          panel.classList.remove('hidden');
        });
      });
    });
  }

  $('planResults').classList.remove('hidden');
  requestAnimationFrame(() =>
    $('planResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  );
}

function switchToPlanCombo(tags, systemKey) {
  switchMode('check');
  state.checkSystem      = systemKey;
  state.selectedSubjects = [];
  state.selectedTags     = new Set();
  // Arriving from the Planner: the planned category is the intent, so drop any
  // stale field-exploration context. Otherwise buildSubjectPicker →
  // applyExploreFieldFilter would re-apply the old field's category (wrong chip
  // + "Exploring X" banner) and a later system change would snap the filter
  // back to it instead of the planned category.
  state.exploreField = null;
  buildSubjectPicker(systemKey);

  // Tick the exact subjects the planner DISPLAYED, via the shared comboLabels
  // logic — never one tag at a time. This keeps the selection consistent with
  // the combo shown and resolves maths correctly per system: one rigorous maths
  // for level-based systems (e.g. IB AA HL, not SL+HL or the applied variant;
  // SG H2, not H1+H2), and Maths + Further Maths only where genuinely separate.
  const planFields = plannerFields();
  const isQuant = planFields.some(isQuantitativeCategory);
  const targetNames = new Set(comboLabels(tags, systemKey, isQuant));
  $$('#subjectPicker input[type="checkbox"]').forEach(cb => {
    if (targetNames.has(cb.value)) cb.checked = true;
  });

  onSubjectToggle();

  if (planFields.length) {
    // Filter Check Combination to ALL the student's candidate fields.
    state.selectedCategories = new Set(planFields);
    $$('#categoryPicker .category-chip').forEach(btn => {
      const active = planFields.includes(btn.dataset.category);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    renderCheckResults();
  }

  requestAnimationFrame(() => {
    const results = $('checkResultsSection');
    if (!results.classList.contains('hidden'))
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ═══════════════════════════════════════════════════════════════
 * STRENGTHS MODE (Mode D)
 * ═══════════════════════════════════════════════════════════════ */

// Six strengths a student can recognise in themselves. Each maps to a set
// of FIELDS (degree areas) — never to specific courses or universities.
const STRENGTHS_OPTIONS = [
  { id:'maths_physics',     label:'Maths & Physics',          icon:'📐', description:'You enjoy problem-solving, patterns, and understanding how things work.',                          fields:['engineering','cs','physics','mathematics','architecture'] },
  { id:'biology_chemistry', label:'Biology & Chemistry',      icon:'🧬', description:"You're curious about living systems, health, and the molecular world.",                          fields:['medicine','natural-sciences','psychology'] },
  { id:'essays_writing',    label:'Essay writing & argument', icon:'📝', description:'You express ideas clearly, love reading, and can argue both sides.',                              fields:['law','economics','psychology'] },
  { id:'data_code',         label:'Data & code',              icon:'📊', description:'You spot patterns in data and enjoy making computers do the work.',                              fields:['cs','mathematics','economics'] },
  { id:'creative_design',   label:'Creative & design',        icon:'🎨', description:'You think visually and enjoy creating things that are both beautiful and functional.',           fields:['architecture','business'] },
  { id:'people_society',    label:'People & society',         icon:'👥', description:'You care about how people think, behave, and organise themselves.',                              fields:['psychology','law','business','economics'] },
];

// Fields of study (degree areas). `category` is the course-data category
// used to pre-filter Check Combination — country is never assumed.
const STRENGTH_FIELDS = {
  engineering: {
    name: 'Engineering', category: 'engineering',
    what: 'Designing and building the physical and digital systems the world runs on, from bridges and engines to renewable energy and robotics. Combines maths and physics with hands-on problem solving.',
    leads: 'Civil, mechanical, electrical or aerospace engineering, robotics, energy and sustainability, product design, and increasingly tech and finance.',
    needs: 'Maths essential, Physics usually required.',
  },
  cs: {
    name: 'Computer Science', category: 'cs',
    what: 'How computers and software actually work, from the logic underneath to building applications, AI systems, and large-scale platforms. More about problem-solving and logical thinking than just coding.',
    leads: 'Software engineering, AI and machine learning, cybersecurity, data science, fintech, startups, and research.',
    needs: 'Maths essential; Computer Science or Physics helpful but rarely required.',
  },
  mathematics: {
    name: 'Mathematics', category: 'mathematics',
    what: 'The deep study of patterns, structures, and logic that underpins almost every other field. Abstract and rigorous, rewarding for those who enjoy problems for their own sake.',
    leads: 'Finance and quantitative trading, data science, AI research, actuarial work, academia, and almost any analytical career.',
    needs: 'Maths essential, Further Maths strongly preferred.',
  },
  physics: {
    name: 'Physics', category: 'sciences',
    what: 'Understanding how the universe works at every scale, from subatomic particles to galaxies. The most fundamental science, heavy on maths and conceptual thinking.',
    leads: 'Research, engineering, finance, data science, energy, aerospace, and technology.',
    needs: 'Maths and Physics essential.',
  },
  architecture: {
    name: 'Architecture', category: 'architecture',
    what: 'Designing buildings and spaces where form meets function, blending creative vision with technical and structural understanding. A long professional path (typically 7 years to qualify).',
    leads: 'Architecture, urban design, landscape architecture, interior design, and the wider built environment.',
    needs: 'Usually no specific subjects, but a portfolio and often Maths or Art help.',
  },
  medicine: {
    name: 'Medicine', category: 'medicine',
    what: 'Training to diagnose, treat, and care for patients, combining deep science with human responsibility. A long, demanding, highly competitive path with admission tests and interviews.',
    leads: 'Hospital medicine, general practice, surgery, research, and specialist fields.',
    needs: 'Chemistry essential, Biology usually required; admission test (UCAT) and interviews.',
  },
  'natural-sciences': {
    name: 'Natural Sciences', category: 'sciences',
    what: 'Studying the living and physical world, spanning biology, chemistry, and related sciences, often with flexibility to specialise later.',
    leads: 'Research, biotech, pharmaceuticals, medicine-adjacent fields, environmental science, and academia.',
    needs: 'Two or more sciences, usually including Chemistry.',
  },
  psychology: {
    name: 'Psychology', category: 'psychology',
    what: 'The science of how people think, feel, and behave, combining biology, statistics, and social science. More rigorous and data-driven than many expect.',
    leads: 'Clinical and counselling psychology, research, human resources, UX and design, marketing, and healthcare.',
    needs: 'Usually no specific subjects, though Biology or Maths can help; some courses prefer a science.',
  },
  law: {
    name: 'Law', category: 'law',
    what: 'The study of how societies create and enforce rules, developing sharp reasoning, argument, and written analysis. Intellectually demanding and highly transferable.',
    leads: 'Solicitor or barrister, corporate and commercial law, politics, journalism, business, and policy.',
    needs: 'No specific subjects, but strong essay-writing; some courses require the LNAT admission test.',
  },
  economics: {
    name: 'Economics', category: 'economics',
    what: 'How individuals, businesses, and governments make decisions and allocate resources, blending maths, data, and social science.',
    leads: 'Finance, banking, consulting, government and policy, data analysis, and academia.',
    needs: 'Maths essential at most strong universities; Economics A-level rarely required.',
  },
  business: {
    name: 'Business', category: 'business',
    what: 'How organisations are built, run, and grown, covering strategy, finance, marketing, and management. Practical and applied.',
    leads: 'Management, consulting, marketing, entrepreneurship, finance, and operations.',
    needs: 'Usually no specific subjects, though Maths helps for finance-heavy courses.',
  },
};

// Canonical order, used to break ties when fields match equally.
const FIELD_ORDER = ['engineering','cs','mathematics','physics','architecture','medicine','natural-sciences','psychology','law','economics','business'];

// Resolve a course category to its canonical field (for "about this field"
// links that start from a category rather than a specific field).
const CATEGORY_TO_FIELD = {
  engineering:'engineering', cs:'cs', mathematics:'mathematics', sciences:'natural-sciences',
  architecture:'architecture', medicine:'medicine', psychology:'psychology', law:'law',
  economics:'economics', business:'business',
};

// Field-relevant suggested combinations, as canonical tags (translated to
// the active qualification system at render time). Used on the Check
// empty state when a field filter is active.
const FIELD_COMBO_TAGS = {
  cs:           [['Mathematics_Standard','Mathematics_Advanced','Physics'], ['Mathematics_Standard','Computer_Science','Physics']],
  engineering:  [['Mathematics_Standard','Physics','Mathematics_Advanced'], ['Mathematics_Standard','Physics','Chemistry']],
  medicine:     [['Chemistry','Biology','Mathematics_Standard'], ['Chemistry','Biology','Physics']],
  economics:    [['Mathematics_Standard','Economics','Mathematics_Advanced'], ['Mathematics_Standard','Economics','History']],
  law:          [['History','English','Sociology'], ['English','History','Economics']],
  mathematics:  [['Mathematics_Standard','Mathematics_Advanced','Physics'], ['Mathematics_Standard','Mathematics_Advanced','Computer_Science']],
  sciences:     [['Chemistry','Biology','Mathematics_Standard'], ['Chemistry','Physics','Mathematics_Standard']],
  psychology:   [['Biology','Psychology','Mathematics_Standard'], ['Biology','Chemistry','Psychology']],
  architecture: [['Mathematics_Standard','Art','Physics'], ['Mathematics_Standard','Physics','Art_Design']],
  business:     [['Mathematics_Standard','Economics','Business'], ['Mathematics_Standard','Business','Economics']],
};

// Strengths are multi-select; this holds the current selection.
const _selectedStrengths = new Set();

// Field Overview context: where the student arrived from, and which
// strengths they carried in (for the alignment highlight).
let _overviewFrom = 'strengths';
let _overviewStrengths = [];

function renderStrengthsGrid() {
  const grid = $('strengthsGrid');
  if (!grid) return;
  grid.innerHTML = STRENGTHS_OPTIONS.map(opt => `
    <button class="plan-cat-card${_selectedStrengths.has(opt.id) ? ' active' : ''}" data-strength="${opt.id}" aria-pressed="${_selectedStrengths.has(opt.id)}">
      <span class="plan-cat-card__icon" style="font-size: 28px;">${opt.icon}</span>
      <span class="plan-cat-card__label">${esc(opt.label)}</span>
      <span class="picker-hint-inline" style="font-size: 11px; margin-top: 6px;">${esc(opt.description)}</span>
    </button>
  `).join('');
  grid.querySelectorAll('.plan-cat-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.strength;
      const nowOn = !_selectedStrengths.has(id);
      if (nowOn) _selectedStrengths.add(id); else _selectedStrengths.delete(id);
      btn.classList.toggle('active', nowOn);
      btn.setAttribute('aria-pressed', String(nowOn));
      renderStrengthsResults();
    });
  });
}

// Output FIELDS that match the selected strengths — never specific
// courses. Fields matching MORE of the selected strengths come first.
function renderStrengthsResults() {
  if (dataLoadError) return;
  const resultsDiv = $('strengthsSuggestions');
  const section    = $('strengthsResults');
  if (!resultsDiv || !section) return;

  if (_selectedStrengths.size === 0) {
    section.classList.add('hidden');
    resultsDiv.innerHTML = '';
    return;
  }

  // Tally how many selected strengths point at each field.
  const counts = new Map();
  _selectedStrengths.forEach(sid => {
    const opt = STRENGTHS_OPTIONS.find(o => o.id === sid);
    (opt?.fields || []).forEach(fid => counts.set(fid, (counts.get(fid) || 0) + 1));
  });

  const fieldIds = [...counts.keys()].sort((a, b) => {
    const byCount = counts.get(b) - counts.get(a);
    return byCount !== 0 ? byCount : FIELD_ORDER.indexOf(a) - FIELD_ORDER.indexOf(b);
  });

  logEvent('strengths_fields', { strengths: [..._selectedStrengths], field_count: fieldIds.length });

  resultsDiv.innerHTML = `<div class="field-cards">${fieldIds.map(buildFieldCardHtml).join('')}</div>`;
  section.classList.remove('hidden');

  resultsDiv.querySelectorAll('[data-explore-field]').forEach(btn => {
    btn.addEventListener('click', () =>
      openFieldOverview(btn.dataset.exploreField, { from: 'strengths', strengths: [..._selectedStrengths] })
    );
  });
  resultsDiv.querySelectorAll('[data-pin-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      togglePinnedField(btn.dataset.pinCategory);
      renderStrengthsResults();   // refresh every card's pin state
    });
  });
}

function buildFieldCardHtml(fieldId) {
  const f = STRENGTH_FIELDS[fieldId];
  if (!f) return '';
  const pinned = (typeof AltioraState !== 'undefined')
    && AltioraState.getCandidateFields().includes(f.category);
  return `
    <article class="field-card" data-category="${esc(f.category)}"
      style="--field-accent: var(--color-cat-${f.category}); --field-accent-bg: var(--color-cat-${f.category}-bg);">
      <h3 class="field-card__name">${esc(f.name)}</h3>
      <p class="field-card__what">${esc(f.what)}</p>
      <p class="field-card__line"><span class="field-card__label">Where it leads</span>${esc(f.leads)}</p>
      <p class="field-card__line"><span class="field-card__label">Typically needs</span>${esc(f.needs)}</p>
      <div class="field-card__actions">
        <button class="field-card__btn" type="button" data-explore-field="${esc(fieldId)}">Explore ${esc(f.name)} courses →</button>
        <button class="pin-btn${pinned ? ' pin-btn--on' : ''}" type="button"
                data-pin-category="${esc(f.category)}" aria-pressed="${pinned}">${pinned ? '✓ Kept' : 'Keep this field'}</button>
      </div>
    </article>`;
}

/* ═══════════════════════════════════════════════════════════════
 * FIELD OVERVIEW  ("What [Field] needs")
 * A reusable orientation screen rendered from one function, reachable
 * from Start with Strengths, an "about this field" link in Check
 * Combination, and a ?field= URL parameter. All content is read live
 * from the course data + field descriptions.
 * ═══════════════════════════════════════════════════════════════ */

// Resolve a field id OR a category id to a field id.
function resolveFieldId(key) {
  if (STRENGTH_FIELDS[key]) return key;
  return CATEGORY_TO_FIELD[key] ?? null;
}

// Open the overview for a field/category. opts: { from, strengths }.
function openFieldOverview(key, opts = {}) {
  const fieldId = resolveFieldId(key);
  const f = fieldId && STRENGTH_FIELDS[fieldId];
  if (!f) return;

  // Make sure the workspace chrome is visible (covers direct ?field= entry).
  const stage = (typeof AltioraState !== 'undefined' && AltioraState.getProfile().stage) || DEFAULT_STAGE;
  applyStageChrome(stage);

  state.exploreField = { category: f.category, name: f.name, fieldId };
  _overviewFrom = opts.from || 'strengths';
  _overviewStrengths = opts.strengths || [...(_selectedStrengths || [])];

  logEvent('field_overview_open', { field: fieldId, from: _overviewFrom });
  switchMode('field-overview');
  renderFieldOverview(fieldId);
  requestAnimationFrame(() =>
    $('panel-field-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  );
}

function renderFieldOverview(fieldId) {
  const panel = $('panel-field-overview');
  const f = STRENGTH_FIELDS[fieldId];
  if (!panel || !f) return;

  const cat        = f.category;
  const sys        = state.checkSystem;            // may be '' → generic terms
  const isQuant    = isQuantitativeCategory(cat);
  const catCourses = courses.filter(c => c.category === cat);

  // ── Subjects this field needs — what a MAJORITY of courses require,
  //    not the union of outliers; maths collapsed; system/quant labels.
  const ft = fieldSubjectTags(cat);
  const helpfulTags = ft.helpful.filter(t => !ft.core.includes(t));
  const coreLabels    = requirementLabels(ft.core, sys, isQuant);
  const helpfulLabels = requirementLabels(helpfulTags, sys, isQuant).filter(l => !coreLabels.includes(l));
  const chipsFrom = labels => labels.length
    ? `<div class="fo-chips">${labels.map(l => `<span class="fo-chip">${esc(l)}</span>`).join('')}</div>`
    : `<p class="fo-muted">No specific subjects — courses here are broadly open.</p>`;
  const outlierNote = ft.outliers
    ? `<p class="fo-muted fo-muted--hint">Some specialised courses (e.g. interdisciplinary or niche degrees) have different requirements — check individual courses.</p>`
    : '';

  // ── Strong combinations (reused planner ranking) ────────────────
  const combos = combosForDisplay(cat, sys, isQuant, 3);
  const combosHtml = combos.length
    ? combos.map(({ combo, green, amber }) => `
        <div class="fo-combo">
          <span class="fo-combo__subjects">${comboLabels(combo, sys, isQuant).map(l => `<span class="fo-chip fo-chip--accent">${esc(l)}</span>`).join('')}</span>
          <span class="fo-combo__count">opens ${green + amber} course${green + amber === 1 ? '' : 's'}</span>
        </div>`).join('')
    : `<p class="fo-muted">No standout combinations — most courses here are flexible on subjects.</p>`;

  // Alignment highlight from carried strengths.
  const aligned = (_overviewStrengths || [])
    .map(sid => STRENGTHS_OPTIONS.find(o => o.id === sid))
    .filter(o => o && o.fields.includes(fieldId))
    .map(o => o.label);
  const alignHtml = aligned.length
    ? `<p class="fo-align">✓ Your strengths (${esc(aligned.join(', '))}) align well with this field.</p>`
    : '';

  // ── What to expect: admission tests + grade range ───────────────
  const testFreq = {};
  catCourses.forEach(c => (c.admissionTests ?? []).forEach(t => { testFreq[t] = (testFreq[t] ?? 0) + 1; }));
  const tests = Object.entries(testFreq).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  const testsLine = tests.length
    ? `Top courses may require: ${tests.map(t => `<strong>${esc(t)}</strong>`).join(', ')}.`
    : `Most courses in this field don't require an admission test.`;

  // ── Grade expectations, respecting the selected system (or none) ──
  // Never assume A-Level. Only A-Level and IB have per-course grade data; for
  // a selected system without data, or no system, we stay honest/multi-system.
  const sysLabel = sys ? (qualificationMappings[sys]?.systemLabel ?? sys) : null;

  // A-Level letter range, strongest first, trimming the weakest outliers.
  const alOffers = catCourses.map(c => c.grades?.aLevels).filter(Boolean);
  let alRange = null;
  if (alOffers.length) {
    const ranked = alOffers.slice().sort((a, b) => aLevelOfferStrength(a) - aLevelOfferStrength(b));
    const weak = ranked[Math.floor(ranked.length * 0.15)] || ranked[0];
    const strong = ranked[ranked.length - 1];
    alRange = weak === strong ? strong : `${strong}–${weak}`;
  }
  // IB points range (low → high).
  const ibPts = catCourses.map(c => c.grades?.ib).filter(v => typeof v === 'number' && !isNaN(v));
  let ibRange = null;
  if (ibPts.length) {
    const sorted = ibPts.slice().sort((a, b) => a - b);
    const lo = sorted[Math.floor(sorted.length * 0.15)] ?? sorted[0];
    const hi = sorted[sorted.length - 1];
    ibRange = lo === hi ? `${hi} points` : `${lo}–${hi} points`;
  }

  const neutralGrade = 'Strong courses are competitive and typically ask for high grades. Pick your qualification system in Check Combination to see the specific requirements for your system.';
  let gradeLine;
  if (sys === 'UK_A_Level') {
    gradeLine = alRange ? `Strong courses typically ask for around ${esc(alRange)} at A-Level.` : neutralGrade;
  } else if (sys === 'IB') {
    gradeLine = ibRange ? `Strong courses typically ask for around ${esc(ibRange)} (IB).` : neutralGrade;
  } else if (sys) {
    // AP / Singapore A-Level / HK DSE — no per-system grade data in the set yet.
    gradeLine = `Strong courses are competitive and typically ask for high grades. Check individual courses for specific ${esc(sysLabel)} requirements.`;
  } else {
    // No system selected — give a multi-system picture, never A-Level alone.
    const parts = [];
    if (alRange) parts.push(`${esc(alRange)} (A-Level)`);
    if (ibRange) parts.push(`${esc(ibRange)} (IB)`);
    gradeLine = parts.length
      ? `Strong courses typically ask for high grades — around ${parts.join(', ')}, or equivalent in other systems.`
      : neutralGrade;
  }
  const usShare = catCourses.length ? catCourses.filter(c => c.country === 'US').length / catCourses.length : 0;
  const holisticLine = usShare >= 0.3
    ? `Many courses here (especially US) use holistic admissions — grades are one factor alongside essays, activities, and recommendations.`
    : '';

  const accent = `--fo-accent: var(--color-cat-${cat}); --fo-accent-bg: var(--color-cat-${cat}-bg);`;
  const backLabel = _overviewFrom === 'check' ? '← Back to Check Combination'
                  : _overviewFrom === 'plan'  ? '← Back to Subject Planner'
                  : '← Back to fields';

  const foPinned = (typeof AltioraState !== 'undefined')
    && AltioraState.getCandidateFields().includes(cat);

  panel.innerHTML = `
    <div class="fo" style="${accent}">
      <header class="fo__header">
        <span class="fo__eyebrow">What this field needs</span>
        <h1 class="fo__title">${esc(f.name)}</h1>
        <p class="fo__desc">${esc(f.what)}</p>
        ${alignHtml}
        <button type="button" id="foPinField" class="pin-btn${foPinned ? ' pin-btn--on' : ''}"
                aria-pressed="${foPinned}">${foPinned ? '✓ Kept as one of your fields' : 'Keep this field'}</button>
      </header>

      <section class="fo-section">
        <h2 class="fo-section__head">Subjects this field needs</h2>
        <div class="fo-subjects">
          <div>
            <span class="fo-label">Usually required</span>
            ${chipsFrom(coreLabels)}
          </div>
          <div>
            <span class="fo-label">Helpful, not always required</span>
            ${chipsFrom(helpfulLabels)}
          </div>
        </div>
        ${outlierNote}
        ${sys ? '' : `<p class="fo-muted fo-muted--hint">Pick a qualification system in Check Combination to see these in your own subjects.</p>`}
      </section>

      <section class="fo-section">
        ${sys === 'US_AP'
          ? `<h2 class="fo-section__head">Building a strong AP profile</h2>${apGuidancePanelHtml(cat)}`
          : `<h2 class="fo-section__head">Typical strong combinations</h2>
        <div class="fo-combos">${combosHtml}</div>
        ${sys ? '' : `<p class="fo-muted fo-muted--hint">Example combinations shown in general terms — pick your qualification system in Check Combination to see them in your own subjects.</p>`}`}
      </section>

      <section class="fo-section">
        <h2 class="fo-section__head">What to expect</h2>
        <p class="fo-expect">${testsLine}</p>
        ${gradeLine ? `<p class="fo-expect">${gradeLine}</p>` : ''}
        ${holisticLine ? `<p class="fo-expect fo-expect--muted">${holisticLine}</p>` : ''}
      </section>

      <section class="fo-section">
        <h2 class="fo-section__head">Where it leads</h2>
        <p class="fo-expect">${esc(f.leads)}</p>
      </section>

      <div class="fo-fork">
        <button type="button" class="fo-btn fo-btn--primary" id="foSeeCourses">See courses I qualify for →</button>
        <button type="button" class="fo-btn" id="foPlanSubjects">Help me plan my subjects →</button>
        <button type="button" class="fo-back" id="foBack">${esc(backLabel)}</button>
      </div>
    </div>`;

  $('foSeeCourses')?.addEventListener('click', proceedToCheckFromField);
  $('foPlanSubjects')?.addEventListener('click', planForField);
  $('foPinField')?.addEventListener('click', () => {
    togglePinnedField(cat);
    renderFieldOverview(fieldId);   // refresh the pin state
  });
  $('foBack')?.addEventListener('click', () => {
    if (_overviewFrom === 'check') switchMode('check');
    else if (_overviewFrom === 'plan') switchMode('plan');
    else switchMode('strengths');
  });
}

// Action fork → Check Combination, with the field filter active and no
// country assumption. The exploring → building step of the funnel.
// Set the active qualification system for Check Combination and rebuild the
// dependent UI. Shared by the system dropdown and by flows that auto-select a
// system (e.g. arriving from Field Overview). buildSubjectPicker re-applies any
// active field filter, so the exploration context is preserved.
function proceedToCheckFromField() {
  if (!state.exploreField) return;
  logEvent('field_overview_to_check', { field: state.exploreField.fieldId });
  // System is always set (onboarding), so Check opens pre-configured.
  enterStage('building');
  state.countryFilter = 'All';
  $$('#countryFilterBar .filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.country === 'All'));

  applyExploreFieldFilter();
  renderExploreContextBanner();
  renderCheckEmptyState();
  if (state.selectedSubjects.length > 0) renderCheckResults();
  requestAnimationFrame(() =>
    $('panel-check')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  );
}

// Action fork → Subject Planner, with this field pinned as a candidate.
function planForField() {
  const cat = state.exploreField?.category;
  if (!cat) return;
  logEvent('field_overview_to_plan', { field: state.exploreField.fieldId });
  // Pin the field (no-op if already pinned). If the student already keeps 3
  // other fields, say so gently and let them manage the set in the planner.
  if (!AltioraState.getCandidateFields().includes(cat)
      && !AltioraState.addCandidateField(cat)) {
    showToast(`You can keep up to ${AltioraState.MAX_CANDIDATE_FIELDS} fields — remove one to add ${CATEGORY_LABEL_MAP[cat] ?? cat}.`);
  }
  enterStage('choosing');   // choosing stage's primary tool is the planner
  renderPlanResults();      // syncs the grid selection internally
  requestAnimationFrame(() =>
    $('panel-plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  );
}

// Apply the active field's category to the live filter + category chips.
// Safe to call repeatedly (e.g. after buildSubjectPicker clears the chips).
function applyExploreFieldFilter() {
  if (!state.exploreField) return;
  const cat = state.exploreField.category;
  state.selectedCategories = new Set([cat]);
  $$('#categoryPicker .category-chip').forEach(btn => {
    const active = btn.dataset.category === cat;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

// Context banner at the top of Check Combination, shown while a field is
// being explored. Persists even before a qualification system is picked.
function renderExploreContextBanner() {
  const banner = $('exploreContextBanner');
  if (!banner) return;
  const ef = state.exploreField;
  if (!ef) {
    banner.classList.add('hidden');
    banner.innerHTML = '';
    return;
  }
  const count = (typeof courses !== 'undefined')
    ? courses.filter(c => c.category === ef.category).length : 0;
  const prompt = state.checkSystem
    ? ''
    : ' Select your qualification system to see what you qualify for.';
  banner.innerHTML = `
    <div class="explore-context__body">
      <p class="explore-context__text">
        <strong>Exploring ${esc(ef.name)} courses</strong> — ${count} course${count === 1 ? '' : 's'} across all countries.${prompt}
      </p>
      <div class="explore-context__actions">
        ${ef.fieldId ? `<button type="button" class="explore-context__about" id="exploreContextAbout">About ${esc(ef.name)} →</button>` : ''}
        <button type="button" class="explore-context__clear" id="exploreContextClear">Clear field filter</button>
      </div>
    </div>`;
  banner.classList.remove('hidden');
  $('exploreContextClear')?.addEventListener('click', clearExploreField);
  $('exploreContextAbout')?.addEventListener('click', () =>
    openFieldOverview(ef.fieldId, { from: 'check' }));
}

// Remove the field context and its category filter; show all courses again.
function clearExploreField() {
  state.exploreField = null;
  state.selectedCategories.clear();
  $$('#categoryPicker .category-chip').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  renderExploreContextBanner();
  renderCheckEmptyState();
  logEvent('explore_field_clear', {});
  if (state.selectedSubjects.length > 0) renderCheckResults();
}


/* ═══════════════════════════════════════════════════════════════
 * UTILITY
 * ═══════════════════════════════════════════════════════════════ */

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function logEvent(eventName, properties = {}) {
  if (typeof window.plausible === 'function') {
    window.plausible(eventName, { props: properties });
  } else {
    console.log('[Analytics]', eventName, properties);
  }
}

/* ═══════════════════════════════════════════════════════════════
 * INIT
 * ═══════════════════════════════════════════════════════════════ */

function init() {
  if (dataLoadError) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="data-error-banner" role="alert" aria-live="assertive">
          <p class="data-error-banner__msg">
            ⚠️ Failed to load course data. Please check your internet connection and refresh the page.
            If the problem persists, <a href="mailto:support@altiora.app">contact support</a>.
          </p>
          <button type="button" class="data-error-banner__retry" onclick="window.location.reload()">↺ Retry</button>
        </div>`;
    }
    return;
  }

  populateSystemSelects();
  buildCountryFilterBar();
  buildCategoryPicker();
  buildPlanCategoryGrid();

  // In-results search filter (university / course name) — instant, no re-render.
  const resultSearchInput = $('resultSearchInput');
  if (resultSearchInput) {
    resultSearchInput.addEventListener('input', e => {
      state.resultSearch = e.target.value;
      applyResultSearch(state.resultSearch);
    });
  }

  // Stage selection cards (onboarding)
  $$('#stageSelect .stage-card').forEach(card =>
    card.addEventListener('click', () => enterStage(card.dataset.stage))
  );
  // System selection cards (second onboarding step)
  $$('#systemSelect .stage-card').forEach(card =>
    card.addEventListener('click', () => chooseSystem(card.dataset.system))
  );

  // Stage indicator dropdown (switch stage anytime)
  $('stageIndicatorBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleStageMenu();
  });
  $$('#stageMenu .stage-menu__item').forEach(item =>
    item.addEventListener('click', () => enterStage(item.dataset.stage))
  );

  // System indicator dropdown — the single global control for the system.
  $('systemIndicatorBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleSystemMenu();
  });
  $$('#systemMenu .stage-menu__item').forEach(item =>
    item.addEventListener('click', () => changeSystem(item.dataset.system))
  );
  document.addEventListener('click', closeSystemMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSystemMenu(); });

  // Click-away and Escape close the stage menu
  document.addEventListener('click', closeStageMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeStageMenu(); });

  // Saved shortlist: persistent link + live count (kept in sync via the
  // state subscription so it reflects changes from anywhere).
  $('shortlistLink')?.addEventListener('click', () => switchMode('shortlist'));
  AltioraState.subscribe(updateShortlistCount);
  updateShortlistCount();

  // Workspace home: the wordmark is the home control; delegated actions on the home panel.
  $('navHome')?.addEventListener('click', goHome);
  $('panel-home')?.addEventListener('click', e => {
    const toolBtn = e.target.closest('[data-go-tool]');
    if (toolBtn) { switchMode(toolBtn.dataset.goTool); return; }
    if (e.target.closest('[data-change-stage]')) showStageSelect();
  });

  $('planSwitchToCheck').addEventListener('click', () => switchMode('check'));

  // ── Entry router ─────────────────────────────────────────────
  // New users see the stage-selection screen; returning users land on
  // their last stage's primary tool. The "Find my path" CTA from the
  // homepage (?mode=strengths) drops the student straight into the
  // exploring stage.
  const _profile = AltioraState.getProfile();
  const _savedSystem = _profile.qualificationSystem;
  // Apply the saved system globally up front so every screen renders in it.
  if (_savedSystem && qualificationMappings[_savedSystem]) applyProfileSystem(_savedSystem);

  if (window.sessionStorage.getItem('openStrengthsMode') === 'true') {
    window.sessionStorage.removeItem('openStrengthsMode');
    enterStage('exploring');   // diverts to system step if none set yet
  } else if (AltioraState.getState().meta.hasOnboarded) {
    if (!_savedSystem) {
      // Old save from before systems were first-class — prompt once, then continue.
      showSystemSelect();
    } else {
      // Already onboarded with a system → genuinely returning.
      _isReturningUser = true;
      showWorkspaceHome();
    }
  } else {
    showStageSelect();
  }

  // Deep link: ?field=cs (or a category) opens that Field Overview directly.
  const _fieldParam = new URLSearchParams(window.location.search).get('field');
  if (_fieldParam && resolveFieldId(_fieldParam)) {
    openFieldOverview(_fieldParam, { from: 'direct' });
  }
}

init();
