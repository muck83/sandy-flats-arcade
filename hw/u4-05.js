/* Homework: Unit 4 Lesson 5, Solve by Graphing. */
SFA_HW({
  id: 'g65', unit: 4, lesson: 5, topic: 'Solve by graphing', title: 'Arcade Card Showdown', who: 'one',
  intro: ['The arcade sells two ways to play. *Plan A*: buy a 20 SAR arcade card, then each game costs 2 SAR. *Plan B*: no card, each game costs 4 SAR.',
    'One wants the cheaper plan, but it depends on how many games you play. Graph the lines, find where they cross, and check it.'],
  goal: 'Graph two lines, read where they cross, and check that point in both equations.',
  bigIdea: 'To solve a system by graphing, graph both lines: the crossing point is the solution. Always check it, because a graph can only estimate.',
  levels: [
    { name: 'Draw one line', learn: ['*y = mx + b*: start at b on the y-axis, then use the slope m (up over across).', '*Ax + By = C*: find the two intercepts. Put x = 0, then put y = 0.'],
      tasks: [
        { k: 'plane', q: 'Graph *y = x + 2*: tap two points on it.', range: [-6, 6], m: 1, b: 2, op: '=', parts: ['line'], hint: 'Start at (0, 2). Then up 1, right 1: (1, 3).' },
        { k: 'solve', q: 'Find both intercepts of *x + 2y = 8*.', start: 'x + 2y = 8',
          moves: [
            { q: 'Find the y-intercept.', opts: ['Put y = 0', 'Put x = 0'], ans: 1, res: ['2y = 8, so (0, 8)', '2y = 8, so (0, 4)'], rans: 1,
              hint: 'On the y-axis, x is 0.', no: { 0: 'The y-intercept is on the y-axis, where x = 0.', r0: 'Divide by 2: y = 4.' } },
            { q: 'Find the x-intercept.', opts: ['Put y = 0', 'Put x = 0 again'], ans: 0, res: ['x = 8, so (8, 0)', 'x = 8, so (0, 8)'], rans: 0,
              hint: 'On the x-axis, y is 0.', no: { 1: 'That gives the y-intercept again. Put y = 0.', r1: 'The x-intercept is on the x-axis: (8, 0).' }, why: 'Plot (0, 4) and (8, 0) and join them.' }
          ] },
        { k: 'plane', q: 'Graph *2x + 3y = 6*. (Hint: find the intercepts first.)', range: [-6, 6], m: -2 / 3, b: 2, op: '=', parts: ['line'], hint: 'x = 0 gives y = 2. y = 0 gives x = 3. Plot (0, 2) and (3, 0).' },
        { k: 'choice', q: 'Where does *3x + y = 6* cross the y-axis?', opts: ['(6, 0)', '(0, 6)', '(0, 3)', '(2, 0)'], ans: 1,
          no: ['On the y-axis, x is 0, not y.', null, 'Put x = 0: y = 6.', '(2, 0) is the x-intercept.'], why: 'x = 0 gives y = 6.' }
      ] },
    { name: 'Read the crossing', learn: ['The *solution* is where the two lines *cross*.', 'Then *check* it: it must make both equations true.'],
      tasks: [
        { k: 'pair', q: 'The lines are *y = x − 1* and *y = −2x + 8*. Where do they cross?', fig: { range: [-1, 7], lines: [{ m: 1, b: -1, lab: 'y = x − 1', labAt: 4.2 }, { m: -2, b: 8, lab: 'y = −2x + 8', labAt: 0.6 }], x: 'x', y: 'y' },
          ans: [3, 2], hint: 'Find where the lines meet. Read across, then up.', why: 'They cross at (3, 2).' },
        { k: 'solve', q: 'Check *(3, 2)* in both equations: *y = x − 1* and *y = −2x + 8*.', start: 'Check (3, 2)',
          moves: [
            { q: 'Check line 1: y = x − 1.', opts: ['Work out 3 − 1', 'Work out 2 − 1'], ans: 0, res: ['2 = 2 ✓', '2 = 1 ✗'], rans: 0,
              hint: 'Put in x = 3. Is the answer y = 2?', no: { 1: 'x = 3, not 2. x comes first.' } },
            { q: 'Check line 2: y = −2x + 8.', opts: ['Work out −2 + 3 + 8', 'Work out −2(3) + 8'], ans: 1, res: ['6 + 8 = 14 ✗', '−6 + 8 = 2 ✓'], rans: 1,
              hint: '−2x means −2 times x.', no: { 0: '−2x is −2 times x: −2(3).', r0: '−2 × 3 = −6, not 6.' } },
            { q: 'Decide.', opts: ['Both true: (3, 2) is it', 'Only one: try again'], ans: 0, res: ['Solution: (3, 2)', 'No solution'], rans: 0,
              hint: 'You got ✓ ✓.', why: 'The point makes both equations true, so the graph was right.' }
          ] },
        { k: 'pair', q: 'The lines are *x + 2y = 8* and *y = x + 1*. Where do they cross?', fig: { range: [-1, 8], lines: [{ m: -0.5, b: 4, lab: 'x + 2y = 8', labAt: 5 }, { m: 1, b: 1, lab: 'y = x + 1', labAt: 4.5 }], x: 'x', y: 'y' },
          ans: [2, 3], hint: 'Read the crossing point.', why: 'Check: 2 + 2(3) = 8 ✓ and 3 = 2 + 1 ✓' }
      ] },
    { name: 'Graph both', learn: ['Graph line 1. Graph line 2. Read the crossing. Check it.', 'Standard form? Get y alone first, or use the intercepts.'],
      tasks: [
        { k: 'plane', q: 'Line 1: graph *y = −x + 4*.', range: [-6, 6], m: -1, b: 4, op: '=', parts: ['line'], hint: 'Start at (0, 4). Down 1, right 1.' },
        { k: 'plane', q: 'Line 2: graph *y = 2x − 2*.', range: [-6, 6], m: 2, b: -2, op: '=', parts: ['line'], hint: 'Start at (0, −2). Up 2, right 1.' },
        { k: 'pair', q: 'You graphed *y = −x + 4* and *y = 2x − 2*. Where do they cross?', ans: [2, 2], hint: 'Try x = 2 in both: −2 + 4 and 2(2) − 2.', why: 'Both give y = 2 when x = 2: (2, 2).' },
        { k: 'solve', q: 'Get y alone so you can graph *2x + y = 5*.', start: '2x + y = 5',
          moves: [
            { q: 'First move?', opts: ['Add 2x to both sides', 'Subtract 2x from both sides'], ans: 1, res: ['y = 2x + 5', 'y = −2x + 5', 'y = 5 − x'], rans: 1,
              hint: 'Remove the 2x from the left. It is + 2x, so subtract.', no: { 0: 'Adding gives 4x. Subtract 2x.', r0: 'Subtracting 2x makes it −2x on the right.', r2: 'Subtract all of 2x, not x.' } },
            { q: 'Read the graph plan.', opts: ['Start at b, then use m', 'Start at m, then use b'], ans: 0, res: ['Start at (0, 5), down 2, right 1', 'Start at (0, −2), up 5, right 1'], rans: 0,
              hint: 'b is where it crosses the y-axis.', no: { 1: 'b is the start, m is the slope.' }, why: 'm = −2 and b = 5.' }
          ] },
        { k: 'match', q: 'Match each equation to its graph.', range: [-5, 5],
          pairs: [['y = x + 2', { plane: { range: [-5, 5], m: 1, b: 2 } }], ['y = −2x + 1', { plane: { range: [-5, 5], m: -2, b: 1 } }], ['x + y = −3', { plane: { range: [-5, 5], m: -1, b: -3 } }], ['y = ½x − 1', { plane: { range: [-5, 5], m: 0.5, b: -1 } }]] }
      ] },
    { name: 'Break-even', learn: ['x = games, y = cost. *Plan A: y = 2x + 20*. *Plan B: y = 4x*.', 'The *break-even point* is where both plans cost the same.'],
      tasks: [
        { k: 'fill', q: 'Fill in the cost of each plan.', head: ['Games x', 'Plan A (SAR)', 'Plan B (SAR)'], rows: [[0, { a: 20 }, { a: 0 }], [5, { a: 30 }, { a: 20 }], [10, { a: 40 }, { a: 40 }], [15, { a: 50 }, { a: 60 }]],
          hint: 'Plan A: 2 times games, plus 20. Plan B: 4 times games.', why: 'At 10 games both cost 40 SAR.' },
        { k: 'pair', q: 'Where do the two plans cross? Type the break-even point.', fig: { range: [0, 15], yrange: [0, 60], step: 5, ystep: 10, lines: [{ m: 2, b: 20, lab: 'A', labAt: 2 }, { m: 4, b: 0, lab: 'B', labAt: 13 }], x: 'games', y: 'SAR' },
          ans: [10, 40], hint: 'Find where the lines meet. Then check it in both rules.', why: 'Check: 2(10) + 20 = 40 ✓ and 4(10) = 40 ✓' },
        { k: 'solve', q: 'Check the break-even point *(10, 40)* in both plans.', start: 'Check (10, 40)',
          moves: [
            { q: 'Plan A: y = 2x + 20.', opts: ['Work out 2(10) + 20', 'Work out 2(40) + 20'], ans: 0, res: ['20 + 20 = 40 ✓', '2(30) = 60 ✗'], rans: 0,
              hint: 'x = 10 games.', no: { 1: '40 is the cost y. Put in x = 10.', r1: 'Multiply first: 2 × 10 = 20, then add 20.' } },
            { q: 'Plan B: y = 4x.', opts: ['Work out 4 + 10', 'Work out 4(10)'], ans: 1, res: ['14 ✗', '40 ✓'], rans: 1,
              hint: '4x means 4 times x.', no: { 0: '4x means 4 times x.' } },
            { q: 'What does it mean?', opts: ['Both plans cost 40 SAR for 10 games', 'Plan A is always cheaper'], ans: 0, res: ['Break-even at 10 games', 'No break-even'], rans: 0,
              hint: 'Same games, same cost.', why: 'Below 10 games Plan B is cheaper. Above 10 games Plan A is cheaper.' }
          ] },
        { k: 'choice', q: 'One plays *6 games*. Which plan is cheaper?', opts: ['Plan A: 32 SAR', 'Plan B: 24 SAR', 'They cost the same'], ans: 1,
          no: ['Plan A is 32 SAR, but work out Plan B: 4 × 6.', null, 'They are only the same at 10 games.'], why: 'A: 2(6) + 20 = 32. B: 4(6) = 24. Plan B wins below 10 games.' }
      ] },
    { name: 'The jackpot boss', boss: true, learn: ['Graph, read, check. If the crossing is between grid lines, the graph only *estimates*.'],
      tasks: [
        { k: 'solve', q: 'Solve *y = x + 1* and *y = −x + 5* by graphing, one move at a time.', start: 'y = x + 1 and y = −x + 5',
          moves: [
            { q: 'Graph line 1: y = x + 1.', opts: ['Start at (1, 0), up 1 right 1', 'Start at (0, 1), up 1 right 1'], ans: 1, res: ['(0, 1), (1, 2), (2, 3)', '(1, 0), (2, 1), (3, 2)'], rans: 0, hint: 'b = 1 is on the y-axis.' },
            { q: 'Graph line 2: y = −x + 5.', opts: ['Start at (0, 5), down 1 right 1', 'Start at (0, 5), up 1 right 1'], ans: 0, res: ['(0, 5), (1, 6), (2, 7)', '(0, 5), (1, 4), (2, 3)'], rans: 1, hint: 'Slope −1 goes down.' },
            { q: 'Read the crossing.', opts: ['Find a point on both lists', 'Use the y-intercepts'], ans: 0, res: ['(2, 3)', '(0, 1) and (0, 5)'], rans: 0 },
            { q: 'Check it.', opts: ['Check in one equation', 'Check in both equations'], ans: 1, res: ['3 = 2 + 1 ✓ and 3 = −2 + 5 ✓', '3 = 2 + 1 ✓ only'], rans: 0, why: 'The solution is (2, 3).' }
          ] },
        { k: 'plane', q: 'Graph *3x + y = 6*.', range: [-5, 7], m: -3, b: 6, op: '=', parts: ['line'], hint: 'y = −3x + 6. Or use (0, 6) and (2, 0).' },
        { k: 'pair', q: 'Where do *y = 3x − 3* and *y = −x + 5* cross?', fig: { range: [-1, 6], yrange: [-4, 8], lines: [{ m: 3, b: -3 }, { m: -1, b: 5 }], x: 'x', y: 'y' },
          ans: [2, 3], hint: 'Read it, then check it in both equations.', why: '3(2) − 3 = 3 ✓ and −2 + 5 = 3 ✓' },
        { k: 'choice', q: 'The lines *y = x* and *y = −x + 3* cross here. Why can you not read the answer exactly?', fig: { range: [-1, 4], lines: [{ m: 1, b: 0 }, { m: -1, b: 3 }], x: 'x', y: 'y' },
          opts: ['They do not cross', 'The crossing is between grid lines', 'They are the same line'], ans: 1,
          no: ['Look again: they cross once.', null, 'One goes up, one goes down.'], why: 'They cross at (1.5, 1.5). A graph only estimates; algebra gives the exact answer.' }
      ] }
  ]
});
