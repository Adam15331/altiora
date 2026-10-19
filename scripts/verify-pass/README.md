# Verification-pass tooling

Developer tools for checking `data/requirements/<cycle>.js` rows against
official pages. Nothing here runs on the site or in `npm run check`.

| Tool | What it does |
|---|---|
| `fetch.py <url>…` | Saves the page to `$VERIFY_PAGES` (default `./pages`) as `<sha1(url)[:10]>.txt`: `URL:`/`STATUS:` headers, then one block-level element per line. PDFs go through `pdftotext`. Run with `python3 -I`. |
| `verify.mjs <batch>` | Every quote must appear verbatim in its own source's saved page (excerpts joined with "…" are checked separately). Rows dated before `config.snippetsRequiredFrom` may only gain a `reviewFlag` or move verified → partial with a note. |
| `engine-check.mjs <batch>` | Applies the batch in memory and runs the repo validator (schema, provenance, engine lock). |
| `apply.mjs <batch> <changes.json>` | Writes the rows via `writeCycle` and records old → new. |
| `changelog.mjs <changes.json> "<title>"` | Appends old → new, URL, date and quote to `data/requirements/CHANGELOG.md`. |
| `land.sh <batch> "<title>"` | verify → engine-check → apply → report → `npm run check` → changelog → commit; restores `data/` and `docs/` on any failure. Set `COAUTHOR` / `SESSION_TRAILER` for the commit trailers. |
| `summary.mjs <COUNTRY>` | Status counts per category; ✓* = verified but dated before the snippet cutoff (kept, not re-checked). |

A batch is JSON: `{ "courses": [id…], "rows": [{ "id", "cat", "entry" }], "perCourse": { id: "one-line summary" } }`.
`entry` replaces the row whole. Land one university per commit, after a
human has reviewed every row.
