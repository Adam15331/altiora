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

/* ─── State ─────────────────────────────────────────────────────
 * Single source of truth. Read everywhere; mutate only in named
 * handler functions so the render path stays predictable.
 * ─────────────────────────────────────────────────────────────── */
const state = {
  mode:               'check',
  checkSystem:        '',
  reverseSystem:      '',
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
const COUNTRY_FLAGS  = { UK:'🇬🇧', US:'🇺🇸', CA:'🇨🇦', Netherlands:'🇳🇱', Singapore:'🇸🇬', Hong_Kong:'🇭🇰' };
const COUNTRY_LABELS = { UK:'UK',  US:'US',  CA:'Canada', Netherlands:'Netherlands', Singapore:'Singapore', Hong_Kong:'Hong Kong' };

// Minimum number of subjects required before results can show as GREEN.
// Below this threshold results are capped at AMBER — no university admits on 1-2 subjects alone.
const MIN_SUBJECTS = {
  UK_A_Level:   3,
  IB:           5,
  US_AP:        4,
  NL_VWO:       4,
  SG_A_Level:   3,
  HK_DSE:       5,
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
  NL_VWO:     'vwo',
  SG_A_Level: 'sgALevels',
  HK_DSE:     'hkDse',
};

const CATEGORY_LABEL_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

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
  if (!systemKey) return humanTag(tag);
  const options = getReverseMap(systemKey)[tag];
  if (!options?.length) return humanTag(tag);
  return [...options].sort((a, b) => {
    const byScore = subjectDisplayScore(b) - subjectDisplayScore(a);
    if (byScore !== 0) return byScore;
    const byLen = b.length - a.length;
    return byLen !== 0 ? byLen : a.localeCompare(b);
  })[0];
}

function humanTag(tag) { return tag.replace(/_/g, ' '); }

/* ═══════════════════════════════════════════════════════════════
 * TAG DERIVATION
 * ═══════════════════════════════════════════════════════════════ */

function deriveTagsFromSubjects(subjects, systemKey) {
  const forward = qualificationMappings[systemKey]?.subjects ?? {};
  const tags = new Set();
  for (const name of subjects) { const t = forward[name]; if (t) tags.add(t); }
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
  NL_VWO: [
    { label: 'Wiskunde B + Scheikunde + Biologie',           subjects: ['Wiskunde B','Scheikunde','Biologie'] },
    { label: 'Wiskunde B + Natuurkunde + Informatica',       subjects: ['Wiskunde B','Natuurkunde','Informatica'] },
    { label: 'Economie + Geschiedenis + Maatschappijwetenschappen', subjects: ['Economie','Geschiedenis','Maatschappijwetenschappen'] },
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

function parseALevelGrades(str) {
  return (str ?? '').match(/A\*|[A-E]/g) ?? [];
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
  return false;
}

function buildGradeInput(systemKey) {
  const section = $('gradeInputSection');
  if (!section) return;
  state.predictedGrade = null;
  if (!systemKey) { section.classList.add('hidden'); section.innerHTML = ''; return; }

  const tooltipText = "We use this to flag courses where the typical offer is higher than your predicted grades. It's a guide, not a hard filter.";

  if (systemKey === 'UK_A_Level') {
    section.innerHTML = `
      <div class="grade-input-header">
        <span class="control-label">Your predicted grades</span>
        <span class="grade-input-tooltip" aria-label="${esc(tooltipText)}" tabindex="0" title="${esc(tooltipText)}">ⓘ</span>
        <span class="picker-hint-inline">Optional — flags courses likely out of grade range</span>
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
    `;
    section.classList.remove('hidden');
    $('gradeSelectALevel').addEventListener('change', e => {
      state.predictedGrade = e.target.value || null;
      renderCheckResults();
    });
  } else if (systemKey === 'IB') {
    section.innerHTML = `
      <div class="grade-input-header">
        <span class="control-label">Your predicted grades</span>
        <span class="grade-input-tooltip" aria-label="${esc(tooltipText)}" tabindex="0" title="${esc(tooltipText)}">ⓘ</span>
        <span class="picker-hint-inline">Optional — flags courses likely out of grade range</span>
      </div>
      <div class="grade-input-body">
        <label class="grade-option-label" for="gradeInputIB">Predicted IB total points (24–45)</label>
        <input type="number" id="gradeInputIB" class="grade-number-input" min="24" max="45" placeholder="e.g. 38" autocomplete="off"/>
      </div>
    `;
    section.classList.remove('hidden');
    $('gradeInputIB').addEventListener('input', e => {
      const v = parseInt(e.target.value, 10);
      state.predictedGrade = (!isNaN(v) && v >= 24 && v <= 45) ? String(v) : null;
      renderCheckResults();
    });
  } else {
    section.innerHTML = `
      <div class="grade-input-header">
        <span class="control-label">Your predicted grades</span>
        <span class="picker-hint-inline">Grade filtering coming soon for this system</span>
      </div>
    `;
    section.classList.remove('hidden');
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
 * MODE TOGGLE
 * ═══════════════════════════════════════════════════════════════ */

function switchMode(mode) {
  state.mode = mode;
  $$('.mode-btn').forEach(btn => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  $('panel-check')  .classList.toggle('hidden', mode !== 'check');
  $('panel-reverse').classList.toggle('hidden', mode !== 'reverse');
  $('panel-plan')   .classList.toggle('hidden', mode !== 'plan');
}

/* ═══════════════════════════════════════════════════════════════
 * SYSTEM DROPDOWNS
 * ═══════════════════════════════════════════════════════════════ */

function populateSystemSelects() {
  const optHtml = Object.entries(qualificationMappings)
    .map(([k, sys]) => `<option value="${k}">${esc(sys.systemLabel)}</option>`)
    .join('');
  $('checkSystemSelect').innerHTML   = `<option value="">Select your system…</option>${optHtml}`;
  $('reverseSystemSelect').innerHTML = `<option value="">Show as universal tags</option>${optHtml}`;
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
    label.innerHTML = `<input type="checkbox" value="${esc(name)}"><span>${esc(name)}</span>`;
    label.querySelector('input').addEventListener('change', onSubjectToggle);
    frag.appendChild(label);
  });

  picker.innerHTML = '';
  picker.appendChild(frag);
  section.classList.remove('hidden');

  // Reset category state when system changes
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

function onSubjectToggle() {
  state.selectedSubjects = Array.from($$('#subjectPicker input:checked')).map(c => c.value);
  state.selectedTags     = deriveTagsFromSubjects(state.selectedSubjects, state.checkSystem);
  $$('#subjectPicker .subject-chip').forEach(chip =>
    chip.classList.toggle('selected', chip.querySelector('input').checked)
  );
  syncSubjectCount();
  $('categoryPickerSection').classList.toggle('hidden', state.selectedSubjects.length === 0);
  renderCheckEmptyState();
  clearTimeout(_subjectDebounce);
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
  const section = $('checkResultsSection');

  if (state.selectedSubjects.length === 0) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  const minNeeded = MIN_SUBJECTS[state.checkSystem] ?? 3;
  const tooFew    = state.selectedSubjects.length < minNeeded;

  // Remove any existing warning banner
  const existingWarn = section.querySelector('.subject-count-warning');
  if (existingWarn) existingWarn.remove();

  if (tooFew) {
    const warn = document.createElement('p');
    warn.className = 'subject-count-warning';
    warn.textContent = `Universities require a full subject combination — please select at least ${minNeeded} subjects to see accurate results. Results below are indicative only.`;
    $('summaryBar').before(warn);
  }

  const pool = courses
    .filter(c => state.countryFilter === 'All' || c.country === state.countryFilter)
    .filter(c => state.selectedCategories.size === 0 || state.selectedCategories.has(c.category));

  const byStatus = { green: [], amber: [], grey: [], red: [] };
  pool.forEach(course => {
    const result = classify(course, state.selectedTags);
    if (tooFew && result.status === 'green') result.status = 'amber';
    if (state.predictedGrade && (result.status === 'green' || result.status === 'amber')) {
      if (isGradeAboveStudent(course, state.checkSystem, state.predictedGrade)) result.status = 'grey';
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
    container.appendChild(buildGroup('grey', 'Subject match, but grade threshold is high', byStatus.grey, cardIndex, true));
    cardIndex += byStatus.grey.length;
  }
  if (byStatus.red.length) {
    container.appendChild(buildGroup('red', 'Out of reach', byStatus.red, cardIndex, true));
  }
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
    </div>
    <div class="card-meta">
      <span>${flag}&thinsp;${esc(country)}</span>
      <span class="card-meta-sep">·</span>
      <span>${esc(course.degreeLevel)}</span>
      <span class="card-meta-sep">·</span>
      <span class="card-cat-badge">${esc(catLabel)}</span>
    </div>
    ${gradeStr ? `<div class="card-grades">${esc(gradeStr)}</div>` : ''}
    ${tests.length ? `
      <div class="card-admission-tests">
        ${tests.map(t => `<span class="admission-test-tag">${esc(t)} required</span>`).join('')}
      </div>` : ''}
    ${footerHtml}
    ${uniInfoHtml}
  `;
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
      <button class="copy-btn" type="button" aria-label="Copy requirements for ${esc(course.name)} to clipboard">
        ⎘&ensp;Copy requirements
      </button>
    </div>
  `;

  // Copy-to-clipboard handler (attached after innerHTML so the button exists)
  card.querySelector('.copy-btn').addEventListener('click', e => {
    e.stopPropagation();
    const btn = e.currentTarget;
    navigator.clipboard.writeText(buildRequirementsText(course))
      .then(() => {
        btn.textContent = '✓  Copied!';
        btn.classList.add('copy-btn--done');
        showToast('Requirements copied to clipboard');
        setTimeout(() => {
          btn.innerHTML = '⎘&ensp;Copy requirements';
          btn.classList.remove('copy-btn--done');
        }, 2200);
      })
      .catch(() => showToast('Copy failed — try selecting the text manually'));
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

  if (sortedTags.length === 0) {
    $('planEssentials').innerHTML = `
      <h3 class="plan-section-head">Essential subjects</h3>
      <p class="plan-section-sub">No specific subject requirements — ${esc(catLabel)} courses are broadly open.</p>`;
  } else {
    const chipsHtml = sortedTags.map(([tag, count]) => `
      <div class="plan-subject-chip">
        <span class="plan-subject-chip__name">${esc(tagToLocal(tag, state.planSystem))}</span>
        <span class="plan-subject-chip__count">unlocks ${count} course${count !== 1 ? 's' : ''}</span>
      </div>`).join('');
    $('planEssentials').innerHTML = `
      <h3 class="plan-section-head">Essential subjects</h3>
      <p class="plan-section-sub">Subjects that appear as required across ${esc(catLabel)} courses in our database.</p>
      <div class="plan-essentials-grid">${chipsHtml}</div>
    `;
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
 * UTILITY
 * ═══════════════════════════════════════════════════════════════ */

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ═══════════════════════════════════════════════════════════════
 * INIT
 * ═══════════════════════════════════════════════════════════════ */

function init() {
  populateSystemSelects();
  buildCountryFilterBar();
  buildCategoryPicker();
  buildPlanCategoryGrid();

  $$('.mode-btn').forEach(btn =>
    btn.addEventListener('click', () => switchMode(btn.dataset.mode))
  );

  $('checkSystemSelect').addEventListener('change', e => {
    state.checkSystem      = e.target.value;
    state.selectedSubjects = [];
    state.selectedTags     = new Set();
    state.predictedGrade   = null;
    $('checkResultsSection').classList.add('hidden');
    const emptyEl = $('checkEmptyState');
    if (emptyEl) delete emptyEl.dataset.builtFor;
    buildSubjectPicker(state.checkSystem);
    // Mirror to reverse panel so both start on the same system
    $('reverseSystemSelect').value = state.checkSystem;
    state.reverseSystem = state.checkSystem;
    if (state.searchQuery) renderReverseResults();
  });

  $('planSystemSelect').addEventListener('change', e => {
    state.planSystem = e.target.value;
    if (state.planCategory && state.planSystem) renderPlanResults();
  });

  $('planSwitchToCheck').addEventListener('click', () => switchMode('check'));
}

init();
