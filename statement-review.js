// @ts-check
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
 *   d. story entries shown beside a question but used in no answer
 *
 * Matching (b, d) — an entry is "mentioned" in an answer when EITHER
 *   1. its whole title appears there as a run of words, OR
 *   2. at least two DISTINCTIVE words of its title appear there anywhere,
 * after normalising both texts the same way (see words()). A distinctive
 * word is a title word of 3+ characters that is not in COMMON_WORDS.
 * A title word also matches the same word with or without a trailing "s".
 *
 * Browser: classic script, exposes `AltioraStatementReview`.
 * Node (tests): module.exports.
 * ═══════════════════════════════════════════════════════════════ */

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

  /** @param {string} title */
  function distinctiveWords(title) {
    return [...new Set(words(title).map(t => t.w))].filter(w => w.length >= 3 && !COMMON_WORDS.has(w));
  }

  /**
   * Is a story entry mentioned in an answer? (rule 1 or rule 2 above)
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
    if (distinct.length < 2) return false;
    return distinct.filter(w => a.some(x => sameWord(w, x))).length >= 2;
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
   * @param {string[]} p.railEntryIds     ids of entries shown in any question's rail
   * @param {number} p.totalLimit         4000
   * @param {number} p.perAnswerMin       350
   */
  function review({ answers, entries, railEntryIds, totalLimit, perAnswerMin }) {
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

    const rail = new Set(railEntryIds);
    const unused = usedIn.filter(u => rail.has(u.entry.id) && u.answers.length === 0).map(u => ({ title: u.entry.title }));

    return { length, sharedEntries, repeatedWording, unused };
  }

  const NOTHING = 'Nothing found.';

  /**
   * The student-facing lines, verbatim.
   * @param {ReturnType<typeof review>} r @param {number} totalLimit @param {number} perAnswerMin
   */
  function reviewLines(r, totalLimit, perAnswerMin) {
    const fmt = (/** @type {number} */ n) => n.toLocaleString('en-GB');
    const or = (/** @type {string[]} */ lines) => (lines.length ? lines : [NOTHING]);
    return {
      length: r.length.map(a => `Answer ${a.n}: ${fmt(a.chars)} characters (${a.pct}% of your ${fmt(totalLimit)}).`
        + (a.belowMin ? ` This is below the ${fmt(perAnswerMin)}-character minimum.` : '')),
      sharedEntries: or(r.sharedEntries.map(s =>
        `“${s.title}” appears in answers ${listNumbers(s.answers)}. UCAS reads all three answers as one statement.`)),
      repeatedWording: or(r.repeatedWording.map(x =>
        `The same wording appears in answers ${x.answers[0]} and ${x.answers[1]}: “${x.phrase}”.`)),
      unused: or(r.unused.map(u => `You haven't written about “${u.title}” yet.`)),
    };
  }

  const api = { review, reviewLines, mentions, repeatedRuns, distinctiveWords, words, COMMON_WORDS, MIN_REPEAT_WORDS, NOTHING };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AltioraStatementReview = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
