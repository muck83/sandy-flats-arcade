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
  function ask0(body) { return inner(EP, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.text(); }).then(JSON.parse); }
  var ask = ask0;
  function reply(o) { var t = JSON.stringify(o); return { ok: true, text: function () { return Promise.resolve(t); }, json: function () { return Promise.resolve(JSON.parse(t)); } }; }
  function levels(m) { return (m.levels || []).slice(0, 40).map(function (L) { return String(L.id).replace(/[^A-Za-z0-9]/g, '').slice(0, 8) + '.' + String(L.tier || '').replace(/[^a-z]/g, '').slice(0, 8) + ':' + (L.done ? 'Y' : L.skipped ? 'S' : '-'); }).join(' '); }
  function num(x) { x = Number(x); return isFinite(x) ? Math.max(0, Math.min(9999, Math.round(x))) : 0; }
  window.fetch = function (url, opts) {
    if (String(url) !== EP) return inner(url, opts);
    var r; try { r = JSON.parse(opts.body); } catch (e) { return inner(url, opts); }
    if (window.CU2_MOCK_OFFLINE) return Promise.reject(new TypeError('offline (practice)'));
    // the open/closed switches with their sessions, one per teacher (practice teacher "test", co-teacher "co"), like the real script
    if (r.op === 'checkState' || r.op === 'checkGate' || r.op === 'checkMore') {
      var dg = db(), now = Date.now();
      if (r.teacherKey && r.teacherKey !== 'test' && r.teacherKey !== 'co') return Promise.resolve(reply({ ok: false, error: 'teacher key' }));
      var mainT = r.teacherKey === 'test', live = function (g) { return g && g.until > now ? g : null; };
      var pub = function (g) { g = live(g); return g ? { open: true, until: g.until, session: { code: g.code, check: g.check, len: g.len, top: g.top, at: g.at } } : { open: false, until: 0, session: null }; };
      dg.log = dg.log || []; dg.more = dg.more || {};
      if (r.op === 'checkMore') { var mm = dg.more[r.sid] || { n: 0 }; dg.more[r.sid] = { n: mm.n + 1, at: now }; put(dg); return Promise.resolve(reply({ ok: true, sid: r.sid, more: dg.more[r.sid].n })); }
      if (r.op === 'checkGate') {
        var co = !mainT || !!r.co, k = co ? 'gateCo' : 'gate', cur = live(dg[k]);
        if (cur) dg.log.forEach(function (x) { if (x.code === cur.code && !x.closed) x.closed = now; });
        if (r.open && !(mainT && r.co)) {
          var A = 'BCDFGHJKLMNPQRSTVWXZ', c = ''; for (var i = 0; i < 5; i++) c += A.charAt(Math.floor(Math.random() * 20));
          dg[k] = { until: now + 6 * 36e5, check: +r.check || 0, len: +r.len || 0, top: +r.top ? 1 : 0, code: c, at: now };
          dg.log.push({ who: co ? 'co' : 'main', code: c, check: dg[k].check, len: dg[k].len, top: dg[k].top, at: now, until: dg[k].until });
        } else dg[k] = null;
        dg.log = dg.log.slice(-40); put(dg);
      }
      var moreOf = function (sid) { var m = dg.more[sid]; return m && m.at > now - 12 * 36e5 ? m.n : 0; };
      if (r.teacherKey) {
        var o = pub(mainT ? dg.gate : dg.gateCo); o.ok = true; if (mainT) o.co = pub(dg.gateCo);
        o.log = dg.log.filter(function (x) { return mainT || x.who === 'co'; }); o.more = {}; Object.keys(dg.more).forEach(function (s) { if (moreOf(s)) o.more[s] = moreOf(s); });
        return Promise.resolve(reply(o));
      }
      // a student: their own teacher's switch (the practice roster codes are main-teacher students; ones added on the co-teacher page may be hers)
      var dcs = dg.co || { classes: [], students: [] }, me = dcs.students.filter(function (x) { return x.code === String(r.code || '').toUpperCase(); })[0];
      var sid0 = me ? me.sid : ({ AAAAAA: 's1', BBBBBB: 's2', CCCCCC: 's3' })[String(r.code || '').toUpperCase()];
      var so = pub(me && dcs.classes.indexOf(me.cls) >= 0 ? dg.gateCo : dg.gate); so.ok = true; so.now = now; so.more = moreOf(sid0);
      return Promise.resolve(reply(so));
    }
    // co-teacher practice: key "co" (or the teacher key "test"); her classes start empty; added students live in this browser
    var CO = /^(coWho|coRoster|coAdd|coClass|coExtra|checkAnswers)$/.test(r.op);
    if (CO) {
      var dc = db(), main = r.teacherKey === 'test'; dc.co = dc.co || { classes: [], students: [] };
      if (!main && r.teacherKey !== 'co') return Promise.resolve(reply({ ok: false, error: 'teacher key' }));
      return ask({ op: 'roster', teacherKey: 'test' }).then(function (j) {
        var base = (j.roster || []).map(function (x) { return { sid: x.sid, name: x.name, cls: x.cls, code: x.code }; }), all = base.concat(dc.co.students);
        dc.co.extra = dc.co.extra || {}; all.forEach(function (x) { if (dc.co.extra[x.sid]) x.extra = dc.co.extra[x.sid]; });
        var sees = function (c) { return main || dc.co.classes.indexOf(c) >= 0; };
        if (r.op === 'coExtra') { var tgt = all.filter(function (x) { return x.sid === r.sid; })[0], xv = Number(r.extra) || 0; if (!tgt || !sees(tgt.cls)) return reply({ ok: false, error: 'no such student' }); if ([0, 25, 50, 100].indexOf(xv) < 0) return reply({ ok: false, error: 'bad extra time' }); if (xv) dc.co.extra[r.sid] = xv; else delete dc.co.extra[r.sid]; put(dc); return reply({ ok: true, sid: r.sid, extra: xv }); }
        if (r.op === 'coWho') return reply({ ok: true, main: main, classes: dc.co.classes, authMode: 'code', coKey: main ? 'co' : undefined, allClasses: main ? all.map(function (x) { return x.cls; }).filter(function (c, i, a) { return a.indexOf(c) === i; }) : undefined });
        if (r.op === 'coRoster') return reply({ ok: true, main: main, classes: dc.co.classes, authMode: 'code', roster: all.filter(function (x) { return sees(x.cls); }) });
        if (r.op === 'coAdd') {
          var taken = {}, used = {}, out = [], A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
          all.forEach(function (x) { taken[x.cls] = 1; used[x.code] = 1; });
          var list = (r.students || []).slice(0, 60);
          for (var i = 0; i < list.length; i++) {
            var nm = String(list[i].name || '').replace(/\s+/g, ' ').trim().slice(0, 60), cl = String(list[i].cls || '').trim();
            if (!nm) continue;
            if (!/^[A-Za-z0-9][A-Za-z0-9 ._-]{0,19}$/.test(cl)) return reply({ ok: false, error: 'bad class name: ' + cl });
            if (!main && dc.co.classes.indexOf(cl) < 0) { if (taken[cl]) return reply({ ok: false, error: 'class ' + cl + ' belongs to another teacher' }); dc.co.classes.push(cl); }
            var c; do { c = ''; for (var k = 0; k < 6; k++) c += A.charAt(Math.floor(Math.random() * A.length)); } while (used[c]); used[c] = 1;
            var st = { sid: 'c' + Date.now().toString(36) + i, name: nm, cls: cl, code: c }; dc.co.students.push(st); out.push(st);
          }
          if (!out.length) return reply({ ok: false, error: 'no students' });
          put(dc); return reply({ ok: true, added: out, classes: dc.co.classes });
        }
        var mineR = all.filter(function (x) { return sees(x.cls); }), ids = {}; mineR.forEach(function (x) { ids[x.sid] = 1; });
        if (r.op === 'checkAnswers') return reply({ ok: true, rows: Object.keys(dc.rows || {}).map(function (k) { return dc.rows[k]; }).filter(function (o) { return ids[o.sid] && (r.games || []).indexOf(o.game) >= 0; }).map(function (o) {
          var a = null; try { a = JSON.parse(o.raw).att; } catch (e) { } return a && a.log ? { sid: o.sid, game: o.game, seed: a.seed, t0: a.t0, x: a.log.map(function (e) { return e && e.x !== undefined ? e.x : null; }) } : null;
        }).filter(Boolean) });
        return reply({ ok: true, roster: mineR.map(function (x) { return { sid: x.sid, name: x.name, cls: x.cls, extra: x.extra }; }), events: [], climb: [],
          progress: Object.keys(dc.rows || {}).map(function (k) { var o = Object.assign({}, dc.rows[k]); delete o.raw; return o; }).filter(function (o) { return ids[o.sid] && /^g(9[1-8]|8[7-9])$/.test(o.game); }) });
      });
    }
    // a student added on the co-teacher page signs in here (the Climb practice backend doesn't know them)
    var dco = db().co || { students: [], extra: {} }, added = r.code && (String(r.code).toUpperCase() === 'DEMO00' ? { sid: 'demo', name: 'Teacher, Demo', cls: 'Demo' } : dco.students.filter(function (x) { return x.code === String(r.code).toUpperCase(); })[0]);
    if (added) {
      var pubA = { sid: added.sid, name: added.name, cls: added.cls }; if ((dco.extra || {})[added.sid]) pubA.extra = dco.extra[added.sid];
      ask = function (b) { return Promise.resolve(b.op === 'load' ? { ok: true, student: pubA, games: {}, sums: {} } : { ok: true, student: pubA }); };
      if (r.op === 'hello') return Promise.resolve(reply({ ok: true, student: pubA }));
    } else ask = ask0;
    // extra time set on the dashboard reaches a signed-in practice student, like publicStudent on the real script
    if (r.op === 'hello' && !added) return ask(r).then(function (j) { var xt = (db().co || {}).extra || {}; if (j.ok && j.student && xt[j.student.sid]) j.student.extra = xt[j.student.sid]; return reply(j); });
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
      var d = db(), xt = (d.co && d.co.extra) || {}; (j.roster || []).forEach(function (x) { if (xt[x.sid]) x.extra = xt[x.sid]; });
      j.progress = (j.progress || []).concat(Object.keys(d.rows || {}).map(function (k) { var o = Object.assign({}, d.rows[k]); delete o.raw; return o; }));
      return reply(j);
    });
    return inner(url, opts);
  };
  window.CHECK_MOCK = { reset: function () { localStorage.removeItem(K); }, db: db };
})();
