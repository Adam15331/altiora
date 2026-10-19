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
| `status` | `verified`, `partial` or `unverified`. |
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

Categories (Phase 1): SAT / ACT · English language · Admissions tests ·
Subject prerequisites · Other qualifications (AP, Hong Kong DSE) · Other
requirements (interviews, portfolios). A-Level and IB are **not** in Phase 1.
They are added in Phase 2 as new categories in `config.categories` plus an
entry per course — the panel, validator and report pick them up with no code
change.

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
- an unverified entry carries a value, source or date;
- (current cycle) admissions tests or subject prerequisites disagree with
  `data/courseRequirements.js`, which the matching engine still reads — update
  both until Phase 2 moves the engine onto this data;
- `app.html` does not load the current cycle's file;
- `docs/requirements-review.md` is out of date.

It warns (does not fail) when an entry was last verified over 18 months ago.
CI (`.github/workflows/checks.yml`) runs `npm run check` on every push and pull request.

## Fixing a single requirement

1. Open the official source. Do not use third-party sites, forums or memory.
2. Edit the course's line in `data/requirements/<current year>.js`: set
   `status`, `items` (or `none: true`), `sources`, `lastVerified` (today), and
   `note` if anything is unconfirmed. Remove any `recorded`.
3. If you changed admissions tests or subject prerequisites, make the same
   change in `data/courseRequirements.js`.
4. Add an entry to `data/requirements/CHANGELOG.md`.
5. `npm run report && npm run check`, then commit.
6. Bump the `?v=` on the cycle file's `<script>` tag in `app.html` so browsers
   fetch the new data.

If you cannot verify something, leave it `unverified` — never fill it in.

## The annual update

Requirements change every year. Each year (for UK entry, once universities
publish the next year's course pages — typically spring):

1. **Draft the new cycle** — `npm run new-cycle -- 2028`. This creates
   `data/requirements/2028.js` with every entry reset to `unverified` (the
   previous value kept as `recorded`) and registers 2028 in the config. The
   site keeps showing the current cycle.
2. **Verify** — work through `docs/requirements-review.md` (regenerate it with
   `npm run report`), re-checking every requirement against the official
   source, as in "Fixing a single requirement". Log each change in the changelog.
3. **Switch** — `npm run new-cycle -- 2028 --make-current`. Sets
   `currentCycle` and points `app.html` at `2028.js`. The UI then labels
   everything "2028 entry".
4. `npm run report && npm run check`, commit, open a pull request.

Old cycle files stay in the repo as the record of what was published for that
year; they are validated for structure but not for coverage.
