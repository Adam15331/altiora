// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — admissions requirements: central configuration.
 *
 * ONE place that says which admissions cycle the site shows, which
 * cycles exist, and which requirement categories every course carries.
 * The UI renders whatever this file and the cycle data files say — no
 * requirement value or category label is hard-coded in a component.
 *
 * Adding a category (e.g. a new qualification) is:
 *   1. add it to `categories` below,
 *   2. add an entry for it to every course in each cycle file
 *      (`npm run validate` lists every course that is missing one).
 *
 * Two kinds of category:
 *   'list'          — the requirement is a list of published statements
 *                     (`items`, or `none: true`). The default.
 *   'qualification' — requirements for applicants presenting one school
 *                     qualification (A-Level, IB), as structured fields:
 *                     `accepted`, `typicalOffer` / `overallScore`,
 *                     `subjects`, `detail` … These mirror the values the
 *                     matching engine reads from data/courseRequirements.js
 *                     and `npm run validate` fails if the two disagree.
 *
 * Starting a new admissions year: `npm run new-cycle -- <year>`
 * (see docs/requirements-data.md).
 *
 * Loaded by the browser as a classic script (global
 * `AltioraRequirementsConfig`) and by Node tooling via require().
 * ═══════════════════════════════════════════════════════════════ */

/**
 * @typedef {'verified' | 'partial' | 'unverified' | 'notApplicable'} VerificationStatus
 *   notApplicable — qualification categories only: the official source
 *   was checked and this qualification is not an entry route (e.g. a
 *   graduate-entry programme). Needs a source, a date and a note.
 *
 * @typedef {object} RequirementSource
 * @property {string} url     Official university / programme / test-provider page.
 * @property {string} [label] Short human label for the link.
 *
 * @typedef {object} SubjectRef
 * @property {string} name   Subject as the qualification names it (e.g. "Further Mathematics").
 * @property {string} code   Universal subject tag the matching engine uses (e.g. "Mathematics_Advanced").
 *
 * @typedef {object} QualificationSubjects   (every list optional; absent = none recorded)
 * @property {SubjectRef[]} [required]
 * @property {SubjectRef[]} [preferred]
 * @property {SubjectRef[]} [excluded]       Subjects the source says do not count.
 * @property {SubjectRef[]} [higherLevel]    IB: subjects required at Higher Level.
 * @property {SubjectRef[]} [standardLevel]  IB: subjects required at Standard Level.
 *
 * @typedef {object} RequirementEntry
 * @property {VerificationStatus} status
 * @property {string[]} [items]          Requirement statements as published (verified/partial only).
 * @property {true} [none]               The source was checked and lists no requirement here.
 * @property {string[]} [codes]          Machine codes (test codes, subject tags) for cross-checks.
 * @property {RequirementSource[]} [sources]  Required for verified/partial.
 * @property {string} [lastVerified]     ISO date (YYYY-MM-DD); required for verified/partial.
 * @property {string} [note]             Caveat; required for partial.
 * @property {string} [recorded]         Unverified only: a value previously held WITHOUT a source,
 *                                       kept so a reviewer can confirm or correct it.
 * @property {string | string[]} [sourceSnippet]  Verbatim quote (1–2 sentences) from the source
 *                                       that supports the value, so it can be audited without
 *                                       re-researching. An array gives one quote per source, in
 *                                       `sources` order. Required on checked entries (verified,
 *                                       partial, notApplicable) last verified on or after
 *                                       `snippetsRequiredFrom`. `lastVerified` is the access date.
 * @property {string} [reviewFlag]       For the data owner, not shown to students: a decision
 *                                       this entry raises (e.g. the matching engine still holds
 *                                       a value the source contradicts). Listed in the review report.
 *
 * Qualification categories only (verified / partial unless stated):
 * @property {'yes' | 'no' | 'unknown'} [accepted]  Is the qualification an entry route?
 *                                       'no' only with status notApplicable.
 * @property {string} [typicalOffer]     A-Level grades as held, e.g. "A*AA".
 * @property {number} [overallScore]     IB points total as held, e.g. 39.
 * @property {QualificationSubjects} [subjects]
 * @property {string} [detail]           Subject-grade detail as held, verbatim (e.g. "766 at HL").
 * @property {string} [practicalEndorsement]  A-Level science practical endorsement.
 * @property {string} [contextualOffer]  Contextual / adjusted offer.
 * @property {string} [coreNote]         IB Theory of Knowledge / Extended Essay / CAS.
 * @property {string} [testsInterview]   Qualification-specific test or interview note.
 * @property {Array<'typicalOffer' | 'overallScore' | 'detail'>} [withheld]
 *                                       Values the matching engine holds that the panel
 *                                       deliberately does not show (e.g. an admitted-student
 *                                       figure, which is not a requirement). Needs a note.
 *
 * @typedef {Record<string, RequirementEntry>} CourseRequirementRecord   keyed by category id
 *
 * @typedef {object} RequirementCycle
 * @property {string} cycle   Cycle id, e.g. "2027".
 * @property {string} label   Human label, e.g. "2027 entry".
 * @property {string} [carriedFrom]  Cycle this file was started from, if any.
 * @property {Record<string, CourseRequirementRecord>} courses  keyed by course id
 *
 * @typedef {object} RequirementCategory
 * @property {string} id
 * @property {string} label
 * @property {string} [hint]  What belongs in the category.
 * @property {'list' | 'qualification'} [kind]  Default 'list'.
 * @property {string} [scoreLabel]  Qualification categories: label for the grade field.
 *
 * @typedef {object} CycleInfo
 * @property {string} label
 * @property {string} applicationPeriod  When students apply for this entry year.
 *
 * @typedef {object} RequirementsConfig
 * @property {string} currentCycle
 * @property {string} [snippetsRequiredFrom]  ISO date: checked entries last verified on or after
 *                                            it must carry a `sourceSnippet`.
 * @property {Record<string, CycleInfo>} cycles
 * @property {RequirementCategory[]} categories
 */

(function (/** @type {any} */ root) {
  /** @type {RequirementsConfig} */
  const config = {
    // The cycle the site shows. Changed by `npm run new-cycle`.
    currentCycle: '2027',

    // From this date every newly checked entry quotes its source
    // (`sourceSnippet`). Entries checked earlier predate the rule.
    snippetsRequiredFrom: '2026-10-19',

    // Every cycle that has a data file in data/requirements/<id>.js.
    // Old cycles stay here (and on disk) for reference.
    cycles: {
      '2027': { label: '2027 entry', applicationPeriod: '2026–27 application cycle' },
    },

    // Categories, in display order. Every course in every cycle file
    // must carry an entry for each of these — even if only
    // { status: 'unverified' }. A-Level and IB were added in Phase 2.
    categories: [
      { id: 'satAct',               label: 'SAT / ACT',             hint: 'Standardised test policy and any required scores' },
      { id: 'englishLanguage',      label: 'English language',      hint: 'IELTS, TOEFL, Duolingo or other proof of English' },
      { id: 'admissionsTests',      label: 'Admissions tests',      hint: 'Course-specific tests such as UCAT, LNAT, TMUA, STEP' },
      { id: 'subjectPrerequisites', label: 'Subject prerequisites', hint: 'Subjects the course requires or recommends' },
      { id: 'aLevel',               label: 'A-Level requirements',  hint: 'UK GCE A-Level grades and subjects', kind: 'qualification', scoreLabel: 'Grades' },
      { id: 'ib',                   label: 'IB requirements',       hint: 'IB Diploma points, Higher and Standard Level subjects', kind: 'qualification', scoreLabel: 'Overall score' },
      { id: 'otherQualifications',  label: 'Other qualifications',  hint: 'Advanced Placement (AP), Hong Kong DSE' },
      { id: 'otherRequirements',    label: 'Other requirements',    hint: 'Interviews, portfolios, auditions, written work' },
    ],
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = config;
  else root.AltioraRequirementsConfig = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
