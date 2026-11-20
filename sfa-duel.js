/* 🚀 Laser Lines: a space battle fought with straight lines. Loaded by sfa-lesson.js when the teacher starts it.

   Two fleets face each other across a coordinate grid in deep space: one fleet on the left (x < 0), the other on the
   right (x > 0). Every student's avatar stands on a grid point. Each round every student gets a secret mission: their
   own point A, and they pick a target from three enemies (easy, medium and hard lines, worth ×1, ×1.5 and ×2) and write
   the line through A and the target as y = mx + b (three tries). Every right line puts a laser in their bank (up to 4),
   and the next pick comes straight away. When the clock runs out (a minute, or sooner if every bank is full) every
   laser fires at once along the line its student typed. A right line goes through the target; a wrong one flies off where it was aimed (and might still hit
   someone). Lasers that meet head-on clash: the stronger one survives, weakened by the other's power, and two lasers of
   about the same power cancel out. Lock in sooner for a faster, stronger laser (a second or third try weakens it).
   Instead of a laser, a student can write a shield line: the shield blocks the first hit.

   Support: every student gets one of three missions, set from today's answers and adjusted each round (the teacher can
   change it): just the two points; an easy table of points on the line (x = 0, 1, 2, 3, so b and the slope show); or
   the slope and the intercept given, to put together into y = mx + b.

   Each student's row also carries their running totals for the battle (rounds, lines finished, lines right on their own,
   right with no mistakes, lines where a step was shown, the help levels they had, the no-help final volley, hits,
   damage, clashes, shield blocks, win or loss), which the teacher's Report page turns into a line for parents.

   Sync through the Sheet like Sumo Graphing: students send one running row (q "zduelx1", an x1 extra, so it never
   counts as a lesson answer). The console referees and publishes in the live counts
     zds  state (3 briefing, 1 aiming, 5 firing, 4 between rounds, 2 over), round, rounds, aim seconds, phase start
          (s after the id), briefing seconds, score 0, score 1, students, locked 0, locked 1, length of the volley
   and the spotlight (spot.q "zduel"): "P:round.page|" the roster a page at a time (fingerprint~team~x~y~index~support~
   lasers banked~name~look), "F:round.width|" the volley (see decFire), "L:" the last round's
   recap and "M:" the stars of the battle. Every screen plays the volley from the same numbers with the same
   simulation, so they all show the same battle. */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, AV = window.SFA_AVATAR;
  if (!A || !SFA || window.SFA_DUEL) return;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zduelx1', INTRO = 32, COUNT = 3, AFTER = 6, BREAK = 9, MAXL = 4, PUSH_MS = 3000, TRIES = 3, STRIES = 2;
  var XM = 9, YM = 6, WX = 10.8, WY = 7.8, TMAX = 8, LEN = 2.2, HITR = 0.42, CLASHR = 0.3;
  var TEAMS = [['Nova Squadron', 'Comet Fleet'], ['Solar Flares', 'Ion Storm'], ['Red Giants', 'Blue Dwarfs'], ['Meteor Mob', 'Quasar Crew']];
  var TE = ['🔴', '🔵'], TC = ['#FF4D5E', '#3BD7FF'], TG = ['rgba(255,77,94,', 'rgba(59,215,255,'];
  var SUP = ['Equation first', 'Step by step', 'Step by step, extra hints'], SUPE = ['✏️', '🪜', '🧭'];
  // the weapons shop: right lines earn coins (Easy 2, Medium 3, Hard 4, +1 first try; +2 a hit, +1 a laser knocked out)
  var SHOP = [
    { k: 'x', e: '⚡', n: 'Mega laser', cost: 5, say: 'Your newest laser becomes a mega laser: double power, very hard to stop.' },
    { k: 'r', e: '☄️', n: 'Meteor', cost: 8, say: 'Drops on any enemy you pick and hits everyone close to them.' },
    { k: 'h', e: '🕳️', n: 'Black hole', cost: 10, say: 'Opens in front of you and swallows enemy lasers that fly near it.' },
    { k: 'g', e: '🐐', n: 'Wild goat', cost: 14, say: 'Your newest laser becomes a wild goat stampede: it charges down your line, smashes lasers and rams every enemy in its path.' }
  ];
  var DIFF = ['Easy', 'Medium', 'Hard'], MULT = [1, 1.5, 2], DSTAR = ['★', '★★', '★★★'], DCOL = ['#7CF2A2', '#FFC94A', '#FF7A85'];

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
  // the shared effects kit (sfa-fx.js), if the page has it: J('burst', el, {…}). Never needed, never throws.
  function J(name) { var F = window.SFA_FX; if (!F || typeof F[name] !== 'function') return undefined; try { return F[name].apply(F, [].slice.call(arguments, 1)); } catch (e) { return undefined; } }
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
  // how hard a line is to write: a whole-number slope (up to 3) and intercept is easy, a fraction slope is medium,
  // a fraction intercept (or a steep slope with one) is hard
  function diffOf(P, Q) { var L = lineThrough(P, Q), m = L.m, b = L.b, iM = m[1] === 1, iB = b[1] === 1; if (iM && iB && Math.abs(m[0]) <= 3) return 0; if (iB && (iM || m[1] <= 4)) return 1; return 2; }
  function code(sp, tr) { return ((clamp(sp, 1, 9) - 1) * 3 + clamp(tr, 1, 3) - 1).toString(36); }
  function uncode(c) { var v = parseInt(c, 36) || 0; return { sp: Math.floor(v / 3) + 1, tr: v % 3 + 1 }; }
  function lineThrough(P, Q) { var m = fr(Q[1] - P[1], Q[0] - P[0]); return { m: m, b: fr(P[1] * m[1] - m[0] * P[0], m[1]) }; }

  /* =========================== the game in the live state =========================== */
  // the volley: "F:round.width|" then one group per shooter, "index=laser.laser" (index* has a shield). A right line is
  // just the target's index (width characters) and a speed-and-tries character: every screen works the line out from
  // the two points, so a whole class's lasers fit the 600-character spotlight. A wrong line is !slope_intercept_character
  // the volley: "F:round.width|" then one group per shooter, "index=token.token" (index* has a shield). A right line is
  // the target's index (width characters), a speed-and-tries character and G (wild goat) or X (mega laser): every screen
  // works the line out from the two points, so a whole class's lasers fit the 600-character spotlight. A wrong line is
  // !slope_intercept_character. R+index drops a meteor on that enemy; H opens a black hole.
  function decFire(v) {
    var bar = v.indexOf('|'), hd = (bar >= 0 ? v.slice(0, bar) : v).split('.'), w = +hd[1] || 1;
    return { r: parseInt(hd[0], 10) || 0, g: (bar >= 0 ? v.slice(bar + 1) : '').split(',').map(function (x) {
      var eq = x.indexOf('='); if (eq < 1) return null;
      var head = x.slice(0, eq), i = parseInt(head.replace('*', ''), 36), g = { i: i, sh: head.indexOf('*') >= 0, b: [], met: -1, hole: false };
      x.slice(eq + 1).split('.').forEach(function (t) {
        if (!t) return;
        var c0 = t.charAt(0);
        if (c0 === 'R') { var mi = parseInt(t.slice(1), 36); if (!isNaN(mi)) g.met = mi; return; }
        if (c0 === 'H') { g.hole = true; return; }
        if (c0 === '!') { var p = t.slice(1).split('_'), m = parseF(p[0]), b = parseF(p[1]), u = uncode(p[2] || '0'); if (m && b) g.b.push({ tg: -1, m: m, b: b, sp: u.sp, tr: u.tr, kind: '' }); return; }
        var u2 = uncode(t.charAt(w) || '0'), tg = parseInt(t.slice(0, w), 36), kd = t.charAt(w + 1);
        if (!isNaN(tg)) g.b.push({ tg: tg, sp: u2.sp, tr: u2.tr, kind: kd === 'G' ? 'g' : kd === 'X' ? 'x' : '' });
      });
      return isNaN(i) ? null : g;
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
        (bar >= 0 ? v.slice(bar + 1) : '').split(',').forEach(function (x) { var p = x.split('~'); if (p.length >= 7 && p[0]) o.ros.push({ fp: p[0], t: +p[1] ? 1 : 0, x: +p[2] || 0, y: +p[3] || 0, i: p[4] ? parseInt(p[4], 36) : -1, s: clamp(+p[5] || 0, 0, 2), k: +p[6] || 0, n: p[7] || '?', look: p[8] || '' }); });
      }
      else if (k === 'F:') o.fire = decFire(v);
      else if (k === 'M:' && v) o.mvp = v.split(',').map(function (x) { var p = x.split('~'); return { n: p[0] || '?', look: p[1] || '', dmg: +p[2] || 0, hits: +p[3] || 0, zaps: +p[4] || 0, t: +p[5] ? 1 : 0 }; });
      else if (k === 'L:') { var q = (bar >= 0 ? v.slice(0, bar) : v).split('.').map(Number), tp = (bar >= 0 ? v.slice(bar + 1) : '').split('~'); o.last = { r: q[0] || 0, pts: [q[1] || 0, q[2] || 0], hits: [q[3] || 0, q[4] || 0], zaps: [q[5] || 0, q[6] || 0], sh: [q[7] || 0, q[8] || 0], top: tp[0] ? { n: tp[0], v: tp[1] || '?', d: +tp[2] || 0 } : null }; }
    });
    return o;
  }

  /* =========================== the volley: the same simulation on every screen =========================== */
  function boltOf(r, f, byI, id) {
    var t2 = f.tg >= 0 ? byI[f.tg] : null; if (f.tg >= 0 && !t2) return null;
    var L = t2 ? lineThrough([r.x, r.y], [t2.x, t2.y]) : { m: f.m, b: f.b }, m = fval(L.m), b = fval(L.b), dir = r.t ? -1 : 1, Ln = Math.sqrt(1 + m * m);
    var goat = f.kind === 'g' && !!t2, mega = f.kind === 'x' && !!t2, pw = power(f.sp, f.tr);
    return { id: id, fp: r.fp, t: r.t, sx: r.x, sy: r.y, ox: r.x, oy: m * r.x + b, ux: dir / Ln, uy: dir * m / Ln, v: goat ? 2.8 : 3.5 + f.sp * 0.85, pw0: goat ? 999 : mega ? Math.min(240, pw * 2) : pw,
      goat: goat, mega: mega, hits: [], mult: t2 ? MULT[diffOf([r.x, r.y], [t2.x, t2.y])] : 1, aim: t2 ? t2.fp : '', pws: [], alive: true, end: TMAX, how: 'out', hit: '', by: '', dmg: 0, won: 0 };
  }
  function power(sp, tr) { return Math.round((45 + sp * 6.1) * [1, 0.8, 0.6][clamp(tr, 1, 3) - 1]); }
  function speedOf(t, alen) { return clamp(1 + Math.round(8 * Math.max(0, 1 - (t || 0) / Math.max(10, alen))), 1, 9); }
  function pwAt(b, t) { var p = b.pw0; b.pws.forEach(function (x) { if (t >= x[0]) p = x[1]; }); return p; }
  function posAt(b, t) { var d = b.v * t; return [b.ox + b.ux * d, b.oy + b.uy * d]; }
  function offMap(p) { return Math.abs(p[0]) > WX + 0.7 || Math.abs(p[1]) > WY + 0.7; }
  function sim(ros, fire) {
    var byI = {}, shields = {}, bolts = [], units = [], ev = [], holes = [], mets = [];
    ros.forEach(function (r) { if (r.i >= 0) byI[r.i] = r; });
    fire.g.forEach(function (g) { if (g.sh && byI[g.i]) shields[byI[g.i].fp] = 1; });
    ros.forEach(function (r) { units.push({ fp: r.fp, t: r.t, x: r.x, y: r.y, sh: !!shields[r.fp], used: 0 }); });
    fire.g.forEach(function (g) {
      var r = byI[g.i]; if (!r) return;
      g.b.forEach(function (f) { var b = boltOf(r, f, byI, bolts.length); if (b) bolts.push(b); });
      if (g.hole) holes.push({ fp: r.fp, t: r.t, x: r.t ? r.x - 2.2 : r.x + 2.2, y: r.y, n: 0 });   // just in front of its owner, toward the enemy
      var tm = g.met >= 0 ? byI[g.met] : null; if (tm && tm.t !== r.t) mets.push({ t: 1.4 + mets.length * 0.35, fp: r.fp, team: r.t, x: tm.x, y: tm.y, done: false });
    });
    function shieldOrHit(u, t, a, d, extra) {
      if (u.sh && !u.used) { u.used = t || 0.001; ev.push({ t: t, x: u.x, y: u.y, k: 'shield', a: a, b: u.fp }); return 0; }
      var e = { t: t, x: u.x, y: u.y, k: 'hit', a: a, b: u.fp, d: d }; Object.keys(extra || {}).forEach(function (k) { e[k] = extra[k]; }); ev.push(e); return d;
    }
    bolts.forEach(function (b) { b.pw = b.pw0; if (offMap([b.ox, b.oy])) { b.alive = false; b.end = 0; b.how = 'wild'; } });
    var dt = 1 / 120, n = Math.ceil(TMAX / dt);
    for (var k = 0; k < n; k++) {
      var t0 = k * dt, t1 = t0 + dt, live = bolts.filter(function (b) { return b.alive; });
      if (!live.length && !mets.some(function (m) { return !m.done; })) break;
      // two lasers meet: the stronger one carries on, weaker by the other's power; about the same, both go out. A wild goat smashes any laser
      for (var i = 0; i < live.length; i++) for (var j = i + 1; j < live.length; j++) {
        var a = live[i], c = live[j]; if (!a.alive || !c.alive || a.t === c.t) continue;
        var a0 = posAt(a, t0), a1 = posAt(a, t1), c0 = posAt(c, t0), c1 = posAt(c, t1), rx = a0[0] - c0[0], ry = a0[1] - c0[1], dx = (a1[0] - a0[0]) - (c1[0] - c0[0]), dy = (a1[1] - a0[1]) - (c1[1] - c0[1]), dd = dx * dx + dy * dy;
        var s = dd > 0 ? clamp(-(rx * dx + ry * dy) / dd, 0, 1) : 0, ex = rx + dx * s, ey = ry + dy * s;
        if (ex * ex + ey * ey >= (a.goat || c.goat ? 0.6 : CLASHR) * (a.goat || c.goat ? 0.6 : CLASHR)) continue;
        var tc = t0 + s * dt, pa = posAt(a, tc), pc = posAt(c, tc), X = (pa[0] + pc[0]) / 2, Y = (pa[1] + pc[1]) / 2, d = a.goat && c.goat ? 0 : a.goat ? 999 : c.goat ? -999 : a.pw - c.pw;
        if (Math.abs(d) < 10) { a.alive = c.alive = false; a.end = c.end = tc; a.how = c.how = 'cancel'; a.by = c.fp; c.by = a.fp; ev.push({ t: tc, x: X, y: Y, k: 'cancel', a: a.fp, b: c.fp }); }
        else { var w = d > 0 ? a : c, l = d > 0 ? c : a; l.alive = false; l.end = tc; l.how = 'zapped'; l.by = w.fp; if (!w.goat) { w.pw = Math.abs(d); w.pws.push([tc, w.pw]); } w.won++; ev.push({ t: tc, x: X, y: Y, k: 'clash', a: w.fp, b: l.fp, g: w.goat ? 1 : 0 }); }
      }
      live.forEach(function (b) {
        if (!b.alive) return;
        var p0 = posAt(b, t0), p1 = posAt(b, t1), sx = p1[0] - p0[0], sy = p1[1] - p0[1], L2 = sx * sx + sy * sy;
        function near(px, py) { var s2 = L2 ? clamp(((px - p0[0]) * sx + (py - p0[1]) * sy) / L2, 0, 1) : 0, qx = p0[0] + sx * s2 - px, qy = p0[1] + sy * s2 - py; return { s: s2, d2: qx * qx + qy * qy }; }
        // an enemy black hole swallows lasers that pass close by (three each); goats are too stubborn to be swallowed
        if (!b.goat) for (var h = 0; h < holes.length; h++) { var H2 = holes[h]; if (H2.t === b.t || H2.n >= 3) continue; var q = near(H2.x, H2.y); if (q.d2 < 1.1 * 1.1) { var th2 = t0 + q.s * dt; b.alive = false; b.end = th2; b.how = 'hole'; b.by = H2.fp; H2.n++; ev.push({ t: th2, x: H2.x, y: H2.y, k: 'hole', a: b.fp, b: H2.fp }); return; } }
        // a wild goat rams every enemy on its line and keeps going
        if (b.goat) { units.forEach(function (u) { if (u.t === b.t || b.hits.indexOf(u.fp) >= 0) return; var q2 = near(u.x, u.y); if (q2.d2 < HITR * HITR) { b.hits.push(u.fp); b.dmg += shieldOrHit(u, t0 + q2.s * dt, b.fp, Math.round(60 * b.mult), { g: 1 }); } }); if (offMap(p1)) { b.alive = false; b.end = t1; b.how = 'out'; } return; }
        // a laser reaches an enemy: a hit, or their shield takes it
        var best = null, bs = 2;
        units.forEach(function (u) { if (u.t === b.t) return; var q3 = near(u.x, u.y); if (q3.d2 < HITR * HITR && q3.s < bs) { bs = q3.s; best = u; } });
        if (best) {
          var th = t0 + bs * dt, wasSh = best.sh && !best.used; b.alive = false; b.end = th; b.hit = best.fp;
          b.dmg = shieldOrHit(best, th, b.fp, Math.round(b.pw * b.mult), { m: b.mult, x2: b.mega ? 1 : 0 }); b.how = wasSh ? 'shield' : 'hit';
        }
        else if (offMap(p1)) { b.alive = false; b.end = t1; b.how = 'out'; }
      });
      // meteors land
      mets.forEach(function (M) {
        if (M.done || M.t > t1) return; M.done = true;
        ev.push({ t: M.t, x: M.x, y: M.y, k: 'meteor', a: M.fp });
        units.forEach(function (u) { if (u.t !== M.team && (u.x - M.x) * (u.x - M.x) + (u.y - M.y) * (u.y - M.y) < 1.6 * 1.6) shieldOrHit(u, M.t, M.fp, 50, { src: 'm' }); });
      });
    }
    var len = 0; bolts.forEach(function (b) { b.alive = false; len = Math.max(len, b.end); }); mets.forEach(function (M) { len = Math.max(len, M.t + 0.8); });
    ev.sort(function (a, b) { return a.t - b.t; });
    return { bolts: bolts, units: units, ev: ev, holes: holes, mets: mets, len: len, B: bolts.reduce(function (o, b) { (o[b.fp] || (o[b.fp] = [])).push(b); return o; }, {}) };
  }
  // the round's points: a hit scores its power (times ×1.5 or ×2 for a medium or hard line), a shield block 20, knocking out an enemy laser 15 (10 each for a cancel)
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
      else if (e.k === 'hole') { pts[tb] += 10; zaps[tb]++; P(e.b).zaps++; }
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
  function freshST(id) { return { id: id, r: 0, bank: [], cur: null, mk: 0, sh: 0, str: 0, msg: '', good: false, coins: 0, met: '', hole: 0, miss: 0, tot: { right: 0, first: 0, hits: 0, dmg: 0, zaps: 0, blocks: 0, p: 0, hl: '', ln: 0, rv: 0, fo: 0, fr: 0, sp: 0, eq: 0 }, seen: {}, mr: 0, w: 0 }; }
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
    o.ros.forEach(function (r) { var x = V.ros[r.fp]; if (!x || x.t !== r.t || x.x !== r.x || x.y !== r.y || x.i !== r.i || x.s !== r.s || x.k !== r.k || x.look !== r.look || x.n !== r.n) { V.ros[r.fp] = r; ch = true; } });
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
    if (A.MODE === 'student' && o.state === 1 && ST.r !== o.round) { var keepTot = ST.tot, seen = ST.seen, mr = ST.mr, w0 = ST.w, coins = ST.coins || 0; ST = freshST(o.id); ST.tot = keepTot; ST.seen = seen; ST.mr = mr; ST.w = w0; ST.coins = coins; ST.r = o.round; keep(); }
    var m = me(), sig = [o.state, o.round, V.rr, V.anim ? V.anim.r : 0, A.MODE === 'student' ? [m ? m.t + '.' + m.x + '.' + m.y + '.' + m.s : '', rosList().filter(function (r) { return m && r.t !== m.t; }).length].join(',') : Object.keys(V.ros).length + (o.state === 3 || o.state === 1 ? '' : ':' + rosList().map(function (r) { return r.look; }).join('')), o.mvp.length, o.last ? o.last.r : 0].join('|');
    if (sig !== V.sig || (rch && screenish() && (o.state === 3 || o.state === 2 || o.state === 4))) { V.sig = sig; draw(); }
    else upd();
    if (prev && prev.state !== o.state) {
      if (o.state === 1) { snd('beep'); J('banner', o.round >= o.rounds ? 'FINAL VOLLEY!' : 'ROUND ' + o.round, { sub: o.round >= o.rounds ? 'No help this time' : 'Write the line. Bank a laser.', tone: 'info', ms: 1400 }); }
      if (o.state === 5 && A.MODE !== 'teach') J('countdown', { from: COUNT, left: Math.max(600, COUNT * 1000 - (sNow() - o.at)), go: 'FIRE!', sub: 'All lasers at once' });
      if (o.state === 2) { var w2 = winner(o), m2 = A.MODE === 'student' ? me() : null; if (w2 >= 0 && (!m2 || m2.t === w2)) { J('confetti', { ms: 3500, emoji: ['🚀', '⭐'] }); if (soundOn()) J('sfx', 'win'); } }
    }
    // the class screen: every laser banked pops that fleet's count, so the room sees each right answer land
    if (screenish() && prev && prev.state === 1 && o.state === 1 && prev.round === o.round && V.strip) [0, 1].forEach(function (t) {
      var d = o.lk[t] - prev.lk[t], sp = V.strip.querySelectorAll('span[style]')[t]; if (d <= 0 || !sp) return;
      J('pop', sp); J('float', sp, '+' + d + ' ⚡', { color: TC[t], size: 30 }); J('burst', sp, { count: Math.min(18, 6 + d * 4), spread: 140, colors: [TC[t], '#FFE14D', '#fff'] });
      if (soundOn()) J('sfx', 'coin');
    });
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
    // the last ten seconds of aiming: a red clock on every screen, and a tick on the class screen
    var urg = o.state === 1 && o.alen - e <= 10 && o.alen - e > 0;
    if (ck.classList.contains('dlurg') !== urg) ck.classList.toggle('dlurg', urg);
    if (urg && screenish() && soundOn()) { var sec = Math.ceil(o.alen - e); if (sec !== V.urgS) { V.urgS = sec; J('sfx', 'tick'); } }
    ck.textContent = o.state === 3 ? clock(o.intro - e) : o.state === 1 ? clock(o.alen - e) : o.state === 5 ? (e < COUNT ? String(Math.max(1, Math.ceil(COUNT - e))) : 'FIRE!') : o.state === 4 ? clock(BREAK - e) : '🏆';
    sub.textContent = o.state === 3 ? 'missions arrive in' : o.state === 1 ? 'until the lasers fire' : o.state === 5 ? 'all lasers at once' : o.state === 4 ? 'new positions, new targets' : 'battle over';
    sc.innerHTML = '<b style="color:' + TC[0] + '">' + TE[0] + ' ' + o.score[0] + '</b><i>vs</i><b style="color:' + TC[1] + '">' + o.score[1] + ' ' + TE[1] + '</b>';
  }
  function lockStrip() {
    var o = V.o, n = [0, 0]; rosList().forEach(function (r) { n[r.t]++; });
    return (o.round >= o.rounds ? '<span class="dlfinb">🏁 FINAL VOLLEY · no help!</span>' : '') + [0, 1].map(function (t) { return '<span style="--c:' + TC[t] + '">' + TE[t] + ' ' + esc(teamName(t, V.id)) + ' (' + n[t] + '): <b>' + o.lk[t] + '</b> laser' + (o.lk[t] === 1 ? '' : 's') + ' ready</span>'; }).join('');
  }
  function tickView() {
    if (A.MODE === 'student' && V.res && V.anim) V.res.innerHTML = myResult(true);
    if (screenish() && V.feed && V.anim) V.feed.innerHTML = feedHTML();
  }

  /* ---------- the battlefield: one canvas, drawn every frame ---------- */
  var IMG = {};
  function fullLk(look) { return A.fullLook ? A.fullLook(look || '') : look; }   // the fleet travels as classic looks; the console sends each student's extras (hair, outfit…) alongside
  function imgOf(look) {
    look = fullLk(look);
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
  // the wild goat, drawn once from the Switchback films' own goat (sfa-switchback.js) onto a little canvas
  var GOAT = null;
  function goatImg() {
    if (GOAT !== null) return GOAT || null;
    GOAT = false;
    function make() {
      try {
        var cv = document.createElement('canvas'); cv.width = 250; cv.height = 210; var c = cv.getContext('2d');
        var K = { c: c, W: 250, H: 210, GY: 200, INK: '#141428', CH: {}, clamp: clamp, lerp: function (a, b, t) { return a + (b - a) * t; }, ease: function (t) { return t; }, rnd: function (n) { var x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); },
          rr: function (x, y, w, h, r, f, s) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r || 0); else c.rect(x, y, w, h); if (f !== false) c.fill(); if (s !== false) c.stroke(); },
          circ: function (x, y, r, f, s) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); if (f !== false) c.fill(); if (s !== false) c.stroke(); },
          ell: function (x, y, rx, ry, f, s) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); if (f !== false) c.fill(); if (s !== false) c.stroke(); },
          txt: function (s, x, y, font, col, al) { c.font = font; c.fillStyle = col; c.textAlign = al || 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }, burst: function () { },
          gridMap: function () { return { x: function (v) { return v; }, y: function (v) { return v; } }; } };   // the rest of the film kit isn't needed for a goat
        window.SwitchbackWorld(K).goat(105, 200, 1, 0.4, { sc: 1.55, badge: false, col: '#E6DDC8' });
        GOAT = cv;
      } catch (e) { GOAT = false; }
    }
    if (window.SwitchbackWorld) make();
    else { var sc = document.createElement('script'); sc.src = 'sfa-switchback.js'; sc.onload = make; document.head.appendChild(sc); }
    return GOAT || null;
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
      if (o.state === 1 && u.k && opt.names) for (var pi = 0; pi < Math.min(MAXL, u.k); pi++) { c.fillStyle = TC[u.t]; c.shadowColor = TC[u.t]; c.shadowBlur = s * 0.2; c.beginPath(); c.arc(X + (pi - (Math.min(MAXL, u.k) - 1) / 2) * s * 0.24, Y - s * 0.78, s * 0.08, 0, 6.283); c.fill(); c.shadowBlur = 0; }
      if (opt.cands && o.state === 1) opt.cands.forEach(function (cd) { if (cd.fp !== u.fp) return; var lab = '×' + MULT[cd.d]; c.font = '900 ' + Math.max(10, s * 0.36) + 'px system-ui'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.lineWidth = s * 0.07; c.strokeStyle = '#000'; c.strokeText(lab, X, Y - s * 0.62); c.fillStyle = DCOL[cd.d]; c.fillText(lab, X, Y - s * 0.62); c.strokeStyle = DCOL[cd.d]; c.lineWidth = Math.max(1.5, s * 0.05); c.beginPath(); c.arc(X, Y, s * 0.7, 0, 6.283); c.stroke(); });
    });
    if (opt.bea && o.state === 1) { var bx = PX(F, opt.bea[0]), by = PY(F, opt.bea[1]), r1 = s * (0.32 + 0.06 * Math.sin(T * 4)); c.fillStyle = 'rgba(140,240,255,.85)'; c.beginPath(); c.moveTo(bx, by - r1); c.lineTo(bx + r1, by); c.lineTo(bx, by + r1); c.lineTo(bx - r1, by); c.closePath(); c.fill(); c.font = '900 ' + s * 0.3 + 'px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#04263a'; c.fillText('S', bx, by); }
    if (!res) return;
    // charging, then the lasers themselves
    if (ta < 0) res.bolts.forEach(function (b) { var k = (ta + COUNT) / COUNT; if (k < 0) return; var X = PX(F, b.sx), Y = PY(F, b.sy), gg = c.createRadialGradient(X, Y, 0, X, Y, s * 0.5 * k); gg.addColorStop(0, 'rgba(255,255,255,' + k + ')'); gg.addColorStop(1, TG[b.t] + '0)'); c.fillStyle = gg; c.beginPath(); c.arc(X, Y, s * 0.5 * k, 0, 6.283); c.fill(); });
    // black holes: open from the countdown, swirl until the volley ends
    if (ta >= -COUNT) (res.holes || []).forEach(function (h, hi) {
      var X = PX(F, h.x), Y = PY(F, h.y), R0 = s * 1.1, hg = c.createRadialGradient(X, Y, 0, X, Y, R0); hg.addColorStop(0, 'rgba(0,0,0,1)'); hg.addColorStop(0.55, 'rgba(40,0,70,.9)'); hg.addColorStop(1, 'rgba(160,80,255,0)');
      c.fillStyle = hg; c.beginPath(); c.arc(X, Y, R0, 0, 6.283); c.fill();
      c.strokeStyle = 'rgba(200,140,255,.85)'; c.lineWidth = Math.max(1, s * 0.05);
      for (var q = 0; q < 3; q++) { c.beginPath(); c.arc(X, Y, R0 * (0.45 + q * 0.17), T * (2 + q) + q * 2 + hi, T * (2 + q) + q * 2 + hi + 2.2); c.stroke(); }
    });
    res.bolts.forEach(function (b) {
      if (ta < 0 || ta > b.end || b.how === 'wild') return;
      var d = b.v * ta, hx = b.ox + b.ux * d, hy = b.oy + b.uy * d, td = Math.max(0, d - LEN), tx = b.ox + b.ux * td, ty = b.oy + b.uy * td, pw = pwAt(b, ta);
      if (b.goat) {   // the wild goat: Sandy Flats' own, galloping down the line in a cloud of dust
        var gx = PX(F, hx), gy = PY(F, hy), gi = goatImg(), gw = s * 1.9, bob = -Math.abs(Math.sin(ta * 14)) * s * 0.18;
        for (var du = 1; du <= 4; du++) { var dd2 = Math.max(0, d - du * 0.45); c.fillStyle = 'rgba(245,240,228,' + (0.3 - du * 0.06) + ')'; c.beginPath(); c.arc(PX(F, b.ox + b.ux * dd2), PY(F, b.oy + b.uy * dd2) + s * 0.3, s * (0.18 + du * 0.07), 0, 6.283); c.fill(); }
        c.save(); c.translate(gx, gy + bob); c.scale(b.ux < 0 ? -1 : 1, 1); c.rotate(Math.atan2(-b.uy, Math.abs(b.ux)) * (b.ux < 0 ? -1 : 1) * 0.5);
        if (gi) c.drawImage(gi, -gw / 2, -gw * 0.62, gw, gw * gi.height / gi.width); else { c.font = s * 1.2 + 'px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText('🐐', 0, 0); }
        c.restore(); return;
      }
      if (b.mega) { c.save(); c.lineCap = 'round'; c.globalAlpha = 0.45; c.shadowColor = '#fff'; c.shadowBlur = s * 0.9; c.strokeStyle = TC[b.t]; c.lineWidth = s * 0.55; c.beginPath(); c.moveTo(PX(F, tx), PY(F, ty)); c.lineTo(PX(F, hx), PY(F, hy)); c.stroke(); c.restore(); }
      c.save(); c.lineCap = 'round'; c.shadowColor = TC[b.t]; c.shadowBlur = s * 0.45; c.strokeStyle = TC[b.t]; c.lineWidth = s * (0.07 + 0.13 * Math.min(pw, 160) / 100);
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
    // meteors: a flaming rock falls, then a blast
    evs.forEach(function (e) {
      if (e.k === 'meteor' && ta >= e.t - 0.7 && ta < e.t) {
        var k = (ta - e.t + 0.7) / 0.7, X = PX(F, e.x) + (1 - k) * s * 4, Y = PY(F, e.y) - (1 - k) * s * 7, fg = c.createLinearGradient(X, Y, X + s * 1.6, Y - s * 2.8);
        fg.addColorStop(0, 'rgba(255,200,80,.95)'); fg.addColorStop(1, 'rgba(255,60,20,0)'); c.strokeStyle = fg; c.lineWidth = s * 0.45; c.lineCap = 'round'; c.beginPath(); c.moveTo(X, Y); c.lineTo(X + s * 1.6, Y - s * 2.8); c.stroke();
        c.fillStyle = '#6B4A32'; c.strokeStyle = '#2a1a10'; c.lineWidth = Math.max(1, s * 0.05); c.beginPath(); c.arc(X, Y, s * 0.32, 0, 6.283); c.fill(); c.stroke();
      }
      if ((e.k === 'meteor' || e.k === 'hole') && ta >= e.t && ta < e.t + 0.9) {
        var k2 = (ta - e.t) / 0.9, X2 = PX(F, e.x), Y2 = PY(F, e.y), big = e.k === 'meteor', bg = c.createRadialGradient(X2, Y2, 0, X2, Y2, s * (big ? 0.4 + k2 * 2 : 0.3 + k2)); c.globalCompositeOperation = 'lighter';
        bg.addColorStop(0, big ? 'rgba(255,240,200,' + (1 - k2) + ')' : 'rgba(220,170,255,' + (1 - k2) + ')'); bg.addColorStop(1, big ? 'rgba(255,90,20,0)' : 'rgba(120,40,200,0)');
        c.fillStyle = bg; c.beginPath(); c.arc(X2, Y2, s * (big ? 0.4 + k2 * 2 : 0.3 + k2), 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over';
        if (big && k2 < 0.7) { c.font = '900 ' + s * 0.55 + 'px Impact,system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = s * 0.07; c.strokeStyle = '#000'; c.strokeText('BOOM!', X2, Y2 - s * 1.2); c.fillStyle = '#FF9A3B'; c.fillText('BOOM!', X2, Y2 - s * 1.2); }
      }
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
    if (p < 0 && ta >= 0) { snd('pew'); if (V.anim.res.bolts.some(function (b) { return b.goat; })) snd('bleat'); }
    V.anim.res.ev.forEach(function (e) { if (p < e.t && ta >= e.t) snd(e.k === 'hit' ? (e.g ? 'bleat' : 'hit') : e.k === 'shield' ? 'shield' : e.k === 'hole' ? 'warp' : 'boom'); });
    V.sndT = ta;
  }

  /* ---------- what happened to a laser, in words ---------- */
  function nameOf(fp) { var r = V.ros[fp] || (V.anim && V.anim.R[fp]); return r ? r.n : '?'; }
  function boltWords(b, you) {
    var who = (you ? 'Your ' : esc(nameOf(b.fp)) + '\'s ') + (b.goat ? 'wild goat' : b.mega ? 'mega laser' : 'laser');
    if (b.goat) return b.hits.length ? '🐐 ' + who + ' rammed <b>' + b.hits.map(function (f) { return esc(nameOf(f)); }).join(', ') + '</b> for <b>' + b.dmg + '</b>!' + (b.won ? ' It smashed ' + b.won + ' laser' + (b.won > 1 ? 's' : '') + ' on the way.' : '') : '🐐 ' + who + ' stampeded off into space' + (b.won ? ', smashing ' + b.won + ' laser' + (b.won > 1 ? 's' : '') : '') + '.';
    if (b.how === 'hit') return '💥 ' + who + ' hit <b>' + esc(nameOf(b.hit)) + '</b> for <b>' + b.dmg + '</b>' + (b.mult > 1 ? ' (×' + b.mult + ' for a ' + (b.mult >= 2 ? 'hard' : 'medium') + ' line)' : '') + '!' + (b.won ? ' It knocked out ' + b.won + ' laser' + (b.won > 1 ? 's' : '') + ' on the way.' : '');
    if (b.how === 'shield') return '🛡️ ' + who + ' hit <b>' + esc(nameOf(b.hit)) + '</b>, but their shield blocked it.';
    if (b.how === 'hole') return '🕳️ ' + who + ' fell into <b>' + esc(nameOf(b.by)) + '</b>\'s black hole.';
    if (b.how === 'zapped') return '⚡ ' + who + (b.aim ? ' at ' + esc(nameOf(b.aim)) : '') + ' was knocked out by <b>' + esc(nameOf(b.by)) + '</b>\'s stronger laser.';
    if (b.how === 'cancel') return '✨ ' + who + (b.aim ? ' at ' + esc(nameOf(b.aim)) : '') + ' and <b>' + esc(nameOf(b.by)) + '</b>\'s cancelled each other out.';
    if (b.how === 'wild') return '🌀 ' + who + '\'s line doesn\'t even come onto the grid near ' + (you ? 'you' : 'them') + '.';
    return '🌌 ' + who + ' flew off into space' + (b.won ? ' (after knocking out ' + b.won + ' laser' + (b.won > 1 ? 's' : '') + ')' : '') + '.';
  }
  function myResult(live) {
    var A2 = V.anim, mf = myFp(); if (!A2) return '';
    var bs = A2.res.B[mf] || [], ta = live ? animT() : 99, out = [], flying = bs.filter(function (b) { return ta < b.end; }).length, ev = A2.res.ev.filter(function (e) { return ta >= e.t; });
    if (!bs.length && !A2.res.mets.some(function (M) { return M.fp === mf; }) && !A2.res.holes.some(function (h) { return h.fp === mf; })) out.push('😶 No lasers this round: you didn\'t lock in a line.');
    bs.forEach(function (b) { if (ta >= b.end) out.push(boltWords(b, true)); });
    if (flying) out.push('🚀 ' + (flying === 1 ? 'Your ' + (bs.filter(function (b) { return ta < b.end; })[0].goat ? 'goat is' : 'laser is') : flying + ' of your lasers are') + ' flying…');
    var mh = ev.filter(function (e) { return e.k === 'hit' && e.src === 'm' && e.a === mf; });
    if (ev.some(function (e) { return e.k === 'meteor' && e.a === mf; })) out.push(mh.length ? '☄️ Your meteor hit <b>' + mh.map(function (e) { return esc(nameOf(e.b)); }).join(', ') + '</b> for <b>' + mh.reduce(function (a, e) { return a + e.d; }, 0) + '</b>!' : '☄️ Your meteor landed, but shields saved them.');
    var hs = ev.filter(function (e) { return e.k === 'hole' && e.b === mf; }).length; if (hs) out.push('🕳️ Your black hole swallowed <b>' + hs + '</b> laser' + (hs > 1 ? 's' : '') + '!');
    ev.forEach(function (e) { if (e.b === mf) { if (e.k === 'hit') out.push('😵 ' + esc(nameOf(e.a)) + (e.src === 'm' ? '\'s meteor' : e.g ? '\'s wild goat' : '') + ' hit you for ' + e.d + '.'); if (e.k === 'shield') out.push('🛡️ Your shield blocked ' + esc(nameOf(e.a)) + '!'); } });
    return out.map(function (x) { return '<p>' + x + '</p>'; }).join('');
  }
  function feedHTML() {
    var ta = animT(), ev = V.anim.res.ev.filter(function (e) { return ta >= e.t && e.k !== 'meteor'; }).slice(-4).reverse();
    return ev.map(function (e) {
      if (e.k === 'hit') return '<p>' + (e.src === 'm' ? '☄️' : e.g ? '🐐' : '💥') + ' <b>' + esc(nameOf(e.a)) + '</b>' + (e.src === 'm' ? '\'s meteor hit' : e.g ? '\'s wild goat rammed' : ' hit') + ' <b>' + esc(nameOf(e.b)) + '</b> for ' + e.d + '</p>';
      if (e.k === 'shield') return '<p>🛡️ <b>' + esc(nameOf(e.b)) + '</b>\'s shield blocked <b>' + esc(nameOf(e.a)) + '</b></p>';
      if (e.k === 'hole') return '<p>🕳️ <b>' + esc(nameOf(e.b)) + '</b>\'s black hole swallowed <b>' + esc(nameOf(e.a)) + '</b>\'s laser</p>';
      if (e.k === 'clash') return '<p>' + (e.g ? '🐐' : '⚡') + ' <b>' + esc(nameOf(e.a)) + '</b>\'s ' + (e.g ? 'goat smashed' : 'laser beat') + ' <b>' + esc(nameOf(e.b)) + '</b>\'s laser</p>';
      return '<p>✨ <b>' + esc(nameOf(e.a)) + '</b> and <b>' + esc(nameOf(e.b)) + '</b> cancelled out</p>';
    }).join('') || '<p class="dlmuted">Watch the lasers…</p>';
  }
  /* ---------- the class screen (and the teacher's "Show the battle") ---------- */
  function rules(big) {
    return '<ol class="dlhow"><li>🎯 <b>Pick a target</b>: easy, medium or hard. Harder lines score <b>×1.5</b> or <b>×2</b>.</li><li>✏️ Write the line from you to them, <b>y = mx + b</b>: type the whole equation, or work it out <b>step by step</b> (the slope formula, then b). Every right line puts a <b>laser in your bank</b> (up to ' + MAXL + ') and earns 🪙 coins.</li>' +
      '<li>⏱️ When the clock hits zero, <b>every laser fires at once</b> along your line. Lock in sooner for a <b>faster, stronger</b> laser.</li>' +
      (big ? '<li>🛒 Save your coins for the shop: ⚡ mega laser, ☄️ meteor, 🕳️ black hole… and the 🐐 <b>wild goat</b>.</li>' : '') + '</ol>';
  }
  // the tutorial: worked examples, a different line each time (easy, medium, hard in turn), one step at a time
  function exProblem(n, salt) {
    var R = rng(hash('ex' + n + ':' + (salt || 0))), want = n % 3;
    for (var t = 0; t < 600; t++) {
      var P = [-(1 + Math.floor(R() * 8)), Math.floor(R() * 13) - 6], Q = [1 + Math.floor(R() * 8), Math.floor(R() * 13) - 6], L = lineThrough(P, Q);
      if (diffOf(P, Q) !== want || L.m[0] === 0 || L.m[1] > 4 || L.b[1] > 4 || Math.abs(fval(L.b)) > 12) continue;   // friendly fractions for a worked example
      return { A: P, B: Q, m: L.m, b: L.b, d: want, s: 0 };
    }
    return { A: [-4, 1], B: [2, 4], m: [1, 2], b: [3, 1], d: 1, s: 0 };
  }
  function par(v) { return v < 0 ? '(' + nm(v) + ')' : String(v); }
  function mini(P, step) {
    var X = function (x) { return 80 + x * 7.4; }, Y = function (y) { return 60 - y * 7.4; }, o = '<svg class="dlmini" viewBox="0 0 160 120" aria-hidden="true"><rect width="160" height="120" rx="10" fill="#070a1e"/>';
    for (var x = -10; x <= 10; x += 2) o += '<path d="M' + X(x) + ' 4V116" stroke="rgba(130,200,255,.12)"/>';
    for (var y = -6; y <= 6; y += 2) o += '<path d="M4 ' + Y(y) + 'H156" stroke="rgba(130,200,255,.12)"/>';
    o += '<path d="M4 60H156M80 4V116" stroke="rgba(160,225,255,.55)" stroke-width="1.2"/>';
    var A1 = P.A, B1 = P.B;
    if (step >= 1) o += '<path d="M' + X(A1[0]) + ' ' + Y(A1[1]) + 'H' + X(B1[0]) + 'V' + Y(B1[1]) + '" fill="none" stroke="#FFE14D" stroke-width="1.4" stroke-dasharray="3 3"/>';
    if (step >= 3) { var m = fval(P.m), b = fval(P.b); o += '<path d="M' + X(-10.5) + ' ' + Y(m * -10.5 + b) + 'L' + X(10.5) + ' ' + Y(m * 10.5 + b) + '" stroke="#3BD7FF" stroke-width="2.2"/>'; }
    if (step >= 2) o += '<circle cx="80" cy="' + Y(fval(P.b)) + '" r="3.2" fill="#8CF2FF"/>';
    o += '<circle cx="' + X(A1[0]) + '" cy="' + Y(A1[1]) + '" r="4" fill="#FFE14D"/><circle cx="' + X(B1[0]) + '" cy="' + Y(B1[1]) + '" r="4" fill="#FF5B6B"/>';
    return o + '</svg>';
  }
  function tutorial(box) {
    var w = H('div', 'dltut'), salt = Math.floor(Math.random() * 1e6), n = salt % 3, step = 0, P = exProblem(n, salt), iv = null;
    box.appendChild(w);
    function show() {
      if (!w.isConnected) { if (w._on) clearInterval(iv); return; }   // not on the page yet (the card is still being built), or gone
      w._on = 1;
      var A1 = P.A, B1 = P.B, mx = fr(P.m[0] * A1[0], P.m[1]);
      var dy = B1[1] - A1[1], dx = B1[0] - A1[0];
      var S = ['You are at <b class="dlA">A' + pt(A1[0], A1[1]) + '</b> (point 1). Your target is at <b class="dlB">B' + pt(B1[0], B1[1]) + '</b> (point 2).',
        '<b>Plug into the slope formula</b>: m = (y₂ − y₁) ÷ (x₂ − x₁) = (' + nm(B1[1]) + ' − ' + par(A1[1]) + ') ÷ (' + nm(B1[0]) + ' − ' + par(A1[0]) + ')',
        '<b>Work out the slope</b>: ' + nm(dy) + ' ÷ ' + nm(dx) + ' = <b>' + fhtml(P.m) + '</b>',
        '<b>Plug a point into y = mx + b</b>: point A gives ' + nm(A1[1]) + ' = ' + fhtml(P.m) + ' × ' + par(A1[0]) + ' + b',
        '<b>Solve for b</b>: ' + nm(A1[1]) + ' = ' + fhtml(mx) + ' + b, so <b>b = ' + fhtml(P.b) + '</b>',
        'The equation: slope <b>' + fhtml(P.m) + '</b>, b = <b>' + fhtml(P.b) + '</b> <span class="dleqbig">' + eqHTML(P.m, P.b) + '</span>'];
      w.innerHTML = '<div class="dlexh">HOW TO AIM · EXAMPLE ' + (n - salt % 3 + 1) + ' <span class="dld" style="--d:' + DCOL[P.d] + '">' + DIFF[P.d] + '</span></div><div class="dltutg">' + mini(P, step >= 5 ? 3 : step >= 4 ? 2 : step >= 1 ? 1 : 0) +
        '<ol>' + S.map(function (x, i) { return '<li class="' + (i <= step ? 'on' : '') + '">' + x + '</li>'; }).join('') + '</ol></div>';
      step++; if (step > 7) { step = 0; n++; P = exProblem(n, salt); }
    }
    iv = setInterval(show, 2100); setTimeout(show, 0);
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
    l.innerHTML = rules(true); tutorial(l); l.appendChild(teamLists());
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
    return '<div class="dlmvps">' + o.mvp.map(function (m, i) { return '<figure style="--c:' + TC[m.t] + '">' + (AV ? AV.svg(fullLk(m.look), { size: 110, walk: true }) : '') + '<figcaption><b>' + ['🥇', '🥈', '🥉'][i] + ' ' + esc(m.n) + '</b><small>' + m.dmg + ' damage · ' + m.hits + ' hit' + (m.hits === 1 ? '' : 's') + ' · ' + m.zaps + ' clash' + (m.zaps === 1 ? '' : 'es') + '</small></figcaption></figure>'; }).join('') + '</div>';
  }
  function winner(o) { return o.score[0] === o.score[1] ? -1 : o.score[0] > o.score[1] ? 0 : 1; }
  // the winning fleet (both fleets in a draw) jumps for joy under the headline
  function paradeHTML(w) {
    if (!AV) return '';
    var L = rosList().filter(function (r) { return w < 0 || r.t === w; }).slice(0, 18); if (!L.length) return '';
    return '<div class="dlparade">' + L.map(function (r, i) { return '<span style="--c:' + TC[r.t] + ';animation-delay:' + (i * 0.11).toFixed(2) + 's">' + AV.svg(fullLk(r.look), { size: 64 }) + '<b>' + esc(r.n) + '</b></span>'; }).join('') + '</div>';
  }
  function scrEnd() {
    var o = V.o, w = winner(o), c = H('div', 'dlcard wide');
    c.innerHTML = '<h2>' + (w < 0 ? '🤝 A draw in deep space! ' + o.score[0] + ' – ' + o.score[1] : '🏆 ' + TE[w] + ' ' + esc(teamName(w, V.id)) + ' win the battle, ' + Math.max(o.score[0], o.score[1]) + ' – ' + Math.min(o.score[0], o.score[1]) + '!') + '</h2>' +
      paradeHTML(w) + (o.mvp.length ? '<h3>Stars of the battle</h3>' + mvpHTML(o) : '') + recapHTML(o.last);
    root.appendChild(c); if (w >= 0 && A.confetti && !window.SFA_FX) try { A.confetti(); } catch (e) { }
  }

  /* ---------- a student's screens ---------- */
  function stIntro() {
    var m = me(), c = H('div', 'dlcard');
    c.innerHTML = '<h2>' + TE[m.t] + ' You fly with <span style="color:' + TC[m.t] + '">' + esc(teamName(m.t, V.id)) + '</span></h2>' + rules(true);
    root.appendChild(c);
    var body = H('div', 'dlbody'), l = H('div', 'dlcard'), r = H('div', 'dlwork');
    tutorial(l); body.appendChild(l); body.appendChild(r); root.appendChild(body);
    if (!V.pcur) { var n0 = Math.floor(Math.random() * 3), s0 = Math.floor(Math.random() * 1e6); V.pcur = newCur('P', '', exProblem(n0, s0), false); V.pcur.mode = 'steps'; V.pcur.n = n0; V.pcur.salt = s0; V.pcur.done = 0; }
    V.work = r; drawPractice();
  }
  // the warm-up during the briefing: a line to try on your own device, not scored
  function drawPractice() {
    var box = V.work, p = V.pcur; if (!box || !p) return;
    var Q = exProblem(p.n, p.salt); Q.s = 1;
    box.innerHTML = '<div class="dlshh">🎯 WARM-UP' + (p.done ? ' · ' + p.done + ' right' : '') + ' <span class="dld" style="--d:' + DCOL[Q.d] + '">' + DIFF[Q.d] + '</span></div><p class="dlc">Not scored. You at <b class="dlA">A' + pt(Q.A[0], Q.A[1]) + '</b>, target at <b class="dlB">B' + pt(Q.B[0], Q.B[1]) + '</b>.</p>' +
      stepsHTML(Q, p, 3, 'B') + keysHTML(goLabel(p, '✓ Check the line'), false, p) + (p.msg ? '<p class="dlfb' + (p.good ? ' good' : '') + '">' + p.msg + '</p>' : '');
    [].forEach.call(box.querySelectorAll('[data-k]'), function (b) { b.onclick = function () { pressP(b.getAttribute('data-k')); }; });
    [].forEach.call(box.querySelectorAll('[data-v]'), function (b) { b.onclick = function () { p.box = b.getAttribute('data-v'); drawPractice(); }; });
    [].forEach.call(box.querySelectorAll('[data-b]'), function (b) { b.onclick = function () { p.act = b.getAttribute('data-b'); drawPractice(); }; });
  }
  function pressP(k) {
    var p = V.pcur; if (!p || V.o.state !== 3) return;
    if (k === 'mode') { p.mode = p.mode === 'eq' ? 'steps' : 'eq'; p.msg = ''; return drawPractice(); }
    if (k === 'go') {
      var Q = exProblem(p.n, p.salt); Q.s = 1; var R = stepCheck(p, Q, 3, 'B');
      if (R.r === 'done') {
        var nx = newCur('P', '', Q, false); nx.n = p.n + 1; nx.salt = p.salt; nx.done = p.done + 1; nx.mode = p.mode;
        nx.msg = '🎯 ' + eqHTML(Q.m, Q.b) + '. Spot on! Here\'s another.'; nx.good = true; V.pcur = nx; snd('lock');
      }
      else { p.msg = R.msg; p.good = R.r === 'next'; snd(R.r === 'next' ? 'lock' : 'nope'); }
      return drawPractice();
    }
    typeInto(p, k); p.msg = ''; drawPractice();
  }
  function final() { return !!(V && V.o && V.o.round >= V.o.rounds); }
  function supOf(m) { return final() ? 0 : m.s; }
  // the steps: plug the points into the slope formula, work the slope out, plug a point into y = mx + b, solve for b.
  // The student types every number; we never show the slope or b, only where their own numbers go
  var SN = { f: 'Plug the points into the slope formula', m: 'Work out the slope', p: 'Plug a point into y = mx + b', b: 'Solve for b' };
  var BOXES = { f: ['y2', 'y1', 'x2', 'x1'], m: ['m'], p: ['py', 'pm', 'px'], b: ['b'] }, STEPS = ['f', 'm', 'p', 'b'];

  function newCur(k, tg, Q, fin) { return { k: k, tg: tg || '', mode: fin || !Q.s ? 'eq' : 'steps', used: fin || !Q.s ? '' : 's', fin: !!fin, steps: STEPS, si: 0, box: 'y2', v: { y2: '', y1: '', x2: '', x1: '', m: '', py: '', pm: '', px: '', b: '' }, m: '', b: '', act: 'm', sm: 0, miss: 0, tr: 0 }; }

  // each step written out with the student's own numbers (B is the target, or S the shield beacon)
  function bxv(cur, key, ph) { return '<button type="button" class="dlbox sm' + (cur.box === key ? ' on' : '') + '" data-v="' + key + '">' + (esc(cur.v[key]) || '<span>' + ph + '</span>') + '</button>'; }
  function fv(s) { var f = parseF(s); return f ? fhtml(f) : esc(s); }
  function pv(s) { var f = parseF(s); return f ? (f[0] < 0 ? '(' + fhtml(f) + ')' : fhtml(f)) : esc(s); }
  // one step's working: boxes while it's the active step, the student's own numbers once it's done
  function stepBody(Q, cur, st, done) {
    var v = cur.v, slope = 'm = (' + fv(v.y2) + ' − ' + pv(v.y1) + ') ÷ (' + fv(v.x2) + ' − ' + pv(v.x1) + ')', tick = ' <b class="dlsv">✓</b>';
    if (st === 'f') return done ? slope + tick : 'm = ( ' + bxv(cur, 'y2', 'y₂') + ' − ' + bxv(cur, 'y1', 'y₁') + ' ) ÷ ( ' + bxv(cur, 'x2', 'x₂') + ' − ' + bxv(cur, 'x1', 'x₁') + ' )';
    if (st === 'm') return slope + ' = ' + (done ? '<b class="dlsv">' + fhtml(Q.m) + '</b>' + tick : bxv(cur, 'm', '?'));
    if (st === 'p') return done ? fv(v.py) + ' = ' + fv(v.pm) + ' × ' + pv(v.px) + ' + b' + tick : bxv(cur, 'py', 'y') + ' = ' + bxv(cur, 'pm', 'm') + ' × ' + bxv(cur, 'px', 'x') + ' + b';
    return fv(v.py) + ' = ' + fv(v.pm) + ' × ' + pv(v.px) + ' + b, so b = ' + (done ? '<b class="dlsv">' + fhtml(Q.b) + '</b>' + tick : bxv(cur, 'b', '?'));
  }

  // the active step's row has the only box; finished steps show their answer with a tick; the equation fills in below
  function stepsHTML(Q, cur, max, bn) {
    if (cur.mode === 'eq') return eqBoxes(cur, max) + (cur.fin ? '' : '<button type="button" class="dlalt" data-k="mode">🪜 Walk me through it, step by step</button>');
    var out = '<div class="dlpts">Point 1: <b class="dlA">A' + pt(Q.A[0], Q.A[1]) + '</b> · Point 2: <b class="dlB">' + bn + pt(Q.B[0], Q.B[1]) + '</b>' + (Q.s >= 2 ? '<small>x₁ and y₁ come from point 1, x₂ and y₂ from point 2</small>' : '') + '</div><ol class="dlsteps">';
    cur.steps.forEach(function (st, i) {
      var done = i < cur.si, on = i === cur.si;
      out += '<li class="' + (done ? 'done' : on ? 'on' : '') + '"><div class="dlsn">Step ' + (i + 1) + ' of ' + cur.steps.length + ' · <b>' + SN[st] + '</b></div>' + (done || on ? '<div class="dlse">' + stepBody(Q, cur, st, done) + '</div>' : '') + '</li>';
    });
    out += '</ol><div class="dleqline"><i class="dlx">y</i> = ' + (cur.si > 1 ? '<b class="dlsv">' + fhtml(Q.m) + '</b>' : '<span class="dlq">slope</span>') + '<i class="dlx">x</i> + ' + (cur.si > 3 ? '<b class="dlsv">' + fhtml(Q.b) + '</b>' : '<span class="dlq">b</span>') + '</div>';
    if (cur.miss && cur.k !== 'P') out += '<div class="dlprev">' + cur.miss + ' miss' + (cur.miss === 1 ? '' : 'es') + ' so far: each one makes the laser a little weaker.</div>';
    return out + '<button type="button" class="dlalt" data-k="mode">✏️ I know it: write the whole equation</button>';
  }
  function goLabel(cur, lock) { return cur.mode === 'steps' && cur.si < 3 ? 'Check ▶' : lock; }
  // checks the active step (or, in the final volley, the whole line): next, done, miss, out (final volley only) or blank
  // checks the whole equation (equation mode) or the active step: next, done, miss, out (final volley only) or blank
  function stepCheck(cur, Q, max, bn) {
    var A1 = Q.A, B1 = Q.B;
    if (cur.mode === 'eq') {
      var gm = parseF(cur.m), gb = parseF(cur.b);
      if (!gm || !gb) return { r: 'blank', msg: 'Fill in both boxes: the slope and b.' };
      cur.m = fstr(gm); cur.b = fstr(gb);
      if (feq(gm, Q.m) && feq(gb, Q.b)) return { r: 'done', gm: gm, gb: gb };
      cur.miss++;
      if (cur.fin) return cur.miss >= max ? { r: 'out', miss: 1, gm: gm, gb: gb } : { r: 'miss', miss: 1, msg: '❌ Not quite. No hints in the final volley: ' + (max - cur.miss) + ' tr' + (max - cur.miss === 1 ? 'y' : 'ies') + ' left.' };
      return { r: 'miss', miss: 1, msg: '❌ Not quite. ' + (feq(gm, Q.m) ? 'The slope is right: check b by putting a point into y = mx + b.' : feq(gb, Q.b) ? 'b is right: check the slope, change in y ÷ change in x.' : 'Start with the slope: change in y ÷ change in x.') + ' Or walk through it step by step.' };
    }
    var st = cur.steps[cur.si], v = cur.v, P = function (k) { return parseF(v[k]); }, hard = Q.s >= 2 || cur.sm >= 1;
    function blank(n) { return { r: 'blank', msg: n > 1 ? 'Fill in all ' + (n === 4 ? 'four' : 'three') + ' boxes (tap a box, or Next box, to move).' : 'Type a number in the box first.' }; }
    function ok() { cur.si++; cur.sm = 0; cur.box = cur.si < cur.steps.length ? BOXES[cur.steps[cur.si]][0] : ''; return { r: cur.si >= cur.steps.length ? 'done' : 'next', msg: '✅ Right.' + (cur.si < cur.steps.length ? ' Now: ' + SN[cur.steps[cur.si]].toLowerCase() + '.' : '') }; }
    function bad(m) { cur.miss++; cur.sm++; return { r: 'miss', miss: 1, msg: '❌ ' + m }; }
    if (st === 'f') {
      var g = BOXES.f.map(P); if (g.some(function (x) { return !x; })) return blank(4);
      var n = g.map(fval), fw = n[0] === B1[1] && n[1] === A1[1] && n[2] === B1[0] && n[3] === A1[0], bw = n[0] === A1[1] && n[1] === B1[1] && n[2] === A1[0] && n[3] === B1[0];
      if (fw || bw) return ok();
      var topOk = (n[0] === B1[1] && n[1] === A1[1]) || (n[0] === A1[1] && n[1] === B1[1]), botOk = (n[2] === B1[0] && n[3] === A1[0]) || (n[2] === A1[0] && n[3] === B1[0]);
      var flip = (n[0] === B1[0] || n[0] === A1[0]) && (n[2] === B1[1] || n[2] === A1[1]);
      if (topOk && botOk) return bad('Same order top and bottom: if y₂ is ' + bn + '\'s y, then x₂ has to be ' + bn + '\'s x too.');
      if (flip) return bad('The y-values go on top and the x-values go on the bottom.');
      return bad(hard ? 'y₂ and x₂ both come from point 2 (' + bn + '), y₁ and x₁ from point 1 (A). In a point (x, y), the y is the second number.' : 'Each box takes a number from the two points: y-values on top, x-values on the bottom.');
    }
    if (st === 'm') {
      var gm2 = P('m'); if (!gm2) return blank(1);
      if (feq(gm2, Q.m)) { cur.m = fstr(Q.m); return ok(); }
      return bad(hard ? 'Work out the top and the bottom on their own first: taking away a negative is the same as adding. Then divide. A negative ÷ a positive is negative, and a fraction like 3/4 is fine.' : 'Work out the top, then the bottom, then divide. If it doesn\'t divide evenly, type a fraction like 3/4.');
    }
    if (st === 'p') {
      var py = P('py'), pm = P('pm'), px = P('px'); if (!py || !pm || !px) return blank(3);
      if (!feq(pm, Q.m)) return bad('The m box takes the slope you just worked out.');
      var X = fval(px), Y = fval(py);
      if ((X === A1[0] && Y === A1[1]) || (X === B1[0] && Y === B1[1])) return ok();
      if ((Y === A1[0] && X === A1[1]) || (Y === B1[0] && X === B1[1])) return bad('Swap them: the point\'s y goes on the left, its x goes after the ×.');
      return bad('Pick one point, A or ' + bn + ', and use both of its numbers: its y on the left, its x after the ×.');
    }
    var gb2 = P('b'); if (!gb2) return blank(1);
    if (feq(gb2, Q.b)) { cur.b = fstr(Q.b); return ok(); }
    return bad(hard ? 'Work out ' + fv(v.pm) + ' × ' + pv(v.px) + ' first. Then b is what you add to that to get ' + fv(v.py) + '. (Or take it away: b = y − m × x.)' : 'Work out m × x first. Then ask: what do you add to that to get y?');
  }
  function typeInto(cur, k) {
    if (cur.mode === 'steps') {
      var bs = BOXES[cur.steps[cur.si]] || [];
      if (k === '⇄') { var i = bs.indexOf(cur.box); cur.box = bs[(i + 1) % bs.length]; return; }
      if (bs.indexOf(cur.box) < 0) cur.box = bs[0];
      cur.v[cur.box] = edit(cur.v[cur.box] || '', k);
    }
    else { if (k === '⇄') { cur.act = cur.act === 'm' ? 'b' : 'm'; return; } cur[cur.act] = edit(cur[cur.act] || '', k); }
  }
  function edit(v, k) {
    if (k === '⇄') return v;
    if (k === '⌫') return v.slice(0, -1);
    if (k === '−') return v.charAt(0) === '-' ? v.slice(1) : '-' + v;
    if (v.length < 7 && !(k === '/' && (v.indexOf('/') >= 0 || v.indexOf('.') >= 0)) && !(k === '.' && (v.indexOf('.') >= 0 || v.indexOf('/') >= 0))) v += k;
    return v;
  }
  function ready() { var m = me(); return m && V.rr === V.o.round ? m : null; }
  function Qof(m, tg) { var L = lineThrough([m.x, m.y], [tg.x, tg.y]); return { me: m, tg: tg, A: [m.x, m.y], B: [tg.x, tg.y], m: L.m, b: L.b, s: supOf(m), d: diffOf([m.x, m.y], [tg.x, tg.y]) }; }
  // three targets to pick from, one of each difficulty where the grid allows, not ones already in the bank if possible
  // (the same three on a reload)
  function cands(m) {
    var R = rng(hash(m.fp + ':' + V.o.round + ':' + ST.mk + ':' + Math.round(V.id / 1000))), used = {}, by = [[], [], []], out = [], foes = rosList().filter(function (r) { return r.t !== m.t && r.y !== m.y; });   // never a flat line (slope zero): it skips the slope steps
    ST.bank.forEach(function (x) { if (x.tg) used[x.tg] = 1; });
    foes.forEach(function (r) { by[diffOf([m.x, m.y], [r.x, r.y])].push(r); });
    by.forEach(function (L, d) { if (!L.length) return; var fr2 = L.filter(function (r) { return !used[r.fp]; }), P = fr2.length ? fr2 : L; out.push({ r: P[Math.floor(R() * P.length)], d: d }); });
    var rest = shuffle(foes.filter(function (r) { return !out.some(function (o) { return o.r.fp === r.fp; }); }), R);
    while (out.length < 3 && rest.length) { var r = rest.shift(); out.push({ r: r, d: diffOf([m.x, m.y], [r.x, r.y]) }); }
    return out.sort(function (a, b) { return a.d - b.d; });
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
    var L2 = lineThrough([m.x, m.y], B); return { A: [m.x, m.y], B: B, m: L2.m, b: L2.b, s: supOf(m) };
  }
  function stAim() {
    var m = ready();
    if (!m) { root.appendChild(H('div', 'dlcard', '<h2>🛰️ Receiving your coordinates…</h2><p>Your position is on the way from the command ship. A few seconds.</p>')); return; }
    if (ST.mr !== V.o.round) { ST.mr = V.o.round; ST.tot.p = (ST.tot.p || 0) + 1; if (String(ST.tot.hl || '').indexOf(String(supOf(m))) < 0) ST.tot.hl = String(ST.tot.hl || '') + supOf(m); keep(); }   // a round played, and the help it came with (for the report)
    var body = H('div', 'dlbody'), left = H('div', 'dlleft'), right = H('div', 'dlwork');
    V.mis = H('div', 'dlmis'); left.appendChild(V.mis);
    V.aimOpt = { small: true }; field(left, V.aimOpt);
    body.appendChild(left); body.appendChild(right); root.appendChild(body);
    V.work = right; drawWork();
  }
  function tableHTML(Q) {
    var q = Q.m[1], xs = [0, q, 2 * q, 3 * q];
    return '<table class="dltbl"><tr><th>x</th>' + xs.map(function (x) { return '<td>' + nm(x) + '</td>'; }).join('') + '</tr><tr><th>y</th>' + xs.map(function (x) { return '<td>' + fhtml(fr(Q.m[0] * x * Q.b[1] + Q.b[0] * q, q * Q.b[1])) + '</td>'; }).join('') + '</tr></table>';
  }
  function scaffold(Q, what) {
    if (final()) return '<div class="dlgiv dlfin">🏁 <b>Final volley: no help.</b> Just the two points: write the whole equation yourself.</div>';
    return '';
  }
  function hint(Q, gm, gb) {
    var mOk = feq(gm, Q.m), bOk = feq(gb, Q.b), A1 = Q.A, B1 = Q.B;
    if (Q.s === 2) return mOk ? 'The slope is right. The intercept b goes on the end: + ' + fstr(Q.b) + '.' : 'The slope m goes in front of x. Check the numbers you were given.';
    if (Q.s === 1) return mOk ? 'Slope ✓. Now b: it\'s the y value when x = 0, the first column of the table.' : Q.m[1] === 1 ? 'Look along the table: each time x goes up by 1, y changes by the same amount. That change is the slope.' : 'x goes up by ' + Q.m[1] + ' each step. Slope = change in y ÷ ' + Q.m[1] + '.';
    if (!mOk) return 'Slope = change in y ÷ change in x = (' + nm(B1[1]) + ' − ' + (A1[1] < 0 ? '(' + nm(A1[1]) + ')' : A1[1]) + ') ÷ (' + nm(B1[0]) + ' − ' + (A1[0] < 0 ? '(' + nm(A1[0]) + ')' : A1[0]) + ').';
    if (!bOk) return 'Slope ✓. Now put your point into y = mx + b: ' + nm(A1[1]) + ' = ' + fstr(Q.m) + ' × ' + (A1[0] < 0 ? '(' + nm(A1[0]) + ')' : A1[0]) + ' + b. Solve for b.';
    return '';
  }
  function bankHTML() { var s = ''; for (var i = 0; i < MAXL; i++) { var x = ST.bank[i]; s += '<i class="' + (x ? (x.ok ? 'on' : 'bad') : '') + '">' + (x && x.u === 'g' ? '🐐' : x && x.u === 'x' ? '⚡' : '') + '</i>'; } return '<span class="dlbank">' + s + '</span>'; }
  function upTarget() { for (var i = ST.bank.length - 1; i >= 0; i--) if (ST.bank[i].ok && !ST.bank[i].u) return i; return -1; }
  function shopWhy(it) {
    if (V.o.state !== 1) return 'Opens while aiming';
    if ((it.k === 'x' || it.k === 'g') && upTarget() < 0) return 'Bank a right line first';
    if (it.k === 'r' && ST.met) return 'One meteor a volley';
    if (it.k === 'h' && ST.hole) return 'One black hole a volley';
    if ((ST.coins || 0) < it.cost) return 'Need ' + (it.cost - (ST.coins || 0)) + ' more 🪙';
    return '';
  }
  function shopHTML() {
    return '<div class="dlshop"><div class="dlshoph">🛒 WEAPONS SHOP <b>🪙 ' + (ST.coins || 0) + '</b></div><div class="dlshopg">' + SHOP.map(function (it) {
      var why = shopWhy(it);
      return '<button type="button" class="dlitem' + (why ? ' off' : '') + '" data-s="' + it.k + '" title="' + esc(it.say) + '"' + (why ? ' aria-disabled="true"' : '') + '><span class="dlie">' + it.e + '</span><b>' + it.n + '</b><em>🪙 ' + it.cost + '</em><small>' + (why || esc(it.say)) + '</small></button>';
    }).join('') + '</div></div>';
  }
  function buy(k) {
    var it = SHOP.filter(function (x) { return x.k === k; })[0]; if (!it || shopWhy(it)) return;
    if (k === 'r') { ST.cur = { k: 'R' }; ST.msg = ''; keep(); drawWork(); return; }
    ST.coins -= it.cost;
    if (k === 'h') ST.hole = 1; else ST.bank[upTarget()].u = k;
    ST.msg = it.e + ' <b>' + it.n + '</b> ready for the volley!'; ST.good = true; snd(k === 'g' ? 'bleat' : 'buy'); keep(); send(); drawWork();
  }
  function eqBoxes(cur, max) {
    var gm = parseF(cur.m), gb = parseF(cur.b);
    return '<div class="dleq"><i class="dlx">y</i> = <span class="dlbw"><button type="button" class="dlbox' + (cur.act === 'm' ? ' on' : '') + '" data-b="m">' + (esc(cur.m) || '<span>m</span>') + '</button><small>slope</small></span> <i class="dlx">x</i> + <span class="dlbw"><button type="button" class="dlbox' + (cur.act === 'b' ? ' on' : '') + '" data-b="b">' + (esc(cur.b) || '<span>b</span>') + '</button><small>y-intercept</small></span></div>' +
      '<div class="dlprev">' + (gm && gb ? 'That\'s ' + eqHTML(gm, gb) : 'Fractions like 3/2 are fine.') + (cur.miss ? ' · try ' + (cur.miss + 1) + ' of ' + max : '') + '</div>';
  }
  function keysHTML(go, back, cur) {
    var many = !cur || cur.mode !== 'steps' || (BOXES[cur.steps[cur.si]] || []).length > 1, nb = cur && cur.mode === 'steps';   // a box-switch key only where there's more than one box
    return '<div class="dlkeys">' + ['7', '8', '9', '⌫', '4', '5', '6', '/', '1', '2', '3', '−', '0', '.', '⇄'].map(function (k) { return k === '⇄' ? (many ? '<button type="button" data-k="⇄"' + (nb ? ' class="dlnb">Next box' : '>⇄') + '</button>' : '<span></span>') : '<button type="button" data-k="' + k + '">' + k + '</button>'; }).join('') +
      '<button type="button" class="dlgo" data-k="go">' + go + '</button></div>' + (back ? '<button type="button" class="dlalt" data-k="back">↩ Pick a different target</button>' : '');
  }
  function drawWork() {
    var box = V.work, m = ready(); if (!box || !m) return;
    var e = (sNow() - V.o.at) / 1000, out = '', cur = ST.cur, full = ST.bank.length >= MAXL, shieldOk = !ST.sh && ST.str < STRIES, opt = V.aimOpt || {};
    if (V.mis) V.mis.innerHTML = (final() ? '<div class="dlfinb">🏁 FINAL VOLLEY · no help this time</div>' : '') + '<div class="dlmish">🛰️ ROUND ' + V.o.round + ' · YOU ARE AT <b class="dlA">A' + pt(m.x, m.y) + '</b></div>' +
      '<p class="dlsm">Pick a target and write the line from you to them. Every right line puts a laser in your bank; they all fire together when the clock hits zero.</p>' +
      '<div class="dlbankrow">🔋 Lasers ready ' + bankHTML() + ' <b>' + ST.bank.length + ' of ' + MAXL + '</b>' + (ST.sh === 1 ? ' · 🛡️ shield up' : '') + (ST.met ? ' · ☄️ meteor on ' + esc(nameOf(ST.met)) : '') + (ST.hole ? ' · 🕳️ black hole' : '') + ' <span class="dlcoins">🪙 ' + (ST.coins || 0) + '</span></div>';
    opt.tg = ''; opt.cands = null; opt.bea = null;
    if (cur && cur.k === 'L' && V.ros[cur.tg]) {
      var tg = V.ros[cur.tg], Q = Qof(m, tg); opt.tg = tg.fp;
      out += '<div class="dltg">🎯 Target: <b>' + esc(tg.n) + '</b> at <b class="dlB">B' + pt(tg.x, tg.y) + '</b> <span class="dld" style="--d:' + DCOL[Q.d] + '">' + DSTAR[Q.d] + ' ' + DIFF[Q.d] + ' ×' + MULT[Q.d] + '</span></div>' +
        scaffold(Q, 'the line to ' + esc(tg.n)) + stepsHTML(Q, cur, TRIES, 'B') + keysHTML(goLabel(cur, '🔒 Lock in laser'), !cur.miss && !cur.si, cur);
    }
    else if (cur && cur.k === 'S') {
      var S = beacon(m); opt.bea = S.B;
      out += '<div class="dlshh">🛡️ CHARGE YOUR SHIELD</div><p class="dlc">Write the line through you, <b class="dlA">A' + pt(S.A[0], S.A[1]) + '</b>, and the shield beacon <b class="dlS">S' + pt(S.B[0], S.B[1]) + '</b>. The shield blocks the first laser that hits you.</p>' +
        scaffold(S, 'the shield line') + stepsHTML(S, cur, STRIES, 'S') + keysHTML(goLabel(cur, '🛡️ Charge shield'), !cur.miss && !cur.si, cur);
    }
    else if (cur && cur.k === 'R') {   // the meteor: pick any enemy
      out += '<div class="dlpickh">☄️ Drop the meteor on…</div><div class="dlpicks">' + rosList().filter(function (r) { return r.t !== m.t; }).map(function (r) { return '<button type="button" class="dlpick" style="--d:#FF9A3B" data-m="' + r.fp + '"><b>' + esc(r.n) + '</b><span>' + pt(r.x, r.y) + '</span></button>'; }).join('') + '</div><button type="button" class="dlalt" data-k="back">↩ Not now</button>';
    }
    else {
      ST.cur = null;
      if (!full) {
        var C = cands(m); opt.cands = C.map(function (c) { return { fp: c.r.fp, d: c.d }; });
        out += '<div class="dlpickh">' + (ST.bank.length ? 'Next target?' : 'Pick your target') + '</div><div class="dlpicks">' + C.map(function (c) {
          return '<button type="button" class="dlpick" style="--d:' + DCOL[c.d] + '" data-t="' + c.r.fp + '"><b>' + esc(c.r.n) + '</b><span>B' + pt(c.r.x, c.r.y) + '</span><em>' + DSTAR[c.d] + ' ' + DIFF[c.d] + ' · ×' + MULT[c.d] + ' points</em></button>';
        }).join('') + '</div>';
      }
      else out += '<div class="dlwait">🔋 <b>Laser bank full!</b> Lasers fire in <b>' + clock(V.o.alen - e) + '</b>.</div>';
      if (shieldOk) out += '<button type="button" class="dlpick dlsh" data-t="S"><b>🛡️ Charge a shield instead</b><em>Blocks the first laser that hits you</em></button>';
      else if (full) out += '<div class="dlwait">' + (ST.sh === 1 ? '🛡️ Shield up. ' : '') + 'Watch the big screen!</div>';
      out += shopHTML();
    }
    if (ST.msg) out += '<p class="dlfb' + (ST.good ? ' good' : '') + '">' + ST.msg + '</p>';
    box.innerHTML = out;
    [].forEach.call(box.querySelectorAll('[data-k]'), function (b) { b.onclick = function () { press(b.getAttribute('data-k')); }; });
    [].forEach.call(box.querySelectorAll('[data-b]'), function (b) { b.onclick = function () { if (ST.cur) { ST.cur.act = b.getAttribute('data-b'); drawWork(); } }; });
    [].forEach.call(box.querySelectorAll('[data-v]'), function (b) { b.onclick = function () { if (ST.cur) { ST.cur.box = b.getAttribute('data-v'); drawWork(); } }; });
    [].forEach.call(box.querySelectorAll('[data-s]'), function (b) { b.onclick = function () { buy(b.getAttribute('data-s')); }; });
    [].forEach.call(box.querySelectorAll('[data-m]'), function (b) { b.onclick = function () { var it = SHOP[1]; if ((ST.coins || 0) < it.cost || ST.met) return; ST.coins -= it.cost; ST.met = b.getAttribute('data-m'); ST.cur = null; ST.msg = '☄️ Meteor locked on <b>' + esc(nameOf(ST.met)) + '</b>!'; ST.good = true; snd('buy'); keep(); send(); drawWork(); }; });
    [].forEach.call(box.querySelectorAll('[data-t]'), function (b) { b.onclick = function () { var t = b.getAttribute('data-t'), Qn = t === 'S' ? beacon(m) : V.ros[t] ? Qof(m, V.ros[t]) : null; if (!Qn) return; ST.cur = newCur(t === 'S' ? 'S' : 'L', t === 'S' ? '' : t, Qn, final()); ST.msg = ''; keep(); drawWork(); }; });
  }
  function press(k) {
    var cur = ST.cur; if (!cur || V.o.state !== 1) return;
    if (k === 'go') return check();
    if (k === 'back') { if (!cur.miss && !cur.si) { ST.cur = null; ST.msg = ''; keep(); drawWork(); } return; }
    if (cur.k === 'R') return;
    if (k === 'mode') { if (cur.fin) return; cur.mode = cur.mode === 'eq' ? 'steps' : 'eq'; if (cur.mode === 'steps') { cur.used = 's'; if (!cur.box) cur.box = BOXES[cur.steps[cur.si]][0]; } ST.msg = ''; keep(); drawWork(); return; }
    typeInto(cur, k); ST.msg = ''; keep(); drawWork();
  }
  function onKey(e) {
    if (!V || A.MODE !== 'student' || !V.work || e.ctrlKey || e.metaKey || e.altKey) return;
    if (V.o.state !== 1 && !(V.o.state === 3 && V.pcur)) return;
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    var k = e.key, map = { Backspace: '⌫', '-': '−', '/': '/', '.': '.', Enter: 'go', Tab: '⇄' }, f = V.o.state === 3 ? pressP : press;
    if (/^[0-9]$/.test(k)) f(k); else if (map[k]) { e.preventDefault(); f(map[k]); }
  }
  function check() {
    var cur = ST.cur, m = ready(); if (!cur || !m || !cur.steps) return;
    var isL = cur.k === 'L', tg = isL ? V.ros[cur.tg] : null, Q = isL ? (tg ? Qof(m, tg) : null) : beacon(m); if (!Q) return;
    var R = stepCheck(cur, Q, isL ? TRIES : STRIES, isL ? 'B' : 'S'), secs = Math.max(0, Math.round((sNow() - V.o.at) / 100) / 10);
    if (R.miss) ST.miss = (ST.miss || 0) + 1;
    cur.tr = cur.miss;
    if (R.r === 'blank' || R.r === 'miss' || R.r === 'next') {
      ST.msg = R.msg; ST.good = R.r === 'next' && !R.miss; snd(R.r === 'next' ? 'lock' : 'nope'); if (R.miss) send(); keep(); drawWork();
      if (R.r === 'next') J('burst', V.work && (V.work.querySelector('.dlsteps li.on') || V.work.querySelector('.dlfb')), { count: 9, spread: 110, colors: ['#7CF2A2', '#8CF2FF', '#fff'] });
      else if (R.r === 'miss' && V.work) J('shake', V.work, { power: 5, ms: 300 });
      return;
    }
    var tries = clamp(cur.miss + 1, 1, 3), right = R.r === 'done', lm = right ? Q.m : R.gm, lb = right ? Q.b : R.gb, pre = R.msg ? R.msg + '<br>' : '';
    if (isL) {   // for the report: lines finished, lines where we showed a step, and the no-help final volley
      ST.tot.ln = (ST.tot.ln || 0) + 1; if (cur.rv) ST.tot.rv = (ST.tot.rv || 0) + 1; if (final()) { ST.tot.fo = (ST.tot.fo || 0) + 1; if (right) ST.tot.fr = (ST.tot.fr || 0) + 1; }
      var sp = speedOf(secs, V.o.alen);
      if (right) {
        var earn = [2, 3, 4][Q.d] + (cur.miss ? 0 : 1);
        ST.coins = (ST.coins || 0) + earn; ST.bank.push({ ok: 1, tg: tg.fp, c: code(sp, tries) });
        ST.tot.right++; if (!cur.miss) ST.tot.first++; if (cur.used === 's') ST.tot.sp = (ST.tot.sp || 0) + 1; else ST.tot.eq = (ST.tot.eq || 0) + 1;
        ST.msg = pre + '🎯 Locked on ' + esc(tg.n) + ': ' + eqHTML(Q.m, Q.b) + (cur.miss ? '' : ', no mistakes') + '! ⚡ speed ' + sp + ' · 💥 power ' + power(sp, tries) + (Q.d ? ' ×' + MULT[Q.d] : '') + ' · +' + earn + ' 🪙';
        ST.good = true; xp(cur.miss ? 3 + Q.d : 5 + 2 * Q.d); snd('lock');
      }
      else { ST.bank.push({ ok: 0, m: fstr(lm), b: fstr(lb), c: code(sp, 3) }); ST.msg = 'The line to ' + esc(tg.n) + ' was ' + eqHTML(Q.m, Q.b) + '. Your laser fires along ' + eqHTML(lm, lb) + ' anyway.'; ST.good = false; snd('nope'); }
      ST.cur = null; ST.mk++;
    }
    else {
      if (right) { ST.sh = 1; ST.msg = pre + '🛡️ Shield charged!'; ST.good = true; xp(4); snd('shield'); }
      else { ST.str = STRIES; ST.msg = 'No shield this time: the shield line was ' + eqHTML(Q.m, Q.b) + '.'; ST.good = false; }
      ST.cur = null;
    }
    send(); keep(); drawWork();
    // a laser in the bank is the moment: sparks from the bank, coins floating up, and a streak of first-try lines called out
    var bk = V.mis && V.mis.querySelector('.dlbank'), fb = V.work && V.work.querySelector('.dlfb');
    if (right) {
      if (isL) { ST.run = cur.miss ? 0 : (ST.run || 0) + 1; keep(); }
      J('burst', (isL ? bk : fb) || fb, { count: 20, emoji: isL ? ['⚡', '✨'] : ['🛡️'], spread: 220, colors: ['#FFE14D', '#8CF2FF', '#fff'] });
      if (isL && earn) J('float', V.mis && V.mis.querySelector('.dlcoins') || fb, '+' + earn + ' 🪙', { color: '#FFC94A', size: 24 });
      if (isL && ST.bank.length >= MAXL) J('banner', 'BANK FULL!', { sub: MAXL + ' lasers ready to fire' + (ST.run >= 2 ? ' · ' + ST.run + ' in a row' : ''), tone: 'info', ms: 1300 });
      else if (isL && ST.run >= 2) { J('banner', ST.run + ' IN A ROW!', { sub: 'First try every time', ms: 1000 }); if (soundOn()) J('sfx', 'combo'); }
    } else { ST.run = 0; if (V.work) J('shake', V.work, { power: 7, ms: 380 }); }
  }
  function send() {
    if (A.MODE !== 'student' || !V) return;
    var v = (ST.bank || []).map(function (x) { return x.ok ? 'c' + x.tg + '_' + x.c + (x.u ? '_' + x.u : '') : 'w' + x.m + '_' + x.b + '_' + x.c; });
    if (ST.met) v.push('r' + ST.met); if (ST.hole) v.push('h');
    // what they're working on right now, for the teacher's "needs a hand" list: target_tries_slope typed_intercept typed
    var C2 = ST.cur, stp = C2 && C2.mode === 'steps' ? C2.steps[C2.si] || '' : '', cu = C2 && C2.k === 'L' && C2.miss ? C2.tg + '_' + C2.miss + '_' + (stp ? '' : C2.m || '') + '_' + (stp ? '' : C2.b || '') + '_' + stp + '_' + (stp ? (BOXES[stp] || []).map(function (k) { return C2.v[k] || '?'; }).join(',') : '') : '';   // target_misses_slope_intercept (final volley)_step_what they typed
    A.record({ id: QID, k: 'open' }, 'd2;id:' + Math.round(V.id / 1000) + ';r:' + (ST.r || 0) + ';v:' + v.join('.') + ';sh:' + ST.sh + ';st:' + ST.str + ';cu:' + cu + ';mi:' + (ST.miss || 0) + ';cn:' + (ST.coins || 0) + ';n:' + (ST.tot.p || 0) + ';ok:' + ST.tot.right + ';f:' + ST.tot.first + ';hi:' + ST.tot.hits + ';dm:' + ST.tot.dmg + ';z:' + ST.tot.zaps + ';bl:' + ST.tot.blocks + ';hl:' + (ST.tot.hl || '') + ';ln:' + (ST.tot.ln || 0) + ';rv:' + (ST.tot.rv || 0) + ';fo:' + (ST.tot.fo || 0) + ';fr:' + (ST.tot.fr || 0) + ';sp:' + (ST.tot.sp || 0) + ';eq:' + (ST.tot.eq || 0) + ';w:' + (ST.w || 0), null);
  }
  function stFire() {
    var c = H('div', 'dlcard');
    if (!V.anim) { c.innerHTML = '<h2>⚡ Lasers charging…</h2>'; root.appendChild(c); return; }
    field(c, { names: false }); V.res = H('div', 'dlres', myResult(true)); c.appendChild(V.res); root.appendChild(c);
  }
  // after the volley: what your laser did, and the line it should have been
  function tally() {
    var A2 = V.anim, mf = myFp(); if (!A2 || ST.seen[A2.r]) return;
    ST.seen[A2.r] = 1;
    var got = 0;
    A2.res.ev.forEach(function (e) {
      if (e.k === 'hit' && e.a === mf) { ST.tot.hits++; ST.tot.dmg += e.d; got += 2; xp(3); }
      if ((e.k === 'clash' && e.a === mf) || (e.k === 'cancel' && (e.a === mf || e.b === mf)) || (e.k === 'hole' && e.b === mf)) { ST.tot.zaps++; got += 1; }
      if (e.k === 'shield' && e.b === mf) { ST.tot.blocks++; got += 1; }
    });
    ST.coins = (ST.coins || 0) + got; ST.lastGot = got;
    keep(); send();
  }
  function stBreak() {
    tally();
    var o = V.o, c = H('div', 'dlcard'), A2 = V.anim;
    c.innerHTML = recapHTML(o.last) + (A2 && A2.r === o.round - 1 ? '<div class="dlres">' + myResult(false) + '</div>' : '') + '<p class="dlbigp">🪙 <b>' + (ST.coins || 0) + '</b> coins' + (ST.lastGot ? ' (+' + ST.lastGot + ' from the battle)' : '') + '. Save up for the 🐐 wild goat (14)!</p><p class="dlbigp">🔁 Round ' + o.round + ' coming: a new spot and new targets.</p>';
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
      if (k === 'bleat') { [0, 0.11, 0.22].forEach(function (d, i) { tone(t + d, 'sawtooth', 520 - i * 40, 470 - i * 40, 0.1, 0.09); }); }
      if (k === 'warp') tone(t, 'sine', 900, 60, 0.6, 0.18);
      if (k === 'buy') { tone(t, 'triangle', 880, 880, 0.07, 0.1); tone(t + 0.08, 'triangle', 1320, 1320, 0.15, 0.1); }
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
  function start(secs, rounds) {
    var who = active();
    if (who.length < 2) { SFA.toast('Laser Lines needs at least two students who have answered something today.', 4000); return false; }
    var sc = scoresToday(who), L = who.slice().sort(function (a, b) { return sc[b] - sc[a]; }), t = rnd(Date.now());
    var K = { id: t, state: 3, round: 1, rounds: rounds || 5, at: t, alen: Math.round(secs || 60), rx: 0, intro: INTRO, teams: [[], []], order: [], sup: {}, pin: {}, pos: {}, rows: {}, score: [0, 0], stats: {}, last: null, cur: 0, lastPush: 0, lastSave: 0, nm: {}, flen: 0 };
    L.forEach(function (sid, i) { K.teams[[0, 1, 1, 0][i % 4]].push(sid); K.sup[sid] = i / L.length < 0.45 ? 0 : i / L.length < 0.75 ? 1 : 2; });
    K.order = K.teams[0].concat(K.teams[1]);
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

  // new spots each round: try a few layouts, keep the one where the most students have an easy line to someone
  // new spots each round: try a few layouts, keep the one where everyone has an enemy off their own row (no flat lines)
  // and the most students have an easy line to someone
  function layout(K) {
    var R = rng(K.id / 1000 + K.round * 7919), best = null;
    for (var a = 0; a < 40; a++) {
      var pos = {}, good = 0, bad = 0;
      [0, 1].forEach(function (t) { var taken = []; shuffle(K.teams[t], R).forEach(function (sid) { var c = pickCell(t, taken, R); pos[sid] = { x: c[0], y: c[1] }; taken.push(c); }); });
      [0, 1].forEach(function (t) { K.teams[t].forEach(function (sid) {
        var foes = K.teams[1 - t].filter(function (e) { return pos[e].y !== pos[sid].y; });
        if (K.teams[1 - t].length && !foes.length) bad++;
        if (foes.some(function (e) { return diffOf([pos[sid].x, pos[sid].y], [pos[e].x, pos[e].y]) === 0; })) good++;
      }); });
      var sc = good - 100 * bad;
      if (!best || sc > best.sc) best = { pos: pos, sc: sc };
      if (!bad && good === allSids(K).length) break;
    }
    K.pos = best.pos; K.ents = null;
  }
  function teamOf(K, sid) { return K.teams[0].indexOf(sid) >= 0 ? 0 : K.teams[1].indexOf(sid) >= 0 ? 1 : -1; }
  function addLate(K, sid) {
    var t = K.teams[0].length <= K.teams[1].length ? 0 : 1;
    K.teams[t].push(sid); K.order.push(sid); K.sup[sid] = 1;
    var taken = K.teams[t].filter(function (s) { return K.pos[s]; }).map(function (s) { return [K.pos[s].x, K.pos[s].y]; }), c = pickCell(t, taken, Math.random);
    K.pos[sid] = { x: c[0], y: c[1] }; K.ents = null;
  }
  function toks(r) { return r && r.v ? String(r.v).split('.').filter(Boolean) : []; }
  function bank(K, sid) { var r = K.rows[sid]; return r && r.r === K.round ? toks(r).filter(function (t) { return t.charAt(0) === 'c' || t.charAt(0) === 'w'; }).slice(0, MAXL) : []; }
  function extras(K, sid) { var r = K.rows[sid]; return r && r.r === K.round ? toks(r).filter(function (t) { return t.charAt(0) === 'r' || t === 'h'; }).slice(0, 2) : []; }
  function rosOf(K) { var out = []; [0, 1].forEach(function (t) { K.teams[t].forEach(function (sid) { var P = K.pos[sid]; if (P) out.push({ fp: sh3(sid), sid: sid, t: t, x: P.x, y: P.y, i: K.order.indexOf(sid) }); }); }); return out; }
  // every bank, in the volley's short form (see decFire); over the budget, the biggest banks give up their slowest lasers
  function fireStr(K) {
    var w = K.order.length > 36 ? 2 : 1, bySh = {}, G = [];
    K.order.forEach(function (sid) { bySh[sh3(sid)] = sid; });
    allSids(K).forEach(function (sid) {
      var r = K.rows[sid]; if (!K.pos[sid] || !r || r.r !== K.round) return;
      var T = bank(K, sid).map(function (t) {
        if (t.charAt(0) === 'c') { var p = t.slice(1).split('_'), ts = bySh[p[0]]; if (!ts || !K.pos[ts] || teamOf(K, ts) === teamOf(K, sid)) return null; var ix = K.order.indexOf(ts).toString(36); while (ix.length < w) ix = '0' + ix; return ix + String(p[1] || '0').charAt(0) + (p[2] === 'g' ? 'G' : p[2] === 'x' ? 'X' : ''); }
        var q = t.slice(1).split('_'), m = parseF(q[0]), b = parseF(q[1]); return m && b ? '!' + fstr(m) + '_' + fstr(b) + '_' + String(q[2] || '0').charAt(0) : null;
      }).filter(Boolean);
      extras(K, sid).forEach(function (t) { if (t === 'h') T.push('H'); else { var ts2 = bySh[t.slice(1)]; if (ts2 && K.pos[ts2] && teamOf(K, ts2) !== teamOf(K, sid)) T.push('R' + K.order.indexOf(ts2).toString(36)); } });
      if (T.length || r.sh === 1) G.push({ h: K.order.indexOf(sid).toString(36) + (r.sh === 1 ? '*' : ''), t: T });
    });
    var str = function () { return G.map(function (g) { return g.h + '=' + g.t.join('.'); }).join(','); };
    while (str().length > 540) { var big = G.slice().sort(function (a, b) { return b.t.length - a.t.length; })[0]; if (big.t.length > 1) big.t.pop(); else G.pop(); }
    return 'F:' + K.round + '.' + w + '|' + str();
  }
  function fire(K) {
    K.fstr = fireStr(K); K.state = 5; K.at = rnd(Date.now());
    var ros = rosOf(K), F = decFire(K.fstr.slice(2)), res = sim(ros, F), S = scoreOf(res), bySid = {};
    ros.forEach(function (r) { bySid[r.fp] = r.sid; });
    K.flen = Math.ceil(res.len);
    K.score[0] += S.pts[0]; K.score[1] += S.pts[1];
    Object.keys(S.per).forEach(function (fp) { var sid = bySid[fp]; if (!sid) return; var st = K.stats[sid] || (K.stats[sid] = { dmg: 0, hits: 0, taken: 0, zaps: 0, blocks: 0, right: 0, first: 0 }), p = S.per[fp]; ['dmg', 'hits', 'taken', 'zaps', 'blocks'].forEach(function (k) { st[k] += p[k]; }); });
    allSids(K).forEach(function (sid) { var st = K.stats[sid] || (K.stats[sid] = { dmg: 0, hits: 0, taken: 0, zaps: 0, blocks: 0, right: 0, first: 0 }); bank(K, sid).forEach(function (t) { if (t.charAt(0) === 'c') { st.right++; if (uncode(String(t.split('_')[1] || '0').charAt(0)).tr === 1) st.first++; } }); });
    var top = null; res.ev.forEach(function (e) { if (e.k === 'hit' && (!top || e.d > top.d)) top = e; });
    K.last = { r: K.round, pts: S.pts, hits: S.hits, zaps: S.zaps, sh: S.sh, top: top ? { n: sname(bySid[top.a]), v: sname(bySid[top.b]), d: top.d } : null };
    K.hist = (K.hist || []).concat([{ r: K.round, pts: S.pts }]);
  }
  // help moves with the student: every line right first time, a little less help next round; no right line, a little more
  function adapt(K) {
    allSids(K).forEach(function (sid) {
      if (K.pin[sid]) return;
      var T = bank(K, sid), ok = T.filter(function (t) { return t.charAt(0) === 'c'; }), first = ok.filter(function (t) { return uncode(String(t.split('_')[1] || '0').charAt(0)).tr === 1; }), s = K.sup[sid] || 0;
      if (ok.length && first.length === T.length && s > 0) K.sup[sid] = s - 1;
      else if (!ok.length && s < 2) K.sup[sid] = s + 1;
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
      var row = { r: g('r'), v: (s.match(/;v:([^;]*)/) || [])[1] || '', sh: g('sh'), st: g('st'), cu: (s.match(/;cu:([^;]*)/) || [])[1] || '', mi: g('mi'), cn: g('cn'), at: String(last[sid].time) }, old = K.rows[sid];
      if (!old || old.r !== row.r || old.v !== row.v || old.sh !== row.sh || old.st !== row.st || old.cu !== row.cu || old.mi !== row.mi) changed = true;
      K.rows[sid] = row;
    });
    if (K.state !== 2) Object.keys(last).forEach(function (sid) { if (teamOf(K, sid) >= 0 || !A.rosterIn().some(function (r) { return r.sid === sid; })) return; addLate(K, sid); changed = true; });
    if (changed) { K.ents = null; A.consolePanel(); }
  }
  function tick() {
    var K = C(); if (!K) return;
    var now = Date.now(), e = (now - K.at) / 1000, pushed = false, go = function () { pushed = true; save(K); (A.pushNow || A.pushLive)(); A.consolePanel(); };
    if (K.state === 3 && e >= K.intro) { K.state = 1; K.at = rnd(now); go(); }
    else if (K.state === 1) { var all = allSids(K).every(function (s) { return bank(K, s).length >= MAXL; }); if (e >= K.alen + (K.rx || 0) || (all && e >= 15)) { fire(K); go(); } }
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
    var lk = [0, 0]; [0, 1].forEach(function (t) { K.teams[t].forEach(function (s) { lk[t] += bank(K, s).length; }); });
    out.zdid = A.encRun(K.id); out.zdst = A.encRun(K.id + (A.console_().skew || 0));
    out.zds = [K.state, K.round, K.rounds, Math.min(9999, K.alen + (K.rx || 0)), Math.min(9999, Math.max(0, Math.round((K.at - K.id) / 1000))), K.intro, Math.min(9999, K.score[0]), Math.min(9999, K.score[1]), allSids(K).length, lk[0], lk[1], K.flen || 0];
  }
  // the roster, one entry per student: fingerprint~team~x~y~index~support~lasers banked~name~look (two of the same first name get an initial)
  function entries(K) {
    if (!K.ents || Date.now() - (K.entsAt || 0) > 20000) {
      var LK = looksBySid(), first = {}, R = {}, nmx = {};
      A.rosterIn().forEach(function (r) { R[r.sid] = r; });
      allSids(K).forEach(function (sid) { var f = sname(sid); first[f] = (first[f] || 0) + 1; });
      allSids(K).forEach(function (sid) { var f = sname(sid), r = R[sid]; if (first[f] > 1 && r) { var lst = String(r.name || '').indexOf(',') >= 0 ? String(r.name).split(',')[0].trim() : String(r.name || '').trim().split(' ').slice(-1)[0]; f = clean(f + ' ' + (lst.charAt(0) || '')); } nmx[sid] = { n: f, look: LK[sid] || (AV ? AV.defLook(sid) : '') }; });
      K.ents = nmx; K.entsAt = Date.now();
    }
    var out = [];
    [0, 1].forEach(function (t) { K.teams[t].forEach(function (sid) { var P = K.pos[sid], N = K.ents[sid] || { n: sname(sid), look: '' }; if (P) out.push([sh3(sid), t, P.x, P.y, K.order.indexOf(sid).toString(36), K.sup[sid] || 0, bank(K, sid).length, N.n, N.look].join('~')); }); });
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
    var K = C(), sec = H('div', 'sect'), e = (Date.now() - K.at) / 1000, len = K.alen + (K.rx || 0), n = allSids(K).length, lk = allSids(K).reduce(function (a, s) { return a + bank(K, s).length; }, 0);
    sec.appendChild(H('h3', '', '🚀 Laser Lines · ' + (K.state === 2 ? 'Results' : 'Round ' + K.round + ' of ' + K.rounds)));
    var tn = function (t) { return TE[t] + ' ' + esc(teamName(t, K.id)); };
    var line = K.state === 1 && K.round >= K.rounds ? '🏁 <b>Final volley: no help</b> (just the two points, no steps or hints) · <b>' + clock(len - e) + '</b> left' : K.state === 3 ? 'Rules on every screen: missions arrive in <b>' + clock(K.intro - e) + '</b>' :
      K.state === 1 ? '<b>' + clock(len - e) + '</b> until the lasers fire · <b>' + lk + '</b> laser' + (lk === 1 ? '' : 's') + ' banked by ' + n + ' students (they fire early once every bank is full)' :
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
    // needs a hand: who is missing lines right now, the problem on their screen, the answer and what they typed
    if (K.state === 1) {
      var bySh2 = {}; K.order.forEach(function (sid) { bySh2[sh3(sid)] = sid; });
      var stuck = allSids(K).map(function (sid) {
        var row = K.rows[sid], P = K.pos[sid]; if (!row || row.r !== K.round || !P) return null;
        var c2 = row.cu ? row.cu.split('_') : [], tsid = bySh2[c2[0]], Q = tsid && K.pos[tsid] ? K.pos[tsid] : null, okN = bank(K, sid).filter(function (t) { return t.charAt(0) === 'c'; }).length;
        if (!(Q && +c2[1] >= 1) && !(row.mi >= 2 && okN === 0)) return null;
        return { sid: sid, row: row, P: P, Q: Q, tsid: tsid, tries: +c2[1] || 0, tm: parseF(c2[2]), tb: parseF(c2[3]), st: c2[4] || '', typed: c2[5] || '', ok: okN };
      }).filter(Boolean).sort(function (a, b) { return b.row.mi - a.row.mi || b.tries - a.tries; });
      var hs = H('div', 'dlhelp'); hs.appendChild(H('h4', '', '🆘 Needs a hand' + (stuck.length ? ' (' + stuck.length + ')' : '') + ' <small>students missing lines this volley, with the problem on their screen</small>'));
      if (!stuck.length) hs.appendChild(H('p', 'muted', 'Nobody is stuck right now.'));
      stuck.forEach(function (x) {
        var L = x.Q ? lineThrough([x.P.x, x.P.y], [x.Q.x, x.Q.y]) : null, d = x.Q ? diffOf([x.P.x, x.P.y], [x.Q.x, x.Q.y]) : 0, s = K.sup[x.sid] || 0;
        hs.appendChild(H('div', 'dlhrow', '<b>' + esc(sname(x.sid)) + '</b> <span class="muted">' + SUPE[s] + ' ' + SUP[s] + ' · ' + x.row.mi + ' miss' + (x.row.mi === 1 ? '' : 'es') + ' this volley · ' + x.ok + ' right</span>' +
          (L ? '<div>A' + pt(x.P.x, x.P.y) + ' → ' + esc(sname(x.tsid)) + ' B' + pt(x.Q.x, x.Q.y) + ' <span class="dld" style="--d:' + DCOL[d] + '">' + DIFF[d] + '</span> · answer <b>' + eqHTML(L.m, L.b) + '</b>' +
            (SN[x.st] ? ' · stuck on <b>' + SN[x.st].toLowerCase() + '</b>' + (x.typed ? ': typed <span class="dlno2">' + esc(x.typed.split(',').join(', ')) + '</span>, wants <b>' + (x.st === 'f' ? '(' + nm(x.Q.y) + ' − ' + par(x.P.y) + ') ÷ (' + nm(x.Q.x) + ' − ' + par(x.P.x) + ')' : x.st === 'm' ? fhtml(L.m) : x.st === 'p' ? nm(x.P.y) + ' = ' + fhtml(L.m) + ' × ' + par(x.P.x) + ' + b' : 'b = ' + fhtml(L.b)) + '</b>' : '') + ' (' + x.tries + ' miss' + (x.tries === 1 ? '' : 'es') + ' on this line)'
              : (x.tm && x.tb ? ' · typed <span class="dlno2">' + eqHTML(x.tm, x.tb) + '</span>' + (feq(x.tm, L.m) ? ' <span class="dlok2">slope ✓</span>' : '') + (feq(x.tb, L.b) ? ' <span class="dlok2">intercept ✓</span>' : '') : '') + ' (final volley, try ' + Math.min(TRIES, x.tries + 1) + ' of ' + TRIES + ')') + '</div>' : '<div class="muted">Between problems: ' + x.row.mi + ' lines missed, none right yet.</div>')));
      });
      sec.appendChild(hs);
    }
    // details: each student's help level (tap to change), this round, the battle so far
    var dd = A.fold ? A.fold('g-duel', '📋 Details · help levels, who has locked in', K.state === 2) : (function () { var d = el('details', { 'class': 'sect fold' }); d.appendChild(el('summary', {}, [H('h3', '', '📋 Details')])); return d; })();
    dd.appendChild(H('p', 'muted', 'Help levels: ' + SUP.map(function (s, i) { return SUPE[i] + ' ' + s; }).join(' · ') + '. None of them gives away the slope or b: they only set whether a line starts as the whole equation or as the steps (students can switch any time), and how strong the hints are. They move each round (right first time: less help; no right line: more). Tap a student to set theirs yourself; that keeps it fixed.'));
    var wrap = H('div', 'row');
    [0, 1].forEach(function (t) {
      K.teams[t].slice().sort(function (a, b) { return sname(a).localeCompare(sname(b)); }).forEach(function (sid) {
        var row = K.rows[sid], st = K.stats[sid] || { dmg: 0, right: 0, first: 0 }, now2 = row && row.r === K.round ? '🔋' + bank(K, sid).length + (row.sh === 1 ? '🛡️' : '') + ' 🪙' + (row.cn || 0) : '…', s = K.sup[sid] || 0;
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
    '.dlshh{font-weight:900;letter-spacing:1px;color:#8CF2FF;text-align:center}.dlc{text-align:center;margin:0}',
    '.dlbankrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:700;margin-top:4px}.dlbankrow b{color:#FFE14D}',
    '.dlbank{display:inline-flex;gap:5px}.dlbank i{width:22px;height:10px;border-radius:5px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25)}.dlbank i.on{background:#FFE14D;box-shadow:0 0 8px #FFE14D;border-color:#FFE14D}.dlbank i.bad{background:#FFB86B;opacity:.7}',
    '.dlpickh{text-align:center;font:900 20px/1.2 system-ui;letter-spacing:1px}',
    '.dlpicks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}',
    '.dlpick{display:flex;flex-direction:column;align-items:center;gap:3px;padding:12px 6px;border-radius:14px;border:3px solid var(--d,#8CF2FF);background:rgba(0,0,0,.3);color:#E6F0FF;cursor:pointer;font:inherit;min-width:0}.dlpick:hover{background:rgba(255,255,255,.08)}',
    '.dlpick b{font-size:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}.dlpick span{font-weight:700;color:#FF9AA2}.dlpick em{font-style:normal;font-weight:800;font-size:13px;color:var(--d,#8CF2FF)}',
    '.dlpick.dlsh{width:100%;--d:#8CF2FF;padding:9px}',
    '.dltg{text-align:center;font-size:18px}.dltg b{color:#FFE14D}.dld{display:inline-block;font-size:13px;font-weight:900;color:#0c1230;background:var(--d);border-radius:999px;padding:2px 9px;vertical-align:middle}',
    '.dlalt{display:block;margin:0 auto;background:none;border:0;color:#9FC9FF;font-weight:700;cursor:pointer;text-decoration:underline}',
    '@media (max-width:520px){.dlpicks{grid-template-columns:1fr}}',
    '.dlbank i{display:inline-flex;align-items:center;justify-content:center;font-size:11px;line-height:1}.dlbank i.on:not(:empty){width:26px;height:18px}.dlcoins{margin-left:auto;font:900 18px system-ui;color:#FFC94A}',
    '.dlbw{display:inline-flex;flex-direction:column;align-items:center;gap:3px}.dlbw small{font:800 12px/1 system-ui;letter-spacing:.5px;color:#9FC9FF;text-transform:uppercase}',
    '.dlshop{margin-top:6px;border-top:2px dashed rgba(255,201,74,.35);padding-top:8px;display:flex;flex-direction:column;gap:6px}.dlshoph{display:flex;justify-content:space-between;font-weight:900;letter-spacing:1.5px;color:#FFC94A}.dlshoph b{font-size:18px}',
    '.dlshopg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}@media (max-width:620px){.dlshopg{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '.dlitem{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:12px;border:2px solid #FFC94A;background:linear-gradient(#2a2140,#171126);color:#E6F0FF;cursor:pointer;font:inherit;min-width:0;text-align:center}.dlitem:hover{box-shadow:0 0 12px rgba(255,201,74,.5)}',
    '.dlitem.off{opacity:.5;border-color:#4a4566;cursor:default;box-shadow:none}.dlie{font-size:28px;line-height:1.1}.dlitem b{font-size:13px}.dlitem em{font-style:normal;font-weight:900;color:#FFC94A;font-size:13px}.dlitem small{font-size:11px;opacity:.8;line-height:1.2}',
    '.dltut{background:rgba(0,0,0,.3);border:2px solid rgba(120,200,255,.35);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;gap:6px}.dltutg{display:grid;grid-template-columns:150px minmax(0,1fr);gap:10px;align-items:start}@media (max-width:560px){.dltutg{grid-template-columns:1fr}}',
    '.dlmini{width:100%;max-width:200px;display:block;margin:0 auto}.dltut ol{margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:4px;font-size:15px}.dltut li{opacity:.18;transition:opacity .4s}.dltut li.on{opacity:1}.dltut b{color:#FFE14D}.dltut .dleqbig{display:block;margin-top:2px}',
    '.dlhelp{margin:8px 0;padding:8px 10px;border:2px solid #FF8A80;border-radius:12px;background:rgba(255,138,128,.07)}.dlhelp h4{margin:0 0 6px}.dlhelp h4 small{font-weight:500;opacity:.75}.dlhrow{padding:5px 0;border-top:1px dashed rgba(255,255,255,.15)}.dlhrow:first-of-type{border-top:0}',
    '.dlno2{color:#FF8A80}.dlok2{color:#5CE0B8;font-weight:700}',
    '.dlsteps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}.dlsteps li{border-radius:12px;padding:7px 10px;background:rgba(255,255,255,.04);border:2px solid transparent;opacity:.45}',
    '.dlsteps li.on{opacity:1;border-color:#FFE14D;background:rgba(255,225,77,.08)}.dlsteps li.done{opacity:1;border-color:rgba(124,242,162,.5);background:rgba(124,242,162,.07)}',
    '.dlsn{font-size:13px;letter-spacing:.5px;text-transform:uppercase;opacity:.85}.dlsn b{color:#FFE14D;font-size:15px}.dlsteps li.done .dlsn b{color:#7CF2A2}',
    '.dlse{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-top:4px;font:700 19px/1.3 system-ui}.dlsf{font-weight:600;font-size:15px;opacity:.85}.dlsv{color:#7CF2A2;font-size:21px}',
    '.dlse .dlbox{min-width:84px;font-size:24px;padding:6px 10px}.dlse .dlbox.sm{min-width:58px;font-size:20px;padding:5px 8px}',
    '.dlpts{text-align:center;font-size:16px}.dlpts b{font-size:18px}.dlpts small{display:block;opacity:.8;font-size:13px}.dlkeys .dlnb{font-size:14px}',
    '.dleqline{text-align:center;font:900 26px/1.3 Georgia,serif;margin-top:4px}.dlq{display:inline-block;font:700 13px system-ui;border:2px dashed rgba(255,255,255,.35);border-radius:8px;padding:3px 7px;margin:0 3px;vertical-align:middle;opacity:.7}',
    '.dlfinb{display:block;text-align:center;font-weight:900;letter-spacing:1.5px;color:#0c1230;background:linear-gradient(90deg,#FFE14D,#FF9A3B);border-radius:10px;padding:4px 10px;margin-bottom:6px}.dlstrip .dlfinb{flex-basis:100%;margin:0}',
    '.dlgiv.dlfin{border:2px solid #FF9A3B}',
    '.dlwait{text-align:center;font-size:18px;padding:10px;line-height:1.5}.dlwait b{color:#FFE14D}',
    '.dlres{text-align:center;font-size:18px}.dlres p{margin:4px 0}',
    '.dlrecap{display:flex;flex-direction:column;gap:8px}.dlrr{display:grid;grid-template-columns:1fr 1fr;gap:10px}.dlrr>div{border:2px solid var(--c);border-radius:14px;padding:8px;text-align:center;display:flex;flex-direction:column;gap:2px;background:rgba(0,0,0,.25)}.dlrr b{color:var(--c)}.dlpts{font:900 34px/1 system-ui;color:#FFE14D}.dlrr small{opacity:.85}',
    '.dltop1,.dlbigp{text-align:center;font-size:18px;margin:4px 0}.dltop1 b,.dlbigp b{color:#FFE14D}',
    '.dlmvps{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}.dlmvps figure{margin:0;display:flex;flex-direction:column;align-items:center;border:2px solid var(--c);border-radius:16px;padding:8px 12px;background:rgba(0,0,0,.25)}.dlmvps figcaption{text-align:center;display:flex;flex-direction:column}.dlmvps small{opacity:.8}',
    '.dlmy{display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center;font-size:17px}.dlmy b{color:#FFE14D}',
    '.dl.screen .dlclock{font-size:42px}.dl.screen .dlcard h2{font-size:34px}.dl.screen .dlstrip{font-size:20px}.dl.screen .dlfeed{font-size:20px}',
    '@media (max-width:820px){.dltop{gap:6px}.dllogo{font-size:13px}.dlteam{display:block;margin:3px 0 0;width:max-content}.dlclock{font-size:22px}.dlsc{font-size:16px}.dleq{font-size:24px}.dlbox{min-width:76px;font-size:23px}.dlcard h2{font-size:21px}.dlmis p{font-size:16px}}',
    // the arcade look: the site's fonts, a command-deck top bar, and a class screen that reads from the back of the room
    '.dl{overflow-x:hidden;font-family:"Bricolage Grotesque",system-ui,-apple-system,"Segoe UI",sans-serif;background:radial-gradient(ellipse at 80% 110%,rgba(59,215,255,.16),transparent 50%),radial-gradient(ellipse at 10% -10%,rgba(255,77,94,.2),transparent 50%),radial-gradient(ellipse at 30% 0%,#1d1248,#05050f 70%)}',
    '.dltop{margin:-10px -14px 0;padding:8px 14px;background:linear-gradient(180deg,#141038,#0a0820);border-bottom:3px solid #FFC94A;box-shadow:0 6px 18px rgba(0,0,0,.5);position:sticky;top:-10px;z-index:5}',
    '.dllogo,.dlclock,.dlcard h2,.dlpickh,.dlsc b{font-family:"Luckiest Guy","Bricolage Grotesque",system-ui;font-weight:400;letter-spacing:.03em}.dllogo{letter-spacing:.06em}',
    '.dlclock{font-variant-numeric:tabular-nums}.dlclock.dlurg{color:#fff;background:#C8232C;border-radius:12px;padding:0 .35em;text-shadow:none;animation:dlurg .5s ease-in-out infinite alternate}@keyframes dlurg{from{transform:scale(1)}to{transform:scale(1.12)}}',
    '.dlcard,.dlwork{box-shadow:0 8px 24px rgba(0,0,0,.35)}.dlcard h2{color:#FFE14D;text-shadow:0 2px 0 #7a4d00}',
    '.dlpick{transition:transform .12s,box-shadow .12s}.dlpick:hover{transform:translateY(-3px);box-shadow:0 6px 16px rgba(0,0,0,.4),0 0 14px var(--d,#8CF2FF)}',
    '.dlbank i.on{animation:dlbank .45s cubic-bezier(.3,1.7,.5,1)}@keyframes dlbank{from{transform:scale(2.2)}to{transform:none}}.dlcoins{display:inline-block}',
    '.dlmvps figure{animation:dlmvp .6s cubic-bezier(.2,1.5,.4,1) both}.dlmvps figure:nth-child(2){animation-delay:.2s}.dlmvps figure:nth-child(3){animation-delay:.4s}@keyframes dlmvp{from{transform:translateY(40px) scale(.6);opacity:0}to{transform:none;opacity:1}}',
    '.dlparade{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 10px;margin:4px 0 8px}.dlparade span{display:flex;flex-direction:column;align-items:center;animation:dljoy .9s ease-in-out infinite alternate}.dlparade svg{width:clamp(44px,4.2vw,84px);height:auto;filter:drop-shadow(0 0 10px var(--c))}.dlparade b{font-size:clamp(11px,.9vw,18px);color:var(--c)}@keyframes dljoy{from{transform:translateY(0)}to{transform:translateY(-14px) rotate(4deg)}}@media (prefers-reduced-motion:reduce){.dlparade span{animation:none}}',
    '.dlmvps figure:first-child{box-shadow:0 0 30px rgba(255,225,77,.5)}',
    '.dl.screen{padding:12px 22px 20px;gap:14px}.dl.screen .dltop{margin:-12px -22px 0;padding:10px 22px;top:-12px}',
    '.dl.screen .dllogo{font-size:clamp(20px,2.4vw,46px)}.dl.screen .dlrd{font-size:clamp(12px,1.2vw,24px)}.dl.screen .dlclock{font-size:clamp(34px,4.2vw,84px)}.dl.screen .dlsub{font-size:clamp(12px,1.2vw,24px)}.dl.screen .dlsc{font-size:clamp(22px,2.8vw,56px);gap:.4em}.dl.screen .dlsc i{font-size:.4em}.dl.screen .dlsnd{font-size:clamp(18px,1.6vw,30px)}',
    '.dl.screen .dlbig{max-width:calc((100vh - clamp(280px,34vh,380px)) * 1.385)}.dl.screen .dlclock{line-height:1}',
    '.dl.screen .dlstrip{font-size:clamp(16px,1.6vw,32px)}.dl.screen .dlfeed{font-size:clamp(16px,1.6vw,32px)}',
    '.dl.screen .dlcard{padding:clamp(14px,1.4vw,28px)}.dl.screen .dlcard h2{font-size:clamp(26px,2.8vw,56px)}.dl.screen .dlcard h3{font-size:clamp(18px,1.8vw,36px);margin:0}.dl.screen .dlhow{font-size:clamp(16px,1.35vw,27px)}.dl.screen .dlbigp{font-size:clamp(18px,1.8vw,36px)}',
    '.dl.screen .dlteamcard h3{font-size:clamp(15px,1.3vw,26px)}.dl.screen .dlteamcard p{font-size:clamp(13px,1.1vw,22px)}.dl.screen .dlrr{font-size:clamp(15px,1.4vw,28px)}.dl.screen .dltop1{font-size:clamp(16px,1.5vw,30px)}',
    '.dl.screen .dlfeed{flex-direction:row;flex-wrap:wrap;justify-content:center;gap:2px 1.4em;min-height:2.8em;max-height:4.2em;overflow:hidden}.dl.screen .dlbig:has(+ .dlfeed){max-width:calc((100vh - 370px) * 1.385)}.dl.screen .dlcard .dlrecap ~ .dlfield{max-width:calc((100vh - 600px) * 1.385)}',
    '.dl.screen .dlcard .dlfield{max-width:calc((100vh - 360px) * 1.385);margin-left:auto;margin-right:auto}.dl.screen .dlhow{font-size:clamp(15px,1.15vw,24px)}',
    '.dl.screen .dlmvps figcaption{font-size:clamp(15px,1.4vw,28px)}.dl.screen .dlmvps svg{width:clamp(90px,7.5vw,160px);height:auto}',
    '@media (max-width:560px){.dl:not(.screen){padding:8px 8px 22px;gap:8px}.dl:not(.screen) .dltop{margin:-8px -8px 0;padding:6px 8px;top:-8px}.dl:not(.screen) .dllogo b{display:none}.dl:not(.screen) .dllogo{font-size:20px;letter-spacing:0}.dl:not(.screen) .dltop{gap:4px;grid-template-columns:minmax(0,1fr) auto minmax(0,1.3fr)}.dl:not(.screen) .dlsc{font-size:13px;gap:3px}.dl:not(.screen) .dlsc i{display:none}.dl:not(.screen) .dlsnd{font-size:14px;padding:3px 5px}.dl:not(.screen) .dlright{gap:4px}.dlwork{padding:10px 8px}}',
    '@media (prefers-reduced-motion:reduce){.dlclock.dlurg,.dlbank i.on,.dlmvps figure{animation:none}}'
  ].join('\n');
  var sty = document.createElement('style'); sty.textContent = css; document.head.appendChild(sty);

  window.SFA_DUEL = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: spot, restore: restore, duelOf: duelOf,
    sim: sim, scoreOf: scoreOf, parseF: parseF, lineThrough: lineThrough, pairScore: pairScore };   // the last few for the practice and test pages
})();
