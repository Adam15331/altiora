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
  pickerCollapsed:    false,  // Check picker view: compact summary row vs full picker (session-only)
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
  grey:  { label:'Grades a stretch',     badgeCls:'badge--grey',    icon:'◯', cardCls:'course-card--grey'  },
  // Fail-safe bucket: subjects fit, but the course's grade requirement could
  // not be compared against the student (missing / partial / unreadable grade
  // data). Never a confident yes — unknown fails to caution, not confidence.
  unconfirmed: { label:'Grades not confirmed', badgeCls:'badge--grey', icon:'◔', cardCls:'course-card--unconfirmed' },
};
const STATUS_SORT = { green:0, amber:1, grey:2, unconfirmed:3, red:4 };

// Honest labels for SUBJECT-ONLY mode (no predicted grade set): on subjects
// alone we can only say the subjects fit — "Strong match" implies likely
// admission, which cannot be claimed without grades. Once a grade IS set the
// established Strong/Possible/Out-of-reach labels return. Language only:
// status keys, colours, sort order and counts are identical in both modes.
// grey/unconfirmed exist only in grade mode (see the grade gate), so they
// keep their grade-language labels.
const STATUS_SUBJECT_ONLY = {
  green: 'Subjects fit',
  amber: 'Partly fit',
  red:   'Subjects don’t fit',
};
// Grade-aware matching is ALL-OR-NOTHING: a half-filled profile behaves
// exactly like an empty one (subject-only language), because a slot-by-slot
// comparison against blank slots is wrong, not merely incomplete.
function gradesInformMatch() {
  return gradeProfileComplete(state.checkSystem, state.predictedGrade, state.selectedSubjects);
}

// True only when the student's AP grades exist PER SUBJECT (scores 1–5 keyed
// by AP name) — the shape a real AP comparison needs. Derived from state, not
// hardcoded: the current entry UI stores a single average letter, so this is
// false for every profile today and every course caps at amber; when
// per-subject AP entry ships, the cap lifts here without another edit.
function apStudentGradesComparable() {
  const g = state.predictedGrade;
  return !!g && typeof g === 'object' && !Array.isArray(g)
    && Object.values(g).some(v => AP_SCORE_RE.test(String(v)));
}

// Does the student's per-subject AP profile satisfy this course's HELD
// apRequirement grade data? Conservative on every axis:
//   - only a requirement carrying a grades[] array is comparable at all —
//     framework records without grades (Durham/Edinburgh/UCL) never pass;
//   - excluded APs are removed before anything is counted;
//   - mustInclude / mustIncludeOneOf are checked against the canonical
//     picker names the data was normalised to;
//   - the required grades, best-first, must each be met slot-by-slot.
// NOT checked (no student data is held for it): gpaMin. A pass here is a
// pass on the AP-grade portion of the requirement only.
function apRequirementMet(course) {
  const ar = course?.apRequirement;
  if (!ar || !Array.isArray(ar.grades) || !ar.grades.length) return false;
  const g = state.predictedGrade;
  if (!g || typeof g !== 'object') return false;
  const excluded = new Set(Array.isArray(ar.excluded) ? ar.excluded : []);
  const have = new Map(Object.entries(g)
    .filter(([subj, v]) => !excluded.has(subj) && AP_SCORE_RE.test(String(v)))
    .map(([subj, v]) => [subj, Number(v)]));
  if (Array.isArray(ar.mustInclude) && !ar.mustInclude.every(s => have.has(s))) return false;
  if (Array.isArray(ar.mustIncludeOneOf)
      && !ar.mustIncludeOneOf.every(set => !Array.isArray(set) || set.some(s => have.has(s)))) return false;
  const need = ar.grades.slice().sort((a, b) => b - a);
  const best = [...have.values()].sort((a, b) => b - a);
  if (best.length < need.length) return false;
  return need.every((n, i) => best[i] >= n);
}
function statusLabel(status) {
  return (!gradesInformMatch() && STATUS_SUBJECT_ONLY[status]) || STATUS[status]?.label || '';
}

const TIER_LABELS = {
  'world-top-5':      'World Top 5',
  'world-top-10':     'World Top 10',
  'world-top-25':     'World Top 25',
  'world-top-50':     'World Top 50',
  'world-top-100':    'World Top 100',
  'national-top-10':  'National Top 10',
  'national-top-25':  'National Top 25',
  'national-top-50':  'National Top 50',
  'national-leading': 'Leading National University',
  'regional':         'Regional University',
};
// Ultra-selective holistic tiers (QS world top 25) — used to mark elite
// US holistic courses as reaches for everyone in the shortlist verdicts.
const ELITE_HOLISTIC_TIERS = new Set(['world-top-5', 'world-top-10', 'world-top-25']);

const SYSTEM_GRADE_KEY = {
  UK_A_Level: 'aLevels',
  IB:         'ib',
  // US_AP has no grades key: grades.ap was removed from the schema; AP
  // requirements live in course.apRequirement.
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

// True only while standard Maths is selected BECAUSE we added it — the student
// picked the advanced maths without the standard one already on. Picking Maths
// first and Further Maths second adds nothing, so nothing is announced: a
// message about an action that never happened reads as second-guessing.
// Reset whenever the advanced subject is dropped or the picker is rebuilt.
let _mathsAutoAdded = false;

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

// Year-aware framing for Check Combination — copy only, matching untouched.
// For a student whose subjects are set (normalised year <= 1) the tool READS
// ("what your subjects open"); for a student still choosing it's a sandbox.
// `counts` is the object renderCheckResults already computed for the summary
// bar. Passing it through is what guarantees the intro and the summary quote
// the same number; without it the intro recomputes from the same pipeline.
function updateCheckFraming(counts = null) {
  const retro = planIsRetro();   // the same normalised-year rule as the planner
  const intro = $('checkIntro');
  if (intro) {
    // "At your predicted grades" may only be claimed on a COMPLETE profile —
    // a half-filled one is subject-only, and says so.
    const gradesSet = gradesInformMatch() && state.selectedSubjects.length > 0;
    if (gradesSet) {
      const n = counts ? counts.green : checkFitCount();
      intro.textContent = `Here’s what your subjects open — ${n} strong match${n === 1 ? '' : 'es'} at your predicted grades.`;
    } else {
      intro.textContent = retro
        ? (state.checkSystem === 'US_AP'
            ? 'Here’s what your subjects open. Add your predicted grades to see how they compare where we hold requirements.'
            : 'Here’s what your subjects open. Add your predicted grades to see which courses are strong matches.')
        : 'Pick your subjects and instantly see which courses are open, possible, or out of reach. Your qualification system is set from your profile — change it anytime from the bar above.';
    }
  }
  // "Select 3–5 subjects" is choosing language — it only shows when the
  // picker is genuinely being used to choose (2+ years out, or nothing saved
  // yet so the picker is still a sandbox).
  const hint = $('subjectPickerHint');
  if (hint) {
    const savedCount = (typeof AltioraState !== 'undefined' && Array.isArray(AltioraState.getProfile().subjects))
      ? AltioraState.getProfile().subjects.length : 0;
    hint.classList.toggle('hidden', retro && savedCount > 0);
  }
}

// Year-aware intro for Course Finder: "which subjects you need" is choosing
// language — a student whose subjects are set compares instead.
function updateReverseIntro() {
  const el = $('reverseIntro');
  if (!el) return;
  el.textContent = planIsRetro()
    ? 'Search for a degree and see how its requirements compare with your subjects.'
    : 'Search for a degree and see exactly which subjects you need, translated into your own qualification system.';
}

function renderCheckEmptyState() {
  const el = $('checkEmptyState');
  if (!el) return;
  const show = !!state.checkSystem && state.selectedSubjects.length === 0;
  el.classList.toggle('hidden', !show);
  if (!show) return;

  const ef = state.exploreField;
  // Subjects set (<= 1 year out): a student can't "try" combinations — no
  // suggestion buttons, and the ask is to enter what they're taking.
  const retro = planIsRetro();

  // AP doesn't have a fixed subject count, so don't present "3-subject
  // combinations" as a complete answer.
  if (state.checkSystem === 'US_AP') {
    const apCat = ef ? ef.category : null;
    const builtKey = `US_AP|${apCat ?? ''}|${retro ? 'r' : 'p'}`;
    if (el.dataset.builtFor === builtKey) return;
    el.dataset.builtFor = builtKey;
    el.innerHTML = `
      <div class="check-empty-state__inner">
        <div class="check-empty-state__icon" aria-hidden="true">🎯</div>
        <p class="check-empty-state__heading">${retro
          ? 'Enter the APs you’re taking to see what they open'
          : 'Select your APs above to see matching courses'}</p>
      </div>`;
    return;
  }

  if (retro) {
    const builtKey = `${state.checkSystem}|retro`;
    if (el.dataset.builtFor === builtKey) return;
    el.dataset.builtFor = builtKey;
    el.innerHTML = `
      <div class="check-empty-state__inner">
        <div class="check-empty-state__icon" aria-hidden="true">🎯</div>
        <p class="check-empty-state__heading">Enter the subjects you’re taking to see what they open</p>
      </div>`;
    return;
  }

  const fieldSugg = ef ? fieldEmptySuggestions(ef.category, state.checkSystem) : null;
  // Rebuild when the system OR the active field changes.
  const builtKey = `${state.checkSystem}|${fieldSugg ? ef.category : ''}|p`;
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
// (AP→A-Level conversion removed: no published AP-to-A-Level equivalence
// exists. AP requirements live in course.apRequirement, stated directly.)
const DSE_RANK      = { '5**': 7, '5*': 6, '5': 5, '4': 4, '3': 3, '2': 2, '1': 1 };
// SG A-Levels grade below E: S (sub-pass) and U (ungraded). Offers never ask
// for them, but a student can honestly predict them.
const SG_RANK       = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'S': 0, 'U': -1 };

// Letter-profile systems: offers are grade PROFILES ("A*AA"), so the student
// side is per-subject predictions compared slot-by-slot — not one average.
const LETTER_GRADE_SYSTEMS = new Set(['UK_A_Level', 'SG_A_Level', 'HK_DSE']);
const GRADE_SCALES = {
  UK_A_Level: ['A*', 'A', 'B', 'C', 'D', 'E'],
  SG_A_Level: ['A', 'B', 'C', 'D', 'E', 'S', 'U'],
  HK_DSE:     ['5**', '5*', '5', '4', '3', '2', '1'],
  // AP scores are integers 1–5 ONLY — no letters, no A-Level equivalents.
  US_AP:      ['5', '4', '3', '2', '1'],
};
// Systems whose grade entry is one control per selected subject. AP shares
// the letter systems' rows machinery (same _gradeMap/commitGradeMap path);
// it stays OUT of LETTER_GRADE_SYSTEMS because its comparison semantics
// (apRequirement, digits) are its own.
const PER_SUBJECT_GRADE_SYSTEMS = new Set([...LETTER_GRADE_SYSTEMS, 'US_AP']);
const AP_SCORE_RE = /^[1-5]$/;
function systemRank(system) {
  return system === 'HK_DSE' ? DSE_RANK : system === 'SG_A_Level' ? SG_RANK : A_LEVEL_RANK;
}

function parseALevelGrades(str) {
  return (str ?? '').match(/A\*|[A-E]/g) ?? [];
}

function parseDseGrades(str) {
  return (str ?? '').match(/5\*\*|5\*|[1-5]/g) ?? [];
}

function parseOfferGrades(system, str) {
  return (system === 'HK_DSE' ? parseDseGrades(str) : parseALevelGrades(str)).slice(0, 3);
}

// The student's predicted-grade LIST for a letter system. Accepts BOTH
// shapes: the per-subject map {subject → grade} (current), and the legacy
// single-average string, which expands to a uniform profile over the offer's
// slots — exactly what "average X" claimed. Returns null when unusable.
function studentGradeList(system, studentGrade, slots) {
  const rank = systemRank(system);
  if (typeof studentGrade === 'string') {
    return Object.prototype.hasOwnProperty.call(rank, studentGrade)
      ? Array(Math.max(1, slots)).fill(studentGrade) : null;
  }
  if (studentGrade && typeof studentGrade === 'object') {
    const vals = Object.values(studentGrade).filter(g => Object.prototype.hasOwnProperty.call(rank, g));
    return vals.length ? vals : null;
  }
  return null;
}

// THE letter-system comparison: sort both profiles descending and compare
// slot-by-slot (student's best vs the offer's highest requirement, and so
// on). Meets = every compared slot satisfied. Every letter-system consumer
// (checkStatusFor, shortlist verdicts, graduation balance) flows through
// here — one pipeline, no parallel logic.
function compareProfileToOffer(system, studentGrade, offerGrades) {
  const rank = systemRank(system);
  const o = offerGrades.map(g => rank[g]).filter(v => v != null).sort((a, b) => b - a);
  if (!o.length) return 'unknown';
  const sList = studentGradeList(system, studentGrade, o.length);
  if (!sList) return 'unknown';
  const s = sList.map(g => rank[g]).sort((a, b) => b - a);
  const n = Math.min(s.length, o.length);
  for (let i = 0; i < n; i++) if (s[i] < o[i]) return 'above';
  return 'met';
}

// "Comfortably below your level": STRICTLY above the offer in every compared
// slot (the per-subject generalisation of the old "a full grade above the
// offer's top grade" rule — identical for uniform profiles).
function profileComfortablyAbove(system, studentGrade, offerGrades) {
  const rank = systemRank(system);
  const o = offerGrades.map(g => rank[g]).filter(v => v != null).sort((a, b) => b - a);
  if (!o.length) return false;
  const sList = studentGradeList(system, studentGrade, o.length);
  if (!sList) return false;
  const s = sList.map(g => rank[g]).sort((a, b) => b - a);
  const n = Math.min(s.length, o.length);
  for (let i = 0; i < n; i++) if (s[i] <= o[i]) return false;
  return true;
}

// Tri-state grade comparison in the student's own qualification system.
// Returns one of:
//   'above'   — the course's typical grade requirement is ABOVE the student
//   'met'     — the student's grade meets (or exceeds) the requirement
//   'unknown' — the requirement CANNOT be compared (missing / partial /
//               unreadable grade data for this system). This is the honest
//               fail-safe answer: callers must NOT treat it as a pass.
// Crucially, absence of data returns 'unknown', never 'met' — a course whose
// grades we can't read must never fall through to a strong match.
function compareGradeToStudent(course, system, studentGrade) {
  if (!studentGrade) return 'unknown';
  // Letter-profile systems (UK/SG A-Levels, HK DSE): offer profile vs the
  // student's per-subject predictions, slot-by-slot. Legacy single-average
  // strings still compare (as a uniform profile) — no save left behind.
  if (LETTER_GRADE_SYSTEMS.has(system)) {
    const raw = course.grades?.[SYSTEM_GRADE_KEY[system]];
    if (!raw) return 'unknown';
    return compareProfileToOffer(system, studentGrade, parseOfferGrades(system, raw));
  }
  if (system === 'IB') {
    // grades.ib is an integer points total (e.g. 39); US/holistic courses
    // and others without a published total have ib === null → unknown.
    const ibVal = course.grades?.ib;
    if (ibVal == null) return 'unknown';
    const studentPts = parseInt(studentGrade, 10);
    if (isNaN(studentPts)) return 'unknown';
    const need = typeof ibVal === 'number'
      ? ibVal
      : parseInt(String(ibVal).match(/\d+/)?.[0], 10);
    if (isNaN(need)) return 'unknown';
    return studentPts < need ? 'above' : 'met';
  }
  // US_AP deliberately has no branch here: AP comparison does not run
  // through this function. AP requirements live in course.apRequirement.
  return 'unknown';
}

// Back-compat boolean wrapper: "is the course's typical offer above the
// student?" Only true on a genuine, comparable 'above' result — an
// uncomparable ('unknown') requirement is NOT "above".
function isGradeAboveStudent(course, system, studentGrade) {
  return compareGradeToStudent(course, system, studentGrade) === 'above';
}

// For a grey course (predictions below the typical offer), describe the gap.
// Letter systems get a PROFILE-aware gap: { have: "A*AA", need: "A*A*A",
// shortTotal, shortSlots } computed slot-by-slot, so "one grade short in one
// subject" (the near-miss tier) reads exactly as the comparison found it.
// IB keeps its points strings.
function gradeGapInfo(course, system, studentGrade) {
  if (!studentGrade) return null;
  const need = course.grades?.[SYSTEM_GRADE_KEY[system]] ?? null;
  if (!need) return null;
  if (system === 'IB') return { have: `${studentGrade} points`, need: `${need} points` };
  if (LETTER_GRADE_SYSTEMS.has(system)) {
    const rank  = systemRank(system);
    const offer = parseOfferGrades(system, need);
    const sList = studentGradeList(system, studentGrade, offer.length);
    if (sList && offer.length) {
      const sorted = sList.slice().sort((a, b) => (rank[b] ?? -9) - (rank[a] ?? -9));
      const o = offer.map(g => rank[g]).sort((a, b) => b - a);
      const s = sorted.map(g => rank[g]);
      let shortSlots = 0, shortTotal = 0;
      for (let i = 0; i < Math.min(s.length, o.length); i++) {
        if (s[i] < o[i]) { shortSlots++; shortTotal += o[i] - s[i]; }
      }
      return { have: sorted.slice(0, Math.max(offer.length, sorted.length)).join(''), need: String(need), shortSlots, shortTotal };
    }
  }
  return { have: String(studentGrade), need: String(need) };
}

// Display form of the persisted predictions: maps render as the sorted
// profile ("A*AA" / "5*54"), strings (legacy average, IB points, AP letter)
// render as-is. Null when nothing usable is set.
function formatPredictedGrades(g, system) {
  if (!g) return null;
  if (typeof g === 'string') return g;
  if (typeof g !== 'object') return null;
  const rank = systemRank(system);
  const vals = Object.values(g).filter(v => Object.prototype.hasOwnProperty.call(rank, v));
  if (!vals.length) return null;
  return vals.sort((a, b) => (rank[b] ?? -9) - (rank[a] ?? -9)).join('');
}

// Human sentence for a grade gap — profile-aware where we have slot data.
function gradeGapText(gap) {
  if (typeof gap.shortTotal === 'number' && gap.shortTotal > 0) {
    const mag = gap.shortTotal === 1
      ? 'one grade short'
      : `${gap.shortTotal} grades short${gap.shortSlots > 1 ? ` across ${gap.shortSlots} subjects` : ''}`;
    return `You're predicted ${gap.have} — this asks ${gap.need}: ${mag}`;
  }
  return `You have ${gap.have}, course asks for ${gap.need}`;
}

const GRADE_CONVERSION_HINTS = {
  IB:         'IB 38 points ≈ A*AA at A-Level. Check university websites for specific conversion policies.',
  US_AP:      'US universities use holistic review – grades are one factor.',
  SG_A_Level: 'Singapore A-Level grades are roughly equivalent to UK A-Levels. Confirm with each university.',
  HK_DSE:     'DSE 5** ≈ A*; 5 ≈ A. Conversions vary – always verify.',
};

// Live per-subject predictions for letter systems (subject → grade). The
// derived value the pipeline reads is state.predictedGrade: a map with only
// the SELECTED subjects' set grades, or null when none — so every existing
// "grades set?" gate keeps working. A legacy single-average grade restored
// from an old save sits in _pendingUniform until subject rows exist, then
// fills them uniformly (the visible migration — nothing lost, nothing
// re-asked).
let _gradeMap = {};
let _pendingUniform = null;

function commitGradeMap({ render = true } = {}) {
  const entries = Object.entries(_gradeMap)
    .filter(([s, g]) => g && state.selectedSubjects.includes(s));
  state.predictedGrade = entries.length ? Object.fromEntries(entries) : null;
  syncGradeCompletenessPrompt();
  if (render) renderCheckResults();
}

// Counts what is still blank, and why it matters — the grade rows above
// already show WHICH subjects are blank, so this line never names them
// (nine named APs read as a paragraph). Calm and factual —
// no quota, no readiness score, no claim about what universities want.
// Reactive: re-run on every grade or subject change, and hidden the moment
// the profile is complete (or nothing has been entered at all, where the
// existing "leave blank to skip" help already says the right thing).
function syncGradeCompletenessPrompt() {
  const el = $('gradeIncomplete');
  if (!el) return;
  const missing = missingGradeSubjects(
    state.checkSystem, state.predictedGrade, state.selectedSubjects);
  const started = !!state.predictedGrade;
  const show = started && missing.length > 0;
  el.classList.toggle('hidden', !show);
  if (show) {
    el.textContent = missing.length === 1
      ? 'Add a grade for 1 more subject to see which courses are strong matches.'
      : `Add grades for ${missing.length} more subjects to see which courses are strong matches.`;
  }
  // "Optional — leave blank to skip" is the right thing to say to someone who
  // hasn't started, and a confusing contradiction to someone mid-way through.
  document.querySelector('.grade-input-help')?.classList.toggle('hidden', show);
}

// (Re)build one grade row per selected subject, preserving set values.
// Called on entry (buildGradeInput wiring) and on every subject toggle.
function syncGradeRows() {
  const rows = $('gradeRows');
  if (!rows) return;                           // not a letter-system input
  const scale = GRADE_SCALES[state.checkSystem] ?? [];
  if (_pendingUniform != null) {
    state.selectedSubjects.forEach(s => { if (!(s in _gradeMap)) _gradeMap[s] = _pendingUniform; });
  }
  if (!state.selectedSubjects.length) {
    rows.innerHTML = `<p class="grade-rows__empty">Pick your subjects above — each gets its own predicted grade.</p>`;
  } else {
    rows.innerHTML = state.selectedSubjects.map(s => `
      <label class="grade-pair">
        <span class="grade-pair__subject">${esc(s)}</span>
        <select class="grade-inline-select" data-grade-subject="${esc(s)}" aria-label="Predicted grade for ${esc(s)}">
          <option value="">—</option>
          ${scale.map(g => `<option value="${esc(g)}"${_gradeMap[s] === g ? ' selected' : ''}>${esc(g)}</option>`).join('')}
        </select>
      </label>`).join('');
  }
  commitGradeMap({ render: false });
}

function buildGradeInput(systemKey) {
  const section = $('gradeInputSection');
  if (!section) return;
  state.predictedGrade = null;
  _gradeMap = {};
  _pendingUniform = null;
  if (!systemKey) { section.classList.add('hidden'); section.innerHTML = ''; return; }

  const tooltipText = "Grades affect which courses show as strong matches — it's a guide, not a hard filter.";
  const hint        = 'Affects which courses show as strong matches';

  // Rough cross-system conversion guidance (UK A-Level is the baseline, so
  // it has no hint). Always advise verifying with each university.
  const conversionHint = GRADE_CONVERSION_HINTS[systemKey]
    ? `<p class="grade-conversion-hint">${esc(GRADE_CONVERSION_HINTS[systemKey])}</p>`
    : '';

  // ONE merged section: the grade rows already name every subject, so this
  // header owns both concepts and carries the Edit affordance (opening the
  // same picker as before) — no separate "Your subjects" row repeating them.
  const isLetter = PER_SUBJECT_GRADE_SYSTEMS.has(systemKey);
  const setAllHtml = isLetter ? `
        <label class="grade-setall">
          <span class="grade-setall__label">Set all</span>
          <select id="gradeSetAll" class="grade-inline-select">
            <option value="">—</option>
            ${GRADE_SCALES[systemKey].map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('')}
          </select>
        </label>` : '';
  const header = `
      <div class="grade-input-header">
        <span class="control-label">${isLetter ? 'Your subjects &amp; predicted grades' : 'Your predicted grades'}</span>
        <span class="grade-input-tooltip" aria-label="${esc(tooltipText)}" tabindex="0" title="${esc(tooltipText)}">ⓘ</span>
        <span class="picker-hint-inline grade-input-hint">${hint}</span>
        <span class="grade-input-header__actions">
          ${setAllHtml}
          <button type="button" id="gradeEditSubjects" class="subject-summary__edit" aria-label="Edit your subjects">Edit subjects</button>
        </span>
      </div>`;
  // Leaving the input blank is itself "skip" → subject-only matching.
  const footer = `
      ${conversionHint}
      <p class="grade-input-help">Optional — leave ${isLetter ? 'any ' : ''}blank to match on subjects alone.</p>`;

  // Per-system grade body + a wiring callback. Everything else is shared.
  let bodyHtml = '';
  let wire     = null;

  if (PER_SUBJECT_GRADE_SYSTEMS.has(systemKey)) {
    // Per-subject predictions: offers in these systems are grade PROFILES
    // ("A*AA"), so each selected subject gets its own compact select. The
    // "Set all to" quick action keeps the uniform case one click. US_AP
    // shares this exact machinery — its scale is the digits 1–5, no letters.
    bodyHtml = `<div id="gradeRows" class="grade-rows"></div>
      <p id="gradeIncomplete" class="grade-incomplete hidden"></p>` + (systemKey === 'US_AP'
        ? `\n      <p class="grade-input-note">AP entry requirements aren't held yet, so this isn't compared to courses.</p>`
        : '');
    wire = () => {
      $('gradeSetAll').addEventListener('change', e => {
        const g = e.target.value;
        if (!g) return;
        state.selectedSubjects.forEach(s => { _gradeMap[s] = g; });
        syncGradeRows();
        commitGradeMap();
        e.target.value = '';
      });
      $('gradeRows').addEventListener('change', e => {
        const sel = e.target.closest('[data-grade-subject]');
        if (!sel) return;
        const subj = sel.dataset.gradeSubject;
        if (sel.value) _gradeMap[subj] = sel.value; else delete _gradeMap[subj];
        commitGradeMap();
      });
      syncGradeRows();
    };
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

/* ═══════════════════════════════════════════════════════════════
 * ROUTER — app-wide back navigation via browser history.
 *
 * Each user-facing screen change records a lightweight route descriptor
 * into history.pushState; the browser Back/Forward buttons (and the
 * mobile back gesture) fire popstate, which re-renders the stored route
 * WITHOUT mutating persisted state — Back restores a view, never wipes
 * progress. A single in-app "← Back" control mirrors the browser Back.
 *
 * Route shapes:
 *   { v: 'stage'  }                          – onboarding stage select
 *   { v: 'system' }                          – onboarding system select
 *   { v: 'ws', mode, stage }                 – a workspace tool/panel
 *   { v: 'field', fieldId, from }            – a field profile
 * ═══════════════════════════════════════════════════════════════ */

let _restoringRoute = false;   // true while applying a popstate route — suppresses pushes
let _curIdx = 0;               // depth of the current entry in the app's linear history

function sameRoute(a, b) {
  return !!a && !!b && a.v === b.v && a.mode === b.mode
      && a.stage === b.stage && a.fieldId === b.fieldId;
}

// Record the current screen into history. Replaces the entry when this is the
// first app route (no leading blank entry) or when asked; otherwise pushes a
// new entry. Duplicate routes are skipped so a redirect can't create a loop.
function markRoute(route, { replace = false } = {}) {
  if (_restoringRoute) return;                        // popstate is driving — don't touch history
  const top = history.state && history.state.altiora;
  if (!replace && sameRoute(top, route)) return;      // dedupe / loop guard
  if (replace || !top) {
    _curIdx = (history.state && typeof history.state.idx === 'number') ? history.state.idx : 0;
    history.replaceState({ altiora: route, idx: _curIdx }, '');
  } else {
    _curIdx += 1;
    history.pushState({ altiora: route, idx: _curIdx }, '');
  }
  updateBackControl();
}

// Re-render a stored route (from popstate). _restoringRoute is set by the
// caller so the show/switch calls below don't push new history entries.
function renderRoute(route) {
  switch (route.v) {
    case 'stage':    showStageSelect();    break;
    case 'system':   showSystemSelect();   break;
    case 'year':     showYearSelect();     break;
    case 'proposal': showStageProposal();  break;
    case 'osubjects':
      showSubjectOnboard(_subjectOnboardStage || AltioraState.getProfile().stage || DEFAULT_STAGE);
      break;
    case 'field':
      if (route.fieldId && resolveFieldId(route.fieldId))
        openFieldOverview(route.fieldId, { from: route.from || 'strengths' });
      else showWorkspaceHome();
      break;
    case 'ws':
    default:
      applyStageChrome(route.stage || AltioraState.getProfile().stage || DEFAULT_STAGE);
      switchMode(route.mode || 'home');
      break;
  }
}

// Show/hide the in-app back control based on whether there's an app entry
// to go back to (depth > 0). Keeps browser Back and the nav "← Back" in step.
function updateBackControl() {
  $('navBack')?.classList.toggle('hidden', _curIdx <= 0);
}

// One step back through the app's history. Falls back to Home only when
// there's no prior in-app entry (e.g. a deep link straight into a profile),
// so Back never drops the user out of the app into a broken state.
function appBack() {
  if (_curIdx > 0) history.back();
  else goHome();
}

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
  $('panel-story')             ?.classList.toggle('hidden', mode !== 'story');
  $('panel-summary')           ?.classList.toggle('hidden', mode !== 'summary');

  // The shortlist and home are cross-stage views, not stage tools —
  // highlight their own controls rather than a stage-tool button.
  $('shortlistLink')?.classList.toggle('shortlist-link--active', mode === 'shortlist');
  $('storyLink')?.classList.toggle('shortlist-link--active', mode === 'story');
  $('homeLink')?.classList.toggle('home-link--active', mode === 'home');

  if (mode === 'check') {
    // Year-aware framing + empty-state variant (cheap: cached by builtFor).
    updateCheckFraming();
    renderCheckEmptyState();
    // The My Fields lens may have changed while away (pins edited elsewhere) —
    // re-apply the default and refresh results only if the lens differs.
    applyMyFieldsToCategoryFilter();
    if (state.selectedSubjects.length && categoryFilterSig() !== _resultsCatSig) renderCheckResults();
  }
  if (mode === 'reverse') {
    updateReverseIntro();
    // Re-render an existing search so the have/missing comparison always
    // reflects the CURRENT saved subjects (they may have changed in Check).
    if (state.searchQuery) renderReverseResults();
  }
  if (mode === 'strengths') {
    renderStrengthsIntro();
    if ($('strengthsGrid').children.length === 0) renderStrengthsGrid();
    // Re-render the field-card results on (re)entry so their KEEP buttons
    // reflect the CURRENT candidateFields (e.g. a field kept from the profile
    // while away). No-ops when no strengths are selected.
    renderStrengthsResults();
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
  if (mode === 'story') {
    renderStoryPanel();
  }
  if (mode === 'summary') {
    renderCounselorSummary();
  }

  // Record the workspace view in history (the field profile records itself,
  // with its fieldId, from openFieldOverview).
  if (mode !== 'field-overview') {
    markRoute({ v: 'ws', mode, stage: AltioraState.getProfile().stage || DEFAULT_STAGE });
  }
}

/* ═══════════════════════════════════════════════════════════════
 * JOURNEY STAGES
 * Each stage has one PRIMARY tool (shown by default) plus SECONDARY
 * tools surfaced as lighter sub-nav links — replacing the old bar of
 * co-equal tabs. The stage is persisted via AltioraState.
 * ═══════════════════════════════════════════════════════════════ */

const STAGES = {
  exploring: { name: 'Exploring fields',            primary: 'strengths', secondary: ['plan'] },
  choosing:  { name: 'Choosing my subjects',       primary: 'plan',      secondary: ['check'] },
  building:  { name: 'Building my university list', primary: 'check',     secondary: ['reverse'] },
  applying:  { name: 'Applying',                    primary: 'applying',  secondary: [] },
};

const MODE_LABELS = {
  strengths:            'Start with Strengths',
  plan:                 'Subject Planner',
  reverse:              'Course Finder',
  check:                'Check Combination',
  applying:             'Applying',
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

/* ═══════════════════════════════════════════════════════════════
 * YEAR GROUP — the counselor's first question.
 * Asked right after the qualification system (labels depend on it),
 * normalised to ONE scale that drives all logic:
 *   yearsUntilApplication — 3 (three or more years out) | 2 | 1 | 0
 *   where 0 = the application year.
 * The raw label (profile.yearGroup) exists ONLY for display; nothing
 * outside this labelling layer may branch on it.
 * ═══════════════════════════════════════════════════════════════ */

const YEAR_OPTIONS = {
  UK_A_Level: [
    { label: 'Year 9',  years: 3 },
    { label: 'Year 10', years: 3 },
    { label: 'Year 11', years: 2 },
    { label: 'Year 12', years: 1 },
    { label: 'Year 13', years: 0 },
  ],
  IB: [
    { label: 'Pre-IB — Year 10 / Grade 9',  years: 3 },
    { label: 'Pre-IB — Year 11 / Grade 10', years: 2 },
    { label: 'IB DP Year 1', years: 1 },
    { label: 'IB DP Year 2', years: 0 },
  ],
  US_AP: [
    { label: 'Grade 8',  years: 3 },
    { label: 'Grade 9',  years: 3 },
    { label: 'Grade 10', years: 2 },
    { label: 'Grade 11', years: 1 },
    { label: 'Grade 12', years: 0 },
  ],
  SG_A_Level: [
    { label: 'Secondary 3', years: 3 },
    { label: 'Secondary 4', years: 2 },
    { label: 'JC1', years: 1 },
    { label: 'JC2', years: 0 },
  ],
  HK_DSE: [
    { label: 'Form 3', years: 3 },
    { label: 'Form 4', years: 2 },
    { label: 'Form 5', years: 1 },
    { label: 'Form 6', years: 0 },
  ],
};

// The year → stage proposal. Proposed, never imposed.
const YEAR_IMPLIED_STAGE = { 3: 'exploring', 2: 'choosing', 1: 'building', 0: 'applying' };

function yearImpliedStage(years) {
  return YEAR_IMPLIED_STAGE[years] ?? null;
}

// The student's normalised distance from applying, or null when unset.
function studentYears() {
  const y = AltioraState.getProfile().yearsUntilApplication;
  return (typeof y === 'number' && y >= 0 && y <= 3) ? y : null;
}

// Why we propose that stage — visible reasoning, in the student's own terms.
// The year implies URGENCY, not certainty: a late-year student may still be
// undecided on their field, which is completely normal — so the late-year
// proposals carry a real door into Exploring fields, in the same body style.
// The link routes through enterStage, the identical path the manual stage
// cards use, so the armed subject question still fires.
function stageProposalReason(yearLabel, stage) {
  const explore = label =>
    `<button type="button" class="stage-proposal__link" data-proposal-goto="exploring">${label}</button>`;
  const REASONS = {
    exploring: `You're in ${yearLabel}, so we'll start you at <strong>Exploring fields</strong> — there's real time before any big decisions, so this is the moment to discover which fields and degrees actually fit you.`,
    choosing:  `You're in ${yearLabel}, so we'll start you at <strong>Choosing your subjects</strong> — your subject choices are the live decision right now, and they shape which doors stay open later.`,
    building:  `You're in ${yearLabel}, so we'll start you at <strong>Building your university list</strong> — your subjects are set, and now it's about where they can take you.
      Not sure what you want to study yet? That's completely normal at this point — you can start at ${explore('Exploring fields')} instead, and your subjects will follow you there.`,
    applying:  `You're in ${yearLabel}, so we'll start you at <strong>Applying</strong> — this is your application year, so deadlines, admission tests, and applications are the focus.
      Still weighing what to study? You can ${explore('explore fields')} first — the deadlines won't wait, but nothing stops you deciding and applying in the same year.`,
  };
  return REASONS[stage] ?? '';
}

// Show the full-screen year-selection screen for the CURRENT system
// (onboarding step 2, and the one-time prompt for old saves missing a year).
function showYearSelect() {
  closeStageMenu();
  const sys = AltioraState.getProfile().qualificationSystem;
  const options = YEAR_OPTIONS[sys] || YEAR_OPTIONS.UK_A_Level;
  $('yearCards').innerHTML = options.map(o => `
    <button class="stage-card stage-card--year" data-year-label="${esc(o.label)}" data-years="${o.years}" role="listitem">
      <span class="stage-card__title">${esc(o.label)}</span>
    </button>`).join('');
  $$('#yearCards .stage-card').forEach(card =>
    card.addEventListener('click', () => chooseYear(card.dataset.yearLabel, parseInt(card.dataset.years, 10))));
  $('workspace').classList.add('hidden');
  $('stageSelect').classList.add('hidden');
  $('systemSelect').classList.add('hidden');
  $('stageProposal').classList.add('hidden');
  $('subjectOnboard')?.classList.add('hidden');
  $('yearSelect').classList.remove('hidden');
  markRoute({ v: 'year' });
}

// Persist the chosen year, then continue the journey: new users get the
// year-informed stage proposal; returning users (backfill or change) go
// back to the workspace — the home nudge handles any stage mismatch.
function chooseYear(label, years) {
  if (!Number.isInteger(years) || years < 0 || years > 3) return;
  AltioraState.setProfile({
    yearGroup: label,
    yearsUntilApplication: years,
    yearSetAt: new Date().toISOString(),
  });
  updateYearIndicator();
  logEvent('year_select', { label, years });
  // Legacy divert path (a stage was explicitly picked before the system step):
  // honor that choice — the student told us where they want to be.
  if (_pendingStage) {
    const s = _pendingStage; _pendingStage = null;
    // Still onboarding (fresh user via a legacy entry point): a late-year
    // student gets the subject question here too.
    if (!maybeOfferOnboardSubjects(s)) routeToStage(s);
    return;
  }
  const hasStage = !!AltioraState.getProfile().stage;
  if (!hasStage) { showStageProposal(); return; }   // onboarding → proposal
  // Returning user (backfill / re-pick): back to the workspace home, where
  // the year-aware next-step nudges forward if the year implies a later stage.
  _isReturningUser = true;
  applyStageChrome(AltioraState.getProfile().stage);
  switchMode('home');
}

// The year-informed stage proposal — replaces the blind self-select for new
// users. Accepting routes in; "somewhere else" opens the manual stage cards.
function showStageProposal() {
  const p = AltioraState.getProfile();
  const stage = yearImpliedStage(p.yearsUntilApplication) || DEFAULT_STAGE;
  $('stageProposalReason').innerHTML = stageProposalReason(p.yearGroup || 'your year', stage);
  const accept = $('stageProposalAccept');
  accept.dataset.stage = stage;
  // The proposal only ever shows during onboarding — arm the follow-up
  // subject question for late-year students. It survives "No, start me
  // somewhere else" (the manual cards are still onboarding) and is consumed
  // by enterStage, so stage changes made later from the workspace never
  // re-trigger it.
  _onboardSubjectsPending = true;
  $('workspace').classList.add('hidden');
  $('yearSelect').classList.add('hidden');
  $('stageSelect').classList.add('hidden');
  $('systemSelect').classList.add('hidden');
  $('subjectOnboard')?.classList.add('hidden');
  $('stageProposal').classList.remove('hidden');
  markRoute({ v: 'proposal' });
}

/* ─── Onboarding subject capture (late years only) ──────────────
 * A Year 12/13 (or equivalent) student's subjects are already SET — so the
 * counselor's natural follow-up to "here's where we'd start you" is "which
 * subjects are you taking?". Students 2+ years out never see this: their
 * subject moment is the Gate, as a decision, later.
 *
 * This step is a PLACEMENT of the existing Check Combination picker, not a
 * new component: the live #subjectPickerSection node (same chips, same
 * Further-Maths-implies-Maths and IB-exclusion logic, same write-through
 * persistence to profile.subjects) is moved into the onboarding screen and
 * moved back when the step finishes. Grades are deliberately NOT asked here
 * — they stay optional and in-tool.
 * ─────────────────────────────────────────────────────────────── */

let _onboardSubjectsPending = false;   // armed by the stage proposal, consumed by enterStage
let _subjectOnboardStage    = null;    // where to route once the step finishes

// Offer the onboarding subject question if it applies (normalised year says
// subjects are set, and none are saved yet). Returns true when it took over
// the flow — the caller must NOT also route to the stage.
function maybeOfferOnboardSubjects(stage) {
  const years = studentYears();
  const has = (AltioraState.getProfile().subjects || []).length > 0;
  if (years == null || years > 1 || has) return false;
  showSubjectOnboard(stage);
  return true;
}

function showSubjectOnboard(stage) {
  _subjectOnboardStage = stage;
  // Move the REAL picker in (placement, not a copy). Selection persists live
  // through the existing check write-through; the "3–5 for best results"
  // hint is choosing language and promises instant results, so it hides here.
  const pickerSection = $('subjectPickerSection');
  const slot = $('subjectOnboardSlot');
  if (pickerSection && slot && pickerSection.parentElement !== slot) slot.appendChild(pickerSection);
  pickerSection?.classList.remove('hidden');
  $('subjectPickerHint')?.classList.add('hidden');
  syncPickerCollapse();   // the onboarding placement always shows the full picker
  $('workspace').classList.add('hidden');
  $('stageSelect').classList.add('hidden');
  $('systemSelect').classList.add('hidden');
  $('yearSelect').classList.add('hidden');
  $('stageProposal').classList.add('hidden');
  $('subjectOnboard').classList.remove('hidden');
  markRoute({ v: 'osubjects' });
}

function finishSubjectOnboard(skipped) {
  // The write-through is debounced — persist the final selection now so the
  // workspace opens against the committed profile.
  if (!skipped) syncProfileFromCheck();
  logEvent('onboard_subjects', { skipped: !!skipped, count: state.selectedSubjects.length });
  // Subjects just entered → land on Check with the compact summary so the
  // computed results are the star, not the picker they've just used.
  if (state.selectedSubjects.length) state.pickerCollapsed = true;
  const stage = _subjectOnboardStage || AltioraState.getProfile().stage || DEFAULT_STAGE;
  _subjectOnboardStage = null;
  routeToStage(stage);   // applyStageChrome restores the picker into Check
}

// Return the picker to its home inside panel-check (no-op when it never
// moved) and re-apply the year-aware hint rule the onboarding step overrode.
function restoreSubjectPickerHome() {
  const pickerSection = $('subjectPickerSection');
  const anchor = $('checkEmptyState');
  if (pickerSection && anchor && pickerSection.parentElement?.id === 'subjectOnboardSlot') {
    anchor.parentElement.insertBefore(pickerSection, anchor);
  }
  updateCheckFraming();
  syncPickerCollapse();   // back home: the compact-summary rule applies again
}

/* ─── Year indicator (global control, same pattern as system) ──── */
// The system and year controls live together in ONE profile popover
// ("A-Levels · Year 12 ▾"). The historical open/close names are kept as
// aliases so every existing call site keeps working unchanged.
function openProfileMenu()  { $('profileMenu')?.classList.remove('hidden'); $('profileIndicatorBtn')?.setAttribute('aria-expanded', 'true'); }
function closeProfileMenu() { $('profileMenu')?.classList.add('hidden');    $('profileIndicatorBtn')?.setAttribute('aria-expanded', 'false'); }
function toggleProfileMenu(){ $('profileMenu')?.classList.contains('hidden') ? openProfileMenu() : closeProfileMenu(); }
function openYearMenu()  { openProfileMenu(); }
function closeYearMenu() { closeProfileMenu(); }
function toggleYearMenu(){ toggleProfileMenu(); }

/* ═══════════════════════════════════════════════════════════════
 * BACKUP — export to a file, restore from one.
 * The file lives on the student's device. Nothing is uploaded, nothing
 * is stored by us, and the copy never says otherwise.
 * ═══════════════════════════════════════════════════════════════ */

function exportBackupFile() {
  let url = null;
  try {
    const envelope = AltioraState.exportBackup();
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = AltioraState.backupFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Backup saved to your device.');
    logEvent('backup_export', {});
  } catch (err) {
    console.error('[backup] export failed:', err);
    showToast('Couldn’t save the backup file.');
  } finally {
    // Revoke on the next frame so the download has taken the handle.
    if (url) setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

// Read → validate → confirm → replace. Nothing changes unless the file
// validates AND the student confirms; the confirm names the consequence.
function importBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onerror = () => showToast('Couldn’t read that file.');
  reader.onload = () => {
    const text = String(reader.result ?? '');
    const check = AltioraState.validateBackup(text);
    if (!check.ok) {
      showToast(check.error);
      logEvent('backup_import_rejected', { reason: check.error });
      return;
    }
    const when = check.envelope.exportedAt
      ? new Date(check.envelope.exportedAt).toLocaleDateString('en-GB',
          { day: 'numeric', month: 'long', year: 'numeric' })
      : null;
    const ok = window.confirm(
      `Restore this backup${when ? ` from ${when}` : ''}?\n\n`
      + 'This replaces everything currently saved on this device.');
    if (!ok) return;
    const res = AltioraState.importBackup(text);
    if (!res.ok) { showToast(res.error); return; }
    logEvent('backup_import', {});
    closeProfileMenu();
    // Re-project everything from the restored state.
    location.reload();
  };
  reader.readAsText(file);
}

function wireBackupControls() {
  $('backupExportBtn')?.addEventListener('click', () => { closeProfileMenu(); exportBackupFile(); });
  $('backupImportBtn')?.addEventListener('click', () => $('backupImportFile')?.click());
  $('backupImportFile')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    e.target.value = '';           // so re-picking the same file re-fires
    importBackupFile(file);
  });
  // The Counselor Summary already exists as the loss hedge; its own
  // export line is delegated here so it survives re-renders.
  document.addEventListener('click', e => {
    if (e.target.closest?.('[data-backup-export]')) { e.preventDefault(); exportBackupFile(); }
  });
}

// Reflect the profile year in the global indicator and rebuild the menu for
// the ACTIVE system (year labels are system-specific). Subscribed to state,
// so every year/system change propagates here without manual calls.
function updateYearIndicator() {
  const p = AltioraState.getProfile();
  const el = $('yearIndicatorName');
  if (el) el.textContent = p.yearGroup ?? '—';
  const menu = $('yearMenu');
  if (!menu) return;
  const options = YEAR_OPTIONS[p.qualificationSystem] || [];
  menu.innerHTML = options.map(o => `
    <button class="stage-menu__item${o.label === p.yearGroup ? ' stage-menu__item--current' : ''}"
            data-year-label="${esc(o.label)}" data-years="${o.years}" role="menuitem">${esc(o.label)}</button>`).join('');
  menu.querySelectorAll('.stage-menu__item').forEach(item =>
    item.addEventListener('click', () => changeYear(item.dataset.yearLabel, parseInt(item.dataset.years, 10))));
}

// The single global control: change the year everywhere. If the new year
// implies a different stage than the current one, gently re-propose by
// returning home where the year-aware nudge carries the reasoning — the
// stage is NEVER changed automatically.
function changeYear(label, years) {
  closeYearMenu();
  const p = AltioraState.getProfile();
  if (label === p.yearGroup) return;
  AltioraState.setProfile({
    yearGroup: label,
    yearsUntilApplication: years,
    yearSetAt: new Date().toISOString(),
  });
  logEvent('year_change', { label, years });
  showToast(`Year updated to ${label}`);
  const implied = yearImpliedStage(years);
  if (implied && implied !== p.stage) {
    applyStageChrome(p.stage || DEFAULT_STAGE);
    switchMode('home');            // the home next-step shows the gentle re-proposal
  } else {
    rerenderCurrentView();         // framing (planner copy etc.) follows the year
  }
}

// Keep the raw label meaningful when the SYSTEM changes: the normalised
// years value is system-agnostic, so re-express it in the new system's terms
// (e.g. UK "Year 12" → US "Grade 11", both years=1).
function remapYearLabelForSystem(sys) {
  const p = AltioraState.getProfile();
  if (p.yearsUntilApplication == null) return;
  const options = YEAR_OPTIONS[sys] || [];
  if (options.some(o => o.label === p.yearGroup)) return;   // already valid
  const match = options.find(o => o.years === p.yearsUntilApplication);
  if (match) AltioraState.setProfile({ yearGroup: match.label });
}

// Stage chosen during onboarding, held until the system step completes.
let _pendingStage = null;

// Show the full-screen stage-selection screen (manual choice — reached via
// "No, start me somewhere else" on the proposal, or legacy entry points).
function showStageSelect() {
  closeStageMenu();
  $('workspace').classList.add('hidden');
  $('systemSelect').classList.add('hidden');
  $('yearSelect').classList.add('hidden');
  $('stageProposal').classList.add('hidden');
  $('subjectOnboard')?.classList.add('hidden');
  $('stageSelect').classList.remove('hidden');
  markRoute({ v: 'stage' });
}

// Show the full-screen qualification-system selection screen (first
// onboarding step / the one-time prompt for old saves missing a system).
function showSystemSelect() {
  closeStageMenu();
  $('workspace').classList.add('hidden');
  $('stageSelect').classList.add('hidden');
  $('yearSelect').classList.add('hidden');
  $('stageProposal').classList.add('hidden');
  $('subjectOnboard')?.classList.add('hidden');
  $('systemSelect').classList.remove('hidden');
  markRoute({ v: 'system' });
}

// Reveal the workspace and set up the stage chrome (indicator + sub-nav)
// for a stage, without choosing which view to show.
function applyStageChrome(stage) {
  if (!STAGES[stage]) stage = DEFAULT_STAGE;
  // If the onboarding subject step's picker placement is still active (e.g.
  // goHome mid-step), return the picker to panel-check before the workspace
  // shows — Check Combination must never render without its picker.
  restoreSubjectPickerHome();
  $('stageSelect').classList.add('hidden');
  $('systemSelect').classList.add('hidden');
  $('yearSelect').classList.add('hidden');
  $('stageProposal').classList.add('hidden');
  $('subjectOnboard')?.classList.add('hidden');
  $('workspace').classList.remove('hidden');
  closeProfileMenu();
  renderJourneyBar(stage);
  updateSystemIndicator(AltioraState.getProfile().qualificationSystem);
  updateYearIndicator();
  renderStageToolNav(stage);
}

/* ─── Journey bar — the four stages, live, on every screen ────────
 * Replaces the old "Stage:" dropdown. Pure projection of existing
 * machinery: per-step state from stageProgress (the home strip's
 * logic), clicks run enterStage exactly as the dropdown did, and the
 * "Next →" chip runs the existing graduation acceptance. Subscribed
 * to state, so completing a stage's criteria lights the chip live. */

const JOURNEY_LABELS = {
  exploring: 'Exploring fields',
  choosing:  'Choosing subjects',
  building:  'Building list',
  applying:  'Applying',
};

function renderJourneyBar(stageOverride) {
  const bar = $('journeyBar');
  if (!bar) return;
  const stage  = STAGES[stageOverride] ? stageOverride
               : (AltioraState.getProfile().stage || DEFAULT_STAGE);
  const curIdx = STAGE_ORDER.indexOf(stage);
  const progress = Object.fromEntries(STAGE_ORDER.map(s => [s, stageProgress(s)]));
  // Graduation surfacing: current stage done → the NEXT step carries a
  // subtle chip on every screen. The richer card on home stays.
  const next     = NEXT_STAGE[stage];
  const showNext = !!next && progress[stage].done;

  bar.innerHTML = STAGE_ORDER.map((s, i) => {
    // Same skip semantics as the old home strip: earlier stages a
    // late-joiner never did show quietly dimmed, never as failures.
    let cls, mark = '';
    if (i === curIdx)               { cls = 'current'; }
    else if (progress[s].done)      { cls = 'done'; mark = '✓ '; }
    else if (i < curIdx)            { cls = 'skipped'; }
    else                            { cls = 'todo'; }
    const nextChip = (showNext && s === next)
      ? `<button type="button" class="journey-bar__next" data-journey-next="${s}">Next →</button>` : '';
    return `<span class="journey-bar__slot">
      <button type="button" class="journey-bar__step journey-bar__step--${cls}"
              data-journey-stage="${s}"${i === curIdx ? ' aria-current="step"' : ''}
              title="${esc(STAGES[s].name)}">
        <span class="journey-bar__num" aria-hidden="true">${i + 1}</span><span class="journey-bar__label">${mark}${esc(JOURNEY_LABELS[s])}</span>
      </button>${nextChip}</span>`;
  }).join('<span class="journey-bar__sep" aria-hidden="true">→</span>');
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
  const p = AltioraState.getProfile();
  if (onboarded && p.qualificationSystem && p.yearsUntilApplication == null && !p.stage) {
    showYearSelect();                                      // mid-onboarding: system chosen, year pending
  }
  else if (onboarded && p.qualificationSystem) showWorkspaceHome();   // → workspace dashboard
  else if (onboarded)                          showSystemSelect();    // old save, no system yet
  else                                         showSystemSelect();    // onboarding starts at the system
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
  // Onboarding only (armed by the stage proposal): late-year students are
  // asked their subjects before landing — whether they accepted the proposal
  // or manually picked a stage. The flag is consumed either way.
  if (_onboardSubjectsPending) {
    _onboardSubjectsPending = false;
    if (maybeOfferOnboardSubjects(stage)) return;
  }
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
  remapYearLabelForSystem(sys);
  logEvent('system_select', { system: sys });
  // Year comes right after the system (its labels depend on it). This covers
  // both fresh onboarding and old saves that predate year capture.
  if (AltioraState.getProfile().yearsUntilApplication == null) { showYearSelect(); return; }
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
  remapYearLabelForSystem(sys);   // re-express the year in the new system's terms (same normalised value)
  updateYearIndicator();
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
  // Saved subjects arrive pre-selected with results computed — a student who
  // has told us their subjects never faces an empty picker. (Unhides the
  // results section again via the normal toggle path when anything matched.)
  preloadCheckFromProfile();
  updateCheckFraming();
}

// Pre-load the student's saved profile.subjects into the Check Combination
// picker. The picker stays fully editable — it IS the one place to edit your
// subjects, and the existing write-through (syncProfileFromCheck) persists
// every change straight back. Subject names that don't exist in the active
// system (e.g. right after a system change) simply don't tick.
function preloadCheckFromProfile() {
  if (typeof AltioraState === 'undefined') return;
  const saved = AltioraState.getProfile().subjects;
  if (!Array.isArray(saved) || !saved.length) return;
  let any = false;
  $$('#subjectPicker input[type="checkbox"]').forEach(cb => {
    if (saved.includes(cb.value)) { cb.checked = true; any = true; }
  });
  // Pre-loaded subjects rarely change — default to the compact summary view
  // so the results lead the page. Edit/Done override for the session.
  if (any) state.pickerCollapsed = true;
  if (any) onSubjectToggle();   // the standard path: tags, FM lock, count, results
}

// Re-render whatever view is currently active (after a system change).
function rerenderCurrentView() {
  switch (state.mode) {
    case 'check':   updateCheckFraming(); renderCheckEmptyState(); if (state.selectedSubjects.length) renderCheckResults(); break;
    case 'plan':    renderPlanResults(); break;   // guards internally on selected fields
    case 'reverse': updateReverseIntro(); if (state.searchQuery) renderReverseResults(); break;
    case 'field-overview': if (state.exploreField?.fieldId) renderFieldOverview(state.exploreField.fieldId); break;
    case 'home':     renderWorkspaceHome(); break;
    case 'applying': renderApplyingPanel(); break;
    case 'story':    renderStoryPanel(); break;
    case 'summary':  renderCounselorSummary(); break;
    // shortlist: the glance counsel is year- and system-aware.
    case 'shortlist': renderShortlist(); break;
    // strengths: the grid is system-agnostic, but the intro copy and the
    // per-field subject-coverage line are year/subject/system-aware.
    case 'strengths': renderStrengthsIntro(); renderStrengthsResults(); break;
  }
}

/* ─── System control — lives inside the profile popover ────────── */
function openSystemMenu()   { openProfileMenu(); }
function closeSystemMenu()  { closeProfileMenu(); }
function toggleSystemMenu() { toggleProfileMenu(); }

// Build the per-stage tool sub-nav: primary tool front and centre,
// secondary tools as lighter links. Every tool is free.
function renderStageToolNav(stage) {
  if (!STAGES[stage]) stage = DEFAULT_STAGE;
  const cfg = STAGES[stage];
  const nav = $('stageToolNav');
  if (!nav) return;

  let tools = [cfg.primary, ...cfg.secondary];
  // Late-year explorers (application year or the one before) already have
  // their subjects set — inviting them to "plan subjects" from discovery is
  // misleading. Drop the Subject Planner from the Exploring nav for them; the
  // stage still proposes, never imprisons, so the tool remains reachable from
  // other stages and the home nudge.
  const _yrs = studentYears();
  if (stage === 'exploring' && _yrs != null && _yrs <= 1) tools = tools.filter(t => t !== 'plan');
  nav.innerHTML = tools.map((mode, i) => {
    const cls = `stage-tool${i === 0 ? ' stage-tool--primary' : ''}`;
    // The Applying stage's only tool pill would repeat the journey bar's
    // active "Applying" label an inch below it — here (and only here) the
    // pill reads "My plan". Same target, same behaviour, tool-nav only.
    const label = (stage === 'applying' && mode === 'applying') ? 'My plan' : (MODE_LABELS[mode] || mode);
    return `<button class="${cls}" data-mode="${mode}">${esc(label)}</button>`;
  }).join('');

  $$('#stageToolNav .stage-tool').forEach(btn =>
    btn.addEventListener('click', () => switchMode(btn.dataset.mode))
  );
}

// Minimal, honest Applying view: the saved shortlist + a what's-next
// checklist derived from it + an intentional roadmap note. No dead end.
// Application-year orientation for an EMPTY shortlist. A student with
// yearsUntilApplication === 0 needs the timing truths NOW, before they've
// saved a single course: this is their cycle, and admission-test
// registrations typically close well before application deadlines. Built
// from the same admissionTestInfo typical windows already in the data (no
// invented dates) with official links; once courses are saved, the existing
// per-course test checklist takes over and this block disappears.
/* ═══════════════════════════════════════════════════════════════
 * APPLYING — diagnosis first, then execution.
 *
 * The page opens with the single most consequential fact about the
 * application (the shortlist's balance), then the work. Tasks are
 * DERIVED from the saved shortlist; ids are stable and meaning-derived
 * ("test-reg:ESAT+TMUA+TARA"), so ticks survive shortlist edits.
 *
 * Timing is always a TYPICAL WINDOW from the verified admissionTestInfo
 * layer — never a hardcoded calendar date. Now/Soon/Later buckets are
 * computed from those windows' months against today's month, so the
 * grouping stays correct as the cycle turns without any date literals.
 *
 * Deliberately NOT here: any instruction to drop or swap a specific
 * course, any quantified "effort saved", any invented score target.
 * The load is stated; the choice is the student's.
 * ═══════════════════════════════════════════════════════════════ */

const MONTH_NAMES = ['january','february','march','april','may','june',
                     'july','august','september','october','november','december'];

// First month named in a window string → 1-12, or null. Reads the EXISTING
// verified window prose; invents nothing.
function firstMonthIn(str) {
  const m = String(str ?? '').toLowerCase().match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/);
  return m ? MONTH_NAMES.indexOf(m[1]) + 1 : null;
}

// Cycle-relative urgency bucket: 0 Now · 1 Soon · 2 Later. A window that
// opened in the last few months counts as Now (it is open, act on it).
function cycleBucket(cycleMonth, nowMonth) {
  if (cycleMonth == null) return 2;
  const off = (cycleMonth - nowMonth + 12) % 12;
  if (off >= 9 || off <= 1) return 0;
  if (off <= 4) return 1;
  return 2;
}
const BUCKET_LABELS = ['Now', 'Soon', 'Later'];

const testInfoFor = t => (typeof admissionTestInfo !== 'undefined') ? admissionTestInfo[t] : null;

// Tests that share a registration body AND the same opening month are ONE
// action, not N near-identical rows. Grouping key is derived from the data
// (provider or official host + regOpensMonth), never hand-listed.
function groupedTests(tests) {
  const groups = new Map();
  tests.forEach(t => {
    const i = testInfoFor(t);
    let host = '';
    try { host = i ? new URL(i.officialUrl).hostname : ''; } catch (_) { host = ''; }
    const key = `${i?.provider ?? host}|${i?.regOpensMonth ?? 'x'}`;
    groups.set(key, [...(groups.get(key) ?? []), t]);
  });
  return [...groups.values()]
    .map(members => members.slice().sort())
    .sort((a, b) => (testInfoFor(a[0])?.regOpensMonth ?? 98) - (testInfoFor(b[0])?.regOpensMonth ?? 98)
      || a[0].localeCompare(b[0]));
}

// The shared window sentence for a group, naming any member that differs
// rather than flattening the difference away.
function sharedWindowText(members, key) {
  const vals = members.map(t => [t, testInfoFor(t)?.[key]]).filter(([, v]) => v);
  if (!vals.length) return null;
  const uniq = [...new Set(vals.map(([, v]) => v))];
  if (uniq.length === 1) return uniq[0];
  const base = uniq.slice().sort((a, b) => a.length - b.length)[0];
  const extras = vals.filter(([, v]) => v !== base).map(([t, v]) => {
    const name = testInfoFor(t)?.name ?? t;
    // Only the part that differs — no repeating the shared sentence.
    const extra = v.startsWith(base) ? v.slice(base.length).replace(/^[\s.,;·—-]+/, '') : v;
    return `${name} also: ${extra}`;
  });
  return `${base} (${extras.join('; ')})`;
}

/* ─── Why a test is on the list ────────────────────────────────
 * Four strands, all either the student's OWN data or transcribed from the
 * test provider's own page (see admissionTestInfo's header for sources):
 *   who needs it  — derived from the shortlist
 *   what it is    — admissionTestInfo.description
 *   consequence   — ONLY where requiredStatus === 'required'
 *   practice      — admissionTestInfo.prepUrl
 * Never a score target, cutoff, difficulty rating or pass rate.
 * ─────────────────────────────────────────────────────────────── */

// A compact, recognisable course label: "Oxford Engineering Science".
function courseShortLabel(c) {
  const uni = String(c.university || '')
    .replace(/^(The\s+)?University of\s+/i, '')
    .replace(/\s+University$/i, '')
    .replace(/^Imperial College London$/i, 'Imperial')
    .replace(/^London School of Economics.*$/i, 'LSE');
  // Drop the trailing degree designation — it adds length, not recognition.
  const name = String(c.name || '')
    .replace(/\s+\(?(B[A-Z][a-z]?|M[A-Z][a-z]{1,4}|LLB|MBChB|MBBS|BEng|MEng|BSc|MSci|BA)\b[\w/()]*\)?\s*$/,'')
    .trim();
  return [uni, name].filter(Boolean).join(' ');
}

// The student's own saved courses that ask for any of these tests.
function coursesNeedingTests(members, savedCourses) {
  const want = new Set(members);
  return savedCourses.filter(c => (c.admissionTests || []).some(t => want.has(t)));
}

// How a course relates to one of its tests. Anything but an explicit
// "optional-lower-offer" hydrates as "required" — old saves and courses
// without the field fail safe in the strict direction.
function testRelationFor(course, test) {
  const rel = course?.admissionTestRelations?.[test];
  return rel === 'optional-lower-offer' ? 'optional-lower-offer' : 'required';
}

// ONE renderer for the admission-test tag on both card surfaces (Check and
// Shortlist), reading the SAME relation the Applying checklist reads — the
// cards must never contradict the checklist or the course's own notes.
function testTagHtml(course, test) {
  return testRelationFor(course, test) === 'optional-lower-offer'
    ? `<span class="admission-test-tag admission-test-tag--optional">${esc(test)} optional — can lower the offer</span>`
    : `<span class="admission-test-tag">${esc(test)} required</span>`;
}

// "Needed for: A, B (2 of your 4 saved courses)" — their data, not a claim.
// Where the verified source says the test only lowers the offer, say that
// instead: "required" is requirement language we may not use for it.
function testNeedsLine(members, savedCourses) {
  const hits = coursesNeedingTests(members, savedCourses);
  if (!hits.length) return null;
  const want = new Set(members);
  const isRequiredFor = c => (c.admissionTests || [])
    .some(t => want.has(t) && testRelationFor(c, t) === 'required');
  const needed   = hits.filter(c => isRequiredFor(c));
  const optional = hits.filter(c => !isRequiredFor(c));
  const total = savedCourses.length;
  const parts = [];
  if (needed.length) {
    parts.push(`Needed for: ${needed.map(courseShortLabel).join(', ')} `
             + `(${needed.length} of your ${total} saved course${total === 1 ? '' : 's'})`);
  }
  if (optional.length) {
    parts.push(`Optional for: ${optional.map(courseShortLabel).join(', ')} `
             + `— can lower the offer. Not needed for the standard offer.`);
  }
  return parts.join(' · ');
}

// What the test actually is — transcribed description, named per test when a
// registration covers more than one.
function testWhatLine(members) {
  const parts = members.map(t => {
    const i = testInfoFor(t);
    if (!i?.description) return null;
    return members.length > 1 ? `${i.name} — ${i.description}` : i.description;
  }).filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

// Stated ONLY where the provider's own page says the test is compulsory for
// the courses that use it. Course-dependent, offer-condition and postgraduate
// tests get no consequence line — an unverified consequence is worse than none.
function testConsequenceLine(members) {
  const req = members.filter(t => testInfoFor(t)?.requiredStatus === 'required');
  if (!req.length) return null;
  const names = req.map(t => testInfoFor(t)?.name ?? t);
  const one = req.length === 1;
  return `${names.join(' and ')} ${one ? 'is' : 'are'} required by the universities that use `
       + `${one ? 'it' : 'them'} — miss the registration deadline and you can't apply to those `
       + `courses this cycle.`;
}

// Official site + the provider's own free practice materials.
function testLinks(members, opts = {}) {
  const out = [];
  if (!opts.prepOnly) {
    const off = members.map(testInfoFor).find(i => i?.officialUrl);
    if (off) out.push({ url: off.officialUrl, label: 'Official site' });
  }
  const seen = new Set();
  members.forEach(t => {
    const i = testInfoFor(t);
    if (!i?.prepUrl || seen.has(i.prepUrl)) return;
    seen.add(i.prepUrl);
    out.push({
      url: i.prepUrl,
      label: members.length > 1 ? `${i.name} practice materials` : 'Practice materials',
    });
  });
  return out;
}

// Ordered task list for the current shortlist.
function applyingTasks(savedCourses, opts = {}) {
  const nowMonth = opts.nowMonth ?? (new Date().getMonth() + 1);
  const tests = [...new Set(savedCourses.flatMap(c => Array.isArray(c.admissionTests) ? c.admissionTests : []))];
  const groups = groupedTests(tests);
  const tasks = [];

  // 1. Register — one task per shared-registration group.
  groups.forEach(members => {
    const infos = members.map(testInfoFor);
    const names = members.map((t, i) => infos[i]?.name ?? t);
    const win = sharedWindowText(members, 'typicalRegistrationWindow');
    const provider = infos.find(i => i?.provider)?.provider;
    const many = members.length > 1;
    tasks.push({
      id: `test-reg:${members.join('+')}`,
      seq: 1, seqLabel: 'Register for tests',
      cycleMonth: infos.find(i => i?.regOpensMonth)?.regOpensMonth ?? firstMonthIn(win),
      label: many ? `Register for your admission tests (${names.join(', ')})`
                  : `Register for ${names[0]}`,
      detail: win
        ? `${many ? 'One registration covers all of them' : 'Registration'}${provider && many ? ` via ${provider}` : ''} — ${win}. Typical window; confirm the exact dates.`
        : 'Check the official site for this cycle’s registration window.',
      needs:       testNeedsLine(members, savedCourses),
      whatItIs:    testWhatLine(members),
      consequence: testConsequenceLine(members),
      links:       testLinks(members),
      liveEarly: true,   // registration opens before the application year
    });
  });

  // 2. Sit — same grouping.
  groups.forEach(members => {
    const infos = members.map(testInfoFor);
    const names = members.map((t, i) => infos[i]?.name ?? t);
    const win = sharedWindowText(members, 'typicalTestWindow');
    tasks.push({
      id: `test-sit:${members.join('+')}`,
      seq: 2, seqLabel: 'Sit the tests',
      cycleMonth: firstMonthIn(win),
      label: members.length > 1 ? `Sit your admission tests (${names.join(', ')})` : `Sit ${names[0]}`,
      detail: win ? `Test ${win}. Typical window — registration closes before it.`
                  : 'Check the official site for this cycle’s test window.',
      needs:    testNeedsLine(members, savedCourses),
      whatItIs: testWhatLine(members),
      // The missed-deadline consequence belongs to registration, not sitting.
      links:    testLinks(members, { prepOnly: true }),
    });
  });

  // 3. The application itself.
  const entryCount = (typeof AltioraState !== 'undefined') ? AltioraState.getAchievements().length : 0;
  tasks.push({
    id: 'app:grades', seq: 3, seqLabel: 'Your application', cycleMonth: null,
    label: 'Confirm your predicted grades with your school',
    detail: 'What your school submits is what universities see — check it matches what you entered here.',
    link: null,
  });
  tasks.push({
    id: 'app:statement', seq: 3, seqLabel: 'Your application', cycleMonth: null,
    label: 'Draft your personal statement',
    // Factual state of the story bank — no quota, no readiness score.
    detail: entryCount
      ? `You have ${entryCount} story ${entryCount === 1 ? 'entry' : 'entries'} to draw on.`
      : 'Your story bank is empty — add a few entries first, they’re the raw material.',
    link: null,
    action: { mode: 'story', label: entryCount ? 'Open your story' : 'Start your story' },
    liveEarly: true,   // story-building is genuinely live in any year
  });
  tasks.push({
    id: 'app:references', seq: 3, seqLabel: 'Your application', cycleMonth: null,
    label: 'Ask for your reference',
    detail: 'Referees need notice. Ask early rather than in the week the form closes.',
    link: null,
  });

  // 4. Deadlines, per country actually on the list. Month-level SHAPES only,
  // each ending in confirm-officially.
  const DEADLINE_SHAPE = {
    UK: 'Medicine, dentistry, veterinary and Oxford/Cambridge courses typically close in mid-October; most other UK courses in late January. Both shift year to year — confirm the exact date on UCAS and each course page.',
    US: 'Many early-application deadlines (early action/decision) typically fall around early November, with regular decision later. Every university sets its own — confirm on each admissions page.',
    CA: 'Deadlines are set per university and per province, and often differ by programme. Confirm on each course page.',
    SG: 'Application windows are set per university and differ for international applicants. Confirm on each admissions page.',
    HK: 'Application windows are set per university, with separate local and international routes. Confirm on each admissions page.',
  };
  const DEADLINE_ORDER = { UK: 0, US: 1 };
  const countries = [...new Set(savedCourses.map(c => c.country))]
    .sort((a, b) => (DEADLINE_ORDER[a] ?? 8) - (DEADLINE_ORDER[b] ?? 8)
      || (COUNTRY_LABELS[a] ?? a).localeCompare(COUNTRY_LABELS[b] ?? b));
  countries.forEach(k => {
    const label = COUNTRY_LABELS[k] ?? k;
    const shape = DEADLINE_SHAPE[k] ?? 'Each university sets its own dates — confirm on every course page on your list.';
    tasks.push({
      id: `deadline:${k}`, seq: 4, seqLabel: 'Deadlines',
      cycleMonth: firstMonthIn(shape),   // read back from the same sentence
      label: `Confirm exact deadlines for your ${label} course${savedCourses.filter(c => c.country === k).length === 1 ? '' : 's'} on official pages`,
      detail: shape,
      link: null,
    });
  });

  // The generic application tasks have no window of their own; they belong
  // with the earliest deadline on the list.
  const earliestDeadline = tasks.filter(t => t.seq === 4 && t.cycleMonth != null)
    .reduce((m, t) => (m == null ? t.cycleMonth : Math.min(m, t.cycleMonth)), null);
  tasks.forEach(t => { if (t.seq === 3 && t.cycleMonth == null) t.cycleMonth = earliestDeadline; });

  tasks.forEach(t => { t.bucket = cycleBucket(t.cycleMonth, nowMonth); });
  return tasks;
}

// Distinct admission tests across the list — the load observation's input.
function shortlistTestLoad(savedCourses) {
  return [...new Set(savedCourses.flatMap(c => Array.isArray(c.admissionTests) ? c.admissionTests : []))];
}

// One factual load observation. States the load; never recommends dropping
// or swapping a course, never quantifies effort saved.
function testLoadNoteHtml(savedCourses) {
  const n = shortlistTestLoad(savedCourses).length;
  if (n < 2) return '';
  const text = n >= 3
    ? `Your list needs ${n} different admission tests — that's a heavy prep load alongside term-time study.`
    : `Your list needs ${n} different admission tests — each has its own format and preparation.`;
  return `<p class="applying-diag__load">${esc(text)}</p>`;
}

// Direct projection of state → the checklist DOM.
function renderApplyingChecklist() {
  const host = $('applyingChecklist');
  if (!host) return;
  const saved = AltioraState.getShortlist()
    .map(id => (typeof courses !== 'undefined') ? courses.find(c => c.id === id) : null)
    .filter(Boolean);
  const yrs = studentYears();
  const preview = yrs != null && yrs >= 1;
  const tasks = applyingTasks(saved);

  // In preview the sequence is what matters; in the application year it's
  // urgency. Actionable-in-preview items are the genuinely live ones.
  const isLive = t => !preview || (t.liveEarly && (t.id.startsWith('test-reg:') ? yrs === 1 : true));
  const actionable = tasks.filter(isLive);
  const doneCount = actionable.filter(t => AltioraState.isApplicationTaskDone(t.id)).length;

  const countEl = $('applyingChecklistCount');
  if (countEl) countEl.textContent = preview
    ? (actionable.length ? `${doneCount}/${actionable.length} you can do now` : '')
    : (tasks.length ? `${doneCount}/${tasks.length} done` : '');

  const groups = [];
  const push = (name, t) => {
    const g = groups.find(x => x.name === name);
    (g ? g : (groups.push({ name, items: [] }), groups[groups.length - 1])).items.push(t);
  };
  if (preview) {
    tasks.slice().sort((a, b) => a.seq - b.seq).forEach(t => push(`${t.seq} · ${t.seqLabel}`, t));
  } else {
    tasks.slice()
      .sort((a, b) => a.bucket - b.bucket || a.seq - b.seq)
      .forEach(t => push(BUCKET_LABELS[t.bucket], t));
  }

  host.innerHTML = groups.map(g => `
    <div class="applying-task-group">
      <span class="applying-task-group__label">${esc(g.name)}</span>
      ${g.items.map(t => {
        const live = isLive(t);
        const done = live && AltioraState.isApplicationTaskDone(t.id);
        const cls = `applying-task${done ? ' applying-task--done' : ''}${live ? '' : ' applying-task--preview'}`;
        const box = live
          ? `<input type="checkbox" class="applying-task__box" data-app-task="${esc(t.id)}"${done ? ' checked' : ''}>`
          : `<span class="applying-task__marker" aria-hidden="true">·</span>`;
        return `
        <${live ? 'label' : 'div'} class="${cls}">
          ${box}
          <span class="applying-task__body">
            <span class="applying-task__label">${esc(t.label)}</span>
            <span class="applying-task__detail">${esc(t.detail)}</span>
            ${t.whatItIs ? `<span class="applying-task__what">${esc(t.whatItIs)}</span>` : ''}
            ${t.needs ? `<span class="applying-task__needs">${esc(t.needs)}</span>` : ''}
            ${t.consequence ? `<span class="applying-task__consequence">${esc(t.consequence)}</span>` : ''}
            ${(t.links || []).length && live ? `<span class="applying-task__links">${
              t.links.map(l => `<a class="applying-task__link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} →</a>`).join('')
            }</span>` : ''}
            ${t.action && live ? `<button type="button" class="applying-task__link applying-task__action" data-go-tool="${esc(t.action.mode)}">${esc(t.action.label)} →</button>` : ''}
          </span>
        </${live ? 'label' : 'div'}>`;
      }).join('')}
    </div>`).join('');
}

// Delegated once — survives every re-render of the panel.
function wireApplyingChecklist() {
  document.addEventListener('change', e => {
    const box = e.target.closest?.('[data-app-task]');
    if (!box) return;
    AltioraState.setApplicationTask(box.dataset.appTask, box.checked);
  });
  document.addEventListener('click', e => {
    const btn = e.target.closest?.('.applying-task__action');
    if (btn) { e.preventDefault(); switchMode(btn.dataset.goTool); }
  });
}

function renderApplyingPanel() {
  const panel = $('panel-applying');
  if (!panel) return;
  const ids = (typeof AltioraState !== 'undefined') ? AltioraState.getShortlist() : [];
  const savedCourses = ids
    .map(id => (typeof courses !== 'undefined') ? courses.find(c => c.id === id) : null)
    .filter(Boolean);

  if (!savedCourses.length) {
    // Subjects-aware landing: a student who just told onboarding their
    // subjects shouldn't be greeted by a cold empty state. The count is the
    // LIVE subjects-fit number (checkStatusFor — the exact Check pipeline,
    // unfiltered), not a parallel calculation.
    const fitCount = subjectsFitCount();
    const emptyHtml = fitCount > 0
      ? `
        <div class="applying-empty">
          <p><strong>Your subjects open ${fitCount} course${fitCount === 1 ? '' : 's'}</strong> — let's build your application list.
          Save the ones you're applying to, and this page becomes your checklist of what's next.</p>
          <button class="home-next__btn home-next__btn--primary" data-go-applying>See the ${fitCount} courses your subjects fit →</button>
        </div>`
      : `
        <div class="applying-empty">
          <p>Your shortlist is empty. Save the courses you're applying to, and this page becomes your checklist of what's next.</p>
          <button class="home-next__btn home-next__btn--primary" data-go-applying>Find courses to apply to →</button>
        </div>`;
    panel.innerHTML = `
      <div class="applying">
        <header class="applying__header">
          <h1 class="applying__title">Applying</h1>
          <p class="applying__sub">Your next actions live here — the checklist builds itself from the courses you save.</p>
        </header>
        ${emptyHtml}
      </div>`;
    panel.querySelector('[data-go-applying]')?.addEventListener('click', () => switchMode('check'));
    return;
  }

  const yrs     = studentYears();
  const preview = yrs != null && yrs >= 1;

  // ── THE DIAGNOSTIC. The most consequential fact about this application,
  // stated first: the shape of the list, in the shared balance wording, plus
  // one factual observation about test load. No course surgery is suggested.
  const bal = shortlistBalance(savedCourses);
  const unis = new Set(savedCourses.map(c => c.university));
  const countryBits = [...new Set(savedCourses.map(c => c.country))].map(k => COUNTRY_LABELS[k] ?? k);
  const diagLine = bal.classified > 0
    ? `Your list: ${bal.countsBits.join(' · ')}`
    : `Your list: ${savedCourses.length} course${savedCourses.length === 1 ? '' : 's'}, unclassified`;
  const usNote = savedCourses.some(c => c.country === 'US')
    ? `<p class="applying-diag__aside">${esc(US_NO_SAFETY_NOTE)}</p>` : '';

  const diagnostic = `
    <section class="applying-diag" aria-label="Your list at a glance">
      <p class="applying-diag__counts">${esc(diagLine)}</p>
      <p class="applying-diag__advice">${esc(bal.advice)}</p>
      ${testLoadNoteHtml(savedCourses)}
      ${usNote}
      <p class="applying-diag__meta"><strong>${savedCourses.length}</strong> course${savedCourses.length === 1 ? '' : 's'} ·
        <strong>${unis.size}</strong> universit${unis.size === 1 ? 'y' : 'ies'} ·
        ${esc(countryBits.join(', '))}
        <button class="home-card__link applying-diag__link" data-go-shortlist>View full shortlist →</button></p>
    </section>`;

  // ── Year-honest lead. An application-year student gets the dashboard; a
  // student who applies later gets an explicit PREVIEW, not a year of
  // premature tasks dressed up as a to-do list.
  const yrLabel = AltioraState.getProfile().yearGroup;
  const lead = preview
    ? `<p class="applying-preview__lead">You apply ${yrs === 1 ? 'next year' : `in ${yrs} years`} — here's what the cycle
        looks like, and the one or two things worth doing now. The rest is a preview: nothing to tick yet.</p>`
    : `<p class="applying-timeline-note">You're in ${esc(yrLabel ?? 'your application year')} — this is your application
        cycle, so these windows apply to you <strong>now</strong>. Registration closes before every test.</p>`;

  panel.innerHTML = `
    <div class="applying">
      <header class="applying__header">
        <h1 class="applying__title">Applying</h1>
        <p class="applying__sub">${preview ? 'A preview of the cycle you\'ll run next.' : 'Your next actions, in the order they happen.'}</p>
      </header>

      ${diagnostic}

      <section class="applying-section">
        <h2 class="applying-section__head">${preview ? 'The cycle, in order' : "What's next"}<span id="applyingChecklistCount" class="applying-section__count"></span></h2>
        ${lead}
        <div id="applyingChecklist" class="applying-tasks${preview ? ' applying-tasks--preview' : ''}"></div>
        <p class="applying-tasks__foot">Windows are typical and shift year to year — always confirm on the official page.</p>
      </section>
    </div>`;

  renderApplyingChecklist();
  panel.querySelector('[data-go-shortlist]')?.addEventListener('click', () => switchMode('shortlist'));
}

/* ═══════════════════════════════════════════════════════════════
 * COUNSELOR SUMMARY — a printable one-page snapshot.
 *
 * Compiles what the student already has into something they can put on
 * a table in front of a parent, teacher or counselor. Every line is
 * READ from existing state through the existing helpers — no new
 * engines, no new data, and the shared wording functions
 * (shortlistBalance, storyCounsel) guarantee it says exactly what the
 * app says on screen.
 *
 * It also mitigates localStorage loss: a printed page (or browser
 * save-as-PDF) is a snapshot that survives a cleared browser.
 *
 * Timing is always the verified TYPICAL WINDOW from admissionTestInfo,
 * never a fixed date — same rule as the Applying checklist.
 * ═══════════════════════════════════════════════════════════════ */

// Subjects + per-subject predicted grades, in the student's own system.
function summarySubjectRows() {
  const p = AltioraState.getProfile();
  const subjects = Array.isArray(p.subjects) ? p.subjects : [];
  if (!subjects.length) return { rows: [], note: 'No subjects entered yet.' };
  const g = p.predictedGrades;
  const gradeFor = s => {
    if (!g) return null;
    if (typeof g === 'object') return g[s] ?? null;
    return (typeof g === 'string') ? g : null;   // IB points / AP letter / legacy average
  };
  const rows = subjects.map(s => ({ subject: s, grade: gradeFor(s) }));
  const anyGrade = rows.some(r => r.grade);
  return { rows, note: anyGrade ? null : 'No predicted grades entered.' };
}

function buildCounselorSummaryHtml() {
  const p       = AltioraState.getProfile();
  const sysLbl  = p.qualificationSystem
    ? (qualificationMappings[p.qualificationSystem]?.systemLabel ?? p.qualificationSystem) : null;
  const stage   = p.stage && STAGES[p.stage] ? STAGES[p.stage].name : null;
  const fields  = activeCandidateFields().map(f => CATEGORY_LABEL_MAP[f]);
  const saved   = AltioraState.getShortlist()
    .map(id => (typeof courses !== 'undefined') ? courses.find(c => c.id === id) : null)
    .filter(Boolean);
  const none = txt => `<p class="cs-none">${esc(txt)}</p>`;

  /* ── Snapshot ── */
  const snapshot = `
    <dl class="cs-dl">
      <div><dt>Qualification</dt><dd>${sysLbl ? esc(sysLbl) : 'Not set'}</dd></div>
      <div><dt>Year group</dt><dd>${p.yearGroup ? esc(p.yearGroup) : 'Not set'}</dd></div>
      <div><dt>Stage</dt><dd>${stage ? esc(stage) : 'Not set'}</dd></div>
      <div><dt>Fields of interest</dt><dd>${fields.length ? esc(fields.join(' · ')) : 'None kept yet'}</dd></div>
    </dl>`;

  /* ── Subjects & predicted grades ── */
  const { rows: subjRows, note: subjNote } = summarySubjectRows();
  const subjectsHtml = subjRows.length
    ? `<ul class="cs-list">${subjRows.map(r =>
        `<li><span class="cs-list__main">${esc(r.subject)}</span> <span class="cs-list__side">${r.grade ? esc(r.grade) : '—'}</span></li>`).join('')}</ul>
       ${subjNote ? none(subjNote) : ''}`
    : none(subjNote);

  /* ── Shortlist by verdict, with each course's requirement ── */
  const gradeKey = SYSTEM_GRADE_KEY[p.qualificationSystem];
  const reqFor = c => {
    const raw = gradeKey ? c.grades?.[gradeKey] : null;
    if (raw != null && raw !== '') return String(raw);
    if (c.country === 'US') return 'holistic — no fixed offer';
    return 'not published';
  };
  let shortlistHtml;
  if (!saved.length) {
    shortlistHtml = none('No courses saved yet.');
  } else {
    const { byId } = shortlistVerdicts(saved);
    const ORDER = [['reach', 'Reach'], ['match', 'Match'], ['safety', 'Safety'], ['unknown', 'Not classified']];
    const groups = ORDER.map(([key, label]) => ({
      label, items: saved.filter(c => byId.get(c.id) === key),
    })).filter(g => g.items.length);
    shortlistHtml = groups.map(g => `
      <div class="cs-group">
        <span class="cs-group__label">${esc(g.label)} (${g.items.length})</span>
        <ul class="cs-list">${g.items.map(c => `
          <li>
            <span class="cs-list__main">${esc(c.name)} — ${esc(c.university)}<span class="cs-list__sub">${esc(COUNTRY_LABELS[c.country] ?? c.country)}</span></span>
            <span class="cs-list__side"> ${esc(reqFor(c))}</span>
          </li>`).join('')}</ul>
      </div>`).join('');
    const bal = shortlistBalance(saved);
    shortlistHtml += `
      <p class="cs-counsel"><strong>${esc(bal.classified > 0 ? `Your list: ${bal.countsBits.join(' · ')}` : `Your list: ${saved.length} course${saved.length === 1 ? '' : 's'}, unclassified`)}</strong>
        ${esc(bal.advice)}</p>`;
    if (saved.some(c => c.country === 'US')) {
      shortlistHtml += `<p class="cs-none">${esc(US_NO_SAFETY_NOTE)}</p>`;
    }
  }

  /* ── Admission tests across the shortlist (typical windows only) ── */
  const testInfoFor = t => (typeof admissionTestInfo !== 'undefined') ? admissionTestInfo[t] : null;
  const tests = [...new Set(saved.flatMap(c => Array.isArray(c.admissionTests) ? c.admissionTests : []))]
    .sort((a, b) => (testInfoFor(a)?.regOpensMonth ?? 98) - (testInfoFor(b)?.regOpensMonth ?? 98) || a.localeCompare(b));
  // Optional marker — the SAME wording the course cards use, via the same
  // testRelationFor. Strict: a test reads optional here only when EVERY
  // saved course carrying it stores the optional relation; one required
  // carrier keeps the plain (required) rendering.
  const testOptionalEverywhere = t => saved
    .filter(c => (Array.isArray(c.admissionTests) ? c.admissionTests : []).includes(t))
    .every(c => testRelationFor(c, t) === 'optional-lower-offer');
  const testsHtml = tests.length
    ? `<ul class="cs-list">${tests.map(t => {
        const i = testInfoFor(t);
        const label = i?.name ?? t;
        const shown = testOptionalEverywhere(t) ? `${label} optional — can lower the offer` : label;
        return `<li>
          <span class="cs-list__main">${esc(shown)}${i?.fullName ? `<span class="cs-list__sub">${esc(i.fullName)}</span>` : ''}</span>
          <span class="cs-list__side"> ${esc(i ? `registration ${i.typicalRegistrationWindow}` : 'check the official site')}</span>
        </li>`;
      }).join('')}</ul>
      <p class="cs-none">Typical windows — they shift year to year, so confirm on each test's official site.</p>`
    : none(saved.length ? 'No admission tests across these courses.' : 'No courses saved, so no tests to list.');

  /* ── Story bank ── */
  const entries = AltioraState.getAchievements();
  const pinned  = activeCandidateFields();
  const yrs     = studentYears();
  let storyHtml;
  if (!entries.length && !pinned.length) {
    storyHtml = none('Nothing in the story bank yet.');
  } else {
    const perField = pinned.map(f => {
      const tagged = entries.filter(a => (a.fields || []).includes(f));
      return `<li>
        <span class="cs-list__main">${esc(CATEGORY_LABEL_MAP[f])}</span>
        <span class="cs-list__side"> ${tagged.length ? `${tagged.length} ${tagged.length === 1 ? 'entry' : 'entries'}` : 'none yet'}</span>
      </li>`;
    }).join('');
    const general = entries.filter(a => !(a.fields || []).length).length;
    // One counsel line per DISTINCT piece of advice. In the application year
    // the thin-story counsel is field-agnostic, so two thin fields would
    // otherwise print the identical sentence twice — merge their labels
    // instead, and name the field so the reader knows what it refers to.
    const byText = new Map();
    pinned.forEach(f => {
      const tagged = entries.filter(a => (a.fields || []).includes(f));
      const { text } = storyCounsel(CATEGORY_LABEL_MAP[f], tagged, yrs);
      byText.set(text, [...(byText.get(text) ?? []), CATEGORY_LABEL_MAP[f]]);
    });
    const counselLines = [...byText.entries()].map(([text, labels]) => {
      // Only prefix when the sentence doesn't already name the field itself.
      const named = labels.some(l => text.includes(l));
      const prefix = named ? '' : `${labels.join(' & ')}: `;
      return `<p class="cs-counsel">${esc(prefix + text)}</p>`;
    }).join('');
    storyHtml = `
      <p class="cs-lead">${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} total${general ? `, ${general} untagged` : ''}.</p>
      ${perField ? `<ul class="cs-list">${perField}</ul>` : ''}
      ${counselLines || (pinned.length ? '' : none('Pin fields in the planner to track a story per field.'))}`;
  }

  // Generation date: a real timestamp on a snapshot artifact is honest and
  // necessary (it tells the reader how current the page is). It is NOT an
  // admissions date — no deadline is ever asserted anywhere in this document.
  const generated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return `
    <div class="cs-doc">
      <header class="cs-doc__header">
        <div>
          <h1 class="cs-doc__title">Counselor summary</h1>
          <p class="cs-doc__sub">A snapshot of this student's university planning, compiled from Altiora.</p>
        </div>
        <button type="button" class="cs-print-btn" data-do-print>Print / Save as PDF</button>
      </header>
      <p class="cs-backup-line">This page is a printed snapshot. To keep your working data,
        <button type="button" class="cs-backup-link" data-backup-export>back it up to a file</button> —
        it saves to your device and restores on any other.</p>

      <section class="cs-section"><h2 class="cs-section__head">Snapshot</h2>${snapshot}</section>
      <section class="cs-section"><h2 class="cs-section__head">Subjects &amp; predicted grades</h2>${subjectsHtml}</section>
      <section class="cs-section"><h2 class="cs-section__head">Course shortlist</h2>${shortlistHtml}</section>
      <section class="cs-section"><h2 class="cs-section__head">Admission tests</h2>${testsHtml}</section>
      <section class="cs-section"><h2 class="cs-section__head">Story bank</h2>${storyHtml}</section>

      <footer class="cs-doc__foot">
        <p>Generated ${esc(generated)} · usealtiora.com</p>
        <p><strong>Always verify all requirements, deadlines and test dates with universities directly.</strong>
          Altiora matches on subjects and published typical offers; it is a planning aid, not an admissions decision.</p>
      </footer>
    </div>`;
}

function renderCounselorSummary() {
  const panel = $('panel-summary');
  if (!panel) return;
  panel.innerHTML = buildCounselorSummaryHtml();
}

/* ═══════════════════════════════════════════════════════════════
 * STORY BANK — not a record, a narrative.
 * A counselor doesn't inventory a student's activities; they mine
 * them for story: what you did, what it taught you, why it mattered.
 * Each entry pairs the basic facts with those three reflections and
 * can be tagged to the student's pinned candidate fields, so a student
 * can see "my Engineering story" and get calm, year-aware counsel on
 * where it's thin. Deliberately NO scoring, points, or "boost"
 * language, and NO implication that a university matches or requires
 * activities — universities publish no verifiable weightings. It's
 * about having a story to tell, which is honestly true.
 *
 * Reactivity: renderAchievementsList() (the story view) and
 * renderStoryHomeCard() are direct projections of
 * AltioraState.getAchievements() + getCandidateFields(), run on EVERY
 * state change via subscriptions registered in init — no surface
 * reads once and goes stale.
 * ═══════════════════════════════════════════════════════════════ */

function achievementTypeLabel(id) {
  const t = (AltioraState.ACHIEVEMENT_TYPES || []).find(t => t.id === id);
  return t ? t.label : id;
}

// Concrete micro-examples for the three story steps, per entry type — a
// blank "what did it teach you?" box causes form paralysis; a relatable
// example under each input kills it. s = situation, d = what you did,
// t = what it showed.
const STORY_STEP_EXAMPLES = {
  award:        { s: 'Entered the UK Physics Challenge after my teacher suggested it',
                  d: 'Worked through past papers every Friday lunchtime for a term',
                  t: 'I enjoy problems that look impossible at first' },
  certificate:  { s: 'Wanted a structured goal for piano after Grade 5 started feeling easy',
                  d: 'Practised 40 minutes a day and picked pieces outside my comfort zone',
                  t: 'I can stick with slow, unglamorous progress' },
  competition:  { s: "Our robotics team's sensor kept misreading distance in bright light",
                  d: 'Rewrote the calibration code and tested it in different rooms over two weekends',
                  t: "I like debugging more than building from scratch — and I don't stop until I find the cause" },
  // Self-directed work rotates between an EPQ voice and an Extended Essay
  // voice — the shape of an entry, never a result. No named universities,
  // no invented statistics, no outcome claims.
  project:      [
                  { s: 'Chose battery recycling for my EPQ after a chemistry lesson left me with more questions than answers',
                    d: 'Read past the syllabus, interviewed a local repair shop, and rewrote my question twice when the evidence pointed elsewhere',
                    t: 'I can run a long project on my own steam — and changing your question is progress, not failure' },
                  { s: 'Wrote my Extended Essay on how translation changes a poem, starting from one line that bothered me',
                    d: 'Compared three translations stanza by stanza and kept a log of every draft of my argument',
                    t: 'I argue better on paper after letting an idea sit for a week' },
                ],
  leadership:   { s: 'Our student council had ideas but meetings kept going in circles',
                  d: 'Started writing a one-page agenda and chasing actions between meetings',
                  t: "I'd rather organise quietly than talk loudly — and it works" },
  volunteering: { s: 'The care home near school needed weekend visitors',
                  d: 'Visited every Saturday and ran a music afternoon once a month',
                  t: 'Showing up consistently counts for more than grand gestures' },
  work:         { s: 'A local startup needed help cleaning up their customer data',
                  d: 'Built a small spreadsheet tool that cut a weekly job from hours to minutes',
                  t: 'I like finding the boring bottleneck nobody else wants to touch' },
  activity:     { s: 'Signed up for DofE Silver with two friends',
                  d: "Planned the expedition route and carried the group's navigation",
                  t: 'I stay calm when plans fall apart in the rain' },
  other:        { s: 'Taught myself video editing for a family project',
                  d: 'Cut a 20-minute film from six hours of footage over a holiday',
                  t: "I lose track of time when I'm making something" },
};

// Per-type hint under the Type select — discoverability only. Exists for
// students who already have such a piece of work; nothing here suggests
// anyone should do one.
const ACHIEVEMENT_TYPE_HINTS = {
  project: 'EPQ, Extended Essay, or any self-directed project or piece of research.',
};

// The three scaffold questions. Self-directed work has no external brief or
// pace-setter, so 'project' asks in those terms; every other type keeps the
// original questions.
const STORY_STEP_QUESTIONS = {
  default: {
    s: 'What challenge, project, or question did you take on?',
    d: 'What did you personally do about it?',
    t: 'What did it teach you, or show about you?',
  },
  project: {
    s: 'What question or problem did you choose — and why that one?',
    d: "How did you go about it? Research, building, writing, changing course when something didn't work?",
    t: "What did it teach you — about the subject, or about how you work when nobody's setting the pace?",
  },
};

// Reflect the selected TYPE's examples under the three step inputs, so a
// DofE student, a club captain, and a coder each see a relatable line.
// A type may carry an ARRAY of example sets — those rotate deterministically
// with the size of the story bank (same rotation rule as the invitations).
function updateStoryStepExamples() {
  const type = $('achvType')?.value;
  const raw = STORY_STEP_EXAMPLES[type] ?? STORY_STEP_EXAMPLES.other;
  const n = (typeof AltioraState !== 'undefined') ? AltioraState.getAchievements().length : 0;
  const ex = Array.isArray(raw) ? raw[n % raw.length] : raw;
  document.querySelectorAll('[data-step-eg]').forEach(el => {
    el.textContent = `e.g. “${ex[el.dataset.stepEg]}”`;
  });
  const qs = STORY_STEP_QUESTIONS[type] ?? STORY_STEP_QUESTIONS.default;
  document.querySelectorAll('[data-step-q]').forEach(el => {
    el.textContent = qs[el.dataset.stepQ];
  });
  const hint = $('achvTypeHint');
  if (hint) {
    const text = ACHIEVEMENT_TYPE_HINTS[type] ?? '';
    hint.textContent = text;
    hint.classList.toggle('hidden', !text);
  }
}

// The 150-character description target — a US-application convenience shown
// only when the shortlist holds a US course. A TARGET, never a limit: no
// truncation, no blocking, no error state; the count reads the same at 20,
// 150 and 300 characters.
function syncDescCharTarget() {
  const ta = $('achvDesc'), count = $('achvDescCount'), note = $('achvDescCountNote');
  if (!ta || !count || !note) return;
  const show = shortlistIncludesUS();
  count.classList.toggle('hidden', !show);
  note.classList.toggle('hidden', !show);
  if (show) count.textContent = `${ta.value.length} / 150`;
}

// The pinned candidate fields that resolve to a known category — the single
// source of truth for the story tag picker and the per-field story views.
function activeCandidateFields() {
  if (typeof AltioraState === 'undefined') return [];
  return AltioraState.getCandidateFields().filter(id => CATEGORY_LABEL_MAP[id]);
}

// An entry counts toward a "story" only once it carries a reflection — the
// facts alone are a record; the reflection is what a personal statement uses.
function entryHasReflection(a) {
  return !!(a && (a.whatIDid || a.whatItTaught || a.whyItMattered));
}

function achievementsSectionHtml() {
  const typeOptions = (AltioraState.ACHIEVEMENT_TYPES || [])
    .map(t => `<option value="${esc(t.id)}">${esc(t.label)}</option>`).join('');
  return `
    <section class="applying-section story" aria-label="Your story bank">
      <div id="achvSummary" class="story__summary"></div>
      <div id="achvList" class="achv__list"></div>
      <p id="achvInvite" class="story__invite"></p>
      <button type="button" id="achvAddBtn" class="fo-btn fo-btn--primary achv__addbtn">+ Add to your story</button>
      <form id="achvForm" class="achv__form hidden" novalidate>
        <div class="achv__form-row">
          <label class="achv__label" for="achvType"><span>Type<span class="achv__req">*</span></span>
            <div class="select-wrap"><select id="achvType" class="achv__select">${typeOptions}</select></div>
            <span id="achvTypeHint" class="achv__type-hint hidden"></span>
            <span class="achv__widen-note">Paid work, looking after family, and things you taught yourself all count. Most people leave these out.</span>
          </label>
          <label class="achv__label achv__label--grow" for="achvTitle"><span>Title<span class="achv__req">*</span></span>
            <input id="achvTitle" class="achv__input" type="text" maxlength="120"
              placeholder="e.g. Duke of Edinburgh Gold, Grade 8 Piano, Head Prefect">
          </label>
        </div>
        <div class="achv__form-row">
          <label class="achv__label" for="achvOrg">Organisation
            <input id="achvOrg" class="achv__input" type="text" maxlength="80" placeholder="e.g. ABRSM, your school">
          </label>
          <label class="achv__label" for="achvLevel">Level / result
            <input id="achvLevel" class="achv__input" type="text" maxlength="60" placeholder="e.g. Gold, Grade 8, 200 hours">
          </label>
          <label class="achv__label" for="achvDate">When
            <input id="achvDate" class="achv__input" type="text" maxlength="30" placeholder="e.g. 2025 or June 2025">
          </label>
        </div>
        <label class="achv__label achv__label--prompt" for="achvDesc">Short description <span class="achv__opt">(optional)</span>
          <textarea id="achvDesc" class="achv__input achv__textarea" rows="2" maxlength="500"
            placeholder="A sentence or two, if it helps"></textarea>
          <span id="achvDescCount" class="achv__desc-count hidden" aria-live="polite"></span>
          <span id="achvDescCountNote" class="achv__desc-count-note hidden">US applications cap this at 150 characters. Worth practising the short version.</span>
        </label>
        <div class="story__prompts">
          <p class="story__prompts-lead">Three tiny steps — one line each is plenty, and every step is optional.</p>
          <label class="achv__label achv__label--prompt" for="achvSituation">
            <span class="story-step__head"><span class="story-step__num">1 · The situation</span><span data-step-q="s">What challenge, project, or question did you take on?</span></span>
            <input id="achvSituation" class="achv__input" type="text" maxlength="400" placeholder="One line is plenty">
            <span class="story-step__eg" data-step-eg="s"></span>
          </label>
          <label class="achv__label achv__label--prompt" for="achvWhatIDid">
            <span class="story-step__head"><span class="story-step__num">2 · What you did</span><span data-step-q="d">What did you personally do about it?</span></span>
            <input id="achvWhatIDid" class="achv__input" type="text" maxlength="400" placeholder="One line is plenty">
            <span class="story-step__eg" data-step-eg="d"></span>
          </label>
          <label class="achv__label achv__label--prompt" for="achvWhatItTaught">
            <span class="story-step__head"><span class="story-step__num">3 · What it showed</span><span data-step-q="t">What did it teach you, or show about you?</span></span>
            <input id="achvWhatItTaught" class="achv__input" type="text" maxlength="400" placeholder="One line is plenty">
            <span class="story-step__eg" data-step-eg="t"></span>
          </label>
        </div>
        <div id="achvFields" class="story__tagpicker"></div>
        <p id="achvFormError" class="achv__error hidden">Please pick a type and give it a title.</p>
        <div class="achv__form-actions">
          <button type="submit" class="fo-btn fo-btn--primary" id="achvSaveBtn">Save to your story</button>
          <button type="button" class="fo-btn" id="achvCancelBtn">Cancel</button>
        </div>
      </form>
      <p class="achv__note">No scoring here, and no university requires any of this — it's about having a story
        you can tell.</p>
    </section>`;
}

// Compose the three steps (plus any legacy "why it mattered" text) into ONE
// readable synthesis block — the personal-statement raw material, not a
// labelled form dump. Sentences flow: situation → what you did → what it
// showed.
function storySynthesis(a) {
  const dot = t => (/[.!?…”"]$/.test(t.trim()) ? t.trim() : t.trim() + '.');
  return [a.situation, a.whatIDid, a.whatItTaught, a.whyItMattered]
    .filter(v => v && v.trim())
    .map(dot)
    .join(' ');
}

// One entry: a collapsible card. Open by default so the synthesis is
// visible at a glance; the summary row collapses it to just the title.
// opts.readOnly renders the SAME card as a reference — no Edit/Delete,
// collapsed by default (the statement rail cites entries, it doesn't
// manage them). One renderer, two placements; never forked.
// The three scaffold answers as labelled lines — the form's own step names
// in the mono functional layer. Only filled parts render; never an empty
// label. Legacy "why it mattered" text joins the WHAT IT SHOWED line.
function storyScaffoldHtml(a) {
  const showed = [a.whatItTaught, a.whyItMattered].filter(v => v && v.trim()).join(' ');
  const lines = [
    ['The situation',  a.situation],
    ['What you did',   a.whatIDid],
    ['What it showed', showed],
  ].filter(([, v]) => v && v.trim());
  if (!lines.length) return '';
  return `<dl class="story-card__scaffold">${lines.map(([l, v]) =>
    `<div class="story-card__line"><dt class="story-card__linelabel">${esc(l)}</dt><dd class="story-card__linetext">${esc(v.trim())}</dd></div>`).join('')}</dl>`;
}

function storyCardHtml(a, opts = {}) {
  const meta = [a.organisation, a.level, a.date].filter(Boolean).map(esc).join(' · ');
  const typeLabel = achievementTypeLabel(a.type);
  const scaffold = storyScaffoldHtml(a);
  const readOnly = !!opts.readOnly;
  // Read-only rail cards get an explicit mono More/Less affordance instead
  // of the bare caret; the text swap is CSS-driven off the [open] state.
  const affordance = readOnly
    ? `<span class="story-card__more" aria-hidden="true"></span>`
    : `<span class="story-card__caret" aria-hidden="true">▾</span>`;
  return `
    <details class="achv-card story-card" data-achv-id="${esc(a.id)}"${readOnly ? '' : ' open'}>
      <summary class="story-card__summary">
        <span class="achv-card__title">${esc(a.title)}</span>
        <span class="achv-card__meta">${esc(typeLabel)}${meta ? ` · ${meta}` : ''}</span>
        ${affordance}
      </summary>
      <div class="story-card__body">
        ${scaffold}
        ${a.description ? `<p class="achv-card__desc">${esc(a.description)}</p>` : ''}
        ${readOnly ? '' : `
        <div class="achv-card__actions">
          <button type="button" class="achv-card__btn" data-achv-edit="${esc(a.id)}">Edit</button>
          <button type="button" class="achv-card__btn achv-card__btn--del" data-achv-del="${esc(a.id)}">Delete</button>
        </div>`}
      </div>
    </details>`;
}

// One calm, honest counsel line per pinned field, driven ONLY by the
// student's own data: how many reflective entries the field has × how far
// they are from applying. No fabricated university claims, no scoring.
function storyCounselHtml(label, entries, yrs, opts = {}) {
  const { text, tone } = storyCounsel(label, entries, yrs, opts);
  return `<p class="story-counsel story-counsel--${tone}">${esc(text)}</p>`;
}

// What a thin story is worth doing about, given how far off applying is.
// One wording, shared by the pinned-field counsel and the shortlist-driven
// gap counsel, so the two can never drift. States what is worth doing —
// never a quota, a score, or a claim about what universities want.
function storyGapTail(yrs) {
  if (yrs == null) return 'a project, a competition, or documented work all count as real evidence.';
  if (yrs >= 2)   return 'there’s time to build something, and documented tinkering counts as real evidence.';
  if (yrs === 1)  return 'there’s still time for one project you actually finish, which is worth more than a list.';
  return 'focus on telling the strongest version of what you already have.';
}

// The counsel WORDING alone — shared by the story view and the printable
// Counselor Summary so the two can never drift apart.
//
// opts.savedCount: how many shortlisted courses sit in this field. When the
// student has saved courses here, the gap is anchored in their OWN shortlist
// rather than in a pinned field — which is what makes the counsel reach a
// student who saved four Computer Science courses and pinned nothing.
function storyCounsel(label, entries, yrs, opts = {}) {
  const reflective = entries.filter(entryHasReflection).length;
  const strong = reflective >= 3;
  const saved  = opts.savedCount ?? 0;
  let text, tone;
  if (strong) {
    text = `A solid ${label} story — the reflections here are personal-statement raw material.`;
    tone = 'strong';
  } else if (saved > 0) {
    tone = 'thin';
    const courses = `${saved} ${label} ${saved === 1 ? 'course' : 'courses'}`;
    const lead = entries.length === 0
      ? `You've saved ${courses} and have nothing in your story for it yet`
      : `You've saved ${courses} and your story for it is still light`;
    text = `${lead} — ${storyGapTail(yrs)}`;
  } else {
    tone = 'thin';
    const none = entries.length === 0;
    if (yrs == null) {
      text = `Building a ${label} story takes time — a project, a competition, or documented work all count as real evidence.`;
    } else if (yrs >= 2) {
      text = none
        ? `Nothing in your ${label} story yet — you have time. A project, a competition, or even documented tinkering builds real evidence.`
        : `Your ${label} story is still light — you have time. A project, a competition, or even documented tinkering builds real evidence.`;
    } else if (yrs === 1) {
      text = `Your ${label} story is thin — one focused project or role is worth more than many small additions.`;
    } else { // yrs === 0 — the application year
      text = `Focus on telling the strongest version of what you already have; your reflections above are the raw material.`;
    }
  }
  return { text, tone };
}

// Fields the student's SAVED COURSES point at: category id → how many saved
// courses sit in it. A second signal alongside pinned fields — a shortlist is
// an expression of interest whether or not a field was ever pinned.
function shortlistFieldCounts() {
  if (typeof AltioraState === 'undefined' || typeof courses === 'undefined') return new Map();
  const counts = new Map();
  AltioraState.getShortlist()
    .map(id => courses.find(c => c.id === id))
    .filter(c => c && CATEGORY_LABEL_MAP[c.category])
    .forEach(c => counts.set(c.category, (counts.get(c.category) ?? 0) + 1));
  return counts;
}

// One field's story: header + count + (for active fields) year-aware counsel,
// then the tagged entries.
function storyGroupHtml(bucket, showCounsel) {
  const yrs = studentYears();
  const counsel = showCounsel
    ? storyCounselHtml(bucket.label, bucket.entries, yrs, { savedCount: bucket.savedCount ?? 0 })
    : '';
  const cards   = bucket.entries.map(storyCardHtml).join('');
  const n = bucket.entries.length;
  const countLabel = n ? `${n} ${n === 1 ? 'piece' : 'pieces'}` : 'none yet';
  const inactiveTag = bucket.inactive
    ? `<span class="story-group__inactive">field no longer pinned</span>` : '';
  // Says where a field came from when it isn't one the student pinned.
  const sourceTag = bucket.fromShortlist
    ? `<span class="story-group__src">from your shortlist</span>` : '';
  return `
    <section class="story-group${bucket.inactive ? ' story-group--inactive' : ''}">
      <div class="story-group__head">
        <span class="story-group__label">${esc(bucket.label)}</span>
        <span class="story-group__count">${esc(countLabel)}</span>
        ${inactiveTag}${sourceTag}
      </div>
      ${counsel}
      ${cards}
    </section>`;
}

// The one-line per-field summary: "Engineering: 4 pieces of your story ·
// Economics: none yet". Covers every field on the page — pinned or drawn from
// the shortlist — so it never omits a group shown below it.
function storySummaryHtml(items, pinned) {
  if (!pinned.length) {
    return items.length
      ? `<p class="story__summary-line">${items.length} ${items.length === 1 ? 'entry' : 'entries'} in your story · pin fields in the planner to organise them by field.</p>`
      : '';
  }
  const parts = pinned.map(f => {
    const n = items.filter(a => (a.fields || []).includes(f)).length;
    return `${CATEGORY_LABEL_MAP[f]}: ${n ? `${n} ${n === 1 ? 'piece' : 'pieces'} of your story` : 'none yet'}`;
  });
  return `<p class="story__summary-line">${esc(parts.join(' · '))}</p>`;
}

// An invitation, never a requirement — one line offering a kind of story the
// student may not have thought to record. Deliberately phrased as "that
// counts", not "you need this": nothing here is asked for by any university.
const STORY_INVITATIONS = {
  cs:           ['Built something that broke and you fixed it? That’s a story.',
                 'Taught yourself something no class covered? That counts.'],
  engineering:  ['Built something that broke and you fixed it? That’s a story.',
                 'Taken something apart to see how it worked? That counts.'],
  mathematics:  ['Chased a problem past the point it was set? That’s a story.',
                 'Found a proof or a pattern that surprised you? That counts.'],
  sciences:     ['Run an experiment that didn’t work? That’s a story.',
                 'Read past the syllabus on something that caught you? That counts.'],
  medicine:     ['Spent time somewhere people were being cared for? That’s a story.',
                 'Changed your mind about what the work actually involves? That counts.'],
  law:          ['Read something that changed your mind? That counts.',
                 'Argued a side you didn’t agree with? That’s a story.'],
  psychology:   ['Read something that changed your mind? That counts.',
                 'Noticed something about how people behave and dug into it? That’s a story.'],
  economics:    ['Followed a story in the news until you understood it? That counts.',
                 'Made a case with numbers behind it? That’s a story.'],
  business:     ['Sold, organised, or ran something for real? That’s a story.',
                 'Persuaded people to back an idea of yours? That counts.'],
  architecture: ['Drawn, modelled, or built a space of your own? That’s a story.',
                 'Looked hard at a building and worked out why it works? That counts.'],
};

// One invitation for one field, rotating as the story grows so the same line
// doesn't sit there forever. Deterministic: same state → same line.
function storyInvitation(fieldIds, entryCount) {
  const withLines = fieldIds.filter(f => STORY_INVITATIONS[f]);
  if (!withLines.length) return '';
  const field = withLines[entryCount % withLines.length];
  const lines = STORY_INVITATIONS[field];
  return lines[Math.floor(entryCount / withLines.length) % lines.length];
}

// Direct projection of state → DOM: the story bank, grouped by field. Cheap
// no-op when the section isn't on screen; safe on every state change.
function renderAchievementsList() {
  const list = $('achvList');
  if (!list) return;

  const items  = AltioraState.getAchievements();
  const pinned = activeCandidateFields();
  // The shortlist is the second field signal: saving four Computer Science
  // courses says as much about direction as pinning the field does.
  const savedCounts = shortlistFieldCounts();
  const shortlistOnly = [...savedCounts.keys()]
    .filter(f => !pinned.includes(f))
    .sort((a, b) => savedCounts.get(b) - savedCounts.get(a)
      || CATEGORY_LABEL_MAP[a].localeCompare(CATEGORY_LABEL_MAP[b]));
  const fields = [...pinned, ...shortlistOnly];

  const count = $('achvCount');
  if (count) count.textContent = items.length ? ` (${items.length})` : '';
  const summaryEl = $('achvSummary');
  if (summaryEl) summaryEl.innerHTML = storySummaryHtml(items, fields);

  const invite = $('achvInvite');
  if (invite) {
    const line = storyInvitation(fields, items.length);
    invite.textContent = line;
    invite.classList.toggle('hidden', !line);
  }

  // Empty and nothing to organise by: open with a question, not a description.
  // The scaffolded form does the guiding once they act on it.
  if (!items.length && !fields.length) {
    list.innerHTML = `
      <div class="achv__empty">
        <p class="achv__empty-q">What have you done outside class in the last year that you'd actually
        bother telling someone about?</p>
      </div>`;
    return;
  }

  // Field buckets in priority order: pinned fields first (with counsel, even
  // when empty — that's the whole point for early years), then fields the
  // shortlist points at, then any field that is tagged but no longer pinned
  // (shown greyed, tag preserved), then the untagged "General" bucket last.
  // A field that is BOTH pinned and shortlisted appears once, with its saved
  // count folded into that single counsel line.
  const buckets = fields.map(f => ({
    key: f, label: CATEGORY_LABEL_MAP[f], inactive: false,
    fromShortlist: !pinned.includes(f),
    savedCount: savedCounts.get(f) ?? 0,
    entries: items.filter(a => (a.fields || []).includes(f)),
  }));

  const taggedIds = new Set(items.flatMap(a => a.fields || []));
  [...taggedIds]
    .filter(f => !fields.includes(f) && CATEGORY_LABEL_MAP[f])
    .sort((a, b) => CATEGORY_LABEL_MAP[a].localeCompare(CATEGORY_LABEL_MAP[b]))
    .forEach(f => buckets.push({
      key: f, label: CATEGORY_LABEL_MAP[f], inactive: true, savedCount: 0,
      entries: items.filter(a => (a.fields || []).includes(f)),
    }));

  const general = items.filter(a => !(a.fields || []).length);

  const groupsHtml =
    buckets.map(b => storyGroupHtml(b, !b.inactive)).join('') +
    (general.length
      ? storyGroupHtml({ key: '__general', label: 'General', inactive: false, entries: general }, false)
      : '');

  list.innerHTML = groupsHtml;
}

// Build the field tag picker for the form. Options = the pinned fields, plus
// any field already on the entry that is no longer pinned (marked inactive)
// so an edit can see and keep it. Selecting none = a General entry.
function renderAchievementFieldPicker(selected) {
  const wrap = $('achvFields');
  if (!wrap) return;
  const sel = Array.isArray(selected) ? selected : [];
  const pinned = activeCandidateFields();
  const extra = sel.filter(f => !pinned.includes(f) && CATEGORY_LABEL_MAP[f]);
  const opts = [...pinned, ...extra];
  if (!opts.length) {
    wrap.innerHTML = `<span class="story__tag-hint">No fields pinned yet — this saves as a general story entry.
      Pin a field in the planner to start tagging your story.</span>`;
    return;
  }
  const chips = opts.map(f => {
    const on = sel.includes(f);
    const inactive = !pinned.includes(f);
    return `<button type="button" class="story-tag${on ? ' story-tag--on' : ''}${inactive ? ' story-tag--inactive' : ''}"
        data-achv-field="${esc(f)}" aria-pressed="${on}">${esc(CATEGORY_LABEL_MAP[f])}${inactive ? ' · inactive' : ''}</button>`;
  }).join('');
  wrap.innerHTML = `
    <span class="story__tag-label">Part of which story?</span>
    <div class="story__tags">${chips}</div>
    <span class="story__tag-hint">Optional — tap any that apply, or leave all off for a general entry.</span>`;
}

function openAchievementForm(entry) {
  const form = $('achvForm');
  if (!form) return;
  form.classList.remove('hidden');
  $('achvFormError')?.classList.add('hidden');
  form.dataset.editing = entry?.id || '';
  $('achvType').value  = entry?.type || (AltioraState.ACHIEVEMENT_TYPES[0]?.id ?? 'award');
  $('achvTitle').value = entry?.title || '';
  $('achvOrg').value   = entry?.organisation || '';
  $('achvLevel').value = entry?.level || '';
  $('achvDate').value  = entry?.date || '';
  $('achvDesc').value  = entry?.description || '';
  $('achvSituation').value    = entry?.situation || '';
  $('achvWhatIDid').value     = entry?.whatIDid || '';
  $('achvWhatItTaught').value = entry?.whatItTaught || '';
  updateStoryStepExamples();
  renderAchievementFieldPicker(entry?.fields || []);
  $('achvSaveBtn').textContent = entry ? 'Save changes' : 'Save to your story';
  $('achvAddBtn')?.classList.add('hidden');
  form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  syncDescCharTarget();
  $('achvTitle').focus();
}

function closeAchievementForm() {
  const form = $('achvForm');
  if (!form) return;
  form.classList.add('hidden');
  form.dataset.editing = '';
  $('achvAddBtn')?.classList.remove('hidden');
}

function submitAchievementForm() {
  const form = $('achvForm');
  if (!form) return;
  const fields = {
    type:          $('achvType').value,
    title:         $('achvTitle').value,
    organisation:  $('achvOrg').value,
    level:         $('achvLevel').value,
    date:          $('achvDate').value,
    description:   $('achvDesc').value,
    situation:     $('achvSituation').value,
    whatIDid:      $('achvWhatIDid').value,
    whatItTaught:  $('achvWhatItTaught').value,
    // whyItMattered is deliberately NOT sent: legacy text on an entry
    // survives an edit untouched (partial merge), and new entries default
    // it to '' in state.js — nothing destroyed, no fourth box to fill.
    fields: [...document.querySelectorAll('#achvFields .story-tag--on')].map(b => b.dataset.achvField),
  };
  const editingId = form.dataset.editing;
  const ok = editingId
    ? AltioraState.updateAchievement(editingId, fields)
    : AltioraState.addAchievement(fields) !== null;
  if (!ok) {
    $('achvFormError')?.classList.remove('hidden');
    $('achvTitle').focus();
    return;
  }
  closeAchievementForm();   // list re-renders via the state subscription
}

// Two-step delete: first click arms the button ("Sure?"), second click
// within 3s deletes. No blocking confirm dialog, no accidental loss.
let _achvDeleteArmTimer = null;
function handleAchievementDelete(btn) {
  if (btn.dataset.armed === '1') {
    clearTimeout(_achvDeleteArmTimer);
    AltioraState.removeAchievement(btn.dataset.achvDel);
    return;
  }
  document.querySelectorAll('[data-achv-del][data-armed]').forEach(b => {
    delete b.dataset.armed; b.textContent = 'Delete';
  });
  btn.dataset.armed = '1';
  btn.textContent = 'Sure?';
  clearTimeout(_achvDeleteArmTimer);
  _achvDeleteArmTimer = setTimeout(() => {
    if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = 'Delete'; }
  }, 3000);
}

// Delegated wiring — survives every innerHTML re-render of the panel.
function wireAchievementsEvents() {
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t.closest) return;
    // "Open your story" from anywhere (Applying card, home card, quick access).
    if (t.closest('[data-open-story]')) { switchMode('story'); return; }
    // Printable Counselor Summary: open it, then print from within it.
    if (t.closest('[data-open-summary]')) { switchMode('summary'); return; }
    if (t.closest('[data-do-print]'))     { window.print(); return; }
    if (t.closest('#achvAddBtn'))    { openAchievementForm(null); return; }
    if (t.closest('#achvCancelBtn')) { closeAchievementForm(); return; }
    // Field tag chips in the form toggle in place (no form submit).
    const chip = t.closest('[data-achv-field]');
    if (chip) {
      const on = chip.getAttribute('aria-pressed') !== 'true';
      chip.classList.toggle('story-tag--on', on);
      chip.setAttribute('aria-pressed', String(on));
      return;
    }
    const editBtn = t.closest('[data-achv-edit]');
    if (editBtn) {
      const entry = AltioraState.getAchievements().find(a => a.id === editBtn.dataset.achvEdit);
      if (entry) openAchievementForm(entry);
      return;
    }
    const delBtn = t.closest('[data-achv-del]');
    if (delBtn) handleAchievementDelete(delBtn);
  });
  document.addEventListener('submit', (e) => {
    if (e.target?.id === 'achvForm') {
      e.preventDefault();
      submitAchievementForm();
    }
  });
  // Live 150-character target on the description — document-delegated like
  // the rest of the form, so it survives any re-render.
  document.addEventListener('input', (e) => {
    if (e.target?.id === 'achvDesc') syncDescCharTarget();
  });
  // The step examples follow the chosen entry type (rotating relatable
  // placeholders); delegated so form re-renders can't orphan it.
  document.addEventListener('change', (e) => {
    if (e.target?.id === 'achvType') updateStoryStepExamples();
  });
}

/* ─── Story bank surfacing: dedicated panel + workspace-home card ─── */

// The cross-stage Story Bank panel — the single host of the story form/list
// (reachable from the Applying view and the workspace home).
function renderStoryPanel() {
  const panel = $('panel-story');
  if (!panel) return;
  panel.innerHTML = `
    <div class="story-view">
      <header class="story-view__header">
        <h1 class="story-view__title">Your story<span id="achvCount" class="achv__count"></span></h1>
        <p class="story-view__sub">The things you've done, and what they taught you.</p>
      </header>
      ${achievementsSectionHtml()}
      ${statementSectionHtml()}
    </div>`;
  renderAchievementsList();
  renderStatementRefs();
  syncStatementCounters();
  syncStatementChrome();
}

/* ═══════════════════════════════════════════════════════════════
 * UCAS STATEMENT DRAFTING — assemble from your own material.
 * Three editors, one per official UCAS question, official wording
 * verbatim. The student's story-bank entries sit beside each question
 * as read-only references. Drafting here is scaffolding: the finished
 * statement is submitted on UCAS, not here.
 *
 * HARD RULE: prompting is QUESTIONS ONLY. No example sentences, no
 * sentence starters, no model paragraphs, no claims about what strong
 * statements do or what admissions tutors want.
 * ═══════════════════════════════════════════════════════════════ */

// Format transcribed by the maintainer from the official UCAS guidance,
// read directly on 2026-08-15 (ucas.com is unfetchable from this build
// environment, so this constant is the recorded source of truth).
// UCAS also states: the three answers are reviewed as ONE statement,
// there is no "wrong" place for a piece of evidence, and answers should
// not repeat each other — reflected in the prompting questions below.
const UCAS_STATEMENT = {
  source: 'https://www.ucas.com/applying/applying-to-university/writing-your-personal-statement/how-to-write-your-personal-statement-for-2026-entry-onwards',
  checkedDate: '2026-08-15',
  totalLimit: 4000,    // characters ACROSS all three answers, incl. spaces + line breaks
  perAnswerMin: 350,   // character minimum PER answer
  // Official question wording, verbatim. Question text does NOT count
  // toward the limit.
  questions: [
    { id: 'q1', text: 'Why do you want to study this course or subject?' },
    { id: 'q2', text: 'How have your qualifications and studies helped you to prepare for this course or subject?' },
    { id: 'q3', text: 'What else have you done to prepare outside of education, and why are these experiences useful?' },
  ],
};

// Altiora's own prompting — questions only, pointing the student back at
// their material, never at a formula.
const STATEMENT_PROMPTS = {
  q1: 'Which of your entries shows why this subject, and not a neighbouring one?',
  q2: 'Where did your studies go beyond what was asked of you — and what pulled you there?',
  q3: 'What did you do that nobody required — and what does it show? UCAS reads all three answers as one statement: does each experience appear only once?',
};

// Which story entries sit beside which question, by entry TYPE (Q2/Q3)
// or by the student's pinned fields (Q1). References, not rules — the
// full story bank is always right above.
const STATEMENT_Q2_TYPES = new Set(['certificate', 'award', 'competition', 'project', 'selftaught']);
const STATEMENT_Q3_TYPES = new Set(['leadership', 'volunteering', 'work', 'activity', 'caring', 'sport', 'arts', 'club', 'other']);

function statementRefsFor(qid) {
  const items = AltioraState.getAchievements();
  if (qid === 'q1') {
    const pinned = activeCandidateFields();
    return items.filter(a => (a.fields || []).some(f => pinned.includes(f)));
  }
  if (qid === 'q2') return items.filter(a => STATEMENT_Q2_TYPES.has(a.type));
  return items.filter(a => STATEMENT_Q3_TYPES.has(a.type));
}

// Visibility: the drafting surface is a UCAS artefact, so it exists only
// for UK A-Level students, and only near application (yearsUntilApplication
// <= 1). Earlier UK years get one plain line; other systems get nothing.
// True when the shortlist is non-empty and holds not a single UK course —
// the one case that hides the statement surface. The UCAS statement is a
// DESTINATION artefact: it follows where the student is applying, not which
// qualification they hold. An empty shortlist keeps the surface visible
// (deliberate: it must not flicker in and out as courses are saved and
// removed); country comes from course.country, the same field every other
// country filter reads.
function shortlistExcludesUK() {
  if (typeof courses === 'undefined') return false;
  const saved = AltioraState.getShortlist()
    .map(id => courses.find(c => c.id === id))
    .filter(Boolean);
  return saved.length > 0 && !saved.some(c => c.country === 'UK');
}

// US twin of shortlistExcludesUK, same style, same course.country field:
// true when at least one saved course is a US course. Drives US-destination
// conveniences (the 150-character description target) the way its sibling
// drives the UCAS statement gate.
function shortlistIncludesUS() {
  if (typeof courses === 'undefined') return false;
  return AltioraState.getShortlist()
    .map(id => courses.find(c => c.id === id))
    .filter(Boolean)
    .some(c => c.country === 'US');
}

function statementDraftingState() {
  if (shortlistExcludesUK()) return 'hidden';
  const yrs = studentYears();
  return (yrs != null && yrs <= 1) ? 'active' : 'locked';
}

// The inputs the section's SHAPE depends on. When these change the section
// re-renders; a mere draft keystroke (which also commits state) must not —
// re-rendering mid-typing would destroy the textarea's focus and cursor.
function statementShapeSig() {
  return `${shortlistExcludesUK() ? 'noUK' : 'uk'}|${studentYears()}`;
}

function fmtChars(n) { return n.toLocaleString('en-GB'); }

function statementSectionHtml() {
  const mode = statementDraftingState();
  if (mode === 'hidden') return '';
  if (mode === 'locked') {
    // Two locked states, two truths: a KNOWN early year genuinely is early;
    // an UNSET year is us not knowing — saying "too early" there would be a
    // confident claim built on absent data.
    const line = studentYears() == null
      ? `<button type="button" class="stmt__locked-link" data-stmt-open-profile>Set your year</button> to unlock statement drafting.`
      : 'Statement drafting unlocks closer to application.';
    return `
    <section class="stmt stmt--locked" aria-label="Draft your statement" data-stmt-sig="${esc(statementShapeSig())}">
      <p class="stmt__locked-line">${line}</p>
    </section>`;
  }
  const drafts = AltioraState.getStatementDrafts();
  // Grid areas: editor + its meta on the left, the reference rail on the
  // right spanning both rows — so the rail can be height-capped BY the
  // textarea (height:0 + min-height:100%), and the phone order can be
  // textarea → rail → counter line without extra markup.
  const qs = UCAS_STATEMENT.questions.map((q, i) => `
    <div class="stmt__q" data-stmt-q="${q.id}">
      <h3 class="stmt__question"><span class="stmt__qnum">${i + 1} ·</span> ${esc(q.text)}</h3>
      <p class="stmt__prompt">${esc(STATEMENT_PROMPTS[q.id])}</p>
      <div class="stmt__grid">
        <textarea class="stmt__ta" data-stmt-input="${q.id}"
          aria-label="Your answer to: ${esc(q.text)}"
          spellcheck="true">${esc(drafts[q.id] ?? '')}</textarea>
        <div class="stmt__meta">
          <span class="stmt__count" data-stmt-count="${q.id}"></span>
          <button type="button" class="stmt__copy" data-stmt-copy="${q.id}">Copy as plain text</button>
        </div>
        <aside class="stmt__refs" aria-label="Your story entries relevant to this question">
          <span class="stmt__refs-label">From your story</span>
          <div data-stmt-refs="${q.id}"></div>
        </aside>
      </div>
    </div>`).join('');

  return `
    <section class="stmt" aria-label="Draft your statement" data-stmt-sig="${esc(statementShapeSig())}">
      <p class="stmt__eyebrow"><span class="stmt__swatch" aria-hidden="true"></span>Your statement</p>
      <h2 class="stmt__head">Draft your statement</h2>
      <p class="stmt__format">Three questions, read as one statement — 4,000 characters across all
        three, at least 350 each. Only what you write counts.</p>
      <p class="stmt__total" data-stmt-total aria-live="polite"></p>
      <div data-stmt-empty class="hidden"></div>
      ${qs}
      <p class="achv__note">Assemble from your own material — the finished statement is submitted on UCAS, not here.
        Your drafts stay on this device only, which matches UCAS's own advice not to share your statement or post it anywhere.</p>
    </section>`;
}

// Read the LIVE textarea values (they lead the state by a debounce tick).
function statementLiveValues() {
  const out = {};
  UCAS_STATEMENT.questions.forEach(q => {
    const ta = document.querySelector(`[data-stmt-input="${q.id}"]`);
    out[q.id] = ta ? ta.value : (AltioraState.getStatementDrafts()[q.id] ?? '');
  });
  return out;
}

// Counters are plain statements of fact in mono — never an alarm.
function syncStatementCounters() {
  if (!document.querySelector('[data-stmt-total]')) return;
  const vals = statementLiveValues();
  let total = 0;
  UCAS_STATEMENT.questions.forEach(q => {
    const n = vals[q.id].length;      // .length counts spaces and line breaks
    total += n;
    const el = document.querySelector(`[data-stmt-count="${q.id}"]`);
    if (!el) return;
    // Progress, not deficit: distance to the minimum until it's met, then
    // a plain count. No bars, no colours — a counter, not a game.
    el.textContent = n < UCAS_STATEMENT.perAnswerMin
      ? `${UCAS_STATEMENT.perAnswerMin - n} characters to go`
      : `${fmtChars(n)} characters`;
  });
  const totalEl = document.querySelector('[data-stmt-total]');
  if (totalEl) {
    totalEl.textContent = total <= UCAS_STATEMENT.totalLimit
      ? `${fmtChars(total)} / ${fmtChars(UCAS_STATEMENT.totalLimit)} characters across all three`
      : `${fmtChars(total)} / ${fmtChars(UCAS_STATEMENT.totalLimit)} characters — ${fmtChars(total - UCAS_STATEMENT.totalLimit)} over the limit`;
    totalEl.classList.toggle('stmt__total--over', total > UCAS_STATEMENT.totalLimit);
  }
}

// The read-only reference rail beside each question. Re-rendered on every
// state change (entries and pinned fields move); textareas are never
// touched here, so typing focus survives.
function renderStatementRefs() {
  if (statementDraftingState() !== 'active') return;
  const haveEntries = AltioraState.getAchievements().length > 0;
  const havePins    = activeCandidateFields().length > 0;
  // ZERO entries: one section-level line instead of three identical empty
  // rails. The rails (and their matching rules) are untouched — they simply
  // don't render until there is at least one entry to place.
  const section = document.querySelector('.stmt');
  const emptySlot = section?.querySelector('[data-stmt-empty]');
  section?.classList.toggle('stmt--no-entries', !haveEntries);
  if (emptySlot) {
    // Section-level notes, shown ONCE rather than repeated per question:
    // zero entries, or (with entries) zero pinned fields. Q1 matches by
    // pinned field, so "pin your fields" is genuinely different information
    // from "nothing fits" — but it belongs at the top, not in every rail.
    emptySlot.classList.toggle('hidden', haveEntries && havePins);
    emptySlot.innerHTML = !haveEntries
      ? `<p class="stmt__empty-line">Your story is empty — entries you add will appear beside the questions they fit.</p>`
      : !havePins
        ? `<p class="stmt__refs-empty">Pin the fields you're considering and your entries will show here.
             <button type="button" class="stmt__refs-add" data-stmt-open-fields>Open My fields</button></p>`
        : '';
  }
  if (!haveEntries) return;
  UCAS_STATEMENT.questions.forEach(q => {
    const host = document.querySelector(`[data-stmt-refs="${q.id}"]`);
    if (!host) return;
    const refs = statementRefsFor(q.id);
    if (refs.length) {
      // Preserve per-card expansion across the rail-only re-renders that
      // every state commit (e.g. a draft autosave) triggers.
      const openIds = new Set([...host.querySelectorAll('details[open]')].map(d => d.dataset.achvId));
      host.innerHTML = refs.map(a => storyCardHtml(a, { readOnly: true })).join('');
      openIds.forEach(id => {
        const d = host.querySelector(`details[data-achv-id="${CSS.escape(id)}"]`);
        if (d) d.open = true;
      });
      return;
    }
    // One empty state for every question: adaptive rails, consistent voice.
    // (The no-pins case renders once at the section top, never per rail.)
    host.innerHTML = `<p class="stmt__refs-empty">Nothing in your story fits this question yet.
           <button type="button" class="stmt__refs-add" data-stmt-add-entry>Add an entry</button></p>`;
  });
}

// Shape changes (system/year) rebuild the section; everything else only
// refreshes the reference rails. Subscribed once at init.
function syncStatementSurface() {
  const panel = $('panel-story');
  if (!panel || !panel.querySelector('.story-view')) return;
  const section = panel.querySelector('.stmt');
  const sig = statementShapeSig();
  if ((section?.dataset.stmtSig ?? null) !== (statementDraftingState() === 'hidden' ? null : sig)) {
    renderStoryPanel();
    return;
  }
  renderStatementRefs();
}

// Auto-grow: the textarea tracks its content from ~6 lines up to 60vh,
// then scrolls. Presentation only — the value and autosave are untouched.
function autosizeStatementTextarea(ta) {
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight + 2, Math.round(window.innerHeight * 0.6)) + 'px';
}

// "Copy as plain text" is dimmed and inert while its box is empty; space is
// reserved (the disabled button keeps its footprint), so no layout shift.
function syncStatementCopyButtons() {
  UCAS_STATEMENT.questions.forEach(q => {
    const ta  = document.querySelector(`[data-stmt-input="${q.id}"]`);
    const btn = document.querySelector(`[data-stmt-copy="${q.id}"]`);
    if (ta && btn) btn.disabled = ta.value.length === 0;
  });
}

// Run after every (re)build of the section: size every box to its restored
// draft and set the copy buttons' live/dimmed state.
function syncStatementChrome() {
  document.querySelectorAll('.stmt__ta').forEach(autosizeStatementTextarea);
  syncStatementCopyButtons();
}

let _stmtSaveTimers = {};
function wireStatementDrafting() {
  document.addEventListener('input', e => {
    const ta = e.target.closest?.('[data-stmt-input]');
    if (!ta) return;
    autosizeStatementTextarea(ta);               // grow with the content
    syncStatementCopyButtons();                  // live once any text exists
    syncStatementCounters();                     // instant feedback…
    const q = ta.dataset.stmtInput;
    clearTimeout(_stmtSaveTimers[q]);            // …debounced persistence
    _stmtSaveTimers[q] = setTimeout(() => AltioraState.setStatementDraft(q, ta.value), 500);
  });
  document.addEventListener('click', e => {
    const copy = e.target.closest?.('[data-stmt-copy]');
    if (copy) {
      const ta = document.querySelector(`[data-stmt-input="${copy.dataset.stmtCopy}"]`);
      const text = ta ? ta.value : '';
      const done = () => showToast('Copied as plain text.');
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done, () => {
          ta?.select(); document.execCommand('copy'); done();
        });
      } else {
        ta?.select(); document.execCommand('copy'); done();
      }
      return;
    }
    if (e.target.closest?.('[data-stmt-add-entry]')) {
      openAchievementForm(null);
      return;
    }
    // "Open My fields": the fields pill in the nav — its own toggle owns the
    // open/close state, so go through the real control rather than a copy.
    if (e.target.closest?.('[data-stmt-open-fields]')) {
      const pill = $('fieldsLink');
      pill?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      pill?.click();
      return;
    }
    // "Set your year": the profile pill popover, where the year lives.
    if (e.target.closest?.('[data-stmt-open-profile]')) {
      $('profileIndicatorBtn')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      openProfileMenu();
    }
  });
  // Flush a pending draft if the page is being left inside the debounce window.
  window.addEventListener('pagehide', () => {
    Object.keys(_stmtSaveTimers).forEach(q => {
      clearTimeout(_stmtSaveTimers[q]);
      const ta = document.querySelector(`[data-stmt-input="${q}"]`);
      if (ta) AltioraState.setStatementDraft(q, ta.value);
    });
  });
}

// The compact home summary: "5 entries · Engineering strong · Economics none
// yet". Shown when there's something to summarise (entries OR pinned fields).
function storyHomeCardHtml() {
  const items  = AltioraState.getAchievements();
  const pinned = activeCandidateFields();
  if (!items.length && !pinned.length) return '';
  const lead = `${items.length} ${items.length === 1 ? 'entry' : 'entries'}`;
  const bits = pinned.map(f => {
    const tagged     = items.filter(a => (a.fields || []).includes(f));
    const reflective = tagged.filter(entryHasReflection).length;
    const state = reflective >= 3 ? 'strong' : (tagged.length ? 'building' : 'none yet');
    return `${planFieldShort(f)} ${state}`;
  });
  const summary = [lead, ...bits].join(' · ');
  return `
    <section class="home-card">
      <h2 class="home-card__title">Your story</h2>
      <p>${esc(summary)}</p>
      <button class="home-card__link" data-open-story>Open your story →</button>
    </section>`;
}

// Reactive: re-project the home story card on every state change (the slot is
// always present in the home panel; the card appears/updates/vanishes here).
function renderStoryHomeCard() {
  const slot = $('homeStorySlot');
  if (!slot) return;
  slot.innerHTML = storyHomeCardHtml();
}

// Late-joiner nudge: a student who arrived at building/applying with no
// pinned fields may still be undecided on WHAT to study — normal, and the
// all-stages door exists but wasn't being found. One plain mono line; shown
// only while pinned fields = 0, and it disappears the moment they pin
// (subscribed projection, never a one-time read).
function renderHomeExploreNudge() {
  const slot = $('homeExploreNudge');
  if (!slot) return;
  const yrs   = studentYears();
  const stage = AltioraState.getProfile().stage;
  const show  = yrs != null && yrs <= 1
    && (stage === 'building' || stage === 'applying')
    && activeCandidateFields().length === 0;
  slot.innerHTML = show
    ? `<p class="home-explore-nudge">Fields still an open question?
         <button type="button" class="home-explore-nudge__link" data-home-goto-exploring>Exploring fields</button>
         is one click away.</p>`
    : '';
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

// "My Story" nav count — the third durable student-owned asset, beside
// My fields and My Shortlist. Subscribed, like the other two.
function updateStoryCount() {
  const el = $('storyCount');
  if (el) el.textContent = String(AltioraState.getAchievements().length);
  $('storyLink')?.classList.toggle('shortlist-link--active', state.mode === 'story');
}

/* ─── "My fields" indicator (kept candidate fields) ─────────────
 * The always-visible home for profile.candidateFields — the SAME set
 * the Gate and graduation read. Reflects the 0–3 cap, lists each kept
 * field (link to its profile + remove), and updates reactively via the
 * state subscription so keeping/removing anywhere is mirrored here. */
function closeFieldsMenu() {
  $('fieldsMenu')?.classList.add('hidden');
  $('fieldsLink')?.setAttribute('aria-expanded', 'false');
}
function toggleFieldsMenu() {
  const menu = $('fieldsMenu');
  if (!menu) return;
  const willOpen = menu.classList.contains('hidden');
  // Close the sibling menus so only one popover is open at a time.
  closeStageMenu(); closeSystemMenu();
  menu.classList.toggle('hidden', !willOpen);
  $('fieldsLink')?.setAttribute('aria-expanded', String(willOpen));
}

// ROOT of kept-state reactivity: every keep/kept button's VISUAL state is a
// direct projection of the single source of truth (candidateFields). This runs
// on EVERY state change via cheap DOM toggles on whatever keep-buttons are in
// the DOM — so a button can NEVER show a stale kept-state, independent of
// whether any heavier full re-render fires. Covers all three surfaces:
//   • Strengths-grid field cards (.field-card__pin)
//   • Field-profile pins (#foPinField / #foPinFieldEnd)
//   • Subject-Planner field grid (.plan-cat-card)
function syncKeepButtons() {
  if (typeof AltioraState === 'undefined') return;
  const kept = new Set(AltioraState.getCandidateFields());

  document.querySelectorAll('.field-card__pin[data-pin-category]').forEach(btn => {
    const on = kept.has(btn.dataset.pinCategory);
    btn.classList.toggle('field-card__pin--on', on);
    btn.setAttribute('aria-pressed', String(on));
    const txt = btn.querySelector('.field-card__pin-text');
    if (txt) txt.textContent = on ? 'Kept' : 'Keep';
    const name = btn.closest('.field-card')?.querySelector('.field-card__name')?.textContent?.trim() || '';
    btn.setAttribute('aria-label', `${on ? 'Kept' : 'Keep'} ${name}`.trim());
    btn.setAttribute('title', on ? 'Kept — one of your fields' : `Keep ${name}`.trim());
  });

  const foCat = state.exploreField?.category;
  if (foCat) {
    const on = kept.has(foCat);
    ['foPinField', 'foPinFieldEnd'].forEach(id => {
      const btn = $(id);
      if (!btn) return;
      btn.classList.toggle('pin-btn--on', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? '✓ Kept as one of your fields' : 'Keep this field';
    });
  }

  document.querySelectorAll('#planCategoryGrid .plan-cat-card[data-category]').forEach(c => {
    const on = kept.has(c.dataset.category);
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', String(on));
  });
}

function updateFieldsIndicator() {
  const countEl = $('fieldsCount');
  const menu = $('fieldsMenu');
  if (!countEl || !menu) return;
  const cap = (typeof AltioraState !== 'undefined') ? AltioraState.MAX_CANDIDATE_FIELDS : 3;
  const fields = (typeof AltioraState !== 'undefined') ? AltioraState.getCandidateFields() : [];
  countEl.textContent = String(fields.length);
  $('fieldsLink')?.classList.toggle('shortlist-link--active', fields.length > 0);

  if (!fields.length) {
    menu.innerHTML = `<p class="fields-menu__empty">Keep fields you're considering as you explore — up to ${cap}. They guide your subject planning and shortlist.</p>`;
    return;
  }
  const items = fields.map(cat => {
    const label = CATEGORY_LABEL_MAP[cat] ?? cat;
    return `
      <li class="fields-menu__item">
        <button type="button" class="fields-menu__name" data-open-field="${esc(cat)}">${esc(label)}</button>
        <button type="button" class="fields-menu__remove" data-remove-field="${esc(cat)}" aria-label="Remove ${esc(label)} from your fields">✕</button>
      </li>`;
  }).join('');
  menu.innerHTML = `
    <div class="fields-menu__head">Your fields <span class="fields-menu__cap">${fields.length}/${cap}</span></div>
    <ul class="fields-menu__list">${items}</ul>`;
}

/* ─── Reactive candidateFields fan-out ────────────────────────────
 * ONE subscription keeps EVERY surface in sync. Two layers, both driven off
 * the single source of truth (AltioraState.candidateFields):
 *   1. syncKeepButtons() + updateFieldsIndicator() run UNCONDITIONALLY on
 *      every change — cheap DOM toggles that directly project the kept-state
 *      onto every keep-button and the nav count/dropdown. This is what makes
 *      a stale KEPT card impossible: the button visual is re-derived from the
 *      source every time, never relying on a full re-render firing.
 *   2. A content re-render of the active view (new cards / combos / summary)
 *      fires only when the SET actually changed — an optimisation layered on
 *      top of (1), never a substitute for it. */
let _lastCandidateSig = null;
function syncCandidateFieldSurfaces() {
  syncKeepButtons();           // ← every keep-button's state, directly from the source (always)
  updateFieldsIndicator();     // nav count + dropdown (always)

  const sig = (typeof AltioraState !== 'undefined' ? AltioraState.getCandidateFields() : []).join('|');
  if (sig === _lastCandidateSig) return;   // content re-render only when the SET changed
  _lastCandidateSig = sig;

  if (state.mode === 'strengths')      renderStrengthsResults();
  else if (state.mode === 'plan')      renderPlanResults();
  else if (state.mode === 'home')      renderWorkspaceHome();

  // Pins drive the Check interest-filter default (a lens, never the truth):
  // re-apply on every pin change and refresh visible results if the lens moved.
  applyMyFieldsToCategoryFilter();
  if (state.mode === 'check' && state.selectedSubjects.length
      && categoryFilterSig() !== _resultsCatSig) renderCheckResults();
}

// Reactive fan-out for profile.subjects (+ grades): every surface that
// projects the student's subjects re-renders when they change — the same
// anti-desync pattern as candidate fields. Check Combination itself is the
// editor (its live state IS the source), so it's deliberately not re-rendered
// here; everything else follows the profile.
let _lastSubjectsSig = '';
function subjectsSig() {
  if (typeof AltioraState === 'undefined') return '';
  const p = AltioraState.getProfile();
  return (Array.isArray(p.subjects) ? p.subjects : []).join('|') + '::' + JSON.stringify(p.predictedGrades ?? '');
}
function syncSubjectSurfaces() {
  const sig = subjectsSig();
  if (sig === _lastSubjectsSig) return;
  _lastSubjectsSig = sig;
  if (state.mode === 'home')           renderWorkspaceHome();
  else if (state.mode === 'plan')      renderPlanResults();
  else if (state.mode === 'reverse')   { if (state.searchQuery) renderReverseResults(); }
  else if (state.mode === 'shortlist') renderShortlist();
  else if (state.mode === 'applying')  renderApplyingPanel();
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
       <button class="export-csv-btn" type="button" data-open-summary>🖨 Print summary</button>
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
// The balance WORDING, computed once and shared by the on-screen verdict and
// the printable Counselor Summary — so the two can never drift apart.
function shortlistBalance(saved) {
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
  } else {
    // Prescriptive counsel from the list's actual shape. Target shape:
    // 1–2 reaches + a core of matches + 1–2 safeties. Name what's missing
    // and how many — never a vague verdict.
    const gaps = [];
    if (counts.reach === 0)  gaps.push('1–2 reaches (ambitious choices)');
    if (counts.match === 0)  gaps.push('a core of matches (at your level)');
    if (counts.safety === 0) gaps.push('1–2 safeties (comfortable back-ups)');

    let lead;
    if (!gaps.length) {
      lead = 'Good spread — ambitious choices anchored by safer ones.';
    } else {
      const have = [];
      if (counts.match  > 0) have.push(counts.match >= 2 ? 'a solid core of matches' : 'one match at your level');
      if (counts.reach  > 0) have.push(counts.reach === 1 ? 'one ambitious reach' : `${counts.reach} ambitious reaches`);
      if (counts.safety > 0) have.push(counts.safety === 1 ? 'one safety' : `${counts.safety} safeties`);
      const haveTxt = have.length
        ? have.join(' and ').replace(/^./, ch => ch.toUpperCase()) + '. '
        : '';
      lead = `${haveTxt}To balance it: add ${gaps.join(' and ')}.`;
    }

    // UK anchor where the list is UK-heavy — UCAS's 5 choices are the real
    // target (a stable, factual number; nothing else numeric is claimed).
    const ukHeavy = saved.filter(c => c.country === 'UK').length > saved.length / 2;
    const anchor = ukHeavy ? ' UK applications give you 5 UCAS choices.' : '';

    // Year-aware close: time to build long, or time to finalise.
    const yrs = studentYears();
    const timing =
      (yrs != null && yrs >= 1) ? ' You have time — build a longer list (6–8) and narrow later.' :
      (yrs === 0)               ? (ukHeavy ? ' This year, finalise toward a balanced 5.'
                                           : ' This year, finalise toward a balanced final list.') : '';

    advice = lead + anchor + timing;
  }

  return { counts, hasGrades, classified, countsBits, advice };
}

function buildBalanceVerdictHtml(saved) {
  const { classified, countsBits, advice } = shortlistBalance(saved);

  const countsLine = classified > 0
    ? `<span class="shortlist-balance__counts">Your list: ${countsBits.join(' · ')}</span>`
    : `<span class="shortlist-balance__counts">Your list: ${saved.length} course${saved.length === 1 ? '' : 's'}, unclassified</span>`;
  // Vocabulary legend — only when verdicts are actually on display.
  const legend = classified > 0
    ? `<span class="shortlist-legend">Reach = above your predicted grades · Match = at your level · Safety = comfortably below</span>`
    : '';
  return `
    <p class="shortlist-balance">
      ${countsLine}
      <span class="shortlist-balance__advice">${advice}</span>
      ${legend}
    </p>`;
}

// Live, factual insights computed from the saved courses.
function buildShortlistInsightsHtml(saved) {
  const unis      = new Set(saved.map(c => c.university));
  const countries = new Set(saved.map(c => c.country));
  const plural    = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  // Admission tests with per-test course counts (not blindly deduplicated),
  // most-required first — split by the SAME relation the cards and checklist
  // read (testRelationFor). "You'll need" may only claim tests whose
  // relation is required; optional-lower-offer tests get their own line.
  const testCounts = {};
  const reqCounts = {}, optCounts = {};
  saved.forEach(c => (Array.isArray(c.admissionTests) ? c.admissionTests : [])
    .forEach(t => {
      testCounts[t] = (testCounts[t] ?? 0) + 1;
      const bucket = testRelationFor(c, t) === 'optional-lower-offer' ? optCounts : reqCounts;
      bucket[t] = (bucket[t] ?? 0) + 1;
    }));
  const sortCounts = o => Object.entries(o)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const testEntries = sortCounts(testCounts);
  const reqEntries  = sortCounts(reqCounts);
  const optEntries  = sortCounts(optCounts);
  const testTags = entries => entries.map(([t, n]) =>
    `<span class="shortlist-insight-tag">${esc(t)} (${n} course${n === 1 ? '' : 's'})</span>`).join(' ');
  // Only-optional shortlists must NOT render the "you'll need" line at all;
  // with no tests anywhere the existing None line stays as before.
  const needLine = (reqEntries.length || !optEntries.length)
    ? `<li><span class="shortlist-insight-label">Admission tests you'll need:</span> ${reqEntries.length
        ? testTags(reqEntries)
        : `<span class="text-secondary">None across your saved courses</span>`}</li>`
    : '';
  const optLine = optEntries.length
    ? `<li><span class="shortlist-insight-label">Optional tests that can lower an offer:</span> ${testTags(optEntries)}</li>`
    : '';

  // Registration windows for the tests on the list (static verified data).
  const regBits = testEntries
    .map(([t]) => (typeof admissionTestInfo !== 'undefined') ? admissionTestInfo[t] : null)
    .filter(Boolean)
    .map(i => `${esc(i.name)} ${esc(i.regShort)}`);
  const regLine = regBits.length
    ? `<li><span class="shortlist-insight-label">Registration windows:</span> <span class="shortlist-reg-windows">${regBits.join(' · ')}</span></li>`
    : '';

  // What the saved courses ask for — in the STUDENT'S system, honestly.
  const req = shortlistRequirementsSummary(saved);
  let gradeHtml = '';
  if (req.range || req.notes.length) {
    const bits = [];
    if (req.range) bits.push(`<strong>${esc(req.sysLabel)}: ${esc(req.range)}</strong>`);
    req.notes.forEach(n => bits.push(esc(n)));
    gradeHtml = `<li><span class="shortlist-insight-label">What your saved courses ask for:</span> ${bits.join(' · ')}</li>`;
  } else if (req.fallbackRows.length) {
    // Nothing on the list is expressible in the student's system — show what
    // IS published, honestly labelled, rather than nothing or a fake figure.
    gradeHtml = `<li><span class="shortlist-insight-label">What your saved courses ask for:</span>
        <span class="text-secondary">no ${esc(req.sysLabel)} figures published — shown as the universities state them:</span>
        <ul class="shortlist-grade-rows">
          ${req.fallbackRows.map(r => `<li><strong>${esc(r.label)}:</strong> ${esc(r.range)}</li>`).join('')}
        </ul></li>`;
  }

  // One-country observation — soft, only once the list has real shape (3+
  // saves all in one country). Never pushy; deliberate focus is fine.
  let countryNote = '';
  if (saved.length >= 3 && countries.size === 1) {
    const only = [...countries][0];
    const others = Object.keys(COUNTRY_LABELS)
      .filter(k => k !== only && (typeof courses !== 'undefined') && courses.some(c => c.country === k))
      .map(k => COUNTRY_LABELS[k]);
    if (others.length) {
      const otherTxt = others.length > 1
        ? `${others.slice(0, -1).join(', ')} and ${others[others.length - 1]}`
        : others[0];
      countryNote = `<li class="shortlist-country-note">All your choices are in ${esc(COUNTRY_LABELS[only] ?? only)} —
        if that's deliberate, great; if not, your subjects open courses in ${esc(otherTxt)} too.</li>`;
    }
  }

  return `
    <div class="shortlist-insights">
      <h2 class="shortlist-insights__title">Your shortlist at a glance</h2>
      ${buildBalanceVerdictHtml(saved)}
      <ul class="shortlist-insights__list">
        <li><strong>${plural(saved.length, 'course', 'courses')}</strong> saved across
            <strong>${plural(unis.size, 'university', 'universities')}</strong> in
            <strong>${plural(countries.size, 'country', 'countries')}</strong></li>
        ${needLine}
        ${optLine}
        ${regLine}
        ${gradeHtml}
        ${countryNote}
      </ul>
    </div>`;
}

// The entry-requirement summary for the glance, in the STUDENT'S OWN system
// only. Courses with indicative admissions (US holistic) are never forced
// into the range — they get an honest counted note instead. Falls back to
// the per-system rows only when nothing on the list is expressible in the
// student's system.
function shortlistRequirementsSummary(saved) {
  const system   = (typeof AltioraState !== 'undefined') ? AltioraState.getProfile().qualificationSystem : null;
  const key      = SYSTEM_GRADE_KEY[system];
  const sysLabel = SYSTEM_SHORT_LABELS[system] ?? 'grade';

  // US courses publish no fixed offer in ANY system — holistic admissions.
  const holistic   = saved.filter(c => c.country === 'US' && !(key && c.grades?.[key]));
  const rest       = saved.filter(c => !holistic.includes(c));
  const withFigure = key ? rest.filter(c => c.grades?.[key] != null && c.grades[key] !== '') : [];
  const noFigure   = rest.length - withFigure.length;

  const notes = [];
  if (holistic.length) {
    notes.push(`${holistic.length} US course${holistic.length === 1 ? ' uses' : 's use'} holistic admissions — no fixed offer`);
  }
  if (withFigure.length && noFigure > 0) {
    notes.push(`${noFigure} course${noFigure === 1 ? " doesn't" : " don't"} publish a ${sysLabel} figure`);
  }

  let range = null;
  if (withFigure.length) {
    const vals = withFigure.map(c => c.grades[key]);
    if (system === 'IB') {
      const nums = vals.filter(v => typeof v === 'number' && !isNaN(v));
      if (nums.length) {
        const lo = Math.min(...nums), hi = Math.max(...nums);
        range = lo === hi ? `${lo} points` : `${lo}–${hi} points`;
      }
    } else if (system === 'UK_A_Level' || system === 'SG_A_Level') {
      // Strongest offer first, e.g. "A*AA–AAA"; a single value stands alone.
      const ranked = vals.slice().sort((a, b) => aLevelOfferStrength(b) - aLevelOfferStrength(a));
      range = ranked[0] === ranked[ranked.length - 1] ? ranked[0] : `${ranked[0]}–${ranked[ranked.length - 1]}`;
    } else {
      // HK DSE / AP — distinct spread (no reliable cross-grade ranking).
      const uniq = [...new Set(vals.map(String))].sort();
      range = uniq.length === 1 ? uniq[0] : `${uniq[0]}–${uniq[uniq.length - 1]}`;
    }
  }

  // Only when the student's system yields nothing: show what other systems
  // publish (minus figures for the holistic courses, which have none anyway).
  const fallbackRows = (!range && rest.length) ? shortlistGradeRange(rest) : [];
  return { range, notes, fallbackRows, sysLabel };
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

  // HK DSE — list the distinct spread (no reliable cross-grade ranking).
  // (grades.ap removed from the schema; AP requirements live in apRequirement.)
  for (const [key, label] of [['hkDse', 'HK DSE']]) {
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
 * (isGradeAboveStudent, the grade parsers). UNKNOWN is the
 * honest answer whenever the signal is thin — never force a bucket.
 * ═══════════════════════════════════════════════════════════════ */

const VERDICT_META = {
  reach:  { label: 'Reach',  cls: 'reach'  },
  match:  { label: 'Match',  cls: 'match'  },
  safety: { label: 'Safety', cls: 'safety' },
};

// A grade only counts as "set" when it is present AND valid in the
// student's CURRENT system — a stale value left over from a previous
// system (e.g. IB points after switching to A-Level) must never feed a
// cross-system verdict.
// The subjects whose predicted grade is still blank, in selection order.
// Empty when the profile is complete (or when the system has a single input).
function missingGradeSubjects(system, grade, subjects) {
  const subs = Array.isArray(subjects) ? subjects : [];
  if (!PER_SUBJECT_GRADE_SYSTEMS.has(system) || !subs.length) return [];
  // A legacy single-average value applies to every subject — nothing missing.
  // (US_AP excepted: its old average letter is discarded, never applied.)
  if (typeof grade === 'string') {
    return (system !== 'US_AP' && hasValidGrade(system, grade)) ? [] : subs.slice();
  }
  const map  = (grade && typeof grade === 'object') ? grade : {};
  if (system === 'US_AP') return subs.filter(s => !AP_SCORE_RE.test(String(map[s] ?? '')));
  const rank = systemRank(system);
  return subs.filter(s => !Object.prototype.hasOwnProperty.call(rank, map[s]));
}

// Slot-by-slot offer comparison is only meaningful against a COMPLETE grade
// profile: with some subjects blank there is nothing to put in those slots, so
// a partial profile yields a WRONG answer rather than a partial one. Letter
// systems therefore need a grade for EVERY selected subject; IB and AP are a
// single input and are complete the moment a valid value is entered.
function gradeProfileComplete(system, grade, subjects) {
  if (!hasValidGrade(system, grade)) return false;
  if (!PER_SUBJECT_GRADE_SYSTEMS.has(system)) return true;
  const subs = Array.isArray(subjects) ? subjects : [];
  if (!subs.length) return false;
  return missingGradeSubjects(system, grade, subs).length === 0;
}

function hasValidGrade(system, grade) {
  if (!grade) return false;
  // Letter systems: the current shape is a per-subject map (valid when ANY
  // entry is a real grade on this system's scale); a legacy single-average
  // string stays valid too.
  if (LETTER_GRADE_SYSTEMS.has(system)) {
    const rank = systemRank(system);
    if (typeof grade === 'string') return Object.prototype.hasOwnProperty.call(rank, grade);
    if (typeof grade === 'object') {
      return Object.values(grade).some(v => Object.prototype.hasOwnProperty.call(rank, v));
    }
    return false;
  }
  if (system === 'US_AP') {
    // Per-subject digit map only. A legacy single-letter average is NOT
    // valid — there is no defensible AP-to-letter conversion, so it is
    // discarded rather than converted.
    return !!grade && typeof grade === 'object' && !Array.isArray(grade)
      && Object.values(grade).some(v => AP_SCORE_RE.test(String(v)));
  }
  if (system === 'IB') {
    const n = parseInt(grade, 10);
    return !isNaN(n) && n >= 24 && n <= 45;
  }
  return false;
}

// US admissions are holistic: there is no published cutoff a student can
// clear to make a US course a comfortable back-up. So a US course is CAPPED
// at 'match' — it can never be labelled a safety anywhere in the app. The
// cap lives in this one wrapper so every consumer (cards, shortlist counts,
// balance counsel, graduation gating, the printable summary) is consistent
// by construction rather than by remembering.
function shortlistVerdict(course, system, predictedGrade, profile) {
  const v = shortlistVerdictRaw(course, system, predictedGrade, profile);
  return (course.country === 'US' && v === 'safety') ? 'match' : v;
}

// True when the honest verdict was held back by the US holistic rule — the
// surfaces use this to show the quiet explanatory note.
function usSafetyCapped(course, system, predictedGrade, profile) {
  return course.country === 'US'
    && shortlistVerdictRaw(course, system, predictedGrade, profile) === 'safety';
}

const US_NO_SAFETY_NOTE = 'US admissions are holistic — no course is a guaranteed safety.';

function shortlistVerdictRaw(course, system, predictedGrade, profile) {
  // Same all-or-nothing rule as Check: reach/match/safety rests on the same
  // slot-by-slot comparison, so a partial profile yields no verdict at all.
  const gradeSet = gradeProfileComplete(system, predictedGrade, profile?.subjects);

  if (system === 'US_AP') {
    // ONE PIPELINE: read the status Check itself computes — no second AP
    // rule here. That status is capped below green until per-subject AP
    // grades exist (apStudentGradesComparable), so today every course is
    // not assessable. A genuinely green course (full comparison run and
    // met) reads as a match; no reach/match is manufactured short of that.
    return checkStatusFor(course).status === 'green' ? 'match' : 'unknown';
  }

  // No valid grade in the current system → no verdicts anywhere. The
  // elite-tier rule is deliberately BELOW this gate: with no grades,
  // even elite courses show nothing — one consistent mental model.
  if (!gradeSet) return 'unknown';

  // Elite-tier holistic US courses are reaches for everyone with grades set.
  if (course.country === 'US' && ELITE_HOLISTIC_TIERS.has(course.universityContext?.tier)) return 'reach';

  if (system === 'UK_A_Level' || system === 'SG_A_Level' || system === 'HK_DSE') {
    const gradeStr = course.grades?.[SYSTEM_GRADE_KEY[system]];
    if (!gradeStr) return 'unknown';
    const offer = parseOfferGrades(system, gradeStr);
    const cmp = compareProfileToOffer(system, predictedGrade, offer);
    if (cmp === 'unknown') return 'unknown';
    if (cmp === 'above')   return 'reach';
    // Strictly above the offer in every compared slot = comfortably below
    // your level (the per-subject form of the old top-grade rule).
    return profileComfortablyAbove(system, predictedGrade, offer) ? 'safety' : 'match';
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
  // "Grades set" means a COMPLETE profile valid in the CURRENT system — a
  // stale cross-system value or a half-filled one counts as not set, so every
  // surface (counts, balance counsel, graduation gating, the printable
  // summary) shows the nudge consistently.
  return {
    byId, counts, system,
    hasGrades: !!system && gradeProfileComplete(system, grade, profile.subjects),
  };
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

  // Reach/match/safety against the student's predicted grades. UNKNOWN
  // renders nothing — an honest absence, never a forced bucket.
  const profile = (typeof AltioraState !== 'undefined') ? AltioraState.getProfile() : {};
  const verdict = profile.qualificationSystem
    ? shortlistVerdict(course, profile.qualificationSystem, profile.predictedGrades || null, profile)
    : 'unknown';
  const vMeta = VERDICT_META[verdict];

  // The two labels sit on different axes (subject match vs grade level) and
  // can legitimately point opposite ways — e.g. a subject mismatch on a
  // course whose grades are comfortably below yours. When both are present
  // AND pull in different directions, qualify each with its axis; when they
  // agree (or only one shows), skip the qualifier — no noise.
  const status = hasSubjects ? classify(course, studentTags).status : null;
  const POLARITY = { green: 'pos', amber: 'mid', grey: 'mid', red: 'neg', safety: 'pos', match: 'mid', reach: 'neg' };
  const qualify = !!(status && vMeta && POLARITY[status] !== POLARITY[verdict]);
  const axis = label => `<span class="card-axis">${label}:</span> `;

  let badgeHtml;
  if (status) {
    const cfg = STATUS[status];
    badgeHtml = `<div class="card-status card-status--${status}">${cfg.icon} ${qualify ? axis('Subjects') : ''}${esc(statusLabel(status))}</div>`;
  } else {
    badgeHtml = `<div class="card-status card-status--none">Pick your subjects to see your match</div>`;
  }
  const verdictHtml = vMeta
    ? `<span class="shortlist-verdict shortlist-verdict--${vMeta.cls}">${qualify ? axis('Grades') : ''}${esc(vMeta.label)}</span>`
    : '';
  // Explain the absence, not just the cap: on any US course showing a
  // verdict, say why "Safety" is never one of the options. (The cap in
  // shortlistVerdict is the structural guarantee; this is the sentence that
  // tells the student what it means.)
  const usCapNote = (course.country === 'US' && vMeta)
    ? `<p class="card-us-nosafety">${esc(US_NO_SAFETY_NOTE)}</p>` : '';

  const card = document.createElement('div');
  card.className = 'course-card course-card--saved';
  card.setAttribute('role', 'listitem');
  card.dataset.category = course.category ?? '';
  card.innerHTML = `
    <div class="card-status-row">${badgeHtml}${verdictHtml}</div>
    ${usCapNote}
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
        ${tests.map(t => testTagHtml(course, t)).join('')}
      </div>` : ''}
    ${(course.verification?.status ?? 'unverified') !== 'verified'
      ? `<p class="card-unverified">⚠ Requirements not yet verified — confirm with the university.</p>`
      : ''}
    ${cardMoreHtml(course)}
  `;
  card.querySelector('.remove-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleShortlist(course.id);   // course is saved → this removes it
  });
  wireCardMore(card);
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
/* ═══════════════════════════════════════════════════════════════
 * STAGE GRADUATION — done-criteria, forward nudges, journey strip.
 * The stage model stops being a filter: each stage has computable
 * completion criteria derived from real state, the workspace home
 * says what's left, and a finished stage earns a polite invitation
 * forward. Never auto-advances — the student decides.
 * ═══════════════════════════════════════════════════════════════ */

const STAGE_ORDER = ['exploring', 'choosing', 'building', 'applying'];
const NEXT_STAGE  = { exploring: 'choosing', choosing: 'building', building: 'applying' };
const GRAD_INVITE = {
  choosing: 'start choosing your subjects',
  building: 'start building your university list',
  applying: 'start on your applications',
};

// "Not yet" dismissals — session-only by design: a returning student whose
// stage is done is exactly who should be quietly invited forward again.
const _gradDismissed = new Set();

// AP model: the AP-count target for the choosing-stage gate. Formerly derived
// from per-course tier numbers that were removed as unsourced; only this
// generic floor remains. NOTE: the floor itself has no source either —
// flagged for a follow-up decision on this gate's wording.
function apTargetCount(cats) {
  return 5;
}

// Do the student's OWN subjects keep each pinned field genuinely open?
// Same semantics as the Gate: "kept open" = at least half the best
// per-field coverage reachable within that field-pool's combinations
// (derived from the same ranked output — no parallel definition).
function fieldsCoverage(cats, tagSet) {
  const perField = cats.map(cat => ({ cat, courses: courses.filter(c => c.category === cat) }));
  const student  = perFieldOpened(perField, tagSet);
  const ranked   = rankMultiFieldCombinations(cats, 24);
  const bestSolo = {};
  cats.forEach(c => { bestSolo[c] = 0; });
  ranked.combos.forEach(s => s.per.forEach(p => { if (p.opened > bestSolo[p.cat]) bestSolo[p.cat] = p.opened; }));
  return student.map(p => ({
    cat: p.cat,
    opened: p.opened,
    kept: bestSolo[p.cat] === 0 || (p.opened > 0 && p.opened >= bestSolo[p.cat] / 2),
  }));
}

// Short human list of subjects for the graduation card.
function subjectsSummary(subjects) {
  if (subjects.length <= 4) return subjects.join(', ');
  return `${subjects.slice(0, 3).join(', ')} +${subjects.length - 3} more`;
}

// Per-stage completion: { done, missing[], achieved? } in plain student
// language. Safe to call for any stage regardless of the current one.
function stageProgress(stage) {
  const profile  = AltioraState.getProfile();
  const saved    = AltioraState.getShortlist();
  const fields   = plannerFields();
  const fieldNames = fields.map(planFieldShort);
  const subjects = Array.isArray(profile.subjects) ? profile.subjects : [];
  const isAP     = profile.qualificationSystem === 'US_AP';

  if (stage === 'exploring') {
    if (fields.length) {
      // Acknowledge the deliberation when we saw it happen this session.
      const achieved = (_fieldsVisited.size > fields.length)
        ? `you've explored ${_fieldsVisited.size} fields and kept ${fieldNames.join(' and ')}`
        : `you're keeping ${fieldNames.join(' and ')} in mind`;
      return { done: true, missing: [], achieved };
    }
    return { done: false, missing: ['Explore fields and keep 1–3 that interest you.'] };
  }

  if (stage === 'choosing') {
    if (isAP) {
      const target = apTargetCount(fields);
      if (subjects.length >= target) {
        return { done: true, missing: [], achieved: `you've built ${subjects.length} APs${fieldNames.length ? ` aligned with ${fieldNames.join(' and ')}` : ''}` };
      }
      return { done: false, missing: [subjects.length
        ? `You have ${subjects.length} AP${subjects.length === 1 ? '' : 's'} — keep building rigorous APs${fieldNames.length ? ` aligned with ${fieldNames.join(' and ')}` : ''}.`
        : `Build your AP list — rigorous APs aligned with your field${fields.length === 1 ? '' : 's'}.`] };
    }
    if (subjects.length < 3) {
      return { done: false, missing: [fields.length
        ? `Pick at least 3 subjects and check they keep ${fieldNames.join(' and ')} open.`
        : 'Pick at least 3 subjects — keeping 1–3 fields in the planner first helps.'] };
    }
    if (fields.length) {
      const notKept = fieldsCoverage(fields, tagsFromProfile())
        .filter(c => !c.kept).map(c => planFieldShort(c.cat));
      if (notKept.length) {
        return { done: false, missing: [`Your subjects don't yet keep ${notKept.join(' or ')} open — check the planner.`] };
      }
      return { done: true, missing: [], achieved: `you're keeping ${fieldNames.join(' and ')} open with ${subjectsSummary(subjects)}` };
    }
    return { done: true, missing: [], achieved: `you've settled on ${subjectsSummary(subjects)}` };
  }

  if (stage === 'building') {
    if (saved.length < 3) {
      return { done: false, missing: [saved.length
        ? 'Add a few more courses — aim for a balanced list of 3+.'
        : 'Find courses you qualify for and save the ones you like.'] };
    }
    const savedCourses = saved.map(id => courses.find(c => c.id === id)).filter(Boolean);
    const { counts, hasGrades } = shortlistVerdicts(savedCourses);
    const classified = counts.reach + counts.match + counts.safety;
    // Pathological shape: everything competitive, nothing safe. Only gate on
    // this when grades are set — optional data never blocks graduation.
    if (hasGrades && classified > 0 && counts.safety === 0 && counts.reach > 0) {
      return { done: false, missing: ['Your list has no safer choices — add 1–2 before moving on.'] };
    }
    const balanced = hasGrades && classified > 0 && counts.safety > 0 && counts.reach > 0;
    return { done: true, missing: [], achieved: `you've saved ${saved.length} courses${balanced ? ' with a balanced spread' : ''}` };
  }

  // Applying is the last stage — there's no "done" to graduate into.
  return { done: false, missing: [] };
}

// The original per-stage routing text — used once a stage is done (the
// graduation card carries the invitation; this stays calm routing).
function baseNextStep(stage, profile, shortlistCount) {
  switch (stage) {
    case 'exploring': {
      // Content-aware: a student with a pinned field gets pointed at the
      // profile's genuine comparison read rather than generic routing.
      const pins = plannerFields();
      const fp0 = (pins.length && typeof fieldProfiles !== 'undefined') ? fieldProfiles[pins[0]] : null;
      const cmp = fp0?.oftenComparedWith?.[0];
      if (cmp) {
        return {
          text: `Torn between ${planFieldShort(pins[0])} and ${planFieldShort(cmp.fieldId)}? Read how to think about it.`,
          actions: [
            { field: pins[0], label: 'Read the comparison' },
            { tool: 'strengths', label: 'Keep exploring' },
          ],
        };
      }
      return { text: 'Keep exploring the degree paths that fit you.',
               actions: [{ tool: 'strengths', label: 'Start with Strengths' }] };
    }
    case 'choosing':
      return { text: 'Refine the subjects that keep your options open.',
               actions: [{ tool: 'plan', label: 'Subject Planner' }] };
    case 'building':
      return {
        text: `You have ${shortlistCount} saved course${shortlistCount === 1 ? '' : 's'}. Review your list or find more.`,
        actions: [
          { tool: 'shortlist', label: 'Review your shortlist' },
          { tool: 'check',     label: 'Find more courses' },
        ],
      };
    case 'applying':
      return {
        text: `Work on applications for your ${shortlistCount} saved course${shortlistCount === 1 ? '' : 's'}.`,
        actions: [{ tool: 'applying', label: 'Open Applying' }, { tool: 'shortlist', label: 'View shortlist' }],
      };
    default:
      return { text: 'Pick up where you left off.', actions: [] };
  }
}

// Orientation, not routing: what's genuinely left in this stage (specific
// and singular), gentle backward pointing when the student is ahead of
// their data, and calm routing once the stage is done.
function computeNextStep(stage, profile, shortlistCount, progress) {
  const prog = progress ?? stageProgress(stage);
  const years   = studentYears();
  const implied = years != null ? yearImpliedStage(years) : null;

  // Forward orientation — the year implies a LATER stage than the current
  // one (e.g. an application-year student sitting in Exploring). A gentle
  // nudge with visible reasoning; the stage is NEVER changed automatically.
  if (implied && STAGE_ORDER.indexOf(implied) > STAGE_ORDER.indexOf(stage)) {
    const why = years === 0
      ? `${profile.yearGroup} is the application year, so deadlines and applications are usually the focus now`
      : `students in ${profile.yearGroup} are usually at ${STAGES[implied].name}`;
    return {
      text: `You're in ${profile.yearGroup} — ${why}. Nothing here is wasted, and there's no pressure — but when you're ready, that's where your time counts most.`,
      actions: [
        { stage: implied, label: `Move to ${STAGES[implied].name}` },
        { tool: STAGES[stage].primary, label: `Stay in ${STAGES[stage].name}` },
      ],
    };
  }

  // Year-aware urgency where the timing is real (never invented deadlines —
  // this is about which school year the decision typically happens in).
  const urgency =
    (stage === 'choosing' && years === 2) ? ' Subject choices usually lock in this school year — worth settling them soon.' :
    (stage === 'building' && years === 1) ? ' Your application year is next — a settled list now makes that year much calmer.' : '';

  // Backward orientation — manually ahead of the data. No shame.
  if (stage === 'applying' && !shortlistCount) {
    return {
      text: 'Your shortlist is empty — the building stage is where you find and save courses.',
      actions: [
        { stage: 'building', label: 'Go to Building my list' },
        { tool: 'check', label: 'Find courses' },
      ],
    };
  }

  if (!prog.done && prog.missing.length) {
    const STAGE_ACTIONS = {
      exploring: [{ tool: 'strengths', label: 'Start with Strengths' }],
      choosing:  [{ tool: 'plan', label: 'Subject Planner' }, { tool: 'check', label: 'Check Combination' }],
      building:  [{ tool: 'check', label: 'Check Combination' }, { tool: 'shortlist', label: 'Review your shortlist' }],
      applying:  [{ tool: 'applying', label: 'Open Applying' }],
    };
    return { text: prog.missing[0] + urgency, actions: STAGE_ACTIONS[stage] ?? [] };
  }

  const base = baseNextStep(stage, profile, shortlistCount);
  if (urgency) base.text += urgency;
  return base;
}

function renderWorkspaceHome() {
  const panel = $('panel-home');
  if (!panel) return;

  const profile = AltioraState.getProfile();
  const stage   = profile.stage || DEFAULT_STAGE;
  const cfg     = STAGES[stage] || STAGES[DEFAULT_STAGE];
  const saved   = AltioraState.getShortlist();

  // One progress pass for every stage — feeds the strip, the next-step
  // guidance, and the graduation card.
  const progressByStage = Object.fromEntries(STAGE_ORDER.map(s => [s, stageProgress(s)]));
  const prog = progressByStage[stage];
  const next = computeNextStep(stage, profile, saved.length, prog);

  const sysLabel = profile.qualificationSystem
    ? (qualificationMappings[profile.qualificationSystem]?.systemLabel ?? profile.qualificationSystem)
    : null;
  const subjects = Array.isArray(profile.subjects) ? profile.subjects : [];
  const grades   = formatPredictedGrades(profile.predictedGrades, profile.qualificationSystem);
  const candidateLabels = plannerFields().map(id => CATEGORY_LABEL_MAP[id] ?? id);

  // ── Journey strip: you are here. Earlier stages the student never did
  // show as quietly skipped (dimmed), never as failures.
  // (The old home journey strip is gone — the persistent journey bar in the
  // nav is the single progress display, so home doesn't duplicate it.)

  // ── Graduation card: stage done → a positive, dismissible invitation
  // forward. Session-dismissed via "Not yet"; never auto-advances.
  const nextStage = NEXT_STAGE[stage];
  const showGrad = prog.done && nextStage && !_gradDismissed.has(stage);
  // Building a list is never "finished" — the criteria being met means the
  // list has a workable foundation, not that refining it is over. Say that,
  // rather than implying the student is done with it. (Gating is untouched:
  // showGrad still keys off exactly the same prog.done.)
  const gradText = stage === 'building'
    ? `Your list has a solid foundation — ${esc(prog.achieved ?? 'nice work')}. You can keep refining it from the Applying stage. Ready to ${esc(GRAD_INVITE[nextStage] ?? 'move on')}?`
    : `You've got what you need from this stage — ${esc(prog.achieved ?? 'nice work')}. Ready to ${esc(GRAD_INVITE[nextStage] ?? 'move on')}?`;
  const gradHtml = showGrad ? `
    <section class="home-next home-grad" aria-label="Stage complete — ready to move on">
      <span class="home-grad__eyebrow">${stage === 'building' ? 'Solid foundation ✓' : 'Stage complete ✓'}</span>
      <p class="home-next__text">${gradText}</p>
      <div class="home-next__actions">
        <button class="home-next__btn home-next__btn--primary" data-grad-accept="${esc(nextStage)}">Move to ${esc(STAGES[nextStage].name)} →</button>
        <button class="home-next__btn" data-grad-later>Not yet</button>
      </div>
    </section>` : '';

  // Next-step buttons (first = primary); actions may route to a tool or —
  // for backward orientation — to a stage.
  const actionBtns = next.actions.map((a, i) => {
    const cls = `home-next__btn${i === 0 ? ' home-next__btn--primary' : ''}`;
    if (a.tool)  return `<button class="${cls}" data-go-tool="${esc(a.tool)}">${esc(a.label)} →</button>`;
    if (a.field) return `<button class="${cls}" data-go-field="${esc(a.field)}">${esc(a.label)} →</button>`;
    return `<button class="${cls}" data-go-stage="${esc(a.stage)}">${esc(a.label)} →</button>`;
  }).join('');

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

      ${gradHtml || `
      <section class="home-next" aria-label="Your next step">
        <span class="home-next__eyebrow">Your next step</span>
        <p class="home-next__text">${esc(next.text)}</p>
        <div class="home-next__actions">${actionBtns}</div>
      </section>`}

      <div class="home-cards">
        <section class="home-card">
          <h2 class="home-card__title">Your profile</h2>
          <dl class="home-card__dl">
            <div><dt>Qualification</dt><dd>${sysLabel ? esc(sysLabel) : muted('Not set yet')}</dd></div>
            <div><dt>Year</dt><dd>${profile.yearGroup ? esc(profile.yearGroup) : muted('Not set yet')}</dd></div>
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

        <div id="homeStorySlot" class="home-story-slot"></div>
      </div>

      <div id="homeExploreNudge"></div>

      <section class="home-quick" aria-label="Quick access">
        <span class="home-quick__label">Quick access</span>
        <div class="home-quick__row">
          ${toolBtns}
          <button class="home-quick__btn" data-go-tool="shortlist">🔖 My Shortlist (${saved.length})</button>
          <button class="home-quick__btn" data-open-story>📖 Your story</button>
          <button class="home-quick__btn" data-open-summary>🖨 Print summary</button>
          <button class="home-quick__btn" data-change-stage>Change stage</button>
        </div>
      </section>
    </div>
  `;

  // Project the story summary card into its slot (reactive on its own too).
  renderStoryHomeCard();
  renderHomeExploreNudge();
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
  // A rebuilt picker has selected nothing, so no auto-add is outstanding.
  _mathsAutoAdded = false;
  hideMathsWarningBanner();

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
  // No explicit field context → the My Fields default applies (no-op when
  // the student has touched the filter manually this session).
  applyMyFieldsToCategoryFilter();

  buildGradeInput(systemKey);
  // buildGradeInput starts blank — restore the saved grade so the check
  // write-through never clobbers a persisted grade with the input's initial
  // empty state (matters now that saved subjects pre-load and render at load).
  restoreGradeFromProfile(systemKey);
  syncSubjectCount();
  syncPickerCollapse();
  renderCheckEmptyState();
}

// Reflect profile.predictedGrades back into the (just-rebuilt) grade input.
// Only restores values valid for the active system's control — a grade saved
// under another system's format stays out rather than guessing.
function restoreGradeFromProfile(systemKey) {
  if (typeof AltioraState === 'undefined') return;
  const g = AltioraState.getProfile().predictedGrades;
  if (!g) return;

  // Letter systems: restore the per-subject map into the grade rows. A
  // legacy single-average string becomes a uniform fill (_pendingUniform),
  // applied as subject rows appear — the in-place migration; the next
  // write-through persists it as a map. Values invalid for this system's
  // scale stay out rather than guessing.
  if (PER_SUBJECT_GRADE_SYSTEMS.has(systemKey)) {
    const isAP  = systemKey === 'US_AP';
    const valid = isAP
      ? v => AP_SCORE_RE.test(String(v))
      : (rank => v => Object.prototype.hasOwnProperty.call(rank, v))(systemRank(systemKey));
    if (typeof g === 'string') {
      // Legacy AP single-average letter: DISCARDED, never converted — no
      // defensible AP-to-letter equivalence exists. The rows start blank
      // and the next grade edit persists the per-subject map (or null).
      if (isAP) { syncGradeRows(); return; }
      if (!valid(g)) return;
      _pendingUniform = g;
    } else if (g && typeof g === 'object') {
      Object.entries(g).forEach(([subj, v]) => { if (valid(v)) _gradeMap[subj] = String(v); });
    } else return;
    syncGradeRows();   // renders rows for any already-selected subjects + derives state.predictedGrade
    return;
  }

  const GRADE_INPUT_IDS = { IB: 'gradeInputIB' };
  const el = $(GRADE_INPUT_IDS[systemKey] ?? '');
  if (!el) return;
  const gs = (typeof g === 'string') ? g : null;   // IB/AP only ever store strings
  if (!gs) return;
  if (el.tagName === 'SELECT') {
    if (![...el.options].some(o => o.value === gs)) return;
    el.value = gs;
  } else {
    const v = parseInt(gs, 10);
    if (isNaN(v) || v < 24 || v > 45) return;   // IB points range
    el.value = String(v);
  }
  state.predictedGrade = gs;
}

/* ═══════════════════════════════════════════════════════════════
 * CATEGORY PICKER  (course interest filter)
 * ═══════════════════════════════════════════════════════════════ */

// The interest filter is a LENS; My Fields is the truth. Until the student
// touches the filter manually this session, their pinned candidate fields
// pre-select it (with a note saying so), and pin changes re-apply reactively.
// Manual changes override the default for the session and never un-pin
// anything. Field-exploration context (exploreField) keeps priority — it is
// an explicit "show me this field" intent.
let _categoryTouched = false;

function applyMyFieldsToCategoryFilter() {
  const setNote = on => {
    $('categoryDefaultNote')?.classList.toggle('hidden', !on);
    $('categoryHintDefault')?.classList.toggle('hidden', on);
  };
  if (_categoryTouched || state.exploreField) { setNote(false); return; }
  const pins = (typeof AltioraState !== 'undefined' ? AltioraState.getCandidateFields() : [])
    .filter(id => CATEGORIES.some(c => c.id === id));
  state.selectedCategories = new Set(pins);
  $$('#categoryPicker .category-chip').forEach(btn => {
    const active = state.selectedCategories.has(btn.dataset.category);
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  setNote(pins.length > 0);
}

// Signature of the category lens the results were last BUILT with — lets
// re-entry into Check refresh only when the lens actually changed.
let _resultsCatSig = null;
function categoryFilterSig() { return [...state.selectedCategories].sort().join('|'); }

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
      // Manual touch: the student now owns the lens for this session.
      _categoryTouched = true;
      $('categoryDefaultNote')?.classList.add('hidden');
      $('categoryHintDefault')?.classList.remove('hidden');
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
  const pickerSection = $('subjectPickerSection');
  if (!pickerSection) return;
  // The picker is MOVED between the onboarding slot and the tool (placement,
  // not a copy), so an existing banner may be stranded in the old parent —
  // re-home it rather than leaving it orphaned and the new placement bare.
  let banner = $('mathsWarningBanner');
  if (banner) {
    if (banner.nextElementSibling !== pickerSection) {
      pickerSection.parentNode.insertBefore(banner, pickerSection);
    }
    return;
  }
  banner = document.createElement('div');
  banner.id = 'mathsWarningBanner';
  banner.className = 'maths-warning-banner';
  banner.innerHTML =
    `<span class="maths-warning-banner__msg">ℹ️ ${esc(imply.standard)} is required alongside ${esc(imply.advanced)} — we've added it for you.</span>`;
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
        // Only THIS branch is a genuine auto-add: the standard subject was not
        // selected and we selected it. If it was already on, we add nothing.
        if (!stdInput.checked) {
          stdInput.checked = true;
          state.selectedSubjects.push(imply.standard);
          _mathsAutoAdded = true;
        }
        // The lock is unconditional — standard maths can't be dropped while the
        // advanced one is selected, whichever order they were picked in.
        stdInput.disabled = true;
        stdInput.closest('.subject-chip')?.classList.add('subject-chip--locked');
        if (_mathsAutoAdded) autoAdded.add(imply.standard);
      } else {
        _mathsAutoAdded = false;
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
      // The marker means "this is held in place" — shown in BOTH orders, as
      // today. Only its wording distinguishes an auto-add from a subject the
      // student chose themselves and now can't drop.
      const wasAutoAdded = autoAdded.has(input.value);
      const isLocked     = input.checked && input.disabled;
      if (wasAutoAdded || isLocked) {
        indicator.classList.remove('hidden');
        if (imply) indicator.title = wasAutoAdded
          ? `Added automatically because you selected ${imply.advanced}`
          : `Kept while ${imply.advanced} is selected`;
      } else if (!input.checked) {
        indicator.classList.add('hidden');
      }
    }
  });

  // Announced ONLY when this selection genuinely added the standard subject.
  if (imply && _mathsAutoAdded) showMathsWarningBanner(imply);
  else hideMathsWarningBanner();

  syncSubjectCount();
  syncPickerCollapse();
  syncGradeRows();                    // per-subject grade rows track the selection
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

// Compact picker view: students with subjects already selected see a one-line
// summary ("Your subjects: … [Edit]") instead of the full picker, moving the
// results meaningfully up the page. Edit expands the real picker (unchanged
// behaviour: filter, Clear all, FM lock); Done collapses it again. Never
// collapses with an empty selection, and never inside the onboarding
// placement (that step exists to enter subjects).
function syncPickerCollapse() {
  const section = $('subjectPickerSection');
  const row = $('subjectSummaryRow');
  if (!section || !row) return;
  const inOnboard = section.parentElement?.id === 'subjectOnboardSlot';
  const collapsed = !!state.pickerCollapsed && state.selectedSubjects.length > 0 && !inOnboard;
  section.classList.toggle('subject-picker-section--collapsed', collapsed);
  // The merged "Your subjects & predicted grades" section above already names
  // every subject and owns the Edit affordance, so the old standalone summary
  // row would just repeat it. It stays in the DOM (empty) purely as the
  // collapse anchor — for IB, whose grade control lists no subjects, it
  // still carries the list.
  const listsSubjects = !PER_SUBJECT_GRADE_SYSTEMS.has(state.checkSystem);
  row.classList.toggle('hidden', !collapsed || !listsSubjects);
  // The header "Edit subjects" exists to reopen the collapsed picker; while
  // the picker is already open it has nothing to do, so it hides.
  $('gradeEditSubjects')?.classList.toggle('hidden', !collapsed);
  row.innerHTML = (collapsed && listsSubjects) ? `
    <span class="subject-summary__label">Your subjects:</span>
    <span class="subject-summary__list">${state.selectedSubjects.map(esc).join(' <span class="subject-summary__dot">·</span> ')}</span>
    <button type="button" id="subjectSummaryEdit" class="subject-summary__edit" aria-label="Edit your subjects">Edit</button>` : '';
  $('collapsePickerBtn')?.classList.toggle('hidden', collapsed || state.selectedSubjects.length === 0 || inOnboard);
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
  const uPct  = total ? ((counts.unconfirmed ?? 0) / total * 100) : 0;
  const rPct  = total ? (counts.red   / total * 100) : 0;

  const greySummary = counts.grey
    ? `<span class="summary-dot">·</span><a href="#results-group-grey" class="summary-link summary-link--grey">${counts.grey} grades a stretch</a>`
    : '';

  const unconfirmedSummary = counts.unconfirmed
    ? `<span class="summary-dot">·</span><a href="#results-group-unconfirmed" class="summary-link summary-link--unconfirmed">${counts.unconfirmed} grades not confirmed</a>`
    : '';

  // Two language modes over identical counts/colours: subject-only mode may
  // only speak about subject FIT; grade mode keeps the match language.
  const summaryLine = gradesInformMatch()
    ? `Your subjects match <strong>${total}</strong> course${total !== 1 ? 's' : ''} —
      <a href="#results-group-green" class="summary-link summary-link--green">${counts.green} strong match${counts.green !== 1 ? 'es' : ''}</a>
      <span class="summary-dot">·</span>
      <a href="#results-group-amber" class="summary-link summary-link--amber">${counts.amber} possible</a>
      ${greySummary}
      ${unconfirmedSummary}
      <span class="summary-dot">·</span>
      <a href="#results-group-red" class="summary-link summary-link--red">${counts.red} out of reach</a>`
    : `Your subjects fit
      <a href="#results-group-green" class="summary-link summary-link--green"><strong>${counts.green}</strong> course${counts.green !== 1 ? 's' : ''}</a>
      of ${total}
      <span class="summary-dot">·</span>
      <a href="#results-group-amber" class="summary-link summary-link--amber">${counts.amber} partly fit</a>
      ${greySummary}
      ${unconfirmedSummary}
      <span class="summary-dot">·</span>
      <a href="#results-group-red" class="summary-link summary-link--red">${counts.red} don’t fit</a>`;

  const ariaLabel = gradesInformMatch()
    ? `Course eligibility: ${counts.green} strong matches, ${counts.amber} possible, ${counts.grey} grades a stretch, ${counts.unconfirmed ?? 0} grades not confirmed, ${counts.red} out of reach`
    : `Subject fit: ${counts.green} fit, ${counts.amber} partly fit, ${counts.red} don’t fit`;

  bar.innerHTML = `
    <div class="results-new-summary">
      ${summaryLine}
    </div>
    <div class="summary-progress" role="img" aria-label="${ariaLabel}">
      <div class="summary-seg summary-seg--green" style="width:${gPct.toFixed(2)}%"></div>
      <div class="summary-seg summary-seg--amber" style="width:${aPct.toFixed(2)}%"></div>
      <div class="summary-seg summary-seg--grey"  style="width:${grPct.toFixed(2)}%"></div>
      <div class="summary-seg summary-seg--unconfirmed" style="width:${uPct.toFixed(2)}%"></div>
      <div class="summary-seg summary-seg--red"   style="width:${rPct.toFixed(2)}%"></div>
    </div>
    <p class="coverage-line">Altiora checks a selected, verified set of universities — plenty of good courses exist beyond it.</p>
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

// The FULL per-course Check status pipeline — classify plus every demotion
// (too-few-subjects, AP-count holdback, grade gate, IB HL), reading the same
// live state the Check render reads. EXTRACTED (verbatim, from the render
// loop) so other surfaces can reuse the exact live number — never a parallel
// approximation that could disagree with what Check shows.
function checkStatusFor(course) {
  const minNeeded = MIN_SUBJECTS[state.checkSystem] ?? 3;
  const tooFew    = state.selectedSubjects.length < minNeeded;
  const apCount   = state.selectedSubjects.length;

  const result = classify(course, state.selectedTags);
  if (tooFew && result.status === 'green') result.status = 'amber';
  // AP: no course may show a STRONG match until the comparison actually
  // RUNS AND PASSES — which needs per-subject AP grades on the student side
  // AND held apRequirement grade data on the course, met slot-by-slot.
  // Everything else stays capped at amber: subject fit alone is never a
  // strong match, and half a check must never render as a full verdict.
  if (state.checkSystem === 'US_AP' && result.status === 'green'
      && !(apStudentGradesComparable() && apRequirementMet(course))) {
    result.status = 'amber';
  }
  // Grade gate. A subject-strong course only KEEPS a green/amber verdict when
  // its grade requirement can actually be compared against the student and
  // is met. Three outcomes:
  //   'above'   → grades are a stretch (grey)
  //   'met'     → keep the subject verdict (green/amber)
  //   'unknown' → requirement can't be read → fail safe to 'unconfirmed',
  //               NEVER a strong/possible match built on absent data.
  // US_AP is exempt from the grade gate entirely: AP comparison does not
  // run through compareGradeToStudent (which would always answer 'unknown'
  // for it), and entering the average AP score must never demote a result
  // below its blank-score status. The apRequirement cap above is the sole
  // AP-specific gate.
  // Gated on a COMPLETE profile — with some subjects blank we stay in
  // subject-only mode and never produce grey/unconfirmed at all.
  if (state.checkSystem !== 'US_AP'
      && gradesInformMatch() && (result.status === 'green' || result.status === 'amber')) {
    const cmp = compareGradeToStudent(course, state.checkSystem, state.predictedGrade);
    if (cmp === 'above') {
      result.status = 'grey';
      result.gradeGap = gradeGapInfo(course, state.checkSystem, state.predictedGrade);
    } else if (cmp === 'unknown') {
      result.status = 'unconfirmed';
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
  return result;
}

// The course set Check is currently rendering — the country/category lens
// applied. ONE definition, so nothing can count a different population.
function checkPool() {
  if (typeof courses === 'undefined') return [];
  return courses
    .filter(c => state.countryFilter === 'All' || c.country === state.countryFilter)
    .filter(c => state.selectedCategories.size === 0 || state.selectedCategories.has(c.category));
}

// ONE classification pass over a pool → the grouped courses and the counts.
// Check computes this once per render and hands the SAME object to the intro
// line and the summary bar, so the two can never quote different numbers.
function classifyPool(pool) {
  const byStatus = { green: [], amber: [], grey: [], unconfirmed: [], red: [] };
  pool.forEach(course => {
    const result = checkStatusFor(course);
    byStatus[result.status].push({ course, result });
  });
  const counts = {
    green: byStatus.green.length,
    amber: byStatus.amber.length,
    grey: byStatus.grey.length,
    unconfirmed: byStatus.unconfirmed.length,
    red: byStatus.red.length,
  };
  return { byStatus, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
}

// Live "subjects fit" count over the WHOLE dataset (no lens) — what the
// Applying landing quotes, where no lens exists. Check's own intro uses the
// LENSED count instead (see updateCheckFraming), because it sits directly
// above the lensed summary bar.
function subjectsFitCount() {
  if (typeof courses === 'undefined') return 0;
  if (!state.selectedTags || !state.selectedTags.size) return 0;
  return courses.reduce((n, c) => n + (checkStatusFor(c).status === 'green' ? 1 : 0), 0);
}

// The lensed green count, from the one pipeline. Passed in by
// renderCheckResults (already computed); recomputed only when the intro is
// refreshed on its own.
function checkFitCount() {
  if (!state.selectedTags || !state.selectedTags.size) return 0;
  return classifyPool(checkPool()).counts.green;
}

function renderCheckResults() {
  if (dataLoadError) return;
  const section = $('checkResultsSection');

  // Mirror the live Check selections into the persisted profile so the
  // workspace home reflects them (runs before the early return so it
  // also captures grade-only and cleared-subject changes).
  syncProfileFromCheck();
  syncGradeCompletenessPrompt();
  // Provisional pass so the intro is right even when we return early below;
  // the real render re-runs it with the counts it computed (one pipeline).
  updateCheckFraming();

  if (state.selectedSubjects.length === 0) {
    section.classList.add('hidden');
    _checkResultsSeen = false;   // reset so results scroll into view again next time
    return;
  }
  const firstAppearance = !_checkResultsSeen;
  _checkResultsSeen = true;
  _resultsCatSig = categoryFilterSig();   // the lens these results are built with
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
      ? 'Competitive US applicants take several rigorous APs, aligned to their major. Add more APs to see a fuller picture — results below are indicative only.'
      : `Universities require a full subject combination — please select at least ${minNeeded} subjects to see accurate results. Results below are indicative only.`;
    $('summaryBar').before(warn);
  }

  // ONE classification pass. The same counts object feeds the intro line, the
  // summary bar and the badges — the three can never disagree.
  const { byStatus, counts, total } = classifyPool(checkPool());

  // Sort each group by university name
  ['green', 'amber', 'grey', 'unconfirmed', 'red'].forEach(s =>
    byStatus[s].sort((a, b) => a.course.university.localeCompare(b.course.university))
  );

  updateCheckFraming(counts);
  renderSummaryBar(state.selectedSubjects.length, counts, total);

  // Pills are icon+count; their tooltips/labels follow the same language rule.
  const greyBadge = counts.grey ? `<span class="badge badge--grey" title="${esc(statusLabel('grey'))}">◯&thinsp;${counts.grey}</span>` : '';
  const unconfirmedBadge = counts.unconfirmed ? `<span class="badge badge--grey" title="${esc(statusLabel('unconfirmed'))}">◔&thinsp;${counts.unconfirmed}</span>` : '';
  $('resultSummaryBadges').innerHTML = `
    <span class="badge badge--success" title="${esc(statusLabel('green'))}">✓&thinsp;${counts.green}</span>
    <span class="badge badge--warning" title="${esc(statusLabel('amber'))}">◑&thinsp;${counts.amber}</span>
    ${greyBadge}
    ${unconfirmedBadge}
    <span class="badge badge--error" title="${esc(statusLabel('red'))}">✗&thinsp;${counts.red}</span>
    <span class="badge badge--neutral">${total} shown</span>
  `;

  const container = $('courseGrid');
  container.innerHTML = '';
  let cardIndex = 0;

  // Coverage-honest empty state: a field + country lens that yields ZERO is
  // a fact about OUR coverage, never about what exists. Rendering only —
  // counts and filtering above are untouched.
  if (total === 0 && state.selectedCategories.size > 0 && state.countryFilter !== 'All') {
    const fieldNames = [...state.selectedCategories]
      .map(id => CATEGORY_LABEL_MAP[id] ?? id).join(' / ');
    const countryName = COUNTRY_LABELS[state.countryFilter] ?? state.countryFilter;
    container.innerHTML = `
      <p class="coverage-empty">No ${esc(fieldNames)} courses in our ${esc(countryName)} set yet.
        That's a gap in our coverage, not proof they don't exist — try All countries,
        or go straight to university websites.</p>`;
    // No return: every step below no-ops on empty groups, so the normal
    // spinner/scroll/search handling still runs.
  }

  // Section headings follow the same subject-only / grade-mode language rule
  // as every other label (statusLabel) — colours and grouping identical.
  const gradeMode = gradesInformMatch();
  if (byStatus.green.length) {
    container.appendChild(buildGroup('green', gradeMode ? 'Strong matches' : 'Subjects fit', byStatus.green, cardIndex));
    cardIndex += byStatus.green.length;
  }
  if (byStatus.amber.length) {
    container.appendChild(buildGroup('amber', gradeMode ? 'Possible' : 'Partly fit', byStatus.amber, cardIndex));
    cardIndex += byStatus.amber.length;
  }
  if (byStatus.grey.length) {
    // Visible by default (no collapse) — subject matches where the predicted
    // grade is below the typical offer. Each card shows the grade gap.
    container.appendChild(buildGroup('grey', 'Right subjects — but the grades are a stretch', byStatus.grey, cardIndex));
    cardIndex += byStatus.grey.length;
  }
  if (byStatus.unconfirmed.length) {
    // Fail-safe bucket: subjects fit, but we could not compare the course's
    // grade requirement against the student (missing / partial / unreadable
    // grade data). Never presented as a confident match.
    container.appendChild(buildGroup('unconfirmed', 'Grades not confirmed', byStatus.unconfirmed, cardIndex));
    cardIndex += byStatus.unconfirmed.length;
  }
  if (byStatus.red.length) {
    container.appendChild(buildGroup('red', gradeMode ? 'Out of reach' : 'Subjects don’t fit', byStatus.red, cardIndex, true));
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
    // grey (grades a stretch) — warning triangle, matching the card status icon.
    grey:  `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5L18.5 17H1.5L10 2.5z"/><path d="M10 8v4M10 14.5v.5"/></svg>`,
    // unconfirmed (grades not confirmed) — half-filled circle, "we don't know".
    unconfirmed: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M10 3a7 7 0 0 0 0 14V3z" fill="currentColor" stroke="none"/></svg>`,
  };
  const header = document.createElement('h2');
  header.className   = `results-group__header results-group__header--${status}`;
  // `?? ''` guards against any status without a mapped icon — a missing key
  // must render nothing, never the literal string "undefined".
  header.innerHTML   = `${groupIcons[status] ?? ''} ${headerText} <span style="font-weight:400;opacity:.65">(${items.length})</span>`;
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
    // Same subject-only / grade-mode language rule as the headings.
    const noun = gradesInformMatch() ? 'out-of-reach courses' : 'courses your subjects don’t fit';
    toggle.innerHTML = `${chevSvg} Show ${items.length} ${noun}`;
    toggle.addEventListener('click', () => {
      const nowOpen = cardsDiv.hidden;
      cardsDiv.hidden = !nowOpen;
      toggle.setAttribute('aria-expanded', String(nowOpen));
      toggle.innerHTML = nowOpen
        ? `${chevSvg} Hide ${noun}`
        : `${chevSvg} Show ${items.length} ${noun}`;
    });
    section.appendChild(toggle);
    section.appendChild(cardsDiv);
  } else {
    section.appendChild(cardsDiv);
  }

  return section;
}

/* ═══════════════════════════════════════════════════════════════
 * SHARED CARD DETAIL — "More about this course" expander + compact
 * US test line. Used by every surface that renders course cards
 * (Check, shortlist, Course Finder), so all inherit both.
 * ═══════════════════════════════════════════════════════════════ */

const CARD_CHEVRON_ICON  = `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l5 5 5-5"/></svg>`;
const CARD_EXTERNAL_ICON = `<svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4h5v5M15 4l-7 7M9 5H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-4"/></svg>`;

// Compact per-card US test line — carries ONLY what varies by card: the
// policy variant and the indicative range when published. The generic
// holistic explainer lives once in the expander below, not boxed on every
// card. Honest absences render honestly ("no published range").
const US_TEST_SHORT = {
  required:    'SAT/ACT required',
  optional:    'Test-optional',
  flexible:    'Test-flexible',
  recommended: 'SAT/ACT recommended',
  varies:      'SAT/ACT required for some schools',
  blind:       'Test-blind',
};
// Grade requirement line: a pill only when the string reads like a grade
// token ("A*AA", "39"); sentence-length requirement text (HK/SG/CA "IGP
// 10th percentile…" / "General minimum: 3 AL passes…") renders as a plain
// mono line instead of a text-stuffed oval. Same content, presentation only.
// (The dataset has a clean cliff: every grade string is <= 6 chars or >= 38,
// so the 10-char threshold is unambiguous.)
function gradeLineHtml(gradeStr, sys) {
  const text = sys === 'IB' ? `${gradeStr} IB points` : String(gradeStr);
  const isShort = String(gradeStr).length <= 10;
  return `<div class="card-grades${isShort ? '' : ' card-grades--long'}">${esc(text)}</div>`;
}

function usTestLineHtml(course) {
  if (course.country !== 'US' || !course.usAdmissions) return '';
  const a = course.usAdmissions;
  const parts = [US_TEST_SHORT[a.test] ?? a.test];
  if (a.test === 'blind') {
    parts.push('scores not used');
  } else {
    const range = [];
    if (a.sat) range.push(`SAT ${a.sat}`);
    if (a.act) range.push(`ACT ${a.act}`);
    if (range.length) parts.push(...range, 'indicative');
    else parts.push('no published range');
  }
  return `<div class="card-us-test">🇺🇸 ${parts.map(esc).join(' · ')}</div>`;
}

// The expandable detail state: "learn more" built ONLY from content we
// already hold — the authored field guide, the course's own structural
// notes, the generic US-holistic explainer (moved here from the per-card
// box), the university profile (formerly its own expander), and the stored
// official source URL. Nothing is authored per-course; verification.notes
// stay internal (they are source bookkeeping, not student guidance); empty
// fields render nothing. Returns '' when no section has content.
function cardMoreHtml(course) {
  const sections = [];

  // 1. Field guide — the discovery read we already authored for this field.
  const fieldId = resolveFieldId(course.category);
  const fp = (fieldId && typeof fieldProfiles !== 'undefined') ? fieldProfiles[course.category] : null;
  if (fp) {
    const catLabel = CATEGORY_LABEL_MAP[course.category] ?? course.category;
    sections.push(`
      <p class="card-more__guide">What's a ${esc(catLabel)} degree actually like?
        <button type="button" class="card-more__guide-link" data-field-guide="${esc(course.category)}">Read the field guide →</button>
      </p>`);
  }

  // 2. Structural facts we already hold about THIS course (course.notes is
  // the curated student-facing field — co-op structure, college applications,
  // supplementary forms). Rendered only when present; never padded.
  if (course.notes) sections.push(`<p class="card-more__notes">${esc(course.notes)}</p>`);

  // 3. The generic US explainer — stated once here for those who want it.
  if (course.country === 'US' && course.usAdmissions) {
    sections.push(`<p class="card-more__us">🇺🇸 US admissions is holistic — there is no fixed grade cutoff. Published SAT/ACT figures are the middle 50% of admitted students: indicative, never a cutoff.</p>`);
  }

  // 4. University info (unified here from the old "About this university").
  const uniProfile = (typeof universityProfiles !== 'undefined') ? (universityProfiles[course.university] ?? null) : null;
  const uniWebsite = uniProfile?.websiteUrl ?? null;
  let uniLinkShown = false;
  if (uniProfile) {
    const cityPart = uniProfile.city ? ` · ${esc(uniProfile.city)}` : '';
    const tagLine  = uniProfile.tagline           ? `<p class="card-uni-tagline">${esc(uniProfile.tagline)}</p>` : '';
    const noteLine = uniProfile.internationalNote ? `<p class="card-uni-note">${esc(uniProfile.internationalNote)}</p>` : '';
    const webLink  = uniWebsite
      ? `<a class="card-uni-link" href="${esc(uniWebsite)}" target="_blank" rel="noopener noreferrer">${CARD_EXTERNAL_ICON} Visit website</a>`
      : '';
    uniLinkShown = !!webLink;
    if (tagLine || noteLine || webLink) {
      sections.push(`
        <div class="card-more__uni">
          <span class="card-more__head">About ${esc(course.university)}${cityPart}</span>
          ${tagLine}${noteLine}${webLink}
        </div>`);
    }
  } else if (course.universityContext?.notes) {
    sections.push(`
      <div class="card-more__uni">
        <span class="card-more__head">About ${esc(course.university)}</span>
        <p class="card-uni-note">${esc(course.universityContext.notes)}</p>
      </div>`);
  }

  // 5. Official course page — the university's own page beats anything we
  // could author. Only when the stored source is a real URL (skip 'UCAS'
  // and other non-URL bookkeeping strings). Link-rot protection: when the
  // health sweep (scripts/check-links.mjs) has flagged the source as dead
  // or redirected-to-homepage, a student must never hit the broken deep
  // link from inside Altiora — fall back to the university's own website
  // (unless the section above already links it). Unswept = 'ok'.
  const src = course.verification?.source;
  const srcIsUrl = typeof src === 'string' && /^https?:\/\//i.test(src);
  const srcOk = (course.verification?.sourceStatus ?? 'ok') === 'ok';
  if (srcIsUrl && srcOk) {
    sections.push(`<a class="card-uni-link card-more__official" href="${esc(src)}" target="_blank" rel="noopener noreferrer">${CARD_EXTERNAL_ICON} Official course page</a>`);
  } else if (srcIsUrl && !srcOk && uniWebsite && !uniLinkShown) {
    sections.push(`<a class="card-uni-link card-more__official" href="${esc(uniWebsite)}" target="_blank" rel="noopener noreferrer">${CARD_EXTERNAL_ICON} University website</a>`);
  }

  if (!sections.length) return '';
  // Wears .card-uni-info too: same expander interaction/styling as the old
  // "About this university" details, now unified into one detail area.
  return `
    <details class="card-uni-info card-more">
      <summary>More about this course ${CARD_CHEVRON_ICON}</summary>
      <div class="card-uni-info__body card-more__body">${sections.join('')}</div>
    </details>`;
}

// Wire the field-guide link (normal navigation — back-able via the router).
function wireCardMore(card) {
  card.querySelectorAll('[data-field-guide]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      logEvent('card_field_guide', { field: btn.dataset.fieldGuide, mode: state.mode });
      openFieldOverview(btn.dataset.fieldGuide, { from: state.mode === 'check' ? 'check' : 'card' });
    }));
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

  // ── AP requirement ───────────────────────────────────────────
  // Null → the standing data-absence line. Non-null → the record's own
  // contents, plainly; excluded APs scoped to the COURSE, never the
  // subject. A partial record surfaces the existing partial caution.
  let apNoteHtml = '';
  if (sys === 'US_AP') {
    const ar = course.apRequirement;
    if (ar == null) {
      apNoteHtml = `<p class="card-ap-note">AP entry requirements not held for this course.</p>`;
    } else {
      const lines = [];
      if (typeof ar.gpaMin === 'number') lines.push(`GPA minimum: ${ar.gpaMin}`);
      if (typeof ar.count === 'number') lines.push(`AP exams: ${ar.count}`);
      if (Array.isArray(ar.grades) && ar.grades.length) lines.push(`Grades: ${ar.grades.join(', ')}`);
      if (Array.isArray(ar.mustInclude) && ar.mustInclude.length) lines.push(`Must include: ${ar.mustInclude.join(', ')}`);
      (Array.isArray(ar.mustIncludeOneOf) ? ar.mustIncludeOneOf : []).forEach(set => {
        if (Array.isArray(set) && set.length) lines.push(`One of: ${set.join(' or ')}`);
      });
      (Array.isArray(ar.excluded) ? ar.excluded : []).forEach(s => {
        lines.push(`${s} does not count towards this course's requirement.`);
      });
      if (ar.note) lines.push(ar.note);
      apNoteHtml = lines.map(l => `<p class="card-ap-note">${esc(l)}</p>`).join('');
      if (ar.sourceStatus === 'partial') {
        apNoteHtml += `<p class="card-unverified">⚠ Some requirements not yet verified — confirm with the university before relying on these.</p>`;
      }
    }
  }

  // ── US admissions: one compact per-card line (usTestLineHtml). The old
  // repeated "Holistic admissions" box carried no per-card information; the
  // generic explainer now lives once in the card's expanded detail state.

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
    unconfirmed: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M8 8a2 2 0 1 1 2.6 1.9c-.4.15-.6.4-.6.8v.8"/><path d="M10 14.5v.2"/></svg>`,
  };
  const graduationIcon = `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l7-4 7 4-7 4-7-4z"/><path d="M7 10v3.5c0 1.5 1.3 2 3 2s3-.5 3-2V10"/><path d="M17 8v4"/></svg>`;

  // University info now lives inside the unified "More about this course"
  // expander (cardMoreHtml) together with the field guide, structural notes
  // and the official course page — one detail area instead of two.

  card.innerHTML = `
    <div class="card-status card-status--${status}">${statusIcons[status] ?? ''} ${esc(statusLabel(status))}</div>
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
    ${gradeStr ? gradeLineHtml(gradeStr, sys) : ''}
    ${(status === 'grey' && result.gradeGap) ? `<p class="card-grade-gap">⚠️ ${esc(gradeGapText(result.gradeGap))}</p>` : ''}
    ${status === 'unconfirmed' ? `<p class="card-grade-unconfirmed">◔ Your subjects fit, but this course doesn't publish a grade requirement we can compare with your predicted grade — so we can't confirm it's a match. Check the university's official page.</p>` : ''}
    ${fieldCoreHtml}
    ${usTestLineHtml(course)}
    ${ibHlHtml}
    ${tests.length ? `
      <div class="card-admission-tests">
        ${tests.map(t => testTagHtml(course, t)).join('')}
      </div>` : ''}
    ${apNoteHtml}
    ${unverifiedHtml}
    ${footerHtml}
    ${cardMoreHtml(course)}
  `;
  wireSaveButton(card);
  wireCardMore(card);
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

// One honest sentence comparing a course's required subjects with the
// student's own ("you have Maths and Physics — this also wants Chemistry").
// Reuses the existing tag matching (same semantics as classify) and the
// shared requirementLabels display logic — no new engine. Empty string when
// the student has no subjects saved or the course lists no requirements.
function reverseCompareHtml(course) {
  const tags = (state.selectedTags && state.selectedTags.size) ? state.selectedTags : tagsFromProfile();
  if (!tags.size) return '';
  const sys = state.reverseSystem;
  const essential = (course.requirements?.essential ?? []).filter(t => tagExistsInSystem(t, sys));
  if (!essential.length) return '';
  const isQuant = isQuantitativeCategory(course.category);
  const haveL = requirementLabels(essential.filter(t => tags.has(t)),  sys, isQuant);
  const missL = requirementLabels(essential.filter(t => !tags.has(t)), sys, isQuant);
  if (!missL.length) {
    return `<p class="reverse-compare reverse-compare--met">✓ You have the required subjects: ${esc(haveL.join(', '))}.</p>`;
  }
  if (!haveL.length) {
    return `<p class="reverse-compare">Requires ${esc(missL.join(', '))} — not in your current subjects.</p>`;
  }
  return `<p class="reverse-compare">You have ${esc(haveL.join(', '))} — this also wants ${esc(missL.join(', '))}.</p>`;
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
    ${reverseCompareHtml(course)}
    ${cardMoreHtml(course)}
    <div class="reverse-card-footer">
      ${saveButtonHtml(course.id)}
      <button class="copy-btn" type="button" aria-label="Copy requirements for ${esc(course.name)} to clipboard">
        ⎘&ensp;Copy requirements
      </button>
    </div>
  `;

  wireSaveButton(card);
  wireCardMore(card);

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
      // On success the candidateFields subscription re-renders the planner (grid
      // + combos) and every other surface; a cap hit just shows a toast.
      togglePinnedField(cat.id, { silent: true });
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

/* ─── Honest combination sizing ──────────────────────────────────
 * A university offer is made on a FULL set of subjects — typically at
 * least three A-Levels / IB HLs / H2s. A ranked combination that shows
 * fewer named subjects is a CORE, not a complete application set, so
 * every such row carries a visible "+ N more of your choice" slot and
 * the count is framed as "how many courses stay open whatever your
 * remaining choices are" (a course counted here is satisfied by the
 * named subjects alone, so it stays open regardless of the rest).
 *
 * US_AP is deliberately absent: it uses the holistic AP-volume model on
 * its own panel and never reaches these combo rows.
 * ─────────────────────────────────────────────────────────────── */
const SYSTEM_FULL_SET = { UK_A_Level: 3, IB: 3, SG_A_Level: 3, HK_DSE: 3 };
function systemFullSet(system) { return SYSTEM_FULL_SET[system] ?? 3; }

// How many free-choice slots a combo needs to reach a realistic full set,
// measured in DISPLAYED subjects (maths may collapse to one label in some
// systems, so this is comboLabels-based, not raw tag count).
function comboFreeSlots(combo, system, isQuant) {
  const shown = comboLabels(combo, system, isQuant).length;
  return Math.max(0, systemFullSet(system) - shown);
}

const _FREE_SLOT_WORDS = ['zero', 'one', 'two', 'three'];
// The label for the remaining free-choice subjects, e.g. "+ one more of
// your choice". Shared by the planner and Field Overview chips.
function freeSlotText(n) {
  const word = _FREE_SLOT_WORDS[n] || String(n);
  return `+ ${word} more of your choice`;
}
// A visible placeholder chip standing in for the subjects still to choose,
// so an incomplete combination never reads as a complete application set.
function freeChoiceChipHtml(n) {
  if (n <= 0) return '';
  return `<span class="plan-combo-tag plan-combo-tag--free"
      aria-label="plus ${_FREE_SLOT_WORDS[n] || n} more subject${n === 1 ? '' : 's'} of your choice">${freeSlotText(n)}</span>`;
}

// Does this combo DISPLAY the Maths + Further Maths pairing as two subjects?
// (Only where the system treats them separately — UK.)
function comboShowsMathsPair(combo, system, isQuant) {
  const labels = comboLabels(combo, system, isQuant);
  return labels.includes(mathsSubjectName(MATHS_STD, system, isQuant))
      && labels.includes(mathsSubjectName(MATHS_ADV, system, isQuant));
}

// The honest framing note under a set of combination rows: explains the
// free-choice slots when any row is a partial set, and adds the general
// Maths + Further Maths breadth caveat when that pairing appears. Both are
// system-general — no invented per-university claims.
function planComboNoteHtml(combos, system, isQuant) {
  const anyFree      = combos.some(c => comboFreeSlots(c.combo, system, isQuant) > 0);
  const anyMathsPair = combos.some(c => comboShowsMathsPair(c.combo, system, isQuant));
  const bits = [];
  if (anyFree) bits.push('Universities admit on a full set of subjects — typically at least three. A “+ … more of your choice” slot means any subject can fill it; the count is how many courses stay open whatever those remaining choices are.');
  if (anyMathsPair) bits.push('Some courses expect breadth beyond Maths + Further Maths — check individual course requirements.');
  return bits.length ? `<p class="plan-combo-note">${bits.map(esc).join(' ')}</p>` : '';
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
// Year-aware framing: once subjects are effectively chosen (application year
// or the year before), the planner reads RETROSPECTIVELY — "what your
// subjects open" — rather than as a live planning decision. Same engine,
// same data, same capability; only the default framing changes.
function planIsRetro() {
  const y = studentYears();
  return y != null && y <= 1;
}

function renderPlanResults() {
  if (dataLoadError) return;
  // System is a single global property — read it from the profile rather than
  // any in-body selector (the nav control is the only selector).
  if (!state.planSystem) state.planSystem = AltioraState.getProfile().qualificationSystem;

  // Year-aware intro: planning counsel vs retrospective read.
  const intro = $('planIntro');
  if (intro) {
    intro.textContent = planIsRetro()
      ? 'Your subjects are set — so this reads the other way: pick up to 3 fields you\'re considering and see how combinations (including yours) cover them. You can still explore alternatives any time.'
      : 'Torn between fields? Pick up to 3 you\'re considering — we\'ll find the subject combinations that keep them all open, and show what dropping a subject would cost.';
  }

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
  // AP has no fixed-count combination model.
  if (state.planSystem === 'US_AP') {
    $('planCombinations').innerHTML = `
      <h3 class="plan-section-head">Building a strong AP profile for ${esc(catLabel)}</h3>
      <p class="plan-section-sub">AP admission isn't about a fixed set of subjects — it's about taking enough rigorous, field-aligned APs.</p>`;
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
      // Incomplete sets get a visible free-choice slot so no row reads as a
      // complete application on fewer subjects than universities require.
      const free = freeChoiceChipHtml(comboFreeSlots(combo, state.planSystem, isQuant));
      return `
        <div class="plan-combo-row" tabindex="0" role="button"
             aria-label="Apply this subject combination in Check Combination mode"
             data-tags="${esc(JSON.stringify(combo))}">
          ${tags}${free}
          <span class="plan-combo-arrow" aria-hidden="true">→</span>
          <div class="plan-combo-results">
            <span class="badge badge--neutral">opens ${opens} course${opens !== 1 ? 's' : ''}</span>
          </div>
        </div>`;
    }).join('');

    const comboHead = planIsRetro()
      ? `What different combinations open in ${esc(catLabel)}`
      : 'Subject combinations that open the most doors';
    const comboSub = planIsRetro()
      ? `Since your subjects are already chosen, use this as a reference — click any row to check how a combination (like your own) performs in Check Combination.`
      : `Combinations ranked by how many ${esc(catLabel)} courses become accessible. Click any row to try it in Check Combination.`;
    $('planCombinations').innerHTML = `
      <h3 class="plan-section-head">${comboHead}</h3>
      <p class="plan-section-sub">${comboSub}</p>
      ${planComboNoteHtml(top5, state.planSystem, isQuant)}
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
    ? (planIsRetro()
        ? ` <span class="plan-drop-closure plan-drop-closure--info">— for reference: a combination without it closes ${closed} of your ${cats.length} fields.</span>`
        : ` <strong class="plan-drop-closure">— effectively closes ${closed} of your ${cats.length} fields. Decide carefully.</strong>`)
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
      // Planning years → urgent counsel (the decision is live). Retro years →
      // informational (the decision is made; no lectures about closed doors).
      const closure = totalCourses && (e.count / totalCourses) >= 0.5
        ? (planIsRetro()
            ? ` — <span class="plan-chip-closure plan-chip-closure--info">most courses across your fields need it</span>`
            : ` — <span class="plan-chip-closure">dropping it closes most doors</span>`)
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
    $('planCombinations').innerHTML = `
      <h3 class="plan-section-head">Building a strong AP profile for your fields</h3>
      <p class="plan-section-sub">AP admission isn't about a fixed set of subjects — build enough rigorous APs aligned with the fields you're considering.</p>
      ${cats.map(cat => `
        <div class="plan-ap-field">
          <span class="plan-field-badge">${esc(CATEGORY_LABEL_MAP[cat] ?? cat)}</span>
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
      // Free-choice slot for partial sets — a subject you'd still choose, so
      // the row never implies fewer subjects than a real application needs.
      const free = freeChoiceChipHtml(comboFreeSlots(combo, sys, isQuant));
      const fieldsHtml = per.map((p, i) =>
        `<span class="plan-combo-field${p.opened === 0 ? ' plan-combo-field--zero' : ''}">${esc(planFieldShort(p.cat))}: ${p.opened}${i === 0 ? ' courses' : ''}</span>`
      ).join('<span class="plan-combo-fieldsep" aria-hidden="true">·</span>');
      return `
        <div class="plan-combo-row plan-combo-row--multi" tabindex="0" role="button"
             aria-label="Apply this subject combination in Check Combination mode. Or activate a subject to see what dropping it would cost."
             data-tags="${esc(JSON.stringify(combo))}">
          <div class="plan-combo-main">
            ${tagsHtml}${free}
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
      ${planComboNoteHtml(combos, sys, isQuant)}
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

// Route a subject combination through to Check Combination with those exact
// subjects ticked and the results filtered to the relevant field(s). Shared by
// the Subject Planner (fields = all candidate fields) and the Field Overview's
// "typical strong combinations" (opts.fields = [the single field]). opts:
//   fields        – category ids to filter by + drive maths resolution
//                   (defaults to the planner's candidate fields)
//   resetCountry  – reset the country filter to All (the Field Overview's
//                   "opens N" count is all-countries, so this keeps it agreeing)
function switchToPlanCombo(tags, systemKey, opts = {}) {
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

  if (opts.resetCountry) {
    state.countryFilter = 'All';
    $$('#countryFilterBar .filter-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.country === 'All'));
  }
  buildSubjectPicker(systemKey);

  // Tick the exact subjects the source DISPLAYED, via the shared comboLabels
  // logic — never one tag at a time. This keeps the selection consistent with
  // the combo shown and resolves maths correctly per system: one rigorous maths
  // for level-based systems (e.g. IB AA HL, not SL+HL or the applied variant;
  // SG H2, not H1+H2), and Maths + Further Maths only where genuinely separate.
  const fields = opts.fields || plannerFields();
  const isQuant = fields.some(isQuantitativeCategory);
  const targetNames = new Set(comboLabels(tags, systemKey, isQuant));
  $$('#subjectPicker input[type="checkbox"]').forEach(cb => {
    if (targetNames.has(cb.value)) cb.checked = true;
  });

  onSubjectToggle();

  if (fields.length) {
    // Filter Check Combination to the relevant field(s) — an explicit lens
    // choice, so it overrides the My Fields default for the session.
    _categoryTouched = true;
    state.selectedCategories = new Set(fields);
    $$('#categoryPicker .category-chip').forEach(btn => {
      const active = fields.includes(btn.dataset.category);
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

// The Strengths panel intro adapts to the year. For students two or more
// years out it's open-ended discovery; for late-year students (subjects
// already set) it's decision-oriented — the open question is the field, and
// we lead with connecting fields to the subjects they already have.
function renderStrengthsIntro() {
  const intro = document.querySelector('#panel-strengths .panel-intro');
  if (!intro) return;
  const yrs = studentYears();
  intro.textContent = (yrs != null && yrs <= 1)
    ? "Still deciding what to apply for? Your subjects are set — tell us what you're good at, and we'll show you the fields that fit and how many courses your subjects already open in each."
    : "Tell us what you're good at — we'll show you fields of study that match your natural abilities.";
}

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

  // Late-year framing: a student one year out or in their application year has
  // their subjects set — the open question is the FIELD, not the subjects. On
  // each card, connect the field to their EXISTING subjects (how many courses
  // those subjects already open), reusing the Check-Combination classifier.
  const _yrs = studentYears();
  const lateYear = _yrs != null && _yrs <= 1;
  const studentTags = tagsFromProfile();
  const showCoverage = lateYear && studentTags.size > 0;

  resultsDiv.innerHTML = `<div class="field-cards">${
    fieldIds.map(id => buildFieldCardHtml(id, { showCoverage, studentTags })).join('')
  }</div>`;
  section.classList.remove('hidden');

  // "Learn more" → the deep field profile (understand the field).
  resultsDiv.querySelectorAll('[data-learn-field]').forEach(btn => {
    btn.addEventListener('click', () =>
      openFieldOverview(btn.dataset.learnField, { from: 'strengths', strengths: [..._selectedStrengths] })
    );
  });
  // "Explore courses" → straight to the field's course list (skip the read).
  resultsDiv.querySelectorAll('[data-courses-field]').forEach(btn => {
    btn.addEventListener('click', () =>
      goToFieldCourses(btn.dataset.coursesField, { from: 'strengths', strengths: [..._selectedStrengths] })
    );
  });
  resultsDiv.querySelectorAll('[data-pin-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Keeping is instant — one click toggles the field. The candidateFields
      // subscription re-renders these cards and every other surface (nav count,
      // etc.), so no manual re-render and no interstitial.
      togglePinnedField(btn.dataset.pinCategory);
    });
  });
}

// How many courses in a field the student's SAVED subjects already open —
// reusing the Check-Combination classifier, no new engine. A course "opens"
// when the subjects clear its match (green/amber); grades are deliberately
// out of scope here (this answers "do my subjects fit the field?"). When
// coverage is thin, name the subject most of the remaining courses require,
// so a poor fit is stated honestly rather than hidden.
function fieldSubjectCoverage(category, studentTags, systemKey) {
  const pool = (typeof courses !== 'undefined' ? courses : []).filter(c => c.category === category);
  if (!pool.length) return null;
  let open = 0;
  const missCount = new Map();
  pool.forEach(course => {
    const r = classify(course, studentTags);
    if (r.status === 'green' || r.status === 'amber') { open++; return; }
    (course.requirements?.essential ?? [])
      .filter(t => !studentTags.has(t))
      .forEach(t => missCount.set(t, (missCount.get(t) || 0) + 1));
  });
  let topMissing = null;
  if (missCount.size) {
    const [tag] = [...missCount.entries()].sort((a, b) => b[1] - a[1])[0];
    topMissing = tagToLocal(tag, systemKey);
  }
  return { open, total: pool.length, topMissing };
}

// The honest one-liner shown under a field card for late-year explorers.
function fieldCoverageLineHtml(cov) {
  if (!cov) return '';
  const { open, total, topMissing } = cov;
  const frac = total ? open / total : 0;
  const gap  = topMissing ? ` — most need ${esc(topMissing)}` : '';
  let text, mod;
  if (open === 0) {
    text = `Your subjects open few courses here${gap}`; mod = ' field-card__coverage--thin';
  } else if (open <= 2 || frac < 0.2) {
    text = `Your subjects open ${open} course${open === 1 ? '' : 's'} here — few${topMissing ? `, and most others need ${esc(topMissing)}` : ''}`;
    mod = ' field-card__coverage--thin';
  } else {
    text = `Your subjects open ${open} course${open === 1 ? '' : 's'} in this field`; mod = '';
  }
  return `<p class="field-card__coverage${mod}"><span class="field-card__label">From your subjects</span>${text}.</p>`;
}

function buildFieldCardHtml(fieldId, opts = {}) {
  const f = STRENGTH_FIELDS[fieldId];
  if (!f) return '';
  const pinned = (typeof AltioraState !== 'undefined')
    && AltioraState.getCandidateFields().includes(f.category);
  const coverageHtml = opts.showCoverage
    ? fieldCoverageLineHtml(fieldSubjectCoverage(f.category, opts.studentTags, AltioraState.getProfile().qualificationSystem))
    : '';
  return `
    <article class="field-card" data-category="${esc(f.category)}"
      style="--field-accent: var(--color-cat-${f.category}); --field-accent-bg: var(--color-cat-${f.category}-bg);">
      <button class="field-card__pin${pinned ? ' field-card__pin--on' : ''}" type="button"
              data-pin-category="${esc(f.category)}" aria-pressed="${pinned}"
              aria-label="${pinned ? 'Kept' : 'Keep'} ${esc(f.name)}"
              title="${pinned ? 'Kept — one of your fields' : `Keep ${esc(f.name)}`}">
        <svg class="field-card__pin-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 2.75h12a1.25 1.25 0 0 1 1.25 1.25v17.4L12 17.55 4.75 21.4V4A1.25 1.25 0 0 1 6 2.75z"/>
        </svg>
        <span class="field-card__pin-text">${pinned ? 'Kept' : 'Keep'}</span>
      </button>
      <h3 class="field-card__name">${esc(f.name)}</h3>
      <p class="field-card__what">${esc(f.what)}</p>
      <p class="field-card__line"><span class="field-card__label">Where it leads</span>${esc(f.leads)}</p>
      <p class="field-card__line"><span class="field-card__label">Typically needs</span>${esc(f.needs)}</p>
      ${coverageHtml}
      <div class="field-card__actions">
        <button class="field-card__btn" type="button" data-learn-field="${esc(fieldId)}">Learn more →</button>
        <button class="field-card__btn" type="button" data-courses-field="${esc(fieldId)}">Explore courses →</button>
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

// Session memory: which field overviews the student has opened. Powers the
// graduation line ("you've explored N fields").
const _fieldsVisited  = new Set();

// The long-form profile body — the discovery read that now LEADS the
// Field Overview, with admissions material following under its own break.
function fieldProfileHtml(fp) {
  // Prose renderer with a light authoring convention for skimmability:
  // **a bold lead-in phrase** at the head of a micro-paragraph. Escaping
  // happens FIRST, so the markup can never inject anything.
  const paras = txt => String(txt).split('\n\n').map(p =>
    `<p class="fo-prose">${esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`).join('');
  const branches = fp.branches.map(b =>
    `<div class="fo-branch"><strong>${esc(b.name)}.</strong> ${esc(b.blurb)}</div>`).join('');
  const myths = fp.misconceptions.map(m => `
    <div class="fo-myth">
      <p class="fo-myth__myth"><span class="fo-myth__label">People think</span>${esc(m.myth)}</p>
      <p class="fo-myth__reality"><span class="fo-myth__label">Actually</span>${esc(m.reality)}</p>
    </div>`).join('');
  // Career destinations are descriptive context, not actions — a clean,
  // scannable list (each on its own line with a small static marker), never
  // tappable-looking pills and never an unreadable middot run-on.
  const paths = `<ul class="fo-leads">${fp.careers.paths
    .map(p => `<li class="fo-lead">${esc(p)}</li>`).join('')}</ul>`;
  const compares = (fp.oftenComparedWith ?? []).map(c => {
    const other = CATEGORY_LABEL_MAP[c.fieldId] ?? c.fieldId;
    return `
      <button type="button" class="fo-compare" data-compare-field="${esc(c.fieldId)}">
        <span class="fo-compare__title">${esc(fp.name)} vs ${esc(other)}</span>
        <span class="fo-compare__body">${esc(c.howToThinkAboutIt)}</span>
        <span class="fo-compare__go">Read about ${esc(other)} →</span>
      </button>`;
  }).join('');
  // Section list in reading order. The heading accent colour rotates through
  // the four system palette tokens (yellow → coral → sage → lavender) by
  // source index, so adjacent sections always differ — the Teak "candy
  // accents rotating down the page" rhythm, not one flat yellow.
  const sections = [
    { id: 'overview',   nav: 'Overview',           head: 'What it actually is',              body: paras(fp.whatItIs) },
    {                                              head: 'Where it branches',                body: branches },
    { id: 'day',        nav: 'Day in the life',    head: 'A day in the life',                body: paras(fp.dayInTheLife) },
    { id: 'degree',     nav: 'Degree vs school',   head: 'The degree vs the school subject', body: paras(fp.degreeVsSchool) },
    {                                              head: "Who thrives — and who doesn't",    body: paras(fp.whoThrives) },
    { id: 'myths',      nav: 'Misconceptions',     head: 'Misconceptions',                   body: myths },
    { id: 'leads',      nav: 'Where it leads',     head: 'Where it leads',                   body: `${paths}${paras(fp.careers.honestNote)}` },
  ];
  if (compares) sections.push({ head: 'Often compared with', body: `<div class="fo-compares">${compares}</div>` });
  // Supercurricular roadmap — placed after "Often compared with", named to
  // match the Story Bank so the tie-in reads as one idea.
  if (fp.roadmap) {
    sections.push({
      id: 'roadmap', nav: 'Building your story',
      head: `Building your ${fp.name} story`,
      body: fieldRoadmapHtml(fp.roadmap),
      // Explicit accent: this is the LAST profile section, and the admissions
      // block that follows opens on a hardcoded yellow. Sage keeps every
      // adjacent pair distinct across the seam (…lavender → sage → yellow…).
      accent: 'fo-accent-sage',
    });
  }

  const navItems = sections.filter(s => s.nav)
    .map(s => `<a class="fo-anchornav__link" href="#fo-sec-${s.id}" data-fo-anchor="fo-sec-${s.id}">${esc(s.nav)}</a>`)
    .concat(`<a class="fo-anchornav__link" href="#foGateBreak" data-fo-anchor="foGateBreak">Getting in</a>`)
    .join('');
  const nav = `<nav class="fo-anchornav" aria-label="Jump to a section">${navItems}</nav>`;

  return nav + sections.map((s, i) =>
    `<section class="fo-section"${s.id ? ` id="fo-sec-${s.id}"` : ''}><h2 class="fo-section__head ${s.accent ?? FO_HEAD_ACCENTS[i % FO_HEAD_ACCENTS.length]}">${esc(s.head)}</h2>${s.body}</section>`
  ).join('');
}

// "Building your [Field] story" — reading, verified competitions, and
// self-starter project prompts, closing with the Story Bank tie-in.
// Deliberately makes NO claim about what universities require or prefer.
function fieldRoadmapHtml(rm) {
  const reading = (rm.reading ?? []).map(r => `
    <li class="fo-road__item">
      <span class="fo-road__title">${esc(r.title)}</span>
      <span class="fo-road__by">${esc(r.by)}</span>
      <span class="fo-road__note">${esc(r.note)}</span>
    </li>`).join('');
  const comps = (rm.competitions ?? []).map(c => `
    <li class="fo-road__item">
      <span class="fo-road__title">${esc(c.name)}</span>
      <span class="fo-road__note">${esc(c.line)}</span>
      <a class="fo-road__link" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Official site →</a>
    </li>`).join('');
  const projects = (rm.projects ?? []).map(p => `<li class="fo-road__item fo-road__item--plain">${esc(p)}</li>`).join('');

  return `
    <p class="fo-prose fo-road__lead">Depth beats a long list. These are real starting points — pick one you would
      genuinely enjoy, and let it become something you can talk about.</p>
    <div class="fo-road">
      <div class="fo-road__group">
        <h3 class="fo-road__head">Reading &amp; listening</h3>
        <ul class="fo-road__list">${reading}</ul>
      </div>
      <div class="fo-road__group">
        <h3 class="fo-road__head">Competitions &amp; challenges</h3>
        <ul class="fo-road__list">${comps}</ul>
        <p class="fo-road__caveat">Dates and eligibility change each year — check the official page before planning around one.</p>
      </div>
      <div class="fo-road__group">
        <h3 class="fo-road__head">Projects you can start now</h3>
        <ul class="fo-road__list">${projects}</ul>
      </div>
    </div>
    <p class="fo-road__tiein">Done something like this?
      <button type="button" class="fo-road__tiein-btn" data-open-story>Add it to your story →</button></p>`;
}

// Rotating heading-accent classes (see .fo-accent-* in styles.css). Cycled by
// source order so consecutive section headings never share a colour.
const FO_HEAD_ACCENTS = ['fo-accent-yellow', 'fo-accent-coral', 'fo-accent-sage', 'fo-accent-lavender'];

// Jump straight from a field card to that field's course list, skipping the
// profile read. Sets the same exploreField context openFieldOverview would,
// then hands off to the shared Check Combination entry point.
function goToFieldCourses(key, opts = {}) {
  const fieldId = resolveFieldId(key);
  const f = fieldId && STRENGTH_FIELDS[fieldId];
  if (!f) return;

  const stage = (typeof AltioraState !== 'undefined' && AltioraState.getProfile().stage) || DEFAULT_STAGE;
  applyStageChrome(stage);

  state.exploreField = { category: f.category, name: f.name, fieldId };
  _fieldsVisited.add(f.category);
  _overviewFrom = opts.from || 'strengths';
  _overviewStrengths = opts.strengths || [...(_selectedStrengths || [])];

  logEvent('field_card_to_courses', { field: fieldId });
  proceedToCheckFromField();
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
  _fieldsVisited.add(f.category);
  _overviewFrom = opts.from || 'strengths';
  _overviewStrengths = opts.strengths || [...(_selectedStrengths || [])];

  logEvent('field_overview_open', { field: fieldId, from: _overviewFrom });
  switchMode('field-overview');
  renderFieldOverview(fieldId);
  markRoute({ v: 'field', fieldId, from: _overviewFrom });
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
    ? combos.map(({ combo, green, amber }) => {
        // Same honest sizing as the planner: a partial set shows a visible
        // free-choice slot so it never reads as a complete application.
        const free = freeChoiceChipHtml(comboFreeSlots(combo, sys, isQuant));
        return `
        <button type="button" class="fo-combo fo-combo--action" data-combo-tags="${esc(JSON.stringify(combo))}">
          <span class="fo-combo__subjects">${comboLabels(combo, sys, isQuant).map(l => `<span class="fo-chip fo-chip--accent">${esc(l)}</span>`).join('')}${free ? `<span class="fo-chip fo-chip--free">${esc(freeSlotText(comboFreeSlots(combo, sys, isQuant)))}</span>` : ''}</span>
          <span class="fo-combo__count">opens ${green + amber} course${green + amber === 1 ? '' : 's'}<span class="fo-combo__go" aria-hidden="true">→</span></span>
        </button>`;
      }).join('') + planComboNoteHtml(combos, sys, isQuant)
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
  const pinBtn = id => `<button type="button" id="${id}" class="pin-btn${foPinned ? ' pin-btn--on' : ''}"
                aria-pressed="${foPinned}">${foPinned ? '✓ Kept as one of your fields' : 'Keep this field'}</button>`;

  // Deep profile (authored discovery content). When present it LEADS the
  // page; the admissions material follows under "What it takes to get in".
  const fp = (typeof fieldProfiles !== 'undefined') ? fieldProfiles[cat] : null;

  panel.innerHTML = `
    <div class="fo" style="${accent}">
      <header class="fo__header">
        <span class="fo__eyebrow">${fp ? 'Field guide' : 'What this field needs'}</span>
        <h1 class="fo__title">${esc(f.name)}</h1>
        ${fp ? '' : `<p class="fo__desc">${esc(f.what)}</p>`}
        ${alignHtml}
        ${pinBtn('foPinField')}
      </header>

      ${fp ? fieldProfileHtml(fp) : ''}
      ${fp ? `<div class="fo-profile-end">${pinBtn('foPinFieldEnd')}</div>
      <h2 class="fo-gate-break" id="foGateBreak">What it takes to get in</h2>` : ''}

      <section class="fo-section">
        <h2 class="fo-section__head fo-accent-yellow">Subjects this field needs</h2>
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
          ? `<h2 class="fo-section__head fo-accent-coral">Building a strong AP profile</h2>`
          : `<h2 class="fo-section__head fo-accent-coral">Typical strong combinations</h2>
        <div class="fo-combos">${combosHtml}</div>
        ${sys ? '' : `<p class="fo-muted fo-muted--hint">Example combinations shown in general terms — pick your qualification system in Check Combination to see them in your own subjects.</p>`}`}
      </section>

      <section class="fo-section">
        <h2 class="fo-section__head fo-accent-sage">What to expect</h2>
        <p class="fo-expect">${testsLine}</p>
        ${gradeLine ? `<p class="fo-expect">${gradeLine}</p>` : ''}
        ${holisticLine ? `<p class="fo-expect fo-expect--muted">${holisticLine}</p>` : ''}
      </section>

      ${fp ? '' : `
      <section class="fo-section">
        <h2 class="fo-section__head fo-accent-lavender">Where it leads</h2>
        <p class="fo-expect">${esc(f.leads)}</p>
      </section>`}

      <div class="fo-fork">
        <p class="fo-fork__lead">What would you like to do next?</p>
        <div class="fo-fork__choices">
          <div class="fo-choice">
            <button type="button" class="fo-btn fo-btn--primary" id="foSeeCourses">See courses I qualify for →</button>
            <span class="fo-choice__hint">If you've already chosen your subjects</span>
          </div>
          <div class="fo-choice">
            <button type="button" class="fo-btn" id="foPlanSubjects">Help me plan my subjects →</button>
            <span class="fo-choice__hint">If you're still deciding what to take</span>
          </div>
        </div>
        <button type="button" class="fo-back" id="foBack">${esc(backLabel)}</button>
      </div>
    </div>`;

  $('foSeeCourses')?.addEventListener('click', proceedToCheckFromField);
  $('foPlanSubjects')?.addEventListener('click', planForField);

  // Typical strong combinations → Check Combination with those exact subjects.
  panel.querySelectorAll('[data-combo-tags]').forEach(row =>
    row.addEventListener('click', () =>
      checkFieldCombo(cat, JSON.parse(row.dataset.comboTags), sys || AltioraState.getProfile().qualificationSystem)));
  // Keeping from the profile is instant — the candidateFields subscription
  // re-syncs the pin buttons here AND the nav count, so no re-render needed.
  const pinHere = () => togglePinnedField(cat);
  $('foPinField')?.addEventListener('click', pinHere);
  $('foPinFieldEnd')?.addEventListener('click', pinHere);

  // Comparison links navigate between profiles.
  panel.querySelectorAll('[data-compare-field]').forEach(btn =>
    btn.addEventListener('click', () =>
      openFieldOverview(btn.dataset.compareField, { from: _overviewFrom, strengths: _overviewStrengths })));

  // Anchor nav: smooth in-page jumps. Handled rather than left to the native
  // hash so the sticky bar never covers the heading, and so the URL keeps the
  // app's own route rather than gaining a stray fragment.
  panel.querySelectorAll('[data-fo-anchor]').forEach(a =>
    a.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById(a.dataset.foAnchor)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  // Unified back: one step through app history (same as the nav "← Back" and
  // the browser Back button). The label stays contextual; the mechanism is one.
  $('foBack')?.addEventListener('click', appBack);
}

// Action fork → Check Combination, with the field filter active and no
// country assumption. The exploring → building step of the funnel.
// Set the active qualification system for Check Combination and rebuild the
// dependent UI. Shared by the system dropdown and by flows that auto-select a
// system (e.g. arriving from Field Overview). buildSubjectPicker re-applies any
// active field filter, so the exploration context is preserved.
// Field Overview: a "typical strong combination" row → Check Combination with
// those exact subjects, filtered to this field. Reuses the planner's routing
// (switchToPlanCombo), scoped to the single field so the "opens N" count and
// the Check results describe the same set.
function checkFieldCombo(cat, tags, systemKey) {
  logEvent('fo_combo_to_check', { field: cat, subjects: tags });
  enterStage('building');   // the same graduation the "See courses" button uses
  switchToPlanCombo(tags, systemKey, { fields: [cat], resetCountry: true });
}

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
  // "Clear field filter" = show everything: respect that for the session
  // rather than snapping to the My Fields default.
  _categoryTouched = true;
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
  // Cloudflare Web Analytics is a page-view beacon with no custom-event API,
  // so interaction events stay console-only.
  console.log('[Analytics]', eventName, properties);
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
            If the problem persists, <a href="mailto:support@usealtiora.com">contact support</a>.
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

  // Journey bar — clicking a step switches stage exactly as the old
  // dropdown did (enterStage; proposes-never-imprisons untouched). The
  // "Next →" chip runs the existing graduation acceptance. Delegated on
  // the bar container, which persists across innerHTML re-renders.
  $('journeyBar')?.addEventListener('click', e => {
    const nextBtn = e.target.closest('[data-journey-next]');
    if (nextBtn) {
      logEvent('stage_graduate', { to: nextBtn.dataset.journeyNext, via: 'journey_bar' });
      enterStage(nextBtn.dataset.journeyNext);
      return;
    }
    const step = e.target.closest('[data-journey-stage]');
    if (step) enterStage(step.dataset.journeyStage);
  });
  // Reactive: any state change that flips a stage's done-criteria (saving a
  // 3rd course, keeping a field…) re-projects the bar on every screen.
  AltioraState.subscribe(() => renderJourneyBar());

  // Profile pill ("A-Levels · Year 12 ▾") — ONE popover holding the system
  // and year controls; same single-source behaviour and propagation as the
  // two pills it replaces.
  $('profileIndicatorBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleProfileMenu();
  });
  $$('#systemMenu .stage-menu__item').forEach(item =>
    item.addEventListener('click', () => changeSystem(item.dataset.system))
  );
  document.addEventListener('click', closeProfileMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProfileMenu(); });
  // Year items are (re)built inside the popover by updateYearIndicator, which
  // subscribes to state so every year/system change propagates here. Clicks
  // inside the popover must not bubble to the document-close handler.
  $('profileMenu')?.addEventListener('click', e => e.stopPropagation());
  AltioraState.subscribe(updateYearIndicator);

  // Stage proposal (year-informed onboarding): accept routes into the
  // proposed stage; "somewhere else" opens the manual stage cards.
  $('stageProposalAccept')?.addEventListener('click', () => {
    const stage = $('stageProposalAccept').dataset.stage || DEFAULT_STAGE;
    logEvent('stage_proposal_accept', { stage });
    enterStage(stage);
  });
  $('stageProposalManual')?.addEventListener('click', () => {
    logEvent('stage_proposal_manual', {});
    showStageSelect();
  });
  // The in-copy "Exploring fields" door on late-year proposals: the SAME
  // entry path as a manual stage card (enterStage), so the armed subject
  // question fires identically. Delegated — the reason is re-rendered.
  $('stageProposalReason')?.addEventListener('click', e => {
    const link = e.target.closest?.('[data-proposal-goto]');
    if (!link) return;
    logEvent('stage_proposal_explore_link', {});
    enterStage(link.dataset.proposalGoto);
  });
  // Home late-joiner nudge → Exploring fields, via the same enterStage path
  // as the journey-bar steps. Delegated: the home panel re-renders freely.
  document.addEventListener('click', e => {
    if (e.target.closest?.('[data-home-goto-exploring]')) {
      logEvent('home_explore_nudge', {});
      enterStage('exploring');
    }
  });

  // Onboarding subject capture (late years): continue commits the picker
  // selection; "I'll do this later" never gates onboarding.
  $('subjectOnboardContinue')?.addEventListener('click', () => finishSubjectOnboard(false));
  $('subjectOnboardSkip')?.addEventListener('click', () => finishSubjectOnboard(true));

  // Compact picker view: Edit expands (delegated — the summary row re-renders),
  // Done collapses. Session preference only, never persisted.
  // Edit lives in the merged grade-section header (and, for IB/AP, still in
  // the summary row). Delegated on document so both survive re-renders.
  document.addEventListener('click', e => {
    if (e.target.closest?.('#gradeEditSubjects')) {
      state.pickerCollapsed = false;
      syncPickerCollapse();
      $('subjectPickerSection')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  $('subjectSummaryRow')?.addEventListener('click', e => {
    if (e.target.closest('#subjectSummaryEdit')) { state.pickerCollapsed = false; syncPickerCollapse(); }
  });
  $('collapsePickerBtn')?.addEventListener('click', () => { state.pickerCollapsed = true; syncPickerCollapse(); });

  // profile.subjects fan-out: every subject-projecting surface re-renders
  // when the saved subjects change (seeded so init doesn't double-render).
  _lastSubjectsSig = subjectsSig();
  AltioraState.subscribe(syncSubjectSurfaces);

  // Click-away and Escape close the stage menu
  document.addEventListener('click', closeStageMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeStageMenu(); });

  // Saved shortlist: persistent link + live count (kept in sync via the
  // state subscription so it reflects changes from anywhere).
  $('shortlistLink')?.addEventListener('click', () => switchMode('shortlist'));
  AltioraState.subscribe(updateShortlistCount);
  updateShortlistCount();

  // "My fields" indicator — persistent access to the kept candidate fields.
  $('fieldsLink')?.addEventListener('click', e => { e.stopPropagation(); toggleFieldsMenu(); });
  $('fieldsMenu')?.addEventListener('click', e => {
    e.stopPropagation();   // clicks inside the popover shouldn't close it via the document listener
    const openBtn = e.target.closest('[data-open-field]');
    if (openBtn) { closeFieldsMenu(); openFieldOverview(openBtn.dataset.openField, { from: 'strengths' }); return; }
    const rmBtn = e.target.closest('[data-remove-field]');
    if (rmBtn) { togglePinnedField(rmBtn.dataset.removeField); /* subscription re-renders, popover stays open */ }
  });
  document.addEventListener('click', closeFieldsMenu);

  // About pill: tap/click toggles, close control, click-away and Escape
  // dismiss — same popover pattern as the fields menu. Hover-reveal is CSS,
  // on hover-capable devices only.
  const aboutSet = open => {
    $('aboutPanel')?.classList.toggle('open', open);
    $('aboutPill')?.setAttribute('aria-expanded', String(open));
  };
  $('aboutPill')?.addEventListener('click', e => {
    e.stopPropagation();
    aboutSet(!$('aboutPanel')?.classList.contains('open'));
  });
  $('aboutClose')?.addEventListener('click', e => { e.stopPropagation(); aboutSet(false); });
  $('aboutPanel')?.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => aboutSet(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') aboutSet(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFieldsMenu(); });
  // One reactive fan-out keeps EVERY candidateFields surface in sync (nav
  // count/dropdown, field-profile pins, Strengths KEEP buttons, planner grid,
  // home summary) — no per-surface desync possible.
  _lastCandidateSig = (AltioraState.getCandidateFields() || []).join('|');   // seed so init doesn't double-render
  AltioraState.subscribe(syncCandidateFieldSurfaces);
  updateFieldsIndicator();

  // Achievements log: the list is a direct projection of state, re-rendered
  // on every change (same anti-desync pattern as the fan-outs above).
  AltioraState.subscribe(renderAchievementsList);
  AltioraState.subscribe(renderStoryHomeCard);
  AltioraState.subscribe(renderHomeExploreNudge);
  AltioraState.subscribe(updateStoryCount);
  updateStoryCount();
  wireAchievementsEvents();

  // Applying checklist: ticks persist in state, and the list re-projects on
  // every change (a shortlist edit adds/removes tasks without a reload).
  AltioraState.subscribe(renderApplyingChecklist);
  wireApplyingChecklist();
  wireBackupControls();
  wireStatementDrafting();
  AltioraState.subscribe(syncStatementSurface);

  // Workspace home: the wordmark is the home control; delegated actions on the home panel.
  // The wordmark is now a plain link to the landing page (href="./") — no JS.
  // In-app home stays reachable via goHome() callers (Back, journey routing).

  // App-wide back: the nav "← Back" control and the browser Back/Forward
  // buttons (and the mobile back gesture) all resolve through the router.
  $('navBack')?.addEventListener('click', appBack);
  window.addEventListener('popstate', e => {
    const route = e.state && e.state.altiora;
    if (!route) return;                       // not one of our entries — ignore
    _curIdx = (typeof e.state.idx === 'number') ? e.state.idx : 0;
    _restoringRoute = true;
    try { renderRoute(route); } finally { _restoringRoute = false; }
    updateBackControl();
  });
  $('panel-home')?.addEventListener('click', e => {
    const toolBtn = e.target.closest('[data-go-tool]');
    if (toolBtn) { switchMode(toolBtn.dataset.goTool); return; }
    // Graduation: accept moves the stage forward (student's choice, never
    // automatic); "Not yet" dismisses for this session only.
    const gradBtn = e.target.closest('[data-grad-accept]');
    if (gradBtn) {
      logEvent('stage_graduate', { to: gradBtn.dataset.gradAccept });
      enterStage(gradBtn.dataset.gradAccept);
      return;
    }
    if (e.target.closest('[data-grad-later]')) {
      _gradDismissed.add(AltioraState.getProfile().stage || DEFAULT_STAGE);
      logEvent('stage_graduate_later', {});
      renderWorkspaceHome();
      return;
    }
    // Backward orientation: a next-step action can point at a stage.
    const stageBtn = e.target.closest('[data-go-stage]');
    if (stageBtn) { enterStage(stageBtn.dataset.goStage); return; }
    // Content-aware nudge: open a field's profile (the comparison read).
    const fieldBtn = e.target.closest('[data-go-field]');
    if (fieldBtn) { openFieldOverview(fieldBtn.dataset.goField, { from: 'strengths' }); return; }
    if (e.target.closest('[data-change-stage]')) showStageSelect();
  });

  $('planSwitchToCheck').addEventListener('click', () => switchMode('check'));

  // ── Entry router ─────────────────────────────────────────────
  // New users see the stage-selection screen; returning users land on
  // their last stage's primary tool. The "Find my path" CTA from the
  // homepage (?mode=strengths) drops the student straight into the
  // exploring stage.
  // Clear any history state carried across a reload so the first screen below
  // becomes the base app entry (idx 0) — no stale back-stack into pre-reload
  // views, and the first markRoute replaces rather than pushes.
  history.replaceState({}, '');

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
    } else if (_profile.yearsUntilApplication == null) {
      // Old save from before year capture — prompt once (same pattern as the
      // system backfill), then continue as normal.
      showYearSelect();
    } else {
      // Already onboarded with a system and year → genuinely returning.
      _isReturningUser = true;
      showWorkspaceHome();
    }
  } else {
    // Onboarding starts at the qualification system — year labels and the
    // stage proposal both depend on it.
    showSystemSelect();
  }

  // Deep link: ?field=cs (or a category) opens that Field Overview directly.
  const _fieldParam = new URLSearchParams(window.location.search).get('field');
  if (_fieldParam && resolveFieldId(_fieldParam)) {
    openFieldOverview(_fieldParam, { from: 'direct' });
  }
}

init();
