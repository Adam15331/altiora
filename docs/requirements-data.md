# Admissions requirements data

Every course card shows an **Entry requirements** panel for the current
admissions cycle (e.g. "2027 entry"): one row per requirement category, each
with its verification status, the date it was last verified, and links to the
official source(s). This document is how that data is structured and kept up
to date.

## Where things live

| File | What it is |
|---|---|
| `data/requirements/config.js` | The current cycle, every cycle that exists, and the requirement categories (in display order). |
| `data/requirements/<year>.js` | One file per admissions cycle — the requirements for every course. **The source of truth for the panel.** |
| `data/requirements/CHANGELOG.md` | Audit trail: every change, with date, course, category and source. |
| `docs/requirements-review.md` | Generated list of everything not verified or partly verified, with reviewer hints. |
| `requirements-view.js` | Renders the panel. Holds no requirement values — change data, never this file, to update requirements. |

No requirement value or category label is hard-coded in the UI.

## The schema

A cycle file holds, for **every** course id in `data/courseRequirements.js`,
an entry for **every** category in `config.categories`:

```js
"uk-maths-bristol": {
  "satAct":               {"status":"unverified"},
  "admissionsTests":      {"status":"verified","items":["STEP — optional; a good result can lower the offer"],"codes":["STEP"],
                           "sources":[{"url":"https://www.bristol.ac.uk/…","label":"Official source"}],"lastVerified":"2026-08-16"},
  …
}
```

| Field | Rule |
|---|---|
| `status` | `verified`, `partial`, `unverified` — or, for A-Level / IB only, `notApplicable`. |
| `items` | The requirement as published, one statement per string. Verified/partial only. |
| `none: true` | The official source was checked and lists nothing in this category. Use instead of `items`. |
| `codes` | Machine codes — admissions test codes / subject tags. Cross-checked against `data/courseRequirements.js` (see below). |
| `sources` | At least one `{url, label}` for verified/partial. Official university, programme or test-provider pages only. |
| `lastVerified` | `YYYY-MM-DD`, the day you checked the source. Required for verified/partial; never in the future. |
| `note` | Caveat. **Required for partial** — say exactly what is unconfirmed. |
| `recorded` | Unverified only: a value previously held without (current) verification, shown as "Previously recorded, not verified". |

An **unverified** entry may not carry `items`, `none`, `sources`, `lastVerified`
or `codes` — it cannot look verified. Students see **Not verified — check the
official course page**.

Categories: SAT / ACT · English language · Admissions tests · Subject
prerequisites · A-Level requirements · IB requirements · Other qualifications
(AP, Hong Kong DSE) · Other requirements (interviews, portfolios).

### A-Level and IB (qualification categories)

`aLevel` and `ib` have `kind: 'qualification'` in the config. Their entries
use structured fields instead of `items` / `none` / `codes`:

```js
"aLevel": {"status":"verified","accepted":"yes","typicalOffer":"A*AA",
           "subjects":{"required":[{"name":"Chemistry","code":"Chemistry"},{"name":"Biology","code":"Biology"}],
                       "preferred":[{"name":"Physics","code":"Physics"}]},
           "sources":[{"url":"https://www.medsci.ox.ac.uk/…","label":"Official source"}],"lastVerified":"2026-06-23"},
"ib":     {"status":"verified","accepted":"yes","overallScore":39,
           "subjects":{"required":[…],"preferred":[…],"higherLevel":[{"name":"Chemistry","code":"Chemistry"},…]},
           "detail":"766 at HL","sources":[…],"lastVerified":"2026-06-23"}
```

| Field | Rule |
|---|---|
| `accepted` | `yes` (verified/partial), `no` (notApplicable only), `unknown` (unverified only, optional). |
| `typicalOffer` | A-Level grades exactly as `grades.aLevels` holds them. Shown as "Grades". |
| `overallScore` | IB points, a whole number 1–45, exactly as `grades.ib`. Shown as "Overall score". |
| `subjects` | Any of `required`, `preferred`, `excluded`, `higherLevel`, `standardLevel`; each a non-empty list of `{name, code}`. `name` is the qualification's own subject name; `code` is the engine's subject tag. Leave a group out when there are none. |
| `detail` | Subject-grade detail verbatim from `grades.ibHLNote` (e.g. "766 at HL"). Shown as "Subject grades". |
| `practicalEndorsement`, `contextualOffer`, `coreNote` (TOK / EE / CAS), `testsInterview` | Free text, only when the official source states it. None are populated yet — the repo holds no structured data for them. |
| `withheld` | Values the engine holds that are deliberately **not shown** (`typicalOffer`, `overallScore`, `detail`) — e.g. an IB note that quotes admitted-student figures, which are not requirements. Needs a `note` saying why; the panel shows "Not shown — see note". |

`notApplicable` means the official source was checked and the qualification
is not an entry route (e.g. a graduate-entry law or medicine programme). It
needs `accepted: "no"`, a source, a date and a `note`, and carries no values.
A verified/partial entry that holds no grade shows "Not recorded" — absent
data is never shown as a value.

How the 2027 entries were made (`scripts/migrate-requirements-2027-qualifications.mjs`):
values come only from the engine's structured fields; status, source and date
come from the course's verification record (as Phase 1 did for subject
prerequisites). A record verified only on one qualification route's page
(an IB-applicants page, an A-Level page) keeps that qualification verified and
makes the other partial. A course the engine holds nothing for is unverified.

## Checks

```
npm install        # once — dev tooling only; the site itself has no build step
npm run validate   # data rules (below) — fails on any error
npm run report     # regenerate docs/requirements-review.md
npm test           # unit tests: schema, validator, renderer, cycle tooling
npm run check      # lint + typecheck + validate + test (what CI runs)
```

`npm run validate` fails when:

- the current cycle has no record for a course, or a record misses a category;
- a verified/partial entry has no source, no date, a malformed or future date,
  or neither `items` nor `none`; a partial entry has no `note`;
- an A-Level / IB entry is missing, has no value (verified/partial), has a
  malformed field (`overallScore` outside 1–45, an unknown subject group, a
  subject without `name`/`code`), withholds a value without a note, or is
  `notApplicable` without `accepted: "no"`, a source, a date and a note;
- an unverified entry carries a value, source or date;
- the config has no `aLevel` or `ib` category (the engine reads both);
- (current cycle) admissions tests, subject prerequisites, or any A-Level / IB
  value (offer, points, Higher Level subjects, IB note, required / preferred
  subjects) disagrees with `data/courseRequirements.js`, which the matching
  engine still reads — update both until the engine moves onto this data. A
  withheld value must still exist in the engine; a `notApplicable` entry fails
  while the engine holds an offer for that qualification;
- `app.html` does not load the current cycle's file;
- `docs/requirements-review.md` is out of date.

It warns (does not fail) when an entry was last verified over 18 months ago.
CI (`.github/workflows/checks.yml`) runs `npm run check` on every push and pull request.

## Fixing a single requirement

1. Open the official source. Do not use third-party sites, forums or memory.
2. Edit the course's line in `data/requirements/<current year>.js`: set
   `status`, `items` (or `none: true`), `sources`, `lastVerified` (today), and
   `note` if anything is unconfirmed. Remove any `recorded`.
3. If you changed admissions tests, subject prerequisites, or an A-Level / IB
   value, make the same change in `data/courseRequirements.js` (and check the
   matching results — the engine reads that file).
4. Add an entry to `data/requirements/CHANGELOG.md`.
5. `npm run report && npm run check`, then commit.
6. Bump the `?v=` on the cycle file's `<script>` tag in `app.html` so browsers
   fetch the new data.

If you cannot verify something, leave it `unverified` — never fill it in.

### Updating an A-Level or IB requirement

1. Use the university's page for that qualification (A-Level / international
   entry page, IB applicants page) or the course page — the official source only.
2. Edit the course's `aLevel` or `ib` line: `typicalOffer` / `overallScore`
   as published, the `subjects` groups with the qualification's own subject
   names and the engine's tag as `code`, `detail` for subject grades, and the
   optional practical-endorsement / contextual-offer / TOK-EE-CAS /
   tests-interview fields only if the source states them. Set `status`,
   `sources`, `lastVerified`, and `note` for anything unconfirmed.
3. Make the same change in `data/courseRequirements.js` (`grades.aLevels`,
   `grades.ib`, `grades.ibHL`, `grades.ibHLNote`, `requirements`), otherwise
   `npm run validate` fails — and the matching results change with it.
4. Admitted-student ranges and averages are **not** requirements: never put
   them in `typicalOffer`, `overallScore` or `detail`. If the engine still
   holds one, list the field in `withheld` with a note.
5. Not an entry route (graduate-entry)? Use `notApplicable` with the reason.
   Changelog, `npm run report && npm run check`, bump the cycle file's `?v=`.

## The annual update

Requirements change every year. Each year (for UK entry, once universities
publish the next year's course pages — typically spring):

1. **Draft the new cycle** — `npm run new-cycle -- 2028`. This creates
   `data/requirements/2028.js` with every entry — A-Level and IB included, and
   `notApplicable` ones too — reset to `unverified` (the previous value kept
   as `recorded`, e.g. "A*AA; Required subjects: Chemistry (2027 entry,
   verified 23 Jun 2026)") and registers 2028 in the config. The site keeps
   showing the current cycle.
2. **Verify** — work through `docs/requirements-review.md` (regenerate it with
   `npm run report`), re-checking every requirement against the official
   source, as in "Fixing a single requirement". Log each change in the changelog.
3. **Switch** — `npm run new-cycle -- 2028 --make-current`. Sets
   `currentCycle` and points `app.html` at `2028.js`. The UI then labels
   everything "2028 entry".
4. `npm run report && npm run check`, commit, open a pull request.

Old cycle files stay in the repo as the record of what was published for that
year; they are validated for structure but not for coverage.
