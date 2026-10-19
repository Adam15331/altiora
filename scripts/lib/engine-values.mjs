// @ts-check
/* Panel text derived from values the matching engine reads
 * (data/courseRequirements.js). Shared by the migrations that first wrote
 * the panel rows and by the validator, which checks those rows still say
 * what the engine uses. */

/** @param {any} r  an AP requirement object (or one alternative route) */
export function apLines(r) {
  const lines = [];
  if (r.count != null) {
    lines.push(Array.isArray(r.grades) && r.grades.length
      ? `${r.count} AP exams at grades ${r.grades.join(', ')}`
      : `${r.count} AP exams`);
  }
  if (r.gpaMin != null) lines.push(`Minimum GPA ${r.gpaMin}`);
  if (Array.isArray(r.mustInclude) && r.mustInclude.length) lines.push(`Must include ${r.mustInclude.join(' and ')}`);
  if (Array.isArray(r.mustIncludeOneOf)) for (const set of r.mustIncludeOneOf) lines.push(`Must include one of ${set.join(' or ')}`);
  if (Array.isArray(r.excluded) && r.excluded.length) lines.push(`Not counted: ${r.excluded.join(', ')}`);
  return lines;
}

/**
 * The "Advanced Placement: …" panel line for a course's engine-held AP
 * requirement, or null when the engine holds none with a source and date.
 * @param {any} course
 * @returns {string | null}
 */
export function apItem(course) {
  const ap = course.apRequirement;
  if (!(ap && (ap.sourceStatus === 'verified' || ap.sourceStatus === 'partial') && ap.source && ap.checkedDate)) return null;
  const lines = apLines(ap);
  (ap.alternativeRoutes ?? []).forEach((/** @type {any} */ route, /** @type {number} */ i) => {
    const r = apLines(route);
    if (r.length) lines.push(`Alternative route ${i + 1}: ${r.join('; ')}`);
  });
  return lines.length ? `Advanced Placement: ${lines.join('; ')}` : 'Advanced Placement: accepted — see note';
}
