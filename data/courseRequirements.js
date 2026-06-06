/**
 * courses – Altiora course data.
 *
 * requirements.essential  – tags the student MUST have (RED if missing)
 * requirements.preferred  – tags that strengthen the application (AMBER if missing, GREEN if all met)
 * requirements.useful     – nice-to-have; shown as context
 *
 * category – used for the course interest filter in the UI:
 *   'medicine' | 'cs' | 'engineering' | 'economics' | 'law' |
 *   'business' | 'sciences' | 'psychology' | 'architecture' | 'mathematics'
 */

const courses = [

  /* ══════════════════════════════════════════════════════════════
   * UNITED KINGDOM
   * ══════════════════════════════════════════════════════════════ */

  // ── Oxford ────────────────────────────────────────────────────
  {
    id: "uk-medicine-oxford", name: "Medicine MBChB",
    university: "University of Oxford", country: "UK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Physics"], useful: ["Mathematics_Standard"] },
    notes: "BMAT required. A*AA. Chemistry and Biology essential. Interview essential.",
  },
  {
    id: "uk-cs-oxford", name: "Computer Science BA",
    university: "University of Oxford", country: "UK", degreeLevel: "BA", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "A*AA. MAT required. Further Mathematics strongly recommended.",
  },
  {
    id: "uk-maths-oxford", name: "Mathematics BA",
    university: "University of Oxford", country: "UK", degreeLevel: "BA", category: "mathematics",
    requirements: { essential: ["Mathematics_Standard","Mathematics_Advanced"], preferred: [], useful: ["Physics","Statistics"] },
    notes: "A*A*A. MAT required. Further Mathematics essential.",
  },
  {
    id: "uk-physics-oxford", name: "Physics BA/MPhys",
    university: "University of Oxford", country: "UK", degreeLevel: "MPhys", category: "sciences",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "A*AA. PAT required. Further Mathematics strongly recommended.",
  },
  {
    id: "uk-ppe-oxford", name: "Philosophy, Politics & Economics (PPE) BA",
    university: "University of Oxford", country: "UK", degreeLevel: "BA", category: "economics",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Economics"], useful: ["History","Philosophy"] },
    notes: "AAA. No required subjects. Strong essay-writing and analytical skills expected.",
  },
  {
    id: "uk-engineering-oxford", name: "Engineering Science MEng",
    university: "University of Oxford", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "A*AAA. PAT recommended. Further Mathematics very strongly recommended.",
  },
  {
    id: "uk-law-oxford", name: "Law (Jurisprudence) BA",
    university: "University of Oxford", country: "UK", degreeLevel: "BA", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy"] },
    notes: "AAA. LNAT required. No specific subject requirements. Interview essential.",
  },
  {
    id: "uk-biochemistry-oxford", name: "Biochemistry MBiochem",
    university: "University of Oxford", country: "UK", degreeLevel: "MBiochem", category: "sciences",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "A*AA. Chemistry and Biology at A-level essential.",
  },
  {
    id: "uk-economics-oxford", name: "Economics and Management BA",
    university: "University of Oxford", country: "UK", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "AAA. Mathematics required. Very competitive.",
  },
  {
    id: "uk-history-oxford", name: "History BA",
    university: "University of Oxford", country: "UK", degreeLevel: "BA", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. History strongly preferred but not formally required. Interview essential.",
  },

  // ── Cambridge ─────────────────────────────────────────────────
  {
    id: "uk-medicine-cambridge", name: "Medicine MBBChir",
    university: "University of Cambridge", country: "UK", degreeLevel: "MBBChir", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Physics"], useful: ["Mathematics_Standard"] },
    notes: "BMAT required. A*AA. Chemistry and one of Biology/Physics/Maths essential.",
  },
  {
    id: "uk-cs-cambridge", name: "Computer Science BA/MEng",
    university: "University of Cambridge", country: "UK", degreeLevel: "MEng", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "A*A*A. Further Mathematics strongly preferred.",
  },
  {
    id: "uk-maths-cambridge", name: "Mathematics BA/MMath",
    university: "University of Cambridge", country: "UK", degreeLevel: "MMath", category: "mathematics",
    requirements: { essential: ["Mathematics_Standard","Mathematics_Advanced"], preferred: [], useful: ["Physics"] },
    notes: "A*A*A. STEP required. Further Mathematics essential.",
  },
  {
    id: "uk-naturalsciences-cambridge", name: "Natural Sciences BA/MSci",
    university: "University of Cambridge", country: "UK", degreeLevel: "MSci", category: "sciences",
    requirements: { essential: ["Chemistry"], preferred: ["Mathematics_Standard","Physics"], useful: ["Biology"] },
    notes: "A*A*A. Chemistry required. Maths and Physics strongly preferred for physical track.",
  },
  {
    id: "uk-engineering-cambridge", name: "Engineering BA/MEng",
    university: "University of Cambridge", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "A*A*A. Further Mathematics strongly preferred.",
  },
  {
    id: "uk-economics-cambridge", name: "Economics BA",
    university: "University of Cambridge", country: "UK", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "A*AA. Mathematics required. Interview essential.",
  },
  {
    id: "uk-law-cambridge", name: "Law LLB",
    university: "University of Cambridge", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy","Economics"] },
    notes: "A*AA. No specific subject requirements. Interview essential.",
  },

  // ── Imperial College London ───────────────────────────────────
  {
    id: "uk-medicine-imperial", name: "Medicine MBBS",
    university: "Imperial College London", country: "UK", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA. Chemistry and Biology essential.",
  },
  {
    id: "uk-cs-imperial", name: "Computing MEng",
    university: "Imperial College London", country: "UK", degreeLevel: "MEng", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "A*AA. Further Mathematics recommended.",
  },
  {
    id: "uk-electrical-imperial", name: "Electrical & Electronic Engineering MEng",
    university: "Imperial College London", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science"] },
    notes: "A*AA. Mathematics and Physics required.",
  },
  {
    id: "uk-mechanical-imperial", name: "Mechanical Engineering MEng",
    university: "Imperial College London", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "A*AA. Mathematics and Physics essential.",
  },
  {
    id: "uk-chemical-imperial", name: "Chemical Engineering MEng",
    university: "Imperial College London", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Chemistry"], preferred: ["Physics"], useful: ["Biology"] },
    notes: "A*AA. Chemistry and Mathematics essential.",
  },
  {
    id: "uk-physics-imperial", name: "Physics BSc/MSci",
    university: "Imperial College London", country: "UK", degreeLevel: "MSci", category: "sciences",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "A*AA. Mathematics and Physics essential.",
  },
  {
    id: "uk-maths-imperial", name: "Mathematics BSc/MSci",
    university: "Imperial College London", country: "UK", degreeLevel: "MSci", category: "mathematics",
    requirements: { essential: ["Mathematics_Standard","Mathematics_Advanced"], preferred: [], useful: ["Physics","Statistics"] },
    notes: "A*AA. Further Mathematics essential.",
  },
  {
    id: "uk-bioengineering-imperial", name: "Bioengineering MEng",
    university: "Imperial College London", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Biology"], preferred: ["Chemistry","Physics"], useful: [] },
    notes: "AAA. Mathematics and Biology required.",
  },

  // ── LSE ───────────────────────────────────────────────────────
  {
    id: "uk-economics-lse", name: "Economics BSc",
    university: "London School of Economics", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Economics","Statistics"] },
    notes: "AAA. Mathematics required at grade A. Very competitive.",
  },
  {
    id: "uk-finance-lse", name: "Finance BSc",
    university: "London School of Economics", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Economics","Statistics"] },
    notes: "AAA. Mathematics required. Quantitative skills essential.",
  },
  {
    id: "uk-accounting-lse", name: "Accounting & Finance BSc",
    university: "London School of Economics", country: "UK", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-law-lse", name: "Law LLB",
    university: "London School of Economics", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Politics"] },
    notes: "AAA. LNAT required. No specific subject requirements.",
  },
  {
    id: "uk-politics-lse", name: "Politics & Economics BSc",
    university: "London School of Economics", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Economics"], useful: ["History","Politics"] },
    notes: "AAA. Quantitative skills important.",
  },
  {
    id: "uk-management-lse", name: "Management BSc",
    university: "London School of Economics", country: "UK", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics"], useful: ["Statistics","Business"] },
    notes: "AAA. Mathematics required.",
  },

  // ── UCL ───────────────────────────────────────────────────────
  {
    id: "uk-medicine-ucl", name: "Medicine MBBS",
    university: "University College London", country: "UK", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA. Chemistry and Biology essential.",
  },
  {
    id: "uk-cs-ucl", name: "Computer Science BSc/MEng",
    university: "University College London", country: "UK", degreeLevel: "MEng", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "A*AA. Mathematics essential.",
  },
  {
    id: "uk-engineering-ucl", name: "Engineering (general) MEng",
    university: "University College London", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "AAA. Mathematics and Physics essential.",
  },
  {
    id: "uk-economics-ucl", name: "Economics BSc",
    university: "University College London", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-law-ucl", name: "Laws LLB",
    university: "University College London", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. LNAT required. No specific subject requirements.",
  },
  {
    id: "uk-architecture-ucl", name: "Architecture BSc/BArch",
    university: "University College London", country: "UK", degreeLevel: "BSc", category: "architecture",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Art_Design"], useful: ["Physics","History"] },
    notes: "AAA. Portfolio required. Mathematics and Art useful.",
  },
  {
    id: "uk-biomedical-ucl", name: "Biomedical Sciences BSc",
    university: "University College London", country: "UK", degreeLevel: "BSc", category: "medicine",
    requirements: { essential: ["Biology"], preferred: ["Chemistry","Mathematics_Standard"], useful: ["Physics"] },
    notes: "AAB. Biology essential; Chemistry strongly preferred.",
  },
  {
    id: "uk-psychology-ucl", name: "Psychology BSc",
    university: "University College London", country: "UK", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Psychology","Mathematics_Standard"], useful: ["Biology","Chemistry"] },
    notes: "AAB. No required subjects. Statistics/Maths useful.",
  },
  {
    id: "uk-pharmacy-ucl", name: "Pharmacy MPharm",
    university: "University College London", country: "UK", degreeLevel: "MPharm", category: "medicine",
    requirements: { essential: ["Chemistry"], preferred: ["Biology","Mathematics_Standard"], useful: ["Physics"] },
    notes: "AAB. Chemistry essential.",
  },
  {
    id: "uk-maths-ucl", name: "Mathematics BSc/MSci",
    university: "University College London", country: "UK", degreeLevel: "MSci", category: "mathematics",
    requirements: { essential: ["Mathematics_Standard","Mathematics_Advanced"], preferred: [], useful: ["Physics","Statistics"] },
    notes: "A*AA. Further Mathematics essential.",
  },

  // ── Edinburgh ─────────────────────────────────────────────────
  {
    id: "uk-medicine-edinburgh", name: "Medicine MBChB",
    university: "University of Edinburgh", country: "UK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA. Chemistry and Biology essential.",
  },
  {
    id: "uk-cs-edinburgh", name: "Computer Science BSc",
    university: "University of Edinburgh", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAA. Mathematics essential.",
  },
  {
    id: "uk-engineering-edinburgh", name: "Engineering (Mechanical) BEng/MEng",
    university: "University of Edinburgh", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "AAA. Mathematics and Physics essential.",
  },
  {
    id: "uk-economics-edinburgh", name: "Economics MA",
    university: "University of Edinburgh", country: "UK", degreeLevel: "MA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-law-edinburgh", name: "LLB Law",
    university: "University of Edinburgh", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. No specific subject requirements.",
  },
  {
    id: "uk-psychology-edinburgh", name: "Psychology BSc",
    university: "University of Edinburgh", country: "UK", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Psychology","Mathematics_Standard"], useful: ["Biology","Chemistry"] },
    notes: "AAB. No required subjects.",
  },
  {
    id: "uk-architecture-edinburgh", name: "Architecture MArch",
    university: "University of Edinburgh", country: "UK", degreeLevel: "MArch", category: "architecture",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Art_Design"], useful: ["Physics","History"] },
    notes: "AAB. Portfolio required.",
  },

  // ── King's College London ─────────────────────────────────────
  {
    id: "uk-medicine-kcl", name: "Medicine MBBS",
    university: "King's College London", country: "UK", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA. Chemistry and Biology essential.",
  },
  {
    id: "uk-law-kcl", name: "Law LLB",
    university: "King's College London", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. LNAT required.",
  },
  {
    id: "uk-cs-kcl", name: "Computer Science BSc",
    university: "King's College London", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAA. Mathematics essential.",
  },
  {
    id: "uk-economics-kcl", name: "Economics BSc",
    university: "King's College London", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAB. Mathematics required.",
  },
  {
    id: "uk-nursing-kcl", name: "Nursing BSc",
    university: "King's College London", country: "UK", degreeLevel: "BSc", category: "medicine",
    requirements: { essential: ["Biology"], preferred: ["Chemistry","Psychology"], useful: ["Mathematics_Standard"] },
    notes: "BBB. Biology preferred.",
  },
  {
    id: "uk-psychology-kcl", name: "Psychology BSc",
    university: "King's College London", country: "UK", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Psychology","Mathematics_Standard"], useful: ["Biology","Chemistry"] },
    notes: "AAB. No specific required subjects.",
  },

  // ── Manchester ────────────────────────────────────────────────
  {
    id: "uk-medicine-manchester", name: "Medicine MBChB",
    university: "University of Manchester", country: "UK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA. Chemistry and Biology essential.",
  },
  {
    id: "uk-cs-manchester", name: "Computer Science BSc/MEng",
    university: "University of Manchester", country: "UK", degreeLevel: "MEng", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAA. Mathematics essential.",
  },
  {
    id: "uk-economics-manchester", name: "Economics BSc",
    university: "University of Manchester", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAB. Mathematics required.",
  },
  {
    id: "uk-engineering-manchester", name: "Mechanical Engineering BEng/MEng",
    university: "University of Manchester", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "AAB. Mathematics and Physics essential.",
  },
  {
    id: "uk-law-manchester", name: "Law LLB",
    university: "University of Manchester", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. LNAT not required here.",
  },
  {
    id: "uk-accounting-manchester", name: "Accounting & Finance BSc",
    university: "University of Manchester", country: "UK", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-psychology-manchester", name: "Psychology BSc",
    university: "University of Manchester", country: "UK", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Psychology","Mathematics_Standard"], useful: ["Biology","Chemistry"] },
    notes: "AAB. No specific required subjects.",
  },

  // ── Warwick ───────────────────────────────────────────────────
  {
    id: "uk-economics-warwick", name: "Economics BSc",
    university: "University of Warwick", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Economics","Statistics"] },
    notes: "A*AA. Mathematics required. Very competitive.",
  },
  {
    id: "uk-maths-warwick", name: "Mathematics BSc/MMath",
    university: "University of Warwick", country: "UK", degreeLevel: "MMath", category: "mathematics",
    requirements: { essential: ["Mathematics_Standard","Mathematics_Advanced"], preferred: [], useful: ["Physics","Statistics"] },
    notes: "A*A*A. Further Mathematics essential.",
  },
  {
    id: "uk-cs-warwick", name: "Computer Science BSc/MEng",
    university: "University of Warwick", country: "UK", degreeLevel: "MEng", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "A*AA. Mathematics essential.",
  },
  {
    id: "uk-law-warwick", name: "Law LLB",
    university: "University of Warwick", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. LNAT required.",
  },
  {
    id: "uk-accounting-warwick", name: "Accounting & Finance BSc",
    university: "University of Warwick", country: "UK", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-engineering-warwick", name: "Engineering (General) MEng",
    university: "University of Warwick", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "A*AA. Mathematics and Physics essential.",
  },

  // ── Bristol ───────────────────────────────────────────────────
  {
    id: "uk-cs-bristol", name: "Computer Science BSc/MEng",
    university: "University of Bristol", country: "UK", degreeLevel: "MEng", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "A*AA. Mathematics essential.",
  },
  {
    id: "uk-economics-bristol", name: "Economics BSc",
    university: "University of Bristol", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-engineering-bristol", name: "Mechanical Engineering BEng/MEng",
    university: "University of Bristol", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "AAA. Mathematics and Physics essential.",
  },
  {
    id: "uk-law-bristol", name: "Law LLB",
    university: "University of Bristol", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. LNAT required.",
  },
  {
    id: "uk-medicine-bristol", name: "Medicine MBChB",
    university: "University of Bristol", country: "UK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA. Chemistry and Biology essential.",
  },

  // ── Durham ────────────────────────────────────────────────────
  {
    id: "uk-economics-durham", name: "Economics BA/BSc",
    university: "Durham University", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-cs-durham", name: "Computer Science BSc",
    university: "Durham University", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAA. Mathematics essential.",
  },
  {
    id: "uk-law-durham", name: "Law LLB",
    university: "Durham University", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics"] },
    notes: "AAA. LNAT required.",
  },
  {
    id: "uk-physics-durham", name: "Physics BSc/MPhys",
    university: "Durham University", country: "UK", degreeLevel: "MPhys", category: "sciences",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "AAA. Mathematics and Physics essential.",
  },
  {
    id: "uk-engineering-durham", name: "Engineering BEng/MEng",
    university: "Durham University", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "AAA. Mathematics and Physics essential.",
  },

  // ── Bath ──────────────────────────────────────────────────────
  {
    id: "uk-cs-bath", name: "Computer Science BSc",
    university: "University of Bath", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAA. Mathematics essential.",
  },
  {
    id: "uk-economics-bath", name: "Economics BSc",
    university: "University of Bath", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-engineering-bath", name: "Mechanical Engineering BEng/MEng",
    university: "University of Bath", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "AAA. Mathematics and Physics essential.",
  },
  {
    id: "uk-pharmacy-bath", name: "Pharmacy MPharm",
    university: "University of Bath", country: "UK", degreeLevel: "MPharm", category: "medicine",
    requirements: { essential: ["Chemistry"], preferred: ["Biology","Mathematics_Standard"], useful: ["Physics"] },
    notes: "AAB. Chemistry essential.",
  },
  {
    id: "uk-accounting-bath", name: "Accounting & Finance BSc",
    university: "University of Bath", country: "UK", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "AAA. Mathematics required.",
  },

  // ── Glasgow ───────────────────────────────────────────────────
  {
    id: "uk-medicine-glasgow", name: "Medicine MBChB",
    university: "University of Glasgow", country: "UK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA.",
  },
  {
    id: "uk-cs-glasgow", name: "Computing Science BSc",
    university: "University of Glasgow", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAB. Mathematics essential.",
  },
  {
    id: "uk-law-glasgow", name: "Law LLB",
    university: "University of Glasgow", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAB. No specific required subjects.",
  },
  {
    id: "uk-economics-glasgow", name: "Economics MA",
    university: "University of Glasgow", country: "UK", degreeLevel: "MA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAB. Mathematics required.",
  },
  {
    id: "uk-engineering-glasgow", name: "Engineering (Mechanical) BEng/MEng",
    university: "University of Glasgow", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "AAB. Mathematics and Physics essential.",
  },

  // ── St Andrews ────────────────────────────────────────────────
  {
    id: "uk-cs-standrews", name: "Computer Science BSc",
    university: "University of St Andrews", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAA. Mathematics essential.",
  },
  {
    id: "uk-economics-standrews", name: "Economics MA",
    university: "University of St Andrews", country: "UK", degreeLevel: "MA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-medicine-standrews", name: "Medicine MBChB",
    university: "University of St Andrews", country: "UK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA. Leads to clinical years at partner hospitals.",
  },
  {
    id: "uk-maths-standrews", name: "Mathematics BSc/MMath",
    university: "University of St Andrews", country: "UK", degreeLevel: "MMath", category: "mathematics",
    requirements: { essential: ["Mathematics_Standard","Mathematics_Advanced"], preferred: [], useful: ["Physics","Statistics"] },
    notes: "AAA. Further Mathematics strongly preferred.",
  },

  // ── Leeds ─────────────────────────────────────────────────────
  {
    id: "uk-medicine-leeds", name: "Medicine MBChB",
    university: "University of Leeds", country: "UK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA.",
  },
  {
    id: "uk-cs-leeds", name: "Computer Science BSc",
    university: "University of Leeds", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAA. Mathematics essential.",
  },
  {
    id: "uk-engineering-leeds", name: "Civil Engineering BEng/MEng",
    university: "University of Leeds", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Physics","Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "AAB. Mathematics essential.",
  },
  {
    id: "uk-law-leeds", name: "Law LLB",
    university: "University of Leeds", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics"] },
    notes: "AAA. LNAT not required.",
  },
  {
    id: "uk-economics-leeds", name: "Economics BSc",
    university: "University of Leeds", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAB. Mathematics required.",
  },

  // ── Nottingham ────────────────────────────────────────────────
  {
    id: "uk-medicine-nottingham", name: "Medicine BMedSci/BM BS",
    university: "University of Nottingham", country: "UK", degreeLevel: "BM BS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA.",
  },
  {
    id: "uk-cs-nottingham", name: "Computer Science BSc",
    university: "University of Nottingham", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAA. Mathematics essential.",
  },
  {
    id: "uk-economics-nottingham", name: "Economics BSc",
    university: "University of Nottingham", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAB. Mathematics required.",
  },
  {
    id: "uk-law-nottingham", name: "Law LLB",
    university: "University of Nottingham", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. LNAT required.",
  },
  {
    id: "uk-pharmacy-nottingham", name: "Pharmacy MPharm",
    university: "University of Nottingham", country: "UK", degreeLevel: "MPharm", category: "medicine",
    requirements: { essential: ["Chemistry"], preferred: ["Biology","Mathematics_Standard"], useful: ["Physics"] },
    notes: "AAB. Chemistry essential.",
  },

  // ── Birmingham ────────────────────────────────────────────────
  {
    id: "uk-medicine-birmingham", name: "Medicine MBChB",
    university: "University of Birmingham", country: "UK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. AAA.",
  },
  {
    id: "uk-cs-birmingham", name: "Computer Science BSc",
    university: "University of Birmingham", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "ABB. Mathematics essential.",
  },
  {
    id: "uk-economics-birmingham", name: "Economics BSc",
    university: "University of Birmingham", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAB. Mathematics required.",
  },
  {
    id: "uk-engineering-birmingham", name: "Mechanical Engineering BEng/MEng",
    university: "University of Birmingham", country: "UK", degreeLevel: "MEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry"] },
    notes: "AAB. Mathematics and Physics essential.",
  },
  {
    id: "uk-law-birmingham", name: "Law LLB",
    university: "University of Birmingham", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. LNAT required.",
  },

  // ── Exeter ────────────────────────────────────────────────────
  {
    id: "uk-economics-exeter", name: "Economics BSc",
    university: "University of Exeter", country: "UK", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "AAA. Mathematics required.",
  },
  {
    id: "uk-law-exeter", name: "Law LLB",
    university: "University of Exeter", country: "UK", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "AAA. LNAT required.",
  },
  {
    id: "uk-cs-exeter", name: "Computer Science BSc",
    university: "University of Exeter", country: "UK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced"], useful: ["Computer_Science","Physics"] },
    notes: "AAB. Mathematics essential.",
  },
  {
    id: "uk-psychology-exeter", name: "Psychology BSc",
    university: "University of Exeter", country: "UK", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Psychology","Mathematics_Standard"], useful: ["Biology","Chemistry"] },
    notes: "AAB.",
  },

  /* ══════════════════════════════════════════════════════════════
   * UNITED STATES
   * ══════════════════════════════════════════════════════════════ */

  // ── MIT ───────────────────────────────────────────────────────
  {
    id: "us-cs-mit", name: "Computer Science & Engineering BS",
    university: "MIT", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Computer_Science"], useful: ["Chemistry"] },
    notes: "Highly selective. Calculus BC and Physics C strongly recommended.",
  },
  {
    id: "us-engineering-mit", name: "Electrical Engineering & Computer Science BS",
    university: "MIT", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Computer_Science"], useful: ["Chemistry"] },
    notes: "Highly selective. Calculus BC, Physics C essential.",
  },
  {
    id: "us-mechanical-mit", name: "Mechanical Engineering BS",
    university: "MIT", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Highly selective. Strong Maths and Physics required.",
  },
  {
    id: "us-physics-mit", name: "Physics BS",
    university: "MIT", country: "US", degreeLevel: "BS", category: "sciences",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Highly selective. Exceptional mathematical ability expected.",
  },
  {
    id: "us-economics-mit", name: "Economics BS",
    university: "MIT", country: "US", degreeLevel: "BS", category: "economics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Economics","Statistics"], useful: ["Computer_Science"] },
    notes: "Highly selective. Very quantitative programme.",
  },
  {
    id: "us-maths-mit", name: "Mathematics BS",
    university: "MIT", country: "US", degreeLevel: "BS", category: "mathematics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: [], useful: ["Physics","Computer_Science"] },
    notes: "Highly selective. Exceptional mathematical ability expected.",
  },

  // ── Stanford ──────────────────────────────────────────────────
  {
    id: "us-cs-stanford", name: "Computer Science BS",
    university: "Stanford University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective. Strong Maths and CS background preferred.",
  },
  {
    id: "us-engineering-stanford", name: "Engineering BS",
    university: "Stanford University", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Computer_Science"], useful: ["Chemistry"] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-stanford", name: "Economics BA",
    university: "Stanford University", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Economics","Statistics"], useful: ["Computer_Science"] },
    notes: "Highly selective. Strong quantitative background preferred.",
  },

  // ── Harvard ───────────────────────────────────────────────────
  {
    id: "us-cs-harvard", name: "Computer Science AB/SM",
    university: "Harvard University", country: "US", degreeLevel: "AB", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective. Liberal arts with strong STEM emphasis.",
  },
  {
    id: "us-economics-harvard", name: "Economics AB",
    university: "Harvard University", country: "US", degreeLevel: "AB", category: "economics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Economics","Statistics"], useful: ["Computer_Science"] },
    notes: "Highly selective.",
  },
  {
    id: "us-law-harvard", name: "Law JD (pre-law track)",
    university: "Harvard University", country: "US", degreeLevel: "AB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy","Economics"] },
    notes: "Harvard Law is graduate-entry. Undergraduate major is flexible.",
  },
  {
    id: "us-biology-harvard", name: "Biological Sciences AB",
    university: "Harvard University", country: "US", degreeLevel: "AB", category: "sciences",
    requirements: { essential: ["Biology","Chemistry"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "Pre-med track common. Strong sciences background essential.",
  },
  {
    id: "us-maths-harvard", name: "Mathematics AB",
    university: "Harvard University", country: "US", degreeLevel: "AB", category: "mathematics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: [], useful: ["Physics","Computer_Science"] },
    notes: "Highly selective. Exceptional mathematical ability expected.",
  },

  // ── Princeton ─────────────────────────────────────────────────
  {
    id: "us-cs-princeton", name: "Computer Science AB/BSE",
    university: "Princeton University", country: "US", degreeLevel: "BSE", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-engineering-princeton", name: "Engineering & Applied Science BSE",
    university: "Princeton University", country: "US", degreeLevel: "BSE", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry","Computer_Science"], useful: [] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-princeton", name: "Economics AB",
    university: "Princeton University", country: "US", degreeLevel: "AB", category: "economics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Economics","Statistics"], useful: ["Computer_Science"] },
    notes: "Highly selective.",
  },
  {
    id: "us-maths-princeton", name: "Mathematics AB",
    university: "Princeton University", country: "US", degreeLevel: "AB", category: "mathematics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: [], useful: ["Physics","Computer_Science"] },
    notes: "Highly selective.",
  },

  // ── Yale ──────────────────────────────────────────────────────
  {
    id: "us-cs-yale", name: "Computer Science BS",
    university: "Yale University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-yale", name: "Economics BA",
    university: "Yale University", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-law-yale", name: "Law BA (pre-law)",
    university: "Yale University", country: "US", degreeLevel: "BA", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy","Economics"] },
    notes: "Yale Law is graduate-entry. Flexible undergraduate major.",
  },
  {
    id: "us-biology-yale", name: "Molecular, Cellular & Developmental Biology BS",
    university: "Yale University", country: "US", degreeLevel: "BS", category: "sciences",
    requirements: { essential: ["Biology","Chemistry"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "Pre-med track common.",
  },

  // ── Columbia ──────────────────────────────────────────────────
  {
    id: "us-cs-columbia", name: "Computer Science BS",
    university: "Columbia University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-columbia", name: "Economics BA",
    university: "Columbia University", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-engineering-columbia", name: "Engineering & Applied Science BS",
    university: "Columbia University", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry","Computer_Science"], useful: [] },
    notes: "Highly selective.",
  },

  // ── UPenn / Wharton ───────────────────────────────────────────
  {
    id: "us-business-wharton", name: "Business Administration BS (Wharton)",
    university: "University of Pennsylvania", country: "US", degreeLevel: "BS", category: "business",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Economics","Statistics"], useful: ["Computer_Science","Business"] },
    notes: "Highly selective. Quantitative focus.",
  },
  {
    id: "us-cs-penn", name: "Computer & Information Science BS",
    university: "University of Pennsylvania", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-penn", name: "Economics BA",
    university: "University of Pennsylvania", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },

  // ── Caltech ───────────────────────────────────────────────────
  {
    id: "us-cs-caltech", name: "Computer Science BS",
    university: "Caltech", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Computer_Science"], useful: ["Chemistry"] },
    notes: "Extremely selective. Strongest STEM undergrads.",
  },
  {
    id: "us-physics-caltech", name: "Physics BS",
    university: "Caltech", country: "US", degreeLevel: "BS", category: "sciences",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Extremely selective.",
  },
  {
    id: "us-engineering-caltech", name: "Electrical Engineering BS",
    university: "Caltech", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Computer_Science"], useful: ["Chemistry"] },
    notes: "Extremely selective.",
  },

  // ── CMU ───────────────────────────────────────────────────────
  {
    id: "us-cs-cmu", name: "Computer Science BS",
    university: "Carnegie Mellon University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective. Top-ranked CS programme globally.",
  },
  {
    id: "us-engineering-cmu", name: "Electrical & Computer Engineering BS",
    university: "Carnegie Mellon University", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Computer_Science"], useful: ["Chemistry"] },
    notes: "Highly selective.",
  },
  {
    id: "us-business-cmu", name: "Business Administration BS (Tepper)",
    university: "Carnegie Mellon University", country: "US", degreeLevel: "BS", category: "business",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Economics","Statistics"], useful: ["Computer_Science"] },
    notes: "Highly selective. Quantitative focus.",
  },

  // ── UC Berkeley ───────────────────────────────────────────────
  {
    id: "us-cs-berkeley", name: "EECS / Computer Science BS",
    university: "UC Berkeley", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective. One of the top CS schools globally.",
  },
  {
    id: "us-engineering-berkeley", name: "Mechanical Engineering BS",
    university: "UC Berkeley", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-berkeley", name: "Economics BA",
    university: "UC Berkeley", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Competitive.",
  },
  {
    id: "us-business-berkeley", name: "Business Administration BS (Haas)",
    university: "UC Berkeley", country: "US", degreeLevel: "BS", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Business"] },
    notes: "Highly selective.",
  },

  // ── Michigan ──────────────────────────────────────────────────
  {
    id: "us-cs-michigan", name: "Computer Science BS",
    university: "University of Michigan", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-engineering-michigan", name: "Engineering BS",
    university: "University of Michigan", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Highly selective.",
  },
  {
    id: "us-business-michigan", name: "Business Administration BBA (Ross)",
    university: "University of Michigan", country: "US", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Business"] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-michigan", name: "Economics BA",
    university: "University of Michigan", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Competitive.",
  },

  // ── NYU ───────────────────────────────────────────────────────
  {
    id: "us-business-nyu", name: "Business (Stern School) BS",
    university: "New York University", country: "US", degreeLevel: "BS", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Business"] },
    notes: "Highly selective. Finance and investment banking pipeline.",
  },
  {
    id: "us-cs-nyu", name: "Computer Science BS",
    university: "New York University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Competitive.",
  },

  // ── Georgetown ────────────────────────────────────────────────
  {
    id: "us-law-georgetown", name: "Law BA (pre-law)",
    university: "Georgetown University", country: "US", degreeLevel: "BA", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy","Economics"] },
    notes: "Georgetown Law is graduate-entry. Undergraduate major flexible.",
  },
  {
    id: "us-business-georgetown", name: "Business Administration BSBA",
    university: "Georgetown University", country: "US", degreeLevel: "BSBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Competitive.",
  },

  // ── Duke ──────────────────────────────────────────────────────
  {
    id: "us-cs-duke", name: "Computer Science BS",
    university: "Duke University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-duke", name: "Economics BA",
    university: "Duke University", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },

  // ── Johns Hopkins ─────────────────────────────────────────────
  {
    id: "us-biomedical-jhu", name: "Biomedical Engineering BS",
    university: "Johns Hopkins University", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Biology"], preferred: ["Chemistry","Physics"], useful: ["Computer_Science"] },
    notes: "Highly selective. Pre-med and engineering pathway.",
  },
  {
    id: "us-cs-jhu", name: "Computer Science BS",
    university: "Johns Hopkins University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },

  /* ══════════════════════════════════════════════════════════════
   * NETHERLANDS
   * ══════════════════════════════════════════════════════════════ */

  // ── TU Delft ──────────────────────────────────────────────────
  {
    id: "nl-cs-tudelft", name: "Computer Science & Engineering BSc",
    university: "TU Delft", country: "NL", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: [], useful: ["Computer_Science","Chemistry"] },
    notes: "NSO numerus fixus. High maths and physics level required.",
  },
  {
    id: "nl-electrical-tudelft", name: "Electrical Engineering BSc",
    university: "TU Delft", country: "NL", degreeLevel: "BSc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: [], useful: ["Computer_Science","Chemistry"] },
    notes: "NSO selection. Mathematics and Physics essential.",
  },
  {
    id: "nl-mechanical-tudelft", name: "Mechanical Engineering BSc",
    university: "TU Delft", country: "NL", degreeLevel: "BSc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: [], useful: ["Chemistry"] },
    notes: "Selection procedure. Mathematics and Physics essential.",
  },
  {
    id: "nl-architecture-tudelft", name: "Architecture BSc",
    university: "TU Delft", country: "NL", degreeLevel: "BSc", category: "architecture",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Art_Design"], useful: ["Physics","History"] },
    notes: "Portfolio and entrance exam required.",
  },
  {
    id: "nl-aerospace-tudelft", name: "Aerospace Engineering BSc",
    university: "TU Delft", country: "NL", degreeLevel: "BSc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "NSO selection. Very maths and physics intensive.",
  },

  // ── UvA ───────────────────────────────────────────────────────
  {
    id: "nl-economics-uva", name: "Economics & Business BSc",
    university: "University of Amsterdam", country: "NL", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics","Business"] },
    notes: "NSO selection for some programmes. Mathematics required.",
  },
  {
    id: "nl-cs-uva", name: "Computer Science BSc",
    university: "University of Amsterdam", country: "NL", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Physics"], useful: ["Computer_Science","Statistics"] },
    notes: "Mathematics B required.",
  },
  {
    id: "nl-law-uva", name: "Law LLB",
    university: "University of Amsterdam", country: "NL", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "Open access. Dutch language track and English-language LLB available.",
  },
  {
    id: "nl-psychology-uva", name: "Psychology BSc",
    university: "University of Amsterdam", country: "NL", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Biology"], useful: ["Psychology","Chemistry"] },
    notes: "NSO selection. Numerus fixus.",
  },

  // ── Erasmus ───────────────────────────────────────────────────
  {
    id: "nl-economics-erasmus", name: "Economics & Business Economics BSc",
    university: "Erasmus University Rotterdam", country: "NL", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "International Business major available. Mathematics B preferred.",
  },
  {
    id: "nl-business-erasmus", name: "Business Administration BSc (IBA)",
    university: "Erasmus University Rotterdam", country: "NL", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "International programme. NSO selection.",
  },
  {
    id: "nl-law-erasmus", name: "Law LLB",
    university: "Erasmus University Rotterdam", country: "NL", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "Dutch law track; international/English LLB also available.",
  },

  // ── Leiden ────────────────────────────────────────────────────
  {
    id: "nl-law-leiden", name: "Law LLB",
    university: "Leiden University", country: "NL", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "One of the oldest law schools in Europe.",
  },
  {
    id: "nl-cs-leiden", name: "Computer Science BSc",
    university: "Leiden University", country: "NL", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Physics"], useful: ["Computer_Science","Statistics"] },
    notes: "Mathematics B required.",
  },

  // ── Utrecht ───────────────────────────────────────────────────
  {
    id: "nl-medicine-utrecht", name: "Medicine BSc/MD",
    university: "Utrecht University", country: "NL", degreeLevel: "MD", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "Lottery/selection. Chemistry and Biology essential.",
  },
  {
    id: "nl-economics-utrecht", name: "Economics & Business Economics BSc",
    university: "Utrecht University", country: "NL", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "Mathematics required.",
  },
  {
    id: "nl-psychology-utrecht", name: "Psychology BSc",
    university: "Utrecht University", country: "NL", degreeLevel: "BSc", category: "psychology",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Biology"], useful: ["Psychology","Chemistry"] },
    notes: "NSO selection.",
  },

  // ── Maastricht ────────────────────────────────────────────────
  {
    id: "nl-business-maastricht", name: "International Business BSc",
    university: "Maastricht University", country: "NL", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Problem-Based Learning format. Popular with international students.",
  },
  {
    id: "nl-economics-maastricht", name: "Economics & Business Economics BSc",
    university: "Maastricht University", country: "NL", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Mathematics required.",
  },
  {
    id: "nl-law-maastricht", name: "Law LLB",
    university: "Maastricht University", country: "NL", degreeLevel: "LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Economics","Philosophy"] },
    notes: "European Law School track available.",
  },

  // ── TU/e ──────────────────────────────────────────────────────
  {
    id: "nl-engineering-tue", name: "Electrical Engineering BSc",
    university: "Eindhoven University of Technology (TU/e)", country: "NL", degreeLevel: "BSc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: [], useful: ["Computer_Science","Chemistry"] },
    notes: "Mathematics B and Physics essential.",
  },
  {
    id: "nl-cs-tue", name: "Computer Science & Engineering BSc",
    university: "Eindhoven University of Technology (TU/e)", country: "NL", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Physics"], useful: ["Computer_Science"] },
    notes: "Mathematics B required.",
  },

  /* ══════════════════════════════════════════════════════════════
   * SINGAPORE
   * ══════════════════════════════════════════════════════════════ */

  // ── NUS ───────────────────────────────────────────────────────
  {
    id: "sg-cs-nus", name: "Computer Science BSc",
    university: "National University of Singapore", country: "SG", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Computer_Science"] },
    notes: "Very competitive. H2 Maths required.",
  },
  {
    id: "sg-engineering-nus", name: "Engineering (Electrical) BEng",
    university: "National University of Singapore", country: "SG", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "H2 Maths and Physics required.",
  },
  {
    id: "sg-medicine-nus", name: "Medicine MBBS",
    university: "National University of Singapore", country: "SG", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. Chemistry and Biology essential.",
  },
  {
    id: "sg-law-nus", name: "Law LLB",
    university: "National University of Singapore", country: "SG", degreeLevel: "LLB", category: "law",
    requirements: { essential: ["English"], preferred: ["History","Economics"], useful: ["Mathematics_Standard"] },
    notes: "English essential. Very competitive.",
  },
  {
    id: "sg-economics-nus", name: "Economics BSocSci",
    university: "National University of Singapore", country: "SG", degreeLevel: "BSocSci", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "H2 Maths required.",
  },
  {
    id: "sg-business-nus", name: "Business Administration BBA",
    university: "National University of Singapore", country: "SG", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "H2 Maths required. Very competitive.",
  },
  {
    id: "sg-sciences-nus", name: "Science (Chemistry/Physics) BSc",
    university: "National University of Singapore", country: "SG", degreeLevel: "BSc", category: "sciences",
    requirements: { essential: ["Chemistry"], preferred: ["Physics","Mathematics_Standard"], useful: ["Biology","Mathematics_Advanced"] },
    notes: "H2 Chemistry required.",
  },
  {
    id: "sg-pharmacy-nus", name: "Pharmacy BPharm",
    university: "National University of Singapore", country: "SG", degreeLevel: "BPharm", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "Chemistry and Biology required.",
  },

  // ── NTU ───────────────────────────────────────────────────────
  {
    id: "sg-cs-ntu", name: "Computer Science BSc",
    university: "Nanyang Technological University", country: "SG", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Computer_Science"] },
    notes: "H2 Maths required.",
  },
  {
    id: "sg-engineering-ntu", name: "Electrical & Electronic Engineering BEng",
    university: "Nanyang Technological University", country: "SG", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "H2 Maths and Physics required.",
  },
  {
    id: "sg-business-ntu", name: "Business BSc (NBS)",
    university: "Nanyang Technological University", country: "SG", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Nanyang Business School. H2 Maths preferred.",
  },
  {
    id: "sg-medicine-ntu", name: "Medicine MBBS (LKCMedicine)",
    university: "Nanyang Technological University", country: "SG", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "Joint NTU-Imperial programme. UCAT required.",
  },
  {
    id: "sg-economics-ntu", name: "Economics BSocSci",
    university: "Nanyang Technological University", country: "SG", degreeLevel: "BSocSci", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "H2 Maths preferred.",
  },
  {
    id: "sg-architecture-ntu", name: "Architecture BArch",
    university: "Nanyang Technological University", country: "SG", degreeLevel: "BArch", category: "architecture",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Art_Design"], useful: ["Physics","History"] },
    notes: "Portfolio required.",
  },

  // ── SMU ───────────────────────────────────────────────────────
  {
    id: "sg-law-smu", name: "Law LLB",
    university: "Singapore Management University", country: "SG", degreeLevel: "LLB", category: "law",
    requirements: { essential: ["English"], preferred: ["History","Economics"], useful: ["Mathematics_Standard"] },
    notes: "English essential. LSAT or equivalent may be required.",
  },
  {
    id: "sg-business-smu", name: "Business Management BSc",
    university: "Singapore Management University", country: "SG", degreeLevel: "BSc", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "H2 Maths preferred.",
  },
  {
    id: "sg-economics-smu", name: "Economics BSc",
    university: "Singapore Management University", country: "SG", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "H2 Maths preferred.",
  },
  {
    id: "sg-cs-smu", name: "Computer Science BSc (SCIS)",
    university: "Singapore Management University", country: "SG", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Computer_Science"] },
    notes: "School of Computing and Information Systems.",
  },

  // ── SUTD ──────────────────────────────────────────────────────
  {
    id: "sg-engineering-sutd", name: "Engineering Product Development BEng",
    university: "Singapore University of Technology & Design", country: "SG", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced","Chemistry"], useful: ["Computer_Science"] },
    notes: "Design-focused engineering school. Collaboration with MIT.",
  },
  {
    id: "sg-architecture-sutd", name: "Architecture & Sustainable Design BArch",
    university: "Singapore University of Technology & Design", country: "SG", degreeLevel: "BArch", category: "architecture",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Art_Design"], useful: ["Physics","History"] },
    notes: "Design thinking and technology-integrated curriculum.",
  },

  /* ══════════════════════════════════════════════════════════════
   * HONG KONG
   * ══════════════════════════════════════════════════════════════ */

  // ── HKU ───────────────────────────────────────────────────────
  {
    id: "hk-medicine-hku", name: "Medicine MBBS",
    university: "University of Hong Kong", country: "HK", degreeLevel: "MBBS", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "Extremely competitive. Chemistry and Biology essential.",
  },
  {
    id: "hk-cs-hku", name: "Computer Science BSc",
    university: "University of Hong Kong", country: "HK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Computer_Science"] },
    notes: "Maths required.",
  },
  {
    id: "hk-engineering-hku", name: "Engineering BEng",
    university: "University of Hong Kong", country: "HK", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "Maths and Physics required.",
  },
  {
    id: "hk-law-hku", name: "Law LLB",
    university: "University of Hong Kong", country: "HK", degreeLevel: "LLB", category: "law",
    requirements: { essential: ["English"], preferred: ["History","Economics"], useful: ["Philosophy","Mathematics_Standard"] },
    notes: "English essential. Very competitive.",
  },
  {
    id: "hk-economics-hku", name: "Economics BA/BSocSci",
    university: "University of Hong Kong", country: "HK", degreeLevel: "BSocSci", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "hk-business-hku", name: "Business Administration BBA",
    university: "University of Hong Kong", country: "HK", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "hk-architecture-hku", name: "Architecture BArch",
    university: "University of Hong Kong", country: "HK", degreeLevel: "BArch", category: "architecture",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Art_Design"], useful: ["Physics","History"] },
    notes: "Portfolio required.",
  },
  {
    id: "hk-pharmacy-hku", name: "Pharmacy BPharm",
    university: "University of Hong Kong", country: "HK", degreeLevel: "BPharm", category: "medicine",
    requirements: { essential: ["Chemistry"], preferred: ["Biology","Mathematics_Standard"], useful: ["Physics"] },
    notes: "Chemistry essential.",
  },
  {
    id: "hk-psychology-hku", name: "Psychology BSocSci",
    university: "University of Hong Kong", country: "HK", degreeLevel: "BSocSci", category: "psychology",
    requirements: { essential: [], preferred: ["Psychology","Mathematics_Standard"], useful: ["Biology","Chemistry"] },
    notes: "No specific required subjects.",
  },

  // ── CUHK ──────────────────────────────────────────────────────
  {
    id: "hk-medicine-cuhk", name: "Medicine MBChB",
    university: "Chinese University of Hong Kong", country: "HK", degreeLevel: "MBChB", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "UCAT required. Chemistry and Biology essential.",
  },
  {
    id: "hk-cs-cuhk", name: "Computer Science BSc",
    university: "Chinese University of Hong Kong", country: "HK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Computer_Science"] },
    notes: "Maths required.",
  },
  {
    id: "hk-engineering-cuhk", name: "Engineering BEng",
    university: "Chinese University of Hong Kong", country: "HK", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "Maths and Physics required.",
  },
  {
    id: "hk-economics-cuhk", name: "Economics BSocSci",
    university: "Chinese University of Hong Kong", country: "HK", degreeLevel: "BSocSci", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "hk-law-cuhk", name: "Law LLB",
    university: "Chinese University of Hong Kong", country: "HK", degreeLevel: "LLB", category: "law",
    requirements: { essential: ["English"], preferred: ["History","Economics"], useful: ["Philosophy","Mathematics_Standard"] },
    notes: "English essential.",
  },
  {
    id: "hk-business-cuhk", name: "Business Administration BBA",
    university: "Chinese University of Hong Kong", country: "HK", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "hk-psychology-cuhk", name: "Psychology BSocSci",
    university: "Chinese University of Hong Kong", country: "HK", degreeLevel: "BSocSci", category: "psychology",
    requirements: { essential: [], preferred: ["Psychology","Mathematics_Standard"], useful: ["Biology","Chemistry"] },
    notes: "No specific required subjects.",
  },
  {
    id: "hk-architecture-cuhk", name: "Architecture BSSc",
    university: "Chinese University of Hong Kong", country: "HK", degreeLevel: "BSSc", category: "architecture",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Art_Design"], useful: ["Physics","History"] },
    notes: "Portfolio required.",
  },

  // ── HKUST ─────────────────────────────────────────────────────
  {
    id: "hk-cs-hkust", name: "Computer Science BSc",
    university: "HKUST", country: "HK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Computer_Science"] },
    notes: "Maths required.",
  },
  {
    id: "hk-engineering-hkust", name: "Engineering BEng",
    university: "HKUST", country: "HK", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "Maths and Physics required.",
  },
  {
    id: "hk-economics-hkust", name: "Economics BSocSci",
    university: "HKUST", country: "HK", degreeLevel: "BSocSci", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "hk-business-hkust", name: "Business & Management BBA",
    university: "HKUST", country: "HK", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "hk-sciences-hkust", name: "Science (Physics/Chemistry) BSc",
    university: "HKUST", country: "HK", degreeLevel: "BSc", category: "sciences",
    requirements: { essential: ["Chemistry"], preferred: ["Physics","Mathematics_Standard"], useful: ["Biology","Mathematics_Advanced"] },
    notes: "Chemistry or Physics at high level required.",
  },
  {
    id: "hk-maths-hkust", name: "Mathematics BSc",
    university: "HKUST", country: "HK", degreeLevel: "BSc", category: "mathematics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: [], useful: ["Physics","Statistics"] },
    notes: "Advanced Maths required.",
  },
  {
    id: "hk-quantfin-hkust", name: "Quantitative Finance BBA",
    university: "HKUST", country: "HK", degreeLevel: "BBA", category: "economics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Economics","Statistics"], useful: ["Computer_Science"] },
    notes: "Very quantitative. Advanced Maths essential.",
  },

  // ── PolyU ─────────────────────────────────────────────────────
  {
    id: "hk-engineering-polyu", name: "Engineering BEng",
    university: "Hong Kong Polytechnic University", country: "HK", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "Maths and Physics required.",
  },
  {
    id: "hk-nursing-polyu", name: "Nursing BSc",
    university: "Hong Kong Polytechnic University", country: "HK", degreeLevel: "BSc", category: "medicine",
    requirements: { essential: ["Biology"], preferred: ["Chemistry","Mathematics_Standard"], useful: ["Psychology"] },
    notes: "Biology required.",
  },
  {
    id: "hk-business-polyu", name: "Business Administration BBA",
    university: "Hong Kong Polytechnic University", country: "HK", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "hk-architecture-polyu", name: "Architecture BSc",
    university: "Hong Kong Polytechnic University", country: "HK", degreeLevel: "BSc", category: "architecture",
    requirements: { essential: [], preferred: ["Mathematics_Standard","Art_Design"], useful: ["Physics","History"] },
    notes: "Portfolio required.",
  },
  {
    id: "hk-cs-polyu", name: "Computing BSc",
    university: "Hong Kong Polytechnic University", country: "HK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Computer_Science"] },
    notes: "Maths required.",
  },

  // ── CityU ─────────────────────────────────────────────────────
  {
    id: "hk-cs-cityu", name: "Computer Science BSc",
    university: "City University of Hong Kong", country: "HK", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Physics"], useful: ["Computer_Science"] },
    notes: "Maths required.",
  },
  {
    id: "hk-engineering-cityu", name: "Engineering BEng",
    university: "City University of Hong Kong", country: "HK", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Standard","Physics"], preferred: ["Mathematics_Advanced"], useful: ["Chemistry","Computer_Science"] },
    notes: "Maths and Physics required.",
  },
  {
    id: "hk-law-cityu", name: "Law LLB",
    university: "City University of Hong Kong", country: "HK", degreeLevel: "LLB", category: "law",
    requirements: { essential: ["English"], preferred: ["History","Economics"], useful: ["Philosophy","Mathematics_Standard"] },
    notes: "English essential.",
  },
  {
    id: "hk-business-cityu", name: "Business Administration BBA",
    university: "City University of Hong Kong", country: "HK", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "hk-economics-cityu", name: "Economics BSocSci",
    university: "City University of Hong Kong", country: "HK", degreeLevel: "BSocSci", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Statistics"] },
    notes: "Maths required.",
  },

  /* ══════════════════════════════════════════════════════════════
   * UNITED STATES (additional — reaching top 40)
   * ══════════════════════════════════════════════════════════════ */

  // ── Northwestern ──────────────────────────────────────────────
  {
    id: "us-cs-northwestern", name: "Computer Science BS",
    university: "Northwestern University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective. Integrated with liberal arts.",
  },
  {
    id: "us-economics-northwestern", name: "Economics BA",
    university: "Northwestern University", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-engineering-northwestern", name: "Engineering BS (McCormick)",
    university: "Northwestern University", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Highly selective.",
  },

  // ── Dartmouth ─────────────────────────────────────────────────
  {
    id: "us-cs-dartmouth", name: "Computer Science AB",
    university: "Dartmouth College", country: "US", degreeLevel: "AB", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Ivy League. Liberal arts focused.",
  },
  {
    id: "us-economics-dartmouth", name: "Economics AB",
    university: "Dartmouth College", country: "US", degreeLevel: "AB", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Ivy League.",
  },

  // ── Brown ─────────────────────────────────────────────────────
  {
    id: "us-cs-brown", name: "Computer Science ScB",
    university: "Brown University", country: "US", degreeLevel: "ScB", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Ivy League. Open Curriculum — no core requirements.",
  },
  {
    id: "us-economics-brown", name: "Economics AB",
    university: "Brown University", country: "US", degreeLevel: "AB", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Ivy League. Open Curriculum.",
  },

  // ── Cornell ───────────────────────────────────────────────────
  {
    id: "us-cs-cornell", name: "Computer Science BS",
    university: "Cornell University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Ivy League. Top-ranked CS programme.",
  },
  {
    id: "us-engineering-cornell", name: "Engineering BS",
    university: "Cornell University", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Ivy League. Strong engineering school.",
  },
  {
    id: "us-economics-cornell", name: "Economics BA",
    university: "Cornell University", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Ivy League.",
  },
  {
    id: "us-business-cornell", name: "Business Administration BS (Dyson / Hotel)",
    university: "Cornell University", country: "US", degreeLevel: "BS", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Dyson (Applied Economics) and Hotel Administration are world-renowned.",
  },

  // ── Rice ──────────────────────────────────────────────────────
  {
    id: "us-cs-rice", name: "Computer Science BS",
    university: "Rice University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective. Strong research culture.",
  },
  {
    id: "us-engineering-rice", name: "Engineering BS",
    university: "Rice University", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Highly selective.",
  },

  // ── Vanderbilt ────────────────────────────────────────────────
  {
    id: "us-economics-vanderbilt", name: "Economics BA",
    university: "Vanderbilt University", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-cs-vanderbilt", name: "Computer Science BS",
    university: "Vanderbilt University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },

  // ── Notre Dame ────────────────────────────────────────────────
  {
    id: "us-business-notredame", name: "Business Administration BBA (Mendoza)",
    university: "University of Notre Dame", country: "US", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Top-ranked business school.",
  },
  {
    id: "us-cs-notredame", name: "Computer Science BS",
    university: "University of Notre Dame", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },

  // ── WashU St. Louis ───────────────────────────────────────────
  {
    id: "us-cs-washu", name: "Computer Science BS",
    university: "Washington University in St. Louis", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-business-washu", name: "Business Administration BSBA (Olin)",
    university: "Washington University in St. Louis", country: "US", degreeLevel: "BSBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Highly selective.",
  },

  // ── Emory ─────────────────────────────────────────────────────
  {
    id: "us-business-emory", name: "Business Administration BBA (Goizueta)",
    university: "Emory University", country: "US", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-emory", name: "Economics BA",
    university: "Emory University", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },

  // ── UCLA ──────────────────────────────────────────────────────
  {
    id: "us-cs-ucla", name: "Computer Science BS",
    university: "UCLA", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective public university.",
  },
  {
    id: "us-engineering-ucla", name: "Mechanical Engineering BS",
    university: "UCLA", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Highly selective.",
  },
  {
    id: "us-economics-ucla", name: "Economics BA",
    university: "UCLA", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Competitive.",
  },

  // ── USC ───────────────────────────────────────────────────────
  {
    id: "us-business-usc", name: "Business Administration BS (Marshall)",
    university: "University of Southern California", country: "US", degreeLevel: "BS", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Highly selective. Strong finance and entertainment industry links.",
  },
  {
    id: "us-cs-usc", name: "Computer Science BS",
    university: "University of Southern California", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly selective.",
  },

  // ── Georgia Tech ──────────────────────────────────────────────
  {
    id: "us-cs-gatech", name: "Computer Science BS",
    university: "Georgia Tech", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Top-ranked public STEM university.",
  },
  {
    id: "us-engineering-gatech", name: "Engineering BS",
    university: "Georgia Tech", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Top-ranked public engineering school.",
  },

  // ── UVA ───────────────────────────────────────────────────────
  {
    id: "us-business-uva", name: "Commerce BS (McIntire)",
    university: "University of Virginia", country: "US", degreeLevel: "BS", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Highly selective. McIntire School of Commerce is top-ranked.",
  },
  {
    id: "us-cs-uva", name: "Computer Science BS",
    university: "University of Virginia", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Top public university.",
  },
  {
    id: "us-economics-uva", name: "Economics BA",
    university: "University of Virginia", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Top public university.",
  },

  // ── UIUC ──────────────────────────────────────────────────────
  {
    id: "us-cs-uiuc", name: "Computer Science BS",
    university: "University of Illinois Urbana-Champaign", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "One of the top CS schools globally. Very competitive.",
  },
  {
    id: "us-engineering-uiuc", name: "Engineering BS",
    university: "University of Illinois Urbana-Champaign", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Top public engineering school.",
  },

  // ── Purdue ────────────────────────────────────────────────────
  {
    id: "us-engineering-purdue", name: "Engineering BS",
    university: "Purdue University", country: "US", degreeLevel: "BS", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Top engineering school. NASA astronaut pipeline.",
  },
  {
    id: "us-cs-purdue", name: "Computer Science BS",
    university: "Purdue University", country: "US", degreeLevel: "BS", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Highly ranked CS programme.",
  },

  // ── UNC Chapel Hill ───────────────────────────────────────────
  {
    id: "us-business-unc", name: "Business Administration BSBA (Kenan-Flagler)",
    university: "UNC Chapel Hill", country: "US", degreeLevel: "BSBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Top public university. Kenan-Flagler is a top-ranked business school.",
  },
  {
    id: "us-economics-unc", name: "Economics BA",
    university: "UNC Chapel Hill", country: "US", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Top public university.",
  },

  /* ══════════════════════════════════════════════════════════════
   * CANADA
   * ══════════════════════════════════════════════════════════════ */

  // ── University of Toronto ─────────────────────────────────────
  {
    id: "ca-cs-utoronto", name: "Computer Science BSc",
    university: "University of Toronto", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Top Canadian university. Calculus and advanced maths essential.",
  },
  {
    id: "ca-engineering-utoronto", name: "Engineering Science BASc",
    university: "University of Toronto", country: "CA", degreeLevel: "BASc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Very competitive. Maths and Physics essential.",
  },
  {
    id: "ca-medicine-utoronto", name: "Life Sciences BSc (pre-med)",
    university: "University of Toronto", country: "CA", degreeLevel: "BSc", category: "medicine",
    requirements: { essential: ["Biology","Chemistry"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "Life Sciences is the most common pre-med pathway at UofT.",
  },
  {
    id: "ca-economics-utoronto", name: "Economics BA/BSc",
    university: "University of Toronto", country: "CA", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "ca-law-utoronto", name: "Law JD (pre-law BA)",
    university: "University of Toronto", country: "CA", degreeLevel: "BA", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy","Economics"] },
    notes: "UofT Law is graduate-entry. Undergraduate major is flexible.",
  },

  // ── McGill ────────────────────────────────────────────────────
  {
    id: "ca-medicine-mcgill", name: "Medicine MDCM",
    university: "McGill University", country: "CA", degreeLevel: "MDCM", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "MCAT required. Chemistry and Biology essential. Highly competitive.",
  },
  {
    id: "ca-cs-mcgill", name: "Computer Science BSc",
    university: "McGill University", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Top Canadian CS programme.",
  },
  {
    id: "ca-engineering-mcgill", name: "Engineering BEng",
    university: "McGill University", country: "CA", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Very competitive.",
  },
  {
    id: "ca-economics-mcgill", name: "Economics BA",
    university: "McGill University", country: "CA", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Maths required.",
  },
  {
    id: "ca-law-mcgill", name: "Law BCL/LLB",
    university: "McGill University", country: "CA", degreeLevel: "BCL/LLB", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy","Economics"] },
    notes: "Unique bijural programme (Common Law + Civil Law). Very competitive.",
  },

  // ── UBC ───────────────────────────────────────────────────────
  {
    id: "ca-cs-ubc", name: "Computer Science BSc",
    university: "University of British Columbia", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Top Canadian CS programme.",
  },
  {
    id: "ca-engineering-ubc", name: "Engineering BASc",
    university: "University of British Columbia", country: "CA", degreeLevel: "BASc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Very competitive. Maths and Physics essential.",
  },
  {
    id: "ca-business-ubc", name: "Business Administration BCom (Sauder)",
    university: "University of British Columbia", country: "CA", degreeLevel: "BCom", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Sauder School of Business. Top Canadian business school.",
  },
  {
    id: "ca-economics-ubc", name: "Economics BA/BSc",
    university: "University of British Columbia", country: "CA", degreeLevel: "BSc", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Maths required.",
  },

  // ── Waterloo ──────────────────────────────────────────────────
  {
    id: "ca-cs-waterloo", name: "Computer Science BSc",
    university: "University of Waterloo", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Top CS school in Canada. Co-op programme world-renowned. Very competitive.",
  },
  {
    id: "ca-engineering-waterloo", name: "Engineering BASc",
    university: "University of Waterloo", country: "CA", degreeLevel: "BASc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Top engineering co-op programme in Canada.",
  },
  {
    id: "ca-mathematics-waterloo", name: "Mathematics BSc",
    university: "University of Waterloo", country: "CA", degreeLevel: "BSc", category: "mathematics",
    requirements: { essential: ["Mathematics_Advanced"], preferred: [], useful: ["Physics","Computer_Science","Statistics"] },
    notes: "World-class mathematics faculty. Co-op available.",
  },
  {
    id: "ca-business-waterloo", name: "Accounting & Financial Management BAFMath",
    university: "University of Waterloo", country: "CA", degreeLevel: "BAFMath", category: "business",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Economics","Statistics"], useful: ["Business"] },
    notes: "Unique maths-business programme. Co-op available.",
  },

  // ── McMaster ──────────────────────────────────────────────────
  {
    id: "ca-medicine-mcmaster", name: "Health Sciences BSc (pre-med)",
    university: "McMaster University", country: "CA", degreeLevel: "BSc", category: "medicine",
    requirements: { essential: ["Biology","Chemistry"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "McMaster is famous for its problem-based medical school.",
  },
  {
    id: "ca-engineering-mcmaster", name: "Engineering BEng",
    university: "McMaster University", country: "CA", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Maths and Physics essential.",
  },
  {
    id: "ca-cs-mcmaster", name: "Computer Science BSc",
    university: "McMaster University", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Strong CS programme.",
  },

  // ── Western University ────────────────────────────────────────
  {
    id: "ca-business-western", name: "Business Administration HBA (Ivey)",
    university: "Western University", country: "CA", degreeLevel: "HBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Ivey Business School is Canada's top business school by many rankings.",
  },
  {
    id: "ca-cs-western", name: "Computer Science BSc",
    university: "Western University", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Maths essential.",
  },
  {
    id: "ca-medicine-western", name: "Medical Sciences BSc (pre-med)",
    university: "Western University", country: "CA", degreeLevel: "BSc", category: "medicine",
    requirements: { essential: ["Biology","Chemistry"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "Common pre-med pathway.",
  },

  // ── Queen's ───────────────────────────────────────────────────
  {
    id: "ca-business-queens", name: "Commerce BCom (Smith School)",
    university: "Queen's University", country: "CA", degreeLevel: "BCom", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Smith School of Business. Highly selective. Strong Bay Street pipeline.",
  },
  {
    id: "ca-engineering-queens", name: "Engineering BSc",
    university: "Queen's University", country: "CA", degreeLevel: "BSc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Maths and Physics essential.",
  },
  {
    id: "ca-economics-queens", name: "Economics BA",
    university: "Queen's University", country: "CA", degreeLevel: "BA", category: "economics",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Mathematics_Advanced","Economics"], useful: ["Statistics"] },
    notes: "Maths required.",
  },

  // ── University of Alberta ─────────────────────────────────────
  {
    id: "ca-engineering-alberta", name: "Engineering BSc",
    university: "University of Alberta", country: "CA", degreeLevel: "BSc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Top Canadian engineering school. Maths and Physics essential.",
  },
  {
    id: "ca-cs-alberta", name: "Computer Science BSc",
    university: "University of Alberta", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Strong AI and CS research.",
  },
  {
    id: "ca-business-alberta", name: "Business BCom (Alberta School of Business)",
    university: "University of Alberta", country: "CA", degreeLevel: "BCom", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Top business school in western Canada.",
  },

  // ── Simon Fraser University ───────────────────────────────────
  {
    id: "ca-cs-sfu", name: "Computer Science BSc",
    university: "Simon Fraser University", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Strong CS and co-op programme.",
  },
  {
    id: "ca-business-sfu", name: "Business Administration BBA (Beedie)",
    university: "Simon Fraser University", country: "CA", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Co-op available.",
  },

  // ── University of Calgary ─────────────────────────────────────
  {
    id: "ca-engineering-calgary", name: "Engineering BSc",
    university: "University of Calgary", country: "CA", degreeLevel: "BSc", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Maths and Physics essential.",
  },
  {
    id: "ca-business-calgary", name: "Business BCom (Haskayne)",
    university: "University of Calgary", country: "CA", degreeLevel: "BCom", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Haskayne School of Business.",
  },

  // ── University of Ottawa ──────────────────────────────────────
  {
    id: "ca-law-ottawa", name: "Law LLB/JD",
    university: "University of Ottawa", country: "CA", degreeLevel: "JD", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy","Economics"] },
    notes: "Bilingual law school. Civil Law and Common Law programmes available.",
  },
  {
    id: "ca-cs-ottawa", name: "Computer Science BSc",
    university: "University of Ottawa", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Bilingual university.",
  },

  // ── Dalhousie ─────────────────────────────────────────────────
  {
    id: "ca-medicine-dalhousie", name: "Medicine MD",
    university: "Dalhousie University", country: "CA", degreeLevel: "MD", category: "medicine",
    requirements: { essential: ["Chemistry","Biology"], preferred: ["Mathematics_Standard"], useful: ["Physics"] },
    notes: "MCAT required. Atlantic Canada's primary medical school.",
  },
  {
    id: "ca-engineering-dalhousie", name: "Engineering BEng",
    university: "Dalhousie University", country: "CA", degreeLevel: "BEng", category: "engineering",
    requirements: { essential: ["Mathematics_Advanced","Physics"], preferred: ["Chemistry"], useful: ["Computer_Science"] },
    notes: "Maths and Physics essential.",
  },

  // ── Concordia ─────────────────────────────────────────────────
  {
    id: "ca-business-concordia", name: "Business Administration BComm (John Molson)",
    university: "Concordia University", country: "CA", degreeLevel: "BComm", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "John Molson School of Business. Strong finance programme.",
  },
  {
    id: "ca-cs-concordia", name: "Computer Science BSc",
    university: "Concordia University", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Strong co-op and applied programme.",
  },

  // ── York University ───────────────────────────────────────────
  {
    id: "ca-business-york", name: "Business Administration BBA (Schulich)",
    university: "York University", country: "CA", degreeLevel: "BBA", category: "business",
    requirements: { essential: ["Mathematics_Standard"], preferred: ["Economics","Mathematics_Advanced"], useful: ["Business","Statistics"] },
    notes: "Schulich School of Business. Strong global business reputation.",
  },
  {
    id: "ca-law-york", name: "Law JD (Osgoode Hall)",
    university: "York University", country: "CA", degreeLevel: "JD", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy","Economics"] },
    notes: "Osgoode Hall Law School is one of Canada's top law schools.",
  },

  // ── University of Victoria ────────────────────────────────────
  {
    id: "ca-law-uvic", name: "Law JD",
    university: "University of Victoria", country: "CA", degreeLevel: "JD", category: "law",
    requirements: { essential: [], preferred: ["History","English"], useful: ["Philosophy","Economics"] },
    notes: "Strong focus on Indigenous law and environmental law.",
  },
  {
    id: "ca-cs-uvic", name: "Computer Science BSc",
    university: "University of Victoria", country: "CA", degreeLevel: "BSc", category: "cs",
    requirements: { essential: ["Mathematics_Advanced"], preferred: ["Computer_Science","Physics"], useful: ["Statistics"] },
    notes: "Co-op programme available.",
  },

];
