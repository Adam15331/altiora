/* Altiora — about-pill.js (landing page). Was an inline script in index.html; a separate file so the
 * page's Content-Security-Policy can refuse every inline script. */
// About pill: tap/click toggles, close control, click-away and Escape
// dismiss — the same popover pattern as the app's fields menu (hover-reveal
// is CSS, on hover-capable devices only).
(function () {
  var pill = document.getElementById('aboutPill');
  var panel = document.getElementById('aboutPanel');
  if (!pill || !panel) return;
  function set(open) { panel.classList.toggle('open', open); pill.setAttribute('aria-expanded', String(open)); }
  pill.addEventListener('click', function (e) { e.stopPropagation(); set(!panel.classList.contains('open')); });
  // Closing from inside the panel hands focus back to the pill, so a
  // keyboard user is never dropped onto <body>; tabbing out closes it.
  function closeToPill() { var inside = panel.contains(document.activeElement); set(false); if (inside) pill.focus(); }
  document.getElementById('aboutClose').addEventListener('click', function (e) { e.stopPropagation(); closeToPill(); });
  panel.addEventListener('click', function (e) { e.stopPropagation(); });
  panel.parentNode.addEventListener('focusout', function (e) { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) set(false); });
  document.addEventListener('click', function () { set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeToPill(); });
})();
