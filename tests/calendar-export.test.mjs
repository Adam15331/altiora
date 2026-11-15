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

// One registration group per test, unless grouped explicitly (main.js passes Applying's groupedTests).
const solo = (/** @type {string[]} */ codes) => codes.map(code => [{ code, info: T[code] }]);
const group = (/** @type {string[]} */ codes) => [codes.map(code => ({ code, info: T[code] }))];
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
  assert.deepEqual(lnat, ['reg-open 20270801', 'test-window 20270901']);
  const tmua = C.eventsForTest('TMUA', T.TMUA, 2027).map(e => `${e.type} ${e.date}`);
  assert.deepEqual(tmua, ['reg-open 20270720', 'reg-close 20270920', 'test-window 20271010']);
  assert.deepEqual(C.eventsForTest('LSAT', T.LSAT, 2027), []);       // no usable month: no event
  const titles = C.eventsForTest('TMUA', T.TMUA, 2027).map(e => e.summary);
  assert.deepEqual(titles, ['Registration opens: TMUA (typical window)', 'Registration closes: TMUA (typical window)', 'TMUA test window opens (typical window)']);
  assert.ok(!Object.keys(T).flatMap(k => C.eventsForTest(k, T[k], 2027)).some(e => /^Sit /.test(e.summary)));
});

test('after offers: an offer-condition test (STEP) falls in the year after the application year', () => {
  assert.equal(T.STEP.requiredStatus, 'offer-condition');
  assert.deepEqual(C.eventsForTest('STEP', T.STEP, 2026).map(e => e.date), ['20270301', '20270501', '20270601']);
  assert.deepEqual(C.eventsForTest('UCAT', T.UCAT, 2026).map(e => e.date.slice(0, 4)), ['2026', '2026', '2026']);
});

test('past windows are skipped, never rolled forward to next year', () => {
  const p = C.calendarEvents({ groups: solo(['UCAT', 'TMUA', 'STEP']), applicationYear: 2026, today: '20261115' });
  assert.deepEqual(p.events.map(e => `${e.test} ${e.type} ${e.date}`), ['STEP reg-open 20270301', 'STEP reg-close 20270501', 'STEP test-window 20270601']);
  assert.equal(p.past.length, 6);
  assert.ok(p.events.every(e => e.date >= '20261115'));
  assert.ok(!p.events.some(e => e.date.startsWith('2027') && e.test !== 'STEP'));
  // A window on today's date is still upcoming.
  assert.equal(C.calendarEvents({ groups: solo(['LNAT']), applicationYear: 2027, today: '20270801' }).events.length, 2);
  // Everything passed: no events, but the tests still had windows (→ "No upcoming test windows or deadlines to add.").
  const gone = C.calendarEvents({ groups: solo(['UCAT']), applicationYear: 2026, today: '20261115' });
  assert.deepEqual([gone.events.length, gone.withWindows], [0, 1]);
  // A code with no stored info is ignored.
  assert.equal(C.calendarEvents({ groups: [[{ code: 'X', info: undefined }]], applicationYear: 2027, today: '20261115' }).withWindows, 0);
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

test('UIDs: per test (or shared provider) and event type, with the event year; identical on re-export', () => {
  const step = C.eventsForTest('STEP', T.STEP, 2026).map(e => e.uid);
  assert.deepEqual(step, ['step-reg-open-2027@usealtiora.com', 'step-reg-close-2027@usealtiora.com', 'step-test-window-2027@usealtiora.com']);
  assert.deepEqual(C.eventsForTest('STEP', T.STEP, 2026).map(e => e.uid), step);                 // re-export: identical
  assert.notDeepEqual(C.eventsForTest('STEP', T.STEP, 2027).map(e => e.uid), step);              // later cycle: new UIDs
  assert.deepEqual(C.eventsForTest('TMUA', T.TMUA, 2027).map(e => e.uid),
    ['uat-uk-reg-open-2027@usealtiora.com', 'uat-uk-reg-close-2027@usealtiora.com', 'tmua-test-window-2027@usealtiora.com']);
  const all = C.calendarEvents({ groups: [...group(['ESAT', 'TARA', 'TMUA']), ...solo(['UCAT', 'LNAT', 'STEP'])], applicationYear: 2027, today: '20270101' });
  const uids = [...all.events, ...all.past].map(e => e.uid);
  assert.equal(new Set(uids).size, uids.length);
  // The shared registration keeps its UID whether one or three of its tests are on the list.
  const one = C.calendarEvents({ groups: group(['TMUA']), applicationYear: 2027, today: '20270101' }).events.find(e => e.type === 'reg-open');
  const three = C.calendarEvents({ groups: group(['ESAT', 'TARA', 'TMUA']), applicationYear: 2027, today: '20270101' }).events.find(e => e.type === 'reg-open');
  assert.equal(one?.uid, three?.uid);
});

test('shared registration: one opens and one closes event naming every test in the group; test windows per test', () => {
  const p = C.calendarEvents({ groups: group(['ESAT', 'TMUA']), applicationYear: 2027, today: '20261115' });
  assert.deepEqual(p.events.map(e => e.summary), [
    'Registration opens: ESAT and TMUA (typical window)',
    'Registration closes: ESAT and TMUA (typical window)',
    'ESAT test window opens (typical window)',
    'TMUA test window opens (typical window)',
  ]);
  assert.deepEqual(p.events.map(e => e.date), ['20270720', '20270920', '20271010', '20271010']);
  assert.equal(p.withWindows, 2);
  // Three tests: "A, B and C"; distinct official links all listed once.
  const three = C.calendarEvents({ groups: group(['ESAT', 'TARA', 'TMUA']), applicationYear: 2027, today: '20261115' }).events[0];
  assert.equal(three.summary, 'Registration opens: ESAT, TARA and TMUA (typical window)');
  assert.equal(three.description, [C.NOT_CONFIRMED, 'https://esat-tmua.ac.uk/', 'https://esat-tmua.ac.uk/about-the-tests/tara/', C.APP_URL].join('\n'));
  // Tests in different groups are never merged, even on the same day.
  const apart = C.calendarEvents({ groups: solo(['ESAT', 'TMUA']), applicationYear: 2027, today: '20261115' });
  assert.equal(apart.events.filter(e => e.type === 'reg-open').length, 2);
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
  const allowed = /^(VCALENDAR|VEVENT|VALARM|2\.0|-\/\/Altiora.*|GREGORIAN|PUBLISH|ucat-[a-z-]+-\d{4}@usealtiora\.com|\d{8}(T\d{6}Z)?|TRANSPARENT|DISPLAY|-P7D|.*UCAT( test window opens)? \(typical window\)|This is the typical window.*)$/;
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

// UK application deadlines: read from Applying's own sentence in main.js, so the two never drift.
import { readFileSync } from 'node:fs';
const UK_SHAPE = /UK: '([^']+)'/.exec(readFileSync(new URL('../main.js', import.meta.url), 'utf8').slice(
  readFileSync(new URL('../main.js', import.meta.url), 'utf8').indexOf('const DEADLINE_SHAPE')))?.[1] ?? '';
const uk = (/** @type {string} */ name, /** @type {string} */ university) => ({ name, university });

test('UK deadlines: the clauses of Applying\'s sentence, at the first day each can start', () => {
  assert.match(UK_SHAPE, /^Medicine, dentistry, veterinary and Oxford\/Cambridge courses typically close in mid-October; most other UK courses in mid-January\./);
  assert.deepEqual(C.deadlineClauses(UK_SHAPE).map(c => [c.who, c.month, c.day]), [
    ['Medicine, dentistry, veterinary and Oxford/Cambridge courses', 10, 10],   // "mid" → the 10th
    ['most other UK courses', 1, 10],                                            // "mid" → the 10th
  ]);
});

test('UK deadlines: which courses close in mid-October', () => {
  assert.equal(C.earlyUkDeadline(uk('Medicine MBChB', 'University of Leeds')), true);
  assert.equal(C.earlyUkDeadline(uk('Computer Science BA', 'University of Oxford')), true);
  assert.equal(C.earlyUkDeadline(uk('Economics BA', 'University of Cambridge')), true);
  assert.equal(C.earlyUkDeadline(uk('Biomedical Sciences BSc', 'University College London')), false);   // medicine category, not named
  assert.equal(C.earlyUkDeadline(uk('Pharmacy MPharm', 'University of Bath')), false);
  assert.equal(C.earlyUkDeadline(uk('Computing MEng', 'Imperial College London')), false);
});

test('UK deadlines: one early-warning event per deadline type the shortlist has (8 Oct, 6 Jan), year in the UID', () => {
  const ev = (/** @type {any[]} */ ukCourses) => C.ukDeadlineEvents({ shape: UK_SHAPE, ukCourses, applicationYear: 2027, cycleStartMonth: 9 });
  const both = ev([uk('Medicine MBChB', 'University of Leeds'), uk('Economics BSc', 'University College London')]);
  assert.deepEqual(both.map(e => [e.uid, e.date, e.summary]), [
    ['uk-deadline-october-2027@usealtiora.com', '20271008', 'UK application deadline coming up (typically mid-October)'],
    ['uk-deadline-january-2028@usealtiora.com', '20280106', 'UK application deadline coming up (typically mid-January)'],
  ]);
  assert.deepEqual(ev([uk('Economics BSc', 'University College London')]).map(e => e.date), ['20280106']);   // no October course: no October event
  assert.deepEqual(ev([uk('Law BA', 'University of Oxford')]).map(e => e.date), ['20271008']);
  assert.deepEqual(ev([]), []);
  assert.deepEqual(C.ukDeadlineEvents({ shape: 'Nothing to read here.', ukCourses: [uk('Law BA', 'X')], applicationYear: 2027, cycleStartMonth: 9 }), []);
  for (const e of both) {
    assert.equal(e.description, 'Check UCAS for the exact date and time of this deadline in your application cycle.\nThis is the typical deadline, not a confirmed date. Confirm the exact date on UCAS and the course page before relying on it.\nhttps://usealtiora.com/app.html');
    assert.match(e.summary, /^UK application deadline coming up \(typically mid-(October|January)\)$/);
    assert.doesNotMatch(e.summary, /Most other UK courses/);
    // An early warning: before the earliest day the stated window can start.
    const clause = C.deadlineClauses(UK_SHAPE).find(c => Number(e.date.slice(4, 6)) === c.month);
    assert.ok(clause && Number(e.date.slice(6)) < clause.day, e.date);
    const ics = C.buildIcs([e], { now: NOW }).replace(/\r\n /g, '');
    assert.match(ics, /\r\nTRIGGER:-P7D\r\n/);
    assert.match(ics, /\r\nDTSTART;VALUE=DATE:\d{8}\r\nDTEND;VALUE=DATE:\d{8}\r\n/);
  }
});

test('UK deadlines: past deadlines are skipped with the tests, never rolled forward', () => {
  const deadlines = C.ukDeadlineEvents({ shape: UK_SHAPE, ukCourses: [uk('Medicine MBChB', 'University of Oxford'), uk('Mathematics BSc', 'Durham University')], applicationYear: 2026, cycleStartMonth: 9 });
  const p = C.calendarEvents({ groups: [], applicationYear: 2026, today: '20261115', deadlines });
  assert.deepEqual(p.events.map(e => e.uid), ['uk-deadline-january-2027@usealtiora.com']);
  assert.deepEqual(p.past.map(e => e.uid), ['uk-deadline-october-2026@usealtiora.com']);
  assert.equal(p.withWindows, 0);   // deadlines are not tests
});

test('UK deadlines: UIDs stay the same per group and year when the copy changes', () => {
  const ev = C.ukDeadlineEvents({ shape: UK_SHAPE, ukCourses: [uk('History BA', 'University of Oxford'), uk('Finance BSc', 'LSE')], applicationYear: 2027, cycleStartMonth: 9 });
  assert.deepEqual(ev.map(e => e.uid), ['uk-deadline-october-2027@usealtiora.com', 'uk-deadline-january-2028@usealtiora.com']);
  assert.deepEqual(C.WARNING_DAY, { 10: 8, 1: 6 });
});
