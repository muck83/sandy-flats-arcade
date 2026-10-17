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
    var hc = R.nz(-5, 5), vc = R.nz(-5, 5);
    var sx = R.distinct(6, -5, 5), sp = sx.map(function (x) { return { x: x, y: R.int(-5, 5), r: 5 }; });
    var dx = R.distinct(4, -5, 5), dpts = dx.map(function (x) { return { x: x, y: R.int(-5, 5), r: 5 }; }), shared = dx[0], ya = dpts[0].y, yb;
    do { yb = R.int(-5, 5); } while (yb === ya);
    dpts.push({ x: shared, y: yb, r: 5 });
    var b1 = R.int(-5, 5), b2 = R.int(-5, 5), b3 = R.int(-5, 5), b4 = R.int(-5, 5);
    var broken = mini([{ seg: [[-5, b1], [-1, b2]] }, { seg: [[1, b3], [5, b4]] }], [{ x: -5, y: b1, r: 4 }, { x: -1, y: b2, r: 4 }, { x: 1, y: b3, r: 4 }, { x: 5, y: b4, r: 4 }], 'Graph of a line in two pieces');
    var opts = R.shuffle([
      { t: mini([{ m: 0, b: hc }], [], 'Graph of a horizontal line'), ok: true, missTag: 'M15' },
      { t: mini([], sp, 'Graph of six scattered points'), ok: true, missTag: 'M15' },
      { t: mini([{ p: [[vc, -6], [vc, 6]] }], [], 'Graph of a vertical line'), ok: false },
      { t: broken, ok: true, missTag: 'M15' },
      { t: mini([], dpts, 'Graph of five points, two above the same x'), ok: false }
    ]);
    return {
      stem: 'Select <b>all</b> the graphs that show y as a function of x.',
      think: 'For each graph: does any x have two different y-values?',
      parts: [{ kind: 'multi', label: 'Functions', opts: opts }],
      answer: 'The horizontal line, the scattered points and the line in two pieces',
      work: ['Check each input: one output each means a function.', 'The vertical line at x = ' + f(vc) + ' gives that one input endless outputs, and the points at x = ' + f(shared) + ' give it two outputs (' + f(ya) + ' and ' + f(yb) + '). Not functions.', 'The horizontal line, the scattered points and the line in two pieces give every x one y.', 'Graphs do not need to be connected, slanted or follow a rule: <b>horizontal line, scattered points, two-piece line</b>.'],
      why: { M15: 'A graph does not need to be slanted, connected or follow a rule. The horizontal line, the scattered points and the two-piece line each give every x exactly one y.' },
      steps: [
        { label: 'The vertical line at x = ' + f(vc) + ': how many outputs does the input ' + f(vc) + ' have?', part: { kind: 'choice', keep: true, opts: [{ t: 'Exactly one' }, { t: 'Many', ok: true }] }, hint: 'Every point on that line has x = ' + f(vc) + '.' },
        { label: 'In the graph of five points, which x-value has two points above or below it?', part: { kind: 'num', key: shared }, hint: 'Look for two points in the same column.' },
        { label: 'The horizontal line y = ' + f(hc) + ': is y a function of x?', part: yn(true, null, 'M15'), hint: 'Every input has the same output, ' + f(hc) + '. That is still one output each.' },
        { label: 'The line in two pieces: does any x have two points?', part: yn(false), hint: 'The pieces do not overlap: one stops at x = −1, the other starts at x = 1.' }
      ]
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
    var inW = ['input', 'inputs', 'x', 'x-value', 'x-values', 'x value', 'domain', String(rep ? r : 'input')], outW = ['output', 'outputs', 'y', 'y-value', 'y-values', 'y value', 'range'];
    var text = rep
      ? { kind: 'text', label: 'Explain', need: [inW, ['two', '2', 'more than one', 'different', 'multiple', 'both']], not: ['is a function'], notFirst: ['yes'], sample: 'No. The input ' + f(r) + ' has two different outputs, ' + f(y1) + ' and ' + f(y2) + '.', tag: 'M6' }
      : { kind: 'text', label: 'Explain', need: [inW, ['one', '1', 'exactly one', 'only one', 'single', 'each', 'every']], not: ['not a function', 'is not', 'isn t', 'two outputs'], notFirst: ['no'], sample: 'Yes. Each input has exactly one output. The outputs are all the same, and that is allowed.', tag: 'M15' };
    text.need.push(outW);
    return {
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
        ]
    };
  } });

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

  C.add({ id: 'FN-5a', skill: '5', level: 5, order: 1, type: 'MC', gen: function (R) {
    var pick = R.shuffle(POOL).slice(0, 3), key = pick[0];
    var opts = [{ t: cap(key.f), ok: true }, { t: cap(key.r), tag: 'M6' }, { t: cap(pick[1].r), tag: 'M6' }, { t: cap(pick[2].r), tag: 'M6' }];
    return {
      stem: 'Which relationship is a function? Each one is written input → output.',
      think: 'If you know the input, do you know exactly one output?',
      parts: [{ kind: 'choice', label: 'Function', opts: opts }],
      answer: cap(key.f),
      work: ['Ask: does knowing the input tell you exactly one output?', cap(key.f) + ': yes. ' + key.fx, cap(key.r) + ': no. ' + key.rx, 'So the function is <b>' + key.f + '</b>.'],
      why: { M6: 'That one goes the other way. ' + key.rx + ' One input can have many outputs, so it is not a function.' },
      steps: [
        { label: cap(key.f) + '. Can one ' + key.fin + ' have two different outputs?', part: yn(false), hint: key.fx },
        { label: cap(key.r) + '. Can one ' + key.rin + ' have two different outputs?', part: yn(true), hint: key.rx },
        { label: 'So which one is a function?', part: { kind: 'choice', keep: true, opts: [{ t: cap(key.f), ok: true }, { t: cap(key.r), tag: 'M6' }] }, hint: 'The function gives each input exactly one output.' }
      ]
    };
  } });

  C.add({ id: 'FN-5d', skill: '5', level: 4, type: 'DM', ia: true, gen: function (R) {
    var pk = R.shuffle(POOL).slice(0, 2);
    var list = R.shuffle([
      { t: pk[0].f, fn: true, x: pk[0].fx }, { t: pk[0].r, fn: false, x: pk[0].rx },
      { t: pk[1].f, fn: true, x: pk[1].fx }, { t: pk[1].r, fn: false, x: pk[1].rx }
    ]);
    return {
      stem: 'Sort the 4 situations (input → output) into "Function" and "Not a function".',
      think: 'Does one input always give exactly one output?',
      parts: [{ kind: 'sort', label: 'Situations', bins: ['Function', 'Not a function'], cards: list.map(function (c, i) { return { t: '<b>' + LET[i] + '</b>: ' + cap(c.t), bin: c.fn ? 0 : 1, tag: 'M6' }; }) }],
      answer: list.map(function (c, i) { return LET[i] + ': ' + (c.fn ? 'function' : 'not a function'); }).join(', '),
      work: ['Ask of each: does one input always give exactly one output?',
        list.map(function (c, i) { return c.fn ? LET[i] + ': ' + c.x : ''; }).filter(String).join(' ') + ' <b>Functions.</b>',
        list.map(function (c, i) { return c.fn ? '' : LET[i] + ': ' + c.x; }).filter(String).join(' ') + ' <b>Not functions.</b>'],
      why: { M6: 'Check which way the arrow goes. ' + cap(pk[0].f) + ' is a function, but turned around (' + pk[0].r + ') one input can have many outputs.' },
      steps: list.map(function (c, i) { return { label: LET[i] + ': ' + cap(c.t) + '. Can one input have two different outputs?', part: yn(!c.fn), hint: c.x }; })
    };
  } });

  C.add({ id: 'FN-5b', skill: '5', level: 5, order: 2, type: 'MC', gen: function (R) {
    var c1 = R.int(8, 15), c2 = c1 + R.int(3, 8), c3 = c2 + R.int(3, 8);
    var w = R.pick([0.5, 2, 2.5, 4, 4.5]), cw = w < 1 ? c1 : w < 3 ? c2 : c3;
    return {
      stem: 'Postage costs ' + c1 + ' riyals up to 1 kg, ' + c2 + ' riyals from 1 kg up to 3 kg, and ' + c3 + ' riyals from 3 kg up to 5 kg. Is cost a function of weight?',
      think: 'The input is the weight. Does one weight ever have two costs?',
      parts: [{ kind: 'choice', label: 'Is cost a function of weight?', opts: [
        { t: 'Yes, every weight has one cost', ok: true },
        { t: 'No, many weights have the same cost', tag: 'M6' },
        { t: 'No, there is no formula', tag: 'M15' },
        { t: 'Yes, because cost always goes up', tag: 'M7' }
      ] }],
      answer: 'Yes, every weight has one cost',
      work: ['The input is weight; the output is cost.', 'Pick any weight: a ' + f(w) + ' kg parcel costs ' + cw + ' riyals, and only that.', 'Many weights sharing a cost is fine, and there does not need to be one formula. <b>Yes, every weight has one cost.</b>'],
      why: { M6: 'Many weights sharing one cost is allowed. The rule is about inputs: each weight has only one cost.', M15: 'A function does not need a single formula. Each weight has exactly one cost, so it is a function.', M7: 'Going up is not what makes it a function. It is a function because each weight has exactly one cost.' },
      steps: [
        { label: 'What does a ' + f(w) + ' kg parcel cost (riyals)?', part: { kind: 'num', key: cw }, hint: f(w) + ' kg is in the ' + (w < 1 ? 'up to 1 kg' : w < 3 ? '1 kg to 3 kg' : '3 kg to 5 kg') + ' band.' },
        { label: 'Could a ' + f(w) + ' kg parcel have two different costs?', part: yn(false), hint: 'Each weight falls in exactly one band.' },
        { label: 'So is cost a function of weight?', part: yn(true, null, 'M6'), hint: 'Each input (weight) has one output (cost). Sharing a cost is fine.' }
      ]
    };
  } });

  C.add({ id: 'FN-5c', skill: '5', level: 5, order: 3, type: 'TT', gen: function (R) {
    var ctx = R.pick([
      { inp: 'age', out: 'height', unit: 'cm', lo: 140, hi: 170, n: R.int(12, 14), u: ' years old', big: 'older students are always taller' },
      { inp: 'age', out: 'shoe size', unit: '', lo: 36, hi: 44, n: R.int(12, 14), u: ' years old', big: 'older students always have bigger feet' },
      { inp: 'height', out: 'mass', unit: 'kg', lo: 40, hi: 60, n: R.int(150, 165), u: ' cm tall', big: 'taller students always weigh more' }
    ]);
    var a = R.name(), b; do { b = R.name(); } while (b === a);
    var h1 = R.int(ctx.lo, ctx.hi), h2; do { h2 = R.int(ctx.lo, ctx.hi); } while (h2 === h1);
    var un = ctx.unit ? ' ' + ctx.unit : '';
    return {
      stem: 'Is a student\'s ' + ctx.out + ' a function of their ' + ctx.inp + ', for everyone in your class? Choose an answer and a reason.',
      think: 'The input is ' + ctx.inp + '. Can one ' + ctx.inp + ' go with two different ' + ctx.out + 's?',
      parts: [
        { kind: 'choice', label: 'Answer', keep: true, opts: [{ t: 'Yes', tag: 'M6' }, { t: 'No', ok: true }] },
        { kind: 'choice', label: 'Reason', opts: [
          { t: 'Two students with the same ' + ctx.inp + ' can have different ' + ctx.out + 's', ok: true },
          { t: cap(ctx.out) + 's don\'t follow a formula', tag: 'M15' },
          { t: cap(ctx.big) }
        ] }
      ],
      answer: 'No: two students with the same ' + ctx.inp + ' can have different ' + ctx.out + 's',
      work: ['The input is ' + ctx.inp + ' and the output is ' + ctx.out + '.', 'Say ' + a + ' and ' + b + ' are both ' + ctx.n + ctx.u + ', but ' + a + '\'s ' + ctx.out + ' is ' + h1 + un + ' and ' + b + '\'s is ' + h2 + un + '.', 'One input with two outputs, so <b>no, it is not a function</b>.'],
      why: { M6: 'The input is ' + ctx.inp + '. Two students who are both ' + ctx.n + ctx.u + ' can have different ' + ctx.out + 's, so one input has two outputs.', M15: 'Not having a formula is not the reason. A function only needs one output for each input; here one ' + ctx.inp + ' can have two ' + ctx.out + 's.' },
      steps: [
        { label: 'What is the input?', part: { kind: 'choice', keep: true, opts: [{ t: ctx.inp, ok: true }, { t: ctx.out, tag: 'M6' }] }, hint: 'It is "' + ctx.out + ' as a function of ' + ctx.inp + '": the input comes after "of".' },
        { label: a + ' and ' + b + ' are both ' + ctx.n + ctx.u + '. Can they have different ' + ctx.out + 's?', part: yn(true), hint: 'Yes: ' + h1 + un + ' and ' + h2 + un + ', for example.' },
        { label: 'So is ' + ctx.out + ' a function of ' + ctx.inp + '?', part: yn(false, 'M6'), hint: 'One input with two outputs breaks the rule.' }
      ]
    };
  } });

  C.add({ id: 'FN-6a', skill: '5', level: 6, type: 'NE', gen: function (R) {
    var v = R.distinct(7, 1, 9), a = v[0], b = v[1], c = v[2], p = v[3], q = v[4], r = v[5], s = v[6];
    return {
      stem: 'The relation {(' + a + ', ' + p + '), (' + b + ', ' + q + '), (<i>k</i>, ' + r + '), (' + c + ', ' + s + ')} is <b>NOT</b> a function. What could <i>k</i> be? Give one value.',
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
