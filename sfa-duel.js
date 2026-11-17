/* 🚀 Laser Lines: a space battle fought with straight lines. Loaded by sfa-lesson.js when the teacher starts it.

   Two fleets face each other across a coordinate grid in deep space: one fleet on the left (x < 0), the other on the
   right (x > 0). Every student's avatar stands on a grid point. Each round every student gets a secret mission: their
   own point A and an enemy's point B. They write the line through A and B as y = mx + b (three tries). When the clock
   runs out (about two minutes, or sooner if everyone has locked in) every laser fires at once along the line its
   student typed. A right line goes through the target; a wrong one flies off where it was aimed (and might still hit
   someone). Lasers that meet head-on clash: the stronger one survives, weakened by the other's power, and two lasers of
   about the same power cancel out. Lock in sooner for a faster, stronger laser (a second or third try weakens it).
   Finished early? A bonus line charges a shield that blocks one hit.

   Support: every student gets one of three missions, set from today's answers and adjusted each round (the teacher can
   change it): just the two points; an easy table of points on the line (x = 0, 1, 2, 3, so b and the slope show); or
   the slope and the intercept given, to put together into y = mx + b.

   Each student's row also carries their running totals for the battle (rounds, lines right, right first time, the help
   levels they had, hits, damage, clashes, shield blocks, win or loss), which the teacher's Report page turns into a line.

   Sync through the Sheet like Sumo Graphing: students send one running row (q "zduelx1", an x1 extra, so it never
   counts as a lesson answer). The console referees and publishes in the live counts
     zds  state (3 briefing, 1 aiming, 5 firing, 4 between rounds, 2 over), round, rounds, aim seconds, phase start
          (s after the id), briefing seconds, score 0, score 1, students, locked 0, locked 1, length of the volley
   and the spotlight (spot.q "zduel"): "P:round.page|" the roster a page at a time (fingerprint~team~x~y~target~support~
   locked~name~look), "F:round|" the volley (fingerprint~slope~intercept~speed,tries-1,shield), "L:" the last round's
   recap and "M:" the stars of the battle. Every screen plays the volley from the same numbers with the same
   simulation, so they all show the same battle. */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, AV = window.SFA_AVATAR;
  if (!A || !SFA || window.SFA_DUEL) return;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zduelx1', INTRO = 22, COUNT = 3, AFTER = 6, BREAK = 14, PUSH_MS = 3000, TRIES = 3, STRIES = 2;
  var XM = 9, YM = 6, WX = 10.8, WY = 7.8, TMAX = 8, LEN = 2.2, HITR = 0.42, CLASHR = 0.3;
  var TEAMS = [['Nova Squadron', 'Comet Fleet'], ['Solar Flares', 'Ion Storm'], ['Red Giants', 'Blue Dwarfs'], ['Meteor Mob', 'Quasar Crew']];
  var TE = ['🔴', '🔵'], TC = ['#FF4D5E', '#3BD7FF'], TG = ['rgba(255,77,94,', 'rgba(59,215,255,'];
  var SUP = ['Two points', 'Easy table', 'Slope and intercept'], SUPE = ['🎯', '📋', '🧭'];

  function mix32(h) { h = h >>> 0; h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; }
  function rng(seed) { var s = mix32(seed) || 1; return function () { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return ((s >>> 8) & 0xffff) / 65536; }; }
  function hash(t) { var h = 5381; t = String(t); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h; }
  function sh3(sid) { return (hash(sid) % 46656).toString(36); }
  function shuffle(a, R) { a = a.slice(); R = R || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function clean(n) { return String(n || '').replace(/[~,#|.;]/g, '').slice(0, 12); }
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  function nm(n) { return n < 0 ? '−' + (-n) : String(n); }
  function pt(x, y) { return '(' + nm(x) + ', ' + nm(y) + ')'; }
  function clock(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function teamName(t, id) { return TEAMS[Math.round(id / 1000) % TEAMS.length][t ? 1 : 0]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* =========================== fractions and lines =========================== */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function fr(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q); return [p / g + 0, q / g]; }
  function fval(f) { return f[0] / f[1]; }
  function fstr(f) { return f[1] === 1 ? String(f[0]) : f[0] + '/' + f[1]; }
  function feq(a, b) { return !!a && !!b && a[0] === b[0] && a[1] === b[1]; }
  // what a student typed: 3, -2, 3/2, -1/4, 0.5 (minus signs of any kind)
  function parseF(s) {
    s = String(s == null ? '' : s).replace(/[−–]/g, '-').replace(/\s+/g, ''); var m;
    if ((m = s.match(/^(-?\d{1,4})\/(-?\d{1,4})$/))) return +m[2] ? fr(+m[1], +m[2]) : null;
    if ((m = s.match(/^(-?)(\d{0,4})\.(\d{1,3})$/))) { var d = Math.pow(10, m[3].length); return fr((m[1] ? -1 : 1) * ((+m[2] || 0) * d + +m[3]), d); }
    if (/^-?\d{1,4}$/.test(s)) return fr(+s, 1);
    return null;
  }
  function fhtml(f) { var a = Math.abs(f[0]), s = f[0] < 0 ? '−' : ''; return f[1] === 1 ? s + a : s + '<span class="dlfr"><i>' + a + '</i><i>' + f[1] + '</i></span>'; }
  function eqHTML(m, b) {
    var X = '<i class="dlx">x</i>', c = m[0] === 0 ? '' : m[1] === 1 && Math.abs(m[0]) === 1 ? (m[0] < 0 ? '−' : '') + X : fhtml(m) + X;
    var bb = b[0] === 0 ? '' : (c ? (b[0] < 0 ? ' − ' : ' + ') + fhtml([Math.abs(b[0]), b[1]]) : fhtml(b));
    return '<i class="dlx">y</i> = ' + (c || bb ? c + bb : '0');
  }
  function lineThrough(P, Q) { var m = fr(Q[1] - P[1], Q[0] - P[0]); return { m: m, b: fr(P[1] * m[1] - m[0] * P[0], m[1]) }; }

  /* =========================== the game in the live state =========================== */
  function decFire(v) {
    var bar = v.indexOf('|');
    return { r: parseInt(v, 10) || 0, b: (bar >= 0 ? v.slice(bar + 1) : '').split(',').map(function (x) {
      var p = x.split('~'), m = parseF(p[1]), b = parseF(p[2]), c = p[3] || '';
      return p[0] && m && b ? { fp: p[0], m: m, b: b, sp: clamp(+c.charAt(0) || 1, 1, 9), tr: clamp((+c.charAt(1) || 0) + 1, 1, 3), sh: c.charAt(2) === '1' } : null;
    }).filter(Boolean) };
  }
  function duelOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zds) || !Array.isArray(c.zdid)) return null;
    var z = c.zds, id = A.decRun(c.zdid), start = A.MODE === 'screen' ? id : A.decRun(c.zdst) || id;
    var o = { id: id, start: start, state: z[0], round: z[1] || 1, rounds: z[2] || 3, alen: z[3] || 120, at: start + (z[4] || 0) * 1000, intro: z[5] || INTRO, score: [z[6] || 0, z[7] || 0], n: z[8] || 0, lk: [z[9] || 0, z[10] || 0], flen: z[11] || 0, pr: -1, ros: [], fire: null, mvp: [], last: null };
    var sp = Lv.spot && Lv.spot.q === 'zduel' ? String(Lv.spot.text || '') : '';
    sp.split('#').forEach(function (part) {
      var k = part.slice(0, 2), v = part.slice(2), bar = v.indexOf('|');
      if (k === 'P:') {
        o.pr = parseInt(v, 10) || 0;
        (bar >= 0 ? v.slice(bar + 1) : '').split(',').forEach(function (x) { var p = x.split('~'); if (p.length >= 7 && p[0]) o.ros.push({ fp: p[0], t: +p[1] ? 1 : 0, x: +p[2] || 0, y: +p[3] || 0, tg: p[4] || '', s: clamp(+p[5] || 0, 0, 2), k: +p[6] || 0, n: p[7] || '?', look: p[8] || '' }); });
      }
      else if (k === 'F:') o.fire = decFire(v);
      else if (k === 'M:' && v) o.mvp = v.split(',').map(function (x) { var p = x.split('~'); return { n: p[0] || '?', look: p[1] || '', dmg: +p[2] || 0, hits: +p[3] || 0, zaps: +p[4] || 0, t: +p[5] ? 1 : 0 }; });
      else if (k === 'L:') { var q = (bar >= 0 ? v.slice(0, bar) : v).split('.').map(Number), tp = (bar >= 0 ? v.slice(bar + 1) : '').split('~'); o.last = { r: q[0] || 0, pts: [q[1] || 0, q[2] || 0], hits: [q[3] || 0, q[4] || 0], zaps: [q[5] || 0, q[6] || 0], sh: [q[7] || 0, q[8] || 0], top: tp[0] ? { n: tp[0], v: tp[1] || '?', d: +tp[2] || 0 } : null }; }
    });
    return o;
  }

  /* =========================== the volley: the same simulation on every screen =========================== */
  function boltOf(r, f) {
    var m = fval(f.m), b = fval(f.b), dir = r.t ? -1 : 1, L = Math.sqrt(1 + m * m);
    return { fp: f.fp, t: r.t, sx: r.x, sy: r.y, ox: r.x, oy: m * r.x + b, ux: dir / L, uy: dir * m / L, v: 3.5 + f.sp * 0.85, pw0: power(f.sp, f.tr), pws: [], alive: true, end: TMAX, how: 'out', hit: '', by: '', dmg: 0, won: 0 };
  }
  function power(sp, tr) { return Math.round((45 + sp * 6.1) * [1, 0.8, 0.6][clamp(tr, 1, 3) - 1]); }
  function speedOf(t, alen) { return clamp(1 + Math.round(8 * Math.max(0, 1 - (t || 0) / Math.max(10, alen))), 1, 9); }
  function pwAt(b, t) { var p = b.pw0; b.pws.forEach(function (x) { if (t >= x[0]) p = x[1]; }); return p; }
  function posAt(b, t) { var d = b.v * t; return [b.ox + b.ux * d, b.oy + b.uy * d]; }
  function offMap(p) { return Math.abs(p[0]) > WX + 0.7 || Math.abs(p[1]) > WY + 0.7; }
  function sim(ros, fire) {
    var R = {}, shields = {}, bolts = [], units = [], ev = [];
    ros.forEach(function (r) { R[r.fp] = r; });
    fire.b.forEach(function (f) { if (f.sh) shields[f.fp] = 1; });
    ros.forEach(function (r) { units.push({ fp: r.fp, t: r.t, x: r.x, y: r.y, sh: !!shields[r.fp], used: 0 }); });
    fire.b.forEach(function (f) { if (R[f.fp]) bolts.push(boltOf(R[f.fp], f)); });
    bolts.forEach(function (b) { b.pw = b.pw0; if (offMap([b.ox, b.oy])) { b.alive = false; b.end = 0; b.how = 'wild'; } });
    var dt = 1 / 120, n = Math.ceil(TMAX / dt);
    for (var k = 0; k < n; k++) {
      var t0 = k * dt, t1 = t0 + dt, live = bolts.filter(function (b) { return b.alive; });
      if (!live.length) break;
      // two lasers meet: the stronger one carries on, weaker by the other's power; about the same, both go out
      for (var i = 0; i < live.length; i++) for (var j = i + 1; j < live.length; j++) {
        var a = live[i], c = live[j]; if (!a.alive || !c.alive || a.t === c.t) continue;
        var a0 = posAt(a, t0), a1 = posAt(a, t1), c0 = posAt(c, t0), c1 = posAt(c, t1), rx = a0[0] - c0[0], ry = a0[1] - c0[1], dx = (a1[0] - a0[0]) - (c1[0] - c0[0]), dy = (a1[1] - a0[1]) - (c1[1] - c0[1]), dd = dx * dx + dy * dy;
        var s = dd > 0 ? clamp(-(rx * dx + ry * dy) / dd, 0, 1) : 0, ex = rx + dx * s, ey = ry + dy * s;
        if (ex * ex + ey * ey >= CLASHR * CLASHR) continue;
        var tc = t0 + s * dt, pa = posAt(a, tc), pc = posAt(c, tc), X = (pa[0] + pc[0]) / 2, Y = (pa[1] + pc[1]) / 2, d = a.pw - c.pw;
        if (Math.abs(d) < 10) { a.alive = c.alive = false; a.end = c.end = tc; a.how = c.how = 'cancel'; a.by = c.fp; c.by = a.fp; ev.push({ t: tc, x: X, y: Y, k: 'cancel', a: a.fp, b: c.fp }); }
        else { var w = d > 0 ? a : c, l = d > 0 ? c : a; l.alive = false; l.end = tc; l.how = 'zapped'; l.by = w.fp; w.pw = Math.abs(d); w.pws.push([tc, w.pw]); w.won++; ev.push({ t: tc, x: X, y: Y, k: 'clash', a: w.fp, b: l.fp }); }
      }
      // a laser reaches an enemy: a hit, or their shield takes it
      live.forEach(function (b) {
        if (!b.alive) return;
        var p0 = posAt(b, t0), p1 = posAt(b, t1), sx = p1[0] - p0[0], sy = p1[1] - p0[1], L2 = sx * sx + sy * sy, best = null, bs = 2;
        units.forEach(function (u) {
          if (u.t === b.t) return;
          var s2 = L2 ? clamp(((u.x - p0[0]) * sx + (u.y - p0[1]) * sy) / L2, 0, 1) : 0, qx = p0[0] + sx * s2 - u.x, qy = p0[1] + sy * s2 - u.y;
          if (qx * qx + qy * qy < HITR * HITR && s2 < bs) { bs = s2; best = u; }
        });
        if (best) {
          var th = t0 + bs * dt; b.alive = false; b.end = th; b.hit = best.fp;
          if (best.sh && !best.used) { best.used = th || 0.001; b.how = 'shield'; ev.push({ t: th, x: best.x, y: best.y, k: 'shield', a: b.fp, b: best.fp }); }
          else { b.how = 'hit'; b.dmg = b.pw; ev.push({ t: th, x: best.x, y: best.y, k: 'hit', a: b.fp, b: best.fp, d: b.pw }); }
        }
        else if (offMap(p1)) { b.alive = false; b.end = t1; b.how = 'out'; }
      });
    }
    var len = 0; bolts.forEach(function (b) { b.alive = false; len = Math.max(len, b.end); });
    return { bolts: bolts, units: units, ev: ev, len: len, B: bolts.reduce(function (o, b) { o[b.fp] = b; return o; }, {}) };
  }
  // the round's points: a hit scores its power, a shield block 20, knocking out an enemy laser 15 (10 each for a cancel)
  function scoreOf(res) {
    var pts = [0, 0], per = {}, hits = [0, 0], zaps = [0, 0], sh = [0, 0], T = {};
    res.units.forEach(function (u) { T[u.fp] = u.t; });
    function P(fp) { return per[fp] || (per[fp] = { dmg: 0, hits: 0, taken: 0, zaps: 0, blocks: 0 }); }
    res.ev.forEach(function (e) {
      var ta = T[e.a], tb = T[e.b];
      if (e.k === 'hit') { pts[ta] += e.d; hits[ta]++; P(e.a).dmg += e.d; P(e.a).hits++; P(e.b).taken++; }
      else if (e.k === 'shield') { pts[tb] += 20; sh[tb]++; P(e.b).blocks++; }
      else if (e.k === 'clash') { pts[ta] += 15; zaps[ta]++; P(e.a).zaps++; }
      else if (e.k === 'cancel') { pts[ta] += 10; pts[tb] += 10; zaps[ta]++; zaps[tb]++; P(e.a).zaps++; P(e.b).zaps++; }
    });
    return { pts: pts, per: per, hits: hits, zaps: zaps, sh: sh };
  }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null;
  function key() { return 'duel.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function xp(n, once) { if (A.hero && V) A.hero.add('d', String(Math.round(V.id / 1000)) + (once ? 'e' : ''), n, once); }
  function screenish() { return A.MODE !== 'student'; }
  function myFp() { return A.MODE === 'student' && A.S.me ? sh3(A.S.me.sid) : ''; }
  function me() { return V && V.ros[myFp()]; }

  function sync() {
    var Lv = A.live(), o = A.isLive() || A.MODE === 'screen' ? duelOf(Lv) : null;
    if (o && A.MODE !== 'teach' && stale(o)) o = null;
    if (A.MODE === 'student' && A.saving() && !A.S.me) o = null;
    if (!o) { if (root && !(V && V.watch)) close(); return; }
    if (V && V.watch) return;
    if (!root || V.id !== o.id) open(o);
    apply(o);
  }
  function stale(o) { var age = sNow() - o.at; return o.state === 2 ? age > 6 * 60000 : age > (Math.max(o.alen, o.intro, 60) + 300) * 1000; }
  function freshST(id) { return { id: id, r: 0, lm: '', lb: '', act: 'm', tr: 0, lk: 0, t: 0, sm: '', sb: '', sact: 'm', str: 0, sh: 0, msg: '', good: false, tot: { right: 0, first: 0, hits: 0, dmg: 0, zaps: 0, blocks: 0, p: 0, hl: '' }, seen: {}, mr: 0, w: 0 }; }
  function open(o) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === o.id ? saved : freshST(o.id);
    V = { id: o.id, o: o, ros: {}, rr: -1, sig: '', fields: [], anim: null, sndT: -99 };
    var rs = SFA.store.get('duel.ros.' + A.LID, null); if (rs && rs.id === o.id) { V.ros = rs.ros || {}; V.rr = rs.rr; }
    root = H('div', 'dl' + (screenish() ? ' screen' : '')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Laser Lines');
    document.body.appendChild(root); document.body.classList.add('boarding'); document.body.classList.add('clashing');
    V.tick = setInterval(function () { if (root) { drawTop(); tickView(); } }, 250);
    V.key = function (e) { onKey(e); }; document.addEventListener('keydown', V.key);
    V.raf = requestAnimationFrame(loop);
    if (A.MODE === 'student' && !(saved && saved.id === o.id)) send();   // so the console sees a late arrival and gives them a spot
  }
  function close() {
    if (!root) return;
    clearInterval(V.tick); cancelAnimationFrame(V.raf); document.removeEventListener('keydown', V.key);
    root.remove(); root = null; V = null; document.body.classList.remove('boarding'); document.body.classList.remove('clashing');
  }
  // who stands where: the roster arrives a page at a time, so every page keeps what it has seen (a new round starts over)
  function mergeRoster(o) {
    if (o.pr < 0 || !o.ros.length) return false;
    var ch = false;
    if (o.pr !== V.rr) { V.ros = {}; V.rr = o.pr; ch = true; }
    o.ros.forEach(function (r) { var x = V.ros[r.fp]; if (!x || x.t !== r.t || x.x !== r.x || x.y !== r.y || x.tg !== r.tg || x.s !== r.s || x.k !== r.k || x.look !== r.look || x.n !== r.n) { V.ros[r.fp] = r; ch = true; } });
    if (ch) SFA.store.set('duel.ros.' + A.LID, { id: V.id, rr: V.rr, ros: V.ros });
    return ch;
  }
  function rosList() { return Object.keys(V.ros).map(function (k) { return V.ros[k]; }); }
  function apply(o) {
    var prev = V.o; V.o = o;
    var rch = mergeRoster(o);
    // the volley: worked out once a round, from the same numbers every screen has
    if (o.state === 5 && o.fire && o.fire.r === o.round && V.rr === o.round && (!V.anim || V.anim.r !== o.round)) {
      var snap = {}; rosList().forEach(function (r) { snap[r.fp] = r; });
      V.anim = { r: o.round, res: sim(rosList(), o.fire), R: snap, fire: o.fire }; V.sndT = -99;
    }
    if (A.MODE === 'student' && o.state === 1 && ST.r !== o.round) { var keepTot = ST.tot, seen = ST.seen, mr = ST.mr; ST = freshST(o.id); ST.tot = keepTot; ST.seen = seen; ST.mr = mr; ST.r = o.round; keep(); }
    var m = me(), sig = [o.state, o.round, V.rr, V.anim ? V.anim.r : 0, A.MODE === 'student' ? [m ? m.t + '.' + m.x + '.' + m.y + '.' + m.tg + '.' + m.s : '', m && V.ros[m.tg] ? 1 : 0].join(',') : Object.keys(V.ros).length + (o.state === 3 || o.state === 1 ? '' : ':' + rosList().map(function (r) { return r.look; }).join('')), o.mvp.length, o.last ? o.last.r : 0].join('|');
    if (sig !== V.sig || (rch && screenish() && (o.state === 3 || o.state === 2 || o.state === 4))) { V.sig = sig; draw(); }
    else upd();
    if (prev && prev.state !== o.state && o.state === 1) snd('beep');
  }

  /* ---------- drawing ---------- */
  function draw() {
    var o = V.o; if (!root) return;
    root.innerHTML = ''; V.fields = []; V.work = null; V.res = null; V.strip = null;
    root.appendChild(topBar());
    if (screenish()) { if (o.state === 3) scrIntro(); else if (o.state === 1) scrAim(); else if (o.state === 5) scrFire(); else if (o.state === 4) scrBreak(); else scrEnd(); }
    else if (!me()) root.appendChild(H('div', 'dlcard', '<h2>🛰️ Finding your spot in the fleet…</h2><p>The command ship is giving you a place on the grid. This takes a few seconds.</p>'));
    else if (o.state === 3) stIntro();
    else if (o.state === 1) stAim();
    else if (o.state === 5) stFire();
    else if (o.state === 4) stBreak();
    else stEnd();
    if (V.watch) { var x = el('button', { type: 'button', 'class': 'btn dlback', text: '✕ Back to the console' }); x.onclick = function () { close(); }; root.querySelector('.dlright').appendChild(x); }
    drawTop();
  }
  function upd() { if (V.strip) V.strip.innerHTML = lockStrip(); }
  function topBar() {
    var t = H('div', 'dltop'), m = A.MODE === 'student' ? me() : null;
    t.innerHTML = '<div class="dllogo">🚀 <b>LASER LINES</b>' + (m ? ' <span class="dlteam" style="--c:' + TC[m.t] + '">' + TE[m.t] + ' ' + esc(teamName(m.t, V.id)) + '</span>' : '') + '</div>' +
      '<div class="dlmid"><span class="dlrd"></span><span class="dlclock"></span><span class="dlsub"></span></div><div class="dlright"><span class="dlsc"></span></div>';
    var sb = el('button', { type: 'button', 'class': 'dlsnd', title: 'Sound on or off' }); sb.textContent = soundOn() ? '🔊' : '🔇';
    sb.onclick = function () { SFA.store.set('duel.sound', !soundOn()); sb.textContent = soundOn() ? '🔊' : '🔇'; };
    t.querySelector('.dlright').appendChild(sb);
    return t;
  }
  function drawTop() {
    if (!root) return; var o = V.o, e = (sNow() - o.at) / 1000, q = function (s) { return root.querySelector(s); };
    var rd = q('.dlrd'), ck = q('.dlclock'), sub = q('.dlsub'), sc = q('.dlsc'); if (!rd) return;
    rd.textContent = o.state === 2 ? 'FINAL' : o.state === 4 ? 'NEXT: ROUND ' + o.round + ' OF ' + o.rounds : 'ROUND ' + o.round + ' OF ' + o.rounds;
    ck.textContent = o.state === 3 ? clock(o.intro - e) : o.state === 1 ? clock(o.alen - e) : o.state === 5 ? (e < COUNT ? String(Math.max(1, Math.ceil(COUNT - e))) : 'FIRE!') : o.state === 4 ? clock(BREAK - e) : '🏆';
    sub.textContent = o.state === 3 ? 'missions arrive in' : o.state === 1 ? 'until the lasers fire' : o.state === 5 ? 'all lasers at once' : o.state === 4 ? 'new positions, new targets' : 'battle over';
    sc.innerHTML = '<b style="color:' + TC[0] + '">' + TE[0] + ' ' + o.score[0] + '</b><i>vs</i><b style="color:' + TC[1] + '">' + o.score[1] + ' ' + TE[1] + '</b>';
  }
  function lockStrip() {
    var o = V.o, n = [0, 0]; rosList().forEach(function (r) { n[r.t]++; });
    return [0, 1].map(function (t) { return '<span style="--c:' + TC[t] + '">' + TE[t] + ' ' + esc(teamName(t, V.id)) + ': <b>' + o.lk[t] + '</b> of ' + n[t] + ' locked in</span>'; }).join('');
  }
  function tickView() {
    if (A.MODE === 'student' && V.res && V.anim) V.res.innerHTML = myResult(true);
    if (screenish() && V.feed && V.anim) V.feed.innerHTML = feedHTML();
  }

  /* ---------- the battlefield: one canvas, drawn every frame ---------- */
  var IMG = {};
  function imgOf(look) {
    var k = look || '-'; if (IMG[k]) return IMG[k];
    var im = new Image(); if (AV) im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(AV.svg(look || '', { size: 120 }));
    IMG[k] = im; return im;
  }
  function field(box, opt) {
    var wrap = H('div', 'dlfield' + (opt && opt.small ? ' small' : '')), cv = document.createElement('canvas');
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'The battle grid'); wrap.appendChild(cv); box.appendChild(wrap);
    var F = { cv: cv, opt: opt || {}, w: 0, h: 0, s: 1, dpr: 1, bg: null }; V.fields.push(F); return F;
  }
  function fsize(F) {
    var w = F.cv.clientWidth; if (!w) return false;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    if (w !== F.w || dpr !== F.dpr) { F.w = w; F.h = Math.round(w * WY / WX); F.dpr = dpr; F.cv.width = Math.round(w * dpr); F.cv.height = Math.round(F.h * dpr); F.s = w / (2 * WX); F.bg = background(F); }
    return true;
  }
  function PX(F, x) { return (x + WX) * F.s; }
  function PY(F, y) { return (WY - y) * F.s; }
  var STARS = (function () { var R = rng(4242), out = []; for (var i = 0; i < 230; i++) out.push([R() * 2 - 1, R() * 2 - 1, 0.3 + R() * R() * 1.6, 0.25 + R() * 0.75, R() * 6.28]); return out; })();
  function background(F) {
    var c2 = document.createElement('canvas'); c2.width = F.cv.width; c2.height = F.cv.height;
    var c = c2.getContext('2d'), s = F.s, w = F.w, h = F.h; c.scale(F.dpr, F.dpr);
    var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#05051a'); g.addColorStop(1, '#0c0620'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter';
    [[0.18, 0.3, 0.42, 'rgba(120,60,220,.20)'], [0.82, 0.72, 0.38, 'rgba(30,160,200,.16)'], [0.55, 0.12, 0.3, 'rgba(220,60,140,.12)'], [0.3, 0.85, 0.32, 'rgba(60,90,230,.14)']].forEach(function (n) {
      var rg = c.createRadialGradient(n[0] * w, n[1] * h, 0, n[0] * w, n[1] * h, n[2] * w); rg.addColorStop(0, n[3]); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(0, 0, w, h);
    });
    c.globalCompositeOperation = 'source-over';
    STARS.forEach(function (st) { c.globalAlpha = st[3] * 0.8; c.fillStyle = '#fff'; c.beginPath(); c.arc((st[0] + 1) / 2 * w, (st[1] + 1) / 2 * h, st[2] * Math.max(0.6, s / 40), 0, 6.283); c.fill(); });
    c.globalAlpha = 1;
    // a ringed planet and its moon, far off behind the grid
    var px = PX(F, 8.1), py = PY(F, 6.1), pr = 1.5 * s;
    c.globalAlpha = 0.5;
    var pg = c.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr); pg.addColorStop(0, '#FFB46B'); pg.addColorStop(0.6, '#B8573A'); pg.addColorStop(1, '#3a1420');
    c.fillStyle = pg; c.beginPath(); c.arc(px, py, pr, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(255,220,170,.8)'; c.lineWidth = Math.max(1, s * 0.07); c.beginPath(); c.ellipse(px, py, pr * 1.75, pr * 0.42, -0.35, 0, 6.283); c.stroke();
    c.fillStyle = '#cfd8ea'; c.beginPath(); c.arc(PX(F, -8.6), PY(F, -6.3), s * 0.45, 0, 6.283); c.fill();
    c.globalAlpha = 1;
    // each fleet's half
    c.fillStyle = TG[0] + '0.06)'; c.fillRect(0, 0, w / 2, h); c.fillStyle = TG[1] + '0.06)'; c.fillRect(w / 2, 0, w / 2, h);
    // the grid
    c.lineWidth = 1; c.strokeStyle = 'rgba(130,200,255,.11)';
    for (var x = -10; x <= 10; x++) { c.beginPath(); c.moveTo(PX(F, x), PY(F, 7.5)); c.lineTo(PX(F, x), PY(F, -7.5)); c.stroke(); }
    for (var y = -7; y <= 7; y++) { c.beginPath(); c.moveTo(PX(F, -10.5), PY(F, y)); c.lineTo(PX(F, 10.5), PY(F, y)); c.stroke(); }
    c.strokeStyle = 'rgba(160,225,255,.55)'; c.lineWidth = Math.max(1.5, s * 0.05);
    c.beginPath(); c.moveTo(PX(F, -10.5), PY(F, 0)); c.lineTo(PX(F, 10.5), PY(F, 0)); c.moveTo(PX(F, 0), PY(F, 7.5)); c.lineTo(PX(F, 0), PY(F, -7.5)); c.stroke();
    var fs = Math.max(9, s * 0.3); c.font = '600 ' + fs + 'px system-ui,sans-serif'; c.fillStyle = 'rgba(170,225,255,.7)'; c.textAlign = 'center'; c.textBaseline = 'top';
    for (x = -10; x <= 10; x += 2) if (x) c.fillText(nm(x), PX(F, x), PY(F, 0) + 3);
    c.textAlign = 'right'; c.textBaseline = 'middle';
    for (y = -6; y <= 6; y += 2) if (y) c.fillText(nm(y), PX(F, 0) - 4, PY(F, y));
    c.font = 'italic 700 ' + fs * 1.3 + 'px Georgia,serif'; c.fillStyle = 'rgba(190,235,255,.85)'; c.textAlign = 'left'; c.fillText('x', PX(F, 10.25), PY(F, 0) - fs); c.fillText('y', PX(F, 0) + 6, PY(F, 7.35));
    return c2;
  }
  function loop() {
    if (!root || !V) return;
    V.fields = V.fields.filter(function (F) { return F.cv.isConnected; });
    try { V.fields.forEach(frame); sounds(); } catch (e) { console.warn(e); }
    V.raf = requestAnimationFrame(loop);
  }
  function animT() { return V.anim && V.o.state === 5 ? (sNow() - V.o.at) / 1000 - COUNT : -99; }
  function frame(F) {
    if (!fsize(F)) return;
    var c = F.cv.getContext('2d'), s = F.s, o = V.o, T = performance.now() / 1000, opt = F.opt, mine = myFp();
    c.setTransform(F.dpr, 0, 0, F.dpr, 0, 0); c.clearRect(0, 0, F.w, F.h); c.drawImage(F.bg, 0, 0, F.w, F.h);
    // a few stars twinkle
    for (var i = 0; i < STARS.length; i += 9) { var st = STARS[i], a = 0.5 + 0.5 * Math.sin(T * 2 + st[4]); c.globalAlpha = a * 0.9; c.fillStyle = '#fff'; c.beginPath(); c.arc((st[0] + 1) / 2 * F.w, (st[1] + 1) / 2 * F.h, st[2] * 1.2 * Math.max(0.6, s / 40), 0, 6.283); c.fill(); }
    c.globalAlpha = 1;
    var An = V.anim && o.state === 5 ? V.anim : null, ta = An ? animT() : -99, res = An ? An.res : null;
    var units = An ? Object.keys(An.R).map(function (k) { return An.R[k]; }) : rosList();
    units.sort(function (a, b) { return b.y - a.y; });
    // the paths the lasers took (the lines!), under everything
    if (res && ta >= 0) res.bolts.forEach(function (b) {
      var tt = Math.min(ta, b.end); if (tt <= 0) return;
      var p = posAt(b, tt); c.strokeStyle = TC[b.t]; c.globalAlpha = b.fp === mine || b.fp === opt.hl ? 0.55 : 0.2; c.lineWidth = Math.max(1, s * 0.035);
      c.beginPath(); c.moveTo(PX(F, b.ox), PY(F, b.oy)); c.lineTo(PX(F, p[0]), PY(F, p[1])); c.stroke(); c.globalAlpha = 1;
    });
    // a line that doesn't go through its own avatar: the laser jumps to where the line actually is
    if (res && ta >= -COUNT) res.bolts.forEach(function (b) {
      if (Math.abs(b.oy - b.sy) < 0.01) return;
      c.save(); c.setLineDash([s * 0.12, s * 0.12]); c.strokeStyle = TC[b.t]; c.globalAlpha = 0.6; c.lineWidth = Math.max(1, s * 0.04);
      c.beginPath(); c.moveTo(PX(F, b.sx), PY(F, b.sy)); c.lineTo(PX(F, b.ox), PY(F, clamp(b.oy, -WY, WY))); c.stroke(); c.restore();
    });
    var evs = res ? res.ev : [];
    units.forEach(function (u) {
      var X = PX(F, u.x), Y = PY(F, u.y), sx = 0, hitE = null, shE = null;
      evs.forEach(function (e) { if (e.b === u.fp && (e.k === 'hit' || e.k === 'shield') && ta >= e.t && ta < e.t + 1.2) { if (e.k === 'hit') hitE = e; else shE = e; } });
      if (hitE && ta < hitE.t + 0.45) sx = Math.sin((ta - hitE.t) * 60) * s * 0.12;
      X += sx;
      // the hover pad: glows when locked in, or while the laser charges
      var charging = res && res.B[u.fp] && ta < 0, pulse = u.k && o.state === 1 ? 0.5 + 0.5 * Math.sin(T * 5) : charging ? (ta + COUNT) / COUNT : 0;
      var pg = c.createRadialGradient(X, Y + s * 0.55, 0, X, Y + s * 0.55, s * (0.7 + pulse * 0.25)); pg.addColorStop(0, TG[u.t] + (0.55 + pulse * 0.4) + ')'); pg.addColorStop(1, TG[u.t] + '0)');
      c.fillStyle = pg; c.beginPath(); c.ellipse(X, Y + s * 0.55, s * (0.75 + pulse * 0.2), s * 0.24, 0, 0, 6.283); c.fill();
      c.strokeStyle = TC[u.t]; c.lineWidth = Math.max(1, s * 0.05); c.beginPath(); c.ellipse(X, Y + s * 0.55, s * 0.5, s * 0.14, 0, 0, 6.283); c.stroke();
      // the shield bubble
      var shOn = res && res.units.some(function (q) { return q.fp === u.fp && q.sh && (!q.used || ta < q.used); });
      if (shOn && ta >= -COUNT) { c.strokeStyle = 'rgba(140,240,255,' + (0.45 + 0.2 * Math.sin(T * 6)) + ')'; c.fillStyle = 'rgba(140,240,255,.08)'; c.lineWidth = Math.max(1, s * 0.05); c.beginPath(); c.arc(X, Y, s * 0.78, 0, 6.283); c.fill(); c.stroke(); }
      if (shE) { var k2 = (ta - shE.t) / 1.2; c.strokeStyle = 'rgba(160,250,255,' + (1 - k2) + ')'; c.lineWidth = s * 0.12 * (1 - k2) + 1; c.beginPath(); c.arc(X, Y, s * (0.78 + k2 * 0.6), 0, 6.283); c.stroke(); }
      var im = imgOf(u.look), ah = s * 1.3, aw = ah * 160 / 184;
      if (im.complete && im.naturalWidth) c.drawImage(im, X - aw / 2, Y - ah * 0.6, aw, ah);
      else { c.fillStyle = TC[u.t]; c.beginPath(); c.arc(X, Y, s * 0.4, 0, 6.283); c.fill(); }
      if (hitE && ta < hitE.t + 0.3) { c.globalCompositeOperation = 'lighter'; var hg = c.createRadialGradient(X, Y, 0, X, Y, s * 0.9); hg.addColorStop(0, 'rgba(255,255,255,.95)'); hg.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = hg; c.beginPath(); c.arc(X, Y, s * 0.9, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
      if (hitE) { var k3 = (ta - hitE.t) / 1.2; c.globalAlpha = 1 - k3; c.font = '900 ' + s * 0.55 + 'px Impact,system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = s * 0.08; c.strokeStyle = '#000'; c.strokeText('−' + hitE.d, X, Y - s * (0.9 + k3 * 0.8)); c.fillStyle = '#FFE14D'; c.fillText('−' + hitE.d, X, Y - s * (0.9 + k3 * 0.8)); c.globalAlpha = 1; }
      if (shE && ta < shE.t + 1) { c.font = '900 ' + s * 0.36 + 'px Impact,system-ui'; c.textAlign = 'center'; c.fillStyle = '#9CF6FF'; c.fillText('BLOCKED', X, Y - s * 1.05); }
      // you, your target, who's locked in
      if (u.fp === mine && mine) { c.save(); c.setLineDash([s * 0.15, s * 0.1]); c.lineDashOffset = -T * s; c.strokeStyle = '#FFE14D'; c.lineWidth = Math.max(1.5, s * 0.06); c.beginPath(); c.arc(X, Y, s * 0.72, 0, 6.283); c.stroke(); c.restore(); }
      if (opt.tg && u.fp === opt.tg && o.state !== 5) {
        var r0 = s * 0.75; c.save(); c.translate(X, Y); c.rotate(T * 1.2); c.strokeStyle = '#FF5B5B'; c.lineWidth = Math.max(1.5, s * 0.06);
        c.beginPath(); c.arc(0, 0, r0, 0, 6.283); c.stroke();
        for (var q = 0; q < 4; q++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(r0 * 0.55, 0); c.lineTo(r0 * 1.3, 0); c.stroke(); }
        c.restore();
      }
      if (opt.names) { var fz = Math.max(8, s * 0.3); c.font = '700 ' + fz + 'px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = u.fp === mine ? '#FFE14D' : TC[u.t]; c.fillText(u.fp === mine ? 'YOU' : u.n, X, Y + s * 0.72); }
      else if (u.fp === mine && mine) { c.font = '900 ' + Math.max(9, s * 0.32) + 'px system-ui'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#FFE14D'; c.fillText('YOU', X, Y + s * 0.72); }
      if (o.state === 1 && u.k && opt.names) { c.font = Math.max(9, s * 0.34) + 'px system-ui'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('🔒', X + s * 0.5, Y - s * 0.45); }
    });
    if (!res) return;
    // charging, then the lasers themselves
    if (ta < 0) res.bolts.forEach(function (b) { var k = (ta + COUNT) / COUNT; if (k < 0) return; var X = PX(F, b.sx), Y = PY(F, b.sy), gg = c.createRadialGradient(X, Y, 0, X, Y, s * 0.5 * k); gg.addColorStop(0, 'rgba(255,255,255,' + k + ')'); gg.addColorStop(1, TG[b.t] + '0)'); c.fillStyle = gg; c.beginPath(); c.arc(X, Y, s * 0.5 * k, 0, 6.283); c.fill(); });
    res.bolts.forEach(function (b) {
      if (ta < 0 || ta > b.end || b.how === 'wild') return;
      var d = b.v * ta, hx = b.ox + b.ux * d, hy = b.oy + b.uy * d, td = Math.max(0, d - LEN), tx = b.ox + b.ux * td, ty = b.oy + b.uy * td, pw = pwAt(b, ta);
      c.save(); c.lineCap = 'round'; c.shadowColor = TC[b.t]; c.shadowBlur = s * 0.45; c.strokeStyle = TC[b.t]; c.lineWidth = s * (0.07 + 0.13 * pw / 100);
      c.beginPath(); c.moveTo(PX(F, tx), PY(F, ty)); c.lineTo(PX(F, hx), PY(F, hy)); c.stroke();
      c.shadowBlur = 0; c.strokeStyle = '#fff'; c.lineWidth = s * (0.025 + 0.04 * pw / 100); c.stroke(); c.restore();
      if (ta < 0.2) { c.fillStyle = 'rgba(255,255,255,' + (1 - ta * 5) + ')'; c.beginPath(); c.arc(PX(F, b.ox), PY(F, b.oy), s * 0.35, 0, 6.283); c.fill(); }
    });
    // clashes: a burst where two lasers met
    evs.forEach(function (e, n) {
      if ((e.k !== 'clash' && e.k !== 'cancel') || ta < e.t || ta > e.t + 1) return;
      var k = ta - e.t, X = PX(F, e.x), Y = PY(F, e.y), R = rng(n * 977 + 13);
      c.globalCompositeOperation = 'lighter';
      var eg = c.createRadialGradient(X, Y, 0, X, Y, s * (0.3 + k * 1.6)); eg.addColorStop(0, 'rgba(255,255,230,' + (1 - k) + ')'); eg.addColorStop(0.5, 'rgba(255,170,60,' + (0.7 * (1 - k)) + ')'); eg.addColorStop(1, 'rgba(255,80,40,0)');
      c.fillStyle = eg; c.beginPath(); c.arc(X, Y, s * (0.3 + k * 1.6), 0, 6.283); c.fill();
      c.strokeStyle = 'rgba(255,240,200,' + (1 - k) + ')'; c.lineWidth = Math.max(1, s * 0.05);
      for (var q = 0; q < 12; q++) { var an = R() * 6.283, r1 = s * (0.2 + k * 1.2 * (0.6 + R())), r2 = r1 + s * 0.3; c.beginPath(); c.moveTo(X + Math.cos(an) * r1, Y + Math.sin(an) * r1); c.lineTo(X + Math.cos(an) * r2, Y + Math.sin(an) * r2); c.stroke(); }
      c.globalCompositeOperation = 'source-over';
      if (k < 0.8) { c.font = '900 ' + s * 0.5 + 'px Impact,system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = s * 0.07; c.strokeStyle = '#000'; var w = e.k === 'cancel' ? 'CANCEL!' : 'CLASH!'; c.strokeText(w, X, Y - s * 0.8); c.fillStyle = '#FFE14D'; c.fillText(w, X, Y - s * 0.8); }
    });
    // the countdown
    if (ta < 0.7) { var big = ta < 0 ? String(Math.ceil(-ta)) : 'FIRE!'; c.font = '900 ' + s * (ta < 0 ? 3 : 2.4) + 'px Impact,system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = ta < 0 ? 0.35 + 0.6 * (1 - (Math.ceil(-ta) + ta)) : 1 - ta / 0.7; c.lineWidth = s * 0.12; c.strokeStyle = '#000'; c.strokeText(big, F.w / 2, F.h / 2); c.fillStyle = ta < 0 ? '#fff' : '#FFE14D'; c.fillText(big, F.w / 2, F.h / 2); c.globalAlpha = 1; }
  }
  // sounds follow the volley (once per page, from the first canvas)
  function sounds() {
    if (!V.anim || V.o.state !== 5) return;
    var ta = animT(), p = V.sndT; if (ta <= p) return;
    if (p < -COUNT) p = Math.max(p, ta - 0.3);   // arriving late: no burst of old sounds
    [-3, -2, -1].forEach(function (b) { if (p < b && ta >= b) snd('beep'); });
    if (p < 0 && ta >= 0) snd('pew');
    V.anim.res.ev.forEach(function (e) { if (p < e.t && ta >= e.t) snd(e.k === 'hit' ? 'hit' : e.k === 'shield' ? 'shield' : 'boom'); });
    V.sndT = ta;
  }

  /* ---------- what happened to a laser, in words ---------- */
  function nameOf(fp) { var r = V.ros[fp] || (V.anim && V.anim.R[fp]); return r ? r.n : '?'; }
  function boltWords(b, you) {
    var who = you ? 'Your laser' : esc(nameOf(b.fp)) + '\'s laser';
    if (b.how === 'hit') return '💥 ' + who + ' hit <b>' + esc(nameOf(b.hit)) + '</b> for <b>' + b.dmg + '</b>!' + (b.won ? ' (It knocked out ' + b.won + ' laser' + (b.won > 1 ? 's' : '') + ' on the way.)' : '');
    if (b.how === 'shield') return '🛡️ ' + who + ' hit <b>' + esc(nameOf(b.hit)) + '</b>, but their shield blocked it.';
    if (b.how === 'zapped') return '⚡ ' + who + ' was knocked out by <b>' + esc(nameOf(b.by)) + '</b>\'s stronger laser.';
    if (b.how === 'cancel') return '✨ ' + who + ' and <b>' + esc(nameOf(b.by)) + '</b>\'s cancelled each other out.';
    if (b.how === 'wild') return '🌀 ' + who + '\'s line doesn\'t even come onto the grid near ' + (you ? 'you' : 'them') + '.';
    return '🌌 ' + who + ' flew off into space' + (b.won ? ' (after knocking out ' + b.won + ' laser' + (b.won > 1 ? 's' : '') + ')' : '') + '.';
  }
  function myResult(live) {
    var A2 = V.anim, mf = myFp(); if (!A2) return '';
    var b = A2.res.B[mf], ta = live ? animT() : 99, out = [];
    if (!b) out.push('😶 No laser this round: you didn\'t lock in a line.');
    else if (ta < b.end) out.push('🚀 Your laser is flying…');
    else out.push(boltWords(b, true));
    A2.res.ev.forEach(function (e) { if (e.b === mf && ta >= e.t) { if (e.k === 'hit') out.push('😵 ' + esc(nameOf(e.a)) + ' hit you for ' + e.d + '.'); if (e.k === 'shield') out.push('🛡️ Your shield blocked ' + esc(nameOf(e.a)) + '\'s laser!'); } });
    return out.map(function (x) { return '<p>' + x + '</p>'; }).join('');
  }
  function feedHTML() {
    var ta = animT(), ev = V.anim.res.ev.filter(function (e) { return ta >= e.t; }).slice(-4).reverse();
    return ev.map(function (e) {
      if (e.k === 'hit') return '<p>💥 <b>' + esc(nameOf(e.a)) + '</b> hit <b>' + esc(nameOf(e.b)) + '</b> for ' + e.d + '</p>';
      if (e.k === 'shield') return '<p>🛡️ <b>' + esc(nameOf(e.b)) + '</b>\'s shield blocked <b>' + esc(nameOf(e.a)) + '</b></p>';
      if (e.k === 'clash') return '<p>⚡ <b>' + esc(nameOf(e.a)) + '</b>\'s laser beat <b>' + esc(nameOf(e.b)) + '</b>\'s in a clash</p>';
      return '<p>✨ <b>' + esc(nameOf(e.a)) + '</b> and <b>' + esc(nameOf(e.b)) + '</b> cancelled out</p>';
    }).join('') || '<p class="dlmuted">Watch the lasers…</p>';
  }

  /* ---------- the class screen (and the teacher's "Show the battle") ---------- */
  function rules(big) {
    return '<ol class="dlhow"><li>🛰️ Everyone gets a <b>secret mission</b>: your point and an enemy\'s point.</li><li>✏️ Write the line through both: <b>y = mx + b</b>.</li>' +
      '<li>⏱️ When the clock hits zero, <b>every laser fires at once</b> along the line you typed.</li><li>⚡ Lock in sooner for a <b>faster, stronger</b> laser. Lasers that meet <b>clash</b>: the stronger one wins.</li>' +
      (big ? '<li>🛡️ Done early? A bonus line charges a <b>shield</b> that blocks one hit.</li>' : '') + '</ol>';
  }
  function example() {
    return '<div class="dlex"><div class="dlexh">EXAMPLE MISSION</div><p>You at <b>A' + pt(-4, 1) + '</b>, target at <b>B' + pt(2, 4) + '</b></p>' +
      '<p>Slope: <b>m</b> = (4 − 1) ÷ (2 − (−4)) = 3 ÷ 6 = ' + fhtml([1, 2]) + '</p><p>Intercept: 1 = ' + fhtml([1, 2]) + ' × (−4) + <b>b</b>, so 1 = −2 + <b>b</b>, <b>b</b> = 3</p>' +
      '<p class="dleqbig">' + eqHTML([1, 2], [3, 1]) + '</p></div>';
  }
  function teamLists() {
    var g = H('div', 'dlteams');
    [0, 1].forEach(function (t) {
      var L = rosList().filter(function (r) { return r.t === t; }).sort(function (a, b) { return a.n.localeCompare(b.n); });
      g.appendChild(H('div', 'dlteamcard', '<h3 style="color:' + TC[t] + '">' + TE[t] + ' ' + esc(teamName(t, V.id)) + ' <small>' + L.length + '</small></h3><p>' + (L.map(function (r) { return esc(r.n); }).join(' · ') || '…') + '</p>'));
    });
    return g;
  }
  function scrIntro() {
    var c = H('div', 'dlcard wide');
    c.innerHTML = '<h2>🚀 LASER LINES: battle in deep space</h2>';
    var row = H('div', 'dlsplit'), l = H('div', 'dlcol');
    l.innerHTML = rules(true) + example(); l.appendChild(teamLists());
    row.appendChild(l); var r = H('div', 'dlcol'); field(r, { names: true }); row.appendChild(r); c.appendChild(row); root.appendChild(c);
  }
  function scrAim() {
    V.strip = H('div', 'dlstrip', lockStrip()); root.appendChild(V.strip);
    var w = H('div', 'dlbig'); field(w, { names: true }); root.appendChild(w);
  }
  function scrFire() {
    if (!V.anim) { root.appendChild(H('div', 'dlcard', '<h2>⚡ Lasers charging…</h2><p>Picking up every line from the fleet.</p>')); return; }
    var w = H('div', 'dlbig'); field(w, { names: true }); root.appendChild(w);
    V.feed = H('div', 'dlfeed'); root.appendChild(V.feed);
  }
  function recapHTML(L) {
    if (!L) return '';
    return '<div class="dlrecap"><h3>Round ' + L.r + ' results</h3><div class="dlrr">' + [0, 1].map(function (t) {
      return '<div style="--c:' + TC[t] + '"><b>' + TE[t] + ' ' + esc(teamName(t, V.id)) + '</b><span class="dlpts">+' + L.pts[t] + '</span><small>' + L.hits[t] + ' hit' + (L.hits[t] === 1 ? '' : 's') + ' · ' + L.zaps[t] + ' enemy laser' + (L.zaps[t] === 1 ? '' : 's') + ' stopped · ' + L.sh[t] + ' shield block' + (L.sh[t] === 1 ? '' : 's') + '</small></div>';
    }).join('') + '</div>' + (L.top ? '<p class="dltop1">🎯 Shot of the round: <b>' + esc(L.top.n) + '</b> hit <b>' + esc(L.top.v) + '</b> for ' + L.top.d + '</p>' : '') + '</div>';
  }
  function scrBreak() {
    var o = V.o, c = H('div', 'dlcard wide');
    c.innerHTML = recapHTML(o.last) + '<p class="dlbigp">🔁 Round ' + o.round + ': everyone warps to a <b>new spot</b> and gets a <b>new target</b>.</p>';
    field(c, { names: true }); root.appendChild(c);
  }
  function mvpHTML(o) {
    if (!o.mvp.length) return '';
    return '<div class="dlmvps">' + o.mvp.map(function (m, i) { return '<figure style="--c:' + TC[m.t] + '">' + (AV ? AV.svg(m.look, { size: 110, walk: true }) : '') + '<figcaption><b>' + ['🥇', '🥈', '🥉'][i] + ' ' + esc(m.n) + '</b><small>' + m.dmg + ' damage · ' + m.hits + ' hit' + (m.hits === 1 ? '' : 's') + ' · ' + m.zaps + ' clash' + (m.zaps === 1 ? '' : 'es') + '</small></figcaption></figure>'; }).join('') + '</div>';
  }
  function winner(o) { return o.score[0] === o.score[1] ? -1 : o.score[0] > o.score[1] ? 0 : 1; }
  function scrEnd() {
    var o = V.o, w = winner(o), c = H('div', 'dlcard wide');
    c.innerHTML = '<h2>' + (w < 0 ? '🤝 A draw in deep space! ' + o.score[0] + ' – ' + o.score[1] : '🏆 ' + TE[w] + ' ' + esc(teamName(w, V.id)) + ' win the battle, ' + Math.max(o.score[0], o.score[1]) + ' – ' + Math.min(o.score[0], o.score[1]) + '!') + '</h2>' +
      (o.mvp.length ? '<h3>Stars of the battle</h3>' + mvpHTML(o) : '') + recapHTML(o.last);
    root.appendChild(c); if (w >= 0 && A.confetti) try { A.confetti(); } catch (e) { }
  }

  /* ---------- a student's screens ---------- */
  function stIntro() {
    var m = me(), c = H('div', 'dlcard');
    c.innerHTML = '<h2>' + TE[m.t] + ' You fly with <span style="color:' + TC[m.t] + '">' + esc(teamName(m.t, V.id)) + '</span></h2>' + rules(true) + example() + '<p class="dlbigp">Your secret mission arrives when the clock at the top hits zero.</p>';
    root.appendChild(c);
    var f = H('div', 'dlcard'); field(f, {}); root.appendChild(f);
  }
  function mission() {
    var m = me(); if (!m || V.rr !== V.o.round) return null;
    var tg = V.ros[m.tg]; if (!tg) return null;
    var L = lineThrough([m.x, m.y], [tg.x, tg.y]);
    return { me: m, tg: tg, A: [m.x, m.y], B: [tg.x, tg.y], m: L.m, b: L.b, s: m.s };
  }
  // the shield beacon: a point in your own half that makes a friendly line with you (the same on every reload)
  function beacon(m) {
    var R = rng(hash(m.fp + ':' + V.o.round + ':' + Math.round(V.id / 1000))), c = [], c2 = [];
    for (var x = 1; x <= XM; x++) for (var y = -YM; y <= YM; y++) {
      var X = m.t ? x : -x; if (X === m.x) continue;
      var L = lineThrough([m.x, m.y], [X, y]); if (L.b[1] !== 1 || L.m[0] === 0 || Math.abs(L.b[0]) > 12) continue;
      c2.push([X, y]); if (m.s === 0 ? L.m[1] <= 3 : L.m[1] === 1 && Math.abs(L.m[0]) <= 4) c.push([X, y]);
    }
    var P = c.length ? c : c2.length ? c2 : [[m.t ? (m.x === 1 ? 2 : 1) : (m.x === -1 ? -2 : -1), m.y]], B = P[Math.floor(R() * P.length)];
    var L2 = lineThrough([m.x, m.y], B); return { A: [m.x, m.y], B: B, m: L2.m, b: L2.b, s: m.s };
  }
  function stAim() {
    var M = mission();
    if (!M) { root.appendChild(H('div', 'dlcard', '<h2>🛰️ Receiving your secret mission…</h2><p>Your coordinates are on the way from the command ship. A few seconds.</p>')); return; }
    var body = H('div', 'dlbody'), left = H('div', 'dlleft'), right = H('div', 'dlwork');
    left.appendChild(H('div', 'dlmis', '<div class="dlmish">🛰️ SECRET MISSION · ROUND ' + V.o.round + '</div><p>You: <b class="dlA">A' + pt(M.A[0], M.A[1]) + '</b><br>Target: <b>' + esc(M.tg.n) + '</b> at <b class="dlB">B' + pt(M.B[0], M.B[1]) + '</b></p>' +
      '<p class="dlsm">Your laser fires along the line you write when the clock hits zero. Lock in sooner for a faster, stronger laser.</p>'));
    field(left, { tg: M.tg.fp, small: true });
    body.appendChild(left); body.appendChild(right); root.appendChild(body);
    V.work = right; drawWork();
    if (ST.mr !== V.o.round) { ST.mr = V.o.round; ST.tot.p = (ST.tot.p || 0) + 1; if (String(ST.tot.hl || '').indexOf(String(M.s)) < 0) ST.tot.hl = String(ST.tot.hl || '') + M.s; keep(); }   // a round played, and the help it came with (for the report)
  }
  function tableHTML(Q) {
    var q = Q.m[1], xs = [0, q, 2 * q, 3 * q];
    return '<table class="dltbl"><tr><th>x</th>' + xs.map(function (x) { return '<td>' + nm(x) + '</td>'; }).join('') + '</tr><tr><th>y</th>' + xs.map(function (x) { return '<td>' + fhtml(fr(Q.m[0] * x * Q.b[1] + Q.b[0] * q, q * Q.b[1])) + '</td>'; }).join('') + '</tr></table>';
  }
  function scaffold(Q, what) {
    if (Q.s === 2) return '<div class="dlgiv">' + SUPE[2] + ' Slope <b>m = ' + fhtml(Q.m) + '</b> · y-intercept <b>b = ' + fhtml(Q.b) + '</b><small>Put them into y = mx + b.</small></div>';
    if (Q.s === 1) return '<div class="dlgiv">' + SUPE[1] + ' Every point in this table is on ' + what + ':' + tableHTML(Q) + '<small>' + (Q.m[1] === 1 ? 'How much does y change each time x goes up by 1? What is y when x = 0?' : 'x goes up by ' + Q.m[1] + ' each time. How much does y change? What is y when x = 0?') + '</small></div>';
    return '<div class="dlgiv">' + SUPE[0] + ' Find the slope from the two points, then b.</div>';
  }
  function hint(Q, gm, gb) {
    var mOk = feq(gm, Q.m), bOk = feq(gb, Q.b), A1 = Q.A, B1 = Q.B;
    if (Q.s === 2) return mOk ? 'The slope is right. The intercept b goes on the end: + ' + fstr(Q.b) + '.' : 'The slope m goes in front of x. Check the numbers you were given.';
    if (Q.s === 1) return mOk ? 'Slope ✓. Now b: it\'s the y value when x = 0, the first column of the table.' : Q.m[1] === 1 ? 'Look along the table: each time x goes up by 1, y changes by the same amount. That change is the slope.' : 'x goes up by ' + Q.m[1] + ' each step. Slope = change in y ÷ ' + Q.m[1] + '.';
    if (!mOk) return 'Slope = change in y ÷ change in x = (' + nm(B1[1]) + ' − ' + (A1[1] < 0 ? '(' + nm(A1[1]) + ')' : A1[1]) + ') ÷ (' + nm(B1[0]) + ' − ' + (A1[0] < 0 ? '(' + nm(A1[0]) + ')' : A1[0]) + ').';
    if (!bOk) return 'Slope ✓. Now put your point into y = mx + b: ' + nm(A1[1]) + ' = ' + fstr(Q.m) + ' × ' + (A1[0] < 0 ? '(' + nm(A1[0]) + ')' : A1[0]) + ' + b. Solve for b.';
    return '';
  }
  function phase() { return !ST.lk ? 'L' : !ST.sh && ST.str < STRIES ? 'S' : 'D'; }
  function drawWork() {
    var box = V.work; if (!box) return;
    var M = mission(); if (!M) return;
    var ph = phase(), e = (sNow() - V.o.at) / 1000, out = '';
    if (ST.lk) {
      var sp = speedOf(ST.t, V.o.alen), pw = power(sp, ST.tr);
      out += ST.lk === 1 ? '<div class="dlok">✅ Laser locked on <b>' + esc(M.tg.n) + '</b>: ' + eqHTML(parseF(ST.lm), parseF(ST.lb)) + '<small>⚡ speed ' + sp + ' of 9 · 💥 power ' + pw + '</small></div>'
        : '<div class="dlno">🔒 Out of tries: your laser fires along <b>' + eqHTML(parseF(ST.lm) || [0, 1], parseF(ST.lb) || [0, 1]) + '</b>. It might still hit someone!<small>⚡ speed ' + sp + ' · 💥 power ' + pw + '</small></div>';
    }
    if (ph === 'L' || ph === 'S') {
      var Q = ph === 'L' ? M : beacon(M.me), fM = ph === 'L' ? ST.lm : ST.sm, fB = ph === 'L' ? ST.lb : ST.sb, act = ph === 'L' ? ST.act : ST.sact, tr = ph === 'L' ? ST.tr : ST.str, max = ph === 'L' ? TRIES : STRIES;
      if (ph === 'S') out += '<div class="dlshh">🛡️ BONUS: charge your shield</div><p>Write the line through you, <b class="dlA">A' + pt(Q.A[0], Q.A[1]) + '</b>, and the shield beacon <b class="dlS">S' + pt(Q.B[0], Q.B[1]) + '</b>. It blocks one hit.</p>';
      out += scaffold(Q, ph === 'L' ? 'your laser\'s line' : 'the shield line');
      out += '<div class="dleq"><i class="dlx">y</i> = <button type="button" class="dlbox' + (act === 'm' ? ' on' : '') + '" data-b="m">' + (esc(fM) || '<span>m</span>') + '</button> <i class="dlx">x</i> + <button type="button" class="dlbox' + (act === 'b' ? ' on' : '') + '" data-b="b">' + (esc(fB) || '<span>b</span>') + '</button></div>';
      var gm = parseF(fM), gb = parseF(fB);
      out += '<div class="dlprev">' + (gm && gb ? 'That\'s ' + eqHTML(gm, gb) : 'Fractions like 3/2 are fine.') + (tr ? ' · try ' + (tr + 1) + ' of ' + max : '') + '</div>';
      out += '<div class="dlkeys">' + ['7', '8', '9', '⌫', '4', '5', '6', '/', '1', '2', '3', '−', '0', '.', '⇄'].map(function (k) { return '<button type="button" data-k="' + k + '">' + k + '</button>'; }).join('') +
        '<button type="button" class="dlgo" data-k="go">' + (ph === 'L' ? '🔒 Lock in laser' : '🛡️ Charge shield') + '</button></div>';
    }
    else out += '<div class="dlwait">' + (ST.sh === 1 ? '🛡️ <b>Shield up!</b> It blocks the first laser that hits you.<br>' : '') + '⏳ Lasers fire in <b class="dlleft2">' + clock(V.o.alen - e) + '</b>. Watch the big screen!</div>';
    if (ST.msg) out += '<p class="dlfb' + (ST.good ? ' good' : '') + '">' + ST.msg + '</p>';
    box.innerHTML = out;
    [].forEach.call(box.querySelectorAll('[data-k]'), function (b) { b.onclick = function () { press(b.getAttribute('data-k')); }; });
    [].forEach.call(box.querySelectorAll('[data-b]'), function (b) { b.onclick = function () { if (phase() === 'L') ST.act = b.getAttribute('data-b'); else ST.sact = b.getAttribute('data-b'); drawWork(); }; });
  }
  function press(k) {
    var ph = phase(); if (ph === 'D' || V.o.state !== 1) return;
    var f = ph === 'L' ? (ST.act === 'm' ? 'lm' : 'lb') : (ST.sact === 'm' ? 'sm' : 'sb'), v = ST[f] || '';
    if (k === 'go') return check();
    if (k === '⇄') { if (ph === 'L') ST.act = ST.act === 'm' ? 'b' : 'm'; else ST.sact = ST.sact === 'm' ? 'b' : 'm'; drawWork(); return; }
    if (k === '⌫') v = v.slice(0, -1);
    else if (k === '−') v = v.charAt(0) === '-' ? v.slice(1) : '-' + v;
    else if (v.length < 7 && !(k === '/' && (v.indexOf('/') >= 0 || v.indexOf('.') >= 0)) && !(k === '.' && (v.indexOf('.') >= 0 || v.indexOf('/') >= 0))) v += k;
    ST[f] = v; ST.msg = ''; keep(); drawWork();
  }
  function onKey(e) {
    if (!V || A.MODE !== 'student' || V.o.state !== 1 || !V.work || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    var k = e.key, map = { Backspace: '⌫', '-': '−', '/': '/', '.': '.', Enter: 'go', Tab: '⇄' };
    if (/^[0-9]$/.test(k)) press(k); else if (map[k]) { e.preventDefault(); press(map[k]); }
  }
  function check() {
    var M = mission(); if (!M) return;
    var ph = phase(), Q = ph === 'L' ? M : beacon(M.me), gm = parseF(ph === 'L' ? ST.lm : ST.sm), gb = parseF(ph === 'L' ? ST.lb : ST.sb), secs = Math.max(0, Math.round((sNow() - V.o.at) / 100) / 10);
    if (!gm || !gb) { ST.msg = 'Put a number in both boxes. Whole numbers, fractions like −3/2 or decimals are all fine.'; ST.good = false; drawWork(); return; }
    var right = feq(gm, Q.m) && feq(gb, Q.b);
    if (ph === 'L') {
      ST.tr++; ST.lm = fstr(gm); ST.lb = fstr(gb);
      if (right) { ST.lk = 1; ST.t = secs; ST.tot.right++; if (ST.tr === 1) ST.tot.first++; ST.msg = ST.tr === 1 ? '🎯 Spot on, first try! Your laser is locked on.' : '🎯 Locked on!'; ST.good = true; xp(ST.tr === 1 ? 8 : 5); snd('lock'); send(); }
      else if (ST.tr >= TRIES) { ST.lk = 2; ST.t = secs; ST.msg = 'The line through both points was ' + eqHTML(M.m, M.b) + '. Your laser fires along yours anyway.'; ST.good = false; snd('nope'); send(); }
      else { ST.msg = '❌ That line misses ' + esc(M.tg.n) + '. ' + hint(Q, gm, gb); ST.good = false; snd('nope'); }
    }
    else {
      ST.str++; ST.sm = fstr(gm); ST.sb = fstr(gb);
      if (right) { ST.sh = 1; ST.msg = '🛡️ Shield charged!'; ST.good = true; xp(4); snd('shield'); send(); }
      else if (ST.str >= STRIES) { ST.msg = 'No shield this time: the shield line was ' + eqHTML(Q.m, Q.b) + '.'; ST.good = false; send(); }
      else { ST.msg = '❌ Not quite. ' + hint(Q, gm, gb); ST.good = false; snd('nope'); }
    }
    keep(); drawWork();
  }
  function send() {
    if (A.MODE !== 'student' || !V) return;
    A.record({ id: QID, k: 'open' }, 'd1;id:' + Math.round(V.id / 1000) + ';r:' + (ST.r || 0) + ';m:' + (ST.lk ? ST.lm : '') + ';b:' + (ST.lk ? ST.lb : '') + ';t:' + ST.t + ';tr:' + ST.tr + ';lk:' + ST.lk + ';sh:' + ST.sh + ';st:' + ST.str + ';n:' + (ST.tot.p || 0) + ';ok:' + ST.tot.right + ';f:' + ST.tot.first + ';hi:' + ST.tot.hits + ';dm:' + ST.tot.dmg + ';z:' + ST.tot.zaps + ';bl:' + ST.tot.blocks + ';hl:' + (ST.tot.hl || '') + ';w:' + (ST.w || 0), null);
  }
  function stFire() {
    var c = H('div', 'dlcard');
    if (!V.anim) { c.innerHTML = '<h2>⚡ Lasers charging…</h2>'; root.appendChild(c); return; }
    field(c, { names: false }); V.res = H('div', 'dlres', myResult(true)); c.appendChild(V.res); root.appendChild(c);
  }
  // after the volley: what your laser did, and the line it should have been
  function tally() {
    var A2 = V.anim, mf = myFp(); if (!A2 || ST.seen[A2.r]) return;
    var b = A2.res.B[mf]; ST.seen[A2.r] = 1;
    if (b) { if (b.how === 'hit') { ST.tot.hits++; ST.tot.dmg += b.dmg; xp(6); } ST.tot.zaps += b.won + (b.how === 'cancel' ? 1 : 0); }
    A2.res.units.forEach(function (u) { if (u.fp === mf && u.used) ST.tot.blocks++; });
    keep(); send();
  }
  function stBreak() {
    tally();
    var o = V.o, c = H('div', 'dlcard'), A2 = V.anim;
    c.innerHTML = recapHTML(o.last) + (A2 && A2.r === o.round - 1 ? '<div class="dlres">' + myResult(false) + '</div>' : '') + '<p class="dlbigp">🔁 Round ' + o.round + ' coming: a new spot and a new target.</p>';
    root.appendChild(c);
  }
  function stEnd() {
    tally();
    var o = V.o, w = winner(o), m = me(), c = H('div', 'dlcard'), T = ST.tot;
    c.innerHTML = '<h2>' + (w < 0 ? '🤝 A draw!' : m && m.t === w ? '🏆 Your fleet wins!' : '💫 ' + esc(teamName(w, V.id)) + ' win this time') + '</h2><p class="dlbigp">' + o.score[0] + ' – ' + o.score[1] + '</p>' +
      '<div class="dlmy"><span>🎯 <b>' + T.right + '</b> line' + (T.right === 1 ? '' : 's') + ' right (' + T.first + ' first try)</span><span>💥 <b>' + T.hits + '</b> hit' + (T.hits === 1 ? '' : 's') + ', ' + T.dmg + ' damage</span><span>⚡ <b>' + T.zaps + '</b> clash' + (T.zaps === 1 ? '' : 'es') + ' won</span><span>🛡️ <b>' + T.blocks + '</b> block' + (T.blocks === 1 ? '' : 's') + '</span></div>' +
      (o.mvp.length ? '<h3>Stars of the battle</h3>' + mvpHTML(o) : '');
    root.appendChild(c);
    if (!ST.seen.end) { ST.seen.end = 1; ST.w = w < 0 ? 3 : m && m.t === w ? 1 : 2; xp(m && m.t === w ? 15 : 10, true); keep(); send(); }
  }

  /* ---------- sound: lasers, clashes and shields ---------- */
  var AC = null;
  function soundOn() { var v = SFA.store.get('duel.sound', null); return v == null ? A.MODE !== 'student' : !!v; }
  function noise(t, dur, f0, f1, vol, type) {
    var buf = AC.createBuffer(1, Math.floor(AC.sampleRate * dur), AC.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); src.buffer = buf; f.type = type || 'lowpass';
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(AC.destination); src.start(t);
  }
  function tone(t, type, f0, f1, dur, vol) {
    var o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function snd(k) {
    if (!soundOn()) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); var t = AC.currentTime;
      if (k === 'pew') { tone(t, 'sawtooth', 1500, 160, 0.35, 0.12); tone(t + 0.05, 'square', 1100, 140, 0.3, 0.05); }
      if (k === 'beep') tone(t, 'sine', 880, 870, 0.12, 0.12);
      if (k === 'boom') { noise(t, 0.6, 1600, 90, 0.5); tone(t, 'sine', 140, 40, 0.5, 0.4); }
      if (k === 'hit') { noise(t, 0.3, 3000, 300, 0.35, 'bandpass'); tone(t, 'square', 300, 60, 0.25, 0.12); }
      if (k === 'shield') { tone(t, 'triangle', 400, 1600, 0.35, 0.15); tone(t + 0.08, 'sine', 900, 2400, 0.3, 0.08); }
      if (k === 'lock') { tone(t, 'square', 660, 660, 0.08, 0.08); tone(t + 0.09, 'square', 990, 990, 0.12, 0.08); }
      if (k === 'nope') tone(t, 'sawtooth', 220, 110, 0.25, 0.08);
    } catch (e) { }
  }

  /* =========================== the teacher console: the referee =========================== */
  function C() { return A.console_().duel; }
  function save(K) { try { SFA.store.set('teacher.duel.' + A.LID, K); } catch (e) { } }
  function rnd(t) { return Math.round(t / 1000) * 1000; }
  function active() {
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = r; });
    var here = {}; (A.consoleAnswers() || []).forEach(function (a) { if (ids[a.sid] && !A.beforeRun(a)) here[a.sid] = 1; });
    return Object.keys(here);
  }
  function sname(sid) { var r = A.rosterIn().filter(function (x) { return x.sid === sid; })[0]; return r ? clean(A.first(r.name).replace(/[^A-Za-zÀ-ÿ' -]/g, '')) : '?'; }
  function looksBySid() {
    var out = {}, t = {};
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q !== 'zlookx1') return; var m = String(a.answer).match(/^lk1;([0-9a-z]{1,12})/); if (m && (!t[a.sid] || String(a.time) >= t[a.sid])) { t[a.sid] = String(a.time); out[a.sid] = m[1]; } });
    return out;
  }
  function allSids(K) { return K.teams[0].concat(K.teams[1]); }
  function scoresToday(who) {
    var sc = {}; who.forEach(function (s) { sc[s] = Math.random() * 0.5; });
    (A.consoleAnswers() || []).forEach(function (a) { if (sc[a.sid] != null && !A.beforeRun(a) && !/^z/.test(a.q) && (a.correct === true || a.correct === 'yes')) sc[a.sid] += 1; });
    return sc;
  }
  // fair fleets (strongest first, snake order) and a support level for each student from today's answers
  function start(mins, rounds) {
    var who = active();
    if (who.length < 2) { SFA.toast('Laser Lines needs at least two students who have answered something today.', 4000); return false; }
    var sc = scoresToday(who), L = who.slice().sort(function (a, b) { return sc[b] - sc[a]; }), t = rnd(Date.now());
    var K = { id: t, state: 3, round: 1, rounds: rounds || 3, at: t, alen: Math.round((mins || 2) * 60), rx: 0, intro: INTRO, teams: [[], []], sup: {}, pin: {}, pos: {}, rows: {}, score: [0, 0], stats: {}, last: null, cur: 0, lastPush: 0, lastSave: 0, nm: {}, flen: 0 };
    L.forEach(function (sid, i) { K.teams[[0, 1, 1, 0][i % 4]].push(sid); K.sup[sid] = i / L.length < 0.45 ? 0 : i / L.length < 0.75 ? 1 : 2; });
    layout(K);
    A.console_().duel = K; save(K); A.pushLive(); A.consolePanel();
    return true;
  }
  // how well a target suits a student's support level (an integer slope and intercept for the table and the given values)
  function pairScore(sup, P, Q) {
    var L = lineThrough(P, Q), m = L.m, b = L.b, iM = m[1] === 1, iB = b[1] === 1, am = Math.abs(m[0] / m[1]), ab = Math.abs(b[0] / b[1]);
    if (sup === 0) return (iB ? 3 : 1) + ((!iM && m[1] <= 4) || (iM && am >= 1 && am <= 6) ? 1.5 : 0) - (m[0] === 0 ? 2 : 0) - (ab > 15 ? 1 : 0);
    return iM && iB && am <= 5 ? (m[0] === 0 ? 3 : ab > 15 ? 4 : 5) : iB ? (sup === 2 ? 3 : 2) : sup === 2 ? 1 : 0;
  }
  function pickCell(t, taken, R) {
    var cells = []; for (var x = 1; x <= XM; x++) for (var y = -YM; y <= YM; y++) cells.push([t ? x : -x, y]);
    var free = function (c, gap) { return taken.every(function (q) { return Math.max(Math.abs(q[0] - c[0]), Math.abs(q[1] - c[1])) >= gap; }); };
    var ok = cells.filter(function (c) { return free(c, 2); }); if (!ok.length) ok = cells.filter(function (c) { return free(c, 1); }); if (!ok.length) ok = cells;
    return ok[Math.floor(R() * ok.length)];
  }
  function pickTarget(K, sid, t, pos, load, R) {
    var best = '', bv = -99, P = pos[sid];
    K.teams[1 - t].forEach(function (e) { var Q = pos[e]; if (!Q) return; var v = pairScore(K.sup[sid] || 0, [P.x, P.y], [Q.x, Q.y]) - 1.2 * (load[e] || 0) + R() * 0.4; if (v > bv) { bv = v; best = e; } });
    if (best) load[best] = (load[best] || 0) + 1;
    return best;
  }
  // new spots and new targets each round: try a few layouts, keep the one where the most students get a friendly line
  function layout(K) {
    var R = rng(K.id / 1000 + K.round * 7919), best = null;
    for (var a = 0; a < 30; a++) {
      var pos = {}, load = {}, good = 0;
      [0, 1].forEach(function (t) { var taken = []; shuffle(K.teams[t], R).forEach(function (sid) { var c = pickCell(t, taken, R); pos[sid] = { x: c[0], y: c[1], tg: '' }; taken.push(c); }); });
      [0, 1].forEach(function (t) { shuffle(K.teams[t], R).forEach(function (sid) { var tg = pickTarget(K, sid, t, pos, load, R); pos[sid].tg = tg; if (tg && pairScore(K.sup[sid] || 0, [pos[sid].x, pos[sid].y], [pos[tg].x, pos[tg].y]) >= (K.sup[sid] ? 5 : 3)) good++; }); });
      if (!best || good > best.good) best = { pos: pos, good: good };
      if (good === allSids(K).length) break;
    }
    K.pos = best.pos; K.ents = null;
  }
  function teamOf(K, sid) { return K.teams[0].indexOf(sid) >= 0 ? 0 : K.teams[1].indexOf(sid) >= 0 ? 1 : -1; }
  function addLate(K, sid) {
    var t = K.teams[0].length <= K.teams[1].length ? 0 : 1, R = Math.random;
    K.teams[t].push(sid); K.sup[sid] = 1;
    var taken = K.teams[t].filter(function (s) { return K.pos[s]; }).map(function (s) { return [K.pos[s].x, K.pos[s].y]; }), c = pickCell(t, taken, R);
    K.pos[sid] = { x: c[0], y: c[1], tg: '' };
    var load = {}; allSids(K).forEach(function (s) { var g = K.pos[s] && K.pos[s].tg; if (g) load[g] = (load[g] || 0) + 1; });
    K.pos[sid].tg = pickTarget(K, sid, t, K.pos, load, R);
    K.teams[1 - t].forEach(function (s) { if (K.pos[s] && !K.pos[s].tg) K.pos[s].tg = pickTarget(K, s, 1 - t, K.pos, load, R); });   // the other fleet had no one to aim at
    K.ents = null;
  }
  function locked(K, sid) { var r = K.rows[sid]; return !!(r && r.r === K.round && r.lk); }
  function rosOf(K) { var out = []; [0, 1].forEach(function (t) { K.teams[t].forEach(function (sid) { var P = K.pos[sid]; if (P) out.push({ fp: sh3(sid), sid: sid, t: t, x: P.x, y: P.y }); }); }); return out; }
  function fireStr(K) {
    var list = [], len = Math.max(10, K.alen + (K.rx || 0));
    allSids(K).forEach(function (sid) {
      var r = K.rows[sid]; if (!K.pos[sid] || !locked(K, sid)) return;
      var m = parseF(r.m), b = parseF(r.b); if (!m || !b) return;
      var sp = speedOf(r.t, len);
      list.push({ ok: r.lk === 1 ? 1 : 0, sp: sp, s: sh3(sid) + '~' + fstr(m) + '~' + fstr(b) + '~' + sp + (clamp(r.tr || 1, 1, 3) - 1) + (r.sh === 1 ? 1 : 0) });
    });
    list.sort(function (a, b) { return b.ok - a.ok || b.sp - a.sp; });
    var out = [], used = 0; list.forEach(function (x) { if (used + x.s.length + 1 <= 540) { out.push(x.s); used += x.s.length + 1; } });
    return 'F:' + K.round + '|' + out.join(',');
  }
  function fire(K) {
    K.fstr = fireStr(K); K.state = 5; K.at = rnd(Date.now());
    var ros = rosOf(K), F = decFire(K.fstr.slice(2)), res = sim(ros, F), S = scoreOf(res), bySid = {};
    ros.forEach(function (r) { bySid[r.fp] = r.sid; });
    K.flen = Math.ceil(res.len);
    K.score[0] += S.pts[0]; K.score[1] += S.pts[1];
    Object.keys(S.per).forEach(function (fp) { var sid = bySid[fp]; if (!sid) return; var st = K.stats[sid] || (K.stats[sid] = { dmg: 0, hits: 0, taken: 0, zaps: 0, blocks: 0, right: 0, first: 0 }), p = S.per[fp]; ['dmg', 'hits', 'taken', 'zaps', 'blocks'].forEach(function (k) { st[k] += p[k]; }); });
    allSids(K).forEach(function (sid) { var r = K.rows[sid], st = K.stats[sid] || (K.stats[sid] = { dmg: 0, hits: 0, taken: 0, zaps: 0, blocks: 0, right: 0, first: 0 }); if (r && r.r === K.round && r.lk === 1) { st.right++; if (r.tr === 1) st.first++; } });
    var top = null; res.ev.forEach(function (e) { if (e.k === 'hit' && (!top || e.d > top.d)) top = e; });
    K.last = { r: K.round, pts: S.pts, hits: S.hits, zaps: S.zaps, sh: S.sh, top: top ? { n: sname(bySid[top.a]), v: sname(bySid[top.b]), d: top.d } : null };
    K.hist = (K.hist || []).concat([{ r: K.round, pts: S.pts }]);
  }
  // support moves with the student: right first time with help, a little less help next round; no line, a little more
  function adapt(K) {
    allSids(K).forEach(function (sid) {
      if (K.pin[sid]) return;
      var r = K.rows[sid], s = K.sup[sid] || 0;
      if (r && r.r === K.round && r.lk === 1 && r.tr === 1 && s > 0) K.sup[sid] = s - 1;
      else if ((!r || r.r !== K.round || r.lk !== 1) && s < 2) K.sup[sid] = s + 1;
    });
  }
  function afterFire(K) {
    adapt(K);
    if (K.round < K.rounds) { K.round++; K.state = 4; K.at = rnd(Date.now()); K.rx = 0; layout(K); }
    else end(K);
  }
  function end(K) {
    K = K || C(); if (!K || K.state === 2) return;
    K.state = 2; K.at = rnd(Date.now());
    save(K); (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function agg() {
    var K = C(); if (!K) return;
    var key2 = 'id:' + Math.round(K.id / 1000) + ';', last = {}, changed = false;
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q === QID && String(a.answer).indexOf(key2) >= 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    Object.keys(last).forEach(function (sid) {
      var s = String(last[sid].answer), g = function (k) { var m = s.match(new RegExp(';' + k + ':(-?[0-9.]+)')); return m ? +m[1] : 0; }, gs = function (k) { return (s.match(new RegExp(';' + k + ':([-0-9/.]+)')) || [])[1] || ''; };
      var row = { r: g('r'), m: gs('m'), b: gs('b'), t: g('t'), tr: g('tr'), lk: g('lk'), sh: g('sh'), st: g('st') }, old = K.rows[sid];
      if (!old || old.r !== row.r || old.lk !== row.lk || old.sh !== row.sh || old.st !== row.st) changed = true;
      K.rows[sid] = row;
    });
    if (K.state !== 2) Object.keys(last).forEach(function (sid) { if (teamOf(K, sid) >= 0 || !A.rosterIn().some(function (r) { return r.sid === sid; })) return; addLate(K, sid); changed = true; });
    if (changed) { K.ents = null; A.consolePanel(); }
  }
  function tick() {
    var K = C(); if (!K) return;
    var now = Date.now(), e = (now - K.at) / 1000, pushed = false, go = function () { pushed = true; save(K); (A.pushNow || A.pushLive)(); A.consolePanel(); };
    if (K.state === 3 && e >= K.intro) { K.state = 1; K.at = rnd(now); go(); }
    else if (K.state === 1) { var all = allSids(K).every(function (s) { return locked(K, s); }); if (e >= K.alen + (K.rx || 0) || (all && e >= 15)) { fire(K); go(); } }
    else if (K.state === 5 && e >= COUNT + K.flen + AFTER) { afterFire(K); go(); }
    else if (K.state === 4 && e >= BREAK) { K.state = 1; K.at = rnd(now); go(); }
    else if (K.state === 2 && now - K.at > 8 * 60000) { A.console_().duel = null; if (root && V && V.watch) close(); (A.pushNow || A.pushLive)(); A.consolePanel(); return; }
    if (!pushed && now - K.lastPush >= PUSH_MS) { K.lastPush = now; (A.pushNow || A.pushLive)(); if (K.state === 1) A.consolePanel(); }
    if (pushed) K.lastPush = now;
    if (now - (K.lastSave || 0) > 3000) { K.lastSave = now; save(K); }
    if (root && V && V.watch) apply(watchState());
  }
  function counts(out) {
    var K = C(); if (!K) return;
    var lk = [0, 0]; [0, 1].forEach(function (t) { K.teams[t].forEach(function (s) { if (locked(K, s)) lk[t]++; }); });
    out.zdid = A.encRun(K.id); out.zdst = A.encRun(K.id + (A.console_().skew || 0));
    out.zds = [K.state, K.round, K.rounds, Math.min(9999, K.alen + (K.rx || 0)), Math.min(9999, Math.max(0, Math.round((K.at - K.id) / 1000))), K.intro, Math.min(9999, K.score[0]), Math.min(9999, K.score[1]), allSids(K).length, lk[0], lk[1], K.flen || 0];
  }
  // the roster, one entry per student: fingerprint~team~x~y~target~support~locked~name~look (two of the same first name get an initial)
  function entries(K) {
    if (!K.ents || Date.now() - (K.entsAt || 0) > 20000) {
      var LK = looksBySid(), first = {}, R = {}, nmx = {};
      A.rosterIn().forEach(function (r) { R[r.sid] = r; });
      allSids(K).forEach(function (sid) { var f = sname(sid); first[f] = (first[f] || 0) + 1; });
      allSids(K).forEach(function (sid) { var f = sname(sid), r = R[sid]; if (first[f] > 1 && r) { var lst = String(r.name || '').indexOf(',') >= 0 ? String(r.name).split(',')[0].trim() : String(r.name || '').trim().split(' ').slice(-1)[0]; f = clean(f + ' ' + (lst.charAt(0) || '')); } nmx[sid] = { n: f, look: LK[sid] || (AV ? AV.defLook(sid) : '') }; });
      K.ents = nmx; K.entsAt = Date.now();
    }
    var out = [];
    [0, 1].forEach(function (t) { K.teams[t].forEach(function (sid) { var P = K.pos[sid], N = K.ents[sid] || { n: sname(sid), look: '' }; if (P) out.push([sh3(sid), t, P.x, P.y, P.tg ? sh3(P.tg) : '', K.sup[sid] || 0, locked(K, sid) ? 1 : 0, N.n, N.look].join('~')); }); });
    return out;
  }
  function lastStr(K) { var L = K.last; return L ? 'L:' + [L.r, L.pts[0], L.pts[1], L.hits[0], L.hits[1], L.zaps[0], L.zaps[1], L.sh[0], L.sh[1]].join('.') + '|' + (L.top ? clean(L.top.n) + '~' + clean(L.top.v) + '~' + L.top.d : '') : ''; }
  function mvps(K) { return allSids(K).map(function (sid) { var s = K.stats[sid] || { dmg: 0, hits: 0, zaps: 0, blocks: 0 }; return { sid: sid, s: s, v: s.dmg + 15 * s.zaps + 20 * s.blocks }; }).filter(function (x) { return x.v > 0; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 3); }
  function spot() {
    var K = C(), head = '';
    if (K.state === 5 && K.fstr) head = K.fstr + '#';
    else if (K.state === 4 && K.last) head = lastStr(K) + '#';
    else if (K.state === 2) { entries(K); head = 'M:' + mvps(K).map(function (x) { var N = K.ents[x.sid] || {}; return [clean(N.n || sname(x.sid)), N.look || '', x.s.dmg, x.s.hits, x.s.zaps, teamOf(K, x.sid)].join('~'); }).join(',') + '#' + (K.last ? lastStr(K) + '#' : ''); }
    var E = entries(K), n = E.length, budget = 590 - head.length, pick = [], c0 = n ? K.cur % n : 0, used = 0;
    for (var k = 0; k < n; k++) { var x = E[(c0 + k) % n]; if (used + x.length + 1 > budget - 12) break; pick.push(x); used += x.length + 1; }
    K.cur = n ? (c0 + pick.length) % n : 0;
    return { q: 'zduel', text: (head + 'P:' + K.round + '.' + c0 + '|' + pick.join(',')).slice(0, 600) };
  }
  function restore(Lv) {
    var o = duelOf(Lv), saved = SFA.store.get('teacher.duel.' + A.LID, null);
    if (!o || !saved || saved.id !== o.id || o.state === 2) { A.console_().duel = null; return false; }
    saved.ents = null; saved.lastPush = 0; A.console_().duel = saved;
    return true;
  }
  function watchState() {
    var K = C(), out = {}; counts(out);
    var o = duelOf({ lesson: A.LID, counts: out, spot: { q: 'zduel', text: fullSpot(K) } }); o.start = K.id; o.at = K.at; return o;
  }
  // the console's own view gets the whole roster at once, not a page of it
  function fullSpot(K) { var s = spot(), i = s.text.indexOf('P:'), head = i >= 0 ? s.text.slice(0, i) : ''; return head + 'P:' + K.round + '.0|' + entries(K).join(','); }
  function watch() { var o = watchState(); open(o); V.watch = true; root.classList.add('screen'); apply(o); draw(); }

  // what the teacher sees: the battle, and who needs which kind of help
  function section(p) {
    var K = C(), sec = H('div', 'sect'), e = (Date.now() - K.at) / 1000, len = K.alen + (K.rx || 0), n = allSids(K).length, lk = allSids(K).filter(function (s) { return locked(K, s); }).length;
    sec.appendChild(H('h3', '', '🚀 Laser Lines · ' + (K.state === 2 ? 'Results' : 'Round ' + K.round + ' of ' + K.rounds)));
    var tn = function (t) { return TE[t] + ' ' + esc(teamName(t, K.id)); };
    var line = K.state === 3 ? 'Rules on every screen: missions arrive in <b>' + clock(K.intro - e) + '</b>' :
      K.state === 1 ? '<b>' + clock(len - e) + '</b> until the lasers fire · <b>' + lk + '</b> of ' + n + ' locked in (they fire early once everyone has)' :
      K.state === 5 ? '⚡ The volley is on every screen' : K.state === 4 ? 'Round ' + K.round + ' starts in <b>' + clock(BREAK - e) + '</b> (new spots, new targets)' :
      (K.score[0] === K.score[1] ? '🤝 A draw' : '🏆 <b>' + tn(K.score[0] > K.score[1] ? 0 : 1) + '</b> win');
    sec.appendChild(H('p', '', line + ' · ' + tn(0) + ' <b>' + K.score[0] + '</b> – <b>' + K.score[1] + '</b> ' + tn(1)));
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show the battle', title: 'The class screen view on this screen', onclick: function () { watch(); } }));
    if (K.state === 3 || K.state === 4) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏭ Send the missions now', onclick: function () { K.state = 1; K.at = rnd(Date.now()); save(K); (A.pushNow || A.pushLive)(); A.consolePanel(); } }));
    if (K.state === 1) {
      r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '🔥 Fire now', title: 'Fire every locked-in laser now', onclick: function () { fire(K); save(K); (A.pushNow || A.pushLive)(); A.consolePanel(); } }));
      r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +30 s', onclick: function () { K.rx = (K.rx || 0) + 30; save(K); A.pushLive(); A.consolePanel(); } }));
    }
    if (K.state !== 2) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End it now', title: 'Straight to the results', onclick: function () { end(K); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().duel = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    // details: each student's help level (tap to change), this round, the battle so far
    var dd = A.fold ? A.fold('g-duel', '📋 Details · help levels, who has locked in', K.state === 2) : (function () { var d = el('details', { 'class': 'sect fold' }); d.appendChild(el('summary', {}, [H('h3', '', '📋 Details')])); return d; })();
    dd.appendChild(H('p', 'muted', 'Help levels: ' + SUP.map(function (s, i) { return SUPE[i] + ' ' + s; }).join(' · ') + '. They move each round (right first time: less help; no right line: more). Tap a student to set theirs yourself; that keeps it fixed.'));
    var wrap = H('div', 'row');
    [0, 1].forEach(function (t) {
      K.teams[t].slice().sort(function (a, b) { return sname(a).localeCompare(sname(b)); }).forEach(function (sid) {
        var row = K.rows[sid], st = K.stats[sid] || { dmg: 0, right: 0, first: 0 }, now2 = row && row.r === K.round ? (row.lk === 1 ? '✅' : row.lk === 2 ? '❌' : '✏️') : '…', s = K.sup[sid] || 0;
        var b = el('button', { type: 'button', 'class': 'btn small', title: 'Help: ' + SUP[s] + (K.pin[sid] ? ' (set by you)' : '') + '. Tap to change.' });
        b.textContent = TE[t] + ' ' + sname(sid) + ' ' + SUPE[s] + (K.pin[sid] ? '📌' : '') + ' ' + (K.state === 1 ? now2 : '') + ' · ' + st.right + '✓ ' + st.dmg + '💥';
        b.onclick = function () { K.sup[sid] = ((K.sup[sid] || 0) + 1) % 3; K.pin[sid] = 1; K.ents = null; save(K); A.pushLive(); A.consolePanel(); };
        wrap.appendChild(b);
      });
    });
    dd.appendChild(wrap);
    if (K.hist && K.hist.length) dd.appendChild(H('p', 'muted', K.hist.map(function (h) { return 'Round ' + h.r + ': ' + h.pts[0] + ' – ' + h.pts[1]; }).join(' · ')));
    var cp = el('button', { type: 'button', 'class': 'btn small', text: '📋 Copy results' });
    cp.onclick = function () {
      var lines = ['Name\tFleet\tHelp now\tLines right\tFirst try\tHits\tDamage\tClashes won\tShield blocks'].concat(allSids(K).map(function (sid) { var s = K.stats[sid] || { right: 0, first: 0, hits: 0, dmg: 0, zaps: 0, blocks: 0 }; return [sname(sid), teamName(teamOf(K, sid), K.id), SUP[K.sup[sid] || 0], s.right, s.first, s.hits, s.dmg, s.zaps, s.blocks].join('\t'); }));
      try { navigator.clipboard.writeText(lines.join('\n')).then(function () { SFA.toast('Copied. Paste it into a spreadsheet.', 2500); }); } catch (x) { SFA.toast('Couldn\'t copy here.', 2500); }
    };
    dd.appendChild(cp);
    sec.appendChild(dd);
    p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 500);

  /* ---------- styles ---------- */
  var css = [
    '.dl{position:fixed;inset:0;z-index:90;overflow:auto;background:radial-gradient(ellipse at 30% 0%,#1d1248,#05050f 70%);color:#E6F0FF;padding:10px 14px 28px;display:flex;flex-direction:column;gap:12px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}',
    '.dltop{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:center}',
    '.dllogo{font-size:18px;letter-spacing:2px;min-width:0}.dllogo b{background:linear-gradient(90deg,#FFE14D,#FF8A3B);-webkit-background-clip:text;background-clip:text;color:transparent}',
    '.dlteam{display:inline-block;font-size:13px;letter-spacing:0;font-weight:800;color:var(--c);border:2px solid var(--c);border-radius:999px;padding:1px 9px;margin-left:6px;vertical-align:middle}',
    '.dlmid{text-align:center;display:flex;flex-direction:column;align-items:center;line-height:1.15}.dlrd{font-weight:800;font-size:12px;letter-spacing:2px;opacity:.85}.dlclock{font:900 30px/1.1 system-ui;color:#FFE14D;text-shadow:0 0 12px rgba(255,225,77,.45)}.dlsub{font-size:12px;opacity:.7}',
    '.dlright{display:flex;justify-content:flex-end;gap:8px;align-items:center;min-width:0}.dlsc{display:flex;gap:6px;align-items:center;font:900 22px/1 system-ui;white-space:nowrap}.dlsc i{font:600 12px system-ui;opacity:.6}',
    '.dlsnd{background:rgba(255,255,255,.1);border:0;border-radius:10px;font-size:18px;padding:4px 8px;cursor:pointer;color:inherit}.dlback{white-space:nowrap}',
    '.dlfield{width:100%;border-radius:16px;overflow:hidden;box-shadow:0 0 0 2px rgba(120,200,255,.25),0 10px 40px rgba(0,0,0,.5)}.dlfield canvas{display:block;width:100%;aspect-ratio:10.8/7.8}',
    '.dlbig{width:100%;max-width:calc(80vh * 1.385);margin:0 auto}',
    '.dlstrip,.dlfeed{display:flex;flex-wrap:wrap;gap:6px 22px;justify-content:center;font-weight:700}.dlstrip span{color:var(--c)}.dlstrip b{font-size:1.2em}',
    '.dlfeed{flex-direction:column;align-items:center;gap:2px;min-height:5.5em}.dlfeed p{margin:0}.dlfeed b,.dlres b{color:#FFE14D}.dlmuted{opacity:.6}',
    '.dlcard{background:rgba(255,255,255,.06);border:1px solid rgba(140,200,255,.18);border-radius:18px;padding:16px;max-width:920px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:10px}.dlcard.wide{max-width:none}.dlcard h2{margin:0;font-size:26px;text-align:center}.dlcard h3{margin:4px 0 0;text-align:center}',
    '.dlsplit{display:grid;grid-template-columns:1fr;gap:14px;align-items:start}@media (min-width:900px){.dlsplit{grid-template-columns:minmax(0,1fr) minmax(0,1.5fr)}}.dlcol{display:flex;flex-direction:column;gap:10px}',
    '.dlhow{margin:0;padding-left:1.3em;display:flex;flex-direction:column;gap:5px;font-size:17px}.dlhow b{color:#FFE14D}',
    '.dlex{background:rgba(0,0,0,.3);border:2px solid rgba(120,200,255,.35);border-radius:14px;padding:10px 14px}.dlex p{margin:4px 0}.dlexh{font-weight:900;letter-spacing:2px;color:#7FD8FF;font-size:12px}.dleqbig{font:900 26px/1.2 Georgia,serif;text-align:center;color:#FFE14D}',
    '.dlteams{display:grid;grid-template-columns:1fr 1fr;gap:10px}.dlteamcard{background:rgba(0,0,0,.25);border-radius:12px;padding:8px 10px}.dlteamcard h3{margin:0;font-size:16px;text-align:left}.dlteamcard p{margin:4px 0 0;font-size:14px;opacity:.9}',
    '.dlbody{display:grid;grid-template-columns:1fr;gap:12px}@media (min-width:860px){.dlbody{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start}}',
    '.dlleft{display:flex;flex-direction:column;gap:10px}.dlwork{background:rgba(255,255,255,.06);border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:9px}',
    '.dlmis{background:linear-gradient(135deg,rgba(255,77,94,.18),rgba(59,215,255,.14));border:2px solid rgba(255,225,77,.55);border-radius:14px;padding:10px 14px}.dlmis p{margin:6px 0;font-size:18px}.dlmish{font-weight:900;letter-spacing:2px;color:#FFE14D;font-size:13px}.dlsm{font-size:14px!important;opacity:.85}',
    '.dlA{color:#FFE14D}.dlB{color:#FF7A85}.dlS{color:#8CF2FF}.dlx{font-style:italic;font-family:Georgia,serif}',
    '.dlfr{display:inline-flex;flex-direction:column;vertical-align:middle;font-size:.68em;text-align:center;line-height:1.05;margin:0 2px}.dlfr i{font-style:normal}.dlfr i:first-child{border-bottom:2px solid currentColor}',
    '.dlgiv{background:rgba(0,0,0,.25);border-radius:12px;padding:8px 12px;text-align:center;font-size:17px;display:flex;flex-direction:column;gap:6px;align-items:center}.dlgiv b{color:#FFE14D}.dlgiv small{opacity:.8;font-size:13px}',
    '.dltbl{border-collapse:collapse}.dltbl th,.dltbl td{border:2px solid rgba(120,200,255,.5);padding:5px 12px;text-align:center;font:800 19px/1.1 system-ui;min-width:46px}.dltbl th{background:rgba(120,200,255,.18);font-style:italic;font-family:Georgia,serif}',
    '.dleq{display:flex;align-items:center;justify-content:center;gap:8px;font:900 30px/1 Georgia,serif;flex-wrap:wrap}',
    '.dlbox{min-width:92px;padding:8px 10px;border-radius:12px;border:3px solid rgba(120,200,255,.45);background:rgba(0,0,0,.35);color:#fff;font:900 28px/1 system-ui;cursor:pointer}.dlbox span{opacity:.35;font-style:italic;font-family:Georgia,serif}.dlbox.on{border-color:#FFE14D;box-shadow:0 0 14px rgba(255,225,77,.45)}',
    '.dlprev{text-align:center;font-size:15px;opacity:.85;min-height:1.4em}',
    '.dlkeys{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;max-width:340px;width:100%;margin:0 auto}.dlkeys button{font:800 21px/1 system-ui;padding:12px 0;border-radius:11px;border:0;background:#E6F0FF;color:#0c1230;box-shadow:0 3px 0 #6a7a9c;cursor:pointer}.dlkeys button:active{transform:translateY(2px);box-shadow:0 1px 0 #6a7a9c}',
    '.dlkeys .dlgo{grid-column:2 / span 3;background:linear-gradient(90deg,#FFE14D,#FF9A3B);font-size:18px}',
    '.dlfb{text-align:center;font-weight:700;color:#FFB86B;margin:0}.dlfb.good{color:#7CF2A2}',
    '.dlok,.dlno{border-radius:12px;padding:8px 12px;text-align:center;font-size:17px;display:flex;flex-direction:column;gap:3px}.dlok{background:rgba(124,242,162,.15);border:2px solid #7CF2A2}.dlno{background:rgba(255,184,107,.12);border:2px solid #FFB86B}.dlok small,.dlno small{opacity:.85;font-size:13px}',
    '.dlshh{font-weight:900;letter-spacing:1px;color:#8CF2FF;text-align:center}',
    '.dlwait{text-align:center;font-size:18px;padding:10px;line-height:1.5}.dlwait b{color:#FFE14D}',
    '.dlres{text-align:center;font-size:18px}.dlres p{margin:4px 0}',
    '.dlrecap{display:flex;flex-direction:column;gap:8px}.dlrr{display:grid;grid-template-columns:1fr 1fr;gap:10px}.dlrr>div{border:2px solid var(--c);border-radius:14px;padding:8px;text-align:center;display:flex;flex-direction:column;gap:2px;background:rgba(0,0,0,.25)}.dlrr b{color:var(--c)}.dlpts{font:900 34px/1 system-ui;color:#FFE14D}.dlrr small{opacity:.85}',
    '.dltop1,.dlbigp{text-align:center;font-size:18px;margin:4px 0}.dltop1 b,.dlbigp b{color:#FFE14D}',
    '.dlmvps{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}.dlmvps figure{margin:0;display:flex;flex-direction:column;align-items:center;border:2px solid var(--c);border-radius:16px;padding:8px 12px;background:rgba(0,0,0,.25)}.dlmvps figcaption{text-align:center;display:flex;flex-direction:column}.dlmvps small{opacity:.8}',
    '.dlmy{display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center;font-size:17px}.dlmy b{color:#FFE14D}',
    '.dl.screen .dlclock{font-size:42px}.dl.screen .dlcard h2{font-size:34px}.dl.screen .dlstrip{font-size:20px}.dl.screen .dlfeed{font-size:20px}',
    '@media (max-width:820px){.dltop{gap:6px}.dllogo{font-size:13px}.dlteam{display:block;margin:3px 0 0;width:max-content}.dlclock{font-size:22px}.dlsc{font-size:16px}.dleq{font-size:24px}.dlbox{min-width:76px;font-size:23px}.dlcard h2{font-size:21px}.dlmis p{font-size:16px}}'
  ].join('\n');
  var sty = document.createElement('style'); sty.textContent = css; document.head.appendChild(sty);

  window.SFA_DUEL = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: spot, restore: restore, duelOf: duelOf,
    sim: sim, scoreOf: scoreOf, parseF: parseF, lineThrough: lineThrough, pairScore: pairScore };   // the last few for the practice and test pages
})();
