// @ts-check
// "Review my statement" (statement-review.js): facts about the student's
// own draft, checks b (same entry in two answers), c (repeated wording) and
// d (unused entries), plus the verbatim copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const R = require('../statement-review.js');

const LIMIT = 4000, MIN = 350;
const run = (/** @type {string[]} */ answers, /** @type {any[]} */ entries = []) =>
  R.reviewLines(R.review({ answers, entries, totalLimit: LIMIT, perAnswerMin: MIN }), LIMIT, MIN);

test('a: length per answer, with the minimum line only when below it', () => {
  const out = run(['x'.repeat(1200), 'y'.repeat(349), '']);
  assert.deepEqual(out.length, [
    'Answer 1: 1,200 characters (30% of your 4,000).',
    'Answer 2: 349 characters (9% of your 4,000). This is below the 350-character minimum.',
    'Answer 3: 0 characters (0% of your 4,000). This is below the 350-character minimum.',
  ]);
});

test('b: an entry is mentioned by its whole title, by two distinctive title words, or by its only distinctive word', () => {
  assert.equal(R.mentions('Robotics club', 'I joined the Robotics Club in Year 10.'), true);        // whole title, any case
  assert.equal(R.mentions('UK Maths Challenge gold', 'my gold in the maths challenge'), true);         // maths + challenge + gold
  assert.equal(R.mentions('UK Maths Challenge gold', 'I enjoy maths.'), false);                          // one distinctive word
  assert.equal(R.mentions('Chess club', 'I play chess.'), true);                                         // its only distinctive word (rule 3)
  assert.equal(R.mentions('Durham’s summer school', "At Durham's summer school I"), true);              // curly vs straight apostrophe
  assert.equal(R.mentions('Coding projects', 'my coding project'), true);                                // plural / singular
  assert.deepEqual(R.distinctiveWords('The National Robotics Team Project'), ['robotics']);
});

test('b: rule 2 needs the two distinctive words within 10 words of each other', () => {
  const filler = (/** @type {number} */ n) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ');
  // "Maths" and "challenge" 30 words apart: not a mention.
  assert.equal(R.mentions('UK Maths Challenge gold', `Maths ${filler(29)} challenge`), false);
  // "the maths challenge" in one phrase: a mention.
  assert.equal(R.mentions('UK Maths Challenge gold', 'I entered the maths challenge in Year 11.'), true);
  // The boundary: 10 positions apart counts, 11 does not.
  assert.equal(R.mentions('UK Maths Challenge gold', `maths ${filler(9)} challenge`), true);
  assert.equal(R.mentions('UK Maths Challenge gold', `maths ${filler(10)} challenge`), false);
  // The same word twice is not two distinctive words.
  assert.equal(R.mentions('UK Maths Challenge gold', 'maths and more maths'), false);
  // Rule 1 is unchanged: the whole title still counts wherever it sits.
  assert.equal(R.mentions('Robotics club', `${filler(40)} robotics club`), true);
  assert.equal(R.NEAR_WORDS, 10);
});

test('b: the same entry in two or more answers is reported, with every answer listed', () => {
  const entries = [{ id: 'e1', title: 'Robotics club' }, { id: 'e2', title: 'Hospital volunteering' }];
  const out = run(['At robotics club I built a rover.', 'Physics helped.', 'Robotics club taught me teamwork.'], entries);
  assert.deepEqual(out.sharedEntries, ['“Robotics club” appears in answers 1 and 3. UCAS reads all three answers as one statement.']);
  const three = run(['robotics club', 'robotics club', 'robotics club'], entries);
  assert.deepEqual(three.sharedEntries, ['“Robotics club” appears in answers 1, 2 and 3. UCAS reads all three answers as one statement.']);
});

test('c: a run of 6+ identical consecutive words in two answers is reported once, quoted from the draft', () => {
  const out = run([
    'I have always been fascinated by how bridges carry load.',
    'Physics showed me how bridges carry load across a span.',
    'Nothing shared here at all.',
  ]);
  assert.deepEqual(out.repeatedWording, ['Nothing found.']);   // only 4 words shared: below the 6-word run
  const six = run([
    'Since Year 9 I have been fascinated by the way structures fail under load.',
    'In physics I saw the way structures fail under load, which led me to read more.',
    '',
  ]);
  assert.deepEqual(six.repeatedWording, ['The same wording appears in answers 1 and 2: “the way structures fail under load”.']);
  // Case and punctuation do not hide a repeat; the longest run is reported, not its pieces.
  const long = run(['A, b c d e f g h.', 'x a b C d, e f g h y', '']);
  assert.deepEqual(long.repeatedWording, ['The same wording appears in answers 1 and 2: “A, b c d e f g h”.']);
});

test('d: every story entry mentioned in no answer is listed, whichever rail it shows in (or none)', () => {
  const entries = [{ id: 'e1', title: 'Robotics club' }, { id: 'e2', title: 'Hospital volunteering' }, { id: 'e3', title: 'Piano grade 8' }];
  const out = run(['Robotics club was where it began.', '', ''], entries);
  assert.deepEqual(out.unused, [
    "You haven’t written about “Hospital volunteering” yet.",
    "You haven’t written about “Piano grade 8” yet.",
  ]);
  // The review takes no rail list: an entry is never left out for where it is shown.
  const r = R.review({ answers: ['', '', ''], entries: [{ id: 'x', title: 'Chess club' }], totalLimit: LIMIT, perAnswerMin: MIN });
  assert.deepEqual(r.unused, [{ title: 'Chess club' }]);
});

test('nothing found: every check after length says so plainly', () => {
  const entries = [{ id: 'e1', title: 'Robotics club' }, { id: 'e2', title: 'Hospital volunteering' }];
  const out = run([
    'Robotics club is where I first saw engineering as a way of thinking.',
    'Further Maths gave me the tools to model motion.',
    'Hospital volunteering showed me how systems serve people.',
  ], entries);
  assert.deepEqual([out.sharedEntries, out.repeatedWording, out.unused], [['Nothing found.'], ['Nothing found.'], ['Nothing found.']]);
});

test('the copy never grades the writing', () => {
  const out = run(['short', 'short', 'short'], [{ id: 'e', title: 'Robotics club' }]);
  const all = Object.values(out).flat().join(' ').toLowerCase();
  for (const w of ['good', 'great', 'weak', 'strong', 'cliché', 'cliche', 'score', 'excellent', 'poor', 'should']) assert.ok(!all.includes(w), w);
});

test('rule 3: a title with one distinctive word (4+ characters) is mentioned by that word alone', () => {
  assert.equal(R.mentions('Robotics club', 'I joined robotics in Year 10'), true);
  assert.equal(R.mentions('Chess club', 'ch'), false);
  assert.equal(R.mentions('Chess club', 'I enjoy drawing and long walks.'), false);
  assert.equal(R.mentions('Art club', 'I love art.'), false);                // "art" is under 4 characters: the whole title is still needed
  assert.equal(R.mentions('Art club', 'the art club'), true);                // rule 1 unchanged
  // Two or more distinctive words: rules 1 and 2 only, as before.
  assert.equal(R.mentions('UK Maths Challenge gold', 'I enjoy maths.'), false);
  assert.equal(R.SINGLE_WORD_MIN, 4);
  const out = run(['I joined robotics in Year 10.', 'Physics helped.', 'Robotics taught me patience.'],
    [{ id: 'e1', title: 'Robotics club' }]);
  assert.deepEqual(out.sharedEntries, ['“Robotics club” appears in answers 1 and 3. UCAS reads all three answers as one statement.']);
  assert.deepEqual(out.unused, ['Nothing found.']);
});

test('empty state: no story entries — checks b and d say so instead of "Nothing found."', () => {
  const out = run(['I have always been fascinated by bridges.', 'Physics helped.', '']);
  const msg = "You have no story entries yet, so there’s nothing to compare. Add some in My Story.";
  assert.deepEqual(out.sharedEntries, [msg]);
  assert.deepEqual(out.unused, [msg]);
  assert.deepEqual(out.repeatedWording, ['Nothing found.']);          // c ran on real text
  assert.equal(out.length.length, 3);                                  // a still reports each answer
});

test('empty state: all three answers empty — every check says so', () => {
  const msg = 'Write something in at least one answer first.';
  for (const entries of [[], [{ id: 'e1', title: 'Robotics club' }]]) {
    const out = run(['', '  \n ', ''], entries);
    assert.deepEqual(out, { length: [msg], sharedEntries: [msg], repeatedWording: [msg], unused: [msg] });
  }
});

test('rule 3 does not apply to subject or field words: only the whole title counts', () => {
  assert.equal(R.mentions('Maths club', 'I love maths'), false);
  assert.equal(R.mentions('Maths club', 'maths taught me'), false);
  assert.equal(R.mentions('Maths club', 'at maths club I learned to prove things'), true);   // rule 1
  assert.equal(R.mentions('Physics society', 'physics'), false);
  assert.equal(R.mentions('Robotics club', 'robotics'), true);
  assert.equal(R.mentions('Hospital volunteering', 'hospital'), true);
  // A maths applicant who writes "maths" everywhere but never "maths club".
  const out = run(['I love maths.', 'Maths taught me rigour.', 'I tutor maths to younger pupils.'], [{ id: 'm', title: 'Maths club' }]);
  assert.deepEqual(out.sharedEntries, ['Nothing found.']);
  assert.deepEqual(out.unused, ['You haven’t written about “Maths club” yet.']);
});

test('the subject word list is built from qualificationMappings and fieldProfiles, not typed', async () => {
  const fs = await import('node:fs'), vm = await import('node:vm');
  const ctx = vm.createContext({});
  for (const f of ['qualificationMappings.js', 'fieldProfiles.js']) vm.runInContext(fs.readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'), ctx);
  const built = R.buildSubjectWords(vm.runInContext('qualificationMappings', ctx), vm.runInContext('fieldProfiles', ctx));
  assert.deepEqual(R.SUBJECT_WORDS, built);
  for (const w of ['mathematics', 'physics', 'chemistry', 'economics', 'engineering', 'medicine', 'architecture', 'maths', 'stats']) assert.ok(built.includes(w), w);
  for (const w of ['robotics', 'hospital', 'chess', 'club', 'law', 'art']) assert.ok(!built.includes(w), w);
  // Data in, words out: a subject added to the data becomes a subject word.
  assert.deepEqual(R.buildSubjectWords({ X: { subjects: { 'Astronomy': 'T' } } }, {}), ['astronomy']);
  assert.ok(built.every(w => w.length >= R.SINGLE_WORD_MIN && !R.COMMON_WORDS.has(w)));
});
