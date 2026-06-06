/**
 * courses – Altiora course data.
 *
 * requirements.essential  – tags the student MUST have (RED if missing)
 * requirements.preferred  – tags that strengthen the application (AMBER if missing, GREEN if all met)
 * requirements.useful     – nice-to-have; shown as context
 *
 * category – used for the course interest filter in the UI:
 *   'medicine' | 'cs' | 'engineering' | 'economics' | 'law' |
 *   'business' | 'sciences' | 'psychology' | 'architecture'
 */

const courses = [

  /* ══════════════════════════════════════════════════════════════
   * UNITED KINGDOM
   * ══════════════════════════════════════════════════════════════ */

  // ── Medicine ──────────────────────────────────────────────────
  {
    id: "uk-medicine-imperial", name: "Medicine MBBS",
    university: "Imperial College London", country: "UK", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard","Physics"], useful: ["Psychology"] },
    notes: "UCAT required. AAA including Chemistry and Biology. Graduate entry available separately.",
  },
  {
    id: "uk-medicine-ucl", name: "Medicine MBBS",
    university: "University College London", country: "UK", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard","Physics"], useful: ["Psychology"] },
    notes: "UCAT required. AAA including Chemistry and Biology.",
  },
  {
    id: "uk-medicine-oxford", name: "Medicine MBChB",
    university: "University of Oxford", country: "UK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Psychology"] },
    notes: "BMAT required. A*AA. Chemistry and one of Biology/Physics/Maths required. Interview essential.",
  },
  {
    id: "uk-biomedical-ucl", name: "Biomedical Sciences BSc",
    university: "University College London", country: "UK", degreeLevel: "BSc", category: "medicine",
    requirements: { essential: ["Biology"], preferred: ["Chemistry","Mathematics_Standard"], useful: ["Psychology","Physics"] },
    notes: "AAB. Biology essential; Chemistry strongly preferred. Good route into graduate medicine.",
  },

  // ── Computer Science ──────────────────────────────────────────
  {
    id: "uk-cs-oxford", name: "Computer Science BA/MEng",
    university: "University of Oxford", country: "UK", degreeLevel: "MEng", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "A*AA. MAT required. Interview. Further Mathematics strongly recommended.",
  },
  {
    id: "uk-cs-cambridge", name: "Computer Science BA",
    university: "University of Cambridge", country: "UK", degreeLevel: "BA", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics","Computer_Science"], useful: ["Statistics"] },
    notes: "A*A*A. Further Mathematics highly recommended. STEP or TMUA may be required.",
  },
  {
    id: "uk-cs-imperial", name: "Computing BEng/MEng",
    university: "Imperial College London", country: "UK", degreeLevel: "MEng", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "A*AA; Mathematics at A*. Further Mathematics strongly recommended.",
  },
  {
    id: "uk-cs-edinburgh", name: "Computer Science BSc",
    university: "University of Edinburgh", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Computer_Science","Physics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAA–AAB. Mathematics required.",
  },
  {
    id: "uk-datascience-ucl", name: "Data Science BSc",
    university: "University College London", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Statistics"], useful: ["Computer_Science","Physics"] },
    notes: "ABB–AAA. Mathematics essential. Statistics or Further Mathematics advantageous.",
  },

  // ── Engineering ───────────────────────────────────────────────
  {
    id: "uk-eng-cambridge", name: "Engineering BA/MEng",
    university: "University of Cambridge", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science","Design_Technology"] },
    notes: "A*A*A. Further Mathematics and Physics essential. Interview required.",
  },
  {
    id: "uk-eng-imperial", name: "Mechanical Engineering MEng",
    university: "Imperial College London", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Design_Technology","Computer_Science"] },
    notes: "A*AA. Mathematics at A* and Physics required.",
  },

  // ── Mathematics ───────────────────────────────────────────────
  {
    id: "uk-maths-cambridge", name: "Mathematics BA/MMath",
    university: "University of Cambridge", country: "UK", degreeLevel: "MMath", category: "sciences",
    requirements: { essential: ["Mathematics_Standard","Mathematics_Advanced"], preferred: [], useful: ["Physics","Statistics","Computer_Science"] },
    notes: "A*A*A. Further Mathematics essentially required. STEP mandatory. One of the most competitive mathematics courses globally.",
  },
  {
    id: "uk-maths-oxford", name: "Mathematics MMath",
    university: "University of Oxford", country: "UK", degreeLevel: "MMath", category: "sciences",
    requirements: { essential: ["Mathematics_Standard","Mathematics_Advanced"], preferred: [], useful: ["Physics","Statistics"] },
    notes: "A*A*A. Further Mathematics required. MAT required. Interview.",
  },
  {
    id: "uk-physics-oxford", name: "Physics MPhys",
    university: "University of Oxford", country: "UK", degreeLevel: "MPhys", category: "sciences",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science"] },
    notes: "A*AA. Physics and Mathematics required. Further Mathematics strongly advantageous. PAT required.",
  },
  {
    id: "uk-natsci-cambridge", name: "Natural Sciences BA/MSci",
    university: "University of Cambridge", country: "UK", degreeLevel: "MSci", category: "sciences",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Physics","Chemistry","Biology","Mathematics_Advanced"], useful: ["Computer_Science"] },
    notes: "A*A*A. Three sciences (including Maths) required. Further Mathematics strongly recommended.",
  },

  // ── Economics & Finance ───────────────────────────────────────
  {
    id: "uk-economics-lse", name: "Economics BSc",
    university: "London School of Economics", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Physics","Computer_Science"] },
    notes: "A*AA. Mathematics at A* essential. Further Mathematics highly advantageous. LSESAT required.",
  },
  {
    id: "uk-economics-oxford", name: "Philosophy, Politics and Economics (PPE) BA",
    university: "University of Oxford", country: "UK", degreeLevel: "BA", category: "economics",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Economics"], useful: ["Mathematics_Advanced","History","Philosophy","Sociology"] },
    notes: "AAA. No specific subjects required. TSA required. Interview essential.",
  },
  {
    id: "uk-finance-imperial", name: "Finance BSc",
    university: "Imperial College London", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Computer_Science"] },
    notes: "A*AA. Mathematics at A* essential. Further Mathematics strongly recommended.",
  },
  {
    id: "uk-accountingfinance-lse", name: "Accounting and Finance BSc",
    university: "London School of Economics", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Business"] },
    notes: "A*AA. Mathematics essential. One of the most sought-after finance degrees in the UK.",
  },
  {
    id: "uk-politics-ucl", name: "Politics and Economics BSc",
    university: "University College London", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: [], preferred: ["Economics","Mathematics_Standard"], useful: ["History","Sociology","Mathematics_Advanced"] },
    notes: "AAA. No specific subjects required. Quantitative methods modules require comfort with maths.",
  },

  // ── Management / Business ─────────────────────────────────────
  {
    id: "uk-management-imperial", name: "Business School (Management) BSc",
    university: "Imperial College London", country: "UK", degreeLevel: "BSc", category: "business",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Economics"], useful: ["Mathematics_Advanced","Business","Statistics"] },
    notes: "AAA. No specific requirements. Strong quantitative and analytical skills expected.",
  },

  // ── Law ───────────────────────────────────────────────────────
  {
    id: "uk-law-kcl", name: "Law LLB",
    university: "King's College London", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English","Law","Philosophy"], useful: ["Economics","Sociology"] },
    notes: "AAA. LNAT required. Essay-writing subjects strongly recommended.",
  },
  {
    id: "uk-law-oxford", name: "Law (Jurisprudence) BA",
    university: "University of Oxford", country: "UK", degreeLevel: "BA", category: "law",
    requirements: { essential: [], preferred: ["History","English","Philosophy","Law"], useful: ["Economics"] },
    notes: "AAA. LNAT required. Interview. History or English Literature strongly recommended.",
  },

  // ── Psychology ────────────────────────────────────────────────
  {
    id: "uk-psychology-bath", name: "Psychology BSc",
    university: "University of Bath", country: "UK", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Psychology","Biology","Mathematics_Standard","Chemistry"], useful: ["Statistics","Sociology"] },
    notes: "AAB. Psychology and/or a science preferred.",
  },
  {
    id: "uk-psychology-ucl", name: "Psychology BSc",
    university: "University College London", country: "UK", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Biology","Psychology","Mathematics_Standard"], useful: ["Chemistry","Statistics"] },
    notes: "AAA. Science or maths background beneficial.",
  },

  // ── Architecture ──────────────────────────────────────────────
  {
    id: "uk-architecture-ucl", name: "Architecture BSc",
    university: "University College London (Bartlett)", country: "UK", degreeLevel: "BSc", category: "architecture",
    requirements: { essential: [], preferred: ["Art","Mathematics_Standard","Physics","Design_Technology"], useful: ["History","Geography"] },
    notes: "AAB. Portfolio required. Art, Maths or Physics preferred.",
  },

  /* ══════════════════════════════════════════════════════════════
   * UNITED STATES
   * ══════════════════════════════════════════════════════════════ */

  // ── Computer Science ──────────────────────────────────────────
  {
    id: "us-cs-mit", name: "Computer Science and Engineering BS",
    university: "Massachusetts Institute of Technology (MIT)", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Physics","Computer_Science"], useful: ["Statistics","Chemistry","Biology"] },
    notes: "Highly selective. AP Calculus BC (5) and AP Physics C strongly recommended. SAT/ACT required.",
  },
  {
    id: "us-cs-stanford", name: "Computer Science BS",
    university: "Stanford University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics","Economics","Biology"] },
    notes: "AP Calculus BC and AP CS A highly recommended. Strong holistic review.",
  },
  {
    id: "us-cs-cmu", name: "Computer Science BS",
    university: "Carnegie Mellon University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Mathematics_Standard","Statistics"] },
    notes: "AP Calculus BC essential. AP CS A and AP Physics C recommended.",
  },
  {
    id: "us-cs-columbia", name: "Computer Science BA",
    university: "Columbia University", country: "US", degreeLevel: "BA", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Physics","Computer_Science"], useful: ["Statistics","Economics"] },
    notes: "AP Calculus BC strongly recommended. Part of the liberal arts core curriculum.",
  },

  // ── Engineering ───────────────────────────────────────────────
  {
    id: "us-eng-caltech", name: "Engineering and Applied Science BS",
    university: "California Institute of Technology (Caltech)", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry","Computer_Science"], useful: ["Biology","Statistics"] },
    notes: "AP Calculus BC, AP Physics C required at minimum. Extremely selective.",
  },

  // ── Mathematics ───────────────────────────────────────────────
  {
    id: "us-maths-mit", name: "Mathematics BS",
    university: "Massachusetts Institute of Technology (MIT)", country: "US", degreeLevel: "BS", category: "sciences",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Physics"], useful: ["Statistics","Computer_Science"] },
    notes: "AP Calculus BC (5) expected. Strong theoretical foundation required.",
  },

  // ── Economics ─────────────────────────────────────────────────
  {
    id: "us-economics-harvard", name: "Economics AB",
    university: "Harvard University", country: "US", degreeLevel: "AB", category: "economics",
    requirements: { essential: [], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics","Mathematics_Standard","Computer_Science"] },
    notes: "Holistic admissions. AP Calculus BC and AP Micro/Macroeconomics recommended. Research experience valued.",
  },
  {
    id: "us-economics-princeton", name: "Economics BA",
    university: "Princeton University", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: [], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Computer_Science"] },
    notes: "No specific requirements. Mathematics heavily used in coursework — calculus and statistics essential.",
  },
  {
    id: "us-business-wharton", name: "Business Economics BS",
    university: "University of Pennsylvania (Wharton)", country: "US", degreeLevel: "BS", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics","Computer_Science","Business"] },
    notes: "AP Calculus BC and AP Microeconomics recommended. Highly competitive undergraduate business programme.",
  },

  // ── Sciences ──────────────────────────────────────────────────
  {
    id: "us-bio-harvard", name: "Biological Sciences AB",
    university: "Harvard University", country: "US", degreeLevel: "AB", category: "sciences",
    requirements: { essential: ["Biology","Chemistry"], preferred: ["Mathematics_Standard","Physics","Mathematics_Advanced"], useful: ["Statistics","Computer_Science"] },
    notes: "AP Biology and AP Chemistry recommended. Holistic admissions.",
  },
  {
    id: "us-biology-mit", name: "Biology BS",
    university: "Massachusetts Institute of Technology (MIT)", country: "US", degreeLevel: "BS", category: "sciences",
    requirements: { essential: ["Biology","Chemistry","Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics","Computer_Science"], useful: ["Statistics"] },
    notes: "Strong calculus and chemistry background essential.",
  },

  /* ══════════════════════════════════════════════════════════════
   * NETHERLANDS
   * ══════════════════════════════════════════════════════════════ */

  {
    id: "nl-psychology-uva", name: "Psychologie (Psychology) BSc",
    university: "Universiteit van Amsterdam (UvA)", country: "Netherlands", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Biology","Sociology"], useful: ["Statistics","Philosophy"] },
    notes: "Numerus fixus: 425 places. Lottery and GPA selection. Dutch or English intake.",
  },
  {
    id: "nl-medicine-erasmus", name: "Geneeskunde (Medicine) MD",
    university: "Erasmus MC / Erasmus University Rotterdam", country: "Netherlands", degreeLevel: "MD", category: "medicine",
    requirements: { essential: ["Biology","Chemistry"], preferred: ["Mathematics_Standard","Physics"], useful: ["Psychology"] },
    notes: "Numerus fixus. Entrance via selection procedure. All instruction in Dutch; C1 Dutch required.",
  },
  {
    id: "nl-cs-tudelft", name: "Computer Science and Engineering BSc",
    university: "Delft University of Technology (TU Delft)", country: "Netherlands", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics","Design_Technology"] },
    notes: "Wiskunde B required. English-medium MSc available. Strong STEM focus.",
  },
  {
    id: "nl-ib-maastricht", name: "International Business BSc",
    university: "Maastricht University", country: "Netherlands", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Business"], useful: ["Language_German","Language_French","Statistics"] },
    notes: "Wiskunde A or B required. Problem-based learning. Highly international; English-taught. Numerus fixus.",
  },
  {
    id: "nl-datascience-uva", name: "Data Science BSc",
    university: "Universiteit van Amsterdam (UvA) / VU Amsterdam", country: "Netherlands", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Statistics"], useful: ["Physics","Economics"] },
    notes: "Wiskunde B (grade 7+ recommended). Joint UvA/VU programme. English-taught. Numerus fixus: 240 places.",
  },
  {
    id: "nl-economics-eur", name: "Economics BSc",
    university: "Erasmus University Rotterdam", country: "Netherlands", degreeLevel: "BSc", category: "economics",
    requirements: { essential: [], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Business","Mathematics_Standard"] },
    notes: "Wiskunde B preferred. One of Europe's leading economics programmes. English and Dutch tracks available.",
  },
  {
    id: "nl-engineering-tue", name: "Mechanical Engineering BSc",
    university: "Eindhoven University of Technology (TU/e)", country: "Netherlands", degreeLevel: "BSc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: [], useful: ["Design_Technology","Computer_Science","Chemistry"] },
    notes: "Wiskunde B and Natuurkunde required. Taught in Dutch for BSc; English-medium MSc available.",
  },
  {
    id: "nl-law-uva", name: "Rechtsgeleerdheid (Law) LLB",
    university: "Universiteit van Amsterdam (UvA)", country: "Netherlands", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","Philosophy"], useful: ["Economics","Sociology","English_Language"] },
    notes: "No specific subjects required. Dutch or English law track. Critical writing and analytical skills essential.",
  },
  {
    id: "nl-physics-uva", name: "Physics and Astronomy BSc",
    university: "Universiteit van Amsterdam (UvA)", country: "Netherlands", degreeLevel: "BSc", category: "sciences",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: [], useful: ["Computer_Science","Chemistry"] },
    notes: "Wiskunde B and Natuurkunde required. English-taught programme.",
  },

  /* ══════════════════════════════════════════════════════════════
   * SINGAPORE
   * ══════════════════════════════════════════════════════════════ */

  {
    id: "sg-law-nus", name: "Law LLB",
    university: "National University of Singapore (NUS)", country: "Singapore", degreeLevel: "LLB", category: "law",
    requirements: { essential: ["English"], preferred: ["History","Economics","Philosophy"], useful: ["Mathematics_Standard","Sociology"] },
    notes: "Minimum AAA/B at H2/H1. GP grade important. Admissions test and interview required.",
  },
  {
    id: "sg-law-smu", name: "Law JD",
    university: "Singapore Management University (SMU)", country: "Singapore", degreeLevel: "JD", category: "law",
    requirements: { essential: ["English"], preferred: ["History","Economics","Philosophy"], useful: ["Sociology"] },
    notes: "JD is a graduate programme. Admissions test and interview. Emphasis on business law.",
  },
  {
    id: "sg-medicine-ntu", name: "Medicine MBBS",
    university: "Nanyang Technological University (NTU) – LKC Medicine", country: "Singapore", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Psychology"] },
    notes: "H2 Chemistry and H2 Biology required. UCAT ANZ and interview required. Joint programme with Imperial College London.",
  },
  {
    id: "sg-medicine-nus", name: "Medicine MBBS",
    university: "National University of Singapore (NUS) – Yong Loo Lin", country: "Singapore", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Psychology"] },
    notes: "H2 Chemistry and H2 Biology required. UCAT ANZ required. Interview essential.",
  },
  {
    id: "sg-economics-nus", name: "Economics BSc",
    university: "National University of Singapore (NUS)", country: "Singapore", degreeLevel: "BSc", category: "economics",
    requirements: { essential: [], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Mathematics_Standard","Computer_Science"] },
    notes: "H2 Mathematics strongly recommended. Strong quantitative focus. Highly ranked in Asia.",
  },
  {
    id: "sg-business-smu", name: "Business Management BSc",
    university: "Singapore Management University (SMU)", country: "Singapore", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics","Computer_Science","Language_Mandarin"] },
    notes: "H1 or H2 Mathematics required. Participation-based pedagogy. Strong interview process.",
  },
  {
    id: "sg-business-nus", name: "Business Administration BBA",
    university: "National University of Singapore (NUS)", country: "Singapore", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics","Language_Mandarin"] },
    notes: "H2 Mathematics strongly recommended. One of Asia's top business programmes. Highly competitive.",
  },
  {
    id: "sg-cs-nus", name: "Computer Science BSc",
    university: "National University of Singapore (NUS)", country: "Singapore", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Physics","Computer_Science"], useful: ["Statistics","Economics"] },
    notes: "H2 Mathematics required. H2 Further Mathematics or H2 Computing advantageous. Highly competitive.",
  },
  {
    id: "sg-engineering-nus", name: "Engineering BEng",
    university: "National University of Singapore (NUS)", country: "Singapore", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: [], useful: ["Chemistry","Computer_Science","Design_Technology"] },
    notes: "H2 Mathematics and H2 Physics required. Covers Electrical, Computer, Civil, Mechanical and Chemical Engineering specialisations.",
  },
  {
    id: "sg-engineering-ntu", name: "Engineering BEng",
    university: "Nanyang Technological University (NTU)", country: "Singapore", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: [], useful: ["Chemistry","Computer_Science"] },
    notes: "H2 Mathematics and H2 Physics required. NTU Engineering is ranked in the global top 10.",
  },

  /* ══════════════════════════════════════════════════════════════
   * HONG KONG
   * ══════════════════════════════════════════════════════════════ */

  // ── Medicine ──────────────────────────────────────────────────
  {
    id: "hk-medicine-hku", name: "Medicine MBBS",
    university: "The University of Hong Kong (HKU)", country: "Hong_Kong", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard","Physics"], useful: ["Mathematics_Advanced"] },
    notes: "DSE: Level 5** in Chemistry and Biology. Mathematics M2 advantageous. Interview required.",
  },
  {
    id: "hk-medicine-cuhk", name: "Medicine and Surgery MBBS",
    university: "The Chinese University of Hong Kong (CUHK)", country: "Hong_Kong", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard","Physics"], useful: ["Mathematics_Advanced"] },
    notes: "DSE: Level 5** in Chemistry and Biology. JUPAS application. Interview required.",
  },

  // ── Law ───────────────────────────────────────────────────────
  {
    id: "hk-law-cuhk", name: "Law LLB",
    university: "The Chinese University of Hong Kong (CUHK)", country: "Hong_Kong", degreeLevel: "LLB", category: "law",
    requirements: { essential: ["English"], preferred: ["History","Economics"], useful: ["Sociology","Philosophy"] },
    notes: "Level 5 in English Language required. Level 5+ in two electives.",
  },
  {
    id: "hk-law-hku", name: "Law LLB",
    university: "The University of Hong Kong (HKU)", country: "Hong_Kong", degreeLevel: "LLB", category: "law",
    requirements: { essential: ["English"], preferred: ["History","Economics"], useful: ["Philosophy","Sociology"] },
    notes: "Exceptional English required (Level 5**). Highly competitive. Common Law tradition.",
  },

  // ── Engineering ───────────────────────────────────────────────
  {
    id: "hk-eng-hkust", name: "Engineering BSc",
    university: "The Hong Kong University of Science and Technology (HKUST)", country: "Hong_Kong", degreeLevel: "BSc", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science","Design_Technology"] },
    notes: "Mathematics M2 (Extended Part) strongly recommended. DSE Physics and Mathematics compulsory part required.",
  },
  {
    id: "hk-engineering-hku", name: "Engineering BEng",
    university: "The University of Hong Kong (HKU)", country: "Hong_Kong", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "Mathematics M2 recommended. Broad-based first year across all engineering disciplines. Interview for some specialisations.",
  },
  {
    id: "hk-engineering-cuhk", name: "Engineering BEng",
    university: "The Chinese University of Hong Kong (CUHK)", country: "Hong_Kong", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "Mathematics M2 strongly recommended. Specialisations include Computer, Electronic, Mechanical and Systems Engineering.",
  },

  // ── Computer Science ──────────────────────────────────────────
  {
    id: "hk-cs-hkust", name: "Computer Science BSc",
    university: "The Hong Kong University of Science and Technology (HKUST)", country: "Hong_Kong", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Statistics","Computer_Science"] },
    notes: "Mathematics M1 or M2 highly recommended. ICT elective advantageous.",
  },
  {
    id: "hk-cs-hku", name: "Computer Science BSc",
    university: "The University of Hong Kong (HKU)", country: "Hong_Kong", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Computer_Science","Statistics"] },
    notes: "Mathematics M2 recommended. Strong industry connections. Top-ranked CS programme in Asia.",
  },
  {
    id: "hk-cs-cuhk", name: "Computer Science BSc",
    university: "The Chinese University of Hong Kong (CUHK)", country: "Hong_Kong", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Physics","Computer_Science","Statistics"] },
    notes: "Mathematics M1 or M2 recommended. Strong focus on AI and software engineering.",
  },

  // ── Economics ─────────────────────────────────────────────────
  {
    id: "hk-economics-hku", name: "Economics BEcon",
    university: "The University of Hong Kong (HKU)", country: "Hong_Kong", degreeLevel: "BEcon", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics","Business"] },
    notes: "DSE Mathematics compulsory part required. Economics elective preferred. Strong quantitative component.",
  },
  {
    id: "hk-economics-cuhk", name: "Economics BEcon",
    university: "The Chinese University of Hong Kong (CUHK)", country: "Hong_Kong", degreeLevel: "BEcon", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics","Business"] },
    notes: "Mathematics M1 or M2 recommended. One of Hong Kong's most respected economics programmes.",
  },
  {
    id: "hk-economics-hkust", name: "Economics and Finance BSc",
    university: "The Hong Kong University of Science and Technology (HKUST)", country: "Hong_Kong", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics","Computer_Science"] },
    notes: "Mathematics M2 strongly recommended. Strong quantitative approach. Excellent for finance careers.",
  },

  // ── Business ──────────────────────────────────────────────────
  {
    id: "hk-business-hku", name: "Business Administration BBA",
    university: "The University of Hong Kong (HKU)", country: "Hong_Kong", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics"], useful: ["Business","Statistics","Mathematics_Advanced","Language_Mandarin"] },
    notes: "BAFS or Economics elective preferred. Mathematics compulsory part required. English proficiency essential.",
  },
  {
    id: "hk-business-cuhk", name: "Business Administration BBA",
    university: "The Chinese University of Hong Kong (CUHK)", country: "Hong_Kong", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics","Language_Mandarin"] },
    notes: "Mathematics M1 or M2 recommended. BAFS or Economics elective preferred. Top-ranked Asian business school.",
  },
  {
    id: "hk-business-hkust", name: "Business and Management BBA",
    university: "The Hong Kong University of Science and Technology (HKUST)", country: "Hong_Kong", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics","Computer_Science"] },
    notes: "Mathematics M2 recommended. HKUST Business School is consistently ranked #1 in Asia. Strong finance and tech focus.",
  },

];
