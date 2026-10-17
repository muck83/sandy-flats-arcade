/* Climb practice backend: a pretend results script kept in this browser's localStorage, so the student page and the
   teacher dashboard can be tried without the Google Sheet. Used only by climb/dev/*.html. Student codes: AAAAAA,
   BBBBBB, CCCCCC. Teacher key: test. */
(function () {
  'use strict';
  var EP = 'https://mock.invalid/exec', K = 'climbmock', LEN = 12 * 60 * 1000;
  window.SFA_CONFIG = { endpoint: EP, auth: 'code' };
  var ROSTER = [{ sid: 's1', name: 'Doe, Jane', cls: 'A', code: 'AAAAAA' }, { sid: 's2', name: 'Khan, Omar', cls: 'A', code: 'BBBBBB' }, { sid: 's3', name: 'Lee, Maya', cls: 'B', code: 'CCCCCC' }];
  function db() { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } }
  function put(d) { localStorage.setItem(K, JSON.stringify(d)); }
  function pub(s) { return { sid: s.sid, name: s.name, cls: s.cls }; }
  function auth(r) { var s = ROSTER.filter(function (x) { return x.code === String(r.code || '').toUpperCase(); })[0]; if (!s) throw new Error(r.code ? 'bad code' : 'sign in'); return s; }
  function tch(r) { if (r.teacherKey !== 'test') throw new Error('teacher key'); }
  function forS(d, s) { var c = d.session; if (!c || (c.cls && c.cls !== s.cls)) return null; return { id: c.id, state: c.state, start: c.start || 0, pausedAt: c.pausedAt || 0, pausedMs: c.pausedMs || 0, len: LEN, focus: c.focus || '', focusAll: !!c.focusAll, endedAt: c.endedAt || 0 }; }
  function route(r) {
    var d = db(); d.rows = d.rows || {}; d.log = d.log || []; d.here = d.here || {}; d.accom = d.accom || {};
    var s, out;
    switch (r.op) {
      case 'load': s = auth(r); return { ok: true, student: pub(s), games: {}, sums: {} };
      case 'hello': s = auth(r); return { ok: true, student: pub(s) };
      case 'live': return { ok: true, live: null, climb: d.session && d.session.state !== 'ended' ? { state: d.session.state, cls: d.session.cls } : null };
      case 'climbHello': s = auth(r); var row = d.rows[s.sid] || {}; return { ok: true, student: pub(s), state: row.state || null, ov: row.ov || null, session: forS(d, s), mult: d.accom[s.sid] || 1, now: Date.now() };
      case 'climbPing': s = auth(r); var st = r.status || {}; st.at = Date.now(); d.here[s.sid] = st; put(d); return { ok: true, now: Date.now(), session: forS(d, s), mult: d.accom[s.sid] || 1 };
      case 'climbSave':
        s = auth(r); var m = r.summary || {}, rw = d.rows[s.sid] || {};
        if (JSON.stringify(r.state).length > 45000) throw new Error('too big');
        Object.assign(rw, { sid: s.sid, updated: new Date().toISOString(), theta: m.theta, sess: m.sess, secure: m.secure, retained: m.retained, frontier: m.frontier, map: m.map, today: m.today, hist: (r.state.hist || []).slice(-30), state: r.state });
        d.rows[s.sid] = rw;
        (r.log || []).forEach(function (x) { d.log.push([x.at, s.sid, x.sess, x.skill, x.tid, x.seed, x.mode, x.ans, x.res, x.tag || '', x.secs, x.flags || '']); });
        put(d); return { ok: true };
      case 'climbControl':
        tch(r); var a = r.action, c = d.session, now = Date.now();
        if (a === 'accom') { if (r.mult === 1.5 || r.mult === 2) d.accom[r.sid] = r.mult; else delete d.accom[r.sid]; put(d); return { ok: true, session: c, accom: d.accom }; }
        if (a === 'open') c = { id: 'S' + new Date().toISOString().slice(2, 16).replace(/[-:T]/g, ''), cls: r.cls || '', state: 'open', start: 0, pausedAt: 0, pausedMs: 0, focus: r.focus || '', focusAll: !!r.focusAll };
        else if (!c) throw new Error('no session');
        else if (a === 'start') { c.state = 'running'; c.start = now + 10000; }
        else if (a === 'pause') { c.state = 'paused'; c.pausedAt = now; }
        else if (a === 'resume') { c.pausedMs += now - c.pausedAt; c.pausedAt = 0; c.state = 'running'; }
        else if (a === 'end') { if (c.state === 'paused') { c.pausedMs += now - c.pausedAt; c.pausedAt = 0; } c.state = 'ended'; c.endedAt = now; }
        else if (a === 'focus') { c.focus = r.focus || ''; c.focusAll = !!r.focusAll; }
        else if (a === 'clear') c = null;
        d.session = c; put(d); return { ok: true, session: c, accom: d.accom, now: now };
      case 'climbClass':
        tch(r);
        return { ok: true, now: Date.now(), roster: ROSTER.map(pub), rows: Object.keys(d.rows).map(function (k) { var o = Object.assign({}, d.rows[k]); delete o.state; return o; }), here: d.here, session: d.session || null, accom: d.accom, log: d.log.filter(function (x) { return x[0] > Date.now() - 8 * 86400000; }) };
      case 'climbCheck':
        tch(r); var rr = d.rows[r.sid]; if (!rr) throw new Error('no climb yet'); var ov = rr.ov || {}; ov.cleared = (ov.cleared || []).filter(function (x) { return x !== r.skill; }); ov.back = (ov.back || []).filter(function (x) { return x !== r.skill; }); (r.ok ? ov.cleared : ov.back).push(r.skill); ov.at = Date.now(); rr.ov = ov; put(d); return { ok: true, ov: ov };
      case 'climbStudent': tch(r); return { ok: true, state: d.rows[r.sid] ? d.rows[r.sid].state : null };
      default: throw new Error('unknown op');
    }
  }
  var real = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    if (String(url) !== EP) return real(url, opts);
    var out; try { out = route(JSON.parse(opts.body)); } catch (e) { out = { ok: false, error: e.message }; }
    var txt = JSON.stringify(out);
    return new Promise(function (res) { setTimeout(function () { res({ ok: true, text: function () { return Promise.resolve(txt); }, json: function () { return Promise.resolve(JSON.parse(txt)); } }); }, 120); });
  };
  window.CLIMB_MOCK = { reset: function () { localStorage.removeItem(K); }, db: db };
})();
