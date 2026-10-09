/**
 * Sandy Flats Arcade: results backend.
 * A Google Apps Script web app bound to one Google Sheet that Mr. Crowell owns.
 *
 * Tabs (created on first run by setup()):
 *   Roster    sid | name | class | email | code
 *   Progress  sid | game | updated | levelsDone | levelsTotal | coreDone | coreTotal | standard | specials | assisted | tickets | levels | raw
 *   Events    time | sid | game | type | detail
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
  Events: ['time', 'sid', 'game', 'type', 'detail']
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
    case 'roster': teacher(req); return { ok: true, roster: rosterRows().map(function (r) { return { sid: r.sid, name: r.name, cls: r.cls, email: r.email, code: r.code }; }) };
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
  return { ok: true, student: publicStudent(s), games: rows };
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
  return { ok: true, roster: roster, progress: prog, events: events };
}
