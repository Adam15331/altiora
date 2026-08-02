/* ═══════════════════════════════════════════════════════════════
 * Altiora — admissionTestInfo.js
 *
 * Static timing layer for the admission tests that appear in
 * courseRequirements.js admissionTests[]. Windows are expressed as
 * TYPICAL windows (registration/test months shift slightly year to
 * year) — the officialUrl is the live source students must check.
 *
 * VERIFIED against official sources (not recalled), checkedDate below:
 *   TMUA / ESAT / TARA — esat-tmua.ac.uk (UAT UK): registration opens
 *     20 Jul 2026, deadline 28 Sep 2026; sittings 12–16 Oct 2026 and
 *     4–8 Jan 2027 (TARA second booking window 26 Oct–21 Dec).
 *   UCAT — ucat.ac.uk: registration opened 20 May 2026, booking from
 *     23 Jun, deadline 16 Sep; test window 13 Jul–24 Sep 2026.
 *   LNAT — lnat.ac.uk: registration/booking opens 1 Aug; testing from
 *     1 Sep; sit by 15 Oct for Oxford/Cambridge deadlines.
 *   STEP — ocr.org.uk: entries open 1 Mar 2026, deadline 4 May 2026;
 *     STEP 2 on 4 Jun, STEP 3 on 10 Jun 2026 (sat AFTER offers).
 *   LSAT — lsac.org: ~8 sittings across Aug–Jun; in-person from
 *     Aug 2026; registration closes ~6 weeks before each date.
 *   MCAT — students-residents.aamc.org: 31 dates Jan–Sep 2026;
 *     registration opened late Oct 2025 for the 2026 dates.
 *
 * Fields:
 *   name / fullName            – display names
 *   typicalRegistrationWindow  – short fragment, composes after "registration "
 *   typicalTestWindow          – short fragment, composes after "test "
 *   regShort                   – compact window for aggregate lines
 *   regOpensMonth              – 1–12 sort key (order by when planning starts);
 *                                90+ = post-undergraduate tests, listed last
 *   provider                   – shared registration body, where tests share one
 *   officialUrl / notes / checkedDate
 * ═══════════════════════════════════════════════════════════════ */

const admissionTestInfo = {
  UCAT: {
    id: 'UCAT', name: 'UCAT', fullName: 'University Clinical Aptitude Test',
    typicalRegistrationWindow: 'opens ~mid-May (booking from late June, deadline mid-September)',
    typicalTestWindow: 'window mid-July to late September',
    regShort: '~May–Sep',
    regOpensMonth: 5,
    officialUrl: 'https://www.ucat.ac.uk/',
    notes: 'Book early for the widest choice of dates and centres. Results go automatically to your chosen universities.',
    checkedDate: '2026-07-02',
  },
  TMUA: {
    id: 'TMUA', name: 'TMUA', fullName: 'Test of Mathematics for University Admission',
    typicalRegistrationWindow: 'opens ~20 July, deadline late September',
    typicalTestWindow: 'sittings mid-October (or early January)',
    regShort: '~Jul–Sep',
    regOpensMonth: 7,
    officialUrl: 'https://esat-tmua.ac.uk/',
    provider: 'UAT UK',   // per the header note: ESAT/TMUA/TARA share one registration
    notes: 'Oxbridge applicants must sit the October sitting. Used by Cambridge, Imperial, LSE, Warwick, Durham and others.',
    checkedDate: '2026-07-02',
  },
  ESAT: {
    id: 'ESAT', name: 'ESAT', fullName: 'Engineering and Science Admissions Test',
    typicalRegistrationWindow: 'opens ~20 July, deadline late September',
    typicalTestWindow: 'sittings mid-October (or early January)',
    regShort: '~Jul–Sep',
    regOpensMonth: 7,
    officialUrl: 'https://esat-tmua.ac.uk/',
    provider: 'UAT UK',   // per the header note: ESAT/TMUA/TARA share one registration
    notes: 'Cambridge and Imperial engineering/science courses. Oxbridge applicants must sit the October sitting.',
    checkedDate: '2026-07-02',
  },
  TARA: {
    id: 'TARA', name: 'TARA', fullName: 'Test of Academic Reasoning for Admissions',
    typicalRegistrationWindow: 'opens ~20 July, deadline late September (second window Oct–Dec)',
    typicalTestWindow: 'sittings mid-October (or early January)',
    regShort: '~Jul–Sep',
    regOpensMonth: 7,
    officialUrl: 'https://esat-tmua.ac.uk/about-the-tests/tara/',
    provider: 'UAT UK',   // per the header note: ESAT/TMUA/TARA share one registration
    notes: 'New UAT UK reasoning test used by Oxford and UCL for selected courses from 2026/27.',
    checkedDate: '2026-07-02',
  },
  LNAT: {
    id: 'LNAT', name: 'LNAT', fullName: 'National Admissions Test for Law',
    typicalRegistrationWindow: 'opens ~1 August, book by mid-September for early deadlines',
    typicalTestWindow: 'from 1 September; sit by ~15 October for Oxford/Cambridge, later for most others',
    regShort: '~Aug–Sep',
    regOpensMonth: 8,
    officialUrl: 'https://lnat.ac.uk/',
    notes: 'One sitting allowed per cycle. Each university sets its own sit-by date — check yours.',
    checkedDate: '2026-07-02',
  },
  STEP: {
    id: 'STEP', name: 'STEP', fullName: 'Sixth Term Examination Paper (Mathematics)',
    typicalRegistrationWindow: 'opens ~1 March, deadline early May',
    typicalTestWindow: 'papers in early–mid June, during Year 13 exam season',
    regShort: '~Mar–May',
    regOpensMonth: 3,
    officialUrl: 'https://www.ocr.org.uk/administration/step-mathematics/',
    notes: 'Sat AFTER offers — usually a condition of a Cambridge (and some Warwick/Imperial) maths offer, not a pre-application test.',
    checkedDate: '2026-07-02',
  },
  LSAT: {
    id: 'LSAT', name: 'LSAT', fullName: 'Law School Admission Test (US)',
    typicalRegistrationWindow: 'year-round — register ~6–8 weeks before your chosen date',
    typicalTestWindow: '~8 sittings a year (Aug, Sep, Oct, Nov, Jan, Feb, Apr, Jun)',
    regShort: 'year-round',
    regOpensMonth: 90,
    officialUrl: 'https://www.lsac.org/lsat',
    notes: "For US LAW SCHOOL after your bachelor's — not needed for undergraduate applications. Shown for long-term planning.",
    checkedDate: '2026-07-02',
  },
  MCAT: {
    id: 'MCAT', name: 'MCAT', fullName: 'Medical College Admission Test (US)',
    typicalRegistrationWindow: 'opens ~late October for the following year',
    typicalTestWindow: '~31 dates January–September',
    regShort: 'year-round',
    regOpensMonth: 91,
    officialUrl: 'https://students-residents.aamc.org/taking-mcat-exam/take-mcat-exam',
    notes: "For US MEDICAL SCHOOL after your bachelor's — not needed for undergraduate applications. Shown for long-term planning.",
    checkedDate: '2026-07-02',
  },
};

// Node test-harness compatibility (browser loads this as a plain script).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { admissionTestInfo };
}
