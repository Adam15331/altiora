const qualificationMappings = {
  qualifications: [
    { id: "hsc", label: "HSC (NSW)", description: "Higher School Certificate" },
    { id: "vce", label: "VCE (VIC)", description: "Victorian Certificate of Education" },
    { id: "qce", label: "QCE (QLD)", description: "Queensland Certificate of Education" },
    { id: "wace", label: "WACE (WA)", description: "Western Australian Certificate of Education" },
    { id: "sace", label: "SACE (SA)", description: "South Australian Certificate of Education" },
    { id: "ib", label: "IB Diploma", description: "International Baccalaureate" },
  ],

  subjectCategories: {
    sciences: {
      label: "Sciences",
      subjects: [
        { id: "bio", label: "Biology" },
        { id: "chem", label: "Chemistry" },
        { id: "phys", label: "Physics" },
        { id: "maths_adv", label: "Mathematics Advanced / Mathematical Methods" },
        { id: "maths_ext", label: "Mathematics Extension / Specialist Mathematics" },
        { id: "maths_std", label: "Mathematics Standard / General Mathematics" },
        { id: "earth_env", label: "Earth & Environmental Science" },
        { id: "comp_sci", label: "Computing / Software Development" },
      ],
    },
    humanities: {
      label: "Humanities & Social Sciences",
      subjects: [
        { id: "eng_adv", label: "English Advanced / Literature" },
        { id: "eng_std", label: "English Standard / English" },
        { id: "hist", label: "Modern / Ancient History" },
        { id: "geo", label: "Geography" },
        { id: "econ", label: "Economics" },
        { id: "legal", label: "Legal Studies" },
        { id: "soc_sci", label: "Society & Culture / Sociology" },
        { id: "psych", label: "Psychology" },
      ],
    },
    arts: {
      label: "Arts & Languages",
      subjects: [
        { id: "visual_arts", label: "Visual Arts / Studio Arts" },
        { id: "music", label: "Music" },
        { id: "drama", label: "Drama / Theatre Studies" },
        { id: "lang_french", label: "French" },
        { id: "lang_japanese", label: "Japanese" },
        { id: "lang_mandarin", label: "Chinese / Mandarin" },
        { id: "lang_spanish", label: "Spanish" },
      ],
    },
    vocational: {
      label: "Vocational & Applied",
      subjects: [
        { id: "business_std", label: "Business Studies" },
        { id: "design_tech", label: "Design & Technology / Product Design" },
        { id: "health", label: "Health & Human Development / PDHPE" },
        { id: "hospitality", label: "Hospitality / Food Technology" },
      ],
    },
  },

  atarBands: [
    { min: 99, max: 100, label: "99.00 – 100.00" },
    { min: 95, max: 98.99, label: "95.00 – 98.99" },
    { min: 90, max: 94.99, label: "90.00 – 94.99" },
    { min: 85, max: 89.99, label: "85.00 – 89.99" },
    { min: 80, max: 84.99, label: "80.00 – 84.99" },
    { min: 75, max: 79.99, label: "75.00 – 79.99" },
    { min: 70, max: 74.99, label: "70.00 – 74.99" },
    { min: 60, max: 69.99, label: "60.00 – 69.99" },
    { min: 50, max: 59.99, label: "50.00 – 59.99" },
    { min: 0, max: 49.99, label: "Below 50" },
  ],
};
