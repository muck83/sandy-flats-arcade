/* Climb practice backend: a pretend results script kept in this browser's localStorage, so the student page and the
   teacher dashboard can be tried without the Google Sheet. Used only by climb/dev/*.html. Student codes: AAAAAA,
   BBBBBB, CCCCCC. Teacher key: test. */
(function () {
  'use strict';
  var EP = 'https://mock.invalid/exec', K = 'climbmock', LEN = 12 * 60 * 1000;
  window.SFA_CONFIG = { endpoint: EP, auth: 'code' };
  window.CLIMB_ROOT = localStorage.getItem('climbmock.root') || '../../';   // the practice pages live two folders down: links to lessons go back up
  var ROSTER = [{ sid: 's1', name: 'Doe, Jane', cls: 'A', code: 'AAAAAA' }, { sid: 's2', name: 'Khan, Omar', cls: 'A', code: 'BBBBBB' }, { sid: 's3', name: 'Lee, Maya', cls: 'B', code: 'CCCCCC' }];
  function db() { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } }
  function put(d) { localStorage.setItem(K, JSON.stringify(d)); }
  function pub(s) { return { sid: s.sid, name: s.name, cls: s.cls }; }
  function auth(r) { var s = ROSTER.filter(function (x) { return x.code === String(r.code || '').toUpperCase(); })[0]; if (!s) throw new Error(r.code ? 'bad code' : 'sign in'); return s; }
  function tch(r) { if (r.teacherKey !== 'test') throw new Error('teacher key'); }
  function forS(d, s) { var c = d.session; if (!c || (c.cls && c.cls !== s.cls)) return null; return { id: c.id, state: c.state, start: c.start || 0, pausedAt: c.pausedAt || 0, pausedMs: c.pausedMs || 0, len: LEN, focus: c.focus || '', focusAll: !!c.focusAll, endedAt: c.endedAt || 0, next: c.next || 0 }; }
  function liveLesson(d) { var L = d.live; if (!L) return null; return { lesson: L.lesson, at: L.at, ended: !!(L.counts && L.counts.zend && L.counts.zend[0] === 1) }; }
  function route(r) {
    var d = db(); d.rows = d.rows || {}; d.log = d.log || []; d.here = d.here || {}; d.accom = d.accom || {};
    var s, out;
    switch (r.op) {
      case 'load': s = auth(r); return { ok: true, student: pub(s), games: {}, sums: {} };
      case 'hello': s = auth(r); return { ok: true, student: pub(s) };
      case 'mine': s = auth(r); var mr = d.rows[s.sid]; if (mr) { mr = Object.assign({}, mr); delete mr.state; } return { ok: true, student: pub(s), games: [], climb: mr || null };
      case 'class': tch(r); return { ok: true, roster: ROSTER.map(pub), progress: [], events: [], climb: Object.keys(d.rows).map(function (k) { var o = Object.assign({}, d.rows[k]); delete o.state; return o; }) };
      case 'setLive': tch(r); d.live = r.live ? Object.assign({}, r.live, { at: Date.now() }) : null; put(d); return { ok: true, live: d.live };
      case 'live': return { ok: true, live: d.live || null, climb: d.session && d.session.state !== 'ended' ? { id: d.session.id, state: d.session.state, cls: d.session.cls, next: d.session.next || 0 } : null };
      case 'climbHello': s = auth(r); var row = d.rows[s.sid] || {}; return { ok: true, student: pub(s), state: row.state || null, ov: row.ov || null, session: forS(d, s), mult: d.accom[s.sid] || 1, now: Date.now() };
      case 'climbPing': s = auth(r); var st = r.status || {}; st.at = Date.now(); d.here[s.sid] = st; put(d); return { ok: true, now: Date.now(), session: forS(d, s), mult: d.accom[s.sid] || 1, lesson: liveLesson(d) };
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
        if (a === 'open') c = { id: 'S' + new Date().toISOString().slice(2, 16).replace(/[-:T]/g, ''), cls: r.cls || '', state: 'open', start: 0, pausedAt: 0, pausedMs: 0, focus: r.focus || '', focusAll: !!r.focusAll, next: +r.next || 0 };
        else if (a === 'next' && c) c.next = +r.next || 0;
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
      // lesson slideshows: answers are accepted and kept, so the console and the student page can be tried here
      case 'answer': s = auth(r); (d.answers = d.answers || []).push({ time: new Date().toISOString(), sid: s.sid, lesson: r.lesson, q: r.q, kind: r.kind, answer: String(r.answer), correct: r.correct === true ? 'yes' : r.correct === false ? 'no' : '' }); put(d); return { ok: true };
      case 'myAnswers': s = auth(r); var mya = {}; (d.answers || []).forEach(function (a) { if (a.sid === s.sid && a.lesson === r.lesson) mya[a.q] = { answer: a.answer, correct: a.correct }; }); return { ok: true, student: pub(s), answers: mya };
      case 'answers': tch(r); return { ok: true, roster: ROSTER.map(pub), answers: (d.answers || []).filter(function (a) { return a.lesson === r.lesson; }) };
      case 'roster': tch(r); return { ok: true, roster: ROSTER.map(function (x) { return { sid: x.sid, name: x.name, cls: x.cls, email: '', code: x.code }; }) };
      case 'studentDay':
        tch(r); s = ROSTER.filter(function (x) { return x.sid === r.sid; })[0]; if (!s) throw new Error('no such student');
        var dk = function (t) { var x = new Date(t); return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2); };
        var today = dk(Date.now()), day = r.date || today, days = {}, cnt = function (t, p) { var k = dk(t); (days[k] = days[k] || { climb: 0, lesson: 0, arcade: 0 })[p]++; };
        // sample lesson answers and game levels for the practice student, so the day view has something to show
        var t0 = new Date(); t0.setHours(9, 20, 0, 0);
        var at = function (min) { return new Date(t0.getTime() + min * 60000).toISOString(); };
        var lessons = s.sid === 's1' ? [{ time: at(0), sid: 's1', lesson: 'L5', q: 'here', kind: 'open', answer: 'joined', correct: '' }, { time: at(2), sid: 's1', lesson: 'L5', q: 'warm', kind: 'poll', answer: '1', correct: '' }, { time: at(9), sid: 's1', lesson: 'L5', q: 'zzz', kind: 'number', answer: '5', correct: 'yes' }] : [];
        var events = s.sid === 's1' ? [{ time: at(30), game: 'g5', type: 'level', detail: 'L1 core Stair ruler' }, { time: at(36), game: 'g5', type: 'level', detail: 'L2 core Read the points' }] : [];
        lessons.forEach(function (x) { if (x.q !== 'here') cnt(x.time, 'lesson'); }); events.forEach(function (x) { cnt(x.time, 'arcade'); });
        var climb = d.log.filter(function (x) { return x[1] === s.sid; }).map(function (x) { cnt(x[0], 'climb'); return { time: new Date(x[0]).toISOString(), sess: x[2], skill: x[3], tid: x[4], seed: x[5], mode: x[6], answer: x[7], result: x[8], tag: x[9], secs: x[10], flags: x[11] }; }).filter(function (x) { return dk(x.time) === day; });
        var cr = d.rows[s.sid]; if (cr) { cr = Object.assign({}, cr); delete cr.state; }
        return { ok: true, student: pub(s), date: day, today: today, days: days, climb: climb, climbRow: cr || null, lessons: lessons.filter(function (x) { return dk(x.time) === day; }), events: events.filter(function (x) { return dk(x.time) === day; }), games: [] };
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
