/* University profiles — lightweight context for international students.
 * Consumed by buildCheckCard() in main.js via universityProfiles[course.university].
 * Do NOT modify course data, qualification mappings, or design tokens.
 */
const universityProfiles = {

  /* ── United Kingdom ──────────────────────────────────────────── */

  "University of Oxford": {
    country: "UK", countryFlag: "🇬🇧", city: "Oxford",
    tagline: "One of the world's oldest and most prestigious universities.",
    internationalNote: "Oxford operates a college system — you apply to a specific college within the university. International students make up ~40% of graduate intake and ~20% of undergraduates. Tuition for international students is £30–45k/year depending on course.",
    websiteUrl: "https://www.ox.ac.uk",
  },
  "University of Cambridge": {
    country: "UK", countryFlag: "🇬🇧", city: "Cambridge",
    tagline: "A collegiate research university renowned globally for science and humanities.",
    internationalNote: "Like Oxford, Cambridge uses a college system. Interviews are a key part of admissions. International undergraduate fees are £24–58k/year. STEP is required for Mathematics.",
    websiteUrl: "https://www.cam.ac.uk",
  },
  "Imperial College London": {
    country: "UK", countryFlag: "🇬🇧", city: "London",
    tagline: "London's specialist science, engineering, and medicine university.",
    internationalNote: "Imperial focuses on STEM. Located in South Kensington, London. International fees are £30–45k/year. Strong industry ties and a large international student body (~60%).",
    websiteUrl: "https://www.imperial.ac.uk",
  },
  "London School of Economics": {
    country: "UK", countryFlag: "🇬🇧", city: "London",
    tagline: "The world's leading social science university.",
    internationalNote: "LSE is highly international — over 70% of students come from outside the UK. Located in central London near Covent Garden. International undergraduate fees are ~£23k/year.",
    websiteUrl: "https://www.lse.ac.uk",
  },
  "University College London": {
    country: "UK", countryFlag: "🇬🇧", city: "London",
    tagline: "London's global university — multidisciplinary and research-intensive.",
    internationalNote: "UCL has one of the highest proportions of international students in the UK (~60%). Situated in Bloomsbury, central London. International fees vary by course, typically £23–35k/year.",
    websiteUrl: "https://www.ucl.ac.uk",
  },
  "University of Edinburgh": {
    country: "UK", countryFlag: "🇬🇧", city: "Edinburgh",
    tagline: "Scotland's ancient capital university, ranked among Europe's best.",
    internationalNote: "Edinburgh is popular with international students from the US, China, and Southeast Asia. The city is vibrant and affordable compared to London. International fees are ~£24–33k/year.",
    websiteUrl: "https://www.ed.ac.uk",
  },
  "King's College London": {
    country: "UK", countryFlag: "🇬🇧", city: "London",
    tagline: "A research university at the heart of London, strong in health sciences and law.",
    internationalNote: "King's has campuses along the Thames in central London. Known for medicine, law, and humanities. International fees are ~£22–35k/year, with ~50% international students.",
    websiteUrl: "https://www.kcl.ac.uk",
  },
  "University of Manchester": {
    country: "UK", countryFlag: "🇬🇧", city: "Manchester",
    tagline: "A Russell Group powerhouse — the UK's most popular university by applications.",
    internationalNote: "Manchester is a diverse, affordable city. The university has a large global alumni network. International fees are ~£21–32k/year. Strong industry connections across engineering and business.",
    websiteUrl: "https://www.manchester.ac.uk",
  },
  "University of Warwick": {
    country: "UK", countryFlag: "🇬🇧", city: "Coventry",
    tagline: "Consistently ranked top 10 in the UK — known for business, law, and STEM.",
    internationalNote: "Warwick's campus is near Coventry, about 1.5 hours from London. International fees are ~£22–29k/year. Warwick Business School is particularly well-regarded.",
    websiteUrl: "https://www.warwick.ac.uk",
  },
  "University of Bristol": {
    country: "UK", countryFlag: "🇬🇧", city: "Bristol",
    tagline: "A leading research university in one of the UK's most vibrant cities.",
    internationalNote: "Bristol is a creative, student-friendly city in southwest England. International fees are ~£22–31k/year. Strong in engineering, sciences, and the arts.",
    websiteUrl: "https://www.bristol.ac.uk",
  },
  "Durham University": {
    country: "UK", countryFlag: "🇬🇧", city: "Durham",
    tagline: "Collegiate university in a historic cathedral city — strong in law and sciences.",
    internationalNote: "Durham uses a college system like Oxford and Cambridge. It's a smaller city, offering a tight-knit campus feel. International fees are ~£20–27k/year.",
    websiteUrl: "https://www.durham.ac.uk",
  },
  "University of Bath": {
    country: "UK", countryFlag: "🇬🇧", city: "Bath",
    tagline: "Known for placement years and outstanding graduate employability.",
    internationalNote: "Bath is a beautiful Georgian spa city. The university is especially strong in engineering and management with integrated sandwich placements. International fees are ~£18–25k/year.",
    websiteUrl: "https://www.bath.ac.uk",
  },
  "University of Glasgow": {
    country: "UK", countryFlag: "🇬🇧", city: "Glasgow",
    tagline: "Scotland's oldest civic university — world-class in medicine and research.",
    internationalNote: "Glasgow is Scotland's largest city, known for its friendly culture and lower cost of living. International fees are ~£19–28k/year. Strong medicine, engineering, and arts programmes.",
    websiteUrl: "https://www.gla.ac.uk",
  },
  "University of St Andrews": {
    country: "UK", countryFlag: "🇬🇧", city: "St Andrews",
    tagline: "Scotland's oldest university — small, prestigious, and internationally diverse.",
    internationalNote: "St Andrews is very popular with US and international students (~50% international). It's a small seaside town in Fife, Scotland. International fees are ~£22–27k/year.",
    websiteUrl: "https://www.st-andrews.ac.uk",
  },
  "University of Leeds": {
    country: "UK", countryFlag: "🇬🇧", city: "Leeds",
    tagline: "A large Russell Group university — strong in medicine, engineering, and media.",
    internationalNote: "Leeds is a large, affordable northern English city. The university has a lively campus and a strong international community. International fees are ~£20–28k/year.",
    websiteUrl: "https://www.leeds.ac.uk",
  },
  "University of Nottingham": {
    country: "UK", countryFlag: "🇬🇧", city: "Nottingham",
    tagline: "A global campus university with sites in the UK, China, and Malaysia.",
    internationalNote: "Nottingham has full campuses in China and Malaysia — useful context for Asian students. UK campus is one of the most beautiful in Britain. International fees are ~£19–26k/year.",
    websiteUrl: "https://www.nottingham.ac.uk",
  },
  "University of Birmingham": {
    country: "UK", countryFlag: "🇬🇧", city: "Birmingham",
    tagline: "A founding Russell Group member — strong in medicine, law, and engineering.",
    internationalNote: "Birmingham is the UK's second-largest city and very multicultural. The campus is self-contained and vibrant. International fees are ~£19–27k/year.",
    websiteUrl: "https://www.birmingham.ac.uk",
  },
  "University of Exeter": {
    country: "UK", countryFlag: "🇬🇧", city: "Exeter",
    tagline: "A fast-rising research university in the scenic southwest of England.",
    internationalNote: "Exeter is a safe, pleasant city close to Devon's coastline. Popular with students seeking a high quality of life. International fees are ~£19–25k/year.",
    websiteUrl: "https://www.exeter.ac.uk",
  },

  /* ── United States ───────────────────────────────────────────── */

  "MIT": {
    country: "US", countryFlag: "🇺🇸", city: "Cambridge, MA",
    tagline: "The world's pre-eminent science and engineering university.",
    internationalNote: "MIT is need-blind for international students and meets 100% of demonstrated financial need. Located in Cambridge, Massachusetts, next to Harvard. ~11% acceptance rate; holistic admissions including essays and extracurriculars.",
    websiteUrl: "https://www.mit.edu",
  },
  "Stanford University": {
    country: "US", countryFlag: "🇺🇸", city: "Palo Alto, CA",
    tagline: "Silicon Valley's university — a hub for technology and entrepreneurship.",
    internationalNote: "Stanford meets 100% of demonstrated financial need for all students, including internationals. Located in the heart of Silicon Valley. ~4% acceptance rate. Strong entrepreneurship ecosystem.",
    websiteUrl: "https://www.stanford.edu",
  },
  "Harvard University": {
    country: "US", countryFlag: "🇺🇸", city: "Cambridge, MA",
    tagline: "The world's most famous university — exceptional across all disciplines.",
    internationalNote: "Harvard meets 100% of demonstrated financial need globally, with generous aid for international students. Located in Cambridge, MA. ~4% acceptance rate. Holistic admissions.",
    websiteUrl: "https://www.harvard.edu",
  },
  "Princeton University": {
    country: "US", countryFlag: "🇺🇸", city: "Princeton, NJ",
    tagline: "An Ivy League leader — renowned for undergraduate teaching and research.",
    internationalNote: "Princeton is need-blind for international students and offers generous financial aid. Located in a small college town in New Jersey, 1 hour from New York City. ~4% acceptance rate.",
    websiteUrl: "https://www.princeton.edu",
  },
  "Yale University": {
    country: "US", countryFlag: "🇺🇸", city: "New Haven, CT",
    tagline: "An Ivy League icon — exceptional in law, drama, and the liberal arts.",
    internationalNote: "Yale meets 100% of demonstrated financial need for international students. Located in New Haven, Connecticut, 2 hours from New York City. ~5% acceptance rate. Strong emphasis on undergraduate residential life.",
    websiteUrl: "https://www.yale.edu",
  },
  "Columbia University": {
    country: "US", countryFlag: "🇺🇸", city: "New York City, NY",
    tagline: "An Ivy League university in the heart of Manhattan.",
    internationalNote: "Columbia is located in Morningside Heights, New York City — ideal for students who want an urban experience. International students are ~30% of the student body. Financial aid is available for international students.",
    websiteUrl: "https://www.columbia.edu",
  },
  "University of Pennsylvania": {
    country: "US", countryFlag: "🇺🇸", city: "Philadelphia, PA",
    tagline: "Home to Wharton, Penn Law, and Penn Medicine — uniquely interdisciplinary.",
    internationalNote: "Penn's Wharton School is one of the world's top business schools. Located in Philadelphia, PA. International students are ~24% of undergraduates. Need-based financial aid available for international students.",
    websiteUrl: "https://www.upenn.edu",
  },
  "Caltech": {
    country: "US", countryFlag: "🇺🇸", city: "Pasadena, CA",
    tagline: "A small but elite science and engineering institute near Los Angeles.",
    internationalNote: "Caltech has only ~900 undergraduates, giving it an intimate research-focused environment. Located in Pasadena, near LA. Meets 100% of demonstrated financial need for all students including internationals.",
    websiteUrl: "https://www.caltech.edu",
  },
  "Carnegie Mellon University": {
    country: "US", countryFlag: "🇺🇸", city: "Pittsburgh, PA",
    tagline: "World-leading in computer science, robotics, and the performing arts.",
    internationalNote: "CMU is particularly renowned for its School of Computer Science (consistently #1 in the US). Located in Pittsburgh, PA. ~50% of graduate students are international. Undergraduate aid is available but limited for internationals.",
    websiteUrl: "https://www.cmu.edu",
  },
  "UC Berkeley": {
    country: "US", countryFlag: "🇺🇸", city: "Berkeley, CA",
    tagline: "California's flagship public research university — top ranked globally.",
    internationalNote: "As a public university, UC Berkeley charges higher fees for out-of-state and international students (~$44k/year tuition + living costs). Admissions are test-optional. Iconic campus in the San Francisco Bay Area.",
    websiteUrl: "https://www.berkeley.edu",
  },
  "University of Michigan": {
    country: "US", countryFlag: "🇺🇸", city: "Ann Arbor, MI",
    tagline: "A top public research university — strong in engineering, business, and medicine.",
    internationalNote: "Michigan is a large public university (~47,000 students) in Ann Arbor. International students pay out-of-state fees (~$53k/year tuition). Strong alumni network and big sports culture.",
    websiteUrl: "https://www.umich.edu",
  },
  "New York University": {
    country: "US", countryFlag: "🇺🇸", city: "New York City, NY",
    tagline: "A global university embedded in New York City — known for arts, business, and law.",
    internationalNote: "NYU has campuses in Abu Dhabi and Shanghai in addition to its main NYC campus. International students make up ~20% of undergraduates. Located in Greenwich Village, Manhattan. Aid for international students is limited.",
    websiteUrl: "https://www.nyu.edu",
  },
  "Georgetown University": {
    country: "US", countryFlag: "🇺🇸", city: "Washington D.C.",
    tagline: "A Jesuit university known for international affairs, law, and government.",
    internationalNote: "Georgetown is located in Washington D.C. — ideal for students interested in policy, diplomacy, and government. The Walsh School of Foreign Service is world-renowned. International financial aid is limited.",
    websiteUrl: "https://www.georgetown.edu",
  },
  "Duke University": {
    country: "US", countryFlag: "🇺🇸", city: "Durham, NC",
    tagline: "A top research university strong in medicine, law, and global affairs.",
    internationalNote: "Duke is located in Durham, North Carolina, with a beautiful Gothic-style campus. International students are ~12% of undergraduates. Need-based aid is available for all admitted students regardless of nationality.",
    websiteUrl: "https://www.duke.edu",
  },
  "Johns Hopkins University": {
    country: "US", countryFlag: "🇺🇸", city: "Baltimore, MD",
    tagline: "America's first research university — the gold standard for medicine and public health.",
    internationalNote: "Hopkins is the world's leading university for medical research and the home of the Bloomberg School of Public Health. Located in Baltimore, MD. Meets 100% of demonstrated financial need including for international students.",
    websiteUrl: "https://www.jhu.edu",
  },
  "Northwestern University": {
    country: "US", countryFlag: "🇺🇸", city: "Evanston, IL",
    tagline: "A top private research university near Chicago — strong in journalism and law.",
    internationalNote: "Northwestern is located in Evanston, Illinois, on the shores of Lake Michigan, 20 minutes from Chicago. Known for its quarter system and strong professional schools. Need-based aid available for international students.",
    websiteUrl: "https://www.northwestern.edu",
  },
  "Dartmouth College": {
    country: "US", countryFlag: "🇺🇸", city: "Hanover, NH",
    tagline: "The Ivy League's smallest college — known for strong undergraduate culture.",
    internationalNote: "Dartmouth uses a quarter system with a distinctive D-Plan allowing off-campus terms. Located in rural New Hampshire. Meets 100% of demonstrated financial need for all admitted students.",
    websiteUrl: "https://www.dartmouth.edu",
  },
  "Brown University": {
    country: "US", countryFlag: "🇺🇸", city: "Providence, RI",
    tagline: "An Ivy League university with an open curriculum — design your own degree.",
    internationalNote: "Brown's Open Curriculum lets students design their studies without required courses outside their concentration. Located in Providence, Rhode Island. Meets 100% of demonstrated financial need for international students.",
    websiteUrl: "https://www.brown.edu",
  },
  "Cornell University": {
    country: "US", countryFlag: "🇺🇸", city: "Ithaca, NY",
    tagline: "The most professionally diverse Ivy — strong in engineering, agriculture, and hotel management.",
    internationalNote: "Cornell has a mix of private and statutory (public-funded) colleges. Located in Ithaca, New York State. International students are ~10% of undergraduates. Financial aid for internationals is available in some colleges.",
    websiteUrl: "https://www.cornell.edu",
  },
  "Rice University": {
    country: "US", countryFlag: "🇺🇸", city: "Houston, TX",
    tagline: "A small, elite research university — exceptional student-to-faculty ratio.",
    internationalNote: "Rice has only ~4,000 undergraduates and a residential college system similar to Oxford. Located in Houston, Texas, near the NASA Space Center. Meets 100% of demonstrated financial need for all students.",
    websiteUrl: "https://www.rice.edu",
  },
  "Vanderbilt University": {
    country: "US", countryFlag: "🇺🇸", city: "Nashville, TN",
    tagline: "A top research university in the heart of Music City — strong in education and medicine.",
    internationalNote: "Vanderbilt is located in Nashville, Tennessee. It has a no-loan financial aid policy and meets 100% of demonstrated need for all admitted students, including internationals.",
    websiteUrl: "https://www.vanderbilt.edu",
  },
  "University of Notre Dame": {
    country: "US", countryFlag: "🇺🇸", city: "Notre Dame, IN",
    tagline: "A prestigious Catholic research university — known for law, business, and school spirit.",
    internationalNote: "Notre Dame has a strong residential community and Catholic heritage. Located near South Bend, Indiana. Financial aid is available for international students. About 7% of students are international.",
    websiteUrl: "https://www.nd.edu",
  },
  "Washington University in St. Louis": {
    country: "US", countryFlag: "🇺🇸", city: "St. Louis, MO",
    tagline: "A top research university in the Midwest — strong in medicine, law, and social work.",
    internationalNote: "WashU meets 100% of demonstrated financial need for all admitted students. Located in St. Louis, Missouri. Known for its beautiful Collegiate Gothic campus. International students make up ~13% of undergraduates.",
    websiteUrl: "https://www.wustl.edu",
  },
  "Emory University": {
    country: "US", countryFlag: "🇺🇸", city: "Atlanta, GA",
    tagline: "A top research university in Atlanta — renowned for global health and medicine.",
    internationalNote: "Emory is located in Atlanta, Georgia, a major international hub. Tied to the Centers for Disease Control (CDC). Meets 100% of demonstrated financial need for all admitted students.",
    websiteUrl: "https://www.emory.edu",
  },
  "UCLA": {
    country: "US", countryFlag: "🇺🇸", city: "Los Angeles, CA",
    tagline: "California's premier public university in the heart of LA — excellent and diverse.",
    internationalNote: "UCLA is one of the most applied-to universities in the world. As a public university, international student fees are higher (~$44k/year tuition). Located in Westwood, Los Angeles. Strong in film, medicine, and engineering.",
    websiteUrl: "https://www.ucla.edu",
  },
  "University of Southern California": {
    country: "US", countryFlag: "🇺🇸", city: "Los Angeles, CA",
    tagline: "A leading private research university in Los Angeles — film, business, and engineering.",
    internationalNote: "USC has the largest international student population of any US university (~25% of students). Located in downtown Los Angeles. Known for its film school (USC Cinematic Arts) and strong alumni network.",
    websiteUrl: "https://www.usc.edu",
  },
  "Georgia Tech": {
    country: "US", countryFlag: "🇺🇸", city: "Atlanta, GA",
    tagline: "One of America's top public engineering and technology universities.",
    internationalNote: "Georgia Tech is a public university in Atlanta, with highly competitive STEM programmes. International tuition is ~$32k/year. Over 20% of students are international. Strong co-op placement programme.",
    websiteUrl: "https://www.gatech.edu",
  },
  "University of Virginia": {
    country: "US", countryFlag: "🇺🇸", city: "Charlottesville, VA",
    tagline: "Thomas Jefferson's university — a top public school with a strong honour tradition.",
    internationalNote: "UVA is a public university charging higher fees for out-of-state and international students (~$56k/year). Located in Charlottesville, Virginia. Strong in business (Darden), law, and liberal arts.",
    websiteUrl: "https://www.virginia.edu",
  },
  "University of Illinois Urbana-Champaign": {
    country: "US", countryFlag: "🇺🇸", city: "Champaign, IL",
    tagline: "A Big Ten powerhouse — globally ranked in engineering and computer science.",
    internationalNote: "UIUC has one of the largest international student communities in the US (~20%). Located in a college town in central Illinois. International tuition is ~$34k/year. Particularly strong in CS and engineering.",
    websiteUrl: "https://illinois.edu",
  },
  "Purdue University": {
    country: "US", countryFlag: "🇺🇸", city: "West Lafayette, IN",
    tagline: "A top public engineering and agriculture university — affordable and highly employable.",
    internationalNote: "Purdue is known for excellent value in engineering. Located in West Lafayette, Indiana. International tuition is ~$28k/year. Home to one of the largest international student populations in the US.",
    websiteUrl: "https://www.purdue.edu",
  },
  "UNC Chapel Hill": {
    country: "US", countryFlag: "🇺🇸", city: "Chapel Hill, NC",
    tagline: "The oldest public university in the US — strong in journalism, medicine, and public health.",
    internationalNote: "UNC is a flagship public university in North Carolina's Research Triangle. International students pay out-of-state fees (~$36k/year). Eshelman School of Pharmacy and Gillings School of Public Health are world-renowned.",
    websiteUrl: "https://www.unc.edu",
  },

  /* ── Netherlands ─────────────────────────────────────────────── */

  "TU Delft": {
    country: "NL", countryFlag: "🇳🇱", city: "Delft",
    tagline: "Europe's top technical university — architecture, engineering, and design.",
    internationalNote: "TU Delft is one of the best engineering universities in Europe. Located in Delft, near Rotterdam and The Hague. Many programmes are taught in English. EU/EEA students pay ~€2,500/year; non-EU ~€12–18k/year.",
    websiteUrl: "https://www.tudelft.nl",
  },
  "University of Amsterdam": {
    country: "NL", countryFlag: "🇳🇱", city: "Amsterdam",
    tagline: "A world-class research university in the heart of Amsterdam.",
    internationalNote: "UvA offers hundreds of English-taught programmes. Located in Amsterdam, one of Europe's most international cities. Non-EU tuition is ~€10–15k/year. The city has a vibrant student life and excellent public transport.",
    websiteUrl: "https://www.uva.nl",
  },
  "Erasmus University Rotterdam": {
    country: "NL", countryFlag: "🇳🇱", city: "Rotterdam",
    tagline: "Europe's leading business and economics university.",
    internationalNote: "Erasmus is particularly strong in economics, business (Rotterdam School of Management), and law. Located in Rotterdam, Europe's largest port city. Non-EU tuition is ~€10–14k/year.",
    websiteUrl: "https://www.eur.nl",
  },
  "Leiden University": {
    country: "NL", countryFlag: "🇳🇱", city: "Leiden",
    tagline: "The Netherlands' oldest university — strong in law, humanities, and medicine.",
    internationalNote: "Leiden is one of Europe's oldest universities (founded 1575) and has a strong international reputation in law, social sciences, and humanities. Located between Amsterdam and The Hague. Non-EU tuition ~€10–15k/year.",
    websiteUrl: "https://www.universiteitleiden.nl",
  },
  "Utrecht University": {
    country: "NL", countryFlag: "🇳🇱", city: "Utrecht",
    tagline: "The Netherlands' largest university — consistently ranked among Europe's best.",
    internationalNote: "Utrecht regularly tops Dutch university rankings. Located in Utrecht, centrally located between Amsterdam and Eindhoven. Strong in life sciences, social sciences, and humanities. Non-EU tuition ~€10–15k/year.",
    websiteUrl: "https://www.uu.nl",
  },
  "Maastricht University": {
    country: "NL", countryFlag: "🇳🇱", city: "Maastricht",
    tagline: "A uniquely international Dutch university using problem-based learning.",
    internationalNote: "Maastricht uses Problem-Based Learning (PBL) in small groups — a distinctive approach. Located in the southernmost tip of the Netherlands, near Belgium and Germany. ~55% of students are international. Non-EU tuition ~€9–14k/year.",
    websiteUrl: "https://www.maastrichtuniversity.nl",
  },
  "Eindhoven University of Technology (TU/e)": {
    country: "NL", countryFlag: "🇳🇱", city: "Eindhoven",
    tagline: "The high-tech heart of Europe — ASML, DAF, and Philips are on the doorstep.",
    internationalNote: "TU/e is deeply embedded in the Brainport Eindhoven tech ecosystem, home to companies like ASML and Philips. All bachelor's programmes taught in Dutch; most Master's in English. Non-EU tuition ~€10–14k/year.",
    websiteUrl: "https://www.tue.nl",
  },

  /* ── Singapore ───────────────────────────────────────────────── */

  "National University of Singapore": {
    country: "SG", countryFlag: "🇸🇬", city: "Singapore",
    tagline: "Asia's leading university — consistently ranked among the world's top 10.",
    internationalNote: "NUS offers tuition fee grants (TFG) to international students who commit to working in Singapore for 3 years after graduation, reducing fees significantly (~S$8–9k/year). Without the bond, fees are ~S$29–37k/year.",
    websiteUrl: "https://www.nus.edu.sg",
  },
  "Nanyang Technological University": {
    country: "SG", countryFlag: "🇸🇬", city: "Singapore",
    tagline: "Singapore's second great university — world-class in engineering and business.",
    internationalNote: "NTU offers the same tuition fee grant scheme as NUS (3-year work bond reduces fees). Strong in engineering, business (Nanyang Business School), and sciences. Beautiful eco-friendly campus in western Singapore.",
    websiteUrl: "https://www.ntu.edu.sg",
  },
  "Singapore Management University": {
    country: "SG", countryFlag: "🇸🇬", city: "Singapore",
    tagline: "Singapore's city-campus business university — top-ranked in Asia for accountancy and law.",
    internationalNote: "SMU is located in the heart of Singapore's business district. It uses a US-style curriculum with class participation. International student fees are ~S$30k/year, with tuition fee grants available.",
    websiteUrl: "https://www.smu.edu.sg",
  },
  "Singapore University of Technology & Design": {
    country: "SG", countryFlag: "🇸🇬", city: "Singapore",
    tagline: "Singapore's youngest university — pioneering design-centric engineering education.",
    internationalNote: "SUTD was established with MIT and Zhejiang University as academic partners. Small intake (~1,000/year), design and technology focused. International fees are ~S$20–25k/year; tuition fee grants available.",
    websiteUrl: "https://www.sutd.edu.sg",
  },

  /* ── Hong Kong ───────────────────────────────────────────────── */

  "University of Hong Kong": {
    country: "HK", countryFlag: "🇭🇰", city: "Hong Kong",
    tagline: "Hong Kong's oldest and most prestigious university — internationally renowned.",
    internationalNote: "HKU is consistently ranked among Asia's top 3 universities. Instruction is in English. International tuition is ~HK$145k/year (~US$18.5k). Located on Hong Kong Island. Strong in medicine, law, and business.",
    websiteUrl: "https://www.hku.hk",
  },
  "Chinese University of Hong Kong": {
    country: "HK", countryFlag: "🇭🇰", city: "Hong Kong",
    tagline: "A bilingual university in the New Territories — strong in business and sciences.",
    internationalNote: "CUHK is the only bilingual (English and Chinese) university in Hong Kong. Located in the New Territories with a scenic campus. International tuition ~HK$145k/year. Strong in business (CUHK Business School) and medicine.",
    websiteUrl: "https://www.cuhk.edu.hk",
  },
  "HKUST": {
    country: "HK", countryFlag: "🇭🇰", city: "Hong Kong",
    tagline: "Hong Kong's tech-focused university — Asia's top business and engineering school.",
    internationalNote: "HKUST is particularly strong in business (Kellogg-HKUST EMBA is #1 globally) and engineering. Located in Clearwater Bay, Sai Kung. Instruction is entirely in English. International tuition ~HK$145k/year.",
    websiteUrl: "https://www.ust.hk",
  },
  "Hong Kong Polytechnic University": {
    country: "HK", countryFlag: "🇭🇰", city: "Hong Kong",
    tagline: "Hong Kong's applied sciences and professional education university.",
    internationalNote: "PolyU specialises in professionally oriented programmes in engineering, design, hospitality, and health sciences. Located in Kowloon. Instruction is in English. International tuition ~HK$120k/year.",
    websiteUrl: "https://www.polyu.edu.hk",
  },
  "City University of Hong Kong": {
    country: "HK", countryFlag: "🇭🇰", city: "Hong Kong",
    tagline: "A dynamic urban university — strong in law, business, and computing.",
    internationalNote: "CityU is located in Kowloon Tong, centrally in Hong Kong. It has a diverse international student body and strong industry connections. Instruction is in English. International tuition ~HK$120k/year.",
    websiteUrl: "https://www.cityu.edu.hk",
  },

  /* ── Canada ──────────────────────────────────────────────────── */

  "University of Toronto": {
    country: "CA", countryFlag: "🇨🇦", city: "Toronto, ON",
    tagline: "Canada's leading research university — consistently ranked in the global top 25.",
    internationalNote: "U of T is located in Canada's largest city. International tuition varies widely by programme — typically C$45–65k/year for competitive programmes (Engineering, CS). Strong research output and large international student body.",
    websiteUrl: "https://www.utoronto.ca",
  },
  "McGill University": {
    country: "CA", countryFlag: "🇨🇦", city: "Montréal, QC",
    tagline: "Canada's 'Harvard' — a bilingual, globally ranked research powerhouse.",
    internationalNote: "McGill is in Montréal, a bilingual English-French city with a lower cost of living than Toronto or Vancouver. International tuition is ~C$25–52k/year. Medicine and law are highly competitive. MCAT required for medicine.",
    websiteUrl: "https://www.mcgill.ca",
  },
  "University of British Columbia": {
    country: "CA", countryFlag: "🇨🇦", city: "Vancouver, BC",
    tagline: "Canada's west coast research powerhouse — beautiful campus, global reputation.",
    internationalNote: "UBC is located in Vancouver, consistently ranked among the world's most liveable cities. International tuition is ~C$42–55k/year. Strong in forestry, medicine, and engineering. Two campuses: Vancouver and Kelowna.",
    websiteUrl: "https://www.ubc.ca",
  },
  "University of Waterloo": {
    country: "CA", countryFlag: "🇨🇦", city: "Waterloo, ON",
    tagline: "Canada's tech university — the world's largest co-op programme.",
    internationalNote: "Waterloo's co-op programme alternates study and paid work terms, producing some of Canada's most employable graduates. Located in Waterloo, Ontario, in the 'Silicon Valley North' tech corridor. International tuition ~C$40–55k/year.",
    websiteUrl: "https://uwaterloo.ca",
  },
  "McMaster University": {
    country: "CA", countryFlag: "🇨🇦", city: "Hamilton, ON",
    tagline: "Pioneered problem-based learning in medicine — strong in health sciences.",
    internationalNote: "McMaster invented PBL medical education and is known globally for health sciences research. Located in Hamilton, Ontario, 45 minutes from Toronto. International tuition ~C$30–42k/year.",
    websiteUrl: "https://www.mcmaster.ca",
  },
  "Western University": {
    country: "CA", countryFlag: "🇨🇦", city: "London, ON",
    tagline: "One of Canada's top comprehensive universities — strong in business and health.",
    internationalNote: "Western is located in London, Ontario (not London, UK). The Ivey Business School is one of Canada's best. International tuition ~C$32–42k/year. Known for strong campus life and school spirit.",
    websiteUrl: "https://www.uwo.ca",
  },
  "Queen's University": {
    country: "CA", countryFlag: "🇨🇦", city: "Kingston, ON",
    tagline: "A prestigious Canadian university with a strong community and alumni network.",
    internationalNote: "Queen's is in Kingston, Ontario, on Lake Ontario. The Smith School of Business is one of Canada's most respected. International tuition ~C$42–52k/year. Known for its strong school spirit and close-knit community.",
    websiteUrl: "https://www.queensu.ca",
  },
  "University of Alberta": {
    country: "CA", countryFlag: "🇨🇦", city: "Edmonton, AB",
    tagline: "A leading Canadian university — world-class in energy, engineering, and medicine.",
    internationalNote: "Alberta is Canada's oil province, making the university strong in engineering and earth sciences. Located in Edmonton. International tuition ~C$27–45k/year. Lower cost of living than Toronto or Vancouver.",
    websiteUrl: "https://www.ualberta.ca",
  },
  "Simon Fraser University": {
    country: "CA", countryFlag: "🇨🇦", city: "Burnaby, BC",
    tagline: "Vancouver's second major university — strong in computing, business, and science.",
    internationalNote: "SFU is located in the Greater Vancouver area (Burnaby and Surrey campuses). It uses a trimester system. International tuition ~C$28–35k/year. Strong in computing science and business.",
    websiteUrl: "https://www.sfu.ca",
  },
  "University of Calgary": {
    country: "CA", countryFlag: "🇨🇦", city: "Calgary, AB",
    tagline: "Alberta's entrepreneurial university — strong in energy, health, and business.",
    internationalNote: "UCalgary is in Calgary, Alberta's business hub. Strong ties to the oil & gas sector and a growing tech scene. International tuition ~C$20–35k/year. Gateway to the Canadian Rockies.",
    websiteUrl: "https://www.ucalgary.ca",
  },
  "University of Ottawa": {
    country: "CA", countryFlag: "🇨🇦", city: "Ottawa, ON",
    tagline: "Canada's bilingual university in the nation's capital.",
    internationalNote: "UOttawa is one of the world's largest bilingual (English/French) universities. Located in Ottawa, Canada's capital, next to Parliament Hill. International tuition ~C$27–38k/year. Strong in law, social sciences, and health.",
    websiteUrl: "https://www.uottawa.ca",
  },
  "Dalhousie University": {
    country: "CA", countryFlag: "🇨🇦", city: "Halifax, NS",
    tagline: "Atlantic Canada's research leader — strong in medicine, law, and ocean sciences.",
    internationalNote: "Dalhousie is located in Halifax, Nova Scotia — a coastal city known for quality of life and lower costs. MCAT required for medicine. International tuition ~C$22–32k/year. Strong in health sciences and oceanography.",
    websiteUrl: "https://www.dal.ca",
  },
  "Concordia University": {
    country: "CA", countryFlag: "🇨🇦", city: "Montréal, QC",
    tagline: "Montréal's creative and applied arts university — accessible and urban.",
    internationalNote: "Concordia is located in Montréal and known for its arts, film, and business programmes. Living costs in Montréal are among the lowest of any major Canadian city. International tuition ~C$20–30k/year.",
    websiteUrl: "https://www.concordia.ca",
  },
  "York University": {
    country: "CA", countryFlag: "🇨🇦", city: "Toronto, ON",
    tagline: "Toronto's second university — strong in business, law, and the arts.",
    internationalNote: "York is Canada's third-largest university, located in northern Toronto. Osgoode Hall Law School is one of Canada's top law schools. International tuition ~C$28–35k/year. Very diverse student body.",
    websiteUrl: "https://www.yorku.ca",
  },
  "University of Victoria": {
    country: "CA", countryFlag: "🇨🇦", city: "Victoria, BC",
    tagline: "A research-intensive university on Canada's west coast — co-op focused.",
    internationalNote: "UVic is located in Victoria, British Columbia — Canada's mildest climate and a beautiful coastal city. Strong co-op programme with strong links to the tech sector. International tuition ~C$22–30k/year.",
    websiteUrl: "https://www.uvic.ca",
  },
};

// Node export for tooling (scripts/check-links.mjs sweeps websiteUrl).
// Inert in the browser — same guarded pattern as courseRequirements.js.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { universityProfiles: universityProfiles };
}
