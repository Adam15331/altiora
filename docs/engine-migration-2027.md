# Engine migration to 2027 entry (UK)

On 19 Oct 2026 the matching engine (`data/courseRequirements.js`) was moved
to the official 2027-entry values for 103 UK courses at 17 universities.
Before the migration, each of those values appeared only in the requirement
panel (`data/requirements/2027.js`), as an "Official (2027 entry): …" note
with an owner `reviewFlag`. The engine and the panel rows were changed
together, and the validator's engine lock (`npm run validate`) shows they
agree.

## How it was done

- **No prose parsing.** Each change is an explicit, reviewed entry in
  [`engine-migration-2027.mapping.json`](engine-migration-2027.mapping.json):
  course → engine field → old → new, with the source URL and a verbatim
  quote from that row's existing `sourceSnippet`.
- **The applier refuses stale entries.** `scripts/verify-pass/engine-migrate.mjs`
  applies the mapping, but writes nothing if any `old` differs from the
  engine's current value. It rewrites only these lines:
  - `requirements.essential` / `.preferred`;
  - `grades.aLevels` / `.ib` / `.ibHL` / `.ibHLNote`;
  - `admissionTests`.

  It also updates the course's `courseVerification` entry to the 2027
  source, the date and a note of what changed (status `partial` where
  anything stays unexpressible). It patches the matching panel rows, and
  appends a CHANGELOG section per university.
- **Rows were upgraded to verified only where nothing is left unconfirmed.**
  That means everything in the row is supported by its own quote after the
  change. Where a row's note claimed something its quote does not
  contain, the claim was cut or the row stayed partial.
- **One university per commit.** Each commit passed `npm run check`
  beforehand.
- **UCL and Oxford.** www.ucl.ac.uk and www.ox.ac.uk return HTTP 403 to
  automated requests, and web.archive.org was unreachable from the
  verification environment (TLS reset). These were tried and failed:
  - archive.ph / archive.is (429) and archive.today (404);
  - the Google Translate proxy (403);
  - full browser headers (403).

  The live 2027-entry pages were therefore read through the r.jina.ai text
  reader (`fetch.py --reader`). Rows still cite the official URL, quotes
  were checked verbatim against the reader's text, and every such row
  carries a reviewFlag naming the retrieval route and asking for a browser
  re-check.

## What changed

215 engine changes across 103 courses, by kind:

| Kind | Changes |
|---|---:|
| preferred-remove-unlisted | 60 |
| ib-hl | 37 |
| ib-note | 32 |
| ib-score | 22 |
| essential-to-preferred | 19 |
| offer | 18 |
| preferred-remove-stated | 10 |
| essential-remove | 10 |
| preferred-to-essential | 3 |
| test-add | 2 |
| test-remove | 2 |
| preferred-add | 2 |

`preferred-remove-unlisted` means the official page does not name a subject
the engine held as preferred. Most of these were stand-ins added when the
engine was first built, such as History/English for Law, or Further Maths
for most maths-based courses.

### Not migrated

The schema cannot express some requirements, so these stay partial with a
flag. There are 97 `keep` items in the mapping, mostly:

- ranges, such as Edinburgh's grade ranges or Exeter's A*AA–AAA;
- "one of a list" subjects;
- conditional requirements;
- College variation;
- contextual offers;
- system-specific essentials (requirements.essential is shared across
  qualification systems).

The reviewer also rejected four drafted entries. The original proposals
are kept under `rejected` in the mapping:

| Course | Why not applied |
|---|---|
| `uk-cs-cambridge`, `uk-engineering-cambridge` | Further Mathematics is required only "if your school offers it". Making it essential would exclude students whose school does not offer it, so it stays preferred. |
| `uk-accounting-manchester` | The quote cuts the sentence that introduces the subject list. Seven preferred tags would also make green unreachable (green needs every preferred subject). |
| `uk-maths-ucl` (preferred subjects only) | Same green-unreachable problem: a third-subject list is a choice, not seven preferences. The STEP change was applied. |

`uk-engineering-ucl`'s preferred third-subject list is likewise display-only
(Further Mathematics was removed from preferred). `uk-architecture-ucl` was
held back: its IB row is still the June row, so the IB tab needs a browser
check first.

## Matching hashes

These are recomputed with `scripts/verify-pass/matching/hash.mjs`: sha256
(first 8 hex) of `[id, status, ibHLWarning, gradeGap]` over all 320 courses,
with each fixture seeded into `altiora_state_v1`. The fixtures are defined
in that script.

| Fixture | Before (`origin/main` e968250) | After | Greens before → after |
|---|---|---|---|
| UK (Maths, Further Maths, Physics, Chemistry; all A*) | `7296a258` | `cee5feaa` | 61 → 83 |
| IB (Maths AA HL, Physics HL, Chemistry HL; 38) | `d7abbbfa` | `1e3c07b3` | 0 → 0 |
| SG (H2 Maths, Physics, Chemistry; all A) | `d4bd83ef` | `3087bac6` | 4 → 4 |
| HK (Maths, M2, Physics, Chemistry; all 5**) | `a8942995` | `ab527866` | 0 → 0 |
| US_AP (nine APs; all 5; Grade 11) | `0db9ce18` | `0db9ce18` | 7 → 7 |

US_AP is unchanged because no US course was touched.

## Match shifts per course — SYNTHETIC profiles

> **There is no real student data.** The table below compares `origin/main`
> with this branch over a **made-up grid of 50 profiles**
> (`scripts/verify-pass/matching/grid.mjs`):
> - **A-Level:** 6 subject sets × 5 grade profiles (A\*A\*A\* … AAB);
> - **IB:** 4 HL subject sets × 5 point totals (34–42).
>
> Counts are how many of these 50 synthetic profiles change status on each
> course. They say nothing about how many real students are affected.

Across all 115 UK courses × 50 profiles (5,750 cells), the status changes
were:

| Change | Cells |
|---|---:|
| amber → green | 488 |
| amber → red | 279 |
| grey → red | 156 |
| red → amber | 153 |
| red → grey | 91 |
| amber → grey | 75 |
| green → grey | 25 |
| grey → amber | 9 |
| grey → green | 7 |
| red → green | 6 |
| green → amber | 2 |

| Course | Profiles changed (of 50) | Transitions (count) |
|---|---:|---|
| `uk-accounting-bath` | 15 | amber→green (15) |
| `uk-accounting-lse` | 23 | amber→green (15), amber→grey (8) |
| `uk-accounting-warwick` | 15 | amber→green (15) |
| `uk-architecture-edinburgh` | 25 | amber→green (15), amber→red (5), grey→red (5) |
| `uk-biochemistry-oxford` | 10 | red→amber (5), red→grey (5) |
| `uk-bioengineering-imperial` | 6 | amber→green (4), amber→grey (2) |
| `uk-biomedical-ucl` | 2 | green→grey (1), amber→grey (1) |
| `uk-chemical-imperial` | 2 | amber→grey (2) |
| `uk-cs-bath` | 2 | amber→green (2) |
| `uk-cs-birmingham` | 13 | amber→grey (6), amber→green (3), green→grey (4) |
| `uk-cs-durham` | 3 | amber→green (3) |
| `uk-cs-edinburgh` | 5 | amber→green (5) |
| `uk-cs-exeter` | 4 | amber→green (4) |
| `uk-cs-glasgow` | 4 | amber→green (4) |
| `uk-cs-imperial` | 13 | amber→grey (9), green→grey (4) |
| `uk-cs-kcl` | 12 | amber→grey (6), green→amber (2), green→grey (4) |
| `uk-cs-leeds` | 4 | amber→green (4) |
| `uk-cs-manchester` | 7 | grey→amber (2), amber→green (2), grey→green (3) |
| `uk-cs-nottingham` | 11 | grey→amber (5), amber→green (3), grey→green (3) |
| `uk-cs-standrews` | 4 | amber→green (4) |
| `uk-cs-ucl` | 5 | amber→grey (3), green→grey (2) |
| `uk-economics-bath` | 15 | amber→green (15) |
| `uk-economics-birmingham` | 20 | amber→green (20) |
| `uk-economics-bristol` | 15 | amber→green (15) |
| `uk-economics-cambridge` | 4 | amber→green (4) |
| `uk-economics-durham` | 20 | amber→green (15), amber→grey (5) |
| `uk-economics-edinburgh` | 15 | amber→green (15) |
| `uk-economics-exeter` | 15 | amber→green (15) |
| `uk-economics-glasgow` | 25 | amber→green (25) |
| `uk-economics-kcl` | 15 | amber→green (15) |
| `uk-economics-leeds` | 30 | amber→green (20), amber→grey (5), red→grey (1), red→amber (4) |
| `uk-economics-nottingham` | 20 | amber→green (15), red→grey (1), red→amber (4) |
| `uk-economics-oxford` | 18 | amber→green (15), amber→grey (3) |
| `uk-economics-standrews` | 30 | amber→green (20), red→amber (7), red→grey (3) |
| `uk-economics-ucl` | 18 | amber→green (15), amber→grey (3) |
| `uk-economics-warwick` | 9 | amber→green (9) |
| `uk-electrical-imperial` | 2 | amber→grey (2) |
| `uk-engineering-bath` | 2 | amber→green (2) |
| `uk-engineering-birmingham` | 20 | red→amber (20) |
| `uk-engineering-bristol` | 25 | red→amber (12), red→grey (8), amber→green (3), amber→grey (1), green→grey (1) |
| `uk-engineering-durham` | 25 | red→amber (12), red→grey (8), amber→green (3), amber→grey (1), green→grey (1) |
| `uk-engineering-edinburgh` | 24 | red→amber (15), red→grey (5), amber→green (4) |
| `uk-engineering-glasgow` | 4 | amber→green (4) |
| `uk-engineering-leeds` | 4 | amber→green (4) |
| `uk-engineering-ucl` | 3 | amber→green (3) |
| `uk-engineering-warwick` | 3 | amber→green (3) |
| `uk-finance-lse` | 3 | amber→grey (3) |
| `uk-history-oxford` | 4 | amber→green (4) |
| `uk-law-birmingham` | 40 | amber→red (28), grey→red (7), amber→green (4), grey→amber (1) |
| `uk-law-bristol` | 38 | amber→red (21), grey→red (14), amber→green (3) |
| `uk-law-cambridge` | 38 | amber→red (15), grey→red (20), amber→green (3) |
| `uk-law-durham` | 38 | amber→red (21), grey→red (14), amber→green (3) |
| `uk-law-exeter` | 39 | amber→red (28), grey→red (7), amber→green (4) |
| `uk-law-glasgow` | 39 | amber→red (25), grey→red (10), amber→green (4) |
| `uk-law-kcl` | 38 | amber→red (21), grey→red (14), amber→green (3) |
| `uk-law-lse` | 39 | amber→red (21), grey→red (14), amber→green (3), amber→grey (1) |
| `uk-law-manchester` | 6 | amber→grey (5), green→grey (1) |
| `uk-law-oxford` | 39 | amber→red (25), grey→red (10), amber→green (4) |
| `uk-law-ucl` | 38 | amber→red (18), grey→red (17), amber→green (3) |
| `uk-law-warwick` | 40 | amber→red (25), grey→red (10), amber→green (3), amber→grey (1), green→grey (1) |
| `uk-maths-oxford` | 20 | red→amber (8), red→grey (12) |
| `uk-maths-standrews` | 24 | red→green (6), red→grey (11), green→grey (4), red→amber (3) |
| `uk-mechanical-imperial` | 3 | amber→green (1), amber→grey (1), green→grey (1) |
| `uk-medicine-birmingham` | 11 | grey→green (1), red→amber (9), red→grey (1) |
| `uk-medicine-bristol` | 10 | red→amber (8), red→grey (2) |
| `uk-medicine-cambridge` | 10 | red→amber (3), red→grey (7) |
| `uk-medicine-edinburgh` | 10 | red→amber (7), red→grey (3) |
| `uk-medicine-imperial` | 2 | green→grey (1), amber→grey (1) |
| `uk-medicine-leeds` | 1 | amber→grey (1) |
| `uk-medicine-manchester` | 11 | red→amber (8), red→grey (2), grey→amber (1) |
| `uk-medicine-oxford` | 10 | red→amber (5), red→grey (5) |
| `uk-naturalsciences-cambridge` | 20 | red→amber (7), red→grey (13) |
| `uk-nursing-kcl` | 15 | amber→green (5), red→amber (10) |
| `uk-physics-durham` | 2 | amber→green (2) |
| `uk-physics-imperial` | 2 | amber→grey (2) |
| `uk-politics-lse` | 26 | amber→green (16), amber→red (7), grey→red (3) |
| `uk-ppe-oxford` | 29 | amber→green (16), red→amber (6), red→grey (4), amber→grey (3) |
| `uk-psychology-edinburgh` | 25 | amber→green (15), amber→red (5), grey→red (5) |
| `uk-psychology-kcl` | 25 | amber→green (15), amber→red (6), grey→red (4) |
| `uk-psychology-manchester` | 30 | amber→green (20), amber→red (8), grey→red (2) |

## Engine-design note for the owner: removing stand-in preferred subjects exposes the field-core guard

`classify()` in `main.js` runs its field-relevance guard only when a course
would otherwise be **green**. A course with any missing preferred subject
stops at amber first.

Before the migration, many courses held stand-in preferred subjects that
their page does not name (e.g. History and English for Law). A student
without those subjects therefore got **amber**, and the guard never ran.
With the stand-ins removed, the same student reaches green, and the guard
then demotes them. A student with **none** of the field's core subjects
goes to **red** ("weak — not a match").

Example: Cambridge Law officially requires no particular subjects. In
the synthetic grid, a Maths/Chemistry/Biology A-Level profile used to get
amber there and now gets red, because none of its subjects are in the law
core group (English, History, Politics, Philosophy, Sociology).

The migration did not change `main.js`. The owner should decide whether a
course whose page states "no subject requirements" should be exempt from
the guard, or capped at amber instead of red. That is a matching-logic
change, separate from this data migration.

## Owner flags raised by the migration

- `uk-bioengineering-imperial`: the official offer is a range starting at
  A\*AA, and the engine keeps AAA, which is below it.
- `uk-economics-leeds`, `uk-medicine-birmingham`, `uk-medicine-glasgow`:
  the A-Level and IB routes require different subjects, but the engine's
  essential list is shared across systems.
  - Leeds Economics and Birmingham Medicine: the IB-only requirement is
    display-only.
  - Glasgow Medicine: the engine keeps Biology essential, which the
    international A-Level and IB routes require, but the UK A-Level route
    does not.
- `uk-medicine-manchester`: the essential list is now empty (the page
  requires "Biology or Chemistry" plus another science, a one-of rule).
  The medicine field-core guard still checks Chemistry and Biology.
- The engine's free-text `notes` field on many migrated courses still
  describes the old values. It was not part of the migration.
- **UCL reader gaps:** the reader's text omits the IB and English-language
  tabs on several UCL course pages, so these rows were left unverified,
  each with a browser re-check flag:
  - IB rows for Law, Architecture, Psychology and Pharmacy;
  - English-language rows for Architecture, Psychology, Pharmacy and Maths.

All per-row flags are listed in `docs/requirements-review.md` under
"Flags for the data owner".

## Reproduce

    npm i --no-save playwright-core axe-core
    node scripts/verify-pass/matching/hash.mjs . 8731
    node scripts/verify-pass/matching/grid.mjs <origin/main worktree> 8732 before.json
    node scripts/verify-pass/matching/grid.mjs . 8733 after.json
    node scripts/verify-pass/matching/shifts.mjs before.json after.json
    node scripts/verify-pass/matching/axe.mjs . 8734
