# User-Agent bypass audit

Report only. No data, engine or page file was changed. Generated 2026-10-21.

Until 2026-10-21, `scripts/verify-pass/fetch.py` sent a browser User-Agent
header (`Mozilla/5.0 … Chrome/130.0 …`) on every direct request. That header
gets past some sites that refuse automated requests, which breaks the
no-bypass rule. The override has been removed; requests now go out as curl's
own default request.

## 1. Runs that used the script

| Run | Commits | Session | Fetch mode |
|---|---|---|---|
| US verification pass (2027 rows, all US universities) | `ece80a5` … `eef35fd` (2026-10-19) | `01XsnA3B…` | direct, browser User-Agent |
| UK verification pass (2027 rows, all UK universities, plus the Glasgow/KCL/Manchester US-route sweeps) | `cb9d9d6` … `a31a28c` (2026-10-19) | `01XsnA3B…` | direct, browser User-Agent |
| UK pass, Oxford and UCL re-fetch | `55e01ae`, `6e7a4ef` (2026-10-19) | `012d1Di5…` | `--reader` (r.jina.ai text reader) |
| Research: Spain, Italy, France (`research/europe-south.md`) | `fcee234`, `301bef6` (2026-10-21) | `012d1Di5…` | direct, browser User-Agent |
| Research: Trinity, UCD, IE University (`research/ireland.md`, `research/ie-university.md`) | `d116d10` (2026-10-21) | `012d1Di5…` | direct, browser User-Agent; evidence re-tested without it at the time (UCD discarded) |
| Load Trinity College Dublin and IE University into the data | `6a44783` (2026-10-21) | `012d1Di5…` | no new fetches; uses the `d116d10` evidence |

The script was first committed in `c1dd7de`, after the US and UK passes had
landed. Its commit message describes it as the tooling "used for the
requirements verification pass"; that commit already contains the User-Agent
line. Git cannot show the exact copy the passes ran, so the US and UK passes
are treated as having used the header.

Rows dated before 2026-10-19 (the July and August data work) predate the
script and are out of scope. The engine migrations (`c8ab778` … `7eae95e`)
fetched nothing.

## 2. Re-test without the header

On 2026-10-21 every source URL behind a 2027.js row dated 2026-10-19 or later
(415 URLs) and every URL in the three research reports was requested once
with plain curl (no User-Agent override, no other header). Every non-200
result was retried once at low concurrency, with the same outcome each time.
Nothing was requested with the header, so a 403 shows that the page refuses a
plain automated request today, not when it started refusing one.

| Result | Hosts |
|---|---|
| **HTTP 403 (CDN or Cloudflare block page)** | www.imperial.ac.uk, www.durham.ac.uk, undergrad.admissions.columbia.edu, www.ox.ac.uk, www.ucl.ac.uk, www.esade.edu (plus web.ub.edu, www.upf.edu, www.parcoursup.gouv.fr, www.topuniversities.com and one www.polimi.it page, which were already listed as blocked and not used as evidence) |
| Refused or failed for another reason | www.manchester.ac.uk 503 ("Under maintenance": CloudFront origin failing); courses.leeds.ac.uk and www.leeds.ac.uk 503; www.kcl.ac.uk 504; www.ed.ac.uk and science-engineering.ed.ac.uk 401 ("Pantheon / Site Locked"); TLS or connection failures through the session proxy for admission.princeton.edu, admissions.dartmouth.edu, admissions.duke.edu, admissions.northwestern.edu, bulletins.nyu.edu, www.cs.cornell.edu and www.physics.ox.ac.uk |
| HTTP 200 | every other URL, including every Trinity College Dublin and IE University source |

The second group is outages, a site-wide lock and failures in this
environment's proxy, not a User-Agent block. Whether those pages need the
header is unproven either way. Re-test them before relying on them.

## 3. 2027.js values that depend on a page returning 403 without the header

256 rows across 38 courses. In 249 of them, every cited source returns 403.
`*` marks a row that also cites a source which still loads. "(partial)" marks
a row that is not verified; every other row is verified.

- **Imperial, Durham and Columbia (144 rows, 18 courses).** These were read
  directly in the US and UK passes, so the values rest on access that the
  User-Agent header gave. They include engine-locked `aLevel` and `ib` rows,
  which drive matching, as well as admissions tests, subject prerequisites,
  English language and the US routes.
- **Oxford central pages and UCL (112 rows, 20 courses).** These were already
  blocked with the header: the first pass reported "central site blocked" and
  "site blocked". They were read through the r.jina.ai text reader, which is a
  separate bypass. Every one of these rows already carries a "re-check in a
  browser" reviewFlag.

#### www.ox.ac.uk

| Course id | Rows citing a 403 page |
|---|---|
| `uk-biochemistry-oxford` | englishLanguage |
| `uk-cs-oxford` | englishLanguage |
| `uk-economics-oxford` | satAct, englishLanguage, admissionsTests, otherQualifications |
| `uk-engineering-oxford` | satAct, englishLanguage, subjectPrerequisites*, aLevel*, otherQualifications |
| `uk-history-oxford` | satAct, englishLanguage, subjectPrerequisites*, aLevel*, ib*, otherQualifications, otherRequirements* |
| `uk-law-oxford` | satAct, englishLanguage, otherQualifications |
| `uk-maths-oxford` | englishLanguage |
| `uk-medicine-oxford` | satAct, englishLanguage, admissionsTests, subjectPrerequisites (partial), aLevel (partial), ib (partial), otherQualifications, otherRequirements |
| `uk-physics-oxford` | satAct, englishLanguage, otherQualifications |
| `uk-ppe-oxford` | satAct, englishLanguage, subjectPrerequisites, aLevel, ib, otherQualifications, otherRequirements* |

#### www.imperial.ac.uk

| Course id | Rows citing a 403 page |
|---|---|
| `uk-bioengineering-imperial` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib (partial), otherQualifications, otherRequirements |
| `uk-chemical-imperial` | satAct, englishLanguage, admissionsTests, subjectPrerequisites (partial), aLevel (partial), ib (partial), otherQualifications, otherRequirements |
| `uk-cs-imperial` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib (partial), otherQualifications, otherRequirements |
| `uk-electrical-imperial` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib (partial), otherQualifications, otherRequirements |
| `uk-maths-imperial` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib (partial), otherQualifications, otherRequirements |
| `uk-mechanical-imperial` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications, otherRequirements |
| `uk-medicine-imperial` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications, otherRequirements |
| `uk-physics-imperial` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib (partial), otherQualifications, otherRequirements |

#### www.ucl.ac.uk

| Course id | Rows citing a 403 page |
|---|---|
| `uk-architecture-ucl` | satAct, admissionsTests, subjectPrerequisites (partial), aLevel (partial), otherQualifications, otherRequirements |
| `uk-biomedical-ucl` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications, otherRequirements |
| `uk-cs-ucl` | satAct, englishLanguage, admissionsTests, subjectPrerequisites (partial), aLevel (partial), ib, otherQualifications, otherRequirements |
| `uk-economics-ucl` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications, otherRequirements |
| `uk-engineering-ucl` | satAct, englishLanguage, admissionsTests, subjectPrerequisites (partial), aLevel (partial), ib (partial), otherQualifications, otherRequirements |
| `uk-law-ucl` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, otherQualifications, otherRequirements |
| `uk-maths-ucl` | satAct, admissionsTests, subjectPrerequisites, aLevel, ib (partial), otherQualifications, otherRequirements |
| `uk-medicine-ucl` | satAct (partial), englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications (partial), otherRequirements |
| `uk-pharmacy-ucl` | satAct, admissionsTests, subjectPrerequisites (partial), aLevel (partial), otherQualifications, otherRequirements |
| `uk-psychology-ucl` | satAct, admissionsTests, subjectPrerequisites (partial), aLevel (partial), otherQualifications, otherRequirements |

#### www.durham.ac.uk

| Course id | Rows citing a 403 page |
|---|---|
| `uk-cs-durham` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications (partial), otherRequirements |
| `uk-economics-durham` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications (partial), otherRequirements |
| `uk-engineering-durham` | satAct, englishLanguage, admissionsTests, subjectPrerequisites (partial), aLevel (partial), ib (partial), otherQualifications (partial), otherRequirements |
| `uk-law-durham` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications (partial), otherRequirements |
| `uk-maths-durham` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications (partial), otherRequirements |
| `uk-physics-durham` | satAct, englishLanguage, admissionsTests, subjectPrerequisites, aLevel, ib, otherQualifications (partial), otherRequirements |

#### undergrad.admissions.columbia.edu

| Course id | Rows citing a 403 page |
|---|---|
| `us-cs-columbia` | satAct, englishLanguage, admissionsTests, subjectPrerequisites (partial), aLevel, ib, otherQualifications, otherRequirements |
| `us-economics-columbia` | satAct, englishLanguage, admissionsTests, subjectPrerequisites (partial), aLevel, ib, otherQualifications, otherRequirements |
| `us-engineering-columbia` | satAct, englishLanguage, admissionsTests, subjectPrerequisites (partial), aLevel, ib, otherQualifications, otherRequirements |
| `us-maths-columbia` | satAct, englishLanguage, admissionsTests, subjectPrerequisites (partial), aLevel, ib, otherQualifications, otherRequirements |

## 4. Follow-up (2026-10-21)

- `fetch.py --reader` (r.jina.ai) has been removed.
- The 256 rows in section 3 are now `partial` in `data/requirements/2027.js`.
  Each carries a reviewFlag naming this audit, and a note saying it awaits a
  manual check. Every value, source, date and snippet is unchanged, and so
  is the engine, so matching does not move.
- `research/manual-check.md` lists the 57 URLs behind those rows, with every
  quote to confirm in a browser.
- The rows in section 2 marked "refused or failed for another reason" were
  left as they are.
