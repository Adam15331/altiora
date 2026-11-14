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
const run = (/** @type {string[]} */ answers, /** @type {any[]} */ entries = [], /** @type {string[]} */ rail = entries.map(e => e.id)) =>
  R.reviewLines(R.review({ answers, entries, railEntryIds: rail, totalLimit: LIMIT, perAnswerMin: MIN }), LIMIT, MIN);

test('a: length per answer, with the minimum line only when below it', () => {
  const out = run(['x'.repeat(1200), 'y'.repeat(349), '']);
  assert.deepEqual(out.length, [
    'Answer 1: 1,200 characters (30% of your 4,000).',
    'Answer 2: 349 characters (9% of your 4,000). This is below the 350-character minimum.',
    'Answer 3: 0 characters (0% of your 4,000). This is below the 350-character minimum.',
  ]);
});

test('b: an entry is mentioned by its whole title, or by two distinctive title words', () => {
  assert.equal(R.mentions('Robotics club', 'I joined the Robotics Club in Year 10.'), true);        // whole title, any case
  assert.equal(R.mentions('UK Maths Challenge gold', 'my gold in the maths challenge'), true);         // maths + challenge + gold
  assert.equal(R.mentions('UK Maths Challenge gold', 'I enjoy maths.'), false);                          // one distinctive word
  assert.equal(R.mentions('Chess club', 'I play chess.'), false);                                        // one distinctive word: needs the whole title
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

test('d: entries shown in a rail but mentioned in no answer are listed; entries not in any rail are not', () => {
  const entries = [{ id: 'e1', title: 'Robotics club' }, { id: 'e2', title: 'Hospital volunteering' }, { id: 'e3', title: 'Piano grade 8' }];
  const out = run(['Robotics club was where it began.', '', ''], entries, ['e1', 'e2']);
  assert.deepEqual(out.unused, ["You haven't written about “Hospital volunteering” yet."]);
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
