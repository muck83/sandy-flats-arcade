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
        'The line crosses the y-axis at (0, ' + f(b) + '), so b = ' + f(b) + '.',
        'For every 1 step right, the line goes ' + upDown(m) + ', so m = ' + f(m) + '.',
        'Equation: <b>' + eq(m, b) + '</b>'
      ],
      why: {
        M9: 'You swapped them: ' + f(m) + ' is the slope and ' + f(b) + ' is where the line crosses the y-axis.',
        M2: 'The line goes ' + (m > 0 ? 'up' : 'down') + ' from left to right, so the slope is ' + (m > 0 ? 'positive' : 'negative') + ': ' + f(m) + '.',
        M3: f(xi) + ' is where the line crosses the x-axis. The y-intercept is ' + f(b) + ', on the y-axis.',
        M16: 'y = ' + f(m) + 'x goes through (0, 0), but this line crosses the y-axis at ' + f(b) + '.'
      },
      steps: [
        { label: 'Where does the line cross the y-axis? y =', part: { kind: 'num', key: b }, hint: 'Look at x = 0, the vertical axis.' },
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
        'Start at (0, ' + f(b) + '), so b = ' + f(b) + '.',
        'Move to ' + C.pt(dx, y2) + ': change in y = ' + f(dy) + ', change in x = ' + dx + ', so m = ' + f(dy) + ' ÷ ' + dx + ' = ' + f(m) + '.',
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
        { label: 'The change in x is', part: { kind: 'num', key: dx }, hint: dx + ' − 0.' },
        { label: 'Slope m = ' + f(dy) + ' ÷ ' + dx + ' =', part: { kind: 'num', key: m }, hint: 'Change in y on top, change in x underneath.' }
      ]
    };
  } });

  // converted from the plan's slider build: the student types the slider values instead of dragging them
  C.add({ id: 'EQ-4c', skill: '11', level: 4, order: 2, type: 'NE', gen: function (R) {
    var m, b, p;
    do { m = R.pick([-2, -1, 1, 2, 0.5, -0.5]); b = R.nz(-6, 6); } while (m === b || m === -b);
    p = Math.abs(m) < 1 ? R.pick([-4, -2, 2, 4]) : R.nz(-4, 4);
    var val = m * p + b, on = R.chance(0.5), q = on ? val : val + R.pick([-3, -2, -1, 1, 2, 3]);
    return {
      stem: 'A line builder has an <b>m</b> slider (the slope) and a <b>b</b> slider (where the line crosses the y-axis). You want to make the line ' + eq(m, b) + '. What should each slider be set to? Then check: is ' + C.pt(p, q) + ' on your line?',
      think: 'm multiplies x. b is added on.',
      parts: [
        { kind: 'num', label: 'm slider', key: m, wrong: [{ v: b, tag: 'M9' }, { v: -m, tag: 'M2' }] },
        { kind: 'num', label: 'b slider', key: b, wrong: [{ v: m, tag: 'M9' }, { v: -b, tag: 'M2' }] },
        { kind: 'choice', label: 'Is ' + C.pt(p, q) + ' on the line?', keep: true, opts: [{ t: 'Yes', ok: on, tag: 'G' }, { t: 'No', ok: !on, tag: 'G' }] }
      ],
      answer: 'm = ' + f(m) + ', b = ' + f(b) + '; ' + (on ? 'yes' : 'no'),
      work: [
        'm is the number that multiplies x: m = ' + f(m) + '. b is the number added: b = ' + f(b) + '.',
        'Check: ' + f(m) + ' × ' + par(p) + ' ' + C.term(b) + ' = ' + f(val) + '.',
        f(q) + (on ? ' = ' : ' ≠ ') + f(val) + ', so ' + C.pt(p, q) + ' <b>' + (on ? 'is' : 'is not') + '</b> on the line.'
      ],
      why: {
        M9: 'You swapped the sliders. m = ' + f(m) + ' sets the slope; b = ' + f(b) + ' moves where the line crosses the y-axis.',
        M2: 'Check the sign: in ' + eq(m, b) + ', m = ' + f(m) + ' and b = ' + f(b) + '.'
      },
      steps: [
        { label: 'Which number multiplies x? m =', part: { kind: 'num', key: m }, hint: 'It is the number in front of x, with its sign.' },
        { label: 'Which number is added on? b =', part: { kind: 'num', key: b }, hint: 'A minus sign means b is negative.' },
        { label: 'Substitute x = ' + f(p) + ': ' + f(m) + ' × ' + par(p) + ' ' + C.term(b) + ' =', part: { kind: 'num', key: val }, hint: 'Multiply first, then add.' },
        { label: 'Is ' + C.pt(p, q) + ' on the line?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: on }, { t: 'No', ok: !on }] }, hint: 'Only if its y-value is exactly ' + f(val) + '.' }
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
        'For every 1 more in x, y changes by ' + f(ys[1]) + ' − ' + par(y0) + ' = ' + f(m) + ', so m = ' + f(m) + '.',
        'Work back from x = ' + x0 + ' to x = 0: ' + x0 + ' steps of ' + f(-m) + '. ' + f(y0) + ' − ' + x0 + ' × ' + par(m) + ' = ' + f(b) + ', so b = ' + f(b) + '.',
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
        { label: 'Work back ' + x0 + ' steps from x = ' + x0 + ' to x = 0: ' + f(y0) + ' − ' + x0 + ' × ' + par(m) + ' =', part: { kind: 'num', key: b }, hint: 'Each step back takes away ' + f(m) + '.' }
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
        'm = ' + f(dy) + ' ÷ ' + f(dx) + ' = ' + f(m) + '.',
        'Use ' + C.pt(x1, y1) + ': ' + f(y1) + ' = ' + f(m) + ' × ' + par(x1) + ' + b, so b = ' + f(y1) + ' − ' + par(m * x1) + ' = ' + f(b) + '.',
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
        { label: 'Change in x: ' + f(x2) + ' − ' + par(x1) + ' =', part: { kind: 'num', key: dx }, hint: 'Same order as for y.' },
        { label: 'm = ' + f(dy) + ' ÷ ' + f(dx) + ' =', part: { kind: 'num', key: m }, hint: 'Change in y ÷ change in x.' },
        { label: 'b = ' + f(y1) + ' − ' + f(m) + ' × ' + par(x1) + ' =', part: { kind: 'num', key: b }, hint: 'From ' + f(y1) + ' = ' + f(m) + ' × ' + par(x1) + ' + b, take ' + f(m * x1) + ' away from ' + f(y1) + '.' }
      ]
    };
  } });

  // converted from the plan's drag-to-match (match three): one choice per card, right only if every card is right
  C.add({ id: 'EQ-5g', skill: '12', level: 5, order: 2, type: 'DM', gen: function (R) {
    var m1, m2, b1, b2, L;
    function fits(l) { return Math.abs(l[0] + l[1]) <= 8; }
    do {
      m1 = R.pick([-3, -2, -1, 1, 2, 3]); do { m2 = R.pick([-3, -2, -1, 1, 2, 3]); } while (m2 === m1);
      b1 = R.nz(-5, 5); do { b2 = R.nz(-5, 5); } while (b2 === b1);
      L = [[m1, b1], [m1, b2], [m2, b1]];
    } while (!L.every(fits));
    var order = R.shuffle([0, 1, 2]), perm = R.shuffle([0, 1, 2]);
    var cards = [
      { name: 'Table A', kind: 't', line: perm[0] },
      { name: 'Table B', kind: 't', line: perm[1] },
      { name: 'Graph C', kind: 'g', line: perm[2] },
      { name: 'Graph D', kind: 'g', line: R.pick([perm[0], perm[1]]) }
    ];
    function rel(i, j) { return (L[i][0] === L[j][0] || L[i][1] === L[j][1]) ? 'M11' : 'G'; }
    function opts(j, tags) { return order.map(function (i) { var o = { t: eq(L[i][0], L[i][1]), ok: i === j }; if (tags && i !== j) o.tag = rel(i, j); return o; }); }
    var xs = [1, 2, 3, 4];
    var fig = '<div style="display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start">' + cards.map(function (c) {
      var l = L[c.line], body;
      if (c.kind === 't') body = C.table({ cols: ['x', 'y'], rows: xs.map(function (x) { return [x, l[0] * x + l[1]]; }) });
      else body = C.graph({ x: [-5, 5], y: [-8, 8], size: 210, h: 307, lx: 2, ly: 2, lines: [{ m: l[0], b: l[1] }], pts: [{ x: 0, y: l[1] }, { x: 1, y: l[0] + l[1] }], label: c.name + ': a line through ' + C.pt(0, l[1]) + ' and ' + C.pt(1, l[0] + l[1]) });
      return '<div><div style="font-weight:700;margin-bottom:4px">' + c.name + '</div>' + body + '</div>';
    }).join('') + '</div>';
    var a = cards[0], la = L[a.line];
    return {
      stem: 'Match each table and graph to its equation: ' + order.map(function (i) { return '<b>' + eq(L[i][0], L[i][1]) + '</b>'; }).join(', ') + '. One equation matches two cards.',
      fig: fig,
      think: 'Check both features: the change for every 1 more x, and the value at x = 0.',
      parts: cards.map(function (c) { return { kind: 'choice', label: c.name + ' matches', keep: true, opts: opts(c.line, true) }; }),
      answer: cards.map(function (c) { return c.name + ': ' + eq(L[c.line][0], L[c.line][1]); }).join('; '),
      work: cards.map(function (c) {
        var l = L[c.line];
        return c.name + ': ' + (c.kind === 't' ? 'y changes by ' + f(l[0]) + ' for every 1 more x; working back to x = 0 gives ' + f(l[1]) : 'crosses the y-axis at ' + f(l[1]) + ' and goes ' + upDown(l[0]) + ' for every 1 step right') + ', so <b>' + eq(l[0], l[1]) + '</b>.';
      }),
      why: { M11: 'That equation shares only one feature with the card. Check both the rate and the value at x = 0.' },
      steps: [
        { label: 'In Table A, for every 1 more x, y changes by', part: { kind: 'num', key: la[0] }, hint: 'Next row minus this row.' },
        { label: 'Work back from x = 1 to x = 0 in Table A: y =', part: { kind: 'num', key: la[1] }, hint: 'Take ' + f(la[0]) + ' away from the y-value at x = 1.' },
        { label: 'So Table A matches', part: { kind: 'choice', keep: true, opts: opts(a.line, false) }, hint: 'Both the slope and the y-intercept must match.' },
        { label: 'Graph C crosses the y-axis at y =', part: { kind: 'num', key: L[cards[2].line][1] }, hint: 'Look at x = 0.' }
      ]
    };
  } });

  C.add({ id: 'EQ-5e', skill: '12', level: 5, order: 3, type: 'CM', gen: function (R) {
    var m, b, x1 = R.int(2, 4), x2 = x1 + R.int(1, 3);
    do { m = R.nz(-4, 4); b = R.nz(-8, 8); } while (m === b);
    var y1 = m * x1 + b, y2 = m * x2 + b, dx = x2 - x1, dy = y2 - y1;
    var chain = []; for (var x = x1; x >= 0; x--) chain.push(f(m * x + b));
    var box = 'style="flex:1 1 240px;border:1px solid #DCE2EE;border-radius:10px;padding:10px;background:#fff"';
    var fig = '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
      '<div ' + box + '><b>Student A</b><br>y changes by ' + f(dy) + ' over ' + dx + ' steps, so ' + f(m) + ' for every 1 more x.<br>Work back from x = ' + x1 + ' to x = 0, one step at a time:<br>' + chain.join(' → ') + '<br>So y = ' + eq(m, b).slice(4) + '.</div>' +
      '<div ' + box + '><b>Student B</b><br>Step 1: m = ' + f(dy) + ' ÷ ' + dx + ' = ' + f(m) + '<br>Step 2: ' + f(y1) + ' = ' + f(m) + '(' + x1 + ') + b, so b = ' + f(b) + '<br>Step 3: check ' + f(m) + '(' + x2 + ') ' + C.term(b) + ' = ' + f(y2) + '<br>So ' + eq(m, b) + '.</div></div>';
    return {
      stem: 'Two students write the equation of the line through ' + C.pt(x1, y1) + ' and ' + C.pt(x2, y2) + '. Both get ' + eq(m, b) + '. Which step in B\'s work does the same job as A\'s "work back to x = 0"? What value do they both find there?',
      fig: fig,
      think: 'What is the output at x = 0 called?',
      parts: [
        { kind: 'choice', label: 'B\'s matching step', keep: true, opts: [{ t: 'Step 1: finding m', tag: 'M9' }, { t: 'Step 2: solving for b', ok: true }, { t: 'Step 3: checking the second point', tag: 'G' }] },
        { kind: 'num', label: 'Value at x = 0', key: b, wrong: [{ v: m, tag: 'M9' }, { v: y1, tag: 'M3' }] }
      ],
      answer: 'Step 2: solving for b; b = ' + f(b),
      work: [
        'Both methods find the output at x = 0, which is b.',
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
        'Pick a slope, say m = ' + f(m1) + '. Then ' + f(q) + ' = ' + f(m1) + ' × ' + par(p) + ' + b, so b = ' + f(b1) + ': <b>' + eq(m1, b1) + '</b>.',
        'Pick a different slope, m = ' + f(m2) + ': b = ' + f(q) + ' − ' + par(m2 * p) + ' = ' + f(b2) + ', so <b>' + eq(m2, b2) + '</b>.',
        'b is not 0 in either, so neither line passes through (0, 0).'
      ],
      why: {
        M16: 'Your line has b = 0, so it passes through (0, 0). Pick a slope that makes b something other than 0.',
        G: 'Each line must give y = ' + f(q) + ' when x = ' + f(p) + ', the two lines must be different, and b must not be 0.'
      },
      steps: [
        { label: 'Use slope m = ' + f(m1) + '. Then b = ' + f(q) + ' − ' + f(m1) + ' × ' + par(p) + ' =', part: { kind: 'num', key: b1 }, hint: 'Solve ' + f(q) + ' = ' + f(m1) + ' × ' + par(p) + ' + b.' },
        { label: 'Now use slope m = ' + f(m2) + '. Then b = ' + f(q) + ' − ' + f(m2) + ' × ' + par(p) + ' =', part: { kind: 'num', key: b2 }, hint: 'Same method with the new slope.' }
      ]
    };
  } });

  /* ---------------- Skill 13 Slope and intercept in context ---------------- */
  // the plan's frame has a second number slot ("The slope is [number]"); it is given in the frame so the item keeps 4 parts
  C.add({ id: 'RC-5a', skill: '13', level: 5, order: 1, type: 'FR', gen: function (R) {
    var m, b; do { m = R.int(2, 9); b = R.int(5, 20); } while (m === b);
    var e = C.eqText(m, b, 'C', 'd');
    return {
      stem: 'A taxi\'s cost in riyals is ' + e + ', where d is the distance in kilometres. Complete the sentence about the slope.',
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
        { label: 'Which number is multiplied by d in ' + e + '?', part: { kind: 'num', key: m }, hint: 'It is the number right in front of d.' },
        { label: 'For every 1 more kilometre, the cost changes by how many riyals?', part: { kind: 'num', key: m }, hint: 'Each extra kilometre adds one more ' + m + '.' },
        { label: 'Does the cost go up or down as d grows?', part: { kind: 'choice', keep: true, opts: [{ t: 'Up', ok: true }, { t: 'Down' }] }, hint: 'The slope ' + m + ' is positive.' }
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
      stem: 'A plumber charges a ' + b + '-riyal call-out fee plus ' + m + ' riyals per hour. Write an equation for the cost C (riyals) after h hours.',
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
        { label: 'Check: the cost for 2 hours = ' + m + ' × 2 + ' + b + ' =', part: { kind: 'num', key: 2 * m + b }, hint: 'Multiply first, then add the fee once.' }
      ]
    };
  } });

  // converted from the plan's slider build: the student types the slider values instead of dragging them
  C.add({ id: 'EQ-5h', skill: '13', level: 5, order: 4, type: 'NE', gen: function (R) {
    var m, b; do { m = R.int(10, 30) * 10; b = R.int(10, 40) * 10; } while (m === b);
    return {
      stem: 'A gym costs ' + b + ' riyals to join plus ' + m + ' riyals per month. A graph builder draws the total cost C (riyals) against months n, with a <b>slope</b> slider and an <b>intercept</b> slider (where the line crosses the cost axis). What should each slider be set to?',
      think: 'The slope is the change for every 1 more month. The intercept is the cost at 0 months.',
      parts: [
        { kind: 'num', label: 'Slope slider (riyals per month)', key: m, wrong: [{ v: b, tag: 'M9' }, { v: m + b, tag: 'M14' }] },
        { kind: 'num', label: 'Intercept slider (riyals)', key: b, wrong: [{ v: m, tag: 'M9' }, { v: 0, tag: 'M16' }] }
      ],
      answer: 'slope ' + m + ' riyals per month, intercept ' + b + ' riyals',
      work: [
        'The monthly price is the rate: the cost goes up ' + m + ' riyals for every 1 more month, so slope = <b>' + m + '</b>.',
        'The joining fee is the cost at 0 months, so intercept = <b>' + b + '</b>.',
        'The line is ' + C.eqText(m, b, 'C', 'n') + '.'
      ],
      why: {
        M9: 'You swapped the sliders. ' + m + ' riyals is paid every month (the slope); ' + b + ' riyals is paid once (the intercept).',
        M16: 'At 0 months you have already paid the ' + b + '-riyal joining fee, so the line does not start at 0.',
        M14: 'The slope is only the monthly price, ' + m + ' riyals.'
      },
      steps: [
        { label: 'For every 1 more month, the cost goes up by how many riyals?', part: { kind: 'num', key: m }, hint: 'The monthly price.' },
        { label: 'What is the cost at 0 months (riyals)?', part: { kind: 'num', key: b }, hint: 'You pay only the joining fee.' },
        { label: 'Check: the cost after 3 months = ' + m + ' × 3 + ' + b + ' =', part: { kind: 'num', key: 3 * m + b }, hint: 'Multiply first, then add the joining fee once.' }
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
