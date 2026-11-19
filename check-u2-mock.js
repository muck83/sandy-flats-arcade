/* Unit 2 Check: practice backend. Loaded only by check-u2.html?try and check-u2-teacher.html?try, after climb/dev/mock.js.
   The Climb practice backend knows the pretend roster (codes AAAAAA, BBBBBB, CCCCCC; teacher key: test) but does not
   keep game saves, so this adds the three calls the check needs (save, load, class) and keeps them in this browser.
   It behaves like the real results script: the class view returns each save's summary columns, not the raw state. */
(function () {
  'use strict';
  var EP = (window.SFA_CONFIG || {}).endpoint, K = 'checkmock', inner = window.fetch;
  window.CLIMB_ROOT = '';
  function db() { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } }
  function put(d) { localStorage.setItem(K, JSON.stringify(d)); }
  function ask(body) { return inner(EP, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.text(); }).then(JSON.parse); }
  function reply(o) { var t = JSON.stringify(o); return { ok: true, text: function () { return Promise.resolve(t); }, json: function () { return Promise.resolve(JSON.parse(t)); } }; }
  function levels(m) { return (m.levels || []).slice(0, 40).map(function (L) { return String(L.id).replace(/[^A-Za-z0-9]/g, '').slice(0, 8) + '.' + String(L.tier || '').replace(/[^a-z]/g, '').slice(0, 8) + ':' + (L.done ? 'Y' : L.skipped ? 'S' : '-'); }).join(' '); }
  function num(x) { x = Number(x); return isFinite(x) ? Math.max(0, Math.min(9999, Math.round(x))) : 0; }
  window.fetch = function (url, opts) {
    if (String(url) !== EP) return inner(url, opts);
    var r; try { r = JSON.parse(opts.body); } catch (e) { return inner(url, opts); }
    if (window.CU2_MOCK_OFFLINE) return Promise.reject(new TypeError('offline (practice)'));
    if (r.op === 'save') return ask({ op: 'hello', code: r.code }).then(function (j) {
      if (!j.ok) return reply(j);
      if (!/^g[1-9][0-9]?$/.test(String(r.game))) return reply({ ok: false, error: 'bad game' });
      var raw = JSON.stringify(r.raw || {}); if (raw.length > 40000) return reply({ ok: false, error: 'too big' });
      var d = db(), m = r.summary || {}; d.rows = d.rows || {};
      d.rows[j.student.sid + '|' + r.game] = { sid: j.student.sid, game: r.game, updated: new Date().toISOString(), levelsDone: num(m.levelsDone), levelsTotal: num(m.levelsTotal), coreDone: num(m.coreDone), coreTotal: num(m.coreTotal), standard: !!m.standard, specials: (m.specials || []).slice(0, 12), assisted: num(m.assisted), tickets: num(m.tickets), levels: levels(m), raw: raw };
      put(d); return reply({ ok: true });
    });
    if (r.op === 'load') return ask(r).then(function (j) {
      if (!j.ok) return reply(j);
      var d = db(); j.games = j.games || {}; j.sums = j.sums || {};
      Object.keys(d.rows || {}).forEach(function (k) { var row = d.rows[k]; if (row.sid !== j.student.sid) return; try { j.games[row.game] = JSON.parse(row.raw); } catch (e) { } j.sums[row.game] = { done: [], std: false, specials: [] }; });
      return reply(j);
    });
    if (r.op === 'class') return ask(r).then(function (j) {
      if (!j.ok) return reply(j);
      var d = db(); j.progress = (j.progress || []).concat(Object.keys(d.rows || {}).map(function (k) { var o = Object.assign({}, d.rows[k]); delete o.raw; return o; }));
      return reply(j);
    });
    return inner(url, opts);
  };
  window.CHECK_MOCK = { reset: function () { localStorage.removeItem(K); }, db: db };
})();
