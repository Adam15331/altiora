/**
 * Universal subject tags used across all qualification systems.
 * These are the canonical identifiers referenced in courseRequirements.js.
 *
 * Mathematics_Standard   – standard/introductory maths (calculus AB, H1, SL AA/AI)
 * Mathematics_Advanced   – rigorous maths (Further Maths, Calc BC, H2, HL AA)
 * Statistics             – dedicated statistics courses
 * English                – first-language English / literature
 * English_Language       – language/linguistics strand
 * Biology                – life sciences
 * Chemistry              – chemistry
 * Physics                – physics
 * Environmental_Science  – environmental / earth science
 * History                – history
 * Geography              – geography
 * Economics              – economics
 * Business               – business studies / management
 * Psychology             – psychology
 * Sociology              – sociology
 * Philosophy             – philosophy / theory of knowledge
 * Law                    – legal studies
 * Art                    – visual art / fine art
 * Design_Technology      – design, engineering graphics, product design
 * Music                  – music
 * Drama                  – drama / theatre studies
 * Computer_Science       – computing / CS
 * Language_French        – French
 * Language_German        – German
 * Language_Spanish       – Spanish
 * Language_Mandarin      – Mandarin Chinese / Chinese
 * Language_Dutch         – Dutch
 * Language_Malay         – Malay
 * Language_Tamil         – Tamil
 * Language_Cantonese     – Cantonese / Chinese (HK)
 * Physical_Education     – PE / sports science
 * Religious_Studies      – RE / theology / ethics
 */

const qualificationMappings = {

  /* ─────────────────────────────────────────────────────────────
   * UK A-LEVELS
   * ───────────────────────────────────────────────────────────── */
  "UK_A_Level": {
    systemLabel: "UK A-Levels",
    subjects: {
      "Mathematics":                    "Mathematics_Standard",
      "Further Mathematics":            "Mathematics_Advanced",
      "Statistics":                     "Statistics",
      "English Literature":             "English",
      "English Language":               "English_Language",
      "English Language and Literature":"English",
      "Biology":                        "Biology",
      "Chemistry":                      "Chemistry",
      "Physics":                        "Physics",
      "Environmental Science":          "Environmental_Science",
      "History":                        "History",
      "Geography":                      "Geography",
      "Economics":                      "Economics",
      "Business Studies":               "Business",
      "Business":                       "Business",
      "Psychology":                     "Psychology",
      "Sociology":                      "Sociology",
      "Philosophy":                     "Philosophy",
      "Law":                            "Law",
      "Art and Design":                 "Art",
      "Fine Art":                       "Art",
      "Design and Technology":          "Design_Technology",
      "Product Design":                 "Design_Technology",
      "Music":                          "Music",
      "Drama":                          "Drama",
      "Theatre Studies":                "Drama",
      "Computer Science":               "Computer_Science",
      "ICT":                            "Computer_Science",
      "French":                         "Language_French",
      "German":                         "Language_German",
      "Spanish":                        "Language_Spanish",
      "Mandarin Chinese":               "Language_Mandarin",
      "Chinese":                        "Language_Mandarin",
      "Physical Education":             "Physical_Education",
      "Religious Studies":              "Religious_Studies",
      "Politics":                       "Sociology",
      "Media Studies":                  "Art",
      "Film Studies":                   "Art",
    },
  },

  /* ─────────────────────────────────────────────────────────────
   * INTERNATIONAL BACCALAUREATE (IB Diploma)
   * HL = Higher Level, SL = Standard Level
   * We map both to the same tag; HL subjects noted below where
   * they map to the _Advanced tag instead.
   * ───────────────────────────────────────────────────────────── */
  "IB": {
    systemLabel: "International Baccalaureate",
    subjects: {
      // Group 1 – Studies in Language & Literature
      "Language A: Literature HL":           "English",
      "Language A: Literature SL":           "English",
      "Language A: Language and Literature HL": "English",
      "Language A: Language and Literature SL": "English_Language",
      "English A: Literature HL":            "English",
      "English A: Literature SL":            "English",
      "English A: Language and Literature HL": "English",
      "English A: Language and Literature SL": "English_Language",

      // Group 2 – Language Acquisition
      "French B HL":    "Language_French",
      "French B SL":    "Language_French",
      "French ab initio": "Language_French",
      "German B HL":    "Language_German",
      "German B SL":    "Language_German",
      "Spanish B HL":   "Language_Spanish",
      "Spanish B SL":   "Language_Spanish",
      "Mandarin B HL":  "Language_Mandarin",
      "Mandarin B SL":  "Language_Mandarin",
      "Chinese B HL":   "Language_Mandarin",
      "Chinese B SL":   "Language_Mandarin",

      // Group 3 – Individuals & Societies
      "History HL":         "History",
      "History SL":         "History",
      "Geography HL":       "Geography",
      "Geography SL":       "Geography",
      "Economics HL":       "Economics",
      "Economics SL":       "Economics",
      "Business Management HL": "Business",
      "Business Management SL": "Business",
      "Psychology HL":      "Psychology",
      "Psychology SL":      "Psychology",
      "Philosophy HL":      "Philosophy",
      "Philosophy SL":      "Philosophy",
      "Global Politics HL": "Sociology",
      "Global Politics SL": "Sociology",
      "Environmental Systems and Societies SL": "Environmental_Science",
      "Social and Cultural Anthropology HL": "Sociology",
      "Social and Cultural Anthropology SL": "Sociology",

      // Group 4 – Sciences
      "Biology HL":         "Biology",
      "Biology SL":         "Biology",
      "Chemistry HL":       "Chemistry",
      "Chemistry SL":       "Chemistry",
      "Physics HL":         "Physics",
      "Physics SL":         "Physics",
      "Computer Science HL":"Computer_Science",
      "Computer Science SL":"Computer_Science",
      "Environmental Systems and Societies HL": "Environmental_Science",
      "Sports Exercise and Health Science HL": "Physical_Education",
      "Sports Exercise and Health Science SL": "Physical_Education",
      "Design Technology HL": "Design_Technology",
      "Design Technology SL": "Design_Technology",

      // Group 5 – Mathematics
      "Mathematics: Analysis and Approaches HL":           "Mathematics_Advanced",
      "Mathematics: Analysis and Approaches SL":           "Mathematics_Standard",
      "Mathematics: Applications and Interpretation HL":   "Mathematics_Standard",
      "Mathematics: Applications and Interpretation SL":   "Mathematics_Standard",
      // Legacy (pre-2019)
      "Mathematics HL":                                    "Mathematics_Advanced",
      "Mathematics SL":                                    "Mathematics_Standard",
      "Mathematical Studies SL":                           "Mathematics_Standard",
      "Further Mathematics HL":                            "Mathematics_Advanced",

      // Group 6 – The Arts
      "Visual Arts HL":  "Art",
      "Visual Arts SL":  "Art",
      "Music HL":        "Music",
      "Music SL":        "Music",
      "Theatre HL":      "Drama",
      "Theatre SL":      "Drama",
      "Film HL":         "Art",
      "Film SL":         "Art",
    },
  },

  /* ─────────────────────────────────────────────────────────────
   * US ADVANCED PLACEMENT (AP)
   * ───────────────────────────────────────────────────────────── */
  "US_AP": {
    systemLabel: "US High School (AP)",
    subjects: {
      // Mathematics
      "AP Calculus BC":              "Mathematics_Advanced",
      "AP Calculus AB":              "Mathematics_Standard",
      "AP Statistics":               "Statistics",

      // English
      "AP English Literature and Composition":  "English",
      "AP English Language and Composition":    "English_Language",

      // Sciences
      "AP Biology":                  "Biology",
      "AP Chemistry":                "Chemistry",
      "AP Physics C: Mechanics":     "Physics",
      "AP Physics C: Electricity and Magnetism": "Physics",
      "AP Physics 1":                "Physics",
      "AP Physics 2":                "Physics",
      "AP Environmental Science":    "Environmental_Science",
      "AP Computer Science A":       "Computer_Science",
      "AP Computer Science Principles": "Computer_Science",

      // Humanities & Social Sciences
      "AP US History":               "History",
      "AP World History: Modern":    "History",
      "AP European History":         "History",
      "AP Human Geography":          "Geography",
      "AP Macroeconomics":           "Economics",
      "AP Microeconomics":           "Economics",
      "AP Psychology":               "Psychology",
      "AP US Government and Politics": "Sociology",
      "AP Comparative Government and Politics": "Sociology",
      "AP Sociology":                "Sociology",

      // Languages
      "AP French Language and Culture":   "Language_French",
      "AP German Language and Culture":   "Language_German",
      "AP Spanish Language and Culture":  "Language_Spanish",
      "AP Spanish Literature and Culture":"Language_Spanish",
      "AP Chinese Language and Culture":  "Language_Mandarin",

      // Arts
      "AP Art History":              "History",
      "AP Studio Art":               "Art",
      "AP Music Theory":             "Music",

      // Other
      "AP Art and Design":           "Art",
      "AP Seminar":                  "Philosophy",
      "AP Research":                 "Philosophy",
    },
  },

  /* ─────────────────────────────────────────────────────────────
   * NETHERLANDS VWO (Voorbereidend Wetenschappelijk Onderwijs)
   * ───────────────────────────────────────────────────────────── */
  "NL_VWO": {
    systemLabel: "Netherlands VWO",
    subjects: {
      // Mathematics
      "Wiskunde B":           "Mathematics_Advanced",
      "Wiskunde A":           "Mathematics_Standard",
      "Wiskunde C":           "Mathematics_Standard",
      "Wiskunde D":           "Mathematics_Advanced",   // additional/enrichment

      // Sciences
      "Biologie":             "Biology",
      "Scheikunde":           "Chemistry",
      "Natuurkunde":          "Physics",
      "Informatica":          "Computer_Science",
      "Natuur, Leven en Technologie": "Environmental_Science",
      "Natuur, Leven en Technologie (NLT)": "Environmental_Science",

      // Languages
      "Nederlands":           "English",                // Dutch first language maps to English tag
      "Engels":               "English",
      "Duits":                "Language_German",
      "Frans":                "Language_French",
      "Spaans":               "Language_Spanish",
      "Chinees":              "Language_Mandarin",

      // Social sciences & humanities
      "Economie":             "Economics",
      "Bedrijfseconomie":     "Business",
      "Maatschappijwetenschappen": "Sociology",
      "Aardrijkskunde":       "Geography",
      "Geschiedenis":         "History",
      "Filosofie":            "Philosophy",
      "Kunst (Beeldende vormgeving)": "Art",
      "Muziek":               "Music",
      "Culturele en Kunstzinnige Vorming": "Art",
      "Godsdienst/Levensbeschouwing": "Religious_Studies",
      "Latijn":               "History",               // classical studies; closest tag
      "Grieks":               "History",
      "Lichamelijke Opvoeding": "Physical_Education",
    },
  },

  /* ─────────────────────────────────────────────────────────────
   * SINGAPORE-CAMBRIDGE A-LEVELS (H1 / H2 / H3)
   * H2 = Higher 2 (principal subject, ~A-level standard)
   * H1 = Higher 1 (subsidiary, half the teaching time)
   * ───────────────────────────────────────────────────────────── */
  "SG_A_Level": {
    systemLabel: "Singapore-Cambridge A-Levels",
    subjects: {
      // Mathematics
      "H2 Mathematics":              "Mathematics_Advanced",
      "H1 Mathematics":              "Mathematics_Standard",
      "H2 Further Mathematics":      "Mathematics_Advanced",
      "H3 Mathematics":              "Mathematics_Advanced",

      // Sciences
      "H2 Biology":                  "Biology",
      "H1 Biology":                  "Biology",
      "H2 Chemistry":                "Chemistry",
      "H1 Chemistry":                "Chemistry",
      "H2 Physics":                  "Physics",
      "H1 Physics":                  "Physics",
      "H2 Computing":                "Computer_Science",
      "H1 Computing":                "Computer_Science",

      // English & Languages
      "H1 General Paper":            "English",
      "H2 Knowledge and Inquiry":    "Philosophy",
      "H2 English Language and Linguistics": "English_Language",
      "H2 Literature in English":    "English",
      "H1 Literature in English":    "English",
      "H2 French":                   "Language_French",
      "H2 German":                   "Language_German",
      "H2 Spanish":                  "Language_Spanish",
      "H2 Chinese Language":         "Language_Mandarin",
      "H1 Chinese Language":         "Language_Mandarin",
      "H2 Malay Language":           "Language_Malay",
      "H1 Malay Language":           "Language_Malay",
      "H2 Tamil Language":           "Language_Tamil",
      "H1 Tamil Language":           "Language_Tamil",

      // Humanities & Social Sciences
      "H2 Economics":                "Economics",
      "H1 Economics":                "Economics",
      "H2 History":                  "History",
      "H1 History":                  "History",
      "H2 Geography":                "Geography",
      "H1 Geography":                "Geography",
      "H2 Psychology":               "Psychology",
      "H2 Management of Business":   "Business",
      "H2 Business Studies":         "Business",
      "H2 Art":                      "Art",
      "H2 Music":                    "Music",
      "H2 Drama":                    "Drama",
    },
  },

  /* ─────────────────────────────────────────────────────────────
   * HONG KONG DSE (Diploma of Secondary Education)
   * Core subjects + electives
   * ───────────────────────────────────────────────────────────── */
  "HK_DSE": {
    systemLabel: "Hong Kong DSE",
    subjects: {
      // Core subjects
      "Chinese Language":                        "Language_Cantonese",
      "English Language":                        "English",
      "Mathematics Compulsory Part":             "Mathematics_Standard",
      "Mathematics Extended Part Module 1 (M1)": "Mathematics_Standard",  // calculus & stats
      "Mathematics Extended Part Module 2 (M2)": "Mathematics_Advanced",  // algebra & calculus

      // Elective – Sciences
      "Biology":              "Biology",
      "Chemistry":            "Chemistry",
      "Physics":              "Physics",
      "Combined Science":     "Biology",            // general science option
      "Integrated Science":   "Environmental_Science",
      "Information and Communication Technology": "Computer_Science",

      // Elective – Humanities & Social Sciences
      "Chinese History":      "History",
      "History":              "History",
      "Geography":            "Geography",
      "Economics":            "Economics",
      "Business, Accounting and Financial Studies (BAFS)": "Business",
      "Tourism and Hospitality Studies":    "Business",
      "Liberal Studies":                    "Sociology",   // (replaced by Citizenship & Social Development)
      "Citizenship and Social Development": "Sociology",
      "Ethics and Religious Studies":       "Religious_Studies",

      // Elective – Languages
      "French":               "Language_French",
      "German":               "Language_German",
      "Spanish":              "Language_Spanish",
      "Japanese":             "Language_Mandarin",  // closest available tag

      // Elective – Arts
      "Visual Arts":          "Art",
      "Music":                "Music",
      "Design and Applied Technology": "Design_Technology",
      "Physical Education":   "Physical_Education",
    },
  },

};
