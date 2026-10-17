/* Climb question bank: qualitative graphs.
   Skill 18 (describe and match: QG-2a, QG-3a, QG-3c, QG-3b, QG-4a, QG-4b) and skill 19 (rates: QG-5a, QG-5b, QG-5c, QG-6a).
   The graphs have axis titles but no numbers on the axes: students read shape, direction and steepness.
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt;

  // copy a graph spec and add to it (no numbers on the axes unless asked)
  function spec(base, more) {
    var o = { nums: false }, k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) o[k] = base[k];
    for (k in (more || {})) if (Object.prototype.hasOwnProperty.call(more, k)) o[k] = more[k];
    return o;
  }
  // a small graph of one broken-line path, for answer options and cards
  function mini(win, path, label, more) {
    return C.graph(spec(win, spec({ size: 170, lines: [{ seg: path }], label: label }, more)));
  }
  // slopes of the pieces between corners, left to right
  function slopes(cur) {
    var p = cur.slice().sort(function (a, b) { return a[0] - b[0]; }), s = [];
    for (var i = 0; i < p.length - 1; i++) s.push((p[i + 1][1] - p[i][1]) / (p[i + 1][0] - p[i][0]));
    return { p: p, s: s };
  }
  function word(d) { return d > 0 ? 'up' : d < 0 ? 'down' : 'flat'; }
  var DIR3 = ['Increasing', 'Decreasing', 'Constant'];
  function dirOpts(d) { return [{ t: 'Increasing', ok: d > 0 }, { t: 'Decreasing', ok: d < 0 }, { t: 'Constant', ok: d === 0 }]; }

  /* ---------------- Skill 18: describe and match ---------------- */
  C.add({ id: 'QG-2a', skill: '18', level: 2, type: 'MC', gen: function (R) {
    var types, xs, ys, ok, j;
    do {
      types = R.shuffle(['up', 'down', 'flat']);
      xs = [0]; ys = [R.int(1, 7)];
      for (j = 0; j < 3; j++) {
        xs.push(xs[j] + R.int(2, 4));
        ys.push(ys[j] + (types[j] === 'up' ? R.int(2, 4) : types[j] === 'down' ? -R.int(2, 4) : 0));
      }
      ok = ys.every(function (y) { return y >= 1 && y <= 7; });
      var top = Math.max.apply(null, ys);
      // the highest point sits on the flat or falling piece, not only at the top of the rise
      if (ok) ok = types.some(function (t, k) { return t !== 'up' && (ys[k] === top || ys[k + 1] === top); });
    } while (!ok);
    var L = ['A', 'B', 'C', 'D'], top2 = Math.max.apply(null, ys), up = types.indexOf('up');
    var hi = types.indexOf('flat'); if (ys[hi] !== top2) hi = types.indexOf('down');
    function nm(k) { return 'From ' + L[k] + ' to ' + L[k + 1]; }
    var opts = [0, 1, 2].map(function (k) { return k === up ? { t: nm(k), ok: true } : k === hi ? { t: nm(k), tag: 'M13' } : { t: nm(k) }; });
    opts.push({ t: 'From A to D' });
    var pts = xs.map(function (x, k) { return { x: x, y: ys[k], l: L[k] }; });
    return {
      stem: 'Over which part of the graph is the function increasing?',
      fig: C.graph({ x: [0, 12], y: [0, 8], nums: false, xl: 'Input x', yl: 'Output y', size: 340, lines: [{ seg: xs.map(function (x, k) { return [x, ys[k]]; }) }], pts: pts, label: 'A graph made of three straight pieces through the points A, B, C and D' }),
      think: 'Move left to right. Where does the graph go up?',
      parts: [{ kind: 'choice', label: 'Increasing', opts: opts }],
      why: { M13: nm(hi) + ' is the highest part of the graph, but there it is ' + (types[hi] === 'flat' ? 'flat' : 'going down') + '. Increasing means going up as you move right, wherever that happens.' },
      answer: nm(up),
      work: ['Increasing means y goes up as x goes to the right.', 'Read each piece left to right: ' + types.map(function (t, k) { return L[k] + ' to ' + L[k + 1] + ' goes ' + t; }).join(', ') + '.', 'The graph rises <b>from ' + L[up] + ' to ' + L[up + 1] + '</b>, even though it is not the highest part.'],
      steps: [
        { label: 'Increasing means that, moving to the right, the graph goes', part: { kind: 'choice', keep: true, opts: [{ t: 'up', ok: true }, { t: 'down' }, { t: 'flat' }] }, hint: 'The outputs get bigger as the inputs get bigger.' },
        { label: 'Which piece goes up?', part: { kind: 'choice', keep: true, opts: [0, 1, 2].map(function (k) { return { t: L[k] + ' to ' + L[k + 1], ok: k === up }; }) }, hint: 'Follow each piece from its left end to its right end. Height does not matter, direction does.' }
      ]
    };
  } });

  C.add({ id: 'QG-3a', skill: '18', level: 3, order: 1, type: 'MC', gen: function (R) {
    var nmS = R.name(), t1 = R.int(2, 3), n = R.int(2, 3), t3 = R.int(1, t1 - 1), h = R.int(5, 7);
    var win = { x: [0, 10], y: [0, 8], xl: 'Time', yl: 'Distance from home' };
    var right = [[0, 0], [t1, h], [t1 + n, h], [t1 + n + t3, 0], [10, 0]];
    var slow = [[0, 0], [t1, h], [t1 + n, h], [10, 0]];
    var route = [[1, 1], [4, h], [8, h], [6, 2], [1, 1]];
    var nostay = [[0, 0], [t1, h], [t1 + t3, 0], [10, 0]];
    var opts = [
      { t: mini(win, right, 'Graph: rises, flat, falls steeply to 0'), ok: true },
      { t: mini(win, slow, 'Graph: rises, flat, falls slowly to 0') },
      { t: mini(win, route, 'Graph: a closed loop like a route on a map'), tag: 'M10' },
      { t: mini(win, nostay, 'Graph: rises, then falls to 0 with no flat part') }
    ];
    return {
      stem: nmS + ' walks to the shop, stays there for ' + n + ' minutes, then walks home faster. Which graph shows ' + nmS + '\'s distance from home against time?',
      think: 'Read the axes: up means farther from home.',
      parts: [{ kind: 'choice', label: 'Graph', opts: opts }],
      why: { M10: 'That graph is drawn like the route on a map. A distance-time graph shows how far from home ' + nmS + ' is as time passes, so it can never go back in time.' },
      answerFig: C.graph(spec(win, { size: 300, lines: [{ seg: right }], label: 'Rises, flat, then falls steeply back to 0' })),
      answer: 'The graph that rises, stays flat, then falls more steeply back to 0',
      work: ['The graph shows distance from home as time passes, not the path.', 'Walking to the shop: distance <b>rises</b>. In the shop: <b>flat</b>.', 'Walking home faster: distance falls back to 0, <b>more steeply</b> than it rose.'],
      steps: [
        { label: 'While ' + nmS + ' is in the shop, the distance from home', part: { kind: 'choice', keep: true, opts: [{ t: 'goes up' }, { t: 'goes down' }, { t: 'stays the same', ok: true }] }, hint: 'Standing still means the distance does not change: a flat piece.' },
        { label: 'Walking home faster means the falling piece is ___ than the rising piece.', part: { kind: 'choice', keep: true, opts: [{ t: 'steeper', ok: true }, { t: 'less steep' }] }, hint: 'Faster means more distance in the same time: a steeper line.' },
        { label: 'At the end, ' + nmS + '\'s distance from home is', part: { kind: 'num', key: 0 }, hint: nmS + ' is back home.' }
      ]
    };
  } });

  // graph the story: the student drags 5 corners up or down at fixed times
  C.add({ id: 'QG-3c', skill: '18', level: 3, order: 2, type: 'interactive', ia: true, gen: function (R) {
    var nmS = R.name(), a = R.int(3, 4), st = R.int(2, 3), run = R.int(1, a - 1), h = R.int(4, 7);
    if (a + st + run > 9) run = 9 - a - st;
    var T = [0, a, a + st, a + st + run, 10];
    var key = [[0, 0], [a, h], [a + st, h], [a + st + run, 0], [10, 0]];
    var grid = { x: [0, 10], y: [0, 8], nums: false, xl: 'Time', yl: 'Distance from home', size: 400, label: 'Distance from home against time' };
    return {
      stem: nmS + ' cycles to the park, stops there a while, then cycles home faster and stays home. Drag the 5 corners up or down to graph ' + nmS + '\'s distance from home against time.',
      think: 'Cycling out, at the park, cycling back, home: what does each do to the distance?',
      parts: [{ kind: 'points', label: 'Your graph', grid: grid, start: T.map(function (t) { return [t, 2]; }), names: ['Leaves home', 'Reaches the park', 'Leaves the park', 'Gets home', 'End'], labels: false, lock: 'x', connect: 'poly', key: key,
        check: function (cur) {
          var q = slopes(cur), p = q.p, s = q.s;
          if (p[0][1] === 0 && s[0] > 0 && s[1] === 0 && s[2] < 0 && p[3][1] === 0 && s[3] === 0 && -s[2] > s[0]) return { ok: true };
          if (s[0] < 0 || s[1] !== 0 || s[2] > 0 || s[3] > 0) return { ok: false, tag: 'M10' };
          return { ok: false };
        } }],
      why: { M10: 'The graph is not a picture of the ride. Distance from home goes up while ' + nmS + ' cycles away, stays flat at the park, and drops to 0 on the way home.' },
      answerFig: C.graph(spec(grid, { size: 300, lines: [{ seg: key }], label: 'Rises, flat, falls steeply to 0, flat at 0' })),
      answer: 'Up, flat, a steeper drop to 0, then flat at 0',
      work: ['Cycling to the park: distance from home goes <b>up</b>.', 'At the park: the distance stays the same, a <b>flat</b> piece.', 'Cycling home faster: the distance drops to 0, <b>steeper</b> than the ride out.', 'At home: flat at <b>0</b>.'],
      steps: [
        { label: 'While ' + nmS + ' cycles to the park, the distance from home', part: { kind: 'choice', keep: true, opts: [{ t: 'increases', ok: true }, { t: 'decreases' }, { t: 'stays the same' }] }, hint: 'Moving away from home makes the distance bigger.' },
        { label: 'While ' + nmS + ' is at the park, the graph is', part: { kind: 'choice', keep: true, opts: [{ t: 'going up' }, { t: 'going down' }, { t: 'flat', ok: true }] }, hint: 'Staying in one place: the distance does not change.' },
        { label: 'The ride home is faster, so the piece back down is ___ than the piece going up.', part: { kind: 'choice', keep: true, opts: [{ t: 'steeper', ok: true }, { t: 'less steep' }] }, hint: 'Faster means more distance in each minute.' },
        { label: 'Once ' + nmS + ' is home, the distance from home is', part: { kind: 'num', key: 0 }, hint: 'At home there is no distance left.' }
      ]
    };
  } });

  // drag-to-match: each card is the graph with one segment highlighted; the bins are the descriptions
  C.add({ id: 'QG-3b', skill: '18', level: 3, order: 3, type: 'DM', ia: true, gen: function (R) {
    var types, xs, ys, ok, j;
    do {
      types = R.shuffle(['up', 'down', 'flat']); types.splice(R.int(0, 3), 0, R.pick(['up', 'down', 'flat']));
      ok = types.every(function (t, k) { return k === 0 || t !== types[k - 1]; });
      xs = [0]; ys = [R.int(0, 7)];
      for (j = 0; j < 4; j++) {
        xs.push(xs[j] + R.int(2, 3));
        ys.push(ys[j] + (types[j] === 'up' ? R.int(2, 4) : types[j] === 'down' ? -R.int(2, 4) : 0));
      }
      if (ok) ok = ys.every(function (y) { return y >= 0 && y <= 8; });
    } while (!ok);
    var L = ['P', 'Q', 'R', 'S'], path = xs.map(function (x, k) { return [x, ys[k]]; });
    var win = { x: [0, 12], y: [0, 9], xl: 'Time', yl: 'Height' };
    var labs = L.map(function (l, k) { return { x: (xs[k] + xs[k + 1]) / 2, y: (ys[k] + ys[k + 1]) / 2, l: l, r: 0.01 }; });
    var bin = { up: 0, down: 1, flat: 2 };
    var cards = L.map(function (l, k) {
      return { t: '<b>Segment ' + l + '</b><br>' + C.graph(spec(win, { size: 150, xl: null, yl: null, lines: [{ seg: path, color: '#9AA6BC', w: 2 }, { seg: [path[k], path[k + 1]], color: C.COL.pt, w: 4 }], label: 'Segment ' + l + ' highlighted' })), bin: bin[types[k]] };
    });
    return {
      stem: 'The graph shows the height of a kite over time. Put each segment (P, Q, R, S) in the box that describes it.',
      fig: C.graph(spec(win, { size: 340, lines: [{ seg: path }], pts: labs, label: 'Height of a kite against time, with segments P, Q, R and S' })),
      think: 'Read each segment from left to right.',
      parts: [{ kind: 'sort', label: 'Match each segment', bins: ['Increasing', 'Decreasing', 'Constant'], cards: cards }],
      answerFig: C.graph(spec(win, { size: 300, lines: [{ seg: path }], pts: labs.map(function (p, k) { return { x: p.x, y: p.y, r: 0.01, l: p.l + ': ' + DIR3[bin[types[k]]].toLowerCase() }; }), label: 'Each segment with its description' })),
      answer: L.map(function (l, k) { return l + ' ' + DIR3[bin[types[k]]].toLowerCase(); }).join(', '),
      work: ['Read each segment left to right: up is increasing, down is decreasing, flat is constant.', L.map(function (l, k) { return l + ' goes ' + word(ys[k + 1] - ys[k]); }).join(', ') + '.', 'So <b>' + L.map(function (l, k) { return l + ' ' + DIR3[bin[types[k]]].toLowerCase(); }).join(', ') + '</b>.'],
      // one step per segment, so the steps rebuild the whole sort
      steps: [0, 1, 2, 3].map(function (k) {
        return { label: 'Segment ' + L[k] + ' is', part: { kind: 'choice', keep: true, opts: dirOpts(ys[k + 1] - ys[k]) }, hint: 'Follow segment ' + L[k] + ' from left to right: up is increasing, down is decreasing, level is constant.' };
      })
    };
  } });

  // a small hill or valley with a cyclist
  function hillFig(valley) {
    var W = 300, H = 110, d = valley ? 'M10 30 Q150 190 290 30' : 'M10 100 Q150 -60 290 100';
    var s = '<svg class="cfig" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + (valley ? 'A road going down into a valley and up the other side' : 'A road going up a hill and down the other side') + '" style="max-width:100%;height:auto">';
    s += '<path d="' + d + ' L290 110 L10 110 z" fill="#E7F0E3" stroke="none"/><path d="' + d + '" fill="none" stroke="#4A5468" stroke-width="3"/>';
    s += '<circle cx="18" cy="' + (valley ? 30 : 94) + '" r="7" fill="#F97316"/>';
    return s + '</svg>';
  }
  C.add({ id: 'QG-4a', skill: '18', level: 4, order: 1, type: 'MC', gen: function (R) {
    var valley = R.chance(0.5), nmS = R.name(), lo = R.int(1, 2), hi = R.int(6, 7), mid = R.int(4, 5);
    var win = { x: [0, 10], y: [0, 8], xl: 'Time', yl: 'Speed' };
    var V = [[0, hi], [5, lo], [10, hi]], A = [[0, lo], [5, hi], [10, lo]];
    var key = valley ? A : V, pic = valley ? V : A;
    var opts = [
      { t: mini(win, key, valley ? 'Graph: speed rises, then falls' : 'Graph: speed falls, then rises'), ok: true },
      { t: mini(win, pic, valley ? 'Graph: V-shaped, like the valley' : 'Graph: hill-shaped, like the hill'), tag: 'M10' },
      { t: mini(win, [[0, mid], [10, mid]], 'Graph: speed stays the same') },
      { t: mini(win, valley ? [[0, lo], [5, hi], [10, hi]] : [[0, hi], [5, lo], [10, lo]], valley ? 'Graph: speed rises, then stays the same' : 'Graph: speed falls, then stays the same') }
    ];
    return {
      stem: valley ? nmS + ' rides a bike down into a valley, then up the other side. Which graph shows the bike\'s speed against time?' : nmS + ' rides a bike up a hill, then down the other side. Which graph shows the bike\'s speed against time?',
      fig: hillFig(valley),
      think: 'The graph shows speed, not the shape of the road.',
      parts: [{ kind: 'choice', label: 'Graph', opts: opts }],
      why: { M10: 'That graph has the same shape as the ' + (valley ? 'valley' : 'hill') + '. But the graph shows speed: ' + (valley ? 'going down, the bike speeds up; going up, it slows down.' : 'going up, the bike slows down; going down, it speeds up.') },
      answerFig: C.graph(spec(win, { size: 300, lines: [{ seg: key }], label: valley ? 'Speed rises, then falls' : 'Speed falls, then rises' })),
      answer: valley ? 'Speed rises, then falls' : 'Speed falls, then rises',
      work: ['The graph shows speed, not the ' + (valley ? 'valley' : 'hill') + '.', valley ? 'Going down into the valley, the bike <b>speeds up</b>.' : 'Going up the hill, the bike <b>slows down</b>.', valley ? 'Climbing the other side, it <b>slows down</b>. So the graph rises, then falls.' : 'Going down the other side, it <b>speeds up</b>. So the graph falls, then rises.'],
      steps: [
        { label: 'In the first half of the ride, the bike\'s speed', part: { kind: 'choice', keep: true, opts: dirOpts(valley ? 1 : -1).map(function (o) { return { t: o.t.replace('Increasing', 'increases').replace('Decreasing', 'decreases').replace('Constant', 'stays the same'), ok: o.ok }; }) }, hint: valley ? 'Riding downhill, a bike goes faster.' : 'Riding uphill, a bike slows down.' },
        { label: 'In the second half, the speed', part: { kind: 'choice', keep: true, opts: dirOpts(valley ? -1 : 1).map(function (o) { return { t: o.t.replace('Increasing', 'increases').replace('Decreasing', 'decreases').replace('Constant', 'stays the same'), ok: o.ok }; }) }, hint: valley ? 'Riding uphill, a bike slows down.' : 'Riding downhill, a bike goes faster.' },
        { label: 'So the speed graph', part: { kind: 'choice', keep: true, opts: [{ t: 'falls, then rises', ok: !valley }, { t: 'rises, then falls', ok: valley }] }, hint: 'Put the two halves together, left to right.' }
      ]
    };
  } });

  C.add({ id: 'QG-4b', skill: '18', level: 4, order: 2, type: 'MC', gen: function (R) {
    var vH = 1, vS = R.int(2, 3), a0 = (vS - vH) * 5 + R.int(1, 2), top = a0 + vH * 5 + 1;
    var hiName = R.pick(['A', 'B']), stName = hiName === 'A' ? 'B' : 'A';
    var lines = [{ seg: [[0, a0], [5, a0 + 5 * vH]], color: C.COL.line }, { seg: [[0, 0], [5, 5 * vS]], color: C.COL.line2 }];
    // the steep car's label sits just below its own line, well away from the other line
    var pts = [{ x: 4, y: a0 + 4 * vH, l: 'Car ' + hiName, c: C.COL.line, r: 5 }, { x: 4, y: 4 * vS, c: C.COL.line2, r: 5 }, { x: 3, y: 3 * vS - 2, l: 'Car ' + stName, r: 0.01 }];
    function opt(n) { return 'Car ' + n; }
    var opts = [{ t: 'Car A', ok: hiName === 'B', tag: hiName === 'A' ? 'M13' : null }, { t: 'Car B', ok: hiName === 'A', tag: hiName === 'B' ? 'M13' : null }, { t: 'They go the same speed' }, { t: 'You can\'t tell from the graph' }];
    opts.forEach(function (o) { if (!o.tag) delete o.tag; });
    return {
      stem: 'The graph shows two cars\' distance from town against time. Which car is going faster?',
      fig: C.graph({ x: [0, 5], y: [0, top], nums: false, xl: 'Time', yl: 'Distance from town', size: 320, lines: lines, pts: pts, label: 'Distance from town against time for car A and car B' }),
      think: 'Speed is how much distance for each bit of time.',
      parts: [{ kind: 'choice', label: 'Faster car', keep: true, opts: opts }],
      why: { M13: 'Car ' + hiName + ' is farther from town, so its line is higher. But speed is how fast the distance grows: car ' + stName + '\'s line rises ' + vS + ' squares for each square of time, car ' + hiName + '\'s only ' + vH + '.' },
      answer: opt(stName),
      work: ['Speed is distance per unit of time: how steeply the line rises.', 'For each square of time, car ' + stName + '\'s line rises ' + vS + ' squares and car ' + hiName + '\'s rises ' + vH + '.', 'Car ' + hiName + ' is farther from town, but <b>car ' + stName + '</b> is faster: its line is steeper.'],
      steps: [
        { label: 'For 1 square of time, how many squares does car ' + hiName + '\'s line rise?', part: { kind: 'num', key: vH }, hint: 'Pick a point on the line where it crosses a corner, then move 1 square right.' },
        { label: 'For 1 square of time, how many squares does car ' + stName + '\'s line rise?', part: { kind: 'num', key: vS }, hint: 'Start at (0, 0) and move 1 square right.' },
        { label: 'So the faster car is', part: { kind: 'choice', keep: true, opts: [{ t: 'Car A', ok: stName === 'A' }, { t: 'Car B', ok: stName === 'B' }] }, hint: 'More distance in the same time means faster.' }
      ]
    };
  } });

  /* ---------------- Skill 19: rates ---------------- */
  C.add({ id: 'QG-5a', skill: '19', level: 5, order: 1, type: 'FR', gen: function (R) {
    var fastFirst = R.chance(0.5), ok, d1, d2, t1, t2, y0, y1, y2;
    do {
      var tf = R.int(1, 2), df = R.int(4, 6) * R.sign(), ts = R.int(3, 5), ds = R.int(1, 2) * R.sign();
      if (fastFirst) { t1 = tf; d1 = df; t2 = ts; d2 = ds; } else { t1 = ts; d1 = ds; t2 = tf; d2 = df; }
      y0 = R.int(0, 10); y1 = y0 + d1; y2 = y1 + d2;
      ok = [y0, y1, y2].every(function (y) { return y >= 0 && y <= 10; });
    } while (!ok);
    var x1 = R.int(0, 1), x2 = x1 + t1, x3 = x2 + t2, path = [[x1, y0], [x2, y1], [x3, y2]];
    var pts = [{ x: x1, y: y0, l: 'A' }, { x: x2, y: y1, l: 'B' }, { x: x3, y: y2, l: 'C' }];
    function dir(d) { return d > 0 ? 'increases' : 'decreases'; }
    function dirOptsW(d) { return [{ t: 'increases', ok: d > 0, tag: d > 0 ? null : 'M2' }, { t: 'decreases', ok: d < 0, tag: d < 0 ? null : 'M2' }, { t: 'stays the same' }].map(function (o) { if (!o.tag) delete o.tag; return o; }); }
    var q1 = fastFirst ? 'quickly' : 'slowly', q2 = fastFirst ? 'slowly' : 'quickly';
    return {
      stem: 'The graph shows the water level in a tank against time. Complete the sentence.',
      fig: C.graph({ x: [0, 10], y: [0, 10], nums: false, xl: 'Time', yl: 'Water level', size: 320, lines: [{ seg: path }], pts: pts, label: 'Water level against time, through points A, B and C' }),
      sentence: 'From A to B, the water level {0} {1}, and from B to C it {2} {3}.',
      parts: [
        { kind: 'choice', inline: true, keep: true, opts: dirOptsW(d1) },
        { kind: 'choice', inline: true, keep: true, opts: [{ t: 'quickly', ok: fastFirst }, { t: 'slowly', ok: !fastFirst }] },
        { kind: 'choice', inline: true, keep: true, opts: dirOptsW(d2) },
        { kind: 'choice', inline: true, keep: true, opts: [{ t: 'quickly', ok: !fastFirst }, { t: 'slowly', ok: fastFirst }] }
      ],
      why: { M2: 'Read each part from left to right: going up means the level increases, going down means it decreases.' },
      answer: 'From A to B it ' + dir(d1) + ' ' + q1 + ', and from B to C it ' + dir(d2) + ' ' + q2,
      work: ['Steeper parts mean faster change.', 'From A to B the level ' + (d1 > 0 ? 'rises ' : 'drops ') + C.pl(Math.abs(d1), 'square') + ' in ' + C.pl(t1, 'square') + ' of time; from B to C it ' + (d2 > 0 ? 'rises ' : 'drops ') + C.pl(Math.abs(d2), 'square') + ' in ' + C.pl(t2, 'square') + '.', 'So A to B <b>' + dir(d1) + ' ' + q1 + '</b> and B to C <b>' + dir(d2) + ' ' + q2 + '</b>.'],
      steps: [
        { label: 'From A to B, the graph goes', part: { kind: 'choice', keep: true, opts: [{ t: 'up', ok: d1 > 0 }, { t: 'down', ok: d1 < 0 }] }, hint: 'Follow the line from A to B, left to right.' },
        { label: 'From B to C, the graph goes', part: { kind: 'choice', keep: true, opts: [{ t: 'up', ok: d2 > 0 }, { t: 'down', ok: d2 < 0 }] }, hint: 'Follow the line from B to C, left to right.' },
        { label: 'Which part is steeper?', part: { kind: 'choice', keep: true, opts: [{ t: 'A to B', ok: fastFirst }, { t: 'B to C', ok: !fastFirst }] }, hint: 'Steeper means more change in the same time. That part changes quickly.' }
      ]
    };
  } });

  C.add({ id: 'QG-5b', skill: '19', level: 5, order: 2, type: 'MC', gen: function (R) {
    var w, r, k, Lg, ok;
    do {
      w = [0, 1, 2, 3].map(function () { return R.int(1, 4); });
      r = [0, 1, 2, 3].map(function () { return R.int(0, 5); });
      // k: the fastest segment; Lg: the segment that gains the most distance (but over more time)
      var rates = r.map(function (v, i) { return v / w[i]; }), mx = Math.max.apply(null, rates), mw = Math.max.apply(null, r);
      k = rates.indexOf(mx); Lg = r.indexOf(mw);
      ok = rates.filter(function (v) { return v === mx; }).length === 1 && r.filter(function (v) { return v === mw; }).length === 1 &&
        k !== 3 && Lg !== 3 && Lg !== k && w.reduce(function (a, b) { return a + b; }) <= 12 && r.reduce(function (a, b) { return a + b; }) <= 12 && r[3] > 0;
    } while (!ok);
    var L = ['P', 'Q', 'R', 'S'], xs = [0], ys = [0];
    for (var i = 0; i < 4; i++) { xs.push(xs[i] + w[i]); ys.push(ys[i] + r[i]); }
    var path = xs.map(function (x, i) { return [x, ys[i]]; });
    var labs = L.map(function (l, i) { return { x: (xs[i] + xs[i + 1]) / 2, y: (ys[i] + ys[i + 1]) / 2, l: l, r: 0.01 }; });
    // S (highest on the graph) read as fastest: M13; the segment with the most distance, not divided by its time: M8
    var opts = L.map(function (l, i) { var o = { t: 'Segment ' + l }; if (i === k) o.ok = true; else if (i === 3) o.tag = 'M13'; else if (i === Lg) o.tag = 'M8'; return o; });
    function sq(n) { return C.pl(n, 'square'); }
    return {
      stem: 'The graph shows the distance a car has travelled against time. During which segment did the car travel fastest?',
      fig: C.graph({ x: [0, 12], y: [0, 12], nums: false, xl: 'Time', yl: 'Distance', size: 340, lines: [{ seg: path }], pts: labs, label: 'Distance against time with segments P, Q, R and S' }),
      think: 'Fastest means the most distance for each bit of time.',
      parts: [{ kind: 'choice', label: 'Fastest', keep: true, opts: opts }],
      why: { M13: 'Segment S is highest because the car has gone farthest by then. Higher on the graph means further along, not faster: speed is how steep a segment is.', M8: 'Segment ' + L[Lg] + ' gains the most distance (' + sq(r[Lg]) + '), but it takes ' + sq(w[Lg]) + ' of time to do it: ' + r[Lg] + ' ÷ ' + w[Lg] + ' = ' + f(r[Lg] / w[Lg]) + ' for each square of time. Segment ' + L[k] + ' gains ' + f(r[k] / w[k]) + ' for each square of time.' },
      answer: 'Segment ' + L[k],
      work: ['Speed is the steepness of a distance-time graph: distance gained for each square of time.', L.map(function (l, i) { return l + ': ' + r[i] + ' ÷ ' + w[i] + ' = ' + f(r[i] / w[i]); }).join('; ') + '.', 'Segment ' + L[k] + ' covers ' + sq(r[k]) + ' of distance in ' + sq(w[k]) + ' of time, the greatest rate: <b>segment ' + L[k] + '</b>.'],
      steps: [
        { label: 'On a distance-time graph, speed is shown by how', part: { kind: 'choice', keep: true, opts: [{ t: 'steep a segment is', ok: true }, { t: 'high a segment is' }, { t: 'long a segment is' }] }, hint: 'Speed is distance per unit of time.' },
        { label: 'Segment ' + L[k] + ' rises ' + sq(r[k]) + ' in ' + sq(w[k]) + ' of time. Squares of distance per square of time =', part: { kind: 'num', key: r[k] / w[k] }, hint: 'Divide the rise by the time: ' + r[k] + ' ÷ ' + w[k] + '.' },
        { label: 'Which segment is steepest?', part: { kind: 'choice', keep: true, opts: L.map(function (l, i) { return { t: 'Segment ' + l, ok: i === k }; }) }, hint: 'Compare rise ÷ time for each segment.' }
      ]
    };
  } });

  // graph the story: the student drags 5 corners up or down at fixed times
  C.add({ id: 'QG-5c', skill: '19', level: 5, order: 3, type: 'interactive', ia: true, gen: function (R) {
    var v0 = R.pick([40, 60, 80, 120]), t1 = R.int(3, 4), t2 = R.int(2, 3), t3 = R.int(1, 3), d1 = R.int(1, 2), top = R.int(7, 8);
    if (t1 + t2 + t3 > 9) t3 = 9 - t1 - t2;
    var T = [0, t1, t1 + t2, t1 + t2 + t3, 10];
    var key = [[0, top], [t1, top - d1], [t1 + t2, top - d1], [t1 + t2 + t3, 0], [10, 0]];
    var grid = { x: [0, 10], y: [0, 9], nums: false, xl: 'Time', yl: 'Water in the tank', size: 400, label: 'Water in the tank against time' };
    return {
      stem: 'A tank holds ' + v0 + ' L of water. It drains slowly for ' + t1 + ' minutes, pauses for ' + t2 + ' minutes, then drains quickly until empty. Drag the 5 corners to graph the water against time.',
      think: 'Slow drain: a gentle slope down. Quick drain: a steep slope down.',
      parts: [{ kind: 'points', label: 'Your graph', grid: grid, start: T.map(function (t) { return [t, 4]; }), names: ['Start', 'Drain stops', 'Drain starts again', 'Empty', 'End'], labels: false, lock: 'x', connect: 'poly', key: key,
        check: function (cur) {
          var q = slopes(cur), p = q.p, s = q.s;
          if (p[0][1] > 0 && s[0] < 0 && s[1] === 0 && s[2] < 0 && p[3][1] === 0 && s[3] === 0 && -s[2] > -s[0]) return { ok: true };
          if (s.some(function (v) { return v > 0; })) return { ok: false, tag: 'M10' };
          return { ok: false };
        } }],
      why: { M10: 'Part of your graph goes up, but the water never rises: the tank only drains or stays the same. The graph is not a picture of the tank.' },
      answerFig: C.graph(spec(grid, { size: 300, lines: [{ seg: key }], label: 'Gentle fall, flat, steep fall to 0, flat at 0' })),
      answer: 'A gentle fall, a flat piece, a steeper fall to 0, then flat at 0',
      work: ['Each piece\'s steepness is how fast the water changes.', 'Draining slowly: a <b>gentle</b> fall. Staying the same: <b>flat</b>.', 'Draining quickly: a fall <b>steeper</b> than the first one, ending at <b>0 L</b>, then flat at 0 because the tank is empty.'],
      steps: [
        { label: 'In the first ' + t1 + ' minutes, the water', part: { kind: 'choice', keep: true, opts: [{ t: 'increases' }, { t: 'decreases', ok: true }, { t: 'stays the same' }] }, hint: 'The tank is draining.' },
        { label: 'The last drain is quick and the first is slow, so the last falling piece is', part: { kind: 'choice', keep: true, opts: [{ t: 'steeper than the first', ok: true }, { t: 'less steep than the first' }] }, hint: 'Quick change means a steep line.' },
        { label: 'When the tank is empty, the water in it is (L)', part: { kind: 'num', key: 0 }, hint: 'Empty means none left.' }
      ]
    };
  } });

  // a vase outline, for QG-6a
  function vaseFig(shape) {
    var W = 140, H = 150, L = shape === 'wn' ? [20, 55] : shape === 'nw' ? [55, 20] : [35, 35]; // left edge at bottom, top
    var lb = L[0], lt = L[1], rb = W - lb, rt = W - lt;
    var d = 'M' + lt + ' 10 L' + lt + ' 60 L' + lb + ' 90 L' + lb + ' 140 L' + rb + ' 140 L' + rb + ' 90 L' + rt + ' 60 L' + rt + ' 10';
    var name = shape === 'wn' ? 'A vase that is wide at the bottom and narrow at the top' : shape === 'nw' ? 'A vase that is narrow at the bottom and wide at the top' : 'A vase shaped like a cylinder, the same width all the way up';
    return '<svg class="cfig" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + name + '" style="max-width:100%;height:auto"><path d="' + d + '" fill="#EAF2FF" stroke="#1D4ED8" stroke-width="3" stroke-linejoin="round"/></svg>';
  }
  C.add({ id: 'QG-6a', skill: '19', level: 6, type: 'MC', gen: function (R) {
    var shape = R.pick(['wn', 'nw', 'cyl']);
    var win = { x: [0, 10], y: [0, 10], xl: 'Time', yl: 'Water height' };
    var G = {
      sf: { p: [[0, 0], [6, 4], [9, 10]], l: 'Graph: rises slowly, then quickly' },
      fs: { p: [[0, 0], [3, 6], [9, 10]], l: 'Graph: rises quickly, then slowly' },
      ln: { p: [[0, 0], [10, 10]], l: 'Graph: rises at a steady rate' },
      pic: { p: shape === 'wn' ? [[8, 0], [8, 4], [4, 6], [4, 10]] : shape === 'nw' ? [[4, 0], [4, 4], [8, 6], [8, 10]] : [[6, 0], [6, 10]], l: 'Graph: drawn in the shape of the vase' }
    };
    var keyId = shape === 'wn' ? 'sf' : shape === 'nw' ? 'fs' : 'ln';
    var opts = ['sf', 'fs', 'ln', 'pic'].map(function (id) { var o = { t: mini(win, G[id].p, G[id].l) }; if (id === keyId) o.ok = true; else if (id === 'pic') o.tag = 'M10'; return o; });
    var desc = shape === 'wn' ? 'wide at the bottom and narrow at the top' : shape === 'nw' ? 'narrow at the bottom and wide at the top' : 'the same width all the way up, like a cylinder';
    var ans = shape === 'wn' ? 'Rises slowly, then quickly' : shape === 'nw' ? 'Rises quickly, then slowly' : 'Rises at a steady rate (a straight line)';
    return {
      stem: 'Water is poured at a steady rate into a vase that is ' + desc + '. Which graph shows the height of the water against time?',
      fig: vaseFig(shape),
      think: 'Where the vase is wide, does the water rise fast or slowly?',
      parts: [{ kind: 'choice', label: 'Graph', opts: opts }],
      why: { M10: 'That graph is drawn in the shape of the vase. The graph shows how fast the water height rises as time passes, not what the vase looks like.' },
      answerFig: C.graph(spec(win, { size: 300, lines: [{ seg: G[keyId].p }], label: ans })),
      answer: ans,
      work: shape === 'cyl' ? ['The vase is the same width all the way up.', 'Each minute the same water adds the same height.', 'So the height rises at a <b>steady rate</b>: a straight line.'] :
        ['Where the vase is wide, the same water spreads out, so the height rises <b>slowly</b>.', 'Where it is narrow, the height rises <b>fast</b>.', 'This vase is ' + (shape === 'wn' ? 'wide first, then narrow' : 'narrow first, then wide') + ', so the graph <b>' + ans.toLowerCase() + '</b>.'],
      steps: [
        { label: 'At the bottom, the vase is ' + (shape === 'wn' ? 'wide' : shape === 'nw' ? 'narrow' : 'the same width as the top') + '. There the water height rises', part: { kind: 'choice', keep: true, opts: [{ t: 'slowly', ok: shape === 'wn' }, { t: 'quickly', ok: shape === 'nw' }, { t: 'at the same rate as at the top', ok: shape === 'cyl' }] }, hint: 'A wide part needs more water to rise the same height.' },
        { label: 'So the graph', part: { kind: 'choice', keep: true, opts: [{ t: 'rises slowly, then quickly', ok: shape === 'wn' }, { t: 'rises quickly, then slowly', ok: shape === 'nw' }, { t: 'is a straight line', ok: shape === 'cyl' }] }, hint: 'Slow rise means a gentle slope; quick rise means a steep slope.' }
      ]
    };
  } });
})();
