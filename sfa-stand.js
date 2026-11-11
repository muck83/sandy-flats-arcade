/* 🐐 Stand on the Line ("Under the Pond"): the whole class on one coordinate grid. Loaded by sfa-lesson.js when the
   teacher starts it.

   Lobby: every avatar mills about on a grid from −6 to 6. Line rounds: the Voice gives a line (an equation, a start
   and a step in words, a table, two points, a slope and a point) and each student taps one lattice point on their own
   device; their avatar walks there on the class screen. On the line: 1 point. On a point of the line nobody else
   chose: 3 points. Then the elimination round: inequalities stack one at a time, and anyone still in who is standing
   outside the region (or nowhere) is butted off the grid by a goat. The goats are staff. Eliminated students play on as
   ghosts for 1 point a correct round.

   Sync through the Sheet like Sumo Graphing: students send one running row (q "zstandx1", an x1 extra, so it never
   counts as a lesson answer): "t1;id:<game>;g:<round>;p:<point>" (point = (y+6)×13 + (x+6), 169 = nowhere). The console
   referees and publishes in the live counts:
     zkid  the game's id, zkst the same on the server's clock
     zks   state (1 lobby, 2 line, 3 line shown, 4 rules of the elimination, 5 rule, 6 rule shown, 7 over), round, line
           rounds, round length, phase start (s after the id), students, paused (seconds left + 1), flag (state 6: 1 =
           everyone was wrong so nobody went; state 7: 1 = the podium is the survivors), constraints, elimination on,
           shade early, lobby length
     zkq   the line: form, slope number, intercept + 20, three x's of the description + 10, the worked x + 10
     zkc   the constraints, one number each
     zkp0… each student: point + 170 × (result + 4 × (ghost + 2 × butted)); zkx0… their scores, two to a number
   and the spotlight (spot.q "zstand"): "P:" a page of the roster (slot~fingerprint~name~look; long rosters take turns).
   Every screen works the words, the line, the region and the working out from those numbers.

   The maths (lines, constraints, scoring) is in the first part and has no page in it: climb/dev/stand-test.html checks it
   over thousands of seeds, and climb/dev/stand-sim.html plays a whole game with a pretend class. */
(function (root) {
  'use strict';
  /* ================= the maths ================= */
  var G = 6, N = 13, NONE = 169;
  // slopes that leave at least six lattice points of the line inside the grid
  var SL = [[0, 1], [1, 1], [-1, 1], [2, 1], [-2, 1], [1, 2], [-1, 2]];
  var OPS = ['<', '≤', '>', '≥'];
  function mix32(h) { h = h >>> 0; h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; }
  function rng(seed) { var s = mix32(seed) || 1; return function () { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return ((s >>> 8) & 0xffff) / 65536; }; }
  function PT(x, y) { return (y + G) * N + (x + G); }
  function PX(p) { return p % N - G; }
  function PY(p) { return Math.floor(p / N) - G; }
  function mkLine(si, b) { return { si: si, mn: SL[si][0], md: SL[si][1], b: b }; }
  // exactly on the line: whole numbers only, so nothing is rounded
  function onLine(Q, x, y) { return Q.md * (y - Q.b) === Q.mn * x; }
  function linePts(Q) {
    var out = [];
    for (var x = -G; x <= G; x++) { var t = Q.mn * x; if (t % Q.md !== 0) continue; var y = t / Q.md + Q.b; if (Math.abs(y) <= G) out.push([x, y]); }
    return out;
  }
  function bOK(si) { var out = []; for (var b = -G; b <= G; b++) { if (si === 0 && b === 0) continue; if (linePts(mkLine(si, b)).length >= 6) out.push(b); } return out; }
  var FORMS = { 3: [0, 1, 2], 4: [0, 1, 2, 3], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 3, 4], 7: [0, 1, 2, 2, 3, 3, 4] };
  // a game's lines: forms in order of difficulty; a zero slope, a negative slope and exactly one half slope; no line twice
  function genLines(seed, n) {
    n = Math.max(3, Math.min(7, Math.round(n) || 5));
    var R = rng(seed), pick = function (a) { return a[Math.floor(R() * a.length)]; };
    var shuf = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    var half = R() < 0.5 ? 5 : 6, neg = R() < 0.5 ? 2 : 4, pos = shuf([1, 3]);
    var extra = [pos[0], neg === 2 ? 4 : 2, pos[1], pick([1, 2, 3, 4])].slice(0, n - 3);
    // the first line is the friendliest: a whole-number slope (uphill when there is one)
    var first = extra.length ? extra.shift() : neg, rest = shuf([0, half].concat(first !== neg ? [neg] : []).concat(extra));
    var plan = [first].concat(rest), used = {}, out = [];
    plan.forEach(function (si, k) {
      var bs = bOK(si).filter(function (b) { return !used[si + ':' + b]; }), b = pick(bs); used[si + ':' + b] = 1;
      var Q = mkLine(si, b), pts = linePts(Q), form = FORMS[n][k], xs = [], i, j, m;
      if (form === 2) {   // a table of three rows whose x's don't go up evenly
        var tr = [];
        for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) for (m = j + 1; m < pts.length; m++) if (pts[j][0] - pts[i][0] !== pts[m][0] - pts[j][0]) tr.push([pts[i][0], pts[j][0], pts[m][0]]);
        xs = pick(tr);
      } else if (form === 3) {   // two points, not next to each other
        var pr = [];
        for (i = 0; i < pts.length; i++) for (j = i + 2; j < pts.length; j++) pr.push([pts[i][0], pts[j][0]]);
        xs = pick(pr);
      } else if (form === 4) xs = [pick(pts.filter(function (p) { return p[0] !== 0; }))[0]];
      // the working out uses a point that wasn't given away, left of the y-axis when there is one
      var free = pts.filter(function (p) { return xs.indexOf(p[0]) < 0 && !(form === 1 && p[0] === 0); }), left = free.filter(function (p) { return p[0] < 0; });
      var ex = (left.length ? pick(left) : free.length ? pick(free) : pts[0])[0];
      out.push({ form: form, si: si, mn: Q.mn, md: Q.md, b: b, xs: xs, ex: ex });
    });
    return out;
  }
  function lineY(Q, x) { return Q.mn * x / Q.md + Q.b; }

  // a constraint: k 0: y (op) slope·x + b; k 1: x (op) c. op 0 <, 1 ≤, 2 >, 3 ≥
  function sides(C, x, y) { return C.k === 1 ? [x, C.c] : [SL[C.si][1] * y, SL[C.si][0] * x + SL[C.si][1] * C.b]; }
  function sat(C, x, y) { var s = sides(C, x, y), L = s[0], Rr = s[1]; return C.op === 0 ? L < Rr : C.op === 1 ? L <= Rr : C.op === 2 ? L > Rr : L >= Rr; }
  function onEdge(C, x, y) { var s = sides(C, x, y); return s[0] === s[1]; }
  function strict(C) { return C.op === 0 || C.op === 2; }
  function region(cons) {
    var out = [];
    for (var p = 0; p < NONE; p++) { var x = PX(p), y = PY(p), ok = true; for (var i = 0; i < cons.length && ok; i++) ok = sat(cons[i], x, y); if (ok) out.push(p); }
    return out;
  }
  function edgePts(C) { var out = []; for (var p = 0; p < NONE; p++) if (onEdge(C, PX(p), PY(p))) out.push(p); return out; }
  // the next constraint: it must cut something away and leave at least `need` (never fewer than 4) lattice points
  function genCon(R, prev, need, o) {
    o = o || {}; need = Math.max(4, need || 4);
    var before = region(prev), cand = [], k, si, b, c, op;
    var same = function (C) { return prev.some(function (P) { return P.k === C.k && (C.k === 1 ? P.c === C.c : P.si === C.si && P.b === C.b); }); };
    var par = function (C) { return prev.some(function (P) { return P.k === C.k && (C.k === 1 || P.si === C.si); }); };
    for (si = 0; si < SL.length; si++) for (b = -G; b <= G; b++) for (op = 0; op < 4; op++) cand.push({ k: 0, si: si, b: b, op: op });
    for (c = -G + 1; c <= G - 1; c++) for (op = 0; op < 4; op++) cand.push({ k: 1, c: c, op: op });
    var ok = [];
    cand.forEach(function (C) {
      if (same(C)) return;
      var after = 0, live = 0;   // live: boundary points still in play, so solid or dashed matters
      before.forEach(function (p) { var s = sides(C, PX(p), PY(p)), L = s[0], Rr = s[1]; if (L === Rr) live++; if (C.op === 0 ? L < Rr : C.op === 1 ? L <= Rr : C.op === 2 ? L > Rr : L >= Rr) after++; });
      if (after < need || after > before.length - Math.max(2, Math.ceil(before.length * 0.15))) return;
      if (edgePts(C).length < 3) return;
      var ratio = after / before.length;
      ok.push({ C: C, after: after, ratio: ratio, good: ratio >= 0.45 && ratio <= 0.72 && live >= 2, par: par(C) });
    });
    if (!ok.length) return null;
    var pass = [
      function (x) { return x.good && !x.par && (o.strict == null || strict(x.C) === !!o.strict) && (o.kind == null || x.C.k === o.kind); },
      function (x) { return x.good && !x.par && (o.strict == null || strict(x.C) === !!o.strict); },
      function (x) { return x.good && (o.strict == null || strict(x.C) === !!o.strict); },
      function (x) { return x.good; }
    ];
    // gentle: the smallest cuts (for when more students are still in than a normal cut would leave points for)
    if (o.gentle) { ok.sort(function (a, b2) { return b2.after - a.after; }); return ok[Math.floor(R() * Math.min(5, ok.length))].C; }
    for (k = 0; k < pass.length; k++) { var L = ok.filter(pass[k]); if (L.length) return L[Math.floor(R() * L.length)].C; }
    ok.sort(function (a, b2) { return Math.abs(a.ratio - 0.6) - Math.abs(b2.ratio - 0.6); });
    return ok[Math.floor(R() * Math.min(5, ok.length))].C;
  }
  // results: 0 no answer, 1 on the line, 2 on the line and nobody else chose that point, 3 off the line
  function scoreLine(Q, picks) {
    var cnt = {}, res = {}, on = function (p) { return p != null && p < NONE && onLine(Q, PX(p), PY(p)); };
    Object.keys(picks).forEach(function (k) { var p = picks[k]; if (on(p)) cnt[p] = (cnt[p] || 0) + 1; });
    Object.keys(picks).forEach(function (k) { var p = picks[k]; res[k] = p == null || p >= NONE ? 0 : on(p) ? (cnt[p] === 1 ? 2 : 1) : 3; });
    return res;
  }
  // results: 0 no answer, 1 inside, 2 inside but sharing a point with another survivor (when dup is on), 3 outside.
  // out: the survivors who go. If that would be all of them, nobody goes (spared).
  function resolveElim(cons, alive, picks, dup) {
    var res = {}, cnt = {}, isAlive = {};
    alive.forEach(function (k) { isAlive[k] = 1; var p = picks[k]; if (p != null && p < NONE) cnt[p] = (cnt[p] || 0) + 1; });
    Object.keys(picks).concat(alive).forEach(function (k) {
      var p = picks[k];
      if (p == null || p >= NONE) { res[k] = 0; return; }
      var ok = cons.every(function (C) { return sat(C, PX(p), PY(p)); });
      res[k] = !ok ? 3 : dup && isAlive[k] && cnt[p] > 1 ? 2 : 1;
    });
    var fail = alive.filter(function (k) { return res[k] !== 1; }), spared = alive.length > 0 && fail.length === alive.length;
    return { res: res, out: spared ? [] : fail, spared: spared };
  }
  function encCon(C) { return C.k + 2 * (C.op + 4 * ((C.k === 1 ? 0 : C.si) + 7 * ((C.k === 1 ? C.c : C.b) + 10))); }
  function decCon(v) { var k = v % 2, r = Math.floor(v / 2), op = r % 4; r = Math.floor(r / 4); var si = r % 7, n = Math.floor(r / 7) - 10; return k === 1 ? { k: 1, c: n, op: op } : { k: 0, si: si, b: n, op: op }; }

  /* ---------- the words ---------- */
  function nm(n) { return n < 0 ? '−' + (-n) : String(n); }
  function pt(x, y) { return '(' + nm(x) + ', ' + nm(y) + ')'; }
  function slopeTxt(si) { var s = SL[si]; return s[1] === 2 ? (s[0] < 0 ? '−½' : '½') : nm(s[0]); }
  function rhs(si, b) {
    var s = SL[si]; if (s[0] === 0) return nm(b);
    var a = Math.abs(s[0]), co = (s[0] < 0 ? '−' : '') + (s[1] === 2 ? '½' : a === 1 ? '' : a);
    return co + 'x' + (b > 0 ? ' + ' + b : b < 0 ? ' − ' + (-b) : '');
  }
  function eqTxt(Q) { return 'y = ' + rhs(Q.si, Q.b); }
  function conTxt(C) { return C.k === 1 ? 'x ' + OPS[C.op] + ' ' + nm(C.c) : 'y ' + OPS[C.op] + ' ' + rhs(C.si, C.b); }
  // "x = −2: 2 × (−2) − 1 = −5, so (−2, −5) is on the line."
  function workLine(Q) {
    var x = Q.ex, y = lineY(Q, x), pre = Q.form === 0 ? '' : 'The rule is ' + eqTxt(Q) + '. ';
    if (Q.mn === 0) return pre + 'y is always ' + nm(Q.b) + ', so ' + pt(x, y) + ' is on the line.';
    return pre + 'x = ' + nm(x) + ': ' + slopeTxt(Q.si) + ' × ' + (x < 0 ? '(' + nm(x) + ')' : x) + (Q.b > 0 ? ' + ' + Q.b : Q.b < 0 ? ' − ' + (-Q.b) : '') + ' = ' + nm(y) + ', so ' + pt(x, y) + ' is on the line.';
  }
  // the newest constraint, tried on a point of its own boundary: "y > x + 1 at (1, 2): 2 > 2? No. …"
  function conWork(cons) {
    var C = cons[cons.length - 1], prev = cons.slice(0, -1), E = edgePts(C);
    var inside = E.filter(function (p) { return prev.every(function (P) { return sat(P, PX(p), PY(p)); }); }), p = (inside.length ? inside : E)[Math.floor(((inside.length ? inside : E).length - 1) / 2)];
    var x = PX(p), y = PY(p), v = C.k === 1 ? x : y;
    return conTxt(C) + ' at ' + pt(x, y) + ': ' + nm(v) + ' ' + OPS[C.op] + ' ' + nm(v) + '? ' + (strict(C) ? 'No. A point on a dashed line is out.' : 'Yes. A point on a solid line is in.');
  }

  var M = { G: G, N: N, NONE: NONE, SL: SL, OPS: OPS, rng: rng, PT: PT, PX: PX, PY: PY, mkLine: mkLine, onLine: onLine, linePts: linePts, bOK: bOK, genLines: genLines, lineY: lineY, sat: sat, onEdge: onEdge, strict: strict, region: region, edgePts: edgePts, genCon: genCon, scoreLine: scoreLine, resolveElim: resolveElim, encCon: encCon, decCon: decCon, nm: nm, pt: pt, eqTxt: eqTxt, conTxt: conTxt, slopeTxt: slopeTxt, workLine: workLine, conWork: conWork, FORMS: FORMS };
  root.SFA_STAND_MATH = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;

  /* ================= the game ================= */
  var window = root.window, A = window && window.SFA_LESSON_API, SFA = window && window.SFA, AV = window && window.SFA_AVATAR;
  if (!A || !SFA || window.SFA_STAND) return;
  var document = window.document, H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zstandx1', MAXS = 60, LOBBY = 10, LEAD = 3, GRACE = 7, REVEAL = 10, EINTRO = 11, EREVEAL = 12, DUP_FROM = 4, MAX_CON = 6, PUSH_MS = 4000;
  function hash(t) { var h = 5381; t = String(t); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h; }
  function sh3(sid) { return (hash(sid) % 46656).toString(36); }
  function clean(n) { return String(n || '').replace(/[~,#|.;]/g, '').slice(0, 12); }
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  function clock(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function avSvg(look, size) { return AV ? AV.svg(look || '', { size: size || 64, walk: true }) : '<span class="sgnoav">🙂</span>'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  // the game in the live state
  function standOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zks) || !Array.isArray(c.zkid)) return null;
    var z = c.zks, id = A.decRun(c.zkid), start = A.MODE === 'screen' ? id : A.decRun(c.zkst) || id;
    var o = { id: id, start: start, state: z[0], g: z[1] || 0, nLine: z[2] || 5, len: z[3] || 25, at: start + (z[4] || 0) * 1000, n: z[5] || 0, pause: z[6] || 0, flag: z[7] || 0, nc: z[8] || 0, elim: z[9] || 0, early: z[10] || 0, lobby: z[11] || LOBBY, Q: null, cons: [], sl: [], ros: [] };
    var q = c.zkq;
    if (Array.isArray(q) && q.length >= 7 && SL[q[1]]) { var Q = mkLine(q[1], q[2] - 20); Q.form = q[0]; Q.xs = [q[3] - 10, q[4] - 10, q[5] - 10].slice(0, [0, 0, 3, 2, 1][q[0]] || 0); Q.ex = q[6] - 10; o.Q = Q; }
    (Array.isArray(c.zkc) ? c.zkc : []).slice(0, o.nc).forEach(function (v) { o.cons.push(decCon(v)); });
    for (var i = 0; i < o.n; i++) {
      var v = (c['zkp' + Math.floor(i / 12)] || [])[i % 12], w = (c['zkx' + Math.floor(i / 24)] || [])[Math.floor((i % 24) / 2)] || 0;
      if (v == null) v = NONE;
      var f = Math.floor(v / 170);
      o.sl.push({ i: i, p: v % 170, res: f % 4, ghost: Math.floor(f / 4) % 2, butt: Math.floor(f / 8) % 2, sc: i % 2 ? w % 100 : Math.floor(w / 100) });
    }
    var sp = Lv.spot && Lv.spot.q === 'zstand' ? String(Lv.spot.text || '') : '';
    if (sp.slice(0, 2) === 'P:') sp.slice(2).split(',').forEach(function (x) { var p = x.split('~'); if (p[1]) o.ros.push({ i: +p[0], fp: p[1], n: p[2] || '?', look: p[3] || '' }); });
    return o;
  }
  function asking(st) { return st === 2 || st === 5; }
  function phaseLen(o) { return o.state === 1 ? (o.lobby || LOBBY) : asking(o.state) ? LEAD + o.len : o.state === 3 ? REVEAL : o.state === 4 ? EINTRO : o.state === 6 ? EREVEAL : 0; }
  function left(o) { return o.pause ? o.pause - 1 : phaseLen(o) - (sNow() - o.at) / 1000; }

  /* ---------- every screen ---------- */
  var rootEl = null, V = null, ST = null;
  function key() { return 'stand.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function screenish() { return A.MODE !== 'student'; }
  function xp(n, once) { if (A.hero && V && n > 0) A.hero.add('t', String(Math.round(V.id / 1000)) + (once ? 'e' : ''), n, once); }

  function sync() {
    var Lv = A.live(), o = A.isLive() || A.MODE === 'screen' ? standOf(Lv) : null;
    if (o && A.MODE !== 'teach' && stale(o)) o = null;
    if (A.MODE === 'student' && A.saving() && !A.S.me) o = null;
    if (!o) { if (rootEl && !(V && V.watch)) close(); return; }
    if (V && V.watch) return;
    if (!rootEl || V.id !== o.id) open(o);
    apply(o);
  }
  function stale(o) { if (o.pause) return false; var age = sNow() - o.at; return o.state === 7 ? age > 6 * 60000 : age > (o.len + 300) * 1000; }
  function open(o) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === o.id ? saved : { id: o.id, g: 0, p: NONE, xpG: 0, did: 0, endXp: 0 };
    V = { id: o.id, o: null, ros: {}, av: {}, sig: '' };
    var rs = SFA.store.get('stand.ros.' + A.LID, null); if (rs && rs.id === o.id) V.ros = rs.ros || {};
    rootEl = H('div', 'sg ' + (screenish() ? 'scr' : 'stu')); rootEl.setAttribute('role', 'dialog'); rootEl.setAttribute('aria-modal', 'true'); rootEl.setAttribute('aria-label', 'Stand on the Line');
    rootEl.innerHTML = '<div class="sgtop"><span class="sglogo">🐐 STAND ON THE LINE</span><span class="sgmid"><b class="sgph"></b><span class="sgclock"></span></span><span class="sgright"></span></div>' +
      '<div class="sgbody"><div class="sgside"></div><div class="sgsqw"><div class="sgsq"><div class="sgsvg"></div><div class="sglay"></div></div></div><div class="sginfo"></div></div><div class="sgfin" hidden></div>';
    document.body.appendChild(rootEl); document.body.classList.add('boarding'); document.body.classList.add('clashing');
    V.svg = rootEl.querySelector('.sgsvg'); V.lay = rootEl.querySelector('.sglay'); V.side = rootEl.querySelector('.sgside'); V.info = rootEl.querySelector('.sginfo'); V.fin = rootEl.querySelector('.sgfin');
    V.svg.addEventListener('click', function (e) { var t = e.target && e.target.closest && e.target.closest('[data-p]'); if (t) tap(+t.getAttribute('data-p')); });
    V.tick = setInterval(function () { if (rootEl) drawTop(); }, 250);
    V.mill = setInterval(mill, 600);
    V.rs = function () { fit(); }; window.addEventListener('resize', V.rs);
    if (A.MODE === 'student' && !(saved && saved.id === o.id)) send();   // so the console sees a late arrival and gives them a place
  }
  function close() {
    if (!rootEl) return;
    clearInterval(V.tick); clearInterval(V.mill); window.removeEventListener('resize', V.rs); (V.timers || []).forEach(clearTimeout);
    rootEl.remove(); rootEl = null; V = null; document.body.classList.remove('boarding'); document.body.classList.remove('clashing');
  }
  function later(f, ms) { (V.timers = V.timers || []).push(setTimeout(function () { if (rootEl) f(); }, ms)); }
  function fit() { if (!V || !V.lay) return; var w = V.lay.getBoundingClientRect().width || 600; V.lay.style.fontSize = Math.max(8, Math.round(w * 0.0165)) + 'px'; }

  // who's who: the roster arrives a page at a time, so every page keeps what it has seen
  function mergeRoster(o) {
    var ch = false;
    o.ros.forEach(function (r) { var x = V.ros[r.i]; if (!x || x.fp !== r.fp || x.look !== r.look || x.n !== r.n) { V.ros[r.i] = { fp: r.fp, n: r.n, look: r.look }; ch = true; } });
    if (ch) SFA.store.set('stand.ros.' + A.LID, { id: V.id, ros: V.ros });
    return ch;
  }
  function myFp() { return A.MODE === 'student' && A.S.me ? sh3(A.S.me.sid) : ''; }
  function mySlot() { var f = myFp(); if (!f) return -1; for (var k in V.ros) if (V.ros[k].fp === f) return +k; return -1; }
  function me(o) { var i = mySlot(); return i >= 0 && o.sl[i] ? o.sl[i] : null; }
  function nameOfSlot(i) { return V.ros[i] ? V.ros[i].n : '…'; }
  function myLook() { var i = mySlot(); if (i >= 0 && V.ros[i]) return V.ros[i].look; try { return AV.myLook(AV.profile(), A.S.me.sid); } catch (e) { return AV && A.S.me ? AV.defLook(A.S.me.sid) : ''; } }
  function alive(o) { return o.sl.filter(function (s) { return !s.ghost; }); }

  function apply(o) {
    var prev = V.o; V.o = o;
    var rch = mergeRoster(o);
    if (A.MODE === 'student') {
      if (ST.g !== o.g) { ST.g = o.g; ST.p = NONE; keep(); }
      var s = me(o);
      // class-game XP (5 XP is a coin in the Wardrobe), scaled like the Boss Raid: 10 for a right answer, 1 for a try
      if (s && (o.state === 3 || o.state === 6) && ST.xpG < o.g) { ST.xpG = o.g; if (s.res) ST.did = 1; keep(); xp(o.state === 3 ? (s.res === 2 ? 15 : s.res === 1 ? 10 : s.res === 3 ? 1 : 0) : (s.res === 1 ? 10 : s.res ? 1 : 0)); }
      if (s && o.state === 7 && !ST.endXp && ST.did) { ST.endXp = 1; keep(); xp(30 + (podium(o).some(function (x) { return x.i === s.i; }) ? 30 : 0), true); }
    }
    var sig = [o.state, o.g, o.nc, o.flag, o.early].join('|');
    if (sig !== V.sig) { var was = V.sig; V.sig = sig; draw(); if (o.state === 6 && was && prev && prev.state === 5) butts(o); else if (o.state === 6) o.sl.forEach(function (s2) { if (s2.butt) { var a = V.av[s2.i]; if (a) a.gone = true; } }); }
    else if (rch && o.state === 7) draw();
    updAv(); updInfo(); drawTop();
  }

  /* ---------- the grid ---------- */
  function sx(x) { return 350 + 50 * x; }
  function sy(y) { return 350 - 50 * y; }
  function px(x) { return sx(x) / 7; }   // per cent of the square
  function py(y) { return sy(y) / 7; }
  // the allowed region as a polygon: the square cut by each half-plane
  function regionPoly(cons) {
    var B = G + 0.5, poly = [[-B, -B], [B, -B], [B, B], [-B, B]];
    cons.forEach(function (C) {
      var a, b, c, s = C.k === 1 ? null : SL[C.si];
      if (C.k === 1) { a = 1; b = 0; c = -C.c; } else { a = -s[0]; b = s[1]; c = -s[1] * C.b; }   // a·x + b·y + c (op) 0
      if (C.op >= 2) { a = -a; b = -b; c = -c; }
      var f = function (p) { return a * p[0] + b * p[1] + c; }, out = [];
      for (var i = 0; i < poly.length; i++) {
        var p = poly[i], q = poly[(i + 1) % poly.length], fp = f(p), fq = f(q);
        if (fp <= 0) out.push(p);
        if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { var t = fp / (fp - fq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
      }
      poly = out;
    });
    return poly;
  }
  // a straight line cut to the square: a·x + b·y = c
  function seg(a, b, c) {
    var B = G + 0.5, pts = [];
    var add = function (x, y) { if (Math.abs(x) <= B + 1e-9 && Math.abs(y) <= B + 1e-9 && !pts.some(function (p) { return Math.abs(p[0] - x) < 1e-6 && Math.abs(p[1] - y) < 1e-6; })) pts.push([x, y]); };
    if (b !== 0) { add(-B, (c + a * B) / b); add(B, (c - a * B) / b); }
    if (a !== 0) { add((c + b * B) / a, -B); add((c - b * B) / a, B); }
    return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
  }
  function conSeg(C) { var s = C.k === 1 ? null : SL[C.si]; return C.k === 1 ? seg(1, 0, C.c) : seg(-s[0], s[1], s[1] * C.b); }
  function gridSvg(o) {
    var s = '<svg viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Coordinate grid from −6 to 6">', i, p;
    s += '<rect x="6" y="6" width="688" height="688" rx="18" fill="#F4F1E6" stroke="#1d2a30" stroke-width="5"/>';
    var shown = o.state === 6 ? o.cons : o.state === 5 ? (o.early ? o.cons : o.cons.slice(0, -1)) : [];
    if (shown.length) { var poly = regionPoly(shown); if (poly.length > 2) s += '<polygon class="sgreg" points="' + poly.map(function (q) { return sx(q[0]).toFixed(1) + ',' + sy(q[1]).toFixed(1); }).join(' ') + '"/>'; }
    for (i = -G; i <= G; i++) s += '<line class="sggl' + (i === 0 ? ' ax' : '') + '" x1="' + sx(i) + '" y1="' + sy(-G - 0.4) + '" x2="' + sx(i) + '" y2="' + sy(G + 0.4) + '"/><line class="sggl' + (i === 0 ? ' ax' : '') + '" x1="' + sx(-G - 0.4) + '" y1="' + sy(i) + '" x2="' + sx(G + 0.4) + '" y2="' + sy(i) + '"/>';
    for (i = -G; i <= G; i++) if (i) s += '<text class="sgnum" x="' + sx(i) + '" y="' + (sy(0) + 19) + '">' + nm(i) + '</text><text class="sgnum" x="' + (sx(0) - 9) + '" y="' + (sy(i) + 5) + '" text-anchor="end">' + nm(i) + '</text>';
    s += '<text class="sgnum ax" x="' + (sx(G) + 22) + '" y="' + (sy(0) - 8) + '">x</text><text class="sgnum ax" x="' + (sx(0) + 12) + '" y="' + (sy(G) - 14) + '">y</text>';
    shown.forEach(function (C, k) { var g = conSeg(C); if (g) s += '<line class="sgbd' + (strict(C) ? ' dash' : '') + (k === shown.length - 1 && (o.state === 6 || o.early) ? ' new' : '') + '" x1="' + sx(g[0][0]) + '" y1="' + sy(g[0][1]) + '" x2="' + sx(g[1][0]) + '" y2="' + sy(g[1][1]) + '"/>'; });
    var onL = {}, inR = null, hollow = {};
    if (o.state === 3 && o.Q) {
      var g2 = seg(-o.Q.mn, o.Q.md, o.Q.md * o.Q.b); if (g2) s += '<line class="sgline" x1="' + sx(g2[0][0]) + '" y1="' + sy(g2[0][1]) + '" x2="' + sx(g2[1][0]) + '" y2="' + sy(g2[1][1]) + '"/>';
      linePts(o.Q).forEach(function (q) { onL[PT(q[0], q[1])] = 1; });
    }
    if (shown.length) { inR = {}; region(shown).forEach(function (q) { inR[q] = 1; }); shown.forEach(function (C) { if (strict(C)) edgePts(C).forEach(function (q) { hollow[q] = 1; }); }); }
    var uni = {}; if (o.state === 3) o.sl.forEach(function (x) { if (x.res === 2) uni[x.p] = 1; });
    for (p = 0; p < NONE; p++) {
      var x = PX(p), y = PY(p), cls = 'sgdot' + (onL[p] ? ' on' : '') + (uni[p] ? ' uni' : '') + (inR ? (inR[p] ? ' in' : hollow[p] ? ' hol' : ' no') : '');
      s += '<circle class="' + cls + '" cx="' + sx(x) + '" cy="' + sy(y) + '" r="' + (onL[p] ? 9 : inR && inR[p] ? 6.5 : 4.5) + '"/>';
    }
    if (!screenish()) {
      // on a student's own screen: where everyone else stood (once it's shown), their own point, and somewhere to tap
      if (o.state === 3 || o.state === 6) { var cnt = {}; o.sl.forEach(function (x2) { if (x2.p < NONE) cnt[x2.p] = (cnt[x2.p] || 0) + 1; }); Object.keys(cnt).forEach(function (q) { s += '<circle class="sgoth" cx="' + sx(PX(+q)) + '" cy="' + sy(PY(+q)) + '" r="' + Math.min(20, 9 + 2.5 * cnt[q]) + '"/>'; }); }
      if (ST && ST.p < NONE) s += '<circle class="sgmine" cx="' + sx(PX(ST.p)) + '" cy="' + sy(PY(ST.p)) + '" r="17"/>';
      if (asking(o.state)) for (p = 0; p < NONE; p++) s += '<circle class="sghit" data-p="' + p + '" cx="' + sx(PX(p)) + '" cy="' + sy(PY(p)) + '" r="25"/>';
    }
    return s + '</svg>';
  }

  /* ---------- avatars ---------- */
  function avFor(i) {
    var a = V.av[i]; if (a) return a;
    var e = H('div', 'sga', '<div class="sgav"></div><span class="sgn"></span><i class="sgb"></i>');
    a = V.av[i] = { el: e, x: (Math.random() * 2 - 1) * G, y: (Math.random() * 2 - 1) * G, look: null, next: 0, at: null };
    e.style.left = px(a.x) + '%'; e.style.top = py(a.y) + '%'; e.style.zIndex = 100 + Math.round(py(a.y));
    V.lay.appendChild(e);
    return a;
  }
  function dress(a, look, name) {
    if (a.look !== look) { a.look = look; a.el.querySelector('.sgav').innerHTML = avSvg(look, 64); }
    if (a.n !== name) { a.n = name; a.el.querySelector('.sgn').textContent = name; }
  }
  function moveTo(a, x, y, ms, ease) {
    a.x = x; a.y = y;
    a.el.style.transition = 'left ' + ms + 'ms ' + ease + ',top ' + ms + 'ms ' + ease + ',opacity .6s,filter .6s,transform .7s ease-in';
    a.el.style.left = px(x) + '%'; a.el.style.top = py(y) + '%'; a.el.style.zIndex = 100 + Math.round(py(y));
    a.el.classList.add('mv'); clearTimeout(a.wt); a.wt = setTimeout(function () { a.el.classList.remove('mv'); }, ms);
  }
  // nobody stands still until they have chosen a point
  function mill() {
    if (!V || !V.o || V.o.state === 7) return;
    var now = Date.now();
    Object.keys(V.av).forEach(function (k) {
      var a = V.av[k]; if (!a.mill || a.gone || now < a.next) return;
      var ms = 2400 + Math.random() * 1600;
      moveTo(a, Math.max(-G, Math.min(G, a.x + (Math.random() * 2 - 1) * 4)), Math.max(-G, Math.min(G, a.y + (Math.random() * 2 - 1) * 4)), ms, 'linear');
      a.next = now + ms + Math.random() * 900;
    });
  }
  function updAv() {
    var o = V.o; if (!o || o.state === 7) return;
    var show = o.state === 3 || o.state === 6, list = [];
    if (screenish()) list = o.sl.map(function (s) { var r = V.ros[s.i]; return { s: s, look: r ? r.look : (AV ? AV.defLook('slot' + s.i) : ''), n: r ? r.n : '' }; });
    else {
      var s0 = me(o), mine = { i: s0 ? s0.i : -1, p: show && s0 ? s0.p : ST.p, res: s0 ? s0.res : 0, ghost: s0 ? s0.ghost : (o.state >= 5 ? 1 : 0), butt: s0 ? s0.butt : 0 };
      if (asking(o.state)) mine.p = ST.p;
      list = [{ s: mine, look: myLook(), n: 'You', me: true }];
    }
    var per = {}; list.forEach(function (x) { if (x.s.p < NONE) (per[x.s.p] = per[x.s.p] || []).push(x.s.i); });
    list.forEach(function (x) {
      var s = x.s, a = avFor(x.me ? 'me' : s.i); dress(a, x.look, x.n);
      a.el.hidden = !!x.me && s.p >= NONE;
      if (s.p < NONE) {
        var grp = per[s.p], n = grp.length, k = grp.indexOf(s.i), step = Math.min(0.36, 1.3 / n), tx = PX(s.p) + (k - (n - 1) / 2) * step, ty = PY(s.p);
        a.mill = false;
        if (a.at !== s.p || Math.abs(a.x - tx) > 0.01 || Math.abs(a.y - ty) > 0.01) { if (!a.gone) moveTo(a, tx, ty, a.at == null && !x.me ? 1300 : 1100, 'ease-in-out'); a.at = s.p; }
        a.el.querySelector('.sgb').textContent = show && o.state === 3 ? (s.res === 2 ? '★ 3' : s.res === 1 && k === n - 1 ? '+1' + (n > 1 ? ' each' : '') : '') : show ? '' : (n > 1 && k === n - 1 ? '×' + n : '');
      } else { a.mill = !s.butt; a.at = null; a.el.querySelector('.sgb').textContent = ''; }
      if (!s.butt && a.gone) { a.gone = false; }
      var c = 'sga' + (a.el.classList.contains('mv') ? ' mv' : '') + (x.me ? ' me' : '') + (s.ghost && !s.butt ? ' ghost' : '') + (a.gone ? ' gone' : '');
      if (show && !a.gone) c += o.state === 3 ? (s.res === 2 ? ' uni' : s.res === 1 ? ' on' : ' off') : (s.butt ? '' : s.res === 1 ? ' on' : ' off');
      if (a.el.className !== c) a.el.className = c;
    });
    fit();
  }
  // the goats: one per student who goes, straight across the grid
  var GOAT = '<svg viewBox="0 0 124 92" xmlns="http://www.w3.org/2000/svg"><g stroke="#141428" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M28 56v26M40 58v24M74 58v24M86 56v26" stroke-width="7" stroke="#CFC8B4"/><path d="M24 84h9M36 84h9M70 84h9M82 84h9" stroke-width="6"/>' +
    '<ellipse cx="58" cy="48" rx="35" ry="19" fill="#F1ECDD"/><path d="M24 44l-13-9 9 16z" fill="#F1ECDD"/>' +
    '<path d="M96 20c-8-12 2-20 10-18-6 6-4 12 0 18zM104 22c0-12 10-16 17-12-8 3-9 8-8 14z" fill="#B9AE96"/>' +
    '<path d="M84 44l10-24 16-2 12 22c0 8-6 10-12 8l-14-2z" fill="#F1ECDD"/><path d="M92 24l-14 6 14 4z" fill="#F1ECDD"/>' +
    '<path d="M104 48l4 16 4-14z" fill="#E9E4D4"/><ellipse cx="104" cy="30" rx="4.5" ry="4" fill="#FFE9A8"/><path d="M101 30h6" stroke-width="3.2"/>' +
    '<path d="M88 42l-5 16" stroke="#2E6DA4" stroke-width="2.5"/><rect x="74" y="57" width="18" height="12" rx="2" fill="#fff" stroke-width="2"/><path d="M76 60h14" stroke="#2E6DA4" stroke-width="3"/></g></svg>';
  function butts(o) {
    var who = o.sl.filter(function (s) { return s.butt; }), n = 0;
    who.forEach(function (s) {
      var a = V.av[screenish() ? s.i : 'me']; if (!a || (!screenish() && (!me(o) || me(o).i !== s.i))) return;
      var k = n++, delay = 1400 + Math.min(k, 12) * 220, run = 900;
      a.mill = false;
      later(function () {
        var fromL = a.x <= 0, y = a.y, x0 = px(a.x);
        var g = H('div', 'sggoat' + (fromL ? '' : ' flip'), GOAT); g.style.top = py(y) + '%'; g.style.left = (fromL ? -8 : 108) + '%'; V.lay.appendChild(g);
        g.getBoundingClientRect();
        g.style.transition = 'left ' + run + 'ms linear'; g.style.left = x0 + '%';
        later(function () {
          a.gone = true; a.el.classList.add('gone');
          a.el.style.transition = 'left 800ms ease-in,top 800ms ease-in,opacity .8s .3s,transform .8s ease-in';
          a.el.style.left = (fromL ? 118 : -18) + '%'; a.el.style.top = (py(y) - 18) + '%';
          a.x = fromL ? G + 1.5 : -G - 1.5;
          g.style.transition = 'left 700ms linear,opacity .5s .5s'; g.style.left = (fromL ? x0 + 14 : x0 - 14) + '%'; g.style.opacity = '0';
          later(function () { g.remove(); }, 1300);
        }, run);
      }, delay);
    });
  }

  /* ---------- words on every screen ---------- */
  function voice(t) { return '<div class="sgvoice"><i>THE VOICE</i><p>' + t + '</p></div>'; }
  function taskCard(Q) {
    var x = Q.xs, h;
    if (Q.form === 0) h = '<b class="sgeq">' + esc(eqTxt(Q)) + '</b>';
    else if (Q.form === 1) h = '<span>Start at <b>' + pt(0, Q.b) + '</b>.</span><span>For each <b>' + Q.md + '</b> step' + (Q.md > 1 ? 's' : '') + ' right, ' + (Q.mn === 0 ? '<b>stay level</b>' : 'go <b>' + (Q.mn < 0 ? 'down ' + (-Q.mn) : 'up ' + Q.mn) + '</b>') + '.</span>';
    else if (Q.form === 2) h = '<table class="sgtbl"><tr><th>x</th>' + x.map(function (v) { return '<td>' + nm(v) + '</td>'; }).join('') + '</tr><tr><th>y</th>' + x.map(function (v) { return '<td>' + nm(lineY(Q, v)) + '</td>'; }).join('') + '</tr></table>';
    else if (Q.form === 3) h = '<span>Through <b>' + pt(x[0], lineY(Q, x[0])) + '</b></span><span>and <b>' + pt(x[1], lineY(Q, x[1])) + '</b>.</span>';
    else h = '<span>Slope <b>' + slopeTxt(Q.si) + '</b>.</span><span>Through <b>' + pt(x[0], lineY(Q, x[0])) + '</b>.</span>';
    return '<div class="sgtask">' + h + '</div>';
  }
  var ASK = ['Stand on this line.', 'Stand on the line this describes.', 'This table is from a line. Stand on it.', 'A line goes through these two points. Stand on it.', 'Stand on the line with this slope, through this point.'];
  function rulesList(o, upTo) { return '<ol class="sgrules">' + o.cons.slice(0, upTo).map(function (C, k) { return '<li class="' + (k === o.cons.length - 1 ? 'new' : '') + '"><b>' + esc(conTxt(C)) + '</b><small>' + (strict(C) ? 'dashed' : 'solid') + '</small></li>'; }).join('') + '</ol>'; }
  function board(o, n) {
    var L = o.sl.slice().sort(function (a, b) { return b.sc - a.sc || a.i - b.i; }).slice(0, n), fin = o.state === 7;
    return '<ol class="sglb">' + L.map(function (s) { return '<li' + (mySlot() === s.i ? ' class="me"' : '') + '><span>' + esc(nameOfSlot(s.i)) + (fin ? (o.flag && !s.ghost ? ' 🏅' : '') : s.ghost ? ' 👻' : '') + '</span><b>' + s.sc + '</b></li>'; }).join('') + '</ol>';
  }
  function podium(o) {
    var L = (o.flag ? alive(o) : o.sl.slice()).sort(function (a, b) { return b.sc - a.sc || a.i - b.i; });
    return o.flag ? L : L.slice(0, 3);
  }
  function phase(o) {
    return o.state === 1 ? 'THE GRID' : o.state === 2 || o.state === 3 ? 'LINE ' + o.g + ' OF ' + o.nLine : o.state === 4 ? 'FINAL TASK' : o.state === 5 || o.state === 6 ? 'RULE ' + o.nc : 'RESULTS';
  }
  function drawTop() {
    var o = V && V.o; if (!o || !rootEl) return;
    var ph = rootEl.querySelector('.sgph'), ck = rootEl.querySelector('.sgclock'), t = left(o), txt = '';
    if (o.pause) txt = '⏸ ' + clock(t);
    else if (asking(o.state)) txt = t > 0 ? clock(t) : 'Counting…';
    else if (o.state === 1) txt = t > 0 ? clock(t) : '';
    if (ph.textContent !== phase(o)) ph.textContent = phase(o);
    if (ck.textContent !== txt) ck.textContent = txt;
    ck.className = 'sgclock' + (asking(o.state) && !o.pause && t <= 5 ? ' low' : '');
    // a student's grid locks the moment time is up
    if (!screenish() && asking(o.state)) { var open2 = o.pause || t > 0; if (V.canTap !== open2) { V.canTap = open2; V.svg.classList.toggle('lock', !open2); updInfo(); } }
  }
  function draw() {
    var o = V.o; if (!rootEl) return;
    var fin = o.state === 7;
    rootEl.querySelector('.sgbody').hidden = fin; V.fin.hidden = !fin;
    var R = rootEl.querySelector('.sgright'); R.innerHTML = '';
    if (V.watch) { var xb = el('button', { type: 'button', 'class': 'btn sgback', text: '✕ Back to the console' }); xb.onclick = function () { close(); }; R.appendChild(xb); }
    else R.appendChild(H('span', 'sgscore'));
    if (fin) { drawFin(o); return; }
    V.canTap = null;
    V.svg.innerHTML = gridSvg(o);
    var h = '';
    if (o.state === 1) h = voice('Welcome to the grid. Milling is permitted for ten seconds.') + '<p class="sgnote">Next: a line. Tap a point on your own screen and your avatar walks there.</p>';
    else if (o.state === 2) h = voice('Line ' + o.g + '. ' + ASK[o.Q.form]) + taskCard(o.Q) + '<p class="sgnote">On the line: <b>1 point</b>. On a point nobody else chose: <b>3 points</b>.</p>';
    else if (o.state === 3) h = voice('The line has been drawn.') + taskCard(o.Q) + '<p class="sgwork">' + esc(workLine(o.Q)) + '</p>';
    else if (o.state === 4) h = voice('Final task. Rules will be added one at a time. Stand where every rule is true. The penalty is goats. The goats are staff.') + '<p class="sgnote"><b>Solid line:</b> points on it are in.<br><b>Dashed line:</b> points on it are out.</p><p class="sgnote">From rule ' + DUP_FROM + ': two survivors on one point are both out.</p>';
    else if (o.state === 5) h = voice('Rule ' + o.nc + '. Stand where every rule is true.') + rulesList(o, o.nc) + (o.nc >= DUP_FROM ? '<p class="sgnote warn">Two survivors on one point are both out.</p>' : '');
    else if (o.state === 6) h = voice(o.flag ? 'Everyone still in was wrong. Nobody can be removed. The goats have been stood down.' : o.sl.some(function (s) { return s.butt; }) ? plural(o.sl.filter(function (s) { return s.butt; }).length, 'student') + ' removed by goat.' : 'Nobody removed. The goats are waiting.') + rulesList(o, o.nc) + '<p class="sgwork">' + esc(conWork(o.cons)) + '</p>' + (o.nc === DUP_FROM - 1 ? '<p class="sgnote warn">From the next rule: two survivors on one point are both out.</p>' : '');
    V.side.innerHTML = h;
    V.infoSig = ''; updInfo(); fit();
  }
  // the part that changes while a round runs: who has chosen, who is on the line, what happened to you
  function updInfo() {
    var o = V.o; if (!o || o.state === 7 || !rootEl) return;
    var h = '', sc = rootEl.querySelector('.sgscore');
    if (screenish()) {
      var n = o.sl.length, st = o.sl.filter(function (s) { return s.p < NONE; }).length, al = alive(o);
      if (sc) sc.textContent = o.state >= 5 ? al.length + ' still in' : n + ' on the grid';
      if (o.state === 1) h = '<p class="sgbig"><b>' + n + '</b> on the grid</p>';
      else if (o.state === 2) h = '<p class="sgbig"><b>' + st + '</b> of ' + n + ' standing</p>';
      else if (o.state === 3) {
        var on = o.sl.filter(function (s) { return s.res === 1 || s.res === 2; }), un = o.sl.filter(function (s) { return s.res === 2; }), off = o.sl.filter(function (s) { return s.res === 3; }).length, none = o.sl.filter(function (s) { return s.res === 0; }).length;
        h = '<p class="sgbig"><b>' + on.length + '</b> on the line · <b>' + un.length + '</b> alone on a point</p>' +
          (un.length ? '<p class="sgnames gold">★ 3 points: ' + un.map(function (s) { return esc(nameOfSlot(s.i)) + ' ' + pt(PX(s.p), PY(s.p)); }).join(', ') + '</p>' : '') +
          (on.length > un.length ? '<p class="sgnames">On the line: ' + on.filter(function (s) { return s.res === 1; }).map(function (s) { return esc(nameOfSlot(s.i)); }).join(', ') + '</p>' : '') +
          '<p class="sgnote">' + plural(off, 'incident') + ' filed' + (none ? ' · ' + none + ' stood nowhere' : '') + '.</p><h4>Top 5</h4>' + board(o, 5);
      }
      else if (o.state === 4) h = '<p class="sgbig"><b>' + al.length + '</b> in</p>';
      else if (o.state === 5) h = '<p class="sgbig"><b>' + al.filter(function (s) { return s.p < NONE; }).length + '</b> of ' + al.length + ' still in are standing</p>' + (n > al.length ? '<p class="sgnote">👻 Ghosts: 1 point for a correct point.</p>' : '');
      else if (o.state === 6) {
        var out = o.sl.filter(function (s) { return s.butt; });
        h = '<p class="sgbig"><b>' + al.length + '</b> still in</p>' + (out.length ? '<p class="sgnames">Out: ' + out.map(function (s) { return esc(nameOfSlot(s.i)) + (s.res === 2 ? ' (shared a point)' : s.res === 0 ? ' (stood nowhere)' : ''); }).join(', ') + '</p>' : '') +
          (al.length <= 8 ? '<p class="sgnames gold">Still in: ' + al.map(function (s) { return esc(nameOfSlot(s.i)); }).join(', ') + '</p>' : '');
      }
    } else {
      var s = me(o), mineP = asking(o.state) ? ST.p : s ? s.p : NONE, where = mineP < NONE ? pt(PX(mineP), PY(mineP)) : '';
      if (sc) sc.textContent = s ? plural(s.sc, 'point') + (s.ghost ? ' 👻' : '') : '';
      var ghost = s ? s.ghost : o.state >= 5, late = !!s && s.res === 0 && s.p >= NONE && ST.g === o.g && ST.p < NONE;
      if (o.state === 1) h = '<p class="sgbig">Get ready.</p><p class="sgnote">When a line appears, tap a point on the grid.</p>';
      else if (asking(o.state)) {
        if (V.canTap === false) h = '<p class="sgbig">Time is up. Counting.</p>' + (where ? '<p class="sgnote">You stood on ' + where + '.</p>' : '<p class="sgnote">You did not stand anywhere.</p>');
        else h = where ? '<p class="sgbig">You are standing on <b>' + where + '</b>.</p><p class="sgnote">Tap another point to move.</p>' : '<p class="sgbig">Tap a point on the grid.</p>';
        if (o.state === 5 && ghost) h += '<p class="sgnote">👻 You are a ghost. A correct point is still 1 point.</p>';
      }
      else if (o.state === 3) {
        if (!s) h = '<p class="sgnote">Finding your place on the grid…</p>';
        else h = s.res === 2 ? '<p class="sgbig good">On the line, and alone on ' + where + '. <b>3 points.</b></p>' : s.res === 1 ? '<p class="sgbig good">On the line. <b>1 point.</b></p>' : s.res === 3 ? '<p class="sgbig bad">' + where + ' is not on the line. Incident filed.</p>' : '<p class="sgbig bad">' + (late ? 'Your tap arrived after time was up, so it did not count.' : 'You did not stand anywhere. Incident filed.') + '</p>';
      }
      else if (o.state === 4) h = '<p class="sgbig">Everyone starts in.</p>';
      else if (o.state === 6) {
        if (!s) h = '<p class="sgnote">You joined late, so you are a ghost. A correct point is 1 point.</p>';
        else if (s.butt) h = '<p class="sgbig bad">' + (s.res === 2 ? where + ' was correct, but another survivor stood there. Both out.' : s.res === 3 ? where + ' breaks a rule. Goat.' : late ? 'Your tap arrived after time was up. Goat.' : 'You did not stand anywhere. Goat.') + '</p><p class="sgnote">👻 You are a ghost now. A correct point is still 1 point.</p>';
        else if (s.res === 1) h = '<p class="sgbig good">' + where + ' follows every rule. ' + (s.ghost ? '' : 'You are still in. ') + '<b>1 point.</b></p>';
        else h = '<p class="sgbig bad">' + (s.res === 0 ? (late ? 'Your tap arrived after time was up.' : 'You did not stand anywhere.') : s.res === 2 ? where + ' was shared.' : where + ' breaks a rule.') + (o.flag && !s.ghost ? ' Everyone was wrong, so you stay in.' : '') + '</p>';
      }
    }
    if (h !== V.infoSig) { V.infoSig = h; V.info.innerHTML = h; if (!screenish() && asking(o.state)) { V.svg.innerHTML = gridSvg(o); } }
  }
  function drawFin(o) {
    var P = podium(o), top = P.slice(0, 3), h = '';
    h += '<div class="sgfinL">' + voice('The task is complete. An incident slip has been filed for everything else.') + '<h2>' + (o.flag ? (P.length === 1 ? 'LAST ONE STANDING' : 'STILL STANDING') : 'TOP OF THE GRID') + '</h2><div class="sgpod">' +
      [1, 0, 2].filter(function (k) { return top[k]; }).map(function (k) { var s = top[k], r = V.ros[s.i]; return '<div class="sgstep s' + k + '">' + avSvg(r ? r.look : '', 110) + '<b>' + esc(nameOfSlot(s.i)) + '</b><i>' + plural(s.sc, 'point') + '</i><span>' + (k + 1) + '</span></div>'; }).join('') + '</div>' +
      (P.length > 3 ? '<p class="sgnames gold">Also still standing: ' + P.slice(3).map(function (s) { return esc(nameOfSlot(s.i)); }).join(', ') + '</p>' : '') + '</div>';
    var s0 = me(o), rank = s0 ? o.sl.filter(function (x) { return x.sc > s0.sc; }).length + 1 : 0;
    h += '<div class="sgfinR">' + (s0 ? '<p class="sgbig">You: <b>' + plural(s0.sc, 'point') + '</b>, place ' + rank + ' of ' + o.sl.length + '.</p>' : '') + '<h4>Everyone, by points</h4>' + board(o, 60) + '</div>';
    V.fin.innerHTML = h;
    if (!V.conf) { V.conf = 1; try { A.confetti(); } catch (e) { } }
  }

  /* ---------- a student's turn ---------- */
  var sendT = null;
  function tap(p) {
    var o = V && V.o; if (!o || A.MODE !== 'student' || !asking(o.state) || V.canTap === false || !(p >= 0 && p < NONE)) return;
    ST.g = o.g; ST.p = p; keep();
    V.infoSig = ''; updAv(); updInfo();
    clearTimeout(sendT); sendT = setTimeout(send, left(o) < 4 ? 0 : 350);
  }
  function send() {
    clearTimeout(sendT); if (A.MODE !== 'student' || !V) return;
    A.record({ id: QID, k: 'open' }, 't1;id:' + Math.round(V.id / 1000) + ';g:' + ST.g + ';p:' + ST.p, null);
  }

  /* ---------- the console: the referee ---------- */
  function C() { return A.console_().stand; }
  function save(K) { try { SFA.store.set('teacher.stand.' + A.LID, K); } catch (e) { } }
  function active() {
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = r; });
    var here = {}; (A.consoleAnswers() || []).forEach(function (a) { if (ids[a.sid] && !A.beforeRun(a)) here[a.sid] = 1; });
    return Object.keys(here);
  }
  function nameOf(sid) { var r = A.rosterIn().filter(function (x) { return x.sid === sid; })[0]; return r ? clean(A.first(r.name).replace(/[^A-Za-zÀ-ÿ' -]/g, '')) : '?'; }
  function looksBySid() {
    var out = {}, t = {};
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q !== 'zlookx1') return; var m = String(a.answer).match(/^lk1;([0-9a-z]{1,12})/); if (m && (!t[a.sid] || String(a.time) >= t[a.sid])) { t[a.sid] = String(a.time); out[a.sid] = m[1]; } });
    return out;
  }
  function secs() { return Math.round(Date.now() / 1000) * 1000; }
  function go(K) { K.lastPush = Date.now(); save(K); (A.pushNow || A.pushLive)(); A.consolePanel(); }
  function aliveSids(K) { return K.slots.filter(function (s) { return !K.ghost[s]; }); }
  function picksOf(K) { var out = {}; K.slots.forEach(function (s) { out[s] = K.pos[s] == null ? NONE : K.pos[s]; }); return out; }
  function tal(K, sid) { return K.tal[sid] || (K.tal[sid] = { on: 0, uni: 0, off: 0, none: 0, ok: 0, bad: 0, out: 0 }); }
  function start(nLine, len, elimOn, early) {
    var who = active();
    if (!who.length) { SFA.toast('Nobody has joined yet: wait for students to join, then start.', 4000); return false; }
    var t = secs();
    nLine = Math.max(3, Math.min(7, Math.round(nLine) || 5)); len = Math.max(15, Math.min(40, Math.round(len) || 25));
    var K = { id: t, state: 1, g: 0, at: t, nLine: nLine, len: len, elim: elimOn ? 1 : 0, early: early ? 1 : 0, slots: who.slice(0, MAXS), ghost: {}, butt: {}, res: {}, pos: {}, sc: {}, rows: {}, tal: {}, lines: genLines(Math.floor(t / 1000) ^ Math.floor(Math.random() * 1e9), nLine), cons: [], er: 0, flag: 0, pausedAt: 0, cur: 0, lastPush: 0, lastSave: 0, hist: [], skips: 0 };
    A.console_().stand = K; save(K);
    A.pushLive(); A.consolePanel();
    return true;
  }
  function newRound(K, st) { K.state = st; K.g++; K.at = secs(); K.pos = {}; K.res = {}; K.butt = {}; K.flag = 0; }
  function nextLine(K) {
    var k = K.state === 1 ? 0 : K.hist.filter(function (h) { return h.t === 'L'; }).length + K.skips;
    if (k >= K.nLine) { if (K.elim) { K.state = 4; K.at = secs(); K.res = {}; K.pos = {}; } else over(K); return; }
    K.li = k; newRound(K, 2);
  }
  function resolveLine(K) {
    var Q = K.lines[K.li], res = scoreLine(Q, picksOf(K)), n = [0, 0, 0, 0];
    K.res = res;
    K.slots.forEach(function (s) { var r = res[s] || 0, T = tal(K, s); n[r]++; if (r === 1) { K.sc[s] = (K.sc[s] || 0) + 1; T.on++; } else if (r === 2) { K.sc[s] = (K.sc[s] || 0) + 3; T.on++; T.uni++; } else if (r === 3) T.off++; else T.none++; });
    K.hist.push({ t: 'L', what: ['equation', 'words', 'table', 'two points', 'slope and point'][Q.form] + ': ' + eqTxt(Q), on: n[1] + n[2], uni: n[2], off: n[3], none: n[0] });
    K.state = 3; K.at = secs();
  }
  function addCon(K) {
    var al = aliveSids(K).length, R = rng(K.id / 1000 + K.cons.length * 7919 + K.skips * 104729 + Math.floor(Math.random() * 1e6)), k = K.cons.length;
    // one strict and one not among the first two, then alternating; a straight up-and-down boundary third
    var o = { strict: (k + (K.id / 1000) % 2) % 2 === 0, kind: k === 2 ? 1 : 0 };
    // once sharing a point is fatal, leave room for everyone still in if that can be done; if not, cut as little as possible
    var room = k + 1 >= DUP_FROM && region(K.cons).length > al + 2;
    var Cn = (room ? genCon(R, K.cons, al + 2, o) || genCon(R, K.cons, al + 2, { gentle: true }) : null) || genCon(R, K.cons, 4, k + 1 >= DUP_FROM && region(K.cons).length <= al + 2 ? { gentle: true } : o);
    if (!Cn) { over(K); return; }
    K.cons.push(Cn); newRound(K, 5);
  }
  function judge(K) {
    var al = aliveSids(K), r = M.resolveElim(K.cons, al, picksOf(K), K.cons.length >= DUP_FROM);
    K.res = r.res; K.flag = r.spared ? 1 : 0;
    K.slots.forEach(function (s) { var T = tal(K, s), v = r.res[s] || 0; if (v === 1) { K.sc[s] = (K.sc[s] || 0) + 1; T.ok++; } else if (v) T.bad++; else T.none++; });
    r.out.forEach(function (s) { K.ghost[s] = 1; K.butt[s] = 1; tal(K, s).out = K.cons.length; });
    K.er++;
    K.hist.push({ t: 'E', what: 'rule ' + K.cons.length + ': ' + conTxt(K.cons[K.cons.length - 1]), out: r.out.length, spared: r.spared, left: aliveSids(K).length });
    K.done = aliveSids(K).length <= 3 || K.cons.length >= MAX_CON;
    K.state = 6; K.at = secs();
  }
  function over(K) {
    K = K || C(); if (!K || K.state === 7) return;
    K.pausedAt = 0; K.state = 7; K.flag = K.er > 0 ? 1 : 0; K.at = K.endedAt = secs(); K.butt = {};
  }
  function advance(K) {   // what the clock does when a phase runs out
    if (K.state === 1 || K.state === 3) nextLine(K);
    else if (K.state === 2) resolveLine(K);
    else if (K.state === 4) addCon(K);
    else if (K.state === 5) judge(K);
    else if (K.state === 6) { if (K.done) over(K); else addCon(K); }
  }
  // ⏭ a round that is being answered is dropped without scoring; anything else just moves on
  function skip(K) {
    if (K.state === 7) return;
    if (K.pausedAt) { K.pausedAt = 0; }
    if (K.state === 2) { K.skips++; K.hist.push({ t: 'S', what: 'line ' + K.g + ' skipped' }); K.state = 3; K.pos = {}; nextLine(K); }
    else if (K.state === 5) { K.cons.pop(); K.skips++; K.hist.push({ t: 'S', what: 'a rule was skipped' }); addCon(K); }
    else advance(K);
    go(K);
  }
  function pause(K) {
    if (K.state === 7) return;
    if (K.pausedAt) { K.at += Math.round((Date.now() - K.pausedAt) / 1000) * 1000; K.pausedAt = 0; } else K.pausedAt = Date.now();
    go(K);
  }
  function agg() {
    var K = C(); if (!K) return;
    var key2 = 'id:' + Math.round(K.id / 1000) + ';', last = {}, changed = false, ros = null;
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q === QID && String(a.answer).indexOf(key2) >= 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    Object.keys(last).forEach(function (sid) {
      var m = String(last[sid].answer).match(/;g:(\d+);p:(\d+)/); if (!m) return;
      var row = { g: +m[1], p: Math.min(NONE, +m[2]) };
      K.rows[sid] = row;
      // late arrivals (their first row says they're here) get a place; once the elimination has begun they come in as ghosts
      if (K.slots.indexOf(sid) < 0 && K.state !== 7 && K.slots.length < MAXS) {
        ros = ros || A.rosterIn();
        if (ros.some(function (r) { return r.sid === sid; })) { K.slots.push(sid); if (K.state >= 5) K.ghost[sid] = 1; K.ents = null; changed = true; }
      }
      if (asking(K.state) && row.g === K.g && K.slots.indexOf(sid) >= 0) {
        if (row.p >= NONE) { if (K.pos[sid] != null) { delete K.pos[sid]; changed = true; } }
        else if (K.pos[sid] !== row.p) { K.pos[sid] = row.p; changed = true; }
      }
    });
    if (changed) { A.pushLive(); A.consolePanel(); }
  }
  function tick() {
    var K = C(); if (!K) return;
    var now = Date.now(), e = (now - K.at) / 1000;
    if (K.state === 7) { if (now - (K.endedAt || now) > 8 * 60000) { A.console_().stand = null; if (rootEl && V && V.watch) close(); (A.pushNow || A.pushLive)(); A.consolePanel(); return; } }
    else if (!K.pausedAt) {
      var lim = K.state === 1 ? LOBBY : asking(K.state) ? LEAD + K.len + GRACE : K.state === 3 ? REVEAL : K.state === 4 ? EINTRO : EREVEAL;
      if (e >= lim) { advance(K); go(K); }
    }
    if (now - K.lastPush >= PUSH_MS) { K.lastPush = now; (A.pushNow || A.pushLive)(); }
    if (now - (K.lastSave || 0) > 3000) { K.lastSave = now; save(K); }
    var ck = document.getElementById('sgcclock'); if (ck) ck.textContent = statusClock(K);
    if (rootEl && V && V.watch) apply(watchState());
  }
  function counts(out) {
    var K = C(); if (!K) return;
    var o = { state: K.state, len: K.len, lobby: LOBBY }, rem = K.pausedAt ? Math.max(0, Math.ceil(phaseLen(o) - (K.pausedAt - K.at) / 1000)) + 1 : 0;
    out.zkid = A.encRun(K.id); out.zkst = A.encRun(K.id + (A.console_().skew || 0));
    out.zks = [K.state, K.g, K.nLine, K.len, Math.min(9999, Math.max(0, Math.round((K.at - K.id) / 1000))), K.slots.length, Math.min(9999, rem), K.flag || 0, K.cons.length, K.elim, K.early, LOBBY];
    var Q = K.lines[K.li || 0];
    if (Q && (K.state === 2 || K.state === 3)) out.zkq = [Q.form, Q.si, Q.b + 20, (Q.xs[0] == null ? 0 : Q.xs[0]) + 10, (Q.xs[1] == null ? 0 : Q.xs[1]) + 10, (Q.xs[2] == null ? 0 : Q.xs[2]) + 10, Q.ex + 10];
    if (K.cons.length && K.state >= 5 && K.state <= 6) out.zkc = K.cons.map(encCon);
    K.slots.forEach(function (sid, i) {
      var kp = 'zkp' + Math.floor(i / 12), kx = 'zkx' + Math.floor(i / 24), p = K.pos[sid] == null ? NONE : K.pos[sid], show = K.state === 3 || K.state === 6;
      (out[kp] = out[kp] || []).push(p + 170 * ((show ? K.res[sid] || 0 : 0) + 4 * ((K.ghost[sid] ? 1 : 0) + 2 * (K.butt[sid] && K.state === 6 ? 1 : 0))));
      var a = out[kx] = out[kx] || [], sc = Math.min(99, K.sc[sid] || 0);
      if (i % 2) a[a.length - 1] += sc; else a.push(sc * 100);
    });
  }
  // the roster, one entry per student: slot~fingerprint~name~look (two of the same first name get an initial)
  function entries(K) {
    if (K.ents) return K.ents;
    var LK = looksBySid(), first = {}, R = {};
    A.rosterIn().forEach(function (r) { R[r.sid] = r; });
    K.slots.forEach(function (sid) { var f = nameOf(sid); first[f] = (first[f] || 0) + 1; });
    K.ents = K.slots.map(function (sid, i) {
      var f = nameOf(sid), r = R[sid];
      if (first[f] > 1 && r) { var last = String(r.name || '').indexOf(',') >= 0 ? String(r.name).split(',')[0].trim() : String(r.name || '').trim().split(' ').slice(-1)[0]; f = clean(f + ' ' + (last.charAt(0) || '')); }
      return i + '~' + sh3(sid) + '~' + f + '~' + (LK[sid] || (AV ? AV.defLook(sid) : ''));
    });
    K.entsAt = Date.now();
    return K.ents;
  }
  function spot() {
    var K = C();
    if (K.ents && Date.now() - (K.entsAt || 0) > 20000) K.ents = null;   // new looks from the wardrobe
    var E = entries(K), n = E.length, pick = [], c0 = n ? K.cur % n : 0, used = 0;
    for (var k = 0; k < n; k++) { var x = E[(c0 + k) % n]; if (used + x.length + 1 > 590) break; pick.push(x); used += x.length + 1; }
    K.cur = n ? (c0 + pick.length) % n : 0;
    return { q: 'zstand', text: ('P:' + pick.join(',')).slice(0, 600) };
  }
  function restore(Lv) {
    var o = standOf(Lv), saved = SFA.store.get('teacher.stand.' + A.LID, null);
    if (!o || !saved || saved.id !== o.id || o.state === 7) { A.console_().stand = null; return false; }
    saved.ents = null; saved.lastPush = 0; A.console_().stand = saved;
    return true;
  }
  // the class screen's view on the console's own screen: everything, not a page of the roster
  function watchState() {
    var K = C(), out = {}; counts(out);
    var o = standOf({ lesson: A.LID, counts: out, spot: { q: 'zstand', text: 'P:' + entries(K).join(',') } });
    o.start = K.id; o.at = K.at; return o;
  }
  function watch() { var o = watchState(); open(o); V.watch = true; apply(o); draw(); }
  function statusClock(K) {
    var e = ((K.pausedAt || Date.now()) - K.at) / 1000, p = K.pausedAt ? '⏸ paused · ' : '';
    if (K.state === 1) return p + 'the first line in ' + clock(LOBBY - e);
    if (asking(K.state)) return p + (e < LEAD + K.len ? clock(LEAD + K.len - e) + ' left' : 'counting the last answers…');
    if (K.state === 3) return p + 'the line is on screen · next in ' + clock(REVEAL - e);
    if (K.state === 4) return p + 'the elimination rules are on screen · first rule in ' + clock(EINTRO - e);
    if (K.state === 6) return p + 'the region is on screen · ' + (K.done ? 'results' : 'next rule') + ' in ' + clock(EREVEAL - e);
    return 'the podium and the leaderboard are on every screen';
  }
  function section(p) {
    var K = C(), sec = H('div', 'sect'), al = aliveSids(K), Q = K.lines[K.li || 0];
    sec.appendChild(H('h3', '', '🐐 Stand on the Line · ' + (K.state === 1 ? 'Lobby' : K.state <= 3 ? 'Line ' + K.g + ' of ' + K.nLine : K.state === 4 ? 'Elimination' : K.state <= 6 ? 'Elimination, rule ' + K.cons.length : 'Results')));
    var what = K.state === 2 || K.state === 3 ? '<b>' + esc(eqTxt(Q)) + '</b> (given as ' + ['an equation', 'a start and a step', 'a table', 'two points', 'a slope and a point'][Q.form] + ') · ' : K.state === 5 || K.state === 6 ? '<b>' + K.cons.map(function (c) { return esc(conTxt(c)); }).join(' , ') + '</b> · ' + al.length + ' still in · ' : '';
    sec.appendChild(H('p', '', what + '<span id="sgcclock">' + esc(statusClock(K)) + '</span> · ' + plural(K.slots.length, 'student')));
    var r = H('div', 'row'), btn = function (txt, title, fn, cls) { r.appendChild(el('button', { type: 'button', 'class': 'btn' + (cls ? ' ' + cls : ''), text: txt, title: title, onclick: fn })); };
    btn('👁 Show the grid', 'The class screen view on this screen', function () { watch(); }, 'primary');
    if (K.state !== 7) {
      btn(K.pausedAt ? '▶ Resume' : '⏸ Pause', 'Stops the clock on every screen', function () { pause(K); });
      if (asking(K.state)) btn('⏰ Time\'s up now', 'Close this round now and score what has arrived', function () { K.pausedAt = 0; advance(K); go(K); });
      btn(asking(K.state) ? '⏭ Skip round' : '⏭ Next', asking(K.state) ? 'Drop this round without scoring it' : 'Move on now', function () { skip(K); });
      btn('End it now', 'Straight to the podium and the leaderboard', function () { over(K); go(K); });
    }
    btn('Back to the lesson', 'Close the game on every screen', function () { A.console_().stand = null; if (rootEl) close(); A.pushLive(); A.consolePanel(); }, 'primary');
    sec.appendChild(r);
    // who hasn't answered yet (the ones still in first)
    if (asking(K.state)) {
      var wait = K.slots.filter(function (s) { return K.pos[s] == null; }), wa = wait.filter(function (s) { return !K.ghost[s]; }), wg = wait.filter(function (s) { return K.ghost[s]; });
      sec.appendChild(H('p', wait.length ? 'state' : 'muted', wait.length ? '<b>Not answered yet (' + wait.length + ' of ' + K.slots.length + '):</b> ' + wa.map(function (s) { return esc(nameOf(s)); }).join(', ') + (wg.length ? (wa.length ? ' · ' : '') + '👻 ' + wg.map(function (s) { return esc(nameOf(s)); }).join(', ') : '') : 'Everyone has answered.'));
    } else if (K.state === 3 || K.state === 6) {
      var h = K.hist[K.hist.length - 1] || {};
      sec.appendChild(H('p', 'muted', K.state === 3 ? '<b>' + h.on + '</b> on the line (' + h.uni + ' alone on a point) · ' + h.off + ' off it · ' + h.none + ' no answer' : h.spared ? 'Everyone still in was wrong, so nobody was eliminated.' : '<b>' + h.out + '</b> eliminated · ' + h.left + ' still in' + (K.done ? ' · the podium is next' : '')));
    }
    var dd = A.fold ? A.fold('g-stand', '📋 Details · scores, rounds', K.state === 7) : el('details', { 'class': 'sect fold' });
    var studs = K.slots.map(function (s) { return { sid: s, n: nameOf(s), sc: K.sc[s] || 0, T: tal(K, s), g: !!K.ghost[s] }; }).sort(function (a, b) { return b.sc - a.sc || a.n.localeCompare(b.n); });
    if (K.hist.length) dd.appendChild(H('p', 'muted', K.hist.map(function (h2) { return h2.t === 'L' ? esc(h2.what) + ': ' + h2.on + ' on (' + h2.uni + ' alone), ' + h2.off + ' off, ' + h2.none + ' no answer' : h2.t === 'E' ? esc(h2.what) + ': ' + (h2.spared ? 'all wrong, nobody out' : h2.out + ' out') + ', ' + h2.left + ' left' : esc(h2.what); }).join('<br>')));
    dd.appendChild(H('p', 'muted', '<b>Students:</b> ' + studs.map(function (s) { return (K.er ? (s.g ? '👻 ' : '🟢 ') : '') + esc(s.n) + ' ' + s.sc + ' (lines ' + s.T.on + '/' + (s.T.on + s.T.off + s.T.none) + (s.T.uni ? ', ' + s.T.uni + ' alone' : '') + (s.T.out ? ', out at rule ' + s.T.out : '') + ')'; }).join(' · ')));
    var cp = el('button', { type: 'button', 'class': 'btn small', text: '📋 Copy results' });
    cp.onclick = function () {
      var lines = ['Name\tPoints\tLines on\tLines alone\tLines off\tLines no answer\tRules right\tRules wrong\tOut at rule'].concat(studs.map(function (s) { return [s.n, s.sc, s.T.on, s.T.uni, s.T.off, s.T.none, s.T.ok, s.T.bad, s.T.out || ''].join('\t'); }));
      try { navigator.clipboard.writeText(lines.join('\n')).then(function () { SFA.toast('Copied. Paste it into a spreadsheet.', 2500); }); } catch (x) { SFA.toast('Couldn\'t copy here.', 2500); }
    };
    dd.appendChild(cp); sec.appendChild(dd);
    p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 500);

  /* ---------- styles ---------- */
  var css = [
    '.sg{position:fixed;inset:0;z-index:90;overflow:auto;background:radial-gradient(ellipse at 50% -10%,#1d5560,#0b2a33 55%,#06161b);color:#EAF4F2;padding:8px 14px 14px;display:flex;flex-direction:column;gap:8px;font-family:"Bricolage Grotesque",system-ui,-apple-system,"Segoe UI",sans-serif}',
    '.sgtop{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:center;min-height:44px}',
    '.sglogo{font:400 clamp(15px,2vw,26px) "Luckiest Guy",system-ui;letter-spacing:1px;color:#FFE14D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.sgmid{display:flex;gap:12px;align-items:baseline;justify-content:center}.sgph{font-weight:800;letter-spacing:1px;font-size:clamp(12px,1.4vw,18px);opacity:.9}',
    '.sgclock{font:600 clamp(22px,3vw,40px)/1 "IBM Plex Mono",monospace;color:#FFE14D;min-width:3ch}.sgclock.low{color:#FF7A6B}',
    '.sgright{display:flex;justify-content:flex-end;gap:8px;align-items:center;min-width:0}.sgscore{font-weight:800;font-size:clamp(13px,1.5vw,20px)}.sgback{white-space:nowrap}',
    '.sgbody{flex:1;min-height:0;display:grid;gap:12px;grid-template-columns:minmax(0,1fr);align-items:start}',
    '.sg.scr .sgbody{grid-template-columns:minmax(220px,1fr) auto minmax(220px,1fr);align-items:stretch}',
    '.sgsqw{display:flex;justify-content:center}.sgsq{position:relative;aspect-ratio:1;width:min(calc(100vh - 84px),56vw)}',
    '.sg.stu .sgsq{width:min(100%,calc(100vh - 150px));min-width:260px}',
    '@media (min-width:900px){.sg.stu .sgbody{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"side sq" "info sq"}.sg.stu .sgside{grid-area:side}.sg.stu .sgsqw{grid-area:sq}.sg.stu .sginfo{grid-area:info}.sg.stu .sgsq{width:min(calc(100vh - 84px),58vw)}}',
    '.sgsvg,.sgsvg svg{position:absolute;inset:0;width:100%;height:100%}.sglay{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:2.6%}',
    '.sggl{stroke:#1d2a30;stroke-opacity:.16;stroke-width:1.5}.sggl.ax{stroke-opacity:.8;stroke-width:3}.sgnum{font:600 15px "IBM Plex Mono",monospace;fill:#1d2a30;fill-opacity:.7;text-anchor:middle}.sgnum.ax{font-style:italic;font-size:19px;fill-opacity:1}',
    '.sgdot{fill:#1d2a30;fill-opacity:.55}.sgdot.on{fill:#19A35B;fill-opacity:1;stroke:#0d5a32;stroke-width:2.5}.sgdot.uni{fill:#FFC21A;stroke:#8a5a00}.sgdot.in{fill:#12824a;fill-opacity:1}.sgdot.no{fill-opacity:.22}.sgdot.hol{fill:#F4F1E6;fill-opacity:1;stroke:#1d2a30;stroke-opacity:.6;stroke-width:2}',
    '.sgline{stroke:#19A35B;stroke-width:6;stroke-linecap:round}.sgreg{fill:#3BCB7F;fill-opacity:.24}.sgbd{stroke:#0d5a32;stroke-width:4;stroke-linecap:round}.sgbd.dash{stroke-dasharray:14 11}.sgbd.new{stroke:#C0392B;stroke-width:5}',
    '.sghit{fill:transparent;cursor:pointer}.sghit:hover{fill:rgba(255,194,26,.3)}.sgsvg.lock .sghit{pointer-events:none}.sgmine{fill:none;stroke:#FFC21A;stroke-width:5}.sgoth{fill:#1d2a30;fill-opacity:.16}',
    '.sga{position:absolute;width:7.6%;transform:translate(-50%,-82%);display:flex;flex-direction:column;align-items:center;will-change:left,top}',
    '.sga[hidden]{display:none}.sga .sgav{width:100%}.sga svg{width:100%;height:auto;display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}.sga:not(.mv) .av.walk .avft,.sga:not(.mv) .av.walk .avbod{animation:none}',
    '.sgn{font-weight:800;font-size:1em;line-height:1;color:#10222a;background:rgba(255,255,255,.82);border-radius:.5em;padding:.1em .35em;margin-top:-.25em;white-space:nowrap;max-width:240%;overflow:hidden;text-overflow:ellipsis}',
    '.sgb{position:absolute;top:-8%;right:-22%;font:800 1em/1 system-ui;font-style:normal;background:#10222a;color:#fff;border-radius:.6em;padding:.15em .4em}.sgb:empty{display:none}',
    '.sga.on svg{filter:drop-shadow(0 0 .5em #19A35B) drop-shadow(0 0 .2em #19A35B)}.sga.uni svg{filter:drop-shadow(0 0 .6em #FFC21A) drop-shadow(0 0 .25em #FFC21A)}.sga.uni .sgb{background:#FFC21A;color:#3a2800}.sga.on .sgb{background:#19A35B}',
    '.sga.off{opacity:.5;filter:grayscale(.9)}.sga.ghost{opacity:.42;filter:grayscale(.75) brightness(1.25)}.sga.ghost.on{opacity:.75}.sga.gone{opacity:0;transform:translate(-50%,-82%) rotate(200deg) scale(.6)}',
    '.sga.me{width:9.5%;z-index:400!important}.sga.me .sgn{background:#FFE14D}',
    '.sggoat{position:absolute;width:11%;transform:translate(-50%,-80%);z-index:500}.sggoat.flip{transform:translate(-50%,-80%) scaleX(-1)}.sggoat svg{width:100%;height:auto;display:block}',
    '.sgside,.sginfo{display:flex;flex-direction:column;gap:10px;min-width:0}.sg.scr .sgside,.sg.scr .sginfo{font-size:clamp(14px,1.45vw,24px)}',
    '.sgvoice{background:#F7F3E3;color:#1d2a30;border-radius:6px;padding:.7em .8em .6em;font-family:"IBM Plex Mono",monospace;box-shadow:0 3px 0 rgba(0,0,0,.35);border-left:6px solid #2E6DA4}.sgvoice i{display:block;font-style:normal;font-weight:600;font-size:.62em;letter-spacing:2px;color:#2E6DA4}.sgvoice p{margin:.2em 0 0;font-weight:600;line-height:1.3}',
    '.sgtask{background:#10222a;border:3px solid #FFE14D;border-radius:14px;padding:.6em .7em;display:flex;flex-direction:column;align-items:center;gap:.15em;text-align:center;font-size:1.25em;line-height:1.3}.sgtask b{color:#FFE14D}.sgeq{font:700 1.6em Georgia,"Times New Roman",serif}',
    '.sgtbl{border-collapse:collapse;font:600 1.1em "IBM Plex Mono",monospace}.sgtbl th,.sgtbl td{border:2px solid rgba(255,255,255,.5);padding:.15em .6em;min-width:2.2em}.sgtbl th{font-style:italic;color:#FFE14D}',
    '.sgnote{margin:0;opacity:.9;line-height:1.35}.sgnote.warn{background:rgba(192,57,43,.28);border-radius:10px;padding:.4em .6em;font-weight:700}.sgwork{margin:0;background:rgba(59,203,127,.18);border-left:5px solid #3BCB7F;border-radius:8px;padding:.5em .65em;font-weight:700;line-height:1.35}',
    '.sgbig{margin:0;font-size:1.25em;font-weight:700;line-height:1.25}.sgbig b{color:#FFE14D}.sgbig.good{color:#8CF0B6}.sgbig.bad{color:#FFB0A6}',
    '.sgnames{margin:0;line-height:1.35;font-size:.86em}.sgnames.gold{color:#FFE14D;font-weight:700}.sg h4{margin:.2em 0 0;font-size:.8em;letter-spacing:1px;text-transform:uppercase;opacity:.75}',
    '.sgrules{margin:0;padding:0;list-style:none;counter-reset:r;display:flex;flex-direction:column;gap:.25em}.sgrules li{counter-increment:r;display:flex;align-items:baseline;gap:.5em;background:rgba(255,255,255,.07);border-radius:10px;padding:.25em .6em;font-size:1.1em}.sgrules li:before{content:counter(r);opacity:.6;font-size:.8em}.sgrules li b{font-family:Georgia,"Times New Roman",serif;white-space:nowrap}.sgrules li small{margin-left:auto;opacity:.65;font-size:.65em}.sgrules li.new{background:#10222a;border:3px solid #FFE14D;font-size:1.3em;flex-wrap:wrap}.sgrules li.new b{color:#FFE14D}',
    '.sglb{margin:0;padding:0;list-style:none;counter-reset:l;columns:1;font-size:.9em}.sglb li{counter-increment:l;display:flex;gap:.5em;padding:.12em .4em;break-inside:avoid;border-radius:6px}.sglb li:before{content:counter(l) ".";opacity:.6;min-width:1.8em}.sglb li span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sglb li b{color:#FFE14D}.sglb li.me{background:rgba(255,225,77,.22)}',
    '.sgfin{flex:1;display:grid;gap:18px;grid-template-columns:minmax(0,1fr);align-items:start;font-size:clamp(14px,1.5vw,24px)}.sgfin[hidden],.sgbody[hidden]{display:none}@media (min-width:820px){.sgfin{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}}',
    '.sgfinL,.sgfinR{display:flex;flex-direction:column;gap:12px;min-width:0}.sgfin h2{margin:0;text-align:center;font:400 clamp(26px,4.4vw,64px) "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 3px 0 #10222a}',
    '.sgpod{display:flex;justify-content:center;align-items:flex-end;gap:10px}.sgstep{display:flex;flex-direction:column;align-items:center;gap:2px;width:30%;max-width:210px}.sgstep svg{width:70%;height:auto}.sgstep b{font-size:1.1em}.sgstep i{font-style:normal;opacity:.85;font-size:.8em}.sgstep span{display:flex;align-items:flex-start;justify-content:center;width:100%;background:#F4F1E6;color:#10222a;font:400 1.6em "Luckiest Guy",system-ui;border-radius:8px 8px 0 0;padding-top:.15em}.sgstep.s0 span{height:4.2em;background:#FFE14D}.sgstep.s1 span{height:3em}.sgstep.s2 span{height:2.1em}',
    '.sgfinR .sglb{columns:2;column-gap:18px}@media (min-width:1200px){.sg.scr .sgfinR .sglb{columns:3}}',
    '@media (prefers-reduced-motion:reduce){.sga,.sggoat{transition:none!important}}'
  ].join('\n');
  var sty = document.createElement('style'); sty.id = 'sfaStandCss'; sty.textContent = css; document.head.appendChild(sty);

  window.SFA_STAND = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: spot, restore: restore, standOf: standOf, math: M,
    peek: function () { return V && V.o ? { o: V.o, pick: ST ? ST.p : NONE, slot: mySlot(), canTap: V.canTap } : null; } };   // for the practice simulator
})(typeof window !== 'undefined' ? window : globalThis);
