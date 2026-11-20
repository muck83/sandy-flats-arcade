/* 💦 Splash Squad: crews of three or four fill the Sandy Flats pond by launching each other into it. Loaded by
   sfa-lesson.js (after sfa-crewkit.js) when the teacher starts one.

   The console forms the crews itself: students are put in order of how much of today's lesson they have done and dealt
   out like cards (a snake draft), so every crew gets a mix of busy and quiet students. Nobody is told why.

   Each launch needs EVERY member: each member gets their own question (at their own tier, sfa-crewkit.js) and a right
   answer puts their "charge" in the crew's springboard. When every member's charge is in, the springboard fires one
   member (they take turns) across the screen into the pond, and the pond fills: 10 L a charge, +4 L for a charge that
   was right first time, +5 L for each power-up, +3 L for each hint a teammate sent. All the crews fill the SAME pond:
   make it overflow before the time runs out.

   Helping, but not answering for each other: a member whose charge is in sees what each teammate is working on (the
   question, never the answer) and can send a hint: it crosses out a wrong choice or gives the range the number is in.
   They can also answer power-up questions (two a launch at most, so a fast student cannot carry the crew).

   Nobody is knocked out: a miss gets a hint and another try. A member who has not touched their screen for 75 seconds
   is marked away for that launch (their seat is held, the crew is not stuck) and is back in the moment they do
   anything; their next charge is a comeback splash, +15 L for the crew. A charge that arrives just after a launch
   still counts (+10 L). The class screen never marks who is away or stuck; only teammates and the console see it.

   Sync like the Boss Raid: each student's running row (q "zwetx1") goes to the Sheet; the console referees and
   publishes in the live counts (zwets: state, length, goal, water, won, crews, students, salt, list number, launches;
   zwetid/zwetst: the start; zwetf0…: each student's fingerprint number in the game's order; zwett0…: their crew;
   zwetd/zweta/zweth/zwetk: charged, away, hinted and could-use-a-hint as bit lists; zwetr0…: each crew's launch
   number; zwetq0…: the question each student is on) and the spotlight (spot.q "zwet": "P:" a page of names and
   avatars, "#E:" the latest launches). */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, T = window.SFA_CREW;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zwetx1', AWAY = 75, BONUS_MAX = 2, PER = 10, FIRST = 4, BONUS = 5, HINT = 3, COMEBACK = 15, LATE = 90, ROUND_S = 85;
  var CREWS = ['🦦 Otters', '🦎 Geckos', '🐸 Frogs', '🦆 Ducks', '🐢 Turtles', '🦫 Beavers', '🐟 Minnows', '🦢 Swans', '🦀 Crabs', '🐙 Squids', '🦭 Seals', '🐧 Penguins', '🦩 Flamingos', '🐊 Gators', '🦈 Sharks', '🐳 Whales', '🐬 Dolphins', '🦞 Lobsters', '🐡 Puffers', '🦐 Shrimps'];

  function cat(c, pre) { var out = []; for (var k = 0; k < 6; k++) { var a = c[pre + k]; if (!Array.isArray(a)) break; out = out.concat(a); } return out; }
  function chunk(out, pre, arr, max) { for (var k = 0; k < max && (k === 0 || k * 12 < arr.length); k++) out[pre + k] = arr.slice(k * 12, k * 12 + 12); }
  function gameOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zwets) || !Array.isArray(c.zwetid)) return null;
    var z = c.zwets, id = A.decRun(c.zwetid), start = A.MODE === 'screen' ? id : A.decRun(c.zwetst) || id;
    var sp = Lv.spot && Lv.spot.q === 'zwet' ? String(Lv.spot.text || '') : '', ev = [], seq = 0, m = /#E:(\d+)\|([^#]*)/.exec(sp);
    if (m) { seq = +m[1]; ev = m[2] ? m[2].split(',').map(function (x) { var p = x.split('~'); return { t: +p[0] || 0, f: +p[1] || 0, w: +p[2] || 0, c: +p[3] || 0 }; }) : []; }
    return { id: id, start: start, state: z[0], dur: z[1] || 300, goal: z[2] || 500, water: z[3] || 0, win: !!z[4], nt: z[5] || 0, n: z[6] || 0, salt: z[7] || 0, ep: z[8] || 0, launches: z[9] || 0,
      fps: cat(c, 'zwetf'), tm: cat(c, 'zwett'), rounds: cat(c, 'zwetr'), cq: cat(c, 'zwetq'),
      done: c.zwetd || [], away: c.zweta || [], hint: c.zweth || [], stuck: c.zwetk || [], sp: sp, ev: ev, seq: seq };
  }
  function leftOf(b) { return Math.max(0, Math.round((b.start + b.dur * 1000 - T.sNow()) / 1000)); }
  function teamOf(b, i) { return T.unpack(b.tm, i, 21, 3) - 1; }
  function members(b, t) { var out = []; for (var i = 0; i < b.n; i++) if (teamOf(b, i) === t) out.push(i); return out; }
  function crewName(t) { return CREWS[t % CREWS.length]; }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null, crew = T.Crew(), quiz = null;
  var ban = T.Banners(function () { return !!root; });
  function key() { return 'splash.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function xp(n, once) { if (A.hero && ST && A.MODE === 'student') A.hero.add('w', String(Math.round(ST.id / 1000)) + (once ? 'e' : ''), n, once); }

  function sync() {
    var Lv = A.live(), b = A.isLive() || A.MODE === 'screen' ? gameOf(Lv) : null;
    if (b && A.MODE !== 'teach' && T.sNow() - b.start > b.dur * 1000 + 180000) b = null;
    if (A.MODE === 'student' && A.saving() && !A.S.me) b = null;
    if (!b) { close(); return; }
    if (!root || V.id !== b.id) open(b);
    apply(b);
  }
  function open(b) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === b.id ? saved : { id: b.id, k: 0, f: 0, n: 0, a: 0, aAt: 0, x: 0, b: [0, 0], h: [], sk: [0, 0], hx: 0, bq: 0, msg: '', done: 0 };
    V = { id: b.id, b: b, ep: b.ep, me: -1, t: -1, R: 0 }; crew = T.Crew();
    root = H('div', 'crw wt' + (A.MODE !== 'student' ? ' screen' : '')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Splash Squad');
    root.innerHTML = '<div class="crwhud"><h1>💦 Splash Squad</h1><span class="crwpill" id="wtT"></span><span class="crwpill" id="wtW"></span><span class="crwpill" id="wtL"></span><span class="crwsp"></span><span class="crwpill" id="wtS"></span></div>' +
      '<div class="crwbody"><div class="crwscene wtscene"><div class="wtsun">☀️</div><div class="wtteams"></div>' +
      '<div class="wtpond"><div class="wtwater"><span class="wtduck">🦆</span><span class="wtduck d2">🦆</span><span class="wtduck d3">🪷</span></div><div class="wtrim"></div><b class="wtlab"></b></div><div class="wtfx"></div></div>' +
      '<div class="crwside"><div class="crwcard wtteam"></div><div class="crwcard wtq"></div></div></div>';
    document.body.appendChild(root); document.body.classList.add('crwing');
    if (A.MODE === 'student') {
      quiz = T.Quiz({ st: function () { return ST; }, keep: keep, seed: T.hash(A.S.me ? A.S.me.sid : 'x') + Math.round(b.id / 1000) % 99991, redraw: function () { drawQ(); drawTeam(true); }, right: right, tried: tried });
      // still here: a touch or a key now and then tells the console this student has not walked away
      var act = function () { if (!ST || !V || V.b.state !== 1) return; var now = Date.now(); if (now - (ST.aAt || 0) > 20000) { ST.aAt = now; ST.a++; keep(); sendSoon(); } };
      root.addEventListener('pointerdown', act, true); root.addEventListener('keydown', act, true);
    }
    V.tick = setInterval(function () { if (root) drawTop(); }, 1000);
  }
  function close() {
    if (!root) return; clearInterval(V.tick); ban.clear();
    [].forEach.call(document.querySelectorAll('.wtfly'), function (x) { x.remove(); });
    root.remove(); root = null; V = null; quiz = null; document.body.classList.remove('crwing');
    var x = document.querySelector('.crwwatchx'); if (x) x.remove();
  }

  function apply(b) {
    var prev = V.prev; V.b = b;
    if (b.ep !== V.ep) { V.ep = b.ep; crew = T.Crew(); }
    crew.take(b.sp);
    if (A.MODE === 'student' && A.S.me) {
      V.me = b.fps.indexOf(T.fpn(A.S.me.sid, b.salt)); V.t = V.me >= 0 ? teamOf(b, V.me) : -1;
      if (V.me < 0 && b.state === 1 && !V.said) { V.said = 1; send(); }   // not in a crew yet: say hello so the console adds me
      var R = V.t >= 0 ? b.rounds[V.t] || 1 : 0;
      if (R !== V.R) {
        var was = V.R; V.R = R;
        if (was && R > was && ST.k >= was) { xp(6); SFA.toast('💦 Your crew launched! +6 XP for teamwork.', 2500); }
        if (ST.k < R) { ST.bq = 0; ST.msg = ''; var z = quiz.state(); if (z.fb && z.fb.ok) quiz.next(); quiz.newRound(); V.qsig = ''; }
      }
      // a teammate sent me a hint
      if (V.me >= 0 && b.state === 1 && T.bit(b.hint, V.me) && ST.hx !== R && ST.k < R && quiz.extra()) { ST.hx = R; keep(); SFA.toast('💡 A teammate sent you a hint!', 3000); V.qsig = ''; }
    }
    // launches, on every screen
    if (V.seen == null) V.seen = b.seq;
    else if (b.seq > V.seen) {
      var first = b.seq - b.ev.length + 1, k = 0;
      b.ev.forEach(function (e, i) { if (first + i > V.seen) { (function (e2, d) { setTimeout(function () { if (root) launchFx(e2); }, d); })(e, k * 700); k++; } });
      V.seen = b.seq;
    }
    if (prev && b.state === 2 && prev.state !== 2 && b.win) { var n = 0; (function c() { if (!root || n++ > 4) return; A.confetti(); setTimeout(c, 900); })(); }
    V.prev = b;
    drawTop(); drawTeams(); drawPond();
    if (A.MODE === 'student') {
      if (b.state === 2 && !ST.done && (ST.x || ST.n)) { ST.done = 1; keep(); xp(25 + (b.win ? 25 : 0), true); }
      drawTeam();
      var sig = [b.state, V.me, V.R, ST.k >= V.R, ST.bq, T.pool().length].join('|'); if (sig !== V.qsig) { V.qsig = sig; drawQ(); }
    }
    if (b.state === 2) ending(); else { var e = root.querySelector('.crwend'); if (e) e.remove(); var p = root.querySelector('.wtfinal'); if (p) p.remove(); }
  }

  function drawTop() {
    if (!root || !V) return;
    var b = V.b, g = function (id) { return root.querySelector('#' + id); };
    g('wtT').innerHTML = b.state === 1 ? '⏱ <b>' + T.mmss(leftOf(b)) + '</b>' : b.win ? '🌊 <b>Overflow!</b>' : '⏱ <b>Time</b>';
    g('wtW').innerHTML = '💧 <b>' + Math.min(b.water, 9999) + ' L</b> of ' + b.goal;
    g('wtL').innerHTML = '🤸 <b>' + b.launches + '</b> launch' + (b.launches === 1 ? '' : 'es');
    g('wtS').innerHTML = b.state !== 1 ? '' : A.MODE === 'student' && V.t >= 0 ? esc(crewName(V.t)) + ' · launch ' + V.R : b.nt + ' crews · every member charges, then one flies';
  }
  function drawPond() {
    var b = V.b, w = root.querySelector('.wtwater'), f = Math.min(1, b.water / Math.max(1, b.goal));
    w.style.height = (8 + f * 92) + '%';
    root.querySelector('.wtlab').textContent = Math.round(f * 100) + '% full';
    root.querySelector('.wtpond').className = 'wtpond' + (b.win ? ' over' : '');
  }
  // the crews' springboards: every crew on the class screen, my own crew on my device
  function drawTeams() {
    var b = V.b, box = root.querySelector('.wtteams'), sc = root.querySelector('.crwscene'), all = A.MODE !== 'student';
    var list = []; if (all) { for (var t = 0; t < b.nt; t++) list.push(t); } else if (V.t >= 0) list.push(V.t);
    var sig = [list.join(','), b.tm.join('.'), b.rounds.join('.'), b.done.join('.'), crew.key, sc.clientWidth, b.n, V.me, b.state].join('|');
    if (sig === V.tsig) return; V.tsig = sig;
    box.style.visibility = b.state === 2 ? 'hidden' : '';   // the ending has the stage to itself
    var per = all ? Math.max(1, Math.min(list.length, list.length > 6 ? Math.ceil(list.length / 2) : list.length)) : 1;
    var size = Math.max(26, Math.min(all ? 84 : 72, Math.floor(((sc.clientWidth || 600) * 0.94 / per - 26) / 4.4)));
    box.innerHTML = list.map(function (t) {
      var mem = members(b, t), R = b.rounds[t] || 1, fl = mem.length ? mem[(R - 1) % mem.length] : -1, dn = 0;
      var ms = mem.map(function (i) {
        var c = crew.get(i), d = T.bit(b.done, i); if (d) dn++;
        return '<div class="wtm' + (d ? ' done' : '') + (i === fl ? ' fly' : '') + (i === V.me ? ' me' : '') + '" data-i="' + i + '" style="width:' + size + 'px">' + (d ? '<i>⚡</i>' : '') + T.av(c.look, size, false) + '<span class="crwname ' + T.ncls(c.look) + '">' + esc(i === V.me ? 'You' : c.n || '…') + '</span></div>';
      }).join('');
      return '<div class="wtpad" data-t="' + t + '"><h3>' + esc(crewName(t)) + ' <small>💦 ×' + (R - 1) + '</small></h3><div class="wtmem">' + ms + '</div><div class="wtboard"></div><p>' + (b.state === 1 ? '⚡ ' + dn + ' of ' + mem.length + ' charged' : (R - 1) + ' launch' + (R === 2 ? '' : 'es')) + '</p></div>';
    }).join('') || '<p class="wtwait">Forming the crews…</p>';
  }
  // a launch: the flyer leaves the springboard, spins through the air and lands in the pond
  function launchFx(e) {
    if (!root) return;
    var b = V.b, mineT = A.MODE === 'student' && e.t === V.t, c = crew.get(e.f), pond = root.querySelector('.wtpond').getBoundingClientRect();
    var src = root.querySelector('.wtm[data-i="' + e.f + '"]'), pad = root.querySelector('.wtpad[data-t="' + e.t + '"]');
    if (pad) { pad.classList.remove('boing'); void pad.offsetWidth; pad.classList.add('boing'); }
    var who = esc(c.n || 'Someone'), txt = e.c === 2 ? '💧 A late charge from <b>' + esc(crewName(e.t)) + '</b>: +' + e.w + ' L' : (e.c === 1 ? '🌊 <b>COMEBACK SPLASH!</b> ' : '💦 ') + '<b>' + esc(crewName(e.t)) + '</b> launched <b>' + who + '</b>: +' + e.w + ' L';
    if (A.MODE !== 'student' || mineT) ban.say(txt, e.c === 1 ? 'spark' : 'good', e.c === 1 ? 2800 : 1900);
    if (e.c === 2) { splash(pond, e.w); return; }
    var r0 = src ? src.getBoundingClientRect() : { left: -80, top: pond.top - 200, width: 60, height: 70 };
    var size = Math.max(40, Math.round(r0.width)), f = H('div', 'wtfly', T.av(c.look, size, false) + '<span>' + ['WHEEE!', 'AAAAH!', 'YAHOO!', 'INCOMING!', 'COWABUNGA!', 'GERONIMO!'][(e.f + e.w) % 6] + '</span>');
    document.body.appendChild(f);
    var x0 = r0.left, y0 = r0.top, x1 = pond.left + pond.width * (0.3 + 0.4 * ((e.f * 37 % 100) / 100)) - size / 2, y1 = pond.top + pond.height * 0.35, hgt = Math.max(120, Math.abs(y1 - y0) * 0.5 + 140), kf = [];
    for (var i = 0; i <= 12; i++) { var t = i / 12; kf.push({ transform: 'translate(' + (x0 + (x1 - x0) * t).toFixed(1) + 'px,' + (y0 + (y1 - y0) * t - hgt * 4 * t * (1 - t)).toFixed(1) + 'px) rotate(' + Math.round(720 * t) + 'deg)' }); }
    var done = function () { f.remove(); if (root) splash(pond, e.w); };
    if (f.animate) { var an = f.animate(kf, { duration: 1500, easing: 'linear', fill: 'forwards' }); an.onfinish = done; setTimeout(function () { if (f.isConnected) done(); }, 2200); }
    else done();
  }
  function splash(pond, w) {
    var fx = root && root.querySelector('.wtfx'); if (!fx) return;
    var sc = root.querySelector('.crwscene').getBoundingClientRect(), s = H('div', 'wtsplash', '<span>💦</span><b>+' + w + ' L</b>');
    s.style.left = (pond.left - sc.left + pond.width / 2) + 'px'; s.style.top = (pond.top - sc.top + pond.height * 0.2) + 'px';
    fx.appendChild(s); setTimeout(function () { s.remove(); }, 1600);
    var wt = root.querySelector('.wtwater'); wt.classList.remove('slosh'); void wt.offsetWidth; wt.classList.add('slosh');
  }
  // the payoff. Overflow: a wave carries every avatar across the screen. Out of time: one last splash, everyone at once.
  function ending() {
    var b = V.b, sc = root.querySelector('.crwscene'), sig = [b.win, crew.key].join('|'); if (V.esig === sig) return; V.esig = sig;
    var old = sc.querySelector('.crwend'); if (old) old.remove(); var op = sc.querySelector('.wtfinal'); if (op) op.remove();
    var who = []; for (var i = 0; i < Math.max(b.n, crew.total); i++) if (crew.get(i).fp) who.push(crew.get(i));
    var e = H('div', 'crwend');
    e.innerHTML = b.win ? '<h1>THE POND OVERFLOWED!</h1><p>' + b.launches + ' launches by ' + b.nt + ' crews, and every one of them needed every member. Sandy Flats is now a water park. 🌊</p>'
      : '<h1>FINAL SPLASH!</h1><p>' + b.launches + ' launch' + (b.launches === 1 ? '' : 'es') + ' filled the pond to ' + Math.round(100 * Math.min(1, b.water / Math.max(1, b.goal))) + '%. Everybody in!</p>';
    sc.appendChild(e);
    var size = Math.max(30, Math.min(A.MODE !== 'student' ? 92 : 54, Math.floor((sc.clientWidth || 600) * 0.92 / Math.max(4, Math.min(who.length, 16)))));
    var p = H('div', 'wtfinal' + (b.win ? ' wave' : ' drop'));
    p.innerHTML = '<div class="wtsea"></div><div class="wtline">' + who.map(function (c, i) { return '<div class="wtbob" style="animation-delay:' + (b.win ? -(i * 0.31) % 2 : 0.4 + i * 0.13).toFixed(2) + 's">' + T.av(c.look, size, false) + '<i>' + ['🛟', '🏄', '🦆', '🤿', '🩴', '🛟'][i % 6] + '</i><span class="crwname ' + T.ncls(c.look) + '">' + esc(c.n) + '</span></div>'; }).join('') + '</div>';
    sc.appendChild(p);
  }

  /* ---------- my crew and my question (student) ---------- */
  function drawTeam(force) {
    var box = root && root.querySelector('.wtteam'); if (!box) return;
    var b = V.b;
    if (b.state === 2) {
      var I = A.hero ? A.hero.info() : null, h2 = '<p class="crwkick">Your crew</p><p class="wtstat">' + (V.t >= 0 ? esc(crewName(V.t)) + ' made <b>' + ((b.rounds[V.t] || 1) - 1) + '</b> launches. ' : '') + (ST.k ? 'You charged the springboard <b>' + ST.k + '</b> time' + (ST.k === 1 ? '' : 's') + (ST.h.length ? ' and sent <b>' + ST.h.length + '</b> hint' + (ST.h.length === 1 ? '' : 's') : '') + '. Your crew needed you.' : 'Next time, one right answer puts your charge in.') + '</p>' + (I ? '<p class="wtstat">⭐ Level ' + I.lv + ' ' + esc(I.title) + ' · ' + I.xp + ' XP</p>' : '');
      if (box._h !== h2) { box._h = h2; box.innerHTML = h2; } return;
    }
    if (V.me < 0 || V.t < 0) { var h0 = '<p class="crwkick">Your crew</p><p class="wtstat">Finding you a crew… a few seconds.</p>'; if (box._h !== h0) { box._h = h0; box.innerHTML = h0; } return; }
    var R = V.R, mem = members(b, V.t), fl = mem[(R - 1) % mem.length], iDone = ST.k >= R;
    var sig = [R, mem.map(function (i) { return [i, T.bit(b.done, i), T.bit(b.away, i), T.bit(b.stuck, i), T.bit(b.hint, i), T.unpack(b.cq, i, 100, 2)].join(':'); }).join(','), crew.key, iDone, ST.h.join(',')].join('|');
    if (!force && sig === box._h) return; box._h = sig;
    box.innerHTML = '';
    box.appendChild(H('p', 'crwkick', esc(crewName(V.t)) + ' · launch ' + R));
    box.appendChild(H('p', 'wtstat', 'Every member charges the springboard with one right answer. All charged = <b>' + (fl === V.me ? 'YOU fly' : esc(crew.get(fl).n || 'a teammate') + ' flies') + '</b> into the pond. 🤸'));
    var P = T.pool();
    mem.forEach(function (i) {
      var c = crew.get(i), me = i === V.me, d = me ? iDone : T.bit(b.done, i), aw = !d && T.bit(b.away, i), stuck = !d && T.bit(b.stuck, i), hinted = T.bit(b.hint, i);
      var row = H('div', 'wtrow' + (d ? ' done' : ''));
      row.innerHTML = '<div class="wtav">' + T.av(c.look, 38, false) + '</div><div class="wtwho"><b class="' + T.ncls(c.look) + '">' + esc(me ? 'You' : c.n || 'Teammate') + '</b><small>' + (d ? '⚡ charge is in' : aw ? '💤 away: their seat is held' : stuck ? '🤔 could use a hint' : hinted ? '💡 has a hint, working on it' : '✏️ working on it') + '</small></div>';
      if (!me && !d && !aw && iDone) {
        var Q = P[T.unpack(b.cq, i, 100, 2) - 1], sent = ST.h.indexOf(i + '.' + R) >= 0;
        if (Q) row.appendChild(H('p', 'wtpeek', '<small>Their question:</small> ' + esc(T.plain(Q.q).slice(0, 150))));
        var hb = el('button', { type: 'button', 'class': 'btn small' + (stuck && !sent && !hinted ? ' glow' : ''), text: sent || hinted ? '💡 Hint sent' : '💡 Send a hint' }); hb.disabled = sent || hinted;
        hb.onclick = function () { ST.h.push(i + '.' + R); ST.h = ST.h.slice(-6); xp(8); keep(); send(); if (window.SFA_AVATAR && SFA_AVATAR.note) try { SFA_AVATAR.note('help'); } catch (err) { }   /* 🤝 "helped a partner" effort credit (quests, sfa-avatar.js) */ SFA.toast('💡 Hint sent to ' + (c.n || 'your teammate') + '. +8 XP for helping.', 2500); drawTeam(true); };
        row.appendChild(hb);
      }
      box.appendChild(row);
    });
  }
  function right(first) {
    var R = V.R; ST.x++;
    if (ST.k < R) { ST.k = R; ST.f = first ? 1 : 0; ST.bq = 0; ST.sk = [R, 0]; xp(first ? 10 : 6); ST.msg = '<b>⚡ Your charge is in!</b>' + (first ? ' Right first time: +' + FIRST + ' L extra on the splash.' : ''); }
    else { if (ST.b[0] !== R) ST.b = [R, 0]; ST.b[1] = Math.min(BONUS_MAX, ST.b[1] + 1); ST.bq = 0; xp(6); ST.msg = '<b>💪 Power-up banked!</b> +' + BONUS + ' L on your crew\'s next splash.'; }
    keep(); send();
    return ST.msg;
  }
  function tried(Q, kind) { ST.n++; xp(2); if (ST.k < V.R) ST.sk = [V.R, kind]; keep(); sendSoon(); }
  function drawQ() {
    var box = root && root.querySelector('.wtq'); if (!box || !quiz) return;
    var b = V.b;
    if (b.state !== 1) { box.innerHTML = '<p class="crwq">' + (b.win ? '🌊 The pond overflowed. Surf\'s up!' : 'Time is up: everybody into the pond!') + '</p>'; return; }
    if (V.me < 0 || V.t < 0) { box.innerHTML = '<p class="crwq">Getting your first question ready…</p>'; return; }
    var R = V.R, iDone = ST.k >= R;
    if (iDone && !ST.bq) {
      var mem = members(b, V.t), waitN = mem.filter(function (i) { return i !== V.me && !T.bit(b.done, i) && !T.bit(b.away, i); }).length, bn = ST.b[0] === R ? ST.b[1] : 0;
      box.innerHTML = '';
      box.appendChild(H('div', 'crwfb good', ST.msg || '<b>⚡ Your charge is in!</b>'));
      box.appendChild(H('p', 'wtstat', waitN ? 'Waiting for <b>' + waitN + '</b> teammate' + (waitN === 1 ? '' : 's') + '. You can\'t answer for them, but you can <b>send a hint</b> (above) and talk them through it.' : 'Everyone is charged: launching…'));
      if (bn < BONUS_MAX) {
        var pb = el('button', { type: 'button', 'class': 'btn primary', text: '💪 Power-up question (+' + BONUS + ' L)' });
        pb.onclick = function () { ST.bq = 1; quiz.next(); keep(); drawQ(); };
        box.appendChild(pb);
      } else box.appendChild(H('p', 'wtstat', '💪 Both power-ups banked for this launch.'));
      return;
    }
    quiz.draw(box, { kick: iDone ? 'Power-up question · +' + BONUS + ' L' : 'Your charge · launch ' + R, go: iDone ? '💪 Power up' : '⚡ Charge' });
    send.q = quiz.state().cur; if (send.q !== send.sentQ) sendSoon();
  }
  var sendT = null;
  function send() {
    clearTimeout(sendT); if (A.MODE !== 'student' || !V || !ST) return;
    var z = quiz ? quiz.state() : { cur: -1 }, showQ = ST.k < V.R && !(z.fb && z.fb.end) ? z.cur : -1;
    send.sentQ = z.cur;
    A.record({ id: QID, k: 'open' }, 'w1;id:' + Math.round(V.id / 1000) + ';k:' + ST.k + ';f:' + ST.f + ';n:' + ST.n + ';a:' + ST.a + ';x:' + ST.x + ';q:' + showQ + ';br:' + ST.b[0] + ';bn:' + ST.b[1] + ';sr:' + ST.sk[0] + ';sv:' + ST.sk[1] + ';h:' + ST.h.join(','), null);
  }
  function sendSoon() { clearTimeout(sendT); sendT = setTimeout(send, 2500); }

  /* =========================== the teacher console =========================== */
  function C() { return A.console_().splash; }
  function ev(K, e) { K.ev.push(e); K.ev = K.ev.slice(-6); K.seq++; }
  function pickSalt() {
    var ids = A.rosterIn().map(function (r) { return r.sid; });
    for (var s = 1; s < 200; s++) { var seen = {}, ok = true; for (var i = 0; i < ids.length; i++) { var f = T.fpn(ids[i], s); if (seen[f]) { ok = false; break; } seen[f] = 1; } if (ok) return s; }
    return 1;
  }
  function addStudent(K, sid, t) {
    if (K.idx[sid] != null || K.order.length >= 60) return;
    if (t == null) {   // someone arriving late: the smallest crew (a new crew once they are all full)
      var best = -1; K.teams.forEach(function (tm, i) { if (best < 0 || tm.m.length < K.teams[best].m.length) best = i; });
      if (best < 0 || (K.teams[best].m.length >= 5 && K.teams.length < 20)) { K.teams.push({ r: 1, m: [], n: 0, hints: 0 }); best = K.teams.length - 1; }
      t = best;
      var e = (Date.now() - K.id) / 1000; if (K.state === 1 && e < K.dur / 2) K.goal = Math.min(9999, K.goal + Math.round(14 * (K.dur - e) / ROUND_S * 0.8 / 5) * 5);
    }
    K.idx[sid] = K.order.length; K.order.push(sid); K.team[sid] = t; K.teams[t].m.push(sid); K.act[sid] = Date.now();
  }
  function start(mins) {
    if (!T.pool().length) { SFA.toast('This lesson has no number or multiple-choice questions for Splash Squad.', 4500); return false; }
    var who = T.active(), str = T.strengths(), n = who.length, nT = Math.max(1, Math.ceil(n / 4)), t0 = Math.round(Date.now() / 1000) * 1000, dur = Math.round((mins || 6) * 60), K;
    // a snake draft down the order of how much each student has done today: every crew gets busy and quiet students
    var order = T.shuffle(who, Math.random).sort(function (a, b) { return (str[b] || 0) - (str[a] || 0); });
    A.console_().splash = K = { id: t0, state: 1, dur: dur, goal: Math.max(60, Math.min(9999, Math.round(Math.max(2, n) * 14 * dur / ROUND_S * 0.8 / 10) * 10)), water: 0, win: false, salt: pickSalt(), ep: Math.floor(Math.random() * 9000) + 1,
      order: [], idx: {}, team: {}, teams: [], rows: {}, act: {}, awayF: {}, exc: {}, back: {}, hint: {}, solved: {}, cred: {}, ev: [], seq: 0, launches: 0, page: 0 };
    for (var i = 0; i < nT; i++) K.teams.push({ r: 1, m: [], n: 0, hints: 0 });
    var slot = []; order.forEach(function (sid, i2) { var pass = Math.floor(i2 / nT), pos = i2 % nT; slot.push({ sid: sid, t: pass % 2 ? nT - 1 - pos : pos }); });
    // crew by crew, so each crew's members sit together in the list
    for (var t = 0; t < nT; t++) slot.forEach(function (x) { if (x.t === t) addStudent(K, x.sid, t); });
    A.pushLive(); A.consolePanel(); return true;
  }
  function parseRow(s) {
    var qm = /;q:(-?\d+)/.exec(s), hm = /;h:([0-9.,]*)/.exec(s);
    return { k: T.getN(s, 'k'), f: T.getN(s, 'f'), n: T.getN(s, 'n'), a: T.getN(s, 'a'), x: T.getN(s, 'x'), q: qm ? +qm[1] : -1, br: T.getN(s, 'br'), bn: T.getN(s, 'bn'), sr: T.getN(s, 'sr'), sv: T.getN(s, 'sv'),
      h: hm && hm[1] ? hm[1].split(',').map(function (x) { var p = x.split('.'); return [+p[0], +p[1]]; }) : [] };
  }
  function agg() {
    var K = C(); if (!K || !A.rosterIn().length) return;
    if (K.restoring) rebuild(K);
    var last = T.rows(QID, 'id:' + Math.round(K.id / 1000) + ';'), now = Date.now(), quiet = !!K.restored, changed = false, inR = {};
    A.rosterIn().forEach(function (r) { inR[r.sid] = 1; });
    if (K.state === 1) T.active().concat(Object.keys(last)).forEach(function (sid) { if (K.idx[sid] == null && inR[sid]) { addStudent(K, sid); changed = true; } });
    Object.keys(last).forEach(function (sid) {
      if (K.idx[sid] == null) return;
      var row = parseRow(String(last[sid].answer)), old = K.rows[sid], tm = K.teams[K.team[sid]];
      if (!old || old.n !== row.n || old.a !== row.a || old.k !== row.k || old.bn !== row.bn || old.x !== row.x || old.q !== row.q || old.sv !== row.sv || old.h.length !== row.h.length) {
        changed = true;
        if (!quiet && (!old || old.n !== row.n || old.a !== row.a || old.k !== row.k || old.x !== row.x)) {
          K.act[sid] = now; delete K.exc[sid];
          if (K.awayF[sid]) { delete K.awayF[sid]; K.back[sid] = 1; }
        }
      }
      K.rows[sid] = row;
      if (quiet) { if (row.k) { K.solved[sid] = 1; K.cred[sid] = Math.min(row.k, tm.r - 1); } return; }
      // a charge that arrived just after its launch still fills the pond
      if (K.state === 1 && row.k > (K.cred[sid] || 0) && row.k < tm.r) { K.cred[sid] = row.k; K.solved[sid] = 1; delete K.back[sid]; K.water = Math.min(9999, K.water + PER); ev(K, { t: K.team[sid], f: K.idx[sid], w: PER, c: 2 }); changed = true; }
      // hints for teammates, this launch only
      row.h.forEach(function (p) { var to = K.order[p[0]]; if (to && to !== sid && K.team[to] === K.team[sid] && p[1] === tm.r && K.hint[to] !== tm.r && !((K.rows[to] || {}).k >= tm.r)) { K.hint[to] = tm.r; tm.hints = (tm.hints || 0) + 1; changed = true; } });
    });
    delete K.restored;
    if (changed) tick(true);
  }
  function doneIn(K, sid, R) { return ((K.rows[sid] || {}).k || 0) >= R; }
  function launch(K, t) {
    var tm = K.teams[t], R = tm.r, dn = tm.m.filter(function (sid) { return doneIn(K, sid, R); }), e = (Date.now() - K.id) / 1000, come = 0;
    var w = dn.length * PER + (tm.hints || 0) * HINT;
    dn.forEach(function (sid) {
      var row = K.rows[sid]; if (row.k === R && row.f) w += FIRST; if (row.br === R) w += Math.min(BONUS_MAX, row.bn) * BONUS;
      if (K.back[sid] || (!K.solved[sid] && e >= LATE)) { come++; w += COMEBACK; }
      delete K.back[sid]; K.solved[sid] = 1; K.cred[sid] = R;
    });
    var flyer = tm.m[(R - 1) % tm.m.length];
    K.water = Math.min(9999, K.water + w); tm.r++; tm.n++; tm.hints = 0; K.launches++;
    var nowL = Date.now(); tm.m.forEach(function (sid) { K.act[sid] = nowL; });   // a new question: everyone gets a fresh "still here" clock
    ev(K, { t: t, f: K.idx[flyer], w: w, c: come ? 1 : 0 });
  }
  function end() {
    var K = C(); if (!K) return;
    // 🏆 the trophy shelf (trophies.html): ic, title and sub are ready to show as they are
    if (K.state === 1 && K.order.length && A.trophy) {
      A.trophy({ k: 'splash', id: K.id, win: !!K.win, ic: K.win ? '🌊' : '💦', title: K.win ? 'Splash Squad: the pond overflowed' : 'Splash Squad: ' + Math.round(K.water) + ' L of ' + K.goal + ' L',
        sub: K.launches + ' launch' + (K.launches === 1 ? '' : 'es') + ' · ' + K.teams.length + ' crew' + (K.teams.length === 1 ? '' : 's') + ' · ' + K.order.length + ' students', water: Math.round(K.water), goal: K.goal, launches: K.launches, crews: K.teams.length, n: K.order.length });
    }
    K.state = 2; K.endedAt = Date.now(); (A.pushNow || A.pushLive)(); A.consolePanel(); }
  function tick(force) {
    var K = C(); if (!K) return;
    if (K.restoring) { if (A.rosterIn().length) agg(); return; }
    var now = Date.now(), e = (now - K.id) / 1000, push = !!force;
    if (K.state === 1) {
      K.teams.forEach(function (tm, t) {
        if (!tm.m.length || tm.r > 9000) return;
        var R = tm.r, dn = 0, here = 0;
        tm.m.forEach(function (sid) {
          var d = doneIn(K, sid, R);
          if (!d && !K.awayF[sid] && (K.exc[sid] || now - (K.act[sid] || K.id) > AWAY * 1000)) { K.awayF[sid] = 1; push = true; }
          if (d) dn++; if (d || !K.awayF[sid]) here++;
        });
        if (dn && dn >= here) { launch(K, t); push = true; }
      });
      if (K.water >= K.goal) { K.win = true; end(); return; }
      if (e >= K.dur) { end(); return; }
    }
    var pg = Math.floor(e / 4) % Math.max(1, Math.ceil(K.order.length / 12)); if (pg !== K.page) { K.page = pg; push = true; }
    if (push || now - (K.lastPush || 0) >= 4000) { K.lastPush = now; (A.pushNow || A.pushLive)(); if (K.state === 1) A.consolePanel(); }
    if (root && V && V.watch) apply(watchState());
  }
  var RAWK = ['zwetid', 'zwetst', 'zwets', 'zwetd', 'zweta', 'zweth', 'zwetk'];
  function counts(out) {
    var K = C(); if (!K) return;
    if (K.restoring) { Object.keys(K.raw.counts).forEach(function (k) { out[k] = K.raw.counts[k]; }); return; }
    var rOf = function (sid) { return K.teams[K.team[sid]].r; }, row = function (sid) { return K.rows[sid] || {}; };
    out.zwetid = A.encRun(K.id); out.zwetst = A.encRun(K.id + (A.console_().skew || 0));
    out.zwets = [K.state, Math.min(9999, K.dur), K.goal, Math.round(K.water), K.win ? 1 : 0, K.teams.length, K.order.length, K.salt, K.ep, Math.min(9999, K.launches)];
    chunk(out, 'zwetf', K.order.map(function (sid) { return T.fpn(sid, K.salt); }), 5);
    chunk(out, 'zwett', T.encPack(K.order.map(function (sid) { return K.team[sid] + 1; }), 21, 3), 2);
    out.zwetd = T.encBits(K.order.map(function (sid) { return doneIn(K, sid, rOf(sid)); }));
    out.zweta = T.encBits(K.order.map(function (sid) { return !!K.awayF[sid] && !doneIn(K, sid, rOf(sid)); }));
    out.zweth = T.encBits(K.order.map(function (sid) { return K.hint[sid] === rOf(sid); }));
    out.zwetk = T.encBits(K.order.map(function (sid) { var w = row(sid); return w.sr === rOf(sid) && w.sv > 0 && !doneIn(K, sid, rOf(sid)); }));
    chunk(out, 'zwetr', K.teams.map(function (tm) { return Math.min(9999, tm.r); }), 2);
    chunk(out, 'zwetq', T.encPack(K.order.map(function (sid) { var w = row(sid); return w.q >= 0 && w.q < 99 ? w.q + 1 : 0; }), 100, 2), 3);
  }
  function crewList(K) { var L = T.looks(); return K.order.map(function (sid) { return { fp: T.sh3(sid), n: T.nameOf(sid), look: T.lookOf(L, sid) }; }); }
  function spot(all) {
    var K = C(); if (K.restoring) return K.raw.spot;
    var E = '#E:' + K.seq + '|' + K.ev.map(function (e) { return [e.t, e.f, e.w, e.c].join('~'); }).join(',');
    return { q: 'zwet', text: (T.crewPage(crewList(K), all ? 0 : K.page || 0, all ? 999 : 12) + E).slice(0, all ? 99999 : 600) };
  }
  // the console was reloaded mid-game: keep publishing what was live until the roster is in, then pick the crews back up
  function restore(Lv) {
    var b = gameOf(Lv); if (!b) return false;
    if (b.state === 2 || Date.now() - b.id > b.dur * 1000 + 60000) { A.console_().splash = null; return false; }
    var raw = {}; Object.keys(Lv.counts).forEach(function (k) { if (/^zwet/.test(k)) raw[k] = Lv.counts[k]; });
    A.console_().splash = { id: b.id, state: 1, dur: b.dur, goal: b.goal, water: b.water, win: false, salt: b.salt, ep: b.ep, restoring: b, raw: { counts: raw, spot: Lv.spot && Lv.spot.q === 'zwet' ? Lv.spot : null },
      order: [], idx: {}, team: {}, teams: [], rows: {}, act: {}, awayF: {}, exc: {}, back: {}, hint: {}, solved: {}, cred: {}, ev: [], seq: b.seq, launches: b.launches, page: 0 };
    return true;
  }
  function rebuild(K) {
    var b = K.restoring, by = {}; A.rosterIn().forEach(function (r) { by[T.fpn(r.sid, b.salt)] = r.sid; });
    for (var t = 0; t < b.nt; t++) K.teams.push({ r: b.rounds[t] || 1, m: [], n: (b.rounds[t] || 1) - 1, hints: 0 });
    for (var i = 0; i < b.n; i++) { var sid = by[b.fps[i]] || ('?' + i), tt = Math.max(0, Math.min(K.teams.length - 1, teamOf(b, i))); if (!K.teams.length) K.teams.push({ r: 1, m: [], n: 0, hints: 0 }); K.idx[sid] = i; K.order.push(sid); K.team[sid] = tt; K.teams[tt].m.push(sid); K.act[sid] = Date.now(); if (T.bit(b.away, i)) K.awayF[sid] = 1; }
    delete K.restoring; delete K.raw; K.restored = true;
  }
  function watchState() { var out = {}; counts(out); var b = gameOf({ lesson: A.LID, counts: out, spot: spot(true) }); b.start = C().id; return b; }
  function watch() {
    if (C().restoring) return;
    var b = watchState(); open(b); V.watch = true; apply(b);
    var x = el('button', { type: 'button', 'class': 'btn primary crwwatchx', text: '✕ Back to the console' }); x.onclick = function () { close(); }; document.body.appendChild(x);
  }
  function section(p) {
    var K = C(), sec = H('div', 'sect'), now = Date.now();
    sec.appendChild(H('h3', '', '💦 Splash Squad'));
    if (K.restoring) { sec.appendChild(H('p', 'muted', 'Picking the crews back up…')); p.appendChild(sec); return; }
    var left = Math.max(0, Math.round(K.dur - (now - K.id) / 1000));
    sec.appendChild(H('p', '', (K.state === 1 ? '<b>' + T.mmss(left) + '</b> left · ' : K.win ? '<b>🌊 The pond overflowed!</b> · ' : '<b>Time: the final splash.</b> ') + '💧 <b>' + Math.round(K.water) + ' L</b> of ' + K.goal + ' · 🤸 ' + K.launches + ' launch' + (K.launches === 1 ? '' : 'es') + ' · ' + K.teams.length + ' crew' + (K.teams.length === 1 ? '' : 's') + ', ' + K.order.length + ' students'));
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show the pond', title: 'The pond on this screen', onclick: function () { watch(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +1 minute', onclick: function () { K.dur += 60; A.pushLive(); A.consolePanel(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End it now', onclick: function () { end(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().splash = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    var dd = T.fold('g-splash', '📋 The crews · only you see this', true);
    K.teams.forEach(function (tm, t) {
      var line = H('p', 'muted', '<b>' + esc(crewName(t)) + '</b> · launch ' + tm.r + ' · ');
      tm.m.forEach(function (sid, j) {
        var w = K.rows[sid] || {}, d = doneIn(K, sid, tm.r), aw = !d && K.awayF[sid], stuck = !d && w.sr === tm.r && w.sv > 0;
        line.appendChild(document.createTextNode((j ? ' · ' : '') + (K.state !== 1 ? '' : d ? '⚡ ' : aw ? '💤 ' : stuck ? '🤔 ' : '✏️ ') + (T.nameOf(sid) || '?') + (K.state !== 1 ? ' ' + (w.k || 0) + ' charge' + (w.k === 1 ? '' : 's') + (w.h && w.h.length ? ', ' + w.h.length + ' hint' + (w.h.length === 1 ? '' : 's') : '') : '')));
        if (K.state === 1 && !d && !aw) { var xb = el('button', { type: 'button', 'class': 'btn small', text: 'launch without', title: 'Hold this student\'s seat for this launch so the crew is not stuck. They are back in as soon as they do anything.' }); xb.style.marginLeft = '4px'; xb.onclick = function () { K.exc[sid] = 1; tick(true); A.consolePanel(); }; line.appendChild(xb); }
      });
      dd.appendChild(line);
    });
    if (K.state === 1) dd.appendChild(H('p', 'muted', '⚡ charged · ✏️ working · 🤔 missed one, could use a hint · 💤 nothing for ' + AWAY + ' s (seat held: the crew launches without them, and their next charge is a comeback splash).'));
    sec.appendChild(dd);
    p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 1000);

  (function css() {
    if (document.getElementById('sfaWetCss')) return;
    var c = document.createElement('style'); c.id = 'sfaWetCss';
    c.textContent = [
      '.crw.wt{background:#0c2233}',
      '.wtscene{background:linear-gradient(#58c4ff 0%,#a9e4ff 46%,#c9f2c2 46.5%,#7fd070 100%);display:flex;flex-direction:column}',
      '.wtsun{position:absolute;right:3%;top:2%;font-size:clamp(30px,5vw,70px);animation:wtspin 30s linear infinite}@keyframes wtspin{to{transform:rotate(360deg)}}',
      '.wtteams{position:relative;z-index:2;flex:1;min-height:0;display:flex;flex-wrap:wrap;justify-content:center;align-content:center;gap:10px 14px;padding:8px 8px 4px;overflow:hidden}',
      '.wtwait{font-weight:800;font-size:20px;color:#0c2233}',
      '.wtpad{background:rgba(255,255,255,.82);color:#141428;border:3px solid #141428;border-radius:16px;padding:4px 10px 6px;text-align:center;box-shadow:0 6px 0 rgba(0,0,0,.25)}',
      '.wtpad h3{margin:0;font:400 clamp(14px,1.7vw,24px) "Luckiest Guy",system-ui;letter-spacing:.02em}.wtpad h3 small{font:800 .7em "Bricolage Grotesque",system-ui;color:#0b6fb3}',
      '.wtpad p{margin:2px 0 0;font-weight:800;font-size:clamp(11px,1.2vw,16px)}',
      '.wtmem{display:flex;justify-content:center;align-items:flex-end;gap:3px;padding-top:12px}',
      '.wtm{position:relative;display:flex;flex-direction:column;align-items:center}.wtm svg{width:100%;height:auto;display:block}.wtm .crwname{color:#141428;text-shadow:none;max-width:100%;overflow:hidden;text-overflow:ellipsis}',
      '.wtm i{position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-style:normal;font-size:16px;animation:wtzap .6s ease-in-out infinite alternate}@keyframes wtzap{from{transform:translateX(-50%) scale(.8)}to{transform:translateX(-50%) scale(1.2)}}',
      '.wtm.done svg{filter:drop-shadow(0 0 6px #FFC400)}.wtm.fly:after{content:"🤸 next";position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:800;white-space:nowrap;color:#0b6fb3}',
      '.wtm.me .crwname{background:#FFE14D;border-radius:6px;padding:0 4px}',
      '.wtboard{height:8px;margin:14px 6px 0;border-radius:5px;background:repeating-linear-gradient(90deg,#c9772e 0 14px,#a85f20 14px 16px);border:2px solid #141428;transform-origin:10% 50%}',
      '.wtpad.boing .wtboard{animation:wtboing .7s ease-out}.wtpad.boing{animation:wtpadb .5s ease-out}',
      '@keyframes wtboing{0%{transform:rotate(0)}25%{transform:rotate(-9deg)}50%{transform:rotate(6deg)}75%{transform:rotate(-3deg)}100%{transform:rotate(0)}}@keyframes wtpadb{0%{transform:translateY(0)}30%{transform:translateY(7px)}100%{transform:translateY(0)}}',
      '.wtpond{position:relative;z-index:2;flex:none;align-self:center;width:min(78%,900px);height:30%;min-height:84px;margin:0 0 2%;border-radius:0 0 46% 46%/0 0 90% 90%;background:#6b4a2b;border:5px solid #141428;border-top:0;overflow:hidden;box-shadow:inset 0 -14px 0 rgba(0,0,0,.2)}',
      '.wtwater{position:absolute;left:0;right:0;bottom:0;height:8%;background:linear-gradient(#7fdcff,#1c8fd6 60%,#0d5fa3);transition:height 1.6s cubic-bezier(.3,1.4,.5,1) 1.3s;border-top:4px solid #dff6ff}',
      '.wtwater.slosh{animation:wtslosh .9s ease-out}@keyframes wtslosh{0%{transform:scaleY(1)}30%{transform:scaleY(1.12)}60%{transform:scaleY(.96)}100%{transform:scaleY(1)}}.wtwater{transform-origin:50% 100%}',
      '.wtduck{position:absolute;top:-.95em;left:22%;font-size:clamp(18px,2.6vw,36px);animation:wtduck 3s ease-in-out infinite}.wtduck.d2{left:64%;animation-delay:-1.2s}.wtduck.d3{left:44%;animation-delay:-2s;font-size:clamp(14px,2vw,26px)}',
      '@keyframes wtduck{0%,100%{transform:translate(0,0) rotate(-4deg)}50%{transform:translate(14px,3px) rotate(5deg)}}',
      '.wtlab{position:absolute;left:0;right:0;bottom:8px;text-align:center;font:400 clamp(16px,2.4vw,34px) "Luckiest Guy",system-ui;color:#fff;text-shadow:0 2px 0 #141428}',
      '.wtpond.over{overflow:visible}.wtpond.over .wtwater{height:118%!important}',
      '.wtfx{position:absolute;inset:0;pointer-events:none;z-index:6}',
      '.wtsplash{position:absolute;transform:translate(-50%,-50%);text-align:center;animation:wtsp 1.5s ease-out forwards}.wtsplash span{display:block;font-size:clamp(40px,8vw,110px);line-height:1}.wtsplash b{font:400 clamp(20px,3.4vw,46px) "Luckiest Guy",system-ui;color:#fff;text-shadow:0 3px 0 #0d5fa3}',
      '@keyframes wtsp{0%{transform:translate(-50%,-30%) scale(.3);opacity:0}20%{transform:translate(-50%,-60%) scale(1.2);opacity:1}100%{transform:translate(-50%,-130%) scale(1);opacity:0}}',
      '.wtfly{position:fixed;left:0;top:0;z-index:97;pointer-events:none;will-change:transform}.wtfly span{position:absolute;left:50%;top:-18px;transform:translateX(-50%);font:400 16px "Luckiest Guy",system-ui;color:#fff;text-shadow:0 2px 0 #141428;white-space:nowrap}',
      '.wtstat{margin:0 0 6px;font-size:15px;line-height:1.35}.wtstat b{color:#FFE14D}',
      '.wtrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:6px 0;border-top:1px solid rgba(255,255,255,.12)}.wtrow.done .wtav{filter:drop-shadow(0 0 5px #FFC400)}',
      '.wtav{flex:none;width:38px}.wtav svg{display:block}.wtwho{flex:1;min-width:110px;line-height:1.15}.wtwho small{display:block;opacity:.85}',
      '.wtpeek{flex-basis:100%;margin:0;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.08);font-size:14px}.wtpeek small{color:#9FE8FF;font-weight:800;text-transform:uppercase;font-size:11px}',
      '.wtfinal{position:absolute;inset:0;z-index:7;pointer-events:none;overflow:hidden}',
      '.wtsea{position:absolute;left:-10%;right:-10%;bottom:0;height:44%;background:radial-gradient(60px 26px at 60px 0,transparent 98%,#1c8fd6 100%) 0 0/120px 100%,linear-gradient(transparent 24px,#1c8fd6 24px);opacity:.92;animation:wtsea 3s linear infinite}',
      '@keyframes wtsea{to{background-position:120px 0,0 0}}',
      '.wtline{position:absolute;left:2%;right:2%;bottom:24%;display:flex;flex-wrap:wrap-reverse;justify-content:center;align-items:flex-end;gap:2px 6px}',
      '.wtbob{position:relative;display:flex;flex-direction:column;align-items:center;animation:wtbob 2s ease-in-out infinite}.wtbob i{font-style:normal;font-size:1.3em;margin-top:-.7em;line-height:1}',
      '@keyframes wtbob{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-16px) rotate(6deg)}}',
      '.wtfinal.wave .wtline{animation:wtsurf 9s ease-in-out infinite alternate}@keyframes wtsurf{from{transform:translateX(-7%)}to{transform:translateX(7%)}}',
      '.wtfinal.wave .wtsea{height:52%}',
      '.wtfinal.drop .wtbob{animation:wtdrop 1.1s cubic-bezier(.5,0,.8,.6) both,wtbob 2s ease-in-out 1.6s infinite}',
      '@keyframes wtdrop{0%{transform:translateY(-90vh) rotate(-200deg)}80%{transform:translateY(20px) rotate(0)}100%{transform:translateY(0)}}',
      '@media (max-width:820px){.wtpond{height:34%}.wtteam{order:2}}',
      '@media (prefers-reduced-motion:reduce){.wtsun,.wtduck,.wtbob,.wtsea,.wtm i{animation:none!important}}'
    ].join('\n');
    document.head.appendChild(c);
  })();

  window.SFA_SPLASH = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: function () { return spot(); }, restore: restore, gameOf: gameOf };
})();
