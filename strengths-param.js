/* Altiora — strengths-param.js. Loaded by app.html directly after main.js, exactly where this code used to
 * sit as an inline script; a separate file so the page's Content-Security-Policy can refuse every inline
 * script. Behaviour unchanged. */
// Redirect ?mode=strengths to open strengths panel after init
const _urlParams = new URLSearchParams(window.location.search);
if (_urlParams.get('mode') === 'strengths') {
  window.sessionStorage.setItem('openStrengthsMode', 'true');
}
