/* Climb question bank: skill 9 (rate from tables and scaled graphs) and skill 10 (initial value).
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt;
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 − (−2)
  function okFrac(v) { return isFinite(v) && !!C.asFrac(v); }
  function uniq(opts) { var seen = {}; return opts.filter(function (o) { var k = C.strip(o.t); if (seen[k]) return false; seen[k] = 1; return true; }); }
  var BLANK = '<span class="cblank">?</span>';

  /* ---------------- 9 Rate from tables and scaled graphs ---------------- */
  C.add({ id: 'RC-4b', skill: '9', level: 4, order: 1, type: 'NE', gen: function (R) {
    var s, r, k;
    do { s = R.int(2, 5); r = R.nz(-6, 6); k = r * s; } while (Math.abs(r) < 2 || k - s === r);
    var x0 = R.nz(-6, 6), y0 = R.int(-10, 15);
    var xs = [0, 1, 2, 3].map(function (i) { return x0 + s * i; }), ys = [0, 1, 2, 3].map(function (i) { return y0 + k * i; });
    return {
      stem: 'What is the rate of change of y with respect to x in this table?',
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }) }),
      think: 'Does x go up by 1 each row?',
      parts: [{ kind: 'num', label: 'Rate of change', key: r, wrong: [{ v: k, tag: 'M8' }, { v: s / k, tag: 'M1' }, { v: k - s, tag: 'M17' }] }],
      answer: f(r) + ' (y changes by ' + f(r) + ' for every 1 more x)',
      work: ['Each row, x goes up by ' + s + ' (not 1) and y changes by ' + f(k) + '.', 'Rate = change in y ÷ change in x = ' + f(k) + ' ÷ ' + s + ' = <b>' + f(r) + '</b>', 'For every 1 more in x, y changes by ' + f(r) + '.'],
      why: {
        M8: 'You used the change between rows, ' + f(k) + ', but x goes up by ' + s + ' each row, not 1.',
        M1: 'You put the change in x (' + s + ') on top and the change in y (' + f(k) + ') on the bottom.',
        M17: 'You subtracted the changes: ' + f(k) + ' − ' + s + ' = ' + f(k - s) + '. Divide them instead.'
      },
      steps: [
        { label: 'From one row to the next, x goes up by', part: { kind: 'num', key: s }, hint: f(xs[1]) + ' − ' + par(xs[0]) + '.' },
        { label: 'From one row to the next, y changes by', part: { kind: 'num', key: k }, hint: f(ys[1]) + ' − ' + par(ys[0]) + '. Keep the sign.' },
        { label: 'Rate = ' + f(k) + ' ÷ ' + s + ' =', part: { kind: 'num', key: r }, hint: 'Change in y divided by change in x.' }
      ]
    };
  } });

  C.add({ id: 'RC-4c', skill: '9', level: 4, order: 2, type: 'NE', gen: function (R) {
    var sx, sy, i1, i2, j1, j2, key, sq, rec;
    do {
      sx = R.pick([1, 2, 5, 10]); sy = R.pick([1, 2, 5, 10]);
      i1 = R.int(1, 3); i2 = i1 + R.int(2, 6); j1 = R.int(1, 9); j2 = R.int(1, 9);   // points off the axes so the axis numbers stay readable
      key = (j2 - j1) * sy / ((i2 - i1) * sx); sq = (j2 - j1) / (i2 - i1); rec = 1 / key;
    } while (sx === sy || j1 === j2 || !okFrac(key) || !okFrac(sq) || !okFrac(rec) || C.near(key, sq) || C.near(key, rec) || C.near(sq, rec));
    var x1 = i1 * sx, x2 = i2 * sx, y1 = j1 * sy, y2 = j2 * sy, dX = x2 - x1, dY = y2 - y1;
    var fig = C.graph({ x: [0, 10 * sx], y: [0, 10 * sy], dx: sx, dy: sy, lx: sx, ly: sy, size: 360,
      lines: [{ m: key, b: y1 - key * x1 }], pts: [{ x: x1, y: y1, l: 'A' }, { x: x2, y: y2, l: 'B' }],
      label: 'Line through A ' + C.pt(x1, y1) + ' and B ' + C.pt(x2, y2) + '; each x square is ' + sx + ', each y square is ' + sy });
    return {
      stem: 'What is the slope of the line through A and B? Read the numbers on the axes.',
      fig: fig,
      think: 'What is each square worth on each axis?',
      parts: [{ kind: 'num', label: 'Slope', key: key, wrong: [{ v: sq, tag: 'M5' }, { v: rec, tag: 'M1' }] }],
      answer: f(key),
      work: ['Each square is ' + sx + ' on the x-axis and ' + sy + ' on the y-axis.', 'A = ' + C.pt(x1, y1) + ', B = ' + C.pt(x2, y2) + '.', 'Slope = ' + f(dY) + ' ÷ ' + f(dX) + ' = <b>' + f(key) + '</b>'],
      why: {
        M5: 'You counted squares: ' + f(j2 - j1) + ' up and ' + (i2 - i1) + ' across. But each square is ' + sx + ' on x and ' + sy + ' on y.',
        M1: 'You put the change in x (' + f(dX) + ') on top and the change in y (' + f(dY) + ') on the bottom.'
      },
      steps: [
        { label: 'Each square on the x-axis is worth', part: { kind: 'num', key: sx }, hint: 'Read the numbers along the bottom.' },
        { label: 'Each square on the y-axis is worth', part: { kind: 'num', key: sy }, hint: 'Read the numbers up the side.' },
        { label: 'A = ' + C.pt(x1, y1) + ' and B = ' + C.pt(x2, y2) + '. Change in y from A to B =', part: { kind: 'num', key: dY }, hint: f(y2) + ' − ' + f(y1) + '.' },
        { label: 'Slope = ' + f(dY) + ' ÷ ' + f(dX) + ' =', part: { kind: 'num', key: key }, hint: 'Change in y divided by change in x, using the axis numbers.' }
      ]
    };
  } });

  // the plan's fill-the-table interactive: the student types the missing y-values (no dragging in Version 1)
  C.add({ id: 'RC-4j', skill: '9', level: 4, order: 3, type: 'interactive', gen: function (R) {
    var x0 = R.nz(-5, 5), m = R.nz(-5, 5), y0 = R.int(-8, 12);
    var xs = [x0, x0 + 1, x0 + 3, x0 + 4], ys = xs.map(function (x) { return y0 + m * (x - x0); });
    return {
      stem: 'Fill in the missing y-values so the table has a constant rate of change of ' + f(m) + '.',
      fig: C.table({ cols: ['x', 'y'], rows: [[xs[0], ys[0]], [xs[1], BLANK], [xs[2], BLANK], [xs[3], BLANK]] }),
      think: 'Check how far x moves between rows.',
      parts: [1, 2, 3].map(function (i) {
        var w = [{ v: y0 - m * (xs[i] - x0), tag: 'M2' }];
        if (i > 1) w.unshift({ v: y0 + m * i, tag: 'M8' });
        return { kind: 'num', label: 'y when x = ' + f(xs[i]), key: ys[i], wrong: w };
      }),
      answer: ys.slice(1).map(f).join(', '),
      work: ['For every 1 more x, y changes by ' + f(m) + '.', 'From x = ' + f(xs[1]) + ' to ' + f(xs[2]) + ' is 2 steps, so y changes by 2 × ' + par(m) + ' = ' + f(2 * m) + '.', 'y: ' + ys.map(f).join(' → ') + ', so the missing values are <b>' + ys.slice(1).map(f).join(', ') + '</b>'],
      why: { M8: 'You changed y by ' + f(m) + ' every row, but x jumps by 2 between the second and third rows.', M2: 'You moved y the wrong way: a rate of ' + f(m) + ' means y ' + (m > 0 ? 'goes up' : 'goes down') + ' as x goes up.' },
      steps: [
        { label: 'From x = ' + f(xs[0]) + ' to ' + f(xs[1]) + ' is 1 step. y = ' + f(ys[0]) + ' ' + C.term(m) + ' =', part: { kind: 'num', key: ys[1] }, hint: 'Add the rate once.' },
        { label: 'From x = ' + f(xs[1]) + ' to ' + f(xs[2]) + ', x goes up by', part: { kind: 'num', key: 2 }, hint: f(xs[2]) + ' − ' + par(xs[1]) + '.' },
        { label: 'So y changes by 2 × ' + par(m) + ' =', part: { kind: 'num', key: 2 * m }, hint: 'Two steps of ' + f(m) + '.' },
        { label: 'y when x = ' + f(xs[2]) + ' is', part: { kind: 'num', key: ys[2] }, hint: f(ys[1]) + ' ' + C.term(2 * m) + '.' }
      ]
    };
  } });

  C.add({ id: 'RC-4g', skill: '9', level: 4, order: 4, type: 'NE', gen: function (R) {
    var x0 = R.nz(-4, 6), m = -R.int(2, 6), y0 = R.int(-5, 30);
    var xs = [x0, x0 + 2, x0 + 5, x0 + 6], ys = xs.map(function (x) { return y0 + m * (x - x0); });
    var m17 = Math.abs(6 * m) - 6;
    return {
      stem: 'What is the rate of change of y with respect to x in this table?',
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }) }),
      think: 'The x-values do not go up by the same amount each row.',
      parts: [{ kind: 'num', label: 'Rate of change', key: m, wrong: [{ v: 2 * m, tag: 'M8' }, { v: -m, tag: 'M2' }, { v: m17, tag: 'M17' }] }],
      answer: f(m) + ' (y goes down ' + Math.abs(m) + ' for every 1 more x)',
      work: ['Pick two rows: from x = ' + f(xs[0]) + ' to ' + f(xs[1]) + ', y goes from ' + f(ys[0]) + ' to ' + f(ys[1]) + '.', 'Change in y = ' + f(2 * m) + ', change in x = 2.', 'Rate = ' + f(2 * m) + ' ÷ 2 = <b>' + f(m) + '</b>: for every 1 more x, y goes down ' + Math.abs(m) + '.'],
      why: {
        M8: 'You used the change between the first two rows, ' + f(2 * m) + ', but x went up by 2 there, not 1.',
        M2: 'y goes down as x goes up, so the rate is negative.',
        M17: 'You subtracted the changes (' + Math.abs(6 * m) + ' − 6). Divide them instead.'
      },
      steps: [
        { label: 'First two rows: change in y = ' + f(ys[1]) + ' − ' + par(ys[0]) + ' =', part: { kind: 'num', key: 2 * m }, hint: 'End minus start. y went down, so it is negative.' },
        { label: 'Change in x = ' + f(xs[1]) + ' − ' + par(xs[0]) + ' =', part: { kind: 'num', key: 2 }, hint: 'End minus start.' },
        { label: 'Rate = ' + f(2 * m) + ' ÷ 2 =', part: { kind: 'num', key: m }, hint: 'Change in y divided by change in x.' }
      ]
    };
  } });

  C.add({ id: 'RC-4h', skill: '9', level: 5, type: 'CM', gen: function (R) {
    var s = R.pick([1, 2]), m = R.nz(-5, 5), x0 = R.int(-3, 4), y0 = R.int(-6, 15);
    var xs = [0, 1, 2, 3].map(function (i) { return x0 + s * i; }), ys = xs.map(function (x) { return y0 + m * (x - x0); });
    var dyA = ys[3] - ys[0], dxA = xs[3] - xs[0], dyB = ys[2] - ys[1], dxB = xs[2] - xs[1];
    var stem = 'Two students find the rate of change from the same table.' +
      '<p><b>Student A</b> (first and last rows): (' + f(ys[3]) + ' − ' + par(ys[0]) + ') ÷ (' + f(xs[3]) + ' − ' + par(xs[0]) + ') = ' + f(dyA) + ' ÷ ' + dxA + ' = ' + f(m) + '</p>' +
      '<p><b>Student B</b> (rows 2 and 3): (' + f(ys[2]) + ' − ' + par(ys[1]) + ') ÷ (' + f(xs[2]) + ' − ' + par(xs[1]) + ') = ' + f(dyB) + ' ÷ ' + dxB + ' = ' + f(m) + '</p>';
    return {
      stem: stem,
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }) }),
      parts: [
        { kind: 'choice', label: 'Which is true?', opts: [
          { t: 'Both methods work, because the rate is the same between any two rows', ok: true },
          { t: 'Only Student A is right', tag: 'M8' },
          { t: 'Only Student B is right', tag: 'M8' },
          { t: 'They got the same answer by luck', tag: 'M7' }] },
        { kind: 'choice', label: 'If the y-value in row 2 had a typo, whose method would still give the right rate?', keep: true, opts: [
          { t: 'Student A (first and last rows)', ok: true },
          { t: 'Student B (rows 2 and 3)', tag: 'G' },
          { t: 'Neither', tag: 'G' }] }
      ],
      answer: 'Both methods work; Student A\'s method still works if row 2 has a typo',
      work: ['In a linear table the rate is the same between any two rows.', 'A: ' + f(dyA) + ' ÷ ' + dxA + ' = ' + f(m) + '; B: ' + f(dyB) + ' ÷ ' + dxB + ' = ' + f(m) + '. <b>Both work.</b>', 'Student A never uses row 2, so <b>A\'s method</b> is not affected by a typo there.'],
      why: { M8: 'Any two rows give the same rate in a linear table, as long as you divide the change in y by the change in x.', M7: 'It is not luck: the rate is constant, so every pair of rows gives ' + f(m) + '.' },
      steps: [
        { label: 'Student A: change in y = ' + f(ys[3]) + ' − ' + par(ys[0]) + ' =', part: { kind: 'num', key: dyA }, hint: 'Last minus first.' },
        { label: 'Change in x = ' + f(xs[3]) + ' − ' + par(xs[0]) + ' =', part: { kind: 'num', key: dxA }, hint: 'Last minus first.' },
        { label: 'Rate = ' + f(dyA) + ' ÷ ' + dxA + ' =', part: { kind: 'num', key: m }, hint: 'Divide. Student B got ' + f(m) + ' too.' },
        { label: 'So do both methods work?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: true }, { t: 'No' }] }, hint: 'A linear table has the same rate between any two rows.' }
      ]
    };
  } });

  /* ---------------- 10 Initial value ---------------- */
  C.add({ id: 'EQ-2a', skill: '10', level: 2, type: 'NE', gen: function (R) {
    var b, m; do { b = R.int(3, 20); m = R.int(1, 6); } while (b === m || b === m * 2);
    var hs = [0, 1, 2, 3].map(function (w) { return b + m * w; });
    return {
      stem: 'A plant is measured each week. How tall was it when it was planted (week 0)?',
      fig: C.table({ cols: ['Week', 'Height (cm)'], rows: hs.map(function (h, w) { return [w, h]; }) }),
      think: 'When it was planted, how many weeks had passed?',
      parts: [{ kind: 'num', label: 'Height (cm)', key: b, wrong: [{ v: m, tag: 'M9' }, { v: b + m, tag: 'G' }] }],
      answer: b + ' cm',
      work: ['"When planted" means week 0, the starting value.', 'The table shows <b>' + b + ' cm</b> at week 0.', 'The ' + m + ' cm is how much it grows each week.'],
      why: { M9: 'You found how much it grows each week (' + m + ' cm). The question asks for the height at the start, week 0.' },
      steps: [
        { label: 'When it was planted, which week was it?', part: { kind: 'num', key: 0 }, hint: 'No weeks had passed yet.' },
        { label: 'Height at week 0 (cm) =', part: { kind: 'num', key: b }, hint: 'Read the row where week is 0.' }
      ]
    };
  } });

  C.add({ id: 'EQ-3a', skill: '10', level: 3, order: 1, type: 'NE', gen: function (R) {
    var m, b, xi;
    do { m = R.nz(-4, 4); b = R.nz(-8, 8); xi = -b / m; } while (b % m !== 0 || xi === b || m === b || Math.abs(xi) > 9);
    var fig = C.graph({ x: [-10, 10], y: [-10, 10], lines: [{ m: m, b: b }], pts: [{ x: 0, y: b, r: 4 }, { x: xi, y: 0, r: 4 }], label: 'Line crossing the y-axis at ' + f(b) + ' and the x-axis at ' + f(xi) });
    return {
      stem: 'What is the y-intercept of this line?',
      fig: fig,
      think: 'Which axis is the y-axis?',
      parts: [{ kind: 'num', label: 'y-intercept', key: b, wrong: [{ v: xi, tag: 'M3' }, { v: m, tag: 'M9' }] }],
      answer: f(b) + ', the point ' + C.pt(0, b),
      work: ['The y-intercept is where the line crosses the y-axis (the up-and-down axis), where x = 0.', 'The line crosses it at ' + C.pt(0, b) + '.', 'So the y-intercept is <b>' + f(b) + '</b>.'],
      why: { M3: 'You read where the line crosses the x-axis, at ' + f(xi) + '. The y-intercept is on the y-axis.', M9: 'You found the slope, ' + f(m) + '. The y-intercept is a value, where x = 0.' },
      steps: [
        { label: 'At the y-intercept, x =', part: { kind: 'num', key: 0 }, hint: 'Every point on the y-axis has x = 0.' },
        { label: 'Where x = 0, the line is at y =', part: { kind: 'num', key: b }, hint: 'Follow the up-and-down axis to where the line crosses it.' }
      ]
    };
  } });

  // the plan's drag-the-starting-point interactive: the student picks the right point from 4 drawn (no dragging in Version 1)
  C.add({ id: 'EQ-2c', skill: '10', level: 3, order: 2, type: 'interactive', gen: function (R) {
    var b, m; do { b = R.int(3, 10); m = R.int(2, 5); } while (Math.abs(b - m) < 2);
    var cands = R.shuffle([{ x: 0, y: b, ok: true }, { x: 0, y: m, tag: 'M9' }, { x: b, y: 0, tag: 'M3' }, { x: 0, y: b + m, tag: 'M14' }]);
    var L = ['A', 'B', 'C', 'D'], right;
    cands.forEach(function (c, i) { c.l = L[i]; if (c.ok) right = L[i]; });
    var yMax = b + m + 3;
    var fig = C.graph({ x: [0, 12], y: [0, yMax], ly: yMax > 12 ? 2 : 1, xl: 'Distance (km)', yl: 'Fare (riyals)', pts: cands.map(function (c) { return { x: c.x, y: c.y, l: c.l, r: 4 }; }), label: 'Four points A to D on a fare-against-distance grid' });
    var opts = cands.map(function (c) { var o = { t: 'Point ' + c.l + ' ' + C.pt(c.x, c.y) }; if (c.ok) o.ok = true; else o.tag = c.tag; return o; });
    return {
      stem: 'A taxi charges a ' + b + '-riyal starting fee plus ' + m + ' riyals per km. Which point shows where the fare line starts?',
      fig: fig,
      think: 'What do you pay before you travel any distance?',
      parts: [{ kind: 'choice', label: 'The line starts at', keep: true, opts: opts }],
      answer: 'Point ' + right + ' ' + C.pt(0, b),
      work: ['At the start you have travelled 0 km, so the point is on the fare axis (x = 0).', 'At 0 km you pay only the starting fee, ' + b + ' riyals.', 'So the line starts at <b>' + C.pt(0, b) + '</b>, point ' + right + '.'],
      why: { M9: 'That point is at ' + m + ' riyals, the cost per km. The start is the fee before you travel: ' + b + ' riyals.', M3: 'That point is on the distance axis. The start is at 0 km, on the fare axis.', M14: 'That adds the fee and one km (' + b + ' + ' + m + '). At the start you have not travelled yet.' },
      steps: [
        { label: 'At the start, how many km have you travelled?', part: { kind: 'num', key: 0 }, hint: 'You have not moved yet.' },
        { label: 'At 0 km, what is the fare in riyals?', part: { kind: 'num', key: b }, hint: 'Only the starting fee.' },
        { label: 'So the line starts at the point', part: { kind: 'choice', keep: true, opts: cands.map(function (c) { return { t: 'Point ' + c.l, ok: !!c.ok }; }) }, hint: 'Find the point at ' + C.pt(0, b) + '.' }
      ]
    };
  } });

  C.add({ id: 'EQ-2b', skill: '10', level: 3, order: 3, type: 'MC', gen: function (R) {
    var b, m; do { b = R.int(2, 9); m = R.int(1, 3); } while (b === m);
    var fig = C.graph({ x: [0, 8], y: [0, 20], ly: 2, xl: 'Distance (km)', yl: 'Fare (riyals)', lines: [{ m: m, b: b, from: 0 }], pts: [{ x: 0, y: b, l: C.pt(0, b) }], label: 'Taxi fare line starting at (0, ' + b + ')' });
    return {
      stem: 'The graph shows a taxi fare (riyals) against distance (km). The line starts at ' + C.pt(0, b) + '. What does the ' + b + ' mean?',
      fig: fig,
      think: 'At x = 0, how far have you gone?',
      parts: [{ kind: 'choice', label: 'The ' + b + ' is', opts: [
        { t: 'The fare before you travel', ok: true },
        { t: 'The cost per km', tag: 'M9' },
        { t: 'The distance travelled', tag: 'G' },
        { t: 'Where the fare reaches zero', tag: 'M3' }] }],
      answer: 'The fare before you travel: ' + b + ' riyals',
      work: ['The point ' + C.pt(0, b) + ' is at 0 km.', 'At 0 km you have travelled nothing, so <b>' + b + ' riyals is what you pay just to start</b>.', 'The cost per km is how much the fare goes up for every 1 more km: ' + m + ' riyals.'],
      why: { M9: 'The cost per km is the rate, ' + m + ' riyals for every 1 more km. The ' + b + ' is the value at 0 km.', M3: 'The fare never reaches zero on this graph. ' + b + ' is the fare at 0 km.' },
      steps: [
        { label: 'At the point ' + C.pt(0, b) + ', how many km have you travelled?', part: { kind: 'num', key: 0 }, hint: 'The first number is the distance.' },
        { label: 'What is the fare there, in riyals?', part: { kind: 'num', key: b }, hint: 'The second number is the fare.' },
        { label: 'So ' + b + ' riyals is', part: { kind: 'choice', keep: true, opts: [{ t: 'the fare before you travel', ok: true }, { t: 'the cost per km' }] }, hint: 'You pay it at 0 km.' }
      ]
    };
  } });

  C.add({ id: 'EQ-3d', skill: '10', level: 4, type: 'TT', gen: function (R) {
    var a, b, m;
    do { a = R.nz(-8, 8); b = R.nz(-8, 8); m = -b / a; } while (a === b || Math.abs(m) < 0.25 || Math.abs(m) > 4 || !okFrac(m) || C.near(m, a) || C.near(m, b));
    var fig = C.graph({ x: [-10, 10], y: [-10, 10], lines: [{ m: m, b: b }], pts: [{ x: 0, y: b, r: 4 }, { x: a, y: 0, r: 4 }], label: 'Line crossing the y-axis at ' + f(b) + ' and the x-axis at ' + f(a) });
    return {
      stem: 'This graph shows a linear function. What is its initial value, and why?',
      fig: fig,
      parts: [
        { kind: 'choice', label: 'The initial value is', opts: [{ t: f(b), ok: true }, { t: f(a), tag: 'M3' }, { t: f(m), tag: 'M9' }] },
        { kind: 'choice', label: 'Because', opts: [
          { t: 'It is the y-value when x = 0', ok: true },
          { t: 'It is where the line starts on the left', tag: 'M10' },
          { t: 'It is where the line crosses the x-axis', tag: 'M3' }] }
      ],
      answer: f(b) + ', because it is the y-value when x = 0',
      work: ['Initial value means the output when the input is 0.', 'On this graph x = 0 is the y-axis.', 'The line crosses the y-axis at ' + C.pt(0, b) + ', so the initial value is <b>' + f(b) + '</b>.'],
      why: { M3: 'You used where the line crosses the x-axis (' + f(a) + '). The initial value is where x = 0, on the y-axis.', M9: 'You picked the slope, ' + f(m) + '. The initial value is the output at x = 0.', M10: 'The line has no start on the left; it keeps going. The initial value is at x = 0.' },
      steps: [
        { label: 'The initial value is the output when x =', part: { kind: 'num', key: 0 }, hint: 'Initial means at the start, input 0.' },
        { label: 'When x = 0, the line is at y =', part: { kind: 'num', key: b }, hint: 'Look where the line crosses the y-axis.' },
        { label: 'So the reason is', part: { kind: 'choice', keep: true, opts: [{ t: 'It is the y-value when x = 0', ok: true }, { t: 'It is where the line crosses the x-axis' }] }, hint: 'x = 0 is the y-axis.' }
      ]
    };
  } });
})();
