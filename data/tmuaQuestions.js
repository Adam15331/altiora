/**
 * tmuaQuestions.js — hand-written TMUA-STYLE practice questions (stubs).
 *
 * ⚠️  These are original practice questions written in the style of the TMUA.
 *     They are NOT official past papers or specimen questions. For the real
 *     test interface and official materials, see UAT UK:
 *     https://www.uat.ac.uk/tmua
 *
 * Schema (the same shape the AI generator will later produce, so the engine
 * never has to change when the source is swapped):
 *   {
 *     id:            string,
 *     paper:         1 | 2,           // 1 = Applications, 2 = Reasoning
 *     topic:         string,          // e.g. "algebra", "logic"
 *     difficulty:    1..5,
 *     stem:          string,          // question text; `^` → superscript
 *     options:       [A, B, C, D, E], // 5 option strings
 *     correctAnswer: "A".."E",        // letter indexing into options
 *     explanation:   string           // worked solution, shown after answering
 *   }
 *
 * Loaded as a plain script — exposes one global: TMUA_QUESTIONS.
 */

const TMUA_QUESTIONS = [

  /* ══════════════ PAPER 1 — Applications of Mathematical Knowledge ══════════ */

  {
    id: 'p1-algebra-roots',
    paper: 1, topic: 'algebra', difficulty: 2,
    stem: 'The equation x² − 6x + 8 = 0 has roots p and q. What is the value of 1/p + 1/q?',
    options: ['3/8', '3/4', '6', '4/3', '1/4'],
    correctAnswer: 'B',
    explanation: 'For roots of x² − 6x + 8 = 0: p + q = 6 and pq = 8. Then 1/p + 1/q = (p + q)/(pq) = 6/8 = 3/4.',
  },
  {
    id: 'p1-logs-equation',
    paper: 1, topic: 'logarithms', difficulty: 3,
    stem: 'Given log₂(x) + log₂(x − 2) = 3, find the value of x.',
    options: ['2', '6', '4', '8', '−2'],
    correctAnswer: 'C',
    explanation: 'log₂(x(x − 2)) = 3 ⇒ x² − 2x = 8 ⇒ x² − 2x − 8 = 0 ⇒ (x − 4)(x + 2) = 0. Since x − 2 > 0 is required, x = 4.',
  },
  {
    id: 'p1-calculus-stationary',
    paper: 1, topic: 'calculus', difficulty: 3,
    stem: 'The curve y = x³ − 3x has two stationary points. What is the x-coordinate of the local maximum?',
    options: ['1', '0', '3', '−1', '−3'],
    correctAnswer: 'D',
    explanation: "dy/dx = 3x² − 3 = 0 ⇒ x = ±1. The second derivative is 6x, which is negative at x = −1, so x = −1 is the local maximum.",
  },
  {
    id: 'p1-sequences-arithmetic',
    paper: 1, topic: 'sequences', difficulty: 2,
    stem: 'An arithmetic sequence has first term 5 and common difference 3. What is the sum of the first 10 terms?',
    options: ['170', '195', '150', '200', '185'],
    correctAnswer: 'E',
    explanation: 'S₁₀ = (10/2)[2·5 + (10 − 1)·3] = 5·(10 + 27) = 5·37 = 185.',
  },
  {
    id: 'p1-geometry-circle',
    paper: 1, topic: 'geometry', difficulty: 3,
    stem: 'A circle has equation x² + y² − 4x + 6y − 12 = 0. What is its radius?',
    options: ['5', '25', '√23', '12', '√12'],
    correctAnswer: 'A',
    explanation: 'Completing the square: (x − 2)² + (y + 3)² = 12 + 4 + 9 = 25. So r² = 25 and r = 5.',
  },
  {
    id: 'p1-functions-composite',
    paper: 1, topic: 'functions', difficulty: 3,
    stem: 'Let f(x) = 2x + 1 and g(x) = x². What is g(f(x)) − f(g(x))?',
    options: ['4x', '2x² + 4x', '2x²', '4x + 2', '2x² − 4x'],
    correctAnswer: 'B',
    explanation: 'g(f(x)) = (2x + 1)² = 4x² + 4x + 1. f(g(x)) = 2x² + 1. The difference is (4x² + 4x + 1) − (2x² + 1) = 2x² + 4x.',
  },
  {
    id: 'p1-indices-evaluate',
    paper: 1, topic: 'algebra', difficulty: 1,
    stem: 'Evaluate 8^(2/3).',
    options: ['2', '8', '4', '16', '6'],
    correctAnswer: 'C',
    explanation: '8^(2/3) = (8^(1/3))² = 2² = 4.',
  },
  {
    id: 'p1-calculus-definite',
    paper: 1, topic: 'calculus', difficulty: 2,
    stem: 'Evaluate the definite integral ∫₀¹ (3x² + 2x) dx.',
    options: ['5', '2', '3', '1', '4'],
    correctAnswer: 'B',
    explanation: '∫(3x² + 2x) dx = x³ + x². Evaluated from 0 to 1: (1 + 1) − 0 = 2.',
  },
  {
    id: 'p1-sequences-geometric',
    paper: 1, topic: 'sequences', difficulty: 4,
    stem: 'A geometric series has first term 12 and common ratio 1/2. What is its sum to infinity?',
    options: ['12', '6', '24', '18', '36'],
    correctAnswer: 'C',
    explanation: 'Since |r| < 1, the sum to infinity is a/(1 − r) = 12/(1 − 1/2) = 12/(1/2) = 24.',
  },
  {
    id: 'p1-trig-solutions',
    paper: 1, topic: 'trigonometry', difficulty: 3,
    stem: 'How many solutions does 2·sin(x) = 1 have in the interval 0 ≤ x < 2π?',
    options: ['1', '2', '3', '0', '4'],
    correctAnswer: 'B',
    explanation: 'sin(x) = 1/2 has solutions x = π/6 and x = 5π/6 in [0, 2π). That is 2 solutions.',
  },

  /* ══════════════ PAPER 2 — Mathematical Reasoning ══════════════════════════ */

  {
    id: 'p2-logic-negation',
    paper: 2, topic: 'logic', difficulty: 2,
    stem: "Which statement is the negation of 'All cats are black'?",
    options: ['No cats are black', 'All cats are not black', 'Some cats are not black', 'Some cats are black', 'All cats are white'],
    correctAnswer: 'C',
    explanation: "The negation of 'for all x, P(x)' is 'there exists an x such that not P(x)'. So the negation of 'all cats are black' is 'some cat is not black'.",
  },
  {
    id: 'p2-logic-sufficient',
    paper: 2, topic: 'logic', difficulty: 3,
    stem: "For an integer n, the condition 'n is divisible by 4' is which of the following for 'n is even'?",
    options: ['Necessary but not sufficient', 'Sufficient but not necessary', 'Both necessary and sufficient', 'Neither necessary nor sufficient', 'None of these'],
    correctAnswer: 'B',
    explanation: 'If n is divisible by 4 then n is certainly even (sufficient). But n = 6 is even without being divisible by 4, so it is not necessary.',
  },
  {
    id: 'p2-proof-contradiction',
    paper: 2, topic: 'proof', difficulty: 3,
    stem: "To prove 'if n² is even then n is even' by contradiction, what should you assume at the start?",
    options: ['n² is odd and n is even', 'n² is even and n is odd', 'n is even', 'n² is odd', 'n is even and n² is even'],
    correctAnswer: 'B',
    explanation: 'Proof by contradiction assumes the hypothesis is true but the conclusion is false: n² is even AND n is odd. You then derive a contradiction.',
  },
  {
    id: 'p2-counterexample-primes',
    paper: 2, topic: 'number theory', difficulty: 2,
    stem: "Which of these is a counterexample to the claim 'all prime numbers are odd'?",
    options: ['9', '1', '2', '15', '7'],
    correctAnswer: 'C',
    explanation: '2 is prime (its only divisors are 1 and 2) but it is even, so it disproves the claim. (9 and 15 are odd but not prime; 1 is not prime; 7 is an odd prime.)',
  },
  {
    id: 'p2-logic-contrapositive',
    paper: 2, topic: 'logic', difficulty: 3,
    stem: "Given the true statement 'If it rains, the match is cancelled', you learn the match was NOT cancelled. What follows?",
    options: ['It rained', 'It did not rain', 'Nothing can be concluded', 'The match was cancelled', 'It will rain tomorrow'],
    correctAnswer: 'B',
    explanation: 'The contrapositive of "if rain then cancelled" is "if not cancelled then not rain", which is logically equivalent and therefore also true. So it did not rain.',
  },
  {
    id: 'p2-number-consecutive',
    paper: 2, topic: 'number theory', difficulty: 4,
    stem: 'The sum of any three consecutive integers is always divisible by which number?',
    options: ['2', '6', '4', '3', '9'],
    correctAnswer: 'D',
    explanation: 'Three consecutive integers sum to n + (n + 1) + (n + 2) = 3n + 3 = 3(n + 1), which is always divisible by 3 (but not always by 6 or 9).',
  },
  {
    id: 'p2-logic-converse',
    paper: 2, topic: 'logic', difficulty: 3,
    stem: "What is the converse of 'If x > 2 then x² > 4'?",
    options: ['If x² > 4 then x > 2', 'If x ≤ 2 then x² ≤ 4', 'If x > 2 then x² > 4', 'If x² ≤ 4 then x ≤ 2', 'If x < 2 then x² < 4'],
    correctAnswer: 'A',
    explanation: 'The converse of "if P then Q" is "if Q then P". Here that is "if x² > 4 then x > 2". (Note this converse is actually false, e.g. x = −3.)',
  },
  {
    id: 'p2-sets-transitivity',
    paper: 2, topic: 'sets', difficulty: 2,
    stem: 'If A ⊆ B and B ⊆ C, which of the following must be true?',
    options: ['C ⊆ A', 'A = C', 'A ⊆ C', 'B ⊆ A', 'A ∩ C = ∅'],
    correctAnswer: 'C',
    explanation: 'Subset inclusion is transitive: every element of A is in B, and every element of B is in C, so every element of A is in C. Hence A ⊆ C.',
  },
  {
    id: 'p2-proof-analysis',
    paper: 2, topic: 'proof', difficulty: 4,
    stem: "A student argues: 'n² + n is always even, because n² + n = n(n + 1), and one of two consecutive integers is always even.' Is the argument valid?",
    options: ['Valid', 'Invalid — it fails when n = 0', 'Invalid — it assumes what it sets out to prove', 'Invalid — it only works for positive n', 'Invalid — n(n + 1) can be odd'],
    correctAnswer: 'A',
    explanation: 'n(n + 1) is a product of two consecutive integers, one of which is even, so the product is even — for every integer n (including 0 and negatives). The reasoning is valid.',
  },
  {
    id: 'p2-logic-quantifier',
    paper: 2, topic: 'logic', difficulty: 4,
    stem: "Which statement is logically equivalent to 'It is not true that some student passed'?",
    options: ['Some student did not pass', 'Every student passed', 'No student passed', 'Not every student passed', 'Some student passed'],
    correctAnswer: 'C',
    explanation: "Negating 'there exists a student who passed' gives 'for every student, they did not pass' — i.e. no student passed.",
  },

];

// Expose for non-module scripts (browser global) and Node (tooling/tests).
if (typeof module !== 'undefined' && module.exports) module.exports = TMUA_QUESTIONS;
