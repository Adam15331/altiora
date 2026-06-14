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
  checkSystem:        '',
  reverseSystem:      'UK_A_Level',
  planCategory:       '',
  planSystem:         '',
  selectedSubjects:   [],
  selectedTags:       new Set(),
  countryFilter:      'All',
  selectedCategories: new Set(),
  searchQuery:        '',
  predictedGrade:     null,
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

// Subjects the user has explicitly deselected despite auto-imply.
// Cleared when the qualification system changes.
const _suppressedAutoImply = new Set();
// True after the user clicks "Dismiss" on the maths warning banner.
// Cleared when system changes or user re-selects standard maths.
let _dismissedMathsWarning = false;
// True when the user explicitly chose "Skip" on the grade selector, or
// cleared a grade they previously entered — suppresses the grade banner.
// Cleared on system change so a fresh context prompts again.
let gradeInputDismissed = false;

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

function renderCheckEmptyState() {
  const el = $('checkEmptyState');
  if (!el) return;
  const show = !!state.checkSystem && state.selectedSubjects.length === 0;
  el.classList.toggle('hidden', !show);
  if (!show) return;
  if (el.dataset.builtFor === state.checkSystem) return;
  el.dataset.builtFor = state.checkSystem;
  const suggestions = EMPTY_SUGGESTIONS[state.checkSystem] ?? EMPTY_SUGGESTIONS.UK_A_Level;
  const sysLabel = qualificationMappings[state.checkSystem]?.systemLabel ?? state.checkSystem;
  el.innerHTML = `
    <div class="check-empty-state__inner">
      <div class="check-empty-state__icon" aria-hidden="true">🎯</div>
      <p class="check-empty-state__heading">Select your subjects above to see matching courses</p>
      <p class="check-empty-state__sub">Not sure where to start? Try one of these ${esc(sysLabel)} combinations:</p>
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
    const ibStr = course.grades?.ib;
    if (!ibStr) return false;
    const studentPts = parseInt(studentGrade, 10);
    if (isNaN(studentPts)) return false;
    const m = ibStr.match(/\d+/);
    if (!m) return false;
    return studentPts < parseInt(m[0], 10);
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

function buildGradeInput(systemKey) {
  const section = $('gradeInputSection');
  if (!section) return;
  state.predictedGrade = null;
  if (!systemKey) { section.classList.add('hidden'); section.innerHTML = ''; return; }

  const tooltipText = "We use this to flag courses where the typical offer is higher than your predicted grades. It's a guide, not a hard filter.";
  const hint        = 'Affects which courses show as strong matches';
  const clearBtn    = '<button type="button" id="clearGradeBtn" class="clear-grade-btn hidden" aria-label="Clear predicted grades">✕ Clear grades</button>';

  function wireSelectGrade(selectId) {
    const sel = $(selectId);
    sel.addEventListener('change', e => {
      state.predictedGrade  = e.target.value || null;
      gradeInputDismissed   = !e.target.value; // Skip = dismissed; grade chosen = not dismissed
      $('clearGradeBtn').classList.toggle('hidden', !state.predictedGrade);
      renderCheckResults();
    });
    $('clearGradeBtn').addEventListener('click', () => {
      state.predictedGrade = null;
      gradeInputDismissed  = true; // user has seen/used grade input — don't nag again
      sel.value = '';
      $('clearGradeBtn').classList.add('hidden');
      renderCheckResults();
    });
  }

  if (systemKey === 'UK_A_Level') {
    section.innerHTML = `
      <div class="grade-input-header">
        <span class="control-label">Your predicted grades</span>
        <span class="grade-input-tooltip" aria-label="${esc(tooltipText)}" tabindex="0" title="${esc(tooltipText)}">ⓘ</span>
        <span class="picker-hint-inline">${hint}</span>
      </div>
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeSelectALevel">Average predicted grade across your A-Level subjects</label>
        <div class="select-wrap">
          <select id="gradeSelectALevel" class="grade-select">
            <option value="">Skip — don't filter by grades</option>
            <option value="A*">A* (predicting mostly A*s)</option>
            <option value="A">A (predicting mostly As)</option>
            <option value="B">B (predicting mostly Bs)</option>
            <option value="C">C (predicting mostly Cs)</option>
            <option value="D">D (predicting mostly Ds)</option>
          </select>
        </div>
      </div>
      ${clearBtn}
    `;
    section.classList.remove('hidden');
    wireSelectGrade('gradeSelectALevel');
  } else if (systemKey === 'IB') {
    section.innerHTML = `
      <div class="grade-input-header">
        <span class="control-label">Your predicted grades</span>
        <span class="grade-input-tooltip" aria-label="${esc(tooltipText)}" tabindex="0" title="${esc(tooltipText)}">ⓘ</span>
        <span class="picker-hint-inline">${hint}</span>
      </div>
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeInputIB">Predicted IB total points (24–45)</label>
        <input type="number" id="gradeInputIB" class="grade-number-input" min="24" max="45" placeholder="e.g. 38" autocomplete="off"/>
      </div>
      ${clearBtn}
    `;
    section.classList.remove('hidden');
    $('gradeInputIB').addEventListener('input', e => {
      const v = parseInt(e.target.value, 10);
      state.predictedGrade = (!isNaN(v) && v >= 24 && v <= 45) ? String(v) : null;
      gradeInputDismissed  = false; // actively entering — reset dismissal
      $('clearGradeBtn').classList.toggle('hidden', !state.predictedGrade);
      renderCheckResults();
    });
    $('clearGradeBtn').addEventListener('click', () => {
      state.predictedGrade = null;
      gradeInputDismissed  = true; // seen/used grade input — don't nag again
      $('gradeInputIB').value = '';
      $('clearGradeBtn').classList.add('hidden');
      renderCheckResults();
    });
  } else if (systemKey === 'US_AP') {
    section.innerHTML = `
      <div class="grade-input-header">
        <span class="control-label">Your predicted grades</span>
        <span class="grade-input-tooltip" aria-label="${esc(tooltipText)}" tabindex="0" title="${esc(tooltipText)}">ⓘ</span>
        <span class="picker-hint-inline">${hint}</span>
      </div>
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeSelectAP">Average predicted AP score across your exams</label>
        <div class="select-wrap">
          <select id="gradeSelectAP" class="grade-select">
            <option value="">Skip — don't filter by grades</option>
            <option value="A*">5 (A*) — predicting mostly 5s</option>
            <option value="A">4 (A) — predicting mostly 4s</option>
            <option value="B">3 (B) — predicting mostly 3s</option>
            <option value="C">2 (C) — predicting mostly 2s</option>
            <option value="D">1 (D) — predicting mostly 1s</option>
          </select>
        </div>
      </div>
      ${clearBtn}
    `;
    section.classList.remove('hidden');
    wireSelectGrade('gradeSelectAP');
  } else if (systemKey === 'SG_A_Level') {
    section.innerHTML = `
      <div class="grade-input-header">
        <span class="control-label">Your predicted grades</span>
        <span class="grade-input-tooltip" aria-label="${esc(tooltipText)}" tabindex="0" title="${esc(tooltipText)}">ⓘ</span>
        <span class="picker-hint-inline">${hint}</span>
      </div>
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeSelectSG">Average predicted grade across your H2 subjects</label>
        <div class="select-wrap">
          <select id="gradeSelectSG" class="grade-select">
            <option value="">Skip — don't filter by grades</option>
            <option value="A">A — predicting mostly As</option>
            <option value="B">B — predicting mostly Bs</option>
            <option value="C">C — predicting mostly Cs</option>
            <option value="D">D — predicting mostly Ds</option>
            <option value="E">E — predicting mostly Es</option>
          </select>
        </div>
      </div>
      ${clearBtn}
    `;
    section.classList.remove('hidden');
    wireSelectGrade('gradeSelectSG');
  } else if (systemKey === 'HK_DSE') {
    section.innerHTML = `
      <div class="grade-input-header">
        <span class="control-label">Your predicted grades</span>
        <span class="grade-input-tooltip" aria-label="${esc(tooltipText)}" tabindex="0" title="${esc(tooltipText)}">ⓘ</span>
        <span class="picker-hint-inline">${hint}</span>
      </div>
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeSelectDSE">Average predicted level across your elective subjects</label>
        <div class="select-wrap">
          <select id="gradeSelectDSE" class="grade-select">
            <option value="">Skip — don't filter by grades</option>
            <option value="5**">5** — predicting mostly 5**s</option>
            <option value="5*">5* — predicting mostly 5*s</option>
            <option value="5">5 — predicting mostly 5s</option>
            <option value="4">4 — predicting mostly 4s</option>
            <option value="3">3 — predicting mostly 3s</option>
            <option value="2">2 — predicting mostly 2s</option>
            <option value="1">1 — predicting mostly 1s</option>
          </select>
        </div>
      </div>
      ${clearBtn}
    `;
    section.classList.remove('hidden');
    wireSelectGrade('gradeSelectDSE');
  } else {
    section.classList.add('hidden');
    section.innerHTML = '';
  }
}

/* ═══════════════════════════════════════════════════════════════
 * ELIGIBILITY ENGINE
 * ═══════════════════════════════════════════════════════════════ */

function classify(course, userTags) {
  const { essential = [], preferred = [] } = course.requirements;
  const missingEssential = essential.filter(t => !userTags.has(t));
  if (missingEssential.length) return { status:'red', missingEssential, missingPreferred:[] };
  const missingPreferred = preferred.filter(t => !userTags.has(t));
  return { status: missingPreferred.length ? 'amber' : 'green', missingEssential:[], missingPreferred };
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

// Minimum tier required per gated mode. Modes not listed are free.
const MODE_TIER_REQUIREMENTS = {
  'personal-statement': ['plus', 'pro'],
  'interview-coach':    ['pro'],
};

function tierAllowsMode(mode) {
  const allowed = MODE_TIER_REQUIREMENTS[mode];
  return !allowed || allowed.includes(_currentTier);
}

function switchMode(mode) {
  // Locked tab: open the pricing modal instead of switching
  if (!tierAllowsMode(mode)) {
    logEvent('locked_tab_click', { mode, tier: _currentTier });
    openPricingModal();
    return;
  }

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
  $('panel-personal-statement').classList.toggle('hidden', mode !== 'personal-statement');
  $('panel-interview-coach')   .classList.toggle('hidden', mode !== 'interview-coach');
  $('panel-applying')          .classList.toggle('hidden', mode !== 'applying');
  $('panel-shortlist')         .classList.toggle('hidden', mode !== 'shortlist');
  $('panel-home')              .classList.toggle('hidden', mode !== 'home');

  // The shortlist and home are cross-stage views, not stage tools —
  // highlight their own controls rather than a stage-tool button.
  $('shortlistLink')?.classList.toggle('shortlist-link--active', mode === 'shortlist');
  $('homeLink')?.classList.toggle('home-link--active', mode === 'home');

  if (mode === 'strengths' && $('strengthsGrid').children.length === 0) {
    renderStrengthsGrid();
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
  applying:  { name: 'Applying',                    primary: 'applying',  secondary: ['personal-statement', 'interview-coach'] },
};

const MODE_LABELS = {
  strengths:            'Start with Strengths',
  plan:                 'Subject Planner',
  reverse:              'Course Finder',
  check:                'Check Combination',
  applying:             'Application Tools',
  'personal-statement': 'Personal Statement',
  'interview-coach':    'Interview Coach',
};

const DEFAULT_STAGE = 'exploring';

// Show the full-screen stage-selection screen (onboarding / re-pick).
function showStageSelect() {
  closeStageMenu();
  $('workspace').classList.add('hidden');
  $('stageSelect').classList.remove('hidden');
}

// Reveal the workspace and set up the stage chrome (indicator + sub-nav)
// for a stage, without choosing which view to show.
function applyStageChrome(stage) {
  if (!STAGES[stage]) stage = DEFAULT_STAGE;
  $('stageSelect').classList.add('hidden');
  $('workspace').classList.remove('hidden');
  closeStageMenu();
  $('stageIndicatorName').textContent = STAGES[stage].name;
  $$('.stage-menu__item').forEach(item =>
    item.classList.toggle('stage-menu__item--current', item.dataset.stage === stage)
  );
  renderStageToolNav(stage);
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

// Persist the chosen stage, mark onboarded, then route there.
function enterStage(stage) {
  if (!STAGES[stage]) stage = DEFAULT_STAGE;
  AltioraState.setStage(stage);
  AltioraState.setOnboarded(true);
  logEvent('stage_select', { stage });
  routeToStage(stage);
}

// Build the per-stage tool sub-nav: primary tool front and centre,
// secondary tools as lighter links. Tier-gated tools show a lock; a
// locked click opens the pricing modal (handled inside switchMode).
function renderStageToolNav(stage) {
  if (!STAGES[stage]) stage = DEFAULT_STAGE;
  const cfg = STAGES[stage];
  const nav = $('stageToolNav');
  if (!nav) return;

  const tools = [cfg.primary, ...cfg.secondary];
  nav.innerHTML = tools.map((mode, i) => {
    const primary = i === 0;
    const locked  = !tierAllowsMode(mode);
    const lock    = locked ? ' <span class="stage-tool__lock" aria-hidden="true">🔒</span>' : '';
    const cls = `stage-tool${primary ? ' stage-tool--primary' : ''}${locked ? ' stage-tool--locked' : ''}`;
    return `<button class="${cls}" data-mode="${mode}">${esc(MODE_LABELS[mode] || mode)}${lock}</button>`;
  }).join('');

  $$('#stageToolNav .stage-tool').forEach(btn =>
    btn.addEventListener('click', () => switchMode(btn.dataset.mode))
  );
}

// Render the saved shortlist inside the Applying placeholder panel.
function renderApplyingPanel() {
  const wrap = $('applyingShortlist');
  if (!wrap) return;
  const ids = (typeof AltioraState !== 'undefined') ? AltioraState.getShortlist() : [];

  if (!ids.length) {
    wrap.innerHTML =
      `<p class="applying-shortlist__empty">No courses shortlisted yet. Switch to “Building my university list” to find courses you qualify for.</p>`;
    return;
  }
  wrap.innerHTML = ids.map(id => {
    const course = (typeof courses !== 'undefined') ? courses.find(c => c.id === id) : null;
    const label  = course ? `${course.name} — ${course.university}` : id;
    return `<div class="applying-shortlist__item">${esc(label)}</div>`;
  }).join('');
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

  panel.innerHTML = buildShortlistInsightsHtml(saved) + `<div id="shortlistGroups"></div>`;

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
    list.forEach(c => grid.appendChild(buildShortlistCard(c)));
    group.appendChild(grid);
    wrap.appendChild(group);
  });
}

// Live, factual insights computed from the saved courses.
function buildShortlistInsightsHtml(saved) {
  const unis      = new Set(saved.map(c => c.university));
  const countries = new Set(saved.map(c => c.country));
  const tests     = new Set();
  saved.forEach(c => (Array.isArray(c.admissionTests) ? c.admissionTests : []).forEach(t => tests.add(t)));
  const gradeRange = shortlistGradeRange(saved);

  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const testsHtml = tests.size
    ? [...tests].sort().map(t => `<span class="shortlist-insight-tag">${esc(t)}</span>`).join(' ')
    : `<span class="text-secondary">None across your saved courses</span>`;

  return `
    <div class="shortlist-insights">
      <h2 class="shortlist-insights__title">Your shortlist at a glance</h2>
      <ul class="shortlist-insights__list">
        <li><strong>${plural(saved.length, 'course', 'courses')}</strong> saved across
            <strong>${plural(unis.size, 'university', 'universities')}</strong> in
            <strong>${plural(countries.size, 'country', 'countries')}</strong></li>
        <li><span class="shortlist-insight-label">Admission tests you'll need:</span> ${testsHtml}</li>
        ${gradeRange ? `<li><span class="shortlist-insight-label">Grade range:</span> <strong>${esc(gradeRange)}</strong></li>` : ''}
      </ul>
    </div>`;
}

// Expresses the requirement spread across saved courses. IB points are
// numeric and span all countries, so they are the primary scale; UK
// A-Level offers are a fallback when no saved course lists IB points.
function shortlistGradeRange(saved) {
  const ibPts = saved.map(c => c.grades?.ib).filter(v => typeof v === 'number' && !isNaN(v));
  if (ibPts.length) {
    const lo = Math.min(...ibPts), hi = Math.max(...ibPts);
    return lo === hi ? `${lo} IB points` : `${lo}–${hi} IB points`;
  }
  const offers = saved.map(c => c.grades?.aLevels).filter(Boolean);
  if (offers.length) {
    const ranked = offers.slice().sort((a, b) => aLevelOfferStrength(a) - aLevelOfferStrength(b));
    const lo = ranked[0], hi = ranked[ranked.length - 1];
    return lo === hi ? `${lo} (A-Level)` : `${lo} to ${hi} (A-Level)`;
  }
  return null;
}

// Total rank of the top three A-Level grades, for ordering offers.
function aLevelOfferStrength(str) {
  return parseALevelGrades(str).slice(0, 3)
    .reduce((sum, g) => sum + (A_LEVEL_RANK[g] ?? 0), 0);
}

// A saved-course card: same visual system and info as a result card,
// with a Remove action instead of a match-status pill.
function buildShortlistCard(course) {
  const flag      = COUNTRY_FLAGS[course.country] ?? '';
  const country   = COUNTRY_LABELS[course.country] ?? course.country;
  const catLabel  = CATEGORY_LABEL_MAP[course.category] ?? course.category;
  const tierLabel = course.universityContext?.tier ? (TIER_LABELS[course.universityContext.tier] ?? null) : null;
  const tests     = Array.isArray(course.admissionTests) ? course.admissionTests : [];

  const card = document.createElement('div');
  card.className = 'course-card course-card--saved';
  card.setAttribute('role', 'listitem');
  card.dataset.category = course.category ?? '';
  card.innerHTML = `
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
      </div>` : ''}
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

  switch (stage) {
    case 'exploring':
      return {
        text: (hasInterests || hasSubjects)
          ? 'Keep exploring the degree paths that fit you.'
          : 'Discover what fits you.',
        actions: [{ tool: 'strengths', label: 'Start with Strengths' }],
      };
    case 'choosing':
      return {
        text: hasSubjects
          ? 'Refine the subjects that keep your options open.'
          : 'Plan your subjects.',
        actions: [{ tool: 'plan', label: 'Subject Planner' }],
      };
    case 'building':
      if (!shortlistCount) return {
        text: 'Find courses you qualify for.',
        actions: [{ tool: 'check', label: 'Check Combination' }],
      };
      return {
        text: `You have ${shortlistCount} saved course${shortlistCount === 1 ? '' : 's'}. Review your list or find more.`,
        actions: [
          { tool: 'shortlist', label: 'Review your shortlist' },
          { tool: 'check',     label: 'Find more courses' },
        ],
      };
    case 'applying':
      return {
        text: shortlistCount
          ? `Work on applications for your ${shortlistCount} saved course${shortlistCount === 1 ? '' : 's'}.`
          : 'Save the courses you want to apply to, then work on your applications.',
        actions: shortlistCount
          ? [{ tool: 'applying', label: 'Open application tools' }, { tool: 'shortlist', label: 'View shortlist' }]
          : [{ tool: 'check', label: 'Find courses to apply to' }],
      };
    default:
      return { text: 'Pick up where you left off.', actions: [] };
  }
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
        <h1 class="home__welcome">Welcome back.</h1>
        <p class="home__stage">You're in the <strong>${esc(cfg.name)}</strong> stage — ${esc(STAGE_SUMMARY[stage] ?? '')}</p>
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
            <div><dt>Subjects</dt><dd>${subjects.length ? esc(subjects.join(', ')) : muted('None selected yet')}</dd></div>
            <div><dt>Predicted grades</dt><dd>${grades ? esc(grades) : muted('Not set yet')}</dd></div>
          </dl>
          <button class="home-card__link" data-go-tool="check">Update profile →</button>
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
  const optHtml = Object.entries(qualificationMappings)
    .map(([k, sys]) => `<option value="${k}">${esc(sys.systemLabel)}</option>`)
    .join('');
  $('checkSystemSelect').innerHTML   = `<option value="">Select your system…</option>${optHtml}`;
  $('reverseSystemSelect').innerHTML = optHtml;
  $('planSystemSelect').innerHTML    = `<option value="">Select your system…</option>${optHtml}`;
}

/* ═══════════════════════════════════════════════════════════════
 * SUBJECT PICKER  (check mode)
 * ═══════════════════════════════════════════════════════════════ */

function buildSubjectPicker(systemKey) {
  const section = $('subjectPickerSection');
  const picker  = $('subjectPicker');
  $('subjectFilterInput').value = '';

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

  // Reset auto-imply suppression and category state when system changes
  selectedSubjectsWithLevel.clear();
  _suppressedAutoImply.clear();
  _dismissedMathsWarning = false;
  gradeInputDismissed = false;
  hideMathsWarningBanner();
  state.selectedCategories.clear();
  $$('#categoryPicker .category-chip').forEach(b => b.classList.remove('active'));
  $('categoryPickerSection').classList.add('hidden');

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

function showMathsWarningBanner(imply) {
  if ($('mathsWarningBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'mathsWarningBanner';
  banner.className = 'maths-warning-banner';
  banner.innerHTML = `
    <span class="maths-warning-banner__msg">Mathematics is required alongside Further Mathematics</span>
    <div class="maths-warning-banner__actions">
      <button class="maths-warning-banner__add" type="button">Add Mathematics (recommended)</button>
      <button class="maths-warning-banner__dismiss" type="button">Dismiss (not recommended for most courses)</button>
    </div>
  `;
  banner.querySelector('.maths-warning-banner__add').addEventListener('click', () => {
    _suppressedAutoImply.delete(imply.standard);
    _dismissedMathsWarning = false;
    const stdInput = Array.from($$('#subjectPicker input')).find(i => i.value === imply.standard);
    if (stdInput) stdInput.checked = true;
    hideMathsWarningBanner();
    onSubjectToggle();
    showToast('Mathematics added — this keeps more course options open');
  });
  banner.querySelector('.maths-warning-banner__dismiss').addEventListener('click', () => {
    _dismissedMathsWarning = true;
    hideMathsWarningBanner();
    showToast('Mathematics suppressed — some courses may be out of reach');
  });
  const pickerSection = $('subjectPickerSection');
  pickerSection.parentNode.insertBefore(banner, pickerSection);
}

function hideMathsWarningBanner() {
  const banner = $('mathsWarningBanner');
  if (banner) banner.remove();
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

  // If user manually deselects the standard maths subject while the advanced
  // one is still selected, record the suppression so we don't re-add it.
  if (imply && changedValue === imply.standard && wasChecked === false) {
    const allInputs = Array.from($$('#subjectPicker input'));
    const advInput  = allInputs.find(i => i.value === imply.advanced);
    if (advInput?.checked) _suppressedAutoImply.add(imply.standard);
  }
  // Clear suppression (and any dismissed state) when the user explicitly re-selects a subject.
  if (changedValue && wasChecked === true) {
    _suppressedAutoImply.delete(changedValue);
    if (imply && changedValue === imply.standard) _dismissedMathsWarning = false;
  }

  // IB mutual exclusivity: when a subject is checked, uncheck any other subject
  // in the same exclusion group and notify the user.
  if (changedValue && wasChecked === true) {
    const group = getExclusionGroup(changedValue, state.checkSystem);
    if (group) {
      $$('#subjectPicker input:checked').forEach(input => {
        if (input.value !== changedValue && group.subjects.includes(input.value)) {
          input.checked = false;
          showToast(`Only one ${group.label} subject allowed. Switched to ${changedValue}.`);
        }
      });
    }
  }

  // Read current checkbox state from DOM.
  state.selectedSubjects = Array.from($$('#subjectPicker input:checked')).map(c => c.value);

  // Apply auto-imply: if advanced maths is selected and standard is not (and not suppressed),
  // programmatically check the standard maths chip.
  const autoAdded = new Set();
  if (imply) {
    const hasAdv  = state.selectedSubjects.includes(imply.advanced);
    const hasStd  = state.selectedSubjects.includes(imply.standard);
    const suppressed = _suppressedAutoImply.has(imply.standard);
    if (hasAdv && !hasStd && !suppressed) {
      const stdInput = Array.from($$('#subjectPicker input')).find(i => i.value === imply.standard);
      if (stdInput) {
        stdInput.checked = true;
        autoAdded.add(imply.standard);
        state.selectedSubjects.push(imply.standard);
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

  const shouldWarn = imply
    && _suppressedAutoImply.has(imply.standard)
    && state.selectedSubjects.includes(imply.advanced)
    && !_dismissedMathsWarning;
  if (shouldWarn) showMathsWarningBanner(imply);
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
}

$('subjectFilterInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  $$('#subjectPicker .subject-chip').forEach(chip => {
    chip.classList.toggle('hidden', !!q && !chip.querySelector('span').textContent.toLowerCase().includes(q));
  });
});

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

function renderCheckResults() {
  if (dataLoadError) return;
  const section = $('checkResultsSection');

  // Mirror the live Check selections into the persisted profile so the
  // workspace home reflects them (runs before the early return so it
  // also captures grade-only and cleared-subject changes).
  syncProfileFromCheck();

  if (state.selectedSubjects.length === 0) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');
  showLoadingSpinner('courseGrid');

  // Yield one frame so the spinner paints before synchronous classification work.
  requestAnimationFrame(() => {

  const minNeeded = MIN_SUBJECTS[state.checkSystem] ?? 3;
  const tooFew    = state.selectedSubjects.length < minNeeded;
  const noGrade   = !state.predictedGrade && !gradeInputDismissed;

  // Remove any existing banners before re-rendering
  section.querySelectorAll('.subject-count-warning, .grade-missing-banner').forEach(el => el.remove());

  if (tooFew) {
    const warn = document.createElement('p');
    warn.className = 'subject-count-warning';
    warn.textContent = state.checkSystem === 'HK_DSE'
      ? 'DSE students typically need 4 core subjects + 2 electives (6 subjects total). Select more subjects for accurate results.'
      : `Universities require a full subject combination — please select at least ${minNeeded} subjects to see accurate results. Results below are indicative only.`;
    $('summaryBar').before(warn);
  }

  if (noGrade) {
    const banner = document.createElement('p');
    banner.className = 'grade-missing-banner';
    banner.textContent = `⚠️ You haven't entered your predicted grades. Results may show courses you don't meet the grade requirements for. Enter your grades above for accurate matching.`;
    $('summaryBar').before(banner);
  }

  const pool = courses
    .filter(c => state.countryFilter === 'All' || c.country === state.countryFilter)
    .filter(c => state.selectedCategories.size === 0 || state.selectedCategories.has(c.category));

  const byStatus = { green: [], amber: [], grey: [], red: [] };
  pool.forEach(course => {
    const result = classify(course, state.selectedTags);
    if (tooFew  && result.status === 'green') result.status = 'amber';
    if (noGrade && result.status === 'green') result.status = 'amber';
    if (state.predictedGrade && (result.status === 'green' || result.status === 'amber')) {
      if (isGradeAboveStudent(course, state.checkSystem, state.predictedGrade)) result.status = 'grey';
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

        // Only downgrade and show warning if there are ACTUAL missing HL subjects
        if (missingHL.length > 0) {
          if (result.status === 'green') result.status = 'amber';
          result.ibHLWarning = missingHL;
        } else {
          result.ibHLWarning = null;
        }
      } else {
        result.ibHLWarning = null;
      }
      // Most universities worldwide expect 3 HL subjects for IB Diploma
      const hlCount = Array.from(selectedSubjectsWithLevel.values()).filter(item => item.isHL).length;
      if (hlCount < 3) {
        if (result.status === 'green') result.status = 'amber';
        if (!result.ibHLWarning) result.ibHLWarning = [];
        result.ibHLWarning.push('Most universities expect at least 3 HL subjects for the full IB Diploma');
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
    const amberLabel = noGrade ? 'Subject matches — enter grades to see strong matches' : 'Possible';
    container.appendChild(buildGroup('amber', amberLabel, byStatus.amber, cardIndex));
    cardIndex += byStatus.amber.length;
  }
  if (byStatus.grey.length) {
    container.appendChild(buildGroup('grey', 'Subject match, but grade threshold is high', byStatus.grey, cardIndex, true));
    cardIndex += byStatus.grey.length;
  }
  if (byStatus.red.length) {
    container.appendChild(buildGroup('red', 'Out of reach', byStatus.red, cardIndex, true));
  }

  hideLoadingSpinner();
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

  const missingTagsHtml = tags =>
    tags.map(t => `<span class="missing-tag">${esc(tagToLocal(t, sys))}</span>`).join(', ');

  let footerHtml = '';
  if (status === 'red' && missingEssential.length) {
    footerHtml = `
      <p class="card-missing card-missing--red">
        <span class="missing-prefix">Needs:</span>
        ${missingTagsHtml(missingEssential)}
      </p>`;
  } else if (status === 'amber' && missingPreferred.length) {
    const topSubject = tagToLocal(missingPreferred[0], sys);
    const extras     = missingPreferred.length > 1
      ? ` <span style="color:var(--text-faint);font-weight:400"> + ${missingPreferred.length - 1} more</span>`
      : '';
    footerHtml = `
      <p class="card-tip">
        <span class="card-tip__icon">💡</span>
        Add <strong>${esc(topSubject)}</strong> to open more doors${extras}
      </p>`;
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
      apWarningHtml = `
      <div class="card-admission-tests">
        <span class="admission-test-tag admission-test-tag--ap-note">Competitive applicants often have ${ctx.minCompetitiveAPs}+ APs · ${apCount} selected — holistic review means exceptions are common <button type="button" class="ap-info-btn" aria-label="${esc(apTooltip)}" title="${esc(apTooltip)}">ⓘ</button></span>
      </div>`;
    }
    if (ctx.recommendedSubjects?.length) {
      apRecsHtml = `<p class="card-ap-recs">Recommended APs for this field: ${ctx.recommendedSubjects.map(s => esc(s)).join(', ')}</p>`;
    }
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

  const card = document.createElement('div');
  card.className = `course-card ${cfg.cardCls}`;
  card.setAttribute('role', 'listitem');
  card.dataset.category = course.category ?? '';

  // Status label icons (SVG, Notion-style)
  const statusIcons = {
    green: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M7 10l2 2 4-4"/></svg>`,
    amber: `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3a7 7 0 0 1 0 14V3z"/><circle cx="10" cy="10" r="7"/></svg>`,
    red:   `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M8 8l4 4M12 8l-4 4"/></svg>`,
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
    ${gradeStr ? `<div class="card-grades">${esc(gradeStr)}</div>` : ''}
    ${ibHlHtml}
    ${apWarningHtml}
    ${tests.length ? `
      <div class="card-admission-tests">
        ${tests.map(t => `<span class="admission-test-tag">${esc(t)} required</span>`).join('')}
      </div>` : ''}
    ${apNoteHtml}
    ${apRecsHtml}
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

$('reverseSystemSelect').addEventListener('change', e => {
  state.reverseSystem = e.target.value;
  if (state.searchQuery) renderReverseResults();
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

  const tagPills = tags => {
    if (!tags.length) return '<span class="text-secondary" style="font-size:13px">None specified</span>';
    return tags.map(t => `<span class="subject-tag">${esc(tagToLocal(t, sys))}</span>`).join('');
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

  // Copy-to-clipboard handler — timerId is scoped per card instance
  let copyTimerId = null;
  card.querySelector('.copy-btn').addEventListener('click', e => {
    e.stopPropagation();
    const btn = e.currentTarget;
    if (btn.classList.contains('copying')) return;
    btn.classList.add('copying');
    navigator.clipboard.writeText(buildRequirementsText(course))
      .then(() => {
        btn.textContent = '✓  Copied!';
        btn.classList.add('copy-btn--done');
        showToast('Requirements copied to clipboard');
        clearTimeout(copyTimerId);
        copyTimerId = setTimeout(() => {
          btn.innerHTML = '⎘&ensp;Copy requirements';
          btn.classList.remove('copy-btn--done', 'copying');
        }, 2200);
      })
      .catch(() => {
        btn.classList.remove('copying');
        showToast('Copy failed — try selecting the text manually');
      });
  });

  return card;
}

/**
 * Build a plain-text representation of a course's requirements,
 * with tags translated to the active reverse system.
 */
function buildRequirementsText(course) {
  const sys     = state.reverseSystem;
  const country = COUNTRY_LABELS[course.country] ?? course.country;
  const fmt     = tags => tags.map(t => tagToLocal(t, sys)).join(', ');
  const { essential = [], preferred = [], useful = [] } = course.requirements;

  const lines = [
    `${course.name}`,
    `${course.university} · ${country} · ${course.degreeLevel}`,
    '',
    `Required:  ${essential.length  ? fmt(essential)  : 'None specified'}`,
    ...(preferred.length ? [`Preferred: ${fmt(preferred)}`] : []),
    ...(useful.length    ? [`Useful:    ${fmt(useful)}`]    : []),
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

function buildPlanCategoryGrid() {
  const grid = $('planCategoryGrid');
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plan-cat-card';
    btn.dataset.category = cat.id;
    btn.innerHTML = `
      <span class="plan-cat-card__icon" aria-hidden="true">${CATEGORY_ICONS[cat.id] ?? cat.icon}</span>
      <span class="plan-cat-card__label">${esc(cat.label)}</span>
    `;
    btn.addEventListener('click', () => {
      $$('#planCategoryGrid .plan-cat-card').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      state.planCategory = cat.id;
      $('planStep2').classList.remove('hidden');
      $('planResults').classList.add('hidden');
      if (state.planSystem) renderPlanResults();
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

function renderPlanResults() {
  if (dataLoadError) return;
  if (!state.planCategory || !state.planSystem) return;

  const catCourses = courses.filter(c => c.category === state.planCategory);
  if (!catCourses.length) {
    $('planEssentials').innerHTML   = '<p class="search-hint">No courses found for this area.</p>';
    $('planCombinations').innerHTML = '';
    $('planResults').classList.remove('hidden');
    return;
  }

  const catLabel = CATEGORY_LABEL_MAP[state.planCategory] ?? state.planCategory;

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

  if (sortedTags.length === 0) {
    $('planEssentials').innerHTML = `
      <h3 class="plan-section-head">Essential subjects</h3>
      <p class="plan-section-sub">No specific subject requirements — ${esc(catLabel)} courses are broadly open.</p>`;
  } else {
    const chipsHtml = sortedTags.map(([tag, count]) => {
      const hlBadge = ibHLTagsForCategory.has(tag)
        ? `<span class="plan-subject-chip__hl">HL</span>`
        : '';
      return `
      <div class="plan-subject-chip">
        <span class="plan-subject-chip__name">${esc(tagToLocal(tag, state.planSystem))}${hlBadge}</span>
        <span class="plan-subject-chip__count">unlocks ${count} course${count !== 1 ? 's' : ''}</span>
      </div>`;
    }).join('');
    $('planEssentials').innerHTML = `
      <h3 class="plan-section-head">Essential subjects</h3>
      <p class="plan-section-sub">Subjects that appear as required across ${esc(catLabel)} courses in our database.</p>
      <div class="plan-essentials-grid">${chipsHtml}</div>
    `;
  }

  /* ── Section 1.5: Critical pairs ── */
  const pairRules = {
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
  const tagPresence = new Set(sortedTags.map(([t]) => t));
  const validPairs = (pairRules[state.planCategory] ?? [])
    .filter(pair => pair.every(t => tagPresence.has(t)));

  if (validPairs.length > 0) {
    const pairsHtml = validPairs.map(pair =>
      `<div class="plan-subject-chip" style="background: var(--color-cat-cs-bg); border-color: var(--color-cat-cs);">
         <span class="plan-subject-chip__name">${pair.map(t => esc(tagToLocal(t, state.planSystem))).join(' + ')}</span>
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

  /* ── Section B: top subject combinations ── */
  const topTags = sortedTags.slice(0, 6).map(([t]) => t);
  const combos  = [];
  for (let size = 2; size <= 4 && combos.length < 20; size++) {
    for (const c of getCombinations(topTags, size)) {
      if (combos.length >= 20) break;
      combos.push(c);
    }
  }

  const scored = combos.map(combo => {
    const tagSet = new Set(combo);
    if (tagSet.has('Mathematics_Advanced')) tagSet.add('Mathematics_Standard');
    let green = 0, amber = 0;
    catCourses.forEach(course => {
      const r = classify(course, tagSet);
      if (r.status === 'green') green++;
      else if (r.status === 'amber') amber++;
    });
    return { combo, green, amber };
  }).sort((a, b) => b.green - a.green || b.amber - a.amber);

  const top5 = scored.slice(0, 5).filter(s => s.green + s.amber > 0);

  if (top5.length === 0) {
    $('planCombinations').innerHTML = '';
  } else {
    const rowsHtml = top5.map(({ combo, green, amber }) => {
      const tags = combo.map(t => `<span class="plan-combo-tag">${esc(tagToLocal(t, state.planSystem))}</span>`).join('');
      return `
        <div class="plan-combo-row" tabindex="0" role="button"
             aria-label="Apply this subject combination in Check Combination mode"
             data-tags="${esc(JSON.stringify(combo))}">
          ${tags}
          <span class="plan-combo-arrow" aria-hidden="true">→</span>
          <div class="plan-combo-results">
            <span class="badge badge--success">✓ ${green}</span>
            ${amber > 0 ? `<span class="badge badge--warning">◑ ${amber}</span>` : ''}
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

function switchToPlanCombo(tags, systemKey) {
  switchMode('check');
  state.checkSystem      = systemKey;
  state.selectedSubjects = [];
  state.selectedTags     = new Set();
  $('checkSystemSelect').value = systemKey;
  buildSubjectPicker(systemKey);

  const targetNames = new Set(tags.map(t => tagToLocal(t, systemKey)));
  $$('#subjectPicker input[type="checkbox"]').forEach(cb => {
    if (targetNames.has(cb.value)) cb.checked = true;
  });

  onSubjectToggle();

  if (state.planCategory) {
    state.selectedCategories.clear();
    state.selectedCategories.add(state.planCategory);
    $$('#categoryPicker .category-chip').forEach(btn => {
      const active = btn.dataset.category === state.planCategory;
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

const STRENGTHS_OPTIONS = [
  {
    id: 'maths_physics',
    label: 'Maths & Physics',
    icon: '📐',
    description: 'You enjoy problem-solving, patterns, and understanding how things work.',
    categories: ['engineering', 'cs', 'physics', 'mathematics'],
  },
  {
    id: 'biology_chemistry',
    label: 'Biology & Chemistry',
    icon: '🧬',
    description: "You're curious about living systems, health, and the molecular world.",
    categories: ['medicine', 'biochemistry', 'pharmacy', 'biological-sciences'],
  },
  {
    id: 'essays_writing',
    label: 'Essay writing & argument',
    icon: '📝',
    description: 'You express ideas clearly, love reading, and can argue both sides.',
    categories: ['law', 'history', 'politics', 'english'],
  },
  {
    id: 'data_code',
    label: 'Data & code',
    icon: '📊',
    description: 'You spot patterns in data and enjoy making computers do the work.',
    categories: ['cs', 'data-science', 'economics', 'statistics'],
  },
  {
    id: 'creative_design',
    label: 'Creative & design',
    icon: '🎨',
    description: 'You think visually and enjoy creating things that are both beautiful and functional.',
    categories: ['architecture', 'design', 'art'],
  },
  {
    id: 'people_society',
    label: 'People & society',
    icon: '👥',
    description: 'You care about how people think, behave, and organise themselves.',
    categories: ['psychology', 'sociology', 'anthropology', 'politics'],
  },
];

// Maps strength category strings to actual course category ids in the data
const _strengthCategoryMap = {
  engineering:          ['engineering'],
  cs:                   ['cs'],
  physics:              ['sciences', 'mathematics'],
  mathematics:          ['mathematics'],
  medicine:             ['medicine'],
  biochemistry:         ['sciences', 'medicine'],
  pharmacy:             ['medicine'],
  'biological-sciences':['sciences', 'medicine'],
  law:                  ['law'],
  history:              ['law'],
  politics:             ['economics', 'law'],
  english:              ['law'],
  'data-science':       ['cs', 'economics'],
  economics:            ['economics', 'business'],
  statistics:           ['mathematics', 'economics'],
  architecture:         ['architecture'],
  design:               ['architecture', 'engineering'],
  art:                  ['architecture'],
  psychology:           ['psychology'],
  sociology:            ['psychology', 'law'],
  anthropology:         ['psychology', 'law'],
};

const _strengthCategoryNames = {
  medicine:     'Medicine & Health',
  cs:           'Computer Science',
  engineering:  'Engineering',
  economics:    'Economics & Finance',
  law:          'Law',
  business:     'Business',
  sciences:     'Natural Sciences',
  psychology:   'Psychology',
  architecture: 'Architecture',
  mathematics:  'Mathematics',
};

function renderStrengthsGrid() {
  const grid = $('strengthsGrid');
  if (!grid) return;
  grid.innerHTML = STRENGTHS_OPTIONS.map(opt => `
    <button class="plan-cat-card" data-strength="${opt.id}">
      <span class="plan-cat-card__icon" style="font-size: 28px;">${opt.icon}</span>
      <span class="plan-cat-card__label">${esc(opt.label)}</span>
      <span class="picker-hint-inline" style="font-size: 11px; margin-top: 6px;">${esc(opt.description)}</span>
    </button>
  `).join('');
  grid.querySelectorAll('.plan-cat-card').forEach(btn => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.plan-cat-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const strength = STRENGTHS_OPTIONS.find(s => s.id === btn.dataset.strength);
      if (strength) renderStrengthsResults(strength);
    });
  });
}

function renderStrengthsResults(strength) {
  if (dataLoadError) return;
  const resultsDiv = $('strengthsSuggestions');
  const section    = $('strengthsResults');

  const targetCategories = new Set();
  strength.categories.forEach(cat => {
    (_strengthCategoryMap[cat] || [cat]).forEach(m => targetCategories.add(m));
  });

  // Collect up to 12 total across all categories (not 3 per category)
  const allMatched = [];
  for (const cat of targetCategories) {
    for (const c of courses.filter(c => c.category === cat)) {
      if (allMatched.length >= 12) break;
      allMatched.push(c);
    }
  }

  if (!allMatched.length) {
    resultsDiv.innerHTML = '<p class="search-hint">No matching courses found. Try another strength.</p>';
    section.classList.remove('hidden');
    return;
  }

  function buildCardHtml(course) {
    return `
      <div class="course-card course-card--green">
        <div class="card-status card-status--green">Suggested for you</div>
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-flag">${COUNTRY_FLAGS[course.country] ?? ''}</span>
            <div class="card-titles">
              <div class="card-name">${esc(course.name)}</div>
              <div class="card-uni">${esc(course.university)}</div>
            </div>
          </div>
        </div>
        <div class="card-meta">
          <span>${esc(COUNTRY_LABELS[course.country] ?? course.country)}</span>
          <span class="card-meta-sep">·</span>
          <span>${esc(course.degreeLevel)}</span>
        </div>
        <button class="copy-btn" style="margin-top: var(--space-3); width: 100%; justify-content: center; border-color: var(--color-match-strong); color: var(--color-match-strong);"
                data-explore-course="${esc(course.id)}">Explore this course →</button>
      </div>`;
  }

  function buildGroupedHtml(courseList) {
    const grouped = {};
    courseList.forEach(c => { (grouped[c.category] ??= []).push(c); });
    let html = '';
    for (const [cat, catCourses] of Object.entries(grouped)) {
      const catName = _strengthCategoryNames[cat] || cat;
      html += `
        <div class="results-group">
          <h2 class="results-group__header">${esc(catName)}</h2>
          <div class="results-group__grid">${catCourses.map(buildCardHtml).join('')}</div>
        </div>`;
    }
    return html;
  }

  function attachExploreListeners() {
    resultsDiv.querySelectorAll('[data-explore-course]').forEach(btn => {
      btn.addEventListener('click', () => {
        const course = courses.find(c => c.id === btn.dataset.exploreCourse);
        if (!course) return;
        logEvent('strengths_explore', {
          strength:    strength.id,
          course_name: course.name,
          university:  course.university,
        });
        switchMode('reverse');
        const searchInput = $('courseSearchInput');
        if (searchInput) {
          searchInput.value = course.name;
          state.searchQuery = course.name;
          renderReverseResults();
          const resultsSection = $('reverseResultsSection');
          if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  const initial = allMatched.slice(0, 3);
  const rest    = allMatched.slice(3);

  let html = buildGroupedHtml(initial);
  if (rest.length > 0) {
    html += `<button class="plan-switch-link" id="strengthsShowMore"
               style="display: block; margin: var(--space-4) auto; font-size: var(--text-sm);">
               Show more suggestions (+${rest.length} more)
             </button>`;
  }

  resultsDiv.innerHTML = html;
  section.classList.remove('hidden');
  attachExploreListeners();

  if (rest.length > 0) {
    const showMoreBtn = $('strengthsShowMore');
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', () => {
        resultsDiv.innerHTML = buildGroupedHtml(allMatched);
        attachExploreListeners();
      });
    }
  }
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
 * TIER / PRICING
 * ═══════════════════════════════════════════════════════════════ */

const TIER_NAV_LABELS = { free: '✨ Upgrade', plus: '⭐ Plus', pro: '⭐ Pro' };

let _currentTier = localStorage.getItem('altiora_tier') || 'free';

function updateTierUI() {
  const btn = $('upgradeTierBtn');
  if (!btn) return;
  btn.textContent = TIER_NAV_LABELS[_currentTier] ?? '✨ Upgrade';
  btn.classList.toggle('nav__upgrade-btn--active', _currentTier !== 'free');

  // Mark the current plan card inside the modal
  document.querySelectorAll('.pricing-card').forEach(card => {
    const isCurrent = card.dataset.tier === _currentTier;
    card.classList.toggle('pricing-card--current', isCurrent);
    const cardBtn = card.querySelector('.pricing-card__btn');
    if (cardBtn) {
      cardBtn.classList.toggle('pricing-card__btn--current', isCurrent);
      cardBtn.textContent = isCurrent ? 'Current plan' : `Select ${card.querySelector('.pricing-card__name').textContent}`;
    }
  });

  // Locked/unlocked panel content
  const psOk = tierAllowsMode('personal-statement');
  const icOk = tierAllowsMode('interview-coach');
  $('psUnlocked')?.classList.toggle('hidden', !psOk);
  $('psLocked')  ?.classList.toggle('hidden',  psOk);
  $('icUnlocked')?.classList.toggle('hidden', !icOk);
  $('icLocked')  ?.classList.toggle('hidden',  icOk);

  // Refresh the stage sub-nav so tier locks reflect the new tier,
  // preserving which tool is currently active.
  if (typeof AltioraState !== 'undefined' && !$('workspace')?.classList.contains('hidden')) {
    const stage = AltioraState.getProfile().stage;
    if (stage && STAGES[stage]) {
      renderStageToolNav(stage);
      $$('#stageToolNav .stage-tool').forEach(btn =>
        btn.classList.toggle('stage-tool--active', btn.dataset.mode === state.mode));
    }
  }
}

function openPricingModal() {
  updateTierUI();
  $('pricingOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  $('pricingClose').focus();
}

function closePricingModal() {
  $('pricingOverlay').classList.add('hidden');
  document.body.style.overflow = '';
  $('upgradeTierBtn').focus();
}

// Clears all demo state (tier, saved draft, interview history) and reloads.
// Removes only altiora_* keys rather than localStorage.clear() so nothing
// else on the origin is affected.
function resetDemoData() {
  ['altiora_tier', 'altiora_personal_statement', 'altiora_interview_history']
    .forEach(k => localStorage.removeItem(k));
  window.location.reload();
}

function setTier(tier) {
  _currentTier = tier;
  localStorage.setItem('altiora_tier', tier);
  // Bounce away from any now-locked tool BEFORE updating panel content,
  // so the locked state never flashes inside a still-visible panel.
  // Bounce to the current stage's primary tool (always free) to keep
  // the student in their stage rather than yanking them to strengths.
  if (!tierAllowsMode(state.mode)) {
    const stage = (typeof AltioraState !== 'undefined') ? AltioraState.getProfile().stage : null;
    const primary = (stage && STAGES[stage]) ? STAGES[stage].primary : 'strengths';
    switchMode(primary);
  }
  updateTierUI();
  closePricingModal();
  if (tier === 'free') {
    showToast('Reset to Free plan');
  } else {
    const name = tier.charAt(0).toUpperCase() + tier.slice(1);
    showToast(`You are now on the ${name} plan (demo mode — no charges)`);
  }
}

/* ═══════════════════════════════════════════════════════════════
 * PERSONAL STATEMENT COACH  (Plus/Pro — mock AI, demo only)
 * ═══════════════════════════════════════════════════════════════ */

const PS_STORAGE_KEY = 'altiora_personal_statement';
const PS_MOCK_DELAY  = 1500;

// Canned rewrite shown for any selection — replace with real API later.
const PS_MOCK_IMPROVED = 'During a week of work experience on a stroke ward, I watched a physiotherapist coax a patient through her first steps after surgery — that moment crystallised exactly why I want to study medicine.';

let _psRewriteRange = null;   // { start, end } of the selection being rewritten
let _psSpinnerEl    = null;

function updatePsCharCount() {
  const ta = $('psTextarea');
  $('psCharCount').textContent = `${ta.value.length} / 4000`;
}

function psShowSpinner(beforeEl) {
  psHideSpinner();
  _psSpinnerEl = document.createElement('div');
  _psSpinnerEl.className = 'loading-spinner';
  _psSpinnerEl.setAttribute('aria-hidden', 'true');
  beforeEl.before(_psSpinnerEl);
}

function psHideSpinner() {
  _psSpinnerEl?.remove();
  _psSpinnerEl = null;
}

function initPersonalStatement() {
  const ta = $('psTextarea');
  if (!ta) return;

  // Restore saved draft
  const saved = localStorage.getItem(PS_STORAGE_KEY);
  if (saved) ta.value = saved;
  updatePsCharCount();

  ta.addEventListener('input', updatePsCharCount);

  $('psSaveBtn').addEventListener('click', () => {
    localStorage.setItem(PS_STORAGE_KEY, ta.value);
    showToast('Draft saved');
    logEvent('ps_draft_save', { length: ta.value.length });
  });

  $('psFeedbackBtn').addEventListener('click', () => {
    if (!ta.value.trim()) {
      showToast('Write or paste a draft first');
      return;
    }
    const btn = $('psFeedbackBtn');
    btn.disabled = true;
    $('psFeedback').classList.add('hidden');
    psShowSpinner($('psFeedback'));
    logEvent('ps_feedback_request', { length: ta.value.length });
    setTimeout(() => {
      psHideSpinner();
      btn.disabled = false;
      $('psFeedback').classList.remove('hidden');
      $('psFeedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, PS_MOCK_DELAY);
  });

  $('psRewriteBtn').addEventListener('click', () => {
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const selected = ta.value.slice(start, end).trim();
    if (!selected) {
      showToast('Highlight some text in your draft first');
      return;
    }
    _psRewriteRange = { start, end };
    const btn = $('psRewriteBtn');
    btn.disabled = true;
    $('psRewriteResult').classList.add('hidden');
    psShowSpinner($('psRewriteResult'));
    logEvent('ps_rewrite_request', { length: selected.length });
    setTimeout(() => {
      psHideSpinner();
      btn.disabled = false;
      $('psRewriteOriginal').textContent = selected;
      $('psRewriteImproved').textContent = PS_MOCK_IMPROVED;
      $('psRewriteResult').classList.remove('hidden');
      $('psRewriteResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, PS_MOCK_DELAY);
  });

  $('psApplyRewriteBtn').addEventListener('click', () => {
    if (!_psRewriteRange) return;
    const { start, end } = _psRewriteRange;
    ta.value = ta.value.slice(0, start) + PS_MOCK_IMPROVED + ta.value.slice(end);
    _psRewriteRange = null;
    $('psRewriteResult').classList.add('hidden');
    updatePsCharCount();
    showToast('Rewrite applied to draft');
  });
}

/* ═══════════════════════════════════════════════════════════════
 * INTERVIEW COACH  (Pro — mock AI, demo only)
 * ═══════════════════════════════════════════════════════════════ */

const IC_STORAGE_KEY = 'altiora_interview_history';
const IC_AI_DELAY    = 900;

const IC_QUESTIONS = [
  'Why do you want to study Computer Science?',
  'Tell me about a time you solved a difficult problem.',
  'What recent development in your field excites you most, and why?',
  'How would you explain a complex technical concept to someone non-technical?',
  'A classmate asks to copy your coursework. What do you do, and why?',
];

const IC_FOLLOW_UPS = [
  'Interesting — and what first sparked that interest?',
  'Good example. What would you do differently next time?',
  'Nice choice. How do you keep up with developments like that?',
  'Clear explanation. Communication matters as much as knowledge.',
  'Ethics questions rarely have one right answer — reasoning is what counts.',
];

// Canned model answers surfaced for the weakest responses in the results screen.
const IC_SUGGESTED_ANSWERS = [
  'Tie your motivation to a concrete moment — a project you built, a problem that hooked you — rather than general enthusiasm.',
  'Use the STAR structure: Situation, Task, Action, Result. Name the obstacle and quantify the outcome.',
  'Pick one specific development, explain what it changes, and connect it to something you have read or tried yourself.',
  'Use an analogy from everyday life, check understanding as you go, and avoid jargon entirely.',
  'Acknowledge the conflict between loyalty and integrity, state your decision clearly, and explain the principle behind it.',
];

const IC_MOCK_TRANSCRIPT = 'Mock transcript: I am passionate about this subject because of a project I built last year that solved a real problem for my school.';

let _icQuestionIndex = -1;        // -1 = not started
let _icAnswers       = [];
let _icVoiceMode     = false;

function icAddMessage(role, text) {
  const chat = $('icChat');
  const msg  = document.createElement('div');
  msg.className = `ic-msg ic-msg--${role}`;
  msg.innerHTML = `<span class="ic-msg__who">${role === 'ai' ? '🎓 Interviewer' : 'You'}</span><p>${esc(text)}</p>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function icAskCurrentQuestion() {
  icAddMessage('ai', `Question ${_icQuestionIndex + 1} of ${IC_QUESTIONS.length}: ${IC_QUESTIONS[_icQuestionIndex]}`);
}

function icStart() {
  _icQuestionIndex = 0;
  _icAnswers       = [];
  $('icChat').innerHTML = '';
  $('icChat').classList.remove('hidden');
  $('icInputBar').classList.remove('hidden');
  $('icResults').classList.add('hidden');
  $('icStartBtn').textContent = 'Restart Interview';
  icAddMessage('ai', "Welcome! I'll ask you 5 questions. Take your time — answer as you would in a real interview.");
  icAskCurrentQuestion();
  $('icAnswerInput').focus();
  logEvent('ic_interview_start', { mode: _icVoiceMode ? 'voice' : 'text' });
}

// Score from answer lengths: detailed answers score higher (demo heuristic).
function icComputeScore() {
  const avg = _icAnswers.reduce((s, a) => s + a.length, 0) / _icAnswers.length;
  if (avg < 50)  return 55;
  if (avg < 150) return 68;
  return 78;
}

function icFinish() {
  $('icInputBar').classList.add('hidden');
  const score   = icComputeScore();
  const brief   = score < 78;

  // Two shortest answers get suggested model answers
  const ranked = _icAnswers
    .map((a, i) => ({ i, len: a.length }))
    .sort((a, b) => a.len - b.len)
    .slice(0, 2)
    .sort((a, b) => a.i - b.i);

  const suggestionsHtml = ranked.map(({ i }) => `
    <div class="ic-suggestion">
      <p class="ic-suggestion__q">Q${i + 1}: ${esc(IC_QUESTIONS[i])}</p>
      <p class="ic-suggestion__a">${esc(IC_SUGGESTED_ANSWERS[i])}</p>
    </div>`).join('');

  $('icResults').innerHTML = `
    <div class="ps-feedback__header">
      <h4 class="ps-section-head">Interview Results</h4>
      <span class="ps-score">Score: <strong>${score}/100</strong></span>
    </div>
    <div class="ps-feedback__group ps-feedback__group--strengths">
      <span class="ps-feedback__label">Strengths</span>
      <ul><li>Clear answers</li><li>Good subject knowledge</li></ul>
    </div>
    <div class="ps-feedback__group ps-feedback__group--weaknesses">
      <span class="ps-feedback__label">Weaknesses</span>
      <ul>
        ${brief ? '<li>Answers were too brief — aim for 3–4 sentences with a concrete example</li>' : '<li>Needs more concise responses</li>'}
        <li>Hesitation on ethics</li>
      </ul>
    </div>
    <div class="ps-feedback__group ps-feedback__group--suggestions">
      <span class="ps-feedback__label">Suggested answers for your weakest questions</span>
      ${suggestionsHtml}
    </div>
    <p class="ps-feedback__disclaimer">Demo feedback — score is based only on answer length. Real AI analysis coming soon.</p>`;
  $('icResults').classList.remove('hidden');
  $('icResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Persist to interview history
  const history = JSON.parse(localStorage.getItem(IC_STORAGE_KEY) ?? '[]');
  history.push({
    date: new Date().toISOString(),
    mode: _icVoiceMode ? 'voice' : 'text',
    score,
    answers: _icAnswers,
  });
  localStorage.setItem(IC_STORAGE_KEY, JSON.stringify(history));
  logEvent('ic_interview_complete', { score, mode: _icVoiceMode ? 'voice' : 'text' });
}

function icHandleSend() {
  const input  = $('icAnswerInput');
  const answer = input.value.trim();
  if (!answer) {
    showToast('Type an answer first');
    return;
  }
  icAddMessage('user', answer);
  _icAnswers.push(answer);
  input.value = '';

  const qIdx = _icQuestionIndex;
  $('icSendBtn').disabled = true;

  setTimeout(() => {
    icAddMessage('ai', IC_FOLLOW_UPS[qIdx]);
    _icQuestionIndex += 1;
    if (_icQuestionIndex < IC_QUESTIONS.length) {
      setTimeout(() => {
        icAskCurrentQuestion();
        $('icSendBtn').disabled = false;
        $('icAnswerInput').focus();
      }, IC_AI_DELAY);
    } else {
      $('icSendBtn').disabled = false;
      setTimeout(icFinish, IC_AI_DELAY);
    }
  }, IC_AI_DELAY);
}

function initInterviewCoach() {
  if (!$('icStartBtn')) return;

  $('icStartBtn').addEventListener('click', icStart);
  $('icSendBtn').addEventListener('click', icHandleSend);

  // Enter sends (Shift+Enter for newline)
  $('icAnswerInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!$('icSendBtn').disabled) icHandleSend();
    }
  });

  // Text / Voice mode toggle
  const setMode = voice => {
    _icVoiceMode = voice;
    $('icTextModeBtn').classList.toggle('active', !voice);
    $('icVoiceModeBtn').classList.toggle('active', voice);
    $('icTextModeBtn').setAttribute('aria-pressed', String(!voice));
    $('icVoiceModeBtn').setAttribute('aria-pressed', String(voice));
    $('icSpeakBtn').classList.toggle('hidden', !voice);
  };
  $('icTextModeBtn').addEventListener('click', () => setMode(false));
  $('icVoiceModeBtn').addEventListener('click', () => setMode(true));

  // Mock speech-to-text. Real implementation would use the Web Speech API:
  //   const rec = new (window.SpeechRecognition ?? window.webkitSpeechRecognition)();
  //   rec.onresult = e => { input.value = e.results[0][0].transcript; };
  $('icSpeakBtn').addEventListener('click', () => {
    const btn = $('icSpeakBtn');
    btn.disabled = true;
    btn.textContent = '🎙 Listening…';
    setTimeout(() => {
      $('icAnswerInput').value = IC_MOCK_TRANSCRIPT;
      btn.disabled = false;
      btn.textContent = '🎙 Speak';
      $('icAnswerInput').focus();
    }, 1200);
  });
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
  $('reverseSystemSelect').value = 'UK_A_Level';
  buildCountryFilterBar();
  buildCategoryPicker();
  buildPlanCategoryGrid();

  // Pricing modal
  $('upgradeTierBtn')?.addEventListener('click', openPricingModal);
  $('pricingClose')?.addEventListener('click', closePricingModal);
  $('pricingOverlay')?.addEventListener('click', e => { if (e.target === $('pricingOverlay')) closePricingModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('pricingOverlay').classList.contains('hidden')) closePricingModal(); });
  updateTierUI();
  initPersonalStatement();
  initInterviewCoach();

  // Stage selection cards (onboarding)
  $$('#stageSelect .stage-card').forEach(card =>
    card.addEventListener('click', () => enterStage(card.dataset.stage))
  );

  // Stage indicator dropdown (switch stage anytime)
  $('stageIndicatorBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleStageMenu();
  });
  $$('#stageMenu .stage-menu__item').forEach(item =>
    item.addEventListener('click', () => enterStage(item.dataset.stage))
  );
  // Click-away and Escape close the stage menu
  document.addEventListener('click', closeStageMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeStageMenu(); });

  // Saved shortlist: persistent link + live count (kept in sync via the
  // state subscription so it reflects changes from anywhere).
  $('shortlistLink')?.addEventListener('click', () => switchMode('shortlist'));
  AltioraState.subscribe(updateShortlistCount);
  updateShortlistCount();

  // Workspace home: persistent link + delegated actions on the home panel.
  $('homeLink')?.addEventListener('click', () => switchMode('home'));
  $('panel-home')?.addEventListener('click', e => {
    const toolBtn = e.target.closest('[data-go-tool]');
    if (toolBtn) { switchMode(toolBtn.dataset.goTool); return; }
    if (e.target.closest('[data-change-stage]')) showStageSelect();
  });

  $('checkSystemSelect').addEventListener('change', e => {
    state.checkSystem      = e.target.value;
    state.selectedSubjects = [];
    state.selectedTags     = new Set();
    state.predictedGrade   = null;
    selectedSubjectsWithLevel.clear();
    $('checkResultsSection').classList.add('hidden');
    const emptyEl = $('checkEmptyState');
    if (emptyEl) delete emptyEl.dataset.builtFor;
    buildSubjectPicker(state.checkSystem);
    // Mirror to reverse panel so both start on the same system
    $('reverseSystemSelect').value = state.checkSystem;
    state.reverseSystem = state.checkSystem;
    if (state.searchQuery) renderReverseResults();
    syncProfileFromCheck();
  });

  $('planSystemSelect').addEventListener('change', e => {
    state.planSystem = e.target.value;
    if (state.planCategory && state.planSystem) renderPlanResults();
  });

  $('planSwitchToCheck').addEventListener('click', () => switchMode('check'));

  // ── Entry router ─────────────────────────────────────────────
  // New users see the stage-selection screen; returning users land on
  // their last stage's primary tool. The "Find my path" CTA from the
  // homepage (?mode=strengths) drops the student straight into the
  // exploring stage.
  if (window.sessionStorage.getItem('openStrengthsMode') === 'true') {
    window.sessionStorage.removeItem('openStrengthsMode');
    enterStage('exploring');
  } else if (AltioraState.getState().meta.hasOnboarded) {
    // Returning user → workspace home (their resume / next-step base).
    showWorkspaceHome();
  } else {
    showStageSelect();
  }
}

init();
