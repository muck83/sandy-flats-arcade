/* Climb question bank: comparing functions. Skill 16 (compare rate and initial value) and skill 17 (compare in context).
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt, M = '−';
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 − (−2)
  function other(L) { return L === 'A' ? 'B' : 'A'; }
  // round up to a multiple of s
  function up(v, s) { return Math.ceil(v / s) * s; }
  // A / B / the same, in a fixed order; tags for the wrong letter and for "the same"
  function abOpts(key, wrongTag, sameText, sameTag) {
    return [
      { t: 'A', ok: key === 'A', tag: key === 'A' ? undefined : wrongTag },
      { t: 'B', ok: key === 'B', tag: key === 'B' ? undefined : wrongTag },
      { t: sameText || 'They are the same', ok: key === 'same', tag: sameTag }
    ];
  }
  // a labelled dot on a line, at a whole-number x inside a −10..10 window (not at x = 0)
  function tagPt(m, b, name, avoid) {
    var xs = [6, -6, 4, -4, 7, -7, 3, -3, 8, -8, 5, -5, 2, -2];
    for (var i = 0; i < xs.length; i++) { var y = m * xs[i] + b; if (Math.abs(y) <= 8 && Math.round(y) === y && (avoid == null || xs[i] !== avoid)) return { x: xs[i], y: y, l: name }; }
    return null;
  }

  /* ---------------- 16 Compare rate and initial value ---------------- */
  C.add({ id: 'CP-3a', skill: '16', level: 3, type: 'MC', gen: function (R) {
    var mF = R.pick([10, 20]), d = R.pick([10, 20]), mS = mF + d, bS = R.pick([0, 10, 20]), bF = bS + d * 5 + 10 * R.int(1, 2);
    var steepIsA = R.chance(0.5), Ls = steepIsA ? 'A' : 'B', Lf = other(Ls);
    var mA = steepIsA ? mS : mF, bA = steepIsA ? bS : bF, mB = steepIsA ? mF : mS, bB = steepIsA ? bF : bS;
    var top = bF + 5 * mF, yTop = up(top + 10, 20), ly = yTop > 160 ? 40 : 20;
    var fig = C.graph({ x: [0, 5], y: [0, yTop], dx: 1, dy: 10, ly: ly, xl: 'Weeks', yl: 'Savings (riyals)', size: 360, label: 'Two savings lines, A and B',
      lines: [{ m: mA, b: bA }, { m: mB, b: bB, color: C.COL.line3 }],
      pts: [{ x: 4, y: bA + 4 * mA, l: 'A', c: C.COL.line }, { x: 4, y: bB + 4 * mB, l: 'B', c: C.COL.line3 }] });
    return {
      stem: 'Lines A and B show two people\'s savings, in riyals, over several weeks. Which one saves more per week?',
      fig: fig,
      think: 'Per week is the rate: how much the line rises for every 1 more week.',
      parts: [{ kind: 'choice', label: 'Saves more per week', keep: true, opts: [
        { t: 'A', ok: steepIsA, tag: steepIsA ? undefined : 'M13' },
        { t: 'B', ok: !steepIsA, tag: steepIsA ? 'M13' : undefined },
        { t: 'They save the same amount per week', tag: 'M11' },
        { t: 'You can\'t tell from the graph', tag: 'M13' }] }],
      answer: Ls + ' saves more per week (' + mS + ' riyals per week, compared with ' + mF + ')',
      answerFig: fig,
      work: ['Per week means the rate: for every 1 more week, how much do the savings go up?',
        'A: from week 0 to week 1, ' + f(bA) + ' → ' + f(bA + mA) + ', so ' + mA + ' riyals per week. B: ' + f(bB) + ' → ' + f(bB + mB) + ', so ' + mB + ' riyals per week.',
        'Line ' + Lf + ' is higher because it started with more, but line ' + Ls + ' is steeper. <b>' + Ls + ' saves more per week.</b>'],
      why: { M13: 'Line ' + Lf + ' is higher, which means more saved so far (it started at ' + f(bF) + ' riyals). It only goes up ' + mF + ' riyals for every 1 more week; line ' + Ls + ' goes up ' + mS + '.', M11: 'The lines are not parallel, so their rates are different: ' + mA + ' and ' + mB + ' riyals per week.' },
      steps: [
        { label: 'For every 1 more week, how many riyals does line A go up?', part: { kind: 'num', key: mA }, hint: 'Line A goes from ' + f(bA) + ' at week 0 to ' + f(bA + mA) + ' at week 1.' },
        { label: 'For every 1 more week, how many riyals does line B go up?', part: { kind: 'num', key: mB }, hint: 'Line B goes from ' + f(bB) + ' at week 0 to ' + f(bB + mB) + ' at week 1.' },
        { label: 'So which one saves more per week?', part: { kind: 'choice', keep: true, opts: [{ t: 'A', ok: steepIsA }, { t: 'B', ok: !steepIsA }] }, hint: 'The bigger rate saves more per week, even if that line is lower.' }
      ]
    };
  } });

  C.add({ id: 'CP-4a', skill: '16', level: 4, order: 1, type: 'MC', gen: function (R) {
    var s = R.int(2, 5), keyA = R.chance(0.5), mA, mB, bA, bB, k, sameTrap = false;
    do {
      if (keyA) { mA = R.int(3, 9); mB = R.int(1, mA - 1); sameTrap = mB * s === mA; bA = R.int(-6, 4); bB = R.int(bA + 1, 9); }
      else { mA = R.int(1, 6); mB = R.int(mA + 1, 9); bB = R.int(-6, 4); bA = R.int(bB + 1, 9); }
      k = mB * s;
    } while ((keyA && k < mA) || bA === 0 && bB === 0);
    var xs = [0, s, 2 * s, 3 * s], Lk = keyA ? 'A' : 'B';
    var opts = abOpts(Lk, keyA ? (sameTrap ? 'M9' : 'M8') : 'M9', 'They are the same', keyA && sameTrap ? 'M8' : undefined);
    return {
      stem: 'Function A is ' + C.eqText(mA, bA) + '. Function B is shown in the table. Which function has the greater rate of change?',
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x) { return [x, bB + mB * x]; }) }),
      think: 'Rate = change in y for every 1 more x. Look at how far x steps in the table.',
      parts: [{ kind: 'choice', label: 'Greater rate of change', keep: true, opts: opts }],
      answer: 'Function ' + Lk + ' (A: ' + f(mA) + ', B: ' + f(mB) + ' for every 1 more x)',
      work: ['A: in ' + C.eqText(mA, bA) + ', y changes by ' + f(mA) + ' for every 1 more x.',
        'B: y changes by ' + f(k) + ' every time x goes up by ' + s + ', so ' + f(k) + ' ÷ ' + s + ' = ' + f(mB) + ' for every 1 more x.',
        'Compare ' + f(mA) + ' and ' + f(mB) + ': <b>function ' + Lk + '</b> has the greater rate.'],
      why: { M8: 'You compared B\'s change per row (' + f(k) + ') with ' + f(mA) + ', but B\'s rows step x by ' + s + '. For every 1 more x, B changes by ' + f(k) + ' ÷ ' + s + ' = ' + f(mB) + '.', M9: 'You compared the starting values (' + f(bA) + ' and ' + f(bB) + '). The rate is how much y changes for every 1 more x, not where it starts.' },
      steps: [
        { label: 'For every 1 more x, how much does A change?', part: { kind: 'num', key: mA }, hint: 'In y = mx + b, the rate is m, the number multiplying x.' },
        { label: 'In the table, how much does B\'s y change from one row to the next?', part: { kind: 'num', key: k }, hint: f(bB + mB * s) + ' − ' + par(bB) + '.' },
        { label: 'Each row x goes up by ' + s + '. B\'s rate for every 1 more x: ' + f(k) + ' ÷ ' + s + ' =', part: { kind: 'num', key: mB }, hint: 'Divide the change in y by the change in x.' },
        { label: 'Which has the greater rate?', part: { kind: 'choice', keep: true, opts: [{ t: 'A', ok: keyA }, { t: 'B', ok: !keyA }] }, hint: 'Compare ' + f(mA) + ' and ' + f(mB) + '.' }
      ]
    };
  } });

  C.add({ id: 'CP-4b', skill: '16', level: 4, order: 2, type: 'MC', gen: function (R) {
    var keyA = R.chance(0.5), mA, r, bA, mB, bB, ok;
    do {
      mA = R.pick([1, 2, -1, -2]); r = R.nz(-5, 5); bA = -mA * r; mB = R.nz(-4, 4); bB = R.int(-8, 8);
      // the slopes and A's x-intercept both point at the wrong letter
      ok = mA !== mB && bA !== bB && bA !== 0 && r !== bB && (keyA ? (bA > bB && mA < mB && r < bB) : (bB > bA && mA > mB && r > bB));
    } while (!ok);
    var Lk = keyA ? 'A' : 'B', Lw = other(Lk);
    var lab = tagPt(mA, bA, 'A', r);
    var g = { x: [-10, 10], y: [-10, 10], size: 340, label: 'Graph of function A', lines: [{ m: mA, b: bA }], pts: lab ? [lab] : [] };
    var fig = C.graph(g);
    var opts = abOpts(Lk, 'M9', 'They are the same');
    return {
      stem: 'Function A is shown on the graph. Function B is ' + C.eqText(mB, bB) + '. Which function has the greater initial value?',
      fig: fig,
      think: 'The initial value is the output when x = 0.',
      parts: [{ kind: 'choice', label: 'Greater initial value', keep: true, opts: opts }],
      answer: 'Function ' + Lk + ' (A starts at ' + f(bA) + ', B starts at ' + f(bB) + ')',
      answerFig: C.graph({ x: [-10, 10], y: [-10, 10], size: 340, label: 'Graph of function A with its initial value marked', lines: [{ m: mA, b: bA }], pts: [{ x: 0, y: bA, l: '(0, ' + f(bA) + ')' }] }),
      work: ['The initial value is the output at x = 0, where the line crosses the y-axis.',
        'A crosses the y-axis at ' + f(bA) + '. B (' + C.eqText(mB, bB) + ') has initial value ' + f(bB) + '.',
        f(Math.max(bA, bB)) + ' > ' + f(Math.min(bA, bB)) + ', so <b>function ' + Lk + '</b> has the greater initial value.'],
      why: { M9: 'You compared the slopes (' + f(mA) + ' and ' + f(mB) + '). The initial value is the output at x = 0: ' + f(bA) + ' for A and ' + f(bB) + ' for B.', M3: 'A crosses the x-axis at ' + f(r) + ', but the initial value is where it crosses the y-axis: ' + f(bA) + '.' },
      steps: [
        { label: 'Where does line A cross the y-axis? y =', part: { kind: 'num', key: bA, wrong: [{ v: r, tag: 'M3' }] }, hint: 'The y-axis is the vertical axis, where x = 0.' },
        { label: 'What is B\'s initial value (y when x = 0)?', part: { kind: 'num', key: bB }, hint: 'Put x = 0 into ' + C.eqText(mB, bB) + '.' },
        { label: 'Which has the greater initial value?', part: { kind: 'choice', keep: true, opts: [{ t: 'A', ok: keyA }, { t: 'B', ok: !keyA }] }, hint: 'Compare ' + f(bA) + ' and ' + f(bB) + '.' }
      ]
    };
  } });

  C.add({ id: 'CP-4c', skill: '16', level: 4, order: 3, type: 'TT', gen: function (R) {
    var setA = [0.5, 1, 1.5, 2, 2.5, 3], setB = [0.5, 1, 1.5, 2, 3], mA, mB, bA, bB;
    do { mA = R.pick(setA); mB = R.pick(setB); bA = R.int(-6, 6); bB = R.int(-6, 6); }
    while (mA === mB || bA === bB || bB === 0 || (mA > mB) !== (bA < bB) || bB + 2 * (mB === Math.round(mB) ? 1 : 2) * mB > 9);   // the steeper one crosses the y-axis lower
    var x0 = R.pick([-2, 0]), xs = [x0, x0 + 2, x0 + 4, x0 + 6], q = mB === Math.round(mB) ? 1 : 2, Lk = mA > mB ? 'A' : 'B';
    var dyA = 2 * mA, dyB = q * mB;
    var lab = tagPt(mB, bB, 'B'); if (lab) lab.c = C.COL.line3;
    var fig = '<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center"><div><b>Function A</b>' + C.table({ cols: ['x', 'y'], rows: xs.map(function (x) { return [x, bA + mA * x]; }) }) + '</div><div><b>Function B</b><br>' +
      C.graph({ x: [-10, 10], y: [-10, 10], size: 300, label: 'Graph of function B', lines: [{ m: mB, b: bB, color: C.COL.line3 }], pts: [{ x: 0, y: bB, c: C.COL.line3 }, { x: 2 * q, y: bB + 2 * q * mB, c: C.COL.line3 }].concat(lab ? [lab] : []) }) + '</div></div>';
    return {
      stem: 'Function A is shown in the table. Function B is shown on the graph. Which function has the greater rate of change, and how can you tell?',
      fig: fig,
      parts: [
        { kind: 'choice', label: 'Greater rate of change', keep: true, opts: abOpts(Lk, 'M12', 'They are the same') },
        { kind: 'choice', label: 'Because I', opts: [{ t: 'compared change in y ÷ change in x for each', ok: true }, { t: 'compared where they cross the y-axis', tag: 'M12' }, { t: 'compared which one is higher on the graph', tag: 'M13' }] }
      ],
      answer: 'Function ' + Lk + ': compare change in y ÷ change in x (A: ' + f(mA) + ', B: ' + f(mB) + ')',
      work: ['A: x goes up by 2 each row and y goes up by ' + f(dyA) + ', so ' + f(dyA) + ' ÷ 2 = ' + f(mA) + ' for every 1 more x.',
        'B: from (0, ' + f(bB) + ') to ' + C.pt(q, bB + dyB) + ', y goes up ' + f(dyB) + ' while x goes up ' + q + ', so ' + f(dyB) + ' ÷ ' + q + ' = ' + f(mB) + '.',
        'Where a line starts or how high it is does not measure its rate. <b>Function ' + Lk + '</b> has the greater rate.'],
      why: { M12: 'Where a function crosses the y-axis (' + f(bA) + ' for A, ' + f(bB) + ' for B) is its starting value, not its rate.', M13: 'Being higher on a graph is about the values, not how fast they change. Compare change in y ÷ change in x.' },
      steps: [
        { label: 'A: y changes by ' + f(dyA) + ' each time x goes up by 2. Rate of A =', part: { kind: 'num', key: mA }, hint: f(dyA) + ' ÷ 2.' },
        { label: 'B: use the points (0, ' + f(bB) + ') and ' + C.pt(2 * q, bB + 2 * q * mB) + '. Rate of B =', part: { kind: 'num', key: mB }, hint: 'Change in y ÷ change in x: ' + f(2 * q * mB) + ' ÷ ' + (2 * q) + '.' },
        { label: 'Which has the greater rate?', part: { kind: 'choice', keep: true, opts: [{ t: 'A', ok: Lk === 'A' }, { t: 'B', ok: Lk === 'B' }] }, hint: 'Compare ' + f(mA) + ' and ' + f(mB) + '.' }
      ]
    };
  } });

  // slider build: B's sliders next to a fixed line A
  C.add({ id: 'CP-4d', skill: '16', level: 5, type: 'IA', ia: true, gen: function (R) {
    var mA = R.pick([5, 10, 15]), bA = 10 * R.int(1, 6), bK = bA + 10 * R.int(1, 3);
    var grid = { x: [0, 10], y: [0, 250], dx: 1, dy: 10, ly: 50, xl: 'Months', yl: 'Cost (riyals)', size: 400, label: 'Cost of gym A and gym B' };
    function draw(v) {
      return { lines: [{ m: mA, b: bA, color: C.COL.line2 }, { m: v.m, b: v.b }],
        pts: [{ x: 10, y: bA + 10 * mA, l: 'A', c: C.COL.line2 }, { x: 0, y: v.b, l: 'B', c: C.COL.line }] };
    }
    var dk = draw({ m: mA, b: bK });
    return {
      stem: 'Gym A charges a joining fee plus a monthly price. Its total cost is y = ' + mA + 'x + ' + bA + ' riyals after x months (the orange line). Set the sliders for gym B so B has the <b>same rate of change</b> as A but a <b>greater initial value</b>.',
      think: 'Same rate means the same slope. Initial value is the cost at 0 months.',
      parts: [{ kind: 'slider', label: 'Gym B', grid: grid, draw: draw,
        sliders: [{ id: 'm', label: 'Monthly price (riyals)', min: 0, max: 30, step: 5, start: 0 }, { id: 'b', label: 'Joining fee (riyals)', min: 0, max: 100, step: 10, start: 0 }],
        key: { m: mA, b: bK },
        check: function (v) { if (+v.m !== mA) return { ok: false, tag: 'M9' }; if (+v.b > bA) return { ok: true }; return { ok: false, tag: +v.b < bA ? 'M2' : null }; } }],
      answer: 'Monthly price ' + mA + ' riyals (same as A) and a joining fee more than ' + bA + ' riyals, e.g. y = ' + mA + 'x + ' + bK,
      answerFig: C.graph(Object.assign({}, grid, { lines: dk.lines, pts: dk.pts })),
      work: ['Same rate of change means B\'s cost goes up by the same ' + mA + ' riyals for every 1 more month, so its slope is ' + mA + '. The lines are parallel.',
        'A greater initial value means B costs more at 0 months: a joining fee above ' + bA + ' riyals.',
        'For example <b>y = ' + mA + 'x + ' + bK + '</b>: parallel to A, starting higher.'],
      why: { M9: 'You changed the monthly price. Same rate of change means the same slope (' + mA + ' riyals per month); only the joining fee should change.', M2: 'Your joining fee is less than A\'s ' + bA + ' riyals. A greater initial value means B starts higher on the cost axis.' },
      steps: [
        { label: 'Same rate of change: B\'s monthly price (slope) must be', part: { kind: 'num', key: mA }, hint: 'In y = ' + mA + 'x + ' + bA + ', the rate is the number multiplying x.' },
        { label: 'What is A\'s initial value (cost at 0 months)?', part: { kind: 'num', key: bA }, hint: 'Put x = 0: y = ' + bA + '.' },
        { label: 'So B\'s joining fee must be', part: { kind: 'choice', keep: true, opts: [{ t: 'more than ' + bA + ' riyals', ok: true }, { t: 'exactly ' + bA + ' riyals' }, { t: 'less than ' + bA + ' riyals' }] }, hint: 'Greater initial value means B starts higher.' }
      ]
    };
  } });

  /* ---------------- 17 Compare in context ---------------- */
  C.add({ id: 'CP-5a', skill: '17', level: 5, order: 1, type: 'MC', gen: function (R) {
    var mLow = R.pick([10, 15, 20, 25]), d = R.pick([5, 10, 15]), mHigh = mLow + d, c = R.int(2, 10), bLow = 10 * R.int(2, 6), bHigh = bLow + d * c;
    var lowRateIsA = R.chance(0.5);
    var mA = lowRateIsA ? mLow : mHigh, bA = lowRateIsA ? bHigh : bLow, mB = lowRateIsA ? mHigh : mLow, bB = lowRateIsA ? bLow : bHigh;
    var n = R.chance(0.5) ? R.int(1, c - 1) : R.int(c + 1, c + 4), costA = bA + mA * n, costB = bB + mB * n;
    var Lk = costA < costB ? 'A' : 'B', Lw = other(Lk);
    var xs = [0, 2, 4, 6];
    return {
      stem: 'Plan A costs ' + bA + ' riyals to join plus ' + mA + ' riyals per month. Plan B\'s total cost is shown in the table. Which plan is cheaper after ' + n + ' month' + (n === 1 ? '' : 's') + '?',
      fig: C.table({ cols: ['Months', 'Plan B cost (riyals)'], rows: xs.map(function (x) { return [x, bB + mB * x]; }) }),
      think: 'Work out both costs at ' + n + ' months.',
      parts: [{ kind: 'choice', label: 'Cheaper after ' + n + ' months', keep: true, opts: [{ t: 'Plan A', ok: Lk === 'A', tag: Lk === 'A' ? undefined : 'M11' }, { t: 'Plan B', ok: Lk === 'B', tag: Lk === 'B' ? undefined : 'M11' }, { t: 'They cost the same', tag: 'M11' }] }],
      answer: 'Plan ' + Lk + ' (A: ' + costA + ' riyals, B: ' + costB + ' riyals)',
      work: ['Plan B: for every 1 more month, its cost goes up by ' + (2 * mB) + ' ÷ 2 = ' + mB + ' riyals, starting from ' + bB + '.',
        'At ' + n + ' months: A = ' + bA + ' + ' + mA + ' × ' + n + ' = ' + costA + ' riyals. B = ' + bB + ' + ' + mB + ' × ' + n + ' = ' + costB + ' riyals.',
        '<b>Plan ' + Lk + '</b> is cheaper at ' + n + ' months. They cost the same at month ' + c + ', so which plan wins depends on the month.'],
      why: { M11: n < c ? 'Plan ' + Lw + ' has the lower monthly price, but it starts ' + d * c + ' riyals higher, and after ' + n + ' months it has not caught up yet.' : 'Plan ' + Lw + ' starts cheaper, but it costs ' + d + ' riyals more for every 1 more month, and by month ' + n + ' that has added up.' },
      steps: [
        { label: 'Plan A after ' + n + ' months: ' + bA + ' + ' + mA + ' × ' + n + ' =', part: { kind: 'num', key: costA }, hint: 'Joining fee plus the monthly price times the months.' },
        { label: 'Plan B: for every 1 more month, its cost goes up by', part: { kind: 'num', key: mB, wrong: [{ v: 2 * mB, tag: 'M8' }] }, hint: 'The table goes up ' + (2 * mB) + ' every 2 months: ' + (2 * mB) + ' ÷ 2.' },
        { label: 'Plan B after ' + n + ' months: ' + bB + ' + ' + mB + ' × ' + n + ' =', part: { kind: 'num', key: costB }, hint: 'Start value plus the rate times the months.' },
        { label: 'Which is cheaper after ' + n + ' months?', part: { kind: 'choice', keep: true, opts: [{ t: 'Plan A', ok: Lk === 'A' }, { t: 'Plan B', ok: Lk === 'B' }] }, hint: 'Compare ' + costA + ' and ' + costB + '.' }
      ]
    };
  } });

  // drag the marker along the months axis to where the plans cost the same
  C.add({ id: 'CP-5c', skill: '17', level: 5, order: 2, type: 'IA', ia: true, gen: function (R) {
    // everything in tens on an 8-month window, so the crossing sits on a grid corner
    var mLow, d, mHigh, c, bLow, bHigh, top;
    do { mLow = R.pick([10, 20]); d = R.pick([10, 20]); mHigh = mLow + d; c = R.int(3, 7); bLow = R.pick([10, 20, 30, 40]); bHigh = bLow + d * c; top = Math.max(bHigh + 8 * mLow, bLow + 8 * mHigh); }
    while (top > 250);
    var lowRateIsA = R.chance(0.5);
    var mA = lowRateIsA ? mLow : mHigh, bA = lowRateIsA ? bHigh : bLow, mB = lowRateIsA ? mHigh : mLow, bB = lowRateIsA ? bLow : bHigh;
    var Lr = lowRateIsA ? 'A' : 'B', Ls = other(Lr);   // Lr: lower rate (cheaper later); Ls: lower start
    var dy = 10, ly = 50, yTop = up(top + 1, ly);
    var cost = bLow + mHigh * c, xl = c >= 6 ? 2 : 8;   // line labels away from the crossing
    var grid = { x: [0, 8], y: [0, yTop], dx: 1, dy: dy, ly: ly, xl: 'Months', yl: 'Total cost (riyals)', size: 400, label: 'Cost of plan A and plan B',
      lines: [{ m: mA, b: bA }, { m: mB, b: bB, color: C.COL.line3 }],
      pts: [{ x: xl, y: bA + xl * mA, l: 'Plan A', c: C.COL.line, r: 4 }, { x: xl, y: bB + xl * mB, l: 'Plan B', c: C.COL.line3, r: 4 }] };
    return {
      stem: 'Plan A and Plan B are drawn as lines of total cost (riyals) against months. Drag the orange marker along the months axis to the month when both plans cost the same. Then choose which plan is cheaper after that month.',
      think: 'Find where the two lines cross, then read down to the months axis.',
      parts: [
        { kind: 'points', label: 'Month when the costs are equal', grid: grid, start: [[0, 0]], names: ['Marker'], labels: false, lock: 'y', step: 1, stepY: dy, key: [[c, 0]],
          extra: function (cur) { return [{ p: [[cur[0][0], 0], [cur[0][0], 1]], dash: true, color: '#94A3B8', w: 2 }]; },
          readout: function (cur) { return 'Marker at month ' + f(cur[0][0]) + '.'; } },
        { kind: 'choice', label: 'After that month, the cheaper plan is', keep: true, opts: [{ t: 'Plan A', ok: Lr === 'A', tag: Lr === 'A' ? undefined : 'M11' }, { t: 'Plan B', ok: Lr === 'B', tag: Lr === 'B' ? undefined : 'M11' }] }
      ],
      answer: 'Month ' + c + ' (both cost ' + cost + ' riyals); after that, Plan ' + Lr + ' is cheaper',
      answerFig: C.graph(Object.assign({}, grid, { lines: grid.lines.concat([{ p: [[c, 0], [c, 1]], dash: true, color: '#94A3B8', w: 2 }]), pts: grid.pts.concat([{ x: c, y: cost, l: C.pt(c, cost) }, { x: c, y: 0 }]) })),
      work: ['Plan ' + Ls + ' starts ' + (bHigh - bLow) + ' riyals cheaper (' + bLow + ' vs ' + bHigh + ').',
        'Plan ' + Lr + ' costs ' + d + ' riyals less for every 1 more month (' + mLow + ' vs ' + mHigh + '), so the gap closes by ' + d + ' each month: ' + (bHigh - bLow) + ' ÷ ' + d + ' = <b>month ' + c + '</b>, when both cost ' + cost + ' riyals.',
        'Before month ' + c + ' the lower start wins; after it, <b>Plan ' + Lr + '</b> is cheaper because its line rises more slowly.'],
      why: { M11: 'Plan ' + Ls + ' starts cheaper, but it costs ' + mHigh + ' riyals for every 1 more month. After month ' + c + ' its line is above Plan ' + Lr + '\'s, which only goes up ' + mLow + ' riyals per month.' },
      steps: [
        { label: 'At 0 months, how many riyals more does Plan ' + Lr + ' cost than Plan ' + Ls + '?', part: { kind: 'num', key: bHigh - bLow }, hint: 'Read where each line crosses the cost axis: ' + bHigh + ' − ' + bLow + '.' },
        { label: 'Plan ' + Ls + ' costs ' + mHigh + ' riyals per month, Plan ' + Lr + ' costs ' + mLow + '. By how much does the gap close each month?', part: { kind: 'num', key: d }, hint: mHigh + ' − ' + mLow + '.' },
        { label: 'Months until the costs are equal: ' + (bHigh - bLow) + ' ÷ ' + d + ' =', part: { kind: 'num', key: c }, hint: 'Divide the starting gap by how much it closes each month.' },
        { label: 'After that month, which plan is cheaper?', part: { kind: 'choice', keep: true, opts: [{ t: 'Plan A', ok: Lr === 'A' }, { t: 'Plan B', ok: Lr === 'B' }] }, hint: 'After the crossing, the plan whose line rises more slowly stays lower.' }
      ]
    };
  } });

  C.add({ id: 'CP-5b', skill: '17', level: 5, order: 3, type: 'FR', gen: function (R) {
    var mA, mB, bA, bB;
    do { mA = R.int(3, 20); mB = R.pick([5, 10, 15, 20]); bA = 5 * R.int(2, 12); bB = 10 * R.int(1, 4); }
    while (mA === mB || bA === mA || bA === mB || bB === mA || bB === mB || bA === bB);
    var Lk = mA > mB ? 'A' : 'B', hi = Math.max(mA, mB), lo = Math.min(mA, mB);
    var yTop = up(bB + 8 * mB + 1, 20), ly = yTop > 120 ? 40 : 20;
    // wrong values in the number slots: a starting amount (M9), or B's y-intercept read as its rate (M12)
    function wr(isA) { return isA ? [{ v: bA, tag: 'M9' }] : [{ v: bB, tag: 'M12' }]; }
    return {
      stem: 'Savings account A starts at ' + bA + ' riyals and increases by ' + mA + ' riyals each day. Savings account B is shown on the graph. Complete the sentence.',
      fig: C.graph({ x: [0, 8], y: [0, yTop], dx: 1, dy: 10, ly: ly, xl: 'Days', yl: 'Savings (riyals)', size: 340, label: 'Graph of savings account B', lines: [{ m: mB, b: bB, color: C.COL.line3 }], pts: [{ x: 0, y: bB, c: C.COL.line3 }, { x: 2, y: bB + 2 * mB, c: C.COL.line3 }, { x: 6, y: bB + 6 * mB, l: 'B', c: C.COL.line3 }] }),
      sentence: 'Account {0} has the greater rate of change, because it changes by {1} riyals per day and the other changes by {2} riyals per day.',
      parts: [
        { kind: 'choice', inline: true, keep: true, opts: [{ t: 'A', ok: Lk === 'A', tag: Lk === 'A' ? undefined : (bB > bA ? 'M9' : 'M11') }, { t: 'B', ok: Lk === 'B', tag: Lk === 'B' ? undefined : (bA > bB ? 'M9' : 'M11') }] },
        { kind: 'num', inline: true, key: hi, wrong: wr(Lk === 'A') },
        { kind: 'num', inline: true, key: lo, wrong: wr(Lk !== 'A') }
      ],
      answer: 'Account ' + Lk + ', because it changes by ' + hi + ' riyals per day and the other changes by ' + lo + ' riyals per day',
      work: ['A changes by ' + mA + ' riyals for every 1 more day.',
        'On B\'s graph, savings go from ' + bB + ' to ' + (bB + 2 * mB) + ' in 2 days: ' + (2 * mB) + ' ÷ 2 = ' + mB + ' riyals for every 1 more day.',
        hi + ' > ' + lo + ', so <b>account ' + Lk + '</b> has the greater rate. The starting amounts (' + bA + ' and ' + bB + ') do not matter here.'],
      why: { M9: 'You used a starting amount. The rate is how much the savings change for every 1 more day.', M12: 'B crosses the savings axis at ' + bB + ': that is its starting amount, not its rate. Its rate is ' + mB + ' riyals per day.' },
      steps: [
        { label: 'For every 1 more day, account A changes by', part: { kind: 'num', key: mA }, hint: 'The words say: increases by ' + mA + ' each day.' },
        { label: 'B goes from ' + bB + ' riyals at day 0 to ' + (bB + 2 * mB) + ' at day 2. For every 1 more day it changes by', part: { kind: 'num', key: mB, wrong: [{ v: bB, tag: 'M12' }] }, hint: (2 * mB) + ' ÷ 2.' },
        { label: 'Which account has the greater rate?', part: { kind: 'choice', keep: true, opts: [{ t: 'A', ok: Lk === 'A' }, { t: 'B', ok: Lk === 'B' }] }, hint: 'Compare ' + mA + ' and ' + mB + '.' }
      ]
    };
  } });

  C.add({ id: 'CP-6a', skill: '17', level: 6, order: 1, type: 'NE', gen: function (R) {
    var mO, mM, c, low, bO, bM, d;
    do {
      mO = R.pick([10, 15, 20, 25, 30]); mM = mO + R.pick([-20, -10, 10, 20]); c = R.int(2, 10); low = 10 * R.int(0, 5);
      d = Math.abs(mO - mM);
      if (mO > mM) { bO = low; bM = low + d * c; } else { bM = low; bO = low + d * c; }
    } while (mM < 5 || mM > 40 || bO + 10 * mO > 300 || c === d || bM === 0);
    var maya = 'Maya', omar = 'Omar', gap = Math.abs(bO - bM), top = bO + 10 * mO, dy = top <= 190 ? 10 : 20, ly = 5 * dy, yTop = up(top + 1, ly);
    var x2; for (x2 = 4; x2 <= 10; x2++) if ((mO * x2) % dy === 0) break;
    var same = bM + mM * c;
    return {
      stem: maya + ' has ' + bM + ' riyals and saves ' + mM + ' riyals per week. ' + omar + '\'s savings are shown on the graph. After how many weeks will they have the same amount?',
      fig: C.graph({ x: [0, 10], y: [0, yTop], dx: 1, dy: dy, ly: ly, xl: 'Weeks', yl: 'Omar\'s savings (riyals)', size: 360, label: 'Graph of Omar\'s savings', lines: [{ m: mO, b: bO, color: C.COL.line3 }], pts: [{ x: 0, y: bO, c: C.COL.line3 }, { x: x2, y: bO + mO * x2, l: C.pt(x2, bO + mO * x2), c: C.COL.line3 }] }),
      think: 'How big is the gap at the start, and how much does it close each week?',
      parts: [{ kind: 'num', label: 'Weeks', key: c, wrong: [{ v: gap, tag: 'M14' }, { v: d, tag: 'M14' }] }],
      answer: c + ' weeks (both have ' + same + ' riyals)',
      work: ['Omar starts at ' + bO + ' riyals and saves (' + (bO + mO * x2) + ' − ' + bO + ') ÷ ' + x2 + ' = ' + mO + ' riyals for every 1 more week.',
        'The gap starts at ' + gap + ' riyals (' + Math.max(bO, bM) + ' − ' + Math.min(bO, bM) + ') and closes by ' + Math.max(mO, mM) + ' − ' + Math.min(mO, mM) + ' = ' + d + ' riyals each week.',
        gap + ' ÷ ' + d + ' = <b>' + c + ' weeks</b>. Check: both have ' + same + ' riyals.'],
      why: { M14: 'That is one of the gaps, not the number of weeks. The starting gap (' + gap + ' riyals) closes by ' + d + ' riyals each week, so divide: ' + gap + ' ÷ ' + d + ' = ' + c + '.' },
      steps: [
        { label: 'How much does Omar have at week 0?', part: { kind: 'num', key: bO }, hint: 'Where his line crosses the savings axis.' },
        { label: 'For every 1 more week, how much does Omar save?', part: { kind: 'num', key: mO }, hint: 'From (0, ' + bO + ') to ' + C.pt(x2, bO + mO * x2) + ': ' + (mO * x2) + ' ÷ ' + x2 + '.' },
        { label: 'The starting gap is ' + gap + ' riyals. Each week it closes by', part: { kind: 'num', key: d }, hint: 'Bigger rate minus smaller rate: ' + Math.max(mO, mM) + ' − ' + Math.min(mO, mM) + '.' },
        { label: 'Weeks until they are equal: ' + gap + ' ÷ ' + d + ' =', part: { kind: 'num', key: c }, hint: 'Divide the gap by how much it closes each week.' }
      ]
    };
  } });

  C.add({ id: 'CP-6b', skill: '17', level: 6, order: 2, type: 'MS', gen: function (R) {
    var mA, mB, bA, bB, X, xStar, eqTrue, trues, s1, s2, s3, s4;
    do {
      mA = R.nz(-8, 8); mB = R.nz(-8, 8); bA = 10 * R.int(2, 8); bB = 10 * R.int(2, 8);
      xStar = mA !== mB ? (bB - bA) / (mA - mB) : NaN;
      eqTrue = xStar === Math.round(xStar) && xStar >= 1 && xStar <= 10 && R.chance(0.7);
      X = eqTrue ? xStar : R.int(2, 8);
      s1 = bA > bB; s2 = mB > mA; s3 = bA + mA * X === bB + mB * X; s4 = mA < 0;
      trues = [s1, s2, s3, s4].filter(Boolean).length + 1;
    } while (mA === mB || bA === bB || Math.abs(mA) < 2 || Math.abs(mB) < 2 || trues < 2 || trues > 4 || bA + 7 * mA < 0 || bA + mA * X < 0 || bB + mB * X < 0);
    var xs = [1, 3, 5, 7], rows = xs.map(function (x) { return [x, bA + mA * x]; });
    var Av = bA + mA * X, Bv = bB + mB * X;
    var opts = [
      { t: 'A has the greater initial value', ok: s1, tag: s1 ? undefined : 'M9', missTag: 'M9' },
      { t: 'B has the greater rate of change', ok: s2, tag: s2 ? undefined : 'M9', missTag: 'M9' },
      { t: 'They have the same balance at week ' + X, ok: s3, tag: s3 ? undefined : 'M11', missTag: 'M11' },
      { t: 'A is decreasing', ok: s4, tag: s4 ? undefined : 'M2', missTag: 'M2' },
      { t: 'Both are linear', ok: true, missTag: 'M7' }
    ];
    var right = opts.filter(function (o) { return o.ok; }).map(function (o) { return o.t; });
    return {
      stem: 'Account A\'s balance (riyals) is shown in the table. Account B starts with ' + bB + ' riyals and ' + (mB > 0 ? 'goes up' : 'goes down') + ' by ' + Math.abs(mB) + ' riyals every week. Select all the true statements.',
      fig: C.table({ cols: ['Week', 'Account A (riyals)'], rows: rows }),
      think: 'Find A\'s rate and initial value first. Then check each statement.',
      parts: [{ kind: 'multi', label: 'True statements', opts: opts }],
      answer: right.join('; '),
      work: ['A: the balance changes by ' + f(2 * mA) + ' every 2 weeks, so ' + f(mA) + ' riyals for every 1 more week. Going back 1 week from week 1: initial value ' + f(bA + mA) + ' − ' + par(mA) + ' = ' + bA + ' riyals.',
        'B: rate ' + f(mB) + ' riyals per week, initial value ' + bB + ' riyals.',
        'At week ' + X + ': A = ' + f(Av) + ', B = ' + f(Bv) + '. A is ' + (mA < 0 ? '' : 'not ') + 'decreasing; both change at a constant rate, so both are linear.',
        'True: <b>' + right.join('; ') + '</b>.'],
      why: { M9: 'Keep the rate and the initial value apart: A has rate ' + f(mA) + ' and starts at ' + bA + '; B has rate ' + f(mB) + ' and starts at ' + bB + '.', M11: 'Check both at week ' + X + ': A has ' + f(Av) + ' riyals and B has ' + f(Bv) + '.', M2: 'A\'s rate is ' + f(mA) + (mA < 0 ? ', which is negative, so A is decreasing.' : ', which is positive, so A is increasing.'), M7: 'Both change by the same amount every week, so both are linear.' },
      steps: [
        { label: 'For every 1 more week, A\'s balance changes by', part: { kind: 'num', key: mA, wrong: [{ v: 2 * mA, tag: 'M8' }] }, hint: 'The weeks go up by 2 each row: ' + f(2 * mA) + ' ÷ 2.' },
        { label: 'A\'s initial value (week 0) =', part: { kind: 'num', key: bA }, hint: 'Go back 1 week from week 1: ' + f(bA + mA) + ' − ' + par(mA) + '.' },
        { label: 'A\'s balance at week ' + X + ' =', part: { kind: 'num', key: Av }, hint: bA + ' ' + C.term(mA) + ' × ' + X + '.' },
        { label: 'B\'s balance at week ' + X + ' =', part: { kind: 'num', key: Bv }, hint: bB + ' ' + C.term(mB) + ' × ' + X + '.' }
      ]
    };
  } });
})();
