// @ts-check
// Security hardening: self-hosted fonts (no third-party font service), one Content-Security-Policy on
// every page, nothing in the site that the policy would have to be loosened for, and the one wipe path.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { ROOT } from '../scripts/lib/requirements-io.mjs';
import { CSP, cspMeta } from '../scripts/lib/site-pages.mjs';

const read = (/** @type {string} */ f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const tracked = (/** @type {string[]} */ ...globs) => execFileSync('git', ['ls-files', '-co', '--exclude-standard', ...globs], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(f => f && fs.existsSync(path.join(ROOT, f)));
const HTML = tracked('*.html');
// JavaScript the site serves to a browser (not the Node tooling or the tests).
const SHIPPED_JS = tracked('*.js').filter(f => !/^(scripts|tests|node_modules|research)\//.test(f));

test('fonts are self-hosted: nothing references the Google Fonts hosts', () => {
  // Spelt in two parts so this file does not match itself.
  const hosts = ['fonts.' + 'googleapis.com', 'fonts.' + 'gstatic.com'];
  const files = tracked('*.html', '*.css', '*.js', '*.mjs');
  assert.ok(files.length > 450, `only ${files.length} files`);
  for (const f of files) {
    const text = read(f);
    for (const h of hosts) assert.ok(!text.includes(h), `${f} references ${h}`);
  }
});

test('fonts: nine weights × latin and latin-ext as woff2 in /fonts, each with its @font-face rule and licence', () => {
  const WANT = { 'Bricolage Grotesque': [600, 700, 800], 'Hanken Grotesk': [400, 500, 600, 700], 'Space Mono': [400, 700] };
  const css = read('tokens.css');
  const faces = [...css.matchAll(/@font-face \{ font-family: '([^']+)'; font-style: normal; font-weight: (\d+); font-display: swap;\s*src: url\('(fonts\/[^']+)'\) format\('woff2'\);\s*unicode-range: ([^;]+); \}/g)]
    .map(m => ({ family: m[1], weight: Number(m[2]), file: m[3] }));
  assert.equal((css.match(/@font-face/g) ?? []).length, 18);
  assert.equal(faces.length, 18);
  for (const [family, weights] of Object.entries(WANT)) {
    const slug = family.toLowerCase().replace(/ /g, '-');
    for (const w of weights) for (const subset of ['latin', 'latin-ext']) {
      const file = `fonts/${slug}-${subset}-${w}-normal.woff2`;
      assert.ok(faces.some(f => f.family === family && f.weight === w && f.file === file), `${family} ${w} ${subset}`);
      assert.equal(fs.readFileSync(path.join(ROOT, file)).subarray(0, 4).toString('latin1'), 'wOF2', file);
    }
    assert.match(read(`fonts/OFL-${slug}.txt`), /SIL OPEN FONT LICENSE Version 1\.1/, slug);
  }
  // Nothing else in /fonts, and every page loads tokens.css (where the rules are).
  assert.equal(fs.readdirSync(path.join(ROOT, 'fonts')).length, 18 + 3);
  for (const f of HTML) assert.match(read(f), /<link rel="stylesheet" href="[./]*tokens\.css\?v=\d+"/, f);
  // The page's stylesheet version follows the file.
  assert.match(read('app.html'), /tokens\.css\?v=12"/);
  assert.match(read('index.html'), /tokens\.css\?v=12"/);
});

test('Content-Security-Policy: the constant is the agreed policy', () => {
  assert.equal(CSP, "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; "
    + "font-src 'self'; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; manifest-src 'self'; object-src 'none'; "
    + "base-uri 'self'; form-action 'self'");
  const script = /script-src ([^;]+)/.exec(CSP)?.[1] ?? '';
  assert.doesNotMatch(script, /unsafe-inline|unsafe-eval|\*|data:|blob:/);
});

test('Content-Security-Policy: exactly one on every page, identical to the constant, directly after <meta charset>', () => {
  assert.ok(HTML.length >= 413, `only ${HTML.length} pages`);
  const meta = cspMeta();
  for (const f of HTML) {
    const html = read(f);
    assert.equal((html.match(/http-equiv="Content-Security-Policy"/gi) ?? []).length, 1, f);
    assert.ok(html.includes(meta), `${f}: policy differs from the constant`);
    // Directly after <meta charset> (the two hand-written pages wrap it in their csp markers).
    assert.match(html, /<meta charset="UTF-8"\s*\/?>\n\s*(?:<!-- csp:start -->)?<meta http-equiv="Content-Security-Policy"/, f);
    // Before any script or stylesheet.
    const at = html.indexOf(meta);
    const first = html.search(/<script[\s>]|<link[^>]+rel="stylesheet"|<style[\s>]/);
    assert.ok(first === -1 || at < first, `${f}: something loads before the policy`);
  }
});

test('nothing the policy would block: no inline scripts, no inline event handlers, no eval', () => {
  const HANDLER = /<[a-zA-Z][^<>]*\son[a-z]+\s*=/;                    // an on…= attribute inside a tag
  for (const f of HTML) {
    const html = read(f);
    // Every <script> either has a src or is a JSON-LD data block.
    for (const m of html.matchAll(/<script\b([^>]*)>/g)) {
      assert.ok(/\bsrc=/.test(m[1]) || /type="application\/ld\+json"/.test(m[1]), `${f}: inline <script${m[1]}>`);
    }
    assert.doesNotMatch(html, HANDLER, f);
    assert.doesNotMatch(html, /href="javascript:/i, f);
  }
  assert.ok(SHIPPED_JS.includes('main.js') && SHIPPED_JS.includes('strengths-param.js') && SHIPPED_JS.includes('about-pill.js'));
  for (const f of SHIPPED_JS) {
    const js = read(f);
    assert.doesNotMatch(js, HANDLER, `${f}: inline event handler in a template`);
    assert.doesNotMatch(js, /\bnew\s+Function\b|(?<![.\w])eval\s*\(|set(?:Timeout|Interval)\(\s*['"`]/, f);
  }
  // Every script a page loads from the site itself exists.
  for (const f of ['index.html', 'app.html']) {
    for (const m of read(f).matchAll(/<script[^>]+src="([^":]+?)(?:\?v=\d+)?"/g)) assert.ok(fs.existsSync(path.join(ROOT, m[1])), `${f} → ${m[1]}`);
  }
});

test('erase my plan: the wipe removes every key the site owns and the session marker, and writes nothing back', () => {
  const mk = () => {
    const m = new Map();
    return { m, api: { getItem: (/** @type {string} */ k) => (m.has(k) ? m.get(k) : null), setItem: (/** @type {string} */ k, /** @type {string} */ v) => { m.set(k, String(v)); }, removeItem: (/** @type {string} */ k) => { m.delete(k); } } };
  };
  const local = mk(), session = mk();
  local.m.set('someone-elses-key', 'kept');
  session.m.set('openStrengthsMode', 'true');
  /** @type {any} */
  const ctx = { window: { localStorage: local.api, sessionStorage: session.api }, TextEncoder, console };
  vm.createContext(ctx);
  vm.runInContext(`${read('state.js')}\nthis.AltioraState = AltioraState;`, ctx);
  const S = ctx.AltioraState;
  S.setProfile({ qualificationSystem: 'UK_A_Level', subjects: ['Mathematics'], yearGroup: 'Year 12' });
  S.addToShortlist('uk-maths-durham');
  S.setStatementDraft('q1', 'A draft.');
  assert.deepEqual([...S.OWNED_KEYS], ['altiora_state_v1']);
  assert.equal(S.SESSION_MARKER, 'openStrengthsMode');
  for (const k of S.OWNED_KEYS) assert.ok(local.m.has(k), `${k} saved before the wipe`);

  S.erasePlan();
  for (const k of S.OWNED_KEYS) assert.ok(!local.m.has(k), `${k} removed`);
  assert.ok(!session.m.has('openStrengthsMode'));
  assert.equal(local.m.get('someone-elses-key'), 'kept');           // only the site's own keys
  // The page still running must not save anything back before it reloads.
  S.addToShortlist('uk-maths-oxford');
  S.setStatementDraft('q1', 'Typed after the wipe.');
  for (const k of S.OWNED_KEYS) assert.ok(!local.m.has(k), `${k} stays removed`);
  assert.deepEqual([...S.getState().profile.subjects], []);
  // It is the only wipe in the site's code, and the session marker name matches the one that sets it.
  assert.match(read('strengths-param.js'), /sessionStorage\.setItem\('openStrengthsMode'/);
  for (const f of SHIPPED_JS.filter(f => f !== 'state.js')) assert.doesNotMatch(read(f), /localStorage\.(removeItem|clear)\(/, f);
  assert.equal((read('state.js').match(/localStorage\.removeItem\(k\)/g) ?? []).length, 1);
});

test('erase my plan: the menu item, its note and the confirmation wording', () => {
  const app = read('app.html');
  assert.match(app, /<button id="backupImportBtn"[^>]*>Restore my plan from a file<\/button>\s*<input id="backupImportFile"[^>]*>\s*<button id="planEraseBtn" class="stage-menu__item" role="menuitem" type="button">Erase my plan from this device<\/button>/);
  assert.ok(app.includes('<p class="profile-menu__note">Your whole plan in one file on your device. Nothing is uploaded. On a shared or school computer, erase your plan when you finish.</p>'));
  const main = read('main.js');
  assert.ok(main.includes("title: 'Erase your plan from this device?'"));
  assert.ok(main.includes("confirmLabel: 'Erase everything'"));
  assert.ok(main.includes('This removes everything Altiora has saved in this browser: your subjects, grades, shortlist, story and statement drafts. It can’t be undone. Save your plan to a file first if you want to keep it.'));
  assert.match(read('privacy.html'), /You can also erase your plan on the website itself: open the profile menu and choose “Erase my plan from this device”\./);
  assert.doesNotMatch(read('privacy.html'), /Google/);
});
