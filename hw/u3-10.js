/* Homework: Unit 3 Lesson 10, Shift It Up or Down. */
SFA_HW({
  id: 'g40', unit: 3, lesson: 10, topic: 'Shift it up or down', title: 'Marcus Delivers', who: 'marcus',
  intro: ['Marcus started a delivery service for the arcade snack bar. Shaved ice costs *4 riyals* a cup at the counter, so the counter price is *f(x) = 4x* for x cups.',
    'Delivery costs the same per cup, plus a *6 riyal* fee on every order. That is *g(x) = f(x) + 6*. Help Marcus price every order before the ice melts.'],
  goal: 'Shift a function up or down: write g(x) = f(x) + k, fill its table, graph it and find k.',
  bigIdea: 'g(x) = f(x) + k adds k to every output: the graph moves up (or down) k, the slope stays the same.',
  levels: [
    { name: 'Add the fee', learn: ['*g(x) = f(x) + k* adds k to *every output*.', 'k > 0: the graph moves *up* k. k < 0: it moves *down*.', 'The slope stays the same, so the lines are parallel.'],
      tasks: [
        { k: 'choice', q: 'Counter price *f(x) = 4x*. Delivery price *g(x) = f(x) + 6*. What does the *+ 6* do?', opts: ['Adds 6 riyals to every order', 'Adds 6 riyals to every cup', 'Makes each cup cost 6 riyals', 'Multiplies the price by 6'], ans: 0,
          no: [null, 'The + 6 is outside f(x), so it is added once to the whole order, not to each cup.', 'Each cup still costs 4. The 6 is the fee.', 'There is no multiplying here. It is + 6.'], why: 'The fee is added once to every order, whatever the number of cups.' },
        { k: 'fill', q: 'Fill in the delivery prices. *g(x) = f(x) + 6*.', head: ['Cups x', 'Counter f(x)', 'Delivery g(x)'], rows: [[0, 0, { a: 6 }], [1, 4, { a: 10 }], [2, 8, { a: 14 }], [3, 12, { a: 18 }], [4, 16, { a: 22 }]],
          hint: 'Take the counter price and add 6.', why: 'Every delivery price is 6 more than the counter price.' },
        { k: 'choice', q: 'Here are both prices on a graph (g is dashed). How do the lines compare?', fig: { range: [0, 5], yrange: [0, 26], ystep: 2, lines: [{ m: 4, b: 0, lab: 'f' }, { m: 4, b: 6, dash: true, lab: 'g' }], x: 'cups', y: 'riyals' },
          opts: ['Parallel: g is 6 higher everywhere', 'g is steeper than f', 'They cross at 6 cups', 'g is 6 to the right of f'], ans: 0,
          no: [null, 'Same price per cup, same slope. Look: the lines never get closer.', 'Parallel lines never cross.', 'The fee moves the line up, not sideways.'], why: 'Same slope (4 riyals a cup), and g starts 6 higher: (0, 6) instead of (0, 0).' },
        { k: 'solve', q: 'Find the delivery price for 3 cups: *g(3)*, where *g(x) = f(x) + 6* and *f(x) = 4x*.', start: 'g(3) = f(3) + 6',
          moves: [
            { q: 'What first?', opts: ['Find f(3) = 4(3)', 'Add 3 + 6', 'Multiply 4 × 6'], ans: 0, res: ['g(3) = 12 + 6', 'g(3) = 7 + 6', 'g(3) = 4 + 6'], rans: 0,
              hint: 'Find the counter price for 3 cups first.', no: { 1: 'The 3 is the number of cups. Put it into f first.', 2: 'The 6 is a fee, added once. Find f(3) first.', r1: '4(3) means 4 times 3.', r2: '4(3) means 4 times 3, not 4.' } },
            { q: 'Last move?', opts: ['Add 12 + 6', 'Multiply 12 × 6'], ans: 0, res: ['g(3) = 18', 'g(3) = 16'], rans: 0,
              hint: 'The fee is added.', no: { 1: 'It says + 6: add the fee, do not multiply.', r1: 'Check: 12 + 6.' }, why: '3 cups delivered cost 18 riyals: 6 more than the 12 at the counter.' }
          ] }
      ] },
    { name: 'Write the new rule', learn: ['Put *brackets* around the rule for f(x), then add or subtract k.', 'Then combine the numbers: *g(x) = mx + (b + k)*. Only b changes.'],
      tasks: [
        { k: 'solve', q: '*f(x) = 2x + 1* and *g(x) = f(x) − 4*. Write g(x) as mx + b, then describe the shift.', start: 'g(x) = f(x) − 4',
          moves: [
            { q: 'What first?', opts: ['Replace f(x) with its rule', 'Subtract 4 from the slope', 'Replace x with −4'], ans: 0, res: ['g(x) = (2x + 1) − 4', 'g(x) = 2(x − 4) + 1', 'g(x) = (2x + 1) + 4'], rans: 0,
              hint: 'f(x) is a name for 2x + 1. Swap the name for the rule, in brackets.', no: { 1: 'A shift never changes the slope. Only the outputs move.', 2: 'x stays x. The − 4 is done to the output.', r1: 'That takes 4 from x. The − 4 is outside f, after it.', r2: 'Keep the sign: it is − 4.' } },
            { q: 'Next move?', opts: ['Combine the numbers: 1 − 4', 'Multiply 2x by −4', 'Subtract 4 from 2x'], ans: 0, res: ['g(x) = 2x − 3', 'g(x) = 2x + 5', 'g(x) = 2x + 3'], rans: 0,
              hint: 'Only the plain numbers combine: 1 and − 4.', no: { 1: 'Nothing is multiplied. The 4 is subtracted.', 2: '2x and 4 are not like terms. Combine 1 and − 4.', r1: '1 − 4 is negative.', r2: '1 − 4: start at 1 and go down 4.' } },
            { q: 'Describe the shift.', opts: ['Compare slope and intercept', 'Compare only the x values'], ans: 0, res: ['Slope 2 (same), down 4', 'Slope 2 (same), up 4', 'Slope −3, down 4'], rans: 0,
              hint: 'Slope: 2 and 2. Intercept: 1 and −3.', no: { 1: 'The x values do not change. Look at the rules.', r1: 'The intercept went from 1 to −3. That is down.', r2: 'The slope is the number with x: still 2.' }, why: 'Same slope, intercept 1 → −3: the graph moves down 4.' }
          ] },
        { k: 'solve', q: '*f(x) = 3x − 2* and *g(x) = f(x) + 6*. Write g(x) as mx + b.', start: 'g(x) = f(x) + 6',
          moves: [
            { q: 'What first?', opts: ['Replace f(x) with (3x − 2)', 'Add 6 to the 3', 'Replace x with 6'], ans: 0, res: ['g(x) = (3x − 2) + 6', 'g(x) = 3(x + 6) − 2', 'g(x) = (3x − 2) − 6'], rans: 0,
              hint: 'Brackets around f\'s rule, then + 6.', no: { 1: 'Adding to the slope would make the line steeper. A shift keeps the slope.', 2: 'x stays x.', r1: 'The + 6 goes outside, after f(x).', r2: 'Keep the sign: + 6.' } },
            { q: 'Next move?', opts: ['Combine the numbers: −2 + 6', 'Add 6 to 3x'], ans: 0, res: ['g(x) = 3x + 4', 'g(x) = 3x − 8', 'g(x) = 3x + 8'], rans: 0,
              hint: '−2 + 6: start at −2 and go up 6.', no: { 1: '3x and 6 are not like terms.', r1: 'That is −2 − 6. We are adding 6.', r2: '−2 + 6 is 4, not 8.' }, why: 'g(x) = 3x + 4: same slope, intercept −2 → 4, up 6.' }
          ] },
        { k: 'solve', q: '*f(x) = −x + 5* and *g(x) = f(x) − 7*. Write g(x) as mx + b.', start: 'g(x) = f(x) − 7',
          moves: [
            { q: 'What first?', opts: ['Replace f(x) with (−x + 5)', 'Replace x with −7'], ans: 0, res: ['g(x) = (−x + 5) − 7', 'g(x) = (−x + 5) + 7', 'g(x) = −(x − 7) + 5'], rans: 0,
              hint: 'Brackets around the rule for f, then − 7.', no: { 1: 'x stays x. Take 7 from the output.', r1: 'Keep the sign: − 7.', r2: 'That changes x. The − 7 is outside f.' } },
            { q: 'Next move?', opts: ['Combine the numbers: 5 − 7', 'Combine −x and −7'], ans: 0, res: ['g(x) = −x − 2', 'g(x) = −x + 2', 'g(x) = −x − 12'], rans: 0,
              hint: '5 − 7: start at 5 and go down 7.', no: { 1: '−x and −7 are not like terms.', r1: '5 − 7 goes below zero.', r2: 'That is −5 − 7. The 5 is positive.' }, why: 'Same slope −1, intercept 5 → −2: down 7.' }
          ] },
        { k: 'choice', q: '*f(x) = 5x + 2*. Which rule is f moved *down 3*?', opts: ['g(x) = 5x − 1', 'g(x) = 5x + 5', 'g(x) = 2x + 2', 'g(x) = 5x − 3'], ans: 0,
          no: [null, '5x + 5 is 3 higher: that is up 3.', 'The slope changed. A shift keeps the slope.', 'b went from 2 to −3: that is down 5.'], why: '2 − 3 = −1, so g(x) = 5x − 1.' }
      ] },
    { name: 'Find k', learn: ['*k = g(x) − f(x)* for the same x.', 'If k is the same for every x, g is a shift of f.'],
      tasks: [
        { k: 'number', q: 'The table shows f and g. Find k in *g(x) = f(x) + k*.', tab: { head: ['x', '0', '1', '2', '3'], rows: [['f(x)', 4, 7, 10, 13], ['g(x)', 1, 4, 7, 10]] }, ans: -3,
          hint: 'Take one column: g − f. 1 − 4 = ?', why: 'k = −3: every g output is 3 less, so g is f moved down 3.' },
        { k: 'solve', q: 'The graph shows f and g (dashed). Find k in *g(x) = f(x) + k*.', fig: { range: [-2, 5], yrange: [-1, 11], lines: [{ m: 1, b: 2, lab: 'f' }, { m: 1, b: 7, dash: true, lab: 'g' }], pts: [[0, 2], [0, 7]], x: 'x', y: 'y' }, start: 'k = g(0) − f(0)',
          moves: [
            { q: 'What first?', opts: ['Read both y-intercepts', 'Read both slopes'], ans: 0, res: ['k = 7 − 2', 'k = 2 − 7', 'k = 1 − 1'], rans: 0,
              hint: 'g(0) and f(0) are where the lines cross the y-axis.', no: { 1: 'The slopes are the same. k is the gap between the lines.', r1: 'k = g − f: g first.', r2: 'Those are the slopes. We need the y-intercepts.' } },
            { q: 'Next move?', opts: ['Subtract 7 − 2', 'Add 7 + 2'], ans: 0, res: ['k = 5', 'k = −5', 'k = 9'], rans: 0,
              hint: 'k is the difference: subtract.', no: { 1: 'k is the gap between the lines: subtract.', r1: 'g is higher, so k is positive.' }, why: 'g(x) = f(x) + 5: g is 5 higher at every x.' }
          ] },
        { k: 'pair', q: 'The point *(3, 7)* is on the graph of f. *g(x) = f(x) − 5*. Where does this point move on the graph of g?', ans: [3, 2],
          hint: 'The input stays the same. The output goes down 5.', why: '(3, 7) moves down 5 to (3, 2).' },
        { k: 'choice', q: 'Delivery price *g(x) = 4x + 6*. On *free delivery day* there is no fee. Which rule is the new price?', opts: ['h(x) = g(x) − 6', 'h(x) = g(x) + 6', 'h(x) = 6 · g(x)', 'h(x) = g(x − 6)'], ans: 0,
          no: [null, 'That adds another 6. The fee goes away.', 'Multiplying changes the price per cup.', 'Changing x moves the graph sideways.'], why: 'Take the 6 riyal fee off every order: h(x) = g(x) − 6 = 4x.' }
      ] },
    { name: 'Graph the shift', learn: ['Start at the new y-intercept: *(0, b + k)*.', 'Use the *same slope* as f for the second point.'],
      tasks: [
        { k: 'plane', q: '*f(x) = x + 1*. Graph *g(x) = f(x) + 2*: tap two points on it.', range: [-5, 5], m: 1, b: 3, op: '=', parts: ['line'],
          hint: 'g(x) = x + 3. Start at (0, 3), then up 1, right 1.', why: 'g(x) = x + 3: f moved up 2. (0, 3) and (1, 4) are on it.' },
        { k: 'plane', q: '*f(x) = −2x + 3*. Graph *g(x) = f(x) − 4*.', range: [-5, 5], m: -2, b: -1, op: '=', parts: ['line'],
          hint: 'g(x) = −2x − 1. Start at (0, −1), then down 2, right 1.', why: 'g(x) = −2x − 1: same slope, intercept 3 → −1.' },
        { k: 'match', q: 'Match each change to the delivery price f(x) with its new rule.', pairs: [['The fee rises by 3 riyals', 'g(x) = f(x) + 3'], ['Free delivery: no 5 riyal fee', 'g(x) = f(x) − 5'], ['A 2 riyal coupon on each order', 'g(x) = f(x) − 2'], ['A 1 riyal tip on every order', 'g(x) = f(x) + 1']] },
        { k: 'match', q: 'All three lines are shifts of *y = 2x*. Match each rule to its graph.', range: [-5, 5],
          pairs: [['y = 2x', { plane: { range: [-5, 5], m: 2, b: 0 } }], ['y = 2x + 3', { plane: { range: [-5, 5], m: 2, b: 3 } }], ['y = 2x − 2', { plane: { range: [-5, 5], m: 2, b: -2 } }]],
          why: 'Same slope, so look only at where each line crosses the y-axis: 0, 3 and −2.' }
      ] },
    { name: 'The lunch rush boss', boss: true, learn: ['Mixed questions, fewer hints. Brackets first, then combine. Up for +, down for −.'],
      tasks: [
        { k: 'solve', q: '*f(x) = ½x + 4* and *g(x) = f(x) − 6*. Write g(x) as mx + b.', start: 'g(x) = f(x) − 6',
          moves: [
            { q: 'What first?', opts: ['Replace f(x) with (½x + 4)', 'Replace x with −6', 'Take 6 from ½'], ans: 0, res: ['g(x) = (½x + 4) − 6', 'g(x) = ½(x − 6) + 4', 'g(x) = (½x + 4) + 6'], rans: 0 },
            { q: 'Next move?', opts: ['Combine 4 − 6', 'Combine ½x − 6'], ans: 0, res: ['g(x) = ½x − 2', 'g(x) = ½x + 2', 'g(x) = ½x − 10'], rans: 0, why: 'Same slope ½, intercept 4 → −2: down 6.' }
          ] },
        { k: 'number', q: '*f(10) = 45*. *g(x) = f(x) − 8*. Find *g(10)*.', ans: 37, why: 'g(10) = f(10) − 8 = 45 − 8 = 37.' },
        { k: 'choice', q: 'Gus says: "*g(x) = f(x) + 3* moves the graph 3 to the right." Is he right?', opts: ['No: it moves the graph up 3', 'Yes: + means right', 'No: it moves it left 3', 'No: it makes it 3 times steeper'], ans: 0,
          no: [null, 'The + 3 is added to the output (y), so it moves up.', 'Not sideways at all. The + 3 changes the output.', 'Adding does not change the slope.'], why: 'Every output gets 3 more, so every point moves up 3.' },
        { k: 'sort', q: 'Sort each rule: does it move the graph of f *up*, *down*, or is it *not* an up/down shift?', bins: ['⬆ Up', '⬇ Down', 'Not a shift'],
          cards: [{ t: 'g(x) = f(x) + 7', b: 0 }, { t: 'g(x) = f(x) − 2', b: 1 }, { t: 'g(x) = 3 · f(x)', b: 2, why: 'Multiplying changes the steepness. That is not a shift.' },
            { t: 'g(x) = f(x) + 0.5', b: 0 }, { t: 'g(x) = f(x) − 10', b: 1 }, { t: 'g(x) = −f(x)', b: 2, why: 'A minus in front flips the graph. It does not shift it.' }] },
        { k: 'fill', q: '*f(x) = 3x + 1* and *g(x) = f(x) − 4*. Fill in the table.', head: ['x', 'f(x)', 'g(x)'], rows: [[0, { a: 1 }, { a: -3 }], [1, { a: 4 }, { a: 0 }], [2, { a: 7 }, { a: 3 }], [3, { a: 10 }, { a: 6 }]],
          hint: 'Work out f(x) = 3x + 1 first, then take 4 away.', why: 'Each g value is 4 less than f: g(x) = 3x − 3.' }
      ] }
  ]
});
