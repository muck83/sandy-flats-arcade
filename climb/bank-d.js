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
      stem: 'What is the rate of change (the step) in this table: how much does y change for every 1 more x?',
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
      stem: 'What is the slope (the step) of the line through A and B? Read the numbers on the axes.',
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

  // the plan's fill-the-table item, kept as a typed build (not ia): the student types the missing y-values
  C.add({ id: 'RC-4j', skill: '9', level: 4, order: 3, type: 'EG', gen: function (R) {
    var x0 = R.nz(-5, 5), m = R.nz(-5, 5), y0 = R.int(-8, 12);
    var xs = [x0, x0 + 1, x0 + 3, x0 + 4], ys = xs.map(function (x) { return y0 + m * (x - x0); });
    return {
      stem: 'Fill in the missing y-values so the table has the same rate of change (the step) of ' + f(m) + ' all the way.',
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
        { label: 'From x = ' + f(xs[1]) + ' to ' + f(xs[2]) + ', x goes up by 2, so y changes by 2 × ' + par(m) + ' =', part: { kind: 'num', key: 2 * m }, hint: 'Two steps of ' + f(m) + '.' },
        { label: 'y when x = ' + f(xs[2]) + ': ' + f(ys[1]) + ' ' + C.term(2 * m) + ' =', part: { kind: 'num', key: ys[2] }, hint: 'Add the change you just found.' },
        { label: 'y when x = ' + f(xs[3]) + ' (1 step on): ' + f(ys[2]) + ' ' + C.term(m) + ' =', part: { kind: 'num', key: ys[3] }, hint: 'Add the rate once.' }
      ]
    };
  } });

  C.add({ id: 'RC-4g', skill: '9', level: 4, order: 4, type: 'NE', gen: function (R) {
    var x0 = R.nz(-4, 6), m = R.sign() * R.int(2, 6), y0 = m < 0 ? R.int(-5, 30) : R.int(-30, 5);
    var xs = [x0, x0 + 2, x0 + 5, x0 + 6], ys = xs.map(function (x) { return y0 + m * (x - x0); });
    var dir = m < 0 ? 'down' : 'up';
    return {
      stem: 'What is the rate of change (the step) in this table: how much does y change for every 1 more x?',
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }) }),
      think: 'The x-values do not go up by the same amount each row.',
      parts: [{ kind: 'num', label: 'Rate of change', key: m, wrong: [{ v: 2 * m, tag: 'M8' }, { v: 3 * m, tag: 'M8' }, { v: -m, tag: 'M2' }, { v: 1 / m, tag: 'M1' }] }],
      answer: f(m) + ' (y goes ' + dir + ' ' + Math.abs(m) + ' for every 1 more x)',
      work: ['Pick two rows: from x = ' + f(xs[0]) + ' to ' + f(xs[1]) + ', y goes from ' + f(ys[0]) + ' to ' + f(ys[1]) + '.', 'Change in y = ' + f(2 * m) + ', change in x = 2.', 'Rate = ' + f(2 * m) + ' ÷ 2 = <b>' + f(m) + '</b>: for every 1 more x, y goes ' + dir + ' ' + Math.abs(m) + '.'],
      why: {
        M8: 'You used the change in y between two rows without dividing by the change in x. From x = ' + f(xs[0]) + ' to ' + f(xs[1]) + ', x goes up by 2, so the rate is ' + f(2 * m) + ' ÷ 2 = ' + f(m) + '.',
        M2: 'y goes ' + dir + ' as x goes up, so the rate is ' + (m < 0 ? 'negative' : 'positive') + '.',
        M1: 'You put the change in x on top. The rate is the change in y ÷ the change in x: ' + f(2 * m) + ' ÷ 2.'
      },
      steps: [
        { label: 'First two rows: change in y = ' + f(ys[1]) + ' − ' + par(ys[0]) + ' =', part: { kind: 'num', key: 2 * m }, hint: 'End minus start.' + (m < 0 ? ' y went down, so it is negative.' : '') },
        { label: 'Change in x = ' + f(xs[1]) + ' − ' + par(xs[0]) + ' =', part: { kind: 'num', key: 2 }, hint: 'End minus start.' },
        { label: 'Rate = ' + f(2 * m) + ' ÷ 2 =', part: { kind: 'num', key: m }, hint: 'Change in y divided by change in x.' }
      ]
    };
  } });

  C.add({ id: 'RC-4h', skill: '9', level: 5, type: 'CM', gen: function (R) {
    // which statement is true is random: both right, or one student forgets to divide by the change in x (M8)
    var bad = R.pick(['none', 'A', 'B']), s = bad === 'B' ? 2 : R.pick([1, 2]), m = R.nz(-5, 5), x0 = R.int(-3, 4), y0 = R.int(-6, 15);
    var xs = [0, 1, 2, 3].map(function (i) { return x0 + s * i; }), ys = xs.map(function (x) { return y0 + m * (x - x0); });
    var S = { A: { name: 'Student A', rows: 'first and last rows', i: 0, j: 3 }, B: { name: 'Student B', rows: 'rows 2 and 3', i: 1, j: 2 } };
    ['A', 'B'].forEach(function (k) { var o = S[k]; o.dy = ys[o.j] - ys[o.i]; o.dx = xs[o.j] - xs[o.i]; o.got = k === bad ? o.dy : m; });
    function line(k) {
      var o = S[k], ch = '(' + f(ys[o.j]) + ' − ' + par(ys[o.i]) + ')';
      return '<p style="margin:6px 0"><b>' + o.name + '</b> (' + o.rows + '): ' + (k === bad ? ch + ' = ' + f(o.dy) + ', so the rate is ' + f(o.dy) : ch + ' ÷ (' + f(xs[o.j]) + ' − ' + par(xs[o.i]) + ') = ' + f(o.dy) + ' ÷ ' + o.dx + ' = ' + f(m)) + '</p>';
    }
    var key = bad === 'none' ? 0 : bad === 'A' ? 2 : 1;
    var opts = ['Both are right: the rate is the same between any two rows', 'Only Student A is right', 'Only Student B is right', 'Neither is right'].map(function (t, i) { var o = { t: t }; if (i === key) o.ok = true; else o.tag = i === 3 ? 'G' : 'M8'; return o; });
    var B = bad === 'none' ? null : S[bad];
    var verdict = bad === 'none' ? 'Both are right' : 'Only ' + S[bad === 'A' ? 'B' : 'A'].name + ' is right';
    return {
      stem: 'Two students find the rate of change (the step) from this table. Which is true?',
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }) }) + line('A') + line('B'),
      parts: [
        { kind: 'choice', label: 'Which is true?', keep: true, opts: opts },
        { kind: 'choice', label: 'What must a right method do?', opts: [
          { t: 'Divide the change in y by the change in x', ok: true },
          { t: 'Use the first and last rows', tag: 'G' },
          { t: 'Divide the last y by the last x', tag: 'M4' }] }
      ],
      answer: verdict + '; a right method divides the change in y by the change in x',
      work: ['Rate = change in y ÷ change in x, between any two rows of a linear table.', 'First and last rows: ' + f(S.A.dy) + ' ÷ ' + S.A.dx + ' = ' + f(m) + '. Rows 2 and 3: ' + f(S.B.dy) + ' ÷ ' + S.B.dx + ' = ' + f(m) + '.', bad === 'none' ? 'Both students divided the changes, so <b>both are right</b>.' : B.name + ' did not divide by the change in x (' + B.dx + '). <b>' + verdict + '</b>.'],
      why: { M8: bad === 'none' ? 'Any two rows give the same rate in a linear table, as long as you divide the change in y by the change in x. Both students did.' : B.name + ' found the change in y (' + f(B.dy) + ') but did not divide by the change in x (' + B.dx + '). The rate is ' + f(B.dy) + ' ÷ ' + B.dx + ' = ' + f(m) + '.', M4: 'Dividing one y by one x only works for a line through (0, 0). Divide the changes.' },
      steps: [
        { label: 'First and last rows: change in y = ' + f(ys[3]) + ' − ' + par(ys[0]) + ' =', part: { kind: 'num', key: S.A.dy }, hint: 'Last minus first.' },
        { label: 'Change in x = ' + f(xs[3]) + ' − ' + par(xs[0]) + ' =', part: { kind: 'num', key: S.A.dx }, hint: 'Last minus first.' },
        { label: 'Rate = ' + f(S.A.dy) + ' ÷ ' + S.A.dx + ' =', part: { kind: 'num', key: m }, hint: 'Divide the change in y by the change in x.' },
        { label: 'Student A got ' + f(S.A.got) + ' and Student B got ' + f(S.B.got) + '. Which is true?', part: { kind: 'choice', keep: true, opts: opts.map(function (o) { return { t: o.t, ok: !!o.ok }; }) }, hint: 'The right rate is ' + f(m) + '.' }
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
      stem: 'What is the y-intercept (the start) of this line?',
      fig: fig,
      think: 'Which axis is the y-axis?',
      parts: [{ kind: 'num', label: 'y-intercept', key: b, wrong: [{ v: xi, tag: 'M3' }, { v: m, tag: 'M9' }] }],
      answer: f(b) + ', the point ' + C.pt(0, b),
      work: ['The y-intercept (the start) is where the line crosses the up axis (y-axis), where x = 0.', 'The line crosses it at ' + C.pt(0, b) + '.', 'So the y-intercept is <b>' + f(b) + '</b>.'],
      why: { M3: 'You read where the line crosses the x-axis, at ' + f(xi) + '. The y-intercept is on the y-axis.', M9: 'You found the slope, ' + f(m) + '. The y-intercept is a value, where x = 0.' },
      steps: [
        { label: 'At the y-intercept, x =', part: { kind: 'num', key: 0 }, hint: 'Every point on the y-axis has x = 0.' },
        { label: 'Where x = 0, the line is at y =', part: { kind: 'num', key: b }, hint: 'Follow the up axis (y-axis) to where the line crosses it.' }
      ]
    };
  } });

  C.add({ id: 'EQ-2c', skill: '10', level: 3, order: 2, type: 'interactive', ia: true, gen: function (R) {
    // bike rental: the student works out the starting fee from one marked rental, then drags the line's start
    var b, m, h, tot, rd;
    do { b = R.int(3, 10); m = R.int(2, 5); h = R.int(2, 4); rd = m * h; tot = b + rd; }
    while (Math.abs(b - m) < 2 || Math.abs(b - rd) < 2 || tot % h === 0 && Math.abs(tot / h - b) < 2);
    var yMax = tot + 3;
    var g = { x: [0, 10], y: [0, yMax], ly: yMax > 12 ? 2 : 1, size: 400, xl: 'Time (hours)', yl: 'Cost (riyals)', pts: [{ x: h, y: tot, l: C.pt(h, tot), c: C.COL.line }], label: 'Bike rental cost against time, with the point ' + C.pt(h, tot) + ' marked' };
    var wrong = [{ v: [[0, m]], tag: 'M9' }, { v: [[0, rd]], tag: 'M14' }, { v: [[0, 0]], tag: 'M16' }, { v: [[0, tot]], tag: 'G' }];
    if (tot % h === 0) wrong.push({ v: [[0, tot / h]], tag: 'M16' });
    wrong = wrong.filter(function (w, i) { var y = w.v[0][1]; return y !== b && !wrong.slice(0, i).some(function (o) { return o.v[0][1] === y; }); });
    return {
      stem: 'A bike rental costs a starting fee plus ' + m + ' riyals per hour. A ' + h + '-hour rental costs ' + tot + ' riyals (the marked point). Drag the start of the cost line to the right place on the up axis (y-axis).',
      think: 'How much of the ' + tot + ' riyals is for the ' + h + ' hours of riding?',
      parts: [{ kind: 'points', label: 'Starting point', grid: g, start: [[0, 0]], names: ['Start'], lock: 'x',
        extra: function (cur) { return [{ m: m, b: cur[0][1], from: 0 }]; },
        key: [[0, b]], wrong: wrong }],
      answerFig: C.graph(Object.assign({}, g, { size: 260, lines: [{ m: m, b: b, from: 0 }], pts: [{ x: 0, y: b, l: C.pt(0, b) }, { x: h, y: tot, c: C.COL.line }] })),
      answer: 'The line starts at ' + C.pt(0, b) + ': ' + C.an(b) + ' ' + b + '-riyal starting fee',
      work: [h + ' hours of riding cost ' + h + ' × ' + m + ' = ' + rd + ' riyals.', 'The starting fee (the start) is the rest: ' + tot + ' − ' + rd + ' = ' + b + ' riyals. That is the cost at 0 hours.', 'So the line starts at <b>' + C.pt(0, b) + '</b> on the up axis (y-axis).'],
      why: {
        M9: 'Your point is at ' + m + ' riyals, the cost per hour (the step). The start is the fee at 0 hours: ' + tot + ' − ' + rd + ' = ' + b + ' riyals.',
        M14: 'Your point is at ' + rd + ' riyals, the cost of ' + h + ' hours of riding (' + h + ' × ' + m + '). The start is what is left: ' + tot + ' − ' + rd + ' = ' + b + ' riyals.',
        M16: 'The cost does not start at 0, so it is not ' + h + ' equal shares: ' + tot + ' riyals includes a starting fee. Take away the riding, ' + h + ' × ' + m + ' = ' + rd + ', to get ' + b + ' riyals.',
        G: tot + ' riyals is the cost after ' + h + ' hours, not at 0 hours. Take away the riding: ' + tot + ' − ' + rd + ' = ' + b + ' riyals.'
      },
      steps: [
        { label: 'Cost of ' + h + ' hours of riding: ' + h + ' × ' + m + ' =', part: { kind: 'num', key: rd }, hint: m + ' riyals for each hour.' },
        { label: 'Starting fee: ' + tot + ' − ' + rd + ' =', part: { kind: 'num', key: b }, hint: 'The total minus the riding.' },
        { label: 'So the line starts at the point', part: { kind: 'choice', keep: true, opts: [{ t: C.pt(0, b), ok: true }, { t: C.pt(0, m) }, { t: C.pt(b, 0) }] }, hint: 'x is the time (0 hours), y is the cost.' }
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
        { t: 'The fare for a 1 km ride', tag: 'M14' }] }],
      answer: 'The fare before you travel: ' + b + ' riyals',
      work: ['The point ' + C.pt(0, b) + ' is at 0 km.', 'At 0 km you have travelled nothing, so <b>' + b + ' riyals is what you pay just to start</b>.', 'The cost per km is how much the fare goes up for every 1 more km: ' + m + ' riyals.'],
      why: { M9: 'The cost per km is the rate, ' + m + ' riyals for every 1 more km. The ' + b + ' is the value at 0 km.', M14: 'A 1 km ride costs ' + b + ' + ' + m + ' = ' + (b + m) + ' riyals: the start plus one step. The ' + b + ' is the fare at 0 km.' },
      steps: [
        { label: 'At the point ' + C.pt(0, b) + ', how many km have you travelled?', part: { kind: 'num', key: 0 }, hint: 'The first number is the distance.' },
        { label: 'What is the fare there, in riyals?', part: { kind: 'num', key: b }, hint: 'The second number is the fare.' },
        { label: 'So ' + b + ' riyals is', part: { kind: 'choice', keep: true, opts: [{ t: 'the fare before you travel', ok: true }, { t: 'the cost per km' }] }, hint: 'You pay it at 0 km.' }
      ]
    };
  } });

  C.add({ id: 'EQ-3d', skill: '10', level: 4, type: 'TT', gen: function (R) {
    // a table with no x = 0 row (EQ-3a reads the start off a graph): work back from the first row
    var m, b, x0, s, xs, ys, vals;
    do {
      m = R.nz(-4, 4); b = R.nz(-8, 8); x0 = R.int(1, 3); s = R.pick([1, 2]);
      xs = [0, 1, 2, 3].map(function (i) { return x0 + s * i; }); ys = xs.map(function (x) { return b + m * x; });
      vals = [f(b), f(ys[0]), f(m)].concat(s === 2 ? [f(ys[0] - m * s)] : []);
    } while (Math.abs(ys[3]) > 30 || vals.some(function (v, i) { return vals.indexOf(v) !== i; }));
    var opts = [{ t: f(b), ok: true }, { t: f(ys[0]), tag: 'M10' }, { t: f(m), tag: 'M9' }];
    if (s === 2) opts.push({ t: f(ys[0] - m * s), tag: 'M8' });
    return {
      stem: 'This table shows a linear function. What is its initial value (the start), and why?',
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }) }),
      parts: [
        { kind: 'choice', label: 'The initial value is', opts: opts },
        { kind: 'choice', label: 'Because', opts: [
          { t: 'It is the y-value when x = 0', ok: true },
          { t: 'It is the y-value in the first row', tag: 'M10' },
          { t: 'It is the change in y for every 1 more x', tag: 'M9' },
          { t: 'It is the x-value where y = 0', tag: 'M3' }] }
      ],
      answer: f(b) + ', because it is the y-value when x = 0',
      work: [
        'Rate: each row x goes up by ' + s + ' and y changes by ' + f(m * s) + ', so for every 1 more x, y changes by ' + f(m) + '.',
        'Initial value means the y-value when x = 0. The table starts at x = ' + x0 + ', so go back ' + C.pl(x0, 'step') + ' of 1.',
        'y at x = 0: ' + f(ys[0]) + ' − ' + x0 + ' × ' + par(m) + ' = <b>' + f(b) + '</b>.'
      ],
      why: {
        M10: 'The first row is at x = ' + x0 + ', not x = 0. Go back ' + x0 + ' from there: ' + f(ys[0]) + ' − ' + x0 + ' × ' + par(m) + ' = ' + f(b) + '.',
        M9: 'You picked the rate of change (the step), ' + f(m) + '. The initial value is the y-value at x = 0.',
        M8: 'You went back one row, but x goes up by 2 each row, so that only reaches x = ' + f(x0 - 2) + '. You need x = 0: ' + f(ys[0]) + ' − ' + x0 + ' × ' + par(m) + ' = ' + f(b) + '.',
        M3: 'The initial value is a y-value, at x = 0, not where y = 0.'
      },
      steps: [
        { label: 'For every 1 more x, y changes by', part: { kind: 'num', key: m }, hint: f(ys[1]) + ' − ' + par(ys[0]) + (s === 2 ? ', then divide by 2 (x goes up by 2).' : '.') },
        { label: 'The initial value is the y-value when x =', part: { kind: 'num', key: 0 }, hint: 'Initial means at the start, input 0.' },
        { label: 'Go back ' + x0 + ' from x = ' + x0 + ': ' + f(ys[0]) + ' − ' + x0 + ' × ' + par(m) + ' =', part: { kind: 'num', key: b }, hint: 'Take away ' + x0 + ' steps of ' + f(m) + '.' },
        { label: 'So the reason is', part: { kind: 'choice', keep: true, opts: [{ t: 'It is the y-value when x = 0', ok: true }, { t: 'It is the y-value in the first row' }] }, hint: 'Initial means x = 0.' }
      ]
    };
  } });
})();
