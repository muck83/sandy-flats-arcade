/* Climb question bank: skill 22 (function notation: f(x)).
   Taught in Film 5 (lessons/L12.js "Name Them Back"): f is the name of the function and the brackets are the slot;
   f(3) means "put 3 into f"; f(3) = 7 is a sentence, a pair (3, 7) and a point (across 3, up 7); compare f and g at
   the same input; work back from f(?) = 11 to the input; m(0) is the start.
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt;
  var STD = ['8.F.A.1', 'HSF-IF.A.2'];
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 × (−2)
  function rule(n, m, b) { return C.eqText(m, b, n + '(x)'); }   // f(x) = 3x − 1
  // drop wrong values that equal the key or repeat
  function wv(key, list) {
    var out = [];
    list.forEach(function (w) {
      if (!isFinite(w.v) || C.near(w.v, key, 1e-9)) return;
      if (out.some(function (o) { return C.near(o.v, w.v, 1e-9); })) return;
      out.push(w);
    });
    return out;
  }

  /* ---------------- Skill 22 Function notation ---------------- */
  C.add({ id: 'FX-1a', skill: '22', level: 2, order: 1, type: 'NE', std: STD, gen: function (R) {
    // Marcus's mistake from the lesson: f(x) = x + 4, so "f is four, four times three is 12"
    var n = R.pick(['f', 'g', 'h']), k, a;
    do { k = R.int(2, 9); a = R.int(2, 9); } while (a === k || k * a === a + k);
    var y = a + k;
    return {
      stem: 'The function <b>' + n + '</b> has the rule <b>' + n + '(x) = x + ' + k + '</b>. Find ' + n + '(' + a + ').',
      think: n + '(' + a + ') means: put ' + a + ' into ' + n + '. The brackets are the slot, not times.',
      parts: [
        { kind: 'num', label: n + '(' + a + ') =', key: y, wrong: wv(y, [{ v: k * a, tag: 'M18' }, { v: a - k, tag: 'M20' }, { v: a, tag: 'G' }]) },
        { kind: 'choice', label: 'Which pair says the same thing?', opts: [
          { t: C.pt(a, y), ok: true }, { t: C.pt(y, a), tag: 'M20' }, { t: C.pt(a, k), tag: 'G' }, { t: C.pt(k, y), tag: 'G' }
        ] }
      ],
      answer: n + '(' + a + ') = ' + y + '; the pair ' + C.pt(a, y),
      work: [
        n + ' is the name of the function. ' + n + '(' + a + ') means: put ' + a + ' into the rule x + ' + k + '.',
        n + '(' + a + ') = ' + a + ' + ' + k + ' = <b>' + y + '</b>.',
        'Input first, output second: the pair is <b>' + C.pt(a, y) + '</b> (the point across ' + a + ', up ' + y + ').'
      ],
      why: {
        M18: 'You did ' + k + ' × ' + a + ' = ' + (k * a) + '. ' + n + '(' + a + ') is not ' + n + ' times ' + a + ': it means put ' + a + ' into ' + n + ', so ' + a + ' + ' + k + ' = ' + y + '.',
        M20: a + ' is the input here, so it goes in first: ' + n + '(' + a + ') = ' + a + ' + ' + k + ' = ' + y + ', and the pair is ' + C.pt(a, y) + ', input first.',
        G: 'Put ' + a + ' into the rule: ' + a + ' + ' + k + ' = ' + y + '. The pair is (input, output) = ' + C.pt(a, y) + '.'
      },
      steps: [
        { label: 'In ' + n + '(' + a + '), which number goes into the slot (the input)?', part: { kind: 'num', key: a }, hint: 'The number inside the brackets is the input.' },
        { label: 'Put it into the rule: ' + a + ' + ' + k + ' =', part: { kind: 'num', key: y }, hint: 'The rule is x + ' + k + ', and x is ' + a + '.' },
        { label: 'So ' + n + '(' + a + ') = ' + y + '. As a pair (input, output) that is', part: { kind: 'choice', opts: [{ t: C.pt(a, y), ok: true }, { t: C.pt(y, a) }, { t: C.pt(a, k) }] }, hint: 'The input always goes first.' }
      ]
    };
  } });

  C.add({ id: 'FX-1b', skill: '22', level: 3, order: 1, type: 'MC', std: STD, gen: function (R) {
    var n = R.pick(['f', 'g', 'h', 'm']), m, b, p, q;
    do { m = R.pick([1, 2]); b = R.int(1, 4); p = R.int(1, 4); q = m * p + b; } while (q > 10 || q === b);
    var g = C.graph({ x: [0, 10], y: [0, 10], size: 320, xl: 'input (x)', yl: 'output (' + n + '(x))', lines: [{ m: m, b: b, from: 0 }], pts: [{ x: p, y: q, l: 'P' }], label: 'The graph of ' + n + ': a line from (0, ' + b + ') with point P at ' + C.pt(p, q) });
    return {
      stem: 'The graph shows the function <b>' + n + '</b>. Point P is on its line.<br>Part 1: Which sentence does point P say?<br>Part 2: What is ' + n + '(0)?',
      fig: g,
      think: 'Across is the input, up is the output. ' + n + '(0) is the output when the input is 0.',
      parts: [
        { kind: 'choice', label: 'Point P says', opts: [
          { t: n + '(' + p + ') = ' + q, ok: true }, { t: n + '(' + q + ') = ' + p, tag: 'M20' }, { t: n + ' × ' + p + ' = ' + q, tag: 'M18' }, { t: n + '(0) = ' + q, tag: 'G' }
        ] },
        { kind: 'num', label: n + '(0) =', key: b, wrong: wv(b, [{ v: 0, tag: 'M18' }, { v: q, tag: 'G' }, { v: p, tag: 'G' }]) }
      ],
      answer: n + '(' + p + ') = ' + q + '; ' + n + '(0) = ' + b,
      work: [
        'Point P is across ' + p + ', up ' + q + ': input ' + p + ', output ' + q + '.',
        'As a sentence: <b>' + n + '(' + p + ') = ' + q + '</b>. As a pair: ' + C.pt(p, q) + '.',
        n + '(0) is the output at input 0, where the line meets the up axis (y-axis): the start. So <b>' + n + '(0) = ' + b + '</b>.'
      ],
      why: {
        M20: 'You swapped them. P is across ' + p + ' (the input) and up ' + q + ' (the output), so ' + n + '(' + p + ') = ' + q + '. The input goes inside the brackets.',
        M18: n + '(' + p + ') is not ' + n + ' times ' + p + '. It is the output when ' + p + ' goes in: P says ' + n + '(' + p + ') = ' + q + '. And ' + n + '(0) is the output at input 0: ' + b + ', not 0.',
        G: 'The input goes inside the brackets: P is across ' + p + ', up ' + q + ', so ' + n + '(' + p + ') = ' + q + '. ' + n + '(0) is where the line meets the up axis (y-axis): ' + b + '.'
      },
      steps: [
        { label: 'Point P is across how many? (the input)', part: { kind: 'num', key: p }, hint: 'Read down from P to the across axis (x-axis).' },
        { label: 'And up how many? (the output)', part: { kind: 'num', key: q }, hint: 'Read across from P to the up axis (y-axis).' },
        { label: 'So point P says', part: { kind: 'choice', opts: [{ t: n + '(' + p + ') = ' + q, ok: true }, { t: n + '(' + q + ') = ' + p }, { t: n + ' × ' + p + ' = ' + q }] }, hint: 'Input inside the brackets, output after the equals sign.' },
        { label: n + '(0) is the output at input 0. Where does the line meet the up axis? ' + n + '(0) =', part: { kind: 'num', key: b }, hint: 'Look at the line where across is 0.' }
      ]
    };
  } });

  C.add({ id: 'FX-2a', skill: '22', level: 3, order: 2, type: 'interactive', ia: true, std: STD, gen: function (R) {
    // say a name three ways: sort each sentence and each point into the pair that says the same thing.
    // Three different machines (f, g, h), so no single function gets two outputs for one input.
    var N = R.shuffle(['f', 'g', 'h']), a, b, c;
    do { a = R.int(1, 7); b = R.int(1, 7); c = R.int(1, 7); } while (a === b || c === a || c === b);
    var P = [[a, b], [b, a], [a, c]];
    var order = R.shuffle([0, 1, 2]);
    function mini(x, y) { return C.graph({ x: [0, 8], y: [0, 8], size: 130, lx: 2, ly: 2, pts: [{ x: x, y: y, r: 5 }], label: 'A point across ' + x + ', up ' + y }); }
    function sen(i) { return N[i] + '(' + P[i][0] + ') = ' + P[i][1]; }
    var cards = [];
    P.forEach(function (pp, i) {
      var tag = i === 2 ? 'G' : 'M20';
      cards.push({ t: '<b>' + sen(i) + '</b>', bin: order.indexOf(i), tag: tag });
      cards.push({ t: mini(pp[0], pp[1]), bin: order.indexOf(i), tag: tag });
    });
    var say = function (i) { return sen(i) + ' and the point across ' + P[i][0] + ', up ' + P[i][1]; };
    return {
      stem: 'Three machines, f, g and h, each said three ways. Sort each sentence and each point into the pair that says the same thing. Each pair gets one sentence and one point.',
      think: 'In ' + sen(0) + ', ' + a + ' goes in and ' + b + ' comes out. Input first in a pair; across first on a graph.',
      parts: [{ kind: 'sort', label: 'Sentence, pair, point', bins: order.map(function (i) { return C.pt(P[i][0], P[i][1]); }), cards: R.shuffle(cards) }],
      answerFig: '<div style="font-size:14px">' + order.map(function (i) { return '<b>' + C.pt(P[i][0], P[i][1]) + '</b>: ' + say(i); }).join('<br>') + '</div>',
      answer: order.map(function (i) { return C.pt(P[i][0], P[i][1]) + ': ' + say(i); }).join('; '),
      work: [
        sen(0) + ' means input ' + a + ', output ' + b + ': the pair <b>' + C.pt(a, b) + '</b> and the point across ' + a + ', up ' + b + '.',
        sen(1) + ' has input ' + b + ' and output ' + a + ', so it goes with <b>' + C.pt(b, a) + '</b> (across ' + b + ', up ' + a + ').',
        sen(2) + ' goes with <b>' + C.pt(a, c) + '</b> (across ' + a + ', up ' + c + ').'
      ],
      why: {
        M20: 'Input and output got swapped. ' + sen(0) + ' puts ' + a + ' in and gets ' + b + ' out, so it is ' + C.pt(a, b) + ', across ' + a + ' then up ' + b + ', not ' + C.pt(b, a) + '.',
        G: 'Match the output too: ' + sen(0) + ' is ' + C.pt(a, b) + ' but ' + sen(2) + ' is ' + C.pt(a, c) + '.'
      },
      steps: [
        { label: 'In ' + sen(0) + ', what is the input?', part: { kind: 'num', key: a }, hint: 'The input is the number inside the brackets.' },
        { label: 'So ' + sen(0) + ' goes with the pair', part: { kind: 'choice', opts: [{ t: C.pt(a, b), ok: true }, { t: C.pt(b, a) }, { t: C.pt(a, c) }] }, hint: 'Input first, output second.' },
        { label: 'The point across ' + b + ', up ' + a + ' goes with', part: { kind: 'choice', opts: [{ t: sen(1), ok: true }, { t: sen(0) }, { t: sen(2) }] }, hint: 'Across is the input (inside the brackets); up is the output.' }
      ]
    };
  } });

  C.add({ id: 'FX-3a', skill: '22', level: 4, order: 1, type: 'NE', std: STD, gen: function (R) {
    // compare f and g at the same input: f as a rule, g as a graph
    var m, b, mg, bg, a, fa, ga, inv;
    do {
      m = R.pick([-3, -2, 2, 3]); b = R.nz(-6, 6); mg = R.pick([-2, -1, 1, 2]); bg = R.nz(-5, 5); a = R.nz(-4, 4);
      fa = m * a + b; ga = mg * a + bg; inv = (a - bg) / mg;
    } while (fa === ga || Math.abs(ga) > 9 || Math.abs(bg + mg) > 9 || Math.abs(fa) > 20);
    var big = fa > ga ? 0 : 1;
    var gw = [{ v: -ga, tag: 'M2' }];
    if (inv === Math.round(inv)) gw.push({ v: inv, tag: 'M20' });
    var gfig = C.graph({ x: [-10, 10], y: [-10, 10], size: 340, lines: [{ m: mg, b: bg }], pts: [{ x: 0, y: bg }, { x: 1, y: bg + mg }], label: 'The graph of g: a straight line through ' + C.pt(0, bg) + ' and ' + C.pt(1, bg + mg) });
    var ma = m * a;
    return {
      stem: 'Two functions: <b>' + rule('f', m, b) + '</b>, and <b>g</b> is shown on the graph. At input ' + f(a) + ', which function gives the bigger output?',
      fig: gfig,
      think: 'Put ' + f(a) + ' into f\'s rule. For g, go across to ' + f(a) + ' and read up to the line.',
      parts: [
        { kind: 'num', label: 'f(' + f(a) + ') =', key: fa, wrong: wv(fa, [{ v: ma - b, tag: 'M2' }, { v: -ma + b, tag: 'M2' }, { v: m + a + b, tag: 'M14' }]) },
        { kind: 'num', label: 'g(' + f(a) + ') =', key: ga, wrong: wv(ga, gw) },
        { kind: 'choice', label: 'At input ' + f(a) + '', keep: true, opts: [{ t: 'f gives more', ok: big === 0, tag: 'G' }, { t: 'g gives more', ok: big === 1, tag: 'G' }, { t: 'They give the same', tag: 'G' }] }
      ],
      answer: 'f(' + f(a) + ') = ' + f(fa) + ', g(' + f(a) + ') = ' + f(ga) + ': ' + (big === 0 ? 'f' : 'g') + ' gives more',
      work: [
        'f(' + f(a) + ') = ' + f(m) + ' × ' + par(a) + ' ' + C.term(b) + ' = ' + f(ma) + ' ' + C.term(b) + ' = <b>' + f(fa) + '</b>.',
        'On the graph, go across to ' + f(a) + ' and up (or down) to the line: <b>g(' + f(a) + ') = ' + f(ga) + '</b>.',
        f(fa) + (big === 0 ? ' &gt; ' : ' &lt; ') + f(ga) + ', so at input ' + f(a) + ' <b>' + (big === 0 ? 'f' : 'g') + ' gives more</b>. At a different input the winner can change.'
      ],
      why: {
        M2: 'Check the signs: f(' + f(a) + ') = ' + f(m) + ' × ' + par(a) + ' ' + C.term(b) + ' = ' + f(fa) + ', and the graph of g at across ' + f(a) + ' is at ' + f(ga) + '.',
        M14: 'Multiply the input by ' + f(m) + ' first, then ' + (b < 0 ? 'take away ' + (-b) : 'add ' + b) + ': ' + f(m) + ' × ' + par(a) + ' ' + C.term(b) + ' = ' + f(fa) + '.',
        M20: 'You found where g\'s output is ' + f(a) + '. g(' + f(a) + ') means the input is ' + f(a) + ': go across to ' + f(a) + ' and read the output, ' + f(ga) + '.',
        G: 'Compare the two outputs at the same input: f(' + f(a) + ') = ' + f(fa) + ' and g(' + f(a) + ') = ' + f(ga) + '.'
      },
      steps: [
        { label: f(m) + ' × ' + par(a) + ' =', part: { kind: 'num', key: ma }, hint: m < 0 && a < 0 ? 'A negative times a negative is positive.' : (m < 0 || a < 0) ? 'A negative times a positive is negative.' : 'Multiply first.' },
        { label: 'f(' + f(a) + ') = ' + f(ma) + ' ' + C.term(b) + ' =', part: { kind: 'num', key: fa }, hint: 'Keep the sign of ' + f(b) + '.' },
        { label: 'On the graph, the line at across ' + f(a) + ' is at g(' + f(a) + ') =', part: { kind: 'num', key: ga }, hint: 'Start at ' + C.pt(0, bg) + '; the line goes ' + (mg > 0 ? 'up ' : 'down ') + Math.abs(mg) + ' for every 1 step right.' },
        { label: 'Compare ' + f(fa) + ' and ' + f(ga) + '. At input ' + f(a) + '', part: { kind: 'choice', keep: true, opts: [{ t: 'f gives more', ok: big === 0 }, { t: 'g gives more', ok: big === 1 }, { t: 'They give the same' }] }, hint: 'The bigger number is the bigger output.' }
      ]
    };
  } });

  C.add({ id: 'FX-4a', skill: '22', level: 5, order: 1, type: 'NE', std: STD, gen: function (R) {
    // f(?) = k: the k is the OUTPUT; work back to the input (the Erase-o-Matic lock). Plain rule or a riyals context.
    var ctx = R.chance(0.5), n, m, b, x, k, rl;
    if (ctx) {
      n = 'T'; m = R.pick([5, 10, 12, 15, 20, 25]); b = R.int(2, 6) * 10; x = R.int(3, 12); k = m * x + b;
      rl = C.eqText(m, b, 'T(n)', 'n');
    } else {
      n = R.pick(['f', 'g', 'h']);
      do { m = R.pick([-5, -4, -3, -2, 2, 3, 4, 5]); b = R.nz(-9, 9); x = R.nz(-6, 6); k = m * x + b; } while (k === 0 || k === x || Math.abs(k) > 30);
      rl = rule(n, m, b);
    }
    var fk = m * k + b, d = k - b;
    var wrong = wv(x, [{ v: fk, tag: 'M20' }, { v: (k + b) / m, tag: 'M2' }, { v: k / m - b, tag: 'G' }, { v: d, tag: 'G' }, { v: k, tag: 'M20' }]);
    var p2;
    if (ctx) {
      p2 = { kind: 'choice', label: 'T(' + x + ') = ' + k + ' means', opts: [
        { t: x + ' tickets cost ' + k + ' riyals', ok: true }, { t: k + ' tickets cost ' + x + ' riyals', tag: 'M20' }, { t: 'T times ' + x + ' is ' + k, tag: 'M18' }, { t: 'each ticket costs ' + k + ' riyals', tag: 'G' }
      ] };
    } else {
      p2 = { kind: 'choice', label: 'So which point is on the graph of ' + n + '?', opts: [
        { t: C.pt(x, k), ok: true }, { t: C.pt(k, x), tag: 'M20' }, { t: C.pt(0, k), tag: 'G' }, { t: C.pt(x, 0), tag: 'G' }
      ] };
    }
    var ask = ctx ? 'A class trip costs a booking fee plus a price per ticket. <b>' + rl + '</b> gives the total cost in riyals for n tickets. The class paid ' + k + ' riyals: T(?) = ' + k + '. How many tickets did they buy?'
      : 'The rule is <b>' + rl + '</b>. Find the input that makes ' + n + '(?) = ' + f(k) + '.';
    var unit = ctx ? ' tickets' : '';
    // undoing the + b: "take away 9" (172 − 40) or "add 9 back" (−12 + 9)
    var ub = b < 0 ? 'taking away ' + (-b) : 'adding ' + b, ud = b < 0 ? 'add ' + (-b) + ' back' : 'take away ' + b, uc = f(k) + (b < 0 ? ' + ' + (-b) : ' − ' + b);
    return {
      stem: ask,
      think: f(k) + ' is what comes OUT. Undo the rule: ' + ud + ', then divide by ' + par(m) + '.',
      parts: [{ kind: 'num', label: ctx ? 'Number of tickets n' : 'Input x', key: x, wrong: wrong }, p2],
      answer: (ctx ? 'n = ' + x + unit + ' (T(' + x + ') = ' + k + ')' : 'x = ' + f(x) + ', so ' + n + '(' + f(x) + ') = ' + f(k)),
      work: [
        f(k) + ' is the output. Undo ' + ub + ': ' + uc + ' = ' + f(d) + '.',
        'Undo multiplying by ' + par(m) + ': ' + f(d) + ' ÷ ' + par(m) + ' = <b>' + f(x) + unit + '</b>.',
        'Check: ' + n + '(' + f(x) + ') = ' + f(m) + ' × ' + par(x) + ' ' + C.term(b) + ' = ' + f(k) + '. ' + (ctx ? '<b>' + x + ' tickets cost ' + k + ' riyals</b>.' : 'As a point: <b>' + C.pt(x, k) + '</b>, input first.')
      ],
      why: {
        M20: f(k) + ' is the output, not the input. You put ' + f(k) + ' into the rule (or kept it as the answer); instead work back: (' + uc + ') ÷ ' + par(m) + ' = ' + f(x) + '.' + (ctx ? ' T(' + x + ') = ' + k + ' says ' + x + ' tickets cost ' + k + ' riyals.' : ' The point is ' + C.pt(x, k) + ', input first.'),
        M18: ctx ? 'T(' + x + ') is not T times ' + x + '. It is the cost of ' + x + ' tickets: ' + k + ' riyals.' : n + '(' + f(x) + ') is not ' + n + ' times ' + par(x) + '. It is the output when ' + f(x) + ' goes in.',
        M2: 'To undo ' + ub + ', ' + ud + ': ' + uc + ' = ' + f(d) + ', then ÷ ' + par(m) + ' = ' + f(x) + '.',
        G: 'Undo the last step first: ' + ud + ' (' + uc + ' = ' + f(d) + '), then divide by ' + par(m) + ' to get ' + f(x) + '.'
      },
      steps: [
        { label: 'The rule ' + (b < 0 ? 'takes away ' + (-b) : 'adds ' + b) + ' last. Undo it: ' + uc + ' =', part: { kind: 'num', key: d }, hint: b < 0 ? 'Adding ' + (-b) + ' undoes taking it away.' : 'Taking away ' + b + ' undoes adding it.' },
        { label: 'The rule multiplies by ' + par(m) + ' first. Undo it: ' + f(d) + ' ÷ ' + par(m) + ' =', part: { kind: 'num', key: x }, hint: m < 0 ? 'Dividing by a negative flips the sign.' : 'Divide.' },
        ctx ? { label: 'So T(' + x + ') = ' + k + ' means', part: { kind: 'choice', opts: [{ t: x + ' tickets cost ' + k + ' riyals', ok: true }, { t: k + ' tickets cost ' + x + ' riyals' }, { t: 'each ticket costs ' + k + ' riyals' }] }, hint: 'Inside the brackets is the input: the number of tickets.' }
          : { label: 'So ' + n + '(' + f(x) + ') = ' + f(k) + '. The point is', part: { kind: 'choice', opts: [{ t: C.pt(x, k), ok: true }, { t: C.pt(k, x) }, { t: C.pt(0, k) }] }, hint: 'Input first, output second.' }
      ]
    };
  } });
})();
