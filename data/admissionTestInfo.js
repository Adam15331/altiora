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
 * WHAT EACH TEST IS + PREP LINKS — verified against the official test
 * provider's own pages this session (sources listed per test in `descSource`):
 *   UCAT   — ucat.ac.uk: four subtests (Verbal Reasoning, Decision Making,
 *     Quantitative Reasoning, Situational Judgement); "compulsory entry
 *     requirement" for relevant medicine/dentistry courses at consortium
 *     universities → requiredStatus 'required'.
 *   ESAT   — esat-tmua.ac.uk: five 40-minute modules of 27 multiple-choice
 *     questions; most courses take Maths 1 + two more. Requirement is set
 *     per course by the university, so no consequence line is asserted.
 *   TMUA   — esat-tmua.ac.uk: two multiple-choice papers, 2h30 total, on
 *     GCSE-higher/AS-level content. "You must check the university webpages
 *     for your chosen course" → requirement course-dependent.
 *   TARA   — esat-tmua.ac.uk: two multiple-choice modules (Critical Thinking,
 *     Problem Solving) plus a writing task; no subject knowledge needed.
 *     "Must check the university webpages" → requirement course-dependent.
 *   LNAT   — lnat.ac.uk: 42 multiple-choice questions on 12 passages (95 min)
 *     plus one 40-minute essay; "must be taken by all applicants … to
 *     undergraduate law programmes at participating universities", and its
 *     own guidance says the deadline is not waived for candidates who miss
 *     it by mistake → requiredStatus 'required'.
 *   STEP   — ocr.org.uk: three papers built on A-level Maths and Further
 *     Maths pure content. Sat AFTER offers as an offer condition, so the
 *     "can't apply" consequence would be false and is omitted.
 *   LSAT   — lsac.org: two scored Logical Reasoning sections plus one Reading
 *     Comprehension section, and an unscored argumentative writing task.
 *   MCAT   — students-residents.aamc.org: four sections across biology/
 *     biochemistry, chemistry/physics, psychology/sociology, and critical
 *     analysis and reasoning.
 * NOTE: this sandbox cannot open outbound HTTPS, so prepUrls were confirmed
 * as live official pages via the search index (each returned under its
 * official domain with the provider's own page title), not by fetching them.
 *
 * Fields:
 *   name / fullName            – display names
 *   typicalRegistrationWindow  – short fragment, composes after "registration "
 *   typicalTestWindow          – short fragment, composes after "test "
 *   regShort                   – compact window for aggregate lines
 *   regOpensMonth              – 1–12 sort key (order by when planning starts);
 *                                90+ = post-undergraduate tests, listed last
 *   provider                   – shared registration body, where tests share one
 *   description                – ONE factual line: what it assesses + its shape.
 *                                Never difficulty, cutoffs, or target scores.
 *   requiredStatus             – 'required' ONLY where the official source says
 *                                the test is compulsory for the courses that use
 *                                it; 'course-dependent' where the provider tells
 *                                students to check each course; 'offer-condition'
 *                                where it is sat after offers. Drives whether the
 *                                missed-deadline consequence may be stated.
 *   prepUrl / prepLabel        – the provider's own free practice materials
 *   descSource                 – the page the description was taken from
 *   officialUrl / notes / checkedDate
 * ═══════════════════════════════════════════════════════════════ */

const admissionTestInfo = {
  UCAT: {
    id: 'UCAT', name: 'UCAT', fullName: 'University Clinical Aptitude Test',
    typicalRegistrationWindow: 'opens ~mid-May (booking from late June, deadline mid-September)',
    typicalTestWindow: 'window mid-July to late September',
    regShort: '~May–Sep',
    regOpensMonth: 5,
    description: 'Four timed subtests — verbal reasoning, decision making, quantitative reasoning and situational judgement; computer-based, just under two hours.',
    requiredStatus: 'required',
    officialUrl: 'https://www.ucat.ac.uk/',
    prepUrl: 'https://www.ucat.ac.uk/prepare/practice-tests/',
    descSource: 'https://www.ucat.ac.uk/about-ucat/test-format-and-scoring/',
    notes: 'Book early for the widest choice of dates and centres. Results go automatically to your chosen universities.',
    checkedDate: '2026-08-03',
  },
  TMUA: {
    id: 'TMUA', name: 'TMUA', fullName: 'Test of Mathematics for University Admission',
    typicalRegistrationWindow: 'opens ~20 July, deadline late September',
    typicalTestWindow: 'sittings mid-October (or early January)',
    regShort: '~Jul–Sep',
    regOpensMonth: 7,
    description: 'Mathematical reasoning across two multiple-choice papers, 2 hours 30 minutes in total, on GCSE-higher and AS-level content; no calculator.',
    requiredStatus: 'course-dependent',
    officialUrl: 'https://esat-tmua.ac.uk/',
    prepUrl: 'https://esat-tmua.ac.uk/tmua-preparation-materials/',
    descSource: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
    provider: 'UAT UK',   // per the header note: ESAT/TMUA/TARA share one registration
    notes: 'Oxbridge applicants must sit the October sitting. Used by Cambridge, Imperial, LSE, Warwick, Durham and others.',
    checkedDate: '2026-08-03',
  },
  ESAT: {
    id: 'ESAT', name: 'ESAT', fullName: 'Engineering and Science Admissions Test',
    typicalRegistrationWindow: 'opens ~20 July, deadline late September',
    typicalTestWindow: 'sittings mid-October (or early January)',
    regShort: '~Jul–Sep',
    regOpensMonth: 7,
    description: 'Maths and science problem-solving in 40-minute multiple-choice modules of 27 questions each; most courses take Mathematics 1 plus two more, so about two hours; no calculator.',
    requiredStatus: 'course-dependent',
    officialUrl: 'https://esat-tmua.ac.uk/',
    prepUrl: 'https://esat-tmua.ac.uk/esat-preparation-materials/',
    descSource: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
    provider: 'UAT UK',   // per the header note: ESAT/TMUA/TARA share one registration
    notes: 'Cambridge and Imperial engineering/science courses. Oxbridge applicants must sit the October sitting.',
    checkedDate: '2026-08-03',
  },
  TARA: {
    id: 'TARA', name: 'TARA', fullName: 'Test of Academic Reasoning for Admissions',
    typicalRegistrationWindow: 'opens ~20 July, deadline late September (second window Oct–Dec)',
    typicalTestWindow: 'sittings mid-October (or early January)',
    regShort: '~Jul–Sep',
    regOpensMonth: 7,
    description: 'General thinking skills, not subject knowledge — two multiple-choice modules (critical thinking and problem solving) followed by a writing task.',
    requiredStatus: 'course-dependent',
    officialUrl: 'https://esat-tmua.ac.uk/about-the-tests/tara/',
    prepUrl: 'https://esat-tmua.ac.uk/tara-preparation-materials/',
    descSource: 'https://esat-tmua.ac.uk/about-the-tests/tara/',
    provider: 'UAT UK',   // per the header note: ESAT/TMUA/TARA share one registration
    notes: 'New UAT UK reasoning test used by Oxford and UCL for selected courses from 2026/27.',
    checkedDate: '2026-08-03',
  },
  LNAT: {
    id: 'LNAT', name: 'LNAT', fullName: 'National Admissions Test for Law',
    typicalRegistrationWindow: 'opens ~1 August, book by mid-September for early deadlines',
    typicalTestWindow: 'from 1 September; sit by ~15 October for Oxford/Cambridge, later for most others',
    regShort: '~Aug–Sep',
    regOpensMonth: 8,
    description: 'Reading and argument, not law knowledge — 42 multiple-choice questions on 12 passages in 95 minutes, plus one essay in 40 minutes.',
    requiredStatus: 'required',
    officialUrl: 'https://lnat.ac.uk/',
    prepUrl: 'https://lnat.ac.uk/how-to-prepare/practice-test/',
    descSource: 'https://lnat.ac.uk/what-is-lnat/test-format/',
    notes: 'One sitting allowed per cycle. Each university sets its own sit-by date — check yours.',
    checkedDate: '2026-08-03',
  },
  STEP: {
    id: 'STEP', name: 'STEP', fullName: 'Sixth Term Examination Paper (Mathematics)',
    typicalRegistrationWindow: 'opens ~1 March, deadline early May',
    typicalTestWindow: 'papers in early–mid June, during Year 13 exam season',
    regShort: '~Mar–May',
    regOpensMonth: 3,
    description: 'Long-form written maths questions built on A-level Maths and Further Maths pure content, with mechanics and statistics in papers 2 and 3.',
    requiredStatus: 'offer-condition',
    officialUrl: 'https://www.ocr.org.uk/administration/step-mathematics/',
    prepUrl: 'https://www.ocr.org.uk/students/step-mathematics/preparing-for-step/',
    descSource: 'https://www.ocr.org.uk/Images/696329-step-specification-2026.pdf',
    notes: 'Sat AFTER offers — usually a condition of a Cambridge (and some Warwick/Imperial) maths offer, not a pre-application test.',
    checkedDate: '2026-08-03',
  },
  LSAT: {
    id: 'LSAT', name: 'LSAT', fullName: 'Law School Admission Test (US)',
    typicalRegistrationWindow: 'year-round — register ~6–8 weeks before your chosen date',
    typicalTestWindow: '~8 sittings a year (Aug, Sep, Oct, Nov, Jan, Feb, Apr, Jun)',
    regShort: 'year-round',
    regOpensMonth: 90,
    description: 'Reading and reasoning — two logical reasoning sections and one reading comprehension section that count toward your result, plus a separately administered writing task that does not.',
    requiredStatus: 'postgraduate',
    officialUrl: 'https://www.lsac.org/lsat',
    prepUrl: 'https://www.lsac.org/lsat/prep',
    descSource: 'https://www.lsac.org/lsat/prepare/types-lsat-questions',
    notes: "For US LAW SCHOOL after your bachelor's — not needed for undergraduate applications. Shown for long-term planning.",
    checkedDate: '2026-08-03',
  },
  MCAT: {
    id: 'MCAT', name: 'MCAT', fullName: 'Medical College Admission Test (US)',
    typicalRegistrationWindow: 'opens ~late October for the following year',
    typicalTestWindow: '~31 dates January–September',
    regShort: 'year-round',
    regOpensMonth: 91,
    description: 'Four sections — biology and biochemistry, chemistry and physics, psychology and sociology, and critical analysis and reasoning.',
    requiredStatus: 'postgraduate',
    officialUrl: 'https://students-residents.aamc.org/taking-mcat-exam/take-mcat-exam',
    prepUrl: 'https://students-residents.aamc.org/prepare-mcat-exam/prepare-mcat-exam',
    descSource: 'https://students-residents.aamc.org/whats-mcat-exam/publication-chapters/whats-mcat-exam',
    notes: "For US MEDICAL SCHOOL after your bachelor's — not needed for undergraduate applications. Shown for long-term planning.",
    checkedDate: '2026-08-03',
  },
};

// Node test-harness compatibility (browser loads this as a plain script).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { admissionTestInfo };
}
