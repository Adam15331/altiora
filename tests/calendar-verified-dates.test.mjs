// @ts-check
// "Add to my calendar": a calendar event must sit ON OR BEFORE the real date it stands for. An event
// after the real date is worse than no event — the student would act too late.
//
// The fixtures below are the exact dates recorded as VERIFIED in the header comment of
// data/admissionTestInfo.js (each names the header words it was read from, and the test checks those
// words are still in the header). No date here comes from anywhere else. Where the header holds no
// exact day for an event, the event is listed in NO_EXACT_DATE instead, so nothing is left unchecked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT } from '../scripts/lib/requirements-io.mjs';

const require = createRequire(import.meta.url);
const C = require('../calendar-export.js');
const { admissionTestInfo: T } = require('../data/admissionTestInfo.js');
const source = fs.readFileSync(path.join(ROOT, 'data/admissionTestInfo.js'), 'utf8');
// The header comment, with its " * " line prefixes and line breaks folded away so a phrase can be found in it.
const HEADER = source.slice(0, source.indexOf('const admissionTestInfo')).replace(/\n\s*\*\s?/g, ' ').replace(/\s+/g, ' ');

const UAT = 'TMUA / ESAT / TARA — esat-tmua.ac.uk (UAT UK)';
/**
 * Verified real dates, by test and event type. `date` is the first day of the real thing the event
 * stands for; `from` is the header's own wording for it.
 * @type {Record<string, Partial<Record<'reg-open'|'reg-close'|'test-window', {date: string, section: string, from: string}>>>}
 */
export const VERIFIED = {
  UCAT: {
    'reg-open': { date: '2026-05-20', section: 'UCAT — ucat.ac.uk', from: 'registration opened 20 May 2026' },
    'reg-close': { date: '2026-09-16', section: 'UCAT — ucat.ac.uk', from: 'deadline 16 Sep' },
    'test-window': { date: '2026-07-13', section: 'UCAT — ucat.ac.uk', from: 'test window 13 Jul–24 Sep 2026' },
  },
  TMUA: {
    'reg-open': { date: '2026-07-20', section: UAT, from: 'registration opens 20 Jul 2026' },
    'reg-close': { date: '2026-09-28', section: UAT, from: 'deadline 28 Sep 2026' },
    'test-window': { date: '2026-10-12', section: UAT, from: 'sittings 12–16 Oct 2026' },
  },
  ESAT: {
    'reg-open': { date: '2026-07-20', section: UAT, from: 'registration opens 20 Jul 2026' },
    'reg-close': { date: '2026-09-28', section: UAT, from: 'deadline 28 Sep 2026' },
    'test-window': { date: '2026-10-12', section: UAT, from: 'sittings 12–16 Oct 2026' },
  },
  TARA: {
    'reg-open': { date: '2026-07-20', section: UAT, from: 'registration opens 20 Jul 2026' },
    'reg-close': { date: '2026-09-28', section: UAT, from: 'deadline 28 Sep 2026' },
    'test-window': { date: '2026-10-12', section: UAT, from: 'sittings 12–16 Oct 2026' },
  },
  // The header gives LNAT's days without a year; they are read in the header's own cycle (checked 2026).
  LNAT: {
    'reg-open': { date: '2026-08-01', section: 'LNAT — lnat.ac.uk', from: 'registration/booking opens 1 Aug' },
    'test-window': { date: '2026-09-01', section: 'LNAT — lnat.ac.uk', from: 'testing from 1 Sep' },
  },
  STEP: {
    'reg-open': { date: '2026-03-01', section: 'STEP — ocr.org.uk', from: 'entries open 1 Mar 2026' },
    'reg-close': { date: '2026-05-04', section: 'STEP — ocr.org.uk', from: 'deadline 4 May 2026' },
    'test-window': { date: '2026-06-04', section: 'STEP — ocr.org.uk', from: 'STEP 2 on 4 Jun' },
  },
};

/** Events the site produces for which the header records no exact day (so there is nothing to compare). */
export const NO_EXACT_DATE = {
  'MCAT reg-open': 'registration opened late Oct 2025 for the 2026 dates',
  'MCAT test-window': '31 dates Jan–Sep 2026',
};

/** YYYYMMDD → days since the epoch (UTC). @param {string} ymd */
const day = ymd => Date.UTC(Number(ymd.slice(0, 4)), Number(ymd.slice(4, 6)) - 1, Number(ymd.slice(6, 8))) / 86400000;
const compact = (/** @type {string} */ iso) => iso.replace(/-/g, '');

/**
 * Every event of every test, in the cycle the header's dates belong to: application year 2026, or 2025
 * for a test sat after offers (its events fall in the year after applying) and for a test whose header
 * dates open in late 2025 (MCAT).
 * @param {typeof VERIFIED} verified
 */
export function rows(verified = VERIFIED) {
  /** @type {Array<{test: string, type: string, title: string, event: string, text: string, phrase: string, rule: string, real: string | null, from: string | null, margin: number | null}>} */
  const out = [];
  for (const [code, info] of Object.entries(T)) {
    const fixtures = verified[code] ?? {};
    const years = Object.values(fixtures).map(f => Number(f.date.slice(0, 4)));
    const year = years.length ? years[0] : 2026;
    const applicationYear = year - (info.requiredStatus === 'offer-condition' ? 1 : 0);
    for (const e of C.eventsForTest(code, info, applicationYear)) {
      const f = fixtures[/** @type {'reg-open'|'reg-close'|'test-window'} */ (e.type)] ?? null;
      out.push({ test: code, type: e.type, title: e.summary, event: e.date, text: e.source.text, phrase: e.source.phrase, rule: e.source.rule,
        real: f ? compact(f.date) : null, from: f ? f.from : null, margin: f ? day(compact(f.date)) - day(e.date) : null });
    }
  }
  return out;
}

test('fixtures: every verified date is quoted from the header of data/admissionTestInfo.js', () => {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (const [code, byType] of Object.entries(VERIFIED)) {
    assert.ok(T[code], `${code} is a test the site holds`);
    for (const [type, f] of Object.entries(byType)) {
      assert.ok(HEADER.includes(f.section), `${code} ${type}: header section "${f.section}"`);
      assert.ok(HEADER.includes(f.from), `${code} ${type}: the header no longer says "${f.from}"`);
      // The words belong to that test's own section of the header (up to the next test's section).
      const section = HEADER.slice(HEADER.indexOf(f.section));
      const end = section.slice(f.section.length).search(/\b[A-Z]{4}(?: \/ [A-Z]{4})* — [a-z-]+(\.[a-z-]+)+/);
      assert.ok((end === -1 ? section : section.slice(0, f.section.length + end)).includes(f.from), `${code} ${type}: "${f.from}" is in the ${f.section} section`);
      // The fixture's day and month are the ones in those words.
      const [, , m, d] = /** @type {RegExpExecArray} */ (/^(\d{4})-(\d{2})-(\d{2})$/.exec(f.date));
      // ("12–16 Oct": the first day of a range.)
      assert.ok(new RegExp(`\\b${Number(d)}(?:–\\d{1,2})? ${MONTHS[Number(m) - 1]}\\b`).test(f.from), `${code} ${type}: ${f.date} is not the date in "${f.from}"`);
    }
  }
  for (const [key, words] of Object.entries(NO_EXACT_DATE)) assert.ok(HEADER.includes(words), `${key}: the header no longer says "${words}"`);
});

test('no registration or test-window event falls after its verified real date', () => {
  const all = rows();
  assert.ok(all.length >= 19, `only ${all.length} events`);
  for (const r of all) {
    assert.ok(['reg-open', 'reg-close', 'test-window'].includes(r.type), `${r.test}: unexpected event type ${r.type}`);
    if (r.real === null) {
      // Nothing exact on file: it must be a known gap, never an event that slipped in unchecked.
      assert.ok(`${r.test} ${r.type}` in NO_EXACT_DATE, `${r.test} ${r.type} (${r.event}) has no verified date and is not listed in NO_EXACT_DATE`);
      continue;
    }
    assert.equal(r.event.slice(0, 4), r.real.slice(0, 4), `${r.test} ${r.type}: event year ${r.event} vs verified ${r.real}`);
    assert.ok(/** @type {number} */ (r.margin) >= 0,
      `${r.test} ${r.type}: the event is on ${r.event}, ${-/** @type {number} */ (r.margin)} day(s) AFTER the verified date ${r.real} ("${r.from}"; window text "${r.phrase}", ${r.rule})`);
  }
  // Every fixture was used: none is left comparing against nothing.
  for (const [code, byType] of Object.entries(VERIFIED)) for (const type of Object.keys(byType)) {
    assert.ok(all.some(r => r.test === code && r.type === type), `${code} ${type}: a verified date but no event`);
  }
  for (const key of Object.keys(NO_EXACT_DATE)) assert.ok(all.some(r => `${r.test} ${r.type}` === key), `${key}: listed as a gap but no such event`);
  // The shared UAT UK registration events (one for TMUA, ESAT and TARA) carry the same dates.
  const uat = C.eventsForGroup(['TMUA', 'ESAT', 'TARA'].map(code => ({ code, info: T[code] })), 2026);
  for (const e of uat) {
    const f = VERIFIED.TMUA[/** @type {'reg-open'|'reg-close'|'test-window'} */ (e.type)];
    assert.ok(f && e.date <= compact(f.date), `UAT UK ${e.type} ${e.date}`);
  }
});

test('the rule has teeth: a verified date one week earlier than recorded is caught', () => {
  // TMUA's first sitting is recorded as 12 Oct 2026; the event is on 10 Oct. Were the real date 5 Oct, the event would be late.
  const moved = JSON.parse(JSON.stringify(VERIFIED));
  moved.TMUA['test-window'].date = '2026-10-05';
  const late = rows(moved).filter(r => r.margin !== null && r.margin < 0);
  assert.deepEqual(late.map(r => [r.test, r.type, r.event, r.real, r.margin]), [['TMUA', 'test-window', '20261010', '20261005', -5]]);
  assert.deepEqual(rows().filter(r => r.margin !== null && r.margin < 0), []);
});
