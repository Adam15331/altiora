// @ts-check
/* global qualificationMappings, fieldProfiles -- top-level consts of data/qualificationMappings.js and data/fieldProfiles.js, loaded before this script */
/* ═══════════════════════════════════════════════════════════════
 * Altiora — statement-review.js
 *
 * "Review my statement": plain FACTS about the student's own draft.
 * Never a grade, score, ranking, praise or criticism; never a suggested
 * sentence; never a list of "clichés" or "weak phrases". Pure: text in,
 * facts out. Runs in the browser only — nothing is sent anywhere.
 *
 * Checks, in order:
 *   a. length per answer (characters, share of the 4,000 limit, minimum)
 *   b. the same story entry in more than one answer
 *   c. the same run of 6+ consecutive words in two different answers
 *   d. story entries used in no answer (every entry in the story)
 *
 * Matching (b, d) — an entry is "mentioned" in an answer when ANY of
 *   1. its whole title appears there as a run of words,
 *   2. two different DISTINCTIVE words of its title appear there within
 *      NEAR_WORDS (10) words of each other — positions at most 10 apart,
 *      i.e. no more than 9 words between them,
 *   3. the title has exactly ONE distinctive word, of at least
 *      SINGLE_WORD_MIN (4) characters, that is NOT a subject word, and
 *      that word appears there ("Robotics club" is mentioned by
 *      "robotics"; "Maths club" only by its whole title),
 * after normalising both texts the same way (see words()). A distinctive
 * word is a title word of 3+ characters that is not in COMMON_WORDS.
 * A title word also matches the same word with or without a trailing "s".
 *
 * Subject words (rule 3) are built from data the app already holds, never
 * typed here: every word of every subject name in qualificationMappings
 * (data/qualificationMappings.js) and of every field name in fieldProfiles
 * (data/fieldProfiles.js), plus the clipped short forms those two files
 * use — a word in their text whose first 4+ letters (less a plural "s")
 * begin a subject word and are at most half its length ("maths"). Words
 * under SINGLE_WORD_MIN characters or in COMMON_WORDS are left out: rule 3
 * never applies to them anyway. If the data is not loaded, rule 3 is off.
 *
 * Empty states (reviewLines): with all three answers empty, every check
 * says NO_ANSWERS; with no story entries, checks b and d say NO_ENTRIES.
 * "Nothing found." only when a check ran on real content and found nothing.
 *
 * Browser: classic script, exposes `AltioraStatementReview`.
 * Node (tests): module.exports.
 * ═══════════════════════════════════════════════════════════════ */

/* global require, __dirname -- used only when running under Node (tests) */
(function (/** @type {any} */ root) {
  // Ignored when picking a title's distinctive words: English function
  // words, plus the generic words story-entry titles share (entry types,
  // "school", "team"…), which say nothing about WHICH experience it is.
  const COMMON_WORDS = new Set([
    // function words
    'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'so', 'yet', 'of', 'in', 'on', 'at', 'to', 'for', 'from',
    'by', 'with', 'about', 'as', 'into', 'onto', 'over', 'under', 'up', 'down', 'out', 'off', 'than', 'then',
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'it', 'its', 'this', 'that', 'these', 'those',
    'my', 'me', 'mine', 'our', 'ours', 'we', 'us', 'i', 'you', 'your', 'he', 'she', 'they', 'them', 'their',
    'his', 'her', 'who', 'whom', 'which', 'what', 'when', 'where', 'why', 'how', 'all', 'any', 'each',
    'every', 'some', 'more', 'most', 'other', 'such', 'only', 'own', 'same', 'very', 'can', 'will', 'just',
    'not', 'no', 'do', 'did', 'does', 'done', 'have', 'has', 'had', 'also', 'after', 'before', 'during',
    'between', 'through', 'per', 'via', 'vs', 'etc',
    // generic story-entry words
    'school', 'college', 'club', 'society', 'team', 'group', 'project', 'projects', 'award', 'prize',
    'certificate', 'competition', 'course', 'programme', 'program', 'work', 'experience', 'placement',
    'internship', 'volunteer', 'volunteering', 'member', 'role', 'activity', 'year', 'years', 'level',
    'student', 'students', 'summer', 'online', 'local', 'national', 'international', 'first', 'second', 'third',
  ]);

  /** Minimum run, in words, for check c. */
  const MIN_REPEAT_WORDS = 6;

  /** Rule 2: the two distinctive title words must be at most this many word positions apart. */
  const NEAR_WORDS = 10;

  /** Rule 3: a title's only distinctive word counts alone when it is at least this long. */
  const SINGLE_WORD_MIN = 4;

  /**
   * Words of a text with their positions in the ORIGINAL string.
   * Normalised: lower case, accents removed, apostrophes dropped inside a
   * word ("don't" → "dont", "Durham’s" → "durhams"), everything that is not
   * a letter or digit treated as a separator.
   * @param {string} text
   * @returns {Array<{w: string, start: number, end: number}>}
   */
  function words(text) {
    const out = [];
    const re = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
    let m;
    while ((m = re.exec(String(text ?? ''))) !== null) {
      const w = m[0].normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').toLowerCase();
      if (w) out.push({ w, start: m.index, end: m.index + m[0].length });
    }
    return out;
  }

  /** @param {string} a @param {string} b */
  const sameWord = (a, b) => a === b || a === `${b}s` || b === `${a}s`;

  /**
   * The subject word list (see the header). Pure: data in, sorted words out.
   * @param {Record<string, {subjects?: Record<string, string>}>} mappings  qualificationMappings
   * @param {Record<string, {name?: string}>} profiles                      fieldProfiles
   * @returns {string[]}
   */
  function buildSubjectWords(mappings, profiles) {
    /** @type {Set<string>} */
    const names = new Set();
    const add = (/** @type {string} */ text) => words(text).forEach(x => names.add(x.w));
    Object.values(mappings || {}).forEach(sys => Object.keys(sys?.subjects || {}).forEach(add));
    Object.values(profiles || {}).forEach(f => add(f?.name ?? ''));
    // Every string (keys too) in both files: where their short forms are used.
    /** @type {Set<string>} */
    const tokens = new Set();
    const walk = (/** @type {unknown} */ v) => {
      if (typeof v === 'string') words(v).forEach(x => tokens.add(x.w));
      else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { words(k).forEach(t => tokens.add(t.w)); walk(x); });
    };
    walk(mappings); walk(profiles);
    const named = [...names];
    const clipped = [...tokens].filter(t => {
      const stem = t.endsWith('s') ? t.slice(0, -1) : t;
      return !names.has(t) && stem.length >= SINGLE_WORD_MIN && named.some(n => n.startsWith(stem) && stem.length * 2 <= n.length);
    });
    return [...new Set([...named, ...clipped])]
      .filter(w => w.length >= SINGLE_WORD_MIN && !COMMON_WORDS.has(w))
      .sort();
  }

  /**
   * The app's own data: browser globals from data/qualificationMappings.js
   * and data/fieldProfiles.js (loaded before this script), or — in Node —
   * the same two files read from disk. Null when unavailable.
   * @returns {string[] | null}
   */
  function loadSubjectWords() {
    try {
      // Top-level consts of earlier classic scripts: reachable by name, not via globalThis (declared for
      // lint in the global comment above and for tsc in types/page-globals.d.ts). Undefined in Node.
      if (typeof qualificationMappings !== 'undefined' && typeof fieldProfiles !== 'undefined') {
        return buildSubjectWords(qualificationMappings, fieldProfiles);
      }
      if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
        const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
        const ctx = vm.createContext({});
        for (const f of ['qualificationMappings.js', 'fieldProfiles.js']) {
          vm.runInContext(fs.readFileSync(path.join(__dirname, 'data', f), 'utf8'), ctx);
        }
        return buildSubjectWords(vm.runInContext('qualificationMappings', ctx), vm.runInContext('fieldProfiles', ctx));
      }
    } catch { /* fall through: rule 3 off */ }
    return null;
  }

  const SUBJECT_WORDS = loadSubjectWords();
  const SUBJECT_SET = new Set(SUBJECT_WORDS ?? []);
  /** Is this (normalised) word a subject word, singular or plural? @param {string} w */
  const isSubjectWord = w => SUBJECT_SET.has(w) || SUBJECT_SET.has(`${w}s`) || (w.endsWith('s') && SUBJECT_SET.has(w.slice(0, -1)));

  /** @param {string} title */
  function distinctiveWords(title) {
    return [...new Set(words(title).map(t => t.w))].filter(w => w.length >= 3 && !COMMON_WORDS.has(w));
  }

  /**
   * Is a story entry mentioned in an answer? (rule 1, 2 or 3 above)
   * @param {string} title @param {string} answer
   */
  function mentions(title, answer) {
    const t = words(title).map(x => x.w);
    const a = words(answer).map(x => x.w);
    if (!t.length || !a.length) return false;
    for (let i = 0; i + t.length <= a.length; i++) {
      if (t.every((w, k) => sameWord(w, a[i + k]))) return true;
    }
    const distinct = distinctiveWords(title);
    // Rule 3: exactly one distinctive word, long enough to stand alone and
    // not a subject word. Off when the subject data could not be loaded.
    if (distinct.length === 1) {
      return SUBJECT_WORDS !== null && distinct[0].length >= SINGLE_WORD_MIN && !isSubjectWord(distinct[0])
        && a.some(x => sameWord(distinct[0], x));
    }
    if (distinct.length < 2) return false;
    // Every position in the answer where some distinctive title word occurs.
    const hits = [];
    a.forEach((x, pos) => distinct.forEach((w, k) => { if (sameWord(w, x)) hits.push({ pos, k }); }));
    // Two DIFFERENT title words, close together in the same answer.
    return hits.some(h => hits.some(o => o.k !== h.k && Math.abs(o.pos - h.pos) <= NEAR_WORDS));
  }

  /**
   * Every maximal run of MIN_REPEAT_WORDS+ identical consecutive words
   * shared by two answers. Comparison uses the normalised words; the phrase
   * is quoted from the first answer's original text.
   * @param {string} textA @param {string} textB
   * @returns {string[]}
   */
  function repeatedRuns(textA, textB) {
    const A = words(textA), B = words(textB);
    if (A.length < MIN_REPEAT_WORDS || B.length < MIN_REPEAT_WORDS) return [];
    // Longest-common-suffix table, one row at a time.
    let prev = new Array(B.length + 1).fill(0);
    /** @type {Array<{endA: number, len: number}>} */
    const runs = [];
    for (let i = 1; i <= A.length; i++) {
      const cur = new Array(B.length + 1).fill(0);
      for (let j = 1; j <= B.length; j++) {
        if (A[i - 1].w === B[j - 1].w) cur[j] = prev[j - 1] + 1;
        // A run is maximal where it cannot extend by one more word.
        const extends_ = i < A.length && j < B.length && A[i].w === B[j].w;
        if (cur[j] >= MIN_REPEAT_WORDS && !extends_) runs.push({ endA: i - 1, len: cur[j] });
      }
      prev = cur;
    }
    const phrases = [];
    const seen = new Set();
    for (const r of runs.sort((x, y) => (x.endA - x.len) - (y.endA - y.len) || y.len - x.len)) {
      const first = A[r.endA - r.len + 1], last = A[r.endA];
      const key = A.slice(r.endA - r.len + 1, r.endA + 1).map(x => x.w).join(' ');
      if (seen.has(key) || [...seen].some(k => ` ${k} `.includes(` ${key} `))) continue;
      seen.add(key);
      phrases.push(String(textA).slice(first.start, last.end));
    }
    return phrases;
  }

  /** "1 and 3", "1, 2 and 3" @param {number[]} ns */
  const listNumbers = ns => (ns.length < 2 ? String(ns[0]) : `${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}`);

  /**
   * Run every check.
   * @param {object} p
   * @param {string[]} p.answers          the answers, in question order
   * @param {Array<{id: string, title: string}>} p.entries   every story entry
   * @param {number} p.totalLimit         4000
   * @param {number} p.perAnswerMin       350
   */
  function review({ answers, entries, totalLimit, perAnswerMin }) {
    const length = answers.map((text, i) => {
      const chars = String(text ?? '').length;     // spaces and line breaks count, as on UCAS
      return { n: i + 1, chars, pct: Math.round((chars / totalLimit) * 100), belowMin: chars < perAnswerMin };
    });

    const usedIn = entries.map(e => ({
      entry: e,
      answers: answers.map((text, i) => (mentions(e.title, text) ? i + 1 : 0)).filter(Boolean),
    }));
    const sharedEntries = usedIn.filter(u => u.answers.length >= 2)
      .map(u => ({ title: u.entry.title, answers: u.answers }));

    const repeatedWording = [];
    for (let i = 0; i < answers.length; i++) {
      for (let j = i + 1; j < answers.length; j++) {
        for (const phrase of repeatedRuns(answers[i], answers[j])) repeatedWording.push({ answers: [i + 1, j + 1], phrase });
      }
    }

    // Every story entry counts, not only those shown in a question's rail.
    const unused = usedIn.filter(u => u.answers.length === 0).map(u => ({ title: u.entry.title }));

    // Nothing to work with: no text in any answer, or no story entries.
    const noAnswers = answers.every(text => String(text ?? '').trim() === '');
    const noEntries = entries.length === 0;

    return { length, sharedEntries, repeatedWording, unused, noAnswers, noEntries };
  }

  const NOTHING = 'Nothing found.';
  const NO_ANSWERS = 'Write something in at least one answer first.';
  const NO_ENTRIES = "You have no story entries yet, so there’s nothing to compare. Add some in My Story.";

  /**
   * The student-facing lines, verbatim.
   * @param {ReturnType<typeof review>} r @param {number} totalLimit @param {number} perAnswerMin
   */
  function reviewLines(r, totalLimit, perAnswerMin) {
    const fmt = (/** @type {number} */ n) => n.toLocaleString('en-GB');
    const or = (/** @type {string[]} */ lines) => (lines.length ? lines : [NOTHING]);
    if (r.noAnswers) return { length: [NO_ANSWERS], sharedEntries: [NO_ANSWERS], repeatedWording: [NO_ANSWERS], unused: [NO_ANSWERS] };
    return {
      length: r.length.map(a => `Answer ${a.n}: ${fmt(a.chars)} characters (${a.pct}% of your ${fmt(totalLimit)}).`
        + (a.belowMin ? ` This is below the ${fmt(perAnswerMin)}-character minimum.` : '')),
      sharedEntries: r.noEntries ? [NO_ENTRIES] : or(r.sharedEntries.map(s =>
        `“${s.title}” appears in answers ${listNumbers(s.answers)}. UCAS reads all three answers as one statement.`)),
      repeatedWording: or(r.repeatedWording.map(x =>
        `The same wording appears in answers ${x.answers[0]} and ${x.answers[1]}: “${x.phrase}”.`)),
      unused: r.noEntries ? [NO_ENTRIES] : or(r.unused.map(u => `You haven’t written about “${u.title}” yet.`)),
    };
  }

  const api = { review, reviewLines, mentions, repeatedRuns, distinctiveWords, words, COMMON_WORDS, MIN_REPEAT_WORDS, NEAR_WORDS, SINGLE_WORD_MIN, SUBJECT_WORDS, buildSubjectWords, isSubjectWord, NOTHING, NO_ANSWERS, NO_ENTRIES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AltioraStatementReview = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
