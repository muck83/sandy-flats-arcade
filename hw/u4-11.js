/* Homework: Unit 4 Lesson 11, Choose Your Method. */
SFA_HW({
  id: 'g71', unit: 4, lesson: 11, topic: 'Choose your method', title: 'Method Race', who: 'priya',
  intro: ['Three new machines at Sandy Flats Arcade all solve systems. Marcus loves the *Graph Grabber*. Gus loves the *Swap Shooter* (substitution). Priya loves the *Cancel Cannon* (elimination).',
    'They all give the same answer, but one is always fastest. Look at each system first, pick the best machine, and beat the clock.'],
  goal: 'Look at a system, choose the fastest method, and solve it.',
  bigIdea: 'Graphing, substitution and elimination all give the same solution; look first and pick the one with the fewest steps.',
  levels: [
    { name: 'Look first', learn: ['A variable already alone (*y = …* or *x = …*): *substitution*.', 'Opposite or equal coefficients: *elimination*.', 'You only need an estimate, or want to *see* it: *graphing*.'],
      tasks: [
        { k: 'sort', q: 'Which machine is fastest? Sort each one.', bins: ['🔁 Substitution', '✖️ Elimination', '📈 Graphing'],
          cards: [{ t: 'y = 3x − 1 · 2x + y = 9', b: 0, why: 'y is already alone: swap it in.' }, { t: '4x + 3y = 18 · 2x − 3y = 0', b: 1, why: '3y and −3y are opposites: add.' }, { t: 'x = 2y · x + y = 9', b: 0 },
            { t: '3x + 2y = 16 · 5x − 2y = 16', b: 1 }, { t: 'Roughly when are two tanks equal?', b: 2, why: 'Only an estimate is needed: a graph is enough.' }, { t: 'Show where two price lines cross', b: 2 }],
          why: 'Alone: substitution. Opposite or equal: elimination. Estimate or picture: graphing.' },
        { k: 'choice', q: 'Look at *y = x + 1* and *2x + y = 10*. What do you notice first?', opts: ['The x terms are opposites', 'y is already alone', 'Both are in standard form'], ans: 1,
          no: ['x and 2x are not opposites.', null, 'y = x + 1 is not in standard form.'], why: 'y = x + 1 tells you exactly what y is. Swap it in: substitution.' },
        { k: 'solve', q: 'Solve *y = x + 1* and *2x + y = 10* by substitution.', start: 'y = x + 1 and 2x + y = 10',
          moves: [
            { q: 'y is alone. What first?', opts: ['Add the equations', 'Replace y with x + 1 in 2x + y = 10', 'Graph both lines'], ans: 1, res: ['2x + x = 10', '2(x + 1) = 10', '2x + (x + 1) = 10'], rans: 2,
              hint: 'Take out y and put in all of x + 1.', no: { 0: 'They are not lined up for adding. y is alone: swap it in.', 2: 'Graphing works, but swapping is faster here.', r0: 'Keep the + 1: y is all of x + 1.', r1: 'Replace only y. The 2x stays.' } },
            { q: 'Collect like terms.', opts: ['2x + x = 3x', '2x + x = 2x²'], ans: 0, res: ['3x + 1 = 10', '2x + 1 = 10', '3x = 10'], rans: 0,
              hint: '2x + x = 3x. Keep the + 1.', no: { 1: '2x + x means 2 x\'s and 1 more x: 3x.', r1: '2x + x is 3x.', r2: 'Keep the + 1.' } },
            { q: 'Solve for x.', opts: ['Subtract 1, then divide by 3', 'Add 1, then divide by 3'], ans: 0, res: ['x = 3', 'x = 11/3', 'x = 27'], rans: 0,
              hint: '3x = 9, so x = 3.', no: { 1: 'Undo + 1 by subtracting 1.', r1: 'That is (10 + 1) ÷ 3.', r2: '3x = 9: divide by 3.' } },
            { q: 'Find y.', opts: ['Put 3 in y = x + 1', 'Put 3 in 3x + 1 = 10'], ans: 0, res: ['y = 4', 'y = 3', 'y = 7'], rans: 0,
              hint: 'y = 3 + 1.', no: { 1: 'That has no y.', r1: '3 is x. y = x + 1.', r2: 'y = 3 + 1.' }, why: 'Check: 2(3) + 4 = 10 ✓. The solution is (3, 4).' }
          ] },
        { k: 'choice', q: 'Which method is fastest for *5x + y = 9* and *2x − y = 5*?', opts: ['Substitution: replace x', 'Graphing: read the crossing', 'Elimination: +y and −y cancel'], ans: 2,
          no: ['No x is alone. Look at the y terms.', 'Graphing works, but reading it exactly is hard.', null], why: 'Add: 7x = 14, so x = 2 and y = −1. One move did most of the work.' }
      ] },
    { name: 'Swap or cancel?', learn: ['Elimination needs both equations lined up: *ax + by = c*.', 'Substitution needs a letter alone, or with a 1 in front of it.'],
      tasks: [
        { k: 'solve', q: 'Look first, then solve *2x + 3y = 12* and *4x − 3y = 6*.', start: '2x + 3y = 12 and 4x − 3y = 6',
          moves: [
            { q: 'I notice 3y and −3y. What first?', opts: ['Replace y', 'Subtract the equations', 'Add the equations'], ans: 2, res: ['6x = 18', '6x = 6', '6x + 6y = 18'], rans: 0,
              hint: 'Opposites: add, and y cancels.', no: { 0: 'No y is alone yet. Opposites: add.', 1: 'Subtracting gives 6y: y does not cancel.', r1: 'Add the numbers: 12 + 6 = 18.', r2: '3y + (−3y) = 0.' } },
            { q: 'Get x alone.', opts: ['Divide both sides by 6', 'Subtract 6'], ans: 0, res: ['x = 3', 'x = 12', 'x = 108'], rans: 0, hint: '18 ÷ 6.',
              no: { 1: 'Divide.', r1: '18 − 6. Divide.', r2: '18 × 6. Divide.' } },
            { q: 'Find y.', opts: ['Put 3 in 2x + 3y = 12', 'Put 3 in 6x = 18'], ans: 0, res: ['3y = 6, so y = 2', '3y = 18, so y = 6', '3y = 9, so y = 3'], rans: 0,
              hint: '6 + 3y = 12, so 3y = 6.', no: { 1: 'That has no y.', r1: '2x = 6. Take it away: 12 − 6.', r2: '2x is 2 × 3 = 6, not 3.' }, why: 'Check: 4(3) − 3(2) = 12 − 6 = 6 ✓. The solution is (3, 2).' }
          ] },
        { k: 'solve', q: 'Look first, then solve *x = 3y* and *x + y = 12*.', start: 'x = 3y and x + y = 12',
          moves: [
            { q: 'x is alone. What first?', opts: ['Replace x with 3y in x + y = 12', 'Add the equations', 'Replace y with 3y'], ans: 0, res: ['3 + y = 12', '3y + y = 12', '3y = 12'], rans: 1,
              hint: 'Take out x and put in 3y.', no: { 1: 'x = 3y is not lined up for adding.', 2: 'x is the one that equals 3y.', r0: 'x = 3y means 3 times y, not 3.', r2: 'Keep the + y.' } },
            { q: 'Collect like terms.', opts: ['3y + y = 4y', '3y + y = 3y²'], ans: 0, res: ['4y = 12', '3y = 12'], rans: 0,
              hint: '3 y\'s and 1 more y.', no: { 1: '3y + y = 4y.', r1: '3y + y = 4y.' } },
            { q: 'Get y alone.', opts: ['Divide both sides by 4', 'Subtract 4'], ans: 0, res: ['y = 3', 'y = 8', 'y = 48'], rans: 0, hint: '12 ÷ 4.',
              no: { 1: 'Divide.', r1: '12 − 4. Divide.', r2: '12 × 4. Divide.' } },
            { q: 'Find x.', opts: ['Put 3 in x = 3y', 'Put 3 in 4y = 12'], ans: 0, res: ['x = 9', 'x = 6', 'x = 1'], rans: 0,
              hint: 'x = 3 × 3.', no: { 1: 'That has no x.', r1: '3y is 3 × 3, not 3 + 3.', r2: 'Multiply: x = 3 × 3.' }, why: 'Check: 9 + 3 = 12 ✓. The solution is (9, 3).' }
          ] },
        { k: 'choice', q: 'Marcus wants elimination for *y = 2x − 3* and *y = −x + 6*. Why is substitution faster?', opts: ['Elimination never works here', 'Both are y = …: set 2x − 3 = −x + 6', 'Substitution always wins', 'The numbers are too big'], ans: 1,
          no: ['It works, but you must rewrite both equations first.', null, 'No method always wins. Look first.', 'The numbers are small.'], why: 'Both say what y is, so they are equal: 2x − 3 = −x + 6. Then 3x = 9 and x = 3.' },
        { k: 'pair', q: 'Solve *y = 2x − 3* and *y = −x + 6*.', ans: [3, 3], hint: 'Set them equal: 2x − 3 = −x + 6. Add x and add 3.', why: '3x = 9, so x = 3. Then y = 2(3) − 3 = 3. Check: −3 + 6 = 3 ✓.' }
      ] },
    { name: 'When a graph is enough', learn: ['A graph *shows* the answer, but if the crossing is between grid lines it is only an *estimate*.', 'Need an exact answer? Use algebra.'],
      tasks: [
        { k: 'pair', q: 'Marcus\'s Graph Grabber shows *y = x + 1* and *y = −2x + 10*. Where do they cross?', fig: { range: [-1, 6], yrange: [-1, 11], lines: [{ m: 1, b: 1, lab: 'y = x + 1' }, { m: -2, b: 10 }], x: 'x', y: 'y' },
          ans: [3, 4], hint: 'Find where the lines meet, then read across and up.', why: '(3, 4). Check: 3 + 1 = 4 and −6 + 10 = 4 ✓. This crossing is on grid lines, so the graph is exact.' },
        { k: 'choice', q: 'Two coolers at the beach party: A = *50 − 6t* litres, B = *10 + 9t* litres after t hours. From the graph, about when are they equal (to the nearest half hour)?',
          fig: { range: [0, 6], yrange: [0, 60], lines: [{ m: -6, b: 50, lab: 'A' }, { m: 9, b: 10, lab: 'B' }], x: 't', y: 'L' },
          opts: ['About 1 hour', 'About 2.5 hours', 'About 4 hours', 'About 30 hours'], ans: 1,
          no: ['At t = 1, A has 44 L and B has 19 L: not equal yet.', null, 'At t = 4, B is already above A.', 'Read the time axis, not the litres.'], why: 'The lines cross between 2.5 and 3 hours, closer to 2.5. Good enough for "the nearest half hour".' },
        { k: 'choice', q: 'Now Zero needs the time *to the minute*. What should he do?', opts: ['Look closer at the graph', 'Guess 3 hours', 'Use algebra: 50 − 6t = 10 + 9t'], ans: 2,
          no: ['The crossing is between grid lines: a graph only estimates.', 'A guess is not exact.', null], why: 'Algebra gives the exact answer. A graph gives an estimate.' },
        { k: 'solve', q: 'Solve *50 − 6t = 10 + 9t* exactly.', start: '50 − 6t = 10 + 9t',
          moves: [
            { q: 'Get the t terms together.', opts: ['Add 6t to both sides', 'Subtract 6t from both sides'], ans: 0, res: ['50 = 10 + 3t', '50 = 10 + 15t', '44t = 10 + 9t'], rans: 1,
              hint: '−6t + 6t = 0, and 9t + 6t = 15t.', no: { 1: 'That gives −12t on the left. Add 6t to undo −6t.', r0: '9t + 6t = 15t, not 3t.', r2: '50 and −6t are not like terms.' } },
            { q: 'Next move?', opts: ['Subtract 10 from both sides', 'Divide by 15'], ans: 0, res: ['60 = 15t', '40 = 15t'], rans: 1,
              hint: 'Undo + 10 first.', no: { 1: 'Undo the + 10 first, then divide.', r0: '50 − 10 = 40.' } },
            { q: 'Last move?', opts: ['Divide both sides by 15', 'Subtract 15'], ans: 0, res: ['t = 2⅔ hours', 't = 25 hours', 't = 0.375 hours'], rans: 0,
              hint: '40 ÷ 15 = 2⅔.', no: { 1: 'Divide to undo times 15.', r1: '40 − 15. Divide.', r2: 'That is 15 ÷ 40. Divide 40 by 15.' },
              why: '⅔ of an hour is 40 minutes: 2 hours 40 minutes. The graph estimate (2.5 hours) was close.' }
          ] }
      ] },
    { name: 'Same answer, any road', learn: ['Every method gives the *same* point.', 'Whatever you choose, check in *both* equations.'],
      tasks: [
        { k: 'solve', q: 'Solve *3x − y = 5* and *2x + 3y = 18* by substitution.', start: '3x − y = 5 and 2x + 3y = 18',
          moves: [
            { q: 'y has a 1 in front. Get it alone.', opts: ['Get y alone in 3x − y = 5', 'Add the equations'], ans: 0, res: ['y = 5 − 3x', 'y = 3x − 5', 'y = −3x − 5'], rans: 1,
              hint: '−y = 5 − 3x. Now change every sign: y = 3x − 5.', no: { 1: 'Nothing cancels if you add.', r0: '−y = 5 − 3x. Multiply every term by −1: y = −5 + 3x.', r2: 'Change the sign of every term: −3x becomes +3x.' } },
            { q: 'Swap it in.', opts: ['Replace y in 2x + 3y = 18', 'Replace x in 2x + 3y = 18'], ans: 0, res: ['2x + 3x − 5 = 18', '2x + 3(3x − 5) = 18'], rans: 1,
              hint: '3y means 3 times all of y. Use brackets.', no: { 1: 'You know what y is, not x.', r0: 'Use brackets: 3 times all of (3x − 5).' } },
            { q: 'Distribute the 3.', opts: ['3 × 3x and 3 × (−5)', '3 × 3x only'], ans: 0, res: ['2x + 9x − 15 = 18', '2x + 9x − 5 = 18'], rans: 0,
              hint: 'Multiply both terms in the bracket.', no: { 1: 'Multiply the −5 too.', r1: 'Multiply the −5 too: 3 × (−5) = −15.' } },
            { q: 'Collect, add 15, divide by 11.', opts: ['11x − 15 = 18', '11x + 15 = 18'], ans: 0, res: ['11x = 33, so x = 3', '11x = 3, so x = 3/11'], rans: 0,
              hint: 'Undo − 15 by adding 15: 18 + 15 = 33.', no: { 1: 'It is − 15.', r1: 'Add 15 to undo − 15: 18 + 15.' } },
            { q: 'Find y.', opts: ['Put 3 in y = 3x − 5', 'Put 3 in 11x = 33'], ans: 0, res: ['y = 4', 'y = −2', 'y = 14'], rans: 0,
              hint: 'y = 9 − 5.', no: { 1: 'That has no y.', r1: '3(3) = 9, and 9 − 5 = 4.', r2: '9 − 5, not 9 + 5.' }, why: 'Check: 2(3) + 3(4) = 6 + 12 = 18 ✓. The solution is (3, 4).' }
          ] },
        { k: 'choice', q: 'Marcus graphed the same system and got (3, 4). Priya used elimination. What will Priya get?', opts: ['A different point', '(3, 4): every method gives the same point', 'She cannot use elimination here'], ans: 1,
          no: ['The solution is where the lines cross. There is only one crossing.', null, 'Elimination works on any system: multiply, then cancel.'], why: 'A system has one solution here. Any correct method finds it.' },
        { k: 'number', q: 'Solve *2x + 3y = 12* and *3x + 4y = 17*. What is *y*?', ans: 2, hint: 'Elimination: equation 1 × 3 and equation 2 × 2 make 6x in both.', why: '6x + 9y = 36 and 6x + 8y = 34. Subtract: y = 2. Then 2x + 6 = 12, so x = 3.' },
        { k: 'match', q: 'Match each system to its best method.',
          pairs: [['y = 4x · x + y = 10', 'Substitution'], ['3x + 5y = 2 · 3x − 5y = 8', 'Elimination right away'], ['2x + 3y = 12 · 5x − y = 13', 'Elimination after multiplying'], ['Rough break-even of two plans', 'Graphing']],
          why: 'Alone: substitution. Matching terms: eliminate. No match: multiply first. Rough answer: graph.' }
      ] },
    { name: 'Grand prix', boss: true, learn: ['Mixed questions, fewer hints. Look first, pick the fastest road, check in both.'],
      tasks: [
        { k: 'sort', q: 'Pick the fastest method for each.', bins: ['🔁 Substitution', '✖️ Elimination', '📈 Graphing'],
          cards: [{ t: 'x = 3y − 1 · 2x + 5y = 20', b: 0 }, { t: '2x + 3y = 13 · 3x + 4y = 18', b: 1 }, { t: '7x + 2y = 3 · 7x − y = 9', b: 1 },
            { t: 'y = 5x · 3x + y = 16', b: 0 }, { t: 'About where do two runners meet?', b: 2 }, { t: 'A picture for a poster', b: 2 }],
          why: 'Alone: substitution. Lined up: elimination. Estimate or picture: graphing.' },
        { k: 'solve', q: 'Solve *x = 3y − 1* and *2x + 5y = 20*.', start: 'x = 3y − 1 and 2x + 5y = 20',
          moves: [
            { q: 'First move?', opts: ['Replace x in 2x + 5y = 20', 'Add the equations'], ans: 0, res: ['2(3y − 1) + 5y = 20', '2 · 3y − 1 + 5y = 20'], rans: 0, no: { r1: 'Use brackets: 2 times all of (3y − 1).' } },
            { q: 'Distribute and collect.', opts: ['6y − 2 + 5y = 11y − 2', '6y − 1 + 5y = 11y − 1'], ans: 0, res: ['11y − 2 = 20', '11y − 1 = 20'], rans: 0, no: { 1: '2 × (−1) = −2.' } },
            { q: 'Solve for y.', opts: ['Add 2, then divide by 11', 'Subtract 2, then divide by 11'], ans: 0, res: ['y = 2', 'y = 18/11'], rans: 0, no: { 1: 'Undo − 2 by adding 2.' } },
            { q: 'Find x.', opts: ['Put 2 in x = 3y − 1', 'Put 2 in 11y = 22'], ans: 0, res: ['x = 5', 'x = 7', 'x = 4'], rans: 0, why: 'Check: 2(5) + 5(2) = 20 ✓. The solution is (5, 2).' }
          ] },
        { k: 'pair', q: 'Solve *5x + 2y = 12* and *3x − 2y = 4*.', ans: [2, 1], why: 'Add: 8x = 16, so x = 2. Then 10 + 2y = 12, so y = 1.' },
        { k: 'choice', q: 'Which system is fastest with substitution?', opts: ['2x + 3y = 13 and 3x + 4y = 18', '4x + y = 9 and 4x − y = 7', 'y = 5x and 3x + y = 16', '3x + 2y = 5 and 6x + 4y = 10'], ans: 2,
          no: ['Nothing is alone here: elimination.', 'Opposites: elimination is faster.', null, 'Nothing is alone here.'], why: 'y = 5x is already alone. Swap it in: 3x + 5x = 16.' },
        { k: 'number', q: 'Now solve *y = 5x* and *3x + y = 16*. What is *y*?', ans: 10, hint: '3x + 5x = 16.', why: '8x = 16, so x = 2 and y = 5(2) = 10. Check: 6 + 10 = 16 ✓.' }
      ] }
  ]
});
