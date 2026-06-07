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
  red:   { label:'Out of reach', badgeCls:'badge--error',   icon:'✗', cardCls:'course-card--red'   },
};
const STATUS_SORT = { green:0, amber:1, red:2 };

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

  syncSubjectCount();
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
  renderCheckResults();
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

  const gPct = total ? (counts.green / total * 100) : 0;
  const aPct = total ? (counts.amber / total * 100) : 0;
  const rPct = total ? (counts.red   / total * 100) : 0;

  bar.innerHTML = `
    <div class="results-new-summary">
      Your subjects match <strong>${total}</strong> course${total !== 1 ? 's' : ''} —
      <a href="#results-group-green" class="summary-link summary-link--green">${counts.green} strong match${counts.green !== 1 ? 'es' : ''}</a>
      <span class="summary-dot">·</span>
      <a href="#results-group-amber" class="summary-link summary-link--amber">${counts.amber} possible</a>
      <span class="summary-dot">·</span>
      <a href="#results-group-red" class="summary-link summary-link--red">${counts.red} out of reach</a>
    </div>
    <div class="summary-progress" role="img" aria-label="Course eligibility: ${counts.green} strong matches, ${counts.amber} possible, ${counts.red} out of reach">
      <div class="summary-seg summary-seg--green" style="width:${gPct.toFixed(2)}%"></div>
      <div class="summary-seg summary-seg--amber" style="width:${aPct.toFixed(2)}%"></div>
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

  const byStatus = { green: [], amber: [], red: [] };
  pool.forEach(course => {
    const result = classify(course, state.selectedTags);
    if (tooFew && result.status === 'green') result.status = 'amber';
    byStatus[result.status].push({ course, result });
  });

  // Sort each group by university name
  ['green', 'amber', 'red'].forEach(s =>
    byStatus[s].sort((a, b) => a.course.university.localeCompare(b.course.university))
  );

  const counts = { green: byStatus.green.length, amber: byStatus.amber.length, red: byStatus.red.length };
  const total  = counts.green + counts.amber + counts.red;

  renderSummaryBar(state.selectedSubjects.length, counts, total);

  $('resultSummaryBadges').innerHTML = `
    <span class="badge badge--success">✓&thinsp;${counts.green}</span>
    <span class="badge badge--warning">◑&thinsp;${counts.amber}</span>
    <span class="badge badge--error">✗&thinsp;${counts.red}</span>
    <span class="badge badge--neutral">${total} shown</span>
  `;

  const container = $('courseGrid');
  container.innerHTML = '';
  let cardIndex = 0;

  if (byStatus.green.length) {
    container.appendChild(buildGroup('green', '✓ Strong matches', byStatus.green, cardIndex));
    cardIndex += byStatus.green.length;
  }
  if (byStatus.amber.length) {
    container.appendChild(buildGroup('amber', '◑ Possible with right grades', byStatus.amber, cardIndex));
    cardIndex += byStatus.amber.length;
  }
  if (byStatus.red.length) {
    container.appendChild(buildGroup('red', '✗ Out of reach', byStatus.red, cardIndex, true));
  }
}

function buildGroup(status, headerText, items, startIndex, collapsed = false) {
  const section = document.createElement('section');
  section.id        = `results-group-${status}`;
  section.className = 'results-group';

  const header = document.createElement('h2');
  header.className   = `results-group__header results-group__header--${status}`;
  header.textContent = `${headerText} (${items.length})`;
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
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = `Show ${items.length} out-of-reach courses`;
    toggle.addEventListener('click', () => {
      const nowOpen = cardsDiv.hidden;
      cardsDiv.hidden = !nowOpen;
      toggle.setAttribute('aria-expanded', String(nowOpen));
      toggle.textContent = nowOpen ? 'Hide out-of-reach courses' : `Show ${items.length} out-of-reach courses`;
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

  let uniInfoHtml = '';
  if (profile) {
    const cityLine  = profile.city ? `<span class="card-uni-city">${esc(profile.city)}</span>` : '';
    const tagLine   = profile.tagline ? `<p class="card-uni-tagline">${esc(profile.tagline)}</p>` : '';
    const noteLine  = profile.internationalNote ? `<p class="card-uni-note">${esc(profile.internationalNote)}</p>` : '';
    const webLink   = profile.websiteUrl
      ? `<a class="card-uni-link" href="${esc(profile.websiteUrl)}" target="_blank" rel="noopener noreferrer">Visit university website ↗</a>`
      : '';
    uniInfoHtml = `
      <details class="card-uni-info">
        <summary>About this university${cityLine ? ` · ${profile.city}` : ''}</summary>
        ${tagLine}${noteLine}${webLink}
      </details>`;
  } else if (course.universityContext?.notes) {
    uniInfoHtml = `
      <details class="card-uni-info">
        <summary>About this university</summary>
        <p class="card-uni-info__notes">${esc(course.universityContext.notes)}</p>
      </details>`;
  }

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
      <span class="badge ${cfg.badgeCls}">${cfg.icon}&thinsp;${cfg.label}</span>
    </div>
    <div class="card-meta">
      <span class="badge badge--neutral">${esc(course.degreeLevel)}</span>
      <span class="badge badge--neutral">${flag}&thinsp;${esc(country)}</span>
      <span class="badge badge--neutral">${esc(catLabel)}</span>
    </div>
    ${gradeStr ? `<div class="card-grades">${esc(gradeStr)}</div>` : ''}
    ${tests.length ? `
      <div class="card-admission-tests">
        ${tests.map(t => `<span class="badge badge--warning">${esc(t)} required</span>`).join('')}
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

function buildPlanCategoryGrid() {
  const grid = $('planCategoryGrid');
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plan-cat-card';
    btn.dataset.category = cat.id;
    btn.innerHTML = `
      <span class="plan-cat-card__icon" aria-hidden="true">${cat.icon}</span>
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
    $('checkResultsSection').classList.add('hidden');
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
