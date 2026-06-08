# Altiora Data Quality Audit

## Summary
- Total courses audited: 295
- Courses with at least one flag: 295 (all courses share the copy-paste notes issue in Check 5; 30+ share other specific flags)
- Total flags raised: 212
- Breakdown by check: Check 1: 113 | Check 2: 10 | Check 3: 12 | Check 4: 5 | Check 5: 73 | Check 6: 1

> **Counting note.** Check 5 counts 73 flags (one per university with copy-paste notes). Check 1 counts 110 flags for the schema-wide `grades.ib` string/number type mismatch plus 3 data-accuracy issues. Counts for Checks 2–4 and 6 reflect only substantively incorrect or contradictory data, not defensible editorial choices such as Law/Psychology/Architecture having empty `essential[]`.

---

## Check 1: Grade String Issues

### 1a — `grades.ib` field stored as string instead of integer (schema-wide)

Every UK course stores `grades.ib` as a plain string (`"39 points"`, `"40–42 points"`) rather than an integer or numeric range object. The documented schema shows `ib: 39` (integer). This affects all 110 UK courses and will break any code that does numeric comparisons on the `ib` field.

| Course | University | Current Value | Issue |
|--------|-----------|---------------|-------|
| uk-medicine-oxford | University of Oxford | `"39 points"` | IB stored as string, not integer |
| uk-maths-oxford | University of Oxford | `"40–42 points"` | IB stored as string range |
| uk-medicine-cambridge | University of Cambridge | `"40 points"` | IB stored as string |
| uk-cs-cambridge | University of Cambridge | `"40–42 points"` | IB stored as string range |
| uk-medicine-imperial | Imperial College London | `"36–38 points"` | IB stored as string range |
| *(all 110 UK courses)* | *(various)* | `"XX–XX points"` | All UK IB values are strings — affects every numeric comparison |

**Recommended fix:** Decide on a canonical format. If a single integer, use the midpoint or typical requirement (e.g., `39`). If a range is needed, use a structured object `{min: 36, max: 38}` or two separate fields. Update all 110 UK course entries.

### 1b — `notes` field says "BMAT required" but `admissionTests` contains UCAT

Oxford and Cambridge Medicine both have `admissionTests: ["UCAT"]` — which is correct (BMAT was discontinued in 2024) — but their free-text `notes` field still says **"BMAT required"**. These are directly contradictory.

| Course | University | Current Value | Issue |
|--------|-----------|---------------|-------|
| uk-medicine-oxford | University of Oxford | notes: "BMAT required. A*AA…" | Contradicts `admissionTests: ["UCAT"]`; BMAT discontinued |
| uk-medicine-cambridge | University of Cambridge | notes: "BMAT required. A*AA…" | Contradicts `admissionTests: ["UCAT"]`; BMAT discontinued |

### 1c — Grade vs tier plausibility flag

| Course | University | Current Value | Issue |
|--------|-----------|---------------|-------|
| uk-maths-warwick | University of Warwick | `aLevels: "A*A*A"`, tier: `world-top-100` | A*A*A is Oxford/Cambridge-level demand; unusual for a world-top-100 (not necessarily wrong — Warwick Maths is exceptional — but worth review) |

---

## Check 2: Admission Test Issues

### 2a — Cambridge missing expected admission tests

| Course | University | Current Tests | Issue |
|--------|-----------|---------------|-------|
| uk-naturalsciences-cambridge | University of Cambridge | `[]` | Natural Sciences should require NSAA (Natural Sciences Admissions Assessment) |
| uk-engineering-cambridge | University of Cambridge | `[]` | Engineering should require ENGAA (Engineering Admissions Assessment) |

### 2b — Imperial College missing expected admission tests

| Course | University | Current Tests | Issue |
|--------|-----------|---------------|-------|
| uk-cs-imperial | Imperial College London | `[]` | Imperial Computing should require MAT (Mathematics Admissions Test) |
| uk-physics-imperial | Imperial College London | `[]` | Imperial Physics should require PAT (Physics Aptitude Test) |

### 2c — LSE missing TSA

| Course | University | Current Tests | Issue |
|--------|-----------|---------------|-------|
| uk-economics-lse | London School of Economics | `[]` | LSE Economics historically required TSA; verify current status (LSE paused TSA for some courses in 2023–24; confirm and update or add note) |
| uk-politics-lse | London School of Economics | `[]` | LSE Politics & Economics same as above |

### 2d — `admissionTests` contradicts `notes` (test listed but notes says not required)

| Course | University | Current Tests | Issue |
|--------|-----------|---------------|-------|
| uk-law-manchester | University of Manchester | `["LNAT"]` | `notes` says "LNAT not required here" — data directly contradicts itself; Manchester Law does not require LNAT |
| uk-law-leeds | University of Leeds | `["LNAT"]` | `notes` says "LNAT not required" — same contradiction; Leeds Law does not require LNAT |

### 2e — SG/HK medicine using UCAT (informational, not an error)

NUS, NTU (LKCMedicine), and CUHK medicine programmes do use UCAT as part of their admissions for international applicants. These are **not errors** but may confuse users who expect UCAT to be UK-only. Consider adding a clarifying note.

| Course | University | Current Tests | Issue |
|--------|-----------|---------------|-------|
| sg-medicine-nus | National University of Singapore | `["UCAT"]` | Valid — NUS uses UCAT; add clarifying note that this is not the UK UCAT process |
| sg-medicine-ntu | Nanyang Technological University | `["UCAT"]` | Valid — NTU/Imperial joint degree; add note |
| hk-medicine-cuhk | Chinese University of Hong Kong | `["UCAT"]` | Valid — CUHK uses UCAT for international applicants; add note |

---

## Check 3: IB Points Issues

### 3a — world-top-10 courses with IB minimum below 38

| Course | University | IB Points | A-Level | Issue |
|--------|-----------|-----------|---------|-------|
| uk-medicine-imperial | Imperial College London | `36–38` | AAA | Min 36 is below the world-top-10 expected floor of 38; likely needs updating to 38–40 |
| uk-bioengineering-imperial | Imperial College London | `36–38` | AAA | Same as above; possibly intentionally lower for this specialised course, but worth review |

### 3b — IB points inconsistent with A-level grade (>3 point midpoint gap)

Expected approximate mapping: AAA ≈ 35–39, AAB ≈ 33–37.

| Course | University | IB Points | A-Level | Issue |
|--------|-----------|-----------|---------|-------|
| uk-medicine-birmingham | University of Birmingham | `32–34` | AAA | IB mid 33, expected mid ~37 for AAA; gap of 4 pts — IB likely too low |
| uk-law-birmingham | University of Birmingham | `32–34` | AAA | Same pattern; IB 4 pts below expected for AAA |
| uk-economics-birmingham | University of Birmingham | `30–32` | AAB | IB mid 31, expected mid ~35 for AAB; gap of 4 pts |
| uk-engineering-birmingham | University of Birmingham | `30–32` | AAB | Same pattern |
| uk-economics-exeter | University of Exeter | `32–34` | AAA | IB mid 33 vs expected ~37 for AAA; gap of 4 pts |
| uk-law-exeter | University of Exeter | `32–34` | AAA | Same pattern |
| uk-cs-exeter | University of Exeter | `30–32` | AAB | IB mid 31 vs expected ~35 for AAB; gap of 4 pts |
| uk-psychology-exeter | University of Exeter | `30–32` | AAB | Same pattern |
| uk-engineering-leeds | University of Leeds | `30–32` | AAB | IB mid 31 vs expected ~35 for AAB; gap of 4 pts |
| uk-economics-leeds | University of Leeds | `30–32` | AAB | Same pattern |

**Note on borderline cases (not flagged above):** Edinburgh and Manchester courses consistently show IB 1–2 pts below the expected midpoint for their A-level grade (e.g., Edinburgh Medicine AAA / IB 34–36 vs expected 35–39). These may reflect actual Scottish admissions practices and are not flagged as errors, but should be verified with admissions staff.

---

## Check 4: Missing Essential Requirements

**Methodology note:** US and Canadian courses consistently use `Mathematics_Advanced` in `essential[]` rather than `Mathematics_Standard`. Since `Mathematics_Advanced` is a superset, these are not flagged as errors. Law, Psychology, and Architecture courses have empty `essential[]` arrays by design. The five issues below are substantive.

| Course | University | Category | Essential[] | Issue |
|--------|-----------|----------|-------------|-------|
| uk-ppe-oxford | University of Oxford | economics | `[]` | PPE is an economics-category course; `Mathematics_Standard` should be in `essential[]` (Oxford PPE does specify mathematics as strongly required) |
| uk-politics-lse | London School of Economics | economics | `[]` | LSE Politics & Economics; quantitative skills are required; `Mathematics_Standard` should be in `essential[]` |
| uk-biomedical-ucl | University College London | medicine | `["Biology"]` | Biomedical Sciences has Biology as essential but not Chemistry; UCL Biomedical Sciences requires Chemistry at A-level — add Chemistry to `essential[]` |
| uk-nursing-kcl | King's College London | medicine | `["Biology"]` | KCL Nursing has Biology but not Chemistry; while nursing does not always require Chemistry at A-level, the `medicine` category triggers this check — verify and add Chemistry or reclassify |
| hk-nursing-polyu | Hong Kong Polytechnic University | medicine | `["Biology"]` | Same as above — Biology present but no Chemistry; nursing in HK medicine cat, verify whether Chemistry is required |

---

## Check 5: University Context Notes Quality

### 5a — Copy-paste notes (all courses within a university share identical `universityContext.notes`)

Every single university in the dataset has **identical** `universityContext.notes` text across all its courses. This means course-specific context is entirely absent. While university-level notes are useful, the current implementation provides zero course-differentiated context. This affects all 295 courses across all 73 universities.

Representative examples of the problem:

| Course | University | Notes (truncated) | Issue |
|--------|-----------|-------------------|-------|
| uk-medicine-oxford | University of Oxford | "Requires a separate college application; all courses include a rigorous interview." | Identical to all 9 other Oxford courses — no course-specific context |
| uk-cs-oxford | University of Oxford | "Requires a separate college application; all courses include a rigorous interview." | Same as Medicine, Law, History, etc. |
| uk-cs-imperial | Imperial College London | "Predominantly science and engineering; strong industry links in London." | Identical to Medicine, Maths, Engineering, Bioengineering |
| uk-economics-lse | London School of Economics | "The world's leading social science university; London location gives excellent finance and policy internship access." | Identical for Economics, Finance, Law, Politics, Management, Accounting |
| uk-medicine-ucl | University College London | "Large research university in central London with broad faculty coverage." | Identical across all 10 UCL courses |
| sg-medicine-nus | National University of Singapore | "Singapore's flagship university; actively recruits international students with competitive scholarship schemes." | Identical across all 8 NUS courses |
| us-cs-mit | MIT | "Holistic admissions via the Common App; no fixed grade threshold — research, projects, and curiosity matter." | Identical across all 6 MIT courses |

*(73 universities affected; all 295 courses share this structural issue.)*

**Recommended fix:** Add course-specific notes covering, at minimum: (a) typical offer conditions or post-interview statistics, (b) course-specific interview format, (c) any department-specific funding or career notes.

### 5b — No notes are null or under 20 characters

All `universityContext.notes` values are present and of reasonable length. No null or ultra-short notes found.

---

## Check 6: Tier Issues

### 6a — Non-standard tier value used (`national-top-10`)

The documented schema lists: `world-top-10 | national-leading | regional-strong | …`. The value `national-top-10` does not appear in the documented schema and is inconsistently named (the documented equivalent would be `national-leading`). It is used for 22 courses across 7 institutions.

| Course | University | Current Tier | Issue |
|--------|-----------|--------------|-------|
| uk-economics-exeter | University of Exeter | `national-top-10` | Non-standard tier value — not in documented schema; should be `national-leading` or schema should be updated to include `national-top-10` as a valid value |
| uk-law-exeter | University of Exeter | `national-top-10` | Same |
| uk-cs-exeter | University of Exeter | `national-top-10` | Same |
| uk-psychology-exeter | University of Exeter | `national-top-10` | Same |
| sg-law-smu | Singapore Management University | `national-top-10` | Same |
| sg-business-smu | Singapore Management University | `national-top-10` | Same |
| sg-economics-smu | Singapore Management University | `national-top-10` | Same |
| sg-cs-smu | Singapore Management University | `national-top-10` | Same |
| sg-engineering-sutd | Singapore University of Technology & Design | `national-top-10` | Same |
| sg-architecture-sutd | Singapore University of Technology & Design | `national-top-10` | Same |
| ca-medicine-mcmaster | McMaster University | `national-top-10` | Same |
| ca-engineering-mcmaster | McMaster University | `national-top-10` | Same |
| ca-cs-mcmaster | McMaster University | `national-top-10` | Same |
| ca-business-western | Western University | `national-top-10` | Same |
| ca-cs-western | Western University | `national-top-10` | Same |
| ca-medicine-western | Western University | `national-top-10` | Same |
| ca-business-queens | Queen's University | `national-top-10` | Same |
| ca-engineering-queens | Queen's University | `national-top-10` | Same |
| ca-economics-queens | Queen's University | `national-top-10` | Same |
| ca-engineering-alberta | University of Alberta | `national-top-10` | Same |
| ca-cs-alberta | University of Alberta | `national-top-10` | Same |
| ca-business-alberta | University of Alberta | `national-top-10` | Same |

### 6b — Tier plausibility: all named universities correctly classified

- Oxford and Cambridge: correctly `world-top-10` ✓
- Imperial College London: correctly `world-top-10` ✓
- LSE, UCL, Edinburgh, KCL: correctly `world-top-50` ✓
- Manchester: `world-top-100` — Manchester consistently ranks around QS 30–40 and is arguably `world-top-50`; flag for review
- No obviously minor university is marked `world-top-10`

### 6c — Distinct tier values found

`world-top-10` | `world-top-50` | `world-top-100` | `national-top-10` | `national-leading`

The schema documentation mentions `regional-strong` as a possible value, but it is not used in the current dataset.

---

## Priority Fix List

Top 20 most impactful fixes, ranked by: high-profile university first, then common/popular courses, then data completeness.

| # | Course | University | Check | Issue Summary |
|---|--------|-----------|-------|---------------|
| 1 | uk-medicine-oxford | University of Oxford | 1 | `notes` says "BMAT required" but BMAT is discontinued; `admissionTests` correctly has UCAT — remove BMAT from notes |
| 2 | uk-medicine-cambridge | University of Cambridge | 1 | Same BMAT/UCAT contradiction as Oxford Medicine |
| 3 | uk-naturalsciences-cambridge | University of Cambridge | 2 | Natural Sciences should have `admissionTests: ["NSAA"]` — high-traffic course, wrong test data |
| 4 | uk-engineering-cambridge | University of Cambridge | 2 | Engineering should have `admissionTests: ["ENGAA"]` |
| 5 | uk-cs-imperial | Imperial College London | 2 | Computing MEng should have `admissionTests: ["MAT"]` |
| 6 | uk-physics-imperial | Imperial College London | 2 | Physics BSc/MSci should have `admissionTests: ["PAT"]` |
| 7 | uk-law-manchester | University of Manchester | 2 | `admissionTests: ["LNAT"]` contradicts `notes: "LNAT not required here"` — remove LNAT from admissionTests |
| 8 | uk-law-leeds | University of Leeds | 2 | `admissionTests: ["LNAT"]` contradicts `notes: "LNAT not required"` — remove LNAT from admissionTests |
| 9 | uk-medicine-birmingham | University of Birmingham | 3 | IB 32–34 for AAA course is ~4 pts below expected minimum — likely data entry error; should be ~36–38 |
| 10 | uk-law-birmingham | University of Birmingham | 3 | IB 32–34 for AAA course — same mismatch as Birmingham Medicine |
| 11 | uk-economics-exeter | University of Exeter | 3 | IB 32–34 for AAA course — 4 pts below expected; verify and correct |
| 12 | uk-law-exeter | University of Exeter | 3 | IB 32–34 for AAA course — same mismatch |
| 13 | uk-ppe-oxford | University of Oxford | 4 | Economics-category course with empty `essential[]` — Oxford PPE requires Maths; add `Mathematics_Standard` to essential |
| 14 | uk-biomedical-ucl | University College London | 4 | Medicine-category course missing Chemistry in `essential[]`; UCL Biomedical Sciences requires Chemistry |
| 15 | uk-economics-lse | London School of Economics | 2 | Confirm whether TSA is still required (paused in 2023–24); update `admissionTests` and add a note either way |
| 16 | uk-economics-birmingham | University of Birmingham | 3 | AAB with IB 30–32 — 4 pts below expected midpoint |
| 17 | uk-engineering-leeds | University of Leeds | 3 | AAB with IB 30–32 — 4 pts below expected midpoint |
| 18 | uk-medicine-imperial | Imperial College London | 3 | world-top-10 with IB min 36 — below the expected 38-point floor for world-top-10; verify |
| 19 | *(all 110 UK courses)* | All UK universities | 1 | `grades.ib` is stored as a string (`"39 points"`) not an integer/number — schema-wide type mismatch requiring a migration |
| 20 | *(all 295 courses)* | All universities | 5 | `universityContext.notes` is copy-pasted identically across all courses at each university — no course-specific context; add at least one course-differentiated sentence per course |

---

*Audit completed: 2026-06-08. File audited: `/home/user/altiora/data/courseRequirements.js`. Total courses: 295 across 73 universities in 5 countries (UK: 110, US: 87, CA: 44, HK: 34, SG: 20).*
