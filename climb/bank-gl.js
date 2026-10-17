/* Climb question bank: skill 24 (graph a line from its equation; intercepts).
   From y = mx + b: plot the start (0, b) on the up axis, take the step (across, then up or down) to place
   more points, draw the line; find where it crosses the across axis (x-intercept, y = 0) and the up axis
   (y-intercept, x = 0) from an equation or a table. Words from the lessons (Films 7 and 10): "start",
   "step", "crosses the up axis", stairs (slope triangles).
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt;
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 × (−2)
  function eq(m, b) { return C.eqText(m, b); }
  function rhs(m, b) { return C.eqText(m, b).replace(/^y = /, ''); }   // "2x − 6"
  function mx(m) { return rhs(m, 0); }                                  // "2x", "−x", "(1/2)x"
  function ud(v) { return v < 0 ? 'down' : 'up'; }
  // [rise, run] for a slope, run > 0
  function rr(m) { var q = C.asFrac(m); return [q[0], q[1]]; }
  // drop wrong values that equal the key or repeat an earlier one
  function wr(key, list) {
    var out = [];
    list.forEach(function (w) { if (!isFinite(w.v) || C.near(w.v, key)) return; if (out.some(function (o) { return C.near(o.v, w.v); })) return; out.push(w); });
    return out;
  }
  var STD_EQ = ['8.F.B.4', 'HSF-IF.C.7'], STD_GR = ['8.F.A.3', '8.F.B.4', 'HSF-IF.C.7'];

  /* ---------------- GL-1a: the start and the step from the equation ---------------- */
  C.add({ id: 'GL-1a', skill: '24', level: 2, type: 'MC', std: STD_EQ, gen: function (R) {
    var m, b; do { m = R.int(2, 5); b = R.int(1, 9); } while (b === m);
    var flip = R.chance(0.3), shown = flip ? 'y = ' + b + ' + ' + m + 'x' : eq(m, b);
    return {
      stem: 'You are going to graph the line <b>' + shown + '</b>. Where do you plot the start, and which way is the step?',
      think: 'The number on its own is the start. The number with x is the step.',
      parts: [
        { kind: 'choice', label: 'The start (y-intercept): the line crosses the up axis (y-axis) at', opts: [{ t: C.pt(0, b), ok: true }, { t: C.pt(b, 0), tag: 'M3' }, { t: C.pt(0, m), tag: 'M9' }, { t: C.pt(1, m + b) }] },
        { kind: 'choice', label: 'The step (slope): from the start, go', keep: true, opts: [{ t: '1 across, ' + m + ' up', ok: true }, { t: '1 across, ' + b + ' up', tag: 'M9' }, { t: '1 across, ' + m + ' down', tag: 'M2' }, { t: m + ' across, 1 up', tag: 'M1' }] }
      ],
      answer: 'Start at ' + C.pt(0, b) + ', then step 1 across and ' + m + ' up',
      work: [
        'The start (y-intercept) is the number on its own: at x = 0, y = ' + m + ' × 0 + ' + b + ' = ' + b + '. Plot <b>' + C.pt(0, b) + '</b> on the up axis (y-axis).',
        'The step (slope) is the number with x: for every 1 across, y goes up ' + m + '.',
        'From ' + C.pt(0, b) + ' go 1 across and <b>' + m + ' up</b> to ' + C.pt(1, m + b) + ', then draw the line through the two points.'
      ],
      why: {
        M3: C.pt(b, 0) + ' is on the across axis (x-axis). The start is where the line crosses the up axis, where x = 0: ' + C.pt(0, b) + '.',
        M9: 'You swapped the start and the step. In ' + shown + ', ' + b + ' is on its own, so it is the start; ' + m + ' is with x, so it is the step.',
        M2: 'The step is +' + m + ', so the line goes up ' + m + ' for every 1 across, not down.',
        M1: m + ' across and 1 up is run over rise. The step ' + m + ' means 1 across and ' + m + ' up: the climb goes with the up.'
      },
      steps: [
        { label: 'Put x = 0: y = ' + m + ' × 0 + ' + b + ' =', part: { kind: 'num', key: b }, hint: 'Anything times 0 is 0, so only the number on its own is left.' },
        { label: 'The step: for every 1 more x, y goes up by', part: { kind: 'num', key: m }, hint: 'It is the number multiplied by x.' },
        { label: 'So you plot the start and then go', part: { kind: 'choice', keep: true, opts: [{ t: C.pt(0, b) + ', then 1 across and ' + m + ' up', ok: true }, { t: C.pt(b, 0) + ', then 1 across and ' + m + ' up' }, { t: C.pt(0, m) + ', then 1 across and ' + b + ' up' }] }, hint: 'The start is on the up axis, at (0, ' + b + ').' }
      ]
    };
  } });

  /* ---------------- GL-1b: which graph shows the equation? ---------------- */
  C.add({ id: 'GL-1b', skill: '24', level: 3, type: 'MC', std: STD_GR, gen: function (R) {
    var m, b; do { m = R.pick([1, 2, 3, -1, -2, -3]); b = R.int(1, 6); } while (b === m);
    // a neutral label per option (screen readers must not read out the line's points: that would give the answer away)
    function small(mm, bb, name) {
      return '<b>' + name + '</b>' + C.graph({ x: [-8, 8], y: [-8, 8], size: 170, lines: [{ m: mm, b: bb }], pts: Math.abs(bb) <= 8 ? [{ x: 0, y: bb, r: 4 }] : [], label: name + ': a line on a grid' });
    }
    var cands = [[b, m, 'M9'], [-m, b, 'M2'], [m, -m * b, 'M3']];
    if (Math.abs(m) >= 2) cands.push([1 / m, b, 'M1']);
    cands = R.shuffle(cands); cands.push([m, -b, 'M2']);
    var seen = {}, picked = [[m, b, null]]; seen[m + ',' + b] = 1;
    cands.forEach(function (c) { var k = c[0] + ',' + c[1]; if (seen[k] || picked.length >= 4) return; seen[k] = 1; picked.push(c); });
    // shuffle here and letter them in order, so the page shows Graph A, B, C, D (keep: true)
    var opts = R.shuffle(picked).map(function (c, i) { var name = 'Graph ' + 'ABCD'.charAt(i); return c[2] === null ? { t: small(c[0], c[1], name), ok: true } : { t: small(c[0], c[1], name), tag: c[2] }; });
    return {
      stem: 'Which graph shows the line <b>' + eq(m, b) + '</b>?',
      think: 'Find the start on the up axis first. Then check the step: 1 across, how far up or down?',
      parts: [{ kind: 'choice', label: 'The graph of ' + eq(m, b), keep: true, opts: opts }],
      answer: 'The line that crosses the up axis at ' + C.pt(0, b) + ' and goes ' + ud(m) + ' ' + Math.abs(m) + ' for every 1 across',
      answerFig: C.graph({ x: [-8, 8], y: [-8, 8], size: 240, lines: [{ m: m, b: b }, { seg: [[0, b], [1, b], [1, b + m]], color: C.COL.line2, dash: true, w: 2.5 }], pts: [{ x: 0, y: b, l: 'start ' + C.pt(0, b) }, { x: 1, y: m + b }], label: 'The line ' + eq(m, b) }),
      work: [
        'The start (y-intercept) is ' + b + ': the line crosses the up axis (y-axis) at ' + C.pt(0, b) + '.',
        'The step (slope) is ' + f(m) + ': from the start go 1 across and ' + Math.abs(m) + ' ' + ud(m) + ' to ' + C.pt(1, m + b) + '.',
        'The right graph goes through <b>' + C.pt(0, b) + '</b> and <b>' + C.pt(1, m + b) + '</b>, ' + (m > 0 ? 'rising' : 'falling') + ' from left to right.'
      ],
      why: {
        M9: 'That graph swaps the start and the step: it crosses the up axis at ' + f(m) + ' and its step is ' + f(b) + '. In ' + eq(m, b) + ' the start is ' + b + ' and the step is ' + f(m) + '.',
        M2: 'That graph has a sign wrong. The step ' + f(m) + ' means the line goes ' + ud(m) + ' from left to right, and the start ' + b + ' is above the across axis.',
        M3: 'That graph crosses the across axis (x-axis) at ' + b + '. The start ' + b + ' goes on the up axis (y-axis), at ' + C.pt(0, b) + '.',
        M1: 'That graph goes ' + Math.abs(m) + ' across for 1 ' + ud(m) + ': run over rise. The step ' + f(m) + ' means 1 across and ' + Math.abs(m) + ' ' + ud(m) + '.'
      },
      steps: [
        { label: 'The start: at x = 0, y =', part: { kind: 'num', key: b }, hint: 'The number on its own in ' + eq(m, b) + '.' },
        { label: 'Take one step: at x = 1, y = ' + f(m) + ' × 1 + ' + b + ' =', part: { kind: 'num', key: m + b }, hint: 'Start at ' + b + ' and go ' + ud(m) + ' ' + Math.abs(m) + '.' },
        { label: 'So the right graph goes through', part: { kind: 'choice', keep: true, opts: [{ t: C.pt(0, b) + ' and ' + C.pt(1, m + b), ok: true }, { t: C.pt(0, b) + ' and ' + C.pt(1, b - m) }, { t: C.pt(b, 0) + ' and ' + C.pt(b + 1, m) }] }, hint: 'Use the two points you just found.' }
      ]
    };
  } });

  /* ---------------- GL-2a: drag the start, then take the step (interactive) ---------------- */
  C.add({ id: 'GL-2a', skill: '24', level: 4, type: 'interactive', ia: true, std: STD_GR, gen: function (R) {
    var m = R.pick([2, -2, 3, -3, 0.5, -0.5, 2 / 3, -2 / 3, 1.5, -1.5, 1 / 3, -3]), b = R.nz(-6, 6), p = rr(m), rise = p[0], run = p[1];
    var x2 = run, y2 = b + rise;
    function check(cur) {
      var A = cur[0], B = cur[1];
      if (A[0] === B[0]) return { ok: false };
      var s = (B[1] - A[1]) / (B[0] - A[0]), c = A[1] - s * A[0];
      if (C.near(s, m, 1e-6) && C.near(c, b, 1e-6)) return { ok: true };
      if (C.near(s, b, 1e-6) && C.near(c, m, 1e-6)) return { ok: false, tag: 'M9' };
      if (C.near(c, b, 1e-6) && C.near(s, -m, 1e-6)) return { ok: false, tag: 'M2' };
      if (C.near(c, b, 1e-6) && C.near(s, 1 / m, 1e-6)) return { ok: false, tag: 'M1' };
      if (C.near(s, m, 1e-6) && C.near(c, -m * b, 1e-6)) return { ok: false, tag: 'M3' };
      if (C.near(s, m, 1e-6) && C.near(c, -b, 1e-6)) return { ok: false, tag: 'M2' };
      return { ok: false };
    }
    var stair = { seg: [[0, b], [x2, b], [x2, y2]], color: C.COL.line2, dash: true, w: 2.5 };
    var g = { x: [-10, 10], y: [-10, 10], size: 400, label: 'Empty grid from −10 to 10' };
    return {
      stem: 'Graph the line <b>' + eq(m, b) + '</b>. Drag the <b>Start</b> point to where the line crosses the up axis (y-axis). Then drag <b>Next</b> one stair along, using the step.',
      think: 'Start: the number on its own. Step ' + f(m) + ': ' + run + ' across, ' + Math.abs(rise) + ' ' + ud(rise) + '.',
      parts: [{ kind: 'points', label: 'Your line', grid: g, start: [[-8, -9], [8, -9]], names: ['Start', 'Next'], connect: 'line', key: [[0, b], [x2, y2]], check: check }],
      answerFig: C.graph(Object.assign({}, g, { size: 260, lines: [{ m: m, b: b }, stair], pts: [{ x: 0, y: b, l: 'Start ' + C.pt(0, b) }, { x: x2, y: y2, l: C.pt(x2, y2) }], label: 'The line ' + eq(m, b) })),
      answer: 'The line through ' + C.pt(0, b) + ' and ' + C.pt(x2, y2) + ' (any two points on ' + eq(m, b) + ')',
      work: [
        'The start (y-intercept) is ' + f(b) + ': put a point at ' + C.pt(0, b) + ' on the up axis (y-axis).',
        'The step (slope) is ' + f(m) + ' = ' + f(rise) + ' ÷ ' + run + ': one stair is ' + C.pl(run, 'square') + ' across and ' + C.pl(Math.abs(rise), 'square') + ' ' + ud(rise) + '.',
        'From ' + C.pt(0, b) + ' that lands on <b>' + C.pt(x2, y2) + '</b>. The line through the two points is ' + eq(m, b) + '. A bigger stair on the same line gives the same step.'
      ],
      why: {
        M9: 'Your line crosses the up axis at ' + f(m) + ' and has step ' + f(b) + ': the start and the step are swapped. Start at ' + C.pt(0, b) + ' and step ' + f(m) + '.',
        M2: 'Your line has a sign wrong. The start is ' + f(b) + ', and the step ' + f(m) + ' means the line goes ' + ud(m) + ' as you move right.',
        M1: 'Your stair goes ' + Math.abs(rise) + ' across and ' + run + ' ' + ud(rise) + ': run over rise. The step ' + f(m) + ' is ' + run + ' across, ' + Math.abs(rise) + ' ' + ud(rise) + '.',
        M3: 'Your line crosses the across axis (x-axis) at ' + f(b) + '. The start ' + f(b) + ' goes on the up axis (y-axis), at ' + C.pt(0, b) + '.'
      },
      steps: [
        { label: 'The start: at x = 0, y =', part: { kind: 'num', key: b }, hint: 'The number on its own in ' + eq(m, b) + '.' },
        { label: 'The step is ' + f(m) + '. For every ' + C.pl(run, 'square') + ' across, y changes by', part: { kind: 'num', key: rise }, hint: f(m) + ' × ' + run + ' = ' + f(rise) + '. Down is negative.' },
        { label: 'So from ' + C.pt(0, b) + ' the Next point goes at', part: { kind: 'choice', keep: true, opts: [{ t: C.pt(x2, y2), ok: true }, { t: C.pt(x2, b - rise) }, { t: C.pt(rise, b + run) }] }, hint: run + ' across first, then ' + Math.abs(rise) + ' ' + ud(rise) + '.' }
      ]
    };
  } });

  /* ---------------- GL-2b: both intercepts from the equation ---------------- */
  C.add({ id: 'GL-2b', skill: '24', level: 4, type: 'NE', std: STD_EQ, gen: function (R) {
    var m, k, b;
    do { m = R.pick([1, 2, 3, 4, -1, -2, -3, -4]); k = R.nz(-6, 6); b = -m * k; } while (Math.abs(b) > 12 || k === b || m === b || m === k);
    return {
      stem: 'For the line <b>' + eq(m, b) + '</b>, find where it crosses the across axis (the x-intercept) and where it crosses the up axis (the y-intercept, the start).',
      think: 'On the across axis y = 0. On the up axis x = 0.',
      parts: [
        { kind: 'num', label: 'x-intercept: x =', key: k, wrong: wr(k, [{ v: b, tag: 'M3' }, { v: -k, tag: 'M2' }, { v: m, tag: 'M12' }]) },
        { kind: 'num', label: 'y-intercept: y =', key: b, wrong: wr(b, [{ v: k, tag: 'M3' }, { v: m, tag: 'M9' }, { v: -b, tag: 'M2' }]) }
      ],
      answer: 'x-intercept ' + f(k) + ', the point ' + C.pt(k, 0) + '; y-intercept ' + f(b) + ', the point ' + C.pt(0, b),
      work: [
        'y-intercept (the start): put x = 0. y = ' + f(m) + ' × 0 ' + C.term(b) + ' = <b>' + f(b) + '</b>, the point ' + C.pt(0, b) + ' on the up axis (y-axis).',
        'x-intercept: put y = 0. 0 = ' + rhs(m, b) + ', so ' + mx(m) + ' = ' + f(-b) + '.',
        'x = ' + f(-b) + ' ÷ ' + par(m) + ' = <b>' + f(k) + '</b>, the point ' + C.pt(k, 0) + ' on the across axis (x-axis). Check: ' + f(m) + ' × ' + par(k) + ' ' + C.term(b) + ' = 0.'
      ],
      why: {
        M3: 'You swapped the two crossings. The line crosses the up axis (x = 0) at ' + f(b) + ' and the across axis (y = 0) at ' + f(k) + '.',
        M2: 'Check the sign by putting it back in: the x-intercept must make y = 0. ' + f(m) + ' × ' + par(k) + ' ' + C.term(b) + ' = 0, so x = ' + f(k) + '; and at x = 0, y = ' + f(b) + '.',
        M12: f(m) + ' is the step (slope): how steep the line is. It is not where the line crosses an axis.',
        M9: f(m) + ' is the step (slope). The start (y-intercept) is the number on its own: ' + f(b) + '.'
      },
      steps: [
        { label: 'y-intercept: at x = 0, y = ' + f(m) + ' × 0 ' + C.term(b) + ' =', part: { kind: 'num', key: b }, hint: 'Anything times 0 is 0.' },
        { label: 'x-intercept: at y = 0, 0 = ' + rhs(m, b) + '. So ' + mx(m) + ' =', part: { kind: 'num', key: -b }, hint: 'Undo the ' + C.term(b) + ': ' + (b < 0 ? 'add ' + f(-b) : 'take away ' + f(b)) + ' on both sides.' },
        { label: 'x = ' + f(-b) + ' ÷ ' + par(m) + ' =', part: { kind: 'num', key: k }, hint: 'Divide by the step, ' + f(m) + '. Keep the signs.' }
      ]
    };
  } });

  /* ---------------- GL-3a: intercepts from a table in a story (x skips by 2) ---------------- */
  C.add({ id: 'GL-3a', skill: '24', level: 5, type: 'TT', std: STD_GR, gen: function (R) {
    var s, W, w0;
    do { s = R.int(3, 12); W = R.int(8, 15); w0 = R.int(1, 3); } while (W < w0 + 8);
    var b = s * W, nm = R.name();
    function bal(w) { return b - s * w; }
    var ws = [w0, w0 + 2, w0 + 4, w0 + 6], b8 = bal(w0) + 2 * s * w0, W8 = w0 + bal(w0) / (2 * s);
    return {
      stem: nm + '\'s bus card has some riyals on it. Every week ' + nm + ' spends the same amount. The table shows the balance on some weeks. Find the start (the y-intercept) and the week when the graph crosses the across axis (the x-intercept). What does that crossing mean?',
      fig: C.table({ cols: ['Week', 'Balance (riyals)'], rows: ws.map(function (w) { return [w, bal(w)]; }) }),
      think: 'The weeks go up by 2. Find the change for 1 week first.',
      parts: [
        { kind: 'num', label: 'Start: riyals at week 0', key: b, wrong: wr(b, [{ v: bal(w0), tag: 'G' }, { v: s, tag: 'M9' }, { v: b8, tag: 'M8' }]) },
        { kind: 'num', label: 'x-intercept: week', key: W, wrong: wr(W, [{ v: b, tag: 'M3' }, { v: W8, tag: 'M8' }, { v: s, tag: 'M12' }]) },
        { kind: 'choice', label: 'The x-intercept means', opts: [{ t: 'the week the card runs out of money', ok: true }, { t: 'the riyals on the card at the start', tag: 'M3' }, { t: 'the riyals ' + nm + ' spends each week', tag: 'M12' }, { t: 'the week ' + nm + ' started using the card' }] }
      ],
      answer: 'Start ' + b + ' riyals; x-intercept week ' + W + ', when the card runs out of money',
      work: [
        'Each row is 2 weeks later and the balance drops by ' + 2 * s + ' riyals, so the step (rate of change) is −' + 2 * s + ' ÷ 2 = −' + s + ' riyals per week.',
        'Start (y-intercept): go back ' + C.pl(w0, 'week') + ' from week ' + w0 + ': ' + bal(w0) + ' + ' + s + ' × ' + w0 + ' = <b>' + b + ' riyals</b>. The rule is y = ' + b + ' − ' + s + 'x.',
        'x-intercept: the balance is 0 when ' + b + ' − ' + s + 'x = 0, so x = ' + b + ' ÷ ' + s + ' = <b>week ' + W + '</b>. The point ' + C.pt(W, 0) + ' on the across axis is when the card runs out.'
      ],
      why: {
        G: bal(w0) + ' riyals is the balance at week ' + w0 + ', not week 0. Go back ' + C.pl(w0, 'week') + ': add ' + s + ' riyals for each.',
        M9: s + ' riyals is what ' + nm + ' spends each week: the step, not the start.',
        M8: 'You used ' + 2 * s + ' riyals as the step, but that is the change over 2 weeks. The table skips 2 weeks, so per week it is ' + 2 * s + ' ÷ 2 = ' + s + ' riyals.',
        M3: b + ' riyals is the start, where the graph crosses the up axis (y-axis). The x-intercept is where the balance is 0, on the across axis (x-axis): week ' + W + '.',
        M12: s + ' riyals per week is the step: how steep the line is, not where it crosses the across axis.'
      },
      steps: [
        { label: 'Step per week: (' + bal(w0 + 2) + ' − ' + bal(w0) + ') ÷ 2 =', part: { kind: 'num', key: -s }, hint: 'The balance changes by ' + f(-2 * s) + ' over 2 weeks. Divide by 2. Going down is negative.' },
        { label: 'Start: go back to week 0. ' + bal(w0) + ' + ' + s + ' × ' + w0 + ' =', part: { kind: 'num', key: b }, hint: 'Each week back adds ' + s + ' riyals.' },
        { label: 'The card is empty when ' + b + ' − ' + s + 'x = 0. x = ' + b + ' ÷ ' + s + ' =', part: { kind: 'num', key: W }, hint: 'How many weeks of ' + s + ' riyals use up ' + b + ' riyals?' },
        { label: 'So the x-intercept ' + C.pt(W, 0) + ' means', part: { kind: 'choice', keep: true, opts: [{ t: 'the week the card runs out of money', ok: true }, { t: 'the riyals on the card at the start' }, { t: 'the riyals spent each week' }] }, hint: 'On the across axis the balance (y) is 0.' }
      ]
    };
  } });
})();
