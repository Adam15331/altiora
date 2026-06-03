/* ── State ───────────────────────────────────────────────── */
const state = {
  qualification: "",
  subjects: [],
  atar: "",
  status: "",
  query: "",
};

/* ── DOM refs ────────────────────────────────────────────── */
const courseGrid    = document.getElementById("courseGrid");
const resultCount   = document.getElementById("resultCount");
const filterForm    = document.getElementById("filterForm");
const inputQuery    = document.getElementById("inputQuery");
const inputAtar     = document.getElementById("inputAtar");
const selectStatus  = document.getElementById("selectStatus");
const btnReset      = document.getElementById("btnReset");

/* ── Helpers ─────────────────────────────────────────────── */
function subjectLabel(id) {
  for (const cat of Object.values(qualificationMappings.subjectCategories)) {
    const found = cat.subjects.find(s => s.id === id);
    if (found) return found.label;
  }
  return id;
}

function statusPill(status) {
  const labels = { open: "Open", limited: "Limited", closed: "Closed" };
  return `<span class="status-pill status-pill--${status}">${labels[status] ?? status}</span>`;
}

/* ── Render ──────────────────────────────────────────────── */
function renderCards(courses) {
  resultCount.textContent = courses.length;

  if (courses.length === 0) {
    courseGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No courses match your filters</h3>
        <p>Try adjusting your ATAR, status, or search term.</p>
      </div>`;
    return;
  }

  courseGrid.innerHTML = courses.map(c => {
    const prereqText = c.prerequisites.length
      ? c.prerequisites.map(subjectLabel).join(", ")
      : "None";
    const recText = c.recommended.length
      ? c.recommended.map(subjectLabel).join(", ")
      : "—";

    return `
      <article class="course-card" tabindex="0" aria-label="${c.title} at ${c.university}">
        <div class="course-card__top">
          <div>
            <div class="course-card__title">${c.title}</div>
            <div class="course-card__university">${c.university} &middot; ${c.faculty}</div>
          </div>
          <div class="course-card__atar">
            <div class="atar-num">${c.atar.toFixed(1)}</div>
            <div class="atar-label">ATAR</div>
          </div>
        </div>

        <div class="course-card__meta">
          ${statusPill(c.status)}
          <span class="duration-tag">${c.duration}</span>
        </div>

        <div class="course-card__tags">
          ${c.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>

        <div class="course-card__prereqs">
          <strong>Prerequisites:</strong> ${prereqText}<br>
          <strong>Recommended:</strong> ${recText}
        </div>

        ${c.notes ? `<p style="font-size:13px;color:var(--text-sec);margin-top:2px;">${c.notes}</p>` : ""}
      </article>`;
  }).join("");
}

/* ── Filter logic ────────────────────────────────────────── */
function applyFilters() {
  const query  = inputQuery.value.trim().toLowerCase();
  const atarVal = parseFloat(inputAtar.value);
  const status = selectStatus.value;

  const filtered = courseRequirements.filter(c => {
    if (query && !(
      c.title.toLowerCase().includes(query) ||
      c.university.toLowerCase().includes(query) ||
      c.faculty.toLowerCase().includes(query) ||
      c.tags.some(t => t.includes(query))
    )) return false;

    if (!isNaN(atarVal) && c.atar > atarVal) return false;

    if (status && c.status !== status) return false;

    return true;
  });

  renderCards(filtered);
}

/* ── Events ──────────────────────────────────────────────── */
filterForm.addEventListener("input", applyFilters);

filterForm.addEventListener("submit", e => {
  e.preventDefault();
  applyFilters();
});

btnReset.addEventListener("click", () => {
  filterForm.reset();
  applyFilters();
});

/* ── Init ────────────────────────────────────────────────── */
renderCards(courseRequirements);
