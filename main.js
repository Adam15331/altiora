/* ═══════════════════════════════════════════════════════════════
 * Altiora — main.js
 *
 * Two modes:
 *   "check"   – user picks subjects → see which courses are open / possible / closed
 *   "reverse" – user searches a degree → see what subjects they need
 *
 * Data dependencies (loaded before this script):
 *   qualificationMappings  – from data/qualificationMappings.js
 *   courses                – from data/courseRequirements.js
 * ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── State ─────────────────────────────────────────────────────
 * Single source of truth for the whole app.
 * Mutate via the helper functions below; never write directly from
 * event handlers so the render path stays predictable.
 * ─────────────────────────────────────────────────────────────── */
const state = {
  mode:             'check',   // 'check' | 'reverse'
  checkSystem:      '',        // qualification system key (check panel)
  reverseSystem:    '',        // qualification system key (reverse panel)
  selectedSubjects: [],        // array of subject-name strings
  selectedTags:     new Set(), // universal tags derived from selectedSubjects
  countryFilter:    'All',     // active country filter in check mode
  searchQuery:      '',        // live text in reverse-mode search field
};

/* ─── Constants ─────────────────────────────────────────────────── */
const COUNTRY_FLAGS = {
  UK: '🇬🇧', US: '🇺🇸', Netherlands: '🇳🇱',
  Singapore: '🇸🇬', Hong_Kong: '🇭🇰',
};
const COUNTRY_LABELS = {
  UK: 'UK', US: 'US', Netherlands: 'Netherlands',
  Singapore: 'Singapore', Hong_Kong: 'Hong Kong',
};
// Visual config keyed on eligibility status
const STATUS = {
  green: { label: 'Open',     badgeCls: 'badge--success', icon: '✓', cardCls: 'card--green' },
  amber: { label: 'Possible', badgeCls: 'badge--warning', icon: '◑', cardCls: 'card--amber' },
  red:   { label: 'Closed',   badgeCls: 'badge--error',   icon: '✕', cardCls: 'card--red'   },
};
const STATUS_SORT = { green: 0, amber: 1, red: 2 };

/* ─── DOM shortcuts ─────────────────────────────────────────────── */
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ═══════════════════════════════════════════════════════════════
 * REVERSE-MAP UTILITIES
 * Build a per-system index from universal tag → [local subject names]
 * and provide a function to pick the best name for display.
 * ═══════════════════════════════════════════════════════════════ */

const _rMapCache = {};

/** Returns { tag: [subjectName, …], … } for the given system. Cached. */
function getReverseMap(systemKey) {
  if (_rMapCache[systemKey]) return _rMapCache[systemKey];
  const src = qualificationMappings[systemKey]?.subjects ?? {};
  const map = {};
  for (const [name, tag] of Object.entries(src)) {
    (map[tag] ??= []).push(name);
  }
  _rMapCache[systemKey] = map;
  return map;
}

/**
 * Score a subject name so the most "representative" variant sorts first.
 *   2 – HL / H2 / AP  (the standard advanced form)
 *   1 – neutral / no level marker  (e.g. plain VWO subjects)
 *   0 – SL / H1  (lower-level variants)
 *  -1 – "Further *"  (supplementary enrichment, not a standalone choice)
 */
function subjectDisplayScore(name) {
  if (/\bFurther\b/.test(name)) return -1;         // supplementary/enrichment (e.g. "Further Maths HL", "H2 Further Mathematics")
  if (/ HL$/.test(name) || /^H2 /.test(name) || /^AP /.test(name)) return 2;
  if (/ SL$/.test(name) || /^H1 /.test(name)) return 0;
  return 1;
}

/**
 * Translate a universal tag to the best local subject name for `systemKey`.
 * Sort priority: score DESC → name length DESC (longer = more specific) → alpha ASC.
 * Falls back to a human-readable tag string if the system has no mapping.
 */
function tagToLocal(tag, systemKey) {
  if (!systemKey) return humanTag(tag);
  const options = getReverseMap(systemKey)[tag];
  if (!options?.length) return humanTag(tag);
  return [...options].sort((a, b) => {
    const byScore = subjectDisplayScore(b) - subjectDisplayScore(a);
    if (byScore !== 0) return byScore;
    const byLen = b.length - a.length;           // longer name = more specific
    return byLen !== 0 ? byLen : a.localeCompare(b);
  })[0];
}

/** "Mathematics_Advanced" → "Mathematics Advanced" */
function humanTag(tag) { return tag.replace(/_/g, ' '); }

/* ═══════════════════════════════════════════════════════════════
 * TAG DERIVATION
 * Map the user's selected subject names to universal tags using
 * the active qualification system's forward map.
 * ═══════════════════════════════════════════════════════════════ */

function deriveTagsFromSubjects(subjects, systemKey) {
  const forward = qualificationMappings[systemKey]?.subjects ?? {};
  const tags = new Set();
  for (const name of subjects) {
    const tag = forward[name];
    if (tag) tags.add(tag);
  }
  return tags;
}

/* ═══════════════════════════════════════════════════════════════
 * ELIGIBILITY ENGINE
 * ═══════════════════════════════════════════════════════════════ */

/**
 * Classify a course against the user's current tag set.
 *
 * Returns { status, missingEssential, missingPreferred }
 *   status: 'green' | 'amber' | 'red'
 */
function classify(course, userTags) {
  const { essential = [], preferred = [] } = course.requirements;
  const missingEssential = essential.filter(t => !userTags.has(t));
  if (missingEssential.length > 0) {
    return { status: 'red', missingEssential, missingPreferred: [] };
  }
  const missingPreferred = preferred.filter(t => !userTags.has(t));
  return {
    status: missingPreferred.length ? 'amber' : 'green',
    missingEssential: [],
    missingPreferred,
  };
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
}

/* ═══════════════════════════════════════════════════════════════
 * SYSTEM DROPDOWNS
 * Both panels share the same set of options; reverse panel has an
 * extra "Universal tags" default option.
 * ═══════════════════════════════════════════════════════════════ */

function populateSystemSelects() {
  const optHtml = Object.entries(qualificationMappings)
    .map(([k, sys]) => `<option value="${k}">${esc(sys.systemLabel)}</option>`)
    .join('');

  $('checkSystemSelect').innerHTML =
    `<option value="">Select your system…</option>${optHtml}`;

  $('reverseSystemSelect').innerHTML =
    `<option value="">Show as universal tags</option>${optHtml}`;
}

/* ═══════════════════════════════════════════════════════════════
 * SUBJECT PICKER  (check mode)
 * Renders one labelled checkbox pill per subject in the chosen system.
 * ═══════════════════════════════════════════════════════════════ */

function buildSubjectPicker(systemKey) {
  const section = $('subjectPickerSection');
  const picker  = $('subjectPicker');

  // Reset filter text
  $('subjectFilterInput').value = '';

  if (!systemKey) {
    section.classList.add('hidden');
    picker.innerHTML = '';
    return;
  }

  const subjects = Object.keys(qualificationMappings[systemKey]?.subjects ?? {});
  const frag = document.createDocumentFragment();

  subjects.forEach(name => {
    const label = document.createElement('label');
    label.className = 'subject-chip';
    // Hidden checkbox keeps the selection state; the label provides the hit area
    label.innerHTML =
      `<input type="checkbox" value="${esc(name)}"><span>${esc(name)}</span>`;
    label.querySelector('input').addEventListener('change', onSubjectToggle);
    frag.appendChild(label);
  });

  picker.innerHTML = '';
  picker.appendChild(frag);
  section.classList.remove('hidden');
  syncSubjectCount();
}

function onSubjectToggle() {
  // Re-derive full selection from DOM (source of truth for checkboxes)
  const checked = $$('#subjectPicker input:checked');
  state.selectedSubjects = Array.from(checked).map(c => c.value);
  state.selectedTags     = deriveTagsFromSubjects(state.selectedSubjects, state.checkSystem);

  // Keep .selected class in sync for CSS styling
  $$('#subjectPicker .subject-chip').forEach(chip => {
    chip.classList.toggle('selected', chip.querySelector('input').checked);
  });

  syncSubjectCount();
  renderCheckResults();
}

function syncSubjectCount() {
  const n = state.selectedSubjects.length;
  $('subjectCountBadge').textContent = n === 0 ? 'none selected' : `${n} selected`;
}

// Live filter chips by name as the user types
$('subjectFilterInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  $$('#subjectPicker .subject-chip').forEach(chip => {
    const match = !q || chip.querySelector('span').textContent.toLowerCase().includes(q);
    chip.classList.toggle('hidden', !match);
  });
});

/* ═══════════════════════════════════════════════════════════════
 * COUNTRY FILTER BAR  (check mode)
 * ═══════════════════════════════════════════════════════════════ */

function buildCountryFilterBar() {
  const bar = $('countryFilterBar');
  const entries = [['All', 'All'], ...Object.entries(COUNTRY_LABELS)];

  entries.forEach(([key, label]) => {
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
 * CHECK MODE — RESULTS RENDER
 * ═══════════════════════════════════════════════════════════════ */

function renderCheckResults() {
  const section = $('checkResultsSection');

  if (state.selectedSubjects.length === 0) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  // Apply country filter then classify every course
  const pool = state.countryFilter === 'All'
    ? courses
    : courses.filter(c => c.country === state.countryFilter);

  const classified = pool
    .map(course => ({ course, result: classify(course, state.selectedTags) }))
    .sort((a, b) => {
      // green first, then amber, then red; alpha by university within each group
      const byStatus = STATUS_SORT[a.result.status] - STATUS_SORT[b.result.status];
      return byStatus !== 0 ? byStatus : a.course.university.localeCompare(b.course.university);
    });

  // Summary counts
  const counts = { green: 0, amber: 0, red: 0 };
  classified.forEach(c => counts[c.result.status]++);

  $('resultSummaryBadges').innerHTML = `
    <span class="badge badge--success">✓ ${counts.green} open</span>
    <span class="badge badge--warning">◑ ${counts.amber} possible</span>
    <span class="badge badge--error">✕ ${counts.red} closed</span>
    <span class="badge badge--neutral">${classified.length} total</span>
  `;

  // Render cards
  const grid = $('courseGrid');
  const frag = document.createDocumentFragment();
  classified.forEach(({ course, result }) => frag.appendChild(buildCheckCard(course, result)));
  grid.innerHTML = '';
  grid.appendChild(frag);
}

function buildCheckCard(course, result) {
  const { status, missingEssential, missingPreferred } = result;
  const cfg     = STATUS[status];
  const sys     = state.checkSystem;
  const flag    = COUNTRY_FLAGS[course.country] ?? '';
  const country = COUNTRY_LABELS[course.country] ?? course.country;

  // Translate a tag array to a comma-separated list of local subject names
  const localList = tags =>
    tags.map(t => `<em>${esc(tagToLocal(t, sys))}</em>`).join(', ');

  // Build the "missing" line shown beneath the card meta
  let missingHtml = '';
  if (status === 'red' && missingEssential.length) {
    missingHtml =
      `<p class="card-missing card-missing--red">` +
      `<span class="missing-prefix">Needs:</span> ${localList(missingEssential)}</p>`;
  } else if (status === 'amber' && missingPreferred.length) {
    missingHtml =
      `<p class="card-missing card-missing--amber">` +
      `<span class="missing-prefix">Preferred:</span> ${localList(missingPreferred)}</p>`;
  }

  const card = document.createElement('div');
  card.className = `course-card ${cfg.cardCls}`;
  card.setAttribute('role', 'listitem');
  card.innerHTML = `
    <div class="card-header">
      <div class="card-title-group">
        <span class="card-flag" aria-hidden="true">${flag}</span>
        <div class="card-titles">
          <div class="card-name">${esc(course.name)}</div>
          <div class="card-uni">${esc(course.university)}</div>
        </div>
      </div>
      <span class="badge ${cfg.badgeCls}">${cfg.icon}&thinsp;${cfg.label}</span>
    </div>
    <div class="card-meta">
      <span class="badge badge--neutral">${esc(course.degreeLevel)}</span>
      <span class="badge badge--neutral">${flag}&thinsp;${esc(country)}</span>
    </div>
    ${missingHtml}
  `;
  return card;
}

/* ═══════════════════════════════════════════════════════════════
 * REVERSE MODE — RESULTS RENDER
 * ═══════════════════════════════════════════════════════════════ */

$('courseSearchInput').addEventListener('input', e => {
  state.searchQuery = e.target.value.trim();
  renderReverseResults();
});

$('reverseSystemSelect').addEventListener('change', e => {
  state.reverseSystem = e.target.value;
  // Re-render immediately if there's already a query
  if (state.searchQuery) renderReverseResults();
});

function renderReverseResults() {
  const section = $('reverseResultsSection');
  const q = state.searchQuery.toLowerCase();

  if (!q) {
    section.innerHTML = '<p class="search-hint">Start typing to find courses…</p>';
    return;
  }

  // Match against course name, university name, and country label
  const matched = courses.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.university.toLowerCase().includes(q) ||
    (COUNTRY_LABELS[c.country] ?? '').toLowerCase().includes(q)
  );

  if (matched.length === 0) {
    section.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <p>No courses matched <strong>"${esc(state.searchQuery)}"</strong>.</p>
        <p class="mt-8">Try a broader term like <em>Medicine</em>, <em>Engineering</em>, or a university name.</p>
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  matched.forEach(course => frag.appendChild(buildReverseCard(course)));
  section.innerHTML = '';
  section.appendChild(frag);
}

function buildReverseCard(course) {
  const sys     = state.reverseSystem;
  const flag    = COUNTRY_FLAGS[course.country] ?? '';
  const country = COUNTRY_LABELS[course.country] ?? course.country;

  const { essential = [], preferred = [], useful = [] } = course.requirements;

  // Render an array of tags as subject-tag pills
  const tagPills = tags => {
    if (!tags.length) return '<span class="text-secondary" style="font-size:13px">None specified</span>';
    return tags
      .map(t => `<span class="subject-tag">${esc(tagToLocal(t, sys))}</span>`)
      .join('');
  };

  // Only render rows that have tags
  const rows = [
    { label: 'Required', cls: 'req-essential', tags: essential },
    ...(preferred.length ? [{ label: 'Preferred', cls: 'req-preferred', tags: preferred }] : []),
    ...(useful.length    ? [{ label: 'Useful',    cls: 'req-useful',    tags: useful    }] : []),
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
    ${course.notes
      ? `<p class="reverse-notes">${esc(course.notes)}</p>`
      : ''}
  `;
  return card;
}

/* ═══════════════════════════════════════════════════════════════
 * UTILITY
 * ═══════════════════════════════════════════════════════════════ */

/** Minimal HTML escaping for user-data and data-file strings. */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════════════════════════════════
 * INIT
 * Wire up all static event listeners and run initial renders.
 * ═══════════════════════════════════════════════════════════════ */

function init() {
  populateSystemSelects();
  buildCountryFilterBar();

  // Mode toggle buttons
  $$('.mode-btn').forEach(btn =>
    btn.addEventListener('click', () => switchMode(btn.dataset.mode))
  );

  // Check-mode system select
  $('checkSystemSelect').addEventListener('change', e => {
    state.checkSystem      = e.target.value;
    state.selectedSubjects = [];
    state.selectedTags     = new Set();

    // Clear results before rebuilding picker so stale data isn't shown
    $('checkResultsSection').classList.add('hidden');
    buildSubjectPicker(state.checkSystem);

    // Mirror the system choice to the reverse panel for convenience
    $('reverseSystemSelect').value = state.checkSystem;
    state.reverseSystem = state.checkSystem;
    if (state.searchQuery) renderReverseResults();
  });
}

init();
