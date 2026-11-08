/* ⚔️ Lane Clash: the 5-minute team battle at the end of a live lesson. Loaded by sfa-lesson.js when a battle starts,
   with sfa-engine.js (the films' cut-paper characters), sfa-sprites.js and sfa-lanes.js (the rules).

   How it stays in sync through a slow Sheet: students place units; each placement waits 8 s in its gate. Every page
   sends one running list of its placements (an answer row, q "zclash"). The teacher console checks them (coins,
   levels, cooldowns), runs the real battle and sends a snapshot of the board with the live state about once a second.
   Every student page and the class screen take the newest snapshot and play the battle forward themselves, so it
   moves smoothly in between. Teams, shout-outs and MVPs ride in the spotlight slot (spot.q "zclash"). */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, L = window.SFA_LANES, SP = window.SFA_SPRITES, SFA = window.SFA, esc = SFA.esc;
  if (!A || !L || !SP) return;
  var H = A.H, el = A.el, fmt = A.fmt;
  var COOL_MS = 5000, BOARD_CAP = 70, PUSH_MS = 1000, BRIEF = 40, RALLY_FIRST = 600, RALLY_EVERY = 900, RALLY_WIN = 200, RALLY_SHOW = 70, RALLY_NEED = 0.6;   // rallies: in ticks (0.1 s). BRIEF: seconds of rules on every screen before the battle clock starts
  var TEAMS = [['Team Llama', '🦙', '#FFC94A'], ['Team Toaster', '🍞', '#5CC8FF'], ['The Wobbly Penguins', '🐧', '#FFC94A'], ['The Angry Croissants', '🥐', '#5CC8FF'], ['The Pickle Pirates', '🥒', '#FFC94A'], ['Captain Noodle\'s Crew', '🍜', '#5CC8FF'], ['The Disco Cats', '🐱', '#FFC94A'], ['The Grumpy Clouds', '☁️', '#5CC8FF']];
  var TC = ['#FFC94A', '#5CC8FF'];   // team colours: gold on the left, sky on the right
  function teamNames(id) { var k = Math.round(id / 1000) % 4; return [{ name: TEAMS[k * 2][0], e: TEAMS[k * 2][1] }, { name: TEAMS[k * 2 + 1][0], e: TEAMS[k * 2 + 1][1] }]; }
  function hashTeam(sid, id) { var h = 5381, t = String(sid) + ':' + Math.round(id / 1000); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h & 1; }
  function sh3(sid) { var h = 5381, t = String(sid); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return (h % 46656).toString(36); }
  function teamOf(sid, id, t0) { return t0 ? (t0[sid] || t0['#' + sh3(sid)] ? 0 : 1) : hashTeam(sid, id); }
  function decRun(a) { return A.decRun(a); }
  // the id of a student's k-th placement on the board (j: the next try if that id is busy). The console gives it and the
  // student's page works it out too, so a page knows exactly which characters are its own, and which were turned away
  function pid(sid, id, k, j) { var h = 5381, t = String(sid) + ':' + Math.round(id / 1000) + ':' + k + ':' + (j || 0); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return 1 + h % 9998; }
  var WHY = { h: 'you had already sent your avatar', u: 'your avatar wasn\'t unlocked on the console yet', g: 'it got scrambled on the way', l: 'your hero level hadn\'t reached the console yet', c: 'the console counted fewer coins for you', r: 'it was still recharging', f: 'your team\'s lanes were packed', s: 'a teammate took the last planting spot in that lane first' };

  // the battle in the live state: id (also names the teams), start in server time, and the board
  function clashOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zcs) || !Array.isArray(c.zcid)) return null;
    var st = A.MODE === 'screen' ? decRun(c.zcid) : decRun(c.zcst) || decRun(c.zcid), dur = c.zcs[5] || L.DUR;
    if (A.MODE !== 'teach' && sNow() - st > dur * 100 + 180000) return null;   // over 3 minutes past its end: stale
    return { id: decRun(c.zcid), start: A.MODE === 'screen' ? decRun(c.zcid) : decRun(c.zcst) || decRun(c.zcid), state: c.zcs[3], t: c.zcs[0], score: [c.zcs[1], c.zcs[2]], dur: c.zcs[5] || L.DUR, brief: c.zcs[6] || 0, rally: Array.isArray(c.zcr) ? { no: c.zcr[0], st: c.zcr[1], q: c.zcr[2], at: c.zcr[3], r: [c.zcr[4], c.zcr[6]], of: [c.zcr[5], c.zcr[7]], won: [c.zcr[8], c.zcr[9]], ln: [c.zcr[10], c.zcr[11]] } : null };
  }
  // the spotlight slot: "U:fingerprint,…#E:seq~kind~name~team~lane~type~n;…#R:placement id~why;…#M:name~gold~right;…"
  // (U: is team 0 as sh3 fingerprints of the student ids; T: is the same list as plain ids, from before)
  function clashSpot(Lv) {
    var o = { t0: null, ev: [], mvp: [], awards: [], heroes: [], rej: {}, names: null, looks: null }, sp = Lv && Lv.spot && Lv.spot.q === 'zclash' ? String(Lv.spot.text || '') : '';
    sp.split('#').forEach(function (part) {
      var k = part.slice(0, 2), v = part.slice(2);
      if (k === 'T:') { o.t0 = {}; v.split(',').forEach(function (x) { if (x) o.t0[x] = 1; }); }
      else if (k === 'U:') { o.t0 = {}; v.split(',').forEach(function (x) { if (x) o.t0['#' + x] = 1; }); }
      else if (k === 'E:') o.ev = v.split(';').map(function (x) { var p = x.split('~'); return { seq: +p[0], k: p[1], name: p[2], team: +p[3], lane: +p[4], type: +p[5], n: +p[6] }; }).filter(function (e) { return e.seq && e.k; });
      else if (k === 'M:') o.mvp = v.split(';').map(function (x) { var p = x.split('~'); return p[0] ? { name: p[0], gold: +p[1] || 0, right: +p[2] || 0 } : null; });
      else if (k === 'A:') o.awards = v.split(';').map(function (x) { var p = x.split('~'); return { k: p[0], name: p[1], team: +p[2], n: +p[3] }; }).filter(function (a) { return a.name; });
      else if (k === 'R:') v.split(';').forEach(function (x) { var p = x.split('~'); if (+p[0]) o.rej[+p[0]] = p[1] || 'g'; });
      else if (k === 'N:') o.names = v.split('|').slice(0, 2).map(function (x) { return x ? x.split(',') : []; });
      else if (k === 'Q:') { o.hl = {}; v.split(',').forEach(function (x) { var q = x.split('~'); if (+q[0]) o.hl[+q[0]] = { look: q[1] || '', n: q[2] || '' }; }); }
      else if (k === 'V:') o.looks = v.split('|').slice(0, 2).map(function (x) { return x ? x.split(',') : []; });
      else if (k === 'H:') o.heroes = v.split(';').map(function (x) { var p = x.split('~'); return { name: p[0], team: +p[1], gold: +p[2], right: +p[3], lv: +p[4] || 1 }; }).filter(function (a) { return a.name; });
    });
    return o;
  }
  // what a student did in today's lesson: main questions answered and right, and go-further extras done
  function lessonStatsFrom(ans) {
    var main = {}, extra = {}, mach = {}, n = 0, ok = 0, x = 0, pr = 0;
    A.LES().slides.forEach(function (s) { if (s.id && !s.warm && s.k !== 'conf') main[s.id] = 1; if (s.k === 'machine') mach[s.id] = 1; (s.more || []).forEach(function (m, i) { extra[A.xid(s, i)] = 1; }); });
    Object.keys(ans).forEach(function (q) {
      var a = ans[q]; if (!a) return;
      if (main[q] && a.answer) { n++; if (a.correct === true || a.correct === 'yes') ok++; }
      else if (extra[q] && a.answer) x++;
      // a machine probed with at least two inputs (the answer saves them: "3x+4 (tried 0, 1, 5)")
      var m = mach[q] && String(a.answer || '').match(/\(tried ([^)]*)\)/); if (m && m[1].split(',').length >= 2) pr++;
    });
    return { answered: n, correct: ok, extras: x, probed: pr };
  }

  /* =========================== student page and class screen =========================== */
  var root = null, cvs = null, ctx = null, hud = {}, V = null, CL = null, raf = 0, seen = null, me = -1, shoutSeen = -1, shoutQ = [], shoutBusy = false;
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  // the battle clock on this screen: the newest snapshot's tick plus the time since it arrived (at most 6 s ahead, so a
  // stalled console can't run the board off on its own). Device clocks don't matter. The teacher's board uses the real one.
  function nowT(c) {
    if (c.state === 3) return 0;   // the rules are on screen: the battle clock hasn't started
    if (A.MODE === 'teach') return C() ? cNow(C()) : 0;
    if (V && V.base) return Math.max(0, Math.min(c.dur || L.DUR, V.base.t + Math.min(60, (performance.now() - V.base.at) / 100)));
    return Math.max(0, Math.min(c.dur || L.DUR, (sNow() - c.start) / 100));
  }

  function sync() {
    var Lv = A.live(), c = A.isLive() || A.MODE === 'screen' ? clashOf(Lv) : null;
    if (A.MODE === 'student' && A.saving() && !A.S.me) c = null;   // sign in first: the battle would cover the sign-in box
    if (!c) { close(); return; }
    if (!root || seen !== c.id) open(c);
    if (c.state === 3 && (!V.c || V.c.brief !== c.brief || V.c.state !== 3)) V.briefEnd = performance.now() + c.brief * 1000;
    var sp = clashSpot(Lv);
    me = A.MODE === 'student' && A.S.me ? teamOf(A.S.me.sid, c.id, sp.t0) : -1;
    // the newest snapshot of the board: play it forward from its own time to now
    var snap = L.decode(Lv.counts);
    if (snap && (!V.snapT || snap.t !== V.snapT || V.c.state !== c.state)) {
      V.snapT = snap.t; V.base = { t: snap.t, at: performance.now() }; claimMine(snap, sp.rej);
      L.advance(snap, nowT(c), onFx);
      // characters this screen still had that the console's board no longer has: an attacker near the enemy fort whose team's
      // gold went up grabbed it (the grab happened between snapshots, so this screen never played it); anyone else died
      if (V.S) {
        var keepIds = {}, gain = [Math.max(0, snap.score[0] - V.S.score[0]), Math.max(0, snap.score[1] - V.S.score[1])];
        snap.units.forEach(function (u) { keepIds[u.id] = 1; });
        // a screen running a little behind still has them partway down the lane, so the closest to the fort get the gold first
        var gone = V.S.units.filter(function (u) { return !keepIds[u.id] && !V.fxKeys['die:' + u.id] && !V.fxKeys['grab:' + u.id]; });
        gone.sort(function (a, b) { return (a.team ? a.x : L.LEN - a.x) - (b.team ? b.x : L.LEN - b.x); });
        gone.forEach(function (u) {
          var U = L.UNITS[u.type], foe = 1 - u.team, mowed = !!(V.S.mow && snap.mow && V.S.mow[foe][u.lane] && !snap.mow[foe][u.lane]);
          if (U.kind === 'a' && gain[u.team] > 0) {
            var g = Math.max(1, Math.min(gain[u.team], Math.round(U.gold * L.mul(u.lv)))); gain[u.team] -= g;
            V.fxKeys['grab:' + u.id] = 1; grab(u, g); delete V.units[u.id];
          } else { V.fxKeys['die:' + u.id] = 1; die(u, mowed && U.kind === 'a'); }
        });
      }
      V.S = snap;
    }
    V.c = c; V.sp = sp;
    if (sp.hl) { V.heroLooks = V.heroLooks || {}; Object.keys(sp.hl).forEach(function (id) { V.heroLooks[id] = sp.hl[id]; }); }
    var rk = c.rally ? c.rally.no + '.' + c.rally.st : ''; if (rk !== V.rk) { var first = V.rk == null; V.rk = rk; if (!first) onRally(c); }
    if (sp.looks && (sp.looks[0].length || sp.looks[1].length)) { V.looks = sp.looks; if (CL && A.MODE === 'student') CL.looks = sp.looks; }
    if (sp.names && (sp.names[0].length || sp.names[1].length)) { V.names = sp.names; if (CL && A.MODE === 'student' && JSON.stringify(CL.names) !== JSON.stringify(sp.names)) { CL.names = sp.names; keep(); } }
    if (V.S) claimMine(V.S, sp.rej);
    shoutsFromSpot(sp, c);
    if (c.state === 2 && !V.over && (sp.mvp.length || sp.awards.length || Date.now() - (V.endSeen || (V.endSeen = Date.now())) > 4000)) showEnd(c, sp);
    hudTick();
  }
  // the teacher's own view of the battle: the real board, straight from the referee
  function watch() {
    var K = C(); if (!K) return;
    open({ id: K.id, start: K.id, state: K.state, t: K.S.t, score: K.S.score, dur: K.S.dur, brief: briefLeft(K) }); V.briefEnd = performance.now() + briefLeft(K) * 1000;
    V.watch = true; V.S = K.S; root.classList.add('watch'); V.names = teamLists(K).map(function (l) { return l.map(function (x) { return x.n; }); });
    var x = el('button', { type: 'button', 'class': 'btn lcback', text: '✕ Back to the console' }); x.onclick = function () { close(); };
    root.querySelector('.lctop').appendChild(x);
  }
  function close() {
    if (!root) return;
    cancelAnimationFrame(raf); root.remove(); root = null; document.body.classList.remove('clashing'); seen = null; V = null; shoutQ = []; shoutSeen = -1;
  }

  function open(c) {
    close(); seen = c.id; document.body.classList.add('clashing');
    var T = teamNames(c.id);
    V = { c: c, S: null, snapT: 0, units: {}, parts: [], peas: [], rollers: [], mowers: [], shake: 0, fxKeys: {}, over: false, sel: -1, lane: -1, bump: [0, 0], lastScore: [0, 0], wave: 0 };
    root = H('div', 'lc' + (A.MODE === 'screen' ? ' screen' : '')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Lane Clash: team battle');
    // top bar: the two teams, their gold, and the wave meter
    var top = H('div', 'lctop');
    [0, 1].forEach(function (t) {
      var b = H('div', 'lcteam t' + t);
      b.innerHTML = '<span class="lcflag">' + T[t].e + '</span><span class="lcname">' + esc(T[t].name) + '<i class="lcyou" hidden>you</i></span><b class="lcgold">0</b><span class="lccb" hidden>⚡ comeback</span>';
      hud['team' + t] = b; top.appendChild(b);
      if (t === 0) { var mid = H('div', 'lcmid', '<button type="button" class="lcsound" title="Sound effects">' + (soundOn() ? '🔊' : '🔇') + '</button><div class="lcclock">5:00</div><div class="lcwave"><i class="lcbar"></i><span class="lcflag1" title="A wave">⚑</span><span class="lcflag2" title="The final wave">🚩</span><span class="lchead">🧟</span></div><div class="lcwavet">Battle!</div>'); hud.mid = mid; top.appendChild(mid); }
    });
    root.appendChild(top);
    hud.mid.querySelector('.lcsound').onclick = function () { SFA.store.set('clash.sound', !soundOn()); this.textContent = soundOn() ? '🔊' : '🔇'; sfx('pop'); };
    var stage = H('div', 'lcstage'); cvs = document.createElement('canvas'); cvs.className = 'lcboard'; stage.appendChild(cvs); root.appendChild(stage);
    ctx = cvs.getContext('2d');
    function laneAt(e) { var r = cvs.getBoundingClientRect(), G = geo(); return Math.max(0, Math.min(L.LANES - 1, Math.floor((e.clientY - r.top - G.top) / G.lh))); }
    cvs.addEventListener('mousemove', function (e) { V.hover = laneAt(e); });
    cvs.addEventListener('mouseleave', function () { V.hover = -1; });
    cvs.addEventListener('click', function (e) { if (A.MODE !== 'student' || V.sel < 0) return; pickLane(laneAt(e)); });
    if (A.MODE === 'student') {
      var low = H('div', 'lclow'); root.appendChild(low);
      hud.q = H('div', 'lcq'); low.appendChild(hud.q);
      var side = H('div', 'lcside'); low.appendChild(side);
      hud.mates = H('div', 'lcmates'); side.appendChild(hud.mates);
      hud.hero = H('div', 'lchero'); side.appendChild(hud.hero);
      hud.cards = H('div', 'lccards'); side.appendChild(hud.cards);
      hud.lanes = H('div', 'lclanes'); side.appendChild(hud.lanes);
      for (var l0 = 0; l0 < L.LANES; l0++) (function (l) { var b = el('button', { type: 'button', 'class': 'lclane' }); b.onclick = function (e) { if (e.target.closest('.lcping')) return callHelp(l); pickLane(l); }; hud.lanes.appendChild(b); })(l0);
      initMine(c);
      drawCards(); drawQ();
    } else {
      hud.heroes = H('div', 'lcheroes'); root.appendChild(hud.heroes);
      hud.rosters = H('div', 'lcrosters'); root.appendChild(hud.rosters);
      var leg = H('div', 'lclegend'); L.ORDER.forEach(function (t) { var U = L.UNITS[t]; leg.appendChild(H('span', '', '<img alt="" src="' + thumb(U.who) + '"><b>' + esc(U.name) + '</b> ' + esc(U.role))); }); root.appendChild(leg);
    }
    document.body.appendChild(root);
    if (c.state === 3) { V.briefEnd = performance.now() + (c.brief || 0) * 1000; brief(c, T); } else intro(c, T);
    raf = requestAnimationFrame(frame);
  }

  /* ---------- the student's own battle: coins, hero level, cooldowns, placements ---------- */
  function initMine(c) {
    var key = 'clash.' + A.LID, Ls = SFA.store.get(key, null);
    if (Ls && Ls.id === c.id) { CL = Ls; CL.temps = CL.temps || []; CL.total = CL.total || CL.places.length; return; }
    var st = lessonStatsFrom(A.mine()), b = L.lessonBonus(st.answered, st.correct, st.extras, st.probed);
    var pool = pool_(), order = pool.map(function (x, i) { return i; }), r = 0, k = (A.S.me ? A.S.me.sid : 'x') + ':' + Math.round(c.id / 1000);
    for (var h = 0; h < k.length; h++) r = (r * 31 + k.charCodeAt(h)) % 2147483647;
    for (var i = order.length - 1; i > 0; i--) { r = (r * 1103515245 + 12345) % 2147483648; var j = r % (i + 1), tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
    CL = { id: c.id, total: 0, coins: b.coins, bonus: b.coins, boost: b.boost, stats: st, earned: 0, right: 0, streak: 0, cool: 0, fb: null, qi: 0, tries: 0, order: order, cd: {}, places: [], temps: [], mineIds: {}, sent: 0, gold: 0, intro: false };
    keep();
  }
  function keep() { SFA.store.set('clash.' + A.LID, CL); }
  function lv() { return L.lvOf(CL.right, CL.boost); }
  var saveT = null;
  function send() {
    keep(); clearTimeout(saveT);
    // the newest placements and how many came before them (n): the results script keeps 600 characters of an answer
    var p = CL.places.map(function (x) { return x.l + '.' + x.t + '.' + x.d + '.' + x.v; }).join(',');
    A.record({ id: 'zclash', k: 'open' }, 'c3;id:' + Math.round(CL.id / 1000) + ';r:' + CL.right + ';w:' + (CL.wr || 0) + ';e:' + CL.earned + ';b:' + CL.bonus + ';v:' + CL.boost + ';sk:' + (CL.best || 0) + (CL.ping ? ';g:' + CL.ping.l + '.' + CL.ping.t : '') + (CL.raN ? ';ra:' + CL.raN + '.' + CL.raOk : '') + ';n:' + (CL.total - CL.places.length) + ';p:' + p, null);
  }
  function sendSoon() { clearTimeout(saveT); saveT = setTimeout(send, 4000); }
  function pool_() {
    var out = [];
    A.LES().slides.forEach(function (s) {
      if (s.k === 'number' && s.ans != null) out.push({ k: 'number', q: s.q, ans: s.ans, tol: s.tol, fig: s.fig, why: s.why, hard: false });
      if (s.k === 'poll' && s.ans != null && !s.warm) out.push({ k: 'poll', q: s.q, opts: s.opts, ans: s.ans, fig: s.fig, why: s.why, hard: false });
      (s.more || []).forEach(function (m, i) { if ((m.k === 'number' || m.k === 'poll') && m.ans != null) out.push(Object.assign({}, m, { hard: i >= 1 })); });
    });
    return out;
  }
  function canPlace(t, l) {
    var U = L.UNITS[t], c = V.c, T0 = nowT(c);
    if (CL && c.state === 3) return 'The battle starts in a few seconds.';
    if (!CL || c.state !== 1 || T0 >= c.dur - 5) return 'The battle is over.';
    if (T0 >= c.dur - 70) return 'Too late to send more: the battle ends in a few seconds.';
    if (U.hero) { if (CL.heroUsed) return 'You\'ve sent your avatar this battle.'; if (heroRight() < U.need) return 'Answer ' + (U.need - heroRight()) + ' more right to unlock your avatar hero.'; }
    if (U.lv > lv()) return 'Unlocks at hero level ' + U.lv + '.';
    if (CL.coins < U.cost) return 'Not enough coins: answer questions to earn more.';
    if ((CL.cd[t] || 0) > T0) return U.name + ' is recharging.';
    if (l != null && U.kind === 'd' && V.S && L.planted(V.S, me, l) + CL.temps.filter(function (x) { return x.l === l && L.UNITS[x.t].kind === 'd'; }).length >= L.TILES.length) return 'All the planting spots in lane ' + (l + 1) + ' are taken.';
    if (V.S && V.S.units.concat(V.S.pend).filter(function (u) { return u.team === me; }).length >= BOARD_CAP) return 'Your team\'s lanes are packed. Wait a moment.';
    return '';
  }
  function pickCard(t) { if (V.sel !== t) { var why = canPlace(t); if (why) { SFA.toast(why); return; } } V.sel = V.sel === t ? -1 : t; drawCards(); }
  function pickLane(l) {
    if (V.sel < 0) { SFA.toast('Pick a character card first, then a lane.'); return; }
    var t = V.sel, why = canPlace(t, l); if (why) { SFA.toast(why); return; }
    var U = L.UNITS[t], T0 = Math.floor(nowT(V.c));
    CL.coins -= U.cost; CL.cd[t] = T0 + U.cd; CL.sent++;
    var p = { l: l, t: t, d: T0, v: U.hero ? heroLvMine() : lv() }; if (U.hero) { CL.heroUsed = true; xp(5); }
    sfx('pop'); CL.places.push(p); CL.temps.push({ k: CL.total, l: l, t: t, at: T0 + L.DEPLOY, made: Date.now() }); CL.total++;
    if (CL.places.length > 30) CL.places = CL.places.slice(-30);
    send();
    V.sel = -1; drawCards();
    var T = teamNames(V.c.id);
    shout({ e: U.who, who: 'YOU', text: (U.kind === 'd' ? 'planted ' : U.kind === 's' ? 'sent ' : 'sent ') + '<b>' + esc(U.name.toUpperCase()) + '</b> ' + (U.kind === 'd' ? 'in lane ' + (l + 1) : U.kind === 's' ? 'rolling down lane ' + (l + 1) + '!' : 'down lane ' + (l + 1) + '!'), team: me, mine: true, small: U.cost < 5 });
  }
  // a call for help: shows on your team's screens a few seconds later (it rides with your running row)
  function callHelp(l) {
    var T0 = Math.floor(nowT(V.c));
    if (CL.ping && T0 - CL.ping.t < 150) { SFA.toast('You just called for help. Give your team a moment.'); return; }
    CL.ping = { l: l, t: T0 }; send(); sfx('ping');
    shout({ e: 'gus', who: '📣 YOU:', text: '<b>Help in lane ' + (l + 1) + '!</b>', team: me, mine: true, small: true });
  }
  // a snapshot that now holds one of my placements: claim it (its glow and "You" tag), drop the gate placeholder. One the
  // console turned away (it says so in the spotlight) gets its coins back. One neither seen nor turned away went on the
  // board and was gone before a snapshot caught it (Zero is never on the board for long), so it just stops waiting.
  function claimMine(S, rej) {
    if (!CL || me < 0 || !A.S.me) return;
    var ids = {}; S.pend.concat(S.units).forEach(function (u) { if (u.team === me) ids[u.id] = 1; });
    CL.temps = CL.temps.filter(function (x) {
      if (x.k == null) return Date.now() - x.made < 30000;   // placed before this page updated
      for (var j = 0; j < 6; j++) { var id = pid(A.S.me.sid, CL.id, x.k, j); if (ids[id]) { CL.mineIds[id] = 1; return false; } }
      var why = rej && rej[pid(A.S.me.sid, CL.id, x.k, 0)];
      if (why) {
        var U = L.UNITS[x.t]; CL.coins += U.cost; CL.cd[x.t] = 0; if (U.hero) CL.heroUsed = false; CL.refunds = (CL.refunds || 0) + 1; keep(); drawCards();
        SFA.toast('Your ' + U.name + ' was turned away (' + (WHY[why] || WHY.g) + '), so you got your ' + U.cost + ' coins back.', 5000);
        return false;
      }
      return Date.now() - x.made < 30000;
    });
  }

  /* ---------- questions (the only way to earn coins) ---------- */
  /* the first five questions are integer warm-ups: one step, a negative in every one, 1 coin each. Everyone gets a
     character on the board in the first half minute. They don't count for streaks or hero levels. */
  var WARM_N = 5;
  function warmQs() {
    var k = (A.S.me ? A.S.me.sid : 'x') + ':w:' + Math.round(CL.id / 1000), s0 = 7;
    for (var h = 0; h < k.length; h++) s0 = (s0 * 31 + k.charCodeAt(h)) % 2147483647;
    var r = function () { s0 = (s0 * 1103515245 + 12345) % 2147483648; return s0 / 2147483648; }, n = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    var m = function (v) { return v < 0 ? '(−' + (-v) + ')' : String(v); }, w = function (v) { return v < 0 ? '−' + (-v) : String(v); };
    var T = [
      function () { var a = -n(2, 9), b = n(2, 9); return [w(a) + ' + ' + b, a + b, 'Start at ' + w(a) + ' and go up ' + b + ': ' + w(a + b) + '.']; },
      function () { var a = n(1, 6), b = a + n(2, 7); return [a + ' − ' + b, a - b, 'From ' + a + ', going down ' + b + ' passes zero: ' + w(a - b) + '.']; },
      function () { var a = -n(2, 8), b = n(2, 7); return [w(a) + ' − ' + b, a - b, 'Going down from a negative goes further below zero: ' + w(a - b) + '.']; },
      function () { var a = n(1, 8), b = n(2, 7); return [a + ' − ' + m(-b), a + b, 'Taking away a negative is the same as adding: ' + a + ' + ' + b + ' = ' + (a + b) + '.']; },
      function () { var a = n(2, 9), b = n(2, 6); return [w(-a) + ' × ' + b, -a * b, 'Negative times positive is negative: ' + w(-a * b) + '.']; },
      function () { var a = n(2, 6), b = n(2, 6); return [m(-a) + ' × ' + m(-b), a * b, 'Negative times negative is positive: ' + a * b + '.']; },
      function () { var a = n(2, 6), b = n(2, 9); return [w(-a * b) + ' ÷ ' + a, -b, 'Negative divided by positive is negative: ' + w(-b) + '.']; },
      function () { var a = n(2, 6), b = n(2, 9); return [w(-a * b) + ' ÷ ' + m(-a), b, 'Negative divided by negative is positive: ' + b + '.']; }
    ];
    for (var i = T.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = T[i]; T[i] = T[j]; T[j] = t; }
    return T.slice(0, WARM_N).map(function (f) { var o = f(); return { k: 'number', q: 'What is *' + o[0] + '*?', ans: o[1], why: o[2], warm: true }; });
  }
  // ⭐ arcade XP (kept across lessons by sfa-lesson.js)
  // 📣 a team rally on this student's screen: answer it (one try) before the normal questions carry on
  function rallyLeft(c) { var R = c.rally; return R ? Math.max(0, Math.ceil((R.at + RALLY_WIN - nowT(c)) / 10)) : 0; }
  function drawRally(box, c) {
    var R = c.rally; if (!R || !R.st || me < 0 || !CL) return false;
    CL.ra = CL.ra || {};
    var T = teamNames(c.id), mineAns = CL.ra[R.no], q = rallyQ(R);
    if (R.st === 2) {
      var won = R.won[me], pct = R.of[me] ? Math.round(100 * R.r[me] / R.of[me]) : 0;
      box.appendChild(H('div', 'lcrally ' + (won ? 'won' : 'lost'), won ? '📣 <b>Rally won!</b> ' + R.r[me] + ' of ' + R.of[me] + ' right (' + pct + '%): a free <b>' + esc(L.UNITS[won - 1].name) + '</b> joins lane ' + (R.ln[me] + 1) + '!' : '📣 Rally missed: ' + R.r[me] + ' of ' + R.of[me] + ' right (' + pct + '%). 60% wins a free character. Next time!'));
      return false;
    }
    if (mineAns != null || rallyLeft(c) <= 0 || !q) {
      box.appendChild(H('div', 'lcrally', '📣 <b>Team rally</b> · ' + (mineAns == null ? 'time\'s up' : mineAns ? '✅ you got it' : '❌ not that one') + ' · your team: ' + R.r[me] + ' of ' + R.of[me] + ' right so far · ' + rallyLeft(c) + ' s'));
      return false;
    }
    box.classList.add('rallyon');
    box.appendChild(H('p', 'kick', '📣 TEAM RALLY · ' + T[me].e + ' ' + esc(T[me].name) + ' · <span class="lcrallyt">' + rallyLeft(c) + ' s</span>'));
    box.appendChild(H('p', 'lcrule', 'Everyone on your team gets this one, one try. If 60% get it right, your team gets a free character!'));
    box.appendChild(H('p', 'q', A.fmt(q.q)));
    if (q.fig) { var f = H('div', 'cfig'); try { f.appendChild(A.figure(q.fig)); box.appendChild(f); } catch (e) { } }
    var answer = function (ok) { CL.ra[R.no] = ok ? 1 : 0; CL.raN = R.no; CL.raOk = ok ? 1 : 0; xp(ok ? 10 : 1); if (ok) A.confetti(); keep(); send(); drawQ(); };
    if (q.k === 'number') {
      var inp = el('input', { type: 'text', inputmode: 'decimal', placeholder: 'Type a number', 'aria-label': 'Rally answer', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: '📣 Answer' }), row = H('div', 'row');
      row.appendChild(inp); row.appendChild(go); box.appendChild(row);
      var chk = function () { var v = A.numOf(inp.value); if (!inp.value.trim() || isNaN(v)) return inp.focus(); answer(Math.abs(v - q.ans) <= (q.tol || 1e-9) + 1e-9); };
      go.onclick = chk; inp.onkeydown = function (e) { if (e.key === 'Enter') chk(); };
    } else {
      var list = H('div', 'opts'); box.appendChild(list);
      q.opts.forEach(function (o, k) { var bt = el('button', { type: 'button', 'class': 'opt' }); bt.appendChild(H('span', 'L', A.letter(k))); bt.appendChild(H('span', 't', A.fmt(o))); bt.onclick = function () { answer(k === q.ans); }; list.appendChild(bt); });
    }
    clearTimeout(V.rallyT); V.rallyT = setTimeout(function tickR() { if (root && V && V.c && V.c.rally && V.c.rally.st === 1) { var t = root.querySelector('.lcrallyt'); if (t) t.textContent = rallyLeft(V.c) + ' s'; if (rallyLeft(V.c) <= 0) drawQ(); else V.rallyT = setTimeout(tickR, 1000); } }, 1000);
    return true;
  }
  // a rally starts or ends: shout it out, redraw the question box, and the class screen's panel
  function onRally(c) {
    var R = c.rally; if (!R) return;
    var T = teamNames(c.id);
    if (R.st === 1) { shout({ e: 'gus', who: '📣 TEAM RALLY!', text: 'Everyone answer the rally question: 60% right wins your team a free character!', team: -1, mine: true }); sfx('pop'); }
    if (R.st === 2) [0, 1].forEach(function (t) { if (R.won[t]) shout({ e: L.UNITS[R.won[t] - 1].who, who: T[t].e + ' ' + T[t].name.toUpperCase(), text: 'won the rally (' + R.r[t] + ' of ' + R.of[t] + ')! A free <b>' + esc(L.UNITS[R.won[t] - 1].name.toUpperCase()) + '</b> joins lane ' + (R.ln[t] + 1) + '.', team: t, mine: t === me, gold: true }); });
    if (A.MODE === 'student') drawQ();
    rallyPanel();
  }
  function rallyPanel() {
    if (!root || A.MODE === 'student') return;
    var old = root.querySelector('.lcrallyp'); if (old) old.remove();
    var c = V.c, R = c && c.rally; if (!R || R.st !== 1) return;
    var q = rallyQ(R), T = teamNames(c.id); if (!q) return;
    var p = H('div', 'lcrallyp', '<b class="lckick">📣 TEAM RALLY · <span class="lcrallyt">' + rallyLeft(c) + ' s</span></b><p class="q">' + A.fmt(q.q) + '</p>' + (q.k === 'poll' ? '<div class="bropts">' + q.opts.map(function (o, k) { return '<p><b>' + A.letter(k) + '</b> ' + A.fmt(o) + '</p>'; }).join('') + '</div>' : '') +
      '<p class="lcrallys">' + [0, 1].map(function (t) { return '<span style="color:' + TC[t] + '">' + T[t].e + ' ' + R.r[t] + ' of ' + R.of[t] + '</span>'; }).join(' · ') + ' right · 60% wins a free character</p>');
    root.appendChild(p);
  }
  function xp(n, once) { if (A.hero && CL) A.hero.add('c', String(Math.round(CL.id / 1000)) + (once ? 'e' : ''), n, once); }
  function drawQ() {
    var box = hud.q; if (!box || !CL) return;
    box.innerHTML = '';
    var pool = pool_(), c = V.c;
    if (c.state === 3) { box.appendChild(H('p', 'q', 'Read the rules: the questions start with the battle.')); return; }
    if (c.state !== 1) { box.appendChild(H('p', 'q', 'The battle is over.')); return; }
    if (!pool.length) { box.appendChild(H('p', 'q', 'No questions in this lesson for the Clash.')); return; }
    if (drawRally(box, c)) return;
    if (CL.wi == null) { CL.warm = warmQs(); CL.wi = 0; CL.wr = 0; keep(); }
    var warm = CL.wi < CL.warm.length, bonusRound = !warm && CL.qi >= CL.order.length, q = warm ? CL.warm[CL.wi] : pool[CL.order[CL.qi % CL.order.length]];
    box.appendChild(H('p', 'kick', warm ? '🌱 Warm-up ' + (CL.wi + 1) + ' of ' + CL.warm.length + ' · integers · 1 coin' : 'Answer to earn coins · ' + (bonusRound ? 'bonus round: 1 coin' : q.hard ? '★★ hard: 4 coins' : 'right first try: 3 coins') + (CL.streak >= 2 ? ' · 🔥 ' + CL.streak + ' in a row' : '')));
    box.appendChild(H('p', 'q', fmt(q.q)));
    if (q.fig) { var f = H('div', 'cfig'); f.appendChild(A.figure(q.fig)); box.appendChild(f); }
    if (CL.fb) {
      box.appendChild(H('div', CL.fb.ok ? 'fb good' : 'fb try', CL.fb.html));
      var wait = Math.max(0, CL.cool - Date.now());
      var nx = el('button', { type: 'button', 'class': 'btn primary', text: wait ? 'Think it through… ' + Math.ceil(wait / 1000) : 'Next question ▶' });
      if (wait) { nx.disabled = true; setTimeout(function () { if (root) drawQ(); }, 1000); }
      nx.onclick = function () { CL.fb = null; if (warm) { CL.wi++; if (CL.wi === CL.warm.length) SFA.toast('⚔️ Warmed up! Now the lesson questions: 3 coins each, more for streaks.', 4500); } else CL.qi++; CL.tries = 0; keep(); drawQ(); };
      box.appendChild(nx); return;
    }
    function right() {
      if (warm) {   // a warm-up: 1 coin (plus any comeback coins), no streak, no hero level
        var cbw = V.S ? L.behind(V.S, me) : 0, gw = 1 + cbw; CL.coins += gw; CL.earned += gw; CL.wr++; A.confetti(); xp(4);
        CL.fb = { ok: true, html: '<b>Yes! +' + gw + ' coin' + (gw === 1 ? '' : 's') + '.</b> Warm-ups pay 1; the lesson questions pay 3.' }; sendSoon(); drawCards(); return;
      }
      var first = !CL.tries; CL.streak = first ? CL.streak + 1 : 0; CL.best = Math.max(CL.best || 0, CL.streak);
      var cb = V.S ? L.behind(V.S, me) : 0, got = L.coinsFor(first, q.hard, CL.streak, bonusRound) + cb, before = lv();
      CL.coins += got; CL.earned += got; CL.right++; A.confetti(); xp(first ? 10 : 5);
      CL.fb = { ok: true, html: '<b>Yes! +' + got + ' coin' + (got === 1 ? '' : 's') + '.</b>' + (first && CL.streak % 3 === 0 ? ' 🔥 Three in a row!' : '') + (cb ? ' ⚡ comeback coin' + (cb > 1 ? 's' : '') : '') };
      if (lv() > before) levelUp(lv());
      sendSoon(); drawCards();
    }
    function wrong(html) { xp(1); if (!warm) CL.streak = 0; CL.cool = Date.now() + (warm ? 2000 : COOL_MS); CL.fb = { ok: false, html: html }; }
    if (q.k === 'number') {
      var inp = el('input', { type: 'text', inputmode: q.ans < 0 ? 'text' : 'decimal', placeholder: 'Type a number', 'aria-label': 'Clash answer', autocomplete: 'off' });
      var go = el('button', { type: 'button', 'class': 'btn primary', text: 'Check' }), row = H('div', 'row'); row.appendChild(inp); row.appendChild(go); box.appendChild(row);
      if (CL.tries) box.appendChild(H('p', 'state', 'Not yet: one more try for 1 coin.'));
      var check = function () {
        var v = A.numOf(inp.value); if (!inp.value.trim()) return inp.focus(); if (isNaN(v)) { SFA.toast('Type a number, like 12 or -3.'); return; }
        if (Math.abs(v - q.ans) <= (q.tol || 1e-9) + 1e-9) right();
        else if (!CL.tries) CL.tries = 1;
        else wrong('<b>The answer is ' + esc(A.numTxt(q.ans)) + '.</b> ' + fmt(q.why || ''));
        keep(); drawQ();
      };
      go.onclick = check; inp.onkeydown = function (e) { if (e.key === 'Enter') check(); };
      if (!V.noFocus) setTimeout(function () { inp.focus({ preventScroll: true }); }, 30); V.noFocus = false;
    } else {
      var list = H('div', 'opts'); box.appendChild(list);
      q.opts.forEach(function (o, k) {
        var b = el('button', { type: 'button', 'class': 'opt' }); b.appendChild(H('span', 'L', A.letter(k))); b.appendChild(H('span', 't', fmt(o)));
        b.onclick = function () { if (k === q.ans) right(); else wrong('<b>Not this one: it\'s ' + A.letter(q.ans) + '.</b> ' + fmt(q.why || '')); keep(); drawQ(); };
        list.appendChild(b);
      });
    }
  }
  function levelUp(n) {
    sfx('level');
    var un = L.UNITS.filter(function (U) { return U.lv === n; });
    shout({ e: un.length ? un[0].who : 'one', who: 'LEVEL ' + n + '!', text: un.length ? un.map(function (U) { return '<b>' + esc(U.name.toUpperCase()) + '</b>'; }).join(' and ') + ' unlocked. Your characters are stronger.' : 'Your characters are stronger.', team: me, mine: true, gold: true });
  }

  /* ---------- the hero panel and the seed-packet cards ---------- */
  var thumbs = {};
  function thumb(who) {
    if (who === 'hero') return heroURL(myLook(), 64);
    if (thumbs[who]) return thumbs[who];
    var s = SP.get(who); if (!s) return '';
    var c = document.createElement('canvas'), k = Math.min(64 / s.w, 64 / s.h); c.width = 64; c.height = 64;
    c.getContext('2d').drawImage(s.frames[0], (64 - s.w * k) / 2, 64 - s.h * k, s.w * k, s.h * k);
    return (thumbs[who] = c.toDataURL());
  }
  // 🌟 the avatar hero: each student's Wardrobe look, as a card picture and as a sprite on the board
  var heroImgs = {};
  function heroURL(look, size) { var AV = window.SFA_AVATAR; return AV ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(AV.svg(look || '', { size: size || 64 })) : ''; }
  function myLook() { var AV = window.SFA_AVATAR; return AV && A.S.me ? AV.myLook(AV.profile(), A.S.me.sid) : ''; }
  function heroSp(look) {
    look = look || ''; var h = heroImgs[look];
    if (!h) { h = heroImgs[look] = { ok: false }; var img = new Image(); img.onload = function () { h.ok = true; }; img.src = heroURL(look, 160); h.sp = { frames: [img], w: 160, h: 184 }; }
    return h.ok ? h.sp : null;
  }
  function heroOf(u) { return (V.heroLooks && V.heroLooks[u.id % 10000]) || (CL && CL.mineIds[u.id] ? { look: myLook(), n: '' } : null); }
  function spOf(u) { var U = L.UNITS[u.type]; if (U.hero) { var hh = heroOf(u); return heroSp(hh ? hh.look : ''); } return SP.get(U.who); }
  function heroLvMine() { var AV = window.SFA_AVATAR; return L.heroLv(AV ? AV.level(AV.profile().xp || 0) : 1); }
  function heroRight() { return CL ? (CL.right || 0) + (CL.wr || 0) : 0; }
  function lookByName(n) { var NM = V.names || (CL && CL.names), LK = V.looks || (CL && CL.looks); if (!NM || !LK) return ''; for (var t = 0; t < 2; t++) { var i = (NM[t] || []).indexOf(n); if (i >= 0 && LK[t]) return LK[t][i] || ''; } return ''; }
  function drawCards() {
    if (!hud.cards || !CL) return;
    var n = lv(), next = L.UNITS.filter(function (U) { return U.lv === n + 1; })[0], toNext = n >= 5 ? 0 : 3 - (CL.right % 3);
    hud.hero.innerHTML = '<div class="lclv"><b>Lv ' + n + '</b><span>' + '⭐'.repeat(n) + '</span></div><div class="lcxp"><i style="width:' + (n >= 5 ? 100 : Math.round(100 * (CL.right % 3) / 3)) + '%"></i></div>' +
      '<div class="lccoins">🪙 <b>' + CL.coins + '</b></div><p class="lcnext">' + (n >= 5 ? 'Max hero level!' : toNext + ' more right → Lv ' + (n + 1) + (next ? ': unlocks ' + esc(next.name) : '')) + '</p>';
    hud.cards.innerHTML = '';
    var T0 = V && V.c ? nowT(V.c) : 0;
    L.ORDER.forEach(function (t) {
      var U = L.UNITS[t], locked = U.hero ? heroRight() < U.need || !!CL.heroUsed : U.lv > n, cd = U.hero ? 0 : Math.max(0, (CL.cd[t] || 0) - T0), b = el('button', { type: 'button', 'class': 'lccard' + (U.hero ? ' hero' : '') + (V.sel === t ? ' sel' : '') + (locked ? ' locked' : '') + (CL.coins < U.cost ? ' poor' : '') });
      var C0 = L.CLS[U.cls] || {};
      b.innerHTML = '<span class="lccls" title="' + esc(C0.n || '') + '">' + (C0.e || '') + '</span><img alt="" src="' + thumb(U.who) + '"><b>' + esc(U.name) + '</b><small>' + esc(U.hero ? 'Lv ' + heroLvMine() + ' hero' : U.role) + '</small><span class="lccost">' + (U.cost ? U.cost + '🪙' : 'FREE') + '</span>' + (locked ? '<span class="lclock">' + (U.hero ? (CL.heroUsed ? '✓ Sent' : '🔒 ' + (U.need - heroRight()) + ' more right') : '🔒 Lv ' + U.lv) + '</span>' : '') + (cd ? '<span class="lccd" style="--p:' + Math.round(100 * cd / U.cd) + '"></span>' : '');
      b.title = U.say + (C0.n ? ' · ' + C0.e + ' ' + C0.n + ': good against ' + C0.good + '; watch out for ' + C0.bad + '.' : '');
      b.onclick = function () { if (locked) { SFA.toast(U.hero ? (CL.heroUsed ? 'You\'ve sent your avatar this battle.' : 'Answer ' + (U.need - heroRight()) + ' more right to unlock your avatar hero.') : U.name + ' unlocks at hero level ' + U.lv + '. Answer questions to level up.'); return; } pickCard(t); };
      hud.cards.appendChild(b);
    });
    // counters: what the picked card is good and bad against (or the cheat sheet)
    var SU = V.sel >= 0 ? L.UNITS[V.sel] : null, SC = SU ? L.CLS[SU.cls] : null;
    hud.cards.appendChild(H('p', 'lcvs', SC ? '<b>' + SC.e + ' ' + esc(SU.name) + '</b> ✅ ' + esc(SC.good) + ' · ❌ ' + esc(SC.bad) : '🎯 shooters beat 🏃 runners · 🦍 giants shrug off 🎯 shooters · 🧱 walls beat 🦍 giants · 💥 breakers smash 🧱 walls · ⭕ Zero clears a lane'));
    laneButtons();
  }
  function laneButtons() {
    if (!hud.lanes || !V.S) return;
    [].forEach.call(hud.lanes.children, function (b, l) {
      var foes = V.S.units.filter(function (u) { return u.team !== me && u.lane === l && L.UNITS[u.type].kind === 'a'; }), near = foes.filter(function (u) { return Math.abs(u.x - (me ? L.LEN : 0)) < L.LEN / 2; }).length, coming = V.S.pend.filter(function (u) { return u.team !== me && u.lane === l; }).length;
      b.className = 'lclane' + (V.sel >= 0 ? ' ready' : '') + (near ? ' danger' : '');
      b.innerHTML = '<span class="lcping" title="Ask your team for help in this lane">📣</span><b>Lane ' + (l + 1) + '</b><small>' + (near ? '⚠️ ' + near + ' attacking' : coming ? '⚠️ ' + coming + ' incoming' : 'quiet') + (V.S.mow[me] && !V.S.mow[me][l] ? ' · Mux recharging' : '') + '</small>';
    });
  }

  /* ---------- sound: tiny synthesized effects, off until someone turns them on ---------- */
  var AC = null, lastSfx = {};
  function soundOn() { return !!SFA.store.get('clash.sound', false); }
  function sfx(k) {
    if (!soundOn()) return;
    var now = performance.now(); if (now - (lastSfx[k] || 0) < (k === 'bonk' ? 90 : 40)) return; lastSfx[k] = now;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination);
      var tone = function (type, f0, f1, dur, vol) { o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.02); };
      if (k === 'coin') tone('square', 990, 1480, 0.18, 0.08);
      else if (k === 'bonk') tone('triangle', 220, 70, 0.16, 0.18);
      else if (k === 'pop') tone('sine', 500, 900, 0.1, 0.12);
      else if (k === 'zero') tone('sawtooth', 300, 1200, 0.5, 0.07);
      else if (k === 'mow') tone('sawtooth', 90, 40, 0.8, 0.16);
      else if (k === 'level') tone('square', 660, 1320, 0.45, 0.08);
      else if (k === 'wave') tone('sawtooth', 160, 120, 1.1, 0.12);
      else if (k === 'ping') tone('sine', 880, 660, 0.25, 0.1);
      else if (k === 'win') tone('square', 523, 1046, 0.9, 0.09);
    } catch (e) { }
  }

  /* ---------- animation ---------- */
  function onFx(e) {
    if (!V) return;
    var key = e.k + ':' + (e.u ? e.u.id : e.p ? e.p.id : e.team + ':' + e.lane + ':' + Math.floor((V.S ? V.S.t : 0) / 50));
    if (e.k !== 'hit') { if (V.fxKeys[key]) return; V.fxKeys[key] = 1; }
    if (e.k === 'hit') { var R = V.units[e.u.id]; if (R) R.flash = 1; return; }
    if (e.k === 'spawn') { var R2 = V.units[e.u.id] = V.units[e.u.id] || {}; R2.born = performance.now(); dust(e.u); return; }
    if (e.k === 'die') { die(e.u, e.mowed); sfx('bonk'); return; }
    if (e.k === 'grab') { grab(e.u, e.gold); return; }
    if (e.k === 'zero') {
      V.rollers.push({ lane: e.p.lane, team: e.p.team, t0: performance.now() }); if (e.hits.length) V.shake = Math.max(V.shake, 6); sfx('zero');
      // damage numbers on everyone Zero erased
      var G0 = geo(); e.hits.forEach(function (id) { var u = V.S && V.S.units.filter(function (x) { return x.id === id; })[0]; if (u) V.parts.push({ k: 'text', s: '-' + Math.round(L.UNITS[e.p.type].pie * L.mul(e.p.lv)), col: '#FF8A5A', x: G0.X(u.x), y: laneY(G0, u.lane) - sizeOf(L.UNITS[u.type].who, G0) - 6, vy: -60, life: 0.9, t: 0 }); });
      return;
    }
    if (e.k === 'mow') { V.mowers.push({ lane: e.lane, team: e.team, t0: performance.now() }); V.shake = Math.max(V.shake, 10); sfx('mow'); var T = teamNames(V.c.id); shout({ e: 'mux', who: 'MUX', text: 'charged down lane ' + (e.lane + 1) + ' for <b>' + esc(T[e.team].name.toUpperCase()) + '</b>!', team: e.team, mine: e.team === me }); return; }
  }
  function geo() {
    // the forts take a strip at each end, and a band across the top holds their banners
    var w = cvs.clientWidth, h = cvs.clientHeight, vw = Math.max(58, w * 0.09), top = Math.max(22, h * 0.07);
    return { w: w, h: h, vw: vw, lh: (h - top) / L.LANES, top: top, X: function (x) { return vw + (x / L.LEN) * (w - 2 * vw); } };
  }
  function laneY(G, l) { return G.top + G.lh * (l + 0.82); }
  function sizeOf(who, G) { var k = { hero: 0.8, gus: 0.62, one: 0.74, sam: 0.66, pigeon: 0.34, max: 0.98, zero: 0.42, mux: 0.6, rita: 0.66, priya: 0.62, dunmore: 0.84, undef: 1.12 }[who] || 0.6; return G.lh * k * (L.LANES > 3 ? 1.3 : 1); }
  function dust(u) { var G = geo(); for (var i = 0; i < 8; i++) V.parts.push({ k: 'dust', x: G.X(u.x) + (Math.random() - 0.5) * 30, y: laneY(G, u.lane), vx: (Math.random() - 0.5) * 60, vy: -Math.random() * 40, life: 0.6, t: 0 }); }
  function die(u, mowed) {
    var G = geo(), R = V.units[u.id] || {};
    V.parts.push({ k: 'ghost', who: L.UNITS[u.type].who, team: u.team, x: R.dx != null ? R.dx : G.X(u.x), y: laneY(G, u.lane), vx: (u.team ? 1 : -1) * (mowed ? 260 : 90), vy: mowed ? -320 : -160, rot: 0, vr: (Math.random() < .5 ? -1 : 1) * (mowed ? 14 : 8), life: 0.9, t: 0, size: sizeOf(L.UNITS[u.type].who, G) });
    for (var i = 0; i < 10; i++) V.parts.push({ k: 'poof', x: G.X(u.x), y: laneY(G, u.lane) - sizeOf(L.UNITS[u.type].who, G) / 2, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.7) * 160, life: 0.5 + Math.random() * 0.3, t: 0, r: 4 + Math.random() * 7 });
    V.parts.push({ k: 'text', s: ['BONK!', 'POW!', 'POOF!', 'ZAP!'][u.id % 4], col: '#fff', x: G.X(u.x), y: laneY(G, u.lane) - sizeOf(L.UNITS[u.type].who, G), vy: -50, life: 0.7, t: 0 });
    delete V.units[u.id];
  }
  function grab(u, gold) {
    var G = geo(), x = u.team ? G.vw * 0.5 : G.w - G.vw * 0.5, y = laneY(G, u.lane) - G.lh * 0.35;
    for (var i = 0; i < Math.min(26, 6 + gold); i++) V.parts.push({ k: 'coin', x: x, y: y, vx: (u.team ? 1 : -1) * (60 + Math.random() * 180), vy: -180 - Math.random() * 260, life: 1.1, t: 0, g: 520 });
    V.parts.push({ k: 'text', s: '+' + gold, col: TC[u.team], big: true, x: x + (u.team ? 30 : -30), y: y - 10, vy: -70, life: 1.2, t: 0 });
    V.bump[u.team] = 1; V.shake = Math.max(V.shake, gold >= 20 ? 9 : 4); sfx('coin'); coinsToBank(u.team, x, y, Math.min(8, 2 + Math.round(gold / 4)));
    if (CL && CL.mineIds[u.id]) { CL.gold += gold; keep(); shout({ e: L.UNITS[u.type].who, who: 'YOUR ' + L.UNITS[u.type].name.toUpperCase(), text: 'grabbed <b>' + gold + ' GOLD</b>!', team: me, mine: true, gold: true }); }
  }
  function coinsToBank(team, bx, by, n) {
    var bank = hud['team' + team] && hud['team' + team].querySelector('.lcgold'); if (!bank || !bank.animate) return;
    var r = cvs.getBoundingClientRect(), to = bank.getBoundingClientRect();
    for (var i = 0; i < n; i++) (function (i) {
      var c = H('span', 'lccoin', '🪙'); c.style.left = (r.left + bx) + 'px'; c.style.top = (r.top + by) + 'px'; document.body.appendChild(c);
      var dx = to.left + to.width / 2 - (r.left + bx), dy = to.top + to.height / 2 - (r.top + by), mid = { x: dx * 0.5 + (Math.random() - 0.5) * 120, y: Math.min(dy, 0) - 80 - Math.random() * 60 };
      var a = c.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + mid.x + 'px,' + mid.y + 'px) scale(1.3)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.6)', opacity: 0.8 }], { duration: 800 + i * 70, easing: 'cubic-bezier(.3,.1,.5,1)', delay: i * 40 });
      a.onfinish = function () { c.remove(); };
    })(i);
  }
  var lastF = 0;
  function frame(ts) {
    if (!root) return;
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (ts - (lastF || ts)) / 1000); lastF = ts;
    if (V.watch) {
      var K = C(); if (!K) { close(); return; }
      V.c = { id: K.id, start: K.id, state: K.state, t: K.S.t, score: K.S.score, dur: K.S.dur, brief: briefLeft(K) }; V.S = K.S;
      if (!K.frozen) L.advance(K.S, Math.floor(cNow(K)), refFx);
      V.sp = clashSpot({ spot: spot(), lesson: A.LID });
      if (K.state === 2 && !V.over && (V.sp.mvp.length || V.sp.awards.length)) showEnd(V.c, V.sp);
    }
    var c = V.c, T0 = nowT(c);
    if (V.S && c.state === 1 && !V.watch) L.advance(V.S, Math.floor(T0), onFx);
    draw(dt, T0);
    if (Math.floor(ts / 500) !== V.tick) { V.tick = Math.floor(ts / 500); hudTick(); if (CL && A.MODE === 'student') drawCards(); }
  }
  /* a team's fort, drawn as a status board: the banner (gold grabbed, a crown for the leader), and for each lane a gate
     that shows Mux (parked, or a ring counting down while he recharges), red alarm lights when enemy attackers are close,
     and two pips for this team's planting spots. Cracks and smoke grow with the gold the other team has taken. */
  function fort(c, G, t, S, TN, now, fz) {
    var w = G.w, h = G.h, x0 = t ? w - G.vw : 0, vw = G.vw, inner = t ? x0 : x0 + vw, dir = t ? -1 : 1, px = x0 + vw / 2;
    var g = c.createLinearGradient(x0, 0, x0 + vw, 0);
    if (t) { g.addColorStop(0, '#3a4f72'); g.addColorStop(1, '#22304a'); } else { g.addColorStop(0, '#6b4a1a'); g.addColorStop(1, '#8a6224'); }
    c.fillStyle = g; c.fillRect(x0, 0, vw, h);
    // stone courses
    c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1;
    for (var row = 0; row < h; row += 14) { c.beginPath(); c.moveTo(x0, row); c.lineTo(x0 + vw, row); c.stroke(); for (var col = (row / 14) % 2 ? 0 : 10; col < vw; col += 20) { c.beginPath(); c.moveTo(x0 + col, row); c.lineTo(x0 + col, row + 14); c.stroke(); } }
    // battlements along the field side, in the team colour
    var mw = 7; c.fillStyle = TC[t];
    c.fillRect(t ? inner : inner - 4, 0, 4, h);
    for (var my = G.top; my < h; my += 18) c.fillRect(t ? inner - mw : inner, my, mw, 10);
    // cracks: one for every 60 gold the other team has grabbed (at most 8), always in the same places
    var foe = S ? S.score[1 - t] : 0, mine = S ? S.score[t] : 0, cracks = Math.min(8, Math.floor(foe / 60));
    c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 2;
    for (var k = 0; k < cracks; k++) { var cx = x0 + vw * (0.2 + 0.6 * ((k * 37 % 10) / 10)), cy = G.top + (h - G.top) * ((k * 53 % 10) / 10 + 0.05); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + 6, cy + 9); c.lineTo(cx - 2, cy + 16); c.lineTo(cx + 5, cy + 24); c.stroke(); }
    // well behind: smoke rises from the fort
    if (S && foe > 50 && foe > mine * 1.3) for (var sm = 0; sm < 3; sm++) { var ph = (now / 1400 + sm / 3) % 1; c.fillStyle = 'rgba(90,90,96,' + (0.5 * (1 - ph)) + ')'; c.beginPath(); c.arc(px + Math.sin(ph * 6 + sm) * 8, G.top + 10 - ph * 40, 6 + ph * 12, 0, 7); c.fill(); }
    // the gates
    for (var ln = 0; ln < L.LANES; ln++) {
      var gy = laneY(G, ln), gh = G.lh * 0.62, gw = Math.min(vw * 0.62, gh * 0.8), gx = px + dir * vw * 0.08;
      var near = S ? S.units.filter(function (u) { return u.team !== t && u.lane === ln && L.UNITS[u.type].kind === 'a' && Math.abs(u.x - (t ? L.LEN : 0)) < 320; }).length : 0;
      var arch = function () { c.beginPath(); c.moveTo(gx - gw / 2, gy); c.lineTo(gx - gw / 2, gy - gh + gw / 2); c.arc(gx, gy - gh + gw / 2, gw / 2, Math.PI, 0); c.lineTo(gx + gw / 2, gy); c.closePath(); };
      c.fillStyle = '#15171d'; c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 2; arch(); c.fill(); c.stroke();
      // the portcullis
      c.strokeStyle = 'rgba(160,160,170,.45)'; c.lineWidth = 1.5;
      for (var bx = -1; bx <= 1; bx++) { c.beginPath(); c.moveTo(gx + bx * gw / 4, gy - gh + 4); c.lineTo(gx + bx * gw / 4, gy); c.stroke(); }
      c.beginPath(); c.moveTo(gx - gw / 2, gy - gh * 0.45); c.lineTo(gx + gw / 2, gy - gh * 0.45); c.stroke();
      // enemies close: the gate flashes red, with how many
      if (near) {
        c.fillStyle = 'rgba(255,60,50,' + (0.35 + 0.35 * Math.max(0, Math.sin(now / 110))) + ')'; arch(); c.fill();
        c.font = 'bold ' + Math.round(Math.max(11, G.lh * 0.24)) + 'px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText('!' + (near > 1 ? near : ''), gx, gy - gh * 0.25);
      }
      // Mux: a green light while he's parked, or a ring counting down to when he's back
      var ready = !S || S.mow[t][ln], charging = V.mowers.some(function (m) { return m.team === t && m.lane === ln && now - m.t0 < 900; });
      var lx = gx, ly = gy - gh - Math.max(7, G.lh * 0.1);
      if (ready) { c.fillStyle = '#3BFF8A'; c.shadowColor = '#3BFF8A'; c.shadowBlur = 8; c.beginPath(); c.arc(lx, ly, Math.max(4, G.lh * 0.06), 0, 7); c.fill(); c.shadowBlur = 0; }
      else {
        var back = S && S.mowAt && S.mowAt[t] ? S.mowAt[t][ln] : 0, left = back ? Math.max(0, (back - S.t) / 10) : 0, frac = back ? 1 - left / (L.MOWBACK / 10) : 0, r0 = Math.max(6, G.lh * 0.1);
        c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 3; c.beginPath(); c.arc(lx, ly, r0, 0, 7); c.stroke();
        c.strokeStyle = '#FFC94A'; c.beginPath(); c.arc(lx, ly, r0, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); c.stroke();
        if (left) { c.font = 'bold ' + Math.round(Math.max(9, G.lh * 0.15)) + 'px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#FFC94A'; c.fillText(String(Math.ceil(left)), lx + dir * (r0 + 12), ly + 4); }
      }
      var sp = SP.get('mux'), sz = sizeOf('mux', G) * 0.55, mx = t ? w - vw - sz * 0.45 : vw + sz * 0.45;
      if (sp && !charging) { c.save(); c.globalAlpha = ready ? 1 : 0.25; drawSprite(sp, mx, gy, sz, t, 0); c.restore(); }
      // this team's planting spots in the lane
      if (S) { var pl = L.planted(S, t, ln); for (var q = 0; q < L.TILES.length; q++) { c.fillStyle = q < pl ? '#7CFF6B' : 'rgba(255,255,255,.18)'; c.fillRect(gx - 9 + q * 11, gy + 2, 8, 4); } }
    }
    // the banner: flag, gold grabbed, a crown on the leader; torches in the final wave
    var bw = vw + 18, bx0 = t ? w - bw : 0;
    c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(bx0, 0, bw, G.top);
    c.fillStyle = TC[t]; c.fillRect(bx0, G.top - 3, bw, 3);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = Math.round(G.top * 0.6) + 'px serif'; c.fillText(TN.e, bx0 + (t ? bw - G.top * 0.5 : G.top * 0.5), G.top / 2);
    c.font = '400 ' + Math.round(G.top * 0.62) + 'px "Luckiest Guy", system-ui'; c.fillStyle = '#FFE14D'; c.fillText(String(mine), bx0 + bw / 2 + dir * 6, G.top / 2 + 1);
    if (S && mine > foe) { c.font = Math.round(G.top * 0.55) + 'px serif'; c.fillText('👑', bx0 + (t ? G.top * 0.45 : bw - G.top * 0.45), G.top / 2); }
    c.textBaseline = 'alphabetic';
    if (fz) for (var tc = 0; tc < 2; tc++) { var ty = G.top + (h - G.top) * (tc ? 0.66 : 0.33), tx = inner - dir * 6; c.fillStyle = '#FFB02E'; c.beginPath(); c.ellipse(tx, ty - 6 + Math.sin(now / 60 + tc) * 1.5, 4, 8, 0, 0, 7); c.fill(); c.fillStyle = '#FFF3B0'; c.beginPath(); c.ellipse(tx, ty - 4, 2, 4, 0, 0, 7); c.fill(); }
  }
  function draw(dt, T0) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = cvs.clientWidth, h = cvs.clientHeight;
    if (cvs.width !== Math.round(w * dpr) || cvs.height !== Math.round(h * dpr)) { cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr); }
    var G = geo(), c = ctx, now = performance.now(), fz = L.frenzy(T0, V.c.dur);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    V.shake *= Math.pow(0.02, dt);
    if (V.shake > 0.3) c.translate((Math.random() - 0.5) * V.shake, (Math.random() - 0.5) * V.shake);
    // the lawn: checker stripes, warmer in the final wave
    c.fillStyle = '#2a2f3a'; c.fillRect(0, 0, w, G.top);
    for (var l = 0; l < L.LANES; l++) {
      var y0 = G.top + l * G.lh, cols = 12;
      for (var k = 0; k < cols; k++) {
        var x0 = G.vw + k * (w - 2 * G.vw) / cols, odd = (k + l) % 2;
        c.fillStyle = fz ? (odd ? '#5c4a23' : '#6a5528') : (odd ? '#3f7a3a' : '#4a8a42');
        c.fillRect(x0, y0, (w - 2 * G.vw) / cols + 1, G.lh);
      }
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(G.vw, y0 + G.lh - 3, w - 2 * G.vw, 3);
      if (V.lane === l || (A.MODE === 'student' && V.sel >= 0)) { c.fillStyle = 'rgba(255,255,255,' + (0.06 + 0.04 * Math.sin(now / 200)) + ')'; c.fillRect(G.vw, y0, w - 2 * G.vw, G.lh); }
      // planting spots (dirt patches)
      [0, 1].forEach(function (t) { L.TILES.forEach(function (tx) { var x = G.X(t ? L.LEN - tx : tx); c.fillStyle = 'rgba(90,60,30,.35)'; c.beginPath(); c.ellipse(x, y0 + G.lh * 0.84, G.lh * 0.28, G.lh * 0.08, 0, 0, 7); c.fill(); }); });
    }
    // lane numbers, faint
    c.font = '400 ' + Math.round(G.lh * 0.5) + 'px "Luckiest Guy", system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(255,255,255,.07)';
    for (var ln0 = 0; ln0 < L.LANES; ln0++) c.fillText(String(ln0 + 1), w / 2, G.top + G.lh * (ln0 + 0.5));
    c.textBaseline = 'alphabetic';
    // where the picked card would go: a ghost in the lane under the mouse
    if (A.MODE === 'student' && V.sel >= 0 && V.hover >= 0 && me >= 0) {
      var GU = L.UNITS[V.sel], gsp = SP.get(GU.who), gx0 = GU.kind === 'd' ? G.X(me ? L.LEN - L.TILES[GU.wall ? 0 : L.TILES.length - 1] : L.TILES[GU.wall ? 0 : L.TILES.length - 1]) : me ? w - G.vw - 30 : G.vw + 30;
      c.fillStyle = 'rgba(255,201,74,.16)'; c.fillRect(G.vw, G.top + V.hover * G.lh, w - 2 * G.vw, G.lh);
      if (gsp) { c.save(); c.globalAlpha = 0.5 + 0.15 * Math.sin(now / 120); drawSprite(gsp, gx0, laneY(G, V.hover), sizeOf(GU.who, G), me, 0); c.restore(); }
    }
    // halfway line
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.setLineDash([6, 8]); c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); c.setLineDash([]);
    // the forts: one gate per lane with its Mux, and the battle's state on them
    var S = V.S, T0n = teamNames(V.c.id);
    [0, 1].forEach(function (t) { fort(c, G, t, S, T0n[t], now, fz); });
    if (!S) return;
    // the gates: my team's pending placements as ghosts with a countdown; the enemy's as ⚠
    var T = teamNames(V.c.id);
    S.pend.forEach(function (p) {
      var U = L.UNITS[p.type], left = Math.max(0, (p.at - T0) / 10), gx = p.team ? w - G.vw - 18 : G.vw + 18, gy = laneY(G, p.lane) - G.lh * 0.5;
      if (p.team === me || A.MODE === 'screen') {
        c.save(); c.globalAlpha = 0.55 + 0.2 * Math.sin(now / 150); var sp2 = SP.get(U.who); if (sp2) drawSprite(sp2, gx, laneY(G, p.lane), sizeOf(U.who, G) * 0.7, p.team, 0); c.restore();
        ring(c, gx, gy - G.lh * 0.12, 11, 1 - left / (L.DEPLOY / 10), TC[p.team], Math.ceil(left));
      } else {
        c.font = 'bold ' + Math.round(G.lh * 0.28) + 'px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#ff5a4a'; c.fillText('⚠', gx, gy + Math.sin(now / 120) * 3);
      }
    });
    if (CL) CL.temps.forEach(function (x) { if (T0 > x.at + 40) return; var gx = me ? w - G.vw - 18 : G.vw + 18, left = Math.max(0, (x.at - T0) / 10); c.save(); c.globalAlpha = 0.45; var sp3 = L.UNITS[x.t].hero ? heroSp(myLook()) : SP.get(L.UNITS[x.t].who); if (sp3) drawSprite(sp3, gx, laneY(G, x.l), sizeOf(L.UNITS[x.t].who, G) * 0.7, me, 0); c.restore(); ring(c, gx, laneY(G, x.l) - G.lh * 0.62, 11, 1 - left / (L.DEPLOY / 10), TC[me], Math.ceil(left)); });
    // the units: march bob, lunge when fighting, flash when hit, a health bar, level stars, a "You" tag
    var alive = {};
    S.units.slice().sort(function (a, b) { return a.lane - b.lane; }).forEach(function (u) {
      alive[u.id] = 1;
      var U = L.UNITS[u.type], R = V.units[u.id] || (V.units[u.id] = { born: now }), tx = G.X(u.x);
      R.dx = R.dx == null ? tx : R.dx + (tx - R.dx) * Math.min(1, dt * 10);
      var sz = sizeOf(U.who, G), y = laneY(G, u.lane), dirn = u.team ? -1 : 1, sp = spOf(u), age = (now - (R.born || 0)) / 1000;
      var bob = U.kind === 'a' && !u.fight ? -Math.abs(Math.sin(now / 130 + u.id)) * sz * 0.06 : 0;
      var lunge = u.fight ? Math.max(0, Math.sin(now / 90 + u.id)) * sz * 0.12 * dirn : 0;
      var drop = age < 0.35 ? -(1 - age / 0.35) * G.lh * 0.6 : 0, squash = age < 0.5 ? 1 + Math.sin(age * 18) * 0.12 * (1 - age / 0.5) : 1;
      // shadow
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(R.dx, y + 2, sz * 0.32, sz * 0.07, 0, 0, 7); c.fill();
      if (CL && CL.mineIds[u.id]) { c.save(); c.shadowColor = TC[u.team]; c.shadowBlur = 14; }
      var sway = U.kind === 'a' && !u.fight ? Math.sin(now / 130 + u.id) * 0.06 : u.fight ? Math.sin(now / 90 + u.id) * 0.05 : 0;
      if (sp) drawSprite(sp, R.dx + lunge, y + bob + drop, sz * squash, u.team, Math.floor(now / 180 + u.id) % sp.frames.length, R.flash, sway);
      if (CL && CL.mineIds[u.id]) c.restore();
      R.flash = Math.max(0, (R.flash || 0) - dt * 6);
      // health
      if (u.hp < u.max) { var bw = Math.max(26, sz * 0.5); c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(R.dx - bw / 2, y - sz - 8, bw, 5); c.fillStyle = u.hp / u.max > 0.5 ? '#3BFF8A' : u.hp / u.max > 0.25 ? '#FFC94A' : '#E0463C'; c.fillRect(R.dx - bw / 2, y - sz - 8, bw * Math.max(0, u.hp / u.max), 5); }
      if (u.lv > 1) { c.font = Math.round(Math.max(9, sz * 0.13)) + 'px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#FFC94A'; c.fillText('★'.repeat(Math.min(5, u.lv - 1)), R.dx, y - sz - 14); }
      if (CL && CL.mineIds[u.id]) { c.font = 'bold 11px sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('YOU', R.dx, y + 14); }
      else if (U.hero) { var hn = heroOf(u); if (hn && hn.n) { c.font = 'bold 11px sans-serif'; c.fillStyle = '#FFE14D'; c.textAlign = 'center'; c.fillText(hn.n, R.dx, y + 14); } }
      // peas from pigeons
      if (U.reach && u.fight && Math.random() < dt * 2.2) { var tg = S.units.filter(function (o) { return o.id === u.fight; })[0]; if (tg) V.peas.push({ x0: R.dx + dirn * sz * 0.3, y0: y - sz * 0.5, x1: G.X(tg.x), y1: laneY(G, tg.lane) - sizeOf(L.UNITS[tg.type].who, G) * 0.5, t: 0 }); }
      // sparks when fighting
      if (u.fight && Math.random() < dt * 3 && !U.reach) V.parts.push({ k: 'spark', x: R.dx + dirn * sz * 0.35, y: y - sz * 0.5, vx: (Math.random() - 0.5) * 120, vy: -Math.random() * 120, life: 0.35, t: 0 });
    });
    Object.keys(V.units).forEach(function (id) { if (!alive[id]) delete V.units[id]; });
    // peas
    V.peas = V.peas.filter(function (p) { p.t += dt * 3.5; if (p.t >= 1) { V.parts.push({ k: 'spark', x: p.x1, y: p.y1, vx: 0, vy: -40, life: 0.25, t: 0, col: '#7CFF6B' }); return false; } var x = p.x0 + (p.x1 - p.x0) * p.t, y = p.y0 + (p.y1 - p.y0) * p.t - Math.sin(p.t * Math.PI) * 14; c.fillStyle = '#5BD14A'; c.strokeStyle = '#1d5a14'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); c.stroke(); return true; });
    // Zero rolling down a lane
    V.rollers = V.rollers.filter(function (r) {
      var u = (now - r.t0) / 900; if (u >= 1) return false;
      var x = r.team ? w - G.vw - u * (w - 2 * G.vw) : G.vw + u * (w - 2 * G.vw), y = laneY(G, r.lane), sp = SP.get('zero'), sz = sizeOf('zero', G) * 1.3;
      if (sp) { c.save(); c.translate(x, y - sz / 2); c.rotate((r.team ? -1 : 1) * u * 18); c.drawImage(sp.frames[0], -sz / 2, -sz / 2, sz, sz); c.restore(); }
      for (var i = 0; i < 3; i++) V.parts.push({ k: 'spark', x: x, y: y - Math.random() * sz, vx: (r.team ? 1 : -1) * 80, vy: (Math.random() - 0.5) * 80, life: 0.4, t: 0, col: '#FFA23A' });
      return true;
    });
    // Mux charging down a lane
    V.mowers = V.mowers.filter(function (m) {
      var u = (now - m.t0) / 900; if (u >= 1) return false;
      var sp = SP.get('mux'), sz = sizeOf('mux', G), x = m.team ? w - G.vw - u * (w / 2 - G.vw) : G.vw + u * (w / 2 - G.vw);
      if (sp) drawSprite(sp, x, laneY(G, m.lane), sz, m.team, 0);
      for (var i = 0; i < 2; i++) V.parts.push({ k: 'dust', x: x - (m.team ? -1 : 1) * sz * 0.4, y: laneY(G, m.lane), vx: (m.team ? 1 : -1) * 60, vy: -Math.random() * 60, life: 0.5, t: 0 });
      return true;
    });
    // particles
    V.parts = V.parts.filter(function (p) {
      p.t += dt; if (p.t >= p.life) return false;
      var a = 1 - p.t / p.life;
      p.vy += (p.g || (p.k === 'ghost' ? 700 : p.k === 'coin' ? 520 : 0)) * dt; p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt;
      if (p.k === 'ghost') { var sp = SP.get(p.who); p.rot += p.vr * dt; if (sp) { c.save(); c.globalAlpha = a; c.translate(p.x, p.y - p.size / 2); c.rotate(p.rot); c.scale(p.team ? -1 : 1, 1); var k = p.size / sp.h; c.drawImage(sp.frames[0], -sp.w * k / 2, -p.size / 2, sp.w * k, p.size); c.restore(); } }
      else if (p.k === 'poof') { c.fillStyle = 'rgba(255,255,255,' + (a * 0.8) + ')'; c.beginPath(); c.arc(p.x, p.y, p.r * (1.5 - a * 0.5), 0, 7); c.fill(); }
      else if (p.k === 'dust') { c.fillStyle = 'rgba(210,180,120,' + (a * 0.6) + ')'; c.beginPath(); c.arc(p.x, p.y, 3 + (1 - a) * 6, 0, 7); c.fill(); }
      else if (p.k === 'spark') { c.fillStyle = p.col || 'rgba(255,230,120,' + a + ')'; c.globalAlpha = a; c.beginPath(); c.arc(p.x, p.y, 2.5, 0, 7); c.fill(); c.globalAlpha = 1; }
      else if (p.k === 'coin') { c.globalAlpha = a; c.font = '16px serif'; c.textAlign = 'center'; c.fillText('🪙', p.x, p.y); c.globalAlpha = 1; }
      else if (p.k === 'text') { c.globalAlpha = Math.min(1, a * 2); c.font = '400 ' + (p.big ? 30 : 20) + 'px "Luckiest Guy", system-ui'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = '#1b1a22'; c.strokeText(p.s, p.x, p.y); c.fillStyle = p.col; c.fillText(p.s, p.x, p.y); c.globalAlpha = 1; }
      else if (p.k === 'confetti') { c.save(); c.translate(p.x, p.y); c.rotate(p.t * 8); c.fillStyle = p.col; c.globalAlpha = a; c.fillRect(-4, -2, 8, 4); c.restore(); }
      return true;
    });
    if (fz && Math.random() < dt * 3) V.parts.push({ k: 'spark', x: Math.random() * w, y: 0, vx: 0, vy: 160, life: 1.2, t: 0, col: 'rgba(255,120,60,.8)' });
  }
  function drawSprite(sp, x, y, height, team, frame, flash, rot) {
    var f = sp.frames[frame % sp.frames.length], k = height / sp.h, wdt = sp.w * k;
    ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (team) ctx.scale(-1, 1);
    ctx.drawImage(f, -wdt / 2, -height, wdt, height);
    if (flash > 0.05) { ctx.globalAlpha = Math.min(0.7, flash); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(f, -wdt / 2, -height, wdt, height); }
    ctx.restore();
  }
  function ring(c, x, y, r, frac, col, label) {
    c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.arc(x, y, r + 3, 0, 7); c.fill();
    c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, frac))); c.stroke();
    c.fillStyle = '#fff'; c.font = 'bold 11px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, x, y + 1); c.textBaseline = 'alphabetic';
  }

  /* ---------- the HUD: gold, clock, the wave meter, comeback, end of the battle ---------- */
  function hudTick() {
    if (root && A.MODE !== 'student' && V && V.c && V.c.rally && V.c.rally.st === 1) { var rp = root.querySelector('.lcrallyp'); if (!rp || rp._k !== V.c.rally.r.join() + V.c.rally.of.join()) { rallyPanel(); rp = root.querySelector('.lcrallyp'); if (rp) rp._k = V.c.rally.r.join() + V.c.rally.of.join(); } else { var tt = rp.querySelector('.lcrallyt'); if (tt) tt.textContent = rallyLeft(V.c) + ' s'; } }
    else if (root && A.MODE !== 'student') { var rp2 = root.querySelector('.lcrallyp'); if (rp2) rp2.remove(); }
    if (!root || !V) return;
    var c = V.c, S = V.S, T0 = nowT(c), T = teamNames(c.id);
    [0, 1].forEach(function (t) {
      var b = hud['team' + t]; if (!b) return;
      var g = S ? S.score[t] : c.score[t], gEl = b.querySelector('.lcgold');
      if (String(g) !== gEl.textContent) { gEl.textContent = g; b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
      b.querySelector('.lcyou').hidden = t !== me; b.classList.toggle('mine', t === me);
      b.querySelector('.lccb').hidden = !(S && L.comeback(S, t) && c.state === 1);
    });
    var left = Math.max(0, (c.dur - T0) / 10), m = hud.mid;
    if (V.lastState === 3 && c.state === 1) started();
    V.lastState = c.state;
    m.querySelector('.lcclock').textContent = c.state === 2 ? 'Time!' : Math.floor(left / 60) + ':' + ('0' + Math.floor(left % 60)).slice(-2);
    var u = T0 / c.dur; m.querySelector('.lcbar').style.width = (u * 100) + '%'; m.querySelector('.lchead').style.left = (u * 100) + '%';
    var fz = L.frenzy(T0, c.dur), wave = fz ? 2 : u >= 0.5 ? 1 : 0;
    m.querySelector('.lcwavet').textContent = c.state === 3 ? 'Starts in ' + Math.max(0, Math.ceil(((V.briefEnd || 0) - performance.now()) / 1000)) + ' s' : c.state === 2 ? 'Battle over' : fz ? '🔥 FINAL WAVE: faster, double gold!' : wave ? '⚑ Wave 2' : 'Battle!';
    root.classList.toggle('frenzy', fz);
    if (wave > V.wave && c.state === 1) { V.wave = wave; sfx('wave'); shout({ e: wave === 2 ? 'max' : 'one', who: wave === 2 ? 'THE FINAL WAVE!' : 'A WAVE IS COMING!', text: wave === 2 ? 'Everyone moves faster. <b>Double gold</b> (triple for the team behind)!' : 'Halfway! Defend your lanes.', team: -1, mine: true, gold: true }); }
    if (S && me >= 0 && c.state === 1) { var cb = L.comeback(S, me); if (cb && !V.cb) shout({ e: 'one', who: '⚡ COMEBACK!', text: 'Your team is behind: <b>bonus coins</b> on every right answer, tougher characters and a faster Mux!', team: me, mine: true }); V.cb = cb; }
    if (A.MODE === 'student') laneButtons();
    var NMs = V.names || (CL && CL.names), nk = NMs ? JSON.stringify(NMs) + me : '';
    if (nk && nk !== V.namesShown) {
      V.namesShown = nk;
      if (hud.mates && me >= 0) hud.mates.innerHTML = '<b style="color:' + TC[me] + '">' + T[me].e + ' Your team</b> ' + NMs[me].map(function (n) { return esc(n); }).join(', ');
      if (hud.rosters) hud.rosters.innerHTML = [0, 1].map(function (t) { return '<p><b style="color:' + TC[t] + '">' + T[t].e + ' ' + esc(T[t].name) + ':</b> ' + NMs[t].map(function (n) { return esc(n); }).join(', ') + '</p>'; }).join('');
    }
    if (V.watch && V.sp) shoutsFromSpot(V.sp, V.c);
    if (hud.heroes && V.sp) hud.heroes.innerHTML = V.sp.heroes.length ? '<b>Top heroes</b>' + V.sp.heroes.map(function (h, i) { return '<span>' + ['🥇', '🥈', '🥉', '4.', '5.'][i] + ' ' + T[h.team].e + ' ' + esc(h.name) + ' <small>Lv ' + h.lv + ' · ' + h.gold + ' gold · ' + h.right + ' right</small></span>'; }).join('') : '';
  }
  /* the rules: about 30 seconds of banners on every screen before the battle clock starts. Each banner gets time for its
     words; joining late skips the first ones; the last counts down to GO */
  function brief(c, T) {
    if (A.MODE === 'student' && A.S.me) me = teamOf(A.S.me.sid, c.id, clashSpot(A.live()).t0);
    var vs = '<p class="lcvs2"><span style="color:' + TC[0] + '">' + T[0].e + ' ' + esc(T[0].name) + '</span> <b>VS</b> <span style="color:' + TC[1] + '">' + T[1].e + ' ' + esc(T[1].name) + '</span></p>';
    var pics = function (ws) { return '<div class="lcpics">' + ws.map(function (w) { return '<img alt="" src="' + thumb(w) + '">'; }).join('') + '</div>'; };
    var bans = ['<span class="lcbig">⚔️</span><h2>Lane Clash</h2>' + vs + (me >= 0 ? '<p>You\'re on <b style="color:' + TC[me] + '">' + T[me].e + ' ' + esc(T[me].name) + '</b>!</p>' : '')];
    var SPn = clashSpot(A.live()), NM = SPn.names || (CL && CL.names), LK = SPn.looks || V.looks || (CL && CL.looks), AVc = window.SFA_AVATAR;
    if (NM && (NM[0].length || NM[1].length)) {
      var many = NM[0].length + NM[1].length, asz = many > 24 ? 34 : many > 14 ? 44 : 56;
      bans.push('<b class="lckick">👥 The teams</b><div class="lcrost">' + [0, 1].map(function (t) { return '<div class="t' + t + (t === me ? ' mine' : '') + '"><b style="color:' + TC[t] + '">' + T[t].e + ' ' + esc(T[t].name) + '</b><p>' + NM[t].map(function (n, i) {
        var lk = LK && LK[t] && LK[t][i], av = AVc && lk ? '<i class="lcav" style="animation-delay:' + (0.15 * i).toFixed(2) + 's">' + AVc.svg(lk, { size: asz, walk: true }) + '</i>' : '';
        return '<span' + (av ? ' class="hasav"' : '') + '>' + av + '<em class="' + (AVc && lk ? AVc.nameCls(lk) : '') + '">' + esc(n) + '</em></span>'; }).join('') + '</p></div>'; }).join('') + '</div>');
    }
    if (CL && A.MODE === 'student') bans.push('<span class="lcbig">🎁</span><b class="lckick">Your lesson bonus</b><p class="lcyours">You start with <b>' + CL.bonus + ' coins</b>' + (CL.boost ? ' at <b>hero level ' + (1 + CL.boost) + '</b>' : '') + ' for your work in today\'s lesson. Effort counts most!</p>');
    bans.push('<span class="lcbig">🧠</span><b class="lckick">Answer to earn coins</b><p class="lcyours">Five quick integer warm-ups first (1 coin each), then the lesson questions: a right first try earns <b>3 coins</b>. Three in a row earns a bonus. Every 3 right levels up your hero and unlocks new characters.</p>');
    bans.push(pics(['gus', 'rita', 'one', 'max', 'undef']) + '<b class="lckick">Send attackers</b><p class="lcyours">Pick a card, then a lane. Attackers march to the other fort and grab its gold. The bigger ones cost more but grab far more: worth saving up for!</p>');
    bans.push(pics(['sam', 'dunmore', 'pigeon', 'priya', 'zero']) + '<b class="lckick">Defend your lanes</b><p class="lcyours">Each lane has 3 planting spots. <b>Sam</b> and <b>Mr. Dunmore</b> block, <b>Pea Pigeon</b> and <b>Priya</b> shoot, and <b>Zero</b> erases every enemy in a lane.</p>');
    bans.push('<span class="lcbig">⚔️</span><b class="lckick">Counters win battles</b><p class="lcyours">🎯 <b>Shooters</b> beat 🏃 <b>runners</b>. 🦍 <b>Giants</b> shrug off shooters. 🧱 <b>Walls</b> beat giants. 💥 <b>Breakers</b> smash walls and shooters. ⭕ <b>Zero</b> clears a whole lane. Pick a card to see what it\'s good against.</p>');
    bans.push(pics(['hero']) + '<b class="lckick">🌟 Your avatar and 📣 rallies</b><p class="lcyours">After 5 right answers you can send <b>your own Wardrobe avatar</b> down a lane, free, once a battle: the higher your arcade level, the stronger it is. Every 90 seconds a <b>team rally</b> question pops up: if 60% of your team gets it right, you win a free character.</p>');
    bans.push('<span class="lcbig">🏰</span><b class="lckick">Watch your fort</b><p class="lcyours">A red <b>!</b> at a gate means enemies are close. <b>Mux</b> charges the first one to reach a gate. 📣 Call your team for help.</p>');
    bans.push('<span class="lcbig">🔥</span><b class="lckick">Never give up</b><p class="lcyours">The last minute is the <b>final wave</b>: double gold. A team that falls behind gets bonus coins and tougher characters.</p>');
    var words = bans.map(function (h) { return /lcrost/.test(h) ? 14 : h.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length; });
    var b = H('div', 'lcend lcbrief'), box = H('div', 'lcban'), dots = H('div', 'lcdots'), tmr = 0, cdT = 0;
    b.appendChild(box); b.appendChild(dots); root.appendChild(b);
    var left = function () { return Math.max(0, ((V && V.briefEnd) || 0) - performance.now()); };
    // fit the banners into the time left (4 s kept for the countdown): drop the first ones if each would be too quick
    // the teams banner is never skipped: it comes out first and goes back in at the front
    var ri = -1; bans.forEach(function (h, i) { if (/lcrost/.test(h)) ri = i; });
    var rost = ri >= 0 ? bans.splice(ri, 1)[0] : null, rw = ri >= 0 ? words.splice(ri, 1)[0] : 0;
    var from = 0, room = function () { return left() - 4000; }, room0 = function () { return room() - (rost ? 4500 : 0); };
    while (from < bans.length - 1 && room0() / words.slice(from).reduce(function (a, n) { return a + n; }, 0) * Math.min.apply(null, words.slice(from)) < 3000) from++;
    var list = bans.slice(from), wl = words.slice(from);
    if (rost) { if (from === 0 && ri > 0) { list.splice(ri, 0, rost); wl.splice(ri, 0, rw); } else { list.unshift(rost); wl.unshift(rw); } } list.push('<b class="lckick">Get ready…</b><h2 class="lccount">3</h2>' + vs);
    list.forEach(function () { dots.appendChild(H('i')); });
    function show(i) {
      clearTimeout(tmr); clearInterval(cdT); if (!b.isConnected) return;
      box.innerHTML = list[i]; box.classList.remove('in'); void box.offsetWidth; box.classList.add('in');
      [].forEach.call(dots.children, function (d, k) { d.className = k === i ? 'on' : k < i ? 'done' : ''; });
      if (i === list.length - 1) { var n = box.querySelector('.lccount'); cdT = setInterval(function () { var s0 = Math.ceil(left() / 1000); n.textContent = s0 > 0 ? String(Math.min(s0, 9)) : 'GO!'; }, 200); return; }
      var tot = wl.slice(i).reduce(function (a, x) { return a + x; }, 0), ms = Math.max(2500, room() * wl[i] / Math.max(1, tot));
      tmr = setTimeout(function () { show(i + 1); }, ms);
    }
    b.onclick = function () { var on = [].indexOf.call(dots.children, dots.querySelector('.on')); if (on >= 0 && on < list.length - 1) show(on + 1); };
    V.briefEl = b; show(0);
    if (CL) { CL.intro = true; keep(); }
  }
  // the rules are over: everyone's board comes alive at once
  function started() {
    if (V.briefEl) { V.briefEl.remove(); V.briefEl = null; }
    sfx('wave'); shout({ e: 'max', who: 'GO!', text: 'The battle is on. <b>Answer, earn, send!</b>', team: -1, mine: true, gold: true });
    if (A.MODE === 'student') { drawQ(); drawCards(); }
  }
  function intro(c, T) {
    if (CL && CL.intro) return;
    var b = H('div', 'lcintro');
    var bonus = CL && A.MODE === 'student' ? '<p class="lcbonus">🎁 Lesson bonus: <b>' + CL.bonus + ' coins</b>' + (CL.boost ? ' and you start at <b>hero level ' + (1 + CL.boost) + '</b>' : '') + ', for today\'s lesson (' + CL.stats.answered + ' answered' + (CL.stats.extras ? ', ' + CL.stats.extras + ' go-further' : '') + (CL.stats.probed ? ', ' + CL.stats.probed + ' machine' + (CL.stats.probed === 1 ? '' : 's') + ' probed' : '') + ', ' + CL.stats.correct + ' right). Effort counts most!</p>' : '';
    b.innerHTML = '<div class="lcintro-in"><h1>⚔️ LANE CLASH</h1><div class="lcvs"><span style="color:' + TC[0] + '">' + T[0].e + ' ' + esc(T[0].name) + '</span><b>VS</b><span style="color:' + TC[1] + '">' + T[1].e + ' ' + esc(T[1].name) + '</span></div>' + bonus +
      '<p>Answer questions → earn coins → pick a character card → pick a lane.<br>Get to their vault and grab their gold. Mux guards each lane once.</p><div class="lcintro-cast">' + L.ORDER.map(function (t) { return '<img alt="" src="' + thumb(L.UNITS[t].who) + '">'; }).join('') + '</div></div>';
    root.appendChild(b);
    setTimeout(function () { b.classList.add('out'); }, A.MODE === 'screen' ? 6000 : 4500);
    setTimeout(function () { b.remove(); }, A.MODE === 'screen' ? 6600 : 5100);
    if (CL) { CL.intro = true; keep(); }
  }
  var AWARD = { gold: ['💰', 'Gold Grabber', 'gold'], right: ['🧠', 'Brain Box', 'right'], best: ['🔥', 'On Fire', 'in a row'], def: ['🛡️', 'Wall Builder', 'defenders'], lv: ['🦸', 'Top Hero', ''] };
  function showEnd(c, sp) {
    V.over = true; sfx('win');
    var T = teamNames(c.id), S = V.S || { score: c.score }, win = S.score[0] === S.score[1] ? -1 : S.score[0] > S.score[1] ? 0 : 1;
    if (CL && A.MODE === 'student' && (CL.right || CL.wr)) xp(30 + (win === me ? 30 : 0), true);   // finishing bonus, once
    // the results as banners, one at a time (no scrolling): the winner, each MVP, each award, your own battle, then a
    // summary that stays. Each stays up as long as it takes to read; a tap moves on
    var head = win < 0 ? 'It\'s a draw!' : T[win].e + ' ' + esc(T[win].name) + ' wins!', score = '<p class="lcfinal"><span style="color:' + TC[0] + '">' + S.score[0] + '</span> gold to <span style="color:' + TC[1] + '">' + S.score[1] + '</span> gold</p>';
    var bans = ['<h1>' + head + '</h1>' + score];
    [0, 1].forEach(function (t) { var m = sp.mvp[t]; if (m) bans.push('<span class="lcbig">🏅</span><b class="lckick" style="color:' + TC[t] + '">' + T[t].e + ' ' + esc(T[t].name) + ' MVP</b><h2>' + esc(m.name) + '</h2><p>' + m.gold + ' gold grabbed · ' + m.right + ' right</p>'); });
    (sp.awards || []).forEach(function (a) { var t = AWARD[a.k] || ['🏅', a.k, '']; bans.push('<span class="lcbig">' + t[0] + '</span><b class="lckick">' + esc(t[1]) + '</b><h2>' + esc(a.name) + '</h2><p>' + T[a.team].e + ' ' + esc(T[a.team].name) + ' · ' + (a.k === 'lv' ? 'hero level ' + a.n : a.n + ' ' + (a.n === 1 ? t[2].replace(/s$/, '') : t[2])) + '</p>'); });
    if (CL && A.MODE === 'student') bans.push('<b class="lckick">Your battle</b><p class="lcyours">You answered <b>' + CL.right + '</b> right, reached <b>hero level ' + lv() + '</b>, sent <b>' + CL.sent + '</b> characters and grabbed <b>' + CL.gold + '</b> gold.</p>');
    bans.push('<h1 class="still">' + head + '</h1>' + score + '<p class="sub">Back to the lesson when ' + A.TEACHER + ' says so.</p><button type="button" class="btn lcagain">↻ See the results again</button>');
    shoutQ = []; [].forEach.call(root.querySelectorAll('.lcshout'), function (x) { x.remove(); });
    var b = H('div', 'lcend'), box = H('div', 'lcban'), dots = H('div', 'lcdots'), at = 0, tmr = 0;
    b.appendChild(box); b.appendChild(dots); root.appendChild(b);
    bans.forEach(function () { dots.appendChild(H('i')); });
    function readMs(html) { var words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length; return Math.max(3000, Math.min(9000, 1600 + words * 380)); }
    function show(i) {
      clearTimeout(tmr); at = i; if (!root || !b.isConnected) return;
      box.innerHTML = bans[i]; box.classList.remove('in'); void box.offsetWidth; box.classList.add('in');
      [].forEach.call(dots.children, function (d, k) { d.className = k === i ? 'on' : k < i ? 'done' : ''; });
      var again = box.querySelector('.lcagain'); if (again) again.onclick = function (e) { e.stopPropagation(); show(0); };
      if (i > 0 && i < bans.length - 1) sfx('pop');
      if (i < bans.length - 1) tmr = setTimeout(function () { show(i + 1); }, readMs(bans[i]));
    }
    b.onclick = function () { if (at < bans.length - 1) show(at + 1); };
    show(0);
    if (hud.q) hud.q.innerHTML = '';
    var G = geo(); for (var i = 0; i < 140; i++) V.parts.push({ k: 'confetti', x: Math.random() * G.w, y: -Math.random() * 200, vx: (Math.random() - 0.5) * 80, vy: 80 + Math.random() * 120, life: 3 + Math.random() * 2, t: 0, g: 30, col: ['#FFC94A', '#5CC8FF', '#E0463C', '#3BFF8A', '#fff'][i % 5] });
    if (CL && A.MODE === 'student') send();
  }

  /* ---------- shout-outs ---------- */
  function shoutsFromSpot(sp, c) {
    var top = sp.ev.length ? sp.ev[sp.ev.length - 1].seq : 0, T = teamNames(c.id), myName = A.MODE === 'student' && A.S.me ? A.first(A.S.me.name) : '';
    if (shoutSeen < 0) { shoutSeen = top; return; }
    sp.ev.forEach(function (e) {
      if (e.seq <= shoutSeen) return;
      var U = L.UNITS[e.type] || L.UNITS[0], mine = me >= 0 && e.team === me, isMe = mine && e.name === myName;
      if (e.k === 's' && !isMe && U.hero) shoutQ.push({ e: 'gus', img: heroURL(lookByName(e.name), 64), who: e.name.toUpperCase(), text: 'sent their <b>🌟 AVATAR HERO</b> down lane ' + (e.lane + 1) + '!', team: e.team, mine: mine, gold: true });
      else if (e.k === 's' && !isMe) shoutQ.push({ e: U.who, who: e.name.toUpperCase(), text: (U.kind === 'd' ? 'planted ' : 'sent ') + '<b>' + esc(U.name.toUpperCase()) + '</b> ' + (U.kind === 's' ? 'rolling down lane ' + (e.lane + 1) : U.kind === 'd' ? 'in lane ' + (e.lane + 1) : 'down lane ' + (e.lane + 1)) + '!', team: e.team, mine: mine });
      if (e.k === 'g' && !isMe) shoutQ.push({ e: U.who, who: e.name.toUpperCase() + '\'S ' + U.name.toUpperCase(), text: 'grabbed <b>' + e.n + ' GOLD</b> from ' + esc(T[1 - e.team].name) + '!', team: e.team, mine: mine, gold: true });
      if (e.k === 'p' && (mine || A.MODE === 'screen') && !isMe) shoutQ.push({ e: 'gus', who: '📣 ' + e.name.toUpperCase() + ':', text: '<b>Help in lane ' + (e.lane + 1) + '!</b>', team: e.team, mine: mine, small: true });
      if (e.k === 't') shoutQ.push({ e: 'max', who: '⏰ +1 MINUTE!', text: A.TEACHER + ' added time to the battle.', team: -1, mine: true });
      if (e.k === 'h') shoutQ.push({ e: 'max', who: e.name.toUpperCase(), text: 'reached <b>HERO LEVEL ' + e.n + '</b>!', team: e.team, mine: mine, gold: true });
    });
    shoutSeen = Math.max(shoutSeen, top); if (shoutQ.length > 5) shoutQ = shoutQ.slice(-5);
    nextShout();
  }
  function shout(o) { shoutQ.push(o); nextShout(); }
  function nextShout() {
    if (V && V.over) { shoutQ = []; return; }   // the results banners have the stage now
    if (shoutBusy || !shoutQ.length || !root) return;
    var o = shoutQ.shift(); shoutBusy = true;
    var b = H('div', 'lcshout' + (o.team === -1 ? ' wave' : o.mine ? ' ours' : ' theirs') + (o.gold ? ' gold' : '') + (o.small ? ' small' : ''));
    b.innerHTML = '<img alt="" src="' + (o.img || thumb(o.e)) + '"><span><b class="who">' + esc(o.who) + '</b> ' + o.text + '</span>';
    root.appendChild(b);
    var d = o.small ? 1400 : A.MODE === 'screen' ? 2600 : 2000;
    setTimeout(function () { b.classList.add('out'); }, d);
    setTimeout(function () { b.remove(); shoutBusy = false; nextShout(); }, d + 400);
  }

  /* =========================== the teacher console: referee =========================== */
  function C() { return A.console_().clash; }
  // fair teams from today's live lesson only: each student's strength is what they did in it (answered, go-further
  // extras and machines probed, plus half for being right: the lesson bonus's measure), with a bump for anyone still
  // answering in the last 10 minutes. The students here today are split evenly in number, then swapped in pairs until
  // the two teams' strength is as close as it gets; the ones with nothing today are split evenly after them
  function strengthOf(sid, now) {
    var st = statsFor(sid), lastAt = 0;
    (A.consoleAnswers() || []).forEach(function (a) { if (a.sid === sid && !A.beforeRun(a) && a.q !== 'zflag' && a.q !== 'zclash') lastAt = Math.max(lastAt, Date.parse(a.time) || 0); });
    return { here: !!lastAt, s: st.answered + st.extras + st.probed + 0.5 * st.correct + (now - lastAt < 600000 ? 3 : 0) };
  }
  function draftTeams() {
    var now = Date.now() + (A.console_().skew || 0), str = {}, here = [], away = [];
    A.rosterIn().forEach(function (r) { var x = str[r.sid] = strengthOf(r.sid, now); (x.here ? here : away).push(r.sid); });
    var shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    // a snake draft (A B B A) down the strength order, ties in random order
    var order = shuffle(here).sort(function (a, b) { return str[b].s - str[a].s; }), side = [[], []];
    order.forEach(function (sid, i) { side[[0, 1, 1, 0][i % 4]].push(sid); });
    // then the swap that most closes the gap, again and again (sizes stay the same)
    var sum = function (t) { return side[t].reduce(function (n, sid) { return n + str[sid].s; }, 0); };
    for (var it = 0; it < 60; it++) {
      var gap = sum(0) - sum(1), best = null, bestGap = Math.abs(gap);
      side[0].forEach(function (a, i) { side[1].forEach(function (b, j) { var g = Math.abs(gap - 2 * (str[a].s - str[b].s)); if (g < bestGap - 0.01) { bestGap = g; best = [i, j]; } }); });
      if (!best) break;
      var x = side[0][best[0]]; side[0][best[0]] = side[1][best[1]]; side[1][best[1]] = x;
    }
    // the ones not here today: alternate, starting with the smaller team
    var team = {}; side.forEach(function (l, t) { l.forEach(function (sid) { team[sid] = t; }); });
    shuffle(away).forEach(function (sid) { var n0 = side[0].length, n1 = side[1].length, t = n0 < n1 ? 0 : n1 < n0 ? 1 : (Math.random() < 0.5 ? 0 : 1); side[t].push(sid); team[sid] = t; });
    return Promise.resolve({ team: team, power: [sum(0), sum(1)].map(Math.round), here: [0, 1].map(function (t) { return side[t].filter(function (sid) { return str[sid].here; }).length; }) });
  }
  function start(mins) {
    return draftTeams().then(function (d) {
      var t = Math.round(Date.now() / 1000) * 1000;
      A.console_().clash = { id: t, go: t + BRIEF * 1000, state: 3, S: L.newState(Math.round((mins || 5) * 600)), team: d.team, power: d.power, hereN: d.here, acc: {}, hero: {}, events: [], seq: Math.round(t / 1000) % 100000, mvp: [], frozen: false, lastPush: 0 };
      A.pushLive(); A.consolePanel();
    });
  }
  function cNow(K) { return Math.max(0, Math.min(K.S.dur, (Date.now() - (K.go || K.id)) / 100)); }
  function briefLeft(K) { return K.state === 3 ? Math.max(0, Math.ceil(((K.go || K.id) - Date.now()) / 1000)) : 0; }
  // the lesson numbers for one student, from the console's copy of the answers (the same rule the student page uses)
  function statsFor(sid) { var last = {}; (A.consoleAnswers() || []).forEach(function (a) { if (a.sid === sid && !A.beforeRun(a)) last[a.q] = a; }); return lessonStatsFrom(last); }
  function ev(K, k, name, team, lane, type, n) { K.events.push({ seq: ++K.seq, k: k, name: String(name || '').replace(/[~;#,]/g, '').slice(0, 16), team: team, lane: lane || 0, type: type || 0, n: n || 0 }); if (K.events.length > 6) K.events = K.events.slice(-6); }
  function agg() {
    var K = C(); if (!K || K.frozen) return;
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = r; });
    if (!K.team && K.t0 && Object.keys(ids).length) { K.team = {}; Object.keys(ids).forEach(function (sid) { K.team[sid] = teamOf(sid, K.id, K.t0); }); }
    var key = 'id:' + Math.round(K.id / 1000) + ';', last = {};
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q === 'zclash' && ids[a.sid] && String(a.answer).indexOf(key) >= 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    var T0 = cNow(K);
    Object.keys(last).forEach(function (sid) {
      var s = String(last[sid].answer), get = function (k) { var m = s.match(new RegExp(';' + k + ':(\\d+)')); return m ? +m[1] : 0; };
      var team = K.team && sid in K.team ? K.team[sid] : hashTeam(sid, K.id), r = get('r');
      var st = statsFor(sid), bonus = L.lessonBonus(st.answered, st.correct, st.extras, st.probed);
      var acc = K.acc[sid] || (K.acc[sid] = { n: K.primed === false ? -1 : 0, spent: 0, cd: {}, lvSeen: 0, ping: K.primed === false ? null : 0 });
      // the student's page counted its own lesson bonus (b) and level boost (v); the console's count can differ (Start fresh,
      // a class filter, answers still on their way), so take the larger, capped at the most a lesson can give
      var myB = Math.min(10, Math.max(bonus.coins, get('b'))), myV = Math.min(2, Math.max(bonus.boost, get('v')));
      var budget = myB + 9 * r + 3 * Math.min(10, get('w')) + 4, lvMax = L.lvOf(r, myV);
      var D = K.diag || (K.diag = { students: {}, placed: 0, turned: {}, last: 0 }); D.students[sid] = 1; D.last = Math.max(D.last, Date.parse(last[sid].time) || 0);
      // turned away: counted for the console, and announced (by the placement's id) so that student gets the coins back
      var turn = function (why, k, code) { D.turned[why] = (D.turned[why] || 0) + 1; K.rej = (K.rej || []).concat([[pid(sid, K.id, k, 0), code]]).slice(-12); };
      var H0 = K.hero[sid] || (K.hero[sid] = { name: A.first(ids[sid].name), team: team, gold: 0, right: 0, best: 0, def: 0, lv: 1 }); H0.right = r; H0.best = Math.min(get('sk'), r); H0.lv = lvMax;
      // a call for help: "g:lane.tick", newest only
      var g = (s.match(/;g:(\d)\.(\d+)/) || null);
      if (g && (acc.ping == null || +g[2] > acc.ping)) { if (acc.ping != null) ev(K, 'p', H0.name, team, +g[1], 0, 0); acc.ping = +g[2]; } else if (acc.ping == null) acc.ping = 0;   // after a console reload, an old call isn't replayed
      if (lvMax >= 4 && lvMax > acc.lvSeen && acc.lvSeen) ev(K, 'h', H0.name, team, 0, 0, lvMax);
      acc.lvSeen = lvMax;
      var ra = s.match(/;ra:(\d+)\.([01])/), RL = K.rally;
      if (ra && RL && RL.st === 1 && +ra[1] === RL.no && RL.ans[sid] == null) { RL.ans[sid] = +ra[2]; RL.of[team]++; if (+ra[2]) RL.r[team]++; }
      // the row holds the newest placements; n: says how many came before them (rows from before n: start at 0)
      var list = ((s.match(/;p:([0-9.,]*)/) || [, ''])[1]).split(',').filter(Boolean), n0 = get('n');
      if (acc.n < 0) { acc.n = n0 + list.length; return; }   // console reloaded mid-battle: those are already on the board
      var busy = {}; K.S.units.concat(K.S.pend).forEach(function (u) { busy[u.id] = 1; });
      for (var i = Math.max(0, acc.n - n0); i < list.length; i++) {
        var k = n0 + i, p = list[i].split('.').map(Number), l = p[0], t = p[1], d = p[2], v = p[3], U = L.UNITS[t];
        if (!U || !(l >= 0 && l < L.LANES) || p.length < 4) { turn('garbled', k, 'g'); continue; }
        if (U.hero && acc.hero) { turn('avatar already sent', k, 'h'); continue; }
        if (U.hero && r + get('w') < U.need) { turn('avatar not unlocked', k, 'u'); continue; }
        if (U.lv > lvMax) { turn('level too low', k, 'l'); continue; }
        if (acc.spent + U.cost > budget) { turn('not enough coins', k, 'c'); continue; }
        if ((acc.cd[t] || -1e9) > d + 20) { turn('still recharging', k, 'r'); continue; }
        if (K.S.units.concat(K.S.pend).filter(function (u) { return u.team === team; }).length >= BOARD_CAP) { turn('board full', k, 'f'); continue; }
        if (U.kind === 'd' && L.planted(K.S, team, l) >= L.TILES.length) { turn('spots taken', k, 's'); continue; }
        D.placed++;
        acc.spent += U.cost; acc.cd[t] = d + U.cd; if (U.kind === 'd') H0.def++; if (U.hero) acc.hero = 1;
        var at = Math.max(Math.ceil(T0) + 5, Math.min(d + L.DEPLOY, Math.ceil(T0) + L.DEPLOY + 20)), id = 0;
        for (var j = 0; j < 6 && !id; j++) { var c0 = pid(sid, K.id, k, j); if (!busy[c0]) id = c0; }
        if (id) busy[id] = 1;
        L.place(K.S, { id: id || undefined, team: team, lane: l, type: t, lv: U.hero ? Math.min(Math.max(1, v || 1), L.heroLv(lookLvOf(sid))) : Math.min(v || 1, lvMax), at: at, owner: H0.name, sid: sid, d: d });
        if (U.cost >= 5 || U.hero) ev(K, 's', H0.name, team, l, t, 0);
      }
      acc.n = Math.max(acc.n, n0 + list.length);
    });
    K.primed = true;
  }
  // every half second: run the battle to now, send the board out about once a second
  function refFx(e) {
    var K = C(); if (!K) return;
    if (e.k === 'grab') { var h = K.hero[e.u.sid]; if (h) h.gold += e.gold; if (e.gold >= 8) ev(K, 'g', e.u.owner, e.u.team, e.u.lane, e.u.type, e.gold); }
    if (root && V && V.watch) onFx(e);   // the teacher is watching: animate it too
  }
  function tick() {
    var K = C(); if (!K) return;
    if (K.state === 3 && Date.now() >= (K.go || K.id)) { K.state = 1; A.pushLive(); A.consolePanel(); }
    if (!K.frozen && K.state === 1) {
      L.advance(K.S, Math.floor(cNow(K)), refFx);
      rallyTick(K);
      if (K.S.t >= K.S.dur) end();
    }
    if (K.frozen && K.endedAt && Date.now() - K.endedAt > 120000) { A.console_().clash = null; if (root && V && V.watch) close(); (A.pushNow || A.pushLive)(); A.consolePanel(); SFA.toast('The battle results closed. Everyone is back on the slides.', 4000); return; }
    if (Date.now() - K.lastPush >= PUSH_MS) { K.lastPush = Date.now(); (A.pushNow || A.pushLive)(); }
    var sig = K.state + '|' + K.S.score + '|' + Math.floor(K.S.t / 50) + '|' + Math.ceil(briefLeft(K) / 5);
    if (sig !== K.panelSig) { K.panelSig = sig; var tp = document.getElementById('tpanel'); if (tp && !tp.contains(document.activeElement)) A.consolePanel(); }
  }
  function end() {
    var K = C(); if (!K || K.frozen) return;
    agg(); K.state = 2; K.frozen = true; K.endedAt = Date.now();
    // awards, so more than two students hear their name at the end
    var hs = Object.keys(K.hero).map(function (s) { return K.hero[s]; });
    // each award goes to a different student where possible (the best one not already named), so five students hear their name
    var named = {};
    K.awards = ['gold', 'right', 'best', 'def', 'lv'].map(function (k) {
      var ok = hs.filter(function (h) { return h[k] > (k === 'lv' ? 1 : 0); }).sort(function (x, y) { return y[k] - x[k] || y.gold - x.gold; });
      var top = ok.filter(function (h) { return !named[h.name + h.team]; })[0] || ok[0];
      if (top) named[top.name + top.team] = 1;
      return top ? { k: k, name: top.name, team: top.team, n: top[k] } : null;
    }).filter(Boolean);
    if (A.trophy) { var TN = teamNames(K.id), sc = K.S.score || [0, 0], wt = sc[0] === sc[1] ? -1 : sc[0] > sc[1] ? 0 : 1; A.trophy({ k: 'clash', id: K.id, win: wt, teams: TN.map(function (t) { return t.e + ' ' + t.name; }), score: sc.slice(0, 2), n: Object.keys(K.hero).length }); }
    K.mvp = [0, 1].map(function (t) { return Object.keys(K.hero).map(function (s) { return K.hero[s]; }).filter(function (h) { return h.team === t; }).sort(function (a, b) { return (b.gold + 3 * b.right) - (a.gold + 3 * a.right); })[0] || null; });
    A.pushLive(); A.consolePanel();
  }
  /* 📣 rallies: every 90 s each team gets the same question for 20 s. If 60% of a team's answers are right, the console
     drops a free character for that team into its busiest lane (Rental Rita first, then One, then Maximus). */
  function rallyList() { var P = pool_(), m = P.filter(function (q) { return q.k === 'poll' && q.opts && q.opts.length <= 5; }); return m.length ? m : P; }
  function rallyQ(R) { var P = rallyList(); return P.length ? P[R.q % P.length] : null; }
  function rallyTick(K) {
    var R = K.rally || (K.rally = { no: 0, st: 0, q: 0, at: 0, r: [0, 0], of: [0, 0], won: [0, 0], ln: [0, 0], ans: {} }), T = K.S.t;
    if (K.rNext == null) K.rNext = RALLY_FIRST;
    if (R.st === 0 && T >= K.rNext && K.S.dur - T > RALLY_WIN + 150 && rallyList().length) {
      R.no++; R.st = 1; R.q = Math.floor(Math.random() * 9999); R.at = T; R.r = [0, 0]; R.of = [0, 0]; R.won = [0, 0]; R.ln = [0, 0]; R.ans = {}; K.rNext = T + RALLY_EVERY;
      (A.pushNow || A.pushLive)(); A.consolePanel();
    } else if (R.st === 1 && T >= R.at + RALLY_WIN) {
      var types = [6, 2, 4], ty = types[Math.min(types.length - 1, R.no - 1)];
      [0, 1].forEach(function (tm) {
        if (!(R.of[tm] > 0 && R.r[tm] / R.of[tm] >= RALLY_NEED)) return;
        var press = [0, 0, 0, 0, 0]; K.S.units.forEach(function (u) { if (u.team !== tm && L.UNITS[u.type].kind === 'a') press[u.lane]++; });
        var best = 0; for (var l = 1; l < L.LANES; l++) if (press[l] > press[best]) best = l; if (!press[best]) best = Math.floor(Math.random() * L.LANES);
        var lvs = Object.keys(K.hero).map(function (s2) { return K.hero[s2]; }).filter(function (h) { return h.team === tm; }).map(function (h) { return h.lv || 1; });
        var lvT = lvs.length ? Math.max(1, Math.min(5, Math.round(lvs.reduce(function (a, b) { return a + b; }, 0) / lvs.length))) : 1;
        L.place(K.S, { team: tm, lane: best, type: ty, lv: lvT, at: Math.ceil(cNow(K)) + 5, owner: 'Rally', sid: '' });
        R.won[tm] = ty + 1; R.ln[tm] = best;
      });
      R.st = 2; (A.pushNow || A.pushLive)(); A.consolePanel();
    } else if (R.st === 2 && T >= R.at + RALLY_WIN + RALLY_SHOW) { R.st = 0; (A.pushNow || A.pushLive)(); }
  }
  function counts(out) {
    var K = C(); if (!K) return;
    var RR = K.rally; if (RR && RR.no) out.zcr = [RR.no, RR.st, RR.q, Math.min(9999, RR.at), RR.r[0], RR.of[0], RR.r[1], RR.of[1], RR.won[0], RR.won[1], RR.ln[0], RR.ln[1]];
    out.zcid = A.encRun(K.id); out.zcst = A.encRun(K.id + (A.console_().skew || 0));
    Object.assign(out, L.encode(K.S, K.state, 46));
    out.zcs.push(briefLeft(K));   // zcs[6]: seconds of rules left
  }
  function lookLvOf(sid) {
    var lv = 1, t = '';
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q !== 'zlookx1' || a.sid !== sid) return; var m = String(a.answer).match(/^lk1;[0-9a-z]{1,12};(\d+)/); if (m && String(a.time) >= t) { t = String(a.time); lv = +m[1]; } });
    return lv;
  }
  function looksBySid() {
    var out = {}, t = {};
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q !== 'zlookx1') return; var m = String(a.answer).match(/^lk1;([0-9a-z]{1,12})/); if (m && (!t[a.sid] || String(a.time) >= t[a.sid])) { t[a.sid] = String(a.time); out[a.sid] = m[1]; } });
    return out;
  }
  function teamLists(K) {
    var R = A.rosterIn().filter(function (r) { return K.team && K.team[r.sid] != null; }), cnt = {};
    var fn = function (r) { return String(A.first(r.name) || '').replace(/[^A-Za-zÀ-ÿ' -]/g, ''); };
    R.forEach(function (r) { var f = fn(r); cnt[f] = (cnt[f] || 0) + 1; });
    var out = [[], []];
    R.forEach(function (r) {
      var f = fn(r), last = String(A.nice(r.name) || '').split(' ').slice(1).join(' ');
      out[K.team[r.sid]].push({ sid: r.sid, n: (cnt[f] > 1 && last ? f + ' ' + last[0] + '.' : f).slice(0, 12) });
    });
    out.forEach(function (l) { l.sort(function (a, b) { return a.n.localeCompare(b.n); }); });
    return out;
  }
  function spot() {
    // team 0 as short fingerprints of the student ids (U:), so the list fits whatever ids the roster uses
    var K = C(), t0 = Object.keys(K.team || {}).filter(function (sid) { return K.team[sid] === 0; }).map(sh3).join(',');
    var E = K.events.map(function (e) { return [e.seq, e.k, e.name, e.team, e.lane, e.type, e.n].join('~'); }).join(';');
    var M = K.state === 2 ? K.mvp.map(function (m) { return m ? [m.name, m.gold, m.right].join('~') : ''; }).join(';') : '';
    var AW = K.state === 2 ? (K.awards || []).map(function (a) { return [a.k, a.name, a.team, a.n].join('~'); }).join(';') : '';
    // during the battle: the top five heroes, for the class screen
    var HS = K.state === 1 ? Object.keys(K.hero).map(function (s) { return K.hero[s]; }).sort(function (a, b) { return (b.gold + 3 * b.right) - (a.gold + 3 * a.right); }).slice(0, 5).map(function (h) { return [h.name, h.team, h.gold, h.right, h.lv].join('~'); }).join(';') : '';
    var RJ = (K.rej || []).map(function (r) { return r[0] + '~' + r[1]; }).join(';');
    var txt = '#E:' + E + (RJ ? '#R:' + RJ : '') + (M ? '#M:' + M : '') + (AW ? '#A:' + AW : '') + (HS ? '#H:' + HS : '');
    // who is on which team, by name, whenever there's room (always during the rules)
    var TLs = teamLists(K), NL = TLs.map(function (l) { return l.map(function (x) { return x.n.replace(/[~,#|;]/g, ''); }).join(','); }).join('|'), base = ('U:' + t0).slice(0, 595 - txt.length) + txt;
    var LKs = looksBySid(), HQ = K.S.units.concat(K.S.pend).filter(function (u) { return L.UNITS[u.type] && L.UNITS[u.type].hero; }).slice(-12).map(function (u) { return (u.id % 10000) + '~' + (LKs[u.sid] || (window.SFA_AVATAR ? SFA_AVATAR.defLook(u.sid) : '')) + '~' + String(u.owner || '').replace(/[~,#|;]/g, '').slice(0, 10); }).join(',');
    if (HQ && base.length + HQ.length + 3 <= 598) base += '#Q:' + HQ;
    var VL = TLs.map(function (l) { return l.map(function (x) { return LKs[x.sid] || (window.SFA_AVATAR ? SFA_AVATAR.defLook(x.sid) : ''); }).join(','); }).join('|');
    if (base.length + NL.length + 3 <= 598) base += '#N:' + NL;
    else if (K.state === 3) base = ('U:' + t0).slice(0, 595 - txt.length - NL.length - 3) + txt + '#N:' + NL;
    if (K.state === 3 && base.indexOf('#N:') >= 0 && base.length + VL.length + 3 <= 598) base += '#V:' + VL;   // avatars for the team intro, when they fit
    return { q: 'zclash', text: base.slice(0, 600) };
  }
  function restore(Lv) {
    var c = clashOf(Lv); if (!c) return false;
    // a battle that's over, or whose time ran out more than a minute ago (the console was closed), isn't brought back
    if (c.state === 2 || Date.now() - c.id > (c.dur || L.DUR) * 100 + BRIEF * 1000 + 60000) { A.console_().clash = null; return false; }
    var sp = clashSpot(Lv), S = L.decode(Lv.counts);
    A.console_().clash = { id: c.id, go: c.state === 3 ? Date.now() + c.brief * 1000 : Date.now() - S.t * 100, state: c.state, S: S, team: null, t0: sp.t0, acc: {}, hero: {}, events: [], seq: sp.ev.reduce(function (m, e) { return Math.max(m, e.seq); }, 0), mvp: [], frozen: c.state === 2, lastPush: 0, primed: false };
    return true;
  }
  function section(p) {
    var sec = H('div', 'sect'), K = C(), T = teamNames(K.id), left = Math.max(0, (K.S.dur - K.S.t) / 10);
    sec.appendChild(H('h3', '', '⚔️ Lane Clash'));
    var on = [0, 1].map(function (t) { return K.S.units.concat(K.S.pend).filter(function (u) { return u.team === t; }).length; });
    var size = [0, 0]; Object.keys(K.team || {}).forEach(function (s) { size[K.team[s]]++; });
    sec.appendChild(H('p', '', (K.state === 3 ? '<b>Rules on screen:</b> the battle starts in ' + briefLeft(K) + ' s. ' : K.state === 2 ? '<b>Over.</b> ' : '<b>' + Math.floor(left / 60) + ':' + ('0' + Math.floor(left % 60)).slice(-2) + '</b> left' + (L.frenzy(K.S.t, K.S.dur) ? ' · 🔥 final wave' : '') + '. ') + [0, 1].map(function (t) { return T[t].e + ' ' + esc(T[t].name) + ': <b>' + K.S.score[t] + ' gold</b> · ' + on[t] + ' on the board' + (size[t] ? ' · team of ' + size[t] : ''); }).join(' · ')));
    var r = H('div', 'row');
    if (K.state === 3) r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '⏭ Skip the rules', title: 'Start the battle now', onclick: function () { K.go = Date.now(); tick(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Watch the battle', title: 'The whole board, live, on this screen', onclick: function () { watch(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +1 minute', title: 'Add a minute to the battle (the final wave moves with it)', onclick: function () { K.S.dur = Math.min(9999, K.S.dur + 600); ev(K, 't', '', 0, 0, 0, 1); A.pushLive(); A.consolePanel(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End the battle now', onclick: function () { end(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().clash = null; A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    // diagnostics: are students' placements arriving, and are any being turned away?
    var dd = H('div');
    var D = K.diag || { students: {}, placed: 0, turned: {}, last: 0 }, nStu = Object.keys(D.students).length, turned = Object.keys(D.turned).map(function (k) { return D.turned[k] + ' ' + k; }).join(', ');
    dd.appendChild(H('p', 'state' + (K.S.t > 300 && !D.placed ? ' bad' : ''), '📡 ' + (nStu ? nStu + ' student' + (nStu === 1 ? '' : 's') + ' sending · ' + D.placed + ' character' + (D.placed === 1 ? '' : 's') + ' placed' + (turned ? ' · turned away: ' + esc(turned) : '') + (D.last ? ' · newest ' + Math.max(0, Math.round((Date.now() - D.last) / 1000)) + ' s ago' : '') : K.S.t > 200 ? 'No placements have arrived from students yet. Their answers reach this console every few seconds; if this stays empty, check they\'re signed in and on this lesson.' : 'Waiting for the first placements…') + ' · battle clock ' + Math.floor(K.S.t / 10) + ' s'));
    var heroes = Object.keys(K.hero).map(function (s) { return K.hero[s]; }).sort(function (a, b) { return (b.gold + 3 * b.right) - (a.gold + 3 * a.right); }).slice(0, 6);
    if (heroes.length) dd.appendChild(H('p', 'muted', 'Top heroes: ' + heroes.map(function (h) { return esc(h.name) + ' ' + T[h.team].e + ' ' + h.gold + 'g/' + h.right + '✓'; }).join(', ')));
    if (K.power) dd.appendChild(H('p', 'muted', '⚖️ Teams balanced on today\'s lesson: ' + [0, 1].map(function (t) { return T[t].e + ' ' + K.hereN[t] + ' taking part, strength ' + K.power[t]; }).join(' · ') + '.'));
    if (K.team) { var TL = teamLists(K), tw = H('div', 'lcteamsc'); [0, 1].forEach(function (t) { tw.appendChild(H('div', 't' + t, '<b>' + T[t].e + ' ' + esc(T[t].name) + ' (' + TL[t].length + ')</b>' + TL[t].map(function (x) { return '<span>' + esc(x.n) + '</span>'; }).join(''))); }); dd.appendChild(tw); }
    var bad = dd.querySelector('.state.bad'); if (bad) sec.appendChild(bad);   // a connection problem stays in view
    var dt = dfold('g-clash', '📋 Details · teams, top heroes, connection', false); while (dd.firstChild) dt.appendChild(dd.firstChild); sec.appendChild(dt);
    p.appendChild(sec);
  }
  function dfold(key, title, open) { if (A.fold) return A.fold(key, title, open); var d = el('details', { 'class': 'sect fold' }); d.appendChild(el('summary', {}, [H('h3', '', title)])); d.open = !!open; return d; }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 500);

  // what this screen's board shows right now (read only; the practice simulator in climb/dev compares it with the referee)
  function peek() {
    if (!V || !V.c) return null;
    return { t: nowT(V.c), state: V.c.state, snapT: V.snapT, over: V.over, units: V.S ? V.S.units.map(function (u) { return [u.id, Math.round(u.x), u.team]; }) : [], score: V.S ? V.S.score.slice() : [0, 0],
      me: me, coins: CL ? CL.coins : 0, right: CL ? CL.right : 0, sent: CL ? CL.sent : 0, mine: CL ? Object.keys(CL.mineIds).length : 0, waiting: CL ? CL.temps.length : 0, refunds: CL ? CL.refunds || 0 : 0 };
  }
  window.SFA_CLASH = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: spot, restore: restore, clashOf: clashOf, peek: peek };
})();
