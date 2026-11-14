# Official undergraduate interview information — research

_Research only. Nothing here is loaded by the app, and no data, code or page was changed. Read on 2026-11-14._

**Goal.** Record what universities in Altiora's dataset officially publish about undergraduate interviews — whether there is one, its format, and any sample or practice questions they publish themselves — to feed a future interview practice feature. Nothing is invented. The proposed records are in `research/interviews-proposed.json`.

## How this was gathered

- **Sources:** official university pages and PDFs only (university, department, faculty and college domains). No third-party site, coaching company, forum or question list was used as evidence, and no prior knowledge of any interview question or format.
- **Access:** every page was fetched with a plain request (`curl`, its default user agent). No text-reader proxy, cache, mirror, archive, alternate user agent or any other way round a 403, bot check or Cloudflare challenge was used. Pages that refused access are on the manual-review list.
- **Search** (web search restricted to official domains) was used only to find URLs; nothing from search summaries is used as evidence.
- **Verbatim:** every `sourceSnippet` is cut by a script from the saved text of the page, and the build fails if the text is not found exactly. Each sample question's `question` equals its `sourceSnippet`. HTML whitespace is collapsed as a browser renders it; `<br>` line breaks, and the boundary between consecutive paragraphs or list items quoted as one item (for example a problem followed by its rules), are shown as ` / `; PDF line breaks are shown as single spaces; italics and other formatting are not carried over. Maths from the Oxford CS tutor posts is quoted as published (LaTeX source rendered by MathJax).

## Part 0 — courses in `data/requirements/2027.js` that mention an interview

229 rows across 194 courses at 45 universities have an `otherRequirements` or `admissionsTests` row mentioning an interview, MMI or assessment day/centre. Oxford, Cambridge and Imperial were already in the list. The snippet is the matching sentence from the row (verbatim text from our own data, not re-checked here).

Many rows record the absence of an interview ("No interviews", "Interviews are not part of the application process") or an optional alumni conversation. Those were triaged and researched in this order: courses where an interview is part of selection (Oxford, Cambridge, Imperial, UK medicine, other UK interview courses, NUS Law, IE University), then US optional/alumni interviews.

<details><summary><strong>Brown University</strong> — 3 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-brown` | otherRequirements | InitialView interview is one way to submit it for international students |
| `us-economics-brown` | otherRequirements | InitialView interview is one way to submit it for international students |
| `us-maths-brown` | otherRequirements | InitialView interview is one way to submit it for international students |

</details>

<details><summary><strong>Carnegie Mellon University</strong> — 4 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-business-cmu` | otherRequirements | InitialView or Vericant interview: recommended, not required, for non-native English speakers |
| `us-cs-cmu` | otherRequirements | InitialView or Vericant interview: recommended, not required, for non-native English speakers |
| `us-engineering-cmu` | otherRequirements | InitialView or Vericant interview: recommended, not required, for non-native English speakers |
| `us-maths-cmu` | otherRequirements | InitialView or Vericant interview: recommended, not required, for non-native English speakers |

</details>

<details><summary><strong>Columbia University</strong> — 4 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-columbia` | otherRequirements | Interviews are not part of the application process |
| `us-economics-columbia` | otherRequirements | Interviews are not part of the application process |
| `us-engineering-columbia` | otherRequirements | Interviews are not part of the application process |
| `us-maths-columbia` | otherRequirements | Interviews are not part of the application process |

</details>

<details><summary><strong>Cornell University</strong> — 5 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-business-cornell` | otherRequirements | Personal interviews not required or available (except Architecture) |
| `us-cs-cornell` | otherRequirements | Personal interviews not required or available (except Architecture) |
| `us-economics-cornell` | otherRequirements | Personal interviews not required or available (except Architecture) |
| `us-engineering-cornell` | otherRequirements | Personal interviews not required or available (except Architecture) |
| `us-maths-cornell` | otherRequirements | Personal interviews not required or available (except Architecture) |

</details>

<details><summary><strong>Dartmouth College</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-dartmouth` | otherRequirements | Alumni interviews offered where available — not having one is no disadvantage |
| `us-economics-dartmouth` | otherRequirements | Alumni interviews offered where available — not having one is no disadvantage |

</details>

<details><summary><strong>Duke University</strong> — 3 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-duke` | otherRequirements | Alumni interviews: optional, not offered to all applicants |
| `us-economics-duke` | otherRequirements | Alumni interviews: optional, not offered to all applicants |
| `us-maths-duke` | otherRequirements | Alumni interviews: optional, not offered to all applicants |

</details>

<details><summary><strong>Durham University</strong> — 6 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-cs-durham` | otherRequirements | Interviews or written work: the policy says some courses require them, with details on the course page |
| `uk-economics-durham` | otherRequirements | Interviews or written work: the policy says some courses require them, with details on the course page |
| `uk-engineering-durham` | otherRequirements | Interviews or written work: the policy says some courses require them, with details on the course page |
| `uk-law-durham` | otherRequirements | Interviews or written work: the policy says some courses require them, with details on the course page |
| `uk-maths-durham` | otherRequirements | Interviews or written work: the policy says some courses require them, with details on the course page |
| `uk-physics-durham` | otherRequirements | Interviews or written work: the policy says some courses require them, with details on the course page |

</details>

<details><summary><strong>Emory University</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-business-emory` | otherRequirements | no evaluative interviews (InitialView optional for international applicants) |
| `us-economics-emory` | otherRequirements | No evaluative interviews with admission staff or alumni |

</details>

<details><summary><strong>Georgetown University</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-business-georgetown` | admissionsTests | Georgetown’s first-year requirements list school materials, recommendations, SAT/ACT, essays and an alumni interview |
| `us-business-georgetown` | otherRequirements | Alumni interview: required when assigned |
| `us-law-georgetown` | admissionsTests | Georgetown’s first-year requirements list school materials, recommendations, SAT/ACT, essays and an alumni interview |
| `us-law-georgetown` | otherRequirements | Alumni interview: required when assigned |

</details>

<details><summary><strong>Georgia Tech</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-gatech` | otherRequirements | No alumni or admission staff interviews |
| `us-engineering-gatech` | otherRequirements | No alumni or admission staff interviews |

</details>

<details><summary><strong>Harvard University</strong> — 5 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-biology-harvard` | otherRequirements | Alumni interview: assigned at Harvard’s discretion based on alumni availability |
| `us-cs-harvard` | otherRequirements | Alumni interview: assigned at Harvard’s discretion based on alumni availability |
| `us-economics-harvard` | otherRequirements | Alumni interview: assigned at Harvard’s discretion based on alumni availability |
| `us-law-harvard` | otherRequirements | Alumni interview: assigned at Harvard’s discretion based on alumni availability |
| `us-maths-harvard` | otherRequirements | Alumni interview: assigned at Harvard’s discretion based on alumni availability |

</details>

<details><summary><strong>IE University</strong> — 6 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `es-architecture-ie` | otherRequirements | Personal interview (online) at the Committee's discretion — most candidates expected to complete one |
| `es-business-ie` | otherRequirements | Personal interview (online) at the Committee's discretion — most candidates expected to complete one |
| `es-cs-ie` | otherRequirements | Personal interview (online) at the Committee's discretion — most candidates expected to complete one |
| `es-economics-ie` | otherRequirements | Personal interview (online) at the Committee's discretion — most candidates expected to complete one |
| `es-law-ie` | otherRequirements | Personal interview (online) at the Committee's discretion — most candidates expected to complete one |
| `es-maths-ie` | otherRequirements | Personal interview (online) at the Committee's discretion — most candidates expected to complete one |

</details>

<details><summary><strong>Imperial College London</strong> — 8 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-bioengineering-imperial` | otherRequirements | Online interview for applicants likely to meet the entry requirements who show interest and motivation for the course |
| `uk-chemical-imperial` | otherRequirements | Interview days: the department plans to hold them as part of selection |
| `uk-cs-imperial` | otherRequirements | Interviews: not standard, but may be offered to some candidates at the admissions tutors’ discretion |
| `uk-electrical-imperial` | otherRequirements | Online interview (25–30 minutes with a member of academic staff) for applicants who are likely to meet the requirements, show clear interest in the subject and perform well in the ESAT |
| `uk-maths-imperial` | otherRequirements | Interviews: not part of the regular admissions process |
| `uk-mechanical-imperial` | otherRequirements | Online interview (25–30 minutes with a member of academic staff) if selected — held on Wednesday afternoons, November to March |
| `uk-medicine-imperial` | otherRequirements | Multiple Mini Interviews (MMIs) for shortlisted applicants — no offers are made without interview |
| `uk-physics-imperial` | otherRequirements | Interviews: generally not held |

</details>

<details><summary><strong>Johns Hopkins University</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-biomedical-jhu` | otherRequirements | No admissions interviews are offered |
| `us-cs-jhu` | otherRequirements | No admissions interviews are offered |

</details>

<details><summary><strong>King's College London</strong> — 6 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-cs-kcl` | otherRequirements | The Computer Science page does not mention an interview |
| `uk-economics-kcl` | otherRequirements | The Economics page does not mention an interview |
| `uk-law-kcl` | otherRequirements | The Law page does not mention an interview |
| `uk-medicine-kcl` | otherRequirements | Interview required — no offers are made without an interview (held December–April |
| `uk-nursing-kcl` | admissionsTests | When considering those students which will be shortlisted for interview the selectors consider the following |
| `uk-nursing-kcl` | otherRequirements | Interview required — no offers are made without an interview (held November–May, remotely |
| `uk-psychology-kcl` | otherRequirements | The Psychology page does not mention an interview |

</details>

<details><summary><strong>London School of Economics</strong> — 6 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-accounting-lse` | otherRequirements | The pages checked do not mention interviews |
| `uk-economics-lse` | otherRequirements | The pages checked do not mention interviews |
| `uk-finance-lse` | otherRequirements | The pages checked do not mention interviews |
| `uk-law-lse` | otherRequirements | The pages checked do not mention interviews |
| `uk-management-lse` | otherRequirements | The pages checked do not mention interviews |
| `uk-politics-lse` | otherRequirements | The pages checked do not mention interviews |

</details>

<details><summary><strong>MIT</strong> — 6 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-mit` | otherRequirements | Interview: offered by an MIT Educational Counselor when one is available |
| `us-economics-mit` | otherRequirements | Interview: offered by an MIT Educational Counselor when one is available |
| `us-engineering-mit` | otherRequirements | Interview: offered by an MIT Educational Counselor when one is available |
| `us-maths-mit` | otherRequirements | Interview: offered by an MIT Educational Counselor when one is available |
| `us-mechanical-mit` | otherRequirements | Interview: offered by an MIT Educational Counselor when one is available |
| `us-physics-mit` | otherRequirements | Interview: offered by an MIT Educational Counselor when one is available |

</details>

<details><summary><strong>National University of Singapore</strong> — 1 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `sg-law-nus` | admissionsTests | NUS Law written test + interview (shortlisted applicants) — required |

</details>

<details><summary><strong>Northwestern University</strong> — 3 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-northwestern` | otherRequirements | No alumni interviews |
| `us-economics-northwestern` | otherRequirements | No alumni interviews |
| `us-engineering-northwestern` | otherRequirements | No alumni interviews |

</details>

<details><summary><strong>Princeton University</strong> — 4 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-princeton` | otherRequirements | Alumni interview: optional, subject to alumni availability |
| `us-economics-princeton` | otherRequirements | Alumni interview: optional, subject to alumni availability |
| `us-engineering-princeton` | otherRequirements | Alumni interview: optional, subject to alumni availability |
| `us-maths-princeton` | otherRequirements | Alumni interview: optional, subject to alumni availability |

</details>

<details><summary><strong>Rice University</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-rice` | otherRequirements | Interview recommended but optional and not guaranteed (virtual in 2026–27) |
| `us-engineering-rice` | otherRequirements | Interview recommended but optional and not guaranteed (virtual in 2026–27) |

</details>

<details><summary><strong>Stanford University</strong> — 5 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-stanford` | otherRequirements | Interview: optional |
| `us-economics-stanford` | otherRequirements | Interview: optional |
| `us-engineering-stanford` | otherRequirements | Interview: optional |
| `us-maths-stanford` | otherRequirements | Interview: optional |
| `us-psychology-stanford` | otherRequirements | Interview: optional |

</details>

<details><summary><strong>UC Berkeley</strong> — 5 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-business-berkeley` | otherRequirements | No interviews (alumni or admissions officer) |
| `us-cs-berkeley` | otherRequirements | No interviews (alumni or admissions officer) |
| `us-economics-berkeley` | otherRequirements | No interviews (alumni or admissions officer) |
| `us-engineering-berkeley` | otherRequirements | No interviews (alumni or admissions officer) |
| `us-maths-berkeley` | otherRequirements | No interviews (alumni or admissions officer) |

</details>

<details><summary><strong>UCLA</strong> — 5 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-ucla` | otherRequirements | No admission interviews |
| `us-economics-ucla` | otherRequirements | No admission interviews |
| `us-engineering-ucla` | otherRequirements | No admission interviews |
| `us-maths-ucla` | otherRequirements | No admission interviews |
| `us-psychology-ucla` | otherRequirements | No admission interviews |

</details>

<details><summary><strong>University College London</strong> — 10 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-architecture-ucl` | otherRequirements | You may then be invited to an online interview (Zoom) |
| `uk-biomedical-ucl` | otherRequirements | The 2027 course page mentions no interview or admissions test |
| `uk-cs-ucl` | otherRequirements | The course page mentions no interview |
| `uk-economics-ucl` | otherRequirements | The course page mentions no interview |
| `uk-engineering-ucl` | otherRequirements | The course page mentions no interview |
| `uk-law-ucl` | otherRequirements | The Laws page describes interviews only for the Law with a European Legal System courses (to assess language competence) |
| `uk-maths-ucl` | otherRequirements | The 2027 course page mentions no interview |
| `uk-medicine-ucl` | otherRequirements | Multiple mini interviews (MMIs), held between December and March |
| `uk-pharmacy-ucl` | admissionsTests | UCL School of Pharmacy values-based test for all applicants (numeracy, communication and scenario questions), followed by interview for successful applicants |
| `uk-pharmacy-ucl` | otherRequirements | Values-based test and interview, usually December–April |
| `uk-psychology-ucl` | otherRequirements | The 2027 course page mentions no interview or admissions test |

</details>

<details><summary><strong>University of Bath</strong> — 6 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-accounting-bath` | otherRequirements | Interview: only for Access to HE or T Level applicants, or very exceptionally where circumstances cannot be assessed from the application |
| `uk-cs-bath` | otherRequirements | Interview: only for Access to HE or T Level applicants, or very exceptionally where circumstances cannot be assessed from the application |
| `uk-economics-bath` | otherRequirements | Interview: only for Access to HE applicants, or very exceptionally where circumstances cannot be assessed from the application |
| `uk-engineering-bath` | otherRequirements | Interview: only for Access to HE applicants, or very exceptionally where circumstances cannot be assessed from the application |
| `uk-maths-bath` | otherRequirements | interview only very exceptionally, where circumstances cannot be assessed from the application |
| `uk-pharmacy-bath` | admissionsTests | Selection is by application and a required interview |
| `uk-pharmacy-bath` | otherRequirements | Selection interview required — no offer without a successful interview (remote for applicants outside the UK) |

</details>

<details><summary><strong>University of Birmingham</strong> — 1 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-medicine-birmingham` | otherRequirements | Interview — attend if invited (UCAT Situational Judgement result is used at interview) |

</details>

<details><summary><strong>University of Bristol</strong> — 6 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-cs-bristol` | otherRequirements | Not routinely interviewed (interviews only in exceptional circumstances) |
| `uk-economics-bristol` | otherRequirements | Not routinely interviewed (interviews only in exceptional circumstances) |
| `uk-engineering-bristol` | otherRequirements | Not routinely interviewed (interviews only in exceptional circumstances) |
| `uk-law-bristol` | otherRequirements | Not routinely interviewed (interviews only in exceptional circumstances) |
| `uk-maths-bristol` | otherRequirements | Not routinely interviewed (interviews only in exceptional circumstances) |
| `uk-medicine-bristol` | admissionsTests | applicants meeting the academic requirements are ranked 100% on UCAT (excluding Situational Judgement) for interview |
| `uk-medicine-bristol` | otherRequirements | Interview required: top-scoring applicants (by UCAT) are invited to online interviews, anticipated December–February |

</details>

<details><summary><strong>University of Cambridge</strong> — 7 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-cs-cambridge` | admissionsTests | All applicants for Computer Science are required to take the Test of Mathematics for University Admission (TMUA) at an authorised assessment centre |
| `uk-cs-cambridge` | otherRequirements | Interviews: every applicant made an offer has been interviewed |
| `uk-economics-cambridge` | admissionsTests | All applicants for Economics are required to take the Test of Mathematics for University Admission (TMUA) at an authorised assessment centre |
| `uk-economics-cambridge` | otherRequirements | Interviews: every applicant made an offer has been interviewed |
| `uk-engineering-cambridge` | otherRequirements | Interviews: every applicant made an offer has been interviewed |
| `uk-law-cambridge` | admissionsTests | All applicants for Law are required to take the National Admissions Test for Law (LNAT) at an authorised assessment centre |
| `uk-law-cambridge` | otherRequirements | Interviews: every applicant made an offer has been interviewed |
| `uk-maths-cambridge` | admissionsTests | TMUA (Test of Mathematics for University Admission) — required for all applicants, before interview |
| `uk-maths-cambridge` | otherRequirements | Interviews: every applicant made an offer has been interviewed |
| `uk-medicine-cambridge` | otherRequirements | Selection uses academic record, UCAT and interviews (no minimum UCAT score) |
| `uk-naturalsciences-cambridge` | admissionsTests | All applicants for Natural Sciences are required to take the Engineering and Science Admissions Test (ESAT) at an authorised assessment centre |
| `uk-naturalsciences-cambridge` | otherRequirements | Interviews: every applicant made an offer has been interviewed |

</details>

<details><summary><strong>University of Edinburgh</strong> — 8 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-architecture-edinburgh` | admissionsTests | Partly verified: Edinburgh’s interviews, tests and portfolios page still refers to the UCAT “in 2025” (the previous cycle) |
| `uk-architecture-edinburgh` | otherRequirements | No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine |
| `uk-cs-edinburgh` | admissionsTests | Partly verified: Edinburgh’s interviews, tests and portfolios page still refers to the UCAT “in 2025” (the previous cycle) |
| `uk-cs-edinburgh` | otherRequirements | No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine |
| `uk-economics-edinburgh` | admissionsTests | Partly verified: Edinburgh’s interviews, tests and portfolios page still refers to the UCAT “in 2025” (the previous cycle) |
| `uk-economics-edinburgh` | otherRequirements | No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine |
| `uk-engineering-edinburgh` | admissionsTests | Partly verified: Edinburgh’s interviews, tests and portfolios page still refers to the UCAT “in 2025” (the previous cycle) |
| `uk-engineering-edinburgh` | otherRequirements | No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine |
| `uk-law-edinburgh` | admissionsTests | Partly verified: Edinburgh’s interviews, tests and portfolios page still refers to the UCAT “in 2025” (the previous cycle) |
| `uk-law-edinburgh` | otherRequirements | No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine |
| `uk-maths-edinburgh` | admissionsTests | Partly verified: Edinburgh’s interviews, tests and portfolios page still refers to the UCAT “in 2025” (the previous cycle) |
| `uk-maths-edinburgh` | otherRequirements | No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine |
| `uk-medicine-edinburgh` | otherRequirements | Interview: required (multiple mini-interviews) |
| `uk-psychology-edinburgh` | admissionsTests | Partly verified: Edinburgh’s interviews, tests and portfolios page still refers to the UCAT “in 2025” (the previous cycle) |
| `uk-psychology-edinburgh` | otherRequirements | No interview: Edinburgh interviews only for medicine, nursing, teacher education and veterinary medicine |

</details>

<details><summary><strong>University of Exeter</strong> — 4 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-cs-exeter` | otherRequirements | No interview is listed in this course’s entry requirements (Exeter states that where an interview is used, the course entry requirements say so) |
| `uk-economics-exeter` | otherRequirements | No interview is listed in this course’s entry requirements (Exeter states that where an interview is used, the course entry requirements say so) |
| `uk-law-exeter` | otherRequirements | No interview is listed in this course’s entry requirements (Exeter states that where an interview is used, the course entry requirements say so) |
| `uk-psychology-exeter` | otherRequirements | No interview is listed in this course’s entry requirements (Exeter states that where an interview is used, the course entry requirements say so) |

</details>

<details><summary><strong>University of Glasgow</strong> — 5 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-cs-glasgow` | admissionsTests | Any Additional Requirements (interviews, auditions, tests, pre-entry programmes) are also stated |
| `uk-cs-glasgow` | otherRequirements | No interview for first-year entry: Glasgow interviews for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery |
| `uk-economics-glasgow` | admissionsTests | Any Additional Requirements (interviews, auditions, tests, pre-entry programmes) are also stated |
| `uk-economics-glasgow` | otherRequirements | No interview for first-year entry: Glasgow interviews for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery |
| `uk-engineering-glasgow` | admissionsTests | Any Additional Requirements (interviews, auditions, tests, pre-entry programmes) are also stated |
| `uk-engineering-glasgow` | otherRequirements | No interview for first-year entry: Glasgow interviews for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery |
| `uk-law-glasgow` | admissionsTests | The selection processes for both Dentistry and Medicine involves the UCAT (University Clinical Aptitude Test) as well as interview |
| `uk-law-glasgow` | otherRequirements | No interview for first-year entry: Glasgow interviews for Community Development, Dentistry, Medicine, Nursing, Teaching and Veterinary Medicine & Surgery |
| `uk-medicine-glasgow` | admissionsTests | UCAT — required (scores are used to allocate interviews) |
| `uk-medicine-glasgow` | otherRequirements | Interview: required (approximately 1,100 applicants are interviewed |

</details>

<details><summary><strong>University of Illinois Urbana-Champaign</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-uiuc` | admissionsTests | auditions/portfolios/interviews apply only to Fine and Applied Arts talent-based programs |
| `us-cs-uiuc` | otherRequirements | An audition, portfolio, or interview may be required for Fine and Applied Arts applicants |
| `us-engineering-uiuc` | admissionsTests | auditions/portfolios/interviews apply only to Fine and Applied Arts talent-based programs |
| `us-engineering-uiuc` | otherRequirements | An audition, portfolio, or interview may be required for Fine and Applied Arts applicants |

</details>

<details><summary><strong>University of Leeds</strong> — 3 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-cs-leeds` | otherRequirements | No interview or portfolio is described on the 2027 course page |
| `uk-law-leeds` | otherRequirements | No interview or admissions test is described on the 2027 course page |
| `uk-medicine-leeds` | otherRequirements | Points-based shortlisting for interview: top eight GCSEs, top three predicted grades, overall UCAT score and contextual information |

</details>

<details><summary><strong>University of Manchester</strong> — 7 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-accounting-manchester` | otherRequirements | Applicants are not interviewed as a rule |
| `uk-cs-manchester` | otherRequirements | No interview is described |
| `uk-economics-manchester` | admissionsTests | Interview requirements We do not interview |
| `uk-economics-manchester` | otherRequirements | No interviews |
| `uk-engineering-manchester` | otherRequirements | No interviews |
| `uk-maths-manchester` | otherRequirements | No interviews |
| `uk-medicine-manchester` | otherRequirements | Interview required — no offers without interview |
| `uk-psychology-manchester` | admissionsTests | Candidates may be interviewed online or by telephone, or asked to complete an alternative admissions statement |
| `uk-psychology-manchester` | otherRequirements | Candidates may be interviewed online or by telephone, or asked to complete an alternative admissions statement |

</details>

<details><summary><strong>University of Notre Dame</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-business-notredame` | otherRequirements | No interviews |
| `us-cs-notredame` | otherRequirements | No interviews |

</details>

<details><summary><strong>University of Nottingham</strong> — 3 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-economics-nottingham` | otherRequirements | No interview or admissions test is described on the 2027 course page |
| `uk-medicine-nottingham` | otherRequirements | Interview required before any offer (in person for home applicants, online via Microsoft Teams for international applicants), scheduled 15 December 2026 – 29 January 2027 |
| `uk-pharmacy-nottingham` | admissionsTests | The next step is an interview |
| `uk-pharmacy-nottingham` | otherRequirements | Shortlisting on the UCAS application and grades, then a multiple mini-interview (MMI) |

</details>

<details><summary><strong>University of Oxford</strong> — 10 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-biochemistry-oxford` | otherRequirements | Shortlisted applicants interviewed online by two different colleges |
| `uk-cs-oxford` | otherRequirements | Interviews for shortlisted applicants in December, by video call — usually two at the first-choice college and at least one at another college |
| `uk-economics-oxford` | otherRequirements | Interview for shortlisted applicants — not a test of economics or management unless studied before |
| `uk-engineering-oxford` | otherRequirements | Interview with engineering tutors for shortlisted candidates (two interviews, at two colleges) |
| `uk-history-oxford` | otherRequirements | Shortlisted candidates are invited to at least one online interview, expected in December |
| `uk-law-oxford` | otherRequirements | Interviews (online) for shortlisted applicants |
| `uk-maths-oxford` | otherRequirements | Interviews in December, online by video call — usually one or two at the first-choice college and at least one at another college |
| `uk-medicine-oxford` | otherRequirements | Shortlisted candidates (around 425 a year) are invited to at least one online interview, expected in December |
| `uk-physics-oxford` | otherRequirements | Shortlisted candidates interviewed in December |
| `uk-ppe-oxford` | admissionsTests | TARA (Test of Academic Reasoning for Admissions) — pre-interview test, used with exam results and interview |
| `uk-ppe-oxford` | otherRequirements | Shortlisted candidates are invited to at least one online interview, expected in December |

</details>

<details><summary><strong>University of Pennsylvania</strong> — 3 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-business-wharton` | otherRequirements | Interviews could not be checked: https://www |
| `us-cs-penn` | otherRequirements | Interviews could not be checked: https://www |
| `us-economics-penn` | otherRequirements | Interviews could not be checked: https://www |

</details>

<details><summary><strong>University of Southern California</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-business-usc` | otherRequirements | No admission interviews by the Office of Undergraduate Admission |
| `us-cs-usc` | otherRequirements | No admission interviews by the Office of Undergraduate Admission |

</details>

<details><summary><strong>University of St Andrews</strong> — 4 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-cs-standrews` | admissionsTests | For some specific degree programmes, you may also need to: come to an interview, for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes sit an admissions test, the UCAT, for Medicine |
| `uk-cs-standrews` | otherRequirements | No interview: St Andrews interviews for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes only |
| `uk-economics-standrews` | admissionsTests | For some specific degree programmes, you may also need to: come to an interview, for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes sit an admissions test, the UCAT, for Medicine |
| `uk-economics-standrews` | otherRequirements | No interview: St Andrews interviews for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes only |
| `uk-maths-standrews` | admissionsTests | For some specific degree programmes, you may also need to: come to an interview, for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes sit an admissions test, the UCAT, for Medicine |
| `uk-maths-standrews` | otherRequirements | No interview: St Andrews interviews for Medicine, Gateway and Pathway programmes, part-time study and International Foundation Programmes only |
| `uk-medicine-standrews` | admissionsTests | applicants meeting the academic and other requirements are ranked by UCAT global score for interview |
| `uk-medicine-standrews` | otherRequirements | Interview: multiple mini-interviews |

</details>

<details><summary><strong>University of Warwick</strong> — 6 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `uk-accounting-warwick` | admissionsTests | Warwick does not typically interview applicants |
| `uk-accounting-warwick` | otherRequirements | No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference) |
| `uk-cs-warwick` | otherRequirements | No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference) |
| `uk-economics-warwick` | otherRequirements | No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference) |
| `uk-engineering-warwick` | admissionsTests | Warwick does not typically interview applicants |
| `uk-engineering-warwick` | otherRequirements | No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference) |
| `uk-law-warwick` | otherRequirements | No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference) |
| `uk-maths-warwick` | otherRequirements | No interview typically — offers are based on the UCAS application (predicted and achieved grades, personal statement, school reference) |

</details>

<details><summary><strong>Vanderbilt University</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-cs-vanderbilt` | otherRequirements | No admissions interviews |
| `us-economics-vanderbilt` | otherRequirements | No admissions interviews |

</details>

<details><summary><strong>Washington University in St. Louis</strong> — 2 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-business-washu` | otherRequirements | No evaluative interviews |
| `us-cs-washu` | otherRequirements | No evaluative interviews |

</details>

<details><summary><strong>Yale University</strong> — 4 course(s)</summary>

| Course | Row | Snippet |
|---|---|---|
| `us-biology-yale` | otherRequirements | Interviews: by invitation only |
| `us-cs-yale` | otherRequirements | Interviews: by invitation only |
| `us-economics-yale` | otherRequirements | Interviews: by invitation only |
| `us-law-yale` | otherRequirements | Interviews: by invitation only |

</details>

## 1. Summary

"Official sample questions" counts only questions a university publishes itself, quoted exactly. 0 means none were found on the pages read (see section 3).

| University | Subject | Interviewed | Format | Official sample questions |
|---|---|---|---|---|
| University of Oxford | Computer Science | yes | Online (video call), ~30 min, usually two interviewers; two at first-choice college + at least one at another | 13 |
| University of Oxford | Mathematics | yes | Online (video call), ~25 min each; one or two at first-choice college + at least one other | 0 |
| University of Oxford | Engineering Science | yes | Two colleges, same day (undated PDF — unconfirmed) | 1 |
| University of Oxford | Physics | yes | Two at one college + one at another (2021 pack — stale) | 0 |
| University of Oxford | Biochemistry | yes | Online (Microsoft Teams, possibly Miro), two colleges | 0 |
| University of Oxford | Philosophy, Politics and Economics | yes (shortlisted applicants) | Online (page states 2025 entry) | 0 |
| University of Oxford | History | yes | Online; possible second interview at another college | 0 |
| University of Oxford | Law (Jurisprudence) | yes (shortlisted applicants) | At least two interviews; FAQ wording may be stale | 0 |
| University of Oxford | Economics and Management | not published (pages blocked or not found) | — (not read: see manual review) | 0 |
| University of Oxford | Medicine | not published (pages blocked) | — (not read: see manual review) | 0 |
| University of Cambridge | All courses (central guidance) | yes | Online or in person by College; usually 1–2 interviews, 35 min–1 h in total | 0 |
| University of Cambridge | Computer Science | yes | Varies by College, e.g. two 25-min or one 30–40-min interview | 0 |
| University of Cambridge | Mathematics | yes | Problem-solving, ~20–40 min | 0 |
| University of Cambridge | Natural Sciences | yes | — | 0 |
| University of Cambridge | Medicine | yes | — | 0 |
| University of Cambridge | Engineering | yes (central guidance) | — (not read: see manual review) | 0 |
| University of Cambridge | Economics | yes (central guidance) | — | 0 |
| University of Cambridge | Law | yes (central guidance) | — | 0 |
| Imperial College London | Medicine | not published (site blocked) | — (not read: see manual review) | 0 |
| Imperial College London | Computing | not published (site blocked) | — (not read: see manual review) | 0 |
| Imperial College London | Electrical & Electronic Engineering | not published (site blocked) | — (not read: see manual review) | 0 |
| Imperial College London | Mechanical Engineering | not published (site blocked) | — (not read: see manual review) | 0 |
| Imperial College London | Chemical Engineering | not published (site blocked) | — (not read: see manual review) | 0 |
| Imperial College London | Physics | not published (site blocked) | — (not read: see manual review) | 0 |
| Imperial College London | Mathematics | not published (site blocked) | — (not read: see manual review) | 0 |
| Imperial College London | Biomedical Engineering | not published (site blocked) | — (not read: see manual review) | 0 |
| King's College London | Medicine | yes | Remote; details via King’s Apply | 0 |
| King's College London | Nursing | yes | Remote | 0 |
| University College London | Medicine | not published (site blocked) | — (not read: see manual review) | 0 |
| University College London | Architecture | not published (site blocked) | — (not read: see manual review) | 0 |
| University College London | Pharmacy | not published (site blocked) | — (not read: see manual review) | 0 |
| University College London | Law (European Legal Systems) | not published (site blocked) | — (not read: see manual review) | 0 |
| University of Birmingham | Medicine | yes (MMI) | MMI, 7 stations (2 min prep + 6 min), ~60 min; in person (home) / online (international) | 0 |
| University of Bristol | Medicine | yes (structured, multi-station) | Zoom, ~30 min, 6 stations | 0 |
| University of Edinburgh | Medicine | yes (MMI) | MMI | 0 |
| University of Glasgow | Medicine | yes (two-panel interview) | Online, 30 min, Panel A + Panel B (ethical scenario) | 0 |
| University of Leeds | Medicine | yes (MMI) | MMI; face to face 4–6 Jan 2027, overseas online | 0 |
| University of Manchester | Medicine | yes (MMI) | MMI, 5 stations × 8 min (online or on campus) | 1 |
| University of Nottingham | Medicine | yes | In person (home) / Microsoft Teams (international) | 0 |
| University of St Andrews | Medicine | yes (MMI) | MMI, usually 4 stations × ~6 min, incl. role-play with an actor | 0 |
| University of Bath | Pharmacy | yes | Selection interview (remote outside the UK); organic chemistry + calculation examined | 0 |
| University of Nottingham | Pharmacy | yes (MMI) | MMI, ~5 min per interview | 0 |
| University of Manchester | Psychology | sometimes | Sometimes: online or telephone | 0 |
| National University of Singapore | Law | yes (shortlisted applicants) | Written test + formal interview, April–May, Singapore | 0 |
| IE University | All six courses | yes (most candidates) | Online interview | 0 |
| Yale University | All courses (admission to the university, not to a course) | by invitation (evaluative) | Alumni / senior students, by invitation, evaluative | 0 |
| Stanford University | All courses (admission to the university, not to a course) | optional | Optional alumni conversation | 0 |
| Duke University | All courses (admission to the university, not to a course) | optional | Optional alumni interview, virtual or phone | 0 |
| MIT | All courses (admission to the university, not to a course) | offered where available | Educational Counselor, in person where possible | 0 |
| Harvard University | All courses (admission to the university, not to a course) | at the Admissions Committee's discretion | Alumni interview, assigned at discretion | 0 |
| Dartmouth College | All courses (admission to the university, not to a course) | offered where available | Alumni / student, virtual or in person, where available | 0 |
| Princeton University | All courses (admission to the university, not to a course) | optional | Optional alumni interview | 0 |
| Rice University | All courses (admission to the university, not to a course) | optional (recommended) | Optional, virtual (2026–27) | 0 |
| Georgetown University | All courses (admission to the university, not to a course) | yes (alumni interview, when assigned) | Alumni interview | 0 |

**Official sample questions by university:** University of Oxford 14; University of Manchester 1; every other university 0. **Total: 15.**

## 2. Detail by university

### University of Oxford

#### Computer Science

Courses: `uk-cs-oxford` · Interviewed: **yes**

**Format**

> Interviews happen in December via video call. Then format of the interview can vary from college to college but candidates will generally have two interviews in their first choice college and at least one interview in another college. If you are applying for a joint degree, you might have single-subject interviews for each part of the degree, or there may be an interview with tutors from both disciplines
>
> — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html), accessed 2026-11-14

**Number and length**

> The interview will be like a short tutorial, with you actively discussion a problem and your thought process out loud. Each interview lasts around 30 minutes, usually with two interviewers.
>
> — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html), accessed 2026-11-14

**Official sample questions (13)**

1. _Computer Science_

   > Tidy boxes. You are given 10 boxes, each large enough to contain exactly 10 wooden building blocks, and a total of 100 blocks in 10 different colours. There may not be the same number in each colour, so you may not be able to pack the blocks into the boxes in such a way that each box contains only one colour of block. Show that it is possible to do it so that each box contains at most two different colours. A sample interview dialogue for this question is available.
   >
   > — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html), accessed 2026-11-14
   > _Note: Listed under "Here are some problems that have been used in interviews in the past."_

2. _Computer Science_

   > Searching for the maximum. The real-valued function f(x), defined for 0 ≤ x ≤ 1, has a single maximum at x = m. If 0 ≤ u < v ≤ m then f(u) < f(v), and if m ≤ u < v ≤ 1 then f(u) > f(v). You are told nothing else about f, but you may ask for the value of f(x) for any values of x you choose. How would you find the approximate value of m? How accurately could you find m if you could choose only 10 values of x for which to evaluate f(x)?
   >
   > — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html), accessed 2026-11-14
   > _Note: Listed under "Here are some problems that have been used in interviews in the past."_

3. _Computer Science_

   > Death by chocolate. You are locked in a room with your worst enemy. On a table in the centre of the room is a bar of chocolate, divided into squares in the usual way. One square of the chocolate is painted with a bright green paint that contains a deadly poison. You and your enemy take it in turns to break off one or more squares from the remaining chocolate (along a straight line) and eat them. Whoever is left with the green square must eat it and die in agony. You may look at the bar of chocolate and then decide whether to go first or second. Describe your strategy.
   >
   > — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html), accessed 2026-11-14
   > _Note: Listed under "Here are some problems that have been used in interviews in the past."_

4. _Computer Science_

   > Monkey beans. An urn contains 23 white beans and 34 black beans. A monkey takes out two beans; if they are the same, he puts a black bean into the urn, and if they are different, he puts in a white bean from a large heap he has next to him. The monkey repeats this procedure until there is only one bean left. What colour is it?
   >
   > — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html), accessed 2026-11-14
   > _Note: Listed under "Here are some problems that have been used in interviews in the past."_

5. _Computer Science_

   > Lily-pad lunacy. Eleven lily pads are numbered from 0 to 10. A frog starts on pad 0 and wants to get to pad 10. At each jump, the frog can move forward by one or two pads, so there are many ways it can get to pad 10. For example, it can make 10 jumps of one pad, 1111111111, or five jumps of two pads, 22222, or go 221212 or 221122, and so on. We'll call each of these ways different, even if the frog takes the same jumps in a different order. How many different ways are there of getting from 0 to 10?
   >
   > — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html), accessed 2026-11-14
   > _Note: Listed under "Here are some problems that have been used in interviews in the past."_

6. _Computer Science_

   > Missing numbers. Imagine you are given a list of slightly less than 1,000,000 numbers, all different, and each between 0 and 999,999 inclusive. How could you find (in a reasonable time) a number between 0 and 999,999 that is not on the list?
   >
   > — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html), accessed 2026-11-14
   > _Note: Listed under "Here are some problems that have been used in interviews in the past."_

7. _Computer Science_

   > Scribble. The game of Scribble is played with an inexhaustible supply of tiles, and consists of forming 'words' according to certain rules. Since each tile bears one of the letters P, Q, or R, these are not words that will be found in an ordinary dictionary. The game begins with the word PQ on the board; each move consists of applying one of the following rules: / If the word on the board is Px, for some shorter word x, you may change it to Pxx. For example, if the word is PQRRQ then you may change it to PQRRQQRRQ. / If the word on the board is xQQQy, for some shorter words x and y, then you may change it to xRy, replacing the sequence QQQ with a single R. / If the word on the board is xRRy, for some shorter words x and y, then you may change it to xy, deleting the sequence RR entirely. / (i) For each of the following words, say whether you can make it or not by following the rules of the game: QPR, PQQ, PQR, PR. (ii) Given any word, how can you decide whether it can be made or not?
   >
   > — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/sample_interview_problem.html), accessed 2026-11-14
   > _Note: Listed under "Here are some problems that have been used in interviews in the past."_

8. _Computer Science_

   > For a non-negative real number \(x\), the floor of \(x\), denoted by \( \lfloor x \rfloor\) is the largest integer that is less than or equal to \(x\). For example, \(\lfloor 3 \rfloor = 3 \) and \( \lfloor 6.999 \rfloor = 6 \). / Let \(n\) be a positive natural number that is a perfect square. You are asked to pick a set of \( \lfloor \frac{n}{2} \rfloor \) natural numbers from \( 1,2, \ldots,n - 1 \), such that none of the chosen numbers is a perfect square, and no two distinct chosen elements add up to \(n \). For what values of \(n\) is this possible? Let \(n\) be a positive natural number that is a perfect cube. You are asked to pick a set of \( \lfloor \frac{n}{2} \rfloor \) natural numbers from \( 1,2, \ldots,n -1 \), such that none of the chosen numbers is a perfect cube, and no two distinct chosen elements add up to \(n\). For what values of \(n\) is this possible?
   >
   > — [https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/06/29/interview-question1.html](https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/06/29/interview-question1.html), accessed 2026-11-14
   > _Maths is quoted as published: LaTeX source rendered by MathJax on the page._
   > _Note: Published by an Oxford Computer Science tutor on the department domain; the department admissions page links it as "some interview questions from one of our tutors". Provenance as stated on the post: "This question was used in CS interviews at Lady Margaret Hall in December 2018."_

9. _Computer Science_

   > Find the smallest natural number ending in \(6\), such that if the last \(6\) is removed and placed in the front, the new number is \(4\) times the original number. Can you give a procedure to find the smallest number ending in digit \(d\), where \(d\) is between \(1\) and \(9\), such that if the last digit, \(d\), is removed and placed in front, you get a number that is \(k\) times as large? Is this possible for every value of \(d\) and \(k\)?
   >
   > — [https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/06/29/interview-question2.html](https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/06/29/interview-question2.html), accessed 2026-11-14
   > _Maths is quoted as published: LaTeX source rendered by MathJax on the page._
   > _Note: Published by an Oxford Computer Science tutor on the department domain; the department admissions page links it as "some interview questions from one of our tutors". Provenance as stated on the post: "This question was used in CS interviews at Lady Margaret Hall in December 2019."_

10. _Computer Science (Maths & CS joint)_

   > This question is about the function \(Z\) defined by \( \displaystyle Z(s) = \sum_{k = 1}^\infty \frac{1}{k^s}, \) for \( s > 1 \). / Can you find a lower bound on this function which is valid for all \( s > 1 \)? Why have we excluded \( s = 1\) from the domain? / From now on, we will concentrate on \( Z(2) \). / Can you find an upper bound on \(Z(2) \)? / In fact, \( \displaystyle Z(2) = \frac{\pi^2}{6} \), i.e., \( \displaystyle \sum_{k=1}^n \frac{1}{k^2} \rightarrow \frac{\pi^2}{6} \) as \( n \rightarrow \infty \). / One proof of this fact relies on the inequalities / \( \sin \theta < \theta < \tan \theta,~~~~\)for \(\theta \in (0, \pi/2)\). / Can you show why this is true geometrically? / Can you use this to get upper and lower bounds on \(1/\theta^2\) in terms only of \(\tan \theta\)? / Now let \( \theta_k = \frac{k \pi}{2 n + 1} \) for \(1 \leq k \leq n \). Find upper and lower bounds on \[ \sum_{k=1}^n \frac{1}{k^2}. \] / It turns out that the numbers \[ r_k = \frac{1}{\tan^2 \left( \frac{\pi k}{2n + 1 } \right) }, ~~ 1 \leq k \leq n, \] are roots of the polynomial \[ p_n(x) = { 2n + 1 \choose 1} x^n - {2n + 1 \choose 3} x^{n-1} + \cdots + (-1)^n {2n + 1 \choose 2n + 1}. \] Can you use this to show that / \( \displaystyle \sum_{k=1}^n \frac{1}{k^2} \rightarrow \frac{\pi^2}{6} \) as \( n \rightarrow \infty \)?
   >
   > — [https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/09/16/interview-question3.html](https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/09/16/interview-question3.html), accessed 2026-11-14
   > _Maths is quoted as published: LaTeX source rendered by MathJax on the page._
   > _Note: Published by an Oxford Computer Science tutor on the department domain; the department admissions page links it as "some interview questions from one of our tutors". Provenance as stated on the post: "This question was used in Maths & CS interviews at Lady Margaret Hall in December 2020. The question is due to Christina Goldschmidt."_

11. _Computer Science_

   > Consider the following ten-digit number: / \( 7~1~0~6~4~1~9~9~0~2\). / You should remove three of the digits so as to get the largest possible seven digit number. As a first step, you may want to try to delete two digits from the following five digit number to get the largest possible three digit number: / \(7~1~9~3~4\). / Now consider the more general question when you are given an \(n\) digit number and asked to delete \(k < n\) out of the \(n\) digits, so as to leave the largest possible \(n - k\) digit number. Explain your general strategy. Evaluate the number of steps requried to perform your strategy and try to minimise this number as much as you can.
   >
   > — [https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/09/16/interview-question4.html](https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2022/09/16/interview-question4.html), accessed 2026-11-14
   > _Maths is quoted as published: LaTeX source rendered by MathJax on the page._
   > _Note: Published by an Oxford Computer Science tutor on the department domain; the department admissions page links it as "some interview questions from one of our tutors". Provenance as stated on the post: "This question was used in CS interviews at Lady Margaret Hall in December 2018."_

12. _Computer Science (Maths & CS joint)_

   > An increasing tree is a rooted labelled tree whose labels increase along paths away from the root. For simplicity, if the tree has \(n\) vertices we will take the root to be labelled \(1\) and the other vertices to be labelled by \(2, \ldots, n\). An example is shown below. / Note that when a node has more than one child, the order in which the children are represented is irrelevant, so that, for example, the following two trees are equivalent. / Can you draw all the increasing trees with \(4\) vertices? / How many increasing trees on \(n\) vertices are there? / Suppose now that \(n\) is even. How many of these can be split by removing a single edge into a tree labelled only by odd numbers and a tree labelled only by even numbers? / Suppose now that we want to generate an increasing tree on \(n\) vertices picked uniformly at random, i.e. pick each of the possible trees with equal probability. Can you give an algorithm to do this? / When a random tree is picked as in the previous part, what is the average number of neighbours of the root?
   >
   > — [https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2023/06/28/interview-question5.html](https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2023/06/28/interview-question5.html), accessed 2026-11-14
   > _Maths is quoted as published: LaTeX source rendered by MathJax on the page._
   > _Note: Published by an Oxford Computer Science tutor on the department domain; the department admissions page links it as "some interview questions from one of our tutors". Provenance as stated on the post: "This question was used in Maths & CS interviews at Lady Margaret Hall in December 2021. The question is due to Christina Goldschmidt."_

13. _Computer Science_

   > Suppose \(a_1, \ldots, a_8\) are positive real numbers that add up to \( 27 \). Can you find the minimum of the following expression? / \[ \sqrt{1^2 + a_1^2} + \sqrt{2^2 + a_2^2} + \cdots + \sqrt{8^2 + a_8^2} \] / Can the values of \(a_i\) that minimise this expression be rational?
   >
   > — [https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2023/06/28/interview-question6.html](https://www.cs.ox.ac.uk/people/varun.kanade/website/post/2023/06/28/interview-question6.html), accessed 2026-11-14
   > _Maths is quoted as published: LaTeX source rendered by MathJax on the page._
   > _Note: Published by an Oxford Computer Science tutor on the department domain; the department admissions page links it as "some interview questions from one of our tutors". Provenance as stated on the post: "This question was used in CS interviews at Lady Margaret Hall in December 2021. The question is due to Tom Orton."_

**Official preparation advice**

> Our tutors are not mind readers, so if you don’t say anything our tutors can’t tell what you are thinking! The best practice you can do is getting used to talking about problems out loud. You may also want to try explaining concepts from your Maths qualification or the solutions to past MAT questions to friends and family. This not only gets you used to explaining your thoughts out loud, but also helps to consolidate your knowledge of the subject.
>
> — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html), accessed 2026-11-14

> We very much don't want applicants to feel they need special training for our admissions. The main thing is that you do mathematics, lots of it, and that you find it interesting. We advise you to do lots of problems, on and near your syllabus, so that you really understand the mathematics you are learning.
>
> — [https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html](https://www.cs.ox.ac.uk/admissions/undergraduate/how_to_apply/interviews.html), accessed 2026-11-14

- The department also links a sample interview dialogue for "Tidy boxes" (a worked transcript of a tutor guiding a candidate), not counted as a separate question.

#### Mathematics

Courses: `uk-maths-oxford` · Interviewed: **yes**

**Format**

> Interviews occur in December. The precise format of the interviews varies from college to college, but candidates will generally have one or two interviews in their first choice college, and at least one other interview at another college. Interviews are online via video call for all candidates.
>
> — [https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews](https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews), accessed 2026-11-14

**Number and length**

> Each interview lasts for about 25 minutes, and is largely mathematical in nature. We may ask you to tell us about an area of mathematics you have studied; we may look in detail at a point of technique, or curve sketching; we may ask you to solve a problem and talk us through your thought processes; we may give you a mathematical definition and ask you to work out some of its consequences. We are trying to see how you think when you do Mathematics.
>
> — [https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews](https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews), accessed 2026-11-14

**Official preparation advice**

> Although we are good mathematicians, we are not mind-readers - if you don't say anything, we can't tell what you're thinking! To this end, it may be helpful for you to arrange a practice interview with a teacher - perhaps they can ask you to work out a past MAT question in front of them. Alternatively, try explaining concepts from your Maths A-level to your less mathematically-minded friends and family. This not only gets you used to explaining your thoughts out loud, but also helps to consolidate your knowledge of the subject.
>
> — [https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews](https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews), accessed 2026-11-14

> We very much don't want applicants to feel they need special training for our admissions. The main thing is that you do mathematics, lots of it, and that you find it interesting. We advise you to do lots of problems, on and near your syllabus, so that you really understand the mathematics you are learning. This doesn't mean you shouldn't also read any of the excellent and interesting books about famous mathematical subjects such as Fermat's Last Theorem, but although these books are fascinating and inspirational, the maths they cover is pretty difficult. After all, even in Oxford only a handful of people properly understand Andrew Wiles's proof!
>
> — [https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews](https://www.maths.ox.ac.uk/study-here/undergraduate-study/interviews), accessed 2026-11-14

- The Mathematical Institute page publishes no sample interview questions. Two of the Computer Science tutor questions (Oxford CS record) were used in joint Maths & CS interviews.

#### Engineering Science

Courses: `uk-engineering-oxford` · Interviewed: **yes**

**Format**

> Candidates invited for interview will be seen at two colleges on the same day, usually one interview will take place in the morning and the other in the afternoon.
>
> — [https://eng.ox.ac.uk/media/4095/typical_engineering_interview_questions-accessible.pdf](https://eng.ox.ac.uk/media/4095/typical_engineering_interview_questions-accessible.pdf), accessed 2026-11-14
> _PDF text; line breaks in the PDF are shown as single spaces._
> _Note: Undated PDF. It describes in-person interviews at two colleges on one day; Altiora's data (and Oxford's other department pages read here) describe online interviews. Treat the format as unconfirmed for 2027 entry._

**What is assessed**

> Candidates invited for interview should expect an academic or technical interview. They should be able to demonstrate: • • • • Fluency in expressing core knowledge and ideas in physics and mathematics Ability to apply existing knowledge methodically to new situations Ability to assimilate and apply new concepts Rapidity in thinking and reasoning and to be able to discuss their: • • Commitment to intense and sustained learning Interest in and enthusiasm for the engineered world
>
> — [https://eng.ox.ac.uk/media/4095/typical_engineering_interview_questions-accessible.pdf](https://eng.ox.ac.uk/media/4095/typical_engineering_interview_questions-accessible.pdf), accessed 2026-11-14
> _PDF text; line breaks in the PDF are shown as single spaces._

**Official sample questions (1)**

1. _Engineering_

   > The candidate is asked to consider the engineering design of a vertical faced gravity dam wall, such as the one shown on the left.
   >
   > — [https://eng.ox.ac.uk/media/4095/typical_engineering_interview_questions-accessible.pdf](https://eng.ox.ac.uk/media/4095/typical_engineering_interview_questions-accessible.pdf), accessed 2026-11-14
   > _PDF text; line breaks in the PDF are shown as single spaces._
   > _Note: Published as the "Typical Engineering Interview Question". The PDF follows it with a description of how the discussion may develop (forces on the wall, stability, sliding or overturning)._

- Undated PDF; check the current department page before use (manual-review list).

#### Physics

Courses: `uk-physics-oxford` · Interviewed: **yes**

**Format**

> Shortlisted candidates are invited to interviews in around mid-December (the dates will vary from year to year, so make sure to check the website). They will often have two interviews with one college and a third interview with another college. In 2021, all interviews will be held online.
>
> — [https://www.physics.ox.ac.uk/system/files/file_attachments/mock%20interview%20pack%20211122_0.pdf](https://www.physics.ox.ac.uk/system/files/file_attachments/mock%20interview%20pack%20211122_0.pdf), accessed 2026-11-14
> _PDF text; line breaks in the PDF are shown as single spaces._
> _Note: From the 2021 "Mock Interview Pack for Teachers" (last changed 22/11/2021). Stale for 2027 entry._

- The department's Mock Interview Pack is headed "STUDENTS: THIS IS NOT FOR YOU" and is written for teachers running a mock interview. Its three questions are NOT copied into this file: the department explicitly asks students not to read them, so they are unsuitable for a student practice feature. The pack also predates the 2026 change of admissions test.
- No current department interview page was found (https://www.physics.ox.ac.uk/study/undergraduates/applications/interviews returned 404).

#### Biochemistry

Courses: `uk-biochemistry-oxford` · Interviewed: **yes**

**Format**

> All shortlised applicants will be interviewed online by two different Colleges. This interview will take place using Microsoft Teams and potentially make use of the whiteboard software Miro. Interviews are used to discover your potential, taking into account your background and the stage you have reached, rather than to grill you on what you have covered so far at school. The interviewers will be looking at your interest in and enthusiasm for biochemistry, your ability to discuss and analyse relevant topics (often involving ideas or information that may be new to you), and your general reasoning and problem-solving skills.
>
> — [https://www.bioch.ox.ac.uk/undergraduate-admissions](https://www.bioch.ox.ac.uk/undergraduate-admissions), accessed 2026-11-14

**What is assessed**

> Items specifically assessed at interview are: / your Interest in/enthusiasm for biochemistry; / your ability to describe/discuss a topic of mutual interest; / your ability to describe/analyse, and extrapolate from, novel information; / your reasoning and problem solving ability.
>
> — [https://www.bioch.ox.ac.uk/undergraduate-admissions](https://www.bioch.ox.ac.uk/undergraduate-admissions), accessed 2026-11-14

- No sample questions published on this page.

#### Philosophy, Politics and Economics

Courses: `uk-ppe-oxford` · Interviewed: **yes (shortlisted applicants)**

**Format**

> Interviews for all applicants in 2024 for 2025-entry will be held online.
>
> — [https://www.ppe.ox.ac.uk/interviews](https://www.ppe.ox.ac.uk/interviews), accessed 2026-11-14
> _Note: Page states the 2025-entry arrangement; may be stale._

**What is assessed**

> The interview is not primarily a test of existing knowledge. It is aimed primarily at assessing the candidate's potential for future development. Interviewers will be looking for evidence of the candidate's potential for development in the following four areas: / Understanding: this can be shown in (for example) a candidate's ability to listen carefully, to analyse problems, to identify the premises and conclusions of arguments, and to express in their own words someone else's ideas. / Intellectual flexibility: this can be demonstrated by (for example) a candidate's willingness to consider alternative views, and readiness to respond to problems and criticisms. / Critical thinking and problem-solving: this can be shown in (for example) a candidate's ability to adopt logical and critical approaches to problems, to critically assess arguments, to identify good and bad reasons for believing a particular claim, to assess relevance, and to think independently. / Communication: this can be shown in (for example) a candidate's ability to express ideas clearly, to give considered responses to questions, and to address the point under discussion instead of veering off topic.
>
> — [https://www.ppe.ox.ac.uk/interviews](https://www.ppe.ox.ac.uk/interviews), accessed 2026-11-14

- The page sends readers to the University website for "how to prepare, and sample questions"; that page (ox.ac.uk) refused automated access (manual-review list). No sample questions on the PPE site itself.

#### History

Courses: `uk-history-oxford` · Interviewed: **yes**

**Format**

> Following a university-wide vote, all interviews will be on-line.
>
> — [https://www.history.ox.ac.uk/making-application](https://www.history.ox.ac.uk/making-application), accessed 2026-11-14

**Number and length**

> Some candidates will be called for a second interview, which will be at a different college to your first interview. The college will contact you as soon as possible, but you may only get a few days' notice.
>
> — [https://www.history.ox.ac.uk/making-application](https://www.history.ox.ac.uk/making-application), accessed 2026-11-14

**Official preparation advice**

> Interviews are not intended to be confrontational although they will undoubtedly be intellectually challenging. The tutors are interested in finding out what your intellectual potential is; they do not wish to catch you out. But remember to think carefully about the questions you have been asked; your interviewers will not mind if you pause to think. Try not to go in with some prepared speech you are determined to deliver at all costs.
>
> — [https://www.history.ox.ac.uk/making-application](https://www.history.ox.ac.uk/making-application), accessed 2026-11-14

- The page gives "First interviews for History and the Joint Schools will be during the week of December 9th" with no year; 9 December was a Monday in 2024, so the date detail may be from an earlier cycle.
- No sample questions published on this page.

#### Law (Jurisprudence)

Courses: `uk-law-oxford` · Interviewed: **yes (shortlisted applicants)**

**Format**

> Interviews are a useful way for us to test your aptitude for the type of skills necessary on a law degree: for example, interviewers will be testing your reasoning and analytical ability. The purpose of the interview process is thus to give us extra information as to how you perform against our admissions criteria (see Question above). Interviews can take different forms: for example, an interview may include legally related questions as well as more general intellectual puzzles calling for logical analysis of a type similar to legal analysis.Whilst interviews may discuss legal issues, your pre-existing knowledge of the law is not being assessed. For example, you may be given a legal extract to discuss – if so, the only legal knowledge being sought is that which can be learnt from the extract.
>
> — [https://www.law.ox.ac.uk/admissions/undergraduate/undergraduate-admissions-faqs-ba-jurisprudence](https://www.law.ox.ac.uk/admissions/undergraduate/undergraduate-admissions-faqs-ba-jurisprudence), accessed 2026-11-14

**Number and length**

> If you come to a particular college for interview in Oxford, you are very likely to receive two interviews at that college. It may then be the case that, as part of our re-allocation process (see Question 4 above), you will also be interviewed by a second college: if so, that interview will take place on Friday of the same week.
>
> — [https://www.law.ox.ac.uk/admissions/undergraduate/undergraduate-admissions-faqs-ba-jurisprudence](https://www.law.ox.ac.uk/admissions/undergraduate/undergraduate-admissions-faqs-ba-jurisprudence), accessed 2026-11-14

- The FAQ still describes coming to a college in Oxford for interview; other Oxford pages describe online interviews. The format detail may be stale.
- It points to a mock law interview video (no published transcript was found, so no questions are taken from it).
- No sample questions published on this page.

#### Economics and Management

Courses: `uk-economics-oxford` · Interviewed: **not published (pages blocked or not found)**

- Department/course pages refused access (sbs.ox.ac.uk 403) or were not found (economics.ox.ac.uk 404).

#### Medicine

Courses: `uk-medicine-oxford` · Interviewed: **not published (pages blocked)**

- medsci.ox.ac.uk interview and application pages returned 403 (bot protection).

### University of Cambridge

#### All courses (central guidance)

Courses: `uk-medicine-cambridge`, `uk-cs-cambridge`, `uk-maths-cambridge`, `uk-naturalsciences-cambridge`, `uk-engineering-cambridge`, `uk-economics-cambridge`, `uk-law-cambridge` · Interviewed: **yes**

**Format**

> Interviews may be online or in person, depending on which College is assessing your application and the course you have applied for.
>
> — [https://www.undergraduate.study.cam.ac.uk/apply/after/cambridge-interviews](https://www.undergraduate.study.cam.ac.uk/apply/after/cambridge-interviews), accessed 2026-11-14

**Number and length**

> Most applicants will have 1 or 2 interviews lasting a total of 35 minutes to an hour.
>
> — [https://www.undergraduate.study.cam.ac.uk/apply/after/cambridge-interviews](https://www.undergraduate.study.cam.ac.uk/apply/after/cambridge-interviews), accessed 2026-11-14

**What is assessed**

> Interviews at Cambridge are academic conversations about the subject you’re interested in studying. They're a core part of our admissions process and help us to assess your potential for your chosen course.
>
> — [https://www.undergraduate.study.cam.ac.uk/apply/after/cambridge-interviews](https://www.undergraduate.study.cam.ac.uk/apply/after/cambridge-interviews), accessed 2026-11-14

**Official preparation advice**

> Read your personal statement again and any written work you submitted to your College as part of your application.
>
> — [https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation](https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation), accessed 2026-11-14

> Explore your subject beyond what you’ve learnt at school. You can do this by reading books, watching videos and listening to podcasts.
>
> — [https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation](https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation), accessed 2026-11-14

> Practise talking about your subject with your friends, family or teachers.
>
> — [https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation](https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation), accessed 2026-11-14

> Have a practice interview. Ideally ask a teacher or someone who doesn't know you well so that you can practise expressing your ideas and opinions. Alternatively, you could ask yourself questions for half an hour. This will help you to get used to talking about yourself, your work and thinking in a critical way.
>
> — [https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation](https://www.undergraduate.study.cam.ac.uk/apply/after/interview-preparation), accessed 2026-11-14

- No sample questions on the central interview or preparation pages.
- The central page warns: "Some companies offer interview preparation for a fee. These services are not endorsed by the University."

#### Computer Science

Courses: `uk-cs-cambridge` · Interviewed: **yes**

**Format**

> Your interview might involve some discussion of your personal statement, motivation and working through a problem. The topics and types of problems vary but almost always require mathematical knowledge and understanding to solve. The interviewers will not expect you to know things that are outside of your school curriculum and do not expect you to fully complete all of the problems presented during the interview.
>
> — [https://www.cst.cam.ac.uk/admissions/undergraduate/interviews](https://www.cst.cam.ac.uk/admissions/undergraduate/interviews), accessed 2026-11-14

**Number and length**

> The number and length of your interviews depends on the College that you apply to. For example, applicants to: / Gonville and Caius have two 25-minute Computer Science interviews / Peterhouse have one 25-minute Computer Science interview and one 25-minute Maths interview / Churchill have one 30-40 minute Computer Science interview
>
> — [https://www.cst.cam.ac.uk/admissions/undergraduate/interviews](https://www.cst.cam.ac.uk/admissions/undergraduate/interviews), accessed 2026-11-14

**Official preparation advice**

> Since solving Maths problems will likely form a large part of your interview, make sure to practise solving tricky problems. These problems might just involve Maths, however some might focus more on algorithms or other concepts in Computer Science, such as programming and logic. Below is a list of resources you can use to find practice problems:
>
> — [https://www.cst.cam.ac.uk/admissions/undergraduate/interviews](https://www.cst.cam.ac.uk/admissions/undergraduate/interviews), accessed 2026-11-14

- The department publishes no sample questions of its own; it points to Oxford Computer Science's sample problems (see that record). Its in-person and online demonstration interviews are videos without a published transcript.

#### Mathematics

Courses: `uk-maths-cambridge` · Interviewed: **yes**

**Format**

> In a mathematics interview you will be asked to solve some mathematical problems. That's all: maths, followed by some more maths. All we are interested in is your ability to tackle mathematical problems. There are no trick questions. The main purpose of the interview is to see how you think about a mathematical problem. An interview will typically last for about 20 to 40 minutes (you will be told in advance).
>
> — [https://www.maths.cam.ac.uk/undergrad/admissions/faq](https://www.maths.cam.ac.uk/undergrad/admissions/faq), accessed 2026-11-14

**What is assessed**

> In a typical interview there will be mostly questions about topics like numbers, sequences, integrals, graph sketching, etc, but also sometimes probability, and some basic mechanics. If you are applying for Maths with Physics you will always be asked at least one mechanics question.
>
> — [https://www.maths.cam.ac.uk/undergrad/admissions/faq](https://www.maths.cam.ac.uk/undergrad/admissions/faq), accessed 2026-11-14

**Official preparation advice**

> The best ways of preparing for interview are: • Practise lots of maths problems, including material from the STEP Support Programme foundation modules at https://maths.org/step/assignments, but also maths quizzes and fun problems from websites such as https://www.cut-the-knot.org. • Practise sketching functions. • Practise solving problems saying aloud to a friend or parent what you’re doing (so you’ll be used to saying aloud what you’re thinking during the interview). • When looking at mathematical statements and problems, practise asking yourself questions such as: “What if ...?” (for example what if, instead of all natural numbers in this problem we look at only even numbers?), or “Can this be extended ...?” (for example, something valid for a particular function, which happens to be an even function, can it be extended to all even functions? Yes/no - why?).
>
> — [https://www.maths.cam.ac.uk/undergrad/admissions/files/admissions/admissionsguide.pdf](https://www.maths.cam.ac.uk/undergrad/admissions/files/admissions/admissionsguide.pdf), accessed 2026-11-14
> _PDF text; line breaks in the PDF are shown as single spaces._
> _Note: From the Faculty's Guide to Admissions (PDF created June 2026)._

- No sample interview questions published. STEP and TMUA past papers are admissions-test material, not interview questions, and are not included.

#### Natural Sciences

Courses: `uk-naturalsciences-cambridge` · Interviewed: **yes**

**What is assessed**

> Your choice of application stream, and the courses that you are currently studying, will affect the types of questions that are asked at interview.
>
> — [https://www.undergraduate.study.cam.ac.uk/courses/natural-sciences](https://www.undergraduate.study.cam.ac.uk/courses/natural-sciences), accessed 2026-11-14

- No sample questions published.

#### Medicine

Courses: `uk-medicine-cambridge` · Interviewed: **yes**

**What is assessed**

> We assess applicants through a mixture of academic record, UCAT and interviews. There is no minimum threshold for UCAT score.
>
> — [https://www.undergraduate.study.cam.ac.uk/courses/medicine](https://www.undergraduate.study.cam.ac.uk/courses/medicine), accessed 2026-11-14

- The course page describes no MMI or stations; interviews follow the central Cambridge format. No sample questions published.

#### Engineering

Courses: `uk-engineering-cambridge` · Interviewed: **yes (central guidance)**

- The Engineering admissions FAQ (admissions.eng.cam.ac.uk) returned 403. No subject-specific interview information was readable.

#### Economics

Courses: `uk-economics-cambridge` · Interviewed: **yes (central guidance)**

- No faculty interview page was found (econ.cam.ac.uk admissions URL returned 404). No sample questions found.

#### Law

Courses: `uk-law-cambridge` · Interviewed: **yes (central guidance)**

- No faculty interview page was found (law.cam.ac.uk admissions URL returned 404). No sample questions found.

### Imperial College London

#### Medicine

Courses: `uk-medicine-imperial` · Interviewed: **not published (site blocked)**

- Every imperial.ac.uk URL tried returned 403 from CloudFront ("Request blocked"). Not researched; see manual-review list.

#### Computing

Courses: `uk-cs-imperial` · Interviewed: **not published (site blocked)**

- Every imperial.ac.uk URL tried returned 403 from CloudFront ("Request blocked"). Not researched; see manual-review list.

#### Electrical & Electronic Engineering

Courses: `uk-electrical-imperial` · Interviewed: **not published (site blocked)**

- Every imperial.ac.uk URL tried returned 403 from CloudFront ("Request blocked"). Not researched; see manual-review list.

#### Mechanical Engineering

Courses: `uk-mechanical-imperial` · Interviewed: **not published (site blocked)**

- Every imperial.ac.uk URL tried returned 403 from CloudFront ("Request blocked"). Not researched; see manual-review list.

#### Chemical Engineering

Courses: `uk-chemical-imperial` · Interviewed: **not published (site blocked)**

- Every imperial.ac.uk URL tried returned 403 from CloudFront ("Request blocked"). Not researched; see manual-review list.

#### Physics

Courses: `uk-physics-imperial` · Interviewed: **not published (site blocked)**

- Every imperial.ac.uk URL tried returned 403 from CloudFront ("Request blocked"). Not researched; see manual-review list.

#### Mathematics

Courses: `uk-maths-imperial` · Interviewed: **not published (site blocked)**

- Every imperial.ac.uk URL tried returned 403 from CloudFront ("Request blocked"). Not researched; see manual-review list.

#### Biomedical Engineering

Courses: `uk-bioengineering-imperial` · Interviewed: **not published (site blocked)**

- Every imperial.ac.uk URL tried returned 403 from CloudFront ("Request blocked"). Not researched; see manual-review list.

### King's College London

#### Medicine

Courses: `uk-medicine-kcl` · Interviewed: **yes**

**Format**

> No offers are made without an interview. Interviews are usually held between December and April and applicants must be available for interview in order to be considered for admission. During the current Admissions cycle, interviews will be conducted remotely. A large number of applications are received for Medicine and, although we recognise that this can be an anxious time, all applications are carefully considered. Applicants should therefore not expect a final decision following interview until the admissions cycle has concluded in May.
>
> — [https://www.kcl.ac.uk/study/undergraduate/courses/medicine-mbbs/requirements](https://www.kcl.ac.uk/study/undergraduate/courses/medicine-mbbs/requirements), accessed 2026-11-14

**What is assessed**

> If you are invited to interview, further information regarding the interview format and process will be provided through the King's Apply portal. Interviews form an important part of the selection process and are designed to assess a range of attributes, including communication skills, ethical reasoning, understanding of current and relevant healthcare issues, motivation for studying Medicine and overall suitability for the programme and the medical profession. Interviewers have no prior knowledge of candidates before they meet them and complete standardised assessment criteria for all candidates.
>
> — [https://www.kcl.ac.uk/study/undergraduate/courses/medicine-mbbs/requirements](https://www.kcl.ac.uk/study/undergraduate/courses/medicine-mbbs/requirements), accessed 2026-11-14

- Format details are sent to invited applicants through King's Apply; no MMI station descriptions or sample questions are published on this page.

#### Nursing

Courses: `uk-nursing-kcl` · Interviewed: **yes**

**Format**

> Interviews will be conducted remotely. Interviewers will assess a range of values and attributes. Communication skills will also be assessed during the interview. Interviewers have no prior knowledge of candidates and will complete standardised interviewer assessment score sheets.
>
> — [https://www.kcl.ac.uk/study/undergraduate/courses/nursing-with-registration-as-an-adult-nurse-bsc/requirements](https://www.kcl.ac.uk/study/undergraduate/courses/nursing-with-registration-as-an-adult-nurse-bsc/requirements), accessed 2026-11-14

- No sample questions published.

### University College London

#### Medicine

Courses: `uk-medicine-ucl` · Interviewed: **not published (site blocked)**

- ucl.ac.uk pages returned 403 (bot protection). Not researched; see manual-review list.

#### Architecture

Courses: `uk-architecture-ucl` · Interviewed: **not published (site blocked)**

- ucl.ac.uk pages returned 403 (bot protection). Not researched; see manual-review list.

#### Pharmacy

Courses: `uk-pharmacy-ucl` · Interviewed: **not published (site blocked)**

- ucl.ac.uk pages returned 403 (bot protection). Not researched; see manual-review list.

#### Law (European Legal Systems)

Courses: `uk-law-ucl` · Interviewed: **not published (site blocked)**

- ucl.ac.uk pages returned 403 (bot protection). Not researched; see manual-review list.

### University of Birmingham

#### Medicine

Courses: `uk-medicine-birmingham` · Interviewed: **yes (MMI)**

**Format**

> Our in-person Multiple Mini Interviews (MMIs) for home candidates will consist of seven separate stations. You will physically move around a numbered circuit of stations set up in a large room; each station will include 2 minutes of preparation time and 6 minutes of interview time. A whistle will be blown when it is time to move to the next station (see below for those with additional needs who may require additional preparation time).
>
> — [https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates](https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates), accessed 2026-11-14

**Number and length**

> Your interview will therefore last approximately 60 minutes and you should allow around 2 hours in total for your time at Birmingham Medical School.
>
> — [https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates](https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates), accessed 2026-11-14

**MMI stations**

> The seven stations will include: / Commitment and Insight / Dealing with personal and ethical challenges / Critical Thinking / Professionalism / Data interpretation / Role-Play / Calculation
>
> — [https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates](https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates), accessed 2026-11-14

- The page carries a confidentiality notice: interviewees agree "not [to] share specific details of the materials provided or questions asked". No sample questions are published.
- The page is undated and its headings mention both online and in-person interviews; check the current cycle's arrangements.

### University of Bristol

#### Medicine

Courses: `uk-medicine-bristol` · Interviewed: **yes (structured, multi-station)**

**Format**

> This year's interviews will be hosted remotely via the Zoom platform. The formal interview will last approximately 30 minutes in a structured interview format. There will be six stations, each assessed by multiple assessors. Their scores will be combined to form a total score for each station. The six station scores together will produce your final interview score.
>
> — [https://www.bristol.ac.uk/study/undergraduate/after-you-apply/interviews/medicine/](https://www.bristol.ac.uk/study/undergraduate/after-you-apply/interviews/medicine/), accessed 2026-11-14

**What is assessed**

> The purpose of the interview is to provide the applicant with an opportunity to demonstrate evidence of skills and attributes that are appropriate to a career in medicine and to display insight into a range of topics related to a career in medicine.
>
> — [https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/medicine.pdf](https://www.bristol.ac.uk/study/media/undergraduate/admissions-statements/2027/medicine.pdf), accessed 2026-11-14
> _PDF text; line breaks in the PDF are shown as single spaces._
> _Note: Admissions statement 2027, version 1.0, 14 May 2026._

**Official preparation advice**

> As a medical student, you will attend teaching sessions on professionalism and will be sign-posted to appropriate guidance. In preparation for your interview, we would like you to read very carefully Achieving Good Medical Practice: guidance for medical students published by the General Medical Council.
>
> — [https://www.bristol.ac.uk/study/undergraduate/after-you-apply/interviews/medicine/](https://www.bristol.ac.uk/study/undergraduate/after-you-apply/interviews/medicine/), accessed 2026-11-14

- No sample questions published.

### University of Edinburgh

#### Medicine

Courses: `uk-medicine-edinburgh` · Interviewed: **yes (MMI)**

**Format**

> For medicine and veterinary medicine this will take the form of multiple mini-interviews.
>
> — [https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios](https://study.ed.ac.uk/undergraduate/applying/selection/interviews-tests-portfolios), accessed 2026-11-14

- The medical school's own selection page could not be found (two candidate URLs returned 404); no station details or sample questions were read.

### University of Glasgow

#### Medicine

Courses: `uk-medicine-glasgow` · Interviewed: **yes (two-panel interview)**

**Format**

> For 2027 entry, interviews are being conducted online. Interviews will take place between late November 2026 and March 2027 unless otherwise stated.
>
> — [https://www.gla.ac.uk/schools/medicine/mus/admissions/mbchbinterviews/](https://www.gla.ac.uk/schools/medicine/mus/admissions/mbchbinterviews/), accessed 2026-11-14

**Number and length**

> The interview session will last 30 minutes in total and is divided into two sections - panel A and panel B: / Panel A: explore motivation to becoming a doctor, teamwork and related topics around this. / Panel B: focus on communication and will include discussion of an ethical scenario. Applicants choose one from two given scenarios.
>
> — [https://www.gla.ac.uk/schools/medicine/mus/admissions/mbchbinterviews/](https://www.gla.ac.uk/schools/medicine/mus/admissions/mbchbinterviews/), accessed 2026-11-14

**Official preparation advice**

> Refer to our undergraduate medical curriculum – gla.ac.uk/schools/medicine/mus/admissions (see 'MBChB Programme Information') / Revisit your personal statement (interviewers have no knowledge about you other than your name) / Think of examples of your achievements and skills / Consider your personal characteristics / Reflect on previous interactions or experiences / Be aware of current issues/challenges within the NHS
>
> — [https://www.gla.ac.uk/schools/medicine/mus/admissions/mbchbinterviews/](https://www.gla.ac.uk/schools/medicine/mus/admissions/mbchbinterviews/), accessed 2026-11-14

- Applicants are told not to "discuss questions you were asked or scenarios in your interview with others". No sample questions or scenarios are published.

### University of Leeds

#### Medicine

Courses: `uk-medicine-leeds` · Interviewed: **yes (MMI)**

**Format**

> For students applying for 2027 entry, face-to-face interviews for the MBChB course will take place on 4th, 5th and 6th January 2027. Overseas interviews will be carried out online. Using a multiple mini-interview format, we will further assess applicants’ non-academic qualities.
>
> — [https://courses.leeds.ac.uk/5580/medicine-and-surgery-mbchb](https://courses.leeds.ac.uk/5580/medicine-and-surgery-mbchb), accessed 2026-11-14

- For preparation the page refers to the Medical Schools Council website (not a university source; not used). No sample questions published.

### University of Manchester

#### Medicine

Courses: `uk-medicine-manchester` · Interviewed: **yes (MMI)**

**Format**

> The interview process will adopt a five-station multiple mini interview (MMI) format, with each station being marked by a separate interviewer.
>
> — [https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/](https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/), accessed 2026-11-14

**Number and length**

> The interview in each station will be eight minutes long with a two-minute gap between stations. No information will be provided in advance, and there will be no reading or writing component to any of the online or in-person interview stations.
>
> — [https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/](https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/), accessed 2026-11-14

**What is assessed**

> The interview is not a test of your academic knowledge. The aim of the interview is to determine if a candidate satisfies our non-academic criteria in terms of the values and behaviours expected of a medical student.
>
> — [https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/](https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/), accessed 2026-11-14

**Official sample questions (1)**

1. _Medicine_

   > Why do you want to be a doctor?
   >
   > — [https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/](https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/), accessed 2026-11-14
   > _Note: Published as a heading under "Here are some examples of areas that could be tested in your interview", followed by: "This is an obvious but vital question."_

**Official preparation advice**

> Please be yourself. You should speak naturally and conversationally. Do not feel the need to be excessively formal unless required by the interview station scenario.
>
> — [https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/](https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/), accessed 2026-11-14

> Have a series of pointers in your mind, but remember not to over-rehearse. Our interview style at Manchester is conversational, and we're not looking for a monologue.
>
> — [https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/](https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/), accessed 2026-11-14

- The page notes a possible change for 2026/7: "potentially replacing one MMI interview station with a group task".

### University of Nottingham

#### Medicine

Courses: `uk-medicine-nottingham` · Interviewed: **yes**

**Format**

> The interview format is determined on the applicant’s fee status: / Home applicants will be invited to attend an interview in person / International applicants will be invited to attend an interview online via Microsoft Teams
>
> — [https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Medicine-BMBS.html](https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Medicine-BMBS.html), accessed 2026-11-14

- No MMI station details or sample questions on the course page.

### University of St Andrews

#### Medicine

Courses: `uk-medicine-standrews` · Interviewed: **yes (MMI)**

**Format**

> Interviews for entry to the School of Medicine are in the format of multiple interviews: these usually consist of four 'mini' interviews held at different stations which last about six minutes each.
>
> — [https://www.st-andrews.ac.uk/subjects/medicine/selection/](https://www.st-andrews.ac.uk/subjects/medicine/selection/), accessed 2026-11-14

**MMI stations**

> At the interview, you will be expected to demonstrate that you have an understanding of medicine as a career and that you appreciate the realities of working in a caring profession. Your communication and interpersonal skills will be assessed at each station, and at least one station will involve role-play and interaction with an actor. You may also be assessed on such things as critical thinking, reflection, and your ability to discuss ethical issues.
>
> — [https://www.st-andrews.ac.uk/subjects/medicine/selection/](https://www.st-andrews.ac.uk/subjects/medicine/selection/), accessed 2026-11-14

- The page still says "For 2026 entry" for the in-person/online split; may be stale. No sample questions published.

### University of Bath

#### Pharmacy

Courses: `uk-pharmacy-bath` · Interviewed: **yes**

**Format**

> If you are assessed as suitable you will be invited to a selection interview. If you are applying from outside the UK we will arrange to interview you remotely. You will need to complete a Fitness to Practise self-declaration form as part of the interview process. This form includes a written declaration of any medical conditions or disabilities you have. You will not receive an offer unless you are successful in your interview. This is required by the General Pharmaceutical Council (GPhC).
>
> — [https://www.bath.ac.uk/courses/undergraduate-2027/pharmacy/mpharm-pharmacy/](https://www.bath.ac.uk/courses/undergraduate-2027/pharmacy/mpharm-pharmacy/), accessed 2026-11-14

**What is assessed**

> Your Organic Chemistry and Pharmaceutical Calculation skills will be examined as part of any interview.
>
> — [https://www.bath.ac.uk/courses/undergraduate-2027/pharmacy/mpharm-pharmacy/](https://www.bath.ac.uk/courses/undergraduate-2027/pharmacy/mpharm-pharmacy/), accessed 2026-11-14

- No sample questions published.

### University of Nottingham

#### Pharmacy

Courses: `uk-pharmacy-nottingham` · Interviewed: **yes (MMI)**

**Format**

> We initially shortlist based on your UCAS application and grades. The next step is an interview. We use a multi-mini interview (MMI) format. The MMI is a series of short interviews, each around five minutes that explore and engage your communication skills, interest in pharmacy and scenario based discussion on ethics and professional values and general understanding of how medicines work. It is an interactive process that gives you further insight into being a pharmacist. Further information about the interview process is on our website.
>
> — [https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Pharmacy-MPharm.html](https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Pharmacy-MPharm.html), accessed 2026-11-14

- No sample questions published.

### University of Manchester

#### Psychology

Courses: `uk-psychology-manchester` · Interviewed: **sometimes**

**Format**

> Applications are considered on the basis of the UCAS form. Candidates may be interviewed online or by telephone, or asked to complete an alternative admissions statement.
>
> — [https://www.manchester.ac.uk/study/undergraduate/courses/2027/00653/bsc-psychology/](https://www.manchester.ac.uk/study/undergraduate/courses/2027/00653/bsc-psychology/), accessed 2026-11-14

- No sample questions published.

### National University of Singapore

#### Law

Courses: `sg-law-nus` · Interviewed: **yes (shortlisted applicants)**

**Format**

> Shortlisted applicants will be required to sit for a written test and attend a formal interview, usually held in April – May in Singapore. Selection shall be solely within the discretion of the University and will depend upon the number of places available in the Faculty. /  / The objective of the written test is to assess applicants based on three foundational competencies. These competencies are: /  / (a) reading comprehension (the ability to understand complex pieces of text); / (b) effective writing (the ability to express thoughts clearly in good written English); and / (c) analytical reasoning (the ability to process and organise information to solve a problem).
>
> — [https://law1a.nus.edu.sg/admissions/4_yrs_llb_prog.html](https://law1a.nus.edu.sg/admissions/4_yrs_llb_prog.html), accessed 2026-11-14

- No sample interview questions published.

### IE University

#### All six courses

Courses: `es-cs-ie`, `es-maths-ie`, `es-economics-ie`, `es-law-ie`, `es-business-ie`, `es-architecture-ie` · Interviewed: **yes (most candidates)**

**Format**

> Yes, interviews are an integral part of the admissions process. Once the Admissions Committee has reviewed the candidate’s application, they may already decide on a resolution and communicate it or invite the candidate to a formal interview. This interview will be online and will usually take place within the round’s deadlines.
>
> — [https://www.ie.edu/university/admission/admission-process/admissions-rounds/](https://www.ie.edu/university/admission/admission-process/admissions-rounds/), accessed 2026-11-14

- No sample questions published.

### Yale University

#### All courses (admission to the university, not to a course)

Courses: `us-cs-yale`, `us-economics-yale`, `us-law-yale`, `us-biology-yale` · Interviewed: **by invitation (evaluative)**

**Format**

> ## Alumni volunteers and current Yale students conduct evaluative interviews, by invitation only.
>
> — [https://admissions.yale.edu/interviews](https://admissions.yale.edu/interviews), accessed 2026-11-14

**Official preparation advice**

> Although the interviewer will get the ball rolling with questions, come prepared to be an engaged conversationalist. Rather than answering a question with a one-word, direct answer, approach each question as an opportunity to elaborate on various aspects of who you are. Share whatever additional information you feel the admissions committee should consider in order to fully appreciate your ideas, intellectual curiosity, character, and values. Interviewers can also learn about candidates from the interesting, thoughtful questions they bring to the conversation.
>
> — [https://admissions.yale.edu/interviews](https://admissions.yale.edu/interviews), accessed 2026-11-14

- No sample questions published.

### Stanford University

#### All courses (admission to the university, not to a course)

Courses: `us-cs-stanford`, `us-engineering-stanford`, `us-economics-stanford`, `us-maths-stanford`, `us-psychology-stanford` · Interviewed: **optional**

**Format**

> The Optional interviews provide opportunities for applicants to have meaningful conversations with Stanford alumni. A two-way exchange allows you to learn more about Stanford while the Admission Office learns more about you.
>
> — [https://admission.stanford.edu/apply/first-year/interview.html](https://admission.stanford.edu/apply/first-year/interview.html), accessed 2026-11-14

- No sample questions published.

### Duke University

#### All courses (admission to the university, not to a course)

Courses: `us-cs-duke`, `us-maths-duke`, `us-economics-duke` · Interviewed: **optional**

**Format**

> All interviews are conducted virtually or by phone by Duke alumni who volunteer their time. They are not employed by the Admissions Office and do not have access to your application, academic records, or other admissions-related information. Importantly, alumni interviewers cannot predict or influence your chances of admission.
>
> — [https://admissions.duke.edu/alumni-interviews/](https://admissions.duke.edu/alumni-interviews/), accessed 2026-11-14

**Official preparation advice**

> The virtual or phone interview should feel more like a relaxed conversation, where you can discuss your interests and aspirations, and ask the alumnus/a questions about Duke. It’s a great opportunity to get to know Duke better and provide additional context about yourself beyond the written application.
>
> — [https://admissions.duke.edu/alumni-interviews/](https://admissions.duke.edu/alumni-interviews/), accessed 2026-11-14

- No sample questions published.

### MIT

#### All courses (admission to the university, not to a course)

Courses: `us-cs-mit`, `us-engineering-mit`, `us-mechanical-mit`, `us-physics-mit`, `us-economics-mit`, `us-maths-mit` · Interviewed: **offered where available**

**Format**

> Interviews are held in person whenever possible; however you may coordinate a virtual interview if agreed upon with your EC.
>
> — [https://mitadmissions.org/apply/firstyear/interview/](https://mitadmissions.org/apply/firstyear/interview/), accessed 2026-11-14

- No sample questions published.

### Harvard University

#### All courses (admission to the university, not to a course)

Courses: `us-cs-harvard`, `us-economics-harvard`, `us-law-harvard`, `us-biology-harvard`, `us-maths-harvard` · Interviewed: **at the Admissions Committee's discretion**

**Format**

> Applicants are assigned interviews at the discretion of the Admissions Committee, based, in part, on availability of alumni in your local area. Nearly 10,000 alumni/ae volunteers help us recruit students from all 50 states and around the world, but most areas do not have the capacity to interview all applicants. Your application is considered complete without an interview and will receive a full and thorough evaluation. In most cases, the Admissions Committee has sufficient information in the student’s application materials to reach an admissions decision. If the Committee would like more information about a student or has questions about any application materials, someone may reach out to schedule an interview.
>
> — [https://college.harvard.edu/guides/what-expect-after-you-apply](https://college.harvard.edu/guides/what-expect-after-you-apply), accessed 2026-11-14

- No sample questions published.

### Dartmouth College

#### All courses (admission to the university, not to a course)

Courses: `us-cs-dartmouth`, `us-economics-dartmouth` · Interviewed: **offered where available**

**Format**

> As part of the admissions process, Dartmouth conducts alumni interviews. Once you apply, your contact information is sent to volunteer alumni admissions ambassadors. An alumnus or current student will then contact you directly to schedule the interview using the email address you provided in your application. Interviews will be offered virtually (via phone or video call) and in person.
>
> — [https://admissions.dartmouth.edu/glossary-question/how-do-i-get-interview](https://admissions.dartmouth.edu/glossary-question/how-do-i-get-interview), accessed 2026-11-14

- No sample questions published.

### Princeton University

#### All courses (admission to the university, not to a course)

Courses: `us-cs-princeton`, `us-engineering-princeton`, `us-economics-princeton`, `us-maths-princeton` · Interviewed: **optional**

**Format**

> Interview. Princeton offers optional alumni interviews. Interviews take place after the Admission Office has received your application. You may choose to opt out of the interview in the Princeton-specific Questions, and this choice will not put you at any disadvantage in the admission process. If you do not opt out, you may receive an email inviting you to interview with a member of our Princeton Alumni Schools Committee. If so, we encourage you to take advantage of this opportunity. The interviews are 30-45 minute informal conversations, where you can discuss the things that are important to you and also ask questions to someone who attended Princeton. We cannot guarantee that every applicant will receive an interview. This will depend on the availability of alumni in your area. Our dedicated alumni do manage to contact the vast majority of our applicants every year; however, if you do not receive an interview for any reason, it will not put you at a disadvantage since the interview is optional. We do not offer on-campus interviews. These interviews must not be recorded in any way, either by the interviewer or the applicant. Given the timeline, students who are participating in the QuestBridge National College Match will be unable to complete an interview.
>
> — [https://admission.princeton.edu/apply/application-checklist](https://admission.princeton.edu/apply/application-checklist), accessed 2026-11-14

- No sample questions published.

### Rice University

#### All courses (admission to the university, not to a course)

Courses: `us-cs-rice`, `us-engineering-rice` · Interviewed: **optional (recommended)**

**Format**

> We recommend that first-year applicants request an interview, though interviews are optional and not guaranteed. These conversations are a great way to showcase your academic and personal successes, demonstrate your knowledge of Rice, and learn more about the student experience.
>
> — [https://admission.rice.edu/apply/first-year-international-applicants](https://admission.rice.edu/apply/first-year-international-applicants), accessed 2026-11-14

- No sample questions published.

### Georgetown University

#### All courses (admission to the university, not to a course)

Courses: `us-law-georgetown`, `us-business-georgetown` · Interviewed: **yes (alumni interview, when assigned)**

**Format**

> Alumni Interviews are a key part of Georgetown’s application process, allowing us to learn more about students’ high school experiences, college goals, and interest in the University. Alumni interviews begin in September each year, and continue throughout the application cycle.
>
> — [https://uadmissions.georgetown.edu/apply/first-year-applicants/](https://uadmissions.georgetown.edu/apply/first-year-applicants/), accessed 2026-11-14

- No sample questions published.

## 3. Universities with no published sample questions

On the official pages read, these publish **no** sample or practice interview questions of their own (format and preparation advice only, where any):

- University of Cambridge
- Imperial College London
- King's College London
- University College London
- University of Birmingham
- University of Bristol
- University of Edinburgh
- University of Glasgow
- University of Leeds
- University of Nottingham
- University of St Andrews
- University of Bath
- National University of Singapore
- IE University
- Yale University
- Stanford University
- Duke University
- MIT
- Harvard University
- Dartmouth College
- Princeton University
- Rice University
- Georgetown University

Of the universities that do publish questions: **Oxford** (Computer Science and Engineering only; nothing found on the Maths, Biochemistry, PPE, History or Law pages, and the central sample-questions page could not be read) and **Manchester** (Medicine only: one question named on its interview page). Cambridge publishes no sample questions on its central, course or department pages read; its Computer Science department points applicants to Oxford's.

### Found but not used

- **Oxford Physics "Mock Interview Pack for Teachers"** (2021) — headed "STUDENTS: THIS IS NOT FOR YOU". Its questions are not copied, because the department asks students not to read them; it also predates the 2026 admissions-test change.
- **Lucy Cavendish College (Cambridge) "Interview Question Pack" and workshop PDFs** — outreach material whose questions "have been compiled to give you an insight into the types of questions that are asked at Oxbridge interviews"; no source is given for any question, so they are not the College's own published interview questions.
- **College and department videos** (Downing, Sidney Sussex, Cambridge CS, Oxford Law mock interview) — no published transcripts, so no questions are taken from them.
- **Medical Schools Council** interview-preparation resources, to which Leeds and Manchester refer applicants — not a university source.
- **Oxford CS "sample interview dialogue"** — a worked transcript of the "Tidy boxes" problem; not counted as a separate question.
- A 2016 student blog on a University of Nottingham domain describing MMIs — a personal account, not official guidance.

### Part 0 courses not researched further

Our own data already records that these do not interview, interview only exceptionally, or use a third-party interview (InitialView/Vericant) for English proficiency; they were not re-researched: Brown, Carnegie Mellon, Columbia, Cornell, Durham (policy: some courses, details on course pages), Emory, Georgia Tech, Johns Hopkins, LSE, Northwestern, UC Berkeley, UCLA, USC, Notre Dame, Vanderbilt, Washington University in St. Louis, UIUC; non-interview courses at Bath, Bristol, Edinburgh, Exeter, Glasgow, King's, Leeds, Manchester, Nottingham, St Andrews, UCL and Warwick. Penn's interview row could not be checked in our data and was not researched here.

## 4. Manual-review list

Pages that refused automated access or could not be found. Nothing was done to get round a block. A person should open these in a browser.

| Page | Why |
|---|---|
| https://www.ox.ac.uk/admissions/undergraduate/applying/guide-for-applicants/interviews/sample_questions | Oxford central "Sample interview questions" page — Cloudflare challenge (403). The PPE and Maths pages point here for sample questions. |
| https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford/guide/interviews | Oxford central interviews guide — Cloudflare challenge (403). |
| https://www.medsci.ox.ac.uk/study/medicine/pre-clinical/interviews | Oxford Medicine interviews — 403. |
| https://www.medsci.ox.ac.uk/study/medicine/pre-clinical/application-process | Oxford Medicine application process — 403. |
| https://www.sbs.ox.ac.uk/programmes/undergraduate/economics-and-management | Oxford Economics and Management — 403; economics.ox.ac.uk admissions URLs 404. |
| https://www.law.ox.ac.uk/admissions/undergraduate | Oxford Law undergraduate admissions landing page — 403 (the Law FAQ page loaded and is used). |
| https://eng.ox.ac.uk/media/4095/typical_engineering_interview_questions-accessible.pdf | Oxford Engineering typical-question PDF is undated and describes in-person interviews; confirm it is current. |
| https://www.physics.ox.ac.uk/study/undergraduates | Oxford Physics: no current interview page found (404); only the 2021 teacher pack. |
| https://www.imperial.ac.uk/study/apply/undergraduate/process/interviews/ | Imperial — every imperial.ac.uk URL returned 403 (CloudFront). All 8 Imperial courses unresearched. |
| https://www.ucl.ac.uk/medical-sciences/divisions/medical-school/study/undergraduate/mbbs-admissions/selection-interviews/interviews | UCL Medicine MMI page — 403. UCL Architecture, Pharmacy and Laws pages also 403. |
| https://www.admissions.eng.cam.ac.uk/faqs | Cambridge Engineering admissions FAQ — 403. |
| https://medicine-vet-medicine.ed.ac.uk/edinburgh-medical-school/medicine/applying/how-to-apply/selection/interviews | Edinburgh Medicine selection/MMI detail — page not found (404); locate the current URL by hand. |

Records flagged `manualReview: true` in the JSON: 20 — University of Oxford Engineering Science, University of Oxford Physics, University of Oxford Philosophy, Politics and Economics, University of Oxford Law (Jurisprudence), University of Oxford Economics and Management, University of Oxford Medicine, University of Cambridge Engineering, Imperial College London Medicine, Imperial College London Computing, Imperial College London Electrical & Electronic Engineering, Imperial College London Mechanical Engineering, Imperial College London Chemical Engineering, Imperial College London Physics, Imperial College London Mathematics, Imperial College London Biomedical Engineering, University College London Medicine, University College London Architecture, University College London Pharmacy, University College London Law (European Legal Systems), University of Edinburgh Medicine.

