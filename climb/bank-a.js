/* Climb question bank: skill 1 (evaluate a rule), skill 2 (read values from a graph) and
   skill 3 (function or not: pairs and mappings).
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt, M = '−';
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 × (−2)
  // drop options whose shown text repeats an earlier one
  function uniq(opts) { var seen = {}; return opts.filter(function (o) { var t = C.strip(o.t); if (seen[t]) return false; seen[t] = 1; return true; }); }
  var LET = ['A', 'B', 'C', 'D'];

  /* ---------------- Skill 1 Evaluate a rule ---------------- */
  C.add({ id: 'FN-1a', skill: '1', level: 1, order: 1, type: 'NE', gen: function (R) {
    var k = R.int(2, 9), x = R.int(5, 12), key = x + k;
    return {
      stem: 'The table shows a rule: each input gives one output. What is the output when the input is ' + x + '?',
      fig: C.table({ cols: ['Input', 'Output'], rows: [[1, 1 + k], [2, 2 + k], [3, 3 + k], [4, 4 + k]] }),
      think: 'Compare each output with its input. What is added?',
      parts: [{ kind: 'num', label: 'Output', key: key, wrong: [{ v: x - k, tag: 'G' }, { v: k, tag: 'G' }] }],
      answer: 'The output is ' + key,
      work: ['Each output is ' + k + ' more than its input: 1 → ' + (1 + k) + ', 2 → ' + (2 + k) + '.', 'So the rule is output = input + ' + k + '.', x + ' + ' + k + ' = <b>' + key + '</b>'],
      why: { G: 'Each output is ' + k + ' MORE than its input, so add ' + k + ' to ' + x + ': ' + x + ' + ' + k + ' = ' + key + '.' },
      steps: [
        { label: 'Input 1 gives output ' + (1 + k) + '. How much is added to each input?', part: { kind: 'num', key: k }, hint: (1 + k) + ' − 1 = ?' },
        { label: 'So the output for input ' + x + ' is ' + x + ' + ' + k + ' =', part: { kind: 'num', key: key }, hint: 'Add ' + k + ' to the input.' }
      ]
    };
  } });

  C.add({ id: 'FN-1b', skill: '1', level: 1, order: 2, type: 'MC', gen: function (R) {
    var a, b, x, key, w1, w2, w3;
    do { a = R.int(2, 5); b = R.int(1, 9); x = R.int(2, 8); key = a * x + b; w1 = a * (x + b); w2 = x + a + b; w3 = a * b + x; }
    while (uniq([{ t: f(key) }, { t: f(w1) }, { t: f(w2) }, { t: f(w3) }]).length < 4);
    return {
      stem: 'A function machine multiplies by ' + a + ', then adds ' + b + '. The input is ' + x + '. What is the output?',
      think: 'Do the steps in order: multiply first, then add.',
      parts: [{ kind: 'choice', label: 'Output', opts: [{ t: f(key), ok: true }, { t: f(w1), tag: 'G' }, { t: f(w2), tag: 'M14' }, { t: f(w3), tag: 'M14' }] }],
      answer: 'The output is ' + key,
      work: ['Multiply first: ' + a + ' × ' + x + ' = ' + (a * x) + '.', 'Then add: ' + (a * x) + ' + ' + b + ' = <b>' + key + '</b>'],
      why: { G: 'You added ' + b + ' before multiplying: ' + a + ' × (' + x + ' + ' + b + ') = ' + w1 + '. The machine multiplies first.', M14: 'You combined the numbers without following the steps. Multiply ' + x + ' by ' + a + ', then add ' + b + '.' },
      steps: [
        { label: 'Step 1: ' + a + ' × ' + x + ' =', part: { kind: 'num', key: a * x }, hint: 'The machine multiplies the input by ' + a + ' first.' },
        { label: 'Step 2: ' + (a * x) + ' + ' + b + ' =', part: { kind: 'num', key: key }, hint: 'Now add ' + b + '.' }
      ]
    };
  } });

  C.add({ id: 'EQ-1a', skill: '1', level: 1, order: 3, type: 'NE', gen: function (R) {
    var m, b, x, key, mx;
    do { m = R.nz(-5, 5); b = R.nz(-9, 9); x = R.int(-4, 6); mx = m * x; key = mx + b; } while (m * (x + b) === key || m + x + b === key);
    return {
      stem: 'The rule is ' + C.eqText(m, b) + '. What is y when x = ' + f(x) + '?',
      think: 'Put ' + f(x) + ' in place of x, multiply, then add.',
      parts: [{ kind: 'num', label: 'y', key: key, wrong: [{ v: m * (x + b), tag: 'G' }, { v: mx - b, tag: 'M2' }, { v: m + x + b, tag: 'M14' }] }],
      answer: 'y = ' + f(key),
      work: ['Substitute x = ' + f(x) + ': y = ' + f(m) + ' × ' + par(x) + ' ' + C.term(b), '= ' + f(mx) + ' ' + C.term(b), '= <b>' + f(key) + '</b>'],
      why: { G: 'You added ' + f(b) + ' to x before multiplying. Multiply first: ' + f(m) + ' × ' + par(x) + ' = ' + f(mx) + ', then add ' + par(b) + '.', M2: 'Check the sign of ' + f(b) + ': the rule says ' + C.term(b) + ', so ' + f(mx) + ' ' + C.term(b) + ' = ' + f(key) + '.', M14: 'You added all the numbers. ' + f(m) + ' multiplies x: ' + f(m) + ' × ' + par(x) + ' = ' + f(mx) + '.' },
      steps: [
        { label: f(m) + ' × ' + par(x) + ' =', part: { kind: 'num', key: mx }, hint: 'A negative times a positive is negative.' },
        { label: f(mx) + ' ' + C.term(b) + ' =', part: { kind: 'num', key: key }, hint: 'Keep the sign of ' + f(b) + '.' }
      ]
    };
  } });

  // converted from the plan's interactive "drag the input tile": pick the right tile from 4
  C.add({ id: 'FN-1d', skill: '1', level: 2, order: 1, type: 'interactive', gen: function (R) {
    var a, b, key, y, opts;
    do {
      a = R.int(2, 6); b = R.int(1, 12); key = R.int(1, 9); y = a * key + b;
      opts = uniq([{ t: f(key), ok: true }, { t: f(y / a - b), tag: 'G' }, { t: f(y - b), tag: 'G' }, { t: f(y + b), tag: 'M2' }]);
    } while (opts.length < 4);
    return {
      stem: 'A function machine multiplies by ' + a + ', then adds ' + b + '. Which input tile makes the output ' + y + '?',
      think: 'Undo the steps backwards: undo the add first.',
      parts: [{ kind: 'choice', label: 'Input tile', opts: opts }],
      answer: 'The input is ' + key,
      work: ['Undo the last step first: ' + y + ' − ' + b + ' = ' + (y - b) + '.', 'Then undo the multiply: ' + (y - b) + ' ÷ ' + a + ' = <b>' + key + '</b>', 'Check: ' + a + ' × ' + key + ' + ' + b + ' = ' + y + '.'],
      why: { G: 'Undo the steps in reverse order and do both: subtract ' + b + ' first, then divide by ' + a + ': (' + y + ' − ' + b + ') ÷ ' + a + ' = ' + key + '.', M2: 'To undo "add ' + b + '", subtract ' + b + '. Adding it again goes the wrong way.' },
      steps: [
        { label: 'Undo "add ' + b + '": ' + y + ' − ' + b + ' =', part: { kind: 'num', key: y - b }, hint: 'The opposite of adding is subtracting.' },
        { label: 'Undo "multiply by ' + a + '": ' + (y - b) + ' ÷ ' + a + ' =', part: { kind: 'num', key: key }, hint: 'The opposite of multiplying is dividing.' }
      ]
    };
  } });

  C.add({ id: 'FN-1c', skill: '1', level: 2, order: 2, type: 'NE', gen: function (R) {
    var a, b, key, y;
    do { a = R.int(2, 6); b = R.int(1, 12); key = R.int(1, 9); y = a * key + b; } while (C.near(y / a - b, key));
    return {
      stem: 'A function machine multiplies by ' + a + ', then adds ' + b + '. The output was ' + y + '. What was the input?',
      think: 'Work backwards: undo the last step first.',
      parts: [{ kind: 'num', label: 'Input', key: key, wrong: [{ v: y / a - b, tag: 'G' }, { v: y * a + b, tag: 'M14' }, { v: y - b, tag: 'G' }] }],
      answer: 'The input was ' + key,
      work: ['Undo the steps in reverse order. Subtract ' + b + ': ' + y + ' − ' + b + ' = ' + (y - b) + '.', 'Divide by ' + a + ': ' + (y - b) + ' ÷ ' + a + ' = <b>' + key + '</b>', 'Check: ' + a + ' × ' + key + ' + ' + b + ' = ' + y + '.'],
      why: { G: 'Undo in reverse order: the machine added ' + b + ' last, so subtract ' + b + ' first, then divide by ' + a + '.', M14: 'You ran the machine forwards on the output. To find the input, undo the steps backwards.' },
      steps: [
        { label: 'The last step added ' + b + '. Undo it: ' + y + ' − ' + b + ' =', part: { kind: 'num', key: y - b }, hint: 'Subtract ' + b + '.' },
        { label: 'Now undo "multiply by ' + a + '": ' + (y - b) + ' ÷ ' + a + ' =', part: { kind: 'num', key: key }, hint: 'Divide by ' + a + '.' }
      ]
    };
  } });

  /* ---------------- Skill 2 Read values from a graph ---------------- */
  C.add({ id: 'QG-1a', skill: '2', level: 1, order: 1, type: 'MC', gen: function (R) {
    var T, h, i, key, n1, n2;
    do {
      T = [R.int(5, 8) * 2];
      for (var k = 0; k < 6; k++) T.push(T[k] + (k < 4 ? R.pick([2, 4]) : -R.pick([2, 4, 6])));
      h = R.pick([8, 10, 12, 14, 16]); i = (h - 6) / 2; key = T[i]; n1 = T[i - 1]; n2 = T[i + 1];
    } while (n1 === n2 || h === key || h === n1 || h === n2);
    var knots = T.map(function (t, j) { return [6 + 2 * j, t]; });
    return {
      stem: 'The graph shows the temperature during one day. What was the temperature at ' + h + ':00?',
      fig: C.graph({ x: [6, 18], y: [0, 32], dx: 1, lx: 2, dy: 2, ly: 2, h: 380, xl: 'Hour of the day', yl: 'Temperature (°C)', label: 'Line graph of temperature from 6:00 to 18:00',
        lines: [{ seg: knots }], pts: knots.map(function (p) { return { x: p[0], y: p[1], r: 4 }; }) }),
      think: 'Start on the hour axis, go up to the line, then across.',
      parts: [{ kind: 'choice', label: 'Temperature', opts: [{ t: key + ' °C', ok: true }, { t: n1 + ' °C', tag: 'G' }, { t: n2 + ' °C', tag: 'G' }, { t: h + ' °C', tag: 'M10' }] }],
      answer: key + ' °C',
      work: ['Find ' + h + ' on the hour axis (along the bottom).', 'Go straight up to the line, then across to the temperature axis.', 'The temperature was <b>' + key + ' °C</b>.'],
      why: { G: 'That is the temperature at a neighbouring hour. Line up exactly with ' + h + ' on the bottom axis.', M10: 'You gave the hour, ' + h + ', not the temperature. Go up from ' + h + ' to the line, then read across.' },
      steps: [
        { label: 'Where do you find ' + h + ':00?', part: { kind: 'choice', keep: true, opts: [{ t: 'On the bottom (hour) axis', ok: true }, { t: 'On the side (temperature) axis' }] }, hint: 'Times are along the bottom.' },
        { label: 'Go up from ' + h + ' to the line, then across. The temperature is (°C)', part: { kind: 'num', key: key }, hint: 'Each gridline on the temperature axis is 2 °C.' }
      ]
    };
  } });

  C.add({ id: 'QG-1b', skill: '2', level: 1, order: 2, type: 'MC', gen: function (R) {
    var S, r, cand, t, p, opts;
    do {
      S = R.pick([80, 90, 100]); r = R.pick([5, 10, 20]); cand = [];
      for (var k = 1; k <= 11; k++) { var v = S - r * k; if (v > 0 && v % 10 === 0) cand.push(k); }
      t = cand.length ? R.pick(cand) : 1; p = S - r * t;
      opts = uniq([{ t: t + ' hours', ok: true }, { t: (t - 1) + ' hours', tag: 'G' }, { t: (t + 1) + ' hours', tag: 'G' }, { t: p + ' hours', tag: 'M10' }]);
    } while (!cand.length || opts.length < 4 || t < 2);
    var end = Math.min(12, S / r);
    return {
      stem: 'The graph shows a phone\'s battery level as it is used. After how many hours was the battery at ' + p + '%?',
      fig: C.graph({ x: [0, 12], y: [0, 100], dx: 1, dy: 10, ly: 10, xl: 'Time (hours)', yl: 'Battery (%)', label: 'Line graph of battery level falling from ' + S + '% over time',
        lines: [{ m: -r, b: S, from: 0, to: end }] }),
      think: 'Start on the battery axis this time.',
      parts: [{ kind: 'choice', label: 'Time', opts: opts }],
      answer: t + ' hours',
      work: ['Find ' + p + '% on the battery axis (the side).', 'Go across to the line, then straight down to the time axis.', 'The battery was at ' + p + '% after <b>' + t + ' hours</b>.'],
      why: { G: 'That is a neighbouring hour. Go across from ' + p + '% exactly to the line, then straight down.', M10: p + ' is the battery level, not a time. Find ' + p + ' on the side axis, go across to the line, then down.' },
      steps: [
        { label: 'Where do you find ' + p + '%?', part: { kind: 'choice', keep: true, opts: [{ t: 'On the side (battery) axis', ok: true }, { t: 'On the bottom (time) axis' }] }, hint: 'Battery levels are up the side.' },
        { label: 'Go across from ' + p + '% to the line, then down. The time is (hours)', part: { kind: 'num', key: t }, hint: 'Each gridline on the time axis is 1 hour.' }
      ]
    };
  } });

  // converted from the plan's interactive "drag a point to (a, b)": pick which of 4 plotted points is at (a, b)
  C.add({ id: 'QG-1c', skill: '2', level: 1, order: 3, type: 'interactive', gen: function (R) {
    var a, b;
    do { a = R.nz(-8, 8); b = R.nz(-8, 8); } while (Math.abs(a - b) < 2 || Math.abs(a) === Math.abs(b) || Math.abs(a) < 2 || Math.abs(b) < 2);
    var cands = R.shuffle([{ x: a, y: b, ok: true }, { x: b, y: a, tag: 'G' }, { x: -a, y: b, tag: 'M2' }, { x: a, y: -b, tag: 'M2' }]);
    var okL = '';
    cands.forEach(function (c, i) { c.l = LET[i]; if (c.ok) okL = LET[i]; });
    return {
      stem: 'Which point is at ' + C.pt(a, b) + '?',
      fig: C.graph({ x: [-9, 9], y: [-9, 9], label: 'Coordinate grid with points A, B, C and D', pts: cands.map(function (c) { return { x: c.x, y: c.y, l: c.l }; }) }),
      think: 'First number: right or left. Second number: up or down.',
      parts: [{ kind: 'choice', label: 'Point', keep: true, opts: cands.map(function (c) { return c.ok ? { t: 'Point ' + c.l, ok: true } : { t: 'Point ' + c.l, tag: c.tag }; }) }],
      answer: 'Point ' + okL + ', at ' + C.pt(a, b),
      work: ['Start at (0, 0).', 'x = ' + f(a) + ': go ' + Math.abs(a) + ' ' + (a > 0 ? 'right' : 'left') + '. y = ' + f(b) + ': go ' + Math.abs(b) + ' ' + (b > 0 ? 'up' : 'down') + '.', 'That is <b>point ' + okL + '</b>.'],
      why: { G: 'That point is at ' + C.pt(b, a) + ': you swapped the numbers. The first number (x) is left or right; the second (y) is up or down.', M2: 'One of the signs is flipped. Negative x is left, negative y is down.' },
      steps: [
        { label: 'x = ' + f(a) + '. Do you go right or left from (0, 0)?', part: { kind: 'choice', keep: true, opts: [{ t: 'Right', ok: a > 0 }, { t: 'Left', ok: a < 0 }] }, hint: 'Positive x is right, negative x is left.' },
        { label: 'y = ' + f(b) + '. Do you go up or down?', part: { kind: 'choice', keep: true, opts: [{ t: 'Up', ok: b > 0 }, { t: 'Down', ok: b < 0 }] }, hint: 'Positive y is up, negative y is down.' },
        { label: 'Go ' + Math.abs(a) + ' ' + (a > 0 ? 'right' : 'left') + ' and ' + Math.abs(b) + ' ' + (b > 0 ? 'up' : 'down') + '. Which point is there?', part: { kind: 'choice', keep: true, opts: LET.map(function (L) { return { t: 'Point ' + L, ok: L === okL }; }) }, hint: 'Count the gridlines from the origin.' }
      ]
    };
  } });

  C.add({ id: 'QG-1d', skill: '2', level: 3, order: 1, type: 'NE', gen: function (R) {
    var sx, sy, c, k, cand, i, n;
    do {
      sx = R.pick([2, 5, 10]); sy = R.pick([2, 5, 10]); k = R.pick([0.5, 1, 2, -0.5, -1]);
      c = k > 0 ? R.int(0, 4) : R.int(6, 10); cand = [];
      for (var j = 1; j <= 9; j++) { var v = c + k * j; if (v === Math.round(v) && v >= 1 && v <= 10 && v !== j) cand.push(j); }
    } while (!cand.length);
    i = R.pick(cand); n = c + k * i;
    var x = i * sx, key = n * sy, wrong = [{ v: n, tag: 'M5' }];
    if (n * sx !== key) wrong.push({ v: n * sx, tag: 'M5' });
    return {
      stem: 'Look at the scales on the axes. What is y when x = ' + x + '?',
      fig: C.graph({ x: [0, 10 * sx], y: [0, 10 * sy], dx: sx, dy: sy, label: 'Line on a grid; each square is ' + sx + ' across and ' + sy + ' up',
        lines: [{ m: k * sy / sx, b: c * sy }] }),
      think: 'What is each square worth on the y-axis?',
      parts: [{ kind: 'num', label: 'y', key: key, wrong: wrong }],
      answer: 'y = ' + key,
      work: ['Each square on the x-axis is worth ' + sx + ', so x = ' + x + ' is ' + i + ' squares across.', 'Each square on the y-axis is worth ' + sy + '. The line there is ' + n + ' squares up.', 'y = ' + n + ' × ' + sy + ' = <b>' + key + '</b>'],
      why: { M5: 'You counted ' + n + ' squares but each square on the y-axis is worth ' + sy + ': ' + n + ' × ' + sy + ' = ' + key + '.' },
      steps: [
        { label: 'What is each square on the y-axis worth?', part: { kind: 'num', key: sy }, hint: 'Read the numbers up the y-axis.' },
        { label: 'At x = ' + x + ', how many squares up is the line?', part: { kind: 'num', key: n }, hint: 'Count gridlines from the x-axis to the line.' },
        { label: 'y = ' + n + ' × ' + sy + ' =', part: { kind: 'num', key: key }, hint: 'Multiply the squares by what each is worth.' }
      ]
    };
  } });

  /* ---------------- Skill 3 Function or not: pairs and mappings ---------------- */
  C.add({ id: 'FN-2a', skill: '3', level: 2, order: 1, type: 'MC', gen: function (R) {
    var xs3 = R.distinct(3, -3, 9), r = R.pick(xs3), ys = R.distinct(4, -3, 9);
    var keySet = xs3.map(function (x, i) { return [x, ys[i]]; }), y1 = ys[xs3.indexOf(r)], y2 = ys[3];
    keySet.push([r, y2]); keySet = R.shuffle(keySet);
    var c = R.int(-3, 9), sameSet = R.distinct(4, -3, 9).map(function (x) { return [x, c]; });
    var rys = R.distinct(3, -3, 9); rys.push(rys[R.int(0, 2)]); rys = R.shuffle(rys);
    var repSet = R.distinct(4, -3, 9).map(function (x, i) { return [x, rys[i]]; });
    var npys = R.distinct(4, -3, 9), npSet = R.distinct(4, -3, 9).map(function (x, i) { return [x, npys[i]]; });
    return {
      stem: 'Which set of ordered pairs is NOT a function?',
      think: 'Look at the inputs (x). Does any x go to two different y-values?',
      parts: [{ kind: 'choice', label: 'Not a function', opts: [{ t: C.pairs(keySet), ok: true }, { t: C.pairs(sameSet), tag: 'M15' }, { t: C.pairs(repSet), tag: 'M6' }, { t: C.pairs(npSet), tag: 'M15' }] }],
      answer: C.pairs(keySet),
      work: ['A function gives each input exactly one output.', 'In ' + C.pairs(keySet) + ', x = ' + f(r) + ' goes to both ' + f(y1) + ' and ' + f(y2) + '.', 'So <b>' + C.pairs(keySet) + '</b> is not a function. Repeated outputs are fine, and a function does not need a pattern.'],
      why: { M15: 'That set is a function: every x has just one y. A function does not need a pattern, and all the y-values can be the same.', M6: 'Repeated outputs (y) are allowed. Only an input (x) with two different outputs breaks the rule.' },
      steps: [
        { label: 'In ' + C.pairs(keySet) + ', which x-value appears twice?', part: { kind: 'num', key: r }, hint: 'Look at the first number in each pair.' },
        { label: 'Does x = ' + f(r) + ' go to the same y both times?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes' }, { t: 'No', ok: true }] }, hint: 'It goes to ' + f(y1) + ' and to ' + f(y2) + '.' },
        { label: 'So is that set a function?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes' }, { t: 'No', ok: true }] }, hint: 'One input with two outputs is not allowed.' }
      ]
    };
  } });

  C.add({ id: 'FN-2b', skill: '3', level: 2, order: 2, type: 'MC', gen: function (R) {
    var kind = R.pick(['branch', 'share', 'norule']), L, Rt, arrows, bi = -1, maxOut;
    if (kind === 'branch') {
      L = R.distinct(3, 1, 9).sort(function (p, q) { return p - q; }); Rt = R.distinct(4, 1, 20);
      var to = R.shuffle([0, 1, 2, 3]); bi = R.int(0, 2);
      arrows = [[0, to[0]], [1, to[1]], [2, to[2]], [bi, to[3]]]; maxOut = 2;
    } else if (kind === 'share') {
      L = R.distinct(4, 1, 9).sort(function (p, q) { return p - q; }); Rt = R.distinct(3, 1, 20);
      var t2 = R.shuffle([0, 1, 2, R.int(0, 2)]);
      arrows = t2.map(function (j, i) { return [i, j]; }); maxOut = 1;
    } else {
      L = R.distinct(4, 1, 9).sort(function (p, q) { return p - q; }); Rt = R.distinct(4, 1, 20);
      var t3; do { t3 = R.shuffle([0, 1, 2, 3]); } while (t3[0] === 0 && t3[1] === 1);
      arrows = t3.map(function (j, i) { return [i, j]; }); maxOut = 1;
    }
    var isF = kind !== 'branch';
    var opts = [
      { t: 'Yes, each input has one output', ok: isF, tag: isF ? undefined : 'M6' },
      { t: 'Yes, each output has one input', tag: 'M6' },
      { t: 'No, an input has two outputs', ok: !isF, tag: isF ? (kind === 'norule' ? 'M15' : 'G') : undefined },
      { t: 'No, two inputs share an output', tag: kind === 'norule' ? 'M15' : 'M6' }
    ];
    opts.forEach(function (o) { if (!o.ok) delete o.ok; if (!o.tag) delete o.tag; });
    var desc = kind === 'branch' ? 'Input ' + L[bi] + ' has two arrows leaving it, to two different outputs.' : kind === 'share' ? 'Every input has exactly one arrow leaving it. Two inputs share an output, and that is allowed.' : 'Every input has exactly one arrow leaving it. There is no rule, but a function does not need one.';
    return {
      stem: 'Inputs are on the left and outputs on the right. Is this mapping a function?',
      fig: C.mapping({ left: L, right: Rt, arrows: arrows }),
      think: 'Follow each arrow from the left. Count the arrows leaving each input.',
      parts: [{ kind: 'choice', label: 'Function?', keep: true, opts: opts }],
      answer: isF ? 'Yes, each input has one output' : 'No, an input has two outputs',
      work: ['Follow each arrow from the left side.', desc, isF ? '<b>Yes, it is a function</b>: each input has one output.' : '<b>No, it is not a function</b>: an input has two outputs.'],
      why: { M6: 'Look at the inputs, not the outputs. Outputs can be shared; only an input with two arrows leaving it breaks the rule.', M15: 'A function can be any matching with one arrow from each input. It does not need a formula or a pattern.' },
      steps: [
        { label: 'What is the greatest number of arrows leaving any one input?', part: { kind: 'num', key: maxOut }, hint: 'Check each number on the left, one at a time.' },
        { label: 'So is it a function?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: isF }, { t: 'No', ok: !isF }] }, hint: 'It is a function only if every input has exactly one arrow.' }
      ]
    };
  } });

  C.add({ id: 'FN-2c', skill: '3', level: 3, order: 1, type: 'TT', gen: function (R) {
    var xs = R.distinct(3, -5, 9), ys = R.distinct(2, -5, 9), a = xs[0], b = xs[1], c = xs[2], p = ys[0], q = ys[1];
    var set = R.shuffle([[a, p], [b, p], [c, q]]);
    return {
      stem: 'Is the set ' + C.pairs(set) + ' a function? Choose the answer and the reason.',
      parts: [
        { kind: 'choice', label: 'Is it a function?', keep: true, opts: [{ t: 'Yes', ok: true }, { t: 'No', tag: 'M6' }] },
        { kind: 'choice', label: 'Reason', opts: [{ t: 'Each input has exactly one output', ok: true }, { t: 'No two outputs are the same', tag: 'M6' }, { t: 'It follows a pattern', tag: 'M15' }] }
      ],
      answer: 'Yes, because each input has exactly one output',
      work: ['The inputs ' + f(a) + ' and ' + f(b) + ' share the output ' + f(p) + '. That is fine.', 'No input appears with two different outputs.', '<b>Yes, it is a function</b>: each input has exactly one output.'],
      why: { M6: 'Two inputs share the output ' + f(p) + ', which is allowed. What matters is that no input has two outputs.', M15: 'A function does not need a pattern. The reason is that each input has exactly one output.' },
      steps: [
        { label: 'Which output appears twice?', part: { kind: 'num', key: p }, hint: 'Look at the second number in each pair.' },
        { label: 'Does any input (x) appear with two different outputs?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes' }, { t: 'No', ok: true }] }, hint: 'The inputs are ' + f(a) + ', ' + f(b) + ' and ' + f(c) + ': all different.' },
        { label: 'So is it a function?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: true }, { t: 'No' }] }, hint: 'Shared outputs are allowed.' }
      ]
    };
  } });

  // converted from the plan's EG "drag arrows" (draw a non-function, then a no-rule function): judge 4 drawn mappings instead
  C.add({ id: 'FN-2d', skill: '3', level: 4, order: 1, type: 'EG', gen: function (R) {
    var L = R.distinct(3, -6, 9).sort(function (p, q) { return p - q; }), Rt = R.distinct(3, -9, 12);
    var to = R.shuffle([0, 1, 2]), bi = R.int(0, 2), extra = (to[bi] + R.int(1, 2)) % 3;
    var perm; do { perm = R.shuffle([0, 1, 2]); } while (perm[0] === 0 && perm[1] === 1);
    var sh = R.int(0, 2), other = (sh + R.int(1, 2)) % 3, lone = R.int(0, 2);
    var maps = [
      { kind: 'branch', isF: false, arrows: [[0, to[0]], [1, to[1]], [2, to[2]], [bi, extra]], tag: 'M6', why: 'Input ' + f(L[bi]) + ' has two arrows: two outputs.' },
      { kind: 'const', isF: true, arrows: [[0, sh], [1, sh], [2, sh]], tag: 'M15', why: 'Every input goes to ' + f(Rt[sh]) + ': one output each, so it is a function.' },
      { kind: 'norule', isF: true, arrows: perm.map(function (j, i) { return [i, j]; }), tag: 'M15', why: 'One arrow from each input. No rule is needed.' },
      { kind: 'share', isF: true, arrows: [0, 1, 2].map(function (i) { return [i, i === lone ? other : sh]; }), tag: 'M6', why: 'Two inputs share an output, which is allowed. Each input has one arrow.' }
    ];
    if (other === sh) maps[3].arrows = [0, 1, 2].map(function (i) { return [i, i === lone ? (sh + 1) % 3 : sh]; });
    maps = R.shuffle(maps);
    maps.forEach(function (m, i) { m.l = LET[i]; });
    var fig = '<div style="display:flex;flex-wrap:wrap;gap:10px">' + maps.map(function (m) {
      return '<div style="flex:1 1 220px;max-width:300px"><b>Mapping ' + m.l + '</b><br>' + C.mapping({ left: L, right: Rt, arrows: m.arrows }) + '</div>';
    }).join('') + '</div>';
    var br = maps.filter(function (m) { return !m.isF; })[0], nr = maps.filter(function (m) { return m.kind === 'norule'; })[0];
    return {
      stem: 'Four students drew arrows from the inputs ' + L.map(f).join(', ') + ' to the outputs ' + Rt.map(f).join(', ') + '. For each mapping, decide: function or not a function?',
      fig: fig,
      think: 'Only one thing breaks the rule: an input with two arrows leaving it.',
      parts: maps.map(function (m) {
        return { kind: 'choice', label: 'Mapping ' + m.l, keep: true, opts: [{ t: 'Function', ok: m.isF, tag: m.isF ? undefined : m.tag }, { t: 'Not a function', ok: !m.isF, tag: m.isF ? m.tag : undefined }].map(function (o) { if (!o.ok) delete o.ok; if (!o.tag) delete o.tag; return o; }) };
      }),
      answer: maps.map(function (m) { return m.l + ': ' + (m.isF ? 'function' : 'not a function'); }).join(', '),
      work: ['Check each input on the left: how many arrows leave it?', maps.map(function (m) { return m.l + ': ' + m.why; }).join(' '), '<b>Only mapping ' + br.l + ' is not a function.</b> Any matching with one arrow per input is a function, rule or no rule.'],
      why: { M6: 'Look at the inputs, not the outputs. Shared outputs are fine; an input with two arrows is not.', M15: 'A function does not need a rule or a pattern, and every input may go to the same output.' },
      steps: [
        { label: 'In mapping ' + br.l + ', how many arrows leave the input ' + f(L[bi]) + '?', part: { kind: 'num', key: 2 }, hint: 'Count the arrows that start at ' + f(L[bi]) + '.' },
        { label: 'So mapping ' + br.l + ' is', part: { kind: 'choice', keep: true, opts: [{ t: 'Function' }, { t: 'Not a function', ok: true }] }, hint: 'One input with two outputs breaks the rule.' },
        { label: 'Mapping ' + nr.l + ' has one arrow from each input, but no rule. It is', part: { kind: 'choice', keep: true, opts: [{ t: 'Function', ok: true }, { t: 'Not a function' }] }, hint: 'A function does not need a rule.' }
      ]
    };
  } });
})();
