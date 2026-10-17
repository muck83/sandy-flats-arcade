/* Climb question bank: Strand E, linear vs nonlinear.
   Skill 14 (identify): LN-2a, LN-3a, LN-4a, LN-4c.  Skill 15 (justify): LN-4b, LN-5c, LN-5a, LN-5b, LN-6b.
   Each template's gen(R) builds one question from the seeded random helpers R; see climb/core.js for the item format. */
(function () {
  'use strict';
  var C = window.CLIMB, f = C.fmt, M = '−';
  function par(v) { return v < 0 ? '(' + f(v) + ')' : f(v); }   // 3 − (−2)
  function yn(yes, tagYes, tagNo) { return { kind: 'choice', keep: true, opts: [{ t: 'Yes', ok: yes, tag: yes ? undefined : tagYes }, { t: 'No', ok: !yes, tag: yes ? tagNo : undefined }] }; }
  function diffs(ys) { var d = []; for (var i = 1; i < ys.length; i++) d.push(ys[i] - ys[i - 1]); return d; }
  function sgn(v) { return v < 0 ? f(v) : '+' + f(v); }           // +3, −2
  function allEq(a) { return a.every(function (v) { return C.near(v, a[0], 1e-9); }); }
  // a compact sideways table (x row, y row)
  function stbl(xs, ys) { return C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }), side: true }); }

  // the four kinds of x = 1, 2, 3, 4 table from LN-2a: linear, doubling, squares, growing changes
  function tbl4(R, type, neg) {
    var ys;
    if (type === 'lin') { var m = neg && R.chance(0.4) ? -R.int(2, 5) : R.int(2, 5), a = neg ? R.int(-6, 12) : R.int(1, 10); ys = [0, 1, 2, 3].map(function (i) { return a + m * i; }); }
    else if (type === 'dbl') { var c = R.int(1, 3); ys = [c, 2 * c, 4 * c, 8 * c]; }
    else if (type === 'sq') { var k = neg ? R.int(-5, 5) : R.int(0, 5); ys = [1, 4, 9, 16].map(function (v) { return v + k; }); }
    else { var s = neg ? R.int(-4, 8) : R.int(1, 8), g = R.int(1, 2); ys = [s, s + g, s + 2 * g + 1, s + 3 * g + 3]; }
    return ys;
  }

  /* ---------------- Skill 14: Linear or nonlinear, identify ---------------- */
  C.add({ id: 'LN-2a', skill: '14', level: 2, type: 'MC', gen: function (R) {
    var xs = [1, 2, 3, 4], L = tbl4(R, 'lin'), D = tbl4(R, 'dbl'), S = tbl4(R, 'sq'), G = tbl4(R, 'grow');
    var m = L[1] - L[0], gd = diffs(G), dd = diffs(D);
    return {
      stem: 'Which table shows a constant rate of change (the step)?',
      think: 'Find the change in y from each row to the next.',
      parts: [{ kind: 'choice', label: 'Constant rate', opts: [
        { t: stbl(xs, L), ok: true },
        { t: stbl(xs, D), tag: 'M7' },
        { t: stbl(xs, S), tag: 'M7' },
        { t: stbl(xs, G), tag: 'M7' }
      ] }],
      answer: 'The table with y = ' + L.map(f).join(', '),
      work: ['x goes up by 1 each row, so look at the change in y.', 'y = ' + L.map(f).join(', ') + ' changes by ' + diffs(L).map(sgn).join(', ') + ': the same every time.', 'The others change by different amounts (for example ' + gd.map(sgn).join(', ') + '), so the linear table is <b>y = ' + L.map(f).join(', ') + '</b>.'],
      why: { M7: 'That table goes up, but not by the same amount each time: its changes are different. Linear needs the same change for every 1 more x.' },
      steps: [
        { label: 'In the table y = ' + G.map(f).join(', ') + ', the changes are ' + sgn(gd[0]) + ', ' + sgn(gd[1]) + ', then', part: { kind: 'num', key: gd[2] }, hint: f(G[3]) + ' − ' + f(G[2]) + '.' },
        { label: 'In the table y = ' + D.map(f).join(', ') + ', the changes are ' + dd.map(sgn).join(', ') + '. Are they all the same?', part: yn(false, 'M7'), hint: 'Compare the three changes.' },
        { label: 'In the table y = ' + L.map(f).join(', ') + ', how much does y change each row?', part: { kind: 'num', key: m }, hint: f(L[1]) + ' − ' + f(L[0]) + ', and check the other rows.' },
        { label: 'So which table has a constant rate?', part: { kind: 'choice', opts: [{ t: 'y = ' + L.map(f).join(', '), ok: true }, { t: 'y = ' + D.map(f).join(', '), tag: 'M7' }, { t: 'y = ' + G.map(f).join(', '), tag: 'M7' }] }, hint: 'The one whose changes are all the same.' }
      ]
    };
  } });

  C.add({ id: 'LN-3a', skill: '14', level: 3, type: 'MC', gen: function (R) {
    var m = R.pick([1, 2, -1, -2, 3, -3]), b = R.nz(-4, 4);   // off the origin, crosses the window
    var win = { x: [-6, 6], y: [-6, 6], size: 170, nums: false };
    function g(extra, label) { var o = {}; for (var k in win) o[k] = win[k]; for (k in extra) o[k] = extra[k]; o.label = label; return C.graph(o); }
    var cf = R.chance(0.5) ? function (x) { return (x + 6) * (x + 6) / 6 - 5; } : function (x) { return Math.pow(2, x / 2) - 4; };
    var h = R.int(-2, 2), k = R.int(-4, 0), s = R.pick([1, 2]), up = R.chance(0.6), c = up ? R.int(-5, 1) : R.int(-1, 5);
    var dots = [-2, -1, 0, 1, 2].map(function (x) { return { x: x, y: (up ? x * x : -x * x) + c, r: 5, c: C.COL.line }; });
    var lineG = g({ lines: [{ m: m, b: b }] }, 'A straight line');
    return {
      stem: 'Which graph shows a linear function?',
      think: 'Linear means the same steepness everywhere.',
      parts: [{ kind: 'choice', label: 'Linear', opts: [
        { t: lineG, ok: true },
        { t: g({ lines: [{ f: cf, curve: true }] }, 'A curve that gets steeper'), tag: 'M7' },
        { t: g({ lines: [{ f: function (x) { return s * Math.abs(x - h) + k; }, curve: true }] }, 'A V shape') },
        { t: g({ pts: dots }, 'Points that bend along a curve'), tag: 'M7' }
      ] }],
      answer: 'The straight line',
      answerFig: lineG,
      work: ['A linear function has the same rate of change (the step) everywhere, so its graph is a straight line.', 'The curve gets steeper as x grows, the V changes direction, and the points bend: their rates keep changing.', 'Only <b>the straight line</b> is linear (it does not need to pass through (0, 0)).'],
      why: { M7: 'That graph goes up, or follows a pattern, but its steepness keeps changing. Linear means one straight line with the same rate everywhere.' },
      steps: [
        { label: 'Does a curve have the same steepness everywhere?', part: yn(false, 'M7'), hint: 'A curve gets steeper or flatter as you move along it.' },
        { label: 'Does a V shape have the same rate of change everywhere?', part: yn(false), hint: 'It goes down on one side and up on the other.' },
        { label: 'So which shape is linear?', part: { kind: 'choice', keep: true, opts: [{ t: 'A straight line', ok: true }, { t: 'A curve', tag: 'M7' }, { t: 'A V shape' }, { t: 'Points along a curve', tag: 'M7' }] }, hint: 'Same rate everywhere means straight.' }
      ]
    };
  } });

  C.add({ id: 'LN-4a', skill: '14', level: 4, type: 'MS', gen: function (R) {
    var m, b = R.int(1, 9), c = R.nz(-9, 9), k = R.int(2, 12), d = R.int(2, 5), e = R.nz(-8, 8), q = R.nz(-6, 6);
    do { m = R.nz(-6, 6); } while (Math.abs(m) === 1);
    var eLin = C.eqText(m, -b), eSq = 'y = x² ' + C.term(q), eC = 'y = ' + f(c), eInv = 'y = ' + k + '/x', eDiv = 'y = x/' + d + ' ' + C.term(e), eXY = 'xy = ' + k;
    return {
      stem: 'Select <b>all</b> the linear equations.',
      think: 'Can it be written as y = mx + b?',
      parts: [{ kind: 'multi', label: 'Linear equations', opts: [
        { t: eLin, ok: true },
        { t: eSq, ok: false },
        { t: eC, ok: true, missTag: 'M15' },
        { t: eInv, ok: false },
        { t: eDiv, ok: true, missTag: 'M7' },
        { t: eXY, ok: false }
      ] }],
      answer: eLin + ', ' + eC + ' and ' + eDiv,
      work: ['A linear equation can be written y = mx + b: x to the first power, not squared and not on the bottom of a fraction.', eDiv + ' is ' + C.eqText(1 / d, e) + ', and ' + eC + ' is y = 0x ' + C.term(c) + ' (step 0).', eSq + ' has x², while ' + eInv + ' and ' + eXY + ' have x on the bottom of a fraction (y = ' + k + '/x).', 'Linear: <b>' + eLin + ', ' + eC + ', ' + eDiv + '</b>.'],
      why: { M15: eC + ' is linear too: its rate of change (the step) is 0, a flat line.', M7: eDiv + ' is the same as ' + C.eqText(1 / d, e) + ': x is divided by a number, not by x, so it is linear.' },
      steps: [
        { label: 'Is ' + eC + ' linear? (Think of its graph.)', part: yn(true, undefined, 'M15'), hint: 'It is a horizontal line: rate 0.' },
        { label: eDiv + ' is the same as ' + C.eqText(1 / d, e) + '. Is it linear?', part: yn(true, undefined, 'M7'), hint: 'Dividing x by ' + d + ' is multiplying x by 1/' + d + '.' },
        { label: 'In ' + eInv + ', x is on the bottom of the fraction (you divide by x). Is it linear?', part: yn(false), hint: 'Its graph is a curve.' },
        { label: 'Is ' + eSq + ' linear?', part: yn(false), hint: 'x is squared.' }
      ]
    };
  } });

  // the plan's fill-the-table EG item, built as drag points: x = 1, 2, 3, 4 is fixed, the student sets each y
  C.add({ id: 'LN-4c', skill: '14', level: 5, type: 'EG', ia: true, gen: function (R) {
    var y0 = R.int(1, 4), keys = [[1, 2, 4, 8], [y0, y0 + 1, y0 + 3, y0 + 6], [y0, y0 + 3, y0 + 4, y0 + 7], [1, 4, 9, 11]], ky = R.pick(keys), st = R.int(1, 5);
    var kp = ky.map(function (y, i) { return [i + 1, y]; });
    var grid = { x: [0, 5], y: [0, 12], dx: 1, dy: 1, ly: 2, xl: 'x', yl: 'y', size: 400 };
    function ysOf(cur) { return cur.slice().sort(function (a, b) { return a[0] - b[0]; }).map(function (q) { return q[1]; }); }
    var ex = [y0 + 1, y0 + 3, y0 + 5, y0 + 7], exd = diffs(ex), kd = diffs(ky);
    return {
      stem: 'Make a table where y <b>always increases</b> but the function is <b>NOT linear</b>. x = 1, 2, 3, 4 is given: drag each point up or down to set its y-value.',
      think: 'Going up is not enough. What makes a table linear?',
      parts: [{ kind: 'points', label: 'Your table', grid: grid, lock: 'x', connect: 'poly', labels: false, start: [[1, st], [2, st], [3, st], [4, st]], key: kp,
        readout: function (cur) { var ys = ysOf(cur); return 'y = ' + ys.map(f).join(', ') + '  ·  changes: ' + diffs(ys).map(sgn).join(', '); },
        check: function (cur) {
          var ys = ysOf(cur), d = diffs(ys);
          if (!d.every(function (v) { return v > 0; })) return { ok: false };
          if (allEq(d)) return { ok: false, tag: 'M7' };
          return { ok: true };
        } }],
      answer: 'Any table that goes up by different amounts, for example y = ' + ky.join(', ') + ' (changes ' + kd.map(sgn).join(', ') + ')',
      answerFig: C.graph({ x: grid.x, y: grid.y, ly: 2, xl: 'x', yl: 'y', size: 260, lines: [{ seg: kp }], pts: kp.map(function (q) { return { x: q[0], y: q[1] }; }), label: 'An increasing table that is not linear' }),
      work: ['Increasing means every change in y is positive.', 'Linear means every change is the same, so the changes must be different, for example ' + kd.map(sgn).join(', ') + '.', 'One answer: <b>y = ' + ky.join(', ') + '</b>.'],
      why: { M7: 'Your table goes up by the same amount every time, so it IS linear. Increasing just means going up; make the changes different.' },
      steps: [
        { label: 'The table y = ' + ex.join(', ') + ' changes by ' + exd.map(sgn).join(', ') + '. Is it linear?', part: yn(true, undefined, 'M7'), hint: 'The changes are all the same.' },
        { label: 'So to make an increasing table that is NOT linear, the changes must be', part: { kind: 'choice', keep: true, opts: [{ t: 'all positive and all the same', tag: 'M7' }, { t: 'all positive but not all the same', ok: true }, { t: 'all negative' }] }, hint: 'Positive keeps it going up; different stops it being linear.' },
        { label: 'Start with y = ' + y0 + ', ' + (y0 + 1) + ', ' + (y0 + 3) + ' (changes +1, +2). Using a change of +3 next, y at x = 4 is', part: { kind: 'num', key: y0 + 6 }, hint: f(y0 + 3) + ' + 3.' }
      ]
    };
  } });

  /* ---------------- Skill 15: Linear or nonlinear, justify ---------------- */
  C.add({ id: 'LN-4b', skill: '15', level: 4, order: 1, type: 'MC', gen: function (R) {
    var xs = [0, 2, 3, 7], lin = R.chance(0.5), ys, m, b = R.int(-6, 10), k;
    if (lin) { m = R.nz(-4, 4); ys = xs.map(function (x) { return b + m * x; }); }
    else { k = R.nz(-5, 6); ys = [0, 1, 2, 3].map(function (i) { return b + k * i; }); }
    var r = [0, 1, 2].map(function (i) { return (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]); });
    var dy = diffs(ys);
    return {
      stem: 'Is the function in this table linear?',
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }) }),
      think: 'x does not go up by 1 each row.',
      parts: [{ kind: 'choice', label: 'Linear?', keep: true, opts: [
        { t: 'Yes, it is linear', ok: lin, tag: lin ? undefined : 'M8' },
        { t: 'No, it is not linear', ok: !lin, tag: lin ? 'M8' : undefined },
        { t: 'You can’t tell from a table' }
      ] }],
      answer: lin ? 'Yes: the rate is ' + f(m) + ' between every pair of rows' : 'No: the rates are ' + r.map(f).join(', '),
      work: ['x steps by 2, 1 and 4, so compare change in y ÷ change in x, not the y-steps alone.', 'Rates: ' + f(dy[0]) + ' ÷ 2 = ' + f(r[0]) + ', ' + f(dy[1]) + ' ÷ 1 = ' + f(r[1]) + ', ' + f(dy[2]) + ' ÷ 4 = ' + f(r[2]) + '.', lin ? 'The rates are all equal, so it <b>is linear</b>.' : 'The rates are not equal, so it is <b>not linear</b>.'],
      why: { M8: lin ? 'The y-steps (' + dy.map(sgn).join(', ') + ') are uneven because x steps unevenly. Per 1 x, each rate is ' + f(m) + ', so it is linear.' : 'y goes up by the same ' + f(k) + ' each row, but x steps by 2, then 1, then 4. Per 1 x the rates are ' + r.map(f).join(', ') + ', so it is not linear.' },
      steps: [
        { label: 'From x = 0 to x = 2, y changes by ' + f(dy[0]) + '. Rate = ' + f(dy[0]) + ' ÷ 2 =', part: { kind: 'num', key: r[0] }, hint: 'Divide the change in y by the change in x.' },
        { label: 'From x = 3 to x = 7, y changes by ' + f(dy[2]) + '. Rate = ' + f(dy[2]) + ' ÷ 4 =', part: { kind: 'num', key: r[2] }, hint: 'x went up by 4 here.' },
        { label: 'Are the rates equal, so the table is linear?', part: yn(lin, 'M8', 'M8'), hint: 'Compare ' + f(r[0]) + ' and ' + f(r[2]) + '.' }
      ]
    };
  } });

  C.add({ id: 'LN-5c', skill: '15', level: 4, order: 2, type: 'DM', ia: true, gen: function (R) {
    var A = tbl4(R, 'lin', true), B = tbl4(R, R.pick(['dbl', 'sq', 'grow']), true), ax = [1, 2, 3, 4];
    var pats = [[0, 1, 3, 4], [0, 2, 3, 7], [1, 2, 4, 7], [0, 3, 4, 6], [1, 3, 4, 8]];
    var cx = R.pick(pats), dx; do { dx = R.pick(pats); } while (dx === cx);
    var m = R.nz(-3, 3), cb = R.int(-5, 6), Cy = cx.map(function (x) { return cb + m * x; });
    var k = R.nz(-4, 5), db = R.int(-5, 8), Dy = [0, 1, 2, 3].map(function (i) { return db + k * i; });
    var cards = R.shuffle([
      { t: stbl(ax, A), bin: 0 },
      { t: stbl(ax, B), bin: 1, tag: 'M7' },
      { t: stbl(cx, Cy), bin: 0, tag: 'M8' },
      { t: stbl(dx, Dy), bin: 1, tag: 'M8' }
    ]);
    var cr = [(Cy[1] - Cy[0]) / (cx[1] - cx[0]), (Cy[3] - Cy[2]) / (cx[3] - cx[2])];
    var dr = [0, 1, 2].map(function (i) { return (Dy[i + 1] - Dy[i]) / (dx[i + 1] - dx[i]); });
    function list(bin) { return cards.filter(function (c) { return c.bin === bin; }).map(function (c) { return c.t; }).join(''); }
    return {
      stem: 'Sort the four tables into <b>Linear</b> or <b>Not linear</b>. Watch the x-values: two tables do not step by 1.',
      think: 'Compare change in y ÷ change in x.',
      parts: [{ kind: 'sort', label: 'Sort the tables', bins: ['Linear', 'Not linear'], cards: cards }],
      answer: 'Linear: y = ' + A.map(f).join(', ') + ' and y = ' + Cy.map(f).join(', ') + '. Not linear: the other two.',
      answerFig: '<div style="display:flex;gap:18px;flex-wrap:wrap"><div><b>Linear</b>' + list(0) + '</div><div><b>Not linear</b>' + list(1) + '</div></div>',
      work: ['When x steps by 1, compare the y-changes: ' + diffs(A).map(sgn).join(', ') + ' (same, linear) and ' + diffs(B).map(sgn).join(', ') + ' (not the same).', 'When x skips, divide: x = ' + cx.join(', ') + ' gives rate ' + f(m) + ' every time, so it <b>is linear</b> even though its y-steps are uneven.', 'x = ' + dx.join(', ') + ' has equal y-steps of ' + f(k) + ' but rates ' + dr.map(f).join(', ') + ', so it is <b>not linear</b>.'],
      why: { M8: 'Uneven x-steps change the y-steps. Divide each change in y by its change in x before you decide.', M7: 'That table changes by different amounts each row (' + diffs(B).map(sgn).join(', ') + '), so it is not linear.' },
      steps: [
        { label: 'In the table with x = ' + cx.join(', ') + ' and y = ' + Cy.map(f).join(', ') + ', the rate from the first two rows is', part: { kind: 'num', key: cr[0] }, hint: '(' + f(Cy[1]) + ' − ' + par(Cy[0]) + ') ÷ (' + cx[1] + ' − ' + cx[0] + ').' },
        { label: 'And from the last two rows?', part: { kind: 'num', key: cr[1] }, hint: '(' + f(Cy[3]) + ' − ' + par(Cy[2]) + ') ÷ (' + cx[3] + ' − ' + cx[2] + ').' },
        { label: 'So that table is', part: { kind: 'choice', keep: true, opts: [{ t: 'Linear', ok: true }, { t: 'Not linear', tag: 'M8' }] }, hint: 'Equal rates mean linear.' },
        { label: 'The table with x = ' + dx.join(', ') + ' goes up by ' + f(k) + ' every row. Its rates are ' + dr.map(f).join(', ') + '. It is', part: { kind: 'choice', keep: true, opts: [{ t: 'Linear', tag: 'M8' }, { t: 'Not linear', ok: true }] }, hint: 'The rates are not equal.' }
      ]
    };
  } });

  C.add({ id: 'LN-5a', skill: '15', level: 5, order: 1, type: 'FR', gen: function (R) {
    var type = R.pick(['lin', 'lin', 'dbl', 'sq', 'grow']), lin = type === 'lin', xs = [1, 2, 3, 4], ys = tbl4(R, type, true), d = diffs(ys);
    // the Yes/No part carries the verdict; the sentence is judged on its reason by judge5a
    var text = lin
      ? { kind: 'text', label: 'Explain', sample: 'Yes. y ' + (d[0] > 0 ? 'goes up by ' : 'goes down by ') + f(Math.abs(d[0])) + ' every time x goes up by 1, so the rate of change is constant.', tag: 'M7' }
      : { kind: 'text', label: 'Explain', sample: 'No. The changes in y are ' + d.map(f).join(', ') + ', which are not the same, so the rate is not constant.', tag: 'M7' };
    var item = {
      check: function (vals) {
        if (vals[0] !== (lin ? 0 : 1)) return null;               // wrong verdict: the choice part's tag stands
        return judge5a(vals[1], lin, d) ? { ok: true } : { ok: false, tag: 'M7' };
      },
      stem: 'Is the function in this table linear? Choose, then explain in a sentence.',
      fig: C.table({ cols: ['x', 'y'], rows: xs.map(function (x, i) { return [x, ys[i]]; }) }),
      think: 'Find the change in y for each 1 more x.',
      parts: [
        { kind: 'choice', label: 'Is it linear?', keep: true, opts: [{ t: 'Yes, it is linear', ok: lin, tag: lin ? undefined : 'M7' }, { t: 'No, it is not linear', ok: !lin }] },
        text
      ],
      answer: lin ? 'Yes: y changes by ' + f(d[0]) + ' every time, a constant rate' : 'No: y changes by ' + d.map(f).join(', ') + ', which are not the same',
      work: ['x goes up by 1 each row. Find each change in y.', 'y changes by ' + d.map(sgn).join(', ') + '.', lin ? 'These are equal, so the rate is constant: <b>linear</b>.' : 'These are not equal, so the rate is not constant: <b>not linear</b>, even though it has a pattern.'],
      why: lin ? { M7: 'Every change is ' + f(d[0]) + ', the same each time, so the table is linear.' } : { M7: 'The table has a pattern and goes up, but its changes (' + d.map(f).join(', ') + ') are not the same. Linear needs a constant rate.' },
      steps: [
        { label: 'Change in y from x = 1 to x = 2:', part: { kind: 'num', key: d[0] }, hint: f(ys[1]) + ' − ' + par(ys[0]) + '.' },
        { label: 'From x = 2 to x = 3:', part: { kind: 'num', key: d[1] }, hint: f(ys[2]) + ' − ' + par(ys[1]) + '.' },
        { label: 'From x = 3 to x = 4:', part: { kind: 'num', key: d[2] }, hint: f(ys[3]) + ' − ' + par(ys[2]) + '.' },
        { label: 'Are the changes all the same, so it is linear?', part: yn(lin, 'M7'), hint: 'Compare ' + d.map(f).join(', ') + '.' }
      ]
    };
    return item;
  } });

  /* LN-5a's sentence rubric. d: the changes in y (x steps by 1).
     Linear: must say the change is the same/constant/equal, or give the right step; a wrong direction or step value fails.
     Not linear: must say the changes are different / not the same (or list two of the real, different changes). */
  function judge5a(s, lin, d) {
    var raw = String(s || ''), t = C.norm(raw).replace(/([a-z])-([a-z])/g, '$1 $2').trim();
    if (!t) return false;
    t = ' ' + t.replace(/^(yes|no)\b\s*/, '') + ' ';
    // x's own step of 1 is not the change in y: "x goes up by 1", "for every 1 more x"
    t = t.replace(/ (x|input|inputs|x value|x values) (goes up|go up|increases|increase|changes|change|grows|moves|steps|went up|rises|is increased|gets bigger)(( by)? (1|one))?(?= )/g, ' ')
      .replace(/ (every|each|per|for) (1|one)( more)?(?= )/g, ' ')
      .replace(/ (multiplies|multiplied|multiply|times|divided|divides|doubles|doubled) (by )?-?\d+(?= )/g, ' doubles ');
    var H = function (w) { return C.hasAny(t, w); };
    var up = d.every(function (v) { return v > 0; }), down = d.every(function (v) { return v < 0; });
    var UPW = ['goes up', 'go up', 'increases', 'increasing', 'rises', 'rising', 'grows', 'growing', 'up by', 'gets bigger', 'gets larger', 'adds', 'adding'];
    var DOWNW = ['goes down', 'go down', 'decreases', 'decreasing', 'falls', 'falling', 'drops', 'dropping', 'down by', 'gets smaller', 'subtracts', 'subtracting', 'minus'];
    if ((up && H(DOWNW)) || (down && H(UPW))) return false;
    // step values the student states: "by 3", "a change of 3", "goes up 3", "the rate is 3"
    var nums = [], re = / (by|of|up|down|add|adds|subtract|subtracts|increases|decreases|rises|falls|drops|grows) (-?\d+)(?= )/g, m;
    while ((m = re.exec(t))) nums.push(Math.abs(+m[2]));
    re = / (rate|slope|change|changes|step|steps|difference|differences)( of change)? (is|are|was) (always |all |every time )?(-?\d+)(?= )/g;
    while ((m = re.exec(t))) nums.push(Math.abs(+m[5]));
    var abs = d.map(function (v) { return Math.abs(v); });
    if (nums.some(function (n) { return abs.indexOf(n) < 0; })) return false;
    var DIFF = ['different', 'differ', 'differs', 'not the same', 'not constant', 'not equal', 'unequal', 'varies', 'vary', 'varying', 'uneven', 'not steady', 'not consistent', 'inconsistent', 'isn t constant', 'aren t constant', 'aren t the same', 'isn t the same', 'aren t equal', 'isn t equal', 'not always the same', 'not by the same', 'never the same', 'gets bigger', 'get bigger', 'getting bigger', 'gets larger', 'get larger', 'grows faster', 'faster and faster', 'more and more', 'more each time', 'more every time', 'bigger each time', 'bigger every time', 'keeps changing', 'keep changing', 'doesn t change by the same', 'don t change by the same', 'does not change by the same', 'do not change by the same', 'doesn t go up by the same', 'doesn t increase by the same'];
    if (lin) {
      var CHG = ['rate', 'rates', 'change', 'changes', 'changing', 'slope', 'step', 'steps', 'difference', 'differences', 'goes up', 'goes down', 'go up', 'go down', 'increases', 'decreases', 'increase', 'decrease', 'amount', 'amounts', 'adds', 'subtracts', 'by'];
      var SAME = ['constant', 'same', 'equal', 'steady', 'consistent', 'evenly', 'uniform', 'never changes', 'doesn t change', 'does not change'];
      if (H(['not linear', 'nonlinear', 'non linear', 'isn t linear', 'curve', 'curved', 'different', 'differ', 'differs', 'not the same', 'not constant', 'not equal', 'unequal', 'varies', 'uneven', 'isn t constant', 'aren t the same', 'isn t the same', 'aren t equal', 'not always the same', 'not by the same', 'keeps changing', 'more and more', 'faster and faster'])) return false;
      return (H(CHG) && H(SAME)) || nums.indexOf(abs[0]) >= 0;
    }
    var CHGN = ['rate', 'rates', 'change', 'changes', 'changing', 'slope', 'step', 'steps', 'difference', 'differences', 'amount', 'amounts', 'gap', 'gaps', 'jump', 'jumps', 'by'];
    var listed = abs.filter(function (v, i) { return abs.indexOf(v) === i && (t.indexOf(' ' + v + ' ') >= 0 || t.indexOf(' -' + v + ' ') >= 0); }).length;
    if (H(['is linear', 'it s linear', 'its linear']) && !H(['not linear', 'isn t linear'])) return false;
    return H(CHGN) && (H(DIFF) || listed >= 2);
  }

  C.add({ id: 'LN-5b', skill: '15', level: 5, order: 2, type: 'MC', gen: function (R) {
    var s = R.int(2, 9), area = R.chance(0.5), A = area ? s * s : 4 * s, s2 = 2 * s, what = area ? 'area' : 'perimeter', u = area ? ' cm²' : ' cm';
    var right = area ? 4 * A : 2 * A;
    var opts = [
      { t: 'Yes, the student is right', ok: !area, tag: area ? 'M16' : undefined },
      { t: 'No, it is ' + (4 * A) + u, ok: area },
      { t: 'No, it is ' + (A + s) + u, tag: 'M14' },
      { t: 'You can’t tell' }
    ];
    return {
      stem: 'A square tile with side ' + s + ' cm has ' + what + ' ' + A + u + '. A student says a tile with side ' + s2 + ' cm has ' + what + ' ' + (2 * A) + u + '. Is the student right?',
      think: area ? 'Area = side × side.' : 'Perimeter = 4 × side.',
      parts: [{ kind: 'choice', label: 'The student is', keep: true, opts: opts }],
      answer: area ? 'No, the area is ' + right + ' cm²' : 'Yes, the perimeter is ' + right + ' cm',
      work: area
        ? ['Area = side × side.', s2 + ' × ' + s2 + ' = <b>' + right + ' cm²</b>, which is 4 times ' + A + ', not 2 times.', 'Area is not linear in the side, so doubling the side does not double the area. Check the rate before assuming.']
        : ['Perimeter = 4 × side.', '4 × ' + s2 + ' = <b>' + right + ' cm</b>, which is 2 × ' + A + '.', 'Perimeter is proportional to the side (a line through (0, 0)), so doubling the side really does double it: the student is right.'],
      why: { M16: area
        ? 'Doubling only doubles the output for a proportional relationship. Area = side × side: ' + s2 + ' × ' + s2 + ' = ' + right + ', 4 times as much.'
        : 'Perimeter = 4 × side is proportional (it starts at 0), so doubling the side does double it: 4 × ' + s2 + ' = ' + right + ', 2 times ' + A + '.', M14: 'Adding the side to the ' + what + ' does not match the rule. Use ' + (area ? 'side × side' : '4 × side') + '.' },
      steps: [
        { label: (area ? 'Area = ' + s2 + ' × ' + s2 : 'Perimeter = 4 × ' + s2) + ' =', part: { kind: 'num', key: right }, hint: 'Use the side ' + s2 + ' cm.' },
        { label: 'How many times ' + A + ' is that?', part: { kind: 'num', key: right / A }, hint: f(right) + ' ÷ ' + A + '.' },
        { label: 'So is the student right?', part: yn(!area, 'M16'), hint: 'The student said 2 times.' }
      ]
    };
  } });

  C.add({ id: 'LN-6b', skill: '15', level: 6, type: 'NE', gen: function (R) {
    var gaps, m, b, x0, blank;
    do { gaps = [R.int(2, 3), R.int(1, 4), R.int(1, 5)]; } while (gaps[1] === gaps[0] || gaps[2] === gaps[0]);
    m = R.nz(-5, 5); b = R.int(-8, 10); x0 = R.int(-3, 3); blank = R.pick([2, 3]);
    var xs = [x0, x0 + gaps[0], x0 + gaps[0] + gaps[1], x0 + gaps[0] + gaps[1] + gaps[2]], ys = xs.map(function (x) { return b + m * x; });
    var dy = ys[1] - ys[0], dx = gaps[0], pv = blank - 1, gap = xs[blank] - xs[pv], key = ys[blank];
    var even = ys[pv] + dy;   // gap ≠ dx always, so this never equals the key
    var wrong = [{ v: even, tag: 'M8' }];
    var rows = xs.map(function (x, i) { return [x, i === blank ? '<span class="cblank">?</span>' : ys[i]]; });
    return {
      stem: 'The function in this table is linear. Find the missing y-value.',
      fig: C.table({ cols: ['x', 'y'], rows: rows }),
      think: 'x does not step evenly. Find the rate for 1 more x first.',
      parts: [{ kind: 'num', label: 'y when x = ' + f(xs[blank]), key: key, wrong: wrong }],
      answer: 'y = ' + f(key),
      work: ['Rate = change in y ÷ change in x = ' + f(dy) + ' ÷ ' + dx + ' = ' + f(m) + ' for every 1 more x.', 'From x = ' + f(xs[pv]) + ' to ' + f(xs[blank]) + ' is ' + gap + ' more, so y changes by ' + f(m) + ' × ' + gap + ' = ' + f(m * gap) + '.', f(ys[pv]) + ' ' + C.term(m * gap) + ' = <b>' + f(key) + '</b>'],
      why: { M8: 'You added the first row\'s change (' + f(dy) + ') again, but x went up by ' + gap + ' this time, not ' + dx + '. Use the rate per 1 x: ' + f(m) + ' × ' + gap + '.' },
      steps: [
        { label: 'From x = ' + f(xs[0]) + ' to ' + f(xs[1]) + ', y changes by ' + f(dy) + '. Rate = ' + f(dy) + ' ÷ ' + dx + ' =', part: { kind: 'num', key: m }, hint: 'Divide the change in y by the change in x (' + dx + ').' },
        { label: 'How much does x go up from ' + f(xs[pv]) + ' to ' + f(xs[blank]) + '?', part: { kind: 'num', key: gap }, hint: f(xs[blank]) + ' − ' + par(xs[pv]) + '.' },
        { label: 'So y changes by ' + f(m) + ' × ' + gap + ' =', part: { kind: 'num', key: m * gap }, hint: 'Rate times the change in x.' },
        { label: 'Missing y = ' + f(ys[pv]) + ' ' + C.term(m * gap) + ' =', part: { kind: 'num', key: key }, hint: 'Add the change to the y-value before it.' }
      ]
    };
  } });
})();
