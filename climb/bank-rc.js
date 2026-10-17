/* Climb question bank: rate of change and slope, skills 6 (rate in stories and tables),
   7 (slope as a rate on a graph) and 8 (slope from two points).
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt, M = '−';
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 − (−2)
  function dec(v) { return f(Math.round(v * 100) / 100, 'dec'); }  // 0.08, 16.67 (never a fraction)
  function money(v) { var r = Math.round(v * 100) / 100; return r % 1 === 0 ? String(r) : r.toFixed(2); }
  function ud(v) { return v < 0 ? 'down' : 'up'; }
  // drop wrong values that equal the key or repeat an earlier one
  function wr(key, list) {
    var out = [];
    list.forEach(function (w) { if (!isFinite(w.v) || C.near(w.v, key)) return; if (out.some(function (o) { return C.near(o.v, w.v); })) return; out.push(w); });
    return out;
  }
  // drop options whose text repeats an earlier one (put the right option first)
  function uniq(opts) { var seen = {}; return opts.filter(function (o) { var k = C.strip(o.t); if (seen[k]) return false; seen[k] = 1; return true; }); }
  // rise and run for a slope: [rise, run] with run > 0
  function rr(m) { var q = C.asFrac(m); return [q[0], q[1]]; }
  // a −10..10 grid
  function grid(lines, pts, label) { return C.graph({ x: [-10, 10], y: [-10, 10], lines: lines, pts: pts, label: label }); }
  // two grid points on a line with slope m that misses the origin, both inside −8..8
  function twoPts(R, m, kmin, kmax) {
    var p = rr(m), x1, y1, x2, y2, k, b;
    do { k = R.int(kmin || 1, kmax || 2); x1 = R.int(-7, 5); y1 = R.int(-8, 8); x2 = x1 + p[1] * k; y2 = y1 + p[0] * k; b = y1 - m * x1; }
    while (x2 > 8 || y2 > 8 || y2 < -8 || Math.abs(b) < 1e-9 || Math.abs(b) > 9 || x1 === 0 || x2 === 0 || y1 === -1 || y2 === -1);   // y = −1 labels would sit on the x-axis numbers
    return { x1: x1, y1: y1, x2: x2, y2: y2, dx: x2 - x1, dy: y2 - y1, b: b };
  }
  // the rise-over-run model solution for points A and B
  function slopeWork(P, m) {
    return [
      'Rise (change in y): ' + f(P.y2) + ' − ' + par(P.y1) + ' = ' + f(P.dy) + (P.dy < 0 ? ' (down)' : ' (up)'),
      'Run (change in x): ' + f(P.x2) + ' − ' + par(P.x1) + ' = ' + f(P.dx),
      'Slope = rise ÷ run = ' + f(P.dy) + ' ÷ ' + f(P.dx) + ' = <b>' + f(m) + '</b>. For every 1 more in x, y changes by ' + f(m) + '.'
    ];
  }
  function m1Why(P) { return 'You found run over rise: ' + f(P.dx) + ' ÷ ' + f(P.dy) + ' = ' + f(P.dx / P.dy) + '. Slope is rise over run: the change in y (' + f(P.dy) + ') goes on top, the change in x (' + f(P.dx) + ') on the bottom.'; }
  function m2Why(m) { return 'The size is right but the sign is not. Read left to right: the line goes ' + ud(m) + ', so the slope is ' + (m < 0 ? 'negative' : 'positive') + '.'; }

  /* ---------------- Skill 6 Rate of change in stories and tables ---------------- */
  C.add({ id: 'RC-1a', skill: '6', level: 1, type: 'NE', gen: function (R) {
    var it = R.pick([['notebooks', 'notebook'], ['pens', 'pen'], ['juice boxes', 'juice box'], ['sandwiches', 'sandwich'], ['bus tickets', 'bus ticket'], ['bottles of water', 'bottle of water']]);
    var n = R.int(2, 8), price = R.int(3, 18) / 2, c = n * price;
    return {
      stem: n + ' ' + it[0] + ' cost ' + money(c) + ' riyals. What is the cost of one ' + it[1] + '?',
      think: 'Share the total cost equally.',
      parts: [{ kind: 'num', label: 'Cost of one ' + it[1] + ' (riyals)', key: price, wrong: wr(price, [{ v: n / c, tag: 'M1' }, { v: c * n, tag: 'M14' }, { v: c - n, tag: 'M17' }]) }],
      answer: money(price) + ' riyals',
      work: [n + ' ' + it[0] + ' cost ' + money(c) + ' riyals in total.', 'Cost of one = total cost ÷ number = ' + money(c) + ' ÷ ' + n + ' = <b>' + money(price) + ' riyals</b>', 'So for every 1 more ' + it[1] + ', the cost goes up by ' + money(price) + ' riyals.'],
      why: {
        M1: 'You divided the number of ' + it[0] + ' by the cost: ' + n + ' ÷ ' + money(c) + '. Put the cost on top: ' + money(c) + ' ÷ ' + n + '.',
        M14: 'You multiplied ' + money(c) + ' × ' + n + '. The total cost is shared among the ' + it[0] + ', so divide.',
        M17: 'You subtracted ' + money(c) + ' − ' + n + '. To find the cost of one, divide the cost by the number.'
      },
      steps: [
        { label: 'How many ' + it[0] + ' are there?', part: { kind: 'num', key: n }, hint: 'It is the first number in the question.' },
        { label: 'What do they cost in total (riyals)?', part: { kind: 'num', key: c }, hint: 'The total cost is in the question.' },
        { label: 'Cost of one = ' + money(c) + ' ÷ ' + n + ' =', part: { kind: 'num', key: price }, hint: 'Divide the total cost by the number of ' + it[0] + '.' }
      ]
    };
  } });

  C.add({ id: 'RC-2a', skill: '6', level: 2, order: 1, type: 'NE', gen: function (R) {
    var v, x, y; do { v = R.int(3, 12); x = R.int(2, 5); y = v * x; } while (y % 2 && y % 5);
    var dy = y % 5 === 0 ? 5 : 2, top = Math.ceil((y + 4) / 10) * 10;
    return {
      stem: 'The graph shows distance (km) against time (h) for a cyclist riding at a steady speed. It goes through (0, 0) and ' + C.pt(x, y) + '. What is her speed in km per hour?',
      fig: C.graph({ x: [0, 6], y: [0, top], dy: dy, ly: 10, xl: 'Time (h)', yl: 'Distance (km)', lines: [{ m: v, b: 0 }], pts: [{ x: 0, y: 0 }, { x: x, y: y, l: C.pt(x, y) }], label: 'Line from (0, 0) through ' + C.pt(x, y) }),
      think: 'km per hour: how many km for every 1 hour?',
      parts: [{ kind: 'num', label: 'Speed (km per hour)', key: v, wrong: wr(v, [{ v: x / y, tag: 'M1' }, { v: y, tag: 'M13' }, { v: y - x, tag: 'M17' }]) }],
      answer: v + ' km per hour',
      work: ['In ' + x + ' hours she rode ' + y + ' km.', 'For every 1 more hour: ' + y + ' km ÷ ' + x + ' h = <b>' + v + ' km per hour</b>', 'Distance goes on top because the answer is km per hour.'],
      why: {
        M1: 'You found hours per km: ' + x + ' ÷ ' + y + '. Speed is km per hour, so the km go on top: ' + y + ' ÷ ' + x + '.',
        M13: y + ' km is how far she rode in ' + x + ' hours, not in 1 hour. Divide by the ' + x + ' hours.',
        M17: 'You subtracted ' + y + ' − ' + x + '. To get km for each hour, divide: ' + y + ' ÷ ' + x + '.'
      },
      steps: [
        { label: 'How far had she ridden at the marked point (km)?', part: { kind: 'num', key: y }, hint: 'Read the second number of ' + C.pt(x, y) + '.' },
        { label: 'How many hours did that take?', part: { kind: 'num', key: x }, hint: 'Read the first number of ' + C.pt(x, y) + '.' },
        { label: 'km for 1 hour = ' + y + ' ÷ ' + x + ' =', part: { kind: 'num', key: v }, hint: 'Divide the distance by the time.' }
      ]
    };
  } });

  // the plan's drag-the-point item: here the student picks the right point from four drawn on the graph
  C.add({ id: 'RC-2d', skill: '6', level: 2, order: 2, type: 'interactive', gen: function (R) {
    var v, t; do { v = R.int(3, 6); t = R.int(2, 4); } while (v === t);
    var vt = v * t, top = Math.ceil((vt + 2) / 2) * 2;
    var cand = [{ x: t, y: vt, ok: true }, { x: t, y: v, tag: 'M13' }, { x: v, y: t }, { x: t, y: v + t, tag: 'M14' }];
    var order = R.shuffle([0, 1, 2, 3]), L = ['A', 'B', 'C', 'D'], pts = [], opts = [], right = '';
    order.forEach(function (ci, k) {
      var c = cand[ci]; pts.push({ x: c.x, y: c.y, l: L[k] });
      var o = { t: 'Point ' + L[k] }; if (c.ok) { o.ok = true; right = L[k]; } else if (c.tag) o.tag = c.tag;
      opts.push(o);
    });
    var stepOpts = opts.map(function (o) { return { t: o.t, ok: !!o.ok }; });
    return {
      stem: 'A cyclist rides at a steady ' + v + ' km per hour, starting at 0 km. Which point shows where she is after ' + t + ' hours?',
      fig: C.graph({ x: [0, 8], y: [0, top], xl: 'Time (h)', yl: 'Distance (km)', pts: pts, label: 'Four points A to D on a distance-time grid' }),
      think: 'For every 1 more hour she rides ' + v + ' km more.',
      parts: [{ kind: 'choice', label: 'The point', keep: true, opts: opts }],
      answer: 'Point ' + right + ' at ' + C.pt(t, vt),
      work: ['For every 1 more hour she rides ' + v + ' km more.', 'After ' + t + ' hours: ' + v + ' × ' + t + ' = ' + vt + ' km.', 'Time goes across, distance goes up: the point ' + C.pt(t, vt) + ' is <b>point ' + right + '</b>.'],
      why: {
        M13: 'That point is at ' + v + ' km, which is how far she rides in 1 hour. After ' + t + ' hours she has ridden ' + v + ' × ' + t + ' = ' + vt + ' km.',
        M14: 'That point adds ' + v + ' + ' + t + '. She rides ' + v + ' km in each of ' + t + ' hours, so multiply: ' + vt + ' km.'
      },
      steps: [
        { label: 'How far does she ride in 1 hour (km)?', part: { kind: 'num', key: v }, hint: 'That is her speed.' },
        { label: 'After ' + t + ' hours: ' + v + ' × ' + t + ' =', part: { kind: 'num', key: vt }, hint: v + ' km for each of the ' + t + ' hours.' },
        { label: 'Which point is at ' + C.pt(t, vt) + '?', part: { kind: 'choice', keep: true, opts: stepOpts }, hint: 'Go ' + t + ' across (time), then ' + vt + ' up (distance).' }
      ]
    };
  } });

  C.add({ id: 'RC-2b', skill: '6', level: 2, order: 3, type: 'MC', gen: function (R) {
    var u1, d, nBig, nSmall, bigBetter, uBig, uSmall, cBig, cSmall;
    do {
      u1 = R.int(6, 16) / 4; d = R.int(1, 4) / 4; nBig = R.int(6, 12); nSmall = R.int(2, 5); bigBetter = R.chance(0.7);
      uBig = bigBetter ? u1 : u1 + d; uSmall = bigBetter ? u1 + d : u1; cBig = nBig * uBig; cSmall = nSmall * uSmall;
    } while (bigBetter && cBig <= cSmall);
    var aBig = R.chance(0.5);
    var S = { A: aBig ? { n: nBig, c: cBig, u: uBig } : { n: nSmall, c: cSmall, u: uSmall }, B: aBig ? { n: nSmall, c: cSmall, u: uSmall } : { n: nBig, c: cBig, u: uBig } };
    var best = S.A.u < S.B.u ? 'A' : 'B', other = best === 'A' ? 'B' : 'A';
    var otherLowerTotal = S[other].c < S[best].c;
    function opt(k) { var o = { t: 'Store ' + k }; if (k === best) o.ok = true; else if (otherLowerTotal) o.tag = 'M14'; return o; }
    var why = {}; if (otherLowerTotal) why.M14 = 'Store ' + other + ' has the lower total price, but you get fewer bottles. Compare the price of 1 bottle: ' + money(S[best].u) + ' riyals at Store ' + best + ' and ' + money(S[other].u) + ' riyals at Store ' + other + '.';
    return {
      stem: 'Store A sells ' + S.A.n + ' bottles of water for ' + money(S.A.c) + ' riyals. Store B sells ' + S.B.n + ' bottles for ' + money(S.B.c) + ' riyals. Which is the better buy?',
      think: 'Find the cost of 1 bottle at each store.',
      parts: [{ kind: 'choice', label: 'The better buy is', keep: true, opts: [opt('A'), opt('B'), { t: 'They are the same value' }] }],
      answer: 'Store ' + best + ' (' + money(S[best].u) + ' riyals per bottle)',
      work: ['Store A: ' + money(S.A.c) + ' ÷ ' + S.A.n + ' = ' + money(S.A.u) + ' riyals per bottle', 'Store B: ' + money(S.B.c) + ' ÷ ' + S.B.n + ' = ' + money(S.B.u) + ' riyals per bottle', money(S[best].u) + ' is less than ' + money(S[other].u) + ', so <b>Store ' + best + '</b> is the better buy.' + (otherLowerTotal ? ' It costs more in total, but you get more bottles.' : '')],
      why: why,
      steps: [
        { label: 'Store A, cost of 1 bottle: ' + money(S.A.c) + ' ÷ ' + S.A.n + ' =', part: { kind: 'num', key: S.A.u }, hint: 'Divide the price by the number of bottles.' },
        { label: 'Store B, cost of 1 bottle: ' + money(S.B.c) + ' ÷ ' + S.B.n + ' =', part: { kind: 'num', key: S.B.u }, hint: 'Divide the price by the number of bottles.' },
        { label: 'Which store has the cheaper bottle?', part: { kind: 'choice', keep: true, opts: [{ t: 'Store A', ok: best === 'A' }, { t: 'Store B', ok: best === 'B' }] }, hint: 'The lower price for 1 bottle is the better buy.' }
      ]
    };
  } });

  C.add({ id: 'RC-2c', skill: '6', level: 3, type: 'MC', gen: function (R) {
    var d, r, fu; do { d = R.pick([20, 25, 40, 50, 100]); r = R.pick([0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2]); fu = Math.round(r * d * 100) / 100; } while (fu < 1 || fu === d);
    var opts = uniq([{ t: dec(r) + ' L per km', ok: true }, { t: dec(d / fu) + ' km per L', tag: 'M1' }, { t: dec(d - fu) + ' L per km', tag: 'M17' }, { t: dec(fu * d) + ' L per km', tag: 'M14' }]);
    return {
      stem: 'A car uses ' + dec(fu) + ' L of fuel every ' + d + ' km. What is the rate of change of fuel used per kilometre?',
      think: '"Per kilometre" means for every 1 more km.',
      parts: [{ kind: 'choice', label: 'The rate is', opts: opts }],
      answer: dec(r) + ' L per km',
      work: ['"Per kilometre" means for every 1 more km, so fuel goes on top.', dec(fu) + ' L ÷ ' + d + ' km = <b>' + dec(r) + ' L per km</b>'],
      why: {
        M1: d + ' ÷ ' + dec(fu) + ' = ' + dec(d / fu) + ' km per L tells how far 1 litre goes. The question asks litres for each km: ' + dec(fu) + ' ÷ ' + d + '.',
        M17: 'You subtracted ' + d + ' − ' + dec(fu) + '. A rate compares by dividing: ' + dec(fu) + ' ÷ ' + d + '.',
        M14: 'You multiplied ' + dec(fu) + ' × ' + d + '. Spread the fuel over the km: divide.'
      },
      steps: [
        { label: 'Fuel for 1 km = ' + dec(fu) + ' ÷ ' + d + ' =', part: { kind: 'num', key: r, tol: 0.001 }, hint: 'Divide the litres by the kilometres.' },
        { label: 'What are the units of your answer?', part: { kind: 'choice', keep: true, opts: [{ t: 'L per km', ok: true }, { t: 'km per L' }] }, hint: 'You divided litres by km.' }
      ]
    };
  } });

  /* ---------------- Skill 7 Slope as a rate on a graph ---------------- */
  C.add({ id: 'RC-3b', skill: '7', level: 3, order: 1, type: 'MC', gen: function (R) {
    var kind = R.pick(['pos', 'neg', 'high', 'zero', 'undef']), lines, m = 0, b = 0, k = 0, key;
    if (kind === 'pos') { m = R.pick([1, 2, 3, 0.5]); b = R.nz(-5, 4); lines = [{ m: m, b: b }]; key = 'Positive'; }
    else if (kind === 'neg') { m = R.pick([-1, -2, -3, -0.5]); b = R.nz(-4, 5); lines = [{ m: m, b: b }]; key = 'Negative'; }
    else if (kind === 'high') { m = R.pick([-0.5, -0.25]); b = R.int(6, 8); lines = [{ m: m, b: b }]; key = 'Negative'; }
    else if (kind === 'zero') { b = R.nz(-8, 8); lines = [{ m: 0, b: b }]; key = 'Zero'; }
    else { k = R.nz(-8, 8); lines = [{ p: [[k, -10], [k, 10]] }]; key = 'Undefined'; }
    var names = ['Positive', 'Negative', 'Zero', 'Undefined'];
    var opts = names.map(function (nm) {
      var o = { t: nm }; if (nm === key) { o.ok = true; return o; }
      if (key === 'Positive' && nm === 'Negative') o.tag = 'M2';
      if (key === 'Negative' && nm === 'Positive') o.tag = kind === 'high' ? 'M13' : 'M2';
      return o;
    });
    var work = kind === 'undef' ? ['The line goes straight up and down: x stays at ' + f(k) + '.', 'The change in x is 0, and you cannot divide by 0.', 'So the slope is <b>Undefined</b>.']
      : kind === 'zero' ? ['Read the line from left to right: y stays at ' + f(b) + '.', 'The change in y is 0, and 0 ÷ any run = 0.', 'So the slope is <b>zero</b>.']
      : ['Read the line from left to right.', 'As x increases, y goes ' + ud(m) + '.' + (kind === 'high' ? ' Being high on the grid does not matter.' : ''), 'So the slope is <b>' + key.toLowerCase() + '</b>.'];
    return {
      // (the self-test flags the lower-case word for "not defined", so the slope names are written as names)
      stem: 'Is the slope of this line Positive, Negative, Zero or Undefined?',
      fig: grid(lines, [], 'A line on a grid'),
      think: 'Read it left to right: up, down, flat, or straight up?',
      parts: [{ kind: 'choice', label: 'The slope is', keep: true, opts: opts }],
      answer: key,
      work: work,
      why: {
        M2: 'Read left to right, the line goes ' + ud(m) + ', so the slope is ' + (m < 0 ? 'negative' : 'positive') + '.',
        M13: 'The line sits high on the grid, but height is not slope. Read it left to right: it goes down, so the slope is negative.'
      },
      steps: [
        { label: 'Does the line go straight up and down?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: kind === 'undef' }, { t: 'No', ok: kind !== 'undef' }] }, hint: 'A vertical line has the same x everywhere.' },
        { label: kind === 'undef' ? 'The change in x is 0. So the slope is' : 'Read it left to right: does y go up, down or stay the same? So the slope is', part: { kind: 'choice', keep: true, opts: names.map(function (nm) { return { t: nm, ok: nm === key }; }) }, hint: 'Up is Positive, down is Negative, flat is Zero, straight up and down is Undefined.' }
      ]
    };
  } });

  C.add({ id: 'RC-3a', skill: '7', level: 3, order: 2, type: 'NE', gen: function (R) {
    var m = R.pick([1, -1, 2, -2, 3, -3, 0.5, -0.5]), P = twoPts(R, m);
    return {
      stem: 'The line goes through the two marked grid points A and B. What is its slope?',
      fig: grid([{ m: m, b: P.b }], [{ x: P.x1, y: P.y1, l: 'A ' + C.pt(P.x1, P.y1) }, { x: P.x2, y: P.y2, l: 'B ' + C.pt(P.x2, P.y2) }], 'Line through A ' + C.pt(P.x1, P.y1) + ' and B ' + C.pt(P.x2, P.y2)),
      think: 'Rise over run: change in y on top.',
      parts: [{ kind: 'num', label: 'Slope', key: m, wrong: wr(m, [{ v: 1 / m, tag: 'M1' }, { v: -m, tag: 'M2' }, { v: P.b, tag: 'M12' }, { v: P.y2, tag: 'M13' }, { v: P.y1, tag: 'M13' }]) }],
      answer: f(m),
      work: slopeWork(P, m),
      why: {
        M1: m1Why(P),
        M2: m2Why(m),
        M12: f(P.b) + ' is where the line crosses the y-axis. That is a starting point, not the slope. Slope is rise ÷ run: ' + f(P.dy) + ' ÷ ' + f(P.dx) + '.',
        M13: 'That is the height of a point, not a change. Slope compares two changes: rise ' + f(P.dy) + ' ÷ run ' + f(P.dx) + '.'
      },
      steps: [
        { label: 'Rise: from A to B, y changes by ' + f(P.y2) + ' − ' + par(P.y1) + ' =', part: { kind: 'num', key: P.dy }, hint: 'End minus start. Down is negative.' },
        { label: 'Run: x changes by ' + f(P.x2) + ' − ' + par(P.x1) + ' =', part: { kind: 'num', key: P.dx }, hint: 'End minus start, in the same order as the y-values.' },
        { label: 'Slope = rise ÷ run = ' + f(P.dy) + ' ÷ ' + f(P.dx) + ' =', part: { kind: 'num', key: m }, hint: 'The change in y goes on top.' }
      ]
    };
  } });

  // the plan's drag-the-corner slope triangle: here the triangle is drawn and the student reads run, rise and slope
  C.add({ id: 'RC-3e', skill: '7', level: 3, order: 3, type: 'interactive', gen: function (R) {
    var m = R.pick([1, -1, 2, -2, 3, -3, 0.5, -0.5]), P = twoPts(R, m, rr(m)[1] === 1 ? 2 : 1, 2);
    var tri = { seg: [[P.x1, P.y1], [P.x2, P.y1], [P.x2, P.y2]], color: C.COL.line2, w: 2.5, dash: true };
    return {
      stem: 'A slope triangle (orange, dashed) is drawn on the line from point A to point B. Count its run and rise, then find the slope.',
      fig: grid([{ m: m, b: P.b }, tri], [{ x: P.x1, y: P.y1, l: 'A' }, { x: P.x2, y: P.y2, l: 'B' }], 'Line with a slope triangle from ' + C.pt(P.x1, P.y1) + ' to ' + C.pt(P.x2, P.y2)),
      think: 'Run: how far right. Rise: how far up (+) or down (−).',
      parts: [
        { kind: 'num', label: 'Run (squares right)', key: P.dx, wrong: wr(P.dx, [{ v: -P.dx, tag: 'M2' }, { v: P.dy, tag: 'M1' }]) },
        { kind: 'num', label: 'Rise (up +, down −)', key: P.dy, wrong: wr(P.dy, [{ v: -P.dy, tag: 'M2' }, { v: P.dx, tag: 'M1' }]) },
        { kind: 'num', label: 'Slope', key: m, wrong: wr(m, [{ v: P.dx / P.dy, tag: 'M1' }, { v: P.dy, tag: 'M13' }, { v: -m, tag: 'M2' }]) }
      ],
      answer: 'Run ' + f(P.dx) + ', rise ' + f(P.dy) + ', slope ' + f(m),
      work: ['Run: from A go ' + f(P.dx) + ' right.', 'Rise: then go ' + f(Math.abs(P.dy)) + ' ' + ud(P.dy) + ' to B, so the rise is ' + f(P.dy) + '.', 'Slope = rise ÷ run = ' + f(P.dy) + ' ÷ ' + f(P.dx) + ' = <b>' + f(m) + '</b>. Any slope triangle on this line gives the same answer.'],
      why: {
        M1: m1Why(P),
        M13: f(P.dy) + ' is the rise alone, the height of the triangle. Slope compares the rise to the run: ' + f(P.dy) + ' ÷ ' + f(P.dx) + '.',
        M2: m2Why(m)
      },
      steps: [
        { label: 'Run: how many squares right from A to the corner?', part: { kind: 'num', key: P.dx }, hint: 'Count along the flat side of the triangle.' },
        { label: 'Rise: from the corner up (+) or down (−) to B?', part: { kind: 'num', key: P.dy }, hint: 'Count along the upright side. Going down is negative.' },
        { label: 'Slope = rise ÷ run = ' + f(P.dy) + ' ÷ ' + f(P.dx) + ' =', part: { kind: 'num', key: m }, hint: 'Rise on top, run on the bottom.' }
      ]
    };
  } });

  C.add({ id: 'RC-3c', skill: '7', level: 3, order: 4, type: 'MC', gen: function (R) {
    var mP = R.int(1, 2), mQ = R.int(mP + 1, 3), bP = R.int(2, 6), bQ = R.int(-6, bP - 3);
    if (bQ > 3) bQ = 3;
    return {
      stem: 'Line P crosses the y-axis higher than line Q. Which line has the greater slope?',
      fig: grid([{ m: mP, b: bP }, { m: mQ, b: bQ, color: C.COL.line2 }], [{ x: 0, y: bP }, { x: -4, y: bP - 4 * mP, l: 'P' }, { x: 0, y: bQ, c: C.COL.line2 }, { x: 2, y: bQ + 2 * mQ, l: 'Q', c: C.COL.line2 }], 'Two lines P and Q'),
      think: 'Slope is how steep, not where the line starts.',
      parts: [{ kind: 'choice', label: 'Greater slope', keep: true, opts: [{ t: 'Line P', tag: 'M12' }, { t: 'Line Q', ok: true }, { t: 'They are the same' }, { t: 'You can\'t tell' }] }],
      answer: 'Line Q (slope ' + mQ + ' vs ' + mP + ')',
      work: ['Line P: for every 1 more x, y goes up ' + mP + '. Its slope is ' + mP + '.', 'Line Q: for every 1 more x, y goes up ' + mQ + '. Its slope is ' + mQ + '.', mQ + ' > ' + mP + ', so <b>line Q</b> has the greater slope, even though P starts higher.'],
      why: { M12: 'Line P crosses the y-axis higher (at ' + bP + '), but that is where it starts, not how steep it is. Q rises ' + mQ + ' for every 1 step right; P rises only ' + mP + '.' },
      steps: [
        { label: 'Line P: for every 1 more x, y goes up by', part: { kind: 'num', key: mP }, hint: 'Start where P crosses the y-axis at ' + bP + ' and go 1 step right.' },
        { label: 'Line Q: for every 1 more x, y goes up by', part: { kind: 'num', key: mQ }, hint: 'Start where Q crosses the y-axis at ' + f(bQ) + ' and go 1 step right.' },
        { label: 'So the greater slope is', part: { kind: 'choice', keep: true, opts: [{ t: 'Line P' }, { t: 'Line Q', ok: true }] }, hint: 'The bigger rise for each step right is the greater slope.' }
      ]
    };
  } });

  C.add({ id: 'RC-3d', skill: '7', level: 4, type: 'TT', gen: function (R) {
    var m, p, b, x1, x2, y1, y2, vals;
    do {
      m = R.pick([2, -2, 3, -3, 0.5, -0.5, 1.5, -2 / 3]); p = rr(m); b = R.nz(-6, 6);
      x1 = p[1] * R.int(-3, 2); x2 = x1 + p[1] * R.int(1, 2); y1 = b + m * x1; y2 = b + m * x2;
      vals = [f(m), f(b), f(1 / m), f(y1)];
    } while (x1 === 0 || x2 === 0 || y1 === -1 || y2 === -1 || Math.abs(x1) > 9 || Math.abs(x2) > 9 || Math.abs(y1) > 9 || Math.abs(y2) > 9 || vals.some(function (v, i) { return vals.indexOf(v) !== i; }));
    var P = { x1: x1, y1: y1, x2: x2, y2: y2, dx: x2 - x1, dy: y2 - y1, b: b };
    return {
      stem: 'What is the slope of this line, and why?',
      fig: grid([{ m: m, b: b }], [{ x: x1, y: y1, l: C.pt(x1, y1) }, { x: x2, y: y2, l: C.pt(x2, y2) }], 'Line through ' + C.pt(x1, y1) + ' and ' + C.pt(x2, y2)),
      parts: [
        { kind: 'choice', label: 'The slope is', opts: [{ t: f(m), ok: true }, { t: f(b), tag: 'M12' }, { t: f(1 / m), tag: 'M1' }, { t: f(y1), tag: 'M13' }] },
        { kind: 'choice', label: 'Because it is', opts: [{ t: 'the change in y ÷ the change in x between two points', ok: true }, { t: 'where the line crosses the y-axis', tag: 'M12' }, { t: 'the height of a point on the line', tag: 'M13' }] }
      ],
      answer: f(m) + ', because slope = change in y ÷ change in x',
      work: slopeWork(P, m),
      why: {
        M1: m1Why(P),
        M12: f(b) + ' is where the line crosses the y-axis: a starting value, not the slope.',
        M13: f(y1) + ' is the height of a point. Slope compares two changes, not one height.'
      },
      steps: [
        { label: 'Rise: ' + f(y2) + ' − ' + par(y1) + ' =', part: { kind: 'num', key: P.dy }, hint: 'Change in y, end minus start.' },
        { label: 'Run: ' + f(x2) + ' − ' + par(x1) + ' =', part: { kind: 'num', key: P.dx }, hint: 'Change in x, in the same order.' },
        { label: 'Slope = ' + f(P.dy) + ' ÷ ' + f(P.dx) + ' =', part: { kind: 'num', key: m }, hint: 'Rise on top.' },
        { label: 'So slope means', part: { kind: 'choice', keep: true, opts: [{ t: 'change in y ÷ change in x', ok: true }, { t: 'where the line crosses the y-axis' }, { t: 'the height of a point' }] }, hint: 'You just divided two changes.' }
      ]
    };
  } });

  /* ---------------- Skill 8 Slope from two points ---------------- */
  // two points with slope m (no graph), neither at the origin, line not through the origin, second x not 0
  function ptsFor(R, m) {
    var p = rr(m), x1, y1, x2, y2;
    do { x1 = R.int(-6, 6); x2 = x1 + p[1] * R.nz(-3, 3); y1 = R.int(-8, 8); y2 = y1 + m * (x2 - x1); }
    while (Math.abs(x2) > 6 || Math.abs(y2) > 9 || x2 === 0 || (x1 === 0 && y1 === 0) || Math.abs(y1 - m * x1) < 1e-9);
    return { x1: x1, y1: y1, x2: x2, y2: y2, dx: x2 - x1, dy: y2 - y1, b: y1 - m * x1 };
  }

  C.add({ id: 'RC-4a', skill: '8', level: 4, order: 1, type: 'NE', gen: function (R) {
    var m = R.pick([1, -1, 2, -2, 3, -3, 0.5, -0.5]), P = ptsFor(R, m);
    return {
      stem: 'A line passes through ' + C.pt(P.x1, P.y1) + ' and ' + C.pt(P.x2, P.y2) + '. What is its slope?',
      think: 'Change in y ÷ change in x, both in the same order.',
      parts: [{ kind: 'num', label: 'Slope', key: m, wrong: wr(m, [{ v: P.dx / P.dy, tag: 'M1' }, { v: -m, tag: 'M2' }, { v: P.dy - P.dx, tag: 'M17' }, { v: P.y2 / P.x2, tag: 'M4' }]) }],
      answer: f(m),
      work: ['Change in y: ' + f(P.y2) + ' − ' + par(P.y1) + ' = ' + f(P.dy), 'Change in x: ' + f(P.x2) + ' − ' + par(P.x1) + ' = ' + f(P.dx), 'Slope compares them by dividing: ' + f(P.dy) + ' ÷ ' + par(P.dx) + ' = <b>' + f(m) + '</b>'],
      why: {
        M1: 'You found run over rise: ' + f(P.dx) + ' ÷ ' + par(P.dy) + '. Slope is the change in y (' + f(P.dy) + ') divided by the change in x (' + f(P.dx) + ').',
        M2: 'The size is right, but the sign is not. Subtract the y\'s and the x\'s in the same order: (' + f(P.y2) + ' − ' + par(P.y1) + ') ÷ (' + f(P.x2) + ' − ' + par(P.x1) + ').',
        M17: 'You subtracted the changes: ' + f(P.dy) + ' − ' + par(P.dx) + '. Slope divides them: ' + f(P.dy) + ' ÷ ' + par(P.dx) + '.',
        M4: 'You divided ' + f(P.y2) + ' ÷ ' + f(P.x2) + ' at one point. That only works for a line through (0, 0). Use the changes between the two points.'
      },
      steps: [
        { label: 'Change in y: ' + f(P.y2) + ' − ' + par(P.y1) + ' =', part: { kind: 'num', key: P.dy }, hint: 'Second y minus first y. Subtracting a negative is adding.' },
        { label: 'Change in x: ' + f(P.x2) + ' − ' + par(P.x1) + ' =', part: { kind: 'num', key: P.dx }, hint: 'Second x minus first x, the same order as the y\'s.' },
        { label: 'Slope = ' + f(P.dy) + ' ÷ ' + par(P.dx) + ' =', part: { kind: 'num', key: m }, hint: 'Change in y on top. Keep the signs.' }
      ]
    };
  } });

  // the plan's drag-point-B item: here the student types the coordinates of a point B (any correct B scores)
  C.add({ id: 'RC-4i', skill: '8', level: 4, order: 2, type: 'interactive', gen: function (R) {
    var m = R.pick([1, -1, 2, -2, 0.5, -0.5]), p = rr(m), a = R.nz(-5, 4), b = R.pick([-5, -4, -3, -2, 1, 2, 3, 4, 5]), xb = a + p[1], yb = b + p[0];
    function check(vals) {
      var X = C.parseNum(vals[0]), Y = C.parseNum(vals[1]);
      if (!isFinite(X) || !isFinite(Y) || C.near(X, a, 1e-9)) return { ok: false };
      var s = (Y - b) / (X - a);
      if (C.near(s, m, 1e-6)) return { ok: true };
      if (C.near(s, -m, 1e-6)) return { ok: false, tag: 'M2' };
      if (C.near(s, 1 / m, 1e-6)) return { ok: false, tag: 'M1' };
      return { ok: false };
    }
    return {
      stem: 'Point A is fixed at ' + C.pt(a, b) + '. Give a point B so that the line through A and B has slope ' + f(m) + '.',
      fig: grid([], [{ x: a, y: b, l: 'A ' + C.pt(a, b) }], 'Point A at ' + C.pt(a, b)),
      think: 'Slope ' + f(m) + ': for every ' + p[1] + ' right, ' + f(Math.abs(p[0])) + ' ' + ud(p[0]) + '.',
      parts: [{ kind: 'num', label: 'B: x', key: xb }, { kind: 'num', label: 'B: y', key: yb }],
      check: check,
      answer: 'For example B = ' + C.pt(xb, yb),
      work: ['Slope ' + f(m) + ' means: for every ' + p[1] + ' right, y goes ' + ud(p[0]) + ' ' + f(Math.abs(p[0])) + '.', 'From A ' + C.pt(a, b) + ', move ' + p[1] + ' right and ' + f(Math.abs(p[0])) + ' ' + ud(p[0]) + ': B = <b>' + C.pt(xb, yb) + '</b>.', 'Check: rise ÷ run = ' + f(p[0]) + ' ÷ ' + p[1] + ' = ' + f(m) + '. Repeating the move (or going back) gives other correct points.'],
      why: {
        M2: 'Your points give slope ' + f(-m) + '; the target was ' + f(m) + '. Go ' + ud(p[0]) + ', not ' + ud(-p[0]) + ', as you move right.',
        M1: 'Your points give slope ' + f(1 / m) + ', run over rise. Move ' + p[1] + ' right and ' + f(Math.abs(p[0])) + ' ' + ud(p[0]) + ': the rise goes with the y.'
      },
      steps: [
        { label: 'Slope ' + f(m) + ': move ' + p[1] + ' right from A. B\'s x = ' + f(a) + ' + ' + p[1] + ' =', part: { kind: 'num', key: xb }, hint: 'The run is ' + p[1] + '.' },
        { label: 'Then go ' + ud(p[0]) + ' ' + f(Math.abs(p[0])) + '. B\'s y = ' + f(b) + ' ' + C.term(p[0]) + ' =', part: { kind: 'num', key: yb }, hint: 'The rise is ' + f(p[0]) + '.' }
      ]
    };
  } });

  C.add({ id: 'RC-4e', skill: '8', level: 4, order: 3, type: 'TT', gen: function (R) {
    var m, P, vals;
    do { m = R.pick([2, -2, 3, -3, 0.5, -0.5, 1.5, -2 / 3]); P = ptsFor(R, m); vals = [f(m), f(P.y2 / P.x2), f(P.dy - P.dx), f(P.dx / P.dy)]; }
    while (vals.some(function (v, i) { return vals.indexOf(v) !== i; }));
    return {
      stem: 'What is the slope of the line through ' + C.pt(P.x1, P.y1) + ' and ' + C.pt(P.x2, P.y2) + ', and why?',
      parts: [
        { kind: 'choice', label: 'The slope is', opts: [{ t: f(m), ok: true }, { t: f(P.y2 / P.x2), tag: 'M4' }, { t: f(P.dy - P.dx), tag: 'M17' }, { t: f(P.dx / P.dy), tag: 'M1' }] },
        { kind: 'choice', label: 'Because you', opts: [{ t: 'divide the change in y by the change in x', ok: true }, { t: 'divide the last y by the last x', tag: 'M4' }, { t: 'subtract the changes', tag: 'M17' }] }
      ],
      answer: f(m) + ', because you divide the change in y by the change in x',
      work: ['Change in y: ' + f(P.y2) + ' − ' + par(P.y1) + ' = ' + f(P.dy), 'Change in x: ' + f(P.x2) + ' − ' + par(P.x1) + ' = ' + f(P.dx), 'Slope compares the two changes by dividing: ' + f(P.dy) + ' ÷ ' + par(P.dx) + ' = <b>' + f(m) + '</b>. ' + f(P.y2) + ' ÷ ' + par(P.x2) + ' only works for a line through (0, 0).'],
      why: {
        M4: f(P.y2) + ' ÷ ' + par(P.x2) + ' uses one point. That only works for a line through (0, 0); this one is not.',
        M17: 'You subtracted the changes: ' + f(P.dy) + ' − ' + par(P.dx) + '. Slope divides them.',
        M1: 'You found run over rise: ' + f(P.dx) + ' ÷ ' + par(P.dy) + '. The change in y goes on top.'
      },
      steps: [
        { label: 'Change in y: ' + f(P.y2) + ' − ' + par(P.y1) + ' =', part: { kind: 'num', key: P.dy }, hint: 'Second y minus first y.' },
        { label: 'Change in x: ' + f(P.x2) + ' − ' + par(P.x1) + ' =', part: { kind: 'num', key: P.dx }, hint: 'Second x minus first x.' },
        { label: 'Slope = ' + f(P.dy) + ' ÷ ' + par(P.dx) + ' =', part: { kind: 'num', key: m }, hint: 'Divide the changes; change in y on top.' }
      ]
    };
  } });

  // the plan's "tap the step" item: here a choice of which step the other student got wrong
  C.add({ id: 'RC-4d', skill: '8', level: 4, order: 4, type: 'MC', gen: function (R) {
    var err, m, P, wrongVal;
    do {
      err = R.pick(['M2', 'M1', 'M17']); m = R.pick([1, -1, 2, -2, 3, -3, 0.5, -0.5, 1.5, -2 / 3]); P = ptsFor(R, m);
      wrongVal = err === 'M2' ? -m : err === 'M1' ? P.dx / P.dy : P.dy - P.dx;
    } while (C.near(wrongVal, m));
    var n1 = R.name(), n2; do { n2 = R.name(); } while (n2 === n1);
    var good = [
      'Change in y: ' + f(P.y2) + ' − ' + par(P.y1) + ' = ' + f(P.dy),
      'Change in x: ' + f(P.x2) + ' − ' + par(P.x1) + ' = ' + f(P.dx),
      'Slope = ' + f(P.dy) + ' ÷ ' + par(P.dx) + ' = ' + f(m)
    ];
    var bad = good.slice(), errStep, reason;
    if (err === 'M2') { bad[1] = 'Change in x: ' + f(P.x1) + ' − ' + par(P.x2) + ' = ' + f(-P.dx); bad[2] = 'Slope = ' + f(P.dy) + ' ÷ ' + par(-P.dx) + ' = ' + f(-m); errStep = 2; reason = 'subtracted the y\'s in one order and the x\'s in the other, so the sign flipped'; }
    else if (err === 'M1') { bad[2] = 'Slope = ' + f(P.dx) + ' ÷ ' + par(P.dy) + ' = ' + f(P.dx / P.dy); errStep = 3; reason = 'found run over rise: the change in x went on top'; }
    else { bad[2] = 'Slope = ' + f(P.dy) + ' − ' + par(P.dx) + ' = ' + f(P.dy - P.dx); errStep = 3; reason = 'subtracted the changes instead of dividing them'; }
    var firstRight = R.chance(0.5), right = firstRight ? n1 : n2, wrongName = firstRight ? n2 : n1;
    function box(nm, lines) { return '<div style="flex:1 1 220px;border:1px solid #DCE2EE;border-radius:10px;padding:8px 12px;background:#fff"><b>' + nm + '</b><ol style="margin:6px 0 0 20px;padding:0">' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ol></div>'; }
    var why = {}; why[err] = wrongName + ' ' + reason + '. ' + (err === 'M2' ? 'Keep the same order: (' + f(P.y2) + ' − ' + par(P.y1) + ') ÷ (' + f(P.x2) + ' − ' + par(P.x1) + ').' : 'Slope = change in y ÷ change in x = ' + f(P.dy) + ' ÷ ' + par(P.dx) + '.') + ' The mistake is in step ' + errStep + '.';
    return {
      stem: 'Two students found the slope of the line through ' + C.pt(P.x1, P.y1) + ' and ' + C.pt(P.x2, P.y2) + '. Which student is right, and in which step did the other student go wrong?',
      fig: '<div style="display:flex;flex-wrap:wrap;gap:12px">' + box(n1, firstRight ? good : bad) + box(n2, firstRight ? bad : good) + '</div>',
      parts: [
        { kind: 'choice', label: 'Who is right?', keep: true, opts: [{ t: n1, ok: firstRight, tag: firstRight ? undefined : err }, { t: n2, ok: !firstRight, tag: firstRight ? err : undefined }] },
        { kind: 'choice', label: 'The other student went wrong in', keep: true, opts: [1, 2, 3].map(function (k) { return k === errStep ? { t: 'Step ' + k, ok: true } : { t: 'Step ' + k, tag: err }; }) }
      ],
      answer: right + ' is right; ' + wrongName + ' went wrong in step ' + errStep,
      work: good.slice(0, 2).concat(['Slope = ' + f(P.dy) + ' ÷ ' + par(P.dx) + ' = <b>' + f(m) + '</b>, so <b>' + right + '</b> is right.', wrongName + ' ' + reason + ' (step ' + errStep + ').']),
      why: why,
      steps: [
        { label: 'Change in y: ' + f(P.y2) + ' − ' + par(P.y1) + ' =', part: { kind: 'num', key: P.dy }, hint: 'Second y minus first y.' },
        { label: 'Change in x: ' + f(P.x2) + ' − ' + par(P.x1) + ' =', part: { kind: 'num', key: P.dx }, hint: 'Second x minus first x, the same order.' },
        { label: 'Slope = ' + f(P.dy) + ' ÷ ' + par(P.dx) + ' =', part: { kind: 'num', key: m }, hint: 'Divide; change in y on top.' },
        { label: 'Whose answer matches?', part: { kind: 'choice', keep: true, opts: [{ t: n1, ok: firstRight }, { t: n2, ok: !firstRight }] }, hint: 'Look at the last line of each solution.' }
      ]
    };
  } });

  C.add({ id: 'RC-4f', skill: '8', level: 5, type: 'EG', gen: function (R) {
    var m = R.pick([1, -1, 2, -2, 3, -3, 0.5, -0.5]), p = rr(m), x1, y1;
    do { x1 = R.int(-4, 4); y1 = R.int(-5, 5); } while (x1 === 0 && y1 === 0);
    var x2 = x1 + p[1], y2 = y1 + p[0];
    if (x2 === 0 && y2 === 0) { x1 += 1; x2 += 1; }
    function check(vals) {
      var v = vals.map(C.parseNum);
      if (v.some(function (n) { return !isFinite(n); })) return { ok: false };
      if ((v[0] === 0 && v[1] === 0) || (v[2] === 0 && v[3] === 0) || C.near(v[0], v[2], 1e-9)) return { ok: false };
      var s = (v[3] - v[1]) / (v[2] - v[0]);
      if (C.near(s, m, 1e-6)) return { ok: true };
      if (C.near(s, -m, 1e-6)) return { ok: false, tag: 'M2' };
      if (C.near(s, 1 / m, 1e-6)) return { ok: false, tag: 'M1' };
      return { ok: false };
    }
    return {
      stem: 'Give two points on a line with slope ' + f(m) + '. Neither point can be (0, 0).',
      think: 'Pick any start, then move run right and rise up or down.',
      parts: [{ kind: 'num', label: 'Point 1: x', key: x1 }, { kind: 'num', label: 'Point 1: y', key: y1 }, { kind: 'num', label: 'Point 2: x', key: x2 }, { kind: 'num', label: 'Point 2: y', key: y2 }],
      check: check,
      answer: 'For example ' + C.pt(x1, y1) + ' and ' + C.pt(x2, y2),
      work: ['Start at any point, for example ' + C.pt(x1, y1) + '.', 'Slope ' + f(m) + ' means: for every ' + p[1] + ' right, y goes ' + ud(p[0]) + ' ' + f(Math.abs(p[0])) + '. That gives ' + C.pt(x2, y2) + '.', 'Check: (' + f(y2) + ' − ' + par(y1) + ') ÷ (' + f(x2) + ' − ' + par(x1) + ') = ' + f(p[0]) + ' ÷ ' + p[1] + ' = <b>' + f(m) + '</b>'],
      why: {
        M2: 'Your points give slope ' + f(-m) + '; the target was ' + f(m) + '. Moving right, y should go ' + ud(p[0]) + '.',
        M1: 'Your points give slope ' + f(1 / m) + ', run over rise. The rise (' + f(p[0]) + ') goes with the y-values, the run (' + p[1] + ') with the x-values.'
      },
      steps: [
        { label: 'Start at ' + C.pt(x1, y1) + '. Slope ' + f(m) + ': move ' + p[1] + ' right. New x = ' + f(x1) + ' + ' + p[1] + ' =', part: { kind: 'num', key: x2 }, hint: 'The run is ' + p[1] + '.' },
        { label: 'Then go ' + ud(p[0]) + ' ' + f(Math.abs(p[0])) + '. New y = ' + f(y1) + ' ' + C.term(p[0]) + ' =', part: { kind: 'num', key: y2 }, hint: 'The rise is ' + f(p[0]) + '.' }
      ]
    };
  } });
})();
