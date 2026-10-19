# Admissions requirements — changelog

Audit trail for `data/requirements/`. Add an entry for **every** data change:
date, cycle, course id(s), category, what changed, and the source checked.
`npm run new-cycle` appends its own entries.

Format:

    ## YYYY-MM-DD — <cycle label> — <short title>
    - `<course-id>` · <Category>: <old> → <new> (status → verified). Source: <url>

## 2026-10-19 — 2027 entry — central requirements data created

- Created `data/requirements/config.js` (cycles, current cycle, six Phase 1
  categories) and `data/requirements/2027.js` (320 courses × 6 categories)
  with `scripts/migrate-requirements-2027.mjs`. No web research; nothing invented.
- Carried across with their existing official source and check date:
  admissions tests and subject prerequisites (from each course's
  verification record), AP requirements (from the AP records' own source
  and date), Hong Kong DSE requirements (course record).
- Marked **partial**: the 4 CUHK courses whose records are partial, and 8
  courses verified only on a qualification-route-specific page (McGill ×4,
  Waterloo ×2, Dalhousie, SUTD); AP records whose own status is partial.
- Marked **unverified**: every SAT/ACT entry (the US test-policy table has no
  source or date — its policy is kept as a "previously recorded" value for
  review; the admitted-student SAT/ACT ranges are not requirements and were
  not carried across), every English-language entry and every
  other-requirements entry (no structured data existed).
- A-Level and IB requirements deliberately not included (Phase 2).

## 2026-10-19 — 2027 entry — A-Level and IB requirements added (Phase 2)

- Added two qualification categories to `data/requirements/config.js` —
  `aLevel` (A-Level requirements) and `ib` (IB requirements), `kind:
  'qualification'` — and an entry for each of the 320 courses in
  `data/requirements/2027.js`, with
  `scripts/migrate-requirements-2027-qualifications.mjs`. Every Phase 1 entry
  is unchanged. No web research; no value invented.
- Values are the matching engine's own, from `data/courseRequirements.js`:
  `grades.aLevels` → `typicalOffer`; `grades.ib` → `overallScore`;
  `grades.ibHL` → Higher Level subjects; `grades.ibHLNote` → `detail`
  (verbatim); `requirements.essential` / `.preferred` → required / preferred
  subjects, named as A-Level / IB subjects. `npm run validate` now fails if
  any of these disagree with the engine. Engine data unchanged.
- Status, source and date from each course's verification record (as Phase 1
  did for subject prerequisites). A-Level: 141 verified, 1 partial, 174 not
  verified, 4 not applicable. IB: 198 verified, 7 partial, 111 not verified,
  4 not applicable.
- **Verified on an IB-applicants page**, so the IB row is verified (Phase 1
  rows stay partial): `ca-cs-mcgill`, `ca-maths-mcgill`,
  `ca-engineering-mcgill`, `ca-economics-mcgill`, `ca-cs-waterloo`,
  `ca-mathematics-waterloo`, `ca-engineering-dalhousie`. Their A-Level rows
  are not verified (the engine holds no A-Level offer for them).
  `sg-engineering-sutd` was verified on a Singapore-Cambridge GCE A-Level page:
  its IB row is partial, its A-Level row not verified (no UK A-Level offer held).
- **Partial**: the 4 CUHK courses (partial records; A-Level only for
  `hk-engineering-cuhk`, the one with an A-Level offer); SUTD IB; and the IB
  rows of `ca-medicine-mcgill` and `ca-medicine-dalhousie`, whose records say
  graduate-entry while the engine holds IB Higher Level subjects for them —
  the conflict is noted and their A-Level rows are not verified, not "not applicable".
- **Not applicable** (the record says the course itself is not undergraduate
  entry, and no A-Level/IB data is held): `ca-law-utoronto`, `ca-law-ottawa`,
  `ca-law-york`, `ca-law-uvic`. Not the US "pre-law track" courses
  (`us-law-harvard`, `us-law-yale`, `us-law-georgetown`): they are
  undergraduate degrees — their "Law is graduate-entry" note is about the law
  school afterwards — so their A-Level / IB rows are not verified (Yale's
  notes mention IB being accepted; flagged as a review hint).
- **Not verified**: every course the engine holds no A-Level offer / IB data
  for (all 100 US courses, most Singapore and Canadian ones).
- **Withheld** (admitted-student figures are not requirements): the IB points
  total and IB note of `hk-cs-hkust`, `hk-engineering-hkust`,
  `hk-sciences-hkust`, `hk-maths-hkust` (25th percentile of recent admits) and
  `hk-engineering-polyu`, `hk-nursing-polyu`, `hk-business-polyu`,
  `hk-architecture-polyu`, `hk-cs-polyu` (typical admitted score); the IB note
  only of `ca-cs-waterloo`, `ca-engineering-waterloo`,
  `ca-mathematics-waterloo`, `ca-business-waterloo`, `ca-cs-sfu`,
  `ca-business-sfu` (admitted averages), `ca-engineering-mcmaster`
  (competitive estimate), `ca-engineering-calgary`, `ca-business-calgary`
  (last year's finalization averages). The engine still reads these points
  totals for matching — not changed here (matching output must stay identical).
- The practical-endorsement, contextual-offer, TOK/EE/CAS and tests/interview
  fields exist in the schema but are empty: the repo holds no structured data
  for them.

## 2026-10-19 — 2027 entry — US verification pass: method

- Every US course (31 universities, 100 courses) is re-checked category by category
  against official university pages only (admissions, testing policy, English
  proficiency, course pages, IB/A-Level pages). Pages are fetched directly; no
  search summaries or third-party sites are used as source text.
- Each checked row records its source URL(s), `lastVerified` = the access date, and
  `sourceSnippet` — a verbatim quote from each source (one per source, in order;
  "…" separates excerpts). Quotes are machine-checked against the fetched page text
  before a batch is applied.
- Admitted-student ranges or "most competitive applicant" scores are never recorded
  as requirements. Categories the matching engine reads (admissions tests, subject
  prerequisites, A-Level, IB) keep the engine value when an official source differs:
  the row is partly verified, with the official value in its note, and is listed for
  the owner. Other categories are corrected to the official value.
- `reviewFlag` (not shown to students) carries owner decisions, e.g. engine data the
  official source now contradicts. Rows that could not be checked stay not verified
  with a note naming the URL tried.

## 2026-10-19 — 2027 entry — US verification pass: Yale University

- `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · SAT / ACT: not verified: recorded "Test-flexible" → **verified: ACT or SAT required — all first-year and transfer applicants, from the 2026–27 cycle; Other exams, including international leaving exams and English proficiency exams, do not fulfil this requirement (2026-10-19)**.
  Source: https://admissions.yale.edu/standardized-testing (accessed 2026-10-19) — “All first-year and transfer applicants must include scores from the ACT or SAT.”
  Source: https://admissions.yale.edu/posts/2026-08-17-application-update-2026-2027 (accessed 2026-10-19) — “Starting with this cycle, we will be requiring all first-year and transfer applicants to submit either the SAT or the ACT.”
  Source: https://admissions.yale.edu/international (accessed 2026-10-19) — “Scores from other exams, including international leaving exams or English proficiency exams will not fulfill Yale’s testing requirement.”
  **Owner flag:** data/courseRequirements.js still records usAdmissions.test "flexible" (test-flexible) for this course; Yale now requires the ACT or SAT. Owner decision — not changed here.
- `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · English language: not verified → **verified: English proficiency test required for non-native English speakers without two or more years of enrollment in an English-medium school; Tests listed: TOEFL iBT, IELTS, Cambridge English (C1 Advanced, C2 Proficiency or B2 First), Duolingo English Test; InitialView interviews are also listed (2026-10-19)**.
  Source: https://admissions.yale.edu/standardized-testing (accessed 2026-10-19) — “If you are a non-native English speaker without two or more years of enrollment in an English-medium school, you are required to submit scores from an English proficiency test, in addition to fulfilling Yale’s standardized testing requirement with ACT or SAT scores.”
- `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · Admissions tests: verified: none listed (2026-06-28) → **verified: none listed (2026-10-19)**.
  Source: https://admissions.yale.edu/requirements (accessed 2026-10-19) — “First-year applications include letters of recommendation, a transcript, and standardized test scores.”
- `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · Subject prerequisites: verified: none listed (2026-06-28) → **verified: none listed (2026-10-19)**.
  Source: https://admissions.yale.edu/course-selection (accessed 2026-10-19) — “Yale does not prescribe a set of secondary school courses that are required for admission.”
- `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · A-Level requirements: not verified → **partly verified: International leaving-exam results do not fulfil Yale’s ACT/SAT requirement; applicants from schools outside the U.S. meet the same requirements as all other applicants. (2026-10-19)**.
  Source: https://admissions.yale.edu/international (accessed 2026-10-19) — “Scores from other exams, including international leaving exams or English proficiency exams will not fulfill Yale’s testing requirement. … Students applying from secondary schools outside the U.S. complete the same applications and fulfill the same application requirements as all other applicants.”
- `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · IB requirements: not verified → **verified: IB scores, including predicted IB scores, are optional (encouraged for students with IB coursework) and no longer fulfil the ACT/SAT requirement. (2026-10-19)**.
  Source: https://admissions.yale.edu/standardized-testing (accessed 2026-10-19) — “Including AP or IB scores is not required but is encouraged for students who have completed AP- or IB-designated coursework. Applicants may submit predicted IB scores, if available, but these are not required.”
  Source: https://admissions.yale.edu/posts/2026-08-17-application-update-2026-2027 (accessed 2026-10-19) — “But we gave them four options– SAT, ACT, AP, or IB. And moving forward, that list of options is just going to be narrowed to just the SAT or the ACT.”
- `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · Other qualifications: not verified → **verified: Advanced Placement: AP scores are optional — encouraged for students with AP coursework, self-reported alongside ACT/SAT scores; AP scores no longer fulfil the ACT/SAT requirement (2026-10-19)**.
  Source: https://admissions.yale.edu/standardized-testing (accessed 2026-10-19) — “If you have completed AP or IB exams, you may include the scores of your choosing in the testing section of your application along with your ACT or SAT score(s). Including AP or IB scores is not required but is encouraged for students who have completed AP- or IB-designated coursework.”
  Source: https://admissions.yale.edu/posts/2026-08-17-application-update-2026-2027 (accessed 2026-10-19) — “But we gave them four options– SAT, ACT, AP, or IB. And moving forward, that list of options is just going to be narrowed to just the SAT or the ACT.”
- `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · Other requirements: not verified → **verified: Interviews: by invitation only; not required; Supplementary arts portfolio (music, visual art, film, dance) or STEM research: optional (2026-10-19)**.
  Source: https://admissions.yale.edu/interviews (accessed 2026-10-19) — “Alumni volunteers and current Yale students conduct evaluative interviews, by invitation only. … Interviews are not required, and many successful applicants are not interviewed.”
  Source: https://admissions.yale.edu/supplementary (accessed 2026-10-19) — “First-year and transfer applicants may supplement their application with an arts portfolio or academic research.”

## 2026-10-19 — 2027 entry — US verification pass: Yale University — subject prerequisites aligned with the other schools

- `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · Subject prerequisites: verified: none listed (2026-10-19) → **partly verified: Not used in Altiora’s matching yet — see the note for the official guidance (2026-10-19)**.
  Source: https://admissions.yale.edu/course-selection (accessed 2026-10-19) — “Yale does not prescribe a set of secondary school courses that are required for admission. … Generally speaking, you should try to take courses each year in English, science, math, the social sciences, and foreign language.”
  **Owner flag:** Official source lists advised high-school subjects (English, science, math, social sciences, foreign language), while stating none are required; data/courseRequirements.js holds none. Owner decision.

## 2026-10-19 — 2027 entry — US verification pass: MIT

- `us-cs-mit`, `us-engineering-mit`, `us-mechanical-mit`, `us-physics-mit`, `us-economics-mit`, `us-maths-mit` · SAT / ACT: not verified: recorded "SAT/ACT required" → **verified: SAT or ACT required — prospective first-year and transfer students; ACT writing/science sections and the SAT optional essay are not required; Required tests must be taken before November 30 (Early Action) or December 31 (Regular Action) (2026-10-19)**.
  Source: https://mitadmissions.org/apply/firstyear/international/ (accessed 2026-10-19) — “We require the SAT or the ACT from both prospective first-year and transfer students. We do not require the ACT writing or science sections or the SAT optional essay.”
  Source: https://mitadmissions.org/apply/firstyear/deadlines-requirements/ (accessed 2026-10-19) — “Standardized tests: We require the SAT or ACT. Applicants must take required tests before November 30 for EA, and before December 31 for RA.”
- `us-cs-mit`, `us-engineering-mit`, `us-mechanical-mit`, `us-physics-mit`, `us-economics-mit`, `us-maths-mit` · English language: not verified → **verified: English proficiency exam strongly recommended (not stated as required) for non-native English speakers who have used English for fewer than five years or do not speak English at home or in school; Accepted: TOEFL, IELTS, PTE Academic, Duolingo English Test, Cambridge English (C1 Advanced or C2 Proficiency); MIT minimum / recommended scores: TOEFL 90 / 100 (taken before 21 Jan 2026) or 5 / 5.5 (taken on or after 21 Jan 2026); IELTS 7 / 7.5; PTE Academic 65 / 70; Cambridge 185 / 190; Duolingo 120 / 125 (2026-10-19)**.
  Source: https://mitadmissions.org/apply/firstyear/tests-scores/ (accessed 2026-10-19) — “For non-native English speakers, we strongly recommend providing the results of an English proficiency exam if you have been using English for fewer than five years or do not speak English at home or in school, so that we may consider that information alongside the rest of your application. … We do have minimum and recommended scores for our English language tests. These minimums are in place to ensure your level of English proficiency. … IELTS Minimum: 7 Recommended: 7.5”
- `us-cs-mit`, `us-engineering-mit`, `us-mechanical-mit`, `us-physics-mit`, `us-economics-mit`, `us-maths-mit` · Admissions tests: verified: none listed (2026-06-28) → **verified: none listed (2026-10-19)**.
  Source: https://mitadmissions.org/apply/firstyear/deadlines-requirements/ (accessed 2026-10-19) — “MIT First-Year application form: The form includes sections for biographical and personal information, essays, activities, and academics, recommendations, and test scores. … Standardized tests: We require the SAT or ACT.”
- `us-cs-mit`, `us-engineering-mit`, `us-mechanical-mit`, `us-physics-mit`, `us-economics-mit`, `us-maths-mit` · Subject prerequisites: verified: none listed (2026-06-28) → **partly verified: Not used in Altiora’s matching yet — see the note for the official guidance (2026-10-19)**.
  Source: https://mitadmissions.org/apply/firstyear/international/ (accessed 2026-10-19) — “We do not have any required high school classes for domestic or international applicants. However, all students need to demonstrate minimum competence in fields they will continue to study at MIT.”
  Source: https://mitadmissions.org/apply/prepare/foundations/ (accessed 2026-10-19) — “Math, including calculus, … Science, including physics, chemistry, and/or biology … Some challenging courses in the humanities, arts, and social sciences”
  **Owner flag:** Official source lists recommended high-school preparation (math including calculus; physics, chemistry and/or biology; challenging HASS courses), while stating no classes are required; data/courseRequirements.js holds none. Owner decision.
- `us-cs-mit`, `us-engineering-mit`, `us-mechanical-mit`, `us-physics-mit`, `us-economics-mit`, `us-maths-mit` · A-Level requirements: not verified → **verified: The school transcript should include results of external examinations such as A Levels that are required for university entrance in the home country; MIT asks for predicted grades if available. A Levels scores are self-reported in the application’s Test scores section (official scores are not required at application). (2026-10-19)**.
  Source: https://mitadmissions.org/apply/firstyear/international/ (accessed 2026-10-19) — “Your high school transcript should include three years of grades and the results of any external examinations such as the International Baccalaureate, A Levels, French Baccalaureate, or CBSE, which are required for entrance to universities in your home country. We understand that many grades are not available until after decisions are made and ask that predicted grades be sent if available.”
  Source: https://mitadmissions.org/apply/firstyear/tests-scores/ (accessed 2026-10-19) — “Students should self-report scores for standardized exams they have taken or plan to take, such as Advanced Placement, International Baccalaureate, A-level, Baccalauréat, etc., on the Test scores section of the application. We do not require applicants to officially send scores as part of their application, and instead have a verification process upon enrollment.”
- `us-cs-mit`, `us-engineering-mit`, `us-mechanical-mit`, `us-physics-mit`, `us-economics-mit`, `us-maths-mit` · IB requirements: not verified → **verified: The school transcript should include results of external examinations such as the International Baccalaureate that are required for university entrance in the home country; MIT asks for predicted grades if available. the International Baccalaureate scores are self-reported in the application’s Test scores section (official scores are not required at application). (2026-10-19)**.
  Source: https://mitadmissions.org/apply/firstyear/international/ (accessed 2026-10-19) — “Your high school transcript should include three years of grades and the results of any external examinations such as the International Baccalaureate, A Levels, French Baccalaureate, or CBSE, which are required for entrance to universities in your home country. We understand that many grades are not available until after decisions are made and ask that predicted grades be sent if available.”
  Source: https://mitadmissions.org/apply/firstyear/tests-scores/ (accessed 2026-10-19) — “Students should self-report scores for standardized exams they have taken or plan to take, such as Advanced Placement, International Baccalaureate, A-level, Baccalauréat, etc., on the Test scores section of the application. We do not require applicants to officially send scores as part of their application, and instead have a verification process upon enrollment.”
- `us-cs-mit`, `us-engineering-mit`, `us-mechanical-mit`, `us-physics-mit`, `us-economics-mit`, `us-maths-mit` · Other qualifications: not verified → **verified: Advanced Placement and other exam scores (e.g. IB, A-level, Baccalauréat): self-reported in the Test scores section of the application; Official score reports are not required at application; scores are verified upon enrollment (2026-10-19)**.
  Source: https://mitadmissions.org/apply/firstyear/tests-scores/ (accessed 2026-10-19) — “Students should self-report scores for standardized exams they have taken or plan to take, such as Advanced Placement, International Baccalaureate, A-level, Baccalauréat, etc., on the Test scores section of the application. We do not require applicants to officially send scores as part of their application, and instead have a verification process upon enrollment.”
- `us-cs-mit`, `us-engineering-mit`, `us-mechanical-mit`, `us-physics-mit`, `us-economics-mit`, `us-maths-mit` · Other requirements: not verified → **verified: Interview: offered by an MIT Educational Counselor when one is available; if none is available it is waived without disadvantage; Creative portfolios (research, music & theater arts, visual art & architecture, maker): optional; Two teacher letters of recommendation required (one math/science and one humanities/social science/language recommended) (2026-10-19)**.
  Source: https://mitadmissions.org/apply/firstyear/interview/ (accessed 2026-10-19) — “After you submit your application, you may be contacted by an Educational Counselor (EC) if there’s one available. … If we are unable to offer you an interview, it will be waived, and your application will not be adversely affected.”
  Source: https://mitadmissions.org/apply/firstyear/portfolios-additional-material/ (accessed 2026-10-19) — “Researchers, performing artists, visual artists, and makers may submit optional portfolios for review by MIT staff or faculty through SlideRoom.”
  Source: https://mitadmissions.org/apply/firstyear/deadlines-requirements/ (accessed 2026-10-19) — “Letters of recommendation: We require two letters of recommendation from teachers, which you can request through the application. We recommend one letter from a math or science teacher, and one from a humanities, social science, or language teacher.”
