/* Climb question bank: skill 23 (domain and range).
   Taught in Film 16 (lessons/L8.js "Doug's Steps"): count it, dots; measure it, a line. The domain is the inputs
   you are allowed to put in, the range is the outputs you can get out, and an output is reachable only if the
   input it needs is in the domain. Grade 8 level: lists of values, spans said in words, dots or a line.
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt;
  var STD = ['8.F.A.1', 'HSF-IF.B.5'];
  function list(a) { return a.map(function (v) { return f(v); }).join(', '); }
  function brace(a) { return '{' + list(a) + '}'; }
  function upto(lo, hi) { var a = []; for (var v = lo; v <= hi; v++) a.push(v); return a; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function low(s) { return /^All/.test(s) ? 'a' + s.slice(1) : s; }
  var DOTSLINE = 'Count it: dots. Measure it: a line. Ask "could it be 2.5?" If not, it is counted and only whole numbers are in the domain.';

  /* ---------------- DR-2a: which inputs get a line, not dots ---------------- */
  C.add({ id: 'DR-2a', skill: '23', level: 2, type: 'MS', std: STD, gen: function (R) {
    var COUNTED = [
      { t: 'the number of tickets you buy', h: '2.5 tickets' }, { t: 'the number of people on a bus', h: '2.5 people' },
      { t: 'the number of hops Doug makes', h: '2.5 hops' }, { t: 'the number of books on a shelf', h: '2.5 books' },
      { t: 'the number of boxes you order', h: '2.5 boxes' }, { t: 'the number of goals a team scores', h: '2.5 goals' },
      { t: 'the number of students in a class', h: '2.5 students' }, { t: 'the number of seeds Doug eats', h: '2.5 seeds' }
    ];
    var MEASURED = [
      { t: 'how long Doug flies, in minutes', h: '2.5 minutes' }, { t: 'the water in a tank, in litres', h: '2.5 litres' },
      { t: 'the distance a taxi drives, in kilometres', h: '2.5 kilometres' }, { t: 'how long a candle burns, in hours', h: '2.5 hours' },
      { t: 'the petrol put in a car, in litres', h: '2.5 litres' }, { t: 'the mass of rice you buy, in kilograms', h: '2.5 kilograms' },
      { t: 'how far you walk, in kilometres', h: '2.5 kilometres' }
    ];
    var nm = R.int(1, 3);
    var meas = R.shuffle(MEASURED).slice(0, nm), cnt = R.shuffle(COUNTED).slice(0, 5 - nm);
    var all = R.shuffle(meas.map(function (c) { return { c: c, ok: true }; }).concat(cnt.map(function (c) { return { c: c, ok: false }; })));
    var yes = all.filter(function (a) { return a.ok; }), no = all.filter(function (a) { return !a.ok; });
    function names(l) { return l.map(function (a) { return a.c.t; }).join('; '); }
    return {
      stem: 'Each one is the <b>input</b> of a function. Select <b>all</b> the inputs whose graph is a <b>line</b>, not dots.',
      think: 'Could the input be 2.5? Halves fine: measured, a line. No halves: counted, dots.',
      parts: [{ kind: 'multi', label: 'Gets a line', opts: all.map(function (a) { return a.ok ? { t: cap(a.c.t), ok: true, missTag: 'M22' } : { t: cap(a.c.t), ok: false, tag: 'M22' }; }) }],
      answer: cap(names(yes)),
      work: [
        'Ask of each input: could it be 2.5? If yes, it is measured and every in-between value is allowed, so the graph is a line.',
        'Measured (a line): <b>' + names(yes) + '</b>. For example, ' + yes[0].c.h + ' makes sense.',
        'Counted (dots): ' + names(no) + '. You cannot have ' + no[0].c.h + ', so only whole numbers are in the domain.'
      ],
      why: { M22: 'Counted things (tickets, hops, people) are whole numbers only, so they get dots. Measured things (time, litres, kilometres) can be 2.5, so they get a line. ' + cap(no[0].c.t) + ' cannot be ' + no[0].c.h + '; ' + yes[0].c.t + ' can be ' + yes[0].c.h + '.' },
      steps: [
        { label: 'Input: ' + no[0].c.t + '. Could it be ' + no[0].c.h + '?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes' }, { t: 'No', ok: true }] }, hint: 'It is counted: you count them one at a time.' },
        { label: 'Input: ' + yes[0].c.t + '. Could it be ' + yes[0].c.h + '?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: true }, { t: 'No' }] }, hint: 'It is measured: halves make sense.' },
        { label: 'So how many of the five inputs get a line?', part: { kind: 'num', key: nm }, hint: 'Count the measured ones: ' + names(yes) + '.' }
      ]
    };
  } });

  /* ---------------- DR-3a: tickets, max N (the lesson's exit ticket) ---------------- */
  C.add({ id: 'DR-3a', skill: '23', level: 3, order: 1, type: 'MC', std: STD, gen: function (R) {
    var CTX = [{ one: 'concert ticket', many: 'concert tickets', short: 'tickets' }, { one: 'cinema ticket', many: 'cinema tickets', short: 'tickets' },
      { one: 'box of dates', many: 'boxes of dates', short: 'boxes' }, { one: 'notebook', many: 'notebooks', short: 'notebooks' }, { one: 'bus pass', many: 'bus passes', short: 'passes' }];
    var c = R.pick(CTX), p = R.int(1, 10) * 5, N = R.int(3, 6);
    var dom = upto(1, N), rng = dom.map(function (t) { return t * p; });
    var domT = brace(dom) + ' ' + c.short, rngT = brace(rng) + ' riyals';
    return {
      stem: 'A ' + c.one + ' costs ' + p + ' riyals. You can buy at least 1 and at most ' + N + '. The total cost (riyals) is a function of the number of ' + c.many + ' you buy.',
      fig: C.table({ cols: [c.short, 'cost (riyals)'], rows: [[1, p], [2, 2 * p], ['…', '…'], [N, '?']] }),
      think: 'Can you buy half of one? The domain is the inputs; the range is the outputs.',
      parts: [
        { kind: 'choice', label: 'Its graph is', keep: true, opts: [{ t: 'Dots', ok: true }, { t: 'A line', tag: 'M22' }] },
        { kind: 'choice', label: 'The domain is', opts: [{ t: domT, ok: true }, { t: rngT, tag: 'M19' }, { t: 'All numbers from 1 to ' + N, tag: 'M22' }] },
        { kind: 'choice', label: 'The range is', opts: [{ t: rngT, ok: true }, { t: domT, tag: 'M19' }, { t: 'All numbers from ' + p + ' to ' + (N * p) + ' riyals', tag: 'M22' }] }
      ],
      answer: 'Dots; domain ' + domT + '; range ' + rngT,
      work: [
        'You buy whole ' + c.short + ': you cannot buy 2.5. Counted, so the graph is <b>dots</b>.',
        'Domain (the inputs, the number you buy): <b>' + domT + '</b>.',
        'Range (the outputs, the cost): ' + list(dom) + ' times ' + p + ' riyals gives <b>' + rngT + '</b>.'
      ],
      why: {
        M19: 'You swapped them. The domain is the inputs, the number of ' + c.short + ' ' + brace(dom) + '. The range is the outputs, the costs ' + brace(rng) + ' riyals.',
        M22: 'You cannot buy 2.5 ' + c.short + ', so only whole numbers count: the graph is dots and the domain is ' + brace(dom) + ', not every number from 1 to ' + N + '.'
      },
      steps: [
        { label: 'Can you buy 2.5 ' + c.short + '?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes' }, { t: 'No', ok: true }] }, hint: 'You count ' + c.short + ' one at a time. Counted means dots.' },
        { label: 'The most you can spend: ' + N + ' × ' + p + ' =', part: { kind: 'num', key: N * p, wrong: [{ v: N, tag: 'M19' }] }, hint: 'Buy the maximum, ' + N + '.' },
        { label: 'So the range (the costs you can get) is', part: { kind: 'choice', opts: [{ t: rngT, ok: true }, { t: domT }, { t: 'All numbers from ' + p + ' to ' + (N * p) + ' riyals' }] }, hint: 'Outputs only, and only whole numbers of ' + c.short + ' count.' }
      ]
    };
  } });

  /* ---------------- DR-3b (interactive): which heights can Doug reach? ---------------- */
  C.add({ id: 'DR-3b', skill: '23', level: 3, order: 2, type: 'interactive', ia: true, std: STD, gen: function (R) {
    var m, b, T, ys, inR, betw, past, tile, top;
    do {
      m = R.int(2, 4); b = R.int(-1, 3); T = R.int(4, 5);
      ys = upto(1, T).map(function (x) { return m * x + b; });
      inR = R.shuffle(ys).slice(0, 3);
      var k = R.int(0, T - 2); betw = ys[k] + R.int(1, m - 1);
      past = m * (T + 1) + b; top = ys[T - 1];
      var tiles = upto(1, T).filter(function (x) { return ys.indexOf(x) < 0; });
      tile = tiles.length ? R.pick(tiles) : null;
      var cards = inR.concat([betw, past, tile]);
    } while (tile == null || cards.some(function (v, i) { return cards.indexOf(v) !== i; }));
    // where the in-between height sits: between tile k + 1 and tile k + 2
    var betwT = 'between tile ' + (k + 1) + ' (height ' + f(ys[k]) + ') and tile ' + (k + 2) + ' (height ' + f(ys[k + 1]) + ')';
    var defs = R.shuffle(inR.map(function (v) { return { v: v, bin: 0, tag: 'M22' }; }).concat([{ v: betw, bin: 1, tag: 'M22' }, { v: past, bin: 1, tag: 'M22' }, { v: tile, bin: 1, tag: 'M19' }]));
    var rule = C.eqText(m, b);
    return {
      stem: 'Doug the pigeon hops only on tiles ' + list(upto(1, T)) + '. The height of tile x is ' + rule + '. Sort each height: can Doug stand at that height?',
      fig: C.table({ cols: ['tile x', 'height y'], rows: upto(1, T).map(function (x) { return [x, '?']; }) }),
      think: 'Work out every tile\'s height first. Those heights are the range.',
      parts: [{ kind: 'sort', label: 'Heights', bins: ['Doug can reach it (in the range)', 'Doug cannot reach it'], cards: defs.map(function (d) { return { t: '<b>height ' + f(d.v) + '</b>', bin: d.bin, tag: d.tag }; }) }],
      answerFig: '<div style="font-size:14px"><b>Range:</b> ' + brace(ys) + '.<br><b>Can reach:</b> ' + list(inR.slice().sort(function (a, c) { return a - c; })) + '. <b>Cannot reach:</b> ' + list([betw, past, tile]) + '.</div>',
      answer: 'In the range: ' + list(inR.slice().sort(function (a, c) { return a - c; })) + '; not: ' + list([betw, past, tile]),
      work: [
        'Domain (the tiles): ' + brace(upto(1, T)) + '. Put each into ' + rule + ': the range is ' + brace(ys) + '.',
        'Height ' + f(betw) + ' is ' + betwT + ', and there is no tile in between. Height ' + f(past) + ' needs tile ' + (T + 1) + ', past the last tile.',
        'Height ' + f(tile) + ' is a tile number (an input), not a height Doug reaches. So <b>' + list(inR.slice().sort(function (a, c) { return a - c; })) + '</b> are in the range; ' + list([betw, past, tile]) + ' are not.'
      ],
      why: {
        M19: f(tile) + ' is in the domain (tile ' + f(tile) + '), but it is not an output. The range is the heights: ' + brace(ys) + '.',
        M22: 'The range is only the heights of tiles ' + list(upto(1, T)) + ': ' + brace(ys) + '. Doug can\'t stand between tiles (height ' + f(betw) + ' is ' + betwT + ') or past tile ' + T + ' (height ' + f(past) + ').'
      },
      steps: [
        { label: 'Height of tile 1: ' + m + ' × 1 ' + C.term(b) + ' =', part: { kind: 'num', key: m + b, wrong: m + b === 1 ? [] : [{ v: 1, tag: 'M19' }] }, hint: 'Put x = 1 into ' + rule + '.' },
        { label: 'Height of the last tile, tile ' + T + ': ' + m + ' × ' + T + ' ' + C.term(b) + ' =', part: { kind: 'num', key: top }, hint: 'Multiply first, then ' + (b < 0 ? 'take away ' + f(-b) : 'add ' + f(b)) + '.' },
        { label: 'Height ' + f(betw) + ' is ' + betwT + '. Can Doug reach it?', part: { kind: 'choice', keep: true, opts: [{ t: 'Yes' }, { t: 'No', ok: true }] }, hint: 'Doug only stands on whole tiles.' },
        { label: 'So how many of the six heights are in the range?', part: { kind: 'num', key: 3 }, hint: 'The range is ' + brace(ys) + '. Check each card against it.' }
      ]
    };
  } });

  /* ---------------- DR-4a: domain and range from a graph (dots or a segment) ---------------- */
  C.add({ id: 'DR-4a', skill: '23', level: 4, type: 'MC', std: STD, gen: function (R) {
    var dots = R.chance(0.5), x1, x2, m, b, y1, y2, lo, hi, xs, ys;
    do {
      x1 = R.int(-6, 1); x2 = x1 + R.int(3, 5); m = R.pick([-2, -1, 1, 2]); b = R.int(-4, 4);
      y1 = m * x1 + b; y2 = m * x2 + b; lo = Math.min(y1, y2); hi = Math.max(y1, y2);
      xs = upto(x1, x2); ys = xs.map(function (x) { return m * x + b; }).sort(function (a, c) { return a - c; });
    } while (Math.abs(y1) > 9 || Math.abs(y2) > 9 || (lo === x1 && hi === x2) || y1 === 0 || y2 === 0);
    function span(a, c) { return 'All numbers from ' + f(a) + ' to ' + f(c); }
    function only(a) { return list(a) + ' only'; }
    var domOk = dots ? only(xs) : span(x1, x2), domG = dots ? span(x1, x2) : only(xs), domS = dots ? only(ys) : span(lo, hi);
    var rngOk = dots ? only(ys) : span(lo, hi), rngG = dots ? span(lo, hi) : only(ys), rngS = dots ? only(xs) : span(x1, x2);
    var pts = dots ? xs.map(function (x) { return { x: x, y: m * x + b }; }) : [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    var g = C.graph({ x: [-10, 10], y: [-10, 10], lines: dots ? [] : [{ seg: [[x1, y1], [x2, y2]] }], pts: pts,
      label: dots ? 'Dots at ' + pts.map(function (p) { return C.pt(p.x, p.y); }).join(', ') : 'A line segment from ' + C.pt(x1, y1) + ' to ' + C.pt(x2, y2) + ', both ends included' });
    return {
      stem: 'The function is only what is drawn: ' + (dots ? 'the dots, nothing in between.' : 'the line segment from ' + C.pt(x1, y1) + ' to ' + C.pt(x2, y2) + ', ends included.') + ' What are its domain and range?',
      fig: g,
      think: 'Domain: read along the across axis (x-axis). Range: read up the up axis (y-axis).',
      parts: [
        { kind: 'choice', label: 'Domain', opts: [{ t: domOk, ok: true }, { t: domS, tag: 'M19' }, { t: domG, tag: 'M22' }] },
        { kind: 'choice', label: 'Range', opts: [{ t: rngOk, ok: true }, { t: rngS, tag: 'M19' }, { t: rngG, tag: 'M22' }] }
      ],
      answer: 'Domain: ' + domOk.charAt(0).toLowerCase() + domOk.slice(1) + '; range: ' + rngOk.charAt(0).toLowerCase() + rngOk.slice(1),
      work: [
        'The inputs are read along the across axis (x-axis): from x = ' + f(x1) + ' to x = ' + f(x2) + '. The outputs are read up the up axis (y-axis): from y = ' + f(lo) + ' to y = ' + f(hi) + '.',
        dots ? 'It is dots, so only the dots\' values count, nothing in between.' : 'It is a solid segment, so every value in between counts too, halves included.',
        'Domain: <b>' + low(domOk) + '</b>. Range: <b>' + low(rngOk) + '</b>.'
      ],
      why: {
        M19: 'You swapped them. The domain is the x-values (inputs, across): ' + f(x1) + ' to ' + f(x2) + '. The range is the y-values (outputs, up): ' + f(lo) + ' to ' + f(hi) + '.',
        M22: dots ? 'The graph is dots, so the values in between (like ' + f(x1 + 0.5, 'dec') + ') are not part of it. List only the dots\' values.' : 'The segment is solid, so in-between values like x = ' + f(x1 + 0.5, 'dec') + ' are part of it. It is every number from one end to the other, not only whole numbers.'
      },
      steps: [
        { label: 'Smallest input: the leftmost x =', part: { kind: 'num', key: x1 }, hint: 'Read the across axis (x-axis) under the left end.' },
        { label: 'Largest input: the rightmost x =', part: { kind: 'num', key: x2 }, hint: 'Read the across axis (x-axis) under the right end.' },
        { label: 'Lowest output: the smallest y =', part: { kind: 'num', key: lo, wrong: lo === x1 ? [] : [{ v: x1, tag: 'M19' }] }, hint: 'Read the up axis (y-axis) beside the lowest point.' },
        { label: 'So the range is', part: { kind: 'choice', opts: [{ t: rngOk, ok: true }, { t: rngS }, { t: rngG }] }, hint: 'Outputs are y-values. ' + (dots ? 'Dots: only the dots count.' : 'A solid segment: everything in between counts.') }
      ]
    };
  } });

  /* ---------------- DR-5a: can the output be reached? (counted vs measured, inside the domain) ---------------- */
  C.add({ id: 'DR-5a', skill: '23', level: 5, type: 'NE', std: STD, gen: function (R) {
    var disc = R.chance(0.5), kase = R.pick(['on', 'between', 'past']), p, d, N, k, T;
    // even steps, so a half input still gives a whole-number output (the question is the input, not the output)
    if (disc) { p = R.int(2, 9) * 10; d = R.int(2, 6) * 5; N = R.int(5, 8); }
    else { p = R.int(1, 6) * 4; d = R.int(2, 8) * 10; N = R.int(6, 10); }
    if (kase === 'on') k = R.int(2, N - 1); else if (kase === 'between') k = R.int(1, N - 2) + 0.5; else k = N + R.int(1, 3);
    T = d + p * k;
    var ctx = disc ? {
      stem: 'A shop sells boxes of dates for ' + p + ' riyals each, plus ' + C.an(d) + ' ' + d + '-riyal delivery fee. You can order from 1 to ' + N + ' boxes. The total cost (riyals) is a function of the number of boxes.',
      q: 'Can the total cost be ' + f(T) + ' riyals?', inp: 'boxes', out: 'riyals', what: 'total cost', unit1: 'box', startW: 'the delivery fee', stepW: 'the price per box'
    } : {
      stem: 'A tank starts with ' + d + ' litres of water. A tap adds ' + p + ' litres every minute, for up to ' + N + ' minutes. The water in the tank (litres) is a function of the time (minutes).',
      q: 'Can the tank hold exactly ' + f(T) + ' litres?', inp: 'minutes', out: 'litres', what: 'water', unit1: 'minute', startW: 'the water at the start', stepW: 'the litres added per minute'
    };
    var okIdx = kase === 'past' ? 2 : (kase === 'between' && disc ? 1 : 0);
    var reasons = ['Yes, it is in the range', 'No, the input it needs is not a whole number', 'No, the input it needs is past ' + N + ' ' + ctx.inp];
    var opts = reasons.map(function (t, i) { return i === okIdx ? { t: t, ok: true } : { t: t, tag: 'M22' }; });
    var kS = f(k, 'dec'), max = d + p * N, firstIn = disc ? 1 : 0, minOut = d + p * firstIn;
    var verdict = okIdx === 0 ? 'Yes: ' + kS + ' ' + ctx.inp + ' is in the domain, so ' + f(T) + ' ' + ctx.out + ' is in the range.' :
      okIdx === 1 ? 'No: you cannot order ' + kS + ' boxes. Boxes are counted (dots), so ' + f(T) + ' riyals is not in the range.' :
      'No: ' + kS + ' ' + ctx.inp + ' is past the maximum of ' + N + ', outside the domain. The range stops at ' + f(max) + ' ' + ctx.out + '.';
    var whyG = okIdx === 0 ? (kase === 'between' ? 'Time is measured, so ' + kS + ' minutes is allowed: it is a line, not dots. ' + f(T) + ' litres is reached at ' + kS + ' minutes.' : kS + ' ' + ctx.inp + (disc ? ' is a whole number from 1 to ' : ' is between 0 and ') + N + ', so it is in the domain and ' + f(T) + ' is in the range.') :
      okIdx === 1 ? 'It would need ' + kS + ' boxes. Boxes are counted, so only whole numbers are in the domain: ' + f(T) + ' riyals is between two dots.' :
      'It would need ' + kS + ' ' + ctx.inp + ', but the domain stops at ' + N + '. The largest output is ' + f(max) + ' ' + ctx.out + '.';
    return {
      stem: ctx.stem + '<br>' + ctx.q,
      think: 'Undo the rule: take off the start, then divide by the step. Is that input allowed?',
      parts: [
        { kind: 'num', label: 'Input it needs (' + ctx.inp + ')', key: k, wrong: [{ v: d + p * T, tag: 'M19' }, { v: T / p, tag: 'M16' }] },
        { kind: 'choice', label: ctx.q, keep: true, opts: opts },
        { kind: 'num', label: 'Largest possible ' + ctx.what + ' (' + ctx.out + ')', key: max, wrong: [{ v: p * N, tag: 'M16' }, { v: N, tag: 'M19' }] }
      ],
      answer: kS + ' ' + ctx.inp + '; ' + reasons[okIdx] + '; largest ' + ctx.what + ' ' + f(max) + ' ' + ctx.out,
      work: [
        'The start (' + ctx.startW + ') is ' + d + ' and the step (' + ctx.stepW + ') is ' + p + '. Undo: (' + f(T) + ' − ' + d + ') ÷ ' + p + ' = <b>' + kS + ' ' + ctx.inp + '</b>.',
        'Domain: ' + (disc ? 'the whole numbers 1 to ' + N + ' (boxes are counted: dots)' : 'all numbers from 0 to ' + N + ' (time is measured: a line)') + '. ' + verdict,
        'The range runs from ' + f(minOut) + ' to ' + d + ' + ' + p + ' × ' + N + ' = <b>' + f(max) + ' ' + ctx.out + '</b>' + (disc ? ', in steps of ' + p + '.' : '.')
      ],
      why: {
        M19: 'You put ' + f(T) + ' in as an input. ' + f(T) + ' is an output (' + ctx.out + '); work back to the input: (' + f(T) + ' − ' + d + ') ÷ ' + p + ' = ' + kS + '.',
        M16: 'You left out the start of ' + d + ' ' + ctx.out + '. Take it off before dividing, and add it on for the largest output: ' + d + ' + ' + p + ' × ' + N + ' = ' + f(max) + '.',
        M22: whyG
      },
      steps: [
        { label: 'Take off the start: ' + f(T) + ' − ' + d + ' =', part: { kind: 'num', key: T - d }, hint: 'The ' + d + ' is ' + ctx.startW + ', paid or there once.' },
        { label: 'Divide by the step: ' + f(T - d) + ' ÷ ' + p + ' = input (' + ctx.inp + ') =', part: { kind: 'num', key: k, wrong: [{ v: T / p, tag: 'M16' }] }, hint: 'Each 1 ' + ctx.unit1 + ' adds ' + p + '.' },
        { label: 'The domain is ' + (disc ? 'the whole numbers 1 to ' + N : 'all numbers from 0 to ' + N) + '. ' + ctx.q, part: { kind: 'choice', keep: true, opts: reasons.map(function (t, i) { return i === okIdx ? { t: t, ok: true } : { t: t }; }) }, hint: 'Is ' + kS + ' allowed? ' + (disc ? 'Counted: whole numbers only.' : 'Measured: halves are fine.') + ' And it must not be past ' + N + '.' }
      ]
    };
  } });
})();
