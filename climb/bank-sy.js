/* Climb question bank: skill 25 (when two functions are equal: systems, 8.EE.C.8).
   Taught in Film 11 (Three Roads: where two rules meet, by table, by graph, by undoing) and Film 14 (Faster Than:
   when two runners are level). Finding and checking the input where two rules give the same output, by table,
   graph and equation, plus parallel lines that are never equal. Skill 17's CP-5c / CP-6a ask "when do the costs
   (or savings) match" with a gap ÷ closing rate; these centre on the crossing itself and checking it in both rules.
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt, M = '−';
  var STD = ['8.EE.C.8'];
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 × (−2)
  function eq(m, b) { return C.eqText(m, b); }
  function xs(k) { return k === 1 ? 'x' : k === -1 ? M + 'x' : f(k) + 'x'; }   // 2x, x, −x
  function upTo(v, step) { return Math.ceil(v / step) * step; }
  // "2 × 3 + 3" with brackets on negatives
  function sub(m, x, b) { return (m === 1 ? par(x) : m === -1 ? M + par(x) : f(m) + ' × ' + par(x)) + (b === 0 ? '' : ' ' + C.term(b)); }
  // a list of options with distinct texts (drops later duplicates)
  function uniq(opts) { var seen = {}, out = []; opts.forEach(function (o) { var k = C.strip(o.t); if (!seen[k]) { seen[k] = 1; out.push(o); } }); return out; }
  function wrongs(key, list) { var out = []; list.forEach(function (w) { if (!isFinite(w.v) || C.near(w.v, key)) return; if (out.some(function (o) { return C.near(o.v, w.v); })) return; out.push(w); }); return out; }

  /* ---------------- SY-2a  L2 · MC · table: the row where both columns match ---------------- */
  C.add({ id: 'SY-2a', skill: '25', level: 2, order: 1, type: 'MC', std: STD, gen: function (R) {
    var sLo, sHi, xS, h0, yS, l0, zeroFast;
    do { sLo = R.int(1, 4); sHi = R.int(sLo + 1, 6); xS = R.int(1, 4); h0 = R.int(0, 6); yS = h0 + sHi * xS; l0 = yS - sLo * xS; }
    while (yS === xS || yS <= 5 || l0 === h0);
    zeroFast = R.chance(0.5);
    var mZ = zeroFast ? sHi : sLo, bZ = zeroFast ? h0 : l0, mO = zeroFast ? sLo : sHi, bO = zeroFast ? l0 : h0;
    var rows = [0, 1, 2, 3, 4, 5].map(function (x) { return [x, bZ + mZ * x, bO + mO * x]; });
    // a "diagonal" match: the same number in both columns, but in different rows (not the same minute)
    var diag = null;
    rows.forEach(function (r) { rows.forEach(function (q) { if (!diag && r[0] !== q[0] && r[1] === q[2] && r[0] !== xS) diag = r; }); });
    var near = xS < 5 ? xS + 1 : xS - 1;
    var opts = uniq([
      { t: C.pl(xS, 'minute'), ok: true },
      { t: C.pl(yS, 'minute'), tag: 'M21' },
      diag ? { t: C.pl(diag[0], 'minute'), tag: 'G' } : null,
      { t: C.pl(near, 'minute'), tag: 'G' },
      { t: 'They are never level', tag: 'G' }
    ].filter(Boolean));
    var k = diag ? diag[0] : near, rk = rows[k];
    return {
      stem: 'Zero and One walk along the same road. The table shows how far along the road each one is (in metres) after each minute. After how many minutes are they level (at the same place)?',
      fig: C.table({ cols: ['Minutes', 'Zero (m)', 'One (m)'], rows: rows }),
      think: 'Look along each row. Where are both numbers the same?',
      parts: [
        { kind: 'choice', label: 'They are level after', opts: opts },
        { kind: 'num', label: 'Each of them is then at (metres)', key: yS, wrong: wrongs(yS, [{ v: xS, tag: 'M21' }]) }
      ],
      answer: 'After ' + C.pl(xS, 'minute') + ', when both are at ' + yS + ' metres',
      work: [
        'Level means the same input gives the same output: the same minute, the same place.',
        'Look along each row. At minute ' + xS + ', Zero is at ' + rows[xS][1] + ' m and One is at ' + rows[xS][2] + ' m: the same.',
        'Check with the steps: Zero ' + bZ + ' + ' + mZ + ' × ' + xS + ' = ' + yS + ', One ' + bO + ' + ' + mO + ' × ' + xS + ' = ' + yS + '. Level after <b>' + C.pl(xS, 'minute') + '</b>, both at <b>' + yS + ' metres</b>.'
      ],
      why: {
        M21: yS + ' is where they meet on the road (the output), not the minute (the input). They are level at minute ' + xS + ', when both are at ' + yS + ' metres.',
        G: 'Read one row at a time. At minute ' + k + ', Zero is at ' + rk[1] + ' m and One is at ' + rk[2] + ' m, which are not the same. Only at minute ' + xS + ' do both columns show ' + yS + '.'
      },
      steps: [
        { label: 'At minute ' + xS + ', how far along is Zero (metres)?', part: { kind: 'num', key: rows[xS][1] }, hint: 'Find minute ' + xS + ' in the first column and read across to Zero.' },
        { label: 'At minute ' + xS + ', how far along is One (metres)?', part: { kind: 'num', key: rows[xS][2] }, hint: 'Same row, One\'s column.' },
        { label: 'So they are level after', part: { kind: 'choice', opts: [{ t: C.pl(xS, 'minute'), ok: true }, { t: C.pl(yS, 'minute') }] }, hint: 'Level means the same place at the same minute. The minute is the input.' }
      ]
    };
  } });

  /* ---------------- SY-3a  L3 · FR (sentence) · graph: read the crossing in context ---------------- */
  C.add({ id: 'SY-3a', skill: '25', level: 3, order: 1, type: 'FR', std: STD, gen: function (R) {
    var p, q, tS, b0, yS, a0;
    do { p = R.pick([5, 10]); q = R.pick([5, 10]); tS = R.int(2, 6); b0 = R.pick([0, 10, 20]); yS = b0 + q * tS; a0 = yS + p * tS; }
    while (yS % 10 || a0 % 10 || a0 > 100 || b0 + 10 * q > 120 || yS === tS);
    var empty = a0 / p, yTop = upTo(Math.max(a0, Math.min(b0 + 10 * q, 120)), 20);
    var bTo = Math.min(10, (yTop - b0) / q);
    var lx = tS >= 5 ? 1 : 8;   // label the lines away from the crossing
    var la = a0 - p * lx >= 0 ? lx : 1;
    var grid = { x: [0, 10], y: [0, yTop], dx: 1, dy: 10, ly: 20, xl: 'Minutes', yl: 'Water (litres)', size: 360, label: 'Graph of the water in tank A (going down) and tank B (going up)',
      lines: [{ m: -p, b: a0, to: Math.min(10, empty) }, { m: q, b: b0, color: C.COL.line3, to: bTo }],
      pts: [{ x: la, y: a0 - p * la, l: 'Tank A', c: C.COL.line, r: 4 }, { x: lx, y: b0 + q * lx, l: 'Tank B', c: C.COL.line3, r: 4 }] };
    var opts = [
      { t: f(tS), ok: true },
      { t: f(yS), tag: 'M21' },
      empty <= 10 && empty === Math.round(empty) ? { t: f(empty), tag: 'M3' } : null,
      { t: f(tS + 1), tag: 'G' }
    ].filter(Boolean);
    return {
      stem: 'Tank A is being emptied and tank B is being filled. The graph shows the water in each tank.',
      fig: C.graph(grid),
      sentence: 'The tanks hold the same amount after {0} minutes, when each holds {1} litres.',
      think: 'Find where the two lines cross. Read down for the minutes, across for the litres.',
      parts: [
        { kind: 'choice', label: 'Minutes', inline: true, opts: uniq(opts) },
        { kind: 'num', label: 'Litres', inline: true, key: yS, wrong: wrongs(yS, [{ v: tS, tag: 'M21' }, { v: a0, tag: 'M9' }]) }
      ],
      answer: 'After ' + C.pl(tS, 'minute') + ', when each holds ' + yS + ' litres',
      answerFig: C.graph(Object.assign({}, grid, { size: 280, pts: grid.pts.concat([{ x: tS, y: yS, l: C.pt(tS, yS) }]) })),
      work: [
        'The tanks hold the same amount where the two lines cross: the same minute (input) gives the same litres (output).',
        'The lines cross at ' + C.pt(tS, yS) + ': read down to <b>' + tS + ' minutes</b> on the across axis (x-axis), and across to <b>' + yS + ' litres</b> on the up axis (y-axis).',
        'Check: tank A ' + a0 + ' − ' + p + ' × ' + tS + ' = ' + yS + ' litres; tank B ' + b0 + ' + ' + q + ' × ' + tS + ' = ' + yS + ' litres. The same.'
      ],
      why: {
        M21: 'You swapped them: ' + yS + ' is the amount of water (read on the up axis), and ' + tS + ' is the number of minutes (read on the across axis). The crossing is ' + C.pt(tS, yS) + '.',
        M3: 'At ' + C.pl(empty, 'minute') + ' tank A is empty: that is where its line meets the minutes axis, not where the two lines cross. They cross at ' + tS + ' minutes.',
        M9: a0 + ' litres is what tank A starts with (its start, at 0 minutes). At the crossing each tank holds ' + yS + ' litres.'
      },
      steps: [
        { label: 'Where do the two lines cross? Read down to the minutes axis: minutes =', part: { kind: 'num', key: tS }, hint: 'Find the point that is on both lines, then go straight down.' },
        { label: 'Read across from the crossing to the litres axis: litres =', part: { kind: 'num', key: yS }, hint: 'Go straight across from the crossing to the up axis (y-axis).' },
        { label: 'Check tank B: ' + b0 + ' + ' + q + ' × ' + tS + ' =', part: { kind: 'num', key: yS }, hint: 'Tank B starts at ' + b0 + ' litres and gains ' + q + ' litres every minute.' }
      ]
    };
  } });

  /* ---------------- SY-4a  L4 · NE · equation: solve mx + b = nx + c by undoing, then check ---------------- */
  C.add({ id: 'SY-4a', skill: '25', level: 4, order: 1, type: 'NE', std: STD, gen: function (R) {
    var m, n, xS, yS, b, c;
    do {
      m = R.nz(-3, 6); n = R.nz(-3, 6); xS = R.nz(-4, 8); yS = R.int(-10, 20);
      b = yS - m * xS; c = yS - n * xS;
    } while (m === n || Math.abs(m - n) < 2 || b === 0 || c === 0 || Math.abs(b) > 15 || Math.abs(c) > 15 || yS === xS || yS === -xS || b === c);
    var A = eq(m, b), B = eq(n, c);
    var hi = m > n ? { s: m, st: b, nm: 'A' } : { s: n, st: c, nm: 'B' }, lo = m > n ? { s: n, st: c } : { s: m, st: b };
    var k = hi.s - lo.s, rhs = lo.st - hi.st;
    var undo = f(lo.st) + ' ' + C.term(-hi.st);   // "4 + 5" undoes − 5, "14 − 10" undoes + 10
    var move = lo.s < 0 ? 'Add ' + xs(-lo.s) + ' to both sides' : 'Take ' + xs(lo.s) + ' away from both sides';
    var wx = [{ v: yS, tag: 'M21' }, { v: -xS, tag: 'M2' }];
    if (m + n !== 0 && (c - b) % (m + n) === 0) wx.push({ v: (c - b) / (m + n), tag: 'M2' });
    return {
      stem: 'Rule A is <b>' + A + '</b> and rule B is <b>' + B + '</b>. For which input x do both rules give the same output? What is that output?',
      think: 'Set the rules equal: ' + A.replace('y = ', '') + ' = ' + B.replace('y = ', '') + '. Then undo, last thing done first.',
      parts: [
        { kind: 'num', label: 'x =', key: xS, wrong: wrongs(xS, wx) },
        { kind: 'num', label: 'Both outputs: y =', key: yS, wrong: wrongs(yS, [{ v: xS, tag: 'M21' }]) }
      ],
      answer: 'x = ' + f(xS) + ', where both give y = ' + f(yS),
      work: [
        'Same output means ' + A.replace('y = ', '') + ' = ' + B.replace('y = ', '') + '. ' + move + ': ' + xs(k) + ' ' + C.term(hi.st) + ' = ' + f(lo.st) + '.',
        'Undo the ' + C.term(hi.st) + ': ' + xs(k) + ' = ' + undo + ' = ' + f(rhs) + '. Undo the × ' + k + ': x = ' + f(rhs) + ' ÷ ' + k + ' = <b>' + f(xS) + '</b>.',
        'Check in both rules: A gives ' + sub(m, xS, b) + ' = ' + f(yS) + ', B gives ' + sub(n, xS, c) + ' = ' + f(yS) + '. Both give <b>y = ' + f(yS) + '</b>.'
      ],
      why: {
        M21: 'You swapped the input and the output. The input where they are equal is x = ' + f(xS) + '; the output both rules give there is y = ' + f(yS) + '.',
        M2: 'Check the signs as you move terms. ' + xs(k) + ' = ' + undo + ' = ' + f(rhs) + ', so x = ' + f(rhs) + ' ÷ ' + k + ' = ' + f(xS) + '. Then check: both rules give ' + f(yS) + ' there.'
      },
      steps: [
        { label: move + ' of ' + A.replace('y = ', '') + ' = ' + B.replace('y = ', '') + '. How many x\'s are left?', part: { kind: 'num', key: k }, hint: 'Rule ' + hi.nm + ' has the bigger step: ' + f(hi.s) + ' − ' + par(lo.s) + '.' },
        { label: 'Now ' + xs(k) + ' ' + C.term(hi.st) + ' = ' + f(lo.st) + '. Undo the ' + C.term(hi.st) + ': ' + xs(k) + ' =', part: { kind: 'num', key: rhs }, hint: undo + '.' },
        { label: 'Undo the × ' + k + ': x =', part: { kind: 'num', key: xS }, hint: f(rhs) + ' ÷ ' + k + '.' },
        { label: 'Check in rule A: ' + sub(m, xS, b) + ' =', part: { kind: 'num', key: yS }, hint: 'Multiply first, then add. Rule B should give the same.' }
      ]
    };
  } });

  /* ---------------- SY-4b  L4 · interactive · graph: drag the marker to where the lines cross ---------------- */
  C.add({ id: 'SY-4b', skill: '25', level: 4, order: 2, type: 'interactive', ia: true, std: STD, gen: function (R) {
    var mA, mB, xS, yS, bA, bB;
    do {
      mA = R.pick([-3, -2, -1, 1, 2, 3]); mB = R.pick([-3, -2, -1, 1, 2, 3]); xS = R.nz(-5, 5); yS = R.int(-7, 7);
      bA = yS - mA * xS; bB = yS - mB * xS;
    } while (mA === mB || Math.abs(bA) > 9 || Math.abs(bB) > 9 || xS === yS || (xS === 0 && yS === 0));
    function onA(p) { return p[1] === mA * p[0] + bA; }
    function onB(p) { return p[1] === mB * p[0] + bB; }
    function lab(m, b, avoid) { var best = null; for (var x = -8; x <= 8; x++) { var y = m * x + b; if (Math.abs(y) <= 8 && Math.abs(x - avoid) >= 3 && (!best || Math.abs(x) > Math.abs(best[0]))) best = [x, y]; } return best || [xS, yS]; }
    var pa = lab(mA, bA, xS), pb = lab(mB, bB, xS);
    var A = eq(mA, bA), B = eq(mB, bB);
    var grid = { x: [-10, 10], y: [-10, 10], size: 400, label: 'The lines A: ' + A + ' and B: ' + B,
      lines: [{ m: mA, b: bA }, { m: mB, b: bB, color: C.COL.line3 }],
      pts: [{ x: pa[0], y: pa[1], l: 'A', c: C.COL.line, r: 4 }, { x: pb[0], y: pb[1], l: 'B', c: C.COL.line3, r: 4 }] };
    var start = onA([0, 0]) && onB([0, 0]) ? [9, -9] : [0, 0];
    return {
      stem: 'Line A is <b>' + A + '</b> and line B is <b>' + B + '</b>. Drag the orange marker to the point where both rules give the same output. Then give that output.',
      think: 'The marker must sit on both lines at once. Check it in both equations.',
      parts: [
        { kind: 'points', label: 'Where the lines cross', grid: grid, start: [start], names: ['Marker'], key: [[xS, yS]],
          readout: function (cur) { var p = cur[0]; return 'Marker at ' + C.pt(p[0], p[1]) + (onA(p) && onB(p) ? ': on both lines.' : onA(p) ? ': on line A only.' : onB(p) ? ': on line B only.' : '.'); },
          check: function (cur) {
            var p = cur[0];
            if (onA(p) && onB(p)) return { ok: true };
            if (p[0] === yS && p[1] === xS) return { ok: false, tag: 'M21' };
            if (onA(p) || onB(p)) return { ok: false, tag: 'M21' };
            return { ok: false, tag: 'G' };
          } },
        { kind: 'num', label: 'Both rules give y =', key: yS, wrong: wrongs(yS, [{ v: xS, tag: 'M21' }]) }
      ],
      answer: 'They cross at ' + C.pt(xS, yS) + ': at x = ' + f(xS) + ' both give y = ' + f(yS),
      answerFig: C.graph(Object.assign({}, grid, { size: 260, pts: grid.pts.concat([{ x: xS, y: yS, l: C.pt(xS, yS) }]) })),
      work: [
        'Both rules give the same output where the lines cross: the point is on line A and on line B.',
        'The lines cross at <b>' + C.pt(xS, yS) + '</b>.',
        'Check: A gives ' + sub(mA, xS, bA) + ' = ' + f(yS) + ' and B gives ' + sub(mB, xS, bB) + ' = ' + f(yS) + '. Same input x = ' + f(xS) + ', same output <b>y = ' + f(yS) + '</b>.'
      ],
      why: {
        M21: 'The point must be on both lines, with x across and y up. The lines cross at ' + C.pt(xS, yS) + ': x = ' + f(xS) + ' along the across axis (x-axis), y = ' + f(yS) + ' up the up axis (y-axis). Check it: both rules give ' + f(yS) + ' when x = ' + f(xS) + '.',
        G: 'Put the marker where the two lines meet, ' + C.pt(xS, yS) + ', then check it in both equations.'
      },
      steps: [
        { label: 'Line A at x = ' + f(xS) + ': ' + sub(mA, xS, bA) + ' =', part: { kind: 'num', key: yS }, hint: 'Multiply first, then add.' },
        { label: 'Line B at x = ' + f(xS) + ': ' + sub(mB, xS, bB) + ' =', part: { kind: 'num', key: yS }, hint: 'Multiply first, then add.' },
        { label: 'So the lines cross at', part: { kind: 'choice', opts: uniq([{ t: C.pt(xS, yS), ok: true }, { t: C.pt(yS, xS) }, { t: C.pt(0, bA) }]) }, hint:'Same input, same output: x = ' + f(xS) + ' and y = ' + f(yS) + '.' }
      ]
    };
  } });

  /* ---------------- SY-5a  L5 · MS · equations, table, words: which pairs are never equal (parallel) ---------------- */
  C.add({ id: 'SY-5a', skill: '25', level: 5, order: 1, type: 'MS', std: STD, gen: function (R) {
    var kinds;
    do { kinds = R.shuffle(['par', 'cross', R.pick(['par', 'same', 'cross']), R.pick(['par', 'cross'])]); }
    while (kinds.filter(function (k) { return k === 'par'; }).length > 2);
    // one pair of rules per card: [m, b, n, c] (+ the crossing for 'cross' / 'same')
    var cards = kinds.map(function (kind) {
      var m, n, b, c, xS = null, yS = null;
      if (kind === 'par') { do { m = R.nz(-3, 5); b = R.int(-6, 12); c = R.int(-6, 12); } while (Math.abs(b - c) < 2); n = m; }
      else if (kind === 'same') { do { m = R.nz(-3, 5); n = R.nz(-3, 5); b = R.int(-5, 10); } while (m === n); c = b; xS = 0; yS = b; }
      else { do { m = R.nz(-3, 5); n = R.nz(-3, 5); xS = R.int(1, 6); yS = R.int(-5, 15); b = yS - m * xS; c = yS - n * xS; } while (m === n || b === c || Math.abs(b) > 15 || Math.abs(c) > 15); }
      return { kind: kind, m: m, b: b, n: n, c: c, xS: xS, yS: yS };
    });
    function way(s) { return (s > 0 ? 'goes up ' : 'goes down ') + f(Math.abs(s)); }
    function show(cd, i) {
      var h = '<b>Pair ' + (i + 1) + ':</b> ';
      if (i === 1) return h + 'the table' + C.table({ cols: ['x', 'A', 'B'], rows: [0, 1, 2, 3].map(function (x) { return [x, cd.m * x + cd.b, cd.n * x + cd.c]; }) });
      if (i === 2) return h + 'A starts at ' + f(cd.b) + ' and ' + way(cd.m) + ' for every 1 more input. B starts at ' + f(cd.c) + ' and ' + way(cd.n) + ' for every 1 more input.';
      return h + eq(cd.m, cd.b) + ' and ' + eq(cd.n, cd.c);
    }
    var opts = cards.map(function (cd, i) {
      if (cd.kind === 'par') return { t: show(cd, i), ok: true, missTag: 'M11' };
      if (cd.kind === 'same') return { t: show(cd, i), ok: false, tag: 'M21' };
      return { t: show(cd, i), ok: false, tag: 'M11' };
    });
    var never = [], diffStart = [], crosses = [];
    cards.forEach(function (cd, i) { if (cd.kind === 'par') never.push(i + 1); else crosses.push(i + 1); if (cd.b !== cd.c) diffStart.push(i + 1); });
    function setText(list) { return !list.length ? 'None of them' : list.length === 1 ? 'Pair ' + list[0] + ' only' : 'Pairs ' + list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]; }
    // a fresh parallel pair for the "why" part, so it does not give away which card is parallel
    var P = {};
    do { P.m = R.pick([2, 3, 4, 5]); P.b = R.int(-4, 10); P.c = R.int(-4, 10); } while (Math.abs(P.b - P.c) < 2 || P.b === 0 || P.c === 0);
    var gap = Math.abs(P.b - P.c), pairP = eq(P.m, P.b) + ' and ' + eq(P.m, P.c);
    var reason = uniq([
      { t: 'Both rules have the same step (' + f(P.m) + '), so the gap of ' + gap + ' stays the same for every input', ok: true },
      { t: 'They start at different values, and two rules with different starts can never meet', tag: 'M11' },
      { t: 'One rule starts higher, so the other one can never catch up', tag: 'M9' },
      { t: 'They are equal at x = 0, where both lines start', tag: 'M21' }
    ]);
    var stepOpts = uniq([{ t: setText(never), ok: true }, { t: setText(diffStart) }, { t: setText(crosses) }, { t: 'None of them' }]);
    var work = cards.map(function (cd, i) {
      var h = 'Pair ' + (i + 1) + ': ';
      if (cd.kind === 'par') return h + 'the same step (' + f(cd.m) + ') and different starts (' + f(cd.b) + ' and ' + f(cd.c) + '), so the gap stays ' + Math.abs(cd.b - cd.c) + ' for every input: <b>never equal</b> (parallel lines).';
      if (cd.kind === 'same') return h + 'both start at ' + f(cd.b) + ', so they are equal at x = 0 (both ' + f(cd.b) + ').';
      return h + 'different steps (' + f(cd.m) + ' and ' + f(cd.n) + '), so the gap closes: equal at x = ' + cd.xS + ', where both give ' + f(cd.yS) + '.';
    });
    return {
      stem: 'Two rules are equal at an input when they give the same output there. Select <b>every</b> pair of rules that is <b>never</b> equal. Then say why ' + pairP + ' are never equal.',
      think: 'Compare the steps first. Same step: does the gap ever close?',
      parts: [
        { kind: 'multi', label: 'Never equal', opts: opts },
        { kind: 'choice', label: pairP + ' are never equal because', opts: reason }
      ],
      answer: 'Never equal: ' + setText(never) + '. Same step, different start: parallel lines, and the gap never closes.',
      work: work,
      why: {
        M11: 'Different starts are not enough to decide. When the steps are different the gap closes and the lines cross; only the same step with a different start keeps the gap the same for ever (parallel lines).',
        M21: 'Equal at x = 0 still counts: two rules with the same start give the same output at input 0, so that pair is equal there.',
        M9: 'Starting higher is about the start, not the step. In ' + pairP + ' the steps are the same (' + f(P.m) + '), so the gap of ' + gap + ' never changes. If the higher one had a smaller step, the other would catch up.'
      },
      steps: [
        { label: 'In ' + pairP + ', at x = 0, how far apart are the two outputs?', part: { kind: 'num', key: gap }, hint: 'The starts are ' + f(P.b) + ' and ' + f(P.c) + '.' },
        { label: 'For every 1 more input, by how much does that gap close?', part: { kind: 'num', key: 0 }, hint: 'Both rules have the step ' + f(P.m) + ': ' + f(P.m) + ' − ' + f(P.m) + '.' },
        { label: 'A pair is never equal when the steps match and the starts differ. So the pairs that are never equal are', part: { kind: 'choice', opts: stepOpts }, hint: 'Check each pair\'s steps. Different steps always meet somewhere.' }
      ]
    };
  } });
})();
