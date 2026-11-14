/* ═══════════════════════════════════════════════════════════════
 * Altiora — state.js
 *
 * Single source of truth for a student's journey data, persisted to
 * localStorage. This module owns the shape, the persistence, and the
 * change-notification plumbing. It does NOT touch the DOM — UI code
 * subscribes via AltioraState.subscribe() and reads through the
 * getters.
 *
 * Loaded as a plain script (no bundler), so it exposes one global:
 *   AltioraState
 *
 * Storage:
 *   key     "altiora_state_v1"   (versioned so we can migrate later)
 *   format  JSON-serialised state object
 *
 * If localStorage is unavailable (private browsing, blocked cookies),
 * everything still works against an in-memory copy — nothing is
 * persisted, but nothing throws either.
 * ═══════════════════════════════════════════════════════════════ */

'use strict';

const AltioraState = (() => {

  const STORAGE_KEY = 'altiora_state_v1';

  // The FORMAT version of a saved plan file (the envelope, not the state
  // shape). Every version loads through _hydrateFromRaw — the same path old
  // localStorage saves take — so a lower number is just an older file:
  //   1  { app, schemaVersion, exportedAt, data }            (backup files)
  //   2  adds kind: 'plan' and a SHA-256 checksum of the saved data
  // A HIGHER number was written by a newer build and is refused.
  const SCHEMA_VERSION = 2;
  // A plan file is a few KB to a few hundred KB; anything far larger is not one.
  const MAX_PLAN_FILE_BYTES = 5 * 1024 * 1024;

  // Every localStorage key the app owns. There is exactly one today; the
  // export envelope is keyed by name so adding a second key later needs
  // no change to the file format.
  const OWNED_KEYS = [STORAGE_KEY];

  /* ─── Default shape ───────────────────────────────────────────
   * Returned fresh on first visit and by resetState(). Kept as a
   * factory (not a shared constant) so callers can never mutate the
   * canonical defaults by reference.
   * ───────────────────────────────────────────────────────────── */
  function freshState() {
    return {
      profile: {
        stage:               null,   // "exploring" | "choosing" | "building" | "applying"
        qualificationSystem: null,
        subjects:            [],      // subject tag strings
        predictedGrades:     null,    // letter systems: {subject → grade} map · IB: points string · AP: {subject → '1'-'5'} map (legacy single letter is discarded, never converted)
        interests:           [],      // category strings
        candidateFields:     [],      // category ids the student is considering (max 3, order = priority)
        achievements:        [],      // the student's STORY BANK: entries with reflections + optional field tags — see addAchievement()
        applicationTasks:    {},      // Applying checklist: { taskId: true } for completed tasks — see setApplicationTask()
        statementDrafts:     { q1: '', q2: '', q3: '' },  // UCAS statement drafts, one string per official question — see setStatementDraft()
        yearGroup:            null,   // raw year label in the student's own system, e.g. "Year 12", "Grade 11", "Form 5"
        yearsUntilApplication: null,  // normalised scale driving ALL logic: 3 (3+ years out) | 2 | 1 | 0 (application year)
        yearSetAt:            null,   // ISO date the year was last set or confirmed — read by yearNeedsConfirm() in main.js
      },
      shortlist: [],                  // course id strings
      progress:  {},                  // keyed by course id or milestone
      meta: {
        firstVisit:  null,            // ISO timestamp
        lastVisit:   null,            // ISO timestamp
        hasOnboarded: false,
      },
    };
  }

  /* ─── localStorage availability probe ─────────────────────────
   * Some browsers expose localStorage but throw on write (Safari
   * private mode, quota-exceeded, disabled storage). We test with a
   * real round-trip and cache the result.
   * ───────────────────────────────────────────────────────────── */
  const _storageOK = (() => {
    try {
      const probe = '__altiora_probe__';
      window.localStorage.setItem(probe, probe);
      window.localStorage.removeItem(probe);
      return true;
    } catch (_) {
      return false;
    }
  })();

  /* ─── Internals ───────────────────────────────────────────────── */
  let _state       = null;     // the live state object (single instance)
  const _listeners = new Set(); // subscribe() callbacks

  // Shallow-merge persisted data onto a fresh default so that fields
  // added in future builds are always present even for old saves.
  function _hydrateFromRaw(raw) {
    const base   = freshState();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      return base;            // corrupt JSON → start clean
    }
    if (!parsed || typeof parsed !== 'object') return base;
    const profile = { ...base.profile, ...(parsed.profile || {}) };
    // Old saves have no achievements key (or, defensively, a corrupt one) —
    // normalise to a clean array so every caller can rely on the shape.
    if (!Array.isArray(profile.achievements)) profile.achievements = [];
    // Applying checklist state is additive: old saves have no key at all.
    // Normalise to a plain map of taskId → true so callers can rely on it.
    if (!profile.applicationTasks || typeof profile.applicationTasks !== 'object'
        || Array.isArray(profile.applicationTasks)) {
      profile.applicationTasks = {};
    } else {
      profile.applicationTasks = Object.fromEntries(
        Object.entries(profile.applicationTasks).filter(([, v]) => v === true));
    }
    // UCAS statement drafts are additive: old saves have no key. Normalise
    // to the three-question shape with plain strings so callers never guard.
    const drafts = profile.statementDrafts;
    profile.statementDrafts = {
      q1: (drafts && typeof drafts.q1 === 'string') ? drafts.q1 : '',
      q2: (drafts && typeof drafts.q2 === 'string') ? drafts.q2 : '',
      q3: (drafts && typeof drafts.q3 === 'string') ? drafts.q3 : '',
    };
    // Per-subject grade migration: letter-profile systems (UK/SG A-Levels,
    // HK DSE) moved from one average string to a {subject → grade} map. An
    // old save's single average hydrates as that grade for EVERY saved
    // subject — nothing lost, nothing re-asked. IB/AP strings pass through.
    const LETTER_SYSTEMS = ['UK_A_Level', 'SG_A_Level', 'HK_DSE'];
    if (typeof profile.predictedGrades === 'string' && profile.predictedGrades
        && LETTER_SYSTEMS.includes(profile.qualificationSystem)
        && Array.isArray(profile.subjects) && profile.subjects.length) {
      const uniform = profile.predictedGrades;
      profile.predictedGrades = Object.fromEntries(profile.subjects.map(s => [s, uniform]));
    }
    // Additive story-bank fields: entries saved before the story rebuild have
    // no reflection prompts and no field tags. Backfill them so every entry
    // has the full shape (empty reflections, untagged = General). Pre-existing
    // data is preserved untouched.
    profile.achievements = profile.achievements
      .filter(a => a && typeof a === 'object')
      .map(a => ({
        situation: '', whatIDid: '', whatItTaught: '', whyItMattered: '',
        ...a,
        fields: Array.isArray(a.fields) ? a.fields.filter(f => typeof f === 'string') : [],
      }));
    return {
      profile,
      shortlist: Array.isArray(parsed.shortlist) ? parsed.shortlist.slice() : base.shortlist,
      progress:  (parsed.progress && typeof parsed.progress === 'object') ? { ...parsed.progress } : base.progress,
      // Note: any unknown top-level keys in old saves (from removed/experimental
      // features) are simply not copied here, so they're ignored cleanly.
      meta:      { ...base.meta,     ...(parsed.meta     || {}) },
    };
  }

  function _persist() {
    if (!_storageOK) return;            // in-memory fallback — no-op
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch (_) {
      // Write failed after the probe passed (e.g. quota). Swallow so
      // the app keeps running on the in-memory copy.
    }
  }

  // Persist + notify. Called after every mutation.
  function _commit() {
    _persist();
    _notify();
  }

  function _notify() {
    // Pass a snapshot so listeners can't mutate live state by reference.
    const snapshot = getState();
    _listeners.forEach(cb => {
      try {
        cb(snapshot);
      } catch (err) {
        // A throwing listener must not break other listeners or the
        // mutation that triggered them.
        console.error('[AltioraState] subscriber threw:', err);
      }
    });
  }

  /* ─── Load / initialise ───────────────────────────────────────
   * Hydrate from storage if present, else start fresh with firstVisit
   * stamped. Either way, lastVisit is refreshed on every load.
   * ───────────────────────────────────────────────────────────── */
  function _init() {
    const raw = _storageOK ? window.localStorage.getItem(STORAGE_KEY) : null;
    const now = new Date().toISOString();

    if (raw) {
      _state = _hydrateFromRaw(raw);
      _state.meta.lastVisit = now;
    } else {
      _state = freshState();
      _state.meta.firstVisit  = now;
      _state.meta.lastVisit   = now;
      _state.meta.hasOnboarded = false;
    }
    _persist();   // write back the refreshed lastVisit / fresh defaults
  }

  /* ═══════════════════════════════════════════════════════════════
   * BACKUP: EXPORT / IMPORT
   * A file the student keeps. Nothing leaves the device and nothing is
   * stored by us — the envelope is written locally and read back locally.
   * ═══════════════════════════════════════════════════════════════ */

  /* SHA-256 (FIPS 180-4) over a UTF-8 string, synchronous so validation
   * stays a pure function. It detects a file edited or damaged after it
   * was saved; it is an integrity check, not security — anyone editing the
   * file on purpose could recompute it. */
  const _K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  function sha256Hex(str) {
    const bytes = new TextEncoder().encode(String(str));
    const bitLen = bytes.length * 8;
    const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000));
    view.setUint32(padded.length - 4, bitLen >>> 0);
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const W = new Uint32Array(64);
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let off = 0; off < padded.length; off += 64) {
      for (let i = 0; i < 16; i++) W[i] = view.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
        const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + _K[i] + W[i]) >>> 0;
        const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(x => x.toString(16).padStart(8, '0')).join('');
  }

  // The full envelope, ready to serialise. `data` is keyed by localStorage
  // key name so a future second key needs no format change. The whole plan
  // — profile, subjects, grades, fields, shortlist, story, statement drafts,
  // checklist ticks — is the one state object under STORAGE_KEY.
  function exportBackup() {
    const data = {};
    OWNED_KEYS.forEach(k => {
      if (k === STORAGE_KEY) {
        // Serialise the LIVE state, not the stored string: they are
        // equivalent, and this also works when storage is unavailable.
        data[k] = JSON.stringify(_state);
        return;
      }
      if (_storageOK) {
        const v = window.localStorage.getItem(k);
        if (v != null) data[k] = v;
      }
    });
    return {
      app: 'altiora',
      kind: 'plan',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data,
      checksum: { algorithm: 'SHA-256', value: sha256Hex(data[STORAGE_KEY]) },
    };
  }

  // Plan filename: altiora-plan-YYYY-MM-DD.json (the student's local date).
  function backupFilename(now) {
    const d = now instanceof Date ? now : new Date();
    const pad = n => String(n).padStart(2, '0');
    return `altiora-plan-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
  }

  // Structural check of the saved state inside a file. Hydration is
  // forgiving (it fills in missing fields for older files) — this catches
  // the opposite: a field that IS present but has the wrong type, which
  // only happens when a file was edited or damaged. Absent fields are fine.
  function _stateShapeError(inner) {
    const isObj = v => v != null && typeof v === 'object' && !Array.isArray(v);
    const isStrArr = v => Array.isArray(v) && v.every(x => typeof x === 'string');
    const optional = (obj, key, ok) => !(key in obj) || obj[key] === null || ok(obj[key]);
    if ('profile' in inner && !isObj(inner.profile)) return 'profile';
    if ('shortlist' in inner && !isStrArr(inner.shortlist)) return 'shortlist';
    if ('progress' in inner && !isObj(inner.progress)) return 'progress';
    if ('meta' in inner && !isObj(inner.meta)) return 'meta';
    const p = inner.profile || {};
    const checks = {
      stage:                 v => typeof v === 'string',
      qualificationSystem:   v => typeof v === 'string',
      subjects:              isStrArr,
      predictedGrades:       v => typeof v === 'string' || (isObj(v) && Object.values(v).every(x => typeof x === 'string')),
      interests:             isStrArr,
      candidateFields:       isStrArr,
      achievements:          v => Array.isArray(v) && v.every(isObj),
      applicationTasks:      isObj,
      statementDrafts:       v => isObj(v) && Object.values(v).every(x => typeof x === 'string'),
      yearGroup:             v => typeof v === 'string',
      yearsUntilApplication: v => Number.isInteger(v) && v >= 0 && v <= 3,
      yearSetAt:             v => typeof v === 'string' && !Number.isNaN(Date.parse(v)),
    };
    for (const [key, ok] of Object.entries(checks)) if (!optional(p, key, ok)) return `profile.${key}`;
    return null;
  }

  const DAMAGED = 'That file’s saved plan is damaged or has been edited, so it can’t be restored. Nothing has been changed.';

  // Validate WITHOUT touching state. Returns { ok:true, envelope, inner } or
  // { ok:false, error } with a message meant to be shown to the student.
  // Accepts format 1 (no checksum) and 2 (checksum required and checked).
  function validateBackup(text) {
    if (typeof text !== 'string' || text.length > MAX_PLAN_FILE_BYTES) {
      return { ok: false, error: 'That file is too large to be an Altiora plan. Nothing has been changed.' };
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (_) {
      return { ok: false, error: 'That file isn’t readable — it may be incomplete or not an Altiora plan file. Nothing has been changed.' };
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || parsed.app !== 'altiora') {
      return { ok: false, error: 'That file isn’t an Altiora plan. Nothing has been changed.' };
    }
    // A LOWER version is not an error: it is an older file, and it goes
    // through the same hydration path old localStorage saves take.
    const v = parsed.schemaVersion ?? 1;
    if (!Number.isInteger(v) || v < 1) return { ok: false, error: DAMAGED };
    if (v > SCHEMA_VERSION) {
      return { ok: false, error: 'That file was saved by a newer version of Altiora than this one. Nothing has been changed.' };
    }
    if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)
        || typeof parsed.data[STORAGE_KEY] !== 'string') {
      return { ok: false, error: 'That file is missing its saved plan. Nothing has been changed.' };
    }
    const raw = parsed.data[STORAGE_KEY];
    if (v >= 2) {
      const sum = parsed.checksum;
      if (!sum || sum.algorithm !== 'SHA-256' || typeof sum.value !== 'string'
          || sum.value.toLowerCase() !== sha256Hex(raw)) {
        return { ok: false, error: DAMAGED };
      }
    }
    // The payload must itself be parseable and well-formed before we accept
    // the file — otherwise a truncated export would validate and wipe state.
    let inner;
    try { inner = JSON.parse(raw); } catch (_) { return { ok: false, error: DAMAGED }; }
    if (!inner || typeof inner !== 'object' || Array.isArray(inner) || _stateShapeError(inner)) {
      return { ok: false, error: DAMAGED };
    }
    return { ok: true, envelope: parsed, inner };
  }

  // What a plan holds, as counts, for the restore confirmation and for the
  // "currently on this device" comparison. Reads the HYDRATED shape, so an
  // older file is described exactly as it will load. Pure.
  function describePlan(stateLike) {
    // Always hydrate (idempotent on current state) so an older file's
    // missing fields are filled exactly as they will be on restore.
    const s = _hydrateFromRaw(JSON.stringify(stateLike ?? {}));
    const p = s.profile;
    const grades = p.predictedGrades;
    const drafts = Object.values(p.statementDrafts || {});
    return {
      qualificationSystem: p.qualificationSystem || null,
      yearGroup: p.yearGroup || null,
      stage: p.stage || null,
      subjects: p.subjects.length,
      grades: typeof grades === 'string' ? (grades ? 1 : 0)
        : (grades && typeof grades === 'object' ? Object.values(grades).filter(Boolean).length : 0),
      fields: p.candidateFields.length,
      shortlist: s.shortlist.length,
      story: p.achievements.length,
      draftWords: drafts.reduce((n, d) => n + (d.trim() ? d.trim().split(/\s+/).length : 0), 0),
      checklistTicks: Object.keys(p.applicationTasks).length,
    };
  }

  // All-or-nothing REPLACE. Validates first; only on success does any
  // state change happen. Returns the same result shape as validateBackup.
  function importBackup(text) {
    const res = validateBackup(text);
    if (!res.ok) return res;
    const raw = res.envelope.data[STORAGE_KEY];
    // The SAME hydration path old saves use — no parallel migration, so a
    // format-1 file and a format-2 file load identically.
    const next = _hydrateFromRaw(raw);
    _state = next;
    _state.meta.lastVisit = new Date().toISOString();
    OWNED_KEYS.filter(k => k !== STORAGE_KEY).forEach(k => {
      const v = res.envelope.data[k];
      if (_storageOK && typeof v === 'string') {
        try { window.localStorage.setItem(k, v); } catch (_) { /* quota — keep going */ }
      }
    });
    _commit();
    return { ok: true, envelope: res.envelope };
  }

  /* ─── Deep-ish clone for reads ────────────────────────────────
   * structuredClone where available, JSON fallback otherwise. Keeps
   * getState() callers from mutating internal state by reference.
   * ───────────────────────────────────────────────────────────── */
  function _clone(obj) {
    if (typeof structuredClone === 'function') return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
  }

  /* ═══════════════════════════════════════════════════════════════
   * PUBLIC API
   * ═══════════════════════════════════════════════════════════════ */

  function getState()    { return _clone(_state); }
  function getProfile()  { return _clone(_state.profile); }
  function getShortlist(){ return _state.shortlist.slice(); }
  function getProgress() { return _clone(_state.progress); }

  function setStage(stage) {
    _state.profile.stage = stage;
    _commit();
  }

  // Merge a partial object into profile. Only known keys are copied so
  // a stray field can't pollute the shape.
  function setProfile(partial) {
    if (!partial || typeof partial !== 'object') return;
    const allowed = ['stage', 'qualificationSystem', 'subjects', 'predictedGrades', 'interests', 'candidateFields',
                     'yearGroup', 'yearsUntilApplication', 'yearSetAt', 'applicationTasks'];
    allowed.forEach(key => {
      if (key in partial) _state.profile[key] = partial[key];
    });
    _commit();
  }

  /* ─── Candidate fields ────────────────────────────────────────
   * The durable output of the exploring stage: up to MAX_CANDIDATE_FIELDS
   * course-category ids the student is considering, in priority order.
   * The Subject Planner optimises subject combinations across this set.
   * ───────────────────────────────────────────────────────────── */
  const MAX_CANDIDATE_FIELDS = 3;

  function getCandidateFields() {
    const cf = _state.profile.candidateFields;
    return Array.isArray(cf) ? cf.slice() : [];
  }

  // Returns true when the field is in the set after the call (added now or
  // already present); false when the cap prevented adding — callers use the
  // false case to show a gentle "up to 3" message.
  function addCandidateField(categoryId) {
    if (typeof categoryId !== 'string' || !categoryId) return false;
    if (!Array.isArray(_state.profile.candidateFields)) _state.profile.candidateFields = [];
    const cf = _state.profile.candidateFields;
    if (cf.includes(categoryId)) return true;
    if (cf.length >= MAX_CANDIDATE_FIELDS) return false;
    cf.push(categoryId);
    _commit();
    return true;
  }

  function removeCandidateField(categoryId) {
    if (!Array.isArray(_state.profile.candidateFields)) return;
    const cf = _state.profile.candidateFields;
    const i = cf.indexOf(categoryId);
    if (i !== -1) {
      cf.splice(i, 1);
      _commit();
    }
  }

  /* ─── Achievements & activities log ───────────────────────────
   * A tracker only: the student's own record of awards, certificates,
   * roles, volunteering, work experience, and activities — for use in
   * personal statements, applications, and interviews. Deliberately NO
   * university-matching or scoring on top of this: universities don't
   * publish verifiable extracurricular weightings, so any matching
   * would mean fabricating data.
   * ───────────────────────────────────────────────────────────── */
  const ACHIEVEMENT_TYPES = [
    { id: 'award',        label: 'Award / Prize' },
    { id: 'certificate',  label: 'Certificate / Qualification' },
    { id: 'competition',  label: 'Competition' },
    { id: 'project',      label: 'Project' },
    { id: 'leadership',   label: 'Leadership / Role' },
    { id: 'volunteering', label: 'Volunteering / Community' },
    { id: 'work',         label: 'Work Experience / Internship' },
    { id: 'activity',     label: 'Extracurricular Activity' },
    // Widened categories — the things students overlook. "Paid work" and
    // "Volunteering or community" were specified but collide with the
    // existing work / volunteering types, which stay authoritative.
    { id: 'caring',       label: 'Caring or family responsibility' },
    { id: 'sport',        label: 'Sport' },
    { id: 'arts',         label: 'Arts or music' },
    { id: 'club',         label: 'Club or society' },
    { id: 'selftaught',   label: 'Self-taught or independent learning' },
    { id: 'other',        label: 'Other' },
  ];
  const _ACHIEVEMENT_TYPE_IDS = new Set(ACHIEVEMENT_TYPES.map(t => t.id));
  // Scalar (string) fields. Basic metadata first, then the three counsel-style
  // reflection prompts that turn a record into a story. `fields` (the field
  // tags) is an array and handled separately below.
  const _ACHIEVEMENT_FIELDS   = ['type', 'title', 'organisation', 'level', 'date', 'description',
                                 'situation', 'whatIDid', 'whatItTaught', 'whyItMattered'];

  function _achievementsRef() {
    if (!Array.isArray(_state.profile.achievements)) _state.profile.achievements = [];
    return _state.profile.achievements;
  }

  // Copy only known fields, as trimmed strings; unknown keys can't pollute
  // the shape, and optional fields normalise to '' rather than undefined.
  function _sanitizeAchievementFields(source, target) {
    _ACHIEVEMENT_FIELDS.forEach(key => {
      if (key in source) target[key] = (source[key] == null) ? '' : String(source[key]).trim();
    });
    return target;
  }

  // Field tags: an array of candidate-field category ids. Deduped, coerced to
  // non-empty strings. Kept even when a field is later unpinned — the caller
  // decides how to display an inactive tag; the data is never silently dropped.
  function _sanitizeAchievementFieldTags(source) {
    if (!Array.isArray(source)) return [];
    const out = [];
    source.forEach(f => {
      const s = (f == null) ? '' : String(f).trim();
      if (s && !out.includes(s)) out.push(s);
    });
    return out;
  }

  function getAchievements() {
    return _clone(_achievementsRef());
  }

  // Returns the new entry's id, or null when the entry is invalid
  // (type must be from ACHIEVEMENT_TYPES; title must be non-empty).
  function addAchievement(entry) {
    if (!entry || typeof entry !== 'object') return null;
    const clean = _sanitizeAchievementFields(entry, {
      type: '', title: '', organisation: '', level: '', date: '', description: '',
      situation: '', whatIDid: '', whatItTaught: '', whyItMattered: '',
    });
    if (!_ACHIEVEMENT_TYPE_IDS.has(clean.type) || !clean.title) return null;
    clean.fields = _sanitizeAchievementFieldTags(entry.fields);
    clean.id = 'ach_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    _achievementsRef().push(clean);
    _commit();
    return clean.id;
  }

  // Merge a partial update into an existing entry. Returns true on success;
  // false when the entry doesn't exist or the update would break validity.
  function updateAchievement(id, partial) {
    if (!partial || typeof partial !== 'object') return false;
    const entry = _achievementsRef().find(a => a.id === id);
    if (!entry) return false;
    const merged = _sanitizeAchievementFields(partial, { ...entry });
    if (!_ACHIEVEMENT_TYPE_IDS.has(merged.type) || !merged.title) return false;
    if ('fields' in partial) merged.fields = _sanitizeAchievementFieldTags(partial.fields);
    Object.assign(entry, merged);
    _commit();
    return true;
  }

  function removeAchievement(id) {
    const list = _achievementsRef();
    const i = list.findIndex(a => a.id === id);
    if (i !== -1) {
      list.splice(i, 1);
      _commit();
    }
  }

  /* ─── Applying checklist ──────────────────────────────────────
   * Completed-task state for the Applying dashboard, keyed by STABLE
   * task ids (e.g. "test-reg:ESAT"). Because ids are derived from the
   * task's meaning rather than its position, a checked task keeps its
   * tick when the shortlist changes around it, and tasks that stop
   * applying simply stop being generated — their state is harmless.
   * ───────────────────────────────────────────────────────────── */
  function _tasksRef() {
    if (!_state.profile.applicationTasks || typeof _state.profile.applicationTasks !== 'object') {
      _state.profile.applicationTasks = {};
    }
    return _state.profile.applicationTasks;
  }

  function getApplicationTasks() {
    return { ..._tasksRef() };
  }

  function isApplicationTaskDone(taskId) {
    return _tasksRef()[taskId] === true;
  }

  function setApplicationTask(taskId, done) {
    if (typeof taskId !== 'string' || !taskId) return;
    const tasks = _tasksRef();
    if (done) tasks[taskId] = true; else delete tasks[taskId];
    _commit();
  }

  /* ─── UCAS statement drafts ───────────────────────────────────
   * Three long-form strings, one per official question. Draft text is
   * stored verbatim (no trimming — whitespace is the student's own and
   * counts toward the UCAS character limit).
   * ───────────────────────────────────────────────────────────── */
  function _draftsRef() {
    const d = _state.profile.statementDrafts;
    if (!d || typeof d !== 'object') {
      _state.profile.statementDrafts = { q1: '', q2: '', q3: '' };
    }
    return _state.profile.statementDrafts;
  }

  function getStatementDrafts() {
    return { ..._draftsRef() };
  }

  function setStatementDraft(q, text) {
    if (!['q1', 'q2', 'q3'].includes(q)) return;
    _draftsRef()[q] = (text == null) ? '' : String(text);
    _commit();
  }

  function addToShortlist(courseId) {
    if (courseId == null) return;
    if (!_state.shortlist.includes(courseId)) {
      _state.shortlist.push(courseId);
      _commit();
    }
  }

  function removeFromShortlist(courseId) {
    const i = _state.shortlist.indexOf(courseId);
    if (i !== -1) {
      _state.shortlist.splice(i, 1);
      _commit();
    }
  }

  function isInShortlist(courseId) {
    return _state.shortlist.includes(courseId);
  }

  function setProgress(key, value) {
    if (key == null) return;
    _state.progress[key] = value;
    _commit();
  }

  // Mark whether the student has completed the entry/stage-selection
  // flow. Defaults to true so callers can just call setOnboarded().
  function setOnboarded(value = true) {
    _state.meta.hasOnboarded = !!value;
    _commit();
  }

  // Wipe everything back to a fresh first-visit state, persist, notify.
  function resetState() {
    const now = new Date().toISOString();
    _state = freshState();
    _state.meta.firstVisit = now;
    _state.meta.lastVisit  = now;
    _commit();
  }

  /* ─── Reactivity ──────────────────────────────────────────────
   * subscribe(cb) registers a callback fired (with a state snapshot)
   * on every change. Returns an unsubscribe function.
   * ───────────────────────────────────────────────────────────── */
  function subscribe(callback) {
    if (typeof callback !== 'function') return () => {};
    _listeners.add(callback);
    return () => _listeners.delete(callback);
  }

  // Build initial state at module load.
  _init();

  return {
    getState,
    getProfile,
    getShortlist,
    getProgress,
    setStage,
    setProfile,
    getCandidateFields,
    addCandidateField,
    removeCandidateField,
    MAX_CANDIDATE_FIELDS,
    getApplicationTasks,
    isApplicationTaskDone,
    setApplicationTask,
    getStatementDrafts,
    setStatementDraft,
    getAchievements,
    addAchievement,
    updateAchievement,
    removeAchievement,
    ACHIEVEMENT_TYPES,
    addToShortlist,
    removeFromShortlist,
    isInShortlist,
    setProgress,
    setOnboarded,
    resetState,
    subscribe,
    // Backup: a file the student keeps. Nothing is uploaded anywhere.
    exportBackup,
    backupFilename,
    validateBackup,
    importBackup,
    describePlan,
    sha256Hex,
    MAX_PLAN_FILE_BYTES,
    // Exposed for debugging / future migrations.
    STORAGE_KEY,
    SCHEMA_VERSION,
    storageAvailable: _storageOK,
  };
})();

/* ─── Example usage (uncomment to try in the console) ─────────────
// AltioraState.subscribe(s => console.log('state changed →', s));
//
// AltioraState.setStage('exploring');
// AltioraState.setProfile({ qualificationSystem: 'IB', subjects: ['Mathematics_Advanced', 'Physics'] });
// AltioraState.addToShortlist('oxford-cs');
// AltioraState.addToShortlist('imperial-cs');
// console.log('shortlisted oxford-cs?', AltioraState.isInShortlist('oxford-cs')); // true
// AltioraState.removeFromShortlist('oxford-cs');
// AltioraState.setProgress('imperial-cs', { applied: true, personalStatement: 'draft' });
//
// console.log('profile  →', AltioraState.getProfile());
// console.log('shortlist→', AltioraState.getShortlist());
// console.log('progress →', AltioraState.getProgress());
// console.log('full     →', AltioraState.getState());
//
// AltioraState.resetState(); // back to a clean first-visit state
// ───────────────────────────────────────────────────────────────── */
