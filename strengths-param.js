/* Altiora — strengths-param.js. Loaded by app.html directly BEFORE main.js (a separate file because the page's
 * Content-Security-Policy refuses inline scripts). The landing page's "Start from your strengths and
 * interests" link opens app.html?mode=strengths; this leaves the marker main.js reads when it starts, so the
 * strengths view opens on that same load. main.js removes the marker as it reads it. */
const _urlParams = new URLSearchParams(window.location.search);
if (_urlParams.get('mode') === 'strengths') {
  window.sessionStorage.setItem('openStrengthsMode', 'true');
}
