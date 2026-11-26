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
 *   Squeeze   time | sid | season | profit | cash | plan | look   (one row per finished Squeeze Street run: the lemonade stand game's leaderboard)
 *   ShowOff   time | sid | season | score | right | seed | answers | look   (one row per finished Show-Off show: the avatar stage show's podium)
 *   (Responses, Climb, ClimbLog, Squeeze and ShowOff are created the first time they are needed.)
 *   Muddle Under the Pond (the advisory party game) keeps nothing in the Sheet: its rooms live in the script cache.
 *
 * Script properties (Project Settings > Script properties):
 *   TEACHER_KEY   long random string; the class view asks for it once
 *   COTEACHER_KEY a second, smaller key for a co-teacher (co-teacher.html): she can add students to her own classes,
 *                 see their codes and see their Unit 2 Check results, nothing else. setup() makes it.
 *   COTEACHER_CLASSES  the co-teacher's class names, comma-separated (filled in as she adds classes)
 *   EXTRA_TIME    extra time on timed checks, JSON {sid: percent} (25, 50 or 100); set on co-teacher.html
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
  ClimbAsk: ['time', 'sid', 'session', 'screen', 'skill', 'template', 'seed', 'note', 'answer', 'vals', 'status', 'reply', 'closed'],
  Squeeze: ['time', 'sid', 'season', 'profit', 'cash', 'plan', 'look'],
  ShowOff: ['time', 'sid', 'season', 'score', 'right', 'seed', 'answers', 'look']
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
  if (!p.getProperty('COTEACHER_KEY')) p.setProperty('COTEACHER_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 16));
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
    case 'report': teacher(req); return reportFor(req);
    case 'coWho': return coWho(req);
    case 'coRoster': return coRoster(req);
    case 'coAdd': return coAdd(req);
    case 'coClass': return coClass(req);
    case 'coExtra': return coExtra(req);
    case 'checkState': return checkState(req);
    case 'checkGate': return checkGate(req);
    case 'checkMore': return checkMore(req);
    case 'checkAnswers': return checkAnswers(req);
    case 'squeezeSave': return squeezeSave(auth(req), req);
    case 'squeezeBoard': return squeezeBoard(req);
    case 'showoffSave': return showoffSave(auth(req), req);
    case 'showoffBoard': return showoffBoard(req);
    case 'roomHost': teacher(req); return roomHost(req);
    case 'roomPing': return roomPing(req);
    default: throw new Error('unknown op');
  }
}

/* ---------------- co-teacher (co-teacher.html) ----------------
   The co-teacher key reaches only the co-teacher's own classes: their roster and codes, adding students, and their
   Unit 2 Check results (Check 1 to 10: g91-g98, g88, g89; practice checks: g87). The main teacher key can do all of it for every class. */
var CO_GAMES = /^g(9[1-8]|8[7-9])$/, CO_CLASS = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,19}$/;
function coClasses() { return prop('COTEACHER_CLASSES').split(',').map(function (c) { return c.trim(); }).filter(Boolean); }
function coKey() {
  var p = PropertiesService.getScriptProperties(), k = p.getProperty('COTEACHER_KEY');
  if (!k) { k = Utilities.getUuid().replace(/-/g, '').slice(0, 16); p.setProperty('COTEACHER_KEY', k); }
  return k;
}
// who is asking: the main teacher (every class) or the co-teacher (her classes only)
function coTeacher(req) {
  var g = String(req.teacherKey || ''), t = prop('TEACHER_KEY');
  if (t && g === t) return { all: true, classes: coClasses() };
  var k = prop('COTEACHER_KEY');
  if (!k || g !== k) throw new Error('teacher key');
  return { all: false, classes: coClasses() };
}
function coSees(who, cls) { return who.all || who.classes.indexOf(cls) >= 0; }
function coWho(req) {
  var who = coTeacher(req), out = { ok: true, main: who.all, classes: who.classes, authMode: prop('AUTH_MODE') || 'google' };
  if (who.all) { out.coKey = coKey(); out.allClasses = rosterRows().map(function (r) { return r.cls; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; }); }
  return out;
}
function coRoster(req) {
  var who = coTeacher(req);
  return { ok: true, main: who.all, classes: who.classes, authMode: prop('AUTH_MODE') || 'google',
    roster: rosterRows().filter(function (r) { return coSees(who, r.cls); }).map(function (r) { return { sid: r.sid, name: r.name, cls: r.cls, code: r.code, extra: extraMap()[r.sid] || 0 }; }) };
}
// add students: [{name, cls}], at most 60 at a time. A co-teacher may add to her own classes or start a new class
// whose name nobody else uses; a new class joins her list.
function coAdd(req) {
  var who = coTeacher(req), list = Array.isArray(req.students) ? req.students.slice(0, 60) : [];
  if (!list.length) throw new Error('no students');
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    clearRosterCache();
    var roster = rosterRows(), used = {}, sids = {}, taken = {}, mine = who.classes.slice();
    roster.forEach(function (r) { used[r.code] = 1; sids[r.sid] = 1; if (r.cls) taken[r.cls] = 1; });
    var A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', rows = [], out = [];
    list.forEach(function (x) {
      var name = String(x && x.name || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
      var cls = String(x && x.cls || '').trim();
      if (!name) return;
      if (!CO_CLASS.test(cls)) throw new Error('bad class name: ' + cls);
      if (!who.all && mine.indexOf(cls) < 0) {
        if (taken[cls]) throw new Error('class ' + cls + ' belongs to another teacher');
        mine.push(cls);
      }
      var c, sid; do { c = ''; for (var k = 0; k < 6; k++) c += A.charAt(Math.floor(Math.random() * A.length)); } while (used[c]); used[c] = 1;
      do { sid = 'c' + Utilities.getUuid().replace(/-/g, '').slice(0, 9); } while (sids[sid]); sids[sid] = 1;
      rows.push([sid, name, cls, '', c]); out.push({ sid: sid, name: name, cls: cls, code: c });
    });
    if (!rows.length) throw new Error('no students');
    var sh = SpreadsheetApp.getActive().getSheetByName('Roster');
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
    if (!who.all && mine.length !== who.classes.length) PropertiesService.getScriptProperties().setProperty('COTEACHER_CLASSES', mine.join(','));
    clearRosterCache();
    return { ok: true, added: out, classes: who.all ? who.classes : mine };
  } finally { lock.releaseLock(); }
}
// extra time: {sid, extra: 0 | 25 | 50 | 100} for a student the asker can see
function coExtra(req) {
  var who = coTeacher(req), sid = String(req.sid || ''), x = Number(req.extra) || 0;
  if ([0, 25, 50, 100].indexOf(x) < 0) throw new Error('bad extra time');
  var st = rosterRows().filter(function (r) { return r.sid === sid; })[0];
  if (!st || !coSees(who, st.cls)) throw new Error('no such student');
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    EXTRA_CACHE = null; var m = extraMap();
    if (x) m[sid] = x; else delete m[sid];
    PropertiesService.getScriptProperties().setProperty('EXTRA_TIME', JSON.stringify(m)); EXTRA_CACHE = m;
    return { ok: true, sid: sid, extra: x };
  } finally { lock.releaseLock(); }
}
// the Unit 2 Check dashboard's view for the co-teacher: her students and their check rows only
function coClass(req) {
  var who = coTeacher(req), roster = rosterRows().filter(function (r) { return coSees(who, r.cls); }), ids = {};
  roster.forEach(function (r) { ids[r.sid] = 1; });
  var sh = progressSheet(), n0 = sh.getLastRow();
  var prog = (n0 < 2 ? [] : sh.getRange(2, 1, n0 - 1, 12).getValues()).filter(function (r) { return r[0] && ids[String(r[0])] && CO_GAMES.test(String(r[1])); })
    .map(function (r) { var o = summaryRow(r); o.sid = String(r[0]); return o; });
  return { ok: true, roster: roster.map(publicStudent), progress: prog, events: [], climb: [] };
}

// What each student answered on a Unit 2 Check, for the task sheets' addendum: games is a list of Check save keys
// (g87-g98). Read from the attempt saved in the Progress tab's raw column. The co-teacher key gets her classes only.
function checkAnswers(req) {
  var who = coTeacher(req), want = {}, ids = {}, out = [];
  (Array.isArray(req.games) ? req.games : []).slice(0, 12).forEach(function (g) { g = String(g || ''); if (CO_GAMES.test(g)) want[g] = 1; });
  rosterRows().forEach(function (r) { if (coSees(who, r.cls)) ids[r.sid] = 1; });
  var sh = progressSheet(), n = sh.getLastRow();
  if (n < 2) return { ok: true, rows: out };
  sh.getRange(2, 1, n - 1, 13).getValues().forEach(function (r) {
    var sid = String(r[0]), g = String(r[1]), a = null;
    if (!ids[sid] || !want[g]) return;
    try { a = (JSON.parse(String(r[12] || '{}')) || {}).att; } catch (e) { a = null; }
    if (!a || !Array.isArray(a.log)) return;
    out.push({ sid: sid, game: g, seed: a.seed, t0: a.t0, x: a.log.map(function (e) { return e && e.x !== undefined ? e.x : null; }) });
  });
  return { ok: true, rows: out };
}

/* ---------------- the Unit 2 Check open/closed switches ----------------
   Students start the Check only while their teacher has it open; no start codes. There are two switches: CHECK_OPEN for
   Mr. Crowell's classes and CHECK_OPEN_CO for the co-teacher's (COTEACHER_CLASSES), so both can run a Check at the same
   time. Opening one saves the session's settings with it: which Check (0-9), the test length (lenIdx), the topics (top)
   and a 5-letter session id that every attempt started in it records. A session closes itself after 6 hours. A student
   already in the middle of an attempt keeps going after it closes. CHECK_LOG keeps the last 40 sessions (both teachers)
   for the dashboard's history. CHECK_MORE counts "10 more minutes" grants per student (checkMore), for 12 hours. */
var CHECK_HOURS = 6, CHECK_ALPHA = 'BCDFGHJKLMNPQRSTVWXZ';
function gateRead(k) {
  var v = prop(k), o = null; if (!v) return null;
  try { o = JSON.parse(v); } catch (e) { return null; }
  if (typeof o === 'number') o = { until: o, check: 0, len: 0, top: 1, code: 'OLDCK', at: o - 864e5 };   // a switch opened before sessions
  return o && o.until > Date.now() ? o : null;
}
function gatePublic(o) { return o ? { open: true, until: o.until, session: { code: o.code, check: o.check, len: o.len, top: o.top, at: o.at } } : { open: false, until: 0, session: null }; }
function jsonProp(k, d) { try { return JSON.parse(prop(k) || '') || d; } catch (e) { return d; } }
function checkState(req) {
  req = req || {};
  if (req.teacherKey) {
    var who = coTeacher(req), out = gatePublic(gateRead(who.all ? 'CHECK_OPEN' : 'CHECK_OPEN_CO'));
    out.ok = true;
    if (who.all) out.co = gatePublic(gateRead('CHECK_OPEN_CO'));
    out.log = jsonProp('CHECK_LOG', []).filter(function (x) { return who.all || x.who === 'co'; });
    var more = jsonProp('CHECK_MORE', {}), mine = {};
    Object.keys(more).forEach(function (sid) { if (more[sid].at > Date.now() - 12 * 36e5) mine[sid] = more[sid].n; });
    out.more = mine;
    return out;
  }
  var s = null; try { s = auth(req); } catch (e) { }
  var g = s ? gateRead(coClasses().indexOf(s.cls) >= 0 ? 'CHECK_OPEN_CO' : 'CHECK_OPEN') : (gateRead('CHECK_OPEN') || gateRead('CHECK_OPEN_CO'));
  var res = gatePublic(g); res.ok = true; res.now = Date.now();
  if (s) { var m = jsonProp('CHECK_MORE', {})[s.sid]; res.more = m && m.at > Date.now() - 12 * 36e5 ? m.n : 0; }
  return res;
}
// open: { open: true, check, len, top } (opening again while open replaces the settings: a new session); close: { open: false }.
// The main teacher can close the co-teacher's switch with co: true.
function checkGate(req) {
  var who = coTeacher(req), co = !who.all || !!req.co, k = co ? 'CHECK_OPEN_CO' : 'CHECK_OPEN', p = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var log = jsonProp('CHECK_LOG', []), cur = gateRead(k), now = Date.now();
    if (cur) log.forEach(function (x) { if (x.code === cur.code && x.who === (co ? 'co' : 'main') && !x.closed) x.closed = now; });
    if (req.open && !(who.all && req.co)) {
      var code = ''; for (var i = 0; i < 5; i++) code += CHECK_ALPHA.charAt(Math.floor(Math.random() * 20));
      var o = { until: now + CHECK_HOURS * 36e5, check: Math.max(0, Math.min(9, Number(req.check) || 0)), len: Math.max(0, Math.min(7, Number(req.len) || 0)), top: Number(req.top) ? 1 : 0, code: code, at: now };
      p.setProperty(k, JSON.stringify(o));
      log.push({ who: co ? 'co' : 'main', code: code, check: o.check, len: o.len, top: o.top, at: now, until: o.until });
    } else p.deleteProperty(k);
    p.setProperty('CHECK_LOG', JSON.stringify(log.slice(-40)));
  } finally { lock.releaseLock(); }
  return checkState({ teacherKey: req.teacherKey });
}
// 10 more minutes for one student who ran out of time: their page picks it up by itself
function checkMore(req) {
  var who = coTeacher(req), sid = String(req.sid || '');
  var st = rosterRows().filter(function (r) { return r.sid === sid; })[0];
  if (!st || !coSees(who, st.cls)) throw new Error('no such student');
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var m = jsonProp('CHECK_MORE', {}), now = Date.now(), e = m[sid] && m[sid].at > now - 12 * 36e5 ? m[sid] : { n: 0 };
    m[sid] = { n: e.n + 1, at: now };
    Object.keys(m).forEach(function (k) { if (m[k].at < now - 12 * 36e5) delete m[k]; });
    PropertiesService.getScriptProperties().setProperty('CHECK_MORE', JSON.stringify(m));
    return { ok: true, sid: sid, more: m[sid].n };
  } finally { lock.releaseLock(); }
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

function publicStudent(s) { var o = { sid: s.sid, name: s.name, cls: s.cls }, x = extraMap()[s.sid]; if (x) o.extra = x; return o; }
var EXTRA_CACHE = null;
function extraMap() { if (EXTRA_CACHE) return EXTRA_CACHE; try { EXTRA_CACHE = JSON.parse(prop('EXTRA_TIME') || '{}') || {}; } catch (e) { EXTRA_CACHE = {}; } return EXTRA_CACHE; }

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
  // one console runs the live lesson. Pressing Go live claims it (claim: true with that console's owner id); any other
  // console, including old copies of the page that send no owner, is refused and stops itself, so students never jump.
  var own = String(req.owner || '').slice(0, 40), cur = cache.get('liveOwner');
  if (cur && !req.claim && own !== cur) return { ok: false, error: 'taken' };
  if (req.claim && own) cache.put('liveOwner', own, 21600);
  if (!L) { cache.remove('live'); return { ok: true, live: null }; }
  var out = { lesson: String(L.lesson || ''), slide: Math.max(0, Math.min(200, Math.round(Number(L.slide) || 0))), at: Date.now(), reveal: {}, counts: {}, spot: null, timer: null, lock: !!L.lock };
  if (!LESSON.test(out.lesson)) throw new Error('bad lesson');
  Object.keys(L.reveal || {}).slice(0, 60).forEach(function (k) { if (QID.test(k)) out.reveal[k] = Math.max(0, Math.min(2, Number(L.reveal[k]) || 0)); });
  Object.keys(L.counts || {}).slice(0, 60).forEach(function (k) { if (QID.test(k) && Array.isArray(L.counts[k])) out.counts[k] = L.counts[k].slice(0, 12).map(num); });
  if (L.spot && QID.test(String(L.spot.q || ''))) out.spot = { q: String(L.spot.q), text: safe(L.spot.text, 600) };
  if (L.timer && Number(L.timer.end) > 0) out.timer = { end: Number(L.timer.end), total: num(L.timer.total) };
  // the teacher's whiteboard: grid 0-3 and the strokes as base-36 text (sfa-whiteboard.js)
  if (L.wb && L.wb.on) { var ws = String(L.wb.s || ''); if (ws.length <= 40000 && /^[0-9a-z|:]*$/.test(ws)) out.wb = { on: 1, g: Math.max(0, Math.min(3, Math.round(Number(L.wb.g) || 0))), s: ws }; }
  if (L.ex && typeof L.ex === 'object') out.ex = { s: Math.max(0, Math.min(300, Math.round(Number(L.ex.s) || 0))), n: Math.max(0, Math.min(30, Math.round(Number(L.ex.n) || 0))) };
  // text for the lesson's class features (sfa-together.js): first names on the class mural, think-pair-share partners and
  // their answers, the spotlight's name. One JSON string, at most 12,000 characters; pages treat it as text, never as code.
  if (typeof L.x === 'string' && L.x.length <= 12000 && L.x.charAt(0) === '{') out.x = safe(L.x, 12000);
  var json = JSON.stringify(out);
  if (json.length > 90000) throw new Error('too big');
  cache.put('live', json, 21600);
  return { ok: true, live: out, owned: true };
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
    if (r.q === 'here' || r.q === 'zflag' || r.q === 'zclash' || /^[a-z0-9]{1,14}x[1-3]$/.test(r.q)) return;   // "joined" marker, focus-watch summary, Clash totals and go-further extras: not the slides' own answers
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
var CLIMB_MODES = /^(new|review|practice|twin|check|probe|preview|quiz)$/, CLIMB_RES = /^(yes|no|time|void)$/;

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
  return { id: cs.id, state: cs.state, start: cs.start || 0, pausedAt: cs.pausedAt || 0, pausedMs: cs.pausedMs || 0, len: (cs.mins ? cs.mins * 60000 : CLIMB_LEN) + (cs.quiz ? cs.quiz.secs * 1000 : 0), focus: cs.focus || '', focusAll: !!cs.focusAll, endedAt: cs.endedAt || 0, next: cs.next || 0, quiz: cs.quiz || null };
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
  // the student's current screen, for the teacher's 👁 view (the question is rebuilt on the dashboard from template + seed)
  var sc = st.scr || {};
  me.scr = { v: /^[a-z]{1,10}$/.test(String(sc.v)) ? String(sc.v) : '' };
  if (CLIMB_TPL.test(String(sc.tid))) { me.scr.tid = String(sc.tid); me.scr.seed = Math.floor(Math.abs(Number(sc.seed) || 0)) % 4294967296; me.scr.vals = String(sc.vals || '[]').slice(0, 1500); me.scr.shown = String(sc.shown || '').slice(0, 300); }
  if (sc.left != null) me.scr.left = num(sc.left);
  var cache = CacheService.getScriptCache();
  try { cache.put('cp_' + s.sid, JSON.stringify(me), 7200); } catch (e) { }
  var got = cache.getAll(['ch_' + s.sid, 'cw_' + s.sid]), h = null; try { h = JSON.parse(got['ch_' + s.sid] || 'null'); } catch (e) { }
  return { ok: true, now: Date.now(), session: climbFor(s), mult: climbAccom()[s.sid] || 1, lesson: liveLesson(), hand: h ? { at: h.at, reply: h.reply || '', repAt: h.repAt || 0, status: h.status } : null, watch: !!got['cw_' + s.sid] };
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

// the check-in before Climb: the same questions (template + one seed) for everyone, a few minutes long
function climbQuiz(q) {
  if (!q || !Array.isArray(q.tids)) return null;
  var tids = q.tids.slice(0, 12).map(String).filter(function (t) { return CLIMB_TPL.test(t); });
  if (!tids.length) return null;
  var secs = Math.round(Number(q.secs) || 300); secs = Math.max(60, Math.min(900, secs));
  var les = (Array.isArray(q.les) ? q.les : []).slice(0, tids.length).map(function (n) { n = Math.round(Number(n) || 0); return n >= 1 && n <= 30 ? n : 0; });
  return { tids: tids, les: les, seed: Math.floor(Math.abs(Number(q.seed) || 1)) % 4294967296, secs: secs, name: safe(q.name, 60) };
}
// the climb's length in minutes (the teacher's timer setting), 3-40, 12 by default
function climbMins(m) { m = Math.round(Number(m) || 12); return Math.max(3, Math.min(40, m)); }
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
    if (a === 'open') cs = { id: 'S' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMdd-HHmm'), cls: safe(req.cls, 20), state: 'open', openAt: now, start: 0, pausedAt: 0, pausedMs: 0, focus: CLIMB_SKILL.test(String(req.focus || '')) ? String(req.focus) : '', focusAll: !!req.focusAll, next: nx, quiz: climbQuiz(req.quiz), mins: climbMins(req.mins) };
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
  // the teacher is watching one student's screen: their page checks in every 3 s for the next 30 s
  if (req.watch) try { CacheService.getScriptCache().put('cw_' + String(req.watch).slice(0, 40), '1', 30); } catch (e) { }
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
  responseRows().forEach(function (r) { if (r.sid !== sid || r.q === 'zclash') return; if (r.q !== 'here' && r.q !== 'zflag') count(r.time, 'lesson'); if (dkey(r.time) === day) lessons.push(r); });
  // arcade: levels and certificates
  var events = [], es = SpreadsheetApp.getActive().getSheetByName('Events'), m = es.getLastRow();
  if (m > 1) es.getRange(2, 1, m - 1, 5).getValues().forEach(function (r) {
    if (String(r[1]) !== sid) return;
    count(r[0], 'arcade');
    if (dkey(r[0]) === day) events.push({ time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), game: String(r[2]), type: String(r[3]), detail: String(r[4]) });
  });
  return { ok: true, student: publicStudent(s), date: day, today: dkey(new Date()), days: days, climb: climb, climbRow: climbRows(sid)[0] || null, lessons: lessons, events: events, games: mine(s).games };
}

/* ---------------- report: a class's last few lessons, with the Climb and arcade work from the same days ---------------- */
// For the teacher's Report page. Finds the lessons this class ran most recently (a lesson counts as run on the last day
// at least two of the class's students answered in it), then returns every student's answers to those lessons, and
// their Climb answers and arcade events from the first of those days onwards. Dates are in the script's time zone.
function reportFor(req) {
  var cls = String(req.cls || ''), want = Math.max(1, Math.min(6, Number(req.lessons) || 3)), tz = Session.getScriptTimeZone();
  var roster = rosterRows().filter(function (r) { return !cls || r.cls === cls; }), ids = {};
  roster.forEach(function (r) { ids[r.sid] = 1; });
  function dkey(t) { return Utilities.formatDate(t instanceof Date ? t : new Date(t), tz, 'yyyy-MM-dd'); }
  var rows = responseRows().filter(function (r) { return ids[r.sid] && LESSON.test(r.lesson); });
  var seen = {};   // lesson -> day -> { sid: 1 }
  rows.forEach(function (r) { var ms = Date.parse(r.time); if (!ms) return; var d = dkey(new Date(ms)), L = seen[r.lesson] || (seen[r.lesson] = {}); (L[d] || (L[d] = {}))[r.sid] = 1; });
  var need = Math.min(2, roster.length), ran = [];
  Object.keys(seen).forEach(function (lesson) {
    var days = Object.keys(seen[lesson]).sort().reverse();
    for (var i = 0; i < days.length; i++) { var n = Object.keys(seen[lesson][days[i]]).length; if (n >= need) { ran.push({ lesson: lesson, day: days[i], students: n }); break; } }
  });
  ran.sort(function (a, b) { return a.day < b.day ? 1 : a.day > b.day ? -1 : 0; });
  var picked = ran.slice(0, want), pick = {}, from = dkey(new Date());
  picked.forEach(function (x) { pick[x.lesson] = 1; if (x.day < from) from = x.day; });
  var fromMs = Utilities.parseDate(from, tz, 'yyyy-MM-dd').getTime();
  var climb = [], ls = climbSheet('ClimbLog'), n1 = ls.getLastRow();
  if (n1 > 1) ls.getRange(2, 1, n1 - 1, 12).getValues().forEach(function (r) {
    var sid = String(r[1]); if (!ids[sid]) return;
    var ms = r[0] instanceof Date ? r[0].getTime() : Date.parse(r[0]); if (!(ms >= fromMs)) return;
    climb.push({ time: new Date(ms).toISOString(), sid: sid, sess: String(r[2]), skill: String(r[3]), tid: String(r[4]), seed: Number(r[5]) || 0, mode: String(r[6]), answer: String(r[7]), result: String(r[8]), tag: String(r[9]) });
  });
  var events = [], es = SpreadsheetApp.getActive().getSheetByName('Events'), n2 = es.getLastRow();
  if (n2 > 1) es.getRange(2, 1, n2 - 1, 5).getValues().forEach(function (r) {
    var sid = String(r[1]); if (!ids[sid]) return;
    var ms = r[0] instanceof Date ? r[0].getTime() : Date.parse(r[0]); if (!(ms >= fromMs)) return;
    events.push({ time: new Date(ms).toISOString(), sid: sid, game: String(r[2]), type: String(r[3]), detail: String(r[4]) });
  });
  return { ok: true, cls: cls, roster: roster.map(publicStudent), lessons: picked.reverse(), from: from, today: dkey(new Date()),
    responses: latest(rows.filter(function (r) { return pick[r.lesson]; })), climb: climb, events: events };
}

/* ---------------- Squeeze Street (squeeze.html): the lemonade stand game's public leaderboard ----------------
   The page sends a finished run's choices, never its score. The script replays them with squeezeSim() below (the same rules
   as squeeze-sim.js) and works out the profit itself, so a posted score is always one the game could really produce.
   Runs count only for this week's ten days (or the week either side: a run finished just after midnight on Sunday).
   One row per run in the Squeeze tab; the board shows each student's best run that week, first names only (a last initial
   only when two first names on the board are the same). Anyone can read the board; posting needs a student sign-in.
   To take a run off the board, delete its row in the Squeeze tab (the board refreshes within a minute). */
var SQ_SEASON = /^\d{4}-W\d{2}$/;
function squeezeSave(s, req) {
  var SQ = squeezeSim();
  if (String(req.v || '') !== SQ.V) throw new Error('old game: reload the page');
  var season = String(req.season || '');
  if (!SQ_SEASON.test(season) || SQ.seasonsNow(new Date()).indexOf(season) < 0) throw new Error('old week');
  if (!Array.isArray(req.plan) || req.plan.length !== SQ.DAYS) throw new Error('unfinished run');
  var cache = CacheService.getScriptCache();
  if (cache.get('sq_' + s.sid)) throw new Error('slow down');
  var run = SQ.run(season, req.plan);
  if (!run.done || !isFinite(run.profit) || Math.abs(run.profit) > 1000000) throw new Error('bad run');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('busy');
  var look = String(req.look || ''); if (!/^[0-9a-z]{1,32}$/.test(look)) look = '';   // the arcade avatar code, shown on the board
  try {
    var sh = climbSheet('Squeeze');
    if (sh.getRange(1, 7).getValue() === '') sh.getRange(1, 7).setValue('look');   // a tab made before looks were kept
    sh.appendRow([new Date(), s.sid, season, run.profit, run.cash, JSON.stringify(run.plan), look]);
  }
  finally { lock.releaseLock(); }
  cache.put('sq_' + s.sid, '1', 10);
  cache.remove('sqb_' + season);
  var b = squeezeBests(season), me = b.best[s.sid];
  return { ok: true, profit: run.profit, best: me ? me.profit : run.profit, rank: me ? me.rank : 0 };
}
// each student's best run in a week, ranked (ties share a rank); cached for a minute
function squeezeBests(season) {
  var cache = CacheService.getScriptCache(), hit = cache.get('sqb_' + season);
  if (hit) { try { return JSON.parse(hit); } catch (e) { } }
  var sh = climbSheet('Squeeze'), n = sh.getLastRow(), best = {};
  if (n > 1) sh.getRange(2, 2, n - 1, 6).getValues().forEach(function (r) {
    if (String(r[1]) !== season) return;
    var sid = String(r[0]), p = Number(r[2]); if (!sid || !isFinite(p)) return;
    var b = best[sid] || (best[sid] = { sid: sid, profit: -1e9, runs: 0, look: '' });
    b.runs++; if (p > b.profit) b.profit = p;
    if (r[5]) b.look = String(r[5]);   // the newest look wins (rows are in time order)
  });
  var list = Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return b.profit - a.profit; });
  list.forEach(function (b, i) { b.rank = i && b.profit === list[i - 1].profit ? list[i - 1].rank : i + 1; });
  var out = { best: best, list: list };
  try { cache.put('sqb_' + season, JSON.stringify(out), 60); } catch (e) { }
  return out;
}
function squeezeBoard(req) {
  var SQ = squeezeSim(), season = String(req.season || '');
  if (!SQ_SEASON.test(season)) season = SQ.season(new Date());
  var mySid = null;
  if (req.code || req.idToken) { try { mySid = auth(req).sid; } catch (e) { } }   // a stale sign-in still sees the board
  var b = squeezeBests(season), top = b.list.slice(0, 25), by = {}, firsts = {};
  rosterRows().forEach(function (r) { by[r.sid] = r; });
  function fn(r) { var n = String(r.name || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || '?'; }
  function li(r) { var n = String(r.name || ''); return n.indexOf(',') >= 0 ? n.split(',')[0].trim().charAt(0) : ''; }
  top.forEach(function (x) { var r = by[x.sid]; if (r) firsts[fn(r)] = (firsts[fn(r)] || 0) + 1; });
  var rows = top.map(function (x) {
    var r = by[x.sid] || { name: '?', cls: '' }, f = fn(r);
    return { rank: x.rank, name: firsts[f] > 1 && li(r) ? f + ' ' + li(r) + '.' : f, cls: r.cls || '', profit: x.profit, runs: x.runs, look: x.look || '', me: x.sid === mySid };
  });
  var me = mySid && b.best[mySid] ? { rank: b.best[mySid].rank, profit: b.best[mySid].profit } : null;
  return { ok: true, season: season, rows: rows, players: b.list.length, me: me };
}

/* ---------------- Show-Off (showoff-u2.html): the avatar stage show's public podium ----------------
   The page sends a finished show's seed and answers, never its score. The script rebuilds the ten questions from the seed with
   showoffSim() below (the same text as showoff-sim.js), marks the answers and works out the score itself. Shows count for this
   week (or the week either side); a seed is posted once per student. One row per show in the ShowOff tab; the podium shows each
   student's best show that week with their avatar look, first names only (a last initial only when two first names on the board
   are the same). Anyone can read the podium; posting needs a student sign-in. To take a show off, delete its row. */
function showoffSave(s, req) {
  var SO = showoffSim();
  if (String(req.v || '') !== SO.V) throw new Error('old game: reload the page');
  var season = String(req.season || '');
  if (!SQ_SEASON.test(season) || SO.seasonsNow(new Date()).indexOf(season) < 0) throw new Error('old week');
  var seed = String(req.seed || '');
  if (!/^[a-z0-9]{6,16}$/.test(seed)) throw new Error('bad show');
  if (!Array.isArray(req.answers) || req.answers.length !== SO.LOOKS) throw new Error('unfinished show');
  var cache = CacheService.getScriptCache();
  if (cache.get('so_' + s.sid)) throw new Error('slow down');
  var ans = SO.clean(req.answers), m = SO.mark(seed, ans);
  var look = String(req.look || ''); if (!/^[0-9a-z]{1,80}$/.test(look)) look = '';   // the arcade avatar code (with any newer parts' tail), shown on the podium
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('busy');
  try {
    var sh = climbSheet('ShowOff'), n = sh.getLastRow();
    if (n > 1 && sh.getRange(2, 2, n - 1, 5).getValues().some(function (r) { return String(r[0]) === s.sid && String(r[4]) === seed; })) throw new Error('already posted');
    sh.appendRow([new Date(), s.sid, season, m.score, m.right, seed, JSON.stringify(ans), look]);
  }
  finally { lock.releaseLock(); }
  cache.put('so_' + s.sid, '1', 10);
  cache.remove('sob_' + season);
  var b = showoffBests(season), me = b.best[s.sid];
  return { ok: true, score: m.score, right: m.right, best: me ? me.score : m.score, rank: me ? me.rank : 0 };
}
// each student's best show in a week, ranked (ties share a rank); cached for a minute
function showoffBests(season) {
  var cache = CacheService.getScriptCache(), hit = cache.get('sob_' + season);
  if (hit) { try { return JSON.parse(hit); } catch (e) { } }
  var sh = climbSheet('ShowOff'), n = sh.getLastRow(), best = {};
  if (n > 1) sh.getRange(2, 2, n - 1, 7).getValues().forEach(function (r) {
    if (String(r[1]) !== season) return;
    var sid = String(r[0]), sc = Number(r[2]); if (!sid || !isFinite(sc)) return;
    var b = best[sid] || (best[sid] = { sid: sid, score: -1, runs: 0, look: '' });
    b.runs++; if (sc > b.score) b.score = sc;
    if (r[6]) b.look = String(r[6]);   // the newest look wins (rows are in time order)
  });
  var list = Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return b.score - a.score; });
  list.forEach(function (b, i) { b.rank = i && b.score === list[i - 1].score ? list[i - 1].rank : i + 1; });
  var out = { best: best, list: list };
  try { cache.put('sob_' + season, JSON.stringify(out), 60); } catch (e) { }
  return out;
}
function showoffBoard(req) {
  var SO = showoffSim(), season = String(req.season || '');
  if (!SQ_SEASON.test(season)) season = SO.season(new Date());
  var mySid = null;
  if (req.code || req.idToken) { try { mySid = auth(req).sid; } catch (e) { } }   // a stale sign-in still sees the podium
  var b = showoffBests(season), top = b.list.slice(0, 25), by = {}, firsts = {};
  rosterRows().forEach(function (r) { by[r.sid] = r; });
  function fn(r) { var n = String(r.name || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || '?'; }
  function li(r) { var n = String(r.name || ''); return n.indexOf(',') >= 0 ? n.split(',')[0].trim().charAt(0) : ''; }
  top.forEach(function (x) { var r = by[x.sid]; if (r) firsts[fn(r)] = (firsts[fn(r)] || 0) + 1; });
  var rows = top.map(function (x) {
    var r = by[x.sid] || { name: '?', cls: '' }, f = fn(r);
    return { rank: x.rank, name: firsts[f] > 1 && li(r) ? f + ' ' + li(r) + '.' : f, cls: r.cls || '', score: x.score, runs: x.runs, look: x.look || '', me: x.sid === mySid };
  });
  var me = mySid && b.best[mySid] ? { rank: b.best[mySid].rank, score: b.best[mySid].score } : null;
  return { ok: true, season: season, rows: rows, players: b.list.length, me: me };
}

/* ---------------- Muddle Under the Pond: the advisory party game (muddle-host.html, muddle.html) ----------------
   Players do NOT sign in: they type a 4-letter room code and a nickname. Nothing goes in the Sheet; everything lives in
   the script cache and disappears 3 hours after the last move. The teacher's host page (teacher key) runs the game: it
   sends the board everyone may see, plus each player's own secret part (their role, tasks, who is in their room), and
   gets back every player's latest moves. A player's page sends its moves and reads the board and its own part, guarded
   by a random token its device made (so no one can read someone else's role). Cache keys, per room:
     rm_CODE  the board {at, b}      rl_CODE  the player ids that joined      ro_CODE  the host page that owns the room
     rp_CODE_pid  a player's nickname, critter, token and unacknowledged moves      rq_CODE_pid  that player's secret part */
var ROOM_CODE = /^[A-Z]{4}$/, ROOM_PID = /^[a-z0-9]{6,12}$/, ROOM_TOK = /^[a-z0-9]{12,32}$/, ROOM_TTL = 10800, ROOM_MAX = 40;
function roomNick(x) { return String(x == null ? '' : x).replace(/[^A-Za-z0-9 ._-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14); }
function roomList(cache, code) { try { return JSON.parse(cache.get('rl_' + code) || '[]') || []; } catch (e) { return []; } }
function roomCode(req) { var c = String(req.code || '').toUpperCase(); if (!ROOM_CODE.test(c)) throw new Error('bad room'); return c; }

function roomHost(req) {
  var code = roomCode(req), cache = CacheService.getScriptCache();
  var own = String(req.owner || '').replace(/[^a-z0-9]/gi, '').slice(0, 40), cur = cache.get('ro_' + code);
  if (!own) throw new Error('bad owner');
  // one host page per room: another page (or another teacher) using the same code is told so, unless it takes over
  if (cur && cur !== own && !req.claim) return { ok: false, error: 'taken' };
  var list = roomList(cache, code);
  if (req.end) {
    var gone = ['rm_' + code, 'rl_' + code, 'ro_' + code];
    list.forEach(function (p) { gone.push('rp_' + code + '_' + p, 'rq_' + code + '_' + p); });
    cache.removeAll(gone);
    return { ok: true };
  }
  if (!req.pub || typeof req.pub !== 'object') throw new Error('bad board');
  var puts = {}, bj = JSON.stringify({ at: Date.now(), b: req.pub });
  if (bj.length > 60000) throw new Error('too big');
  puts['rm_' + code] = bj; puts['ro_' + code] = own;
  var priv = req.priv && typeof req.priv === 'object' ? req.priv : {};
  Object.keys(priv).slice(0, ROOM_MAX * 2).forEach(function (pid) {
    if (!ROOM_PID.test(pid) || list.indexOf(pid) < 0) return;
    var s = JSON.stringify(priv[pid]); if (s.length <= 8000) puts['rq_' + code + '_' + pid] = s;
  });
  cache.putAll(puts, ROOM_TTL);
  var got = list.length ? cache.getAll(list.map(function (p) { return 'rp_' + code + '_' + p; })) : {}, players = {};
  list.forEach(function (p) {
    var v = got['rp_' + code + '_' + p]; if (!v) return;
    try { var o = JSON.parse(v); players[p] = { n: o.n, k: o.k, a: o.a, at: o.at }; } catch (e) { }
  });
  return { ok: true, now: Date.now(), players: players };
}

function roomPing(req) {
  var code = roomCode(req), pid = String(req.pid || ''), tok = String(req.tok || '');
  if (!ROOM_PID.test(pid) || !ROOM_TOK.test(tok)) throw new Error('bad player');
  var cache = CacheService.getScriptCache(), kb = 'rm_' + code, kp = 'rp_' + code + '_' + pid, kq = 'rq_' + code + '_' + pid;
  var got = cache.getAll([kb, kp, kq]);
  if (!got[kb]) return { ok: false, error: 'no room' };
  var old = null; try { old = JSON.parse(got[kp] || 'null'); } catch (e) { }
  if (old && old.tok !== tok) return { ok: false, error: 'bad player' };
  var nick = roomNick(req.nick); if (!nick) throw new Error('nickname');
  var me = { n: nick, k: Math.max(0, Math.min(99, Math.round(Number(req.look) || 0))), tok: tok, a: Array.isArray(req.acts) ? req.acts.slice(-30) : [], at: Date.now() };
  var mj = JSON.stringify(me); if (mj.length > 5000) throw new Error('too big');
  if (!old) {   // a new player: add their id to the room's list (the only step that needs the lock)
    var lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      var list = roomList(cache, code);
      if (list.indexOf(pid) < 0) {
        if (list.length >= ROOM_MAX) return { ok: false, error: 'full' };
        list.push(pid); cache.put('rl_' + code, JSON.stringify(list), ROOM_TTL);
      }
    } finally { lock.releaseLock(); }
  }
  cache.put(kp, mj, ROOM_TTL);
  var room = JSON.parse(got[kb]), mine = null; try { mine = JSON.parse(got[kq] || 'null'); } catch (e) { }
  return { ok: true, now: Date.now(), at: room.at, board: room.b, me: mine };
}

/* The game's rules: an exact copy of squeeze-sim.js. Change both together. */
/* Squeeze Street: the lemonade stand game's rules.
   The same text is pasted into backend/Code.gs, so the results script can replay a finished run from its choices and work
   out the profit itself (the page never sends a score). Change one, change the other the same way, and bump V.
   Plain ES5, no DOM: it runs in the browser and in Apps Script. All money is in whole cents. */
function squeezeSim() {
  var V = 'sq1', DAYS = 10, START = 1500, CUPS_PER_PITCHER = 10, SUGAR = 8, FLOOR = 500;
  var FINE_PERMIT = 300, FINE_INSPECT = 400, FEE_COOP = 300, FEE_TILL = 100, BONUS = 100;
  var WX = {
    rain: { label: 'Rainy', icon: '🌧️', t: [16, 20], c: [14, 24], m: [45, 60] },
    cloudy: { label: 'Cloudy', icon: '⛅', t: [22, 27], c: [26, 40], m: [55, 75] },
    sunny: { label: 'Sunny', icon: '☀️', t: [28, 34], c: [40, 58], m: [70, 90] },
    hot: { label: 'Heatwave', icon: '🔥', t: [37, 43], c: [60, 85], m: [90, 115] }
  };

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function r5(r, lo, hi) { return 5 * ri(r, Math.ceil(lo / 5), Math.floor(hi / 5)); }
  function shuffle(r, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // the ISO week ("2026-W48"): everyone plays the same ten days all week, so runs on the leaderboard are comparable
  function season(dt) {
    var d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())), wd = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - wd);
    var w = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
    return d.getUTCFullYear() + '-W' + (w < 10 ? '0' : '') + w;
  }
  // the weeks a run may be posted to: this one, and either side of it (a run finished just after midnight on Sunday)
  function seasonsNow(now) { var t = now.getTime(); return [season(new Date(t - 7 * 864e5)), season(now), season(new Date(t + 7 * 864e5))]; }

  // which kinds of rules each day uses: one-variable number lines first, then compound inequalities, then two-variable budgets
  var PLAN = [null,
    { price: 'one', ps: 0, sugar: 'one', ss: 0, show: 'text', q: 'pickLine:sugar' },
    { price: 'one', ps: 1, sugar: 'one', ss: 1, show: 'text', q: 'pickLine:price' },
    { price: 'one', ps: 2, sugar: 'one', ss: 2, show: 'line', q: 'pickText:price' },
    { price: 'two', sugar: 'one', ss: 2, show: 'text', cup: 1, q: 'mostCost:cup' },
    { price: 'two', sugar: 'two', show: 'text', lemon: 1, q: 'mostCost:lemon' },
    { price: 'two', sugar: 'two', show: 'line', cup: 1, lemon: 1, q: 'pickText:sugar' },
    { price: 'two', sugar: 'one', ss: 2, show: 'text', budget: 'text', q: 'region' },
    { price: 'two', sugar: 'two', show: 'line', budget: 'text', q: 'region' },
    { price: 'two', sugar: 'one', ss: 2, show: 'text', budget: 'graph', q: 'region' },
    { price: 'two', sugar: 'two', show: 'text', budget: 'text', cup: 1, lemon: 1, q: 'region' }
  ];

  // one day's weather, prices and rules: they depend only on the week and the day, never on what the player did
  function day(seed, d) {
    var r = rng(seed + d * 7919), P = PLAN[d];
    var keys = ['rain', 'cloudy', 'sunny', 'sunny', 'hot', 'hot', 'cloudy', 'sunny'];
    var wk = d === 1 ? 'sunny' : keys[ri(r, 0, keys.length - 1)], W = WX[wk];
    var sp = { d: d, wx: { k: wk, label: W.label, icon: W.icon, temp: ri(r, W.t[0], W.t[1]) } };
    var lo = ri(r, W.c[0], W.c[0] + 6), hi = lo + ri(r, 8, W.c[1] - W.c[0]);
    sp.crowd = { lo: lo, hi: hi }; sp.base = ri(r, lo, hi);
    // price rule: customers walk away above the top; on compound days the market permit also sets a lowest price
    var M = r5(r, W.m[0], W.m[1]), strictT = P.ps === 1 ? true : P.ps === 0 ? false : r() < 0.5;
    sp.price = { min: 0, minStrict: false, max: M, maxStrict: strictT, show: P.show };
    if (P.price === 'two') { sp.price.min = M - r5(r, 25, 40); sp.price.minStrict = r() < 0.4; sp.price.maxStrict = r() < 0.5; }
    sp.price.best = sp.price.maxStrict ? M - 5 : M;
    sp.price.low = sp.price.min ? (sp.price.minStrict ? sp.price.min + 5 : sp.price.min) : 5;
    // the health inspector: sugar scoops per pitcher
    var k = ri(r, 2, 3), sStrict = P.ss === 1 ? true : P.ss === 0 ? false : r() < 0.5;
    sp.sugar = { min: k, minStrict: sStrict, max: 0, maxStrict: false, show: P.show };
    if (P.sugar === 'two') { sp.sugar.minStrict = r() < 0.5; sp.sugar.max = k + ri(r, 2, 3); sp.sugar.maxStrict = r() < 0.5; }
    sp.sugar.best = sp.sugar.minStrict ? k + 1 : k;
    sp.sugar.top = sp.sugar.max ? (sp.sugar.maxStrict ? sp.sugar.max - 1 : sp.sugar.max) : 10;
    // supplies: a fixed price, or a range "lo < cost <= hi" where today's real price is only known at the till
    var cup = ri(r, 4, 6), lem = r5(r, 150, 200);
    sp.cup = { lo: cup, hi: cup, cost: cup };
    if (P.cup) { var cl = ri(r, 3, 5), ch = cl + ri(r, 2, 3); sp.cup = { lo: cl, hi: ch, cost: ri(r, cl + 1, ch) }; }
    sp.lemon = { lo: lem, hi: lem, cost: lem };
    if (P.lemon) { var ll = r5(r, 130, 170), lh = ll + r5(r, 30, 50); sp.lemon = { lo: ll, hi: lh, cost: r5(r, ll + 5, lh) }; }
    // the co-op's credit limit on cups and lemons: a two-variable inequality  (cup price)c + (lemon price)P <= L
    sp.budget = null;
    if (P.budget) {
      var a = sp.cup.hi, b = sp.lemon.hi, L = 50 * Math.round(0.8 * (hi * a + Math.ceil(hi / CUPS_PER_PITCHER) * b) / 50);
      sp.budget = { a: a, b: b, L: L, show: P.budget, range: sp.cup.lo !== sp.cup.hi || sp.lemon.lo !== sp.lemon.hi };
    }
    sp.q = question(r, P.q, sp);
    return sp;
  }

  function ineq(rule) { return { lo: rule.min, loStrict: rule.minStrict, hi: rule.max, hiStrict: rule.maxStrict }; }
  // one optional planning question a day: a right answer puts $1 in the tip jar; a wrong one costs nothing but that dollar
  function question(r, kind, sp) {
    var parts = kind.split(':'), q = { kind: parts[0], about: parts[1] || '' }, opts;
    if (q.kind === 'pickLine' || q.kind === 'pickText') {
      var R = q.about === 'price' ? sp.price : sp.sugar, right = ineq(R);
      if ((q.about === 'sugar' && !R.max) || (q.about === 'price' && !R.min)) {
        // a ray: s >= k, s > k, p <= M, p < M
        var one = q.about === 'sugar' ? { lo: R.min, loStrict: R.minStrict, hi: null } : { lo: null, hi: R.max, hiStrict: R.maxStrict };
        var flip = one.lo != null ? { lo: null, hi: one.lo, hiStrict: one.loStrict } : { lo: one.hi, loStrict: one.hiStrict, hi: null };
        var hole = one.lo != null ? { lo: one.lo, loStrict: !one.loStrict, hi: null } : { lo: null, hi: one.hi, hiStrict: !one.hiStrict };
        opts = [one, flip, hole];
      } else {
        opts = [right, { lo: right.lo, loStrict: !right.loStrict, hi: right.hi, hiStrict: !right.hiStrict }, { lo: null, hi: right.lo, hiStrict: !right.loStrict, also: { lo: right.hi, loStrict: !right.hiStrict } }];
      }
      q.var = q.about === 'price' ? 'p' : 's'; q.money = q.about === 'price';
    } else if (q.kind === 'mostCost') {
      var it = q.about === 'cup' ? sp.cup : sp.lemon, n = q.about === 'cup' ? 10 * ri(r, 3, 6) : ri(r, 3, 6);
      q.n = n; q.lo = it.lo; q.hi = it.hi;
      opts = [n * it.hi, n * it.lo, n * Math.round((it.lo + it.hi) / 2)];
    } else {
      // which order fits under the co-op limit (at the highest prices on a range day)?
      var B = sp.budget, P1 = ri(r, 1, Math.max(1, Math.min(4, Math.floor((B.L - 2 * B.a) / B.b)))), room = Math.floor((B.L - B.b * P1) / B.a);
      var c1 = Math.max(0, room - ri(r, 2, 8));
      var P2 = P1 + 1, c2 = Math.max(0, Math.floor((B.L - B.b * P2) / B.a)) + ri(r, 3, 10);
      var P3 = Math.max(1, P1 - 1), c3 = Math.floor((B.L - B.b * P3) / B.a) + ri(r, 1, 6);
      opts = [{ P: P1, c: c1 }, { P: P2, c: c2 }, { P: P3, c: c3 }];
    }
    var order = shuffle(r, [0, 1, 2]);
    q.opts = order.map(function (i) { return opts[i]; });
    q.ans = order.indexOf(0);
    return q;
  }

  function int(x, lo, hi) { x = Math.round(Number(x)); return isFinite(x) ? Math.max(lo, Math.min(hi, x)) : lo; }
  // a day's choices: [pitchers, sugar scoops per pitcher, cups to buy, price in cents (5-cent steps), question answer or -1]
  function clean(x) {
    x = x || [];
    return [int(x[0], 0, 30), int(x[1], 0, 10), int(x[2], 0, 400), 5 * int(Number(x[3]) / 5, 1, 60), int(x[4], -1, 2)];
  }
  // the most the order can be and still fit under a limit: cut pitchers first (lemonade spoils, paper cups keep), then cups
  function trim(P, c, a, b, lim) {
    if (a * c + b * P <= lim) return [P, c];
    if (a * c <= lim) return [Math.max(0, Math.floor((lim - a * c) / b)), c];
    return [0, Math.max(0, Math.floor(lim / a))];
  }

  // replays a run from the start; plan is a list of days' choices (an unfinished run replays as far as it goes)
  function run(sea, plan) {
    var seed = hash('squeeze|' + sea), cash = START, stock = 0, loans = 0, out = [], clean0 = [];
    plan = (Array.isArray(plan) ? plan : []).slice(0, DAYS);
    for (var d = 1; d <= plan.length; d++) {
      var sp = day(seed, d), x = clean(plan[d - 1]), o = { loan: 0, fines: [] };
      clean0.push(x);
      if (cash < FLOOR) { o.loan = FLOOR - cash; loans += o.loan; cash = FLOOR; }
      o.cash0 = cash; o.stock0 = stock;
      var P = x[0], s = x[1], c = x[2], p = x[3];
      o.asked = { P: P, c: c };
      if (sp.budget) {
        o.coop = sp.cup.cost * c + sp.lemon.cost * P;
        if (o.coop > sp.budget.L) { var t = trim(P, c, sp.cup.cost, sp.lemon.cost, sp.budget.L); P = t[0]; c = t[1]; o.fines.push({ k: 'coop', amt: FEE_COOP }); }
      }
      var perP = sp.lemon.cost + s * SUGAR;
      if (P * perP + c * sp.cup.cost > cash) { var t2 = trim(P, c, sp.cup.cost, perP, cash); P = t2[0]; c = t2[1]; o.fines.push({ k: 'till', amt: FEE_TILL }); }
      o.P = P; o.c = c; o.s = s; o.p = p;
      o.cost = { lemons: P * sp.lemon.cost, sugar: P * s * SUGAR, cups: c * sp.cup.cost };
      var spent = o.cost.lemons + o.cost.sugar + o.cost.cups;
      stock += c;
      var R = sp.price, S = sp.sugar;
      o.over = R.maxStrict ? p >= R.max : p > R.max;
      o.under = R.min ? (R.minStrict ? p <= R.min : p < R.min) : false;
      o.weak = S.minStrict ? s <= S.min : s < S.min;
      o.sweet = S.max ? (S.maxStrict ? s >= S.max : s > S.max) : false;
      var want = o.over ? Math.floor(sp.base * 0.15) : sp.base;
      if (o.sweet) want = Math.floor(want * 0.6);
      o.want = want;
      o.made = P * CUPS_PER_PITCHER;
      o.sold = Math.min(want, o.made, stock);
      stock -= o.sold;
      o.poured = o.made - o.sold;
      o.revenue = o.sold * p;
      if (P > 0 && o.under) o.fines.push({ k: 'permit', amt: FINE_PERMIT });
      if (P > 0 && o.weak) o.fines.push({ k: 'inspector', amt: FINE_INSPECT });
      var fined = 0; o.fines.forEach(function (f) { fined += f.amt; });
      o.q = x[4]; o.right = x[4] >= 0 && x[4] === sp.q.ans; o.bonus = o.right ? BONUS : 0;
      o.profit = o.revenue - spent - fined + o.bonus;
      cash += o.profit;
      o.cash1 = cash; o.stock1 = stock;
      out.push({ spec: sp, out: o });
    }
    return { season: sea, days: out, cash: cash, stock: stock, loans: loans, profit: cash - START - loans, plan: clean0, done: plan.length === DAYS };
  }

  return {
    V: V, DAYS: DAYS, START: START, CUPS_PER_PITCHER: CUPS_PER_PITCHER, SUGAR: SUGAR, FLOOR: FLOOR,
    FINE_PERMIT: FINE_PERMIT, FINE_INSPECT: FINE_INSPECT, FEE_COOP: FEE_COOP, FEE_TILL: FEE_TILL, BONUS: BONUS,
    season: season, seasonsNow: seasonsNow, seed: function (sea) { return hash('squeeze|' + sea); }, day: day, run: run, clean: clean
  };
}

/* Show-Off: the avatar stage show's questions and scoring (showoff-u2.html).
   The same text is pasted into backend/Code.gs, so the results script can rebuild a show from its seed, mark the answers and
   work out the score itself (the page never sends a score). Change one, change the other the same way, and bump V.
   Plain ES5, no DOM: it runs in the browser and in Apps Script.

   A show is ten "looks" in three acts, built from a seed (a fresh one every show):
     Act 1 The Runway (a number line from −8 to 8): read the lit runway; walk to the biggest or smallest whole number that works
     Act 2 Quick Change (solving): turn the sign for a negative; walk to the answer of a two-sided inequality; pick the graph
     Act 3 The Photo Floor (the plane, −5 to 5): pose on a point that works; is the avatar in the solution?; pick the shading;
           pose inside a system of two inequalities
   Answers: a choice number (0-3), a whole number on the runway, or a point [x, y] on the floor.
   Score: 100 for a right answer, plus 20 for every right answer just before it in a row (up to +100). Best show: 1700. */
function showoffSim() {
  var V = 'so1', LOOKS = 10, RUN = 8, FLOOR = 5;
  var LT = '<', LE = '≤', GT = '>', GE = '≥', OPS = [LT, LE, GT, GE];

  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  function nz(r, lo, hi) { var v = 0; while (!v) v = ri(r, lo, hi); return v; }
  function shuffle(r, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // the ISO week ("2026-W48"): the leaderboard is weekly
  function season(dt) {
    var d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())), wd = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - wd);
    var w = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
    return d.getUTCFullYear() + '-W' + (w < 10 ? '0' : '') + w;
  }
  function seasonsNow(now) { var t = now.getTime(); return [season(new Date(t - 7 * 864e5)), season(now), season(new Date(t + 7 * 864e5))]; }

  /* ---------- writing it down (the lessons' way: a real minus sign, spaces around the signs) ---------- */
  function n(v) { return v < 0 ? '−' + Math.abs(v) : String(v); }
  function lin(a, b, v) {
    v = v || 'x';
    var s = a === 0 ? '' : a === 1 ? v : a === -1 ? '−' + v : n(a) + v;
    if (!s) return n(b);
    return b === 0 ? s : s + (b < 0 ? ' − ' : ' + ') + Math.abs(b);
  }
  function flip(op) { return op === LT ? GT : op === GT ? LT : op === LE ? GE : LE; }
  function strict(op) { return op === LT || op === GT; }
  function up(op) { return op === GT || op === GE; }
  function holds(l, op, r) { return op === LT ? l < r : op === LE ? l <= r : op === GT ? l > r : l >= r; }
  function iq(op, c) { return 'x ' + op + ' ' + n(c); }
  function pic(op, c) { return { at: c, open: strict(op), dir: up(op) ? 'r' : 'l' }; }
  function lineText(L) { return 'y ' + L.op + ' ' + lin(L.m, L.b); }
  // the biggest (for < and ≤) or smallest (for > and ≥) whole number with x op c
  function edge(op, c) { return op === LT ? c - 1 : op === GT ? c + 1 : c; }
  function askOf(op) { return up(op) ? 'smallest' : 'largest'; }
  function edgeWhy(op, c) {
    var e = edge(op, c);
    return 'The ' + askOf(op) + ' whole number with ' + iq(op, c) + ' is ' + n(e) + (strict(op) ? ' (' + n(c) + ' itself doesn\'t count: ' + op + ' means not equal).' : ' (' + op + ' lets x equal ' + n(c) + ').');
  }

  /* ---------- Act 1: the runway ---------- */
  function read(r) {
    var c = ri(r, -6, 6), op = pick(r, OPS), opts = shuffle(r, OPS.slice()).map(function (o) { return iq(o, c); });
    return { k: 'read', act: 1, q: 'The spotlight lights up the runway. Which inequality is it showing?', pic: pic(op, c), opts: opts, ans: opts.indexOf(iq(op, c)),
      why: [(strict(op) ? 'An open dot: ' + n(c) + ' is not included, so it\'s < or >.' : 'A closed dot: ' + n(c) + ' is included, so it\'s ≤ or ≥.'),
        'The light runs to the ' + (up(op) ? 'right: bigger numbers, so x is greater.' : 'left: smaller numbers, so x is less.'), 'So it\'s ' + iq(op, c) + '.'] };
  }
  function walk1(r) {
    var c = ri(r, -6, 6), op = pick(r, OPS), text, why;
    if (r() < 0.5) {
      var b = nz(r, -7, 7); text = lin(1, b) + ' ' + op + ' ' + n(c + b);
      why = [text, (b > 0 ? 'Take ' + b + ' from both sides: ' : 'Add ' + Math.abs(b) + ' to both sides: ') + iq(op, c) + '.'];
    } else {
      var a = ri(r, 2, 5); text = lin(a, 0) + ' ' + op + ' ' + n(a * c);
      why = [text, 'Divide both sides by ' + a + ' (positive, so the sign stays): ' + iq(op, c) + '.'];
    }
    why.push(edgeWhy(op, c));
    return { k: 'walk', act: 1, iq: text, ask: askOf(op), ans: edge(op, c), sol: iq(op, c),
      q: 'Walk to the ' + askOf(op) + ' whole number that makes ' + text + ' true.', why: why };
  }
  function walkFlip(r) {
    var a = -ri(r, 2, 5), c = nz(r, -5, 5), op0 = pick(r, OPS), op = flip(op0), text = lin(a, 0) + ' ' + op0 + ' ' + n(a * c);
    return { k: 'walk', act: 1, iq: text, ask: askOf(op), ans: edge(op, c), sol: iq(op, c), flip: true,
      q: 'Walk to the ' + askOf(op) + ' whole number that makes ' + text + ' true.',
      why: [text, 'Divide both sides by ' + n(a) + '. Dividing by a negative turns the sign: ' + op0 + ' becomes ' + op + '.', iq(op, c), edgeWhy(op, c)] };
  }

  /* ---------- Act 2: quick change ---------- */
  function solve(r) {
    var a = -ri(r, 2, 5), c = nz(r, -5, 5), b = nz(r, -9, 9), op0 = pick(r, OPS), op = flip(op0), text = lin(a, b) + ' ' + op0 + ' ' + n(a * c + b);
    var right = iq(op, c), opts = shuffle(r, [right, iq(op0, c), iq(op, -c), iq(op0, -c)]);
    return { k: 'solve', act: 2, iq: text, q: 'Quick change! Solve ' + text + '.', opts: opts, ans: opts.indexOf(right),
      why: [text, (b > 0 ? 'Take ' + b + ' from both sides: ' : 'Add ' + Math.abs(b) + ' to both sides: ') + lin(a, 0) + ' ' + op0 + ' ' + n(a * c) + '.',
        'Divide by ' + n(a) + ' and turn the sign: ' + right + '.', 'Check with a number: x = ' + n(edge(op, c) + (up(op) ? 1 : -1)) + ' works, x = ' + n(edge(op, c) + (up(op) ? -2 : 2)) + ' doesn\'t.'] };
  }
  function walk2(r) {
    // a1x + b1 op0 a2x + b2, whose answer is x op c (the sign turns when a1 − a2 is negative)
    var d = pick(r, [-4, -3, -2, 2, 3, 4]), a2 = nz(r, -3, 3), a1 = a2 + d, c = ri(r, -6, 6), b2 = ri(r, -8, 8);
    if (!a1) { a1 = a2 + (d = d > 0 ? d + 1 : d - 1); }
    var b1 = b2 - d * c, op0 = pick(r, OPS), op = d < 0 ? flip(op0) : op0, text = lin(a1, b1) + ' ' + op0 + ' ' + lin(a2, b2);
    var why = [text, 'Get the x terms on one side: ' + lin(d, b1) + ' ' + op0 + ' ' + n(b2) + '.', (b1 > 0 ? 'Take ' + b1 + ' from both sides: ' : b1 < 0 ? 'Add ' + Math.abs(b1) + ' to both sides: ' : 'Now: ') + lin(d, 0) + ' ' + op0 + ' ' + n(b2 - b1) + '.',
      'Divide by ' + n(d) + (d < 0 ? ' and turn the sign (it\'s negative): ' : ': ') + iq(op, c) + '.', edgeWhy(op, c)];
    return { k: 'walk', act: 2, iq: text, ask: askOf(op), ans: edge(op, c), sol: iq(op, c), flip: d < 0,
      q: 'Walk to the ' + askOf(op) + ' whole number that makes ' + text + ' true.', why: why };
  }
  function graph(r) {
    var a = nz(r, -4, 4), c = ri(r, -5, 5), b = ri(r, -6, 6), op0 = pick(r, OPS), op = a < 0 ? flip(op0) : op0, text = lin(a, b) + ' ' + op0 + ' ' + n(a * c + b);
    var P = pic(op, c), all = [P, { at: c, open: !P.open, dir: P.dir }, { at: c, open: P.open, dir: P.dir === 'r' ? 'l' : 'r' }, { at: c, open: !P.open, dir: P.dir === 'r' ? 'l' : 'r' }];
    var opts = shuffle(r, all.slice());
    return { k: 'graph', act: 2, iq: text, q: 'Pick the runway lights for ' + text + '.', opts: opts, ans: opts.indexOf(P),
      why: [text, (b ? (b > 0 ? 'Take ' + b + ' from both sides' : 'Add ' + Math.abs(b) + ' to both sides') + (a === 1 ? '' : ', then ') : '') + (a === 1 ? '' : (b ? 'd' : 'D') + 'ivide by ' + n(a) + (a < 0 ? ' and turn the sign' : '')) + ': ' + iq(op, c) + '.',
        (P.open ? 'Open dot' : 'Closed dot') + ' at ' + n(c) + ', lit to the ' + (P.dir === 'r' ? 'right.' : 'left.')] };
  }

  /* ---------- Act 3: the photo floor ---------- */
  function onFloor(x, y) { return x >= -FLOOR && x <= FLOOR && y >= -FLOOR && y <= FLOOR && x === Math.round(x) && y === Math.round(y); }
  function inLine(L, x, y) { return holds(y, L.op, L.m * x + L.b); }
  function count(lines) { var k = 0; for (var x = -FLOOR; x <= FLOOR; x++) for (var y = -FLOOR; y <= FLOOR; y++) if (lines.every(function (L) { return inLine(L, x, y); })) k++; return k; }
  function some(lines) { for (var y = FLOOR; y >= -FLOOR; y--) for (var x = -FLOOR; x <= FLOOR; x++) if (lines.every(function (L) { return inLine(L, x, y); })) return [x, y]; return null; }
  function aLine(r, ops) { return { m: pick(r, [-3, -2, -1, 1, 2, 3, -1, 1, 2, -2, 0]), b: ri(r, -3, 3), op: pick(r, ops || OPS) }; }
  function lineWhy(L) {
    return [lineText(L) + ': the boundary is y = ' + lin(L.m, L.b) + (L.m ? ' (it crosses the y-axis at ' + n(L.b) + ', slope ' + n(L.m) + ').' : ', a flat line through ' + n(L.b) + ' on the y-axis.'),
      (strict(L.op) ? 'Dashed line: points on it don\'t count.' : 'Solid line: points on it count.') + ' The solution is ' + (up(L.op) ? 'above' : 'below') + ' the line.'];
  }
  function pose1(r) {
    var L = aLine(r);
    return { k: 'pose', act: 3, lines: [L], q: 'Photo time! Pose on a point where ' + lineText(L) + '.', ex: some([L]),
      why: lineWhy(L).concat(['Test your point: put its x and y into ' + lineText(L) + ' and see if it\'s true.']) };
  }
  function test(r) {
    var a = ri(r, 1, 4), b = ri(r, 1, 4), x = ri(r, 0, 4), y = ri(r, 0, 4), dl = pick(r, [-3, -2, -1, 0, 0, 1, 2, 3]), op = pick(r, OPS), c = a * x + b * y + dl;
    if (c <= 0) c = a * x + b * y + 2;
    var lhs = a * x + b * y, yes = holds(lhs, op, c), text = lin(a, 0) + ' + ' + lin(b, 0, 'y') + ' ' + op + ' ' + c;
    return { k: 'test', act: 3, std: { a: a, b: b, c: c, op: op }, pt: [x, y], iq: text, q: 'You\'re posing at (' + x + ', ' + y + '). Are you in the solution of ' + text + '?',
      opts: ['Yes: it\'s true here', 'No: it\'s false here'], ans: yes ? 0 : 1,
      why: ['Put x = ' + x + ' and y = ' + y + ' into ' + text + ':', (a === 1 ? x : a + '(' + x + ')') + ' + ' + (b === 1 ? y : b + '(' + y + ')') + ' = ' + lhs + '.', lhs + ' ' + op + ' ' + c + ' is ' + (yes ? 'true' : 'false') + (lhs === c ? (strict(op) ? ': on a dashed line, so not in.' : ': on the solid line, so it counts.') : '.')] };
  }
  function shade(r, not) {
    var L = aLine(r); while (not && L.m === not.m && L.b === not.b) L = aLine(r);
    var right = { solid: !strict(L.op), above: up(L.op) }, all = [right, { solid: !right.solid, above: right.above }, { solid: right.solid, above: !right.above }, { solid: !right.solid, above: !right.above }];
    var opts = shuffle(r, all.slice());
    return { k: 'shade', act: 3, line: { m: L.m, b: L.b }, iq: lineText(L), q: 'Which floor plan shows ' + lineText(L) + '?', opts: opts, ans: opts.indexOf(right), why: lineWhy(L) };
  }
  function system(r) {
    for (var t = 0; t < 60; t++) {
      var tx = ri(r, -3, 3), ty = ri(r, -3, 3), m1 = pick(r, [-2, -1, 0, 1, 2, 3, -3]), m2 = pick(r, [-2, -1, 0, 1, 2, 3, -3]);
      if (m1 === m2) continue;
      var L1 = { m: m1, b: ty - m1 * tx - ri(r, 1, 2), op: pick(r, [GT, GE]) }, L2 = { m: m2, b: ty - m2 * tx + ri(r, 1, 2), op: pick(r, [LT, LE]) };
      if (Math.abs(L1.b) > 6 || Math.abs(L2.b) > 6) continue;
      var k = count([L1, L2]); if (k < 4 || k > 50) continue;
      var lines = r() < 0.5 ? [L1, L2] : [L2, L1];
      return { k: 'pose', act: 3, lines: lines, sys: true, q: 'Group photo! Pose where both are true: ' + lineText(lines[0]) + ' and ' + lineText(lines[1]) + '.', ex: some(lines),
        why: [lineText(L1) + ': above its line (' + (strict(L1.op) ? 'dashed' : 'solid') + ').', lineText(L2) + ': below its line (' + (strict(L2.op) ? 'dashed' : 'solid') + ').', 'The solution is where the two shadings overlap. Test a point in both.'] };
    }
    var F1 = { m: 0, b: -1, op: GT }, F2 = { m: 1, b: 2, op: LE };   // never reached in practice: a safe system
    return { k: 'pose', act: 3, lines: [F1, F2], sys: true, q: 'Group photo! Pose where both are true: ' + lineText(F1) + ' and ' + lineText(F2) + '.', ex: some([F1, F2]), why: ['Above y = −1 and on or below y = x + 2.'] };
  }

  var ACTS = [null, 'The Runway', 'Quick Change', 'The Photo Floor'];
  function show(seed) {
    var r = rng(hash('showoff|' + seed));
    var P = pose1(r);
    return [read(r), walk1(r), walkFlip(r), solve(r), walk2(r), graph(r), P, test(r), shade(r, P.lines[0]), system(r)];
  }
  function check(L, a) {
    if (!L) return false;
    if (L.k === 'pose') {
      if (!a || a.length !== 2) return false;
      var x = Number(a[0]), y = Number(a[1]);
      return onFloor(x, y) && L.lines.every(function (M) { return inLine(M, x, y); });
    }
    return typeof a === 'number' && a === L.ans;
  }
  function pts(streak) { return 100 + 20 * Math.min(5, streak); }
  // mark a whole show: the answers in order (missing ones count as wrong)
  function mark(seed, answers) {
    var S = show(seed), streak = 0, best = 0, score = 0, right = 0, marks = [];
    answers = Array.isArray(answers) ? answers : [];
    S.forEach(function (L, i) {
      var ok = check(L, answers[i]); marks.push(ok);
      if (ok) { score += pts(streak); streak++; right++; best = Math.max(best, streak); } else streak = 0;
    });
    return { score: score, right: right, best: best, marks: marks, done: answers.length === LOOKS };
  }
  function clean(answers) {
    return (Array.isArray(answers) ? answers : []).slice(0, LOOKS).map(function (a) {
      if (Array.isArray(a)) return [Math.round(Number(a[0])) || 0, Math.round(Number(a[1])) || 0];
      var v = Number(a); return isFinite(v) ? Math.round(v) : null;
    });
  }

  return { V: V, LOOKS: LOOKS, RUN: RUN, FLOOR: FLOOR, ACTS: ACTS, MAX: 1700, season: season, seasonsNow: seasonsNow, hash: hash,
    show: show, check: check, mark: mark, pts: pts, clean: clean, lin: lin, n: n, lineText: lineText, inLine: inLine, strict: strict, up: up };
}
