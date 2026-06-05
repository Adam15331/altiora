/* ─── State ─────────────────────────────────────────── */
const state = {
  currentStep: 1,
  totalSteps: 3,
  qualification: null,
  subjects: [],   // [{ subjectId, grade }]
  results: [],
};

/* ─── DOM refs ───────────────────────────────────────── */
const progressFill  = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const steps         = document.querySelectorAll('.step');

/* ─── Progress ───────────────────────────────────────── */
function updateProgress() {
  const pct = ((state.currentStep - 1) / (state.totalSteps - 1)) * 100;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `Step ${state.currentStep} of ${state.totalSteps}`;
}

function goToStep(n) {
  steps.forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`step${n}`);
  if (target) {
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  state.currentStep = n;
  updateProgress();
}

/* ─── Step 1 – Qualification ─────────────────────────── */
function buildQualGrid() {
  const grid = document.getElementById('qualGrid');
  grid.innerHTML = '';
  qualificationMappings.qualifications.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'qual-pill';
    btn.textContent = q.label;
    btn.dataset.id = q.id;
    btn.addEventListener('click', () => selectQual(q.id));
    grid.appendChild(btn);
  });
}

function selectQual(id) {
  state.qualification = id;
  state.subjects = [];

  document.querySelectorAll('.qual-pill').forEach(p => {
    p.classList.toggle('selected', p.dataset.id === id);
  });

  document.getElementById('nextStep1').disabled = false;
}

document.getElementById('nextStep1').addEventListener('click', () => {
  if (!state.qualification) return;
  buildSubjectStep();
  goToStep(2);
});

/* ─── Step 2 – Subjects & Grades ────────────────────── */
const availableSubjects = () =>
  qualificationMappings.subjectMappings[state.qualification] || [];

const gradeOptions = () =>
  qualificationMappings.gradeScales[state.qualification] || [];

let subjectSearch = '';

function buildSubjectStep() {
  const container = document.getElementById('subjectRows');
  container.innerHTML = '';
  state.subjects = [];

  const searchInput = document.getElementById('subjectSearchInput');
  searchInput.value = '';
  subjectSearch = '';
  searchInput.oninput = (e) => {
    subjectSearch = e.target.value.toLowerCase();
  };

  addSubjectRow();
  renderSubjectCount();
}

function addSubjectRow() {
  const max = state.qualification === 'alevel' || state.qualification === 'scottish' ? 5 : 3;
  if (state.subjects.length >= max) return;

  const index = state.subjects.length;
  state.subjects.push({ subjectId: '', grade: '' });

  const container = document.getElementById('subjectRows');
  const row = document.createElement('div');
  row.className = 'subject-row';
  row.dataset.index = index;

  const subjects = availableSubjects();
  const grades   = gradeOptions();

  row.innerHTML = `
    <div class="select-wrap" style="flex:1">
      <select data-field="subjectId" data-index="${index}">
        <option value="">Select subject…</option>
        ${subjects.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
      </select>
    </div>
    <div class="select-wrap">
      <select data-field="grade" data-index="${index}">
        <option value="">Grade</option>
        ${grades.map(g => `<option value="${g}">${g}</option>`).join('')}
      </select>
    </div>
    <button class="remove-btn" data-index="${index}" title="Remove">✕</button>
  `;

  row.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const i = +e.target.dataset.index;
      const field = e.target.dataset.field;
      state.subjects[i][field] = e.target.value;
      renderSubjectCount();
    });
  });

  row.querySelector('.remove-btn').addEventListener('click', (e) => {
    const i = +e.currentTarget.dataset.index;
    removeSubjectRow(i);
  });

  container.appendChild(row);
  renderSubjectCount();
}

function removeSubjectRow(index) {
  state.subjects.splice(index, 1);
  rebuildSubjectRows();
}

function rebuildSubjectRows() {
  const container = document.getElementById('subjectRows');
  container.innerHTML = '';

  const subjects = availableSubjects();
  const grades   = gradeOptions();

  state.subjects.forEach((subj, index) => {
    const row = document.createElement('div');
    row.className = 'subject-row';
    row.dataset.index = index;

    row.innerHTML = `
      <div class="select-wrap" style="flex:1">
        <select data-field="subjectId" data-index="${index}">
          <option value="">Select subject…</option>
          ${subjects.map(s => `<option value="${s.id}" ${s.id === subj.subjectId ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </div>
      <div class="select-wrap">
        <select data-field="grade" data-index="${index}">
          <option value="">Grade</option>
          ${grades.map(g => `<option value="${g}" ${g === subj.grade ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
      <button class="remove-btn" data-index="${index}" title="Remove">✕</button>
    `;

    row.querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const i = +e.target.dataset.index;
        const field = e.target.dataset.field;
        state.subjects[i][field] = e.target.value;
        renderSubjectCount();
      });
    });

    row.querySelector('.remove-btn').addEventListener('click', (e) => {
      const i = +e.currentTarget.dataset.index;
      removeSubjectRow(i);
    });

    container.appendChild(row);
  });

  renderSubjectCount();
}

function renderSubjectCount() {
  const filled = state.subjects.filter(s => s.subjectId && s.grade).length;
  const countEl = document.getElementById('subjectCount');
  if (countEl) countEl.textContent = `${filled} subject${filled !== 1 ? 's' : ''} entered`;
}

document.getElementById('addSubjectBtn').addEventListener('click', addSubjectRow);

document.getElementById('backStep2').addEventListener('click', () => goToStep(1));

document.getElementById('nextStep2').addEventListener('click', () => {
  const valid = state.subjects.filter(s => s.subjectId && s.grade);
  if (valid.length === 0) {
    alert('Please add at least one subject with a grade.');
    return;
  }
  state.subjects = valid;
  buildSummaryStep();
  goToStep(3);
});

/* ─── Step 3 – Summary & Search ─────────────────────── */
function buildSummaryStep() {
  const qual = qualificationMappings.qualifications.find(q => q.id === state.qualification);
  const subjectMap = {};
  availableSubjects().forEach(s => { subjectMap[s.id] = s.label; });

  const summaryEl = document.getElementById('summaryContent');
  summaryEl.innerHTML = `
    <div class="req-block">
      <div class="req-block__title">Qualification</div>
      <div style="font-size:14px;font-weight:500;">${qual ? qual.label : state.qualification}</div>
    </div>
    <div class="req-block">
      <div class="req-block__title">Your subjects</div>
      ${state.subjects.map(s => `
        <div class="req-row">
          <span class="req-row__label">${subjectMap[s.subjectId] || s.subjectId}</span>
          <strong>${s.grade}</strong>
        </div>
      `).join('')}
    </div>
  `;
}

document.getElementById('backStep3').addEventListener('click', () => goToStep(2));

document.getElementById('findCoursesBtn').addEventListener('click', () => {
  runSearch();
});

/* ─── Eligibility engine ─────────────────────────────── */
function checkEligibility(course) {
  const qual = state.qualification;
  const req  = course.requirements[qual];

  if (!req) return { status: 'ineligible', reason: 'Qualification not accepted for this course.' };

  const gradePoints = qualificationMappings.gradePoints[qual];
  const userPoints  = state.subjects
    .filter(s => s.grade)
    .reduce((sum, s) => sum + (gradePoints[s.grade] || 0), 0);

  const userSubjectIds = state.subjects.map(s => s.subjectId);

  // Check required subjects
  if (req.required && req.required.length > 0) {
    const missing = req.required.filter(r => !userSubjectIds.includes(r));
    if (missing.length > 0) {
      return { status: 'ineligible', reason: `Missing required subject(s).` };
    }
  }

  // IB-specific point check
  if (qual === 'ib' && req.totalPoints) {
    if (userPoints < req.totalPoints * 0.85) {
      return { status: 'ineligible', reason: `IB points below minimum threshold.` };
    }
    if (userPoints < req.totalPoints) {
      return { status: 'borderline', reason: `IB points close to requirement (${req.totalPoints} needed).` };
    }
    return { status: 'eligible', reason: 'You meet the IB requirements.' };
  }

  // UCAS points check for A-level/BTEC
  if (course.ucasPoints) {
    if (userPoints < course.ucasPoints * 0.85) {
      return { status: 'ineligible', reason: `UCAS points below minimum (${course.ucasPoints} needed).` };
    }
    if (userPoints < course.ucasPoints) {
      return { status: 'borderline', reason: `UCAS points close to entry requirement.` };
    }
  }

  return { status: 'eligible', reason: 'You appear to meet the entry requirements.' };
}

/* ─── Search & render results ────────────────────────── */
let activeFilter = 'all';

function runSearch() {
  state.results = courseRequirements.map(course => ({
    course,
    eligibility: checkEligibility(course),
  }));

  activeFilter = 'all';
  renderResults();

  const resultsEl = document.getElementById('results');
  resultsEl.classList.add('visible');
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderResults() {
  const filtered = state.results.filter(r => {
    if (activeFilter === 'all') return true;
    return r.eligibility.status === activeFilter;
  });

  const counts = {
    all:        state.results.length,
    eligible:   state.results.filter(r => r.eligibility.status === 'eligible').length,
    borderline: state.results.filter(r => r.eligibility.status === 'borderline').length,
    ineligible: state.results.filter(r => r.eligibility.status === 'ineligible').length,
  };

  document.getElementById('resultCount').textContent =
    `${filtered.length} course${filtered.length !== 1 ? 's' : ''} found`;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    btn.classList.toggle('active', f === activeFilter);
    const countSpan = btn.querySelector('.filter-count');
    if (countSpan) countSpan.textContent = counts[f] ?? '';
  });

  const list = document.getElementById('courseList');
  list.innerHTML = '';

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <h3>No courses match this filter</h3>
        <p class="mt-8">Try showing all courses or adjusting your subjects.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(({ course, eligibility }) => {
    const card = buildCourseCard(course, eligibility);
    list.appendChild(card);
  });
}

function buildCourseCard(course, eligibility) {
  const statusLabels = { eligible: 'Likely eligible', borderline: 'Borderline', ineligible: 'Unlikely eligible' };
  const badgeClass   = { eligible: 'badge--success', borderline: 'badge--warning', ineligible: 'badge--error' };
  const matchClass   = eligibility.status;

  const qual = state.qualification;
  const req  = course.requirements[qual];

  const card = document.createElement('div');
  card.className = 'course-card';

  const subjectMap = {};
  availableSubjects().forEach(s => { subjectMap[s.id] = s.label; });

  let reqHtml = '';
  if (req) {
    if (qual === 'alevel' && req.grades) {
      reqHtml = `
        <div class="req-row"><span class="req-row__label">Grades:</span> ${req.grades.join(', ')}</div>
        ${req.required.length ? `<div class="req-row"><span class="req-row__label">Required:</span> ${req.required.map(r => subjectMap[r] || r).join(', ')}</div>` : ''}
        ${req.preferred && req.preferred.length ? `<div class="req-row"><span class="req-row__label">Preferred:</span> ${req.preferred.map(r => subjectMap[r] || r).join(', ')}</div>` : ''}
        ${req.notes ? `<p class="req-note">${req.notes}</p>` : ''}
      `;
    } else if (qual === 'ib' && req.totalPoints) {
      reqHtml = `
        <div class="req-row"><span class="req-row__label">Points:</span> ${req.totalPoints}+</div>
        ${req.required && req.required.length ? `<div class="req-row"><span class="req-row__label">Required:</span> ${req.required.map(r => subjectMap[r] || r).join(', ')}</div>` : ''}
        ${req.notes ? `<p class="req-note">${req.notes}</p>` : ''}
      `;
    } else if (req.grades) {
      reqHtml = `
        <div class="req-row"><span class="req-row__label">Grades:</span> ${Array.isArray(req.grades) ? req.grades.join(', ') : req.grades}</div>
        ${req.notes ? `<p class="req-note">${req.notes}</p>` : ''}
      `;
    } else {
      reqHtml = req.notes ? `<p class="req-note">${req.notes}</p>` : '<p class="req-note">See university website for full details.</p>';
    }
  } else {
    reqHtml = `<p class="req-note">This course does not list specific requirements for your qualification type. Contact the university directly.</p>`;
  }

  card.innerHTML = `
    <div class="course-card__top">
      <div class="course-card__info">
        <div class="course-card__title">${course.title}</div>
        <div class="course-card__uni">${course.university}</div>
        <div class="course-card__tags">
          <span class="badge badge--neutral">${course.duration}</span>
          <span class="badge badge--neutral">UCAS ${course.ucasCode}</span>
          ${course.ucasPoints ? `<span class="badge badge--neutral">${course.ucasPoints} pts</span>` : ''}
          <span class="badge ${badgeClass[eligibility.status]}">${statusLabels[eligibility.status]}</span>
        </div>
      </div>
      <div class="course-card__right">
        <div class="eligibility-indicator ${eligibility.status}" title="${statusLabels[eligibility.status]}"></div>
      </div>
    </div>
    <div class="course-detail">
      <div class="match-summary ${matchClass}">
        ${matchClass === 'eligible' ? '✓' : matchClass === 'borderline' ? '⚠' : '✕'}
        ${eligibility.reason}
      </div>
      <p>${course.description}</p>
      <div class="req-block">
        <div class="req-block__title">Entry requirements for your qualification</div>
        ${reqHtml}
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    card.classList.toggle('expanded');
  });

  return card;
}

/* ─── Filter buttons ─────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    renderResults();
  });
});

/* ─── Reset ──────────────────────────────────────────── */
document.getElementById('resetBtn').addEventListener('click', () => {
  state.qualification = null;
  state.subjects = [];
  state.results  = [];
  document.getElementById('results').classList.remove('visible');
  document.querySelectorAll('.qual-pill').forEach(p => p.classList.remove('selected'));
  document.getElementById('nextStep1').disabled = true;
  goToStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─── Init ───────────────────────────────────────────── */
buildQualGrid();
updateProgress();
