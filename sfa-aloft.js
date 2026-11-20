/* 🎈 All Aboard: the whole class flies one hot-air balloon to the Moon. Loaded by sfa-lesson.js (after sfa-crewkit.js)
   when the teacher starts one.

   Every student has their own burner. A right answer lights it for 80 seconds (more answers bank up to 160 s, no
   further), and the balloon climbs at a speed set by HOW MANY burners are lit at once, not by how many answers come in:
   one student answering twenty questions lights exactly one burner. With nine in ten lit the class gets a FULL BURN
   (×1.5). Reach the Moon, 1,000 m up, before the time runs out.

   Pulling everyone in:
   - a student's first right answer adds a few metres for the whole class (+8 m in a class of 27);
   - a COMEBACK SPARK: a burner that has been out for a minute (or was never lit after the first 75 s) is worth a jump
     for the whole class the moment it relights (+25 m in a class of 27), with a banner on every screen. Everyone whose
     burner is lit at that moment gets bonus XP, so the class wants quiet students back in. (Twice per student at most.)
   - questions come in tiers (sfa-crewkit.js): a student who has been quiet today starts on the questions the class
     has already met; a miss gets a hint and another try, never a knock-out.
   - no shaming: lit burners show the student's avatar and name on every screen; a burner that is out is an anonymous
     sandbag hanging under the basket (it drops off when the burner lights). Only the console lists who is out.

   The balance (worked out with a model of a class of 25 to 30 where about 6 in 10 take part and a right answer takes
   about 50 seconds): the balloon reaches the Moon in the chosen time if, on average, 56% of the burners are lit after
   the first half minute (NEED, RAMP). In the model that class lands with about 40 to 50 seconds to spare in 9 games out
   of 10; a class where under half take part usually ends a little short. The two bonuses are sized by the class
   (firstM, sparkM) so a small class is not short-changed.

   Sync like the Boss Raid: each student's running row (q "zupx1": "u1;id:<game>;r:<right>;f:<right first time>;
   n:<tries>") goes to the Sheet; the console works out who is lit and how high the balloon is, and publishes it in the
   live counts (zups: state, length, goal, altitude, crew, lit, sparks, won, full burn, crew list number, ever lit;
   zupid/zupst: the start; zupl: who is lit, zupj: who has ever been lit, as bit lists in crew order) and the spotlight
   (spot.q "zup": "P:" a page of the crew's names and avatars, "#E:" the latest lightings and sparks). */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, T = window.SFA_CREW;
  var H = A.H, el = A.el, esc = SFA.esc, fx = T.fx || function () { };
  var QID = 'zupx1', GOAL = 1000, BURN = 80, CAP = 160, QUIET = 60, LATE = 75, NEED = 0.56, RAMP = 30, SPARK_MAX = 2, FULL = 0.9;
  function firstM(n) { return Math.max(5, Math.min(16, Math.round(216 / Math.max(1, n)))); }
  function sparkM(n) { return Math.max(15, Math.min(45, Math.round(675 / Math.max(1, n)))); }
  function rateOf(dur) { return GOAL / (Math.max(60, dur - RAMP) * NEED); }
  // what the balloon passes on the way up: altitude, emoji, % from the left, size
  var MARKS = [[45, '🪁', 20, 1], [85, '🐦', 78, .9], [120, '🕊️', 30, .8], [165, '☁️', 12, 2.4], [205, '☁️', 84, 2.8], [250, '☁️', 26, 2], [290, '🦅', 74, 1.2], [330, '☁️', 86, 2.2], [370, '✈️', 22, 1.9], [420, '☁️', 14, 1.6], [455, '🪂', 80, 1.2], [500, '🛩️', 24, 1.4],
    [545, '🌈', 76, 2.4], [600, '🎈', 18, 1.4], [650, '💫', 80, 1.5], [700, '✨', 26, 1.3], [745, '🛰️', 76, 1.6], [790, '⭐', 16, 1], [830, '🪐', 82, 2.2], [870, '🌟', 28, 1], [905, '🛸', 74, 1.7], [945, '☄️', 20, 1.5]];
  var ZONES = [[0, '🌳', 'Treetops'], [140, '☁️', 'Cloud layer'], [340, '✈️', 'Jet lanes'], [540, '🌌', 'Edge of space'], [760, '🛰️', 'Orbit'], [930, '🌕', 'Moon approach']];
  var LAND = [[0, '🏫', 'the school roof'], [60, '🐦', 'a very surprised flock of pigeons'], [180, '☁️', 'a fluffy cloud'], [330, '🦅', 'the back of an eagle'], [400, '✈️', 'the wing of a passing jet'], [600, '🌈', 'a rainbow'], [800, '🛰️', 'a satellite dish'], [900, '🛸', 'a flying saucer (the aliens were lovely)']];
  // passers-by on the class screen: only for fun
  var VISIT = [[['🐦', 'Nice balloon!'], ['🐝', 'Bzzz. Going up?'], ['🦆', 'Quack. Race you!'], ['🪁', 'Wheee!']],
    [['🦅', 'Show-offs.'], ['✈️', 'The passengers are waving!'], ['🦸', 'Need a hand? No? OK.'], ['🧙', 'Nice broom. I mean balloon.']],
    [['🛰️', 'Beep. Beep. Beep.'], ['👽', 'Take us to your teacher.'], ['🐐', 'Meh-eh-eh. Space goat.'], ['👨‍🚀', 'You forgot your helmets!']]];

  function gameOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zups) || !Array.isArray(c.zupid)) return null;
    var z = c.zups, id = A.decRun(c.zupid), start = A.MODE === 'screen' ? id : A.decRun(c.zupst) || id;
    var sp = Lv.spot && Lv.spot.q === 'zup' ? String(Lv.spot.text || '') : '', ev = [], seq = 0, m = /#E:(\d+)\|([^#]*)/.exec(sp);
    if (m) { seq = +m[1]; ev = m[2] ? m[2].split(',').map(function (x) { var p = x.split('~'); return { k: p[0], n: p[1] || '', m: +p[2] || 0 }; }) : []; }
    return { id: id, start: start, state: z[0], dur: z[1] || 300, goal: z[2] || GOAL, alt: z[3] || 0, n: z[4] || 0, lit: z[5] || 0, sparks: z[6] || 0, win: !!z[7], full: !!z[8], ep: z[9] || 0, aboard: z[10] || 0,
      lits: Array.isArray(c.zupl) ? c.zupl : [], abs: Array.isArray(c.zupj) ? c.zupj : [], sp: sp, ev: ev, seq: seq };
  }
  function leftOf(b) { return Math.max(0, Math.round((b.start + b.dur * 1000 - T.sNow()) / 1000)); }
  function zoneOf(alt) { var z = 0; ZONES.forEach(function (x, i) { if (alt >= x[0]) z = i; }); return z; }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null, crew = T.Crew(), quiz = null;
  var ban = T.Banners(function () { return !!root; });
  function key() { return 'aloft.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function xp(n, once) { if (A.hero && ST && A.MODE === 'student') A.hero.add('u', String(Math.round(ST.id / 1000)) + (once ? 'e' : ''), n, once); }
  function myFp() { return A.S && A.S.me ? T.sh3(A.S.me.sid) : ''; }
  function big() { return A.MODE !== 'student'; }

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
    // the camera: how many pixels the world moves for each metre (a tall screen sees the sky go by faster)
    var ppm = Math.max(2.4, Math.min(5, window.innerHeight / 230));
    V = { id: b.id, b: b, ep: b.ep, ppm: ppm, zone: -1, lit: {}, bags: -1 }; crew = T.Crew();
    root = H('div', 'crw up' + (big() ? ' screen' : '')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'All Aboard');
    var far = '', wind = '';
    for (var i = 0; i < 9; i++) far += '<span style="left:' + ((i * 37 + 9) % 92) + '%;bottom:calc(30% + ' + Math.round((40 + i * 62) * ppm * 0.45) + 'px);font-size:' + (2.6 + (i * 7 % 5) * 0.7).toFixed(1) + 'em;animation-duration:' + (50 + (i * 13 % 40)) + 's;animation-delay:-' + (i * 9) + 's">☁️</span>';
    for (var w = 0; w < 7; w++) wind += '<i style="left:' + (6 + w * 14 + (w % 2) * 5) + '%;animation-duration:' + (1.1 + (w * 3 % 5) * 0.22).toFixed(2) + 's;animation-delay:-' + (w * 0.37).toFixed(2) + 's"></i>';
    root.innerHTML = '<div class="crwhud"><h1>🎈 All Aboard</h1><span class="crwpill time" id="upT"></span><span class="crwpill" id="upA"></span><span class="crwpill" id="upL"></span><span class="crwsp"></span><span class="crwpill crwstat" id="upS"></span></div>' +
      '<div class="crwbody"><div class="crwscene upsky"><div class="updusk"></div><div class="upnight"><i></i><i></i></div><div class="upfar">' + far + '</div>' +
      '<div class="upworld"><div class="upground"><div class="uphill"></div><div class="uphill h2"></div><span>🏫</span><span>🌳</span><span>🌲</span><span>🌳</span><span>👋</span></div>' +
      MARKS.map(function (m) { return '<span class="upmark" style="left:' + m[2] + '%;bottom:calc(12% + ' + Math.round(m[0] * ppm) + 'px);font-size:' + (m[3] * 2.4).toFixed(1) + 'em">' + m[1] + '</span>'; }).join('') +
      '<span class="upmoon" style="bottom:calc(40% + ' + Math.round(GOAL * ppm) + 'px)">🌕</span></div>' +
      '<div class="upwind">' + wind + '</div><div class="upvis"></div>' +
      '<div class="upship"><div class="upbal">' + balloon() + '<div class="upflame"><i></i><i></i></div></div><div class="upgon"><div class="upcrew"></div></div><div class="upbags"></div></div>' +
      '<div class="upgauge"><b>🌕</b><i>' + ZONES.slice(1).map(function (z) { return '<q style="bottom:' + (100 * z[0] / GOAL) + '%"></q>'; }).join('') + '<u></u><em>🎈</em><s title="Where the balloon needs to be by now">⏱</s></i><b>🏫</b></div>' +
      '<div class="upzone"></div><div class="upmeter"><b></b><span></span></div><div class="upfloat"></div><div class="crwvig"></div></div>' +
      '<div class="crwside"><div class="crwcard upq"></div><div class="crwcard upme"></div></div></div>';
    document.body.appendChild(root); document.body.classList.add('crwing');
    if (T.speaker) T.speaker(root.querySelector('.crwhud'));
    if (A.MODE === 'student') quiz = T.Quiz({ st: function () { return ST; }, keep: keep, seed: T.hash(A.S.me ? A.S.me.sid : 'x') + Math.round(b.id / 1000) % 99991, redraw: drawQ, right: right, tried: tried });
    V.tick = setInterval(function () { if (root) { drawTop(); if (A.MODE === 'student') drawMe(); } }, 1000);
    // a passer-by now and then (wide screens only)
    V.vis = setInterval(function () { if (root && V.b.state === 1 && root.querySelector('.crwscene').clientWidth >= 700 && !T.still()) visitor(); }, 34000);
    if (T.intro) T.intro(b, 'LIFT OFF!', 'A right answer lights your burner');
  }
  function close() {
    if (!root) return; clearInterval(V.tick); clearInterval(V.vis); ban.clear();
    root.remove(); root = null; V = null; quiz = null; document.body.classList.remove('crwing');
    var x = document.querySelector('.crwwatchx'); if (x) x.remove();
  }
  function balloon() {
    var cols = ['#FF5B5B', '#FFC94A', '#5CE0B8', '#6EA8FF'], rx = [96, 74, 50, 24], s = '';
    for (var i = 0; i < 4; i++) s += '<ellipse cx="100" cy="100" rx="' + rx[i] + '" ry="150" fill="' + cols[i] + '"/>';
    var P = 'M100 4C40 4 6 46 6 96c0 46 44 78 70 104h48c26-26 70-58 70-104C194 46 160 4 100 4Z';
    return '<svg viewBox="0 0 200 240" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs><clipPath id="upclip"><path d="' + P + '"/></clipPath>' +
      '<radialGradient id="upshade" cx="34%" cy="26%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1b1140" stop-opacity=".42"/></radialGradient>' +
      '<radialGradient id="upheat" cx="50%" cy="100%" r="62%"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".95"/><stop offset="1" stop-color="#FF9A3D" stop-opacity="0"/></radialGradient></defs>' +
      '<g clip-path="url(#upclip)"><rect width="200" height="210" fill="#B48CFF"/>' + s +
      '<path d="M0 86Q100 112 200 86v26Q100 138 0 112Z" fill="#141428" opacity=".85"/><path d="M0 91Q100 117 200 91v16Q100 133 0 107Z" fill="#FFE14D"/>' +
      '<g fill="#141428"><circle cx="40" cy="106" r="4"/><circle cx="70" cy="112" r="4"/><circle cx="100" cy="114" r="4"/><circle cx="130" cy="112" r="4"/><circle cx="160" cy="106" r="4"/></g>' +
      '<rect class="upheat" width="200" height="210" fill="url(#upheat)"/><rect width="200" height="210" fill="url(#upshade)"/></g>' +
      '<path d="' + P + '" fill="none" stroke="#141428" stroke-width="5"/>' +
      '<path d="M76 200h48l-5 13H81Z" fill="#8a5524" stroke="#141428" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M82 213L66 240M118 213l16 27M93 213l-5 27M107 213l5 27" stroke="#141428" stroke-width="3" stroke-linecap="round"/></svg>';
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
    if (prev && b.state === 1 && b.lit > prev.lit) flare(false);
    if (prev && b.state === 2 && prev.state !== 2) {
      V.endLeft = leftOf(prev);
      if (b.win) { fx('sfx', 'win'); fx('confetti', { ms: 4500, emoji: ['🌕', '⭐', '🎈'] }); var n = 0; (function c() { if (!root || n++ > 3) return; A.confetti(); setTimeout(c, 1100); })(); }
      else fx('sfx', 'lose');
    }
    V.prev = b;
    drawTop(); drawScene();
    if (A.MODE === 'student') {
      if (b.state === 2 && !ST.done && (ST.r || ST.n)) { ST.done = 1; keep(); xp(25 + (b.win ? 25 : 0), true); }
      drawMe();
      var sig = [b.state, T.pool().length].join('|'); if (sig !== V.qsig) { V.qsig = sig; drawQ(); }
    }
  }
  function flameAt() { return root && root.querySelector('.upflame'); }
  // the burners roar: the flame jumps and the balloon glows
  function flare(bigOne) {
    var f = flameAt(), bl = root && root.querySelector('.upbal'); if (!f) return;
    f.classList.remove('flare'); bl.classList.remove('flare'); void f.offsetWidth; f.classList.add('flare'); bl.classList.add('flare');
    if (bigOne) { fx('burst', f, { count: 22, emoji: ['⚡', '🔥'], spread: 260, colors: ['#FFE14D', '#FF9A3D', '#fff'] }); fx('shake', root.querySelector('.upship'), { power: 7, ms: 500 }); }
    else if (big()) fx('burst', f, { count: 8, spread: 120, colors: ['#FFE14D', '#FF9A3D'] });
  }
  function evFx(e) {
    var mine = A.MODE === 'student' && A.S.me && e.n === T.clean(A.first(A.S.me.name).replace(/[^A-Za-zÀ-ÿ' -]/g, ''));
    if (e.k === 's') {
      ban.say('⚡ <b>COMEBACK SPARK!</b> ' + esc(e.n) + ' is back: <b>+' + e.m + ' m</b> for everyone!', 'spark', 3200); floatUp('+' + e.m + ' m ⚡', true); flare(true);
      if (big()) fx('sfx', 'levelup');
      // teamwork: everyone holding the balloon up when a classmate comes back gets a little XP
      if (A.MODE === 'student' && !mine && ST.burn > Date.now()) { xp(4); }
    }
    else if (e.k === 'j') { if (!mine) ban.say('🔥 <b>' + esc(e.n) + '</b> lit a burner: +' + e.m + ' m', 'good', 1500); floatUp('+' + e.m + ' m'); if (big()) fx('sfx', 'coin'); }
    else if (e.k === 'f') {
      ban.say('🚀 <b>FULL BURN!</b> Nearly every burner is lit: ×1.5 speed!', 'spark', 3000); flare(true);
      if (big()) { fx('banner', 'FULL BURN!', { sub: 'Nearly every burner is lit: ×1.5 speed', ms: 1900 }); fx('sfx', 'combo'); }
    }
  }
  function floatUp(t, hot) { var f = root && root.querySelector('.upfloat'); if (!f || f.children.length > 5) return; var s = H('span', hot ? 'hot' : '', esc(t)); s.style.left = (34 + Math.random() * 32) + '%'; f.appendChild(s); setTimeout(function () { s.remove(); }, 2200); }
  function visitor() {
    var box = root.querySelector('.upvis'); if (!box || box.children.length) return;
    var list = VISIT[V.b.alt < 300 ? 0 : V.b.alt < 620 ? 1 : 2], v = list[Math.floor(Math.random() * list.length)], back = Math.random() < 0.5;
    var d = H('div', 'upvisit' + (back ? ' back' : ''), '<b>' + esc(v[1]) + '</b><span>' + v[0] + '</span>'); d.style.top = (14 + Math.random() * 30) + '%';
    box.appendChild(d); setTimeout(function () { d.remove(); }, 11500);
  }

  function drawTop() {
    if (!root || !V) return;
    var b = V.b, g = function (id) { return root.querySelector('#' + id); }, left = leftOf(b), on = b.state === 1;
    g('upT').innerHTML = on ? '⏱ <b>' + T.mmss(left) + '</b>' : b.win ? '🌕 <b>Landed!</b>' : '⏱ <b>Time!</b>';
    g('upA').innerHTML = '<b>' + Math.round(b.alt) + ' m</b><span class="crwx"> of ' + b.goal + '</span>';
    g('upL').innerHTML = '🔥 <b>' + b.lit + '</b><span class="crwx"> of </span><span class="upsl">/</span>' + b.n + '<span class="crwx"> lit</span>'; g('upL').className = 'crwpill' + (b.full ? ' hot' : '');
    var pace = Math.min(1, Math.max(0, (T.sNow() - b.start) / (b.dur * 1000))), togo = Math.max(0, Math.round(b.goal - b.alt));
    g('upS').innerHTML = !on ? '' : left <= 30 ? '🌕 <b>' + togo + ' m</b> to go!' : b.full ? '🚀 FULL BURN ×1.5' : !b.lit ? '😴 Hovering: light a burner!' : b.alt / b.goal >= pace - 0.03 ? '🟢 On track for the Moon' : pace * b.dur < 50 ? '⬆️ More burners = faster' : '🟠 Too slow: light more burners!';
    var u = root.querySelector('.upgauge u'), s = root.querySelector('.upgauge s'), em = root.querySelector('.upgauge em'), pc = Math.min(100, 100 * b.alt / b.goal);
    if (u) u.style.height = pc + '%'; if (em) em.style.bottom = pc + '%';
    if (s) { s.style.bottom = (pace * 100) + '%'; s.style.display = on ? '' : 'none'; }
    if (T.lastCall) T.lastCall(root, V, left, on, togo + ' m to the Moon');
  }
  function drawScene() {
    var b = V.b, sc = root.querySelector('.crwscene'), world = root.querySelector('.upworld'), on = b.state === 1, f01 = b.alt / b.goal;
    world.style.transform = 'translateY(' + Math.round(b.alt * V.ppm) + 'px)';
    root.querySelector('.upfar').style.transform = 'translateY(' + Math.round(b.alt * V.ppm * 0.45) + 'px)';
    root.querySelector('.updusk').style.opacity = Math.max(0, Math.min(1, (f01 - 0.22) / 0.3));
    root.querySelector('.upnight').style.opacity = Math.max(0, Math.min(1, (f01 - 0.5) / 0.3));
    root.querySelector('.upfar').style.opacity = Math.max(0, Math.min(1, (0.62 - f01) / 0.2));
    var fl = flameAt(), frac = b.lit / Math.max(1, b.n);
    fl.style.setProperty('--fs', (on && b.lit ? 0.45 + frac * 0.75 : 0).toFixed(2)); fl.classList.toggle('full', !!b.full);
    var heat = root.querySelector('.upheat'); if (heat) heat.style.opacity = (on ? Math.min(1, frac * 1.2) : 0).toFixed(2);
    root.querySelector('.upwind').style.opacity = (on ? Math.min(0.85, frac * (b.full ? 1.5 : 1)) : 0).toFixed(2);
    root.querySelector('.upship').className = 'upship' + (on && b.lit ? ' upgo' : '') + (b.state === 2 ? ' upover' : '') + (b.full ? ' upfull' : '');
    // where we are
    var z = zoneOf(b.alt);
    if (z !== V.zone) {
      var had = V.zone >= 0; V.zone = z;
      root.querySelector('.upzone').innerHTML = ZONES[z][1] + ' ' + ZONES[z][2];
      if (had && on) { if (big()) { fx('banner', ZONES[z][1] + ' ' + ZONES[z][2].toUpperCase(), { tone: 'info', ms: 1500, sub: Math.round(b.alt) + ' m up' }); fx('sfx', 'whoosh'); } else ban.say(ZONES[z][1] + ' <b>' + ZONES[z][2] + '</b>: ' + Math.round(b.alt) + ' m up!', 'good', 1800); }
    }
    drawCrew(sc); drawMeter();
    if (b.state === 2) ending(sc); else { var e = sc.querySelector('.crwend'); if (e) e.remove(); var p = sc.querySelector('.upparty'); if (p) p.remove(); V.esig = ''; }
  }
  // one small light for every burner: how close the class is to a FULL BURN, at a glance
  function drawMeter() {
    var b = V.b, m = root.querySelector('.upmeter'), n = Math.max(1, b.n), sig = n + '|' + b.lit + '|' + b.full + '|' + b.state; if (sig === V.msig) return; V.msig = sig;
    var need = Math.ceil(FULL * n), h = '';
    for (var i = 0; i < n; i++) h += '<i class="' + (i < b.lit ? 'on' : '') + (i === need - 1 && n >= 3 ? ' need' : '') + '"></i>';
    m.querySelector('span').innerHTML = h;
    m.querySelector('b').innerHTML = b.state !== 1 ? '' : b.full ? '🚀 FULL BURN' : n >= 3 && need - b.lit <= 3 && b.lit ? (need - b.lit) + ' more = FULL BURN' : '🔥 ' + b.lit + ' / ' + n;
    m.className = 'upmeter' + (b.full ? ' full' : '') + (b.state !== 1 ? ' off' : '');
  }
  // the basket: everyone whose burner is lit, by name. A burner that is out is a sandbag under the basket, with no name.
  function drawCrew(sc) {
    var b = V.b, n = Math.max(b.n, 1), me = myFp(), W = sc.clientWidth || 600, Hh = sc.clientHeight || 400, sig = [n, b.lits.join('.'), crew.key, W, Hh, b.state].join('|');
    if (sig === V.ssig) return; V.ssig = sig;
    var lit = [], mine = -1, i;
    for (i = 0; i < n; i++) { var c = crew.get(i); if (c.fp && c.fp === me) mine = i; if (T.bit(b.lits, i)) lit.push(i); }
    var seats = lit.slice(); if (mine >= 0 && lit.indexOf(mine) < 0) seats.unshift(mine);
    var small = W < 520, shown = small ? seats.slice(0, 7) : seats, more = seats.length - shown.length;
    var rowsN = small ? 1 : shown.length > 20 ? 3 : shown.length > 9 ? 2 : 1, cols = Math.max(1, Math.ceil((shown.length + (more > 0 ? 1 : 0)) / rowsN));
    var size = Math.max(22, Math.min(big() ? 88 : small ? 34 : 60, Math.floor(W * (small ? 0.7 : 0.6) / Math.max(cols, 4)) - 6, Math.floor(Hh * (small ? 0.2 : 0.4) / (rowsN + 0.3))));
    var h = shown.map(function (k) {
      var c2 = crew.get(k), on = T.bit(b.lits, k), you = k === mine, fresh = on && !V.lit[k] && V.litInit;
      return '<div class="upseat' + (on ? ' lit' : ' out') + (you ? ' you' : '') + (fresh ? ' in' : '') + '" style="width:' + size + 'px">' + (on ? '<i></i>' : '') +
        (c2.fp ? T.av(c2.look, size, false) : '<em style="font-size:' + Math.round(size * 0.6) + 'px">🙂</em>') +
        (small && !you ? '' : '<span class="crwname ' + (c2.fp ? T.ncls(c2.look) : '') + '">' + esc(you ? 'You' : c2.n) + '</span>') + (!on && you ? '<em class="upzz">💤</em>' : '') + '</div>';
    }).join('') + (more > 0 ? '<div class="upmore">+' + more + '</div>' : '');
    var gon = root.querySelector('.upgon'), cw = root.querySelector('.upcrew');
    cw.innerHTML = h || '<div class="upnone">Who lights the first burner?</div>'; cw.style.setProperty('--sz', size + 'px');
    gon.style.width = Math.min(W * 0.94, Math.max(W * (small ? 0.4 : 0.22), cols * (size + 6) + 34)) + 'px';
    var now = {}; lit.forEach(function (k) { now[k] = 1; }); V.lit = now; V.litInit = true;
    // the sandbags: one for every burner that is out. A bag drops off when a burner lights.
    var bags = Math.max(0, n - lit.length), bx = root.querySelector('.upbags');
    if (bags !== V.bags) {
      var bs = Math.max(12, Math.min(big() ? 34 : 20, Math.floor(W * 0.8 / Math.max(bags, 8)) - 4));
      if (V.bags >= 0 && bags < V.bags && b.state === 1 && !T.still()) dropBags(Math.min(4, V.bags - bags), bs);
      V.bags = bags;
      var hb = ''; for (i = 0; i < bags; i++) hb += '<span class="upbag" style="--bs:' + bs + 'px;--bl:' + (6 + (i * 5 % 3) * 4) + 'px"></span>';
      bx.innerHTML = b.state === 1 && !small ? hb : '';
    }
  }
  function dropBags(k, bs) {
    var f = root.querySelector('.upfloat'), g = root.querySelector('.upbags'), sc = root.querySelector('.crwscene'); if (!f || !g) return;
    var r = g.getBoundingClientRect(), s = sc.getBoundingClientRect();
    for (var i = 0; i < k; i++) { var d = H('span', 'upbag drop'); d.style.cssText = '--bs:' + bs + 'px;left:' + (r.left - s.left + r.width * (0.2 + 0.6 * Math.random())) + 'px;top:' + (r.top - s.top) + 'px;animation-delay:' + (i * 0.12) + 's'; f.appendChild(d); (function (d2) { setTimeout(function () { d2.remove(); }, 1600); })(d); }
  }
  function landOn(alt) { var t = LAND[0]; LAND.forEach(function (l) { if (alt >= l[0]) t = l; }); return t; }
  // the payoff: on the Moon, everyone who lit a burner bounces about in low gravity (and the wild goat got there first);
  // out of time, the crew parachutes down onto whatever was underneath
  function ending(sc) {
    var b = V.b, sig = [b.win, crew.key, b.abs.join('.'), sc.clientWidth].join('|'); if (V.esig === sig) return; V.esig = sig;
    var old = sc.querySelector('.crwend'); if (old) old.remove(); var op = sc.querySelector('.upparty'); if (op) op.remove();
    var who = []; for (var i = 0; i < Math.max(b.n, crew.total); i++) if (T.bit(b.abs, i) && crew.get(i).fp) who.push(crew.get(i));
    var e = H('div', 'crwend'), short = Math.round(b.goal - b.alt), ld = landOn(b.alt), close2 = !b.win && b.alt >= b.goal * 0.85;
    var chips = '<span>🔥 <b>' + b.aboard + '</b> of ' + b.n + ' burners lit</span>' + (b.sparks ? '<span>⚡ <b>' + b.sparks + '</b> comeback spark' + (b.sparks === 1 ? '' : 's') + '</span>' : '') +
      (b.win ? (V.endLeft > 0 ? '<span>⏱ <b>' + T.mmss(V.endLeft) + '</b> to spare</span>' : '') : '<span>🌕 <b>' + short + ' m</b> short</span>');
    e.innerHTML = b.win ? '<h1>MOON LANDING!</h1><p>You did it together. One small step for Sandy Flats…</p><div class="crwchips">' + chips + '</div>'
      : '<h1>' + (close2 ? 'SO CLOSE!' : 'SOFT LANDING') + ' · ' + Math.round(b.alt) + ' m</h1><p>The balloon came down on ' + esc(ld[2]) + ' ' + ld[1] + '. More burners lit <b>at the same time</b> = higher.</p><div class="crwchips">' + chips + '</div>';
    sc.appendChild(e);
    var size = Math.max(30, Math.min(big() ? 96 : 54, Math.floor((sc.clientWidth || 600) * 0.9 / Math.max(4, Math.min(who.length, 14)))));
    var p = H('div', 'upparty' + (b.win ? ' moon' : ' chute'));
    p.style.setProperty('--sz', size + 'px');
    p.innerHTML = (b.win ? '<div class="upstars"></div><div class="upearth">🌍</div><div class="upsurf"></div><div class="upflag"><b>SANDY FLATS</b><i></i></div><div class="upgoat"><b>I got here first.</b><span>🐐</span></div><div class="uppark">🎈</div>'
      : '<div class="upland"><span>' + ld[1] + '</span></div>') +
      '<div class="upline">' + who.map(function (c, i2) { return '<div class="uphop" style="animation-delay:' + (b.win ? -(i2 * 0.37) % 2.4 : 0.3 + i2 * 0.14).toFixed(2) + 's;animation-duration:' + (b.win ? 1.9 + (i2 % 5) * 0.28 : 2.4 + (i2 % 4) * 0.3).toFixed(2) + 's">' + (b.win ? '' : '<i>🪂</i>') + T.av(c.look, size, false) + '<span class="crwname ' + T.ncls(c.look) + '">' + esc(c.n) + '</span></div>'; }).join('') + '</div>';
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
    var b = V.b, left = litLeft(), h, cls = '', n = Math.max(1, b.n), need = Math.ceil(FULL * n) - b.lit;
    function ring(pc, ic) { return '<div class="upring" style="--p:' + Math.round(pc) + '"><span>' + ic + '</span></div>'; }
    if (b.state === 2) {
      var I = A.hero ? A.hero.info() : null;
      h = '<p class="crwkick">Your flight</p><p class="upstat">' + (ST.r ? 'You lit your burner <b>' + ST.r + '</b> time' + (ST.r === 1 ? '' : 's') + (ST.sp ? ' and gave the class <b>' + ST.sp + '</b> comeback spark' + (ST.sp === 1 ? '' : 's') : '') + '. The balloon needed you.' : 'Your burner stayed out this flight. Next time, one right answer is all it takes to help lift everyone.') + '</p>' +
        (I ? '<p class="upstat">⭐ Level ' + I.lv + ' ' + esc(I.title) + ' · ' + I.xp + ' XP</p>' : '');
    } else if (left > 0) {
      var low = left <= 15; cls = low ? 'low' : 'lit';
      h = '<div class="upburner">' + ring(100 * left / CAP, '🔥') + '<div><p class="upbig">' + (low ? '⚠️ ' : '') + T.mmss(left) + '</p><p class="upstat">' + (low ? '<b>Burner low!</b> Answer now to keep it lit.' : b.full ? '<b>FULL BURN!</b> Keep it lit: everyone is flying.' : '<b>Your burner is lit.</b> You are lifting the whole class.') + '</p></div></div>';
    } else if (sparkReady()) {
      cls = 'spark';
      h = '<div class="upburner">' + ring(0, '⚡') + '<div><p class="upbig">Spark ready!</p><p class="upstat">Your next right answer = <b>+' + sparkM(n) + ' m for everyone</b>. The class needs you.</p></div></div>';
    } else {
      cls = 'out';
      h = '<div class="upburner">' + ring(0, ST.r ? '💨' : '🎈') + '<div><p class="upbig">' + (ST.r ? 'Burner out' : 'Not lit yet') + '</p><p class="upstat">' + (n >= 3 && need > 0 && need <= 3 && b.lit ? '<b>' + need + ' more burner' + (need === 1 ? '' : 's') + ' = FULL BURN.</b> The class needs yours!' : ST.r ? '<b>One right answer</b> lights it again.' : '<b>One right answer</b> lights it: +' + firstM(n) + ' m for the class.') + '</p></div></div>';
    }
    if (box._h !== h) { box._h = h; box.innerHTML = h; }
    cls = 'crwcard upme ' + cls; if (box.className !== cls) box.className = cls;
  }
  function right(first, Q, run) {
    var now = Date.now(), was = ST.burn || 0, comeback = sparkReady(), firstEver = !ST.r, n = Math.max(1, V.b.n);
    ST.r++; if (first) ST.f++;
    ST.burn = Math.min(now + CAP * 1000, Math.max(was, now) + BURN * 1000 * (first ? 1 : 0.75));
    xp(first ? 10 : 6);
    var msg = '<b>🔥 ' + (was > now ? 'More fuel!' : firstEver ? 'Your burner is lit!' : 'Relit!') + '</b> Burning for ' + T.mmss(litLeft()) + '.';
    if (comeback) { ST.sp++; xp(15); A.confetti(); fx('sfx', 'levelup'); msg = '<b>⚡ COMEBACK SPARK!</b> You just gave the whole class +' + sparkM(n) + ' m. Burning for ' + T.mmss(litLeft()) + '.'; }
    else if (firstEver) msg += ' +' + firstM(n) + ' m for the class.';
    keep(); send(); drawMe();
    // my own burner roars straight away
    flare(comeback);
    var rg = root.querySelector('.upring'); if (rg) { fx('pop', rg); fx('burst', rg, { count: 12, emoji: ['🔥'], spread: 130 }); fx('float', rg, comeback ? '⚡ +' + sparkM(n) + ' m' : '+' + (first ? '1:20' : '1:00') + ' 🔥', { color: '#FFE14D', size: 24 }); }
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
    A.console_().aloft = K = { id: t, state: 1, dur: dur, goal: GOAL, alt: 0, win: false, rate: rateOf(dur), order: [], idx: {}, burn: {}, first: {}, spk: {}, rows: {}, ev: [], seq: 0, sparks: 0, lit: 0, full: false, fullAt: 0, ep: Math.floor(Math.random() * 9000) + 1, tAt: Date.now(), pk: '' };
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
        var was = K.burn[sid] || 0, e = (now - K.id) / 1000, comeback = (was ? now - was >= (QUIET - 10) * 1000 : e >= LATE - 2) && (K.spk[sid] || 0) < SPARK_MAX, firstTry = row.f > (old ? old.f : 0), N = K.order.length;
        K.burn[sid] = Math.min(now + CAP * 1000, Math.max(was, now) + BURN * 1000 * (firstTry ? 1 : 0.75));
        if (comeback) { K.spk[sid] = (K.spk[sid] || 0) + 1; K.alt += sparkM(N); K.sparks++; ev(K, { k: 's', n: T.nameOf(sid), m: sparkM(N) }); }
        else if (!K.first[sid]) { K.alt += firstM(N); ev(K, { k: 'j', n: T.nameOf(sid), m: firstM(N) }); }
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
    A.console_().aloft = { id: b.id, state: 1, dur: b.dur, goal: b.goal, alt: b.alt, win: false, rate: rateOf(b.dur), order: [], idx: {}, burn: {}, first: {}, spk: {}, rows: {}, ev: [], seq: b.seq, sparks: b.sparks, lit: 0, full: false, fullAt: 0, ep: b.ep % 9000 + 1, tAt: Date.now(), restored: true };
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
      dd.appendChild(H('p', 'muted', 'A quiet word with someone whose burner is out is worth a lot: their next right answer is a comeback spark, +' + sparkM(K.order.length) + ' m for everyone.'));
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
    var stars = function (n, seed) { var s = [], r = T.rng(seed); for (var i = 0; i < n; i++) s.push('radial-gradient(' + (1 + Math.floor(r() * 2)) + 'px ' + (1 + Math.floor(r() * 2)) + 'px at ' + (r() * 100).toFixed(1) + '% ' + (r() * 100).toFixed(1) + '%,#fff,transparent)'); return s.join(','); };
    c.textContent = [
      '.crw.up{background:#0d1030}',
      // the sky: day, then a deep blue dusk, then space
      '.upsky{background:linear-gradient(#2f8ff0 0%,#7cc6ff 50%,#cfefff 86%,#f4fbff 100%)}',
      '.updusk{position:absolute;inset:0;opacity:0;transition:opacity 4s linear;background:linear-gradient(#1b1f6b 0%,#4a3fa8 45%,#b86bd0 80%,#ffb38a 100%)}',
      '.upnight{position:absolute;inset:0;opacity:0;transition:opacity 4s linear;background:radial-gradient(ellipse at 70% 110%,#3b1d6e 0,transparent 55%),linear-gradient(#03041a,#0d1140 70%,#1a1a5c)}',
      '.upnight i{position:absolute;inset:0;background:' + stars(26, 7) + ';animation:uptw 2.6s ease-in-out infinite alternate}.upnight i+i{background:' + stars(22, 99) + ';animation-duration:3.7s;animation-delay:-1.5s}',
      '@keyframes uptw{from{opacity:.35}to{opacity:1}}',
      '.upfar{position:absolute;inset:0;transition:transform 3.5s linear,opacity 3s;will-change:transform;pointer-events:none}',
      '.upfar span{position:absolute;opacity:.5;filter:blur(1px);animation:updrift 60s linear infinite alternate}@keyframes updrift{from{transform:translateX(-6vw)}to{transform:translateX(6vw)}}',
      '.upworld{position:absolute;inset:0;transition:transform 3.5s linear;will-change:transform}',
      '.upground{position:absolute;left:-5%;right:-5%;bottom:-60%;height:72%;background:linear-gradient(#7ddb62 0,#46a544 12%,#2c6e2f 100%);border-top:5px solid #2c6e2f;border-radius:50% 50% 0 0/6% 6% 0 0}',
      '.uphill{position:absolute;left:4%;top:-9%;width:44%;height:22%;border-radius:50% 50% 0 0;background:#5fbf6a;z-index:-1}.uphill.h2{left:52%;top:-13%;width:50%;height:28%;background:#4aa85c}',
      '.upground span{position:absolute;top:0;transform:translateY(-84%);font-size:clamp(34px,6vw,96px)}.upground span:nth-of-type(1){left:12%}.upground span:nth-of-type(2){left:78%}.upground span:nth-of-type(3){left:86%;font-size:clamp(26px,4.6vw,70px)}.upground span:nth-of-type(4){left:26%;font-size:clamp(22px,3.6vw,56px)}.upground span:nth-of-type(5){left:19%;font-size:clamp(16px,2.4vw,38px);animation:upwave .6s ease-in-out infinite alternate}',
      '@keyframes upwave{from{transform:translateY(-84%) rotate(-12deg)}to{transform:translateY(-84%) rotate(14deg)}}',
      '.upmark{position:absolute;transform:translateX(-50%);line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25))}',
      '.upmoon{position:absolute;left:50%;transform:translateX(-50%);font-size:min(52vh,420px);line-height:1;filter:drop-shadow(0 0 50px rgba(255,255,210,.75))}',
      // speed lines while the balloon climbs
      '.upwind{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 2s;overflow:hidden}',
      '.upwind i{position:absolute;top:-26%;width:3px;height:20%;border-radius:3px;background:linear-gradient(rgba(255,255,255,0),rgba(255,255,255,.75));animation:upwind 1.3s linear infinite;will-change:transform}@keyframes upwind{to{transform:translateY(650%)}}',
      '.upvis{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1}',
      '.upvisit{position:absolute;left:0;display:flex;flex-direction:column;align-items:center;animation:upvisit 11s linear forwards}.upvisit span{font-size:clamp(34px,5vw,84px);line-height:1}.upvisit b{background:#fff;color:#141428;padding:.2em .7em;border-radius:14px;font-size:clamp(12px,1.5vw,26px);white-space:nowrap;box-shadow:0 4px 0 rgba(0,0,0,.25)}',
      '.upvisit.back{animation-name:upvisitb}.upvisit:not(.back) span{transform:scaleX(-1)}',
      '@keyframes upvisit{from{transform:translateX(-30vw)}to{transform:translateX(110vw)}}@keyframes upvisitb{from{transform:translateX(110vw)}to{transform:translateX(-30vw)}}',
      // the balloon
      '.upship{position:absolute;left:0;right:0;top:3%;bottom:8%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;pointer-events:none;z-index:2}',
      '.upship.upgo{animation:upbob 3.4s ease-in-out infinite}.upship.upfull{animation-duration:1.7s}.upship.upover{opacity:0;transition:opacity 1.2s}',
      '@keyframes upbob{0%,100%{transform:translateY(0) rotate(-.6deg)}50%{transform:translateY(-12px) rotate(.6deg)}}',
      '.upbal{position:relative;flex:1;min-height:50px;width:100%;display:flex;justify-content:center;--fw:clamp(18px,4.4vw,76px)}.upbal svg{height:100%;max-width:80%;filter:drop-shadow(0 10px 18px rgba(0,0,20,.35))}',
      '.upbal .upheat{opacity:0;transition:opacity 1.2s}.upbal.flare svg{animation:upglow .9s ease-out}@keyframes upglow{0%{filter:drop-shadow(0 10px 18px rgba(0,0,20,.35)) brightness(1)}25%{filter:drop-shadow(0 0 34px rgba(255,190,80,.95)) brightness(1.28)}100%{filter:drop-shadow(0 10px 18px rgba(0,0,20,.35)) brightness(1)}}',
      '.upflame{--fs:0;position:absolute;z-index:3;left:50%;bottom:11%;width:var(--fw);height:calc(var(--fw)*1.7);margin-left:calc(var(--fw)/-2);transform-origin:50% 100%;transform:scale(var(--fs));transition:transform .9s cubic-bezier(.3,1.6,.5,1)}',
      '.upflame i{position:absolute;left:0;right:0;bottom:0;height:100%;border-radius:50% 50% 50% 50%/64% 64% 36% 36%;background:radial-gradient(ellipse at 50% 88%,#fff 0 14%,#FFE14D 34%,#FF9A3D 58%,rgba(255,80,40,0) 72%);animation:upflick .21s ease-in-out infinite alternate;transform-origin:50% 100%}',
      '.upflame i+i{left:24%;right:24%;height:60%;background:radial-gradient(ellipse at 50% 88%,#fff 0 28%,#9FE8FF 56%,rgba(120,200,255,0) 74%);animation-duration:.16s}',
      '.upflame.full i{background:radial-gradient(ellipse at 50% 88%,#fff 0 22%,#9FE8FF 40%,#FFE14D 58%,rgba(255,120,40,0) 74%)}',
      '@keyframes upflick{from{transform:scale(.9,.86)}to{transform:scale(1.06,1.1)}}',
      '.upflame.flare{animation:upflare .9s ease-out}@keyframes upflare{0%{transform:scale(var(--fs))}22%{transform:scale(calc(var(--fs)*1.9 + .5))}100%{transform:scale(var(--fs))}}',
      // the basket and its crew
      '.upgon{position:relative;display:flex;justify-content:center;padding:0 12px 6px;background:repeating-linear-gradient(90deg,rgba(0,0,0,.14) 0 3px,transparent 3px 14px),repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0 3px,transparent 3px 12px),linear-gradient(#c98a45,#8a5524);border:4px solid #141428;border-radius:8px 8px 24px 24px;box-shadow:inset 0 7px 0 #e3a862,0 10px 18px rgba(0,0,20,.3);transition:width .5s}',
      '.upcrew{width:100%;display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:calc(var(--sz,40px)*.2) 6px;margin-top:calc(var(--sz,40px)*-.55);min-height:calc(var(--sz,40px)*.75)}',
      '.upseat{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}.upseat svg{width:100%;height:auto;display:block}',
      '.upseat i{position:absolute;top:-.55em;left:50%;width:.5em;height:.8em;margin-left:-.25em;font-size:calc(var(--sz,40px)*.42);border-radius:50% 50% 50% 50%/64% 64% 36% 36%;background:radial-gradient(ellipse at 50% 85%,#fff 0 18%,#FFE14D 42%,#FF7A3D 70%,rgba(255,80,40,0) 76%);transform-origin:50% 100%;animation:upflick .3s ease-in-out infinite alternate}',
      '.upseat em{font-style:normal;line-height:1.25}.upseat.out svg{opacity:.45;filter:grayscale(.8)}.upseat .upzz{position:absolute;top:-.3em;right:-.2em;font-size:calc(var(--sz,40px)*.4)}',
      '.upseat.in{animation:uphopin .7s cubic-bezier(.2,1.7,.4,1) both}.upseat.you .crwname{color:#141428;background:#FFE14D;border-radius:6px;padding:0 5px;text-shadow:none}',
      '.upseat .crwname{font-size:clamp(10px,calc(var(--sz,40px)*.24),24px);max-width:calc(var(--sz,40px) + 8px);overflow:hidden;text-overflow:ellipsis}',
      '@keyframes uphopin{from{transform:translateY(-60%) scale(.4) rotate(-20deg);opacity:0}to{transform:none;opacity:1}}',
      '.upmore{align-self:center;font:400 clamp(13px,1.6vw,26px) "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 2px 0 #141428;padding:0 4px}',
      '.upnone{align-self:center;padding:calc(var(--sz,40px)*.6) 8px 2px;font-weight:800;font-size:clamp(11px,1.5vw,24px);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8);white-space:nowrap}',
      '.upbags{display:flex;justify-content:center;align-items:flex-start;gap:3px;min-height:6px;max-width:92%}.upbags small{font-weight:800;font-size:11px;color:#fff;text-shadow:0 1px 2px #000;align-self:flex-end}',
      '.upbag{position:relative;flex:none;width:var(--bs,20px);height:calc(var(--bs,20px)*1.15);margin-top:var(--bl,8px);border-radius:38% 38% 46% 46%/30% 30% 50% 50%;background:linear-gradient(100deg,#e9d6a8,#b79b62);border:2px solid #141428;box-shadow:inset 0 -4px 0 rgba(0,0,0,.14)}',
      '.upbag:before{content:"";position:absolute;left:50%;bottom:100%;width:2px;height:calc(var(--bl,8px) + 2px);margin-left:-1px;background:#141428}.upbag:after{content:"";position:absolute;left:22%;right:22%;top:12%;height:3px;border-radius:2px;background:#8a6a2c}',
      '.upbag.drop{position:absolute;margin:0;animation:upbagdrop 1.3s cubic-bezier(.5,0,.9,.6) forwards}.upbag.drop:before{display:none}@keyframes upbagdrop{to{transform:translateY(80vh) rotate(260deg);opacity:.2}}',
      // the altitude gauge
      '.upgauge{position:absolute;left:10px;top:7%;bottom:9%;width:36px;display:flex;flex-direction:column;align-items:center;gap:4px;z-index:3}',
      '.crw.screen .upgauge{left:22px;width:54px}.crw.screen .upgauge b{font-size:38px}.crw.screen .upgauge i{width:24px;border-radius:13px;border-width:3px}.crw.screen .upgauge em{font-size:34px}.crw.screen .upgauge s{font-size:24px;left:22px}',
      '.upgauge b{font-size:22px;line-height:1}.upgauge i{position:relative;flex:1;width:16px;border-radius:9px;background:rgba(10,10,30,.6);border:2px solid rgba(255,255,255,.8)}',
      '.upgauge u{position:absolute;left:0;right:0;bottom:0;border-radius:inherit;background:linear-gradient(#FFE14D,#FF7A3D);transition:height 3.5s linear}',
      '.upgauge q{position:absolute;left:-3px;right:-3px;height:2px;background:rgba(255,255,255,.7)}',
      '.upgauge em{position:absolute;left:50%;font-style:normal;font-size:20px;line-height:1;transform:translate(-50%,35%);transition:bottom 3.5s linear;filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}',
      '.upgauge s{position:absolute;left:14px;transform:translateY(50%);text-decoration:none;font-size:15px;white-space:nowrap}.upgauge s:before{content:"";position:absolute;left:-16px;top:50%;width:18px;border-top:2px dashed #fff}',
      '.upzone{position:absolute;left:64px;top:8%;z-index:3;padding:.2em .8em;border-radius:99px;background:rgba(10,8,30,.6);font-weight:800;font-size:clamp(12px,1.5vw,28px);white-space:nowrap}.crw.screen .upzone{left:104px}.upzone:empty{display:none}',
      // the row of burner lights
      '.upmeter{position:absolute;left:14%;right:14%;bottom:1.6%;z-index:3;display:flex;align-items:center;gap:10px;padding:5px 12px;border-radius:99px;background:rgba(10,8,30,.72);border:2px solid rgba(255,255,255,.25)}',
      '.upmeter.off{display:none}.upmeter b{flex:none;font-weight:800;font-size:clamp(11px,1.4vw,26px);white-space:nowrap;color:#FFE14D}.upmeter span{flex:1;display:flex;gap:3px;height:clamp(8px,1.6vh,20px)}',
      '.upmeter i{flex:1;border-radius:4px;background:rgba(255,255,255,.16);transition:background .4s}.upmeter i.on{background:linear-gradient(#FFE14D,#FF7A3D);box-shadow:0 0 8px rgba(255,160,60,.8)}.upmeter i.need{border-right:3px solid #9FE8FF}',
      '.upmeter.full{border-color:#9FE8FF;animation:upfullp .7s ease-in-out infinite alternate}@keyframes upfullp{from{box-shadow:0 0 0 rgba(159,232,255,0)}to{box-shadow:0 0 26px rgba(159,232,255,.9)}}',
      '.upfloat{position:absolute;inset:0;pointer-events:none;z-index:4;overflow:hidden}.upfloat span:not(.upbag){position:absolute;top:40%;font:400 clamp(22px,4vw,64px) "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 3px 0 #141428;animation:upfloat 2.1s ease-out forwards;white-space:nowrap}.upfloat span.hot{color:#fff;font-size:clamp(28px,5.4vw,96px);text-shadow:0 4px 0 #C8232C}',
      '@keyframes upfloat{from{transform:translateY(20px) scale(.6);opacity:0}15%{opacity:1;transform:translateY(0) scale(1.1)}to{transform:translateY(-120px);opacity:0}}',
      // my burner (student)
      '.upme{transition:border-color .3s,box-shadow .3s}.upme.lit{border-color:#FFC94A;box-shadow:0 0 18px rgba(255,160,60,.45)}.upme.low{border-color:#FF5B5B;animation:uplow .5s ease-in-out infinite alternate}.upme.spark{border-color:#FFE14D;background:linear-gradient(180deg,rgba(255,225,77,.22),rgba(255,122,61,.14));animation:upspk .8s ease-in-out infinite alternate}',
      '@keyframes uplow{from{box-shadow:0 0 0 rgba(255,91,91,0)}to{box-shadow:0 0 20px rgba(255,91,91,.8)}}@keyframes upspk{from{box-shadow:0 0 4px rgba(255,225,77,.3)}to{box-shadow:0 0 26px rgba(255,225,77,.9)}}',
      '.upburner{display:flex;align-items:center;gap:12px}.upburner>div:last-child{flex:1;min-width:0}',
      '.upring{--p:0;flex:none;width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#FFC94A calc(var(--p)*1%),#2a2748 0);box-shadow:0 0 0 2px #141428}.upring span{width:50px;height:50px;border-radius:50%;background:#14122a;display:grid;place-items:center;font-size:28px;line-height:1}',
      '.upme.out .upring span,.upme.spark .upring span{filter:none}.upme.lit .upring span,.upme.low .upring span{animation:upflick .35s ease-in-out infinite alternate}',
      '.upbig{margin:0;font:400 clamp(22px,3vw,30px)/1.1 "Luckiest Guy",system-ui;color:#FFE14D;letter-spacing:.02em}.upme.out .upbig{color:#C9C5E8}.upme.low .upbig{color:#FF8A8A}',
      '.upstat{margin:2px 0 0;font-size:15px;line-height:1.3}.upstat b{color:#FFE14D}',
      // the endings
      '.upparty{position:absolute;inset:0;z-index:7;pointer-events:none;overflow:hidden}',
      '.upparty.moon{background:radial-gradient(ellipse at 20% 10%,#2a1a5e 0,transparent 50%),linear-gradient(#03041a 0,#131a4a 100%)}',
      '.upstars{position:absolute;inset:0;background:' + stars(40, 31) + ';animation:uptw 2.4s ease-in-out infinite alternate}',
      '.upearth{position:absolute;left:8%;top:30%;font-size:clamp(50px,10vw,180px);line-height:1;filter:drop-shadow(0 0 30px rgba(120,180,255,.7));animation:upearth 9s ease-in-out infinite alternate}@keyframes upearth{from{transform:translateY(0) rotate(-8deg)}to{transform:translateY(-14px) rotate(8deg)}}',
      '.upsurf{position:absolute;left:-10%;right:-10%;bottom:-34%;height:60%;border-radius:50%;background:radial-gradient(circle at 20% 22%,#b9b9c8 0 4%,transparent 4.5%),radial-gradient(circle at 62% 14%,#b9b9c8 0 3%,transparent 3.5%),radial-gradient(circle at 80% 26%,#b9b9c8 0 5%,transparent 5.5%),radial-gradient(circle at 40% 30%,#b9b9c8 0 2.5%,transparent 3%),linear-gradient(#f2f2fa,#c9c9d8);border-top:6px solid #fff;box-shadow:0 0 60px rgba(255,255,230,.35)}',
      '.upflag{position:absolute;left:47%;bottom:24%;display:flex;flex-direction:column;align-items:flex-start;animation:upflagin 1s cubic-bezier(.2,1.5,.4,1) .6s both;transform-origin:0 100%}.upflag b{background:#FF5B5B;color:#fff;padding:.25em .7em;border:3px solid #141428;font:400 clamp(11px,1.5vw,26px) "Luckiest Guy",system-ui;white-space:nowrap;border-radius:0 8px 8px 0}.upflag i{width:5px;height:clamp(40px,8vh,110px);background:#141428;border-radius:3px}',
      '@keyframes upflagin{from{transform:scaleY(0)}to{transform:none}}',
      '.upgoat{position:absolute;right:6%;bottom:26%;display:flex;flex-direction:column;align-items:center;animation:upgoat 5s ease-in-out infinite}.upgoat span{font-size:clamp(40px,7vw,100px)}.upgoat b{background:#fff;color:#141428;padding:3px 10px;border-radius:12px;font-size:clamp(12px,1.6vw,24px);white-space:nowrap}',
      '.uppark{position:absolute;left:16%;bottom:23%;font-size:clamp(34px,6vw,100px);line-height:1;transform:rotate(-14deg)}',
      '@keyframes upgoat{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-30px) rotate(5deg)}}',
      '.upline{position:absolute;left:3%;right:3%;bottom:13%;display:flex;flex-wrap:wrap-reverse;justify-content:center;align-items:flex-end;gap:2px 6px}',
      '.uphop{display:flex;flex-direction:column;align-items:center;animation:upmoonhop 2s ease-in-out infinite}.uphop i{font-style:normal;font-size:calc(var(--sz,50px)*.95);line-height:.9;margin-bottom:-.18em}',
      '.upparty.chute{background:linear-gradient(rgba(10,8,30,.25),rgba(10,8,30,0) 50%)}.upparty.chute .uphop{animation-name:upchute;animation-iteration-count:1;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.4,1)}',
      '.upland{position:absolute;left:8%;right:8%;bottom:3%;height:11%;border-radius:50%;background:radial-gradient(ellipse at 50% 0,rgba(255,255,255,.95),rgba(255,255,255,.55) 60%,rgba(255,255,255,0) 72%)}.upland span{position:absolute;left:50%;bottom:10%;transform:translateX(-50%);font-size:clamp(50px,11vw,200px);line-height:1;opacity:.9}',
      '@keyframes upmoonhop{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-22vh) rotate(8deg)}}',
      '@keyframes upchute{0%{transform:translateY(-80vh) rotate(-8deg)}60%{transform:translateY(-12vh) rotate(6deg)}100%{transform:translateY(0) rotate(0)}}',
      '.crw.screen .uphop .crwname{font-size:clamp(14px,1.25vw,26px)}',
      '.upsl{display:none}',
      // a phone: the ending's words shrink so the Moon party still shows
      '@media (max-width:560px){.crw.up:not(.screen) .crwend{padding-top:6px}.crw.up:not(.screen) .crwend h1{font-size:28px}.crw.up:not(.screen) .crwend p{display:none}.crw.up:not(.screen) .crwchips{margin-top:4px;gap:4px}.crw.up:not(.screen) .crwchips span{font-size:11px}.crw.up:not(.screen) .upgoat b{display:none}}',
      // a narrow screen: a small window on the balloon, then the question straight away
      '@media (max-width:820px){.crw.up:not(.screen) .crwscene{height:27vh;min-height:150px}}',
      '@media (max-width:560px){.crw.up:not(.screen) .upsl{display:inline}.crw.up:not(.screen) #upS{display:none}.upgauge{left:4px;width:26px;top:5%;bottom:14%}.upgauge b{font-size:16px}.upgauge i{width:12px}.upgauge em{font-size:15px}.upgauge s{left:10px;font-size:12px}.upgauge s:before{left:-12px;width:14px}.upzone{left:36px;top:5%}.upgon{padding:0 6px 4px;border-width:3px}.upmeter{left:36px;right:8px;padding:3px 8px;gap:6px}.upship{bottom:15%;top:2%}.upring{width:54px;height:54px}.upring span{width:42px;height:42px;font-size:24px}}',
      '@media (prefers-reduced-motion:reduce){.upship.upgo,.uphop,.upgoat,.upseat i,.upflame i,.upwind i,.upnight i,.upfar span,.upme.low,.upme.spark,.upmeter.full,.upearth,.upstars,.upground span{animation:none!important}}'
    ].join('\n');
    document.head.appendChild(c);
  })();

  window.SFA_ALOFT = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: function () { return spot(); }, restore: restore, gameOf: gameOf };
})();
