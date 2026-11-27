/* Homework: Unit 4 Lesson 14, Systems of Inequalities, Revisited. */
SFA_HW({
  id: 'g74', unit: 4, lesson: 14, topic: 'Systems of inequalities, revisited', title: 'Prize Shop Zone', who: 'one',
  intro: ['One, the arcade robot, is restocking the prize shop. Plush toys cost 20 SAR and yo-yos cost 10 SAR. One has *at most 120 SAR* and needs *at least 8 prizes*.',
    'Lots of shopping lists work, and lots do not. Shade the zone of good lists, find its corners exactly, and help One shop smart.'],
  goal: 'Graph a system of inequalities, test points, and find a corner exactly with algebra.',
  bigIdea: 'The solution of a system of inequalities is the overlap of the shadings; a corner is where two boundary lines cross, found exactly by solving the system.',
  levels: [
    { name: 'Solid or dashed?', learn: ['*≤* or *≥*: a *solid* line (the line counts). *<* or *>*: a *dashed* line (it does not).', 'Test a point like (0, 0). True: shade its side. False: shade the other side.'],
      tasks: [
        { k: 'sort', q: 'Solid line or dashed line?', bins: ['━ Solid', '┅ Dashed'],
          cards: [{ t: 'y ≤ x + 3', b: 0 }, { t: 'y > −2x + 6', b: 1 }, { t: 'x + y ≥ 8', b: 0 }, { t: '2x + y < 12', b: 1 }, { t: 'y < 4', b: 1, why: '< has no "or equal": dashed.' }, { t: 'x ≥ 0', b: 0, why: '≥ means "or equal": the line counts, so solid.' }],
          why: 'A line under the symbol (≤, ≥) means the line counts: solid.' },
        { k: 'solve', q: 'Which side do you shade for *y > −2x + 6*? Test (0, 0).', start: 'y > −2x + 6',
          moves: [
            { q: 'Put in the test point.', opts: ['Replace only x with 0', 'Replace x and y with 0'], ans: 1, res: ['0 > −2(0) + 6', '0 > −2x + 6'], rans: 0,
              hint: 'The point (0, 0) has x = 0 AND y = 0.', no: { 0: 'Put in y = 0 too.', r1: 'Replace the x as well.' } },
            { q: 'Work out the right side.', opts: ['−2 × 0 = 0, then add 6', '−2 + 6'], ans: 0, res: ['0 > 6', '0 > 4', '0 > −12'], rans: 0,
              hint: 'Anything times 0 is 0.', no: { 1: '−2(0) means −2 times 0.', r1: '−2 × 0 = 0, so it is 0 + 6.', r2: '−2 × 0 = 0, not −12.' } },
            { q: 'Is it true?', opts: ['0 > 6 is false', '0 > 6 is true'], ans: 0, res: ['Shade the side WITHOUT (0, 0)', 'Shade the side WITH (0, 0)'], rans: 0,
              hint: 'Is 0 bigger than 6?', no: { 1: '0 is less than 6, so 0 > 6 is false.', r1: 'False means shade the other side.' }, why: 'False, so (0, 0) is not a solution. Shade above the dashed line, away from (0, 0).' }
          ] },
        { k: 'plane', q: 'Graph *y ≤ x + 3*: plot two points on the boundary, choose solid or dashed, then shade.', range: [-5, 5], m: 1, b: 3, op: '<=',
          hint: 'Start at (0, 3), then up 1 and right 1.', why: 'Solid (≤), through (0, 3) and (1, 4). (0, 0) gives 0 ≤ 3, true, so shade below.' },
        { k: 'choice', q: 'Is *(2, 1)* a solution of the system *y ≤ x + 3* and *y > −2x + 6*?', opts: ['Yes: 1 ≤ 5 is true', 'No: 1 > 2 is false', 'Yes: it is in the first quadrant'], ans: 1,
          no: ['It must pass BOTH. Test the second one too.', null, 'Quadrants do not decide it. Test both inequalities.'], why: '1 ≤ 2 + 3 is true, but 1 > −4 + 6 = 2 is false. It fails one, so it is not a solution.' }
      ] },
    { name: 'In the overlap', learn: ['A solution of the system makes *both* inequalities true: it is in the *overlap*.', 'A *corner* is where two boundary lines cross. Solve the system of equations to find it exactly.'],
      tasks: [
        { k: 'pick', q: 'Tap every point that is a solution of *y ≤ x + 3* and *y > −2x + 6*.', where: 'plane', range: [-1, 7], cond: 'y ≤ x + 3, y > −2x + 6', region: 'end',
          lines: [{ m: 1, b: 3, solid: true }, { m: -2, b: 6, solid: false }],
          cand: [[2, 3], [3, 1], [0, 2], [1, 5], [4, 7], [1, 4], [5, 2], [0, 0]],
          why: '(2, 3), (3, 1), (4, 7) and (5, 2) pass both. (4, 7) is on the solid line, so it counts. (1, 4) is on the dashed line: 4 > 4 is false.' },
        { k: 'solve', q: 'Find the corner of *y ≤ 2x + 1* and *y > −x + 7* exactly.', start: 'y = 2x + 1 and y = −x + 7',
          moves: [
            { q: 'Both are "y = …". What first?', opts: ['Add the equations', 'Set them equal'], ans: 1, res: ['2x + 1 = −x + 7', '2x + 1 = x + 7', 'x + 8 = 2y'], rans: 0,
              hint: 'At the corner both lines have the same y.', no: { 0: 'Both say what y is: set them equal.', r1: 'Keep the minus: −x + 7.', r2: 'Set them equal: 2x + 1 = −x + 7.' } },
            { q: 'Solve for x.', opts: ['Add x, subtract 1, divide by 3', 'Subtract x, subtract 1'], ans: 0, res: ['x = 2', 'x = 6', 'x = 8/3'], rans: 0,
              hint: '3x + 1 = 7, so 3x = 6.', no: { 1: 'Undo −x by adding x.', r1: '3x = 6: divide by 3.', r2: '7 − 1 = 6, not 8.' } },
            { q: 'Find y.', opts: ['Put 2 in y = 2x + 1', 'Put 2 in 3x = 6'], ans: 0, res: ['y = 5: corner (2, 5)', 'y = 4: corner (2, 4)'], rans: 0,
              hint: '2(2) + 1.', no: { 1: 'That has no y.', r1: '2(2) + 1 = 5.' } },
            { q: 'Is the corner a solution? Test y > −x + 7.', opts: ['Test 5 > −2 + 7', 'Corners always count'], ans: 0, res: ['5 > 5 is false: not a solution', '5 > 5 is true: a solution'], rans: 0,
              hint: '5 > 5? Is 5 bigger than itself?', no: { 1: 'A corner on a dashed line does not count.', r1: '5 is not bigger than 5.' },
              why: 'The corner is on the dashed line, so it is left out: draw an open circle at (2, 5).' }
          ] },
        { k: 'choice', q: 'The corner of *y ≥ x − 2* and *y ≤ −x + 6* is *(4, 2)*. Is it a solution?', opts: ['No: corners never count', 'Yes: both lines are solid, so 2 ≥ 2 and 2 ≤ 2', 'No: it is on a line'], ans: 1,
          no: ['A corner counts when both lines are solid.', null, 'Points on a solid line count.'], why: '2 ≥ 4 − 2 and 2 ≤ −4 + 6 are both true. Both lines are solid, so the corner counts.' },
        { k: 'pair', q: 'Find the corner of *x + y ≤ 9* and *y ≥ 2x* exactly.', ans: [3, 6], hint: 'Use x + y = 9 and y = 2x. Swap y = 2x in: x + 2x = 9.', why: '3x = 9, so x = 3 and y = 6. Corner (3, 6).' }
      ] },
    { name: 'The prize budget', learn: ['"At most" means *≤*. "At least" means *≥*.', 'Let x = plush toys, y = yo-yos. Money: *20x + 10y ≤ 120*. Prizes: *x + y ≥ 8*.'],
      tasks: [
        { k: 'choice', q: 'One can spend *at most* 120 SAR. Plush cost 20 SAR, yo-yos cost 10 SAR. Which sign goes in *20x + 10y __ 120*?', opts: ['≥', '≤', '<', '='], ans: 1,
          no: ['≥ means 120 or more. One cannot spend more than 120.', null, '< leaves out exactly 120 SAR. "At most" allows 120.', '= means exactly 120. One can spend less.'], why: '"At most 120" means 120 or less: ≤.' },
        { k: 'choice', q: 'Divide every term of *20x + 10y ≤ 120* by 10.', opts: ['2x + y ≤ 120', '20x + y ≤ 12', '2x + y ≤ 12', '2x + 10y ≤ 12'], ans: 2,
          no: ['Divide the 120 too.', 'Divide the 20x too.', null, 'Divide the 10y too.'], why: 'Every term ÷ 10: 2x + y ≤ 12. Simpler numbers, same line.' },
        { k: 'fill', q: 'Test three shopping lists (x plush, y yo-yos). Fill in the cost and the number of prizes.', head: ['(x, y)', 'Cost 20x + 10y', 'Prizes x + y'],
          rows: [['(2, 6)', { a: 100 }, { a: 8 }], ['(5, 2)', { a: 120 }, { a: 7 }], ['(3, 7)', { a: 130 }, { a: 10 }]],
          hint: 'Cost: 20 times x, plus 10 times y. Prizes: x + y.', why: '(2, 6) works: 100 ≤ 120 and 8 ≥ 8. (5, 2) has only 7 prizes. (3, 7) costs too much.' },
        { k: 'solve', q: 'Find the corner where *2x + y = 12* meets *x + y = 8*.', start: '2x + y = 12 and x + y = 8',
          moves: [
            { q: 'Both have +y. What first?', opts: ['Add the equations', 'Subtract the second from the first'], ans: 1, res: ['x = 4', '3x = 20', 'x = 20'], rans: 0,
              hint: 'Same terms: subtract. 2x − x = x and 12 − 8 = 4.', no: { 0: 'Adding gives 2y. Subtract.', r1: 'That is adding.', r2: '12 − 8, not 12 + 8.' } },
            { q: 'Find y.', opts: ['Put 4 in x + y = 8', 'Put 4 in x = 4'], ans: 0, res: ['y = 4', 'y = 12', 'y = 2'], rans: 0,
              hint: '4 + y = 8.', no: { 1: 'That has no y.', r1: 'Take away: 8 − 4.', r2: '4 + y = 8, so y = 4.' } },
            { q: 'Check in the other equation.', opts: ['Check in 2x + y = 12', 'No need'], ans: 0, res: ['8 + 4 = 12 ✓: corner (4, 4)', '8 + 4 = 10 ✗'], rans: 0,
              hint: 'A corner is on BOTH lines.', no: { 1: 'Always check in both.', r1: '2(4) + 4 = 12.' }, why: 'One buys 4 plush and 4 yo-yos: exactly 8 prizes for exactly 120 SAR.' }
          ] }
      ] },
    { name: 'Corners and sense', learn: ['Some corners are on an axis: put *x = 0* (or y = 0).', 'A point can be in the region but *not viable*: you cannot buy half a yo-yo.'],
      tasks: [
        { k: 'pair', q: 'Where does the prize line *x + y = 8* meet the y-axis?', ans: [0, 8], hint: 'On the y-axis, x = 0.', why: '0 + y = 8, so y = 8. The corner (0, 8) means 0 plush and 8 yo-yos.' },
        { k: 'solve', q: 'New rule: at least 2 plush, *x ≥ 2*. Find the corner of *x = 2* and *2x + y = 12*.', start: 'x = 2 and 2x + y = 12',
          moves: [
            { q: 'x is already known. What first?', opts: ['Put 2 in place of x', 'Add the equations'], ans: 0, res: ['2(2) + y = 12', '2 + y = 12', '22 + y = 12'], rans: 0,
              hint: 'Substitute: 2x becomes 2 × 2.', no: { 1: 'x = 2 tells you x. Just swap it in.', r1: '2x is 2 times x: 2 × 2 = 4.', r2: '2x means 2 × 2, not 22.' } },
            { q: 'Solve for y.', opts: ['Subtract 4 from both sides', 'Add 4 to both sides'], ans: 0, res: ['y = 8', 'y = 16', 'y = 3'], rans: 0,
              hint: '4 + y = 12.', no: { 1: 'Undo + 4 by subtracting.', r1: '12 − 4, not 12 + 4.', r2: '12 − 4 = 8.' }, why: 'Corner (2, 8): 2 plush and 8 yo-yos cost 40 + 80 = 120 SAR.' }
          ] },
        { k: 'choice', q: '*(3, 5.5)* is inside the region. Is it a viable shopping list?', opts: ['Yes: it is in the region', 'No: it costs too much', 'No: you cannot buy half a yo-yo'], ans: 2,
          no: ['In the region is not enough in a real story.', 'Cost: 60 + 55 = 115 ≤ 120. It is in budget.', null], why: 'It passes both inequalities, but 5.5 yo-yos makes no sense. Viable means in the region AND sensible.' },
        { k: 'match', q: 'Match each inequality to its graph.', range: [-5, 5],
          pairs: [['y ≤ x + 1', { plane: { range: [-5, 5], m: 1, b: 1, op: '<=' } }], ['y > x + 1', { plane: { range: [-5, 5], m: 1, b: 1, op: '>' } }], ['y < −x + 2', { plane: { range: [-5, 5], m: -1, b: 2, op: '<' } }], ['y ≥ −x + 2', { plane: { range: [-5, 5], m: -1, b: 2, op: '>=' } }]],
          why: 'Solid or dashed first, then above (>, ≥) or below (<, ≤).' }
      ] },
    { name: 'Shop boss', boss: true, learn: ['Mixed questions, fewer hints. Solid or dashed, test points, corners by algebra, and does it make sense?'],
      tasks: [
        { k: 'solve', q: 'Find the corner of *3x + y ≤ 14* and *x − y ≥ −2* exactly.', start: '3x + y = 14 and x − y = −2',
          moves: [
            { q: 'First move?', opts: ['Add the equations', 'Subtract the equations'], ans: 0, res: ['4x = 12', '4x = 16', '2x = 16'], rans: 0, no: { 1: '+y and −y are opposites: add.', r1: '14 + (−2) = 12.' } },
            { q: 'Next?', opts: ['Divide both sides by 4', 'Subtract 4'], ans: 0, res: ['x = 3', 'x = 8'], rans: 0 },
            { q: 'Find y.', opts: ['Put 3 in 3x + y = 14', 'Put 3 in 4x = 12'], ans: 0, res: ['y = 5', 'y = 11', 'y = −5'], rans: 0, no: { r1: '3x is 9, not 3.' } },
            { q: 'Is the corner a solution?', opts: ['Both lines are solid: test it', 'Corners never count'], ans: 0, res: ['14 ≤ 14 and −2 ≥ −2: yes', 'No'], rans: 0,
              why: 'Both boundaries are solid, so the corner (3, 5) is a solution.' }
          ] },
        { k: 'pick', q: 'Tap every solution of *y ≥ x − 2* and *y < −x + 4*.', where: 'plane', range: [-3, 6], cond: 'y ≥ x − 2, y < −x + 4', region: 'end',
          lines: [{ m: 1, b: -2, solid: true }, { m: -1, b: 4, solid: false }],
          cand: [[0, 0], [3, 1], [1, 2], [4, 1], [-1, 3], [2, 3], [0, -2]],
          why: '(0, 0), (1, 2), (−1, 3) and (0, −2) pass both. (3, 1) is the corner, on the dashed line: 1 < 1 is false.' },
        { k: 'number', q: 'The budget grows to *140 SAR*, so the money line is *2x + y = 14*. It meets *x + y = 8*. How many plush at this corner?', ans: 6, unit: 'plush',
          why: 'Subtract: x = 6. Then y = 2. The corner (6, 2): 120 + 20 = 140 SAR for 8 prizes.' },
        { k: 'choice', q: 'The corner of *y ≥ x − 2* and *y < −x + 4* is *(3, 1)*. Is it a solution?', opts: ['Yes: corners always count', 'No: on the dashed line, 1 < 1 is false', 'Yes: 1 ≥ 1 is true'], ans: 1,
          no: ['Only when both lines are solid.', null, 'It passes the first, but it must pass both.'], why: 'On a dashed line the line is left out. 1 < −3 + 4 = 1 is false.' }
      ] }
  ]
});
