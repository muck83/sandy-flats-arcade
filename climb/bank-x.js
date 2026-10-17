/* Climb question bank: extension skills 20 (slope and equations) and 21 (reasoning), the plan's Level 6-7 stretch items.
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt, M = '−';
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 − (−2)
  function coprime(a, b) { return C.gcd(a, b) === 1; }

  /* ---------------- Skill 20 Extension: slope and equations ---------------- */
  C.add({ id: 'RC-6a', skill: '20', level: 6, order: 1, type: 'NE', gen: function (R) {
    var fr = R.pick([[2, 3], [3, 4], [5, 2], [3, 2], [4, 3], [1, 2], [2, 5], [5, 3], [1, 3], [3, 5]]);
    var p = fr[0] * R.sign(), q = fr[1], k = (q * 2 <= 8 && Math.abs(p) * 2 <= 8 && R.chance(0.4)) ? 2 : 1;
    var dx = q * k, dy = p * k, a = R.int(-8, 8 - dx), b = R.int(Math.max(-9, -9 - dy), Math.min(9, 9 - dy));
    var x1 = a, y1 = b, x2 = a + dx, y2 = b + dy;
    if (R.chance(0.4)) { x1 = a + dx; y1 = b + dy; x2 = a; y2 = b; }
    var dX = x2 - x1, dY = y2 - y1, m = p / q;
    return {
      stem: 'Find the slope of the line through ' + C.pt(x1, y1) + ' and ' + C.pt(x2, y2) + '.',
      think: 'Change in y ÷ change in x. A fraction is fine.',
      parts: [{ kind: 'num', label: 'Slope', key: m, wrong: [{ v: 1 / m, tag: 'M1' }, { v: -m, tag: 'M2' }, { v: dY - dX, tag: 'M17' }] }],
      answer: 'Slope = ' + f(m),
      work: ['Change in y: ' + f(y2) + ' − ' + par(y1) + ' = ' + f(dY) + '. Change in x: ' + f(x2) + ' − ' + par(x1) + ' = ' + f(dX) + '.', 'Slope = ' + f(dY) + ' ÷ ' + par(dX) + ' = <b>' + f(m) + '</b>', 'For every 1 more in x, y changes by ' + f(m) + '.'],
      why: { M1: 'You put the change in x (' + f(dX) + ') on top and the change in y (' + f(dY) + ') on the bottom.', M2: 'The size is right but check the sign: ' + f(dY) + ' ÷ ' + par(dX) + ' is ' + (m < 0 ? 'negative' : 'positive') + '.', M17: 'You subtracted the changes: ' + f(dY) + ' − ' + par(dX) + '. Slope divides them.' },
      steps: [
        { label: 'Change in y = ' + f(y2) + ' − ' + par(y1) + ' =', part: { kind: 'num', key: dY }, hint: 'Second y minus first y. Keep the sign.' },
        { label: 'Change in x = ' + f(x2) + ' − ' + par(x1) + ' =', part: { kind: 'num', key: dX }, hint: 'Second x minus first x, in the same order.' },
        { label: 'Slope = ' + f(dY) + ' ÷ ' + par(dX) + ' =', part: { kind: 'num', key: m }, hint: 'Divide and simplify. You can type a fraction like 2/3.' }
      ]
    };
  } });

  C.add({ id: 'RC-6b', skill: '20', level: 6, order: 2, type: 'MC', gen: function (R) {
    var r1 = R.int(1, 3), u1 = R.nz(-3, 3), s = R.pick([2, 3]);
    var extX = (1 + s) * r1, extY = (1 + s) * Math.abs(u1);
    var x0 = R.int(-9, 9 - extX), y0 = u1 > 0 ? R.int(-9, 9 - extY) : R.int(-9 + extY, 9);
    var sizes = R.chance(0.5) ? [1, s] : [s, 1], r2 = r1 * s, u2 = u1 * s, m = u1 / r1;
    var lines = [{ p: [[x0, y0], [x0 + r1, y0 + u1]] }], pts = [], P = [x0, y0];
    sizes.forEach(function (t) {
      var R1 = r1 * t, U1 = u1 * t;
      lines.push({ seg: [[P[0], P[1]], [P[0] + R1, P[1]], [P[0] + R1, P[1] + U1]], color: C.COL.line2, w: 2.5 });
      pts.push({ x: P[0], y: P[1] }); P = [P[0] + R1, P[1] + U1];
    });
    pts.push({ x: P[0], y: P[1] });
    return {
      stem: 'Two slope triangles are drawn on the same line. The small one has run ' + r1 + ' and rise ' + f(u1) + '. The big one has run ' + r2 + ' and rise ' + f(u2) + '. Which is true?',
      fig: C.graph({ x: [-10, 10], y: [-10, 10], lines: lines, pts: pts, label: 'A line with two slope triangles, one ' + s + ' times as big as the other' }),
      parts: [{ kind: 'choice', label: 'Which is true?', opts: [
        { t: 'Both triangles give the same slope', ok: true },
        { t: 'The big triangle gives a greater slope', tag: 'M13' },
        { t: 'The small triangle gives a greater slope' },
        { t: 'You can’t tell which slope is greater' }
      ] }],
      answer: 'Both give the same slope, ' + f(m),
      work: ['Small triangle: rise ÷ run = ' + f(u1) + ' ÷ ' + r1 + ' = ' + f(m) + '.', 'Big triangle: ' + f(u2) + ' ÷ ' + r2 + ' = ' + f(m) + '.', 'The triangles are similar, so <b>both give the same slope</b>: any two points on a line give the same slope.'],
      why: { M13: 'The big triangle has longer legs, but slope compares them: ' + f(u2) + ' ÷ ' + r2 + ' = ' + f(m) + ', the same as ' + f(u1) + ' ÷ ' + r1 + '.' },
      steps: [
        { label: 'Small triangle: ' + f(u1) + ' ÷ ' + r1 + ' =', part: { kind: 'num', key: m }, hint: 'Slope = rise ÷ run.' },
        { label: 'Big triangle: ' + f(u2) + ' ÷ ' + r2 + ' =', part: { kind: 'num', key: m }, hint: 'Divide the rise by the run. Simplify.' },
        { label: 'So the slopes are', part: { kind: 'choice', keep: true, opts: [{ t: 'the same', ok: true }, { t: 'different' }] }, hint: 'Compare your two answers.' }
      ]
    };
  } });

  // a drag-the-point build: the student moves A up or down until the line AB has the given slope
  C.add({ id: 'RC-7a', skill: '20', level: 7, order: 1, type: 'NE', ia: true, gen: function (R) {
    var q, p, j, sg, dX, rise, a, c, d, k, k2, k3, tries = 0;
    do {
      q = R.pick([2, 3]); do { p = R.nz(-4, 4); } while (!coprime(Math.abs(p), q));
      j = R.int(1, 2); sg = R.sign(); dX = q * j * sg; rise = p * j * sg;
      a = R.int(-8, 8); c = a + dX; d = R.int(-8, 8); k = d - rise; k2 = d + rise;
    } while ((c < -9 || c > 9 || k < -9 || k > 9 || k2 < -10 || k2 > 10 || k === k2) && ++tries < 300);
    var m = p / q, wrong = [{ v: [[a, k2]], tag: 'M2' }];
    k3 = d - dX / m;
    if (Math.abs(k3 - Math.round(k3)) < 1e-9 && k3 >= -10 && k3 <= 10 && k3 !== k && k3 !== k2) wrong.push({ v: [[a, k3]], tag: 'M1' });
    var s0; do { s0 = R.int(-9, 9); } while (s0 === k || s0 === d);
    var grid = { x: [-10, 10], y: [-10, 10], size: 400, pts: [{ x: c, y: d, l: 'B ' + C.pt(c, d), c: C.COL.line }], label: 'Grid with point B at ' + C.pt(c, d) };
    return {
      stem: 'Point B is at ' + C.pt(c, d) + '. Point A is at (' + f(a) + ', k). The line through A and B has slope ' + f(m) + '. Drag A up or down to the right place. What is k?',
      think: 'Slope = change in y ÷ change in x, from A to B.',
      parts: [{ kind: 'points', label: 'Move A', grid: grid, start: [[a, s0]], names: ['A'], lock: 'x', key: [[a, k]], wrong: wrong,
        extra: function (cur) { return cur[0][0] === c ? [] : [{ p: [[cur[0][0], cur[0][1]], [c, d]] }]; },
        readout: function (cur) { return 'A is at ' + C.pt(cur[0][0], cur[0][1]); } }],
      answerFig: C.graph({ x: [-10, 10], y: [-10, 10], size: 260, lines: [{ p: [[a, k], [c, d]] }], pts: [{ x: a, y: k, l: 'A' }, { x: c, y: d, l: 'B' }], label: 'The line through A ' + C.pt(a, k) + ' and B ' + C.pt(c, d) }),
      answer: 'k = ' + f(k),
      work: ['Change in x from A to B: ' + f(c) + ' − ' + par(a) + ' = ' + f(dX) + '.', 'Change in y must be ' + f(m) + ' × ' + par(dX) + ' = ' + f(rise) + '.', 'So ' + f(d) + ' − k = ' + f(rise) + ', and k = ' + f(d) + ' − ' + par(rise) + ' = <b>' + f(k) + '</b>.'],
      why: { M2: 'You went the wrong direction: that line has slope ' + f(-m) + ', not ' + f(m) + '.', M1: 'That line has slope ' + f(1 / m) + ': the change in x over the change in y.' },
      steps: [
        { label: 'Change in x from A to B: ' + f(c) + ' − ' + par(a) + ' =', part: { kind: 'num', key: dX }, hint: 'B\'s x minus A\'s x.' },
        { label: 'Change in y = slope × change in x = ' + f(m) + ' × ' + par(dX) + ' =', part: { kind: 'num', key: rise }, hint: 'Rise = slope × run.' },
        { label: 'k = ' + f(d) + ' − ' + par(rise) + ' =', part: { kind: 'num', key: k }, hint: 'B\'s y minus the rise gives A\'s y.' }
      ]
    };
  } });

  C.add({ id: 'EQ-6a', skill: '20', level: 6, order: 3, type: 'EE', gen: function (R) {
    var q, p, x1, y1, m, b, mx;
    do {
      q = R.pick([2, 3, 4]); do { p = R.nz(-5, 5); } while (!coprime(Math.abs(p), q));
      m = p / q; x1 = q * R.nz(-3, 3); y1 = R.int(-8, 8); mx = m * x1; b = y1 - mx;
    } while (b === 0 || Math.abs(b) > 12);
    var b2 = y1 + mx;
    return {
      stem: 'A line has slope ' + f(m) + ' and passes through ' + C.pt(x1, y1) + '. Write its equation.',
      think: 'Put the point into y = mx + b and solve for b.',
      parts: [{ kind: 'eq', label: 'Equation', key: C.line(m, b), show: C.eqText(m, b), wrong: [{ f: C.line(-m, b), tag: 'M2' }, { f: C.line(m, b2), tag: 'M2' }, { f: C.line(1 / m, y1 - x1 / m), tag: 'M1' }] }],
      answer: C.eqText(m, b),
      work: [f(y1) + ' = (' + f(m) + ')(' + f(x1) + ') + b', f(y1) + ' = ' + f(mx) + ' + b, so b = ' + f(y1) + ' − ' + par(mx) + ' = ' + f(b), 'Equation: <b>' + C.eqText(m, b) + '</b>'],
      why: { M2: 'Check the signs: b = ' + f(y1) + ' − ' + par(mx) + ' = ' + f(b) + ', and the slope is ' + f(m) + '.', M1: 'Your slope is ' + f(1 / m) + ', upside down. The slope is ' + f(m) + '.' },
      steps: [
        { label: '(' + f(m) + ') × ' + par(x1) + ' =', part: { kind: 'num', key: mx }, hint: 'Multiply the slope by the x of the point.' },
        { label: 'b = ' + f(y1) + ' − ' + par(mx) + ' =', part: { kind: 'num', key: b }, hint: 'y = mx + b, so b = y − mx.' },
        { label: 'So the equation is', part: { kind: 'choice', opts: [{ t: C.eqText(m, b), ok: true }, { t: C.eqText(-m, b) }, { t: C.eqText(m, b2) }] }, hint: 'Slope ' + f(m) + ', start value ' + f(b) + '.' }
      ]
    };
  } });

  C.add({ id: 'EQ-6b', skill: '20', level: 6, order: 4, type: 'NE', gen: function (R) {
    var r, t1, t2, b, h1, h2;
    do { r = R.int(1, 5); t1 = R.int(1, 4); t2 = t1 + R.int(1, 4); b = R.int(18, 40); h1 = b - r * t1; h2 = b - r * t2; } while (h2 < 3 || 2 * h1 === b);
    var dt = t2 - t1, dh = h2 - h1;
    return {
      stem: 'A candle burns down at a steady rate. After ' + t1 + ' hour' + (t1 > 1 ? 's' : '') + ' it is ' + h1 + ' cm tall. After ' + t2 + ' hours it is ' + h2 + ' cm tall. How tall was it before it was lit?',
      think: 'Find the rate per hour, then go back to 0 hours.',
      parts: [{ kind: 'num', label: 'Height at 0 hours (cm)', key: b, wrong: [{ v: h1, tag: 'M3' }, { v: b - 2 * r * t1, tag: 'M2' }, { v: 2 * h1, tag: 'M4' }] }],
      answer: b + ' cm',
      work: ['Rate = (' + h2 + ' − ' + h1 + ') ÷ (' + t2 + ' − ' + t1 + ') = ' + f(dh) + ' ÷ ' + dt + ' = ' + f(-r) + ' cm per hour.', 'Go back ' + t1 + ' hour' + (t1 > 1 ? 's' : '') + ' from ' + h1 + ' cm: ' + h1 + ' − (' + f(-r) + ')(' + t1 + ') = ' + h1 + ' + ' + (r * t1) + '.', 'It was <b>' + b + ' cm</b> tall before it was lit.'],
      why: { M3: h1 + ' cm is the height after ' + t1 + ' hour' + (t1 > 1 ? 's' : '') + ', not at 0 hours.', M2: 'The candle gets shorter, so the rate is ' + f(-r) + '. Going back in time it was taller: ' + h1 + ' + ' + (r * t1) + '.', M4: 'You used ' + h1 + ' ÷ ' + t1 + ' as the rate, from one point. Use the change between the two times.' },
      steps: [
        { label: 'Change in height: ' + h2 + ' − ' + h1 + ' =', part: { kind: 'num', key: dh }, hint: 'End minus start. It got shorter, so it is negative.' },
        { label: 'Rate: ' + f(dh) + ' ÷ ' + dt + ' =', part: { kind: 'num', key: -r }, hint: 'Divide by the change in time (' + dt + ' hours).' },
        { label: 'Height at 0 hours: ' + h1 + ' − (' + f(-r) + ')(' + t1 + ') =', part: { kind: 'num', key: b }, hint: 'Undo ' + t1 + ' hour' + (t1 > 1 ? 's' : '') + ' of burning: add back ' + (r * t1) + ' cm.' }
      ]
    };
  } });

  C.add({ id: 'EQ-7a', skill: '20', level: 7, order: 2, type: 'EE', gen: function (R) {
    var a, b, m;
    do { a = R.nz(-8, 8); b = R.nz(-9, 9); m = -b / a; } while (a * a === -b || Math.abs(a) === 1 && Math.abs(b) === 1);
    return {
      stem: 'A line crosses the x-axis at ' + f(a) + ' and the y-axis at ' + f(b) + '. Write its equation.',
      think: 'Turn each crossing into a point, then find the slope.',
      parts: [{ kind: 'eq', label: 'Equation', key: C.line(m, b), show: C.eqText(m, b), wrong: [{ f: C.line(a, b), tag: 'M12' }, { f: C.line(-m, b), tag: 'M2' }, { f: C.line(b, a), tag: 'M9' }] }],
      answer: C.eqText(m, b),
      work: ['The crossings are the points ' + C.pt(a, 0) + ' and ' + C.pt(0, b) + '.', 'Slope = (' + f(b) + ' − 0) ÷ (0 − ' + par(a) + ') = ' + f(b) + ' ÷ ' + par(-a) + ' = ' + f(m) + '.', 'The y-intercept is ' + f(b) + ', so <b>' + C.eqText(m, b) + '</b>.'],
      why: { M12: 'You used the x-crossing ' + f(a) + ' as the slope. A crossing is a point, not the slope.', M2: 'Check the sign: from ' + C.pt(a, 0) + ' to ' + C.pt(0, b) + ' the slope is ' + f(m) + '.' },
      steps: [
        { label: 'The line goes through ' + C.pt(a, 0) + ' and ' + C.pt(0, b) + '. Slope = ' + f(b) + ' ÷ ' + par(-a) + ' =', part: { kind: 'num', key: m }, hint: 'Change in y ÷ change in x, from the first point to the second.' },
        { label: 'The y-intercept b =', part: { kind: 'num', key: b }, hint: 'Where it crosses the y-axis.' }
      ]
    };
  } });

  /* ---------------- Skill 21 Extension: reasoning ---------------- */
  C.add({ id: 'LN-6a', skill: '21', level: 6, type: 'MC', gen: function (R) {
    var r = R.pick([5, 8, 10, 12, 15]), i = R.pick([3, 4, 5, 6]);
    return {
      stem: 'Which relationship is linear?',
      think: 'Linear means the same change for every 1 more.',
      parts: [{ kind: 'choice', label: 'Linear', opts: [
        { t: 'A phone battery losing ' + r + '% of a full charge every hour, against hours', ok: true },
        { t: 'The height of a dropped ball, against time', tag: 'M7' },
        { t: 'Money in an account earning ' + i + '% interest each year, against years', tag: 'M16' },
        { t: 'The number of handshakes when everyone in a group shakes hands, against the number of people', tag: 'M7' }
      ] }],
      answer: 'The battery losing ' + r + '% every hour',
      work: ['The battery loses the same ' + r + '% for every 1 more hour, so its rate is constant: <b>linear</b>.', 'The ball speeds up as it falls, so it drops more each second.', 'Interest grows on itself, and each new person shakes more hands: those rates keep changing.'],
      why: { M7: 'That one has a pattern, but its change is not the same every step.', M16: 'Each year\'s interest is ' + i + '% of a bigger amount, so the riyals added grow every year.' },
      steps: [
        { label: 'The battery starts at 100%. After 1 hour it is at ' + (100 - r) + '%. After 2 hours it is at', part: { kind: 'num', key: 100 - r * 2 }, hint: 'It loses ' + r + '% each hour.' },
        { label: 'A dropped ball speeds up. Does it fall the same distance every second?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes' }, { t: 'No', ok: true }] }, hint: 'Faster means more distance each second.' },
        { label: 'Which one has the same change every step?', part: { kind: 'choice', keep: true, opts: [{ t: 'Battery', ok: true }, { t: 'Ball' }, { t: 'Interest' }, { t: 'Handshakes' }] }, hint: 'Only one of them changes by the same amount each time.' }
      ]
    };
  } });

  C.add({ id: 'FN-7a', skill: '21', level: 7, order: 1, type: 'MS', gen: function (R) {
    var c = R.nz(-6, 6), h = R.int(1, 5), r = R.int(2, 5), k = R.int(1, 9);
    return {
      stem: 'Select all the equations where y is a function of x.',
      think: 'Picture each graph. Can one x have two y-values?',
      parts: [{ kind: 'multi', label: 'y is a function of x', opts: [
        { t: 'y = ' + f(c), ok: true, missTag: 'M15' },
        { t: 'x = ' + f(c), ok: false },
        { t: 'y = |x − ' + h + '|', ok: true },
        { t: 'x² + y² = ' + (r * r), ok: false },
        { t: 'y = x² − ' + k, ok: true },
        { t: 'x = y²', ok: false }
      ] }],
      answer: 'y = ' + f(c) + ', y = |x − ' + h + '| and y = x² − ' + k,
      work: ['y = ' + f(c) + ' gives every input the same output: still one output each, so a <b>function</b>.', 'y = |x − ' + h + '| and y = x² − ' + k + ' give one y for each x: <b>functions</b>.', 'x = ' + f(c) + ' is a vertical line (one input, endless outputs); the circle x² + y² = ' + (r * r) + ' and x = y² give some inputs two outputs: <b>not functions</b>.'],
      why: { M15: 'y = ' + f(c) + ' has no x in it, but each input still has exactly one output, ' + f(c) + '.' },
      steps: [
        { label: 'On x = ' + f(c) + ', how many outputs does the input ' + f(c) + ' have?', part: { kind: 'choice', keep: true, opts: [{ t: 'One' }, { t: 'Endless', ok: true }] }, hint: 'It is a vertical line.' },
        { label: 'On y = ' + f(c) + ', does each input have exactly one output?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: true }, { t: 'No' }] }, hint: 'Every x gives y = ' + f(c) + '.' },
        { label: 'On x = y², the input 4 gives y = 2 and y =', part: { kind: 'num', key: -2 }, hint: 'Which other number squares to 4?' }
      ]
    };
  } });

  C.add({ id: 'LN-7a', skill: '21', level: 7, order: 2, type: 'MC', gen: function (R) {
    var a = R.nz(-6, 6), ex = '(x ' + C.term(a) + ')² − x²';
    return {
      stem: 'Is y = ' + ex + ' a linear function?',
      think: 'Expand the square first.',
      parts: [{ kind: 'choice', label: 'Linear?', opts: [
        { t: 'Yes, it simplifies to ' + C.eqText(2 * a, a * a), ok: true },
        { t: 'No, it has squares in it' },
        { t: 'No, its graph is a parabola' },
        { t: 'You can’t tell without a graph' }
      ] }],
      answer: 'Yes: ' + C.eqText(2 * a, a * a),
      work: ['(x ' + C.term(a) + ')² = x² ' + C.term(2 * a) + 'x + ' + (a * a) + '.', 'So y = x² ' + C.term(2 * a) + 'x + ' + (a * a) + ' − x² = ' + C.eqText(2 * a, a * a).replace('y = ', '') + '.', 'The x² terms cancel, so it is <b>linear</b>.'],
      steps: [
        { label: '(x ' + C.term(a) + ')² = x² + ?x + ' + (a * a) + '. The ? is', part: { kind: 'num', key: 2 * a }, hint: '(x + a)² = x² + 2ax + a².' },
        { label: 'After the x² terms cancel, the number on its own is', part: { kind: 'num', key: a * a }, hint: par(a) + ' × ' + par(a) + '.' },
        { label: 'So is it linear?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: true }, { t: 'No' }] }, hint: 'y = ' + f(2 * a) + 'x + ' + (a * a) + ' is a line.' }
      ]
    };
  } });

  C.add({ id: 'CP-7a', skill: '21', level: 7, order: 3, type: 'MC', gen: function (R) {
    var kF = R.int(4, 8), kS = R.int(1, 3), tS = R.int(4, 8), tF = tS + R.int(1, 4), bF = kF * tF, bS = kS * tS;
    var aFast = R.chance(0.5), N = aFast ? ['A', 'B'] : ['B', 'A'];   // N[0] drains faster, N[1] empties first
    var kA = aFast ? kF : kS, bA = aFast ? bF : bS, kB = aFast ? kS : kF, bB = aFast ? bS : bF, tA = bA / kA, tB = bB / kB;
    function o(fz, fs) { return 'Tank ' + fz + ' drains faster; tank ' + fs + ' empties first'; }
    return {
      stem: 'Tank A drains as shown in the table. Tank B drains by the rule V = ' + bB + ' − ' + kB + 't, where V is litres left after t minutes. Which drains faster, and which empties first?',
      fig: C.table({ cols: ['Time t (min)', 'Tank A (L)'], rows: [0, 1, 2, 3].map(function (t) { return [t, bA - kA * t]; }) }),
      think: 'Faster means more litres lost per minute. Time to empty = start ÷ rate.',
      parts: [{ kind: 'choice', label: 'Which is true?', opts: [
        { t: o(N[0], N[1]), ok: true },
        { t: o(N[0], N[0]), tag: 'M11' },
        { t: o(N[1], N[1]), tag: 'M2' },
        { t: o(N[1], N[0]) }
      ] }],
      answer: o(N[0], N[1]),
      work: ['Litres lost per minute: A ' + kA + ', B ' + kB + '. Tank <b>' + N[0] + '</b> drains faster.', 'Time to empty = start ÷ rate: A ' + bA + ' ÷ ' + kA + ' = ' + f(tA) + ' min, B ' + bB + ' ÷ ' + kB + ' = ' + f(tB) + ' min.', 'Tank <b>' + N[1] + '</b> empties first: it starts with much less water.'],
      why: { M11: 'Draining faster is not enough: tank ' + N[0] + ' starts with more water, so it takes ' + f(N[0] === 'A' ? tA : tB) + ' minutes.', M2: 'Compare litres lost per minute: ' + kF + ' is faster than ' + kS + ', even though −' + kF + ' is less than −' + kS + '.' },
      steps: [
        { label: 'How many litres does tank A lose each minute?', part: { kind: 'num', key: kA }, hint: 'Look at how the table changes for 1 more minute.' },
        { label: 'How many minutes until tank A is empty? ' + bA + ' ÷ ' + kA + ' =', part: { kind: 'num', key: tA }, hint: 'Start ÷ litres per minute.' },
        { label: 'How many minutes until tank B is empty? ' + bB + ' ÷ ' + kB + ' =', part: { kind: 'num', key: tB }, hint: 'Start ÷ litres per minute.' },
        { label: 'Which tank empties first?', part: { kind: 'choice', keep: true, opts: [{ t: 'A', ok: N[1] === 'A' }, { t: 'B', ok: N[1] === 'B' }] }, hint: 'The one with fewer minutes.' }
      ]
    };
  } });

  C.add({ id: 'QG-7a', skill: '21', level: 7, order: 4, type: 'MS', gen: function (R) {
    var S0, r1, r2, t1, t2, low, high, tries = 0, wantRet = R.chance(0.4);
    do {
      S0 = R.pick([60, 70, 80, 90, 100]); r1 = R.pick([10, 20]); r2 = R.pick([10, 20, 30, 40]); t1 = R.int(2, 5); t2 = R.int(1, 4);
      low = S0 - r1 * t1; high = low + r2 * t2; tries++;
    } while (r2 === r1 || low < 0 || high > 100 || t1 + t2 > 9 || (tries < 300 && wantRet !== (high === S0)));
    var T = t1 + t2, steeper = r2 > r1, ret = high === S0;
    var fig = C.graph({ x: [0, 12], y: [0, 100], dx: 1, dy: 10, lx: 2, ly: 20, xl: 'Time (hours)', yl: 'Charge (%)',
      lines: [{ seg: [[0, S0], [t1, low], [T, high], [12, high]] }], pts: [{ x: 0, y: S0 }, { x: t1, y: low }, { x: T, y: high }],
      label: 'Battery charge falls for ' + t1 + ' hours, rises for ' + t2 + ' hours, then stays level' });
    return {
      stem: 'A phone\'s battery drains at a steady rate for ' + t1 + ' hours, charges for ' + t2 + ' hour' + (t2 > 1 ? 's' : '') + ', then sits unused. Select all the true statements about the graph.',
      fig: fig,
      parts: [{ kind: 'multi', label: 'True statements', opts: [
        { t: 'The first segment has a negative slope', ok: true },
        { t: 'The charging segment is steeper than the draining segment', ok: steeper, tag: steeper ? null : 'M13', missTag: steeper ? 'M13' : null },
        { t: 'The last segment is horizontal', ok: true },
        { t: 'The graph returns to its starting value', ok: ret },
        { t: 'The whole graph is one linear function', ok: false, tag: 'M7' }
      ] }],
      answer: 'Negative first slope, last segment horizontal' + (steeper ? ', charging steeper' : '') + (ret ? ', returns to the start' : ''),
      work: ['Draining: ' + S0 + '% → ' + low + '% in ' + t1 + ' hours, ' + f(-r1) + '% per hour. Charging: ' + low + '% → ' + high + '% in ' + t2 + ' hour' + (t2 > 1 ? 's' : '') + ', +' + r2 + '% per hour.', 'Compare sizes for steepness: ' + r2 + ' ' + (steeper ? '>' : '<') + ' ' + r1 + ', so the charging segment is <b>' + (steeper ? 'steeper' : 'less steep') + '</b>. It ends at ' + high + '%, ' + (ret ? 'the' : 'not the') + ' starting ' + S0 + '%.', 'Three different rates (' + f(-r1) + ', ' + r2 + ', 0) means three pieces, not one linear function.'],
      why: { M7: 'The graph has three different rates, so it is not one linear function.', M13: 'Steepness is the rate, not the length of the segment: charging is ' + r2 + '% per hour, draining is ' + r1 + '% per hour.' },
      steps: [
        { label: 'While draining, how much charge is lost each hour? (' + S0 + ' − ' + low + ') ÷ ' + t1 + ' =', part: { kind: 'num', key: r1 }, hint: 'Change in charge ÷ change in time.' },
        { label: 'While charging, how much is gained each hour? (' + high + ' − ' + low + ') ÷ ' + t2 + ' =', part: { kind: 'num', key: r2 }, hint: 'Change in charge ÷ change in time.' },
        { label: 'How many different rates does the graph have?', part: { kind: 'num', key: 3 }, hint: 'Draining, charging and sitting unused.' }
      ]
    };
  } });
})();
