/* Show-Off: practice backend. Loaded only by showoff-u2.html?try, after climb/dev/mock.js.
   The Climb practice backend knows the pretend roster (codes AAAAAA, BBBBBB, CCCCCC; teacher key: test). This adds the
   podium's two calls and keeps shows in this browser, with the same checks as the real results script: the show is rebuilt
   from its seed and marked with showoffSim(), the week must be this week or either side of it, a seed posts once, one post
   per 10 s, and the board shows each player's best show with first names only and their look. Pretend classmates fill the
   board. SHOWOFF_MOCK.reset() empties it. */
(function () {
  'use strict';
  var EP = (window.SFA_CONFIG || {}).endpoint, K = 'showoffmock', inner = window.fetch;
  function db() { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } }
  function put(d) { localStorage.setItem(K, JSON.stringify(d)); }
  function ask(body) { return inner(EP, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.text(); }).then(JSON.parse); }
  function reply(o) { var t = JSON.stringify(o); return { ok: true, text: function () { return Promise.resolve(t); }, json: function () { return Promise.resolve(JSON.parse(t)); } }; }
  function fail(e) { return reply({ ok: false, error: e }); }
  function lookOf(x) { x = String(x || ''); return /^[0-9a-z]{1,80}$/.test(x) ? x : ''; }
  var BOTS = [
    { sid: 'x1', name: 'Rivera, Sam', cls: 'A', look: '412150030', miss: [3] },
    { sid: 'x2', name: 'Okafor, Ada', cls: 'B', look: '730320010', miss: [] },
    { sid: 'x3', name: 'Lee, Sam', cls: 'A', look: '151004020', miss: [2, 6] },
    { sid: 'x4', name: 'Haddad, Noor', cls: 'B', look: '5a3200510', miss: [4, 5, 8] },
    { sid: 'x5', name: 'Kowalski, Tom', cls: 'A', look: '263061040', miss: [1, 7] },
    { sid: 'x6', name: 'Ito, Yui', cls: 'B', look: '98408003', miss: [0, 3, 6, 9] }
  ];
  // pretend classmates' shows: real shows answered right except the looks they miss, so their scores are honest
  function bots(d, SO, sea) {
    d.runs = d.runs || []; d.bots = d.bots || {};
    if (d.bots[sea]) return;
    d.bots[sea] = 1;
    BOTS.forEach(function (B) {
      var seed = 'bot' + B.sid + sea.replace(/\W/g, '').toLowerCase(), show = SO.show(seed);
      var ans = show.map(function (L, i) { return B.miss.indexOf(i) >= 0 ? (L.k === 'pose' ? [99, 99] : -1) : L.k === 'pose' ? L.ex : L.ans; });
      d.runs.push({ sid: B.sid, season: sea, seed: seed, score: SO.mark(seed, ans).score, at: Date.now(), look: B.look });
    });
  }
  window.fetch = function (url, opts) {
    if (String(url) !== EP) return inner(url, opts);
    var r; try { r = JSON.parse(opts.body); } catch (e) { return inner(url, opts); }
    if (r.op !== 'showoffSave' && r.op !== 'showoffBoard') return inner(url, opts);
    var SO = window.showoffSim(), d = db();
    if (r.op === 'showoffSave') return ask({ op: 'hello', code: r.code }).then(function (j) {
      if (!j.ok) return reply(j);
      if (String(r.v) !== SO.V) return fail('old game: reload the page');
      var sea = String(r.season || '');
      if (SO.seasonsNow(new Date()).indexOf(sea) < 0) return fail('old week');
      var seed = String(r.seed || '');
      if (!/^[a-z0-9]{6,16}$/.test(seed)) return fail('bad show');
      if (!Array.isArray(r.answers) || r.answers.length !== SO.LOOKS) return fail('unfinished show');
      d.last = d.last || {}; d.runs = d.runs || [];
      if (d.last[j.student.sid] > Date.now() - 10000) return fail('slow down');
      if (d.runs.some(function (x) { return x.sid === j.student.sid && x.seed === seed; })) return fail('already posted');
      var m = SO.mark(seed, SO.clean(r.answers));
      d.runs.push({ sid: j.student.sid, season: sea, seed: seed, score: m.score, right: m.right, at: Date.now(), look: lookOf(r.look) });
      d.last[j.student.sid] = Date.now(); put(d);
      var b = board(d, sea, null), me = b.best[j.student.sid];
      return reply({ ok: true, score: m.score, right: m.right, best: me.score, rank: me.rank });
    });
    var sea = /^\d{4}-W\d{2}$/.test(String(r.season || '')) ? String(r.season) : SO.season(new Date());
    bots(d, SO, sea); put(d);
    return ask({ op: 'roster', teacherKey: 'test' }).then(function (j) {
      var people = (j.roster || []).concat(BOTS);
      var who = r.code ? ask({ op: 'hello', code: r.code }) : Promise.resolve({ ok: false });
      return who.then(function (h) { return reply(board(d, sea, people, h.ok ? h.student.sid : null)); });
    });
  };
  // the same shape the results script returns
  function board(d, sea, people, mySid) {
    var best = {};
    (d.runs || []).forEach(function (x) { if (x.season !== sea) return; var b = best[x.sid] || (best[x.sid] = { sid: x.sid, score: -1, runs: 0, look: '' }); b.runs++; if (x.score > b.score) b.score = x.score; if (x.look) b.look = x.look; });
    var list = Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return b.score - a.score; });
    list.forEach(function (b, i) { b.rank = i && b.score === list[i - 1].score ? list[i - 1].rank : i + 1; });
    if (!people) return { best: best };
    var by = {}; people.forEach(function (p) { by[p.sid] = p; });
    var top = list.slice(0, 25), firsts = {};
    function fn(p) { var n = String(p.name || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || '?'; }
    function li(p) { var n = String(p.name || ''); return n.indexOf(',') >= 0 ? n.split(',')[0].trim().charAt(0) : ''; }
    top.forEach(function (b) { var p = by[b.sid]; if (p) firsts[fn(p)] = (firsts[fn(p)] || 0) + 1; });
    var rows = top.map(function (b) { var p = by[b.sid] || { name: '?' }, n = fn(p); return { rank: b.rank, name: firsts[n] > 1 && li(p) ? n + ' ' + li(p) + '.' : n, cls: p.cls || '', score: b.score, runs: b.runs, look: b.look || '', me: b.sid === mySid }; });
    var me = mySid && best[mySid] ? { rank: best[mySid].rank, score: best[mySid].score } : null;
    return { ok: true, season: sea, rows: rows, players: list.length, me: me };
  }
  window.SHOWOFF_MOCK = { reset: function () { localStorage.removeItem(K); } };
})();
