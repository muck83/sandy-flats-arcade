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
  var COOL_MS = 5000, BOARD_CAP = 70, PUSH_MS = 1000;
  var TEAMS = [['Team Llama', '🦙', '#FFC94A'], ['Team Toaster', '🍞', '#5CC8FF'], ['The Wobbly Penguins', '🐧', '#FFC94A'], ['The Angry Croissants', '🥐', '#5CC8FF'], ['The Pickle Pirates', '🥒', '#FFC94A'], ['Captain Noodle\'s Crew', '🍜', '#5CC8FF'], ['The Disco Cats', '🐱', '#FFC94A'], ['The Grumpy Clouds', '☁️', '#5CC8FF']];
  var TC = ['#FFC94A', '#5CC8FF'];   // team colours: gold on the left, sky on the right
  function teamNames(id) { var k = Math.round(id / 1000) % 4; return [{ name: TEAMS[k * 2][0], e: TEAMS[k * 2][1] }, { name: TEAMS[k * 2 + 1][0], e: TEAMS[k * 2 + 1][1] }]; }
  function hashTeam(sid, id) { var h = 5381, t = String(sid) + ':' + Math.round(id / 1000); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h & 1; }
  function teamOf(sid, id, t0) { return t0 ? (t0[sid] ? 0 : 1) : hashTeam(sid, id); }
  function decRun(a) { return A.decRun(a); }

  // the battle in the live state: id (also names the teams), start in server time, and the board
  function clashOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zcs) || !Array.isArray(c.zcid)) return null;
    return { id: decRun(c.zcid), start: A.MODE === 'screen' ? decRun(c.zcid) : decRun(c.zcst) || decRun(c.zcid), state: c.zcs[3], t: c.zcs[0], score: [c.zcs[1], c.zcs[2]] };
  }
  // the spotlight slot: "T:sid,…#E:seq~kind~name~team~lane~type~n;…#M:name~gold~right;…"
  function clashSpot(Lv) {
    var o = { t0: null, ev: [], mvp: [] }, sp = Lv && Lv.spot && Lv.spot.q === 'zclash' ? String(Lv.spot.text || '') : '';
    sp.split('#').forEach(function (part) {
      var k = part.slice(0, 2), v = part.slice(2);
      if (k === 'T:') { o.t0 = {}; v.split(',').forEach(function (x) { if (x) o.t0[x] = 1; }); }
      else if (k === 'E:') o.ev = v.split(';').map(function (x) { var p = x.split('~'); return { seq: +p[0], k: p[1], name: p[2], team: +p[3], lane: +p[4], type: +p[5], n: +p[6] }; }).filter(function (e) { return e.seq && e.k; });
      else if (k === 'M:') o.mvp = v.split(';').map(function (x) { var p = x.split('~'); return p[0] ? { name: p[0], gold: +p[1] || 0, right: +p[2] || 0 } : null; });
    });
    return o;
  }
  // what a student did in today's lesson: main questions answered and right, and go-further extras done
  function lessonStatsFrom(ans) {
    var main = {}, extra = {}, n = 0, ok = 0, x = 0;
    A.LES().slides.forEach(function (s) { if (s.id && !s.warm && s.k !== 'conf') main[s.id] = 1; (s.more || []).forEach(function (m, i) { extra[A.xid(s, i)] = 1; }); });
    Object.keys(ans).forEach(function (q) { var a = ans[q]; if (!a) return; if (main[q] && a.answer) { n++; if (a.correct === true || a.correct === 'yes') ok++; } else if (extra[q] && a.answer) x++; });
    return { answered: n, correct: ok, extras: x };
  }

  /* =========================== student page and class screen =========================== */
  var root = null, cvs = null, ctx = null, hud = {}, V = null, CL = null, raf = 0, seen = null, me = -1, shoutSeen = -1, shoutQ = [], shoutBusy = false;
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  function nowT(c) { return Math.max(0, Math.min(L.DUR, (sNow() - c.start) / 100)); }

  function sync() {
    var Lv = A.live(), c = A.isLive() || A.MODE === 'screen' ? clashOf(Lv) : null;
    if (A.MODE === 'student' && A.saving() && !A.S.me) c = null;   // sign in first: the battle would cover the sign-in box
    if (!c) { close(); return; }
    if (!root || seen !== c.id) open(c);
    var sp = clashSpot(Lv);
    me = A.MODE === 'student' && A.S.me ? teamOf(A.S.me.sid, c.id, sp.t0) : -1;
    // the newest snapshot of the board: play it forward from its own time to now
    var snap = L.decode(Lv.counts);
    if (snap && (!V.snapT || snap.t !== V.snapT || V.c.state !== c.state)) {
      V.snapT = snap.t; claimMine(snap);
      L.advance(snap, nowT(c), onFx);
      if (V.S) { var keepIds = {}; snap.units.forEach(function (u) { keepIds[u.id] = 1; }); V.S.units.forEach(function (u) { if (!keepIds[u.id] && !V.fxKeys['die:' + u.id] && !V.fxKeys['grab:' + u.id]) { V.fxKeys['die:' + u.id] = 1; die(u, false); } }); }
      V.S = snap;
    }
    V.c = c; V.sp = sp;
    shoutsFromSpot(sp, c);
    if (c.state === 2 && !V.over) showEnd(c, sp);
    hudTick();
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
      if (t === 0) { var mid = H('div', 'lcmid', '<div class="lcclock">5:00</div><div class="lcwave"><i class="lcbar"></i><span class="lcflag1" title="A wave">⚑</span><span class="lcflag2" title="The final wave">🚩</span><span class="lchead">🧟</span></div><div class="lcwavet">Battle!</div>'); hud.mid = mid; top.appendChild(mid); }
    });
    root.appendChild(top);
    var stage = H('div', 'lcstage'); cvs = document.createElement('canvas'); cvs.className = 'lcboard'; stage.appendChild(cvs); root.appendChild(stage);
    ctx = cvs.getContext('2d');
    cvs.addEventListener('click', function (e) { if (A.MODE !== 'student' || V.sel < 0) return; var r = cvs.getBoundingClientRect(), y = e.clientY - r.top, lh = r.height / 3; pickLane(Math.max(0, Math.min(2, Math.floor(y / lh)))); });
    if (A.MODE === 'student') {
      var low = H('div', 'lclow'); root.appendChild(low);
      hud.q = H('div', 'lcq'); low.appendChild(hud.q);
      var side = H('div', 'lcside'); low.appendChild(side);
      hud.hero = H('div', 'lchero'); side.appendChild(hud.hero);
      hud.cards = H('div', 'lccards'); side.appendChild(hud.cards);
      hud.lanes = H('div', 'lclanes'); side.appendChild(hud.lanes);
      [0, 1, 2].forEach(function (l) { var b = el('button', { type: 'button', 'class': 'lclane' }); b.onclick = function () { pickLane(l); }; hud.lanes.appendChild(b); });
      initMine(c);
      drawCards(); drawQ();
    } else {
      var leg = H('div', 'lclegend'); L.ORDER.forEach(function (t) { var U = L.UNITS[t]; leg.appendChild(H('span', '', '<img alt="" src="' + thumb(U.who) + '"><b>' + esc(U.name) + '</b> ' + esc(U.role))); }); root.appendChild(leg);
    }
    document.body.appendChild(root);
    intro(c, T);
    raf = requestAnimationFrame(frame);
  }

  /* ---------- the student's own battle: coins, hero level, cooldowns, placements ---------- */
  function initMine(c) {
    var key = 'clash.' + A.LID, Ls = SFA.store.get(key, null);
    if (Ls && Ls.id === c.id) { CL = Ls; CL.temps = CL.temps || []; return; }
    var st = lessonStatsFrom(A.mine()), b = L.lessonBonus(st.answered, st.correct, st.extras);
    var pool = pool_(), order = pool.map(function (x, i) { return i; }), r = 0, k = (A.S.me ? A.S.me.sid : 'x') + ':' + Math.round(c.id / 1000);
    for (var h = 0; h < k.length; h++) r = (r * 31 + k.charCodeAt(h)) % 2147483647;
    for (var i = order.length - 1; i > 0; i--) { r = (r * 1103515245 + 12345) % 2147483648; var j = r % (i + 1), tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
    CL = { id: c.id, coins: b.coins, bonus: b.coins, boost: b.boost, stats: st, earned: 0, right: 0, streak: 0, cool: 0, fb: null, qi: 0, tries: 0, order: order, cd: {}, places: [], temps: [], mineIds: {}, sent: 0, gold: 0, intro: false };
    keep();
  }
  function keep() { SFA.store.set('clash.' + A.LID, CL); }
  function lv() { return L.lvOf(CL.right, CL.boost); }
  var saveT = null;
  function send() {
    keep(); clearTimeout(saveT);
    var p = CL.places.map(function (x) { return x.l + '.' + x.t + '.' + x.d + '.' + x.v; }).join(',');
    A.record({ id: 'zclash', k: 'open' }, 'c3;id:' + Math.round(CL.id / 1000) + ';r:' + CL.right + ';e:' + CL.earned + ';b:' + CL.bonus + ';v:' + CL.boost + ';p:' + p, null);
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
    if (!CL || c.state !== 1 || T0 >= L.DUR - 5) return 'The battle is over.';
    if (U.lv > lv()) return 'Unlocks at hero level ' + U.lv + '.';
    if (CL.coins < U.cost) return 'Not enough coins: answer questions to earn more.';
    if ((CL.cd[t] || 0) > T0) return U.name + ' is recharging.';
    if (l != null && U.kind === 'd' && V.S && L.planted(V.S, me, l) + CL.temps.filter(function (x) { return x.l === l && L.UNITS[x.t].kind === 'd'; }).length >= L.TILES.length) return 'Both planting spots in lane ' + (l + 1) + ' are taken.';
    if (V.S && V.S.units.concat(V.S.pend).filter(function (u) { return u.team === me; }).length >= BOARD_CAP) return 'Your team\'s lanes are packed. Wait a moment.';
    return '';
  }
  function pickCard(t) { if (V.sel !== t) { var why = canPlace(t); if (why) { SFA.toast(why); return; } } V.sel = V.sel === t ? -1 : t; drawCards(); }
  function pickLane(l) {
    if (V.sel < 0) { SFA.toast('Pick a character card first, then a lane.'); return; }
    var t = V.sel, why = canPlace(t, l); if (why) { SFA.toast(why); return; }
    var U = L.UNITS[t], T0 = Math.floor(nowT(V.c));
    CL.coins -= U.cost; CL.cd[t] = T0 + U.cd; CL.sent++;
    var p = { l: l, t: t, d: T0, v: lv() };
    CL.places.push(p); CL.temps.push({ l: l, t: t, at: T0 + L.DEPLOY, made: Date.now() });
    if (CL.places.length > 60) CL.places = CL.places.slice(-60);
    send();
    V.sel = -1; drawCards();
    var T = teamNames(V.c.id);
    shout({ e: U.who, who: 'YOU', text: (U.kind === 'd' ? 'planted ' : U.kind === 's' ? 'sent ' : 'sent ') + '<b>' + esc(U.name.toUpperCase()) + '</b> ' + (U.kind === 'd' ? 'in lane ' + (l + 1) : U.kind === 's' ? 'rolling down lane ' + (l + 1) + '!' : 'down lane ' + (l + 1) + '!'), team: me, mine: true, small: U.cost < 5 });
  }
  // a snapshot that now holds one of my placements: claim it (its glow and "You" tag), drop the gate placeholder
  function claimMine(S) {
    if (!CL || me < 0) return;
    var all = S.pend.concat(S.units);
    CL.temps = CL.temps.filter(function (x) {
      var hit = all.filter(function (u) { return u.team === me && u.lane === x.l && u.type === x.t && !CL.mineIds[u.id] && (u.at == null || Math.abs(u.at - x.at) < 150); })[0];
      if (hit) { CL.mineIds[hit.id] = 1; return false; }
      return Date.now() - x.made < 20000;   // the console never took it (out of coins, too late): forget it
    });
  }

  /* ---------- questions (the only way to earn coins) ---------- */
  function drawQ() {
    var box = hud.q; if (!box || !CL) return;
    box.innerHTML = '';
    var pool = pool_(), c = V.c;
    if (c.state !== 1) { box.appendChild(H('p', 'q', 'The battle is over.')); return; }
    if (!pool.length) { box.appendChild(H('p', 'q', 'No questions in this lesson for the Clash.')); return; }
    var bonusRound = CL.qi >= CL.order.length, q = pool[CL.order[CL.qi % CL.order.length]];
    box.appendChild(H('p', 'kick', 'Answer to earn coins · ' + (bonusRound ? 'bonus round: 1 coin' : q.hard ? '★★ hard: 4 coins' : 'right first try: 3 coins') + (CL.streak >= 2 ? ' · 🔥 ' + CL.streak + ' in a row' : '')));
    box.appendChild(H('p', 'q', fmt(q.q)));
    if (q.fig) { var f = H('div', 'cfig'); f.appendChild(A.figure(q.fig)); box.appendChild(f); }
    if (CL.fb) {
      box.appendChild(H('div', CL.fb.ok ? 'fb good' : 'fb try', CL.fb.html));
      var wait = Math.max(0, CL.cool - Date.now());
      var nx = el('button', { type: 'button', 'class': 'btn primary', text: wait ? 'Think it through… ' + Math.ceil(wait / 1000) : 'Next question ▶' });
      if (wait) { nx.disabled = true; setTimeout(function () { if (root) drawQ(); }, 1000); }
      nx.onclick = function () { CL.fb = null; CL.qi++; CL.tries = 0; keep(); drawQ(); };
      box.appendChild(nx); return;
    }
    function right() {
      var first = !CL.tries; CL.streak = first ? CL.streak + 1 : 0;
      var got = L.coinsFor(first, q.hard, CL.streak, bonusRound) + (V.S && L.comeback(V.S, me) ? 1 : 0), before = lv();
      CL.coins += got; CL.earned += got; CL.right++; A.confetti();
      CL.fb = { ok: true, html: '<b>Yes! +' + got + ' coin' + (got === 1 ? '' : 's') + '.</b>' + (first && CL.streak % 3 === 0 ? ' 🔥 Three in a row!' : '') + (V.S && L.comeback(V.S, me) ? ' ⚡ comeback coin' : '') };
      if (lv() > before) levelUp(lv());
      sendSoon(); drawCards();
    }
    function wrong(html) { CL.streak = 0; CL.cool = Date.now() + COOL_MS; CL.fb = { ok: false, html: html }; }
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
    var un = L.UNITS.filter(function (U) { return U.lv === n; })[0];
    shout({ e: un ? un.who : 'one', who: 'LEVEL ' + n + '!', text: un ? '<b>' + esc(un.name.toUpperCase()) + '</b> unlocked. Your characters are stronger.' : 'Your characters are stronger.', team: me, mine: true, gold: true });
  }

  /* ---------- the hero panel and the seed-packet cards ---------- */
  var thumbs = {};
  function thumb(who) {
    if (thumbs[who]) return thumbs[who];
    var s = SP.get(who); if (!s) return '';
    var c = document.createElement('canvas'), k = Math.min(64 / s.w, 64 / s.h); c.width = 64; c.height = 64;
    c.getContext('2d').drawImage(s.frames[0], (64 - s.w * k) / 2, 64 - s.h * k, s.w * k, s.h * k);
    return (thumbs[who] = c.toDataURL());
  }
  function drawCards() {
    if (!hud.cards || !CL) return;
    var n = lv(), next = L.UNITS.filter(function (U) { return U.lv === n + 1; })[0], toNext = n >= 5 ? 0 : 3 - (CL.right % 3);
    hud.hero.innerHTML = '<div class="lclv"><b>Lv ' + n + '</b><span>' + '⭐'.repeat(n) + '</span></div><div class="lcxp"><i style="width:' + (n >= 5 ? 100 : Math.round(100 * (CL.right % 3) / 3)) + '%"></i></div>' +
      '<div class="lccoins">🪙 <b>' + CL.coins + '</b></div><p class="lcnext">' + (n >= 5 ? 'Max hero level!' : toNext + ' more right → Lv ' + (n + 1) + (next ? ': unlocks ' + esc(next.name) : '')) + '</p>';
    hud.cards.innerHTML = '';
    var T0 = V && V.c ? nowT(V.c) : 0;
    L.ORDER.forEach(function (t) {
      var U = L.UNITS[t], locked = U.lv > n, cd = Math.max(0, (CL.cd[t] || 0) - T0), b = el('button', { type: 'button', 'class': 'lccard' + (V.sel === t ? ' sel' : '') + (locked ? ' locked' : '') + (CL.coins < U.cost ? ' poor' : '') });
      b.innerHTML = '<img alt="" src="' + thumb(U.who) + '"><b>' + esc(U.name) + '</b><small>' + esc(U.role) + '</small><span class="lccost">' + U.cost + '🪙</span>' + (locked ? '<span class="lclock">🔒 Lv ' + U.lv + '</span>' : '') + (cd ? '<span class="lccd" style="--p:' + Math.round(100 * cd / U.cd) + '"></span>' : '');
      b.title = U.say; b.onclick = function () { if (locked) { SFA.toast(U.name + ' unlocks at hero level ' + U.lv + '. Answer questions to level up.'); return; } pickCard(t); };
      hud.cards.appendChild(b);
    });
    laneButtons();
  }
  function laneButtons() {
    if (!hud.lanes || !V.S) return;
    [].forEach.call(hud.lanes.children, function (b, l) {
      var foes = V.S.units.filter(function (u) { return u.team !== me && u.lane === l && L.UNITS[u.type].kind === 'a'; }), near = foes.filter(function (u) { return Math.abs(u.x - (me ? L.LEN : 0)) < L.LEN / 2; }).length, coming = V.S.pend.filter(function (u) { return u.team !== me && u.lane === l; }).length;
      b.className = 'lclane' + (V.sel >= 0 ? ' ready' : '') + (near ? ' danger' : '');
      b.innerHTML = '<b>Lane ' + (l + 1) + '</b><small>' + (near ? '⚠️ ' + near + ' attacking' : coming ? '⚠️ ' + coming + ' incoming' : 'quiet') + (V.S.mow[me] && !V.S.mow[me][l] ? ' · Mux recharging' : '') + '</small>';
    });
  }

  /* ---------- animation ---------- */
  function onFx(e) {
    if (!V) return;
    var key = e.k + ':' + (e.u ? e.u.id : e.p ? e.p.id : e.team + ':' + e.lane + ':' + Math.floor((V.S ? V.S.t : 0) / 50));
    if (e.k !== 'hit') { if (V.fxKeys[key]) return; V.fxKeys[key] = 1; }
    if (e.k === 'hit') { var R = V.units[e.u.id]; if (R) R.flash = 1; return; }
    if (e.k === 'spawn') { var R2 = V.units[e.u.id] = V.units[e.u.id] || {}; R2.born = performance.now(); dust(e.u); return; }
    if (e.k === 'die') { die(e.u, e.mowed); return; }
    if (e.k === 'grab') { grab(e.u, e.gold); return; }
    if (e.k === 'zero') { V.rollers.push({ lane: e.p.lane, team: e.p.team, t0: performance.now() }); if (e.hits.length) V.shake = Math.max(V.shake, 6); return; }
    if (e.k === 'mow') { V.mowers.push({ lane: e.lane, team: e.team, t0: performance.now() }); V.shake = Math.max(V.shake, 10); var T = teamNames(V.c.id); shout({ e: 'mux', who: 'MUX', text: 'charged down lane ' + (e.lane + 1) + ' for <b>' + esc(T[e.team].name.toUpperCase()) + '</b>!', team: e.team, mine: e.team === me }); return; }
  }
  function geo() {
    var w = cvs.clientWidth, h = cvs.clientHeight, vw = Math.max(46, w * 0.075), top = 0;
    return { w: w, h: h, vw: vw, lh: (h - top) / 3, top: top, X: function (x) { return vw + (x / L.LEN) * (w - 2 * vw); } };
  }
  function laneY(G, l) { return G.top + G.lh * (l + 0.82); }
  function sizeOf(who, G) { var k = { gus: 0.62, one: 0.74, sam: 0.66, pigeon: 0.34, max: 0.98, zero: 0.42, mux: 0.6 }[who] || 0.6; return G.lh * k; }
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
    V.bump[u.team] = 1; V.shake = Math.max(V.shake, gold >= 20 ? 9 : 4);
    if (CL && CL.mineIds[u.id]) { CL.gold += gold; keep(); shout({ e: L.UNITS[u.type].who, who: 'YOUR ' + L.UNITS[u.type].name.toUpperCase(), text: 'grabbed <b>' + gold + ' GOLD</b>!', team: me, mine: true, gold: true }); }
  }
  var lastF = 0;
  function frame(ts) {
    if (!root) return;
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (ts - (lastF || ts)) / 1000); lastF = ts;
    var c = V.c, T0 = nowT(c);
    if (V.S && c.state === 1) L.advance(V.S, Math.floor(T0), onFx);
    draw(dt, T0);
    if (Math.floor(ts / 500) !== V.tick) { V.tick = Math.floor(ts / 500); hudTick(); if (CL && A.MODE === 'student') drawCards(); }
  }
  function draw(dt, T0) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = cvs.clientWidth, h = cvs.clientHeight;
    if (cvs.width !== Math.round(w * dpr) || cvs.height !== Math.round(h * dpr)) { cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr); }
    var G = geo(), c = ctx, now = performance.now(), fz = L.frenzy(T0);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    V.shake *= Math.pow(0.02, dt);
    if (V.shake > 0.3) c.translate((Math.random() - 0.5) * V.shake, (Math.random() - 0.5) * V.shake);
    // the lawn: checker stripes, warmer in the final wave
    for (var l = 0; l < 3; l++) {
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
    // halfway line
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.setLineDash([6, 8]); c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); c.setLineDash([]);
    // the vaults: walls, a treasure pile that grows with the gold your team has grabbed, Mux parked in each lane
    var S = V.S;
    [0, 1].forEach(function (t) {
      var x0 = t ? w - G.vw : 0;
      var g = c.createLinearGradient(x0, 0, x0 + G.vw, 0); g.addColorStop(0, t ? '#2b3a55' : '#5a3d12'); g.addColorStop(1, t ? '#1d2a42' : '#3e2a0c');
      c.fillStyle = g; c.fillRect(x0, 0, G.vw, h);
      c.fillStyle = TC[t]; c.fillRect(t ? x0 : x0 + G.vw - 4, 0, 4, h);
      var pile = S ? Math.min(1, S.score[t] / 400) : 0;
      c.font = Math.round(G.vw * 0.62) + 'px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('💰', x0 + G.vw / 2, h - G.vw * 0.45 - pile * 10);
      for (var p = 0; p < Math.round(pile * 10); p++) { c.font = Math.round(G.vw * 0.3) + 'px serif'; c.fillText('🪙', x0 + G.vw * (0.25 + (p % 3) * 0.25), h - 8 - Math.floor(p / 3) * 8); }
      for (var ln = 0; ln < 3; ln++) {
        var ready = !S || S.mow[t][ln], sp = SP.get('mux'), sz = sizeOf('mux', G) * 0.62, mx = t ? w - G.vw - sz * 0.45 : G.vw + sz * 0.45;
        if (sp && !V.mowers.some(function (m) { return m.team === t && m.lane === ln && now - m.t0 < 900; })) {
          c.save(); c.globalAlpha = ready ? 1 : 0.28; drawSprite(sp, mx, laneY(G, ln), sz, t, 0); c.restore();
        }
      }
    });
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
    if (CL) CL.temps.forEach(function (x) { var gx = me ? w - G.vw - 18 : G.vw + 18, left = Math.max(0, (x.at - T0) / 10); c.save(); c.globalAlpha = 0.45; var sp3 = SP.get(L.UNITS[x.t].who); if (sp3) drawSprite(sp3, gx, laneY(G, x.l), sizeOf(L.UNITS[x.t].who, G) * 0.7, me, 0); c.restore(); ring(c, gx, laneY(G, x.l) - G.lh * 0.62, 11, 1 - left / (L.DEPLOY / 10), TC[me], Math.ceil(left)); });
    // the units: march bob, lunge when fighting, flash when hit, a health bar, level stars, a "You" tag
    var alive = {};
    S.units.slice().sort(function (a, b) { return a.lane - b.lane; }).forEach(function (u) {
      alive[u.id] = 1;
      var U = L.UNITS[u.type], R = V.units[u.id] || (V.units[u.id] = { born: now }), tx = G.X(u.x);
      R.dx = R.dx == null ? tx : R.dx + (tx - R.dx) * Math.min(1, dt * 10);
      var sz = sizeOf(U.who, G), y = laneY(G, u.lane), dirn = u.team ? -1 : 1, sp = SP.get(U.who), age = (now - (R.born || 0)) / 1000;
      var bob = U.kind === 'a' && !u.fight ? -Math.abs(Math.sin(now / 130 + u.id)) * sz * 0.06 : 0;
      var lunge = u.fight ? Math.max(0, Math.sin(now / 90 + u.id)) * sz * 0.12 * dirn : 0;
      var drop = age < 0.35 ? -(1 - age / 0.35) * G.lh * 0.6 : 0, squash = age < 0.5 ? 1 + Math.sin(age * 18) * 0.12 * (1 - age / 0.5) : 1;
      // shadow
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(R.dx, y + 2, sz * 0.32, sz * 0.07, 0, 0, 7); c.fill();
      if (CL && CL.mineIds[u.id]) { c.save(); c.shadowColor = TC[u.team]; c.shadowBlur = 14; }
      if (sp) drawSprite(sp, R.dx + lunge, y + bob + drop, sz * squash, u.team, Math.floor(now / 180 + u.id) % sp.frames.length, R.flash);
      if (CL && CL.mineIds[u.id]) c.restore();
      R.flash = Math.max(0, (R.flash || 0) - dt * 6);
      // health
      if (u.hp < u.max) { var bw = Math.max(26, sz * 0.5); c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(R.dx - bw / 2, y - sz - 8, bw, 5); c.fillStyle = u.hp / u.max > 0.5 ? '#3BFF8A' : u.hp / u.max > 0.25 ? '#FFC94A' : '#E0463C'; c.fillRect(R.dx - bw / 2, y - sz - 8, bw * Math.max(0, u.hp / u.max), 5); }
      if (u.lv > 1) { c.font = Math.round(Math.max(9, sz * 0.13)) + 'px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#FFC94A'; c.fillText('★'.repeat(Math.min(5, u.lv - 1)), R.dx, y - sz - 14); }
      if (CL && CL.mineIds[u.id]) { c.font = 'bold 11px sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('YOU', R.dx, y + 14); }
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
  function drawSprite(sp, x, y, height, team, frame, flash) {
    var f = sp.frames[frame % sp.frames.length], k = height / sp.h, wdt = sp.w * k;
    ctx.save(); ctx.translate(x, y); if (team) ctx.scale(-1, 1);
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
    if (!root || !V) return;
    var c = V.c, S = V.S, T0 = nowT(c), T = teamNames(c.id);
    [0, 1].forEach(function (t) {
      var b = hud['team' + t]; if (!b) return;
      var g = S ? S.score[t] : c.score[t], gEl = b.querySelector('.lcgold');
      if (String(g) !== gEl.textContent) { gEl.textContent = g; b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
      b.querySelector('.lcyou').hidden = t !== me; b.classList.toggle('mine', t === me);
      b.querySelector('.lccb').hidden = !(S && L.comeback(S, t) && c.state === 1);
    });
    var left = Math.max(0, (L.DUR - T0) / 10), m = hud.mid;
    m.querySelector('.lcclock').textContent = c.state === 2 ? 'Time!' : Math.floor(left / 60) + ':' + ('0' + Math.floor(left % 60)).slice(-2);
    var u = T0 / L.DUR; m.querySelector('.lcbar').style.width = (u * 100) + '%'; m.querySelector('.lchead').style.left = (u * 100) + '%';
    var fz = L.frenzy(T0), wave = fz ? 2 : u >= 0.5 ? 1 : 0;
    m.querySelector('.lcwavet').textContent = c.state === 2 ? 'Battle over' : fz ? '🔥 FINAL WAVE: faster, double gold!' : wave ? '⚑ Wave 2' : 'Battle!';
    root.classList.toggle('frenzy', fz);
    if (wave > V.wave && c.state === 1) { V.wave = wave; shout({ e: wave === 2 ? 'max' : 'one', who: wave === 2 ? 'THE FINAL WAVE!' : 'A WAVE IS COMING!', text: wave === 2 ? 'Everyone moves faster. <b>Double gold</b> (triple for the team behind)!' : 'Halfway! Defend your lanes.', team: -1, mine: true, gold: true }); }
    if (S && me >= 0 && c.state === 1) { var cb = L.comeback(S, me); if (cb && !V.cb) shout({ e: 'one', who: '⚡ COMEBACK!', text: 'Your team is behind: <b>+1 coin</b> on every right answer and tougher characters!', team: me, mine: true }); V.cb = cb; }
    if (A.MODE === 'student') laneButtons();
  }
  function intro(c, T) {
    if (CL && CL.intro) return;
    var b = H('div', 'lcintro');
    var bonus = CL && A.MODE === 'student' ? '<p class="lcbonus">🎁 Lesson bonus: <b>' + CL.bonus + ' coins</b>' + (CL.boost ? ' and you start at <b>hero level ' + (1 + CL.boost) + '</b>' : '') + ', for today\'s lesson (' + CL.stats.answered + ' answered, ' + CL.stats.correct + ' right' + (CL.stats.extras ? ', ' + CL.stats.extras + ' go-further' : '') + ').</p>' : '';
    b.innerHTML = '<div class="lcintro-in"><h1>⚔️ LANE CLASH</h1><div class="lcvs"><span style="color:' + TC[0] + '">' + T[0].e + ' ' + esc(T[0].name) + '</span><b>VS</b><span style="color:' + TC[1] + '">' + T[1].e + ' ' + esc(T[1].name) + '</span></div>' + bonus +
      '<p>Answer questions → earn coins → pick a character card → pick a lane.<br>Get to their vault and grab their gold. Mux guards each lane once.</p><div class="lcintro-cast">' + L.ORDER.map(function (t) { return '<img alt="" src="' + thumb(L.UNITS[t].who) + '">'; }).join('') + '</div></div>';
    root.appendChild(b);
    setTimeout(function () { b.classList.add('out'); }, A.MODE === 'screen' ? 6000 : 4500);
    setTimeout(function () { b.remove(); }, A.MODE === 'screen' ? 6600 : 5100);
    if (CL) { CL.intro = true; keep(); }
  }
  function showEnd(c, sp) {
    V.over = true;
    var T = teamNames(c.id), S = V.S || { score: c.score }, win = S.score[0] === S.score[1] ? -1 : S.score[0] > S.score[1] ? 0 : 1;
    var b = H('div', 'lcend');
    b.innerHTML = '<h1>' + (win < 0 ? 'It\'s a draw!' : T[win].e + ' ' + esc(T[win].name) + ' wins!') + '</h1><p class="lcfinal"><span style="color:' + TC[0] + '">' + S.score[0] + '</span> gold to <span style="color:' + TC[1] + '">' + S.score[1] + '</span> gold</p>' +
      (sp.mvp.some(Boolean) ? '<p class="lcmvp">🏅 MVPs: ' + [0, 1].map(function (t) { var m = sp.mvp[t]; return m ? T[t].e + ' <b>' + esc(m.name) + '</b> (' + m.gold + ' gold, ' + m.right + ' right)' : ''; }).filter(Boolean).join(' · ') + '</p>' : '') +
      (CL && A.MODE === 'student' ? '<p>You answered <b>' + CL.right + '</b> right, reached <b>hero level ' + lv() + '</b>, sent <b>' + CL.sent + '</b> characters and grabbed <b>' + CL.gold + '</b> gold.</p>' : '') +
      '<p class="sub">Back to the lesson when ' + A.TEACHER + ' says so.</p>';
    root.appendChild(b);
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
      if (e.k === 's' && !isMe) shoutQ.push({ e: U.who, who: e.name.toUpperCase(), text: (U.kind === 'd' ? 'planted ' : 'sent ') + '<b>' + esc(U.name.toUpperCase()) + '</b> ' + (U.kind === 's' ? 'rolling down lane ' + (e.lane + 1) : U.kind === 'd' ? 'in lane ' + (e.lane + 1) : 'down lane ' + (e.lane + 1)) + '!', team: e.team, mine: mine });
      if (e.k === 'g' && !isMe) shoutQ.push({ e: U.who, who: e.name.toUpperCase() + '\'S ' + U.name.toUpperCase(), text: 'grabbed <b>' + e.n + ' GOLD</b> from ' + esc(T[1 - e.team].name) + '!', team: e.team, mine: mine, gold: true });
      if (e.k === 'h') shoutQ.push({ e: 'max', who: e.name.toUpperCase(), text: 'reached <b>HERO LEVEL ' + e.n + '</b>!', team: e.team, mine: mine, gold: true });
    });
    shoutSeen = Math.max(shoutSeen, top); if (shoutQ.length > 5) shoutQ = shoutQ.slice(-5);
    nextShout();
  }
  function shout(o) { shoutQ.push(o); nextShout(); }
  function nextShout() {
    if (shoutBusy || !shoutQ.length || !root) return;
    var o = shoutQ.shift(); shoutBusy = true;
    var b = H('div', 'lcshout' + (o.team === -1 ? ' wave' : o.mine ? ' ours' : ' theirs') + (o.gold ? ' gold' : '') + (o.small ? ' small' : ''));
    b.innerHTML = '<img alt="" src="' + thumb(o.e) + '"><span><b class="who">' + esc(o.who) + '</b> ' + o.text + '</span>';
    root.appendChild(b);
    var d = o.small ? 1400 : A.MODE === 'screen' ? 2600 : 2000;
    setTimeout(function () { b.classList.add('out'); }, d);
    setTimeout(function () { b.remove(); shoutBusy = false; nextShout(); }, d + 400);
  }

  /* =========================== the teacher console: referee =========================== */
  function C() { return A.console_().clash; }
  function draftTeams() {
    var roster = A.rosterIn(), score = {}, here = {};
    roster.forEach(function (r) { score[r.sid] = 0; });
    (A.consoleAnswers() || []).forEach(function (a) { if (a.sid in score && !A.beforeRun(a) && a.q !== 'zflag' && a.q !== 'zclash') { here[a.sid] = 1; if (a.q !== 'here') score[a.sid] += 3; } });
    return A.tpost('participation').then(function (j) { return j.cells || []; }, function () { return []; }).then(function (cells) {
      cells.forEach(function (x) { if (x.sid in score) score[x.sid] += (x.answered || 0) + 0.5 * (x.correct || 0); });
      var order = roster.map(function (r) { return r.sid; }).sort(function (a, b) { return (here[b] ? 1 : 0) - (here[a] ? 1 : 0) || score[b] - score[a] || (Math.random() - 0.5); });
      var team = {}; order.forEach(function (sid, i) { team[sid] = [0, 1, 1, 0][i % 4]; });
      return team;
    });
  }
  function start() {
    return draftTeams().then(function (team) {
      var t = Math.round(Date.now() / 1000) * 1000;
      A.console_().clash = { id: t, state: 1, S: L.newState(), team: team, acc: {}, hero: {}, events: [], seq: Math.round(t / 1000) % 100000, mvp: [], frozen: false, lastPush: 0 };
      A.pushLive(); A.consolePanel();
    });
  }
  function cNow(K) { return Math.max(0, Math.min(L.DUR, (Date.now() - K.id) / 100)); }
  // the lesson numbers for one student, from the console's copy of the answers (the same rule the student page uses)
  function statsFor(sid) { var last = {}; (A.consoleAnswers() || []).forEach(function (a) { if (a.sid === sid && !A.beforeRun(a)) last[a.q] = a; }); return lessonStatsFrom(last); }
  function ev(K, k, name, team, lane, type, n) { K.events.push({ seq: ++K.seq, k: k, name: String(name || '').replace(/[~;#,]/g, '').slice(0, 16), team: team, lane: lane || 0, type: type || 0, n: n || 0 }); if (K.events.length > 6) K.events = K.events.slice(-6); }
  function agg() {
    var K = C(); if (!K || K.frozen) return;
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = r; });
    if (!K.team && K.t0 && Object.keys(ids).length) { K.team = {}; Object.keys(ids).forEach(function (sid) { K.team[sid] = K.t0[sid] ? 0 : 1; }); }
    var key = 'id:' + Math.round(K.id / 1000) + ';', last = {};
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q === 'zclash' && ids[a.sid] && String(a.answer).indexOf(key) >= 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    var T0 = cNow(K);
    Object.keys(last).forEach(function (sid) {
      var s = String(last[sid].answer), get = function (k) { var m = s.match(new RegExp(';' + k + ':(\\d+)')); return m ? +m[1] : 0; };
      var team = K.team && sid in K.team ? K.team[sid] : hashTeam(sid, K.id), r = get('r');
      var st = statsFor(sid), bonus = L.lessonBonus(st.answered, st.correct, st.extras);
      var acc = K.acc[sid] || (K.acc[sid] = { n: K.primed === false ? -1 : 0, spent: 0, cd: {}, lvSeen: 0 });
      var budget = bonus.coins + 8 * r + 2, lvMax = L.lvOf(r, bonus.boost);
      var H0 = K.hero[sid] || (K.hero[sid] = { name: A.first(ids[sid].name), team: team, gold: 0, right: 0 }); H0.right = r;
      if (lvMax >= 4 && lvMax > acc.lvSeen && acc.lvSeen) ev(K, 'h', H0.name, team, 0, 0, lvMax);
      acc.lvSeen = lvMax;
      var list = ((s.match(/;p:([0-9.,]*)/) || [, ''])[1]).split(',').filter(Boolean);
      if (acc.n < 0) { acc.n = list.length; return; }   // console reloaded mid-battle: those are already on the board
      for (var i = acc.n; i < list.length; i++) {
        var p = list[i].split('.').map(Number), l = p[0], t = p[1], d = p[2], v = p[3], U = L.UNITS[t];
        if (!U || !(l >= 0 && l < 3) || U.lv > lvMax || acc.spent + U.cost > budget || (acc.cd[t] || -1e9) > d + 20) continue;
        if (K.S.units.concat(K.S.pend).filter(function (u) { return u.team === team; }).length >= BOARD_CAP) continue;
        if (U.kind === 'd' && L.planted(K.S, team, l) >= L.TILES.length) continue;
        acc.spent += U.cost; acc.cd[t] = d + U.cd;
        var at = Math.max(Math.ceil(T0) + 5, Math.min(d + L.DEPLOY, Math.ceil(T0) + L.DEPLOY + 20));
        L.place(K.S, { team: team, lane: l, type: t, lv: Math.min(v || 1, lvMax), at: at, owner: H0.name, sid: sid });
        if (U.cost >= 5) ev(K, 's', H0.name, team, l, t, 0);
      }
      acc.n = list.length;
    });
    K.primed = true;
  }
  // every half second: run the battle to now, send the board out about once a second
  function tick() {
    var K = C(); if (!K) return;
    if (!K.frozen) {
      L.advance(K.S, Math.floor(cNow(K)), function (e) {
        if (e.k === 'grab') { var h = K.hero[e.u.sid]; if (h) h.gold += e.gold; if (e.gold >= 8) ev(K, 'g', e.u.owner, e.u.team, e.u.lane, e.u.type, e.gold); }
      });
      if (K.S.t >= L.DUR) end();
    }
    if (Date.now() - K.lastPush >= PUSH_MS) { K.lastPush = Date.now(); A.pushLive(); }
    var sig = K.state + '|' + K.S.score + '|' + Math.floor(K.S.t / 50);
    if (sig !== K.panelSig) { K.panelSig = sig; var tp = document.getElementById('tpanel'); if (tp && !tp.contains(document.activeElement)) A.consolePanel(); }
  }
  function end() {
    var K = C(); if (!K || K.frozen) return;
    agg(); K.state = 2; K.frozen = true;
    K.mvp = [0, 1].map(function (t) { return Object.keys(K.hero).map(function (s) { return K.hero[s]; }).filter(function (h) { return h.team === t; }).sort(function (a, b) { return (b.gold + 3 * b.right) - (a.gold + 3 * a.right); })[0] || null; });
    A.pushLive(); A.consolePanel();
  }
  function counts(out) {
    var K = C(); if (!K) return;
    Object.assign(out, L.encode(K.S, K.state, 48));
    out.zcid = A.encRun(K.id); out.zcst = A.encRun(K.id + (A.console_().skew || 0));
  }
  function spot() {
    var K = C(), t0 = Object.keys(K.team || {}).filter(function (sid) { return K.team[sid] === 0 && /^[A-Za-z0-9_.@-]{1,30}$/.test(sid); }).join(',');
    var E = K.events.map(function (e) { return [e.seq, e.k, e.name, e.team, e.lane, e.type, e.n].join('~'); }).join(';');
    var M = K.state === 2 ? K.mvp.map(function (m) { return m ? [m.name, m.gold, m.right].join('~') : ''; }).join(';') : '';
    var txt = '#E:' + E + (M ? '#M:' + M : '');
    return { q: 'zclash', text: ('T:' + t0).slice(0, 595 - txt.length) + txt };
  }
  function restore(Lv) {
    var c = clashOf(Lv); if (!c) return;
    var sp = clashSpot(Lv), S = L.decode(Lv.counts);
    A.console_().clash = { id: c.id, state: c.state, S: S, team: null, t0: sp.t0, acc: {}, hero: {}, events: [], seq: sp.ev.reduce(function (m, e) { return Math.max(m, e.seq); }, 0), mvp: [], frozen: c.state === 2, lastPush: 0, primed: false };
  }
  function section(p) {
    var sec = H('div', 'sect'), K = C(), T = teamNames(K.id), left = Math.max(0, (L.DUR - K.S.t) / 10);
    sec.appendChild(H('h3', '', '⚔️ Lane Clash'));
    var on = [0, 1].map(function (t) { return K.S.units.concat(K.S.pend).filter(function (u) { return u.team === t; }).length; });
    var size = [0, 0]; Object.keys(K.team || {}).forEach(function (s) { size[K.team[s]]++; });
    sec.appendChild(H('p', '', (K.state === 2 ? '<b>Over.</b> ' : '<b>' + Math.floor(left / 60) + ':' + ('0' + Math.floor(left % 60)).slice(-2) + '</b> left' + (L.frenzy(K.S.t) ? ' · 🔥 final wave' : '') + '. ') + [0, 1].map(function (t) { return T[t].e + ' ' + esc(T[t].name) + ': <b>' + K.S.score[t] + ' gold</b> · ' + on[t] + ' on the board' + (size[t] ? ' · team of ' + size[t] : ''); }).join(' · ')));
    var heroes = Object.keys(K.hero).map(function (s) { return K.hero[s]; }).sort(function (a, b) { return (b.gold + 3 * b.right) - (a.gold + 3 * a.right); }).slice(0, 6);
    if (heroes.length) sec.appendChild(H('p', 'muted', 'Top heroes: ' + heroes.map(function (h) { return esc(h.name) + ' ' + T[h.team].e + ' ' + h.gold + 'g/' + h.right + '✓'; }).join(', ')));
    if (K.team) { var d = el('details'); d.appendChild(el('summary', { text: 'The teams' })); [0, 1].forEach(function (t) { d.appendChild(H('p', 'muted', T[t].e + ' <b>' + esc(T[t].name) + ':</b> ' + A.rosterIn().filter(function (r) { return K.team[r.sid] === t; }).map(function (r) { return esc(A.nice(r.name)); }).join(', '))); }); sec.appendChild(d); }
    var r = H('div', 'row');
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End the battle now', onclick: function () { end(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().clash = null; A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r); p.appendChild(sec);
  }
  setInterval(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 500);

  window.SFA_CLASH = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: spot, restore: restore, clashOf: clashOf };
})();
