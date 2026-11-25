/* Squeeze Street: practice backend. Loaded only by squeeze.html?try, after climb/dev/mock.js.
   The Climb practice backend knows the pretend roster (codes AAAAAA, BBBBBB, CCCCCC; teacher key: test). This adds the
   leaderboard's two calls and keeps runs in this browser, with the same checks as the real results script:
   the run is replayed from its choices with squeezeSim(), the week must be this week or either side of it, one post per 10 s,
   and the board shows each player's best run with first names only. A few pretend classmates' runs fill the board.
   SQUEEZE_MOCK.reset() empties it. */
(function () {
  'use strict';
  var EP = (window.SFA_CONFIG || {}).endpoint, K = 'squeezemock', inner = window.fetch;
  function db() { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } }
  function put(d) { localStorage.setItem(K, JSON.stringify(d)); }
  function ask(body) { return inner(EP, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.text(); }).then(JSON.parse); }
  function reply(o) { var t = JSON.stringify(o); return { ok: true, text: function () { return Promise.resolve(t); }, json: function () { return Promise.resolve(JSON.parse(t)); } }; }
  function fail(e) { return reply({ ok: false, error: e }); }
  var BOTS = [{ sid: 'x1', name: 'Rivera, Sam', cls: 'A', look: '412150030' }, { sid: 'x2', name: 'Okafor, Ada', cls: 'B', look: '730320010' }, { sid: 'x3', name: 'Lee, Sam', cls: 'A', look: '151004020' }];
  function lookOf(x) { x = String(x || ''); return /^[0-9a-z]{1,32}$/.test(x) ? x : ''; }
  // pretend classmates' runs: simple fixed plans played through the real rules, so their profits are honest
  function bots(d, SQ, sea) {
    d.runs = d.runs || []; d.bots = d.bots || {};
    if (d.bots[sea]) return;
    d.bots[sea] = 1;
    [[4, 3, 40, 60, -1], [5, 3, 50, 70, 0], [3, 4, 30, 50, 1]].forEach(function (x, i) {
      var plan = []; for (var k = 0; k < SQ.DAYS; k++) plan.push(x);
      d.runs.push({ sid: BOTS[i].sid, season: sea, profit: SQ.run(sea, plan).profit, at: Date.now(), look: BOTS[i].look });
    });
  }
  window.fetch = function (url, opts) {
    if (String(url) !== EP) return inner(url, opts);
    var r; try { r = JSON.parse(opts.body); } catch (e) { return inner(url, opts); }
    if (r.op !== 'squeezeSave' && r.op !== 'squeezeBoard') return inner(url, opts);
    var SQ = window.squeezeSim(), d = db();
    if (r.op === 'squeezeSave') return ask({ op: 'hello', code: r.code }).then(function (j) {
      if (!j.ok) return reply(j);
      if (String(r.v) !== SQ.V) return fail('old game: reload the page');
      if (SQ.seasonsNow(new Date()).indexOf(String(r.season)) < 0) return fail('old week');
      if (!Array.isArray(r.plan) || r.plan.length !== SQ.DAYS) return fail('unfinished run');
      d.last = d.last || {};
      if (d.last[j.student.sid] > Date.now() - 10000) return fail('slow down');
      var run = SQ.run(String(r.season), r.plan);
      d.runs = d.runs || []; d.runs.push({ sid: j.student.sid, season: run.season, profit: run.profit, at: Date.now(), plan: run.plan, look: lookOf(r.look) });
      d.last[j.student.sid] = Date.now(); put(d);
      var b = board(d, run.season, null), me = b.best[j.student.sid];
      return reply({ ok: true, profit: run.profit, best: me.profit, rank: me.rank });
    });
    // the board: no sign-in needed; a signed-in player also gets their own place
    var sea = /^\d{4}-W\d{2}$/.test(String(r.season || '')) ? String(r.season) : SQ.season(new Date());
    bots(d, SQ, sea); put(d);
    return ask({ op: 'roster', teacherKey: 'test' }).then(function (j) {
      var people = (j.roster || []).concat(BOTS);
      var who = r.code ? ask({ op: 'hello', code: r.code }) : Promise.resolve({ ok: false });
      return who.then(function (h) { return reply(board(d, sea, people, h.ok ? h.student.sid : null)); });
    });
  };
  // the same shape the results script returns: best run per player, ranked, first names (a last initial only to tell two apart)
  function board(d, sea, people, mySid) {
    var best = {};
    (d.runs || []).forEach(function (x) { if (x.season !== sea) return; var b = best[x.sid] || (best[x.sid] = { sid: x.sid, profit: -1e9, runs: 0 }); b.runs++; if (x.profit > b.profit) b.profit = x.profit; if (x.look) b.look = x.look; });
    var list = Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return b.profit - a.profit; });
    list.forEach(function (b, i) { b.rank = i && b.profit === list[i - 1].profit ? list[i - 1].rank : i + 1; });
    if (!people) return { best: best };
    var by = {}; people.forEach(function (p) { by[p.sid] = p; });
    var top = list.slice(0, 25), firsts = {};
    function fn(p) { var n = String(p.name || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || '?'; }
    function li(p) { var n = String(p.name || ''); return n.indexOf(',') >= 0 ? n.split(',')[0].trim().charAt(0) : ''; }
    top.forEach(function (b) { var p = by[b.sid]; if (p) firsts[fn(p)] = (firsts[fn(p)] || 0) + 1; });
    var rows = top.map(function (b) { var p = by[b.sid] || { name: '?' }, n = fn(p); return { rank: b.rank, name: firsts[n] > 1 && li(p) ? n + ' ' + li(p) + '.' : n, cls: p.cls || '', profit: b.profit, runs: b.runs, look: b.look || '', me: b.sid === mySid }; });
    var me = mySid && best[mySid] ? { rank: best[mySid].rank, profit: best[mySid].profit } : null;
    return { ok: true, season: sea, rows: rows, players: list.length, me: me };
  }
  window.SQUEEZE_MOCK = { reset: function () { localStorage.removeItem(K); }, db: db };
})();
