/* 🌋 The Floor Is Lava ("Under the Pond"; code id: stand). Loaded by sfa-lesson.js when the teacher starts it.

   The grid is lava. Only the points that satisfy the rule are safe. Line rounds: the Voice gives a line as a rule (slope-intercept,
   standard form, point-slope, or a horizontal or vertical line; never as points, which students could just copy) and each student taps a lattice point, or types any point (fractions allowed), on their own device; their avatar
   walks there on the class screen. At the reveal the safe points rise as stepping stones and everyone on lava melts.
   Then an inequality round: rules stack one at a time and the safe region cools to rock (points only, or elimination).

   Scoring, accuracy first: correct 100, speed up to +50 (timed on the student's own device), a point nobody else chose
   +25, then ×1.5 for a negative coordinate, ×2 for a fraction, ×3 for both. A scaffolded answer is 60.

   Sync through the Sheet like Sumo Graphing. Students send one running row (q "zstandx1", an x1 extra):
     "t2;id:<game>;g:<round>;x:<n/d>;y:<n/d>;t:<ms>;s:<0 own answer|1 scaffold right|2 scaffold wrong>;r:;o:;n:;h:;e:;f:"
   (x and y are "-" for no answer; r/o lines right/played, e/f inequality rounds safe/played, n rounds answered, h rounds
   with the hint step: the summary report.html reads). The console referees and publishes in the live counts:
     zvid  the game's id, zvst the same on the server's clock
     zvs   state (1 lobby, 2 line, 3 line shown, 4 rules intro, 5 rule, 6 rule shown, 7 over), round, line rounds, round
           length, phase start (s after the id), students, paused (seconds left + 1), flag, constraints, inequality mode
           (0 off, 1 points, 2 elimination), grid (6 or 10), options (1 speed, 2 unique, 4 multipliers, 8×scaffold mode,
           32 muted, 64 sharing rule)
     zvq   the line: form, A, B, C (+5000; the line is Ax + By = C), how many given numbers, three given numbers (+5000),
           the worked number (+5000), line number
     zvc0… the rules: how many rules this game, then per rule: form + 3 × op, (A+50)×100 + (B+50), C + 5000
     zvp0… each student, two numbers: x position (24ths of a unit, from −grid; 499 none) + 500 × (result + 5 × ghost +
           10 × out this round), y position. Results: 0 none, 1 safe, 2 safe and alone, 3 lava, 4 safe with the hint step
     zvx0… totals, zvr0… this round's points + 1000 × scaffolded
   and the spotlight (spot.q "zstand"): "P:" a page of the roster (slot~fingerprint~name~look).
   Version 1 (Stand on the Line: rows "t1;…", keys zk*) is frozen in sfa-stand-v1.js; this file hands version 1 games to
   it, so an old page and a new console never read each other's rows or keys.

   The maths is in the first part and has no page in it: climb/dev/stand-test.html checks it over thousands of seeds,
   and climb/dev/stand-sim.html plays whole games with a pretend class. */
(function (root) {
  'use strict';
  /* ===================================== the maths ===================================== */
  var OPS = ['<', '≤', '>', '≥'];
  var FORMS = ['Slope-intercept', 'Standard form', 'Point-slope', 'Start and step', 'Table', 'Two points', 'Slope and a point', 'Horizontal or vertical'];
  var FORM_EX = ['y = 2x − 1', '2x + 3y = 6', 'y − 3 = 2(x − 1)', 'start at (0, 1), up 2 each step', 'a table, uneven x-steps', '(−2, 1) and (4, 4)', 'slope ½ through (2, 3)', 'y = 3, x = −2'];
  var EASY = [7, 0, 3, 6, 2, 5, 4, 1];   // easiest first
  var RULES = [0, 1, 2, 7];   // the forms a game uses: each one a rule, so the line never comes with points to copy (3 to 6 stay readable for old games)
  var CATS = ['pw', 'nw', 'z', 'f', 'u'], CAT_N = { pw: 'positive whole', nw: 'negative whole', z: 'zero', f: 'fractions', u: 'undefined (vertical)' };
  var CAT_OK = { 0: ['pw', 'nw', 'z', 'f'], 1: ['pw', 'nw', 'z', 'f', 'u'], 2: ['pw', 'nw', 'f'], 3: ['pw', 'nw', 'z', 'f'], 4: ['pw', 'nw', 'z', 'f', 'u'], 5: ['pw', 'nw', 'z', 'f', 'u'], 6: ['pw', 'nw', 'z', 'f', 'u'], 7: ['z', 'u'] };
  var IFORMS = ['Slope-intercept (y > x + 1)', 'Standard form (2x − y ≤ 4)', 'Horizontal or vertical (x ≥ −2)'];

  function mix32(h) { h = h >>> 0; h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; }
  function rng(seed) { var s = mix32(seed) || 1; return function () { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return ((s >>> 8) & 0xffff) / 65536; }; }
  function hash(t) { var h = 5381; t = String(t); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h; }

  /* ---------- exact fractions: [numerator, denominator], denominator > 0, always reduced ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function Q(n, d) { if (d === undefined) d = 1; if (!d || !isFinite(n) || !isFinite(d) || n !== Math.round(n) || d !== Math.round(d)) return null; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; return [n / g + 0, d / g]; }
  function qadd(a, b) { return Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function qsub(a, b) { return Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]); }
  function qmul(a, b) { return Q(a[0] * b[0], a[1] * b[1]); }
  function qdiv(a, b) { return b[0] ? Q(a[0] * b[1], a[1] * b[0]) : null; }
  function qeq(a, b) { return !!a && !!b && a[0] === b[0] && a[1] === b[1]; }
  function qcmp(a, b) { var l = a[0] * b[1], r = b[0] * a[1]; return l < r ? -1 : l > r ? 1 : 0; }
  function qint(a) { return a[1] === 1; }
  function qnum(a) { return a[0] / a[1]; }
  function qabsLe(a, G) { return Math.abs(a[0]) <= G * a[1]; }
  var VULG = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘', '1/6': '⅙', '5/6': '⅚', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞' };
  // a number to read: −3, ½, −⅔, 7/4
  function nm(n) { return n < 0 ? '−' + (-n) : String(n); }
  function fq(a) { if (typeof a === 'number') return nm(a); if (a[1] === 1) return nm(a[0]); var k = Math.abs(a[0]) + '/' + a[1]; return (a[0] < 0 ? '−' : '') + (VULG[k] || k); }
  function pq(a) { return a[0] < 0 ? '(' + fq(a) + ')' : fq(a); }   // in brackets when negative, for a sum
  function ptq(x, y) { return '(' + fq(x) + ', ' + fq(y) + ')'; }
  // what a student types for a coordinate: 3, −2, 1.5, 1/2, −3/2, 1 1/2, −2 ½. Exact: 0.333 is 333/1000, not ⅓.
  function parseNum(s) {
    s = String(s == null ? '' : s).trim().replace(/[−–—]/g, '-').replace(/\s+/g, ' ');
    Object.keys(VULG).forEach(function (k) { s = s.split(VULG[k]).join(' ' + k); });
    s = s.replace(/\s+/g, ' ').replace(/^([+-]?) +/, '$1').trim(); var m;
    if ((m = /^([+-]?)(\d{1,6}) (\d{1,6})\/(\d{1,6})$/.exec(s))) { var w = +m[2], nn = +m[3], dd = +m[4]; if (!dd) return null; var r = Q(w * dd + nn, dd); return m[1] === '-' ? Q(-r[0], r[1]) : r; }
    if ((m = /^([+-]?)(\d{1,6})\/(\d{1,6})$/.exec(s))) return +m[3] ? Q((m[1] === '-' ? -1 : 1) * +m[2], +m[3]) : null;
    if ((m = /^([+-]?)(\d{0,6})\.(\d{1,6})$/.exec(s))) { var den = Math.pow(10, m[3].length); return Q((m[1] === '-' ? -1 : 1) * (+(m[2] || 0) * den + +m[3]), den); }
    if ((m = /^([+-]?)(\d{1,6})$/.exec(s))) return Q((m[1] === '-' ? -1 : 1) * +m[2], 1);
    return null;
  }

  /* ---------- lines: Ax + By = C, whole numbers ---------- */
  function vert(L) { return L.B === 0; }
  function slopeQ(L) { return L.B ? Q(-L.A, L.B) : null; }
  function bQ(L) { return L.B ? Q(L.C, L.B) : null; }
  function yAt(L, x) { return L.B ? Q(L.C - L.A * x, L.B) : null; }            // x a whole number
  function onLineQ(L, x, y) { return L.A * x[0] * y[1] + L.B * y[0] * x[1] === L.C * x[1] * y[1]; }
  function onLine(L, x, y) { return L.A * x + L.B * y === L.C; }
  function latticePts(L, G) {
    var out = [], x, y;
    if (!L.B) { if (L.C % L.A) return out; x = L.C / L.A; if (Math.abs(x) <= G) for (y = -G; y <= G; y++) out.push([x, y]); return out; }
    for (x = -G; x <= G; x++) { var t = L.C - L.A * x; if (t % L.B) continue; y = t / L.B; if (Math.abs(y) <= G) out.push([x, y]); }
    return out;
  }
  function normL(A, B, C) { var g = gcd(gcd(A, B), C) || 1; A /= g; B /= g; C /= g; if (B < 0 || (B === 0 && A < 0)) { A = -A; B = -B; C = -C; } return { A: A + 0, B: B + 0, C: C + 0 }; }
  function lkey(L) { var n = normL(L.A, L.B, L.C); return n.A + ',' + n.B + ',' + n.C; }
  // y = (p/q)x + b, or x = c when slope is null
  function fromSlope(s, b) { if (!s) return normL(b[1], 0, b[0]); return normL(-s[0] * b[1], s[1] * b[1], s[1] * b[0]); }
  function catOf(L) { if (!L.B) return 'u'; var s = slopeQ(L); return s[0] === 0 ? 'z' : s[1] !== 1 ? 'f' : s[0] > 0 ? 'pw' : 'nw'; }
  function slopesOf(cat) {
    if (cat === 'pw') return [1, 2, 3, 4, 5].map(function (n) { return Q(n); });
    if (cat === 'nw') return [1, 2, 3, 4, 5].map(function (n) { return Q(-n); });
    if (cat === 'z') return [Q(0)];
    if (cat === 'f') { var o = []; [[1, 2], [3, 2], [1, 3], [2, 3], [1, 4], [3, 4]].forEach(function (p) { o.push(Q(p[0], p[1]), Q(-p[0], p[1])); }); return o; }
    return [null];
  }
  var CAND = {};
  // every line of a kind with at least six safe points on the grid (whole-number intercept; not an axis)
  function candidates(cat, G) {
    var k = cat + G; if (CAND[k]) return CAND[k];
    var out = [];
    slopesOf(cat).forEach(function (s) { for (var b = -G; b <= G; b++) { if ((b === 0 || Math.abs(b) === G) && (cat === 'z' || cat === 'u')) continue; var L = fromSlope(s, Q(b)); if (latticePts(L, G).length >= 6) out.push(L); } });
    return (CAND[k] = out);
  }
  function shuffleR(R, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(R, a) { return a[Math.floor(R() * a.length)]; }
  // the order the forms come in: 0 random, 1 as listed, 2 easiest first
  function formSeq(R, forms, n, order) {
    forms = forms.slice().sort(function (a, b) { return a - b; });
    var out = [];
    while (out.length < n) out = out.concat(order === 0 ? shuffleR(R, forms) : forms);
    out = out.slice(0, n);
    if (order === 2) out.sort(function (a, b) { return EASY.indexOf(a) - EASY.indexOf(b); });
    return out;
  }
  function catsFor(form, cats) {
    var ok = CAT_OK[form].filter(function (c) { return cats.indexOf(c) >= 0; });
    if (form === 7 && !ok.length) ok = ['z', 'u'];
    return ok;
  }
  // a game's lines. o: { n, G, forms: [form ids], order, cats: [slope kinds], custom: [lines the teacher typed] }
  function genLines(seed, o) {
    var R = rng(seed), G = o.G === 10 ? 10 : 6, n = Math.max(1, Math.min(10, o.n || 5)), used = {}, out = [], useC = {};
    (o.custom || []).slice(0, n).forEach(function (L) { var c = clone(L); if (!used[lkey(c)]) { used[lkey(c)] = 1; c.src = 'own'; out.push(c); } });
    var forms = (o.forms && o.forms.some(function (f) { return RULES.indexOf(f) >= 0; }) ? o.forms : [0]).filter(function (f) { return RULES.indexOf(f) >= 0; }), cats = o.cats && o.cats.length ? o.cats : ['pw', 'nw'];
    var seq = formSeq(R, forms, n - out.length, o.order | 0);
    seq.forEach(function (form) {
      var ok = catsFor(form, cats);
      if (!ok.length) {   // this form can't take any of the ticked slopes: swap it for a ticked form that can
        var alt = forms.filter(function (f) { return catsFor(f, cats).length; });
        if (alt.length) { form = pick(R, alt); ok = catsFor(form, cats); } else ok = CAT_OK[form].filter(function (c) { return c === 'pw' || c === 'nw'; }).concat(form === 7 ? ['z'] : []);
      }
      ok = shuffleR(R, ok).sort(function (a, b) { return (useC[a] || 0) - (useC[b] || 0); });
      var L = null;
      for (var i = 0; i < ok.length && !L; i++) { var cs = candidates(ok[i], G).filter(function (c) { return !used[lkey(c)]; }); if (cs.length) { L = clone(pick(R, cs)); useC[ok[i]] = (useC[ok[i]] || 0) + 1; } }
      if (!L) { var any = []; CATS.forEach(function (c) { candidates(c, G).forEach(function (x) { if (!used[lkey(x)]) any.push(x); }); }); L = clone(pick(R, any)); }
      used[lkey(L)] = 1;
      out.push(dressLine(R, L, form, G));
    });
    return out;
  }
  function clone(L) { return { form: L.form | 0, A: L.A, B: L.B, C: L.C, xs: (L.xs || []).slice(), ex: L.ex, src: L.src }; }
  // the numbers a form shows: points (x's, or y's on a vertical line), and the worked example
  function dressLine(R, L, form, G) {
    var n = normL(L.A, L.B, L.C), pts = latticePts(n, G), v = !n.B, co = function (p) { return v ? p[1] : p[0]; }, xs = [], i, j, m;
    L = { form: form, A: n.A, B: n.B, C: n.C, xs: [], ex: 0 };
    if (form === 1) {   // standard form: whole numbers, x first and positive; a level or upright line gets a factor so it isn't just y = 3
      if (L.A < 0 || (L.A === 0 && L.B < 0)) { L.A = -L.A; L.B = -L.B; L.C = -L.C; }
      if ((L.A === 0 || L.B === 0) && Math.abs(L.C) * 3 < 4999) { var k = R() < 0.5 ? 2 : 3; L.A *= k; L.B *= k; L.C *= k; }
    }
    if (form === 2 || form === 6) xs = [co(pick(R, pts.filter(function (p) { return v || p[0] !== 0; })))];
    else if (form === 3) xs = [0];
    else if (form === 4) {
      var tr = [];
      for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) for (m = j + 1; m < pts.length; m++) if (co(pts[j]) - co(pts[i]) !== co(pts[m]) - co(pts[j])) tr.push([co(pts[i]), co(pts[j]), co(pts[m])]);
      xs = pick(R, tr);
    } else if (form === 5) {
      var pr = [];
      for (i = 0; i < pts.length; i++) for (j = i + 2; j < pts.length; j++) pr.push([co(pts[i]), co(pts[j])]);
      xs = pick(R, pr);
    }
    L.xs = xs;
    var free = pts.filter(function (p) { return xs.indexOf(co(p)) < 0 && !(form === 3 && p[0] === 0); }), left = free.filter(function (p) { return co(p) < 0; });
    L.ex = co(left.length ? pick(R, left) : free.length ? pick(R, free) : pts[0]);
    return L;
  }
  // the point a given number stands for
  function givenPt(L, c) { return L.B ? [Q(c), yAt(L, c)] : [Q(L.C, L.A), Q(c)]; }

  /* ---------- the words for a line ---------- */
  function coef(s) { if (s[1] === 1) return s[0] === 1 ? '' : s[0] === -1 ? '−' : nm(s[0]); var k = Math.abs(s[0]) + '/' + s[1]; return (s[0] < 0 ? '−' : '') + (VULG[k] || '(' + k + ')'); }
  function plusQ(b) { return b[0] > 0 ? ' + ' + fq(b) : b[0] < 0 ? ' − ' + fq(Q(-b[0], b[1])) : ''; }
  function rhsTxt(s, b) { if (!s[0]) return fq(b); return coef(s) + 'x' + plusQ(b); }
  function eqTxt(L) { return L.B ? 'y = ' + rhsTxt(slopeQ(L), bQ(L)) : 'x = ' + fq(Q(L.C, L.A)); }
  function linTxt(A, B) {
    var t = '';
    if (A) t = (A === 1 ? '' : A === -1 ? '−' : nm(A)) + 'x';
    if (B) t += (t ? (B > 0 ? ' + ' : ' − ') : B < 0 ? '−' : '') + (Math.abs(B) === 1 ? '' : Math.abs(B)) + 'y';
    return t || '0';
  }
  function stdTxt(L) { return linTxt(L.A, L.B) + ' = ' + nm(L.C); }
  function psTxt(L) {
    var x1 = L.xs[0], y1 = yAt(L, x1), s = slopeQ(L), sc = s[1] === 1 ? nm(s[0]) : coef(s);
    var yp = y1[0] === 0 ? 'y' : 'y ' + (y1[0] > 0 ? '− ' + fq(y1) : '+ ' + fq(Q(-y1[0], y1[1])));
    var xp = x1 === 0 ? 'x' : 'x ' + (x1 > 0 ? '− ' + x1 : '+ ' + (-x1));
    return yp + ' = ' + sc + '(' + xp + ')';
  }
  function slopeTxt(L) { return L.B ? fq(slopeQ(L)) : 'undefined'; }
  function stepTxt(L) {
    var s = slopeQ(L); if (!s[0]) return 'Each step right, stay at the same height.';
    var up = s[0] > 0 ? 'up ' + s[0] : 'down ' + (-s[0]);
    return 'For each ' + (s[1] === 1 ? 'step' : s[1] + ' steps') + ' right, go ' + up + '.';
  }
  // the task as plain lines of text: [the big line, more lines…]. Points as (x, y).
  function taskLines(L) {
    var x = L.xs;
    switch (L.form) {
      case 0: case 7: return [eqTxt(L)];
      case 1: return [stdTxt(L)];
      case 2: return [psTxt(L)];
      case 3: var p0 = givenPt(L, x[0]); return ['Start at ' + ptq(p0[0], p0[1]) + '.', stepTxt(L)];
      case 4: return ['TABLE'];
      case 5: var a = givenPt(L, x[0]), b = givenPt(L, x[1]); return ['Through ' + ptq(a[0], a[1]), 'and ' + ptq(b[0], b[1]) + '.'];
      case 6: var c = givenPt(L, x[0]); return [L.B ? 'Slope ' + slopeTxt(L) + '.' : 'Slope undefined: straight up and down.', 'Through ' + ptq(c[0], c[1]) + '.'];
    }
    return [eqTxt(L)];
  }
  // the reveal's working out, in one line
  function workLine(L) {
    if (!L.B) { var c = Q(L.C, L.A); return (L.form === 0 || L.form === 7 ? '' : 'The rule is ' + eqTxt(L) + '. ') + 'x is always ' + fq(c) + ', so ' + ptq(c, Q(L.ex)) + ' is safe.'; }
    var x = L.ex, y = yAt(L, x), s = slopeQ(L), b = bQ(L), pre = L.form === 0 || L.form === 7 ? '' : 'The rule is ' + eqTxt(L) + '. ';
    if (!s[0]) return pre + 'y is always ' + fq(b) + ', so ' + ptq(Q(x), y) + ' is safe.';
    return pre + 'x = ' + nm(x) + ': ' + fq(s) + ' × ' + (x < 0 ? '(' + nm(x) + ')' : x) + plusQ(b) + ' = ' + fq(y) + ', so ' + ptq(Q(x), y) + ' is safe.';
  }
  // the hint step: "When x = 2, what is y?" with a whole-number answer on the grid, and one worked first step for the harder forms
  function scafLine(L, G, seed) {
    var pts = latticePts(L, G), v = !L.B, co = function (p) { return v ? p[1] : p[0]; };
    var near = pts.filter(function (p) { return Math.abs(co(p)) <= 3 && (L.xs || []).indexOf(co(p)) < 0; });
    var P = (near.length ? near : pts)[hash(seed) % (near.length || pts.length)], x = P[0], y = P[1], step = null, s = slopeQ(L);
    var ask = v ? 'When y = ' + nm(y) + ', what is x?' : 'When x = ' + nm(x) + ', what is y?';
    if (L.form === 1) {
      if (v) step = linTxt(L.A, 0) + ' = ' + nm(L.C) + ', so x = ' + nm(L.C) + ' ÷ ' + pq(Q(L.A)) + '.';
      else if (!L.A) step = linTxt(0, L.B) + ' = ' + nm(L.C) + ', so y = ' + nm(L.C) + ' ÷ ' + pq(Q(L.B)) + '.';
      else step = nm(L.A) + '(' + nm(x) + ')' + (L.B > 0 ? ' + ' : ' − ') + (Math.abs(L.B) === 1 ? '' : Math.abs(L.B)) + 'y = ' + nm(L.C) + ', so ' + (L.B === 1 ? '' : L.B === -1 ? '−' : nm(L.B)) + 'y = ' + nm(L.C) + ' − ' + pq(Q(L.A * x)) + '.';
    } else if (L.form === 2) step = 'Put x = ' + nm(x) + ' in: ' + psTxt(L).replace(/\(x( [−+] \d+)?\)/, '(' + nm(x) + '$1)') + '.';
    else if (L.form === 3 && !v) { var g = givenPt(L, L.xs[0]); step = 'Start at ' + ptq(g[0], g[1]) + '. x = ' + nm(x) + ' is ' + Math.abs(x - qnum(g[0])) + ' step' + (Math.abs(x - qnum(g[0])) === 1 ? '' : 's') + (x < qnum(g[0]) ? ' left' : ' right') + '. ' + stepTxt(L); }
    else if ((L.form === 4 || L.form === 5) && !v) { var a = givenPt(L, L.xs[0]), b = givenPt(L, L.xs[1]); step = 'Slope = change in y ÷ change in x = ' + fq(qsub(b[1], a[1])) + ' ÷ ' + fq(qsub(b[0], a[0])) + ' = ' + fq(s) + '. From ' + ptq(a[0], a[1]) + ', x = ' + nm(x) + ' is ' + nm(x - qnum(a[0])) + ' along.'; }
    else if (L.form === 6 && !v) { var c = givenPt(L, L.xs[0]); step = 'From ' + ptq(c[0], c[1]) + ' to x = ' + nm(x) + ' is ' + nm(x - qnum(c[0])) + ' along. The slope is ' + fq(s) + ', so y changes by ' + fq(s) + ' × ' + pq(Q(x - qnum(c[0]))) + '.'; }
    var ans = v ? Q(x) : Q(y), work = v ? 'On ' + eqTxt(L) + ', x is always ' + nm(x) + '. The safe point is ' + ptq(Q(x), Q(y)) + '.' : 'When x = ' + nm(x) + ', y = ' + nm(y) + ' (' + eqTxt(L) + '). The safe point is ' + ptq(Q(x), Q(y)) + '.';
    return { ask: ask, step: step, ans: ans, x: x, y: y, work: work };
  }

  /* ---------- a line the teacher types: any of the forms ---------- */
  // linear expressions: { x: q, y: q, c: q }
  function lin(x, y, c) { return { x: x || Q(0), y: y || Q(0), c: c || Q(0) }; }
  function lconst(e) { return !e.x[0] && !e.y[0]; }
  function parseLinear(src) {
    var s = String(src).replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').toLowerCase();
    Object.keys(VULG).forEach(function (k) { s = s.split(VULG[k]).join('(' + k + ')'); });
    var toks = [], i = 0, m;
    while (i < s.length) {
      var ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if ((m = /^\d+(\.\d+)?|^\.\d+/.exec(s.slice(i)))) { var t = m[0], dot = t.indexOf('.'); toks.push({ k: 'n', v: dot < 0 ? Q(+t) : Q(+t.replace('.', ''), Math.pow(10, t.length - dot - 1)) }); i += t.length; continue; }
      if ('xy+-*/()='.indexOf(ch) >= 0) { toks.push({ k: ch }); i++; continue; }
      throw new Error('I can\'t read "' + ch + '".');
    }
    var p = 0;
    function peek() { return toks[p] || { k: '' }; }
    function expr() { var e = term(); while (peek().k === '+' || peek().k === '-') { var op = toks[p++].k, f = term(); e = op === '+' ? ladd(e, f) : ladd(e, lscale(f, Q(-1))); } return e; }
    function term() {
      var e = factor();
      for (;;) {
        var k = peek().k;
        if (k === '*') { p++; e = lmul(e, factor()); }
        else if (k === '/') { p++; var d = factor(); if (!lconst(d) || !d.c[0]) throw new Error('Divide only by a number.'); e = lscale(e, Q(d.c[1], d.c[0])); }
        else if (k === 'n' || k === 'x' || k === 'y' || k === '(') e = lmul(e, factor());
        else return e;
      }
    }
    function factor() {
      var t = toks[p++]; if (!t) throw new Error('Something is missing at the end.');
      if (t.k === '-') return lscale(factor(), Q(-1));
      if (t.k === '+') return factor();
      if (t.k === 'n') return lin(null, null, t.v);
      if (t.k === 'x') return lin(Q(1));
      if (t.k === 'y') return lin(null, Q(1));
      if (t.k === '(') { var e = expr(); if ((toks[p++] || {}).k !== ')') throw new Error('A bracket isn\'t closed.'); return e; }
      throw new Error('I didn\'t expect "' + t.k + '".');
    }
    function ladd(a, b) { return lin(qadd(a.x, b.x), qadd(a.y, b.y), qadd(a.c, b.c)); }
    function lscale(a, k) { return lin(qmul(a.x, k), qmul(a.y, k), qmul(a.c, k)); }
    function lmul(a, b) { if (lconst(a)) return lscale(b, a.c); if (lconst(b)) return lscale(a, b.c); throw new Error('That isn\'t a straight line (x times x or x times y).'); }
    var L = expr(); if (peek().k !== '=') throw new Error('An equation needs one "=".'); p++;
    var Rr = expr(); if (p < toks.length) throw new Error('There is something extra after the equation.');
    var d = ladd(L, lscale(Rr, Q(-1)));   // d.x x + d.y y + d.c = 0
    if (!d.x[0] && !d.y[0]) throw new Error('That isn\'t a line: it needs an x or a y.');
    var den = d.x[1] * d.y[1] * d.c[1];
    return normL(d.x[0] * den / d.x[1], d.y[0] * den / d.y[1], -d.c[0] * den / d.c[1]);
  }
  function parsePts(s) { var out = [], re = /\(\s*([^,()]+?)\s*[,;]\s*([^()]+?)\s*\)/g, m; while ((m = re.exec(s))) { var x = parseNum(m[1]), y = parseNum(m[2]); if (!x || !y) throw new Error('I can\'t read the point (' + m[1] + ', ' + m[2] + ').'); out.push([x, y]); } return out; }
  function lineThrough(a, b) { if (qeq(a[0], b[0])) return qeq(a[1], b[1]) ? null : fromSlope(null, a[0]); var s = qdiv(qsub(b[1], a[1]), qsub(b[0], a[0])); return fromSlope(s, qsub(a[1], qmul(s, a[0]))); }
  // → { L } or { err }. The line must have at least `min` (4) safe points on the grid; points shown must be whole and on the grid.
  function parseRule(text, G, min) {
    min = min || 4; var t = String(text || '').trim(); if (!t) return { err: 'Type a rule first.' };
    var L, form, xs = [], low = t.toLowerCase().replace(/[−–—]/g, '-');
    try {
      var pts = parsePts(t), wholePts = function () { pts.forEach(function (p) { if (!qint(p[0]) || !qint(p[1]) || !qabsLe(p[0], G) || !qabsLe(p[1], G)) throw new Error('Use whole-number points inside the grid (−' + G + ' to ' + G + ').'); }); };
      if (/slope|gradient|\bm\s*=/.test(low)) {
        if (pts.length !== 1) throw new Error('Give the slope and one point, like: slope 2 through (1, 3).');
        wholePts();
        var sm = /(?:slope|gradient|\bm)\s*(?:is|=|:)?\s*(undefined|vertical|[+-]?\s*[\d./ ]+?)(?=\s*(?:through|thru|at|and|,|\(|$))/.exec(low);
        if (!sm) throw new Error('I can\'t find the slope. Try: slope 2 through (1, 3).');
        var sv = /undefined|vertical/.test(sm[1]) ? null : parseNum(sm[1]); if (sv === null && !/undefined|vertical/.test(sm[1])) throw new Error('I can\'t read the slope "' + sm[1].trim() + '".');
        L = sv ? fromSlope(sv, qsub(pts[0][1], qmul(sv, pts[0][0]))) : fromSlope(null, pts[0][0]); form = 6; xs = [L.B ? pts[0][0][0] : pts[0][1][0]];
      } else if (/start/.test(low)) {
        if (pts.length !== 1) throw new Error('Give the start as a point, like: start (0, 1), up 2 each step.');
        wholePts();
        var up = /(up|down|step|rise)\s*(?:by)?\s*([+-]?[\d./]+)/.exec(low), per = /(?:each|every|per|for)\s*([\d./]+)\s*(?:steps?)?\s*(?:right|across|along)?/.exec(low);
        var rise = up ? parseNum(up[2]) : /level|same|flat/.test(low) ? Q(0) : null; if (!rise) throw new Error('Say how far it goes, like: up 2 each step.');
        if (up && up[1] === 'down') rise = Q(-rise[0], rise[1]);
        var run = per ? parseNum(per[1]) : Q(1); if (!run || !run[0]) throw new Error('I can\'t read the steps across.');
        var s2 = qdiv(rise, run); L = fromSlope(s2, qsub(pts[0][1], qmul(s2, pts[0][0]))); form = 3; xs = [pts[0][0][0]];
      } else if (t.indexOf('=') >= 0) {
        L = parseLinear(t);
        var z = t.replace(/\s+/g, '').replace(/[−–—]/g, '-').toLowerCase();
        if (/^x=[^xy]*$/.test(z) || /^y=[^xy]*$/.test(z)) form = 7;
        else if (/^y=[^y]*$/.test(z)) form = 0;
        else if (/^y[+-][^xy]+=[^y]*\(x([+-][^xy()]+)?\)$/.test(z) && L.B) {
          var pm = /^y([+-][^=]+)=.*\(x([+-][^)]+)?\)$/.exec(z), y1 = parseNum(pm[1]), x1 = pm[2] ? parseNum(pm[2]) : Q(0);
          if (y1 && x1 && qint(y1) && qint(x1) && onLineQ(L, Q(-x1[0]), Q(-y1[0]))) { form = 2; xs = [-x1[0]]; } else form = 1;
        } else form = 1;
        if (form === 1) { var raw = parseLinearRaw(t); if (raw) L = raw; }
      } else if (pts.length >= 2) {
        wholePts();
        L = lineThrough(pts[0], pts[1]); if (!L) throw new Error('Those two points are the same point.');
        pts.forEach(function (p) { if (!onLineQ(L, p[0], p[1])) throw new Error('Those points are not all on one straight line.'); });
        var seen = {}; pts.forEach(function (p) { var k = fq(p[0]) + ',' + fq(p[1]); if (seen[k]) throw new Error('A point is there twice.'); seen[k] = 1; });
        form = pts.length === 2 ? 5 : 4; xs = pts.slice(0, 3).map(function (p) { return L.B ? p[0][0] : p[1][0]; });
      } else throw new Error('I can\'t read that. Try y = 2x − 1, 2x + 3y = 6, y − 3 = 2(x − 1), (1, 2) and (3, 6), slope 2 through (1, 3), or start (0, 1), up 2 each step.');
    } catch (e) { return { err: e.message }; }
    if (Math.abs(L.A) > 49 || Math.abs(L.B) > 999 || Math.abs(L.C) > 4999) return { err: 'The numbers in that rule are too big for this game.' };
    var n = latticePts(L, G).length;
    if (n < min) return { err: 'Only ' + n + ' safe point' + (n === 1 ? '' : 's') + ' on the −' + G + ' to ' + G + ' grid. It needs at least ' + min + '.' };
    if (form >= 3 && form <= 6) { form = !L.A || !L.B ? 7 : 0; xs = []; }   // points the teacher typed: the class sees the rule, not the points
    var out = { form: form, A: L.A, B: L.B, C: L.C, xs: xs, ex: 0, src: 'own' };
    var co = function (p) { return out.B ? p[0] : p[1]; }, free = latticePts(L, G).filter(function (p) { return xs.indexOf(co(p)) < 0 && !(form === 3 && p[0] === 0); });
    out.ex = co(free.filter(function (p) { return co(p) < 0; })[0] || free[0] || latticePts(L, G)[0]);
    return { L: out, n: n };
  }
  // standard form as the teacher typed it (2x + 3y = 6 stays 2x + 3y = 6, not normalised), when it is whole numbers
  function parseLinearRaw(t) {
    var m = /^\s*([+-]?\s*\d*)\s*x\s*([+-])\s*(\d*)\s*y\s*=\s*([+-]?\s*\d+)\s*$/.exec(String(t).replace(/[−–—]/g, '-').toLowerCase());
    if (!m) return null;
    var a = m[1].replace(/\s/g, ''), A = a === '' || a === '+' ? 1 : a === '-' ? -1 : +a, B = (m[3] === '' ? 1 : +m[3]) * (m[2] === '-' ? -1 : 1), C = +m[4].replace(/\s/g, '');
    return A || B ? { A: A, B: B, C: C } : null;
  }

  /* ---------- inequalities: Ax + By (op) C. Forms: 0 slope-intercept (B > 0), 1 standard, 2 horizontal or vertical ---------- */
  function sat(C, x, y) { var L = C.A * x + C.B * y, R = C.C; return C.op === 0 ? L < R : C.op === 1 ? L <= R : C.op === 2 ? L > R : L >= R; }
  function satQ(C, x, y) { var L = C.A * x[0] * y[1] + C.B * y[0] * x[1], R = C.C * x[1] * y[1]; return C.op === 0 ? L < R : C.op === 1 ? L <= R : C.op === 2 ? L > R : L >= R; }
  function onEdge(C, x, y) { return C.A * x + C.B * y === C.C; }
  function strict(C) { return C.op === 0 || C.op === 2; }
  function PTn(G) { return 2 * G + 1; }
  function region(cons, G) {
    var out = [], x, y;
    for (y = -G; y <= G; y++) for (x = -G; x <= G; x++) { var ok = true; for (var i = 0; i < cons.length && ok; i++) ok = sat(cons[i], x, y); if (ok) out.push([x, y]); }
    return out;
  }
  function edgePts(C, G) { var out = []; for (var y = -G; y <= G; y++) for (var x = -G; x <= G; x++) if (onEdge(C, x, y)) out.push([x, y]); return out; }
  function conKey(C) { var n = normL(C.A, C.B, C.C); return n.A + ',' + n.B + ',' + n.C; }
  function dirKey(C) { var g = gcd(C.A, C.B) || 1, a = C.A / g, b = C.B / g; if (b < 0 || (b === 0 && a < 0)) { a = -a; b = -b; } return a + ',' + b; }
  var CCAND = {};
  function conCands(G) {
    if (CCAND[G]) return CCAND[G];
    var out = [], op, b;
    [[1, 1], [-1, 1], [2, 1], [-2, 1], [1, 2], [-1, 2]].concat(G === 10 ? [[3, 1], [-3, 1], [1, 3], [-1, 3]] : []).forEach(function (s) {
      for (b = -G; b <= G; b++) for (op = 0; op < 4; op++) out.push({ f: 0, op: op, A: -s[0], B: s[1], C: s[1] * b });
    });
    [1, 2, 3].forEach(function (A) { [-3, -2, -1, 1, 2, 3].forEach(function (B) { if (gcd(A, B) !== 1 || (A === 1 && Math.abs(B) === 1 && B > 0)) return; for (var c = -2 * G; c <= 2 * G; c++) for (op = 0; op < 4; op++) out.push({ f: 1, op: op, A: A, B: B, C: c }); }); });
    for (b = -G + 1; b <= G - 1; b++) for (op = 0; op < 4; op++) { out.push({ f: 2, op: op, A: 1, B: 0, C: b }); out.push({ f: 2, op: op, A: 0, B: 1, C: b }); }
    out.forEach(function (C) { C.edge = edgePts(C, G).length; });
    return (CCAND[G] = out.filter(function (C) { return C.edge >= 3; }));
  }
  // the next rule: it must cut something away and leave at least `need` (never fewer than 4) safe points.
  // o: { G, forms: [0, 1, 2], strict: null (both) | true (strict only) | false (non-strict only), kind (preferred form), alt (preferred strictness), gentle }
  function genCon(R, prev, need, o) {
    o = o || {}; need = Math.max(4, need || 4); var G = o.G === 10 ? 10 : 6, forms = o.forms && o.forms.length ? o.forms : [0, 1, 2];
    var before = region(prev, G), keys = {}, dirs = {}, ok = [];
    prev.forEach(function (P) { keys[conKey(P)] = 1; dirs[dirKey(P)] = 1; });
    conCands(G).forEach(function (C) {
      if (forms.indexOf(C.f) < 0 || (o.strict === true && !strict(C)) || (o.strict === false && strict(C)) || keys[conKey(C)]) return;
      var after = 0, live = 0;
      for (var i = 0; i < before.length; i++) { var p = before[i], L = C.A * p[0] + C.B * p[1]; if (L === C.C) live++; if (C.op === 0 ? L < C.C : C.op === 1 ? L <= C.C : C.op === 2 ? L > C.C : L >= C.C) after++; }
      if (after < need || after > before.length - Math.max(2, Math.ceil(before.length * 0.15))) return;
      var ratio = after / before.length;
      ok.push({ C: C, after: after, ratio: ratio, good: ratio >= 0.45 && ratio <= 0.72 && live >= 2, par: !!dirs[dirKey(C)] });
    });
    if (!ok.length) return null;
    var out = function (x) { var C = x.C; return { f: C.f, op: C.op, A: C.A, B: C.B, C: C.C }; };
    if (o.gentle) { ok.sort(function (a, b) { return b.after - a.after; }); return out(ok[Math.floor(R() * Math.min(5, ok.length))]); }
    var pass = [
      function (x) { return x.good && !x.par && (o.alt == null || strict(x.C) === o.alt) && (o.kind == null || x.C.f === o.kind); },
      function (x) { return x.good && !x.par && (o.kind == null || x.C.f === o.kind); },
      function (x) { return x.good && !x.par; },
      function (x) { return x.good; }
    ];
    for (var k = 0; k < pass.length; k++) { var L = ok.filter(pass[k]); if (L.length) return out(L[Math.floor(R() * L.length)]); }
    ok.sort(function (a, b) { return Math.abs(a.ratio - 0.6) - Math.abs(b.ratio - 0.6); });
    return out(ok[Math.floor(R() * Math.min(5, ok.length))]);
  }
  function conTxt(C) {
    if (C.f === 2) return (C.A ? 'x ' : 'y ') + OPS[C.op] + ' ' + nm(C.C / (C.A || C.B));
    if (C.f === 1) return linTxt(C.A, C.B) + ' ' + OPS[C.op] + ' ' + nm(C.C);
    return 'y ' + OPS[C.op] + ' ' + rhsTxt(Q(-C.A, C.B), Q(C.C, C.B));
  }
  // the rule with a point put in, for a check: "3 > 1 + 1", "2(1) − 1(3) ≤ 4", "1 ≥ −2"
  function conSub(C, x, y) {
    if (C.f === 2) return nm(C.A ? x : y) + ' ' + OPS[C.op] + ' ' + nm(C.C / (C.A || C.B));
    if (C.f === 1) { var term = function (c, v) { return Math.abs(c) === 1 ? (v < 0 ? '(' + nm(v) + ')' : nm(v)) : Math.abs(c) + '(' + nm(v) + ')'; }, t = ''; if (C.A) t = (C.A < 0 ? '−' : '') + term(C.A, x); if (C.B) t += (t ? (C.B > 0 ? ' + ' : ' − ') : C.B < 0 ? '−' : '') + term(C.B, y); return t + ' ' + OPS[C.op] + ' ' + nm(C.C); }
    var s = Q(-C.A, C.B), b = Q(C.C, C.B), r = s[0] === s[1] ? (x < 0 ? '(' + nm(x) + ')' : nm(x)) : s[0] === -s[1] ? '−' + (x < 0 ? '(' + nm(x) + ')' : nm(x)) : fq(s) + ' × ' + (x < 0 ? '(' + nm(x) + ')' : nm(x));
    return nm(y) + ' ' + OPS[C.op] + ' ' + r + plusQ(b);
  }
  function conSides(C, x, y) { if (C.f === 0) return [Q(y), Q(C.C - C.A * x, C.B)]; return [Q(C.A * x + C.B * y), Q(C.C)]; }
  // the newest rule tried on a point of its own boundary, for the reveal
  function conWork(cons, G) {
    var C = cons[cons.length - 1], prev = cons.slice(0, -1), E = edgePts(C, G);
    var inside = E.filter(function (p) { return prev.every(function (P) { return sat(P, p[0], p[1]); }); }), L = inside.length ? inside : E, p = L[Math.floor((L.length - 1) / 2)];
    var sd = conSides(C, p[0], p[1]);
    return conTxt(C) + ' at ' + ptq(Q(p[0]), Q(p[1])) + ': ' + conSub(C, p[0], p[1]) + ' means ' + fq(sd[0]) + ' ' + OPS[C.op] + ' ' + fq(sd[1]) + '? ' + (strict(C) ? 'No. A point on a dashed line is lava.' : 'Yes. A point on a solid line is safe.');
  }
  // the hint step in the inequality round: "Is (1, 3) safe? Check: 3 > 1 + 1?" on a point that already follows the earlier rules
  function scafIneq(cons, G, seed) {
    var C = cons[cons.length - 1], before = region(cons.slice(0, -1), G), all = region(cons, G), h = hash(seed);
    var near = before.slice().sort(function (a, b) { return Math.abs(C.A * a[0] + C.B * a[1] - C.C) - Math.abs(C.A * b[0] + C.B * b[1] - C.C) || (hash(seed + a) % 97) - (hash(seed + b) % 97); }).slice(0, 14);
    var P = near[h % near.length], safe = sat(C, P[0], P[1]), alt = safe ? P : all[(h >>> 4) % all.length], sd = conSides(C, P[0], P[1]);
    var chk = conSub(C, P[0], P[1]), tr = sat(C, P[0], P[1]);
    return { x: P[0], y: P[1], safe: safe, ax: alt[0], ay: alt[1], ask: 'Is ' + ptq(Q(P[0]), Q(P[1])) + ' safe?', check: 'Check: ' + chk + '?', earlier: cons.length > 1,
      work: chk + ' means ' + fq(sd[0]) + ' ' + OPS[C.op] + ' ' + fq(sd[1]) + '. That is ' + (tr ? 'true' : 'false') + ', so ' + ptq(Q(P[0]), Q(P[1])) + ' is ' + (safe ? 'safe' : 'lava') + '.' };
  }

  /* ---------- results and points ---------- */
  function pkey(P) { return P.x[0] + '/' + P.x[1] + ',' + P.y[0] + '/' + P.y[1]; }
  // picks: { who: { x: q, y: q } or null }. Results: 0 none, 1 safe, 2 safe and nobody else chose it, 3 lava
  function judge(isSafe, picks) {
    var cnt = {}, res = {};
    Object.keys(picks).forEach(function (k) { var P = picks[k]; if (P) cnt[pkey(P)] = (cnt[pkey(P)] || 0) + 1; });
    Object.keys(picks).forEach(function (k) { var P = picks[k]; res[k] = !P ? 0 : !isSafe(P) ? 3 : cnt[pkey(P)] === 1 ? 2 : 1; });
    return res;
  }
  function judgeLine(L, picks) { return judge(function (P) { return onLineQ(L, P.x, P.y); }, picks); }
  function judgeRegion(cons, picks) { return judge(function (P) { return cons.every(function (C) { return satQ(C, P.x, P.y); }); }, picks); }
  // the elimination: who goes. dup: two survivors on one point both go. If everyone still in would go, nobody does.
  function resolveElim(cons, alive, picks, dup) {
    var res = judgeRegion(cons, picks), cnt = {}, out = [];
    alive.forEach(function (k) { var P = picks[k]; if (P) cnt[pkey(P)] = (cnt[pkey(P)] || 0) + 1; });
    var shared = {};
    alive.forEach(function (k) { var P = picks[k]; if (res[k] === 0 || res[k] === 3) out.push(k); else if (dup && cnt[pkey(P)] > 1) { out.push(k); shared[k] = 1; } });
    var spared = alive.length > 0 && out.length === alive.length;
    return { res: res, out: spared ? [] : out, shared: spared ? {} : shared, spared: spared };
  }
  // speed: up to +50 for a safe answer, falling over the round; t in ms on the student's own device. An impossible time scores nothing.
  function speedBonus(t, lenS, maxS) {
    if (typeof t !== 'number' || !isFinite(t) || t < 0 || t > (maxS || lenS + 15) * 1000) return 0;
    return Math.round(50 * (1 - Math.min(t, lenS * 1000) / (lenS * 1000)));
  }
  function multOf(P) { var neg = P.x[0] < 0 || P.y[0] < 0, fr = !qint(P.x) || !qint(P.y); return neg && fr ? { m: 3, n: 'negative and fraction' } : fr ? { m: 2, n: 'fraction' } : neg ? { m: 1.5, n: 'negative' } : { m: 1, n: '' }; }
  // one round's points. o: { speed, uniq, mult } on or off; r: the result (4: safe with the hint step)
  function points(o, r, P, t, lenS, maxS) {
    if (r === 4) return { base: 60, speed: 0, uniq: 0, m: 1, mn: '', total: 60 };
    if (r !== 1 && r !== 2) return { base: 0, speed: 0, uniq: 0, m: 1, mn: '', total: 0 };
    var sp = o.speed ? speedBonus(t, lenS, maxS) : 0, un = o.uniq && r === 2 ? 25 : 0, M = o.mult && P ? multOf(P) : { m: 1, n: '' };
    return { base: 100, speed: sp, uniq: un, m: M.m, mn: M.n, total: Math.round((100 + sp + un) * M.m) };
  }
  function breakdown(p) {
    if (!p.total) return '0';
    if (p.base === 60) return 'Hint step 60';
    var s = 'Safe 100' + (p.speed ? ' + speed ' + p.speed : '') + (p.uniq ? ' + alone 25' : '');
    if (p.m === 1) return s + (p.speed || p.uniq ? ' = ' + p.total : '');
    return s + ' = ' + (100 + p.speed + p.uniq) + ', ×' + p.m + ' ' + p.mn + ' = ' + p.total;
  }

  /* ---------- the live state's numbers ---------- */
  function encLine(L, no) { var g = (L.xs || []).concat([0, 0, 0]).slice(0, 3); return [L.form, L.A + 5000, L.B + 5000, L.C + 5000, (L.xs || []).length, g[0] + 5000, g[1] + 5000, g[2] + 5000, L.ex + 5000, no || 1]; }
  function decLine(q) { if (!Array.isArray(q) || q.length < 9) return null; var L = { form: q[0], A: q[1] - 5000, B: q[2] - 5000, C: q[3] - 5000, xs: [q[5] - 5000, q[6] - 5000, q[7] - 5000].slice(0, q[4]), ex: q[8] - 5000, no: q[9] || 1 }; return L.A || L.B ? L : null; }
  function encCon(C) { return [C.f + 3 * C.op, (C.A + 50) * 100 + (C.B + 50), C.C + 5000]; }
  function decCon(a, i) { var v = a[i], w = a[i + 1]; return { f: v % 3, op: Math.floor(v / 3), A: Math.floor(w / 100) - 50, B: w % 100 - 50, C: a[i + 2] - 5000 }; }
  function posEnc(q, G) { return q ? Math.max(0, Math.min(498, Math.round((qnum(q) + G) * 24))) : 499; }
  function posDec(v, G) { return v >= 499 ? null : v / 24 - G; }
  function encQ(q) { return q ? q[0] + '/' + q[1] : '-'; }
  function decQ(s) { var m = /^(-?\d+)\/(\d+)$/.exec(String(s || '')); return m ? Q(+m[1], +m[2]) : null; }

  var M = { OPS: OPS, FORMS: FORMS, FORM_EX: FORM_EX, EASY: EASY, RULES: RULES, CATS: CATS, CAT_N: CAT_N, CAT_OK: CAT_OK, IFORMS: IFORMS, rng: rng, hash: hash, gcd: gcd, Q: Q, qadd: qadd, qsub: qsub, qmul: qmul, qdiv: qdiv, qeq: qeq, qcmp: qcmp, qint: qint, qnum: qnum,
    nm: nm, fq: fq, ptq: ptq, parseNum: parseNum, vert: vert, slopeQ: slopeQ, bQ: bQ, yAt: yAt, onLine: onLine, onLineQ: onLineQ, latticePts: latticePts, normL: normL, lkey: lkey, fromSlope: fromSlope, catOf: catOf, candidates: candidates,
    genLines: genLines, givenPt: givenPt, eqTxt: eqTxt, stdTxt: stdTxt, psTxt: psTxt, linTxt: linTxt, slopeTxt: slopeTxt, stepTxt: stepTxt, taskLines: taskLines, workLine: workLine, scafLine: scafLine,
    parseLinear: parseLinear, parseRule: parseRule, sat: sat, satQ: satQ, onEdge: onEdge, strict: strict, region: region, edgePts: edgePts, genCon: genCon, conTxt: conTxt, conSub: conSub, conSides: conSides, conWork: conWork, scafIneq: scafIneq,
    pkey: pkey, judgeLine: judgeLine, judgeRegion: judgeRegion, resolveElim: resolveElim, speedBonus: speedBonus, multOf: multOf, points: points, breakdown: breakdown,
    encLine: encLine, decLine: decLine, encCon: encCon, decCon: decCon, posEnc: posEnc, posDec: posDec, encQ: encQ, decQ: decQ, PTn: PTn };
  root.SFA_STAND_MATH = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;

  /* ===================================== the game ===================================== */
  var window = root.window, A = window && window.SFA_LESSON_API, SFA = window && window.SFA, AV = window && window.SFA_AVATAR;
  if (!A || !SFA || (window.SFA_STAND && window.SFA_STAND.v)) return;
  var document = window.document, H = A.H, el = A.el, esc = SFA.esc;
  var HOST2 = !!A.standV2;   // the lesson page knows The Floor Is Lava (an older one only knows version 1)

  /* ---------- version 1 (Stand on the Line), for a page or a game that is still on it ---------- */
  var V1_URL = 'sfa-stand-v1.js?v=20261111a', v1Q = null;
  function v1(cb) {
    if (window.SFA_STAND_V1) { if (cb) cb(window.SFA_STAND_V1); return; }
    if (v1Q) { if (cb) v1Q.push(cb); return; }
    v1Q = cb ? [cb] : [];
    var sc = document.createElement('script'); sc.src = V1_URL;
    sc.onload = function () { var q = v1Q; v1Q = null; q.forEach(function (f) { try { f(window.SFA_STAND_V1); } catch (e) { console.warn(e); } }); };
    sc.onerror = function () { v1Q = null; };
    document.head.appendChild(sc);
  }
  function liveV1() { var L = A.live(); return !!(L && L.counts && Array.isArray(L.counts.zks) && !Array.isArray(L.counts.zvs)); }
  if (!HOST2) {
    v1();
    var X = function () { return window.SFA_STAND_V1; };
    window.SFA_STAND = { v: 1, math: M,
      sync: function () { v1(function (x) { x.sync(); }); },
      agg: function () { if (X()) X().agg(); }, section: function (p) { if (X()) X().section(p); },
      counts: function (o) { if (X()) X().counts(o); }, spot: function () { return X() ? X().spot() : null; },
      start: function () { var a = arguments; if (X()) return X().start.apply(null, a); v1(function (x) { x.start.apply(null, a); }); return false; },
      restore: function (L) { if (X()) return X().restore(L); v1(function (x) { if (!x.restore(L)) A.pushLive(); A.consolePanel(); }); return true; } };
    return;
  }

  var QID = 'zstandx1', MAXS = 60, LOBBY = 16, LEAD = 3, GRACE = 7, REVEAL = 12, EINTRO = 11, EREVEAL = 13, DUP_FROM = 4, PUSH_MS = 4000;
  var DEF = { forms: [0, 1, 2, 7], order: 2, cats: ['pw', 'nw', 'z', 'f'], G: 6, rounds: 5, secs: 25, ineq: 2, iforms: [0, 2], strict: 0, ncon: 6, dup: 1, speed: 1, uniq: 1, mult: 1, scaf: 1, custom: [] };
  function settings() { var s = SFA.store.get('teacher.lava', null) || {}, o = {}; Object.keys(DEF).forEach(function (k) { o[k] = s[k] == null ? (Array.isArray(DEF[k]) ? DEF[k].slice() : DEF[k]) : s[k]; }); o.forms = (o.forms || []).filter(function (f) { return RULES.indexOf(f) >= 0; }); if (!o.forms.length) o.forms = DEF.forms.slice(); return o; }
  function saveSettings(o) { SFA.store.set('teacher.lava', o); }
  function sh3(sid) { return (hash(sid) % 46656).toString(36); }
  function clean(n) { return String(n || '').replace(/[~,#|.;]/g, '').slice(0, 12); }
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  function clock(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  // looks travel as the classic 12 characters; A.fullLook adds each student's extras (hair, outfit…) back when the console sent them
  function avSvg(look, size) { return AV ? AV.svg(A && A.fullLook ? A.fullLook(look || '') : look || '', { size: size || 64, walk: true }) : '<span class="lavanoav">🙂</span>'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

  /* ---------- the game in the live state ---------- */
  function standOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zvs) || !Array.isArray(c.zvid)) return null;
    var z = c.zvs, id = A.decRun(c.zvid), start = A.MODE === 'screen' ? id : A.decRun(c.zvst) || id, ob = z[11] || 0;
    var o = { id: id, start: start, state: z[0], g: z[1] || 0, nLine: z[2] || 5, len: z[3] || 25, at: start + (z[4] || 0) * 1000, n: z[5] || 0, pause: z[6] || 0, flag: z[7] || 0, nc: z[8] || 0, ineq: z[9] || 0, G: z[10] === 10 ? 10 : 6,
      speed: !!(ob & 1), uniq: !!(ob & 2), mult: !!(ob & 4), scafMode: Math.floor(ob / 8) % 4, mute: !!(ob & 32), dup: !!(ob & 64), L: null, cons: [], maxCons: 0, sl: [], ros: [] };
    if (o.state === 2 || o.state === 3) o.L = decLine(c.zvq);
    var cc = (c.zvc0 || []).concat(c.zvc1 || []);
    if (cc.length) { o.maxCons = cc[0]; for (var i = 0; i < o.nc && 1 + 3 * i + 2 < cc.length; i++) o.cons.push(decCon(cc, 1 + 3 * i)); }
    for (var k = 0; k < o.n; k++) {
      var p = c['zvp' + Math.floor(k / 6)] || [], X = p[(k % 6) * 2], Y = p[(k % 6) * 2 + 1], tot = (c['zvx' + Math.floor(k / 12)] || [])[k % 12] || 0, rv = (c['zvr' + Math.floor(k / 12)] || [])[k % 12] || 0;
      if (X == null) X = 499; if (Y == null) Y = 499;
      var f = Math.floor(X / 500), px = X % 500;
      o.sl.push({ i: k, x: posDec(px, o.G), y: posDec(Y, o.G), res: f % 5, ghost: Math.floor(f / 5) % 2, out: Math.floor(f / 10) % 2, sc: tot, rs: rv % 1000, scaf: Math.floor(rv / 1000) % 2 });
    }
    var sp = Lv.spot && Lv.spot.q === 'zstand' ? String(Lv.spot.text || '') : '';
    if (sp.slice(0, 2) === 'P:') sp.slice(2).split(',').forEach(function (x) { var q = x.split('~'); if (q[1]) o.ros.push({ i: +q[0], fp: q[1], n: q[2] || '?', look: q[3] || '' }); });
    return o;
  }
  function asking(st) { return st === 2 || st === 5; }
  function shown(st) { return st === 3 || st === 6; }
  function phaseLen(o) { return o.state === 1 ? LOBBY : asking(o.state) ? LEAD + o.len : o.state === 3 ? REVEAL : o.state === 4 ? EINTRO : o.state === 6 ? EREVEAL : 0; }
  function left(o) { return o.pause ? o.pause - 1 : phaseLen(o) - (sNow() - o.at) / 1000; }
  function maxS(o) { return LEAD + o.len + GRACE + 5; }

  /* ===================== every screen ===================== */
  var rootEl = null, V = null, ST = null;
  function key() { return 'stand2.' + A.LID; }
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
    ST = saved && saved.id === o.id ? saved : { id: o.id, g: 0, x: null, y: null, t: -1, s: 0, shownG: 0, shownAt: 0, pausedMs: 0, sum: { r: 0, o: 0, n: 0, h: 0, e: 0, f: 0 }, doneG: 0, hist: [], scafG: 0, lastScaf: 0, xpG: 0, endXp: 0, lock: 0 };
    V = { id: o.id, o: null, ros: {}, av: {}, sig: '', G: o.G, fps: [], drawMs: [] };
    var rs = SFA.store.get('stand2.ros.' + A.LID, null); if (rs && rs.id === o.id) V.ros = rs.ros || {};
    rootEl = H('div', 'lava ' + (screenish() ? 'scr' : 'stu') + (reduced() ? ' calm' : '')); rootEl.setAttribute('role', 'dialog'); rootEl.setAttribute('aria-modal', 'true'); rootEl.setAttribute('aria-label', 'The Floor Is Lava');
    rootEl.innerHTML = '<div class="lavatop"><span class="lavalogo">🌋 THE FLOOR IS LAVA</span><span class="lavamid"><b class="lavaph"></b><span class="lavaclock"></span></span><span class="lavaright"></span></div>' +
      '<div class="lavabodyw"><div class="lavaside"></div><div class="lavasqw"><div class="lavasq"><canvas class="lavacv" aria-hidden="true"></canvas><div class="lavasvg"></div><div class="lavalay"></div></div></div><div class="lavainfo"></div></div><div class="lavafin" hidden></div>';
    document.body.appendChild(rootEl); document.body.classList.add('boarding'); document.body.classList.add('clashing');
    V.sq = rootEl.querySelector('.lavasq'); V.svg = rootEl.querySelector('.lavasvg'); V.lay = rootEl.querySelector('.lavalay'); V.side = rootEl.querySelector('.lavaside'); V.info = rootEl.querySelector('.lavainfo'); V.fin = rootEl.querySelector('.lavafin');
    V.svg.addEventListener('click', function (e) { var t = e.target && e.target.closest && e.target.closest('[data-p]'); if (t) { var p = t.getAttribute('data-p').split(','); tap(Q(+p[0]), Q(+p[1])); } });
    V.tick = setInterval(function () { if (rootEl) drawTop(); }, 250);
    V.mill = setInterval(mill, 600);
    V.rs = function () { fit(); }; window.addEventListener('resize', V.rs);
    V.lava = lavaStart(rootEl.querySelector('.lavacv'), screenish());
    if (A.MODE === 'screen') { V.unlock = function () { audio(true); }; document.addEventListener('pointerdown', V.unlock); document.addEventListener('keydown', V.unlock); }
    if (A.MODE === 'student' && !(saved && saved.id === o.id)) send();   // so the console sees a late arrival and gives them a place
  }
  function close() {
    if (!rootEl) return;
    clearInterval(V.tick); clearInterval(V.mill); window.removeEventListener('resize', V.rs); (V.timers || []).forEach(clearTimeout);
    if (V.lava) V.lava.stop();
    if (V.unlock) { document.removeEventListener('pointerdown', V.unlock); document.removeEventListener('keydown', V.unlock); }
    rootEl.remove(); rootEl = null; V = null; document.body.classList.remove('boarding'); document.body.classList.remove('clashing');
  }
  function later(f, ms) { (V.timers = V.timers || []).push(setTimeout(function () { if (rootEl) f(); }, ms)); }
  function fit() { if (!V || !V.lay) return; rootEl.classList.toggle('g10', V.G === 10); var w = V.lay.getBoundingClientRect().width || 600; V.lay.style.fontSize = Math.max(8, Math.round(w * (V.G === 10 ? 0.013 : 0.0165))) + 'px'; if (V.lava) V.lava.resize(); }

  function mergeRoster(o) {
    var ch = false;
    o.ros.forEach(function (r) { var x = V.ros[r.i]; if (!x || x.fp !== r.fp || x.look !== r.look || x.n !== r.n) { V.ros[r.i] = { fp: r.fp, n: r.n, look: r.look }; ch = true; } });
    if (ch) SFA.store.set('stand2.ros.' + A.LID, { id: V.id, ros: V.ros });
    return ch;
  }
  function myFp() { return A.MODE === 'student' && A.S.me ? sh3(A.S.me.sid) : ''; }
  function mySlot() { var f = myFp(); if (!f) return -1; for (var k in V.ros) if (V.ros[k].fp === f) return +k; return -1; }
  function me(o) { var i = mySlot(); return i >= 0 && o.sl[i] ? o.sl[i] : null; }
  function nameOfSlot(i) { return V.ros[i] ? V.ros[i].n : '…'; }
  function myLook() { var i = mySlot(); if (i >= 0 && V.ros[i]) return V.ros[i].look; try { return AV.myLook(AV.profile(), A.S.me.sid); } catch (e) { return AV && A.S.me ? AV.defLook(A.S.me.sid) : ''; } }
  function alive(o) { return o.sl.filter(function (s) { return !s.ghost && !s.out; }); }
  function myPick() { return ST && ST.x && ST.y ? { x: ST.x, y: ST.y } : null; }
  function myScaf(o) { var s = me(o); return !!(s && s.scaf); }

  function apply(o) {
    var prev = V.o; V.o = o;
    var rch = mergeRoster(o);
    if (A.MODE === 'student') studentStep(o, prev);
    if (V.G !== o.G) { V.G = o.G; fit(); }
    var sig = [o.state, o.g, o.nc, o.flag, o.G].join('|');
    if (sig !== V.sig) { var was = V.sig; V.sig = sig; draw(); if (shown(o.state) && was && prev && asking(prev.state)) reveal(o); else if (shown(o.state)) settle(o); }
    else if (rch && o.state === 7) draw();
    if (A.MODE === 'screen' && prev && asking(o.state) && !asking(prev.state)) snd('bloop');
    updAv(); updInfo(); drawTop();
  }
  // a student's own bookkeeping: when the round showed (for their time), their results, the summary for the report, XP
  function studentStep(o, prev) {
    if (asking(o.state) && ST.g !== o.g) {
      ST.prevScaf = ST.scafG === ST.g && ST.g > 0 ? 1 : 0;
      ST.g = o.g; ST.x = null; ST.y = null; ST.t = -1; ST.s = 0; ST.lock = 0; ST.shownAt = Date.now(); ST.pausedMs = 0; V.pauseAt = 0; keep();
    }
    if (asking(o.state)) {
      if (o.pause && !V.pauseAt) V.pauseAt = Date.now();
      if (!o.pause && V.pauseAt) { ST.pausedMs += Date.now() - V.pauseAt; V.pauseAt = 0; keep(); }
      if (myScaf(o) && ST.scafG !== o.g) { ST.scafG = o.g; keep(); }
    }
    var s = me(o);
    if (s && shown(o.state) && ST.doneG < o.g && ST.g === o.g) {
      ST.doneG = o.g;
      var safe = s.res === 1 || s.res === 2 || s.res === 4, line = o.state === 3, answered = !!myPick() || ST.s === 2;
      if (line) { ST.sum.o++; if (safe) ST.sum.r++; } else { ST.sum.f++; if (safe) ST.sum.e++; }
      if (answered) ST.sum.n++;
      if (ST.scafG === o.g) ST.sum.h++;
      ST.hist.push(safe ? (s.res === 4 ? 'h' : 'y') : 'n'); ST.hist = ST.hist.slice(-6);
      ST.lastMult = !!(myPick() && multOf(myPick()).m > 1);
      keep(); xp(safe ? (s.res === 4 ? 8 : s.res === 2 ? 15 : 10) : answered ? 1 : 0);
      send();   // the summary row for the report (the console ignores a row for a round that is over)
    }
    if (s && o.state === 7 && !ST.endXp && (ST.sum.o || ST.sum.f)) { ST.endXp = 1; keep(); xp(30 + (podium(o).some(function (x) { return x.i === s.i; }) ? 30 : 0), true); }
  }

  /* ---------- the floor ---------- */
  function U() { return 600 / (2 * V.G); }
  function sx(x) { return 350 + U() * x; }
  function sy(y) { return 350 - U() * y; }
  function px(x) { return sx(x) / 7; }
  function py(y) { return sy(y) / 7; }
  // the safe region as a polygon: the square cut by each half-plane Ax + By (op) C
  function regionPoly(cons) {
    var B = V.G + 0.5, poly = [[-B, -B], [B, -B], [B, B], [-B, B]];
    cons.forEach(function (C) {
      var a = C.A, b = C.B, c = -C.C; if (C.op >= 2) { a = -a; b = -b; c = -c; }
      var f = function (p) { return a * p[0] + b * p[1] + c; }, out = [];
      for (var i = 0; i < poly.length; i++) {
        var p = poly[i], q = poly[(i + 1) % poly.length], fp = f(p), fq2 = f(q);
        if (fp <= 0) out.push(p);
        if ((fp < 0 && fq2 > 0) || (fp > 0 && fq2 < 0)) { var t = fp / (fp - fq2); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
      }
      poly = out;
    });
    return poly;
  }
  function seg(a, b, c) {   // ax + by = c, cut to the square
    var B = V.G + 0.5, pts = [];
    var add = function (x, y) { if (Math.abs(x) <= B + 1e-9 && Math.abs(y) <= B + 1e-9 && !pts.some(function (p) { return Math.abs(p[0] - x) < 1e-6 && Math.abs(p[1] - y) < 1e-6; })) pts.push([x, y]); };
    if (b !== 0) { add(-B, (c + a * B) / b); add(B, (c - a * B) / b); }
    if (a !== 0) { add((c + b * B) / a, -B); add((c - b * B) / a, B); }
    return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
  }
  function lineSeg(g, cls) { return g ? '<line class="' + cls + '" x1="' + sx(g[0][0]).toFixed(1) + '" y1="' + sy(g[0][1]).toFixed(1) + '" x2="' + sx(g[1][0]).toFixed(1) + '" y2="' + sy(g[1][1]).toFixed(1) + '"/>' : ''; }
  var ROCK = '<defs><pattern id="lavarock" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#4a4440"/><path d="M0 12 L14 18 L22 6 M14 18 L18 34 L4 44 M18 34 L36 30 L44 46 L60 40 M36 30 L40 12 L56 8 M44 46 L40 60" stroke="#2c2724" stroke-width="2" fill="none"/><circle cx="48" cy="22" r="3" fill="#5c5650"/><circle cx="10" cy="54" r="2" fill="#5c5650"/></pattern>' +
    '<radialGradient id="lavastoneg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#9a928a"/><stop offset=".6" stop-color="#5e5751"/><stop offset="1" stop-color="#2f2a27"/></radialGradient></defs>';
  function floorSvg(o) {
    var G = V.G, s = '<svg viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Coordinate grid from −' + G + ' to ' + G + ', the floor is lava">' + ROCK, i, x, y;
    var cooled = o.state === 6 ? o.cons : o.state === 5 ? o.cons.slice(0, -1) : [];
    if (cooled.length) { var poly = regionPoly(cooled); if (poly.length > 2) s += '<polygon class="lavareg' + (o.state === 6 ? ' cool' : '') + '" points="' + poly.map(function (q) { return sx(q[0]).toFixed(1) + ',' + sy(q[1]).toFixed(1); }).join(' ') + '"/>'; }
    var step = G === 10 ? 2 : 1;
    for (i = -G; i <= G; i++) s += '<line class="lavagl' + (i === 0 ? ' ax' : '') + '" x1="' + sx(i) + '" y1="' + sy(-G - 0.4) + '" x2="' + sx(i) + '" y2="' + sy(G + 0.4) + '"/><line class="lavagl' + (i === 0 ? ' ax' : '') + '" x1="' + sx(-G - 0.4) + '" y1="' + sy(i) + '" x2="' + sx(G + 0.4) + '" y2="' + sy(i) + '"/>';
    for (i = -G; i <= G; i += step) if (i) s += '<text class="lavanum" x="' + sx(i) + '" y="' + (sy(0) + 19) + '">' + nm(i) + '</text><text class="lavanum" x="' + (sx(0) - 8) + '" y="' + (sy(i) + 5) + '" text-anchor="end">' + nm(i) + '</text>';
    s += '<text class="lavanum ax" x="' + (sx(G) + 18) + '" y="' + (sy(0) - 8) + '">x</text><text class="lavanum ax" x="' + (sx(0) + 12) + '" y="' + (sy(G) - 12) + '">y</text>';
    (o.state === 5 || o.state === 6 ? o.cons : []).forEach(function (C, k) { var last = k === o.cons.length - 1; s += lineSeg(seg(C.A, C.B, C.C), 'lavabd' + (strict(C) ? ' dash' : '') + (last ? (o.state === 5 ? ' hot' : ' new') : '')); });
    var safe = {}, inR = null, hollow = {}, stones = [], r0 = G === 10 ? 3 : 4.5;
    if (o.state === 3 && o.L) {
      s += lineSeg(seg(o.L.A, o.L.B, o.L.C), 'lavaline');
      latticePts(o.L, G).forEach(function (q) { safe[q[0] + ',' + q[1]] = 1; stones.push(q); });
      // a typed fraction that was right gets a stone of its own
      o.sl.forEach(function (t) { if ((t.res === 1 || t.res === 2 || t.res === 4) && t.x != null && (t.x !== Math.round(t.x) || t.y !== Math.round(t.y))) stones.push([t.x, t.y]); });
      var ord = stones.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
      ord.forEach(function (q, k) { var sz = U() * 0.42; s += '<g class="lavastone" style="animation-delay:' + (k * 70) + 'ms"><path transform="translate(' + sx(q[0]).toFixed(1) + ' ' + sy(q[1]).toFixed(1) + ')" d="M' + (-sz) + ' 2 C' + (-sz) + ' ' + (-sz * 0.8) + ' ' + (-sz * 0.3) + ' ' + (-sz * 0.9) + ' 0 ' + (-sz * 0.85) + ' C' + (sz * 0.5) + ' ' + (-sz * 0.95) + ' ' + sz + ' ' + (-sz * 0.6) + ' ' + sz + ' 0 C' + sz + ' ' + (sz * 0.7) + ' ' + (sz * 0.4) + ' ' + (sz * 0.8) + ' 0 ' + (sz * 0.75) + ' C' + (-sz * 0.5) + ' ' + (sz * 0.8) + ' ' + (-sz) + ' ' + (sz * 0.6) + ' ' + (-sz) + ' 2Z"/></g>'; });
    }
    if (o.state === 5 || o.state === 6) { var shownC = o.state === 6 ? o.cons : o.cons.slice(0, -1); if (shownC.length) { inR = {}; region(shownC, G).forEach(function (q) { inR[q[0] + ',' + q[1]] = 1; }); shownC.forEach(function (C) { if (strict(C)) edgePts(C, G).forEach(function (q) { hollow[q[0] + ',' + q[1]] = 1; }); }); } }
    for (y = -G; y <= G; y++) for (x = -G; x <= G; x++) {
      var k2 = x + ',' + y; if (safe[k2]) continue;
      var cls = 'lavadot' + (inR ? (inR[k2] ? ' in' : hollow[k2] ? ' hol' : ' no') : '');
      s += '<circle class="' + cls + '" cx="' + sx(x) + '" cy="' + sy(y) + '" r="' + (inR && inR[k2] ? r0 * 1.3 : r0) + '"/>';
    }
    if (!screenish()) {
      if (shown(o.state)) { var cnt = {}; o.sl.forEach(function (t) { if (t.x != null) { var kk = t.x + ',' + t.y; cnt[kk] = (cnt[kk] || 0) + 1; } }); Object.keys(cnt).forEach(function (kk) { var q = kk.split(','); s += '<circle class="lavaoth" cx="' + sx(+q[0]) + '" cy="' + sy(+q[1]) + '" r="' + Math.min(U() * 0.45, U() * 0.18 + 2.5 * cnt[kk]) + '"/>'; }); }
      var mp = myPick(); if (mp && (asking(o.state) || shown(o.state))) s += '<circle class="lavamine" cx="' + sx(qnum(mp.x)).toFixed(1) + '" cy="' + sy(qnum(mp.y)).toFixed(1) + '" r="' + (U() * 0.36).toFixed(1) + '"/>';
      if (asking(o.state)) for (y = -G; y <= G; y++) for (x = -G; x <= G; x++) s += '<circle class="lavahit" data-p="' + x + ',' + y + '" cx="' + sx(x) + '" cy="' + sy(y) + '" r="' + (U() * 0.5) + '"/>';
    }
    return s + '</svg>';
  }

  /* ---------- the lava: one canvas, a low-resolution field drawn big, with heat shimmer, bubbles and embers ---------- */
  function lavaStart(cv, big) {
    var ctx = cv.getContext('2d'), N = big ? 96 : 64, buf = document.createElement('canvas'); buf.width = buf.height = N;
    var bx = buf.getContext('2d'), img = bx.createImageData(N, N), pal = [], raf = 0, on = true, calm = reduced(), bubbles = [], embers = [], fN = 0, W = 0, t0 = performance.now(), last = 0, frames = 0, fpsAt = performance.now();
    var stops = [[0, [34, 8, 4]], [0.25, [110, 18, 6]], [0.45, [190, 40, 8]], [0.62, [245, 98, 10]], [0.8, [255, 170, 40]], [1, [255, 236, 150]]];
    for (var i = 0; i < 256; i++) { var v = i / 255, j = 0; while (j < stops.length - 2 && v > stops[j + 1][0]) j++; var a = stops[j], b = stops[j + 1], f = Math.max(0, Math.min(1, (v - a[0]) / (b[0] - a[0]))); pal.push([0, 1, 2].map(function (c) { return Math.round(a[1][c] + (b[1][c] - a[1][c]) * f); })); }
    function resize() { var r = cv.getBoundingClientRect(), d = Math.min(1, window.devicePixelRatio || 1); W = Math.max(50, Math.round(r.width * d)); if (cv.width !== W) { cv.width = cv.height = W; } if (calm) frame(performance.now()); }
    // per column and per row terms once, then three sines and a square root a pixel
    var colA = new Float32Array(N), colB = new Float32Array(N), colD = new Float32Array(N), rowA = new Float32Array(N), rowB = new Float32Array(N), rowD = new Float32Array(N), rowC = new Float32Array(N);
    function field(t) {
      var d = img.data, p = 0, cx = 5 + 2 * Math.sin(t * 0.2), cy = 5 - Math.cos(t * 0.17), x, y, s10 = 10 / N;
      for (x = 0; x < N; x++) { var u = x * s10; colA[x] = Math.sin(u * 1.1 + t * 0.45); colB[x] = Math.sin(u * 1.1 - t * 0.13) * 1.4; colD[x] = (u - cx) * (u - cx); }
      for (y = 0; y < N; y++) { var w = y * s10; rowA[y] = Math.sin(w * 0.9 - t * 0.37); rowB[y] = Math.sin(w * 1.3 + t * 0.21) * 1.6; rowD[y] = (w - cy) * (w - cy); rowC[y] = w * 2.1 - t * 0.17; }
      for (y = 0; y < N; y++) {
        var ra = rowA[y], rb = rowB[y], rd = rowD[y], rc = rowC[y];
        for (x = 0; x < N; x++) {
          // a slow glow under a dark crust, cut by bright cracks that drift
          var glow = (colA[x] + ra + Math.sin(Math.sqrt(colD[x] + rd) * 1.4 - t * 0.7)) / 3;
          var cr = Math.sin(x * s10 * 1.9 + rb) * Math.sin(rc + colB[x]), crack = 1 - (cr < 0 ? -cr : cr) * 5.5;
          var k = 0.16 + 0.15 * (glow + 1) + (crack > 0 ? 0.62 * crack * crack : 0);
          var c = pal[k >= 1 ? 255 : (k * 255) | 0];
          d[p++] = c[0]; d[p++] = c[1]; d[p++] = c[2]; d[p++] = 255;
        }
      }
      bx.putImageData(img, 0, 0);
    }
    function frame(now) {
      var t = calm ? 3 : (now - t0) / 1000, s0 = performance.now();
      if (!W) resize();
      if (calm || !(fN++ & 1)) field(t);   // the glow moves slowly: a new field every other frame; shimmer, bubbles and embers every frame
      ctx.imageSmoothingEnabled = true;
      var strips = calm ? 1 : 20, h = W / strips, sh = N / strips;
      for (var k = 0; k < strips; k++) { var off = calm ? 0 : Math.sin(t * 2.6 + k * 0.7) * W * 0.004; ctx.drawImage(buf, 0, k * sh, N, sh, off - 2, k * h, W + 4, h + 1); }
      if (!calm) {
        if (Math.random() < (big ? 0.12 : 0.06) && bubbles.length < (big ? 10 : 5)) bubbles.push({ x: Math.random(), y: Math.random(), r: 0, max: 0.012 + Math.random() * 0.022, pop: 0 });
        ctx.save();
        bubbles = bubbles.filter(function (b) {
          if (!b.pop) { b.r += b.max * 0.025; if (b.r >= b.max) { b.pop = 1; if (big && Math.random() < 0.35) snd('pop'); } }
          else b.pop += 0.08;
          var X = b.x * W, Y = b.y * W, R = b.r * W;
          if (!b.pop) { var gr = ctx.createRadialGradient(X - R * 0.3, Y - R * 0.3, R * 0.1, X, Y, R); gr.addColorStop(0, 'rgba(255,240,170,.95)'); gr.addColorStop(0.7, 'rgba(255,120,20,.7)'); gr.addColorStop(1, 'rgba(120,20,4,.6)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(X, Y, R, 0, 6.283); ctx.fill(); return true; }
          ctx.strokeStyle = 'rgba(255,210,120,' + Math.max(0, 0.8 - b.pop) + ')'; ctx.lineWidth = W * 0.003; ctx.beginPath(); ctx.arc(X, Y, R * (1 + b.pop * 1.6), 0, 6.283); ctx.stroke();
          return b.pop < 0.8;
        });
        if (embers.length < (big ? 30 : 12) && Math.random() < 0.5) embers.push({ x: Math.random(), y: 1.02, v: 0.001 + Math.random() * 0.0025, w: Math.random() * 6.28, r: 0.002 + Math.random() * 0.003 });
        ctx.globalCompositeOperation = 'lighter';
        embers = embers.filter(function (e) { e.y -= e.v; e.w += 0.05; var X = (e.x + Math.sin(e.w) * 0.01) * W, Y = e.y * W, a = Math.max(0, Math.min(1, e.y * 1.4)) * (0.6 + 0.4 * Math.sin(e.w * 3)); ctx.fillStyle = 'rgba(255,' + (150 + Math.round(80 * Math.sin(e.w))) + ',60,' + a.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(X, Y, e.r * W, 0, 6.283); ctx.fill(); return e.y > -0.02; });
        ctx.restore();
      }
      var ms = performance.now() - s0; if (V) { V.drawMs.push(ms); if (V.drawMs.length > 120) V.drawMs.shift(); }
    }
    function loop(now) {
      raf = 0; if (!on) return;
      frames++; if (now - fpsAt >= 1000) { if (V) { V.fps.push(Math.round(frames * 1000 / (now - fpsAt))); if (V.fps.length > 30) V.fps.shift(); } frames = 0; fpsAt = now; }
      if (!document.hidden) frame(now);
      raf = window.requestAnimationFrame(loop);
    }
    setTimeout(function () { resize(); if (calm) frame(performance.now()); else raf = window.requestAnimationFrame(loop); }, 0);
    return { stop: function () { on = false; if (raf) window.cancelAnimationFrame(raf); }, resize: resize, frame: frame, bench: function (n) { var a = performance.now(); for (var i = 0; i < n; i++) frame(a + i * 16); return (performance.now() - a) / n; } };
  }

  /* ---------- sound: the class screen only ---------- */
  var AC = null, sndAt = {};
  function audio(make) { try { if (!AC && make) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC && AC.state === 'suspended') AC.resume(); } catch (e) { } return AC; }
  function snd(k) {
    if (A.MODE !== 'screen' || !V || !V.o || V.o.mute || !audio(false) || AC.state !== 'running') return;
    var now = Date.now(); if (sndAt[k] && now - sndAt[k] < (k === 'sizzle' ? 110 : 60)) return; sndAt[k] = now;
    try {
      var t = AC.currentTime;
      if (k === 'sizzle') {
        var du = 0.7 + Math.random() * 0.3, bf = AC.createBuffer(1, Math.floor(AC.sampleRate * du), AC.sampleRate), d = bf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.08 ? 1 : 0.35);
        var src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); src.buffer = bf; f.type = 'highpass'; f.frequency.value = 2800 + Math.random() * 1500;
        g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.04); g.gain.exponentialRampToValueAtTime(0.001, t + du);
        src.connect(f); f.connect(g); g.connect(AC.destination); src.start(t);
      }
      if (k === 'bloop' || k === 'pop') {
        var o = AC.createOscillator(), g2 = AC.createGain(), f0 = k === 'pop' ? 260 + Math.random() * 200 : 180;
        o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * (k === 'pop' ? 2.6 : 3.2), t + 0.09);
        g2.gain.setValueAtTime(k === 'pop' ? 0.05 : 0.14, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.14); o.connect(g2); g2.connect(AC.destination); o.start(t); o.stop(t + 0.15);
      }
      if (k === 'stone') { var o3 = AC.createOscillator(), g3 = AC.createGain(); o3.type = 'triangle'; o3.frequency.setValueAtTime(140, t); o3.frequency.exponentialRampToValueAtTime(70, t + 0.12); g3.gain.setValueAtTime(0.12, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.15); o3.connect(g3); g3.connect(AC.destination); o3.start(t); o3.stop(t + 0.16); }
    } catch (e) { }
  }

  /* ---------- avatars ---------- */
  function avFor(i) {
    var a = V.av[i]; if (a) return a;
    var e = H('div', 'lavaa', '<div class="lavaw"><div class="lavaav"></div><i class="lavadrip d1"></i><i class="lavadrip d2"></i><i class="lavadrip d3"></i></div><i class="lavapud"></i><i class="lavasteam s1"></i><i class="lavasteam s2"></i><i class="lavasteam s3"></i><span class="lavan"></span><i class="lavab"></i>');
    a = V.av[i] = { el: e, x: (Math.random() * 2 - 1) * V.G, y: (Math.random() * 2 - 1) * V.G, look: null, next: 0, at: null };
    e.style.left = px(a.x) + '%'; e.style.top = py(a.y) + '%'; e.style.zIndex = 100 + Math.round(py(a.y));
    V.lay.appendChild(e);
    return a;
  }
  function dress(a, look, name) {
    if (a.look !== look) { a.look = look; a.el.querySelector('.lavaav').innerHTML = avSvg(look, 64); }
    if (a.n !== name) { a.n = name; a.el.querySelector('.lavan').textContent = name; }
  }
  function moveTo(a, x, y, ms, ease) {
    a.x = x; a.y = y;
    a.el.style.transition = 'left ' + ms + 'ms ' + ease + ',top ' + ms + 'ms ' + ease + ',opacity .6s';
    a.el.style.left = px(x) + '%'; a.el.style.top = py(y) + '%'; a.el.style.zIndex = 100 + Math.round(py(y));
    a.el.classList.add('mv'); clearTimeout(a.wt); a.wt = setTimeout(function () { a.el.classList.remove('mv'); }, ms);
  }
  // nobody stands still until they have chosen a point (and the melted don't wander)
  function mill() {
    if (!V || !V.o || V.o.state === 7) return;
    var now = Date.now();
    Object.keys(V.av).forEach(function (k) {
      var a = V.av[k]; if (!a.mill || a.melt || now < a.next) return;
      var ms = 2400 + Math.random() * 1600;
      moveTo(a, Math.max(-V.G, Math.min(V.G, a.x + (Math.random() * 2 - 1) * V.G * 0.6)), Math.max(-V.G, Math.min(V.G, a.y + (Math.random() * 2 - 1) * V.G * 0.6)), ms, 'linear');
      a.next = now + ms + Math.random() * 900;
    });
  }
  function mineSlot(o) {   // a student's own avatar: where they tapped (this round), the console's result once it is shown
    var s0 = me(o), p = myPick();
    return { i: s0 ? s0.i : -1, x: asking(o.state) || !s0 ? (p ? qnum(p.x) : null) : s0.x, y: asking(o.state) || !s0 ? (p ? qnum(p.y) : null) : s0.y, res: s0 ? s0.res : 0, ghost: s0 ? s0.ghost : 0, out: s0 ? s0.out : 0 };
  }
  function avList(o) {
    if (screenish()) return o.sl.map(function (s) { var r = V.ros[s.i]; return { k: s.i, s: s, look: r ? r.look : (AV ? AV.defLook('slot' + s.i) : ''), n: r ? r.n : '' }; });
    return [{ k: 'me', s: mineSlot(o), look: myLook(), n: 'You', me: true }];
  }
  function updAv() {
    var o = V.o; if (!o || o.state === 7) return;
    var list = avList(o), per = {};
    list.forEach(function (x) { if (x.s.x != null) { var kk = x.s.x + ',' + x.s.y; (per[kk] = per[kk] || []).push(x.k); } });
    list.forEach(function (x) {
      var s = x.s, a = avFor(x.k); dress(a, x.look, x.n);
      a.el.hidden = !!x.me && s.x == null;
      if (s.x != null) {
        var grp = per[s.x + ',' + s.y], n = grp.length, k = grp.indexOf(x.k), step = n > 1 ? Math.min(0.3, 0.6 / (n - 1)) : 0, tx = s.x + (k - (n - 1) / 2) * step, ty = s.y, kk = s.x + ',' + s.y;
        a.mill = false;
        if (a.at !== kk || Math.abs(a.x - tx) > 0.01 || Math.abs(a.y - ty) > 0.01) { if (!a.melt) moveTo(a, tx, ty, a.at == null && !x.me ? 1300 : 1100, 'ease-in-out'); a.at = kk; }
        a.el.querySelector('.lavab').textContent = o.state === 3 && s.res === 2 ? '★' : !shown(o.state) && n > 1 && k === n - 1 ? '×' + n : '';
      } else { a.mill = !a.melt; a.at = null; a.el.querySelector('.lavab').textContent = ''; }
      a.el.classList.toggle('me', !!x.me);
      a.el.classList.toggle('ghost', !!s.ghost && !a.melt);
    });
    fit();
  }
  // the reveal: stones rise (or the region cools), then the ones on lava melt one after another and the safe ones cheer
  function reveal(o) {
    var list = avList(o), k = 0, calm = reduced();
    if (o.state === 3) later(function () { snd('stone'); }, 150);
    list.forEach(function (x) {
      var a = V.av[x.k]; if (!a) return;
      var s = x.s, safe = (s.res === 1 || s.res === 2 || s.res === 4) && !s.out;
      if (safe) { later(function () { a.el.classList.add('cheer'); }, calm ? 0 : 900); return; }
      if (s.ghost && !s.out && o.state === 6 && !s.res) return;   // a ghost who stood nowhere just floats on
      var d = (calm ? 0 : 1100) + Math.min(k++, 18) * 160;
      later(function () { meltAv(a); snd('sizzle'); }, d);
    });
  }
  function meltAv(a) {
    a.melt = 1; a.mill = false; a.el.classList.remove('cheer', 'ghost', 'melted'); a.el.classList.add('melt');
    clearTimeout(a.mt); a.mt = setTimeout(function () { if (!V) return; a.el.classList.remove('melt'); a.el.classList.add('melted'); }, reduced() ? 600 : 2600);
  }
  // a screen that arrives at a reveal (a reload, a late join) shows the result without replaying it
  function settle(o) {
    avList(o).forEach(function (x) { var a = avFor(x.k), s = x.s, safe = (s.res === 1 || s.res === 2 || s.res === 4) && !s.out; a.melt = safe ? 0 : 1; a.el.classList.toggle('melted', !safe); a.el.classList.toggle('cheer', safe); });
  }
  function unmelt() { Object.keys(V.av).forEach(function (k) { var a = V.av[k]; a.melt = 0; clearTimeout(a.mt); a.el.classList.remove('melt', 'melted', 'cheer'); }); }

  /* ---------- words on every screen ---------- */
  function voice(t) { return '<div class="lavavoice"><i>THE VOICE</i><p>' + t + '</p></div>'; }
  function taskCard(L) {
    var lines = taskLines(L), h;
    if (L.form === 4) { var pts = L.xs.map(function (c) { return givenPt(L, c); }); h = '<table class="lavatbl"><tr><th>x</th>' + pts.map(function (p) { return '<td>' + fq(p[0]) + '</td>'; }).join('') + '</tr><tr><th>y</th>' + pts.map(function (p) { return '<td>' + fq(p[1]) + '</td>'; }).join('') + '</tr></table>'; }
    else if (lines.length === 1) h = '<b class="lavaeq">' + esc(lines[0]) + '</b>';
    else h = lines.map(function (t) { return '<span>' + esc(t).replace(/(\([^)]*\)|−?[\d½⅓⅔¼¾/]+)/g, '<b>$1</b>') + '</span>'; }).join('');
    return '<div class="lavatask">' + h + '</div>';
  }
  var ASK = ['Stand on this line.', 'Stand on this line.', 'Stand on this line.', 'Stand on the line this describes.', 'This table is from a line. Stand on it.', 'A line goes through these two points. Stand on it.', 'Stand on the line with this slope, through this point.', 'Stand on this line.'];
  function rulesList(o, upTo) { return '<ol class="lavarules">' + o.cons.slice(0, upTo).map(function (C, k) { return '<li class="' + (k === o.cons.length - 1 ? 'new' : '') + '"><b>' + esc(conTxt(C)) + '</b><small>' + (strict(C) ? 'dashed' : 'solid') + '</small></li>'; }).join('') + '</ol>'; }
  function board(o, n) {
    var L = o.sl.slice().sort(function (a, b) { return b.sc - a.sc || a.i - b.i; }).slice(0, n), fin = o.state === 7;
    return '<ol class="lavalb">' + L.map(function (s) { return '<li' + (mySlot() === s.i ? ' class="me"' : '') + '><span>' + esc(nameOfSlot(s.i)) + (fin ? (o.flag && !s.ghost ? ' 🏅' : '') : s.ghost ? ' 👻' : '') + '</span><b>' + s.sc + '</b></li>'; }).join('') + '</ol>';
  }
  function podium(o) { var L = (o.flag ? alive(o) : o.sl.slice()).sort(function (a, b) { return b.sc - a.sc || a.i - b.i; }); return o.flag ? L : L.slice(0, 3); }
  function scoreTable(o) {
    return '<table class="lavascore"><tr><td>Safe (on the line, or inside the rules)</td><td><b>100</b></td></tr>' +
      (o.speed ? '<tr><td>Speed, safe answers only</td><td><b>up to +50</b></td></tr>' : '') +
      (o.uniq ? '<tr><td>A safe point nobody else chose</td><td><b>+25</b></td></tr>' : '') +
      (o.mult ? '<tr><td>A negative coordinate</td><td><b>×1.5</b></td></tr><tr><td>A fraction, like (1, 2½)</td><td><b>×2</b></td></tr><tr><td>Both</td><td><b>×3</b></td></tr>' : '') +
      '<tr class="bad"><td>Lava, or nowhere</td><td><b>0</b></td></tr></table>';
  }
  function phase(o) {
    return o.state === 1 ? 'THE FLOOR' : o.state === 2 || o.state === 3 ? 'LINE ' + (o.L ? o.L.no : o.g) + ' OF ' + o.nLine : o.state === 4 ? 'THE RULES' : o.state === 5 || o.state === 6 ? 'RULE ' + o.nc + (o.maxCons ? ' OF ' + o.maxCons : '') : 'RESULTS';
  }
  function drawTop() {
    var o = V && V.o; if (!o || !rootEl) return;
    var ph = rootEl.querySelector('.lavaph'), ck = rootEl.querySelector('.lavaclock'), t = left(o), txt = '';
    if (o.pause) txt = '⏸ ' + clock(t);
    else if (asking(o.state)) txt = t > 0 ? clock(t) : 'Counting…';
    else if (o.state === 1) txt = t > 0 ? clock(t) : '';
    if (ph.textContent !== phase(o)) ph.textContent = phase(o);
    if (ck.textContent !== txt) ck.textContent = txt;
    ck.className = 'lavaclock' + (asking(o.state) && !o.pause && t <= 5 ? ' low' : '');
    if (!screenish() && asking(o.state)) { var open2 = (o.pause || t > 0) && !ST.lock; if (V.canTap !== open2) { V.canTap = open2; V.svg.classList.toggle('lock', !open2); V.infoSig = ''; updInfo(); } }
  }
  function draw() {
    var o = V.o; if (!rootEl) return;
    var fin = o.state === 7;
    rootEl.querySelector('.lavabodyw').hidden = fin; V.fin.hidden = !fin;
    var R = rootEl.querySelector('.lavaright'); R.innerHTML = '';
    if (V.watch) { var xb = el('button', { type: 'button', 'class': 'btn lavaback', text: '✕ Back to the console' }); xb.onclick = function () { close(); }; R.appendChild(xb); }
    else R.appendChild(H('span', 'lavascore2'));
    if (A.MODE === 'screen' && (!AC || AC.state !== 'running') && !o.mute) { var sb = el('button', { type: 'button', 'class': 'lavasnd', text: '🔈 Click for sound' }); sb.onclick = function () { audio(true); setTimeout(draw, 200); }; R.appendChild(sb); }
    if (fin) { drawFin(o); return; }
    if (asking(o.state) || o.state === 1 || o.state === 4) unmelt();
    V.canTap = null;
    V.svg.innerHTML = floorSvg(o);
    var h = '';
    if (o.state === 1) h = voice('The floor is lava. Stand on the line.') + '<p class="lavanote">Tap a point on your own screen, or type one. Your avatar walks there.</p>' + scoreTable(o);
    else if (o.state === 2) h = voice('Line ' + o.L.no + '. ' + ASK[o.L.form]) + taskCard(o.L) + '<p class="lavanote">Only points on the line are safe.</p>';
    else if (o.state === 3) h = voice('The line has cooled. Everything else is still lava.') + taskCard(o.L) + '<p class="lavawork">' + esc(workLine(o.L)) + '</p>';
    else if (o.state === 4) h = voice(o.ineq === 2 ? 'New floor. Rules will be added one at a time. Stand where every rule is true. Anyone on lava is out, and comes back as a ghost.' : 'New floor. Rules will be added one at a time. Stand where every rule is true.') + '<p class="lavanote"><b>Solid line:</b> points on it are safe.<br><b>Dashed line:</b> points on it are lava.</p>' + (o.ineq === 2 && o.dup ? '<p class="lavanote">From rule ' + DUP_FROM + ': two survivors on one point are both out.</p>' : '');
    else if (o.state === 5) h = voice('Rule ' + o.nc + '. Stand where every rule is true.') + rulesList(o, o.nc) + (o.ineq === 2 && o.dup && o.nc >= DUP_FROM ? '<p class="lavanote warn">Two survivors on one point are both out.</p>' : '');
    else if (o.state === 6) h = voice(o.ineq !== 2 ? 'The safe ground has cooled.' : o.flag ? 'Everyone still in was on lava. Nobody is out this time.' : o.sl.some(function (s) { return s.out; }) ? plural(o.sl.filter(function (s) { return s.out; }).length, 'student') + ' melted. They come back as ghosts.' : 'Nobody melted.') + rulesList(o, o.nc) + '<p class="lavawork">' + esc(conWork(o.cons, o.G)) + '</p>' + (o.ineq === 2 && o.dup && o.nc === DUP_FROM - 1 ? '<p class="lavanote warn">From the next rule: two survivors on one point are both out.</p>' : '');
    V.side.innerHTML = h;
    V.infoSig = ''; updInfo(); fit();
  }
  function movers(o) { return o.sl.filter(function (s) { return s.rs > 0; }).sort(function (a, b) { return b.rs - a.rs || a.i - b.i; }).slice(0, 5); }
  function updInfo() {
    var o = V.o; if (!o || o.state === 7 || !rootEl) return;
    var h = '', sc = rootEl.querySelector('.lavascore2');
    if (screenish()) {
      var n = o.sl.length, st = o.sl.filter(function (s) { return s.x != null; }).length, al = alive(o);
      if (sc) sc.textContent = o.state >= 5 && o.ineq === 2 ? al.length + ' still in' : n + ' on the floor';
      if (o.state === 1 || o.state === 4) h = '<p class="lavabig"><b>' + n + '</b> on the floor</p>';
      else if (asking(o.state)) h = '<p class="lavabig"><b>' + st + '</b> of ' + n + ' standing</p>' + (o.state === 5 && o.ineq === 2 && n > al.length ? '<p class="lavanote">👻 Ghosts still score for a safe point.</p>' : '');
      else {
        var safe = o.sl.filter(function (s) { return (s.res === 1 || s.res === 2 || s.res === 4) && !s.out; }), un = o.sl.filter(function (s) { return s.res === 2 && !s.out; }), melted = o.sl.filter(function (s) { return !((s.res === 1 || s.res === 2 || s.res === 4) && !s.out); });
        h = '<p class="lavabig"><b>' + safe.length + '</b> safe · <b>' + melted.length + '</b> melted</p>' + (un.length ? '<p class="lavanames gold">★ Alone on a point: ' + un.map(function (s) { return esc(nameOfSlot(s.i)); }).join(', ') + '</p>' : '');
        if (o.state === 6 && o.ineq === 2) { var out = o.sl.filter(function (s) { return s.out; }); h += (out.length ? '<p class="lavanames">Out: ' + out.map(function (s) { return esc(nameOfSlot(s.i)) + (s.res === 1 || s.res === 2 ? ' (shared a point)' : s.res === 0 ? ' (stood nowhere)' : ''); }).join(', ') + '</p>' : '') + (al.length <= 8 ? '<p class="lavanames gold">Still in: ' + al.map(function (s) { return esc(nameOfSlot(s.i)); }).join(', ') + '</p>' : '<p class="lavanames">' + al.length + ' still in</p>'); }
        var mv = movers(o);
        if (mv.length) h += '<h4>Top movers</h4><ol class="lavalb">' + mv.map(function (s) { return '<li><span>' + esc(nameOfSlot(s.i)) + '</span><b>+' + s.rs + '</b></li>'; }).join('') + '</ol>';
        h += '<h4>Top 5</h4>' + board(o, 5);
      }
    } else h = studentInfo(o, sc);
    if (h !== V.infoSig) { V.infoSig = h; V.info.innerHTML = h; bindInfo(o); if (!screenish() && (asking(o.state) || shown(o.state))) V.svg.innerHTML = floorSvg(o); }
  }

  /* ---------- a student's own screen ---------- */
  function studentInfo(o, sc) {
    var s = me(o), p = myPick(), where = p ? ptq(p.x, p.y) : '', h = '';
    if (sc) sc.textContent = s ? plural(s.sc, 'point') + (s.ghost ? ' 👻' : '') : '';
    if (o.state === 1) return '<p class="lavabig">Get ready.</p><p class="lavanote">When a line appears, tap a safe point on the grid, or type one below it.</p>' + scoreTable(o);
    if (o.state === 4) return '<p class="lavabig">' + (o.ineq === 2 ? 'Everyone starts in.' : 'Every safe point scores.') + '</p>';
    if (asking(o.state)) {
      var ghost = s ? s.ghost : o.state >= 5 && o.ineq === 2, sc2 = myScaf(o);
      if (V.canTap === false) return '<p class="lavabig">Time is up. Counting.</p>' + (ST.s === 2 ? '' : where ? '<p class="lavanote">You stood on ' + where + '.</p>' : '<p class="lavanote">You did not stand anywhere.</p>');
      if (ST.prevScaf && !sc2 && o.scafMode === 1) h += '<p class="lavanote good">You\'re back on your own. Go.</p>';
      if (sc2 && ST.s !== 1) h += scafBox(o);
      if (ST.s === 2) return h + '<p class="lavanote">Wait for the reveal.</p>';
      h += where ? '<p class="lavabig">You are standing on <b>' + where + '</b>.</p><p class="lavanote">Tap another point to move.</p>' : '<p class="lavabig">Tap a safe point.</p>';
      h += '<div class="lavatype"><span>Or type a point:</span><span class="lavatp">(<input class="lavax" inputmode="text" autocomplete="off" aria-label="x" placeholder="x">,<input class="lavay" inputmode="text" autocomplete="off" aria-label="y" placeholder="y">)</span><button type="button" class="btn small lavago">Stand here</button><small>Fractions work: 1.5, 1/2, −3/2, 2 1/2</small><em class="lavaerr"></em></div>';
      if (o.mult && !sc2 && ST.hist.length >= 2 && ST.hist.slice(-2).join('') === 'yy' && !ST.lastMult) h += '<p class="lavanote nudge">Try a negative or a fraction for a multiplier.</p>';
      if (o.state === 5 && ghost) h += '<p class="lavanote">👻 You are a ghost. A safe point still scores.</p>';
      return h;
    }
    if (!s) return '<p class="lavanote">Finding your place on the floor…</p>';
    var safe = (s.res === 1 || s.res === 2 || s.res === 4) && !s.out;
    var pt = points({ speed: o.speed, uniq: o.uniq, mult: o.mult }, s.res, p, ST.t, o.len, maxS(o)), bd = ST.g === o.g && pt.total === s.rs && !s.out ? breakdown(pt) : String(s.rs);
    if (s.res === 4 && !s.out) bd = 'Safe ' + s.rs;
    V.bd = bd;
    if (safe) h = '<p class="lavabig good">' + (where ? where + ' is safe.' : 'Safe.') + '</p><p class="lavabd">' + esc(bd) + (s.rs ? '' : ' points') + '</p>';
    else if (s.out && (s.res === 1 || s.res === 2)) h = '<p class="lavabig bad">' + where + ' was safe, but another survivor stood there. Both melted.</p>';
    else if (ST.s === 2) h = '<p class="lavabig bad">That answer was not right. You melted.</p><p class="lavawork">' + esc(ST.work || '') + '</p>';
    else if (s.res === 3) h = '<p class="lavabig bad">' + (where || 'That point') + ' is lava. You melted.</p>';
    else h = '<p class="lavabig bad">' + (p ? 'Your tap arrived after time was up, so you melted.' : 'You did not stand anywhere. You melted.') + '</p>';
    if (o.state === 6 && o.ineq === 2) h += s.out ? '<p class="lavanote">👻 You are a ghost now. A safe point still scores.</p>' : o.flag && !s.ghost && !safe ? '<p class="lavanote">Everyone still in was on lava, so you stay in.</p>' : s.ghost ? '' : '<p class="lavanote">You are still in.</p>';
    return h;
  }
  // the hint step: only on this student's screen, never on the class screen
  function scafBox(o) {
    var seed = (A.S.me ? A.S.me.sid : 'me') + ':' + o.g;
    if (o.state === 2) { var sc = scafLine(o.L, o.G, seed); V.scaf = sc; return '<div class="lavascaf"><p class="lavabig">' + esc(sc.ask) + '</p>' + (sc.step ? '<p class="lavanote">' + esc(sc.step) + '</p>' : '') + '<div class="row"><input class="lavasa" inputmode="text" autocomplete="off" aria-label="Your answer" placeholder="' + (o.L.B ? 'y' : 'x') + ' ="><button type="button" class="btn small primary lavasgo">Check</button></div><em class="lavaerr"></em></div>'; }
    var si = scafIneq(o.cons, o.G, seed); V.scaf = si;
    return '<div class="lavascaf"><p class="lavabig">' + esc(si.ask) + '</p><p class="lavanote">' + esc(si.check) + (si.earlier ? ' (It already follows the earlier rules.)' : '') + '</p><div class="row"><button type="button" class="btn small primary lavayes">Yes, safe</button><button type="button" class="btn small lavano">No, lava</button></div></div>';
  }
  function bindInfo(o) {
    if (screenish()) return;
    var go = V.info.querySelector('.lavago');
    if (go) {
      var ix = V.info.querySelector('.lavax'), iy = V.info.querySelector('.lavay'), er = V.info.querySelector('.lavaerr');
      var f = function () {
        var x = parseNum(ix.value), y = parseNum(iy.value);
        if (!x || !y) { er.textContent = 'Type x and y, like 2, −3, 1.5 or −3/2.'; return; }
        if (!qabsLe2(x, o.G) || !qabsLe2(y, o.G)) { er.textContent = 'That point is off the floor (−' + o.G + ' to ' + o.G + ').'; return; }
        tap(x, y);
      };
      go.onclick = f; iy.onkeydown = ix.onkeydown = function (e) { if (e.key === 'Enter') f(); };
    }
    var sg = V.info.querySelector('.lavasgo');
    if (sg) { var ia = V.info.querySelector('.lavasa'), e2 = V.info.querySelector('.lavaerr'); var g2 = function () { var v = parseNum(ia.value); if (!v) { e2.textContent = 'Type a number.'; return; } scafAnswer(qeq(v, V.scaf.ans)); }; sg.onclick = g2; ia.onkeydown = function (e) { if (e.key === 'Enter') g2(); }; }
    var yb = V.info.querySelector('.lavayes'), nb = V.info.querySelector('.lavano');
    if (yb) { yb.onclick = function () { scafAnswer(V.scaf.safe === true); }; nb.onclick = function () { scafAnswer(V.scaf.safe === false); }; }
  }
  function qabsLe2(a, G) { return Math.abs(a[0]) <= G * a[1]; }
  function scafAnswer(right) {
    var o = V && V.o, sc = V.scaf; if (!o || !asking(o.state) || V.canTap === false || !sc) return;
    if (right) { var x = o.state === 2 ? sc.x : sc.ax, y = o.state === 2 ? sc.y : sc.ay; ST.x = Q(x); ST.y = Q(y); ST.s = 1; ST.t = -1; }
    else { ST.x = null; ST.y = null; ST.s = 2; ST.lock = 1; ST.work = sc.work; }
    keep(); V.infoSig = ''; updAv(); updInfo(); send();
  }

  function drawFin(o) {
    var P = podium(o), top = P.slice(0, 3), h = '';
    h += '<div class="lavafinL">' + voice('The floor has cooled. Everyone may step off.') + '<h2>' + (o.flag ? (P.length === 1 ? 'LAST ONE STANDING' : 'STILL STANDING') : 'TOP OF THE FLOOR') + '</h2><div class="lavapod">' +
      [1, 0, 2].filter(function (k) { return top[k]; }).map(function (k) { var s = top[k], r = V.ros[s.i]; return '<div class="lavastep s' + k + '">' + avSvg(r ? r.look : '', 110) + '<b>' + esc(nameOfSlot(s.i)) + '</b><i>' + plural(s.sc, 'point') + '</i><span>' + (k + 1) + '</span></div>'; }).join('') + '</div>' +
      (P.length > 3 ? '<p class="lavanames gold">Also still standing: ' + P.slice(3).map(function (s) { return esc(nameOfSlot(s.i)); }).join(', ') + '</p>' : '') + '</div>';
    var s0 = me(o), rank = s0 ? o.sl.filter(function (x) { return x.sc > s0.sc; }).length + 1 : 0;
    h += '<div class="lavafinR">' + (s0 ? '<p class="lavabig">You: <b>' + plural(s0.sc, 'point') + '</b>, place ' + rank + ' of ' + o.sl.length + '.</p>' : '') + '<h4>Everyone, by points</h4>' + board(o, 60) + '</div>';
    V.fin.innerHTML = h;
    if (!V.conf) { V.conf = 1; try { A.confetti(); } catch (e) { } }
  }

  /* ---------- a student's turn ---------- */
  var sendT = null;
  function tap(x, y) {
    var o = V && V.o; if (!o || A.MODE !== 'student' || !asking(o.state) || V.canTap === false || ST.lock) return;
    ST.g = o.g; ST.x = x; ST.y = y; ST.s = 0;
    ST.t = Math.max(0, Date.now() - ST.shownAt - ST.pausedMs - (V.pauseAt ? Date.now() - V.pauseAt : 0));
    keep(); V.infoSig = ''; updAv(); updInfo();
    clearTimeout(sendT); sendT = setTimeout(send, left(o) < 4 ? 0 : 350);
  }
  function send() {
    clearTimeout(sendT); if (A.MODE !== 'student' || !V) return;
    var S2 = ST.sum;
    A.record({ id: QID, k: 'open' }, 't2;id:' + Math.round(V.id / 1000) + ';g:' + ST.g + ';x:' + encQ(ST.x) + ';y:' + encQ(ST.y) + ';t:' + Math.round(ST.t) + ';s:' + (ST.s || 0) + ';r:' + S2.r + ';o:' + S2.o + ';n:' + S2.n + ';h:' + S2.h + ';e:' + S2.e + ';f:' + S2.f, null);
  }

  /* ===================== the console: the referee ===================== */
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
  function picksOf(K) { var out = {}; K.slots.forEach(function (s) { var p = K.pos[s]; out[s] = p && p.x ? { x: p.x, y: p.y } : null; }); return out; }
  function tal(K, sid) { return K.tal[sid] || (K.tal[sid] = { safe: 0, lava: 0, none: 0, hint: 0, out: 0, rs: 0 }); }
  function optOf(K) { return { speed: !!K.o.speed, uniq: !!K.o.uniq, mult: !!K.o.mult }; }
  function start(o) {
    o = o || settings();
    var who = active();
    if (!who.length) { SFA.toast('Nobody has joined yet: wait for students to join, then start.', 4000); return false; }
    var t = secs(), G = o.G === 10 ? 10 : 6;
    var custom = (o.custom || []).map(function (c) { return parseRule(c, G); }), bad = custom.filter(function (r) { return r.err; }).length;
    if (bad) SFA.toast(plural(bad, 'typed line') + ' left out: not enough safe points on this grid.', 4000);
    var lines = genLines(Math.floor(t / 1000) ^ Math.floor(Math.random() * 1e9), { n: o.rounds, G: G, forms: o.forms, order: o.order, cats: o.cats, custom: custom.filter(function (r) { return r.L; }).map(function (r) { return r.L; }) });
    var K = { v: 2, id: t, state: 1, g: 0, at: t, o: JSON.parse(JSON.stringify(o)), G: G, nLine: lines.length, slots: who.slice(0, MAXS), ghost: {}, pos: {}, res: {}, rs: {}, outNow: {}, sc: {}, rows: {}, tal: {}, scaf: {}, sc0: {}, scR: {}, lines: lines, li: -1, cons: [], er: 0, flag: 0, pausedAt: 0, cur: 0, lastPush: 0, lastSave: 0, hist: [], skips: 0, mute: false, firstRow: {} };
    K.o.len = Math.max(10, Math.min(60, Math.round(o.secs) || 25)); K.o.ncon = Math.max(1, Math.min(6, o.ncon | 0 || 6));
    if (K.o.scaf === 2) K.slots.forEach(function (s) { K.scaf[s] = true; });
    A.console_().stand = K; save(K);
    A.pushLive(); A.consolePanel();
    return true;
  }
  function newRound(K, st) { K.state = st; K.g++; K.at = secs(); K.pos = {}; K.res = {}; K.rs = {}; K.outNow = {}; K.flag = 0; if (K.o.scaf === 2) K.slots.forEach(function (s) { K.scaf[s] = true; }); }
  function nextLine(K) {
    K.li++;
    if (K.li >= K.nLine) { if (K.o.ineq) { K.state = 4; K.at = secs(); K.res = {}; K.pos = {}; K.rs = {}; K.outNow = {}; } else over(K); return; }
    newRound(K, 2);
  }
  function score(K, res) {
    var o = optOf(K), mx = LEAD + K.o.len + GRACE + 5;
    K.slots.forEach(function (s) {
      var p = K.pos[s], r = res[s] || 0;
      if (p && p.s === 1 && (r === 1 || r === 2)) r = 4;
      res[s] = r;
      var pt = K.outNow[s] ? { total: 0 } : points(o, r, p && p.x ? p : null, p ? p.t : -1, K.o.len, mx);
      K.rs[s] = pt.total; K.sc[s] = (K.sc[s] || 0) + pt.total;
      var T = tal(K, s); T.rs += pt.total;
      if ((r === 1 || r === 2 || r === 4) && !K.outNow[s]) T.safe++; else if (r === 3 || (p && p.s === 2) || K.outNow[s]) T.lava++; else T.none++;
      if (K.scaf[s]) T.hint++;
    });
    K.res = res;
  }
  // automatic hint step: two rounds on nothing turns it on; two right with it turns it off
  function autoScaf(K) {
    if (K.o.scaf !== 1) return;
    K.slots.forEach(function (s) {
      var got = (K.rs[s] || 0) > 0;
      if (K.scaf[s]) { K.scR[s] = got ? (K.scR[s] || 0) + 1 : 0; if (K.scR[s] >= 2) { K.scaf[s] = false; K.scR[s] = 0; K.sc0[s] = 0; } }
      else { K.sc0[s] = got ? 0 : (K.sc0[s] || 0) + 1; if (K.sc0[s] >= 2) { K.scaf[s] = true; K.sc0[s] = 0; K.scR[s] = 0; } }
    });
  }
  function resolveLine(K) {
    var L = K.lines[K.li], res = judgeLine(L, picksOf(K)), n = [0, 0, 0, 0, 0];
    K.outNow = {}; score(K, res);
    K.slots.forEach(function (s) { n[K.res[s]]++; });
    K.hist.push({ t: 'L', what: FORMS[L.form] + ': ' + eqTxt(L) + (L.src === 'own' ? ' (yours)' : ''), safe: n[1] + n[2] + n[4], uni: n[2], hint: n[4], lava: n[3], none: n[0] });
    autoScaf(K);
    K.state = 3; K.at = secs();
  }
  function conOpts(K, k) { var fs = K.o.iforms && K.o.iforms.length ? K.o.iforms : [0, 1, 2], sm = K.o.strict | 0; return { G: K.G, forms: fs, strict: sm === 0 ? null : sm === 2, kind: fs[k % fs.length], alt: sm === 0 ? (k + Math.round(K.id / 1000)) % 2 === 0 : null }; }
  function addCon(K) {
    var al = aliveSids(K).length, R = rng(K.id / 1000 + K.cons.length * 7919 + K.skips * 104729 + Math.floor(Math.random() * 1e6)), k = K.cons.length, o = conOpts(K, k);
    var elim = K.o.ineq === 2, room = elim && K.o.dup && k + 1 >= DUP_FROM && region(K.cons, K.G).length > al + 2, gentle = { G: K.G, forms: o.forms, strict: o.strict, gentle: true };
    var Cn = (room ? genCon(R, K.cons, al + 2, o) || genCon(R, K.cons, al + 2, gentle) : null) || genCon(R, K.cons, 4, elim && K.o.dup && k + 1 >= DUP_FROM && !room ? gentle : o);
    if (!Cn) { over(K); return; }
    K.cons.push(Cn); newRound(K, 5);
  }
  function resolveRule(K) {
    var al = aliveSids(K), elim = K.o.ineq === 2, picks = picksOf(K), r, res;
    if (elim) { r = resolveElim(K.cons, al, picks, K.o.dup && K.cons.length >= DUP_FROM); res = r.res; K.flag = r.spared ? 1 : 0; K.outNow = {}; r.out.forEach(function (s) { K.outNow[s] = 1; }); }
    else { res = judgeRegion(K.cons, picks); K.outNow = {}; K.flag = 0; }
    score(K, res);
    if (elim) r.out.forEach(function (s) { K.ghost[s] = 1; tal(K, s).out = K.cons.length; });
    K.er++;
    var safe = K.slots.filter(function (s) { return (K.res[s] === 1 || K.res[s] === 2 || K.res[s] === 4) && !K.outNow[s]; }).length;
    K.hist.push({ t: 'E', what: 'rule ' + K.cons.length + ': ' + conTxt(K.cons[K.cons.length - 1]), out: elim ? r.out.length : 0, spared: elim && r.spared, left: aliveSids(K).length, safe: safe, elim: elim });
    autoScaf(K);
    K.done = (elim && aliveSids(K).length <= 3) || K.cons.length >= K.o.ncon;
    K.state = 6; K.at = secs();
  }
  function over(K) {
    K = K || C(); if (!K || K.state === 7) return;
    K.pausedAt = 0; K.state = 7; K.flag = K.o.ineq === 2 && K.er > 0 ? 1 : 0; K.at = K.endedAt = secs(); K.outNow = {};
  }
  function advance(K) {
    if (K.state === 1 || K.state === 3) nextLine(K);
    else if (K.state === 2) resolveLine(K);
    else if (K.state === 4) addCon(K);
    else if (K.state === 5) resolveRule(K);
    else if (K.state === 6) { if (K.done) over(K); else addCon(K); }
  }
  function skip(K) {
    if (K.state === 7) return;
    K.pausedAt = 0;
    if (K.state === 2) { K.skips++; K.hist.push({ t: 'S', what: 'line ' + (K.li + 1) + ' skipped' }); nextLine(K); }
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
    var key2 = 't2;id:' + Math.round(K.id / 1000) + ';', last = {}, changed = false, ros = null;
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q === QID && String(a.answer).indexOf(key2) === 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    Object.keys(last).forEach(function (sid) {
      var m = String(last[sid].answer).match(/;g:(\d+);x:([^;]*);y:([^;]*);t:(-?\d+);s:(\d)/); if (!m) return;
      K.firstRow[sid] = 1;
      var x = decQ(m[2]), y = decQ(m[3]), row = { g: +m[1], x: x && y && qabsLe2(x, K.G) && qabsLe2(y, K.G) ? x : null, y: x && y && qabsLe2(x, K.G) && qabsLe2(y, K.G) ? y : null, t: +m[4], s: +m[5] };
      if (K.slots.indexOf(sid) < 0 && K.state !== 7 && K.slots.length < MAXS) {
        ros = ros || A.rosterIn();
        if (ros.some(function (r) { return r.sid === sid; })) { K.slots.push(sid); if (K.state >= 5 && K.o.ineq === 2) K.ghost[sid] = 1; if (K.o.scaf === 2) K.scaf[sid] = true; K.ents = null; changed = true; }
      }
      if (asking(K.state) && row.g === K.g && K.slots.indexOf(sid) >= 0) {
        var was = K.pos[sid], now = row.x || row.s === 2 ? row : null;
        if (JSON.stringify(was || null) !== JSON.stringify(now)) { if (now) K.pos[sid] = now; else delete K.pos[sid]; changed = true; }
      }
    });
    if (changed) { A.pushLive(); A.consolePanel(); }
  }
  function tick() {
    var K = C(); if (!K) return;
    var now = Date.now(), e = (now - K.at) / 1000;
    if (K.state === 7) { if (now - (K.endedAt || now) > 8 * 60000) { A.console_().stand = null; if (rootEl && V && V.watch) close(); (A.pushNow || A.pushLive)(); A.consolePanel(); return; } }
    else if (!K.pausedAt) {
      var lim = K.state === 1 ? LOBBY : asking(K.state) ? LEAD + K.o.len + GRACE : K.state === 3 ? REVEAL : K.state === 4 ? EINTRO : EREVEAL;
      if (e >= lim) { advance(K); go(K); }
    }
    if (now - K.lastPush >= PUSH_MS) { K.lastPush = now; (A.pushNow || A.pushLive)(); }
    if (now - (K.lastSave || 0) > 3000) { K.lastSave = now; save(K); }
    if (!K.noRowAt && now - K.id > 25000 && K.slots.some(function (s) { return !K.firstRow[s]; })) { K.noRowAt = now; A.consolePanel(); }   // the warning about pages with no game
    var ck = document.getElementById('lavacclock'); if (ck) ck.textContent = statusClock(K);
    if (rootEl && V && V.watch) apply(watchState());
  }
  function counts(out) {
    var K = C(); if (!K) return;
    var o = { state: K.state, len: K.o.len }, rem = K.pausedAt ? Math.max(0, Math.ceil(phaseLen(o) - (K.pausedAt - K.at) / 1000)) + 1 : 0;
    var ob = (K.o.speed ? 1 : 0) + (K.o.uniq ? 2 : 0) + (K.o.mult ? 4 : 0) + 8 * (K.o.scaf | 0) + (K.mute ? 32 : 0) + (K.o.dup ? 64 : 0);
    out.zvid = A.encRun(K.id); out.zvst = A.encRun(K.id + (A.console_().skew || 0));
    out.zvs = [K.state, K.g, K.nLine, K.o.len, Math.min(9999, Math.max(0, Math.round((K.at - K.id) / 1000))), K.slots.length, Math.min(9999, rem), K.flag || 0, K.cons.length, K.o.ineq | 0, K.G, ob];
    var L = K.lines[K.li];
    if (L && (K.state === 2 || K.state === 3)) out.zvq = encLine(L, K.li + 1);
    if (K.o.ineq && K.state >= 4 && K.state <= 6) { var cc = [K.o.ncon]; K.cons.forEach(function (c) { cc = cc.concat(encCon(c)); }); out.zvc0 = cc.slice(0, 12); if (cc.length > 12) out.zvc1 = cc.slice(12); }
    var sh = shown(K.state);
    K.slots.forEach(function (sid, i) {
      var p = K.pos[sid], f = (sh ? K.res[sid] || 0 : 0) + 5 * (K.ghost[sid] && !(sh && K.outNow[sid]) ? 1 : 0) + 10 * (sh && K.outNow[sid] ? 1 : 0);
      var kp = 'zvp' + Math.floor(i / 6); (out[kp] = out[kp] || []).push(posEnc(p && p.x, K.G) + 500 * f, posEnc(p && p.y, K.G));
      var kx = 'zvx' + Math.floor(i / 12); (out[kx] = out[kx] || []).push(Math.min(9999, K.sc[sid] || 0));
      var kr = 'zvr' + Math.floor(i / 12); (out[kr] = out[kr] || []).push((sh ? Math.min(999, K.rs[sid] || 0) : 0) + (K.scaf[sid] ? 1000 : 0));
    });
  }
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
    if (K.ents && Date.now() - (K.entsAt || 0) > 20000) K.ents = null;
    var E = entries(K), n = E.length, pick2 = [], c0 = n ? K.cur % n : 0, used = 0;
    for (var k = 0; k < n; k++) { var x = E[(c0 + k) % n]; if (used + x.length + 1 > 590) break; pick2.push(x); used += x.length + 1; }
    K.cur = n ? (c0 + pick2.length) % n : 0;
    return { q: 'zstand', text: ('P:' + pick2.join(',')).slice(0, 600) };
  }
  function restore(Lv) {
    var o = standOf(Lv), saved = SFA.store.get('teacher.stand.' + A.LID, null);
    if (!o || !saved || saved.v !== 2 || saved.id !== o.id || o.state === 7) { A.console_().stand = null; return false; }
    // fractions come back from storage as plain arrays, which is what they are
    saved.ents = null; saved.lastPush = 0; A.console_().stand = saved;
    return true;
  }
  function watchState() {
    var K = C(), out = {}; counts(out);
    var o = standOf({ lesson: A.LID, counts: out, spot: { q: 'zstand', text: 'P:' + entries(K).join(',') } });
    o.start = K.id; o.at = K.at; return o;
  }
  function watch() { var o = watchState(); open(o); V.watch = true; apply(o); draw(); }
  function statusClock(K) {
    var e = ((K.pausedAt || Date.now()) - K.at) / 1000, p = K.pausedAt ? '⏸ paused · ' : '';
    if (K.state === 1) return p + 'the scoring table is on screen · the first line in ' + clock(LOBBY - e);
    if (asking(K.state)) return p + (e < LEAD + K.o.len ? clock(LEAD + K.o.len - e) + ' left' : 'counting the last answers…');
    if (K.state === 3) return p + 'the stones are up · next in ' + clock(REVEAL - e);
    if (K.state === 4) return p + 'the rules are explained · first rule in ' + clock(EINTRO - e);
    if (K.state === 6) return p + 'the safe ground has cooled · ' + (K.done ? 'results' : 'next rule') + ' in ' + clock(EREVEAL - e);
    return 'the podium and the leaderboard are on every screen';
  }
  function section(p) {
    var K = C(), sec = H('div', 'sect lavacon'), al = aliveSids(K), L = K.lines[K.li];
    sec.appendChild(H('h3', '', '🌋 The Floor Is Lava · ' + (K.state === 1 ? 'Scoring' : K.state <= 3 ? 'Line ' + (K.li + 1) + ' of ' + K.nLine : K.state === 4 ? 'The rules' : K.state <= 6 ? 'Rule ' + K.cons.length + ' of ' + K.o.ncon : 'Results')));
    var what = (K.state === 2 || K.state === 3) && L ? '<b>' + esc(eqTxt(L)) + '</b> (as ' + FORMS[L.form].toLowerCase() + (L.src === 'own' ? ', your line' : '') + ') · ' : K.state === 5 || K.state === 6 ? '<b>' + K.cons.map(function (c) { return esc(conTxt(c)); }).join(' , ') + '</b> · ' + (K.o.ineq === 2 ? al.length + ' still in · ' : '') : '';
    sec.appendChild(H('p', '', what + '<span id="lavacclock">' + esc(statusClock(K)) + '</span> · ' + plural(K.slots.length, 'student')));
    var r = H('div', 'row'), btn = function (txt, title, fn, cls) { r.appendChild(el('button', { type: 'button', 'class': 'btn' + (cls ? ' ' + cls : ''), text: txt, title: title, onclick: fn })); };
    btn('👁 Show the floor', 'The class screen view on this screen', function () { watch(); }, 'primary');
    if (K.state !== 7) {
      btn(K.pausedAt ? '▶ Resume' : '⏸ Pause', 'Stops the clock on every screen', function () { pause(K); });
      if (asking(K.state)) btn('⏰ Time\'s up now', 'Close this round now and score what has arrived', function () { K.pausedAt = 0; advance(K); go(K); });
      btn(asking(K.state) ? '⏭ Skip round' : '⏭ Next', asking(K.state) ? 'Drop this round without scoring it' : 'Move on now', function () { skip(K); });
      btn('End it now', 'Straight to the podium and the leaderboard', function () { over(K); go(K); });
    }
    btn(K.mute ? '🔇 Sound off' : '🔊 Sound on', 'The sizzle and bubbles on the class screen', function () { K.mute = !K.mute; go(K); });
    btn('Back to the lesson', 'Close the game on every screen', function () { A.console_().stand = null; if (rootEl) close(); A.pushLive(); A.consolePanel(); }, 'primary');
    sec.appendChild(r);
    var chip = function (s) { var b = el('button', { type: 'button', 'class': 'lavachip' + (K.scaf[s] ? ' on' : ''), text: (K.scaf[s] ? '🪜 ' : '') + nameOf(s) + (K.ghost[s] && K.o.ineq === 2 ? ' 👻' : ''), title: (K.scaf[s] ? 'Switch the hint step off for ' : 'Switch the hint step on for ') + nameOf(s) + ' (only on their screen)' }); b.onclick = function () { K.scaf[s] = !K.scaf[s]; K.sc0[s] = 0; K.scR[s] = 0; go(K); }; return b; };
    if (asking(K.state)) {
      var wait = K.slots.filter(function (s) { return !K.pos[s]; });
      var wp = H('p', wait.length ? 'state' : 'muted', wait.length ? '<b>Not answered yet (' + wait.length + ' of ' + K.slots.length + '):</b> ' : 'Everyone has answered.');
      wait.forEach(function (s) { wp.appendChild(chip(s)); });
      sec.appendChild(wp);
      var noRow = K.slots.filter(function (s) { return !K.firstRow[s]; });
      if (noRow.length && Date.now() - K.id > 25000) sec.appendChild(H('p', 'muted', '⚠ No game on these screens yet: ' + noRow.map(function (s) { return esc(nameOf(s)); }).join(', ') + '. If it stays like this, ask them to reload the page.'));
    } else if (K.state === 3 || K.state === 6) {
      var h = K.hist[K.hist.length - 1] || {};
      sec.appendChild(H('p', 'muted', K.state === 3 ? '<b>' + h.safe + '</b> safe (' + h.uni + ' alone' + (h.hint ? ', ' + h.hint + ' with the hint step' : '') + ') · ' + h.lava + ' on lava · ' + h.none + ' no answer' : h.spared ? 'Everyone still in was on lava, so nobody was eliminated.' : h.elim ? '<b>' + h.out + '</b> eliminated · ' + h.left + ' still in' + (K.done ? ' · the podium is next' : '') : '<b>' + h.safe + '</b> safe'));
    }
    var on = K.slots.filter(function (s) { return K.scaf[s]; });
    if (K.o.scaf !== 2 && K.state !== 7) { var hp = H('p', 'muted', on.length ? '<b>Hint step on for:</b> ' : 'Hint step on for nobody. Tap a name above to switch it on for one student.'); on.forEach(function (s) { hp.appendChild(chip(s)); }); sec.appendChild(hp); }
    var dd = A.fold ? A.fold('g-stand', '📋 Details · scores, rounds', K.state === 7) : el('details', { 'class': 'sect fold' });
    var studs = K.slots.map(function (s) { return { sid: s, n: nameOf(s), sc: K.sc[s] || 0, T: tal(K, s), g: !!K.ghost[s] }; }).sort(function (a, b) { return b.sc - a.sc || a.n.localeCompare(b.n); });
    if (K.hist.length) dd.appendChild(H('p', 'muted', K.hist.map(function (h2) { return h2.t === 'L' ? esc(h2.what) + ': ' + h2.safe + ' safe (' + h2.uni + ' alone, ' + h2.hint + ' hint), ' + h2.lava + ' lava, ' + h2.none + ' no answer' : h2.t === 'E' ? esc(h2.what) + ': ' + (h2.elim ? (h2.spared ? 'all on lava, nobody out' : h2.out + ' out') + ', ' + h2.left + ' left' : h2.safe + ' safe') : esc(h2.what); }).join('<br>')));
    dd.appendChild(H('p', 'muted', '<b>Students:</b> ' + studs.map(function (s) { return (K.o.ineq === 2 && K.er ? (s.g ? '👻 ' : '🟢 ') : '') + esc(s.n) + ' ' + s.sc + ' (safe ' + s.T.safe + ', lava ' + s.T.lava + ', none ' + s.T.none + (s.T.hint ? ', ' + s.T.hint + ' with the hint step' : '') + (s.T.out ? ', out at rule ' + s.T.out : '') + ')'; }).join(' · ')));
    var cp = el('button', { type: 'button', 'class': 'btn small', text: '📋 Copy results' });
    cp.onclick = function () {
      var lines = ['Name\tPoints\tSafe\tLava\tNo answer\tWith the hint step\tOut at rule'].concat(studs.map(function (s) { return [s.n, s.sc, s.T.safe, s.T.lava, s.T.none, s.T.hint, s.T.out || ''].join('\t'); }));
      try { navigator.clipboard.writeText(lines.join('\n')).then(function () { SFA.toast('Copied. Paste it into a spreadsheet.', 2500); }); } catch (x) { SFA.toast('Couldn\'t copy here.', 2500); }
    };
    dd.appendChild(cp); sec.appendChild(dd);
    p.appendChild(sec);
  }

  /* ---------- the setup panel in the games tray ---------- */
  function miniSvg(L, G) {
    var u = 120 / (2 * G), mx = function (x) { return 130 + u * x; }, my = function (y) { return 130 - u * y; }, s = '<svg class="lavamini" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(eqTxt(L)) + '"><rect x="2" y="2" width="256" height="256" rx="10" fill="#3a0d06"/>';
    for (var i = -G; i <= G; i++) s += '<line x1="' + mx(i) + '" y1="' + my(-G) + '" x2="' + mx(i) + '" y2="' + my(G) + '" stroke="#fff" stroke-opacity="' + (i ? '.12' : '.6') + '"/><line x1="' + mx(-G) + '" y1="' + my(i) + '" x2="' + mx(G) + '" y2="' + my(i) + '" stroke="#fff" stroke-opacity="' + (i ? '.12' : '.6') + '"/>';
    var B = G + 0.5, pts = [];
    var add = function (x, y) { if (Math.abs(x) <= B + 1e-9 && Math.abs(y) <= B + 1e-9) pts.push([x, y]); };
    if (L.B) { add(-B, (L.C + L.A * B) / L.B); add(B, (L.C - L.A * B) / L.B); } if (L.A) { add((L.C + L.B * B) / L.A, -B); add((L.C - L.B * B) / L.A, B); }
    if (pts.length >= 2) s += '<line x1="' + mx(pts[0][0]) + '" y1="' + my(pts[0][1]) + '" x2="' + mx(pts[pts.length - 1][0]) + '" y2="' + my(pts[pts.length - 1][1]) + '" stroke="#ffb347" stroke-width="3"/>';
    latticePts(L, G).forEach(function (p) { s += '<circle cx="' + mx(p[0]) + '" cy="' + my(p[1]) + '" r="' + (G === 10 ? 3.5 : 5) + '" fill="#bdb6ae" stroke="#222"/>'; });
    return s + '</svg>';
  }
  function setup(box, startBtn) {
    var o = settings(), sec = H('div', 'lavaset');
    var chk = function (lab, on, fn, title) { var l = el('label', { title: title || '' }), c = el('input', { type: 'checkbox' }); c.checked = !!on; c.onchange = function () { fn(c.checked); saveSettings(o); warn(); }; l.appendChild(c); l.appendChild(document.createTextNode(' ' + lab)); return l; };
    var sel = function (lab, opts, val, fn) { var s = el('select', { 'aria-label': lab }); opts.forEach(function (x) { var op = el('option', { value: String(x[0]), text: x[1] }); if (String(x[0]) === String(val)) op.selected = true; s.appendChild(op); }); s.onchange = function () { fn(+s.value); saveSettings(o); warn(); }; return s; };
    var grp = function (title) { var f = el('fieldset'); f.appendChild(el('legend', { text: title })); sec.appendChild(f); return f; };
    var tog = function (arr, v, on) { var i = arr.indexOf(v); if (on && i < 0) arr.push(v); if (!on && i >= 0) arr.splice(i, 1); };
    var f1 = grp('Line forms');
    RULES.forEach(function (i) { var n = FORMS[i]; f1.appendChild(chk(n + ' (' + FORM_EX[i] + ')', o.forms.indexOf(i) >= 0, function (on) { tog(o.forms, i, on); })); });
    f1.appendChild(sel('Order', [[2, 'Easiest first'], [1, 'In the order listed'], [0, 'Random']], o.order, function (v) { o.order = v; }));
    var f2 = grp('Slopes allowed');
    CATS.forEach(function (c) { f2.appendChild(chk(CAT_N[c], o.cats.indexOf(c) >= 0, function (on) { tog(o.cats, c, on); })); });
    var f3 = grp('Floor and rounds'), rw = H('div', 'row');
    rw.appendChild(sel('Grid', [[6, 'Grid −6 to 6'], [10, 'Grid −10 to 10']], o.G, function (v) { o.G = v; drawOwn(); }));
    rw.appendChild(sel('Line rounds', [3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { return [n, n + ' line rounds']; }), o.rounds, function (v) { o.rounds = v; }));
    rw.appendChild(sel('Round length', [10, 15, 20, 25, 30, 40, 50, 60].map(function (n) { return [n, n + ' s a round']; }), o.secs, function (v) { o.secs = v; }));
    f3.appendChild(rw);
    var f4 = grp('Type your own line'), inp = el('input', { type: 'text', placeholder: 'y = 2x − 1, 2x + 3y = 6, (1, 2) and (3, 6)…', 'aria-label': 'Type your own line' }), add = el('button', { type: 'button', 'class': 'btn small', text: 'Add' }), msg = H('div', 'lavaown');
    var r4 = H('div', 'row'); r4.appendChild(inp); r4.appendChild(add); f4.appendChild(r4); f4.appendChild(msg);
    var list = H('div', 'lavaownl'); f4.appendChild(list);
    function drawOwn() {
      list.innerHTML = '';
      o.custom.forEach(function (t, i) { var r = parseRule(t, o.G), row = H('div', 'lavaownr' + (r.err ? ' bad' : ''), '<span>' + (i + 1) + '. ' + esc(t) + (r.err ? ' · ' + esc(r.err) : ' · ' + esc(FORMS[r.L.form].toLowerCase()) + ', ' + r.n + ' safe points') + '</span>'); var x = el('button', { type: 'button', 'class': 'btn small', text: '✕', title: 'Remove' }); x.onclick = function () { o.custom.splice(i, 1); saveSettings(o); drawOwn(); }; row.appendChild(x); list.appendChild(row); });
      if (o.custom.length) list.appendChild(H('p', 'muted', 'Your lines come first, then the game makes up the rest.'));
    }
    function preview() { var t = inp.value.trim(); if (!t) { msg.innerHTML = ''; return null; } var r = parseRule(t, o.G); msg.innerHTML = r.err ? '<p class="state bad">' + esc(r.err) + '</p>' : '<div class="lavaprev">' + miniSvg(r.L, o.G) + '<p>' + esc(eqTxt(r.L)) + '<br><small>as ' + esc(FORMS[r.L.form].toLowerCase()) + ' · ' + r.n + ' safe points</small></p></div>'; return r; }
    inp.oninput = preview;
    add.onclick = function () { var r = preview(); if (!r || r.err) return; if (o.custom.length >= 10) { msg.innerHTML = '<p class="state bad">That is ten already.</p>'; return; } o.custom.push(inp.value.trim()); saveSettings(o); inp.value = ''; msg.innerHTML = ''; drawOwn(); };
    inp.onkeydown = function (e) { if (e.key === 'Enter') add.onclick(); };
    drawOwn();
    var f5 = grp('Inequality round');
    f5.appendChild(sel('Inequality round', [[2, 'Elimination: lava claims anyone outside'], [1, 'Points only: nobody is out'], [0, 'Off']], o.ineq, function (v) { o.ineq = v; }));
    IFORMS.forEach(function (n, i) { f5.appendChild(chk(n, o.iforms.indexOf(i) >= 0, function (on) { tog(o.iforms, i, on); })); });
    var r5 = H('div', 'row');
    r5.appendChild(sel('Strict and non-strict', [[0, 'Strict and non-strict'], [1, 'Non-strict only (≤ ≥)'], [2, 'Strict only (< >)']], o.strict, function (v) { o.strict = v; }));
    r5.appendChild(sel('Rules', [1, 2, 3, 4, 5, 6].map(function (n) { return [n, n + ' rule' + (n > 1 ? 's' : '')]; }), o.ncon, function (v) { o.ncon = v; }));
    f5.appendChild(r5);
    f5.appendChild(chk('From rule 4, two survivors on one point are both out', o.dup, function (on) { o.dup = on ? 1 : 0; }));
    var f6 = grp('Scoring');
    f6.appendChild(chk('Speed bonus (up to +50)', o.speed, function (on) { o.speed = on ? 1 : 0; }));
    f6.appendChild(chk('A point nobody else chose (+25)', o.uniq, function (on) { o.uniq = on ? 1 : 0; }));
    f6.appendChild(chk('Multipliers (×1.5 negative, ×2 fraction, ×3 both)', o.mult, function (on) { o.mult = on ? 1 : 0; }));
    f6.appendChild(sel('Hint step', [[1, 'Hint step: automatic (after two rounds on nothing)'], [2, 'Hint step: for everyone'], [0, 'Hint step: off']], o.scaf, function (v) { o.scaf = v; }));
    var w = H('p', 'state bad'); w.hidden = true; sec.appendChild(w);
    function warn() {
      var t = [];
      if (!o.forms.length) t.push('Tick at least one line form.');
      else if (!o.forms.some(function (f) { return f === 7 || CAT_OK[f].some(function (c) { return o.cats.indexOf(c) >= 0; }); })) t.push('None of the ticked forms can use the ticked slopes, so the game will use whole-number slopes.');
      if (o.ineq && !o.iforms.length) t.push('Tick at least one inequality form (or all three are used).');
      w.textContent = t.join(' '); w.hidden = !t.length;
    }
    warn();
    var sb = startBtn('🌋 Start The Floor Is Lava', 'Heating the floor…', function () { if (start(settings())) SFA.toast('The floor is lava. Students\' screens switch within a few seconds.', 3500); else A.consolePanel(); });
    var r7 = H('div', 'row'); r7.appendChild(sb); sec.appendChild(r7);
    box.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 500);

  /* ---------- styles ---------- */
  var css = [
    '.lava{position:fixed;inset:0;z-index:90;overflow:auto;background:radial-gradient(ellipse at 50% 110%,#5a1606,#240806 55%,#0d0403);color:#FFF1E4;padding:8px 14px 14px;display:flex;flex-direction:column;gap:8px;font-family:"Bricolage Grotesque",system-ui,-apple-system,"Segoe UI",sans-serif}',
    '.lavatop{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:center;min-height:44px}',
    '.lavalogo{font:400 clamp(15px,2vw,26px) "Luckiest Guy",system-ui;letter-spacing:1px;color:#FFB347;text-shadow:0 0 12px rgba(255,90,0,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.lavamid{display:flex;gap:12px;align-items:baseline;justify-content:center}.lavaph{font-weight:800;letter-spacing:1px;font-size:clamp(12px,1.4vw,18px);opacity:.9}',
    '.lavaclock{font:600 clamp(22px,3vw,40px)/1 "IBM Plex Mono",monospace;color:#FFD34D;min-width:3ch}.lavaclock.low{color:#FF5B3B}',
    '.lavaright{display:flex;justify-content:flex-end;gap:8px;align-items:center;min-width:0}.lavascore2{font-weight:800;font-size:clamp(13px,1.5vw,20px)}.lavaback{white-space:nowrap}.lavasnd{background:rgba(255,255,255,.12);color:inherit;border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:3px 8px;cursor:pointer;font:inherit;font-size:13px}',
    '.lavabodyw{flex:1;min-height:0;display:grid;gap:12px;grid-template-columns:minmax(0,1fr);align-items:start}',
    '.lava.scr .lavabodyw{grid-template-columns:minmax(220px,1fr) auto minmax(220px,1fr);align-items:stretch}',
    '.lavasqw{display:flex;justify-content:center}.lavasq{position:relative;aspect-ratio:1;align-self:start;flex:none;width:min(calc(100vh - 84px),56vw);border-radius:2.6%;overflow:hidden;box-shadow:0 0 40px rgba(255,80,0,.45),inset 0 0 0 4px #1a0805}',
    '.lava.stu .lavasq{width:min(100%,calc(100vh - 150px));min-width:260px}',
    '@media (min-width:900px){.lava.stu .lavabodyw{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"side sq" "info sq"}.lava.stu .lavaside{grid-area:side}.lava.stu .lavasqw{grid-area:sq}.lava.stu .lavainfo{grid-area:info}.lava.stu .lavasq{width:min(calc(100vh - 84px),58vw)}}',
    '.lavacv,.lavasvg,.lavasvg svg{position:absolute;inset:0;width:100%;height:100%}.lavalay{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
    '.lavagl{stroke:#1a0503;stroke-opacity:.38;stroke-width:1.4}.lavagl.ax{stroke:#1a0503;stroke-opacity:.85;stroke-width:3}',
    '.lavanum{font:700 14px "IBM Plex Mono",monospace;fill:#FFF1E4;text-anchor:middle;paint-order:stroke;stroke:#2a0805;stroke-width:3.5px}.lavanum.ax{font-style:italic;font-size:19px}',
    '.lavadot{fill:#1a0705;fill-opacity:.75}.lavadot.in{fill:#d9d2c9;fill-opacity:1;stroke:#2a2420;stroke-width:1.5}.lavadot.no{fill-opacity:.4}.lavadot.hol{fill:#2a1a14;fill-opacity:1;stroke:#ffcf99;stroke-width:1.6}',
    '.lavaline{stroke:#2a2420;stroke-width:9;stroke-linecap:round;filter:drop-shadow(0 0 6px rgba(255,170,60,.8))}',
    '.lavastone path{fill:url(#lavastoneg);stroke:#1c1715;stroke-width:2}.lavastone{transform-box:fill-box;transform-origin:50% 80%;animation:lavarise .7s cubic-bezier(.2,1.5,.4,1) both}',
    '@keyframes lavarise{0%{transform:translateY(12px) scale(.15);opacity:0}100%{transform:none;opacity:1}}',
    '.lavareg{fill:url(#lavarock);fill-opacity:.95}.lavareg.cool{animation:lavacool 1.6s ease-out both}@keyframes lavacool{0%{fill-opacity:0;filter:brightness(2.2) sepia(1) saturate(4)}100%{fill-opacity:.95;filter:none}}',
    '.lavabd{stroke:#e8e2da;stroke-width:4;stroke-linecap:round}.lavabd.dash{stroke-dasharray:14 11}.lavabd.hot{stroke:#FFE08A;stroke-width:5;filter:drop-shadow(0 0 5px #ff7a00)}.lavabd.new{stroke:#fff;stroke-width:5}',
    '.lavahit{fill:transparent;cursor:pointer}.lavahit:hover{fill:rgba(255,230,120,.35)}.lavasvg.lock .lavahit{pointer-events:none}.lavamine{fill:none;stroke:#FFE14D;stroke-width:5}.lavaoth{fill:#000;fill-opacity:.25}',
    '.lavaa{position:absolute;width:7.6%;transform:translate(-50%,-82%);display:flex;flex-direction:column;align-items:center;will-change:left,top}',
    '.lava.g10 .lavaa{width:5.2%}',
    '.lavaw{position:relative;width:100%}.lavaav{width:100%;transform-origin:50% 95%;will-change:transform}.lavaa svg{width:100%;height:auto;display:block}.lavaa:not(.mv) .av.walk .avft,.lavaa:not(.mv) .av.walk .avbod{animation:none}',
    '.lavan{font-weight:800;font-size:1em;line-height:1;color:#2a0b05;background:rgba(255,241,228,.88);border-radius:.5em;padding:.1em .35em;margin-top:-.25em;white-space:nowrap;max-width:240%;overflow:hidden;text-overflow:ellipsis;position:relative;z-index:2}',
    '.lavab{position:absolute;top:-8%;right:-22%;font:800 1em/1 system-ui;font-style:normal;background:#2a0b05;color:#fff;border-radius:.6em;padding:.15em .4em}.lavab:empty{display:none}',
    '.lavaa.me{width:9.5%;z-index:400!important}.lavaa.me .lavan{background:#FFE14D}',
    '.lavaa.ghost .lavaav,.lavaa.melted .lavaav{opacity:.32;filter:grayscale(1) brightness(1.7);animation:lavaghost 3s ease-in-out infinite}',
    '@keyframes lavaghost{0%,100%{transform:translateY(-14%)}50%{transform:translateY(-22%)}}',
    '.lavaa.cheer .lavaav{animation:lavajump .45s ease-out 4 alternate}.lavaa.cheer .lavan{background:#9CF0B8}@keyframes lavajump{to{transform:translateY(-22%) scale(1.05,.97)}}',
    '.lavadrip,.lavapud,.lavasteam{position:absolute;display:block;pointer-events:none;opacity:0}',
    '.lavadrip{width:14%;height:16%;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#ff5a1a;top:55%}.lavadrip.d1{left:24%}.lavadrip.d2{left:47%}.lavadrip.d3{left:66%}',
    '.lavapud{left:-5%;width:110%;height:22%;bottom:4%;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,#ffb347,#e2440c 55%,#7a1708);transform:scale(0)}',
    '.lavasteam{width:30%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.85),rgba(255,255,255,0) 70%);bottom:20%}.lavasteam.s1{left:5%}.lavasteam.s2{left:36%}.lavasteam.s3{left:65%}',
    '.lavaa.melt .lavaav{animation:lavamelt 2.3s cubic-bezier(.5,0,.7,1) forwards}.lavaa.melt .lavaav svg{filter:sepia(1) saturate(7) hue-rotate(-30deg) brightness(.95)}',
    '@keyframes lavamelt{0%{transform:none}8%{transform:translateX(-4%) rotate(-3deg)}14%{transform:translateX(4%) rotate(3deg)}22%{transform:scale(1.05,.95)}48%{transform:scale(1.25,.55) translateY(8%)}72%{transform:scale(1.7,.14) translateY(30%)}100%{transform:scale(1.8,.06) translateY(40%);opacity:.0}}',
    '.lavaa.melt .lavadrip{animation:lavadrip .9s ease-in forwards}.lavaa.melt .lavadrip.d1{animation-delay:.5s}.lavaa.melt .lavadrip.d2{animation-delay:.75s}.lavaa.melt .lavadrip.d3{animation-delay:1s}',
    '@keyframes lavadrip{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translateY(260%) scale(1.1,.7)}}',
    '.lavaa.melt .lavapud,.lavaa.melted .lavapud{animation:lavapud 2.6s ease-out forwards}.lavaa.melted .lavapud{animation:none;opacity:.85;transform:scale(1);background:radial-gradient(ellipse at 50% 40%,#8a4a2a,#4a1c0c 60%,#2a0e06)}',
    '@keyframes lavapud{0%,35%{opacity:0;transform:scale(0)}55%{opacity:1;transform:scale(1.15)}75%{transform:scale(1)}100%{opacity:.9;transform:scale(1);filter:brightness(.6)}}',
    '.lavaa.melt .lavasteam{animation:lavasteam 1.4s ease-out forwards}.lavaa.melt .lavasteam.s1{animation-delay:1.25s}.lavaa.melt .lavasteam.s2{animation-delay:1.45s}.lavaa.melt .lavasteam.s3{animation-delay:1.6s}',
    '@keyframes lavasteam{0%{opacity:0;transform:translateY(0) scale(.4)}25%{opacity:.9}100%{opacity:0;transform:translateY(-160%) scale(1.6)}}',
    '.lava.calm .lavaa.melt .lavaav,.lava.calm .lavaa.melted .lavaav,.lava.calm .lavaa.ghost .lavaav,.lava.calm .lavaa.cheer .lavaav{animation:none;transform:none}.lava.calm .lavaa.melt .lavaav{opacity:.4}.lava.calm .lavadrip,.lava.calm .lavasteam{display:none}.lava.calm .lavaa.melt .lavapud{animation:none;opacity:.8;transform:scale(1)}.lava.calm .lavastone,.lava.calm .lavareg.cool{animation:none}',
    '.lavaside,.lavainfo{display:flex;flex-direction:column;gap:10px;min-width:0}.lava.scr .lavaside,.lava.scr .lavainfo{font-size:clamp(14px,1.45vw,24px)}',
    '.lavavoice{background:#F7F0E3;color:#2a1610;border-radius:6px;padding:.7em .8em .6em;font-family:"IBM Plex Mono",monospace;box-shadow:0 3px 0 rgba(0,0,0,.35);border-left:6px solid #C0392B}.lavavoice i{display:block;font-style:normal;font-weight:600;font-size:.62em;letter-spacing:2px;color:#C0392B}.lavavoice p{margin:.2em 0 0;font-weight:600;line-height:1.3}',
    '.lavatask{background:#1f0905;border:3px solid #FFB347;border-radius:14px;padding:.6em .7em;display:flex;flex-direction:column;align-items:center;gap:.15em;text-align:center;font-size:1.25em;line-height:1.3;box-shadow:0 0 18px rgba(255,120,0,.3)}.lavatask b{color:#FFD34D}.lavaeq{font:700 1.5em Georgia,"Times New Roman",serif}',
    '.lavatbl{border-collapse:collapse;font:600 1.1em "IBM Plex Mono",monospace}.lavatbl th,.lavatbl td{border:2px solid rgba(255,255,255,.5);padding:.15em .6em;min-width:2.2em}.lavatbl th{font-style:italic;color:#FFD34D}',
    '.lavanote{margin:0;opacity:.92;line-height:1.35}.lavanote.warn{background:rgba(192,57,43,.35);border-radius:10px;padding:.4em .6em;font-weight:700}.lavanote.good{color:#9CF0B8;font-weight:800}.lavanote.nudge{background:rgba(255,211,77,.18);border-left:4px solid #FFD34D;border-radius:8px;padding:.35em .6em;font-weight:700}',
    '.lavawork{margin:0;background:rgba(220,210,200,.14);border-left:5px solid #d9d2c9;border-radius:8px;padding:.5em .65em;font-weight:700;line-height:1.35}',
    '.lavabig{margin:0;font-size:1.25em;font-weight:700;line-height:1.25}.lavabig b{color:#FFD34D}.lavabig.good{color:#9CF0B8}.lavabig.bad{color:#FFB0A0}.lavabd{margin:0;font:700 1.1em "IBM Plex Mono",monospace;background:rgba(0,0,0,.3);border-radius:10px;padding:.4em .6em}',
    '.lavanames{margin:0;line-height:1.35;font-size:.86em}.lavanames.gold{color:#FFD34D;font-weight:700}.lava h4{margin:.2em 0 0;font-size:.8em;letter-spacing:1px;text-transform:uppercase;opacity:.75}',
    '.lavascore{border-collapse:collapse;width:100%;font-size:.95em}.lavascore td{padding:.25em .5em;border-bottom:1px solid rgba(255,255,255,.15)}.lavascore td:last-child{text-align:right;white-space:nowrap}.lavascore b{color:#FFD34D}.lavascore tr.bad b{color:#FF8A70}',
    '.lavarules{margin:0;padding:0;list-style:none;counter-reset:r;display:flex;flex-direction:column;gap:.25em}.lavarules li{counter-increment:r;display:flex;align-items:baseline;gap:.5em;background:rgba(255,255,255,.07);border-radius:10px;padding:.25em .6em;font-size:1.1em;flex-wrap:wrap}.lavarules li:before{content:counter(r);opacity:.6;font-size:.8em}.lavarules li b{font-family:Georgia,"Times New Roman",serif;white-space:nowrap}.lavarules li small{margin-left:auto;opacity:.65;font-size:.65em}.lavarules li.new{background:#1f0905;border:3px solid #FFB347;font-size:1.3em}.lavarules li.new b{color:#FFD34D}',
    '.lavalb{margin:0;padding:0;list-style:none;counter-reset:l;font-size:.9em}.lavalb li{counter-increment:l;display:flex;gap:.5em;padding:.12em .4em;break-inside:avoid;border-radius:6px}.lavalb li:before{content:counter(l) ".";opacity:.6;min-width:1.8em}.lavalb li span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lavalb li b{color:#FFD34D}.lavalb li.me{background:rgba(255,225,77,.22)}',
    '.lavatype{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;background:rgba(0,0,0,.25);border-radius:12px;padding:.5em .6em}.lavatp{font:700 1.2em "IBM Plex Mono",monospace;display:inline-flex;align-items:center;gap:2px}.lavatp input,.lavascaf input{width:5.5em;font:600 16px "IBM Plex Mono",monospace;padding:4px 6px;border-radius:8px;border:2px solid #FFB347;background:#fff7ec;color:#2a0b05}.lavatype small{flex-basis:100%;opacity:.75}.lavaerr{flex-basis:100%;color:#FFB0A0;font-style:normal;font-weight:700}.lavaerr:empty{display:none}',
    '.lavascaf{background:#2a1a14;border:3px solid #9CF0B8;border-radius:14px;padding:.6em .7em;display:flex;flex-direction:column;gap:.4em}.lavascaf .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.lavafin{flex:1;display:grid;gap:18px;grid-template-columns:minmax(0,1fr);align-items:start;font-size:clamp(14px,1.5vw,24px)}.lavafin[hidden],.lavabodyw[hidden]{display:none}@media (min-width:820px){.lavafin{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}}',
    '.lavafinL,.lavafinR{display:flex;flex-direction:column;gap:12px;min-width:0}.lavafin h2{margin:0;text-align:center;font:400 clamp(26px,4.4vw,64px) "Luckiest Guy",system-ui;color:#FFB347;text-shadow:0 3px 0 #2a0b05,0 0 20px rgba(255,90,0,.5)}',
    '.lavapod{display:flex;justify-content:center;align-items:flex-end;gap:10px}.lavastep{display:flex;flex-direction:column;align-items:center;gap:2px;width:30%;max-width:210px}.lavastep svg{width:70%;height:auto}.lavastep b{font-size:1.1em}.lavastep i{font-style:normal;opacity:.85;font-size:.8em}.lavastep span{display:flex;align-items:flex-start;justify-content:center;width:100%;background:linear-gradient(#8a827a,#4a4440);color:#fff;font:400 1.6em "Luckiest Guy",system-ui;border-radius:8px 8px 0 0;padding-top:.15em}.lavastep.s0 span{height:4.2em;background:linear-gradient(#FFD34D,#c98a10);color:#2a0b05}.lavastep.s1 span{height:3em}.lavastep.s2 span{height:2.1em}',
    '.lavafinR .lavalb{columns:2;column-gap:18px}@media (min-width:1200px){.lava.scr .lavafinR .lavalb{columns:3}}',
    '.lavaset{display:flex;flex-direction:column;gap:8px}.lavaset fieldset{border:1px solid var(--line,#444);border-radius:10px;padding:6px 10px 8px;display:flex;flex-direction:column;gap:3px;margin:0;min-width:0}.lavaset legend{font-weight:800;font-size:13px;padding:0 4px}.lavaset label{font-size:13px;display:flex;gap:6px;align-items:baseline;line-height:1.25}.lavaset select{max-width:100%;min-width:0}.lavaset fieldset>select{width:100%}.lavaset .row{display:flex;gap:6px;flex-wrap:wrap}.lavaset input[type=text]{flex:1;min-width:10em}',
    '.lavaprev{display:flex;gap:10px;align-items:center;margin-top:6px}.lavamini{width:120px;height:120px;flex:none}.lavaownr{display:flex;justify-content:space-between;gap:6px;align-items:center;font-size:13px}.lavaownr.bad span{color:#e06650}',
    '.lavachip{border:1px solid var(--line,#555);background:transparent;color:inherit;border-radius:999px;padding:1px 8px;margin:2px 3px;font:inherit;font-size:13px;cursor:pointer}.lavachip.on{background:rgba(156,240,184,.2);border-color:#5fbf80}',
    '@media (prefers-reduced-motion:reduce){.lavaa{transition:none!important}}'
  ].join('\n');
  var sty = document.createElement('style'); sty.id = 'sfaLavaCss'; sty.textContent = css; document.head.appendChild(sty);

  window.SFA_STAND = { v: 2, math: M, standOf: standOf, setup: setup, start: start, counts: counts, spot: spot, restore: restore, agg: agg, section: section,
    sync: function () { if (A.MODE !== 'teach' && (liveV1() || window.SFA_STAND_V1)) v1(function (x) { x.sync(); }); sync(); },
    peek: function () { return V && V.o ? { o: V.o, x: ST && ST.x, y: ST && ST.y, t: ST ? ST.t : -1, s: ST ? ST.s : 0, slot: mySlot(), canTap: V.canTap, scaf: V.o ? myScaf(V.o) : false, sum: ST ? ST.sum : null, bd: V.bd, hist: ST ? ST.hist : [], fps: V.fps.slice(), drawMs: V.drawMs.slice(), info: V.info ? V.info.textContent : '' } : null; },
    bench: function (n) { return V && V.lava ? V.lava.bench(n || 60) : -1; } };
})(typeof window !== 'undefined' ? window : globalThis);
