/* Homework: Unit 3 Lesson 6, Linear or Not? */
SFA_HW({
  id: 'g36',
  unit: 3,
  lesson: 6,
  topic: 'Linear and non-linear functions',
  title: 'Sand Square Science',
  who: 'gus',
  intro: ['Gus is building square sand stages for the beach concert. Each stage needs a rope around the edge and sand on top. Bigger stages need more of both, but do they grow in the same way?', 'Then a rumour about a secret concert guest spreads along the beach, faster and faster. Help Gus test each pattern: is it *linear* or *not*?'],
  goal: 'Test a table, graph or equation to decide if a function is linear, and write the rule when it is.',
  bigIdea: 'A linear function changes by the same amount for each equal step: its graph is a straight line, y = mx + b.',
  levels: [
    { name: 'Equal steps', learn: ['*Linear* means a constant rate of change.', 'In a table: equal x steps give *equal* y changes. These are the *first differences*.', 'Check the x steps are equal first.'],
      tasks: [
        { k: 'solve', q: 'Is this table linear? *x: 0, 1, 2, 3* and *y: 3, 5, 7, 9*', tab: { head: ['x', '0', '1', '2', '3'], rows: [['y', 3, 5, 7, 9]] }, start: 'y: 3, 5, 7, 9',
          moves: [
            { q: 'First move?', opts: ['Add up the y-values', 'Check the x steps'], ans: 1, res: ['x goes up by 3 each time', 'x goes up by 1 each time', 'x goes up by 2 each time'], rans: 1, hint: 'Look at the top row: 0, 1, 2, 3.', no: { '0': 'The total does not help. Look at the steps.', r0: '0 to 1 is a step of 1.', r2: '0 to 1 is a step of 1.' } },
            { q: 'Next move?', opts: ['Find each change in y', 'Find the biggest y'], ans: 0, res: ['+3, +5, +7', '+2, +2, +2', '+2, +3, +4'], rans: 1, hint: '5 − 3, then 7 − 5, then 9 − 7.', no: { r0: 'Those are some y-values. Subtract next minus last.', r2: '7 − 5 = 2 and 9 − 7 = 2.' } },
            { q: 'Decide.', opts: ['Compare the changes', 'Look at the first y'], ans: 0, res: ['Not equal: non-linear', 'All equal: linear'], rans: 1, hint: 'Are the changes all the same?', no: { r0: '+2 each time: they are all equal.' }, why: 'Equal steps of x give +2 each time: a constant rate, so it is linear.' }
          ] },
        { k: 'choice', q: 'Is this table linear?', tab: { head: ['x', '0', '1', '2', '3'], rows: [['y', 10, 7, 4, 1]] }, opts: ['Yes: y changes by −3 each time', 'No: y goes down', 'No: the numbers get small'], ans: 0, no: [null, 'Going down is fine if it goes down by the same amount.', 'Size does not matter. Look at the changes.'], why: '−3, −3, −3: a constant rate. Linear lines can go downhill.' },
        { k: 'choice', q: 'A function\'s graph is a *straight line*. Is it linear?', opts: ['Only if it goes uphill', 'Only if it goes through (0, 0)', 'Yes: a straight line means linear'], ans: 2, no: ['Downhill lines are linear too.', 'y = 2x + 3 is linear and misses (0, 0).', null], why: 'Straight line, constant rate of change: linear.' }
      ] },
    { name: 'Square stages', learn: ['A square stage with side *s*: rope around it *P = 4s*, sand on top *A = s²*.', 'Make a table, then find the changes.'],
      tasks: [
        { k: 'fill', q: 'Fill in the rope and the sand for each stage.', head: ['side s (m)', 'rope P = 4s', 'sand A = s²'], rows: [[1, { a: 4 }, { a: 1 }], [2, { a: 8 }, { a: 4 }], [3, { a: 12 }, { a: 9 }], [4, { a: 16 }, { a: 16 }], [5, { a: 20 }, { a: 25 }]], hint: 'P: times s by 4. A: s times s. For s = 3: 4 × 3 and 3 × 3.', why: 'Rope goes 4, 8, 12, 16, 20. Sand goes 1, 4, 9, 16, 25.' },
        { k: 'solve', q: 'Is the sand *A = s²* linear? Use the table: *1, 4, 9, 16* for s = 1, 2, 3, 4.', start: 'A: 1, 4, 9, 16 (s up by 1)',
          moves: [
            { q: 'First move?', opts: ['Find each change in s', 'Find each change in A'], ans: 1, res: ['+4, +4, +4', '+3, +3, +3', '+3, +5, +7'], rans: 2, hint: '4 − 1, then 9 − 4, then 16 − 9.', no: { '0': 's goes up by 1 each time. Now check A.', r0: '+4 each time is the rope P, not the sand.', r1: '9 − 4 = 5, not 3.' } },
            { q: 'Decide.', opts: ['Compare the changes', 'Look at the last value'], ans: 0, res: ['All equal: linear', 'Not equal: non-linear'], rans: 1, hint: 'Are 3, 5 and 7 the same?', no: { r0: '3, 5 and 7 are different.' }, why: 'The changes grow (3, 5, 7…), so the sand grows faster and faster: not linear.' }
          ] },
        { k: 'choice', q: 'Which graph is the sand *A = s²*?', figs: [{ cap: 'A', range: [0, 5], yrange: [0, 25], ystep: 5, lines: [{ m: 4, b: 0, from: 0, to: 5 }], x: 's', y: 'm' }, { cap: 'B', range: [0, 5], yrange: [0, 25], ystep: 5, paths: [{ p: [[0, 0], [0.5, 0.25], [1, 1], [1.5, 2.25], [2, 4], [2.5, 6.25], [3, 9], [3.5, 12.25], [4, 16], [4.5, 20.25], [5, 25]] }], x: 's', y: 'm²' }], opts: ['B: it bends', 'A: it is straight'], ans: 0, no: [null, 'The straight one is the rope, P = 4s. It goes up 4 each time.'], why: 'Non-linear changes make a curve. Sand: 1, 4, 9, 16, 25.' },
        { k: 'number', q: 'Look at your table. For which side length do the rope *P* and the sand *A* have the same number?', ans: 4, unit: 'm', hint: 'Find the row where both columns match.', why: 's = 4: P = 16 and A = 16.' }
      ] },
    { name: 'Write the rule', learn: ['Rate *m* = change in y ÷ change in x.', 'Start *b* = y when x = 0.', 'Then write *y = mx + b*.'],
      tasks: [
        { k: 'solve', q: 'Write the rule for this linear table.', tab: { head: ['x', '0', '1', '2', '3'], rows: [['y', 3, 5, 7, 9]] }, start: 'x: 0, 1, 2, 3 · y: 3, 5, 7, 9',
          moves: [
            { q: 'First move?', opts: ['Find the first y', 'Find the change in y each step'], ans: 1, res: ['+2 each step', '+3 each step', '+1 each step'], rans: 0, hint: '5 − 3 = ?', no: { '0': 'Start with the rate: the change.', r1: '3 is the start, not the change.', r2: '1 is the x step. y changes by 2.' } },
            { q: 'Next move?', opts: ['Divide by the x step to get m', 'Add the x step'], ans: 0, res: ['m = 2 ÷ 1 = 2', 'm = 1 ÷ 2 = ½', 'm = 2 + 1 = 3'], rans: 0, hint: 'Change in y ÷ change in x.', no: { '1': 'Rate = change in y ÷ change in x.', r1: 'Upside down. y change on top.', r2: 'Divide, do not add.' } },
            { q: 'Next move?', opts: ['Find b: y when x = 1', 'Find b: y when x = 0'], ans: 1, res: ['b = 0', 'b = 5', 'b = 3'], rans: 2, hint: 'Find x = 0 in the table.', no: { '0': 'b is the start: x = 0.', r0: 'Read the table: at x = 0, y = 3.', r1: '5 is y when x = 1.' } },
            { q: 'Last move?', opts: ['Write y = mx + b', 'Write y = bx + m'], ans: 0, res: ['y = 3x + 2', 'y = 2x + 3', 'y = 2x'], rans: 1, hint: 'm goes with x, then add b.', no: { '1': 'The rate goes with x.', r0: 'Swapped: the rate (2) goes with x.', r2: 'Do not forget the start, + 3.' }, why: 'Check: x = 3 gives 2(3) + 3 = 9. ✓' }
          ] },
        { k: 'solve', q: 'Careful: x jumps by 2 here. Write the rule.', tab: { head: ['x', '0', '2', '4', '6'], rows: [['y', 1, 4, 7, 10]] }, start: 'x: 0, 2, 4, 6 · y: 1, 4, 7, 10',
          moves: [
            { q: 'First move?', opts: ['Find the change in y each step', 'Find the change in x only'], ans: 0, res: ['+3 each step', '+4 each step', '+2 each step'], rans: 0, hint: '4 − 1 = ?', no: { r1: '4 − 1 = 3.', r2: '+2 is the x step. y goes 1 to 4.' } },
            { q: 'Next move?', opts: ['Divide by the x step (2)', 'Keep m = 3'], ans: 0, res: ['m = 2 ÷ 3', 'm = 3 ÷ 2 = 1.5', 'm = 3 × 2 = 6'], rans: 1, hint: 'Each step is 2 in x, so divide by 2.', no: { '1': 'The x step is 2, not 1. Divide by 2.', r0: 'Upside down: y change on top.', r2: 'Divide, do not multiply.' } },
            { q: 'Next move?', opts: ['Find b: y when x = 2', 'Find b: y when x = 0'], ans: 1, res: ['b = 0', 'b = 4', 'b = 1'], rans: 2, hint: 'Read y at x = 0.' },
            { q: 'Last move?', opts: ['Write y = b + x', 'Write y = mx + b'], ans: 1, res: ['y = 1.5x + 1', 'y = x + 1.5', 'y = 3x + 1'], rans: 0, hint: 'm = 1.5, b = 1.', no: { r1: 'Swapped: 1.5 goes with x.', r2: 'm is 1.5, because x steps by 2.' }, why: 'Check: x = 4 gives 1.5(4) + 1 = 7. ✓' }
          ] },
        { k: 'choice', q: 'Which equation is *linear*?', opts: ['y = x³ + 1', 'y = 4x − 1', 'y = 2ˣ', 'y = x²'], ans: 1, no: ['x³ makes a curve.', null, '2ˣ doubles: 1, 2, 4, 8…', 'x² makes a curve: 1, 4, 9, 16…'], why: 'y = 4x − 1 is y = mx + b with m = 4, b = −1.' },
        { k: 'number', q: 'This table is linear: *x: 0, 2, 4, 6* and *y: 20, 26, 32, 38*. What is the rate *m*?', ans: 3, hint: 'y goes up 6 when x goes up 2. 6 ÷ 2 = ?', why: 'm = 6 ÷ 2 = 3 for each 1 in x.' }
      ] },
    { name: 'The rumour', learn: ['*Doubling* is not linear: the changes keep growing.', 'Linear grows by *adding* the same amount. Doubling grows by *multiplying*.'],
      tasks: [
        { k: 'solve', q: 'Each hour, the number of people who know the rumour *doubles*: *1, 2, 4, 8, 16*. Is it linear?', start: 'people: 1, 2, 4, 8, 16',
          moves: [
            { q: 'First move?', opts: ['Find each change', 'Find the total'], ans: 0, res: ['+2, +2, +2, +2', '+1, +1, +1, +1', '+1, +2, +4, +8'], rans: 2, hint: '2 − 1, 4 − 2, 8 − 4, 16 − 8.', no: { '1': 'The total does not tell us the rate.', r0: '4 − 2 is 2, but 8 − 4 is 4.', r1: 'Subtract each pair: 4 − 2 = 2.' } },
            { q: 'Decide.', opts: ['Look at the first number', 'Compare the changes'], ans: 1, res: ['Not equal: non-linear', 'All equal: linear'], rans: 0, hint: 'Are 1, 2, 4 and 8 the same?', no: { r1: 'The changes double too: 1, 2, 4, 8.' }, why: 'The changes keep growing, so the graph curves up. Doubling is not linear.' }
          ] },
        { k: 'number', q: 'At hour 0, *1* person knows. It doubles each hour. After how many hours do *more than 1000* people know?', ans: 10, unit: 'hours', hint: 'Keep doubling: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, …', why: 'After 9 hours: 512. After 10 hours: 1024, more than 1000.' },
        { k: 'choice', q: 'Which graph shows the rumour?', figs: [{ cap: 'A', range: [0, 5], yrange: [0, 32], ystep: 8, lines: [{ m: 6, b: 1, from: 0, to: 5 }], x: 'h', y: 'people' }, { cap: 'B', range: [0, 5], yrange: [0, 32], ystep: 8, paths: [{ p: [[0, 1], [1, 2], [2, 4], [3, 8], [4, 16], [5, 32]], dots: true }], x: 'h', y: 'people' }], opts: ['A: it is straight', 'B: it curves up'], ans: 1, no: ['A straight line adds the same each hour. The rumour doubles.', null], why: '1, 2, 4, 8, 16, 32: slow at first, then very fast.' },
        { k: 'sort', q: 'Linear or non-linear?', bins: ['Linear', 'Non-linear'], cards: [{ t: 'y = 5x + 2', b: 0 }, { t: 'y = x²', b: 1 }, { t: 'x: 1, 2, 3 · y: 2, 4, 8', b: 1, why: 'Changes +2, +4: not equal.' }, { t: 'x: 0, 1, 2 · y: 7, 7, 7', b: 0, why: 'Change 0 each time: a flat line is linear.' }, { t: 'rope P = 4s', b: 0 }, { t: 'sand A = s²', b: 1 }, { t: 'it doubles every hour', b: 1 }, { t: 'taxi: 10 SAR + 3 SAR per km', b: 0, why: 'Adds 3 for each km: constant rate.' }], why: 'Same change for each equal step: linear. Changes that grow or shrink: non-linear.' }
      ] },
    { name: 'The headliner boss', boss: true, learn: ['Find the changes, decide, and write the rule if it is linear.'],
      tasks: [
        { k: 'match', q: 'Match each table to its rule.', pairs: [['x: 0, 1, 2 · y: 4, 7, 10', 'y = 3x + 4', 'Start 4, up 3 each time.'], ['x: 0, 1, 2 · y: 5, 3, 1', 'y = −2x + 5', 'Start 5, down 2 each time.'], ['x: 0, 1, 2 · y: 0, 1, 4', 'Not linear', 'Changes +1, +3: not equal.'], ['x: 0, 2, 4 · y: 2, 3, 4', 'y = ½x + 2', 'Up 1 for each 2 in x: m = ½.']] },
        { k: 'solve', q: 'Is this table linear?', tab: { head: ['x', '1', '2', '3', '4'], rows: [['y', 2, 4, 8, 16]] }, start: 'y: 2, 4, 8, 16',
          moves: [
            { q: 'First move?', opts: ['Check the x steps', 'Find the rule'], ans: 0, res: ['x goes up by 2', 'x goes up by 1'], rans: 1, hint: '1, 2, 3, 4.' },
            { q: 'Next move?', opts: ['Find each change in y', 'Divide y by x'], ans: 0, res: ['+2, +2, +2', '+2, +4, +8'], rans: 1, hint: '8 − 4 = ?' },
            { q: 'Decide.', opts: ['Guess', 'Compare the changes'], ans: 1, res: ['Not equal: non-linear', 'All equal: linear'], rans: 0, why: 'It doubles each step: non-linear.' }
          ] },
        { k: 'solve', q: 'This table is linear. Write the rule.', tab: { head: ['x', '0', '1', '2', '3'], rows: [['y', 10, 7, 4, 1]] }, start: 'x: 0, 1, 2, 3 · y: 10, 7, 4, 1',
          moves: [
            { q: 'First move?', opts: ['Find the change in y each step', 'Find the last y'], ans: 0, res: ['−1 each step', '−3 each step', '+3 each step'], rans: 1, hint: '7 − 10 = ?', no: { r2: 'y goes down, so the change is negative.' } },
            { q: 'Next move?', opts: ['Find m only', 'Find m and b'], ans: 1, res: ['m = 3, b = 10', 'm = −3, b = 1', 'm = −3, b = 10'], rans: 2, hint: 'b is y when x = 0.', no: { r1: 'b is y at x = 0, not at x = 3.' } },
            { q: 'Last move?', opts: ['Write y = b − m', 'Write y = mx + b'], ans: 1, res: ['y = 3x + 10', 'y = −3x + 10', 'y = 10x − 3'], rans: 1, hint: 'm with x.', why: 'Check: x = 2 gives −6 + 10 = 4. ✓' }
          ] },
        { k: 'choice', q: 'Priya\'s table: *x: 0, 1, 2, 3* and *y: 0, 3, 6, 10*. Is it linear?', opts: ['No: the changes are 3, 3, 4', 'Yes: it goes up each time', 'Yes: it starts at 0'], ans: 0, no: [null, 'Going up is not enough. The changes must be equal.', 'Starting at 0 does not make it linear.'], why: '10 − 6 = 4, not 3. One different change is enough.' }
      ] }
  ]
});
