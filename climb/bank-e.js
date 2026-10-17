/* Climb question bank: skill 11 (equation from a graph), skill 12 (equation from a table or two points)
   and skill 13 (slope and intercept in context).
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt, M = '−';
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 × (−2)
  function eq(m, b) { return C.eqText(m, b); }

  // tagged wrong lines for an equation part: list of [m, b, tag]; drops any that match the key or each other
  function wl(m, b, list) {
    var key = C.line(m, b), out = [];
    list.forEach(function (w) {
      if (!isFinite(w[0]) || !isFinite(w[1])) return;
      var g = C.line(w[0], w[1]);
      if (C.sameFn(g, key)) return;
      if (out.some(function (o) { return C.sameFn(o.f, g); })) return;
      out.push({ f: g, tag: w[2] });
    });
    return out;
  }

  // a −10..10 graph of one line with marked lattice points
  function lineGraph(m, b, pts, size, label) {
    return C.graph({ x: [-10, 10], y: [-10, 10], size: size, lines: [{ m: m, b: b }], pts: pts, label: label || 'Graph of a straight line through ' + pts.map(function (p) { return C.pt(p.x, p.y); }).join(' and ') });
  }
  function upDown(m) { return (m > 0 ? 'up ' : 'down ') + f(Math.abs(m)); }
  // the last guided step: pick the whole equation (wrong options: m and b swapped, slope sign flipped)
  function eqStep(m, b, xv, yv) {
    var e = function (a, c) { return xv ? C.eqText(a, c, yv, xv) : eq(a, c); };
    return { label: 'So the equation is', part: { kind: 'choice', opts: [{ t: e(m, b), ok: true }, { t: e(b, m) }, { t: e(-m, b) }] }, hint: (yv || 'y') + ' = (step) × ' + (xv || 'x') + ' + (start). The step is ' + f(m) + ' and the start is ' + f(b) + '.' };
  }

  /* ---------------- Skill 11 Equation from a graph ---------------- */
  C.add({ id: 'EQ-3b', skill: '11', level: 3, order: 1, type: 'MC', gen: function (R) {
    var m, xi, b;
    do { m = R.pick([-3, -2, -1, 1, 2, 3]); xi = R.nz(-6, 6); b = -m * xi; } while (Math.abs(b) > 8 || b === m || xi === b);
    var x2 = Math.abs(m + b) <= 9 ? 1 : -1, y2 = m * x2 + b;
    var opts = [
      { t: eq(m, b), ok: true },
      { t: eq(b, m), tag: 'M9' },
      { t: eq(-m, b), tag: 'M2' },
      { t: eq(m, xi), tag: 'M3' },
      { t: eq(m, 0), tag: 'M16' }
    ];
    return {
      stem: 'Which equation matches the graph?',
      fig: lineGraph(m, b, [{ x: 0, y: b }, { x: x2, y: y2 }]),
      think: 'Where does it cross the y-axis? How much does y change for every 1 step right?',
      parts: [{ kind: 'choice', label: 'The equation is', opts: opts }],
      answer: eq(m, b),
      work: [
        'The line crosses the y-axis at (0, ' + f(b) + '), so the y-intercept (the start) is b = ' + f(b) + '.',
        'For every 1 step right, the line goes ' + upDown(m) + ', so the slope (the step) is m = ' + f(m) + '.',
        'Equation: <b>' + eq(m, b) + '</b>'
      ],
      why: {
        M9: 'You swapped them: ' + f(m) + ' is the slope and ' + f(b) + ' is where the line crosses the y-axis.',
        M2: 'The line goes ' + (m > 0 ? 'up' : 'down') + ' from left to right, so the slope is ' + (m > 0 ? 'positive' : 'negative') + ': ' + f(m) + '.',
        M3: f(xi) + ' is where the line crosses the x-axis. The y-intercept is ' + f(b) + ', on the y-axis.',
        M16: 'y = ' + f(m) + 'x goes through (0, 0), but this line crosses the y-axis at ' + f(b) + '.'
      },
      steps: [
        { label: 'Where does the line cross the y-axis? y =', part: { kind: 'num', key: b }, hint: 'Look at x = 0, on the up axis (y-axis).' },
        { label: 'For every 1 step right, how much does y change?', part: { kind: 'num', key: m }, hint: 'Compare (0, ' + f(b) + ') with ' + C.pt(x2, y2) + '. Down is negative.' },
        { label: 'So the equation is', part: { kind: 'choice', opts: [{ t: eq(m, b), ok: true }, { t: eq(b, m) }, { t: eq(-m, b) }] }, hint: 'y = (slope)x + (y-intercept).' }
      ]
    };
  } });

  C.add({ id: 'EQ-3c', skill: '11', level: 3, order: 2, type: 'MC', gen: function (R) {
    var m, b, p, val, q, on1, xa, xb, ya, yb, which, off;
    var nudge = [-3, -2, -1, 1, 2, 3];
    do {
      m = R.pick([-3, -2, -1, 1, 2, 3]); b = R.nz(-6, 6);
      p = R.nz(-3, 3); val = m * p + b; on1 = R.chance(0.5); q = on1 ? val : val + R.pick(nudge);
      xa = R.nz(-4, 4); do { xb = R.nz(-4, 4); } while (Math.abs(xb - xa) < 2);
      ya = m * xa + b; yb = m * xb + b; which = R.chance(0.5) ? 'A' : 'B'; off = R.pick(nudge);
      if (which === 'A') yb += off; else ya += off;
    } while (Math.abs(ya) > 9 || Math.abs(yb) > 9 || Math.abs(m * xa + b) > 9 || Math.abs(m * xb + b) > 9);
    var lineA = m * xa + b;
    return {
      stem: 'Part 1: Is the point ' + C.pt(p, q) + ' on the line ' + eq(m, b) + '?<br>Part 2: The graph shows the same line and two points, A and B. Which point is on the line?',
      fig: C.graph({ x: [-10, 10], y: [-10, 10], lines: [{ m: m, b: b }], pts: [{ x: xa, y: ya, l: 'A' }, { x: xb, y: yb, l: 'B' }], label: 'The line ' + eq(m, b) + ' with point A at ' + C.pt(xa, ya) + ' and point B at ' + C.pt(xb, yb) }),
      think: 'Substitute the x-value. Does the equation give the same y?',
      parts: [
        { kind: 'choice', label: 'Is ' + C.pt(p, q) + ' on the line?', keep: true, opts: [{ t: 'Yes', ok: on1, tag: 'G' }, { t: 'No', ok: !on1, tag: 'G' }] },
        { kind: 'choice', label: 'Which point is on the line?', keep: true, opts: [{ t: 'Point A', ok: which === 'A', tag: 'G' }, { t: 'Point B', ok: which === 'B', tag: 'G' }] }
      ],
      answer: (on1 ? 'Yes' : 'No') + '; point ' + which + ' is on the line',
      work: [
        'Substitute x = ' + f(p) + ': ' + f(m) + ' × ' + par(p) + ' ' + C.term(b) + ' = ' + f(val) + '.',
        f(q) + (on1 ? ' = ' : ' ≠ ') + f(val) + ', so ' + C.pt(p, q) + ' <b>' + (on1 ? 'is' : 'is not') + '</b> on the line.',
        'Point A is ' + C.pt(xa, ya) + ' and point B is ' + C.pt(xb, yb) + '. At x = ' + f(xa) + ' the line gives ' + f(lineA) + '; at x = ' + f(xb) + ' it gives ' + f(m * xb + b) + '.',
        'So <b>point ' + which + '</b> is on the line. A point that is off by 1 can look close, so check with the equation.'
      ],
      steps: [
        { label: 'Substitute x = ' + f(p) + ': ' + f(m) + ' × ' + par(p) + ' ' + C.term(b) + ' =', part: { kind: 'num', key: val }, hint: 'Multiply first, then add.' },
        { label: 'Is ' + C.pt(p, q) + ' on the line?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: on1 }, { t: 'No', ok: !on1 }] }, hint: 'It is on the line only if its y-value is exactly ' + f(val) + '.' },
        { label: 'Point A has x = ' + f(xa) + '. On the line, y = ' + f(m) + ' × ' + par(xa) + ' ' + C.term(b) + ' =', part: { kind: 'num', key: lineA }, hint: 'Substitute x = ' + f(xa) + ' into the equation.' },
        { label: 'Point A is at ' + C.pt(xa, ya) + '. Which point is on the line?', part: { kind: 'choice', keep: true, opts: [{ t: 'Point A', ok: which === 'A' }, { t: 'Point B', ok: which === 'B' }] }, hint: 'Compare A\'s y-value with ' + f(lineA) + '.' }
      ]
    };
  } });

  C.add({ id: 'EQ-4a', skill: '11', level: 4, order: 1, type: 'EE', gen: function (R) {
    var m, b;
    do { m = R.pick([-3, -2, -1, 1, 2, 3, 0.5, -0.5]); b = R.nz(-6, 6); } while (m === b);
    var dx = Math.abs(m) < 1 ? 2 : 1, dy = m * dx, y2 = b + dy;
    return {
      stem: 'Write the equation of the line shown.',
      fig: lineGraph(m, b, [{ x: 0, y: b }, { x: dx, y: y2 }]),
      think: 'Start at the y-axis. Then go to the next marked point.',
      parts: [{ kind: 'eq', label: 'y =', key: C.line(m, b), show: eq(m, b), wrong: wl(m, b, [[b, m, 'M9'], [-m, b, 'M2'], [1 / m, b, 'M1'], [m, -b / m, 'M3'], [m, 0, 'M16']]) }],
      answer: eq(m, b),
      work: [
        'Start at (0, ' + f(b) + '), so the y-intercept (the start) is b = ' + f(b) + '.',
        'Move to ' + C.pt(dx, y2) + ': change in y = ' + f(dy) + ', change in x = ' + dx + ', so the slope (the step) is m = ' + f(dy) + ' ÷ ' + dx + ' = ' + f(m) + '.',
        'Equation: <b>' + eq(m, b) + '</b>'
      ],
      why: {
        M9: 'You swapped the slope and the y-intercept. The slope is ' + f(m) + '; the line crosses the y-axis at ' + f(b) + '.',
        M2: 'The line goes ' + (m > 0 ? 'up' : 'down') + ' from left to right, so the slope is ' + f(m) + ', not ' + f(-m) + '.',
        M1: 'You found change in x ÷ change in y. Slope is change in y ÷ change in x: ' + f(dy) + ' ÷ ' + dx + ' = ' + f(m) + '.',
        M3: 'You used where the line crosses the x-axis. b is where it crosses the y-axis: ' + f(b) + '.',
        M16: 'Your line goes through (0, 0), but this one crosses the y-axis at ' + f(b) + '. Add b.'
      },
      steps: [
        { label: 'Where does the line cross the y-axis? b =', part: { kind: 'num', key: b }, hint: 'Look at x = 0.' },
        { label: 'From (0, ' + f(b) + ') to ' + C.pt(dx, y2) + ', the change in y is', part: { kind: 'num', key: dy }, hint: 'End minus start: ' + f(y2) + ' − ' + par(b) + '.' },
        { label: 'The change in x is ' + dx + '. Slope m = ' + f(dy) + ' ÷ ' + dx + ' =', part: { kind: 'num', key: m }, hint: 'Change in y on top, change in x underneath.' },
        eqStep(m, b)
      ]
    };
  } });

  C.add({ id: 'EQ-4c', skill: '11', level: 4, order: 2, type: 'interactive', ia: true, gen: function (R) {
    // the student reads a target line off the grid and builds it with the m and b sliders
    var m, b, dx, y2;
    do {
      m = R.pick([-3, -2, -1, 1, 2, 3, 0.5, -0.5, -2, 2]); b = R.nz(-6, 6);
      dx = (Math.abs(m) < 1 ? 2 : R.pick([1, 2])) * R.sign(); y2 = b + m * dx;
    } while (m === b || Math.abs(y2) > 9);
    var dy = y2 - b;
    function reach(v) { return v.m >= -3 && v.m <= 3 && Math.abs(v.m * 2 - Math.round(v.m * 2)) < 1e-9 && v.b >= -8 && v.b <= 8 && Math.abs(v.b - Math.round(v.b)) < 1e-9 && !(C.near(v.m, m, 1e-9) && C.near(v.b, b, 1e-9)); }
    var wrong = [{ v: { m: b, b: m }, tag: 'M9' }, { v: { m: -m, b: b }, tag: 'M2' }, { v: { m: m, b: -b }, tag: 'M2' }, { v: { m: 1 / m, b: b }, tag: 'M1' }].filter(function (w) { return reach(w.v); });
    var p1 = { x: 0, y: b, l: C.pt(0, b) }, p2 = { x: dx, y: y2, l: C.pt(dx, y2) };
    var g = { x: [-10, 10], y: [-10, 10], size: 380, lines: [{ m: m, b: b, color: C.COL.line2, dash: true, w: 2.5 }], pts: [p1, p2], label: 'A dashed target line through ' + C.pt(0, b) + ' and ' + C.pt(dx, y2) };
    return {
      stem: 'The dashed line goes through the two marked points. Set the <b>m</b> and <b>b</b> sliders so your line lies on top of it.',
      think: 'b is the start, where it crosses the up axis (y-axis). m is the step: change in y for every 1 step right.',
      parts: [
        { kind: 'slider', label: 'Line builder', sliders: [{ id: 'm', label: 'Slope m (the step)', min: -3, max: 3, step: 0.5, start: 0 }, { id: 'b', label: 'y-intercept b (the start)', min: -8, max: 8, step: 1, start: 0 }], grid: g,
          key: { m: m, b: b }, wrong: wrong }
      ],
      answerFig: C.graph({ x: [-10, 10], y: [-10, 10], size: 260, lines: [{ m: m, b: b }], pts: [p1, p2], label: 'The line ' + eq(m, b) }),
      answer: 'm = ' + f(m) + ', b = ' + f(b) + ': ' + eq(m, b),
      work: [
        'The line crosses the y-axis at ' + C.pt(0, b) + ', so the y-intercept (the start) is b = ' + f(b) + '.',
        'From ' + C.pt(0, b) + ' to ' + C.pt(dx, y2) + ': change in y = ' + f(dy) + ', change in x = ' + f(dx) + ', so the slope (the step) is m = ' + f(dy) + ' ÷ ' + par(dx) + ' = ' + f(m) + '.',
        'Set m = ' + f(m) + ' and b = ' + f(b) + ': <b>' + eq(m, b) + '</b>.'
      ],
      why: {
        M9: 'You swapped the sliders. The slope is m = ' + f(m) + '; the line crosses the y-axis at b = ' + f(b) + '.',
        M2: 'Check the sign. The line goes ' + (m > 0 ? 'up' : 'down') + ' from left to right, so m = ' + f(m) + ', and it crosses the y-axis at b = ' + f(b) + '.',
        M1: 'You used change in x ÷ change in y. Slope is change in y ÷ change in x: ' + f(dy) + ' ÷ ' + par(dx) + ' = ' + f(m) + '.'
      },
      steps: [
        { label: 'Where does the dashed line cross the y-axis? b =', part: { kind: 'num', key: b }, hint: 'Look at the marked point with x = 0.' },
        { label: 'From ' + C.pt(0, b) + ' to ' + C.pt(dx, y2) + ': change in y ÷ change in x = ' + f(dy) + ' ÷ ' + par(dx) + ' = m =', part: { kind: 'num', key: m }, hint: 'Change in y on top. Down is negative.' },
        eqStep(m, b)
      ]
    };
  } });

  /* ---------------- Skill 12 Equation from a table or two points ---------------- */
  C.add({ id: 'EQ-4b', skill: '12', level: 4, type: 'EE', gen: function (R) {
    var m, b, x0 = R.int(2, 5);
    do { m = R.nz(-4, 4); b = R.nz(-8, 8); } while (m === b);
    var xs = [x0, x0 + 1, x0 + 2, x0 + 3], ys = xs.map(function (x) { return m * x + b; }), y0 = ys[0];
    return {
      stem: 'The table shows a linear function. Write its equation.',
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }) }),
      think: 'Find the change per 1 more x. Then work back to x = 0.',
      parts: [{ kind: 'eq', label: 'y =', key: C.line(m, b), show: eq(m, b), wrong: wl(m, b, [[y0 / x0, 0, 'M4'], [m, y0, 'M3'], [b, m, 'M9'], [-m, b, 'M2'], [1 / m, b, 'M1']]) }],
      answer: eq(m, b),
      work: [
        'For every 1 more in x, y changes by ' + f(ys[1]) + ' − ' + par(y0) + ' = ' + f(m) + ', so the rate of change (the step) is m = ' + f(m) + '.',
        'Work back from x = ' + x0 + ' to x = 0: ' + x0 + ' steps of ' + f(-m) + '. ' + f(y0) + ' − ' + x0 + ' × ' + par(m) + ' = ' + f(b) + ', so the initial value (the start) is b = ' + f(b) + '.',
        'Equation: <b>' + eq(m, b) + '</b>'
      ],
      why: {
        M4: 'You divided ' + f(y0) + ' by ' + x0 + ' from one row. That only works if the line goes through (0, 0). Use the change between rows.',
        M3: f(y0) + ' is y at x = ' + x0 + ', not at x = 0. Work back to x = 0 to find b = ' + f(b) + '.',
        M9: 'You swapped them: the rate is ' + f(m) + ' and the value at x = 0 is ' + f(b) + '.',
        M2: 'y ' + (m > 0 ? 'goes up' : 'goes down') + ' as x goes up, so m = ' + f(m) + '.',
        M1: 'Slope is change in y ÷ change in x: ' + f(m) + ' ÷ 1 = ' + f(m) + '.'
      },
      steps: [
        { label: 'For every 1 more in x, y changes by', part: { kind: 'num', key: m }, hint: 'Next row minus this row: ' + f(ys[1]) + ' − ' + par(y0) + '.' },
        { label: 'Work back ' + x0 + ' steps from x = ' + x0 + ' to x = 0: ' + f(y0) + ' − ' + x0 + ' × ' + par(m) + ' =', part: { kind: 'num', key: b }, hint: 'Each step back takes away ' + f(m) + '.' },
        eqStep(m, b)
      ]
    };
  } });

  C.add({ id: 'EQ-5a', skill: '12', level: 5, order: 1, type: 'EE', gen: function (R) {
    var m, b, x1, x2, y1, y2;
    do { m = R.nz(-4, 4); b = R.nz(-8, 8); x1 = R.nz(-5, 5); x2 = R.nz(-5, 5); y1 = m * x1 + b; y2 = m * x2 + b; }
    while (m === b || Math.abs(x2 - x1) < 2 || Math.abs(y1) > 20 || Math.abs(y2) > 20 || y1 === y2);
    if (x2 < x1) { var t = x1; x1 = x2; x2 = t; t = y1; y1 = y2; y2 = t; }
    var dx = x2 - x1, dy = y2 - y1, s17 = dy - dx;
    return {
      stem: 'Write the equation of the line through ' + C.pt(x1, y1) + ' and ' + C.pt(x2, y2) + '.',
      think: 'Find m from the two points. Then use one point to find b.',
      parts: [{ kind: 'eq', label: 'y =', key: C.line(m, b), show: eq(m, b), wrong: wl(m, b, [[1 / m, y1 - x1 / m, 'M1'], [-m, y1 + m * x1, 'M2'], [y1 / x1, 0, 'M4'], [s17, y1 - s17 * x1, 'M17'], [b, m, 'M9']]) }],
      answer: eq(m, b),
      work: [
        'Slope (the step): m = ' + f(dy) + ' ÷ ' + f(dx) + ' = ' + f(m) + '.',
        'Use ' + C.pt(x1, y1) + ': ' + f(y1) + ' = ' + f(m) + ' × ' + par(x1) + ' + b, so the start is b = ' + f(y1) + ' − ' + par(m * x1) + ' = ' + f(b) + '.',
        'Check with ' + C.pt(x2, y2) + ': ' + f(m) + ' × ' + par(x2) + ' ' + C.term(b) + ' = ' + f(y2) + '. Equation: <b>' + eq(m, b) + '</b>'
      ],
      why: {
        M1: 'You divided the change in x by the change in y. Slope is ' + f(dy) + ' ÷ ' + f(dx) + ' = ' + f(m) + '.',
        M2: 'Check the sign: y changes by ' + f(dy) + ' while x changes by ' + f(dx) + ', so m = ' + f(m) + '.',
        M4: 'You divided y by x at one point. That only works for lines through (0, 0).',
        M17: 'You subtracted the changes. Divide them: ' + f(dy) + ' ÷ ' + f(dx) + ' = ' + f(m) + '.',
        M9: 'You swapped them: m = ' + f(m) + ' and b = ' + f(b) + '.'
      },
      steps: [
        { label: 'Change in y: ' + f(y2) + ' − ' + par(y1) + ' =', part: { kind: 'num', key: dy }, hint: 'Second point minus first point.' },
        { label: 'Change in x: ' + f(x2) + ' − ' + par(x1) + ' = ' + f(dx) + '. So m = ' + f(dy) + ' ÷ ' + f(dx) + ' =', part: { kind: 'num', key: m }, hint: 'Change in y ÷ change in x.' },
        { label: 'b = ' + f(y1) + ' − ' + par(m) + ' × ' + par(x1) + ' =', part: { kind: 'num', key: b }, hint: 'From ' + f(y1) + ' = ' + f(m) + ' × ' + par(x1) + ' + b, take ' + par(m * x1) + ' away from ' + f(y1) + '.' },
        eqStep(m, b)
      ]
    };
  } });

  C.add({ id: 'EQ-5g', skill: '12', level: 5, order: 2, type: 'DM', ia: true, gen: function (R) {
    var m1, m2, b1, b2, L;
    function fits(l) { return Math.abs(l[0] + l[1]) <= 8; }
    do {
      m1 = R.pick([-3, -2, -1, 1, 2, 3]); do { m2 = R.pick([-3, -2, -1, 1, 2, 3]); } while (m2 === m1);
      b1 = R.nz(-5, 5); do { b2 = R.nz(-5, 5); } while (b2 === b1);
      L = [[m1, b1], [m1, b2], [m2, b1]];
    } while (!L.every(fits));
    var order = R.shuffle([0, 1, 2]), tl = R.shuffle([0, 1, 2]), gl = R.shuffle([0, 1, 2]);
    // three sets: each equation has one table and one graph (pairs of lines share a slope or an intercept)
    var cards = [
      { name: 'Table A', kind: 't', line: tl[0] }, { name: 'Table B', kind: 't', line: tl[1] }, { name: 'Table C', kind: 't', line: tl[2] },
      { name: 'Graph D', kind: 'g', line: gl[0] }, { name: 'Graph E', kind: 'g', line: gl[1] }, { name: 'Graph F', kind: 'g', line: gl[2] }
    ];
    var xs = [1, 2, 3, 4];
    function body(c) {
      var l = L[c.line];
      if (c.kind === 't') return C.table({ cols: ['x', 'y'], rows: xs.map(function (x) { return [x, l[0] * x + l[1]]; }) });
      return C.graph({ x: [-5, 5], y: [-8, 8], size: 150, h: 200, lx: 2, ly: 4, lines: [{ m: l[0], b: l[1] }], pts: [{ x: 0, y: l[1], r: 4 }, { x: 1, y: l[0] + l[1], r: 4 }], label: c.name + ': a line through ' + C.pt(0, l[1]) + ' and ' + C.pt(1, l[0] + l[1]) });
    }
    function nm(i, kind) { return cards.filter(function (c) { return c.line === i && c.kind === kind; })[0].name; }
    // one guided step per equation: check the step, then the start, then pick its table and graph
    var gsteps = order.map(function (i) {
      var o = [0, 1, 2].filter(function (j) { return j !== i; });
      return { label: eq(L[i][0], L[i][1]) + ' has step ' + f(L[i][0]) + ' and start ' + f(L[i][1]) + '. Which table and graph match it?',
        part: { kind: 'choice', opts: [{ t: nm(i, 't') + ' and ' + nm(i, 'g'), ok: true }, { t: nm(i, 't') + ' and ' + nm(o[0], 'g') }, { t: nm(o[1], 't') + ' and ' + nm(i, 'g') }] },
        hint: 'First check the step (the change for every 1 more x), then the start (y at x = 0). Both must match.' };
    });
    return {
      stem: 'Sort each table and graph under its equation. Each equation gets one table and one graph.',
      think: 'Check both features: the change for every 1 more x, and the value at x = 0.',
      parts: [{ kind: 'sort', label: 'Match three', bins: order.map(function (i) { return eq(L[i][0], L[i][1]); }),
        cards: R.shuffle(cards.slice()).map(function (c) { return { t: '<div><b>' + c.name + '</b>' + body(c) + '</div>', bin: order.indexOf(c.line), tag: 'M11' }; }) }],
      answerFig: '<div style="font-size:14px">' + order.map(function (i) { return '<b>' + eq(L[i][0], L[i][1]) + '</b>: ' + cards.filter(function (c) { return c.line === i; }).map(function (c) { return c.name; }).join(' and '); }).join('<br>') + '</div>',
      answer: order.map(function (i) { return eq(L[i][0], L[i][1]) + ': ' + cards.filter(function (c) { return c.line === i; }).map(function (c) { return c.name; }).join(' and '); }).join('; '),
      work: order.map(function (i) {
        var l = L[i], t = cards.filter(function (c) { return c.line === i && c.kind === 't'; })[0], gc = cards.filter(function (c) { return c.line === i && c.kind === 'g'; })[0];
        return '<b>' + eq(l[0], l[1]) + '</b>: ' + t.name + ' changes by ' + f(l[0]) + ' for every 1 more x and works back to ' + f(l[1]) + ' at x = 0; ' + gc.name + ' crosses the y-axis at ' + f(l[1]) + ' and goes ' + upDown(l[0]) + ' for every 1 step right.';
      }),
      why: { M11: 'That equation shares only one feature with the card. Check both the rate and the value at x = 0.' },
      steps: gsteps
    };
  } });

  C.add({ id: 'EQ-5e', skill: '12', level: 5, order: 3, type: 'CM', gen: function (R) {
    var m, b, x1 = R.int(2, 4), x2 = x1 + R.int(1, 3);
    do { m = R.nz(-4, 4); b = R.nz(-8, 8); } while (m === b);
    var y1 = m * x1 + b, y2 = m * x2 + b, dx = x2 - x1, dy = y2 - y1;
    var chain = []; for (var x = x1; x >= 0; x--) chain.push(f(m * x + b));
    var box = 'style="flex:1 1 240px;border:1px solid #DCE2EE;border-radius:10px;padding:10px;background:#fff"';
    var fig = '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
      '<div ' + box + '><b>Student A</b><br>y changes by ' + f(m) + ' per 1 more x.<br>Work back to x = 0: ' + chain.join(' → ') + '</div>' +
      '<div ' + box + '><b>Student B</b><br>Step 1: m = ' + f(dy) + ' ÷ ' + dx + ' = ' + f(m) + '<br>Step 2: ' + f(y1) + ' = ' + f(m) + '(' + x1 + ') + b, so b = ' + f(b) + '<br>Step 3: check ' + f(m) + '(' + x2 + ') ' + C.term(b) + ' = ' + f(y2) + '</div></div>';
    return {
      stem: 'Both students find ' + eq(m, b) + ' through ' + C.pt(x1, y1) + ' and ' + C.pt(x2, y2) + '. Which step of B\'s matches A\'s "work back to x = 0"? What value does it find?',
      fig: fig,
      think: 'What is the output at x = 0 called?',
      parts: [
        { kind: 'choice', label: 'B\'s matching step', keep: true, opts: [{ t: 'Step 1: finding m', tag: 'M9' }, { t: 'Step 2: solving for b', ok: true }, { t: 'Step 3: checking the second point', tag: 'G' }] },
        { kind: 'num', label: 'Value at x = 0', key: b, wrong: [{ v: m, tag: 'M9' }, { v: y1, tag: 'M3' }] }
      ],
      answer: 'Step 2: solving for b; b = ' + f(b),
      work: [
        'Both methods find the output at x = 0: the initial value (the start), b.',
        'A counts back ' + x1 + ' steps of ' + f(-m) + ' from ' + f(y1) + ' to ' + f(b) + '.',
        'B does it in one move: ' + f(y1) + ' = ' + f(m) + '(' + x1 + ') + b, so b = ' + f(b) + '. The matching step is <b>Step 2: solving for b</b>.'
      ],
      why: {
        M9: 'Finding m is the rate, ' + f(m) + ' for every 1 more x. Working back to x = 0 finds the starting value b = ' + f(b) + '.',
        M3: f(y1) + ' is y at x = ' + x1 + '. At x = 0, y = ' + f(b) + '.'
      },
      steps: [
        { label: 'How many steps of 1 does A count back, from x = ' + x1 + ' to x = 0?', part: { kind: 'num', key: x1 }, hint: 'From ' + x1 + ' down to 0.' },
        { label: 'Each step back changes y by', part: { kind: 'num', key: -m }, hint: 'Going back undoes the rate of ' + f(m) + '.' },
        { label: 'Both reach the output at x = 0: b =', part: { kind: 'num', key: b }, hint: f(y1) + ' − ' + x1 + ' × ' + par(m) + '.' },
        { label: 'In B\'s work, b is found in', part: { kind: 'choice', keep: true, opts: [{ t: 'Step 1' }, { t: 'Step 2', ok: true }, { t: 'Step 3' }] }, hint: 'Which step ends with "b ="?' }
      ]
    };
  } });

  C.add({ id: 'EQ-5f', skill: '12', level: 5, order: 4, type: 'EG', gen: function (R) {
    var p = R.nz(-4, 5), q = R.int(-6, 9), m1, b1, m2, b2;
    do { m1 = R.nz(-3, 3); b1 = q - m1 * p; } while (b1 === 0);
    do { m2 = R.nz(-3, 3); b2 = q - m2 * p; } while (b2 === 0 || m2 === m1);
    function lin(g) { var s = g(1) - g(0); return [-3, 2, 5].every(function (x) { return Math.abs(g(x) - (g(0) + s * x)) < 1e-6; }); }
    function good(g) { return g && lin(g) && C.near(g(p), q, 1e-6) && !C.near(g(0), 0, 1e-6); }
    return {
      stem: 'Write the equation of a line that passes through ' + C.pt(p, q) + ' and does NOT pass through (0, 0). Then write a second, different one.',
      think: 'Pick any slope m. Then choose b so that ' + f(q) + ' = m × ' + par(p) + ' + b.',
      parts: [
        { kind: 'eq', label: 'First line: y =', key: C.line(m1, b1), show: eq(m1, b1), wrong: wl(m1, b1, [[q / p, 0, 'M16']]) },
        { kind: 'eq', label: 'Second line: y =', key: C.line(m2, b2), show: eq(m2, b2), wrong: wl(m2, b2, [[q / p, 0, 'M16']]) }
      ],
      check: function (vals) {
        var g1 = C.parseEq(vals[0]), g2 = C.parseEq(vals[1]);
        if (good(g1) && good(g2)) return C.sameFn(g1, g2) ? { ok: false, tag: 'G' } : { ok: true };
        var bad0 = [g1, g2].some(function (g) { return g && C.near(g(0), 0, 1e-6); });
        return { ok: false, tag: bad0 ? 'M16' : 'G' };
      },
      answer: 'For example ' + eq(m1, b1) + ' and ' + eq(m2, b2),
      work: [
        'Pick a slope (the step), say m = ' + f(m1) + '. Then ' + f(q) + ' = ' + f(m1) + ' × ' + par(p) + ' + b, so b = ' + f(b1) + ': <b>' + eq(m1, b1) + '</b>.',
        'Pick a different slope, m = ' + f(m2) + ': b = ' + f(q) + ' − ' + par(m2 * p) + ' = ' + f(b2) + ', so <b>' + eq(m2, b2) + '</b>.',
        'b is not 0 in either, so neither line passes through (0, 0).'
      ],
      why: {
        M16: 'Your line has b = 0, so it passes through (0, 0). Pick a slope that makes b something other than 0.',
        G: 'Each line must give y = ' + f(q) + ' when x = ' + f(p) + ', the two lines must be different, and b must not be 0.'
      },
      steps: [
        { label: 'Use slope m = ' + f(m1) + '. Then b = ' + f(q) + ' − ' + par(m1) + ' × ' + par(p) + ' =', part: { kind: 'num', key: b1 }, hint: 'Solve ' + f(q) + ' = ' + f(m1) + ' × ' + par(p) + ' + b.' },
        { label: 'Now use slope m = ' + f(m2) + '. Then b = ' + f(q) + ' − ' + par(m2) + ' × ' + par(p) + ' =', part: { kind: 'num', key: b2 }, hint: 'Same method with the new slope.' },
        { label: 'So a second line through ' + C.pt(p, q) + ' is', part: { kind: 'choice', opts: [{ t: eq(m2, b2), ok: true }, { t: eq(-m2, b2) }, { t: eq(m2, -b2) }] }, hint: 'Slope ' + f(m2) + ', start ' + f(b2) + '.' }
      ]
    };
  } });

  /* ---------------- Skill 13 Slope and intercept in context ---------------- */
  // the plan's frame has a second number slot ("The slope is [number]"); it is given in the frame so the item keeps 4 parts
  C.add({ id: 'RC-5a', skill: '13', level: 5, order: 1, type: 'FR', gen: function (R) {
    var m, b; do { m = R.int(2, 9); b = R.int(5, 20); } while (m === b);
    var e = C.eqText(m, b, 'C', 'd');
    return {
      stem: 'A taxi\'s cost in riyals is ' + e + ', where d is the distance in kilometres. Complete the sentence about the slope (the step).',
      sentence: 'The slope means the {0} {1} by {2} riyals for every one {3}.',
      parts: [
        { kind: 'choice', inline: true, keep: true, opts: [{ t: 'cost', ok: true }, { t: 'distance', tag: 'M1' }, { t: 'starting fee', tag: 'M9' }] },
        { kind: 'choice', inline: true, keep: true, opts: [{ t: 'increases', ok: true }, { t: 'decreases', tag: 'M2' }] },
        { kind: 'num', inline: true, key: m, wrong: [{ v: b, tag: 'M9' }, { v: m + b, tag: 'M14' }] },
        { kind: 'choice', inline: true, keep: true, opts: [{ t: 'kilometre', ok: true }, { t: 'riyal', tag: 'M1' }, { t: 'trip', tag: 'G' }] }
      ],
      answer: 'The cost increases by ' + m + ' riyals for every one kilometre',
      work: [
        'The slope is the number multiplied by d: ' + m + '.',
        'Each extra kilometre adds ' + m + ' riyals, so <b>the cost increases by ' + m + ' riyals for every one kilometre</b>.',
        b + ' riyals is the fee before you travel, not the rate.'
      ],
      why: {
        M9: b + ' is the starting fee, paid once. The slope is ' + m + ', the number multiplied by d.',
        M1: 'The slope is riyals per kilometre: the cost changes for every one kilometre, not the other way round.',
        M2: 'The slope ' + m + ' is positive, so the cost goes up as the distance grows.'
      },
      steps: [
        { label: 'The cost for 1 km: ' + m + ' × 1 + ' + b + ' =', part: { kind: 'num', key: m + b }, hint: 'Put d = 1 into ' + e + '.' },
        { label: 'The cost for 2 km: ' + m + ' × 2 + ' + b + ' =', part: { kind: 'num', key: 2 * m + b }, hint: 'Multiply first, then add ' + b + '.' },
        { label: 'From 1 km to 2 km, the cost changes by how many riyals?', part: { kind: 'num', key: m, wrong: [{ v: b, tag: 'M9' }] }, hint: (2 * m + b) + ' − ' + (m + b) + '.' },
        { label: 'So for every one more kilometre, the cost', part: { kind: 'choice', keep: true, opts: [{ t: 'increases by ' + m + ' riyals', ok: true }, { t: 'decreases by ' + m + ' riyals' }, { t: 'increases by ' + b + ' riyals' }] }, hint: 'The slope ' + m + ' is the number multiplied by d, and it is positive.' }
      ]
    };
  } });

  C.add({ id: 'EQ-5b', skill: '13', level: 5, order: 2, type: 'FR', gen: function (R) {
    var m, b; do { m = R.int(8, 30) * 10; b = R.int(5, 30) * 10; } while (m === b);
    var e = C.eqText(m, b, 'C', 'n');
    return {
      stem: 'A gym charges ' + e + ' riyals, where n is the number of months. Complete the sentence.',
      sentence: 'The ' + b + ' means {0}, the amount you pay when n = {1}.',
      parts: [
        { kind: 'choice', inline: true, opts: [{ t: 'the joining fee', ok: true }, { t: 'the cost per month', tag: 'M9' }, { t: 'the total after one month', tag: 'G' }] },
        { kind: 'num', inline: true, key: 0, wrong: [{ v: 1, tag: 'G' }] }
      ],
      answer: 'The ' + b + ' is the joining fee, the amount you pay when n = 0',
      work: [
        'When n = 0: C = ' + m + ' × 0 + ' + b + ' = ' + b + ' riyals.',
        b + ' is added once, no matter how many months, so it is <b>the joining fee</b>, the cost when <b>n = 0</b>.',
        'The cost per month is ' + m + ' riyals, the number multiplied by n.'
      ],
      why: {
        M9: 'The cost per month is ' + m + ', the number multiplied by n. ' + b + ' is added once: the joining fee.',
        G: 'After one month you pay ' + m + ' + ' + b + ' = ' + (m + b) + ' riyals. ' + b + ' alone is the cost at n = 0.'
      },
      steps: [
        { label: 'C when n = 0: ' + m + ' × 0 + ' + b + ' =', part: { kind: 'num', key: b }, hint: 'Anything times 0 is 0.' },
        { label: 'So ' + b + ' riyals is what you pay after how many months?', part: { kind: 'num', key: 0 }, hint: 'You found it by putting n = 0.' },
        { label: 'So ' + b + ' is', part: { kind: 'choice', keep: true, opts: [{ t: 'the joining fee', ok: true }, { t: 'the cost per month' }] }, hint: 'It is paid once, before any months.' }
      ]
    };
  } });

  C.add({ id: 'EQ-5c', skill: '13', level: 5, order: 3, type: 'EE', gen: function (R) {
    var m, b; do { m = R.int(8, 30) * 5; b = R.int(6, 40) * 5; } while (m === b);
    var show = C.eqText(m, b, 'C', 'h');
    return {
      stem: 'A plumber charges ' + C.an(b) + ' ' + b + '-riyal call-out fee plus ' + m + ' riyals per hour. Write an equation for the cost C (riyals) after h hours.',
      think: 'Which amount is paid for every hour? Which is paid once?',
      parts: [{ kind: 'eq', label: 'Equation', xv: 'h', yv: 'C', key: C.line(m, b), show: show, wrong: wl(m, b, [[b, m, 'M9'], [m + b, 0, 'M14'], [m, 0, 'M16']]) }],
      answer: show,
      work: [
        'For every 1 more hour, the cost goes up ' + m + ' riyals, so ' + m + ' multiplies h.',
        'The ' + b + '-riyal fee is paid once, so it is added.',
        '<b>' + show + '</b>'
      ],
      why: {
        M9: 'You swapped them. The hourly rate ' + m + ' multiplies h; the ' + b + '-riyal fee is added once.',
        M14: 'The fee is not charged every hour. Only the ' + m + ' riyals multiply h: C = ' + m + 'h + ' + b + '.',
        M16: 'You left out the call-out fee. At 0 hours the cost is already ' + b + ' riyals.'
      },
      steps: [
        { label: 'For every 1 more hour, the cost goes up by how many riyals?', part: { kind: 'num', key: m, wrong: [{ v: b, tag: 'M9' }] }, hint: 'The per-hour price.' },
        { label: 'The cost at 0 hours (riyals) is', part: { kind: 'num', key: b }, hint: 'Before any work, you pay only the call-out fee.' },
        { label: 'Check: the cost for 2 hours = ' + m + ' × 2 + ' + b + ' =', part: { kind: 'num', key: 2 * m + b }, hint: 'Multiply first, then add the fee once.' },
        eqStep(m, b, 'h', 'C')
      ]
    };
  } });

  C.add({ id: 'EQ-5h', skill: '13', level: 5, order: 4, type: 'interactive', ia: true, gen: function (R) {
    var m, b; do { m = R.int(2, 8) * 10; b = R.int(5, 20) * 10; } while (m === b);
    var g = { x: [0, 10], y: [0, 1000], dy: 100, ly: 200, size: 380, xl: 'Washes (n)', yl: 'Total cost (riyals)', label: 'Total cost against number of car washes' };
    var wrong = [{ v: { m: b, b: m }, tag: 'M9' }, { v: { m: m, b: 0 }, tag: 'M16' }];
    if (m + b <= 100) wrong.push({ v: { m: m + b, b: b }, tag: 'M14' });
    return {
      stem: 'A car wash card costs ' + b + ' riyals to buy, then ' + m + ' riyals per wash. Set the sliders so the line shows the total cost C (riyals) after n washes.',
      think: 'The slope (the step) is the change for every 1 more wash. The intercept (the start) is the cost at 0 washes.',
      parts: [
        { kind: 'slider', label: 'Cost line', sliders: [{ id: 'm', label: 'Slope, the step (riyals per wash)', min: 0, max: 100, step: 10, start: 0 }, { id: 'b', label: 'Intercept, the start (riyals)', min: 0, max: 250, step: 10, start: 0 }], grid: g,
          draw: function (v) { return { lines: [{ m: v.m, b: v.b, from: 0 }], pts: [{ x: 0, y: v.b, r: 5 }] }; },
          key: { m: m, b: b }, wrong: wrong }
      ],
      answerFig: C.graph(Object.assign({}, g, { size: 260, lines: [{ m: m, b: b, from: 0 }], pts: [{ x: 0, y: b, l: C.pt(0, b) }, { x: 5, y: 5 * m + b, l: C.pt(5, 5 * m + b) }] })),
      answer: 'slope ' + m + ' riyals per wash, intercept ' + b + ' riyals',
      work: [
        'The price per wash is the rate: the cost goes up ' + m + ' riyals for every 1 more wash, so the slope (the step) = <b>' + m + '</b>.',
        'The card price is the cost at 0 washes, so the y-intercept (the start) = <b>' + b + '</b>.',
        'The line is ' + C.eqText(m, b, 'C', 'n') + '.'
      ],
      why: {
        M9: 'You swapped the sliders. ' + m + ' riyals is paid for every wash (the slope); ' + b + ' riyals is paid once for the card (the intercept).',
        M16: 'At 0 washes you have already paid ' + b + ' riyals for the card, so the line does not start at 0.',
        M14: 'The slope is only the price per wash, ' + m + ' riyals.'
      },
      steps: [
        { label: 'For every 1 more wash, the cost goes up by how many riyals?', part: { kind: 'num', key: m }, hint: 'The price per wash.' },
        { label: 'What is the cost at 0 washes (riyals)?', part: { kind: 'num', key: b }, hint: 'You pay only for the card.' },
        { label: 'Check: the cost after 3 washes = ' + m + ' × 3 + ' + b + ' =', part: { kind: 'num', key: 3 * m + b }, hint: 'Multiply first, then add the card price once.' }
      ]
    };
  } });

  C.add({ id: 'EQ-5d', skill: '13', level: 5, order: 5, type: 'MC', gen: function (R) {
    var b = R.int(6, 16) * 5, m = R.int(2, 9), g = R.int(2, 6), C1 = b + m * g, C2 = b + 2 * m * g;
    return {
      stem: 'A phone plan costs ' + b + ' riyals a month plus ' + m + ' riyals per GB. Using ' + g + ' GB in a month costs ' + C1 + ' riyals. Does using ' + (2 * g) + ' GB cost ' + (2 * C1) + ' riyals?',
      think: 'Which part of the cost doubles when the data doubles?',
      parts: [{ kind: 'choice', label: 'Answer', opts: [
        { t: 'Yes, double the data doubles the cost', tag: 'M16' },
        { t: 'No, it costs ' + C2 + ' riyals', ok: true },
        { t: 'No, it costs ' + (C1 + m) + ' riyals', tag: 'G' },
        { t: 'You can\'t tell', tag: 'G' }
      ] }],
      answer: 'No, it costs ' + C2 + ' riyals',
      work: [
        'Only the per-GB part doubles: ' + m + ' × ' + (2 * g) + ' = ' + (2 * m * g) + ' riyals.',
        'The ' + b + '-riyal monthly charge is paid once: ' + b + ' + ' + (2 * m * g) + ' = <b>' + C2 + ' riyals</b>, not ' + (2 * C1) + '.',
        'Doubling works only when the line starts at 0.'
      ],
      why: {
        M16: 'Doubling ' + C1 + ' also doubles the ' + b + '-riyal monthly charge, but that is paid only once.',
        G: 'Work it out: ' + b + ' + ' + m + ' × ' + (2 * g) + ' = ' + C2 + ' riyals.'
      },
      steps: [
        { label: 'The data part for ' + (2 * g) + ' GB: ' + m + ' × ' + (2 * g) + ' =', part: { kind: 'num', key: 2 * m * g }, hint: m + ' riyals for every GB.' },
        { label: 'Add the monthly charge once: ' + b + ' + ' + (2 * m * g) + ' =', part: { kind: 'num', key: C2 }, hint: 'The ' + b + ' riyals is not doubled.' },
        { label: 'Is that equal to 2 × ' + C1 + ' = ' + (2 * C1) + '?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes' }, { t: 'No', ok: true }] }, hint: 'Compare ' + C2 + ' with ' + (2 * C1) + '.' }
      ]
    };
  } });
})();
