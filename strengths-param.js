/* Altiora — strengths-param.js. Loaded by app.html directly BEFORE main.js (a separate file because the page's
 * Content-Security-Policy refuses inline scripts). The landing page's "Start from your strengths and
 * interests" link opens app.html?mode=strengths; this leaves the marker main.js reads, and removes, when it
 * starts. main.js then opens the strengths view — at once for a returning student, at the end of onboarding
 * for a new one — without changing the saved stage. */
const _urlParams = new URLSearchParams(window.location.search);
if (_urlParams.get('mode') === 'strengths') {
  window.sessionStorage.setItem('openStrengthsMode', 'true');
}
