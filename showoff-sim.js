/* Show-Off: the avatar stage show's questions and scoring (showoff-u2.html).
   The same text is pasted into backend/Code.gs, so the results script can rebuild a show from its seed, mark the answers and
   work out the score itself (the page never sends a score). Change one, change the other the same way, and bump V.
   Plain ES5, no DOM: it runs in the browser and in Apps Script.

   A show is ten "looks" in three acts, built from a seed (a fresh one every show):
     Act 1 The Runway (a number line from −8 to 8): read the lit runway; walk to the biggest or smallest whole number that works
     Act 2 Quick Change (solving): turn the sign for a negative; walk to the answer of a two-sided inequality; pick the graph
     Act 3 The Photo Floor (the plane, −5 to 5): pose on a point that works; is the avatar in the solution?; pick the shading;
           pose inside a system of two inequalities
   Answers: a choice number (0-3), a whole number on the runway, or a point [x, y] on the floor.
   Score: 100 for a right answer, plus 20 for every right answer just before it in a row (up to +100). Best show: 1700. */
function showoffSim() {
  var V = 'so1', LOOKS = 10, RUN = 8, FLOOR = 5;
  var LT = '<', LE = '≤', GT = '>', GE = '≥', OPS = [LT, LE, GT, GE];

  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  function nz(r, lo, hi) { var v = 0; while (!v) v = ri(r, lo, hi); return v; }
  function shuffle(r, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // the ISO week ("2026-W48"): the leaderboard is weekly
  function season(dt) {
    var d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())), wd = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - wd);
    var w = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
    return d.getUTCFullYear() + '-W' + (w < 10 ? '0' : '') + w;
  }
  function seasonsNow(now) { var t = now.getTime(); return [season(new Date(t - 7 * 864e5)), season(now), season(new Date(t + 7 * 864e5))]; }

  /* ---------- writing it down (the lessons' way: a real minus sign, spaces around the signs) ---------- */
  function n(v) { return v < 0 ? '−' + Math.abs(v) : String(v); }
  function lin(a, b, v) {
    v = v || 'x';
    var s = a === 0 ? '' : a === 1 ? v : a === -1 ? '−' + v : n(a) + v;
    if (!s) return n(b);
    return b === 0 ? s : s + (b < 0 ? ' − ' : ' + ') + Math.abs(b);
  }
  function flip(op) { return op === LT ? GT : op === GT ? LT : op === LE ? GE : LE; }
  function strict(op) { return op === LT || op === GT; }
  function up(op) { return op === GT || op === GE; }
  function holds(l, op, r) { return op === LT ? l < r : op === LE ? l <= r : op === GT ? l > r : l >= r; }
  function iq(op, c) { return 'x ' + op + ' ' + n(c); }
  function pic(op, c) { return { at: c, open: strict(op), dir: up(op) ? 'r' : 'l' }; }
  function lineText(L) { return 'y ' + L.op + ' ' + lin(L.m, L.b); }
  // the biggest (for < and ≤) or smallest (for > and ≥) whole number with x op c
  function edge(op, c) { return op === LT ? c - 1 : op === GT ? c + 1 : c; }
  function askOf(op) { return up(op) ? 'smallest' : 'largest'; }
  function edgeWhy(op, c) {
    var e = edge(op, c);
    return 'The ' + askOf(op) + ' whole number with ' + iq(op, c) + ' is ' + n(e) + (strict(op) ? ' (' + n(c) + ' itself doesn\'t count: ' + op + ' means not equal).' : ' (' + op + ' lets x equal ' + n(c) + ').');
  }

  /* ---------- Act 1: the runway ---------- */
  function read(r) {
    var c = ri(r, -6, 6), op = pick(r, OPS), opts = shuffle(r, OPS.slice()).map(function (o) { return iq(o, c); });
    return { k: 'read', act: 1, q: 'The spotlight lights up the runway. Which inequality is it showing?', pic: pic(op, c), opts: opts, ans: opts.indexOf(iq(op, c)),
      why: [(strict(op) ? 'An open dot: ' + n(c) + ' is not included, so it\'s < or >.' : 'A closed dot: ' + n(c) + ' is included, so it\'s ≤ or ≥.'),
        'The light runs to the ' + (up(op) ? 'right: bigger numbers, so x is greater.' : 'left: smaller numbers, so x is less.'), 'So it\'s ' + iq(op, c) + '.'] };
  }
  function walk1(r) {
    var c = ri(r, -6, 6), op = pick(r, OPS), text, why;
    if (r() < 0.5) {
      var b = nz(r, -7, 7); text = lin(1, b) + ' ' + op + ' ' + n(c + b);
      why = [text, (b > 0 ? 'Take ' + b + ' from both sides: ' : 'Add ' + Math.abs(b) + ' to both sides: ') + iq(op, c) + '.'];
    } else {
      var a = ri(r, 2, 5); text = lin(a, 0) + ' ' + op + ' ' + n(a * c);
      why = [text, 'Divide both sides by ' + a + ' (positive, so the sign stays): ' + iq(op, c) + '.'];
    }
    why.push(edgeWhy(op, c));
    return { k: 'walk', act: 1, iq: text, ask: askOf(op), ans: edge(op, c), sol: iq(op, c),
      q: 'Walk to the ' + askOf(op) + ' whole number that makes ' + text + ' true.', why: why };
  }
  function walkFlip(r) {
    var a = -ri(r, 2, 5), c = nz(r, -5, 5), op0 = pick(r, OPS), op = flip(op0), text = lin(a, 0) + ' ' + op0 + ' ' + n(a * c);
    return { k: 'walk', act: 1, iq: text, ask: askOf(op), ans: edge(op, c), sol: iq(op, c), flip: true,
      q: 'Walk to the ' + askOf(op) + ' whole number that makes ' + text + ' true.',
      why: [text, 'Divide both sides by ' + n(a) + '. Dividing by a negative turns the sign: ' + op0 + ' becomes ' + op + '.', iq(op, c), edgeWhy(op, c)] };
  }

  /* ---------- Act 2: quick change ---------- */
  function solve(r) {
    var a = -ri(r, 2, 5), c = nz(r, -5, 5), b = nz(r, -9, 9), op0 = pick(r, OPS), op = flip(op0), text = lin(a, b) + ' ' + op0 + ' ' + n(a * c + b);
    var right = iq(op, c), opts = shuffle(r, [right, iq(op0, c), iq(op, -c), iq(op0, -c)]);
    return { k: 'solve', act: 2, iq: text, q: 'Quick change! Solve ' + text + '.', opts: opts, ans: opts.indexOf(right),
      why: [text, (b > 0 ? 'Take ' + b + ' from both sides: ' : 'Add ' + Math.abs(b) + ' to both sides: ') + lin(a, 0) + ' ' + op0 + ' ' + n(a * c) + '.',
        'Divide by ' + n(a) + ' and turn the sign: ' + right + '.', 'Check with a number: x = ' + n(edge(op, c) + (up(op) ? 1 : -1)) + ' works, x = ' + n(edge(op, c) + (up(op) ? -2 : 2)) + ' doesn\'t.'] };
  }
  function walk2(r) {
    // a1x + b1 op0 a2x + b2, whose answer is x op c (the sign turns when a1 − a2 is negative)
    var d = pick(r, [-4, -3, -2, 2, 3, 4]), a2 = nz(r, -3, 3), a1 = a2 + d, c = ri(r, -6, 6), b2 = ri(r, -8, 8);
    if (!a1) { a1 = a2 + (d = d > 0 ? d + 1 : d - 1); }
    var b1 = b2 - d * c, op0 = pick(r, OPS), op = d < 0 ? flip(op0) : op0, text = lin(a1, b1) + ' ' + op0 + ' ' + lin(a2, b2);
    var why = [text, 'Get the x terms on one side: ' + lin(d, b1) + ' ' + op0 + ' ' + n(b2) + '.', (b1 > 0 ? 'Take ' + b1 + ' from both sides: ' : b1 < 0 ? 'Add ' + Math.abs(b1) + ' to both sides: ' : 'Now: ') + lin(d, 0) + ' ' + op0 + ' ' + n(b2 - b1) + '.',
      'Divide by ' + n(d) + (d < 0 ? ' and turn the sign (it\'s negative): ' : ': ') + iq(op, c) + '.', edgeWhy(op, c)];
    return { k: 'walk', act: 2, iq: text, ask: askOf(op), ans: edge(op, c), sol: iq(op, c), flip: d < 0,
      q: 'Walk to the ' + askOf(op) + ' whole number that makes ' + text + ' true.', why: why };
  }
  function graph(r) {
    var a = nz(r, -4, 4), c = ri(r, -5, 5), b = ri(r, -6, 6), op0 = pick(r, OPS), op = a < 0 ? flip(op0) : op0, text = lin(a, b) + ' ' + op0 + ' ' + n(a * c + b);
    var P = pic(op, c), all = [P, { at: c, open: !P.open, dir: P.dir }, { at: c, open: P.open, dir: P.dir === 'r' ? 'l' : 'r' }, { at: c, open: !P.open, dir: P.dir === 'r' ? 'l' : 'r' }];
    var opts = shuffle(r, all.slice());
    return { k: 'graph', act: 2, iq: text, q: 'Pick the runway lights for ' + text + '.', opts: opts, ans: opts.indexOf(P),
      why: [text, (b ? (b > 0 ? 'Take ' + b + ' from both sides' : 'Add ' + Math.abs(b) + ' to both sides') + (a === 1 ? '' : ', then ') : '') + (a === 1 ? '' : (b ? 'd' : 'D') + 'ivide by ' + n(a) + (a < 0 ? ' and turn the sign' : '')) + ': ' + iq(op, c) + '.',
        (P.open ? 'Open dot' : 'Closed dot') + ' at ' + n(c) + ', lit to the ' + (P.dir === 'r' ? 'right.' : 'left.')] };
  }

  /* ---------- Act 3: the photo floor ---------- */
  function onFloor(x, y) { return x >= -FLOOR && x <= FLOOR && y >= -FLOOR && y <= FLOOR && x === Math.round(x) && y === Math.round(y); }
  function inLine(L, x, y) { return holds(y, L.op, L.m * x + L.b); }
  function count(lines) { var k = 0; for (var x = -FLOOR; x <= FLOOR; x++) for (var y = -FLOOR; y <= FLOOR; y++) if (lines.every(function (L) { return inLine(L, x, y); })) k++; return k; }
  function some(lines) { for (var y = FLOOR; y >= -FLOOR; y--) for (var x = -FLOOR; x <= FLOOR; x++) if (lines.every(function (L) { return inLine(L, x, y); })) return [x, y]; return null; }
  function aLine(r, ops) { return { m: pick(r, [-3, -2, -1, 1, 2, 3, -1, 1, 2, -2, 0]), b: ri(r, -3, 3), op: pick(r, ops || OPS) }; }
  function lineWhy(L) {
    return [lineText(L) + ': the boundary is y = ' + lin(L.m, L.b) + (L.m ? ' (it crosses the y-axis at ' + n(L.b) + ', slope ' + n(L.m) + ').' : ', a flat line through ' + n(L.b) + ' on the y-axis.'),
      (strict(L.op) ? 'Dashed line: points on it don\'t count.' : 'Solid line: points on it count.') + ' The solution is ' + (up(L.op) ? 'above' : 'below') + ' the line.'];
  }
  function pose1(r) {
    var L = aLine(r);
    return { k: 'pose', act: 3, lines: [L], q: 'Photo time! Pose on a point where ' + lineText(L) + '.', ex: some([L]),
      why: lineWhy(L).concat(['Test your point: put its x and y into ' + lineText(L) + ' and see if it\'s true.']) };
  }
  function test(r) {
    var a = ri(r, 1, 4), b = ri(r, 1, 4), x = ri(r, 0, 4), y = ri(r, 0, 4), dl = pick(r, [-3, -2, -1, 0, 0, 1, 2, 3]), op = pick(r, OPS), c = a * x + b * y + dl;
    if (c <= 0) c = a * x + b * y + 2;
    var lhs = a * x + b * y, yes = holds(lhs, op, c), text = lin(a, 0) + ' + ' + lin(b, 0, 'y') + ' ' + op + ' ' + c;
    return { k: 'test', act: 3, std: { a: a, b: b, c: c, op: op }, pt: [x, y], iq: text, q: 'You\'re posing at (' + x + ', ' + y + '). Are you in the solution of ' + text + '?',
      opts: ['Yes: it\'s true here', 'No: it\'s false here'], ans: yes ? 0 : 1,
      why: ['Put x = ' + x + ' and y = ' + y + ' into ' + text + ':', (a === 1 ? x : a + '(' + x + ')') + ' + ' + (b === 1 ? y : b + '(' + y + ')') + ' = ' + lhs + '.', lhs + ' ' + op + ' ' + c + ' is ' + (yes ? 'true' : 'false') + (lhs === c ? (strict(op) ? ': on a dashed line, so not in.' : ': on the solid line, so it counts.') : '.')] };
  }
  function shade(r, not) {
    var L = aLine(r); while (not && L.m === not.m && L.b === not.b) L = aLine(r);
    var right = { solid: !strict(L.op), above: up(L.op) }, all = [right, { solid: !right.solid, above: right.above }, { solid: right.solid, above: !right.above }, { solid: !right.solid, above: !right.above }];
    var opts = shuffle(r, all.slice());
    return { k: 'shade', act: 3, line: { m: L.m, b: L.b }, iq: lineText(L), q: 'Which floor plan shows ' + lineText(L) + '?', opts: opts, ans: opts.indexOf(right), why: lineWhy(L) };
  }
  function system(r) {
    for (var t = 0; t < 60; t++) {
      var tx = ri(r, -3, 3), ty = ri(r, -3, 3), m1 = pick(r, [-2, -1, 0, 1, 2, 3, -3]), m2 = pick(r, [-2, -1, 0, 1, 2, 3, -3]);
      if (m1 === m2) continue;
      var L1 = { m: m1, b: ty - m1 * tx - ri(r, 1, 2), op: pick(r, [GT, GE]) }, L2 = { m: m2, b: ty - m2 * tx + ri(r, 1, 2), op: pick(r, [LT, LE]) };
      if (Math.abs(L1.b) > 6 || Math.abs(L2.b) > 6) continue;
      var k = count([L1, L2]); if (k < 4 || k > 50) continue;
      var lines = r() < 0.5 ? [L1, L2] : [L2, L1];
      return { k: 'pose', act: 3, lines: lines, sys: true, q: 'Group photo! Pose where both are true: ' + lineText(lines[0]) + ' and ' + lineText(lines[1]) + '.', ex: some(lines),
        why: [lineText(L1) + ': above its line (' + (strict(L1.op) ? 'dashed' : 'solid') + ').', lineText(L2) + ': below its line (' + (strict(L2.op) ? 'dashed' : 'solid') + ').', 'The solution is where the two shadings overlap. Test a point in both.'] };
    }
    var F1 = { m: 0, b: -1, op: GT }, F2 = { m: 1, b: 2, op: LE };   // never reached in practice: a safe system
    return { k: 'pose', act: 3, lines: [F1, F2], sys: true, q: 'Group photo! Pose where both are true: ' + lineText(F1) + ' and ' + lineText(F2) + '.', ex: some([F1, F2]), why: ['Above y = −1 and on or below y = x + 2.'] };
  }

  var ACTS = [null, 'The Runway', 'Quick Change', 'The Photo Floor'];
  function show(seed) {
    var r = rng(hash('showoff|' + seed));
    var P = pose1(r);
    return [read(r), walk1(r), walkFlip(r), solve(r), walk2(r), graph(r), P, test(r), shade(r, P.lines[0]), system(r)];
  }
  function check(L, a) {
    if (!L) return false;
    if (L.k === 'pose') {
      if (!a || a.length !== 2) return false;
      var x = Number(a[0]), y = Number(a[1]);
      return onFloor(x, y) && L.lines.every(function (M) { return inLine(M, x, y); });
    }
    return typeof a === 'number' && a === L.ans;
  }
  function pts(streak) { return 100 + 20 * Math.min(5, streak); }
  // mark a whole show: the answers in order (missing ones count as wrong)
  function mark(seed, answers) {
    var S = show(seed), streak = 0, best = 0, score = 0, right = 0, marks = [];
    answers = Array.isArray(answers) ? answers : [];
    S.forEach(function (L, i) {
      var ok = check(L, answers[i]); marks.push(ok);
      if (ok) { score += pts(streak); streak++; right++; best = Math.max(best, streak); } else streak = 0;
    });
    return { score: score, right: right, best: best, marks: marks, done: answers.length === LOOKS };
  }
  function clean(answers) {
    return (Array.isArray(answers) ? answers : []).slice(0, LOOKS).map(function (a) {
      if (Array.isArray(a)) return [Math.round(Number(a[0])) || 0, Math.round(Number(a[1])) || 0];
      var v = Number(a); return isFinite(v) ? Math.round(v) : null;
    });
  }

  return { V: V, LOOKS: LOOKS, RUN: RUN, FLOOR: FLOOR, ACTS: ACTS, MAX: 1700, season: season, seasonsNow: seasonsNow, hash: hash,
    show: show, check: check, mark: mark, pts: pts, clean: clean, lin: lin, n: n, lineText: lineText, inLine: inLine, strict: strict, up: up };
}
if (typeof window !== 'undefined') window.showoffSim = showoffSim;
