/* ═══════════════════════════════════════════════════════════════
 * Altiora — data/interviews.js   GENERATED — DO NOT EDIT BY HAND.
 * Built by scripts/build-interview-data.mjs from
 * research/interviews-proposed.json. Display only: nothing here affects a
 * verdict. Every value carries its official source, the date it was read
 * and a verbatim sourceSnippet. Checked by npm run validate.
 * ═══════════════════════════════════════════════════════════════ */
(function (/** @type {any} */ root) {
  const interviewData = {
    "source": "research/interviews-proposed.json + research/interviews-expansion-proposed.json",
    "excludedSources": [
      {
        "url": "https://www.ox.ac.uk/admissions/undergraduate/applying/guide-for-applicants/interviews/sample_questions",
        "why": "Research manual-review list: Oxford central \"Sample interview questions\" page — Cloudflare challenge (403). The PPE and Maths pages point here for sample questions."
      },
      {
        "url": "https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford/guide/interviews",
        "why": "Research manual-review list: Oxford central interviews guide — Cloudflare challenge (403)."
      },
      {
        "url": "https://www.medsci.ox.ac.uk/study/medicine/pre-clinical/interviews",
        "why": "Research manual-review list: Oxford Medicine interviews — 403."
      },
      {
        "url": "https://www.medsci.ox.ac.uk/study/medicine/pre-clinical/application-process",
        "why": "Research manual-review list: Oxford Medicine application process — 403."
      },
      {
        "url": "https://www.sbs.ox.ac.uk/programmes/undergraduate/economics-and-management",
        "why": "Research manual-review list: Oxford Economics and Management — 403; economics.ox.ac.uk admissions URLs 404."
      },
      {
        "url": "https://www.law.ox.ac.uk/admissions/undergraduate",
        "why": "Research manual-review list: Oxford Law undergraduate admissions landing page — 403 (the Law FAQ page loaded and is used)."
      },
      {
        "url": "https://eng.ox.ac.uk/media/4095/typical_engineering_interview_questions-accessible.pdf",
        "why": "Research manual-review list: Oxford Engineering typical-question PDF is undated and describes in-person interviews; confirm it is current."
      },
      {
        "url": "https://www.physics.ox.ac.uk/study/undergraduates",
        "why": "Research manual-review list: Oxford Physics: no current interview page found (404); only the 2021 teacher pack."
      },
      {
        "url": "https://www.imperial.ac.uk/study/apply/undergraduate/process/interviews/",
        "why": "Research manual-review list: Imperial — every imperial.ac.uk URL returned 403 (CloudFront). All 8 Imperial courses unresearched."
      },
      {
        "url": "https://www.ucl.ac.uk/medical-sciences/divisions/medical-school/study/undergraduate/mbbs-admissions/selection-interviews/interviews",
        "why": "Research manual-review list: UCL Medicine MMI page — 403. UCL Architecture, Pharmacy and Laws pages also 403."
      },
      {
        "url": "https://www.admissions.eng.cam.ac.uk/faqs",
        "why": "Research manual-review list: Cambridge Engineering admissions FAQ — 403."
      },
      {
        "url": "https://medicine-vet-medicine.ed.ac.uk/edinburgh-medical-school/medicine/applying/how-to-apply/selection/interviews",
        "why": "Research manual-review list: Edinburgh Medicine selection/MMI detail — page not found (404); locate the current URL by hand."
      },
      {
        "url": "https://www.physics.ox.ac.uk/system/files/file_attachments/mock%20interview%20pack%20211122_0.pdf",
        "why": "Oxford Physics \"Mock Interview Pack for Teachers\" (2021) — headed \"STUDENTS: THIS IS NOT FOR YOU\"."
      },
      {
        "url": "https://admissions.hku.hk/apply/jupas/interview",
        "why": "Expansion manual-review list: University of Hong Kong: connection reset (curl 35: Recv failure: Connection reset by peer)"
      },
      {
        "url": "https://admissions.hku.hk/apply/international-qualifications/interview",
        "why": "Expansion manual-review list: University of Hong Kong: connection reset (curl 35)"
      },
      {
        "url": "https://admissions.hku.hk/admissions/international/sites/default/files/A_guide_for_students.pdf",
        "why": "Expansion manual-review list: University of Hong Kong: connection reset (curl 35)"
      },
      {
        "url": "https://admissions.hku.hk/sites/default/files/2026-10/Digital_AdmBrochure_2728.pdf",
        "why": "Expansion manual-review list: University of Hong Kong: connection reset (curl 35)"
      },
      {
        "url": "https://med.hku.hk/ugadmissions2020/mbbsfaq.html",
        "why": "Expansion manual-review list: University of Hong Kong: redirected to www.med.hku.hk, then connection reset (curl 35)"
      },
      {
        "url": "https://hkumed-ugadmissions.hku.hk/admissions-non-jupas-scheme/?lang=en",
        "why": "Expansion manual-review list: University of Hong Kong: connection reset (curl 35)"
      },
      {
        "url": "https://ug.hkubs.hku.hk/admission/faq/non-jupas-applicants",
        "why": "Expansion manual-review list: University of Hong Kong: connection reset (curl 35)"
      },
      {
        "url": "https://datasce.cs.hku.hk/index.php/admissions/faq/",
        "why": "Expansion manual-review list: University of Hong Kong: connection reset (curl 35)"
      },
      {
        "url": "https://cs.hku.hk/programmes/beng-compsc/admission",
        "why": "Expansion manual-review list: University of Hong Kong: connection reset (curl 35)"
      },
      {
        "url": "https://www.socsc.hku.hk/bpsych/prospective-student/",
        "why": "Expansion manual-review list: University of Hong Kong: HTTP 500"
      },
      {
        "url": "https://join.ust.hk/admissions/jupas",
        "why": "Expansion manual-review list: HKUST: TLS error: certificate has expired (curl 60); same content later read at join.hkust.edu.hk"
      },
      {
        "url": "https://bmundergrad.hkust.edu.hk/admissions/faqs/international-qualifications",
        "why": "Expansion manual-review list: HKUST: TLS/certificate error (curl 60)"
      },
      {
        "url": "https://cityu.edu.hk/admo/interview-arrangements-local-jupas-applicants",
        "why": "Expansion manual-review list: City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)"
      },
      {
        "url": "https://www.cityu.edu.hk/admo/faq",
        "why": "Expansion manual-review list: City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)"
      },
      {
        "url": "https://cityu.edu.hk/admo/apply-now/non-local-applicants",
        "why": "Expansion manual-review list: City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)"
      },
      {
        "url": "https://www.cityu.edu.hk/slw/prospective-students/undergraduate-programme/bachelor-of-laws-llb",
        "why": "Expansion manual-review list: City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)"
      },
      {
        "url": "https://www.cityu.edu.hk/admo/programmes/bachelor-laws",
        "why": "Expansion manual-review list: City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)"
      },
      {
        "url": "https://www.artsci.utoronto.ca/future/ready-apply/faqs",
        "why": "Expansion manual-review list: University of Toronto: bot check page ('Verifying you are human...') instead of content"
      },
      {
        "url": "https://www.sauder.ubc.ca/bachelor-commerce/bcom-video-interview",
        "why": "Expansion manual-review list: University of British Columbia: 403"
      },
      {
        "url": "https://www.sauder.ubc.ca/programs/bachelors-degrees/bachelor-commerce/admissions-finance/direct-entry",
        "why": "Expansion manual-review list: University of British Columbia: 403"
      },
      {
        "url": "https://coursecatalogue.mcgill.ca/en/undergraduate/medicine-health-sciences/professional/admission-procedures-requirements/interview-process/",
        "why": "Expansion manual-review list: McGill University: HTTP 202 with no page content (challenge/empty shell)"
      },
      {
        "url": "https://coursecatalogue.mcgill.ca/en/undergraduate/medicine-health-sciences/professional/admission-procedures-requirements/applicant-categories/",
        "why": "Expansion manual-review list: McGill University: HTTP 202 with no page content (challenge/empty shell)"
      },
      {
        "url": "https://www.mcgill.ca/law/files/law/09-25-2025_mcgill_bcl-jd_admissions.pdf",
        "why": "Expansion manual-review list: McGill University: connection error: HTTP/2 stream not closed cleanly (INTERNAL_ERROR)"
      },
      {
        "url": "https://uwaterloo.ca/engineering/undergraduate-students/application-process/admission-information-form",
        "why": "Expansion manual-review list: University of Waterloo: 403"
      },
      {
        "url": "https://www.ualberta.ca/en/admissions/undergraduate/admission/admission-requirements/index.html",
        "why": "Expansion manual-review list: University of Alberta: 403 from CloudFront (Request blocked)"
      },
      {
        "url": "https://www.ualberta.ca/en/undergraduate-programs/bachelor-of-commerce.html",
        "why": "Expansion manual-review list: University of Alberta: 403 from CloudFront (Request blocked)"
      },
      {
        "url": "https://www.ualberta.ca/en/undergraduate-programs/engineering.html",
        "why": "Expansion manual-review list: University of Alberta: 403 from CloudFront (Request blocked)"
      },
      {
        "url": "https://www.ualberta.ca/en/undergraduate-programs/computing-science-bsc.html",
        "why": "Expansion manual-review list: University of Alberta: 403 from CloudFront (Request blocked)"
      },
      {
        "url": "https://www.ualberta.ca/en/engineering/programs/undergraduate/index.html",
        "why": "Expansion manual-review list: University of Alberta: 403 from CloudFront (Request blocked)"
      },
      {
        "url": "https://calendar.ualberta.ca/content.php?catoid=69&navoid=20815",
        "why": "Expansion manual-review list: University of Alberta: HTTP 202 with no page content (challenge/empty shell)"
      },
      {
        "url": "https://calendar.ualberta.ca/content.php?catoid=69&navoid=21497",
        "why": "Expansion manual-review list: University of Alberta: HTTP 202 with no page content (challenge/empty shell)"
      },
      {
        "url": "https://catalogue.uottawa.ca/en/undergrad/major-computer-science/",
        "why": "Expansion manual-review list: University of Ottawa: HTTP 202 with no page content (challenge/empty shell)"
      },
      {
        "url": "https://www.nus.edu.sg/oam/admissions",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://www.nus.edu.sg/oam/admissions/aptitude-based-admissions",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://www.nus.edu.sg/oam/admissions/first-choice-bonus-points",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://medicine.nus.edu.sg/prospective-students/focused-skills-assessment/",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://medicine.nus.edu.sg/prospective-students/nus-medicine-admissions-assessment/",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://medicine.nus.edu.sg/prospective-students/admissions-frequently-asked-questions/",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://medicine.nus.edu.sg/wp-content/uploads/2025/03/NUS-SJT-2025-Applicant-Information-2025.pdf",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://bba.nus.edu.sg/admissions-scholarships/entry-requirements/",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://nus.edu.sg/oam/docs/default-source/nus-publications/intlprospectus.pdf",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://nus.edu.sg/oam/admissions/faculty-interview-and-test-dates",
        "why": "Expansion manual-review list: National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://www.askadmissions.nus.edu.sg/app/answers/detail/a_id/546",
        "why": "Expansion manual-review list: National University of Singapore: connection failed (curl: CONNECT tunnel failed, response 502)"
      },
      {
        "url": "https://www.ntu.edu.sg/docs/default-source/nanyang-business-school-(nbs)/ug-detail/admission-requirement---a-levele6f64d0a-5e70-4829-9a8a-39b0653a582c.pdf?Status=Master&sfvrsn=e1ef46f6_3",
        "why": "Expansion manual-review list: Nanyang Technological University (ntu-business-alevel): NBS undergraduate A-level entry-requirements PDF; it shows indicative grade profiles (2019 – 2020) for both Business and Computer Science, so it may belong to a Business/Computing double-degree page and may be dated. Needs a human check before attaching to the single-major Business course."
      },
      {
        "url": "https://admissions.smu.edu.sg/faq/all",
        "why": "Expansion manual-review list: Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://admissions.smu.edu.sg/admissions-requirements/important-dates",
        "why": "Expansion manual-review list: Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://admissions.smu.edu.sg/admissions-requirements/international-and-other-qualifications",
        "why": "Expansion manual-review list: Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://admissions.smu.edu.sg/sites/admissions.smu.edu.sg/files/Law/SMU%20Law%20Writing%20Test%20Information%20for%20Applicants_2026.pdf",
        "why": "Expansion manual-review list: Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://admissions.smu.edu.sg/faqs/admissions-and-applications",
        "why": "Expansion manual-review list: Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://law.smu.edu.sg/",
        "why": "Expansion manual-review list: Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://scis.smu.edu.sg/",
        "why": "Expansion manual-review list: Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://economics.smu.edu.sg/",
        "why": "Expansion manual-review list: Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content"
      },
      {
        "url": "https://admtalk.sutd.edu.sg/admissions-scholarships/",
        "why": "Expansion manual-review list: Singapore University of Technology & Design: connection failed (curl: CONNECT tunnel failed, response 502)"
      },
      {
        "url": "https://www.ucl.ac.uk/study/prospective-students/undergraduate/how-apply/how-we-assess-your-application",
        "why": "Expansion manual-review list: University College London: HTTP 403 on plain request"
      },
      {
        "url": "https://www.ucl.ac.uk/study/prospective-students/school-teachers-and-counsellors/tests-tasks-and-interviews",
        "why": "Expansion manual-review list: University College London: HTTP 403 on plain request"
      },
      {
        "url": "https://www.durham.ac.uk/media/durham-university/study/admissions-policies/Admissions-Policy-2026-27.pdf",
        "why": "Expansion manual-review list: Durham University: 403 from CloudFront (\"Request blocked.\")"
      },
      {
        "url": "https://www.durham.ac.uk/study/undergraduate/",
        "why": "Expansion manual-review list: Durham University: 403 from CloudFront (\"Request blocked.\")"
      },
      {
        "url": "https://www.durham.ac.uk/study/undergraduate/how-to-apply/what-happens-to-your-application/interviews-and-selection-days/",
        "why": "Expansion manual-review list: Durham University: 403 from CloudFront (\"Request blocked.\")"
      },
      {
        "url": "https://www.durham.ac.uk/study/undergraduate/how-to-apply/entry-requirements/",
        "why": "Expansion manual-review list: Durham University: 403 from CloudFront (\"Request blocked.\")"
      },
      {
        "url": "https://undergrad.admissions.columbia.edu/apply/firstyear",
        "why": "Expansion manual-review list: Columbia University: HTTP 403"
      },
      {
        "url": "https://undergrad.admissions.columbia.edu/apply/first-year",
        "why": "Expansion manual-review list: Columbia University: HTTP 403"
      },
      {
        "url": "https://undergrad.admissions.columbia.edu/faq",
        "why": "Expansion manual-review list: Columbia University: HTTP 403"
      },
      {
        "url": "https://undergrad.admissions.columbia.edu/apply/process",
        "why": "Expansion manual-review list: Columbia University: HTTP 403"
      },
      {
        "url": "https://undergrad.admissions.columbia.edu/apply/first-year/interviews",
        "why": "Expansion manual-review list: Columbia University: HTTP 403"
      },
      {
        "url": "https://www.college.columbia.edu/news/announcement-alumni-admissions-interviews",
        "why": "Expansion manual-review list: Columbia University: HTTP 403"
      },
      {
        "url": "https://www.college.columbia.edu/alumni/volunteer/alumni-interviewing",
        "why": "Expansion manual-review list: Columbia University: HTTP 403"
      },
      {
        "url": "https://www.cc-seas.columbia.edu/faq",
        "why": "Expansion manual-review list: Columbia University: HTTP 403"
      },
      {
        "url": "https://www.alumni.upenn.edu/interviews",
        "why": "Expansion manual-review list: University of Pennsylvania: HTTP 403 (Penn Alumni site; page on alumni interviews/admissions FAQs for alumni)"
      },
      {
        "url": "https://www.alumni.upenn.edu/s/1587/gid2/16/interior.aspx?sid=1587&gid=2&pgid=20995",
        "why": "Expansion manual-review list: University of Pennsylvania: HTTP 403 (Penn Alumni site; page on alumni interviews/admissions FAQs for alumni)"
      },
      {
        "url": "https://admissions.umich.edu/apply/first-year-applicants/selection-process",
        "why": "Expansion manual-review list: University of Michigan: HTTP 403"
      },
      {
        "url": "https://admissions.umich.edu/virtual-qa-questions",
        "why": "Expansion manual-review list: University of Michigan: HTTP 403"
      },
      {
        "url": "https://admissions.umich.edu/apply/first-year-applicants/selection-process/denied-applicants-faq",
        "why": "Expansion manual-review list: University of Michigan: HTTP 403"
      },
      {
        "url": "https://lsa.umich.edu/lsa/alumni-friends/get-connected/college-connections/request-an-interview.html",
        "why": "Expansion manual-review list: University of Michigan: HTTP 403"
      },
      {
        "url": "https://michiganross.umich.edu/undergraduate/bba/admissions/faqs",
        "why": "Expansion manual-review list: University of Michigan: HTTP 403"
      },
      {
        "url": "https://michross.bus.umich.edu/undergraduate/bba/admissions/faqs",
        "why": "Expansion manual-review list: University of Michigan: connection reset (curl 35)"
      },
      {
        "url": "https://www.engin.umich.edu/admissions/undergraduate-admissions/admissions-faq/",
        "why": "Expansion manual-review list: University of Michigan: HTTP 403"
      },
      {
        "url": "https://www.engin.umich.edu/admissions-aid/undergraduate/apply/first-year/",
        "why": "Expansion manual-review list: University of Michigan: HTTP 403"
      },
      {
        "url": "https://teamdynamix.umich.edu/TDClient/154/Portal/KB/ArticleDet?ID=7510",
        "why": "Expansion manual-review list: University of Michigan: curl connection/TLS failure, no response"
      },
      {
        "url": "https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/standardized-tests/english-language-testing.html",
        "why": "Expansion manual-review list: New York University: HTTP 403"
      },
      {
        "url": "https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/wait-list-faq.html",
        "why": "Expansion manual-review list: New York University: HTTP 403"
      },
      {
        "url": "https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/all-freshmen-applicants.html",
        "why": "Expansion manual-review list: New York University: HTTP 403"
      },
      {
        "url": "https://bulletins.nyu.edu/undergraduate/business/admissions/",
        "why": "Expansion manual-review list: New York University: connection reset (curl 35)"
      },
      {
        "url": "https://bulletins.nyu.edu/undergraduate/arts-science/admissions/",
        "why": "Expansion manual-review list: New York University: connection reset (curl 35)"
      },
      {
        "url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/",
        "why": "Expansion manual-review list: New York University: connection reset (curl 35)"
      },
      {
        "url": "https://admissions.cornell.edu/community/blog/lets-talk-about-cornell-admissions-interviews",
        "why": "Expansion manual-review list: Cornell University: HTTP 403"
      },
      {
        "url": "https://caaan.admissions.cornell.edu/docs/FAQ.pdf",
        "why": "Expansion manual-review list: Cornell University: connection reset (curl 35)"
      },
      {
        "url": "https://meetezra.admissions.cornell.edu/index-simple.php?responseId=1623&type=2",
        "why": "Expansion manual-review list: Cornell University: connection reset (curl 35)"
      },
      {
        "url": "https://admissions.nd.edu/apply/application-overview/",
        "why": "Expansion manual-review list: University of Notre Dame: First fetch 200 (redirect to /apply/how-to-apply/), later re-fetch returned 403 Forbidden (bot trap)"
      },
      {
        "url": "https://admissions.nd.edu/visit-engage/stories-news/write-a-great-college-essay-tips-from-an-admissions-counselor/",
        "why": "Expansion manual-review list: University of Notre Dame: 403 Forbidden after redirect to /visit-and-connect/..."
      },
      {
        "url": "https://admission.virginia.edu/faq",
        "why": "Expansion manual-review list: University of Virginia: 403 Cloudflare 'Just a moment...' challenge page"
      },
      {
        "url": "https://admission.virginia.edu/",
        "why": "Expansion manual-review list: University of Virginia: 403 Cloudflare challenge page"
      },
      {
        "url": "https://admission.virginia.edu/apply",
        "why": "Expansion manual-review list: University of Virginia: 403 Cloudflare challenge page"
      },
      {
        "url": "https://faa.illinois.edu/applying-faa",
        "why": "Expansion manual-review list: University of Illinois Urbana-Champaign: curl TLS error (SSL certificate problem: unable to get local issuer certificate); not relevant to CS/ME but would cover FAA audition/portfolio/interview"
      },
      {
        "url": "https://www.admissions.illinois.edu/apply/first-year/requirements",
        "why": "Expansion manual-review list: University of Illinois Urbana-Champaign: 404 (guessed URL)"
      },
      {
        "url": "https://admissions.unc.edu/?p=5136",
        "why": "Expansion manual-review list: UNC Chapel Hill: 403 'Checking connection' bot-check page after redirect to /faqs/can-i-interview-with-the-admissions-committee/"
      },
      {
        "url": "https://admissions.unc.edu/?p=5205",
        "why": "Expansion manual-review list: UNC Chapel Hill: 403 'Checking connection' bot-check page after redirect to waiting-list interview FAQ"
      },
      {
        "url": "https://mycarolina.unc.edu/portal/virtualmeeting",
        "why": "Expansion manual-review list: UNC Chapel Hill: 503"
      },
      {
        "url": "https://ug.hkubs.hku.hk/admission/faq/jupas-applicants",
        "why": "Expansion, held for manual review: HKU Business School JUPAS FAQ — the quote could not be re-fetched (connection reset)."
      },
      {
        "url": "https://uwaterloo.ca/engineering/future-students/applying/online-engineering-interview",
        "why": "Expansion, held for manual review: University of Waterloo — official pages conflict on whether the Engineering interview is optional."
      },
      {
        "url": "https://uwaterloo.ca/aspiring-professionals/admission-requirements",
        "why": "Expansion, held for manual review: University of Waterloo — official pages conflict on whether the Engineering interview is optional."
      },
      {
        "url": "https://www.ntu.edu.sg/media/docs/default-source/undergraduate-admissions/msr/emsr_intnl.pdf",
        "why": "Expansion, held for manual review: NTU international qualifications PDF — the interview sentence sits in four table rows; which qualification each belongs to depends on the PDF text layout, so the route label cannot be backed by one quote."
      },
      {
        "url": "https://apply.emory.edu/apply/international",
        "why": "Expansion, held for manual review: Emory University — its FAQ says no evaluative interviews but also mentions an Alumni Interview program."
      },
      {
        "url": "https://apply.emory.edu/apply/faqs",
        "why": "Expansion, held for manual review: Emory University — its FAQ says no evaluative interviews but also mentions an Alumni Interview program."
      },
      {
        "url": "https://hhsp.healthsci.mcmaster.ca/faqs/",
        "why": "Expansion, held for manual review: McMaster Health Sciences — \"We will not … conduct interviews\" is about reconsidering a decision after no offer, not a plain statement that admission has no interview."
      },
      {
        "url": "https://m.nd.edu/notredame/admissions/_/faq__interviews",
        "why": "Expansion, held for manual review: University of Notre Dame — its \"no interview\" FAQ carries a 2017 footer."
      }
    ],
    "records": {
      "oxford-computer-science": {
        "id": "oxford-computer-science",
        "university": "University of Oxford",
        "subject": "Computer Science",
        "format": {
          "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interviews happen in December via video call. Then format of the interview can vary from college to college but candidates will generally have two interviews in their first choice college and at least one interview in another college. If you are applying for a joint degree, you might have single-subject interviews for each part of the degree, or there may be an interview with tutors from both disciplines"
        },
        "numberAndLength": {
          "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html",
          "accessed": "2026-11-14",
          "sourceSnippet": "The interview will be like a short tutorial, with you actively discussion a problem and your thought process out loud. Each interview lasts around 30 minutes, usually with two interviewers."
        },
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [
          {
            "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Our tutors are not mind readers, so if you don’t say anything our tutors can’t tell what you are thinking! The best practice you can do is getting used to talking about problems out loud. You may also want to try explaining concepts from your Maths qualification or the solutions to past MAT questions to friends and family. This not only gets you used to explaining your thoughts out loud, but also helps to consolidate your knowledge of the subject."
          },
          {
            "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "We very much don't want applicants to feel they need special training for our admissions. The main thing is that you do mathematics, lots of it, and that you find it interesting. We advise you to do lots of problems, on and near your syllabus, so that you really understand the mathematics you are learning."
          }
        ],
        "sampleQuestions": [
          {
            "id": "oxford-computer-science#1",
            "subject": "Computer Science",
            "publishedBy": "University of Oxford",
            "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Tidy boxes. You are given 10 boxes, each large enough to contain exactly 10 wooden building blocks, and a total of 100 blocks in 10 different colours. There may not be the same number in each colour, so you may not be able to pack the blocks into the boxes in such a way that each box contains only one colour of block. Show that it is possible to do it so that each box contains at most two different colours. A sample interview dialogue for this question is available.",
            "question": "Tidy boxes. You are given 10 boxes, each large enough to contain exactly 10 wooden building blocks, and a total of 100 blocks in 10 different colours. There may not be the same number in each colour, so you may not be able to pack the blocks into the boxes in such a way that each box contains only one colour of block. Show that it is possible to do it so that each box contains at most two different colours. A sample interview dialogue for this question is available."
          },
          {
            "id": "oxford-computer-science#2",
            "subject": "Computer Science",
            "publishedBy": "University of Oxford",
            "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Searching for the maximum. The real-valued function f(x), defined for 0 ≤ x ≤ 1, has a single maximum at x = m. If 0 ≤ u < v ≤ m then f(u) < f(v), and if m ≤ u < v ≤ 1 then f(u) > f(v). You are told nothing else about f, but you may ask for the value of f(x) for any values of x you choose. How would you find the approximate value of m? How accurately could you find m if you could choose only 10 values of x for which to evaluate f(x)?",
            "question": "Searching for the maximum. The real-valued function f(x), defined for 0 ≤ x ≤ 1, has a single maximum at x = m. If 0 ≤ u < v ≤ m then f(u) < f(v), and if m ≤ u < v ≤ 1 then f(u) > f(v). You are told nothing else about f, but you may ask for the value of f(x) for any values of x you choose. How would you find the approximate value of m? How accurately could you find m if you could choose only 10 values of x for which to evaluate f(x)?"
          },
          {
            "id": "oxford-computer-science#3",
            "subject": "Computer Science",
            "publishedBy": "University of Oxford",
            "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Death by chocolate. You are locked in a room with your worst enemy. On a table in the centre of the room is a bar of chocolate, divided into squares in the usual way. One square of the chocolate is painted with a bright green paint that contains a deadly poison. You and your enemy take it in turns to break off one or more squares from the remaining chocolate (along a straight line) and eat them. Whoever is left with the green square must eat it and die in agony. You may look at the bar of chocolate and then decide whether to go first or second. Describe your strategy.",
            "question": "Death by chocolate. You are locked in a room with your worst enemy. On a table in the centre of the room is a bar of chocolate, divided into squares in the usual way. One square of the chocolate is painted with a bright green paint that contains a deadly poison. You and your enemy take it in turns to break off one or more squares from the remaining chocolate (along a straight line) and eat them. Whoever is left with the green square must eat it and die in agony. You may look at the bar of chocolate and then decide whether to go first or second. Describe your strategy."
          },
          {
            "id": "oxford-computer-science#4",
            "subject": "Computer Science",
            "publishedBy": "University of Oxford",
            "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Monkey beans. An urn contains 23 white beans and 34 black beans. A monkey takes out two beans; if they are the same, he puts a black bean into the urn, and if they are different, he puts in a white bean from a large heap he has next to him. The monkey repeats this procedure until there is only one bean left. What colour is it?",
            "question": "Monkey beans. An urn contains 23 white beans and 34 black beans. A monkey takes out two beans; if they are the same, he puts a black bean into the urn, and if they are different, he puts in a white bean from a large heap he has next to him. The monkey repeats this procedure until there is only one bean left. What colour is it?"
          },
          {
            "id": "oxford-computer-science#5",
            "subject": "Computer Science",
            "publishedBy": "University of Oxford",
            "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Lily-pad lunacy. Eleven lily pads are numbered from 0 to 10. A frog starts on pad 0 and wants to get to pad 10. At each jump, the frog can move forward by one or two pads, so there are many ways it can get to pad 10. For example, it can make 10 jumps of one pad, 1111111111, or five jumps of two pads, 22222, or go 221212 or 221122, and so on. We'll call each of these ways different, even if the frog takes the same jumps in a different order. How many different ways are there of getting from 0 to 10?",
            "question": "Lily-pad lunacy. Eleven lily pads are numbered from 0 to 10. A frog starts on pad 0 and wants to get to pad 10. At each jump, the frog can move forward by one or two pads, so there are many ways it can get to pad 10. For example, it can make 10 jumps of one pad, 1111111111, or five jumps of two pads, 22222, or go 221212 or 221122, and so on. We'll call each of these ways different, even if the frog takes the same jumps in a different order. How many different ways are there of getting from 0 to 10?"
          },
          {
            "id": "oxford-computer-science#6",
            "subject": "Computer Science",
            "publishedBy": "University of Oxford",
            "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Missing numbers. Imagine you are given a list of slightly less than 1,000,000 numbers, all different, and each between 0 and 999,999 inclusive. How could you find (in a reasonable time) a number between 0 and 999,999 that is not on the list?",
            "question": "Missing numbers. Imagine you are given a list of slightly less than 1,000,000 numbers, all different, and each between 0 and 999,999 inclusive. How could you find (in a reasonable time) a number between 0 and 999,999 that is not on the list?"
          },
          {
            "id": "oxford-computer-science#7",
            "subject": "Computer Science",
            "publishedBy": "University of Oxford",
            "source": "https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Scribble. The game of Scribble is played with an inexhaustible supply of tiles, and consists of forming 'words' according to certain rules. Since each tile bears one of the letters P, Q, or R, these are not words that will be found in an ordinary dictionary. The game begins with the word PQ on the board; each move consists of applying one of the following rules: / If the word on the board is Px, for some shorter word x, you may change it to Pxx. For example, if the word is PQRRQ then you may change it to PQRRQQRRQ. / If the word on the board is xQQQy, for some shorter words x and y, then you may change it to xRy, replacing the sequence QQQ with a single R. / If the word on the board is xRRy, for some shorter words x and y, then you may change it to xy, deleting the sequence RR entirely. / (i) For each of the following words, say whether you can make it or not by following the rules of the game: QPR, PQQ, PQR, PR. (ii) Given any word, how can you decide whether it can be made or not?",
            "question": "Scribble. The game of Scribble is played with an inexhaustible supply of tiles, and consists of forming 'words' according to certain rules. Since each tile bears one of the letters P, Q, or R, these are not words that will be found in an ordinary dictionary. The game begins with the word PQ on the board; each move consists of applying one of the following rules: / If the word on the board is Px, for some shorter word x, you may change it to Pxx. For example, if the word is PQRRQ then you may change it to PQRRQQRRQ. / If the word on the board is xQQQy, for some shorter words x and y, then you may change it to xRy, replacing the sequence QQQ with a single R. / If the word on the board is xRRy, for some shorter words x and y, then you may change it to xy, deleting the sequence RR entirely. / (i) For each of the following words, say whether you can make it or not by following the rules of the game: QPR, PQQ, PQR, PR. (ii) Given any word, how can you decide whether it can be made or not?"
          },
          {
            "id": "oxford-computer-science#8",
            "subject": "Computer Science",
            "publishedBy": "an Oxford Computer Science tutor, linked from the department's admissions page",
            "source": "https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/06/29/interview-question1.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "For a non-negative real number \\(x\\), the floor of \\(x\\), denoted by \\( \\lfloor x \\rfloor\\) is the largest integer that is less than or equal to \\(x\\). For example, \\(\\lfloor 3 \\rfloor = 3 \\) and \\( \\lfloor 6.999 \\rfloor = 6 \\). / Let \\(n\\) be a positive natural number that is a perfect square. You are asked to pick a set of \\( \\lfloor \\frac{n}{2} \\rfloor \\) natural numbers from \\( 1,2, \\ldots,n - 1 \\), such that none of the chosen numbers is a perfect square, and no two distinct chosen elements add up to \\(n \\). For what values of \\(n\\) is this possible? Let \\(n\\) be a positive natural number that is a perfect cube. You are asked to pick a set of \\( \\lfloor \\frac{n}{2} \\rfloor \\) natural numbers from \\( 1,2, \\ldots,n -1 \\), such that none of the chosen numbers is a perfect cube, and no two distinct chosen elements add up to \\(n\\). For what values of \\(n\\) is this possible?",
            "question": "For a non-negative real number \\(x\\), the floor of \\(x\\), denoted by \\( \\lfloor x \\rfloor\\) is the largest integer that is less than or equal to \\(x\\). For example, \\(\\lfloor 3 \\rfloor = 3 \\) and \\( \\lfloor 6.999 \\rfloor = 6 \\). / Let \\(n\\) be a positive natural number that is a perfect square. You are asked to pick a set of \\( \\lfloor \\frac{n}{2} \\rfloor \\) natural numbers from \\( 1,2, \\ldots,n - 1 \\), such that none of the chosen numbers is a perfect square, and no two distinct chosen elements add up to \\(n \\). For what values of \\(n\\) is this possible? Let \\(n\\) be a positive natural number that is a perfect cube. You are asked to pick a set of \\( \\lfloor \\frac{n}{2} \\rfloor \\) natural numbers from \\( 1,2, \\ldots,n -1 \\), such that none of the chosen numbers is a perfect cube, and no two distinct chosen elements add up to \\(n\\). For what values of \\(n\\) is this possible?"
          },
          {
            "id": "oxford-computer-science#9",
            "subject": "Computer Science",
            "publishedBy": "an Oxford Computer Science tutor, linked from the department's admissions page",
            "source": "https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/06/29/interview-question2.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Find the smallest natural number ending in \\(6\\), such that if the last \\(6\\) is removed and placed in the front, the new number is \\(4\\) times the original number. Can you give a procedure to find the smallest number ending in digit \\(d\\), where \\(d\\) is between \\(1\\) and \\(9\\), such that if the last digit, \\(d\\), is removed and placed in front, you get a number that is \\(k\\) times as large? Is this possible for every value of \\(d\\) and \\(k\\)?",
            "question": "Find the smallest natural number ending in \\(6\\), such that if the last \\(6\\) is removed and placed in the front, the new number is \\(4\\) times the original number. Can you give a procedure to find the smallest number ending in digit \\(d\\), where \\(d\\) is between \\(1\\) and \\(9\\), such that if the last digit, \\(d\\), is removed and placed in front, you get a number that is \\(k\\) times as large? Is this possible for every value of \\(d\\) and \\(k\\)?"
          },
          {
            "id": "oxford-computer-science#10",
            "subject": "Computer Science (Maths & CS joint)",
            "publishedBy": "an Oxford Computer Science tutor, linked from the department's admissions page",
            "source": "https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/09/16/interview-question3.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "This question is about the function \\(Z\\) defined by \\( \\displaystyle Z(s) = \\sum_{k = 1}^\\infty \\frac{1}{k^s}, \\) for \\( s > 1 \\). / Can you find a lower bound on this function which is valid for all \\( s > 1 \\)? Why have we excluded \\( s = 1\\) from the domain? / From now on, we will concentrate on \\( Z(2) \\). / Can you find an upper bound on \\(Z(2) \\)? / In fact, \\( \\displaystyle Z(2) = \\frac{\\pi^2}{6} \\), i.e., \\( \\displaystyle \\sum_{k=1}^n \\frac{1}{k^2} \\rightarrow \\frac{\\pi^2}{6} \\) as \\( n \\rightarrow \\infty \\). / One proof of this fact relies on the inequalities / \\( \\sin \\theta < \\theta < \\tan \\theta,~~~~\\)for \\(\\theta \\in (0, \\pi/2)\\). / Can you show why this is true geometrically? / Can you use this to get upper and lower bounds on \\(1/\\theta^2\\) in terms only of \\(\\tan \\theta\\)? / Now let \\( \\theta_k = \\frac{k \\pi}{2 n + 1} \\) for \\(1 \\leq k \\leq n \\). Find upper and lower bounds on \\[ \\sum_{k=1}^n \\frac{1}{k^2}. \\] / It turns out that the numbers \\[ r_k = \\frac{1}{\\tan^2 \\left( \\frac{\\pi k}{2n + 1 } \\right) }, ~~ 1 \\leq k \\leq n, \\] are roots of the polynomial \\[ p_n(x) = { 2n + 1 \\choose 1} x^n - {2n + 1 \\choose 3} x^{n-1} + \\cdots + (-1)^n {2n + 1 \\choose 2n + 1}. \\] Can you use this to show that / \\( \\displaystyle \\sum_{k=1}^n \\frac{1}{k^2} \\rightarrow \\frac{\\pi^2}{6} \\) as \\( n \\rightarrow \\infty \\)?",
            "question": "This question is about the function \\(Z\\) defined by \\( \\displaystyle Z(s) = \\sum_{k = 1}^\\infty \\frac{1}{k^s}, \\) for \\( s > 1 \\). / Can you find a lower bound on this function which is valid for all \\( s > 1 \\)? Why have we excluded \\( s = 1\\) from the domain? / From now on, we will concentrate on \\( Z(2) \\). / Can you find an upper bound on \\(Z(2) \\)? / In fact, \\( \\displaystyle Z(2) = \\frac{\\pi^2}{6} \\), i.e., \\( \\displaystyle \\sum_{k=1}^n \\frac{1}{k^2} \\rightarrow \\frac{\\pi^2}{6} \\) as \\( n \\rightarrow \\infty \\). / One proof of this fact relies on the inequalities / \\( \\sin \\theta < \\theta < \\tan \\theta,~~~~\\)for \\(\\theta \\in (0, \\pi/2)\\). / Can you show why this is true geometrically? / Can you use this to get upper and lower bounds on \\(1/\\theta^2\\) in terms only of \\(\\tan \\theta\\)? / Now let \\( \\theta_k = \\frac{k \\pi}{2 n + 1} \\) for \\(1 \\leq k \\leq n \\). Find upper and lower bounds on \\[ \\sum_{k=1}^n \\frac{1}{k^2}. \\] / It turns out that the numbers \\[ r_k = \\frac{1}{\\tan^2 \\left( \\frac{\\pi k}{2n + 1 } \\right) }, ~~ 1 \\leq k \\leq n, \\] are roots of the polynomial \\[ p_n(x) = { 2n + 1 \\choose 1} x^n - {2n + 1 \\choose 3} x^{n-1} + \\cdots + (-1)^n {2n + 1 \\choose 2n + 1}. \\] Can you use this to show that / \\( \\displaystyle \\sum_{k=1}^n \\frac{1}{k^2} \\rightarrow \\frac{\\pi^2}{6} \\) as \\( n \\rightarrow \\infty \\)?"
          },
          {
            "id": "oxford-computer-science#11",
            "subject": "Computer Science",
            "publishedBy": "an Oxford Computer Science tutor, linked from the department's admissions page",
            "source": "https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/09/16/interview-question4.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Consider the following ten-digit number: / \\( 7~1~0~6~4~1~9~9~0~2\\). / You should remove three of the digits so as to get the largest possible seven digit number. As a first step, you may want to try to delete two digits from the following five digit number to get the largest possible three digit number: / \\(7~1~9~3~4\\). / Now consider the more general question when you are given an \\(n\\) digit number and asked to delete \\(k < n\\) out of the \\(n\\) digits, so as to leave the largest possible \\(n - k\\) digit number. Explain your general strategy. Evaluate the number of steps requried to perform your strategy and try to minimise this number as much as you can.",
            "question": "Consider the following ten-digit number: / \\( 7~1~0~6~4~1~9~9~0~2\\). / You should remove three of the digits so as to get the largest possible seven digit number. As a first step, you may want to try to delete two digits from the following five digit number to get the largest possible three digit number: / \\(7~1~9~3~4\\). / Now consider the more general question when you are given an \\(n\\) digit number and asked to delete \\(k < n\\) out of the \\(n\\) digits, so as to leave the largest possible \\(n - k\\) digit number. Explain your general strategy. Evaluate the number of steps requried to perform your strategy and try to minimise this number as much as you can."
          },
          {
            "id": "oxford-computer-science#12",
            "subject": "Computer Science (Maths & CS joint)",
            "publishedBy": "an Oxford Computer Science tutor, linked from the department's admissions page",
            "source": "https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2023/06/28/interview-question5.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "An increasing tree is a rooted labelled tree whose labels increase along paths away from the root. For simplicity, if the tree has \\(n\\) vertices we will take the root to be labelled \\(1\\) and the other vertices to be labelled by \\(2, \\ldots, n\\). An example is shown below. / Note that when a node has more than one child, the order in which the children are represented is irrelevant, so that, for example, the following two trees are equivalent. / Can you draw all the increasing trees with \\(4\\) vertices? / How many increasing trees on \\(n\\) vertices are there? / Suppose now that \\(n\\) is even. How many of these can be split by removing a single edge into a tree labelled only by odd numbers and a tree labelled only by even numbers? / Suppose now that we want to generate an increasing tree on \\(n\\) vertices picked uniformly at random, i.e. pick each of the possible trees with equal probability. Can you give an algorithm to do this? / When a random tree is picked as in the previous part, what is the average number of neighbours of the root?",
            "question": "An increasing tree is a rooted labelled tree whose labels increase along paths away from the root. For simplicity, if the tree has \\(n\\) vertices we will take the root to be labelled \\(1\\) and the other vertices to be labelled by \\(2, \\ldots, n\\). An example is shown below. / Note that when a node has more than one child, the order in which the children are represented is irrelevant, so that, for example, the following two trees are equivalent. / Can you draw all the increasing trees with \\(4\\) vertices? / How many increasing trees on \\(n\\) vertices are there? / Suppose now that \\(n\\) is even. How many of these can be split by removing a single edge into a tree labelled only by odd numbers and a tree labelled only by even numbers? / Suppose now that we want to generate an increasing tree on \\(n\\) vertices picked uniformly at random, i.e. pick each of the possible trees with equal probability. Can you give an algorithm to do this? / When a random tree is picked as in the previous part, what is the average number of neighbours of the root?"
          },
          {
            "id": "oxford-computer-science#13",
            "subject": "Computer Science",
            "publishedBy": "an Oxford Computer Science tutor, linked from the department's admissions page",
            "source": "https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2023/06/28/interview-question6.html",
            "accessed": "2026-11-14",
            "sourceSnippet": "Suppose \\(a_1, \\ldots, a_8\\) are positive real numbers that add up to \\( 27 \\). Can you find the minimum of the following expression? / \\[ \\sqrt{1^2 + a_1^2} + \\sqrt{2^2 + a_2^2} + \\cdots + \\sqrt{8^2 + a_8^2} \\] / Can the values of \\(a_i\\) that minimise this expression be rational?",
            "question": "Suppose \\(a_1, \\ldots, a_8\\) are positive real numbers that add up to \\( 27 \\). Can you find the minimum of the following expression? / \\[ \\sqrt{1^2 + a_1^2} + \\sqrt{2^2 + a_2^2} + \\cdots + \\sqrt{8^2 + a_8^2} \\] / Can the values of \\(a_i\\) that minimise this expression be rational?"
          }
        ],
        "unavailable": false,
        "interviewed": "yes",
        "timing": {
          "kind": "interview",
          "answerSeconds": 1800,
          "field": "numberAndLength",
          "quote": "Each interview lasts around 30 minutes"
        }
      },
      "oxford-mathematics": {
        "id": "oxford-mathematics",
        "university": "University of Oxford",
        "subject": "Mathematics",
        "format": {
          "source": "https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interviews occur in December. The precise format of the interviews varies from college to college, but candidates will generally have one or two interviews in their first choice college, and at least one other interview at another college. Interviews are online via video call for all candidates."
        },
        "numberAndLength": {
          "source": "https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "Each interview lasts for about 25 minutes, and is largely mathematical in nature. We may ask you to tell us about an area of mathematics you have studied; we may look in detail at a point of technique, or curve sketching; we may ask you to solve a problem and talk us through your thought processes; we may give you a mathematical definition and ask you to work out some of its consequences. We are trying to see how you think when you do Mathematics."
        },
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [
          {
            "source": "https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews",
            "accessed": "2026-11-14",
            "sourceSnippet": "Although we are good mathematicians, we are not mind-readers - if you don't say anything, we can't tell what you're thinking! To this end, it may be helpful for you to arrange a practice interview with a teacher - perhaps they can ask you to work out a past MAT question in front of them. Alternatively, try explaining concepts from your Maths A-level to your less mathematically-minded friends and family. This not only gets you used to explaining your thoughts out loud, but also helps to consolidate your knowledge of the subject."
          },
          {
            "source": "https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews",
            "accessed": "2026-11-14",
            "sourceSnippet": "We very much don't want applicants to feel they need special training for our admissions. The main thing is that you do mathematics, lots of it, and that you find it interesting. We advise you to do lots of problems, on and near your syllabus, so that you really understand the mathematics you are learning. This doesn't mean you shouldn't also read any of the excellent and interesting books about famous mathematical subjects such as Fermat's Last Theorem, but although these books are fascinating and inspirational, the maths they cover is pretty difficult. After all, even in Oxford only a handful of people properly understand Andrew Wiles's proof!"
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": {
          "kind": "interview",
          "answerSeconds": 1500,
          "field": "numberAndLength",
          "quote": "Each interview lasts for about 25 minutes"
        }
      },
      "oxford-engineering": {
        "id": "oxford-engineering",
        "university": "University of Oxford",
        "subject": "Engineering Science",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "oxford-physics": {
        "id": "oxford-physics",
        "university": "University of Oxford",
        "subject": "Physics",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "oxford-biochemistry": {
        "id": "oxford-biochemistry",
        "university": "University of Oxford",
        "subject": "Biochemistry",
        "format": {
          "source": "https://www.bioch.ox.ac.uk/undergraduate-admissions",
          "accessed": "2026-11-14",
          "sourceSnippet": "All shortlised applicants will be interviewed online by two different Colleges. This interview will take place using Microsoft Teams and potentially make use of the whiteboard software Miro. Interviews are used to discover your potential, taking into account your background and the stage you have reached, rather than to grill you on what you have covered so far at school. The interviewers will be looking at your interest in and enthusiasm for biochemistry, your ability to discuss and analyse relevant topics (often involving ideas or information that may be new to you), and your general reasoning and problem-solving skills."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.bioch.ox.ac.uk/undergraduate-admissions",
          "accessed": "2026-11-14",
          "sourceSnippet": "Items specifically assessed at interview are: / your Interest in/enthusiasm for biochemistry; / your ability to describe/discuss a topic of mutual interest; / your ability to describe/analyse, and extrapolate from, novel information; / your reasoning and problem solving ability."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "oxford-ppe": {
        "id": "oxford-ppe",
        "university": "University of Oxford",
        "subject": "Philosophy, Politics and Economics",
        "format": {
          "source": "https://www.ppe.ox.ac.uk/interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interviews for all applicants in 2024 for 2025-entry will be held online."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.ppe.ox.ac.uk/interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "The interview is not primarily a test of existing knowledge. It is aimed primarily at assessing the candidate's potential for future development. Interviewers will be looking for evidence of the candidate's potential for development in the following four areas: / Understanding: this can be shown in (for example) a candidate's ability to listen carefully, to analyse problems, to identify the premises and conclusions of arguments, and to express in their own words someone else's ideas. / Intellectual flexibility: this can be demonstrated by (for example) a candidate's willingness to consider alternative views, and readiness to respond to problems and criticisms. / Critical thinking and problem-solving: this can be shown in (for example) a candidate's ability to adopt logical and critical approaches to problems, to critically assess arguments, to identify good and bad reasons for believing a particular claim, to assess relevance, and to think independently. / Communication: this can be shown in (for example) a candidate's ability to express ideas clearly, to give considered responses to questions, and to address the point under discussion instead of veering off topic."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "oxford-history": {
        "id": "oxford-history",
        "university": "University of Oxford",
        "subject": "History",
        "format": {
          "source": "https://www.history.ox.ac.uk/making-application",
          "accessed": "2026-11-14",
          "sourceSnippet": "Following a university-wide vote, all interviews will be on-line."
        },
        "numberAndLength": {
          "source": "https://www.history.ox.ac.uk/making-application",
          "accessed": "2026-11-14",
          "sourceSnippet": "Some candidates will be called for a second interview, which will be at a different college to your first interview. The college will contact you as soon as possible, but you may only get a few days' notice."
        },
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [
          {
            "source": "https://www.history.ox.ac.uk/making-application",
            "accessed": "2026-11-14",
            "sourceSnippet": "Interviews are not intended to be confrontational although they will undoubtedly be intellectually challenging. The tutors are interested in finding out what your intellectual potential is; they do not wish to catch you out. But remember to think carefully about the questions you have been asked; your interviewers will not mind if you pause to think. Try not to go in with some prepared speech you are determined to deliver at all costs."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "oxford-law": {
        "id": "oxford-law",
        "university": "University of Oxford",
        "subject": "Law (Jurisprudence)",
        "format": {
          "source": "https://www.law.ox.ac.uk/admissions/undergraduate/undergraduate-admissions-faqs-ba-jurisprudence",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interviews are a useful way for us to test your aptitude for the type of skills necessary on a law degree: for example, interviewers will be testing your reasoning and analytical ability. The purpose of the interview process is thus to give us extra information as to how you perform against our admissions criteria (see Question above). Interviews can take different forms: for example, an interview may include legally related questions as well as more general intellectual puzzles calling for logical analysis of a type similar to legal analysis.Whilst interviews may discuss legal issues, your pre-existing knowledge of the law is not being assessed. For example, you may be given a legal extract to discuss – if so, the only legal knowledge being sought is that which can be learnt from the extract."
        },
        "numberAndLength": {
          "source": "https://www.law.ox.ac.uk/admissions/undergraduate/undergraduate-admissions-faqs-ba-jurisprudence",
          "accessed": "2026-11-14",
          "sourceSnippet": "If you come to a particular college for interview in Oxford, you are very likely to receive two interviews at that college. It may then be the case that, as part of our re-allocation process (see Question 4 above), you will also be interviewed by a second college: if so, that interview will take place on Friday of the same week."
        },
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "oxford-economics-management": {
        "id": "oxford-economics-management",
        "university": "University of Oxford",
        "subject": "Economics and Management",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "oxford-medicine": {
        "id": "oxford-medicine",
        "university": "University of Oxford",
        "subject": "Medicine",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "cambridge-all-courses": {
        "id": "cambridge-all-courses",
        "university": "University of Cambridge",
        "subject": "All courses (central guidance)",
        "format": {
          "source": "https://www.undergraduate.study.cam.ac.uk/apply/after/cambridge-interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interviews may be online or in person, depending on which College is assessing your application and the course you have applied for."
        },
        "numberAndLength": {
          "source": "https://www.undergraduate.study.cam.ac.uk/apply/after/cambridge-interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "Most applicants will have 1 or 2 interviews lasting a total of 35 minutes to an hour."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.undergraduate.study.cam.ac.uk/apply/after/cambridge-interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interviews at Cambridge are academic conversations about the subject you’re interested in studying. They're a core part of our admissions process and help us to assess your potential for your chosen course."
        },
        "prepAdvice": [
          {
            "source": "https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation",
            "accessed": "2026-11-14",
            "sourceSnippet": "Read your personal statement again and any written work you submitted to your College as part of your application."
          },
          {
            "source": "https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation",
            "accessed": "2026-11-14",
            "sourceSnippet": "Explore your subject beyond what you’ve learnt at school. You can do this by reading books, watching videos and listening to podcasts."
          },
          {
            "source": "https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation",
            "accessed": "2026-11-14",
            "sourceSnippet": "Practise talking about your subject with your friends, family or teachers."
          },
          {
            "source": "https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation",
            "accessed": "2026-11-14",
            "sourceSnippet": "Have a practice interview. Ideally ask a teacher or someone who doesn't know you well so that you can practise expressing your ideas and opinions. Alternatively, you could ask yourself questions for half an hour. This will help you to get used to talking about yourself, your work and thinking in a critical way."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "cambridge-computer-science": {
        "id": "cambridge-computer-science",
        "university": "University of Cambridge",
        "subject": "Computer Science",
        "format": {
          "source": "https://www.cst.cam.ac.uk/admissions/undergraduate/interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "Your interview might involve some discussion of your personal statement, motivation and working through a problem. The topics and types of problems vary but almost always require mathematical knowledge and understanding to solve. The interviewers will not expect you to know things that are outside of your school curriculum and do not expect you to fully complete all of the problems presented during the interview."
        },
        "numberAndLength": {
          "source": "https://www.cst.cam.ac.uk/admissions/undergraduate/interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "The number and length of your interviews depends on the College that you apply to. For example, applicants to: / Gonville and Caius have two 25-minute Computer Science interviews / Peterhouse have one 25-minute Computer Science interview and one 25-minute Maths interview / Churchill have one 30-40 minute Computer Science interview"
        },
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "cambridge-mathematics": {
        "id": "cambridge-mathematics",
        "university": "University of Cambridge",
        "subject": "Mathematics",
        "format": {
          "source": "https://www.maths.cam.ac.uk/undergrad/admissions/faq",
          "accessed": "2026-11-14",
          "sourceSnippet": "In a mathematics interview you will be asked to solve some mathematical problems. That's all: maths, followed by some more maths. All we are interested in is your ability to tackle mathematical problems. There are no trick questions. The main purpose of the interview is to see how you think about a mathematical problem. An interview will typically last for about 20 to 40 minutes (you will be told in advance)."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.maths.cam.ac.uk/undergrad/admissions/faq",
          "accessed": "2026-11-14",
          "sourceSnippet": "In a typical interview there will be mostly questions about topics like numbers, sequences, integrals, graph sketching, etc, but also sometimes probability, and some basic mechanics. If you are applying for Maths with Physics you will always be asked at least one mechanics question."
        },
        "prepAdvice": [
          {
            "source": "https://www.maths.cam.ac.uk/undergrad/admissions/files/admissions/admissionsguide.pdf",
            "accessed": "2026-11-14",
            "sourceSnippet": "The best ways of preparing for interview are: • Practise lots of maths problems, including material from the STEP Support Programme foundation modules at https://maths.org/step/assignments, but also maths quizzes and fun problems from websites such as https://www.cut-the-knot.org. • Practise sketching functions. • Practise solving problems saying aloud to a friend or parent what you’re doing (so you’ll be used to saying aloud what you’re thinking during the interview). • When looking at mathematical statements and problems, practise asking yourself questions such as: “What if ...?” (for example what if, instead of all natural numbers in this problem we look at only even numbers?), or “Can this be extended ...?” (for example, something valid for a particular function, which happens to be an even function, can it be extended to all even functions? Yes/no - why?)."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "cambridge-natural-sciences": {
        "id": "cambridge-natural-sciences",
        "university": "University of Cambridge",
        "subject": "Natural Sciences",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.undergraduate.study.cam.ac.uk/courses/natural-sciences",
          "accessed": "2026-11-14",
          "sourceSnippet": "Your choice of application stream, and the courses that you are currently studying, will affect the types of questions that are asked at interview."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "cambridge-medicine": {
        "id": "cambridge-medicine",
        "university": "University of Cambridge",
        "subject": "Medicine",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.undergraduate.study.cam.ac.uk/courses/medicine",
          "accessed": "2026-11-14",
          "sourceSnippet": "We assess applicants through a mixture of academic record, UCAT and interviews. There is no minimum threshold for UCAT score."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "cambridge-engineering": {
        "id": "cambridge-engineering",
        "university": "University of Cambridge",
        "subject": "Engineering",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "imperial-medicine": {
        "id": "imperial-medicine",
        "university": "Imperial College London",
        "subject": "Medicine",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "imperial-cs": {
        "id": "imperial-cs",
        "university": "Imperial College London",
        "subject": "Computing",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "imperial-electrical": {
        "id": "imperial-electrical",
        "university": "Imperial College London",
        "subject": "Electrical & Electronic Engineering",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "imperial-mechanical": {
        "id": "imperial-mechanical",
        "university": "Imperial College London",
        "subject": "Mechanical Engineering",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "imperial-chemical": {
        "id": "imperial-chemical",
        "university": "Imperial College London",
        "subject": "Chemical Engineering",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "imperial-physics": {
        "id": "imperial-physics",
        "university": "Imperial College London",
        "subject": "Physics",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "imperial-maths": {
        "id": "imperial-maths",
        "university": "Imperial College London",
        "subject": "Mathematics",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "imperial-bioengineering": {
        "id": "imperial-bioengineering",
        "university": "Imperial College London",
        "subject": "Biomedical Engineering",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "kcl-medicine": {
        "id": "kcl-medicine",
        "university": "King's College London",
        "subject": "Medicine",
        "format": {
          "source": "https://www.kcl.ac.uk/study/undergraduate/courses/medicine-mbbs/requirements",
          "accessed": "2026-11-14",
          "sourceSnippet": "No offers are made without an interview. Interviews are usually held between December and April and applicants must be available for interview in order to be considered for admission. During the current Admissions cycle, interviews will be conducted remotely. A large number of applications are received for Medicine and, although we recognise that this can be an anxious time, all applications are carefully considered. Applicants should therefore not expect a final decision following interview until the admissions cycle has concluded in May."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.kcl.ac.uk/study/undergraduate/courses/medicine-mbbs/requirements",
          "accessed": "2026-11-14",
          "sourceSnippet": "If you are invited to interview, further information regarding the interview format and process will be provided through the King's Apply portal. Interviews form an important part of the selection process and are designed to assess a range of attributes, including communication skills, ethical reasoning, understanding of current and relevant healthcare issues, motivation for studying Medicine and overall suitability for the programme and the medical profession. Interviewers have no prior knowledge of candidates before they meet them and complete standardised assessment criteria for all candidates."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "kcl-nursing": {
        "id": "kcl-nursing",
        "university": "King's College London",
        "subject": "Nursing",
        "format": {
          "source": "https://www.kcl.ac.uk/study/undergraduate/courses/nursing-with-registration-as-an-adult-nurse-bsc/requirements",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interviews will be conducted remotely. Interviewers will assess a range of values and attributes. Communication skills will also be assessed during the interview. Interviewers have no prior knowledge of candidates and will complete standardised interviewer assessment score sheets."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "ucl-medicine": {
        "id": "ucl-medicine",
        "university": "University College London",
        "subject": "Medicine",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "ucl-architecture": {
        "id": "ucl-architecture",
        "university": "University College London",
        "subject": "Architecture",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "ucl-pharmacy": {
        "id": "ucl-pharmacy",
        "university": "University College London",
        "subject": "Pharmacy",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "ucl-law": {
        "id": "ucl-law",
        "university": "University College London",
        "subject": "Law (European Legal Systems)",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "birmingham-medicine": {
        "id": "birmingham-medicine",
        "university": "University of Birmingham",
        "subject": "Medicine",
        "format": {
          "source": "https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates",
          "accessed": "2026-11-14",
          "sourceSnippet": "Our in-person Multiple Mini Interviews (MMIs) for home candidates will consist of seven separate stations. You will physically move around a numbered circuit of stations set up in a large room; each station will include 2 minutes of preparation time and 6 minutes of interview time. A whistle will be blown when it is time to move to the next station (see below for those with additional needs who may require additional preparation time)."
        },
        "numberAndLength": {
          "source": "https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates",
          "accessed": "2026-11-14",
          "sourceSnippet": "Your interview will therefore last approximately 60 minutes and you should allow around 2 hours in total for your time at Birmingham Medical School."
        },
        "mmiStations": {
          "source": "https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates",
          "accessed": "2026-11-14",
          "sourceSnippet": "The seven stations will include: / Commitment and Insight / Dealing with personal and ethical challenges / Critical Thinking / Professionalism / Data interpretation / Role-Play / Calculation"
        },
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": {
          "kind": "station",
          "prepSeconds": 120,
          "answerSeconds": 360,
          "field": "format",
          "quote": "each station will include 2 minutes of preparation time and 6 minutes of interview time"
        }
      },
      "bristol-medicine": {
        "id": "bristol-medicine",
        "university": "University of Bristol",
        "subject": "Medicine",
        "format": {
          "source": "https://www.bristol.ac.uk/study/undergraduate/after-you-apply/interviews/medicine/",
          "accessed": "2026-11-14",
          "sourceSnippet": "This year's interviews will be hosted remotely via the Zoom platform. The formal interview will last approximately 30 minutes in a structured interview format. There will be six stations, each assessed by multiple assessors. Their scores will be combined to form a total score for each station. The six station scores together will produce your final interview score."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/medicine.pdf",
          "accessed": "2026-11-14",
          "sourceSnippet": "The purpose of the interview is to provide the applicant with an opportunity to demonstrate evidence of skills and attributes that are appropriate to a career in medicine and to display insight into a range of topics related to a career in medicine."
        },
        "prepAdvice": [
          {
            "source": "https://www.bristol.ac.uk/study/undergraduate/after-you-apply/interviews/medicine/",
            "accessed": "2026-11-14",
            "sourceSnippet": "As a medical student, you will attend teaching sessions on professionalism and will be sign-posted to appropriate guidance. In preparation for your interview, we would like you to read very carefully Achieving Good Medical Practice: guidance for medical students published by the General Medical Council."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": {
          "kind": "interview",
          "answerSeconds": 1800,
          "field": "format",
          "quote": "The formal interview will last approximately 30 minutes"
        }
      },
      "edinburgh-medicine": {
        "id": "edinburgh-medicine",
        "university": "University of Edinburgh",
        "subject": "Medicine",
        "format": {
          "source": "https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios",
          "accessed": "2026-11-14",
          "sourceSnippet": "For medicine and veterinary medicine this will take the form of multiple mini-interviews."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "glasgow-medicine": {
        "id": "glasgow-medicine",
        "university": "University of Glasgow",
        "subject": "Medicine",
        "format": {
          "source": "https://www.gla.ac.uk/schools/medicine/mus/admissions/mbchbinterviews/",
          "accessed": "2026-11-14",
          "sourceSnippet": "For 2027 entry, interviews are being conducted online. Interviews will take place between late November 2026 and March 2027 unless otherwise stated."
        },
        "numberAndLength": {
          "source": "https://www.gla.ac.uk/schools/medicine/mus/admissions/mbchbinterviews/",
          "accessed": "2026-11-14",
          "sourceSnippet": "The interview session will last 30 minutes in total and is divided into two sections - panel A and panel B: / Panel A: explore motivation to becoming a doctor, teamwork and related topics around this. / Panel B: focus on communication and will include discussion of an ethical scenario. Applicants choose one from two given scenarios."
        },
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [
          {
            "source": "https://www.gla.ac.uk/schools/medicine/mus/admissions/mbchbinterviews/",
            "accessed": "2026-11-14",
            "sourceSnippet": "Refer to our undergraduate medical curriculum – gla.ac.uk/schools/medicine/mus/admissions (see 'MBChB Programme Information') / Revisit your personal statement (interviewers have no knowledge about you other than your name) / Think of examples of your achievements and skills / Consider your personal characteristics / Reflect on previous interactions or experiences / Be aware of current issues/challenges within the NHS"
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": {
          "kind": "interview",
          "answerSeconds": 1800,
          "field": "numberAndLength",
          "quote": "The interview session will last 30 minutes in total"
        }
      },
      "leeds-medicine": {
        "id": "leeds-medicine",
        "university": "University of Leeds",
        "subject": "Medicine",
        "format": {
          "source": "https://courses.leeds.ac.uk/5580/medicine-and-surgery-mbchb",
          "accessed": "2026-11-14",
          "sourceSnippet": "For students applying for 2027 entry, face-to-face interviews for the MBChB course will take place on 4th, 5th and 6th January 2027. Overseas interviews will be carried out online. Using a multiple mini-interview format, we will further assess applicants’ non-academic qualities."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "manchester-medicine": {
        "id": "manchester-medicine",
        "university": "University of Manchester",
        "subject": "Medicine",
        "format": {
          "source": "https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/",
          "accessed": "2026-11-14",
          "sourceSnippet": "The interview process will adopt a five-station multiple mini interview (MMI) format, with each station being marked by a separate interviewer."
        },
        "numberAndLength": {
          "source": "https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/",
          "accessed": "2026-11-14",
          "sourceSnippet": "The interview in each station will be eight minutes long with a two-minute gap between stations. No information will be provided in advance, and there will be no reading or writing component to any of the online or in-person interview stations."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/",
          "accessed": "2026-11-14",
          "sourceSnippet": "The interview is not a test of your academic knowledge. The aim of the interview is to determine if a candidate satisfies our non-academic criteria in terms of the values and behaviours expected of a medical student."
        },
        "prepAdvice": [
          {
            "source": "https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/",
            "accessed": "2026-11-14",
            "sourceSnippet": "Please be yourself. You should speak naturally and conversationally. Do not feel the need to be excessively formal unless required by the interview station scenario."
          },
          {
            "source": "https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/",
            "accessed": "2026-11-14",
            "sourceSnippet": "Have a series of pointers in your mind, but remember not to over-rehearse. Our interview style at Manchester is conversational, and we're not looking for a monologue."
          }
        ],
        "sampleQuestions": [
          {
            "id": "manchester-medicine#1",
            "subject": "Medicine",
            "publishedBy": "University of Manchester",
            "source": "https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/",
            "accessed": "2026-11-14",
            "sourceSnippet": "Why do you want to be a doctor?",
            "question": "Why do you want to be a doctor?"
          }
        ],
        "unavailable": false,
        "interviewed": "yes",
        "timing": {
          "kind": "station",
          "answerSeconds": 480,
          "field": "numberAndLength",
          "quote": "The interview in each station will be eight minutes long"
        }
      },
      "nottingham-medicine": {
        "id": "nottingham-medicine",
        "university": "University of Nottingham",
        "subject": "Medicine",
        "format": {
          "source": "https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Medicine-BMBS.html",
          "accessed": "2026-11-14",
          "sourceSnippet": "The interview format is determined on the applicant’s fee status: / Home applicants will be invited to attend an interview in person / International applicants will be invited to attend an interview online via Microsoft Teams"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "st-andrews-medicine": {
        "id": "st-andrews-medicine",
        "university": "University of St Andrews",
        "subject": "Medicine",
        "format": {
          "source": "https://www.st-andrews.ac.uk/subjects/medicine/selection/",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interviews for entry to the School of Medicine are in the format of multiple interviews: these usually consist of four 'mini' interviews held at different stations which last about six minutes each."
        },
        "numberAndLength": null,
        "mmiStations": {
          "source": "https://www.st-andrews.ac.uk/subjects/medicine/selection/",
          "accessed": "2026-11-14",
          "sourceSnippet": "At the interview, you will be expected to demonstrate that you have an understanding of medicine as a career and that you appreciate the realities of working in a caring profession. Your communication and interpersonal skills will be assessed at each station, and at least one station will involve role-play and interaction with an actor. You may also be assessed on such things as critical thinking, reflection, and your ability to discuss ethical issues."
        },
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": {
          "kind": "station",
          "answerSeconds": 360,
          "field": "format",
          "quote": "which last about six minutes each"
        }
      },
      "bath-pharmacy": {
        "id": "bath-pharmacy",
        "university": "University of Bath",
        "subject": "Pharmacy",
        "format": {
          "source": "https://www.bath.ac.uk/courses/undergraduate-2027/pharmacy/mpharm-pharmacy/",
          "accessed": "2026-11-14",
          "sourceSnippet": "If you are assessed as suitable you will be invited to a selection interview. If you are applying from outside the UK we will arrange to interview you remotely. You will need to complete a Fitness to Practise self-declaration form as part of the interview process. This form includes a written declaration of any medical conditions or disabilities you have. You will not receive an offer unless you are successful in your interview. This is required by the General Pharmaceutical Council (GPhC)."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.bath.ac.uk/courses/undergraduate-2027/pharmacy/mpharm-pharmacy/",
          "accessed": "2026-11-14",
          "sourceSnippet": "Your Organic Chemistry and Pharmaceutical Calculation skills will be examined as part of any interview."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "nottingham-pharmacy": {
        "id": "nottingham-pharmacy",
        "university": "University of Nottingham",
        "subject": "Pharmacy",
        "format": {
          "source": "https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Pharmacy-MPharm.html",
          "accessed": "2026-11-14",
          "sourceSnippet": "We initially shortlist based on your UCAS application and grades. The next step is an interview. We use a multi-mini interview (MMI) format. The MMI is a series of short interviews, each around five minutes that explore and engage your communication skills, interest in pharmacy and scenario based discussion on ethics and professional values and general understanding of how medicines work. It is an interactive process that gives you further insight into being a pharmacist. Further information about the interview process is on our website."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": {
          "kind": "station",
          "answerSeconds": 300,
          "field": "format",
          "quote": "each around five minutes"
        }
      },
      "manchester-psychology": {
        "id": "manchester-psychology",
        "university": "University of Manchester",
        "subject": "Psychology",
        "format": {
          "source": "https://www.manchester.ac.uk/study/undergraduate/courses/2027/00653/bsc-psychology/",
          "accessed": "2026-11-14",
          "sourceSnippet": "Applications are considered on the basis of the UCAS form. Candidates may be interviewed online or by telephone, or asked to complete an alternative admissions statement."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "some applicants",
        "timing": null
      },
      "nus-law": {
        "id": "nus-law",
        "university": "National University of Singapore",
        "subject": "Law",
        "format": {
          "source": "https://law1a.nus.edu.sg/admissions/4_yrs_llb_prog.html",
          "accessed": "2026-11-14",
          "sourceSnippet": "Shortlisted applicants will be required to sit for a written test and attend a formal interview, usually held in April – May in Singapore. Selection shall be solely within the discretion of the University and will depend upon the number of places available in the Faculty. /  / The objective of the written test is to assess applicants based on three foundational competencies. These competencies are: /  / (a) reading comprehension (the ability to understand complex pieces of text); / (b) effective writing (the ability to express thoughts clearly in good written English); and / (c) analytical reasoning (the ability to process and organise information to solve a problem)."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "ie-university": {
        "id": "ie-university",
        "university": "IE University",
        "subject": "All six courses",
        "format": {
          "source": "https://www.ie.edu/university/admission/admission-process/admissions-rounds/",
          "accessed": "2026-11-14",
          "sourceSnippet": "Yes, interviews are an integral part of the admissions process. Once the Admissions Committee has reviewed the candidate’s application, they may already decide on a resolution and communicate it or invite the candidate to a formal interview. This interview will be online and will usually take place within the round’s deadlines."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "yale": {
        "id": "yale",
        "university": "Yale University",
        "subject": "All courses (admission to the university, not to a course)",
        "format": {
          "source": "https://admissions.yale.edu/interviews",
          "accessed": "2026-11-14",
          "sourceSnippet": "## Alumni volunteers and current Yale students conduct evaluative interviews, by invitation only."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [
          {
            "source": "https://admissions.yale.edu/interviews",
            "accessed": "2026-11-14",
            "sourceSnippet": "Although the interviewer will get the ball rolling with questions, come prepared to be an engaged conversationalist. Rather than answering a question with a one-word, direct answer, approach each question as an opportunity to elaborate on various aspects of who you are. Share whatever additional information you feel the admissions committee should consider in order to fully appreciate your ideas, intellectual curiosity, character, and values. Interviewers can also learn about candidates from the interesting, thoughtful questions they bring to the conversation."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "some applicants",
        "timing": null
      },
      "stanford": {
        "id": "stanford",
        "university": "Stanford University",
        "subject": "All courses (admission to the university, not to a course)",
        "format": {
          "source": "https://admission.stanford.edu/apply/first-year/interview.html",
          "accessed": "2026-11-14",
          "sourceSnippet": "The Optional interviews provide opportunities for applicants to have meaningful conversations with Stanford alumni. A two-way exchange allows you to learn more about Stanford while the Admission Office learns more about you."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "optional",
        "timing": null
      },
      "duke": {
        "id": "duke",
        "university": "Duke University",
        "subject": "All courses (admission to the university, not to a course)",
        "format": {
          "source": "https://admissions.duke.edu/alumni-interviews/",
          "accessed": "2026-11-14",
          "sourceSnippet": "All interviews are conducted virtually or by phone by Duke alumni who volunteer their time. They are not employed by the Admissions Office and do not have access to your application, academic records, or other admissions-related information. Importantly, alumni interviewers cannot predict or influence your chances of admission."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [
          {
            "source": "https://admissions.duke.edu/alumni-interviews/",
            "accessed": "2026-11-14",
            "sourceSnippet": "The virtual or phone interview should feel more like a relaxed conversation, where you can discuss your interests and aspirations, and ask the alumnus/a questions about Duke. It’s a great opportunity to get to know Duke better and provide additional context about yourself beyond the written application."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "optional",
        "timing": null
      },
      "mit": {
        "id": "mit",
        "university": "MIT",
        "subject": "All courses (admission to the university, not to a course)",
        "format": {
          "source": "https://mitadmissions.org/apply/firstyear/interview/",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interviews are held in person whenever possible; however you may coordinate a virtual interview if agreed upon with your EC."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "some applicants",
        "timing": null
      },
      "harvard": {
        "id": "harvard",
        "university": "Harvard University",
        "subject": "All courses (admission to the university, not to a course)",
        "format": {
          "source": "https://college.harvard.edu/guides/what-expect-after-you-apply",
          "accessed": "2026-11-14",
          "sourceSnippet": "Applicants are assigned interviews at the discretion of the Admissions Committee, based, in part, on availability of alumni in your local area. Nearly 10,000 alumni/ae volunteers help us recruit students from all 50 states and around the world, but most areas do not have the capacity to interview all applicants. Your application is considered complete without an interview and will receive a full and thorough evaluation. In most cases, the Admissions Committee has sufficient information in the student’s application materials to reach an admissions decision. If the Committee would like more information about a student or has questions about any application materials, someone may reach out to schedule an interview."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "some applicants",
        "timing": null
      },
      "dartmouth": {
        "id": "dartmouth",
        "university": "Dartmouth College",
        "subject": "All courses (admission to the university, not to a course)",
        "format": {
          "source": "https://admissions.dartmouth.edu/glossary-question/how-do-i-get-interview",
          "accessed": "2026-11-14",
          "sourceSnippet": "As part of the admissions process, Dartmouth conducts alumni interviews. Once you apply, your contact information is sent to volunteer alumni admissions ambassadors. An alumnus or current student will then contact you directly to schedule the interview using the email address you provided in your application. Interviews will be offered virtually (via phone or video call) and in person."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "some applicants",
        "timing": null
      },
      "princeton": {
        "id": "princeton",
        "university": "Princeton University",
        "subject": "All courses (admission to the university, not to a course)",
        "format": {
          "source": "https://admission.princeton.edu/apply/application-checklist",
          "accessed": "2026-11-14",
          "sourceSnippet": "Interview. Princeton offers optional alumni interviews. Interviews take place after the Admission Office has received your application. You may choose to opt out of the interview in the Princeton-specific Questions, and this choice will not put you at any disadvantage in the admission process. If you do not opt out, you may receive an email inviting you to interview with a member of our Princeton Alumni Schools Committee. If so, we encourage you to take advantage of this opportunity. The interviews are 30-45 minute informal conversations, where you can discuss the things that are important to you and also ask questions to someone who attended Princeton. We cannot guarantee that every applicant will receive an interview. This will depend on the availability of alumni in your area. Our dedicated alumni do manage to contact the vast majority of our applicants every year; however, if you do not receive an interview for any reason, it will not put you at a disadvantage since the interview is optional. We do not offer on-campus interviews. These interviews must not be recorded in any way, either by the interviewer or the applicant. Given the timeline, students who are participating in the QuestBridge National College Match will be unable to complete an interview."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "optional",
        "timing": null
      },
      "rice": {
        "id": "rice",
        "university": "Rice University",
        "subject": "All courses (admission to the university, not to a course)",
        "format": {
          "source": "https://admission.rice.edu/apply/first-year-international-applicants",
          "accessed": "2026-11-14",
          "sourceSnippet": "We recommend that first-year applicants request an interview, though interviews are optional and not guaranteed. These conversations are a great way to showcase your academic and personal successes, demonstrate your knowledge of Rice, and learn more about the student experience."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "optional",
        "timing": null
      },
      "georgetown": {
        "id": "georgetown",
        "university": "Georgetown University",
        "subject": "All courses (admission to the university, not to a course)",
        "format": {
          "source": "https://uadmissions.georgetown.edu/apply/first-year-applicants/",
          "accessed": "2026-11-14",
          "sourceSnippet": "Alumni Interviews are a key part of Georgetown’s application process, allowing us to learn more about students’ high school experiences, college goals, and interest in the University. Alumni interviews begin in September each year, and continue throughout the application cycle."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "hku-law": {
        "id": "hku-law",
        "university": "University of Hong Kong",
        "subject": "Law (LLB)",
        "format": {
          "source": "https://www.law.hku.hk/prospective-students/ug-faq",
          "accessed": "2026-11-15",
          "sourceSnippet": "For JUPAS, the Faculty invites selected Band A applicants to attend group interviews after the release of HKDSE results. Please refer to Interview Schedules | Admissions Office, the Registry for the latest updates. For Non-JUPAS, selected applicants are invited to a panel interview. Small group interviews are usually held from December onwards."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "hku-architecture": {
        "id": "hku-architecture",
        "university": "University of Hong Kong",
        "subject": "Architectural Studies (BA(AS))",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://foa-media.arch.hku.hk/media/upload/2025/10/HKU_FoA_AdmBrochure_2026-27.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "This exercise is simply a way to encourage those interested in joining our BA(AS) programme to reflect on several issues which will be furthered discussed during the admissions interview."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "cuhk-all": {
        "id": "cuhk-all",
        "university": "Chinese University of Hong Kong",
        "subject": "All programmes that conduct selection interviews (central guidance)",
        "format": {
          "source": "https://admission.cuhk.edu.hk/application/jupas/faq/",
          "accessed": "2026-11-15",
          "sourceSnippet": "19 What is the format or language of the interviews? Bilingual small group or individual interviews are usually scheduled. Details such as the date, time, and language of the interview will be provided in the interview invitation."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "Reasons for Admission Interview To explore candidates’ special talents / skills which are not reflected in HKDSE results To look for candidates with interest / passion in the subject or discipline To observe if the candidate is suitable for a programme or profession To break the tie To provide a channel for both parties to get to know each other"
        },
        "prepAdvice": [
          {
            "source": "https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "Tips: Prepare the information in point form so you can easily present yourself no matter how you are being asked. Try NOT to recite the materials."
          },
          {
            "source": "https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "Research Visit the programme & university website Search if there are any latest developments in the programme / subject / discipline Reach out to your teachers & alumni for insights & advice Pay attention to local and international news"
          },
          {
            "source": "https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "Tips: Sometimes there is no standard or correct answer. Your attitude in dealing with difficult questions / situations will show the interviewers what kind of person you are."
          },
          {
            "source": "https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "Try to say something even when you don’t know the answer An interview is a communication process, not a test. Interviewers appreciate efforts and sincerity"
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToEvidence": [
          {
            "source": "https://admission.cuhk.edu.hk/application/jupas/faq/",
            "accessed": "2026-11-15",
            "sourceSnippet": "When will programmes arrange interviews for JUPAS applicants? Selection interviews will generally be conducted after the completion of the HKDSE examinations, and/or after the release of HKDSE results in July 2027."
          }
        ]
      },
      "cuhk-medicine": {
        "id": "cuhk-medicine",
        "university": "Chinese University of Hong Kong",
        "subject": "Medicine (MBChB)",
        "format": {
          "source": "https://med.cuhk.edu.hk/study/prospective-students/undergraduate-study/programme-and-admission/mbchb-and-gps/admissions/interview",
          "accessed": "2026-11-15",
          "sourceSnippet": "Shortlisted applicants are interviewed individually by two panel members."
        },
        "numberAndLength": {
          "source": "https://med.cuhk.edu.hk/study/prospective-students/undergraduate-study/programme-and-admission/mbchb-and-gps/admissions/interview",
          "accessed": "2026-11-15",
          "sourceSnippet": "The individual interview will be conducted in English and last for about 15 minutes."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://med.cuhk.edu.hk/study/prospective-students/undergraduate-study/programme-and-admission/mbchb-and-gps/admissions/interview",
          "accessed": "2026-11-15",
          "sourceSnippet": "Questions will be asked to explore the student's interest in medicine, general knowledge about health care, opinions about ethics and humanism, and teamwork, leadership and communication."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "cuhk-business": {
        "id": "cuhk-business",
        "university": "Chinese University of Hong Kong",
        "subject": "Integrated Business Administration (BBA)",
        "format": {
          "source": "https://ug.bschool.cuhk.edu.hk/jupas-admissions-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "For JUPAS candidates of 2026 entry, please note that CUHK Business School will conduct face-to-face admission interviews. Hong Kong JUPAS candidates who have placed any of our business programme(s) in Band A by the deadline of updating JUPAS programme choices on 27 May 2026 will be invited to the interview."
        },
        "numberAndLength": {
          "source": "https://ug.bschool.cuhk.edu.hk/jupas-admissions-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interviews (group or individual) will be conducted in English. Candidates should reserve at least one hour for the actual admission interviews, excluding the 30-minute registration time beforehand."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://ug.bschool.cuhk.edu.hk/admission-faqs",
          "accessed": "2026-11-15",
          "sourceSnippet": "The selection interview is an opportunity for the programme to better understand the aptitude and aspiration of an applicant."
        },
        "prepAdvice": [
          {
            "source": "https://ug.bschool.cuhk.edu.hk/jupas-admissions-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Dress code: Business Formal."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS candidates"
      },
      "cuhk-cs": {
        "id": "cuhk-cs",
        "university": "Chinese University of Hong Kong",
        "subject": "Computer Science and Engineering",
        "format": {
          "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS4412 Computer Science and Engineering Mid June"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS Before After No Catalogue Programme / Stream release of release of Interview No. HKDSE results HKDSE results"
          }
        ]
      },
      "cuhk-engineering": {
        "id": "cuhk-engineering",
        "university": "Chinese University of Hong Kong",
        "subject": "Engineering",
        "format": {
          "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS4446 Information Engineering 18 - 29 May"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS Before After No Catalogue Programme / Stream release of release of Interview No. HKDSE results HKDSE results"
          }
        ]
      },
      "cuhk-economics": {
        "id": "cuhk-economics",
        "university": "Chinese University of Hong Kong",
        "subject": "Economics",
        "format": {
          "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS4824 Economics Late June"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS Before After No Catalogue Programme / Stream release of release of Interview No. HKDSE results HKDSE results"
          }
        ]
      },
      "cuhk-law": {
        "id": "cuhk-law",
        "university": "Chinese University of Hong Kong",
        "subject": "Law (LLB)",
        "format": {
          "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS4903 Bachelor of Laws 11 - 16 June"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS Before After No Catalogue Programme / Stream release of release of Interview No. HKDSE results HKDSE results"
          }
        ]
      },
      "cuhk-architecture": {
        "id": "cuhk-architecture",
        "university": "Chinese University of Hong Kong",
        "subject": "Architectural Studies",
        "format": {
          "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS4812 Architectural Studies Late May - early June"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS Before After No Catalogue Programme / Stream release of release of Interview No. HKDSE results HKDSE results"
          }
        ]
      },
      "hkust-all": {
        "id": "hkust-all",
        "university": "HKUST",
        "subject": "All programmes (international qualifications route)",
        "format": {
          "source": "https://join.hkust.edu.hk/node/7",
          "accessed": "2026-11-15",
          "sourceSnippet": "An admissions interview may be arranged, but is not a mandatory procedure of the admissions exercise except for some programs. You may click here to view the interview requirements. When you are invited for an interview, our colleagues will contact you on the arrangements via email."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "International Qualification Holders",
        "appliesToEvidence": [
          {
            "source": "https://join.hkust.edu.hk/node/7",
            "accessed": "2026-11-15",
            "sourceSnippet": "Application Procedures for International Qualification Holders"
          }
        ]
      },
      "hkust-engineering": {
        "id": "hkust-engineering",
        "university": "HKUST",
        "subject": "Engineering (incl. Computer Science and Engineering)",
        "format": {
          "source": "https://join.hkust.edu.hk/admissions/jupas",
          "accessed": "2026-11-15",
          "sourceSnippet": "Events related to admission to Engineering programs. Engineering Exploration Day 📅 11 May 2026 📍 HKUST Campus Admission Interview 📅 20-21 May 2026 🛜 Online"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://join.hkust.edu.hk/admissions/jupas",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS Interview Description Individual interview notifications will be sent to selected candidates shortly before their interviews."
          }
        ]
      },
      "hkust-quantfin": {
        "id": "hkust-quantfin",
        "university": "HKUST",
        "subject": "Quantitative Finance (BSc)",
        "format": {
          "source": "https://join.hkust.edu.hk/admissions/jupas",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interview is compulsory for the following programs： International Research Enrichment (IRE) BSc in Biomedical and Health Sciences (BMH) BBA Global Business (GBUS) BSc Economics & Finance (ECOF) BSc Quantitative Finance (QFIN)"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://join.hkust.edu.hk/admissions/jupas",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS Interview Description Individual interview notifications will be sent to selected candidates shortly before their interviews."
          }
        ]
      },
      "polyu-business": {
        "id": "polyu-business",
        "university": "Hong Kong Polytechnic University",
        "subject": "Business Administration (Bachelor's Degree Scheme)",
        "format": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement",
          "accessed": "2026-11-15",
          "sourceSnippet": "Medium English Mode Group/ individual interview Remarks Suitable candidates may be invited for an interview."
        },
        "numberAndLength": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement",
          "accessed": "2026-11-15",
          "sourceSnippet": "Date of Interview June/July, if necessary Duration About 15-30 minutes"
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS3003 Business Administration Aims To evaluate applicants’ potential and interest in the programme and to test their language and communication skills."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS - Interview Arrangement"
          }
        ]
      },
      "polyu-engineering": {
        "id": "polyu-engineering",
        "university": "Hong Kong Polytechnic University",
        "subject": "Engineering (Bachelor's Degree Scheme)",
        "format": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement",
          "accessed": "2026-11-15",
          "sourceSnippet": "Medium English Mode Individual / Group interview Remarks Suitable candidates may be invited for an interview."
        },
        "numberAndLength": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement",
          "accessed": "2026-11-15",
          "sourceSnippet": "Date of Interview June / July Duration 20 - 30 minutes"
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS3004 Construction and Environment JS3005 Engineering JS3006 Computer and Mathematical Sciences Aims To evaluate applicants' suitability for the Bachelor's Degree Scheme"
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS - Interview Arrangement"
          }
        ]
      },
      "polyu-architecture": {
        "id": "polyu-architecture",
        "university": "Hong Kong Polytechnic University",
        "subject": "Architectural Studies",
        "format": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=1",
          "accessed": "2026-11-15",
          "sourceSnippet": "Medium English Mode Individual / Group interview Remarks Selected Band A applicants will be required to submit a personal portfolio to showcase their design capabilities and attend aptitude tests and/or interviews."
        },
        "numberAndLength": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=1",
          "accessed": "2026-11-15",
          "sourceSnippet": "Date of Interview Before the announcement of HKDSE results. Duration About 20 minutes"
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=1",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS3214 Architectural Studies Aims Interviews will be conducted to gain a better understanding of applicants’ overall academic and non-academic qualities and achievements."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=1",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS - Interview Arrangement"
          }
        ]
      },
      "polyu-computing": {
        "id": "polyu-computing",
        "university": "Hong Kong Polytechnic University",
        "subject": "Computing and AI (BSc (Hons) Scheme)",
        "format": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=4",
          "accessed": "2026-11-15",
          "sourceSnippet": "Medium English Mode Group/Individual discussion Remarks Usually only Band A applicants will be invited to an interview."
        },
        "numberAndLength": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=4",
          "accessed": "2026-11-15",
          "sourceSnippet": "Date of Interview July Duration About 30 minutes"
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=4",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS3868 Computing and AI (Computer Science / Enterprise Information Systems) Aims 1. To understand the potential and interest of applicants to the Bachelor of Science (Honours) Scheme in Computing and AI. 2. To evaluate whether applicants’ expectations regarding the programme/career path match our objectives. 3. To assess applicants’ language and communication abilities."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=4",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS - Interview Arrangement"
          }
        ]
      },
      "polyu-nursing": {
        "id": "polyu-nursing",
        "university": "Hong Kong Polytechnic University",
        "subject": "Nursing",
        "format": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=3",
          "accessed": "2026-11-15",
          "sourceSnippet": "Medium Cantonese and English Mode Group interview Remarks Band A applicants will be considered for interview."
        },
        "numberAndLength": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=3",
          "accessed": "2026-11-15",
          "sourceSnippet": "Date of Interview Between May and August Duration About 1 hour"
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=3",
          "accessed": "2026-11-15",
          "sourceSnippet": "JS3648 Nursing Aims To evaluate the potential and interest of applicants in the programme, and to assess their language and communication skills and understanding of the nursing discipline."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=3",
            "accessed": "2026-11-15",
            "sourceSnippet": "JUPAS - Interview Arrangement"
          }
        ]
      },
      "cityu-cs": {
        "id": "cityu-cs",
        "university": "City University of Hong Kong",
        "subject": "Computer Science (BSc)",
        "format": {
          "source": "https://admission.cs.cityu.edu.hk/before-admission-jupas/jupas-interview",
          "accessed": "2026-11-15",
          "sourceSnippet": "Do JUPAS Applicants need to attend Admission Interviews ? Selected applicants may be invited for admission interview after the announcement of HKDSE examination results in late July ."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://admission.cs.cityu.edu.hk/before-admission-jupas/jupas-interview",
          "accessed": "2026-11-15",
          "sourceSnippet": "Purpose To identify students' motivation for taking our major; To let the students to know more about our major and To evaluate students' suitability for our major based on personal characters and non-academic performance."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS Applicants"
      },
      "cityu-business-marketing": {
        "id": "cityu-business-marketing",
        "university": "City University of Hong Kong",
        "subject": "Business Administration – Marketing major (BBA)",
        "format": {
          "source": "https://www.cb.cityu.edu.hk/MKT/bbamkt/admission/FAQ",
          "accessed": "2026-11-15",
          "sourceSnippet": "The JUPAS admission interview will be held in late June. It is conducted in English and is comprised of two sessions: a 15-mintue group interview and a 90-second self-introduction."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.cb.cityu.edu.hk/MKT/bbamkt/admission/FAQ",
          "accessed": "2026-11-15",
          "sourceSnippet": "Some common group discussion topics would be about current affairs and drawing up marketing plan on site in response to some topical issues, while some may come in forms of situational questions."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS"
      },
      "cityu-business-global-business": {
        "id": "cityu-business-global-business",
        "university": "City University of Hong Kong",
        "subject": "Business Administration – Global Business major (BBA)",
        "format": {
          "source": "https://prog.cb.cityu.edu.hk/academics/bbagbu/admissions",
          "accessed": "2026-11-15",
          "sourceSnippet": "An interview would be scheduled around June for shortlisted applicants only. All band A applicants will be invited to join the interview while students of other choices will be invited subject to availability of interview places."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "JUPAS applicants",
        "appliesToKey": "JUPAS",
        "appliesToEvidence": [
          {
            "source": "https://prog.cb.cityu.edu.hk/academics/bbagbu/admissions",
            "accessed": "2026-11-15",
            "sourceSnippet": "Do I need to attend JUPAS admission interview? An interview would be scheduled around June for shortlisted applicants only."
          }
        ]
      },
      "utoronto-engineering": {
        "id": "utoronto-engineering",
        "university": "University of Toronto",
        "subject": "Engineering (incl. Engineering Science)",
        "format": {
          "source": "https://discover.engineering.utoronto.ca/how-to-apply/supplemental-application/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The Personal Profile is comprised of three timed video responses that will help us get to know you as a person."
        },
        "numberAndLength": {
          "source": "https://discover.engineering.utoronto.ca/how-to-apply/faqs/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The Personal Profile is a component of the Engineering Supplemental Application that takes about 30 minutes to complete online. It consists of three randomly-selected, timed video questions."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://discover.engineering.utoronto.ca/how-to-apply/supplemental-application/",
          "accessed": "2026-11-15",
          "sourceSnippet": "We are interested in your reasoning and communication skills – keep in mind, there is no ‘right’ answer."
        },
        "prepAdvice": [
          {
            "source": "https://discover.engineering.utoronto.ca/how-to-apply/faqs/",
            "accessed": "2026-11-15",
            "sourceSnippet": "While no specific preparation is required, similar to preparing for a job interview, you may wish to reflect on your past experiences and your passion for Engineering. We also recommend that you practice getting familiar with the technology being used a few days in advance to avoid any last-minute issues."
          },
          {
            "source": "https://discover.engineering.utoronto.ca/how-to-apply/faqs/",
            "accessed": "2026-11-15",
            "sourceSnippet": "You will be able to complete the practice questions as many times as you would like before completing your assessment. Please do your best to be yourself — you will be assessed on the content of your answers."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "universityTerm": "Personal Profile"
      },
      "ubc-commerce": {
        "id": "ubc-commerce",
        "university": "University of British Columbia",
        "subject": "Commerce (BCom, Sauder)",
        "format": {
          "source": "https://you.ubc.ca/applying-ubc/how-to-apply/application/",
          "accessed": "2026-11-15",
          "sourceSnippet": "Bachelor of Commerce Video interview in personal profile"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "mcgill-medicine": {
        "id": "mcgill-medicine",
        "university": "McGill University",
        "subject": "Medicine (Med-P Qualifying Year leading to MDCM)",
        "format": {
          "source": "https://www.mcgill.ca/medadmissions/applying/selection-process/multiple-mini-interviews",
          "accessed": "2026-11-15",
          "sourceSnippet": "The interviews are in virtual multiple mini-interview (vMMI) format and are conducted virtually by the Faculty of Medicine and Health Sciences. These mini-interviews consist of multiple stations that can be task-oriented, simulation-oriented, scenario-oriented, or discussion-oriented."
        },
        "numberAndLength": {
          "source": "https://www.mcgill.ca/medadmissions/mdis",
          "accessed": "2026-11-15",
          "sourceSnippet": "The virtual MMI is divided into 2 separate Zoom meetings, with a break in between. The length of each zoom interview session is up to one hour."
        },
        "mmiStations": {
          "source": "https://www.mcgill.ca/medadmissions/mdis",
          "accessed": "2026-11-15",
          "sourceSnippet": "The M³I consists of a circuit of between 7 to 10 stations, which can be in any of the following formats: (a) discussion-based (with evaluator present) (b) task-oriented (with or without evaluator present) or (c) controlled scenarios or simulations (with evaluator observing from outside the room). Stations are 7 minutes long, (with the exception of 1 station whose duration is double the length)."
        },
        "whatIsAssessed": {
          "source": "https://www.mcgill.ca/medadmissions/applying/selection-process/multiple-mini-interviews",
          "accessed": "2026-11-15",
          "sourceSnippet": "Stations are designed to evaluate the various non-medical abilities targeted in the MDCM Program Learning Objectives which in turn references the CanMeds roles developped by the Royal College of Physicians and Surgeons of Canada. The MMIs can at times include themes that may be sensitive or personal for some candidates. Clinical skills are not tested."
        },
        "prepAdvice": [
          {
            "source": "https://www.mcgill.ca/medadmissions/mdis",
            "accessed": "2026-11-15",
            "sourceSnippet": "Preparation for the MMIs. It is unnecessary to pay for expensive training programs. We encourage you to be confident, and be yourself!"
          },
          {
            "source": "https://www.mcgill.ca/medadmissions/mdis",
            "accessed": "2026-11-15",
            "sourceSnippet": "A s with all interviews, you are encouraged to reflect on your skills and strengths. Consider resources like your university or community career centre to learn more about the MMI format."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "CEGEP students",
        "appliesToEvidence": [
          {
            "source": "https://www.mcgill.ca/medadmissions/programs/med-p",
            "accessed": "2026-11-15",
            "sourceSnippet": "This one-year Qualifying Year is designed exclusively for CEGEP students, and prepares you to excel in McGill’s MDCM medical program and go on to become a compassionate caregiver!"
          }
        ]
      },
      "mcgill-law": {
        "id": "mcgill-law",
        "university": "McGill University",
        "subject": "Law (BCL/JD, CEGEP/QFB applicant category)",
        "format": {
          "source": "https://www.mcgill.ca/law/bcl-jd/admissions-guide/admissions-policy",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interviews may be held in person at the Faculty of Law or via videoconference."
        },
        "numberAndLength": {
          "source": "https://www.mcgill.ca/law/bcl-jd/admissions-guide/admissions-policy",
          "accessed": "2026-11-15",
          "sourceSnippet": "Conducted by two professors, they are typically no longer than 25 minutes."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.mcgill.ca/law/bcl-jd/admissions-guide/admissions-policy",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interviewers engage with applicants to test their ability to articulate a position and their critical thinking skills. Interviewers typically use issues or experiences mentioned in the candidate’s application as a starting point. Particularly for CEGEP candidates, interviewers also assess maturity, readiness for our program, and reasons for studying law directly from CEGEP."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "CEGEP candidates"
      },
      "mcmaster-engineering-cs": {
        "id": "mcmaster-engineering-cs",
        "university": "McMaster University",
        "subject": "Engineering and Computer Science (Faculty of Engineering supplementary application)",
        "format": {
          "source": "https://www.eng.mcmaster.ca/supplementary-application/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The supplementary application consists of three video questions with a video-recorded response and one written question with a short answer response."
        },
        "numberAndLength": {
          "source": "https://www.eng.mcmaster.ca/supplementary-application/",
          "accessed": "2026-11-15",
          "sourceSnippet": "For each video question, you’ll have 10 seconds to prepare and 2 minutes to respond. For the written question, you’ll have 7 minutes total to read and respond."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.eng.mcmaster.ca/supplementary-application/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The Supplementary Application is designed to assess competencies that aren’t captured on a transcript, including engagement, collaboration, innovation & creativity, and resilience."
        },
        "prepAdvice": [
          {
            "source": "https://www.eng.mcmaster.ca/supplementary-application/",
            "accessed": "2026-11-15",
            "sourceSnippet": "You will not be asked any skill-testing or technical questions, nor will you be required to solve engineering or technical problems. Instead, the questions will be interview-style, giving you an opportunity to demonstrate how you think, communicate, reflect and respond to different situations."
          },
          {
            "source": "https://www.eng.mcmaster.ca/supplementary-application/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Structure your responses. Consider using a framework such as the S.T.A.R. method (Situation, Task, Action, Result) to organize your thoughts and communicate your experiences clearly. Practice speaking out loud."
          },
          {
            "source": "https://www.eng.mcmaster.ca/supplementary-application/",
            "accessed": "2026-11-15",
            "sourceSnippet": "You don’t need to memorize answers or try to present yourself in a certain way – just be yourself."
          }
        ],
        "sampleQuestions": [
          {
            "id": "mcmaster-engineering-cs#1",
            "subject": "Engineering / Computer Science (supplementary application practice question)",
            "publishedBy": "McMaster University",
            "source": "https://www.eng.mcmaster.ca/supplementary-application/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Think of an activity, role or responsibility you care about outside of the classroom. What have you learned from it, and how has it made a difference for others, like your teammates, friends or community?",
            "question": "Think of an activity, role or responsibility you care about outside of the classroom. What have you learned from it, and how has it made a difference for others, like your teammates, friends or community?"
          },
          {
            "id": "mcmaster-engineering-cs#2",
            "subject": "Engineering / Computer Science (supplementary application practice question)",
            "publishedBy": "McMaster University",
            "source": "https://www.eng.mcmaster.ca/supplementary-application/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Describe a situation where a group you were a part of faced a challenge or setback. How did you help the group move forward?",
            "question": "Describe a situation where a group you were a part of faced a challenge or setback. How did you help the group move forward?"
          },
          {
            "id": "mcmaster-engineering-cs#3",
            "subject": "Engineering / Computer Science (supplementary application practice question)",
            "publishedBy": "McMaster University",
            "source": "https://www.eng.mcmaster.ca/supplementary-application/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Tell us about a time when you tested an idea or solution to see if it would work. Explain how you chose your approach and what you learned from the experience.",
            "question": "Tell us about a time when you tested an idea or solution to see if it would work. Explain how you chose your approach and what you learned from the experience."
          },
          {
            "id": "mcmaster-engineering-cs#4",
            "subject": "Engineering / Computer Science (supplementary application practice question)",
            "publishedBy": "McMaster University",
            "source": "https://www.eng.mcmaster.ca/supplementary-application/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Tell us about a situation where something didn’t go according to plan. How did you respond and what did you learn from it?",
            "question": "Tell us about a situation where something didn’t go according to plan. How did you respond and what did you learn from it?"
          }
        ],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "universityTerm": "supplementary application"
      },
      "western-ivey-aeo": {
        "id": "western-ivey-aeo",
        "university": "Western University",
        "subject": "Business (Ivey HBA via Advanced Entry Opportunity)",
        "format": {
          "source": "https://www.ivey.uwo.ca/hba/admissions/secondary-school-students/",
          "accessed": "2026-11-15",
          "sourceSnippet": "All applicants are required to complete a short video interview through the Kira Talent platform. This component is mandatory and can be completed at any time before the application deadline — no scheduling is required."
        },
        "numberAndLength": {
          "source": "https://www.ivey.uwo.ca/hba/admissions/secondary-school-students/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The interview consists of five questions, each with preparation time and a timed response. The entire interview process typically takes 20 to 30 minutes to complete and must be completed in one sitting."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.ivey.uwo.ca/hba/admissions/secondary-school-students/",
          "accessed": "2026-11-15",
          "sourceSnippet": "This video interview component allows the admissions team to better understand your personality, communication skills, and experiences that may not be captured in the written portion of your application."
        },
        "prepAdvice": [
          {
            "source": "https://www.ivey.uwo.ca/hba/admissions/secondary-school-students/",
            "accessed": "2026-11-15",
            "sourceSnippet": "You may practice as many times as you like before starting the formal interview. Once you begin, all five questions must be completed in one attempt."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "queens-commerce": {
        "id": "queens-commerce",
        "university": "Queen's University",
        "subject": "Commerce (Smith BCom)",
        "format": {
          "source": "https://www.queensu.ca/admission/applying/supplementary-application",
          "accessed": "2026-11-15",
          "sourceSnippet": "The Supplementary Application is delivered through Kira Talent, a new platform with additional functionality to allow applicants to practice and prepare for the submission of their Supplementary Application."
        },
        "numberAndLength": {
          "source": "https://smith.queensu.ca/bcom/program-details/supplementary-application.php",
          "accessed": "2026-11-15",
          "sourceSnippet": "There are two video responses. For each question, you will have two minutes to think about your response, and then two minutes to answer. In these questions, you’ll be asked about your experiences, ideas, contributions, and growth."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://smith.queensu.ca/bcom/program-details/supplementary-application.php",
          "accessed": "2026-11-15",
          "sourceSnippet": "Beyond your strong academic foundations and comfort with both qualitative and quantitative subjects, we are looking for evidence of collaboration, initiative, impact, and a passion for business. Self-awareness is also important."
        },
        "prepAdvice": [
          {
            "source": "https://smith.queensu.ca/bcom/program-details/supplementary-application.php",
            "accessed": "2026-11-15",
            "sourceSnippet": "Review the instructions and practice. Take time to read the assessment instructions and try the practice questions. You may complete them as many times as you like before starting the formal assessment."
          },
          {
            "source": "https://smith.queensu.ca/bcom/program-details/supplementary-application.php",
            "accessed": "2026-11-15",
            "sourceSnippet": "Speak naturally. For video responses, speak clearly to the camera. Avoid reciting a script; we want to hear how you communicate and think."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "universityTerm": "Supplementary Application"
      },
      "york-schulich-bba": {
        "id": "york-schulich-bba",
        "university": "York University",
        "subject": "Business Administration (Schulich BBA)",
        "format": {
          "source": "https://schulich.yorku.ca/admissions/suppapp/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The supplementary application consists of six video interview questions and one timed written response exercise."
        },
        "numberAndLength": {
          "source": "https://schulich.yorku.ca/admissions/suppapp/",
          "accessed": "2026-11-15",
          "sourceSnippet": "For each video interview question, you will have: 45 seconds to prepare your response. 90 seconds to record your response."
        },
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [
          {
            "source": "https://schulich.yorku.ca/admissions/suppapp/",
            "accessed": "2026-11-15",
            "sourceSnippet": "All questions will be either behavioural or situational. Behavioural questions ask you to reflect on your past experiences, while situational questions ask how you would approach a particular scenario."
          },
          {
            "source": "https://schulich.yorku.ca/admissions/suppapp/",
            "accessed": "2026-11-15",
            "sourceSnippet": "We encourage you to draw on your own relevant experiences when answering the questions. Where appropriate, provide background or context to help explain your response."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "tcd-medicine": {
        "id": "tcd-medicine",
        "university": "Trinity College Dublin",
        "subject": "Medicine",
        "format": {
          "source": "https://www.tcd.ie/maturestudents/news/applicants-to-medicine/",
          "accessed": "2026-11-15",
          "sourceSnippet": "For mature applicants short-listing and interviews will take place."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "mature applicants"
      },
      "tcd-psychology-mature": {
        "id": "tcd-psychology-mature",
        "university": "Trinity College Dublin",
        "subject": "Psychology",
        "format": {
          "source": "https://www.tcd.ie/media/tcd/mature-students/pdfs/TCD-Mature-Student-Guidelines-2027.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "Psychology (TR006) Applicants must sit at an aptitude test in March/April 2027. This is a multi-choice quesionnaire to measure your aptitude for Psychology. It is not a general knowledge quiz and does not require preparation. Selection for interview will depend upon performance on the aptitude test(s)."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "mature applicants",
        "appliesToEvidence": [
          {
            "source": "https://www.tcd.ie/media/tcd/mature-students/pdfs/TCD-Mature-Student-Guidelines-2027.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "As the Mature Student Officer, my role is to offer advice and guidance to prospective mature applicants while supporting the integration and success of mature students in Trinity."
          }
        ]
      },
      "tcd-mature-all": {
        "id": "tcd-mature-all",
        "university": "Trinity College Dublin",
        "subject": "All courses (mature applicants only, where required for the subject)",
        "format": {
          "source": "https://www.tcd.ie/media/tcd/calendar/undergraduate-studies/admission-requirements.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interviews, where required for the applicants’ chosen subjects, will be arranged by the Academic Registry. Owing to the high demand for places in certain areas, not all applicants may be called for interview."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "mature applicants",
        "appliesToKey": "mature",
        "appliesToEvidence": [
          {
            "source": "https://www.tcd.ie/media/tcd/calendar/undergraduate-studies/admission-requirements.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "MATURE STUDENTS 19 At the discretion of the Senior Lecturer, E.U. applicants who will be twenty-three years on 1 January in the year of admission may be admitted as mature students without having the normal minimum entry qualifications."
          }
        ]
      },
      "nus-medicine": {
        "id": "nus-medicine",
        "university": "National University of Singapore",
        "subject": "Medicine",
        "format": {
          "source": "https://www.nus.edu.sg/oam/docs/default-source/international-baccalaureate/faqs-for-international-baccalaureate.pdf?sfvrsn=37e7aa40_37",
          "accessed": "2026-11-15",
          "sourceSnippet": "Applicants who apply for admission to Architecture, Landscape Architecture, Industrial Design, Dentistry, Law, Nursing and Medicine programmes are required to attend selection tests and/or interviews."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "nus-computing": {
        "id": "nus-computing",
        "university": "National University of Singapore",
        "subject": "Computer Science",
        "format": {
          "source": "https://www.comp.nus.edu.sg/admissions/?p=899",
          "accessed": "2026-11-15",
          "sourceSnippet": "The NUS Computing Aptitude-Based Admissions (ABA) scheme may include various processes, such as tests or individual or group interviews, depending on the specific department’s requirements."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [
          {
            "source": "https://www.comp.nus.edu.sg/admissions/?p=899",
            "accessed": "2026-11-15",
            "sourceSnippet": "The ABA interviews are designed to assess candidates in various ways, and each interviewer may pose different questions. The purpose of the interview is for you to showcase your strengths and convince us why you are an ideal candidate for our programmes. Consider what makes you stand out, how best to articulate those qualities, and provide evidence to support your claims. In essence, be yourself, be compelling, and demonstrate why you are remarkable."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "Aptitude-Based Admissions (ABA) scheme"
      },
      "nus-all": {
        "id": "nus-all",
        "university": "National University of Singapore",
        "subject": "All courses (faculty discretion)",
        "format": {
          "source": "https://www.nus.edu.sg/oam/docs/default-source/international-baccalaureate/faqs-for-international-baccalaureate.pdf?sfvrsn=37e7aa40_37",
          "accessed": "2026-11-15",
          "sourceSnippet": "As part of the University’s holistic assessment, some faculties might also require applicants to attend an interview for single/double/concurrent degree programmes. The shortlisted candidates will be informed to attend the interview(s)."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "some faculties"
      },
      "ntu-medicine": {
        "id": "ntu-medicine",
        "university": "Nanyang Technological University",
        "subject": "Medicine (LKCMedicine MBBS)",
        "format": {
          "source": "https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs",
          "accessed": "2026-11-15",
          "sourceSnippet": "This is conducted in eight (8) separate interview booths by faculty members, and professionals from various healthcare disciplines."
        },
        "numberAndLength": {
          "source": "https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs",
          "accessed": "2026-11-15",
          "sourceSnippet": "The MMI typically takes place at the Novena campus in Singapore. Shortlisted applicants will complete the physical MMI on the day itself, usually within two hours."
        },
        "mmiStations": {
          "source": "https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs",
          "accessed": "2026-11-15",
          "sourceSnippet": "Shortlisted applicants invited for the MMI will complete a series of eight (8) one-to-one interviews."
        },
        "whatIsAssessed": {
          "source": "https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs",
          "accessed": "2026-11-15",
          "sourceSnippet": "They are a series of interviews designed to evaluate the applicant’s aptitude and capability to successfully complete the MBBS programme. This includes one’s motivation and realistic approach to medicine as a career, capacity to deal with stress, evidence of leadership and team participation, ability to multi-task, communication skills, maturity of character, and likely contribution to medical school life."
        },
        "prepAdvice": [
          {
            "source": "https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs",
            "accessed": "2026-11-15",
            "sourceSnippet": "LKCMedicine does not recommend any preparatory course for the MMI. Like many other interviews, just be yourself. Be calm and listen carefully to the questions asked by the interviewers."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "ntu-aba-all": {
        "id": "ntu-aba-all",
        "university": "Nanyang Technological University",
        "subject": "All courses (Aptitude-based Admissions)",
        "format": {
          "source": "https://www.ntu.edu.sg/admissions/undergraduate/admissions/undergraduate/apply/aptitude-based-applications",
          "accessed": "2026-11-15",
          "sourceSnippet": "If you are shortlisted, we may invite you for an interview and ask for relevant supporting documents."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "aptitude-based admissions scheme",
        "appliesToEvidence": [
          {
            "source": "https://www.ntu.edu.sg/admissions/undergraduate/admissions/undergraduate/apply/aptitude-based-applications",
            "accessed": "2026-11-15",
            "sourceSnippet": "Applying to NTU via our aptitude-based admissions scheme"
          }
        ]
      },
      "sutd-all": {
        "id": "sutd-all",
        "university": "Singapore University of Technology & Design",
        "subject": "All courses",
        "format": {
          "source": "https://www.sutd.edu.sg/admissions/undergraduate/singapore-cambridge-gce-a-level/application-timeline/",
          "accessed": "2026-11-15",
          "sourceSnippet": "If selected, you will be notified (latest by end April) to attend an in-person or online conversation session with SUTD faculty/leader."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "universityTerm": "conversation session"
      },
      "bath-qualification-route-uk-cs-bath": {
        "id": "bath-qualification-route-uk-cs-bath",
        "university": "University of Bath",
        "subject": "Computer Science, Economics, Mechanical Engineering, Accounting & Finance",
        "format": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interviews take place virtually via Microsoft Teams."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The interview process is used to determine your suitability for the course you have applied for and to provide you with an opportunity to decide if our course is the right one for you."
        },
        "prepAdvice": [
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Think about what has motivated you to study the course and why you would like to study at the University of Bath Carefully consider what has really interested you during your current study and prepare some well thought out examples - which will help you evidence your enthusiasm and passion for your subject"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Familiarise yourself with the published course material and look at which modules may be of interest to you Be prepared to discuss anything you have included in your personal statement and expand on this during your interview"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "You will also be asked to answer some academic subject-specific questions relating to your course. Please do not get anxious if you are unsure of the answer straight away; you will be given time to work through the question and the Admissions Tutor will support you and want to see how you can apply your logic to work out the answer."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "studying certain qualifications, such as an Access to HE or T Level",
        "appliesToEvidence": [
          {
            "source": "https://www.bath.ac.uk/courses/undergraduate-2027/computer-science/bsc-computer-science/",
            "accessed": "2026-11-15",
            "sourceSnippet": "If you are studying certain qualifications, such as an Access to HE or T Level, you will be invited to attend an interview as part of our selection process."
          }
        ]
      },
      "bath-qualification-route-uk-economics-bath": {
        "id": "bath-qualification-route-uk-economics-bath",
        "university": "University of Bath",
        "subject": "Computer Science, Economics, Mechanical Engineering, Accounting & Finance",
        "format": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interviews take place virtually via Microsoft Teams."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The interview process is used to determine your suitability for the course you have applied for and to provide you with an opportunity to decide if our course is the right one for you."
        },
        "prepAdvice": [
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Think about what has motivated you to study the course and why you would like to study at the University of Bath Carefully consider what has really interested you during your current study and prepare some well thought out examples - which will help you evidence your enthusiasm and passion for your subject"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Familiarise yourself with the published course material and look at which modules may be of interest to you Be prepared to discuss anything you have included in your personal statement and expand on this during your interview"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "You will also be asked to answer some academic subject-specific questions relating to your course. Please do not get anxious if you are unsure of the answer straight away; you will be given time to work through the question and the Admissions Tutor will support you and want to see how you can apply your logic to work out the answer."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "studying certain qualifications, such as an Access to HE Diploma",
        "appliesToEvidence": [
          {
            "source": "https://www.bath.ac.uk/courses/undergraduate-2027/economics/bsc-economics/",
            "accessed": "2026-11-15",
            "sourceSnippet": "If you are studying certain qualifications, such as an Access to HE Diploma, you will be invited to attend an interview as part of our selection process."
          }
        ]
      },
      "bath-qualification-route-uk-engineering-bath": {
        "id": "bath-qualification-route-uk-engineering-bath",
        "university": "University of Bath",
        "subject": "Computer Science, Economics, Mechanical Engineering, Accounting & Finance",
        "format": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interviews take place virtually via Microsoft Teams."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The interview process is used to determine your suitability for the course you have applied for and to provide you with an opportunity to decide if our course is the right one for you."
        },
        "prepAdvice": [
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Think about what has motivated you to study the course and why you would like to study at the University of Bath Carefully consider what has really interested you during your current study and prepare some well thought out examples - which will help you evidence your enthusiasm and passion for your subject"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Familiarise yourself with the published course material and look at which modules may be of interest to you Be prepared to discuss anything you have included in your personal statement and expand on this during your interview"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "You will also be asked to answer some academic subject-specific questions relating to your course. Please do not get anxious if you are unsure of the answer straight away; you will be given time to work through the question and the Admissions Tutor will support you and want to see how you can apply your logic to work out the answer."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "studying certain qualifications, such as an Access to HE Diploma",
        "appliesToEvidence": [
          {
            "source": "https://www.bath.ac.uk/courses/undergraduate-2027/mechanical-engineering/beng-mechanical-engineering/",
            "accessed": "2026-11-15",
            "sourceSnippet": "If you are studying certain qualifications, such as an Access to HE Diploma, you will be invited to attend an interview as part of our selection process."
          }
        ]
      },
      "bath-qualification-route-uk-accounting-bath": {
        "id": "bath-qualification-route-uk-accounting-bath",
        "university": "University of Bath",
        "subject": "Computer Science, Economics, Mechanical Engineering, Accounting & Finance",
        "format": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interviews take place virtually via Microsoft Teams."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The interview process is used to determine your suitability for the course you have applied for and to provide you with an opportunity to decide if our course is the right one for you."
        },
        "prepAdvice": [
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Think about what has motivated you to study the course and why you would like to study at the University of Bath Carefully consider what has really interested you during your current study and prepare some well thought out examples - which will help you evidence your enthusiasm and passion for your subject"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Familiarise yourself with the published course material and look at which modules may be of interest to you Be prepared to discuss anything you have included in your personal statement and expand on this during your interview"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "You will also be asked to answer some academic subject-specific questions relating to your course. Please do not get anxious if you are unsure of the answer straight away; you will be given time to work through the question and the Admissions Tutor will support you and want to see how you can apply your logic to work out the answer."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "studying certain qualifications, such as an Access to HE Diploma or T Level",
        "appliesToEvidence": [
          {
            "source": "https://www.bath.ac.uk/courses/undergraduate-2027/accounting-and-finance/bsc-accounting-and-finance/",
            "accessed": "2026-11-15",
            "sourceSnippet": "If you are studying certain qualifications, such as an Access to HE Diploma or T Level, you will be invited to attend an interview as part of our selection process."
          }
        ]
      },
      "bath-mathematics": {
        "id": "bath-mathematics",
        "university": "University of Bath",
        "subject": "Mathematics",
        "format": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interviews take place virtually via Microsoft Teams."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The interview process is used to determine your suitability for the course you have applied for and to provide you with an opportunity to decide if our course is the right one for you."
        },
        "prepAdvice": [
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Think about what has motivated you to study the course and why you would like to study at the University of Bath Carefully consider what has really interested you during your current study and prepare some well thought out examples - which will help you evidence your enthusiasm and passion for your subject"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Familiarise yourself with the published course material and look at which modules may be of interest to you Be prepared to discuss anything you have included in your personal statement and expand on this during your interview"
          },
          {
            "source": "https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/",
            "accessed": "2026-11-15",
            "sourceSnippet": "You will also be asked to answer some academic subject-specific questions relating to your course. Please do not get anxious if you are unsure of the answer straight away; you will be given time to work through the question and the Admissions Tutor will support you and want to see how you can apply your logic to work out the answer."
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "Very exceptionally we may invite you to an interview if you have circumstances we cannot assess from an application alone",
        "appliesToEvidence": [
          {
            "source": "https://www.bath.ac.uk/courses/undergraduate-2027/mathematical-sciences/bsc-mathematics/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Very exceptionally we may invite you to an interview if you have circumstances we cannot assess from an application alone."
          }
        ]
      },
      "glasgow-year2-entry": {
        "id": "glasgow-year2-entry",
        "university": "University of Glasgow",
        "subject": "Year 2 (advanced) entry, any subject",
        "format": {
          "source": "https://www.gla.ac.uk/undergraduate/how-to-apply-for-an-undergraduate-degree/entry-requirements/admissions-guidance/",
          "accessed": "2026-11-15",
          "sourceSnippet": "An interview will be part of the selection process for: Community Development Dentistry Medicine Nursing Teaching Veterinary Medicine & Surgery You may also be interviewed if you’re applying for entry into Year 2 in any subject."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "entry into Year 2 in any subject"
      },
      "berkeley-business": {
        "id": "berkeley-business",
        "university": "UC Berkeley",
        "subject": "Business Administration (Haas)",
        "format": {
          "source": "https://haas.berkeley.edu/undergrad/admissions/faq/",
          "accessed": "2026-11-15",
          "sourceSnippet": "The video interview is not the traditional face-to-face interview. Instead, you will record yourself answering the set of questions. All applicants will have 6 minutes to record a response."
        },
        "numberAndLength": {
          "source": "https://haas.berkeley.edu/undergrad/admissions/faq/",
          "accessed": "2026-11-15",
          "sourceSnippet": "All applicants will have several attempts to record their video interview. You have as much time as you need between attempts. You may log out and reattempt. You do not get to record all attempts and then decide which attempt to submit."
        },
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://haasug.berkeley.edu/apply/VideoInterviewGuide2026.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "Authenticity, intellectual curiosity, leadership potential, integrity, and ability to convey your story."
        },
        "prepAdvice": [
          {
            "source": "https://haasug.berkeley.edu/apply/VideoInterviewGuide2026.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "Time management: It is recommended to budget around a minute and a half per question."
          },
          {
            "source": "https://haasug.berkeley.edu/apply/VideoInterviewGuide2026.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "Practice telling your story out loud."
          },
          {
            "source": "https://haas.berkeley.edu/undergrad/admissions/faq/",
            "accessed": "2026-11-15",
            "sourceSnippet": "The same question set will be asked of all applicants. The questions will appear in the same order in each of your attempts. You may use notes if that helps you feel prepared but please do not read from a script"
          }
        ],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null
      },
      "michigan-engineering": {
        "id": "michigan-engineering",
        "university": "University of Michigan",
        "subject": "College of Engineering",
        "format": {
          "source": "https://obp.umich.edu/wp-content/uploads/pubdata/cds/cds_2025-26_umaa.pdf",
          "accessed": "2026-11-15",
          "sourceSnippet": "Some applicants to Music, Theatre and Dance and some applicants to the College of Engineering may be interviewed."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "some applicants to the College of Engineering"
      },
      "unc-business": {
        "id": "unc-business",
        "university": "UNC Chapel Hill",
        "subject": "Business Administration (Kenan-Flagler Undergraduate Business Program)",
        "format": {
          "source": "https://www.kenan-flagler.unc.edu/programs/undergraduate-business/admissions/apply",
          "accessed": "2026-11-15",
          "sourceSnippet": "If you are an admitted transfer student or current UNC student who has completed your first year, you are encouraged to apply to the Undergraduate Business Program. Application requirements Adequate progress in the program prerequisites Resume Essays Short-answer questionnaire Video interview"
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "yes",
        "timing": null,
        "appliesTo": "admitted transfer student or current UNC student who has completed your first year"
      },
      "caltech-third-party": {
        "id": "caltech-third-party",
        "university": "Caltech",
        "subject": "All listed courses",
        "format": {
          "source": "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
          "accessed": "2026-11-15",
          "sourceSnippet": "InitialView unscripted conversations and writing samples are recorded and give Admissions Officers insight into how you communicate and think."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
          "accessed": "2026-11-15",
          "sourceSnippet": "At Caltech, you will be called upon regularly to engage with leading professors and classmates who will challenge you. As a result, international students are encouraged to provide us with an InitialView conversation and writing sample."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "thirdPartyOnly": "InitialView",
        "statement": [
          {
            "source": "https://www.admissions.caltech.edu/apply/first-year-applicants/supplemental-application-essays/essay-writing-advice",
            "accessed": "2026-11-15",
            "sourceSnippet": "We don't have an interview process at Caltech, so our supplemental essays are where you are speaking directly to us."
          }
        ]
      },
      "carnegie-mellon-university-third-party": {
        "id": "carnegie-mellon-university-third-party",
        "university": "Carnegie Mellon University",
        "subject": "All listed courses",
        "format": {
          "source": "https://www.cmu.edu/admission/admission/international-applicants",
          "accessed": "2026-11-15",
          "sourceSnippet": "InitialView or Vericant interviews are recommended for nonnative English speakers but aren't required."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://www.cmu.edu/admission/admission/international-applicants",
          "accessed": "2026-11-15",
          "sourceSnippet": "Often these interviews can measure readiness for engagement in the classroom and also showcase a student’s personality, likes and dislikes as well as the area of intended major. These interviews can also show English language proficiency while also corroborating the application with more details about the student."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "thirdPartyOnly": "InitialView or Vericant",
        "statement": [
          {
            "source": "https://www.cmu.edu/admission/admission/application-and-financial-aid-support/common-admission-terms",
            "accessed": "2026-11-15",
            "sourceSnippet": "Interviews are rarely required. Carnegie Mellon does not offer interviews."
          }
        ]
      },
      "uc-berkeley-third-party": {
        "id": "uc-berkeley-third-party",
        "university": "UC Berkeley",
        "subject": "All listed courses",
        "format": {
          "source": "https://admissions.berkeley.edu/requirements-for-international-students/",
          "accessed": "2026-11-15",
          "sourceSnippet": "As part of our holistic review however, we will accept InitialView materials for international applicants who are choosing to participate in an InitialView interview as a part of their application journey. If you would like to submit InitialView materials as part of your application, please ensure that they are sent to us by November 30th."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "thirdPartyOnly": "InitialView",
        "statement": [
          {
            "source": "https://admissions.berkeley.edu/apply-to-berkeley/application-resources/application-tips/",
            "accessed": "2026-11-15",
            "sourceSnippet": "UC Berkeley does not conduct interviews in the admissions process. The application is the only information we will have to assess your strengths."
          },
          {
            "source": "https://admissions.berkeley.edu/requirements-for-international-students/",
            "accessed": "2026-11-15",
            "sourceSnippet": "UC Berkeley does not offer alumni or admissions officer interviews as part of its application process."
          }
        ]
      },
      "northwestern-university-third-party": {
        "id": "northwestern-university-third-party",
        "university": "Northwestern University",
        "subject": "All listed courses",
        "format": {
          "source": "https://admissions.northwestern.edu/apply/requirements.html",
          "accessed": "2026-11-15",
          "sourceSnippet": "InitialView does not review or rate the interviews. Evaluation is done only by members of the admissions committee and provides an additional source of information and perspective about your English language proficiency, personal qualities, academic interests, and potential fit for Northwestern."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "thirdPartyOnly": "InitialView",
        "statement": [
          {
            "source": "https://admissions.northwestern.edu/apply/requirements.html",
            "accessed": "2026-11-15",
            "sourceSnippet": "Northwestern no longer offers alumni interviews as an optional part of the application process."
          },
          {
            "source": "https://admissions.northwestern.edu/apply/requirements.html",
            "accessed": "2026-11-15",
            "sourceSnippet": "While our application volume is such that we cannot offer interviews, students applying from US high schools are welcome to record a Glimpse video if you wish to add a more candid voice to your application."
          }
        ]
      },
      "brown-university-third-party": {
        "id": "brown-university-third-party",
        "university": "Brown University",
        "subject": "All listed courses",
        "format": {
          "source": "https://admission.brown.edu/first-year/video-portfolio-alumni-interview",
          "accessed": "2026-11-15",
          "sourceSnippet": "InitialView is an interview-based video platform that allows students to record a video interview with a certified InitialView interviewer and have it uploaded and sent to any institution that you intend to apply to. These interviews are unscripted and will provide colleges with an authentic view into who you are as a student and a person."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "thirdPartyOnly": "InitialView",
        "statement": [
          {
            "source": "https://admission.brown.edu/ask/admission-process",
            "accessed": "2026-11-15",
            "sourceSnippet": "Does Brown offer alumni interviews? As of the 2019-20 academic year, Brown's admission process no longer includes alumni interviews."
          }
        ]
      },
      "vanderbilt-university-third-party": {
        "id": "vanderbilt-university-third-party",
        "university": "Vanderbilt University",
        "subject": "All listed courses",
        "format": {
          "source": "https://admissions.vanderbilt.edu/apply/first-year-process/",
          "accessed": "2026-11-15",
          "sourceSnippet": "Students attending high school internationally or non-U.S. citizens attending high school in the U.S. may schedule a video interview with InitialView ."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "thirdPartyOnly": "InitialView",
        "statement": [
          {
            "source": "https://admissions.vanderbilt.edu/apply/first-year-process/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Are interviews required for applicants? Vanderbilt does not offer interviews through the Office of Undergraduate Admissions."
          },
          {
            "source": "https://admissions.vanderbilt.edu/apply/first-year-process/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Through partnerships with Glimpse and InitialView, Vanderbilt offers optional video submission opportunities for applicants."
          }
        ]
      },
      "washington-university-in-st-louis-third-party": {
        "id": "washington-university-in-st-louis-third-party",
        "university": "Washington University in St. Louis",
        "subject": "All listed courses",
        "format": {
          "source": "https://admissions.washu.edu/?p=556",
          "accessed": "2026-11-15",
          "sourceSnippet": "If you are an international student interested in submitting an interview to WashU, we will accept admissions interviews from InitialView or Vericant."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://admissions.washu.edu/how-to-apply/english-testing-requirements/",
          "accessed": "2026-11-15",
          "sourceSnippet": "While WashU does not conduct nor offer evaluative interviews for admission, students are strongly encouraged to submit third-party interview supplements, such as InitialView , to further demonstrate their English proficiency."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "thirdPartyOnly": "InitialView or Vericant",
        "statement": [
          {
            "source": "https://admissions.washu.edu/how-to-apply/english-testing-requirements/",
            "accessed": "2026-11-15",
            "sourceSnippet": "While WashU does not conduct nor offer evaluative interviews for admission, students are strongly encouraged to submit third-party interview supplements, such as InitialView , to further demonstrate their English proficiency."
          },
          {
            "source": "https://admissions.washu.edu/how-to-apply/english-testing-requirements/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Students who choose not to submit an interview supplement will not be disadvantaged in our review process."
          }
        ]
      },
      "georgia-tech-third-party": {
        "id": "georgia-tech-third-party",
        "university": "Georgia Tech",
        "subject": "All listed courses",
        "format": {
          "source": "https://admission.gatech.edu/first-year/interview",
          "accessed": "2026-11-15",
          "sourceSnippet": "Interview providers include InitialView and Vericant . Interviews must be completed and submitted by the document deadline for your application plan."
        },
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": {
          "source": "https://admission.gatech.edu/first-year/interview",
          "accessed": "2026-11-15",
          "sourceSnippet": "Applicants who are non-native English speakers have the option to participate in a third-party, unscripted interview. Interviewing in this format allows you the opportunity to personally discuss your academic and extracurricular background while also demonstrating your English language ability and communication skills."
        },
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "thirdPartyOnly": "InitialView and Vericant",
        "statement": [
          {
            "source": "https://admission.gatech.edu/first-year/interview",
            "accessed": "2026-11-15",
            "sourceSnippet": "We do not conduct alumni or admission staff interviews."
          }
        ]
      },
      "simon-fraser-university-no-1": {
        "id": "simon-fraser-university-no-1",
        "university": "Simon Fraser University",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.sfu.ca/students/admission/programs/a-z/b/business/apply.html",
            "accessed": "2026-11-15",
            "sourceSnippet": "The Supplemental Application includes: A written, short answer response An explanation of the activities you've engaged in and achievements you've accomplished within the last 4 years Two video interview responses (transfer students only) Two references with one being academic in nature (teacher or counsellor for high school students, instructor or professor for transfer students)."
          }
        ]
      },
      "concordia-university-no-1": {
        "id": "concordia-university-no-1",
        "university": "Concordia University",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.concordia.ca/jmsb/programs/undergraduate/bachelor/admissions.html",
            "accessed": "2026-11-15",
            "sourceSnippet": "No, you are not required to submit letters of reference or letters of intent when apply to undergraduate programs at the John Molson School of Business. Admission to John Molson is strictly based on previous academic performance"
          }
        ]
      },
      "london-school-of-economics-no-1": {
        "id": "london-school-of-economics-no-1",
        "university": "London School of Economics",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply",
            "accessed": "2026-11-15",
            "sourceSnippet": "We do not interview applicants for any of our programmes at LSE. It is not possible for applicants to request an interview with the Admissions Selector."
          }
        ]
      },
      "university-of-edinburgh-no-1": {
        "id": "university-of-edinburgh-no-1",
        "university": "University of Edinburgh",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios",
            "accessed": "2026-11-15",
            "sourceSnippet": "You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews. We do not interview for entry to any other degree programmes."
          }
        ]
      },
      "university-of-manchester-no-1": {
        "id": "university-of-manchester-no-1",
        "university": "University of Manchester",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.manchester.ac.uk/study/undergraduate/courses/2027/10224/bsc-economics/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Interview requirements We do not interview."
          }
        ]
      },
      "university-of-manchester-no-2": {
        "id": "university-of-manchester-no-2",
        "university": "University of Manchester",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.manchester.ac.uk/study/undergraduate/courses/2027/03921/meng-mechanical-engineering/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Interview requirements We do not hold interviews but applicants who receive an offer may be invited to a virtual webinar or an on-campus offer holder day which generally take place on Wednesday afternoons from February to April."
          }
        ]
      },
      "university-of-manchester-no-3": {
        "id": "university-of-manchester-no-3",
        "university": "University of Manchester",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.manchester.ac.uk/study/undergraduate/courses/2027/03520/bsc-management-accounting-and-finance/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Interview requirements We do not as a rule interview applicants. However, we reserve the right to interview candidates with non-standard backgrounds, eg. Mature students and students aged under 17."
          }
        ]
      },
      "university-of-manchester-no-4": {
        "id": "university-of-manchester-no-4",
        "university": "University of Manchester",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.manchester.ac.uk/study/undergraduate/courses/2027/00590/bsc-mathematics/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Interview requirements We will not be holding interviews for September 2027 entry."
          }
        ]
      },
      "university-of-warwick-no-1": {
        "id": "university-of-warwick-no-1",
        "university": "University of Warwick",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://warwick.ac.uk/study/undergraduate/courses/bsc-economics/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference."
          }
        ]
      },
      "university-of-warwick-no-2": {
        "id": "university-of-warwick-no-2",
        "university": "University of Warwick",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://warwick.ac.uk/study/undergraduate/courses/bsc-mathematics/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference."
          }
        ]
      },
      "university-of-warwick-no-3": {
        "id": "university-of-warwick-no-3",
        "university": "University of Warwick",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://warwick.ac.uk/study/undergraduate/courses/bsc-computer-science/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference."
          }
        ]
      },
      "university-of-warwick-no-4": {
        "id": "university-of-warwick-no-4",
        "university": "University of Warwick",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://warwick.ac.uk/study/undergraduate/courses/llb-law/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference."
          }
        ]
      },
      "university-of-warwick-no-5": {
        "id": "university-of-warwick-no-5",
        "university": "University of Warwick",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://warwick.ac.uk/study/undergraduate/courses/bsc-accounting-finance/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference."
          }
        ]
      },
      "university-of-warwick-no-6": {
        "id": "university-of-warwick-no-6",
        "university": "University of Warwick",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://warwick.ac.uk/study/undergraduate/courses/meng-engineering/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference."
          }
        ]
      },
      "university-of-bristol-no-1": {
        "id": "university-of-bristol-no-1",
        "university": "University of Bristol",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/maths.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone."
          }
        ]
      },
      "university-of-bristol-no-2": {
        "id": "university-of-bristol-no-2",
        "university": "University of Bristol",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/computer-science.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone."
          }
        ]
      },
      "university-of-bristol-no-3": {
        "id": "university-of-bristol-no-3",
        "university": "University of Bristol",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/economics.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone."
          }
        ]
      },
      "university-of-bristol-no-4": {
        "id": "university-of-bristol-no-4",
        "university": "University of Bristol",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/mechanical-engineering.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone."
          }
        ]
      },
      "university-of-bristol-no-5": {
        "id": "university-of-bristol-no-5",
        "university": "University of Bristol",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/law.pdf",
            "accessed": "2026-11-15",
            "sourceSnippet": "1.4 Interviews For these courses, applicants are not routinely interviewed. In most cases, admissions decisions will be made on the basis of the application information alone."
          }
        ]
      },
      "university-of-st-andrews-no-1": {
        "id": "university-of-st-andrews-no-1",
        "university": "University of St Andrews",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.st-andrews.ac.uk/study/undergraduate/apply/after/",
            "accessed": "2026-11-15",
            "sourceSnippet": "We also rely heavily on your personal statement and referee's report as the University does not interview for most undergraduate programmes. Applicants for Medicine , our Supported Pathways programmes, BA International Honours and some part-time courses may be invited to an interview."
          }
        ]
      },
      "university-of-st-andrews-no-2": {
        "id": "university-of-st-andrews-no-2",
        "university": "University of St Andrews",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.st-andrews.ac.uk/subjects/entry/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Most students who apply to the University for undergraduate study will not be required to attend an interview. The exceptions to this will be if you are applying for: Medicine Supported pathway programmes Part-time study"
          }
        ]
      },
      "university-of-leeds-no-1": {
        "id": "university-of-leeds-no-1",
        "university": "University of Leeds",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://eps.leeds.ac.uk/faculty-engineering-physical-sciences/doc/admissions-courses-faculty-engineering-physical-sciences-4",
            "accessed": "2026-11-15",
            "sourceSnippet": "Interviews Interviews do not form part of our standard admissions process; however, in some cases, an applicant may be invited for an interview if it will help inform whether an offer should be made."
          }
        ]
      },
      "university-of-leeds-no-2": {
        "id": "university-of-leeds-no-2",
        "university": "University of Leeds",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://essl.leeds.ac.uk/education-social-sciences-law/doc/admissions-guidance-courses-faculty-social-sciences",
            "accessed": "2026-11-15",
            "sourceSnippet": "For all other programmes in the Faculty of Social Sciences interviews do not form part of our standard admissions process; however, in some cases, an applicant may be invited for an interview if it will help inform whether an offer should be made."
          }
        ]
      },
      "university-of-leeds-no-3": {
        "id": "university-of-leeds-no-3",
        "university": "University of Leeds",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://business.leeds.ac.uk/faculty/doc/apply-7",
            "accessed": "2026-11-15",
            "sourceSnippet": "Will I be invited to an interview? Interviews do not form part of our standard admissions process; however, some applicants, such as mature students, may be invited for an interview and asked to provide an example of academic writing to help inform whether an offer should be made."
          }
        ]
      },
      "university-of-nottingham-no-1": {
        "id": "university-of-nottingham-no-1",
        "university": "University of Nottingham",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.nottingham.ac.uk/law/study/undergraduate/faqs.aspx",
            "accessed": "2026-11-15",
            "sourceSnippet": "Do you hold interviews? We do not normally include an interview as part of the admissions process."
          }
        ]
      },
      "columbia-university-no-1": {
        "id": "columbia-university-no-1",
        "university": "Columbia University",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://arc.undergrad.admissions.columbia.edu/",
            "accessed": "2026-11-15",
            "sourceSnippet": "After careful consideration, Columbia College and the Fu Foundation School of Engineering and Applied Science have decided to discontinue their alumni interview program for individuals seeking admission. The decision, which takes effect this fall for the 2023-2024 admissions cycle, was made to ensure that all candidates have the same opportunity to connect with and learn about Columbia through the application process."
          }
        ]
      },
      "johns-hopkins-university-no-1": {
        "id": "johns-hopkins-university-no-1",
        "university": "Johns Hopkins University",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://apply.jhu.edu/frequently-asked-questions/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Can I interview as part of the admissions process? Open Close No, we do not offer interviews as part of our admissions process and are unable to grant meeting requests."
          }
        ]
      },
      "cornell-university-no-1": {
        "id": "cornell-university-no-1",
        "university": "Cornell University",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://admissions.cornell.edu/how-to-apply/first-year-applicants/questbridge-applicants",
            "accessed": "2026-11-15",
            "sourceSnippet": "Are interviews required for QuestBridge finalists? Personal interviews are not available for applicants to any of Cornell's undergraduate programs."
          }
        ]
      },
      "ucla-no-1": {
        "id": "ucla-no-1",
        "university": "UCLA",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://admission.ucla.edu/apply/first-year/first-year-requirements",
            "accessed": "2026-11-15",
            "sourceSnippet": "Do you offer admission interviews? We do not offer admission interviews. Applicants are considered for admission based upon the information they submit in the UC application ."
          }
        ]
      },
      "university-of-southern-california-no-1": {
        "id": "university-of-southern-california-no-1",
        "university": "University of Southern California",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/",
            "accessed": "2026-11-15",
            "sourceSnippet": "The Office of Undergraduate Admission does not conduct admission interviews, nor do we track any form of demonstrated interest in our process. Some schools may conduct interviews as a part of their additional requirements ."
          }
        ]
      },
      "university-of-southern-california-no-2": {
        "id": "university-of-southern-california-no-2",
        "university": "University of Southern California",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/",
            "accessed": "2026-11-15",
            "sourceSnippet": "Iovine and Young Academy for Arts, Technology and the Business of Innovation USC School of Architecture Roski School of Art and Design USC School of Cinematic Arts Kaufman School of Dance USC School of Dramatic Arts Thornton School of Music Marshall School of Business (World Bachelor in Business)"
          }
        ]
      },
      "university-of-virginia-no-1": {
        "id": "university-of-virginia-no-1",
        "university": "University of Virginia",
        "subject": "Courses named in the statement",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": false,
        "interviewed": "no",
        "timing": null,
        "statement": [
          {
            "source": "https://www.commerce.virginia.edu/undergrad/faqs",
            "accessed": "2026-11-15",
            "sourceSnippet": "Is an interview required for admission? No."
          }
        ]
      },
      "university-of-hong-kong-manual-review": {
        "id": "university-of-hong-kong-manual-review",
        "university": "University of Hong Kong",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "university-of-waterloo-manual-review": {
        "id": "university-of-waterloo-manual-review",
        "university": "University of Waterloo",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "emory-university-manual-review": {
        "id": "emory-university-manual-review",
        "university": "Emory University",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "mcmaster-university-manual-review": {
        "id": "mcmaster-university-manual-review",
        "university": "McMaster University",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "university-of-notre-dame-manual-review": {
        "id": "university-of-notre-dame-manual-review",
        "university": "University of Notre Dame",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "city-university-of-hong-kong-manual-review": {
        "id": "city-university-of-hong-kong-manual-review",
        "university": "City University of Hong Kong",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "university-of-alberta-manual-review": {
        "id": "university-of-alberta-manual-review",
        "university": "University of Alberta",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "singapore-management-university-manual-review": {
        "id": "singapore-management-university-manual-review",
        "university": "Singapore Management University",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "university-college-london-manual-review": {
        "id": "university-college-london-manual-review",
        "university": "University College London",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "durham-university-manual-review": {
        "id": "durham-university-manual-review",
        "university": "Durham University",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "new-york-university-manual-review": {
        "id": "new-york-university-manual-review",
        "university": "New York University",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "university-of-virginia-manual-review": {
        "id": "university-of-virginia-manual-review",
        "university": "University of Virginia",
        "subject": "Courses on the manual-review list",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      },
      "hkust-science-maths": {
        "id": "hkust-science-maths",
        "university": "HKUST",
        "subject": "Courses with nothing published",
        "format": null,
        "numberAndLength": null,
        "mmiStations": null,
        "whatIsAssessed": null,
        "prepAdvice": [],
        "sampleQuestions": [],
        "unavailable": true,
        "interviewed": "not published",
        "timing": null
      }
    },
    "courses": {
      "uk-cs-oxford": [
        "oxford-computer-science"
      ],
      "uk-maths-oxford": [
        "oxford-mathematics"
      ],
      "uk-engineering-oxford": [
        "oxford-engineering"
      ],
      "uk-physics-oxford": [
        "oxford-physics"
      ],
      "uk-biochemistry-oxford": [
        "oxford-biochemistry"
      ],
      "uk-ppe-oxford": [
        "oxford-ppe"
      ],
      "uk-history-oxford": [
        "oxford-history"
      ],
      "uk-law-oxford": [
        "oxford-law"
      ],
      "uk-economics-oxford": [
        "oxford-economics-management"
      ],
      "uk-medicine-oxford": [
        "oxford-medicine"
      ],
      "uk-medicine-cambridge": [
        "cambridge-medicine",
        "cambridge-all-courses"
      ],
      "uk-cs-cambridge": [
        "cambridge-computer-science",
        "cambridge-all-courses"
      ],
      "uk-maths-cambridge": [
        "cambridge-mathematics",
        "cambridge-all-courses"
      ],
      "uk-naturalsciences-cambridge": [
        "cambridge-natural-sciences",
        "cambridge-all-courses"
      ],
      "uk-engineering-cambridge": [
        "cambridge-engineering",
        "cambridge-all-courses"
      ],
      "uk-economics-cambridge": [
        "cambridge-all-courses"
      ],
      "uk-law-cambridge": [
        "cambridge-all-courses"
      ],
      "uk-medicine-imperial": [
        "imperial-medicine"
      ],
      "uk-cs-imperial": [
        "imperial-cs"
      ],
      "uk-electrical-imperial": [
        "imperial-electrical"
      ],
      "uk-mechanical-imperial": [
        "imperial-mechanical"
      ],
      "uk-chemical-imperial": [
        "imperial-chemical"
      ],
      "uk-physics-imperial": [
        "imperial-physics"
      ],
      "uk-maths-imperial": [
        "imperial-maths"
      ],
      "uk-bioengineering-imperial": [
        "imperial-bioengineering"
      ],
      "uk-medicine-kcl": [
        "kcl-medicine"
      ],
      "uk-nursing-kcl": [
        "kcl-nursing"
      ],
      "uk-medicine-ucl": [
        "ucl-medicine"
      ],
      "uk-architecture-ucl": [
        "ucl-architecture"
      ],
      "uk-pharmacy-ucl": [
        "ucl-pharmacy"
      ],
      "uk-law-ucl": [
        "ucl-law"
      ],
      "uk-medicine-birmingham": [
        "birmingham-medicine"
      ],
      "uk-medicine-bristol": [
        "bristol-medicine"
      ],
      "uk-medicine-edinburgh": [
        "edinburgh-medicine"
      ],
      "uk-medicine-glasgow": [
        "glasgow-medicine"
      ],
      "uk-medicine-leeds": [
        "leeds-medicine"
      ],
      "uk-medicine-manchester": [
        "manchester-medicine"
      ],
      "uk-medicine-nottingham": [
        "nottingham-medicine"
      ],
      "uk-medicine-standrews": [
        "st-andrews-medicine"
      ],
      "uk-pharmacy-bath": [
        "bath-pharmacy"
      ],
      "uk-pharmacy-nottingham": [
        "nottingham-pharmacy"
      ],
      "uk-psychology-manchester": [
        "manchester-psychology"
      ],
      "sg-law-nus": [
        "nus-law"
      ],
      "es-cs-ie": [
        "ie-university"
      ],
      "es-maths-ie": [
        "ie-university"
      ],
      "es-economics-ie": [
        "ie-university"
      ],
      "es-law-ie": [
        "ie-university"
      ],
      "es-business-ie": [
        "ie-university"
      ],
      "es-architecture-ie": [
        "ie-university"
      ],
      "us-cs-yale": [
        "yale"
      ],
      "us-economics-yale": [
        "yale"
      ],
      "us-law-yale": [
        "yale"
      ],
      "us-biology-yale": [
        "yale"
      ],
      "us-cs-stanford": [
        "stanford"
      ],
      "us-engineering-stanford": [
        "stanford"
      ],
      "us-economics-stanford": [
        "stanford"
      ],
      "us-maths-stanford": [
        "stanford"
      ],
      "us-psychology-stanford": [
        "stanford"
      ],
      "us-cs-duke": [
        "duke"
      ],
      "us-maths-duke": [
        "duke"
      ],
      "us-economics-duke": [
        "duke"
      ],
      "us-cs-mit": [
        "mit"
      ],
      "us-engineering-mit": [
        "mit"
      ],
      "us-mechanical-mit": [
        "mit"
      ],
      "us-physics-mit": [
        "mit"
      ],
      "us-economics-mit": [
        "mit"
      ],
      "us-maths-mit": [
        "mit"
      ],
      "us-cs-harvard": [
        "harvard"
      ],
      "us-economics-harvard": [
        "harvard"
      ],
      "us-law-harvard": [
        "harvard"
      ],
      "us-biology-harvard": [
        "harvard"
      ],
      "us-maths-harvard": [
        "harvard"
      ],
      "us-cs-dartmouth": [
        "dartmouth"
      ],
      "us-economics-dartmouth": [
        "dartmouth"
      ],
      "us-cs-princeton": [
        "princeton"
      ],
      "us-engineering-princeton": [
        "princeton"
      ],
      "us-economics-princeton": [
        "princeton"
      ],
      "us-maths-princeton": [
        "princeton"
      ],
      "us-cs-rice": [
        "rice"
      ],
      "us-engineering-rice": [
        "rice"
      ],
      "us-law-georgetown": [
        "georgetown"
      ],
      "us-business-georgetown": [
        "georgetown"
      ],
      "hk-law-hku": [
        "hku-law"
      ],
      "hk-architecture-hku": [
        "hku-architecture"
      ],
      "hk-medicine-cuhk": [
        "cuhk-medicine",
        "cuhk-all"
      ],
      "hk-cs-cuhk": [
        "cuhk-cs",
        "cuhk-all"
      ],
      "hk-engineering-cuhk": [
        "cuhk-engineering",
        "cuhk-all"
      ],
      "hk-economics-cuhk": [
        "cuhk-economics",
        "cuhk-all"
      ],
      "hk-law-cuhk": [
        "cuhk-law",
        "cuhk-all"
      ],
      "hk-business-cuhk": [
        "cuhk-business",
        "cuhk-all"
      ],
      "hk-architecture-cuhk": [
        "cuhk-architecture",
        "cuhk-all"
      ],
      "hk-cs-hkust": [
        "hkust-engineering",
        "hkust-all"
      ],
      "hk-engineering-hkust": [
        "hkust-engineering",
        "hkust-all"
      ],
      "hk-economics-hkust": [
        "hkust-all"
      ],
      "hk-business-hkust": [
        "hkust-all"
      ],
      "hk-quantfin-hkust": [
        "hkust-quantfin",
        "hkust-all"
      ],
      "hk-business-polyu": [
        "polyu-business"
      ],
      "hk-engineering-polyu": [
        "polyu-engineering"
      ],
      "hk-architecture-polyu": [
        "polyu-architecture"
      ],
      "hk-cs-polyu": [
        "polyu-computing"
      ],
      "hk-nursing-polyu": [
        "polyu-nursing"
      ],
      "hk-cs-cityu": [
        "cityu-cs"
      ],
      "hk-business-cityu": [
        "cityu-business-global-business",
        "cityu-business-marketing"
      ],
      "ca-engineering-utoronto": [
        "utoronto-engineering"
      ],
      "ca-business-ubc": [
        "ubc-commerce"
      ],
      "ca-medicine-mcgill": [
        "mcgill-medicine"
      ],
      "ca-law-mcgill": [
        "mcgill-law"
      ],
      "ca-engineering-mcmaster": [
        "mcmaster-engineering-cs"
      ],
      "ca-cs-mcmaster": [
        "mcmaster-engineering-cs"
      ],
      "ca-business-western": [
        "western-ivey-aeo"
      ],
      "ca-business-queens": [
        "queens-commerce"
      ],
      "ca-business-york": [
        "york-schulich-bba"
      ],
      "ie-medicine-trinity": [
        "tcd-medicine",
        "tcd-mature-all"
      ],
      "ie-psychology-trinity": [
        "tcd-psychology-mature",
        "tcd-mature-all"
      ],
      "ie-engineering-trinity": [
        "tcd-mature-all"
      ],
      "ie-cs-trinity": [
        "tcd-mature-all"
      ],
      "ie-maths-trinity": [
        "tcd-mature-all"
      ],
      "ie-naturalsciences-trinity": [
        "tcd-mature-all"
      ],
      "ie-economics-trinity": [
        "tcd-mature-all"
      ],
      "ie-law-trinity": [
        "tcd-mature-all"
      ],
      "ie-business-trinity": [
        "tcd-mature-all"
      ],
      "sg-medicine-nus": [
        "nus-medicine",
        "nus-all"
      ],
      "sg-cs-nus": [
        "nus-computing",
        "nus-all"
      ],
      "sg-engineering-nus": [
        "nus-all"
      ],
      "sg-psychology-nus": [
        "nus-all"
      ],
      "sg-economics-nus": [
        "nus-all"
      ],
      "sg-business-nus": [
        "nus-all"
      ],
      "sg-sciences-nus": [
        "nus-all"
      ],
      "sg-maths-nus": [
        "nus-all"
      ],
      "sg-pharmacy-nus": [
        "nus-all"
      ],
      "sg-medicine-ntu": [
        "ntu-medicine",
        "ntu-aba-all"
      ],
      "sg-cs-ntu": [
        "ntu-aba-all"
      ],
      "sg-maths-ntu": [
        "ntu-aba-all"
      ],
      "sg-engineering-ntu": [
        "ntu-aba-all"
      ],
      "sg-business-ntu": [
        "ntu-aba-all"
      ],
      "sg-economics-ntu": [
        "ntu-aba-all"
      ],
      "sg-architecture-ntu": [
        "ntu-aba-all"
      ],
      "sg-engineering-sutd": [
        "sutd-all"
      ],
      "sg-architecture-sutd": [
        "sutd-all"
      ],
      "uk-cs-bath": [
        "bath-qualification-route-uk-cs-bath"
      ],
      "uk-economics-bath": [
        "bath-qualification-route-uk-economics-bath"
      ],
      "uk-engineering-bath": [
        "bath-qualification-route-uk-engineering-bath"
      ],
      "uk-accounting-bath": [
        "bath-qualification-route-uk-accounting-bath"
      ],
      "uk-maths-bath": [
        "bath-mathematics"
      ],
      "uk-cs-glasgow": [
        "glasgow-year2-entry"
      ],
      "uk-law-glasgow": [
        "glasgow-year2-entry"
      ],
      "uk-economics-glasgow": [
        "glasgow-year2-entry"
      ],
      "uk-engineering-glasgow": [
        "glasgow-year2-entry"
      ],
      "us-business-berkeley": [
        "berkeley-business"
      ],
      "us-engineering-michigan": [
        "michigan-engineering"
      ],
      "us-business-unc": [
        "unc-business"
      ],
      "us-cs-caltech": [
        "caltech-third-party"
      ],
      "us-physics-caltech": [
        "caltech-third-party"
      ],
      "us-engineering-caltech": [
        "caltech-third-party"
      ],
      "us-maths-caltech": [
        "caltech-third-party"
      ],
      "us-cs-cmu": [
        "carnegie-mellon-university-third-party"
      ],
      "us-engineering-cmu": [
        "carnegie-mellon-university-third-party"
      ],
      "us-business-cmu": [
        "carnegie-mellon-university-third-party"
      ],
      "us-maths-cmu": [
        "carnegie-mellon-university-third-party"
      ],
      "us-cs-berkeley": [
        "uc-berkeley-third-party"
      ],
      "us-engineering-berkeley": [
        "uc-berkeley-third-party"
      ],
      "us-economics-berkeley": [
        "uc-berkeley-third-party"
      ],
      "us-maths-berkeley": [
        "uc-berkeley-third-party"
      ],
      "us-cs-northwestern": [
        "northwestern-university-third-party"
      ],
      "us-economics-northwestern": [
        "northwestern-university-third-party"
      ],
      "us-engineering-northwestern": [
        "northwestern-university-third-party"
      ],
      "us-cs-brown": [
        "brown-university-third-party"
      ],
      "us-maths-brown": [
        "brown-university-third-party"
      ],
      "us-economics-brown": [
        "brown-university-third-party"
      ],
      "us-economics-vanderbilt": [
        "vanderbilt-university-third-party"
      ],
      "us-cs-vanderbilt": [
        "vanderbilt-university-third-party"
      ],
      "us-cs-washu": [
        "washington-university-in-st-louis-third-party"
      ],
      "us-business-washu": [
        "washington-university-in-st-louis-third-party"
      ],
      "us-cs-gatech": [
        "georgia-tech-third-party"
      ],
      "us-engineering-gatech": [
        "georgia-tech-third-party"
      ],
      "ca-business-sfu": [
        "simon-fraser-university-no-1"
      ],
      "ca-business-concordia": [
        "concordia-university-no-1"
      ],
      "uk-economics-lse": [
        "london-school-of-economics-no-1"
      ],
      "uk-finance-lse": [
        "london-school-of-economics-no-1"
      ],
      "uk-accounting-lse": [
        "london-school-of-economics-no-1"
      ],
      "uk-law-lse": [
        "london-school-of-economics-no-1"
      ],
      "uk-politics-lse": [
        "london-school-of-economics-no-1"
      ],
      "uk-management-lse": [
        "london-school-of-economics-no-1"
      ],
      "uk-cs-edinburgh": [
        "university-of-edinburgh-no-1"
      ],
      "uk-engineering-edinburgh": [
        "university-of-edinburgh-no-1"
      ],
      "uk-economics-edinburgh": [
        "university-of-edinburgh-no-1"
      ],
      "uk-law-edinburgh": [
        "university-of-edinburgh-no-1"
      ],
      "uk-psychology-edinburgh": [
        "university-of-edinburgh-no-1"
      ],
      "uk-architecture-edinburgh": [
        "university-of-edinburgh-no-1"
      ],
      "uk-maths-edinburgh": [
        "university-of-edinburgh-no-1"
      ],
      "uk-economics-manchester": [
        "university-of-manchester-no-1"
      ],
      "uk-engineering-manchester": [
        "university-of-manchester-no-2"
      ],
      "uk-accounting-manchester": [
        "university-of-manchester-no-3"
      ],
      "uk-maths-manchester": [
        "university-of-manchester-no-4"
      ],
      "uk-economics-warwick": [
        "university-of-warwick-no-1"
      ],
      "uk-maths-warwick": [
        "university-of-warwick-no-2"
      ],
      "uk-cs-warwick": [
        "university-of-warwick-no-3"
      ],
      "uk-law-warwick": [
        "university-of-warwick-no-4"
      ],
      "uk-accounting-warwick": [
        "university-of-warwick-no-5"
      ],
      "uk-engineering-warwick": [
        "university-of-warwick-no-6"
      ],
      "uk-maths-bristol": [
        "university-of-bristol-no-1"
      ],
      "uk-cs-bristol": [
        "university-of-bristol-no-2"
      ],
      "uk-economics-bristol": [
        "university-of-bristol-no-3"
      ],
      "uk-engineering-bristol": [
        "university-of-bristol-no-4"
      ],
      "uk-law-bristol": [
        "university-of-bristol-no-5"
      ],
      "uk-cs-standrews": [
        "university-of-st-andrews-no-1",
        "university-of-st-andrews-no-2"
      ],
      "uk-economics-standrews": [
        "university-of-st-andrews-no-1",
        "university-of-st-andrews-no-2"
      ],
      "uk-maths-standrews": [
        "university-of-st-andrews-no-1",
        "university-of-st-andrews-no-2"
      ],
      "uk-cs-leeds": [
        "university-of-leeds-no-1"
      ],
      "uk-engineering-leeds": [
        "university-of-leeds-no-1"
      ],
      "uk-law-leeds": [
        "university-of-leeds-no-2"
      ],
      "uk-economics-leeds": [
        "university-of-leeds-no-3"
      ],
      "uk-law-nottingham": [
        "university-of-nottingham-no-1"
      ],
      "us-cs-columbia": [
        "columbia-university-no-1"
      ],
      "us-maths-columbia": [
        "columbia-university-no-1"
      ],
      "us-economics-columbia": [
        "columbia-university-no-1"
      ],
      "us-engineering-columbia": [
        "columbia-university-no-1"
      ],
      "us-biomedical-jhu": [
        "johns-hopkins-university-no-1"
      ],
      "us-cs-jhu": [
        "johns-hopkins-university-no-1"
      ],
      "us-cs-cornell": [
        "cornell-university-no-1"
      ],
      "us-maths-cornell": [
        "cornell-university-no-1"
      ],
      "us-engineering-cornell": [
        "cornell-university-no-1"
      ],
      "us-economics-cornell": [
        "cornell-university-no-1"
      ],
      "us-business-cornell": [
        "cornell-university-no-1"
      ],
      "us-cs-ucla": [
        "ucla-no-1"
      ],
      "us-engineering-ucla": [
        "ucla-no-1"
      ],
      "us-economics-ucla": [
        "ucla-no-1"
      ],
      "us-maths-ucla": [
        "ucla-no-1"
      ],
      "us-psychology-ucla": [
        "ucla-no-1"
      ],
      "us-business-usc": [
        "university-of-southern-california-no-1",
        "university-of-southern-california-no-2"
      ],
      "us-cs-usc": [
        "university-of-southern-california-no-1",
        "university-of-southern-california-no-2"
      ],
      "us-business-uva": [
        "university-of-virginia-no-1"
      ],
      "hk-business-hku": [
        "university-of-hong-kong-manual-review"
      ],
      "hk-economics-hku": [
        "university-of-hong-kong-manual-review"
      ],
      "hk-medicine-hku": [
        "university-of-hong-kong-manual-review"
      ],
      "hk-cs-hku": [
        "university-of-hong-kong-manual-review"
      ],
      "hk-maths-hku": [
        "university-of-hong-kong-manual-review"
      ],
      "hk-engineering-hku": [
        "university-of-hong-kong-manual-review"
      ],
      "hk-pharmacy-hku": [
        "university-of-hong-kong-manual-review"
      ],
      "hk-psychology-hku": [
        "university-of-hong-kong-manual-review"
      ],
      "ca-engineering-waterloo": [
        "university-of-waterloo-manual-review"
      ],
      "ca-business-waterloo": [
        "university-of-waterloo-manual-review"
      ],
      "us-business-emory": [
        "emory-university-manual-review"
      ],
      "us-economics-emory": [
        "emory-university-manual-review"
      ],
      "ca-medicine-mcmaster": [
        "mcmaster-university-manual-review"
      ],
      "us-business-notredame": [
        "university-of-notre-dame-manual-review"
      ],
      "us-cs-notredame": [
        "university-of-notre-dame-manual-review"
      ],
      "hk-engineering-cityu": [
        "city-university-of-hong-kong-manual-review"
      ],
      "hk-law-cityu": [
        "city-university-of-hong-kong-manual-review"
      ],
      "hk-economics-cityu": [
        "city-university-of-hong-kong-manual-review"
      ],
      "ca-engineering-alberta": [
        "university-of-alberta-manual-review"
      ],
      "ca-cs-alberta": [
        "university-of-alberta-manual-review"
      ],
      "ca-business-alberta": [
        "university-of-alberta-manual-review"
      ],
      "sg-law-smu": [
        "singapore-management-university-manual-review"
      ],
      "sg-business-smu": [
        "singapore-management-university-manual-review"
      ],
      "sg-economics-smu": [
        "singapore-management-university-manual-review"
      ],
      "sg-cs-smu": [
        "singapore-management-university-manual-review"
      ],
      "uk-cs-ucl": [
        "university-college-london-manual-review"
      ],
      "uk-engineering-ucl": [
        "university-college-london-manual-review"
      ],
      "uk-economics-ucl": [
        "university-college-london-manual-review"
      ],
      "uk-biomedical-ucl": [
        "university-college-london-manual-review"
      ],
      "uk-psychology-ucl": [
        "university-college-london-manual-review"
      ],
      "uk-maths-ucl": [
        "university-college-london-manual-review"
      ],
      "uk-maths-durham": [
        "durham-university-manual-review"
      ],
      "uk-economics-durham": [
        "durham-university-manual-review"
      ],
      "uk-cs-durham": [
        "durham-university-manual-review"
      ],
      "uk-law-durham": [
        "durham-university-manual-review"
      ],
      "uk-physics-durham": [
        "durham-university-manual-review"
      ],
      "uk-engineering-durham": [
        "durham-university-manual-review"
      ],
      "us-business-nyu": [
        "new-york-university-manual-review"
      ],
      "us-cs-nyu": [
        "new-york-university-manual-review"
      ],
      "us-cs-uva": [
        "university-of-virginia-manual-review"
      ],
      "us-economics-uva": [
        "university-of-virginia-manual-review"
      ],
      "hk-sciences-hkust": [
        "hkust-science-maths"
      ],
      "hk-maths-hkust": [
        "hkust-science-maths"
      ]
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = { interviewData };
  else root.AltioraInterviewData = interviewData;
})(typeof globalThis !== 'undefined' ? globalThis : this);
