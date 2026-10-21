/* ═══════════════════════════════════════════════════════════════
 * Altiora — IB Higher Level requirement matching.
 *
 * Shared by main.js (browser global AltioraIbHl) and the tests (Node).
 *
 * Tag meanings in a course's grades.ibHL:
 *   Mathematics_Advanced  HL Maths Analysis & Approaches only
 *   Mathematics_Standard  HL Maths, either AA or AI
 * A student's HL maths maps to Mathematics_Advanced
 * (data/qualificationMappings.js), so it also satisfies a
 * Mathematics_Standard HL requirement. Mathematics_Standard never
 * satisfies Mathematics_Advanced.
 * ═══════════════════════════════════════════════════════════════ */
(function (/** @type {any} */ root) {
  /**
   * The HL requirement tags a student's HL subject tags satisfy.
   * @param {Iterable<string>} studentHLTags
   * @returns {Set<string>}
   */
  function satisfiedHLTags(studentHLTags) {
    const have = new Set(studentHLTags);
    if (have.has('Mathematics_Advanced')) have.add('Mathematics_Standard');
    return have;
  }

  /**
   * The required HL tags the student's HL subjects do not satisfy.
   * @param {string[]} requiredHLTags  course.grades.ibHL
   * @param {Iterable<string>} studentHLTags
   * @returns {string[]}
   */
  function missingHLTags(requiredHLTags, studentHLTags) {
    const have = satisfiedHLTags(studentHLTags);
    return requiredHLTags.filter(tag => !have.has(tag));
  }

  const api = { satisfiedHLTags, missingHLTags };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AltioraIbHl = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
