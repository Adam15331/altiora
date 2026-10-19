# Admissions requirements — changelog

Audit trail for `data/requirements/`. Add an entry for **every** data change:
date, cycle, course id(s), category, what changed, and the source checked.
`npm run new-cycle` appends its own entries.

Format:

    ## YYYY-MM-DD — <cycle label> — <short title>
    - `<course-id>` · <Category>: <old> → <new> (status → verified). Source: <url>

## 2026-10-19 — 2027 entry — central requirements data created

- Created `data/requirements/config.js` (cycles, current cycle, six Phase 1
  categories) and `data/requirements/2027.js` (320 courses × 6 categories)
  with `scripts/migrate-requirements-2027.mjs`. No web research; nothing invented.
- Carried across with their existing official source and check date:
  admissions tests and subject prerequisites (from each course's
  verification record), AP requirements (from the AP records' own source
  and date), Hong Kong DSE requirements (course record).
- Marked **partial**: the 4 CUHK courses whose records are partial, and 8
  courses verified only on a qualification-route-specific page (McGill ×4,
  Waterloo ×2, Dalhousie, SUTD); AP records whose own status is partial.
- Marked **unverified**: every SAT/ACT entry (the US test-policy table has no
  source or date — its policy is kept as a "previously recorded" value for
  review; the admitted-student SAT/ACT ranges are not requirements and were
  not carried across), every English-language entry and every
  other-requirements entry (no structured data existed).
- A-Level and IB requirements deliberately not included (Phase 2).
