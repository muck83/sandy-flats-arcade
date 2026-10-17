/* Climb question bank: foundation skills F1 (find the change) and F2 (how two quantities change together).
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt, M = '−';
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 − (−2)

  // a number line with an arrow from a to b
  function numline(a, b) {
    var lo = Math.min(a, b, 0) - 2, hi = Math.max(a, b, 0) + 2, W = 460, H = 74, pad = 20;
    function X(v) { return pad + (v - lo) / (hi - lo) * (W - 2 * pad); }
    var s = '<svg class="cfig" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Number line with an arrow from ' + f(a) + ' to ' + f(b) + '" style="max-width:100%;height:auto">';
    s += '<defs><marker id="nlA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#F97316"/></marker></defs>';
    s += '<line x1="' + pad + '" y1="50" x2="' + (W - pad) + '" y2="50" stroke="#4A5468" stroke-width="2"/>';
    var step = (hi - lo) > 24 ? 5 : (hi - lo) > 12 ? 2 : 1;
    for (var v = Math.ceil(lo / step) * step; v <= hi; v += step) s += '<line x1="' + X(v) + '" y1="44" x2="' + X(v) + '" y2="56" stroke="#4A5468"/><text x="' + X(v) + '" y="70" font-size="11" text-anchor="middle" fill="#4A5468">' + f(v) + '</text>';
    s += '<path d="M' + X(a) + ' 40 Q' + ((X(a) + X(b)) / 2) + ' 6 ' + X(b) + ' 40" fill="none" stroke="#F97316" stroke-width="3" marker-end="url(#nlA)"/>';
    s += '<circle cx="' + X(a) + '" cy="50" r="5" fill="#1D4ED8"/><circle cx="' + X(b) + '" cy="50" r="5" fill="#1D4ED8"/>';
    return s + '</svg>';
  }

  /* ---------------- F1 Find the change ---------------- */
  C.add({ id: 'CV-1a', skill: 'F1', level: 1, type: 'NE', gen: function (R) {
    var a, b; do { a = R.int(-12, 15); b = R.int(-12, 15); } while (a === b || Math.abs(a) === Math.abs(b) || (R.chance(0.5) && a * b >= 0));
    var key = b - a;
    return {
      stem: 'The temperature went from ' + f(a) + ' °C to ' + f(b) + ' °C. What was the change in temperature?',
      think: 'Change = end − start. Keep the sign.',
      parts: [{ kind: 'num', label: 'Change (°C)', key: key, wrong: [{ v: a - b, tag: 'M2' }, { v: Math.abs(key), tag: 'M2' }, { v: a + b, tag: 'M14' }] }],
      answer: f(key) + ' °C',
      work: ['Change = end − start', f(b) + ' − ' + par(a) + ' = <b>' + f(key) + '</b>', key < 0 ? 'A negative change means it went down.' : 'A positive change means it went up.'],
      steps: [
        { label: 'What was the temperature at the end?', part: { kind: 'num', key: b }, hint: 'The end is the second temperature.' },
        { label: 'What was it at the start?', part: { kind: 'num', key: a }, hint: 'The start is the first temperature.' },
        { label: 'Change = end − start = ' + f(b) + ' − ' + par(a) + ' =', part: { kind: 'num', key: key }, hint: 'Subtracting a negative is the same as adding. Keep the sign of your answer.' }
      ]
    };
  } });

  C.add({ id: 'CV-1c', skill: 'F1', level: 1, type: 'TT', gen: function (R) {
    // a lift in a building with basement floors (negative floor numbers below ground)
    var a = -R.int(2, 5), b = R.int(2, 12); if (R.chance(0.5)) { var t = a; a = b; b = t; }
    if (Math.abs(a) === Math.abs(b)) b += b > 0 ? 1 : -1;
    var key = b - a;
    var opts = [{ t: f(key), ok: true }, { t: f(a - b), tag: 'M2' }, { t: f(Math.abs(b) - Math.abs(a)), tag: 'M2' }, { t: f(b + a), tag: 'M14' }];
    // keep the options distinct
    var seen = {}; opts = opts.filter(function (o) { if (seen[o.t]) return false; seen[o.t] = 1; return true; });
    return {
      stem: 'In a building, floors below the ground have negative numbers. A lift went from floor ' + f(a) + ' to floor ' + f(b) + '. What was the change in floor number, and why?',
      parts: [
        { kind: 'choice', label: 'The change is (floors)', opts: opts },
        { kind: 'choice', label: 'Because', opts: [{ t: 'Change is end minus start', ok: true }, { t: 'Take the bigger number minus the smaller one', tag: 'M2' }, { t: 'Count the gap between them and ignore the sign', tag: 'M2' }] }
      ],
      answer: f(key) + ' floors, because change is end minus start',
      work: ['Change is always end minus start.', f(b) + ' − ' + par(a) + ' = <b>' + f(key) + '</b>', 'Its sign tells the direction: ' + (key < 0 ? 'negative means the lift went down.' : 'positive means the lift went up.')],
      why: { M2: 'The lift went from floor ' + f(a) + ' (start) to floor ' + f(b) + ' (end), so it went ' + (key < 0 ? 'down' : 'up') + '. End − start = ' + f(b) + ' − ' + par(a) + ' = ' + f(key) + '.', M14: 'You added the two floor numbers. The change is end − start: ' + f(b) + ' − ' + par(a) + ' = ' + f(key) + '.' },
      steps: [
        { label: 'Which floor is the end?', part: { kind: 'num', key: b }, hint: 'The lift went from the first floor to the second one.' },
        { label: 'End − start = ' + f(b) + ' − ' + par(a) + ' =', part: { kind: 'num', key: key }, hint: 'Keep the sign: did the lift go up or down?' }
      ]
    };
  } });

  C.add({ id: 'CV-1d', skill: 'F1', level: 1, type: 'interactive', ia: true, gen: function (R) {
    var a = R.int(-8, 8), b; do { b = R.int(-8, 8); } while (Math.abs(b - a) < 2);
    if (R.chance(0.5) && b > a) { var t = a; a = b; b = t; }   // half go left
    var key = b - a;
    // the arrow drawn from the Start handle to the End handle, just above the line
    function arrow(cur) {
      var s = cur[0][0], e = cur[1][0], d = e > s ? 1 : -1, out = [{ seg: [[s, 0], [s, 0.5], [e, 0.5]], color: C.COL.pt, w: 3 }];
      if (s !== e) out.push({ seg: [[e - 0.6 * d, 0.8], [e, 0.5], [e - 0.6 * d, 0.2]], color: C.COL.pt, w: 3 });
      return out;
    }
    return {
      stem: 'Drag the orange points to draw an arrow on the number line from ' + f(a) + ' (Start) to ' + f(b) + ' (End). Then type the change.',
      think: 'Which way does your arrow point? Left means negative.',
      parts: [
        { kind: 'points', label: 'Your arrow', grid: { x: [-10, 10], y: [-1, 1], dy: 1, ly: 10, size: 440, h: 130, label: 'Number line from −10 to 10' },
          start: [[-9, 0], [9, 0]], names: ['Start', 'End'], labels: false, lock: 'y', extra: arrow,
          readout: function (cur) { return 'Your arrow: from ' + f(cur[0][0]) + ' to ' + f(cur[1][0]) + '.'; },
          key: [[a, 0], [b, 0]],
          check: function (cur) { if (cur[0][0] === a && cur[1][0] === b) return { ok: true }; if (cur[0][0] === b && cur[1][0] === a) return { ok: false, tag: 'M2' }; return { ok: false }; } },
        { kind: 'num', label: 'Change', key: key, wrong: [{ v: -key, tag: 'M2' }, { v: a + b, tag: 'M14' }] }
      ],
      answerFig: numline(a, b),
      why: { M2: 'The arrow goes from the start, ' + f(a) + ', to the end, ' + f(b) + '. It points ' + (key < 0 ? 'left, so the change is negative' : 'right, so the change is positive') + ': ' + f(key) + '.', M14: 'You added the two numbers. The change is end − start: ' + f(b) + ' − ' + par(a) + ' = ' + f(key) + '.' },
      answer: 'An arrow from ' + f(a) + ' to ' + f(b) + '; change ' + f(key),
      work: ['Put Start on ' + f(a) + ' and End on ' + f(b) + '.', 'The arrow points ' + (key < 0 ? 'left' : 'right') + ', so the change is ' + (key < 0 ? 'negative' : 'positive') + '.', 'End − start = ' + f(b) + ' − ' + par(a) + ' = <b>' + f(key) + '</b>'],
      steps: [
        { label: 'An arrow from ' + f(a) + ' to ' + f(b) + ' points', part: { kind: 'choice', opts: [{ t: 'Left', ok: key < 0 }, { t: 'Right', ok: key > 0 }], keep: true }, hint: 'Is ' + f(b) + ' to the left or the right of ' + f(a) + ' on the number line?' },
        { label: 'How many steps long is the arrow?', part: { kind: 'num', key: Math.abs(key) }, hint: 'Count the steps from ' + f(a) + ' to ' + f(b) + '.' },
        { label: 'So the change is', part: { kind: 'num', key: key }, hint: 'Left is negative, right is positive.' }
      ]
    };
  } });

  C.add({ id: 'CV-1b', skill: 'F1', level: 1, order: 1, type: 'NE', gen: function (R) {
    var x1 = R.int(-5, 6), x2 = x1 + R.int(1, 6), y1 = R.int(-6, 12), y2; do { y2 = R.int(-8, 12); } while (y2 === y1 || (R.chance(0.6) && y2 > y1));
    var dx = x2 - x1, dy = y2 - y1;
    return {
      stem: 'A table has two rows. From the first row to the second, how much did x change, and how much did y change?',
      fig: C.table({ cols: ['x', 'y'], rows: [[x1, y1], [x2, y2]] }),
      think: 'For each column: second row − first row.',
      parts: [
        { kind: 'num', label: 'Change in x', key: dx, wrong: [{ v: -dx, tag: 'M2' }, { v: x2, tag: 'M13' }] },
        { kind: 'num', label: 'Change in y', key: dy, wrong: [{ v: -dy, tag: 'M2' }, { v: y2, tag: 'M13' }] }
      ],
      answer: 'x changed by ' + f(dx) + ', y changed by ' + f(dy),
      why: { M13: 'You gave a value from the second row, not a change. The change is second − first: x: ' + f(x2) + ' − ' + par(x1) + ' = ' + f(dx) + ', and y: ' + f(y2) + ' − ' + par(y1) + ' = ' + f(dy) + '.' },
      work: ['x went from ' + f(x1) + ' to ' + f(x2) + ': ' + f(x2) + ' − ' + par(x1) + ' = <b>' + f(dx) + '</b>', 'y went from ' + f(y1) + ' to ' + f(y2) + ': ' + f(y2) + ' − ' + par(y1) + ' = <b>' + f(dy) + '</b>'],
      steps: [
        { label: 'Change in x = ' + f(x2) + ' − ' + par(x1) + ' =', part: { kind: 'num', key: dx }, hint: 'Second row minus first row.' },
        { label: 'Change in y = ' + f(y2) + ' − ' + par(y1) + ' =', part: { kind: 'num', key: dy }, hint: 'Second minus first. If y went down, the change is negative.' }
      ]
    };
  } });

  /* ---------------- F2 How two quantities change together ---------------- */
  C.add({ id: 'CV-2a', skill: 'F2', level: 2, type: 'FR', gen: function (R) {
    var b = R.nz(-6, 9), m = R.nz(-5, 5);
    var ys = [0, 1, 2, 3].map(function (x) { return b + m * x; });
    var nums = [];
    return {
      stem: 'Look at the table. Complete the sentence.',
      fig: C.table({ cols: ['x', 'y'], rows: [[0, ys[0]], [1, ys[1]], [2, ys[2]], [3, ys[3]]] }),
      sentence: 'Each time x goes up by 1, y goes {0} by {1}.',
      parts: [
        { kind: 'choice', inline: true, keep: true, opts: [{ t: 'up', ok: m > 0, tag: 'M2' }, { t: 'down', ok: m < 0, tag: 'M2' }] },
        { kind: 'num', inline: true, key: Math.abs(m), wrong: [{ v: ys[1], tag: 'M13' }, { v: ys[2], tag: 'M13' }, { v: Math.abs(b), tag: 'M9' }] }
      ],
      answer: 'y goes ' + (m > 0 ? 'up' : 'down') + ' by ' + Math.abs(m),
      why: { M13: 'That is a y-value from the table, not a change. Find how much y changes from one row to the next: ' + f(ys[1]) + ' − ' + par(ys[0]) + ' = ' + f(m) + '.', M9: Math.abs(b) + ' comes from the start: y is ' + f(b) + ' when x = 0. The question asks how much y changes each time x goes up by 1: ' + f(ys[1]) + ' − ' + par(ys[0]) + ' = ' + f(m) + '.' },
      work: ['Look at the changes, not the values.', f(ys[0]) + ' → ' + f(ys[1]) + ' is a change of ' + f(m) + '.', 'Every row changes by the same ' + f(m) + ', so y goes <b>' + (m > 0 ? 'up' : 'down') + ' by ' + Math.abs(m) + '</b>.'],
      steps: [
        { label: 'From x = 0 to x = 1, y goes from ' + f(ys[0]) + ' to ' + f(ys[1]) + '. Change in y =', part: { kind: 'num', key: m }, hint: 'End minus start: ' + f(ys[1]) + ' − ' + par(ys[0]) + '.' },
        { label: 'Is that change up or down?', part: { kind: 'choice', keep: true, opts: [{ t: 'up', ok: m > 0 }, { t: 'down', ok: m < 0 }] }, hint: 'A negative change means down.' }
      ]
    };
  } });

  C.add({ id: 'CV-2b', skill: 'F2', level: 2, type: 'NE', gen: function (R) {
    var s = R.int(2, 5), r = R.int(2, 6), k = r * s;
    return {
      stem: 'When x goes up by ' + s + ', y goes up by ' + k + '. It changes at a steady rate. How much does y go up when x goes up by 1?',
      think: 'Spread the change in y evenly over the steps in x.',
      parts: [{ kind: 'num', label: 'y goes up by', key: r, wrong: [{ v: k, tag: 'M8' }, { v: k - s, tag: 'M17' }, { v: s / k, tag: 'M1' }] }],
      answer: f(r),
      why: { M1: 'You did ' + s + ' ÷ ' + k + '. Share the change in y over the steps in x: change in y ÷ change in x = ' + k + ' ÷ ' + s + ' = ' + r + '.', M8: k + ' is how much y goes up over ' + s + ' steps of x. For 1 step, share it out: ' + k + ' ÷ ' + s + ' = ' + r + '.', M17: 'You subtracted ' + k + ' − ' + s + '. Share the change in y over the steps instead: ' + k + ' ÷ ' + s + ' = ' + r + '.' },
      work: [k + ' is spread evenly over ' + s + ' steps of 1.', 'Each step: ' + k + ' ÷ ' + s + ' = <b>' + r + '</b>', 'We divide the changes, not subtract them.'],
      steps: [
        { label: 'How many steps of 1 does x take?', part: { kind: 'num', key: s }, hint: 'x goes up by ' + s + '.' },
        { label: 'Share the change in y over those steps: ' + k + ' ÷ ' + s + ' =', part: { kind: 'num', key: r }, hint: 'Divide the change in y by the number of steps.' }
      ]
    };
  } });

  C.add({ id: 'CV-2c', skill: 'F2', level: 3, type: 'FR', gen: function (R) {
    var rate = R.int(2, 9), t1 = R.int(1, 4), dt = R.int(2, 5), t2 = t1 + dt, start = R.int(10, 60), v1 = start + rate * t1, v2 = start + rate * t2, dv = v2 - v1;
    return {
      stem: 'A tank is filling at a steady rate. After ' + C.pl(t1, 'minute') + ' it holds ' + v1 + ' L. After ' + C.pl(t2, 'minute') + ' it holds ' + v2 + ' L. Complete the sentence.',
      sentence: 'For every 1 more {0}, the water {1} by {2} litres.',
      parts: [
        { kind: 'choice', inline: true, keep: true, opts: [{ t: 'minute', ok: true }, { t: 'litre', tag: 'M9' }] },
        { kind: 'choice', inline: true, keep: true, opts: [{ t: 'increases', ok: true }, { t: 'decreases', tag: 'M2' }] },
        { kind: 'num', inline: true, key: rate, wrong: [{ v: dv, tag: 'M8' }, { v: v2 / t2, tag: 'M4' }, { v: dv - dt, tag: 'M17' }] }
      ],
      answer: 'For every 1 more minute, the water increases by ' + rate + ' litres',
      why: { M9: 'You swapped the input and the output. Time (minutes) is the input: the rate is per 1 more minute, not per litre. The litres are what change.', M8: dv + ' L is the change over ' + C.pl(dt, 'minute') + '. For 1 minute, share it out: ' + dv + ' ÷ ' + dt + ' = ' + rate + ' L.', M4: v2 + ' ÷ ' + t2 + ' only works if the tank started empty. It did not, so use the changes: ' + dv + ' ÷ ' + dt + ' = ' + rate + ' L per minute.', M17: 'You subtracted the changes. Divide them: ' + dv + ' L ÷ ' + C.pl(dt, 'minute') + ' = ' + rate + ' L per minute.' },
      work: ['In ' + dt + ' minutes the water rose ' + v2 + ' − ' + v1 + ' = ' + dv + ' L.', 'In 1 minute it rose ' + dv + ' ÷ ' + dt + ' = <b>' + rate + ' L</b>.', 'Using ' + v2 + ' ÷ ' + t2 + ' only works if the tank started empty.'],
      steps: [
        { label: 'Change in water: ' + v2 + ' − ' + v1 + ' =', part: { kind: 'num', key: dv }, hint: 'End minus start, in litres.' },
        { label: 'Change in time: ' + t2 + ' − ' + t1 + ' =', part: { kind: 'num', key: dt }, hint: 'End minus start, in minutes.' },
        { label: 'Litres per 1 minute: ' + dv + ' ÷ ' + dt + ' =', part: { kind: 'num', key: rate }, hint: 'Divide the change in water by the change in time.' }
      ]
    };
  } });

  // the plan's fill-the-table example item: x is given in steps of s, the student fills y
  C.add({ id: 'CV-2d', skill: 'F2', level: 3, type: 'EG', gen: function (R) {
    var s = R.int(2, 4), k = R.nz(-9, 12), x0 = R.int(-2, 4), y0 = R.int(-5, 10);
    if (Math.abs(k) === 1) k *= s;   // keep the x-step and y-step different, so stepping y "per row" vs "per 1" is visible
    var xs = [x0, x0 + s, x0 + 2 * s, x0 + 3 * s], ys = [y0, y0 + k, y0 + 2 * k, y0 + 3 * k];
    var rate = k / s;
    var blank = '<span class="cblank">?</span>';
    return {
      stem: 'In this table, y goes ' + (k > 0 ? 'up' : 'down') + ' by ' + Math.abs(k) + ' every time x goes up by ' + s + '. Fill in the missing y-values.',
      fig: C.table({ cols: ['x', 'y'], rows: [[xs[0], ys[0]], [xs[1], blank], [xs[2], blank], [xs[3], blank]] }),
      parts: [1, 2, 3].map(function (i) { return { kind: 'num', label: 'y when x = ' + f(xs[i]), key: ys[i], wrong: [{ v: y0 + k * s * i, tag: 'M8' }, { v: y0 - k * i, tag: 'M2' }] }; }),
      answer: ys.slice(1).map(f).join(', '),
      why: { M8: 'Each row, x goes up by ' + s + ' and y changes by ' + f(k) + '. You changed y by ' + f(k) + ' × ' + s + ' = ' + f(k * s) + ' each row. Use the change the question gives: ' + f(y0) + ' ' + C.term(k) + ' = ' + f(ys[1]) + '.', M2: 'y goes ' + (k > 0 ? 'up' : 'down') + ' by ' + Math.abs(k) + ' each row, so the change is ' + f(k) + ', not ' + f(-k) + ': ' + f(y0) + ' ' + C.term(k) + ' = ' + f(ys[1]) + '.' },
      work: ['Each row adds ' + s + ' to x and ' + f(k) + ' to y.', 'y: ' + ys.map(f).join(' → '), 'That is ' + f(k) + ' ÷ ' + s + ' = <b>' + f(rate) + '</b> for every 1 more x.'],
      steps: [
        { label: 'From one row to the next, x goes up by ' + s + '. How much does y change each row?', part: { kind: 'num', key: k }, hint: 'The question tells you: ' + (k > 0 ? 'up' : 'down') + ' ' + Math.abs(k) + '.' },
        { label: 'So when x = ' + f(xs[1]) + ', y = ' + f(y0) + ' ' + C.term(k) + ' =', part: { kind: 'num', key: ys[1] }, hint: 'Add the change to the first y-value.' }
      ]
    };
  } });
})();
