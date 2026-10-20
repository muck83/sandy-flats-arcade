/**
 * Sandy Flats Arcade: results backend.
 * A Google Apps Script web app bound to one Google Sheet that Mr. Crowell owns.
 *
 * Tabs (created on first run by setup()):
 *   Roster    sid | name | class | email | code
 *   Progress  sid | game | updated | levelsDone | levelsTotal | coreDone | coreTotal | standard | specials | assisted | tickets | levels | raw
 *   Events    time | sid | game | type | detail
 *   Responses time | sid | lesson | q | kind | answer | correct   (lesson slideshows: polls, typed answers)
 *   Climb     sid | updated | theta | sessions | secure | retained | frontier | map | today | hist | ov | state   (one row per student)
 *   ClimbLog  time | sid | session | skill | template | seed | mode | answer | result | tag | secs | flags   (every Climb answer)
 *   (Responses, Climb and ClimbLog are created the first time they are needed.)
 *
 * Script properties (Project Settings > Script properties):
 *   TEACHER_KEY   long random string; the class view asks for it once
 *   AUTH_MODE     google | code | both (setup() sets google)
 *   CLIENT_ID     Google OAuth web client id (google / both)
 *   DOMAIN        school email domain, e.g. aisr.org (google / both)
 *
 * Deploy: Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.
 * The arcade calls it with POST text/plain JSON (no CORS preflight).
 */

var TABS = {
  Roster: ['sid', 'name', 'class', 'email', 'code'],
  Progress: ['sid', 'game', 'updated', 'levelsDone', 'levelsTotal', 'coreDone', 'coreTotal', 'standard', 'specials', 'assisted', 'tickets', 'levels', 'raw'],
  Events: ['time', 'sid', 'game', 'type', 'detail'],
  Responses: ['time', 'sid', 'lesson', 'q', 'kind', 'answer', 'correct'],
  Climb: ['sid', 'updated', 'theta', 'sessions', 'secure', 'retained', 'frontier', 'map', 'today', 'hist', 'ov', 'state'],
  ClimbLog: ['time', 'sid', 'session', 'skill', 'template', 'seed', 'mode', 'answer', 'result', 'tag', 'secs', 'flags'],
  ClimbAsk: ['time', 'sid', 'session', 'screen', 'skill', 'template', 'seed', 'note', 'answer', 'vals', 'status', 'reply', 'closed']
};
var GAMES = /^g[1-9][0-9]?$/;
var MAX_RAW = 40000;

function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(TABS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) { sh.appendRow(TABS[name]); sh.setFrozenRows(1); }
  });
  var p = PropertiesService.getScriptProperties();
  if (!p.getProperty('TEACHER_KEY')) p.setProperty('TEACHER_KEY', Utilities.getUuid().replace(/-/g, ''));
  if (!p.getProperty('AUTH_MODE')) p.setProperty('AUTH_MODE', 'google');
  if (!p.getProperty('DOMAIN')) p.setProperty('DOMAIN', 'aisr.org');
  if (!p.getProperty('CLIENT_ID')) p.setProperty('CLIENT_ID', 'paste the Client ID here');
  Logger.log('Teacher key: ' + p.getProperty('TEACHER_KEY'));
}

/** Fills empty `code` cells in Roster with 6-character student codes (no 0/O/1/I/L). */
function makeStudentCodes() {
  var sh = SpreadsheetApp.getActive().getSheetByName('Roster');
  var rows = sh.getDataRange().getValues(), used = {};
  rows.slice(1).forEach(function (r) { if (r[4]) used[String(r[4]).toUpperCase()] = 1; });
  var A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0] || rows[i][4]) continue;
    var c; do { c = ''; for (var k = 0; k < 6; k++) c += A.charAt(Math.floor(Math.random() * A.length)); } while (used[c]);
    used[c] = 1; sh.getRange(i + 1, 5).setValue(c);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: 'sandy-flats-arcade' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var out;
  try {
    var req = JSON.parse(e.postData.contents || '{}');
    out = route(req);
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function route(req) {
  switch (req.op) {
    case 'hello': return { ok: true, student: publicStudent(auth(req)) };
    case 'load': return load(auth(req));
    case 'save': return save(auth(req), req);
    case 'mine': return mine(auth(req));
    case 'class': teacher(req); return classView();
    case 'live': var cs = climbSession(); return { ok: true, live: getLive(), climb: cs && cs.state !== 'ended' ? { id: cs.id, state: cs.state, cls: cs.cls, next: cs.next || 0 } : null };
    case 'answer': return answer(auth(req), req);
    case 'myAnswers': return myAnswers(auth(req), req);
    case 'setLive': teacher(req); return setLive(req);
    case 'answers': teacher(req); return answersFor(req);
    case 'participation': teacher(req); return participation();
    case 'roster': teacher(req); return { ok: true, roster: rosterRows().map(function (r) { return { sid: r.sid, name: r.name, cls: r.cls, email: r.email, code: r.code }; }) };
    case 'climbHello': return climbHello(auth(req));
    case 'climbPing': return climbPing(auth(req), req);
    case 'climbSave': return climbSave(auth(req), req);
    case 'climbControl': teacher(req); return climbControl(req);
    case 'climbClass': teacher(req); return climbClass(req);
    case 'climbCheck': teacher(req); return climbCheck(req);
    case 'climbStudent': teacher(req); return climbStudent(req);
    case 'climbAsk': return climbAsk(auth(req), req);
    case 'climbReply': teacher(req); return climbReply(req);
    case 'studentDay': teacher(req); return studentDay(req);
    default: throw new Error('unknown op');
  }
}

/* ---------------- auth ---------------- */
function prop(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }

function teacher(req) {
  var k = prop('TEACHER_KEY');
  if (!k || String(req.teacherKey || '') !== k) throw new Error('teacher key');
}

// The roster is cached for 5 minutes; after editing the Roster tab, run clearRosterCache (or wait 5 minutes).
function rosterRows() {
  var cache = CacheService.getScriptCache(), hit = cache.get('roster');
  if (hit) return JSON.parse(hit);
  var sh = SpreadsheetApp.getActive().getSheetByName('Roster');
  var rows = sh.getDataRange().getValues().slice(1).filter(function (r) { return r[0]; }).map(function (r) {
    return { sid: String(r[0]), name: String(r[1]), cls: String(r[2]), email: String(r[3]).toLowerCase().trim(), code: String(r[4]).toUpperCase().trim() };
  });
  try { cache.put('roster', JSON.stringify(rows), 300); } catch (e) { }
  return rows;
}
function clearRosterCache() { CacheService.getScriptCache().remove('roster'); }

function auth(req) {
  var mode = prop('AUTH_MODE') || 'google', roster = rosterRows(), s = null;
  if (req.idToken && (mode === 'google' || mode === 'both')) {
    var email = verifyGoogle(req.idToken);
    s = roster.filter(function (r) { return r.email === email; })[0];
    if (!s) throw new Error('not on roster');
  } else if (req.code && (mode === 'code' || mode === 'both')) {
    var code = String(req.code).toUpperCase().replace(/[^A-Z0-9]/g, '');
    s = roster.filter(function (r) { return r.code && r.code === code; })[0];
    if (!s) throw new Error('bad code');
  } else {
    throw new Error('sign in');
  }
  return s;
}

function verifyGoogle(idToken) {
  var cache = CacheService.getScriptCache(), key = 'tok_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, idToken));
  var hit = cache.get(key); if (hit) return hit;
  var res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('sign in');
  var t = JSON.parse(res.getContentText());
  if (t.aud !== prop('CLIENT_ID')) throw new Error('sign in');
  if (String(t.email_verified) !== 'true') throw new Error('sign in');
  var dom = prop('DOMAIN').toLowerCase();
  if (dom && String(t.hd || '').toLowerCase() !== dom) throw new Error('school account only');
  var email = String(t.email).toLowerCase();
  var left = Math.floor(Number(t.exp || 0) - Date.now() / 1000);
  if (left > 30) cache.put(key, email, Math.min(1800, left));
  return email;
}

function publicStudent(s) { return { sid: s.sid, name: s.name, cls: s.cls }; }

/* ---------------- student ops ---------------- */
function progressSheet() { return SpreadsheetApp.getActive().getSheetByName('Progress'); }

// rows (1-based) of this student's games, reading only the sid and game columns
function rowsFor(sh, sid) {
  var n = sh.getLastRow(), out = {};
  if (n < 2) return out;
  sh.getRange(2, 1, n - 1, 2).getValues().forEach(function (r, i) { if (String(r[0]) === sid) out[r[1]] = i + 2; });
  return out;
}

function load(s) {
  var sh = progressSheet(), at = rowsFor(sh, s.sid), games = {}, sums = {};
  Object.keys(at).forEach(function (g) {
    var r = sh.getRange(at[g], 1, 1, 13).getValues()[0];
    try { games[g] = JSON.parse(r[12]); } catch (e) { }
    var m = summaryRow(r);
    sums[g] = { done: m.levels.split(' ').filter(function (x) { return /:Y$/.test(x); }).map(function (x) { return x.split('.')[0]; }), std: m.standard, specials: m.specials };
  });
  return { ok: true, student: publicStudent(s), games: games, sums: sums };
}

// Text a student sends must never become a formula in the Sheet or a CSV
function safe(x, n) {
  x = String(x == null ? '' : x).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);
  return /^[=+\-@]/.test(x) ? "'" + x : x;
}

function num(x) { x = Number(x); return isFinite(x) ? Math.max(0, Math.min(9999, Math.round(x))) : 0; }

function save(s, req) {
  var game = String(req.game || '');
  if (!GAMES.test(game)) throw new Error('bad game');
  var raw = JSON.stringify(req.raw || {});
  if (raw.length > MAX_RAW) throw new Error('too big');
  var m = req.summary || {};
  var levels = (m.levels || []).slice(0, 40).map(function (L) { return String(L.id).replace(/[^A-Za-z0-9]/g, '').slice(0, 8) + '.' + String(L.tier || '').replace(/[^a-z]/g, '').slice(0, 8) + ':' + (L.done ? 'Y' : L.skipped ? 'S' : '-'); }).join(' ');
  var specials = (m.specials || []).slice(0, 12).map(function (x) { return safe(x, 60).replace(/,/g, ' '); }).join(', ');
  var row = [s.sid, game, new Date(), num(m.levelsDone), num(m.levelsTotal), num(m.coreDone), num(m.coreTotal), m.standard ? 'yes' : '', specials, num(m.assisted), num(m.tickets), levels, raw];

  var ev = (req.events || []).slice(0, 20).filter(function (x) { return x && (x.type === 'level' || x.type === 'certificate'); })
    .map(function (x) { return [new Date(), s.sid, game, x.type, safe(x.detail, 200)]; });
  // short wait: a busy class gets "busy" and the arcade retries a little later
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('busy');
  try {
    var sh = progressSheet(), at = rowsFor(sh, s.sid)[game] || -1;
    if (at > 0) sh.getRange(at, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
    if (ev.length) { var es = SpreadsheetApp.getActive().getSheetByName('Events'); es.getRange(es.getLastRow() + 1, 1, ev.length, 5).setValues(ev); }
  } finally { lock.releaseLock(); }
  return { ok: true };
}

function summaryRow(r) {
  return { game: r[1], updated: r[2] instanceof Date ? r[2].toISOString() : String(r[2]), levelsDone: r[3], levelsTotal: r[4], coreDone: r[5], coreTotal: r[6], standard: r[7] === 'yes', specials: r[8] ? String(r[8]).split(', ') : [], assisted: r[9], tickets: r[10], levels: String(r[11]) };
}

function mine(s) {
  var sh = progressSheet(), at = rowsFor(sh, s.sid);
  var rows = Object.keys(at).map(function (g) { return summaryRow(sh.getRange(at[g], 1, 1, 12).getValues()[0]); });
  return { ok: true, student: publicStudent(s), games: rows, climb: climbRows(s.sid)[0] || null };
}

/* ---------------- teacher ---------------- */
function classView() {
  var roster = rosterRows().map(publicStudent);
  var sh = progressSheet(), n0 = sh.getLastRow();
  var prog = (n0 < 2 ? [] : sh.getRange(2, 1, n0 - 1, 12).getValues()).filter(function (r) { return r[0]; }).map(function (r) { var o = summaryRow(r); o.sid = String(r[0]); return o; });
  var es = SpreadsheetApp.getActive().getSheetByName('Events'), n = es.getLastRow(), events = [];
  if (n > 1) {
    var from = Math.max(2, n - 299);
    events = es.getRange(from, 1, n - from + 1, 5).getValues().map(function (r) { return { time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), sid: String(r[1]), game: r[2], type: r[3], detail: r[4] }; }).reverse();
  }
  return { ok: true, roster: roster, progress: prog, events: events, climb: climbRows() };
}

/* ---------------- lesson slideshows ---------------- */
var LESSON = /^L[0-9]{1,2}$/, QID = /^[a-z0-9]{1,16}$/, KINDS = /^(poll|open|number|conf|machine|exit)$/;

// The Responses tab is created the first time a student answers, so an older Sheet needs no setup run
function responsesSheet() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Responses');
  if (!sh) { sh = ss.insertSheet('Responses'); sh.appendRow(TABS.Responses); sh.setFrozenRows(1); }
  return sh;
}

function responseRows() {
  var sh = responsesSheet(), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 7).getValues().map(function (r) {
    return { time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), sid: String(r[1]), lesson: String(r[2]), q: String(r[3]), kind: String(r[4]), answer: String(r[5]), correct: String(r[6]) };
  });
}

// One lesson's rows only. The Responses tab holds every answer from every lesson, and the console asks every 4 seconds:
// read just the lesson column, then only the block from the lesson's first row to its last.
function lessonRows(lesson) {
  var sh = responsesSheet(), n = sh.getLastRow();
  if (n < 2) return [];
  var col = sh.getRange(2, 3, n - 1, 1).getValues(), lo = -1, hi = -1;
  for (var i = 0; i < col.length; i++) if (String(col[i][0]) === lesson) { if (lo < 0) lo = i; hi = i; }
  if (lo < 0) return [];
  return sh.getRange(2 + lo, 1, hi - lo + 1, 7).getValues().filter(function (r) { return String(r[2]) === lesson; }).map(function (r) {
    return { time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), sid: String(r[1]), lesson: String(r[2]), q: String(r[3]), kind: String(r[4]), answer: String(r[5]), correct: String(r[6]) };
  });
}

// the newest answer per student per question
function latest(rows) {
  var by = {};
  rows.forEach(function (r) { by[r.sid + '|' + r.lesson + '|' + r.q] = r; });
  return Object.keys(by).map(function (k) { return by[k]; });
}

function answer(s, req) {
  var lesson = String(req.lesson || ''), q = String(req.q || ''), kind = String(req.kind || '');
  if (!LESSON.test(lesson) || !QID.test(q) || !KINDS.test(kind)) throw new Error('bad answer');
  var correct = req.correct === true ? 'yes' : req.correct === false ? 'no' : '';
  var row = [new Date(), s.sid, lesson, q, kind, safe(req.answer, 600), correct];
  // appendRow is atomic, so answers don't need the script lock (and don't queue behind Climb's saves)
  responsesSheet().appendRow(row);
  return { ok: true };
}

function myAnswers(s, req) {
  var lesson = String(req.lesson || ''), out = {};
  if (!LESSON.test(lesson)) throw new Error('bad lesson');
  lessonRows(lesson).forEach(function (r) { if (r.sid === s.sid) out[r.q] = { answer: r.answer, correct: r.correct }; });
  return { ok: true, student: publicStudent(s), answers: out };
}

// What the teacher is showing right now. Kept in the script cache (fast, no Sheet read); it lasts 6 hours.
function getLive() {
  var v = CacheService.getScriptCache().get('live');
  try { return v ? JSON.parse(v) : null; } catch (e) { return null; }
}

function setLive(req) {
  var cache = CacheService.getScriptCache(), L = req.live;
  if (!L) { cache.remove('live'); return { ok: true, live: null }; }
  var out = { lesson: String(L.lesson || ''), slide: Math.max(0, Math.min(200, Math.round(Number(L.slide) || 0))), at: Date.now(), reveal: {}, counts: {}, spot: null, timer: null, lock: !!L.lock };
  if (!LESSON.test(out.lesson)) throw new Error('bad lesson');
  Object.keys(L.reveal || {}).slice(0, 60).forEach(function (k) { if (QID.test(k)) out.reveal[k] = Math.max(0, Math.min(2, Number(L.reveal[k]) || 0)); });
  Object.keys(L.counts || {}).slice(0, 60).forEach(function (k) { if (QID.test(k) && Array.isArray(L.counts[k])) out.counts[k] = L.counts[k].slice(0, 12).map(num); });
  if (L.spot && QID.test(String(L.spot.q || ''))) out.spot = { q: String(L.spot.q), text: safe(L.spot.text, 600) };
  if (L.timer && Number(L.timer.end) > 0) out.timer = { end: Number(L.timer.end), total: num(L.timer.total) };
  var json = JSON.stringify(out);
  if (json.length > 90000) throw new Error('too big');
  cache.put('live', json, 21600);
  return { ok: true, live: out };
}

function answersFor(req) {
  var lesson = String(req.lesson || '');
  if (!LESSON.test(lesson)) throw new Error('bad lesson');
  var rows = latest(lessonRows(lesson));
  return { ok: true, roster: rosterRows().map(publicStudent), answers: rows };
}

function participation() {
  var by = {};
  latest(responseRows()).forEach(function (r) {
    if (r.q === 'here' || r.q === 'zflag') return;   // "joined the lesson" marker and focus-watch summary from the slides, not answers
    var k = r.sid + '|' + r.lesson, o = by[k] || (by[k] = { sid: r.sid, lesson: r.lesson, answered: 0, correct: 0, checked: 0, last: '' });
    o.answered++;
    if (r.correct) { o.checked++; if (r.correct === 'yes') o.correct++; }
    if (r.time > o.last) o.last = r.time;
  });
  return { ok: true, roster: rosterRows().map(publicStudent), cells: Object.keys(by).map(function (k) { return by[k]; }) };
}

/* ---------------- Climb: the linear functions check-in ---------------- */
// One live session at a time (for one class or everyone), kept in Script properties so it survives cache loss.
// Times are server milliseconds; each student's end = start + paused time + 12 minutes x their time multiplier.
var CLIMB_LEN = 12 * 60 * 1000, CLIMB_SKILL = /^(F[12]|[1-9]|[12][0-9])$/, CLIMB_TPL = /^[A-Z]{2}-[0-9][a-z]$/;
var CLIMB_MODES = /^(new|review|practice|twin|check|probe|preview)$/, CLIMB_RES = /^(yes|no|time|void)$/;

function climbSheet(name) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(TABS[name]); sh.setFrozenRows(1); }
  return sh;
}
function climbSession() {
  var cache = CacheService.getScriptCache(), v = cache.get('climbS');
  if (v === null) { v = prop('CLIMB_SESSION'); try { cache.put('climbS', v || '', 21600); } catch (e) { } }
  try { return v ? JSON.parse(v) : null; } catch (e) { return null; }
}
function climbPut(s) {
  var v = s ? JSON.stringify(s) : '';
  PropertiesService.getScriptProperties().setProperty('CLIMB_SESSION', v);
  CacheService.getScriptCache().put('climbS', v, 21600);
}
function climbAccom() { try { return JSON.parse(prop('CLIMB_ACCOM') || '{}'); } catch (e) { return {}; } }
// what a student needs to know about the session: only the one for their class
function climbFor(s) {
  var cs = climbSession();
  if (!cs || (cs.cls && cs.cls !== s.cls)) return null;
  return { id: cs.id, state: cs.state, start: cs.start || 0, pausedAt: cs.pausedAt || 0, pausedMs: cs.pausedMs || 0, len: CLIMB_LEN, focus: cs.focus || '', focusAll: !!cs.focusAll, endedAt: cs.endedAt || 0, next: cs.next || 0 };
}
// the lesson the teacher is running live (Climb hands students over to it), or null
function liveLesson() {
  var L = getLive(); if (!L) return null;
  var ended = !!(L.counts && L.counts.zend && L.counts.zend[0] === 1);
  return { lesson: L.lesson, at: L.at, ended: ended };
}
function climbRow(sh, sid) {
  var n = sh.getLastRow(); if (n < 2) return -1;
  var ids = sh.getRange(2, 1, n - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === sid) return i + 2;
  return -1;
}

function climbHello(s) {
  var sh = climbSheet('Climb'), at = climbRow(sh, s.sid), state = null, ov = null;
  if (at > 0) { var r = sh.getRange(at, 11, 1, 2).getValues()[0]; try { ov = r[0] ? JSON.parse(r[0]) : null; } catch (e) { } try { state = r[1] ? JSON.parse(r[1]) : null; } catch (e) { } }
  return { ok: true, student: publicStudent(s), state: state, ov: ov, session: climbFor(s), mult: climbAccom()[s.sid] || 1, now: Date.now() };
}

// every few seconds from each student's page: where they are (for the live dashboard) and the session clock
function climbPing(s, req) {
  var st = req.status || {}, me = {
    at: Date.now(), ph: String(st.ph || '').slice(0, 10), sk: String(st.sk || '').slice(0, 4), n: num(st.n), lv: num(st.lv), aw: num(st.aw),
    th: Math.round(Number(st.th) || 0), fl: String(st.fl || '').slice(0, 40), sess: String(st.sess || '').slice(0, 20), ok: num(st.ok), al: num(st.al), to: num(st.to)
  };
  try { CacheService.getScriptCache().put('cp_' + s.sid, JSON.stringify(me), 7200); } catch (e) { }
  var h = null; try { h = JSON.parse(CacheService.getScriptCache().get('ch_' + s.sid) || 'null'); } catch (e) { }
  return { ok: true, now: Date.now(), session: climbFor(s), mult: climbAccom()[s.sid] || 1, lesson: liveLesson(), hand: h ? { at: h.at, reply: h.reply || '', repAt: h.repAt || 0, status: h.status } : null };
}

/* ---------- Ask Mr. Crowell: a student sends their screen (the question, rebuilt from template + seed, and what
   they've entered so far) to the dashboard without leaving the page. One row per question in the ClimbAsk tab, in
   the order they were sent; the cache keeps the open one for the student's ping. ---------- */
var ASK_VIEW = /^(item|explain|guided)$/, ASK_DONE = /^(answered|lowered)$/;
function askSet(row, status, reply) {
  var sh = climbSheet('ClimbAsk');
  sh.getRange(row, 11).setValue(status);
  if (reply != null) sh.getRange(row, 12).setValue(reply);
  if (ASK_DONE.test(status)) sh.getRange(row, 13).setValue(new Date());
}
function climbAsk(s, req) {
  var cache = CacheService.getScriptCache(), key = 'ch_' + s.sid, old = null;
  try { old = JSON.parse(cache.get(key) || 'null'); } catch (e) { }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('busy');
  try {
    if (old && old.status === 'waiting' && old.row) askSet(old.row, 'lowered');
    if (req.cancel) { cache.remove(key); return { ok: true }; }
    var h = req.hand || {}, cs = climbSession(), vals = JSON.stringify(h.vals || []);
    if (!ASK_VIEW.test(String(h.view)) || !CLIMB_TPL.test(String(h.tid)) || !CLIMB_SKILL.test(String(h.skill))) throw new Error('bad question');
    var sh = climbSheet('ClimbAsk'), at = new Date();
    sh.appendRow([at, s.sid, safe(cs ? cs.id : '', 20), String(h.view), String(h.skill), String(h.tid), String(Math.floor(Math.abs(Number(h.seed) || 0)) % 4294967296),
      safe(h.note, 160), safe(h.shown, 300), vals.length <= 3000 ? vals : '[]', 'waiting', '', '']);
    var me = { row: sh.getLastRow(), at: at.getTime(), status: 'waiting', reply: '', repAt: 0 };
    cache.put(key, JSON.stringify(me), 7200);
    return { ok: true, at: me.at };
  } finally { lock.releaseLock(); }
}
// teacher: a short reply (shown on the student's screen) and/or done (takes it off the queue)
function climbReply(req) {
  var sid = String(req.sid || ''), cache = CacheService.getScriptCache(), key = 'ch_' + sid, h = null;
  try { h = JSON.parse(cache.get(key) || 'null'); } catch (e) { }
  var row = Math.round(Number(req.row) || 0), msg = safe(req.reply, 140);
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('busy');
  try {
    var sh = climbSheet('ClimbAsk');
    if (row < 2 || row > sh.getLastRow() || String(sh.getRange(row, 2).getValue()) !== sid) throw new Error('no such question');
    var prev = String(sh.getRange(row, 12).getValue() || ''), all = msg ? (prev ? prev + ' / ' : '') + msg : null;
    var status = req.done ? 'answered' : String(sh.getRange(row, 11).getValue());
    askSet(row, status, all);
    if (h && h.row === row) { if (msg) { h.reply = msg; h.repAt = Date.now(); } h.status = status; cache.put(key, JSON.stringify(h), 7200); }
    return { ok: true, status: status };
  } finally { lock.releaseLock(); }
}
// every question asked in the last 16 hours (at most the last 300), oldest first
function climbAsks() {
  var sh = climbSheet('ClimbAsk'), n = sh.getLastRow(), since = Date.now() - 16 * 3600000;
  if (n < 2) return [];
  var from = Math.max(2, n - 299), out = [];
  sh.getRange(from, 1, n - from + 1, 13).getValues().forEach(function (r, i) {
    var t = r[0] instanceof Date ? r[0].getTime() : Date.parse(r[0]); if (!(t >= since)) return;
    var v = []; try { v = JSON.parse(r[9] || '[]'); } catch (e) { }
    out.push({ row: from + i, at: t, sid: String(r[1]), sess: String(r[2]), view: String(r[3]), skill: String(r[4]), tid: String(r[5]), seed: Number(r[6]) || 0, note: String(r[7]), shown: String(r[8]), vals: v, status: String(r[10]), reply: String(r[11]), closed: r[12] instanceof Date ? r[12].getTime() : 0 });
  });
  return out;
}

function climbSave(s, req) {
  var state = JSON.stringify(req.state || {});
  if (state.length > 45000) throw new Error('too big');
  var m = req.summary || {};
  var hist = JSON.stringify((req.state && req.state.hist || []).slice(-30));
  var row = [s.sid, new Date(), Number(m.theta) || 205, num(m.sess), num(m.secure), num(m.retained), safe(m.frontier, 4), safe(m.map, 200), safe(JSON.stringify(m.today || {}), 1500), hist.length < 6000 ? hist : '[]'];
  var log = (req.log || []).slice(0, 40).map(function (x) {
    x = x || {};
    return [new Date(Number(x.at) || Date.now()), s.sid, safe(x.sess, 20), CLIMB_SKILL.test(String(x.skill)) ? String(x.skill) : '?', CLIMB_TPL.test(String(x.tid)) ? String(x.tid) : '?', String(Math.floor(Math.abs(Number(x.seed) || 0)) % 4294967296), CLIMB_MODES.test(String(x.mode)) ? String(x.mode) : '?',
      safe(x.ans, 300), CLIMB_RES.test(String(x.res)) ? String(x.res) : '?', /^(M[0-9]{1,2}|T0|G)$/.test(String(x.tag || '')) ? String(x.tag) : '', num(x.secs), safe(x.flags, 60)];
  });
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('busy');
  try {
    var sh = climbSheet('Climb'), at = climbRow(sh, s.sid);
    if (at > 0) { sh.getRange(at, 1, 1, row.length).setValues([row]); sh.getRange(at, 12).setValue(state); }
    else { sh.appendRow(row.concat(['', state])); }
    if (log.length) { var ls = climbSheet('ClimbLog'); ls.getRange(ls.getLastRow() + 1, 1, log.length, 12).setValues(log); }
  } finally { lock.releaseLock(); }
  return { ok: true };
}

// teacher: open (waiting room), start (10 s countdown), pause, resume, end, focus, accommodations
function climbControl(req) {
  var a = String(req.action || ''), now = Date.now();
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('busy');
  try {
    var cs = climbSession();
    if (a === 'accom') {
      var acc = climbAccom(), sid = String(req.sid || ''), m = Number(req.mult);
      if (!sid) throw new Error('bad student');
      if (m === 1.5 || m === 2) acc[sid] = m; else delete acc[sid];
      PropertiesService.getScriptProperties().setProperty('CLIMB_ACCOM', JSON.stringify(acc));
      return { ok: true, session: cs, accom: acc };
    }
    var nx = Math.round(Number(req.next) || 0); nx = nx >= 1 && nx <= 30 ? nx : 0;   // the lesson (file number) students go on to afterwards
    if (a === 'open') cs = { id: 'S' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMdd-HHmm'), cls: safe(req.cls, 20), state: 'open', openAt: now, start: 0, pausedAt: 0, pausedMs: 0, focus: CLIMB_SKILL.test(String(req.focus || '')) ? String(req.focus) : '', focusAll: !!req.focusAll, next: nx };
    else if (a === 'next' && cs) cs.next = nx;
    else if (!cs) throw new Error('no session');
    else if (a === 'start') { if (cs.state !== 'open') throw new Error('already started'); cs.state = 'running'; cs.start = now + 10000; }
    else if (a === 'pause') { if (cs.state !== 'running') throw new Error('not running'); cs.state = 'paused'; cs.pausedAt = now; }
    else if (a === 'resume') { if (cs.state !== 'paused') throw new Error('not paused'); cs.pausedMs = (cs.pausedMs || 0) + (now - cs.pausedAt); cs.pausedAt = 0; cs.state = 'running'; }
    else if (a === 'end') { if (cs.state === 'paused') { cs.pausedMs = (cs.pausedMs || 0) + (now - cs.pausedAt); cs.pausedAt = 0; } cs.state = 'ended'; cs.endedAt = now; }
    else if (a === 'focus') { cs.focus = CLIMB_SKILL.test(String(req.focus || '')) ? String(req.focus) : ''; cs.focusAll = !!req.focusAll; }
    else if (a === 'clear') cs = null;
    else throw new Error('bad action');
    climbPut(cs);
    return { ok: true, session: cs, accom: climbAccom(), now: now };
  } finally { lock.releaseLock(); }
}

// teacher dashboard: every student's Climb row (no full state), who is on the page right now, and this week's answers
// each student's Climb row without the full state (one student when sid is given): Climb dashboard, Class Results, My Results
function climbRows(sid) {
  var sh = climbSheet('Climb'), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 11).getValues().filter(function (r) { return r[0] && (!sid || String(r[0]) === sid); }).map(function (r) {
    var o = { sid: String(r[0]), updated: r[1] instanceof Date ? r[1].toISOString() : String(r[1]), theta: Number(r[2]) || 205, sess: r[3], secure: r[4], retained: r[5], frontier: String(r[6]), map: String(r[7]) };
    try { o.today = JSON.parse(r[8] || '{}'); } catch (e) { o.today = {}; }
    try { o.hist = JSON.parse(r[9] || '[]'); } catch (e) { o.hist = []; }
    try { o.ov = r[10] ? JSON.parse(r[10]) : null; } catch (e) { o.ov = null; }
    return o;
  });
}

function climbClass(req) {
  var roster = rosterRows().map(publicStudent), rows = climbRows();
  var keys = roster.map(function (r) { return 'cp_' + r.sid; }), got = keys.length ? CacheService.getScriptCache().getAll(keys) : {}, here = {};
  Object.keys(got).forEach(function (k) { try { here[k.slice(3)] = JSON.parse(got[k]); } catch (e) { } });
  // answers from the last 8 days (at most the last 6000 rows)
  var ls = climbSheet('ClimbLog'), m = ls.getLastRow(), log = [], since = Date.now() - 8 * 86400000;
  if (m > 1) {
    var from = Math.max(2, m - 5999);
    ls.getRange(from, 1, m - from + 1, 12).getValues().forEach(function (r) {
      var t = r[0] instanceof Date ? r[0].getTime() : Date.parse(r[0]); if (!(t >= since)) return;
      log.push([t, String(r[1]), String(r[2]), String(r[3]), String(r[4]), Number(r[5]) || 0, String(r[6]), String(r[7]), String(r[8]), String(r[9]), Number(r[10]) || 0, String(r[11])]);
    });
  }
  return { ok: true, now: Date.now(), roster: roster, rows: rows, here: here, session: climbSession(), accom: climbAccom(), log: log, asks: climbAsks() };
}

// teacher: a "needs check" skill was checked live. ok = it counts; not ok = back to learning. Applied on the student's next sign-in or ping.
function climbCheck(req) {
  var sid = String(req.sid || ''), skill = String(req.skill || '');
  if (!sid || !CLIMB_SKILL.test(skill)) throw new Error('bad check');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('busy');
  try {
    var sh = climbSheet('Climb'), at = climbRow(sh, sid);
    if (at < 0) throw new Error('no climb yet');
    var ov = {}; try { ov = JSON.parse(sh.getRange(at, 11).getValue() || '{}'); } catch (e) { }
    ov.cleared = (ov.cleared || []).filter(function (x) { return x !== skill; }); ov.back = (ov.back || []).filter(function (x) { return x !== skill; });
    if (req.ok) ov.cleared.push(skill); else ov.back.push(skill);
    ov.at = Date.now();
    sh.getRange(at, 11).setValue(JSON.stringify(ov));
    return { ok: true, ov: ov };
  } finally { lock.releaseLock(); }
}

function climbStudent(req) {
  var sh = climbSheet('Climb'), at = climbRow(sh, String(req.sid || ''));
  if (at < 0) return { ok: true, state: null };
  var v = sh.getRange(at, 12).getValue(), st = null; try { st = JSON.parse(v); } catch (e) { }
  return { ok: true, state: st };
}

/* ---------------- one student's day: Climb, lessons and arcade together ---------------- */
// For the teacher's day view. Dates are in the script's time zone (File > Project settings). Also returns, for the last
// 60 days, how much the student did each day in each part, so the page can show which days have anything.
function studentDay(req) {
  var sid = String(req.sid || ''), tz = Session.getScriptTimeZone();
  var s = rosterRows().filter(function (r) { return r.sid === sid; })[0];
  if (!s) throw new Error('no such student');
  var day = /^\d{4}-\d{2}-\d{2}$/.test(String(req.date || '')) ? String(req.date) : Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var since = Date.now() - 60 * 86400000, days = {};
  function dkey(t) { return Utilities.formatDate(t instanceof Date ? t : new Date(t), tz, 'yyyy-MM-dd'); }
  function count(t, part) { var ms = t instanceof Date ? t.getTime() : Date.parse(t); if (!(ms >= since)) return; var k = dkey(t), o = days[k] || (days[k] = { climb: 0, lesson: 0, arcade: 0 }); o[part]++; }
  // Climb answers
  var climb = [], ls = climbSheet('ClimbLog'), n = ls.getLastRow();
  if (n > 1) ls.getRange(2, 1, n - 1, 12).getValues().forEach(function (r) {
    if (String(r[1]) !== sid) return;
    count(r[0], 'climb');
    if (dkey(r[0]) === day) climb.push({ time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), sess: String(r[2]), skill: String(r[3]), tid: String(r[4]), seed: Number(r[5]) || 0, mode: String(r[6]), answer: String(r[7]), result: String(r[8]), tag: String(r[9]), secs: Number(r[10]) || 0, flags: String(r[11]) });
  });
  // lesson answers (and the "joined" and focus-watch markers)
  var lessons = [];
  responseRows().forEach(function (r) { if (r.sid !== sid) return; if (r.q !== 'here' && r.q !== 'zflag') count(r.time, 'lesson'); if (dkey(r.time) === day) lessons.push(r); });
  // arcade: levels and certificates
  var events = [], es = SpreadsheetApp.getActive().getSheetByName('Events'), m = es.getLastRow();
  if (m > 1) es.getRange(2, 1, m - 1, 5).getValues().forEach(function (r) {
    if (String(r[1]) !== sid) return;
    count(r[0], 'arcade');
    if (dkey(r[0]) === day) events.push({ time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), game: String(r[2]), type: String(r[3]), detail: String(r[4]) });
  });
  return { ok: true, student: publicStudent(s), date: day, today: dkey(new Date()), days: days, climb: climb, climbRow: climbRows(sid)[0] || null, lessons: lessons, events: events, games: mine(s).games };
}
