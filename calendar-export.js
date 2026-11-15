// @ts-check
/* ═══════════════════════════════════════════════════════════════
 * Altiora — calendar-export.js
 *
 * "Add to my calendar": admission-test windows as calendar events.
 * Pure: data in, text out. No network, no DOM, no library. The app
 * (main.js) decides WHICH tests (the Applying checklist's own filtered
 * list) and opens the file; this module only builds it.
 *
 * The app's rule is windows, not dates; a calendar forces a date. So each
 * event sits on the FIRST day the stored window can start, read from the
 * window text in data/admissionTestInfo.js (WINDOW_DAY below), is all-day,
 * says "(typical window)" in its title, and its description says it is not
 * a confirmed date.
 *
 * Events per test, only where the stored text states them:
 *   reg-open  "Registration opens: X"  — the date after "opens" in typicalRegistrationWindow
 *   reg-close "Registration closes: X" — the date after "deadline" in typicalRegistrationWindow
 *   sit       "Sit X"                  — the first date in typicalTestWindow
 *
 * Year: the student's application year A (computed by main.js from the
 * school-year start and yearsUntilApplication). Tests sat before applying
 * fall in A; tests sat AFTER offers (requiredStatus 'offer-condition',
 * the same field afterOffersOnly reads) in A+1. Within one test, a date
 * whose month comes before its registration month falls in the next year.
 * Dates before `today` are skipped, never rolled forward.
 *
 * Browser: classic script, exposes `AltioraCalendar`.
 * Node (tests): module.exports.
 * ═══════════════════════════════════════════════════════════════ */

(function (/** @type {any} */ root) {
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];

  /** The first day each part of a month can start. "late" is the 20th by decision. */
  const WINDOW_DAY = { early: 1, mid: 10, late: 20 };

  const NOT_CONFIRMED = 'This is the typical window, not a confirmed date. Check the exact date on the official test site before relying on it.';
  const APP_URL = 'https://usealtiora.com/app.html';
  const TITLE_SUFFIX = ' (typical window)';
  const PRODID = '-//Altiora//Admission test windows//EN';

  // "~20 July", "1 September", "mid-May", "late September", "early–mid June".
  const DATE_RE = new RegExp(String.raw`~?\s*(?:\b(early|mid|late)(?:\s*[–-]\s*(?:early|mid|late))?[\s-]+)?(?:\b(\d{1,2})\s+)?\b(${MONTHS.join('|')})\b`, 'i');

  /**
   * The first day a window phrase can start.
   * @param {string} text
   * @returns {{month: number, day: number, phrase: string, rule: string} | null}
   */
  function windowStart(text) {
    const m = DATE_RE.exec(String(text ?? ''));
    if (!m) return null;
    const month = MONTHS.indexOf(m[3].toLowerCase()) + 1;
    const part = /** @type {'early'|'mid'|'late'|undefined} */ (m[1]?.toLowerCase());
    if (m[2]) return { month, day: Number(m[2]), phrase: m[0].trim(), rule: 'the stated day' };
    if (part) return { month, day: WINDOW_DAY[part], phrase: m[0].trim(), rule: `"${part}" → the ${WINDOW_DAY[part]}${WINDOW_DAY[part] === 1 ? 'st' : 'th'}` };
    return { month, day: 1, phrase: m[0].trim(), rule: 'month only → the 1st' };
  }

  /** The window text after a keyword ("opens", "deadline"), or null. @param {string} text @param {string} word */
  function after(text, word) {
    const m = new RegExp(String.raw`\b${word}\b(.*)$`, 'i').exec(String(text ?? ''));
    return m ? m[1] : null;
  }

  /** @param {number} y @param {number} m @param {number} d */
  const ymd = (y, m, d) => `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;

  /** The day after a YYYYMMDD date (all-day DTEND is exclusive). @param {string} s */
  function nextDay(s) {
    const d = new Date(Date.UTC(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)) + 1));
    return ymd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }

  /**
   * @typedef {{ id?: string, name?: string, typicalRegistrationWindow?: string, typicalTestWindow?: string,
   *             requiredStatus?: string, officialUrl?: string }} TestInfo
   * @typedef {{ uid: string, type: 'reg-open'|'reg-close'|'sit', test: string, date: string, end: string,
   *             summary: string, description: string,
   *             source: { field: string, text: string, phrase: string, rule: string } }} CalEvent
   */

  /**
   * Every event the stored windows of one test state, for one application year.
   * @param {string} code @param {TestInfo} info @param {number} applicationYear
   * @returns {CalEvent[]}
   */
  function eventsForTest(code, info, applicationYear) {
    const base = applicationYear + (info.requiredStatus === 'offer-condition' ? 1 : 0);
    const reg = info.typicalRegistrationWindow ?? '';
    const sit = info.typicalTestWindow ?? '';
    /** @type {Array<[CalEvent['type'], string, string, string]>} */
    const wanted = [
      ['reg-open', 'Registration opens', 'typicalRegistrationWindow', after(reg, 'opens') ?? ''],
      ['reg-close', 'Registration closes', 'typicalRegistrationWindow', after(reg, 'deadline') ?? ''],
      ['sit', 'Sit', 'typicalTestWindow', sit],
    ];
    const name = info.name ?? code;
    const description = [NOT_CONFIRMED, info.officialUrl, APP_URL].filter(Boolean).join('\n');
    const openMonth = windowStart(after(reg, 'opens') ?? '')?.month ?? null;
    /** @type {CalEvent[]} */
    const out = [];
    for (const [type, label, field, text] of wanted) {
      const w = windowStart(text);
      if (!w) continue;
      const year = openMonth != null && w.month < openMonth ? base + 1 : base;
      const date = ymd(year, w.month, w.day);
      out.push({
        uid: `${code.toLowerCase()}-${type}@usealtiora.com`,
        type, test: code, date, end: nextDay(date),
        summary: `${type === 'sit' ? `Sit ${name}` : `${label}: ${name}`}${TITLE_SUFFIX}`,
        description,
        source: { field, text: field === 'typicalRegistrationWindow' ? reg : sit, phrase: w.phrase, rule: w.rule },
      });
    }
    return out;
  }

  /**
   * Upcoming events for a student's tests.
   * @param {object} p
   * @param {Array<{code: string, info: TestInfo | null | undefined}>} p.tests  the Applying checklist's tests
   * @param {number} p.applicationYear
   * @param {string} p.today  YYYYMMDD, the student's local date
   * @returns {{ events: CalEvent[], past: CalEvent[], withWindows: number }}
   */
  function calendarEvents({ tests, applicationYear, today }) {
    const all = tests.filter(t => t.info).flatMap(t => eventsForTest(t.code, /** @type {TestInfo} */ (t.info), applicationYear));
    const sorted = all.sort((a, b) => a.date.localeCompare(b.date) || a.test.localeCompare(b.test));
    return {
      events: sorted.filter(e => e.date >= today),
      past: sorted.filter(e => e.date < today),
      withWindows: new Set(all.map(e => e.test)).size,
    };
  }

  /** RFC 5545 TEXT escaping. @param {string} s */
  const escapeText = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

  /**
   * Fold one content line at 75 octets (UTF-8), never inside a character;
   * continuation lines start with one space.
   * @param {string} line
   */
  function foldLine(line) {
    const enc = new TextEncoder();
    const parts = [];
    let cur = '', bytes = 0, limit = 75;
    for (const ch of line) {
      const n = enc.encode(ch).length;
      if (bytes + n > limit) { parts.push(cur); cur = ' '; bytes = 1; limit = 75; }
      cur += ch; bytes += n;
    }
    parts.push(cur);
    return parts.join('\r\n');
  }

  /** @param {Date} d */
  const utcStamp = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  /**
   * The .ics file. CRLF line endings, folded, escaped.
   * @param {CalEvent[]} events @param {{ now: Date }} opts
   */
  function buildIcs(events, { now }) {
    const stamp = utcStamp(now);
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${PRODID}`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    for (const e of events) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${e.uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${e.date}`,
        `DTEND;VALUE=DATE:${e.end}`,
        `SUMMARY:${escapeText(e.summary)}`,
        `DESCRIPTION:${escapeText(e.description)}`,
        'TRANSP:TRANSPARENT',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:-P7D',
        `DESCRIPTION:${escapeText(e.summary)}`,
        'END:VALARM',
        'END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.map(foldLine).join('\r\n') + '\r\n';
  }

  /**
   * Google Calendar's pre-filled event link: same title, all-day date and description.
   * @param {CalEvent} e
   */
  function googleCalendarUrl(e) {
    // dates is two YYYYMMDD values (end exclusive) split by a literal "/".
    const q = [['action', 'TEMPLATE'], ['text', encodeURIComponent(e.summary)], ['dates', `${e.date}/${e.end}`],
      ['details', encodeURIComponent(e.description)]].map(([k, v]) => `${k}=${v}`).join('&');
    return `https://calendar.google.com/calendar/render?${q}`;
  }

  /**
   * How to open the file. Apple devices: navigate to a data: URL with
   * MIME type text/calendar and no download attribute, so Safari can hand
   * it to Calendar. Everyone else: download it with a dated file name.
   * @param {{ userAgent?: string, platform?: string, maxTouchPoints?: number }} nav
   * @returns {'data-url' | 'download'}
   */
  function openMethod(nav) {
    const ua = nav.userAgent ?? '';
    const iOS = /iPad|iPhone|iPod/.test(ua) || (nav.platform === 'MacIntel' && (nav.maxTouchPoints ?? 0) > 1);
    const macSafari = /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Firefox/.test(ua);
    return iOS || macSafari ? 'data-url' : 'download';
  }

  /** @param {string} ics */
  const dataUrl = ics => `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

  /** "altiora-calendar-YYYY-MM-DD.ics" @param {string} today YYYYMMDD */
  const fileName = today => `altiora-calendar-${today.slice(0, 4)}-${today.slice(4, 6)}-${today.slice(6, 8)}.ics`;

  const api = {
    windowStart, eventsForTest, calendarEvents, buildIcs, googleCalendarUrl, openMethod, dataUrl, fileName,
    escapeText, foldLine, WINDOW_DAY, NOT_CONFIRMED, APP_URL, TITLE_SUFFIX, PRODID,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AltioraCalendar = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
