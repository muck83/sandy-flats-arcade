/* Sandy Flats: Unit 2 Check, the adaptive formative for Linear Equations and Inequalities.
   This file is the engine (no page drawing): the item bank, the adaptive rule, the scoring, the start code and the
   compact summary that reaches the teacher dashboard. check-u2-app.js draws the student test; check-u2-teacher.html
   reads the class. Both load this file, so a student's levels are worked out the same way on both pages.

   The thirteen skills and four success criteria are the Unit 2 Review's (review-u2.js). Every skill has four levels
   of question:  1 Foundation · 2 Emerging-level · 3 Developed-level (the unit goal, like the review's independent
   problems) · 4 Deep-level (like the review's stretch problems).

   ADAPTIVE RULE (a staircase). Each success criterion starts at level 2. A right answer moves that criterion's
   staircase up one level, a wrong answer (or "I don't know yet") moves it down one. The first question on a skill is
   asked at its criterion's current level; after that the skill has its own staircase from its last question.
   COVERAGE. Questions 1-13 visit all thirteen skills once, 14-26 visit them all again, in an order that mixes the
   four criteria. After that the test goes back to the skill it knows least about.
   SCORING. Each answer updates an estimate of the student's level (an EAP estimate under a simple item response
   model: chance of a right answer rises with student level minus question level, with an allowance for lucky
   guesses on tap-to-choose questions). Estimates are reported on the review's rubric scale, with a scale score of
   500 + 100 x estimate (cut scores 450 Emerging, 550 Developed, 650 Deep) and a plus-or-minus. With too few answers
   the report says "not enough evidence" instead of guessing.
   Results save under the key g91, like a game, so they sync and reach the dashboard with no backend change. */
(function () {
  'use strict';
  var CU = window.CU2 = { v: 1, KEY: 'g91' };
  /* Each Check the teacher runs (Check 1 to 4) saves under its own key, so a new Check never replaces an earlier one's
     results. The start code says which Check it starts. Check 1 is g91, where every attempt before this switch lives. */
  CU.KEYS = ['g91', 'g92', 'g93', 'g94'];
  CU.keyFor = function (n) { return CU.KEYS[n] || CU.KEYS[0]; };

  /* ---------------- numbers (the same rules as the review) ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function F(n, d) { d = d == null ? 1 : d; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return [n / g, d / g]; }
  function fs(f) { return (f[0] < 0 ? '−' : '') + Math.abs(f[0]) + (f[1] === 1 ? '' : '/' + f[1]); }
  function feq(a, b) { return !!a && !!b && a[0] * b[1] === b[0] * a[1]; }
  function fv(f) { return f[0] / f[1]; }
  function fadd(a, b) { return F(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function fmul(a, b) { return F(a[0] * b[0], a[1] * b[1]); }
  function parse(s) {
    s = String(s == null ? '' : s).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/^\+/, '').replace(/^\$/, '');
    if (!s) return null;
    var m = s.match(/^(-?)\(?(-?\d+)\)?\/\(?(-?\d+)\)?$/);
    if (m) { var d = +m[3]; if (!d) return null; return F((m[1] ? -1 : 1) * +m[2], d); }
    if (/^-?\d*\.?\d+$/.test(s)) { var p = s.split('.'), k = p[1] ? p[1].length : 0; if (k > 6) return null; var den = Math.pow(10, k); return F(Math.round(parseFloat(s) * den), den); }
    return null;
  }
  function ng(n) { return n < 0 ? '−' + (-n) : String(n); }
  function par(n) { return n < 0 ? '(−' + (-n) + ')' : String(n); }
  function co(f, v, first) {
    if (typeof f === 'number') f = F(f);
    var n = f[0], d = f[1]; if (n === 0) return '';
    var a = Math.abs(n), body = v ? (d === 1 ? (a === 1 ? '' : a) : '(' + a + '/' + d + ')') + v : (d === 1 ? String(a) : a + '/' + d);
    return first ? (n < 0 ? '−' : '') + body : (n < 0 ? ' − ' : ' + ') + body;
  }
  function lineEq(m, b) { if (typeof m === 'number') m = F(m); if (typeof b === 'number') b = F(b); var s = co(m, 'x', true), t = co(b, '', !s); return 'y = ' + (s + t || '0'); }
  function stdEq(A, B, C) { var s = co(A, 'x', true), t = co(B, 'y', !s); return s + t + ' = ' + ng(C); }
  function pt(x, y) { return '(' + ng(x) + ', ' + ng(y) + ')'; }
  function I(s) { return '[[' + s + ']]'; }   // text inside [[ ]] is drawn as ink (a picture), not as selectable text
  function yOn(L, x) { return fadd(fmul(L.m, F(x)), L.b); }
  function onLine(L, x, y) { return feq(yOn(L, x), F(y)); }
  function through(x1, y1, x2, y2) { var m = F(y2 - y1, x2 - x1); return { m: m, b: fadd(F(y1), fmul(m, F(-x1))) }; }
  function stdIs(A, B, C, m, b) { return B !== 0 && feq(F(-A, B), m) && feq(F(C, B), b); }
  CU.num = { F: F, fs: fs, feq: feq, fv: fv, parse: parse, ng: ng, lineEq: lineEq, stdEq: stdEq };

  /* ---------------- seeded randomness: the same seed always gives the same test ---------------- */
  function hash(s) { s = String(s); var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15; return h >>> 0; }
  function rng(seed) {
    var a = seed >>> 0;
    function f() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    var R = { f: f };
    R.i = function (lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); };
    R.nz = function (lo, hi) { var v; do v = R.i(lo, hi); while (!v); return v; };
    R.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    R.shuffle = function (arr) { arr = arr.slice(); for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(f() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; };
    return R;
  }
  CU.hash = hash; CU.rng = rng;

  /* ---------------- skills and criteria (ids are the review's) ---------------- */
  var CRIT = CU.CRIT = [
    { id: 'compute', short: 'Compute slope', name: 'Compute slope from tables, equations, graphs and ordered pairs', strand: 'C1 Concepts', skills: ['s1', 's2', 's3', 's4'] },
    { id: 'convert', short: 'Convert forms', name: 'Convert between standard form and slope-intercept form', strand: 'C1 Concepts', skills: ['f1', 'f2'] },
    { id: 'represent', short: 'Represent', name: 'Represent scenarios graphically, with equations and with words', strand: 'C3 Problem Solving', skills: ['b1', 'r1', 'r2', 'r3', 'r4'] },
    { id: 'explain', short: 'Explain', name: 'Explain reasoning', strand: 'C2 Communicating', skills: ['e1', 'e2'] }
  ];
  var NAMES = { s1: 'Slope from two points', s2: 'Slope from a table', s3: 'Slope from a graph', s4: 'Slope from an equation', f1: 'Standard form to slope-intercept form', f2: 'Slope-intercept form to standard form', b1: 'Find b and write the equation', r1: 'Model a story with an equation and solve', r2: 'Graph a line from its equation', r3: 'Inequalities: write, solve and graph', r4: 'Match words, tables, graphs and equations', e1: 'Explain what slope and y-intercept mean', e2: 'Find and fix the mistake' };
  var SK = CU.SK = [], CRIT_OF = {};
  CRIT.forEach(function (c) { c.skills.forEach(function (id) { CRIT_OF[id] = c.id; SK.push({ id: id, name: (window.SFA_REVIEW && window.SFA_REVIEW.T && window.SFA_REVIEW.T[id] && window.SFA_REVIEW.T[id].name) || NAMES[id], crit: c.id }); }); });
  var IDS = CU.IDS = SK.map(function (s) { return s.id; });
  CU.LV = ['Not enough evidence', 'Limited', 'Emerging', 'Developed', 'Deep'];
  CU.DNAME = ['', 'Foundation', 'Emerging-level', 'Developed-level', 'Deep-level'];
  // the chance of a lucky right answer, by skill and question level (tap-to-choose questions can be guessed; typed and plotted ones can't)
  var GUESS = CU.GUESS = { s1: [0, 0, 0, 0], s2: [0, 0, 0, 0], s3: [0, 0, 0, 0], s4: [0, 0, 0, 0], f1: [.25, 0, 0, .25], f2: [.25, .05, 0, 0], b1: [0, 0, 0, 0], r1: [.25, 0, 0, 0], r2: [0, 0, 0, 0], r3: [.25, .25, 0, .25], r4: [.25, .25, .25, .25], e1: [.25, .25, 0, .25], e2: [.33, .08, .08, 0] };
  /* topics the teacher can leave out of a Check (the start code carries the choice, so no server change): a bit each.
     top = which optional topics are IN. Attempts from before this switch have no top: everything was in. */
  var TOPICS = CU.TOPICS = [{ bit: 1, id: 'ineq', name: 'Inequalities', skills: ['r3'] }];
  CU.ALL_TOP = 1;
  function offFor(top) { var o = {}; if (top == null) return o; TOPICS.forEach(function (t) { if (!(top & t.bit)) t.skills.forEach(function (id) { o[id] = 1; }); }); return o; }
  CU.uses = function (id, top) { return !offFor(top)[id]; };
  CU.active = function (top) { var o = offFor(top); return IDS.filter(function (id) { return !o[id]; }); };
  CU.topText = function (top) { return TOPICS.map(function (t) { return t.name + (top == null || (top & t.bit) ? ' included' : ' left out'); }).join(' · '); };
  // skills where working it out on paper pays off: one from each pair becomes a "work it out on paper" question
  var PAPER_PAIRS = [['s1', 's4'], ['f1', 'f2'], ['b1', 'r1']];

  /* ---------------- story contexts ---------------- */
  var CTX = [
    { dir: 1, t: function (S, R) { return 'A climbing gym charges a ' + I('$' + S) + ' sign-up fee plus ' + I('$' + R) + ' per month.'; }, intro: 'A climbing gym charges a sign-up fee plus the same price every month.', x: 'month', xs: 'months', y: 'total cost', money: 1, S: [20, 60, 5], R: [10, 30, 5] },
    { dir: -1, t: function (S, R) { return 'A water tank holds ' + I(S + ' litres') + '. It drains ' + I(R + ' litres') + ' every minute.'; }, intro: 'A water tank is draining at a steady rate.', x: 'minute', xs: 'minutes', y: 'amount of water in the tank', unit: 'litres', S: [200, 500, 50], R: [5, 25, 5] },
    { dir: -1, t: function (S, R) { return 'A candle is ' + I(S + ' cm') + ' tall. It burns down ' + I(R + ' cm') + ' every hour.'; }, intro: 'A candle burns down at a steady rate.', x: 'hour', xs: 'hours', y: 'height of the candle', unit: 'cm', S: [18, 30, 2], R: [1, 3, 1] },
    { dir: 1, t: function (S, R) { return 'Lena has ' + I('$' + S) + ' saved and adds ' + I('$' + R) + ' every week.'; }, intro: 'Lena saves the same amount every week.', x: 'week', xs: 'weeks', y: 'amount saved', money: 1, S: [30, 120, 10], R: [5, 25, 5] },
    { dir: 1, t: function (S, R) { return 'A taxi ride costs ' + I('$' + S) + ' to start plus ' + I('$' + R) + ' for every kilometre.'; }, intro: 'A taxi charges a starting fee plus the same price for every kilometre.', x: 'kilometre', xs: 'kilometres', y: 'cost of the ride', money: 1, S: [3, 9, 1], R: [2, 4, 1] },
    { dir: -1, t: function (S, R) { return 'After a storm the Sandy Flats duck pond is ' + I(S + ' cm') + ' deep. It drops ' + I(R + ' cm') + ' every day.'; }, intro: 'After a storm, the Sandy Flats duck pond drops at a steady rate.', x: 'day', xs: 'days', y: 'depth of the pond', unit: 'cm', S: [60, 120, 10], R: [2, 6, 1] },
    { dir: 1, t: function (S, R) { return 'A wild goat starts ' + I(S + ' m') + ' up the Switchback trail and climbs ' + I(R + ' m') + ' every minute.'; }, intro: 'A wild goat climbs the Switchback trail at a steady rate.', x: 'minute', xs: 'minutes', y: 'height up the trail', unit: 'm', S: [10, 50, 5], R: [3, 9, 1] }
  ];
  function story(R, dir) {
    var pool = CTX.filter(function (c) { return !dir || c.dir === dir; }), c = R.pick(pool);
    var S = c.S[0] + c.S[2] * R.i(0, Math.floor((c.S[1] - c.S[0]) / c.S[2])), Rt = c.R[0] + c.R[2] * R.i(0, Math.floor((c.R[1] - c.R[0]) / c.R[2]));
    return { c: c, S: S, R: Rt, m: c.dir * Rt, text: c.t(S, Rt), val: function (v) { return c.money ? '$' + ng(v) : ng(v) + ' ' + c.unit; }, lets: ' Let x be the number of ' + c.xs + ' and y the ' + c.y + '.' };
  }

  /* ---------------- question parts ----------------
     kinds: num (typed numbers), mc (tap one option), row (tap a row of the table or a line of working),
     point (tap a grid point), line (tap two grid points), order (put lines in order), ineq (style and shade a boundary),
     multi (several of these answered together). */
  function mcPart(R, q, opts, n) {
    var seen = {}, list = [];
    opts.forEach(function (o) { if (!o) return; var k = o.t != null ? 't' + o.t : 'g' + JSON.stringify(o.g); if (seen[k]) return; seen[k] = 1; list.push(o); });
    var right = list.filter(function (o) { return o.ok; }), wrong = list.filter(function (o) { return !o.ok; });
    if (right.length !== 1 || wrong.length < 2) return null;
    var use = R.shuffle([right[0]].concat(wrong.slice(0, (n || 4) - 1)));
    return { kind: 'mc', q: q, opts: use.map(function (o) { return o.t != null ? o.t : { g: o.g }; }), truth: use.map(function (o) { return !!o.ok; }), ans: use.indexOf(right[0]) };
  }
  function numPart(q, labs, ans, check) { return { kind: 'num', q: q, labs: labs, ans: ans, check: check || null }; }
  function eqOpt(m, b, tm, tb) { return { t: I(lineEq(m, b)), ok: feq(m, tm) && feq(b, tb) }; }
  function stdOpt(A, B, C, tm, tb) { if (!A && !B) return null; return { t: I(stdEq(A, B, C)), ok: stdIs(A, B, C, tm, tb) }; }

  function checkPart(p, r) {
    var i;
    if (r == null) return false;
    if (p.kind === 'num') { var v = (r || []).map(parse); if (v.length !== p.ans.length || v.some(function (x) { return !x; })) return false; return p.check ? !!p.check(v) : v.every(function (x, k) { return feq(x, p.ans[k]); }); }
    if (p.kind === 'mc' || p.kind === 'row') return r === p.ans;
    if (p.kind === 'point') return !!r && Number.isInteger(r.x) && Number.isInteger(r.y) && !!p.ok(r.x, r.y);
    if (p.kind === 'line') return Array.isArray(r) && r.length === 2 && !(r[0].x === r[1].x && r[0].y === r[1].y) && onLine(p.line, r[0].x, r[0].y) && onLine(p.line, r[1].x, r[1].y);
    if (p.kind === 'order') { if (!Array.isArray(r) || r.length !== p.ans.length) return false; for (i = 0; i < r.length; i++) if (r[i] !== p.ans[i]) return false; return true; }
    if (p.kind === 'ineq') return !!r && r.solid === p.ans.solid && r.above === p.ans.above;
    if (p.kind === 'multi') return Array.isArray(r) && p.subs.every(function (s, k) { return checkPart(s, r[k]); });
    return false;
  }
  // the right response to a part (used by the self-check, the simulated students and the teacher's answer key)
  function keyOf(p) {
    if (p.kind === 'num') return p.key || p.ans.map(fs);
    if (p.kind === 'mc' || p.kind === 'row') return p.ans;
    if (p.kind === 'point') return p.key;
    if (p.kind === 'line') return p.key;
    if (p.kind === 'order') return p.ans.slice();
    if (p.kind === 'ineq') return { solid: p.ans.solid, above: p.ans.above };
    if (p.kind === 'multi') return p.subs.map(keyOf);
    return null;
  }
  // a wrong response of the same shape (for the self-check and the simulated students)
  function wrongOf(p) {
    if (p.kind === 'num') return p.ans.map(function (a) { return fs(F(a[0] + a[1], a[1])); });
    if (p.kind === 'mc') return (p.ans + 1) % p.opts.length;
    if (p.kind === 'row') return (p.ans + 1) % p.n;
    if (p.kind === 'point') { for (var x = -8; x <= 8; x++) for (var y = -8; y <= 8; y++) if (!p.ok(x, y)) return { x: x, y: y }; return null; }
    if (p.kind === 'line') return [{ x: p.key[0].x, y: p.key[0].y }, { x: p.key[1].x, y: p.key[1].y + 1 }];
    if (p.kind === 'order') return p.ans.slice().reverse();
    if (p.kind === 'ineq') return { solid: !p.ans.solid, above: p.ans.above };
    if (p.kind === 'multi') return p.subs.map(wrongOf);
    return null;
  }
  function partGuess(p) {
    if (p.kind === 'mc') return 1 / p.opts.length; if (p.kind === 'row') return 1 / p.n; if (p.kind === 'ineq') return .25;
    if (p.kind === 'order') { var f = 1; for (var i = 2; i <= p.ans.length; i++) f *= i; return 1 / f; }
    if (p.kind === 'multi') return p.subs.reduce(function (a, s) { return a * partGuess(s); }, 1);
    return 0;
  }
  CU.checkPart = checkPart; CU.keyOf = keyOf; CU.wrongOf = wrongOf;

  /* ---------------- the item bank: G[skill](R, level) returns one question, or null to try other numbers ---------------- */
  var G = {};
  function seg(R, dx, dy, lim) {   // a start point so that (x, y) and (x + dx, y + dy) both fit on the grid
    lim = lim || 7; var xlo = Math.max(-lim, -lim - dx), xhi = Math.min(lim, lim - dx), ylo = Math.max(-lim, -lim - dy), yhi = Math.min(lim, lim - dy);
    if (xlo > xhi || ylo > yhi) return null;
    return { x: R.i(xlo, xhi), y: R.i(ylo, yhi) };
  }
  function frac(R, qs, lim) { var q = R.pick(qs), p; do p = R.nz(-lim, lim); while (gcd(p, q) !== 1); return F(p, q); }

  G.s1 = function (R, d) {
    var dx, dy, x1, y1, x2, y2, m;
    if (d === 4 && R.f() < .5) {   // plot one more point on the line through two given points (empty grid)
      m = frac(R, [1, 2, 3], 3); var k = R.pick([1, 2]), s = seg(R, m[1] * k, m[0] * k, 6); if (!s) return null;
      x1 = s.x; y1 = s.y; x2 = x1 + m[1] * k; y2 = y1 + m[0] * k;
      var L = through(x1, y1, x2, y2), key = null, xx;
      for (xx = -8; xx <= 8 && !key; xx++) { var yy = yOn(L, xx); if (yy[1] === 1 && Math.abs(yy[0]) <= 8 && xx !== x1 && xx !== x2) key = { x: xx, y: yy[0] }; }
      if (!key) return null;
      return { stem: 'A straight line passes through ' + I(pt(x1, y1)) + ' and ' + I(pt(x2, y2)) + '. The two points are not drawn for you.', fig: null, exp: 100,
        parts: [{ kind: 'point', q: 'Tap one MORE point that is on this line (not one of the two given points).', ok: function (x, y) { return onLine(L, x, y) && !(x === x1 && y === y1) && !(x === x2 && y === y2); }, key: key }],
        verify: function () { return feq(F(key.y - y1, key.x - x1), F(y2 - y1, x2 - x1)); },
        work: ['Slope = ' + ng(y2 - y1) + '/' + ng(x2 - x1) + ' = ' + fs(m) + '. From a given point move right ' + m[1] + ' and ' + (m[0] > 0 ? 'up ' : 'down ') + Math.abs(m[0]) + ', e.g. ' + pt(key.x, key.y) + '.'] };
    }
    if (d === 4) {   // a missing coordinate
      m = frac(R, [2, 3, 4], 5); dx = m[1] * R.pick([1, 2, -1]); x1 = R.i(-6, 6); y1 = R.i(-8, 8); x2 = x1 + dx; y2 = y1 + m[0] * dx / m[1];
      return { stem: 'The line through ' + I(pt(x1, y1)) + ' and ' + I('(' + ng(x2) + ', k)') + ' has slope ' + I(fs(m)) + '.', fig: null, exp: 110,
        parts: [numPart('Find the value of k.', ['k ='], [F(y2)])],
        verify: function () { return feq(F(y2 - y1, x2 - x1), m); },
        work: ['Change in x = ' + ng(x2) + ' − ' + par(x1) + ' = ' + ng(dx) + '. Change in y = slope × change in x = ' + ng(y2 - y1) + '. k = ' + ng(y1) + ' + ' + par(y2 - y1) + ' = ' + ng(y2) + '.'] };
    }
    if (d === 1) { dx = R.i(1, 3); dy = dx * R.i(1, 4); x1 = R.i(0, 4); y1 = R.i(0, 5); }
    else if (d === 2) { dx = R.i(1, 4); dy = dx * R.nz(-4, 4); x1 = R.i(-6, 3); y1 = R.i(-6, 6); }
    else { dx = R.pick([2, 3, 4, 5, 6]); dy = R.nz(-9, 9); if (dy % dx === 0) dy += dy > 0 ? 1 : -1; x1 = R.i(-6, 2); y1 = R.i(-6, 6); }
    x2 = x1 + dx; y2 = y1 + dy;
    if (d >= 3 && R.f() < .5) { var t = x1; x1 = x2; x2 = t; t = y1; y1 = y2; y2 = t; }
    m = F(y2 - y1, x2 - x1);
    var parts = [numPart('Find the slope. Write a fraction like −3/4 if you need one.', ['m ='], [m])];
    if (d === 3) {
      var cal = function (a, b, c, e, op) { return I('(' + ng(a) + ' ' + op + ' ' + par(b) + ') ÷ (' + ng(c) + ' ' + op + ' ' + par(e) + ')'); };
      var val = function (n, dd) { return dd ? F(n, dd) : null; };
      var why = mcPart(R, 'Which calculation gives this slope?', [
        { t: cal(y2, y1, x2, x1, '−'), ok: feq(val(y2 - y1, x2 - x1), m) },
        { t: cal(x2, x1, y2, y1, '−'), ok: feq(val(x2 - x1, y2 - y1), m) },
        { t: I('(' + ng(y2) + ' − ' + par(y1) + ') ÷ (' + ng(x1) + ' − ' + par(x2) + ')'), ok: feq(val(y2 - y1, x1 - x2), m) },
        { t: cal(y2, y1, x2, x1, '+'), ok: feq(val(y2 + y1, x2 + x1), m) }
      ]);
      if (!why) return null; parts.push(why);
    }
    return { stem: 'A line passes through ' + I(pt(x1, y1)) + ' and ' + I(pt(x2, y2)) + '.', fig: null, exp: [0, 45, 55, 95][d], parts: parts,
      verify: function () { return m[0] * (x2 - x1) === (y2 - y1) * m[1]; },
      work: ['m = (' + ng(y2) + ' − ' + par(y1) + ') ÷ (' + ng(x2) + ' − ' + par(x1) + ') = ' + ng(y2 - y1) + '/' + ng(x2 - x1) + ' = ' + fs(m)] };
  };

  G.s2 = function (R, d) {
    var step, per, x0, y0, xs = [], ys = [], i, m;
    if (d === 4) {   // one row was copied wrongly: find it, then the slope
      step = R.pick([1, 2, 3]); per = R.nz(-5, 5); x0 = R.i(-3, 2); y0 = R.i(-8, 8);
      var bad = R.i(0, 4), off = R.pick([-2, -1, 1, 2]);
      for (i = 0; i < 5; i++) { xs.push(x0 + i * step); ys.push(y0 + i * per + (i === bad ? off : 0)); }
      m = F(per, step);
      var collinear = function (skip) { var px = [], py = []; xs.forEach(function (x, k) { if (k !== skip) { px.push(x); py.push(ys[k]); } }); var L = through(px[0], py[0], px[1], py[1]); return px.every(function (x, k) { return onLine(L, x, py[k]); }); };
      return { stem: 'This table was meant to show a linear function, but one row was copied wrongly.', fig: { t: 'table', head: ['x', 'y'], rows: xs.map(function (x, k) { return [ng(x), ng(ys[k])]; }) }, exp: 130,
        parts: [{ kind: 'row', q: 'Tap the row that does not fit the pattern.', ans: bad, n: 5 }, numPart('What is the slope of the correct linear function?', ['m ='], [m])],
        verify: function () { for (var k = 0; k < 5; k++) if (collinear(k) !== (k === bad)) return false; return true; },
        work: ['Every correct row changes y by ' + ng(per) + ' when x changes by ' + step + ', so m = ' + fs(m) + '. Row ' + (bad + 1) + ' breaks the pattern (y should be ' + ng(y0 + bad * per) + ').'] };
    }
    if (d === 1) { step = 1; per = R.i(1, 5); x0 = R.i(0, 3); y0 = R.i(0, 9); }
    else if (d === 2) { step = R.pick([2, 3]); per = step * R.nz(-4, 4); x0 = R.i(-3, 2); y0 = R.i(-8, 10); }
    else { step = R.pick([2, 3, 4, 5]); per = R.nz(-7, 7); if (per % step === 0) per += per > 0 ? 1 : -1; x0 = R.i(-3, 2); y0 = R.i(-8, 10); }
    for (i = 0; i < 4; i++) { xs.push(x0 + i * step); ys.push(y0 + i * per); }
    m = F(per, step);
    return { stem: 'The table shows a linear function.', fig: { t: 'table', head: ['x', 'y'], rows: xs.map(function (x, k) { return [ng(x), ng(ys[k])]; }) }, exp: [0, 40, 55, 70][d],
      parts: [numPart('Find the slope. Check how much x changes from row to row.', ['m ='], [m])],
      verify: function () { return xs.every(function (x, k) { return !k || feq(F(ys[k] - ys[0], x - xs[0]), m); }); },
      work: ['From one row to the next y changes by ' + ng(per) + ' and x changes by ' + step + ': m = ' + ng(per) + '/' + step + ' = ' + fs(m)] };
  };

  G.s3 = function (R, d) {
    var m, k, s, x1, y1, x2, y2, L;
    if (d === 3 && R.f() < .5) {   // build a slope: tap B so that AB has the given slope
      m = frac(R, [2, 3], 3); s = seg(R, m[1], m[0], 6); if (!s) return null;
      var A = { x: s.x, y: s.y };
      return { stem: 'Point A is marked on the grid.', fig: { t: 'graph', pts: [{ x: A.x, y: A.y, label: 'A' }] }, exp: 85,
        parts: [{ kind: 'point', q: 'Tap a point B so that the line through A and B has slope ' + I(fs(m)) + '.', ok: function (x, y) { return x !== A.x && feq(F(y - A.y, x - A.x), m); }, key: { x: A.x + m[1], y: A.y + m[0] } }],
        verify: function () { return feq(F(m[0], m[1]), m) && Math.abs(A.x + m[1]) <= 8 && Math.abs(A.y + m[0]) <= 8; },
        work: ['Slope ' + fs(m) + ' means ' + (m[0] > 0 ? 'up ' : 'down ') + Math.abs(m[0]) + ' for every ' + m[1] + ' to the right. From A ' + pt(A.x, A.y) + ' that lands on ' + pt(A.x + m[1], A.y + m[0]) + ' (any point on that line works).'] };
    }
    if (d === 1) { m = F(R.i(1, 3)); k = R.pick([1, 2]); }
    else if (d === 2) { m = R.f() < .5 ? F(-R.i(1, 3)) : F(1, R.pick([2, 3])); k = R.pick([1, 2]); }
    else if (d === 3) { m = frac(R, [2, 3, 4, 5], 5); k = R.pick([1, 2]); }
    else { m = frac(R, [2, 3, 4], 5); k = 1; }
    s = seg(R, m[1] * k, m[0] * k); if (!s) { k = 1; s = seg(R, m[1], m[0]); } if (!s) return null;
    x1 = s.x; y1 = s.y; x2 = x1 + m[1] * k; y2 = y1 + m[0] * k; L = through(x1, y1, x2, y2);
    return { stem: d === 4 ? 'A line is drawn on the grid. No points are marked: find two places where the line crosses grid corners exactly.' : 'A line passes through the marked points A and B. Read their positions from the grid.',
      fig: { t: 'graph', lines: [L], pts: d === 4 ? [] : [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }] }, exp: [0, 45, 55, 75, 100][d],
      parts: [numPart('Find the slope of the line. Simplify fractions.', ['m ='], [m])],
      verify: function () { return onLine(L, x1, y1) && onLine(L, x2, y2) && feq(L.m, m) && Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2)) <= 7; },
      work: ['Through ' + pt(x1, y1) + ' and ' + pt(x2, y2) + ': rise ' + ng(y2 - y1) + ', run ' + (x2 - x1) + ', so m = ' + fs(m)] };
  };

  G.s4 = function (R, d) {
    var m, b, eq, A, B, C, k, a, c;
    if (d === 4 && R.f() < .5) {   // order four lines, written in different forms, by slope
      var pool = R.shuffle([F(-3), F(-2), F(-1), F(-1, 2), F(1, 2), F(1), F(2), F(3), F(3, 2), F(-3, 2), F(1, 3), F(-2, 3)]).slice(0, 4), forms = R.shuffle([0, 1, 2, 3]);
      var lines = pool.map(function (mm, i) {
        var f = forms[i], bb = R.nz(-6, 6);
        if (f === 0) return { t: lineEq(mm, bb), m: mm };
        if (f === 1) return { t: 'y = ' + ng(bb) + co(mm, 'x', false), m: mm };
        if (f === 2) { var kk = mm[1] * (mm[1] === 1 ? R.pick([2, 3]) : R.pick([1, 2])), aa = mm[0] * kk / mm[1], cc = kk * R.i(-3, 3); return { t: kk + 'y = ' + co(aa, 'x', true) + co(cc, '', false), m: F(aa, kk) }; }
        var Bq = mm[1] * R.pick([1, -1]), Aq = -mm[0] * Bq / mm[1], Cq = R.i(-9, 9); if (Aq < 0) { Aq = -Aq; Bq = -Bq; Cq = -Cq; }
        return { t: stdEq(Aq, Bq, Cq), m: F(-Aq, Bq) };
      });
      var ans = [0, 1, 2, 3].sort(function (p, q) { return fv(lines[p].m) - fv(lines[q].m); });
      if (ans.join() === '0,1,2,3') return null;
      return { stem: 'Four lines are written in different forms.', fig: null, exp: 150,
        parts: [{ kind: 'order', q: 'Put them in order from the SMALLEST slope (top) to the LARGEST slope (bottom). Use the arrows.', lines: lines.map(function (l) { return l.t; }), ans: ans }],
        verify: function () { for (var i = 1; i < 4; i++) if (!(fv(lines[ans[i - 1]].m) < fv(lines[ans[i]].m))) return false; return lines.every(function (l, i) { return feq(l.m, pool[i]); }); },
        work: ['Slopes: ' + lines.map(function (l) { return l.t + ' → ' + fs(l.m); }).join(';  ') + '. Smallest to largest: ' + ans.map(function (i) { return fs(lines[i].m); }).join(', ') + '.'] };
    }
    if (d === 1) { m = F(R.nz(-6, 6)); if (Math.abs(m[0]) === 1) m = F(m[0] * 2); b = R.nz(-9, 9); eq = lineEq(m, b); }
    else if (d === 2) {
      var v = R.i(0, 2); b = R.nz(-9, 9);
      if (v === 0) { m = F(-R.i(2, 6)); eq = 'y = ' + ng(b) + co(m, 'x', false); }
      else if (v === 1) { m = frac(R, [2, 3, 4], 5); eq = lineEq(m, b); }
      else { m = F(-1); eq = 'y = ' + ng(b) + ' − x'; }
    } else if (d === 3) {
      if (R.f() < .5) { k = R.pick([2, 3, 4, 5]); a = R.nz(-12, 12); c = R.i(-12, 12); m = F(a, k); eq = k + 'y = ' + co(a, 'x', true) + co(c, '', false); }
      else { A = R.i(1, 7); B = R.i(1, 6); C = R.i(-12, 12); m = F(-A, B); eq = stdEq(A, B, C); }
    } else { A = R.i(2, 7); B = -R.i(2, 6); if (A % B === 0) A += 1; C = R.i(-12, 12); m = F(-A, B); eq = stdEq(A, B, C); }
    return { stem: 'Look at the line ' + I(eq) + '.', fig: null, exp: [0, 30, 40, 70, 85][d],
      parts: [numPart('What is its slope?', ['m ='], [m])],
      verify: function () {   // two points that satisfy the displayed equation must give the slope
        if (A != null) { return A * m[1] + B * m[0] === 0; }
        if (k != null) return feq(F(a, k), m);
        return eq.indexOf('x') > 0 && m[0] !== 0;
      },
      work: [A != null ? 'Solve for y: ' + co(B, 'y', true) + ' = ' + co(-A, 'x', true) + co(C, '', false) + ', then divide by ' + ng(B) + ': m = ' + fs(m) : k != null ? 'Divide every term by ' + k + ': m = ' + ng(a) + '/' + k + ' = ' + fs(m) : 'The slope is the number multiplying x, with its sign: m = ' + fs(m)] };
  };

  G.f1 = function (R, d) {
    var A, B, C, m, b;
    if (d === 1) {
      A = R.i(2, 6); B = 1; C = R.nz(-9, 9); m = F(-A); b = F(C);
      var p1 = mcPart(R, 'Which equation is the same line in slope-intercept form?', [eqOpt(m, b, m, b), eqOpt(F(A), b, m, b), eqOpt(m, F(-C), m, b), eqOpt(F(C), F(-A), m, b), eqOpt(F(A), F(-C), m, b)]);
      if (!p1) return null;
      return { stem: 'A line is written in standard form: ' + I(stdEq(A, B, C)) + '.', fig: null, exp: 45, parts: [p1],
        verify: function () { return stdIs(A, B, C, m, b); }, work: ['Subtract ' + A + 'x from both sides: ' + lineEq(m, b)] };
    }
    if (d === 2) { var m0 = R.nz(-4, 4), b0 = R.i(-6, 6); B = R.pick([2, 3, -1, -2]); A = -m0 * B; C = b0 * B; if (A < 0) { A = -A; B = -B; C = -C; } }
    else { A = R.i(1, 6); B = R.pick([2, 3, 4, 5, -2, -3, -4]); C = R.i(-12, 12); if (A % B === 0 && C % B === 0) C += 1; }
    m = F(-A, B); b = F(C, B);
    var work = ['Subtract ' + A + 'x: ' + co(B, 'y', true) + ' = ' + co(-A, 'x', true) + co(C, '', false) + '. Divide every term by ' + ng(B) + ': ' + lineEq(m, b)];
    if (d === 4) {
      var shown = R.f() < .5 ? co(A, 'x', true) + co(B, 'y', false) + co(-C, '', false) + ' = 0' : co(A, 'x', true) + ' = ' + (co(-B, 'y', true) + co(C, '', false));
      var p4 = mcPart(R, 'Which equation is the same line in slope-intercept form?', [eqOpt(m, b, m, b), eqOpt(F(A, B), b, m, b), eqOpt(m, F(C), m, b), eqOpt(m, F(-C, B), m, b), eqOpt(F(-B, A), b, m, b), eqOpt(F(A, B), F(-C, B), m, b)]);
      if (!p4) return null;
      return { stem: 'A line is written as ' + I(shown) + '.', fig: null, exp: 120, parts: [p4], verify: function () { return stdIs(A, B, C, m, b); }, work: ['Rearrange to ' + stdEq(A, B, C) + '. ' + work[0]] };
    }
    return { stem: 'Write ' + I(stdEq(A, B, C)) + ' in slope-intercept form, ' + I('y = mx + b') + '.', fig: null, exp: d === 2 ? 75 : 100,
      parts: [numPart('Type the slope and the y-intercept.', ['m =', 'b ='], [m, b])], verify: function () { return stdIs(A, B, C, m, b); }, work: work };
  };

  G.f2 = function (R, d) {
    var m, b, A, B, C, p, q;
    function norm() { var g = gcd(gcd(A, B), C || A); A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; } }
    if (d === 1) {
      m = F(R.nz(-5, 5)); b = F(R.nz(-9, 9)); A = -m[0]; B = 1; C = b[0]; norm();
      var p1 = mcPart(R, 'Which equation is the same line in standard form?', [stdOpt(A, B, C, m, b), stdOpt(A, -B, C, m, b), stdOpt(A, B, -C, m, b), stdOpt(Math.abs(C), B, A, m, b), stdOpt(A, -B, -C, m, b)]);
      if (!p1) return null;
      return { stem: 'A line is written in slope-intercept form: ' + I(lineEq(m, b)) + '.', fig: null, exp: 50, parts: [p1],
        verify: function () { return stdIs(A, B, C, m, b); }, work: ['Move the x-term to the left (and make A positive): ' + stdEq(A, B, C)] };
    }
    if (d === 2) {   // put a correct derivation back in order
      q = R.pick([2, 3, 4]); do p = R.i(1, 5); while (gcd(p, q) !== 1); var bi = R.nz(-5, 5); m = F(p, q); b = F(bi);
      var steps = [lineEq(m, b), q + 'y = ' + co(p, 'x', true) + co(q * bi, '', false), co(-p, 'x', true) + ' + ' + q + 'y = ' + ng(q * bi), stdEq(p, -q, -q * bi)];
      var order = R.shuffle([0, 1, 2, 3]); if (order.join() === '0,1,2,3') order = [2, 0, 3, 1];
      var ans = [0, 1, 2, 3].map(function (s) { return order.indexOf(s); });
      return { stem: 'Marta rewrote a line from slope-intercept form into standard form, ' + I('Ax + By = C') + '. Her four lines of working got mixed up.', fig: null, exp: 100,
        parts: [{ kind: 'order', q: 'Put the lines in order, from her FIRST line (top) to her LAST line (bottom). Use the arrows.', lines: order.map(function (s) { return steps[s]; }), ans: ans }],
        verify: function () { return stdIs(-p, q, q * bi, m, b) && stdIs(p, -q, -q * bi, m, b) && ans.map(function (i) { return order[i]; }).join() === '0,1,2,3'; },
        work: ['Start: ' + steps[0] + '. Multiply every term by ' + q + ': ' + steps[1] + '. Move the x-term left: ' + steps[2] + '. Multiply by −1 so A is positive: ' + steps[3] + '.'] };
    }
    if (d === 3) { m = frac(R, [2, 3, 4, 5], 5); b = F(R.i(-6, 6)); A = -m[0]; B = m[1]; C = b[0] * m[1]; }
    else { m = frac(R, [2, 3, 4], 5); var s; do { s = R.pick([2, 3, 5]); } while (s === m[1]); var r; do r = R.nz(-7, 7); while (gcd(r, s) !== 1); b = F(r, s); var Lc = m[1] * s / gcd(m[1], s); A = -m[0] * Lc / m[1]; B = Lc; C = r * Lc / s; }
    norm();
    var A0 = A, B0 = B, C0 = C;
    return { stem: 'Write ' + I(lineEq(m, b)) + ' in standard form, ' + I('Ax + By = C') + ', with whole numbers and A positive.', fig: null, exp: d === 3 ? 110 : 140,
      parts: [numPart('Type A, B and C.', ['A =', 'B =', 'C ='], [F(A0), F(B0), F(C0)], function (v) { if (v.some(function (f) { return f[1] !== 1; }) || v[0][0] <= 0) return false; var kk = v[0][0] / A0; return v[1][0] === kk * B0 && v[2][0] === kk * C0; })],
      verify: function () { return stdIs(A0, B0, C0, m, b) && A0 > 0; },
      work: ['Multiply every term by the denominator(s), move the x-term left, make A positive: ' + stdEq(A0, B0, C0) + ' (any whole-number multiple is also right).'] };
  };

  G.b1 = function (R, d) {
    var m, b, x1, y1, x2, y2, xs, ys, i;
    if (d === 1) {
      m = R.nz(-3, 4); x1 = R.i(1, 5); b = R.i(-8, 8); y1 = m * x1 + b;
      return { stem: 'A line has slope ' + I(ng(m)) + ' and passes through ' + I(pt(x1, y1)) + '.', fig: null, exp: 70,
        parts: [numPart('Find b, the y-intercept. (Put the point into y = mx + b.)', ['b ='], [F(b)])],
        verify: function () { return m * x1 + b === y1; }, work: [ng(y1) + ' = ' + ng(m) + '(' + x1 + ') + b, so b = ' + ng(y1) + ' − ' + par(m * x1) + ' = ' + ng(b)] };
    }
    if (d === 2) {
      m = R.nz(-4, 4); b = R.i(-8, 8); var x0 = R.i(1, 3); xs = []; ys = [];
      for (i = 0; i < 4; i++) { xs.push(x0 + i); ys.push(m * (x0 + i) + b); }
      return { stem: 'This table shows a linear function, but the row for x = 0 is missing.', fig: { t: 'table', head: ['x', 'y'], rows: xs.map(function (x, k) { return [ng(x), ng(ys[k])]; }) }, exp: 95,
        parts: [numPart('Find the slope m and the y-intercept b.', ['m =', 'b ='], [F(m), F(b)])],
        verify: function () { return xs.every(function (x, k) { return m * x + b === ys[k]; }); },
        work: ['m = ' + ng(ys[1] - ys[0]) + '/1 = ' + ng(m) + '. Step back from x = ' + x0 + ' to x = 0: b = ' + ng(ys[0]) + ' − ' + par(m * x0) + ' = ' + ng(b)] };
    }
    if (d === 3) {   // two marked points, no line drawn: tap where the line crosses the y-axis, then choose its equation
      var mf = R.pick([F(-3), F(-2), F(-1), F(1), F(2), F(3), F(1, 2), F(-1, 2), F(3, 2), F(-3, 2)]), bi = R.i(-6, 6), side = R.pick([1, -1]), cand = [];
      for (i = 1; i <= 7; i++) { var yy = fadd(fmul(mf, F(i * side)), F(bi)); if (yy[1] === 1 && Math.abs(yy[0]) <= 7) cand.push({ x: i * side, y: yy[0] }); }
      if (cand.length < 2) return null;
      cand = R.shuffle(cand).slice(0, 2).sort(function (p, q) { return p.x - q.x; });
      var Lm = through(cand[0].x, cand[0].y, cand[1].x, cand[1].y), bf = F(bi);
      var p2 = mcPart(R, 'Which equation is the line through A and B?', [eqOpt(mf, bf, mf, bf), eqOpt(mf, F(cand[0].y), mf, bf), eqOpt(F(-mf[0], mf[1]), bf, mf, bf), eqOpt(mf, F(-bi || 1), mf, bf), eqOpt(F(bi || 1), mf, mf, bf)]);
      if (!p2) return null;
      return { stem: 'A straight line passes through the marked points A and B. The line itself is not drawn.', fig: { t: 'graph', pts: [{ x: cand[0].x, y: cand[0].y, label: 'A' }, { x: cand[1].x, y: cand[1].y, label: 'B' }] }, exp: 130,
        parts: [{ kind: 'point', q: 'Tap the exact point where the line crosses the y-axis.', ok: function (x, y) { return x === 0 && y === bi; }, key: { x: 0, y: bi } }, p2],
        verify: function () { return feq(Lm.m, mf) && feq(Lm.b, bf) && onLine(Lm, 0, bi); },
        work: ['Slope from A ' + pt(cand[0].x, cand[0].y) + ' to B ' + pt(cand[1].x, cand[1].y) + ': m = ' + fs(mf) + '. b = ' + ng(cand[0].y) + ' − (' + fs(mf) + ')(' + ng(cand[0].x) + ') = ' + ng(bi) + ', so the line crosses at (0, ' + ng(bi) + '): ' + lineEq(mf, bf)] };
    }
    var q = R.pick([2, 3]), p, r; do p = R.nz(-4, 4); while (gcd(p, q) !== 1); do r = R.nz(-9, 9); while (r % q === 0);
    var okx = []; for (i = -7; i <= 7; i++) if (i && (p * i + r) % q === 0 && Math.abs((p * i + r) / q) <= 12) okx.push(i);
    if (okx.length < 2) return null;
    okx = R.shuffle(okx).slice(0, 2); x1 = okx[0]; x2 = okx[1]; y1 = (p * x1 + r) / q; y2 = (p * x2 + r) / q;
    return { stem: 'A line passes through ' + I(pt(x1, y1)) + ' and ' + I(pt(x2, y2)) + '. It crosses the y-axis between whole numbers.', fig: null, exp: 150,
      parts: [numPart('Find b, the y-intercept, as a fraction.', ['b ='], [F(r, q)])],
      verify: function () { var L = through(x1, y1, x2, y2); return feq(L.b, F(r, q)) && feq(L.m, F(p, q)); },
      work: ['m = ' + ng(y2 - y1) + '/' + ng(x2 - x1) + ' = ' + fs(F(p, q)) + '. b = ' + ng(y1) + ' − (' + fs(F(p, q)) + ')(' + ng(x1) + ') = ' + fs(F(r, q))] };
  };

  G.r1 = function (R, d) {
    var s, c, k, T;
    if (d === 1) {
      s = story(R); c = s.c; var m = F(s.m), b = F(s.S);
      var p1 = mcPart(R, 'Which equation models the situation?', [eqOpt(m, b, m, b), eqOpt(b, m, m, b), eqOpt(F(-s.m), b, m, b), eqOpt(F(s.m + s.S), F(0), m, b)]);
      if (!p1) return null;
      return { stem: s.text + s.lets, fig: null, exp: 60, parts: [p1], verify: function () { return s.m === c.dir * s.R && s.S > 0; }, work: ['Start ' + s.S + ' (that is b), changes by ' + ng(s.m) + ' each ' + c.x + ' (that is m): ' + lineEq(m, b)] };
    }
    if (d === 2 || d === 3) {
      s = story(R, d === 2 ? 1 : -1); c = s.c;
      var hi = d === 2 ? 12 : Math.min(12, Math.floor((s.S - 1) / s.R)); if (hi < 2) return null;
      k = R.i(2, hi); T = s.S + s.m * k;
      return { stem: s.text + s.lets, fig: null, exp: d === 2 ? 90 : 105,
        parts: [numPart('After how many ' + c.xs + ' is the ' + c.y + ' ' + I(s.val(T)) + '?', ['x ='], [F(k)])],
        verify: function () { return s.S + s.m * k === T && T > 0; },
        work: [lineEq(F(s.m), F(s.S)) + '. Set y = ' + T + ': ' + T + ' − ' + s.S + ' = ' + ng(T - s.S) + ', then ÷ ' + par(s.m) + ' gives x = ' + k] };
    }
    s = story(R); c = s.c;
    var a = R.i(1, 3), e = a + R.i(2, 4), va = s.S + s.m * a, vb = s.S + s.m * e;
    var top = c.dir > 0 ? 14 : Math.min(14, Math.floor((s.S - 1) / s.R)); if (top <= e || va <= 0 || vb <= 0) return null;
    k = R.i(e + 1, top); T = s.S + s.m * k;
    return { stem: c.intro + ' After ' + I(String(a)) + ' ' + (a === 1 ? c.x : c.xs) + ' the ' + c.y + ' is ' + I(s.val(va)) + '. After ' + I(String(e)) + ' ' + c.xs + ' it is ' + I(s.val(vb)) + '.', fig: null, exp: 170,
      parts: [numPart('What was the ' + c.y + ' at the start (0 ' + c.xs + '), and after how many ' + c.xs + ' from the start will it be ' + I(s.val(T)) + '? Numbers only.', ['start =', 'x ='], [F(s.S), F(k)])],
      verify: function () { return feq(F(vb - va, e - a), F(s.m)) && va - s.m * a === s.S && s.S + s.m * k === T && T > 0; },
      work: ['m = (' + vb + ' − ' + va + ') ÷ (' + e + ' − ' + a + ') = ' + ng(s.m) + '. b = ' + va + ' − ' + par(s.m * a) + ' = ' + s.S + '. Then ' + T + ' = ' + ng(s.m) + 'x + ' + s.S + ' gives x = ' + k] };
  };

  G.r2 = function (R, d) {
    var m, b, eq;
    if (d === 1) {
      m = F(R.nz(-4, 4)); b = R.nz(-6, 6);
      return { stem: 'Look at the line ' + I(lineEq(m, b)) + '.', fig: null, exp: 45,
        parts: [{ kind: 'point', q: 'Tap the point where this line crosses the y-axis (its y-intercept).', ok: function (x, y) { return x === 0 && y === b; }, key: { x: 0, y: b } }],
        verify: function () { return onLine({ m: m, b: F(b) }, 0, b); }, work: ['b = ' + ng(b) + ', so the y-intercept is (0, ' + ng(b) + ').'] };
    }
    if (d === 2) { m = F(R.nz(-3, 3)); b = R.i(-4, 4); eq = lineEq(m, b); }
    else if (d === 3) { m = frac(R, [2, 3], 3); b = R.i(-4, 4); eq = lineEq(m, b); }
    else { m = R.f() < .5 ? F(R.nz(-3, 3)) : frac(R, [2, 3], 3); b = R.nz(-4, 4); var B = m[1] * R.pick([1, -1, 2]), A = -m[0] * B / m[1], C = b * B; if (A < 0) { A = -A; B = -B; C = -C; } eq = stdEq(A, B, C); if (!stdIs(A, B, C, m, F(b))) return null; }
    var L = { m: m, b: F(b) }, key = [{ x: 0, y: b }, { x: m[1], y: b + m[0] }];
    if (Math.abs(key[1].y) > 8) key[1] = { x: -m[1], y: b - m[0] };
    if (Math.abs(key[1].y) > 8) return null;
    return { stem: 'Graph the line ' + I(eq) + '.', fig: null, exp: [0, 0, 80, 100, 140][d],
      parts: [{ kind: 'line', q: 'Tap two grid points that are on the line. A line is drawn through your two points.', line: L, key: key }],
      verify: function () { return onLine(L, key[0].x, key[0].y) && onLine(L, key[1].x, key[1].y); },
      work: [(d === 4 ? 'Solve for y: ' + lineEq(m, b) + '. ' : '') + 'Start at (0, ' + ng(b) + '), then ' + (m[0] > 0 ? 'up ' : 'down ') + Math.abs(m[0]) + ' and right ' + m[1] + ' to ' + pt(m[1], b + m[0]) + '.'] };
  };

  function evalOp(l, op, r) { return op === '<' ? l < r : op === '≤' ? l <= r : op === '>' ? l > r : l >= r; }
  G.r3 = function (R, d) {
    var S, Rt, n, rem, Bq, sym, txt, ask, op, m, b;
    if (d === 1 || d === 3) {
      var fair = R.f() < .5;
      if (fair) { S = R.pick([5, 8, 10, 12, 15]); Rt = R.pick([2, 3, 4, 5, 6]); n = R.i(4, 12); rem = d === 3 ? R.i(1, Rt - 1) : 0; Bq = S + Rt * n + rem; sym = '≤';
        txt = 'You have ' + I('$' + Bq) + ' to spend at the Sandy Flats fair. Entry costs ' + I('$' + S) + ' and each ride costs ' + I('$' + Rt) + '. Let x be the number of rides.'; ask = 'What is the greatest number of rides you can take?'; }
      else { S = R.pick([10, 20, 25, 40]); Rt = R.pick([5, 6, 8, 12, 15]); n = R.i(4, 12); rem = d === 3 ? R.i(1, Rt - 1) : 0; Bq = S + Rt * n - rem; sym = '≥';
        txt = 'You need at least ' + I(Bq + ' points') + ' to unlock the next floor. You already have ' + I(S + ' points') + ' and earn ' + I(Rt + ' points') + ' for every puzzle. Let x be the number of puzzles.'; ask = 'What is the least number of puzzles you must solve?'; }
      if (d === 1) {
        var e = function (o) { return { t: I(S + ' + ' + Rt + 'x ' + o + ' ' + Bq), ok: o === sym }; };
        var p1 = mcPart(R, 'Which inequality models the situation?', [e('≤'), e('≥'), e('<'), e('>')]);
        return { stem: txt, fig: null, exp: 60, parts: [p1], verify: function () { return evalOp(S + Rt * n, sym, Bq) && !evalOp(S + Rt * (sym === '≤' ? n + 1 : n - 1), sym, Bq); }, work: [(sym === '≤' ? 'You can spend up to and including the total' : '"At least" means that many or more') + ': ' + S + ' + ' + Rt + 'x ' + sym + ' ' + Bq] };
      }
      return { stem: txt, fig: null, exp: 120, parts: [numPart(ask + ' (a whole number)', ['x ='], [F(n)])],
        verify: function () { return evalOp(S + Rt * n, sym, Bq) && !evalOp(S + Rt * (sym === '≤' ? n + 1 : n - 1), sym, Bq); },
        work: [S + ' + ' + Rt + 'x ' + sym + ' ' + Bq + ' → x ' + sym + ' ' + fs(F(Bq - S, Rt)) + ' ≈ ' + ((Bq - S) / Rt).toFixed(2) + ', so round ' + (sym === '≤' ? 'down' : 'up') + ' to ' + n] };
    }
    op = R.pick(['<', '≤', '>', '≥']);
    var shown, test;
    if (d === 2) { m = F(R.nz(-3, 3)); b = R.nz(-4, 4); shown = 'y ' + op + ' ' + (co(m, 'x', true) + co(b, '', false)); test = function (x, y) { return evalOp(y, op, fv(m) * x + b); }; }
    else {   // y has a negative coefficient: dividing by it flips the symbol
      var k = R.pick([2, 3]); m = R.f() < .6 ? F(R.nz(-3, 3)) : F(R.pick([-3, -1, 1, 3]), 2); b = R.nz(-3, 3);
      var a = -k * m[0] / m[1], c = -k * b; if (!Number.isInteger(a)) { k = 2; a = -k * m[0] / m[1]; c = -k * b; }
      shown = '−' + k + 'y ' + op + ' ' + (co(a, 'x', true) + co(c, '', false)); test = function (x, y) { return evalOp(-k * y, op, a * x + c); };
    }
    var solid = op === '≤' || op === '≥', above = test(0, b + 1);
    return { stem: 'Graph the inequality ' + I(shown) + '. Its boundary line is drawn in grey.', fig: null, exp: d === 2 ? 75 : 130,
      parts: [{ kind: 'ineq', q: 'Choose the style of the boundary line and the side to shade.', line: { m: m, b: F(b) }, ans: { solid: solid, above: above } }],
      verify: function () { return test(0, b + 1) !== test(0, b - 1) && test(0, b) === solid && test(0, b + 1) === above && test(1, fv(m) + b + 1) === above; },
      work: [(d === 4 ? 'Divide by the negative number and flip the symbol: y ' + ({ '<': '>', '≤': '≥', '>': '<', '≥': '≤' })[op] + ' ' + (co(m, 'x', true) + co(b, '', false)) + '. ' : '') + (solid ? 'Solid' : 'Dashed') + ' line (' + (solid ? 'includes' : 'does not include') + ' "or equal to"), shade ' + (above ? 'above' : 'below') + '.'] };
  };

  G.r4 = function (R, d) {
    var m, b, xs = [], ys = [], i, p;
    if (d === 1 || d === 3) {
      if (d === 1) { m = F(R.nz(-4, 4)); b = F(R.i(-5, 5)); for (i = 0; i < 4; i++) xs.push(i); }
      else { m = R.f() < .5 ? F(R.nz(-4, 4)) : F(R.pick([-3, -1, 1, 3]), 2); b = F(R.i(-5, 5)); var x0 = R.pick([2, 4]); for (i = 0; i < 4; i++) xs.push(x0 + 2 * i); }
      ys = xs.map(function (x) { return fv(m) * x + fv(b); });
      p = mcPart(R, 'Which equation matches the table?', [eqOpt(m, b, m, b), eqOpt(b[0] ? b : F(1), m, m, b), eqOpt(F(-m[0], m[1]), b, m, b), eqOpt(m, F(ys[0]), m, b), eqOpt(F(m[1] * 2 * (m[0] > 0 ? 1 : -1) * Math.abs(m[0]), m[1] * m[1]), b, m, b), eqOpt(m, F(-b[0] || 2), m, b)]);
      if (!p) return null;
      return { stem: 'The table shows a linear function.' + (d === 3 ? ' Notice that x = 0 is not in the table and x does not go up by 1.' : ''), fig: { t: 'table', head: ['x', 'y'], rows: xs.map(function (x, k) { return [ng(x), ng(ys[k])]; }) }, exp: d === 1 ? 60 : 110, parts: [p],
        verify: function () { return xs.every(function (x, k) { return Number.isInteger(ys[k]) && onLine({ m: m, b: b }, x, ys[k]); }); },
        work: ['Slope: y changes by ' + ng(ys[1] - ys[0]) + ' when x changes by ' + (xs[1] - xs[0]) + ', m = ' + fs(m) + '. When x = 0, y = ' + fs(b) + ': ' + lineEq(m, b)] };
    }
    if (d === 2) {   // equation to graph: four small graphs
      m = F(R.nz(-3, 3)); b = F(R.nz(-4, 4));
      var g = function (mm, bb) { return { g: { m: mm, b: bb }, ok: feq(mm, m) && feq(bb, b) }; };
      p = mcPart(R, 'Tap the graph of this line.', [g(m, b), g(F(-m[0]), b), g(m, F(-b[0])), g(F(-m[0]), F(-b[0]))]);
      if (!p) return null;
      return { stem: 'Look at the equation ' + I(lineEq(m, b)) + '.', fig: null, exp: 70, parts: [p], verify: function () { return p.opts[p.ans].g.m[0] === m[0] && p.opts[p.ans].g.b[0] === b[0]; },
        work: ['It crosses the y-axis at ' + fs(b) + ' and goes ' + (m[0] > 0 ? 'up' : 'down') + ' ' + Math.abs(m[0]) + ' for each 1 to the right.'] };
    }
    m = R.f() < .5 ? F(R.nz(-3, 3)) : frac(R, [2, 3], 3); b = F(R.nz(-4, 4));
    if (Math.abs(b[0] + m[0]) > 7) return null;
    var B = m[1] * (m[0] > 0 ? -1 : 1), A = -m[0] * B / m[1], C = b[0] * B;
    p = mcPart(R, 'Which equation matches the graph?', [stdOpt(A, B, C, m, b), stdOpt(A, -B, C, m, b), stdOpt(A, B, -C, m, b), stdOpt(Math.abs(B), A * (B < 0 ? -1 : 1), C, m, b), eqOpt(F(-m[0], m[1]), b, m, b)]);
    if (!p) return null;
    return { stem: 'A line is drawn on the grid.', fig: { t: 'graph', lines: [{ m: m, b: b }], pts: [{ x: 0, y: b[0] }, { x: m[1], y: b[0] + m[0] }] }, exp: 130, parts: [p],
      verify: function () { return stdIs(A, B, C, m, b) && A > 0; }, work: ['From the graph m = ' + fs(m) + ' and b = ' + fs(b) + ', so ' + lineEq(m, b) + ', which rearranges to ' + stdEq(A, B, C)] };
  };

  G.e1 = function (R, d) {
    var s, c, up, eq, p, parts;
    if (d === 4) {   // compare two models
      var m1 = R.pick([10, 15, 20]), dm = R.pick([5, 10]), xs = R.i(2, 8), db = dm * xs, b2 = R.pick([10, 20, 30]), b1 = b2 + db, m2 = m1 + dm, wrongX = xs + R.pick([1, 2, -1]);
      if (wrongX < 1) wrongX = xs + 2;
      p = mcPart(R, 'Which statement is true?', [
        { t: 'Gym B starts ' + I('$' + db) + ' cheaper but costs ' + I('$' + dm) + ' more each month, so the two gyms cost the same after ' + I(xs + ' months') + '.', ok: b1 + m1 * xs === b2 + m2 * xs },
        { t: 'Gym B starts ' + I('$' + db) + ' cheaper but costs ' + I('$' + dm) + ' more each month, so the two gyms cost the same after ' + I(wrongX + ' months') + '.', ok: b1 + m1 * wrongX === b2 + m2 * wrongX },
        { t: 'Gym B is always cheaper, because its sign-up fee is lower.', ok: false },
        { t: 'Gym A is always cheaper, because its monthly price is lower.', ok: false }
      ]);
      if (!p) return null;
      return { stem: 'Two climbing gyms each charge a sign-up fee plus a monthly price. x is the number of months and y is the total cost in dollars. Gym A: ' + I(lineEq(m1, b1)) + '. Gym B: ' + I(lineEq(m2, b2)) + '.', fig: null, exp: 150, parts: [p],
        verify: function () { return b1 + m1 * xs === b2 + m2 * xs && b2 < b1 && m2 > m1; },
        work: ['Fees differ by ' + db + ', monthly prices by ' + dm + ': ' + db + ' ÷ ' + dm + ' = ' + xs + ' months to catch up. Before that B is cheaper, after that A is.'] };
    }
    s = story(R, d === 3 ? -1 : 0); c = s.c; up = c.dir > 0; eq = lineEq(F(s.m), F(s.S));
    if (s.S === s.R) return null;   // the same number for the start and the rate would make two options read alike
    var stem = s.text + ' The equation ' + I(eq) + ' models it, where x is the number of ' + c.xs + ' and y is the ' + c.y + '.';
    var slopeQ = function () {
      return mcPart(R, 'What does the slope, ' + I(ng(s.m)) + ', tell you?', [
        { t: 'The ' + c.y + ' goes ' + (up ? 'up' : 'down') + ' by ' + I(s.val(s.R)) + ' every ' + c.x + '.', ok: true },
        { t: 'The ' + c.y + ' starts at ' + I(s.val(s.R)) + '.', ok: false },
        { t: 'The ' + c.y + ' goes ' + (up ? 'down' : 'up') + ' by ' + I(s.val(s.R)) + ' every ' + c.x + '.', ok: false },
        { t: 'After ' + I(String(s.R)) + ' ' + c.xs + ', the ' + c.y + ' is ' + I(s.val(s.S)) + '.', ok: false }]);
    };
    if (d === 1) {
      p = mcPart(R, 'What does the ' + I(String(s.S)) + ' in the equation tell you?', [
        { t: 'At the start (0 ' + c.xs + '), the ' + c.y + ' is ' + I(s.val(s.S)) + '.', ok: true },
        { t: 'The ' + c.y + ' changes by ' + I(s.val(s.S)) + ' every ' + c.x + '.', ok: false },
        { t: 'After 1 ' + c.x + ', the ' + c.y + ' is ' + I(s.val(s.S)) + '.', ok: false },
        { t: 'It takes ' + I(String(s.S)) + ' ' + c.xs + ' to finish.', ok: false }]);
      parts = [p];
    } else if (d === 2) parts = [slopeQ()];
    else {
      var N = R.i(3, Math.min(9, Math.floor((s.S - 1) / s.R))); if (!(N >= 3)) return null;
      var v = s.S + s.m * N;
      parts = [slopeQ(), numPart('Use the model: what is the ' + c.y + ' after ' + I(String(N)) + ' ' + c.xs + '? Number only.', ['y ='], [F(v)])];
      parts[1].chk = function () { return v === s.S + s.m * N && v > 0; }; parts[1].at = 'After ' + N + ' ' + c.xs + ': y = ' + ng(s.m) + '(' + N + ') + ' + s.S + ' = ' + v + '.';
    }
    if (parts.some(function (x) { return !x; })) return null;
    return { stem: stem, fig: null, exp: [0, 55, 60, 110][d], parts: parts,
      verify: function () { return s.S !== s.R && s.m === c.dir * s.R && (!parts[1] || parts[1].chk()); },
      work: [d === 1 ? 'The number on its own is the y-intercept: the value of y when x = 0, the starting ' + c.y + '.' : 'The slope is the rate of change: ' + s.val(s.R) + ' per ' + c.x + (up ? ', going up.' : ', going down (negative).') + (parts[1] ? ' ' + parts[1].at : '')] };
  };

  var REASONS = {
    flip: 'He divided the change in x by the change in y. Slope is change in y ÷ change in x.',
    neg: 'He subtracted a negative number wrongly. Subtracting a negative means adding.',
    order: 'He subtracted the x-values in the opposite order from the y-values.',
    part: 'He divided only the x-term. Every term, including the constant, must be divided.',
    sign: 'When he moved the x-term to the other side he did not change its sign.'
  };
  G.e2 = function (R, d) {
    var kind = d === 1 ? 'flip' : d === 2 ? R.pick(['neg', 'order']) : d === 3 ? R.pick(['part', 'sign']) : R.pick(['neg', 'order', 'part', 'sign']);
    var lines, wrong, fix, lab, stem, x1, y1, x2, y2, dx, dy, tries = 0;
    if (kind === 'flip' || kind === 'neg' || kind === 'order') {
      do { x1 = R.i(-5, 3); x2 = x1 + R.i(1, 5); y1 = kind === 'neg' ? R.i(-7, -1) : R.i(-6, 6); y2 = R.i(-6, 7); dy = y2 - y1; dx = x2 - x1; } while ((!dy || Math.abs(dy) === Math.abs(dx) || (kind === 'neg' && !(y2 + y1))) && ++tries < 60);
      if (!dy || Math.abs(dy) === Math.abs(dx) || (kind === 'neg' && !(y2 + y1))) return null;
      stem = 'Marcus found the slope of the line through ' + I(pt(x1, y1)) + ' and ' + I(pt(x2, y2)) + '. His working has one mistake.';
      var L1 = { t: 'Change in y = ' + ng(y2) + ' − ' + par(y1) + ' = ' + ng(dy), claim: F(dy), truth: F(dy) }, L2 = { t: 'Change in x = ' + ng(x2) + ' − ' + par(x1) + ' = ' + ng(dx), claim: F(dx), truth: F(dx) }, L3;
      if (kind === 'flip') { L3 = { t: 'm = ' + ng(dx) + '/' + ng(dy) + ' = ' + fs(F(dx, dy)), claim: F(dx, dy), truth: F(dy, dx) }; wrong = 2; }
      if (kind === 'order') { L2 = { t: 'Change in x = ' + ng(x1) + ' − ' + par(x2) + ' = ' + ng(-dx), claim: F(-dx), truth: F(dx) }; L3 = { t: 'm = ' + ng(dy) + '/' + ng(-dx) + ' = ' + fs(F(dy, -dx)), claim: F(dy, -dx), truth: F(dy, -dx) }; wrong = 1; }
      if (kind === 'neg') { var bad = y2 + y1; L1 = { t: 'Change in y = ' + ng(y2) + ' − ' + par(y1) + ' = ' + ng(bad), claim: F(bad), truth: F(dy) }; L3 = { t: 'm = ' + ng(bad) + '/' + ng(dx) + ' = ' + fs(F(bad, dx)), claim: F(bad, dx), truth: F(bad, dx) }; wrong = 0; }
      lines = [L1, L2, L3]; fix = F(dy, dx); lab = 'm =';
    } else {
      var A = R.i(1, 6), B = R.pick([2, 3, 4, 5]), C = B * R.nz(-5, 5); if (A % B === 0) A++;
      stem = 'Marcus rewrote ' + I(stdEq(A, B, C)) + ' in slope-intercept form. His working has one mistake.';
      if (kind === 'part') { lines = [{ t: B + 'y = ' + co(-A, 'x', true) + co(C, '', false), claim: F(-A), truth: F(-A) }, { t: 'y = ' + co(F(-A, B), 'x', true) + co(C, '', false), claim: F(C), truth: F(C, B) }, { t: 'So m = ' + fs(F(-A, B)) + ' and b = ' + ng(C), claim: F(C), truth: F(C) }]; wrong = 1; fix = F(C, B); lab = 'b ='; }
      else { lines = [{ t: B + 'y = ' + co(A, 'x', true) + co(C, '', false), claim: F(A), truth: F(-A) }, { t: 'y = ' + co(F(A, B), 'x', true) + co(F(C, B), '', false), claim: F(A, B), truth: F(A, B) }, { t: 'So m = ' + fs(F(A, B)) + ' and b = ' + fs(F(C, B)), claim: F(A, B), truth: F(A, B) }]; wrong = 0; fix = F(-A, B); lab = 'm ='; }
    }
    var parts = [{ kind: 'row', q: 'Tap the line of working where the mistake FIRST happens.', ans: wrong, n: 3 }];
    if (d === 2 || d === 3) {
      var others = R.shuffle(Object.keys(REASONS).filter(function (k) { return k !== kind; })).slice(0, 3);
      var why = mcPart(R, 'What went wrong?', [{ t: REASONS[kind], ok: true }].concat(others.map(function (k) { return { t: REASONS[k], ok: false }; })));
      parts.push(why);
    }
    if (d === 4) parts.push(numPart(lab === 'b =' ? 'What is the correct y-intercept?' : 'What is the correct slope?', [lab], [fix]));
    return { stem: stem, fig: { t: 'work', lines: lines.map(function (l) { return l.t; }) }, exp: [0, 60, 90, 100, 130][d], parts: parts,
      verify: function () { var first = -1, n = 0; lines.forEach(function (l, i) { if (!feq(l.claim, l.truth)) { n++; if (first < 0) first = i; } }); return n === 1 && first === wrong && !feq(fix, lines[2].claim); },
      work: ['Line ' + (wrong + 1) + ' is wrong. ' + REASONS[kind] + ' Correct ' + lab + ' ' + fs(fix)] };
  };

  /* ---------------- making one verified question ----------------
     Every question is checked before a student sees it: its own verify() (an independent re-calculation from the raw
     numbers), the answer key must pass the marking, a wrong answer must fail it, and tap-to-choose parts must have
     exactly one right option. If any check fails the next set of numbers is tried. */
  function validate(it, sk, d) {
    if (!it || !it.parts || !it.parts.length) return 'no parts';
    try { if (!it.verify()) return 'verify failed'; } catch (e) { return 'verify threw ' + e.message; }
    for (var i = 0; i < it.parts.length; i++) {
      var p = it.parts[i]; if (!p) return 'missing part';
      var key = keyOf(p); if (key == null || !checkPart(p, key)) return 'key does not pass (' + p.kind + ')';
      var w = wrongOf(p); if (w != null && checkPart(p, w)) return 'a wrong answer passes (' + p.kind + ')';
      if (p.kind === 'mc') { if (p.opts.length < 3 || p.truth.filter(Boolean).length !== 1 || !p.truth[p.ans]) return 'mc options'; }
      if (p.kind === 'point' && (Math.abs(key.x) > 8 || Math.abs(key.y) > 8)) return 'key off the grid';
      if (p.kind === 'line' && key.some(function (q) { return Math.abs(q.x) > 8 || Math.abs(q.y) > 8; })) return 'key off the grid';
      if (p.kind === 'order' && new Set(p.lines).size !== p.lines.length) return 'duplicate lines';
      if (p.kind === 'num' && p.ans.some(function (a) { return !isFinite(a[0]) || !isFinite(a[1]) || !Number.isInteger(a[0]) || !Number.isInteger(a[1]); })) return 'bad number';
    }
    if (it.fig && it.fig.t === 'graph') {
      var bad = (it.fig.pts || []).some(function (q) { return !Number.isInteger(q.x) || !Number.isInteger(q.y) || Math.abs(q.x) > 8 || Math.abs(q.y) > 8; }); if (bad) return 'point off the grid';
    }
    if (/NaN|undefined|Infinity/.test(JSON.stringify([it.stem, it.fig, it.parts.map(function (p) { return [p.q, p.opts, p.lines, p.labs]; })]))) return 'bad text';
    var g = it.parts.reduce(function (a, p) { return a * partGuess(p); }, 1);
    if (sk && Math.abs(g - GUESS[sk][d - 1]) > .09) return 'guess chance ' + g.toFixed(2) + ' is not the table\'s ' + GUESS[sk][d - 1];
    return '';
  }
  CU.validate = validate;
  CU.make = function (sk, d, seed) {
    for (var k = 0; k < 60; k++) {
      var it = null; try { it = G[sk](rng(hash(seed + '|' + sk + '|' + d + '|' + k)), d); } catch (e) { it = null; }
      if (it && !validate(it, sk, d)) { it.skill = sk; it.d = d; it.tries = k; it.c = GUESS[sk][d - 1]; return it; }
    }
    return null;
  };

  /* ---------------- work-it-out-on-paper questions: the review's own independent problems ----------------
     The student is encouraged to write out their thinking on paper before typing the final answer. Nothing is handed
     in. The numbers come from the student's seed, so the dashboard can rebuild the same problem and show its worked
     solution, for talking a student through their thinking. */
  function reviewT() { return window.SFA_REVIEW && window.SFA_REVIEW.T; }
  function strip(h) { return String(h || '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'); }
  // The review's step prompts are written for guided practice, one step at a time ("Solve for b: b = 14 − 16"). Here all
  // the final boxes show together, so a prompt with numbers in it can give away the working or an earlier box's answer.
  // Keep a prompt only if it has no numbers; otherwise keep its last sentence ("What is b?"), or ask by the box label.
  function plainQ(q, labs) {
    var t = strip(q).replace(/\s+/g, ' ').trim();
    if (!/\d/.test(t)) return q;
    var bits = t.match(/[^.?!]+[.?!]?/g) || [], last = (bits[bits.length - 1] || '').trim();
    if (last && !/\d/.test(last)) return last;
    var lab = labs && labs[0] ? String(labs[0]).replace(/\s*=\s*$/, '') : '';
    return lab ? 'What is ' + lab + '?' : 'Your answer:';
  }
  CU.plainQ = plainQ;
  CU.paperOK = function (sk) { var T = reviewT(); return !!(T && T[sk] && typeof T[sk].gen === 'function'); };
  CU.paper = function (sk, d, seed) {
    var T = reviewT(); if (!T || !T[sk]) return null;
    var real = Math.random, out = null;
    for (var k = 0; k < 20 && !out; k++) {
      var R = rng(hash(seed + '|paper|' + sk + '|' + d + '|' + k));
      Math.random = R.f;
      try {
        var p = T[sk].gen(d >= 4), finals = p.steps.filter(function (s) { return s.final; });
        var subs = finals.map(function (s) {
          if (s.type === 'num') return { kind: 'num', q: plainQ(s.q, s.labs || [s.lab]), html: 1, labs: s.labs || [s.lab || 'Answer'], ans: s.ans, check: s.check || null, key: s.check ? s.ans.map(fs) : null };
          if (s.type === 'mc') return { kind: 'mc', q: plainQ(s.q), html: 1, opts: s.choices.map(function (c) { return I(strip(c)); }), truth: s.choices.map(function (c, i) { return i === s.ans; }), ans: s.ans };
          return null;
        });
        if (subs.length && subs.every(Boolean) && subs.every(function (s) { return checkPart(s, keyOf(s)) && !checkPart(s, wrongOf(s)); })) {
          var ansText = finals.map(function (s) { return s.at || (s.type === 'num' ? (s.labs || [s.lab || '']).map(function (l, i) { return (l + ' ' + fs(s.ans[i])).trim(); }).join(', ') : strip(s.choices[s.ans])); }).join(';  ');
          out = { skill: sk, d: d, paper: 1, c: 0, html: 1, stem: p.q, figHtml: p.fig || '', fig: null, exp: (d >= 4 ? 210 : 160), parts: [{ kind: 'multi', q: 'Work it out on paper first, one step at a time. Then type your final answer here.', subs: subs }],
            steps: p.steps.map(function (s) { return { q: s.q, why: s.why, final: !!s.final }; }), answer: ansText, chk: hash(ansText) % 36, verify: function () { return true; }, work: [] };
        }
      } catch (e) { out = null; }
    }
    Math.random = real;
    return out;
  };
  // which skills are the paper questions for this student: the later one of each pair in the first round
  function paperSkills(seed) {
    var ord = order(seed, 0);
    return PAPER_PAIRS.map(function (pr) { return ord.indexOf(pr[0]) > ord.indexOf(pr[1]) ? pr[0] : pr[1]; });
  }
  CU.paperSkills = paperSkills;

  /* ---------------- the adaptive rule ---------------- */
  // one round visits all thirteen skills, mixed so the four criteria take turns
  function order(seed, round, top) {
    var R = rng(hash(seed + '|round|' + round)), slots = [], off = offFor(top);
    CRIT.forEach(function (c) { var ids = R.shuffle(c.skills), n = ids.length; ids.forEach(function (id, k) { slots.push({ id: id, at: (k + .5) / n + (R.f() - .5) * .04 }); }); });
    slots.sort(function (a, b) { return a.at - b.at; });
    return slots.map(function (s) { return s.id; }).filter(function (id) { return !off[id]; });   // the same draws either way, so attempts already under way don't change
  }
  CU.order = order;
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  // the level of the next question on a skill, from the answers so far
  function levelFor(log, sk) {
    var crit = CRIT_OF[sk], cl = 2, last = null;
    log.forEach(function (e) { if (CRIT_OF[e.s] === crit) cl = clamp(cl + (e.ok ? 1 : -1), 1, 4); if (e.s === sk) last = e; });
    return last ? clamp(last.d + (last.ok ? 1 : -1), 1, 4) : cl;
  }
  CU.levelFor = levelFor;
  CU.MAX_ITEMS = 40;
  // the next question: { i, s (skill), d (level), paper }
  CU.next = function (seed, log, canPaper, top) {
    var i = log.length, sk, act = CU.active(top), N = act.length;
    if (i < 2 * N) sk = order(seed, Math.floor(i / N), top)[i % N];
    else {
      var sc = score(log), best = -1, R = rng(hash(seed + '|pick|' + i)), lastS = log[i - 1].s;
      act.forEach(function (id) { if (id === lastS) return; var e = sc.skill[id], v = e.se + (e.n < 3 ? .3 : 0) + R.f() * .05; if (v > best) { best = v; sk = id; } });
    }
    // canPaper: false (none), a number (at most that many: a short Check), or anything else (the usual three)
    var d = levelFor(log, sk), paper = 0, maxP = canPaper === false ? 0 : typeof canPaper === 'number' ? canPaper : 3;
    if (i < N && log.filter(function (e) { return e.p; }).length < maxP && paperSkills(seed).indexOf(sk) >= 0 && CU.paperOK(sk)) { paper = 1; d = d >= 4 ? 4 : 3; }
    return { i: i, s: sk, d: d, paper: paper };
  };

  /* ---------------- scoring ---------------- */
  var BD = [0, -2, -1, 0, 1], DISC = 1.2, CUTS = CU.CUTS = [-0.5, 0.5, 1.5];
  function pRight(th, d, c) { return c + (1 - c) / (1 + Math.exp(-DISC * (th - BD[d]))); }
  CU.pRight = pRight;
  function eap(items, mu, sd) {
    var num = 0, den = 0, sq = 0;
    for (var k = -45; k <= 45; k++) {
      var th = k / 10, w = Math.exp(-0.5 * Math.pow((th - mu) / sd, 2));
      for (var j = 0; j < items.length; j++) { var e = items[j], p = pRight(th, e.d, e.p ? 0 : GUESS[e.s][e.d - 1]); w *= e.ok ? p : 1 - p; }
      num += th * w; sq += th * th * w; den += w;
    }
    var m = num / den; return { th: m, se: Math.sqrt(Math.max(0, sq / den - m * m)) };
  }
  function levelOf(th) { return th < CUTS[0] ? 1 : th < CUTS[1] ? 2 : th < CUTS[2] ? 3 : 4; }
  function scale(th) { return clamp(Math.round((500 + 100 * th) / 5) * 5, 200, 800); }
  CU.levelOf = levelOf; CU.scale = scale;
  // Limited..Deep need a minimum of evidence: 8 answers overall, 3 in a criterion, 2 on a skill. Below that the level is 0, "not enough evidence".
  var NEED = CU.NEED = { all: 8, crit: 3, skill: 2 };
  function score(log) {
    var out = { n: log.length, right: log.filter(function (e) { return e.ok; }).length, crit: {}, skill: {} };
    var o = eap(log, 0, 1.5);
    out.th = o.th; out.se = o.se; out.scale = scale(o.th); out.pm = Math.round(o.se * 100 / 5) * 5; out.level = log.length >= NEED.all ? levelOf(o.th) : 0;
    CRIT.forEach(function (c) {
      var its = log.filter(function (e) { return CRIT_OF[e.s] === c.id; }), e = eap(its, 0, 1.5);
      out.crit[c.id] = { n: its.length, right: its.filter(function (x) { return x.ok; }).length, th: e.th, se: e.se, scale: scale(e.th), pm: Math.round(e.se * 100 / 5) * 5, level: its.length >= NEED.crit ? levelOf(e.th) : 0 };
      c.skills.forEach(function (id) {
        // a skill has only a few answers, so its estimate leans on the criterion's; two plain-sense limits keep it readable:
        // every answer right = at least the level of the hardest question answered; every answer wrong = below the easiest one missed
        var si = its.filter(function (x) { return x.s === id; }), se = eap(si, e.th, 1), right = si.filter(function (x) { return x.ok; }).length;
        var top = si.reduce(function (a, x) { return x.ok ? Math.max(a, x.d) : a; }, 0), low = si.reduce(function (a, x) { return x.ok ? a : Math.min(a, x.d); }, 5), lv = levelOf(se.th);
        if (si.length && right === si.length) lv = Math.max(lv, top);
        if (si.length && right === 0) lv = Math.min(lv, Math.max(1, low - 1));
        out.skill[id] = { n: si.length, right: right, th: se.th, se: se.se, level: si.length >= NEED.skill ? lv : 0, top: top };
      });
    });
    return out;
  }
  CU.score = score;
  // "stable": two full rounds answered, and the overall estimate and every criterion estimate have settled
  CU.STABLE = { min: 26, se: 0.36, critSe: 0.72 };
  CU.stable = function (log, top) {
    if (log.length < CU.STABLE.min - 2 * (IDS.length - CU.active(top).length)) return false;
    var s = score(log); if (s.se > CU.STABLE.se) return false;
    return CRIT.every(function (c) { return s.crit[c.id].se <= CU.STABLE.critSe; });
  };

  /* ---------------- feedback: what the student can do, and exactly how to improve ----------------
     For every skill, CAN[k] says what a student at level k+1 can do (each level matches the questions at that level
     in the item bank above), and NEXT[k] says how to reach the level above: the method, the usual trap and an example.
     The student's finish screen and the printed task sheet both use CU.feedback, so they say the same thing. */
  var STRETCH = 'Keep it sharp: do the stretch problems for this skill in the Unit 2 Review, and explain each step out loud or to a classmate.';
  var FB = CU.FB = {
    s1: { can: ['You are starting to find slope from two points when both points have positive whole numbers.',
      'You can find whole-number slopes from two points, including slopes that go down and points with negative coordinates.',
      'You can find a fraction slope from any two points, subtracting in the same order on top and bottom, and simplify it.',
      'You can use a slope to find a missing coordinate, or another point on the line, without drawing it.'],
      next: ['Write slope = (y₂ − y₁) ÷ (x₂ − x₁) every time, then put the numbers in. Put negative numbers in brackets: 3 − (−2) = 5. A line that goes down has a negative slope.',
      'When the change in y doesn\'t divide evenly by the change in x, leave a fraction and simplify it: 6 ÷ 4 = 3/2. Subtract in the same order on top and bottom, never top one way and bottom the other.',
      'Work backwards from the slope: change in y = slope × change in x. Example: the line through (2, 1) and (6, k) has slope 3/4. The change in x is 4, so the change in y is 3, and k = 4.',
      STRETCH] },
    s2: { can: ['You are starting to read slope from a table when x goes up by 1.',
      'You can find a whole-number slope from a table, even when x goes up by 2 or 3.',
      'You can find a fraction slope from any table by dividing the change in y by the change in x between rows.',
      'You can check that a table is linear, find the row that breaks the pattern, and give the slope.'],
      next: ['Always check how much x changes as well as y. If x goes up by 2 and y goes up by 6, the slope is 6 ÷ 2 = 3, not 6. Write both changes beside the table.',
      'If the change in y doesn\'t divide evenly by the change in x, write the slope as a fraction: y up 5 when x up 2 gives 5/2. Negative change in y means a negative slope.',
      'Check every pair of rows, not just the first two: a linear table has the same change in y for the same change in x all the way down. The row that breaks this is the wrong one.',
      STRETCH] },
    s3: { can: ['You are starting to read slope from a graph with marked points when the line goes up.',
      'You can find the slope of a graphed line from two marked points, including lines that go down.',
      'You can find fraction slopes from a graph, and place a point to make a line with a given slope.',
      'You can find the slope of a line with no points marked, using places where it crosses grid corners exactly.'],
      next: ['Count from one marked point to the other: the rise (up is +, down is −) over the run to the right. A line that goes down from left to right has a negative slope.',
      'If you go across more than you go up, the slope is a fraction: up 2, across 3 is 2/3. Simplify, and keep the sign. To build a slope of 2/3, go up 2 and right 3 from the point.',
      'With no points marked, look for where the line passes exactly through a grid corner. Use two of those, as far apart as you can, and count rise over run.',
      STRETCH] },
    s4: { can: ['You are starting to read the slope from y = mx + b.',
      'You can read the slope from y = mx + b, even when it is written y = b + mx, y = 5 − x, or has a fraction.',
      'You can find the slope from equations like 3y = 2x + 6 or 2x + 5y = 10 by solving for y first.',
      'You can find the slope from any form, including standard form with a negative coefficient, and order lines by slope.'],
      next: ['The slope is the number in front of x, with its sign, wherever x is: in y = 4 − 3x the slope is −3, and in y = 5 − x it is −1.',
      'If y has a number in front of it, divide every term by that number first: 3y = 2x + 6 gives y = (2/3)x + 2, so the slope is 2/3. In Ax + By = C the slope is −A ÷ B.',
      'Watch the signs when B is negative: in 3x − 4y = 8 the slope is −3 ÷ (−4) = 3/4. Practise finding the slope of four lines in different forms and putting them in order.',
      STRETCH] },
    f1: { can: ['You are starting to recognise a line rewritten as y = mx + b.',
      'You can rewrite Ax + By = C as y = mx + b when the numbers divide evenly.',
      'You can rewrite any Ax + By = C as y = mx + b, keeping fraction slopes and intercepts exact.',
      'You can rewrite rearranged equations, like 2x + 3y − 6 = 0, in slope-intercept form.'],
      next: ['Get y on its own in two steps: move the x-term to the other side (it changes sign), then divide every term by the number in front of y. 6x + 2y = 8 → 2y = −6x + 8 → y = −3x + 4.',
      'Do two steps: move the x-term, then divide EVERY term by the number in front of y, the constant too. 5x − 3y = 9 → −3y = −5x + 9 → y = (5/3)x − 3.',
      'If the equation isn\'t in Ax + By = C yet, get it there first (everything with x or y on the left, the number on the right), then convert as usual.',
      STRETCH] },
    f2: { can: ['You are starting to recognise a line written in standard form.',
      'You can match y = mx + b to its standard form when the slope is a whole number, and put the steps in order.',
      'You can write y = mx + b with a fraction slope as Ax + By = C with whole numbers and A positive.',
      'You can clear two different denominators to write standard form with whole numbers.'],
      next: ['Do the steps in this order: clear any fraction (multiply every term by the denominator), move the x-term to the left side, then make the number in front of x positive by multiplying every term by −1 if needed. y = −2x + 5 becomes 2x + y = 5.',
      'Clear the fraction first: multiply EVERY term by the denominator. y = (2/3)x + 1 → 3y = 2x + 3 → −2x + 3y = 3 → multiply by −1: 2x − 3y = −3.',
      'When the slope and the intercept have different denominators, multiply every term by a number both divide into (for 1/2 and 2/3, use 6). Then move the x-term and make A positive.',
      STRETCH] },
    b1: { can: ['You are starting to find the y-intercept from a slope and a point.',
      'You can find b from a slope and a point, or from a table where the row for x = 0 is missing.',
      'You can find the equation of a line through two points: the slope first, then b.',
      'You can find a y-intercept that falls between gridlines, as an exact fraction.'],
      next: ['Put the point into y = mx + b and solve for b. Slope 2 through (3, 11): 11 = 2(3) + b, so b = 11 − 6 = 5. In a table, step back to x = 0 with the slope.',
      'With two points, find the slope first, then put either point into y = mx + b to find b. Check your equation with the other point.',
      'Don\'t read b off the graph when it lands between gridlines: work it out exactly with b = y − m·x, keeping fractions.',
      STRETCH] },
    r1: { can: ['You are starting to match a story to its equation.',
      'You can write the equation for a story (start value = b, rate = m) and solve it when the amount goes up.',
      'You can model and solve stories where the amount goes down, using a negative slope.',
      'You can build the model from two data points and use it to predict.'],
      next: ['Find the starting amount (b) and the change each time (m). A $20 sign-up fee plus $15 a month is y = 15x + 20. To solve, set y to the target and undo: 65 = 15x + 20 → 45 = 15x → x = 3.',
      'If the amount goes down, the slope is negative: a 30 cm candle burning 2 cm an hour is y = −2x + 30. Solve the same way, and check the answer makes sense in the story.',
      'With two data points, find the rate first: (75 − 55) ÷ (7 − 3) = 5 per week. Work back to the start: 55 − 5(3) = 40. Then write y = 5x + 40 and solve.',
      STRETCH] },
    r2: { can: ['You are starting to find where a line crosses the y-axis from its equation.',
      'You can graph y = mx + b with a whole-number slope: start at b, then step the slope.',
      'You can graph lines with fraction slopes: up or down the top number, across the bottom number.',
      'You can graph a line given in standard form by converting it first.'],
      next: ['Start at (0, b) on the y-axis. Then use the slope as rise over run: slope 2 means up 2, right 1; slope −3 means down 3, right 1. Plot that second point.',
      'For a fraction slope, the top is the rise and the bottom is the run: 2/3 means up 2, right 3; −1/2 means down 1, right 2.',
      'From standard form, solve for y first, then graph from b with the slope. Check: put one of your points into the original equation.',
      STRETCH] },
    r3: { can: ['You are starting to choose an inequality for a situation.',
      'You can choose an inequality for a situation and graph y < mx + b with the right line and shading.',
      'You can solve a word inequality and round to a sensible whole-number answer.',
      'You can graph inequalities where y has a negative number in front, flipping the symbol when you divide.'],
      next: ['"At most" and "up to" mean ≤; "at least" means ≥. To graph: ≤ or ≥ gets a solid line, < or > a dashed line. y > … means shade above, y < … means shade below.',
      'Solve a word inequality like an equation, then decide how to round: you can\'t go over "at most", so round down; you must reach "at least", so round up.',
      'When you divide by a negative number, flip the symbol: −2y < 4x + 6 becomes y > −2x − 3. Then choose the line and the shading from the new symbol.',
      STRETCH] },
    r4: { can: ['You are starting to match a table to its equation.',
      'You can match a table that starts at x = 0 to its equation, and an equation to its graph.',
      'You can match a table that doesn\'t start at 0 or go up by 1 to its equation.',
      'You can match a graph to its equation in standard form.'],
      next: ['Find the slope (change in y for each 1 in x) and b (the y-value when x = 0), then look for y = mx + b. For a graph, b is where the line crosses the y-axis.',
      'If x goes up by 2, divide the change in y by 2 for the slope. If x = 0 isn\'t in the table, step back with the slope to find b.',
      'Read m and b from the graph, write y = mx + b, then rearrange it to Ax + By = C and compare with each option.',
      STRETCH] },
    e1: { can: ['You are starting to say what the numbers in a model mean.',
      'You can say what the slope and the y-intercept mean in a story.',
      'You can explain a going-down rate with units and use the model to predict.',
      'You can compare two models and explain when one becomes cheaper than the other.'],
      next: ['The number on its own (b) is the starting amount, when x = 0. The number in front of x (m) is how much it changes every time x goes up by 1.',
      'Say the slope as a rate with units and a direction: "the tank loses 15 litres every minute". Then predict by putting x into the equation.',
      'To compare two models, find where they are equal: the difference in start values ÷ the difference in rates. Then say which is cheaper before and after that point.',
      STRETCH] },
    e2: { can: ['You are starting to spot a mistake when rise and run were swapped.',
      'You can spot sign and order slips in a slope calculation and say what went wrong.',
      'You can spot rearranging mistakes (not dividing every term, not changing a sign) and say what went wrong.',
      'You can find any of these mistakes and work out the correct answer.'],
      next: ['Check each line of working on its own. Watch for subtracting a negative (3 − (−2) = 5, not 1) and for subtracting the x-values in a different order from the y-values.',
      'When an equation is rearranged, check that EVERY term was divided, and that a term changed sign when it moved to the other side.',
      'Once you find the mistake, redo that step correctly and carry on to the right answer.',
      STRETCH] }
  };
  // One entry per skill: { id, name, crit, level (0-4), n, right, can, next, sure }.
  // level 0 = not enough evidence. Then the answers that were given still shape the message, marked sure: false.
  CU.feedback = function (sc, log, top) {
    log = log || [];
    var off = offFor(top);
    return SK.filter(function (k) { return !off[k.id] || sc.skill[k.id].n; }).map(function (k) {
      var e = sc.skill[k.id], f = FB[k.id], o = { id: k.id, name: k.name, crit: k.crit, level: e.level, n: e.n, right: e.right, sure: !!e.level };
      if (e.level) { o.can = f.can[e.level - 1]; o.next = f.next[e.level - 1]; return o; }
      if (!e.n) { o.can = null; o.next = 'This skill didn\'t come up in the time. Check yourself with its guided practice in the Unit 2 Review. The goal: ' + f.can[2].replace(/^You can /, '').replace(/\.$/, '') + '.'; return o; }
      var mine = log.filter(function (x) { return x.s === k.id; }), top = 0, low = 5;
      mine.forEach(function (x) { if (x.ok) top = Math.max(top, x.d); else low = Math.min(low, x.d); });
      if (top) { o.can = f.can[top - 1]; o.next = f.next[Math.min(3, top - 1)]; }
      else { o.can = null; o.next = f.next[Math.max(0, Math.min(low, 4) - 2)]; }
      return o;
    });
  };
  // the skills to work on first: lowest level first (unsure ones with a wrong answer count as low), at most n
  CU.nextSteps = function (fb, sc, n) {
    var rank = function (x) { var e = sc.skill[x.id]; if (x.level) return x.level * 10 + e.th; if (x.n && x.right < x.n) return 15 + e.th; return 99; };
    return fb.filter(function (x) { return x.level < 3 && (x.level || (x.n && x.right < x.n)); }).sort(function (a, b) { return rank(a) - rank(b); }).slice(0, n || 3);
  };

  /* ---------------- pacing and flags ---------------- */
  CU.FLAG = { away: 1, paste: 2, fast: 4, slow: 8, copy: 16 };
  CU.fast = function (t, exp) { return t < Math.max(4, exp * .2); };
  CU.slow = function (t, exp) { return t > Math.max(240, exp * 3.5); };
  CU.expFor = function (sk, d, paper) { if (paper) return d >= 4 ? 210 : 160; var it = CU.make(sk, d, 'exp'); return it ? it.exp : 90; };

  /* ---------------- the start code ----------------
     The teacher's dashboard makes a 5-letter code from today's date, the time and the test length. The student page
     accepts it only on the same day and only for a short window after it was made, so the test cannot be started
     early, at home, or tomorrow. It is worked out in the browser (no server), so it stops casual misuse, not a
     determined student who reads this file. */
  var LENS = CU.LENS = [35, 45, 52, 70, 20], OPEN_MIN = CU.OPEN_MIN = 25, ALPHA = 'BCDFGHJKLMNPQRSTVWXZ', SPACE = 173;
  // the lengths the dashboard offers: 20, 35, 45. Extra time is per student (set on the dashboard or the My Students page);
  // 52 and 70 (35 × 1.5 and × 2 for a whole class) are no longer offered but old codes and results still read correctly
  CU.LEN_ORDER = [4, 0, 1];
  // the length extra time is worked out from: 52 and 70 are already 35 × 1.5 and × 2 for the whole class
  CU.baseLen = function (lenIdx) { return lenIdx === 2 || lenIdx === 3 ? LENS[0] : LENS[lenIdx] || LENS[0]; };
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function slotOf(t) { var d = new Date(t); return Math.floor((d.getHours() * 60 + d.getMinutes()) / 5); }
  // the code holds: the 5-minute slot it was made in, the test length, which Check (1 to 4) and the topics (one bit: inequalities in)
  CU.makeCode = function (t, lenIdx, top, check) {
    var slot = slotOf(t), pay = (((slot * 8 + (lenIdx || 0)) * 4 + ((check || 0) & 3)) * 2) + ((top == null ? CU.ALL_TOP : top) & 1), chk = hash('sfa-u2-check|' + dayKey(t) + '|' + pay) % SPACE, n = pay * SPACE + chk, s = '';
    for (var i = 0; i < 5; i++) { s = ALPHA[n % 20] + s; n = Math.floor(n / 20); }
    return s;
  };
  CU.readCode = function (str, now) {
    str = String(str || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (str.length !== 5) return { ok: false, why: 'The start code has 5 letters.' };
    var n = 0; for (var i = 0; i < 5; i++) { var k = ALPHA.indexOf(str[i]); if (k < 0) return { ok: false, why: 'That code isn\'t right. Check the letters on the board.' }; n = n * 20 + k; }
    var chk = n % SPACE, pay = Math.floor(n / SPACE), top = pay % 2, check = Math.floor(pay / 2) % 4, lenIdx = Math.floor(pay / 8) % 8, slot = Math.floor(pay / 64);
    if (slot > 287 || lenIdx >= LENS.length || hash('sfa-u2-check|' + dayKey(now) + '|' + pay) % SPACE !== chk) return { ok: false, why: 'That code isn\'t right for today. Check the letters on the board.' };
    var d = new Date(now); d.setHours(0, 0, 0, 0); var start = d.getTime() + slot * 5 * 60000;
    if (now < start - 6 * 60000) return { ok: false, why: 'That code isn\'t open yet. Check the clock on this device.' };
    if (now > start + (OPEN_MIN + 5) * 60000) return { ok: false, why: 'That code has closed. Ask Mr. Crowell for a new one.' };
    return { ok: true, code: str, len: LENS[lenIdx], lenIdx: lenIdx, top: top, check: check, opened: start, closes: start + (OPEN_MIN + 5) * 60000 };
  };

  /* ---------------- the summary that reaches the dashboard ----------------
     The class view only returns a game's summary columns, so the whole attempt is packed into the "levels" list:
     13 skill entries a person can read in the Sheet, then header entries (A seed and start code, B start time,
     C paper questions) and one entry for every two answers (skill, level, right or wrong, seconds, flags). */
  function b36(n, len) { var s = Math.max(0, Math.floor(n)).toString(36); while (s.length < len) s = '0' + s; return s.slice(-len); }
  function let26(n, len) { n = Math.max(0, Math.floor(n)); var s = ''; for (var i = 0; i < len; i++) { s = String.fromCharCode(97 + n % 26) + s; n = Math.floor(n / 26); } return s; }
  function un26(s) { var n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 97); return n; }
  var TIER = ['nee', 'limited', 'emerging', 'devel', 'deep'];
  // att: { n, code, lenIdx, seed, t0, log, end: {at, why}, ext, reloads, papers: [{s, i, chk}] }
  CU.summary = function (att, now) {
    var log = att.log || [], sc = score(log), levels = [];
    SK.forEach(function (k) { var e = sc.skill[k.id]; levels.push({ id: k.id, tier: e.n ? TIER[e.level] : 'none', name: k.name, done: false, skipped: false }); });
    var st = att.end ? ({ time: 't', stable: 's', max: 'm', left: 'x' })[att.end.why] || 't' : 'r';
    var el = Math.round(((att.end ? att.end.at : now) - att.t0) / 1000);
    levels.push({ id: 'A' + b36(att.seed, 6) + '1', tier: String(att.code || 'zzzzz').toLowerCase().replace(/[^a-z]/g, '').slice(0, 5) + st + let26(att.lenIdx || 0, 1) + let26(att.top == null ? CU.ALL_TOP : att.top, 1), done: false });
    levels.push({ id: 'B' + b36(att.t0 / 60000, 6) + b36(Math.min(35, att.ext || 0), 1), tier: let26(Math.min(17575, el), 3) + let26(Math.min(25, att.n || 1), 1) + let26(Math.min(25, att.reloads || 0), 1), done: false });
    var ps = (att.papers || []).slice(0, 3);
    if (ps.length) levels.push({ id: 'C' + ps.map(function (p) { return b36(IDS.indexOf(p.s), 1) + b36(p.chk, 1); }).join(''), tier: ps.map(function (p) { return let26(Math.min(25, p.i), 1); }).join(''), done: false });
    for (var i = 0; i < log.length && i < 48; i += 2) {
      var id = '', tier = '';
      [log[i], log[i + 1]].forEach(function (e) {
        if (!e) return;
        id += b36(IDS.indexOf(e.s), 1) + b36((e.d - 1) * 8 + (e.ok ? 4 : 0) + (e.p ? 2 : 0) + (e.idk ? 1 : 0), 1) + b36(Math.min(31, e.f || 0), 1) + b36(Math.min(35, Math.ceil((e.a || 0) / 5)), 1);
        tier += let26(Math.min(675, e.t || 0), 2) + let26(Math.min(25, e.b || 0), 1) + let26(Math.min(25, e.r || 0), 1);
      });
      levels.push({ id: id, tier: tier, done: false });
    }
    var flagged = log.filter(function (e) { return e.f; }).length;
    return { levels: levels, levelsDone: 0, levelsTotal: 13, coreDone: sc.right, coreTotal: sc.n, standard: false, specials: [], assisted: flagged, tickets: sc.scale };
  };
  // the summary's levels as the results script stores them in the Sheet (used by the sample class)
  CU.levelsText = function (m) { return (m.levels || []).slice(0, 40).map(function (L) { return String(L.id).replace(/[^A-Za-z0-9]/g, '').slice(0, 8) + '.' + String(L.tier || '').replace(/[^a-z]/g, '').slice(0, 8) + ':' + (L.done ? 'Y' : L.skipped ? 'S' : '-'); }).join(' '); };
  // back from the "levels" text of a class row to an attempt
  CU.decode = function (levelsText) {
    var att = { log: [], papers: [], skills: {}, ok: false };
    String(levelsText || '').split(' ').forEach(function (tok) {
      var m = tok.match(/^([A-Za-z0-9]+)\.([a-z]*):(.)$/); if (!m) return;
      var id = m[1], tier = m[2];
      if (IDS.indexOf(id) >= 0) { att.skills[id] = tier; return; }
      if (id[0] === 'A') { att.seed = parseInt(id.slice(1, 7), 36); att.code = tier.slice(0, 5).toUpperCase(); att.state = tier[5] || 'r'; att.lenIdx = tier[6] ? un26(tier[6]) : 0; att.top = tier[7] ? un26(tier[7]) : CU.ALL_TOP; att.ok = true; return; }
      if (id[0] === 'B') { att.t0 = parseInt(id.slice(1, 7), 36) * 60000; att.ext = parseInt(id[7] || '0', 36); att.elapsed = un26(tier.slice(0, 3)); att.n = un26(tier[3] || 'b'); att.reloads = un26(tier[4] || 'a'); return; }
      if (id[0] === 'C') { for (var k = 0; k + 2 < id.length && k < 6; k += 2) { var si = parseInt(id[1 + k], 36); if (IDS[si]) att.papers.push({ s: IDS[si], chk: parseInt(id[2 + k], 36), i: un26(tier[k / 2] || 'a') }); } return; }
      for (var j = 0; j * 4 < id.length; j++) {
        var a = id.slice(j * 4, j * 4 + 4), t = tier.slice(j * 4, j * 4 + 4); if (a.length < 4) break;
        var v = parseInt(a[1], 36), sk = IDS[parseInt(a[0], 36)]; if (!sk) continue;
        att.log.push({ s: sk, d: (v >> 3) + 1, ok: (v & 4) ? 1 : 0, p: (v & 2) ? 1 : 0, idk: v & 1, f: parseInt(a[2], 36), a: parseInt(a[3], 36) * 5, t: un26(t.slice(0, 2)), b: un26(t[2] || 'a'), r: un26(t[3] || 'a') });
      }
    });
    return att;
  };

  /* ---------------- simulated students (the dashboard's sample class and the self-check use these) ---------------- */
  // ability(skillId) gives the pretend student's true level on the scale; returns a finished attempt
  CU.simulate = function (seed, ability, o) {
    o = o || {}; var R = rng(hash(seed + '|sim')), log = [], t = 0, lim = (o.mins || 35) * 60, why = 'time', papers = [];
    while (true) {
      if (log.length >= CU.MAX_ITEMS) { why = 'max'; break; }
      if (CU.stable(log, o.top)) { why = 'stable'; break; }
      var nx = CU.next(seed, log, o.paper, o.top), it = nx.paper ? CU.paper(nx.s, nx.d, seed) : CU.make(nx.s, nx.d, seed + '|' + nx.i);
      if (!it) { if (nx.paper) { it = CU.make(nx.s, nx.d, seed + '|' + nx.i); nx.paper = 0; } if (!it) throw new Error('no item for ' + nx.s + ' level ' + nx.d); }
      var p = pRight(ability(nx.s), nx.d, nx.paper ? 0 : it.c), ok = R.f() < p ? 1 : 0;
      var secs = Math.round(it.exp * (o.pace || 1) * (0.55 + R.f() * 0.9));
      if (t + secs > lim) break;
      t += secs;
      var f = 0; if (o.flag && R.f() < o.flag) f |= R.pick([1, 1, 2, 16]); if (CU.fast(secs, it.exp)) f |= 4; if (CU.slow(secs, it.exp)) f |= 8;
      if (o.cheat && nx.d >= 3 && R.f() < o.cheat) { ok = 1; f |= 1; secs = Math.max(secs, 70); }
      if (nx.paper) papers.push({ s: nx.s, i: nx.i, chk: it.chk });
      log.push({ s: nx.s, d: nx.d, ok: ok, p: nx.paper, idk: 0, t: secs, f: f, a: (f & 1) ? 10 + R.i(0, 60) : 0, b: (f & 1) ? R.i(1, 3) : 0, r: 0 });
    }
    return { n: 1, code: o.code || 'BCDFG', lenIdx: 0, top: o.top, seed: seed, t0: o.t0 || Date.now() - t * 1000, log: log, end: { at: (o.t0 || Date.now() - t * 1000) + t * 1000, why: why }, ext: 0, reloads: 0, papers: papers };
  };

  /* ---------------- self-check: every skill, every level, many sets of numbers ---------------- */
  CU.selfTest = function (n) {
    n = n || 200; var rep = { items: 0, failed: [], retries: 0, maxTries: 0, paper: 0, paperFailed: [], kinds: {} };
    IDS.forEach(function (sk) {
      for (var d = 1; d <= 4; d++) for (var k = 0; k < n; k++) {
        var seed = 'fuzz' + k, it = CU.make(sk, d, seed);
        if (!it) { rep.failed.push(sk + ' L' + d + ' seed ' + k + ': no valid question in 60 tries'); continue; }
        rep.items++; rep.retries += it.tries; rep.maxTries = Math.max(rep.maxTries, it.tries);
        var again = CU.make(sk, d, seed);
        if (JSON.stringify([it.stem, it.fig, it.parts.map(keyOf)]) !== JSON.stringify([again.stem, again.fig, again.parts.map(keyOf)])) rep.failed.push(sk + ' L' + d + ' seed ' + k + ': not the same question on a second build');
        it.parts.forEach(function (p) { rep.kinds[p.kind] = (rep.kinds[p.kind] || 0) + 1; });
        // raw generator output too: how often does a first try need replacing, and why
        try { var raw = G[sk](rng(hash(seed + '|' + sk + '|' + d + '|0')), d), v = raw ? validate(raw, sk, d) : 'null'; if (v && v !== 'null' && !/mc options|guess/.test(v)) rep.failed.push(sk + ' L' + d + ' seed ' + k + ' first try: ' + v); } catch (e) { rep.failed.push(sk + ' L' + d + ' seed ' + k + ' threw: ' + e.message); }
      }
    });
    if (reviewT()) PAPER_PAIRS.forEach(function (pr) { pr.forEach(function (sk) { for (var d = 3; d <= 4; d++) for (var k = 0; k < Math.min(n, 100); k++) { var p = CU.paper(sk, d, 'fuzz' + k); if (!p) { rep.paperFailed.push(sk + ' L' + d + ' seed ' + k); continue; } rep.paper++; var q = CU.paper(sk, d, 'fuzz' + k); if (q.answer !== p.answer || q.stem !== p.stem) rep.paperFailed.push(sk + ' L' + d + ' seed ' + k + ': not repeatable'); } }); });
    rep.ok = !rep.failed.length && !rep.paperFailed.length;
    return rep;
  };
  CU.G = G;
})();
