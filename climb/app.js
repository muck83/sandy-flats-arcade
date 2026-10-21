/* Climb: the student page. Signs in with the arcade's student code, waits for the teacher's Start,
   runs the 12-minute session (90-second items, the teaching loop after a miss, the leave-the-page swap),
   and saves every answer and the student's skill map to the class Google Sheet. */
(function () {
  'use strict';
  var SFA = window.SFA, S = SFA.sync, C = window.CLIMB, E = C.engine, app = document.getElementById('app'), esc = SFA.esc;
  var CFG = window.SFA_CONFIG || {};
  var st = null, sess = null, off = 0, mult = 1, helloFor = '', view = '', paused = false;
  var it = null, meta = null, loop = null, guided = null, last = { skill: '' }, after = null, screenEnd = 0;
  var q = SFA.store.get('climb.q', []), inflight = false, saveTimer = null, pingTimer = null;
  var lastAct = Date.now();

  function now() { return Date.now() + off; }
  function T() { return st && st.today; }
  function mmss(ms) { if (!isFinite(ms)) return '—'; var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function first(n) { n = String(n || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || n; }
  function skName(id) { return C.label(id) + ' · ' + C.SKILL[id].name; }
  function sEnd() { return sess.start + (sess.pausedMs || 0) + sess.len * mult; }
  function sessLeft() { if (!sess || !sess.start) return sess ? sess.len * mult : 0; if (sess.state === 'ended') return 0; return sEnd() - (sess.state === 'paused' ? sess.pausedAt : now()); }
  function live() { return sess && (sess.state === 'running' || sess.state === 'paused') && sess.start && now() >= sess.start; }

  /* ---------- local state ---------- */
  function keep() { if (S.me) SFA.store.set('climb.st', { sid: S.me.sid, st: st }); }
  function loadLocal() { var L = SFA.store.get('climb.st', null); return L && S.me && L.sid === S.me.sid ? L.st : null; }

  /* ---------- saving: the skill map and every answer, queued in this browser until the Sheet has them ---------- */
  function logRow(r) { q.push(r); SFA.store.set('climb.q', q); keep(); saveSoon(1500); }
  function saveSoon(ms) { clearTimeout(saveTimer); saveTimer = setTimeout(flush, ms); }
  function flush(unloading) {
    if (inflight || !S.me || !st) return;
    if (!navigator.onLine) { saveSoon(8000); return; }
    var batch = q.slice(0, 40); inflight = true;
    S.call('climbSave', { state: st, summary: E.summary(st), log: batch }, unloading).then(function () {
      inflight = false; q = q.slice(batch.length); SFA.store.set('climb.q', q);
      if (q.length) saveSoon(400);
    }, function (e) {
      inflight = false;
      if (e.server && /too big/.test(e.message)) { st.hist = st.hist.slice(-10); C.SKILLS.forEach(function (s) { st.skills[s.id].hist = st.skills[s.id].hist.slice(-4); }); if (T()) T().flags = T().flags.slice(-10); saveSoon(500); return; }
      if (e.server && /unknown op/.test(e.message)) { SFA.toast('Climb can\'t save yet: Mr. Crowell needs to update the results script. Your work is kept on this computer.', 6000); saveSoon(60000); return; }
      if (e.server && /sign in|bad code|not on roster/.test(e.message)) return;
      saveSoon(8000 + Math.random() * 12000);
    });
  }
  window.addEventListener('pagehide', function () { if (q.length) flush(true); });

  /* ---------- talking to the teacher's session ---------- */
  function hello() {
    if (!S.me || helloFor === S.me.sid) return;
    helloFor = S.me.sid;
    var t0 = Date.now();
    S.call('climbHello').then(function (j) {
      off = j.now + (Date.now() - t0) / 2 - Date.now();
      var local = loadLocal(), srv = j.state && j.state.v === 1 ? j.state : null;
      // this browser's copy wins only when it has answers the Sheet doesn't have yet
      st = E.norm(local && (!srv || local.nScored > srv.nScored) ? local : srv);
      if (E.applyOverrides(st, j.ov)) saveSoon(1000);
      mult = j.mult || 1; setSession(j.session); keep(); route(); ping();
    }, function (e) {
      helloFor = '';
      if (e.server && /unknown op/.test(e.message)) return msg('Climb isn\'t switched on yet', 'Mr. Crowell needs to update the results script first. Tell him you saw this message.');
      if (e.server) return;   // the sign-in card already says what's wrong
      msg('Can\'t reach Mr. Crowell\'s results sheet', 'Check your internet connection. This page keeps trying.');
      setTimeout(hello, 8000);
    });
  }
  function status() {
    var t = T() || {}, fl = [];
    if ((t.leaves || 0) >= C.P.leavesNoSecure) fl.push('red'); else if (t.awayLong) fl.push('amber');
    (t.flags || []).forEach(function (f) { if (f.k === 'check') fl.push('check' + f.skill); if (f.k === 'stuck') fl.push('stuck' + f.skill + (f.tag ? '.' + f.tag : '')); });
    return { ph: paused ? 'paused' : view, sk: it ? it.skill : (st ? E.frontier(st) || '' : ''), n: t.scored || 0, lv: t.leaves || 0, aw: t.away || 0, th: st ? st.theta : 0, fl: fl.slice(-6).join(','), sess: t.id || '', ok: t.right || 0, al: t.almost || 0, to: t.timeouts || 0 };
  }
  function ping() {
    clearTimeout(pingTimer);
    if (!S.me || document.visibilityState === 'hidden') { pingTimer = setTimeout(ping, 5000); return; }
    var t0 = Date.now();
    S.call('climbPing', { status: status() }).then(function (j) {
      off = j.now + (Date.now() - t0) / 2 - Date.now(); mult = j.mult || 1; liveL = j.lesson || null; setSession(j.session);
      handReply(j.hand);
      handoff();
      pingTimer = setTimeout(ping, hand ? 4000 : live() ? 8000 : 4000);
    }, function () { pingTimer = setTimeout(ping, 10000); });
  }
  function setSession(s) {
    var was = sess; sess = s;
    var p = !!(s && s.state === 'paused');
    if (p && !paused) { paused = true; pausedLocal = now(); showPause(); }
    else if (!p && paused) { paused = false; var gap = now() - pausedLocal; if (meta) meta.deadline += gap; if (screenEnd) screenEnd += gap; hidePause(); }
    if (!was || !s || was.id !== s.id || was.state !== s.state || was.focus !== s.focus) route();
  }
  var pausedLocal = 0;

  /* ---------- after Climb: straight into the lesson, no link to click ---------- */
  // The teacher picks "Then: Lesson N" for the session. A student whose 12 minutes are up waits on their summary;
  // the moment the teacher goes live on that lesson, every waiting page moves into it (signed in, following the teacher).
  var liveL = null, nextInfo = null, going = false, ROOT = window.CLIMB_ROOT || '';
  function nextLesson() { return sess && sess.next ? sess.next : 0; }
  function lessonLive(n) { return !!(n && liveL && liveL.lesson === 'L' + n && !liveL.ended && Math.abs(now() - liveL.at) < 10 * 60000); }
  function handoff() {
    var n = nextLesson(), t = T();
    var finished = view === 'done' || (view === 'wait' && sess && sess.state === 'ended');
    if (!finished || going || !lessonLive(n)) return;
    // a student still inside their own (extended) time keeps working: only a finished one moves on
    if (t && t.id === sess.id && !t.closed) return;
    going = true;
    // a student who has only just reached their summary gets a few seconds to see it
    var wait = Math.max(3000, 10000 - (Date.now() - (doneAt || 0))), until = Date.now() + wait;
    var box = document.getElementById('nextBox');
    var tickGo = setInterval(function () {
      var s = Math.max(0, Math.ceil((until - Date.now()) / 1000)), msg = 'Mr. Crowell is starting the lesson. Opening it in ' + s + '…';
      if (box && box.isConnected) box.innerHTML = '<b style="font-size:22px">' + msg + '</b>';
      if (s <= 0) { clearInterval(tickGo); location.href = ROOT + 'lesson.html?l=' + n; }
    }, 250);
    if (!box) SFA.toast('Mr. Crowell is starting the lesson. Taking you there…', wait);
  }
  // the lesson's title and film number for the "Next" card
  function loadNext(n, cb) {
    if (nextInfo && nextInfo.n === n) return cb(nextInfo);
    var prev = window.SFA_LESSON;
    window.SFA_LESSON = function (L) { nextInfo = { n: n, title: L.title, film: (window.SFA_LESSON_NUM || {})[n] || L.n }; window.SFA_LESSON = prev; cb(nextInfo); };
    var s = document.createElement('script'); s.src = ROOT + 'lessons/L' + n + '.js'; s.onerror = function () { window.SFA_LESSON = prev; }; document.head.appendChild(s);
  }
  function nextCard() {
    var n = nextLesson(); if (!n) return '';
    var href = ROOT + 'lesson.html?l=' + n;
    setTimeout(function () { loadNext(n, function (I) { var h = document.getElementById('nextTitle'); if (h) h.textContent = 'Next: Lesson ' + I.film + ' · ' + I.title; }); }, 0);
    return '<section class="card" id="nextBox" style="flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 20px;border:2px solid var(--blue)"><div style="display:flex;flex-direction:column;gap:4px"><b id="nextTitle" style="font:800 24px var(--disp)">Next: the lesson</b><span class="sub">It opens by itself when Mr. Crowell starts it. Stay on this page.</span></div><a class="btn" href="' + href + '">Open it now</a></section>';
  }

  /* ---------- screens ---------- */
  function msg(h, p, extra) { view = 'msg'; it = null; app.innerHTML = '<section class="card center"><h1 class="h2">' + esc(h) + '</h1><p class="sub" style="margin:0">' + esc(p) + '</p>' + (extra || '') + '</section>'; }
  function route() {
    if (!S.on) return msg('Climb needs the class results sheet', 'Saving isn\'t switched on for this copy of the arcade.');
    if (!S.me) { view = 'signin'; app.innerHTML = '<section class="card center"><h1 class="h2">Sign in to climb</h1><p class="sub" style="margin:0">Use the student code from your school email (the box above). Your skill map follows you to any computer.</p></section>'; return; }
    if (!st) { app.innerHTML = '<p class="muted">Loading your skill map…</p>'; return; }
    var t = T();
    if (!sess) { if (t && t.closed && view === 'done') return; return waiting(false); }
    if (sess.state === 'ended') { if (t && t.id === sess.id) { finish(); return; } return waiting(false); }
    if (sess.state === 'open' || !sess.start || now() < sess.start) return waiting(true);
    // running (or paused): join, or carry on after a reload
    if (t && t.id === sess.id && t.closed) return done();
    if (view === 'item' || view === 'explain' || view === 'guided' || view === 'right' || view === 'changed' || view === 'quizdone') return;
    if (quizDue()) return quizStart();
    begin();
  }
  function rungs() {
    var fr = E.frontier(st);
    return '<div class="rungs" aria-label="Your ladder">' + C.SKILLS.map(function (s) { var c = E.isSecure(st, s.id) ? '#1D4ED8' : s.id === fr ? '#F97316' : '#DCE2EE'; return '<i style="background:' + c + '" title="' + esc(C.label(s.id)) + '"></i>'; }).join('') + '</div>';
  }
  function waiting(open) {
    view = 'wait'; it = null;
    var fr = E.frontier(st), secure = C.SKILLS.filter(function (s) { return E.isSecure(st, s.id); }).length;
    var due = C.SKILLS.filter(function (s) { var k = st.skills[s.id]; return k.st === 'secure' && st.sess + 1 - k.securedAt >= C.P.reviewGap; }).length;
    var counting = open && sess && sess.start && now() < sess.start;
    app.innerHTML = (sess && sess.state === 'ended' ? nextCard() : '') + '<div class="cgrid"' + (sess && sess.state === 'ended' && nextLesson() ? ' style="margin-top:20px"' : '') + '><section class="card main" style="padding:44px;justify-content:center">' +
      '<p style="margin:0;font-size:20px" class="sub">Hi, ' + esc(first(S.me.name)) + '. ' + (open ? 'You\'re in.' : '') + '</p>' +
      (counting ? '<h1 class="big1">Starting in <span style="color:var(--blue)" id="cd">0:10</span></h1>' : open ? '<h1 class="big1">Waiting for Mr. Crowell to start</h1>' : '<h1 class="big1">Climb isn\'t open right now</h1>') +
      '<p style="margin:0;font-size:20px;max-width:560px">' + (open ? 'Everyone starts together and stops together. Work on your own, and show what you really know: that\'s how the questions find your level.' : (sess && sess.state === 'ended' ? 'Today\'s session has ended. ' : '') + 'Mr. Crowell opens Climb at the start of class. Keep this page open and it starts by itself.') + '</p>' +
      '<div class="tiles">' + (sess && sess.quiz ? '<div class="tile warm"><b>' + Math.round(sess.quiz.secs * mult / 60) + '-min check-in first</b><span>The same ' + sess.quiz.tids.length + ' questions for everyone, then your Climb</span></div>' : '') + '<div class="tile"><b>' + Math.round(C.P.session * mult / 60) + ' min</b><span>for ' + (sess && sess.quiz ? 'your Climb' : 'today\'s session') + '</span></div><div class="tile"><b>' + Math.round(60 * mult) + '–' + Math.round(150 * mult) + ' sec</b><span>for each question: longer ones get more time</span></div><div class="tile warm"><b>Stay on this page</b><span>Leaving it changes your question.</span></div></div>' +
      '</section><aside class="card side"><h2 style="margin:0;font-size:18px" class="sub">You\'re working on</h2>' +
      (fr ? '<div style="display:flex;flex-direction:column;gap:8px"><span class="chip" style="align-self:flex-start">' + 'Step ' + (C.SKILL[fr].i + 1) + ' of ' + C.SKILLS.length + ' · ' + esc(C.label(fr)) + '</span><span style="font:800 28px/1.15 var(--disp)">' + esc(C.SKILL[fr].name) + '</span></div>' : '<span style="font:800 24px var(--disp)">Every open skill is secure. Today is review.</span>') +
      rungs() + '<p style="margin:0" class="sub">' + secure + ' skill' + (secure === 1 ? '' : 's') + ' secure.' + (due ? ' ' + due + ' ' + (due === 1 ? 'is' : 'are') + ' due for a quick review at the start.' : '') + '</p>' +
      '<hr style="border:none;border-top:1px solid var(--line2);margin:4px 0"><p style="margin:0;font-size:15px" class="sub">' + (open ? 'Mr. Crowell starts the session for everyone.' : 'Your skill map saves to your class.') + '</p>' +
      (st.hist.length ? '<a href="#map" id="mapLink" style="font-size:15px">See your skill map</a>' : '') + '</aside></div>';
    var ml = document.getElementById('mapLink'); if (ml) ml.onclick = function (e) { e.preventDefault(); done(true); };
  }
  function header(extra) {
    var left = sessLeft(), frac = sess ? Math.min(1, Math.max(0, 1 - left / (sess.len * mult))) : 0;
    return '<header class="chead">' + (extra || '') + '<span id="askSlot" class="askslot"></span><div class="sbar"><span>Session</span><div class="trk" aria-hidden="true"><i id="sbarI" style="width:' + Math.round(frac * 100) + '%"></i></div><b id="sleft">' + mmss(left) + ' left</b></div></header>';
  }

  /* ---------- the session ---------- */
  function begin(noItem) {
    var t = E.begin(st, sess.id, { late: now() > sess.start + 30000, focus: sess.focus, focusAll: sess.focusAll });
    t.focus = sess.focus || ''; t.focusAll = !!sess.focusAll;
    keep(); saveSoon(500);
    if (!noItem) next({});
  }

  /* ---------- the check-in: a few minutes of the same questions for everyone, then straight into Climb ---------- */
  // No right/wrong shown and nothing changes the ladder: it's for the teacher. Students who finish early start climbing early.
  var QZ = null;
  function qEnd() { return sess.start + (sess.pausedMs || 0) + sess.quiz.secs * 1000 * mult; }
  function quizState() {
    if (!QZ || QZ.id !== sess.id) { var L = SFA.store.get('climb.quiz', null); QZ = L && S.me && L.sid === S.me.sid && L.id === sess.id ? L : { sid: S.me.sid, id: sess.id, i: 0, done: false }; }
    return QZ;
  }
  function quizDue() { return !!(sess && sess.quiz && sess.quiz.tids && sess.quiz.tids.length && !quizState().done && now() < qEnd()); }
  function quizStart() { begin(true); quizNext(); }
  function quizNext() {
    var q = sess.quiz, Z = quizState();
    while (Z.i < q.tids.length && !C.T[q.tids[Z.i]]) Z.i++;
    if (Z.i >= q.tids.length || now() >= qEnd()) return quizDone(Z.i < q.tids.length);
    show({ tid: q.tids[Z.i], seed: C.quizSeed(q, Z.i), mode: 'quiz' }, {});
    if (it && meta) { meta.deadline = qEnd(); meta.limit = q.secs * mult; }
  }
  function quizAnswer(r, timeout, skipped) {
    var Z = quizState(), secs = (now() - meta.start) / 1000;
    logRow({ at: now(), sess: T().id, skill: it.skill, tid: it.tid, seed: it.seed, mode: 'quiz', ans: skipped ? '(skipped)' : r.shown, res: timeout ? 'time' : r.ok ? 'yes' : 'no', tag: r.ok || skipped ? '' : r.tag, secs: Math.round(secs), flags: [meta.afterLeave ? 'afterleave' : '', skipped ? 'skip' : ''].filter(Boolean).join(' ') });
    Z.i++; if (skipped) Z.skip = (Z.skip || 0) + 1; SFA.store.set('climb.quiz', Z);
    view = 'graded';
    if (timeout) return quizDone(true);
    quizNext();
  }
  function quizDone(timeUp) {
    var Z = quizState(), n = sess.quiz.tids.length, did = Math.max(0, Math.min(Z.i, n) - (Z.skip || 0));
    Z.done = true; SFA.store.set('climb.quiz', Z);
    it = null; meta = null; view = 'quizdone';
    app.innerHTML = header('<span class="chip warm">Check-in done</span>') +
      '<section class="card center" style="margin-top:20px;gap:14px"><h1 class="big1" style="font-size:40px">' + (timeUp ? 'Time\'s up for the check-in.' : 'Check-in done. Nice work.') + '</h1>' +
      '<p style="margin:0;font-size:20px" class="sub">You answered ' + did + ' of ' + n + '. Mr. Crowell will go over these questions with the class.</p>' +
      '<p style="margin:0;font-size:22px;font-weight:700">Your Climb starts in <span id="qzgo">5</span>…</p><div><button type="button" class="btn primary big" id="qzB">Start my Climb now</button></div></section>';
    var k = 5, go = function () { clearInterval(iv); if (view === 'quizdone') next({}); };
    var iv = setInterval(function () { var g = document.getElementById('qzgo'); if (--k <= 0 || view !== 'quizdone') return go(); if (g) g.textContent = k; }, 1000);
    document.getElementById('qzB').onclick = go;
  }
  function next(ctx) {
    if (!live() || sessLeft() <= 0) return finish();
    ctx.lastSkill = last.skill;
    var p = E.next(st, ctx, C.newSeed());
    if (!p) return msg('Nothing to work on', 'Every skill you can reach right now is done. Tell Mr. Crowell!');
    show(p, ctx);
  }
  function show(p, ctx) {
    it = C.make(p.tid, p.seed);
    if (!it) return msg('Something went wrong', 'A question couldn\'t load. Reload the page.');
    meta = { mode: p.mode, start: now(), limit: C.itemSecs(it) * mult, deadline: ctx.dev ? Infinity : now() + C.itemSecs(it) * 1000 * mult, ext: false, left: 0, afterLeave: !!ctx.afterLeave, idle: false, twinOf: ctx.twinOf || null, dev: !!ctx.dev };
    vals = it.parts.map(function (pp) {
      if (pp.kind === 'points') return pp.start.map(function (q) { return q.slice(); });
      if (pp.kind === 'slider') { var o = {}; pp.sliders.forEach(function (s) { o[s.id] = s.start; }); return o; }
      if (pp.kind === 'sort') return pp.cards.map(function () { return -1; });
      if (pp.kind === 'arrows') return [];
      return pp.kind === 'multi' ? [] : pp.kind === 'choice' ? -1 : '';
    });
    last.skill = it.skill; lastAct = Date.now();
    if (hand && hand.hold) { hand.hold = now(); if (!ctx.dev) meta.asked = true; }
    question();
  }
  var vals = [];
  function progressLine() {
    var k = st.skills[it.skill], mode = meta.mode;
    if (mode === 'quiz') return 'Question ' + (quizState().i + 1) + ' of ' + sess.quiz.tids.length + ' · no right or wrong shown yet';
    if (mode === 'review') return 'Review: show it stuck';
    if (mode === 'probe') return 'Bonus question: try your best';
    if (mode === 'preview') return 'Today\'s lesson topic: practice, not scored';
    if (E.isSecure(st, it.skill)) return 'Secure: keep it sharp';
    if (k.st === 'relearn') return (2 - k.run) + ' more right in a row secures it again';
    // how many more right answers would secure it
    for (var n = 1; n <= 3; n++) {
      var h = k.hist.slice(); for (var j = 0; j < n; j++) h.push({ ok: 1, t: 'x' + j, to: 0 });
      var l4 = h.slice(-4); if (l4.length >= 3 && l4.filter(function (a) { return a.ok; }).length >= 3 && !l4.some(function (a) { return a.to; })) return n + ' more correct secure' + (n === 1 ? 's' : '') + ' this skill';
    }
    return 'Every right answer counts';
  }
  var IA = { points: 1, slider: 1, sort: 1, arrows: 1 };
  function partHtml(p, i) {
    var id = 'p' + i, lab = p.label ? '<label class="pl" for="' + id + '">' + p.label + '</label>' : '';
    if (IA[p.kind]) return '<div class="part">' + (p.label ? '<div class="pl">' + p.label + '</div>' : '') + '<div class="ia" data-ia="' + i + '"></div></div>';
    if (p.kind === 'num') return '<div class="part">' + lab + '<input class="ninp" id="' + id + '" data-i="' + i + '" type="text" autocomplete="off" spellcheck="false" placeholder="e.g. 3, −2 or 2/3"></div>';
    if (p.kind === 'eq') return '<div class="part">' + lab + '<input class="ninp" id="' + id + '" data-i="' + i + '" type="text" autocomplete="off" spellcheck="false" placeholder="' + esc((p.yv || 'y') + ' = 2' + (p.xv || 'x') + ' + 3') + '"><div class="hintline">Type it like ' + esc((p.yv || 'y') + ' = 2' + (p.xv || 'x') + ' − 3') + ' or ' + esc((p.yv || 'y') + ' = (1/2)' + (p.xv || 'x') + ' + 4') + '.</div></div>';
    if (p.kind === 'text') return '<div class="part">' + lab + '<textarea class="ninp" style="font-size:19px;min-height:90px" id="' + id + '" data-i="' + i + '" spellcheck="true"></textarea></div>';
    var order = p.order, multi = p.kind === 'multi', figs = p.opts.some(function (o) { return /<svg/.test(o.t); });
    return '<fieldset class="part" style="border:0;margin:0;padding:0">' + (p.label ? '<legend class="pl">' + p.label + (multi ? ' <span class="sub" style="font-weight:400">(choose all that apply)</span>' : '') + '</legend>' : (multi ? '<legend class="pl sub" style="font-weight:400">Choose all that apply.</legend>' : '')) + '<div class="opts' + (figs ? ' figs' : '') + '">' +
      order.map(function (k) { return '<label class="opt"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + id + '" data-i="' + i + '" value="' + k + '"><span>' + p.opts[k].t + '</span></label>'; }).join('') + '</div></fieldset>';
  }
  function inlineHtml(p, i) {
    if (p.kind === 'num') return '<input class="ninp sm" data-i="' + i + '" type="text" autocomplete="off" aria-label="number ' + (i + 1) + '">';
    return '<select data-i="' + i + '" aria-label="choice ' + (i + 1) + '"><option value="-1">choose…</option>' + p.order.map(function (k) { return '<option value="' + k + '">' + esc(C.strip(p.opts[k].t)) + '</option>'; }).join('') + '</select>';
  }
  function orderParts(item) {
    item.parts.forEach(function (p, i) {
      if (!p.opts) return;
      var idx = p.opts.map(function (o, k) { return k; });
      p.order = p.keep ? idx : C.rng((item.seed + 31 * (i + 1)) >>> 0).shuffle(idx);
    });
  }
  function question() {
    view = 'item'; orderParts(it);
    var t = T(), quiz = meta.mode === 'quiz', qn = quiz ? quizState().i + 1 : (t ? t.items : 0) + 1, chip = quiz ? '<span class="chip warm">' + esc(sess.quiz.name || 'Check-in') + ' · same questions for everyone</span>' : meta.mode === 'review' ? '<span class="chip dark">Review · ' + esc(skName(it.skill)) + '</span>' : '<span class="chip">' + esc(skName(it.skill)) + '</span>';
    var body, wide = '';
    if (it.sentence) { var s = it.sentence; it.parts.forEach(function (p, i) { s = s.replace('{' + i + '}', inlineHtml(p, i)); }); body = '<div class="part sentence">' + s + '</div>'; }
    else {
      // interactive parts need room: they go in the big card under the question; the rest stay beside it
      wide = it.parts.map(function (p, i) { return IA[p.kind] ? partHtml(p, i) : ''; }).join('');
      body = it.parts.map(function (p, i) { return IA[p.kind] ? '' : partHtml(p, i); }).join('');
      if (!body && wide) body = '<p class="sub" style="margin:0;font-size:16px">Build your answer on the left, then check it.</p>';
    }
    var almostLeft = C.P.almostPerSession - (t ? t.almost : 0);
    app.innerHTML = header('<span class="chip-wrap">' + chip + '</span><span class="cnext">' + esc(progressLine()) + '</span>') +
      '<div class="cgrid" style="margin-top:20px"><section class="card main noselect' + (wide ? ' build' : '') + '" id="qcard"><div class="qhead"><span class="qnum">Question ' + qn + '</span><button type="button" class="btn listen" id="listen" aria-label="Read the question aloud"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16.5 8.5 Q19 12 16.5 15.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Listen</button></div>' +
      '<h1 class="stem' + (wide ? ' small' : '') + '">' + it.stem + '</h1>' + (it.fig ? '<figure class="figw" style="margin:0">' + it.fig + '</figure>' : '') + (wide ? '<div class="parts wide">' + wide + '</div>' : '') + '</section>' +
      '<aside class="card side"><div class="timer"><svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="30" fill="none" stroke="#E6EDFD" stroke-width="8"/><circle id="ring" cx="36" cy="36" r="30" fill="none" stroke="#1D4ED8" stroke-width="8" stroke-linecap="round" stroke-dasharray="188.5 188.5" transform="rotate(-90 36 36)"/></svg><div style="display:flex;flex-direction:column"><b id="ileft">1:30</b><span>' + (quiz ? 'left in the check-in' : 'left on this question') + '</span></div></div>' +
      '<div class="almost" id="almost" hidden><button type="button" class="btn warm" id="almostB">Almost got it? +' + C.P.almost + ' seconds</button><small>Once per question · ' + almostLeft + ' left this session</small></div>' +
      '<form class="parts" id="ans" novalidate>' + body + '<p class="hint" id="need" hidden>Answer every part first.</p>' +
      (it.think && !quiz ? '<div class="think"><b>Think</b><span>' + it.think + '</span></div>' : '') +
      '<button type="submit" class="btn primary big" style="margin-top:4px">' + (quiz ? 'Save and go on' : 'Check my answer') + '</button>' + (quiz ? '<button type="button" class="btn small" id="skipB" style="align-self:flex-start">Skip this one</button>' : '') + '</form></aside></div>';
    var form = document.getElementById('ans');
    mountAll(app);
    var stemEl = app.querySelector('.stem'); if (stemEl) glossify(stemEl);
    form.addEventListener('input', readVals); form.addEventListener('change', readVals);
    form.addEventListener('submit', function (e) { e.preventDefault(); readVals(); submit(false); });
    [].forEach.call(form.querySelectorAll('.opt input'), function (inp) { inp.addEventListener('change', function () { [].forEach.call(form.querySelectorAll('input[name="' + inp.name + '"]'), function (o) { o.parentNode.classList.toggle('sel', o.checked); }); }); });
    document.getElementById('listen').onclick = function () { say(C.strip(it.stem) + '. ' + (it.sentence ? C.strip(it.sentence.replace(/\{\d\}/g, ' blank ')) : it.parts.map(function (p) { return C.strip(p.label || ''); }).join('. '))); };
    var skB = document.getElementById('skipB'); if (skB) skB.onclick = function () { if (view === 'item') quizAnswer({ ok: false, shown: '' }, false, true); };
    document.getElementById('almostB').onclick = function () { if (meta.ext) return; meta.ext = true; meta.deadline += C.P.almost * 1000; T().almost++; document.getElementById('almost').hidden = true; };
    var f1 = form.querySelector('input,select,textarea'); if (f1 && window.matchMedia('(pointer:fine)').matches) f1.focus({ preventScroll: true });
    tick();
  }
  function readVals() {
    var form = document.getElementById('ans'); if (!form || !it) return;
    it.parts.forEach(function (p, i) {
      if (IA[p.kind]) return;   // the widgets keep these up to date themselves
      if (p.kind === 'choice') { var c = form.querySelector('[data-i="' + i + '"]:checked'), sel = form.querySelector('select[data-i="' + i + '"]'); vals[i] = sel ? +sel.value : c ? +c.value : -1; }
      else if (p.kind === 'multi') vals[i] = [].map.call(form.querySelectorAll('[data-i="' + i + '"]:checked'), function (c) { return +c.value; });
      else { var inp = form.querySelector('[data-i="' + i + '"]'); vals[i] = inp ? inp.value : ''; }
    });
  }
  function blank() {
    return it.parts.some(function (p, i) {
      var v = vals[i];
      if (p.kind === 'points' || p.kind === 'slider') return false;
      if (p.kind === 'sort') return v.some(function (b) { return b < 0; });
      if (p.kind === 'arrows') return !v.length;
      return p.kind === 'choice' ? v < 0 : p.kind === 'multi' ? !v.length : !String(v).trim();
    });
  }

  /* ---------- interactive answers: drag points, sliders, card sorts, mapping arrows ---------- */
  function mountAll(root) { [].forEach.call(root.querySelectorAll('[data-ia]'), function (box) { var i = +box.getAttribute('data-ia'), p = it.parts[i]; ({ points: mountPoints, slider: mountSlider, sort: mountSort, arrows: mountArrows })[p.kind](box, p, i); }); }
  function mountPoints(box, p, i) {
    var g = p.grid, F = C.frame(g), sx = p.step || g.dx || 1, sy = p.stepY || g.dy || 1, drag = -1, focusK = -1;
    function snap(v, s, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v / s) * s)); }
    function draw() {
      var cur = vals[i], lines = (g.lines || []).slice();
      if (p.connect === 'line' && cur.length >= 2 && cur[0][0] !== cur[1][0]) lines.push({ p: [cur[0], cur[1]] });
      if ((p.connect === 'poly' || p.connect === 'seg') && cur.length >= 2) lines.push({ seg: cur.slice().sort(function (a, b) { return p.connect === 'poly' ? a[0] - b[0] : 0; }) });
      if (p.extra) lines = lines.concat(p.extra(cur) || []);
      var pts = (g.pts || []).concat(cur.map(function (q, k) { return { x: q[0], y: q[1], h: k, name: p.names ? p.names[k] : 'Point ' + (k + 1), l: p.labels === false ? null : (p.names ? p.names[k] + ' ' : '') + C.pt(q[0], q[1]) }; }));
      box.innerHTML = C.graph(Object.assign({}, g, { lines: lines, pts: pts, label: (g.label || 'Grid') + ' with points you can move' })) +
        '<div class="hintline">Drag the orange point' + (cur.length > 1 ? 's' : '') + ', or click one and use the arrow keys.' + (p.readout ? ' ' + p.readout(cur) : '') + '</div>';
      [].forEach.call(box.querySelectorAll('.hdl'), function (h) {
        var k = +h.getAttribute('data-h');
        h.addEventListener('pointerdown', function (e) { e.preventDefault(); drag = k; h.style.cursor = 'grabbing'; });
        h.addEventListener('keydown', function (e) {
          var d = { ArrowLeft: [-sx, 0], ArrowRight: [sx, 0], ArrowUp: [0, sy], ArrowDown: [0, -sy] }[e.key]; if (!d) return;
          e.preventDefault(); move(k, vals[i][k][0] + d[0], vals[i][k][1] + d[1]); focusK = k; draw();
        });
      });
      if (focusK >= 0) { var f = box.querySelector('.hdl[data-h="' + focusK + '"]'); if (f) f.focus(); focusK = -1; }
    }
    function move(k, x, y) {
      if (p.lock === 'x') x = vals[i][k][0];
      if (p.lock === 'y') y = vals[i][k][1];
      vals[i][k] = [snap(x, sx, g.x[0], g.x[1]), snap(y, sy, g.y[0], g.y[1])];
      lastAct = Date.now();
    }
    function at(e) { var svg = box.querySelector('svg'), r = svg.getBoundingClientRect(); return [F.x((e.clientX - r.left) * F.W / r.width), F.y((e.clientY - r.top) * F.H / r.height)]; }
    window.addEventListener('pointermove', function (e) { if (drag < 0 || !box.isConnected) return; var q = at(e), old = vals[i][drag].join(); move(drag, q[0], q[1]); if (vals[i][drag].join() !== old) draw(); });
    window.addEventListener('pointerup', function () { drag = -1; });
    box.style.touchAction = 'none';
    draw();
  }
  function mountSlider(box, p, i) {
    var sl = p.sliders.map(function (s) {
      return '<label class="sld"><span>' + esc(s.label || s.id) + '</span><input type="range" min="' + s.min + '" max="' + s.max + '" step="' + s.step + '" value="' + s.start + '" data-s="' + s.id + '"><output data-o="' + s.id + '">' + C.fmt(s.start) + '</output></label>';
    }).join('');
    box.innerHTML = '<div class="sliders">' + sl + '</div><div class="sgraph"></div>';
    function draw() {
      var v = vals[i], gb = box.querySelector('.sgraph'); if (!p.grid) return;
      var add = p.draw ? p.draw(v) : { lines: [{ m: v.m, b: v.b }] };
      gb.innerHTML = C.graph(Object.assign({}, p.grid, { lines: (p.grid.lines || []).concat(add.lines || []), pts: (p.grid.pts || []).concat(add.pts || []), label: 'Your line' }));
    }
    [].forEach.call(box.querySelectorAll('input[type=range]'), function (r) {
      r.addEventListener('input', function () { var id = r.getAttribute('data-s'); vals[i][id] = +r.value; box.querySelector('[data-o="' + id + '"]').textContent = C.fmt(+r.value); lastAct = Date.now(); draw(); });
    });
    draw();
  }
  function mountSort(box, p, i) {
    var picked = -1;
    function cardBtn(k) { return '<button type="button" class="scard' + (picked === k ? ' on' : '') + '" draggable="true" data-c="' + k + '" aria-pressed="' + (picked === k) + '">' + p.cards[k].t + '</button>'; }
    function draw() {
      var v = vals[i], pool = p.cards.map(function (c, k) { return v[k] < 0 ? cardBtn(k) : ''; }).join('');
      box.innerHTML = '<div class="spool" data-b="-1">' + (pool || '<span class="sub" style="font-size:15px">All cards placed. Click a card to move it again.</span>') + '</div>' +
        '<div class="sbins">' + p.bins.map(function (b, bi) { return '<div class="sbin" data-b="' + bi + '"><button type="button" class="sbinh" data-b="' + bi + '">' + b + '</button>' + p.cards.map(function (c, k) { return v[k] === bi ? cardBtn(k) : ''; }).join('') + '</div>'; }).join('') + '</div>' +
        '<div class="hintline">' + (picked >= 0 ? 'Now click the box it belongs in.' : 'Click a card, then click the box it belongs in (or drag it).') + '</div>';
      [].forEach.call(box.querySelectorAll('.scard'), function (b) {
        var k = +b.getAttribute('data-c');
        b.onclick = function (e) { e.stopPropagation(); picked = picked === k ? -1 : k; draw(); var f = box.querySelector('.scard[data-c="' + k + '"]'); if (f) f.focus(); };
        b.addEventListener('dragstart', function (e) { picked = k; try { e.dataTransfer.setData('text/plain', String(k)); } catch (x) { } });
      });
      [].forEach.call(box.querySelectorAll('[data-b]'), function (z) {
        var bi = +z.getAttribute('data-b');
        var drop = function () { if (picked < 0) return; vals[i][picked] = bi; picked = -1; lastAct = Date.now(); draw(); };
        if (z.tagName === 'BUTTON') z.onclick = drop;
        else { z.addEventListener('dragover', function (e) { e.preventDefault(); }); z.addEventListener('drop', function (e) { e.preventDefault(); drop(); }); }
      });
    }
    draw();
  }
  function mountArrows(box, p, i) {
    var sel = -1, n = Math.max(p.left.length, p.right.length), H = 40 + n * 48, W = 340;
    function yy(k, len) { return H / 2 + 8 + (k - (len - 1) / 2) * 48; }
    function draw() {
      var v = vals[i], s = '<svg class="cfig" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="group" aria-label="Mapping diagram: click an input, then an output, to draw an arrow" style="max-width:100%;height:auto">';
      s += '<defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#1D4ED8"/></marker></defs>';
      s += '<text x="70" y="16" text-anchor="middle" font-size="13" font-weight="700">' + esc(p.lt || 'Input') + '</text><text x="270" y="16" text-anchor="middle" font-size="13" font-weight="700">' + esc(p.rt || 'Output') + '</text>';
      v.forEach(function (a) { s += '<line x1="98" y1="' + yy(a[0], p.left.length) + '" x2="240" y2="' + yy(a[1], p.right.length) + '" stroke="#1D4ED8" stroke-width="2.5" marker-end="url(#arw)"/>'; });
      p.left.forEach(function (t, k) { s += '<g class="node" tabindex="0" role="button" data-l="' + k + '" aria-pressed="' + (sel === k) + '" aria-label="Input ' + esc(C.fmt(t)) + '" style="cursor:pointer"><rect x="42" y="' + (yy(k, p.left.length) - 18) + '" width="56" height="36" rx="10" fill="' + (sel === k ? '#1D4ED8' : '#F3F5FA') + '" stroke="#1D4ED8"/><text x="70" y="' + (yy(k, p.left.length) + 6) + '" text-anchor="middle" font-size="17" font-weight="700" fill="' + (sel === k ? '#fff' : '#111827') + '">' + esc(C.fmt(t)) + '</text></g>'; });
      p.right.forEach(function (t, k) { s += '<g class="node" tabindex="0" role="button" data-r="' + k + '" aria-label="Output ' + esc(C.fmt(t)) + '" style="cursor:pointer"><rect x="242" y="' + (yy(k, p.right.length) - 18) + '" width="56" height="36" rx="10" fill="#F3F5FA" stroke="#1D4ED8"/><text x="270" y="' + (yy(k, p.right.length) + 6) + '" text-anchor="middle" font-size="17" font-weight="700">' + esc(C.fmt(t)) + '</text></g>'; });
      box.innerHTML = s + '</svg><div class="hintline">' + (sel >= 0 ? 'Now click an output. Clicking an arrow\'s two ends again removes it.' : 'Click an input, then an output, to draw an arrow.') + ' <button type="button" class="btn small" data-clear>Clear arrows</button></div>';
      [].forEach.call(box.querySelectorAll('.node'), function (g) {
        var act = function () {
          if (g.hasAttribute('data-l')) { var k = +g.getAttribute('data-l'); sel = sel === k ? -1 : k; draw(); var f = box.querySelector('[data-l="' + k + '"]'); if (f) f.focus(); return; }
          if (sel < 0) return;
          var r = +g.getAttribute('data-r'), at = vals[i].findIndex(function (a) { return a[0] === sel && a[1] === r; });
          if (at >= 0) vals[i].splice(at, 1); else vals[i].push([sel, r]);
          sel = -1; lastAct = Date.now(); draw();
        };
        g.addEventListener('click', act); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      });
      box.querySelector('[data-clear]').onclick = function () { vals[i] = []; sel = -1; draw(); };
    }
    draw();
  }
  // tap-to-see glossary: context words in the question become buttons that show their meaning
  function glossify(root) {
    var words = Object.keys(C.GLOSS).sort(function (a, b) { return b.length - a.length; });
    var re = new RegExp('\\b(' + words.map(function (w) { return w.replace(/[-]/g, '\\-'); }).join('|') + ')\\b', 'i'), seen = {};
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) if (!n.parentNode.closest('svg,button,label,select,.gl')) nodes.push(n);
    while (nodes.length) (function (t) {
      var m = t.nodeValue.match(re); if (!m) return;
      var w = m[1].toLowerCase();
      var after = t.splitText(m.index); after.nodeValue = after.nodeValue.slice(m[1].length);
      nodes.push(after);   // the rest of the sentence may hold another word
      if (seen[w]) { t.nodeValue += m[1]; return; }
      seen[w] = 1;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'gl'; b.textContent = m[1]; b.setAttribute('aria-label', m[1] + ': show what it means');
      b.onclick = function () { SFA.toast(m[1] + ': ' + C.GLOSS[w], 6000); };
      t.parentNode.insertBefore(b, after);
    })(nodes.shift());
  }
  function say(text) { try { var u = new SpeechSynthesisUtterance(text.replace(/−/g, 'minus ').replace(/\//g, ' over ')); u.rate = 0.95; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { SFA.toast('Read-aloud isn\'t available in this browser.'); } }

  function submit(timeout) {
    if (view !== 'item' || paused) return;
    if (!timeout && blank()) { var n = document.getElementById('need'); if (n) n.hidden = false; return; }
    var r = timeout ? { ok: false, tag: 'T0', timeout: true, shown: C.shown(it, vals) } : C.grade(it, vals);
    if (!timeout && !r.ok && !r.tag) r.tag = 'G';
    if (meta.mode === 'quiz') return quizAnswer(r, timeout, false);
    var secs = (now() - meta.start) / 1000, fast = r.ok && secs < C.P.fastSecs && it.level >= 4;
    var out = E.record(st, it, r, { mode: meta.mode, secs: secs, limit: meta.limit, ext: meta.ext || meta.asked, fast: fast, afterLeave: meta.afterLeave, idle: meta.idle });
    var fl = [meta.ext ? 'ext' : '', fast ? 'fast' : '', meta.afterLeave ? 'afterleave' : '', meta.idle ? 'idle' : '', T().noSecure ? 'nosecure' : '', meta.asked ? 'asked' : ''].filter(Boolean).join(' ');
    logRow({ at: now(), sess: T().id, skill: it.skill, tid: it.tid, seed: it.seed, mode: meta.mode, ans: r.shown, res: timeout ? 'time' : r.ok ? 'yes' : 'no', tag: r.ok ? '' : r.tag, secs: Math.round(secs), flags: fl });
    view = 'graded';
    if (r.ok) return right(out);
    // a miss: the teaching loop (explanation, guided try, then a scored twin); probes and previews just show the method
    var mode = meta.mode;
    if (mode === 'twin' || mode === 'check' || mode === 'probe' || mode === 'preview') {
      var then = mode === 'twin' && out.stuck ? { check: E.checkFor(it.skill, r.tag) } : {};
      if (mode === 'twin' && out.stuck && !then.check) then = {};
      return explain(r, then, false);
    }
    explain(r, null, true);
  }
  function right(out) {
    view = 'right';
    var lines = ['Right!'];
    if (out.secured) lines.push((out.testedOut ? 'Tested out: ' : '') + C.label(it.skill) + ' is secure!');
    if (out.retained) lines.push(C.label(it.skill) + ' passed its review: retained.');
    if (out.credited) lines.push('That also counted as review for ' + out.credited.map(C.label).join(' and ') + '.');
    var side = document.querySelector('aside.card');
    if (side) side.innerHTML = '<div class="feedback good" role="status">' + lines.map(esc).join('<br>') + '</div>';
    setTimeout(function () { if (view === 'right') next({}); }, out.secured || out.retained ? 2200 : 1100);
  }

  /* ---------- the teaching loop ---------- */
  function explain(r, then, loopOn) {
    view = 'explain'; screenEnd = now() + C.P.explain * 1000; if (hand && hand.hold) hand.hold = now();
    var tag = r.timeout ? 'T0' : r.tag || 'G', T0 = C.TAGS[tag] || C.TAGS.G;
    var head = (it.why && it.why[tag]) || T0.say;
    loop = { tid: it.tid, skill: it.skill, mode: meta.mode, then: then, on: loopOn };
    var btn = loopOn ? 'Got it: try one with steps' : then && then.check ? 'Next: a quick check on ' + C.label(then.check) : 'Next question';
    app.innerHTML = header('<span class="chip">' + esc(skName(it.skill)) + '</span>') +
      '<div style="display:flex;flex-direction:column;gap:20px;margin-top:20px"><section class="card" style="flex-direction:row;flex-wrap:wrap;align-items:center;gap:16px 24px;padding:28px 36px"><div style="flex:999 1 480px;display:flex;flex-direction:column;gap:8px"><span class="chip warm" style="align-self:flex-start">' + (r.timeout ? 'Out of time: here\'s how' : 'Not yet: let\'s fix it') + '</span><h1 class="h2" style="font-size:30px">' + head + '</h1></div>' +
      '<div style="flex:1 1 200px;display:flex;flex-direction:column;gap:8px;align-items:flex-end"><span class="sub" style="font-size:15px" id="nxt">Next screen in 0:30</span><div style="width:200px;height:8px;background:var(--orange-soft);border-radius:4px;overflow:hidden" aria-hidden="true"><div id="nxtbar" style="width:0;height:8px;background:var(--orange)"></div></div></div></section>' +
      '<div class="cgrid" style="gap:20px"><section class="card main" style="border:2px solid var(--blue);flex-basis:520px"><div style="display:flex;align-items:center;gap:10px"><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="#1D4ED8"/><path d="M8 14.5 L12 18.5 L20 10" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><h2 style="margin:0;font-size:22px">The correct way, with your numbers</h2></div>' +
      (it.fig ? '<figure class="figw" style="margin:0">' + it.fig + '</figure>' : '') + '<p style="margin:0;font-size:17px" class="sub">' + it.stem + '</p>' +
      '<ol class="work">' + it.work.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ol>' + (it.answerFig ? '<figure class="figw" style="margin:0">' + it.answerFig + '</figure>' : '') + '<p class="why">Answer: ' + it.answer + '</p></section>' +
      '<section class="card side"><h2 style="margin:0;font-size:20px;color:var(--orange-ink)">Your answer: ' + esc(r.timeout ? (r.shown && !/^\(blank\)/.test(r.shown) ? r.shown + ' (not checked)' : 'none yet') : r.shown) + '</h2>' +
      (tag !== 'G' && tag !== 'T0' && T0.name ? '<p style="margin:0;font-size:18px"><b>What happened:</b> ' + esc(T0.name.charAt(0).toLowerCase() + T0.name.slice(1)) + '.</p>' : '') + '<div style="margin-top:auto" class="think"><b>Habit for next time</b><span style="color:var(--ink)">' + esc(T0.habit) + '</span></div></section></div>' +
      '<div style="display:flex;justify-content:flex-end"><button type="button" class="btn primary big" id="go">' + esc(btn) + '</button></div></div>';
    document.getElementById('go').onclick = afterExplain;
    tick();
  }
  function afterExplain() {
    if (view !== 'explain') return;
    if (loop.on) return guide();
    next(loop.then || {});
  }
  function guide() {
    view = 'guided'; screenEnd = now() + C.P.guided * 1000; if (hand && hand.hold) hand.hold = now();
    var g = C.make(loop.tid, C.newSeed());
    guided = { it: g, i: 0, tries: 0, done: [] };
    drawGuide();
  }
  // a question whose pictures are in its answer options (pick the graph…): show them on the guided screen too, so the steps can refer to them
  function optionFigs(g) {
    var p = g.parts.filter(function (q) { return q.opts && q.opts.some(function (o) { return /<svg/.test(o.t); }); })[0];
    if (!p) return '';
    return '<div class="opts figs" style="align-self:stretch">' + p.opts.map(function (o) { return '<div class="opt" style="cursor:default">' + o.t + '</div>'; }).join('') + '</div>';
  }
  function stepVal(p) { if (p.kind === 'choice') { var o = p.opts.filter(function (o) { return o.ok; })[0]; return o ? C.strip(o.t) : ''; } return C.fmt(p.key); }
  function drawGuide() {
    var g = guided.it, steps = g.steps || [], cur = steps[guided.i];
    var doneRows = guided.done.map(function (d) { return '<div class="steprow"><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="' + (d.shown ? '#F97316' : '#1D4ED8') + '"/><path d="M8 14.5 L12 18.5 L20 10" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="lab">Step ' + (d.n + 1) + ' · ' + d.label + '</span><b>' + esc(d.val) + '</b></div>'; }).join('');
    var now1 = '';
    if (cur) {
      var p = cur.part, ctl;
      if (p.kind === 'choice') ctl = p.opts.map(function (o, k) { return '<button type="button" class="btn" data-k="' + k + '">' + o.t + '</button>'; }).join('');
      else ctl = '<input id="gstep" class="ninp" style="flex:1 1 200px;font-size:24px" type="text" autocomplete="off" aria-label="Step answer"><button type="submit" class="btn primary">Check step</button>';
      now1 = '<form class="stepnow" id="gform"><label for="gstep" style="font-size:18px;font-weight:700">Step ' + (guided.i + 1) + ' · ' + cur.label + '</label><div class="row">' + ctl + '</div>' + (guided.tries ? '<p class="hint">' + (cur.hint || 'Look at the step before this one.') + '</p>' : '') + '</form>';
    } else now1 = '<div class="feedback good">All steps done. Now one on your own: it counts.</div><div><button type="button" class="btn primary big" id="gonext">Next question</button></div>';
    app.innerHTML = header('<span class="chip">' + esc(C.label(g.skill)) + ' · Guided try</span>') +
      '<div class="cgrid" style="margin-top:20px"><section class="card side" style="align-items:center"><p style="margin:0;align-self:stretch;font-size:19px">Same idea, new numbers. Work it out one step at a time.</p><p style="margin:0;align-self:stretch;font-weight:700">' + g.stem + '</p>' + (g.fig ? '<figure class="figw" style="margin:0">' + g.fig + '</figure>' : optionFigs(g)) + '</section>' +
      '<section class="card main">' + doneRows + now1 + '<p style="margin:0;font-size:15px" class="sub">Guided tries don\'t count toward your score. The next question will.</p></section></div>';
    var gf = document.getElementById('gform');
    if (gf) {
      gf.addEventListener('submit', function (e) { e.preventDefault(); var v = document.getElementById('gstep'); if (v) checkStep(v.value); });
      [].forEach.call(gf.querySelectorAll('[data-k]'), function (b) { b.onclick = function () { checkStep(+b.getAttribute('data-k')); }; });
      var inp = document.getElementById('gstep'); if (inp && window.matchMedia('(pointer:fine)').matches) inp.focus({ preventScroll: true });
    }
    var gn = document.getElementById('gonext'); if (gn) gn.onclick = toTwin;
    tick();
  }
  function checkStep(v) {
    var cur = guided.it.steps[guided.i], g = C.grade({ parts: [cur.part] }, [v]);
    if (g.ok || guided.tries >= 2) {
      guided.done.push({ n: guided.i, label: cur.label, val: stepVal(cur.part), shown: !g.ok });
      guided.i++; guided.tries = 0;
    } else guided.tries++;
    drawGuide();
  }
  function toTwin() {
    if (view !== 'guided') return;
    screenEnd = 0;
    next({ twin: loop.tid, twinMode: loop.mode === 'review' || loop.mode === 'practice' ? 'twin' : 'twin' });
  }

  /* ---------- leaving the page ---------- */
  // kind: 'hidden' (another tab, minimised, screen locked) or 'blur' (the page still shows but something else has focus).
  // Short trips don't swap the question: browsers and devices take focus away for many innocent reasons.
  function leave(kind) {
    if (paused) return;
    if (view === 'item' && meta) { if (!meta.left) meta.left = now(); if (kind === 'hidden') meta.leftHidden = true; }
    else if ((view === 'explain' || view === 'guided') && T()) { T().leavesTeach = (T().leavesTeach || 0) + 1; }
  }
  function back() {
    if (view !== 'item' || !meta || !meta.left) return;
    var t = T(), away = (now() - meta.left) / 1000, hid = !!meta.leftHidden, need = hid ? C.P.swapHidden : C.P.swapBlur;
    meta.left = 0; meta.leftHidden = false;
    t.away = Math.round((t.away || 0) + away);
    if (meta.mode === 'quiz') { if (away >= 2) meta.afterLeave = true; if (hid) SFA.toast('Stay on this page during the check-in.', 4000); return; }
    if (away < need) {
      // a blip: counted for the teacher, the question stays
      t.blips = (t.blips || 0) + 1; if (hid) meta.afterLeave = true;
      if (hid) SFA.toast('Stay on this page: leaving for more than ' + need + ' seconds swaps your question.', 5000);
      return;
    }
    t.leaves++;
    if (away > C.P.awayAmber) t.awayLong = true;
    if (t.leaves >= C.P.leavesNoSecure) { t.noSecure = true; if (!t.flags.some(function (f) { return f.k === 'red'; })) t.flags.push({ k: 'red', at: now() }); }
    logRow({ at: now(), sess: t.id, skill: it.skill, tid: it.tid, seed: it.seed, mode: meta.mode, ans: '(left the page ' + Math.round(away) + ' s)', res: 'void', tag: '', secs: Math.round((now() - meta.start) / 1000), flags: 'left' });
    // a different template from the same skill, new numbers, a fresh 90 seconds; the session clock never stopped
    var list = E.templates(it.skill).filter(function (x) { return x.id !== it.tid; }), mode = meta.mode;
    var tid = list.length ? list[Math.floor(Math.random() * list.length)].id : it.tid;
    last.skill = '';
    next({ twin: tid, twinMode: mode, afterLeave: true });
    view = 'changed';
    var o = document.createElement('div'); o.className = 'overlay'; o.id = 'chg';
    o.innerHTML = '<section class="dialog" role="dialog" aria-labelledby="chgT"><div style="display:flex;align-items:center;gap:14px"><svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="#FDEDE3"/><path d="M14 18 H28 L24 14 M30 26 H16 L20 30" fill="none" stroke="#C2410C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><h1 id="chgT">Your question changed</h1></div><p style="margin:0;font-size:20px">You left the page, so that question was swapped for a new one. It\'s from the same skill, with new numbers.</p><p class="sub" style="margin:0;font-size:16px">The session clock kept running. Left the page today: ' + t.leaves + ' time' + (t.leaves === 1 ? '' : 's') + '.' + (t.noSecure ? ' Nothing more today counts toward Secure.' : '') + '</p><button type="button" class="btn primary big" style="align-self:flex-start" id="chgB">Back to work</button></section>';
    document.body.appendChild(o);
    // the new question's 90 seconds start when they press the button
    document.getElementById('chgB').onclick = function () { o.remove(); view = 'item'; meta.start = now(); meta.deadline = now() + meta.limit * 1000; tick(); };
    document.getElementById('chgB').focus();
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') leave('hidden'); else { back(); ping(); } });
  window.addEventListener('blur', function () { setTimeout(function () { if (!document.hasFocus()) leave('blur'); }, 1000); });
  window.addEventListener('focus', back);
  ['pointerdown', 'keydown', 'pointermove', 'wheel'].forEach(function (ev) { document.addEventListener(ev, function () { lastAct = Date.now(); }, { passive: true }); });
  app.addEventListener('paste', function (e) { if (view === 'item' || view === 'guided') { e.preventDefault(); if (T()) T().paste = (T().paste || 0) + 1; SFA.toast('Pasting is turned off in Climb. Type your answer.'); } });
  app.addEventListener('copy', function (e) { if (view === 'item') e.preventDefault(); });
  app.addEventListener('contextmenu', function (e) { if (view === 'item') e.preventDefault(); });

  /* ---------- pause and end ---------- */
  function showPause() {
    if (document.getElementById('pz')) return;
    var o = document.createElement('div'); o.className = 'overlay'; o.id = 'pz';
    o.innerHTML = '<section class="dialog" role="dialog" aria-labelledby="pzT"><h1 id="pzT">Paused</h1><p style="margin:0;font-size:20px">Mr. Crowell paused the session. Every clock is frozen. It carries on by itself.</p></section>';
    document.body.appendChild(o);
  }
  function hidePause() { var o = document.getElementById('pz'); if (o) o.remove(); tick(); }
  function finish() {
    var t = T(); if (!t) return waiting(false);
    var chg = document.getElementById('chg'); if (chg) chg.remove();
    if (!t.closed) { E.close(st); keep(); saveSoon(200); }
    SFA.store.set('climb.doneId', t.id);   // the nav's "Climb is open" link stays away once you've finished this session
    it = null; meta = null; done();
  }
  var doneAt = 0;
  function done(fromWait) {
    view = 'done'; if (!fromWait && !doneAt) doneAt = Date.now();
    var t = T() || {}, h = st.hist[st.hist.length - 1];
    var th0 = Math.round(t.th0 || st.theta), th1 = Math.round(st.theta), fr = E.frontier(st);
    var LEG = [['R', 'Retained'], ['S', 'Secure'], ['L', 'Learning'], ['O', 'Open'], ['-', 'Not open yet']];
    var map = '<div class="smap">' + C.SKILLS.map(function (s) { var c = E.code(st, s.id), cls = c === 'B' || c === 'K' ? 'L' : c; return '<span class="k-' + cls + '" title="' + esc(C.label(s.id) + ': ' + s.name) + '">' + esc(s.id) + '</span>'; }).join('') + '</div><div class="legend">' + LEG.map(function (l) { return '<span><i class="k-' + l[0] + '"></i>' + l[1] + '</span>'; }).join('') + '</div>';
    var today = !fromWait && t.id;
    app.innerHTML = (today ? '<header class="chead"><span class="chip">Session over</span></header>' : '') +
      '<div style="display:flex;flex-direction:column;gap:20px;margin-top:12px">' + (today ? nextCard() : '') +
      (today ? '<h1 class="big1" style="font-size:46px">Nice climbing. Here\'s what you did today.</h1><p style="margin:0;font-size:20px" class="sub">Your growth score went from <b style="color:var(--ink)">' + th0 + '</b> to <b style="color:var(--blue)">' + th1 + '</b>. It grows as you take on harder questions.</p>' +
        '<div class="tiles"><div class="tile blue"><span>Skills secured</span><b>' + t.secured.length + '</b><span>' + esc(t.secured.map(C.label).join(', ') || 'Next time!') + '</span></div>' +
        '<div class="tile white"><span>Reviews passed</span><b>' + t.revOk + ' of ' + t.revDone + '</b><span>' + esc(t.retained.length ? t.retained.map(C.label).join(', ') + ' now retained' : 'Reviews keep skills fresh') + '</span></div>' +
        '<div class="tile white"><span>Fixed after a miss</span><b>' + t.fixed + '</b><span>Mistakes turned into right answers</span></div>' +
        '<div class="tile white"><span>Stayed on page</span><b>' + (t.leaves ? 'Left ' + t.leaves + '×' : 'Yes') + '</b><span>' + (t.leaves ? 'Next time, stay for the whole session' : 'The whole session') + '</span></div></div>'
        : '<h1 class="h2">Your skill map</h1><p class="sub" style="margin:0">Growth score: <b style="color:var(--blue)">' + th1 + '</b> after ' + st.sess + ' session' + (st.sess === 1 ? '' : 's') + '.</p>') +
      '<section class="card" style="gap:18px"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:12px"><h2 style="margin:0;font-size:22px">Your skill map</h2><span class="sub">Up next: <b style="color:var(--ink)">' + (fr ? esc(skName(fr)) : 'review') + '</b></span></div>' + map + '</section>' +
      (fromWait ? '<div><button type="button" class="btn" id="bk">Back</button></div>' : '') + '</div>';
    var bk = document.getElementById('bk'); if (bk) bk.onclick = function () { route(); };
    handoff();
  }

  /* ---------- ✋ Ask Mr. Crowell ---------- */
  // The student's screen (the question rebuilt from its template and seed, plus what they've entered so far) goes to the
  // dashboard with their name. They stay on the page, so the question doesn't swap. While the hand is up the question's
  // own clock (or the explanation's timer) stops, for at most C.P.askHold seconds; the session clock keeps going.
  var hand = null, askSig = '';
  function snapshot() {
    if (view === 'guided' && guided) return { view: 'guided', tid: guided.it.tid, seed: guided.it.seed, skill: guided.it.skill, vals: [], shown: 'Guided try, step ' + (guided.i + 1) };
    if (!it || (view !== 'item' && view !== 'explain')) return null;
    if (view === 'item') readVals();
    return { view: view, tid: it.tid, seed: it.seed, skill: it.skill, vals: vals, shown: C.shown(it, vals) };
  }
  function askUi() {
    var slot = document.getElementById('askSlot'); if (!slot) return;
    var can = !!(S.me && /^(item|explain|guided)$/.test(view) && !paused && !(meta && meta.mode === 'quiz'));
    var sig = hand ? 'h' + hand.repAt + (hand.hold ? 'f' : '') : can ? 'a' : '';
    if (sig === askSig && slot.childNodes.length === (sig ? 1 : 0)) return;
    askSig = sig;
    if (hand) {
      slot.innerHTML = '<span class="handbar" role="status"><b>✋ Mr. Crowell has your screen.</b> ' + (hand.reply ? '<span class="rep">' + esc(hand.reply) + '</span>' : '<span>' + (hand.hold ? 'Your question clock is stopped.' : 'Keep going.') + '</span>') + ' <button type="button" class="btn small" id="lowerB">Lower my hand</button></span>';
      document.getElementById('lowerB').onclick = function () { lowerHand(false); };
    } else if (can) {
      slot.innerHTML = '<button type="button" class="btn warm small" id="askB" title="Sends this screen to Mr. Crowell with your name. Stay on this page: your question won\'t change.">✋ Ask Mr. Crowell</button>';
      document.getElementById('askB').onclick = askDialog;
    } else slot.innerHTML = '';
  }
  function askDialog() {
    if (hand || document.getElementById('askD')) return;
    var o = document.createElement('div'); o.className = 'overlay'; o.id = 'askD';
    o.innerHTML = '<section class="dialog" role="dialog" aria-labelledby="askT"><h1 id="askT">✋ Ask Mr. Crowell</h1><p style="margin:0;font-size:19px">Your screen goes to Mr. Crowell with your name. Stay on this page: your question won\'t change, and its clock stops while you wait.</p>' +
      '<label for="askN" style="font-weight:700;font-size:18px">What are you stuck on? <span class="sub" style="font-weight:400">(optional)</span></label><textarea id="askN" class="ninp" maxlength="160" style="font-size:18px;min-height:70px"></textarea>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap"><button type="button" class="btn primary big" id="askGo">Send my screen</button><button type="button" class="btn" id="askNo">Cancel</button></div></section>';
    document.body.appendChild(o);
    var go = document.getElementById('askGo'), note = document.getElementById('askN');
    document.getElementById('askNo').onclick = function () { o.remove(); };
    note.focus();
    go.onclick = function () {
      var snap = snapshot(); if (!snap) { o.remove(); SFA.toast('Nothing to send on this screen. Raise your hand instead.'); return; }
      snap.note = note.value.trim().slice(0, 160);
      go.disabled = true; go.textContent = 'Sending…';
      S.call('climbAsk', { hand: snap }).then(function (j) {
        o.remove();
        hand = { at: now(), id: j.at || 0, hold: now(), reply: '', repAt: 0 };
        if (view === 'item' && meta && !meta.dev) meta.asked = true;
        if (T()) T().asks = (T().asks || 0) + 1;
        askSig = ''; askUi(); clearTimeout(pingTimer); pingTimer = setTimeout(ping, 4000);
      }, function (e) {
        go.disabled = false; go.textContent = 'Send my screen';
        SFA.toast(e.server && /unknown op/.test(e.message) ? 'Asking isn\'t switched on yet. Raise your hand.' : 'Couldn\'t send it. Raise your hand instead.', 5000);
      });
    };
  }
  function unhold() {
    if (!hand || !hand.hold) return;
    var gap = now() - hand.hold; hand.hold = 0;
    if (view === 'item' && meta) meta.deadline += gap;
    else if ((view === 'explain' || view === 'guided') && screenEnd) screenEnd += gap;
  }
  function lowerHand(byTeacher) {
    if (!hand) return;
    unhold(); hand = null; askSig = '';
    if (!byTeacher) S.call('climbAsk', { cancel: true }).then(null, function () { });
    askUi();
  }
  // from each ping: Mr. Crowell's reply, or "done"
  function handReply(h) {
    if (!hand || !h || (hand.id && h.at !== hand.id)) return;
    if (h.repAt && h.repAt !== hand.repAt) { hand.repAt = h.repAt; hand.reply = h.reply; askSig = ''; SFA.toast('Mr. Crowell: ' + h.reply, 7000); }
    if (h.status === 'answered') { lowerHand(true); if (!h.reply) SFA.toast('Mr. Crowell marked your question as answered.', 5000); }
  }

  /* ---------- the clock ---------- */
  var acct = document.getElementById('sfaAccount');
  function tick() {
    // the sign-in card stays out of the way while a question or the teaching loop is on screen
    if (acct) acct.hidden = !!(S.me && S.status !== 'signedout' && /^(item|graded|right|explain|guided|changed)$/.test(view));
    if (!sess) return;
    var left = sessLeft(), sl = document.getElementById('sleft'), sb = document.getElementById('sbarI');
    if (sl) sl.textContent = mmss(left) + ' left';
    if (sb) sb.style.width = Math.round(Math.min(1, Math.max(0, 1 - left / (sess.len * mult))) * 100) + '%';
    var cd = document.getElementById('cd'); if (cd && sess.start) cd.textContent = mmss(sess.start - now());
    if (view === 'wait' && sess.start && sess.state !== 'open' && now() >= sess.start && sess.state !== 'ended') return route();
    askUi();
    if (paused) return;
    if (hand && hand.hold && now() - hand.at > C.P.askHold * 1000) { unhold(); SFA.toast('Your question clock is running again. Keep your hand up: Mr. Crowell still has your screen.', 6000); }
    var tnow = hand && hand.hold ? hand.hold : now();
    if ((view === 'item' || view === 'explain' || view === 'guided' || view === 'right' || view === 'changed') && live() && left <= 0 && !(meta && meta.dev)) return finish();
    if (view === 'item' && meta) {
      var il = meta.deadline - tnow, ie = document.getElementById('ileft'), ring = document.getElementById('ring');
      if (ie) ie.textContent = mmss(il);
      if (ring) { var tot = (meta.limit || C.P.item) * 1000 + (meta.ext ? C.P.almost * 1000 : 0), fr = Math.max(0, il / tot); ring.setAttribute('stroke-dasharray', (188.5 * fr).toFixed(1) + ' 188.5'); ring.setAttribute('stroke', il < 20000 ? '#F97316' : '#1D4ED8'); }
      if (meta.mode === 'quiz' && sess && sess.quiz) meta.deadline = qEnd();
      var al = document.getElementById('almost'); if (al) al.hidden = !(meta.mode !== 'quiz' && il <= C.P.almost * 1000 && !meta.ext && T() && T().almost < C.P.almostPerSession);
      if (!(hand && hand.hold) && Date.now() - lastAct > C.P.idleSecs * 1000) meta.idle = true;
      if (il <= 0) { readVals(); submit(true); }
    }
    if ((view === 'explain' || view === 'guided') && screenEnd) {
      var sl2 = screenEnd - tnow, nx = document.getElementById('nxt'), nb = document.getElementById('nxtbar');
      if (nx) nx.textContent = 'Next screen in ' + mmss(sl2);
      if (nb) nb.style.width = Math.round(100 * (1 - sl2 / (C.P.explain * 1000))) + '%';
      if (sl2 <= 0) { screenEnd = 0; if (view === 'explain') afterExplain(); else toTwin(); }
    }
  }
  setInterval(tick, 250);

  /* ---------- start ---------- */
  if (!S || !S.on) { msg('Climb needs the class results sheet', 'Saving isn\'t switched on for this copy of the arcade.'); return; }
  S.onChange(function () {
    if (S.me && helloFor !== S.me.sid) { st = null; helloFor = ''; hello(); }
    if (!S.me) { st = null; helloFor = ''; }
    if (view === '' || view === 'signin' || (!S.me && view !== 'signin')) route();
  });
  route();
  window.CLIMB_APP = { state: function () { return st; }, session: function () { return sess; }, item: function () { return it; }, view: function () { return view; }, vals: function () { return vals; } };   // for checking in the browser console
  // practice pages only: show any template on demand, e.g. CLIMB_APP.show('RC-4i')
  if (window.CLIMB_MOCK) window.CLIMB_APP.show = function (tid, seed) { show({ tid: tid, seed: seed || C.newSeed(), mode: 'practice' }, { dev: true }); };
})();
