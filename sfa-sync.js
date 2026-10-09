/* Sandy Flats Arcade: results sync.
   Mirrors each game's progress to the class Google Sheet (via the Apps Script web app),
   pulls it back when a student signs in on another computer, and logs level/certificate events.
   Works offline: saves queue in this browser and send when the network is back.
   Config: window.SFA_CONFIG = { endpoint: 'https://script.google.com/macros/s/.../exec', auth: 'code'|'google'|'both', clientId: '...' } */
(function () {
  'use strict';
  var SFA = window.SFA; if (!SFA || SFA.sync) return;
  var CFG = window.SFA_CONFIG || {};
  // both values are needed for Google sign-in; with only one, stay off rather than half-work
  var S = SFA.sync = { on: !!CFG.endpoint && (CFG.auth !== 'google' || !!CFG.clientId), me: null, status: 'off', listeners: [] };
  var GAMEKEY = /^g[1-9][0-9]?$/;

  function emit() { S.listeners.forEach(function (f) { try { f(S); } catch (e) { } }); }
  S.onChange = function (f) { S.listeners.push(f); f(S); };
  function setStatus(st) { S.status = st; emit(); }

  /* ---------- auth state (kept in this browser only) ---------- */
  function cred() { return SFA.store.get('sync.cred', null); }
  function setCred(c) { if (c) SFA.store.set('sync.cred', c); else SFA.store.del('sync.cred'); }
  function authFields() { var c = cred(); if (!c) return null; return c.kind === 'google' ? { idToken: c.token } : { code: c.code }; }

  function call(op, body, keepalive) {
    var a = authFields(); if (!a) return Promise.reject(new Error('sign in'));
    var req = Object.assign({ op: op }, a, body || {});
    var opts = { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(req), redirect: 'follow' };
    if (keepalive && opts.body.length < 60000) opts.keepalive = true;
    return fetch(CFG.endpoint, opts)
      .then(function (r) { return r.text(); })
      .then(function (t) { try { return JSON.parse(t); } catch (e) { throw new Error('The results script didn\'t answer properly. Check it is deployed as a web app with access: Anyone.'); } })
      .then(function (j) { if (!j.ok) { var e = new Error(j.error || 'failed'); e.server = true; throw e; } return j; });
  }
  S.call = call;

  /* ---------- summaries (games call SFA.sync.report on every save) ---------- */
  // levels: [{id, tier}], P: progress object, st: {std, coreN, coreTotal, specials:[bool]}, certs: [{key,title}]
  S.summarize = function (levels, P, st, certs) {
    var done = P.done || {}, skipped = P.skipped || {};
    var specials = [];
    (certs || []).forEach(function (C, i) { if (C.key !== 'std' && st && st.specials && st.specials[C.key != null ? C.key : i]) specials.push(C.title); });
    return {
      levels: levels.map(function (L) { return { id: L.id, tier: L.tier, name: L.name, done: !!done[L.id], skipped: !!skipped[L.id] }; }),
      levelsDone: levels.filter(function (L) { return done[L.id]; }).length,
      levelsTotal: levels.length,
      coreDone: st ? st.coreN : 0, coreTotal: st ? st.coreTotal : 0,
      standard: !!(st && st.std), specials: specials,
      assisted: (P.hints ? (P.hints.r3 || 0) + (P.hints.r4 || 0) : 0),
      tickets: P.tickets || 0
    };
  };

  var pending = SFA.store.get('sync.pending', {});   // game -> {raw, summary, events}
  var last = SFA.store.get('sync.last', {});         // game -> {done:[ids], std, specials:[..]}
  var timer = null, inflight = false;

  S.report = function (game, P, summary) {
    if (!S.on || !GAMEKEY.test(game)) return;
    var prev = last[game] || { done: [], std: false, specials: [] }, ev = [];
    summary.levels.forEach(function (L) { if (L.done && prev.done.indexOf(L.id) < 0) ev.push({ type: 'level', detail: L.id + ' ' + L.tier + ' ' + (L.name || '') }); });
    // std/specials are null when seeded from an older server copy that didn't say: don't re-log what is already there
    if (summary.standard && prev.std === false) ev.push({ type: 'certificate', detail: 'standard' });
    if (prev.specials) summary.specials.forEach(function (t) { if (prev.specials.indexOf(t) < 0) ev.push({ type: 'certificate', detail: t }); });
    last[game] = { done: summary.levels.filter(function (L) { return L.done; }).map(function (L) { return L.id; }), std: summary.standard, specials: summary.specials.slice() };
    SFA.store.set('sync.last', last);
    // a fresh object every time, so a save already on its way can't swallow this one
    pending[game] = { raw: P, summary: summary, events: ((pending[game] || {}).events || []).concat(ev).slice(-20) };
    SFA.store.set('sync.pending', pending);
    // finished levels and certificates go quickly; everything else is batched
    schedule(ev.length ? 600 : 20000);
  };

  function schedule(ms) { clearTimeout(timer); timer = setTimeout(flush, ms); }
  function flush(unloading) {
    if (inflight) return;
    if (!cred() || !navigator.onLine) { setStatus(cred() ? 'offline' : 'signedout'); return; }
    var games = Object.keys(pending); if (!games.length) { setStatus('saved'); return; }
    var g = games[0], p = pending[g];
    inflight = true; setStatus('saving');
    call('save', { game: g, raw: p.raw, summary: p.summary, events: p.events }, unloading).then(function () {
      inflight = false;
      var cur = pending[g];
      if (cur === p) delete pending[g];
      else if (cur) cur.events = cur.events.filter(function (x) { return p.events.indexOf(x) < 0; });   // newer save waits; drop only what was sent
      SFA.store.set('sync.pending', pending);
      if (Object.keys(pending).length) schedule(cur && cur !== p ? 2000 : 300); else setStatus('saved');
    }, function (e) {
      inflight = false;
      if (e.server && /sign in|bad code|not on roster|school account/.test(e.message)) { setStatus('signedout'); return; }
      setStatus(/busy/.test(e.message) ? 'saving' : 'offline'); schedule(10000 + Math.random() * 15000);   // spread retries so a class doesn't retry together
    });
  }
  window.addEventListener('online', function () { schedule(500 + Math.random() * 3000); });
  window.addEventListener('pagehide', function () { if (Object.keys(pending).length) { clearTimeout(timer); flush(true); } });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && Object.keys(pending).length && !inflight) { clearTimeout(timer); flush(true); } });

  /* ---------- sign in / out ---------- */
  function hasLocal() { for (var i = 1; i <= 12; i++) { var P = SFA.store.get('g' + i, null); if (P && P.done && Object.keys(P.done).length) return true; } return false; }
  function adopt(student, games, sums) {
    var prevSid = SFA.store.get('sync.sid', null);
    var c = cred();
    if (prevSid && prevSid !== student.sid) { SFA.store.clearStudent(); setCred(c); pending = {}; last = {}; }
    else if (!prevSid && hasLocal() && !window.confirm('This computer already has arcade progress that isn\'t saved to anyone.\n\nIs it yours, ' + student.name + '?\n\nOK: add it to your results.  Cancel: start from your saved results.')) {
      SFA.store.clearStudent(); setCred(c); pending = {}; last = {};
    }
    SFA.store.set('sync.sid', student.sid);
    S.me = student;
    // server copy wins when it has at least as many finished levels as this browser
    Object.keys(games || {}).forEach(function (g) {
      if (!GAMEKEY.test(g)) return;
      var local = SFA.store.get(g, null), srv = games[g];
      var n = function (P) { return P && P.done ? Object.keys(P.done).length : -1; };
      if (n(srv) >= n(local)) SFA.store.set(g, srv);
      // remember what the server already has, so it isn't logged again as new
      var sm = sums && sums[g];
      last[g] = sm ? { done: sm.done || [], std: !!sm.std, specials: sm.specials || [] } : { done: Object.keys((srv && srv.done) || {}), std: null, specials: null };
    });
    SFA.store.set('sync.last', last);
    SFA.store.set('sync.me', student);
    emit();
  }

  S.signInCode = function (code) {
    setCred({ kind: 'code', code: String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '') });
    return call('load').then(function (j) { adopt(j.student, j.games, j.sums); schedule(200); return j.student; }, function (e) { setCred(null); throw e; });
  };
  S.signInGoogle = function (idToken) {
    setCred({ kind: 'google', token: idToken });
    return call('load').then(function (j) { adopt(j.student, j.games, j.sums); schedule(200); return j.student; }, function (e) { setCred(null); throw e; });
  };
  S.signOut = function () {
    if (Object.keys(pending).length && navigator.onLine) flush(true);
    try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) { }
    setCred(null); S.me = null; SFA.store.del('sync.me'); SFA.store.del('sync.sid');
    SFA.store.clearStudent(); pending = {}; last = {}; setStatus('signedout');
  };
  S.mine = function () { return call('mine'); };

  if (S.on) {
    S.me = SFA.store.get('sync.me', null);
    setStatus(cred() ? 'saved' : 'signedout');
    if (cred()) schedule(800);
  }
})();
