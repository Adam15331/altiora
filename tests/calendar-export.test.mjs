// @ts-check
// "Add to my calendar" (calendar-export.js): dates read from the stored
// windows, the .ics format (CRLF, folding, escaping, stable UIDs), the
// past-window skip, the after-offers year, and the Google links.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('../calendar-export.js');
const { admissionTestInfo: T } = require('../data/admissionTestInfo.js');

const tests = (/** @type {string[]} */ codes) => codes.map(code => ({ code, info: T[code] }));
const NOW = new Date(Date.UTC(2026, 10, 15, 11, 0, 0));

test('dates: the first day each stored window can start', () => {
  assert.deepEqual(C.windowStart('~20 July, deadline late September'), { month: 7, day: 20, phrase: '~20 July', rule: 'the stated day' });
  const at = (/** @type {string} */ t) => { const w = C.windowStart(t); assert.ok(w, t); return w; };
  assert.equal(at('late September').day, 20);                      // "late" → the 20th
  assert.equal(at('~mid-May (booking from late June)').day, 10);   // "mid" → the 10th
  assert.deepEqual([at('papers in early–mid June').month, at('papers in early–mid June').day], [6, 1]);
  assert.equal(at('~31 dates January–September').day, 1);          // month only → the 1st
  assert.equal(C.windowStart('year-round — register ~6–8 weeks before your chosen date'), null);
});

test('events: only what the stored text states (LNAT has no stated deadline)', () => {
  const lnat = C.eventsForTest('LNAT', T.LNAT, 2027).map(e => `${e.type} ${e.date}`);
  assert.deepEqual(lnat, ['reg-open 20270801', 'sit 20270901']);
  const tmua = C.eventsForTest('TMUA', T.TMUA, 2027).map(e => `${e.type} ${e.date}`);
  assert.deepEqual(tmua, ['reg-open 20270720', 'reg-close 20270920', 'sit 20271010']);
  assert.deepEqual(C.eventsForTest('LSAT', T.LSAT, 2027), []);       // no usable month: no event
  const titles = C.eventsForTest('TMUA', T.TMUA, 2027).map(e => e.summary);
  assert.deepEqual(titles, ['Registration opens: TMUA (typical window)', 'Registration closes: TMUA (typical window)', 'Sit TMUA (typical window)']);
});

test('after offers: an offer-condition test (STEP) falls in the year after the application year', () => {
  assert.equal(T.STEP.requiredStatus, 'offer-condition');
  assert.deepEqual(C.eventsForTest('STEP', T.STEP, 2026).map(e => e.date), ['20270301', '20270501', '20270601']);
  assert.deepEqual(C.eventsForTest('UCAT', T.UCAT, 2026).map(e => e.date.slice(0, 4)), ['2026', '2026', '2026']);
});

test('past windows are skipped, never rolled forward to next year', () => {
  const p = C.calendarEvents({ tests: tests(['UCAT', 'TMUA', 'STEP']), applicationYear: 2026, today: '20261115' });
  assert.deepEqual(p.events.map(e => `${e.test} ${e.type} ${e.date}`), ['STEP reg-open 20270301', 'STEP reg-close 20270501', 'STEP sit 20270601']);
  assert.equal(p.past.length, 6);
  assert.ok(p.events.every(e => e.date >= '20261115'));
  assert.ok(!p.events.some(e => e.date.startsWith('2027') && e.test !== 'STEP'));
  // A window on today's date is still upcoming.
  assert.equal(C.calendarEvents({ tests: tests(['LNAT']), applicationYear: 2027, today: '20270801' }).events.length, 2);
  // Everything passed: no events, but the tests still had windows (→ "No upcoming test windows to add.").
  const gone = C.calendarEvents({ tests: tests(['UCAT']), applicationYear: 2026, today: '20261115' });
  assert.deepEqual([gone.events.length, gone.withWindows], [0, 1]);
  // A code with no stored info is ignored.
  assert.equal(C.calendarEvents({ tests: [{ code: 'X', info: undefined }], applicationYear: 2027, today: '20261115' }).withWindows, 0);
});

test('every event says it is a typical window, with the official link and the app link', () => {
  const all = Object.keys(T).flatMap(k => C.eventsForTest(k, T[k], 2027));
  assert.ok(all.length > 10);
  for (const e of all) {
    assert.ok(e.summary.endsWith(' (typical window)'), e.summary);
    assert.equal(e.description, `${C.NOT_CONFIRMED}\n${T[e.test].officialUrl}\nhttps://usealtiora.com/app.html`);
  }
  assert.equal(C.NOT_CONFIRMED, 'This is the typical window, not a confirmed date. Check the exact date on the official test site before relying on it.');
  const ics = C.buildIcs(all, { now: NOW });
  const unfolded = ics.replace(/\r\n /g, '');
  assert.equal(unfolded.split('BEGIN:VEVENT').length - 1, all.length);
  assert.equal(unfolded.split('This is the typical window\\, not a confirmed date. Check the exact date on the official test site before relying on it.').length - 1, all.length);
});

test('ics: CRLF only, every line at most 75 octets, folded lines rejoin exactly', () => {
  const events = C.eventsForTest('UCAT', T.UCAT, 2027);
  const ics = C.buildIcs(events, { now: NOW });
  assert.ok(ics.endsWith('\r\n'));
  assert.ok(!/[^\r]\n/.test(ics), 'bare LF');
  const lines = ics.split('\r\n').slice(0, -1);
  for (const l of lines) assert.ok(Buffer.byteLength(l, 'utf8') <= 75, l);
  assert.ok(lines.some(l => l.startsWith(' ')), 'something was folded');
  // Multi-byte characters are never split across a fold.
  const folded = C.foldLine(`SUMMARY:${'é'.repeat(60)}`);
  for (const l of folded.split('\r\n')) assert.ok(Buffer.byteLength(l, 'utf8') <= 75);
  assert.equal(folded.replace(/\r\n /g, ''), `SUMMARY:${'é'.repeat(60)}`);
  assert.match(ics, /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:-\/\/Altiora\/\/Admission test windows\/\/EN\r\n/);
  assert.match(ics, /\r\nDTSTAMP:20261115T110000Z\r\n/);
  assert.match(ics, /\r\nDTSTART;VALUE=DATE:20270510\r\nDTEND;VALUE=DATE:20270511\r\n/);
  assert.match(ics, /\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nTRIGGER:-P7D\r\n/);
});

test('ics: commas, semicolons, backslashes and newlines are escaped', () => {
  assert.equal(C.escapeText('a, b; c\\d\ne'), 'a\\, b\\; c\\\\d\\ne');
  const ics = C.buildIcs([{ ...C.eventsForTest('LNAT', T.LNAT, 2027)[0], summary: 'x; y, z' }], { now: NOW });
  assert.match(ics.replace(/\r\n /g, ''), /\r\nSUMMARY:x\\; y\\, z\r\n/);
});

test('UIDs are stable per test and event type, across years and rebuilds', () => {
  const a = C.eventsForTest('TMUA', T.TMUA, 2026).map(e => e.uid);
  const b = C.eventsForTest('TMUA', T.TMUA, 2027).map(e => e.uid);
  assert.deepEqual(a, ['tmua-reg-open@usealtiora.com', 'tmua-reg-close@usealtiora.com', 'tmua-sit@usealtiora.com']);
  assert.deepEqual(a, b);
  const all = Object.keys(T).flatMap(k => C.eventsForTest(k, T[k], 2027).map(e => e.uid));
  assert.equal(new Set(all).size, all.length);
});

test('Google Calendar link: same title, all-day dates and description', () => {
  const e = C.eventsForTest('STEP', T.STEP, 2026)[0];
  const u = new URL(C.googleCalendarUrl(e));
  assert.equal(`${u.origin}${u.pathname}`, 'https://calendar.google.com/calendar/render');
  assert.equal(u.searchParams.get('action'), 'TEMPLATE');
  assert.equal(u.searchParams.get('text'), 'Registration opens: STEP (typical window)');
  assert.equal(u.searchParams.get('dates'), '20270301/20270302');
  assert.equal(u.searchParams.get('details'), e.description);
  assert.ok(C.googleCalendarUrl(e).includes('&dates=20270301/20270302&'));
});

test('no personal data: the file holds only test names, dates and links', () => {
  const ics = C.buildIcs(C.eventsForTest('UCAT', T.UCAT, 2027), { now: NOW }).replace(/\r\n /g, '');
  const values = ics.split('\r\n').filter(Boolean).map(l => l.slice(l.indexOf(':') + 1));
  const allowed = /^(VCALENDAR|VEVENT|VALARM|2\.0|-\/\/Altiora.*|GREGORIAN|PUBLISH|ucat-[a-z-]+@usealtiora\.com|\d{8}(T\d{6}Z)?|TRANSPARENT|DISPLAY|-P7D|.*UCAT \(typical window\)|This is the typical window.*)$/;
  for (const v of values) assert.match(v, allowed);
});

test('open method: Apple devices get the data: URL, others a dated download', () => {
  const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
  const macSafari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
  const macChrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
  assert.equal(C.openMethod({ userAgent: iphone }), 'data-url');
  assert.equal(C.openMethod({ userAgent: macSafari, platform: 'MacIntel', maxTouchPoints: 0 }), 'data-url');
  assert.equal(C.openMethod({ userAgent: macSafari, platform: 'MacIntel', maxTouchPoints: 5 }), 'data-url'); // iPadOS
  assert.equal(C.openMethod({ userAgent: macChrome, platform: 'MacIntel', maxTouchPoints: 0 }), 'download');
  assert.ok(C.dataUrl('BEGIN:VCALENDAR\r\n').startsWith('data:text/calendar;charset=utf-8,BEGIN%3AVCALENDAR%0D%0A'));
  assert.equal(C.fileName('20261115'), 'altiora-calendar-2026-11-15.ics');
});
