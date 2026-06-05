/**
 * courses – seed data for the Altiora subject combination checker.
 *
 * requirements.essential  – universal tags the student MUST have
 * requirements.preferred  – tags that strengthen the application (any match helps)
 * requirements.useful     – nice-to-have; mentioned in contextual advice
 *
 * Universal tags are defined in qualificationMappings.js.
 */

const courses = [

  /* ══════════════════════════════════════════════════════════════
   * UNITED KINGDOM
   * ══════════════════════════════════════════════════════════════ */

  // ── Medicine ──────────────────────────────────────────────────
  {
    id: "uk-medicine-imperial",
    name: "Medicine MBBS",
    university: "Imperial College London",
    country: "UK",
    degreeLevel: "MBBS",
    requirements: {
      essential:  ["Chemistry", "Biology"],
      preferred:  ["Mathematics_Standard", "Physics"],
      useful:     ["Psychology"],
    },
    notes: "UCAT required. Three A-levels including Chemistry and Biology at AAA minimum. BMAT previously used; check current admissions cycle. Graduate entry available separately.",
  },
  {
    id: "uk-medicine-ucl",
    name: "Medicine MBBS",
    university: "University College London",
    country: "UK",
    degreeLevel: "MBBS",
    requirements: {
      essential:  ["Chemistry", "Biology"],
      preferred:  ["Mathematics_Standard", "Physics"],
      useful:     ["Psychology"],
    },
    notes: "UCAT required. AAA at A-level including Chemistry and Biology. Strong personal statement and work experience essential.",
  },
  {
    id: "uk-medicine-oxford",
    name: "Medicine (Pre-Clinical & Clinical) MBChB",
    university: "University of Oxford",
    country: "UK",
    degreeLevel: "MBChB",
    requirements: {
      essential:  ["Chemistry", "Biology"],
      preferred:  ["Mathematics_Advanced", "Physics"],
      useful:     ["Psychology"],
    },
    notes: "BMAT required. A*AA at A-level. Chemistry and one of Biology/Physics/Maths required. Interview essential.",
  },

  // ── Computer Science ──────────────────────────────────────────
  {
    id: "uk-cs-oxford",
    name: "Computer Science BA/MEng",
    university: "University of Oxford",
    country: "UK",
    degreeLevel: "MEng",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Mathematics_Advanced", "Computer_Science", "Physics"],
      useful:     ["Statistics"],
    },
    notes: "A*AA required. Mathematics essential; Further Mathematics strongly recommended. MAT (Mathematics Admissions Test) required. Interview.",
  },
  {
    id: "uk-cs-cambridge",
    name: "Computer Science BA",
    university: "University of Cambridge",
    country: "UK",
    degreeLevel: "BA",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Mathematics_Advanced", "Physics", "Computer_Science"],
      useful:     ["Statistics"],
    },
    notes: "A*A*A required. Further Mathematics highly recommended. STEP or TMUA may be required depending on college.",
  },
  {
    id: "uk-cs-imperial",
    name: "Computing BEng/MEng",
    university: "Imperial College London",
    country: "UK",
    degreeLevel: "MEng",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Mathematics_Advanced", "Computer_Science", "Physics"],
      useful:     ["Statistics"],
    },
    notes: "A*AA required; Mathematics at A*. Further Mathematics strongly recommended.",
  },
  {
    id: "uk-cs-edinburgh",
    name: "Computer Science BSc",
    university: "University of Edinburgh",
    country: "UK",
    degreeLevel: "BSc",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Computer_Science", "Physics", "Mathematics_Advanced"],
      useful:     ["Statistics"],
    },
    notes: "AAA-AAB. Mathematics required. Admissions test may apply.",
  },

  // ── Engineering ───────────────────────────────────────────────
  {
    id: "uk-eng-cambridge",
    name: "Engineering BA/MEng",
    university: "University of Cambridge",
    country: "UK",
    degreeLevel: "MEng",
    requirements: {
      essential:  ["Mathematics_Standard", "Physics"],
      preferred:  ["Mathematics_Advanced", "Chemistry", "Computer_Science"],
      useful:     ["Design_Technology"],
    },
    notes: "A*A*A required. Further Mathematics and Physics essential. Interview required.",
  },
  {
    id: "uk-eng-imperial",
    name: "Mechanical Engineering MEng",
    university: "Imperial College London",
    country: "UK",
    degreeLevel: "MEng",
    requirements: {
      essential:  ["Mathematics_Standard", "Physics"],
      preferred:  ["Mathematics_Advanced", "Chemistry", "Design_Technology"],
      useful:     ["Computer_Science"],
    },
    notes: "A*AA. Mathematics at A* and Physics required.",
  },

  // ── Economics ─────────────────────────────────────────────────
  {
    id: "uk-economics-lse",
    name: "Economics BSc",
    university: "London School of Economics",
    country: "UK",
    degreeLevel: "BSc",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Mathematics_Advanced", "Economics", "Statistics"],
      useful:     ["Physics", "Computer_Science"],
    },
    notes: "A*AA. Mathematics at A* essential. Further Mathematics highly advantageous. Admissions test (LSESAT or equivalent) required.",
  },
  {
    id: "uk-economics-oxford",
    name: "Philosophy, Politics and Economics (PPE) BA",
    university: "University of Oxford",
    country: "UK",
    degreeLevel: "BA",
    requirements: {
      essential:  [],
      preferred:  ["Mathematics_Standard", "Economics", "History", "Philosophy"],
      useful:     ["Mathematics_Advanced", "Sociology"],
    },
    notes: "AAA. No specific subjects required. TSA required. Interview essential. Strong essay-based subjects advantageous.",
  },

  // ── Law ───────────────────────────────────────────────────────
  {
    id: "uk-law-kcl",
    name: "Law LLB",
    university: "King's College London",
    country: "UK",
    degreeLevel: "LLB",
    requirements: {
      essential:  [],
      preferred:  ["History", "English", "Law", "Philosophy"],
      useful:     ["Economics", "Sociology"],
    },
    notes: "AAA. No specific subjects required. LNAT required. Essay-writing subjects strongly recommended.",
  },
  {
    id: "uk-law-oxford",
    name: "Law (Jurisprudence) BA",
    university: "University of Oxford",
    country: "UK",
    degreeLevel: "BA",
    requirements: {
      essential:  [],
      preferred:  ["History", "English", "Philosophy", "Law"],
      useful:     ["Economics"],
    },
    notes: "AAA. LNAT required. Interview. History or English Literature strongly recommended.",
  },

  // ── Psychology ────────────────────────────────────────────────
  {
    id: "uk-psychology-bath",
    name: "Psychology BSc",
    university: "University of Bath",
    country: "UK",
    degreeLevel: "BSc",
    requirements: {
      essential:  [],
      preferred:  ["Psychology", "Biology", "Mathematics_Standard", "Chemistry"],
      useful:     ["Statistics", "Sociology"],
    },
    notes: "AAB. Psychology and/or a science at A-level preferred. Numeracy important for research methods modules.",
  },
  {
    id: "uk-psychology-ucl",
    name: "Psychology BSc",
    university: "University College London",
    country: "UK",
    degreeLevel: "BSc",
    requirements: {
      essential:  [],
      preferred:  ["Biology", "Psychology", "Mathematics_Standard"],
      useful:     ["Chemistry", "Statistics"],
    },
    notes: "AAA. No single required subject. Science or maths background beneficial.",
  },

  // ── Architecture ──────────────────────────────────────────────
  {
    id: "uk-architecture-ucl",
    name: "Architecture BSc",
    university: "University College London (Bartlett)",
    country: "UK",
    degreeLevel: "BSc",
    requirements: {
      essential:  [],
      preferred:  ["Art", "Mathematics_Standard", "Physics", "Design_Technology"],
      useful:     ["History", "Geography"],
    },
    notes: "AAB. Portfolio required. Art, Maths or Physics preferred. Design Technology also valued.",
  },

  // ── Natural Sciences ──────────────────────────────────────────
  {
    id: "uk-natsci-cambridge",
    name: "Natural Sciences BA/MSci",
    university: "University of Cambridge",
    country: "UK",
    degreeLevel: "MSci",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Physics", "Chemistry", "Biology", "Mathematics_Advanced"],
      useful:     ["Computer_Science"],
    },
    notes: "A*A*A. Three sciences (including Maths) required. Further Mathematics strongly recommended.",
  },

  /* ══════════════════════════════════════════════════════════════
   * UNITED STATES
   * ══════════════════════════════════════════════════════════════ */

  // ── Computer Science ──────────────────────────────────────────
  {
    id: "us-cs-mit",
    name: "Computer Science and Engineering BS",
    university: "Massachusetts Institute of Technology (MIT)",
    country: "US",
    degreeLevel: "BS",
    requirements: {
      essential:  ["Mathematics_Advanced"],
      preferred:  ["Physics", "Computer_Science", "Statistics"],
      useful:     ["Chemistry", "Biology"],
    },
    notes: "Highly selective. AP Calculus BC (5) and AP Physics C strongly recommended. SAT/ACT required. Extracurricular CS projects valued.",
  },
  {
    id: "us-cs-stanford",
    name: "Computer Science BS",
    university: "Stanford University",
    country: "US",
    degreeLevel: "BS",
    requirements: {
      essential:  ["Mathematics_Advanced"],
      preferred:  ["Computer_Science", "Physics", "Statistics"],
      useful:     ["Economics", "Biology"],
    },
    notes: "AP Calculus BC and AP Computer Science A highly recommended. Strong holistic review; research or project experience valued.",
  },
  {
    id: "us-cs-cmu",
    name: "Computer Science BS",
    university: "Carnegie Mellon University",
    country: "US",
    degreeLevel: "BS",
    requirements: {
      essential:  ["Mathematics_Advanced"],
      preferred:  ["Computer_Science", "Physics", "Statistics"],
      useful:     ["Mathematics_Standard"],
    },
    notes: "AP Calculus BC essential. AP CS A and AP Physics C recommended. One of the most competitive CS programmes globally.",
  },

  // ── Engineering ───────────────────────────────────────────────
  {
    id: "us-eng-caltech",
    name: "Engineering and Applied Science BS",
    university: "California Institute of Technology (Caltech)",
    country: "US",
    degreeLevel: "BS",
    requirements: {
      essential:  ["Mathematics_Advanced", "Physics"],
      preferred:  ["Chemistry", "Computer_Science", "Statistics"],
      useful:     ["Biology"],
    },
    notes: "AP Calculus BC, AP Physics C required at minimum. AP Chemistry strongly recommended. Extremely selective.",
  },

  // ── Biology / Life Sciences ───────────────────────────────────
  {
    id: "us-bio-harvard",
    name: "Biological Sciences AB",
    university: "Harvard University",
    country: "US",
    degreeLevel: "AB",
    requirements: {
      essential:  ["Biology", "Chemistry"],
      preferred:  ["Mathematics_Standard", "Physics", "Mathematics_Advanced"],
      useful:     ["Statistics", "Computer_Science"],
    },
    notes: "AP Biology and AP Chemistry recommended. Calculus important for quantitative biology. Holistic admissions — research experience valued.",
  },
  {
    id: "us-biology-mit",
    name: "Biology BS",
    university: "Massachusetts Institute of Technology (MIT)",
    country: "US",
    degreeLevel: "BS",
    requirements: {
      essential:  ["Biology", "Chemistry", "Mathematics_Standard"],
      preferred:  ["Mathematics_Advanced", "Physics", "Computer_Science"],
      useful:     ["Statistics"],
    },
    notes: "Strong calculus and chemistry background essential. AP Calculus BC and AP Chemistry recommended.",
  },

  // ── Business ──────────────────────────────────────────────────
  {
    id: "us-business-wharton",
    name: "Business Economics BS",
    university: "University of Pennsylvania (Wharton)",
    country: "US",
    degreeLevel: "BS",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Economics", "Statistics", "Mathematics_Advanced"],
      useful:     ["Computer_Science", "Business"],
    },
    notes: "Calculus and statistics essential. AP Calculus BC, AP Statistics, AP Microeconomics recommended. Undergraduate business is highly selective.",
  },

  /* ══════════════════════════════════════════════════════════════
   * NETHERLANDS
   * ══════════════════════════════════════════════════════════════ */

  // ── Psychology ────────────────────────────────────────────────
  {
    id: "nl-psychology-uva",
    name: "Psychologie (Psychology) BSc",
    university: "Universiteit van Amsterdam (UvA)",
    country: "Netherlands",
    degreeLevel: "BSc",
    requirements: {
      essential:  [],
      preferred:  ["Mathematics_Standard", "Biology", "Sociology"],
      useful:     ["Statistics", "Philosophy"],
    },
    notes: "Numerus fixus: 425 places per year, selection by lottery and GPA. Wiskunde A or B useful for statistics modules. Dutch or English intake available.",
  },

  // ── Medicine ──────────────────────────────────────────────────
  {
    id: "nl-medicine-erasmus",
    name: "Geneeskunde (Medicine) MD",
    university: "Erasmus MC / Erasmus University Rotterdam",
    country: "Netherlands",
    degreeLevel: "MD",
    requirements: {
      essential:  ["Biology", "Chemistry"],
      preferred:  ["Mathematics_Standard", "Physics"],
      useful:     ["Psychology"],
    },
    notes: "Numerus fixus: entrance via selection procedure (LOOT, weighted lottery or Matching). Wiskunde B preferred. All instruction in Dutch; C1 Dutch required.",
  },

  // ── Computer Science ──────────────────────────────────────────
  {
    id: "nl-cs-tudelft",
    name: "Computer Science and Engineering BSc",
    university: "Delft University of Technology (TU Delft)",
    country: "Netherlands",
    degreeLevel: "BSc",
    requirements: {
      essential:  ["Mathematics_Advanced"],
      preferred:  ["Computer_Science", "Physics", "Statistics"],
      useful:     ["Design_Technology"],
    },
    notes: "Wiskunde B required. Informatica advantageous. Taught in Dutch for BSc; strong English-medium MSc available.",
  },

  // ── International Business ────────────────────────────────────
  {
    id: "nl-ib-maastricht",
    name: "International Business BSc",
    university: "Maastricht University",
    country: "Netherlands",
    degreeLevel: "BSc",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Economics", "Business", "Language_German", "Language_French"],
      useful:     ["Statistics"],
    },
    notes: "Wiskunde A or B required. Problem-based learning format. Highly international; taught in English. Numerus fixus applies.",
  },

  // ── Data Science ──────────────────────────────────────────────
  {
    id: "nl-datascience-uva",
    name: "Data Science BSc",
    university: "Universiteit van Amsterdam (UvA) / VU Amsterdam",
    country: "Netherlands",
    degreeLevel: "BSc",
    requirements: {
      essential:  ["Mathematics_Advanced"],
      preferred:  ["Computer_Science", "Statistics", "Physics"],
      useful:     ["Economics"],
    },
    notes: "Wiskunde B (grade 7+ recommended). Joint programme between UvA and VU. English-taught. Numerus fixus: 240 places.",
  },

  /* ══════════════════════════════════════════════════════════════
   * SINGAPORE
   * ══════════════════════════════════════════════════════════════ */

  // ── Law ───────────────────────────────────────────────────────
  {
    id: "sg-law-nus",
    name: "Law LLB",
    university: "National University of Singapore (NUS)",
    country: "Singapore",
    degreeLevel: "LLB",
    requirements: {
      essential:  ["English"],
      preferred:  ["History", "Economics", "Literature", "Philosophy"],
      useful:     ["Mathematics_Standard", "Sociology"],
    },
    notes: "Minimum AAA/B at H2/H1. GP grade important (min. C). Written admissions test and interview required. General Paper is the 'English' signal here.",
  },
  {
    id: "sg-law-smu",
    name: "Law JD",
    university: "Singapore Management University (SMU)",
    country: "Singapore",
    degreeLevel: "JD",
    requirements: {
      essential:  ["English"],
      preferred:  ["History", "Economics", "Philosophy"],
      useful:     ["Sociology"],
    },
    notes: "JD is a graduate programme; strong undergraduate GPA required. Admissions test and interview. Emphasis on business law.",
  },

  // ── Medicine ──────────────────────────────────────────────────
  {
    id: "sg-medicine-ntu",
    name: "Medicine MBBS",
    university: "Nanyang Technological University (NTU) – LKC Medicine",
    country: "Singapore",
    degreeLevel: "MBBS",
    requirements: {
      essential:  ["Chemistry", "Biology"],
      preferred:  ["Mathematics_Advanced", "Physics"],
      useful:     ["Psychology"],
    },
    notes: "H2 Chemistry and H2 Biology required (or equivalents). UCAT ANZ and interview required. Joint programme with Imperial College London.",
  },
  {
    id: "sg-medicine-nus",
    name: "Medicine MBBS",
    university: "National University of Singapore (NUS) – Yong Soo Lin School of Medicine",
    country: "Singapore",
    degreeLevel: "MBBS",
    requirements: {
      essential:  ["Chemistry", "Biology"],
      preferred:  ["Mathematics_Advanced", "Physics"],
      useful:     ["Psychology"],
    },
    notes: "H2 Chemistry and H2 Biology or equivalent required. UCAT ANZ required. Interview essential.",
  },

  // ── Business ──────────────────────────────────────────────────
  {
    id: "sg-business-smu",
    name: "Business Management BSc",
    university: "Singapore Management University (SMU)",
    country: "Singapore",
    degreeLevel: "BSc",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Economics", "Business", "Statistics"],
      useful:     ["Computer_Science", "Language_Mandarin"],
    },
    notes: "H1 or H2 Mathematics required. Highly interactive, participation-based pedagogy. Strong interview process.",
  },
  {
    id: "sg-cs-nus",
    name: "Computer Science BSc",
    university: "National University of Singapore (NUS)",
    country: "Singapore",
    degreeLevel: "BSc",
    requirements: {
      essential:  ["Mathematics_Advanced"],
      preferred:  ["Computer_Science", "Physics", "Statistics"],
      useful:     ["Economics"],
    },
    notes: "H2 Mathematics required. H2 Further Mathematics or H2 Computing advantageous. Highly competitive; research experience valued.",
  },

  /* ══════════════════════════════════════════════════════════════
   * HONG KONG
   * ══════════════════════════════════════════════════════════════ */

  // ── Medicine ──────────────────────────────────────────────────
  {
    id: "hk-medicine-hku",
    name: "Medicine MBBS",
    university: "The University of Hong Kong (HKU)",
    country: "Hong_Kong",
    degreeLevel: "MBBS",
    requirements: {
      essential:  ["Chemistry", "Biology"],
      preferred:  ["Mathematics_Standard", "Physics"],
      useful:     ["Mathematics_Advanced"],
    },
    notes: "DSE: Level 5** in Chemistry and Biology. Mathematics M2 advantageous. Interview required. HKDSE only or equivalent international qualifications.",
  },
  {
    id: "hk-medicine-cuhk",
    name: "Medicine and Surgery MBBS",
    university: "The Chinese University of Hong Kong (CUHK)",
    country: "Hong_Kong",
    degreeLevel: "MBBS",
    requirements: {
      essential:  ["Chemistry", "Biology"],
      preferred:  ["Mathematics_Standard", "Physics"],
      useful:     ["Mathematics_Advanced"],
    },
    notes: "DSE: Level 5** in Chemistry and Biology. JUPAS application. Interview required.",
  },

  // ── Law ───────────────────────────────────────────────────────
  {
    id: "hk-law-cuhk",
    name: "Law LLB",
    university: "The Chinese University of Hong Kong (CUHK)",
    country: "Hong_Kong",
    degreeLevel: "LLB",
    requirements: {
      essential:  ["English"],
      preferred:  ["History", "Economics", "Chinese History"],
      useful:     ["Sociology", "Philosophy"],
    },
    notes: "Level 5 in English Language required. Level 5+ in two electives. Strong reading and writing skills essential.",
  },
  {
    id: "hk-law-hku",
    name: "Law LLB",
    university: "The University of Hong Kong (HKU)",
    country: "Hong_Kong",
    degreeLevel: "LLB",
    requirements: {
      essential:  ["English"],
      preferred:  ["History", "Economics"],
      useful:     ["Philosophy", "Sociology"],
    },
    notes: "Exceptional English required (Level 5**). Highly competitive. Common Law tradition; English proficiency critical.",
  },

  // ── Engineering ───────────────────────────────────────────────
  {
    id: "hk-eng-hkust",
    name: "Engineering BSc",
    university: "The Hong Kong University of Science and Technology (HKUST)",
    country: "Hong_Kong",
    degreeLevel: "BSc",
    requirements: {
      essential:  ["Mathematics_Standard", "Physics"],
      preferred:  ["Mathematics_Advanced", "Chemistry", "Computer_Science"],
      useful:     ["Design_Technology"],
    },
    notes: "Mathematics M2 (Extended Part) strongly recommended. DSE Physics and Mathematics compulsory part required.",
  },
  {
    id: "hk-cs-hkust",
    name: "Computer Science BSc",
    university: "The Hong Kong University of Science and Technology (HKUST)",
    country: "Hong_Kong",
    degreeLevel: "BSc",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Mathematics_Advanced", "Computer_Science", "Physics"],
      useful:     ["Statistics"],
    },
    notes: "Mathematics M1 or M2 (Extended Part) highly recommended. ICT elective advantageous.",
  },
  {
    id: "hk-business-hku",
    name: "Business Administration BBA",
    university: "The University of Hong Kong (HKU)",
    country: "Hong_Kong",
    degreeLevel: "BBA",
    requirements: {
      essential:  ["Mathematics_Standard"],
      preferred:  ["Economics", "Business", "Statistics"],
      useful:     ["Mathematics_Advanced", "Language_Mandarin"],
    },
    notes: "BAFS or Economics elective preferred. Mathematics compulsory part required. English proficiency essential.",
  },

];
