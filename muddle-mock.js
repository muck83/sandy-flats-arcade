/* Muddle Under the Pond: practice backend. Loaded only when the page has ?try (muddle-host.html?try, muddle.html?try).
   A pretend results script kept in this browser's localStorage, with the same two operations and the same checks as
   roomHost / roomPing in backend/Code.gs, so the host page and several player tabs in one browser can play a whole game
   without the Google Sheet. Teacher key: test. Every key expires after 3 hours like the script cache.
   MUDDLE_MOCK.reset() empties it; localStorage 'mudmock.lag' sets how slow the pretend script answers (ms, default 250). */
(function () {
  'use strict';
  var EP = 'https://mock.invalid/muddle', NS = 'mudmock.', TTL = 10800 * 1000, MAX = 40;
  window.SFA_CONFIG = Object.assign({}, window.SFA_CONFIG || {}, { endpoint: EP });
  var CODE = /^[A-Z]{4}$/, PID = /^[a-z0-9]{6,12}$/, TOK = /^[a-z0-9]{12,32}$/;
  var LAG = +localStorage.getItem('mudmock.lag') || 250;
  function get(k) { try { var o = JSON.parse(localStorage.getItem(NS + k) || 'null'); if (!o || o.until < Date.now()) return null; return o.v; } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(NS + k, JSON.stringify({ v: v, until: Date.now() + TTL })); } catch (e) { } }
  function del(k) { localStorage.removeItem(NS + k); }
  function nick(x) { return String(x == null ? '' : x).replace(/[^A-Za-z0-9 ._-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14); }
  function list(code) { var l = get('rl_' + code); return Array.isArray(l) ? l : []; }

  function route(r) {
    var code = String(r.code || '').toUpperCase();
    if (r.op === 'roomHost') {
      if (r.teacherKey !== 'test') throw new Error('teacher key');
      if (!CODE.test(code)) throw new Error('bad room');
      var own = String(r.owner || '').replace(/[^a-z0-9]/gi, '').slice(0, 40), cur = get('ro_' + code);
      if (!own) throw new Error('bad owner');
      if (cur && cur !== own && !r.claim) return { ok: false, error: 'taken' };
      var l = list(code);
      if (r.end) { ['rm_', 'rl_', 'ro_'].forEach(function (p) { del(p + code); }); l.forEach(function (p) { del('rp_' + code + '_' + p); del('rq_' + code + '_' + p); }); return { ok: true }; }
      if (!r.pub || typeof r.pub !== 'object') throw new Error('bad board');
      var bj = { at: Date.now(), b: r.pub };
      if (JSON.stringify(bj).length > 60000) throw new Error('too big');
      put('rm_' + code, bj); put('ro_' + code, own);
      var priv = r.priv || {};
      Object.keys(priv).slice(0, MAX * 2).forEach(function (pid) { if (PID.test(pid) && l.indexOf(pid) >= 0 && JSON.stringify(priv[pid]).length <= 8000) put('rq_' + code + '_' + pid, priv[pid]); });
      var players = {};
      l.forEach(function (p) { var o = get('rp_' + code + '_' + p); if (o) players[p] = { n: o.n, k: o.k, a: o.a, at: o.at }; });
      return { ok: true, now: Date.now(), players: players };
    }
    if (r.op === 'roomPing') {
      if (!CODE.test(code)) throw new Error('bad room');
      var pid = String(r.pid || ''), tok = String(r.tok || '');
      if (!PID.test(pid) || !TOK.test(tok)) throw new Error('bad player');
      var room = get('rm_' + code); if (!room) return { ok: false, error: 'no room' };
      var old = get('rp_' + code + '_' + pid);
      if (old && old.tok !== tok) return { ok: false, error: 'bad player' };
      var n = nick(r.nick); if (!n) throw new Error('nickname');
      var me = { n: n, k: Math.max(0, Math.min(99, Math.round(Number(r.look) || 0))), tok: tok, a: Array.isArray(r.acts) ? r.acts.slice(-30) : [], at: Date.now() };
      if (JSON.stringify(me).length > 5000) throw new Error('too big');
      if (!old) { var li = list(code); if (li.indexOf(pid) < 0) { if (li.length >= MAX) return { ok: false, error: 'full' }; li.push(pid); put('rl_' + code, li); } }
      put('rp_' + code + '_' + pid, me);
      return { ok: true, now: Date.now(), at: room.at, board: room.b, me: get('rq_' + code + '_' + pid) };
    }
    throw new Error('unknown op');
  }
  var inner = window.fetch;
  window.fetch = function (url, opts) {
    if (String(url) !== EP) return inner.apply(this, arguments);
    var out; try { out = route(JSON.parse(opts.body)); } catch (e) { out = { ok: false, error: String(e && e.message || e) }; }
    var t = JSON.stringify(out);
    return new Promise(function (res) { setTimeout(function () { res({ ok: true, text: function () { return Promise.resolve(t); }, json: function () { return Promise.resolve(JSON.parse(t)); } }); }, LAG * (0.6 + Math.random() * 0.8)); });
  };
  window.MUDDLE_MOCK = { reset: function () { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(NS) === 0) localStorage.removeItem(k); }); } };
})();
