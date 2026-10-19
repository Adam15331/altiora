// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — admissions requirements: central configuration.
 *
 * ONE place that says which admissions cycle the site shows, which
 * cycles exist, and which requirement categories every course carries.
 * The UI renders whatever this file and the cycle data files say — no
 * requirement value or category label is hard-coded in a component.
 *
 * Adding a category (e.g. a new qualification in a later phase) is:
 *   1. add it to `categories` below,
 *   2. add an entry for it to every course in each cycle file
 *      (`npm run validate` lists every course that is missing one).
 *
 * Starting a new admissions year: `npm run new-cycle -- <year>`
 * (see docs/requirements-data.md).
 *
 * Loaded by the browser as a classic script (global
 * `AltioraRequirementsConfig`) and by Node tooling via require().
 * ═══════════════════════════════════════════════════════════════ */

/**
 * @typedef {'verified' | 'partial' | 'unverified'} VerificationStatus
 *
 * @typedef {object} RequirementSource
 * @property {string} url     Official university / programme / test-provider page.
 * @property {string} [label] Short human label for the link.
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
 *
 * @typedef {object} CycleInfo
 * @property {string} label
 * @property {string} applicationPeriod  When students apply for this entry year.
 *
 * @typedef {object} RequirementsConfig
 * @property {string} currentCycle
 * @property {Record<string, CycleInfo>} cycles
 * @property {RequirementCategory[]} categories
 */

(function (/** @type {any} */ root) {
  /** @type {RequirementsConfig} */
  const config = {
    // The cycle the site shows. Changed by `npm run new-cycle`.
    currentCycle: '2027',

    // Every cycle that has a data file in data/requirements/<id>.js.
    // Old cycles stay here (and on disk) for reference.
    cycles: {
      '2027': { label: '2027 entry', applicationPeriod: '2026–27 application cycle' },
    },

    // Phase 1 categories, in display order. Every course in every cycle
    // file must carry an entry for each of these — even if only
    // { status: 'unverified' }.
    categories: [
      { id: 'satAct',               label: 'SAT / ACT',             hint: 'Standardised test policy and any required scores' },
      { id: 'englishLanguage',      label: 'English language',      hint: 'IELTS, TOEFL, Duolingo or other proof of English' },
      { id: 'admissionsTests',      label: 'Admissions tests',      hint: 'Course-specific tests such as UCAT, LNAT, TMUA, STEP' },
      { id: 'subjectPrerequisites', label: 'Subject prerequisites', hint: 'Subjects the course requires or recommends' },
      { id: 'otherQualifications',  label: 'Other qualifications',  hint: 'Advanced Placement (AP), Hong Kong DSE' },
      { id: 'otherRequirements',    label: 'Other requirements',    hint: 'Interviews, portfolios, auditions, written work' },
    ],
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = config;
  else root.AltioraRequirementsConfig = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
