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
 * Events, only where the stored text states them:
 *   reg-open    "Registration opens: X"   — the date after "opens" in typicalRegistrationWindow
 *   reg-close   "Registration closes: X"  — the date after "deadline" in typicalRegistrationWindow
 *   test-window "X test window opens"     — the first date in typicalTestWindow
 * Registration events are per REGISTRATION GROUP — Applying's own grouping
 * (groupedTests in main.js: provider, else official host, + registration
 * month), passed in by main.js — so tests sharing one registration (TMUA,
 * ESAT, TARA) get ONE "Registration opens: ESAT and TMUA". Test-window
 * events stay one per test.
 *
 * UIDs: <key>-<type>-<year>@usealtiora.com. For registration events key
 * is the shared provider where a test has one (so adding a test to the
 * group updates the same event), else the test code; for test windows it
 * is always the test code. The year is the event's own.
 * Re-exporting the same cycle gives identical UIDs; a later cycle never
 * overwrites an earlier one.
 *
 * UK application deadlines: only what Applying already states — its UK
 * deadline sentence (DEADLINE_SHAPE.UK, passed in from the checklist's own
 * deadline:UK task): "Medicine, dentistry, veterinary and Oxford/Cambridge
 * courses typically close in mid-October; most other UK courses in late
 * January." One event per clause the shortlist has a course for, titled
 * "Application deadline: <who> (typical deadline)". A deadline in or after
 * the month the UK school year starts falls in A, earlier months in A+1.
 * No other country: the app holds no single deadline for them.
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
  const DEADLINE_NOT_CONFIRMED = 'This is the typical deadline, not a confirmed date. Confirm the exact date on UCAS and the course page before relying on it.';
  const DEADLINE_SUFFIX = ' (typical deadline)';
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
   *             requiredStatus?: string, officialUrl?: string, provider?: string }} TestInfo
   * @typedef {{ uid: string, type: 'reg-open'|'reg-close'|'test-window'|'deadline', test: string, tests: string[], date: string, end: string,
   *             summary: string, description: string,
   *             source: { field: string, text: string, phrase: string, rule: string } }} CalEvent
   */

  /** A lowercase slug. @param {string} s */
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /** Registration UID key: the shared provider where a test has one, else the code. @param {string} code @param {TestInfo} info */
  const uidKey = (code, info) => slug(info.provider || code);

  /** "A", "A and B", "A, B and C" @param {string[]} xs */
  const listNames = xs => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

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
      ['test-window', 'test window opens', 'typicalTestWindow', sit],
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
        // Registration is shared by provider; a test window is the test's own.
        uid: `${type === 'test-window' ? slug(code) : uidKey(code, info)}-${type}-${year}@usealtiora.com`,
        type, test: code, tests: [code], date, end: nextDay(date),
        summary: `${type === 'test-window' ? `${name} ${label}` : `${label}: ${name}`}${TITLE_SUFFIX}`,
        description,
        source: { field, text: field === 'typicalRegistrationWindow' ? reg : sit, phrase: w.phrase, rule: w.rule },
      });
    }
    return out;
  }

  /**
   * One registration group's events: its members' registration events merged
   * (one per type and date, naming every member), test windows per test.
   * @param {Array<{code: string, info: TestInfo}>} group
   * @param {number} applicationYear
   * @returns {CalEvent[]}
   */
  function eventsForGroup(group, applicationYear) {
    const per = group.map(t => ({ ...t, events: eventsForTest(t.code, t.info, applicationYear) }));
    /** @type {CalEvent[]} */
    const out = per.flatMap(t => t.events.filter(e => e.type === 'test-window'));
    for (const type of /** @type {const} */ (['reg-open', 'reg-close'])) {
      /** @type {Map<string, Array<{code: string, info: TestInfo, event: CalEvent}>>} */
      const byDate = new Map();
      per.forEach(t => t.events.filter(e => e.type === type)
        .forEach(event => byDate.set(event.date, [...(byDate.get(event.date) ?? []), { code: t.code, info: t.info, event }])));
      for (const members of byDate.values()) {
        const first = members[0].event;
        if (members.length === 1 && byDate.size === 1) { out.push(first); continue; }
        const codes = members.map(m => m.code);
        const providers = /** @type {string[]} */ ([...new Set(members.map(m => m.info.provider).filter(Boolean))]);
        // One shared provider and one date: the provider's key. Otherwise name the members.
        const key = providers.length === 1 && byDate.size === 1 ? slug(providers[0]) : slug(codes.join('-'));
        const label = type === 'reg-open' ? 'Registration opens' : 'Registration closes';
        const links = [...new Set(members.map(m => m.info.officialUrl).filter(Boolean))];
        out.push({
          ...first,
          uid: `${key}-${type}-${first.date.slice(0, 4)}@usealtiora.com`,
          test: codes[0], tests: codes,
          summary: `${label}: ${listNames(members.map(m => m.info.name ?? m.code))}${TITLE_SUFFIX}`,
          description: [NOT_CONFIRMED, ...links, APP_URL].join('\n'),
        });
      }
    }
    return out;
  }

  /**
   * The UK deadline sentence's clauses: who, and the first day the stated
   * time can start. Reads only the first sentence ("…; …"); the rest is the
   * confirm-officially line.
   * @param {string} shape
   * @returns {Array<{who: string, month: number, day: number, phrase: string, rule: string}>}
   */
  function deadlineClauses(shape) {
    const first = String(shape ?? '').split(/\.\s/)[0];
    return first.split(';').map(c => c.trim()).flatMap(c => {
      const m = /^(.*?)\s+(?:typically close\s+)?in\s+(.+?)\.?$/i.exec(c);
      const w = m ? windowStart(m[2]) : null;
      return m && w ? [{ who: m[1], ...w }] : [];
    });
  }

  /**
   * Clause 1 of the sentence — "Medicine, dentistry, veterinary and
   * Oxford/Cambridge courses": a course named Medicine, Dentistry/Dental or
   * Veterinary, or at the University of Oxford or Cambridge. (The medicine
   * category also holds Biomedical Sciences, Pharmacy and Nursing, which the
   * sentence does not name, so the course name is what is read.)
   * @param {{name?: string, university?: string}} course
   */
  const earlyUkDeadline = course => /\b(medicine|dentistry|dental|veterinary)\b/i.test(course.name ?? '')
    || course.university === 'University of Oxford' || course.university === 'University of Cambridge';

  /**
   * UK application-deadline events for the student's UK courses.
   * @param {object} p
   * @param {string} p.shape  Applying's UK deadline sentence
   * @param {Array<{name?: string, university?: string}>} p.ukCourses
   * @param {number} p.applicationYear
   * @param {number} p.cycleStartMonth  the month the UK school year starts (September)
   * @returns {CalEvent[]}
   */
  function ukDeadlineEvents({ shape, ukCourses, applicationYear, cycleStartMonth }) {
    const clauses = deadlineClauses(shape);
    if (clauses.length !== 2 || !ukCourses.length) return [];
    const has = [ukCourses.some(earlyUkDeadline), ukCourses.some(c => !earlyUkDeadline(c))];
    return clauses.flatMap((cl, i) => {
      if (!has[i]) return [];
      const year = cl.month >= cycleStartMonth ? applicationYear : applicationYear + 1;
      const date = ymd(year, cl.month, cl.day);
      const who = cl.who.charAt(0).toUpperCase() + cl.who.slice(1);
      return [{
        uid: `uk-deadline-${MONTHS[cl.month - 1]}-${year}@usealtiora.com`,
        type: /** @type {'deadline'} */ ('deadline'), test: 'UK', tests: [], date, end: nextDay(date),
        summary: `Application deadline: ${who}${DEADLINE_SUFFIX}`,
        description: [DEADLINE_NOT_CONFIRMED, APP_URL].join('\n'),
        source: { field: 'DEADLINE_SHAPE.UK', text: String(shape), phrase: cl.phrase, rule: cl.rule },
      }];
    });
  }

  /**
   * Upcoming events for a student's tests (and any deadline events passed in).
   * @param {object} p
   * @param {Array<Array<{code: string, info: TestInfo | null | undefined}>>} p.groups
   *   the Applying checklist's tests, in Applying's registration groups
   * @param {number} p.applicationYear
   * @param {string} p.today  YYYYMMDD, the student's local date
   * @param {CalEvent[]} [p.deadlines]  from ukDeadlineEvents
   * @returns {{ events: CalEvent[], past: CalEvent[], withWindows: number }}
   */
  function calendarEvents({ groups, applicationYear, today, deadlines = [] }) {
    const all = [...groups
      .map(g => /** @type {Array<{code: string, info: TestInfo}>} */ (g.filter(t => t.info)))
      .filter(g => g.length)
      .flatMap(g => eventsForGroup(g, applicationYear)), ...deadlines];
    const sorted = all.sort((a, b) => a.date.localeCompare(b.date) || a.summary.localeCompare(b.summary));
    return {
      events: sorted.filter(e => e.date >= today),
      past: sorted.filter(e => e.date < today),
      withWindows: new Set(all.flatMap(e => e.tests)).size,
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
    windowStart, eventsForTest, eventsForGroup, calendarEvents, deadlineClauses, earlyUkDeadline, ukDeadlineEvents, buildIcs, googleCalendarUrl, openMethod, dataUrl, fileName,
    escapeText, foldLine, WINDOW_DAY, NOT_CONFIRMED, DEADLINE_NOT_CONFIRMED, DEADLINE_SUFFIX, APP_URL, TITLE_SUFFIX, PRODID,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AltioraCalendar = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
