/* Climb question bank: skill 4 (function or not: graphs, tables, constant functions) and skill 5 (functions in context).
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt, M = '−';
  var LET = ['A', 'B', 'C', 'D', 'E', 'F'];

  // a small −6..6 graph for options and cards
  function mini(lines, pts, label, size) {
    return C.graph({ x: [-6, 6], y: [-6, 6], lx: 2, ly: 2, size: size || 170, lines: lines || [], pts: pts || [], label: label });
  }
  // curve shapes, drawn as polylines through whole-number vertices
  function sideways(h, k, a, dir) { var p = []; for (var t = -4; t <= 4.001; t += 0.25) p.push([h + dir * a * t * t, k + t]); return { seg: p }; }
  function circle(h, k, r) { var p = []; for (var i = 0; i <= 64; i++) { var t = i / 64 * 2 * Math.PI; p.push([h + r * Math.cos(t), k + r * Math.sin(t)]); } return { seg: p }; }
  function upward(h, k, a) { var p = []; for (var x = h - 4; x <= h + 4.001; x += 0.25) p.push([x, k + a * (x - h) * (x - h)]); return { seg: p }; }
  function vee(h, k) { return { seg: [[h - 7, k + 7], [h, k], [h + 7, k + 7]] }; }
  function yn(yes, tagYes, tagNo) { return { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: yes, tag: yes ? undefined : tagYes }, { t: 'No', ok: !yes, tag: yes ? tagNo : undefined }] }; }

  /* ---------------- Skill 4 Function or not: graphs, tables, constant functions ---------------- */
  C.add({ id: 'FN-3a', skill: '4', level: 3, order: 1, type: 'MC', gen: function (R) {
    var useCircle = R.chance(0.5), key, x0, y0a, y0b, keyDesc;
    if (useCircle) {
      var h = R.int(-2, 2), k = R.int(-2, 2), r = R.int(2, 3);
      key = mini([circle(h, k, r)], [], 'Graph of a circle');
      x0 = h; y0a = k - r; y0b = k + r; keyDesc = 'the circle';
    } else {
      var a = R.pick([0.5, 1]), dir = R.sign(), hh = dir > 0 ? R.int(-5, -2) : R.int(2, 5), kk = R.int(-2, 2);
      key = mini([sideways(hh, kk, a, dir)], [], 'Graph of a curve that opens to the ' + (dir > 0 ? 'right' : 'left'));
      x0 = hh + dir * a * 4; y0a = kk - 2; y0b = kk + 2; keyDesc = 'the sideways curve';
    }
    var pv = R.int(-3, 3), pk = R.int(-5, -1), hc = R.nz(-4, 4), vh = R.int(-3, 3), vk = R.int(-5, 0);
    var opts = [
      { t: key, ok: true },
      { t: mini([upward(pv, pk, R.pick([0.5, 1]))], [], 'Graph of a curve that opens upward'), tag: 'M6' },
      { t: mini([{ m: 0, b: hc }], [], 'Graph of a horizontal line'), tag: 'M15' },
      { t: mini([vee(vh, vk)], [], 'Graph of a V shape') }
    ];
    return {
      stem: 'Which graph is <b>NOT</b> a function?',
      think: 'Imagine a vertical line sliding across each graph.',
      parts: [{ kind: 'choice', label: 'Not a function', opts: opts }],
      answer: keyDesc + ': the input x = ' + f(x0) + ' has two outputs',
      work: ['A function gives each input (x) exactly one output (y).', 'A vertical line at x = ' + f(x0) + ' hits ' + keyDesc + ' twice, at y = ' + f(y0a) + ' and y = ' + f(y0b) + '.', 'One input with two outputs, so <b>' + keyDesc + ' is not a function</b>.', 'A horizontal line gives every input the same output, which is allowed.'],
      why: { M6: 'The upward curve has some outputs used twice, but each input still has one output. Repeated outputs are fine.', M15: 'A horizontal line gives every input the same output. That is still exactly one output for each input, so it is a function.' },
      steps: [
        { label: 'Picture a vertical line at x = ' + f(x0) + ' on ' + keyDesc + '. How many times does it hit the graph?', part: { kind: 'num', key: 2 }, hint: 'It crosses at y = ' + f(y0a) + ' and at y = ' + f(y0b) + '.' },
        { label: 'So does the input x = ' + f(x0) + ' have exactly one output?', part: yn(false), hint: 'Two crossing points means two outputs.' },
        { label: 'Which graph is not a function?', part: { kind: 'choice', keep: true, opts: [{ t: keyDesc, ok: true }, { t: 'the horizontal line', tag: 'M15' }] }, hint: 'The horizontal line gives one output for every input.' }
      ]
    };
  } });

  C.add({ id: 'FN-3b', skill: '4', level: 3, order: 2, type: 'MS', gen: function (R) {
    // a pool of graph types: which ones appear, and how many are functions, changes with the seed
    var FNS = [
      function () { var c = R.nz(-5, 5); return { t: mini([{ m: 0, b: c }], [], 'Graph of a horizontal line'), name: 'the horizontal line', missTag: 'M15', note: 'every x gives y = ' + f(c),
        step: { label: 'The horizontal line y = ' + f(c) + ': is y a function of x?', part: yn(true, null, 'M15'), hint: 'Every input has the same output, ' + f(c) + '. That is still one output each.' } }; },
      function () { var xs = R.distinct(6, -5, 5); return { t: mini([], xs.map(function (x) { return { x: x, y: R.int(-5, 5), r: 5 }; }), 'Graph of six scattered points'), name: 'the scattered points', missTag: 'M15', note: 'each point has its own x',
        step: { label: 'The scattered points: does any x have two points?', part: yn(false), hint: 'Each point is in its own column. No pattern is needed.' } }; },
      function () { var b1 = R.int(-5, 5), b2 = R.int(-5, 5), b3 = R.int(-5, 5), b4 = R.int(-5, 5); return { t: mini([{ seg: [[-5, b1], [-1, b2]] }, { seg: [[1, b3], [5, b4]] }], [{ x: -5, y: b1, r: 4 }, { x: -1, y: b2, r: 4 }, { x: 1, y: b3, r: 4 }, { x: 5, y: b4, r: 4 }], 'Graph of a line in two pieces'), name: 'the line in two pieces', missTag: 'M15', note: 'the two pieces never share an x',
        step: { label: 'The line in two pieces: does any x have two points?', part: yn(false), hint: 'The pieces do not overlap: one stops at x = −1, the other starts at x = 1.' } }; },
      function () { var m = R.pick([1, 2, -1, -2, 0.5, -0.5]), b = R.int(-3, 3); return { t: mini([{ m: m, b: b }], [], 'Graph of a slanted line'), name: 'the slanted line', note: 'a vertical line crosses it once',
        step: { label: 'The slanted line: how many y-values does x = 2 have?', part: { kind: 'num', key: 1 }, hint: 'A vertical line at x = 2 crosses it once, at y = ' + f(m * 2 + b) + '.' } }; },
      function () { var h = R.int(-2, 2), k = R.int(-5, -2), a = R.pick([0.5, 1]); return { t: mini([upward(h, k, a)], [], 'Graph of a U-shaped curve'), name: 'the U-shaped curve', missTag: 'M6', note: 'outputs repeat, but each x has one y',
        step: { label: 'The U-shaped curve: x = ' + f(h - 2) + ' and x = ' + f(h + 2) + ' have the same y. Is y still a function of x?', part: yn(true, null, 'M6'), hint: 'Two inputs sharing an output is fine. Each x still has only one y.' } }; },
      function () { var h = R.int(-2, 2), k = R.int(-5, 0); return { t: mini([vee(h, k)], [], 'Graph of a V shape'), name: 'the V shape', missTag: 'M6', note: 'outputs repeat, but each x has one y',
        step: { label: 'The V shape: x = ' + f(h - 1) + ' and x = ' + f(h + 1) + ' have the same y. Is y still a function of x?', part: yn(true, null, 'M6'), hint: 'Two inputs sharing an output is fine. Each x still has only one y.' } }; }
    ];
    var NOTS = [
      function () { var vc = R.nz(-5, 5); return { t: mini([{ p: [[vc, -6], [vc, 6]] }], [], 'Graph of a vertical line'), name: 'the vertical line', note: 'x = ' + f(vc) + ' has endless outputs',
        step: { label: 'The vertical line at x = ' + f(vc) + ': how many outputs does the input ' + f(vc) + ' have?', part: { kind: 'choice', keep: true, opts: [{ t: 'Exactly one' }, { t: 'Many', ok: true }] }, hint: 'Every point on that line has x = ' + f(vc) + '.' } }; },
      function () { var dx = R.distinct(4, -5, 5), dp = dx.map(function (x) { return { x: x, y: R.int(-5, 5), r: 5 }; }), sh = dx[0], ya = dp[0].y, yb; do { yb = R.int(-5, 5); } while (yb === ya); dp.push({ x: sh, y: yb, r: 5 });
        return { t: mini([], dp, 'Graph of five points, two above the same x'), name: 'the five points', note: 'x = ' + f(sh) + ' has two outputs (' + f(ya) + ' and ' + f(yb) + ')',
          step: { label: 'In the graph of five points, which x-value has two points above or below it?', part: { kind: 'num', key: sh }, hint: 'Look for two points in the same column.' } }; },
      function () { var h = R.int(-2, 2), k = R.int(-2, 2), r = R.int(2, 3); return { t: mini([circle(h, k, r)], [], 'Graph of a circle'), name: 'the circle', note: 'x = ' + f(h) + ' has two outputs (' + f(k - r) + ' and ' + f(k + r) + ')',
        step: { label: 'The circle: a vertical line at x = ' + f(h) + ' hits it how many times?', part: { kind: 'num', key: 2 }, hint: 'It crosses at y = ' + f(k - r) + ' and at y = ' + f(k + r) + '.' } }; },
      function () { var a = R.pick([0.5, 1]), dir = R.sign(), hh = dir > 0 ? R.int(-5, -2) : R.int(2, 5), kk = R.int(-2, 2), x0 = hh + dir * a * 4; return { t: mini([sideways(hh, kk, a, dir)], [], 'Graph of a curve that opens to the ' + (dir > 0 ? 'right' : 'left')), name: 'the sideways curve', note: 'x = ' + f(x0) + ' has two outputs (' + f(kk - 2) + ' and ' + f(kk + 2) + ')',
        step: { label: 'The sideways curve: a vertical line at x = ' + f(x0) + ' hits it how many times?', part: { kind: 'num', key: 2 }, hint: 'It crosses at y = ' + f(kk - 2) + ' and at y = ' + f(kk + 2) + '.' } }; }
    ];
    var nf = R.int(2, 4);
    var yes = R.shuffle(FNS).slice(0, nf).map(function (g) { var c = g(); c.ok = true; return c; });
    var no = R.shuffle(NOTS).slice(0, 5 - nf).map(function (g) { var c = g(); c.ok = false; return c; });
    var all = R.shuffle(yes.concat(no));
    var opts = all.map(function (c) { return c.ok ? { t: c.t, ok: true, missTag: c.missTag } : { t: c.t, ok: false }; });
    yes = all.filter(function (c) { return c.ok; }); no = all.filter(function (c) { return !c.ok; });
    function names(list) { return list.length === 1 ? list[0].name : list.slice(0, -1).map(function (c) { return c.name; }).join(', ') + ' and ' + list[list.length - 1].name; }
    var m15 = yes.filter(function (c) { return c.missTag === 'M15'; }), m6 = yes.filter(function (c) { return c.missTag === 'M6'; });
    return {
      stem: 'Select <b>all</b> the graphs that show y as a function of x.',
      think: 'For each graph: does any x have two different y-values?',
      parts: [{ kind: 'multi', label: 'Functions', opts: opts }],
      answer: cap(names(yes)),
      work: ['Check each input: one output each means a function.', no.map(function (c) { return cap(c.name) + ': ' + c.note + '.'; }).join(' ') + ' Not ' + (no.length === 1 ? 'a function' : 'functions') + '.', yes.map(function (c) { return cap(c.name) + ': ' + c.note + '.'; }).join(' '), 'Graphs do not need to be connected, slanted or follow a rule. Functions: <b>' + names(yes) + '</b>.'],
      why: {
        M15: m15.length ? 'A graph does not need to be slanted, connected or follow a rule. ' + cap(names(m15)) + (m15.length === 1 ? ' gives' : ' each give') + ' every x exactly one y.' : 'A graph does not need to follow a rule. Each x having exactly one y is all that matters.',
        M6: m6.length ? cap(names(m6)) + (m6.length === 1 ? ' uses' : ' use') + ' some outputs twice, but each x still has exactly one y. Repeated outputs are allowed.' : 'Repeated outputs are allowed. Only an x with two different y-values breaks the rule.'
      },
      steps: [no[0].step, yes[0].step, yes[1].step,
        { label: 'So how many of the five graphs are functions?', part: { kind: 'num', key: nf }, hint: 'The functions: ' + names(yes) + '.' }]
    };
  } });

  C.add({ id: 'FN-3c', skill: '4', level: 3, order: 3, type: 'DM', ia: true, gen: function (R) {
    function eqTable() {
      var xs = R.distinct(4, -4, 9), c = R.int(-5, 9);
      return { fn: true, html: C.table({ cols: ['x', 'y'], rows: xs.map(function (x) { return [x, c]; }) }), name: 'the table where every y is ' + f(c), q: 'Every y is ' + f(c) + '. Does any x have two different outputs?', hint: 'The outputs repeat, but no x appears twice. Same outputs are fine.' };
    }
    function hLine() {
      var c = R.nz(-5, 5);
      return { fn: true, html: mini([{ m: 0, b: c }], [], 'Graph of a horizontal line'), name: 'the horizontal line', q: 'The horizontal line y = ' + f(c) + ': does any x have two different outputs?', hint: 'A vertical line hits a horizontal line only once.' };
    }
    function scatter() {
      var xs = R.distinct(5, -5, 5);
      return { fn: true, html: mini([], xs.map(function (x) { return { x: x, y: R.int(-5, 5), r: 5 }; }), 'Graph of scattered points'), name: 'the scattered points', q: 'The scattered points: does any x have two points?', hint: 'Each point is in its own column. No pattern is needed.' };
    }
    function repTable() {
      var xs = R.distinct(3, -4, 9), r = xs[0], y1 = R.int(-5, 9), y2; do { y2 = R.int(-5, 9); } while (y2 === y1);
      var rows = R.shuffle([[xs[1], R.int(-5, 9)], [xs[2], R.int(-5, 9)], [r, y2]]); rows.unshift([r, y1]);
      return { fn: false, html: C.table({ cols: ['x', 'y'], rows: rows }), name: 'the table with x = ' + f(r) + ' twice', q: 'In the table, x = ' + f(r) + ' appears twice. Does it have two different outputs?', hint: 'x = ' + f(r) + ' goes to ' + f(y1) + ' and to ' + f(y2) + '.' };
    }
    function circ() {
      var h = R.int(-2, 2), k = R.int(-2, 2), r = R.int(2, 3);
      return { fn: false, html: mini([circle(h, k, r)], [], 'Graph of a circle'), name: 'the circle', q: 'The circle: does x = ' + f(h) + ' have two different outputs?', hint: 'A vertical line at x = ' + f(h) + ' hits the circle at y = ' + f(k - r) + ' and y = ' + f(k + r) + '.' };
    }
    function branch() {
      var L = R.distinct(3, 1, 9), Rt = R.distinct(3, 1, 12);
      return { fn: false, html: C.mapping({ left: L, right: Rt, arrows: [[0, 0], [1, 1], [1, 2], [2, 2]] }), name: 'the mapping where ' + f(L[1]) + ' has two arrows', q: 'In the mapping, how many arrows leave the input ' + f(L[1]) + '? Does it have two different outputs?', hint: f(L[1]) + ' points to both ' + f(Rt[1]) + ' and ' + f(Rt[2]) + '.' };
    }
    // all six cards from the plan: three functions, three not
    var list = R.shuffle([eqTable, hLine, scatter, repTable, circ, branch]).map(function (g) { return g(); });
    var pick = [list.filter(function (c) { return c.fn; })[0], list.filter(function (c) { return c.fn; })[1], list.filter(function (c) { return !c.fn; })[0], list.filter(function (c) { return !c.fn; })[1]];
    pick.sort(function (p, q) { return list.indexOf(p) - list.indexOf(q); });
    function card(c, i) { return '<div style="max-width:150px"><b>' + LET[i] + '</b><div>' + c.html + '</div></div>'; }
    return {
      stem: 'Sort the six cards into "Function" and "Not a function".',
      think: 'One question per card: does any input have two outputs?',
      parts: [{ kind: 'sort', label: 'Cards', bins: ['Function', 'Not a function'], cards: list.map(function (c, i) { return { t: card(c, i), bin: c.fn ? 0 : 1, tag: c.fn ? 'M15' : 'M6' }; }) }],
      answerFig: '<div style="font-size:14px"><b>Function:</b> ' + list.filter(function (c) { return c.fn; }).map(function (c) { return LET[list.indexOf(c)]; }).join(', ') + '. <b>Not a function:</b> ' + list.filter(function (c) { return !c.fn; }).map(function (c) { return LET[list.indexOf(c)]; }).join(', ') + '.</div>',
      answer: 'Function: ' + list.filter(function (c) { return c.fn; }).map(function (c) { return LET[list.indexOf(c)]; }).join(', ') + '; not a function: ' + list.filter(function (c) { return !c.fn; }).map(function (c) { return LET[list.indexOf(c)]; }).join(', '),
      work: ['Check one thing per card: does any input have two outputs?', 'Not functions: ' + list.filter(function (c) { return !c.fn; }).map(function (c) { return c.name; }).join(', ') + ', because one input has two outputs.', 'Functions: <b>' + list.filter(function (c) { return c.fn; }).map(function (c) { return c.name; }).join(', ') + '</b>. Same outputs, flat lines and no pattern are all fine.'],
      why: { M15: 'Same outputs, flat lines and points with no pattern are all fine. A card is only "not a function" when one input has two outputs.', M6: 'An input with two different outputs breaks the rule, even if the rest of the card looks fine.' },
      steps: pick.map(function (c) { var i = list.indexOf(c); return { label: 'Card ' + LET[i] + ': ' + c.q, part: yn(!c.fn), hint: c.hint }; })
    };
  } });

  C.add({ id: 'FN-4a', skill: '4', level: 4, order: 4, type: 'FR', gen: function (R) {
    var rep = R.chance(0.6), rows, r, y1, y2, c, xs;
    if (rep) {
      xs = R.distinct(4, -4, 9); r = xs[R.int(0, 3)]; y1 = R.int(-6, 12);
      do { y2 = R.int(-6, 12); } while (y2 === y1);
      rows = xs.map(function (x) { return [x, x === r ? y1 : R.int(-6, 12)]; });
      rows.push([r, y2]); rows = R.shuffle(rows);
    } else {
      xs = R.distinct(5, -4, 9); c = R.int(-5, 9);
      rows = xs.map(function (x) { return [x, c]; });
    }
    // the Yes/No part carries the verdict; the sentence is judged on its reason (see judge4a), not on its first word
    var text = rep
      ? { kind: 'text', label: 'Explain', sample: 'No. The input ' + f(r) + ' has two different outputs, ' + f(y1) + ' and ' + f(y2) + '.', tag: 'M6' }
      : { kind: 'text', label: 'Explain', sample: 'Yes. Each input has exactly one output. The outputs are all the same, and that is allowed.', tag: 'M15' };
    var item = {
      stem: 'Is y a function of x in this table? Choose, then explain in a sentence.',
      fig: C.table({ cols: ['x', 'y'], rows: rows }),
      think: 'Look down the x column first.',
      parts: [
        { kind: 'choice', label: 'Is it a function?', keep: true, opts: [{ t: 'Yes, it is a function', ok: !rep, tag: rep ? 'M6' : undefined }, { t: 'No, it is not a function', ok: rep, tag: rep ? undefined : 'M15' }] },
        text
      ],
      answer: rep ? 'No: the input ' + f(r) + ' has two outputs, ' + f(y1) + ' and ' + f(y2) : 'Yes: each input has exactly one output (all the outputs are ' + f(c) + ')',
      work: rep
        ? ['Look down the x column: x = ' + f(r) + ' appears twice.', 'x = ' + f(r) + ' has outputs ' + f(y1) + ' and ' + f(y2) + '.', 'One input with two outputs, so <b>not a function</b>.']
        : ['Look down the x column: no x-value appears twice.', 'Every y is ' + f(c) + '. Repeated outputs are allowed.', 'Each input has exactly one output, so it <b>is a function</b>.'],
      why: rep
        ? { M6: 'The input ' + f(r) + ' appears twice with outputs ' + f(y1) + ' and ' + f(y2) + '. One input with two outputs breaks the function rule.' }
        : { M15: 'Every y being ' + f(c) + ' does not break the rule. No input has two outputs, so it is a function, even with no pattern in x.' },
      steps: rep
        ? [
          { label: 'Which x-value appears twice?', part: { kind: 'num', key: r }, hint: 'Read down the x column.' },
          { label: 'Does x = ' + f(r) + ' have two different outputs?', part: yn(true), hint: 'Its outputs are ' + f(y1) + ' and ' + f(y2) + '.' },
          { label: 'So is y a function of x?', part: yn(false, 'M6'), hint: 'One input with two outputs breaks the rule.' }
        ]
        : [
          { label: 'Does any x-value appear twice?', part: yn(false), hint: 'Read down the x column: they are all different.' },
          { label: 'How many outputs does each input have?', part: { kind: 'num', key: 1 }, hint: 'Each x appears once, with y = ' + f(c) + '.' },
          { label: 'So is y a function of x?', part: yn(true, null, 'M15'), hint: 'Same outputs are fine. Each input has one output.' }
        ],
      check: function (vals) {
        if (vals[0] !== (rep ? 1 : 0)) return null;               // wrong verdict: the choice part's tag stands
        return judge4a(vals[1], rep, r, y1, y2) ? { ok: true } : { ok: false, tag: text.tag };
      }
    };
    return item;
  } });
  // FN-4a's sentence rubric. rep: an input repeats with two outputs (answer No); otherwise every x is different (answer Yes).
  // drop a leading verdict word ("Yes," / "No because"), but keep "No x-value repeats" whole
  function nt(s, rep) {
    var raw = String(s || ''), t = C.norm(raw).replace(/([a-z])-([a-z])/g, '$1 $2').trim();
    if (/^yes\b/.test(t) || (/^no\b/.test(t) && (rep || /^\s*no\s*[,.!:;]/i.test(raw)))) t = t.replace(/^(yes|no)\b\s*/, '');
    return ' ' + t + ' ';
  }
  function hasN(t, n) { n = Math.abs(n); return t.indexOf(' ' + n + ' ') >= 0 || t.indexOf(' -' + n + ' ') >= 0; }
  function judge4a(s, rep, r, y1, y2) {
    var t = nt(s, rep), H = function (w) { return C.hasAny(t, w); };
    if (!t.trim()) return false;
    var inp = H(['input', 'inputs', 'x', 'x value', 'x values', 'xs', 'domain']);
    if (rep) {
      var outw = H(['output', 'outputs', 'y', 'ys', 'y value', 'y values', 'range', 'answers', 'results']);
      var both = hasN(t, y1) && hasN(t, y2);
      var many = H(['two', '2', 'different', 'more than one', 'multiple', 'both', 'twice', 'repeat', 'repeats', 'repeated', 'again', 'another', 'goes to', 'go to', 'maps to', 'paired with']);
      var contra = H(['is a function', 'no x', 'no input', 'no x value', 'no inputs', 'each input has one', 'every input has one', 'each x has one', 'every x has one', 'each input has exactly one', 'only one output', 'doesn t repeat', 'don t repeat', 'does not repeat', 'do not repeat', 'never']);
      return !contra && (inp || hasN(t, r)) && ((outw && many) || both);
    }
    var one = H(['one', '1', 'only one', 'exactly one', 'single', 'unique', 'its own']) || /(each|every) (input|x|x value)s? (has|have|gets|goes to|gives) the same/.test(t);
    var negMany = H(['no', 'not', 'never', 'none', 'doesn t', 'don t', 'isn t', 'aren t', 'without', 'nothing']) && H(['two', '2', 'more than one', 'repeat', 'repeats', 'repeated', 'twice', 'different', 'multiple', 'again', 'same x', 'same input']);
    var distinct = H(['all different', 'are different', 'is different', 'each different', 'different x', 'different inputs', 'unique']);
    var contra2 = H(['not a function', 'isn t a function', 'is not a function']);
    var reversed = /(each|every) (output|y|y value)s? (has|have|goes|comes|gets|maps)/.test(t) && !/(each|every) (input|x|x value)s? /.test(t);
    return !contra2 && !reversed && inp && (one || negMany || distinct);
  }

  /* ---------------- Skill 5 Functions in context ---------------- */
  // each pair: f is a function (input → exactly one output); r reverses it and is not a function
  var POOL = [
    { f: 'each student → their birthday', r: 'each birthday month → a student born in that month', fx: 'A student has only one birthday.', rx: 'Many students can be born in the same month.', fin: 'student', fout: 'birthday', rin: 'month' },
    { f: 'each city → the country it is in', r: 'each country → a city in it', fx: 'A city is in only one country.', rx: 'A country has many cities.', fin: 'city', fout: 'country', rin: 'country' },
    { f: 'each postcode → the city it is in', r: 'each city → a postcode in it', fx: 'A postcode belongs to one city.', rx: 'A city has many postcodes.', fin: 'postcode', fout: 'city', rin: 'city' },
    { f: 'each number → its square', r: 'each number → a number whose square is it', fx: 'A number has only one square, for example 3 → 9.', rx: '9 could go to 3 or to −3.', fin: 'number', fout: 'square', rin: 'number' },
    { f: 'each phone in the class → its owner\'s name', r: 'each first name → a phone in the class', fx: 'A phone has one owner.', rx: 'Two students can share a first name and own different phones.', fin: 'phone', fout: 'name', rin: 'first name' },
    { f: 'each day → its high temperature', r: 'each temperature → a day it was that hot', fx: 'A day has only one high temperature.', rx: 'Many days can reach the same temperature.', fin: 'day', fout: 'temperature', rin: 'temperature' },
    { f: 'each book → its number of pages', r: 'each number of pages → a book with that many pages', fx: 'A book has one number of pages.', rx: 'Many books can have 200 pages.', fin: 'book', fout: 'number of pages', rin: 'number of pages' },
    { f: 'each student → their class teacher', r: 'each teacher → a student they teach', fx: 'A student has one class teacher.', rx: 'A teacher teaches many students.', fin: 'student', fout: 'teacher', rin: 'teacher' }
  ];
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // why a reversed pair from POOL is not a function, in the words of the relationship the student picked
  function notWhy(e) { return 'In "' + e.r + '", ' + e.rx.charAt(0).toLowerCase() + e.rx.slice(1) + ' So one ' + e.rin + ' (the input) can go with more than one output: not a function.'; }

  C.add({ id: 'FN-5a', skill: '5', level: 5, order: 1, type: 'MC', gen: function (R) {
    var pick = R.shuffle(POOL).slice(0, 3), key = pick[0];
    var opts = [{ t: cap(key.f), ok: true }, { t: cap(key.r), tag: 'M6', why: notWhy(key) }, { t: cap(pick[1].r), tag: 'M6', why: notWhy(pick[1]) }, { t: cap(pick[2].r), tag: 'M6', why: notWhy(pick[2]) }];
    var item = {
      stem: 'Which relationship is a function? Each one is written input → output.',
      think: 'If you know the input, do you know exactly one output?',
      parts: [{ kind: 'choice', label: 'Function', opts: opts }],
      answer: cap(key.f),
      work: ['Ask: does knowing the input tell you exactly one output?', cap(key.f) + ': yes. ' + key.fx, cap(key.r) + ': no. ' + key.rx, 'So the function is <b>' + key.f + '</b>.'],
      // set to the picked option's own reason when the answer is graded (see check)
      why: { M6: 'In the one you picked, one input can go with more than one output, so it is not a function. ' + cap(key.f) + ' is: ' + key.fx.charAt(0).toLowerCase() + key.fx.slice(1) },
      check: function (vals) { var o = opts[vals[0]]; if (o && o.why) item.why.M6 = o.why; return null; },
      steps: [
        { label: cap(key.f) + '. Can one ' + key.fin + ' have two different outputs?', part: yn(false), hint: key.fx },
        { label: cap(key.r) + '. Can one ' + key.rin + ' have two different outputs?', part: yn(true), hint: key.rx },
        { label: 'So which one is a function?', part: { kind: 'choice', keep: true, opts: [{ t: cap(key.f), ok: true }, { t: cap(key.r), tag: 'M6' }] }, hint: 'The function gives each input exactly one output.' }
      ]
    };
    return item;
  } });

  // FN-5d's own situations (none of them appear in FN-5a's POOL)
  var SORT_FN = [
    { t: 'each person → their age in years', x: 'A person has only one age at a time. Many people sharing an age is fine.' },
    { t: 'each car → its number plate', x: 'A car has only one number plate.' },
    { t: 'each country → its capital city', x: 'A country has one capital city.' },
    { t: 'each item in a shop → its price', x: 'An item has one price, even if other items cost the same.' },
    { t: 'each student → how many brothers and sisters they have', x: 'A student has one number of brothers and sisters. Many students sharing a number is fine.' },
    { t: 'each runner in a race → their finishing time', x: 'A runner finishes the race only once, so they have one finishing time.' }
  ];
  var SORT_NOT = [
    { t: 'each parent → their child', x: 'A parent can have two or more children.' },
    { t: 'each letter of the alphabet → a word starting with it', x: 'The letter B starts many words, such as bag and box.' },
    { t: 'each sports team → a player on it', x: 'A team has many players.' },
    { t: 'each street → a house on it', x: 'A street has many houses.' },
    { t: 'each school subject → a student who takes it', x: 'Many students take each subject.' },
    { t: 'each colour → a car of that colour', x: 'Many cars can be the same colour.' }
  ];

  C.add({ id: 'FN-5d', skill: '5', level: 4, type: 'DM', ia: true, gen: function (R) {
    var nf = R.int(1, 3);
    var list = R.shuffle(R.shuffle(SORT_FN).slice(0, nf).map(function (c) { return { t: c.t, fn: true, x: c.x }; })
      .concat(R.shuffle(SORT_NOT).slice(0, 4 - nf).map(function (c) { return { t: c.t, fn: false, x: c.x }; })));
    list.forEach(function (c) {
      c.why = c.fn ? '"' + cap(c.t) + '" is a function. ' + c.x + ' Repeated outputs are allowed; what matters is one output for each input.'
        : '"' + cap(c.t) + '" is not a function. ' + c.x + ' So one input can go with more than one output.';
    });
    var cards = list.map(function (c, i) { return { t: '<b>' + LET[i] + '</b>: ' + cap(c.t), bin: c.fn ? 0 : 1, tag: 'M6' }; });
    var nn = 4 - nf;
    var item = {
      stem: 'Sort the 4 situations (input → output) into "Function" and "Not a function".',
      think: 'Does one input always give exactly one output?',
      parts: [{ kind: 'sort', label: 'Situations', bins: ['Function', 'Not a function'], cards: cards }],
      answer: list.map(function (c, i) { return LET[i] + ': ' + (c.fn ? 'function' : 'not a function'); }).join(', '),
      work: ['Ask of each: does one input always give exactly one output?',
        list.map(function (c, i) { return c.fn ? LET[i] + ': ' + c.x : ''; }).filter(String).join(' ') + ' <b>' + (nf === 1 ? 'A function.' : 'Functions.') + '</b>',
        list.map(function (c, i) { return c.fn ? '' : LET[i] + ': ' + c.x; }).filter(String).join(' ') + ' <b>' + (nn === 1 ? 'Not a function.' : 'Not functions.') + '</b>'],
      // set to the first misplaced card's own reason when the answer is graded (the same card the M6 tag comes from)
      why: { M6: 'Check each card: a situation is a function only when every input has exactly one output. Repeated outputs are allowed.' },
      check: function (vals) {
        var put = vals[0] || [];
        list.some(function (c, k) { if (put[k] != null && put[k] >= 0 && put[k] !== cards[k].bin) { item.why.M6 = c.why; return true; } });
        return null;
      },
      steps: list.map(function (c, i) { return { label: LET[i] + ': ' + cap(c.t) + '. Can one input have two different outputs?', part: yn(!c.fn), hint: c.x }; })
    };
    return item;
  } });

  C.add({ id: 'FN-5b', skill: '5', level: 5, order: 2, type: 'MC', gen: function (R) {
    var c1 = R.int(8, 15), c2 = c1 + R.int(3, 8), c3 = c2 + R.int(3, 8);
    var kg = function (v) { return f(v, 'dec'); };     // 2.5 kg, not 5/2 kg
    if (R.chance(0.5)) {
      // overlapping bands: some weights get two prices, so cost is NOT a function of weight
      var top = R.pick([2, 3]), from = top === 3 ? R.pick([1, 2]) : 1, wo = from + 0.5;
      return {
        stem: 'A shop\'s postage list says: up to ' + top + ' kg costs ' + c1 + ' riyals, and from ' + from + ' kg up to 5 kg costs ' + c2 + ' riyals. Is cost a function of weight?',
        think: 'The input is the weight. Does one weight ever have two costs?',
        parts: [{ kind: 'choice', label: 'Is cost a function of weight?', opts: [
          { t: 'No, some weights have two different costs', ok: true },
          { t: 'Yes, every weight has a cost', tag: 'M6' },
          { t: 'No, there is no formula', tag: 'M15' },
          { t: 'Yes, because cost goes up as weight goes up', tag: 'M7' }
        ] }],
        answer: 'No, some weights have two different costs (a ' + kg(wo) + ' kg parcel could cost ' + c1 + ' or ' + c2 + ' riyals)',
        work: ['The input is weight; the output is cost.', 'The two bands overlap from ' + from + ' kg to ' + top + ' kg. A ' + kg(wo) + ' kg parcel is in both, so it could cost ' + c1 + ' or ' + c2 + ' riyals.', 'One input with two outputs, so <b>no, cost is not a function of weight</b>.'],
        why: { M6: 'Every weight having a cost is not enough. A ' + kg(wo) + ' kg parcel is in both bands, so it has two costs: ' + c1 + ' and ' + c2 + ' riyals.', M15: 'Not having a formula is not the reason. It fails because a ' + kg(wo) + ' kg parcel has two costs, ' + c1 + ' and ' + c2 + ' riyals.', M7: 'Going up does not make it a function. A ' + kg(wo) + ' kg parcel has two costs, ' + c1 + ' and ' + c2 + ' riyals, so it is not one.' },
        steps: [
          { label: 'Is a ' + kg(wo) + ' kg parcel in the "up to ' + top + ' kg" band?', part: yn(true), hint: kg(wo) + ' kg is less than ' + top + ' kg.' },
          { label: 'Is it also in the "from ' + from + ' kg up to 5 kg" band?', part: yn(true), hint: kg(wo) + ' kg is more than ' + from + ' kg.' },
          { label: 'So how many different costs could a ' + kg(wo) + ' kg parcel have?', part: { kind: 'num', key: 2 }, hint: c1 + ' riyals and ' + c2 + ' riyals.' },
          { label: 'So is cost a function of weight?', part: yn(false, 'M6'), hint: 'One input (weight) with two outputs (costs) breaks the rule.' }
        ]
      };
    }
    var w = R.pick([0.5, 1, 2, 2.5, 3, 4, 4.5]), cw = w <= 1 ? c1 : w <= 3 ? c2 : c3;
    return {
      stem: 'Postage costs ' + c1 + ' riyals up to 1 kg, ' + c2 + ' riyals over 1 kg up to 3 kg, and ' + c3 + ' riyals over 3 kg up to 5 kg. Is cost a function of weight?',
      think: 'The input is the weight. Does one weight ever have two costs?',
      parts: [{ kind: 'choice', label: 'Is cost a function of weight?', opts: [
        { t: 'Yes, every weight has one cost', ok: true },
        { t: 'No, many weights have the same cost', tag: 'M6' },
        { t: 'No, there is no formula', tag: 'M15' },
        { t: 'Yes, because cost always goes up', tag: 'M7' }
      ] }],
      answer: 'Yes, every weight has one cost',
      work: ['The input is weight; the output is cost.', 'Pick any weight: a ' + kg(w) + ' kg parcel costs ' + cw + ' riyals, and only that.', 'Many weights sharing a cost is fine, and there does not need to be one formula. <b>Yes, every weight has one cost.</b>'],
      why: { M6: 'Many weights sharing one cost is allowed. The rule is about inputs: each weight has only one cost.', M15: 'A function does not need a single formula. Each weight has exactly one cost, so it is a function.', M7: 'Going up is not what makes it a function. It is a function because each weight has exactly one cost.' },
      steps: [
        { label: 'What does a ' + kg(w) + ' kg parcel cost (riyals)?', part: { kind: 'num', key: cw }, hint: kg(w) + ' kg is in the "' + (w <= 1 ? 'up to 1 kg' : w <= 3 ? 'over 1 kg up to 3 kg' : 'over 3 kg up to 5 kg') + '" band.' },
        { label: 'Could a ' + kg(w) + ' kg parcel have two different costs?', part: yn(false), hint: 'Each weight falls in exactly one band.' },
        { label: 'So is cost a function of weight?', part: yn(true, null, 'M6'), hint: 'Each input (weight) has one output (cost). Sharing a cost is fine.' }
      ]
    };
  } });

  C.add({ id: 'FN-5c', skill: '5', level: 5, order: 3, type: 'TT', gen: function (R) {
    var a = R.name(), b; do { b = R.name(); } while (b === a);
    var inputStep = function (ctx) { return { label: 'What is the input?', part: { kind: 'choice', keep: true, opts: [{ t: ctx.inp, ok: true }, { t: ctx.out, tag: 'M6' }] }, hint: 'It is "' + ctx.out + ' as a function of ' + ctx.inp + '": the input comes after "of".' }; };
    if (R.chance(0.5)) {
      // a Yes case: the input really does fix the output, even though outputs repeat
      var cl = '8' + R.pick(['A', 'B', 'C', 'D']), dob = R.int(1, 28) + ' ' + R.pick(['March', 'May', 'June', 'October']) + ' ' + R.int(2011, 2013), id = R.int(2001, 2399);
      var cy = R.pick([
        { inp: 'date of birth', out: 'age in years', outs: 'ages', who: 'class', rs: 'Two students with the same date of birth always have the same age', s2: a + ' and ' + b + ' were both born on ' + dob + '. Can they be different ages today?', h2: 'Same date of birth, so the same age today.', w2: 'Anyone born on ' + dob + ' is the same age today. Many dates give the same age, and that is fine.' },
        { inp: 'class', out: 'class teacher', outs: 'class teachers', who: 'school', rs: 'Two students in the same class always have the same class teacher', s2: a + ' and ' + b + ' are both in ' + cl + '. Can they have different class teachers?', h2: 'A class has only one class teacher.', w2: 'Everyone in ' + cl + ' has the same class teacher. One teacher may have more than one class, and that is fine.' },
        { inp: 'student ID number', out: 'first name', outs: 'first names', who: 'school', rs: 'Each student ID number belongs to just one student, so it gives one first name', s2: 'The student ID number ' + id + ' belongs to ' + a + '. Can that ID number go with a second, different first name?', h2: 'Each ID number belongs to only one student.', w2: 'The ID number ' + id + ' belongs to one student, so it gives one first name. Two students can share a first name with different ID numbers, and that is fine.' }
      ]);
      return {
        stem: 'Is a student\'s ' + cy.out + ' a function of their ' + cy.inp + ', for everyone in your ' + cy.who + '? Choose an answer and a reason.',
        think: 'The input is ' + cy.inp + '. Can one ' + cy.inp + ' go with two different ' + cy.outs + '?',
        parts: [
          { kind: 'choice', label: 'Answer', keep: true, opts: [{ t: 'Yes', ok: true }, { t: 'No', tag: 'M6' }] },
          { kind: 'choice', label: 'Reason', opts: [
            { t: cy.rs, ok: true },
            { t: 'Each ' + cy.out + ' goes with only one ' + cy.inp, tag: 'M6' },
            { t: 'There is a formula for it', tag: 'M15' }
          ] }
        ],
        answer: 'Yes: ' + cy.rs.charAt(0).toLowerCase() + cy.rs.slice(1),
        work: ['The input is ' + cy.inp + ' and the output is ' + cy.out + '.', cy.w2, 'Each input has exactly one output, so <b>yes, it is a function</b>.'],
        why: { M6: 'Check the inputs, not the outputs. ' + cy.w2 + ' Each ' + cy.inp + ' gives one ' + cy.out + ', so it is a function.', M15: 'A function does not need a formula. It is a function because each ' + cy.inp + ' gives exactly one ' + cy.out + '.' },
        steps: [
          inputStep(cy),
          { label: cy.s2, part: yn(false), hint: cy.h2 },
          { label: 'So is ' + cy.out + ' a function of ' + cy.inp + '?', part: yn(true, null, 'M6'), hint: 'Each input has one output. Outputs repeating is fine.' }
        ]
      };
    }
    var ctx = R.pick([
      { inp: 'age', out: 'height', outs: 'heights', unit: 'cm', lo: 140, hi: 170, n: R.int(12, 14), u: ' years old', big: 'older students are always taller' },
      { inp: 'age', out: 'shoe size', outs: 'shoe sizes', unit: '', lo: 36, hi: 44, n: R.int(12, 14), u: ' years old', big: 'older students always have bigger feet' },
      { inp: 'height', out: 'mass', outs: 'masses', unit: 'kg', lo: 40, hi: 60, n: R.int(150, 165), u: ' cm tall', big: 'taller students always weigh more' }
    ]);
    var h1 = R.int(ctx.lo, ctx.hi), h2; do { h2 = R.int(ctx.lo, ctx.hi); } while (h2 === h1);
    var un = ctx.unit ? ' ' + ctx.unit : '';
    return {
      stem: 'Is a student\'s ' + ctx.out + ' a function of their ' + ctx.inp + ', for everyone in your class? Choose an answer and a reason.',
      think: 'The input is ' + ctx.inp + '. Can one ' + ctx.inp + ' go with two different ' + ctx.outs + '?',
      parts: [
        { kind: 'choice', label: 'Answer', keep: true, opts: [{ t: 'Yes', tag: 'M6' }, { t: 'No', ok: true }] },
        { kind: 'choice', label: 'Reason', opts: [
          { t: 'Two students with the same ' + ctx.inp + ' can have different ' + ctx.outs, ok: true },
          { t: cap(ctx.outs) + ' don\'t follow a formula', tag: 'M15' },
          { t: cap(ctx.big) }
        ] }
      ],
      answer: 'No: two students with the same ' + ctx.inp + ' can have different ' + ctx.outs,
      work: ['The input is ' + ctx.inp + ' and the output is ' + ctx.out + '.', 'Say ' + a + ' and ' + b + ' are both ' + ctx.n + ctx.u + ', but ' + a + '\'s ' + ctx.out + ' is ' + h1 + un + ' and ' + b + '\'s is ' + h2 + un + '.', 'One input with two outputs, so <b>no, it is not a function</b>.'],
      why: { M6: 'The input is ' + ctx.inp + '. Two students who are both ' + ctx.n + ctx.u + ' can have different ' + ctx.outs + ', so one input has two outputs.', M15: 'Not having a formula is not the reason. A function only needs one output for each input; here one ' + ctx.inp + ' can have two ' + ctx.outs + '.' },
      steps: [
        inputStep(ctx),
        { label: a + ' and ' + b + ' are both ' + ctx.n + ctx.u + '. Can they have different ' + ctx.outs + '?', part: yn(true), hint: 'Yes: ' + h1 + un + ' and ' + h2 + un + ', for example.' },
        { label: 'So is ' + ctx.out + ' a function of ' + ctx.inp + '?', part: yn(false, 'M6'), hint: 'One input with two outputs breaks the rule.' }
      ]
    };
  } });

  C.add({ id: 'FN-6a', skill: '5', level: 6, type: 'NE', gen: function (R) {
    var v = R.distinct(7, 1, 9), a = v[0], b = v[1], c = v[2], p = v[3], q = v[4], r = v[5], s = v[6];
    return {
      stem: 'The set of pairs {(' + a + ', ' + p + '), (' + b + ', ' + q + '), (<i>k</i>, ' + r + '), (' + c + ', ' + s + ')} is <b>NOT</b> a function. What could <i>k</i> be? Give one value.',
      think: 'To break the rule, one input must have two outputs.',
      parts: [{ kind: 'num', label: 'k', key: a, wrong: [{ v: p, tag: 'M6' }, { v: q, tag: 'M6' }, { v: r, tag: 'M6' }, { v: s, tag: 'M6' }] }],
      check: function (vals) {
        var n = C.parseNum(vals[0]);
        if (isFinite(n) && [a, b, c].some(function (x) { return C.near(n, x); })) return { ok: true };
        return { ok: false, tag: (isFinite(n) && [p, q, r, s].some(function (x) { return C.near(n, x); })) ? 'M6' : null };
      },
      answer: 'k = ' + a + ', ' + b + ' or ' + c,
      work: ['The inputs are the first numbers: ' + a + ', ' + b + ', k and ' + c + '.', 'To break the function rule, k must repeat an input already used, with a different output.', 'For example k = ' + a + ': then ' + a + ' goes to ' + p + ' and to ' + r + '. So k = <b>' + a + ', ' + b + ' or ' + c + '</b>.'],
      why: { M6: 'That number is an output. Repeating an output is allowed; k is an input, so it must repeat ' + a + ', ' + b + ' or ' + c + '.' },
      steps: [
        { label: 'In (k, ' + r + '), is k an input or an output?', part: { kind: 'choice', keep: true, opts: [{ t: 'Input', ok: true }, { t: 'Output', tag: 'M6' }] }, hint: 'The first number in an ordered pair is the input.' },
        { label: 'If k = ' + a + ', how many different outputs does the input ' + a + ' have?', part: { kind: 'num', key: 2 }, hint: a + ' would go to ' + p + ' and to ' + r + '.' },
        { label: 'Give one value k could be.', part: { kind: 'num', key: a }, hint: 'Repeat an input already used: ' + a + ', ' + b + ' or ' + c + '.' }
      ]
    };
  } });
})();
