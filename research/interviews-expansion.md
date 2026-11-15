# Interview data expansion — research report

Research only, read on 2026-11-15. Nothing in the app, its data or its pages was changed. The proposed records are in
`research/interviews-expansion-proposed.json`; they are NOT loaded by the app.

## Record shape

`records[]` use exactly the shape `scripts/build-interview-data.mjs` reads from `research/interviews-proposed.json`:

```
{ id, university, subject, courseIds[], interviewed,
  format, numberAndLength, mmiStations, whatIsAssessed,   // EVIDENCE or null
  sampleQuestions: [{ subject, question, source, accessed, sourceSnippet }],
  prepAdvice: [EVIDENCE], notes, manualReview }
EVIDENCE = { source, accessed, sourceSnippet }   // sourceSnippet verbatim from source
```

The file also carries, outside `records`: `statedNoInterview` (EVIDENCE + `courseIds`), `thirdPartyInterviewOnly`,
`notOpenToSchoolLeavers`, `notPublished` and `manualReview` (the 12 carried-over URLs + the new ones). Unknown values are null.
The 54 existing records (82 courses) are not restated or altered.

## How this was researched

- Every page was read with one plain request (`curl`, default user agent, following ordinary redirects) and its visible
  text extracted; PDFs with `pdftotext`. No proxies, caches, archives, mirrors, alternate user agents or extra headers.
  A 403, bot check, challenge page, connection reset, TLS error or empty page counts as blocked and is listed in §6.
- Official university domains only. Web search was used only to find official URLs; no search snippet is evidence.
- The work was split by region (Hong Kong; Canada; Ireland + Singapore; UK; US in two halves) under one written brief
  with the same rules and the same fetch tool. No prior knowledge of formats or questions was used: a value is
  recorded only where a quoted official page states it.
- Independent check: every quote in the proposed file (191 evidence items) was re-fetched with a fresh plain
  request and found verbatim: 187 on the re-fetch; 4 only in the first fetch because the re-fetch was
  blocked (listed in §8); 0 failed.

## 1. Part 0 — from our own data

### 1a. Courses with no interview record: 253 of 335

| Country | Courses without a record |
|---|---|
| Hong Kong | 35 |
| Canada | 47 |
| Ireland | 9 |
| Singapore | 22 |
| UK | 73 |
| US | 67 |
| Spain | 0 (all 6 have a record) |

By university (country order as researched):

| University | Country | Courses without a record | Course ids |
|---|---|---|---|
| University of Hong Kong | Hong Kong | 10 | hk-medicine-hku, hk-cs-hku, hk-maths-hku, hk-engineering-hku, hk-law-hku, hk-economics-hku, hk-business-hku, hk-architecture-hku, hk-pharmacy-hku, hk-psychology-hku |
| Chinese University of Hong Kong | Hong Kong | 8 | hk-medicine-cuhk, hk-cs-cuhk, hk-engineering-cuhk, hk-economics-cuhk, hk-law-cuhk, hk-business-cuhk, hk-psychology-cuhk, hk-architecture-cuhk |
| HKUST | Hong Kong | 7 | hk-cs-hkust, hk-engineering-hkust, hk-economics-hkust, hk-business-hkust, hk-sciences-hkust, hk-maths-hkust, hk-quantfin-hkust |
| Hong Kong Polytechnic University | Hong Kong | 5 | hk-engineering-polyu, hk-nursing-polyu, hk-business-polyu, hk-architecture-polyu, hk-cs-polyu |
| City University of Hong Kong | Hong Kong | 5 | hk-cs-cityu, hk-engineering-cityu, hk-law-cityu, hk-business-cityu, hk-economics-cityu |
| University of Toronto | Canada | 6 | ca-cs-utoronto, ca-maths-toronto, ca-engineering-utoronto, ca-medicine-utoronto, ca-economics-utoronto, ca-law-utoronto |
| University of British Columbia | Canada | 5 | ca-maths-ubc, ca-cs-ubc, ca-engineering-ubc, ca-business-ubc, ca-economics-ubc |
| McGill University | Canada | 6 | ca-maths-mcgill, ca-medicine-mcgill, ca-cs-mcgill, ca-engineering-mcgill, ca-economics-mcgill, ca-law-mcgill |
| University of Waterloo | Canada | 4 | ca-cs-waterloo, ca-engineering-waterloo, ca-mathematics-waterloo, ca-business-waterloo |
| McMaster University | Canada | 3 | ca-medicine-mcmaster, ca-engineering-mcmaster, ca-cs-mcmaster |
| Western University | Canada | 3 | ca-business-western, ca-cs-western, ca-medicine-western |
| Queen's University | Canada | 3 | ca-business-queens, ca-engineering-queens, ca-economics-queens |
| University of Alberta | Canada | 3 | ca-engineering-alberta, ca-cs-alberta, ca-business-alberta |
| Simon Fraser University | Canada | 2 | ca-cs-sfu, ca-business-sfu |
| University of Calgary | Canada | 2 | ca-engineering-calgary, ca-business-calgary |
| University of Ottawa | Canada | 2 | ca-law-ottawa, ca-cs-ottawa |
| Dalhousie University | Canada | 2 | ca-medicine-dalhousie, ca-engineering-dalhousie |
| Concordia University | Canada | 2 | ca-business-concordia, ca-cs-concordia |
| York University | Canada | 2 | ca-business-york, ca-law-york |
| University of Victoria | Canada | 2 | ca-law-uvic, ca-cs-uvic |
| Trinity College Dublin | Ireland | 9 | ie-engineering-trinity, ie-cs-trinity, ie-maths-trinity, ie-naturalsciences-trinity, ie-medicine-trinity, ie-economics-trinity, ie-law-trinity, ie-business-trinity, ie-psychology-trinity |
| National University of Singapore | Singapore | 9 | sg-cs-nus, sg-engineering-nus, sg-medicine-nus, sg-psychology-nus, sg-economics-nus, sg-business-nus, sg-sciences-nus, sg-maths-nus, sg-pharmacy-nus |
| Nanyang Technological University | Singapore | 7 | sg-cs-ntu, sg-maths-ntu, sg-engineering-ntu, sg-business-ntu, sg-medicine-ntu, sg-economics-ntu, sg-architecture-ntu |
| Singapore Management University | Singapore | 4 | sg-law-smu, sg-business-smu, sg-economics-smu, sg-cs-smu |
| Singapore University of Technology & Design | Singapore | 2 | sg-engineering-sutd, sg-architecture-sutd |
| London School of Economics | UK | 6 | uk-economics-lse, uk-finance-lse, uk-accounting-lse, uk-law-lse, uk-politics-lse, uk-management-lse |
| University College London | UK | 6 | uk-cs-ucl, uk-engineering-ucl, uk-economics-ucl, uk-biomedical-ucl, uk-psychology-ucl, uk-maths-ucl |
| University of Edinburgh | UK | 7 | uk-cs-edinburgh, uk-engineering-edinburgh, uk-economics-edinburgh, uk-law-edinburgh, uk-psychology-edinburgh, uk-architecture-edinburgh, uk-maths-edinburgh |
| King's College London | UK | 4 | uk-law-kcl, uk-cs-kcl, uk-economics-kcl, uk-psychology-kcl |
| University of Manchester | UK | 6 | uk-cs-manchester, uk-economics-manchester, uk-engineering-manchester, uk-law-manchester, uk-accounting-manchester, uk-maths-manchester |
| University of Warwick | UK | 6 | uk-economics-warwick, uk-maths-warwick, uk-cs-warwick, uk-law-warwick, uk-accounting-warwick, uk-engineering-warwick |
| Durham University | UK | 6 | uk-maths-durham, uk-economics-durham, uk-cs-durham, uk-law-durham, uk-physics-durham, uk-engineering-durham |
| University of Bristol | UK | 5 | uk-maths-bristol, uk-cs-bristol, uk-economics-bristol, uk-engineering-bristol, uk-law-bristol |
| University of Bath | UK | 5 | uk-cs-bath, uk-maths-bath, uk-economics-bath, uk-engineering-bath, uk-accounting-bath |
| University of Glasgow | UK | 4 | uk-cs-glasgow, uk-law-glasgow, uk-economics-glasgow, uk-engineering-glasgow |
| University of St Andrews | UK | 3 | uk-cs-standrews, uk-economics-standrews, uk-maths-standrews |
| University of Leeds | UK | 4 | uk-cs-leeds, uk-engineering-leeds, uk-law-leeds, uk-economics-leeds |
| University of Nottingham | UK | 3 | uk-cs-nottingham, uk-economics-nottingham, uk-law-nottingham |
| University of Birmingham | UK | 4 | uk-cs-birmingham, uk-economics-birmingham, uk-engineering-birmingham, uk-law-birmingham |
| University of Exeter | UK | 4 | uk-economics-exeter, uk-law-exeter, uk-cs-exeter, uk-psychology-exeter |
| Columbia University | US | 4 | us-cs-columbia, us-maths-columbia, us-economics-columbia, us-engineering-columbia |
| University of Pennsylvania | US | 3 | us-business-wharton, us-cs-penn, us-economics-penn |
| Caltech | US | 4 | us-cs-caltech, us-physics-caltech, us-engineering-caltech, us-maths-caltech |
| Carnegie Mellon University | US | 4 | us-cs-cmu, us-engineering-cmu, us-business-cmu, us-maths-cmu |
| UC Berkeley | US | 5 | us-cs-berkeley, us-engineering-berkeley, us-economics-berkeley, us-business-berkeley, us-maths-berkeley |
| University of Michigan | US | 6 | us-cs-michigan, us-engineering-michigan, us-business-michigan, us-economics-michigan, us-maths-michigan, us-psychology-michigan |
| New York University | US | 2 | us-business-nyu, us-cs-nyu |
| Johns Hopkins University | US | 2 | us-biomedical-jhu, us-cs-jhu |
| Northwestern University | US | 3 | us-cs-northwestern, us-economics-northwestern, us-engineering-northwestern |
| Brown University | US | 3 | us-cs-brown, us-maths-brown, us-economics-brown |
| Cornell University | US | 5 | us-cs-cornell, us-maths-cornell, us-engineering-cornell, us-economics-cornell, us-business-cornell |
| Vanderbilt University | US | 2 | us-economics-vanderbilt, us-cs-vanderbilt |
| University of Notre Dame | US | 2 | us-business-notredame, us-cs-notredame |
| Washington University in St. Louis | US | 2 | us-cs-washu, us-business-washu |
| Emory University | US | 2 | us-business-emory, us-economics-emory |
| UCLA | US | 5 | us-cs-ucla, us-engineering-ucla, us-economics-ucla, us-maths-ucla, us-psychology-ucla |
| University of Southern California | US | 2 | us-business-usc, us-cs-usc |
| Georgia Tech | US | 2 | us-cs-gatech, us-engineering-gatech |
| University of Virginia | US | 3 | us-business-uva, us-cs-uva, us-economics-uva |
| University of Illinois Urbana-Champaign | US | 2 | us-cs-uiuc, us-engineering-uiuc |
| Purdue University | US | 2 | us-engineering-purdue, us-cs-purdue |
| UNC Chapel Hill | US | 2 | us-business-unc, us-economics-unc |

### 1b. Courses whose 2027 requirement rows mention an interview, MMI, audition, portfolio or assessment day

Matched in `otherRequirements` or `admissionsTests` of `data/requirements/2027.js`. "University text" is the row's
verbatim `sourceSnippet`; "our line" is the requirement line as written in our data. These were researched first.
All are in the UK and US; no Hong Kong, Canadian, Irish or Singapore row mentions one.

94 courses:

- **uk-cs-edinburgh** (University of Edinburgh) — row source: https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios
  - our line (otherRequirements): “No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine”
  - our line (otherRequirements): “No portfolio or other additional requirement is listed for this programme”
  - university text (otherRequirements): “You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews.”
  - university text (otherRequirements): “Interviews and admissions tests do not normally form part of our admissions process, but there are some exceptions for specific programmes.”
- **uk-engineering-edinburgh** (University of Edinburgh) — row source: https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios
  - our line (otherRequirements): “No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine”
  - our line (otherRequirements): “No portfolio or other additional requirement is listed for this programme”
  - university text (otherRequirements): “You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews.”
  - university text (otherRequirements): “Interviews and admissions tests do not normally form part of our admissions process, but there are some exceptions for specific programmes.”
- **uk-economics-edinburgh** (University of Edinburgh) — row source: https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios
  - our line (otherRequirements): “No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine”
  - our line (otherRequirements): “No portfolio or other additional requirement is listed for this programme”
  - university text (otherRequirements): “You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews.”
  - university text (otherRequirements): “Interviews and admissions tests do not normally form part of our admissions process, but there are some exceptions for specific programmes.”
- **uk-law-edinburgh** (University of Edinburgh) — row source: https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios
  - our line (otherRequirements): “No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine”
  - our line (otherRequirements): “No portfolio or other additional requirement is listed for this programme”
  - university text (otherRequirements): “You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews.”
  - university text (otherRequirements): “Interviews and admissions tests do not normally form part of our admissions process, but there are some exceptions for specific programmes.”
- **uk-psychology-edinburgh** (University of Edinburgh) — row source: https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios
  - our line (otherRequirements): “No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine”
  - our line (otherRequirements): “No portfolio or other additional requirement is listed for this programme”
  - university text (otherRequirements): “You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews.”
  - university text (otherRequirements): “Interviews and admissions tests do not normally form part of our admissions process, but there are some exceptions for specific programmes.”
- **uk-architecture-edinburgh** (University of Edinburgh) — row source: https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios
  - our line (otherRequirements): “No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine”
  - our line (otherRequirements): “Evidence of artistic ability is normally required through qualifications (A level/GCSE or IB); the 2027-entry entry-requirements page lists no portfolio or other additional requirement”
  - university text (otherRequirements): “You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews.”
  - university text (otherRequirements): “Interviews and admissions tests do not normally form part of our admissions process, but there are some exceptions for specific programmes.”
- **uk-maths-edinburgh** (University of Edinburgh) — row source: https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios
  - our line (otherRequirements): “No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine”
  - our line (otherRequirements): “No portfolio or other additional requirement is listed for this programme”
  - university text (otherRequirements): “You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews.”
  - university text (otherRequirements): “Interviews and admissions tests do not normally form part of our admissions process, but there are some exceptions for specific programmes.”
- **uk-cs-manchester** (University of Manchester) — row source: https://www.manchester.ac.uk/study/undergraduate/courses/2027/00560/bsc-computer-science/
  - our line (otherRequirements): “No interview is described; decisions rest on past and predicted performance, enthusiasm for the programme, interpersonal skills and non-academic interests”
- **uk-economics-manchester** (University of Manchester) — row source: https://www.manchester.ac.uk/study/undergraduate/courses/2027/10224/bsc-economics/
  - our line (otherRequirements): “No interviews”
  - university text (otherRequirements): “Interview requirements We do not interview.”
- **uk-engineering-manchester** (University of Manchester) — row source: https://www.manchester.ac.uk/study/undergraduate/courses/2027/03921/meng-mechanical-engineering/
  - our line (otherRequirements): “No interviews; offer holders may be invited to a virtual webinar or on-campus offer holder day (February–April)”
  - university text (otherRequirements): “We do not hold interviews but applicants who receive an offer may be invited to a virtual webinar or an on-campus offer holder day which generally take place on Wednesday afternoons from February to April.”
- **uk-accounting-manchester** (University of Manchester) — row source: https://www.manchester.ac.uk/study/undergraduate/courses/2027/03520/bsc-management-accounting-and-finance/
  - our line (otherRequirements): “Applicants are not interviewed as a rule; Manchester may interview candidates with non-standard backgrounds (e.g.”
  - university text (otherRequirements): “We do not as a rule interview applicants.”
- **uk-maths-manchester** (University of Manchester) — row source: https://www.manchester.ac.uk/study/undergraduate/courses/2027/00590/bsc-mathematics/
  - our line (otherRequirements): “No interviews; offer holders are invited to an on-campus (or virtual) offer holder day”
  - university text (otherRequirements): “We will not be holding interviews for September 2026 entry.”
- **uk-economics-warwick** (University of Warwick) — row source: https://warwick.ac.uk/study/undergraduate/courses/bsc-economics/
  - our line (otherRequirements): “No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference)”
  - university text (otherRequirements): “Warwick does not typically interview applicants.”
- **uk-maths-warwick** (University of Warwick) — row source: https://warwick.ac.uk/study/undergraduate/courses/bsc-mathematics/
  - our line (otherRequirements): “No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference)”
  - university text (otherRequirements): “Warwick does not typically interview applicants.”
- **uk-maths-durham** (Durham University) — row source: https://www.durham.ac.uk/media/durham-university/study/admissions-policies/Admissions-Policy-2026-27.pdf
  - our line (otherRequirements): “Interviews or written work: the policy says some courses require them, with details on the course page; the 2027 course page does not mention either”
  - university text (otherRequirements): “In addition, some courses may require applicants to participate in an interview, submit examples of written work, compositions, or sound/video files of performance as part of the selection process.”
- **uk-maths-bristol** (University of Bristol) — row source: https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/maths.pdf
  - our line (otherRequirements): “Not routinely interviewed (interviews only in exceptional circumstances)”
  - university text (otherRequirements): “For these courses, applicants are not routinely interviewed.”
- **uk-cs-warwick** (University of Warwick) — row source: https://warwick.ac.uk/study/undergraduate/courses/bsc-computer-science/
  - our line (otherRequirements): “No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference)”
  - university text (otherRequirements): “Warwick does not typically interview applicants.”
- **uk-law-warwick** (University of Warwick) — row source: https://warwick.ac.uk/study/undergraduate/courses/llb-law/
  - our line (otherRequirements): “No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference)”
  - university text (otherRequirements): “Warwick does not typically interview applicants.”
- **uk-accounting-warwick** (University of Warwick) — row source: https://warwick.ac.uk/study/undergraduate/courses/bsc-accounting-finance/
  - our line (otherRequirements): “No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference)”
  - university text (otherRequirements): “Warwick does not typically interview applicants.”
- **uk-engineering-warwick** (University of Warwick) — row source: https://warwick.ac.uk/study/undergraduate/courses/meng-engineering/
  - our line (otherRequirements): “No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference)”
  - university text (otherRequirements): “Warwick does not typically interview applicants.”
- **uk-cs-bristol** (University of Bristol) — row source: https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/computer-science.pdf
  - our line (otherRequirements): “Not routinely interviewed (interviews only in exceptional circumstances)”
  - university text (otherRequirements): “For these courses, applicants are not routinely interviewed.”
- **uk-economics-bristol** (University of Bristol) — row source: https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/economics.pdf
  - our line (otherRequirements): “Not routinely interviewed (interviews only in exceptional circumstances)”
  - university text (otherRequirements): “For these courses, applicants are not routinely interviewed.”
- **uk-engineering-bristol** (University of Bristol) — row source: https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/mechanical-engineering.pdf
  - our line (otherRequirements): “Not routinely interviewed (interviews only in exceptional circumstances)”
  - university text (otherRequirements): “For these courses, applicants are not routinely interviewed.”
- **uk-law-bristol** (University of Bristol) — row source: https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/law.pdf
  - our line (otherRequirements): “Not routinely interviewed (interviews only in exceptional circumstances)”
  - university text (otherRequirements): “For these courses, applicants are not routinely interviewed.”
- **uk-economics-durham** (Durham University) — row source: https://www.durham.ac.uk/media/durham-university/study/admissions-policies/Admissions-Policy-2026-27.pdf
  - our line (otherRequirements): “Interviews or written work: the policy says some courses require them, with details on the course page; the 2027 course page does not mention either”
  - university text (otherRequirements): “In addition, some courses may require applicants to participate in an interview, submit examples of written work, compositions, or sound/video files of performance as part of the selection process.”
- **uk-cs-durham** (Durham University) — row source: https://www.durham.ac.uk/media/durham-university/study/admissions-policies/Admissions-Policy-2026-27.pdf
  - our line (otherRequirements): “Interviews or written work: the policy says some courses require them, with details on the course page; the 2027 course page does not mention either”
  - university text (otherRequirements): “In addition, some courses may require applicants to participate in an interview, submit examples of written work, compositions, or sound/video files of performance as part of the selection process.”
- **uk-law-durham** (Durham University) — row source: https://www.durham.ac.uk/media/durham-university/study/admissions-policies/Admissions-Policy-2026-27.pdf
  - our line (otherRequirements): “Interviews or written work: the policy says some courses require them, with details on the course page; the 2027 course page does not mention either”
  - university text (otherRequirements): “In addition, some courses may require applicants to participate in an interview, submit examples of written work, compositions, or sound/video files of performance as part of the selection process.”
- **uk-physics-durham** (Durham University) — row source: https://www.durham.ac.uk/media/durham-university/study/admissions-policies/Admissions-Policy-2026-27.pdf
  - our line (otherRequirements): “Interviews or written work: the policy says some courses require them, with details on the course page; the 2027 course page does not mention either”
  - university text (otherRequirements): “In addition, some courses may require applicants to participate in an interview, submit examples of written work, compositions, or sound/video files of performance as part of the selection process.”
- **uk-engineering-durham** (Durham University) — row source: https://www.durham.ac.uk/media/durham-university/study/admissions-policies/Admissions-Policy-2026-27.pdf
  - our line (otherRequirements): “Interviews or written work: the policy says some courses require them, with details on the course page; the 2027 course page does not mention either”
  - university text (otherRequirements): “In addition, some courses may require applicants to participate in an interview, submit examples of written work, compositions, or sound/video files of performance as part of the selection process.”
- **uk-cs-bath** (University of Bath) — row source: https://www.bath.ac.uk/courses/undergraduate-2027/computer-science/bsc-computer-science/
  - our line (otherRequirements): “Interview: only for Access to HE or T Level applicants, or very exceptionally where circumstances cannot be assessed from the application”
  - university text (otherRequirements): “If you are studying certain qualifications, such as an Access to HE or T Level, you will be invited to attend an interview as part of our selection process.”
- **uk-maths-bath** (University of Bath) — row source: https://www.bath.ac.uk/courses/undergraduate-2027/mathematical-sciences/bsc-mathematics/
  - our line (otherRequirements): “Assessed on the UCAS application; interview only very exceptionally, where circumstances cannot be assessed from the application”
  - university text (otherRequirements): “Very exceptionally we may invite you to an interview if you have circumstances we cannot assess from an application alone.”
- **uk-economics-bath** (University of Bath) — row source: https://www.bath.ac.uk/courses/undergraduate-2027/economics/bsc-economics/
  - our line (otherRequirements): “Interview: only for Access to HE applicants, or very exceptionally where circumstances cannot be assessed from the application”
  - university text (otherRequirements): “If you are studying certain qualifications, such as an Access to HE Diploma, you will be invited to attend an interview as part of our selection process.”
- **uk-engineering-bath** (University of Bath) — row source: https://www.bath.ac.uk/courses/undergraduate-2027/mechanical-engineering/beng-mechanical-engineering/
  - our line (otherRequirements): “Interview: only for Access to HE applicants, or very exceptionally where circumstances cannot be assessed from the application”
  - university text (otherRequirements): “If you are studying certain qualifications, such as an Access to HE Diploma, you will be invited to attend an interview as part of our selection process.”
- **uk-accounting-bath** (University of Bath) — row source: https://www.bath.ac.uk/courses/undergraduate-2027/accounting-and-finance/bsc-accounting-and-finance/
  - our line (otherRequirements): “Interview: only for Access to HE or T Level applicants, or very exceptionally where circumstances cannot be assessed from the application”
  - university text (otherRequirements): “If you are studying certain qualifications, such as an Access to HE Diploma or T Level, you will be invited to attend an interview as part of our selection process.”
- **uk-cs-glasgow** (University of Glasgow) — row source: https://www.gla.ac.uk/undergraduate/how-to-apply-for-an-undergraduate-degree/entry-requirements/admissions-guidance/
  - our line (otherRequirements): “No interview for first-year entry: Glasgow interviews for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery”
  - our line (otherRequirements): “Applicants for entry into Year 2 may be interviewed in any subject”
  - university text (otherRequirements): “An interview will be part of the selection process for: Community Development Dentistry Medicine Nursing Teaching Veterinary Medicine & Surgery You may also be interviewed if you’re applying for entry into Year 2 in any subject.”
  - university text (otherRequirements): “Any Additional Requirements (interviews, auditions, tests, pre-entry programmes) are also stated.”
- **uk-law-glasgow** (University of Glasgow) — row source: https://www.gla.ac.uk/undergraduate/how-to-apply-for-an-undergraduate-degree/entry-requirements/admissions-guidance/
  - our line (otherRequirements): “No interview for first-year entry: Glasgow interviews for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery”
  - our line (otherRequirements): “Applicants for entry into Year 2 may be interviewed in any subject”
  - university text (otherRequirements): “An interview will be part of the selection process for: Community Development Dentistry Medicine Nursing Teaching Veterinary Medicine & Surgery You may also be interviewed if you’re applying for entry into Year 2 in any subject.”
  - university text (otherRequirements): “The selection processes for both Dentistry and Medicine involves the UCAT (University Clinical Aptitude Test) as well as interview.”
- **uk-economics-glasgow** (University of Glasgow) — row source: https://www.gla.ac.uk/undergraduate/how-to-apply-for-an-undergraduate-degree/entry-requirements/admissions-guidance/
  - our line (otherRequirements): “No interview for first-year entry: Glasgow interviews for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery”
  - our line (otherRequirements): “Applicants for entry into Year 2 may be interviewed in any subject”
  - university text (otherRequirements): “An interview will be part of the selection process for: Community Development Dentistry Medicine Nursing Teaching Veterinary Medicine & Surgery You may also be interviewed if you’re applying for entry into Year 2 in any subject.”
  - university text (otherRequirements): “Any Additional Requirements (interviews, auditions, tests, pre-entry programmes) are also stated.”
- **uk-engineering-glasgow** (University of Glasgow) — row source: https://www.gla.ac.uk/undergraduate/how-to-apply-for-an-undergraduate-degree/entry-requirements/admissions-guidance/
  - our line (otherRequirements): “No interview for first-year entry: Glasgow interviews for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery”
  - our line (otherRequirements): “Applicants for entry into Year 2 may be interviewed in any subject”
  - university text (otherRequirements): “An interview will be part of the selection process for: Community Development Dentistry Medicine Nursing Teaching Veterinary Medicine & Surgery You may also be interviewed if you’re applying for entry into Year 2 in any subject.”
  - university text (otherRequirements): “Any Additional Requirements (interviews, auditions, tests, pre-entry programmes) are also stated.”
- **uk-cs-standrews** (University of St Andrews) — row source: https://www.st-andrews.ac.uk/subjects/entry/academic-entry-explained/
  - our line (otherRequirements): “No interview: St Andrews interviews for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes only”
  - university text (otherRequirements): “For some specific degree programmes, you may also need to: come to an interview, for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes sit an admissions test, the UCAT, for Medicine”
- **uk-economics-standrews** (University of St Andrews) — row source: https://www.st-andrews.ac.uk/subjects/entry/academic-entry-explained/
  - our line (otherRequirements): “No interview: St Andrews interviews for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes only”
  - university text (otherRequirements): “For some specific degree programmes, you may also need to: come to an interview, for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes sit an admissions test, the UCAT, for Medicine”
- **uk-maths-standrews** (University of St Andrews) — row source: https://www.st-andrews.ac.uk/subjects/entry/academic-entry-explained/
  - our line (otherRequirements): “No interview: St Andrews interviews for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes only”
  - university text (otherRequirements): “For some specific degree programmes, you may also need to: come to an interview, for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes sit an admissions test, the UCAT, for Medicine”
- **uk-economics-exeter** (University of Exeter) — row source: https://www.exeter.ac.uk/undergraduate-degrees/apply/after-you-apply/
  - our line (otherRequirements): “No interview is listed in this course’s entry requirements (Exeter states that where an interview is used, the course entry requirements say so)”
  - university text (otherRequirements): “The majority of courses do not require an interview as part of the selection process.”
- **uk-law-exeter** (University of Exeter) — row source: https://www.exeter.ac.uk/undergraduate-degrees/apply/after-you-apply/
  - our line (otherRequirements): “No interview is listed in this course’s entry requirements (Exeter states that where an interview is used, the course entry requirements say so)”
  - university text (otherRequirements): “The majority of courses do not require an interview as part of the selection process.”
- **uk-cs-exeter** (University of Exeter) — row source: https://www.exeter.ac.uk/undergraduate-degrees/apply/after-you-apply/
  - our line (otherRequirements): “No interview is listed in this course’s entry requirements (Exeter states that where an interview is used, the course entry requirements say so)”
  - university text (otherRequirements): “The majority of courses do not require an interview as part of the selection process.”
- **uk-psychology-exeter** (University of Exeter) — row source: https://www.exeter.ac.uk/undergraduate-degrees/apply/after-you-apply/
  - our line (otherRequirements): “No interview is listed in this course’s entry requirements (Exeter states that where an interview is used, the course entry requirements say so)”
  - university text (otherRequirements): “The majority of courses do not require an interview as part of the selection process.”
- **us-cs-columbia** (Columbia University) — row source: https://undergrad.admissions.columbia.edu/apply/firstyear
  - our line (otherRequirements): “Interviews are not part of the application process”
  - our line (otherRequirements): “Supplementary materials (arts portfolio, research abstract, resume): optional”
  - university text (otherRequirements): “Supplementary materials, such as an arts portfolio, research abstract or resume, are not a required part of our admissions process—but there are occasions where they can enhance our understanding of your application.”
- **us-maths-columbia** (Columbia University) — row source: https://undergrad.admissions.columbia.edu/apply/firstyear
  - our line (otherRequirements): “Interviews are not part of the application process”
  - our line (otherRequirements): “Supplementary materials (arts portfolio, research abstract, resume): optional”
  - university text (otherRequirements): “Supplementary materials, such as an arts portfolio, research abstract or resume, are not a required part of our admissions process—but there are occasions where they can enhance our understanding of your application.”
- **us-economics-columbia** (Columbia University) — row source: https://undergrad.admissions.columbia.edu/apply/firstyear
  - our line (otherRequirements): “Interviews are not part of the application process”
  - our line (otherRequirements): “Supplementary materials (arts portfolio, research abstract, resume): optional”
  - university text (otherRequirements): “Supplementary materials, such as an arts portfolio, research abstract or resume, are not a required part of our admissions process—but there are occasions where they can enhance our understanding of your application.”
- **us-engineering-columbia** (Columbia University) — row source: https://undergrad.admissions.columbia.edu/apply/firstyear
  - our line (otherRequirements): “Interviews are not part of the application process”
  - our line (otherRequirements): “Supplementary materials (arts portfolio, research abstract, resume): optional”
  - university text (otherRequirements): “Supplementary materials, such as an arts portfolio, research abstract or resume, are not a required part of our admissions process—but there are occasions where they can enhance our understanding of your application.”
- **us-cs-caltech** (Caltech) — row source: https://www.admissions.caltech.edu/apply/first-year-applicants/supplemental-application-essays
  - our line (otherRequirements): “research paper, portfolio): optional”
- **us-physics-caltech** (Caltech) — row source: https://www.admissions.caltech.edu/apply/first-year-applicants/supplemental-application-essays
  - our line (otherRequirements): “research paper, portfolio): optional”
- **us-engineering-caltech** (Caltech) — row source: https://www.admissions.caltech.edu/apply/first-year-applicants/supplemental-application-essays
  - our line (otherRequirements): “research paper, portfolio): optional”
- **us-maths-caltech** (Caltech) — row source: https://www.admissions.caltech.edu/apply/first-year-applicants/supplemental-application-essays
  - our line (otherRequirements): “research paper, portfolio): optional”
- **us-cs-cmu** (Carnegie Mellon University) — row source: https://www.cmu.edu/admission/admission/admission-consideration
  - our line (otherRequirements): “Supplemental submissions (resumes, artwork, portfolios, recordings, websites) not accepted”
  - our line (otherRequirements): “InitialView or Vericant interview: recommended, not required, for non-native English speakers”
  - university text (otherRequirements): “Carnegie Mellon doesn’t accept supplemental submissions, such as resumes, artwork, portfolios, recording or websites.”
  - university text (otherRequirements): “InitialView or Vericant interviews are recommended for nonnative English speakers but aren't required.”
- **us-engineering-cmu** (Carnegie Mellon University) — row source: https://www.cmu.edu/admission/admission/admission-consideration
  - our line (otherRequirements): “Supplemental submissions (resumes, artwork, portfolios, recordings, websites) not accepted”
  - our line (otherRequirements): “InitialView or Vericant interview: recommended, not required, for non-native English speakers”
  - university text (otherRequirements): “Carnegie Mellon doesn’t accept supplemental submissions, such as resumes, artwork, portfolios, recording or websites.”
  - university text (otherRequirements): “InitialView or Vericant interviews are recommended for nonnative English speakers but aren't required.”
- **us-business-cmu** (Carnegie Mellon University) — row source: https://www.cmu.edu/admission/admission/admission-consideration
  - our line (otherRequirements): “Supplemental submissions (resumes, artwork, portfolios, recordings, websites) not accepted”
  - our line (otherRequirements): “InitialView or Vericant interview: recommended, not required, for non-native English speakers”
  - university text (otherRequirements): “Carnegie Mellon doesn’t accept supplemental submissions, such as resumes, artwork, portfolios, recording or websites.”
  - university text (otherRequirements): “InitialView or Vericant interviews are recommended for nonnative English speakers but aren't required.”
- **us-maths-cmu** (Carnegie Mellon University) — row source: https://www.cmu.edu/admission/admission/admission-consideration
  - our line (otherRequirements): “Supplemental submissions (resumes, artwork, portfolios, recordings, websites) not accepted”
  - our line (otherRequirements): “InitialView or Vericant interview: recommended, not required, for non-native English speakers”
  - university text (otherRequirements): “Carnegie Mellon doesn’t accept supplemental submissions, such as resumes, artwork, portfolios, recording or websites.”
  - university text (otherRequirements): “InitialView or Vericant interviews are recommended for nonnative English speakers but aren't required.”
- **us-cs-berkeley** (UC Berkeley) — row source: https://engineering.berkeley.edu/admissions/undergraduate-admissions/get-ready-to-apply-freshman/
  - our line (otherRequirements): “No interviews (alumni or admissions officer); InitialView materials optional for international applicants”
  - our line (otherRequirements): “Portfolios and unsolicited supplemental materials are not accepted”
  - university text (otherRequirements): “UC Berkeley does not offer alumni or admissions officer interviews as part of its application process.”
  - university text (otherRequirements): “Unfortunately, we are unable to accept portfolios, senior-year grades, or other supplemental materials.”
- **us-engineering-berkeley** (UC Berkeley) — row source: https://engineering.berkeley.edu/admissions/undergraduate-admissions/get-ready-to-apply-freshman/
  - our line (otherRequirements): “No interviews (alumni or admissions officer); InitialView materials optional for international applicants”
  - our line (otherRequirements): “Portfolios and unsolicited supplemental materials are not accepted”
  - university text (otherRequirements): “UC Berkeley does not offer alumni or admissions officer interviews as part of its application process.”
  - university text (otherRequirements): “Unfortunately, we are unable to accept portfolios, senior-year grades, or other supplemental materials.”
- **us-economics-berkeley** (UC Berkeley) — row source: https://engineering.berkeley.edu/admissions/undergraduate-admissions/get-ready-to-apply-freshman/
  - our line (otherRequirements): “No interviews (alumni or admissions officer); InitialView materials optional for international applicants”
  - our line (otherRequirements): “Portfolios and unsolicited supplemental materials are not accepted”
  - university text (otherRequirements): “UC Berkeley does not offer alumni or admissions officer interviews as part of its application process.”
  - university text (otherRequirements): “Unfortunately, we are unable to accept portfolios, senior-year grades, or other supplemental materials.”
- **us-business-berkeley** (UC Berkeley) — row source: https://engineering.berkeley.edu/admissions/undergraduate-admissions/get-ready-to-apply-freshman/
  - our line (otherRequirements): “No interviews (alumni or admissions officer); InitialView materials optional for international applicants”
  - our line (otherRequirements): “Portfolios and unsolicited supplemental materials are not accepted”
  - our line (otherRequirements): “Haas supplemental application required for first-year (Spieker Program) applicants: an essay question and a video interview upload”
  - university text (otherRequirements): “UC Berkeley does not offer alumni or admissions officer interviews as part of its application process.”
  - university text (otherRequirements): “Unfortunately, we are unable to accept portfolios, senior-year grades, or other supplemental materials.”
  - university text (otherRequirements): “The supplement includes an essay question and a video interview upload.”
- **us-maths-berkeley** (UC Berkeley) — row source: https://engineering.berkeley.edu/admissions/undergraduate-admissions/get-ready-to-apply-freshman/
  - our line (otherRequirements): “No interviews (alumni or admissions officer); InitialView materials optional for international applicants”
  - our line (otherRequirements): “Portfolios and unsolicited supplemental materials are not accepted”
  - university text (otherRequirements): “UC Berkeley does not offer alumni or admissions officer interviews as part of its application process.”
  - university text (otherRequirements): “Unfortunately, we are unable to accept portfolios, senior-year grades, or other supplemental materials.”
- **us-biomedical-jhu** (Johns Hopkins University) — row source: https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/
  - our line (otherRequirements): “No admissions interviews are offered”
  - university text (otherRequirements): “No, we do not offer interviews as part of our admissions process and are unable to grant meeting requests.”
- **us-cs-jhu** (Johns Hopkins University) — row source: https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/
  - our line (otherRequirements): “No admissions interviews are offered”
  - university text (otherRequirements): “No, we do not offer interviews as part of our admissions process and are unable to grant meeting requests.”
- **us-cs-northwestern** (Northwestern University) — row source: https://admissions.northwestern.edu/apply/requirements.html
  - our line (otherRequirements): “No alumni interviews; InitialView interviews accepted (optional) from students at international high schools”
  - university text (otherRequirements): “Northwestern no longer offers alumni interviews as an optional part of the application process.”
- **us-economics-northwestern** (Northwestern University) — row source: https://admissions.northwestern.edu/apply/requirements.html
  - our line (otherRequirements): “No alumni interviews; InitialView interviews accepted (optional) from students at international high schools”
  - university text (otherRequirements): “Northwestern no longer offers alumni interviews as an optional part of the application process.”
- **us-engineering-northwestern** (Northwestern University) — row source: https://admissions.northwestern.edu/apply/requirements.html
  - our line (otherRequirements): “No alumni interviews; InitialView interviews accepted (optional) from students at international high schools”
  - university text (otherRequirements): “Northwestern no longer offers alumni interviews as an optional part of the application process.”
- **us-cs-brown** (Brown University) — row source: https://admission.brown.edu/first-year/application-checklist
  - our line (otherRequirements): “Personal video introduction (up to 90 seconds) encouraged; InitialView interview is one way to submit it for international students”
- **us-maths-brown** (Brown University) — row source: https://admission.brown.edu/first-year/application-checklist
  - our line (otherRequirements): “Personal video introduction (up to 90 seconds) encouraged; InitialView interview is one way to submit it for international students”
- **us-economics-brown** (Brown University) — row source: https://admission.brown.edu/first-year/application-checklist
  - our line (otherRequirements): “Personal video introduction (up to 90 seconds) encouraged; InitialView interview is one way to submit it for international students”
- **us-cs-cornell** (Cornell University) — row source: https://admissions.cornell.edu/how-to-apply/first-year-applicants
  - our line (otherRequirements): “Personal interviews not required or available (except Architecture)”
  - university text (otherRequirements): “Personal interviews are not required, nor available, for admission to any of Cornell's other undergraduate level programs.”
- **us-maths-cornell** (Cornell University) — row source: https://admissions.cornell.edu/how-to-apply/first-year-applicants
  - our line (otherRequirements): “Personal interviews not required or available (except Architecture)”
  - university text (otherRequirements): “Personal interviews are not required, nor available, for admission to any of Cornell's other undergraduate level programs.”
- **us-engineering-cornell** (Cornell University) — row source: https://admissions.cornell.edu/how-to-apply/first-year-applicants
  - our line (otherRequirements): “Personal interviews not required or available (except Architecture)”
  - university text (otherRequirements): “Personal interviews are not required, nor available, for admission to any of Cornell's other undergraduate level programs.”
- **us-economics-cornell** (Cornell University) — row source: https://admissions.cornell.edu/how-to-apply/first-year-applicants
  - our line (otherRequirements): “Personal interviews not required or available (except Architecture)”
  - university text (otherRequirements): “Personal interviews are not required, nor available, for admission to any of Cornell's other undergraduate level programs.”
- **us-business-cornell** (Cornell University) — row source: https://admissions.cornell.edu/how-to-apply/first-year-applicants
  - our line (otherRequirements): “Personal interviews not required or available (except Architecture)”
  - university text (otherRequirements): “Personal interviews are not required, nor available, for admission to any of Cornell's other undergraduate level programs.”
- **us-economics-vanderbilt** (Vanderbilt University) — row source: https://admissions.vanderbilt.edu/apply/first-year-process/
  - our line (otherRequirements): “No admissions interviews”
  - our line (otherRequirements): “citizens, including undocumented students) or InitialView interview (international / non-U.S.”
  - university text (otherRequirements): “Vanderbilt does not offer interviews through the Office of Undergraduate Admissions.”
- **us-cs-vanderbilt** (Vanderbilt University) — row source: https://admissions.vanderbilt.edu/apply/first-year-process/
  - our line (otherRequirements): “No admissions interviews”
  - our line (otherRequirements): “citizens, including undocumented students) or InitialView interview (international / non-U.S.”
  - university text (otherRequirements): “Vanderbilt does not offer interviews through the Office of Undergraduate Admissions.”
- **us-business-notredame** (University of Notre Dame) — row source: https://admissions.nd.edu/apply/application-overview/
  - our line (otherRequirements): “No interviews; optional Glimpse video (U.S.”
  - university text (otherRequirements): “While we don’t conduct interviews, applicants from U.S.”
- **us-cs-notredame** (University of Notre Dame) — row source: https://admissions.nd.edu/apply/application-overview/
  - our line (otherRequirements): “No interviews; optional Glimpse video (U.S.”
  - university text (otherRequirements): “While we don’t conduct interviews, applicants from U.S.”
- **us-cs-washu** (Washington University in St. Louis) — row source: https://admissions.washu.edu/how-to-apply/first-year-us-applicants/
  - our line (otherRequirements): “No evaluative interviews; third-party interviews such as InitialView strongly encouraged for international students to show English proficiency (not required)”
  - university text (otherRequirements): “While WashU does not conduct nor offer evaluative interviews for admission, students are strongly encouraged to submit third-party interview supplements, such as InitialView, to further demonstrate their English proficiency.”
- **us-business-washu** (Washington University in St. Louis) — row source: https://admissions.washu.edu/how-to-apply/first-year-us-applicants/
  - our line (otherRequirements): “No evaluative interviews; third-party interviews such as InitialView strongly encouraged for international students to show English proficiency (not required)”
  - university text (otherRequirements): “While WashU does not conduct nor offer evaluative interviews for admission, students are strongly encouraged to submit third-party interview supplements, such as InitialView, to further demonstrate their English proficiency.”
- **us-business-emory** (Emory University) — row source: https://goizueta.emory.edu/undergraduate-business-degree/eligibility
  - our line (otherRequirements): “Required at application: Common App personal statement and two Emory short-answer questions; no evaluative interviews (InitialView optional for international applicants)”
  - university text (otherRequirements): “Emory does not offer evaluative interviews with admission staff or alumni.”
- **us-economics-emory** (Emory University) — row source: https://apply.emory.edu/apply/first-year
  - our line (otherRequirements): “No evaluative interviews with admission staff or alumni; international applicants may optionally submit an InitialView interview”
  - university text (otherRequirements): “Emory does not offer evaluative interviews with admission staff or alumni.”
  - university text (otherRequirements): “International applicants may choose to submit a virtual interview through InitialView to share more about their background, interests, and communication skills.”
- **us-cs-ucla** (UCLA) — row source: https://admission.ucla.edu/apply/first-year/first-year-requirements
  - our line (otherRequirements): “No admission interviews; letters of recommendation not required or accepted”
  - university text (otherRequirements): “We do not offer admission interviews.”
- **us-engineering-ucla** (UCLA) — row source: https://admission.ucla.edu/apply/first-year/first-year-requirements
  - our line (otherRequirements): “No admission interviews; letters of recommendation not required or accepted”
  - university text (otherRequirements): “We do not offer admission interviews.”
- **us-economics-ucla** (UCLA) — row source: https://admission.ucla.edu/apply/first-year/first-year-requirements
  - our line (otherRequirements): “No admission interviews; letters of recommendation not required or accepted”
  - university text (otherRequirements): “We do not offer admission interviews.”
- **us-maths-ucla** (UCLA) — row source: https://admission.ucla.edu/apply/first-year/first-year-requirements
  - our line (otherRequirements): “No admission interviews; letters of recommendation not required or accepted”
  - university text (otherRequirements): “We do not offer admission interviews.”
- **us-psychology-ucla** (UCLA) — row source: https://admission.ucla.edu/apply/first-year/first-year-requirements
  - our line (otherRequirements): “No admission interviews; letters of recommendation not required or accepted”
  - university text (otherRequirements): “We do not offer admission interviews.”
- **us-business-usc** (University of Southern California) — row source: https://admission.usc.edu/prospective-students/how-to-apply/what-we-look-for/
  - our line (otherRequirements): “No admission interviews by the Office of Undergraduate Admission”
  - university text (otherRequirements): “The Office of Undergraduate Admission does not conduct admission interviews, nor do we track any form of demonstrated interest in our process.”
  - university text (otherRequirements): “Additional Materials (if required by major) Provide a portfolio, a résumé and/or additional writing samples, if required by your intended major.”
- **us-cs-usc** (University of Southern California) — row source: https://viterbiadmission.usc.edu/apply/
  - our line (otherRequirements): “No admission interviews by the Office of Undergraduate Admission”
  - university text (otherRequirements): “The Office of Undergraduate Admission does not conduct admission interviews, nor do we track any form of demonstrated interest in our process.”
  - university text (otherRequirements): “Additional Materials (if required by major) Provide a portfolio, a résumé and/or additional writing samples, if required by your intended major.”
- **us-cs-gatech** (Georgia Tech) — row source: https://admission.gatech.edu/first-year/personal-essays
  - our line (otherRequirements): “No alumni or admission staff interviews; non-native English speakers may optionally submit a third-party unscripted interview (InitialView or Vericant)”
  - our line (otherRequirements): “No portfolio required for this major (Music Technology is the only major listed as requiring one)”
  - university text (otherRequirements): “Applicants who are non-native English speakers have the option to participate in a third-party, unscripted interview.”
  - university text (otherRequirements): “Students selecting Music Technology as their primary major are required to submit a portfolio and essay as part of your application.”
- **us-engineering-gatech** (Georgia Tech) — row source: https://admission.gatech.edu/first-year/personal-essays
  - our line (otherRequirements): “No alumni or admission staff interviews; non-native English speakers may optionally submit a third-party unscripted interview (InitialView or Vericant)”
  - our line (otherRequirements): “No portfolio required for this major (Music Technology is the only major listed as requiring one)”
  - university text (otherRequirements): “Applicants who are non-native English speakers have the option to participate in a third-party, unscripted interview.”
  - university text (otherRequirements): “Students selecting Music Technology as their primary major are required to submit a portfolio and essay as part of your application.”
- **us-cs-uiuc** (University of Illinois Urbana-Champaign) — row source: https://www.admissions.illinois.edu/essays/
  - university text (otherRequirements): “An audition, portfolio, or interview may be required for Fine and Applied Arts applicants.”
- **us-engineering-uiuc** (University of Illinois Urbana-Champaign) — row source: https://www.admissions.illinois.edu/essays/
  - university text (otherRequirements): “An audition, portfolio, or interview may be required for Fine and Applied Arts applicants.”

## 2. Summary

Course statuses: **interview record** (an official quote describes an interview for that course or route),
**stated no** (the university says it does not interview), **stated no (third-party option only)** (no university
interview, but it accepts an optional third-party interview such as InitialView), **not published** (pages read are
silent), **blocked**, **not open to school leavers**.

| University | Country | Courses | Course statuses | Summary, from the quotes only | Official sample questions |
|---|---|---|---|---|---|
| University of Hong Kong | Hong Kong | 10 | blocked (manual review) (6) · interview record (4) | HKU's central interview schedule pages and the Faculty of Medicine admissions pages reset the connection, but readable faculty pages say Law, the Business School (BBA, BEcon) and BA(AS) hold admission interviews for selected applicants; nothing readable was found for Medicine, CS, Maths, Engineering, Pharmacy or Psychology. | 0 |
| Chinese University of Hong Kong | Hong Kong | 8 | interview record (7) · not published (1) | CUHK says not all programmes conduct selection interviews; its 2026-entry JUPAS schedule lists interview dates for Medicine, Integrated BBA, Computer Science and Engineering, several Engineering programmes, Economics, Law and Architectural Studies; Psychology (JS4862) has no date and its row could not be read reliably. | 0 |
| HKUST | Hong Kong | 7 | interview record (7) | HKUST says an interview is not mandatory except for some programmes; for JUPAS 2026 it makes the interview compulsory for Quantitative Finance and lists an online admission interview for Engineering programmes, while the School of Science FAQ says only IRE, BMH, SSCI-A (AI), BIBU and MAEC may interview; nothing is stated for Economics BBA or Business & Management beyond dashes in the schedule. | 0 |
| Hong Kong Polytechnic University | Hong Kong | 5 | interview record (5) | PolyU's JUPAS interview arrangement page lists interview aims, timing, length, language and mode for each of the five programmes, with invitations limited to suitable, selected or Band A applicants. | 0 |
| City University of Hong Kong | Hong Kong | 5 | interview record (2) · blocked (manual review) (3) | CityU's central admissions and School of Law pages returned a bot-check page, but readable department pages say Computer Science and the BBA Marketing and Global Business majors interview selected or shortlisted applicants; nothing readable was found for Engineering, Law or Business Economics. | 0 |
| University of Toronto | Canada | 6 | not published (4) · interview record (1) · not open to school leavers (1) | U of T Engineering (including Engineering Science) requires a Personal Profile of three timed video responses (via Kira) within the mandatory Engineering Supplemental Application; the university does not call it an interview, and no interview is published for the other listed courses; the JD requires at least 3 years of prior university study. | 0 |
| University of British Columbia | Canada | 5 | not published (4) · interview record (1) | UBC's application page lists a 'Video interview in personal profile' as the supplemental requirement for the Bachelor of Commerce (Vancouver); the Sauder pages with details were blocked, and no interview is published for the other listed courses. | 0 |
| McGill University | Canada | 6 | not published (4) · interview record (2) | McGill interviews Med-P (CEGEP-level entry to the MDCM) candidates by virtual MMI and interviews potentially admissible CEGEP candidates to the BCL/JD; no interview is published for the listed Mathematics, Computer Science, Engineering (BEng) or Economics courses (a separate Global Engineering programme states a video-link interview). | 0 |
| University of Waterloo | Canada | 4 | not published (2) · interview record (1) · stated no (1) | Waterloo requires an asynchronous one-question online video interview (Kira Talent) for all Engineering programmes except Architecture, states that AFM admission is based solely on grades with no SAFAA online interview being run, and publishes only the Admission Information Form (no interview) for Computer Science and Mathematics. | 1 |
| McMaster University | Canada | 3 | stated no (1) · interview record (2) | McMaster Engineering and Computer Science applicants complete a required Kira Talent supplementary application of three recorded video questions and one written question, described as 'interview-style'; for Health Sciences (BHSc) the programme's FAQ, in the context of reconsideration of decisions, says it will not conduct interviews. | 4 |
| Western University | Canada | 3 | interview record (1) · not published (2) | All Ivey AEO (high-school) applicants must complete a five-question Kira Talent video interview; no interview is published for Computer Science or Medical Sciences. | 0 |
| Queen's University | Canada | 3 | interview record (1) · not published (2) | Smith Commerce requires a Kira Talent supplementary application that includes timed recorded video responses (not called an interview); no interview is published for Engineering or Economics. | 0 |
| University of Alberta | Canada | 3 | blocked (manual review) (3) | No University of Alberta admissions or programme page could be read (CloudFront 403 on www.ualberta.ca; HTTP 202 challenge on calendar.ualberta.ca pages), so whether these programmes interview is unknown. | 0 |
| Simon Fraser University | Canada | 2 | not published (1) · stated no (1) | SFU Beedie's BBA supplemental application includes two video interview responses for transfer students only (so not for high-school applicants); nothing is published about interviews for Computing Science. | 0 |
| University of Calgary | Canada | 2 | not published (2) | The University of Calgary's admissions requirements and Business programme pages read here say nothing about interviews for these courses. | 0 |
| University of Ottawa | Canada | 2 | not open to school leavers (1) · not published (1) | Nothing about interviews is published on the pages read; the Common Law JD requires at least three years of prior undergraduate study (except Mature applicants), so it is not a high-school entry route. | 0 |
| Dalhousie University | Canada | 2 | not open to school leavers (1) · not published (1) | Dalhousie's MD requires a 90-120 credit-hour bachelor's degree, so it is not open to high-school applicants; the general undergraduate admission requirements page mentions interviews only for other programmes (e.g. Music audition/interview), not Engineering. | 0 |
| Concordia University | Canada | 2 | stated no (1) · not published (1) | John Molson states undergraduate admission is strictly based on previous academic performance (an interview may be required only in some home-schooled cases); nothing about interviews is published for Computer Science. | 0 |
| York University | Canada | 2 | interview record (1) · not open to school leavers (1) | The mandatory Schulich BBA supplementary application includes six video interview questions plus a timed written response; the Osgoode JD requires at least 3 years of university study, so it is not a high-school entry route. | 0 |
| University of Victoria | Canada | 2 | not open to school leavers (1) · not published (1) | UVic Law admits to the JD only after at least 3 years of post-secondary study, so it is not a high-school entry route; nothing about interviews is published for Computer Science. | 0 |
| Trinity College Dublin | Ireland | 9 | interview record (9) | Trinity states interviews for Medicine for mature applicants and for International Foundation Programme applicants, and says mature applicants may be called for interview where their subject requires it (Psychology after an aptitude test); the non-EU direct-application and Medicine course pages read do not mention interviews. | 0 |
| National University of Singapore | Singapore | 9 | interview record (9) | NUS states that Medicine (among other listed programmes) requires selection tests and/or interviews, that NUS Computing may interview Aptitude-Based Admissions candidates, and that some faculties might require interviews for other programmes; most NUS admissions pages were blocked. | 0 |
| Nanyang Technological University | Singapore | 7 | interview record (7) | NTU states that shortlisted Medicine applicants attend eight one-to-one Multiple Mini-Interviews, that shortlisted Aptitude-based Admissions applicants may be interviewed, and that admission interviews are conducted for selected candidates with certain international qualifications. | 0 |
| Singapore Management University | Singapore | 4 | blocked (manual review) (4) | Every SMU page tried (admissions site, Law, SCIS and Economics sites) returned an Incapsula bot-check page, so nothing could be read. | 0 |
| Singapore University of Technology & Design | Singapore | 2 | interview record (2) | SUTD states that selected applicants (A-Level and other international qualifications) are notified to attend an in-person or online conversation session with SUTD faculty/leader, and that shortlisted applicants with high school results take the SUTD University Entrance Examination. | 0 |
| London School of Economics | UK | 6 | stated no (6) | LSE states it does not interview applicants for any of its programmes, covering all six listed courses. | 0 |
| University College London | UK | 6 | blocked (manual review) (6) | Both UCL undergraduate admissions pages tried returned 403, so nothing could be read. | 0 |
| University of Edinburgh | UK | 7 | stated no (7) | Edinburgh states it interviews undergraduates only for medicine, nursing, teacher education and veterinary medicine and does not interview for any other degree programme, which covers all seven listed courses (including Architecture). | 0 |
| King's College London | UK | 4 | not published (4) | King's lists the courses that require an interview (Medicine, Dentistry, Nursing, Midwifery, Physiotherapy, Pharmacy), which do not include Law, Computer Science, Economics or Psychology, and those four course and entry-requirement pages mention no admission interview; King's does not state that these courses do not interview. | 0 |
| University of Manchester | UK | 6 | not published (2) · stated no (4) | Manchester course pages state no interviews for Economics, Mechanical Engineering and Mathematics, and no interviews as a rule for Management (Accounting and Finance) (reserving the right to interview non-standard applicants); the Computer Science and Law LLB 2027 pages say nothing about admission interviews. | 0 |
| University of Warwick | UK | 6 | stated no (6) | Each of the six Warwick course pages states that Warwick does not typically interview applicants and that offers are based on the UCAS application. | 0 |
| Durham University | UK | 6 | blocked (manual review) (6) | Every durham.ac.uk page tried (admissions policy PDF, undergraduate study page, interviews page, entry-requirements page) returned a CloudFront 403, so nothing could be read. | 0 |
| University of Bristol | UK | 5 | stated no (5) | Each of the five Bristol 2027 admissions statements says applicants are not routinely interviewed and decisions are normally made on the application alone, with interviews only in exceptional circumstances. | 0 |
| University of Bath | UK | 5 | interview record (5) | Bath assesses these courses on the UCAS application, interviewing applicants with certain qualifications (Access to HE Diploma and/or T Level) for Computer Science, Economics, Mechanical Engineering and Accounting & Finance, and others only very exceptionally (the only route stated for Mathematics); interviews are held virtually via Microsoft Teams. | 0 |
| University of Glasgow | UK | 4 | interview record (4) | Glasgow lists interviews as part of selection only for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery (none of the four listed courses), and says applicants for entry into Year 2 may be interviewed in any subject; it publishes no explicit no-interview statement for first-year entry to the listed courses. | 0 |
| University of St Andrews | UK | 3 | stated no (3) | St Andrews states it does not interview for most undergraduate programmes, with interviews only for Medicine, Supported pathway/Gateway programmes, BA International Honours and some part-time study; Computer Science, Economics and Mathematics are not among the exceptions. | 0 |
| University of Leeds | UK | 4 | stated no (4) | Leeds faculty admissions guidance states interviews are not part of the standard admissions process for Engineering and Physical Sciences (covering Computer Science and Civil Engineering), Social Sciences (covering the School of Law; page is for 2026 entry) and the Business School (Economics), though some applicants may occasionally be invited. | 0 |
| University of Nottingham | UK | 3 | not published (2) · stated no (1) | Nottingham's School of Law states it does not normally interview (Law LLB); the Computer Science and Economics course pages and the Economics FAQ say nothing about admission interviews, and the general applying page says only that applicants are invited to interview if their course requires one. | 0 |
| University of Birmingham | UK | 4 | not published (4) | Birmingham says only that some courses require an interview or audition; the Computer Science, Economics, Law and Mechanical Engineering course pages say nothing about admission interviews. | 0 |
| University of Exeter | UK | 4 | not published (4) | Exeter says the majority of courses do not require an interview and that where one is used the individual entry requirements say so; the Economics, Law, Computer Science and Psychology course pages read mention no admission interview, but no page states that these four courses do not interview. | 0 |
| Columbia University | US | 4 | stated no (4) | Columbia's Alumni Representative Committee page states that Columbia College and the Fu Foundation School of Engineering and Applied Science discontinued their alumni interview program for applicants from the 2023-2024 admissions cycle. | 0 |
| University of Pennsylvania | US | 3 | not published (3) | The Penn Admissions pages that could be read (how to apply, first-year, international, preparing your application, visit & connect, Ask Penn first-year articles) say nothing about interviews; the Penn Alumni interview pages returned 403. | 0 |
| Caltech | US | 4 | stated no (third-party option only) (4) | Caltech states it does not have an interview process; it recommends (does not require) an InitialView recorded conversation and writing sample for international applicants. | 0 |
| Carnegie Mellon University | US | 4 | stated no (third-party option only) (4) | Carnegie Mellon states it does not offer interviews; InitialView or Vericant interviews are recommended, not required, for nonnative English speakers. | 0 |
| UC Berkeley | US | 5 | stated no (third-party option only) (4) · interview record (1) | UC Berkeley states it does not conduct interviews (no alumni or admissions officer interviews; optional InitialView materials accepted from international applicants), but first-year applicants to the Haas business program must upload a self-recorded video interview as part of the Haas Supplemental Application. | 0 |
| University of Michigan | US | 6 | not published (5) · interview record (1) | Michigan's 2025-26 Common Data Set states that some applicants to Music, Theatre and Dance and some applicants to the College of Engineering may be interviewed; the admissions office, LSA, Ross and Engineering admissions pages were all blocked. | 0 |
| New York University | US | 2 | blocked (manual review) (2) | Every NYU admissions page tried (nyu.edu undergraduate admissions pages and NYU Bulletins admissions pages) was blocked, so nothing could be read about interviews. | 0 |
| Johns Hopkins University | US | 2 | stated no (2) | Johns Hopkins states it does not offer interviews as part of its admissions process. | 0 |
| Northwestern University | US | 3 | stated no (third-party option only) (3) | Northwestern states it no longer offers alumni interviews and cannot offer interviews, but accepts optional InitialView interviews from students applying from international high schools. | 0 |
| Brown University | US | 3 | stated no (third-party option only) (3) | Brown states its admission process no longer includes alumni interviews (since 2019-20); applicants may instead submit an optional video introduction, one route being a third-party InitialView interview for international students or students from non-traditional learning backgrounds. | 0 |
| Cornell University | US | 5 | stated no (5) | Cornell's QuestBridge applicants page states that personal interviews are not available for applicants to any of Cornell's undergraduate programs. | 0 |
| Vanderbilt University | US | 2 | stated no (third-party option only) (2) | Vanderbilt states it does not offer interviews through the Office of Undergraduate Admissions; international applicants and non-U.S. citizens may optionally schedule a video interview with InitialView. | 0 |
| University of Notre Dame | US | 2 | stated no (2) | A Notre Dame admissions FAQ page on m.nd.edu states that interviews are not part of its evaluation process. (The m.nd.edu page footer reads Copyright © 2017, so it may be dated; the current admissions.nd.edu How to Apply page does not mention interviews.) | 0 |
| Washington University in St. Louis | US | 2 | stated no (third-party option only) (2) | WashU states it does not conduct nor offer evaluative interviews for admission; it strongly encourages third-party interview supplements such as InitialView to demonstrate English proficiency and accepts InitialView or Vericant interviews from international students. | 0 |
| Emory University | US | 2 | stated no (third-party option only) (2) | Emory states it does not offer evaluative interviews with admission staff or alumni; international applicants may optionally submit a virtual InitialView interview, which Emory strongly recommends for applicants from Mainland China. | 0 |
| UCLA | US | 5 | stated no (5) | UCLA states it does not offer admission interviews; applicants are considered based on the UC application, with supplemental applications only for some specialty-school majors. | 0 |
| University of Southern California | US | 2 | stated no (2) | USC's Office of Undergraduate Admission states it does not conduct admission interviews; some schools may interview as part of additional requirements, and the listed schools with additional requirements include Marshall only for the World Bachelor in Business and do not include Viterbi. | 0 |
| Georgia Tech | US | 2 | stated no (third-party option only) (2) | Georgia Tech states it does not conduct alumni or admission staff interviews; non-native English speakers may optionally take a third-party, unscripted interview (InitialView or Vericant). | 0 |
| University of Virginia | US | 3 | stated no (1) · blocked (manual review) (2) | UVA's undergraduate admission site returned a Cloudflare challenge so its interview policy could not be read; McIntire's B.S. in Commerce FAQ (an application made by current UVA students and transfer applicants) answers 'No' to whether an interview is required. | 0 |
| University of Illinois Urbana-Champaign | US | 2 | not published (2) | The Illinois undergraduate admissions pages read (essays, requirements, first-year requirements, policies, FAQ index, international requirements) do not mention interviews; the Fine and Applied Arts applying page could not be fetched. | 0 |
| Purdue University | US | 2 | not published (2) | Purdue's first-year criteria, apply, application guide, international and Future Engineers FAQ pages do not mention admission interviews. | 0 |
| UNC Chapel Hill | US | 2 | interview record (1) · not published (1) | Kenan-Flagler lists a video interview among application requirements for current UNC students and admitted transfer students applying to the Undergraduate Business Program, while high-school Assured Enrollment nominees need no supplemental application; UNC's admissions FAQ on interviews was blocked. | 0 |

## 3. Per university

### University of Hong Kong (Hong Kong)

HKU's central interview schedule pages and the Faculty of Medicine admissions pages reset the connection, but readable faculty pages say Law, the Business School (BBA, BEcon) and BA(AS) hold admission interviews for selected applicants; nothing readable was found for Medicine, CS, Maths, Engineering, Pharmacy or Psychology.

Courses: hk-medicine-hku — blocked (manual review); hk-cs-hku — blocked (manual review); hk-maths-hku — blocked (manual review); hk-engineering-hku — blocked (manual review); hk-law-hku — interview record; hk-economics-hku — interview record; hk-business-hku — interview record; hk-architecture-hku — interview record; hk-pharmacy-hku — blocked (manual review); hk-psychology-hku — blocked (manual review).

**Record `hku-law`** — Law (LLB); covers hk-law-hku; interviewed: *yes (selected applicants; JUPAS group interviews, non-JUPAS panel interview)*

Format:

> “For JUPAS, the Faculty invites selected Band A applicants to attend group interviews after the release of HKDSE results. Please refer to Interview Schedules | Admissions Office, the Registry for the latest updates. For Non-JUPAS, selected applicants are invited to a panel interview. Small group interviews are usually held from December onwards.”  
> — https://www.law.hku.hk/prospective-students/ug-faq (read 2026-11-15)

Notes: Faculty of Law undergraduate FAQ (question 11, LLB and BA&LLB). It covers both JUPAS and Non-JUPAS routes. The FAQ points to the central Interview Schedules page on admissions.hku.hk, which reset the connection (blocked). No sample questions found.

**Record `hku-business`** — Business Administration (BBA) and Economics (BEcon/BEcon&Fin); covers hk-business-hku, hk-economics-hku; interviewed: *selective (shortlisted JUPAS applicants)*

Format:

> “12. How will the interviews be conducted? In general, the interview will involve a group discussion in English. Other interview format may also be adopted as appropriate. More details will be provided in the interview invitation.”  
> — https://ug.hkubs.hku.hk/admission/faq/jupas-applicants (read 2026-11-15)

What is assessed:

> “9. Do you interview HKDSE applicants? Interviews will be offered to shortlisted applicants on a selective basis. Applicants who perform well in the interview may receive additional bonus in the selection process on top of their performance in the HKDSE examination.”  
> — https://ug.hkubs.hku.hk/admission/faq/jupas-applicants (read 2026-11-15)

Notes: HKU Business School FAQ for JUPAS applicants; it lists 6755 BBA and 6767 BEcon/BEcon&Fin among programmes offered by HKU Business School. The FAQ also says: "Normally only Band A applicants will be considered for interview invitation." The non-JUPAS FAQ page reset the connection (blocked). No sample questions found.

**Record `hku-architecture`** — Architectural Studies (BA(AS)); covers hk-architecture-hku; interviewed: *yes (admissions interview mentioned)*

What is assessed:

> “This exercise is simply a way to encourage those interested in joining our BA(AS) programme to reflect on several issues which will be furthered discussed during the admissions interview.”  
> — https://foa-media.arch.hku.hk/media/upload/2025/10/HKU_FoA_AdmBrochure_2026-27.pdf (read 2026-11-15)

Notes: Faculty of Architecture admissions brochure 2026-27 (BA(AS), JUPAS code 6004); the exercise referred to is an Aptitude Exercise for applicants who include BA(AS) as a programme choice. The brochure gives no interview format or length in readable text. The 2027-28 HKU admissions brochure on admissions.hku.hk was blocked (connection reset). No sample questions found.

**Blocked:** https://admissions.hku.hk/apply/jupas/interview (connection reset (curl 35: Recv failure: Connection reset by peer)); https://admissions.hku.hk/apply/international-qualifications/interview (connection reset (curl 35)); https://admissions.hku.hk/admissions/international/sites/default/files/A_guide_for_students.pdf (connection reset (curl 35)); https://admissions.hku.hk/sites/default/files/2026-10/Digital_AdmBrochure_2728.pdf (connection reset (curl 35)); https://med.hku.hk/ugadmissions2020/mbbsfaq.html (redirected to www.med.hku.hk, then connection reset (curl 35)); https://hkumed-ugadmissions.hku.hk/admissions-non-jupas-scheme/?lang=en (connection reset (curl 35)); https://ug.hkubs.hku.hk/admission/faq/non-jupas-applicants (connection reset (curl 35)); https://datasce.cs.hku.hk/index.php/admissions/faq/ (connection reset (curl 35)); https://cs.hku.hk/programmes/beng-compsc/admission (connection reset (curl 35)); https://www.socsc.hku.hk/bpsych/prospective-student/ (HTTP 500)

Pages read: 6 (3 with something relevant).

### Chinese University of Hong Kong (Hong Kong)

CUHK says not all programmes conduct selection interviews; its 2026-entry JUPAS schedule lists interview dates for Medicine, Integrated BBA, Computer Science and Engineering, several Engineering programmes, Economics, Law and Architectural Studies; Psychology (JS4862) has no date and its row could not be read reliably.

Courses: hk-medicine-cuhk — interview record; hk-cs-cuhk — interview record; hk-engineering-cuhk — interview record; hk-economics-cuhk — interview record; hk-law-cuhk — interview record; hk-business-cuhk — interview record; hk-psychology-cuhk — not published; hk-architecture-cuhk — interview record.

**Record `cuhk-all`** — All programmes that conduct selection interviews (central guidance); covers hk-medicine-cuhk, hk-cs-cuhk, hk-engineering-cuhk, hk-economics-cuhk, hk-law-cuhk, hk-business-cuhk, hk-architecture-cuhk; interviewed: *some programmes (shortlisted candidates)*

Format:

> “19 What is the format or language of the interviews? Bilingual small group or individual interviews are usually scheduled. Details such as the date, time, and language of the interview will be provided in the interview invitation.”  
> — https://admission.cuhk.edu.hk/application/jupas/faq/ (read 2026-11-15)

What is assessed:

> “Reasons for Admission Interview To explore candidates’ special talents / skills which are not reflected in HKDSE results To look for candidates with interest / passion in the subject or discipline To observe if the candidate is suitable for a programme or profession To break the tie To provide a channel for both parties to get to know each other”  
> — https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf (read 2026-11-15)

Preparation advice:

> “Tips: Prepare the information in point form so you can easily present yourself no matter how you are being asked. Try NOT to recite the materials.”  
> — https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf (read 2026-11-15)

Preparation advice:

> “Research Visit the programme & university website Search if there are any latest developments in the programme / subject / discipline Reach out to your teachers & alumni for insights & advice Pay attention to local and international news”  
> — https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf (read 2026-11-15)

Preparation advice:

> “Tips: Sometimes there is no standard or correct answer. Your attitude in dealing with difficult questions / situations will show the interviewers what kind of person you are.”  
> — https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf (read 2026-11-15)

Preparation advice:

> “Try to say something even when you don’t know the answer An interview is a communication process, not a test. Interviewers appreciate efforts and sincerity”  
> — https://cuhk.edu.hk/adm/jupas/get-into-cuhk/information_package_interview.pdf (read 2026-11-15)

Notes: JUPAS route. Central JUPAS FAQ and the Office of Admissions "All You Need to Know about Admission Interview" information package (its timeline is for 2024). The 2026 arrangement PDF says "not all programmes at the University conduct selection interviews before making an admission offer." The package lists self-reflection prompts (e.g. why you want to study the programme) for preparation; these are not presented as interview questions, so none are recorded as sample questions. courseIds are the programmes with listed interview dates (see subject records).

**Record `cuhk-medicine`** — Medicine (MBChB); covers hk-medicine-cuhk; interviewed: *yes (shortlisted applicants, JUPAS and non-JUPAS)*

Format:

> “Shortlisted applicants are interviewed individually by two panel members.”  
> — https://med.cuhk.edu.hk/study/prospective-students/undergraduate-study/programme-and-admission/mbchb-and-gps/admissions/interview (read 2026-11-15)

Number and length:

> “The individual interview will be conducted in English and last for about 15 minutes.”  
> — https://med.cuhk.edu.hk/study/prospective-students/undergraduate-study/programme-and-admission/mbchb-and-gps/admissions/interview (read 2026-11-15)

What is assessed:

> “Questions will be asked to explore the student's interest in medicine, general knowledge about health care, opinions about ethics and humanism, and teamwork, leadership and communication.”  
> — https://med.cuhk.edu.hk/study/prospective-students/undergraduate-study/programme-and-admission/mbchb-and-gps/admissions/interview (read 2026-11-15)

Notes: Faculty of Medicine MBChB & GPS interview page (last modified Aug 2026) gives JUPAS and Non-JUPAS interview dates and says: "From the 2023 entry onwards, Medicine Programme will resume 100% in-person panel interviews unless under special circumstances (e.g. COVID-related)." Graduate Entry Track applicants also attend a group interview. No sample questions published.

**Record `cuhk-business`** — Integrated Business Administration (BBA); covers hk-business-cuhk; interviewed: *yes (JUPAS Band A applicants invited; non-JUPAS shortlisted)*

Format:

> “For JUPAS candidates of 2026 entry, please note that CUHK Business School will conduct face-to-face admission interviews. Hong Kong JUPAS candidates who have placed any of our business programme(s) in Band A by the deadline of updating JUPAS programme choices on 27 May 2026 will be invited to the interview.”  
> — https://ug.bschool.cuhk.edu.hk/jupas-admissions-interviews/ (read 2026-11-15)

Number and length:

> “Interviews (group or individual) will be conducted in English. Candidates should reserve at least one hour for the actual admission interviews, excluding the 30-minute registration time beforehand.”  
> — https://ug.bschool.cuhk.edu.hk/jupas-admissions-interviews/ (read 2026-11-15)

What is assessed:

> “The selection interview is an opportunity for the programme to better understand the aptitude and aspiration of an applicant.”  
> — https://ug.bschool.cuhk.edu.hk/admission-faqs (read 2026-11-15)

Preparation advice:

> “Dress code: Business Formal.”  
> — https://ug.bschool.cuhk.edu.hk/jupas-admissions-interviews/ (read 2026-11-15)

Notes: JUPAS page applies to JS4202 Integrated BBA among others. For the international / non-JUPAS local route the Business School FAQ says: "Short-listed applicants will be invited to attend an interview. Interviews are normally held from December to August. For overseas applicants who are not available in Hong Kong, telephone / online interviews may be arranged if possible." (source: https://ug.bschool.cuhk.edu.hk/admission-faqs). No sample questions published.

**Record `cuhk-cs`** — Computer Science and Engineering; covers hk-cs-cuhk; interviewed: *listed with interview date (JUPAS, shortlisted)*

Format:

> “JS4412 Computer Science and Engineering Mid June”  
> — https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf (read 2026-11-15)

Notes: Interview Arrangements (2026 Entry) PDF from the Office of Admissions and Financial Aid (JUPAS). The PDF notes: "Only shortlisted candidates will be invited for interview." The PDF marks before/after-results columns with symbols that do not survive text extraction, so only the listed dates are recorded. General CUHK format and preparation advice: see record cuhk-all.

**Record `cuhk-engineering`** — Engineering; covers hk-engineering-cuhk; interviewed: *some Engineering programmes listed with interview dates (JUPAS, shortlisted)*

Format:

> “JS4446 Information Engineering 18 - 29 May”  
> — https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf (read 2026-11-15)

Notes: Interview Arrangements (2026 Entry) PDF from the Office of Admissions and Financial Aid (JUPAS). The PDF notes: "Only shortlisted candidates will be invited for interview." The PDF marks before/after-results columns with symbols that do not survive text extraction, so only the listed dates are recorded. General CUHK format and preparation advice: see record cuhk-all. Other Faculty of Engineering programmes in the PDF also carry dates (e.g. JS4412 Mid June, JS4460 Biomedical Engineering May).

**Record `cuhk-economics`** — Economics; covers hk-economics-cuhk; interviewed: *listed with interview date (JUPAS, shortlisted)*

Format:

> “JS4824 Economics Late June”  
> — https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf (read 2026-11-15)

Notes: Interview Arrangements (2026 Entry) PDF from the Office of Admissions and Financial Aid (JUPAS). The PDF notes: "Only shortlisted candidates will be invited for interview." The PDF marks before/after-results columns with symbols that do not survive text extraction, so only the listed dates are recorded. General CUHK format and preparation advice: see record cuhk-all.

**Record `cuhk-law`** — Law (LLB); covers hk-law-cuhk; interviewed: *listed with interview date (JUPAS, shortlisted)*

Format:

> “JS4903 Bachelor of Laws 11 - 16 June”  
> — https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf (read 2026-11-15)

Notes: Interview Arrangements (2026 Entry) PDF from the Office of Admissions and Financial Aid (JUPAS). The PDF notes: "Only shortlisted candidates will be invited for interview." The PDF marks before/after-results columns with symbols that do not survive text extraction, so only the listed dates are recorded. General CUHK format and preparation advice: see record cuhk-all.

**Record `cuhk-architecture`** — Architectural Studies; covers hk-architecture-cuhk; interviewed: *listed with interview date (JUPAS, shortlisted)*

Format:

> “JS4812 Architectural Studies Late May - early June”  
> — https://admission.cuhk.edu.hk/wp-content/uploads/2026/03/Interview-Arrangement-2026-Entry.pdf (read 2026-11-15)

Notes: Interview Arrangements (2026 Entry) PDF from the Office of Admissions and Financial Aid (JUPAS). The PDF notes: "Only shortlisted candidates will be invited for interview." The PDF marks before/after-results columns with symbols that do not survive text extraction, so only the listed dates are recorded. General CUHK format and preparation advice: see record cuhk-all.

Pages read: 6 (6 with something relevant).

### HKUST (Hong Kong)

HKUST says an interview is not mandatory except for some programmes; for JUPAS 2026 it makes the interview compulsory for Quantitative Finance and lists an online admission interview for Engineering programmes, while the School of Science FAQ says only IRE, BMH, SSCI-A (AI), BIBU and MAEC may interview; nothing is stated for Economics BBA or Business & Management beyond dashes in the schedule.

Courses: hk-cs-hkust — interview record; hk-engineering-hkust — interview record; hk-economics-hkust — interview record; hk-business-hkust — interview record; hk-sciences-hkust — interview record; hk-maths-hkust — interview record; hk-quantfin-hkust — interview record.

**Record `hkust-all`** — All programmes (international qualifications route); covers hk-cs-hkust, hk-engineering-hkust, hk-economics-hkust, hk-business-hkust, hk-sciences-hkust, hk-maths-hkust, hk-quantfin-hkust; interviewed: *may be arranged (compulsory for some programmes)*

Format:

> “An admissions interview may be arranged, but is not a mandatory procedure of the admissions exercise except for some programs. You may click here to view the interview requirements. When you are invited for an interview, our colleagues will contact you on the arrangements via email.”  
> — https://join.hkust.edu.hk/node/7 (read 2026-11-15)

Notes: Applies to applicants with international qualifications (page redirected to join.hkust.edu.hk/admissions/international-qualifications/application-procedures). The linked page did not show the interview requirements in its readable text. No sample questions published.

**Record `hkust-engineering`** — Engineering (incl. Computer Science and Engineering); covers hk-engineering-hkust, hk-cs-hkust; interviewed: *yes (JUPAS admission interview listed, online)*

Format:

> “Events related to admission to Engineering programs. Engineering Exploration Day 📅 11 May 2026 📍 HKUST Campus Admission Interview 📅 20-21 May 2026 🛜 Online”  
> — https://join.hkust.edu.hk/admissions/jupas (read 2026-11-15)

Notes: JUPAS Interview table on join.hkust.edu.hk (2026 intake). In the page HTML this cell sits in the "Before Release of HKDSE Results" column and spans the School of Engineering rows, including JS5240 Department of Computer Science and Engineering; JS5260 also lists 22 – 23 July 2026 after results. The page says: "Individual interview notifications will be sent to selected candidates shortly before their interviews." The School of Engineering JUPAS FAQ page did not mention interviews. No sample questions published.

**Record `hkust-quantfin`** — Quantitative Finance (BSc); covers hk-quantfin-hkust; interviewed: *yes (compulsory, JUPAS)*

Format:

> “Interview is compulsory for the following programs： International Research Enrichment (IRE) BSc in Biomedical and Health Sciences (BMH) BBA Global Business (GBUS) BSc Economics & Finance (ECOF) BSc Quantitative Finance (QFIN)”  
> — https://join.hkust.edu.hk/admissions/jupas (read 2026-11-15)

Notes: Same JUPAS Interview table lists "JS5332 BSc in Quantitative Finance 31 May 2026 24 July 2026" (before / after release of HKDSE results). No sample questions published.

**States no interview:**

For hk-sciences-hkust, hk-maths-hkust:

> “Are there any JUPAS interviews? For 2026 intake, only IRE, BMH, SSCI-A (AI), BIBU and MAEC programs may invite applicants to attend the admissions interview.”  
> — https://science.hkust.edu.hk/academic_programs/undergrad_prog/faq?page=1 (read 2026-11-15)

**Blocked:** https://join.ust.hk/admissions/jupas (TLS error: certificate has expired (curl 60); same content later read at join.hkust.edu.hk); https://bmundergrad.hkust.edu.hk/admissions/faqs/international-qualifications (TLS/certificate error (curl 60))

Pages read: 5 (3 with something relevant).

### Hong Kong Polytechnic University (Hong Kong)

PolyU's JUPAS interview arrangement page lists interview aims, timing, length, language and mode for each of the five programmes, with invitations limited to suitable, selected or Band A applicants.

Courses: hk-engineering-polyu — interview record; hk-nursing-polyu — interview record; hk-business-polyu — interview record; hk-architecture-polyu — interview record; hk-cs-polyu — interview record.

**Record `polyu-business`** — Business Administration (Bachelor's Degree Scheme); covers hk-business-polyu; interviewed: *some applicants (suitable candidates may be invited)*

Format:

> “Medium English Mode Group/ individual interview Remarks Suitable candidates may be invited for an interview.”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement (read 2026-11-15)

Number and length:

> “Date of Interview June/July, if necessary Duration About 15-30 minutes”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement (read 2026-11-15)

What is assessed:

> “JS3003 Business Administration Aims To evaluate applicants’ potential and interest in the programme and to test their language and communication skills.”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement (read 2026-11-15)

Notes: PolyU JUPAS Interview Arrangement page (2027/28). The page says arrangements may change and that schemes/programmes "which do not specify any interview arrangement at the Study@PolyU may also invite applicants to attend an interview if deemed necessary." No sample questions published.

**Record `polyu-engineering`** — Engineering (Bachelor's Degree Scheme); covers hk-engineering-polyu; interviewed: *some applicants (suitable candidates may be invited)*

Format:

> “Medium English Mode Individual / Group interview Remarks Suitable candidates may be invited for an interview.”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement (read 2026-11-15)

Number and length:

> “Date of Interview June / July Duration 20 - 30 minutes”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement (read 2026-11-15)

What is assessed:

> “JS3004 Construction and Environment JS3005 Engineering JS3006 Computer and Mathematical Sciences Aims To evaluate applicants' suitability for the Bachelor's Degree Scheme”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement (read 2026-11-15)

Notes: PolyU JUPAS Interview Arrangement page (2027/28). The page says arrangements may change and that schemes/programmes "which do not specify any interview arrangement at the Study@PolyU may also invite applicants to attend an interview if deemed necessary." No sample questions published.

**Record `polyu-architecture`** — Architectural Studies; covers hk-architecture-polyu; interviewed: *selected Band A applicants (portfolio plus aptitude tests and/or interviews)*

Format:

> “Medium English Mode Individual / Group interview Remarks Selected Band A applicants will be required to submit a personal portfolio to showcase their design capabilities and attend aptitude tests and/or interviews.”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=1 (read 2026-11-15)

Number and length:

> “Date of Interview Before the announcement of HKDSE results. Duration About 20 minutes”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=1 (read 2026-11-15)

What is assessed:

> “JS3214 Architectural Studies Aims Interviews will be conducted to gain a better understanding of applicants’ overall academic and non-academic qualities and achievements.”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=1 (read 2026-11-15)

Notes: PolyU JUPAS Interview Arrangement page (2027/28). The page says arrangements may change and that schemes/programmes "which do not specify any interview arrangement at the Study@PolyU may also invite applicants to attend an interview if deemed necessary." No sample questions published.

**Record `polyu-computing`** — Computing and AI (BSc (Hons) Scheme); covers hk-cs-polyu; interviewed: *usually Band A applicants invited*

Format:

> “Medium English Mode Group/Individual discussion Remarks Usually only Band A applicants will be invited to an interview.”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=4 (read 2026-11-15)

Number and length:

> “Date of Interview July Duration About 30 minutes”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=4 (read 2026-11-15)

What is assessed:

> “JS3868 Computing and AI (Computer Science / Enterprise Information Systems) Aims 1. To understand the potential and interest of applicants to the Bachelor of Science (Honours) Scheme in Computing and AI. 2. To evaluate whether applicants’ expectations regarding the programme/career path match our objectives. 3. To assess applicants’ language and communication abilities.”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=4 (read 2026-11-15)

Notes: PolyU JUPAS Interview Arrangement page (2027/28). The page says arrangements may change and that schemes/programmes "which do not specify any interview arrangement at the Study@PolyU may also invite applicants to attend an interview if deemed necessary." No sample questions published.

**Record `polyu-nursing`** — Nursing; covers hk-nursing-polyu; interviewed: *Band A applicants considered for interview*

Format:

> “Medium Cantonese and English Mode Group interview Remarks Band A applicants will be considered for interview.”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=3 (read 2026-11-15)

Number and length:

> “Date of Interview Between May and August Duration About 1 hour”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=3 (read 2026-11-15)

What is assessed:

> “JS3648 Nursing Aims To evaluate the potential and interest of applicants in the programme, and to assess their language and communication skills and understanding of the nursing discipline.”  
> — https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-interview-arrangement?page=3 (read 2026-11-15)

Notes: PolyU JUPAS Interview Arrangement page (2027/28). The page says arrangements may change and that schemes/programmes "which do not specify any interview arrangement at the Study@PolyU may also invite applicants to attend an interview if deemed necessary." No sample questions published.

Pages read: 5 (4 with something relevant).

### City University of Hong Kong (Hong Kong)

CityU's central admissions and School of Law pages returned a bot-check page, but readable department pages say Computer Science and the BBA Marketing and Global Business majors interview selected or shortlisted applicants; nothing readable was found for Engineering, Law or Business Economics.

Courses: hk-cs-cityu — interview record; hk-engineering-cityu — blocked (manual review); hk-law-cityu — blocked (manual review); hk-business-cityu — interview record; hk-economics-cityu — blocked (manual review).

**Record `cityu-cs`** — Computer Science (BSc); covers hk-cs-cityu; interviewed: *selected applicants (JUPAS); normally invited (direct application)*

Format:

> “Do JUPAS Applicants need to attend Admission Interviews ? Selected applicants may be invited for admission interview after the announcement of HKDSE examination results in late July .”  
> — https://admission.cs.cityu.edu.hk/before-admission-jupas/jupas-interview (read 2026-11-15)

What is assessed:

> “Purpose To identify students' motivation for taking our major; To let the students to know more about our major and To evaluate students' suitability for our major based on personal characters and non-academic performance.”  
> — https://admission.cs.cityu.edu.hk/before-admission-jupas/jupas-interview (read 2026-11-15)

Notes: Department of Computer Science admission site. For the direct (non-JUPAS, local HD/AD) route it says: "We normally will invite applicants to attend admission interviews before making offers of admission into BSc Computer Science." (source: https://admission.cs.cityu.edu.hk/en/before-admission-local/admission-interviews). Both pages point to a preparation video; no written sample questions.

**Record `cityu-business-marketing`** — Business Administration – Marketing major (BBA); covers hk-business-cityu; interviewed: *yes (JUPAS admission interview)*

Format:

> “The JUPAS admission interview will be held in late June. It is conducted in English and is comprised of two sessions: a 15-mintue group interview and a 90-second self-introduction.”  
> — https://www.cb.cityu.edu.hk/MKT/bbamkt/admission/FAQ (read 2026-11-15)

What is assessed:

> “Some common group discussion topics would be about current affairs and drawing up marketing plan on site in response to some topical issues, while some may come in forms of situational questions.”  
> — https://www.cb.cityu.edu.hk/MKT/bbamkt/admission/FAQ (read 2026-11-15)

Notes: Department of Marketing BBA FAQ; applies to the Marketing major only. No sample questions published.

**Record `cityu-business-global-business`** — Business Administration – Global Business major (BBA); covers hk-business-cityu; interviewed: *shortlisted applicants (all Band A invited)*

Format:

> “An interview would be scheduled around June for shortlisted applicants only. All band A applicants will be invited to join the interview while students of other choices will be invited subject to availability of interview places.”  
> — https://prog.cb.cityu.edu.hk/academics/bbagbu/admissions (read 2026-11-15)

Notes: BBA Global Business programme admissions page (JUPAS FAQ). The page also says: "Interview is not a must but it will SIGNIFICANTLY increase students’ chance to join the programme ." No sample questions published.

**Blocked:** https://cityu.edu.hk/admo/interview-arrangements-local-jupas-applicants (HTTP 200 but only an Incapsula bot-check script page (no content)); https://www.cityu.edu.hk/admo/faq (HTTP 200 but only an Incapsula bot-check script page (no content)); https://cityu.edu.hk/admo/apply-now/non-local-applicants (HTTP 200 but only an Incapsula bot-check script page (no content)); https://www.cityu.edu.hk/slw/prospective-students/undergraduate-programme/bachelor-of-laws-llb (HTTP 200 but only an Incapsula bot-check script page (no content)); https://www.cityu.edu.hk/admo/programmes/bachelor-laws (HTTP 200 but only an Incapsula bot-check script page (no content))

Pages read: 5 (4 with something relevant).

### University of Toronto (Canada)

U of T Engineering (including Engineering Science) requires a Personal Profile of three timed video responses (via Kira) within the mandatory Engineering Supplemental Application; the university does not call it an interview, and no interview is published for the other listed courses; the JD requires at least 3 years of prior university study.

Courses: ca-cs-utoronto — not published; ca-maths-toronto — not published; ca-engineering-utoronto — interview record; ca-medicine-utoronto — not published; ca-economics-utoronto — not published; ca-law-utoronto — not open to school leavers.

**Record `utoronto-engineering`** — Engineering (incl. Engineering Science); covers ca-engineering-utoronto; interviewed: *required timed video responses (Personal Profile in the Engineering Supplemental Application; not called an interview)*

Format:

> “The Personal Profile is comprised of three timed video responses that will help us get to know you as a person.”  
> — https://discover.engineering.utoronto.ca/how-to-apply/supplemental-application/ (read 2026-11-15)

Number and length:

> “The Personal Profile is a component of the Engineering Supplemental Application that takes about 30 minutes to complete online. It consists of three randomly-selected, timed video questions.”  
> — https://discover.engineering.utoronto.ca/how-to-apply/faqs/ (read 2026-11-15)

What is assessed:

> “We are interested in your reasoning and communication skills – keep in mind, there is no ‘right’ answer.”  
> — https://discover.engineering.utoronto.ca/how-to-apply/supplemental-application/ (read 2026-11-15)

Preparation advice:

> “While no specific preparation is required, similar to preparing for a job interview, you may wish to reflect on your past experiences and your passion for Engineering. We also recommend that you practice getting familiar with the technology being used a few days in advance to avoid any last-minute issues.”  
> — https://discover.engineering.utoronto.ca/how-to-apply/faqs/ (read 2026-11-15)

Preparation advice:

> “You will be able to complete the practice questions as many times as you would like before completing your assessment. Please do your best to be yourself — you will be assessed on the content of your answers.”  
> — https://discover.engineering.utoronto.ca/how-to-apply/faqs/ (read 2026-11-15)

Notes: ESA page: 'The Engineering Supplemental Application is a mandatory part of your application.' future.utoronto.ca/supplemental-applications lists 'All Engineering programs Engineering Supplemental Application (ESA)'. The FAQ says responses are given on the Kira Talent platform. The university calls this a Personal Profile, not an interview.

**Not open to school leavers** (ca-law-utoronto): not applicable to high-school applicants (JD is a second-entry programme).

> “To be eligible, you must have completed at least 3 years of full time study (or equivalent, as defined by your institution) at the time of application.”  
> — https://jackmanlaw.utoronto.ca/jd-program/admissions-categories (read 2026-11-15)

**Blocked:** https://www.artsci.utoronto.ca/future/ready-apply/faqs (bot check page ('Verifying you are human...') instead of content)

Pages read: 6 (4 with something relevant).

### University of British Columbia (Canada)

UBC's application page lists a 'Video interview in personal profile' as the supplemental requirement for the Bachelor of Commerce (Vancouver); the Sauder pages with details were blocked, and no interview is published for the other listed courses.

Courses: ca-maths-ubc — not published; ca-cs-ubc — not published; ca-engineering-ubc — not published; ca-business-ubc — interview record; ca-economics-ubc — not published.

**Record `ubc-commerce`** — Commerce (BCom, Sauder); covers ca-business-ubc; interviewed: *yes (video interview in personal profile)*

Format:

> “Bachelor of Commerce Video interview in personal profile”  
> — https://you.ubc.ca/applying-ubc/how-to-apply/application/ (read 2026-11-15)

Notes: From the Vancouver-campus table of supplemental application requirements on you.ubc.ca. The Sauder BCom video interview page and direct-entry page returned 403, so format, length and questions could not be read.

**Blocked:** https://www.sauder.ubc.ca/bachelor-commerce/bcom-video-interview (403); https://www.sauder.ubc.ca/programs/bachelors-degrees/bachelor-commerce/admissions-finance/direct-entry (403)

Pages read: 5 (1 with something relevant).

### McGill University (Canada)

McGill interviews Med-P (CEGEP-level entry to the MDCM) candidates by virtual MMI and interviews potentially admissible CEGEP candidates to the BCL/JD; no interview is published for the listed Mathematics, Computer Science, Engineering (BEng) or Economics courses (a separate Global Engineering programme states a video-link interview).

Courses: ca-maths-mcgill — not published; ca-medicine-mcgill — interview record; ca-cs-mcgill — not published; ca-engineering-mcgill — not published; ca-economics-mcgill — not published; ca-law-mcgill — interview record.

**Record `mcgill-medicine`** — Medicine (Med-P Qualifying Year leading to MDCM); covers ca-medicine-mcgill; interviewed: *yes (invited candidates; required for admission)*

Format:

> “The interviews are in virtual multiple mini-interview (vMMI) format and are conducted virtually by the Faculty of Medicine and Health Sciences. These mini-interviews consist of multiple stations that can be task-oriented, simulation-oriented, scenario-oriented, or discussion-oriented.”  
> — https://www.mcgill.ca/medadmissions/applying/selection-process/multiple-mini-interviews (read 2026-11-15)

Number and length:

> “The virtual MMI is divided into 2 separate Zoom meetings, with a break in between. The length of each zoom interview session is up to one hour.”  
> — https://www.mcgill.ca/medadmissions/mdis (read 2026-11-15)

Stations:

> “The M³I consists of a circuit of between 7 to 10 stations, which can be in any of the following formats: (a) discussion-based (with evaluator present) (b) task-oriented (with or without evaluator present) or (c) controlled scenarios or simulations (with evaluator observing from outside the room). Stations are 7 minutes long, (with the exception of 1 station whose duration is double the length).”  
> — https://www.mcgill.ca/medadmissions/mdis (read 2026-11-15)

What is assessed:

> “Stations are designed to evaluate the various non-medical abilities targeted in the MDCM Program Learning Objectives which in turn references the CanMeds roles developped by the Royal College of Physicians and Surgeons of Canada. The MMIs can at times include themes that may be sensitive or personal for some candidates. Clinical skills are not tested.”  
> — https://www.mcgill.ca/medadmissions/applying/selection-process/multiple-mini-interviews (read 2026-11-15)

Preparation advice:

> “Preparation for the MMIs. It is unnecessary to pay for expensive training programs. We encourage you to be confident, and be yourself!”  
> — https://www.mcgill.ca/medadmissions/mdis (read 2026-11-15)

Preparation advice:

> “A s with all interviews, you are encouraged to reflect on your skills and strengths. Consider resources like your university or community career centre to learn more about the MMI format.”  
> — https://www.mcgill.ca/medadmissions/mdis (read 2026-11-15)

Notes: The direct-entry route for this course is the Med-P Qualifying Year; Med-P page: 'This one-year Qualifying Year is designed exclusively for CEGEP students' (Quebec Collegial/DEC graduates). MMI page: 'Candidates cannot be admitted without an interview.' Application-process page lists Med-P interview dates 'April 20, 21, 22, 23, 2027' under '*(Interviews are held virtually)'. The MDCM itself (university-level entry) is not a high-school route. The older Med-P PDF (Fall 2021) describing in-person interviews was not used.

**Record `mcgill-law`** — Law (BCL/JD, CEGEP/QFB applicant category); covers ca-law-mcgill; interviewed: *yes (CEGEP candidates regarded as potentially admissible)*

Format:

> “Interviews may be held in person at the Faculty of Law or via videoconference.”  
> — https://www.mcgill.ca/law/bcl-jd/admissions-guide/admissions-policy (read 2026-11-15)

Number and length:

> “Conducted by two professors, they are typically no longer than 25 minutes.”  
> — https://www.mcgill.ca/law/bcl-jd/admissions-guide/admissions-policy (read 2026-11-15)

What is assessed:

> “Interviewers engage with applicants to test their ability to articulate a position and their critical thinking skills. Interviewers typically use issues or experiences mentioned in the candidate’s application as a starting point. Particularly for CEGEP candidates, interviewers also assess maturity, readiness for our program, and reasons for studying law directly from CEGEP.”  
> — https://www.mcgill.ca/law/bcl-jd/admissions-guide/admissions-policy (read 2026-11-15)

Notes: The pre-university entry route to the BCL/JD is the CEGEP/QFB applicant category. Applicant-categories page (CEGEP/QFB section): 'Candidates who are regarded as potentially admissible following review of their file are required to attend an interview.' Application-process page: 'Candidates in the CEGEP category whose applications are regarded as potentially admissible will be invited to an interview.' Admissions-policy page: 'We conduct a limited number of admissions interviews, most between March and May.' The law admissions information-session PDF could not be downloaded.

**Blocked:** https://coursecatalogue.mcgill.ca/en/undergraduate/medicine-health-sciences/professional/admission-procedures-requirements/interview-process/ (HTTP 202 with no page content (challenge/empty shell)); https://coursecatalogue.mcgill.ca/en/undergraduate/medicine-health-sciences/professional/admission-procedures-requirements/applicant-categories/ (HTTP 202 with no page content (challenge/empty shell)); https://www.mcgill.ca/law/files/law/09-25-2025_mcgill_bcl-jd_admissions.pdf (connection error: HTTP/2 stream not closed cleanly (INTERNAL_ERROR))

Pages read: 11 (7 with something relevant).

### University of Waterloo (Canada)

Waterloo requires an asynchronous one-question online video interview (Kira Talent) for all Engineering programmes except Architecture, states that AFM admission is based solely on grades with no SAFAA online interview being run, and publishes only the Admission Information Form (no interview) for Computer Science and Mathematics.

Courses: ca-cs-waterloo — not published; ca-engineering-waterloo — interview record; ca-mathematics-waterloo — not published; ca-business-waterloo — stated no.

**Record `waterloo-engineering`** — Engineering; covers ca-engineering-waterloo; interviewed: *yes (required online video interview)*

Format:

> “Once we receive your application, we'll send you instructions for logging in to the Waterloo applicant portal , which will include a link to the online interview platform, Kira Talent. The Engineering interview is asynchronous, meaning you can complete it at a time that works for you.”  
> — https://uwaterloo.ca/engineering/future-students/applying/online-engineering-interview (read 2026-11-15)

Number and length:

> “Please note that there is a 90-second response limit, and you will have only one opportunity to complete your interview response.”  
> — https://uwaterloo.ca/engineering/future-students/applying/online-engineering-interview (read 2026-11-15)

What is assessed:

> “There is no "right" answer to the interview question. We're interested in understanding your personal motivation for studying engineering and why you've chosen your specific engineering program.”  
> — https://uwaterloo.ca/engineering/future-students/applying/online-engineering-interview (read 2026-11-15)

Sample question (Engineering):

> “What experience(s), inside or outside the classroom, motivated you to apply to your chosen engineering program?”  
> — https://uwaterloo.ca/engineering/future-students/applying/online-engineering-interview (read 2026-11-15)

Preparation advice:

> “After accessing Kira Talent, you'll have the opportunity to complete practice questions to familiarize yourself with the platform and interview format.”  
> — https://uwaterloo.ca/engineering/future-students/applying/online-engineering-interview (read 2026-11-15)

Preparation advice:

> “We encourage you to focus on being authentic and specific. We're more interested in hearing your own story and perspective than a rehearsed or "perfect" answer. We also recognize that many applicants are new to interviewing, so assessment focuses on the content of your response rather than polished presentation skills.”  
> — https://uwaterloo.ca/engineering/future-students/applying/online-engineering-interview (read 2026-11-15)

Notes: Interview page: 'Applicants to all Engineering programs (excluding Architecture) are required to complete the online Engineering interview to be considered for admission.' The published question is the actual interview question, not a practice question. Note: a link teaser on the AIF page for a Missing Manual article says 'If, of course, you choose to do it. It's optional!', which conflicts with the interview page and the Engineering FAQ ('The Admission Information Form and online Engineering interview are mandatory parts of an application to all Engineering programs (excluding Architecture).').

**States no interview:**

For ca-business-waterloo:

> “Note: We are not running the SAFAA online interview or trait assessment. Therefore, admissions to AFM and SFM are based solely on grades.”  
> — https://uwaterloo.ca/aspiring-professionals/admission-requirements (read 2026-11-15)

**Blocked:** https://uwaterloo.ca/engineering/undergraduate-students/application-process/admission-information-form (403)

Pages read: 6 (4 with something relevant).

### McMaster University (Canada)

McMaster Engineering and Computer Science applicants complete a required Kira Talent supplementary application of three recorded video questions and one written question, described as 'interview-style'; for Health Sciences (BHSc) the programme's FAQ, in the context of reconsideration of decisions, says it will not conduct interviews.

Courses: ca-medicine-mcmaster — stated no; ca-engineering-mcmaster — interview record; ca-cs-mcmaster — interview record.

**Record `mcmaster-engineering-cs`** — Engineering and Computer Science (Faculty of Engineering supplementary application); covers ca-engineering-mcmaster, ca-cs-mcmaster; interviewed: *required recorded video responses (supplementary application; questions described as interview-style)*

Format:

> “The supplementary application consists of three video questions with a video-recorded response and one written question with a short answer response.”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

Number and length:

> “For each video question, you’ll have 10 seconds to prepare and 2 minutes to respond. For the written question, you’ll have 7 minutes total to read and respond.”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

What is assessed:

> “The Supplementary Application is designed to assess competencies that aren’t captured on a transcript, including engagement, collaboration, innovation & creativity, and resilience.”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

Sample question (Engineering / Computer Science (supplementary application practice question)):

> “Think of an activity, role or responsibility you care about outside of the classroom. What have you learned from it, and how has it made a difference for others, like your teammates, friends or community?”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

Sample question (Engineering / Computer Science (supplementary application practice question)):

> “Describe a situation where a group you were a part of faced a challenge or setback. How did you help the group move forward?”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

Sample question (Engineering / Computer Science (supplementary application practice question)):

> “Tell us about a time when you tested an idea or solution to see if it would work. Explain how you chose your approach and what you learned from the experience.”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

Sample question (Engineering / Computer Science (supplementary application practice question)):

> “Tell us about a situation where something didn’t go according to plan. How did you respond and what did you learn from it?”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

Preparation advice:

> “You will not be asked any skill-testing or technical questions, nor will you be required to solve engineering or technical problems. Instead, the questions will be interview-style, giving you an opportunity to demonstrate how you think, communicate, reflect and respond to different situations.”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

Preparation advice:

> “Structure your responses. Consider using a framework such as the S.T.A.R. method (Situation, Task, Action, Result) to organize your thoughts and communicate your experiences clearly. Practice speaking out loud.”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

Preparation advice:

> “You don’t need to memorize answers or try to present yourself in a certain way – just be yourself.”  
> — https://www.eng.mcmaster.ca/supplementary-application/ (read 2026-11-15)

Notes: Page states it applies to 'Engineering, Integrated Biomedical Engineering & Health Sciences (iBioMed), Computer Science, or the Bachelor of Technology'. The four questions are labelled 'Practice Question' (one per competency) on the page; the page does not say whether each is for the video or written part. FAQ: 'The practice questions are for familiarization only and are completely different from the assessment questions.' (this refers to the Kira platform practice questions). The university calls this a supplementary application, not an interview.

**States no interview:**

For ca-medicine-mcmaster:

> “Admissions decisions are final and we only reconsider applicants in cases where there are errors in the applicant’s high school transcripts. We will not review any additional information or conduct interviews.”  
> — https://hhsp.healthsci.mcmaster.ca/faqs/ (read 2026-11-15)

Pages read: 4 (2 with something relevant).

### Western University (Canada)

All Ivey AEO (high-school) applicants must complete a five-question Kira Talent video interview; no interview is published for Computer Science or Medical Sciences.

Courses: ca-business-western — interview record; ca-cs-western — not published; ca-medicine-western — not published.

**Record `western-ivey-aeo`** — Business (Ivey HBA via Advanced Entry Opportunity); covers ca-business-western; interviewed: *yes (all AEO applicants; video interview)*

Format:

> “All applicants are required to complete a short video interview through the Kira Talent platform. This component is mandatory and can be completed at any time before the application deadline — no scheduling is required.”  
> — https://www.ivey.uwo.ca/hba/admissions/secondary-school-students/ (read 2026-11-15)

Number and length:

> “The interview consists of five questions, each with preparation time and a timed response. The entire interview process typically takes 20 to 30 minutes to complete and must be completed in one sitting.”  
> — https://www.ivey.uwo.ca/hba/admissions/secondary-school-students/ (read 2026-11-15)

What is assessed:

> “This video interview component allows the admissions team to better understand your personality, communication skills, and experiences that may not be captured in the written portion of your application.”  
> — https://www.ivey.uwo.ca/hba/admissions/secondary-school-students/ (read 2026-11-15)

Preparation advice:

> “You may practice as many times as you like before starting the formal interview. Once you begin, all five questions must be completed in one attempt.”  
> — https://www.ivey.uwo.ca/hba/admissions/secondary-school-students/ (read 2026-11-15)

Notes: AEO page also says AEO students must 'Participate in an online video interview as part of your Ivey AEO2 Intent to Register application, if requested.' (in year 2). The URL https://www.ivey.uwo.ca/hba/admissions/aeo-supplemental-application/ redirects to the secondary-school-students page.

Pages read: 4 (3 with something relevant).

### Queen's University (Canada)

Smith Commerce requires a Kira Talent supplementary application that includes timed recorded video responses (not called an interview); no interview is published for Engineering or Economics.

Courses: ca-business-queens — interview record; ca-engineering-queens — not published; ca-economics-queens — not published.

**Record `queens-commerce`** — Commerce (Smith BCom); covers ca-business-queens; interviewed: *required recorded video responses (supplementary application; not called an interview)*

Format:

> “The Supplementary Application is delivered through Kira Talent, a new platform with additional functionality to allow applicants to practice and prepare for the submission of their Supplementary Application.”  
> — https://www.queensu.ca/admission/applying/supplementary-application (read 2026-11-15)

Number and length:

> “There are two video responses. For each question, you will have two minutes to think about your response, and then two minutes to answer. In these questions, you’ll be asked about your experiences, ideas, contributions, and growth.”  
> — https://smith.queensu.ca/bcom/program-details/supplementary-application.php (read 2026-11-15)

What is assessed:

> “Beyond your strong academic foundations and comfort with both qualitative and quantitative subjects, we are looking for evidence of collaboration, initiative, impact, and a passion for business. Self-awareness is also important.”  
> — https://smith.queensu.ca/bcom/program-details/supplementary-application.php (read 2026-11-15)

Preparation advice:

> “Review the instructions and practice. Take time to read the assessment instructions and try the practice questions. You may complete them as many times as you like before starting the formal assessment.”  
> — https://smith.queensu.ca/bcom/program-details/supplementary-application.php (read 2026-11-15)

Preparation advice:

> “Speak naturally. For video responses, speak clearly to the camera. Avoid reciting a script; we want to hear how you communicate and think.”  
> — https://smith.queensu.ca/bcom/program-details/supplementary-application.php (read 2026-11-15)

Notes: Conflict between official pages: the Smith page says 'There are two video responses', while the Queen's admission page says 'The Supplementary Application consists of one written response and one video response.' The Smith page also lists 'one two-part written response, to be completed within 15 minutes'.

Pages read: 4 (2 with something relevant).

### University of Alberta (Canada)

No University of Alberta admissions or programme page could be read (CloudFront 403 on www.ualberta.ca; HTTP 202 challenge on calendar.ualberta.ca pages), so whether these programmes interview is unknown.

Courses: ca-engineering-alberta — blocked (manual review); ca-cs-alberta — blocked (manual review); ca-business-alberta — blocked (manual review).

**Blocked:** https://www.ualberta.ca/en/admissions/undergraduate/admission/admission-requirements/index.html (403 from CloudFront (Request blocked)); https://www.ualberta.ca/en/undergraduate-programs/bachelor-of-commerce.html (403 from CloudFront (Request blocked)); https://www.ualberta.ca/en/undergraduate-programs/engineering.html (403 from CloudFront (Request blocked)); https://www.ualberta.ca/en/undergraduate-programs/computing-science-bsc.html (403 from CloudFront (Request blocked)); https://www.ualberta.ca/en/engineering/programs/undergraduate/index.html (403 from CloudFront (Request blocked)); https://calendar.ualberta.ca/content.php?catoid=69&navoid=20815 (HTTP 202 with no page content (challenge/empty shell)); https://calendar.ualberta.ca/content.php?catoid=69&navoid=21497 (HTTP 202 with no page content (challenge/empty shell))

Pages read: 1 (0 with something relevant).

### Simon Fraser University (Canada)

SFU Beedie's BBA supplemental application includes two video interview responses for transfer students only (so not for high-school applicants); nothing is published about interviews for Computing Science.

Courses: ca-cs-sfu — not published; ca-business-sfu — stated no.

**States no interview:**

For ca-business-sfu:

> “The Supplemental Application includes: A written, short answer response An explanation of the activities you've engaged in and achievements you've accomplished within the last 4 years Two video interview responses (transfer students only) Two references with one being academic in nature (teacher or counsellor for high school students, instructor or professor for transfer students).”  
> — https://www.sfu.ca/students/admission/programs/a-z/b/business/apply.html (read 2026-11-15)

Pages read: 3 (2 with something relevant).

### University of Calgary (Canada)

The University of Calgary's admissions requirements and Business programme pages read here say nothing about interviews for these courses.

Courses: ca-engineering-calgary — not published; ca-business-calgary — not published.

Pages read: 4 (0 with something relevant).

### University of Ottawa (Canada)

Nothing about interviews is published on the pages read; the Common Law JD requires at least three years of prior undergraduate study (except Mature applicants), so it is not a high-school entry route.

Courses: ca-law-ottawa — not open to school leavers; ca-cs-ottawa — not published.

**Not open to school leavers** (ca-law-ottawa): not applicable to high-school applicants (JD is a second-entry programme).

> “Apart from those in the Mature category, applicants must have completed at least three years of undergraduate studies (the equivalent of 90 credits or 30 half-courses) prior to beginning law school.”  
> — https://www.uottawa.ca/faculty-law/common-law/admissions/evaluation-applications (read 2026-11-15)

**Blocked:** https://catalogue.uottawa.ca/en/undergrad/major-computer-science/ (HTTP 202 with no page content (challenge/empty shell))

Pages read: 2 (1 with something relevant).

### Dalhousie University (Canada)

Dalhousie's MD requires a 90-120 credit-hour bachelor's degree, so it is not open to high-school applicants; the general undergraduate admission requirements page mentions interviews only for other programmes (e.g. Music audition/interview), not Engineering.

Courses: ca-medicine-dalhousie — not open to school leavers; ca-engineering-dalhousie — not published.

**Not open to school leavers** (ca-medicine-dalhousie): not applicable to high-school applicants (MD requires a prior degree).

> “To be eligible for admissions, all applicants must meet the following; 90-120 Credit Hour Baccalaureate Degree: Completed, or in-progress to be completed, prior to the start of the undergraduate medical education program.”  
> — https://medicine.dal.ca/departments/core-units/admissions/admissions/degree-requirements.html (read 2026-11-15)

Pages read: 2 (1 with something relevant).

### Concordia University (Canada)

John Molson states undergraduate admission is strictly based on previous academic performance (an interview may be required only in some home-schooled cases); nothing about interviews is published for Computer Science.

Courses: ca-business-concordia — stated no; ca-cs-concordia — not published.

**States no interview:**

For ca-business-concordia:

> “No, you are not required to submit letters of reference or letters of intent when apply to undergraduate programs at the John Molson School of Business. Admission to John Molson is strictly based on previous academic performance”  
> — https://www.concordia.ca/jmsb/programs/undergraduate/bachelor/admissions.html (read 2026-11-15)

Pages read: 2 (1 with something relevant).

### York University (Canada)

The mandatory Schulich BBA supplementary application includes six video interview questions plus a timed written response; the Osgoode JD requires at least 3 years of university study, so it is not a high-school entry route.

Courses: ca-business-york — interview record; ca-law-york — not open to school leavers.

**Record `york-schulich-bba`** — Business Administration (Schulich BBA); covers ca-business-york; interviewed: *yes (video interview questions in mandatory supplementary application)*

Format:

> “The supplementary application consists of six video interview questions and one timed written response exercise.”  
> — https://schulich.yorku.ca/admissions/suppapp/ (read 2026-11-15)

Number and length:

> “For each video interview question, you will have: 45 seconds to prepare your response. 90 seconds to record your response.”  
> — https://schulich.yorku.ca/admissions/suppapp/ (read 2026-11-15)

Preparation advice:

> “All questions will be either behavioural or situational. Behavioural questions ask you to reflect on your past experiences, while situational questions ask how you would approach a particular scenario.”  
> — https://schulich.yorku.ca/admissions/suppapp/ (read 2026-11-15)

Preparation advice:

> “We encourage you to draw on your own relevant experiences when answering the questions. Where appropriate, provide background or context to help explain your response.”  
> — https://schulich.yorku.ca/admissions/suppapp/ (read 2026-11-15)

Notes: Supplementary page: 'The Supplementary Application is a mandatory part of the BBA admission process.' Invitations come from Kira Talent (no-reply@kiratalent.com) and the Leadership Profile must be uploaded before the video interviews.

**Not open to school leavers** (ca-law-york): not applicable to high-school applicants (JD is a second-entry programme).

> “Complete a minimum of 3 years of study (90 credits) at a recognized university in a program leading to a degree by June of the year of admission.”  
> — https://www.osgoode.yorku.ca/programs/juris-doctor/juris-doctor-admissions/eligibility-requirements/ (read 2026-11-15)

Pages read: 3 (2 with something relevant).

### University of Victoria (Canada)

UVic Law admits to the JD only after at least 3 years of post-secondary study, so it is not a high-school entry route; nothing about interviews is published for Computer Science.

Courses: ca-law-uvic — not open to school leavers; ca-cs-uvic — not published.

**Not open to school leavers** (ca-law-uvic): not applicable to high-school applicants (JD is a second-entry programme).

> “You can apply to UVic Law after completing at least 3 years of post-secondary study.”  
> — https://www.uvic.ca/law/admissions/first-year/index.php (read 2026-11-15)

Pages read: 3 (2 with something relevant).

### Trinity College Dublin (Ireland)

Trinity states interviews for Medicine for mature applicants and for International Foundation Programme applicants, and says mature applicants may be called for interview where their subject requires it (Psychology after an aptitude test); the non-EU direct-application and Medicine course pages read do not mention interviews.

Courses: ie-engineering-trinity — interview record; ie-cs-trinity — interview record; ie-maths-trinity — interview record; ie-naturalsciences-trinity — interview record; ie-medicine-trinity — interview record; ie-economics-trinity — interview record; ie-law-trinity — interview record; ie-business-trinity — interview record; ie-psychology-trinity — interview record.

**Record `tcd-medicine`** — Medicine; covers ie-medicine-trinity; interviewed: *some applicants (mature applicants; International Foundation Programme applicants to Medicine)*

Format:

> “For mature applicants short-listing and interviews will take place.”  
> — https://www.tcd.ie/maturestudents/news/applicants-to-medicine/ (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Medicine: Medicine applicants will be required to pass an interview as part of the applications process. Interviews will be held after applications close.”  
> — https://www.tcd.ie/study/international/foundation-programme/entry.php (read 2026-11-15)

Also (admissions test or assessment (not an interview); kept in this report, not in the record):

> “In addition, all EU applicants applying via CAO will be required to sit the admissions test (HPAT – Ireland) to be accepted into this course.”  
> — https://www.tcd.ie/courses/undergraduate/az/course.php?id=DUBMD-MEDI-3F09 (read 2026-11-15)

Also (admissions test or assessment (not an interview); kept in this report, not in the record):

> “Medicine (TR051) All applicants must sit the HPAT-Ireland admissions test. A minimum score of 150 in the HPAT-Ireland admissions test will apply.”  
> — https://www.tcd.ie/media/tcd/mature-students/pdfs/TCD-Mature-Student-Guidelines-2027.pdf (read 2026-11-15)

Notes: Interview statements found only for mature applicants (Mature Student Office news page) and on the Trinity International Foundation Programme entry-requirements page. The Medicine course page (non-EU apply link), the international How to Apply page, the non-EU Undergraduate Admission Guide PDF and the School of Medicine prospective-students FAQ contain no mention of an interview for non-EU direct applicants; nothing found either way for that group. The School of Medicine FAQ refers students from the US/Canada, Singapore and Malaysia to external agencies (not fetched; not official university pages). Mature guide and news page give different HPAT minimums (150 vs 75); both quoted as published. Applicant group(s) the quotes are about: Mature applicants (CAO route); Trinity International Foundation Programme (non-EU pathway) applicants progressing to Medicine.

**Record `tcd-psychology-mature`** — Psychology; covers ie-psychology-trinity; interviewed: *mature applicants: selection for interview depends on an aptitude test*

Format:

> “Psychology (TR006) Applicants must sit at an aptitude test in March/April 2027. This is a multi-choice quesionnaire to measure your aptitude for Psychology. It is not a general knowledge quiz and does not require preparation. Selection for interview will depend upon performance on the aptitude test(s).”  
> — https://www.tcd.ie/media/tcd/mature-students/pdfs/TCD-Mature-Student-Guidelines-2027.pdf (read 2026-11-15)

Notes: From the Mature Student Guidelines 2027 (applies to mature applicants only). Applicant group(s) the quotes are about: Mature applicants.

**Record `tcd-mature-all`** — All courses (mature applicants only, where required for the subject); covers ie-engineering-trinity, ie-cs-trinity, ie-maths-trinity, ie-naturalsciences-trinity, ie-medicine-trinity, ie-economics-trinity, ie-law-trinity, ie-business-trinity, ie-psychology-trinity; interviewed: *mature applicants: some called for interview where required for the chosen subject*

Format:

> “Interviews, where required for the applicants’ chosen subjects, will be arranged by the Academic Registry. Owing to the high demand for places in certain areas, not all applicants may be called for interview.”  
> — https://www.tcd.ie/media/tcd/calendar/undergraduate-studies/admission-requirements.pdf (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Academic assessors from the relevant department will make one of the following recommendations: l That you are called for interview.”  
> — https://www.tcd.ie/media/tcd/mature-students/pdfs/TCD-Mature-Student-Guidelines-2027.pdf (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Interviews normally take place between mid-March and the end of May. A very high number of applicants are interviewed each year and, because of this, alternative interview dates cannot be arranged.”  
> — https://www.tcd.ie/media/tcd/mature-students/pdfs/TCD-Mature-Student-Guidelines-2027.pdf (read 2026-11-15)

Notes: The calendar and mature guide do not list which of these subjects interview mature applicants; the statements are general to the mature route. Not applicable to school-leaver EU (CAO) or non-EU applicants. Applicant group(s) the quotes are about: Mature applicants.

Pages read: 12 (5 with something relevant).

### National University of Singapore (Singapore)

NUS states that Medicine (among other listed programmes) requires selection tests and/or interviews, that NUS Computing may interview Aptitude-Based Admissions candidates, and that some faculties might require interviews for other programmes; most NUS admissions pages were blocked.

Courses: sg-cs-nus — interview record; sg-engineering-nus — interview record; sg-medicine-nus — interview record; sg-psychology-nus — interview record; sg-economics-nus — interview record; sg-business-nus — interview record; sg-sciences-nus — interview record; sg-maths-nus — interview record; sg-pharmacy-nus — interview record.

**Record `nus-medicine`** — Medicine; covers sg-medicine-nus; interviewed: *yes (shortlisted applicants)*

Format:

> “Applicants who apply for admission to Architecture, Landscape Architecture, Industrial Design, Dentistry, Law, Nursing and Medicine programmes are required to attend selection tests and/or interviews.”  
> — https://www.nus.edu.sg/oam/docs/default-source/international-baccalaureate/faqs-for-international-baccalaureate.pdf?sfvrsn=37e7aa40_37 (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “The portfolio review and academic grades will determine if applicants are shortlisted for the interview. For 1st time applicants, if you meet the cut-off points for Medicine, you will be shortlisted and invited for the FSA, and will not be considered through EBAS scheme.”  
> — https://inetapps.nus.edu.sg/ram/application/ (read 2026-11-15)

Notes: The NUS Medicine pages on the Focused Skills Assessment (FSA) and admissions assessment, and the OAM interview/test dates page, were blocked (Incapsula), so format, length and preparation details were not read. Applicant group(s) the quotes are about: IB Diploma applicants (OAM FAQ for IBDP students); All NUS Medicine applicants (no group specified).

**Record `nus-computing`** — Computer Science; covers sg-cs-nus; interviewed: *possible (Aptitude-Based Admissions shortlisted candidates)*

Format:

> “The NUS Computing Aptitude-Based Admissions (ABA) scheme may include various processes, such as tests or individual or group interviews, depending on the specific department’s requirements.”  
> — https://www.comp.nus.edu.sg/admissions/?p=899 (read 2026-11-15)

Preparation advice:

> “The ABA interviews are designed to assess candidates in various ways, and each interviewer may pose different questions. The purpose of the interview is for you to showcase your strengths and convince us why you are an ideal candidate for our programmes. Consider what makes you stand out, how best to articulate those qualities, and provide evidence to support your claims. In essence, be yourself, be compelling, and demonstrate why you are remarkable.”  
> — https://www.comp.nus.edu.sg/admissions/?p=899 (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Under the NUS Aptitude-Based Admissions (ABA) process, candidates may be invited to undergo further assessments, such as interviews or other online/face-to-face evaluations, as determined by the selection committee.”  
> — https://www.comp.nus.edu.sg/admissions/?p=899 (read 2026-11-15)

Notes: From the NUS School of Computing admissions FAQ. Applicant group(s) the quotes are about: Aptitude-Based Admissions candidates.

**Record `nus-all`** — All courses (faculty discretion); covers sg-cs-nus, sg-engineering-nus, sg-medicine-nus, sg-psychology-nus, sg-economics-nus, sg-business-nus, sg-sciences-nus, sg-maths-nus, sg-pharmacy-nus; interviewed: *possible (some faculties, shortlisted candidates)*

Format:

> “As part of the University’s holistic assessment, some faculties might also require applicants to attend an interview for single/double/concurrent degree programmes. The shortlisted candidates will be informed to attend the interview(s).”  
> — https://www.nus.edu.sg/oam/docs/default-source/international-baccalaureate/faqs-for-international-baccalaureate.pdf?sfvrsn=37e7aa40_37 (read 2026-11-15)

Notes: The FAQ does not name which faculties; listed against all NUS course ids only because the statement is university-wide. The NUS OAM pages (admissions, Aptitude-Based Admissions, interview/test dates) and the NUS Business (BBA) entry-requirements page were blocked, so programme-level detail for Business, Pharmacy, Psychology, Economics, Science, Maths and Engineering was not read. Applicant group(s) the quotes are about: IB Diploma applicants (OAM FAQ for IBDP students).

**Blocked:** https://www.nus.edu.sg/oam/admissions (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://www.nus.edu.sg/oam/admissions/aptitude-based-admissions (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://www.nus.edu.sg/oam/admissions/first-choice-bonus-points (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://medicine.nus.edu.sg/prospective-students/focused-skills-assessment/ (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://medicine.nus.edu.sg/prospective-students/nus-medicine-admissions-assessment/ (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://medicine.nus.edu.sg/prospective-students/admissions-frequently-asked-questions/ (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://medicine.nus.edu.sg/wp-content/uploads/2025/03/NUS-SJT-2025-Applicant-Information-2025.pdf (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://bba.nus.edu.sg/admissions-scholarships/entry-requirements/ (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://nus.edu.sg/oam/docs/default-source/nus-publications/intlprospectus.pdf (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://nus.edu.sg/oam/admissions/faculty-interview-and-test-dates (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://www.askadmissions.nus.edu.sg/app/answers/detail/a_id/546 (connection failed (curl: CONNECT tunnel failed, response 502))

Pages read: 3 (3 with something relevant).

### Nanyang Technological University (Singapore)

NTU states that shortlisted Medicine applicants attend eight one-to-one Multiple Mini-Interviews, that shortlisted Aptitude-based Admissions applicants may be interviewed, and that admission interviews are conducted for selected candidates with certain international qualifications.

Courses: sg-cs-ntu — interview record; sg-maths-ntu — interview record; sg-engineering-ntu — interview record; sg-business-ntu — interview record; sg-medicine-ntu — interview record; sg-economics-ntu — interview record; sg-architecture-ntu — interview record.

**Record `ntu-medicine`** — Medicine (LKCMedicine MBBS); covers sg-medicine-ntu; interviewed: *yes (shortlisted applicants, MMI)*

Format:

> “This is conducted in eight (8) separate interview booths by faculty members, and professionals from various healthcare disciplines.”  
> — https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs (read 2026-11-15)

Number and length:

> “The MMI typically takes place at the Novena campus in Singapore. Shortlisted applicants will complete the physical MMI on the day itself, usually within two hours.”  
> — https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs (read 2026-11-15)

Stations:

> “Shortlisted applicants invited for the MMI will complete a series of eight (8) one-to-one interviews.”  
> — https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs (read 2026-11-15)

What is assessed:

> “They are a series of interviews designed to evaluate the applicant’s aptitude and capability to successfully complete the MBBS programme. This includes one’s motivation and realistic approach to medicine as a career, capacity to deal with stress, evidence of leadership and team participation, ability to multi-task, communication skills, maturity of character, and likely contribution to medical school life.”  
> — https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs (read 2026-11-15)

Preparation advice:

> “LKCMedicine does not recommend any preparatory course for the MMI. Like many other interviews, just be yourself. Be calm and listen carefully to the questions asked by the interviewers.”  
> — https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Applicants are shortlisted for the MMI based on their academic and UCAT results, hence both components and all subtests in the UCAT are equally important.”  
> — https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/admissions-faqs (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “If your first choice is the MBBS programme, complete your application with your UCAT number, personal statement and two online referee reports.”  
> — https://www.ntu.edu.sg/admissions/undergraduate/admissions/application-process (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Applicants shortlisted for the Multiple Mini-Interviews (MMI) will be informed by the end of March.”  
> — https://www.ntu.edu.sg/medicine/education/bachelor-of-medicine-and-bachelor-of-surgery-(mbbs)/how-to-apply-to-lkcmedicine (read 2026-11-15)

Also (admissions test or assessment (not an interview); kept in this report, not in the record):

> “Applicants will have to register for the University Clinical Aptitude Test (UCAT) and take the UCAT as part of the criteria for entry to the LKCMedicine MBBS programme.”  
> — https://www.ntu.edu.sg/media/docs/default-source/undergraduate-admissions/msr/emsr_intnl.pdf (read 2026-11-15)

Notes: No applicant group is singled out on the LKCMedicine FAQ; it also states priority for admission is given to Singaporeans (not quoted here).

**Record `ntu-aba-all`** — All courses (Aptitude-based Admissions); covers sg-cs-ntu, sg-maths-ntu, sg-engineering-ntu, sg-business-ntu, sg-medicine-ntu, sg-economics-ntu, sg-architecture-ntu; interviewed: *possible (shortlisted Aptitude-based Admissions applicants)*

Format:

> “If you are shortlisted, we may invite you for an interview and ask for relevant supporting documents.”  
> — https://www.ntu.edu.sg/admissions/undergraduate/admissions/undergraduate/apply/aptitude-based-applications (read 2026-11-15)

Notes: University-wide ABA page; does not name programmes. Applicant group(s) the quotes are about: Aptitude-based Admissions (ABA) applicants.

**Record `ntu-intl-selected-qualifications`** — All courses (selected international qualifications); covers sg-cs-ntu, sg-maths-ntu, sg-engineering-ntu, sg-business-ntu, sg-medicine-ntu, sg-economics-ntu, sg-architecture-ntu; interviewed: *selected candidates holding certain international qualifications*

Format:

> “Admission interviews will be conducted online for selected candidates.”  
> — https://www.ntu.edu.sg/media/docs/default-source/undergraduate-admissions/msr/emsr_intnl.pdf (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Ijazah SMA and Sertifikat Hasil Ujan (if applicable) must be submitted. It is compulsory to submit a good pass in IELTS/TOEFL/SAT Reasoning Test/ACT with Writing/PTE Academic/C1 Advanced. Excellent results from Additional Qualification listed below# will be considered more favorably if submitted. Admission interviews will be conducted online for selected candidates.”  
> — https://www.ntu.edu.sg/media/docs/default-source/undergraduate-admissions/msr/emsr_intnl.pdf (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Applicants who have taken other Aptitude Scholastic Tests (AST) should also submit these scores for our evaluation. Admission interview will be conducted for selected candidates.”  
> — https://www.ntu.edu.sg/media/docs/default-source/undergraduate-admissions/msr/emsr_intnl.pdf (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Applicants who have taken GSAT will apply with GSAT results together with IELTS/TOEFL/SAT Reasoning test/ACT with Writing/PTE Academic/C1 Advanced score. Admission interview will be conducted for selected candidates.”  
> — https://www.ntu.edu.sg/media/docs/default-source/undergraduate-admissions/msr/emsr_intnl.pdf (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “If you have already taken your national examination, please apply with Year 12 results. It is compulsory to submit a good pass in IELTS/TOEFL/SAT Reasoning Test/ACT with Writing/PTE Academic/C1 Advanced. Admission interview will be conducted online for selected candidates.”  
> — https://www.ntu.edu.sg/media/docs/default-source/undergraduate-admissions/msr/emsr_intnl.pdf (read 2026-11-15)

Notes: From the NTU minimum subject requirements PDF for international qualifications, in the per-qualification table (Indonesia, PRC Gao Kao, Taiwan GSAT, Vietnam). The same PDF has a per-programme "Selection Test/Interview" column (e.g. "Yes", "On a selective basis"), but the extracted text does not make clear which programme rows those cells belong to for Computer Science, Mathematical Sciences, EEE, Economics or Business, so they are not recorded. Applicant group(s) the quotes are about: Indonesian Ijazah SMA applicants; PRC National College Entrance Examination (Gao Kao) applicants; Taiwan GSAT applicants; Vietnam High School Graduation Certificate applicants.

**Record `ntu-business-alevel`** — Business (NBS); covers sg-business-ntu; interviewed: *on a selective basis (A-level applicants)* — **flagged for manual review**

Format:

> “Selection Test/Interview Conducted on a selective basis.”  
> — https://www.ntu.edu.sg/docs/default-source/nanyang-business-school-(nbs)/ug-detail/admission-requirement---a-levele6f64d0a-5e70-4829-9a8a-39b0653a582c.pdf?Status=Master&sfvrsn=e1ef46f6_3 (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “Shortlisted candidates may be required to attend an interview and present relevant supporting documents for verification upon request.”  
> — https://www.ntu.edu.sg/docs/default-source/nanyang-business-school-(nbs)/ug-detail/admission-requirement---a-levele6f64d0a-5e70-4829-9a8a-39b0653a582c.pdf?Status=Master&sfvrsn=e1ef46f6_3 (read 2026-11-15)

Notes: NBS undergraduate A-level entry-requirements PDF; it shows indicative grade profiles (2019 – 2020) for both Business and Computer Science, so it may belong to a Business/Computing double-degree page and may be dated. Needs a human check before attaching to the single-major Business course. Applicant group(s) the quotes are about: Singapore-Cambridge GCE A-level applicants; Aptitude-based Admissions applicants.

Pages read: 8 (6 with something relevant).

### Singapore Management University (Singapore)

Every SMU page tried (admissions site, Law, SCIS and Economics sites) returned an Incapsula bot-check page, so nothing could be read.

Courses: sg-law-smu — blocked (manual review); sg-business-smu — blocked (manual review); sg-economics-smu — blocked (manual review); sg-cs-smu — blocked (manual review).

**Blocked:** https://admissions.smu.edu.sg/faq/all (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://admissions.smu.edu.sg/admissions-requirements/important-dates (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://admissions.smu.edu.sg/admissions-requirements/international-and-other-qualifications (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://admissions.smu.edu.sg/sites/admissions.smu.edu.sg/files/Law/SMU%20Law%20Writing%20Test%20Information%20for%20Applicants_2026.pdf (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://admissions.smu.edu.sg/faqs/admissions-and-applications (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://law.smu.edu.sg/ (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://scis.smu.edu.sg/ (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content); https://economics.smu.edu.sg/ (HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content)

Pages read: 0 (0 with something relevant).

### Singapore University of Technology & Design (Singapore)

SUTD states that selected applicants (A-Level and other international qualifications) are notified to attend an in-person or online conversation session with SUTD faculty/leader, and that shortlisted applicants with high school results take the SUTD University Entrance Examination.

Courses: sg-engineering-sutd — interview record; sg-architecture-sutd — interview record.

**Record `sutd-all`** — All courses; covers sg-engineering-sutd, sg-architecture-sutd; interviewed: *selected applicants (called a 'conversation session')*

Format:

> “If selected, you will be notified (latest by end April) to attend an in-person or online conversation session with SUTD faculty/leader.”  
> — https://www.sutd.edu.sg/admissions/undergraduate/singapore-cambridge-gce-a-level/application-timeline/ (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “2. Conversation If selected, you will be notified (latest by end April) to attend an in-person or online conversation session with SUTD faculty/leader.”  
> — https://www.sutd.edu.sg/admissions/undergraduate/singapore-cambridge-gce-a-level/application-timeline/ (read 2026-11-15)

Also (further interview statement; kept in this report, not in the record):

> “2. Conversation If selected, you will be notified (latest by end April) to attend an in-person or online conversation session with SUTD faculty/leader.”  
> — https://www.sutd.edu.sg/admissions/undergraduate/other-international-qualifications/application-timeline/ (read 2026-11-15)

Also (admissions test or assessment (not an interview); kept in this report, not in the record):

> “This applies to students holding high school results issued and/or certificates issued and certified by your current high school. Shortlisted applicants will be required to take the SUTD University Entrance Examination (UEE) .”  
> — https://www.sutd.edu.sg/admissions/undergraduate/other-international-qualifications/criteria-for-admission/ (read 2026-11-15)

Notes: SUTD's official application-timeline pages call this step a 'conversation session', not an interview; the word 'interview' is not used on the pages read. SUTD admits to the university rather than per programme, so this is listed for both course ids. A Straits Times article republished on sutd.edu.sg describes it further but was not used (news source). Applicant group(s) the quotes are about: Singapore-Cambridge GCE A-Level applicants; Other International Qualifications applicants.

**Blocked:** https://admtalk.sutd.edu.sg/admissions-scholarships/ (connection failed (curl: CONNECT tunnel failed, response 502))

Pages read: 7 (3 with something relevant).

### London School of Economics (UK)

LSE states it does not interview applicants for any of its programmes, covering all six listed courses.

Courses: uk-economics-lse — stated no; uk-finance-lse — stated no; uk-accounting-lse — stated no; uk-law-lse — stated no; uk-politics-lse — stated no; uk-management-lse — stated no.

**States no interview:**

For uk-economics-lse, uk-finance-lse, uk-accounting-lse, uk-law-lse, uk-politics-lse, uk-management-lse:

> “We do not interview applicants for any of our programmes at LSE. It is not possible for applicants to request an interview with the Admissions Selector.”  
> — https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply (read 2026-11-15)

Pages read: 1 (1 with something relevant).

### University College London (UK)

Both UCL undergraduate admissions pages tried returned 403, so nothing could be read.

Courses: uk-cs-ucl — blocked (manual review); uk-engineering-ucl — blocked (manual review); uk-economics-ucl — blocked (manual review); uk-biomedical-ucl — blocked (manual review); uk-psychology-ucl — blocked (manual review); uk-maths-ucl — blocked (manual review).

**Blocked:** https://www.ucl.ac.uk/study/prospective-students/undergraduate/how-apply/how-we-assess-your-application (HTTP 403 on plain request); https://www.ucl.ac.uk/study/prospective-students/school-teachers-and-counsellors/tests-tasks-and-interviews (HTTP 403 on plain request)

Pages read: 2 (0 with something relevant).

### University of Edinburgh (UK)

Edinburgh states it interviews undergraduates only for medicine, nursing, teacher education and veterinary medicine and does not interview for any other degree programme, which covers all seven listed courses (including Architecture).

Courses: uk-cs-edinburgh — stated no; uk-engineering-edinburgh — stated no; uk-economics-edinburgh — stated no; uk-law-edinburgh — stated no; uk-psychology-edinburgh — stated no; uk-architecture-edinburgh — stated no; uk-maths-edinburgh — stated no.

**States no interview:**

For uk-cs-edinburgh, uk-engineering-edinburgh, uk-economics-edinburgh, uk-law-edinburgh, uk-psychology-edinburgh, uk-architecture-edinburgh, uk-maths-edinburgh:

> “You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews. We do not interview for entry to any other degree programmes.”  
> — https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios (read 2026-11-15)

Pages read: 1 (1 with something relevant).

### King's College London (UK)

King's lists the courses that require an interview (Medicine, Dentistry, Nursing, Midwifery, Physiotherapy, Pharmacy), which do not include Law, Computer Science, Economics or Psychology, and those four course and entry-requirement pages mention no admission interview; King's does not state that these courses do not interview.

Courses: uk-law-kcl — not published; uk-cs-kcl — not published; uk-economics-kcl — not published; uk-psychology-kcl — not published.

Pages read: 11 (1 with something relevant).

### University of Manchester (UK)

Manchester course pages state no interviews for Economics, Mechanical Engineering and Mathematics, and no interviews as a rule for Management (Accounting and Finance) (reserving the right to interview non-standard applicants); the Computer Science and Law LLB 2027 pages say nothing about admission interviews.

Courses: uk-cs-manchester — not published; uk-economics-manchester — stated no; uk-engineering-manchester — stated no; uk-law-manchester — not published; uk-accounting-manchester — stated no; uk-maths-manchester — stated no.

**States no interview:**

For uk-economics-manchester:

> “Interview requirements We do not interview.”  
> — https://www.manchester.ac.uk/study/undergraduate/courses/2027/10224/bsc-economics/ (read 2026-11-15)

For uk-engineering-manchester:

> “Interview requirements We do not hold interviews but applicants who receive an offer may be invited to a virtual webinar or an on-campus offer holder day which generally take place on Wednesday afternoons from February to April.”  
> — https://www.manchester.ac.uk/study/undergraduate/courses/2027/03921/meng-mechanical-engineering/ (read 2026-11-15)

For uk-accounting-manchester:

> “Interview requirements We do not as a rule interview applicants. However, we reserve the right to interview candidates with non-standard backgrounds, eg. Mature students and students aged under 17.”  
> — https://www.manchester.ac.uk/study/undergraduate/courses/2027/03520/bsc-management-accounting-and-finance/ (read 2026-11-15)

For uk-maths-manchester:

> “Interview requirements We will not be holding interviews for September 2027 entry.”  
> — https://www.manchester.ac.uk/study/undergraduate/courses/2027/00590/bsc-mathematics/ (read 2026-11-15)

Pages read: 6 (4 with something relevant).

### University of Warwick (UK)

Each of the six Warwick course pages states that Warwick does not typically interview applicants and that offers are based on the UCAS application.

Courses: uk-economics-warwick — stated no; uk-maths-warwick — stated no; uk-cs-warwick — stated no; uk-law-warwick — stated no; uk-accounting-warwick — stated no; uk-engineering-warwick — stated no.

**States no interview:**

For uk-economics-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/bsc-economics/ (read 2026-11-15)

For uk-maths-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/bsc-mathematics/ (read 2026-11-15)

For uk-cs-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/bsc-computer-science/ (read 2026-11-15)

For uk-law-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/llb-law/ (read 2026-11-15)

For uk-accounting-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/bsc-accounting-finance/ (read 2026-11-15)

For uk-engineering-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/meng-engineering/ (read 2026-11-15)

Pages read: 7 (6 with something relevant).

### Durham University (UK)

Every durham.ac.uk page tried (admissions policy PDF, undergraduate study page, interviews page, entry-requirements page) returned a CloudFront 403, so nothing could be read.

Courses: uk-maths-durham — blocked (manual review); uk-economics-durham — blocked (manual review); uk-cs-durham — blocked (manual review); uk-law-durham — blocked (manual review); uk-physics-durham — blocked (manual review); uk-engineering-durham — blocked (manual review).

**Blocked:** https://www.durham.ac.uk/media/durham-university/study/admissions-policies/Admissions-Policy-2026-27.pdf (403 from CloudFront ("Request blocked.")); https://www.durham.ac.uk/study/undergraduate/ (403 from CloudFront ("Request blocked.")); https://www.durham.ac.uk/study/undergraduate/how-to-apply/what-happens-to-your-application/interviews-and-selection-days/ (403 from CloudFront ("Request blocked.")); https://www.durham.ac.uk/study/undergraduate/how-to-apply/entry-requirements/ (403 from CloudFront ("Request blocked."))

Pages read: 4 (0 with something relevant).

### University of Bristol (UK)

Each of the five Bristol 2027 admissions statements says applicants are not routinely interviewed and decisions are normally made on the application alone, with interviews only in exceptional circumstances.

Courses: uk-maths-bristol — stated no; uk-cs-bristol — stated no; uk-economics-bristol — stated no; uk-engineering-bristol — stated no; uk-law-bristol — stated no.

**States no interview:**

For uk-maths-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/maths.pdf (read 2026-11-15)

For uk-cs-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/computer-science.pdf (read 2026-11-15)

For uk-economics-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/economics.pdf (read 2026-11-15)

For uk-engineering-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/mechanical-engineering.pdf (read 2026-11-15)

For uk-law-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In most cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/law.pdf (read 2026-11-15)

Pages read: 5 (5 with something relevant).

### University of Bath (UK)

Bath assesses these courses on the UCAS application, interviewing applicants with certain qualifications (Access to HE Diploma and/or T Level) for Computer Science, Economics, Mechanical Engineering and Accounting & Finance, and others only very exceptionally (the only route stated for Mathematics); interviews are held virtually via Microsoft Teams.

Courses: uk-cs-bath — interview record; uk-maths-bath — interview record; uk-economics-bath — interview record; uk-engineering-bath — interview record; uk-accounting-bath — interview record.

**Record `bath-qualification-route`** — Computer Science, Economics, Mechanical Engineering, Accounting & Finance; covers uk-cs-bath, uk-economics-bath, uk-engineering-bath, uk-accounting-bath; interviewed: *some applicants (those studying certain qualifications, e.g. Access to HE Diploma or T Level); very exceptionally others*

Format:

> “Interviews take place virtually via Microsoft Teams.”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

What is assessed:

> “The interview process is used to determine your suitability for the course you have applied for and to provide you with an opportunity to decide if our course is the right one for you.”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

Preparation advice:

> “Think about what has motivated you to study the course and why you would like to study at the University of Bath Carefully consider what has really interested you during your current study and prepare some well thought out examples - which will help you evidence your enthusiasm and passion for your subject”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

Preparation advice:

> “Familiarise yourself with the published course material and look at which modules may be of interest to you Be prepared to discuss anything you have included in your personal statement and expand on this during your interview”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

Preparation advice:

> “You will also be asked to answer some academic subject-specific questions relating to your course. Please do not get anxious if you are unsure of the answer straight away; you will be given time to work through the question and the Admissions Tutor will support you and want to see how you can apply your logic to work out the answer.”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

Notes: Each 2027 course page ("Selection process") says: "We will usually assess you based on your UCAS application." followed by the qualification sentence, e.g. Computer Science: "If you are studying certain qualifications, such as an Access to HE or T Level, you will be invited to attend an interview as part of our selection process." (Economics and Mechanical Engineering name the Access to HE Diploma; Accounting & Finance names Access to HE Diploma or T Level), and all add "Very exceptionally we may invite you to an interview if you have circumstances we cannot assess from an application alone." The interview guide (https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/) adds: "Typically you will be interviewed by two or three members of staff including the Admissions Tutor and a member of our Undergraduate Progression Team." No length or sample questions published.

**Record `bath-mathematics`** — Mathematics; covers uk-maths-bath; interviewed: *very exceptionally only*

Format:

> “Interviews take place virtually via Microsoft Teams.”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

What is assessed:

> “The interview process is used to determine your suitability for the course you have applied for and to provide you with an opportunity to decide if our course is the right one for you.”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

Preparation advice:

> “Think about what has motivated you to study the course and why you would like to study at the University of Bath Carefully consider what has really interested you during your current study and prepare some well thought out examples - which will help you evidence your enthusiasm and passion for your subject”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

Preparation advice:

> “Familiarise yourself with the published course material and look at which modules may be of interest to you Be prepared to discuss anything you have included in your personal statement and expand on this during your interview”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

Preparation advice:

> “You will also be asked to answer some academic subject-specific questions relating to your course. Please do not get anxious if you are unsure of the answer straight away; you will be given time to work through the question and the Admissions Tutor will support you and want to see how you can apply your logic to work out the answer.”  
> — https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/ (read 2026-11-15)

Notes: The 2027 BSc Mathematics page ("Selection process") says: "We will usually assess you based on your UCAS application. Very exceptionally we may invite you to an interview if you have circumstances we cannot assess from an application alone." The general interview guide (https://www.bath.ac.uk/guides/undergraduate-applicant-interviews/) applies if invited.

Pages read: 6 (6 with something relevant).

### University of Glasgow (UK)

Glasgow lists interviews as part of selection only for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery (none of the four listed courses), and says applicants for entry into Year 2 may be interviewed in any subject; it publishes no explicit no-interview statement for first-year entry to the listed courses.

Courses: uk-cs-glasgow — interview record; uk-law-glasgow — interview record; uk-economics-glasgow — interview record; uk-engineering-glasgow — interview record.

**Record `glasgow-year2-entry`** — Year 2 (advanced) entry, any subject; covers uk-cs-glasgow, uk-law-glasgow, uk-economics-glasgow, uk-engineering-glasgow; interviewed: *possible for Year 2 entry applicants only*

Format:

> “An interview will be part of the selection process for: Community Development Dentistry Medicine Nursing Teaching Veterinary Medicine & Surgery You may also be interviewed if you’re applying for entry into Year 2 in any subject.”  
> — https://www.gla.ac.uk/undergraduate/how-to-apply-for-an-undergraduate-degree/entry-requirements/admissions-guidance/ (read 2026-11-15)

Notes: Admissions guidance (https://www.gla.ac.uk/undergraduate/how-to-apply-for-an-undergraduate-degree/entry-requirements/admissions-guidance/) says: "An interview will be part of the selection process for: Community Development Dentistry Medicine Nursing Teaching Veterinary Medicine & Surgery You may also be interviewed if you’re applying for entry into Year 2 in any subject." None of the four listed courses is on the first-year interview list. The 2027 entry-requirement feeds for G400, M100 (Common Law), L150 and H302 list no interview. No format, length or preparation details published.

Pages read: 5 (1 with something relevant).

### University of St Andrews (UK)

St Andrews states it does not interview for most undergraduate programmes, with interviews only for Medicine, Supported pathway/Gateway programmes, BA International Honours and some part-time study; Computer Science, Economics and Mathematics are not among the exceptions.

Courses: uk-cs-standrews — stated no; uk-economics-standrews — stated no; uk-maths-standrews — stated no.

**States no interview:**

For uk-cs-standrews, uk-economics-standrews, uk-maths-standrews:

> “We also rely heavily on your personal statement and referee's report as the University does not interview for most undergraduate programmes. Applicants for Medicine , our Supported Pathways programmes, BA International Honours and some part-time courses may be invited to an interview.”  
> — https://www.st-andrews.ac.uk/study/undergraduate/apply/after/ (read 2026-11-15)

For uk-cs-standrews, uk-economics-standrews, uk-maths-standrews:

> “Most students who apply to the University for undergraduate study will not be required to attend an interview. The exceptions to this will be if you are applying for: Medicine Supported pathway programmes Part-time study”  
> — https://www.st-andrews.ac.uk/subjects/entry/ (read 2026-11-15)

Pages read: 4 (4 with something relevant).

### University of Leeds (UK)

Leeds faculty admissions guidance states interviews are not part of the standard admissions process for Engineering and Physical Sciences (covering Computer Science and Civil Engineering), Social Sciences (covering the School of Law; page is for 2026 entry) and the Business School (Economics), though some applicants may occasionally be invited.

Courses: uk-cs-leeds — stated no; uk-engineering-leeds — stated no; uk-law-leeds — stated no; uk-economics-leeds — stated no.

**States no interview:**

For uk-cs-leeds, uk-engineering-leeds:

> “Interviews Interviews do not form part of our standard admissions process; however, in some cases, an applicant may be invited for an interview if it will help inform whether an offer should be made.”  
> — https://eps.leeds.ac.uk/faculty-engineering-physical-sciences/doc/admissions-courses-faculty-engineering-physical-sciences-4 (read 2026-11-15)

For uk-law-leeds:

> “For all other programmes in the Faculty of Social Sciences interviews do not form part of our standard admissions process; however, in some cases, an applicant may be invited for an interview if it will help inform whether an offer should be made.”  
> — https://essl.leeds.ac.uk/education-social-sciences-law/doc/admissions-guidance-courses-faculty-social-sciences (read 2026-11-15)

For uk-economics-leeds:

> “Will I be invited to an interview? Interviews do not form part of our standard admissions process; however, some applicants, such as mature students, may be invited for an interview and asked to provide an example of academic writing to help inform whether an offer should be made.”  
> — https://business.leeds.ac.uk/faculty/doc/apply-7 (read 2026-11-15)

Pages read: 6 (5 with something relevant).

### University of Nottingham (UK)

Nottingham's School of Law states it does not normally interview (Law LLB); the Computer Science and Economics course pages and the Economics FAQ say nothing about admission interviews, and the general applying page says only that applicants are invited to interview if their course requires one.

Courses: uk-cs-nottingham — not published; uk-economics-nottingham — not published; uk-law-nottingham — stated no.

**States no interview:**

For uk-law-nottingham:

> “Do you hold interviews? We do not normally include an interview as part of the admissions process.”  
> — https://www.nottingham.ac.uk/law/study/undergraduate/faqs.aspx (read 2026-11-15)

Pages read: 8 (1 with something relevant).

### University of Birmingham (UK)

Birmingham says only that some courses require an interview or audition; the Computer Science, Economics, Law and Mechanical Engineering course pages say nothing about admission interviews.

Courses: uk-cs-birmingham — not published; uk-economics-birmingham — not published; uk-engineering-birmingham — not published; uk-law-birmingham — not published.

Pages read: 5 (0 with something relevant).

### University of Exeter (UK)

Exeter says the majority of courses do not require an interview and that where one is used the individual entry requirements say so; the Economics, Law, Computer Science and Psychology course pages read mention no admission interview, but no page states that these four courses do not interview.

Courses: uk-economics-exeter — not published; uk-law-exeter — not published; uk-cs-exeter — not published; uk-psychology-exeter — not published.

Pages read: 5 (1 with something relevant).

### Columbia University (US)

Columbia's Alumni Representative Committee page states that Columbia College and the Fu Foundation School of Engineering and Applied Science discontinued their alumni interview program for applicants from the 2023-2024 admissions cycle.

Courses: us-cs-columbia — stated no; us-maths-columbia — stated no; us-economics-columbia — stated no; us-engineering-columbia — stated no.

**States no interview:**

For us-cs-columbia, us-maths-columbia, us-economics-columbia, us-engineering-columbia:

> “After careful consideration, Columbia College and the Fu Foundation School of Engineering and Applied Science have decided to discontinue their alumni interview program for individuals seeking admission. The decision, which takes effect this fall for the 2023-2024 admissions cycle, was made to ensure that all candidates have the same opportunity to connect with and learn about Columbia through the application process.”  
> — https://arc.undergrad.admissions.columbia.edu/ (read 2026-11-15)

**Blocked:** https://undergrad.admissions.columbia.edu/apply/firstyear (HTTP 403); https://undergrad.admissions.columbia.edu/apply/first-year (HTTP 403); https://undergrad.admissions.columbia.edu/faq (HTTP 403); https://undergrad.admissions.columbia.edu/apply/process (HTTP 403); https://undergrad.admissions.columbia.edu/apply/first-year/interviews (HTTP 403); https://www.college.columbia.edu/news/announcement-alumni-admissions-interviews (HTTP 403); https://www.college.columbia.edu/alumni/volunteer/alumni-interviewing (HTTP 403); https://www.cc-seas.columbia.edu/faq (HTTP 403)

Pages read: 9 (1 with something relevant).

### University of Pennsylvania (US)

The Penn Admissions pages that could be read (how to apply, first-year, international, preparing your application, visit & connect, Ask Penn first-year articles) say nothing about interviews; the Penn Alumni interview pages returned 403.

Courses: us-business-wharton — not published; us-cs-penn — not published; us-economics-penn — not published.

**Blocked:** https://www.alumni.upenn.edu/interviews (HTTP 403 (Penn Alumni site; page on alumni interviews/admissions FAQs for alumni)); https://www.alumni.upenn.edu/s/1587/gid2/16/interior.aspx?sid=1587&gid=2&pgid=20995 (HTTP 403 (Penn Alumni site; page on alumni interviews/admissions FAQs for alumni))

Pages read: 12 (0 with something relevant).

### Caltech (US)

Caltech states it does not have an interview process; it recommends (does not require) an InitialView recorded conversation and writing sample for international applicants.

Courses: us-cs-caltech — stated no (third-party option only); us-physics-caltech — stated no (third-party option only); us-engineering-caltech — stated no (third-party option only); us-maths-caltech — stated no (third-party option only).

**Third-party interview only** (us-cs-caltech, us-physics-caltech, us-engineering-caltech, us-maths-caltech): *optional (recommended, not required, for international applicants; third-party InitialView)*. Not an interview the university runs, so it is not a record.

> “InitialView unscripted conversations and writing samples are recorded and give Admissions Officers insight into how you communicate and think.”  
> — https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants (read 2026-11-15)

> “At Caltech, you will be called upon regularly to engage with leading professors and classmates who will challenge you. As a result, international students are encouraged to provide us with an InitialView conversation and writing sample.”  
> — https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants (read 2026-11-15)

**States no interview:**

For us-cs-caltech, us-physics-caltech, us-engineering-caltech, us-maths-caltech:

> “We don't have an interview process at Caltech, so our supplemental essays are where you are speaking directly to us.”  
> — https://www.admissions.caltech.edu/apply/first-year-applicants/supplemental-application-essays/essay-writing-advice (read 2026-11-15)

Pages read: 5 (2 with something relevant).

### Carnegie Mellon University (US)

Carnegie Mellon states it does not offer interviews; InitialView or Vericant interviews are recommended, not required, for nonnative English speakers.

Courses: us-cs-cmu — stated no (third-party option only); us-engineering-cmu — stated no (third-party option only); us-business-cmu — stated no (third-party option only); us-maths-cmu — stated no (third-party option only).

**Third-party interview only** (us-cs-cmu, us-engineering-cmu, us-business-cmu, us-maths-cmu): *optional (recommended, not required, for nonnative English speakers; third-party InitialView or Vericant)*. Not an interview the university runs, so it is not a record.

> “Often these interviews can measure readiness for engagement in the classroom and also showcase a student’s personality, likes and dislikes as well as the area of intended major. These interviews can also show English language proficiency while also corroborating the application with more details about the student.”  
> — https://www.cmu.edu/admission/admission/international-applicants (read 2026-11-15)

**States no interview:**

For us-cs-cmu, us-engineering-cmu, us-business-cmu, us-maths-cmu:

> “Interviews are rarely required. Carnegie Mellon does not offer interviews.”  
> — https://www.cmu.edu/admission/admission/application-and-financial-aid-support/common-admission-terms (read 2026-11-15)

Pages read: 3 (2 with something relevant).

### UC Berkeley (US)

UC Berkeley states it does not conduct interviews (no alumni or admissions officer interviews; optional InitialView materials accepted from international applicants), but first-year applicants to the Haas business program must upload a self-recorded video interview as part of the Haas Supplemental Application.

Courses: us-cs-berkeley — stated no (third-party option only); us-engineering-berkeley — stated no (third-party option only); us-economics-berkeley — stated no (third-party option only); us-business-berkeley — interview record; us-maths-berkeley — stated no (third-party option only).

**Record `berkeley-business`** — Business Administration (Haas); covers us-business-berkeley; interviewed: *yes (required self-recorded video interview in Haas Supplemental Application)*

Format:

> “The video interview is not the traditional face-to-face interview. Instead, you will record yourself answering the set of questions. All applicants will have 6 minutes to record a response.”  
> — https://haas.berkeley.edu/undergrad/admissions/faq/ (read 2026-11-15)

Number and length:

> “All applicants will have several attempts to record their video interview. You have as much time as you need between attempts. You may log out and reattempt. You do not get to record all attempts and then decide which attempt to submit.”  
> — https://haas.berkeley.edu/undergrad/admissions/faq/ (read 2026-11-15)

What is assessed:

> “Authenticity, intellectual curiosity, leadership potential, integrity, and ability to convey your story.”  
> — https://haasug.berkeley.edu/apply/VideoInterviewGuide2026.pdf (read 2026-11-15)

Preparation advice:

> “Time management: It is recommended to budget around a minute and a half per question.”  
> — https://haasug.berkeley.edu/apply/VideoInterviewGuide2026.pdf (read 2026-11-15)

Preparation advice:

> “Practice telling your story out loud.”  
> — https://haasug.berkeley.edu/apply/VideoInterviewGuide2026.pdf (read 2026-11-15)

Preparation advice:

> “The same question set will be asked of all applicants. The questions will appear in the same order in each of your attempts. You may use notes if that helps you feel prepared but please do not read from a script”  
> — https://haas.berkeley.edu/undergrad/admissions/faq/ (read 2026-11-15)

Notes: Requirement for first-year applicants stated on the Haas high school students page: "The supplement includes an essay question and a video interview upload." and the FAQ: "Is the video interview required? Yes."

**Third-party interview only** (us-cs-berkeley, us-engineering-berkeley, us-economics-berkeley, us-maths-berkeley): *optional (InitialView materials accepted from international applicants)*. Not an interview the university runs, so it is not a record.

> “As part of our holistic review however, we will accept InitialView materials for international applicants who are choosing to participate in an InitialView interview as a part of their application journey. If you would like to submit InitialView materials as part of your application, please ensure that they are sent to us by November 30th.”  
> — https://admissions.berkeley.edu/requirements-for-international-students/ (read 2026-11-15)

**States no interview:**

For us-cs-berkeley, us-engineering-berkeley, us-economics-berkeley, us-maths-berkeley:

> “UC Berkeley does not conduct interviews in the admissions process. The application is the only information we will have to assess your strengths.”  
> — https://admissions.berkeley.edu/apply-to-berkeley/application-resources/application-tips/ (read 2026-11-15)

For us-cs-berkeley, us-engineering-berkeley, us-economics-berkeley, us-maths-berkeley:

> “UC Berkeley does not offer alumni or admissions officer interviews as part of its application process.”  
> — https://admissions.berkeley.edu/requirements-for-international-students/ (read 2026-11-15)

Pages read: 6 (5 with something relevant).

### University of Michigan (US)

Michigan's 2025-26 Common Data Set states that some applicants to Music, Theatre and Dance and some applicants to the College of Engineering may be interviewed; the admissions office, LSA, Ross and Engineering admissions pages were all blocked.

Courses: us-cs-michigan — not published; us-engineering-michigan — interview record; us-business-michigan — not published; us-economics-michigan — not published; us-maths-michigan — not published; us-psychology-michigan — not published.

**Record `michigan-engineering`** — College of Engineering; covers us-engineering-michigan; interviewed: *some applicants (may be interviewed)*

Format:

> “Some applicants to Music, Theatre and Dance and some applicants to the College of Engineering may be interviewed.”  
> — https://obp.umich.edu/wp-content/uploads/pubdata/cds/cds_2025-26_umaa.pdf (read 2026-11-15)

Notes: Only source readable: Common Data Set 2025-2026 (Office of Budget and Planning), section C7: "Some applicants to Music, Theatre and Dance and some applicants to the College of Engineering may be interviewed." No format, length or selection details could be read: Engineering and central admissions pages returned 403. us-cs-michigan not included because the page does not say whether the CS BS applicant applies via Engineering.

**Blocked:** https://admissions.umich.edu/apply/first-year-applicants/selection-process (HTTP 403); https://admissions.umich.edu/virtual-qa-questions (HTTP 403); https://admissions.umich.edu/apply/first-year-applicants/selection-process/denied-applicants-faq (HTTP 403); https://lsa.umich.edu/lsa/alumni-friends/get-connected/college-connections/request-an-interview.html (HTTP 403); https://michiganross.umich.edu/undergraduate/bba/admissions/faqs (HTTP 403); https://michross.bus.umich.edu/undergraduate/bba/admissions/faqs (connection reset (curl 35)); https://www.engin.umich.edu/admissions/undergraduate-admissions/admissions-faq/ (HTTP 403); https://www.engin.umich.edu/admissions-aid/undergraduate/apply/first-year/ (HTTP 403); https://teamdynamix.umich.edu/TDClient/154/Portal/KB/ArticleDet?ID=7510 (curl connection/TLS failure, no response)

Pages read: 10 (1 with something relevant).

### New York University (US)

Every NYU admissions page tried (nyu.edu undergraduate admissions pages and NYU Bulletins admissions pages) was blocked, so nothing could be read about interviews.

Courses: us-business-nyu — blocked (manual review); us-cs-nyu — blocked (manual review).

**Blocked:** https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/standardized-tests/english-language-testing.html (HTTP 403); https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/wait-list-faq.html (HTTP 403); https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/all-freshmen-applicants.html (HTTP 403); https://bulletins.nyu.edu/undergraduate/business/admissions/ (connection reset (curl 35)); https://bulletins.nyu.edu/undergraduate/arts-science/admissions/ (connection reset (curl 35)); https://bulletins.nyu.edu/undergraduate/arts/admissions/ (connection reset (curl 35))

Pages read: 6 (0 with something relevant).

### Johns Hopkins University (US)

Johns Hopkins states it does not offer interviews as part of its admissions process.

Courses: us-biomedical-jhu — stated no; us-cs-jhu — stated no.

**States no interview:**

For us-biomedical-jhu, us-cs-jhu:

> “Can I interview as part of the admissions process? Open Close No, we do not offer interviews as part of our admissions process and are unable to grant meeting requests.”  
> — https://apply.jhu.edu/frequently-asked-questions/ (read 2026-11-15)

Pages read: 2 (1 with something relevant).

### Northwestern University (US)

Northwestern states it no longer offers alumni interviews and cannot offer interviews, but accepts optional InitialView interviews from students applying from international high schools.

Courses: us-cs-northwestern — stated no (third-party option only); us-economics-northwestern — stated no (third-party option only); us-engineering-northwestern — stated no (third-party option only).

**Third-party interview only** (us-cs-northwestern, us-economics-northwestern, us-engineering-northwestern): *optional (InitialView interviews accepted from international high school applicants)*. Not an interview the university runs, so it is not a record.

> “InitialView does not review or rate the interviews. Evaluation is done only by members of the admissions committee and provides an additional source of information and perspective about your English language proficiency, personal qualities, academic interests, and potential fit for Northwestern.”  
> — https://admissions.northwestern.edu/apply/requirements.html (read 2026-11-15)

**States no interview:**

For us-cs-northwestern, us-economics-northwestern, us-engineering-northwestern:

> “Northwestern no longer offers alumni interviews as an optional part of the application process.”  
> — https://admissions.northwestern.edu/apply/requirements.html (read 2026-11-15)

For us-cs-northwestern, us-economics-northwestern, us-engineering-northwestern:

> “While our application volume is such that we cannot offer interviews, students applying from US high schools are welcome to record a Glimpse video if you wish to add a more candid voice to your application.”  
> — https://admissions.northwestern.edu/apply/requirements.html (read 2026-11-15)

Pages read: 1 (1 with something relevant).

### Brown University (US)

Brown states its admission process no longer includes alumni interviews (since 2019-20); applicants may instead submit an optional video introduction, one route being a third-party InitialView interview for international students or students from non-traditional learning backgrounds.

Courses: us-cs-brown — stated no (third-party option only); us-maths-brown — stated no (third-party option only); us-economics-brown — stated no (third-party option only).

**Third-party interview only** (us-cs-brown, us-maths-brown, us-economics-brown): *optional (InitialView interview is one way to submit the optional video introduction; international or non-traditional-background students)*. Not an interview the university runs, so it is not a record.

> “InitialView is an interview-based video platform that allows students to record a video interview with a certified InitialView interviewer and have it uploaded and sent to any institution that you intend to apply to. These interviews are unscripted and will provide colleges with an authentic view into who you are as a student and a person.”  
> — https://admission.brown.edu/first-year/video-portfolio-alumni-interview (read 2026-11-15)

**States no interview:**

For us-cs-brown, us-maths-brown, us-economics-brown:

> “Does Brown offer alumni interviews? As of the 2019-20 academic year, Brown's admission process no longer includes alumni interviews.”  
> — https://admission.brown.edu/ask/admission-process (read 2026-11-15)

Pages read: 3 (2 with something relevant).

### Cornell University (US)

Cornell's QuestBridge applicants page states that personal interviews are not available for applicants to any of Cornell's undergraduate programs.

Courses: us-cs-cornell — stated no; us-maths-cornell — stated no; us-engineering-cornell — stated no; us-economics-cornell — stated no; us-business-cornell — stated no.

**States no interview:**

For us-cs-cornell, us-maths-cornell, us-engineering-cornell, us-economics-cornell, us-business-cornell:

> “Are interviews required for QuestBridge finalists? Personal interviews are not available for applicants to any of Cornell's undergraduate programs.”  
> — https://admissions.cornell.edu/how-to-apply/first-year-applicants/questbridge-applicants (read 2026-11-15)

**Blocked:** https://admissions.cornell.edu/community/blog/lets-talk-about-cornell-admissions-interviews (HTTP 403); https://caaan.admissions.cornell.edu/docs/FAQ.pdf (connection reset (curl 35)); https://meetezra.admissions.cornell.edu/index-simple.php?responseId=1623&type=2 (connection reset (curl 35))

Pages read: 6 (1 with something relevant).

### Vanderbilt University (US)

Vanderbilt states it does not offer interviews through the Office of Undergraduate Admissions; international applicants and non-U.S. citizens may optionally schedule a video interview with InitialView.

Courses: us-economics-vanderbilt — stated no (third-party option only); us-cs-vanderbilt — stated no (third-party option only).

**Third-party interview only** (us-economics-vanderbilt, us-cs-vanderbilt): *optional (third-party InitialView video interview; students attending high school internationally or non-U.S. citizens)*. Not an interview the university runs, so it is not a record.

> “Students attending high school internationally or non-U.S. citizens attending high school in the U.S. may schedule a video interview with InitialView .”  
> — https://admissions.vanderbilt.edu/apply/first-year-process/ (read 2026-11-15)

**States no interview:**

For us-economics-vanderbilt, us-cs-vanderbilt:

> “Are interviews required for applicants? Vanderbilt does not offer interviews through the Office of Undergraduate Admissions.”  
> — https://admissions.vanderbilt.edu/apply/first-year-process/ (read 2026-11-15)

For us-economics-vanderbilt, us-cs-vanderbilt:

> “Through partnerships with Glimpse and InitialView, Vanderbilt offers optional video submission opportunities for applicants.”  
> — https://admissions.vanderbilt.edu/apply/first-year-process/ (read 2026-11-15)

Pages read: 1 (1 with something relevant).

### University of Notre Dame (US)

A Notre Dame admissions FAQ page on m.nd.edu states that interviews are not part of its evaluation process. (The m.nd.edu page footer reads Copyright © 2017, so it may be dated; the current admissions.nd.edu How to Apply page does not mention interviews.)

Courses: us-business-notredame — stated no; us-cs-notredame — stated no.

**States no interview:**

For us-business-notredame, us-cs-notredame:

> “Do you offer off-campus alumni interviews, or do I need to come to campus for an interview? Interviews are not part of our evaluation process.”  
> — https://m.nd.edu/notredame/admissions/_/faq__interviews (read 2026-11-15)

**Blocked:** https://admissions.nd.edu/apply/application-overview/ (First fetch 200 (redirect to /apply/how-to-apply/), later re-fetch returned 403 Forbidden (bot trap)); https://admissions.nd.edu/visit-engage/stories-news/write-a-great-college-essay-tips-from-an-admissions-counselor/ (403 Forbidden after redirect to /visit-and-connect/...)

Pages read: 2 (1 with something relevant).

### Washington University in St. Louis (US)

WashU states it does not conduct nor offer evaluative interviews for admission; it strongly encourages third-party interview supplements such as InitialView to demonstrate English proficiency and accepts InitialView or Vericant interviews from international students.

Courses: us-cs-washu — stated no (third-party option only); us-business-washu — stated no (third-party option only).

**Third-party interview only** (us-cs-washu, us-business-washu): *optional (third-party InitialView/Vericant interview supplement; not evaluative WashU interviews)*. Not an interview the university runs, so it is not a record.

> “If you are an international student interested in submitting an interview to WashU, we will accept admissions interviews from InitialView or Vericant.”  
> — https://admissions.washu.edu/?p=556 (read 2026-11-15)

> “While WashU does not conduct nor offer evaluative interviews for admission, students are strongly encouraged to submit third-party interview supplements, such as InitialView , to further demonstrate their English proficiency.”  
> — https://admissions.washu.edu/how-to-apply/english-testing-requirements/ (read 2026-11-15)

**States no interview:**

For us-cs-washu, us-business-washu:

> “While WashU does not conduct nor offer evaluative interviews for admission, students are strongly encouraged to submit third-party interview supplements, such as InitialView , to further demonstrate their English proficiency.”  
> — https://admissions.washu.edu/how-to-apply/english-testing-requirements/ (read 2026-11-15)

For us-cs-washu, us-business-washu:

> “Students who choose not to submit an interview supplement will not be disadvantaged in our review process.”  
> — https://admissions.washu.edu/how-to-apply/english-testing-requirements/ (read 2026-11-15)

Pages read: 7 (2 with something relevant).

### Emory University (US)

Emory states it does not offer evaluative interviews with admission staff or alumni; international applicants may optionally submit a virtual InitialView interview, which Emory strongly recommends for applicants from Mainland China.

Courses: us-business-emory — stated no (third-party option only); us-economics-emory — stated no (third-party option only).

**Third-party interview only** (us-business-emory, us-economics-emory): *optional (third-party InitialView virtual interview; international applicants, any country welcome)*. Not an interview the university runs, so it is not a record.

> “The interview provides an opportunity to present additional context beyond the written application through a live conversation with an interviewer.”  
> — https://apply.emory.edu/apply/international (read 2026-11-15)

> “International applicants may choose to submit a virtual interview through InitialView to share more about their background, interests, and communication skills.”  
> — https://apply.emory.edu/apply/international (read 2026-11-15)

**States no interview:**

For us-business-emory, us-economics-emory:

> “Does Emory offer interviews for applicants? Emory does not offer evaluative interviews with admission staff or alumni.”  
> — https://apply.emory.edu/apply/faqs (read 2026-11-15)

Pages read: 5 (2 with something relevant).

### UCLA (US)

UCLA states it does not offer admission interviews; applicants are considered based on the UC application, with supplemental applications only for some specialty-school majors.

Courses: us-cs-ucla — stated no; us-engineering-ucla — stated no; us-economics-ucla — stated no; us-maths-ucla — stated no; us-psychology-ucla — stated no.

**States no interview:**

For us-cs-ucla, us-engineering-ucla, us-economics-ucla, us-maths-ucla, us-psychology-ucla:

> “Do you offer admission interviews? We do not offer admission interviews. Applicants are considered for admission based upon the information they submit in the UC application .”  
> — https://admission.ucla.edu/apply/first-year/first-year-requirements (read 2026-11-15)

Pages read: 1 (1 with something relevant).

### University of Southern California (US)

USC's Office of Undergraduate Admission states it does not conduct admission interviews; some schools may interview as part of additional requirements, and the listed schools with additional requirements include Marshall only for the World Bachelor in Business and do not include Viterbi.

Courses: us-business-usc — stated no; us-cs-usc — stated no.

**States no interview:**

For us-business-usc, us-cs-usc:

> “The Office of Undergraduate Admission does not conduct admission interviews, nor do we track any form of demonstrated interest in our process. Some schools may conduct interviews as a part of their additional requirements .”  
> — https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/ (read 2026-11-15)

For us-business-usc, us-cs-usc:

> “Iovine and Young Academy for Arts, Technology and the Business of Innovation USC School of Architecture Roski School of Art and Design USC School of Cinematic Arts Kaufman School of Dance USC School of Dramatic Arts Thornton School of Music Marshall School of Business (World Bachelor in Business)”  
> — https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/ (read 2026-11-15)

Pages read: 2 (1 with something relevant).

### Georgia Tech (US)

Georgia Tech states it does not conduct alumni or admission staff interviews; non-native English speakers may optionally take a third-party, unscripted interview (InitialView or Vericant).

Courses: us-cs-gatech — stated no (third-party option only); us-engineering-gatech — stated no (third-party option only).

**Third-party interview only** (us-cs-gatech, us-engineering-gatech): *optional (third-party unscripted interview; non-native English speakers)*. Not an interview the university runs, so it is not a record.

> “Interview providers include InitialView and Vericant . Interviews must be completed and submitted by the document deadline for your application plan.”  
> — https://admission.gatech.edu/first-year/interview (read 2026-11-15)

> “Applicants who are non-native English speakers have the option to participate in a third-party, unscripted interview. Interviewing in this format allows you the opportunity to personally discuss your academic and extracurricular background while also demonstrating your English language ability and communication skills.”  
> — https://admission.gatech.edu/first-year/interview (read 2026-11-15)

**States no interview:**

For us-cs-gatech, us-engineering-gatech:

> “We do not conduct alumni or admission staff interviews.”  
> — https://admission.gatech.edu/first-year/interview (read 2026-11-15)

Pages read: 2 (1 with something relevant).

### University of Virginia (US)

UVA's undergraduate admission site returned a Cloudflare challenge so its interview policy could not be read; McIntire's B.S. in Commerce FAQ (an application made by current UVA students and transfer applicants) answers 'No' to whether an interview is required.

Courses: us-business-uva — stated no; us-cs-uva — blocked (manual review); us-economics-uva — blocked (manual review).

**States no interview:**

For us-business-uva:

> “Is an interview required for admission? No.”  
> — https://www.commerce.virginia.edu/undergrad/faqs (read 2026-11-15)

**Blocked:** https://admission.virginia.edu/faq (403 Cloudflare 'Just a moment...' challenge page); https://admission.virginia.edu/ (403 Cloudflare challenge page); https://admission.virginia.edu/apply (403 Cloudflare challenge page)

Pages read: 3 (1 with something relevant).

### University of Illinois Urbana-Champaign (US)

The Illinois undergraduate admissions pages read (essays, requirements, first-year requirements, policies, FAQ index, international requirements) do not mention interviews; the Fine and Applied Arts applying page could not be fetched.

Courses: us-cs-uiuc — not published; us-engineering-uiuc — not published.

**Blocked:** https://faa.illinois.edu/applying-faa (curl TLS error (SSL certificate problem: unable to get local issuer certificate); not relevant to CS/ME but would cover FAA audition/portfolio/interview); https://www.admissions.illinois.edu/apply/first-year/requirements (404 (guessed URL))

Pages read: 7 (0 with something relevant).

### Purdue University (US)

Purdue's first-year criteria, apply, application guide, international and Future Engineers FAQ pages do not mention admission interviews.

Courses: us-engineering-purdue — not published; us-cs-purdue — not published.

Pages read: 5 (0 with something relevant).

### UNC Chapel Hill (US)

Kenan-Flagler lists a video interview among application requirements for current UNC students and admitted transfer students applying to the Undergraduate Business Program, while high-school Assured Enrollment nominees need no supplemental application; UNC's admissions FAQ on interviews was blocked.

Courses: us-business-unc — interview record; us-economics-unc — not published.

**Record `unc-business`** — Business Administration (Kenan-Flagler Undergraduate Business Program); covers us-business-unc; interviewed: *yes (video interview, for current UNC students and admitted transfer students applying to the program; not for Assured Enrollment high-school nominees)*

Format:

> “If you are an admitted transfer student or current UNC student who has completed your first year, you are encouraged to apply to the Undergraduate Business Program. Application requirements Adequate progress in the program prerequisites Resume Essays Short-answer questionnaire Video interview”  
> — https://www.kenan-flagler.unc.edu/programs/undergraduate-business/admissions/apply (read 2026-11-15)

Notes: Kenan-Flagler high-school page: Nominees for Assured Enrollment are selected through a comprehensive review of their UNC Undergraduate Admissions application. No supplemental application is required. The apply page FAQ refers to a 'video essay' (UNC Career Center resources) but does not explicitly link it to the video interview, so it is not recorded as prep advice.

**Blocked:** https://admissions.unc.edu/?p=5136 (403 'Checking connection' bot-check page after redirect to /faqs/can-i-interview-with-the-admissions-committee/); https://admissions.unc.edu/?p=5205 (403 'Checking connection' bot-check page after redirect to waiting-list interview FAQ); https://mycarolina.unc.edu/portal/virtualmeeting (503)

Pages read: 6 (2 with something relevant).

## 4. Universities that state they do not interview

Only where the university says so; each line covers exactly the course ids listed.

### HKUST

hk-sciences-hkust, hk-maths-hkust:

> “Are there any JUPAS interviews? For 2026 intake, only IRE, BMH, SSCI-A (AI), BIBU and MAEC programs may invite applicants to attend the admissions interview.”  
> — https://science.hkust.edu.hk/academic_programs/undergrad_prog/faq?page=1 (read 2026-11-15)

### University of Waterloo

ca-business-waterloo:

> “Note: We are not running the SAFAA online interview or trait assessment. Therefore, admissions to AFM and SFM are based solely on grades.”  
> — https://uwaterloo.ca/aspiring-professionals/admission-requirements (read 2026-11-15)

### McMaster University

ca-medicine-mcmaster:

> “Admissions decisions are final and we only reconsider applicants in cases where there are errors in the applicant’s high school transcripts. We will not review any additional information or conduct interviews.”  
> — https://hhsp.healthsci.mcmaster.ca/faqs/ (read 2026-11-15)

### Simon Fraser University

ca-business-sfu:

> “The Supplemental Application includes: A written, short answer response An explanation of the activities you've engaged in and achievements you've accomplished within the last 4 years Two video interview responses (transfer students only) Two references with one being academic in nature (teacher or counsellor for high school students, instructor or professor for transfer students).”  
> — https://www.sfu.ca/students/admission/programs/a-z/b/business/apply.html (read 2026-11-15)

### Concordia University

ca-business-concordia:

> “No, you are not required to submit letters of reference or letters of intent when apply to undergraduate programs at the John Molson School of Business. Admission to John Molson is strictly based on previous academic performance”  
> — https://www.concordia.ca/jmsb/programs/undergraduate/bachelor/admissions.html (read 2026-11-15)

### London School of Economics

uk-economics-lse, uk-finance-lse, uk-accounting-lse, uk-law-lse, uk-politics-lse, uk-management-lse:

> “We do not interview applicants for any of our programmes at LSE. It is not possible for applicants to request an interview with the Admissions Selector.”  
> — https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply (read 2026-11-15)

### University of Edinburgh

uk-cs-edinburgh, uk-engineering-edinburgh, uk-economics-edinburgh, uk-law-edinburgh, uk-psychology-edinburgh, uk-architecture-edinburgh, uk-maths-edinburgh:

> “You may be invited to an interview for degree programmes in: medicine nursing teacher education veterinary medicine For medicine and veterinary medicine this will take the form of multiple mini-interviews. We do not interview for entry to any other degree programmes.”  
> — https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios (read 2026-11-15)

### University of Manchester

uk-economics-manchester:

> “Interview requirements We do not interview.”  
> — https://www.manchester.ac.uk/study/undergraduate/courses/2027/10224/bsc-economics/ (read 2026-11-15)

uk-engineering-manchester:

> “Interview requirements We do not hold interviews but applicants who receive an offer may be invited to a virtual webinar or an on-campus offer holder day which generally take place on Wednesday afternoons from February to April.”  
> — https://www.manchester.ac.uk/study/undergraduate/courses/2027/03921/meng-mechanical-engineering/ (read 2026-11-15)

uk-accounting-manchester:

> “Interview requirements We do not as a rule interview applicants. However, we reserve the right to interview candidates with non-standard backgrounds, eg. Mature students and students aged under 17.”  
> — https://www.manchester.ac.uk/study/undergraduate/courses/2027/03520/bsc-management-accounting-and-finance/ (read 2026-11-15)

uk-maths-manchester:

> “Interview requirements We will not be holding interviews for September 2027 entry.”  
> — https://www.manchester.ac.uk/study/undergraduate/courses/2027/00590/bsc-mathematics/ (read 2026-11-15)

### University of Warwick

uk-economics-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/bsc-economics/ (read 2026-11-15)

uk-maths-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/bsc-mathematics/ (read 2026-11-15)

uk-cs-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/bsc-computer-science/ (read 2026-11-15)

uk-law-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/llb-law/ (read 2026-11-15)

uk-accounting-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/bsc-accounting-finance/ (read 2026-11-15)

uk-engineering-warwick:

> “Will I need to interview for this course? Warwick does not typically interview applicants. Offers are made based on the UCAS application, including predicted and achieved grades, the personal statement, and the school reference.”  
> — https://warwick.ac.uk/study/undergraduate/courses/meng-engineering/ (read 2026-11-15)

### University of Bristol

uk-maths-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/maths.pdf (read 2026-11-15)

uk-cs-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/computer-science.pdf (read 2026-11-15)

uk-economics-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/economics.pdf (read 2026-11-15)

uk-engineering-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In the majority of cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/mechanical-engineering.pdf (read 2026-11-15)

uk-law-bristol:

> “1.4 Interviews For these courses, applicants are not routinely interviewed. In most cases, admissions decisions will be made on the basis of the application information alone.”  
> — https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/law.pdf (read 2026-11-15)

### University of St Andrews

uk-cs-standrews, uk-economics-standrews, uk-maths-standrews:

> “We also rely heavily on your personal statement and referee's report as the University does not interview for most undergraduate programmes. Applicants for Medicine , our Supported Pathways programmes, BA International Honours and some part-time courses may be invited to an interview.”  
> — https://www.st-andrews.ac.uk/study/undergraduate/apply/after/ (read 2026-11-15)

uk-cs-standrews, uk-economics-standrews, uk-maths-standrews:

> “Most students who apply to the University for undergraduate study will not be required to attend an interview. The exceptions to this will be if you are applying for: Medicine Supported pathway programmes Part-time study”  
> — https://www.st-andrews.ac.uk/subjects/entry/ (read 2026-11-15)

### University of Leeds

uk-cs-leeds, uk-engineering-leeds:

> “Interviews Interviews do not form part of our standard admissions process; however, in some cases, an applicant may be invited for an interview if it will help inform whether an offer should be made.”  
> — https://eps.leeds.ac.uk/faculty-engineering-physical-sciences/doc/admissions-courses-faculty-engineering-physical-sciences-4 (read 2026-11-15)

uk-law-leeds:

> “For all other programmes in the Faculty of Social Sciences interviews do not form part of our standard admissions process; however, in some cases, an applicant may be invited for an interview if it will help inform whether an offer should be made.”  
> — https://essl.leeds.ac.uk/education-social-sciences-law/doc/admissions-guidance-courses-faculty-social-sciences (read 2026-11-15)

uk-economics-leeds:

> “Will I be invited to an interview? Interviews do not form part of our standard admissions process; however, some applicants, such as mature students, may be invited for an interview and asked to provide an example of academic writing to help inform whether an offer should be made.”  
> — https://business.leeds.ac.uk/faculty/doc/apply-7 (read 2026-11-15)

### University of Nottingham

uk-law-nottingham:

> “Do you hold interviews? We do not normally include an interview as part of the admissions process.”  
> — https://www.nottingham.ac.uk/law/study/undergraduate/faqs.aspx (read 2026-11-15)

### Columbia University

us-cs-columbia, us-maths-columbia, us-economics-columbia, us-engineering-columbia:

> “After careful consideration, Columbia College and the Fu Foundation School of Engineering and Applied Science have decided to discontinue their alumni interview program for individuals seeking admission. The decision, which takes effect this fall for the 2023-2024 admissions cycle, was made to ensure that all candidates have the same opportunity to connect with and learn about Columbia through the application process.”  
> — https://arc.undergrad.admissions.columbia.edu/ (read 2026-11-15)

### Caltech

us-cs-caltech, us-physics-caltech, us-engineering-caltech, us-maths-caltech:

> “We don't have an interview process at Caltech, so our supplemental essays are where you are speaking directly to us.”  
> — https://www.admissions.caltech.edu/apply/first-year-applicants/supplemental-application-essays/essay-writing-advice (read 2026-11-15)

### Carnegie Mellon University

us-cs-cmu, us-engineering-cmu, us-business-cmu, us-maths-cmu:

> “Interviews are rarely required. Carnegie Mellon does not offer interviews.”  
> — https://www.cmu.edu/admission/admission/application-and-financial-aid-support/common-admission-terms (read 2026-11-15)

### UC Berkeley

us-cs-berkeley, us-engineering-berkeley, us-economics-berkeley, us-maths-berkeley:

> “UC Berkeley does not conduct interviews in the admissions process. The application is the only information we will have to assess your strengths.”  
> — https://admissions.berkeley.edu/apply-to-berkeley/application-resources/application-tips/ (read 2026-11-15)

us-cs-berkeley, us-engineering-berkeley, us-economics-berkeley, us-maths-berkeley:

> “UC Berkeley does not offer alumni or admissions officer interviews as part of its application process.”  
> — https://admissions.berkeley.edu/requirements-for-international-students/ (read 2026-11-15)

### Johns Hopkins University

us-biomedical-jhu, us-cs-jhu:

> “Can I interview as part of the admissions process? Open Close No, we do not offer interviews as part of our admissions process and are unable to grant meeting requests.”  
> — https://apply.jhu.edu/frequently-asked-questions/ (read 2026-11-15)

### Northwestern University

us-cs-northwestern, us-economics-northwestern, us-engineering-northwestern:

> “Northwestern no longer offers alumni interviews as an optional part of the application process.”  
> — https://admissions.northwestern.edu/apply/requirements.html (read 2026-11-15)

us-cs-northwestern, us-economics-northwestern, us-engineering-northwestern:

> “While our application volume is such that we cannot offer interviews, students applying from US high schools are welcome to record a Glimpse video if you wish to add a more candid voice to your application.”  
> — https://admissions.northwestern.edu/apply/requirements.html (read 2026-11-15)

### Brown University

us-cs-brown, us-maths-brown, us-economics-brown:

> “Does Brown offer alumni interviews? As of the 2019-20 academic year, Brown's admission process no longer includes alumni interviews.”  
> — https://admission.brown.edu/ask/admission-process (read 2026-11-15)

### Cornell University

us-cs-cornell, us-maths-cornell, us-engineering-cornell, us-economics-cornell, us-business-cornell:

> “Are interviews required for QuestBridge finalists? Personal interviews are not available for applicants to any of Cornell's undergraduate programs.”  
> — https://admissions.cornell.edu/how-to-apply/first-year-applicants/questbridge-applicants (read 2026-11-15)

### Vanderbilt University

us-economics-vanderbilt, us-cs-vanderbilt:

> “Are interviews required for applicants? Vanderbilt does not offer interviews through the Office of Undergraduate Admissions.”  
> — https://admissions.vanderbilt.edu/apply/first-year-process/ (read 2026-11-15)

us-economics-vanderbilt, us-cs-vanderbilt:

> “Through partnerships with Glimpse and InitialView, Vanderbilt offers optional video submission opportunities for applicants.”  
> — https://admissions.vanderbilt.edu/apply/first-year-process/ (read 2026-11-15)

### University of Notre Dame

us-business-notredame, us-cs-notredame:

> “Do you offer off-campus alumni interviews, or do I need to come to campus for an interview? Interviews are not part of our evaluation process.”  
> — https://m.nd.edu/notredame/admissions/_/faq__interviews (read 2026-11-15)

### Washington University in St. Louis

us-cs-washu, us-business-washu:

> “While WashU does not conduct nor offer evaluative interviews for admission, students are strongly encouraged to submit third-party interview supplements, such as InitialView , to further demonstrate their English proficiency.”  
> — https://admissions.washu.edu/how-to-apply/english-testing-requirements/ (read 2026-11-15)

us-cs-washu, us-business-washu:

> “Students who choose not to submit an interview supplement will not be disadvantaged in our review process.”  
> — https://admissions.washu.edu/how-to-apply/english-testing-requirements/ (read 2026-11-15)

### Emory University

us-business-emory, us-economics-emory:

> “Does Emory offer interviews for applicants? Emory does not offer evaluative interviews with admission staff or alumni.”  
> — https://apply.emory.edu/apply/faqs (read 2026-11-15)

### UCLA

us-cs-ucla, us-engineering-ucla, us-economics-ucla, us-maths-ucla, us-psychology-ucla:

> “Do you offer admission interviews? We do not offer admission interviews. Applicants are considered for admission based upon the information they submit in the UC application .”  
> — https://admission.ucla.edu/apply/first-year/first-year-requirements (read 2026-11-15)

### University of Southern California

us-business-usc, us-cs-usc:

> “The Office of Undergraduate Admission does not conduct admission interviews, nor do we track any form of demonstrated interest in our process. Some schools may conduct interviews as a part of their additional requirements .”  
> — https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/ (read 2026-11-15)

us-business-usc, us-cs-usc:

> “Iovine and Young Academy for Arts, Technology and the Business of Innovation USC School of Architecture Roski School of Art and Design USC School of Cinematic Arts Kaufman School of Dance USC School of Dramatic Arts Thornton School of Music Marshall School of Business (World Bachelor in Business)”  
> — https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/ (read 2026-11-15)

### Georgia Tech

us-cs-gatech, us-engineering-gatech:

> “We do not conduct alumni or admission staff interviews.”  
> — https://admission.gatech.edu/first-year/interview (read 2026-11-15)

### University of Virginia

us-business-uva:

> “Is an interview required for admission? No.”  
> — https://www.commerce.virginia.edu/undergrad/faqs (read 2026-11-15)

## 5. Nothing published

The official pages read do not say whether these courses interview. Recorded as "not published"; nothing is inferred.

| University | Courses | Pages read |
|---|---|---|
| King's College London | uk-law-kcl, uk-cs-kcl, uk-economics-kcl, uk-psychology-kcl | 11 |
| University of Manchester | uk-cs-manchester, uk-law-manchester | 6 |
| University of Nottingham | uk-cs-nottingham, uk-economics-nottingham | 8 |
| University of Birmingham | uk-cs-birmingham, uk-economics-birmingham, uk-engineering-birmingham, uk-law-birmingham | 5 |
| University of Exeter | uk-economics-exeter, uk-law-exeter, uk-cs-exeter, uk-psychology-exeter | 5 |
| University of Pennsylvania | us-business-wharton, us-cs-penn, us-economics-penn | 12 |
| University of Michigan | us-cs-michigan, us-business-michigan, us-economics-michigan, us-maths-michigan, us-psychology-michigan | 10 |
| Chinese University of Hong Kong | hk-psychology-cuhk | 6 |
| University of Illinois Urbana-Champaign | us-cs-uiuc, us-engineering-uiuc | 7 |
| Purdue University | us-engineering-purdue, us-cs-purdue | 5 |
| UNC Chapel Hill | us-economics-unc | 6 |
| University of Toronto | ca-cs-utoronto, ca-maths-toronto, ca-medicine-utoronto, ca-economics-utoronto | 6 |
| University of British Columbia | ca-maths-ubc, ca-cs-ubc, ca-engineering-ubc, ca-economics-ubc | 5 |
| McGill University | ca-maths-mcgill, ca-cs-mcgill, ca-engineering-mcgill, ca-economics-mcgill | 11 |
| University of Waterloo | ca-cs-waterloo, ca-mathematics-waterloo | 6 |
| Western University | ca-cs-western, ca-medicine-western | 4 |
| Queen's University | ca-engineering-queens, ca-economics-queens | 4 |
| Simon Fraser University | ca-cs-sfu | 3 |
| University of Calgary | ca-engineering-calgary, ca-business-calgary | 4 |
| University of Ottawa | ca-cs-ottawa | 2 |
| Dalhousie University | ca-engineering-dalhousie | 2 |
| Concordia University | ca-cs-concordia | 2 |
| University of Victoria | ca-cs-uvic | 3 |

## 6. Manual-review list

### Carried over unchanged (16 UK courses; not retried)

Courses: uk-engineering-oxford, uk-physics-oxford, uk-economics-oxford, uk-medicine-oxford, uk-medicine-imperial,
uk-cs-imperial, uk-electrical-imperial, uk-mechanical-imperial, uk-chemical-imperial, uk-physics-imperial,
uk-maths-imperial, uk-bioengineering-imperial, uk-medicine-ucl, uk-architecture-ucl, uk-pharmacy-ucl, uk-law-ucl.

- https://www.ox.ac.uk/admissions/undergraduate/applying/guide-for-applicants/interviews/sample_questions — Oxford central "Sample interview questions" page — Cloudflare challenge (403). The PPE and Maths pages point here for sample questions.
- https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford/guide/interviews — Oxford central interviews guide — Cloudflare challenge (403).
- https://www.medsci.ox.ac.uk/study/medicine/pre-clinical/interviews — Oxford Medicine interviews — 403.
- https://www.medsci.ox.ac.uk/study/medicine/pre-clinical/application-process — Oxford Medicine application process — 403.
- https://www.sbs.ox.ac.uk/programmes/undergraduate/economics-and-management — Oxford Economics and Management — 403; economics.ox.ac.uk admissions URLs 404.
- https://www.law.ox.ac.uk/admissions/undergraduate — Oxford Law undergraduate admissions landing page — 403 (the Law FAQ page loaded and is used).
- https://eng.ox.ac.uk/media/4095/typical_engineering_interview_questions-accessible.pdf — Oxford Engineering typical-question PDF is undated and describes in-person interviews; confirm it is current.
- https://www.physics.ox.ac.uk/study/undergraduates — Oxford Physics: no current interview page found (404); only the 2021 teacher pack.
- https://www.imperial.ac.uk/study/apply/undergraduate/process/interviews/ — Imperial — every imperial.ac.uk URL returned 403 (CloudFront). All 8 Imperial courses unresearched.
- https://www.ucl.ac.uk/medical-sciences/divisions/medical-school/study/undergraduate/mbbs-admissions/selection-interviews/interviews — UCL Medicine MMI page — 403. UCL Architecture, Pharmacy and Laws pages also 403.
- https://www.admissions.eng.cam.ac.uk/faqs — Cambridge Engineering admissions FAQ — 403.
- https://medicine-vet-medicine.ed.ac.uk/edinburgh-medical-school/medicine/applying/how-to-apply/selection/interviews — Edinburgh Medicine selection/MMI detail — page not found (404); locate the current URL by hand.

### New (blocked or needing a human check)

Placeholder records (`manualReview: true`, no evidence, interviewed "not published (site blocked)") cover the courses of
blocked sites that nothing else covers: University of Hong Kong (6), City University of Hong Kong (3), University of Alberta (3), Singapore Management University (4), University College London (6), Durham University (6), New York University (2), University of Virginia (2).

- https://admissions.hku.hk/apply/jupas/interview — University of Hong Kong: connection reset (curl 35: Recv failure: Connection reset by peer)
- https://admissions.hku.hk/apply/international-qualifications/interview — University of Hong Kong: connection reset (curl 35)
- https://admissions.hku.hk/admissions/international/sites/default/files/A_guide_for_students.pdf — University of Hong Kong: connection reset (curl 35)
- https://admissions.hku.hk/sites/default/files/2026-10/Digital_AdmBrochure_2728.pdf — University of Hong Kong: connection reset (curl 35)
- https://med.hku.hk/ugadmissions2020/mbbsfaq.html — University of Hong Kong: redirected to www.med.hku.hk, then connection reset (curl 35)
- https://hkumed-ugadmissions.hku.hk/admissions-non-jupas-scheme/?lang=en — University of Hong Kong: connection reset (curl 35)
- https://ug.hkubs.hku.hk/admission/faq/non-jupas-applicants — University of Hong Kong: connection reset (curl 35)
- https://datasce.cs.hku.hk/index.php/admissions/faq/ — University of Hong Kong: connection reset (curl 35)
- https://cs.hku.hk/programmes/beng-compsc/admission — University of Hong Kong: connection reset (curl 35)
- https://www.socsc.hku.hk/bpsych/prospective-student/ — University of Hong Kong: HTTP 500
- https://join.ust.hk/admissions/jupas — HKUST: TLS error: certificate has expired (curl 60); same content later read at join.hkust.edu.hk
- https://bmundergrad.hkust.edu.hk/admissions/faqs/international-qualifications — HKUST: TLS/certificate error (curl 60)
- https://cityu.edu.hk/admo/interview-arrangements-local-jupas-applicants — City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)
- https://www.cityu.edu.hk/admo/faq — City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)
- https://cityu.edu.hk/admo/apply-now/non-local-applicants — City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)
- https://www.cityu.edu.hk/slw/prospective-students/undergraduate-programme/bachelor-of-laws-llb — City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)
- https://www.cityu.edu.hk/admo/programmes/bachelor-laws — City University of Hong Kong: HTTP 200 but only an Incapsula bot-check script page (no content)
- https://www.artsci.utoronto.ca/future/ready-apply/faqs — University of Toronto: bot check page ('Verifying you are human...') instead of content
- https://www.sauder.ubc.ca/bachelor-commerce/bcom-video-interview — University of British Columbia: 403
- https://www.sauder.ubc.ca/programs/bachelors-degrees/bachelor-commerce/admissions-finance/direct-entry — University of British Columbia: 403
- https://coursecatalogue.mcgill.ca/en/undergraduate/medicine-health-sciences/professional/admission-procedures-requirements/interview-process/ — McGill University: HTTP 202 with no page content (challenge/empty shell)
- https://coursecatalogue.mcgill.ca/en/undergraduate/medicine-health-sciences/professional/admission-procedures-requirements/applicant-categories/ — McGill University: HTTP 202 with no page content (challenge/empty shell)
- https://www.mcgill.ca/law/files/law/09-25-2025_mcgill_bcl-jd_admissions.pdf — McGill University: connection error: HTTP/2 stream not closed cleanly (INTERNAL_ERROR)
- https://uwaterloo.ca/engineering/undergraduate-students/application-process/admission-information-form — University of Waterloo: 403
- https://www.ualberta.ca/en/admissions/undergraduate/admission/admission-requirements/index.html — University of Alberta: 403 from CloudFront (Request blocked)
- https://www.ualberta.ca/en/undergraduate-programs/bachelor-of-commerce.html — University of Alberta: 403 from CloudFront (Request blocked)
- https://www.ualberta.ca/en/undergraduate-programs/engineering.html — University of Alberta: 403 from CloudFront (Request blocked)
- https://www.ualberta.ca/en/undergraduate-programs/computing-science-bsc.html — University of Alberta: 403 from CloudFront (Request blocked)
- https://www.ualberta.ca/en/engineering/programs/undergraduate/index.html — University of Alberta: 403 from CloudFront (Request blocked)
- https://calendar.ualberta.ca/content.php?catoid=69&navoid=20815 — University of Alberta: HTTP 202 with no page content (challenge/empty shell)
- https://calendar.ualberta.ca/content.php?catoid=69&navoid=21497 — University of Alberta: HTTP 202 with no page content (challenge/empty shell)
- https://catalogue.uottawa.ca/en/undergrad/major-computer-science/ — University of Ottawa: HTTP 202 with no page content (challenge/empty shell)
- https://www.nus.edu.sg/oam/admissions — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://www.nus.edu.sg/oam/admissions/aptitude-based-admissions — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://www.nus.edu.sg/oam/admissions/first-choice-bonus-points — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://medicine.nus.edu.sg/prospective-students/focused-skills-assessment/ — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://medicine.nus.edu.sg/prospective-students/nus-medicine-admissions-assessment/ — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://medicine.nus.edu.sg/prospective-students/admissions-frequently-asked-questions/ — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://medicine.nus.edu.sg/wp-content/uploads/2025/03/NUS-SJT-2025-Applicant-Information-2025.pdf — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://bba.nus.edu.sg/admissions-scholarships/entry-requirements/ — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://nus.edu.sg/oam/docs/default-source/nus-publications/intlprospectus.pdf — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://nus.edu.sg/oam/admissions/faculty-interview-and-test-dates — National University of Singapore: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://www.askadmissions.nus.edu.sg/app/answers/detail/a_id/546 — National University of Singapore: connection failed (curl: CONNECT tunnel failed, response 502)
- https://www.ntu.edu.sg/docs/default-source/nanyang-business-school-(nbs)/ug-detail/admission-requirement---a-levele6f64d0a-5e70-4829-9a8a-39b0653a582c.pdf?Status=Master&sfvrsn=e1ef46f6_3 — Nanyang Technological University (ntu-business-alevel): NBS undergraduate A-level entry-requirements PDF; it shows indicative grade profiles (2019 – 2020) for both Business and Computer Science, so it may belong to a Business/Computing double-degree page and may be dated. Needs a human check before attaching to the single-major Business course.
- https://admissions.smu.edu.sg/faq/all — Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://admissions.smu.edu.sg/admissions-requirements/important-dates — Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://admissions.smu.edu.sg/admissions-requirements/international-and-other-qualifications — Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://admissions.smu.edu.sg/sites/admissions.smu.edu.sg/files/Law/SMU%20Law%20Writing%20Test%20Information%20for%20Applicants_2026.pdf — Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://admissions.smu.edu.sg/faqs/admissions-and-applications — Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://law.smu.edu.sg/ — Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://scis.smu.edu.sg/ — Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://economics.smu.edu.sg/ — Singapore Management University: HTTP 200 but body is only an Incapsula bot-check script (_Incapsula_Resource), no content
- https://admtalk.sutd.edu.sg/admissions-scholarships/ — Singapore University of Technology & Design: connection failed (curl: CONNECT tunnel failed, response 502)
- https://www.ucl.ac.uk/study/prospective-students/undergraduate/how-apply/how-we-assess-your-application — University College London: HTTP 403 on plain request
- https://www.ucl.ac.uk/study/prospective-students/school-teachers-and-counsellors/tests-tasks-and-interviews — University College London: HTTP 403 on plain request
- https://www.durham.ac.uk/media/durham-university/study/admissions-policies/Admissions-Policy-2026-27.pdf — Durham University: 403 from CloudFront ("Request blocked.")
- https://www.durham.ac.uk/study/undergraduate/ — Durham University: 403 from CloudFront ("Request blocked.")
- https://www.durham.ac.uk/study/undergraduate/how-to-apply/what-happens-to-your-application/interviews-and-selection-days/ — Durham University: 403 from CloudFront ("Request blocked.")
- https://www.durham.ac.uk/study/undergraduate/how-to-apply/entry-requirements/ — Durham University: 403 from CloudFront ("Request blocked.")
- https://undergrad.admissions.columbia.edu/apply/firstyear — Columbia University: HTTP 403
- https://undergrad.admissions.columbia.edu/apply/first-year — Columbia University: HTTP 403
- https://undergrad.admissions.columbia.edu/faq — Columbia University: HTTP 403
- https://undergrad.admissions.columbia.edu/apply/process — Columbia University: HTTP 403
- https://undergrad.admissions.columbia.edu/apply/first-year/interviews — Columbia University: HTTP 403
- https://www.college.columbia.edu/news/announcement-alumni-admissions-interviews — Columbia University: HTTP 403
- https://www.college.columbia.edu/alumni/volunteer/alumni-interviewing — Columbia University: HTTP 403
- https://www.cc-seas.columbia.edu/faq — Columbia University: HTTP 403
- https://www.alumni.upenn.edu/interviews — University of Pennsylvania: HTTP 403 (Penn Alumni site; page on alumni interviews/admissions FAQs for alumni)
- https://www.alumni.upenn.edu/s/1587/gid2/16/interior.aspx?sid=1587&gid=2&pgid=20995 — University of Pennsylvania: HTTP 403 (Penn Alumni site; page on alumni interviews/admissions FAQs for alumni)
- https://admissions.umich.edu/apply/first-year-applicants/selection-process — University of Michigan: HTTP 403
- https://admissions.umich.edu/virtual-qa-questions — University of Michigan: HTTP 403
- https://admissions.umich.edu/apply/first-year-applicants/selection-process/denied-applicants-faq — University of Michigan: HTTP 403
- https://lsa.umich.edu/lsa/alumni-friends/get-connected/college-connections/request-an-interview.html — University of Michigan: HTTP 403
- https://michiganross.umich.edu/undergraduate/bba/admissions/faqs — University of Michigan: HTTP 403
- https://michross.bus.umich.edu/undergraduate/bba/admissions/faqs — University of Michigan: connection reset (curl 35)
- https://www.engin.umich.edu/admissions/undergraduate-admissions/admissions-faq/ — University of Michigan: HTTP 403
- https://www.engin.umich.edu/admissions-aid/undergraduate/apply/first-year/ — University of Michigan: HTTP 403
- https://teamdynamix.umich.edu/TDClient/154/Portal/KB/ArticleDet?ID=7510 — University of Michigan: curl connection/TLS failure, no response
- https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/standardized-tests/english-language-testing.html — New York University: HTTP 403
- https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/wait-list-faq.html — New York University: HTTP 403
- https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/all-freshmen-applicants.html — New York University: HTTP 403
- https://bulletins.nyu.edu/undergraduate/business/admissions/ — New York University: connection reset (curl 35)
- https://bulletins.nyu.edu/undergraduate/arts-science/admissions/ — New York University: connection reset (curl 35)
- https://bulletins.nyu.edu/undergraduate/arts/admissions/ — New York University: connection reset (curl 35)
- https://admissions.cornell.edu/community/blog/lets-talk-about-cornell-admissions-interviews — Cornell University: HTTP 403
- https://caaan.admissions.cornell.edu/docs/FAQ.pdf — Cornell University: connection reset (curl 35)
- https://meetezra.admissions.cornell.edu/index-simple.php?responseId=1623&type=2 — Cornell University: connection reset (curl 35)
- https://admissions.nd.edu/apply/application-overview/ — University of Notre Dame: First fetch 200 (redirect to /apply/how-to-apply/), later re-fetch returned 403 Forbidden (bot trap)
- https://admissions.nd.edu/visit-engage/stories-news/write-a-great-college-essay-tips-from-an-admissions-counselor/ — University of Notre Dame: 403 Forbidden after redirect to /visit-and-connect/...
- https://admission.virginia.edu/faq — University of Virginia: 403 Cloudflare 'Just a moment...' challenge page
- https://admission.virginia.edu/ — University of Virginia: 403 Cloudflare challenge page
- https://admission.virginia.edu/apply — University of Virginia: 403 Cloudflare challenge page
- https://faa.illinois.edu/applying-faa — University of Illinois Urbana-Champaign: curl TLS error (SSL certificate problem: unable to get local issuer certificate); not relevant to CS/ME but would cover FAA audition/portfolio/interview
- https://www.admissions.illinois.edu/apply/first-year/requirements — University of Illinois Urbana-Champaign: 404 (guessed URL)
- https://admissions.unc.edu/?p=5136 — UNC Chapel Hill: 403 'Checking connection' bot-check page after redirect to /faqs/can-i-interview-with-the-admissions-committee/
- https://admissions.unc.edu/?p=5205 — UNC Chapel Hill: 403 'Checking connection' bot-check page after redirect to waiting-list interview FAQ
- https://mycarolina.unc.edu/portal/virtualmeeting — UNC Chapel Hill: 503

## 7. Decisions needed before any of this is loaded

1. **The build would label every evidenced record "Yes".** `scripts/build-interview-data.mjs` sets `interviewed` to "yes"
   for any record with evidence unless its id is in its `SOME` or `OPTIONAL` sets. Many new records describe one
   route or group only (below). Loading them unchanged would show "Interviewed: Yes" and a Practise button to every
   applicant. Each record's own `interviewed` label says who it applies to:

   | Record | Courses | interviewed (as researched) |
   |---|---|---|
   | hku-law | 1 | yes (selected applicants; JUPAS group interviews, non-JUPAS panel interview) |
   | hku-business | 2 | selective (shortlisted JUPAS applicants) |
   | hku-architecture | 1 | yes (admissions interview mentioned) |
   | cuhk-all | 7 | some programmes (shortlisted candidates) |
   | cuhk-medicine | 1 | yes (shortlisted applicants, JUPAS and non-JUPAS) |
   | cuhk-business | 1 | yes (JUPAS Band A applicants invited; non-JUPAS shortlisted) |
   | cuhk-cs | 1 | listed with interview date (JUPAS, shortlisted) |
   | cuhk-engineering | 1 | some Engineering programmes listed with interview dates (JUPAS, shortlisted) |
   | cuhk-economics | 1 | listed with interview date (JUPAS, shortlisted) |
   | cuhk-law | 1 | listed with interview date (JUPAS, shortlisted) |
   | cuhk-architecture | 1 | listed with interview date (JUPAS, shortlisted) |
   | hkust-all | 7 | may be arranged (compulsory for some programmes) |
   | hkust-engineering | 2 | yes (JUPAS admission interview listed, online) |
   | hkust-quantfin | 1 | yes (compulsory, JUPAS) |
   | polyu-business | 1 | some applicants (suitable candidates may be invited) |
   | polyu-engineering | 1 | some applicants (suitable candidates may be invited) |
   | polyu-architecture | 1 | selected Band A applicants (portfolio plus aptitude tests and/or interviews) |
   | polyu-computing | 1 | usually Band A applicants invited |
   | polyu-nursing | 1 | Band A applicants considered for interview |
   | cityu-cs | 1 | selected applicants (JUPAS); normally invited (direct application) |
   | cityu-business-marketing | 1 | yes (JUPAS admission interview) |
   | cityu-business-global-business | 1 | shortlisted applicants (all Band A invited) |
   | utoronto-engineering | 1 | required timed video responses (Personal Profile in the Engineering Supplemental Application; not called an interview) |
   | ubc-commerce | 1 | yes (video interview in personal profile) |
   | mcgill-medicine | 1 | yes (invited candidates; required for admission) |
   | mcgill-law | 1 | yes (CEGEP candidates regarded as potentially admissible) |
   | waterloo-engineering | 1 | yes (required online video interview) |
   | mcmaster-engineering-cs | 2 | required recorded video responses (supplementary application; questions described as interview-style) |
   | western-ivey-aeo | 1 | yes (all AEO applicants; video interview) |
   | queens-commerce | 1 | required recorded video responses (supplementary application; not called an interview) |
   | york-schulich-bba | 1 | yes (video interview questions in mandatory supplementary application) |
   | tcd-medicine | 1 | some applicants (mature applicants; International Foundation Programme applicants to Medicine) |
   | tcd-psychology-mature | 1 | mature applicants: selection for interview depends on an aptitude test |
   | tcd-mature-all | 9 | mature applicants: some called for interview where required for the chosen subject |
   | nus-medicine | 1 | yes (shortlisted applicants) |
   | nus-computing | 1 | possible (Aptitude-Based Admissions shortlisted candidates) |
   | nus-all | 9 | possible (some faculties, shortlisted candidates) |
   | ntu-medicine | 1 | yes (shortlisted applicants, MMI) |
   | ntu-aba-all | 7 | possible (shortlisted Aptitude-based Admissions applicants) |
   | ntu-intl-selected-qualifications | 7 | selected candidates holding certain international qualifications |
   | ntu-business-alevel | 1 | on a selective basis (A-level applicants) |
   | sutd-all | 2 | selected applicants (called a 'conversation session') |
   | bath-qualification-route | 4 | some applicants (those studying certain qualifications, e.g. Access to HE Diploma or T Level); very exceptionally others |
   | bath-mathematics | 1 | very exceptionally only |
   | glasgow-year2-entry | 4 | possible for Year 2 entry applicants only |
   | berkeley-business | 1 | yes (required self-recorded video interview in Haas Supplemental Application) |
   | michigan-engineering | 1 | some applicants (may be interviewed) |
   | unc-business | 1 | yes (video interview, for current UNC students and admitted transfer students applying to the program; not for Assured Enrollment high-school nominees) |

2. **Third-party interviews.** Caltech, Carnegie Mellon University, UC Berkeley, Northwestern University, Brown University, Vanderbilt University, Washington University in St. Louis, Emory University, Georgia Tech do not interview but accept or
   recommend an optional third-party interview (InitialView/Vericant), mostly for international applicants. Kept out of
   `records` so the app would not offer practice for an interview the university does not run.
3. **Recorded video assessments** (Toronto Engineering, Queen's Commerce, McMaster Engineering/CS) are recorded
   responses the university does not call an interview; Waterloo Engineering, Western Ivey AEO, UBC Commerce and York
   Schulich BBA do call theirs a video interview. Decide whether recorded responses count as an interview in the app.
4. **Five courses in our data are not open to school leavers** (graduate-entry law and medicine): ca-law-utoronto, ca-law-ottawa, ca-medicine-dalhousie, ca-law-york, ca-law-uvic.
   This is a course-data question outside this research; nothing was changed.
5. **Judgement calls to check:**
   - HKUST Science (hk-sciences-hkust) and Maths (hk-maths-hkust): the School of Science FAQ names the only programmes that
     may invite applicants for the 2026 JUPAS intake; these two are not named. Recorded as "states no" from that list,
     not from an explicit sentence about each programme.
   - Notre Dame's "Interviews are not part of our evaluation process" is on an m.nd.edu FAQ whose footer says © 2017.
   - Emory's FAQ says it does not offer evaluative interviews but elsewhere mentions an "Alumni Interview program".
   - Waterloo: one official teaser calls the Engineering video interview "optional"; the interview page says required.
   - Queen's: the Smith page says two video responses, the central page one.
   - McMaster: the four questions are labelled "Practice Question" for the supplementary application, which the page
     calls "interview-style"; the Health Sciences "no interview" quote comes from an FAQ on reconsidering decisions.
   - Manchester Accounting: "We do not as a rule interview applicants" (reserves the right for non-standard applicants).
   - NTU Business A-level PDF (2019–2020 grade profiles, possibly a double-degree page): `ntu-business-alevel` is
     `manualReview: true`, so its evidence would be excluded by the build.
   - UNC Kenan-Flagler's video interview is for current UNC students and admitted transfers, not first-year applicants.
   - Glasgow's interviews for our four courses apply only to applicants for entry into Year 2.

## 8. Verification

- Evidence items in the proposed file: 191. Re-fetched independently and found verbatim: 187.
  Found verbatim only in the first fetch (the re-fetch was blocked): 4 — the HKU Business JUPAS FAQ
  (connection reset on re-fetch) and the NUS IB FAQ PDF (bot check on re-fetch; the first fetch saved the real PDF and
  the quotes are in text extracted from it). Failed: 0.
- Every evidence item has `source`, `accessed` and a verbatim `sourceSnippet`.
- Sources: official university domains only. No coaching site, forum, question bank, news article or third-party
  summary is used (a news article republished on sutd.edu.sg was seen and not used). InitialView/Vericant are named
  only where a university page names them.
- No access restriction was bypassed: blocked pages were fetched once with a plain request and listed in §6.

