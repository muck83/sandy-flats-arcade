/* 🎈 All Aboard: the whole class flies one hot-air balloon to the Moon. Loaded by sfa-lesson.js (after sfa-crewkit.js)
   when the teacher starts one.

   Every student has their own burner. A right answer lights it for 80 seconds (more answers bank up to 160 s, no
   further), and the balloon climbs at a speed set by HOW MANY burners are lit at once, not by how many answers come in:
   one student answering twenty questions lights exactly one burner. With nine in ten lit the class gets a FULL BURN
   (×1.5). Reach the Moon, 1,000 m up, before the time runs out.

   Pulling everyone in:
   - a student's first right answer adds +8 m for the whole class;
   - a COMEBACK SPARK: a burner that has been out for a minute (or was never lit after the first 75 s) is worth +25 m to
     the whole class the moment it relights, with a banner on every screen. Everyone whose burner is lit at that
     moment gets bonus XP, so the class wants quiet students back in. (Twice per student at most.)
   - questions come in tiers (sfa-crewkit.js): a student who has been quiet today starts on the questions the class
     has already met; a miss gets a hint and another try, never a knock-out.
   - no shaming: lit burners show the student's avatar and name on every screen; burners that are out are anonymous
     sandbags. Only the console lists who is out.

   Sync like the Boss Raid: each student's running row (q "zupx1": "u1;id:<game>;r:<right>;f:<right first time>;
   n:<tries>") goes to the Sheet; the console works out who is lit and how high the balloon is, and publishes it in the
   live counts (zups: state, length, goal, altitude, crew, lit, sparks, won, full burn, crew list number, ever lit;
   zupid/zupst: the start; zupl: who is lit, zupj: who has ever been lit, as bit lists in crew order) and the spotlight
   (spot.q "zup": "P:" a page of the crew's names and avatars, "#E:" the latest lightings and sparks). */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, T = window.SFA_CREW;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zupx1', GOAL = 1000, BURN = 80, CAP = 160, QUIET = 60, LATE = 75, NEED = 0.58, FIRST_M = 8, SPARK_M = 25, SPARK_MAX = 2, FULL = 0.9, PPM = 2;
  var MARKS = [[55, '🪁', 20, 1], [120, '🐦', 76, 1], [185, '☁️', 12, 2.2], [250, '☁️', 82, 2.6], [320, '🦅', 24, 1.2], [390, '✈️', 74, 1.8], [460, '☁️', 16, 2], [530, '🪂', 80, 1.2], [600, '🛩️', 22, 1.4],
    [680, '🌈', 78, 2.2], [750, '🎆', 18, 1.6], [810, '🛰️', 76, 1.5], [870, '⭐', 24, 1], [910, '🛸', 72, 1.6], [955, '☄️', 20, 1.4]];
  var LAND = [[0, 'the school roof 🏫'], [60, 'a very surprised flock of pigeons 🐦'], [180, 'a fluffy cloud ☁️'], [330, 'the back of an eagle 🦅'], [400, 'the wing of a passing jet ✈️'], [600, 'a rainbow 🌈'], [800, 'a satellite dish 🛰️'], [900, 'a flying saucer (the aliens were lovely) 🛸']];

  function gameOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zups) || !Array.isArray(c.zupid)) return null;
    var z = c.zups, id = A.decRun(c.zupid), start = A.MODE === 'screen' ? id : A.decRun(c.zupst) || id;
    var sp = Lv.spot && Lv.spot.q === 'zup' ? String(Lv.spot.text || '') : '', ev = [], seq = 0, m = /#E:(\d+)\|([^#]*)/.exec(sp);
    if (m) { seq = +m[1]; ev = m[2] ? m[2].split(',').map(function (x) { var p = x.split('~'); return { k: p[0], n: p[1] || '', m: +p[2] || 0 }; }) : []; }
    return { id: id, start: start, state: z[0], dur: z[1] || 300, goal: z[2] || GOAL, alt: z[3] || 0, n: z[4] || 0, lit: z[5] || 0, sparks: z[6] || 0, win: !!z[7], full: !!z[8], ep: z[9] || 0, aboard: z[10] || 0,
      lits: Array.isArray(c.zupl) ? c.zupl : [], abs: Array.isArray(c.zupj) ? c.zupj : [], sp: sp, ev: ev, seq: seq };
  }
  function leftOf(b) { return Math.max(0, Math.round((b.start + b.dur * 1000 - T.sNow()) / 1000)); }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null, crew = T.Crew(), quiz = null;
  var ban = T.Banners(function () { return !!root; });
  function key() { return 'aloft.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function xp(n, once) { if (A.hero && ST && A.MODE === 'student') A.hero.add('u', String(Math.round(ST.id / 1000)) + (once ? 'e' : ''), n, once); }
  function myFp() { return A.S && A.S.me ? T.sh3(A.S.me.sid) : ''; }

  function sync() {
    var Lv = A.live(), b = A.isLive() || A.MODE === 'screen' ? gameOf(Lv) : null;
    if (b && A.MODE !== 'teach' && T.sNow() - b.start > b.dur * 1000 + 180000) b = null;   // long over: gone
    if (A.MODE === 'student' && A.saving() && !A.S.me) b = null;
    if (!b) { close(); return; }
    if (!root || V.id !== b.id) open(b);
    apply(b);
  }
  function open(b) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === b.id ? saved : { id: b.id, r: 0, f: 0, n: 0, burn: 0, sp: 0, done: 0 };
    V = { id: b.id, b: b, ep: b.ep }; crew = T.Crew();
    root = H('div', 'crw up' + (A.MODE !== 'student' ? ' screen' : '')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'All Aboard');
    root.innerHTML = '<div class="crwhud"><h1>🎈 All Aboard</h1><span class="crwpill" id="upT"></span><span class="crwpill" id="upA"></span><span class="crwpill" id="upL"></span><span class="crwsp"></span><span class="crwpill" id="upS"></span></div>' +
      '<div class="crwbody"><div class="crwscene upsky"><div class="upnight"></div><div class="upworld"><div class="upground"><span>🏫</span><span>🌳</span><span>🌳</span></div>' +
      MARKS.map(function (m) { return '<span class="upmark" style="left:' + m[2] + '%;bottom:calc(12% + ' + m[0] * PPM + 'px);font-size:' + (m[3] * 2.4).toFixed(1) + 'em">' + m[1] + '</span>'; }).join('') +
      '<span class="upmoon" style="bottom:calc(46% + ' + GOAL * PPM + 'px)">🌕</span></div>' +
      '<div class="upship"><div class="upbal">' + balloon() + '</div><div class="upflame">🔥</div><div class="upgon"></div></div>' +
      '<div class="upgauge"><b>🌕</b><i><u></u><s title="Where the balloon needs to be by now">⏱</s></i><b>🏫</b></div><div class="upfloat"></div></div>' +
      '<div class="crwside"><div class="crwcard upme"></div><div class="crwcard upq"></div></div></div>';
    document.body.appendChild(root); document.body.classList.add('crwing');
    if (A.MODE === 'student') quiz = T.Quiz({ st: function () { return ST; }, keep: keep, seed: T.hash(A.S.me ? A.S.me.sid : 'x') + Math.round(b.id / 1000) % 99991, redraw: drawQ, right: right, tried: tried });
    V.tick = setInterval(function () { if (root) { drawTop(); if (A.MODE === 'student') drawMe(); } }, 1000);
  }
  function close() {
    if (!root) return; clearInterval(V.tick); ban.clear();
    root.remove(); root = null; V = null; quiz = null; document.body.classList.remove('crwing');
    var x = document.querySelector('.crwwatchx'); if (x) x.remove();
  }
  function balloon() {
    var cols = ['#FF5B5B', '#FFC94A', '#5CE0B8', '#6EA8FF', '#FF7AC0', '#FFC94A', '#FF5B5B'], s = '';
    for (var i = 0; i < 7; i++) s += '<rect x="' + (i * 28 + 2) + '" y="0" width="28" height="210" fill="' + cols[i] + '"/>';
    return '<svg viewBox="0 0 200 232" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs><clipPath id="upclip"><path d="M100 4C40 4 6 46 6 96c0 46 44 78 70 104h48c26-26 70-58 70-104C194 46 160 4 100 4Z"/></clipPath></defs>' +
      '<g clip-path="url(#upclip)"><rect width="200" height="210" fill="#FFC94A"/>' + s + '<ellipse cx="70" cy="60" rx="26" ry="40" fill="rgba(255,255,255,.22)"/></g>' +
      '<path d="M100 4C40 4 6 46 6 96c0 46 44 78 70 104h48c26-26 70-58 70-104C194 46 160 4 100 4Z" fill="none" stroke="#141428" stroke-width="5"/>' +
      '<path d="M78 200L70 232M122 200l8 32M100 200v32" stroke="#141428" stroke-width="3"/></svg>';
  }

  function apply(b) {
    var prev = V.prev; V.b = b;
    if (b.ep !== V.ep) { V.ep = b.ep; crew = T.Crew(); }
    crew.take(b.sp);
    // what classmates did (on every screen)
    if (V.seen == null) V.seen = b.seq;
    else if (b.seq > V.seen) {
      var first = b.seq - b.ev.length + 1;
      b.ev.forEach(function (e, i) { if (first + i > V.seen) evFx(e); });
      V.seen = b.seq;
    }
    if (prev && b.state === 2 && prev.state !== 2 && b.win) { var n = 0; (function c() { if (!root || n++ > 4) return; A.confetti(); setTimeout(c, 900); })(); }
    V.prev = b;
    drawTop(); drawScene();
    if (A.MODE === 'student') {
      if (b.state === 2 && !ST.done && (ST.r || ST.n)) { ST.done = 1; keep(); xp(25 + (b.win ? 25 : 0), true); }
      drawMe();
      var sig = [b.state, T.pool().length].join('|'); if (sig !== V.qsig) { V.qsig = sig; drawQ(); }
    }
  }
  function evFx(e) {
    var mine = A.MODE === 'student' && A.S.me && e.n === T.clean(A.first(A.S.me.name).replace(/[^A-Za-zÀ-ÿ' -]/g, ''));
    if (e.k === 's') {
      ban.say('⚡ <b>COMEBACK SPARK!</b> ' + esc(e.n) + ' relit their burner: <b>+' + e.m + ' m</b> for everyone!', 'spark', 3200); floatUp('+' + e.m + ' m ⚡'); A.confetti();
      // teamwork: everyone holding the balloon up when a classmate comes back gets a little XP
      if (A.MODE === 'student' && !mine && ST.burn > Date.now()) { xp(4); }
    }
    else if (e.k === 'j') { if (!mine) ban.say('🔥 <b>' + esc(e.n) + '</b> lit a burner: +' + e.m + ' m', 'good', 1500); floatUp('+' + e.m + ' m'); }
    else if (e.k === 'f') ban.say('🔥🔥 <b>FULL BURN!</b> Nearly every burner is lit: the balloon climbs 1.5× faster!', 'spark', 3000);
  }
  function floatUp(t) { var f = root && root.querySelector('.upfloat'); if (!f) return; var s = H('span', '', esc(t)); s.style.left = (38 + Math.random() * 24) + '%'; f.appendChild(s); setTimeout(function () { s.remove(); }, 2200); }

  function drawTop() {
    if (!root || !V) return;
    var b = V.b, g = function (id) { return root.querySelector('#' + id); }, left = leftOf(b);
    g('upT').innerHTML = b.state === 1 ? '⏱ <b>' + T.mmss(left) + '</b>' : b.win ? '🌕 <b>Landed!</b>' : '⏱ <b>Time</b>';
    g('upA').innerHTML = '<b>' + Math.round(b.alt) + ' m</b> of ' + b.goal;
    g('upL').innerHTML = '🔥 <b>' + b.lit + '</b> of ' + b.n + ' burners lit'; g('upL').className = 'crwpill' + (b.full ? ' hot' : '');
    g('upS').innerHTML = b.state !== 1 ? '' : b.full ? '🚀 FULL BURN ×1.5' : !b.lit ? '😴 Hovering: light a burner!' : b.lit / Math.max(1, b.n) >= 0.6 ? '⬆️ Climbing fast' : '↗️ Climbing: more burners = faster';
    var u = root.querySelector('.upgauge u'), s = root.querySelector('.upgauge s');
    if (u) u.style.height = Math.min(100, 100 * b.alt / b.goal) + '%';
    if (s) { var pace = Math.min(1, Math.max(0, (T.sNow() - b.start) / (b.dur * 1000))); s.style.bottom = (pace * 100) + '%'; s.style.display = b.state === 1 ? '' : 'none'; }
  }
  function drawScene() {
    var b = V.b, sc = root.querySelector('.crwscene'), world = root.querySelector('.upworld');
    world.style.transform = 'translateY(' + Math.round(b.alt * PPM) + 'px)';
    root.querySelector('.upnight').style.opacity = Math.max(0, Math.min(1, (b.alt / b.goal - 0.42) / 0.4));
    var fl = root.querySelector('.upflame'), frac = b.lit / Math.max(1, b.n);
    fl.style.transform = 'scale(' + (b.lit ? 0.5 + frac * 1.3 : 0).toFixed(2) + ')'; fl.className = 'upflame' + (b.full ? ' full' : '');
    root.querySelector('.upship').className = 'upship' + (b.state === 1 && b.lit ? ' upgo' : '') + (b.state === 2 ? ' upover' : '');
    // the gondola: one seat per student. Lit: the avatar and name. Out: a sandbag, with no name.
    var n = Math.max(b.n, 1), me = myFp(), sig = [n, b.lits.join('.'), crew.key, sc.clientWidth, b.state].join('|');
    if (sig !== V.ssig) {
      V.ssig = sig;
      var rowsN = n > 24 ? 3 : n > 10 ? 2 : 1, cols = Math.ceil(n / rowsN), big = A.MODE !== 'student';
      var size = Math.max(22, Math.min(big ? 86 : 54, Math.floor((sc.clientWidth || 600) * 0.86 / cols) - 4)), h = '';
      for (var i = 0; i < n; i++) {
        var lit = T.bit(b.lits, i), c = crew.get(i), you = c.fp && c.fp === me;
        h += lit && c.fp ? '<div class="upseat lit' + (you ? ' you' : '') + '" style="width:' + size + 'px"><i>🔥</i>' + T.av(c.look, size, false) + '<span class="crwname ' + T.ncls(c.look) + '">' + esc(you ? 'You' : c.n) + '</span></div>'
          : lit ? '<div class="upseat lit" style="width:' + size + 'px"><i>🔥</i><em style="font-size:' + Math.round(size * 0.6) + 'px">🙂</em></div>'
            : '<div class="upseat' + (you ? ' you' : '') + '" style="width:' + size + 'px"><em style="font-size:' + Math.round(size * 0.6) + 'px">' + (you ? '💤' : '🪨') + '</em>' + (you ? '<span class="crwname">You</span>' : '') + '</div>';
      }
      var gon = root.querySelector('.upgon'); gon.innerHTML = h; gon.style.maxWidth = (cols * (size + 4) + 24) + 'px';
    }
    if (b.state === 2) ending(sc); else { var e = sc.querySelector('.crwend'); if (e) e.remove(); var p = sc.querySelector('.upparty'); if (p) p.remove(); }
  }
  function landOn(alt) { var t = LAND[0][1]; LAND.forEach(function (l) { if (alt >= l[0]) t = l[1]; }); return t; }
  // the payoff: on the Moon, everyone who lit a burner bounces about in low gravity (and the wild goat got there first);
  // out of time, the crew parachutes down onto whatever was underneath
  function ending(sc) {
    var b = V.b, sig = [b.win, crew.key, b.abs.join('.')].join('|'); if (V.esig === sig) return; V.esig = sig;
    var old = sc.querySelector('.crwend'); if (old) old.remove(); var op = sc.querySelector('.upparty'); if (op) op.remove();
    var who = []; for (var i = 0; i < Math.max(b.n, crew.total); i++) if (T.bit(b.abs, i) && crew.get(i).fp) who.push(crew.get(i));
    var e = H('div', 'crwend');
    e.innerHTML = b.win ? '<h1>MOON LANDING!</h1><p>' + b.aboard + ' of ' + b.n + ' burners got the class there' + (b.sparks ? ', with ' + b.sparks + ' comeback spark' + (b.sparks === 1 ? '' : 's') : '') + '. One small step for Sandy Flats…</p>'
      : '<h1>SOFT LANDING · ' + Math.round(b.alt) + ' m</h1><p>The balloon came down on ' + esc(landOn(b.alt)) + '. The Moon was ' + Math.round(b.goal - b.alt) + ' m higher: more burners lit at the same time is what gets you there.</p>';
    sc.appendChild(e);
    var big = A.MODE !== 'student', size = Math.max(30, Math.min(big ? 96 : 56, Math.floor((sc.clientWidth || 600) * 0.9 / Math.max(4, Math.min(who.length, 14)))));
    var p = H('div', 'upparty' + (b.win ? ' moon' : ' chute'));
    p.innerHTML = (b.win ? '<div class="upsurf"></div><div class="upgoat"><span>🐐</span><b>I got here first.</b></div>' : '') +
      '<div class="upline">' + who.map(function (c, i) { return '<div class="uphop" style="animation-delay:' + (b.win ? -(i * 0.37) % 2.4 : i * 0.12).toFixed(2) + 's;animation-duration:' + (b.win ? 1.9 + (i % 5) * 0.28 : 2.6 + (i % 4) * 0.3).toFixed(2) + 's">' + (b.win ? '' : '<i>🪂</i>') + T.av(c.look, size, false) + '<span class="crwname ' + T.ncls(c.look) + '">' + esc(c.n) + '</span></div>'; }).join('') + '</div>';
    sc.appendChild(p);
  }

  /* ---------- my burner and my question (student) ---------- */
  function litLeft() { return Math.max(0, Math.round((ST.burn - Date.now()) / 1000)); }
  function sparkReady() {
    if (ST.sp >= SPARK_MAX || !V || V.b.state !== 1) return false;
    return ST.burn ? Date.now() - ST.burn >= QUIET * 1000 : (T.sNow() - V.b.start) / 1000 >= LATE;
  }
  function drawMe() {
    var box = root && root.querySelector('.upme'); if (!box) return;
    var b = V.b, left = litLeft(), h;
    if (b.state === 2) {
      var I = A.hero ? A.hero.info() : null;
      h = '<p class="crwkick">Your flight</p><p class="upstat">' + (ST.r ? 'You lit your burner <b>' + ST.r + '</b> time' + (ST.r === 1 ? '' : 's') + (ST.sp ? ' and gave the class <b>' + ST.sp + '</b> comeback spark' + (ST.sp === 1 ? '' : 's') : '') + '. The balloon needed you.' : 'Your burner stayed out this flight. Next time, one right answer is all it takes to help lift everyone.') + '</p>' +
        (I ? '<p class="upstat">⭐ Level ' + I.lv + ' ' + esc(I.title) + ' · ' + I.xp + ' XP</p>' : '');
    } else if (left > 0) {
      h = '<p class="crwkick">Your burner</p><div class="upbar lit"><u style="width:' + Math.min(100, 100 * left / CAP) + '%"></u></div><p class="upstat">🔥 <b>Lit for ' + T.mmss(left) + '.</b> You are lifting the whole class. Answer again before it runs out to keep it burning.</p>';
    } else if (sparkReady()) {
      h = '<p class="crwkick">Your burner</p><div class="upbar"><u style="width:0"></u></div><p class="upstat">⚡ <b>Comeback spark ready!</b> Your next right answer relights your burner AND gives the whole class <b>+' + SPARK_M + ' m</b>. They need you.</p>';
    } else {
      h = '<p class="crwkick">Your burner</p><div class="upbar"><u style="width:0"></u></div><p class="upstat">' + (ST.r ? '💨 <b>Your burner went out.</b> One right answer relights it.' : '🎈 <b>Your burner isn\'t lit yet.</b> One right answer lights it: +' + FIRST_M + ' m for the class, and the balloon climbs faster with every burner that is lit.') + '</p>';
    }
    if (box._h !== h) { box._h = h; box.innerHTML = h; }
  }
  function right(first) {
    var now = Date.now(), was = ST.burn || 0, comeback = sparkReady(), firstEver = !ST.r;
    ST.r++; if (first) ST.f++;
    ST.burn = Math.min(now + CAP * 1000, Math.max(was, now) + BURN * 1000 * (first ? 1 : 0.75));
    xp(first ? 10 : 6);
    var msg = '<b>🔥 ' + (was > now ? 'More fuel!' : firstEver ? 'Your burner is lit!' : 'Relit!') + '</b> Burning for ' + T.mmss(litLeft()) + '.';
    if (comeback) { ST.sp++; xp(15); A.confetti(); msg = '<b>⚡ COMEBACK SPARK!</b> You just gave the whole class +' + SPARK_M + ' m. Burning for ' + T.mmss(litLeft()) + '.'; }
    else if (firstEver) msg += ' +' + FIRST_M + ' m for the class.';
    keep(); send(); drawMe();
    return msg;
  }
  function tried() { ST.n++; xp(2); keep(); sendSoon(); }
  function drawQ() {
    var box = root && root.querySelector('.upq'); if (!box || !quiz) return;
    if (V.b.state !== 1) { box.innerHTML = '<p class="crwq">' + (V.b.win ? '🌕 You made it. Enjoy the view!' : 'Time is up: the balloon is coming down gently.') + '</p>'; return; }
    quiz.draw(box, { kick: 'Answer to ' + (litLeft() > 0 ? 'keep your burner lit' : 'light your burner'), go: '🔥 Burn', after: function (bx) {
      var nx = el('button', { type: 'button', 'class': 'btn primary', text: 'Next question ▶' }); nx.onclick = function () { quiz.next(); drawQ(); }; bx.appendChild(nx);
    } });
  }
  var sendT = null;
  function send() {
    clearTimeout(sendT); if (A.MODE !== 'student' || !V || !ST) return;
    A.record({ id: QID, k: 'open' }, 'u1;id:' + Math.round(V.id / 1000) + ';r:' + ST.r + ';f:' + ST.f + ';n:' + ST.n, null);
  }
  function sendSoon() { clearTimeout(sendT); sendT = setTimeout(send, 2500); }

  /* =========================== the teacher console =========================== */
  function C() { return A.console_().aloft; }
  function ev(K, e) { K.ev.push(e); K.ev = K.ev.slice(-6); K.seq++; }
  function start(mins) {
    if (!T.pool().length) { SFA.toast('This lesson has no number or multiple-choice questions for All Aboard.', 4500); return false; }
    var t = Math.round(Date.now() / 1000) * 1000, dur = Math.round((mins || 5) * 60), K;
    A.console_().aloft = K = { id: t, state: 1, dur: dur, goal: GOAL, alt: 0, win: false, rate: GOAL / (dur * NEED), order: [], idx: {}, burn: {}, first: {}, spk: {}, rows: {}, ev: [], seq: 0, sparks: 0, lit: 0, full: false, fullAt: 0, ep: Math.floor(Math.random() * 9000) + 1, tAt: Date.now(), pk: '' };
    T.active().forEach(function (sid) { K.idx[sid] = K.order.length; K.order.push(sid); });
    A.pushLive(); A.consolePanel(); return true;
  }
  function agg() {
    var K = C(); if (!K || !A.rosterIn().length) return;
    var last = T.rows(QID, 'id:' + Math.round(K.id / 1000) + ';'), now = Date.now(), quiet = !!K.restored, changed = false;
    T.active().concat(Object.keys(last)).forEach(function (sid) { if (K.idx[sid] == null) { K.idx[sid] = K.order.length; K.order.push(sid); changed = true; } });
    Object.keys(last).forEach(function (sid) {
      var s = String(last[sid].answer), row = { r: T.getN(s, 'r'), f: T.getN(s, 'f'), n: T.getN(s, 'n') }, old = K.rows[sid];
      if (quiet) { if (row.r) { K.burn[sid] = now + 45000; K.first[sid] = 1; } K.rows[sid] = row; changed = true; return; }
      if (K.state === 1 && row.r > (old ? old.r : 0)) {
        var was = K.burn[sid] || 0, e = (now - K.id) / 1000, comeback = (was ? now - was >= (QUIET - 10) * 1000 : e >= LATE - 2) && (K.spk[sid] || 0) < SPARK_MAX, firstTry = row.f > (old ? old.f : 0);
        K.burn[sid] = Math.min(now + CAP * 1000, Math.max(was, now) + BURN * 1000 * (firstTry ? 1 : 0.75));
        if (comeback) { K.spk[sid] = (K.spk[sid] || 0) + 1; K.alt += SPARK_M; K.sparks++; ev(K, { k: 's', n: T.nameOf(sid), m: SPARK_M }); }
        else if (!K.first[sid]) { K.alt += FIRST_M; ev(K, { k: 'j', n: T.nameOf(sid), m: FIRST_M }); }
        K.first[sid] = 1;
      }
      if (!old || old.n !== row.n || old.r !== row.r) changed = true;
      K.rows[sid] = row;
    });
    delete K.restored;
    if (changed) { tick(true); }
  }
  function litNow(K, now) { return K.order.filter(function (sid) { return (K.burn[sid] || 0) > now; }).length; }
  function end() {
    var K = C(); if (!K) return;
    // 🏆 the trophy shelf (trophies.html): ic, title and sub are ready to show as they are
    if (K.state === 1 && K.order.length && A.trophy) {
      var lit1 = Object.keys(K.first || {}).length;
      A.trophy({ k: 'aloft', id: K.id, win: !!K.win, ic: K.win ? '🌕' : '🎈', title: K.win ? 'All Aboard: the class reached the Moon' : 'All Aboard: ' + Math.round(K.alt) + ' m of ' + K.goal + ' m',
        sub: lit1 + ' of ' + K.order.length + ' burners were lit · ' + (K.sparks || 0) + ' comeback spark' + (K.sparks === 1 ? '' : 's'), alt: Math.round(K.alt), goal: K.goal, n: K.order.length, lit: lit1, sparks: K.sparks || 0 });
    }
    K.state = 2; K.endedAt = Date.now(); (A.pushNow || A.pushLive)(); A.consolePanel(); }
  function tick(force) {
    var K = C(); if (!K) return;
    if (K.restored && !force && A.rosterIn().length) { agg(); if (K.restored) delete K.restored; }   // the console was reloaded: pick the crew back up straight away
    var now = Date.now(), e = (now - K.id) / 1000, push = !!force;
    if (K.state === 1) {
      var dt = Math.max(0, Math.min(3, (now - (K.tAt || now)) / 1000)); K.tAt = now;
      var N = Math.max(1, K.order.length), lit = litNow(K, now), frac = lit / N, full = N >= 3 && frac >= FULL;
      if (full && !K.full && now - K.fullAt > 30000) { K.fullAt = now; ev(K, { k: 'f', n: '', m: 0 }); push = true; }
      if (lit !== K.lit || full !== K.full) push = true;
      K.lit = lit; K.full = full;
      K.alt = Math.min(K.goal, K.alt + K.rate * frac * (full ? 1.5 : 1) * dt);
      if (K.alt >= K.goal) { K.alt = K.goal; K.win = true; end(); return; }
      if (e >= K.dur) { end(); return; }
    }
    var pg = Math.floor(e / 4) % Math.max(1, Math.ceil(K.order.length / 12)); if (pg !== K.page) { K.page = pg; push = true; }
    if (push || now - (K.lastPush || 0) >= 4000) { K.lastPush = now; (A.pushNow || A.pushLive)(); if (K.state === 1) A.consolePanel(); }
    if (root && V && V.watch) apply(watchState());
  }
  function counts(out) {
    var K = C(); if (!K) return;
    var now = Date.now();
    out.zupid = A.encRun(K.id); out.zupst = A.encRun(K.id + (A.console_().skew || 0));
    out.zups = [K.state, Math.min(9999, K.dur), K.goal, Math.round(K.alt), Math.min(9999, K.order.length), K.state === 1 ? litNow(K, now) : K.lit || 0, Math.min(9999, K.sparks), K.win ? 1 : 0, K.full ? 1 : 0, K.ep, Math.min(9999, Object.keys(K.first).length)];
    out.zupl = T.encBits(K.order.map(function (sid) { return K.state === 1 ? (K.burn[sid] || 0) > now : !!K.first[sid]; }));
    out.zupj = T.encBits(K.order.map(function (sid) { return !!K.first[sid]; }));
  }
  function crewList(K) { var L = T.looks(); return K.order.map(function (sid) { return { fp: T.sh3(sid), n: T.nameOf(sid), look: T.lookOf(L, sid) }; }); }
  function spot(all) {
    var K = C(), E = '#E:' + K.seq + '|' + K.ev.map(function (e) { return e.k + '~' + T.clean(e.n) + '~' + e.m; }).join(',');
    return { q: 'zup', text: (T.crewPage(crewList(K), all ? 0 : K.page || 0, all ? 999 : 12) + E).slice(0, all ? 99999 : 600) };
  }
  function restore(Lv) {
    var b = gameOf(Lv); if (!b) return false;
    if (b.state === 2 || Date.now() - b.id > b.dur * 1000 + 60000) { A.console_().aloft = null; return false; }
    A.console_().aloft = { id: b.id, state: 1, dur: b.dur, goal: b.goal, alt: b.alt, win: false, rate: b.goal / (b.dur * NEED), order: [], idx: {}, burn: {}, first: {}, spk: {}, rows: {}, ev: [], seq: b.seq, sparks: b.sparks, lit: 0, full: false, fullAt: 0, ep: b.ep % 9000 + 1, tAt: Date.now(), restored: true };
    return true;
  }
  function watchState() { var out = {}; counts(out); var b = gameOf({ lesson: A.LID, counts: out, spot: spot(true) }); b.start = C().id; return b; }
  function watch() {
    var b = watchState(); open(b); V.watch = true; apply(b);
    var x = el('button', { type: 'button', 'class': 'btn primary crwwatchx', text: '✕ Back to the console' }); x.onclick = function () { close(); }; document.body.appendChild(x);
  }
  function section(p) {
    var K = C(), sec = H('div', 'sect'), now = Date.now();
    sec.appendChild(H('h3', '', '🎈 All Aboard'));
    var left = Math.max(0, Math.round(K.dur - (now - K.id) / 1000)), lit = [], out = [], never = [];
    K.order.forEach(function (sid) { var n = T.nameOf(sid) || '?'; if ((K.burn[sid] || 0) > now) lit.push(n); else if (K.first[sid]) out.push(n); else never.push(n); });
    sec.appendChild(H('p', '', (K.state === 1 ? '<b>' + T.mmss(left) + '</b> left · ' : K.win ? '<b>🌕 They reached the Moon!</b> · ' : '<b>Time: a soft landing.</b> ') + '<b>' + Math.round(K.alt) + ' m</b> of ' + K.goal + ' · 🔥 ' + lit.length + ' of ' + K.order.length + ' burners lit · ⚡ ' + K.sparks + ' comeback spark' + (K.sparks === 1 ? '' : 's')));
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show the balloon', title: 'The balloon on this screen', onclick: function () { watch(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +1 minute', onclick: function () { K.dur += 60; A.pushLive(); A.consolePanel(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End it now', onclick: function () { end(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().aloft = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    var dd = T.fold('g-aloft', '📋 Details · only you see this', true);
    if (K.state === 1) {
      dd.appendChild(H('p', 'muted', '<b>💤 Not lit yet (' + never.length + '):</b> ' + (never.map(esc).join(', ') || 'nobody') + '<br><b>💨 Burner out (' + out.length + '):</b> ' + (out.map(esc).join(', ') || 'nobody') + '<br><b>🔥 Lit (' + lit.length + '):</b> ' + (lit.map(esc).join(', ') || 'nobody yet')));
      dd.appendChild(H('p', 'muted', 'A quiet word with someone whose burner is out is worth a lot: their next right answer is a comeback spark, +' + SPARK_M + ' m for everyone.'));
    } else {
      var rowsL = K.order.map(function (sid) { var w = K.rows[sid] || { r: 0, f: 0, n: 0 }; return { n: T.nameOf(sid) || '?', r: w.r, f: w.f, t: w.n }; }).sort(function (a, b) { return a.n.localeCompare(b.n); });
      dd.appendChild(H('p', 'muted', '<b>Right answers (right first time):</b> ' + rowsL.map(function (x) { return esc(x.n) + ' ' + x.r + ' (' + x.f + ')'; }).join(' · ')));
    }
    sec.appendChild(dd);
    p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 1000);

  (function css() {
    if (document.getElementById('sfaUpCss')) return;
    var c = document.createElement('style'); c.id = 'sfaUpCss';
    c.textContent = [
      '.crw.up{background:#0d1030}',
      '.upsky{background:linear-gradient(#3aa0ff 0%,#8fd0ff 55%,#d8f3ff 100%)}',
      '.upnight{position:absolute;inset:0;opacity:0;transition:opacity 3s linear;background:radial-gradient(1px 1px at 12% 20%,#fff,transparent),radial-gradient(1.5px 1.5px at 30% 62%,#fff,transparent),radial-gradient(1px 1px at 48% 12%,#fff,transparent),radial-gradient(2px 2px at 66% 40%,#fff,transparent),radial-gradient(1px 1px at 82% 72%,#fff,transparent),radial-gradient(1.5px 1.5px at 92% 18%,#fff,transparent),radial-gradient(1px 1px at 22% 86%,#fff,transparent),radial-gradient(1px 1px at 58% 80%,#fff,transparent),linear-gradient(#05061a,#131a4a)}',
      '.upworld{position:absolute;inset:0;transition:transform 3.5s linear;will-change:transform}',
      '.upground{position:absolute;left:-5%;right:-5%;bottom:-60%;height:72%;background:linear-gradient(#6fcf5a 0,#3f9a3c 14%,#2c6e2f 100%);border-top:5px solid #2c6e2f;border-radius:50% 50% 0 0/6% 6% 0 0}',
      '.upground span{position:absolute;top:0;transform:translateY(-86%);font-size:clamp(34px,6vw,84px)}.upground span:nth-child(1){left:12%}.upground span:nth-child(2){left:80%}.upground span:nth-child(3){left:88%;font-size:clamp(24px,4vw,56px)}',
      '.upmark{position:absolute;transform:translateX(-50%);line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25))}',
      '.upmoon{position:absolute;left:50%;transform:translateX(-50%);font-size:min(46vh,340px);line-height:1;filter:drop-shadow(0 0 40px rgba(255,255,210,.7))}',
      '.upship{position:absolute;left:0;right:0;top:5%;bottom:11%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;pointer-events:none}',
      '.upship.upgo{animation:upbob 3.2s ease-in-out infinite}.upship.upover{opacity:.0;transition:opacity 1.2s}',
      '@keyframes upbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}',
      '.upbal{flex:1;min-height:60px;width:100%;display:flex;justify-content:center}.upbal svg{height:100%;max-width:70%}',
      '.upflame{height:0;font-size:clamp(22px,4vw,46px);line-height:1;transform-origin:50% 100%;transition:transform 1s;position:relative;top:-1.15em;z-index:2;filter:drop-shadow(0 0 12px #FF9A3D)}.upflame.full{filter:drop-shadow(0 0 18px #fff) hue-rotate(-20deg)}',
      '.upgon{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:2px 4px;padding:8px 10px 6px;background:linear-gradient(#b7793b,#8a5524);border:4px solid #141428;border-radius:10px 10px 22px 22px;box-shadow:inset 0 6px 0 rgba(255,255,255,.18)}',
      '.upseat{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}.upseat svg{width:100%;height:auto;display:block}',
      '.upseat i{position:absolute;top:-.9em;left:50%;transform:translateX(-50%);font-style:normal;font-size:.9em;animation:upflick .5s ease-in-out infinite alternate}',
      '.upseat em{font-style:normal;line-height:1.25;opacity:.75}.upseat.lit{animation:uphopin .5s cubic-bezier(.2,1.6,.4,1) both}.upseat.you .crwname{color:#FFE14D}',
      '.upseat.you{outline:2px dashed #FFE14D;outline-offset:1px;border-radius:8px}',
      '@keyframes upflick{from{transform:translateX(-50%) scale(.85)}to{transform:translateX(-50%) scale(1.15)}}',
      '@keyframes uphopin{from{transform:translateY(-18px) scale(.6)}to{transform:none}}',
      '.upgauge{position:absolute;left:10px;top:8%;bottom:8%;width:34px;display:flex;flex-direction:column;align-items:center;gap:4px;z-index:3}',
      '.upgauge b{font-size:22px;line-height:1}.upgauge i{position:relative;flex:1;width:16px;border-radius:9px;background:rgba(10,10,30,.55);border:2px solid rgba(255,255,255,.7)}',
      '.upgauge u{position:absolute;left:0;right:0;bottom:0;border-radius:7px;background:linear-gradient(#FFE14D,#FF7A3D);transition:height 3.5s linear}',
      '.upgauge s{position:absolute;left:14px;transform:translateY(50%);text-decoration:none;font-size:15px;white-space:nowrap}.upgauge s:before{content:"";position:absolute;left:-16px;top:50%;width:18px;border-top:2px dashed #fff}',
      '.upfloat{position:absolute;inset:0;pointer-events:none;z-index:4}.upfloat span{position:absolute;top:42%;font:400 clamp(22px,4vw,48px) "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 3px 0 #141428;animation:upfloat 2.1s ease-out forwards}',
      '@keyframes upfloat{from{transform:translateY(20px) scale(.6);opacity:0}15%{opacity:1;transform:translateY(0) scale(1.1)}to{transform:translateY(-120px);opacity:0}}',
      '.upbar{height:16px;border-radius:9px;background:#14122a;border:2px solid #6c6690;overflow:hidden;margin:2px 0 8px}.upbar u{display:block;height:100%;background:linear-gradient(90deg,#FF7A3D,#FFE14D);transition:width 1s linear}.upbar.lit{border-color:#FFC94A;box-shadow:0 0 12px rgba(255,160,60,.6)}',
      '.upstat{margin:0 0 4px;font-size:15px;line-height:1.35}.upstat b{color:#FFE14D}',
      '.upparty{position:absolute;inset:0;z-index:7;pointer-events:none;overflow:hidden}',
      '.upparty.moon{background:linear-gradient(#05061a 0,#131a4a 100%)}',
      '.upsurf{position:absolute;left:-10%;right:-10%;bottom:-34%;height:60%;border-radius:50%;background:radial-gradient(circle at 20% 22%,#b9b9c8 0 4%,transparent 4.5%),radial-gradient(circle at 62% 14%,#b9b9c8 0 3%,transparent 3.5%),radial-gradient(circle at 80% 26%,#b9b9c8 0 5%,transparent 5.5%),radial-gradient(circle at 40% 30%,#b9b9c8 0 2.5%,transparent 3%),#e6e6f2;border-top:6px solid #fff}',
      '.upgoat{position:absolute;right:6%;bottom:26%;display:flex;flex-direction:column;align-items:center;animation:upgoat 5s ease-in-out infinite}.upgoat span{font-size:clamp(40px,7vw,90px)}.upgoat b{order:-1;background:#fff;color:#141428;padding:3px 10px;border-radius:12px;font-size:clamp(12px,1.6vw,20px)}',
      '@keyframes upgoat{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-30px) rotate(5deg)}}',
      '.upline{position:absolute;left:3%;right:3%;bottom:15%;display:flex;flex-wrap:wrap-reverse;justify-content:center;align-items:flex-end;gap:2px 6px}',
      '.uphop{display:flex;flex-direction:column;align-items:center;animation:upmoonhop 2s ease-in-out infinite}.uphop i{font-style:normal;font-size:1.6em;line-height:.8;margin-bottom:-.25em}',
      '.upparty.chute .uphop{animation-name:upchute}.upparty.chute{background:linear-gradient(rgba(58,160,255,.0),rgba(58,160,255,.0))}',
      '@keyframes upmoonhop{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-22vh) rotate(8deg)}}',
      '@keyframes upchute{0%{transform:translateY(-70vh) rotate(-6deg)}50%{transform:translateY(-34vh) rotate(6deg)}100%{transform:translateY(0) rotate(0)}}',
      '.upparty.chute .uphop{animation-iteration-count:1;animation-fill-mode:both;animation-timing-function:ease-out}',
      // a narrow screen: the gondola would run under the altitude gauge, so the ship keeps to the right of a slimmer gauge
      '@media (max-width:560px){.upship{left:48px;right:4px}.upgauge{left:4px;width:26px}.upgauge b{font-size:17px}.upgauge i{width:12px}.upgauge s{left:10px;font-size:12px}.upgauge s:before{left:-12px;width:14px}.upgon{padding:6px 6px 5px;border-width:3px}}',
      '@media (prefers-reduced-motion:reduce){.upship.upgo,.uphop,.upgoat,.upseat i{animation:none}}'
    ].join('\n');
    document.head.appendChild(c);
  })();

  window.SFA_ALOFT = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: function () { return spot(); }, restore: restore, gameOf: gameOf };
})();
