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
    // the open/closed switches, one per teacher: open unless that teacher closed it (practice teacher "test", co-teacher "co")
    if (r.op === 'checkState' || r.op === 'checkGate') {
      var dg = db(), eod = new Date(); eod.setHours(23, 59, 0, 0);
      var gst = function (g) { return { open: g !== -1, until: g !== -1 ? eod.getTime() : 0 }; };
      if (r.teacherKey && r.teacherKey !== 'test' && r.teacherKey !== 'co') return Promise.resolve(reply({ ok: false, error: 'teacher key' }));
      var mainT = r.teacherKey === 'test';
      if (r.op === 'checkGate') { if (mainT && !r.co) dg.gate = r.open ? 1 : -1; else dg.gateCo = r.open ? 1 : -1; put(dg); }
      if (r.teacherKey) { var o = gst(mainT ? dg.gate : dg.gateCo); o.ok = true; if (mainT) o.co = gst(dg.gateCo); return Promise.resolve(reply(o)); }
      var dcs = dg.co || { classes: [], students: [] }, me = dcs.students.filter(function (x) { return x.code === String(r.code || '').toUpperCase(); })[0];
      var so = gst(me && dcs.classes.indexOf(me.cls) >= 0 ? dg.gateCo : dg.gate); so.ok = true;
      return Promise.resolve(reply(so));
    }
    // co-teacher practice: key "co" (or the teacher key "test"); her classes start empty; added students live in this browser
    var CO = /^(coWho|coRoster|coAdd|coClass|coExtra)$/.test(r.op);
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
        return reply({ ok: true, roster: mineR.map(function (x) { return { sid: x.sid, name: x.name, cls: x.cls, extra: x.extra }; }), events: [], climb: [],
          progress: Object.keys(dc.rows || {}).map(function (k) { var o = Object.assign({}, dc.rows[k]); delete o.raw; return o; }).filter(function (o) { return ids[o.sid] && /^g9[1-4]$/.test(o.game); }) });
      });
    }
    // a student added on the co-teacher page signs in here (the Climb practice backend doesn't know them)
    var dco = db().co || { students: [], extra: {} }, added = r.code && (String(r.code).toUpperCase() === 'DEMO00' ? { sid: 'demo', name: 'Teacher, Demo', cls: 'Demo' } : dco.students.filter(function (x) { return x.code === String(r.code).toUpperCase(); })[0]);
    if (added) {
      var pubA = { sid: added.sid, name: added.name, cls: added.cls }; if ((dco.extra || {})[added.sid]) pubA.extra = dco.extra[added.sid];
      ask = function (b) { return Promise.resolve(b.op === 'load' ? { ok: true, student: pubA, games: {}, sums: {} } : { ok: true, student: pubA }); };
      if (r.op === 'hello') return Promise.resolve(reply({ ok: true, student: pubA }));
    } else ask = ask0;
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
