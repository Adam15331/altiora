// Shared helpers for the verification-pass tools (scripts/verify-pass/).
// A batch is JSON: { courses: string[], rows: Row[], perCourse: { [id]: string } }
//   Row = { id, cat, entry }  — `entry` replaces cycle.courses[id][cat] whole.
// `perCourse` holds the reviewer's one-line summary per course (commit body).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const PAGES = process.env.VERIFY_PAGES || 'pages';

export function readBatch(file) {
  const b = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(b.rows)) throw new Error(`${file}: batch has no rows[]`);
  b.courses ??= [...new Set(b.rows.map(r => r.id))];
  b.perCourse ??= {};
  return b;
}

export const pageKey = url => crypto.createHash('sha1').update(url).digest('hex').slice(0, 10);

/** The saved text of a fetched page, or null. */
export function pageText(url) {
  const p = path.join(PAGES, `${pageKey(url)}.txt`);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

/** Normalise for verbatim comparison: whitespace, curly quotes and dashes. */
export function norm(s) {
  return s.replace(/[\u2018\u2019\u02bc]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Snippets as one string per source. */
export const snippets = e => e.sourceSnippet == null ? [] : Array.isArray(e.sourceSnippet) ? e.sourceSnippet : [e.sourceSnippet];
