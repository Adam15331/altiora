// @ts-check
// Save / restore of the student's plan (state.js), the academic-year
// rollover rule (main.js), and the add-to-home-screen setup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { ROOT } from '../scripts/lib/requirements-io.mjs';

const read = (/** @type {string} */ f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

/** A fresh AltioraState in a sandbox with an in-memory localStorage. */
function loadState(/** @type {Record<string, string>} */ initial = {}) {
  const store = new Map(Object.entries(initial));
  const localStorage = {
    getItem: (/** @type {string} */ k) => (store.has(k) ? store.get(k) : null),
    setItem: (/** @type {string} */ k, /** @type {string} */ v) => { store.set(k, String(v)); },
    removeItem: (/** @type {string} */ k) => { store.delete(k); },
  };
  /** @type {any} */
  const ctx = { window: { localStorage }, TextEncoder, console };
  vm.createContext(ctx);
  vm.runInContext(`${read('state.js')}\nthis.AltioraState = AltioraState;`, ctx);
  return { S: ctx.AltioraState, store };
}

/** A plan with something in every part of it. */
function fillPlan(/** @type {any} */ S) {
  S.setStage('building');
  S.setProfile({ qualificationSystem: 'UK_A_Level', subjects: ['Mathematics', 'Physics', 'Chemistry'],
    predictedGrades: { Mathematics: 'A*', Physics: 'A', Chemistry: 'A' },
    yearGroup: 'Year 12', yearsUntilApplication: 1, yearSetAt: '2026-10-01T09:00:00.000Z' });
  S.addCandidateField('engineering');
  S.addToShortlist('uk-maths-durham');
  S.addToShortlist('uk-maths-oxford');
  S.addAchievement({ type: S.ACHIEVEMENT_TYPES[0]?.id ?? 'project', title: 'Robotics club', situation: 's', whatIDid: 'w' });
  S.setStatementDraft('q1', 'I want to study engineering because');
  S.setApplicationTask('test-reg:ESAT+TMUA+TARA', true);
}
const plain = (/** @type {any} */ x) => JSON.parse(JSON.stringify(x));
const withoutVisit = (/** @type {any} */ st) => ({ ...plain(st), meta: { ...st.meta, lastVisit: null } });

test('the plan file is named altiora-plan-YYYY-MM-DD.json and carries a format version and checksum', () => {
  const { S } = loadState();
  assert.equal(S.backupFilename(new Date(2026, 10, 14)), 'altiora-plan-2026-11-14.json');
  const env = S.exportBackup();
  assert.equal(env.app, 'altiora');
  assert.equal(env.kind, 'plan');
  assert.equal(env.schemaVersion, 2);
  assert.equal(env.checksum.algorithm, 'SHA-256');
  assert.equal(env.checksum.value, crypto.createHash('sha256').update(env.data.altiora_state_v1, 'utf8').digest('hex'));
});

test('the built-in SHA-256 matches Node for ASCII, Unicode and block-boundary lengths', () => {
  const { S } = loadState();
  for (const t of ['', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'é漢字🎓'.repeat(40)]) {
    assert.equal(S.sha256Hex(t), crypto.createHash('sha256').update(t, 'utf8').digest('hex'), `length ${t.length}`);
  }
});

test('save → clear → restore brings back every part of the plan', () => {
  const a = loadState();
  fillPlan(a.S);
  const before = a.S.getState();
  const file = JSON.stringify(a.S.exportBackup(), null, 2);
  const b = loadState();                       // a browser with all site data cleared
  assert.equal(b.S.getShortlist().length, 0);
  const res = b.S.importBackup(file);
  assert.equal(res.ok, true);
  assert.deepEqual(withoutVisit(b.S.getState()), withoutVisit(before));
  // …and it was written to storage, not just held in memory.
  assert.deepEqual(withoutVisit(JSON.parse(/** @type {string} */ (b.store.get('altiora_state_v1')))), withoutVisit(before));
});

test('a format-1 file from an older version (older state shape) loads', () => {
  const oldState = {
    profile: { stage: 'choosing', qualificationSystem: 'UK_A_Level', subjects: ['Mathematics', 'Physics'],
      predictedGrades: 'A', interests: [], candidateFields: ['cs'] },   // single average grade, no story, no drafts, no year
    shortlist: ['uk-cs-durham'], progress: {}, meta: { hasOnboarded: true },
  };
  const file = JSON.stringify({ app: 'altiora', schemaVersion: 1, exportedAt: '2026-03-01T10:00:00.000Z',
    data: { altiora_state_v1: JSON.stringify(oldState) } });
  const { S } = loadState();
  assert.equal(S.validateBackup(file).ok, true);
  assert.equal(S.importBackup(file).ok, true);
  const p = S.getProfile();
  assert.deepEqual(plain(p.predictedGrades), { Mathematics: 'A', Physics: 'A' });   // average → per subject
  assert.deepEqual(plain(p.achievements), []);
  assert.deepEqual(plain(p.statementDrafts), { q1: '', q2: '', q3: '' });
  assert.deepEqual(plain(p.applicationTasks), {});
  assert.equal(p.yearsUntilApplication, null);
  assert.deepEqual(plain(S.getShortlist()), ['uk-cs-durham']);
  // A file with no version at all is treated as format 1.
  assert.equal(S.validateBackup(file.replace('"schemaVersion":1,', '')).ok, true);
});

test('invalid or tampered files are refused and change nothing', () => {
  const a = loadState();
  fillPlan(a.S);
  const good = a.S.exportBackup();
  const goodText = JSON.stringify(good);
  const b = loadState();
  b.S.addToShortlist('uk-law-lse');
  const snapshot = plain(b.S.getState());
  const edited = { ...good, data: { altiora_state_v1: good.data.altiora_state_v1.replace('Robotics club', 'Robotics champion') } };
  const wrongType = (() => { const st = JSON.parse(good.data.altiora_state_v1); st.shortlist = 'uk-maths-oxford';
    const raw = JSON.stringify(st); return { ...good, data: { altiora_state_v1: raw }, checksum: { algorithm: 'SHA-256', value: b.S.sha256Hex(raw) } }; })();
  const cases = {
    'not JSON': 'this is not a plan',
    'another app': JSON.stringify({ ...good, app: 'other' }),
    'edited after saving': JSON.stringify(edited),
    'checksum removed': JSON.stringify({ ...good, checksum: undefined }),
    'wrong field type (checksum recomputed)': JSON.stringify(wrongType),
    'newer format': JSON.stringify({ ...good, schemaVersion: 99 }),
    'no saved plan': JSON.stringify({ ...good, data: {} }),
    'truncated': goodText.slice(0, goodText.length - 40),
  };
  for (const [name, text] of Object.entries(cases)) {
    const res = b.S.importBackup(text);
    assert.equal(res.ok, false, name);
    assert.match(res.error, /Nothing has been changed\.$/, name);
    assert.deepEqual(plain(b.S.getState()), snapshot, `${name} changed state`);
  }
  assert.ok(b.S.validateBackup('x'.repeat(b.S.MAX_PLAN_FILE_BYTES + 1)).ok === false, 'oversized');
});

test('describePlan describes an older file as it will load', () => {
  const { S } = loadState();
  const d = S.describePlan({ profile: { qualificationSystem: 'UK_A_Level', subjects: ['Mathematics', 'Physics'], predictedGrades: 'A' }, shortlist: ['uk-cs-durham'] });
  assert.equal(d.grades, 2);          // the single average becomes one grade per subject
  assert.equal(d.story, 0);
  assert.equal(d.draftWords, 0);
  assert.equal(d.shortlist, 1);
});

test('describePlan counts what the file will restore', () => {
  const { S } = loadState();
  fillPlan(S);
  assert.deepEqual(plain(S.describePlan(S.getState())), {
    qualificationSystem: 'UK_A_Level', yearGroup: 'Year 12', stage: 'building', subjects: 3, grades: 3,
    fields: 1, shortlist: 2, story: 1, draftWords: 6, checklistTicks: 1,
  });
});

/* ── Academic-year rollover (main.js) ─────────────────────────────── */
function yearRule() {
  const src = read('main.js');
  const pick = (/** @type {RegExp} */ re) => { const m = re.exec(src); assert.ok(m, String(re)); return m[0]; };
  const code = [
    pick(/const ACADEMIC_YEAR_START_MONTH = \{[^}]+\};/),
    pick(/function academicYearStart\([\s\S]*?\n\}/),
    pick(/function yearNeedsConfirm\([\s\S]*?\n\}/),
  ].join('\n');
  /** @type {any} */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(`${code}\nthis.academicYearStart = academicYearStart; this.yearNeedsConfirm = yearNeedsConfirm; this.START = ACADEMIC_YEAR_START_MONTH;`, ctx);
  return ctx;
}

test('every qualification system has an academic-year start month (September)', () => {
  const { START } = yearRule();
  assert.deepEqual(plain(START), { UK_A_Level: 9, IB: 9, US_AP: 9, SG_A_Level: 9, HK_DSE: 9 });
});

test('a year group set before the current school year began must be confirmed', () => {
  const { yearNeedsConfirm, academicYearStart } = yearRule();
  const now = new Date(2026, 10, 14);                 // 14 Nov 2026
  assert.equal(academicYearStart('UK_A_Level', now).getTime(), new Date(2026, 8, 1).getTime());
  assert.equal(academicYearStart('UK_A_Level', new Date(2026, 7, 31)).getTime(), new Date(2025, 8, 1).getTime());
  const p = (/** @type {any} */ over) => ({ qualificationSystem: 'UK_A_Level', yearGroup: 'Year 12', yearsUntilApplication: 1, ...over });
  assert.equal(yearNeedsConfirm(p({ yearSetAt: new Date(2025, 10, 14).toISOString() }), now), true);   // a year ago
  assert.equal(yearNeedsConfirm(p({ yearSetAt: new Date(2026, 7, 31).toISOString() }), now), true);    // last day of last year
  assert.equal(yearNeedsConfirm(p({ yearSetAt: new Date(2026, 8, 1, 12).toISOString() }), now), false); // this school year
  assert.equal(yearNeedsConfirm(p({ yearSetAt: null }), now), true);                                    // no record of when
  assert.equal(yearNeedsConfirm(p({ yearsUntilApplication: null, yearSetAt: null }), now), false);      // no year to confirm
});

/* ── Add to home screen, without offline or caching ────────────────── */
test('the manifest names Altiora, uses token colours and points at real icons', () => {
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.equal(m.name, 'Altiora');
  assert.equal(m.short_name, 'Altiora');
  const tokens = read('tokens.css');
  for (const c of [m.theme_color, m.background_color]) assert.ok(tokens.includes(c), `${c} is a token`);
  const sizes = (/** @type {string} */ f) => { const b = fs.readFileSync(path.join(ROOT, f)); return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`; };
  for (const icon of m.icons) assert.equal(sizes(icon.src.replace(/^\//, '')), icon.sizes, icon.src);
  assert.ok(m.icons.some((/** @type {any} */ i) => i.sizes === '192x192'));
  assert.ok(m.icons.some((/** @type {any} */ i) => i.sizes === '512x512' && i.purpose === 'maskable'));
  assert.equal(sizes('apple-touch-icon.png'), '180x180');
  for (const f of ['index.html', 'app.html']) {
    const html = read(f);
    assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest"/, f);
    assert.match(html, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png"/, f);
  }
});

test('there is no service worker and no caching of pages or data', () => {
  const files = ['main.js', 'state.js', 'requirements-view.js', 'ib-hl.js', 'index.html', 'app.html', 'manifest.webmanifest'];
  for (const f of files) assert.doesNotMatch(read(f), /serviceWorker|caches\.|CacheStorage|applicationCache|\bsw\.js\b/, f);
  for (const f of fs.readdirSync(ROOT)) assert.doesNotMatch(f, /^(sw|service-worker)\.js$/);
});
